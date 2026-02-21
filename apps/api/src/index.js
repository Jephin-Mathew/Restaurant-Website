// import express from "express";
// import cors from "cors";
// import path from "path";
// import fs from "fs";
// import { fileURLToPath } from "url";

// import adminRoutes from "./routes/admin.js";
// import menuRoutes from "./routes/menu.js";
// import openingHoursRoutes from "./routes/openingHours.js";
// import reservationsRoutes from "./routes/reservations.js";
// import blogsRoutes from "./routes/blogs.js";


// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const app = express();

// app.use(cors());
// app.use(express.json({ limit: "5mb" }));

// /**
//  * Use process.cwd() so it always points to: apps/api
//  * when you run: npm run dev (from apps/api)
//  */
// const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// fs.mkdirSync(UPLOADS_DIR, { recursive: true });
// fs.mkdirSync(path.join(UPLOADS_DIR, "blog"), { recursive: true });


// app.use("/uploads", express.static(UPLOADS_DIR));
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // ---- Routes ----
// app.get("/health", (_req, res) => res.json({ ok: true }));

// app.use(adminRoutes);
// app.use(menuRoutes);
// app.use(openingHoursRoutes);
// app.use(reservationsRoutes);
// app.use(blogsRoutes);

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(`API running on http://localhost:${PORT}`);
//   console.log(`Serving uploads from: ${UPLOADS_DIR}`);
// });


// import express from "express";
// import cors from "cors";
// import path from "path";
// import fs from "fs";
// import { fileURLToPath } from "url";

// import adminRoutes from "./routes/admin.js";
// import menuRoutes from "./routes/menu.js";
// import openingHoursRoutes from "./routes/openingHours.js";
// import reservationsRoutes from "./routes/reservations.js";
// import blogsRoutes from "./routes/blogs.js";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const app = express();

// const allowedOrigin = process.env.WEB_ORIGIN;

// app.use(
//   cors({
//     origin: allowedOrigin ? [allowedOrigin] : true,
//     credentials: true,
//   })
// );

// app.use(express.json({ limit: "5mb" }));

// const UPLOADS_DIR = path.join(process.cwd(), "uploads");
// fs.mkdirSync(UPLOADS_DIR, { recursive: true });
// fs.mkdirSync(path.join(UPLOADS_DIR, "blog"), { recursive: true });

// app.use("/uploads", express.static(UPLOADS_DIR));

// app.get("/health", (_req, res) => res.json({ ok: true }));

// app.use(adminRoutes);
// app.use(menuRoutes);
// app.use(openingHoursRoutes);
// app.use(reservationsRoutes);
// app.use(blogsRoutes);

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`API running on port ${PORT}`);
// });


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

/**
 * WEB_ORIGIN can be:
 * - a single origin: "https://your-site.vercel.app"
 * - or multiple (comma-separated):
 *   "http://localhost:3000,https://your-site.vercel.app"
 */
const rawOrigins = process.env.WEB_ORIGIN || "";
const allowedOrigins = rawOrigins
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// CORS MUST be before routes
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (curl/postman/server-to-server)
    if (!origin) return callback(null, true);

    // If no WEB_ORIGIN set, allow all (for dev)
    if (allowedOrigins.length === 0) return callback(null, true);

    // Allow only listed origins
    if (allowedOrigins.includes(origin)) return callback(null, true);

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Explicit preflight handler (fixes many Render/Vercel preflight failures)
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "5mb" }));

// Uploads folder (note: Render free instances have ephemeral disk)
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
fs.mkdirSync(path.join(UPLOADS_DIR, "blog"), { recursive: true });

app.use("/uploads", express.static(UPLOADS_DIR));

// ---- Routes ----
app.get("/health", (_req, res) => res.json({ ok: true }));

app.use(adminRoutes);
app.use(menuRoutes);
app.use(openingHoursRoutes);
app.use(reservationsRoutes);
app.use(blogsRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on port ${PORT}`);
  console.log(
    `Allowed origins: ${allowedOrigins.length ? allowedOrigins.join(", ") : "ALL (WEB_ORIGIN not set)"}`
  );
  console.log(`Serving uploads from: ${UPLOADS_DIR}`);
});