import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthGuard, PublicRoute } from '@/components/AuthGuard'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/" element={<Login />} />
      </Route>

      <Route element={<AuthGuard />}>
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Catch all unmatched internal routes and redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
