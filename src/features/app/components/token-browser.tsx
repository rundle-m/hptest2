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
import { useAllTokens } from "@/hooks/use-tokens";
import type { Token } from "@/features/app/types";

interface TokenBrowserProps {
  walletAddress: string | null;
  featuredSymbols: string[];
  onToggleFeatured: (symbol: string) => void;
  canAddMore: boolean;
  featuredCount: number;
  maxFeatured: number;
  onClose: () => void;
}

export function TokenBrowser({
  walletAddress,
  featuredSymbols,
  onToggleFeatured,
  canAddMore,
  featuredCount,
  maxFeatured,
  onClose,
}: TokenBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allTokens = [], isLoading, error } = useAllTokens(walletAddress);

  // Filter tokens by search query
  const filteredTokens = useMemo(() => {
    if (!searchQuery.trim()) return allTokens;

    const query = searchQuery.toLowerCase();
    return allTokens.filter(
      (token) =>
        token.symbol.toLowerCase().includes(query) ||
        token.name.toLowerCase().includes(query)
    );
  }, [allTokens, searchQuery]);

  const isFeatured = (symbol: string) => featuredSymbols.includes(symbol);

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
              <H3 className="text-lg">Select Featured Tokens</H3>
              <P color="muted" className="text-sm">
                {featuredCount}/{maxFeatured} selected
                {allTokens.length > 0 && ` • ${allTokens.length} tokens found`}
              </P>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or symbol..."
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
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <Card>
              <CardContent className="p-6 text-center">
                <P color="destructive">Failed to load tokens</P>
              </CardContent>
            </Card>
          )}

          {/* Empty state */}
          {!isLoading && !error && allTokens.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <H3>No Tokens Found</H3>
                <P color="muted" className="mt-2">
                  This wallet doesn't have any tokens
                </P>
              </CardContent>
            </Card>
          )}

          {/* No search results */}
          {!isLoading && !error && allTokens.length > 0 && filteredTokens.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <P color="muted">No tokens match "{searchQuery}"</P>
              </CardContent>
            </Card>
          )}

          {/* Token List */}
          {!isLoading && !error && filteredTokens.length > 0 && (
            <div className="space-y-1 pb-20">
              {filteredTokens.map((token) => (
                <TokenSelectRow
                  key={token.symbol}
                  token={token}
                  isSelected={isFeatured(token.symbol)}
                  canSelect={canAddMore || isFeatured(token.symbol)}
                  onToggle={() => onToggleFeatured(token.symbol)}
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
            Done {featuredCount > 0 && `(${featuredCount} selected)`}
          </Button>
        </div>
      </div>
    </StandardMiniLayout>
  );
}

interface TokenSelectRowProps {
  token: Token;
  isSelected: boolean;
  canSelect: boolean;
  onToggle: () => void;
}

function TokenSelectRow({ token, isSelected, canSelect, onToggle }: TokenSelectRowProps) {
  return (
    <button
      onClick={canSelect ? onToggle : undefined}
      disabled={!canSelect && !isSelected}
      className={`
        w-full flex items-center gap-3 p-3 rounded-lg transition-all
        ${isSelected ? "bg-primary/10 border border-primary" : "hover:bg-muted border border-transparent"}
        ${!canSelect && !isSelected ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {/* Token Logo */}
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
        {token.logoUrl ? (
          <img
            src={token.logoUrl}
            alt={token.symbol}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-sm font-bold text-muted-foreground">
            {token.symbol.slice(0, 2)}
          </span>
        )}
      </div>

      {/* Token Info */}
      <div className="flex-1 min-w-0 text-left">
        <P className="font-medium truncate">{token.symbol}</P>
        <P color="muted" className="text-sm truncate">
          {token.name}
        </P>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shrink-0">
          <Check className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
    </button>
  );
}
