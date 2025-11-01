import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { method, body, originalUrl } = req;

  logger.info("HTTP Request", {
    timestamp: new Date().toISOString(),
    method,
    endpoint: originalUrl,
    payload: body,
  });

  res.on("finish", () => {
    const { statusCode } = res;

    logger.info("HTTP Response", {
      timestamp: new Date().toISOString(),
      method,
      endpoint: originalUrl,
      statusCode,
      payload: body,
    });
  });

  next();
};
