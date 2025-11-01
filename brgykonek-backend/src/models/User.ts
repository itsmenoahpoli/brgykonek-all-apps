import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  mobile_number?: string;
  user_type: "resident" | "staff" | "admin";
  address?: string;
  birthdate?: string;
  address_sitio?: string;
  address_barangay?: string;
  address_municipality?: string;
  address_province?: string;
  barangay_clearance?: string;
  approved?: boolean;
  approvedAt?: Date;
  approvedBy?: string;
  isRejected?: boolean;
  loginDisabled?: boolean;
  loginDisabledAt?: Date;
  loginDisabledBy?: string;
  loginAttempts?: number;
  lastFailedLogin?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    mobile_number: {
      type: String,
      trim: true,
    },
    user_type: {
      type: String,
      enum: {
        values: ["resident", "staff", "admin"],
        message: "User type must be either resident, staff, or admin",
      },
      required: [true, "User type is required"],
      default: "resident",
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, "Address cannot exceed 200 characters"],
    },
    birthdate: {
      type: String,
      trim: true,
    },
    address_sitio: {
      type: String,
      trim: true,
      maxlength: [100, "Sitio cannot exceed 100 characters"],
    },
    address_barangay: {
      type: String,
      trim: true,
      maxlength: [100, "Barangay cannot exceed 100 characters"],
    },
    address_municipality: {
      type: String,
      trim: true,
      maxlength: [100, "Municipality cannot exceed 100 characters"],
    },
    address_province: {
      type: String,
      trim: true,
      maxlength: [100, "Province cannot exceed 100 characters"],
    },
    barangay_clearance: {
      type: String,
      required: false,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: String,
      ref: 'User',
      default: null,
    },
    isRejected: {
      type: Boolean,
      default: false,
    },
    loginDisabled: {
      type: Boolean,
      default: false,
    },
    loginDisabledAt: {
      type: Date,
      default: null,
    },
    loginDisabledBy: {
      type: String,
      ref: 'User',
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lastFailedLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export default mongoose.model<IUser>("User", userSchema);
