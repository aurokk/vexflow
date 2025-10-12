#!/usr/bin/env node
// Script to convert QUnit tests to Vitest format
// Usage: node tools/convert_to_vitest.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const testsDir = path.join(rootDir, 'tests');
const vitestDir = path.join(rootDir, 'tests-vitest');

// Files to skip (not test files)
const skipFiles = [
  'index.ts',
  'vexflow_test_helpers.ts',
  'mocks.ts',
  'flow.html',
  'flow.css',
  'flow-headless-browser.html',
  'flow-old-browser.html',
];

/**
 * Convert QUnit test file content to Vitest format
 */
function convertTestContent(content, filename) {
  let converted = content;

  // Replace import of vexflow_test_helpers with vitest_test_helpers
  converted = converted.replace(
    /from ['"]\.\/vexflow_test_helpers['"]/g,
    "from './vitest_test_helpers'"
  );

  // Add vitest imports at the top if not present
  if (!converted.includes('import { describe, it, test, expect }')) {
    // Find the first import statement
    const firstImportIndex = converted.indexOf('import');
    if (firstImportIndex !== -1) {
      converted =
        converted.slice(0, firstImportIndex) +
        "import { describe, it, test, expect } from 'vitest';\n" +
        converted.slice(firstImportIndex);
    }
  }

  // Replace QUnit.module with describe
  converted = converted.replace(
    /QUnit\.module\(['"]([^'"]+)['"]\);?/g,
    "describe('$1', () => {"
  );

  // Replace QUnit.test with test/it
  converted = converted.replace(
    /QUnit\.test\(['"]([^'"]+)['"],\s*(\w+)\);?/g,
    "test('$1', () => {\n  const assert = createAssert();\n  $2(assert);\n});"
  );

  // Find the test object definition and convert it
  const testObjectMatch = converted.match(/const\s+(\w+Tests)\s*=\s*{[\s\S]*?Start\(\)/);
  if (testObjectMatch) {
    const testObjectName = testObjectMatch[1];

    // Extract the Start() function content
    const startFunctionMatch = converted.match(/Start\(\):\s*void\s*{([\s\S]*?)}\s*,?\s*};/);
    if (startFunctionMatch) {
      const startContent = startFunctionMatch[1];

      // Remove the object wrapper and just keep the function calls
      // Replace VexFlowTests.runTests calls
      let testsSection = startContent;
      testsSection = testsSection.replace(/const run = VexFlowTests\.runTests;?\s*/g, '');

      // Convert run(...) calls to test(...) calls
      testsSection = testsSection.replace(
        /run\(['"]([^'"]+)['"],\s*(\w+)\);?/g,
        "test('$1', () => {\n  const assert = createAssert();\n  runWithBackends('$1', $2);\n});"
      );

      // Convert VexFlowTests.runTests(...) calls
      testsSection = testsSection.replace(
        /VexFlowTests\.runTests\(['"]([^'"]+)['"],\s*(\w+)(?:,\s*([^)]+))?\);?/g,
        (match, name, func, params) => {
          if (params) {
            return `test('${name}', () => {\n  const assert = createAssert();\n  runWithBackends('${name}', ${func}, ${params});\n});`;
          }
          return `test('${name}', () => {\n  const assert = createAssert();\n  runWithBackends('${name}', ${func});\n});`;
        }
      );

      // Convert VexFlowTests.runTextTests(...) calls
      testsSection = testsSection.replace(
        /VexFlowTests\.runTextTests\(['"]([^'"]+)['"],\s*(\w+)(?:,\s*([^)]+))?\);?/g,
        (match, name, func, params) => {
          if (params) {
            return `test('${name}', () => {\n  const assert = createAssert();\n  runWithBackends('${name}', ${func}, ${params}, true, false);\n});`;
          }
          return `test('${name}', () => {\n  const assert = createAssert();\n  runWithBackends('${name}', ${func}, undefined, true, false);\n});`;
        }
      );

      // Replace the entire test object with describe block
      const moduleName = startContent.match(/QUnit\.module\(['"]([^'"]+)['"]\)/)?.[1] || testObjectName.replace('Tests', '');

      converted = converted.replace(
        /const\s+\w+Tests\s*=\s*{[\s\S]*?Start\(\)[\s\S]*?}\s*,?\s*};/,
        `${testsSection}`
      );

      // Remove VexFlowTests.register and export at the end
      converted = converted.replace(/VexFlowTests\.register\([^)]+\);?\s*/g, '');
      converted = converted.replace(/export\s*{\s*\w+Tests\s*};?\s*$/g, '');
    }
  }

  // Import createAssert and runWithBackends
  if (converted.includes('createAssert()') || converted.includes('runWithBackends')) {
    converted = converted.replace(
      /from ['"]\.\/vitest_test_helpers['"]/,
      "from './vitest_test_helpers';\nimport { createAssert, runWithBackends } from './vitest_test_helpers'"
    );
  }

  // Replace VexFlowTests.makeFactory
  converted = converted.replace(/VexFlowTests\.makeFactory/g, 'makeFactory');
  if (converted.includes('makeFactory(')) {
    converted = converted.replace(
      /from ['"]\.\/vitest_test_helpers['"]/,
      "from './vitest_test_helpers';\nimport { makeFactory } from './vitest_test_helpers'"
    );
  }

  // Replace VexFlowTests.plotLegendForNoteWidth
  converted = converted.replace(/VexFlowTests\.plotLegendForNoteWidth/g, 'plotLegendForNoteWidth');
  if (converted.includes('plotLegendForNoteWidth(')) {
    converted = converted.replace(
      /from ['"]\.\/vitest_test_helpers['"]/,
      "from './vitest_test_helpers';\nimport { plotLegendForNoteWidth } from './vitest_test_helpers'"
    );
  }

  return converted;
}

/**
 * Convert a single test file
 */
function convertFile(filename) {
  const sourcePath = path.join(testsDir, filename);
  const targetPath = path.join(vitestDir, filename.replace('_tests.ts', '.test.ts'));

  console.log(`Converting ${filename}...`);

  try {
    const content = fs.readFileSync(sourcePath, 'utf8');
    const converted = convertTestContent(content, filename);
    fs.writeFileSync(targetPath, converted, 'utf8');
    console.log(`  ✓ Converted to ${path.basename(targetPath)}`);
    return true;
  } catch (error) {
    console.error(`  ✗ Error converting ${filename}:`, error.message);
    return false;
  }
}

/**
 * Main conversion process
 */
function main() {
  console.log('Starting QUnit to Vitest conversion...\n');

  // Ensure tests-vitest directory exists
  if (!fs.existsSync(vitestDir)) {
    fs.mkdirSync(vitestDir, { recursive: true });
  }

  // Get all test files
  const files = fs.readdirSync(testsDir)
    .filter(file => file.endsWith('_tests.ts'))
    .filter(file => !skipFiles.includes(file));

  console.log(`Found ${files.length} test files to convert\n`);

  let successCount = 0;
  let failCount = 0;

  files.forEach(file => {
    if (convertFile(file)) {
      successCount++;
    } else {
      failCount++;
    }
  });

  console.log(`\nConversion complete!`);
  console.log(`  ✓ Success: ${successCount}`);
  console.log(`  ✗ Failed: ${failCount}`);
  console.log(`\nConverted files are in: ${vitestDir}`);
}

main();
