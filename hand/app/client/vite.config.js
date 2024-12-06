import { defineConfig } from "vite";

// https://vite.dev/guide/backend-integration.html
export default defineConfig({
  root: "./src/",
  build: {
    // generate .vite/manifest.json in outDir
    manifest: true,
    emptyOutDir: true,
    outDir: "../../static/build",
    rollupOptions: {
      input: {
        main: "./src/bundles/main.js",
        queue: "./src/bundles/queueBundle.js",
        classroom: "./src/bundles/classroomBundle.js",
        sw: "./src/js/sw.js",
        styles: "./src/styles/style.css",
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
