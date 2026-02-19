// /Users/jephin/Node js/restaurant/apps/web/src/app/admin/page.tsx
import { redirect } from "next/navigation";

export default function AdminHome() {
  // Middleware already blocks unauthenticated users.
  // Send logged-in users to the first dashboard section.
  redirect("/admin/menu");
}
