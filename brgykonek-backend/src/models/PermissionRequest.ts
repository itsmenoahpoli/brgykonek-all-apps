import mongoose from "mongoose";

const PermissionRequestSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      required: true,
    },
    current_value: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    request_change_value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    reviewed_at: {
      type: Date,
      required: false,
    },
    review_notes: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const PermissionRequest = mongoose.model("PermissionRequest", PermissionRequestSchema);

export default PermissionRequest;

