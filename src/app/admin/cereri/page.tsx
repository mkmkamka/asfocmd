import { redirect } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import { isLoggedIn } from "@/lib/admin-auth";
import { getSubmissions } from "@/lib/admin-data";
import mapData from "@/data/moldova-districts.json";
import ro from "@/i18n/dictionaries/ro.json";
import { approveApplication, rejectApplication } from "../actions";

const districtName = (id: string) =>
  (mapData.districts as { id: string; ro: string }[]).find((d) => d.id === id)
    ?.ro ?? id;

const DOMAINS = ro.home.membershipForm.domains;

const STATUS_LABEL = {
  pending: "În așteptare",
  approved: "Aprobată",
  rejected: "Respinsă",
} as const;

export default async function AdminApplications() {
  if (!(await isLoggedIn())) redirect("/admin/login");

  const applications = await getSubmissions();
  const pending = applications.filter((a) => a.status === "pending");
  const decided = applications.filter((a) => a.status !== "pending");

  return (
    <main className="admin-shell">
      <div className="admin-wrap">
        <AdminHeader
          title="Cereri de aderare"
          lead="Aprobă un solicitant și el devine membru — apoi își poate verifica singur statutul pe site, după numărul de telefon."
        />

        {applications.length === 0 && (
          <div className="admin-empty">
            <p>Nu a fost primită încă nicio cerere.</p>
          </div>
        )}

        {[
          { rows: pending, heading: `În așteptare (${pending.length})` },
          { rows: decided, heading: `Soluționate (${decided.length})` },
        ].map(
          ({ rows, heading }) =>
            rows.length > 0 && (
              <section key={heading} className="admin-section">
                <h2 className="admin-section-title">{heading}</h2>
                <div className="admin-cards">
                  {rows.map((a) => (
                    <article className="admin-card" key={a.id}>
                      <div className="admin-card-head">
                        <div>
                          <b>{a.fullName}</b>
                          <span className="admin-row-meta">
                            {districtName(a.districtId)}
                            {a.locality && `, ${a.locality}`} ·{" "}
                            {a.receivedAt.slice(0, 10)}
                          </span>
                        </div>
                        <span className={`admin-pill is-${a.status}`}>
                          {STATUS_LABEL[a.status]}
                        </span>
                      </div>

                      <dl className="admin-dl">
                        <div>
                          <dt>Telefon</dt>
                          <dd>
                            <a href={`tel:${a.phone.replace(/\s/g, "")}`}>
                              {a.phone}
                            </a>
                          </dd>
                        </div>
                        <div>
                          <dt>E-mail</dt>
                          <dd>
                            <a href={`mailto:${a.email}`}>{a.email}</a>
                          </dd>
                        </div>
                        {a.isCompany && (
                          <div>
                            <dt>Persoană juridică</dt>
                            <dd>
                              {a.companyName}
                              {a.companyIdno && ` · IDNO ${a.companyIdno}`}
                            </dd>
                          </div>
                        )}
                        <div>
                          <dt>Domenii</dt>
                          <dd>
                            {a.domains.map((d) => DOMAINS[d] ?? d).join(", ") ||
                              "—"}
                          </dd>
                        </div>
                        <div>
                          <dt>Experiență</dt>
                          <dd>{a.experience ? `${a.experience} ani` : "—"}</dd>
                        </div>
                        {a.heardFrom && (
                          <div>
                            <dt>A auzit de la</dt>
                            <dd>{a.heardFrom}</dd>
                          </div>
                        )}
                        {a.about && (
                          <div>
                            <dt>Despre</dt>
                            <dd>{a.about}</dd>
                          </div>
                        )}
                      </dl>

                      {a.files.length > 0 && (
                        <div className="admin-docs">
                          <span className="admin-docs-label">Documente</span>
                          {a.files.map((file) => (
                            <a
                              key={file.stored}
                              className="admin-doc"
                              href={`/api/admin/document?path=${encodeURIComponent(file.stored)}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {file.name}
                            </a>
                          ))}
                        </div>
                      )}

                      {a.status === "pending" && (
                        <div className="admin-card-actions">
                          <form action={approveApplication}>
                            <input type="hidden" name="id" value={a.id} />
                            <button className="btn btn-primary" type="submit">
                              Aprobă și adaugă ca membru
                            </button>
                          </form>
                          <form action={rejectApplication}>
                            <input type="hidden" name="id" value={a.id} />
                            <button className="btn btn-ghost" type="submit">
                              Respinge
                            </button>
                          </form>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            ),
        )}
      </div>
    </main>
  );
}
