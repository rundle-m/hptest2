"use client";

import { useState, useEffect, useCallback } from "react";
import { checkMintStatus, recordMint } from "@/app/actions/preferences";
import type { MintRecord } from "@/lib/kv";

/**
 * Hook to manage user's mint status
 *
 * Minted users get:
 * - Cross-device preference persistence
 * - Ability to share their profile
 * - Profile saved to KV storage
 *
 * Non-minted users get:
 * - Local-only preferences (memory/session)
 * - Can preview but not save/share
 */
export function useMintStatus(fid: number | undefined) {
  const [isMinted, setIsMinted] = useState<boolean>(false);
  const [mintRecord, setMintRecord] = useState<MintRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Check mint status on mount
  useEffect(() => {
    if (!fid) {
      setIsLoading(false);
      setIsLoaded(true);
      return;
    }

    const checkStatus = async () => {
      try {
        const result = await checkMintStatus(fid);
        setIsMinted(result.isMinted);
        setMintRecord(result.mintRecord);
      } catch (error) {
        console.error("[useMintStatus] Failed to check status:", error);
        setIsMinted(false);
        setMintRecord(null);
      } finally {
        setIsLoading(false);
        setIsLoaded(true);
      }
    };

    checkStatus();
  }, [fid]);

  // Record a new mint (called after successful payment)
  const mint = useCallback(
    async (txHash?: string): Promise<boolean> => {
      if (!fid) return false;

      try {
        const result = await recordMint(fid, txHash);
        if (result.success) {
          setIsMinted(true);
          setMintRecord({
            fid,
            mintedAt: new Date().toISOString(),
            txHash,
          });
          return true;
        }
        return false;
      } catch (error) {
        console.error("[useMintStatus] Failed to record mint:", error);
        return false;
      }
    },
    [fid]
  );

  return {
    isMinted,
    mintRecord,
    isLoading,
    isLoaded,
    mint,
  };
}
