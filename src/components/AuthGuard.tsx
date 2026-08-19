import { useState, useEffect, useRef } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import {
  hasActiveBackgroundOperations,
  onBackgroundOperationsChange,
} from '@/lib/background-operations'
import { AuthLoadingScreen } from '@/components/AuthLoadingScreen'
import { getRoleBasedRedirect, isSuperuserOrAdmin, setIntendedRoute } from '@/lib/auth-redirects'
import { isPublicRoute, isPublicAuthRoute } from '@/lib/public-routes'
import { waitForTokenRenewal, hasFatalAuthFailure } from '@/lib/token-refresh'
import { hasAuthInLocalStorage } from '@/lib/auth-diagnostics'

const GRACE_PERIOD_MS = 120_000
// Janela síncrona de tolerância: se isAuthenticated acabou de virar false (há
// menos de AUTH_FALSE_GRACE_MS) e não é falha fatal, o guard mantém o estado
// de loading para dar tempo ao grace period / waitForTokenRenewal recuperar a
// sessão — evita que o React Router navegue para /login antes do refresh.
const AUTH_FALSE_GRACE_MS = 3_000

type GuardState =
  | { status: 'loading' }
  | { status: 'unauthenticated'; from: string }
  | { status: 'authenticated'; user: any }

function useGuardBase(): GuardState {
  const { isAuthenticated, user, loading, isHydrating } = useAuth()
  const location = useLocation()
  const [bgOpsActive, setBgOpsActive] = useState(hasActiveBackgroundOperations())
  const [inGracePeriod, setInGracePeriod] = useState(false)
  const graceAttemptedRef = useRef(false)
  // Marca quando isAuthenticated transita de true -> false, para segurar o
  // guard em loading durante a janela AUTH_FALSE_GRACE_MS (ver abaixo).
  const prevAuthRef = useRef<boolean>(isAuthenticated)
  const authFalseSinceRef = useRef<number | null>(null)
  // Estado usado apenas para forçar uma re-renderização quando a janela de
  // tolerância expira (caso contrário o guard ficaria em loading indefinidamente).
  const [, setAuthFalseGraceTick] = useState(0)

  // Rastreia a transição true -> false sincronamente durante o render, para
  // que o guard abaixo já encontre o timestamp na própria renderização em que
  // isAuthenticated vira false (um useEffect rodaria tarde demais e perderia
  // a race condition que estamos corrigindo).
  if (isAuthenticated !== prevAuthRef.current) {
    if (!isAuthenticated && prevAuthRef.current) {
      authFalseSinceRef.current = Date.now()
    } else if (isAuthenticated) {
      authFalseSinceRef.current = null
    }
    prevAuthRef.current = isAuthenticated
  }

  useEffect(() => {
    return onBackgroundOperationsChange(() => setBgOpsActive(hasActiveBackgroundOperations()))
  }, [])

  // Garante uma re-renderização ao fim da janela de tolerância para que o
  // guard saia de loading e redirecione (ou autentique) caso a sessão não
  // tenha sido recuperada a tempo.
  useEffect(() => {
    if (!isAuthenticated && !hasFatalAuthFailure() && authFalseSinceRef.current !== null) {
      const elapsed = Date.now() - authFalseSinceRef.current
      const remaining = Math.max(AUTH_FALSE_GRACE_MS - elapsed, 0)
      const t = setTimeout(() => setAuthFalseGraceTick((n) => n + 1), remaining)
      return () => clearTimeout(t)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isPublicRoute(location.pathname)) return
    if (loading || isHydrating) return
    if (isAuthenticated) {
      setInGracePeriod(false)
      graceAttemptedRef.current = false
      return
    }
    if (bgOpsActive) return
    // If refresh is permanently dead (PocketBase already returned 401/403 on
    // auth-refresh) there is nothing to wait for — do NOT enter the grace
    // period, just let the guard redirect to /login immediately.
    if (hasFatalAuthFailure()) {
      setInGracePeriod(false)
      return
    }
    // Enter the grace period whenever there is ANY trace of an auth session —
    // either in the in-memory store (token + record) or persisted in
    // localStorage. The PocketBase SDK can briefly clear `authStore.record`
    // during a transient refresh failure; if the store is empty but the
    // session is still in localStorage, the grace period / token renewal can
    // restore it instead of bouncing the user to /login.
    const hasStoreAuth = !!(pb.authStore.token && pb.authStore.record)
    const hasLocalAuth = hasAuthInLocalStorage()
    if (!hasStoreAuth && !hasLocalAuth) return
    if (graceAttemptedRef.current) return

    graceAttemptedRef.current = true
    setInGracePeriod(true)

    waitForTokenRenewal(GRACE_PERIOD_MS).then(() => {
      setInGracePeriod(false)
    })
  }, [isAuthenticated, loading, isHydrating, bgOpsActive, location.pathname])

  // Note: Public auth routes like /login or /signup should NOT cause useGuardBase
  // to return status 'authenticated' for protected sub-guards. Only public content pages should.
  if (isPublicRoute(location.pathname) && !isPublicAuthRoute(location.pathname)) {
    if (isAuthenticated && !user) {
      return { status: 'loading' }
    }
    if (!isAuthenticated && !hasFatalAuthFailure() && hasAuthInLocalStorage()) {
      return { status: 'loading' }
    }
    return { status: 'authenticated', user }
  }

  if (loading || isHydrating) {
    setIntendedRoute(location.pathname + location.search)
    return { status: 'loading' }
  }

  if (!isAuthenticated && bgOpsActive) {
    return { status: 'loading' }
  }

  if (!isAuthenticated && inGracePeriod) {
    setIntendedRoute(location.pathname + location.search)
    return { status: 'loading' }
  }

  if (!isAuthenticated) {
    // 🔑 Hidratação direta do authStore na hora: o PocketBase SDK v0.26.x
    // não popula `pb.authStore` automaticamente em cold start, então o
    // contexto pode ainda não ter commitado `isAuthenticated=true`. Antes
    // de considerar o usuário de fato não-autenticado, tente hidratar o
    // store a partir do localStorage e, se funcionar, trate como
    // autenticado para evitar o redirecionamento para /login.
    if (!hasFatalAuthFailure() && !pb.authStore.token) {
      try {
        const raw = localStorage.getItem('pocketbase_auth')
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed?.token && parsed?.record) {
            pb.authStore.save(parsed.token, parsed.record)
          }
        }
      } catch {
        /* best-effort */
      }
    }
    // Após a tentativa de hidratação, reavalie: se o store agora tem token
    // e record válidos, o usuário está autenticado — retorne loading para
    // que o AuthProvider/commitAuthState sincronize o contexto no próximo
    // ciclo, em vez de redirecionar para /login.
    if (!hasFatalAuthFailure() && pb.authStore.token && pb.authStore.record) {
      setIntendedRoute(location.pathname + location.search)
      return { status: 'loading' }
    }
    // Se há auth em localStorage e não é falha fatal, dê chance ao grace period
    // renovar o token antes de redirecionar para /login (evita race condition
    // onde o redirecionamento acontece antes do useEffect de grace period rodar).
    if (!hasFatalAuthFailure() && hasAuthInLocalStorage()) {
      setIntendedRoute(location.pathname + location.search)
      return { status: 'loading' }
    }
    // Segunda camada síncrona: se isAuthenticated acabou de virar false (há
    // menos de AUTH_FALSE_GRACE_MS) e não é falha fatal, mantenha loading para
    // dar tempo ao grace period / waitForTokenRenewal agir. Isto cobre o caso
    // em que o estado React já está false mas o localStorage ainda pode ter a
    // sessão (ou o refresh está em andamento) — sem isso o React Router
    // navegaria para /login antes do useEffect de grace period rodar.
    if (
      !hasFatalAuthFailure() &&
      authFalseSinceRef.current !== null &&
      Date.now() - authFalseSinceRef.current < AUTH_FALSE_GRACE_MS
    ) {
      setIntendedRoute(location.pathname + location.search)
      return { status: 'loading' }
    }
    return { status: 'unauthenticated', from: location.pathname + location.search }
  }

  // If authenticated but user record is not hydrated yet, stay in loading status
  // so guards don't evaluate roles or make redirect decisions against a null user.
  if (!user) {
    setIntendedRoute(location.pathname + location.search)
    return { status: 'loading' }
  }

  return { status: 'authenticated', user }
}

function toLogin(from: string) {
  setIntendedRoute(from)
  const redirectParam = `?redirect=${encodeURIComponent(from)}`
  return <Navigate to={`/login${redirectParam}`} state={{ from }} replace />
}

export function AuthGuard() {
  const s = useGuardBase()
  if (s.status === 'loading') return <AuthLoadingScreen />
  if (s.status === 'unauthenticated') return toLogin(s.from)
  return <Outlet />
}

export function AdminGuard() {
  const s = useGuardBase()
  if (s.status === 'loading') return <AuthLoadingScreen />
  if (s.status === 'unauthenticated') return toLogin(s.from)
  if (!isSuperuserOrAdmin(s.user)) return <Navigate to={getRoleBasedRedirect(s.user)} replace />
  return <Outlet />
}

export function ManufacturerGuard() {
  const s = useGuardBase()
  if (s.status === 'loading') return <AuthLoadingScreen />
  if (s.status === 'unauthenticated') return toLogin(s.from)
  const ok = s.user?.role === 'manufacturer' || isSuperuserOrAdmin(s.user)
  if (!ok) return <Navigate to={getRoleBasedRedirect(s.user)} replace />
  return <Outlet />
}

export function CrmGuard() {
  const s = useGuardBase()
  if (s.status === 'loading') return <AuthLoadingScreen />
  if (s.status === 'unauthenticated') return toLogin(s.from)
  const ok =
    isSuperuserOrAdmin(s.user) ||
    s.user?.manufacturer_role === 'manager' ||
    s.user?.brand_role === 'manager'
  if (!ok) return <Navigate to={getRoleBasedRedirect(s.user)} replace />
  return <Outlet />
}

export function RetailerGuard() {
  const s = useGuardBase()
  if (s.status === 'loading') return <AuthLoadingScreen />
  if (s.status === 'unauthenticated') return toLogin(s.from)
  const ok = s.user?.role === 'retailer' || isSuperuserOrAdmin(s.user)
  if (!ok) return <Navigate to={getRoleBasedRedirect(s.user)} replace />
  return <Outlet />
}

export function AgentGuard() {
  const s = useGuardBase()
  if (s.status === 'loading') return <AuthLoadingScreen />
  if (s.status === 'unauthenticated') return toLogin(s.from)
  const ok = s.user?.role === 'agent' || isSuperuserOrAdmin(s.user)
  if (!ok) return <Navigate to={getRoleBasedRedirect(s.user)} replace />
  return <Outlet />
}

export function AgentOrTransporterGuard() {
  const s = useGuardBase()
  if (s.status === 'loading') return <AuthLoadingScreen />
  if (s.status === 'unauthenticated') return toLogin(s.from)
  const ok =
    s.user?.role === 'agent' ||
    s.user?.role === 'retailer' ||
    s.user?.is_transporter === true ||
    isSuperuserOrAdmin(s.user)
  if (!ok) return <Navigate to={getRoleBasedRedirect(s.user)} replace />
  return <Outlet />
}

export function MasterAdminGuard() {
  const s = useGuardBase()
  if (s.status === 'loading') return <AuthLoadingScreen />
  if (s.status === 'unauthenticated') return toLogin(s.from)
  if (!isSuperuserOrAdmin(s.user)) return <Navigate to={getRoleBasedRedirect(s.user)} replace />
  return <Outlet />
}

export function PublicRoute() {
  const { loading, isHydrating, isAuthenticated, user } = useAuth()
  const [bgOpsActive, setBgOpsActive] = useState(hasActiveBackgroundOperations())

  useEffect(() => {
    return onBackgroundOperationsChange(() => setBgOpsActive(hasActiveBackgroundOperations()))
  }, [])

  // 🔑 CORREÇÃO "ghost redirect": ao detectar QUALQUER sinal de autenticação,
  // redirecione IMEDIATAMENTE para a rota baseada em papel — mesmo quando o
  // `user` do contexto ainda não hidratou (isAuthenticated=true & user=null).
  // Usamos o record vivo do authStore como fallback para decidir o destino.
  if (isAuthenticated) {
    const record = user ?? pb.authStore.record
    if (record) return <Navigate to={getRoleBasedRedirect(record)} replace />
    return <AuthLoadingScreen />
  }
  if (!hasFatalAuthFailure() && (pb.authStore.token || hasAuthInLocalStorage())) {
    try {
      const record = pb.authStore.record
      if (record) return <Navigate to={getRoleBasedRedirect(record)} replace />

      const raw = localStorage.getItem('pocketbase_auth')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.record) {
          return <Navigate to={getRoleBasedRedirect(parsed.record)} replace />
        }
      }
    } catch {
      /* best-effort — cai para loading abaixo */
    }
    return <AuthLoadingScreen />
  }
  if (bgOpsActive && !isAuthenticated) return <AuthLoadingScreen />
  return <Outlet />
}

export function FinancialGuard() {
  const s = useGuardBase()
  if (s.status === 'loading') return <AuthLoadingScreen />
  if (s.status === 'unauthenticated') return toLogin(s.from)
  const ok =
    isSuperuserOrAdmin(s.user) ||
    s.user?.role === 'manufacturer' ||
    s.user?.role === 'retailer' ||
    s.user?.role === 'agent'
  if (!ok) return <Navigate to={getRoleBasedRedirect(s.user)} replace />
  return <Outlet />
}
