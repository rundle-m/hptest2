import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ProvidersAndInitialization } from "@/features/app/providers-and-initialization";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NFT Gallery",
  description: "View and share NFT collections on Farcaster",
  other: {
    // ESSENTIAL: This tag allows the link to launch as a Mini App
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: "https://your-domain.com/opengraph-image", // TODO: Replace with your actual 3:2 image URL
      button: {
        title: "Launch Gallery",
        action: {
          type: "launch_miniapp",
          name: "NFT Gallery",
          // url: "https://your-domain.com", // Optional: defaults to the current page URL
          // splashImageUrl: "https://your-domain.com/icon.png", // Optional: 200x200px
          // splashBackgroundColor: "#ffffff" // Optional
        },
      },
    }),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ProvidersAndInitialization>
          {children}
        </ProvidersAndInitialization>
      </body>
    </html>
  );
}