import User, { IUser } from "../models/User";
import argon2 from "argon2";

export const listUsers = async () => {
  return User.find().select("-password");
};

export const getUserById = async (userId: string) => {
  return User.findById(userId).select("-password");
};

export const updateUserById = async (userId: string, data: Partial<IUser>) => {
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
};

export const deleteUserById = async (userId: string) => {
  return User.findByIdAndDelete(userId);
};

export const createUser = async (data: Partial<IUser>) => {
  if (!data.name || !data.email || !data.password || !data.user_type) {
    throw new Error("Missing required fields");
  }
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }
  const hashedPassword = await argon2.hash(data.password);
  const user = new User({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    mobile_number: data.mobile_number,
    user_type: data.user_type,
    address: data.address,
    birthdate: data.birthdate,
    barangay_clearance: data.barangay_clearance,
  });
  await user.save();
  return User.findById(user._id).select("-password");
};

export const getResidents = async () => {
  return User.find({ user_type: "resident" }).select("-password");
};

export const getRejectedUsers = async () => {
  return User.find({ isRejected: true }).select("-password").sort({ updatedAt: -1 });
};
