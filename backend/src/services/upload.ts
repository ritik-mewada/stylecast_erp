// Stores and serves uploaded images. The type is decided from the file's
// first bytes, never from the client's filename or Content-Type, and only
// raster formats are accepted (no SVG, which can carry scripts).

import { AppDataSource } from "../data-source";
import { Upload } from "../entity/Upload";
import { AppError } from "../utils/AppError";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const ascii = (buffer: Buffer, start: number, end: number) =>
  buffer.subarray(start, end).toString("latin1");

// Returns the image MIME type for JPEG, PNG, WebP and AVIF files, else null.
export const detectImageType = (buffer: Buffer): string | null => {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "image/png";
  }
  if (buffer.length >= 12 && ascii(buffer, 0, 4) === "RIFF" && ascii(buffer, 8, 12) === "WEBP") {
    return "image/webp";
  }
  // AVIF: an ISO-BMFF "ftyp" box whose major or compatible brands include avif/avis.
  if (buffer.length >= 16 && ascii(buffer, 4, 8) === "ftyp") {
    const boxEnd = Math.min(buffer.readUInt32BE(0), buffer.length);
    for (let i = 8; i + 4 <= boxEnd; i += 4) {
      const brand = ascii(buffer, i, i + 4);
      if (brand === "avif" || brand === "avis") {
        return "image/avif";
      }
    }
  }
  return null;
};

export class UploadService {
  private uploadRepo = AppDataSource.getRepository(Upload);

  async createUpload(brandId: string, data: Buffer) {
    const contentType = detectImageType(data);
    if (!contentType) {
      throw new AppError(415, "Upload a JPG, PNG, WebP or AVIF image");
    }

    const upload = await this.uploadRepo.save(
      this.uploadRepo.create({ brandId, contentType, size: data.length, data }),
    );

    return { id: upload.id, contentType, size: upload.size };
  }

  async getUpload(id: string) {
    const upload = await this.uploadRepo
      .createQueryBuilder("upload")
      .addSelect("upload.data")
      .where("upload.id = :id", { id })
      .getOne();

    if (!upload) {
      throw new AppError(404, "Upload not found");
    }

    return upload;
  }
}
