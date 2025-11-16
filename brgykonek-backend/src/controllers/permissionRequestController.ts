import { Request, Response } from "express";
import * as permissionRequestService from "../services/permissionRequestService";
import { logger } from "../utils/logger";

interface AuthRequest extends Request {
  user?: any;
}

export const createPermissionRequest = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id || req.body.user_id;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const { current_value, request_change_value, reason } = req.body;

    if (!request_change_value || !reason) {
      return res.status(400).json({ error: "Request change value and reason are required" });
    }

    const permissionRequest = await permissionRequestService.createPermissionRequest({
      user_id: String(userId),
      current_value: current_value || {},
      request_change_value,
      reason,
    });

    res.status(201).json(permissionRequest);
  } catch (error) {
    logger.error(`Error creating permission request: ${error}`);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ error: errorMessage });
  }
};

export const getPermissionRequests = async (req: AuthRequest, res: Response) => {
  try {
    const filters: any = {};
    
    // If user is not admin, only show their own requests
    if (req.user?.user_type !== "admin") {
      filters.user_id = String(req.user._id);
    } else {
      // Admin can filter by user_id and status
      if (req.query.user_id) {
        filters.user_id = req.query.user_id;
      }
      if (req.query.status) {
        filters.status = req.query.status;
      }
    }

    const requests = await permissionRequestService.getPermissionRequests(filters);
    res.status(200).json(requests);
  } catch (error) {
    logger.error(`Error fetching permission requests: ${error}`);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
};

export const getPermissionRequestById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const request = await permissionRequestService.getPermissionRequestById(id);

    // Check if user has permission to view this request
    if (req.user?.user_type !== "admin" && String(request.user_id) !== String(req.user._id)) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.status(200).json(request);
  } catch (error) {
    logger.error(`Error fetching permission request: ${error}`);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(404).json({ error: errorMessage });
  }
};

export const updatePermissionRequestStatus = async (req: AuthRequest, res: Response) => {
  try {
    // Only admins can update status
    if (req.user?.user_type !== "admin") {
      return res.status(403).json({ error: "Only admins can update permission request status" });
    }

    const { id } = req.params;
    const { status, review_notes } = req.body;

    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Valid status (approved/rejected) is required" });
    }

    const request = await permissionRequestService.updatePermissionRequestStatus(
      id,
      status,
      String(req.user._id),
      review_notes
    );

    res.status(200).json(request);
  } catch (error) {
    logger.error(`Error updating permission request: ${error}`);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ error: errorMessage });
  }
};

