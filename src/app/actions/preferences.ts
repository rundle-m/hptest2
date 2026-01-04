"use server";

import {
  getUserPreferences,
  setUserPreferences,
  updateUserPreferences,
  isMinted,
  getMintStatus,
  setMintStatus,
  type UserPreferences,
  type MintRecord,
} from "@/lib/kv";

// ============================================
// MINT STATUS ACTIONS
// ============================================

export async function checkMintStatus(fid: number): Promise<{
  isMinted: boolean;
  mintRecord: MintRecord | null;
}> {
  const mintRecord = await getMintStatus(fid);
  return {
    isMinted: mintRecord !== null,
    mintRecord,
  };
}

export async function recordMint(
  fid: number,
  txHash?: string
): Promise<{ success: boolean }> {
  const success = await setMintStatus(fid, txHash);
  return { success };
}

// ============================================
// PREFERENCES ACTIONS
// ============================================

export async function loadPreferences(
  fid: number
): Promise<{ preferences: UserPreferences | null; isMinted: boolean }> {
  // Check if user is minted first
  const minted = await isMinted(fid);

  if (!minted) {
    // Non-minted users don't have persisted preferences
    return { preferences: null, isMinted: false };
  }

  const preferences = await getUserPreferences(fid);
  return { preferences, isMinted: true };
}

export async function savePreferences(
  fid: number,
  preferences: UserPreferences
): Promise<{ success: boolean; error?: string }> {
  // Check if user is minted first
  const minted = await isMinted(fid);

  if (!minted) {
    return {
      success: false,
      error: "Only minted users can save preferences",
    };
  }

  const success = await setUserPreferences(fid, preferences);
  return { success };
}

export async function updatePreference<K extends keyof UserPreferences>(
  fid: number,
  key: K,
  value: UserPreferences[K]
): Promise<{ success: boolean; error?: string }> {
  // Check if user is minted first
  const minted = await isMinted(fid);

  if (!minted) {
    return {
      success: false,
      error: "Only minted users can save preferences",
    };
  }

  const success = await updateUserPreferences(fid, { [key]: value });
  return { success };
}

// Bulk update for multiple preferences at once
export async function updatePreferences(
  fid: number,
  updates: Partial<UserPreferences>
): Promise<{ success: boolean; error?: string }> {
  // Check if user is minted first
  const minted = await isMinted(fid);

  if (!minted) {
    return {
      success: false,
      error: "Only minted users can save preferences",
    };
  }

  const success = await updateUserPreferences(fid, updates);
  return { success };
}
