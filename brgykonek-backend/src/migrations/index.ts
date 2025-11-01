import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User";
import Complaint from "../models/Complaint";
import Announcement from "../models/Announcement";
import argon2 from "argon2";

dotenv.config();

interface Migration {
  id: string;
  name: string;
  up: () => Promise<void>;
  down?: () => Promise<void>;
}

const migrations: Migration[] = [
  {
    id: "001_create_user_indexes",
    name: "Create User model indexes",
    up: async () => {
      console.log("Creating User model indexes...");
      await User.createIndexes();
      console.log("✓ User indexes created successfully");
    },
    down: async () => {
      console.log("Dropping User model indexes...");
      await User.collection.dropIndexes();
      console.log("✓ User indexes dropped successfully");
    },
  },
  {
    id: "002_ensure_user_collection",
    name: "Ensure User collection exists",
    up: async () => {
      console.log("Ensuring User collection exists...");
      if (!mongoose.connection.db) {
        throw new Error("Database connection not established");
      }
      const collections = await mongoose.connection.db
        .listCollections({ name: "users" })
        .toArray();
      if (collections.length === 0) {
        await mongoose.connection.createCollection("users");
        console.log("✓ User collection created");
      } else {
        console.log("✓ User collection already exists");
      }
    },
  },
  {
    id: "003_seed_residents_complaints_announcements",
    name: "Seed resident accounts, resident complaints, and admin announcements",
    up: async () => {
      const residents = [
        {
          name: "Juan Dela Cruz",
          email: "juan@example.com",
          password: "password123",
          user_type: "resident",
          address: "123 Main St",
          birthdate: new Date("1990-01-01"),
          mobile_number: "09171234567",
        },
        {
          name: "Maria Santos",
          email: "maria@example.com",
          password: "password123",
          user_type: "resident",
          address: "456 Second St",
          birthdate: new Date("1985-05-15"),
          mobile_number: "09181234567",
        },
      ];
      const admins = [
        {
          name: "Admin User",
          email: "admin@example.com",
          password: "adminpass",
          user_type: "admin",
          address: "Barangay Hall",
          birthdate: new Date("1980-12-12"),
          mobile_number: "09991234567",
        },
      ];
      for (const user of residents) {
        user.password = await argon2.hash(user.password);
      }
      for (const user of admins) {
        user.password = await argon2.hash(user.password);
      }
      const createdResidents = await User.insertMany(residents);
      const createdAdmins = await User.insertMany(admins);
      const announcements = [
        {
          title: "Barangay Assembly",
          title_slug: "barangay-assembly",
          header: "Join our barangay assembly",
          body: "We invite all residents to join the upcoming barangay assembly this Saturday.",
          banner_image:
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
          status: "published",
          created_at: new Date(),
          posted_by: createdAdmins[0].name,
        },
        {
          title: "Garbage Collection Schedule",
          title_slug: "garbage-collection-schedule",
          header: "New garbage collection schedule",
          body: "Garbage will now be collected every Monday and Thursday.",
          banner_image:
            "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80",
          status: "published",
          created_at: new Date(),
          posted_by: createdAdmins[0].name,
        },
        {
          title: "Free Medical Checkup",
          title_slug: "free-medical-checkup",
          header: "Avail free medical checkup this Sunday",
          body: "Barangay health center offers free checkup for all residents.",
          banner_image:
            "https://images.unsplash.com/photo-1519494080410-f9aa8f52f1e7?auto=format&fit=crop&w=800&q=80",
          status: "published",
          created_at: new Date(),
          posted_by: createdAdmins[0].name,
        },
        {
          title: "COVID-19 Vaccination Drive",
          title_slug: "covid19-vaccination-drive",
          header: "Get vaccinated at the barangay hall",
          body: "Walk-in vaccinations available for all age groups.",
          banner_image:
            "https://images.unsplash.com/photo-1588776814546-ec7e1b1b1b1b?auto=format&fit=crop&w=800&q=80",
          status: "published",
          created_at: new Date(),
          posted_by: createdAdmins[0].name,
        },
        {
          title: "Barangay Fiesta",
          title_slug: "barangay-fiesta",
          header: "Celebrate our annual fiesta",
          body: "Join us for food, games, and fun activities.",
          banner_image:
            "https://images.unsplash.com/photo-1509228468518-c5eeecbff44a?auto=format&fit=crop&w=800&q=80",
          status: "published",
          created_at: new Date(),
          posted_by: createdAdmins[0].name,
        },
        {
          title: "Blood Donation Camp",
          title_slug: "blood-donation-camp",
          header: "Donate blood, save lives",
          body: "Blood donation camp at the barangay gymnasium.",
          banner_image:
            "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
          status: "published",
          created_at: new Date(),
          posted_by: createdAdmins[0].name,
        },
        {
          title: "Tree Planting Activity",
          title_slug: "tree-planting-activity",
          header: "Let’s make our barangay greener",
          body: "Participate in our tree planting event this weekend.",
          banner_image:
            "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=800&q=80",
          status: "published",
          created_at: new Date(),
          posted_by: createdAdmins[0].name,
        },
        {
          title: "Youth Sports Fest",
          title_slug: "youth-sports-fest",
          header: "Calling all youth for the sports fest",
          body: "Basketball, volleyball, and more at the covered court.",
          banner_image:
            "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80",
          status: "published",
          created_at: new Date(),
          posted_by: createdAdmins[0].name,
        },
        {
          title: "Senior Citizens’ Day",
          title_slug: "senior-citizens-day",
          header: "Special day for our senior citizens",
          body: "Free lunch and entertainment for all senior residents.",
          banner_image:
            "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80",
          status: "published",
          created_at: new Date(),
          posted_by: createdAdmins[0].name,
        },
        {
          title: "Barangay Clean-Up Drive",
          title_slug: "barangay-cleanup-drive",
          header: "Join our clean-up drive",
          body: "Let’s keep our barangay clean and green.",
          banner_image:
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
          status: "published",
          created_at: new Date(),
          posted_by: createdAdmins[0].name,
        },
      ];
      const complaintCategories = [
        "Noise",
        "Garbage",
        "Vandalism",
        "Water Supply",
        "Road Damage",
        "Stray Animals",
        "Illegal Parking",
        "Street Light",
        "Flooding",
        "Other",
      ];
      const complaintContents = [
        "Loud music every night.",
        "Uncollected garbage in the street.",
        "Graffiti on the wall.",
        "No water supply since morning.",
        "Potholes on the main road.",
        "Stray dogs roaming around.",
        "Cars blocking the driveway.",
        "Street light not working.",
        "Flooding during heavy rain.",
        "Other miscellaneous complaint.",
      ];
      let complaints = [];
      for (let i = 0; i < 30; i++) {
        const category = complaintCategories[i % complaintCategories.length];
        const status = ((): string => {
          const mod = i % 4;
          if (mod === 0) return "pending";
          if (mod === 1) return "in_progress";
          if (mod === 2) return "resolved";
          return "rejected";
        })();
        const priority = ((): string => {
          const mod = i % 3;
          if (mod === 0) return "low";
          if (mod === 1) return "medium";
          return "high";
        })();
        complaints.push({
          resident_id: createdResidents[i % createdResidents.length]._id,
          title: `${category} Issue #${i + 1}`,
          category,
          date_of_report: new Date(Date.now() - i * 86400000),
          location_of_incident: "",
          complaint_content:
            complaintContents[i % complaintContents.length] + ` [${i + 1}]`,
          attachments: [],
          status,
          priority,
        });
      }
      await Complaint.insertMany(complaints);
      await Announcement.insertMany(announcements);
    },
    down: async () => {
      await User.deleteMany({
        email: {
          $in: ["juan@example.com", "maria@example.com", "admin@example.com"],
        },
      });
      await Complaint.deleteMany({ complaint_content: { $regex: /\[\d+\]$/ } });
      await Announcement.deleteMany({
        title_slug: {
          $in: [
            "barangay-assembly",
            "garbage-collection-schedule",
            "free-medical-checkup",
            "covid19-vaccination-drive",
            "barangay-fiesta",
            "blood-donation-camp",
            "tree-planting-activity",
            "youth-sports-fest",
            "senior-citizens-day",
            "barangay-cleanup-drive",
          ],
        },
      });
    },
  },
  {
    id: "004_seed_staff_user",
    name: "Seed a default staff user",
    up: async () => {
      const existing = await User.findOne({ email: "staff@example.com" });
      if (existing) {
        console.log("Staff user already exists, skipping seeding.");
        return;
      }
      const passwordHash = await argon2.hash("staffpass");
      await User.create({
        name: "Staff User",
        email: "staff@example.com",
        password: passwordHash,
        user_type: "staff",
        address: "Barangay Hall",
        birthdate: new Date("1988-06-15").toISOString(),
        mobile_number: "09881234567",
        approved: true,
      });
      console.log("✓ Staff user seeded successfully");
    },
    down: async () => {
      await User.deleteOne({ email: "staff@example.com" });
      console.log("✓ Staff user removed successfully");
    },
  },
];

export const runMigrations = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable is not defined");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✓ Connected to MongoDB");

    console.log("\nStarting migrations...");
    console.log("=".repeat(50));

    for (const migration of migrations) {
      console.log(`\nRunning migration: ${migration.name} (${migration.id})`);
      try {
        await migration.up();
        console.log(`✓ Migration ${migration.id} completed successfully`);
      } catch (error) {
        console.error(`✗ Migration ${migration.id} failed:`, error);
        throw error;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("✓ All migrations completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

export const rollbackMigrations = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable is not defined");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✓ Connected to MongoDB");

    console.log("\nRolling back migrations...");
    console.log("=".repeat(50));

    for (let i = migrations.length - 1; i >= 0; i--) {
      const migration = migrations[i];
      if (migration.down) {
        console.log(
          `\nRolling back migration: ${migration.name} (${migration.id})`
        );
        try {
          await migration.down();
          console.log(`✓ Migration ${migration.id} rolled back successfully`);
        } catch (error) {
          console.error(
            `✗ Rollback of migration ${migration.id} failed:`,
            error
          );
          throw error;
        }
      } else {
        console.log(
          `\nSkipping rollback for migration ${migration.id} (no down migration defined)`
        );
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("✓ All migrations rolled back successfully!");
  } catch (error) {
    console.error("Rollback failed:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

if (require.main === module) {
  const command = process.argv[2];

  if (command === "rollback") {
    rollbackMigrations();
  } else {
    runMigrations();
  }
}
