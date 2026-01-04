"use client";

import { useState, useMemo } from "react";
import { useFarcasterUser } from "@/neynar-farcaster-sdk/mini";
import { useUser } from "@/neynar-web-sdk/neynar";
import { LoginScreen } from "@/features/app/components/login-screen";
import { GalleryView } from "@/features/app/components/gallery-view";
import { NFTDetail } from "@/features/app/components/nft-detail";
import { CollectionBrowser } from "@/features/app/components/collection-browser";
import { CastBrowser } from "@/features/app/components/cast-browser";
import { SettingsPanel } from "@/features/app/components/settings-panel";
import { useNFTs, useAllNFTs, calculateStats } from "@/hooks/use-nfts";
import { useAllTokens } from "@/hooks/use-tokens";
import { useMintStatus } from "@/hooks/use-mint-status";
import { useSyncedPreferences } from "@/hooks/use-synced-preferences";
import { TRANSLATIONS } from "@/hooks/use-language";
import type { NFT } from "@/features/app/types";
import type { LanguageKey } from "@/hooks/use-language";

type ViewMode = "gallery" | "detail" | "browser" | "cast-browser" | "settings";

export function MiniApp() {
  const [viewMode, setViewMode] = useState<ViewMode>("gallery");
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);

  // Get current Farcaster user context
  const {
    data: farcasterUser,
    isLoading: isUserLoading,
    error: userError,
  } = useFarcasterUser();

  // Fetch full user profile with verified addresses
  const { data: fullUser, isLoading: isProfileLoading } = useUser(
    farcasterUser?.fid ?? 0,
    {},
    { enabled: Boolean(farcasterUser?.fid) }
  );

  // Get the user's primary verified wallet
  const walletAddress = fullUser?.verified_addresses?.primary?.eth_address ?? null;

  // Check mint status - determines if preferences persist cross-device
  const {
    isMinted,
    isLoaded: isMintLoaded,
    mint,
  } = useMintStatus(farcasterUser?.fid);

  // Unified preferences - syncs to KV for minted users, memory-only for non-minted
  const {
    // Theme
    colorTheme,
    font,
    displayMode,
    setColorTheme,
    setFont,
    toggleDisplayMode,
    // Language
    language,
    setLanguage,
    // Extended bio
    extendedBio,
    setExtendedBio,
    // Featured NFTs
    featuredNftIds,
    toggleFeaturedNft,
    isNftFeatured,
    canAddMoreNfts,
    featuredNftCount,
    maxFeaturedNfts,
    // Featured cast
    featuredCastHash,
    setFeaturedCastHash,
    hasCustomCast,
    // Projects
    projects,
    addProject,
    updateProject,
    removeProject,
    canAddMoreProjects,
    maxProjects,
    // Section order
    sectionOrder,
    moveSectionUp,
    moveSectionDown,
    resetSectionOrder,
    // Loading
    isLoaded: isPrefsLoaded,
  } = useSyncedPreferences(farcasterUser?.fid, isMinted);

  // Translation function
  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key;
  };

  // Fetch default NFTs (when no custom selection)
  const { data: defaultNfts = [], isLoading: isNftsLoading, error: nftsError } = useNFTs(walletAddress);

  // Fetch all NFTs (for filtering featured selections)
  const { data: allNftsData } = useAllNFTs(walletAddress, featuredNftIds.length > 0);

  // Fetch top tokens
  const { data: topTokens = [] } = useAllTokens(walletAddress, true);

  // Determine which NFTs to display
  const displayNfts = useMemo(() => {
    if (featuredNftIds.length > 0 && allNftsData?.nfts) {
      return allNftsData.nfts.filter((nft) => featuredNftIds.includes(nft.id));
    }
    return defaultNfts;
  }, [featuredNftIds, allNftsData?.nfts, defaultNfts]);

  // Show loading screen while essential data loads
  if (isUserLoading || isProfileLoading || !isMintLoaded || !isPrefsLoaded) {
    return <LoginScreen isLoading={true} />;
  }

  if (userError) {
    return <LoginScreen error={userError} />;
  }

  if (!farcasterUser) {
    return <LoginScreen />;
  }

  // Settings panel view
  if (viewMode === "settings") {
    return (
      <SettingsPanel
        colorTheme={colorTheme}
        font={font}
        displayMode={displayMode}
        language={language}
        t={t}
        onSetColorTheme={setColorTheme}
        onSetFont={setFont}
        onSetLanguage={setLanguage}
        onToggleDisplayMode={toggleDisplayMode}
        onManageNFTs={() => setViewMode("browser")}
        onManageCast={() => setViewMode("cast-browser")}
        hasCustomNFTs={featuredNftIds.length > 0}
        hasCustomCast={hasCustomCast}
        projects={projects}
        onAddProject={addProject}
        onUpdateProject={updateProject}
        onRemoveProject={removeProject}
        canAddMoreProjects={canAddMoreProjects}
        maxProjects={maxProjects}
        sectionOrder={sectionOrder}
        onMoveSectionUp={moveSectionUp}
        onMoveSectionDown={moveSectionDown}
        onResetSectionOrder={resetSectionOrder}
        extendedBio={extendedBio}
        onSetExtendedBio={setExtendedBio}
        bioCharacterCount={extendedBio.length}
        bioMaxCharacters={3000}
        onClose={() => setViewMode("gallery")}
      />
    );
  }

  // Collection browser view
  if (viewMode === "browser") {
    return (
      <CollectionBrowser
        walletAddress={walletAddress}
        featuredIds={featuredNftIds}
        onToggleFeatured={toggleFeaturedNft}
        canAddMore={canAddMoreNfts}
        featuredCount={featuredNftCount}
        maxFeatured={maxFeaturedNfts}
        onClose={() => setViewMode("settings")}
        t={t}
      />
    );
  }

  // Cast browser view
  if (viewMode === "cast-browser" && farcasterUser?.fid) {
    return (
      <CastBrowser
        fid={farcasterUser.fid}
        selectedCastHash={featuredCastHash}
        onSelectCast={setFeaturedCastHash}
        onClose={() => setViewMode("settings")}
        t={t}
        colorTheme={colorTheme}
        displayMode={displayMode}
      />
    );
  }

  // Detail view for selected NFT
  if (viewMode === "detail" && selectedNft) {
    return (
      <NFTDetail
        nft={selectedNft}
        onBack={() => {
          setSelectedNft(null);
          setViewMode("gallery");
        }}
      />
    );
  }

  // Use the full user profile if available
  const displayUser = fullUser || farcasterUser;
  const stats = calculateStats(displayNfts);

  // Gallery view
  return (
    <GalleryView
      user={displayUser}
      walletAddress={walletAddress}
      nfts={displayNfts}
      stats={stats}
      topTokens={topTokens}
      isLoading={isNftsLoading}
      error={nftsError?.message}
      onSelectNft={(nft) => {
        setSelectedNft(nft);
        setViewMode("detail");
      }}
      featuredCastHash={featuredCastHash}
      colorTheme={colorTheme}
      font={font}
      displayMode={displayMode}
      t={t}
      language={language}
      projects={projects}
      sectionOrder={sectionOrder}
      extendedBio={extendedBio}
      onOpenSettings={() => setViewMode("settings")}
      isOwner={true}
      viewerFid={farcasterUser?.fid}
      isMinted={isMinted}
    />
  );
}
