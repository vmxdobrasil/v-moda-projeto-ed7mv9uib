import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import Index from '@/pages/Index'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'
import { useAuth } from '@/hooks/use-auth'
import { Loader2 } from 'lucide-react'

function RequireAuth() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <RequireAuth />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            index: true,
            element: <Index />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
