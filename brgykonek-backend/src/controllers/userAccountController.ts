import { Request, Response } from "express";
import * as userAccountService from "../services/userAccountService";
import { logger } from "../utils/logger";

interface AuthRequest extends Request {
  user?: any;
}

export const disableAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, reason } = req.body;
    const disabledBy = req.user ? String(req.user._id) : "admin";

    if (!userId) {
      res.status(400).json({
        success: false,
        message: "User ID is required",
      });
      return;
    }

    const user = await userAccountService.disableUserAccount({
      userId,
      disabledBy,
      reason,
    });

    res.status(200).json({
      success: true,
      message: "Account disabled successfully",
      data: {
        userId: user._id,
        email: user.email,
        loginDisabled: user.loginDisabled,
        loginDisabledAt: user.loginDisabledAt,
      },
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error("Error in disableAccount controller", { error });
    
    if (errorMessage === "User not found") {
      res.status(404).json({
        success: false,
        message: errorMessage,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
};

export const enableAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    const enabledBy = req.user ? String(req.user._id) : "admin";

    if (!userId) {
      res.status(400).json({
        success: false,
        message: "User ID is required",
      });
      return;
    }

    const user = await userAccountService.enableUserAccount({
      userId,
      enabledBy,
    });

    res.status(200).json({
      success: true,
      message: "Account enabled successfully",
      data: {
        userId: user._id,
        email: user.email,
        loginDisabled: user.loginDisabled,
      },
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error("Error in enableAccount controller", { error });
    
    if (errorMessage === "User not found") {
      res.status(404).json({
        success: false,
        message: errorMessage,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
};

export const getAccountStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: "User ID is required",
      });
      return;
    }

    const status = await userAccountService.getUserAccountStatus(userId);

    res.status(200).json({
      success: true,
      message: "Account status retrieved successfully",
      data: status,
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error("Error in getAccountStatus controller", { error });
    
    if (errorMessage === "User not found") {
      res.status(404).json({
        success: false,
        message: errorMessage,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
};

export const getDisabledAccounts = async (req: Request, res: Response): Promise<void> => {
  try {
    const User = require("../models/User").default;
    
    const disabledAccounts = await User.find({
      loginDisabled: true
    }).select(
      "name email loginDisabledAt loginDisabledBy loginAttempts lastFailedLogin"
    ).sort({ loginDisabledAt: -1 });

    res.status(200).json({
      success: true,
      message: "Disabled accounts retrieved successfully",
      data: disabledAccounts,
    });
  } catch (error) {
    logger.error("Error in getDisabledAccounts controller", { error });
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
