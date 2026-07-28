import type { AxiosProgressEvent } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const TEST_API_URL = 'https://api.example.test/api/v1';

describe('canonical API client transport', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('NEXT_PUBLIC_API_URL', TEST_API_URL);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
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
});
