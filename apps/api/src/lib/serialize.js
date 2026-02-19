export function serializeMenuItem(item) {
  return {
    ...item,
    price: Number(item.price),
  };
}

export function serializeMenuCategory(category) {
  return {
    id: category.id,
    name: category.name,
    sortOrder: category.sortOrder,
    items: (category.items || []).map(serializeMenuItem),
  };
}

export function toSlug(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
