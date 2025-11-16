import Complaint from "../models/Complaint";
import Sitio from "../models/Sitio";
import Notification from "../models/Notification";
import User from "../models/User";
import { Document, FilterQuery } from "mongoose";

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
    console.error('Error notifying admins:', error);
  }
};

export const createComplaint = async (data: Record<string, any>) => {
  let complaintData = { ...data };
  if (complaintData.sitio) {
    const code = Number(complaintData.sitio);
    const sitio = await Sitio.findOne({ code });
    if (sitio) {
      complaintData.sitio_code = code;
      complaintData.sitio_id = sitio._id;
    } else {
      complaintData.sitio_code = code;
    }
    delete (complaintData as any).sitio;
  }
  
  // If resident_id is provided, validate it exists
  if (data.resident_id) {
    const user = await User.findById(data.resident_id);
    if (!user) {
      throw new Error("Resident not found with the provided ID");
    }
    // Ensure the user is actually a resident
    if (user.user_type !== 'resident') {
      throw new Error("The selected user is not a resident");
    }
  }
  // Fallback: if resident_email is provided and no resident_id, look up by email
  else if (data.resident_email && !data.resident_id) {
    const user = await User.findOne({ email: data.resident_email });
    if (user) {
      complaintData.resident_id = String(user._id);
    } else {
      throw new Error("Resident not found with the provided email");
    }
  }
  else {
    throw new Error("Either resident_id or resident_email must be provided");
  }
  
  const c = await Complaint.create(complaintData);
  try {
    await Notification.create({
      recipient_id: String(c.resident_id),
      type: "complaint_update",
      title: "Complaint submitted",
      message: "Your complaint was submitted and is now pending",
      payload: { complaintId: c._id, status: c.status },
    });
  } catch {}
  
  // Notify admins about new complaint
  await notifyAdmins(
    "complaint_update",
    "New Complaint Submitted",
    "A new complaint has been submitted and requires review",
    { complaintId: c._id, status: c.status }
  );
  
  const created: any = await Complaint.findById(c._id)
    .populate("resident_id")
    .populate("sitio_id")
    .lean();
  return {
    ...created,
    sitio: created?.sitio_id ? { _id: created.sitio_id._id, code: created.sitio_code, name: created.sitio_id.name } : (created?.sitio_code ? { code: created.sitio_code } : undefined)
  };
};

export const createAdminComplaint = async (data: Record<string, any>) => {
  let complaintData = { ...data };
  if (complaintData.sitio) {
    const code = Number(complaintData.sitio);
    const sitio = await Sitio.findOne({ code });
    if (sitio) {
      complaintData.sitio_code = code;
      complaintData.sitio_id = sitio._id;
    } else {
      complaintData.sitio_code = code;
    }
    delete (complaintData as any).sitio;
  }
  
  // Validate resident_id if provided
  if (data.resident_id) {
    const user = await User.findById(data.resident_id);
    if (!user) {
      throw new Error("Resident not found with the provided ID");
    }
    // Ensure the user is actually a resident
    if (user.user_type !== 'resident') {
      throw new Error("The selected user is not a resident");
    }
  }
  
  const c = await Complaint.create({ ...complaintData, created_by_admin: true });
  const created: any = await Complaint.findById(c._id)
    .populate("resident_id")
    .populate("sitio_id")
    .lean();
  return {
    ...created,
    sitio: created?.sitio_id ? { _id: created.sitio_id._id, code: created.sitio_code, name: created.sitio_id.name } : (created?.sitio_code ? { code: created.sitio_code } : undefined)
  };
};

export const getComplaints = async (filter: FilterQuery<Document> = {}) => {
  const items = await Complaint.find({ ...filter })
    .sort({ created_at: -1 })
    .populate("resident_id")
    .populate("sitio_id")
    .populate("resolved_by")
    .lean();
  return items.map((c: any) => ({
    ...c,
    sitio: c.sitio_id ? { _id: c.sitio_id._id, code: c.sitio_code, name: c.sitio_id.name } : (c.sitio_code ? { code: c.sitio_code } : undefined)
  }));
};

export const getComplaintById = async (id: string) => {
  const c: any = await Complaint.findById(id)
    .populate("resident_id")
    .populate("sitio_id")
    .populate("resolved_by")
    .lean();
  if (!c) return c;
  return {
    ...c,
    sitio: c.sitio_id ? { _id: c.sitio_id._id, code: c.sitio_code, name: c.sitio_id.name } : (c.sitio_code ? { code: c.sitio_code } : undefined)
  };
};

export const updateComplaint = async (
  id: string,
  data: Record<string, any>
) => {
  const updated = await Complaint.findByIdAndUpdate(id, data, { new: true });
  if (updated) {
    try {
      await Notification.create({
        recipient_id: String(updated.resident_id),
        type: "complaint_update",
        title: `Complaint ${updated.status}`,
        message: `Your complaint was updated to ${updated.status}`,
        payload: { complaintId: updated._id, status: updated.status, resolution_note: updated.resolution_note },
      });
    } catch {}
  }
  const populated: any = await Complaint.findById(id)
    .populate("resident_id")
    .populate("sitio_id")
    .populate("resolved_by")
    .lean();
  return populated ? {
    ...populated,
    sitio: populated?.sitio_id ? { _id: populated.sitio_id._id, code: populated.sitio_code, name: populated.sitio_id.name } : (populated?.sitio_code ? { code: populated.sitio_code } : undefined)
  } : updated;
};

export const deleteComplaint = async (id: string) => {
  return await Complaint.findByIdAndDelete(id);
};

export const getComplaintsByResidentId = async (resident_id: string) => {
  const items = await Complaint.find({ resident_id })
    .sort({ created_at: -1 })
    .populate("sitio_id")
    .populate("resolved_by")
    .lean();
  return items.map((c: any) => ({
    ...c,
    sitio: c.sitio_id ? { _id: c.sitio_id._id, code: c.sitio_code, name: c.sitio_id.name } : (c.sitio_code ? { code: c.sitio_code } : undefined)
  }));
};
