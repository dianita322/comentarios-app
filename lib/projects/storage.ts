export function getProjectCoverPathFromPublicUrl(
  publicUrl: string | null | undefined,
  userId: string,
) {
  if (!publicUrl || !userId) return null;

  try {
    const url = new URL(publicUrl);
    const marker = "/storage/v1/object/public/project-covers/";
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) return null;

    const encodedPath = url.pathname.slice(markerIndex + marker.length);
    const path = decodeURIComponent(encodedPath);

    if (!path.startsWith(`${userId}/`)) {
      return null;
    }

    return path;
  } catch {
    return null;
  }
}