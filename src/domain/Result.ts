import type { DomainError } from './errors/DomainError'

export type Result<T, E extends DomainError = DomainError> =
  | { ok: true; value: T }
  | { ok: false; error: E }

export function Ok<T>(value: T): Result<T, never> {
  return { ok: true, value }
}

export function Err<E extends DomainError>(error: E): Result<never, E> {
  return { ok: false, error }
}

export function isOk<T, E extends DomainError>(
  result: Result<T, E>
): result is { ok: true; value: T } {
  return result.ok === true
}

export function isErr<T, E extends DomainError>(
  result: Result<T, E>
): result is { ok: false; error: E } {
  return result.ok === false
}

export function mapResult<T, U, E extends DomainError>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  if (isOk(result)) return Ok(fn(result.value))
  return result
}
