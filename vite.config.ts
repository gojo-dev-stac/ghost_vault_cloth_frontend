import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { fileURLToPath } from "node:url";

export default defineConfig(({ command, mode }) => ({
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      // src/server.ts wraps TanStack Start's server entry with our SSR error page.
      server: { entry: "server" },
      spa: {
        enabled: mode === "plesk",
        ...(mode === "plesk" && {
          prerender: {
            outputPath: "/_shell",
            crawlLinks: false,
          },
        }),
      },
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
    }),
    // Production server bundle in .output/ (run with `npm start`).
    // Set NITRO_PRESET (e.g. "vercel", "netlify", "cloudflare-module") to target another host.
    // server/static.ts replaces Nitro's static handler to add Range (206) support for video.
    ...(command === "build" && mode !== "plesk"
      ? [
          nitro({
            defaultPreset: "node-server",
            serveStatic: false,
            handlers: [{ route: "/**", middleware: true, handler: "./server/static.ts" }],
          }),
        ]
      : []),
    viteReact(),
  ],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  server: { port: 8080 },
  preview: { port: 8080 },
}));
