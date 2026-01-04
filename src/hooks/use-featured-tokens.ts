"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "featured-token-symbols";
const MAX_FEATURED = 5;

export function useFeaturedTokens(userFid: number | undefined) {
  const [featuredSymbols, setFeaturedSymbols] = useState<string[]>([]);
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
          setFeaturedSymbols(parsed);
        }
      } catch {
        // Invalid stored data, ignore
      }
    }
    setIsLoaded(true);
  }, [userFid]);

  // Save to local storage whenever featuredSymbols changes
  useEffect(() => {
    if (!userFid || !isLoaded) return;

    const storageKey = `${STORAGE_KEY}-${userFid}`;
    localStorage.setItem(storageKey, JSON.stringify(featuredSymbols));
  }, [featuredSymbols, userFid, isLoaded]);

  const toggleFeatured = useCallback((symbol: string) => {
    setFeaturedSymbols((current) => {
      if (current.includes(symbol)) {
        // Remove from featured
        return current.filter((s) => s !== symbol);
      } else if (current.length < MAX_FEATURED) {
        // Add to featured (if under limit)
        return [...current, symbol];
      }
      return current;
    });
  }, []);

  const clearFeatured = useCallback(() => {
    setFeaturedSymbols([]);
  }, []);

  const isFeatured = useCallback(
    (symbol: string) => featuredSymbols.includes(symbol),
    [featuredSymbols]
  );

  const canAddMore = featuredSymbols.length < MAX_FEATURED;

  return {
    featuredSymbols,
    toggleFeatured,
    clearFeatured,
    isFeatured,
    canAddMore,
    featuredCount: featuredSymbols.length,
    maxFeatured: MAX_FEATURED,
    isLoaded,
  };
}
