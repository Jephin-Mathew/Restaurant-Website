import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middleware/adminAuth.js";

const router = Router();

router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password required" });
    }

    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, admin: { id: admin.id, email: admin.email } });
  } catch (e) {
    console.error("POST /admin/login", e);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/admin/me", requireAdmin, (req, res) => {
  res.json({ ok: true, admin: req.admin });
});

router.get("/admin/reservations", requireAdmin, async (_req, res) => {
  const rows = await prisma.reservation.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(rows);
});

export default router;
