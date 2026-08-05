import "server-only";
import type { Locale } from "./config";
import type ro from "./dictionaries/ro.json";

export type Dictionary = typeof ro;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  ro: () => import("./dictionaries/ro.json").then((m) => m.default),
  ru: () => import("./dictionaries/ru.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
};

export const getDictionary = async (locale: Locale): Promise<Dictionary> =>
  (dictionaries[locale] ?? dictionaries.ro)();
