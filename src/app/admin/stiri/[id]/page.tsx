import { notFound, redirect } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  Field,
  MediaFields,
  PublishToggle,
  Translated,
} from "@/components/admin/Fields";
import { isLoggedIn } from "@/lib/admin-auth";
import { findById } from "@/lib/store";
import type { AdminPost } from "@/lib/content-types";
import { savePost } from "../../actions";

export default async function PostEditor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isLoggedIn())) redirect("/admin/login");

  const { id } = await params;
  const isNew = id === "nou";
  const post = isNew ? undefined : await findById<AdminPost>("posts", id);
  if (!isNew && !post) notFound();

  return (
    <main className="admin-shell">
      <div className="admin-wrap admin-wrap-narrow">
        <AdminHeader
          title={isNew ? "Știre nouă" : "Editează știrea"}
          back="/admin/stiri"
          backLabel="Știri"
        />

        <form className="admin-form" action={savePost}>
          <input type="hidden" name="id" value={post?.id ?? ""} />

          <div className="f-grid">
            <Translated
              label="Titlu"
              name="title"
              value={post?.title}
              required
            />
            <Field
              label="Data"
              name="date"
              type="date"
              value={post?.date ?? new Date().toISOString().slice(0, 10)}
              required
            />
            <Translated
              label="Rezumat"
              name="excerpt"
              value={post?.excerpt}
              area
              rows={3}
              hint="Două-trei rânduri, afișate în lista de știri."
            />
            <Translated
              label="Text"
              name="body"
              value={post?.body}
              area
              rows={12}
              hint="Scrie normal. Un rând gol separă paragrafele."
            />
            <MediaFields image={post?.image} link={post?.link} />
            <PublishToggle published={post?.published} />
          </div>

          <div className="f-nav">
            <span />
            <button className="btn btn-primary" type="submit">
              {isNew ? "Publică știrea" : "Salvează modificările"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
