import { fileURLToPath, URL } from "node:url";
import { defineConfig, type HtmlTagDescriptor, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { AUTH_TOKEN_STORAGE_KEY } from "./src/shared/config/constants";

/** The two faces every screen draws with: Anybody (display) and Onest (UI), Latin subsets. */
const PRELOADED_FONTS = /(anybody-latin-standard-normal|onest-latin-wght-normal)-[\w-]+\.woff2$/;

/**
 * `<head>` hints that need hashed build file names (spec §11):
 * - preload the display and UI faces, so text doesn't wait for the CSS to discover them;
 * - for visitors without a session, start the lazy landing chunk alongside the
 *   entry instead of after it — the landing is their first screen.
 */
function headHints(): Plugin {
  return {
    name: "aura-head-hints",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(_html, context) {
        const files = Object.values(context.bundle ?? {});
        const tags: HtmlTagDescriptor[] = files
          .filter((file) => file.type === "asset" && PRELOADED_FONTS.test(file.fileName))
          .map((file) => ({
            tag: "link",
            attrs: { rel: "preload", as: "font", type: "font/woff2", href: `/${file.fileName}`, crossorigin: "" },
            injectTo: "head",
          }));

        const landing = files.find((file) => file.type === "chunk" && file.name === "LandingPage");
        if (landing) {
          tags.push({
            tag: "script",
            children: `try{if(!localStorage.getItem(${JSON.stringify(AUTH_TOKEN_STORAGE_KEY)})){var l=document.createElement("link");l.rel="modulepreload";l.href="/${landing.fileName}";document.head.appendChild(l)}}catch(e){}`,
            injectTo: "head",
          });
        }

        return tags;
      },
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), headHints()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Vendors that every route needs are split so they cache independently
        // of app code and download in parallel. Route chunks come from the
        // React.lazy calls in the router. `react-dom/client` is its own entry
        // module (it is what main.tsx imports), so it is listed by name.
        manualChunks: {
          react: ["react", "react-dom", "react-dom/client", "react-router", "react-router/dom"],
          query: ["@tanstack/react-query"],
          forms: ["react-hook-form", "@hookform/resolvers", "zod"],
          motion: ["framer-motion"],
          http: ["axios"],
        },
      },
    },
  },
});
