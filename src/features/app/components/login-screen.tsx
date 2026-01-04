"use client";

import { H1, P, Skeleton } from "@neynar/ui";

interface LoginScreenProps {
  isLoading?: boolean;
  error?: string | null;
}

export function LoginScreen({ isLoading, error }: LoginScreenProps) {
  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
        <div className="text-center space-y-3">
          <p className="text-6xl">🖼️</p>
          <H1>NFT Gallery</H1>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-48 mx-auto" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </div>
          ) : error ? (
            <P color="destructive" className="max-w-[280px]">
              {error}
            </P>
          ) : (
            <P color="muted" className="max-w-[280px]">
              Open this app in Farcaster to view your NFT collection
            </P>
          )}
        </div>

        {!isLoading && !error && (
          <P color="muted" className="text-xs text-center max-w-[280px]">
            This app reads your connected wallet addresses to display your NFTs
          </P>
        )}
      </div>
    </div>
  );
}
