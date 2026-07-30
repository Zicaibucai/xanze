import type { ReactNode } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { Spin } from 'antd'
import { isAdmin, useAuth } from './auth'
import { AdminLayout } from './layouts/AdminLayout'
import { PortalLayout } from './layouts/PortalLayout'
import { DepartmentsPage } from './pages/DepartmentsPage'
import { LoginPage } from './pages/LoginPage'
import { RolesPage } from './pages/RolesPage'
import { UsersPage } from './pages/UsersPage'

function RequireSession({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="page-loader" aria-label="正在加载">
        <Spin size="large" />
      </div>
    )
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return children
}

function RequireAdmin() {
  const { user } = useAuth()
  if (!isAdmin(user)) {
    return <Navigate to="/portal" replace />
  }
  return <Outlet />
}

function HomeRedirect() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="page-loader">
        <Spin size="large" />
      </div>
    )
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return <Navigate to={isAdmin(user) ? '/admin/users' : '/portal'} replace />
}

export function XanzeRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireSession>
            <Outlet />
          </RequireSession>
        }
      >
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="users" replace />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="departments" element={<DepartmentsPage />} />
          </Route>
        </Route>
        <Route path="/portal" element={<PortalLayout />} />
      </Route>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

