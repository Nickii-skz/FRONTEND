import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import type { OperatorRole } from '@application/ports/outbound/IAuthService'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: OperatorRole[]
  redirectTo?: string
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  redirectTo = '/sales' 
}: RoleGuardProps) {
  const { session } = useAuthStore()

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(session.role)) {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}
