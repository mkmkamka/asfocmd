import Link from "next/link";
import { redirect } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import { isLoggedIn } from "@/lib/admin-auth";
import { readAll } from "@/lib/store";
import type { AdminPost } from "@/lib/content-types";
import { deletePost } from "../actions";

export default async function AdminNewsList() {
  if (!(await isLoggedIn())) redirect("/admin/login");

  const posts = (await readAll<AdminPost>("posts")).sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  return (
    <main className="admin-shell">
      <div className="admin-wrap">
        <AdminHeader
          title="Știri"
          lead="Anunțuri și evenimente publicate pe site."
          action={
            <>
              <Link className="btn btn-ghost" href="/admin/stiri/import">
                Importă din Facebook
              </Link>
              <Link className="btn btn-primary" href="/admin/stiri/nou">
                Adaugă știre
              </Link>
            </>
          }
        />

        {posts.length === 0 ? (
          <div className="admin-empty">
            <p>Nu ai publicat încă nicio știre.</p>
            <Link className="btn btn-primary" href="/admin/stiri/nou">
              Adaugă prima știre
            </Link>
          </div>
        ) : (
          <ul className="admin-rows">
            {posts.map((post) => (
              <li className="admin-row" key={post.id}>
                <div className="admin-row-main">
                  <b>{post.title.ro}</b>
                  <span className="admin-row-meta">
                    {post.date}
                    {!post.published && " · ciornă"}
                    {post.image && " · cu imagine"}
                    {post.link && " · link extern"}
                  </span>
                </div>
                <div className="admin-row-actions">
                  <Link className="btn btn-ghost" href={`/admin/stiri/${post.id}`}>
                    Editează
                  </Link>
                  {/* A delete that is one click from a list is a delete that
                      happens by accident; the browser's own confirm is the
                      cheapest honest speed bump. */}
                  <form action={deletePost}>
                    <input type="hidden" name="id" value={post.id} />
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
