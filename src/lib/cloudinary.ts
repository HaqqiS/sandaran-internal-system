import { v2 as cloudinary } from "cloudinary";
import { env } from "~/env";

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

interface SignatureParams {
  folder: string;
  timestamp: number;
  type?: string;
  access_mode?: string;
  [key: string]: unknown;
}

/**
 * Generate signed upload params for client-side upload
 * Folder structure: astaloka/{project-slug}/{type}/{filename}
 * Types: reports, documents, emergency
 */
export function generateUploadSignature(options: {
  projectSlug: string;
  type: "reports" | "documents" | "emergency";
}) {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = `astaloka/${options.projectSlug}/${options.type}`;

  const params: SignatureParams = {
    folder,
    timestamp,
    type: "authenticated",
    use_filename: false,
    unique_filename: true,
  };

  const signature = cloudinary.utils.api_sign_request(
    params,
    env.CLOUDINARY_API_SECRET,
  );

  return {
    timestamp,
    signature,
    folder,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    type: "authenticated",
    use_filename: false,
    unique_filename: true,
  };
}

/**
 * Delete asset by publicId
 */
export async function deleteCloudinaryAsset(
  publicId: string,
  options?: { type?: string },
) {
  return cloudinary.uploader.destroy(publicId, {
    type: options?.type || "authenticated",
  });
}

/**
 * Rename Cloudinary folder (e.g. when project slug changes)
 * NOTE: This uses the Admin API which might have rate limits.
 */
export async function renameCloudinaryFolder(oldSlug: string, newSlug: string) {
  const oldPath = `astaloka/${oldSlug}`;
  const newPath = `astaloka/${newSlug}`;

  try {
    await cloudinary.api.rename_folder(oldPath, newPath);
    console.log(`✅ Renamed Cloudinary folder: ${oldPath} -> ${newPath}`);
  } catch (error) {
    console.warn(
      `⚠️ Failed to rename Cloudinary folder (${oldPath} -> ${newPath}):`,
      error,
    );
  }
}

/**
 * Generate optimized image URL with transformations
 */
export function getOptimizedImageUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: "auto" | number;
    format?: "auto" | "webp" | "jpg" | "png";
  },
) {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      {
        width: options?.width,
        height: options?.height,
        crop: "limit",
        quality: options?.quality || "auto",
        fetch_format: options?.format || "auto",
      },
    ],
  });
}

export { cloudinary };
