import mongoose, { Document, Schema } from 'mongoose';

export interface IDevice extends Document {
  userId: string;
  deviceId: string;
  deviceName: string;
  userAgent: string;
  ipAddress: string;
  isTrusted: boolean;
  lastUsed: Date;
  createdAt: Date;
  expiresAt: Date;
}

const DeviceSchema = new Schema<IDevice>({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  deviceName: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  isTrusted: {
    type: Boolean,
    default: false
  },
  lastUsed: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
DeviceSchema.index({ userId: 1, deviceId: 1 });
DeviceSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IDevice>('Device', DeviceSchema);
