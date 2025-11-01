import { Options } from "swagger-jsdoc";

export const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "BrgyKonek API",
      version: "1.0.0",
      description:
        "API documentation for BrgyKonek backend application - A comprehensive barangay management system API that provides user authentication, profile management, and OTP verification services.",
      contact: {
        name: "API Support",
        email: "support@brgykonek.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://api.brgykonek.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "JWT token for authentication. Include 'Bearer ' prefix followed by the token.",
        },
      },
      schemas: {},
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/models/*.ts"],
};
