import pb from '@/lib/pocketbase/client'

function isJwtExpiredOrExpiring(safetyMarginSeconds: number = 300): boolean {
  const token = pb.authStore.token
  if (!token) return true
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true
    let payloadB64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    while (payloadB64.length % 4) payloadB64 += '='
    const payload = JSON.parse(atob(payloadB64))
    if (!payload.exp) return false
    const now = Math.floor(Date.now() / 1000)
    return payload.exp < now + safetyMarginSeconds
  } catch {
    return true
  }
}

export function willTokenExpireSoon(minutes: number = 5): boolean {
  return isJwtExpiredOrExpiring(minutes * 60)
}

export function getTokenExpiry(): number | null {
  const token = pb.authStore.token
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    let payloadB64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    while (payloadB64.length % 4) payloadB64 += '='
    const payload = JSON.parse(atob(payloadB64))
    if (!payload.exp) return null
    return payload.exp as number
  } catch {
    return null
  }
}

/**
 * Once PocketBase rejects an authRefresh with 401/403, the refresh token is
 * permanently invalid — retrying it will only ever return 401 again. We set
 * this flag so the whole app stops hammering auth-refresh in a loop and can
 * clear the session + redirect to /login exactly once.
 *
 * The flag is reset by `resetFatalAuthFailure()` on a successful login.
 */
let fatalAuthFailure = false

export function hasFatalAuthFailure(): boolean {
  return fatalAuthFailure
}

export function resetFatalAuthFailure(): void {
  fatalAuthFailure = false
}

let refreshLock: Promise<boolean> | null = null

async function doRefreshAuthToken(): Promise<boolean> {
  if (!pb.authStore.token || !pb.authStore.record) return false

  // If refresh is already known to be dead, do not retry — every call would
  // hit 401 again and re-trigger the clear/redirect cycle.
  if (fatalAuthFailure) return false

  // `collectionName` may be undefined on the record object (some PocketBase
  // builds omit it after a store hydration from localStorage). Fall back to
  // `pb.authStore.model` and finally to 'users' so the authRefresh call never
  // throws with "Cannot read properties of undefined".
  const recordModel =
    (typeof pb.authStore.record?.collectionName === 'string' &&
      pb.authStore.record.collectionName) ||
    (typeof (pb.authStore.model as any)?.collectionName === 'string' &&
      (pb.authStore.model as any).collectionName) ||
    (typeof (pb.authStore.record as any)?.collectionId === 'string' &&
      (pb.authStore.record as any).collectionId) ||
    'users'
  const collectionName = recordModel || 'users'

  // Preserve the current token + record so we can restore the authStore if
  // authRefresh() blows up transiently. The PocketBase SDK clears
  // `authStore.record` internally on failure, which previously made the
  // optimistic fallback in use-auth.tsx a no-op and led to a /login redirect
  // even though the server was still answering 200 on auth-refresh.
  const savedToken = pb.authStore.token
  const savedRecord = pb.authStore.record

  const restoreAuthStore = () => {
    try {
      if (savedToken && savedRecord) {
        pb.authStore.save(savedToken, savedRecord)
      }
    } catch {
      /* intentionally ignored — best-effort restore */
    }
  }

  try {
    await pb.collection(collectionName).authRefresh()
  } catch (err: any) {
    const status = err?.status ?? 0
    if (status === 401 || status === 403) {
      // Permanent failure — do NOT retry. The refresh token is revoked/expired.
      fatalAuthFailure = true
      return false
    }
    // Transient (network / 5xx) — restore the preserved session so callers
    // can keep the user logged in optimistically. Leave fatalAuthFailure
    // unchanged; caller may retry later when connectivity returns.
    restoreAuthStore()
    return false
  }

  if (pb.authStore.isValid && pb.authStore.token && pb.authStore.record) {
    return true
  }

  // Refresh "succeeded" HTTP-wise but the store is invalid. Treat as fatal
  // only when the SDK reports a permanent auth rejection; otherwise restore
  // the preserved session and let the caller retry later.
  fatalAuthFailure = true
  restoreAuthStore()
  return false
}

export async function refreshAuthToken(): Promise<boolean> {
  if (refreshLock) return refreshLock
  refreshLock = doRefreshAuthToken()
  try {
    return await refreshLock
  } finally {
    refreshLock = null
  }
}

export async function ensureValidToken(): Promise<boolean> {
  if (!pb.authStore.token || !pb.authStore.record) return false
  if (!isJwtExpiredOrExpiring()) return true
  return refreshAuthToken()
}

export async function waitForTokenRenewal(timeoutMs: number = 120_000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs
  const retryInterval = 5_000

  while (Date.now() < deadline) {
    if (!pb.authStore.token || !pb.authStore.record) return false

    // If refresh is permanently dead, stop waiting immediately — there is
    // nothing a retry loop can do except keep returning 401.
    if (fatalAuthFailure) return false

    const renewed = await ensureValidToken()
    if (renewed) return true

    if (fatalAuthFailure) return false

    const remaining = deadline - Date.now()
    if (remaining <= 0) return false

    await new Promise((resolve) => setTimeout(resolve, Math.min(retryInterval, remaining)))
  }

  return false
}
