export function getPostCoverPathFromPublicUrl(
  imageUrl: string | null | undefined,
  userId: string,
) {
  if (!imageUrl) return null;

  try {
    const url = new URL(imageUrl);
    const marker = "/storage/v1/object/public/post-covers/";
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) return null;

    const filePath = decodeURIComponent(
      url.pathname.slice(markerIndex + marker.length),
    );

    if (!filePath.startsWith(`${userId}/`)) {
      return null;
    }

    return filePath;
  } catch {
    return null;
  }
}