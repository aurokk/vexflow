/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VEXFLOW_VISUAL_REGRESSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
