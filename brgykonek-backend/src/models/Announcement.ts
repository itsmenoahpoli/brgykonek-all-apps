import mongoose, { Document, Schema } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  title_slug: string;
  header: string;
  body: string;
  banner_image: string;
  status: "published" | "draft";
  created_at: Date;
  posted_by: string;
  category?: string;
  audience?: string;
  publish_at?: Date;
  selected_sitios?: string[];
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    title_slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 200,
    },
    header: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    body: {
      type: String,
      required: true,
    },
    banner_image: {
      type: String,
      required: false,
      trim: true,
    },
    category: {
      type: String,
      required: false,
      trim: true,
      maxlength: 100,
    },
    audience: {
      type: String,
      enum: ["all_residents", "specific_zone", "staff_only"],
      required: false,
      default: "all_residents",
    },
    status: {
      type: String,
      enum: ["published", "draft"],
      required: true,
      default: "draft",
    },
    publish_at: {
      type: Date,
      required: false,
    },
    created_at: {
      type: Date,
      default: Date.now,
      required: true,
    },
    posted_by: {
      type: String,
      required: true,
      trim: true,
    },
    selected_sitios: {
      type: [String],
      required: false,
      default: [],
    },
  },
  {
    versionKey: false,
  }
);

export default mongoose.model<IAnnouncement>(
  "Announcement",
  announcementSchema
);
