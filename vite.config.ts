import { defineConfig } from "vite-plus";

export default defineConfig({
  optimizeDeps: {
    exclude: ["maplibre-gl"],
  },
  staged: {
    "*": "vp check --fix",
  },
  fmt: {
    ignorePatterns: ["public/maplibre-gl-*.mjs", "public/photos.json"],
  },
  lint: {
    ignorePatterns: ["public/maplibre-gl-*.mjs", "public/photos.json"],
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  server: {
    allowedHosts: ["tmp-takahashi.shuuji3.xyz"],
  },
});
