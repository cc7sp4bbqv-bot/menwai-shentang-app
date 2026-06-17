/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COZE_BOT_ID: string;
  readonly VITE_COZE_API_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
