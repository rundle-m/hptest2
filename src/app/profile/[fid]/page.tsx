"use client";

import { use } from "react";
import { ProfileView } from "@/features/app/components/profile-view";

export default function ProfilePage({
  params,
}: { 
  params: Promise<{ fid: string }>;
}) {
  const { fid } = use(params);
  const fidNumber = parseInt(fid, 10);

  if (isNaN(fidNumber) || fidNumber <= 0) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Invalid Profile</h1>
          <p className="text-zinc-400">This profile ID is not valid.</p>
        </div>
      </div>
    );
  }

  return <ProfileView fid={fidNumber} />;
}
