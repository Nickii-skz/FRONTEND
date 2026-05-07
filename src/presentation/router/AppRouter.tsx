import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { LoginPage } from '../pages/LoginPage'
import { SalesPage } from '../pages/SalesPage'
import { ShiftOpenPage } from '../pages/ShiftOpenPage'
import { ShiftClosePage } from '../pages/ShiftClosePage'
import { HistoryPage } from '../pages/HistoryPage'
import { RoleGuard } from '../components/guards/RoleGuard'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuthStore()
  return session ? <>{children}</> : <Navigate to="/login" replace />
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/shift/open"
          element={
            <ProtectedRoute>
              <ShiftOpenPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shift/close"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['supervisor', 'admin']}>
                <ShiftClosePage />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales"
          element={
            <ProtectedRoute>
              <SalesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/sales" replace />} />
        <Route path="*" element={<Navigate to="/sales" replace />} />
      </Routes>
    </BrowserRouter>
  )
}