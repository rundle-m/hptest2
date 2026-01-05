import { MiniAppEmbedNext } from "@farcaster/miniapp-sdk";

type MiniAppMetadataProps = {
  imageUrl: string;
  buttonTitle: string;
  name: string;
  url: string;
  splashImageUrl: string;
  splashBackgroundColor: string;
};

export function getMiniAppMetadata({
  imageUrl,
  name,
  buttonTitle,
  url,
  splashImageUrl,
  splashBackgroundColor,
}: MiniAppMetadataProps): MiniAppEmbedNext {
  return {
    version: "next",
    imageUrl,
    button: {
      title: buttonTitle,
      action: {
        type: "launch_miniapp",
        name,
        url,
        splashImageUrl,
        splashBackgroundColor,
      },
    },
  };
}
