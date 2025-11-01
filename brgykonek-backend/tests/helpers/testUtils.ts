import jwt from "jsonwebtoken";
import User from "../../src/models/User";

export const createTestUser = async (userData: any = {}) => {
  const defaultUser = {
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@example.com",
    password: "password123",
    mobile_number: "+639123456789",
    user_type: "resident",
    ...userData,
  };

  const user = new User(defaultUser);
  await user.save();
  return user;
};

export const generateTestToken = (userId: string) => {
  const jwtSecret = process.env.JWT_SECRET || "test-secret";
  return jwt.sign({ userId }, Buffer.from(jwtSecret), {
    expiresIn: "1h",
  });
};

export const getTestUserData = (overrides: any = {}) => ({
  first_name: "Jane",
  last_name: "Smith",
  email: "jane.smith@example.com",
  password: "password123",
  mobile_number: "+639987654321",
  user_type: "resident",
  ...overrides,
});
