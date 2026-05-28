import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.js",
    datatable: "src/datatable.js",
    form: "src/form.js",
    kanban: "src/kanban.js",
    feed: "src/feed.js",
    "common-components": "src/common-components/index.js",
    utils: "src/utils/index.js",
  },
  format: ["esm", "cjs"],
  external: ["react", "@hubspot/ui-extensions", "@hubspot/ui-extensions/crm"],
  jsx: "transform",
  splitting: false,
  clean: true,
  outDir: "dist",
});
