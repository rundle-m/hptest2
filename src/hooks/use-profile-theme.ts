"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

// Storage key prefix for per-user settings
const STORAGE_KEY_PREFIX = "profile-theme-";

// 5 Color themes - each has primary, accent, gradient colors, and glow effects
export const COLOR_THEMES = {
  ocean: {
    name: "Ocean",
    primary: "#0ea5e9",
    accent: "#06b6d4",
    gradient: "from-sky-500 via-cyan-400 to-teal-400",
    gradientSubtle: "from-sky-500/20 via-cyan-400/10 to-teal-400/5",
    border: "border-sky-400/60",
    borderStrong: "border-sky-400",
    bg: "bg-sky-500/10",
    bgSubtle: "bg-sky-500/5",
    bgGradient: "bg-gradient-to-br from-sky-500/10 via-cyan-400/5 to-transparent",
    text: "text-sky-400",
    textDark: "text-sky-600",
    ring: "ring-sky-400/50",
    shadow: "shadow-sky-500/20",
    // Glow properties
    glow: "shadow-[0_0_20px_rgba(14,165,233,0.3)]",
    glowStrong: "shadow-[0_0_30px_rgba(14,165,233,0.4),0_0_60px_rgba(6,182,212,0.2)]",
    glowSubtle: "shadow-[0_0_15px_rgba(14,165,233,0.15)]",
    cardShadow: "shadow-[0_4px_20px_rgba(14,165,233,0.15),0_1px_3px_rgba(0,0,0,0.1)]",
  },
  sunset: {
    name: "Sunset",
    primary: "#f97316",
    accent: "#fb923c",
    gradient: "from-orange-500 via-amber-400 to-yellow-400",
    gradientSubtle: "from-orange-500/20 via-amber-400/10 to-yellow-400/5",
    border: "border-orange-400/60",
    borderStrong: "border-orange-400",
    bg: "bg-orange-500/10",
    bgSubtle: "bg-orange-500/5",
    bgGradient: "bg-gradient-to-br from-orange-500/10 via-amber-400/5 to-transparent",
    text: "text-orange-400",
    textDark: "text-orange-600",
    ring: "ring-orange-400/50",
    shadow: "shadow-orange-500/20",
    glow: "shadow-[0_0_20px_rgba(249,115,22,0.3)]",
    glowStrong: "shadow-[0_0_30px_rgba(249,115,22,0.4),0_0_60px_rgba(251,146,60,0.2)]",
    glowSubtle: "shadow-[0_0_15px_rgba(249,115,22,0.15)]",
    cardShadow: "shadow-[0_4px_20px_rgba(249,115,22,0.15),0_1px_3px_rgba(0,0,0,0.1)]",
  },
  forest: {
    name: "Forest",
    primary: "#22c55e",
    accent: "#4ade80",
    gradient: "from-green-500 via-emerald-400 to-teal-400",
    gradientSubtle: "from-green-500/20 via-emerald-400/10 to-teal-400/5",
    border: "border-green-400/60",
    borderStrong: "border-green-400",
    bg: "bg-green-500/10",
    bgSubtle: "bg-green-500/5",
    bgGradient: "bg-gradient-to-br from-green-500/10 via-emerald-400/5 to-transparent",
    text: "text-green-400",
    textDark: "text-green-600",
    ring: "ring-green-400/50",
    shadow: "shadow-green-500/20",
    glow: "shadow-[0_0_20px_rgba(34,197,94,0.3)]",
    glowStrong: "shadow-[0_0_30px_rgba(34,197,94,0.4),0_0_60px_rgba(74,222,128,0.2)]",
    glowSubtle: "shadow-[0_0_15px_rgba(34,197,94,0.15)]",
    cardShadow: "shadow-[0_4px_20px_rgba(34,197,94,0.15),0_1px_3px_rgba(0,0,0,0.1)]",
  },
  lavender: {
    name: "Lavender",
    primary: "#a855f7",
    accent: "#c084fc",
    gradient: "from-purple-500 via-violet-400 to-fuchsia-400",
    gradientSubtle: "from-purple-500/20 via-violet-400/10 to-fuchsia-400/5",
    border: "border-purple-400/60",
    borderStrong: "border-purple-400",
    bg: "bg-purple-500/10",
    bgSubtle: "bg-purple-500/5",
    bgGradient: "bg-gradient-to-br from-purple-500/10 via-violet-400/5 to-transparent",
    text: "text-purple-400",
    textDark: "text-purple-600",
    ring: "ring-purple-400/50",
    shadow: "shadow-purple-500/20",
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.3)]",
    glowStrong: "shadow-[0_0_30px_rgba(168,85,247,0.4),0_0_60px_rgba(192,132,252,0.2)]",
    glowSubtle: "shadow-[0_0_15px_rgba(168,85,247,0.15)]",
    cardShadow: "shadow-[0_4px_20px_rgba(168,85,247,0.15),0_1px_3px_rgba(0,0,0,0.1)]",
  },
  rose: {
    name: "Rose",
    primary: "#f43f5e",
    accent: "#fb7185",
    gradient: "from-rose-500 via-pink-400 to-fuchsia-400",
    gradientSubtle: "from-rose-500/20 via-pink-400/10 to-fuchsia-400/5",
    border: "border-rose-400/60",
    borderStrong: "border-rose-400",
    bg: "bg-rose-500/10",
    bgSubtle: "bg-rose-500/5",
    bgGradient: "bg-gradient-to-br from-rose-500/10 via-pink-400/5 to-transparent",
    text: "text-rose-400",
    textDark: "text-rose-600",
    ring: "ring-rose-400/50",
    shadow: "shadow-rose-500/20",
    glow: "shadow-[0_0_20px_rgba(244,63,94,0.3)]",
    glowStrong: "shadow-[0_0_30px_rgba(244,63,94,0.4),0_0_60px_rgba(251,113,133,0.2)]",
    glowSubtle: "shadow-[0_0_15px_rgba(244,63,94,0.15)]",
    cardShadow: "shadow-[0_4px_20px_rgba(244,63,94,0.15),0_1px_3px_rgba(0,0,0,0.1)]",
  },
} as const;

// 4 Font options
export const FONT_OPTIONS = {
  default: {
    name: "System",
    className: "font-sans",
    style: {},
  },
  serif: {
    name: "Elegant",
    className: "font-serif",
    style: {},
  },
  mono: {
    name: "Technical",
    className: "font-mono",
    style: {},
  },
  rounded: {
    name: "Friendly",
    className: "font-sans",
    style: { letterSpacing: "0.01em" },
  },
} as const;

export type ColorThemeKey = keyof typeof COLOR_THEMES;
export type FontKey = keyof typeof FONT_OPTIONS;
export type DisplayMode = "light" | "dark";

interface ThemeSettings {
  colorTheme: ColorThemeKey;
  font: FontKey;
  displayMode: DisplayMode;
}

const DEFAULT_SETTINGS: ThemeSettings = {
  colorTheme: "ocean",
  font: "default",
  displayMode: "dark",
};

export function useProfileTheme(fid: number | undefined) {
  const [settings, setSettings] = useState<ThemeSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
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
        setSettings({
          colorTheme: parsed.colorTheme || DEFAULT_SETTINGS.colorTheme,
          font: parsed.font || DEFAULT_SETTINGS.font,
          displayMode: parsed.displayMode || DEFAULT_SETTINGS.displayMode,
        });
      } catch {
        // Keep defaults
      }
    }

    setIsLoaded(true);
  }, [fid]);

  // Save settings to localStorage
  const saveSettings = useCallback(
    (newSettings: Partial<ThemeSettings>) => {
      if (!fid) return;

      const updated = { ...settings, ...newSettings };
      setSettings(updated);

      const storageKey = `${STORAGE_KEY_PREFIX}${fid}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
    },
    [fid, settings]
  );

  // Individual setters
  const setColorTheme = useCallback(
    (colorTheme: ColorThemeKey) => saveSettings({ colorTheme }),
    [saveSettings]
  );

  const setFont = useCallback(
    (font: FontKey) => saveSettings({ font }),
    [saveSettings]
  );

  const setDisplayMode = useCallback(
    (displayMode: DisplayMode) => saveSettings({ displayMode }),
    [saveSettings]
  );

  const toggleDisplayMode = useCallback(() => {
    saveSettings({ displayMode: settings.displayMode === "dark" ? "light" : "dark" });
  }, [saveSettings, settings.displayMode]);

  // Get current theme objects
  const currentColorTheme = useMemo(
    () => COLOR_THEMES[settings.colorTheme],
    [settings.colorTheme]
  );

  const currentFont = useMemo(
    () => FONT_OPTIONS[settings.font],
    [settings.font]
  );

  return {
    // Current settings
    colorTheme: settings.colorTheme,
    font: settings.font,
    displayMode: settings.displayMode,

    // Current theme objects
    currentColorTheme,
    currentFont,

    // Setters
    setColorTheme,
    setFont,
    setDisplayMode,
    toggleDisplayMode,

    // State
    isLoaded,

    // All options for UI
    colorThemes: COLOR_THEMES,
    fontOptions: FONT_OPTIONS,
  };
}
