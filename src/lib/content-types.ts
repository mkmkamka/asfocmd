/**
 * Shapes the owner creates in /admin.
 *
 * Romanian is required everywhere; Russian and English are optional and fall
 * back to Romanian when empty (see `pick` below). That was a deliberate call:
 * a form that refuses to publish until three translations exist is a form that
 * stops being used.
 */

export type Locale3 = "ro" | "ru" | "en";

/** Romanian required, the other two optional. */
export type Localized = { ro: string; ru?: string; en?: string };

/** Read a localised field, falling back to Romanian. */
export function pick(value: Localized | undefined, locale: Locale3): string {
  if (!value) return "";
  return (value[locale] || value.ro || "").trim();
}

/** Cover image: either a file the owner uploaded, or a link to a Facebook post. */
export type Media = {
  /** Path under /uploads, set when the owner uploaded a file. */
  image?: string;
  /** External link (a Facebook post, an album, a news article). */
  link?: string;
};

export type AdminPost = Media & {
  id: string;
  slug: string;
  title: Localized;
  excerpt: Localized;
  body: Localized;
  /** Publication date, `YYYY-MM-DD` — the owner can backdate an announcement. */
  date: string;
  published: boolean;
  /** Set when the post came from the Facebook importer. Kept so the importer
      can show what has already been taken and never duplicate a post. */
  facebookId?: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminCourse = Media & {
  id: string;
  slug: string;
  title: Localized;
  summary: Localized;
  body: Localized;
  /** `YYYY-MM-DD`. `endDate` empty means a single-day course. */
  startDate: string;
  endDate: string;
  /** Free text: "Chișinău, bd. Decebal 76" or "online". */
  location: Localized;
  /** Free text rather than a number — real announcements say
      "2000,00 lei pentru o persoană", and forcing that into a number loses
      the part that answers the reader's question. */
  price: Localized;
  /** Registration deadline, `YYYY-MM-DD`, optional. */
  deadline: string;
  contactEmail: string;
  contactPhone: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StoredMember = {
  id: string;
  name: string;
  /** Shown on the public card when there is no photo. */
  initials: string;
  districtId: string;
  locality: string;
  /** Published on the public directory card — the member's own number. */
  phone: string;
  /** Indices into `home.hero.services` — the five public trades. */
  services: number[];
  /** `YYYY-MM-DD`. What the lookup reports as "membru din". */
  joinedAt: string;
  /** Off hides the member from the public directory without deleting them
      (a lapsed subscription, a member who asked not to be listed). Their
      status lookup still works. */
  listed: boolean;
  /** Set when the member came from an application rather than being typed in. */
  submissionId?: string;
  createdAt: string;
  updatedAt: string;
};

export type ApplicationStatus = "pending" | "approved" | "rejected";

export type Submission = {
  id: string;
  receivedAt: string;
  status: ApplicationStatus;
  fullName: string;
  phone: string;
  email: string;
  districtId: string;
  locality: string;
  isCompany: boolean;
  companyName: string;
  companyIdno: string;
  companyAddress: string;
  companyEmail: string;
  companyDesc: string;
  domains: number[];
  experience: string;
  about: string;
  heardFrom: string;
  advantage: string;
  attraction: string;
  locale: string;
  files: { stored: string; name: string; type: string; size: number }[];
  /** Set when the secretariat acts on it. */
  decidedAt?: string;
  note?: string;
};

export type Message = {
  id: string;
  receivedAt: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  read?: boolean;
};

/** Initials for the directory avatar: first letters of the first two words. */
export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Digits only, so `+373 79 447 686` and `079447686` compare equal. */
export function normalisePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  // Moldovan numbers are written both as +373 79… and as 079…; drop the
  // country code and any trunk zero so the two forms meet in the middle.
  return digits.replace(/^373/, "").replace(/^0/, "");
}
