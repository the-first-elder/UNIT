import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import type { OpenNextConfig } from "@opennextjs/aws/types/open-next.js";

const base = defineCloudflareConfig({});

const config: OpenNextConfig = {
  ...base,
  functions: {
    "api-circle": {
      runtime: "edge",
      routes: ["app/api/circle/social/route"],
      patterns: ["/api/circle/*"],
    },
    "api-erc8004": {
      runtime: "edge",
      routes: ["app/api/erc8004/route"],
      patterns: ["/api/erc8004"],
    },
  },
};

export default config;
