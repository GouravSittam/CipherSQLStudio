/**
 * Vite Configuration
 * Author: Gourav Chaudhary
 *
 * Migrated from CRA to Vite for faster dev experience.
 * Hot reload is like 10x faster now, totally worth it.
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000, // Keeping the same port we used with CRA
    open: true, // Opens browser automatically on npm run dev
  },

  build: {
    outDir: "build", // Match CRA's output folder for consistency
    sourcemap: true, // Useful for debugging production issues
  },
});
