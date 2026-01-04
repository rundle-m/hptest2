"use client";

import { useQuery } from "@tanstack/react-query";
import type { Token } from "@/features/app/types";

interface TokensResponse {
  tokens: Token[];
}

// Fetch all tokens using CoinGecko for pricing (automatic discovery, no manual additions needed)
async function fetchTokens(walletAddress: string): Promise<Token[]> {
  // Use the new simplified tokens endpoint that uses CoinGecko for pricing
  const response = await fetch(`/api/tokens?wallet=${walletAddress}`);

  if (!response.ok) {
    // Fallback to old Alchemy endpoint if new one fails
    const fallbackResponse = await fetch(`/api/alchemy/tokens?wallet=${walletAddress}&all=true`);
    if (!fallbackResponse.ok) {
      throw new Error("Failed to fetch tokens");
    }
    const fallbackData: TokensResponse = await fallbackResponse.json();
    return fallbackData.tokens;
  }

  const data: TokensResponse = await response.json();
  return data.tokens;
}

export function useAllTokens(walletAddress: string | null | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: ["all-tokens", walletAddress],
    queryFn: () => fetchTokens(walletAddress!),
    enabled: Boolean(walletAddress) && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
