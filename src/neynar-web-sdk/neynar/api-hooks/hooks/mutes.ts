/**
 * Neynar Mutes API Hooks
 *
 * React Query hooks for Neynar mute-related operations.
 * Uses TanStack Query v5 with proper error handling and type safety.
 * Provides functionality for managing user mutes and retrieving mute lists.
 */

import {
  useApiMutation,
  useApiQueryClient,
  useApiInfiniteQuery,
  STALE_TIME,
  type ExtendedMutationOptions,
  type InfiniteQueryHookOptions,
  type MutationHookResult,
} from "../../../private/api-hooks";
import type { UseInfiniteQueryResult } from "@tanstack/react-query";
import type { ApiError } from "../../../private/api-hooks/types";
import { neynarQueryKeys } from "../query-keys";
import { buildNeynarQuery } from "../helpers";
import type {
  MuteListResponse,
  MuteRecord,
  MuteReqBody,
  MuteResponse,
} from "../sdk-response-types";

// ============================================================================
// Mute Query Hooks
// ============================================================================

/**
 * Parameters for {@link useMuteList}
 */
type UseMuteListParams = {
  /** The user's FID (identifier) */
  fid: number;
  /** Enables experimental features including filtering based on the Neynar score */
  x_neynar_experimental?: boolean;
  /** Number of results to fetch (Default: 20, Maximum: 100) */
  limit?: number;
};

/**
 * Fetches all FIDs that a user has muted
 */
export function useMuteList(
  params: UseMuteListParams,
  options?: InfiniteQueryHookOptions<MuteListResponse, MuteRecord[]>,
): UseInfiniteQueryResult<MuteRecord[], ApiError> {
  return useApiInfiniteQuery<MuteListResponse, MuteRecord[]>(
    neynarQueryKeys.mutes.list(params),
    (cursor) => {
      const queryParams = buildNeynarQuery(
        { ...params },
        { cursor, limit: params.limit ?? 20 },
      );
      return `/api/neynar/mutes?${queryParams}`;
    },
    {
      enabled: params.fid > 0,
      staleTime: STALE_TIME.NORMAL,
      ...options,
      select: (data) =>
        data.pages.flatMap((page: MuteListResponse) => page.mutes || []),
    },
  );
}

// ============================================================================
// Mute Mutation Hooks
// ============================================================================

/**
 * Adds a mute for a given FID
 * **IMPORTANT**: This is an allowlisted API. Reach out to Neynar if you need access.
 */
export function useMuteUser(
  options?: ExtendedMutationOptions<MuteResponse, MuteReqBody>,
): MutationHookResult<MuteResponse, MuteReqBody> {
  const queryClient = useApiQueryClient();

  return useApiMutation<MuteResponse, MuteReqBody>(
    "/api/neynar/mutes",
    "POST",
    {
      onSuccess: (_data, _variables) => {
        queryClient.invalidateQueries({ queryKey: neynarQueryKeys.mutes.all() });
        queryClient.invalidateQueries({ queryKey: neynarQueryKeys.feeds.all() });
        queryClient.invalidateQueries({ queryKey: neynarQueryKeys.users.all() });
      },
      ...options,
    },
  );
}

/**
 * Deletes a mute for a given FID
 * **IMPORTANT**: This is an allowlisted API. Reach out to Neynar if you need access.
 */
export function useUnmuteUser(
  options?: ExtendedMutationOptions<MuteResponse, MuteReqBody>,
): MutationHookResult<MuteResponse, MuteReqBody> {
  const queryClient = useApiQueryClient();

  return useApiMutation<MuteResponse, MuteReqBody>(
    "/api/neynar/mutes",
    "DELETE",
    {
      onSuccess: (_data, _variables) => {
        queryClient.invalidateQueries({ queryKey: neynarQueryKeys.mutes.all() });
        queryClient.invalidateQueries({ queryKey: neynarQueryKeys.feeds.all() });
        queryClient.invalidateQueries({ queryKey: neynarQueryKeys.users.all() });
      },
      ...options,
    },
  );
}
