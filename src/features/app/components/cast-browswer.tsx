"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { StandardMiniLayout } from "@/neynar-farcaster-sdk/mini";
import { P, H3, Skeleton } from "@neynar/ui";
import { ArrowLeft, Heart, Repeat2, MessageCircle, Check, Loader2, TrendingUp, Calendar, Search } from "lucide-react";
import { useCastsByUser } from "@/neynar-web-sdk/neynar";
import { COLOR_THEMES, type ColorThemeKey, type DisplayMode } from "@/hooks/use-profile-theme";

// Default translation function (English fallback)
const defaultT = (key: string) => key;

// Timeframe options
type TimeframeOption = "6months" | "12months" | "24months" | "older" | null;

const TIMEFRAME_LABELS: Record<Exclude<TimeframeOption, null>, string> = {
  "6months": "Last 6 months",
  "12months": "6-12 months ago",
  "24months": "12-24 months ago",
  "older": "24+ months ago",
};

interface CastBrowserProps {
  fid: number;
  selectedCastHash: string | null;
  onSelectCast: (hash: string) => void;
  onClose: () => void;
  t?: (key: string) => string;
  colorTheme?: ColorThemeKey;
  displayMode?: DisplayMode;
}

interface CastItem {
  hash: string;
  text: string;
  timestamp: string;
  likes: number;
  recasts: number;
  replies: number;
  totalEngagement: number;
}

export function CastBrowser({
  fid,
  selectedCastHash,
  onSelectCast,
  onClose,
  t = defaultT,
  colorTheme = "ocean",
  displayMode = "dark",
}: CastBrowserProps) {
  // Start with no timeframe selected - user must choose first
  const [timeframe, setTimeframe] = useState<TimeframeOption>(null);
  const [searchStarted, setSearchStarted] = useState(false);

  // Track which timeframes we've already loaded enough data for (for instant switching)
  const [reachedTimeframes, setReachedTimeframes] = useState<Set<Exclude<TimeframeOption, null>>>(new Set());

  // Only enable fetching after a timeframe is selected
  // Using max limit of 150 per page (API limit) to fetch as fast as possible
  // Once started, keep fetching enabled to preserve cache
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useCastsByUser(
    fid,
    {
      limit: 150,
      include_replies: false,
    },
    { enabled: Boolean(fid) && searchStarted }
  );

  // Get theme
  const theme = COLOR_THEMES[colorTheme];
  const isDark = displayMode === "dark";

  // Theme-aware styles
  const bgClass = isDark ? "bg-zinc-950" : "bg-gray-50";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const mutedTextClass = isDark ? "text-zinc-400" : "text-gray-600";
  const cardBg = isDark ? "bg-zinc-900/90" : "bg-white";
  const cardBorder = isDark ? "border-white/10" : "border-gray-200";
  const themeText = isDark ? theme.text : theme.textDark;
  const cardGlow = isDark ? theme.cardShadow : "";
  const glowSubtle = isDark ? theme.glowSubtle : "";

  // Calculate date boundaries for timeframes
  const dateBoundaries = useMemo(() => {
    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const twentyFourMonthsAgo = new Date(now);
    twentyFourMonthsAgo.setMonth(twentyFourMonthsAgo.getMonth() - 24);
    return { now, sixMonthsAgo, twelveMonthsAgo, twentyFourMonthsAgo };
  }, []);

  // Check the oldest cast we've fetched and if we've reached the target timeframe
  const { oldestCastDate, hasReachedTargetTimeframe, castsInTimeframe, originalCastsInTimeframe } = useMemo(() => {
    if (!data?.pages || !timeframe) return { oldestCastDate: null, hasReachedTargetTimeframe: false, castsInTimeframe: 0, originalCastsInTimeframe: 0 };

    const allCasts = data.pages.flatMap((page) => page.items) || [];
    if (allCasts.length === 0) return { oldestCastDate: null, hasReachedTargetTimeframe: false, castsInTimeframe: 0, originalCastsInTimeframe: 0 };

    const { sixMonthsAgo, twelveMonthsAgo, twentyFourMonthsAgo } = dateBoundaries;

    // Find the oldest cast
    const oldestCast = allCasts.reduce((oldest, cast) => {
      const castDate = new Date(cast.timestamp);
      return castDate < oldest ? castDate : oldest;
    }, new Date());

    // Count ORIGINAL casts (non-replies) with engagement in the selected timeframe
    const originalCastsInRange = allCasts.filter((cast) => {
      // Must be an original cast (not a reply)
      if (cast.parent_hash) return false;

      // Must have engagement
      const engagement = (cast.reactions?.likes_count || 0) + (cast.reactions?.recasts_count || 0) + (cast.replies?.count || 0);
      if (engagement <= 0) return false;

      const castDate = new Date(cast.timestamp);
      switch (timeframe) {
        case "6months":
          return castDate >= sixMonthsAgo;
        case "12months":
          return castDate >= twelveMonthsAgo && castDate < sixMonthsAgo;
        case "24months":
          return castDate >= twentyFourMonthsAgo && castDate < twelveMonthsAgo;
        case "older":
          return castDate < twentyFourMonthsAgo;
        default:
          return false;
      }
    }).length;

    // Count all casts in range (for progress tracking)
    const castsInRange = allCasts.filter((cast) => {
      const castDate = new Date(cast.timestamp);
      switch (timeframe) {
        case "6months":
          return castDate >= sixMonthsAgo;
        case "12months":
          return castDate >= twelveMonthsAgo && castDate < sixMonthsAgo;
        case "24months":
          return castDate >= twentyFourMonthsAgo && castDate < twelveMonthsAgo;
        case "older":
          return castDate < twentyFourMonthsAgo;
        default:
          return false;
      }
    }).length;

    // Determine if we've reached the target timeframe
    // For older ranges, we need to have actually found some original casts, not just reached the date
    let hasReached = false;
    switch (timeframe) {
      case "6months":
        // For recent casts, we've reached target if we have some casts or oldest is beyond 6 months
        hasReached = originalCastsInRange >= 10 || oldestCast < sixMonthsAgo;
        break;
      case "12months":
        // For 6-12 month range, we need to get past 6 months and have found some original casts
        hasReached = oldestCast < twelveMonthsAgo || (originalCastsInRange >= 10 && oldestCast < sixMonthsAgo);
        break;
      case "24months":
        // For 12-24 month range, we need to get past 12 months and have found some original casts
        hasReached = oldestCast < twentyFourMonthsAgo || (originalCastsInRange >= 15 && oldestCast < twelveMonthsAgo);
        break;
      case "older":
        // For 24+ months, we need to get past 24 months AND find enough original casts
        // Keep searching until we find at least 15 original casts or exhaust the history
        hasReached = oldestCast < twentyFourMonthsAgo && originalCastsInRange >= 15;
        break;
    }

    return { oldestCastDate: oldestCast, hasReachedTargetTimeframe: hasReached, castsInTimeframe: castsInRange, originalCastsInTimeframe: originalCastsInRange };
  }, [data, timeframe, dateBoundaries]);

  // Update reached timeframes when we've loaded enough data for a timeframe
  useEffect(() => {
    if (timeframe && hasReachedTargetTimeframe && !reachedTimeframes.has(timeframe)) {
      setReachedTimeframes(prev => new Set([...prev, timeframe]));
    }
  }, [timeframe, hasReachedTargetTimeframe, reachedTimeframes]);

  // Check if we already have enough cached data for a timeframe
  const hasDataForTimeframe = useCallback((tf: Exclude<TimeframeOption, null>): boolean => {
    return reachedTimeframes.has(tf);
  }, [reachedTimeframes]);

  // Handle timeframe selection - starts the search or switches instantly if cached
  const handleTimeframeSelect = useCallback((selected: Exclude<TimeframeOption, null>) => {
    setTimeframe(selected);
    if (!searchStarted) {
      setSearchStarted(true);
    }
    // If we already have data for this timeframe, it will show instantly
  }, [searchStarted]);

  // Auto-fetch more pages until we reach the target timeframe
  useEffect(() => {
    if (!searchStarted || !timeframe) return;
    if (!isLoading && !isFetchingNextPage && hasNextPage && data?.pages) {
      const totalCasts = data.pages.flatMap((page) => page.items).length;

      // Keep fetching until we've reached the target timeframe or hit safety cap
      // Increased caps to dig deeper into cast history
      const safetyCap = timeframe === "older" ? 20000 : timeframe === "24months" ? 15000 : timeframe === "12months" ? 8000 : 3000;
      const shouldFetchMore = !hasReachedTargetTimeframe && totalCasts < safetyCap;

      if (shouldFetchMore) {
        fetchNextPage();
      }
    }
  }, [searchStarted, timeframe, isLoading, isFetchingNextPage, hasNextPage, data?.pages, fetchNextPage, hasReachedTargetTimeframe]);

  // Process and sort casts by engagement, filtered by timeframe
  const sortedCasts = useMemo<CastItem[]>(() => {
    if (!data?.pages || !timeframe) return [];

    const casts = data.pages.flatMap((page) => page.items) || [];
    const { sixMonthsAgo, twelveMonthsAgo, twentyFourMonthsAgo } = dateBoundaries;

    return casts
      // First filter out replies (casts with parent_hash are replies)
      .filter((cast) => !cast.parent_hash)
      .map((cast) => ({
        hash: cast.hash,
        text: cast.text,
        timestamp: cast.timestamp,
        likes: cast.reactions?.likes_count || 0,
        recasts: cast.reactions?.recasts_count || 0,
        replies: cast.replies?.count || 0,
        totalEngagement:
          (cast.reactions?.likes_count || 0) +
          (cast.reactions?.recasts_count || 0) +
          (cast.replies?.count || 0),
      }))
      .filter((cast) => {
        // Filter by engagement
        if (cast.totalEngagement <= 0) return false;

        // Filter by timeframe
        const castDate = new Date(cast.timestamp);
        switch (timeframe) {
          case "6months":
            return castDate >= sixMonthsAgo;
          case "12months":
            return castDate >= twelveMonthsAgo && castDate < sixMonthsAgo;
          case "24months":
            return castDate >= twentyFourMonthsAgo && castDate < twelveMonthsAgo;
          case "older":
            return castDate < twentyFourMonthsAgo;
          default:
            return true;
        }
      })
      .sort((a, b) => b.totalEngagement - a.totalEngagement)
      .slice(0, 50); // Show top 50 most engaged casts
  }, [data, timeframe, dateBoundaries]);

  const totalCastsFetched = data?.pages?.flatMap((p) => p.items).length || 0;
  const isSearching = searchStarted && (isLoading || isFetchingNextPage || (!hasReachedTargetTimeframe && hasNextPage));

  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t("today");
    if (diffDays === 1) return t("yesterday");
    if (diffDays < 7) return `${diffDays} ${t("daysAgo")}`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} ${t("weeksAgo")}`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} ${t("monthsAgo")}`;
    return `${Math.floor(diffDays / 365)} ${t("yearsAgo")}`;
  };

  return (
    <StandardMiniLayout>
      <div className={`min-h-screen ${bgClass}`}>
        {/* Themed header banner */}
        <div className={`relative h-20 bg-gradient-to-br ${theme.gradient} overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent gradient-border-animated" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.2),transparent_40%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <div className="px-4 pb-6 space-y-4 -mt-6">
          {/* Header card */}
          <div className={`relative rounded-2xl overflow-hidden ${cardGlow}`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} p-[1.5px] rounded-2xl`}>
              <div className={`w-full h-full ${cardBg} rounded-[14.5px] inner-glow`} />
            </div>
            <div className="relative p-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className={`p-2 rounded-xl ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                >
                  <ArrowLeft className={`w-5 h-5 ${textClass}`} />
                </button>
                <div className="flex-1">
                  <H3 className={`text-lg font-semibold ${textClass}`}>{t("chooseCast")}</H3>
                  <P className={`text-sm ${mutedTextClass}`}>
                    {t("selectCastFeature")}
                  </P>
                </div>
                <div className={`p-2 rounded-xl bg-gradient-to-br ${theme.gradient}`}>
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Initial state - no timeframe selected yet */}
          {!searchStarted && (
            <div className={`relative rounded-2xl overflow-hidden ${cardGlow}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} p-[1.5px] rounded-2xl`}>
                <div className={`w-full h-full ${cardBg} rounded-[14.5px] inner-glow`} />
              </div>
              <div className="relative p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${theme.gradient}`}>
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <P className={`font-semibold ${textClass}`}>Choose a time period</P>
                    <P className={`text-sm ${mutedTextClass}`}>Select when to search for your top casts</P>
                  </div>
                </div>

                <div className="space-y-2">
                  {(["6months", "12months", "24months", "older"] as Exclude<TimeframeOption, null>[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => handleTimeframeSelect(option)}
                      className={`w-full p-4 rounded-xl text-left transition-all ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'} border ${isDark ? 'border-white/10' : 'border-gray-200'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <P className={`font-medium ${textClass}`}>{TIMEFRAME_LABELS[option]}</P>
                          <P className={`text-xs ${mutedTextClass} mt-0.5`}>
                            {option === "6months" && "Recent casts with engagement"}
                            {option === "12months" && "Casts from 6-12 months ago"}
                            {option === "24months" && "Casts from 12-24 months ago"}
                            {option === "older" && "Your oldest viral casts"}
                          </P>
                        </div>
                        <Search className={`w-4 h-4 ${mutedTextClass}`} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Search in progress */}
          {isSearching && (
            <div className={`relative rounded-xl overflow-hidden ${cardGlow}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} p-[1px] rounded-xl`}>
                <div className={`w-full h-full ${cardBg} rounded-[11px]`} />
              </div>
              <div className="relative p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${theme.bg}`}>
                    <Loader2 className={`w-4 h-4 animate-spin ${themeText}`} />
                  </div>
                  <div className="flex-1">
                    <P className={`text-sm font-medium ${textClass}`}>
                      Searching {timeframe && TIMEFRAME_LABELS[timeframe].toLowerCase()}...
                    </P>
                    <P className={`text-xs ${mutedTextClass} mt-0.5`}>
                      {totalCastsFetched} casts searched
                      {originalCastsInTimeframe > 0 && ` • Found ${originalCastsInTimeframe} original casts`}
                      {oldestCastDate && ` • ${Math.floor((Date.now() - oldestCastDate.getTime()) / (1000 * 60 * 60 * 24 * 30))}mo back`}
                    </P>
                  </div>
                </div>
                {/* Progress bar */}
                <div className={`h-1.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'} overflow-hidden`}>
                  <div
                    className={`h-full bg-gradient-to-r ${theme.gradient} transition-all duration-300`}
                    style={{
                      width: hasReachedTargetTimeframe
                        ? '100%'
                        : `${Math.min(95, (totalCastsFetched / (timeframe === "older" ? 15000 : timeframe === "24months" ? 10000 : timeframe === "12months" ? 5000 : 2000)) * 100)}%`
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Timeframe selector (after search started) - allows switching between timeframes */}
          {searchStarted && !isSearching && timeframe && (
            <div className={`relative rounded-xl overflow-hidden ${cardGlow}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} p-[1px] rounded-xl`}>
                <div className={`w-full h-full ${cardBg} rounded-[11px]`} />
              </div>
              <div className="relative p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className={`w-4 h-4 ${themeText}`} />
                  <P className={`text-xs font-medium ${mutedTextClass}`}>Time period</P>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["6months", "12months", "24months", "older"] as Exclude<TimeframeOption, null>[]).map((option) => {
                    const isActive = option === timeframe;
                    const hasCached = hasDataForTimeframe(option);
                    return (
                      <button
                        key={option}
                        onClick={() => handleTimeframeSelect(option)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? `bg-gradient-to-r ${theme.gradient} text-white`
                            : hasCached
                              ? `${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'} ${textClass}`
                              : `${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'} ${mutedTextClass}`
                        }`}
                      >
                        {TIMEFRAME_LABELS[option]}
                        {hasCached && !isActive && <span className="ml-1 opacity-60">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Results summary */}
          {searchStarted && !isSearching && sortedCasts.length > 0 && timeframe && (
            <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl ${theme.bg} ${glowSubtle} backdrop-blur-sm border ${isDark ? 'border-white/5' : 'border-gray-200/50'}`}>
              <P className={`text-sm ${mutedTextClass}`}>
                Found {sortedCasts.length} top casts
              </P>
            </div>
          )}

          {/* Empty state - only show after search completes with no results */}
          {searchStarted && !isSearching && sortedCasts.length === 0 && timeframe && (
            <div className={`relative rounded-2xl overflow-hidden ${cardGlow}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} p-[1.5px] rounded-2xl`}>
                <div className={`w-full h-full ${cardBg} rounded-[14.5px]`} />
              </div>
              <div className="relative p-6 text-center">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br ${theme.gradient} p-[2px] ${glowSubtle}`}>
                  <div className={`w-full h-full rounded-full ${cardBg} flex items-center justify-center`}>
                    <MessageCircle className={`w-5 h-5 ${mutedTextClass}`} />
                  </div>
                </div>
                <H3 className={textClass}>No casts found</H3>
                <P className={`mt-2 ${mutedTextClass}`}>
                  {timeframe === "older" && !hasReachedTargetTimeframe
                    ? `Your cast history doesn't go back 24+ months (oldest: ${oldestCastDate ? Math.floor((Date.now() - oldestCastDate.getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0} months ago)`
                    : `No engaged casts from ${TIMEFRAME_LABELS[timeframe].toLowerCase()}.`
                  }
                </P>
                <P className={`mt-3 text-xs ${mutedTextClass}`}>
                  Try selecting a different time period above
                </P>
              </div>
            </div>
          )}

          {/* Cast list */}
          <div className="space-y-3">
            {sortedCasts.map((cast) => {
              const isSelected = cast.hash === selectedCastHash;

              return (
                <button
                  key={cast.hash}
                  className={`w-full text-left relative rounded-xl overflow-hidden section-card ${
                    isSelected ? cardGlow : ''
                  } transition-all`}
                  onClick={() => onSelectCast(cast.hash)}
                >
                  {/* Gradient border */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${isSelected ? theme.gradient : isDark ? 'from-white/20 to-white/5' : 'from-gray-200 to-gray-100'} p-[1.5px] rounded-xl`}>
                    <div className={`w-full h-full ${cardBg} rounded-[10.5px] ${isSelected ? 'inner-glow' : ''}`} />
                  </div>
                  {isSelected && <div className="absolute inset-0 shimmer-effect rounded-xl pointer-events-none" />}

                  <div className="relative p-4 space-y-3">
                    {/* Cast text */}
                    <div className="flex items-start gap-3">
                      <P className={`text-sm leading-relaxed line-clamp-3 flex-1 ${textClass}`}>
                        {cast.text}
                      </P>
                      {isSelected && (
                        <div className={`shrink-0 w-7 h-7 rounded-full bg-gradient-to-br ${theme.gradient} flex items-center justify-center ${glowSubtle}`}>
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Engagement stats */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${theme.bg} border ${isDark ? 'border-pink-500/20' : 'border-pink-200'}`}>
                        <Heart className="w-3.5 h-3.5 text-pink-500" />
                        <span className={`text-xs font-medium ${textClass}`}>{cast.likes.toLocaleString()}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${theme.bg} border ${isDark ? 'border-green-500/20' : 'border-green-200'}`}>
                        <Repeat2 className="w-3.5 h-3.5 text-green-500" />
                        <span className={`text-xs font-medium ${textClass}`}>{cast.recasts.toLocaleString()}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${theme.bg} border ${isDark ? 'border-blue-500/20' : 'border-blue-200'}`}>
                        <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
                        <span className={`text-xs font-medium ${textClass}`}>{cast.replies.toLocaleString()}</span>
                      </div>
                      <span className={`text-xs ml-auto ${mutedTextClass}`}>
                        {formatRelativeTime(cast.timestamp)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Done button */}
          {sortedCasts.length > 0 && (
            <button
              onClick={onClose}
              className={`w-full py-3.5 rounded-xl bg-gradient-to-r ${theme.gradient} text-white font-semibold shadow-lg ${isDark ? theme.glow : ''} hover:opacity-90 transition-opacity`}
            >
              {t("done")}
            </button>
          )}
        </div>
      </div>
    </StandardMiniLayout>
  );
}
