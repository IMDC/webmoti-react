import { defineConfig } from "vite";
import { resolve } from "path";

// https://vite.dev/guide/backend-integration.html
export default defineConfig({
  root: resolve(__dirname, "src"),
  build: {
    // generate .vite/manifest.json in outDir
    manifest: true,
    emptyOutDir: true,
    outDir: resolve(__dirname, "../static/build"),
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/bundles/main.js"),
        queue: resolve(__dirname, "src/bundles/queueBundle.js"),
        classroom: resolve(__dirname, "src/bundles/classroomBundle.js"),
        sw: resolve(__dirname, "src/js/sw.js"),
        styles: resolve(__dirname, "src/styles/style.css"),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === "sw") {
            return "sw.js";
          }
          return "assets/[name]-[hash].js";
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8080",
    },
    origin: "http://localhost:8080",
  },
});
