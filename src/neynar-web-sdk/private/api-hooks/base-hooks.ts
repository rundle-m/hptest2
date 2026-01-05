/**
 * Base hook utilities for the Neynar Web SDK API architecture
 * Provides consistent patterns for queries, mutations, and infinite queries
 */

import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

import type {
  ApiError,
  ExtendedQueryOptions,
  ExtendedMutationOptions,
  ExtendedInfiniteQueryOptions,
  QueryHookResult,
  MutationHookResult,
} from "./types";

/**
 * Enhanced fetch function with proper error handling
 */
async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const responseData = await response.json();

  if (!response.ok) {
    const error: ApiError = responseData.error || {
      status: response.status,
      message: response.statusText || "An error occurred",
    };
    throw error;
  }

  return responseData;
}

/**
 * Universal API query hook
 */
export function useApiQuery<TQueryFnData = unknown, TData = TQueryFnData>(
  queryKey: readonly unknown[],
  endpoint: string,
  options?: ExtendedQueryOptions<TQueryFnData, TData>,
): QueryHookResult<TData> {
  const { requestOptions, ...queryOptions } = options || {};

  return useQuery<TQueryFnData, ApiError, TData>({
    queryKey,
    queryFn: () => apiRequest<TQueryFnData>(endpoint, requestOptions),
    ...queryOptions,
  });
}

/**
 * Universal API mutation hook
 */
export function useApiMutation<TData, TVariables = void>(
  endpoint: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE" = "POST",
  options?: ExtendedMutationOptions<TData, TVariables>,
): MutationHookResult<TData, TVariables> {
  const { requestOptions, ...mutationOptions } = options || {};

  return useMutation<TData, ApiError, TVariables>({
    mutationFn: (variables: TVariables) =>
      apiRequest<TData>(endpoint, {
        method,
        body: variables ? JSON.stringify(variables) : undefined,
        ...requestOptions,
      }),
    ...mutationOptions,
  });
}

/**
 * Universal API infinite query hook for paginated data
 */
export function useApiInfiniteQuery<
  TQueryFnData = unknown,
  TData = TQueryFnData,
>(
  queryKey: readonly unknown[],
  buildEndpoint: (pageParam: string | null) => string,
  options?: ExtendedInfiniteQueryOptions<TQueryFnData, TData>,
) {
  const { requestOptions, ...queryOptions } = options || {};

  return useInfiniteQuery<TQueryFnData, ApiError, TData>({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const endpoint = buildEndpoint(pageParam as string | null);
      const response = await fetch(endpoint, {
        headers: {
          "Content-Type": "application/json",
          ...requestOptions?.headers,
        },
        ...requestOptions,
      });

      const responseData = await response.json();

      if (!response.ok) {
        const error: ApiError = responseData.error || {
          status: response.status,
          message: response.statusText || "An error occurred",
        };
        throw error;
      }

      return responseData;
    },
    initialPageParam: null as string | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getNextPageParam: (lastPage: any) => {
      const nextCursor = lastPage?.next?.cursor;
      return nextCursor ? (nextCursor as string) : undefined;
    },
    ...queryOptions,
  });
}

/**
 * Hook to access the TanStack Query client
 */
export function useApiQueryClient(): QueryClient {
  return useQueryClient();
}
