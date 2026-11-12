/**
 * Vite Configuration
 * Author: Gourav Chaudhary
 *
 * Dev server proxies /api to the local Express server (npm run dev:server).
 * Production build is deployed to Vercel from the `build` folder.
 */

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: "build",
    sourcemap: false,
    emptyOutDir: true,
  },

  envPrefix: "VITE_",
});
