import { MemoryStore, type Options as RateLimitOptionsInternal } from 'express-rate-limit'
import type { NextRequest } from 'next/server'

type RateLimitOptions = {
  req: NextRequest
  route: string
  limit?: number
  windowMs?: number
  identifierOverride?: string
}

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  limit: number
  retryAfter: number
  identifier: string
}

const DEFAULT_WINDOW_MS = 60 * 1000
const DEFAULT_LIMIT = 5

type StoreRecord = {
  store: MemoryStore
  windowMs: number
}

const storeMap = new Map<number, StoreRecord>()

function getStore(windowMs: number): MemoryStore {
  const existing = storeMap.get(windowMs)
  if (existing) {
    return existing.store
  }

  const store = new MemoryStore()
  store.init({ windowMs } as unknown as RateLimitOptionsInternal)
  storeMap.set(windowMs, { store, windowMs })
  return store
}

export async function enforceRateLimit({
  req,
  route,
  limit = DEFAULT_LIMIT,
  windowMs = DEFAULT_WINDOW_MS,
  identifierOverride,
}: RateLimitOptions): Promise<RateLimitResult> {
  const baseIdentifier = getClientIdentifier(req)
  const identifier = identifierOverride ?? baseIdentifier
  const store = getStore(windowMs)
  const key = `${route}:${identifier}`
  const clientInfo = await store.increment(key)

  const allowed = clientInfo.totalHits <= limit
  const remaining = Math.max(0, limit - clientInfo.totalHits)
  const retryAfter =
    clientInfo.resetTime instanceof Date
      ? Math.max(1, Math.ceil((clientInfo.resetTime.getTime() - Date.now()) / 1000))
      : Math.ceil(windowMs / 1000)

  return {
    allowed,
    remaining: allowed ? remaining : 0,
    limit,
    retryAfter,
    identifier,
  }
}

export function getClientIdentifier(req: NextRequest): string {
  const headerCandidates = [
    'cf-connecting-ip',
    'x-forwarded-for',
    'x-real-ip',
    'true-client-ip',
    'forwarded',
  ]

  for (const header of headerCandidates) {
    const headerValue = req.headers.get(header)
    if (headerValue) {
      const ip = headerValue.split(',')[0]?.trim()
      if (ip) {
        return `${ip}`
      }
    }
  }

  const reqIp = (req as unknown as { ip?: string }).ip
  if (reqIp) {
    return reqIp
  }

  const userAgent = req.headers.get('user-agent') || 'unknown-agent'
  const acceptLang = req.headers.get('accept-language') || 'unknown-lang'

  return `${userAgent}:${acceptLang}`
}
