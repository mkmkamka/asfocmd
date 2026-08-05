import "server-only";
import { newId, readAll, writeAll } from "@/lib/store";
import type { Message, Submission } from "@/lib/content-types";

/**
 * Readers that heal the older records already sitting in `.data/`.
 *
 * Applications and messages predate the admin panel: they have no `id` (the
 * panel needs one to act on a row), no `status`, and applications stored the
 * trade picks under `services` before the form grew to eight domains. Rather
 * than a migration script somebody has to remember to run, the reader fills
 * the gaps and writes the file back only when something actually changed.
 */

type LegacySubmission = Partial<Submission> & {
  services?: number[];
  receivedAt?: string;
};

export async function getSubmissions(): Promise<Submission[]> {
  const rows = await readAll<LegacySubmission>("submissions");
  let changed = false;

  const healed = rows.map((row) => {
    const next: Submission = {
      id: row.id ?? newId(),
      receivedAt: row.receivedAt ?? new Date(0).toISOString(),
      status: row.status ?? "pending",
      fullName: row.fullName ?? "",
      phone: row.phone ?? "",
      email: row.email ?? "",
      districtId: row.districtId ?? "",
      locality: row.locality ?? "",
      isCompany: row.isCompany ?? false,
      companyName: row.companyName ?? "",
      companyIdno: row.companyIdno ?? "",
      companyAddress: row.companyAddress ?? "",
      companyEmail: row.companyEmail ?? "",
      companyDesc: row.companyDesc ?? "",
      domains: row.domains ?? row.services ?? [],
      experience: row.experience ?? "",
      about: row.about ?? "",
      heardFrom: row.heardFrom ?? "",
      advantage: row.advantage ?? "",
      attraction: row.attraction ?? "",
      locale: row.locale ?? "ro",
      files: row.files ?? [],
      decidedAt: row.decidedAt,
      note: row.note,
    };
    if (!row.id || !row.status || !row.domains) changed = true;
    return next;
  });

  if (changed) await writeAll("submissions", healed);
  return healed.sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}

export async function getMessages(): Promise<Message[]> {
  const rows = await readAll<Partial<Message>>("messages");
  let changed = false;

  const healed = rows.map((row) => {
    if (!row.id) changed = true;
    return {
      id: row.id ?? newId(),
      receivedAt: row.receivedAt ?? new Date(0).toISOString(),
      name: row.name ?? "",
      email: row.email ?? "",
      subject: row.subject,
      message: row.message ?? "",
      read: row.read ?? false,
    } satisfies Message;
  });

  if (changed) await writeAll("messages", healed);
  return healed.sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}
