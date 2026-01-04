"use client";

import { Card, CardContent, P, H3 } from "@neynar/ui";
import { Coins } from "lucide-react";
import type { Token } from "@/features/app/types";

interface TokenListProps {
  tokens: Token[];
}

export function TokenList({ tokens }: TokenListProps) {
  // Only show section if user has selected featured tokens
  if (tokens.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Coins className="w-5 h-5 text-muted-foreground" />
        <H3 className="text-base">Featured Tokens</H3>
      </div>
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-2">
            {tokens.map((token, index) => (
              <div
                key={`${token.symbol}-${index}`}
                className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1.5"
              >
                {/* Token Logo */}
                <div className="w-6 h-6 rounded-full bg-background flex items-center justify-center overflow-hidden shrink-0">
                  {token.logoUrl ? (
                    <img
                      src={token.logoUrl}
                      alt={token.symbol}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {token.symbol.slice(0, 2)}
                    </span>
                  )}
                </div>

                {/* Token Symbol */}
                <P className="font-medium text-sm">{token.symbol}</P>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
