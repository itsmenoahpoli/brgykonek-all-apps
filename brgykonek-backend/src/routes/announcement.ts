import { Router } from "express";
import * as announcementController from "../controllers/announcementController";
import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { ensureAnnouncementImagesDir } from "../utils/files";

const router = Router();

const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    ensureAnnouncementImagesDir();
    cb(null, "public/images/announcements");
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

const upload = multer({ storage, fileFilter });

/**
 * @swagger
 * components:
 *   schemas:
 *     Announcement:
 *       type: object
 *       required:
 *         - title
 *         - title_slug
 *         - header
 *         - body
 *         - status
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the announcement
 *         title:
 *           type: string
 *           description: Title of the announcement
 *         title_slug:
 *           type: string
 *           description: Slug for the title
 *         header:
 *           type: string
 *           description: Header text
 *         body:
 *           type: string
 *           description: Body content
 *         banner_image:
 *           type: string
 *           format: binary
 *           description: Optional. Image file for banner
 *         status:
 *           type: string
 *           enum: [published, draft]
 *           description: Status of the announcement
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation date
 */

/**
 * @swagger
 * /api/announcements:
 *   get:
 *     summary: Get all announcements
 *     tags: [Announcement]
 *     responses:
 *       200:
 *         description: List of announcements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Announcement'
 *   post:
 *     summary: Create a new announcement
 *     tags: [Announcement]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               title_slug:
 *                 type: string
 *               header:
 *                 type: string
 *               body:
 *                 type: string
 *               banner_image:
 *                 type: string
 *                 format: binary
 *                 description: Optional image file
 *               status:
 *                 type: string
 *                 enum: [published, draft]
 *     responses:
 *       201:
 *         description: Announcement created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Announcement'
 *
 * /api/announcements/{id}:
 *   get:
 *     summary: Get an announcement by ID
 *     tags: [Announcement]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Announcement ID
 *     responses:
 *       200:
 *         description: Announcement data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Announcement'
 *       404:
 *         description: Announcement not found
 *   put:
 *     summary: Update an announcement
 *     tags: [Announcement]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Announcement ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               title_slug:
 *                 type: string
 *               header:
 *                 type: string
 *               body:
 *                 type: string
 *               banner_image:
 *                 type: string
 *                 format: binary
 *                 description: Optional image file
 *               status:
 *                 type: string
 *                 enum: [published, draft]
 *     responses:
 *       200:
 *         description: Announcement updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Announcement'
 *       404:
 *         description: Announcement not found
 *   delete:
 *     summary: Delete an announcement
 *     tags: [Announcement]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Announcement ID
 *     responses:
 *       200:
 *         description: Announcement deleted
 *       404:
 *         description: Announcement not found
 */

router.get("/", announcementController.getAll);
router.post("/", upload.single("banner_image"), announcementController.create);
router.get("/:id", announcementController.getById);
router.put(
  "/:id",
  upload.single("banner_image"),
  announcementController.update
);
router.delete("/:id", announcementController.remove);

export default router;
