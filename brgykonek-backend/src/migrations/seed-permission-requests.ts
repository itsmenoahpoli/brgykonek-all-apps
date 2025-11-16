import mongoose from "mongoose";
import dotenv from "dotenv";
import PermissionRequest from "../models/PermissionRequest";
import User from "../models/User";
import { connectDB } from "../config/database";

dotenv.config();

const seedPermissionRequests = async () => {
  try {
    await connectDB();
    console.log("Connected to database");

    // Clear existing permission requests
    await PermissionRequest.deleteMany({});
    console.log("Cleared existing permission requests");

    // Get some resident users
    const residents = await User.find({ user_type: "resident" }).limit(5);
    
    if (residents.length === 0) {
      console.log("No resident users found. Please seed users first.");
      return;
    }

    const permissionRequests = [];

    // Create sample permission requests
    for (const resident of residents) {
      // Sample 1: Name change request
      permissionRequests.push({
        user_id: resident._id,
        status: Math.random() > 0.5 ? "pending" : Math.random() > 0.5 ? "approved" : "rejected",
        current_value: {
          name: resident.name,
        },
        request_change_value: {
          name: `${resident.name} Updated`,
        },
        reason: "I need to update my name due to marriage.",
      });

      // Sample 2: Address change request
      if (resident.address) {
        permissionRequests.push({
          user_id: resident._id,
          status: Math.random() > 0.5 ? "pending" : Math.random() > 0.5 ? "approved" : "rejected",
          current_value: {
            address: resident.address,
            address_sitio: resident.address_sitio || "",
            address_barangay: resident.address_barangay || "",
          },
          request_change_value: {
            address: "New Address Street 123",
            address_sitio: "Sitio 5",
            address_barangay: "Barangay New",
          },
          reason: "I moved to a new address and need to update my profile.",
        });
      }

      // Sample 3: Mobile number change request
      if (resident.mobile_number) {
        permissionRequests.push({
          user_id: resident._id,
          status: "pending",
          current_value: {
            mobile_number: resident.mobile_number,
          },
          request_change_value: {
            mobile_number: `09${Math.floor(Math.random() * 1000000000).toString().padStart(9, "0")}`,
          },
          reason: "I changed my mobile number and need to update it.",
        });
      }
    }

    // Insert permission requests
    const createdRequests = await PermissionRequest.insertMany(permissionRequests);
    console.log(`Created ${createdRequests.length} permission requests`);

    // Update some requests with reviewed_by and reviewed_at for approved/rejected ones
    const admin = await User.findOne({ user_type: "admin" });
    if (admin) {
      for (const request of createdRequests) {
        if (request.status !== "pending") {
          request.reviewed_by = admin._id as any;
          request.reviewed_at = new Date();
          if (request.status === "rejected") {
            request.review_notes = "Please provide additional documentation.";
          }
          await request.save();
        }
      }
    }

    console.log("Permission requests seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding permission requests:", error);
    process.exit(1);
  }
};

seedPermissionRequests();

