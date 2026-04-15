import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// add ip base path for gh pages deployment
export default defineConfig({
  base: "/ICU-Clinical-Trials-Statistics/",
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
});

// For Godaddy Production
// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react-swc";

// // Use relative asset paths so the production build can be hosted from
// // a domain root or subfolder on static hosting providers like GoDaddy.
// export default defineConfig({
//   base: "./",
//   plugins: [react()],
//   server: {
//     host: "0.0.0.0",
//     port: 3000,
//   },
// });
