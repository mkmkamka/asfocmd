"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";

/* The whole of the admin's front door. One field, because there is one
   account: see `src/lib/admin-auth.ts` for why there is no user table. */
export default function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        // The guard runs on the server, so the new cookie only takes effect on
        // a fresh server render — refresh before navigating.
        router.replace("/admin");
        router.refresh();
        return;
      }
      const { error: code } = await res.json().catch(() => ({ error: "" }));
      setError(
        code === "too_many"
          ? "Prea multe încercări. Așteaptă 10 minute și încearcă din nou."
          : code === "not_configured"
            ? "Parola nu este configurată pe server. Vezi instrucțiunile de mai jos."
            : "Parolă incorectă.",
      );
    } catch {
      setError("Conexiune eșuată. Încearcă din nou.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="admin-login" onSubmit={submit}>
      <div className="admin-login-mark" aria-hidden>
        <Icon name="lock" size={26} />
      </div>
      <h1>Administrare ASFOCMD</h1>
      <p className="admin-login-lead">
        Introdu parola pentru a adăuga știri, cursuri și membri.
      </p>

      <div className="f-field">
        <label htmlFor="password">Parolă</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!error}
        />
      </div>

      {error && (
        <span className="f-err" role="alert">
          {error}
        </span>
      )}

      <button className="btn btn-primary" type="submit" disabled={busy}>
        {busy ? "Se verifică…" : "Intră în panou"}
      </button>

      {!configured && (
        <p className="admin-setup" role="note">
          Serverul nu are încă o parolă. Adaug-o în fișierul{" "}
          <code>.env.local</code> din rădăcina proiectului, apoi repornește
          serverul:
          <code className="block">ADMIN_PASSWORD=parola-ta-lunga</code>
        </p>
      )}
    </form>
  );
}
