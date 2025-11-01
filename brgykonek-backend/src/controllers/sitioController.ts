import { Request, Response } from "express";
import Sitio from "../models/Sitio";

export const getSitios = async (req: Request, res: Response) => {
  try {
    const sitios = await Sitio.find({}).sort({ code: 1 });
    res.json(sitios);
  } catch (error) {
    console.error("Error fetching sitios:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
