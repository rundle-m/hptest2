"use client";

import { StandardMiniLayout } from "@/neynar-farcaster-sdk/mini";
import { Card, CardContent, H3, P, Small, Button } from "@neynar/ui";
import type { NFT } from "@/features/app/types";

interface NFTDetailProps {
  nft: NFT;
  onBack: () => void;
}

export function NFTDetail({ nft, onBack }: NFTDetailProps) {
  return (
    <StandardMiniLayout>
      <div className="p-4 space-y-4">
        {/* Back button */}
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Back to gallery
        </Button>

        {/* Large NFT image */}
        <Card>
          <CardContent className="p-3">
            <img
              src={nft.imageUrl}
              alt={nft.name}
              className="w-full aspect-square object-cover rounded-lg"
            />
          </CardContent>
        </Card>

        {/* NFT details */}
        <Card>
          <CardContent className="p-4">
            <H3>{nft.name}</H3>
            <Small color="muted" className="mt-1 block">
              {nft.collection}
            </Small>
            <div className="mt-4 pt-4 border-t border-border">
              <Small color="muted">Floor Price</Small>
              <P className="text-xl font-bold">{nft.floorPrice}</P>
            </div>
          </CardContent>
        </Card>
      </div>
    </StandardMiniLayout>
  );
}
