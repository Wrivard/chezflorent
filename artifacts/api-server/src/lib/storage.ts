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
 * Persist an uploaded image and return a public URL.
 *
 * - Production (Vercel): uses Vercel Blob when BLOB_READ_WRITE_TOKEN is set.
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

  const dir = uploadsDir();
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, key), buffer);
  return `/api/uploads/${key}`;
}
