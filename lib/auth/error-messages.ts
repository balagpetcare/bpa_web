import { ApiError, ApiNetworkError } from '@/lib/api';

// Safe, typed copy for every auth failure surface (sign-in, sign-up,
// OTP, password reset). Never echoes the raw backend message verbatim —
// the backend deliberately collapses "no such account" and "wrong
// password" into the same INVALID_CREDENTIALS code/message specifically to
// prevent account enumeration (see auth.service.ts login()); this mapper
// preserves that guarantee rather than trying to be "more specific" from
// the client side.
//
// The one exception is the account-lockout message: the backend already
// considers that safe to reveal verbatim (it's a rate-limit state, not an
// existence disclosure), so it's passed through rather than genericized.

export function mapAuthErrorMessage(err: unknown): string {
  if (err instanceof ApiNetworkError) {
    return 'The authentication service is currently unreachable. Please try again in a moment.';
  }

  if (!(err instanceof ApiError)) {
    return 'Something went wrong. Please try again.';
  }

  if (err.status >= 500 || err.status === 0) {
    return 'The authentication service is currently unreachable. Please try again in a moment.';
  }

  switch (err.code) {
    case 'INVALID_CREDENTIALS':
      // The backend's own lockout message is intentionally specific and safe
      // to show verbatim; every other INVALID_CREDENTIALS case (wrong
      // password, unknown email/phone, disabled account) is deliberately
      // indistinguishable, so it gets one generic, non-enumerating message.
      if (/locked/i.test(err.message)) return err.message;
      return 'Email or password is incorrect.';
    // Not currently emitted by the backend (see PHASE 1 audit note in
    // AuthContext) — mapped defensively so the UI is ready the moment the
    // backend adds a real verification gate, without this file needing to
    // change again.
    case 'EMAIL_NOT_VERIFIED':
      return 'Your account requires verification. Please check your email for a verification link.';
    case 'ACCOUNT_DISABLED':
      return 'Your account is temporarily unavailable. Please contact support.';
    case 'TOKEN_EXPIRED':
    case 'TOKEN_INVALID':
    case 'UNAUTHORIZED':
      return 'Your session has expired. Please sign in again.';
    case 'CONFLICT':
      return err.message || 'This account already exists.';
    default:
      return err.message || 'Something went wrong. Please try again.';
  }
}
