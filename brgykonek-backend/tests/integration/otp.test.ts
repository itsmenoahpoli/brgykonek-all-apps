import request from "supertest";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "../../src/routes/auth";
import User from "../../src/models/User";
import Otp from "../../src/models/Otp";

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);

describe("OTP Endpoints", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Otp.deleteMany({});
  });

  describe("POST /api/auth/request-otp", () => {
    it("should request OTP for existing user", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        user_type: "resident",
      };

      await User.create(userData);

      const response = await request(app)
        .post("/api/auth/request-otp")
        .send({ email: "test@example.com" })
        .expect(200);

      expect(response.body.message).toBe("OTP sent successfully to your email");

      const otp = await Otp.findOne({ email: "test@example.com" });
      expect(otp?.code).toBeDefined();
      expect(otp?.expires_at).toBeDefined();
      expect(otp?.verified).toBe(false);
    });

    it("should return 404 for non-existing user", async () => {
      const response = await request(app)
        .post("/api/auth/request-otp")
        .send({ email: "nonexistent@example.com" })
        .expect(404);

      expect(response.body.message).toBe("User not found");
    });

    it("should return 400 when email is missing", async () => {
      const response = await request(app)
        .post("/api/auth/request-otp")
        .send({})
        .expect(400);

      expect(response.body.message).toBe("Email is required");
    });
  });

  describe("POST /api/auth/verify-otp", () => {
    it("should verify OTP successfully", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        user_type: "resident",
      };

      await User.create(userData);
      await Otp.create({
        email: "test@example.com",
        code: "123456",
        expires_at: new Date(Date.now() + 10 * 60 * 1000),
        verified: false,
      });

      const response = await request(app)
        .post("/api/auth/verify-otp")
        .send({ email: "test@example.com", otp_code: "123456" })
        .expect(200);

      expect(response.body.message).toBe("Email verified successfully");

      const otp = await Otp.findOne({
        email: "test@example.com",
        code: "123456",
      });
      expect(otp?.verified).toBe(true);
    });

    it("should return 400 for invalid OTP", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        user_type: "resident",
      };

      await User.create(userData);
      await Otp.create({
        email: "test@example.com",
        code: "123456",
        expires_at: new Date(Date.now() + 10 * 60 * 1000),
        verified: false,
      });

      const response = await request(app)
        .post("/api/auth/verify-otp")
        .send({ email: "test@example.com", otp_code: "654321" })
        .expect(400);

      expect(response.body.message).toBe("Invalid OTP code");
    });

    it("should return 400 for expired OTP", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        user_type: "resident",
      };

      await User.create(userData);
      await Otp.create({
        email: "test@example.com",
        code: "123456",
        expires_at: new Date(Date.now() - 10 * 60 * 1000),
        verified: false,
      });

      const response = await request(app)
        .post("/api/auth/verify-otp")
        .send({ email: "test@example.com", otp_code: "123456" })
        .expect(400);

      expect(response.body.message).toBe("OTP code has expired");
    });

    it("should return 400 when email or otp_code is missing", async () => {
      const response = await request(app)
        .post("/api/auth/verify-otp")
        .send({ email: "test@example.com" })
        .expect(400);

      expect(response.body.message).toBe("Email and OTP code are required");
    });
  });
});
