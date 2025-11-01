import { Request, Response } from "express";
import * as dashboardService from "../services/dashboardOverviewService";

export const getOverviewStatistics = async (req: Request, res: Response) => {
  try {
    const stats = await dashboardService.getOverviewStatistics();
    res.json(stats);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch overview statistics", error });
  }
};
