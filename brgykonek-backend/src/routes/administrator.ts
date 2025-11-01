/**
 * @swagger
 * tags:
 *   name: Administrator
 *   description: Administrator management and dashboard endpoints
 */

import { Router } from "express";
import * as administratorController from "../controllers/administratorController";
import { authenticateToken, isAdmin } from "../middleware/auth";
import * as dashboardOverviewController from "../controllers/dashboardOverviewController";
import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { ensureUploadsDir } from "../utils/files";

const router = Router();

const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    ensureUploadsDir();
    cb(null, "uploads");
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
 * /api/administrator/users:
 *   get:
 *     summary: Get all users
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get(
  "/users",
  authenticateToken,
  isAdmin,
  administratorController.listUsers
);

/**
 * @swagger
 * /api/administrator/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get(
  "/users/:id",
  authenticateToken,
  isAdmin,
  administratorController.getUserById
);

/**
 * @swagger
 * /api/administrator/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post(
  "/users",
  authenticateToken,
  isAdmin,
  upload.single("barangay_clearance"),
  administratorController.createUser
);

/**
 * @swagger
 * /api/administrator/users/{id}:
 *   put:
 *     summary: Update user by ID
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.put(
  "/users/:id",
  authenticateToken,
  isAdmin,
  administratorController.updateUserById
);

/**
 * @swagger
 * /api/administrator/users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       204:
 *         description: User deleted
 *       404:
 *         description: User not found
 */
router.delete(
  "/users/:id",
  authenticateToken,
  isAdmin,
  administratorController.deleteUserById
);

/**
 * @swagger
 * /api/administrator/overview-statistics:
 *   get:
 *     summary: Get dashboard overview statistics
 *     tags: [Administrator]
 *     responses:
 *       200:
 *         description: Overview statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalComplaints:
 *                   type: integer
 *                   example: 42
 *                 totalActiveAnnouncements:
 *                   type: integer
 *                   example: 10
 *                 totalResidents:
 *                   type: integer
 *                   example: 1000
 */
router.get(
  "/overview-statistics",
  dashboardOverviewController.getOverviewStatistics
);

/**
 * @swagger
 * /api/administrator/residents:
 *   get:
 *     summary: Get all residents
 *     tags: [Administrator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of residents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get(
  "/residents",
  authenticateToken,
  isAdmin,
  administratorController.getResidents
);

router.get(
  "/rejected-users",
  authenticateToken,
  isAdmin,
  administratorController.getRejectedUsers
);

export default router;
