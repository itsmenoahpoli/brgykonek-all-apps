/**
 * @swagger
 * tags:
 *   name: Complaints
 *   description: Complaint management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Resident:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         mobile_number:
 *           type: string
 *         user_type:
 *           type: string
 *         address:
 *           type: string
 *         birthdate:
 *           type: string
 *           format: date
 *         barangay_clearance:
 *           type: string
 *     Complaint:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         resident_id:
 *           $ref: '#/components/schemas/Resident'
 *           description: The resident who filed the complaint. Populated object.
 *         category:
 *           type: string
 *         date_of_report:
 *           type: string
 *           format: date-time
 *         complaint_content:
 *           type: string
 *         attachments:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of file paths for uploaded attachments. Files are stored in 'src/uploads'.
 *         status:
 *           type: string
 *           enum: [published, draft]
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

import { Router } from "express";
import * as complaintController from "../controllers/complaintController";
import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { authenticateToken, isAdmin } from "../middleware/auth";
import { ensureUploadsDir } from "../utils/files";
import fs from "fs";
import path from "path";

const router = Router();

// Function to ensure complaints directory exists
const ensureComplaintsDir = () => {
  const complaintsDir = path.join(process.cwd(), "images", "complaints");
  if (!fs.existsSync(complaintsDir)) {
    fs.mkdirSync(complaintsDir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    ensureComplaintsDir();
    cb(null, "images/complaints");
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
  if (
    file.mimetype === "application/pdf" ||
    file.mimetype.startsWith("image/")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and image files are allowed"));
  }
};

const upload = multer({ storage, fileFilter });

/**
 * @swagger
 * /api/complaints:
 *   post:
 *     summary: Create a new complaint
 *     tags: [Complaints]
 *     description: >-
 *       Create a new complaint. Attachments (images or PDFs) are uploaded and saved to 'src/uploads'. Only the file path is stored in the database.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               resident_id:
 *                 type: string
 *               category:
 *                 type: string
 *               date_of_report:
 *                 type: string
 *                 format: date-time
 *               complaint_content:
 *                 type: string
 *               sitio:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 100
 *                 description: Optional. Sitio number (1-100).
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Optional. Array of image or PDF files. Files are saved to 'src/uploads'.
 *               status:
 *                 type: string
 *                 enum: [published, draft]
 *     responses:
 *       201:
 *         description: Complaint created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Complaint'
 *       400:
 *         description: Invalid input
 */
router.post(
  "/",
  upload.array("attachments", 10),
  complaintController.createComplaint
);

router.post(
  "/admin",
  authenticateToken,
  isAdmin,
  upload.array("attachments", 10),
  complaintController.createAdminComplaint
);

/**
 * @swagger
 * /api/complaints:
 *   get:
 *     summary: Get all complaints
 *     tags: [Complaints]
 *     responses:
 *       200:
 *         description: List of complaints
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Complaint'
 */
router.get("/", complaintController.getComplaints);

/**
 * @swagger
 * /api/complaints/resident/{resident_id}:
 *   get:
 *     summary: Get complaints by resident ID
 *     tags: [Complaints]
 *     parameters:
 *       - in: path
 *         name: resident_id
 *         schema:
 *           type: string
 *         required: true
 *         description: Resident ID
 *     responses:
 *       200:
 *         description: List of complaints for the resident
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Complaint'
 *       404:
 *         description: No complaints found for the resident
 */
router.get(
  "/resident/:resident_id",
  complaintController.getComplaintsByResidentId
);

/**
 * @swagger
 * /api/complaints/{id}:
 *   get:
 *     summary: Get a complaint by ID
 *     tags: [Complaints]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Complaint ID
 *     responses:
 *       200:
 *         description: Complaint found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Complaint'
 *       404:
 *         description: Complaint not found
 */
router.get("/:id", complaintController.getComplaintById);

/**
 * @swagger
 * /api/complaints/{id}:
 *   put:
 *     summary: Update a complaint by ID
 *     tags: [Complaints]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Complaint ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Complaint'
 *     responses:
 *       200:
 *         description: Complaint updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Complaint'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Complaint not found
 */
router.put("/:id", upload.single("resolution_image"), complaintController.updateComplaint);

/**
 * @swagger
 * /api/complaints/{id}:
 *   delete:
 *     summary: Delete a complaint by ID
 *     tags: [Complaints]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Complaint ID
 *     responses:
 *       200:
 *         description: Complaint deleted
 *       404:
 *         description: Complaint not found
 */
router.delete("/:id", complaintController.deleteComplaint);

export default router;
