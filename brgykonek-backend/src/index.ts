import express from "express";
import cors from "cors";
import helmet from "helmet";
// import rateLimit from "express-rate-limit"; // Disabled to prevent 429 errors
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { connectDB } from "./config/database";
import authRoutes from "./routes/auth";
import complaintRoutes from "./routes/complaint";
import announcementRoutes from "./routes/announcement";
import notificationRoutes from "./routes/notification";
import administratorRoutes from "./routes/administrator";
import documentRequestRoutes from "./routes/documentRequest";
import userAccountRoutes from "./routes/userAccount";
import sitioRoutes from "./routes/sitio";
import { swaggerOptions } from "./config/swagger";
import { requestLogger } from "./middleware/requestLogger";
import { logger } from "./utils/logger";
import { SwaggerTheme, SwaggerThemeNameEnum } from "swagger-themes";
import { emailService } from "./services/emailService";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting disabled - commented out to prevent 429 errors
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: "Too many requests from this IP, please try again later.",
// });

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "http://localhost:*"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:*"],
    },
  },
}));

// Static file serving with CORS - must be before global CORS middleware
app.use('/public', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
}, express.static('public', { etag: false, lastModified: false, cacheControl: false, maxAge: 0 }));

// Static file serving for images directory
app.use('/images', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
}, express.static('images', { etag: false, lastModified: false, cacheControl: false, maxAge: 0 }));

app.use(cors());
// app.use(limiter); // Rate limiting disabled
app.use(requestLogger);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.disable('etag');
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

const specs = swaggerJsdoc(swaggerOptions);

const theme = new SwaggerTheme();
const swaggerUiOptions = {
  customCss: theme.getBuffer(SwaggerThemeNameEnum.DARK),
};

app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/administrator", administratorRoutes);
app.use("/api/documents", documentRequestRoutes);
app.use("/api/user-accounts", userAccountRoutes);
app.use("/api/sitios", sitioRoutes);

app.get("/", (req, res) => {
  res.json({ message: "BrgyKonek API is running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const startServer = async () => {
  try {
    await connectDB();
    
    // Initialize email service
    try {
      emailService.initialize();
      logger.info("Email service initialized successfully");
    } catch (error) {
      logger.warn("Email service initialization failed", { error: error instanceof Error ? error.message : "Unknown error" });
    }
    
    app.listen(PORT, () => {
      logger.info(`Server started successfully on port ${PORT}`);
      logger.info(
        `Swagger documentation available at http://localhost:${PORT}/docs`
      );
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error("Failed to start server", { error: errorMessage });
    process.exit(1);
  }
};

startServer();
