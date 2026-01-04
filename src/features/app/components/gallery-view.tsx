"use client";

import { useState, useCallback } from "react";
import { StandardMiniLayout } from "@/neynar-farcaster-sdk/mini";
import { Skeleton, P, H3 } from "@neynar/ui";
import { Settings, Coins, MessageCircle, Heart, Repeat2, TrendingUp, Sparkles, Languages, Loader2, Share2 } from "lucide-react";
import { UserHeader } from "@/features/app/components/user-header";
import { NFTGrid } from "@/features/app/components/nft-grid";
import { useCast } from "@/neynar-web-sdk/neynar";
import { useShare } from "@/neynar-farcaster-sdk/mini";
import type { NFT, GalleryStats, Token, Project } from "@/features/app/types";
import type { ColorThemeKey, FontKey, DisplayMode } from "@/hooks/use-profile-theme";
import { COLOR_THEMES, FONT_OPTIONS } from "@/hooks/use-profile-theme";
import type { LanguageKey } from "@/hooks/use-language";
import type { SectionId } from "@/hooks/use-section-order";
import { Globe, Zap, Hash, MoreHorizontal, ExternalLink, FolderOpen, User } from "lucide-react";

interface GalleryViewProps {
  user: {
    fid: number;
    username?: string;
    display_name?: string;
    displayName?: string;
    pfp_url?: string;
    pfpUrl?: string;
    profile?: {
      bio?: {
        text?: string;
      };
    };
    verified_addresses?: {
      eth_addresses?: string[];
    };
  };
  walletAddress: string | null;
  nfts: NFT[];
  stats: GalleryStats;
  topTokens?: Token[];
  isLoading?: boolean;
  error?: string;
  onSelectNft: (nft: NFT) => void;
  featuredCastHash?: string | null;
  // Theme props
  colorTheme?: ColorThemeKey;
  font?: FontKey;
  displayMode?: DisplayMode;
  t?: (key: string) => string;
  language?: LanguageKey;
  projects?: Project[];
  sectionOrder?: SectionId[];
  extendedBio?: string;
  onOpenSettings?: () => void;
  // Profile sharing props
  isOwner?: boolean;
  viewerFid?: number;
  // Mint status - determines if preferences persist
  isMinted?: boolean;
}

// Default translation function (English fallback)
const defaultT = (key: string) => key;

export function GalleryView({
  user,
  walletAddress,
  nfts,
  stats,
  topTokens = [],
  isLoading,
  error,
  onSelectNft,
  featuredCastHash,
  colorTheme = "ocean",
  font = "default",
  displayMode = "dark",
  t = defaultT,
  language = "en",
  projects = [],
  sectionOrder = ["about", "nfts", "holdings", "cast", "projects"],
  extendedBio = "",
  onOpenSettings,
  isOwner = true,
  viewerFid,
  isMinted = false,
}: GalleryViewProps) {
  // Share functionality
  const { share } = useShare();
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = useCallback(async () => {
    if (isSharing) return;

    setIsSharing(true);
    try {
      const username = user.username || user.display_name || `User ${user.fid}`;
      // Use query param format (?fid=) which is more reliable in mini app contexts
      await share({
        text: `Check out ${username}'s profile gallery!`,
        path: `?fid=${user.fid}`,
      });
    } finally {
      setIsSharing(false);
    }
  }, [share, user.fid, user.username, user.display_name, isSharing]);

  // Fetch the featured cast if one is selected
  const { data: featuredCast, isLoading: isCastLoading } = useCast(
    featuredCastHash || "",
    { type: "hash" },
    { enabled: Boolean(featuredCastHash) }
  );

  // Get current theme
  const theme = COLOR_THEMES[colorTheme];
  const fontOption = FONT_OPTIONS[font];

  // Cast translation state
  const [showTranslated, setShowTranslated] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState(false);

  // Translate the cast text
  const handleTranslate = useCallback(async () => {
    if (!featuredCast?.text || isTranslating) return;

    if (showTranslated && translatedText) {
      // Toggle back to original
      setShowTranslated(false);
      return;
    }

    setIsTranslating(true);
    setTranslationError(false);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: featuredCast.text,
          targetLanguage: language,
          sourceLanguage: "en",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTranslatedText(data.translatedText);
        setShowTranslated(true);
      } else {
        setTranslationError(true);
      }
    } catch {
      setTranslationError(true);
    } finally {
      setIsTranslating(false);
    }
  }, [featuredCast?.text, language, isTranslating, showTranslated, translatedText]);

  // Helper to format relative time
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

  // Light/dark mode styles
  const isDark = displayMode === "dark";
  const bgClass = isDark ? "bg-zinc-950" : "bg-gray-50";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const mutedTextClass = isDark ? "text-zinc-400" : "text-gray-600";
  const cardBg = isDark ? "bg-zinc-900/90" : "bg-white";
  const cardBorder = isDark ? "border-white/10" : "border-gray-200";
  const subtleBg = isDark ? "bg-white/5" : "bg-gray-100";
  const themeText = isDark ? theme.text : theme.textDark;

  // Glow effects (only in dark mode for best visibility)
  const cardGlow = isDark ? theme.cardShadow : "";
  const glowSubtle = isDark ? theme.glowSubtle : "";
  const glowStrong = isDark ? theme.glowStrong : "";

  return (
    <StandardMiniLayout>
      <div className={`min-h-screen ${bgClass} ${textClass} ${fontOption.className}`} style={fontOption.style}>
        {/* Themed Header Banner with gradient, glow, and animated effects */}
        <div className={`relative h-28 bg-gradient-to-br ${theme.gradient} overflow-hidden`}>
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent gradient-border-animated" />

          {/* Radial light effects */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.2),transparent_40%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.15),transparent_35%)]" />

          {/* Bottom fade for depth */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/20 to-transparent" />

          {/* Subtle shimmer effect */}
          <div className="absolute inset-0 shimmer-effect opacity-50" />

          {/* Action buttons with enhanced glass effect */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {/* Share button - always visible for owners */}
            {isOwner && (
              <button
                onClick={handleShare}
                disabled={isSharing}
                className="p-2.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 hover:bg-white/25 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Share profile"
              >
                <Share2 className="w-5 h-5 text-white drop-shadow-md" />
              </button>
            )}

            {/* Settings button - only for owners */}
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="p-2.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 hover:bg-white/25 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg"
                aria-label="Customize profile"
              >
                <Settings className="w-5 h-5 text-white drop-shadow-md" />
              </button>
            )}
          </div>
        </div>

        <div className={`px-4 space-y-6 -mt-12 ${!isOwner ? 'pb-32' : 'pb-6'}`}>
          {/* User Header Card - floating effect with themed border and glow */}
          <div className={`relative rounded-2xl overflow-hidden ${cardGlow} transition-shadow duration-500`}>
            {/* Gradient border with animation */}
            <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} p-[1.5px] rounded-2xl gradient-border-animated`}>
              <div className={`w-full h-full ${cardBg} rounded-[14.5px] inner-glow`} />
            </div>
            {/* Shimmer overlay */}
            <div className="absolute inset-0 shimmer-effect rounded-2xl pointer-events-none" />
            <div className="relative p-5">
              <UserHeader user={user} walletAddress={walletAddress || undefined} isDark={isDark} />
            </div>
          </div>

          {/* Preview Mode Banner - for non-minted owners */}
          {isOwner && !isMinted && (
            <div className={`relative rounded-xl overflow-hidden`}>
              <div className={`absolute inset-0 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 p-[1px] rounded-xl`}>
                <div className={`w-full h-full ${cardBg} rounded-[11px]`} />
              </div>
              <div className="relative px-4 py-3 flex items-center gap-3">
                <div className="p-2 rounded-full bg-amber-500/20">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <P className={`text-sm font-medium ${textClass}`}>Preview Mode</P>
                  <P className={`text-xs ${mutedTextClass}`}>
                    Changes won&apos;t save until you mint your profile
                  </P>
                </div>
              </div>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`rounded-xl border ${cardBorder} ${cardBg} p-3`}>
                  <Skeleton className="w-full aspect-square rounded-lg mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <div className={`rounded-2xl border ${cardBorder} ${cardBg} p-6 text-center`}>
              <P color="destructive">{error}</P>
              <P color="muted" className="text-sm mt-2">
                Make sure the Alchemy API key is configured
              </P>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && nfts.length === 0 && (
            <div className={`rounded-2xl border ${cardBorder} ${cardBg} p-8 text-center`}>
              <div className={`w-12 h-12 mx-auto mb-4 rounded-full ${subtleBg} flex items-center justify-center`}>
                <Sparkles className={`w-6 h-6 ${theme.text}`} />
              </div>
              <H3 className="mb-2">{t("noNFTsFound")}</H3>
              <P color="muted">
                {walletAddress
                  ? t("noNFTsWallet")
                  : t("noVerifiedWallet")}
              </P>
            </div>
          )}
                  {/* Render sections in custom order */}
          {sectionOrder.map((sectionId) => {
            // About Me Section
            if (sectionId === "about" && extendedBio) {
              return (
                <div key="about" className="space-y-4">
                  {/* Section header with glow accent */}
                  <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl ${theme.bg} ${glowSubtle} backdrop-blur-sm border ${isDark ? 'border-white/5' : 'border-gray-200/50'}`}>
                    <div className={`p-1.5 rounded-lg bg-gradient-to-br ${theme.gradient}`}>
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <H3 className={`text-base font-semibold ${textClass}`}>{t("aboutMe")}</H3>
                  </div>
                  <div className={`relative rounded-2xl overflow-hidden section-card ${cardGlow}`}>
                    {/* Gradient border with animation */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} p-[1.5px] rounded-2xl`}>
                      <div className={`w-full h-full ${cardBg} rounded-[14.5px] inner-glow`} />
                    </div>
                    {/* Shimmer overlay */}
                    <div className="absolute inset-0 shimmer-effect rounded-2xl pointer-events-none" />
                    <div className="relative p-5">
                      <P className={`text-sm leading-relaxed whitespace-pre-wrap ${textClass}`}>
                        {extendedBio}
                      </P>
                    </div>
                  </div>
                </div>
              );
            }

            // NFT Grid Section
            if (sectionId === "nfts" && !isLoading && !error && nfts.length > 0) {
              return (
                <div key="nfts" className="space-y-4">
                  {/* Section header with glow accent */}
                  <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl ${theme.bg} ${glowSubtle} backdrop-blur-sm border ${isDark ? 'border-white/5' : 'border-gray-200/50'}`}>
                    <div className={`p-1.5 rounded-lg bg-gradient-to-br ${theme.gradient}`}>
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <H3 className={`text-base font-semibold ${textClass}`}>{t("featuredNFTsTitle")}</H3>
                  </div>
                  <NFTGrid
                    nfts={nfts}
                    onSelectNft={onSelectNft}
                    themeBorder={theme.border}
                    themeGradient={theme.gradient}
                    cardBg={cardBg}
                    cardBorder={cardBorder}
                    isDark={isDark}
                  />
                </div>
              );
            }

            // Top Holdings Section
            if (sectionId === "holdings" && topTokens.length > 0) {
              return (
                <div key="holdings" className="space-y-4">
                  {/* Section header with glow accent */}
                  <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl ${theme.bg} ${glowSubtle} backdrop-blur-sm border ${isDark ? 'border-white/5' : 'border-gray-200/50'}`}>
                    <div className={`p-1.5 rounded-lg bg-gradient-to-br ${theme.gradient}`}>
                      <Coins className="w-4 h-4 text-white" />
                    </div>
                    <H3 className={`text-base font-semibold ${textClass}`}>{t("topHoldings")}</H3>
                  </div>
                  <div className={`relative rounded-2xl overflow-hidden section-card ${cardGlow}`}>
                    {/* Gradient border with animation */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} p-[1.5px] rounded-2xl`}>
                      <div className={`w-full h-full ${cardBg} rounded-[14.5px] inner-glow`} />
                    </div>
                    {/* Shimmer overlay */}
                    <div className="absolute inset-0 shimmer-effect rounded-2xl pointer-events-none" />
                    <div className="relative">
                      {topTokens.map((token, index) => (
                        <div
                          key={token.symbol}
                          className={`flex items-center gap-3 p-4 token-row-glow ${index < topTokens.length - 1 ? `border-b ${isDark ? 'border-white/5' : 'border-gray-100'}` : ''}`}
                        >
                          {/* Token Logo with gradient ring and glow */}
                          <div className={`relative w-12 h-12 rounded-full bg-gradient-to-br ${theme.gradient} p-[2px] ${glowSubtle}`}>
                            <div className={`w-full h-full rounded-full ${cardBg} flex items-center justify-center overflow-hidden`}>
                              {token.logoUrl ? (
                                <img
                                  src={token.logoUrl}
                                  alt={token.symbol}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className={`text-sm font-bold ${themeText}`}>
                                  {token.symbol.slice(0, 2)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Token Info */}
                          <div className="flex-1 min-w-0">
                            <P className={`font-semibold ${textClass}`}>{token.symbol}</P>
                            <P className={`text-sm truncate ${mutedTextClass}`}>
                              {token.name}
                            </P>
                          </div>

                          {/* USD Value with enhanced badge */}
                          {token.valueUsd !== undefined && (
                            <div className={`px-3.5 py-2 rounded-xl bg-gradient-to-r ${theme.gradientSubtle} border ${isDark ? 'border-white/10' : 'border-gray-200'} ${glowSubtle}`}>
                              <P className={`font-bold text-sm ${themeText}`}>
                                ${token.valueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </P>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            // Top Cast Section
            if (sectionId === "cast") {
              return (
                <div key="cast" className="space-y-4">
                  {/* Section header with glow accent */}
                  <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl ${theme.bg} ${glowSubtle} backdrop-blur-sm border ${isDark ? 'border-white/5' : 'border-gray-200/50'}`}>
                    <div className={`p-1.5 rounded-lg bg-gradient-to-br ${theme.gradient}`}>
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <H3 className={`text-base font-semibold ${textClass}`}>{t("topCast")}</H3>
                  </div>

                  {/* Loading state */}
                  {isCastLoading && featuredCastHash && (
                    <div className={`rounded-2xl border ${cardBorder} ${cardBg} p-5 ${cardGlow}`}>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  )}

                  {/* Featured Cast Display */}
                  {!isCastLoading && featuredCast && (
                    <a
                      href={`https://warpcast.com/${featuredCast.author?.username || 'unknown'}/${featuredCast.hash?.slice(0, 10)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block relative rounded-2xl overflow-hidden section-card ${cardGlow} cursor-pointer`}
                    >
                      {/* Gradient border with animation */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} p-[1.5px] rounded-2xl`}>
                        <div className={`w-full h-full ${cardBg} rounded-[14.5px] inner-glow`} />
                      </div>
                      {/* Shimmer overlay */}
                      <div className="absolute inset-0 shimmer-effect rounded-2xl pointer-events-none" />
                      <div className="relative p-5 space-y-4">
                        {/* Cast text with better typography */}
                        <P className={`text-sm leading-relaxed line-clamp-4 ${textClass}`}>
                          {showTranslated && translatedText ? translatedText : featuredCast.text}
                        </P>

                        {/* Translate button - only show if not English */}
                        {language !== "en" && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleTranslate();
                            }}
                            disabled={isTranslating}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              showTranslated
                                ? `${theme.bg} ${themeText}`
                                : `${subtleBg} ${mutedTextClass} hover:${theme.bg}`
                            } ${isTranslating ? 'opacity-50 cursor-wait' : ''}`}
                          >
                            {isTranslating ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                {t("translating")}
                              </>
                            ) : translationError ? (
                              <>
                                <Languages className="w-3 h-3" />
                                {t("translationError")}
                              </>
                            ) : showTranslated ? (
                              <>
                                <Languages className="w-3 h-3" />
                                {t("showOriginal")}
                              </>
                            ) : (
                              <>
                                <Languages className="w-3 h-3" />
                                {t("translate")}
                              </>
                            )}
                          </button>
                        )}

                        {/* Cast embedded images */}
                        {(() => {
                          // Extract image URLs from embeds - Neynar can have images in different places
                          const imageUrls: string[] = [];

                          if (featuredCast.embeds && Array.isArray(featuredCast.embeds)) {
                            for (const embed of featuredCast.embeds) {
                              // Check if it's a direct image URL
                              if (embed.url?.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) {
                                imageUrls.push(embed.url);
                              }
                              // Check metadata.content_type for images
                              else if (embed.metadata?.content_type?.startsWith('image/') && embed.url) {
                                imageUrls.push(embed.url);
                              }
                              // Check for image in metadata
                              else if (embed.metadata?.image?.url) {
                                imageUrls.push(embed.metadata.image.url);
                              }
                              // Check for image_url directly
                              else if (embed.metadata?.image_url) {
                                imageUrls.push(embed.metadata.image_url);
                              }
                            }
                          }

                          if (imageUrls.length === 0) return null;

                          const displayImages = imageUrls.slice(0, 4);

                          return (
                            <div className={`grid ${displayImages.length > 1 ? 'grid-cols-2 gap-2' : 'grid-cols-1'}`}>
                              {displayImages.map((url, index) => (
                                <div
                                  key={index}
                                  className={`relative overflow-hidden rounded-xl border ${theme.border} ${displayImages.length === 1 ? 'aspect-video' : 'aspect-square'}`}
                                >
                                  <img
                                    src={url}
                                    alt={`Cast image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          );
                        })()}

                        {/* Engagement stats - enhanced pill style with glow */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <div className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl ${theme.bg} border ${isDark ? 'border-pink-500/20' : 'border-pink-200'} ${isDark ? 'shadow-[0_0_10px_rgba(236,72,153,0.15)]' : ''}`}>
                            <Heart className="w-4 h-4 text-pink-500" />
                            <span className={`text-xs font-semibold ${textClass}`}>{(featuredCast.reactions?.likes_count || 0).toLocaleString()}</span>
                          </div>
                          <div className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl ${theme.bg} border ${isDark ? 'border-green-500/20' : 'border-green-200'} ${isDark ? 'shadow-[0_0_10px_rgba(34,197,94,0.15)]' : ''}`}>
                            <Repeat2 className="w-4 h-4 text-green-500" />
                            <span className={`text-xs font-semibold ${textClass}`}>{(featuredCast.reactions?.recasts_count || 0).toLocaleString()}</span>
                          </div>
                          <div className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl ${theme.bg} border ${isDark ? 'border-blue-500/20' : 'border-blue-200'} ${isDark ? 'shadow-[0_0_10px_rgba(59,130,246,0.15)]' : ''}`}>
                            <MessageCircle className="w-4 h-4 text-blue-500" />
                            <span className={`text-xs font-semibold ${textClass}`}>{(featuredCast.replies?.count || 0).toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Timestamp with link hint */}
                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${mutedTextClass}`}>
                            {formatRelativeTime(featuredCast.timestamp)}
                          </span>
                          <span className={`text-xs ${themeText}`}>
                            {t("viewOnWarpcast")}
                          </span>
                        </div>
                      </div>
                    </a>
                  )}

                  {/* Empty state - no cast selected */}
                  {!featuredCastHash && !isCastLoading && (
                    <div className={`rounded-2xl border ${cardBorder} ${cardBg} p-6 text-center ${cardGlow}`}>
                      <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br ${theme.gradient} p-[2px] ${glowSubtle}`}>
                        <div className={`w-full h-full rounded-full ${cardBg} flex items-center justify-center`}>
                          <MessageCircle className={`w-5 h-5 ${mutedTextClass}`} />
                        </div>
                      </div>
                      <P className={`text-sm ${mutedTextClass}`}>
                        {t("noFeaturedCast")}
                      </P>
                    </div>
                  )}
                </div>
              );
            }

            // My Projects Section
            if (sectionId === "projects" && projects.length > 0) {
              return (
                <div key="projects" className="space-y-4">
                  {/* Section header with glow accent */}
                  <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl ${theme.bg} ${glowSubtle} backdrop-blur-sm border ${isDark ? 'border-white/5' : 'border-gray-200/50'}`}>
                    <div className={`p-1.5 rounded-lg bg-gradient-to-br ${theme.gradient}`}>
                      <FolderOpen className="w-4 h-4 text-white" />
                    </div>
                    <H3 className={`text-base font-semibold ${textClass}`}>{t("myProjects")}</H3>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {projects.map((project) => {
                      const TypeIcon = project.type === "website" ? Globe
                        : project.type === "miniapp" ? Zap
                        : project.type === "channel" ? Hash
                        : MoreHorizontal;

                      return (
                        <a
                          key={project.id}
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`relative rounded-xl overflow-hidden group section-card ${cardGlow}`}
                        >
                          {/* Gradient border */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} p-[1.5px] rounded-xl`}>
                            <div className={`w-full h-full ${cardBg} rounded-[10.5px] inner-glow`} />
                          </div>
                          {/* Shimmer overlay */}
                          <div className="absolute inset-0 shimmer-effect rounded-xl pointer-events-none" />
                          <div className="relative">
                            {/* Project Image with gradient overlay */}
                            {project.imageUrl && (
                              <div className="aspect-video overflow-hidden relative">
                                <img
                                  src={project.imageUrl}
                                  alt={project.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                {/* Gradient overlay for depth */}
                                <div className={`absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                              </div>
                            )}
                            <div className="p-3.5">
                              <div className="flex items-start gap-2.5">
                                <div className={`p-1.5 rounded-lg bg-gradient-to-br ${theme.gradient} shrink-0 ${glowSubtle}`}>
                                  <TypeIcon className="w-3.5 h-3.5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1">
                                    <P className={`font-semibold text-sm ${textClass} truncate`}>
                                      {project.title}
                                    </P>
                                    <ExternalLink className={`w-3 h-3 ${themeText} opacity-0 group-hover:opacity-100 transition-opacity shrink-0`} />
                                  </div>
                                  {project.description && (
                                    <P className={`text-xs ${mutedTextClass} line-clamp-2 mt-1`}>
                                      {project.description}
                                    </P>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    </StandardMiniLayout>
  );
}
