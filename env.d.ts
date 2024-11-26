/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly CF_ACCOUNT_ID: string
  readonly CF_API_TOKEN: string
  readonly CF_WORKER_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 