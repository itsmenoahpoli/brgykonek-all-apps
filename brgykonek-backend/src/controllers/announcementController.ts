import { Request, Response } from "express";
import * as announcementService from "../services/announcementService";
import Notification from "../models/Notification";
import User from "../models/User";
import Sitio from "../models/Sitio";

export const create = async (req: Request, res: Response) => {
  try {
    if (req.file) {
      // Store the file path for database
      req.body.banner_image = `/public/images/announcements/${req.file.filename}`;
    }
    if (req.body.created_by) {
      req.body.posted_by = req.body.created_by;
      delete req.body.created_by;
    }
    if (!req.body.title_slug && req.body.title) {
      req.body.title_slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    
    // Parse selected_sitios if it's a JSON string
    if (req.body.selected_sitios && typeof req.body.selected_sitios === 'string') {
      try {
        req.body.selected_sitios = JSON.parse(req.body.selected_sitios);
      } catch (error) {
        console.error('Error parsing selected_sitios:', error);
        req.body.selected_sitios = [];
      }
    }
    
    // Map frontend audience values to backend enum values
    const audienceMapping: { [key: string]: string } = {
      'All Residents': 'all_residents',
      'Specific Zone': 'specific_zone',
      'Staff Only': 'staff_only'
    };
    if (req.body.audience && audienceMapping[req.body.audience]) {
      req.body.audience = audienceMapping[req.body.audience];
    }
    
    const announcement = await announcementService.createAnnouncement(req.body);
    try {
      if (announcement.status === "published") {
        let residents;
        if (announcement.audience === "specific_zone" && announcement.selected_sitios && announcement.selected_sitios.length > 0) {
          const sitios = await Sitio.find({ _id: { $in: announcement.selected_sitios } }).select("name");
          const sitioNames = sitios.map((s: any) => s.name);
          residents = await User.find({ 
            user_type: "resident",
            address_sitio: { $in: sitioNames }
          }).select("_id");
        } else {
          residents = await User.find({ user_type: "resident" }).select("_id");
        }
        
        const notifications = residents.map((r) => ({
          recipient_id: String(r._id),
          type: "announcement",
          title: announcement.title,
          message: announcement.header || announcement.title,
          payload: { announcementId: String(announcement._id) },
        }));
        if (notifications.length > 0) {
          await Notification.insertMany(notifications);
        }
      }
    } catch {}
    res.status(201).json(announcement);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const announcements = await announcementService.getAnnouncements();
    
    // Convert stored file paths to frontend access paths
    const announcementsWithCorrectPaths = announcements.map((announcement: any) => {
      if (announcement.banner_image && announcement.banner_image.startsWith('uploads/')) {
        const filename = announcement.banner_image.split('/').pop();
        announcement.banner_image = `/public/images/announcements/${filename}`;
      } else if (announcement.banner_image && announcement.banner_image.startsWith('/public/images/announcements/')) {
        // Already in correct format
        announcement.banner_image = announcement.banner_image;
      } else if (announcement.banner_image && announcement.banner_image.startsWith('public/images/announcements/')) {
        const filename = announcement.banner_image.split('/').pop();
        announcement.banner_image = `/public/images/announcements/${filename}`;
      }
      return announcement;
    });
    
    res.status(200).json(announcementsWithCorrectPaths);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const announcement = await announcementService.getAnnouncementById(
      req.params.id
    );
    if (!announcement) {
      res.status(404).json({ error: "Announcement not found" });
      return;
    }
    
    // Convert stored file paths to frontend access paths
    if (announcement.banner_image && announcement.banner_image.startsWith('uploads/')) {
      const filename = announcement.banner_image.split('/').pop();
      announcement.banner_image = `/public/images/announcements/${filename}`;
    } else if (announcement.banner_image && announcement.banner_image.startsWith('/public/images/announcements/')) {
      // Already in correct format
      announcement.banner_image = announcement.banner_image;
    } else if (announcement.banner_image && announcement.banner_image.startsWith('public/images/announcements/')) {
      const filename = announcement.banner_image.split('/').pop();
      announcement.banner_image = `/public/images/announcements/${filename}`;
    }
    
    res.status(200).json(announcement);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    if (req.file) {
      // Store the file path for database
      req.body.banner_image = `/public/images/announcements/${req.file.filename}`;
    }
    if (req.body.created_by) {
      req.body.posted_by = req.body.created_by;
      delete req.body.created_by;
    }
    if (!req.body.title_slug && req.body.title) {
      req.body.title_slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    
    // Parse selected_sitios if it's a JSON string
    if (req.body.selected_sitios && typeof req.body.selected_sitios === 'string') {
      try {
        req.body.selected_sitios = JSON.parse(req.body.selected_sitios);
      } catch (error) {
        console.error('Error parsing selected_sitios:', error);
        req.body.selected_sitios = [];
      }
    }
    
    // Map frontend audience values to backend enum values
    const audienceMapping: { [key: string]: string } = {
      'All Residents': 'all_residents',
      'Specific Zone': 'specific_zone',
      'Staff Only': 'staff_only'
    };
    if (req.body.audience && audienceMapping[req.body.audience]) {
      req.body.audience = audienceMapping[req.body.audience];
    }
    
    const announcement = await announcementService.updateAnnouncement(
      req.params.id,
      req.body
    );
    if (!announcement)
      return res.status(404).json({ error: "Announcement not found" });
    try {
      if (announcement.status === "published") {
        let residents;
        if (announcement.audience === "specific_zone" && announcement.selected_sitios && announcement.selected_sitios.length > 0) {
          const sitios = await Sitio.find({ _id: { $in: announcement.selected_sitios } }).select("name");
          const sitioNames = sitios.map((s: any) => s.name);
          residents = await User.find({ 
            user_type: "resident",
            address_sitio: { $in: sitioNames }
          }).select("_id");
        } else {
          residents = await User.find({ user_type: "resident" }).select("_id");
        }
        
        const notifications = residents.map((r) => ({
          recipient_id: String(r._id),
          type: "announcement",
          title: announcement.title,
          message: announcement.header || announcement.title,
          payload: { announcementId: String(announcement._id) },
        }));
        if (notifications.length > 0) {
          await Notification.insertMany(notifications);
        }
      }
    } catch {}
    res.status(200).json(announcement);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const announcement = await announcementService.deleteAnnouncement(
      req.params.id
    );
    if (!announcement)
      return res.status(404).json({ error: "Announcement not found" });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
