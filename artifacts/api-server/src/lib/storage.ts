import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export function uploadsDir(): string {
  const cwd = process.cwd();
  const workspaceRoot = cwd.endsWith(path.join("artifacts", "api-server"))
    ? path.resolve(cwd, "../..")
    : cwd;
  return path.resolve(workspaceRoot, "artifacts/api-server/uploads");
}

function safeExt(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  return /^\.[a-z0-9]+$/.test(ext) ? ext : "";
}

/**
 * Thrown when photo storage is not configured for the current environment
 * (e.g. running on Vercel without a BLOB_READ_WRITE_TOKEN). The upload route
 * turns this into a clear JSON error for the admin UI.
 */
export class StorageNotConfiguredError extends Error {
  constructor() {
    super(
      "Le stockage de photos n'est pas configuré sur le serveur " +
        "(BLOB_READ_WRITE_TOKEN manquant). Créez un magasin Blob dans " +
        "Vercel (Storage → Create → Blob) et redéployez.",
    );
    this.name = "StorageNotConfiguredError";
  }
}

/**
 * Persist an uploaded image and return a public URL.
 *
 * - Production (Vercel): uses Vercel Blob when BLOB_READ_WRITE_TOKEN is set.
 *   Without the token the serverless filesystem is read-only, so we fail
 *   fast with an explicit error instead of a cryptic EROFS 500.
 * - Development / self-hosted: writes to a local uploads directory served at
 *   `/api/uploads/<file>`.
 */
export async function saveUpload(
  buffer: Buffer,
  originalName: string,
  contentType: string,
): Promise<string> {
  const key = `${Date.now()}-${randomBytes(6).toString("hex")}${safeExt(originalName)}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`chez-florent/${key}`, buffer, {
      access: "public",
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
    });
    return blob.url;
  }

  if (process.env.VERCEL) {
    throw new StorageNotConfiguredError();
  }

  const dir = uploadsDir();
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, key), buffer);
  return `/api/uploads/${key}`;
}
