import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
      proxy: {
        "/api": {
          target: "http://localhost:3001",
          changeOrigin: true,
        },
      },
    },
    plugins: [react()],
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    build: {
      chunkSizeWarningLimit: 1000, // Increase warning limit to 1MB
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks untuk optimasi
            "vendor-react": ["react", "react-dom"],
            "vendor-gemini": ["@google/genai"],
            // Components chunk
            components: [
              "./components/ExpenseDashboard.tsx",
              "./components/ExpenseList.tsx",
              "./components/BudgetAllocationModal.tsx",
              "./components/ConfirmModal.tsx",
            ],
          },
        },
      },
    },
  };
});
