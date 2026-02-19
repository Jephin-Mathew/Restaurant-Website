const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not defined in .env.local");

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

function jsonHeaders(token?: string) {
  return {
    "Content-Type": "application/json",
    ...(token ? authHeaders(token) : {}),
  };
}

/**
 * Normalize asset URL coming from backend.
 */
export function normalizeAssetUrl(url?: string | null) {
  if (!url) return null;

  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  let cleaned = url.replaceAll("\\", "/").trim();

  const idx = cleaned.indexOf("/uploads/");
  if (idx !== -1) cleaned = cleaned.slice(idx);

  const idx2 = cleaned.indexOf("uploads/");
  if (idx === -1 && idx2 !== -1) cleaned = "/" + cleaned.slice(idx2);

  if (!cleaned.startsWith("/")) cleaned = "/" + cleaned;

  return `${API_URL}${cleaned}`;
}

/* ============================= */
/*            MENU               */
/* ============================= */

export async function fetchMenu() {
  const res = await fetch(`${API_URL}/menu`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch menu");
  return res.json() as Promise<{ categories: any[] }>;
}

/* ============================= */
/*        OPENING HOURS          */
/* ============================= */

export async function fetchOpeningHours() {
  const res = await fetch(`${API_URL}/opening-hours`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch opening hours");
  return res.json() as Promise<{ hours: any[]; config: any }>;
}

/* ============================= */
/*        RESERVATIONS           */
/* ============================= */

export async function fetchSlots(date: string) {
  const res = await fetch(`${API_URL}/reservations/slots?date=${date}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch slots");
  return res.json();
}

export async function createReservation(payload: {
  name: string;
  phone: string;
  email?: string;
  guests: number;
  date: string;
  time: string;
}) {
  const res = await fetch(`${API_URL}/reservations`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || "Failed to create reservation");
  return data;
}

/* ============================= */
/*            BLOGS              */
/* ============================= */

export async function fetchPublishedBlogs() {
  const res = await fetch(`${API_URL}/blogs`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch blogs");
  return res.json();
}

export async function fetchPublishedBlogBySlug(slug: string) {
  const safeSlug = encodeURIComponent(slug);
  const res = await fetch(`${API_URL}/blogs/${safeSlug}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch blog");
  return res.json();
}

/* ============================= */
/*            ADMIN              */
/* ============================= */

export async function adminLogin(payload: { email: string; password: string }) {
  const res = await fetch(`${API_URL}/admin/login`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || "Login failed");
  return data as { token: string; admin: { id: number; email: string } };
}

export async function adminFetchReservations(token: string) {
  const res = await fetch(`${API_URL}/admin/reservations`, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || "Failed to load reservations");
  return data;
}

export async function adminUpdateOpeningHours(token: string, payload: { hours: any[]; config: any }) {
  const res = await fetch(`${API_URL}/admin/opening-hours`, {
    method: "PUT",
    headers: jsonHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || "Failed to save");
  return data;
}

/* ===== ADMIN BLOGS ===== */

export async function adminFetchBlogs(token: string) {
  const res = await fetch(`${API_URL}/admin/blogs`, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || "Failed to load blogs");
  return data;
}

export async function adminFetchBlogById(token: string, id: number) {
  const res = await fetch(`${API_URL}/admin/blogs/${id}`, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || "Failed to load blog");
  return data;
}

export async function adminCreateBlog(token: string, payload: FormData) {
  const res = await fetch(`${API_URL}/admin/blogs`, {
    method: "POST",
    headers: authHeaders(token), // DO NOT set content-type for FormData
    body: payload,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || "Failed to create blog");
  return data;
}

export async function adminUpdateBlog(token: string, id: number, payload: FormData) {
  const res = await fetch(`${API_URL}/admin/blogs/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: payload,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || "Failed to update blog");
  return data;
}

export async function adminDeleteBlog(token: string, id: number) {
  const res = await fetch(`${API_URL}/admin/blogs/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || "Failed to delete blog");
  return data;
}

/* ===== ADMIN MENU (CATEGORIES + ITEMS) ===== */

/** Categories */
export async function adminFetchCategories(token: string) {
  const res = await fetch(`${API_URL}/admin/menu/categories`, {
    headers: authHeaders(token),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ([] as any));
  if (!res.ok) throw new Error((data as any)?.error || "Failed to load categories");
  return data as any[];
}

export async function adminCreateCategory(token: string, payload: { name: string; sortOrder?: number }) {
  const res = await fetch(`${API_URL}/admin/menu/categories`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || "Failed to create category");
  return data;
}

export async function adminDeleteCategory(token: string, categoryId: number) {
  const res = await fetch(`${API_URL}/admin/menu/categories/${categoryId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || "Failed to delete category");
  return data;
}

/** Items */
export async function adminFetchMenuItems(token: string) {
  const res = await fetch(`${API_URL}/admin/menu/items`, {
    headers: authHeaders(token),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ([] as any));
  if (!res.ok) throw new Error((data as any)?.error || "Failed to load menu items");
  return data as any[];
}

export async function adminCreateMenuItem(token: string, payload: FormData) {
  const res = await fetch(`${API_URL}/admin/menu/items`, {
    method: "POST",
    headers: authHeaders(token), // DO NOT set content-type for FormData
    body: payload,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || "Failed to create menu item");
  return data;
}

export async function adminUpdateMenuItem(token: string, itemId: number, payload: FormData) {
  const res = await fetch(`${API_URL}/admin/menu/items/${itemId}`, {
    method: "PUT",
    headers: authHeaders(token), // DO NOT set content-type for FormData
    body: payload,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || "Failed to update menu item");
  return data;
}

export async function adminDeleteMenuItem(token: string, itemId: number) {
  const res = await fetch(`${API_URL}/admin/menu/items/${itemId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || "Failed to delete menu item");
  return data;
}

export { API_URL };
