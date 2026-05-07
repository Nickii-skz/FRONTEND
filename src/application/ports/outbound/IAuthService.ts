export type OperatorRole = 'cashier' | 'supervisor' | 'admin'

export interface Credentials {
  username: string
  password: string
}

export interface AuthToken {
  value: string
  expiresAt: Date
}

export interface OperatorSession {
  operatorId: string
  name: string
  role: OperatorRole
  registerId: string
  token: AuthToken
}

export interface IAuthService {
  login(credentials: Credentials): Promise<OperatorSession>
  logout(token: AuthToken): Promise<void>
  validateToken(token: AuthToken): Promise<OperatorSession>
  validatePin(pin: string, operatorId: string): Promise<boolean>
}
