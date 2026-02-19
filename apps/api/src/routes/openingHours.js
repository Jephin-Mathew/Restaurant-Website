import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin } from "../middleware/adminAuth.js";

const router = Router();

function isHHMM(x) {
  return /^\d{2}:\d{2}$/.test(x);
}

router.get("/opening-hours", async (_req, res) => {
  const hours = await prisma.openingHour.findMany({ orderBy: { dayOfWeek: "asc" } });
  const config = await prisma.restaurantConfig.findUnique({ where: { id: 1 } });
  res.json({
    hours,
    config: config ?? { capacityPerSlot: 30, slotDurationMinutes: 60, maxPartySize: 10 },
  });
});

router.put("/admin/opening-hours", requireAdmin, async (req, res) => {
  try {
    const { hours, config } = req.body || {};
    if (!Array.isArray(hours) || hours.length !== 7) {
      return res.status(400).json({ error: "hours must be an array of 7 days" });
    }

    for (const h of hours) {
      if (typeof h.dayOfWeek !== "number" || h.dayOfWeek < 0 || h.dayOfWeek > 6) {
        return res.status(400).json({ error: "Invalid dayOfWeek" });
      }
      if (!h.isClosed) {
        if (!h.openTime || !h.closeTime) return res.status(400).json({ error: "openTime/closeTime required" });
        if (!isHHMM(h.openTime) || !isHHMM(h.closeTime)) return res.status(400).json({ error: "Time must be HH:MM" });
      }
    }

    const capacityPerSlot = Number(config?.capacityPerSlot ?? 30);
    const slotDurationMinutes = Number(config?.slotDurationMinutes ?? 60);
    const maxPartySize = Number(config?.maxPartySize ?? 10);

    await prisma.$transaction(async (tx) => {
      for (const h of hours) {
        await tx.openingHour.upsert({
          where: { dayOfWeek: h.dayOfWeek },
          update: {
            isClosed: !!h.isClosed,
            openTime: h.isClosed ? null : h.openTime,
            closeTime: h.isClosed ? null : h.closeTime,
          },
          create: {
            dayOfWeek: h.dayOfWeek,
            isClosed: !!h.isClosed,
            openTime: h.isClosed ? null : h.openTime,
            closeTime: h.isClosed ? null : h.closeTime,
          },
        });
      }

      await tx.restaurantConfig.upsert({
        where: { id: 1 },
        update: { capacityPerSlot, slotDurationMinutes, maxPartySize },
        create: { id: 1, capacityPerSlot, slotDurationMinutes, maxPartySize },
      });
    });

    res.json({ ok: true });
  } catch (e) {
    console.error("PUT /admin/opening-hours", e);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
