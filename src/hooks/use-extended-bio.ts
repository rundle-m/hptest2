"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY_PREFIX = "extended-bio-";
const MAX_CHARACTERS = 3000; // ~500 words

export function useExtendedBio(fid: number | undefined) {
  const [extendedBio, setExtendedBioState] = useState<string>("");
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
        setExtendedBioState(parsed.bio || "");
      } catch {
        setExtendedBioState("");
      }
    }

    setIsLoaded(true);
  }, [fid]);

  // Save bio
  const setExtendedBio = useCallback(
    (bio: string) => {
      if (!fid) return;

      // Enforce character limit
      const trimmedBio = bio.slice(0, MAX_CHARACTERS);
      const storageKey = `${STORAGE_KEY_PREFIX}${fid}`;

      if (trimmedBio) {
        localStorage.setItem(storageKey, JSON.stringify({ bio: trimmedBio }));
      } else {
        localStorage.removeItem(storageKey);
      }

      setExtendedBioState(trimmedBio);
    },
    [fid]
  );

  // Clear bio
  const clearExtendedBio = useCallback(() => {
    setExtendedBio("");
  }, [setExtendedBio]);

  return {
    extendedBio,
    setExtendedBio,
    clearExtendedBio,
    hasExtendedBio: Boolean(extendedBio),
    characterCount: extendedBio.length,
    maxCharacters: MAX_CHARACTERS,
    isLoaded,
  };
}
