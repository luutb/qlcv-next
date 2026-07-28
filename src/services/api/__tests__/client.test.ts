import axios, {
  AxiosError,
  type AxiosProgressEvent,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import Cookies from 'js-cookie';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const TEST_API_URL = 'https://api.example.test/api/v1';

function successfulResponse(
  config: InternalAxiosRequestConfig,
  data: unknown = { data: null, success: true }
): AxiosResponse {
  return {
    config,
    data,
    headers: {},
    status: 200,
    statusText: 'OK',
  };
}

function unauthorized(config: InternalAxiosRequestConfig): Promise<never> {
  return Promise.reject(
    new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, {
      config,
      data: { message: 'Unauthorized' },
      headers: {},
      status: 401,
      statusText: 'Unauthorized',
    })
  );
}

describe('canonical API client transport', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('NEXT_PUBLIC_API_URL', TEST_API_URL);
  });

  afterEach(() => {
    Cookies.remove('token');
    Cookies.remove('refresh_token');
    localStorage.clear();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('shares one singleton across canonical and compatibility imports', async () => {
    const [{ default: canonicalClient }, { default: compatibilityClient }] = await Promise.all([
      import('../client'),
      import('../../../api/client'),
    ]);

    expect(compatibilityClient).toBe(canonicalClient);
    expect(canonicalClient.axios.defaults.baseURL).toBe(TEST_API_URL);
    expect(canonicalClient.axios.defaults.timeout).toBe(30_000);
    expect(canonicalClient.axios.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('sends one file as multipart data and reports upload progress', async () => {
    const { default: apiClient } = await import('../client');
    const responseBody = {
      data: { file_url: '/attachments/evidence.pdf' },
      success: true,
    };
    const post = vi.spyOn(apiClient.axios, 'post').mockResolvedValue({ data: responseBody });
    const onProgress = vi.fn();
    const file = new File(['evidence'], 'evidence.pdf', { type: 'application/pdf' });

    const result = await apiClient.upload<{ file_url: string }>('/attachments', file, onProgress);

    expect(post).toHaveBeenCalledOnce();
    const [url, body, config] = post.mock.calls[0];
    expect(url).toBe('/attachments');
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get('file')).toBe(file);
    expect(config?.headers).toEqual({ 'Content-Type': 'multipart/form-data' });

    config?.onUploadProgress?.({ loaded: 5, total: 10 } as AxiosProgressEvent);
    expect(onProgress).toHaveBeenCalledWith(50);
    expect(result).toBe(responseBody);
  });

  it('prefers the access-token cookie and falls back to local storage', async () => {
    const { default: apiClient } = await import('../client');
    Cookies.set('token', 'cookie-access-token');
    localStorage.setItem('token', 'storage-access-token');
    const authorizations: unknown[] = [];

    apiClient.axios.defaults.adapter = async (config) => {
      authorizations.push(config.headers.Authorization);
      return successfulResponse(config);
    };

    await apiClient.get('/profile');
    Cookies.remove('token');
    await apiClient.get('/profile');

    expect(authorizations).toEqual([
      'Bearer cookie-access-token',
      'Bearer storage-access-token',
    ]);
  });

  it('shares one refresh across concurrent 401 responses and replays the queue', async () => {
    const { default: apiClient } = await import('../client');
    Cookies.set('refresh_token', 'current-refresh-token');
    const attempts = new Map<string, number>();
    const replayAuthorizations: unknown[] = [];
    let releaseRefresh!: () => void;
    const refreshGate = new Promise<{ data: { token: string; refresh_token: string } }>((resolve) => {
      releaseRefresh = () => resolve({
        data: { token: 'refreshed-access-token', refresh_token: 'rotated-refresh-token' },
      });
    });
    const refresh = vi.spyOn(axios, 'post').mockReturnValue(refreshGate);

    apiClient.axios.defaults.adapter = async (config) => {
      const url = config.url ?? '';
      const attempt = (attempts.get(url) ?? 0) + 1;
      attempts.set(url, attempt);
      if (attempt === 1) return unauthorized(config);
      replayAuthorizations.push(config.headers.Authorization);
      return successfulResponse(config);
    };

    const requests = Promise.all([apiClient.get('/first'), apiClient.get('/second')]);
    await vi.waitFor(() => expect(attempts.size).toBe(2));
    releaseRefresh();
    await requests;

    expect(refresh).toHaveBeenCalledOnce();
    expect(attempts).toEqual(new Map([['/first', 2], ['/second', 2]]));
    expect(replayAuthorizations).toEqual([
      'Bearer refreshed-access-token',
      'Bearer refreshed-access-token',
    ]);
    expect(Cookies.get('token')).toBe('refreshed-access-token');
    expect(localStorage.getItem('refresh_token')).toBe('rotated-refresh-token');
  });

  it('does not refresh a queued request more than once when its replay is also unauthorized', async () => {
    const { default: apiClient } = await import('../client');
    Cookies.set('refresh_token', 'current-refresh-token');
    let adapterCalls = 0;
    let releaseRefresh!: () => void;
    const refreshGate = new Promise<{ data: { token: string } }>((resolve) => {
      releaseRefresh = () => resolve({ data: { token: 'refreshed-access-token' } });
    });
    const refresh = vi.spyOn(axios, 'post').mockReturnValue(refreshGate);

    apiClient.axios.defaults.adapter = (config) => {
      adapterCalls += 1;
      return unauthorized(config);
    };

    const settled = Promise.allSettled([apiClient.get('/first'), apiClient.get('/second')]);
    await vi.waitFor(() => expect(adapterCalls).toBe(2));
    releaseRefresh();
    const results = await settled;

    expect(results.every(({ status }) => status === 'rejected')).toBe(true);
    expect(adapterCalls).toBe(4);
    expect(refresh).toHaveBeenCalledOnce();
  });

  it('does not call refresh when no refresh token is available', async () => {
    const [{ default: apiClient }, { ApiClientError }] = await Promise.all([
      import('../client'),
      import('../../../lib/errors'),
    ]);
    const refresh = vi.spyOn(axios, 'post');
    vi.stubGlobal('window', undefined);
    apiClient.axios.defaults.adapter = unauthorized;

    await expect(apiClient.get('/protected')).rejects.toBeInstanceOf(ApiClientError);

    expect(refresh).not.toHaveBeenCalled();
  });

  it('normalizes a 401 without a retryable request config', async () => {
    const [{ default: apiClient }, { ApiClientError }] = await Promise.all([
      import('../client'),
      import('../../../lib/errors'),
    ]);
    const refresh = vi.spyOn(axios, 'post');

    apiClient.axios.defaults.adapter = (config) => Promise.reject(
      new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', undefined, undefined, {
        config,
        data: { message: 'Unauthorized' },
        headers: {},
        status: 401,
        statusText: 'Unauthorized',
      })
    );

    await expect(apiClient.get('/protected')).rejects.toBeInstanceOf(ApiClientError);
    expect(refresh).not.toHaveBeenCalled();
  });

  it('rejects every queued request when refresh fails', async () => {
    const [{ default: apiClient }, { ApiClientError }] = await Promise.all([
      import('../client'),
      import('../../../lib/errors'),
    ]);
    Cookies.set('refresh_token', 'current-refresh-token');
    vi.stubGlobal('window', undefined);
    let adapterCalls = 0;
    let rejectRefresh!: (error: Error) => void;
    const refreshGate = new Promise<never>((_, reject) => {
      rejectRefresh = reject;
    });
    const refresh = vi.spyOn(axios, 'post').mockReturnValue(refreshGate);

    apiClient.axios.defaults.adapter = (config) => {
      adapterCalls += 1;
      return unauthorized(config);
    };

    const settled = Promise.allSettled([apiClient.get('/first'), apiClient.get('/second')]);
    await vi.waitFor(() => expect(adapterCalls).toBe(2));
    rejectRefresh(new Error('Refresh failed'));
    const results = await settled;
    const rejected = results.filter((result) => result.status === 'rejected');

    expect(rejected).toHaveLength(2);
    expect(rejected.every(({ reason }) => reason instanceof ApiClientError)).toBe(true);
    expect(rejected[0].reason).toBe(rejected[1].reason);
    expect(refresh).toHaveBeenCalledOnce();
  });
});
