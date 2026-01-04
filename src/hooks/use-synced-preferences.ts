"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { loadPreferences, updatePreferences } from "@/app/actions/preferences";
import type { UserPreferences } from "@/lib/kv";
import type { ColorThemeKey, FontKey, DisplayMode } from "@/hooks/use-profile-theme";
import type { LanguageKey } from "@/hooks/use-language";
import type { SectionId } from "@/hooks/use-section-order";
import type { Project } from "@/features/app/types";

// Default values
const DEFAULT_PREFERENCES: Required<UserPreferences> = {
  colorTheme: "ocean",
  font: "default",
  displayMode: "dark",
  language: "en",
  extendedBio: "",
  featuredNftIds: [],
  featuredCastHash: null,
  projects: [],
  sectionOrder: ["about", "nfts", "holdings", "cast", "projects"],
  updatedAt: "",
};

/**
 * Unified preferences hook that syncs with Vercel KV for minted users
 *
 * Behavior:
 * - Non-minted users: Preferences stored in memory only (lost on refresh)
 * - Minted users: Preferences synced to KV (persists across devices)
 *
 * This replaces the individual hooks for theme, language, bio, etc.
 * when cross-device sync is needed.
 */
export function useSyncedPreferences(fid: number | undefined, isMinted: boolean) {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Track pending saves to debounce
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<Partial<UserPreferences>>({});

  // Load preferences on mount
  useEffect(() => {
    if (!fid) {
      setIsLoading(false);
      setIsLoaded(true);
      return;
    }

    const load = async () => {
      if (isMinted) {
        // Minted user: Load from KV
        try {
          const result = await loadPreferences(fid);
          if (result.preferences) {
            setPreferences({ ...DEFAULT_PREFERENCES, ...result.preferences });
          }
        } catch (error) {
          console.error("[useSyncedPreferences] Failed to load:", error);
        }
      }
      // Non-minted users start with defaults (in-memory only)
      setIsLoading(false);
      setIsLoaded(true);
    };

    load();
  }, [fid, isMinted]);

  // Debounced save to KV
  const saveToKV = useCallback(async () => {
    if (!fid || !isMinted) return;

    const updates = pendingUpdatesRef.current;
    if (Object.keys(updates).length === 0) return;

    try {
      await updatePreferences(fid, updates);
      pendingUpdatesRef.current = {};
    } catch (error) {
      console.error("[useSyncedPreferences] Failed to save:", error);
    }
  }, [fid, isMinted]);

  // Update a single preference
  const updatePreference = useCallback(
    <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
      // Update local state immediately
      setPreferences((prev) => ({ ...prev, [key]: value }));

      // Queue for KV save (minted users only)
      if (isMinted && fid) {
        pendingUpdatesRef.current[key] = value;

        // Debounce saves
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(saveToKV, 500);
      }
    },
    [fid, isMinted, saveToKV]
  );

  // Individual setters for compatibility with existing code
  const setColorTheme = useCallback(
    (theme: ColorThemeKey) => updatePreference("colorTheme", theme),
    [updatePreference]
  );

  const setFont = useCallback(
    (font: FontKey) => updatePreference("font", font),
    [updatePreference]
  );

  const setDisplayMode = useCallback(
    (mode: DisplayMode) => updatePreference("displayMode", mode),
    [updatePreference]
  );

  const toggleDisplayMode = useCallback(() => {
    setPreferences((prev) => {
      const newMode = prev.displayMode === "dark" ? "light" : "dark";
      updatePreference("displayMode", newMode);
      return { ...prev, displayMode: newMode };
    });
  }, [updatePreference]);

  const setLanguage = useCallback(
    (language: LanguageKey) => updatePreference("language", language),
    [updatePreference]
  );

  const setExtendedBio = useCallback(
    (bio: string) => updatePreference("extendedBio", bio),
    [updatePreference]
  );

  const setFeaturedNftIds = useCallback(
    (ids: string[]) => updatePreference("featuredNftIds", ids),
    [updatePreference]
  );

  const setFeaturedCastHash = useCallback(
    (hash: string | null) => updatePreference("featuredCastHash", hash),
    [updatePreference]
  );

  const setProjects = useCallback(
    (projects: Project[]) => updatePreference("projects", projects),
    [updatePreference]
  );

  const setSectionOrder = useCallback(
    (order: SectionId[]) => updatePreference("sectionOrder", order),
    [updatePreference]
  );

  // Project management helpers
  const addProject = useCallback(
    (project: Omit<Project, "id">): boolean => {
      const currentProjects = preferences.projects || [];
      if (currentProjects.length >= 5) return false;

      const newProject: Project = {
        ...project,
        id: `project-${Date.now()}`,
      };

      setProjects([...currentProjects, newProject]);
      return true;
    },
    [preferences.projects, setProjects]
  );

  const updateProject = useCallback(
    (id: string, updates: Partial<Omit<Project, "id">>) => {
      const currentProjects = preferences.projects || [];
      const updatedProjects = currentProjects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      );
      setProjects(updatedProjects);
    },
    [preferences.projects, setProjects]
  );

  const removeProject = useCallback(
    (id: string) => {
      const currentProjects = preferences.projects || [];
      setProjects(currentProjects.filter((p) => p.id !== id));
    },
    [preferences.projects, setProjects]
  );

  // Featured NFT management helpers
  const toggleFeaturedNft = useCallback(
    (nftId: string) => {
      const currentIds = preferences.featuredNftIds || [];
      if (currentIds.includes(nftId)) {
        setFeaturedNftIds(currentIds.filter((id) => id !== nftId));
      } else if (currentIds.length < 6) {
        setFeaturedNftIds([...currentIds, nftId]);
      }
    },
    [preferences.featuredNftIds, setFeaturedNftIds]
  );

  const isNftFeatured = useCallback(
    (nftId: string) => (preferences.featuredNftIds || []).includes(nftId),
    [preferences.featuredNftIds]
  );

  // Section order helpers
  const moveSectionUp = useCallback(
    (sectionId: SectionId) => {
      const order = preferences.sectionOrder || DEFAULT_PREFERENCES.sectionOrder;
      const index = order.indexOf(sectionId);
      if (index <= 0) return;

      const newOrder = [...order];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      setSectionOrder(newOrder as SectionId[]);
    },
    [preferences.sectionOrder, setSectionOrder]
  );

  const moveSectionDown = useCallback(
    (sectionId: SectionId) => {
      const order = preferences.sectionOrder || DEFAULT_PREFERENCES.sectionOrder;
      const index = order.indexOf(sectionId);
      if (index === -1 || index >= order.length - 1) return;

      const newOrder = [...order];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      setSectionOrder(newOrder as SectionId[]);
    },
    [preferences.sectionOrder, setSectionOrder]
  );

  const resetSectionOrder = useCallback(() => {
    setSectionOrder(DEFAULT_PREFERENCES.sectionOrder as SectionId[]);
  }, [setSectionOrder]);

  return {
    // Raw preferences
    preferences,

    // Loading state
    isLoading,
    isLoaded,

    // Theme
    colorTheme: (preferences.colorTheme || "ocean") as ColorThemeKey,
    font: (preferences.font || "default") as FontKey,
    displayMode: (preferences.displayMode || "dark") as DisplayMode,
    setColorTheme,
    setFont,
    setDisplayMode,
    toggleDisplayMode,

    // Language
    language: (preferences.language || "en") as LanguageKey,
    setLanguage,

    // Extended bio
    extendedBio: preferences.extendedBio || "",
    setExtendedBio,
    hasExtendedBio: Boolean(preferences.extendedBio),

    // Featured NFTs
    featuredNftIds: preferences.featuredNftIds || [],
    setFeaturedNftIds,
    toggleFeaturedNft,
    isNftFeatured,
    canAddMoreNfts: (preferences.featuredNftIds || []).length < 6,
    featuredNftCount: (preferences.featuredNftIds || []).length,
    maxFeaturedNfts: 6,

    // Featured cast
    featuredCastHash: preferences.featuredCastHash || null,
    setFeaturedCastHash,
    hasCustomCast: Boolean(preferences.featuredCastHash),

    // Projects
    projects: (preferences.projects || []) as Project[],
    addProject,
    updateProject,
    removeProject,
    canAddMoreProjects: (preferences.projects || []).length < 5,
    maxProjects: 5,

    // Section order
    sectionOrder: (preferences.sectionOrder || DEFAULT_PREFERENCES.sectionOrder) as SectionId[],
    moveSectionUp,
    moveSectionDown,
    resetSectionOrder,
  };
}
