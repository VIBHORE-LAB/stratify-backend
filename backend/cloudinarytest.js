import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import slugify from "slugify";
import dotenv from "dotenv";

dotenv.config();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadFilesToCloudinary(
  files = [],
  { userId, companyName = "unknown", folder = "results" }
) {
  if (!files?.length) return [];

  const companySlug = slugify(companyName, { lower: true, strict: true }).slice(0, 40);
  const timeStamp = new Date().toISOString().replace(/[:.]/g, "-");

  const uploads = files.map(async (filePath) => {
    const basename = path.basename(filePath);
    const nameNoExt = basename.replace(/\.[^/.]+$/, "");
    const publicId = `${userId}_${companySlug}_${timeStamp}_${nameNoExt}`;

    // Sanitize path: wrap spaces
    const safePath = filePath.includes(" ") ? `"${filePath}"` : filePath;

    try {
      const result = await cloudinary.uploader.upload(path.resolve(safePath), {
        resource_type: "raw",
        folder,
        public_id: publicId,
        use_filename: false,
        unique_filename: false,
        timeout: 120000, // 2 min
        context: { userId, company: companyName },
        tags: [`user:${userId}`, `company:${companySlug}`, "strategy_results"],
      });

      return {
        originalFile: basename,
        public_id: result.public_id,
        url: result.secure_url,
        bytes: result.bytes,
        uploaded_at: result.created_at,
        folder: result.folder,
      };
    } catch (err) {
      return {
        originalFile: basename,
        error: {
          message: err.message,
          http_code: err.http_code,
          name: err.name,
        },
      };
    }
  });

  return Promise.all(uploads);
}
