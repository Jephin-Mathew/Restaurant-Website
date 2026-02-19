import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function toHHMM(total) {
  const h = String(Math.floor(total / 60)).padStart(2, "0");
  const m = String(total % 60).padStart(2, "0");
  return `${h}:${m}`;
}

function parseDateOnly(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}

router.get("/reservations/slots", async (req, res) => {
  try {
    const dateStr = req.query.date;
    if (!dateStr || typeof dateStr !== "string") return res.status(400).json({ error: "date is required" });

    const date = parseDateOnly(dateStr);
    if (!date) return res.status(400).json({ error: "Invalid date format" });

    const dayOfWeek = date.getDay();
    const dayHours = await prisma.openingHour.findFirst({ where: { dayOfWeek } });
    const config = await prisma.restaurantConfig.findUnique({ where: { id: 1 } });

    const capacityPerSlot = config?.capacityPerSlot ?? 30;
    const slotDurationMinutes = config?.slotDurationMinutes ?? 60;

    if (!dayHours || dayHours.isClosed || !dayHours.openTime || !dayHours.closeTime) {
      return res.json({ date: dateStr, slots: [], message: "Closed" });
    }

    const openMins = toMinutes(dayHours.openTime);
    const closeMins = toMinutes(dayHours.closeTime);

    const existing = await prisma.reservation.findMany({
      where: { date, status: "CONFIRMED" },
      select: { slotStart: true, partySize: true },
    });

    const reservedMap = new Map();
    for (const r of existing) reservedMap.set(r.slotStart, (reservedMap.get(r.slotStart) || 0) + r.partySize);

    const slots = [];
    for (let t = openMins; t + slotDurationMinutes <= closeMins; t += slotDurationMinutes) {
      const start = toHHMM(t);
      const end = toHHMM(t + slotDurationMinutes);
      const reserved = reservedMap.get(start) || 0;
      const availableSeats = Math.max(capacityPerSlot - reserved, 0);

      slots.push({
        start,
        end,
        capacityPerSlot,
        reservedSeats: reserved,
        availableSeats,
        isAvailable: availableSeats > 0,
      });
    }

    res.json({ date: dateStr, slots });
  } catch (e) {
    console.error("GET /reservations/slots", e);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/reservations", async (req, res) => {
  try {
    const { name, phone, email, guests, date, time } = req.body || {};
    if (!name || !phone || !guests || !date || !time) {
      return res.status(400).json({ error: "name, phone, guests, date, time are required" });
    }

    const partySize = Number(guests);
    if (!Number.isInteger(partySize) || partySize <= 0) return res.status(400).json({ error: "guests must be positive integer" });

    const dateObj = parseDateOnly(date);
    if (!dateObj) return res.status(400).json({ error: "Invalid date format" });

    const config = await prisma.restaurantConfig.findUnique({ where: { id: 1 } });
    const capacityPerSlot = config?.capacityPerSlot ?? 30;
    const slotDurationMinutes = config?.slotDurationMinutes ?? 60;
    const maxPartySize = config?.maxPartySize ?? 10;

    if (partySize > maxPartySize) return res.status(400).json({ error: `Maximum allowed guests is ${maxPartySize}` });

    const dayOfWeek = dateObj.getDay();
    const dayHours = await prisma.openingHour.findFirst({ where: { dayOfWeek } });

    if (!dayHours || dayHours.isClosed || !dayHours.openTime || !dayHours.closeTime) {
      return res.status(400).json({ error: "Restaurant is closed on selected date" });
    }

    const openMins = toMinutes(dayHours.openTime);
    const closeMins = toMinutes(dayHours.closeTime);
    const slotStartMins = toMinutes(time);

    if (slotStartMins < openMins || slotStartMins + slotDurationMinutes > closeMins) {
      return res.status(400).json({ error: "Invalid time slot" });
    }

    const slotStart = toHHMM(slotStartMins);
    const slotEnd = toHHMM(slotStartMins + slotDurationMinutes);

    const existing = await prisma.reservation.findMany({
      where: { date: dateObj, slotStart, status: "CONFIRMED" },
      select: { partySize: true },
    });

    const reservedSeats = existing.reduce((sum, r) => sum + r.partySize, 0);
    const availableSeats = capacityPerSlot - reservedSeats;

    if (availableSeats < partySize) {
      return res.status(409).json({ error: "Not enough seats available", availableSeats });
    }

    const reservation = await prisma.reservation.create({
      data: {
        name,
        phone,
        email: email || null,
        date: dateObj,
        slotStart,
        slotEnd,
        partySize,
        status: "CONFIRMED",
      },
    });

    res.status(201).json({ message: "Reservation confirmed", reservation });
  } catch (e) {
    console.error("POST /reservations", e);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
