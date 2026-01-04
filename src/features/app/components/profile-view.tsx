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
import { CreateYoursCTA } from "@/features/app/components/create-yours-cta";
import { useNFTs, useAllNFTs, calculateStats } from "@/hooks/use-nfts";
import { useAllTokens } from "@/hooks/use-tokens";
import { useFeaturedNFTs } from "@/hooks/use-featured-nfts";
import { useFeaturedCast } from "@/hooks/use-featured-cast";
import { useProfileTheme } from "@/hooks/use-profile-theme";
import { useLanguage } from "@/hooks/use-language";
import { useProjects } from "@/hooks/use-projects";
import { useSectionOrder } from "@/hooks/use-section-order";
import { useExtendedBio } from "@/hooks/use-extended-bio";
import type { NFT } from "@/features/app/types";

type ViewMode = "gallery" | "detail" | "browser" | "cast-browser" | "settings";

interface ProfileViewProps {
  fid: number;
}

export function ProfileView({ fid }: ProfileViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("gallery");
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);

  // Get current logged-in Farcaster user
  const { data: currentUser, isLoading: isCurrentUserLoading } = useFarcasterUser();

  // Fetch the profile user's full data
  const { data: profileUser, isLoading: isProfileLoading } = useUser(fid);

  // Determine if this is the owner viewing their own profile
  const isOwner = currentUser?.fid === fid;

  // Get the profile user's primary verified wallet
  const walletAddress = profileUser?.verified_addresses?.primary?.eth_address ?? null;

  // Load owner's customization settings (only if owner is viewing)
  const { featuredIds, toggleFeatured, isFeatured, canAddMore, featuredCount, maxFeatured, isLoaded: isFeaturedLoaded } = useFeaturedNFTs(isOwner ? fid : undefined);
  const { featuredCastHash, setFeaturedCast, hasCustomSelection: hasCustomCast, isLoaded: isCastLoaded } = useFeaturedCast(isOwner ? fid : undefined);
  const { colorTheme, font, displayMode, setColorTheme, setFont, toggleDisplayMode, isLoaded: isThemeLoaded } = useProfileTheme(isOwner ? fid : undefined);
  const { language, setLanguage, t, isLoaded: isLanguageLoaded } = useLanguage(isOwner ? fid : undefined);
  const { projects, addProject, updateProject, removeProject, canAddMore: canAddMoreProjects, maxProjects, isLoaded: isProjectsLoaded } = useProjects(isOwner ? fid : undefined);
  const { sectionOrder, moveSectionUp, moveSectionDown, resetOrder, isLoaded: isSectionOrderLoaded } = useSectionOrder(isOwner ? fid : undefined);
  const { extendedBio, setExtendedBio, hasExtendedBio, characterCount, maxCharacters, isLoaded: isExtendedBioLoaded } = useExtendedBio(isOwner ? fid : undefined);

  // Fetch NFTs
  const { data: defaultNfts = [], isLoading: isNftsLoading, error: nftsError } = useNFTs(walletAddress);

  // Fetch all NFTs (for filtering featured selections - only if owner viewing)
  const { data: allNftsData } = useAllNFTs(walletAddress, isOwner && featuredIds.length > 0);

  // Fetch top tokens
  const { data: topTokens = [] } = useAllTokens(walletAddress, true);

  // Determine which NFTs to display
  const displayNfts = useMemo(() => {
    if (isOwner && featuredIds.length > 0 && allNftsData?.nfts) {
      return allNftsData.nfts.filter((nft) => featuredIds.includes(nft.id));
    }
    return defaultNfts;
  }, [isOwner, featuredIds, allNftsData?.nfts, defaultNfts]);

  // Show loading screen while essential data loads
  const isWaitingForCustomizations = isOwner && (!isFeaturedLoaded || !isCastLoaded || !isThemeLoaded || !isLanguageLoaded || !isProjectsLoaded || !isSectionOrderLoaded || !isExtendedBioLoaded);

  if (isProfileLoading || isWaitingForCustomizations) {
    return <LoginScreen isLoading={true} />;
  }

  // Profile not found
  if (!profileUser) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
          <p className="text-zinc-400">This user does not exist or has not set up their profile yet.</p>
        </div>
      </div>
    );
  }

  // Settings panel view (only for owner)
  if (isOwner && viewMode === "settings") {
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
        hasCustomNFTs={featuredIds.length > 0}
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
        onResetSectionOrder={resetOrder}
        extendedBio={extendedBio}
        onSetExtendedBio={setExtendedBio}
        bioCharacterCount={characterCount}
        bioMaxCharacters={maxCharacters}
        onClose={() => setViewMode("gallery")}
      />
    );
  }

  // Collection browser view (only for owner)
  if (isOwner && viewMode === "browser") {
    return (
      <CollectionBrowser
        walletAddress={walletAddress}
        featuredIds={featuredIds}
        onToggleFeatured={toggleFeatured}
        canAddMore={canAddMore}
        featuredCount={featuredCount}
        maxFeatured={maxFeatured}
        onClose={() => setViewMode("settings")}
        t={t}
      />
    );
  }

  // Cast browser view (only for owner)
  if (isOwner && viewMode === "cast-browser") {
    return (
      <CastBrowser
        fid={fid}
        selectedCastHash={featuredCastHash}
        onSelectCast={setFeaturedCast}
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

  const stats = calculateStats(displayNfts);

  // Gallery view
  return (
    <>
      <GalleryView
        user={profileUser}
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
        featuredCastHash={isOwner && featuredCastHash ? featuredCastHash : null}
        colorTheme={colorTheme}
        font={font}
        displayMode={displayMode}
        t={t}
        language={language}
        projects={isOwner ? projects : []}
        sectionOrder={sectionOrder}
        extendedBio={isOwner ? extendedBio : ""}
        onOpenSettings={isOwner ? () => setViewMode("settings") : undefined}
        isOwner={isOwner}
        viewerFid={currentUser?.fid}
      />

      {/* Show "Create Yours" CTA for visitors */}
      {!isOwner && <CreateYoursCTA />}
    </>
  );
}
