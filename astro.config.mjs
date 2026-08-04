// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react()],

  i18n: {
    locales: ["fi", "en", "es"],
    defaultLocale: "fi",
  },

  prefetch: true,
  adapter: cloudflare(),
});
