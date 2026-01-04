"use client";

import { useMemo, useEffect } from "react";
import { useCastsByUser } from "@/neynar-web-sdk/neynar";

export interface TopCast {
  hash: string;
  text: string;
  timestamp: string;
  likes: number;
  recasts: number;
  replies: number;
  totalEngagement: number;
}

export function useTopCast(fid: number | undefined) {
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useCastsByUser(
    fid || 0,
    {
      limit: 150, // Max limit per page - fetch as many as possible
      include_replies: false, // Only original casts, not replies
    },
    { enabled: Boolean(fid) }
  );

  // Auto-fetch additional pages to cover ~6 months of casts
  // Most users post 1-5 casts per day, so 150 * 3 = 450 casts covers ~3-6 months
  useEffect(() => {
    if (!isLoading && !isFetchingNextPage && hasNextPage && data?.pages) {
      const totalCasts = data.pages.flatMap((page) => page.items).length;
      // Fetch up to 3 pages (450 casts max) to balance coverage vs speed
      if (totalCasts < 450) {
        fetchNextPage();
      }
    }
  }, [isLoading, isFetchingNextPage, hasNextPage, data?.pages, fetchNextPage]);

  // Find the cast with the most engagement (likes + recasts + replies)
  const topCast = useMemo<TopCast | null>(() => {
    if (!data?.pages) return null;

    const casts = data.pages.flatMap((page) => page.items) || [];

    if (casts.length === 0) return null;

    // Sort by total engagement and get the top one
    const sorted = [...casts].sort((a, b) => {
      const aEngagement =
        (a.reactions?.likes_count || 0) +
        (a.reactions?.recasts_count || 0) +
        (a.replies?.count || 0);
      const bEngagement =
        (b.reactions?.likes_count || 0) +
        (b.reactions?.recasts_count || 0) +
        (b.replies?.count || 0);
      return bEngagement - aEngagement;
    });

    const best = sorted[0];

    // Only return if it has some engagement
    const totalEngagement =
      (best.reactions?.likes_count || 0) +
      (best.reactions?.recasts_count || 0) +
      (best.replies?.count || 0);

    if (totalEngagement === 0) return null;

    return {
      hash: best.hash,
      text: best.text,
      timestamp: best.timestamp,
      likes: best.reactions?.likes_count || 0,
      recasts: best.reactions?.recasts_count || 0,
      replies: best.replies?.count || 0,
      totalEngagement,
    };
  }, [data]);

  // Consider loading if still fetching initial or additional pages
  const stillLoading = isLoading || (isFetchingNextPage && data?.pages && data.pages.flatMap(p => p.items).length < 300);

  return {
    topCast,
    isLoading: stillLoading,
    error,
  };
}
