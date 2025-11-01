import fs from "fs";
import path from "path";

const uploadsDir = path.resolve(process.cwd(), "public/files");
const announcementImagesDir = path.resolve(process.cwd(), "public/images/announcements");

export function ensureUploadsDir(): void {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

export function ensureAnnouncementImagesDir(): void {
  if (!fs.existsSync(announcementImagesDir)) {
    fs.mkdirSync(announcementImagesDir, { recursive: true });
  }
}

export function getFile(filename: string): Buffer | null {
  const filePath = path.join(uploadsDir, filename);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath);
  }
  return null;
}

export function getAnnouncementImage(filename: string): Buffer | null {
  const filePath = path.join(announcementImagesDir, filename);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath);
  }
  return null;
}

export function deleteFile(filename: string): boolean {
  const filePath = path.join(uploadsDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

export function deleteAnnouncementImage(filename: string): boolean {
  const filePath = path.join(announcementImagesDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

export function listFiles(): string[] {
  if (fs.existsSync(uploadsDir)) {
    return fs.readdirSync(uploadsDir);
  }
  return [];
}
