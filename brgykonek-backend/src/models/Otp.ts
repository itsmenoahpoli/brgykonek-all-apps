import mongoose, { Document, Schema } from "mongoose";

export interface IOtp extends Document {
  email: string;
  code: string;
  expires_at: Date;
  verified: boolean;
  type?: string;
}

const otpSchema = new Schema<IOtp>({
  email: { type: String, required: true, index: true },
  code: { type: String, required: true },
  expires_at: { type: Date, required: true },
  verified: { type: Boolean, default: false },
  type: { type: String, default: "email_verification" },
});

export default mongoose.model<IOtp>("Otp", otpSchema);
