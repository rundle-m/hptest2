// NFT Gallery App Types

export interface NFT {
  id: string;
  name: string;
  collection: string;
  imageUrl: string;
  floorPrice: string;
}

export interface Token {
  symbol: string;
  name: string;
  balance: string;
  logoUrl?: string;
  valueUsd?: number;
}

export interface GalleryStats {
  nftCount: number;
  collectionCount: number;
}

export interface Project {
  id: string;
  title: string;
  description?: string; // Optional description
  url: string;
  type: "website" | "miniapp" | "channel" | "other";
  imageUrl?: string; // Optional preview image
}

// Note: User types are now provided by the Neynar SDK
// - useFarcasterUser() returns Context.UserContext (fid, username, displayName, pfpUrl)
// - useUser(fid) returns full User profile with verified_addresses
