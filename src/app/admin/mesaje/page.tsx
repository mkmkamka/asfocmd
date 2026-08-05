import { redirect } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import { isLoggedIn } from "@/lib/admin-auth";
import { getMessages } from "@/lib/admin-data";
import { deleteMessage, toggleMessageRead } from "../actions";

export default async function AdminMessages() {
  if (!(await isLoggedIn())) redirect("/admin/login");

  const messages = await getMessages();
  const unread = messages.filter((m) => !m.read).length;

  return (
    <main className="admin-shell">
      <div className="admin-wrap">
        <AdminHeader
          title="Mesaje"
          lead={
            unread > 0
              ? `${unread} necitite din formularul de contact.`
              : "Mesajele trimise din formularul de contact."
          }
        />

        {messages.length === 0 ? (
          <div className="admin-empty">
            <p>Nu a fost primit încă niciun mesaj.</p>
          </div>
        ) : (
          <div className="admin-cards">
            {messages.map((m) => (
              <article
                className={`admin-card${m.read ? "" : " is-unread"}`}
                key={m.id}
              >
                <div className="admin-card-head">
                  <div>
                    <b>{m.name}</b>
                    <span className="admin-row-meta">
                      <a href={`mailto:${m.email}`}>{m.email}</a> ·{" "}
                      {m.receivedAt.slice(0, 10)}
                    </span>
                  </div>
                  {!m.read && <span className="admin-pill is-pending">Nou</span>}
                </div>
                {m.subject && <p className="admin-subject">{m.subject}</p>}
                <p className="admin-message">{m.message}</p>
                <div className="admin-card-actions">
                  <a className="btn btn-primary" href={`mailto:${m.email}`}>
                    Răspunde
                  </a>
                  <form action={toggleMessageRead}>
                    <input type="hidden" name="id" value={m.id} />
                    <button className="btn btn-ghost" type="submit">
                      {m.read ? "Marchează necitit" : "Marchează citit"}
                    </button>
                  </form>
                  <form action={deleteMessage}>
                    <input type="hidden" name="id" value={m.id} />
                    <button className="btn btn-danger" type="submit">
                      Șterge
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
