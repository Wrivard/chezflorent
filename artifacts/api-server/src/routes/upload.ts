import { Router, type IRouter } from "express";
import multer from "multer";
import { requireAuth } from "../middlewares/requireAuth";
import { saveUpload } from "../lib/storage";

const router: IRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

// Image upload is multipart/form-data, which the OpenAPI/codegen flow does not
// model well, so it is implemented as a manual route. The frontend posts a
// FormData with a single `file` field and receives `{ url }`.
router.post(
  "/upload",
  requireAuth,
  upload.single("file"),
  async (req, res): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: "Aucun fichier reçu." });
      return;
    }
    if (!req.file.mimetype.startsWith("image/")) {
      res.status(400).json({ error: "Le fichier doit être une image." });
      return;
    }
    const url = await saveUpload(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
    );
    req.log.info({ url }, "Image uploaded");
    res.status(201).json({ url });
  },
);

export default router;
