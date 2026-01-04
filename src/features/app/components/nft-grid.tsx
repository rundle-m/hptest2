"use client";

import { P, Small } from "@neynar/ui";
import type { NFT } from "@/features/app/types";

interface NFTGridProps {
  nfts: NFT[];
  onSelectNft: (nft: NFT) => void;
  themeBorder?: string;
  themeGradient?: string;
  cardBg?: string;
  cardBorder?: string;
  isDark?: boolean;
  glowSubtle?: string;
}

export function NFTGrid({
  nfts,
  onSelectNft,
  themeBorder,
  themeGradient,
  cardBg = "bg-card",
  cardBorder = "border-border",
  isDark = true,
  glowSubtle = "",
}: NFTGridProps) {
  // Generate glow style based on theme gradient
  const cardGlow = isDark ? "shadow-[0_4px_20px_rgba(255,255,255,0.08),0_1px_3px_rgba(0,0,0,0.2)]" : "";

  return (
    <div className="grid grid-cols-2 gap-4">
      {nfts.map((nft) => (
        <button
          key={nft.id}
          className={`
            group relative rounded-xl overflow-hidden text-left
            hover:scale-[1.03] active:scale-[0.97]
            transition-all duration-300
            focus:outline-none
            section-card
            ${cardGlow}
          `}
          onClick={() => onSelectNft(nft)}
        >
          {/* Gradient border wrapper with animation */}
          <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${themeGradient || 'from-white/20 to-white/5'} p-[2px]`}>
            <div className={`w-full h-full rounded-[10px] ${cardBg} inner-glow`} />
          </div>

          {/* Shimmer overlay */}
          <div className="absolute inset-0 shimmer-effect rounded-xl pointer-events-none" />

          {/* Content */}
          <div className="relative">
            {/* Image with overlay on hover */}
            <div className="relative aspect-square overflow-hidden rounded-t-[10px] m-[2px] mb-0">
              <img
                src={nft.imageUrl}
                alt={nft.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Enhanced gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Corner accent glow */}
              <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl ${themeGradient || 'from-white/20 to-transparent'} opacity-0 group-hover:opacity-50 transition-opacity duration-300`} />
            </div>

            {/* Info section with enhanced styling */}
            <div className="p-3.5 space-y-1 mx-[2px] mb-[2px]">
              <P className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {nft.name}
              </P>
              <Small className={`truncate block text-xs ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                {nft.collection}
              </Small>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
