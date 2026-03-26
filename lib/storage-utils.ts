export function getStoragePathFromPublicUrl(
  publicUrl: string,
  bucketName: string
): string | null {
  try {
    const url = new URL(publicUrl)
    const marker = `/storage/v1/object/public/${bucketName}/`

    const index = url.pathname.indexOf(marker)

    if (index === -1) {
      return null
    }

    const path = url.pathname.slice(index + marker.length)

    return decodeURIComponent(path)
  } catch (error) {
    console.error('No se pudo obtener la ruta del archivo desde la URL pública:', error)
    return null
  }
}