import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { version } from "./package.json";
import * as child from "child_process";

declare const process: { env: Record<string, string> };

const commitHash = child.execSync("git rev-parse --short HEAD").toString();

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        // target: "http://eed-fpga/api/elogs",
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  base: "/elog/",
  define: {
    "import.meta.env.API_ENDPOINT": JSON.stringify(process.env.API_ENDPOINT),
    "import.meta.env.APP_VERSION": JSON.stringify(`${version}-${commitHash}`),
  },
  plugins: [react()],
});
