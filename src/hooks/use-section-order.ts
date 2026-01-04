"use client";

import { useState, useEffect, useCallback } from "react";

// Storage key prefix for per-user section order settings
const STORAGE_KEY_PREFIX = "profile-section-order-";

// Available sections
export const SECTIONS = {
  about: { id: "about", labelKey: "aboutMe" },
  nfts: { id: "nfts", labelKey: "featuredNFTsTitle" },
  holdings: { id: "holdings", labelKey: "topHoldings" },
  cast: { id: "cast", labelKey: "topCast" },
  projects: { id: "projects", labelKey: "myProjects" },
} as const;

export type SectionId = keyof typeof SECTIONS;

// Default section order
const DEFAULT_ORDER: SectionId[] = ["about", "nfts", "holdings", "cast", "projects"];

export function useSectionOrder(fid: number | undefined) {
  const [sectionOrder, setSectionOrderState] = useState<SectionId[]>(DEFAULT_ORDER);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load section order from localStorage on mount
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
        if (Array.isArray(parsed) && parsed.every((id) => id in SECTIONS)) {
          // Ensure all sections are present (in case new sections were added)
          const fullOrder = [...parsed];
          for (const id of DEFAULT_ORDER) {
            if (!fullOrder.includes(id)) {
              fullOrder.push(id);
            }
          }
          setSectionOrderState(fullOrder as SectionId[]);
        }
      } catch {
        // Invalid JSON, use default
      }
    }

    setIsLoaded(true);
  }, [fid]);

  // Save section order to localStorage
  const saveSectionOrder = useCallback(
    (newOrder: SectionId[]) => {
      if (!fid) return;

      setSectionOrderState(newOrder);
      const storageKey = `${STORAGE_KEY_PREFIX}${fid}`;
      localStorage.setItem(storageKey, JSON.stringify(newOrder));
    },
    [fid]
  );

  // Move a section up in the order
  const moveSectionUp = useCallback(
    (sectionId: SectionId) => {
      const currentIndex = sectionOrder.indexOf(sectionId);
      if (currentIndex <= 0) return;

      const newOrder = [...sectionOrder];
      [newOrder[currentIndex - 1], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[currentIndex - 1]];
      saveSectionOrder(newOrder);
    },
    [sectionOrder, saveSectionOrder]
  );

  // Move a section down in the order
  const moveSectionDown = useCallback(
    (sectionId: SectionId) => {
      const currentIndex = sectionOrder.indexOf(sectionId);
      if (currentIndex === -1 || currentIndex >= sectionOrder.length - 1) return;

      const newOrder = [...sectionOrder];
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
      saveSectionOrder(newOrder);
    },
    [sectionOrder, saveSectionOrder]
  );

  // Reset to default order
  const resetOrder = useCallback(() => {
    saveSectionOrder(DEFAULT_ORDER);
  }, [saveSectionOrder]);

  return {
    sectionOrder,
    setSectionOrder: saveSectionOrder,
    moveSectionUp,
    moveSectionDown,
    resetOrder,
    isLoaded,
    sections: SECTIONS,
  };
}
