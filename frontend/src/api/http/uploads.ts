import { ApiError } from "../errors"
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "../uploads"
import { http } from "./client"

// POST /uploads (multipart "file") → { url } to use as a product imageUrl. The
// same checks as the server run first, so a bad file fails without uploading.
export async function uploadImage(file: File): Promise<{ url: string }> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new ApiError(415, `${file.name}: use a JPG, PNG, WebP or AVIF image`)
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ApiError(413, `${file.name} is larger than 5 MB`)
  }
  const form = new FormData()
  form.append("file", file)
  const { data } = await http.post<{ url: string }>("/uploads", form)
  return { url: data.url }
}
