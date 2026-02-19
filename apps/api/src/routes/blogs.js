import { Router } from "express";
import { z } from "zod";
import path from "path";
import fs from "fs";
import multer from "multer";
import { fileURLToPath } from "url";

import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middleware/adminAuth.js";
import { toSlug } from "../lib/serialize.js";

const router = Router();

/* ===========================
   Upload setup (ESM-safe)
=========================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// apps/api/src/uploads/blog
const BLOG_UPLOAD_DIR = path.join(__dirname, "..", "uploads", "blog");
fs.mkdirSync(BLOG_UPLOAD_DIR, { recursive: true });

const blogStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, BLOG_UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: blogStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // ✅ 20MB
});

/* ===========================
   Public routes
=========================== */

/** PUBLIC: list published blogs */
router.get("/blogs", async (_req, res) => {
  const blogs = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  res.json(blogs);
});

/** PUBLIC: single published blog by slug */
router.get("/blogs/:slug", async (req, res) => {
  const blog = await prisma.blogPost.findUnique({
    where: { slug: req.params.slug },
  });

  if (!blog || blog.status !== "PUBLISHED") {
    return res.status(404).json({ error: "Blog not found" });
  }

  res.json(blog);
});

/* ===========================
   Admin routes
=========================== */

/** ADMIN: list all blogs */
router.get("/admin/blogs", requireAdmin, async (_req, res) => {
  const blogs = await prisma.blogPost.findMany({
    orderBy: { updatedAt: "desc" },
  });
  res.json(blogs);
});

/** ✅ ADMIN: get single blog by ID (needed for edit page) */
router.get("/admin/blogs/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

  const blog = await prisma.blogPost.findUnique({ where: { id } });
  if (!blog) return res.status(404).json({ error: "Blog not found" });

  res.json(blog);
});

/* ===========================
   Admin create/update schemas
   (multipart => req.body fields are strings)
=========================== */
const BlogCreateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

const BlogUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  removeCover: z.union([z.literal("true"), z.literal("false")]).optional(),
});

/**
 * ✅ ADMIN: create blog (supports multipart + cover file)
 * Frontend sends FormData:
 *  - title, slug?, excerpt?, content, status, cover(file)
 */
router.post(
  "/admin/blogs",
  requireAdmin,
  upload.single("cover"),
  async (req, res) => {
    try {
      const body = BlogCreateSchema.parse(req.body);

      const slug = body.slug?.trim()
        ? toSlug(body.slug)
        : toSlug(body.title);

      const coverImage = req.file ? `/uploads/blog/${req.file.filename}` : null;

      const status = body.status ?? "DRAFT";
      const publishedAt = status === "PUBLISHED" ? new Date() : null;

      const created = await prisma.blogPost.create({
        data: {
          title: body.title,
          slug,
          excerpt: body.excerpt?.trim() ? body.excerpt.trim() : null,
          content: body.content,
          status,
          publishedAt,
          coverImage,
        },
      });

      res.json(created);
    } catch (e) {
      console.error("POST /admin/blogs", e);
      return res.status(400).json({ error: "Invalid payload" });
    }
  }
);

/**
 * ✅ ADMIN: update blog (supports multipart + cover file + removeCover)
 * Frontend sends FormData:
 *  - title, slug?, excerpt?, content, status, cover(file)?, removeCover?
 */
router.put(
  "/admin/blogs/:id",
  requireAdmin,
  upload.single("cover"),
  async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

    try {
      const body = BlogUpdateSchema.parse(req.body);

      const existing = await prisma.blogPost.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ error: "Blog not found" });

      // cover handling
      let nextCover = undefined;

      const removeCover = body.removeCover === "true";
      if (removeCover) nextCover = null;

      if (req.file) {
        nextCover = `/uploads/blog/${req.file.filename}`;
      }

      // status => publishedAt logic
      let publishedAtUpdate = undefined;
      if (body.status === "PUBLISHED") publishedAtUpdate = new Date();
      if (body.status === "DRAFT") publishedAtUpdate = null;

      const updated = await prisma.blogPost.update({
        where: { id },
        data: {
          title: body.title,
          slug: body.slug ? toSlug(body.slug) : undefined,
          excerpt: body.excerpt === undefined ? undefined : (body.excerpt.trim() ? body.excerpt.trim() : null),
          content: body.content,
          status: body.status,
          publishedAt: publishedAtUpdate,
          coverImage: nextCover,
        },
      });

      res.json(updated);
    } catch (e) {
      console.error("PUT /admin/blogs/:id", e);
      return res.status(400).json({ error: "Invalid payload" });
    }
  }
);

/** ADMIN: delete blog */
router.delete("/admin/blogs/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

  await prisma.blogPost.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
