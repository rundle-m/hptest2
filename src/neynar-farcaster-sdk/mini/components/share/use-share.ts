import { useCallback } from "react";
import sdk from "@farcaster/miniapp-sdk";
import { publicConfig } from "@/config/public-config";

export type ShareOptions = {
  /**
   * Custom text for the cast. If not provided, uses the app name.
   */
  text?: string;
  /**
   * Custom URL path to append to the app's home URL.
   * Example: "/game/123" results in "https://myapp.neynar.app/game/123"
   */
  path?: string;
  /**
   * Additional embed URL (up to 2 total including the share URL).
   */
  additionalEmbed?: string;
  /**
   * Whether to close the mini app after sharing.
   * @default false
   */
  close?: boolean;
  /**
   * Channel key to post to.
   */
  channelKey?: string;
};

export type ShareResult = {
  /** Hash of the created cast, or null if user cancelled */
  castHash: string | null;
};

/**
 * Hook for sharing the mini app on Farcaster
 *
 * Uses `publicConfig.homeUrl` to ensure share URLs always point to the
 * production domain (*.neynar.app) rather than dev/preview URLs.
 *
 * @example
 * ```tsx
 * const { share } = useShare();
 *
 * // Basic share
 * await share({ text: "Check out this app!" });
 *
 * // Share with custom path
 * await share({
 *   text: "I scored 1000 points!",
 *   path: "/leaderboard"
 * });
 * ```
 */
export function useShare() {
  const share = useCallback(
    async (options: ShareOptions = {}): Promise<ShareResult> => {
      const {
        text = `Check out ${publicConfig.name}!`,
        path,
        additionalEmbed,
        close = false,
        channelKey,
      } = options;

      // Build the share URL using the production domain from publicConfig
      const shareUrl = path
        ? `${publicConfig.homeUrl}${path.startsWith("/") ? path : `/${path}`}`
        : publicConfig.homeUrl;

      // Validate URL before including in embeds
      const isValidUrl = shareUrl.startsWith("https://") && shareUrl.length > 8;

      // Build embeds array (max 2) - only include valid URLs
      const embeds: [] | [string] | [string, string] = [];
      if (isValidUrl) {
        embeds.push(shareUrl);
      }
      if (additionalEmbed) {
        embeds.push(additionalEmbed);
      }
      // Limit to max 2 embeds
      if (embeds.length > 2) {
        embeds.length = 2;
      }

      try {
        const result = await sdk.actions.composeCast({
          text,
          embeds,
          close,
          channelKey,
        });

        // When close is true, result is undefined
        if (close || !result) {
          return { castHash: null };
        }

        return {
          castHash: result.cast?.hash ?? null,
        };
      } catch (error) {
        console.error("[useShare] Failed to compose cast:", error);
        return { castHash: null };
      }
    },
    [],
  );

  return { share };
}
