import pb from '@/lib/pocketbase/client'
import { hasAuthInLocalStorage } from '@/lib/auth-diagnostics'

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
let recoveryLock: Promise<boolean> | null = null

/**
 * Attempts to recover a session when the in-memory authStore is empty
 * (cold start, new deploy, or the SDK failed to hydrate from localStorage).
 *
 * Unlike `doRefreshAuthToken()`, this does NOT require `pb.authStore.token`
 * to be populated in memory: the PocketBase SDK can call
 * `pb.collection('users').authRefresh()` using the httpOnly refresh cookie,
 * independently of the in-memory JWT state. If the server returns 200, the
 * SDK fills the authStore automatically and the session is recovered.
 *
 * A 401/403 marks the refresh token as permanently dead (fatalAuthFailure).
 * Any other error (network / 5xx) is transient — the caller may retry.
 */
export async function recoverSessionFromCookie(): Promise<boolean> {
  // If refresh is already known to be dead, do not retry — every call would
  // hit 401 again and re-trigger the clear/redirect cycle.
  if (fatalAuthFailure) return false

  // If the store is already populated, prefer the normal refresh path.
  if (pb.authStore.token && pb.authStore.record) {
    return refreshAuthToken()
  }

  // 🔑 Hidratação manual do localStorage ANTES de tentar refresh.
  // O PocketBase SDK v0.26.x nem sempre popula o authStore imediatamente
  // após authRefresh() retornar 200 (cold start / novo deploy). Lendo
  // diretamente o JSON `{ token, record }` que o SDK persiste na chave
  // `pocketbase_auth` e chamando `pb.authStore.save()`, garantimos que:
  //   1. o snapshot capturado abaixo (savedToken/savedRecord) não seja null;
  //   2. `restoreAuthStore()` tenha algo para restaurar caso o refresh falhe
  //      de forma transitória ou o SDK não confirme o store;
  //   3. o `doRefreshAuthToken()` consiga determinar `collectionName` a
  //      partir do record hidratado.
  if (!pb.authStore.token || !pb.authStore.record) {
    try {
      const raw = localStorage.getItem('pocketbase_auth')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.token && parsed?.record) {
          pb.authStore.save(parsed.token, parsed.record)
        }
      }
    } catch {
      // best-effort — continua com o fluxo normal
    }
  }

  // Recover only when there is reason to believe a session exists: either the
  // httpOnly refresh cookie is set (we cannot read it directly, but the server
  // will use it) OR auth material is still present in localStorage.
  const hasLocalAuth = hasAuthInLocalStorage()

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
    await pb.collection('users').authRefresh()
  } catch (err: any) {
    const status = err?.status ?? 0
    if (status === 401 || status === 403) {
      // Permanent failure — the refresh token is revoked/expired.
      fatalAuthFailure = true
      return false
    }
    // Transient (network / 5xx) — best-effort restore of any preserved
    // session, leave fatalAuthFailure unchanged; caller may retry.
    restoreAuthStore()
    return false
  }

  if (pb.authStore.isValid && pb.authStore.token && pb.authStore.record) {
    return true
  }

  // Refresh succeeded HTTP-wise (200) but the store is not valid yet.
  // This is a transient SDK state — do NOT set fatalAuthFailure. Restore any
  // preserved session so callers can keep the user logged in optimistically
  // and retry the refresh later.
  restoreAuthStore()
  return false
}

async function doRefreshAuthToken(): Promise<boolean> {
  // If the in-memory store is empty, try recovering the session from the
  // httpOnly refresh cookie before giving up. doRefreshAuthToken() is the
  // inner implementation of refreshAuthToken(); recoverSessionFromCookie()
  // delegates back to refreshAuthToken() when the store is already populated,
  // so there is no recursion here.
  if (!pb.authStore.token || !pb.authStore.record) {
    return recoverSessionFromCookie()
  }

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

  // Refresh succeeded HTTP-wise (200) but the store is not valid yet.
  // This is a transient SDK state — do NOT set fatalAuthFailure.
  // Restore the preserved session so callers can keep the user logged in
  // optimistically and retry the refresh later.
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

/**
 * Recovers a session from the httpOnly refresh cookie when the in-memory
 * authStore is empty (cold start / failed hydration). This is a thin,
 * lock-protected wrapper around `recoverSessionFromCookie()` so that
 * concurrent callers share a single in-flight recovery attempt.
 */
export async function recoverSession(): Promise<boolean> {
  if (recoveryLock) return recoveryLock
  recoveryLock = recoverSessionFromCookie()
  try {
    return await recoveryLock
  } finally {
    recoveryLock = null
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
  const recoveryInterval = 3_000

  while (Date.now() < deadline) {
    // If refresh is permanently dead, stop waiting immediately — there is
    // nothing a retry loop can do except keep returning 401.
    if (fatalAuthFailure) return false

    // Empty in-memory store but possibly a recoverable session: the httpOnly
    // refresh cookie lets the SDK call authRefresh() without an in-memory JWT.
    // Try recovering the session from the cookie before giving up. The httpOnly
    // cookie is not readable from JS, so we attempt recovery regardless of
    // localStorage state — a 401/403 flips fatalAuthFailure and we bail.
    if (!pb.authStore.token || !pb.authStore.record) {
      if (fatalAuthFailure) return false

      const recovered = await recoverSession()
      if (recovered && pb.authStore.isValid && pb.authStore.token && pb.authStore.record) {
        return true
      }

      if (fatalAuthFailure) return false

      const remaining = deadline - Date.now()
      if (remaining <= 0) return false

      // The store is still empty — wait a bit and retry recovery. The server
      // may be answering 200 but the SDK may need another attempt to hydrate.
      await new Promise((resolve) => setTimeout(resolve, Math.min(recoveryInterval, remaining)))
      continue
    }

    const renewed = await ensureValidToken()
    if (renewed) return true

    if (fatalAuthFailure) return false

    const remaining = deadline - Date.now()
    if (remaining <= 0) return false

    await new Promise((resolve) => setTimeout(resolve, Math.min(retryInterval, remaining)))
  }

  return false
}
