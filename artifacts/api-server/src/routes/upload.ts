import { Router, type IRouter } from "express";
import multer from "multer";
import { requireAuth } from "../middlewares/requireAuth";
import { saveUpload, StorageNotConfiguredError } from "../lib/storage";

const router: IRouter = Router();

// 4 MB cap: Vercel rejects request bodies over ~4.5 MB at the platform level
// (FUNCTION_PAYLOAD_TOO_LARGE) before Express ever sees them, so a higher
// multer limit would be unreachable in production. Keeping the limit below
// the platform cap means the user always gets our clear French 413 message.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
});

/**
 * Sniff the leading bytes of a buffer to confirm it is a real image, rather
 * than trusting the client-supplied MIME type. Returns the canonical content
 * type for accepted formats, or null if the signature is not recognised.
 */
function detectImageType(buf: Buffer): string | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return "image/png";
  }
  if (buf.length >= 6 && buf.toString("ascii", 0, 6) === "GIF89a") {
    return "image/gif";
  }
  if (buf.length >= 6 && buf.toString("ascii", 0, 6) === "GIF87a") {
    return "image/gif";
  }
  if (
    buf.length >= 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

// Image upload is multipart/form-data, which the OpenAPI/codegen flow does not
// model well, so it is implemented as a manual route. The frontend posts a
// FormData with a single `file` field and receives `{ url }`.
router.post(
  "/upload",
  requireAuth,
  (req, res, next) => {
    upload.single("file")(req, res, (err?: unknown) => {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        res.status(413).json({
          error:
            "L'image dépasse la taille maximale de 4 Mo. Réduisez-la (ou prenez une photo en plus basse résolution) puis réessayez.",
        });
        return;
      }
      next(err);
    });
  },
  async (req, res): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: "Aucun fichier reçu." });
      return;
    }
    const detectedType = detectImageType(req.file.buffer);
    if (!detectedType) {
      res.status(400).json({
        error: "Le fichier doit être une image (JPEG, PNG, GIF ou WebP).",
      });
      return;
    }
    try {
      const url = await saveUpload(
        req.file.buffer,
        req.file.originalname,
        detectedType,
      );
      req.log.info({ url }, "Image uploaded");
      res.status(201).json({ url });
    } catch (err) {
      req.log.error({ err }, "Image upload failed");
      if (err instanceof StorageNotConfiguredError) {
        res.status(503).json({ error: err.message });
        return;
      }
      res.status(500).json({
        error:
          "Échec du téléversement — le stockage de photos a refusé le fichier. Réessayez ou contactez le support.",
      });
    }
  },
);

export default router;
