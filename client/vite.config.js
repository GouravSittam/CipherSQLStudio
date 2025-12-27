/**
 * Vite Configuration
 * Author: Gourav Chaudhary
 *
 * Migrated from CRA to Vite for faster dev experience.
 * Configured for Vercel deployment.
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    open: true,
    // Proxy API requests to backend during development
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: "dist",
    sourcemap: false, // Disable in production for smaller bundles
  },

  // Environment variable prefix
  envPrefix: "VITE_",
});
