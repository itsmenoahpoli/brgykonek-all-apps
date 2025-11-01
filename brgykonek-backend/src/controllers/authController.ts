import { Request, Response } from "express";
import { authService } from "../services/authService";
import * as userAccountService from "../services/userAccountService";

interface AuthRequest extends Request {
  user?: any;
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      mobile_number,
      user_type,
      address,
      birthdate,
      address_sitio,
      address_barangay,
      address_municipality,
      address_province,
    } = req.body;

    console.log('📁 File upload info:', {
      hasFile: !!req.file,
      filePath: req.file?.path,
      fileName: req.file?.filename,
      originalName: req.file?.originalname
    });

    const result = await authService.register({
      name,
      email,
      password,
      mobile_number,
      user_type,
      address,
      birthdate,
      address_sitio,
      address_barangay,
      address_municipality,
      address_province,
      barangay_clearance: req.file ? req.file.path : undefined,
    });

    res.status(201).json({
      message: "User registered successfully. OTP sent to email for verification.",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    if (errorMessage === "User with this email already exists") {
      res.status(400).json({ message: errorMessage });
    } else if (errorMessage === "JWT secret not configured") {
      res.status(500).json({ message: errorMessage });
    } else if (errorMessage.includes("Failed to send OTP to email")) {
      res.status(500).json({ message: "Registration failed: Unable to send verification email. Please try again." });
    } else {
      res.status(400).json({ message: errorMessage });
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, deviceInfo, rememberDevice } = req.body;

    // Check if account is disabled (skip for admin accounts)
    const User = require("../models/User").default;
    const user = await User.findOne({ email });
    
    const isAdminAccount = user && (user.user_type === 'admin' || email.includes('admin'));
    
    if (user && user.loginDisabled && !isAdminAccount) {
      res.status(403).json({ 
        message: "Your account has been disabled temporarily. Max login attempt reached, please contact admin to enable your account" 
      });
      return;
    }

    const result = await authService.login({ 
      email, 
      password, 
      deviceInfo, 
      rememberDevice 
    });

    // Reset login attempts on successful login
    await userAccountService.resetLoginAttempts(email);

    if (result.requiresOTP) {
      res.status(200).json({
        message: "OTP required",
        requiresOTP: true,
        user: result.user,
      });
      return;
    }

    res.status(200).json({
      message: "Login successful",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    if (errorMessage === "Invalid credentials") {
      // Increment login attempts on failed login (skip for admin accounts)
      const User = require("../models/User").default;
      const user = await User.findOne({ email: req.body.email });
      const isAdminAccount = user && (user.user_type === 'admin' || req.body.email.includes('admin'));
      
      if (!isAdminAccount) {
        await userAccountService.incrementLoginAttempts(req.body.email);
      }
      res.status(400).json({ message: errorMessage });
    } else if (errorMessage === "JWT secret not configured") {
      res.status(500).json({ message: errorMessage });
    } else {
      res.status(500).json({ message: "Server error", error: errorMessage });
    }
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const user = await authService.getProfile(req.user.id);

    res.status(200).json({
      message: "Profile retrieved successfully",
      user,
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    if (errorMessage === "User not found") {
      res.status(404).json({ message: errorMessage });
    } else {
      res.status(500).json({ message: "Server error", error: errorMessage });
    }
  }
};

export const getApprovalStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const approved = Boolean(req.user.approved);
    res.status(200).json({ approved });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const requestOTP = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, type } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    await authService.requestOTP(email, type || "registration");

    res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    if (errorMessage === "User not found") {
      res.status(404).json({ success: false, message: errorMessage });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Server error", error: errorMessage });
    }
  }
};

export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp_code, deviceInfo, rememberDevice, type } = req.body;

    if (!email || !otp_code) {
      res
        .status(400)
        .json({ success: false, message: "Email and OTP code are required" });
      return;
    }

    await authService.verifyOTP(email, otp_code, deviceInfo, rememberDevice, type || "registration");

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    if (errorMessage === "User not found") {
      res.status(404).json({ success: false, message: errorMessage });
    } else if (errorMessage === "No OTP requested") {
      res.status(400).json({ success: false, message: errorMessage });
    } else if (errorMessage === "Invalid OTP code") {
      res.status(400).json({ success: false, message: errorMessage });
    } else if (errorMessage === "OTP code has expired") {
      res.status(400).json({ success: false, message: errorMessage });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Server error", error: errorMessage });
    }
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const { 
      name, 
      mobile_number, 
      address, 
      birthdate,
      address_sitio,
      address_barangay,
      address_municipality,
      address_province
    } = req.body;

    const result = await authService.updateProfile(req.user.id, {
      name,
      mobile_number,
      address,
      birthdate,
      address_sitio,
      address_barangay,
      address_municipality,
      address_province,
      barangay_clearance: req.file ? req.file.path : undefined,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: result,
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    if (errorMessage === "User not found") {
      res.status(404).json({ success: false, message: errorMessage });
    } else {
      res.status(500).json({ success: false, message: "Server error", error: errorMessage });
    }
  }
};

export const changePassword = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "User not authenticated" });
      return;
    }

    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      res.status(400).json({ success: false, message: "Current password and new password are required" });
      return;
    }

    const result = await authService.changePassword(req.user.id, current_password, new_password);

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
      user: result,
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    if (errorMessage === "User not found" || errorMessage === "Current password is incorrect") {
      res.status(400).json({ success: false, message: errorMessage });
    } else {
      res.status(500).json({ success: false, message: "Server error", error: errorMessage });
    }
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, otp_code, new_password } = req.body;

    if (!email || !otp_code || !new_password) {
      res.status(400).json({
        message: "Email, OTP code, and new password are required",
      });
      return;
    }

    await authService.resetPassword({ email, otp_code, new_password });

    res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    if (errorMessage === "User not found") {
      res.status(404).json({ message: errorMessage });
    } else if (errorMessage === "Invalid OTP code") {
      res.status(400).json({ message: errorMessage });
    } else if (errorMessage === "OTP code has expired") {
      res.status(400).json({ message: errorMessage });
    } else if (errorMessage === "OTP already used") {
      res.status(400).json({ message: errorMessage });
    } else {
      res.status(500).json({ message: "Server error", error: errorMessage });
    }
  }
};

export const listUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await authService.listUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await authService.getUserById(req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await authService.updateUserById(req.params.id, req.body);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await authService.deleteUserById(req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Device management endpoints
export const getTrustedDevices = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const devices = await authService.getTrustedDevices(req.user.id);
    res.status(200).json({
      message: "Trusted devices retrieved successfully",
      devices,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const revokeDevice = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const { deviceId } = req.params;
    await authService.revokeDevice(deviceId, req.user.id);
    res.status(200).json({
      message: "Device revoked successfully",
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const revokeAllDevices = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    await authService.revokeAllDevices(req.user.id);
    res.status(200).json({
      message: "All devices revoked successfully",
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// User approval endpoints
export const getPendingUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const users = await authService.getPendingUsers();
    res.status(200).json({
      message: "Pending users retrieved successfully",
      users,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getRejectedUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const users = await authService.getRejectedUsers();
    res.status(200).json({
      message: "Rejected users retrieved successfully",
      users,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const approveUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const { userId } = req.params;
    const user = await authService.approveUser(userId, req.user.id);
    
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "User approved successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const rejectUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const { userId } = req.params;
    const user = await authService.rejectUser(userId, req.user.id);
    
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "User rejected successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
