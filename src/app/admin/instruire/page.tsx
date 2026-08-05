import Link from "next/link";
import { redirect } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import { isLoggedIn } from "@/lib/admin-auth";
import { readAll } from "@/lib/store";
import type { AdminCourse } from "@/lib/content-types";
import { deleteCourse } from "../actions";

export default async function AdminCoursesList() {
  if (!(await isLoggedIn())) redirect("/admin/login");

  const courses = (await readAll<AdminCourse>("courses")).sort((a, b) =>
    b.startDate.localeCompare(a.startDate),
  );
  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="admin-shell">
      <div className="admin-wrap">
        <AdminHeader
          title="Instruire"
          lead="Cursuri cu dată, loc, preț și termen de înscriere."
          action={
            <Link className="btn btn-primary" href="/admin/instruire/nou">
              Adaugă curs
            </Link>
          }
        />

        {courses.length === 0 ? (
          <div className="admin-empty">
            <p>Nu ai adăugat încă niciun curs.</p>
            <Link className="btn btn-primary" href="/admin/instruire/nou">
              Adaugă primul curs
            </Link>
          </div>
        ) : (
          <ul className="admin-rows">
            {courses.map((course) => {
              // "Upcoming" is decided from the dates rather than from a flag the
              // owner has to remember to turn off — a course that has happened
              // should stop advertising itself on its own.
              const ended = (course.endDate || course.startDate) < today;
              return (
                <li className="admin-row" key={course.id}>
                  <div className="admin-row-main">
                    <b>{course.title.ro}</b>
                    <span className="admin-row-meta">
                      {course.startDate}
                      {course.endDate && ` – ${course.endDate}`}
                      {course.location.ro && ` · ${course.location.ro}`}
                      {course.price.ro && ` · ${course.price.ro}`}
                      {!course.published && " · ciornă"}
                      {ended && " · încheiat"}
                    </span>
                  </div>
                  <div className="admin-row-actions">
                    <Link
                      className="btn btn-ghost"
                      href={`/admin/instruire/${course.id}`}
                    >
                      Editează
                    </Link>
                    <form action={deleteCourse}>
                      <input type="hidden" name="id" value={course.id} />
                      <button className="btn btn-danger" type="submit">
                        Șterge
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
