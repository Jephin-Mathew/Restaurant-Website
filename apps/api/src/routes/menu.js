import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middleware/adminAuth.js";
import { serializeMenuCategory, serializeMenuItem } from "../lib/serialize.js";

const router = Router();

// --------------------
// Multer setup (ESM safe paths)
// --------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "..", "..", "uploads", "menu");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = [".jpg", ".jpeg", ".png", ".webp"].includes(ext) ? ext : ".jpg";
    cb(null, `${Date.now()}-${Math.random().toString(16).slice(2)}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// --------------------
// Helpers
// --------------------
function isMultipart(req) {
  const ct = req.headers["content-type"] || "";
  return ct.includes("multipart/form-data");
}

function toBool(v, fallback = true) {
  if (v === undefined || v === null || v === "") return fallback;
  if (typeof v === "boolean") return v;
  return String(v).toLowerCase() === "true";
}

function toInt(v, fallback = 0) {
  if (v === undefined || v === null || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function toNumber(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return NaN;
  return n;
}

// --------------------
// PUBLIC: GET /menu
// --------------------
router.get("/menu", async (_req, res) => {
  const categories = await prisma.menuCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      items: {
        where: { available: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  res.json({ categories: categories.map(serializeMenuCategory) });
});

// --------------------
// ADMIN: Categories CRUD
// --------------------
router.get("/admin/menu/categories", requireAdmin, async (_req, res) => {
  const categories = await prisma.menuCategory.findMany({ orderBy: { sortOrder: "asc" } });
  res.json(categories);
});

const CategoryCreateSchema = z.object({
  name: z.string().min(1),
  sortOrder: z.number().int().optional(),
});

router.post("/admin/menu/categories", requireAdmin, async (req, res) => {
  const body = CategoryCreateSchema.parse(req.body);
  const created = await prisma.menuCategory.create({
    data: { name: body.name, sortOrder: body.sortOrder ?? 0 },
  });
  res.json(created);
});

const CategoryUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  sortOrder: z.number().int().optional(),
});

router.put("/admin/menu/categories/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const body = CategoryUpdateSchema.parse(req.body);
  const updated = await prisma.menuCategory.update({ where: { id }, data: body });
  res.json(updated);
});

router.delete("/admin/menu/categories/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await prisma.menuItem.deleteMany({ where: { categoryId: id } });
  await prisma.menuCategory.delete({ where: { id } });
  res.json({ ok: true });
});

// --------------------
// ADMIN: Items CRUD
// --------------------
router.get("/admin/menu/items", requireAdmin, async (_req, res) => {
  const items = await prisma.menuItem.findMany({
    orderBy: [{ categoryId: "asc" }, { sortOrder: "asc" }],
  });
  res.json(items.map(serializeMenuItem));
});

// Create (supports JSON or multipart)
const ItemCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  price: z.number().positive(),
  // imageUrl stored as "/uploads/menu/xxx.jpg"
  imageUrl: z.string().optional().nullable(),
  available: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  categoryId: z.number().int(),
});

router.post(
  "/admin/menu/items",
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    // multipart => req.body values are strings
    let payload;

    if (isMultipart(req)) {
      const price = toNumber(req.body.price);
      if (!Number.isFinite(price) || price <= 0) {
        return res.status(400).json({ error: "Invalid price" });
      }

      payload = {
        name: req.body.name,
        description: req.body.description || null,
        price,
        available: toBool(req.body.available, true),
        sortOrder: toInt(req.body.sortOrder, 0),
        categoryId: toInt(req.body.categoryId, 0),
        imageUrl: req.file ? `/uploads/menu/${req.file.filename}` : (req.body.imageUrl || null),
      };
    } else {
      payload = ItemCreateSchema.parse(req.body);
    }

    if (!payload.categoryId) {
      return res.status(400).json({ error: "categoryId is required" });
    }

    const created = await prisma.menuItem.create({
      data: {
        name: payload.name,
        description: payload.description ?? null,
        price: payload.price,
        imageUrl: payload.imageUrl ?? null,
        available: payload.available ?? true,
        sortOrder: payload.sortOrder ?? 0,
        categoryId: payload.categoryId,
      },
    });

    res.json(serializeMenuItem(created));
  }
);

// Update (supports JSON or multipart)
router.put(
  "/admin/menu/items/:id",
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    const id = Number(req.params.id);

    let patch;

    if (isMultipart(req)) {
      patch = {
        name: req.body.name,
        description: req.body.description === undefined ? undefined : (req.body.description || null),
        price: req.body.price === undefined ? undefined : toNumber(req.body.price),
        available: req.body.available === undefined ? undefined : toBool(req.body.available),
        sortOrder: req.body.sortOrder === undefined ? undefined : toInt(req.body.sortOrder),
        categoryId: req.body.categoryId === undefined ? undefined : toInt(req.body.categoryId),
        imageUrl: req.file ? `/uploads/menu/${req.file.filename}` : undefined,
      };

      if (patch.price !== undefined && (!Number.isFinite(patch.price) || patch.price <= 0)) {
        return res.status(400).json({ error: "Invalid price" });
      }
    } else {
      const ItemUpdateSchema = ItemCreateSchema.partial();
      patch = ItemUpdateSchema.parse(req.body);

      patch = {
        ...patch,
        description: patch.description === undefined ? undefined : patch.description ?? null,
        imageUrl: patch.imageUrl === undefined ? undefined : patch.imageUrl ?? null,
      };
    }

    const updated = await prisma.menuItem.update({
      where: { id },
      data: patch,
    });

    res.json(serializeMenuItem(updated));
  }
);

router.delete("/admin/menu/items/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await prisma.menuItem.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
