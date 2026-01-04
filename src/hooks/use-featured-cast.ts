"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY_PREFIX = "featured-cast-";

export function useFeaturedCast(fid: number | undefined) {
  const [featuredCastHash, setFeaturedCastHash] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (!fid) {
      setIsLoaded(true);
      return;
    }

    const storageKey = `${STORAGE_KEY_PREFIX}${fid}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFeaturedCastHash(parsed.hash || null);
      } catch {
        setFeaturedCastHash(null);
      }
    }

    setIsLoaded(true);
  }, [fid]);

  // Save selection
  const setFeaturedCast = useCallback(
    (hash: string | null) => {
      if (!fid) return;

      const storageKey = `${STORAGE_KEY_PREFIX}${fid}`;

      if (hash) {
        localStorage.setItem(storageKey, JSON.stringify({ hash }));
      } else {
        localStorage.removeItem(storageKey);
      }

      setFeaturedCastHash(hash);
    },
    [fid]
  );

  // Clear selection
  const clearFeaturedCast = useCallback(() => {
    setFeaturedCast(null);
  }, [setFeaturedCast]);

  return {
    featuredCastHash,
    setFeaturedCast,
    clearFeaturedCast,
    hasCustomSelection: Boolean(featuredCastHash),
    isLoaded,
  };
}
