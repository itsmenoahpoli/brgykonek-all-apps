import request from "supertest";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import authRoutes from "../../src/routes/auth";
import {
  createTestUser,
  generateTestToken,
  getTestUserData,
} from "../helpers/testUtils";

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

describe("Auth Endpoints", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = getTestUserData();

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty(
        "message",
        "User registered successfully"
      );
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("email", userData.email);
      expect(response.body.user).toHaveProperty(
        "first_name",
        userData.first_name
      );
      expect(response.body.user).toHaveProperty(
        "last_name",
        userData.last_name
      );
      expect(response.body.user).toHaveProperty(
        "user_type",
        userData.user_type
      );
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("should return 400 when user with same email already exists", async () => {
      const userData = getTestUserData();
      await createTestUser(userData);

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty(
        "message",
        "User with this email already exists"
      );
    });

    it("should return 400 for invalid email format", async () => {
      const userData = getTestUserData({ email: "invalid-email" });

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty("errors");
    });

    it("should return 400 for invalid mobile number format", async () => {
      const userData = getTestUserData({ mobile_number: "123" });

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty("errors");
    });

    it("should return 400 for invalid user type", async () => {
      const userData = getTestUserData({ user_type: "invalid" });

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty("errors");
    });

    it("should return 400 for missing required fields", async () => {
      const userData = { email: "test@example.com" };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty("errors");
    });

    it("should return 400 for password too short", async () => {
      const userData = getTestUserData({ password: "123" });

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty("errors");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login user successfully with valid credentials", async () => {
      const userData = getTestUserData();
      const user = await createTestUser(userData);

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty("message", "Login successful");
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("email", userData.email);
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("should return 401 for non-existent user", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "password123",
        })
        .expect(401);

      expect(response.body).toHaveProperty("message", "Invalid credentials");
    });

    it("should return 401 for incorrect password", async () => {
      const userData = getTestUserData();
      await createTestUser(userData);

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: userData.email,
          password: "wrongpassword",
        })
        .expect(401);

      expect(response.body).toHaveProperty("message", "Invalid credentials");
    });

    it("should return 400 for invalid email format", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "invalid-email",
          password: "password123",
        })
        .expect(400);

      expect(response.body).toHaveProperty("errors");
    });

    it("should return 400 for missing required fields", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
        })
        .expect(400);

      expect(response.body).toHaveProperty("errors");
    });
  });

  describe("GET /api/auth/my-profile", () => {
    it("should return user profile with valid token", async () => {
      const user = await createTestUser();
      // @ts-ignore
      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .get("/api/auth/my-profile")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty(
        "message",
        "Profile retrieved successfully"
      );
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("email", user.email);
      expect(response.body.user).toHaveProperty("first_name", user.first_name);
      expect(response.body.user).toHaveProperty("last_name", user.last_name);
    });

    it("should return 401 without token", async () => {
      const response = await request(app)
        .get("/api/auth/my-profile")
        .expect(401);

      expect(response.body).toHaveProperty("message", "Access token required");
    });

    it("should return 401 with invalid token", async () => {
      const response = await request(app)
        .get("/api/auth/my-profile")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);

      expect(response.body).toHaveProperty("message", "Invalid token");
    });

    it("should return 401 with expired token", async () => {
      const user = await createTestUser();
      const expiredToken = jwt.sign(
        { userId: (user._id as any).toString() },
        Buffer.from(process.env.JWT_SECRET || "test-secret"),
        { expiresIn: "0s" }
      );

      const response = await request(app)
        .get("/api/auth/my-profile")
        .set("Authorization", `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body).toHaveProperty("message", "Token expired");
    });
  });
});
