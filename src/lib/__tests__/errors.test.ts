import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it } from 'vitest';
import { ApiClientError, extractErrorMessage, normalizeApiError } from '../errors';

describe('API error normalization', () => {
  it('preserves runtime Axios error fields when they have the expected primitive types', () => {
    const config: InternalAxiosRequestConfig = { headers: new AxiosHeaders() };
    const original = new AxiosError('Request failed', 'ERR_BAD_RESPONSE', config, undefined, {
      config,
      data: {
        code: 'FORBIDDEN',
        details: { permission: 'budget:update' },
        message: 'Access denied',
      },
      headers: {},
      status: 403,
      statusText: 'Forbidden',
    });

    const normalized = normalizeApiError(original);

    expect(normalized).toBeInstanceOf(ApiClientError);
    expect(normalized).toMatchObject({
      code: 'FORBIDDEN',
      details: { permission: 'budget:update' },
      message: 'Access denied',
      name: 'ApiClientError',
      status: 403,
    });
    expect(normalized.cause).toBe(original);
    expect(Object.keys(normalized)).not.toContain('cause');
    expect(JSON.stringify(normalized)).not.toContain('Request failed');
  });

  it('falls back safely instead of coercing unknown payload shapes', () => {
    const config: InternalAxiosRequestConfig = { headers: new AxiosHeaders() };
    const original = new AxiosError('Transport failed', 'ERR_NETWORK', config, undefined, {
      config,
      data: { code: 500, details: false, message: { text: 'invalid' } },
      headers: {},
      status: 502,
      statusText: 'Bad Gateway',
    });

    expect(normalizeApiError(original)).toMatchObject({
      code: 'ERR_NETWORK',
      details: false,
      message: 'Transport failed',
      status: 502,
    });
  });

  it('normalizes non-Axios values and is idempotent', () => {
    const normalizedError = normalizeApiError(new Error('Offline'));
    const normalizedUnknown = normalizeApiError(null);

    expect(normalizedError).toMatchObject({
      code: 'UNKNOWN_ERROR',
      details: null,
      message: 'Offline',
    });
    expect(normalizeApiError(normalizedError)).toBe(normalizedError);
    expect(normalizedUnknown).toMatchObject({
      code: 'UNKNOWN_ERROR',
      details: null,
      message: 'An unexpected error occurred',
    });
  });

  it('preserves typed fields from a plain error-like object without treating top-level details as response data', () => {
    const normalized = normalizeApiError({
      code: 'PLAIN_CODE',
      details: { internal: true },
      message: 'Plain transport failure',
    });

    expect(normalized).toMatchObject({
      code: 'PLAIN_CODE',
      details: null,
      message: 'Plain transport failure',
    });
  });

  it('keeps the existing localized code mapping for normalized errors', () => {
    const error = new ApiClientError('Server message', { code: 'FORBIDDEN' });

    expect(extractErrorMessage(error)).toBe('Bạn không có quyền thực hiện thao tác này');
    expect(extractErrorMessage(new Error('Offline'))).toBe('Offline');
  });
});
