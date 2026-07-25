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

let refreshLock: Promise<boolean> | null = null

async function doRefreshAuthToken(): Promise<boolean> {
  if (!pb.authStore.token || !pb.authStore.record) return false

  const collectionName = pb.authStore.record?.collectionName || 'users'

  for (let attempt = 0; attempt <= 2; attempt++) {
    try {
      await pb.collection(collectionName).authRefresh()
      if (pb.authStore.isValid && pb.authStore.record) {
        return true
      }
      return false
    } catch (err: any) {
      const status = err?.status ?? 0
      if (status === 401 || status === 403) {
        return false
      }
      if (attempt < 2) {
        const delay = 1500 * Math.pow(2, attempt)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }
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

    const renewed = await ensureValidToken()
    if (renewed) return true

    const remaining = deadline - Date.now()
    if (remaining <= 0) return false

    await new Promise((resolve) => setTimeout(resolve, Math.min(retryInterval, remaining)))
  }

  return false
}
