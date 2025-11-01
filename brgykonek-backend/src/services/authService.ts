import jwt, { SignOptions } from "jsonwebtoken";
import User, { IUser } from "../models/User";
import { emailService } from "./emailService";
import Otp from "../models/Otp";
import argon2 from "argon2";
import { deviceService, DeviceInfo } from "./deviceService";

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  mobile_number?: string;
  user_type?: string;
  address?: string;
  birthdate?: string;
  address_sitio?: string;
  address_barangay?: string;
  address_municipality?: string;
  address_province?: string;
  barangay_clearance?: string;
}

export interface LoginData {
  email: string;
  password: string;
  deviceInfo?: DeviceInfo;
  rememberDevice?: boolean;
}

export interface UpdateProfileData {
  name?: string;
  mobile_number?: string;
  address?: string;
  birthdate?: string;
  address_sitio?: string;
  address_barangay?: string;
  address_municipality?: string;
  address_province?: string;
  barangay_clearance?: string;
}

export interface ResetPasswordData {
  email: string;
  otp_code: string;
  new_password: string;
}

export interface AuthResult {
  token?: string;
  requiresOTP?: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    mobile_number?: string;
    user_type: string;
    address?: string;
    birthdate?: string;
    address_sitio?: string;
    address_barangay?: string;
    address_municipality?: string;
    address_province?: string;
    barangay_clearance?: string;
    approved?: boolean;
  };
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResult> {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT secret not configured");
    }

    const hashedPassword = await argon2.hash(data.password);
    
    console.log('💾 Saving user with barangay_clearance:', data.barangay_clearance);
    
    const user = new User({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      mobile_number: data.mobile_number,
      user_type: data.user_type || "resident",
      address: data.address,
      birthdate: data.birthdate,
      address_sitio: data.address_sitio,
      address_barangay: data.address_barangay,
      address_municipality: data.address_municipality,
      address_province: data.address_province,
      barangay_clearance: data.barangay_clearance,
      approved: data.user_type === "admin" || data.user_type === "staff", // Auto-approve staff and admin
    });

    await user.save();

    // Send OTP to email asynchronously - don't block registration
    this.requestOTP(user.email, "registration")
      .then(() => {
        console.log(`✅ OTP sent successfully to ${user.email} for registration`);
      })
      .catch((e) => {
        console.error(`❌ Failed to send OTP to ${user.email}:`, e);
        // Log the error but don't delete the user - they can request OTP again
      });

    const userId = user._id?.toString();
    if (!userId) {
      throw new Error("User ID not found");
    }
    const token = jwt.sign({ userId }, jwtSecret, {
      expiresIn: (process.env.JWT_EXPIRES_IN as string) || "7d",
    } as SignOptions);

    return {
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        mobile_number: user.mobile_number,
        user_type: user.user_type,
        address: user.address,
        birthdate: user.birthdate,
        address_sitio: user.address_sitio,
        address_barangay: user.address_barangay,
        address_municipality: user.address_municipality,
        address_province: user.address_province,
        barangay_clearance: user.barangay_clearance,
        approved: user.approved,
      },
    };
  },

  async login(data: LoginData): Promise<AuthResult> {
    const user = (await User.findOne({
      email: data.email,
    }).exec()) as IUser | null;
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await argon2.verify(user.password, data.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT secret not configured");
    }

    const userId = user._id?.toString();
    if (!userId) {
      throw new Error("User ID not found");
    }

    if (data.deviceInfo) {
      const deviceTrust = await deviceService.checkDeviceTrust(userId, data.deviceInfo);
      if (!deviceTrust.isTrusted) {
        await this.requestOTP(user.email);
        return {
          requiresOTP: true,
          user: {
            id: userId,
            name: user.name,
            email: user.email,
            mobile_number: user.mobile_number,
            user_type: user.user_type,
            address: user.address,
            birthdate: user.birthdate,
            address_sitio: user.address_sitio,
            address_barangay: user.address_barangay,
            address_municipality: user.address_municipality,
            address_province: user.address_province,
            barangay_clearance: user.barangay_clearance,
            approved: user.approved,
          },
        };
      }
      await deviceService.updateDeviceLastUsed(data.deviceInfo.deviceId);
    }

    const token = jwt.sign({ userId }, jwtSecret, {
      expiresIn: (process.env.JWT_EXPIRES_IN as string) || "7d",
    } as SignOptions);

    return {
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        mobile_number: user.mobile_number,
        user_type: user.user_type,
        address: user.address,
        birthdate: user.birthdate,
        address_sitio: user.address_sitio,
        address_barangay: user.address_barangay,
        address_municipality: user.address_municipality,
        address_province: user.address_province,
        barangay_clearance: user.barangay_clearance,
        approved: user.approved,
      },
    };
  },

  async getProfile(userId: string) {
    const user = (await User.findById(userId).exec()) as IUser | null;
    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user._id?.toString(),
      name: user.name,
      email: user.email,
      mobile_number: user.mobile_number,
      user_type: user.user_type,
      address: user.address,
      birthdate: user.birthdate,
      address_sitio: user.address_sitio,
      address_barangay: user.address_barangay,
      address_municipality: user.address_municipality,
      address_province: user.address_province,
      barangay_clearance: user.barangay_clearance,
      approved: user.approved,
    };
  },

  async requestOTP(email: string, type: "registration" | "password_reset" = "registration"): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Remove any previous OTPs for this email
    await Otp.deleteMany({ email, type });

    await Otp.create({
      email,
      code: otpCode,
      expires_at: otpExpiresAt,
      verified: false,
      type,
    });

    await emailService.sendOTP(email, otpCode);
  },

  async verifyOTP(email: string, otpCode: string, deviceInfo?: DeviceInfo, rememberDevice?: boolean, type: "registration" | "password_reset" = "registration"): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    const otp = await Otp.findOne({
      email,
      code: otpCode,
      type,
    });
    if (!otp) {
      throw new Error("Invalid OTP code");
    }

    if (otp.verified) {
      throw new Error("OTP already used");
    }

    if (new Date() > otp.expires_at) {
      throw new Error("OTP code has expired");
    }

    otp.verified = true;
    await otp.save();

    if (user && deviceInfo && rememberDevice) {
      await deviceService.createDevice(user._id!.toString(), deviceInfo, true);
    }
  },

  async updateProfile(userId: string, data: UpdateProfileData) {
    const user = (await User.findById(userId).exec()) as IUser | null;
    if (!user) {
      throw new Error("User not found");
    }

    if (data.name) {
      user.name = data.name;
    }
    if (data.mobile_number !== undefined) {
      user.mobile_number = data.mobile_number;
    }
    if (data.address !== undefined) {
      user.address = data.address;
    }
    if (data.birthdate) {
      user.birthdate = data.birthdate;
    }
    if (data.address_sitio !== undefined) {
      user.address_sitio = data.address_sitio;
    }
    if (data.address_barangay !== undefined) {
      user.address_barangay = data.address_barangay;
    }
    if (data.address_municipality !== undefined) {
      user.address_municipality = data.address_municipality;
    }
    if (data.address_province !== undefined) {
      user.address_province = data.address_province;
    }
    if (data.barangay_clearance !== undefined) {
      user.barangay_clearance = data.barangay_clearance;
    }

    await user.save();

    return {
      id: user._id?.toString(),
      name: user.name,
      email: user.email,
      mobile_number: user.mobile_number,
      user_type: user.user_type,
      address: user.address,
      birthdate: user.birthdate,
      address_sitio: user.address_sitio,
      address_barangay: user.address_barangay,
      address_municipality: user.address_municipality,
      address_province: user.address_province,
      barangay_clearance: user.barangay_clearance,
    };
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = (await User.findById(userId).exec()) as IUser | null;
    if (!user) {
      throw new Error("User not found");
    }

    const isCurrentPasswordValid = await argon2.verify(user.password, currentPassword);
    if (!isCurrentPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    const hashedNewPassword = await argon2.hash(newPassword);
    user.password = hashedNewPassword;
    await user.save();

    return {
      id: user._id?.toString(),
      name: user.name,
      email: user.email,
      mobile_number: user.mobile_number,
      user_type: user.user_type,
      address: user.address,
      birthdate: user.birthdate,
      address_sitio: user.address_sitio,
      address_barangay: user.address_barangay,
      address_municipality: user.address_municipality,
      address_province: user.address_province,
      barangay_clearance: user.barangay_clearance,
    };
  },

  async resetPassword(data: ResetPasswordData): Promise<void> {
    const user = await User.findOne({ email: data.email });
    if (!user) {
      throw new Error("User not found");
    }

    const otp = await Otp.findOne({
      email: data.email,
      code: data.otp_code,
      type: "password_reset",
    });
    if (!otp) {
      throw new Error("Invalid OTP code");
    }
    if (new Date() > otp.expires_at) {
      throw new Error("OTP code has expired");
    }
    if (otp.verified) {
      throw new Error("OTP already used");
    }
    otp.verified = true;
    await otp.save();

    user.password = await argon2.hash(data.new_password);
    await user.save();
  },

  async listUsers() {
    return User.find().select("-password");
  },

  async getUserById(userId: string) {
    return User.findById(userId).select("-password");
  },

  async updateUserById(userId: string, data: Partial<IUser>) {
    if (data.password) {
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");
      user.password = data.password;
      if (data.name !== undefined) user.name = data.name;
      if (data.mobile_number !== undefined)
        user.mobile_number = data.mobile_number;
      if (data.user_type !== undefined) user.user_type = data.user_type;
      if (data.address !== undefined) user.address = data.address;
      if (data.birthdate !== undefined) user.birthdate = data.birthdate;
      if (data.address_sitio !== undefined)
        user.address_sitio = data.address_sitio;
      if (data.address_barangay !== undefined)
        user.address_barangay = data.address_barangay;
      if (data.address_municipality !== undefined)
        user.address_municipality = data.address_municipality;
      if (data.address_province !== undefined)
        user.address_province = data.address_province;
      if (data.barangay_clearance !== undefined)
        user.barangay_clearance = data.barangay_clearance;
      await user.save();
      return User.findById(userId).select("-password");
    } else {
      return User.findByIdAndUpdate(userId, data, {
        new: true,
        runValidators: true,
      }).select("-password");
    }
  },

  async deleteUserById(userId: string) {
    return User.findByIdAndDelete(userId);
  },

  // Device management methods
  async getTrustedDevices(userId: string) {
    return deviceService.getTrustedDevices(userId);
  },

  async revokeDevice(deviceId: string, userId: string) {
    return deviceService.revokeDevice(deviceId, userId);
  },

  async revokeAllDevices(userId: string) {
    return deviceService.revokeAllDevices(userId);
  },

  // User approval methods
  async getPendingUsers() {
    return User.find({ 
      approved: false, 
      user_type: "resident" 
    }).select("-password");
  },

  async getRejectedUsers() {
    return User.find({ 
      isRejected: true 
    }).select("-password").sort({ updatedAt: -1 });
  },

  async approveUser(userId: string, approvedBy: string) {
    return User.findByIdAndUpdate(
      userId,
      { 
        approved: true, 
        approvedAt: new Date(), 
        approvedBy 
      },
      { new: true }
    ).select("-password");
  },

  async rejectUser(userId: string, approvedBy: string) {
    return User.findByIdAndUpdate(
      userId,
      { 
        isRejected: true,
        approved: false
      },
      { new: true }
    ).select("-password");
  },
};
