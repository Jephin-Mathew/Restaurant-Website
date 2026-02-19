import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import adminRoutes from "./routes/admin.js";
import menuRoutes from "./routes/menu.js";
import openingHoursRoutes from "./routes/openingHours.js";
import reservationsRoutes from "./routes/reservations.js";
import blogsRoutes from "./routes/blogs.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));

/**
 * Use process.cwd() so it always points to: apps/api
 * when you run: npm run dev (from apps/api)
 */
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

fs.mkdirSync(UPLOADS_DIR, { recursive: true });
fs.mkdirSync(path.join(UPLOADS_DIR, "blog"), { recursive: true });


app.use("/uploads", express.static(UPLOADS_DIR));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---- Routes ----
app.get("/health", (_req, res) => res.json({ ok: true }));

app.use(adminRoutes);
app.use(menuRoutes);
app.use(openingHoursRoutes);
app.use(reservationsRoutes);
app.use(blogsRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
  console.log(`Serving uploads from: ${UPLOADS_DIR}`);
});
