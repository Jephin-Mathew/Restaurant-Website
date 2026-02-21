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


// /apps/api/src/index.js
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import adminRoutes from "./routes/admin.js";
import menuRoutes from "./routes/menu.js";
import openingHoursRoutes from "./routes/openingHours.js";
import reservationsRoutes from "./routes/reservations.js";
import blogsRoutes from "./routes/blogs.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/**
 * If you're behind Render / proxies, this helps with correct IP/https handling.
 */
app.set("trust proxy", 1);

/**
 * ✅ CORS
 * Use WEB_ORIGINS as comma-separated list:
 * WEB_ORIGINS=http://localhost:3000,https://restaurant-website-j81c.vercel.app
 *
 * If not provided, it will allow all origins (dev-friendly).
 */
const rawOrigins = process.env.WEB_ORIGINS || process.env.WEB_ORIGIN || "";
const allowedOrigins = rawOrigins
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (like curl/postman) where Origin is undefined
    if (!origin) return callback(null, true);

    // If no allowlist provided, allow all (dev)
    if (allowedOrigins.length === 0) return callback(null, true);

    // Match exact origins
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // Block everything else
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

/**
 * ✅ Apply CORS to all routes
 */
app.use(cors(corsOptions));

/**
 * ✅ IMPORTANT: Preflight handler (Express v5 safe)
 * Do NOT use app.options("*", ...) in Express v5 (can throw path-to-regexp error)
 */
app.options(/.*/, cors(corsOptions));

app.use(express.json({ limit: "5mb" }));

/**
 * Uploads folder
 * Use process.cwd() so it points to apps/api when running from there
 */
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
fs.mkdirSync(path.join(UPLOADS_DIR, "blog"), { recursive: true });

// Serve uploaded files
app.use("/uploads", express.static(UPLOADS_DIR));

/**
 * Health check
 */
app.get("/health", (_req, res) => res.json({ ok: true }));

/**
 * Routes
 */
app.use(adminRoutes);
app.use(menuRoutes);
app.use(openingHoursRoutes);
app.use(reservationsRoutes);
app.use(blogsRoutes);

/**
 * Error handler (helps debug CORS errors on server logs)
 */
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err?.message || "Server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on port ${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.length ? allowedOrigins.join(", ") : "ALL (dev)"}`);
  console.log(`Serving uploads from: ${UPLOADS_DIR}`);
});