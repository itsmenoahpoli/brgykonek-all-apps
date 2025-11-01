import mongoose from "mongoose";

const DocumentRequestSchema = new mongoose.Schema(
  {
    resident_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    document_type: {
      type: String,
      required: true,
      enum: ["Barangay Clearance", "Residency", "Indigency", "Business Permit"],
    },
    notes: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["pending", "received", "seen_by_staff", "in_progress", "completed", "rejected"],
      default: "pending",
      required: true,
    },
    staff_notes: {
      type: String,
      required: false,
    },
    completed_at: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const DocumentRequest = mongoose.model("DocumentRequest", DocumentRequestSchema);

export default DocumentRequest;
