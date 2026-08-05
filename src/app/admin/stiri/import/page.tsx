import { redirect } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import { isLoggedIn } from "@/lib/admin-auth";
import { readAll } from "@/lib/store";
import type { AdminPost } from "@/lib/content-types";
import {
  facebookConfig,
  fetchRecentPosts,
  deriveTitle,
  type FacebookPost,
} from "@/lib/facebook";
import { importFacebookPost } from "../../actions";

export default async function FacebookImport() {
  if (!(await isLoggedIn())) redirect("/admin/login");

  const configured = !!facebookConfig();
  let posts: FacebookPost[] = [];
  let error: string | null = null;

  if (configured) {
    try {
      posts = await fetchRecentPosts(25);
    } catch (e) {
      // Surface whatever actually went wrong — Facebook's own wording for an
      // expired token, or the network error for an unreachable host. A generic
      // "something failed" would leave the owner with nothing to act on.
      error = e instanceof Error ? e.message : String(e);
    }
  }

  const imported = new Set(
    (await readAll<AdminPost>("posts"))
      .map((p) => p.facebookId)
      .filter(Boolean) as string[],
  );

  return (
    <main className="admin-shell">
      <div className="admin-wrap">
        <AdminHeader
          title="Importă din Facebook"
          lead="Alege o postare de pe pagina ASFOCMD. Se creează o ciornă pe care o poți corecta înainte de publicare."
          back="/admin/stiri"
          backLabel="Știri"
        />

        {!configured && <SetupInstructions />}

        {configured && error && (
          <div className="admin-notice is-error">
            <b>Facebook a răspuns cu o eroare:</b>
            <p>{error}</p>
            <p className="f-hint">
              Dacă mesajul spune că sesiunea a expirat, generează un token nou
              și înlocuiește <code>FACEBOOK_PAGE_TOKEN</code>. Dacă spune că
              versiunea API nu mai este suportată, actualizează{" "}
              <code>FACEBOOK_API_VERSION</code>.
            </p>
          </div>
        )}

        {configured && !error && posts.length === 0 && (
          <div className="admin-empty">
            <p>Nu am găsit postări cu text pe pagină.</p>
          </div>
        )}

        {posts.length > 0 && (
          <div className="admin-cards">
            {posts.map((post) => {
              const done = imported.has(post.id);
              return (
                <article className="admin-card" key={post.id}>
                  <div className="admin-fb">
                    {post.picture && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="admin-fb-thumb" src={post.picture} alt="" />
                    )}
                    <div className="admin-fb-body">
                      <b>{deriveTitle(post.message)}</b>
                      <span className="admin-row-meta">
                        {post.createdTime.slice(0, 10)}
                        {done && " · deja importată"}
                      </span>
                      <p className="admin-fb-text">{post.message}</p>
                    </div>
                  </div>
                  <div className="admin-card-actions">
                    <form action={importFacebookPost}>
                      <input type="hidden" name="facebookId" value={post.id} />
                      <button
                        className={done ? "btn btn-ghost" : "btn btn-primary"}
                        type="submit"
                      >
                        {done ? "Deschide ciorna" : "Creează ciorna"}
                      </button>
                    </form>
                    {post.permalink && (
                      <a
                        className="btn btn-ghost"
                        href={post.permalink}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Vezi pe Facebook
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

/* Shown until a Page token exists. Written for the person doing the setup, in
   Romanian, because the owner of the page may end up doing it himself. */
function SetupInstructions() {
  return (
    <div className="admin-notice">
      <b>Conectarea la Facebook nu este încă făcută.</b>
      <p>
        Importul are nevoie de un token de acces al paginii ASFOCMD. Se face o
        singură dată, de către cineva care este administrator al paginii:
      </p>
      <ol className="admin-steps">
        <li>
          Intră pe <code>developers.facebook.com</code> și creează o aplicație
          nouă, de tip <b>Business</b>.
        </li>
        <li>
          Adaugă produsul <b>Facebook Login for Business</b> și deschide{" "}
          <b>Graph API Explorer</b>.
        </li>
        <li>
          Selectează aplicația, apoi la <b>User or Page</b> alege{" "}
          <b>Get Page Access Token</b> și pagina ASFOCMD. Bifează permisiunile{" "}
          <code>pages_read_engagement</code> și{" "}
          <code>pages_show_list</code>.
        </li>
        <li>
          Transformă tokenul într-unul de lungă durată în{" "}
          <b>Access Token Tool → Extend Access Token</b>. Un token de pagină
          obținut dintr-un token de utilizator de lungă durată nu expiră.
        </li>
        <li>
          Copiază tokenul și ID-ul paginii în fișierul <code>.env.local</code>,
          apoi repornește serverul:
        </li>
      </ol>
      <code className="block">
        FACEBOOK_PAGE_ID=123456789012345
        <br />
        FACEBOOK_PAGE_TOKEN=EAAG...
      </code>
      <p className="f-hint">
        Cât timp aplicația rămâne în modul <b>Development</b> și persoana care a
        creat-o este administrator al paginii, nu este nevoie de App Review de
        la Meta — aplicația citește doar propria pagină.
      </p>
    </div>
  );
}
