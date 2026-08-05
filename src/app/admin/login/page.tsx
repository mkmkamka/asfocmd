import { redirect } from "next/navigation";
import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";
import { isConfigured, isLoggedIn } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Administrare — ASFOCMD",
  // The panel is for one person; it has no business in anyone's search results.
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await isLoggedIn()) redirect("/admin");

  return (
    <main className="admin-shell admin-shell-center">
      <LoginForm configured={isConfigured()} />
    </main>
  );
}
