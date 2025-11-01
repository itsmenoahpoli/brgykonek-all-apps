import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  recipient_id: string;
  type: "announcement" | "complaint_update" | "document_request_update";
  title: string;
  message: string;
  payload?: Record<string, any>;
  read: boolean;
  created_at: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient_id: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["announcement", "complaint_update", "document_request_update"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, required: false },
    read: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export default mongoose.model<INotification>(
  "Notification",
  notificationSchema
);


