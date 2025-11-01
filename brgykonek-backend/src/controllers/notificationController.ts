import { Response } from "express";
import Notification from "../models/Notification";

export const getNotifications = async (req: any, res: Response) => {
  try {
    const userId = String(req.user._id);
    const notifications = await Notification.find({ recipient_id: userId }).sort({ created_at: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

export const markAsRead = async (req: any, res: Response) => {
  try {
    const userId = String(req.user._id);
    const { id } = req.params;
    await Notification.updateOne({ _id: id, recipient_id: userId }, { $set: { read: true } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
};

export const markAllAsRead = async (req: any, res: Response) => {
  try {
    const userId = String(req.user._id);
    await Notification.updateMany({ recipient_id: userId, read: false }, { $set: { read: true } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark notifications as read" });
  }
};


export const getNotificationsByUserId = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const notifications = await Notification.find({ recipient_id: String(id) }).sort({ created_at: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

