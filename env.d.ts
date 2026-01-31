interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
  readonly DEV?: boolean;
  readonly BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
