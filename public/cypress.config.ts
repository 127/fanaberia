import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "ogfbqo",
  e2e: {
    baseUrl: "http://localhost:5173",
    // setupNodeEvents(on, config) {
    //   // implement node event listeners here
    // },
  },
});

// component: {
//   devServer: {
//     framework: "react",
//     bundler: "vite",
//   },
// },
