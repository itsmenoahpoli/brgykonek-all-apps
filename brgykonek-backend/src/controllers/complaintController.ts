import { Request, Response } from "express";
import * as complaintService from "../services/complaintService";

export const createComplaint = async (req: Request, res: Response) => {
  try {
    let data = { ...req.body };
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      data.attachments = req.files.map((file: any) => file.path);
    }
    const complaint = await complaintService.createComplaint(data);
    res.status(201).json(complaint);
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    res.status(400).json({ error: error.message });
  }
};

export const getComplaints = async (req: Request, res: Response) => {
  try {
    const complaints = await complaintService.getComplaints();
    res.status(200).json(complaints);
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    res.status(500).json({ error: error.message });
  }
};

export const getComplaintById = async (req: Request, res: Response) => {
  try {
    const complaint = await complaintService.getComplaintById(req.params.id);
    if (!complaint) return res.status(404).json({ error: "Not found" });
    res.status(200).json(complaint);
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    res.status(500).json({ error: error.message });
  }
};

export const updateComplaint = async (req: Request, res: Response) => {
  try {
    const complaint = await complaintService.updateComplaint(
      req.params.id,
      req.body
    );
    if (!complaint) return res.status(404).json({ error: "Not found" });
    res.status(200).json(complaint);
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    res.status(400).json({ error: error.message });
  }
};

export const deleteComplaint = async (req: Request, res: Response) => {
  try {
    const complaint = await complaintService.deleteComplaint(req.params.id);
    if (!complaint) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    res.status(500).json({ error: error.message });
  }
};

export const getComplaintsByResidentId = async (
  req: Request,
  res: Response
) => {
  try {
    const complaints = await complaintService.getComplaintsByResidentId(
      req.params.resident_id
    );
    res.status(200).json(complaints);
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    res.status(500).json({ error: error.message });
  }
};

export const createAdminComplaint = async (req: Request, res: Response) => {
  try {
    const user: any = (req as any).user;
    let data: any = { ...req.body };
    if (!data.title) {
      const baseTitle = data.category || "Complaint";
      data.title = `${baseTitle}`;
    }
    data.created_by_admin = true;
    data.admin_id = user?._id;
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      data.attachments = (req.files as any[]).map((file: any) => file.path);
    }
    const complaint = await complaintService.createAdminComplaint(data);
    res.status(201).json(complaint);
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    res.status(400).json({ error: error.message });
  }
};
