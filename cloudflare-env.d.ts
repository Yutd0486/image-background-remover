declare global {
  interface CloudflareEnv {
    GOOGLE_CLIENT_ID: string
    GOOGLE_CLIENT_SECRET: string
    REMOVEBG_API_KEY: string
    NEXT_PUBLIC_BASE_URL: string
    NEXT_PUBLIC_SITE_URL: string
    AUTH_SECRET: string
  }
}

export {}
