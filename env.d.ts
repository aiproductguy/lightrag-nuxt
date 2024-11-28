/// <reference types="@nuxt/types" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly NUXT_PUBLIC_CF_ACCOUNT_ID: string
  readonly NUXT_CF_API_TOKEN: string
  readonly NUXT_PUBLIC_CF_WORKER_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 