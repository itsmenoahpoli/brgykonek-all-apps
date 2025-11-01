import { Router } from "express";
import {
  register,
  login,
  getProfile,
  requestOTP,
  verifyOTP,
  updateProfile,
  changePassword,
  resetPassword,
  listUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  getApprovalStatus,
} from "../controllers/authController";
import { authenticateToken, isAdmin } from "../middleware/auth";
import {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  resetPasswordValidation,
  validateRequest,
} from "../utils/validation";
import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { ensureUploadsDir } from "../utils/files";

const router = Router();

const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    ensureUploadsDir();
    cb(null, "public/files");
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  console.log('🔍 File filter - MIME type:', file.mimetype, 'Original name:', file.originalname);
  
  // Allow PDF and image files, but also allow files with PDF/image extensions
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif'
  ];
  
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif'];
  const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
  
  if (
    allowedMimeTypes.includes(file.mimetype) ||
    allowedExtensions.includes(fileExtension)
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and image files are allowed"));
  }
};

const upload = multer({ storage, fileFilter });

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - user_type
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the user
 *         name:
 *           type: string
 *           description: User's full name
 *           maxLength: 100
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address (unique)
 *         mobile_number:
 *           type: string
 *           pattern: '^(\+63|0)9\d{9}$'
 *           description: Philippine mobile number
 *         user_type:
 *           type: string
 *           enum: [resident, staff, admin]
 *           description: Type of user account
 *           default: resident
 *         address:
 *           type: string
 *           maxLength: 200
 *           description: User's residential address
 *         birthdate:
 *           type: string
 *           format: date
 *           description: User's date of birth
 *         barangay_clearance:
 *           type: string
 *           description: Filename of uploaded barangay clearance document
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     OTP:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email address associated with the OTP
 *         code:
 *           type: string
 *           description: 6-digit OTP code
 *         expires_at:
 *           type: string
 *           format: date-time
 *           description: OTP expiration timestamp
 *         verified:
 *           type: boolean
 *           description: Whether the OTP has been verified
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - user_type
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 100
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 6
 *         mobile_number:
 *           type: string
 *           pattern: '^(\+63|0)9\d{9}$'
 *         user_type:
 *           type: string
 *           enum: [resident, staff, admin]
 *         address:
 *           type: string
 *           maxLength: 200
 *         birthdate:
 *           type: string
 *           format: date
 *         barangay_clearance:
 *           type: string
 *           format: binary
 *           description: Optional. PDF or image file for barangay clearance
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *     AuthResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         token:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 *     ProfileResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 *     OTPRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *     OTPVerifyRequest:
 *       type: object
 *       required:
 *         - email
 *         - otp_code
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         otp_code:
 *           type: string
 *           description: 6-digit OTP code
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *         error:
 *           type: string
 *           description: Detailed error information (optional)
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/register",
  upload.single("barangay_clearance"),
  registerValidation,
  validateRequest,
  register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post("/login", loginValidation, validateRequest, login);

/**
 * @swagger
 * /api/auth/my-profile:
 *   get:
 *     summary: Get authenticated user's profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get("/my-profile", authenticateToken, getProfile);

/**
 * @swagger
 * /api/auth/approval-status:
 *   get:
 *     summary: Get approval status of the authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns approval status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 approved:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 */
router.get("/approval-status", authenticateToken, getApprovalStatus);

/**
 * @swagger
 * /api/auth/request-otp:
 *   post:
 *     summary: Request OTP for email verification
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post("/request-otp", requestOTP);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP code for email verification
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp_code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               otp_code:
 *                 type: string
 *                 description: 6-digit OTP code
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid OTP or expired
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post("/verify-otp", verifyOTP);

/**
 * @swagger
 * /api/auth/update-profile:
 *   put:
 *     summary: Update authenticated user's profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 description: User's full name
 *               mobile_number:
 *                 type: string
 *                 pattern: '^(\+63|0)9\d{9}$'
 *                 description: Philippine mobile number
 *               address:
 *                 type: string
 *                 maxLength: 200
 *                 description: User's address
 *               birthdate:
 *                 type: string
 *                 format: date
 *                 description: User's birthdate
 *               barangay_clearance:
 *                 type: string
 *                 format: binary
 *                 description: Optional. PDF or image file for barangay clearance
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  "/update-profile",
  authenticateToken,
  upload.single("barangay_clearance"),
  updateProfileValidation,
  validateRequest,
  updateProfile
);

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Change authenticated user's password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - current_password
 *               - new_password
 *             properties:
 *               current_password:
 *                 type: string
 *                 description: Current password
 *               new_password:
 *                 type: string
 *                 description: New password
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid current password or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  "/change-password",
  authenticateToken,
  changePassword
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset user's password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp_code
 *               - new_password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               otp_code:
 *                 type: string
 *                 description: 6-digit OTP code
 *               new_password:
 *                 type: string
 *                 description: New password
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid OTP or expired
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post(
  "/reset-password",
  resetPasswordValidation,
  validateRequest,
  resetPassword
);

router.get("/admin/users", authenticateToken, isAdmin, listUsers);
router.get("/admin/users/:id", authenticateToken, isAdmin, getUserById);
router.put("/admin/users/:id", authenticateToken, isAdmin, updateUserById);
router.delete("/admin/users/:id", authenticateToken, isAdmin, deleteUserById);

export default router;
