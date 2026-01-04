"use client";

import { useQuery } from "@tanstack/react-query";
import type { NFT } from "@/features/app/types";

interface AlchemyNFT {
  tokenId: string;
  name?: string;
  contract: {
    address: string;
    name?: string;
    openSeaMetadata?: {
      floorPrice?: number;
    };
  };
  image?: {
    cachedUrl?: string;
    thumbnailUrl?: string;
    originalUrl?: string;
  };
  collection?: {
    name?: string;
  };
}

interface AlchemyResponse {
  ownedNfts: AlchemyNFT[];
  pageKey?: string;
  total?: number;
}

// Transform Alchemy NFT to our NFT type
function transformNFT(nft: AlchemyNFT): NFT {
  const floorPrice = nft.contract.openSeaMetadata?.floorPrice;
  const floorPriceStr = floorPrice ? `${floorPrice.toFixed(3)} ETH` : "N/A";

  return {
    id: `${nft.contract.address}-${nft.tokenId}`,
    name: nft.name || `#${nft.tokenId}`,
    collection:
      nft.collection?.name || nft.contract.name || "Unknown Collection",
    imageUrl:
      nft.image?.cachedUrl ||
      nft.image?.thumbnailUrl ||
      nft.image?.originalUrl ||
      "https://via.placeholder.com/300?text=No+Image",
    floorPrice: floorPriceStr,
  };
}

// Fetch NFTs from Alchemy API
async function fetchNFTs(walletAddress: string, fetchAll: boolean = false): Promise<{ nfts: NFT[]; total: number }> {
  const url = fetchAll
    ? `/api/alchemy/nfts?wallet=${walletAddress}&all=true`
    : `/api/alchemy/nfts?wallet=${walletAddress}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch NFTs");
  }

  const data: AlchemyResponse = await response.json();
  return {
    nfts: data.ownedNfts.map(transformNFT),
    total: data.total || data.ownedNfts.length,
  };
}

// Hook to fetch featured NFTs (limited to 6 or selected ones)
export function useNFTs(walletAddress: string | null | undefined) {
  return useQuery({
    queryKey: ["nfts", walletAddress],
    queryFn: async () => {
      const result = await fetchNFTs(walletAddress!, false);
      return result.nfts;
    },
    enabled: Boolean(walletAddress),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook to fetch ALL NFTs for the collection browser
export function useAllNFTs(walletAddress: string | null | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: ["all-nfts", walletAddress],
    queryFn: () => fetchNFTs(walletAddress!, true),
    enabled: Boolean(walletAddress) && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Calculate stats from NFTs
export function calculateStats(nfts: NFT[]) {
  const uniqueCollections = new Set(nfts.map((nft) => nft.collection));
  return {
    nftCount: nfts.length,
    collectionCount: uniqueCollections.size,
  };
}
