"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "featured-nft-ids";
const MAX_FEATURED = 6;

export function useFeaturedNFTs(userFid: number | undefined) {
  const [featuredIds, setFeaturedIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    if (!userFid) return;

    const storageKey = `${STORAGE_KEY}-${userFid}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFeaturedIds(parsed);
        }
      } catch {
        // Invalid stored data, ignore
      }
    }
    setIsLoaded(true);
  }, [userFid]);

  // Save to local storage whenever featuredIds changes
  useEffect(() => {
    if (!userFid || !isLoaded) return;

    const storageKey = `${STORAGE_KEY}-${userFid}`;
    localStorage.setItem(storageKey, JSON.stringify(featuredIds));
  }, [featuredIds, userFid, isLoaded]);

  const toggleFeatured = useCallback((nftId: string) => {
    setFeaturedIds((current) => {
      if (current.includes(nftId)) {
        // Remove from featured
        return current.filter((id) => id !== nftId);
      } else if (current.length < MAX_FEATURED) {
        // Add to featured (if under limit)
        return [...current, nftId];
      }
      return current;
    });
  }, []);

  const clearFeatured = useCallback(() => {
    setFeaturedIds([]);
  }, []);

  const isFeatured = useCallback(
    (nftId: string) => featuredIds.includes(nftId),
    [featuredIds]
  );

  const canAddMore = featuredIds.length < MAX_FEATURED;

  return {
    featuredIds,
    toggleFeatured,
    clearFeatured,
    isFeatured,
    canAddMore,
    featuredCount: featuredIds.length,
    maxFeatured: MAX_FEATURED,
    isLoaded,
  };
}
