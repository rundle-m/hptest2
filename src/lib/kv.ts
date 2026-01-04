/**
 * Vercel KV Storage Utilities
 *
 * Handles persistent storage for:
 * - Mint status (which FIDs have minted their profile)
 * - User preferences (theme, bio, projects, etc.) for minted users
 *
 * Key patterns:
 * - mint:{fid} - Mint status and timestamp
 * - prefs:{fid} - User preferences object
 *
 * Note: @vercel/kv must be installed and configured in your Vercel project.
 * If not available, functions will return null/false gracefully.
 */

// Lazy import of @vercel/kv to handle cases where it's not installed
interface KVClient {
  get: <T>(key: string) => Promise<T | null>;
  set: (key: string, value: unknown) => Promise<unknown>;
  del: (key: string) => Promise<unknown>;
}

let kvClient: KVClient | null = null;
let kvInitialized = false;

async function getKV(): Promise<KVClient | null> {
  if (kvInitialized) return kvClient;

  try {
    // Dynamic import - will fail gracefully if not installed
    const module = await import("@vercel/kv");
    kvClient = module.kv as KVClient;
    kvInitialized = true;
    return kvClient;
  } catch {
    console.warn("[KV] @vercel/kv not available - storage disabled");
    kvInitialized = true;
    return null;
  }
}

// ============================================
// MINT STATUS
// ============================================

export interface MintRecord {
  fid: number;
  mintedAt: string; // ISO timestamp
  txHash?: string; // Optional transaction hash
}

const MINT_KEY_PREFIX = "mint:";

export async function getMintStatus(fid: number): Promise<MintRecord | null> {
  try {
    const kv = await getKV();
    if (!kv) return null;

    const record = await kv.get<MintRecord>(`${MINT_KEY_PREFIX}${fid}`);
    return record;
  } catch (error) {
    console.error("[KV] Failed to get mint status:", error);
    return null;
  }
}

export async function setMintStatus(
  fid: number,
  txHash?: string
): Promise<boolean> {
  try {
    const kv = await getKV();
    if (!kv) return false;

    const record: MintRecord = {
      fid,
      mintedAt: new Date().toISOString(),
      txHash,
    };
    await kv.set(`${MINT_KEY_PREFIX}${fid}`, record);
    return true;
  } catch (error) {
    console.error("[KV] Failed to set mint status:", error);
    return false;
  }
}

export async function isMinted(fid: number): Promise<boolean> {
  const record = await getMintStatus(fid);
  return record !== null;
}

// ============================================
// USER PREFERENCES
// ============================================

export interface UserPreferences {
  // Theme
  colorTheme?: string;
  font?: string;
  displayMode?: "dark" | "light";

  // Language
  language?: string;

  // Extended bio
  extendedBio?: string;

  // Featured content
  featuredNftIds?: string[];
  featuredCastHash?: string | null;

  // Projects
  projects?: Array<{
    id: string;
    title: string;
    description?: string;
    url: string;
    type: "website" | "miniapp" | "channel" | "other";
    imageUrl?: string;
  }>;

  // Section order
  sectionOrder?: string[];

  // Metadata
  updatedAt?: string;
}

const PREFS_KEY_PREFIX = "prefs:";

export async function getUserPreferences(
  fid: number
): Promise<UserPreferences | null> {
  try {
    const kv = await getKV();
    if (!kv) return null;

    const prefs = await kv.get<UserPreferences>(`${PREFS_KEY_PREFIX}${fid}`);
    return prefs;
  } catch (error) {
    console.error("[KV] Failed to get user preferences:", error);
    return null;
  }
}

export async function setUserPreferences(
  fid: number,
  prefs: UserPreferences
): Promise<boolean> {
  try {
    const kv = await getKV();
    if (!kv) return false;

    const updatedPrefs = {
      ...prefs,
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`${PREFS_KEY_PREFIX}${fid}`, updatedPrefs);
    return true;
  } catch (error) {
    console.error("[KV] Failed to set user preferences:", error);
    return false;
  }
}

export async function updateUserPreferences(
  fid: number,
  updates: Partial<UserPreferences>
): Promise<boolean> {
  try {
    const kv = await getKV();
    if (!kv) return false;

    const existing = await getUserPreferences(fid);
    const merged: UserPreferences = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`${PREFS_KEY_PREFIX}${fid}`, merged);
    return true;
  } catch (error) {
    console.error("[KV] Failed to update user preferences:", error);
    return false;
  }
}

export async function deleteUserPreferences(fid: number): Promise<boolean> {
  try {
    const kv = await getKV();
    if (!kv) return false;

    await kv.del(`${PREFS_KEY_PREFIX}${fid}`);
    return true;
  } catch (error) {
    console.error("[KV] Failed to delete user preferences:", error);
    return false;
  }
}
