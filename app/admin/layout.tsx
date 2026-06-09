import { AdminAuthGate } from "@/components/AdminAuthGate";
import { isAdminAuthenticated } from "@/lib/admin/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const serverAuthenticated = await isAdminAuthenticated();

  return (
    <AdminAuthGate serverAuthenticated={serverAuthenticated}>
      {children}
    </AdminAuthGate>
  );
}
