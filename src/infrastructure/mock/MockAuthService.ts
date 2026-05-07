import type { IAuthService, Credentials, AuthToken, OperatorSession } from '@application/ports/outbound/IAuthService'

const MOCK_USERS: Record<string, { password: string; session: Omit<OperatorSession, 'token'> }> = {
  cashier: {
    password: '1234',
    session: {
      operatorId: 'op-001',
      name: 'Ana García',
      role: 'cashier',
      registerId: 'REG-01',
    },
  },
  supervisor: {
    password: '5678',
    session: {
      operatorId: 'op-002',
      name: 'Carlos López',
      role: 'supervisor',
      registerId: 'REG-01',
    },
  },
  admin: {
    password: 'admin',
    session: {
      operatorId: 'op-003',
      name: 'María Torres',
      role: 'admin',
      registerId: 'REG-01',
    },
  },
}

const SUPERVISOR_PIN = '9999'

export class MockAuthService implements IAuthService {
  async login(credentials: Credentials): Promise<OperatorSession> {
    const user = MOCK_USERS[credentials.username]
    if (!user || user.password !== credentials.password) {
      throw new Error('Invalid credentials')
    }
    const token: AuthToken = {
      value: `mock-token-${Date.now()}`,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
    }
    return { ...user.session, token }
  }

  async logout(_token: AuthToken): Promise<void> {
    // No-op for mock
  }

  async validateToken(token: AuthToken): Promise<OperatorSession> {
    if (new Date() > token.expiresAt) {
      throw new Error('Token expired')
    }
    return {
      operatorId: 'op-001',
      name: 'Ana García',
      role: 'cashier',
      registerId: 'REG-01',
      token,
    }
  }

  async validatePin(pin: string, _operatorId: string): Promise<boolean> {
    return pin === SUPERVISOR_PIN
  }
}
