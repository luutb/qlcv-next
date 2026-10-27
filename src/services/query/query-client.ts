import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { ApiProblem } from "@/services/http/api-client";

const MAX_RETRIES = 2;
function shouldRetry(failureCount: number, error: unknown): boolean { if (failureCount >= MAX_RETRIES) return false; if (error instanceof ApiProblem) return error.problem.status >= 500; return error instanceof TypeError; }
function retryDelay(attempt: number): number { return Math.min(1000 * (2 ** attempt), 8000); }
export function createQueryClient(): QueryClient { return new QueryClient({ queryCache: new QueryCache(), mutationCache: new MutationCache(), defaultOptions: { queries: { staleTime: 30_000, gcTime: 10 * 60_000, retry: shouldRetry, retryDelay, refetchOnWindowFocus: true, refetchOnReconnect: true, networkMode: "online", throwOnError: false }, mutations: { retry: false, networkMode: "online", throwOnError: false } } }); }
