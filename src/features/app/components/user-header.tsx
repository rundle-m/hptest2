"use client";

import { P, Small } from "@neynar/ui";
import { UserAvatar } from "@/neynar-farcaster-sdk/mini";
import { Wallet, CheckCircle2 } from "lucide-react";

interface UserHeaderProps {
  user: {
    fid: number;
    username?: string;
    display_name?: string;
    displayName?: string;
    pfp_url?: string;
    pfpUrl?: string;
    profile?: {
      bio?: {
        text?: string;
      };
    };
    verified_addresses?: {
      eth_addresses?: string[];
    };
  };
  walletAddress?: string;
  isDark?: boolean;
}

// Helper to truncate wallet address
function truncateAddress(address: string): string {
  if (address.length <= 13) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function UserHeader({ user, walletAddress, isDark = true }: UserHeaderProps) {
  const displayName = user.display_name || user.displayName || "User";
  const username = user.username || `fid:${user.fid}`;
  const bio = user.profile?.bio?.text;
  const wallet =
    walletAddress ||
    user.verified_addresses?.eth_addresses?.[0] ||
    null;

  const textClass = isDark ? "text-white" : "text-gray-900";
  const mutedClass = isDark ? "text-zinc-400" : "text-gray-500";
  const badgeBg = isDark ? "bg-white/5" : "bg-gray-100";
  const glowColor = isDark ? "shadow-[0_0_25px_rgba(255,255,255,0.15)]" : "";

  return (
    <div className="space-y-4">
      {/* Profile row */}
      <div className="flex items-center gap-4">
        {/* Avatar with enhanced glow ring */}
        <div className="relative">
          {/* Animated glow ring */}
          <div className={`absolute -inset-1 rounded-full bg-gradient-to-br from-white/30 via-white/10 to-transparent blur-md animate-pulse-glow opacity-60`} />
          {/* Gradient ring */}
          <div className={`absolute -inset-0.5 rounded-full bg-gradient-to-br ${isDark ? 'from-white/40 via-white/20 to-white/5' : 'from-gray-300 via-gray-200 to-gray-100'}`} />
          <UserAvatar
            user={user}
            className={`size-[68px] ring-2 ${isDark ? 'ring-white/30' : 'ring-gray-200'} ring-offset-2 ring-offset-transparent relative ${glowColor}`}
          />
          {/* Online/verified indicator */}
          <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full ${isDark ? 'bg-zinc-900' : 'bg-white'} flex items-center justify-center`}>
            <CheckCircle2 className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
          </div>
        </div>

        {/* Name and handle */}
        <div className="flex-1 min-w-0">
          <P className={`font-bold text-xl truncate leading-tight ${textClass}`}>{displayName}</P>
          <P className={`text-sm ${mutedClass} mt-0.5`}>@{username}</P>
        </div>
      </div>

      {/* Bio with improved styling */}
      {bio && (
        <P className={`text-sm leading-relaxed line-clamp-2 ${mutedClass} ${isDark ? 'bg-white/3' : 'bg-gray-50'} rounded-lg px-3 py-2`}>
          {bio}
        </P>
      )}

      {/* Wallet badge with glow */}
      {wallet && (
        <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl ${badgeBg} w-fit border ${isDark ? 'border-white/10' : 'border-gray-200'} ${isDark ? 'shadow-[0_0_15px_rgba(255,255,255,0.05)]' : ''}`}>
          <div className={`p-1.5 rounded-lg ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
            <Wallet className={`w-3.5 h-3.5 ${isDark ? 'text-zinc-300' : 'text-gray-600'}`} />
          </div>
          <span className={`text-xs font-mono ${isDark ? 'text-zinc-300' : 'text-gray-600'}`}>{truncateAddress(wallet)}</span>
        </div>
      )}
    </div>
  );
}
