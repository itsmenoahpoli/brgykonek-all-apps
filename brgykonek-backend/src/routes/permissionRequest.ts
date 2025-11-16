import { Router } from "express";
import * as permissionRequestController from "../controllers/permissionRequestController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Create permission request (authenticated users)
router.post("/", authenticateToken, permissionRequestController.createPermissionRequest);

// Get permission requests (authenticated users - own requests, admins - all requests)
router.get("/", authenticateToken, permissionRequestController.getPermissionRequests);

// Get permission request by ID
router.get("/:id", authenticateToken, permissionRequestController.getPermissionRequestById);

// Update permission request status (admin only)
router.put("/:id/status", authenticateToken, permissionRequestController.updatePermissionRequestStatus);

export default router;

