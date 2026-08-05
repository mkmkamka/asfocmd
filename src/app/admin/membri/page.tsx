import Link from "next/link";
import { redirect } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import { isLoggedIn } from "@/lib/admin-auth";
import { readAll } from "@/lib/store";
import type { StoredMember } from "@/lib/content-types";
import mapData from "@/data/moldova-districts.json";
import ro from "@/i18n/dictionaries/ro.json";
import { deleteMember } from "../actions";

const districtName = (id: string) =>
  (mapData.districts as { id: string; ro: string }[]).find((d) => d.id === id)
    ?.ro ?? id;

const SERVICES = ro.home.hero.services;

export default async function AdminMembers() {
  if (!(await isLoggedIn())) redirect("/admin/login");

  const members = (await readAll<StoredMember>("members")).sort((a, b) =>
    a.name.localeCompare(b.name, "ro"),
  );

  return (
    <main className="admin-shell">
      <div className="admin-wrap">
        <AdminHeader
          title="Membri"
          lead="Lista pe care o vede publicul pe hartă — și pe care o verifică un solicitant după telefon."
          action={
            <Link className="btn btn-primary" href="/admin/membri/nou">
              Adaugă membru
            </Link>
          }
        />

        {members.length === 0 ? (
          <div className="admin-empty">
            <p>
              Încă nu există membri. Adaugă-i manual sau aprobă o cerere din
              secțiunea <Link href="/admin/cereri">Cereri de aderare</Link>.
            </p>
            <Link className="btn btn-primary" href="/admin/membri/nou">
              Adaugă primul membru
            </Link>
          </div>
        ) : (
          <ul className="admin-rows">
            {members.map((m) => (
              <li className="admin-row" key={m.id}>
                <div className="admin-row-main">
                  <b>{m.name}</b>
                  <span className="admin-row-meta">
                    {districtName(m.districtId)}
                    {m.locality && `, ${m.locality}`}
                    {m.phone && ` · ${m.phone}`}
                    {` · membru din ${m.joinedAt}`}
                    {!m.listed && " · ascuns pe site"}
                  </span>
                  {m.services.length > 0 && (
                    <span className="admin-row-chips">
                      {m.services.map((s) => (
                        <span key={s}>{SERVICES[s]}</span>
                      ))}
                    </span>
                  )}
                </div>
                <div className="admin-row-actions">
                  <Link className="btn btn-ghost" href={`/admin/membri/${m.id}`}>
                    Editează
                  </Link>
                  <form action={deleteMember}>
                    <input type="hidden" name="id" value={m.id} />
                    <button className="btn btn-danger" type="submit">
                      Șterge
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
