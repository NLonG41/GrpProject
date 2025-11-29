/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CORE_API: string
  readonly VITE_REALTIME_API: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

