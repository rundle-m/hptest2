"use client";

import { useState, useMemo } from "react";
import { StandardMiniLayout } from "@/neynar-farcaster-sdk/mini";
import {
  Card,
  CardContent,
  P,
  H3,
  Skeleton,
  Input,
  Button,
} from "@neynar/ui";
import { Search, X, Check, ArrowLeft } from "lucide-react";
import { useAllNFTs } from "@/hooks/use-nfts";
import type { NFT } from "@/features/app/types";

// Default translation function (English fallback)
const defaultT = (key: string) => key;

interface CollectionBrowserProps {
  walletAddress: string | null;
  featuredIds: string[];
  onToggleFeatured: (nftId: string) => void;
  canAddMore: boolean;
  featuredCount: number;
  maxFeatured: number;
  onClose: () => void;
  t?: (key: string) => string;
}

export function CollectionBrowser({
  walletAddress,
  featuredIds,
  onToggleFeatured,
  canAddMore,
  featuredCount,
  maxFeatured,
  onClose,
  t = defaultT,
}: CollectionBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, error } = useAllNFTs(walletAddress);
  const allNfts = data?.nfts || [];
  const totalCount = data?.total || 0;

  // Filter NFTs by search query
  const filteredNfts = useMemo(() => {
    if (!searchQuery.trim()) return allNfts;

    const query = searchQuery.toLowerCase();
    return allNfts.filter(
      (nft) =>
        nft.name.toLowerCase().includes(query) ||
        nft.collection.toLowerCase().includes(query)
    );
  }, [allNfts, searchQuery]);

  const isFeatured = (nftId: string) => featuredIds.includes(nftId);

  return (
    <StandardMiniLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-border bg-background sticky top-0 z-10">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={onClose}
              className="p-2 -ml-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <H3 className="text-lg">{t("selectNFTs")}</H3>
              <P color="muted" className="text-sm">
                {featuredCount}/{maxFeatured} {t("selected")}
                {totalCount > 0 && ` • ${totalCount} ${t("total")}`}
              </P>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or collection..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Loading state */}
          {isLoading && (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <Card>
              <CardContent className="p-6 text-center">
                <P color="destructive">Failed to load collection</P>
              </CardContent>
            </Card>
          )}

          {/* Empty state */}
          {!isLoading && !error && allNfts.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <H3>{t("noNFTsFound")}</H3>
                <P color="muted" className="mt-2">
                  {t("noNFTsInWallet")}
                </P>
              </CardContent>
            </Card>
          )}

          {/* No search results */}
          {!isLoading && !error && allNfts.length > 0 && filteredNfts.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <P color="muted">No NFTs match "{searchQuery}"</P>
              </CardContent>
            </Card>
          )}

          {/* NFT Grid */}
          {!isLoading && !error && filteredNfts.length > 0 && (
            <div className="grid grid-cols-3 gap-2 pb-20">
              {filteredNfts.map((nft) => (
                <NFTSelectCard
                  key={nft.id}
                  nft={nft}
                  isSelected={isFeatured(nft.id)}
                  canSelect={canAddMore || isFeatured(nft.id)}
                  onToggle={() => onToggleFeatured(nft.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Floating Done Button */}
        <div className="fixed bottom-6 left-4 right-4 z-20">
          <Button
            onClick={onClose}
            className="w-full shadow-lg"
            size="lg"
          >
            {t("done")} {featuredCount > 0 && `(${featuredCount} ${t("selected")})`}
          </Button>
        </div>
      </div>
    </StandardMiniLayout>
  );
}

interface NFTSelectCardProps {
  nft: NFT;
  isSelected: boolean;
  canSelect: boolean;
  onToggle: () => void;
}

function NFTSelectCard({ nft, isSelected, canSelect, onToggle }: NFTSelectCardProps) {
  const handleClick = () => {
    if (canSelect) {
      onToggle();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!canSelect && !isSelected}
      className={`
        relative aspect-square rounded-lg overflow-hidden border-2 transition-all
        ${isSelected ? "border-primary ring-2 ring-primary/20" : "border-transparent"}
        ${!canSelect && !isSelected ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50"}
      `}
    >
      <img
        src={nft.imageUrl}
        alt={nft.name}
        className="w-full h-full object-cover"
        loading="lazy"
      />

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-1 right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-primary-foreground" />
        </div>
      )}

      {/* Name overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        <p className="text-white text-xs font-medium truncate">{nft.name}</p>
      </div>
    </button>
  );
}
