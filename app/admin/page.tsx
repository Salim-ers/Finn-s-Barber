import { adminPassword, isAdmin } from "@/lib/auth";
import { booking, services } from "@/lib/data";
import { mailEnabled } from "@/lib/booking/mail";
import Dashboard from "@/components/admin/Dashboard";
import Login from "@/components/admin/Login";

export const dynamic = "force-dynamic";

export default async function Admin() {
  if (!(await isAdmin())) return <Login configured={!!adminPassword()} localDefault={!process.env.ADMIN_PASSWORD && !process.env.VERCEL} />;
  return <Dashboard services={services.map(s => ({ id: s.id, name: s.name, minutes: s.minutes, price: s.price }))} rules={booking} mailOn={mailEnabled()} />;
}
