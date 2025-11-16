import PermissionRequest from "../models/PermissionRequest";
import User from "../models/User";
import { logger } from "../utils/logger";

export const createPermissionRequest = async (data: {
  user_id: string;
  current_value: any;
  request_change_value: any;
  reason: string;
}) => {
  try {
    const permissionRequest = new PermissionRequest({
      user_id: data.user_id,
      status: "pending",
      current_value: data.current_value,
      request_change_value: data.request_change_value,
      reason: data.reason,
    });

    await permissionRequest.save();
    await permissionRequest.populate("user_id", "name email");

    logger.info(`Permission request created: ${permissionRequest._id}`);
    return permissionRequest;
  } catch (error) {
    logger.error(`Error creating permission request: ${error}`);
    throw error;
  }
};

export const getPermissionRequests = async (filters?: {
  user_id?: string;
  status?: string;
}) => {
  try {
    const query: any = {};
    if (filters?.user_id) {
      query.user_id = filters.user_id;
    }
    if (filters?.status) {
      query.status = filters.status;
    }

    const requests = await PermissionRequest.find(query)
      .populate("user_id", "name email user_type")
      .populate("reviewed_by", "name email")
      .sort({ created_at: -1 });

    return requests;
  } catch (error) {
    logger.error(`Error fetching permission requests: ${error}`);
    throw error;
  }
};

export const getPermissionRequestById = async (id: string) => {
  try {
    const request = await PermissionRequest.findById(id)
      .populate("user_id", "name email user_type")
      .populate("reviewed_by", "name email");

    if (!request) {
      throw new Error("Permission request not found");
    }

    return request;
  } catch (error) {
    logger.error(`Error fetching permission request: ${error}`);
    throw error;
  }
};

export const updatePermissionRequestStatus = async (
  id: string,
  status: "approved" | "rejected",
  reviewed_by: string,
  review_notes?: string
) => {
  try {
    const request = await PermissionRequest.findById(id);
    if (!request) {
      throw new Error("Permission request not found");
    }

    request.status = status;
    request.reviewed_by = reviewed_by as any;
    request.reviewed_at = new Date();
    if (review_notes) {
      request.review_notes = review_notes;
    }

    // If approved, update the user's profile
    if (status === "approved" && request.user_id) {
      const user = await User.findById(request.user_id);
      if (user) {
        // Update user fields based on request_change_value
        if (request.request_change_value) {
          Object.keys(request.request_change_value).forEach((key) => {
            if (key !== "password" && key !== "email") {
              (user as any)[key] = request.request_change_value[key];
            }
          });
          await user.save();
        }
      }
    }

    await request.save();
    await request.populate("user_id", "name email user_type");
    await request.populate("reviewed_by", "name email");

    logger.info(`Permission request ${id} updated to ${status}`);
    return request;
  } catch (error) {
    logger.error(`Error updating permission request: ${error}`);
    throw error;
  }
};

