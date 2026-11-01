import type * as Impl from "./http/uploads"
import { DEMO_MODE, lazyApi } from "./mode"

// Same limits as POST /uploads; checked before uploading so errors show at once.
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"]

const api = lazyApi((): Promise<typeof Impl> => (DEMO_MODE ? import("./mock/uploads") : import("./http/uploads")))

export const uploadImage = api("uploadImage")
