import { Request, Response } from "express";
import * as documentRequestService from "../services/documentRequestService";
import { logger } from "../utils/logger";

interface AuthRequest extends Request {
  user?: any;
}

export const createDocumentRequest = async (req: Request, res: Response) => {
  try {
    const { resident_id, document_type, notes } = req.body;

    if (!resident_id || !document_type) {
      return res.status(400).json({
        success: false,
        message: "resident_id and document_type are required",
      });
    }

    const documentRequest = await documentRequestService.createDocumentRequest({
      resident_id,
      document_type,
      notes,
    });

    res.status(201).json({
      success: true,
      data: documentRequest,
      message: "Document request created successfully",
    });
  } catch (error) {
    logger.error("Error in createDocumentRequest controller", { error });
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getDocumentRequestsByResidentId = async (req: Request, res: Response) => {
  try {
    const { resident_id } = req.params;

    if (!resident_id) {
      return res.status(400).json({
        success: false,
        message: "resident_id is required",
      });
    }

    const documentRequests = await documentRequestService.getDocumentRequestsByResidentId(resident_id);

    res.status(200).json({
      success: true,
      data: documentRequests,
      message: "Document requests retrieved successfully",
    });
  } catch (error) {
    logger.error("Error in getDocumentRequestsByResidentId controller", { error });
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllDocumentRequests = async (req: AuthRequest, res: Response) => {
  try {
    const adminUserId = req.user ? String(req.user._id) : undefined;
    const documentRequests = await documentRequestService.getAllDocumentRequests(adminUserId);

    res.status(200).json({
      success: true,
      data: documentRequests,
      message: "Document requests retrieved successfully",
    });
  } catch (error) {
    logger.error("Error in getAllDocumentRequests controller", { error });
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateDocumentRequestStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, staff_notes, completed_at } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: "id and status are required",
      });
    }

    const updateData: any = { status };
    if (staff_notes) updateData.staff_notes = staff_notes;
    if (completed_at) updateData.completed_at = new Date(completed_at);

    const documentRequest = await documentRequestService.updateDocumentRequestStatus(id, updateData);

    res.status(200).json({
      success: true,
      data: documentRequest,
      message: "Document request status updated successfully",
    });
  } catch (error) {
    logger.error("Error in updateDocumentRequestStatus controller", { error });
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteDocumentRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "id is required",
      });
    }

    await documentRequestService.deleteDocumentRequest(id);

    res.status(200).json({
      success: true,
      message: "Document request deleted successfully",
    });
  } catch (error) {
    logger.error("Error in deleteDocumentRequest controller", { error });
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
