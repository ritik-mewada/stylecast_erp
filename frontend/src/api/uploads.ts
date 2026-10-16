import { ApiError, delay } from "./mock-db"

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"]

// Proposed POST /uploads (multipart) → { url }. Not in the API yet; the mock returns a data URL
// so the image survives until reload.
export async function uploadImage(file: File): Promise<{ url: string }> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new ApiError(415, `${file.name}: use a JPG, PNG, WebP or AVIF image`)
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ApiError(413, `${file.name} is larger than 5 MB`)
  }
  await delay(400 + Math.random() * 500)
  const url = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new ApiError(400, `Couldn't read ${file.name}`))
    reader.readAsDataURL(file)
  })
  return { url }
}
