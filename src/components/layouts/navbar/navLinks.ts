import { t } from "@/i18n";

export function getNavLinks(locale: string) {
  const dict = t(locale);

  return [
    { key: "", label: dict.nav.home },
    { key: "nosto-ovet", label: dict.nav.nostoOvet },
    {
      key: "rullaovet-turvakaihtimet",
      label: dict.nav.rullaovetTurvakaihtimet,
    },
    { key: "palo-ovet", label: dict.nav.paloOvet },
    { key: "pihaportit", label: dict.nav.pihaportitAidat },
    { key: "kaapit", label: dict.nav.kaapit },
    { key: "galleria", label: dict.nav.galleria },
    { key: "huolto", label: dict.nav.huolto },
    { key: "yhteystiedot", label: dict.nav.yhteystiedot },
  ];
}
