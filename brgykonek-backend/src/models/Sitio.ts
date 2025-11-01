import mongoose from "mongoose";

const SitioSchema = new mongoose.Schema(
  {
    code: { type: Number, required: true, unique: true, min: 1, max: 100 },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: false }
);

export default mongoose.model("Sitio", SitioSchema);


