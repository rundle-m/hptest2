import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

// Fetch user data from Neynar API
async function fetchUserData(fid: string) {
  try {
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
      {
        headers: {
          accept: "application/json",
          api_key: process.env.NEYNAR_API_KEY || "",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Neynar API error: ${response.status}`);
    }

    const data = await response.json();
    const user = data.users?.[0];

    if (!user) {
      throw new Error("User not found");
    }

    return {
      displayName: user.display_name || user.username || "Farcaster User",
      username: user.username || "unknown",
      bio: user.profile?.bio?.text || "No bio available",
      pfpUrl: user.pfp_url || "",
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) {
  try {
    const { fid } = await params;

    // Validate FID
    const fidNumber = parseInt(fid, 10);
    if (isNaN(fidNumber) || fidNumber <= 0) {
      return new Response("Invalid FID", { status: 400 });
    }

    // Fetch user data
    const userData = await fetchUserData(fid);

    if (!userData) {
      // Return fallback image
      return new ImageResponse(
        (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
              color: "white",
              fontSize: 48,
              fontWeight: "bold",
            }}
          >
            Profile Not Found
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    const { displayName, username, bio, pfpUrl } = userData;

    // Truncate bio if too long
    const truncatedBio =
      bio.length > 150 ? bio.substring(0, 147) + "..." : bio;

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #2563eb 100%)",
            position: "relative",
          }}
        >
          {/* Decorative circles for visual interest */}
          <div
            style={{
              position: "absolute",
              width: "600px",
              height: "600px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.1)",
              top: "-200px",
              right: "-200px",
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.05)",
              bottom: "-100px",
              left: "-100px",
              display: "flex",
            }}
          />

          {/* Main content container */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              width: "100%",
              height: "100%",
              padding: "80px",
              gap: "60px",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Profile picture */}
            {pfpUrl && (
              <div
                style={{
                  display: "flex",
                  flexShrink: 0,
                }}
              >
                <img
                  src={pfpUrl}
                  alt={displayName}
                  width={280}
                  height={280}
                  style={{
                    borderRadius: "50%",
                    border: "8px solid rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                  }}
                />
              </div>
            )}

            {/* Text content */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                flex: 1,
                maxWidth: pfpUrl ? "600px" : "100%",
              }}
            >
              {/* Display name */}
              <div
                style={{
                  display: "flex",
                  fontSize: 72,
                  fontWeight: "bold",
                  color: "white",
                  lineHeight: 1.1,
                  textShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {displayName}
              </div>

              {/* Username */}
              <div
                style={{
                  display: "flex",
                  fontSize: 36,
                  color: "rgba(255, 255, 255, 0.9)",
                  textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                }}
              >
                @{username}
              </div>

              {/* Bio */}
              <div
                style={{
                  display: "flex",
                  fontSize: 28,
                  color: "rgba(255, 255, 255, 0.85)",
                  lineHeight: 1.4,
                  textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                  maxWidth: "100%",
                }}
              >
                {truncatedBio}
              </div>

              {/* NFT Gallery label */}
              <div
                style={{
                  display: "flex",
                  marginTop: "20px",
                  padding: "16px 32px",
                  background: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "12px",
                  fontSize: 24,
                  fontWeight: "600",
                  color: "white",
                  alignSelf: "flex-start",
                  backdropFilter: "blur(10px)",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                NFT Gallery Profile
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
        },
      }
    );
  } catch (error) {
    console.error("Error generating OG image:", error);

    // Return error fallback image
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
            color: "white",
            fontSize: 48,
            fontWeight: "bold",
          }}
        >
          <div style={{ display: "flex", marginBottom: "20px" }}>⚠️</div>
          <div style={{ display: "flex" }}>Error Loading Profile</div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
