interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
  readonly DEV?: boolean;
  readonly BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Allow importing JSON modules as `any`
declare module '*.json' {
  const value: any;
  export default value;
}
