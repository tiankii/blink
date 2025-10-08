import { createHash } from "crypto"

import { TranslationServiceClient } from "@google-cloud/translate"

// TODO: Make this configurable via environment variable
const GCP_TRANSLATE_CREDENTIALS_JSON = "{}"

const DEFAULT_SOURCE_LANG = "en"
const DEFAULT_CACHE_TTL_MS = 12 * 60 * 60 * 1000

const cache = new Map<string, TranslationCacheEntry>()

const creds = GCP_TRANSLATE_CREDENTIALS_JSON
  ? JSON.parse(GCP_TRANSLATE_CREDENTIALS_JSON)
  : undefined

const client = creds
  ? new TranslationServiceClient({
      projectId: creds.project_id,
      credentials: {
        client_email: creds.client_email,
        private_key: (creds.private_key || "").replace(/\\n/g, "\n"),
      },
    })
  : new TranslationServiceClient()

const projectIdP: Promise<string> = creds?.project_id
  ? Promise.resolve(creds.project_id)
  : client.getProjectId()

const buildTranslationCacheKey = ({
  sourceLang,
  targetLang,
  mimeType,
  text,
}: {
  sourceLang: string
  targetLang: string
  mimeType: TranslationMimeType
  text: string
}): string => {
  const keyComponents = [sourceLang, targetLang, mimeType, text].join("|")
  return createHash("sha256").update(keyComponents).digest("hex")
}

const isCacheEntryValid = (entry: TranslationCacheEntry | undefined): boolean => {
  return entry !== undefined && entry.expiresAt > Date.now()
}

const getCachedTranslation = (cacheKey: string): string | null => {
  const entry = cache.get(cacheKey)
  if (isCacheEntryValid(entry)) {
    return entry!.value
  }
  if (entry) {
    cache.delete(cacheKey)
  }
  return null
}

const setCachedTranslation = (
  cacheKey: string,
  translatedText: string,
  ttlMs: number,
): void => {
  const entry: TranslationCacheEntry = {
    value: translatedText,
    expiresAt: Date.now() + ttlMs,
  }
  cache.set(cacheKey, entry)
}

export const translateText = async ({
  text,
  targetLang,
  sourceLang = DEFAULT_SOURCE_LANG,
  mimeType = "text/plain",
  cacheTtlMs = DEFAULT_CACHE_TTL_MS,
}: TranslationOptions): Promise<string> => {
  if (!text || targetLang === sourceLang) {
    return text
  }

  const projectId = await projectIdP
  const parentPath = `projects/${projectId}/locations/global`

  const cacheKey = buildTranslationCacheKey({
    sourceLang,
    targetLang,
    mimeType,
    text,
  })

  const cachedTranslation = getCachedTranslation(cacheKey)
  if (cachedTranslation) {
    return cachedTranslation
  }

  const [response] = await client.translateText({
    parent: parentPath,
    contents: [text],
    mimeType,
    sourceLanguageCode: sourceLang,
    targetLanguageCode: targetLang,
  })

  const translatedText = response.translations?.[0]?.translatedText ?? text

  setCachedTranslation(cacheKey, translatedText, cacheTtlMs)

  return translatedText
}
