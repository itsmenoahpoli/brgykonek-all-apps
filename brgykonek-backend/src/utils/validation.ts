import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
    return;
  }
  next();
};

export const registerValidation = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Name is required and must be between 1 and 100 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password")
    .isLength({ min: 8, max: 20 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,20}$/)
    .withMessage("Password must be 8-20 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
  body("mobile_number")
    .optional()
    .matches(/^(\+63|0)9\d{9}$/)
    .withMessage("Please provide a valid Philippine mobile number"),
  body("user_type")
    .optional()
    .isIn(["resident", "staff", "admin"])
    .withMessage("User type must be either resident, staff, or admin"),
  body("address")
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Address must be between 1 and 200 characters"),
  body("birthdate")
    .optional()
    .isString()
    .withMessage("Please provide a valid birthdate"),
  body("address_sitio")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Sitio is required and must be between 1 and 100 characters"),
  body("address_barangay")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Barangay must be between 1 and 100 characters"),
  body("address_municipality")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Municipality must be between 1 and 100 characters"),
  body("address_province")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Province must be between 1 and 100 characters"),
];

export const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const updateProfileValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Name must be between 1 and 100 characters"),
  body("mobile_number").optional(),
  body("address")
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Address must be between 1 and 200 characters"),
  body("birthdate")
    .optional()
    .isString()
    .withMessage("Please provide a valid birthdate"),
  body("address_sitio")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Sitio must be between 1 and 100 characters"),
  body("address_barangay")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Barangay must be between 1 and 100 characters"),
  body("address_municipality")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Municipality must be between 1 and 100 characters"),
  body("address_province")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Province must be between 1 and 100 characters"),
];

export const resetPasswordValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("new_password")
    .isLength({ min: 8, max: 20 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,20}$/)
    .withMessage("New password must be 8-20 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
];
