import DocumentRequest from "../models/DocumentRequest";
import Notification from "../models/Notification";
import User from "../models/User";
import { logger } from "../utils/logger";

const notifyAdmins = async (type: string, title: string, message: string, payload: any) => {
  try {
    const admins = await User.find({ user_type: 'admin' }).select('_id');
    for (const admin of admins) {
      await Notification.create({
        recipient_id: String(admin._id),
        type: type,
        title: title,
        message: message,
        payload: payload,
      });
    }
  } catch (error) {
    logger.error('Error notifying admins:', { error });
  }
};

export const createDocumentRequest = async (data: {
  resident_id: string;
  document_type: string;
  notes?: string;
}) => {
  try {
    const documentRequest = new DocumentRequest(data);
    await documentRequest.save();
    logger.info("Document request created successfully", { documentRequestId: documentRequest._id });
    try {
      await Notification.create({
        recipient_id: data.resident_id,
        type: "document_request_update",
        title: "Document request sent",
        message: "Your request is sent.",
        payload: { documentRequestId: documentRequest._id, status: documentRequest.status },
      });
    } catch {}
    
    // Notify admins about new document request
    await notifyAdmins(
      "document_request_update",
      "New Document Request",
      "A new document request has been submitted and requires review",
      { documentRequestId: documentRequest._id, status: documentRequest.status }
    );
    
    return documentRequest;
  } catch (error) {
    logger.error("Error creating document request", { error });
    throw error;
  }
};

export const getDocumentRequestsByResidentId = async (residentId: string) => {
  try {
    const documentRequests = await DocumentRequest.find({ resident_id: residentId })
      .populate('resident_id', 'name email mobile_number')
      .sort({ created_at: -1 });
    
    logger.info("Document requests retrieved successfully", { residentId, count: documentRequests.length });
    return documentRequests;
  } catch (error) {
    logger.error("Error retrieving document requests", { error });
    throw error;
  }
};

export const getAllDocumentRequests = async (viewedBy?: string) => {
  try {
    const documentRequests = await DocumentRequest.find()
      .populate('resident_id', 'name email mobile_number')
      .sort({ created_at: -1 });
    
    // If this is called by an admin, create notification for residents about their requests being seen
    if (viewedBy) {
      for (const request of documentRequests) {
        // Check if we already sent a "received" notification for this request
        const existingNotification = await Notification.findOne({
          recipient_id: String(request.resident_id?._id || request.resident_id),
          'payload.documentRequestId': request._id,
          title: 'Document request received'
        });
        
        if (!existingNotification && request.status === 'pending') {
          try {
            await Notification.create({
              recipient_id: String(request.resident_id?._id || request.resident_id),
              type: "document_request_update",
              title: "Document request received",
              message: "Your request received.",
              payload: { documentRequestId: request._id, status: request.status },
            });
          } catch (notificationError) {
            logger.error("Error creating notification for document request viewed", { notificationError });
          }
        }
      }
    }
    
    logger.info("All document requests retrieved successfully", { count: documentRequests.length });
    return documentRequests;
  } catch (error) {
    logger.error("Error retrieving all document requests", { error });
    throw error;
  }
};

export const updateDocumentRequestStatus = async (id: string, data: {
  status: string;
  staff_notes?: string;
  completed_at?: Date;
}) => {
  try {
    const documentRequest = await DocumentRequest.findByIdAndUpdate(
      id,
      { ...data, updated_at: new Date() },
      { new: true }
    ).populate('resident_id', 'name email mobile_number');
    
    if (!documentRequest) {
      throw new Error("Document request not found");
    }
    
    logger.info("Document request status updated successfully", { documentRequestId: id, status: data.status });
    try {
      await Notification.create({
        recipient_id: String(documentRequest.resident_id?._id || documentRequest.resident_id),
        type: "document_request_update",
        title: `Document request ${data.status.replace('_', ' ')}`,
        message: `Your document request has been marked as ${data.status.replace('_', ' ')}`,
        payload: { documentRequestId: documentRequest._id, status: documentRequest.status },
      });
    } catch {}
    return documentRequest;
  } catch (error) {
    logger.error("Error updating document request status", { error });
    throw error;
  }
};

export const deleteDocumentRequest = async (id: string) => {
  try {
    const documentRequest = await DocumentRequest.findByIdAndDelete(id);
    
    if (!documentRequest) {
      throw new Error("Document request not found");
    }
    
    logger.info("Document request deleted successfully", { documentRequestId: id });
    return documentRequest;
  } catch (error) {
    logger.error("Error deleting document request", { error });
    throw error;
  }
};
