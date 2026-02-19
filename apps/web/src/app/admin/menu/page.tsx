"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  API_URL,
  adminFetchCategories,
  adminCreateCategory,
  adminDeleteCategory,
  adminFetchMenuItems,
  adminCreateMenuItem,
  adminUpdateMenuItem,
  adminDeleteMenuItem,
} from "@/lib/api";

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-xl bg-black/40 border border-neutral-800 px-3 py-2 text-sm",
        "outline-none focus:border-white",
        props.className || "",
      ].join(" ")}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={[
        "w-full rounded-xl bg-black/40 border border-neutral-800 px-3 py-2 text-sm",
        "outline-none focus:border-white",
        props.className || "",
      ].join(" ")}
    />
  );
}

type Category = { id: number; name: string; sortOrder: number };
type MenuItem = {
  id: number;
  name: string;
  description?: string | null;
  price: any;
  imageUrl?: string | null; // stored like "/uploads/menu/xxx.jpg"
  available: boolean;
  sortOrder: number;
  categoryId: number;
};

function fullImageUrl(path?: string | null) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

export default function AdminMenuPage() {
  const [token, setToken] = useState<string | null>(null);
  const [cats, setCats] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [newCatName, setNewCatName] = useState("");

  // Create item form
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: 0,
    available: true,
    sortOrder: 0,
  });
  const [newImage, setNewImage] = useState<File | null>(null);

  // Edit item form
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: 0,
    available: true,
    sortOrder: 0,
  });
  const [editImage, setEditImage] = useState<File | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("admin_token");
    if (!t) return;
    setToken(t);

    Promise.all([adminFetchCategories(t), adminFetchMenuItems(t)])
      .then(([c, i]) => {
        setCats(c);
        setItems(i);
        setNewItem((p) => ({ ...p, categoryId: c?.[0]?.id || 0 }));
      })
      .catch((e) => setMsg(e.message || "Failed"))
      .finally(() => setLoading(false));
  }, []);

  const itemsByCat = useMemo(() => {
    const map = new Map<number, MenuItem[]>();
    for (const it of items) {
      const cid = it.categoryId;
      if (!map.has(cid)) map.set(cid, []);
      map.get(cid)!.push(it);
    }
    return map;
  }, [items]);

  async function refresh() {
    if (!token) return;
    const [c, i] = await Promise.all([adminFetchCategories(token), adminFetchMenuItems(token)]);
    setCats(c);
    setItems(i);
  }

  async function createCategory() {
    if (!token) return;
    setMsg("");
    try {
      await adminCreateCategory(token, { name: newCatName, sortOrder: 0 });
      setNewCatName("");
      await refresh();
      setMsg("Category created ✅");
    } catch (e: any) {
      setMsg(e.message || "Failed");
    }
  }

  async function createItem() {
    if (!token) return;
    setMsg("");

    try {
      const fd = new FormData();
      fd.append("name", newItem.name);
      fd.append("description", newItem.description?.trim() ? newItem.description.trim() : "");
      fd.append("price", String(newItem.price));
      fd.append("categoryId", String(newItem.categoryId));
      fd.append("available", String(newItem.available));
      fd.append("sortOrder", String(newItem.sortOrder || 0));
      if (newImage) fd.append("image", newImage);

      await adminCreateMenuItem(token, fd);

      setNewItem((p) => ({ ...p, name: "", description: "", price: "" }));
      setNewImage(null);
      await refresh();
      setMsg("Item created ✅");
    } catch (e: any) {
      setMsg(e.message || "Failed");
    }
  }

  function openEdit(it: MenuItem) {
    setEditing(it);
    setEditImage(null);
    setEditForm({
      name: it.name || "",
      description: it.description || "",
      price: String(it.price ?? ""),
      categoryId: it.categoryId,
      available: !!it.available,
      sortOrder: it.sortOrder ?? 0,
    });
  }

  async function saveEdit() {
    if (!token || !editing) return;
    setMsg("");

    try {
      const fd = new FormData();
      fd.append("name", editForm.name);
      fd.append("description", editForm.description?.trim() ? editForm.description.trim() : "");
      fd.append("price", String(editForm.price));
      fd.append("categoryId", String(editForm.categoryId));
      fd.append("available", String(editForm.available));
      fd.append("sortOrder", String(editForm.sortOrder || 0));
      if (editImage) fd.append("image", editImage);

      await adminUpdateMenuItem(token, editing.id, fd);
      setEditing(null);
      setEditImage(null);
      await refresh();
      setMsg("Item updated ✅");
    } catch (e: any) {
      setMsg(e.message || "Failed");
    }
  }

  if (loading) return <div className="p-6 text-sm text-neutral-300">Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Menu</h1>
        <p className="text-sm text-neutral-400 mt-1">Manage categories and items shown on the Menu page.</p>
      </div>

      {msg && (
        <div className="text-sm text-neutral-200 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3">
          {msg}
        </div>
      )}

      {/* Add Category */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-5">
        <div className="text-sm font-semibold mb-3">Add Category</div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Category name (e.g., MAKI)"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
          />
          <button
            onClick={createCategory}
            disabled={!newCatName.trim()}
            className="rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            Add
          </button>
        </div>
      </div>

      {/* Add Item */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-5">
        <div className="text-sm font-semibold mb-3">Add Menu Item</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="text-xs text-neutral-400">Name</div>
            <Input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
          </div>

          <div className="space-y-2">
            <div className="text-xs text-neutral-400">Category</div>
            <select
              className="w-full rounded-xl bg-black/40 border border-neutral-800 px-3 py-2 text-sm outline-none focus:border-white"
              value={newItem.categoryId}
              onChange={(e) => setNewItem({ ...newItem, categoryId: Number(e.target.value) })}
            >
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="text-xs text-neutral-400">Description</div>
            <Textarea
              rows={3}
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs text-neutral-400">Price</div>
            <Input type="number" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} />
          </div>

          <div className="space-y-2">
            <div className="text-xs text-neutral-400">Image (png/jpg/webp)</div>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={(e) => setNewImage(e.target.files?.[0] || null)}
              className="block w-full text-sm text-neutral-200"
            />
            {newImage && (
              <img
                src={URL.createObjectURL(newImage)}
                className="mt-2 h-16 w-16 rounded-xl object-cover border border-neutral-800"
                alt="preview"
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!newItem.available}
              onChange={(e) => setNewItem({ ...newItem, available: e.target.checked })}
              className="h-4 w-4 accent-white"
            />
            <span className="text-sm text-neutral-300">Available</span>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={createItem}
            disabled={!newItem.name.trim() || !newItem.categoryId || !newItem.price}
            className="rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            Add Item
          </button>
        </div>
      </div>

      {/* Edit panel */}
      {editing && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">Edit Item</div>
              <div className="text-xs text-neutral-400 mt-1">#{editing.id} • {editing.name}</div>
            </div>
            <button
              onClick={() => setEditing(null)}
              className="text-xs rounded-lg border border-neutral-700 px-3 py-1 hover:bg-neutral-800/60"
            >
              Close
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="text-xs text-neutral-400">Name</div>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>

            <div className="space-y-2">
              <div className="text-xs text-neutral-400">Category</div>
              <select
                className="w-full rounded-xl bg-black/40 border border-neutral-800 px-3 py-2 text-sm outline-none focus:border-white"
                value={editForm.categoryId}
                onChange={(e) => setEditForm({ ...editForm, categoryId: Number(e.target.value) })}
              >
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="text-xs text-neutral-400">Description</div>
              <Textarea
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <div className="text-xs text-neutral-400">Price</div>
              <Input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
            </div>

            <div className="space-y-2">
              <div className="text-xs text-neutral-400">Replace Image (optional)</div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={(e) => setEditImage(e.target.files?.[0] || null)}
                className="block w-full text-sm text-neutral-200"
              />

              <div className="flex items-center gap-3 mt-2">
                {editing.imageUrl ? (
                  <img
                    src={fullImageUrl(editing.imageUrl)}
                    className="h-16 w-16 rounded-xl object-cover border border-neutral-800"
                    alt="current"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-xl border border-neutral-800 bg-neutral-900/40" />
                )}

                {editImage && (
                  <img
                    src={URL.createObjectURL(editImage)}
                    className="h-16 w-16 rounded-xl object-cover border border-neutral-800"
                    alt="new"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!editForm.available}
                onChange={(e) => setEditForm({ ...editForm, available: e.target.checked })}
                className="h-4 w-4 accent-white"
              />
              <span className="text-sm text-neutral-300">Available</span>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={saveEdit}
              className="rounded-xl bg-[#e8dcc2] text-black px-6 py-3 font-semibold"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-6">
        {cats.map((c) => (
          <div key={c.id} className="rounded-2xl border border-neutral-800 bg-neutral-950/30 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="text-lg font-semibold">{c.name}</div>
              <button
                onClick={async () => {
                  if (!token) return;
                  if (!confirm(`Delete category "${c.name}" and all its items?`)) return;
                  await adminDeleteCategory(token, c.id);
                  await refresh();
                }}
                className="text-xs rounded-lg border border-neutral-700 px-3 py-1 hover:bg-neutral-800/60"
              >
                Delete
              </button>
            </div>

            <div className="mt-4 overflow-auto rounded-xl border border-neutral-800">
              <table className="min-w-full text-sm">
                <thead className="bg-neutral-900">
                  <tr>
                    <th className="text-left p-3">Item</th>
                    <th className="text-left p-3">Price</th>
                    <th className="text-left p-3">Available</th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(itemsByCat.get(c.id) || []).map((it) => (
                    <tr key={it.id} className="border-t border-neutral-800">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {it.imageUrl ? (
                            <img
                              src={fullImageUrl(it.imageUrl)}
                              className="h-12 w-12 rounded-xl object-cover border border-neutral-800"
                              alt={it.name}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-xl border border-neutral-800 bg-neutral-900/40" />
                          )}

                          <div>
                            <div className="font-medium">{it.name}</div>
                            {it.description && <div className="text-xs text-neutral-400 mt-1">{it.description}</div>}
                          </div>
                        </div>
                      </td>

                      <td className="p-3">₹{Number(it.price).toFixed(0)}</td>
                      <td className="p-3">{it.available ? "Yes" : "No"}</td>

                      <td className="p-3 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => openEdit(it)}
                            className="text-xs rounded-lg border border-neutral-700 px-3 py-1 hover:bg-neutral-800/60"
                          >
                            Edit
                          </button>

                          <button
                            onClick={async () => {
                              if (!token) return;
                              await adminUpdateMenuItem(token, it.id, (() => {
                                const fd = new FormData();
                                fd.append("available", String(!it.available));
                                return fd;
                              })());
                              await refresh();
                            }}
                            className="text-xs rounded-lg border border-neutral-700 px-3 py-1 hover:bg-neutral-800/60"
                          >
                            Toggle
                          </button>

                          <button
                            onClick={async () => {
                              if (!token) return;
                              if (!confirm(`Delete item "${it.name}"?`)) return;
                              await adminDeleteMenuItem(token, it.id);
                              await refresh();
                            }}
                            className="text-xs rounded-lg border border-neutral-700 px-3 py-1 hover:bg-neutral-800/60"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {(itemsByCat.get(c.id) || []).length === 0 && (
                    <tr>
                      <td className="p-4 text-sm text-neutral-400" colSpan={4}>
                        No items in this category yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
