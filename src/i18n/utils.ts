import { en } from "./en";
import { fi } from "./fi";

export const translations = { fi, en };
export type Locale = keyof typeof translations;

export function t(locale: string | undefined) {
  const l = (locale ?? "fi") as Locale;
  return translations[l];
}
