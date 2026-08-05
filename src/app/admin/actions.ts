"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import {
  findById,
  newId,
  readAll,
  remove,
  uniqueSlug,
  upsert,
  writeAll,
} from "@/lib/store";
import { deriveExcerpt, deriveTitle, fetchPost } from "@/lib/facebook";
import { IMAGE_TYPES, MAX_IMAGE_BYTES, saveImageBytes } from "@/lib/media";
import {
  initialsOf,
  type AdminCourse,
  type AdminPost,
  type Localized,
  type Message,
  type StoredMember,
  type Submission,
} from "@/lib/content-types";

const text = (form: FormData, key: string, max = 500): string =>
  String(form.get(key) ?? "").trim().slice(0, max);

const localized = (form: FormData, key: string, max = 20000): Localized => ({
  ro: text(form, `${key}_ro`, max),
  ru: text(form, `${key}_ru`, max) || undefined,
  en: text(form, `${key}_en`, max) || undefined,
});

/** Store an uploaded cover image and return the URL that serves it. */
async function saveImage(form: FormData): Promise<string | undefined> {
  const file = form.get("imageFile");
  if (!(file instanceof File) || file.size === 0) return undefined;
  if (!IMAGE_TYPES[file.type]) throw new Error("unsupported_image");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("image_too_large");
  return saveImageBytes(Buffer.from(await file.arrayBuffer()), file.type);
}

/** Only http(s) links are stored — never `javascript:` or a data URL. */
function safeLink(value: string): string {
  if (!value) return "";
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : "";
  } catch {
    return "";
  }
}

const today = () => new Date().toISOString().slice(0, 10);

/* ---- news ---------------------------------------------------------------- */

export async function savePost(form: FormData): Promise<void> {
  await requireAdmin();

  const id = text(form, "id") || newId();
  const existing = await findById<AdminPost>("posts", id);
  const title = localized(form, "title", 300);
  if (!title.ro) throw new Error("title_required");

  const uploaded = await saveImage(form);
  const post: AdminPost = {
    id,
    slug: existing?.slug ?? (await uniqueSlug("posts", title.ro, id)),
    title,
    excerpt: localized(form, "excerpt", 600),
    body: localized(form, "body"),
    date: text(form, "date", 10) || existing?.date || today(),
    // Clearing the image is an explicit act, not the absence of a new upload —
    // otherwise every edit that does not re-pick a file would wipe the cover.
    image: form.get("removeImage") ? undefined : (uploaded ?? existing?.image),
    link: safeLink(text(form, "link", 500)),
    published: form.get("published") === "on",
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await upsert("posts", post);
  revalidatePath("/admin/stiri");
  revalidatePath("/[locale]/stiri", "page");
  redirect("/admin/stiri");
}

export async function deletePost(form: FormData): Promise<void> {
  await requireAdmin();
  await remove("posts", text(form, "id"));
  revalidatePath("/admin/stiri");
  revalidatePath("/[locale]/stiri", "page");
}

/* ---- Facebook import ------------------------------------------------------ */

/** Pull a cover image off Facebook's CDN and keep our own copy.
    Their URLs carry an expiring signature, so hotlinking one means the article
    silently loses its picture a few days later. */
async function storeRemoteImage(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return undefined;
    const type = (res.headers.get("content-type") ?? "").split(";")[0].trim();
    return saveImageBytes(Buffer.from(await res.arrayBuffer()), type);
  } catch {
    // A missing picture is not a reason to lose the text of the announcement.
    return undefined;
  }
}

/**
 * Turn one Facebook post into a *draft* article and open it in the editor.
 *
 * Draft rather than published on purpose: a Facebook post has no headline, so
 * the title here is a guess made from its first line and somebody has to look
 * at it before it becomes the site's news.
 */
export async function importFacebookPost(form: FormData): Promise<void> {
  await requireAdmin();

  const facebookId = text(form, "facebookId", 100);
  if (!facebookId) return;

  // Importing the same post twice would put a duplicate article on the site;
  // send the owner to the one that already exists instead.
  const posts = await readAll<AdminPost>("posts");
  const already = posts.find((p) => p.facebookId === facebookId);
  if (already) redirect(`/admin/stiri/${already.id}`);

  const source = await fetchPost(facebookId);
  const title = deriveTitle(source.message);
  const id = newId();

  await upsert<AdminPost>("posts", {
    id,
    slug: await uniqueSlug("posts", title, id),
    title: { ro: title },
    excerpt: { ro: deriveExcerpt(source.message) },
    body: { ro: source.message },
    date: (source.createdTime || new Date().toISOString()).slice(0, 10),
    image: source.picture ? await storeRemoteImage(source.picture) : undefined,
    link: safeLink(source.permalink),
    published: false,
    facebookId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  revalidatePath("/admin/stiri");
  redirect(`/admin/stiri/${id}`);
}

/* ---- courses ------------------------------------------------------------- */

export async function saveCourse(form: FormData): Promise<void> {
  await requireAdmin();

  const id = text(form, "id") || newId();
  const existing = await findById<AdminCourse>("courses", id);
  const title = localized(form, "title", 300);
  if (!title.ro) throw new Error("title_required");

  const uploaded = await saveImage(form);
  const course: AdminCourse = {
    id,
    slug: existing?.slug ?? (await uniqueSlug("courses", title.ro, id)),
    title,
    summary: localized(form, "summary", 600),
    body: localized(form, "body"),
    startDate: text(form, "startDate", 10) || today(),
    endDate: text(form, "endDate", 10),
    location: localized(form, "location", 300),
    price: localized(form, "price", 200),
    deadline: text(form, "deadline", 10),
    contactEmail: text(form, "contactEmail", 200),
    contactPhone: text(form, "contactPhone", 40),
    image: form.get("removeImage") ? undefined : (uploaded ?? existing?.image),
    link: safeLink(text(form, "link", 500)),
    published: form.get("published") === "on",
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await upsert("courses", course);
  revalidatePath("/admin/instruire");
  revalidatePath("/[locale]/instruire", "page");
  redirect("/admin/instruire");
}

export async function deleteCourse(form: FormData): Promise<void> {
  await requireAdmin();
  await remove("courses", text(form, "id"));
  revalidatePath("/admin/instruire");
  revalidatePath("/[locale]/instruire", "page");
}

/* ---- members ------------------------------------------------------------- */

function memberFromForm(form: FormData, existing?: StoredMember): StoredMember {
  const name = text(form, "name", 200);
  if (!name) throw new Error("name_required");
  return {
    id: existing?.id ?? text(form, "id") ?? newId(),
    name,
    initials: initialsOf(name),
    districtId: text(form, "districtId", 50),
    locality: text(form, "locality", 200),
    phone: text(form, "phone", 40),
    services: form
      .getAll("services")
      .map((v) => Number(v))
      .filter((n) => Number.isInteger(n) && n >= 0 && n < 5),
    joinedAt: text(form, "joinedAt", 10) || existing?.joinedAt || today(),
    listed: form.get("listed") === "on",
    submissionId: existing?.submissionId,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function saveMember(form: FormData): Promise<void> {
  await requireAdmin();
  const id = text(form, "id");
  const existing = id ? await findById<StoredMember>("members", id) : undefined;
  const member = memberFromForm(form, existing);
  if (!existing) member.id = id || newId();
  await upsert("members", member);
  revalidatePath("/admin/membri");
  revalidatePath("/[locale]/servicii", "page");
  redirect("/admin/membri");
}

export async function deleteMember(form: FormData): Promise<void> {
  await requireAdmin();
  await remove("members", text(form, "id"));
  revalidatePath("/admin/membri");
  revalidatePath("/[locale]/servicii", "page");
}

/* ---- applications -------------------------------------------------------- */

/** Approve an application: it becomes a member, and the phone lookup finds it. */
export async function approveApplication(form: FormData): Promise<void> {
  await requireAdmin();
  const id = text(form, "id");
  const rows = await readAll<Submission>("submissions");
  const application = rows.find((s) => s.id === id);
  if (!application) return;

  application.status = "approved";
  application.decidedAt = new Date().toISOString();
  await writeAll("submissions", rows);

  // An application asks about eight trades; the public directory shows five.
  // The first five are the same list in the same order, so the extra three are
  // simply not carried over — they stay on the application for the record.
  const services = application.domains.filter((n) => n >= 0 && n < 5);

  const members = await readAll<StoredMember>("members");
  if (!members.some((m) => m.submissionId === application.id)) {
    await upsert<StoredMember>("members", {
      id: newId(),
      name: application.fullName,
      initials: initialsOf(application.fullName),
      districtId: application.districtId,
      locality: application.locality,
      phone: application.phone,
      services,
      joinedAt: today(),
      listed: true,
      submissionId: application.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  revalidatePath("/admin/cereri");
  revalidatePath("/admin/membri");
  revalidatePath("/[locale]/servicii", "page");
}

export async function rejectApplication(form: FormData): Promise<void> {
  await requireAdmin();
  const id = text(form, "id");
  const rows = await readAll<Submission>("submissions");
  const application = rows.find((s) => s.id === id);
  if (!application) return;
  application.status = "rejected";
  application.decidedAt = new Date().toISOString();
  application.note = text(form, "note", 1000);
  await writeAll("submissions", rows);
  revalidatePath("/admin/cereri");
}

/* ---- messages ------------------------------------------------------------ */

export async function toggleMessageRead(form: FormData): Promise<void> {
  await requireAdmin();
  const id = text(form, "id");
  const rows = await readAll<Message>("messages");
  const row = rows.find((m) => m.id === id);
  if (!row) return;
  row.read = !row.read;
  await writeAll("messages", rows);
  revalidatePath("/admin/mesaje");
}

export async function deleteMessage(form: FormData): Promise<void> {
  await requireAdmin();
  await remove("messages", text(form, "id"));
  revalidatePath("/admin/mesaje");
}
