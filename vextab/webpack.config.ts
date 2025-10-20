// const path = require("path");
// const webpack = require("webpack");
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import GitRevisionPlugin from "git-revision-webpack-plugin";
import path from "path";
import webpack from "webpack";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tag = process.env.TAG_NAME || "dev";
const hasTag = typeof tag !== "undefined" && tag !== "";
const gitRevisionPlugin = new GitRevisionPlugin();

const config: webpack.Configuration = {
  plugins: [
    new webpack.ProvidePlugin({
      $: "zepto-webpack",
    }),
    new HtmlWebpackPlugin({
      template: "./tests/tests.html",
      filename: "index.html",
      chunks: ["tests"],
    }),
    new HtmlWebpackPlugin({
      template: "./tests/playground.html",
      filename: "playground.html",
      chunks: ["playground"],
    }),
    new CopyPlugin({
      patterns: [
        {
          from: "static/*",
          to: "[name][ext]",
        },
      ],
    }),
    new webpack.DefinePlugin({
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      __VERSION: JSON.stringify(gitRevisionPlugin.version()),
      __COMMITHASH: JSON.stringify(gitRevisionPlugin.commithash()),
      __BRANCH: JSON.stringify(gitRevisionPlugin.branch()),
    }),
  ],
  devtool: tag === "prod" ? "hidden-source-map" : "eval-source-map",
  entry: {
    main: "./src/main.ts",
    div: "./src/div.ts",
    tests: "./tests/tests.ts",
    playground: "./tests/playground.ts",
  },
  output: {
    library: "vextab",
    libraryTarget: "umd",
    globalObject: "this",
    filename: hasTag ? `[name].${tag}.js` : "[name].[contenthash].js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              compilerOptions: {
                declaration: true,
                declarationMap: true,
              },
            },
          },
        ],
      },
      {
        test: /\.jsx?$/,
        exclude: (modulePath) => {
          // Exclude node_modules
          if (/node_modules/.test(modulePath)) return true;
          // Exclude local vexflow dist files
          if (/vexflow/.test(modulePath)) return true;
          return false;
        },
        use: [
          { loader: "babel-loader" },
          { loader: "eslint-loader", options: { fix: true } },
        ],
      },
      { test: /\.jison$/, use: [{ loader: "jison-loader" }] },
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx", ".jison"],
    fallback: {
      fs: false,
      path: false,
    },
  },
};

export default config;
