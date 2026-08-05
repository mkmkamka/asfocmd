import { notFound, redirect } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import { Field } from "@/components/admin/Fields";
import { isLoggedIn } from "@/lib/admin-auth";
import { findById } from "@/lib/store";
import type { StoredMember } from "@/lib/content-types";
import mapData from "@/data/moldova-districts.json";
import ro from "@/i18n/dictionaries/ro.json";
import { saveMember } from "../../actions";

const SERVICES = ro.home.hero.services;

export default async function MemberEditor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isLoggedIn())) redirect("/admin/login");

  const { id } = await params;
  const isNew = id === "nou";
  const member = isNew ? undefined : await findById<StoredMember>("members", id);
  if (!isNew && !member) notFound();

  const districts = mapData.districts as { id: string; ro: string }[];

  return (
    <main className="admin-shell">
      <div className="admin-wrap admin-wrap-narrow">
        <AdminHeader
          title={isNew ? "Membru nou" : "Editează membrul"}
          back="/admin/membri"
          backLabel="Membri"
        />

        <form className="admin-form" action={saveMember}>
          <input type="hidden" name="id" value={member?.id ?? ""} />

          <div className="f-grid">
            <Field
              label="Nume și prenume"
              name="name"
              value={member?.name}
              required
            />
            <div className="f-field half">
              <label htmlFor="districtId">Raion / municipiu</label>
              <select
                id="districtId"
                name="districtId"
                defaultValue={member?.districtId ?? ""}
              >
                <option value="">Alege raionul</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.ro}
                  </option>
                ))}
              </select>
            </div>
            <Field
              label="Localitate"
              name="locality"
              value={member?.locality}
            />
            <Field
              label="Telefon"
              name="phone"
              type="tel"
              value={member?.phone}
              hint="Apare pe cartela publică și este numărul după care membrul își verifică statutul."
            />
            <Field
              label="Membru din"
              name="joinedAt"
              type="date"
              value={member?.joinedAt ?? new Date().toISOString().slice(0, 10)}
            />

            <fieldset className="f-field">
              <legend>Servicii prestate</legend>
              <div className="admin-checks">
                {SERVICES.map((name, i) => (
                  <label className="f-consent" key={i}>
                    <input
                      type="checkbox"
                      name="services"
                      value={i}
                      defaultChecked={member?.services.includes(i)}
                    />
                    <span>{name}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="f-consent">
              <input
                type="checkbox"
                name="listed"
                defaultChecked={member?.listed ?? true}
              />
              <span>
                Afișat public în directoriu. Debifează pentru a-l ascunde de pe
                site — verificarea după telefon continuă să funcționeze.
              </span>
            </label>
          </div>

          <div className="f-nav">
            <span />
            <button className="btn btn-primary" type="submit">
              {isNew ? "Adaugă membrul" : "Salvează modificările"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
