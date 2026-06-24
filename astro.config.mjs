// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  i18n: {
    locales: ["fi", "en", "es"],
    defaultLocale: "fi",
  },
  prefetch: true,
});
