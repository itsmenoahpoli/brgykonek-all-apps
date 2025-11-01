import User from "../models/User";
import { logger } from "../utils/logger";

export interface DisableAccountData {
  userId: string;
  disabledBy: string;
  reason?: string;
}

export interface EnableAccountData {
  userId: string;
  enabledBy: string;
}

export const disableUserAccount = async (data: DisableAccountData) => {
  try {
    const user = await User.findByIdAndUpdate(
      data.userId,
      {
        loginDisabled: true,
        loginDisabledAt: new Date(),
        loginDisabledBy: data.disabledBy,
        loginAttempts: 3, // Set to max attempts to trigger lockout
      },
      { new: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    logger.info("User account disabled", { 
      userId: data.userId, 
      disabledBy: data.disabledBy,
      reason: data.reason 
    });

    return user;
  } catch (error) {
    logger.error("Error disabling user account", { error, data });
    throw error;
  }
};

export const enableUserAccount = async (data: EnableAccountData) => {
  try {
    const user = await User.findByIdAndUpdate(
      data.userId,
      {
        loginDisabled: false,
        loginDisabledAt: null,
        loginDisabledBy: null,
        loginAttempts: 0, // Reset login attempts
        lastFailedLogin: null,
      },
      { new: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    logger.info("User account enabled", { 
      userId: data.userId, 
      enabledBy: data.enabledBy 
    });

    return user;
  } catch (error) {
    logger.error("Error enabling user account", { error, data });
    throw error;
  }
};

export const getUserAccountStatus = async (userId: string) => {
  try {
    const user = await User.findById(userId).select(
      "name email loginDisabled loginDisabledAt loginDisabledBy loginAttempts lastFailedLogin"
    );

    if (!user) {
      throw new Error("User not found");
    }

    return {
      userId: user._id,
      name: user.name,
      email: user.email,
      loginDisabled: user.loginDisabled,
      loginDisabledAt: user.loginDisabledAt,
      loginDisabledBy: user.loginDisabledBy,
      loginAttempts: user.loginAttempts,
      lastFailedLogin: user.lastFailedLogin,
    };
  } catch (error) {
    logger.error("Error getting user account status", { error, userId });
    throw error;
  }
};

export const incrementLoginAttempts = async (email: string) => {
  try {
    const user = await User.findOneAndUpdate(
      { email },
      {
        $inc: { loginAttempts: 1 },
        $set: { lastFailedLogin: new Date() }
      },
      { new: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    // If login attempts reach 3, disable the account
    if (user.loginAttempts && user.loginAttempts >= 3) {
      await disableUserAccount({
        userId: String(user._id),
        disabledBy: "system",
        reason: "Maximum login attempts exceeded"
      });
    }

    return user;
  } catch (error) {
    logger.error("Error incrementing login attempts", { error, email });
    throw error;
  }
};

export const resetLoginAttempts = async (email: string) => {
  try {
    const user = await User.findOneAndUpdate(
      { email },
      {
        loginAttempts: 0,
        lastFailedLogin: null,
      },
      { new: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    logger.info("Login attempts reset", { email });
    return user;
  } catch (error) {
    logger.error("Error resetting login attempts", { error, email });
    throw error;
  }
};
