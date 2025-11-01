/**
 * @swagger
 * tags:
 *   name: Document Requests
 *   description: Document request management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DocumentRequest:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         resident_id:
 *           $ref: '#/components/schemas/Resident'
 *           description: The resident who requested the document. Populated object.
 *         document_type:
 *           type: string
 *           enum: [Barangay Clearance, Residency, Indigency, Business Permit]
 *         notes:
 *           type: string
 *           description: Optional notes from the resident
 *         status:
 *           type: string
 *           enum: [pending, in_progress, completed, rejected]
 *           default: pending
 *         staff_notes:
 *           type: string
 *           description: Notes from staff processing the request
 *         completed_at:
 *           type: string
 *           format: date-time
 *           description: When the request was completed
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

import { Router } from "express";
import * as documentRequestController from "../controllers/documentRequestController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /api/documents/requests:
 *   post:
 *     summary: Create a new document request
 *     tags: [Document Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resident_id
 *               - document_type
 *             properties:
 *               resident_id:
 *                 type: string
 *               document_type:
 *                 type: string
 *                 enum: [Barangay Clearance, Residency, Indigency, Business Permit]
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Document request created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DocumentRequest'
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post(
  "/requests",
  authenticateToken,
  documentRequestController.createDocumentRequest
);

/**
 * @swagger
 * /api/documents/requests:
 *   get:
 *     summary: Get all document requests
 *     tags: [Document Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of document requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DocumentRequest'
 *                 message:
 *                   type: string
 */
router.get(
  "/requests",
  authenticateToken,
  documentRequestController.getAllDocumentRequests
);

/**
 * @swagger
 * /api/documents/requests/resident/{resident_id}:
 *   get:
 *     summary: Get document requests by resident ID
 *     tags: [Document Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resident_id
 *         schema:
 *           type: string
 *         required: true
 *         description: Resident ID
 *     responses:
 *       200:
 *         description: List of document requests for the resident
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DocumentRequest'
 *                 message:
 *                   type: string
 *       404:
 *         description: No document requests found for the resident
 */
router.get(
  "/requests/resident/:resident_id",
  authenticateToken,
  documentRequestController.getDocumentRequestsByResidentId
);

// Update status endpoints (received / seen_by_staff / in_progress / completed / rejected)
router.put(
  "/requests/:id/status",
  authenticateToken,
  documentRequestController.updateDocumentRequestStatus
);

/**
 * @swagger
 * /api/documents/requests/{id}:
 *   put:
 *     summary: Update document request status
 *     tags: [Document Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Document request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, rejected]
 *               staff_notes:
 *                 type: string
 *               completed_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Document request updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DocumentRequest'
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Document request not found
 */
router.put(
  "/requests/:id",
  authenticateToken,
  documentRequestController.updateDocumentRequestStatus
);

/**
 * @swagger
 * /api/documents/requests/{id}:
 *   delete:
 *     summary: Delete document request
 *     tags: [Document Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Document request ID
 *     responses:
 *       200:
 *         description: Document request deleted
 *       404:
 *         description: Document request not found
 */
router.delete(
  "/requests/:id",
  authenticateToken,
  documentRequestController.deleteDocumentRequest
);

export default router;
