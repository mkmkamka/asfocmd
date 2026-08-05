import Link from "next/link";
import { redirect } from "next/navigation";
import { promises as fs } from "node:fs";
import path from "node:path";
import Icon from "@/components/Icon";
import LogoutButton from "@/components/admin/LogoutButton";
import { isLoggedIn } from "@/lib/admin-auth";
import { readAll } from "@/lib/store";

/* Counts for the dashboard tiles. Read straight off disk for now; this is the
   one place that will change when the storage driver is swapped for a database
   (see the note in cms/README.md). */
async function pendingCount(): Promise<number> {
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), ".data", "submissions.json"),
      "utf8",
    );
    const all = JSON.parse(raw);
    if (!Array.isArray(all)) return 0;
    return all.filter((s) => s?.status !== "approved" && s?.status !== "rejected")
      .length;
  } catch {
    return 0;
  }
}

async function messageCount(): Promise<number> {
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), ".data", "messages.json"),
      "utf8",
    );
    const all = JSON.parse(raw);
    return Array.isArray(all) ? all.length : 0;
  } catch {
    return 0;
  }
}

export default async function AdminHome() {
  if (!(await isLoggedIn())) redirect("/admin/login");

  const [pending, messages, posts, courses, members] = await Promise.all([
    pendingCount(),
    messageCount(),
    readAll("posts").then((r) => r.length),
    readAll("courses").then((r) => r.length),
    readAll("members").then((r) => r.length),
  ]);

  /* Romanian inflects the noun on the count, so "1 membri" and "1 publicate"
     are both wrong. `Intl.PluralRules` knows the rule (one · few · other),
     which also covers the 20+ case where Romanian inserts "de". */
  const count = (n: number, one: string, few: string, many: string) => {
    const rule = new Intl.PluralRules("ro").select(n);
    return `${n} ${rule === "one" ? one : rule === "few" ? few : many}`;
  };

  const tiles = [
    {
      href: "/admin/stiri",
      icon: "doc" as const,
      title: "Știri",
      desc: "Adaugă și editează anunțuri și evenimente.",
      meta: count(posts, "știre", "știri", "de știri"),
    },
    {
      href: "/admin/instruire",
      icon: "shield" as const,
      title: "Instruire",
      desc: "Cursuri cu dată, loc, preț și înscriere.",
      meta: count(courses, "curs", "cursuri", "de cursuri"),
    },
    {
      href: "/admin/cereri",
      icon: "badgeCheck" as const,
      title: "Cereri de aderare",
      desc: "Verifică dosarele primite și aprobă membrii.",
      meta: `${pending} în așteptare`,
    },
    {
      href: "/admin/membri",
      icon: "shieldCheck" as const,
      title: "Membri",
      desc: "Cine apare pe hartă și cine se poate verifica după telefon.",
      meta: count(members, "membru", "membri", "de membri"),
    },
    {
      href: "/admin/mesaje",
      icon: "mail" as const,
      title: "Mesaje",
      desc: "Mesajele trimise din formularul de contact.",
      meta: count(messages, "mesaj primit", "mesaje primite", "de mesaje primite"),
    },
  ];

  return (
    <main className="admin-shell">
      <div className="admin-wrap">
        <header className="admin-head">
          <div>
            <div className="kick" aria-hidden />
            <h1>Panou de administrare</h1>
            <p className="lead">
              De aici publici conținutul site-ului. Nu ai nevoie de cod.
            </p>
          </div>
          <LogoutButton />
        </header>

        <div className="admin-tiles">
          {tiles.map((t) => (
            <Link className="admin-tile" href={t.href} key={t.title}>
              <div className="ic">
                <Icon name={t.icon} size={22} />
              </div>
              <h2>{t.title}</h2>
              <p>{t.desc}</p>
              <span className="admin-tile-meta">{t.meta}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
