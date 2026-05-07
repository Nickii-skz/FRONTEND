import { Ok, Err, type Result } from '@domain/Result'
import { SessionExpiredError } from '@domain/errors/DomainError'
import type { IAuthService, Credentials, OperatorSession } from '@application/ports/outbound/IAuthService'

export class AuthenticateOperatorUseCase {
  constructor(private readonly authService: IAuthService) {}

  async execute(credentials: Credentials): Promise<Result<OperatorSession, SessionExpiredError>> {
    if (!credentials.username.trim() || !credentials.password.trim()) {
      return Err(new SessionExpiredError())
    }
    try {
      const session = await this.authService.login(credentials)
      return Ok(session)
    } catch {
      // Return generic error — never reveal which field is wrong
      return Err(new SessionExpiredError())
    }
  }
}
