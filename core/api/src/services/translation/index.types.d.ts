type TranslationMimeType = "text/plain" | "text/html"

interface TranslationOptions {
  text: string
  targetLang: string
  sourceLang?: string
  mimeType?: TranslationMimeType
  cacheTtlMs?: number
}

interface TranslationCacheEntry {
  value: string
  expiresAt: number
}
