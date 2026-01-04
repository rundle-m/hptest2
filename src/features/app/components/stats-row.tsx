"use client";

import { Card, CardContent, H3, Small } from "@neynar/ui";
import type { GalleryStats } from "@/features/app/types";

interface StatsRowProps {
  stats: GalleryStats;
}

export function StatsRow({ stats }: StatsRowProps) {
  return (
    <div className="flex gap-3">
      <Card className="flex-1">
        <CardContent className="p-4 text-center">
          <H3>{stats.nftCount}</H3>
          <Small color="muted">NFTs</Small>
        </CardContent>
      </Card>
      <Card className="flex-1">
        <CardContent className="p-4 text-center">
          <H3>{stats.collectionCount}</H3>
          <Small color="muted">Collections</Small>
        </CardContent>
      </Card>
    </div>
  );
}
