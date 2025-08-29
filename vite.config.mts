import { defineConfig } from "vite";
import { redwood } from "rwsdk/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import path from "path";

export default defineConfig({
  plugins: [
    cloudflare({
      viteEnvironment: { name: "worker" },
    }),
    redwood(),
  ],
  resolve: {
    alias: {
      "@/*": path.resolve(__dirname, "./src/*"),
      "@generated/*": path.resolve(__dirname, "./generated/*"),
      // Add alias for local addons development
      "../../../addons/barcode-scanner": path.resolve(__dirname, "./addons/barcode-scanner/index.ts"),
    },
  },
});
