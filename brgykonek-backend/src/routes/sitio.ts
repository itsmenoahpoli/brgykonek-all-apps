/**
 * @swagger
 * tags:
 *   name: Sitio
 *   description: Sitio management endpoints
 */

import { Router } from "express";
import * as sitioController from "../controllers/sitioController";

const router = Router();

/**
 * @swagger
 * /api/sitios:
 *   get:
 *     summary: Get all sitios
 *     tags: [Sitio]
 *     responses:
 *       200:
 *         description: List of sitios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   code:
 *                     type: number
 *                   name:
 *                     type: string
 */
router.get("/", sitioController.getSitios);

export default router;
