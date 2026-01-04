"use client";

import { useRouter } from "next/navigation";
import { Button } from "@neynar/ui";
import { Sparkles } from "lucide-react";

export function CreateYoursCTA() {
  const router = useRouter();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent p-4 pb-6 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 p-[1px] rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.4)]">
          <div className="bg-zinc-900 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-base mb-0.5">
                  Create Your Gallery
                </h3>
                <p className="text-zinc-400 text-sm">
                  Showcase your NFTs and digital identity
                </p>
              </div>
              <Button
                size="sm"
                variant="default"
                className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0"
                onClick={() => router.push("/")}
              >
                Start
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
