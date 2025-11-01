import crypto from 'crypto';
import Device, { IDevice } from '../models/Device';

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  userAgent: string;
  ipAddress: string;
}

export interface TrustedDeviceResult {
  isTrusted: boolean;
  requiresOTP: boolean;
  deviceId?: string;
}

export const deviceService = {
  generateDeviceId(): string {
    return crypto.randomBytes(32).toString('hex');
  },

  async createDevice(
    userId: string,
    deviceInfo: DeviceInfo,
    rememberDevice: boolean = false
  ): Promise<IDevice> {
    const expiresAt = rememberDevice 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day

    const device = new Device({
      userId,
      deviceId: deviceInfo.deviceId,
      deviceName: deviceInfo.deviceName,
      userAgent: deviceInfo.userAgent,
      ipAddress: deviceInfo.ipAddress,
      isTrusted: rememberDevice,
      expiresAt
    });

    return await device.save();
  },

  async findTrustedDevice(
    userId: string,
    deviceId: string
  ): Promise<IDevice | null> {
    return await Device.findOne({
      userId,
      deviceId,
      isTrusted: true,
      expiresAt: { $gt: new Date() }
    });
  },

  async updateDeviceLastUsed(deviceId: string): Promise<void> {
    await Device.findOneAndUpdate(
      { deviceId },
      { lastUsed: new Date() }
    );
  },

  async getTrustedDevices(userId: string): Promise<IDevice[]> {
    return await Device.find({
      userId,
      isTrusted: true,
      expiresAt: { $gt: new Date() }
    }).sort({ lastUsed: -1 });
  },

  async revokeDevice(deviceId: string, userId: string): Promise<void> {
    await Device.findOneAndDelete({
      deviceId,
      userId
    });
  },

  async revokeAllDevices(userId: string): Promise<void> {
    await Device.deleteMany({ userId });
  },

  async checkDeviceTrust(
    userId: string,
    deviceInfo: DeviceInfo
  ): Promise<TrustedDeviceResult> {
    const trustedDevice = await this.findTrustedDevice(userId, deviceInfo.deviceId);
    
    if (trustedDevice) {
      await this.updateDeviceLastUsed(deviceInfo.deviceId);
      return {
        isTrusted: true,
        requiresOTP: false,
        deviceId: trustedDevice.deviceId
      };
    }

    return {
      isTrusted: false,
      requiresOTP: true
    };
  },

  async cleanupExpiredDevices(): Promise<void> {
    await Device.deleteMany({
      expiresAt: { $lt: new Date() }
    });
  }
};
