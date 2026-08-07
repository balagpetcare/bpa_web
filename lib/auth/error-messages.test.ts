import assert from 'node:assert/strict';
import test from 'node:test';
import { ApiError, ApiNetworkError } from '@/lib/api';
import { mapAuthErrorMessage } from './error-messages';

test('maps INVALID_CREDENTIALS to a generic, non-enumerating message', () => {
  const err = new ApiError(401, 'Invalid credentials', undefined, 'INVALID_CREDENTIALS');
  assert.equal(mapAuthErrorMessage(err), 'Email or password is incorrect.');
});

test('never reveals whether the wrong-password case differs from the no-such-account case', () => {
  // The backend collapses both into the identical code+message deliberately —
  // this asserts the client mapper does not try to be "smarter" and leak that distinction.
  const wrongPassword = new ApiError(401, 'Invalid credentials', undefined, 'INVALID_CREDENTIALS');
  const noSuchAccount = new ApiError(401, 'Invalid credentials', undefined, 'INVALID_CREDENTIALS');
  assert.equal(mapAuthErrorMessage(wrongPassword), mapAuthErrorMessage(noSuchAccount));
});

test('passes the backend lockout message through verbatim (already safe/specific)', () => {
  const err = new ApiError(401, 'Account locked for 30 minutes after too many failed login attempts.', undefined, 'INVALID_CREDENTIALS');
  assert.equal(mapAuthErrorMessage(err), 'Account locked for 30 minutes after too many failed login attempts.');
});

test('maps TOKEN_EXPIRED / TOKEN_INVALID / UNAUTHORIZED to a session-expired message', () => {
  assert.equal(mapAuthErrorMessage(new ApiError(401, 'x', undefined, 'TOKEN_EXPIRED')), 'Your session has expired. Please sign in again.');
  assert.equal(mapAuthErrorMessage(new ApiError(401, 'x', undefined, 'TOKEN_INVALID')), 'Your session has expired. Please sign in again.');
  assert.equal(mapAuthErrorMessage(new ApiError(401, 'x', undefined, 'UNAUTHORIZED')), 'Your session has expired. Please sign in again.');
});

test('maps a hypothetical future EMAIL_NOT_VERIFIED code to a verification-required message', () => {
  const err = new ApiError(403, 'x', undefined, 'EMAIL_NOT_VERIFIED');
  assert.equal(mapAuthErrorMessage(err), 'Your account requires verification. Please check your email for a verification link.');
});

test('maps a hypothetical future ACCOUNT_DISABLED code to an account-unavailable message', () => {
  const err = new ApiError(403, 'x', undefined, 'ACCOUNT_DISABLED');
  assert.equal(mapAuthErrorMessage(err), 'Your account is temporarily unavailable. Please contact support.');
});

test('maps a network-level failure to a service-unreachable message', () => {
  assert.equal(mapAuthErrorMessage(new ApiNetworkError()), 'The authentication service is currently unreachable. Please try again in a moment.');
});

test('maps a 5xx server error to the same service-unreachable message', () => {
  const err = new ApiError(500, 'Internal error', undefined, 'INTERNAL_ERROR');
  assert.equal(mapAuthErrorMessage(err), 'The authentication service is currently unreachable. Please try again in a moment.');
});

test('passes a specific, already-safe registration message through (duplicate email/phone)', () => {
  const err = new ApiError(400, 'Email already registered', undefined, 'BAD_REQUEST');
  assert.equal(mapAuthErrorMessage(err), 'Email already registered');
});

test('never echoes a raw, non-ApiError exception message', () => {
  assert.equal(mapAuthErrorMessage(new Error('ECONNREFUSED 127.0.0.1:4000')), 'Something went wrong. Please try again.');
  assert.equal(mapAuthErrorMessage('a plain string throw'), 'Something went wrong. Please try again.');
});
