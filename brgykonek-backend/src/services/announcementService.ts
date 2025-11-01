import Announcement, { IAnnouncement } from "../models/Announcement";

export const createAnnouncement = async (data: Partial<IAnnouncement>) => {
  const announcement = new Announcement(data);
  return announcement.save();
};

export const getAnnouncements = async (filter = {}, options = {}) => {
  return Announcement.find(filter, null, options).sort({ created_at: -1 });
};

export const getAnnouncementById = async (id: string) => {
  return Announcement.findById(id);
};

export const updateAnnouncement = async (
  id: string,
  data: Partial<IAnnouncement>
) => {
  return Announcement.findByIdAndUpdate(id, data, { new: true });
};

export const deleteAnnouncement = async (id: string) => {
  return Announcement.findByIdAndDelete(id);
};
