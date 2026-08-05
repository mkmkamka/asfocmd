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
import type { AdminCourse } from "@/lib/content-types";
import { saveCourse } from "../../actions";

export default async function CourseEditor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isLoggedIn())) redirect("/admin/login");

  const { id } = await params;
  const isNew = id === "nou";
  const course = isNew ? undefined : await findById<AdminCourse>("courses", id);
  if (!isNew && !course) notFound();

  return (
    <main className="admin-shell">
      <div className="admin-wrap admin-wrap-narrow">
        <AdminHeader
          title={isNew ? "Curs nou" : "Editează cursul"}
          back="/admin/instruire"
          backLabel="Instruire"
        />

        <form className="admin-form" action={saveCourse}>
          <input type="hidden" name="id" value={course?.id ?? ""} />

          <div className="f-grid">
            <Translated
              label="Denumirea cursului"
              name="title"
              value={course?.title}
              required
            />
            <Field
              label="Data de început"
              name="startDate"
              type="date"
              value={course?.startDate ?? new Date().toISOString().slice(0, 10)}
              required
            />
            <Field
              label="Data de sfârșit"
              name="endDate"
              type="date"
              value={course?.endDate}
              hint="Lasă gol pentru un curs de o singură zi."
            />
            <Translated
              label="Locul desfășurării"
              name="location"
              value={course?.location}
              hint="ex: mun. Chișinău, bd. Decebal 76, of. 601 — sau „online”."
            />
            <Translated
              label="Preț"
              name="price"
              value={course?.price}
              hint="Scrie exact cum vrei să apară: ex. „2000,00 lei pentru o persoană”."
            />
            <Field
              label="Termen de înscriere"
              name="deadline"
              type="date"
              value={course?.deadline}
            />
            <Field
              label="E-mail pentru înscrieri"
              name="contactEmail"
              type="email"
              value={course?.contactEmail ?? "asfocmd@gmail.com"}
            />
            <Field
              label="Telefon de contact"
              name="contactPhone"
              type="tel"
              value={course?.contactPhone}
            />
            <Translated
              label="Descriere scurtă"
              name="summary"
              value={course?.summary}
              area
              rows={3}
            />
            <Translated
              label="Program și detalii"
              name="body"
              value={course?.body}
              area
              rows={10}
            />
            <MediaFields image={course?.image} link={course?.link} />
            <PublishToggle published={course?.published} />
          </div>

          <div className="f-nav">
            <span />
            <button className="btn btn-primary" type="submit">
              {isNew ? "Publică cursul" : "Salvează modificările"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
