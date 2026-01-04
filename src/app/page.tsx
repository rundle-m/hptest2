"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { MiniApp } from "@/features/app/mini-app";
import { ProfileView } from "@/features/app/components/profile-view";
import { LoginScreen } from "@/features/app/components/login-screen";

function HomeContent() {
  const searchParams = useSearchParams();

  // Check for ?fid= query param (fallback for when path routing doesn't work in mini apps)
  const fidParam = searchParams.get("fid");

  if (fidParam) {
    const fid = parseInt(fidParam, 10);
    if (!isNaN(fid) && fid > 0) {
      // Show the specific user's profile
      return <ProfileView fid={fid} />;
    }
  }

  // Default: show current user's own profile
  return <MiniApp />;
}

export default function Home() {
  return (
    <Suspense fallback={<LoginScreen isLoading={true} />}>
      <HomeContent />
    </Suspense>
  );
}
