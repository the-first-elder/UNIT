import * as process from "node:process";
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// .open-next/server-functions/api-erc8004/open-next.config.mjs
var open_next_config_exports = {};
__export(open_next_config_exports, {
  default: () => open_next_config_default
});
function getCloudflareContext(options = { async: false }) {
  return options.async ? getCloudflareContextAsync() : getCloudflareContextSync();
}
function getCloudflareContextFromGlobalScope() {
  const global = globalThis;
  return global[cloudflareContextSymbol];
}
function inSSG() {
  const global = globalThis;
  return global.__NEXT_DATA__?.nextExport === true;
}
function getCloudflareContextSync() {
  const cloudflareContext = getCloudflareContextFromGlobalScope();
  if (cloudflareContext) {
    return cloudflareContext;
  }
  if (inSSG()) {
    throw new Error(`

ERROR: \`getCloudflareContext\` has been called in sync mode in either a static route or at the top level of a non-static one, both cases are not allowed but can be solved by either:
  - make sure that the call is not at the top level and that the route is not static
  - call \`getCloudflareContext({async: true})\` to use the \`async\` mode
  - avoid calling \`getCloudflareContext\` in the route
`);
  }
  throw new Error(initOpenNextCloudflareForDevErrorMsg);
}
async function getCloudflareContextAsync() {
  const cloudflareContext = getCloudflareContextFromGlobalScope();
  if (cloudflareContext) {
    return cloudflareContext;
  }
  const inNodejsRuntime = process.env.NEXT_RUNTIME === "nodejs";
  if (inNodejsRuntime || inSSG()) {
    const cloudflareContext2 = await getCloudflareContextFromWrangler();
    addCloudflareContextToNodejsGlobal(cloudflareContext2);
    return cloudflareContext2;
  }
  throw new Error(initOpenNextCloudflareForDevErrorMsg);
}
function addCloudflareContextToNodejsGlobal(cloudflareContext) {
  const global = globalThis;
  global[cloudflareContextSymbol] = cloudflareContext;
}
async function getCloudflareContextFromWrangler(options) {
  const { getPlatformProxy } = await import(
    /* webpackIgnore: true */
    `${"__wrangler".replaceAll("_", "")}`
  );
  const environment = options?.environment ?? process.env.NEXT_DEV_WRANGLER_ENV;
  const { env, cf, ctx } = await getPlatformProxy({
    ...options,
    // The `env` passed to the fetch handler does not contain variables from `.env*` files.
    // because we invoke wrangler with `CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV`=`"false"`.
    // Initializing `envFiles` with an empty list is the equivalent for this API call.
    envFiles: [],
    environment
  });
  return {
    env,
    cf,
    ctx
  };
}
function getResponseBody(method, response) {
  if (method === "HEAD") {
    return null;
  }
  return response.body || new ReadableStream();
}
function isUserWorkerFirst(runWorkerFirst, pathname) {
  if (!Array.isArray(runWorkerFirst)) {
    return runWorkerFirst ?? false;
  }
  let hasPositiveMatch = false;
  for (let rule of runWorkerFirst) {
    let isPositiveRule = true;
    if (rule.startsWith("!")) {
      rule = rule.slice(1);
      isPositiveRule = false;
    } else if (hasPositiveMatch) {
      continue;
    }
    const match = new RegExp(`^${rule.replace(/([[\]().*+?^$|{}\\])/g, "\\$1").replace("\\*", ".*")}$`).test(pathname);
    if (match) {
      if (isPositiveRule) {
        hasPositiveMatch = true;
      } else {
        return false;
      }
    }
  }
  return hasPositiveMatch;
}
function defineCloudflareConfig(config2 = {}) {
  const { incrementalCache, tagCache, queue, cachePurge, enableCacheInterception = false, routePreloadingBehavior = "none" } = config2;
  return {
    default: {
      override: {
        wrapper: "cloudflare-node",
        converter: "edge",
        proxyExternalRequest: "fetch",
        incrementalCache: resolveIncrementalCache(incrementalCache),
        tagCache: resolveTagCache(tagCache),
        queue: resolveQueue(queue),
        cdnInvalidation: resolveCdnInvalidation(cachePurge)
      },
      routePreloadingBehavior
    },
    // node:crypto is used to compute cache keys
    edgeExternals: ["node:crypto"],
    cloudflare: {
      useWorkerdCondition: true
    },
    dangerous: {
      enableCacheInterception
    },
    middleware: {
      external: true,
      override: {
        wrapper: "cloudflare-edge",
        converter: "edge",
        proxyExternalRequest: "fetch",
        incrementalCache: resolveIncrementalCache(incrementalCache),
        tagCache: resolveTagCache(tagCache),
        queue: resolveQueue(queue)
      },
      assetResolver: () => asset_resolver_default
    }
  };
}
function resolveIncrementalCache(value = "dummy") {
  if (typeof value === "string") {
    return value;
  }
  return typeof value === "function" ? value : () => value;
}
function resolveTagCache(value = "dummy") {
  if (typeof value === "string") {
    return value;
  }
  return typeof value === "function" ? value : () => value;
}
function resolveQueue(value = "dummy") {
  if (typeof value === "string") {
    return value;
  }
  return typeof value === "function" ? value : () => value;
}
function resolveCdnInvalidation(value = "dummy") {
  if (typeof value === "string") {
    return value;
  }
  return typeof value === "function" ? value : () => value;
}
var cloudflareContextSymbol, initOpenNextCloudflareForDevErrorMsg, resolver, asset_resolver_default, base, config, open_next_config_default;
var init_open_next_config = __esm({
  ".open-next/server-functions/api-erc8004/open-next.config.mjs"() {
    "use strict";
    cloudflareContextSymbol = Symbol.for("__cloudflare-context__");
    initOpenNextCloudflareForDevErrorMsg = `

ERROR: \`getCloudflareContext\` has been called without having called \`initOpenNextCloudflareForDev\` from the Next.js config file.
You should update your Next.js config file as shown below:

   \`\`\`
   // next.config.mjs

   import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

   initOpenNextCloudflareForDev();

   const nextConfig = { ... };
   export default nextConfig;
   \`\`\`

`;
    resolver = {
      name: "cloudflare-asset-resolver",
      async maybeGetAssetResult(event) {
        const { ASSETS } = getCloudflareContext().env;
        if (!ASSETS || !isUserWorkerFirst(globalThis.__ASSETS_RUN_WORKER_FIRST__, event.rawPath)) {
          return void 0;
        }
        const { method, headers } = event;
        if (method !== "GET" && method != "HEAD") {
          return void 0;
        }
        const url = new URL(event.rawPath, "https://assets.local");
        const response = await ASSETS.fetch(url, {
          headers,
          method
        });
        if (response.status === 404) {
          await response.body?.cancel();
          return void 0;
        }
        return {
          type: "core",
          statusCode: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          body: getResponseBody(method, response),
          isBase64Encoded: false
        };
      }
    };
    asset_resolver_default = resolver;
    base = defineCloudflareConfig({});
    config = {
      ...base,
      functions: {
        "api-circle": {
          runtime: "edge",
          routes: ["app/api/circle/social/route"],
          patterns: ["/api/circle/*"]
        },
        "api-erc8004": {
          runtime: "edge",
          routes: ["app/api/erc8004/route"],
          patterns: ["/api/erc8004"]
        }
      }
    };
    open_next_config_default = config;
  }
});

// .open-next/server-functions/api-erc8004/index.mjs
import { Buffer as Buffer2 } from "node:buffer";
import { AsyncLocalStorage } from "node:async_hooks";
import { ReadableStream as ReadableStream2 } from "node:stream/web";
import path from "node:path";
import { Transform } from "node:stream";
import crypto2 from "node:crypto";
import { parse as parseQs, stringify as stringifyQs } from "node:querystring";
import { ReadableStream as ReadableStream3 } from "node:stream/web";
import { Writable } from "node:stream";
import * as node_buffer_star from "node:buffer";
import * as node_async_hooks_star from "node:async_hooks";
import { readFileSync } from "node:fs";
import path3 from "node:path";
import { webcrypto } from "node:crypto";
import { createHash } from "node:crypto";
import path2 from "node:path";
globalThis.Buffer = Buffer2;
globalThis.AsyncLocalStorage = AsyncLocalStorage;
var defaultDefineProperty = Object.defineProperty;
Object.defineProperty = function(o, p, a2) {
  if (p === "__import_unsupported" && Boolean(globalThis.__import_unsupported)) {
    return;
  }
  return defaultDefineProperty(o, p, a2);
};
var require2 = (await import("node:module")).createRequire(import.meta.url);
var __filename = (await import("node:url")).fileURLToPath(import.meta.url);
var __dirname = (await import("node:path")).dirname(__filename);
globalThis.openNextDebug = false;
globalThis.openNextVersion = "4.0.2";
globalThis.nextVersion = "15.5.18";
var __defProp2 = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames2 = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm2 = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames2(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames2(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export2 = (target, all) => {
  for (var name in all)
    __defProp2(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames2(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toCommonJS = (mod) => __copyProps(__defProp2({}, "__esModule", { value: true }), mod);
function isOpenNextError(e) {
  try {
    return "__openNextInternal" in e;
  } catch {
    return false;
  }
}
var init_error = __esm2({
  "node_modules/@opennextjs/aws/dist/utils/error.js"() {
  }
});
function debug(...args) {
  if (globalThis.openNextDebug) {
    console.log(...args);
  }
}
function warn(...args) {
  console.warn(...args);
}
function error(...args) {
  if (args.some((arg) => isDownplayedErrorLog(arg))) {
    return debug(...args);
  }
  if (args.some((arg) => isOpenNextError(arg))) {
    const error2 = args.find((arg) => isOpenNextError(arg));
    if (error2.logLevel < getOpenNextErrorLogLevel()) {
      return;
    }
    if (error2.logLevel === 0) {
      return console.log(...args.map((arg) => isOpenNextError(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    if (error2.logLevel === 1) {
      return warn(...args.map((arg) => isOpenNextError(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    return console.error(...args);
  }
  console.error(...args);
}
function getOpenNextErrorLogLevel() {
  const strLevel = process.env.OPEN_NEXT_ERROR_LOG_LEVEL ?? "1";
  switch (strLevel.toLowerCase()) {
    case "debug":
    case "0":
      return 0;
    case "error":
    case "2":
      return 2;
    default:
      return 1;
  }
}
var DOWNPLAYED_ERROR_LOGS;
var isDownplayedErrorLog;
var init_logger = __esm2({
  "node_modules/@opennextjs/aws/dist/adapters/logger.js"() {
    init_error();
    DOWNPLAYED_ERROR_LOGS = [
      {
        clientName: "S3Client",
        commandName: "GetObjectCommand",
        errorName: "NoSuchKey"
      }
    ];
    isDownplayedErrorLog = (errorLog) => DOWNPLAYED_ERROR_LOGS.some((downplayedInput) => downplayedInput.clientName === errorLog?.clientName && downplayedInput.commandName === errorLog?.commandName && (downplayedInput.errorName === errorLog?.error?.name || downplayedInput.errorName === errorLog?.error?.Code));
  }
});
async function fromReadableStream(stream, base64) {
  const chunks = [];
  let totalLength = 0;
  for await (const chunk of stream) {
    chunks.push(chunk);
    totalLength += chunk.length;
  }
  if (chunks.length === 0) {
    return "";
  }
  if (chunks.length === 1) {
    return Buffer2.from(chunks[0]).toString(base64 ? "base64" : "utf8");
  }
  const buffer = Buffer2.alloc(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.length;
  }
  return buffer.toString(base64 ? "base64" : "utf8");
}
function emptyReadableStream() {
  if (process.env.OPEN_NEXT_FORCE_NON_EMPTY_RESPONSE === "true") {
    return new ReadableStream2({
      pull(controller) {
        maybeSomethingBuffer ??= Buffer2.from("SOMETHING");
        controller.enqueue(maybeSomethingBuffer);
        controller.close();
      }
    }, { highWaterMark: 0 });
  }
  return new ReadableStream2({
    start(controller) {
      controller.close();
    }
  });
}
var maybeSomethingBuffer;
var init_stream = __esm2({
  "node_modules/@opennextjs/aws/dist/utils/stream.js"() {
  }
});
var NEXT_DIR;
var OPEN_NEXT_DIR;
var NextConfig;
var BuildId;
var RoutesManifest;
var PrerenderManifest;
var MiddlewareManifest;
var AppPathRoutesManifest;
var FunctionsConfigManifest;
var PagesManifest;
var init_config = __esm2({
  "node_modules/@opennextjs/aws/dist/adapters/config/index.js"() {
    init_logger();
    globalThis.__dirname ??= "";
    NEXT_DIR = path.join(__dirname, ".next");
    OPEN_NEXT_DIR = path.join(__dirname, ".open-next");
    debug({ NEXT_DIR, OPEN_NEXT_DIR });
    NextConfig = { "env": {}, "eslint": { "ignoreDuringBuilds": false }, "typescript": { "ignoreBuildErrors": false, "tsconfigPath": "tsconfig.json" }, "typedRoutes": false, "distDir": ".next", "cleanDistDir": true, "assetPrefix": "", "cacheMaxMemorySize": 52428800, "configOrigin": "next.config.ts", "useFileSystemPublicRoutes": true, "generateEtags": true, "pageExtensions": ["tsx", "ts", "jsx", "js"], "poweredByHeader": true, "compress": true, "images": { "deviceSizes": [640, 750, 828, 1080, 1200, 1920, 2048, 3840], "imageSizes": [16, 32, 48, 64, 96, 128, 256, 384], "path": "/_next/image", "loader": "default", "loaderFile": "", "domains": [], "disableStaticImages": false, "minimumCacheTTL": 60, "formats": ["image/avif", "image/webp"], "maximumResponseBody": 5e7, "dangerouslyAllowSVG": false, "contentSecurityPolicy": "script-src 'none'; frame-src 'none'; sandbox;", "contentDispositionType": "attachment", "remotePatterns": [], "unoptimized": false }, "devIndicators": { "position": "bottom-left" }, "onDemandEntries": { "maxInactiveAge": 6e4, "pagesBufferLength": 5 }, "amp": { "canonicalBase": "" }, "basePath": "", "sassOptions": {}, "trailingSlash": false, "i18n": null, "productionBrowserSourceMaps": false, "excludeDefaultMomentLocales": true, "serverRuntimeConfig": {}, "publicRuntimeConfig": {}, "reactProductionProfiling": false, "reactStrictMode": true, "reactMaxHeadersLength": 6e3, "httpAgentOptions": { "keepAlive": true }, "logging": {}, "compiler": {}, "expireTime": 31536e3, "staticPageGenerationTimeout": 60, "output": "standalone", "modularizeImports": { "@mui/icons-material": { "transform": "@mui/icons-material/{{member}}" }, "lodash": { "transform": "lodash/{{member}}" } }, "outputFileTracingRoot": "/Users/thefirstelder/Documents/aurum_unit/frontend", "experimental": { "useSkewCookie": false, "cacheLife": { "default": { "stale": 300, "revalidate": 900, "expire": 4294967294 }, "seconds": { "stale": 30, "revalidate": 1, "expire": 60 }, "minutes": { "stale": 300, "revalidate": 60, "expire": 3600 }, "hours": { "stale": 300, "revalidate": 3600, "expire": 86400 }, "days": { "stale": 300, "revalidate": 86400, "expire": 604800 }, "weeks": { "stale": 300, "revalidate": 604800, "expire": 2592e3 }, "max": { "stale": 300, "revalidate": 2592e3, "expire": 4294967294 } }, "cacheHandlers": {}, "cssChunking": true, "multiZoneDraftMode": false, "appNavFailHandling": false, "prerenderEarlyExit": true, "serverMinification": true, "serverSourceMaps": false, "linkNoTouchStart": false, "caseSensitiveRoutes": false, "clientSegmentCache": false, "clientParamParsing": false, "dynamicOnHover": false, "preloadEntriesOnStart": true, "clientRouterFilter": true, "clientRouterFilterRedirects": false, "fetchCacheKeyPrefix": "", "middlewarePrefetch": "flexible", "optimisticClientCache": true, "manualClientBasePath": false, "cpus": 11, "memoryBasedWorkersCount": false, "imgOptConcurrency": null, "imgOptTimeoutInSeconds": 7, "imgOptMaxInputPixels": 268402689, "imgOptSequentialRead": null, "imgOptSkipMetadata": null, "isrFlushToDisk": true, "workerThreads": false, "optimizeCss": false, "nextScriptWorkers": false, "scrollRestoration": false, "externalDir": false, "disableOptimizedLoading": false, "gzipSize": true, "craCompat": false, "esmExternals": true, "fullySpecified": false, "swcTraceProfiling": false, "forceSwcTransforms": false, "largePageDataBytes": 128e3, "typedEnv": false, "parallelServerCompiles": false, "parallelServerBuildTraces": false, "ppr": false, "authInterrupts": false, "webpackMemoryOptimizations": false, "optimizeServerReact": true, "viewTransition": false, "routerBFCache": false, "removeUncaughtErrorAndRejectionListeners": false, "validateRSCRequestHeaders": false, "staleTimes": { "dynamic": 0, "static": 300 }, "serverComponentsHmrCache": true, "staticGenerationMaxConcurrency": 8, "staticGenerationMinPagesPerWorker": 25, "cacheComponents": false, "inlineCss": false, "useCache": false, "globalNotFound": false, "devtoolSegmentExplorer": true, "browserDebugInfoInTerminal": false, "optimizeRouterScrolling": false, "middlewareClientMaxBodySize": 10485760, "optimizePackageImports": ["lucide-react", "recharts", "framer-motion", "@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-popover", "@radix-ui/react-tabs", "@radix-ui/react-tooltip", "date-fns", "lodash-es", "ramda", "antd", "react-bootstrap", "ahooks", "@ant-design/icons", "@headlessui/react", "@headlessui-float/react", "@heroicons/react/20/solid", "@heroicons/react/24/solid", "@heroicons/react/24/outline", "@visx/visx", "@tremor/react", "rxjs", "@mui/material", "@mui/icons-material", "react-use", "effect", "@effect/schema", "@effect/platform", "@effect/platform-node", "@effect/platform-browser", "@effect/platform-bun", "@effect/sql", "@effect/sql-mssql", "@effect/sql-mysql2", "@effect/sql-pg", "@effect/sql-sqlite-node", "@effect/sql-sqlite-bun", "@effect/sql-sqlite-wasm", "@effect/sql-sqlite-react-native", "@effect/rpc", "@effect/rpc-http", "@effect/typeclass", "@effect/experimental", "@effect/opentelemetry", "@material-ui/core", "@material-ui/icons", "@tabler/icons-react", "mui-core", "react-icons/ai", "react-icons/bi", "react-icons/bs", "react-icons/cg", "react-icons/ci", "react-icons/di", "react-icons/fa", "react-icons/fa6", "react-icons/fc", "react-icons/fi", "react-icons/gi", "react-icons/go", "react-icons/gr", "react-icons/hi", "react-icons/hi2", "react-icons/im", "react-icons/io", "react-icons/io5", "react-icons/lia", "react-icons/lib", "react-icons/lu", "react-icons/md", "react-icons/pi", "react-icons/ri", "react-icons/rx", "react-icons/si", "react-icons/sl", "react-icons/tb", "react-icons/tfi", "react-icons/ti", "react-icons/vsc", "react-icons/wi"], "trustHostHeader": false, "isExperimentalCompile": false }, "htmlLimitedBots": "[\\w-]+-Google|Google-[\\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight", "bundlePagesRouterDependencies": false, "configFileName": "next.config.ts", "turbopack": { "root": "/Users/thefirstelder/Documents/aurum_unit/frontend" } };
    BuildId = "1r7FgcuKzlXWJrIBGDmQN";
    RoutesManifest = { "basePath": "", "rewrites": { "beforeFiles": [], "afterFiles": [], "fallback": [] }, "redirects": [{ "source": "/:path+/", "destination": "/:path+", "internal": true, "statusCode": 308, "regex": "^(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))/$" }], "routes": { "static": [{ "page": "/", "regex": "^/(?:/)?$", "routeKeys": {}, "namedRegex": "^/(?:/)?$" }, { "page": "/_not-found", "regex": "^/_not\\-found(?:/)?$", "routeKeys": {}, "namedRegex": "^/_not\\-found(?:/)?$" }, { "page": "/app", "regex": "^/app(?:/)?$", "routeKeys": {}, "namedRegex": "^/app(?:/)?$" }], "dynamic": [], "data": { "static": [], "dynamic": [] } }, "locales": [] };
    PrerenderManifest = { "version": 4, "routes": { "/_not-found": { "initialStatus": 404, "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/_not-found", "dataRoute": "/_not-found.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/", "dataRoute": "/index.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/app": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/app", "dataRoute": "/app.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] } }, "dynamicRoutes": {}, "notFoundRoutes": [], "preview": { "previewModeId": "5132ca32ec780fc4257f0085d7be70bc", "previewModeSigningKey": "6fe34ef672b1d21202a158e2c2101725a87c5c1f46bdf474c3d59e2ba9ee1658", "previewModeEncryptionKey": "cc3f4cf64cefb3b1bd9a69b08ca562665161428fc4161f84f143c778514e4c12" } };
    MiddlewareManifest = { "version": 3, "middleware": {}, "functions": { "/api/circle/social/route": { "files": ["server/server-reference-manifest.js", "server/app/api/circle/social/route_client-reference-manifest.js", "server/middleware-build-manifest.js", "server/middleware-react-loadable-manifest.js", "server/next-font-manifest.js", "server/interception-route-rewrite-manifest.js", "server/edge-runtime-webpack.js", "server/edge-chunks/237.js", "server/app/api/circle/social/route.js"], "name": "app/api/circle/social/route", "page": "/api/circle/social/route", "matchers": [{ "regexp": "^/api/circle/social$", "originalSource": "/api/circle/social" }], "wasm": [], "assets": [], "env": { "__NEXT_BUILD_ID": "1r7FgcuKzlXWJrIBGDmQN", "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY": "xiHYU080iKcnUIR9C9d31vN0goG4fVCKmO/f5bdfNSA=", "__NEXT_PREVIEW_MODE_ID": "5132ca32ec780fc4257f0085d7be70bc", "__NEXT_PREVIEW_MODE_SIGNING_KEY": "6fe34ef672b1d21202a158e2c2101725a87c5c1f46bdf474c3d59e2ba9ee1658", "__NEXT_PREVIEW_MODE_ENCRYPTION_KEY": "cc3f4cf64cefb3b1bd9a69b08ca562665161428fc4161f84f143c778514e4c12" } }, "/api/erc8004/route": { "files": ["server/server-reference-manifest.js", "server/app/api/erc8004/route_client-reference-manifest.js", "server/middleware-build-manifest.js", "server/middleware-react-loadable-manifest.js", "server/next-font-manifest.js", "server/interception-route-rewrite-manifest.js", "server/edge-runtime-webpack.js", "server/edge-chunks/237.js", "server/app/api/erc8004/route.js"], "name": "app/api/erc8004/route", "page": "/api/erc8004/route", "matchers": [{ "regexp": "^/api/erc8004$", "originalSource": "/api/erc8004" }], "wasm": [], "assets": [], "env": { "__NEXT_BUILD_ID": "1r7FgcuKzlXWJrIBGDmQN", "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY": "xiHYU080iKcnUIR9C9d31vN0goG4fVCKmO/f5bdfNSA=", "__NEXT_PREVIEW_MODE_ID": "5132ca32ec780fc4257f0085d7be70bc", "__NEXT_PREVIEW_MODE_SIGNING_KEY": "6fe34ef672b1d21202a158e2c2101725a87c5c1f46bdf474c3d59e2ba9ee1658", "__NEXT_PREVIEW_MODE_ENCRYPTION_KEY": "cc3f4cf64cefb3b1bd9a69b08ca562665161428fc4161f84f143c778514e4c12" } } }, "sortedMiddleware": [] };
    AppPathRoutesManifest = { "/_not-found/page": "/_not-found", "/page": "/", "/app/page": "/app", "/api/circle/social/route": "/api/circle/social", "/api/erc8004/route": "/api/erc8004" };
    FunctionsConfigManifest = { "version": 1, "functions": { "/api/erc8004": {}, "/api/circle/social": {} } };
    PagesManifest = { "/_app": "pages/_app.js", "/_error": "pages/_error.js", "/_document": "pages/_document.js", "/404": "pages/404.html" };
    process.env.NEXT_BUILD_ID = BuildId;
    process.env.OPEN_NEXT_BUILD_ID = NextConfig.deploymentId ?? BuildId;
    process.env.NEXT_PREVIEW_MODE_ID = PrerenderManifest?.preview?.previewModeId;
  }
});
function parseSetCookieHeader(cookies) {
  if (!cookies) {
    return [];
  }
  if (typeof cookies === "string") {
    return cookies.split(/(?<!Expires=\w+),/i).map((c) => c.trim());
  }
  return cookies;
}
var init_util = __esm2({
  "node_modules/@opennextjs/aws/dist/http/util.js"() {
    init_logger();
  }
});
var init_openNextResponse = __esm2({
  "node_modules/@opennextjs/aws/dist/http/openNextResponse.js"() {
    init_logger();
    init_util();
  }
});
var init_binary = __esm2({
  "node_modules/@opennextjs/aws/dist/utils/binary.js"() {
  }
});
var init_accept_header = __esm2({
  "node_modules/@opennextjs/aws/dist/core/routing/i18n/accept-header.js"() {
  }
});
var init_i18n = __esm2({
  "node_modules/@opennextjs/aws/dist/core/routing/i18n/index.js"() {
    init_config();
    init_stream();
    init_logger();
    init_util2();
    init_accept_header();
  }
});
var init_queue = __esm2({
  "node_modules/@opennextjs/aws/dist/core/routing/queue.js"() {
  }
});
function convertToQuery(querystring) {
  if (!querystring)
    return {};
  const query = new URLSearchParams(querystring);
  const queryObject = {};
  for (const key of query.keys()) {
    const queries = query.getAll(key);
    queryObject[key] = queries.length > 1 ? queries : queries[0];
  }
  return queryObject;
}
function getMiddlewareMatch(middlewareManifest2, functionsManifest) {
  if (functionsManifest?.functions?.["/_middleware"]) {
    return functionsManifest.functions["/_middleware"].matchers?.map(({ regexp }) => new RegExp(regexp)) ?? [/.*/];
  }
  const rootMiddleware = middlewareManifest2.middleware["/"];
  if (!rootMiddleware?.matchers)
    return [];
  return rootMiddleware.matchers.map(({ regexp }) => new RegExp(regexp));
}
function convertBodyToReadableStream(method, body) {
  if (method === "GET" || method === "HEAD")
    return void 0;
  if (!body)
    return void 0;
  return new ReadableStream3({
    start(controller) {
      controller.enqueue(body);
      controller.close();
    }
  });
}
var CommonHeaders;
var init_util2 = __esm2({
  "node_modules/@opennextjs/aws/dist/core/routing/util.js"() {
    init_config();
    init_openNextResponse();
    init_util();
    init_logger();
    init_binary();
    init_i18n();
    init_queue();
    (function(CommonHeaders2) {
      CommonHeaders2["CACHE_CONTROL"] = "cache-control";
      CommonHeaders2["NEXT_CACHE"] = "x-nextjs-cache";
    })(CommonHeaders || (CommonHeaders = {}));
  }
});
function removeUndefinedFromQuery(query) {
  const newQuery = {};
  for (const [key, value] of Object.entries(query)) {
    if (value !== void 0) {
      newQuery[key] = value;
    }
  }
  return newQuery;
}
function extractHostFromHeaders(headers) {
  return headers["x-forwarded-host"] ?? headers.host ?? "on";
}
var init_utils = __esm2({
  "node_modules/@opennextjs/aws/dist/overrides/converters/utils.js"() {
    init_util();
  }
});
var aws_apigw_v2_exports = {};
__export2(aws_apigw_v2_exports, {
  default: () => aws_apigw_v2_default
});
function normalizeAPIGatewayProxyEventV2Body(event) {
  const { body, isBase64Encoded } = event;
  if (Buffer2.isBuffer(body)) {
    return body;
  }
  if (typeof body === "string") {
    return Buffer2.from(body, isBase64Encoded ? "base64" : "utf8");
  }
  if (typeof body === "object") {
    return Buffer2.from(JSON.stringify(body));
  }
  return Buffer2.from("", "utf8");
}
function normalizeAPIGatewayProxyEventV2Headers(event) {
  const { headers: rawHeaders, cookies } = event;
  const headers = {};
  if (Array.isArray(cookies)) {
    headers.cookie = cookies.join("; ");
  }
  if (rawHeaders) {
    for (const [key, value] of Object.entries(rawHeaders)) {
      headers[key.toLowerCase()] = value;
    }
  }
  return headers;
}
async function convertFromAPIGatewayProxyEventV2(event) {
  const { rawPath, rawQueryString, requestContext } = event;
  const headers = normalizeAPIGatewayProxyEventV2Headers(event);
  return {
    type: "core",
    method: requestContext.http.method,
    rawPath,
    url: `https://${extractHostFromHeaders(headers)}${rawPath}${rawQueryString ? `?${rawQueryString}` : ""}`,
    body: normalizeAPIGatewayProxyEventV2Body(event),
    headers,
    remoteAddress: requestContext.http.sourceIp,
    query: removeUndefinedFromQuery(convertToQuery(rawQueryString)),
    cookies: event.cookies?.reduce((acc, cur) => {
      const [key, value] = cur.split("=");
      acc[key] = value;
      return acc;
    }, {}) ?? {}
  };
}
async function convertToApiGatewayProxyResultV2(result) {
  const headers = {};
  Object.entries(result.headers).map(([key, value]) => [key.toLowerCase(), value]).filter(([key]) => !CloudFrontBlacklistedHeaders.some((header) => typeof header === "string" ? header === key : header.test(key))).forEach(([key, value]) => {
    if (value === null || value === void 0) {
      headers[key] = "";
      return;
    }
    headers[key] = Array.isArray(value) ? value.join(", ") : `${value}`;
  });
  const body = await fromReadableStream(result.body, result.isBase64Encoded);
  const response = {
    statusCode: result.statusCode,
    headers,
    cookies: parseSetCookieHeader(result.headers["set-cookie"]),
    body,
    isBase64Encoded: result.isBase64Encoded
  };
  debug(response);
  return response;
}
var CloudFrontBlacklistedHeaders;
var aws_apigw_v2_default;
var init_aws_apigw_v2 = __esm2({
  "node_modules/@opennextjs/aws/dist/overrides/converters/aws-apigw-v2.js"() {
    init_util();
    init_stream();
    init_logger();
    init_util2();
    init_utils();
    CloudFrontBlacklistedHeaders = [
      "connection",
      "expect",
      "keep-alive",
      "proxy-authenticate",
      "proxy-authorization",
      "proxy-connection",
      "trailer",
      "upgrade",
      "x-accel-buffering",
      "x-accel-charset",
      "x-accel-limit-rate",
      "x-accel-redirect",
      /x-amz-cf-(.*)/,
      /x-amzn-(.*)/,
      /x-edge-(.*)/,
      "x-cache",
      "x-forwarded-proto",
      "x-real-ip",
      "set-cookie",
      "age",
      "via"
    ];
    aws_apigw_v2_default = {
      convertFrom: convertFromAPIGatewayProxyEventV2,
      convertTo: convertToApiGatewayProxyResultV2,
      name: "aws-apigw-v2"
    };
  }
});
var aws_lambda_exports = {};
__export2(aws_lambda_exports, {
  default: () => aws_lambda_default,
  formatWarmerResponse: () => formatWarmerResponse
});
function formatWarmerResponse(event) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ serverId, type: "warmer" });
    }, event.delay);
  });
}
var handler;
var aws_lambda_default;
var init_aws_lambda = __esm2({
  "node_modules/@opennextjs/aws/dist/overrides/wrappers/aws-lambda.js"() {
    handler = async (handler3, converter) => async (event) => {
      if ("type" in event) {
        return formatWarmerResponse(event);
      }
      const internalEvent = await converter.convertFrom(event);
      const fakeStream = {
        writeHeaders: () => {
          return new Writable({
            write: (_chunk, _encoding, callback) => {
              callback();
            }
          });
        }
      };
      const response = await handler3(internalEvent, {
        streamCreator: fakeStream
      });
      return converter.convertTo(response, event);
    };
    aws_lambda_default = {
      wrapper: handler,
      name: "aws-lambda",
      supportStreaming: false
    };
  }
});
function Oe(e, t) {
  return (t ? /^[\x00-\xFF]*$/ : /^[\x00-\x7F]*$/).test(e);
}
function D(e, t = false) {
  let r = [], n = 0;
  for (; n < e.length; ) {
    let c = e[n], l = a(function(f) {
      if (!t) throw new TypeError(f);
      r.push({ type: "INVALID_CHAR", index: n, value: e[n++] });
    }, "ErrorOrInvalid");
    if (c === "*") {
      r.push({ type: "ASTERISK", index: n, value: e[n++] });
      continue;
    }
    if (c === "+" || c === "?") {
      r.push({ type: "OTHER_MODIFIER", index: n, value: e[n++] });
      continue;
    }
    if (c === "\\") {
      r.push({ type: "ESCAPED_CHAR", index: n++, value: e[n++] });
      continue;
    }
    if (c === "{") {
      r.push({ type: "OPEN", index: n, value: e[n++] });
      continue;
    }
    if (c === "}") {
      r.push({ type: "CLOSE", index: n, value: e[n++] });
      continue;
    }
    if (c === ":") {
      let f = "", s = n + 1;
      for (; s < e.length; ) {
        let i = e.substr(s, 1);
        if (s === n + 1 && Re.test(i) || s !== n + 1 && Ee.test(i)) {
          f += e[s++];
          continue;
        }
        break;
      }
      if (!f) {
        l(`Missing parameter name at ${n}`);
        continue;
      }
      r.push({ type: "NAME", index: n, value: f }), n = s;
      continue;
    }
    if (c === "(") {
      let f = 1, s = "", i = n + 1, o = false;
      if (e[i] === "?") {
        l(`Pattern cannot start with "?" at ${i}`);
        continue;
      }
      for (; i < e.length; ) {
        if (!Oe(e[i], false)) {
          l(`Invalid character '${e[i]}' at ${i}.`), o = true;
          break;
        }
        if (e[i] === "\\") {
          s += e[i++] + e[i++];
          continue;
        }
        if (e[i] === ")") {
          if (f--, f === 0) {
            i++;
            break;
          }
        } else if (e[i] === "(" && (f++, e[i + 1] !== "?")) {
          l(`Capturing groups are not allowed at ${i}`), o = true;
          break;
        }
        s += e[i++];
      }
      if (o) continue;
      if (f) {
        l(`Unbalanced pattern at ${n}`);
        continue;
      }
      if (!s) {
        l(`Missing pattern at ${n}`);
        continue;
      }
      r.push({ type: "REGEX", index: n, value: s }), n = i;
      continue;
    }
    r.push({ type: "CHAR", index: n, value: e[n++] });
  }
  return r.push({ type: "END", index: n, value: "" }), r;
}
function F(e, t = {}) {
  let r = D(e);
  t.delimiter ??= "/#?", t.prefixes ??= "./";
  let n = `[^${x(t.delimiter)}]+?`, c = [], l = 0, f = 0, s = "", i = /* @__PURE__ */ new Set(), o = a((u) => {
    if (f < r.length && r[f].type === u) return r[f++].value;
  }, "tryConsume"), h = a(() => o("OTHER_MODIFIER") ?? o("ASTERISK"), "tryConsumeModifier"), p = a((u) => {
    let d = o(u);
    if (d !== void 0) return d;
    let { type: g, index: y } = r[f];
    throw new TypeError(`Unexpected ${g} at ${y}, expected ${u}`);
  }, "mustConsume"), A = a(() => {
    let u = "", d;
    for (; d = o("CHAR") ?? o("ESCAPED_CHAR"); ) u += d;
    return u;
  }, "consumeText"), xe = a((u) => u, "DefaultEncodePart"), N = t.encodePart || xe, H = "", $ = a((u) => {
    H += u;
  }, "appendToPendingFixedValue"), M = a(() => {
    H.length && (c.push(new P(3, "", "", N(H), "", 3)), H = "");
  }, "maybeAddPartFromPendingFixedValue"), X = a((u, d, g, y, Z) => {
    let m = 3;
    switch (Z) {
      case "?":
        m = 1;
        break;
      case "*":
        m = 0;
        break;
      case "+":
        m = 2;
        break;
    }
    if (!d && !g && m === 3) {
      $(u);
      return;
    }
    if (M(), !d && !g) {
      if (!u) return;
      c.push(new P(3, "", "", N(u), "", m));
      return;
    }
    let S;
    g ? g === "*" ? S = v : S = g : S = n;
    let k = 2;
    S === n ? (k = 1, S = "") : S === v && (k = 0, S = "");
    let E;
    if (d ? E = d : g && (E = l++), i.has(E)) throw new TypeError(`Duplicate name '${E}'.`);
    i.add(E), c.push(new P(k, E, N(u), S, N(y), m));
  }, "addPart");
  for (; f < r.length; ) {
    let u = o("CHAR"), d = o("NAME"), g = o("REGEX");
    if (!d && !g && (g = o("ASTERISK")), d || g) {
      let m = u ?? "";
      t.prefixes.indexOf(m) === -1 && ($(m), m = ""), M();
      let S = h();
      X(m, d, g, "", S);
      continue;
    }
    let y = u ?? o("ESCAPED_CHAR");
    if (y) {
      $(y);
      continue;
    }
    if (o("OPEN")) {
      let m = A(), S = o("NAME"), k = o("REGEX");
      !S && !k && (k = o("ASTERISK"));
      let E = A();
      p("CLOSE");
      let be = h();
      X(m, S, k, E, be);
      continue;
    }
    M(), p("END");
  }
  return c;
}
function x(e) {
  return e.replace(/([.+*?^${}()[\]|/\\])/g, "\\$1");
}
function B(e) {
  return e && e.ignoreCase ? "ui" : "u";
}
function q(e, t, r) {
  return W(F(e, r), t, r);
}
function T(e) {
  switch (e) {
    case 0:
      return "*";
    case 1:
      return "?";
    case 2:
      return "+";
    case 3:
      return "";
  }
}
function W(e, t, r = {}) {
  r.delimiter ??= "/#?", r.prefixes ??= "./", r.sensitive ??= false, r.strict ??= false, r.end ??= true, r.start ??= true, r.endsWith = "";
  let n = r.start ? "^" : "";
  for (let s of e) {
    if (s.type === 3) {
      s.modifier === 3 ? n += x(s.value) : n += `(?:${x(s.value)})${T(s.modifier)}`;
      continue;
    }
    t && t.push(s.name);
    let i = `[^${x(r.delimiter)}]+?`, o = s.value;
    if (s.type === 1 ? o = i : s.type === 0 && (o = v), !s.prefix.length && !s.suffix.length) {
      s.modifier === 3 || s.modifier === 1 ? n += `(${o})${T(s.modifier)}` : n += `((?:${o})${T(s.modifier)})`;
      continue;
    }
    if (s.modifier === 3 || s.modifier === 1) {
      n += `(?:${x(s.prefix)}(${o})${x(s.suffix)})`, n += T(s.modifier);
      continue;
    }
    n += `(?:${x(s.prefix)}`, n += `((?:${o})(?:`, n += x(s.suffix), n += x(s.prefix), n += `(?:${o}))*)${x(s.suffix)})`, s.modifier === 0 && (n += "?");
  }
  let c = `[${x(r.endsWith)}]|$`, l = `[${x(r.delimiter)}]`;
  if (r.end) return r.strict || (n += `${l}?`), r.endsWith.length ? n += `(?=${c})` : n += "$", new RegExp(n, B(r));
  r.strict || (n += `(?:${l}(?=${c}))?`);
  let f = false;
  if (e.length) {
    let s = e[e.length - 1];
    s.type === 3 && s.modifier === 3 && (f = r.delimiter.indexOf(s) > -1);
  }
  return f || (n += `(?=${l}|${c})`), new RegExp(n, B(r));
}
function ee(e, t) {
  return e.length ? e[0] === "/" ? true : !t || e.length < 2 ? false : (e[0] == "\\" || e[0] == "{") && e[1] == "/" : false;
}
function te(e, t) {
  return e.startsWith(t) ? e.substring(t.length, e.length) : e;
}
function ke(e, t) {
  return e.endsWith(t) ? e.substr(0, e.length - t.length) : e;
}
function _(e) {
  return !e || e.length < 2 ? false : e[0] === "[" || (e[0] === "\\" || e[0] === "{") && e[1] === "[";
}
function U(e) {
  if (!e) return true;
  for (let t of re) if (e.test(t)) return true;
  return false;
}
function ne(e, t) {
  if (e = te(e, "#"), t || e === "") return e;
  let r = new URL("https://example.com");
  return r.hash = e, r.hash ? r.hash.substring(1, r.hash.length) : "";
}
function se(e, t) {
  if (e = te(e, "?"), t || e === "") return e;
  let r = new URL("https://example.com");
  return r.search = e, r.search ? r.search.substring(1, r.search.length) : "";
}
function ie(e, t) {
  return t || e === "" ? e : _(e) ? K(e) : j(e);
}
function ae(e, t) {
  if (t || e === "") return e;
  let r = new URL("https://example.com");
  return r.password = e, r.password;
}
function oe(e, t) {
  if (t || e === "") return e;
  let r = new URL("https://example.com");
  return r.username = e, r.username;
}
function ce(e, t, r) {
  if (r || e === "") return e;
  if (t && !re.includes(t)) return new URL(`${t}:${e}`).pathname;
  let n = e[0] == "/";
  return e = new URL(n ? e : "/-" + e, "https://example.com").pathname, n || (e = e.substring(2, e.length)), e;
}
function le(e, t, r) {
  return z(t) === e && (e = ""), r || e === "" ? e : G(e);
}
function fe(e, t) {
  return e = ke(e, ":"), t || e === "" ? e : w(e);
}
function z(e) {
  switch (e) {
    case "ws":
    case "http":
      return "80";
    case "wws":
    case "https":
      return "443";
    case "ftp":
      return "21";
    default:
      return "";
  }
}
function w(e) {
  if (e === "") return e;
  if (/^[-+.A-Za-z0-9]*$/.test(e)) return e.toLowerCase();
  throw new TypeError(`Invalid protocol '${e}'.`);
}
function he(e) {
  if (e === "") return e;
  let t = new URL("https://example.com");
  return t.username = e, t.username;
}
function ue(e) {
  if (e === "") return e;
  let t = new URL("https://example.com");
  return t.password = e, t.password;
}
function j(e) {
  if (e === "") return e;
  if (/[\t\n\r #%/:<>?@[\]^\\|]/g.test(e)) throw new TypeError(`Invalid hostname '${e}'`);
  let t = new URL("https://example.com");
  return t.hostname = e, t.hostname;
}
function K(e) {
  if (e === "") return e;
  if (/[^0-9a-fA-F[\]:]/g.test(e)) throw new TypeError(`Invalid IPv6 hostname '${e}'`);
  return e.toLowerCase();
}
function G(e) {
  if (e === "" || /^[0-9]*$/.test(e) && parseInt(e) <= 65535) return e;
  throw new TypeError(`Invalid port '${e}'.`);
}
function de(e) {
  if (e === "") return e;
  let t = new URL("https://example.com");
  return t.pathname = e[0] !== "/" ? "/-" + e : e, e[0] !== "/" ? t.pathname.substring(2, t.pathname.length) : t.pathname;
}
function pe(e) {
  return e === "" ? e : new URL(`data:${e}`).pathname;
}
function ge(e) {
  if (e === "") return e;
  let t = new URL("https://example.com");
  return t.search = e, t.search.substring(1, t.search.length);
}
function me(e) {
  if (e === "") return e;
  let t = new URL("https://example.com");
  return t.hash = e, t.hash.substring(1, t.hash.length);
}
function Se(e, t) {
  if (typeof e != "string") throw new TypeError("parameter 1 is not of type 'string'.");
  let r = new URL(e, t);
  return { protocol: r.protocol.substring(0, r.protocol.length - 1), username: r.username, password: r.password, hostname: r.hostname, port: r.port, pathname: r.pathname, search: r.search !== "" ? r.search.substring(1, r.search.length) : void 0, hash: r.hash !== "" ? r.hash.substring(1, r.hash.length) : void 0 };
}
function R(e, t) {
  return t ? I(e) : e;
}
function L(e, t, r) {
  let n;
  if (typeof t.baseURL == "string") try {
    n = new URL(t.baseURL), t.protocol === void 0 && (e.protocol = R(n.protocol.substring(0, n.protocol.length - 1), r)), !r && t.protocol === void 0 && t.hostname === void 0 && t.port === void 0 && t.username === void 0 && (e.username = R(n.username, r)), !r && t.protocol === void 0 && t.hostname === void 0 && t.port === void 0 && t.username === void 0 && t.password === void 0 && (e.password = R(n.password, r)), t.protocol === void 0 && t.hostname === void 0 && (e.hostname = R(n.hostname, r)), t.protocol === void 0 && t.hostname === void 0 && t.port === void 0 && (e.port = R(n.port, r)), t.protocol === void 0 && t.hostname === void 0 && t.port === void 0 && t.pathname === void 0 && (e.pathname = R(n.pathname, r)), t.protocol === void 0 && t.hostname === void 0 && t.port === void 0 && t.pathname === void 0 && t.search === void 0 && (e.search = R(n.search.substring(1, n.search.length), r)), t.protocol === void 0 && t.hostname === void 0 && t.port === void 0 && t.pathname === void 0 && t.search === void 0 && t.hash === void 0 && (e.hash = R(n.hash.substring(1, n.hash.length), r));
  } catch {
    throw new TypeError(`invalid baseURL '${t.baseURL}'.`);
  }
  if (typeof t.protocol == "string" && (e.protocol = fe(t.protocol, r)), typeof t.username == "string" && (e.username = oe(t.username, r)), typeof t.password == "string" && (e.password = ae(t.password, r)), typeof t.hostname == "string" && (e.hostname = ie(t.hostname, r)), typeof t.port == "string" && (e.port = le(t.port, e.protocol, r)), typeof t.pathname == "string") {
    if (e.pathname = t.pathname, n && !ee(e.pathname, r)) {
      let c = n.pathname.lastIndexOf("/");
      c >= 0 && (e.pathname = R(n.pathname.substring(0, c + 1), r) + e.pathname);
    }
    e.pathname = ce(e.pathname, e.protocol, r);
  }
  return typeof t.search == "string" && (e.search = se(t.search, r)), typeof t.hash == "string" && (e.hash = ne(t.hash, r)), e;
}
function I(e) {
  return e.replace(/([+*?:{}()\\])/g, "\\$1");
}
function Te(e) {
  return e.replace(/([.+*?^${}()[\]|/\\])/g, "\\$1");
}
function Ae(e, t) {
  t.delimiter ??= "/#?", t.prefixes ??= "./", t.sensitive ??= false, t.strict ??= false, t.end ??= true, t.start ??= true, t.endsWith = "";
  let r = ".*", n = `[^${Te(t.delimiter)}]+?`, c = /[$_\u200C\u200D\p{ID_Continue}]/u, l = "";
  for (let f = 0; f < e.length; ++f) {
    let s = e[f];
    if (s.type === 3) {
      if (s.modifier === 3) {
        l += I(s.value);
        continue;
      }
      l += `{${I(s.value)}}${T(s.modifier)}`;
      continue;
    }
    let i = s.hasCustomName(), o = !!s.suffix.length || !!s.prefix.length && (s.prefix.length !== 1 || !t.prefixes.includes(s.prefix)), h = f > 0 ? e[f - 1] : null, p = f < e.length - 1 ? e[f + 1] : null;
    if (!o && i && s.type === 1 && s.modifier === 3 && p && !p.prefix.length && !p.suffix.length) if (p.type === 3) {
      let A = p.value.length > 0 ? p.value[0] : "";
      o = c.test(A);
    } else o = !p.hasCustomName();
    if (!o && !s.prefix.length && h && h.type === 3) {
      let A = h.value[h.value.length - 1];
      o = t.prefixes.includes(A);
    }
    o && (l += "{"), l += I(s.prefix), i && (l += `:${s.name}`), s.type === 2 ? l += `(${s.value})` : s.type === 1 ? i || (l += `(${n})`) : s.type === 0 && (!i && (!h || h.type === 3 || h.modifier !== 3 || o || s.prefix !== "") ? l += "*" : l += `(${r})`), s.type === 1 && i && s.suffix.length && c.test(s.suffix[0]) && (l += "\\"), l += I(s.suffix), o && (l += "}"), s.modifier !== 3 && (l += T(s.modifier));
  }
  return l;
}
var Pe;
var a;
var P;
var Re;
var Ee;
var v;
var b;
var J;
var Q;
var re;
var C;
var V;
var O;
var Y;
var init_urlpattern = __esm2({
  "node_modules/urlpattern-polyfill/dist/urlpattern.js"() {
    Pe = Object.defineProperty;
    a = (e, t) => Pe(e, "name", { value: t, configurable: true });
    P = class {
      type = 3;
      name = "";
      prefix = "";
      value = "";
      suffix = "";
      modifier = 3;
      constructor(t, r, n, c, l, f) {
        this.type = t, this.name = r, this.prefix = n, this.value = c, this.suffix = l, this.modifier = f;
      }
      hasCustomName() {
        return this.name !== "" && typeof this.name != "number";
      }
    };
    a(P, "Part");
    Re = /[$_\p{ID_Start}]/u;
    Ee = /[$_\u200C\u200D\p{ID_Continue}]/u;
    v = ".*";
    a(Oe, "isASCII");
    a(D, "lexer");
    a(F, "parse");
    a(x, "escapeString");
    a(B, "flags");
    a(q, "stringToRegexp");
    a(T, "modifierToString");
    a(W, "partsToRegexp");
    b = { delimiter: "", prefixes: "", sensitive: true, strict: true };
    J = { delimiter: ".", prefixes: "", sensitive: true, strict: true };
    Q = { delimiter: "/", prefixes: "/", sensitive: true, strict: true };
    a(ee, "isAbsolutePathname");
    a(te, "maybeStripPrefix");
    a(ke, "maybeStripSuffix");
    a(_, "treatAsIPv6Hostname");
    re = ["ftp", "file", "http", "https", "ws", "wss"];
    a(U, "isSpecialScheme");
    a(ne, "canonicalizeHash");
    a(se, "canonicalizeSearch");
    a(ie, "canonicalizeHostname");
    a(ae, "canonicalizePassword");
    a(oe, "canonicalizeUsername");
    a(ce, "canonicalizePathname");
    a(le, "canonicalizePort");
    a(fe, "canonicalizeProtocol");
    a(z, "defaultPortForProtocol");
    a(w, "protocolEncodeCallback");
    a(he, "usernameEncodeCallback");
    a(ue, "passwordEncodeCallback");
    a(j, "hostnameEncodeCallback");
    a(K, "ipv6HostnameEncodeCallback");
    a(G, "portEncodeCallback");
    a(de, "standardURLPathnameEncodeCallback");
    a(pe, "pathURLPathnameEncodeCallback");
    a(ge, "searchEncodeCallback");
    a(me, "hashEncodeCallback");
    C = class {
      #i;
      #n = [];
      #t = {};
      #e = 0;
      #s = 1;
      #l = 0;
      #o = 0;
      #d = 0;
      #p = 0;
      #g = false;
      constructor(t) {
        this.#i = t;
      }
      get result() {
        return this.#t;
      }
      parse() {
        for (this.#n = D(this.#i, true); this.#e < this.#n.length; this.#e += this.#s) {
          if (this.#s = 1, this.#n[this.#e].type === "END") {
            if (this.#o === 0) {
              this.#b(), this.#f() ? this.#r(9, 1) : this.#h() ? this.#r(8, 1) : this.#r(7, 0);
              continue;
            } else if (this.#o === 2) {
              this.#u(5);
              continue;
            }
            this.#r(10, 0);
            break;
          }
          if (this.#d > 0) if (this.#A()) this.#d -= 1;
          else continue;
          if (this.#T()) {
            this.#d += 1;
            continue;
          }
          switch (this.#o) {
            case 0:
              this.#P() && this.#u(1);
              break;
            case 1:
              if (this.#P()) {
                this.#C();
                let t = 7, r = 1;
                this.#E() ? (t = 2, r = 3) : this.#g && (t = 2), this.#r(t, r);
              }
              break;
            case 2:
              this.#S() ? this.#u(3) : (this.#x() || this.#h() || this.#f()) && this.#u(5);
              break;
            case 3:
              this.#O() ? this.#r(4, 1) : this.#S() && this.#r(5, 1);
              break;
            case 4:
              this.#S() && this.#r(5, 1);
              break;
            case 5:
              this.#y() ? this.#p += 1 : this.#w() && (this.#p -= 1), this.#k() && !this.#p ? this.#r(6, 1) : this.#x() ? this.#r(7, 0) : this.#h() ? this.#r(8, 1) : this.#f() && this.#r(9, 1);
              break;
            case 6:
              this.#x() ? this.#r(7, 0) : this.#h() ? this.#r(8, 1) : this.#f() && this.#r(9, 1);
              break;
            case 7:
              this.#h() ? this.#r(8, 1) : this.#f() && this.#r(9, 1);
              break;
            case 8:
              this.#f() && this.#r(9, 1);
              break;
            case 9:
              break;
            case 10:
              break;
          }
        }
        this.#t.hostname !== void 0 && this.#t.port === void 0 && (this.#t.port = "");
      }
      #r(t, r) {
        switch (this.#o) {
          case 0:
            break;
          case 1:
            this.#t.protocol = this.#c();
            break;
          case 2:
            break;
          case 3:
            this.#t.username = this.#c();
            break;
          case 4:
            this.#t.password = this.#c();
            break;
          case 5:
            this.#t.hostname = this.#c();
            break;
          case 6:
            this.#t.port = this.#c();
            break;
          case 7:
            this.#t.pathname = this.#c();
            break;
          case 8:
            this.#t.search = this.#c();
            break;
          case 9:
            this.#t.hash = this.#c();
            break;
          case 10:
            break;
        }
        this.#o !== 0 && t !== 10 && ([1, 2, 3, 4].includes(this.#o) && [6, 7, 8, 9].includes(t) && (this.#t.hostname ??= ""), [1, 2, 3, 4, 5, 6].includes(this.#o) && [8, 9].includes(t) && (this.#t.pathname ??= this.#g ? "/" : ""), [1, 2, 3, 4, 5, 6, 7].includes(this.#o) && t === 9 && (this.#t.search ??= "")), this.#R(t, r);
      }
      #R(t, r) {
        this.#o = t, this.#l = this.#e + r, this.#e += r, this.#s = 0;
      }
      #b() {
        this.#e = this.#l, this.#s = 0;
      }
      #u(t) {
        this.#b(), this.#o = t;
      }
      #m(t) {
        return t < 0 && (t = this.#n.length - t), t < this.#n.length ? this.#n[t] : this.#n[this.#n.length - 1];
      }
      #a(t, r) {
        let n = this.#m(t);
        return n.value === r && (n.type === "CHAR" || n.type === "ESCAPED_CHAR" || n.type === "INVALID_CHAR");
      }
      #P() {
        return this.#a(this.#e, ":");
      }
      #E() {
        return this.#a(this.#e + 1, "/") && this.#a(this.#e + 2, "/");
      }
      #S() {
        return this.#a(this.#e, "@");
      }
      #O() {
        return this.#a(this.#e, ":");
      }
      #k() {
        return this.#a(this.#e, ":");
      }
      #x() {
        return this.#a(this.#e, "/");
      }
      #h() {
        if (this.#a(this.#e, "?")) return true;
        if (this.#n[this.#e].value !== "?") return false;
        let t = this.#m(this.#e - 1);
        return t.type !== "NAME" && t.type !== "REGEX" && t.type !== "CLOSE" && t.type !== "ASTERISK";
      }
      #f() {
        return this.#a(this.#e, "#");
      }
      #T() {
        return this.#n[this.#e].type == "OPEN";
      }
      #A() {
        return this.#n[this.#e].type == "CLOSE";
      }
      #y() {
        return this.#a(this.#e, "[");
      }
      #w() {
        return this.#a(this.#e, "]");
      }
      #c() {
        let t = this.#n[this.#e], r = this.#m(this.#l).index;
        return this.#i.substring(r, t.index);
      }
      #C() {
        let t = {};
        Object.assign(t, b), t.encodePart = w;
        let r = q(this.#c(), void 0, t);
        this.#g = U(r);
      }
    };
    a(C, "Parser");
    V = ["protocol", "username", "password", "hostname", "port", "pathname", "search", "hash"];
    O = "*";
    a(Se, "extractValues");
    a(R, "processBaseURLString");
    a(L, "applyInit");
    a(I, "escapePatternString");
    a(Te, "escapeRegexpString");
    a(Ae, "partsToPattern");
    Y = class {
      #i;
      #n = {};
      #t = {};
      #e = {};
      #s = {};
      #l = false;
      constructor(t = {}, r, n) {
        try {
          let c;
          if (typeof r == "string" ? c = r : n = r, typeof t == "string") {
            let i = new C(t);
            if (i.parse(), t = i.result, c === void 0 && typeof t.protocol != "string") throw new TypeError("A base URL must be provided for a relative constructor string.");
            t.baseURL = c;
          } else {
            if (!t || typeof t != "object") throw new TypeError("parameter 1 is not of type 'string' and cannot convert to dictionary.");
            if (c) throw new TypeError("parameter 1 is not of type 'string'.");
          }
          typeof n > "u" && (n = { ignoreCase: false });
          let l = { ignoreCase: n.ignoreCase === true }, f = { pathname: O, protocol: O, username: O, password: O, hostname: O, port: O, search: O, hash: O };
          this.#i = L(f, t, true), z(this.#i.protocol) === this.#i.port && (this.#i.port = "");
          let s;
          for (s of V) {
            if (!(s in this.#i)) continue;
            let i = {}, o = this.#i[s];
            switch (this.#t[s] = [], s) {
              case "protocol":
                Object.assign(i, b), i.encodePart = w;
                break;
              case "username":
                Object.assign(i, b), i.encodePart = he;
                break;
              case "password":
                Object.assign(i, b), i.encodePart = ue;
                break;
              case "hostname":
                Object.assign(i, J), _(o) ? i.encodePart = K : i.encodePart = j;
                break;
              case "port":
                Object.assign(i, b), i.encodePart = G;
                break;
              case "pathname":
                U(this.#n.protocol) ? (Object.assign(i, Q, l), i.encodePart = de) : (Object.assign(i, b, l), i.encodePart = pe);
                break;
              case "search":
                Object.assign(i, b, l), i.encodePart = ge;
                break;
              case "hash":
                Object.assign(i, b, l), i.encodePart = me;
                break;
            }
            try {
              this.#s[s] = F(o, i), this.#n[s] = W(this.#s[s], this.#t[s], i), this.#e[s] = Ae(this.#s[s], i), this.#l = this.#l || this.#s[s].some((h) => h.type === 2);
            } catch {
              throw new TypeError(`invalid ${s} pattern '${this.#i[s]}'.`);
            }
          }
        } catch (c) {
          throw new TypeError(`Failed to construct 'URLPattern': ${c.message}`);
        }
      }
      get [Symbol.toStringTag]() {
        return "URLPattern";
      }
      test(t = {}, r) {
        let n = { pathname: "", protocol: "", username: "", password: "", hostname: "", port: "", search: "", hash: "" };
        if (typeof t != "string" && r) throw new TypeError("parameter 1 is not of type 'string'.");
        if (typeof t > "u") return false;
        try {
          typeof t == "object" ? n = L(n, t, false) : n = L(n, Se(t, r), false);
        } catch {
          return false;
        }
        let c;
        for (c of V) if (!this.#n[c].exec(n[c])) return false;
        return true;
      }
      exec(t = {}, r) {
        let n = { pathname: "", protocol: "", username: "", password: "", hostname: "", port: "", search: "", hash: "" };
        if (typeof t != "string" && r) throw new TypeError("parameter 1 is not of type 'string'.");
        if (typeof t > "u") return;
        try {
          typeof t == "object" ? n = L(n, t, false) : n = L(n, Se(t, r), false);
        } catch {
          return null;
        }
        let c = {};
        r ? c.inputs = [t, r] : c.inputs = [t];
        let l;
        for (l of V) {
          let f = this.#n[l].exec(n[l]);
          if (!f) return null;
          let s = {};
          for (let [i, o] of this.#t[l].entries()) if (typeof o == "string" || typeof o == "number") {
            let h = f[i + 1];
            s[o] = h;
          }
          c[l] = { input: n[l] ?? "", groups: s };
        }
        return c;
      }
      static compareComponent(t, r, n) {
        let c = a((i, o) => {
          for (let h of ["type", "modifier", "prefix", "value", "suffix"]) {
            if (i[h] < o[h]) return -1;
            if (i[h] === o[h]) continue;
            return 1;
          }
          return 0;
        }, "comparePart"), l = new P(3, "", "", "", "", 3), f = new P(0, "", "", "", "", 3), s = a((i, o) => {
          let h = 0;
          for (; h < Math.min(i.length, o.length); ++h) {
            let p = c(i[h], o[h]);
            if (p) return p;
          }
          return i.length === o.length ? 0 : c(i[h] ?? l, o[h] ?? l);
        }, "comparePartList");
        return !r.#e[t] && !n.#e[t] ? 0 : r.#e[t] && !n.#e[t] ? s(r.#s[t], [f]) : !r.#e[t] && n.#e[t] ? s([f], n.#s[t]) : s(r.#s[t], n.#s[t]);
      }
      get protocol() {
        return this.#e.protocol;
      }
      get username() {
        return this.#e.username;
      }
      get password() {
        return this.#e.password;
      }
      get hostname() {
        return this.#e.hostname;
      }
      get port() {
        return this.#e.port;
      }
      get pathname() {
        return this.#e.pathname;
      }
      get search() {
        return this.#e.search;
      }
      get hash() {
        return this.#e.hash;
      }
      get hasRegExpGroups() {
        return this.#l;
      }
    };
    a(Y, "URLPattern");
  }
});
var urlpattern_polyfill_exports = {};
__export2(urlpattern_polyfill_exports, {
  URLPattern: () => Y
});
var init_urlpattern_polyfill = __esm2({
  "node_modules/urlpattern-polyfill/index.js"() {
    init_urlpattern();
    if (!globalThis.URLPattern) {
      globalThis.URLPattern = Y;
    }
  }
});
var require_server_reference_manifest = __commonJS({
  ".next/server/server-reference-manifest.js"() {
    "use strict";
    self.__RSC_SERVER_MANIFEST = '{"node":{},"edge":{},"encryptionKey":"process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY"}';
  }
});
var require_route_client_reference_manifest = __commonJS({
  ".next/server/app/api/erc8004/route_client-reference-manifest.js"() {
    "use strict";
    globalThis.__RSC_MANIFEST = globalThis.__RSC_MANIFEST || {};
    globalThis.__RSC_MANIFEST["/api/erc8004/route"] = { "moduleLoading": { "prefix": "/_next/" }, "ssrModuleMapping": { "6737": { "*": { "id": "28895", "name": "*", "chunks": [], "async": false } }, "9766": { "*": { "id": "77526", "name": "*", "chunks": [], "async": false } }, "15278": { "*": { "id": "78922", "name": "*", "chunks": [], "async": false } }, "17989": { "*": { "id": "68495", "name": "*", "chunks": [], "async": false } }, "21920": { "*": { "id": "14144", "name": "*", "chunks": [], "async": false } }, "24431": { "*": { "id": "12263", "name": "*", "chunks": [], "async": false } }, "29649": { "*": { "id": "91485", "name": "*", "chunks": [], "async": false } }, "31979": { "*": { "id": "11221", "name": "*", "chunks": [], "async": false } }, "32860": { "*": { "id": "32048", "name": "*", "chunks": [], "async": false } }, "43869": { "*": { "id": "99956", "name": "*", "chunks": [], "async": false } }, "46899": { "*": { "id": "55839", "name": "*", "chunks": [], "async": false } }, "48324": { "*": { "id": "18254", "name": "*", "chunks": [], "async": false } }, "57150": { "*": { "id": "54160", "name": "*", "chunks": [], "async": false } }, "60503": { "*": { "id": "84588", "name": "*", "chunks": [], "async": false } }, "63886": { "*": { "id": "75170", "name": "*", "chunks": [], "async": false } }, "66423": { "*": { "id": "76587", "name": "*", "chunks": [], "async": false } }, "80622": { "*": { "id": "82146", "name": "*", "chunks": [], "async": false } }, "81959": { "*": { "id": "31603", "name": "*", "chunks": [], "async": false } }, "87350": { "*": { "id": "34543", "name": "*", "chunks": [], "async": false } }, "89192": { "*": { "id": "41368", "name": "*", "chunks": [], "async": false } }, "89204": { "*": { "id": "35138", "name": "*", "chunks": [], "async": false } }, "98924": { "*": { "id": "29234", "name": "*", "chunks": [], "async": false } } }, "edgeSSRModuleMapping": {}, "clientModules": { "/Users/thefirstelder/Documents/aurum_unit/frontend/node_modules/next/dist/client/components/builtin/global-error.js": { "id": 57150, "name": "*", "chunks": [], "async": false }, "/Users/thefirstelder/Documents/aurum_unit/frontend/node_modules/next/dist/esm/client/components/builtin/global-error.js": { "id": 57150, "name": "*", "chunks": [], "async": false }, "/Users/thefirstelder/Documents/aurum_unit/frontend/node_modules/next/dist/client/components/client-page.js": { "id": 81959, "name": "*", "chunks": [], "async": false }, "/Users/thefirstelder/Documents/aurum_unit/frontend/node_modules/next/dist/esm/client/components/client-page.js": { "id": 81959, "name": "*", "chunks": [], "async": false }, "/Users/thefirstelder/Documents/aurum_unit/frontend/node_modules/next/dist/client/components/client-segment.js": { "id": 17989, "name": "*", "chunks": [], "async": false }, "/Users/thefirstelder/Documents/aurum_unit/frontend/node_modules/next/dist/esm/client/components/client-segment.js": { "id": 17989, "name": "*", "chunks": [], "async": false }, "/Users/thefirstelder/Documents/aurum_unit/frontend/node_modules/next/dist/client/components/http-access-fallback/error-boundary.js": { "id": 63886, "name": "*", "chunks": [], "async": false }, "/Users/thefirstelder/Documents/aurum_unit/frontend/node_modules/next/dist/esm/client/components/http-access-fallback/error-boundary.js": { "id": 63886, "name": "*", "chunks": [], "async": false }, "/Users/thefirstelder/Documents/aurum_unit/frontend/node_modules/next/dist/client/components/layout-router.js": { "id": 9766, "name": "*", "chunks": [], "async": false }, "/Users/thefirstelder/Documents/aurum_unit/frontend/node_modules/next/dist/esm/client/components/layout-router.js": { "id": 9766, "name": "*", "chunks": [], "async": false }, "/Users/thefirstelder/Documents/aurum_unit/frontend/node_modules/next/dist/client/components/metadata/async-metadata.js": { "id": 15278, "name": "*", "chunks": [], "async": false }, "/Users/thefirstelder/Documents/aurum_unit/frontend/node_modules/next/dist/esm/client/components/metadata/async-metadata.js": { "id": 15278, "name": "*", "chunks": [], "async": false }, "/Users/thefirstelder/Documents/aurum_unit/frontend/node_modules/next/dist/client/components/render-from-template-context.js": { "id": 98924, "name": "*", "chunks": [], "async": false }, "/Users/thefirstelder/Documents/aurum_unit/frontend/node_modules/next/dist/esm/client/components/render-from-template-context.js": { "id": 98924, "name": "*", "chunks": [], "async": false }, "/Users/thefirstelder/Documents/aurum_unit/frontend/node_modules/next/dist/lib/framework/boundary-components.js": { "id": 24431, "name": "*", "chunks": [], "async": false }, "/Users/thefirstelder/Documents/aurum_unit/frontend/node_modules/next/dist/esm/lib/framework/boundary-components.js": { "id": 24431, "name": "*", "chunks": [], "async": false }, "/Users/thefirstelder/Documents/aurum_unit/frontend/node_modules/next/dist/lib/metadata/generate/icon-mark.js": { "id": 80622, "name": "*", "chunks": [], "async": false }, "/Users/thefirstelder/Documents/aurum_unit/frontend/node_modules/next/dist/esm/lib/metadata/generate/icon-mark.js": { "id": 80622, "name": "*", "chunks": [], "async": false }, '/Users/thefirstelder/Documents/aurum_unit/frontend/node_modules/next/font/google/target.css?{"path":"app/layout.tsx","import":"Inter","arguments":[{"subsets":["latin"],"weight":["300","400","500","600","700","800"]}],"variableName":"inter"}': { "id": 79515, "name": "*", "chunks": ["177", "static/chunks/app/layout-f8d0512e905e37fd.js"], "async": false }, "/Users/thefirstelder/Documents/aurum_unit/frontend/app/globals.css": { "id": 41290, "name": "*", "chunks": ["177", "static/chunks/app/layout-f8d0512e905e37fd.js"], "async": false }, "/Users/thefirstelder/Documents/aurum_unit/frontend/components/home/cta.tsx": { "id": 21920, "name": "*", "chunks": ["516", "static/chunks/516-ddb8d25465f98f10.js", "712", "static/chunks/712-cae3eb22cce37158.js", "206", "static/chunks/206-16eb03d919d51eaf.js", "88", "static/chunks/88-1ed040eb6d051bb7.js", "974", "static/chunks/app/page-5a394dfa844cb368.js"], "async": false }, "/Users/thefirstelder/Documents/aurum_unit/frontend/components/home/features.tsx": { "id": 46899, "name": "*", "chunks": ["516", "static/chunks/516-ddb8d25465f98f10.js", "712", "static/chunks/712-cae3eb22cce37158.js", "206", "static/chunks/206-16eb03d919d51eaf.js", "88", "static/chunks/88-1ed040eb6d051bb7.js", "974", "static/chunks/app/page-5a394dfa844cb368.js"], "async": false }, "/Users/thefirstelder/Documents/aurum_unit/frontend/components/home/hero.tsx": { "id": 89192, "name": "*", "chunks": ["516", "static/chunks/516-ddb8d25465f98f10.js", "712", "static/chunks/712-cae3eb22cce37158.js", "206", "static/chunks/206-16eb03d919d51eaf.js", "88", "static/chunks/88-1ed040eb6d051bb7.js", "974", "static/chunks/app/page-5a394dfa844cb368.js"], "async": false }, "/Users/thefirstelder/Documents/aurum_unit/frontend/components/home/how-it-works.tsx": { "id": 31979, "name": "*", "chunks": ["516", "static/chunks/516-ddb8d25465f98f10.js", "712", "static/chunks/712-cae3eb22cce37158.js", "206", "static/chunks/206-16eb03d919d51eaf.js", "88", "static/chunks/88-1ed040eb6d051bb7.js", "974", "static/chunks/app/page-5a394dfa844cb368.js"], "async": false }, "/Users/thefirstelder/Documents/aurum_unit/frontend/components/home/live-demo.tsx": { "id": 32860, "name": "*", "chunks": ["516", "static/chunks/516-ddb8d25465f98f10.js", "712", "static/chunks/712-cae3eb22cce37158.js", "206", "static/chunks/206-16eb03d919d51eaf.js", "88", "static/chunks/88-1ed040eb6d051bb7.js", "974", "static/chunks/app/page-5a394dfa844cb368.js"], "async": false }, "/Users/thefirstelder/Documents/aurum_unit/frontend/components/home/protocols.tsx": { "id": 89204, "name": "*", "chunks": ["516", "static/chunks/516-ddb8d25465f98f10.js", "712", "static/chunks/712-cae3eb22cce37158.js", "206", "static/chunks/206-16eb03d919d51eaf.js", "88", "static/chunks/88-1ed040eb6d051bb7.js", "974", "static/chunks/app/page-5a394dfa844cb368.js"], "async": false }, "/Users/thefirstelder/Documents/aurum_unit/frontend/components/home/security.tsx": { "id": 48324, "name": "*", "chunks": ["516", "static/chunks/516-ddb8d25465f98f10.js", "712", "static/chunks/712-cae3eb22cce37158.js", "206", "static/chunks/206-16eb03d919d51eaf.js", "88", "static/chunks/88-1ed040eb6d051bb7.js", "974", "static/chunks/app/page-5a394dfa844cb368.js"], "async": false }, "/Users/thefirstelder/Documents/aurum_unit/frontend/components/home/stats.tsx": { "id": 60503, "name": "*", "chunks": ["516", "static/chunks/516-ddb8d25465f98f10.js", "712", "static/chunks/712-cae3eb22cce37158.js", "206", "static/chunks/206-16eb03d919d51eaf.js", "88", "static/chunks/88-1ed040eb6d051bb7.js", "974", "static/chunks/app/page-5a394dfa844cb368.js"], "async": false }, "/Users/thefirstelder/Documents/aurum_unit/frontend/components/home/wealth-projection.tsx": { "id": 6737, "name": "*", "chunks": ["516", "static/chunks/516-ddb8d25465f98f10.js", "712", "static/chunks/712-cae3eb22cce37158.js", "206", "static/chunks/206-16eb03d919d51eaf.js", "88", "static/chunks/88-1ed040eb6d051bb7.js", "974", "static/chunks/app/page-5a394dfa844cb368.js"], "async": false }, "/Users/thefirstelder/Documents/aurum_unit/frontend/components/providers.tsx": { "id": 87350, "name": "*", "chunks": ["516", "static/chunks/516-ddb8d25465f98f10.js", "712", "static/chunks/712-cae3eb22cce37158.js", "206", "static/chunks/206-16eb03d919d51eaf.js", "88", "static/chunks/88-1ed040eb6d051bb7.js", "974", "static/chunks/app/page-5a394dfa844cb368.js"], "async": false }, "/Users/thefirstelder/Documents/aurum_unit/frontend/hooks/use-theme.tsx": { "id": 29649, "name": "*", "chunks": ["516", "static/chunks/516-ddb8d25465f98f10.js", "712", "static/chunks/712-cae3eb22cce37158.js", "206", "static/chunks/206-16eb03d919d51eaf.js", "88", "static/chunks/88-1ed040eb6d051bb7.js", "974", "static/chunks/app/page-5a394dfa844cb368.js"], "async": false }, "/Users/thefirstelder/Documents/aurum_unit/frontend/app/app/layout.tsx": { "id": 66423, "name": "*", "chunks": [], "async": false }, "/Users/thefirstelder/Documents/aurum_unit/frontend/app/app/page.tsx": { "id": 43869, "name": "*", "chunks": [], "async": false } }, "entryCSSFiles": { "/Users/thefirstelder/Documents/aurum_unit/frontend/": [], "/Users/thefirstelder/Documents/aurum_unit/frontend/app/layout": [{ "inlined": false, "path": "static/css/c43337c3e4103c46.css" }, { "inlined": false, "path": "static/css/0237cc65d33a4f14.css" }], "/Users/thefirstelder/Documents/aurum_unit/frontend/app/page": [], "/Users/thefirstelder/Documents/aurum_unit/frontend/app/api/erc8004/route": [] }, "rscModuleMapping": { "6737": { "*": { "id": "2475", "name": "*", "chunks": [], "async": false } }, "9766": { "*": { "id": "6060", "name": "*", "chunks": [], "async": false } }, "15278": { "*": { "id": "7184", "name": "*", "chunks": [], "async": false } }, "17989": { "*": { "id": "36893", "name": "*", "chunks": [], "async": false } }, "21920": { "*": { "id": "30690", "name": "*", "chunks": [], "async": false } }, "24431": { "*": { "id": "73041", "name": "*", "chunks": [], "async": false } }, "29649": { "*": { "id": "25775", "name": "*", "chunks": [], "async": false } }, "31979": { "*": { "id": "89615", "name": "*", "chunks": [], "async": false } }, "32860": { "*": { "id": "41710", "name": "*", "chunks": [], "async": false } }, "41290": { "*": { "id": "82704", "name": "*", "chunks": [], "async": false } }, "43869": { "*": { "id": "14242", "name": "*", "chunks": [], "async": false } }, "46899": { "*": { "id": "68039", "name": "*", "chunks": [], "async": false } }, "48324": { "*": { "id": "78248", "name": "*", "chunks": [], "async": false } }, "57150": { "*": { "id": "81170", "name": "*", "chunks": [], "async": false } }, "60503": { "*": { "id": "37793", "name": "*", "chunks": [], "async": false } }, "63886": { "*": { "id": "89748", "name": "*", "chunks": [], "async": false } }, "66423": { "*": { "id": "32061", "name": "*", "chunks": [], "async": false } }, "80622": { "*": { "id": "51384", "name": "*", "chunks": [], "async": false } }, "81959": { "*": { "id": "23597", "name": "*", "chunks": [], "async": false } }, "87350": { "*": { "id": "66664", "name": "*", "chunks": [], "async": false } }, "89192": { "*": { "id": "39258", "name": "*", "chunks": [], "async": false } }, "89204": { "*": { "id": "19919", "name": "*", "chunks": [], "async": false } }, "98924": { "*": { "id": "69576", "name": "*", "chunks": [], "async": false } } }, "edgeRscModuleMapping": {} };
  }
});
var require_middleware_build_manifest = __commonJS({
  ".next/server/middleware-build-manifest.js"() {
    "use strict";
    globalThis.__BUILD_MANIFEST = { polyfillFiles: ["static/chunks/polyfills-42372ed130431b0a.js"], devFiles: [], ampDevFiles: [], lowPriorityFiles: [], rootMainFiles: ["static/chunks/webpack-e8cfd825a6c296d6.js", "static/chunks/4bd1b696-409494caf8c83275.js", "static/chunks/255-e881f48ae1d2333a.js", "static/chunks/main-app-b4558f91f7e7cb43.js"], rootMainFilesTree: {}, pages: { "/_app": ["static/chunks/webpack-e8cfd825a6c296d6.js", "static/chunks/framework-3457b9c2619cdd96.js", "static/chunks/main-676eb7a36a551661.js", "static/chunks/pages/_app-5addca2b3b969fde.js"], "/_error": ["static/chunks/webpack-e8cfd825a6c296d6.js", "static/chunks/framework-3457b9c2619cdd96.js", "static/chunks/main-676eb7a36a551661.js", "static/chunks/pages/_error-022e4ac7bbb9914f.js"] }, ampFirstPages: [] }, globalThis.__BUILD_MANIFEST.lowPriorityFiles = ["/static/" + process.env.__NEXT_BUILD_ID + "/_buildManifest.js", , "/static/" + process.env.__NEXT_BUILD_ID + "/_ssgManifest.js"];
  }
});
var require_middleware_react_loadable_manifest = __commonJS({
  ".next/server/middleware-react-loadable-manifest.js"() {
    "use strict";
    self.__REACT_LOADABLE_MANIFEST = '{"hooks/use-circle-social-wallet.ts -> @circle-fin/w3s-pw-web-sdk":{"id":54815,"files":["static/chunks/aaea2bcf.5976f34e031a4e16.js","static/chunks/3e376d62.34c6a48641ddc352.js","static/chunks/326.43e679f45475f372.js"]},"node_modules/viem/_esm/actions/public/call.js -> ../../utils/ccip.js":{"id":null,"files":[]},"node_modules/viem/_esm/utils/rpc/webSocket.js -> isows":{"id":null,"files":[]},"node_modules/viem/_esm/utils/signature/recoverPublicKey.js -> @noble/curves/secp256k1":{"id":null,"files":[]}}';
  }
});
var require_next_font_manifest = __commonJS({
  ".next/server/next-font-manifest.js"() {
    "use strict";
    self.__NEXT_FONT_MANIFEST = '{"pages":{},"app":{"/Users/thefirstelder/Documents/aurum_unit/frontend/app/layout":["static/media/e4af272ccee01ff0-s.p.woff2"]},"appUsingSizeAdjust":true,"pagesUsingSizeAdjust":false}';
  }
});
var require_interception_route_rewrite_manifest = __commonJS({
  ".next/server/interception-route-rewrite-manifest.js"() {
    "use strict";
    self.__INTERCEPTION_ROUTE_REWRITE_MANIFEST = "[]";
  }
});
var require_edge_runtime_webpack = __commonJS({
  ".next/server/edge-runtime-webpack.js"() {
    "use strict";
    (() => {
      "use strict";
      var a2 = {}, b2 = {};
      function c(d) {
        var e = b2[d];
        if (void 0 !== e) return e.exports;
        var f = b2[d] = { exports: {} }, g = true;
        try {
          a2[d](f, f.exports, c), g = false;
        } finally {
          g && delete b2[d];
        }
        return f.exports;
      }
      c.m = a2, c.amdO = {}, (() => {
        var a3 = [];
        c.O = (b3, d, e, f) => {
          if (d) {
            f = f || 0;
            for (var g = a3.length; g > 0 && a3[g - 1][2] > f; g--) a3[g] = a3[g - 1];
            a3[g] = [d, e, f];
            return;
          }
          for (var h = 1 / 0, g = 0; g < a3.length; g++) {
            for (var [d, e, f] = a3[g], i = true, j2 = 0; j2 < d.length; j2++) (false & f || h >= f) && Object.keys(c.O).every((a4) => c.O[a4](d[j2])) ? d.splice(j2--, 1) : (i = false, f < h && (h = f));
            if (i) {
              a3.splice(g--, 1);
              var k = e();
              void 0 !== k && (b3 = k);
            }
          }
          return b3;
        };
      })(), c.n = (a3) => {
        var b3 = a3 && a3.__esModule ? () => a3.default : () => a3;
        return c.d(b3, { a: b3 }), b3;
      }, c.d = (a3, b3) => {
        for (var d in b3) c.o(b3, d) && !c.o(a3, d) && Object.defineProperty(a3, d, { enumerable: true, get: b3[d] });
      }, c.e = () => Promise.resolve(), c.g = function() {
        if ("object" == typeof globalThis) return globalThis;
        try {
          return this || Function("return this")();
        } catch (a3) {
          if ("object" == typeof window) return window;
        }
      }(), c.o = (a3, b3) => Object.prototype.hasOwnProperty.call(a3, b3), c.r = (a3) => {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(a3, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(a3, "__esModule", { value: true });
      }, (() => {
        var a3 = { 149: 0 };
        c.O.j = (b4) => 0 === a3[b4];
        var b3 = (b4, d2) => {
          var e, f, [g, h, i] = d2, j2 = 0;
          if (g.some((b5) => 0 !== a3[b5])) {
            for (e in h) c.o(h, e) && (c.m[e] = h[e]);
            if (i) var k = i(c);
          }
          for (b4 && b4(d2); j2 < g.length; j2++) f = g[j2], c.o(a3, f) && a3[f] && a3[f][0](), a3[f] = 0;
          return c.O(k);
        }, d = self.webpackChunk_N_E = self.webpackChunk_N_E || [];
        d.forEach(b3.bind(null, 0)), d.push = b3.bind(null, d.push.bind(d));
      })();
    })();
  }
});
var require__ = __commonJS({
  ".next/server/edge-chunks/237.js"() {
    "use strict";
    (self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([[237], { 86: (a2, b2, c) => {
      var d;
      (() => {
        var e = { 226: function(e2, f2) {
          !function(g2, h) {
            "use strict";
            var i = "function", j2 = "undefined", k = "object", l = "string", m = "major", n = "model", o = "name", p = "type", q2 = "vendor", r = "version", s = "architecture", t = "console", u = "mobile", v2 = "tablet", w2 = "smarttv", x2 = "wearable", y = "embedded", z2 = "Amazon", A = "Apple", B2 = "ASUS", C2 = "BlackBerry", D2 = "Browser", E = "Chrome", F2 = "Firefox", G2 = "Google", H = "Huawei", I2 = "Microsoft", J2 = "Motorola", K2 = "Opera", L2 = "Samsung", M = "Sharp", N = "Sony", O2 = "Xiaomi", P2 = "Zebra", Q2 = "Facebook", R2 = "Chromium OS", S = "Mac OS", T2 = function(a3, b3) {
              var c2 = {};
              for (var d2 in a3) b3[d2] && b3[d2].length % 2 == 0 ? c2[d2] = b3[d2].concat(a3[d2]) : c2[d2] = a3[d2];
              return c2;
            }, U2 = function(a3) {
              for (var b3 = {}, c2 = 0; c2 < a3.length; c2++) b3[a3[c2].toUpperCase()] = a3[c2];
              return b3;
            }, V2 = function(a3, b3) {
              return typeof a3 === l && -1 !== W2(b3).indexOf(W2(a3));
            }, W2 = function(a3) {
              return a3.toLowerCase();
            }, X = function(a3, b3) {
              if (typeof a3 === l) return a3 = a3.replace(/^\s\s*/, ""), typeof b3 === j2 ? a3 : a3.substring(0, 350);
            }, Y2 = function(a3, b3) {
              for (var c2, d2, e3, f3, g3, j3, l2 = 0; l2 < b3.length && !g3; ) {
                var m2 = b3[l2], n2 = b3[l2 + 1];
                for (c2 = d2 = 0; c2 < m2.length && !g3 && m2[c2]; ) if (g3 = m2[c2++].exec(a3)) for (e3 = 0; e3 < n2.length; e3++) j3 = g3[++d2], typeof (f3 = n2[e3]) === k && f3.length > 0 ? 2 === f3.length ? typeof f3[1] == i ? this[f3[0]] = f3[1].call(this, j3) : this[f3[0]] = f3[1] : 3 === f3.length ? typeof f3[1] !== i || f3[1].exec && f3[1].test ? this[f3[0]] = j3 ? j3.replace(f3[1], f3[2]) : void 0 : this[f3[0]] = j3 ? f3[1].call(this, j3, f3[2]) : void 0 : 4 === f3.length && (this[f3[0]] = j3 ? f3[3].call(this, j3.replace(f3[1], f3[2])) : h) : this[f3] = j3 || h;
                l2 += 2;
              }
            }, Z = function(a3, b3) {
              for (var c2 in b3) if (typeof b3[c2] === k && b3[c2].length > 0) {
                for (var d2 = 0; d2 < b3[c2].length; d2++) if (V2(b3[c2][d2], a3)) return "?" === c2 ? h : c2;
              } else if (V2(b3[c2], a3)) return "?" === c2 ? h : c2;
              return a3;
            }, $ = { ME: "4.90", "NT 3.11": "NT3.51", "NT 4.0": "NT4.0", 2e3: "NT 5.0", XP: ["NT 5.1", "NT 5.2"], Vista: "NT 6.0", 7: "NT 6.1", 8: "NT 6.2", 8.1: "NT 6.3", 10: ["NT 6.4", "NT 10.0"], RT: "ARM" }, _2 = { browser: [[/\b(?:crmo|crios)\/([\w\.]+)/i], [r, [o, "Chrome"]], [/edg(?:e|ios|a)?\/([\w\.]+)/i], [r, [o, "Edge"]], [/(opera mini)\/([-\w\.]+)/i, /(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i, /(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i], [o, r], [/opios[\/ ]+([\w\.]+)/i], [r, [o, K2 + " Mini"]], [/\bopr\/([\w\.]+)/i], [r, [o, K2]], [/(kindle)\/([\w\.]+)/i, /(lunascape|maxthon|netfront|jasmine|blazer)[\/ ]?([\w\.]*)/i, /(avant |iemobile|slim)(?:browser)?[\/ ]?([\w\.]*)/i, /(ba?idubrowser)[\/ ]?([\w\.]+)/i, /(?:ms|\()(ie) ([\w\.]+)/i, /(flock|rockmelt|midori|epiphany|silk|skyfire|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|qq|duckduckgo)\/([-\w\.]+)/i, /(heytap|ovi)browser\/([\d\.]+)/i, /(weibo)__([\d\.]+)/i], [o, r], [/(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i], [r, [o, "UC" + D2]], [/microm.+\bqbcore\/([\w\.]+)/i, /\bqbcore\/([\w\.]+).+microm/i], [r, [o, "WeChat(Win) Desktop"]], [/micromessenger\/([\w\.]+)/i], [r, [o, "WeChat"]], [/konqueror\/([\w\.]+)/i], [r, [o, "Konqueror"]], [/trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i], [r, [o, "IE"]], [/ya(?:search)?browser\/([\w\.]+)/i], [r, [o, "Yandex"]], [/(avast|avg)\/([\w\.]+)/i], [[o, /(.+)/, "$1 Secure " + D2], r], [/\bfocus\/([\w\.]+)/i], [r, [o, F2 + " Focus"]], [/\bopt\/([\w\.]+)/i], [r, [o, K2 + " Touch"]], [/coc_coc\w+\/([\w\.]+)/i], [r, [o, "Coc Coc"]], [/dolfin\/([\w\.]+)/i], [r, [o, "Dolphin"]], [/coast\/([\w\.]+)/i], [r, [o, K2 + " Coast"]], [/miuibrowser\/([\w\.]+)/i], [r, [o, "MIUI " + D2]], [/fxios\/([-\w\.]+)/i], [r, [o, F2]], [/\bqihu|(qi?ho?o?|360)browser/i], [[o, "360 " + D2]], [/(oculus|samsung|sailfish|huawei)browser\/([\w\.]+)/i], [[o, /(.+)/, "$1 " + D2], r], [/(comodo_dragon)\/([\w\.]+)/i], [[o, /_/g, " "], r], [/(electron)\/([\w\.]+) safari/i, /(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i, /m?(qqbrowser|baiduboxapp|2345Explorer)[\/ ]?([\w\.]+)/i], [o, r], [/(metasr)[\/ ]?([\w\.]+)/i, /(lbbrowser)/i, /\[(linkedin)app\]/i], [o], [/((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i], [[o, Q2], r], [/(kakao(?:talk|story))[\/ ]([\w\.]+)/i, /(naver)\(.*?(\d+\.[\w\.]+).*\)/i, /safari (line)\/([\w\.]+)/i, /\b(line)\/([\w\.]+)\/iab/i, /(chromium|instagram)[\/ ]([-\w\.]+)/i], [o, r], [/\bgsa\/([\w\.]+) .*safari\//i], [r, [o, "GSA"]], [/musical_ly(?:.+app_?version\/|_)([\w\.]+)/i], [r, [o, "TikTok"]], [/headlesschrome(?:\/([\w\.]+)| )/i], [r, [o, E + " Headless"]], [/ wv\).+(chrome)\/([\w\.]+)/i], [[o, E + " WebView"], r], [/droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i], [r, [o, "Android " + D2]], [/(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i], [o, r], [/version\/([\w\.\,]+) .*mobile\/\w+ (safari)/i], [r, [o, "Mobile Safari"]], [/version\/([\w(\.|\,)]+) .*(mobile ?safari|safari)/i], [r, o], [/webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i], [o, [r, Z, { "1.0": "/8", 1.2: "/1", 1.3: "/3", "2.0": "/412", "2.0.2": "/416", "2.0.3": "/417", "2.0.4": "/419", "?": "/" }]], [/(webkit|khtml)\/([\w\.]+)/i], [o, r], [/(navigator|netscape\d?)\/([-\w\.]+)/i], [[o, "Netscape"], r], [/mobile vr; rv:([\w\.]+)\).+firefox/i], [r, [o, F2 + " Reality"]], [/ekiohf.+(flow)\/([\w\.]+)/i, /(swiftfox)/i, /(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror|klar)[\/ ]?([\w\.\+]+)/i, /(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i, /(firefox)\/([\w\.]+)/i, /(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i, /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i, /(links) \(([\w\.]+)/i, /panasonic;(viera)/i], [o, r], [/(cobalt)\/([\w\.]+)/i], [o, [r, /master.|lts./, ""]]], cpu: [[/(?:(amd|x(?:(?:86|64)[-_])?|wow|win)64)[;\)]/i], [[s, "amd64"]], [/(ia32(?=;))/i], [[s, W2]], [/((?:i[346]|x)86)[;\)]/i], [[s, "ia32"]], [/\b(aarch64|arm(v?8e?l?|_?64))\b/i], [[s, "arm64"]], [/\b(arm(?:v[67])?ht?n?[fl]p?)\b/i], [[s, "armhf"]], [/windows (ce|mobile); ppc;/i], [[s, "arm"]], [/((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i], [[s, /ower/, "", W2]], [/(sun4\w)[;\)]/i], [[s, "sparc"]], [/((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i], [[s, W2]]], device: [[/\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i], [n, [q2, L2], [p, v2]], [/\b((?:s[cgp]h|gt|sm)-\w+|sc[g-]?[\d]+a?|galaxy nexus)/i, /samsung[- ]([-\w]+)/i, /sec-(sgh\w+)/i], [n, [q2, L2], [p, u]], [/(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i], [n, [q2, A], [p, u]], [/\((ipad);[-\w\),; ]+apple/i, /applecoremedia\/[\w\.]+ \((ipad)/i, /\b(ipad)\d\d?,\d\d?[;\]].+ios/i], [n, [q2, A], [p, v2]], [/(macintosh);/i], [n, [q2, A]], [/\b(sh-?[altvz]?\d\d[a-ekm]?)/i], [n, [q2, M], [p, u]], [/\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i], [n, [q2, H], [p, v2]], [/(?:huawei|honor)([-\w ]+)[;\)]/i, /\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][012359c][adn]?)\b(?!.+d\/s)/i], [n, [q2, H], [p, u]], [/\b(poco[\w ]+)(?: bui|\))/i, /\b; (\w+) build\/hm\1/i, /\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i, /\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i, /\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite)?)(?: bui|\))/i], [[n, /_/g, " "], [q2, O2], [p, u]], [/\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i], [[n, /_/g, " "], [q2, O2], [p, v2]], [/; (\w+) bui.+ oppo/i, /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i], [n, [q2, "OPPO"], [p, u]], [/vivo (\w+)(?: bui|\))/i, /\b(v[12]\d{3}\w?[at])(?: bui|;)/i], [n, [q2, "Vivo"], [p, u]], [/\b(rmx[12]\d{3})(?: bui|;|\))/i], [n, [q2, "Realme"], [p, u]], [/\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i, /\bmot(?:orola)?[- ](\w*)/i, /((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i], [n, [q2, J2], [p, u]], [/\b(mz60\d|xoom[2 ]{0,2}) build\//i], [n, [q2, J2], [p, v2]], [/((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i], [n, [q2, "LG"], [p, v2]], [/(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i, /\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i, /\blg-?([\d\w]+) bui/i], [n, [q2, "LG"], [p, u]], [/(ideatab[-\w ]+)/i, /lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i], [n, [q2, "Lenovo"], [p, v2]], [/(?:maemo|nokia).*(n900|lumia \d+)/i, /nokia[-_ ]?([-\w\.]*)/i], [[n, /_/g, " "], [q2, "Nokia"], [p, u]], [/(pixel c)\b/i], [n, [q2, G2], [p, v2]], [/droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i], [n, [q2, G2], [p, u]], [/droid.+ (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i], [n, [q2, N], [p, u]], [/sony tablet [ps]/i, /\b(?:sony)?sgp\w+(?: bui|\))/i], [[n, "Xperia Tablet"], [q2, N], [p, v2]], [/ (kb2005|in20[12]5|be20[12][59])\b/i, /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i], [n, [q2, "OnePlus"], [p, u]], [/(alexa)webm/i, /(kf[a-z]{2}wi|aeo[c-r]{2})( bui|\))/i, /(kf[a-z]+)( bui|\)).+silk\//i], [n, [q2, z2], [p, v2]], [/((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i], [[n, /(.+)/g, "Fire Phone $1"], [q2, z2], [p, u]], [/(playbook);[-\w\),; ]+(rim)/i], [n, q2, [p, v2]], [/\b((?:bb[a-f]|st[hv])100-\d)/i, /\(bb10; (\w+)/i], [n, [q2, C2], [p, u]], [/(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i], [n, [q2, B2], [p, v2]], [/ (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i], [n, [q2, B2], [p, u]], [/(nexus 9)/i], [n, [q2, "HTC"], [p, v2]], [/(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i, /(zte)[- ]([\w ]+?)(?: bui|\/|\))/i, /(alcatel|geeksphone|nexian|panasonic(?!(?:;|\.))|sony(?!-bra))[-_ ]?([-\w]*)/i], [q2, [n, /_/g, " "], [p, u]], [/droid.+; ([ab][1-7]-?[0178a]\d\d?)/i], [n, [q2, "Acer"], [p, v2]], [/droid.+; (m[1-5] note) bui/i, /\bmz-([-\w]{2,})/i], [n, [q2, "Meizu"], [p, u]], [/(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron)[-_ ]?([-\w]*)/i, /(hp) ([\w ]+\w)/i, /(asus)-?(\w+)/i, /(microsoft); (lumia[\w ]+)/i, /(lenovo)[-_ ]?([-\w]+)/i, /(jolla)/i, /(oppo) ?([\w ]+) bui/i], [q2, n, [p, u]], [/(kobo)\s(ereader|touch)/i, /(archos) (gamepad2?)/i, /(hp).+(touchpad(?!.+tablet)|tablet)/i, /(kindle)\/([\w\.]+)/i, /(nook)[\w ]+build\/(\w+)/i, /(dell) (strea[kpr\d ]*[\dko])/i, /(le[- ]+pan)[- ]+(\w{1,9}) bui/i, /(trinity)[- ]*(t\d{3}) bui/i, /(gigaset)[- ]+(q\w{1,9}) bui/i, /(vodafone) ([\w ]+)(?:\)| bui)/i], [q2, n, [p, v2]], [/(surface duo)/i], [n, [q2, I2], [p, v2]], [/droid [\d\.]+; (fp\du?)(?: b|\))/i], [n, [q2, "Fairphone"], [p, u]], [/(u304aa)/i], [n, [q2, "AT&T"], [p, u]], [/\bsie-(\w*)/i], [n, [q2, "Siemens"], [p, u]], [/\b(rct\w+) b/i], [n, [q2, "RCA"], [p, v2]], [/\b(venue[\d ]{2,7}) b/i], [n, [q2, "Dell"], [p, v2]], [/\b(q(?:mv|ta)\w+) b/i], [n, [q2, "Verizon"], [p, v2]], [/\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i], [n, [q2, "Barnes & Noble"], [p, v2]], [/\b(tm\d{3}\w+) b/i], [n, [q2, "NuVision"], [p, v2]], [/\b(k88) b/i], [n, [q2, "ZTE"], [p, v2]], [/\b(nx\d{3}j) b/i], [n, [q2, "ZTE"], [p, u]], [/\b(gen\d{3}) b.+49h/i], [n, [q2, "Swiss"], [p, u]], [/\b(zur\d{3}) b/i], [n, [q2, "Swiss"], [p, v2]], [/\b((zeki)?tb.*\b) b/i], [n, [q2, "Zeki"], [p, v2]], [/\b([yr]\d{2}) b/i, /\b(dragon[- ]+touch |dt)(\w{5}) b/i], [[q2, "Dragon Touch"], n, [p, v2]], [/\b(ns-?\w{0,9}) b/i], [n, [q2, "Insignia"], [p, v2]], [/\b((nxa|next)-?\w{0,9}) b/i], [n, [q2, "NextBook"], [p, v2]], [/\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i], [[q2, "Voice"], n, [p, u]], [/\b(lvtel\-)?(v1[12]) b/i], [[q2, "LvTel"], n, [p, u]], [/\b(ph-1) /i], [n, [q2, "Essential"], [p, u]], [/\b(v(100md|700na|7011|917g).*\b) b/i], [n, [q2, "Envizen"], [p, v2]], [/\b(trio[-\w\. ]+) b/i], [n, [q2, "MachSpeed"], [p, v2]], [/\btu_(1491) b/i], [n, [q2, "Rotor"], [p, v2]], [/(shield[\w ]+) b/i], [n, [q2, "Nvidia"], [p, v2]], [/(sprint) (\w+)/i], [q2, n, [p, u]], [/(kin\.[onetw]{3})/i], [[n, /\./g, " "], [q2, I2], [p, u]], [/droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i], [n, [q2, P2], [p, v2]], [/droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i], [n, [q2, P2], [p, u]], [/smart-tv.+(samsung)/i], [q2, [p, w2]], [/hbbtv.+maple;(\d+)/i], [[n, /^/, "SmartTV"], [q2, L2], [p, w2]], [/(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i], [[q2, "LG"], [p, w2]], [/(apple) ?tv/i], [q2, [n, A + " TV"], [p, w2]], [/crkey/i], [[n, E + "cast"], [q2, G2], [p, w2]], [/droid.+aft(\w)( bui|\))/i], [n, [q2, z2], [p, w2]], [/\(dtv[\);].+(aquos)/i, /(aquos-tv[\w ]+)\)/i], [n, [q2, M], [p, w2]], [/(bravia[\w ]+)( bui|\))/i], [n, [q2, N], [p, w2]], [/(mitv-\w{5}) bui/i], [n, [q2, O2], [p, w2]], [/Hbbtv.*(technisat) (.*);/i], [q2, n, [p, w2]], [/\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i, /hbbtv\/\d+\.\d+\.\d+ +\([\w\+ ]*; *([\w\d][^;]*);([^;]*)/i], [[q2, X], [n, X], [p, w2]], [/\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i], [[p, w2]], [/(ouya)/i, /(nintendo) ([wids3utch]+)/i], [q2, n, [p, t]], [/droid.+; (shield) bui/i], [n, [q2, "Nvidia"], [p, t]], [/(playstation [345portablevi]+)/i], [n, [q2, N], [p, t]], [/\b(xbox(?: one)?(?!; xbox))[\); ]/i], [n, [q2, I2], [p, t]], [/((pebble))app/i], [q2, n, [p, x2]], [/(watch)(?: ?os[,\/]|\d,\d\/)[\d\.]+/i], [n, [q2, A], [p, x2]], [/droid.+; (glass) \d/i], [n, [q2, G2], [p, x2]], [/droid.+; (wt63?0{2,3})\)/i], [n, [q2, P2], [p, x2]], [/(quest( 2| pro)?)/i], [n, [q2, Q2], [p, x2]], [/(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i], [q2, [p, y]], [/(aeobc)\b/i], [n, [q2, z2], [p, y]], [/droid .+?; ([^;]+?)(?: bui|\) applew).+? mobile safari/i], [n, [p, u]], [/droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i], [n, [p, v2]], [/\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i], [[p, v2]], [/(phone|mobile(?:[;\/]| [ \w\/\.]*safari)|pda(?=.+windows ce))/i], [[p, u]], [/(android[-\w\. ]{0,9});.+buil/i], [n, [q2, "Generic"]]], engine: [[/windows.+ edge\/([\w\.]+)/i], [r, [o, "EdgeHTML"]], [/webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i], [r, [o, "Blink"]], [/(presto)\/([\w\.]+)/i, /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i, /ekioh(flow)\/([\w\.]+)/i, /(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i, /(icab)[\/ ]([23]\.[\d\.]+)/i, /\b(libweb)/i], [o, r], [/rv\:([\w\.]{1,9})\b.+(gecko)/i], [r, o]], os: [[/microsoft (windows) (vista|xp)/i], [o, r], [/(windows) nt 6\.2; (arm)/i, /(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i, /(windows)[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i], [o, [r, Z, $]], [/(win(?=3|9|n)|win 9x )([nt\d\.]+)/i], [[o, "Windows"], [r, Z, $]], [/ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i, /ios;fbsv\/([\d\.]+)/i, /cfnetwork\/.+darwin/i], [[r, /_/g, "."], [o, "iOS"]], [/(mac os x) ?([\w\. ]*)/i, /(macintosh|mac_powerpc\b)(?!.+haiku)/i], [[o, S], [r, /_/g, "."]], [/droid ([\w\.]+)\b.+(android[- ]x86|harmonyos)/i], [r, o], [/(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish)[-\/ ]?([\w\.]*)/i, /(blackberry)\w*\/([\w\.]*)/i, /(tizen|kaios)[\/ ]([\w\.]+)/i, /\((series40);/i], [o, r], [/\(bb(10);/i], [r, [o, C2]], [/(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i], [r, [o, "Symbian"]], [/mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i], [r, [o, F2 + " OS"]], [/web0s;.+rt(tv)/i, /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i], [r, [o, "webOS"]], [/watch(?: ?os[,\/]|\d,\d\/)([\d\.]+)/i], [r, [o, "watchOS"]], [/crkey\/([\d\.]+)/i], [r, [o, E + "cast"]], [/(cros) [\w]+(?:\)| ([\w\.]+)\b)/i], [[o, R2], r], [/panasonic;(viera)/i, /(netrange)mmh/i, /(nettv)\/(\d+\.[\w\.]+)/i, /(nintendo|playstation) ([wids345portablevuch]+)/i, /(xbox); +xbox ([^\);]+)/i, /\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i, /(mint)[\/\(\) ]?(\w*)/i, /(mageia|vectorlinux)[; ]/i, /([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i, /(hurd|linux) ?([\w\.]*)/i, /(gnu) ?([\w\.]*)/i, /\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i, /(haiku) (\w+)/i], [o, r], [/(sunos) ?([\w\.\d]*)/i], [[o, "Solaris"], r], [/((?:open)?solaris)[-\/ ]?([\w\.]*)/i, /(aix) ((\d)(?=\.|\)| )[\w\.])*/i, /\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i, /(unix) ?([\w\.]*)/i], [o, r]] }, aa = function(a3, b3) {
              if (typeof a3 === k && (b3 = a3, a3 = h), !(this instanceof aa)) return new aa(a3, b3).getResult();
              var c2 = typeof g2 !== j2 && g2.navigator ? g2.navigator : h, d2 = a3 || (c2 && c2.userAgent ? c2.userAgent : ""), e3 = c2 && c2.userAgentData ? c2.userAgentData : h, f3 = b3 ? T2(_2, b3) : _2, t2 = c2 && c2.userAgent == d2;
              return this.getBrowser = function() {
                var a4, b4 = {};
                return b4[o] = h, b4[r] = h, Y2.call(b4, d2, f3.browser), b4[m] = typeof (a4 = b4[r]) === l ? a4.replace(/[^\d\.]/g, "").split(".")[0] : h, t2 && c2 && c2.brave && typeof c2.brave.isBrave == i && (b4[o] = "Brave"), b4;
              }, this.getCPU = function() {
                var a4 = {};
                return a4[s] = h, Y2.call(a4, d2, f3.cpu), a4;
              }, this.getDevice = function() {
                var a4 = {};
                return a4[q2] = h, a4[n] = h, a4[p] = h, Y2.call(a4, d2, f3.device), t2 && !a4[p] && e3 && e3.mobile && (a4[p] = u), t2 && "Macintosh" == a4[n] && c2 && typeof c2.standalone !== j2 && c2.maxTouchPoints && c2.maxTouchPoints > 2 && (a4[n] = "iPad", a4[p] = v2), a4;
              }, this.getEngine = function() {
                var a4 = {};
                return a4[o] = h, a4[r] = h, Y2.call(a4, d2, f3.engine), a4;
              }, this.getOS = function() {
                var a4 = {};
                return a4[o] = h, a4[r] = h, Y2.call(a4, d2, f3.os), t2 && !a4[o] && e3 && "Unknown" != e3.platform && (a4[o] = e3.platform.replace(/chrome os/i, R2).replace(/macos/i, S)), a4;
              }, this.getResult = function() {
                return { ua: this.getUA(), browser: this.getBrowser(), engine: this.getEngine(), os: this.getOS(), device: this.getDevice(), cpu: this.getCPU() };
              }, this.getUA = function() {
                return d2;
              }, this.setUA = function(a4) {
                return d2 = typeof a4 === l && a4.length > 350 ? X(a4, 350) : a4, this;
              }, this.setUA(d2), this;
            };
            aa.VERSION = "1.0.35", aa.BROWSER = U2([o, r, m]), aa.CPU = U2([s]), aa.DEVICE = U2([n, q2, p, t, u, w2, v2, x2, y]), aa.ENGINE = aa.OS = U2([o, r]), typeof f2 !== j2 ? (e2.exports && (f2 = e2.exports = aa), f2.UAParser = aa) : c.amdO ? void 0 === (d = function() {
              return aa;
            }.call(b2, c, b2, a2)) || (a2.exports = d) : typeof g2 !== j2 && (g2.UAParser = aa);
            var ab = typeof g2 !== j2 && (g2.jQuery || g2.Zepto);
            if (ab && !ab.ua) {
              var ac = new aa();
              ab.ua = ac.getResult(), ab.ua.get = function() {
                return ac.getUA();
              }, ab.ua.set = function(a3) {
                ac.setUA(a3);
                var b3 = ac.getResult();
                for (var c2 in b3) ab.ua[c2] = b3[c2];
              };
            }
          }("object" == typeof window ? window : this);
        } }, f = {};
        function g(a3) {
          var b3 = f[a3];
          if (void 0 !== b3) return b3.exports;
          var c2 = f[a3] = { exports: {} }, d2 = true;
          try {
            e[a3].call(c2.exports, c2, c2.exports, g), d2 = false;
          } finally {
            d2 && delete f[a3];
          }
          return c2.exports;
        }
        g.ab = "//", a2.exports = g(226);
      })();
    }, 182: (a2, b2, c) => {
      (() => {
        "use strict";
        var b3 = { 491: (a3, b4, c2) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.ContextAPI = void 0;
          let d2 = c2(223), e2 = c2(172), f2 = c2(930), g = "context", h = new d2.NoopContextManager();
          class i {
            constructor() {
            }
            static getInstance() {
              return this._instance || (this._instance = new i()), this._instance;
            }
            setGlobalContextManager(a4) {
              return (0, e2.registerGlobal)(g, a4, f2.DiagAPI.instance());
            }
            active() {
              return this._getContextManager().active();
            }
            with(a4, b5, c3, ...d3) {
              return this._getContextManager().with(a4, b5, c3, ...d3);
            }
            bind(a4, b5) {
              return this._getContextManager().bind(a4, b5);
            }
            _getContextManager() {
              return (0, e2.getGlobal)(g) || h;
            }
            disable() {
              this._getContextManager().disable(), (0, e2.unregisterGlobal)(g, f2.DiagAPI.instance());
            }
          }
          b4.ContextAPI = i;
        }, 930: (a3, b4, c2) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.DiagAPI = void 0;
          let d2 = c2(56), e2 = c2(912), f2 = c2(957), g = c2(172);
          class h {
            constructor() {
              function a4(a5) {
                return function(...b6) {
                  let c3 = (0, g.getGlobal)("diag");
                  if (c3) return c3[a5](...b6);
                };
              }
              let b5 = this;
              b5.setLogger = (a5, c3 = { logLevel: f2.DiagLogLevel.INFO }) => {
                var d3, h2, i;
                if (a5 === b5) {
                  let a6 = Error("Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation");
                  return b5.error(null != (d3 = a6.stack) ? d3 : a6.message), false;
                }
                "number" == typeof c3 && (c3 = { logLevel: c3 });
                let j2 = (0, g.getGlobal)("diag"), k = (0, e2.createLogLevelDiagLogger)(null != (h2 = c3.logLevel) ? h2 : f2.DiagLogLevel.INFO, a5);
                if (j2 && !c3.suppressOverrideMessage) {
                  let a6 = null != (i = Error().stack) ? i : "<failed to generate stacktrace>";
                  j2.warn(`Current logger will be overwritten from ${a6}`), k.warn(`Current logger will overwrite one already registered from ${a6}`);
                }
                return (0, g.registerGlobal)("diag", k, b5, true);
              }, b5.disable = () => {
                (0, g.unregisterGlobal)("diag", b5);
              }, b5.createComponentLogger = (a5) => new d2.DiagComponentLogger(a5), b5.verbose = a4("verbose"), b5.debug = a4("debug"), b5.info = a4("info"), b5.warn = a4("warn"), b5.error = a4("error");
            }
            static instance() {
              return this._instance || (this._instance = new h()), this._instance;
            }
          }
          b4.DiagAPI = h;
        }, 653: (a3, b4, c2) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.MetricsAPI = void 0;
          let d2 = c2(660), e2 = c2(172), f2 = c2(930), g = "metrics";
          class h {
            constructor() {
            }
            static getInstance() {
              return this._instance || (this._instance = new h()), this._instance;
            }
            setGlobalMeterProvider(a4) {
              return (0, e2.registerGlobal)(g, a4, f2.DiagAPI.instance());
            }
            getMeterProvider() {
              return (0, e2.getGlobal)(g) || d2.NOOP_METER_PROVIDER;
            }
            getMeter(a4, b5, c3) {
              return this.getMeterProvider().getMeter(a4, b5, c3);
            }
            disable() {
              (0, e2.unregisterGlobal)(g, f2.DiagAPI.instance());
            }
          }
          b4.MetricsAPI = h;
        }, 181: (a3, b4, c2) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.PropagationAPI = void 0;
          let d2 = c2(172), e2 = c2(874), f2 = c2(194), g = c2(277), h = c2(369), i = c2(930), j2 = "propagation", k = new e2.NoopTextMapPropagator();
          class l {
            constructor() {
              this.createBaggage = h.createBaggage, this.getBaggage = g.getBaggage, this.getActiveBaggage = g.getActiveBaggage, this.setBaggage = g.setBaggage, this.deleteBaggage = g.deleteBaggage;
            }
            static getInstance() {
              return this._instance || (this._instance = new l()), this._instance;
            }
            setGlobalPropagator(a4) {
              return (0, d2.registerGlobal)(j2, a4, i.DiagAPI.instance());
            }
            inject(a4, b5, c3 = f2.defaultTextMapSetter) {
              return this._getGlobalPropagator().inject(a4, b5, c3);
            }
            extract(a4, b5, c3 = f2.defaultTextMapGetter) {
              return this._getGlobalPropagator().extract(a4, b5, c3);
            }
            fields() {
              return this._getGlobalPropagator().fields();
            }
            disable() {
              (0, d2.unregisterGlobal)(j2, i.DiagAPI.instance());
            }
            _getGlobalPropagator() {
              return (0, d2.getGlobal)(j2) || k;
            }
          }
          b4.PropagationAPI = l;
        }, 997: (a3, b4, c2) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.TraceAPI = void 0;
          let d2 = c2(172), e2 = c2(846), f2 = c2(139), g = c2(607), h = c2(930), i = "trace";
          class j2 {
            constructor() {
              this._proxyTracerProvider = new e2.ProxyTracerProvider(), this.wrapSpanContext = f2.wrapSpanContext, this.isSpanContextValid = f2.isSpanContextValid, this.deleteSpan = g.deleteSpan, this.getSpan = g.getSpan, this.getActiveSpan = g.getActiveSpan, this.getSpanContext = g.getSpanContext, this.setSpan = g.setSpan, this.setSpanContext = g.setSpanContext;
            }
            static getInstance() {
              return this._instance || (this._instance = new j2()), this._instance;
            }
            setGlobalTracerProvider(a4) {
              let b5 = (0, d2.registerGlobal)(i, this._proxyTracerProvider, h.DiagAPI.instance());
              return b5 && this._proxyTracerProvider.setDelegate(a4), b5;
            }
            getTracerProvider() {
              return (0, d2.getGlobal)(i) || this._proxyTracerProvider;
            }
            getTracer(a4, b5) {
              return this.getTracerProvider().getTracer(a4, b5);
            }
            disable() {
              (0, d2.unregisterGlobal)(i, h.DiagAPI.instance()), this._proxyTracerProvider = new e2.ProxyTracerProvider();
            }
          }
          b4.TraceAPI = j2;
        }, 277: (a3, b4, c2) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.deleteBaggage = b4.setBaggage = b4.getActiveBaggage = b4.getBaggage = void 0;
          let d2 = c2(491), e2 = (0, c2(780).createContextKey)("OpenTelemetry Baggage Key");
          function f2(a4) {
            return a4.getValue(e2) || void 0;
          }
          b4.getBaggage = f2, b4.getActiveBaggage = function() {
            return f2(d2.ContextAPI.getInstance().active());
          }, b4.setBaggage = function(a4, b5) {
            return a4.setValue(e2, b5);
          }, b4.deleteBaggage = function(a4) {
            return a4.deleteValue(e2);
          };
        }, 993: (a3, b4) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.BaggageImpl = void 0;
          class c2 {
            constructor(a4) {
              this._entries = a4 ? new Map(a4) : /* @__PURE__ */ new Map();
            }
            getEntry(a4) {
              let b5 = this._entries.get(a4);
              if (b5) return Object.assign({}, b5);
            }
            getAllEntries() {
              return Array.from(this._entries.entries()).map(([a4, b5]) => [a4, b5]);
            }
            setEntry(a4, b5) {
              let d2 = new c2(this._entries);
              return d2._entries.set(a4, b5), d2;
            }
            removeEntry(a4) {
              let b5 = new c2(this._entries);
              return b5._entries.delete(a4), b5;
            }
            removeEntries(...a4) {
              let b5 = new c2(this._entries);
              for (let c3 of a4) b5._entries.delete(c3);
              return b5;
            }
            clear() {
              return new c2();
            }
          }
          b4.BaggageImpl = c2;
        }, 830: (a3, b4) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.baggageEntryMetadataSymbol = void 0, b4.baggageEntryMetadataSymbol = Symbol("BaggageEntryMetadata");
        }, 369: (a3, b4, c2) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.baggageEntryMetadataFromString = b4.createBaggage = void 0;
          let d2 = c2(930), e2 = c2(993), f2 = c2(830), g = d2.DiagAPI.instance();
          b4.createBaggage = function(a4 = {}) {
            return new e2.BaggageImpl(new Map(Object.entries(a4)));
          }, b4.baggageEntryMetadataFromString = function(a4) {
            return "string" != typeof a4 && (g.error(`Cannot create baggage metadata from unknown type: ${typeof a4}`), a4 = ""), { __TYPE__: f2.baggageEntryMetadataSymbol, toString: () => a4 };
          };
        }, 67: (a3, b4, c2) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.context = void 0, b4.context = c2(491).ContextAPI.getInstance();
        }, 223: (a3, b4, c2) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.NoopContextManager = void 0;
          let d2 = c2(780);
          class e2 {
            active() {
              return d2.ROOT_CONTEXT;
            }
            with(a4, b5, c3, ...d3) {
              return b5.call(c3, ...d3);
            }
            bind(a4, b5) {
              return b5;
            }
            enable() {
              return this;
            }
            disable() {
              return this;
            }
          }
          b4.NoopContextManager = e2;
        }, 780: (a3, b4) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.ROOT_CONTEXT = b4.createContextKey = void 0, b4.createContextKey = function(a4) {
            return Symbol.for(a4);
          };
          class c2 {
            constructor(a4) {
              let b5 = this;
              b5._currentContext = a4 ? new Map(a4) : /* @__PURE__ */ new Map(), b5.getValue = (a5) => b5._currentContext.get(a5), b5.setValue = (a5, d2) => {
                let e2 = new c2(b5._currentContext);
                return e2._currentContext.set(a5, d2), e2;
              }, b5.deleteValue = (a5) => {
                let d2 = new c2(b5._currentContext);
                return d2._currentContext.delete(a5), d2;
              };
            }
          }
          b4.ROOT_CONTEXT = new c2();
        }, 506: (a3, b4, c2) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.diag = void 0, b4.diag = c2(930).DiagAPI.instance();
        }, 56: (a3, b4, c2) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.DiagComponentLogger = void 0;
          let d2 = c2(172);
          class e2 {
            constructor(a4) {
              this._namespace = a4.namespace || "DiagComponentLogger";
            }
            debug(...a4) {
              return f2("debug", this._namespace, a4);
            }
            error(...a4) {
              return f2("error", this._namespace, a4);
            }
            info(...a4) {
              return f2("info", this._namespace, a4);
            }
            warn(...a4) {
              return f2("warn", this._namespace, a4);
            }
            verbose(...a4) {
              return f2("verbose", this._namespace, a4);
            }
          }
          function f2(a4, b5, c3) {
            let e3 = (0, d2.getGlobal)("diag");
            if (e3) return c3.unshift(b5), e3[a4](...c3);
          }
          b4.DiagComponentLogger = e2;
        }, 972: (a3, b4) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.DiagConsoleLogger = void 0;
          let c2 = [{ n: "error", c: "error" }, { n: "warn", c: "warn" }, { n: "info", c: "info" }, { n: "debug", c: "debug" }, { n: "verbose", c: "trace" }];
          class d2 {
            constructor() {
              for (let a4 = 0; a4 < c2.length; a4++) this[c2[a4].n] = /* @__PURE__ */ function(a5) {
                return function(...b5) {
                  if (console) {
                    let c3 = console[a5];
                    if ("function" != typeof c3 && (c3 = console.log), "function" == typeof c3) return c3.apply(console, b5);
                  }
                };
              }(c2[a4].c);
            }
          }
          b4.DiagConsoleLogger = d2;
        }, 912: (a3, b4, c2) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.createLogLevelDiagLogger = void 0;
          let d2 = c2(957);
          b4.createLogLevelDiagLogger = function(a4, b5) {
            function c3(c4, d3) {
              let e2 = b5[c4];
              return "function" == typeof e2 && a4 >= d3 ? e2.bind(b5) : function() {
              };
            }
            return a4 < d2.DiagLogLevel.NONE ? a4 = d2.DiagLogLevel.NONE : a4 > d2.DiagLogLevel.ALL && (a4 = d2.DiagLogLevel.ALL), b5 = b5 || {}, { error: c3("error", d2.DiagLogLevel.ERROR), warn: c3("warn", d2.DiagLogLevel.WARN), info: c3("info", d2.DiagLogLevel.INFO), debug: c3("debug", d2.DiagLogLevel.DEBUG), verbose: c3("verbose", d2.DiagLogLevel.VERBOSE) };
          };
        }, 957: (a3, b4) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.DiagLogLevel = void 0, function(a4) {
            a4[a4.NONE = 0] = "NONE", a4[a4.ERROR = 30] = "ERROR", a4[a4.WARN = 50] = "WARN", a4[a4.INFO = 60] = "INFO", a4[a4.DEBUG = 70] = "DEBUG", a4[a4.VERBOSE = 80] = "VERBOSE", a4[a4.ALL = 9999] = "ALL";
          }(b4.DiagLogLevel || (b4.DiagLogLevel = {}));
        }, 172: (a3, b4, c2) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.unregisterGlobal = b4.getGlobal = b4.registerGlobal = void 0;
          let d2 = c2(200), e2 = c2(521), f2 = c2(130), g = e2.VERSION.split(".")[0], h = Symbol.for(`opentelemetry.js.api.${g}`), i = d2._globalThis;
          b4.registerGlobal = function(a4, b5, c3, d3 = false) {
            var f3;
            let g2 = i[h] = null != (f3 = i[h]) ? f3 : { version: e2.VERSION };
            if (!d3 && g2[a4]) {
              let b6 = Error(`@opentelemetry/api: Attempted duplicate registration of API: ${a4}`);
              return c3.error(b6.stack || b6.message), false;
            }
            if (g2.version !== e2.VERSION) {
              let b6 = Error(`@opentelemetry/api: Registration of version v${g2.version} for ${a4} does not match previously registered API v${e2.VERSION}`);
              return c3.error(b6.stack || b6.message), false;
            }
            return g2[a4] = b5, c3.debug(`@opentelemetry/api: Registered a global for ${a4} v${e2.VERSION}.`), true;
          }, b4.getGlobal = function(a4) {
            var b5, c3;
            let d3 = null == (b5 = i[h]) ? void 0 : b5.version;
            if (d3 && (0, f2.isCompatible)(d3)) return null == (c3 = i[h]) ? void 0 : c3[a4];
          }, b4.unregisterGlobal = function(a4, b5) {
            b5.debug(`@opentelemetry/api: Unregistering a global for ${a4} v${e2.VERSION}.`);
            let c3 = i[h];
            c3 && delete c3[a4];
          };
        }, 130: (a3, b4, c2) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.isCompatible = b4._makeCompatibilityCheck = void 0;
          let d2 = c2(521), e2 = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
          function f2(a4) {
            let b5 = /* @__PURE__ */ new Set([a4]), c3 = /* @__PURE__ */ new Set(), d3 = a4.match(e2);
            if (!d3) return () => false;
            let f3 = { major: +d3[1], minor: +d3[2], patch: +d3[3], prerelease: d3[4] };
            if (null != f3.prerelease) return function(b6) {
              return b6 === a4;
            };
            function g(a5) {
              return c3.add(a5), false;
            }
            return function(a5) {
              if (b5.has(a5)) return true;
              if (c3.has(a5)) return false;
              let d4 = a5.match(e2);
              if (!d4) return g(a5);
              let h = { major: +d4[1], minor: +d4[2], patch: +d4[3], prerelease: d4[4] };
              if (null != h.prerelease || f3.major !== h.major) return g(a5);
              if (0 === f3.major) return f3.minor === h.minor && f3.patch <= h.patch ? (b5.add(a5), true) : g(a5);
              return f3.minor <= h.minor ? (b5.add(a5), true) : g(a5);
            };
          }
          b4._makeCompatibilityCheck = f2, b4.isCompatible = f2(d2.VERSION);
        }, 886: (a3, b4, c2) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.metrics = void 0, b4.metrics = c2(653).MetricsAPI.getInstance();
        }, 901: (a3, b4) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.ValueType = void 0, function(a4) {
            a4[a4.INT = 0] = "INT", a4[a4.DOUBLE = 1] = "DOUBLE";
          }(b4.ValueType || (b4.ValueType = {}));
        }, 102: (a3, b4) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.createNoopMeter = b4.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = b4.NOOP_OBSERVABLE_GAUGE_METRIC = b4.NOOP_OBSERVABLE_COUNTER_METRIC = b4.NOOP_UP_DOWN_COUNTER_METRIC = b4.NOOP_HISTOGRAM_METRIC = b4.NOOP_COUNTER_METRIC = b4.NOOP_METER = b4.NoopObservableUpDownCounterMetric = b4.NoopObservableGaugeMetric = b4.NoopObservableCounterMetric = b4.NoopObservableMetric = b4.NoopHistogramMetric = b4.NoopUpDownCounterMetric = b4.NoopCounterMetric = b4.NoopMetric = b4.NoopMeter = void 0;
          class c2 {
            constructor() {
            }
            createHistogram(a4, c3) {
              return b4.NOOP_HISTOGRAM_METRIC;
            }
            createCounter(a4, c3) {
              return b4.NOOP_COUNTER_METRIC;
            }
            createUpDownCounter(a4, c3) {
              return b4.NOOP_UP_DOWN_COUNTER_METRIC;
            }
            createObservableGauge(a4, c3) {
              return b4.NOOP_OBSERVABLE_GAUGE_METRIC;
            }
            createObservableCounter(a4, c3) {
              return b4.NOOP_OBSERVABLE_COUNTER_METRIC;
            }
            createObservableUpDownCounter(a4, c3) {
              return b4.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
            }
            addBatchObservableCallback(a4, b5) {
            }
            removeBatchObservableCallback(a4) {
            }
          }
          b4.NoopMeter = c2;
          class d2 {
          }
          b4.NoopMetric = d2;
          class e2 extends d2 {
            add(a4, b5) {
            }
          }
          b4.NoopCounterMetric = e2;
          class f2 extends d2 {
            add(a4, b5) {
            }
          }
          b4.NoopUpDownCounterMetric = f2;
          class g extends d2 {
            record(a4, b5) {
            }
          }
          b4.NoopHistogramMetric = g;
          class h {
            addCallback(a4) {
            }
            removeCallback(a4) {
            }
          }
          b4.NoopObservableMetric = h;
          class i extends h {
          }
          b4.NoopObservableCounterMetric = i;
          class j2 extends h {
          }
          b4.NoopObservableGaugeMetric = j2;
          class k extends h {
          }
          b4.NoopObservableUpDownCounterMetric = k, b4.NOOP_METER = new c2(), b4.NOOP_COUNTER_METRIC = new e2(), b4.NOOP_HISTOGRAM_METRIC = new g(), b4.NOOP_UP_DOWN_COUNTER_METRIC = new f2(), b4.NOOP_OBSERVABLE_COUNTER_METRIC = new i(), b4.NOOP_OBSERVABLE_GAUGE_METRIC = new j2(), b4.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = new k(), b4.createNoopMeter = function() {
            return b4.NOOP_METER;
          };
        }, 660: (a3, b4, c2) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.NOOP_METER_PROVIDER = b4.NoopMeterProvider = void 0;
          let d2 = c2(102);
          class e2 {
            getMeter(a4, b5, c3) {
              return d2.NOOP_METER;
            }
          }
          b4.NoopMeterProvider = e2, b4.NOOP_METER_PROVIDER = new e2();
        }, 200: function(a3, b4, c2) {
          var d2 = this && this.__createBinding || (Object.create ? function(a4, b5, c3, d3) {
            void 0 === d3 && (d3 = c3), Object.defineProperty(a4, d3, { enumerable: true, get: function() {
              return b5[c3];
            } });
          } : function(a4, b5, c3, d3) {
            void 0 === d3 && (d3 = c3), a4[d3] = b5[c3];
          }), e2 = this && this.__exportStar || function(a4, b5) {
            for (var c3 in a4) "default" === c3 || Object.prototype.hasOwnProperty.call(b5, c3) || d2(b5, a4, c3);
          };
          Object.defineProperty(b4, "__esModule", { value: true }), e2(c2(46), b4);
        }, 651: (a3, b4) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4._globalThis = void 0, b4._globalThis = "object" == typeof globalThis ? globalThis : c.g;
        }, 46: function(a3, b4, c2) {
          var d2 = this && this.__createBinding || (Object.create ? function(a4, b5, c3, d3) {
            void 0 === d3 && (d3 = c3), Object.defineProperty(a4, d3, { enumerable: true, get: function() {
              return b5[c3];
            } });
          } : function(a4, b5, c3, d3) {
            void 0 === d3 && (d3 = c3), a4[d3] = b5[c3];
          }), e2 = this && this.__exportStar || function(a4, b5) {
            for (var c3 in a4) "default" === c3 || Object.prototype.hasOwnProperty.call(b5, c3) || d2(b5, a4, c3);
          };
          Object.defineProperty(b4, "__esModule", { value: true }), e2(c2(651), b4);
        }, 939: (a3, b4, c2) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.propagation = void 0, b4.propagation = c2(181).PropagationAPI.getInstance();
        }, 874: (a3, b4) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.NoopTextMapPropagator = void 0;
          class c2 {
            inject(a4, b5) {
            }
            extract(a4, b5) {
              return a4;
            }
            fields() {
              return [];
            }
          }
          b4.NoopTextMapPropagator = c2;
        }, 194: (a3, b4) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.defaultTextMapSetter = b4.defaultTextMapGetter = void 0, b4.defaultTextMapGetter = { get(a4, b5) {
            if (null != a4) return a4[b5];
          }, keys: (a4) => null == a4 ? [] : Object.keys(a4) }, b4.defaultTextMapSetter = { set(a4, b5, c2) {
            null != a4 && (a4[b5] = c2);
          } };
        }, 845: (a3, b4, c2) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.trace = void 0, b4.trace = c2(997).TraceAPI.getInstance();
        }, 403: (a3, b4, c2) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.NonRecordingSpan = void 0;
          let d2 = c2(476);
          class e2 {
            constructor(a4 = d2.INVALID_SPAN_CONTEXT) {
              this._spanContext = a4;
            }
            spanContext() {
              return this._spanContext;
            }
            setAttribute(a4, b5) {
              return this;
            }
            setAttributes(a4) {
              return this;
            }
            addEvent(a4, b5) {
              return this;
            }
            setStatus(a4) {
              return this;
            }
            updateName(a4) {
              return this;
            }
            end(a4) {
            }
            isRecording() {
              return false;
            }
            recordException(a4, b5) {
            }
          }
          b4.NonRecordingSpan = e2;
        }, 614: (a3, b4, c2) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.NoopTracer = void 0;
          let d2 = c2(491), e2 = c2(607), f2 = c2(403), g = c2(139), h = d2.ContextAPI.getInstance();
          class i {
            startSpan(a4, b5, c3 = h.active()) {
              var d3;
              if (null == b5 ? void 0 : b5.root) return new f2.NonRecordingSpan();
              let i2 = c3 && (0, e2.getSpanContext)(c3);
              return "object" == typeof (d3 = i2) && "string" == typeof d3.spanId && "string" == typeof d3.traceId && "number" == typeof d3.traceFlags && (0, g.isSpanContextValid)(i2) ? new f2.NonRecordingSpan(i2) : new f2.NonRecordingSpan();
            }
            startActiveSpan(a4, b5, c3, d3) {
              let f3, g2, i2;
              if (arguments.length < 2) return;
              2 == arguments.length ? i2 = b5 : 3 == arguments.length ? (f3 = b5, i2 = c3) : (f3 = b5, g2 = c3, i2 = d3);
              let j2 = null != g2 ? g2 : h.active(), k = this.startSpan(a4, f3, j2), l = (0, e2.setSpan)(j2, k);
              return h.with(l, i2, void 0, k);
            }
          }
          b4.NoopTracer = i;
        }, 124: (a3, b4, c2) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.NoopTracerProvider = void 0;
          let d2 = c2(614);
          class e2 {
            getTracer(a4, b5, c3) {
              return new d2.NoopTracer();
            }
          }
          b4.NoopTracerProvider = e2;
        }, 125: (a3, b4, c2) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.ProxyTracer = void 0;
          let d2 = new (c2(614)).NoopTracer();
          class e2 {
            constructor(a4, b5, c3, d3) {
              this._provider = a4, this.name = b5, this.version = c3, this.options = d3;
            }
            startSpan(a4, b5, c3) {
              return this._getTracer().startSpan(a4, b5, c3);
            }
            startActiveSpan(a4, b5, c3, d3) {
              let e3 = this._getTracer();
              return Reflect.apply(e3.startActiveSpan, e3, arguments);
            }
            _getTracer() {
              if (this._delegate) return this._delegate;
              let a4 = this._provider.getDelegateTracer(this.name, this.version, this.options);
              return a4 ? (this._delegate = a4, this._delegate) : d2;
            }
          }
          b4.ProxyTracer = e2;
        }, 846: (a3, b4, c2) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.ProxyTracerProvider = void 0;
          let d2 = c2(125), e2 = new (c2(124)).NoopTracerProvider();
          class f2 {
            getTracer(a4, b5, c3) {
              var e3;
              return null != (e3 = this.getDelegateTracer(a4, b5, c3)) ? e3 : new d2.ProxyTracer(this, a4, b5, c3);
            }
            getDelegate() {
              var a4;
              return null != (a4 = this._delegate) ? a4 : e2;
            }
            setDelegate(a4) {
              this._delegate = a4;
            }
            getDelegateTracer(a4, b5, c3) {
              var d3;
              return null == (d3 = this._delegate) ? void 0 : d3.getTracer(a4, b5, c3);
            }
          }
          b4.ProxyTracerProvider = f2;
        }, 996: (a3, b4) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.SamplingDecision = void 0, function(a4) {
            a4[a4.NOT_RECORD = 0] = "NOT_RECORD", a4[a4.RECORD = 1] = "RECORD", a4[a4.RECORD_AND_SAMPLED = 2] = "RECORD_AND_SAMPLED";
          }(b4.SamplingDecision || (b4.SamplingDecision = {}));
        }, 607: (a3, b4, c2) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.getSpanContext = b4.setSpanContext = b4.deleteSpan = b4.setSpan = b4.getActiveSpan = b4.getSpan = void 0;
          let d2 = c2(780), e2 = c2(403), f2 = c2(491), g = (0, d2.createContextKey)("OpenTelemetry Context Key SPAN");
          function h(a4) {
            return a4.getValue(g) || void 0;
          }
          function i(a4, b5) {
            return a4.setValue(g, b5);
          }
          b4.getSpan = h, b4.getActiveSpan = function() {
            return h(f2.ContextAPI.getInstance().active());
          }, b4.setSpan = i, b4.deleteSpan = function(a4) {
            return a4.deleteValue(g);
          }, b4.setSpanContext = function(a4, b5) {
            return i(a4, new e2.NonRecordingSpan(b5));
          }, b4.getSpanContext = function(a4) {
            var b5;
            return null == (b5 = h(a4)) ? void 0 : b5.spanContext();
          };
        }, 325: (a3, b4, c2) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.TraceStateImpl = void 0;
          let d2 = c2(564);
          class e2 {
            constructor(a4) {
              this._internalState = /* @__PURE__ */ new Map(), a4 && this._parse(a4);
            }
            set(a4, b5) {
              let c3 = this._clone();
              return c3._internalState.has(a4) && c3._internalState.delete(a4), c3._internalState.set(a4, b5), c3;
            }
            unset(a4) {
              let b5 = this._clone();
              return b5._internalState.delete(a4), b5;
            }
            get(a4) {
              return this._internalState.get(a4);
            }
            serialize() {
              return this._keys().reduce((a4, b5) => (a4.push(b5 + "=" + this.get(b5)), a4), []).join(",");
            }
            _parse(a4) {
              !(a4.length > 512) && (this._internalState = a4.split(",").reverse().reduce((a5, b5) => {
                let c3 = b5.trim(), e3 = c3.indexOf("=");
                if (-1 !== e3) {
                  let f2 = c3.slice(0, e3), g = c3.slice(e3 + 1, b5.length);
                  (0, d2.validateKey)(f2) && (0, d2.validateValue)(g) && a5.set(f2, g);
                }
                return a5;
              }, /* @__PURE__ */ new Map()), this._internalState.size > 32 && (this._internalState = new Map(Array.from(this._internalState.entries()).reverse().slice(0, 32))));
            }
            _keys() {
              return Array.from(this._internalState.keys()).reverse();
            }
            _clone() {
              let a4 = new e2();
              return a4._internalState = new Map(this._internalState), a4;
            }
          }
          b4.TraceStateImpl = e2;
        }, 564: (a3, b4) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.validateValue = b4.validateKey = void 0;
          let c2 = "[_0-9a-z-*/]", d2 = `[a-z]${c2}{0,255}`, e2 = `[a-z0-9]${c2}{0,240}@[a-z]${c2}{0,13}`, f2 = RegExp(`^(?:${d2}|${e2})$`), g = /^[ -~]{0,255}[!-~]$/, h = /,|=/;
          b4.validateKey = function(a4) {
            return f2.test(a4);
          }, b4.validateValue = function(a4) {
            return g.test(a4) && !h.test(a4);
          };
        }, 98: (a3, b4, c2) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.createTraceState = void 0;
          let d2 = c2(325);
          b4.createTraceState = function(a4) {
            return new d2.TraceStateImpl(a4);
          };
        }, 476: (a3, b4, c2) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.INVALID_SPAN_CONTEXT = b4.INVALID_TRACEID = b4.INVALID_SPANID = void 0;
          let d2 = c2(475);
          b4.INVALID_SPANID = "0000000000000000", b4.INVALID_TRACEID = "00000000000000000000000000000000", b4.INVALID_SPAN_CONTEXT = { traceId: b4.INVALID_TRACEID, spanId: b4.INVALID_SPANID, traceFlags: d2.TraceFlags.NONE };
        }, 357: (a3, b4) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.SpanKind = void 0, function(a4) {
            a4[a4.INTERNAL = 0] = "INTERNAL", a4[a4.SERVER = 1] = "SERVER", a4[a4.CLIENT = 2] = "CLIENT", a4[a4.PRODUCER = 3] = "PRODUCER", a4[a4.CONSUMER = 4] = "CONSUMER";
          }(b4.SpanKind || (b4.SpanKind = {}));
        }, 139: (a3, b4, c2) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.wrapSpanContext = b4.isSpanContextValid = b4.isValidSpanId = b4.isValidTraceId = void 0;
          let d2 = c2(476), e2 = c2(403), f2 = /^([0-9a-f]{32})$/i, g = /^[0-9a-f]{16}$/i;
          function h(a4) {
            return f2.test(a4) && a4 !== d2.INVALID_TRACEID;
          }
          function i(a4) {
            return g.test(a4) && a4 !== d2.INVALID_SPANID;
          }
          b4.isValidTraceId = h, b4.isValidSpanId = i, b4.isSpanContextValid = function(a4) {
            return h(a4.traceId) && i(a4.spanId);
          }, b4.wrapSpanContext = function(a4) {
            return new e2.NonRecordingSpan(a4);
          };
        }, 847: (a3, b4) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.SpanStatusCode = void 0, function(a4) {
            a4[a4.UNSET = 0] = "UNSET", a4[a4.OK = 1] = "OK", a4[a4.ERROR = 2] = "ERROR";
          }(b4.SpanStatusCode || (b4.SpanStatusCode = {}));
        }, 475: (a3, b4) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.TraceFlags = void 0, function(a4) {
            a4[a4.NONE = 0] = "NONE", a4[a4.SAMPLED = 1] = "SAMPLED";
          }(b4.TraceFlags || (b4.TraceFlags = {}));
        }, 521: (a3, b4) => {
          Object.defineProperty(b4, "__esModule", { value: true }), b4.VERSION = void 0, b4.VERSION = "1.6.0";
        } }, d = {};
        function e(a3) {
          var c2 = d[a3];
          if (void 0 !== c2) return c2.exports;
          var f2 = d[a3] = { exports: {} }, g = true;
          try {
            b3[a3].call(f2.exports, f2, f2.exports, e), g = false;
          } finally {
            g && delete d[a3];
          }
          return f2.exports;
        }
        e.ab = "//";
        var f = {};
        (() => {
          Object.defineProperty(f, "__esModule", { value: true }), f.trace = f.propagation = f.metrics = f.diag = f.context = f.INVALID_SPAN_CONTEXT = f.INVALID_TRACEID = f.INVALID_SPANID = f.isValidSpanId = f.isValidTraceId = f.isSpanContextValid = f.createTraceState = f.TraceFlags = f.SpanStatusCode = f.SpanKind = f.SamplingDecision = f.ProxyTracerProvider = f.ProxyTracer = f.defaultTextMapSetter = f.defaultTextMapGetter = f.ValueType = f.createNoopMeter = f.DiagLogLevel = f.DiagConsoleLogger = f.ROOT_CONTEXT = f.createContextKey = f.baggageEntryMetadataFromString = void 0;
          var a3 = e(369);
          Object.defineProperty(f, "baggageEntryMetadataFromString", { enumerable: true, get: function() {
            return a3.baggageEntryMetadataFromString;
          } });
          var b4 = e(780);
          Object.defineProperty(f, "createContextKey", { enumerable: true, get: function() {
            return b4.createContextKey;
          } }), Object.defineProperty(f, "ROOT_CONTEXT", { enumerable: true, get: function() {
            return b4.ROOT_CONTEXT;
          } });
          var c2 = e(972);
          Object.defineProperty(f, "DiagConsoleLogger", { enumerable: true, get: function() {
            return c2.DiagConsoleLogger;
          } });
          var d2 = e(957);
          Object.defineProperty(f, "DiagLogLevel", { enumerable: true, get: function() {
            return d2.DiagLogLevel;
          } });
          var g = e(102);
          Object.defineProperty(f, "createNoopMeter", { enumerable: true, get: function() {
            return g.createNoopMeter;
          } });
          var h = e(901);
          Object.defineProperty(f, "ValueType", { enumerable: true, get: function() {
            return h.ValueType;
          } });
          var i = e(194);
          Object.defineProperty(f, "defaultTextMapGetter", { enumerable: true, get: function() {
            return i.defaultTextMapGetter;
          } }), Object.defineProperty(f, "defaultTextMapSetter", { enumerable: true, get: function() {
            return i.defaultTextMapSetter;
          } });
          var j2 = e(125);
          Object.defineProperty(f, "ProxyTracer", { enumerable: true, get: function() {
            return j2.ProxyTracer;
          } });
          var k = e(846);
          Object.defineProperty(f, "ProxyTracerProvider", { enumerable: true, get: function() {
            return k.ProxyTracerProvider;
          } });
          var l = e(996);
          Object.defineProperty(f, "SamplingDecision", { enumerable: true, get: function() {
            return l.SamplingDecision;
          } });
          var m = e(357);
          Object.defineProperty(f, "SpanKind", { enumerable: true, get: function() {
            return m.SpanKind;
          } });
          var n = e(847);
          Object.defineProperty(f, "SpanStatusCode", { enumerable: true, get: function() {
            return n.SpanStatusCode;
          } });
          var o = e(475);
          Object.defineProperty(f, "TraceFlags", { enumerable: true, get: function() {
            return o.TraceFlags;
          } });
          var p = e(98);
          Object.defineProperty(f, "createTraceState", { enumerable: true, get: function() {
            return p.createTraceState;
          } });
          var q2 = e(139);
          Object.defineProperty(f, "isSpanContextValid", { enumerable: true, get: function() {
            return q2.isSpanContextValid;
          } }), Object.defineProperty(f, "isValidTraceId", { enumerable: true, get: function() {
            return q2.isValidTraceId;
          } }), Object.defineProperty(f, "isValidSpanId", { enumerable: true, get: function() {
            return q2.isValidSpanId;
          } });
          var r = e(476);
          Object.defineProperty(f, "INVALID_SPANID", { enumerable: true, get: function() {
            return r.INVALID_SPANID;
          } }), Object.defineProperty(f, "INVALID_TRACEID", { enumerable: true, get: function() {
            return r.INVALID_TRACEID;
          } }), Object.defineProperty(f, "INVALID_SPAN_CONTEXT", { enumerable: true, get: function() {
            return r.INVALID_SPAN_CONTEXT;
          } });
          let s = e(67);
          Object.defineProperty(f, "context", { enumerable: true, get: function() {
            return s.context;
          } });
          let t = e(506);
          Object.defineProperty(f, "diag", { enumerable: true, get: function() {
            return t.diag;
          } });
          let u = e(886);
          Object.defineProperty(f, "metrics", { enumerable: true, get: function() {
            return u.metrics;
          } });
          let v2 = e(939);
          Object.defineProperty(f, "propagation", { enumerable: true, get: function() {
            return v2.propagation;
          } });
          let w2 = e(845);
          Object.defineProperty(f, "trace", { enumerable: true, get: function() {
            return w2.trace;
          } }), f.default = { context: s.context, diag: t.diag, metrics: u.metrics, propagation: v2.propagation, trace: w2.trace };
        })(), a2.exports = f;
      })();
    }, 199: (a2, b2, c) => {
      "use strict";
      c.d(b2, { Q: () => f });
      var d = c(1871);
      let e = /^tuple(?<array>(\[(\d*)\])*)$/;
      function f(a3) {
        let b3 = "", c2 = a3.length;
        for (let f2 = 0; f2 < c2; f2++) b3 += function a4(b4) {
          let c3 = b4.type;
          if (e.test(b4.type) && "components" in b4) {
            c3 = "(";
            let f3 = b4.components.length;
            for (let d2 = 0; d2 < f3; d2++) c3 += a4(b4.components[d2]), d2 < f3 - 1 && (c3 += ", ");
            let g = (0, d.Yv)(e, b4.type);
            return c3 += `)${g?.array || ""}`, a4({ ...b4, type: c3 });
          }
          return ("indexed" in b4 && b4.indexed && (c3 = `${c3} indexed`), b4.name) ? `${c3} ${b4.name}` : c3;
        }(a3[f2]), f2 !== c2 - 1 && (b3 += ", ");
        return b3;
      }
    }, 329: (a2, b2, c) => {
      "use strict";
      c.d(b2, { Fl: () => f, NV: () => g, ii: () => e });
      var d = c(1766);
      class e extends d.C {
        constructor({ offset: a3, position: b3, size: c2 }) {
          super(`Slice ${"start" === b3 ? "starting" : "ending"} at offset "${a3}" is out-of-bounds (size: ${c2}).`, { name: "SliceOffsetOutOfBoundsError" });
        }
      }
      class f extends d.C {
        constructor({ size: a3, targetSize: b3, type: c2 }) {
          super(`${c2.charAt(0).toUpperCase()}${c2.slice(1).toLowerCase()} size (${a3}) exceeds padding size (${b3}).`, { name: "SizeExceedsPaddingSizeError" });
        }
      }
      class g extends d.C {
        constructor({ size: a3, targetSize: b3, type: c2 }) {
          super(`${c2.charAt(0).toUpperCase()}${c2.slice(1).toLowerCase()} is expected to be ${b3} ${c2} long, but is ${a3} ${c2} long.`, { name: "InvalidBytesLengthError" });
        }
      }
    }, 366: (a2, b2, c) => {
      "use strict";
      c.d(b2, { h: () => d });
      let d = c(1534).k;
    }, 436: (a2) => {
      (() => {
        "use strict";
        "undefined" != typeof __nccwpck_require__ && (__nccwpck_require__.ab = "//");
        var b2 = {};
        (() => {
          b2.parse = function(b3, c2) {
            if ("string" != typeof b3) throw TypeError("argument str must be a string");
            for (var e2 = {}, f = b3.split(d), g = (c2 || {}).decode || a3, h = 0; h < f.length; h++) {
              var i = f[h], j2 = i.indexOf("=");
              if (!(j2 < 0)) {
                var k = i.substr(0, j2).trim(), l = i.substr(++j2, i.length).trim();
                '"' == l[0] && (l = l.slice(1, -1)), void 0 == e2[k] && (e2[k] = function(a4, b4) {
                  try {
                    return b4(a4);
                  } catch (b5) {
                    return a4;
                  }
                }(l, g));
              }
            }
            return e2;
          }, b2.serialize = function(a4, b3, d2) {
            var f = d2 || {}, g = f.encode || c;
            if ("function" != typeof g) throw TypeError("option encode is invalid");
            if (!e.test(a4)) throw TypeError("argument name is invalid");
            var h = g(b3);
            if (h && !e.test(h)) throw TypeError("argument val is invalid");
            var i = a4 + "=" + h;
            if (null != f.maxAge) {
              var j2 = f.maxAge - 0;
              if (isNaN(j2) || !isFinite(j2)) throw TypeError("option maxAge is invalid");
              i += "; Max-Age=" + Math.floor(j2);
            }
            if (f.domain) {
              if (!e.test(f.domain)) throw TypeError("option domain is invalid");
              i += "; Domain=" + f.domain;
            }
            if (f.path) {
              if (!e.test(f.path)) throw TypeError("option path is invalid");
              i += "; Path=" + f.path;
            }
            if (f.expires) {
              if ("function" != typeof f.expires.toUTCString) throw TypeError("option expires is invalid");
              i += "; Expires=" + f.expires.toUTCString();
            }
            if (f.httpOnly && (i += "; HttpOnly"), f.secure && (i += "; Secure"), f.sameSite) switch ("string" == typeof f.sameSite ? f.sameSite.toLowerCase() : f.sameSite) {
              case true:
              case "strict":
                i += "; SameSite=Strict";
                break;
              case "lax":
                i += "; SameSite=Lax";
                break;
              case "none":
                i += "; SameSite=None";
                break;
              default:
                throw TypeError("option sameSite is invalid");
            }
            return i;
          };
          var a3 = decodeURIComponent, c = encodeURIComponent, d = /; */, e = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
        })(), a2.exports = b2;
      })();
    }, 460: (a2, b2, c) => {
      "use strict";
      c.d(b2, { d: () => e });
      let d = /* @__PURE__ */ new WeakMap();
      function e(a3, b3) {
        let c2;
        if (!b3) return { pathname: a3 };
        let e2 = d.get(b3);
        e2 || (e2 = b3.map((a4) => a4.toLowerCase()), d.set(b3, e2));
        let f = a3.split("/", 2);
        if (!f[1]) return { pathname: a3 };
        let g = f[1].toLowerCase(), h = e2.indexOf(g);
        return h < 0 ? { pathname: a3 } : (c2 = b3[h], { pathname: a3 = a3.slice(c2.length + 1) || "/", detectedLocale: c2 });
      }
    }, 494: (a2, b2, c) => {
      "use strict";
      c.d(b2, { h: () => o, k: () => q2 });
      var d = c(8863), e = c(8833), f = c(1766), g = c(7116), h = c(9320), i = c(5290), j2 = c(4725), k = c(2847), l = c(5022), m = c(3375), n = c(8620);
      function o(a3, b3) {
        if (a3.length !== b3.length) throw new d.YE({ expectedLength: a3.length, givenLength: b3.length });
        let c2 = p(function({ params: a4, values: b4 }) {
          let c3 = [];
          for (let o2 = 0; o2 < a4.length; o2++) c3.push(function a5({ param: b5, value: c4 }) {
            let o3 = q2(b5.type);
            if (o3) {
              let [e2, f2] = o3;
              return function(b6, { length: c5, param: e3 }) {
                let f3 = null === c5;
                if (!Array.isArray(b6)) throw new d.dm(b6);
                if (!f3 && b6.length !== c5) throw new d.Nc({ expectedLength: c5, givenLength: b6.length, type: `${e3.type}[${c5}]` });
                let g2 = false, h2 = [];
                for (let c6 = 0; c6 < b6.length; c6++) {
                  let d2 = a5({ param: e3, value: b6[c6] });
                  d2.dynamic && (g2 = true), h2.push(d2);
                }
                if (f3 || g2) {
                  let a6 = p(h2);
                  if (f3) {
                    let b7 = (0, m.cK)(h2.length, { size: 32 });
                    return { dynamic: true, encoded: h2.length > 0 ? (0, i.xW)([b7, a6]) : b7 };
                  }
                  if (g2) return { dynamic: true, encoded: a6 };
                }
                return { dynamic: false, encoded: (0, i.xW)(h2.map(({ encoded: a6 }) => a6)) };
              }(c4, { length: e2, param: { ...b5, type: f2 } });
            }
            if ("tuple" === b5.type) return function(b6, { param: c5 }) {
              let d2 = false, e2 = [];
              for (let f2 = 0; f2 < c5.components.length; f2++) {
                let g2 = c5.components[f2], h2 = Array.isArray(b6) ? f2 : g2.name, i2 = a5({ param: g2, value: b6[h2] });
                e2.push(i2), i2.dynamic && (d2 = true);
              }
              return { dynamic: d2, encoded: d2 ? p(e2) : (0, i.xW)(e2.map(({ encoded: a6 }) => a6)) };
            }(c4, { param: b5 });
            if ("address" === b5.type) {
              var r = c4;
              if (!(0, h.P)(r)) throw new e.M({ address: r });
              return { dynamic: false, encoded: (0, j2.db)(r.toLowerCase()) };
            }
            if ("bool" === b5.type) {
              var s = c4;
              if ("boolean" != typeof s) throw new f.C(`Invalid boolean value: "${s}" (type: ${typeof s}). Expected: \`true\` or \`false\`.`);
              return { dynamic: false, encoded: (0, j2.db)((0, m.$P)(s)) };
            }
            if (b5.type.startsWith("uint") || b5.type.startsWith("int")) {
              let a6 = b5.type.startsWith("int"), [, , d2 = "256"] = n.Ge.exec(b5.type) ?? [];
              return function(a7, { signed: b6, size: c5 = 256 }) {
                if ("number" == typeof c5) {
                  let d3 = 2n ** (BigInt(c5) - (b6 ? 1n : 0n)) - 1n, e2 = b6 ? -d3 - 1n : 0n;
                  if (a7 > d3 || a7 < e2) throw new g.Ty({ max: d3.toString(), min: e2.toString(), signed: b6, size: c5 / 8, value: a7.toString() });
                }
                return { dynamic: false, encoded: (0, m.cK)(a7, { size: 32, signed: b6 }) };
              }(c4, { signed: a6, size: Number(d2) });
            }
            if (b5.type.startsWith("bytes")) return function(a6, { param: b6 }) {
              let [, c5] = b6.type.split("bytes"), e2 = (0, k.E)(a6);
              if (!c5) {
                let b7 = a6;
                return e2 % 32 != 0 && (b7 = (0, j2.db)(b7, { dir: "right", size: 32 * Math.ceil((a6.length - 2) / 2 / 32) })), { dynamic: true, encoded: (0, i.xW)([(0, j2.db)((0, m.cK)(e2, { size: 32 })), b7]) };
              }
              if (e2 !== Number.parseInt(c5, 10)) throw new d.gH({ expectedSize: Number.parseInt(c5, 10), value: a6 });
              return { dynamic: false, encoded: (0, j2.db)(a6, { dir: "right" }) };
            }(c4, { param: b5 });
            if ("string" === b5.type) {
              var t = c4;
              let a6 = (0, m.i3)(t), b6 = Math.ceil((0, k.E)(a6) / 32), d2 = [];
              for (let c5 = 0; c5 < b6; c5++) d2.push((0, j2.db)((0, l.di)(a6, 32 * c5, (c5 + 1) * 32), { dir: "right" }));
              return { dynamic: true, encoded: (0, i.xW)([(0, j2.db)((0, m.cK)((0, k.E)(a6), { size: 32 })), ...d2]) };
            }
            throw new d.nK(b5.type, { docsPath: "/docs/contract/encodeAbiParameters" });
          }({ param: a4[o2], value: b4[o2] }));
          return c3;
        }({ params: a3, values: b3 }));
        return 0 === c2.length ? "0x" : c2;
      }
      function p(a3) {
        let b3 = 0;
        for (let c3 = 0; c3 < a3.length; c3++) {
          let { dynamic: d3, encoded: e3 } = a3[c3];
          d3 ? b3 += 32 : b3 += (0, k.E)(e3);
        }
        let c2 = [], d2 = [], e2 = 0;
        for (let f2 = 0; f2 < a3.length; f2++) {
          let { dynamic: g2, encoded: h2 } = a3[f2];
          g2 ? (c2.push((0, m.cK)(b3 + e2, { size: 32 })), d2.push(h2), e2 += (0, k.E)(h2)) : c2.push(h2);
        }
        return (0, i.xW)([...c2, ...d2]);
      }
      function q2(a3) {
        let b3 = a3.match(/^(.*)\[(\d+)?\]$/);
        return b3 ? [b3[2] ? Number(b3[2]) : null, b3[1]] : void 0;
      }
    }, 606: (a2, b2, c) => {
      "use strict";
      function d(a3, { dir: b3 = "left" } = {}) {
        let c2 = "string" == typeof a3 ? a3.replace("0x", "") : a3, e = 0;
        for (let a4 = 0; a4 < c2.length - 1; a4++) if ("0" === c2["left" === b3 ? a4 : c2.length - a4 - 1].toString()) e++;
        else break;
        return (c2 = "left" === b3 ? c2.slice(e) : c2.slice(0, c2.length - e), "string" == typeof a3) ? (1 === c2.length && "right" === b3 && (c2 = `${c2}0`), `0x${c2.length % 2 == 1 ? `0${c2}` : c2}`) : c2;
      }
      c.d(b2, { B: () => d });
    }, 622: (a2, b2, c) => {
      "use strict";
      c.d(b2, { i: () => f });
      var d = c(9456), e = c(2831);
      function f(a3) {
        return /^\/index(\/|$)/.test(a3) && !(0, e.F)(a3) ? "/index" + a3 : "/" === a3 ? "/index" : (0, d.A)(a3);
      }
      c(7502);
    }, 655: (a2, b2, c) => {
      "use strict";
      c.d(b2, { X: () => r });
      var d = c(8512), e = c.n(d), f = c(9904), g = c(7707), h = c(7223), i = c(1699), j2 = c(8826), k = c(6859), l = c(5209);
      class m {
        constructor({ waitUntil: a3, onClose: b3, onTaskError: c2 }) {
          this.workUnitStores = /* @__PURE__ */ new Set(), this.waitUntil = a3, this.onClose = b3, this.onTaskError = c2, this.callbackQueue = new (e())(), this.callbackQueue.pause();
        }
        after(a3) {
          if ((0, g.Q)(a3)) this.waitUntil || n(), this.waitUntil(a3.catch((a4) => this.reportTaskError("promise", a4)));
          else if ("function" == typeof a3) this.addCallback(a3);
          else throw Object.defineProperty(Error("`after()`: Argument must be a promise or a function"), "__NEXT_ERROR_CODE", { value: "E50", enumerable: false, configurable: true });
        }
        addCallback(a3) {
          this.waitUntil || n();
          let b3 = k.FP.getStore();
          b3 && this.workUnitStores.add(b3);
          let c2 = l.Z.getStore(), d2 = c2 ? c2.rootTaskSpawnPhase : null == b3 ? void 0 : b3.phase;
          this.runCallbacksOnClosePromise || (this.runCallbacksOnClosePromise = this.runCallbacksOnClose(), this.waitUntil(this.runCallbacksOnClosePromise));
          let e2 = (0, j2.cg)(async () => {
            try {
              await l.Z.run({ rootTaskSpawnPhase: d2 }, () => a3());
            } catch (a4) {
              this.reportTaskError("function", a4);
            }
          });
          this.callbackQueue.add(e2);
        }
        async runCallbacksOnClose() {
          return await new Promise((a3) => this.onClose(a3)), this.runCallbacks();
        }
        async runCallbacks() {
          if (0 === this.callbackQueue.size) return;
          for (let a4 of this.workUnitStores) a4.phase = "after";
          let a3 = h.J.getStore();
          if (!a3) throw Object.defineProperty(new f.z("Missing workStore in AfterContext.runCallbacks"), "__NEXT_ERROR_CODE", { value: "E547", enumerable: false, configurable: true });
          return (0, i.Y)(a3, () => (this.callbackQueue.start(), this.callbackQueue.onIdle()));
        }
        reportTaskError(a3, b3) {
          if (console.error("promise" === a3 ? "A promise passed to `after()` rejected:" : "An error occurred in a function passed to `after()`:", b3), this.onTaskError) try {
            null == this.onTaskError || this.onTaskError.call(this, b3);
          } catch (a4) {
            console.error(Object.defineProperty(new f.z("`onTaskError` threw while handling an error thrown from an `after` task", { cause: a4 }), "__NEXT_ERROR_CODE", { value: "E569", enumerable: false, configurable: true }));
          }
        }
      }
      function n() {
        throw Object.defineProperty(Error("`after()` will not work correctly, because `waitUntil` is not available in the current environment."), "__NEXT_ERROR_CODE", { value: "E91", enumerable: false, configurable: true });
      }
      var o = c(4153), p = c(7329), q2 = c(2398);
      function r({ page: a3, renderOpts: b3, isPrefetchRequest: c2, buildId: d2, previouslyRevalidatedTags: e2 }) {
        let f2 = !b3.shouldWaitOnAllReady && !b3.supportsDynamicResponse && !b3.isDraftMode && !b3.isPossibleServerAction, g2 = b3.dev ?? false, h2 = g2 || f2 && (!!process.env.NEXT_DEBUG_BUILD || "1" === process.env.NEXT_SSG_FETCH_METRICS), i2 = { isStaticGeneration: f2, page: a3, route: (0, o.Y)(a3), incrementalCache: b3.incrementalCache || globalThis.__incrementalCache, cacheLifeProfiles: b3.cacheLifeProfiles, isRevalidate: b3.isRevalidate, isBuildTimePrerendering: b3.nextExport, hasReadableErrorStacks: b3.hasReadableErrorStacks, fetchCache: b3.fetchCache, isOnDemandRevalidate: b3.isOnDemandRevalidate, isDraftMode: b3.isDraftMode, isPrefetchRequest: c2, buildId: d2, reactLoadableManifest: (null == b3 ? void 0 : b3.reactLoadableManifest) || {}, assetPrefix: (null == b3 ? void 0 : b3.assetPrefix) || "", afterContext: function(a4) {
          let { waitUntil: b4, onClose: c3, onAfterTaskError: d3 } = a4;
          return new m({ waitUntil: b4, onClose: c3, onTaskError: d3 });
        }(b3), cacheComponentsEnabled: b3.experimental.cacheComponents, dev: g2, previouslyRevalidatedTags: e2, refreshTagsByCacheKind: function() {
          let a4 = /* @__PURE__ */ new Map(), b4 = (0, q2.fs)();
          if (b4) for (let [c3, d3] of b4) "refreshTags" in d3 && a4.set(c3, (0, p.a)(async () => d3.refreshTags()));
          return a4;
        }(), runInCleanSnapshot: (0, j2.$p)(), shouldTrackFetchMetrics: h2 };
        return b3.store = i2, i2;
      }
    }, 830: (a2, b2, c) => {
      "use strict";
      c.d(b2, { p: () => k });
      var d = c(5290), e = c(494), f = c(8863), g = c(4430), h = c(9382), i = c(9965);
      let j2 = "/docs/contract/encodeFunctionData";
      function k(a3) {
        let { args: b3 } = a3, { abi: c2, functionName: k2 } = (() => {
          if (1 === a3.abi.length && a3.functionName?.startsWith("0x")) return a3;
          let { abi: b4, args: c3, functionName: d2 } = a3, e2 = b4[0];
          if (d2) {
            let a4 = (0, i.iY)({ abi: b4, args: c3, name: d2 });
            if (!a4) throw new f.Iz(d2, { docsPath: j2 });
            e2 = a4;
          }
          if ("function" !== e2.type) throw new f.Iz(void 0, { docsPath: j2 });
          return { abi: [e2], functionName: (0, g.V)((0, h.B)(e2)) };
        })(), l = c2[0], m = "inputs" in l && l.inputs ? (0, e.h)(l.inputs, b3 ?? []) : void 0;
        return (0, d.aP)([k2, m ?? "0x"]);
      }
    }, 857: (a2, b2, c) => {
      "use strict";
      c.d(b2, { mc: () => t });
      let { env: d, stdout: e } = (null == (o = globalThis) ? void 0 : o.process) ?? {}, f = d && !d.NO_COLOR && (d.FORCE_COLOR || (null == e ? void 0 : e.isTTY) && !d.CI && "dumb" !== d.TERM), g = (a3, b3, c2, d2) => {
        let e2 = a3.substring(0, d2) + c2, f2 = a3.substring(d2 + b3.length), h2 = f2.indexOf(b3);
        return ~h2 ? e2 + g(f2, b3, c2, h2) : e2 + f2;
      }, h = (a3, b3, c2 = a3) => f ? (d2) => {
        let e2 = "" + d2, f2 = e2.indexOf(b3, a3.length);
        return ~f2 ? a3 + g(e2, b3, c2, f2) + b3 : a3 + e2 + b3;
      } : String, i = h("\x1B[1m", "\x1B[22m", "\x1B[22m\x1B[1m");
      h("\x1B[2m", "\x1B[22m", "\x1B[22m\x1B[2m"), h("\x1B[3m", "\x1B[23m"), h("\x1B[4m", "\x1B[24m"), h("\x1B[7m", "\x1B[27m"), h("\x1B[8m", "\x1B[28m"), h("\x1B[9m", "\x1B[29m"), h("\x1B[30m", "\x1B[39m");
      let j2 = h("\x1B[31m", "\x1B[39m"), k = h("\x1B[32m", "\x1B[39m"), l = h("\x1B[33m", "\x1B[39m");
      h("\x1B[34m", "\x1B[39m");
      let m = h("\x1B[35m", "\x1B[39m");
      h("\x1B[38;2;173;127;168m", "\x1B[39m"), h("\x1B[36m", "\x1B[39m");
      let n = h("\x1B[37m", "\x1B[39m");
      h("\x1B[90m", "\x1B[39m"), h("\x1B[40m", "\x1B[49m"), h("\x1B[41m", "\x1B[49m"), h("\x1B[42m", "\x1B[49m"), h("\x1B[43m", "\x1B[49m"), h("\x1B[44m", "\x1B[49m"), h("\x1B[45m", "\x1B[49m"), h("\x1B[46m", "\x1B[49m"), h("\x1B[47m", "\x1B[49m");
      var o, p = c(4055);
      let q2 = { wait: n(i("\u25CB")), error: j2(i("\u2A2F")), warn: l(i("\u26A0")), ready: "\u25B2", info: n(i(" ")), event: k(i("\u2713")), trace: m(i("\xBB")) }, r = { log: "log", warn: "warn", error: "error" }, s = new p.q(1e4, (a3) => a3.length);
      function t(...a3) {
        let b3 = a3.join(" ");
        s.has(b3) || (s.set(b3, b3), function(...a4) {
          !function(a5, ...b4) {
            ("" === b4[0] || void 0 === b4[0]) && 1 === b4.length && b4.shift();
            let c2 = a5 in r ? r[a5] : "log", d2 = q2[a5];
            0 === b4.length ? console[c2]("") : 1 === b4.length && "string" == typeof b4[0] ? console[c2](" " + d2 + " " + b4[0]) : console[c2](" " + d2, ...b4);
          }("warn", ...a4);
        }(...a3));
      }
    }, 882: (a2, b2, c) => {
      "use strict";
      c.d(b2, { Gx: () => f, Ic: () => g, M_: () => h });
      var d = c(3173), e = c(1212);
      function f(a3, b3) {
        let c2 = d.o.from(a3.headers);
        return { isOnDemandRevalidate: c2.get(e.kz) === b3.previewModeId, revalidateOnlyGenerated: c2.has(e.r4) };
      }
      c(9414), c(4570);
      let g = "__prerender_bypass";
      Symbol("__next_preview_data");
      let h = Symbol(g);
    }, 1087: (a2, b2, c) => {
      "use strict";
      a2.exports = c(3911);
    }, 1130: (a2, b2, c) => {
      "use strict";
      function d(a3) {
        let b3 = a3.indexOf("#"), c2 = a3.indexOf("?"), d2 = c2 > -1 && (b3 < 0 || c2 < b3);
        return d2 || b3 > -1 ? { pathname: a3.substring(0, d2 ? c2 : b3), query: d2 ? a3.substring(c2, b3 > -1 ? b3 : void 0) : "", hash: b3 > -1 ? a3.slice(b3) : "" } : { pathname: a3, query: "", hash: "" };
      }
      c.d(b2, { R: () => d });
    }, 1212: (a2, b2, c) => {
      "use strict";
      c.d(b2, { AA: () => e, AR: () => v2, EP: () => n, RM: () => l, VC: () => o, c1: () => q2, gW: () => t, h: () => f, j9: () => d, kz: () => g, mH: () => j2, o7: () => r, pu: () => i, qF: () => u, qq: () => s, r4: () => h, tz: () => k, vS: () => p, x3: () => m });
      let d = "text/html; charset=utf-8", e = "nxtP", f = "nxtI", g = "x-prerender-revalidate", h = "x-prerender-revalidate-if-generated", i = ".prefetch.rsc", j2 = ".segments", k = ".segment.rsc", l = ".rsc", m = ".json", n = ".meta", o = "x-next-cache-tags", p = "x-next-revalidated-tags", q2 = "x-next-revalidate-tag-token", r = 128, s = 256, t = "_N_T_", u = 31536e3, v2 = 4294967294, w2 = { shared: "shared", reactServerComponents: "rsc", serverSideRendering: "ssr", actionBrowser: "action-browser", apiNode: "api-node", apiEdge: "api-edge", middleware: "middleware", instrument: "instrument", edgeAsset: "edge-asset", appPagesBrowser: "app-pages-browser", pagesDirBrowser: "pages-dir-browser", pagesDirEdge: "pages-dir-edge", pagesDirNode: "pages-dir-node" };
      ({ ...w2, GROUP: { builtinReact: [w2.reactServerComponents, w2.actionBrowser], serverOnly: [w2.reactServerComponents, w2.actionBrowser, w2.instrument, w2.middleware], neutralTarget: [w2.apiNode, w2.apiEdge], clientOnly: [w2.serverSideRendering, w2.appPagesBrowser], bundled: [w2.reactServerComponents, w2.actionBrowser, w2.serverSideRendering, w2.appPagesBrowser, w2.shared, w2.instrument, w2.middleware], appPages: [w2.reactServerComponents, w2.serverSideRendering, w2.appPagesBrowser, w2.actionBrowser] } });
    }, 1347: (a2, b2, c) => {
      "use strict";
      var d = c(8619), e = c(1087), f = Symbol.for("react.element"), g = Symbol.for("react.transitional.element"), h = Symbol.for("react.fragment"), i = Symbol.for("react.context"), j2 = Symbol.for("react.forward_ref"), k = Symbol.for("react.suspense"), l = Symbol.for("react.suspense_list"), m = Symbol.for("react.memo"), n = Symbol.for("react.lazy"), o = Symbol.for("react.memo_cache_sentinel");
      Symbol.for("react.postpone");
      var p = Symbol.iterator;
      function q2(a10) {
        return null === a10 || "object" != typeof a10 ? null : "function" == typeof (a10 = p && a10[p] || a10["@@iterator"]) ? a10 : null;
      }
      var r = Symbol.asyncIterator;
      function s(a10) {
        setTimeout(function() {
          throw a10;
        });
      }
      var t = Promise, u = "function" == typeof queueMicrotask ? queueMicrotask : function(a10) {
        t.resolve(null).then(a10).catch(s);
      }, v2 = null, w2 = 0;
      function x2(a10, b3) {
        if (0 !== b3.byteLength) if (2048 < b3.byteLength) 0 < w2 && (a10.enqueue(new Uint8Array(v2.buffer, 0, w2)), v2 = new Uint8Array(2048), w2 = 0), a10.enqueue(b3);
        else {
          var c2 = v2.length - w2;
          c2 < b3.byteLength && (0 === c2 ? a10.enqueue(v2) : (v2.set(b3.subarray(0, c2), w2), a10.enqueue(v2), b3 = b3.subarray(c2)), v2 = new Uint8Array(2048), w2 = 0), v2.set(b3, w2), w2 += b3.byteLength;
        }
        return true;
      }
      var y = new TextEncoder();
      function z2(a10) {
        return y.encode(a10);
      }
      function A(a10) {
        return a10.byteLength;
      }
      function B2(a10, b3) {
        "function" == typeof a10.error ? a10.error(b3) : a10.close();
      }
      var C2 = Symbol.for("react.client.reference"), D2 = Symbol.for("react.server.reference");
      function E(a10, b3, c2) {
        return Object.defineProperties(a10, { $$typeof: { value: C2 }, $$id: { value: b3 }, $$async: { value: c2 } });
      }
      var F2 = Function.prototype.bind, G2 = Array.prototype.slice;
      function H() {
        var a10 = F2.apply(this, arguments);
        if (this.$$typeof === D2) {
          var b3 = G2.call(arguments, 1);
          return Object.defineProperties(a10, { $$typeof: { value: D2 }, $$id: { value: this.$$id }, $$bound: b3 = { value: this.$$bound ? this.$$bound.concat(b3) : b3 }, bind: { value: H, configurable: true } });
        }
        return a10;
      }
      var I2 = { value: function() {
        return "function () { [omitted code] }";
      }, configurable: true, writable: true }, J2 = Promise.prototype, K2 = { get: function(a10, b3) {
        switch (b3) {
          case "$$typeof":
            return a10.$$typeof;
          case "$$id":
            return a10.$$id;
          case "$$async":
            return a10.$$async;
          case "name":
            return a10.name;
          case "displayName":
          case "defaultProps":
          case "_debugInfo":
          case "toJSON":
            return;
          case Symbol.toPrimitive:
            return Object.prototype[Symbol.toPrimitive];
          case Symbol.toStringTag:
            return Object.prototype[Symbol.toStringTag];
          case "Provider":
            throw Error("Cannot render a Client Context Provider on the Server. Instead, you can export a Client Component wrapper that itself renders a Client Context Provider.");
          case "then":
            throw Error("Cannot await or return from a thenable. You cannot await a client module from a server component.");
        }
        throw Error("Cannot access " + String(a10.name) + "." + String(b3) + " on the server. You cannot dot into a client module from a server component. You can only pass the imported name through.");
      }, set: function() {
        throw Error("Cannot assign to a client module from a server module.");
      } };
      function L2(a10, b3) {
        switch (b3) {
          case "$$typeof":
            return a10.$$typeof;
          case "$$id":
            return a10.$$id;
          case "$$async":
            return a10.$$async;
          case "name":
            return a10.name;
          case "defaultProps":
          case "_debugInfo":
          case "toJSON":
            return;
          case Symbol.toPrimitive:
            return Object.prototype[Symbol.toPrimitive];
          case Symbol.toStringTag:
            return Object.prototype[Symbol.toStringTag];
          case "__esModule":
            var c2 = a10.$$id;
            return a10.default = E(function() {
              throw Error("Attempted to call the default export of " + c2 + " from the server but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
            }, a10.$$id + "#", a10.$$async), true;
          case "then":
            if (a10.then) return a10.then;
            if (a10.$$async) return;
            var d2 = E({}, a10.$$id, true), e2 = new Proxy(d2, M);
            return a10.status = "fulfilled", a10.value = e2, a10.then = E(function(a11) {
              return Promise.resolve(a11(e2));
            }, a10.$$id + "#then", false);
        }
        if ("symbol" == typeof b3) throw Error("Cannot read Symbol exports. Only named exports are supported on a client module imported on the server.");
        return (d2 = a10[b3]) || (Object.defineProperty(d2 = E(function() {
          throw Error("Attempted to call " + String(b3) + "() from the server but " + String(b3) + " is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
        }, a10.$$id + "#" + b3, a10.$$async), "name", { value: b3 }), d2 = a10[b3] = new Proxy(d2, K2)), d2;
      }
      var M = { get: function(a10, b3) {
        return L2(a10, b3);
      }, getOwnPropertyDescriptor: function(a10, b3) {
        var c2 = Object.getOwnPropertyDescriptor(a10, b3);
        return c2 || (c2 = { value: L2(a10, b3), writable: false, configurable: false, enumerable: false }, Object.defineProperty(a10, b3, c2)), c2;
      }, getPrototypeOf: function() {
        return J2;
      }, set: function() {
        throw Error("Cannot assign to a client module from a server module.");
      } }, N = d.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, O2 = N.d;
      function P2(a10) {
        if (null == a10) return null;
        var b3, c2 = false, d2 = {};
        for (b3 in a10) null != a10[b3] && (c2 = true, d2[b3] = a10[b3]);
        return c2 ? d2 : null;
      }
      N.d = { f: O2.f, r: O2.r, D: function(a10) {
        if ("string" == typeof a10 && a10) {
          var b3 = as();
          if (b3) {
            var c2 = b3.hints, d2 = "D|" + a10;
            c2.has(d2) || (c2.add(d2), au(b3, "D", a10));
          } else O2.D(a10);
        }
      }, C: function(a10, b3) {
        if ("string" == typeof a10) {
          var c2 = as();
          if (c2) {
            var d2 = c2.hints, e2 = "C|" + (null == b3 ? "null" : b3) + "|" + a10;
            d2.has(e2) || (d2.add(e2), "string" == typeof b3 ? au(c2, "C", [a10, b3]) : au(c2, "C", a10));
          } else O2.C(a10, b3);
        }
      }, L: function(a10, b3, c2) {
        if ("string" == typeof a10) {
          var d2 = as();
          if (d2) {
            var e2 = d2.hints, f2 = "L";
            if ("image" === b3 && c2) {
              var g2 = c2.imageSrcSet, h2 = c2.imageSizes, i2 = "";
              "string" == typeof g2 && "" !== g2 ? (i2 += "[" + g2 + "]", "string" == typeof h2 && (i2 += "[" + h2 + "]")) : i2 += "[][]" + a10, f2 += "[image]" + i2;
            } else f2 += "[" + b3 + "]" + a10;
            e2.has(f2) || (e2.add(f2), (c2 = P2(c2)) ? au(d2, "L", [a10, b3, c2]) : au(d2, "L", [a10, b3]));
          } else O2.L(a10, b3, c2);
        }
      }, m: function(a10, b3) {
        if ("string" == typeof a10) {
          var c2 = as();
          if (c2) {
            var d2 = c2.hints, e2 = "m|" + a10;
            if (d2.has(e2)) return;
            return d2.add(e2), (b3 = P2(b3)) ? au(c2, "m", [a10, b3]) : au(c2, "m", a10);
          }
          O2.m(a10, b3);
        }
      }, X: function(a10, b3) {
        if ("string" == typeof a10) {
          var c2 = as();
          if (c2) {
            var d2 = c2.hints, e2 = "X|" + a10;
            if (d2.has(e2)) return;
            return d2.add(e2), (b3 = P2(b3)) ? au(c2, "X", [a10, b3]) : au(c2, "X", a10);
          }
          O2.X(a10, b3);
        }
      }, S: function(a10, b3, c2) {
        if ("string" == typeof a10) {
          var d2 = as();
          if (d2) {
            var e2 = d2.hints, f2 = "S|" + a10;
            if (e2.has(f2)) return;
            return e2.add(f2), (c2 = P2(c2)) ? au(d2, "S", [a10, "string" == typeof b3 ? b3 : 0, c2]) : "string" == typeof b3 ? au(d2, "S", [a10, b3]) : au(d2, "S", a10);
          }
          O2.S(a10, b3, c2);
        }
      }, M: function(a10, b3) {
        if ("string" == typeof a10) {
          var c2 = as();
          if (c2) {
            var d2 = c2.hints, e2 = "M|" + a10;
            if (d2.has(e2)) return;
            return d2.add(e2), (b3 = P2(b3)) ? au(c2, "M", [a10, b3]) : au(c2, "M", a10);
          }
          O2.M(a10, b3);
        }
      } };
      var Q2 = "function" == typeof AsyncLocalStorage, R2 = Q2 ? new AsyncLocalStorage() : null, S = Symbol.for("react.temporary.reference"), T2 = { get: function(a10, b3) {
        switch (b3) {
          case "$$typeof":
            return a10.$$typeof;
          case "name":
          case "displayName":
          case "defaultProps":
          case "_debugInfo":
          case "toJSON":
            return;
          case Symbol.toPrimitive:
            return Object.prototype[Symbol.toPrimitive];
          case Symbol.toStringTag:
            return Object.prototype[Symbol.toStringTag];
          case "Provider":
            throw Error("Cannot render a Client Context Provider on the Server. Instead, you can export a Client Component wrapper that itself renders a Client Context Provider.");
          case "then":
            return;
        }
        throw Error("Cannot access " + String(b3) + " on the server. You cannot dot into a temporary client reference from a server component. You can only pass the value through to the client.");
      }, set: function() {
        throw Error("Cannot assign to a temporary client reference from a server module.");
      } };
      function U2() {
      }
      var V2 = Error("Suspense Exception: This is not a real error! It's an implementation detail of `use` to interrupt the current render. You must either rethrow it immediately, or move the `use` call outside of the `try/catch` block. Capturing without rethrowing will lead to unexpected behavior.\n\nTo handle async errors, wrap your component in an error boundary, or call the promise's `.catch` method and pass the result to `use`."), W2 = null;
      function X() {
        if (null === W2) throw Error("Expected a suspended thenable. This is a bug in React. Please file an issue.");
        var a10 = W2;
        return W2 = null, a10;
      }
      var Y2 = null, Z = 0, $ = null;
      function _2() {
        var a10 = $ || [];
        return $ = null, a10;
      }
      var aa = { readContext: ad, use: function(a10) {
        if (null !== a10 && "object" == typeof a10 || "function" == typeof a10) {
          if ("function" == typeof a10.then) {
            var b3 = Z;
            Z += 1, null === $ && ($ = []);
            var c2 = $, d2 = a10, e2 = b3;
            switch (void 0 === (e2 = c2[e2]) ? c2.push(d2) : e2 !== d2 && (d2.then(U2, U2), d2 = e2), d2.status) {
              case "fulfilled":
                return d2.value;
              case "rejected":
                throw d2.reason;
              default:
                switch ("string" == typeof d2.status ? d2.then(U2, U2) : ((c2 = d2).status = "pending", c2.then(function(a11) {
                  if ("pending" === d2.status) {
                    var b4 = d2;
                    b4.status = "fulfilled", b4.value = a11;
                  }
                }, function(a11) {
                  if ("pending" === d2.status) {
                    var b4 = d2;
                    b4.status = "rejected", b4.reason = a11;
                  }
                })), d2.status) {
                  case "fulfilled":
                    return d2.value;
                  case "rejected":
                    throw d2.reason;
                }
                throw W2 = d2, V2;
            }
          }
          a10.$$typeof === i && ad();
        }
        if (a10.$$typeof === C2) {
          if (null != a10.value && a10.value.$$typeof === i) throw Error("Cannot read a Client Context from a Server Component.");
          throw Error("Cannot use() an already resolved Client Reference.");
        }
        throw Error("An unsupported type was passed to use(): " + String(a10));
      }, useCallback: function(a10) {
        return a10;
      }, useContext: ad, useEffect: ab, useImperativeHandle: ab, useLayoutEffect: ab, useInsertionEffect: ab, useMemo: function(a10) {
        return a10();
      }, useReducer: ab, useRef: ab, useState: ab, useDebugValue: function() {
      }, useDeferredValue: ab, useTransition: ab, useSyncExternalStore: ab, useId: function() {
        if (null === Y2) throw Error("useId can only be used while React is rendering");
        var a10 = Y2.identifierCount++;
        return "_" + Y2.identifierPrefix + "S_" + a10.toString(32) + "_";
      }, useHostTransitionStatus: ab, useFormState: ab, useActionState: ab, useOptimistic: ab, useMemoCache: function(a10) {
        for (var b3 = Array(a10), c2 = 0; c2 < a10; c2++) b3[c2] = o;
        return b3;
      }, useCacheRefresh: function() {
        return ac;
      } };
      function ab() {
        throw Error("This Hook is not supported in Server Components.");
      }
      function ac() {
        throw Error("Refreshing the cache is not supported in Server Components.");
      }
      function ad() {
        throw Error("Cannot read a Client Context from a Server Component.");
      }
      var ae2 = { getCacheForType: function(a10) {
        var b3 = (b3 = as()) ? b3.cache : /* @__PURE__ */ new Map(), c2 = b3.get(a10);
        return void 0 === c2 && (c2 = a10(), b3.set(a10, c2)), c2;
      }, cacheSignal: function() {
        var a10 = as();
        return a10 ? a10.cacheController.signal : null;
      } }, af = e.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
      if (!af) throw Error('The "react" package in this environment is not configured correctly. The "react-server" condition must be enabled in any environment that runs React Server Components.');
      var ag = Array.isArray, ah = Object.getPrototypeOf;
      function ai(a10) {
        return (a10 = Object.prototype.toString.call(a10)).slice(8, a10.length - 1);
      }
      function aj(a10) {
        switch (typeof a10) {
          case "string":
            return JSON.stringify(10 >= a10.length ? a10 : a10.slice(0, 10) + "...");
          case "object":
            if (ag(a10)) return "[...]";
            if (null !== a10 && a10.$$typeof === ak) return "client";
            return "Object" === (a10 = ai(a10)) ? "{...}" : a10;
          case "function":
            return a10.$$typeof === ak ? "client" : (a10 = a10.displayName || a10.name) ? "function " + a10 : "function";
          default:
            return String(a10);
        }
      }
      var ak = Symbol.for("react.client.reference");
      function al(a10, b3) {
        var c2 = ai(a10);
        if ("Object" !== c2 && "Array" !== c2) return c2;
        c2 = -1;
        var d2 = 0;
        if (ag(a10)) {
          for (var e2 = "[", f2 = 0; f2 < a10.length; f2++) {
            0 < f2 && (e2 += ", ");
            var h2 = a10[f2];
            h2 = "object" == typeof h2 && null !== h2 ? al(h2) : aj(h2), "" + f2 === b3 ? (c2 = e2.length, d2 = h2.length, e2 += h2) : e2 = 10 > h2.length && 40 > e2.length + h2.length ? e2 + h2 : e2 + "...";
          }
          e2 += "]";
        } else if (a10.$$typeof === g) e2 = "<" + function a11(b4) {
          if ("string" == typeof b4) return b4;
          switch (b4) {
            case k:
              return "Suspense";
            case l:
              return "SuspenseList";
          }
          if ("object" == typeof b4) switch (b4.$$typeof) {
            case j2:
              return a11(b4.render);
            case m:
              return a11(b4.type);
            case n:
              var c3 = b4._payload;
              b4 = b4._init;
              try {
                return a11(b4(c3));
              } catch (a12) {
              }
          }
          return "";
        }(a10.type) + "/>";
        else {
          if (a10.$$typeof === ak) return "client";
          for (h2 = 0, e2 = "{", f2 = Object.keys(a10); h2 < f2.length; h2++) {
            0 < h2 && (e2 += ", ");
            var i2 = f2[h2], o2 = JSON.stringify(i2);
            e2 += ('"' + i2 + '"' === o2 ? i2 : o2) + ": ", o2 = "object" == typeof (o2 = a10[i2]) && null !== o2 ? al(o2) : aj(o2), i2 === b3 ? (c2 = e2.length, d2 = o2.length, e2 += o2) : e2 = 10 > o2.length && 40 > e2.length + o2.length ? e2 + o2 : e2 + "...";
          }
          e2 += "}";
        }
        return void 0 === b3 ? e2 : -1 < c2 && 0 < d2 ? "\n  " + e2 + "\n  " + (a10 = " ".repeat(c2) + "^".repeat(d2)) : "\n  " + e2;
      }
      var am = Object.prototype.hasOwnProperty, an = Object.prototype, ao = JSON.stringify;
      function ap(a10) {
        console.error(a10);
      }
      function aq(a10, b3, c2, d2, e2, f2, g2, h2, i2) {
        if (null !== af.A && af.A !== ae2) throw Error("Currently React only supports one RSC renderer at a time.");
        af.A = ae2;
        var j3 = /* @__PURE__ */ new Set(), k2 = [], l2 = /* @__PURE__ */ new Set();
        this.type = a10, this.status = 10, this.flushScheduled = false, this.destination = this.fatalError = null, this.bundlerConfig = c2, this.cache = /* @__PURE__ */ new Map(), this.cacheController = new AbortController(), this.pendingChunks = this.nextChunkId = 0, this.hints = l2, this.abortableTasks = j3, this.pingedTasks = k2, this.completedImportChunks = [], this.completedHintChunks = [], this.completedRegularChunks = [], this.completedErrorChunks = [], this.writtenSymbols = /* @__PURE__ */ new Map(), this.writtenClientReferences = /* @__PURE__ */ new Map(), this.writtenServerReferences = /* @__PURE__ */ new Map(), this.writtenObjects = /* @__PURE__ */ new WeakMap(), this.temporaryReferences = i2, this.identifierPrefix = h2 || "", this.identifierCount = 1, this.taintCleanupQueue = [], this.onError = void 0 === d2 ? ap : d2, this.onPostpone = void 0 === e2 ? U2 : e2, this.onAllReady = f2, this.onFatalError = g2, k2.push(a10 = aC(this, b3, null, false, j3));
      }
      var ar = null;
      function as() {
        if (ar) return ar;
        if (Q2) {
          var a10 = R2.getStore();
          if (a10) return a10;
        }
        return null;
      }
      function at(a10, b3, c2) {
        var d2 = aC(a10, c2, b3.keyPath, b3.implicitSlot, a10.abortableTasks);
        switch (c2.status) {
          case "fulfilled":
            return d2.model = c2.value, aB(a10, d2), d2.id;
          case "rejected":
            return aR(a10, d2, c2.reason), d2.id;
          default:
            if (12 === a10.status) return a10.abortableTasks.delete(d2), b3 = a10.fatalError, aW(d2), aX(d2, a10, b3), d2.id;
            "string" != typeof c2.status && (c2.status = "pending", c2.then(function(a11) {
              "pending" === c2.status && (c2.status = "fulfilled", c2.value = a11);
            }, function(a11) {
              "pending" === c2.status && (c2.status = "rejected", c2.reason = a11);
            }));
        }
        return c2.then(function(b4) {
          d2.model = b4, aB(a10, d2);
        }, function(b4) {
          0 === d2.status && (aR(a10, d2, b4), a$(a10));
        }), d2.id;
      }
      function au(a10, b3, c2) {
        b3 = z2(":H" + b3 + (c2 = ao(c2)) + "\n"), a10.completedHintChunks.push(b3), a$(a10);
      }
      function av(a10) {
        if ("fulfilled" === a10.status) return a10.value;
        if ("rejected" === a10.status) throw a10.reason;
        throw a10;
      }
      function aw() {
      }
      function ax(a10, b3, c2, d2, e2) {
        var f2 = b3.thenableState;
        if (b3.thenableState = null, Z = 0, $ = f2, e2 = d2(e2, void 0), 12 === a10.status) throw "object" == typeof e2 && null !== e2 && "function" == typeof e2.then && e2.$$typeof !== C2 && e2.then(aw, aw), null;
        return e2 = function(a11, b4, c3, d3) {
          if ("object" != typeof d3 || null === d3 || d3.$$typeof === C2) return d3;
          if ("function" == typeof d3.then) {
            switch (d3.status) {
              case "fulfilled":
                return d3.value;
              case "rejected":
                break;
              default:
                "string" != typeof d3.status && (d3.status = "pending", d3.then(function(a12) {
                  "pending" === d3.status && (d3.status = "fulfilled", d3.value = a12);
                }, function(a12) {
                  "pending" === d3.status && (d3.status = "rejected", d3.reason = a12);
                }));
            }
            return { $$typeof: n, _payload: d3, _init: av };
          }
          var e3 = q2(d3);
          return e3 ? ((a11 = {})[Symbol.iterator] = function() {
            return e3.call(d3);
          }, a11) : "function" != typeof d3[r] || "function" == typeof ReadableStream && d3 instanceof ReadableStream ? d3 : ((a11 = {})[r] = function() {
            return d3[r]();
          }, a11);
        }(a10, 0, 0, e2), d2 = b3.keyPath, f2 = b3.implicitSlot, null !== c2 ? b3.keyPath = null === d2 ? c2 : d2 + "," + c2 : null === d2 && (b3.implicitSlot = true), a10 = aJ(a10, b3, aS, "", e2), b3.keyPath = d2, b3.implicitSlot = f2, a10;
      }
      function ay(a10, b3, c2) {
        return null !== b3.keyPath ? (a10 = [g, h, b3.keyPath, { children: c2 }], b3.implicitSlot ? [a10] : a10) : c2;
      }
      var az = 0;
      function aA(a10, b3) {
        return b3 = aC(a10, b3.model, b3.keyPath, b3.implicitSlot, a10.abortableTasks), aB(a10, b3), "$L" + b3.id.toString(16);
      }
      function aB(a10, b3) {
        var c2 = a10.pingedTasks;
        c2.push(b3), 1 === c2.length && (a10.flushScheduled = null !== a10.destination, 21 === a10.type || 10 === a10.status ? u(function() {
          return aV(a10);
        }) : setTimeout(function() {
          return aV(a10);
        }, 0));
      }
      function aC(a10, b3, c2, d2, e2) {
        a10.pendingChunks++;
        var f2 = a10.nextChunkId++;
        "object" != typeof b3 || null === b3 || null !== c2 || d2 || a10.writtenObjects.set(b3, aD(f2));
        var h2 = { id: f2, status: 0, model: b3, keyPath: c2, implicitSlot: d2, ping: function() {
          return aB(a10, h2);
        }, toJSON: function(b4, c3) {
          az += b4.length;
          var d3 = h2.keyPath, e3 = h2.implicitSlot;
          try {
            var f3 = aJ(a10, h2, this, b4, c3);
          } catch (j3) {
            if (b4 = "object" == typeof (b4 = h2.model) && null !== b4 && (b4.$$typeof === g || b4.$$typeof === n), 12 === a10.status) h2.status = 3, d3 = a10.fatalError, f3 = b4 ? "$L" + d3.toString(16) : aD(d3);
            else if ("object" == typeof (c3 = j3 === V2 ? X() : j3) && null !== c3 && "function" == typeof c3.then) {
              var i2 = (f3 = aC(a10, h2.model, h2.keyPath, h2.implicitSlot, a10.abortableTasks)).ping;
              c3.then(i2, i2), f3.thenableState = _2(), h2.keyPath = d3, h2.implicitSlot = e3, f3 = b4 ? "$L" + f3.id.toString(16) : aD(f3.id);
            } else h2.keyPath = d3, h2.implicitSlot = e3, a10.pendingChunks++, d3 = a10.nextChunkId++, e3 = aK(a10, c3, h2), aM(a10, d3, e3), f3 = b4 ? "$L" + d3.toString(16) : aD(d3);
          }
          return f3;
        }, thenableState: null };
        return e2.add(h2), h2;
      }
      function aD(a10) {
        return "$" + a10.toString(16);
      }
      function aE(a10, b3, c2) {
        return a10 = ao(c2), z2(b3 = b3.toString(16) + ":" + a10 + "\n");
      }
      function aF(a10, b3, c2, d2) {
        var e2 = d2.$$async ? d2.$$id + "#async" : d2.$$id, f2 = a10.writtenClientReferences, h2 = f2.get(e2);
        if (void 0 !== h2) return b3[0] === g && "1" === c2 ? "$L" + h2.toString(16) : aD(h2);
        try {
          var i2 = a10.bundlerConfig, j3 = d2.$$id;
          h2 = "";
          var k2 = i2[j3];
          if (k2) h2 = k2.name;
          else {
            var l2 = j3.lastIndexOf("#");
            if (-1 !== l2 && (h2 = j3.slice(l2 + 1), k2 = i2[j3.slice(0, l2)]), !k2) throw Error('Could not find the module "' + j3 + '" in the React Client Manifest. This is probably a bug in the React Server Components bundler.');
          }
          if (true === k2.async && true === d2.$$async) throw Error('The module "' + j3 + '" is marked as an async ESM module but was loaded as a CJS proxy. This is probably a bug in the React Server Components bundler.');
          var m2 = true === k2.async || true === d2.$$async ? [k2.id, k2.chunks, h2, 1] : [k2.id, k2.chunks, h2];
          a10.pendingChunks++;
          var n2 = a10.nextChunkId++, o2 = ao(m2), p2 = n2.toString(16) + ":I" + o2 + "\n", q3 = z2(p2);
          return a10.completedImportChunks.push(q3), f2.set(e2, n2), b3[0] === g && "1" === c2 ? "$L" + n2.toString(16) : aD(n2);
        } catch (d3) {
          return a10.pendingChunks++, b3 = a10.nextChunkId++, c2 = aK(a10, d3, null), aM(a10, b3, c2), aD(b3);
        }
      }
      function aG(a10, b3) {
        return b3 = aC(a10, b3, null, false, a10.abortableTasks), aT(a10, b3), b3.id;
      }
      function aH(a10, b3, c2) {
        a10.pendingChunks++;
        var d2 = a10.nextChunkId++;
        return aO(a10, d2, b3, c2, false), aD(d2);
      }
      var aI = false;
      function aJ(a10, b3, c2, d2, e2) {
        if (b3.model = e2, e2 === g) return "$";
        if (null === e2) return null;
        if ("object" == typeof e2) {
          switch (e2.$$typeof) {
            case g:
              var i2 = null, k2 = a10.writtenObjects;
              if (null === b3.keyPath && !b3.implicitSlot) {
                var l2 = k2.get(e2);
                if (void 0 !== l2) if (aI !== e2) return l2;
                else aI = null;
                else -1 === d2.indexOf(":") && void 0 !== (c2 = k2.get(c2)) && (i2 = c2 + ":" + d2, k2.set(e2, i2));
              }
              if (3200 < az) return aA(a10, b3);
              return c2 = (d2 = e2.props).ref, "object" == typeof (a10 = function a11(b4, c3, d3, e3, f2, i3) {
                if (null != f2) throw Error("Refs cannot be used in Server Components, nor passed to Client Components.");
                if ("function" == typeof d3 && d3.$$typeof !== C2 && d3.$$typeof !== S) return ax(b4, c3, e3, d3, i3);
                if (d3 === h && null === e3) return d3 = c3.implicitSlot, null === c3.keyPath && (c3.implicitSlot = true), i3 = aJ(b4, c3, aS, "", i3.children), c3.implicitSlot = d3, i3;
                if (null != d3 && "object" == typeof d3 && d3.$$typeof !== C2) switch (d3.$$typeof) {
                  case n:
                    if (d3 = (0, d3._init)(d3._payload), 12 === b4.status) throw null;
                    return a11(b4, c3, d3, e3, f2, i3);
                  case j2:
                    return ax(b4, c3, e3, d3.render, i3);
                  case m:
                    return a11(b4, c3, d3.type, e3, f2, i3);
                }
                return b4 = e3, e3 = c3.keyPath, null === b4 ? b4 = e3 : null !== e3 && (b4 = e3 + "," + b4), i3 = [g, d3, b4, i3], c3 = c3.implicitSlot && null !== b4 ? [i3] : i3;
              }(a10, b3, e2.type, e2.key, void 0 !== c2 ? c2 : null, d2)) && null !== a10 && null !== i2 && (k2.has(a10) || k2.set(a10, i2)), a10;
            case n:
              if (3200 < az) return aA(a10, b3);
              if (b3.thenableState = null, e2 = (d2 = e2._init)(e2._payload), 12 === a10.status) throw null;
              return aJ(a10, b3, aS, "", e2);
            case f:
              throw Error('A React Element from an older version of React was rendered. This is not supported. It can happen if:\n- Multiple copies of the "react" package is used.\n- A library pre-bundled an old copy of "react" or "react/jsx-runtime".\n- A compiler tries to "inline" JSX instead of using the runtime.');
          }
          if (e2.$$typeof === C2) return aF(a10, c2, d2, e2);
          if (void 0 !== a10.temporaryReferences && void 0 !== (i2 = a10.temporaryReferences.get(e2))) return "$T" + i2;
          if (k2 = (i2 = a10.writtenObjects).get(e2), "function" == typeof e2.then) {
            if (void 0 !== k2) {
              if (null !== b3.keyPath || b3.implicitSlot) return "$@" + at(a10, b3, e2).toString(16);
              if (aI !== e2) return k2;
              aI = null;
            }
            return a10 = "$@" + at(a10, b3, e2).toString(16), i2.set(e2, a10), a10;
          }
          if (void 0 !== k2) if (aI !== e2) return k2;
          else {
            if (k2 !== aD(b3.id)) return k2;
            aI = null;
          }
          else if (-1 === d2.indexOf(":") && void 0 !== (k2 = i2.get(c2))) {
            if (l2 = d2, ag(c2) && c2[0] === g) switch (d2) {
              case "1":
                l2 = "type";
                break;
              case "2":
                l2 = "key";
                break;
              case "3":
                l2 = "props";
                break;
              case "4":
                l2 = "_owner";
            }
            i2.set(e2, k2 + ":" + l2);
          }
          if (ag(e2)) return ay(a10, b3, e2);
          if (e2 instanceof Map) return "$Q" + aG(a10, e2 = Array.from(e2)).toString(16);
          if (e2 instanceof Set) return "$W" + aG(a10, e2 = Array.from(e2)).toString(16);
          if ("function" == typeof FormData && e2 instanceof FormData) return "$K" + aG(a10, e2 = Array.from(e2.entries())).toString(16);
          if (e2 instanceof Error) return "$Z";
          if (e2 instanceof ArrayBuffer) return aH(a10, "A", new Uint8Array(e2));
          if (e2 instanceof Int8Array) return aH(a10, "O", e2);
          if (e2 instanceof Uint8Array) return aH(a10, "o", e2);
          if (e2 instanceof Uint8ClampedArray) return aH(a10, "U", e2);
          if (e2 instanceof Int16Array) return aH(a10, "S", e2);
          if (e2 instanceof Uint16Array) return aH(a10, "s", e2);
          if (e2 instanceof Int32Array) return aH(a10, "L", e2);
          if (e2 instanceof Uint32Array) return aH(a10, "l", e2);
          if (e2 instanceof Float32Array) return aH(a10, "G", e2);
          if (e2 instanceof Float64Array) return aH(a10, "g", e2);
          if (e2 instanceof BigInt64Array) return aH(a10, "M", e2);
          if (e2 instanceof BigUint64Array) return aH(a10, "m", e2);
          if (e2 instanceof DataView) return aH(a10, "V", e2);
          if ("function" == typeof Blob && e2 instanceof Blob) return function(a11, b4) {
            function c3(b5) {
              0 === f2.status && (a11.cacheController.signal.removeEventListener("abort", d3), aR(a11, f2, b5), a$(a11), g2.cancel(b5).then(c3, c3));
            }
            function d3() {
              if (0 === f2.status) {
                var b5 = a11.cacheController.signal;
                b5.removeEventListener("abort", d3), aR(a11, f2, b5 = b5.reason), a$(a11), g2.cancel(b5).then(c3, c3);
              }
            }
            var e3 = [b4.type], f2 = aC(a11, e3, null, false, a11.abortableTasks), g2 = b4.stream().getReader();
            return a11.cacheController.signal.addEventListener("abort", d3), g2.read().then(function b5(h2) {
              if (0 === f2.status) if (!h2.done) return e3.push(h2.value), g2.read().then(b5).catch(c3);
              else a11.cacheController.signal.removeEventListener("abort", d3), aB(a11, f2);
            }).catch(c3), "$B" + f2.id.toString(16);
          }(a10, e2);
          if (i2 = q2(e2)) return (d2 = i2.call(e2)) === e2 ? "$i" + aG(a10, Array.from(d2)).toString(16) : ay(a10, b3, Array.from(d2));
          if ("function" == typeof ReadableStream && e2 instanceof ReadableStream) return function(a11, b4, c3) {
            function d3(b5) {
              0 === h2.status && (a11.cacheController.signal.removeEventListener("abort", e3), aR(a11, h2, b5), a$(a11), g2.cancel(b5).then(d3, d3));
            }
            function e3() {
              if (0 === h2.status) {
                var b5 = a11.cacheController.signal;
                b5.removeEventListener("abort", e3), aR(a11, h2, b5 = b5.reason), a$(a11), g2.cancel(b5).then(d3, d3);
              }
            }
            var f2 = c3.supportsBYOB;
            if (void 0 === f2) try {
              c3.getReader({ mode: "byob" }).releaseLock(), f2 = true;
            } catch (a12) {
              f2 = false;
            }
            var g2 = c3.getReader(), h2 = aC(a11, b4.model, b4.keyPath, b4.implicitSlot, a11.abortableTasks);
            return a11.pendingChunks++, b4 = h2.id.toString(16) + ":" + (f2 ? "r" : "R") + "\n", a11.completedRegularChunks.push(z2(b4)), a11.cacheController.signal.addEventListener("abort", e3), g2.read().then(function b5(c4) {
              if (0 === h2.status) if (c4.done) h2.status = 1, c4 = h2.id.toString(16) + ":C\n", a11.completedRegularChunks.push(z2(c4)), a11.abortableTasks.delete(h2), a11.cacheController.signal.removeEventListener("abort", e3), a$(a11), a_(a11);
              else try {
                h2.model = c4.value, a11.pendingChunks++, aU(a11, h2), a$(a11), g2.read().then(b5, d3);
              } catch (a12) {
                d3(a12);
              }
            }, d3), aD(h2.id);
          }(a10, b3, e2);
          if ("function" == typeof (i2 = e2[r])) return null !== b3.keyPath ? (a10 = [g, h, b3.keyPath, { children: e2 }], a10 = b3.implicitSlot ? [a10] : a10) : (d2 = i2.call(e2), a10 = function(a11, b4, c3, d3) {
            function e3(b5) {
              0 === g2.status && (a11.cacheController.signal.removeEventListener("abort", f2), aR(a11, g2, b5), a$(a11), "function" == typeof d3.throw && d3.throw(b5).then(e3, e3));
            }
            function f2() {
              if (0 === g2.status) {
                var b5 = a11.cacheController.signal;
                b5.removeEventListener("abort", f2);
                var c4 = b5.reason;
                aR(a11, g2, b5.reason), a$(a11), "function" == typeof d3.throw && d3.throw(c4).then(e3, e3);
              }
            }
            c3 = c3 === d3;
            var g2 = aC(a11, b4.model, b4.keyPath, b4.implicitSlot, a11.abortableTasks);
            return a11.pendingChunks++, b4 = g2.id.toString(16) + ":" + (c3 ? "x" : "X") + "\n", a11.completedRegularChunks.push(z2(b4)), a11.cacheController.signal.addEventListener("abort", f2), d3.next().then(function b5(c4) {
              if (0 === g2.status) if (c4.done) {
                if (g2.status = 1, void 0 === c4.value) var h2 = g2.id.toString(16) + ":C\n";
                else try {
                  var i3 = aG(a11, c4.value);
                  h2 = g2.id.toString(16) + ":C" + ao(aD(i3)) + "\n";
                } catch (a12) {
                  e3(a12);
                  return;
                }
                a11.completedRegularChunks.push(z2(h2)), a11.abortableTasks.delete(g2), a11.cacheController.signal.removeEventListener("abort", f2), a$(a11), a_(a11);
              } else try {
                g2.model = c4.value, a11.pendingChunks++, aU(a11, g2), a$(a11), d3.next().then(b5, e3);
              } catch (a12) {
                e3(a12);
              }
            }, e3), aD(g2.id);
          }(a10, b3, e2, d2)), a10;
          if (e2 instanceof Date) return "$D" + e2.toJSON();
          if ((a10 = ah(e2)) !== an && (null === a10 || null !== ah(a10))) throw Error("Only plain objects, and a few built-ins, can be passed to Client Components from Server Components. Classes or null prototypes are not supported." + al(c2, d2));
          return e2;
        }
        if ("string" == typeof e2) return (az += e2.length, "Z" === e2[e2.length - 1] && c2[d2] instanceof Date) ? "$D" + e2 : 1024 <= e2.length && null !== A ? (a10.pendingChunks++, b3 = a10.nextChunkId++, aP(a10, b3, e2, false), aD(b3)) : a10 = "$" === e2[0] ? "$" + e2 : e2;
        if ("boolean" == typeof e2) return e2;
        if ("number" == typeof e2) return Number.isFinite(e2) ? 0 === e2 && -1 / 0 == 1 / e2 ? "$-0" : e2 : 1 / 0 === e2 ? "$Infinity" : -1 / 0 === e2 ? "$-Infinity" : "$NaN";
        if (void 0 === e2) return "$undefined";
        if ("function" == typeof e2) {
          if (e2.$$typeof === C2) return aF(a10, c2, d2, e2);
          if (e2.$$typeof === D2) return void 0 !== (d2 = (b3 = a10.writtenServerReferences).get(e2)) ? a10 = "$h" + d2.toString(16) : (d2 = null === (d2 = e2.$$bound) ? null : Promise.resolve(d2), a10 = aG(a10, { id: e2.$$id, bound: d2 }), b3.set(e2, a10), a10 = "$h" + a10.toString(16)), a10;
          if (void 0 !== a10.temporaryReferences && void 0 !== (a10 = a10.temporaryReferences.get(e2))) return "$T" + a10;
          if (e2.$$typeof === S) throw Error("Could not reference an opaque temporary reference. This is likely due to misconfiguring the temporaryReferences options on the server.");
          if (/^on[A-Z]/.test(d2)) throw Error("Event handlers cannot be passed to Client Component props." + al(c2, d2) + "\nIf you need interactivity, consider converting part of this to a Client Component.");
          throw Error('Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server". Or maybe you meant to call this function rather than return it.' + al(c2, d2));
        }
        if ("symbol" == typeof e2) {
          if (void 0 !== (i2 = (b3 = a10.writtenSymbols).get(e2))) return aD(i2);
          if (Symbol.for(i2 = e2.description) !== e2) throw Error("Only global symbols received from Symbol.for(...) can be passed to Client Components. The symbol Symbol.for(" + e2.description + ") cannot be found among global symbols." + al(c2, d2));
          return a10.pendingChunks++, d2 = a10.nextChunkId++, c2 = aE(a10, d2, "$S" + i2), a10.completedImportChunks.push(c2), b3.set(e2, d2), aD(d2);
        }
        if ("bigint" == typeof e2) return "$n" + e2.toString(10);
        throw Error("Type " + typeof e2 + " is not supported in Client Component props." + al(c2, d2));
      }
      function aK(a10, b3) {
        var c2 = ar;
        ar = null;
        try {
          var d2 = a10.onError, e2 = Q2 ? R2.run(void 0, d2, b3) : d2(b3);
        } finally {
          ar = c2;
        }
        if (null != e2 && "string" != typeof e2) throw Error('onError returned something with a type other than "string". onError should return a string and may return null or undefined but must not return anything else. It received something of type "' + typeof e2 + '" instead');
        return e2 || "";
      }
      function aL(a10, b3) {
        (0, a10.onFatalError)(b3), null !== a10.destination ? (a10.status = 14, B2(a10.destination, b3)) : (a10.status = 13, a10.fatalError = b3), a10.cacheController.abort(Error("The render was aborted due to a fatal error.", { cause: b3 }));
      }
      function aM(a10, b3, c2) {
        c2 = { digest: c2 }, b3 = z2(b3 = b3.toString(16) + ":E" + ao(c2) + "\n"), a10.completedErrorChunks.push(b3);
      }
      function aN(a10, b3, c2) {
        b3 = z2(b3 = b3.toString(16) + ":" + c2 + "\n"), a10.completedRegularChunks.push(b3);
      }
      function aO(a10, b3, c2, d2, e2) {
        e2 ? a10.pendingDebugChunks++ : a10.pendingChunks++, e2 = new Uint8Array(d2.buffer, d2.byteOffset, d2.byteLength), e2 = (d2 = 2048 < d2.byteLength ? e2.slice() : e2).byteLength, b3 = z2(b3 = b3.toString(16) + ":" + c2 + e2.toString(16) + ","), a10.completedRegularChunks.push(b3, d2);
      }
      function aP(a10, b3, c2, d2) {
        if (null === A) throw Error("Existence of byteLengthOfChunk should have already been checked. This is a bug in React.");
        d2 ? a10.pendingDebugChunks++ : a10.pendingChunks++, d2 = (c2 = z2(c2)).byteLength, b3 = z2(b3 = b3.toString(16) + ":T" + d2.toString(16) + ","), a10.completedRegularChunks.push(b3, c2);
      }
      function aQ(a10, b3, c2) {
        var d2 = b3.id;
        "string" == typeof c2 && null !== A ? aP(a10, d2, c2, false) : c2 instanceof ArrayBuffer ? aO(a10, d2, "A", new Uint8Array(c2), false) : c2 instanceof Int8Array ? aO(a10, d2, "O", c2, false) : c2 instanceof Uint8Array ? aO(a10, d2, "o", c2, false) : c2 instanceof Uint8ClampedArray ? aO(a10, d2, "U", c2, false) : c2 instanceof Int16Array ? aO(a10, d2, "S", c2, false) : c2 instanceof Uint16Array ? aO(a10, d2, "s", c2, false) : c2 instanceof Int32Array ? aO(a10, d2, "L", c2, false) : c2 instanceof Uint32Array ? aO(a10, d2, "l", c2, false) : c2 instanceof Float32Array ? aO(a10, d2, "G", c2, false) : c2 instanceof Float64Array ? aO(a10, d2, "g", c2, false) : c2 instanceof BigInt64Array ? aO(a10, d2, "M", c2, false) : c2 instanceof BigUint64Array ? aO(a10, d2, "m", c2, false) : c2 instanceof DataView ? aO(a10, d2, "V", c2, false) : (c2 = ao(c2, b3.toJSON), aN(a10, b3.id, c2));
      }
      function aR(a10, b3, c2) {
        b3.status = 4, c2 = aK(a10, c2, b3), aM(a10, b3.id, c2), a10.abortableTasks.delete(b3), a_(a10);
      }
      var aS = {};
      function aT(a10, b3) {
        if (0 === b3.status) {
          b3.status = 5;
          var c2 = az;
          try {
            aI = b3.model;
            var d2 = aJ(a10, b3, aS, "", b3.model);
            if (aI = d2, b3.keyPath = null, b3.implicitSlot = false, "object" == typeof d2 && null !== d2) a10.writtenObjects.set(d2, aD(b3.id)), aQ(a10, b3, d2);
            else {
              var e2 = ao(d2);
              aN(a10, b3.id, e2);
            }
            b3.status = 1, a10.abortableTasks.delete(b3), a_(a10);
          } catch (c3) {
            if (12 === a10.status) {
              a10.abortableTasks.delete(b3), b3.status = 0;
              var f2 = a10.fatalError;
              aW(b3), aX(b3, a10, f2);
            } else {
              var g2 = c3 === V2 ? X() : c3;
              if ("object" == typeof g2 && null !== g2 && "function" == typeof g2.then) {
                b3.status = 0, b3.thenableState = _2();
                var h2 = b3.ping;
                g2.then(h2, h2);
              } else aR(a10, b3, g2);
            }
          } finally {
            az = c2;
          }
        }
      }
      function aU(a10, b3) {
        var c2 = az;
        try {
          aQ(a10, b3, b3.model);
        } finally {
          az = c2;
        }
      }
      function aV(a10) {
        var b3 = af.H;
        af.H = aa;
        var c2 = ar;
        Y2 = ar = a10;
        try {
          var d2 = a10.pingedTasks;
          a10.pingedTasks = [];
          for (var e2 = 0; e2 < d2.length; e2++) aT(a10, d2[e2]);
          aY(a10);
        } catch (b4) {
          aK(a10, b4, null), aL(a10, b4);
        } finally {
          af.H = b3, Y2 = null, ar = c2;
        }
      }
      function aW(a10) {
        0 === a10.status && (a10.status = 3);
      }
      function aX(a10, b3, c2) {
        3 === a10.status && (c2 = aD(c2), a10 = aE(b3, a10.id, c2), b3.completedErrorChunks.push(a10));
      }
      function aY(a10) {
        var b3 = a10.destination;
        if (null !== b3) {
          v2 = new Uint8Array(2048), w2 = 0;
          try {
            for (var c2 = a10.completedImportChunks, d2 = 0; d2 < c2.length; d2++) a10.pendingChunks--, x2(b3, c2[d2]);
            c2.splice(0, d2);
            var e2 = a10.completedHintChunks;
            for (d2 = 0; d2 < e2.length; d2++) x2(b3, e2[d2]);
            e2.splice(0, d2);
            var f2 = a10.completedRegularChunks;
            for (d2 = 0; d2 < f2.length; d2++) a10.pendingChunks--, x2(b3, f2[d2]);
            f2.splice(0, d2);
            var g2 = a10.completedErrorChunks;
            for (d2 = 0; d2 < g2.length; d2++) a10.pendingChunks--, x2(b3, g2[d2]);
            g2.splice(0, d2);
          } finally {
            a10.flushScheduled = false, v2 && 0 < w2 && (b3.enqueue(new Uint8Array(v2.buffer, 0, w2)), v2 = null, w2 = 0);
          }
        }
        0 === a10.pendingChunks && (12 > a10.status && a10.cacheController.abort(Error("This render completed successfully. All cacheSignals are now aborted to allow clean up of any unused resources.")), null !== a10.destination && (a10.status = 14, a10.destination.close(), a10.destination = null));
      }
      function aZ(a10) {
        a10.flushScheduled = null !== a10.destination, Q2 ? u(function() {
          R2.run(a10, aV, a10);
        }) : u(function() {
          return aV(a10);
        }), setTimeout(function() {
          10 === a10.status && (a10.status = 11);
        }, 0);
      }
      function a$(a10) {
        false === a10.flushScheduled && 0 === a10.pingedTasks.length && null !== a10.destination && (a10.flushScheduled = true, setTimeout(function() {
          a10.flushScheduled = false, aY(a10);
        }, 0));
      }
      function a_(a10) {
        0 === a10.abortableTasks.size && (a10 = a10.onAllReady)();
      }
      function a0(a10, b3) {
        if (13 === a10.status) a10.status = 14, B2(b3, a10.fatalError);
        else if (14 !== a10.status && null === a10.destination) {
          a10.destination = b3;
          try {
            aY(a10);
          } catch (b4) {
            aK(a10, b4, null), aL(a10, b4);
          }
        }
      }
      function a1(a10, b3) {
        if (!(11 < a10.status)) try {
          a10.status = 12, a10.cacheController.abort(b3);
          var c2 = a10.abortableTasks;
          if (0 < c2.size) {
            var d2 = void 0 === b3 ? Error("The render was aborted by the server without a reason.") : "object" == typeof b3 && null !== b3 && "function" == typeof b3.then ? Error("The render was aborted by the server with a promise.") : b3, e2 = aK(a10, d2, null), f2 = a10.nextChunkId++;
            a10.fatalError = f2, a10.pendingChunks++, aM(a10, f2, e2, d2, false), c2.forEach(function(b4) {
              return aW(b4, a10, f2);
            }), setTimeout(function() {
              try {
                c2.forEach(function(b4) {
                  return aX(b4, a10, f2);
                }), (0, a10.onAllReady)(), aY(a10);
              } catch (b4) {
                aK(a10, b4, null), aL(a10, b4);
              }
            }, 0);
          } else (0, a10.onAllReady)(), aY(a10);
        } catch (b4) {
          aK(a10, b4, null), aL(a10, b4);
        }
      }
      function a22(a10, b3) {
        var c2 = "", d2 = a10[b3];
        if (d2) c2 = d2.name;
        else {
          var e2 = b3.lastIndexOf("#");
          if (-1 !== e2 && (c2 = b3.slice(e2 + 1), d2 = a10[b3.slice(0, e2)]), !d2) throw Error('Could not find the module "' + b3 + '" in the React Server Manifest. This is probably a bug in the React Server Components bundler.');
        }
        return d2.async ? [d2.id, d2.chunks, c2, 1] : [d2.id, d2.chunks, c2];
      }
      var a3 = /* @__PURE__ */ new Map();
      function a4(a10) {
        var b3 = globalThis.__next_require__(a10);
        return "function" != typeof b3.then || "fulfilled" === b3.status ? null : (b3.then(function(a11) {
          b3.status = "fulfilled", b3.value = a11;
        }, function(a11) {
          b3.status = "rejected", b3.reason = a11;
        }), b3);
      }
      function a5() {
      }
      function a6(a10) {
        for (var b3 = a10[1], d2 = [], e2 = 0; e2 < b3.length; ) {
          var f2 = b3[e2++];
          b3[e2++];
          var g2 = a3.get(f2);
          if (void 0 === g2) {
            g2 = c.e(f2), d2.push(g2);
            var h2 = a3.set.bind(a3, f2, null);
            g2.then(h2, a5), a3.set(f2, g2);
          } else null !== g2 && d2.push(g2);
        }
        return 4 === a10.length ? 0 === d2.length ? a4(a10[0]) : Promise.all(d2).then(function() {
          return a4(a10[0]);
        }) : 0 < d2.length ? Promise.all(d2) : null;
      }
      function a7(a10) {
        var b3 = globalThis.__next_require__(a10[0]);
        if (4 === a10.length && "function" == typeof b3.then) if ("fulfilled" === b3.status) b3 = b3.value;
        else throw b3.reason;
        return "*" === a10[2] ? b3 : "" === a10[2] ? b3.__esModule ? b3.default : b3 : am.call(b3, a10[2]) ? b3[a10[2]] : void 0;
      }
      function a8(a10, b3, c2) {
        a10.data.append(b3, c2), null === (c2 = a10.keys) ? (a10.keys = Array.from(a10.data.keys()), a10.keyPointer = 0) : c2.push(b3);
      }
      var a9 = Symbol();
      function ba(a10, b3, c2) {
        this.status = a10, this.value = b3, this.reason = c2;
      }
      ba.prototype = Object.create(Promise.prototype), ba.prototype.then = function(a10, b3) {
        switch ("resolved_model" === this.status && bn(this), this.status) {
          case "fulfilled":
            if ("function" == typeof a10) {
              for (var c2 = this.value, d2 = 0, e2 = /* @__PURE__ */ new Set(); c2 instanceof ba; ) {
                if (d2++, c2 === this || e2.has(c2) || 1e3 < d2) {
                  "function" == typeof b3 && b3(Error("Cannot have cyclic thenables."));
                  return;
                }
                if (e2.add(c2), "fulfilled" === c2.status) c2 = c2.value;
                else break;
              }
              a10(this.value);
            }
            break;
          case "pending":
          case "blocked":
            "function" == typeof a10 && (null === this.value && (this.value = []), this.value.push(a10)), "function" == typeof b3 && (null === this.reason && (this.reason = []), this.reason.push(b3));
            break;
          default:
            "function" == typeof b3 && b3(this.reason);
        }
      };
      var bb = Object.prototype, bc = Array.prototype;
      function bd(a10, b3, c2, d2) {
        for (var e2 = 0; e2 < b3.length; e2++) {
          var f2 = b3[e2];
          "function" == typeof f2 ? f2(c2) : bq(a10, f2, c2, d2.reason);
        }
      }
      function be(a10, b3, c2) {
        for (var d2 = 0; d2 < b3.length; d2++) {
          var e2 = b3[d2];
          "function" == typeof e2 ? e2(c2) : bs(a10, e2.handler, c2);
        }
      }
      function bf(a10, b3, c2) {
        if ("pending" !== b3.status && "blocked" !== b3.status) b3.reason.error(c2);
        else {
          var d2 = b3.reason;
          b3.status = "rejected", b3.reason = c2, null !== d2 && be(a10, d2, c2);
        }
      }
      function bg(a10, b3, c2) {
        var d2 = {};
        return new ba("resolved_model", b3, (d2.id = c2, d2[a9] = a10, d2));
      }
      function bh(a10, b3, c2, d2) {
        if ("pending" !== b3.status) b3 = b3.reason, "C" === c2[0] ? b3.close("C" === c2 ? '"$undefined"' : c2.slice(1)) : b3.enqueueModel(c2);
        else {
          var e2 = b3.value, f2 = b3.reason;
          if (b3.status = "resolved_model", b3.value = c2, c2 = {}, b3.reason = (c2.id = d2, c2[a9] = a10, c2), null !== e2) switch (bn(b3), b3.status) {
            case "fulfilled":
              bd(a10, e2, b3.value, b3);
              break;
            case "blocked":
            case "pending":
              if (b3.value) for (a10 = 0; a10 < e2.length; a10++) b3.value.push(e2[a10]);
              else b3.value = e2;
              if (b3.reason) {
                if (f2) for (e2 = 0; e2 < f2.length; e2++) b3.reason.push(f2[e2]);
              } else b3.reason = f2;
              break;
            case "rejected":
              f2 && be(a10, f2, b3.reason);
          }
        }
      }
      function bi(a10, b3, c2) {
        var d2 = {};
        return new ba("resolved_model", (c2 ? '{"done":true,"value":' : '{"done":false,"value":') + b3 + "}", (d2.id = -1, d2[a9] = a10, d2));
      }
      function bj(a10, b3, c2, d2) {
        bh(a10, b3, (d2 ? '{"done":true,"value":' : '{"done":false,"value":') + c2 + "}", -1);
      }
      function bk(a10, b3, c2, d2) {
        function e2(b4) {
          var c3 = h2.reason;
          h2.status = "rejected", h2.value = null, h2.reason = b4, null !== c3 && be(a10, c3, b4), bs(a10, j3, b4);
        }
        var f2 = b3.id;
        if ("string" != typeof f2 || "then" === d2) return null;
        var g2 = b3.$$promise;
        if (void 0 !== g2) return "fulfilled" === g2.status ? (g2 = g2.value, "__proto__" === d2 ? null : c2[d2] = g2) : (bm ? (f2 = bm, f2.deps++) : f2 = bm = { chunk: null, value: null, reason: null, deps: 1, errored: false }, g2.then(br.bind(null, a10, f2, c2, d2), bs.bind(null, a10, f2)), null);
        var h2 = new ba("blocked", null, null);
        b3.$$promise = h2;
        var i2 = a22(a10._bundlerConfig, f2);
        if (g2 = b3.bound, f2 = a6(i2)) g2 instanceof ba && (f2 = Promise.all([f2, g2]));
        else {
          if (!(g2 instanceof ba)) return g2 = a7(i2), (f2 = h2).status = "fulfilled", f2.value = g2;
          f2 = Promise.resolve(g2);
        }
        if (bm) {
          var j3 = bm;
          j3.deps++;
        } else j3 = bm = { chunk: null, value: null, reason: null, deps: 1, errored: false };
        return f2.then(function() {
          var f3 = a7(i2);
          if (b3.bound) {
            var g3 = b3.bound.value;
            if (1e3 < (g3 = ag(g3) ? g3.slice(0) : []).length) return void e2(Error("Server Function has too many bound arguments. Received " + g3.length + " but the limit is 1000."));
            g3.unshift(null), f3 = f3.bind.apply(f3, g3);
          }
          g3 = h2.value, h2.status = "fulfilled", h2.value = f3, h2.reason = null, null !== g3 && bd(a10, g3, f3, h2), br(a10, j3, c2, d2, f3);
        }, e2), null;
      }
      function bl(a10, b3, c2) {
        if ((a10.count += b3) > c2._arraySizeLimit && a10.fork) throw Error("Maximum array nesting exceeded. Large nested arrays can be dangerous. Try adding intermediate objects.");
      }
      var bm = null;
      function bn(a10) {
        var b3 = bm;
        bm = null;
        var c2 = a10.reason, d2 = c2[a9];
        c2 = -1 === (c2 = c2.id) ? void 0 : c2.toString(16);
        var e2 = a10.value;
        a10.status = "blocked", a10.value = null, a10.reason = null;
        try {
          var f2 = JSON.parse(e2);
          e2 = { count: 0, fork: false };
          var g2 = function a11(b4, c3, d3, e3, f3, g3) {
            if ("string" == typeof e3) return function(a12, b5, c4, d4, e4, f4) {
              if ("$" === d4[0]) {
                switch (d4[1]) {
                  case "$":
                    return null !== f4 && bl(f4, d4.length - 1, a12), d4.slice(1);
                  case "@":
                    return bp(a12, b5 = parseInt(d4.slice(2), 16));
                  case "h":
                    return bt(a12, f4 = d4.slice(2), b5, c4, null, bk);
                  case "T":
                    var g4, h4, i3;
                    if (void 0 === e4 || void 0 === a12._temporaryReferences) throw Error("Could not reference an opaque temporary reference. This is likely due to misconfiguring the temporaryReferences options on the server.");
                    return g4 = a12._temporaryReferences, h4 = e4, i3 = new Proxy(i3 = Object.defineProperties(function() {
                      throw Error("Attempted to call a temporary Client Reference from the server but it is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
                    }, { $$typeof: { value: S } }), T2), g4.set(i3, h4), i3;
                  case "Q":
                    return bt(a12, f4 = d4.slice(2), b5, c4, null, bu);
                  case "W":
                    return bt(a12, f4 = d4.slice(2), b5, c4, null, bv);
                  case "K":
                    for (c4 = d4.slice(2), c4 = (b5 = a12._prefix + "_") + c4 + "_", f4 = new FormData(), a12 = a12._formData; null === (d4 = a12.keys) && (d4 = a12.keys = Array.from(a12.data.keys()), a12.keyPointer = 0), void 0 !== (d4 = d4[a12.keyPointer]); ) if (d4.startsWith(c4)) {
                      e4 = a12.data.getAll(d4);
                      for (var j3 = d4.slice(c4.length), k2 = 0; k2 < e4.length; k2++) f4.append(j3, e4[k2]);
                      a12.data.delete(d4), a12.keyPointer++;
                    } else if (d4.startsWith(b5)) break;
                    else a12.keyPointer++;
                    return f4;
                  case "i":
                    return bt(a12, f4 = d4.slice(2), b5, c4, null, bw);
                  case "I":
                    return 1 / 0;
                  case "-":
                    return "$-0" === d4 ? -0 : -1 / 0;
                  case "N":
                    return NaN;
                  case "u":
                    return;
                  case "D":
                    return new Date(Date.parse(d4.slice(2)));
                  case "n":
                    if (300 < (b5 = d4.slice(2)).length) throw Error("BigInt is too large. Received " + b5.length + " digits but the limit is 300.");
                    return null !== f4 && bl(f4, b5.length, a12), BigInt(b5);
                  case "A":
                    return by(a12, d4, ArrayBuffer, 1, b5, c4, f4);
                  case "O":
                    return by(a12, d4, Int8Array, 1, b5, c4, f4);
                  case "o":
                    return by(a12, d4, Uint8Array, 1, b5, c4, f4);
                  case "U":
                    return by(a12, d4, Uint8ClampedArray, 1, b5, c4, f4);
                  case "S":
                    return by(a12, d4, Int16Array, 2, b5, c4, f4);
                  case "s":
                    return by(a12, d4, Uint16Array, 2, b5, c4, f4);
                  case "L":
                    return by(a12, d4, Int32Array, 4, b5, c4, f4);
                  case "l":
                    return by(a12, d4, Uint32Array, 4, b5, c4, f4);
                  case "G":
                    return by(a12, d4, Float32Array, 4, b5, c4, f4);
                  case "g":
                    return by(a12, d4, Float64Array, 8, b5, c4, f4);
                  case "M":
                    return by(a12, d4, BigInt64Array, 8, b5, c4, f4);
                  case "m":
                    return by(a12, d4, BigUint64Array, 8, b5, c4, f4);
                  case "V":
                    return by(a12, d4, DataView, 1, b5, c4, f4);
                  case "B":
                    return b5 = parseInt(d4.slice(2), 16), a12._formData.data.get(a12._prefix + b5);
                  case "R":
                    return bA(a12, d4, void 0);
                  case "r":
                    return bA(a12, d4, "bytes");
                  case "X":
                    return bC(a12, d4, false);
                  case "x":
                    return bC(a12, d4, true);
                }
                return bt(a12, d4 = d4.slice(1), b5, c4, f4, bx);
              }
              return null !== f4 && bl(f4, d4.length, a12), d4;
            }(b4, c3, d3, e3, f3, g3);
            if ("object" == typeof e3 && null !== e3) if (void 0 !== f3 && void 0 !== b4._temporaryReferences && b4._temporaryReferences.set(e3, f3), ag(e3)) {
              if (null === g3) {
                var h3 = { count: 0, fork: false };
                b4._rootArrayContexts.set(e3, h3);
              } else h3 = g3;
              for (1 < e3.length && (h3.fork = true), bl(h3, e3.length + 1, b4), c3 = 0; c3 < e3.length; c3++) e3[c3] = a11(b4, e3, "" + c3, e3[c3], void 0 !== f3 ? f3 + ":" + c3 : void 0, h3);
            } else for (h3 in e3) am.call(e3, h3) && ("__proto__" === h3 ? delete e3[h3] : (c3 = void 0 !== f3 && -1 === h3.indexOf(":") ? f3 + ":" + h3 : void 0, void 0 !== (c3 = a11(b4, e3, h3, e3[h3], c3, null)) ? e3[h3] = c3 : delete e3[h3]));
            return e3;
          }(d2, { "": f2 }, "", f2, c2, e2), h2 = a10.value;
          if (null !== h2) for (a10.value = null, a10.reason = null, f2 = 0; f2 < h2.length; f2++) {
            var i2 = h2[f2];
            "function" == typeof i2 ? i2(g2) : bq(d2, i2, g2, e2);
          }
          if (null !== bm) {
            if (bm.errored) throw bm.reason;
            if (0 < bm.deps) {
              bm.value = g2, bm.reason = e2, bm.chunk = a10;
              return;
            }
          }
          a10.status = "fulfilled", a10.value = g2, a10.reason = e2;
        } catch (b4) {
          a10.status = "rejected", a10.reason = b4;
        } finally {
          bm = b3;
        }
      }
      function bo(a10, b3) {
        a10._closed = true, a10._closedReason = b3, a10._chunks.forEach(function(c2) {
          "pending" === c2.status ? bf(a10, c2, b3) : "fulfilled" === c2.status && null !== c2.reason && "function" == typeof (c2 = c2.reason).error && c2.error(b3);
        });
      }
      function bp(a10, b3) {
        var c2 = a10._chunks, d2 = c2.get(b3);
        return d2 || (d2 = "string" == typeof (d2 = a10._formData.data.get(a10._prefix + b3)) ? bg(a10, d2, b3) : a10._closed ? new ba("rejected", null, a10._closedReason) : new ba("pending", null, null), c2.set(b3, d2)), d2;
      }
      function bq(a10, b3, c2, d2) {
        var e2 = b3.handler, f2 = b3.parentObject, g2 = b3.key, h2 = b3.map, i2 = b3.path;
        try {
          for (var j3 = 0, k2 = a10._rootArrayContexts, l2 = 1; l2 < i2.length; l2++) {
            var m2 = i2[l2];
            if ("object" != typeof c2 || null === c2 || ah(c2) !== bb && ah(c2) !== bc || !am.call(c2, m2)) throw Error("Invalid reference.");
            if (c2 = c2[m2], ag(c2)) j3 = 0, d2 = k2.get(c2) || d2;
            else if (d2 = null, "string" == typeof c2) j3 = c2.length;
            else if ("bigint" == typeof c2) {
              var n2 = Math.abs(Number(c2));
              j3 = 0 === n2 ? 1 : Math.floor(Math.log10(n2)) + 1;
            } else j3 = ArrayBuffer.isView(c2) ? c2.byteLength : 0;
          }
          var o2 = h2(a10, c2, f2, g2), p2 = b3.arrayRoot;
          null !== p2 && (null !== d2 ? (d2.fork && (p2.fork = true), bl(p2, d2.count, a10)) : 0 < j3 && bl(p2, j3, a10));
        } catch (b4) {
          bs(a10, e2, b4);
          return;
        }
        br(a10, e2, f2, g2, o2);
      }
      function br(a10, b3, c2, d2, e2) {
        "__proto__" !== d2 && (c2[d2] = e2), "" === d2 && null === b3.value && (b3.value = e2), b3.deps--, 0 === b3.deps && null !== (c2 = b3.chunk) && "blocked" === c2.status && (d2 = c2.value, c2.status = "fulfilled", c2.value = b3.value, c2.reason = b3.reason, null !== d2 && bd(a10, d2, b3.value, c2));
      }
      function bs(a10, b3, c2) {
        b3.errored || (b3.errored = true, b3.value = null, b3.reason = c2, null !== (b3 = b3.chunk) && "blocked" === b3.status && bf(a10, b3, c2));
      }
      function bt(a10, b3, c2, d2, e2, f2) {
        var g2 = parseInt((b3 = b3.split(":"))[0], 16), h2 = bp(a10, g2);
        switch ("resolved_model" === h2.status && bn(h2), h2.status) {
          case "fulfilled":
            if (g2 = h2.value, null !== (h2 = h2.reason) && "error" in h2) throw Error("Expected an initialized chunk but got an initialized stream chunk instead. This payload may have been submitted by an older version of React.");
            for (var i2 = 0, j3 = a10._rootArrayContexts, k2 = 1; k2 < b3.length; k2++) {
              if (i2 = b3[k2], "object" != typeof g2 || null === g2 || ah(g2) !== bb && ah(g2) !== bc || !am.call(g2, i2)) throw Error("Invalid reference.");
              ag(g2 = g2[i2]) ? (i2 = 0, h2 = j3.get(g2) || h2) : (h2 = null, i2 = "string" == typeof g2 ? g2.length : "bigint" == typeof g2 ? 0 === (i2 = Math.abs(Number(g2))) ? 1 : Math.floor(Math.log10(i2)) + 1 : ArrayBuffer.isView(g2) ? g2.byteLength : 0);
            }
            return c2 = f2(a10, g2, c2, d2), null !== e2 && (null !== h2 ? (h2.fork && (e2.fork = true), bl(e2, h2.count, a10)) : 0 < i2 && bl(e2, i2, a10)), c2;
          case "blocked":
            return bm ? (a10 = bm, a10.deps++) : a10 = bm = { chunk: null, value: null, reason: null, deps: 1, errored: false }, e2 = { handler: a10, parentObject: c2, key: d2, map: f2, path: b3, arrayRoot: e2 }, null === h2.value ? h2.value = [e2] : h2.value.push(e2), null === h2.reason ? h2.reason = [e2] : h2.reason.push(e2), null;
          case "pending":
            throw Error("Invalid forward reference.");
          default:
            return bm ? (bm.errored = true, bm.value = null, bm.reason = h2.reason) : bm = { chunk: null, value: null, reason: h2.reason, deps: 0, errored: true }, null;
        }
      }
      function bu(a10, b3) {
        if (!ag(b3)) throw Error("Invalid Map initializer.");
        if (true === b3.$$consumed) throw Error("Already initialized Map.");
        return b3.$$consumed = true, new Map(b3);
      }
      function bv(a10, b3) {
        if (!ag(b3)) throw Error("Invalid Set initializer.");
        if (true === b3.$$consumed) throw Error("Already initialized Set.");
        return b3.$$consumed = true, new Set(b3);
      }
      function bw(a10, b3) {
        if (!ag(b3)) throw Error("Invalid Iterator initializer.");
        if (true === b3.$$consumed) throw Error("Already initialized Iterator.");
        return b3.$$consumed = true, b3[Symbol.iterator]();
      }
      function bx(a10, b3, c2, d2) {
        return "then" === d2 && "function" == typeof b3 ? null : b3;
      }
      function by(a10, b3, c2, d2, e2, f2, g2) {
        function h2(b4) {
          if (!j3.errored) {
            j3.errored = true, j3.value = null, j3.reason = b4;
            var c3 = j3.chunk;
            null !== c3 && "blocked" === c3.status && bf(a10, c3, b4);
          }
        }
        b3 = parseInt(b3.slice(2), 16);
        var i2 = a10._prefix + b3;
        if ((d2 = a10._chunks).has(b3)) throw Error("Already initialized typed array.");
        if (d2.set(b3, new ba("rejected", null, Error("Already initialized typed array."))), b3 = a10._formData.data.get(i2).arrayBuffer(), bm) {
          var j3 = bm;
          j3.deps++;
        } else j3 = bm = { chunk: null, value: null, reason: null, deps: 1, errored: false };
        return b3.then(function(b4) {
          try {
            null !== g2 && bl(g2, b4.byteLength, a10);
            var d3 = c2 === ArrayBuffer ? b4 : new c2(b4);
            "__proto__" !== i2 && (e2[f2] = d3), "" === f2 && null === j3.value && (j3.value = d3);
          } catch (a11) {
            h2(a11);
            return;
          }
          j3.deps--, 0 === j3.deps && null !== (b4 = j3.chunk) && "blocked" === b4.status && (d3 = b4.value, b4.status = "fulfilled", b4.value = j3.value, b4.reason = null, null !== d3 && bd(a10, d3, j3.value, b4));
        }, h2), null;
      }
      function bz(a10, b3, c2, d2) {
        var e2 = a10._chunks;
        for (c2 = new ba("fulfilled", c2, d2), e2.set(b3, c2), a10 = a10._formData.data.getAll(a10._prefix + b3), b3 = 0; b3 < a10.length; b3++) "string" == typeof (e2 = a10[b3]) && ("C" === e2[0] ? d2.close("C" === e2 ? '"$undefined"' : e2.slice(1)) : d2.enqueueModel(e2));
      }
      function bA(a10, b3, c2) {
        function d2(a11) {
          "bytes" !== c2 || ArrayBuffer.isView(a11) ? e2.enqueue(a11) : i2.error(Error("Invalid data for bytes stream."));
        }
        if (b3 = parseInt(b3.slice(2), 16), a10._chunks.has(b3)) throw Error("Already initialized stream.");
        var e2 = null, f2 = false, g2 = new ReadableStream({ type: c2, start: function(a11) {
          e2 = a11;
        } }), h2 = null, i2 = { enqueueModel: function(b4) {
          if (null === h2) {
            var c3 = bg(a10, b4, -1);
            bn(c3), "fulfilled" === c3.status ? d2(c3.value) : (c3.then(d2, i2.error), h2 = c3);
          } else {
            c3 = h2;
            var e3 = new ba("pending", null, null);
            e3.then(d2, i2.error), h2 = e3, c3.then(function() {
              h2 === e3 && (h2 = null), bh(a10, e3, b4, -1);
            });
          }
        }, close: function() {
          if (!f2) if (f2 = true, null === h2) e2.close();
          else {
            var a11 = h2;
            h2 = null, a11.then(function() {
              return e2.close();
            });
          }
        }, error: function(a11) {
          if (!f2) if (f2 = true, null === h2) e2.error(a11);
          else {
            var b4 = h2;
            h2 = null, b4.then(function() {
              return e2.error(a11);
            });
          }
        } };
        return bz(a10, b3, g2, i2), g2;
      }
      function bB(a10) {
        this.next = a10;
      }
      function bC(a10, b3, c2) {
        if (b3 = parseInt(b3.slice(2), 16), a10._chunks.has(b3)) throw Error("Already initialized stream.");
        var d2 = [], e2 = false, f2 = 0, g2 = {};
        return g2[r] = function() {
          var a11 = 0;
          return new bB(function(b4) {
            if (void 0 !== b4) throw Error("Values cannot be passed to next() of AsyncIterables passed to Client Components.");
            if (a11 === d2.length) {
              if (e2) return new ba("fulfilled", { done: true, value: void 0 }, null);
              d2[a11] = new ba("pending", null, null);
            }
            return d2[a11++];
          });
        }, bz(a10, b3, c2 = c2 ? g2[r]() : g2, { enqueueModel: function(b4) {
          f2 === d2.length ? d2[f2] = bi(a10, b4, false) : bj(a10, d2[f2], b4, false), f2++;
        }, close: function(b4) {
          if (!e2) for (e2 = true, f2 === d2.length ? d2[f2] = bi(a10, b4, true) : bj(a10, d2[f2], b4, true), f2++; f2 < d2.length; ) bj(a10, d2[f2++], '"$undefined"', true);
        }, error: function(b4) {
          if (!e2) for (e2 = true, f2 === d2.length && (d2[f2] = new ba("pending", null, null)); f2 < d2.length; ) bf(a10, d2[f2++], b4);
        } }), c2;
      }
      function bD(a10, b3, c2) {
        var d2 = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : new FormData(), e2 = 4 < arguments.length && void 0 !== arguments[4] ? arguments[4] : 1e6;
        return { _bundlerConfig: a10, _prefix: b3, _formData: { data: d2, keyPointer: -1, keys: null }, _chunks: /* @__PURE__ */ new Map(), _closed: false, _closedReason: null, _temporaryReferences: c2, _rootArrayContexts: /* @__PURE__ */ new WeakMap(), _arraySizeLimit: e2 };
      }
      function bE(a10) {
        bo(a10, Error("Connection closed."));
      }
      function bF(a10, b3) {
        var c2 = b3.id;
        if ("string" != typeof c2) return null;
        var d2 = a22(a10, c2);
        return a10 = a6(d2), (b3 = b3.bound) instanceof Promise ? Promise.all([b3, a10]).then(function(a11) {
          a11 = a11[0];
          var b4 = a7(d2);
          if (1e3 < a11.length) throw Error("Server Function has too many bound arguments. Received " + a11.length + " but the limit is 1000.");
          return b4.bind.apply(b4, [null].concat(a11));
        }) : a10 ? Promise.resolve(a10).then(function() {
          return a7(d2);
        }) : Promise.resolve(a7(d2));
      }
      function bG(a10, b3, c2, d2) {
        if (bE(a10 = bD(b3, c2, void 0, a10, d2)), (a10 = bp(a10, 0)).then(function() {
        }), "fulfilled" !== a10.status) throw a10.reason;
        return a10.value;
      }
      bB.prototype = {}, bB.prototype[r] = function() {
        return this;
      }, b2.createClientModuleProxy = function(a10) {
        return new Proxy(a10 = E({}, a10, false), M);
      }, b2.createTemporaryReferenceSet = function() {
        return /* @__PURE__ */ new WeakMap();
      }, b2.decodeAction = function(a10, b3) {
        var c2 = new FormData(), d2 = null, e2 = /* @__PURE__ */ new Set();
        return a10.forEach(function(f2, g2) {
          g2.startsWith("$ACTION_") ? g2.startsWith("$ACTION_REF_") ? e2.has(g2) || (e2.add(g2), f2 = bG(a10, b3, f2 = "$ACTION_" + g2.slice(12) + ":"), d2 = bF(b3, f2)) : g2.startsWith("$ACTION_ID_") && !e2.has(g2) && (e2.add(g2), d2 = bF(b3, { id: f2 = g2.slice(11), bound: null })) : c2.append(g2, f2);
        }), null === d2 ? null : d2.then(function(a11) {
          return a11.bind(null, c2);
        });
      }, b2.decodeFormState = function(a10, b3, c2) {
        var d2 = b3.get("$ACTION_KEY");
        if ("string" != typeof d2) return Promise.resolve(null);
        var e2 = null;
        if (b3.forEach(function(a11, d3) {
          d3.startsWith("$ACTION_REF_") && (e2 = bG(b3, c2, "$ACTION_" + d3.slice(12) + ":"));
        }), null === e2) return Promise.resolve(null);
        var f2 = e2.id;
        return Promise.resolve(e2.bound).then(function(b4) {
          return null === b4 ? null : [a10, d2, f2, b4.length - 1];
        });
      }, b2.decodeReply = function(a10, b3, c2) {
        if ("string" == typeof a10) {
          var d2 = new FormData();
          d2.append("0", a10), a10 = d2;
        }
        return b3 = bp(a10 = bD(b3, "", c2 ? c2.temporaryReferences : void 0, a10, c2 ? c2.arraySizeLimit : void 0), 0), bE(a10), b3;
      }, b2.decodeReplyFromAsyncIterable = function(a10, b3, c2) {
        function d2(a11) {
          bo(f2, a11), "function" == typeof e2.throw && e2.throw(a11).then(d2, d2);
        }
        var e2 = a10[r](), f2 = bD(b3, "", c2 ? c2.temporaryReferences : void 0, void 0, c2 ? c2.arraySizeLimit : void 0);
        return e2.next().then(function a11(b4) {
          if (b4.done) bE(f2);
          else {
            var c3 = (b4 = b4.value)[0];
            if ("string" == typeof (b4 = b4[1])) {
              a8(f2._formData, c3, b4);
              var g2 = f2._prefix;
              if (c3.startsWith(g2)) {
                var h2 = f2._chunks;
                c3 = +c3.slice(g2.length), (h2 = h2.get(c3)) && bh(f2, h2, b4, c3);
              }
            } else a8(f2._formData, c3, b4);
            e2.next().then(a11, d2);
          }
        }, d2), bp(f2, 0);
      }, b2.registerClientReference = function(a10, b3, c2) {
        return E(a10, b3 + "#" + c2, false);
      }, b2.registerServerReference = function(a10, b3, c2) {
        return Object.defineProperties(a10, { $$typeof: { value: D2 }, $$id: { value: null === c2 ? b3 : b3 + "#" + c2, configurable: true }, $$bound: { value: null, configurable: true }, bind: { value: H, configurable: true }, toString: I2 });
      }, b2.renderToReadableStream = function(a10, b3, c2) {
        var d2 = new aq(20, a10, b3, c2 ? c2.onError : void 0, c2 ? c2.onPostpone : void 0, U2, U2, c2 ? c2.identifierPrefix : void 0, c2 ? c2.temporaryReferences : void 0);
        if (c2 && c2.signal) {
          var e2 = c2.signal;
          if (e2.aborted) a1(d2, e2.reason);
          else {
            var f2 = function() {
              a1(d2, e2.reason), e2.removeEventListener("abort", f2);
            };
            e2.addEventListener("abort", f2);
          }
        }
        return new ReadableStream({ type: "bytes", start: function() {
          aZ(d2);
        }, pull: function(a11) {
          a0(d2, a11);
        }, cancel: function(a11) {
          d2.destination = null, a1(d2, a11);
        } }, { highWaterMark: 0 });
      }, b2.unstable_prerender = function(a10, b3, c2) {
        return new Promise(function(d2, e2) {
          var f2 = new aq(21, a10, b3, c2 ? c2.onError : void 0, c2 ? c2.onPostpone : void 0, function() {
            d2({ prelude: new ReadableStream({ type: "bytes", pull: function(a11) {
              a0(f2, a11);
            }, cancel: function(a11) {
              f2.destination = null, a1(f2, a11);
            } }, { highWaterMark: 0 }) });
          }, e2, c2 ? c2.identifierPrefix : void 0, c2 ? c2.temporaryReferences : void 0);
          if (c2 && c2.signal) {
            var g2 = c2.signal;
            if (g2.aborted) a1(f2, g2.reason);
            else {
              var h2 = function() {
                a1(f2, g2.reason), g2.removeEventListener("abort", h2);
              };
              g2.addEventListener("abort", h2);
            }
          }
          aZ(f2);
        });
      };
    }, 1417: (a2, b2, c) => {
      "use strict";
      Object.defineProperty(b2, "__esModule", { value: true }), !function(a3, b3) {
        for (var c2 in b3) Object.defineProperty(a3, c2, { enumerable: true, get: b3[c2] });
      }(b2, { getTestReqInfo: function() {
        return g;
      }, withRequest: function() {
        return f;
      } });
      let d = new (c(5521)).AsyncLocalStorage();
      function e(a3, b3) {
        let c2 = b3.header(a3, "next-test-proxy-port");
        if (!c2) return;
        let d2 = b3.url(a3);
        return { url: d2, proxyPort: Number(c2), testData: b3.header(a3, "next-test-data") || "" };
      }
      function f(a3, b3, c2) {
        let f2 = e(a3, b3);
        return f2 ? d.run(f2, c2) : c2();
      }
      function g(a3, b3) {
        let c2 = d.getStore();
        return c2 || (a3 && b3 ? e(a3, b3) : void 0);
      }
    }, 1534: (a2, b2, c) => {
      "use strict";
      c.d(b2, { k: () => h });
      var d = c(8657), e = c(9795), f = c(3089), g = c(1766);
      function h(a3) {
        var b3;
        return b3 = function(a4) {
          let b4 = true, c2 = "", d2 = 0, e2 = "", f2 = false;
          for (let g2 = 0; g2 < a4.length; g2++) {
            let h2 = a4[g2];
            if (["(", ")", ","].includes(h2) && (b4 = true), "(" === h2 && d2++, ")" === h2 && d2--, b4) {
              if (0 === d2) {
                if (" " === h2 && ["event", "function", ""].includes(e2)) e2 = "";
                else if (e2 += h2, ")" === h2) {
                  f2 = true;
                  break;
                }
                continue;
              }
              if (" " === h2) {
                "," !== a4[g2 - 1] && "," !== c2 && ",(" !== c2 && (c2 = "", b4 = false);
                continue;
              }
              e2 += h2, c2 += h2;
            }
          }
          if (!f2) throw new g.C("Unable to normalize signature.");
          return e2;
        }("string" == typeof a3 ? a3 : (0, f.B)(a3)), (0, e.S)((0, d.ZJ)(b3));
      }
    }, 1640: (a2, b2, c) => {
      "use strict";
      c.d(b2, { q: () => f });
      let d = /[|\\{}()[\]^$+*?.-]/, e = /[|\\{}()[\]^$+*?.-]/g;
      function f(a3) {
        return d.test(a3) ? a3.replace(e, "\\$&") : a3;
      }
    }, 1664: (a2, b2, c) => {
      "use strict";
      c.d(b2, { Ck: () => h, EJ: () => l, IN: () => j2, K8: () => k });
      var d = c(4289), e = c(5826), f = c(7223);
      class g extends Error {
        constructor() {
          super("Cookies can only be modified in a Server Action or Route Handler. Read more: https://nextjs.org/docs/app/api-reference/functions/cookies#options");
        }
        static callable() {
          throw new g();
        }
      }
      class h {
        static seal(a3) {
          return new Proxy(a3, { get(a4, b3, c2) {
            switch (b3) {
              case "clear":
              case "delete":
              case "set":
                return g.callable;
              default:
                return e.l.get(a4, b3, c2);
            }
          } });
        }
      }
      let i = Symbol.for("next.mutated.cookies");
      function j2(a3, b3) {
        let c2 = function(a4) {
          let b4 = a4[i];
          return b4 && Array.isArray(b4) && 0 !== b4.length ? b4 : [];
        }(b3);
        if (0 === c2.length) return false;
        let e2 = new d.VO(a3), f2 = e2.getAll();
        for (let a4 of c2) e2.set(a4);
        for (let a4 of f2) e2.set(a4);
        return true;
      }
      class k {
        static wrap(a3, b3) {
          let c2 = new d.VO(new Headers());
          for (let b4 of a3.getAll()) c2.set(b4);
          let g2 = [], h2 = /* @__PURE__ */ new Set(), j3 = () => {
            let a4 = f.J.getStore();
            if (a4 && (a4.pathWasRevalidated = true), g2 = c2.getAll().filter((a5) => h2.has(a5.name)), b3) {
              let a5 = [];
              for (let b4 of g2) {
                let c3 = new d.VO(new Headers());
                c3.set(b4), a5.push(c3.toString());
              }
              b3(a5);
            }
          }, k2 = new Proxy(c2, { get(a4, b4, c3) {
            switch (b4) {
              case i:
                return g2;
              case "delete":
                return function(...b5) {
                  h2.add("string" == typeof b5[0] ? b5[0] : b5[0].name);
                  try {
                    return a4.delete(...b5), k2;
                  } finally {
                    j3();
                  }
                };
              case "set":
                return function(...b5) {
                  h2.add("string" == typeof b5[0] ? b5[0] : b5[0].name);
                  try {
                    return a4.set(...b5), k2;
                  } finally {
                    j3();
                  }
                };
              default:
                return e.l.get(a4, b4, c3);
            }
          } });
          return k2;
        }
      }
      function l(a3) {
        let b3 = new Proxy(a3.mutableCookies, { get(c2, d2, f2) {
          switch (d2) {
            case "delete":
              return function(...d3) {
                return m(a3, "cookies().delete"), c2.delete(...d3), b3;
              };
            case "set":
              return function(...d3) {
                return m(a3, "cookies().set"), c2.set(...d3), b3;
              };
            default:
              return e.l.get(c2, d2, f2);
          }
        } });
        return b3;
      }
      function m(a3, b3) {
        if ("action" !== a3.phase) throw new g();
      }
    }, 1668: (a2, b2, c) => {
      "use strict";
      function d(a3) {
        let b3 = function(a4) {
          let b4;
          try {
            b4 = new URL(a4, "http://n");
          } catch {
          }
          return b4;
        }(a3);
        if (!b3) return;
        let c2 = {};
        for (let a4 of b3.searchParams.keys()) {
          let d2 = b3.searchParams.getAll(a4);
          c2[a4] = d2.length > 1 ? d2 : d2[0];
        }
        return { query: c2, hash: b3.hash, search: b3.search, path: b3.pathname, pathname: b3.pathname, href: `${b3.pathname}${b3.search}${b3.hash}`, host: "", hostname: "", auth: "", protocol: "", slashes: null, port: "" };
      }
      c.d(b2, { Rk: () => d }), c(2456);
    }, 1679: (a2, b2, c) => {
      "use strict";
      c.d(b2, { u_: () => k, iL: () => g, Vy: () => i, SN: () => j2 });
      var d = c(5752), e = c(9565), f = c(4291);
      let g = "ResponseAborted";
      class h extends Error {
        constructor(...a3) {
          super(...a3), this.name = g;
        }
      }
      function i(a3) {
        let b3 = new AbortController();
        return a3.once("close", () => {
          a3.writableFinished || b3.abort(new h());
        }), b3;
      }
      function j2(a3) {
        let { errored: b3, destroyed: c2 } = a3;
        if (b3 || c2) return AbortSignal.abort(b3 ?? new h());
        let { signal: d2 } = i(a3);
        return d2;
      }
      class k {
        static fromBaseNextRequest(a3, b3) {
          return k.fromWebNextRequest(a3);
        }
        static fromNodeNextRequest(a3, b3) {
          let c2, g2 = null;
          if ("GET" !== a3.method && "HEAD" !== a3.method && a3.body && (g2 = a3.body), a3.url.startsWith("http")) c2 = new URL(a3.url);
          else {
            let b4 = (0, d.Ny)(a3, "initURL");
            c2 = b4 && b4.startsWith("http") ? new URL(a3.url, b4) : new URL(a3.url, "http://n");
          }
          return new f.J(c2, { method: a3.method, headers: (0, e.p$)(a3.headers), duplex: "half", signal: b3, ...b3.aborted ? {} : { body: g2 } });
        }
        static fromWebNextRequest(a3) {
          let b3 = null;
          return "GET" !== a3.method && "HEAD" !== a3.method && (b3 = a3.body), new f.J(a3.url, { method: a3.method, headers: (0, e.p$)(a3.headers), duplex: "half", signal: a3.request.signal, ...a3.request.signal.aborted ? {} : { body: b3 } });
        }
      }
    }, 1699: (a2, b2, c) => {
      "use strict";
      c.d(b2, { C: () => h, Y: () => e });
      var d = c(2398);
      async function e(a3, b3) {
        if (!a3) return b3();
        let c2 = f(a3);
        try {
          return await b3();
        } finally {
          let b4 = function(a4, b5) {
            let c3 = new Set(a4.pendingRevalidatedTags), d2 = new Set(a4.pendingRevalidateWrites);
            return { pendingRevalidatedTags: b5.pendingRevalidatedTags.filter((a5) => !c3.has(a5)), pendingRevalidates: Object.fromEntries(Object.entries(b5.pendingRevalidates).filter(([b6]) => !(b6 in a4.pendingRevalidates))), pendingRevalidateWrites: b5.pendingRevalidateWrites.filter((a5) => !d2.has(a5)) };
          }(c2, f(a3));
          await h(a3, b4);
        }
      }
      function f(a3) {
        return { pendingRevalidatedTags: a3.pendingRevalidatedTags ? [...a3.pendingRevalidatedTags] : [], pendingRevalidates: { ...a3.pendingRevalidates }, pendingRevalidateWrites: a3.pendingRevalidateWrites ? [...a3.pendingRevalidateWrites] : [] };
      }
      async function g(a3, b3) {
        if (0 === a3.length) return;
        let c2 = [];
        b3 && c2.push(b3.revalidateTag(a3));
        let e2 = (0, d.a1)();
        if (e2) for (let b4 of e2) c2.push(b4.expireTags(...a3));
        await Promise.all(c2);
      }
      async function h(a3, b3) {
        let c2 = (null == b3 ? void 0 : b3.pendingRevalidatedTags) ?? a3.pendingRevalidatedTags ?? [], d2 = (null == b3 ? void 0 : b3.pendingRevalidates) ?? a3.pendingRevalidates ?? {}, e2 = (null == b3 ? void 0 : b3.pendingRevalidateWrites) ?? a3.pendingRevalidateWrites ?? [];
        return Promise.all([g(c2, a3.incrementalCache), ...Object.values(d2), ...e2]);
      }
    }, 1766: (a2, b2, c) => {
      "use strict";
      c.d(b2, { C: () => f });
      let d = "2.50.4", e = { getDocsUrl: ({ docsBaseUrl: a3, docsPath: b3 = "", docsSlug: c2 }) => b3 ? `${a3 ?? "https://viem.sh"}${b3}${c2 ? `#${c2}` : ""}` : void 0, version: `viem@${d}` };
      class f extends Error {
        constructor(a3, b3 = {}) {
          let c2 = b3.cause instanceof f ? b3.cause.details : b3.cause?.message ? b3.cause.message : b3.details, g = b3.cause instanceof f && b3.cause.docsPath || b3.docsPath, h = e.getDocsUrl?.({ ...b3, docsPath: g });
          super([a3 || "An error occurred.", "", ...b3.metaMessages ? [...b3.metaMessages, ""] : [], ...h ? [`Docs: ${h}`] : [], ...c2 ? [`Details: ${c2}`] : [], ...e.version ? [`Version: ${e.version}`] : []].join("\n"), b3.cause ? { cause: b3.cause } : void 0), Object.defineProperty(this, "details", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "docsPath", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "metaMessages", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "shortMessage", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "version", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "BaseError" }), this.details = c2, this.docsPath = g, this.metaMessages = b3.metaMessages, this.name = b3.name ?? this.name, this.shortMessage = a3, this.version = d;
        }
        walk(a3) {
          return function a4(b3, c2) {
            return c2?.(b3) ? b3 : b3 && "object" == typeof b3 && "cause" in b3 && void 0 !== b3.cause ? a4(b3.cause, c2) : c2 ? null : b3;
          }(this, a3);
        }
      }
    }, 1871: (a2, b2, c) => {
      "use strict";
      function d(a3, b3) {
        let c2 = a3.exec(b3);
        return c2?.groups;
      }
      c.d(b2, { BD: () => e, Ge: () => f, Yv: () => d, wj: () => g });
      let e = /^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/, f = /^u?int(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/, g = /^\(.+?\).*?$/;
    }, 1983: (a2, b2, c) => {
      "use strict";
      c.d(b2, { A: () => d });
      var d = function(a3) {
        return a3.PAGES = "PAGES", a3.PAGES_API = "PAGES_API", a3.APP_PAGE = "APP_PAGE", a3.APP_ROUTE = "APP_ROUTE", a3.IMAGE = "IMAGE", a3;
      }({});
    }, 2058: (a2, b2, c) => {
      "use strict";
      c.d(b2, { xl: () => g });
      let d = Object.defineProperty(Error("Invariant: AsyncLocalStorage accessed in runtime where it is not available"), "__NEXT_ERROR_CODE", { value: "E504", enumerable: false, configurable: true });
      class e {
        disable() {
          throw d;
        }
        getStore() {
        }
        run() {
          throw d;
        }
        exit() {
          throw d;
        }
        enterWith() {
          throw d;
        }
        static bind(a3) {
          return a3;
        }
      }
      let f = "undefined" != typeof globalThis && globalThis.AsyncLocalStorage;
      function g() {
        return f ? new f() : new e();
      }
    }, 2226: (a2, b2, c) => {
      "use strict";
      c.d(b2, { A: () => d });
      class d extends Map {
        constructor(a3) {
          super(), Object.defineProperty(this, "maxSize", { enumerable: true, configurable: true, writable: true, value: void 0 }), this.maxSize = a3;
        }
        get(a3) {
          let b3 = super.get(a3);
          return super.has(a3) && (super.delete(a3), super.set(a3, b3)), b3;
        }
        set(a3, b3) {
          if (super.has(a3) && super.delete(a3), super.set(a3, b3), this.maxSize && this.size > this.maxSize) {
            let a4 = super.keys().next().value;
            void 0 !== a4 && super.delete(a4);
          }
          return this;
        }
      }
    }, 2392: (a2, b2, c) => {
      "use strict";
      c.d(b2, { X$: () => e, kf: () => f, x8: () => d });
      let d = (a3) => {
        Promise.resolve().then(() => {
          setTimeout(a3, 0);
        });
      }, e = (a3) => {
        setTimeout(a3, 0);
      };
      function f() {
        return new Promise((a3) => setTimeout(a3, 0));
      }
    }, 2398: (a2, b2, c) => {
      "use strict";
      c.d(b2, { fs: () => i, a1: () => h });
      var d = c(4055);
      c(5335), c(5356).Buffer, new d.q(52428800, (a3) => a3.size), process.env.NEXT_PRIVATE_DEBUG_CACHE && console.debug.bind(console, "DefaultCacheHandler:"), process.env.NEXT_PRIVATE_DEBUG_CACHE && ((a3, ...b3) => {
        console.log(`use-cache: ${a3}`, ...b3);
      }), Symbol.for("@next/cache-handlers");
      let e = Symbol.for("@next/cache-handlers-map"), f = Symbol.for("@next/cache-handlers-set"), g = globalThis;
      function h() {
        if (g[f]) return g[f].values();
      }
      function i() {
        if (g[e]) return g[e].entries();
      }
    }, 2449: (a2, b2, c) => {
      "use strict";
      let d;
      c.d(b2, { N: () => v2 });
      var e = c(5723), f = c(7382), g = c.n(f), h = c(1212), i = c(5335);
      class j2 {
        constructor(a3) {
          this.fs = a3, this.tasks = [];
        }
        findOrCreateTask(a3) {
          for (let b4 of this.tasks) if (b4[0] === a3) return b4;
          let b3 = this.fs.mkdir(a3);
          b3.catch(() => {
          });
          let c2 = [a3, b3, []];
          return this.tasks.push(c2), c2;
        }
        append(a3, b3) {
          let c2 = this.findOrCreateTask(g().dirname(a3)), d2 = c2[1].then(() => this.fs.writeFile(a3, b3));
          d2.catch(() => {
          }), c2[2].push(d2);
        }
        wait() {
          return Promise.all(this.tasks.flatMap((a3) => a3[2]));
        }
      }
      var k = c(5063), l = c(4055);
      class m {
        static #a = this.debug = !!process.env.NEXT_PRIVATE_DEBUG_CACHE;
        constructor(a3) {
          if (this.fs = a3.fs, this.flushToDisk = a3.flushToDisk, this.serverDistDir = a3.serverDistDir, this.revalidatedTags = a3.revalidatedTags, a3.maxMemoryCacheSize) if (m.memoryCache) m.debug && console.log("memory store already initialized");
          else {
            var b3;
            m.debug && console.log("using memory store for fetch cache"), b3 = a3.maxMemoryCacheSize, d || (d = new l.q(b3, function({ value: a4 }) {
              var b4;
              if (!a4) return 25;
              if (a4.kind === k.y.REDIRECT) return JSON.stringify(a4.props).length;
              if (a4.kind === k.y.IMAGE) throw Object.defineProperty(Error("invariant image should not be incremental-cache"), "__NEXT_ERROR_CODE", { value: "E501", enumerable: false, configurable: true });
              if (a4.kind === k.y.FETCH) return JSON.stringify(a4.data || "").length;
              if (a4.kind === k.y.APP_ROUTE) return a4.body.length;
              return a4.html.length + ((null == (b4 = JSON.stringify(a4.kind === k.y.APP_PAGE ? a4.rscData : a4.pageData)) ? void 0 : b4.length) || 0);
            })), m.memoryCache = d;
          }
          else m.debug && console.log("not using memory store for fetch cache");
        }
        resetRequestCache() {
        }
        async revalidateTag(...a3) {
          let [b3] = a3;
          if (b3 = "string" == typeof b3 ? [b3] : b3, m.debug && console.log("revalidateTag", b3), 0 !== b3.length) for (let a4 of b3) i.n.has(a4) || i.n.set(a4, Date.now());
        }
        async get(...a3) {
          var b3, c2, d2, f2, g2, j3;
          let [k2, l2] = a3, { kind: n2 } = l2, o2 = null == (b3 = m.memoryCache) ? void 0 : b3.get(k2);
          if (m.debug && (n2 === e.Bs.FETCH ? console.log("get", k2, l2.tags, n2, !!o2) : console.log("get", k2, n2, !!o2)), (null == o2 || null == (c2 = o2.value) ? void 0 : c2.kind) === e.yD.APP_PAGE || (null == o2 || null == (d2 = o2.value) ? void 0 : d2.kind) === e.yD.APP_ROUTE || (null == o2 || null == (f2 = o2.value) ? void 0 : f2.kind) === e.yD.PAGES) {
            let a4, b4 = null == (j3 = o2.value.headers) ? void 0 : j3[h.VC];
            if ("string" == typeof b4 && (a4 = b4.split(",")), (null == a4 ? void 0 : a4.length) && (0, i.Q)(a4, (null == o2 ? void 0 : o2.lastModified) || Date.now())) return null;
          } else (null == o2 || null == (g2 = o2.value) ? void 0 : g2.kind) === e.yD.FETCH && (l2.kind === e.Bs.FETCH ? [...l2.tags || [], ...l2.softTags || []] : []).some((a4) => !!this.revalidatedTags.includes(a4) || (0, i.Q)([a4], (null == o2 ? void 0 : o2.lastModified) || Date.now())) && (o2 = void 0);
          return o2 ?? null;
        }
        async set(a3, b3, c2) {
          var d2;
          if (null == (d2 = m.memoryCache) || d2.set(a3, { value: b3, lastModified: Date.now() }), m.debug && console.log("set", a3), !this.flushToDisk || !b3) return;
          let f2 = new j2(this.fs);
          if (b3.kind === e.yD.APP_ROUTE) {
            let c3 = this.getFilePath(`${a3}.body`, e.Bs.APP_ROUTE);
            f2.append(c3, b3.body);
            let d3 = { headers: b3.headers, status: b3.status, postponed: void 0, segmentPaths: void 0 };
            f2.append(c3.replace(/\.body$/, h.EP), JSON.stringify(d3, null, 2));
          } else if (b3.kind === e.yD.PAGES || b3.kind === e.yD.APP_PAGE) {
            let d3 = b3.kind === e.yD.APP_PAGE, g2 = this.getFilePath(`${a3}.html`, d3 ? e.Bs.APP_PAGE : e.Bs.PAGES);
            if (f2.append(g2, b3.html), c2.fetchCache || c2.isFallback || f2.append(this.getFilePath(`${a3}${d3 ? c2.isRoutePPREnabled ? h.pu : h.RM : h.x3}`, d3 ? e.Bs.APP_PAGE : e.Bs.PAGES), d3 ? b3.rscData : JSON.stringify(b3.pageData)), (null == b3 ? void 0 : b3.kind) === e.yD.APP_PAGE) {
              let a4;
              if (b3.segmentData) {
                a4 = [];
                let c4 = g2.replace(/\.html$/, h.mH);
                for (let [d4, e2] of b3.segmentData) {
                  a4.push(d4);
                  let b4 = c4 + d4 + h.tz;
                  f2.append(b4, e2);
                }
              }
              let c3 = { headers: b3.headers, status: b3.status, postponed: b3.postponed, segmentPaths: a4 };
              f2.append(g2.replace(/\.html$/, h.EP), JSON.stringify(c3));
            }
          } else if (b3.kind === e.yD.FETCH) {
            let d3 = this.getFilePath(a3, e.Bs.FETCH);
            f2.append(d3, JSON.stringify({ ...b3, tags: c2.fetchCache ? c2.tags : [] }));
          }
          await f2.wait();
        }
        getFilePath(a3, b3) {
          switch (b3) {
            case e.Bs.FETCH:
              return g().join(this.serverDistDir, "..", "cache", "fetch-cache", a3);
            case e.Bs.PAGES:
              return g().join(this.serverDistDir, "pages", a3);
            case e.Bs.IMAGE:
            case e.Bs.APP_PAGE:
            case e.Bs.APP_ROUTE:
              return g().join(this.serverDistDir, "app", a3);
            default:
              throw Object.defineProperty(Error(`Unexpected file path kind: ${b3}`), "__NEXT_ERROR_CODE", { value: "E479", enumerable: false, configurable: true });
          }
        }
      }
      var n = c(622);
      function o(a3) {
        return a3.replace(/(?:\/index)?\/?$/, "") || "/";
      }
      class p {
        static #a = this.cacheControls = /* @__PURE__ */ new Map();
        constructor(a3) {
          this.prerenderManifest = a3;
        }
        get(a3) {
          let b3 = p.cacheControls.get(a3);
          if (b3) return b3;
          let c2 = this.prerenderManifest.routes[a3];
          if (c2) {
            let { initialRevalidateSeconds: a4, initialExpireSeconds: b4 } = c2;
            if (void 0 !== a4) return { revalidate: a4, expire: b4 };
          }
          let d2 = this.prerenderManifest.dynamicRoutes[a3];
          if (d2) {
            let { fallbackRevalidate: a4, fallbackExpire: b4 } = d2;
            if (void 0 !== a4) return { revalidate: a4, expire: b4 };
          }
        }
        set(a3, b3) {
          p.cacheControls.set(a3, b3);
        }
        clear() {
          p.cacheControls.clear();
        }
      }
      var q2 = c(6859), r = c(9904), s = c(8360), t = c(7223), u = c(4023);
      class v2 {
        static #a = this.debug = !!process.env.NEXT_PRIVATE_DEBUG_CACHE;
        constructor({ fs: a3, dev: b3, flushToDisk: c2, minimalMode: d2, serverDistDir: e2, requestHeaders: f2, maxMemoryCacheSize: g2, getPrerenderManifest: i2, fetchCacheKeyPrefix: j3, CurCacheHandler: k2, allowedRevalidateHeaderKeys: l2 }) {
          var n2, o2, q3, r2;
          this.locks = /* @__PURE__ */ new Map(), this.hasCustomCacheHandler = !!k2;
          let t2 = Symbol.for("@next/cache-handlers"), u2 = globalThis;
          if (k2) v2.debug && console.log("using custom cache handler", k2.name);
          else {
            let b4 = u2[t2];
            (null == b4 ? void 0 : b4.FetchCache) ? k2 = b4.FetchCache : a3 && e2 && (v2.debug && console.log("using filesystem cache handler"), k2 = m);
          }
          process.env.__NEXT_TEST_MAX_ISR_CACHE && (g2 = parseInt(process.env.__NEXT_TEST_MAX_ISR_CACHE, 10)), this.dev = b3, this.disableForTestmode = "true" === process.env.NEXT_PRIVATE_TEST_PROXY, this.minimalMode = d2, this.requestHeaders = f2, this.allowedRevalidateHeaderKeys = l2, this.prerenderManifest = i2(), this.cacheControls = new p(this.prerenderManifest), this.fetchCacheKeyPrefix = j3;
          let w2 = [];
          f2[h.kz] === (null == (o2 = this.prerenderManifest) || null == (n2 = o2.preview) ? void 0 : n2.previewModeId) && (this.isOnDemandRevalidate = true), d2 && (w2 = (0, s.l5)(f2, null == (r2 = this.prerenderManifest) || null == (q3 = r2.preview) ? void 0 : q3.previewModeId)), k2 && (this.cacheHandler = new k2({ dev: b3, fs: a3, flushToDisk: c2, serverDistDir: e2, revalidatedTags: w2, maxMemoryCacheSize: g2, _requestHeaders: f2, fetchCacheKeyPrefix: j3 }));
        }
        calculateRevalidate(a3, b3, c2, d2) {
          if (c2) return Math.floor(performance.timeOrigin + performance.now() - 1e3);
          let e2 = this.cacheControls.get(o(a3)), f2 = e2 ? e2.revalidate : !d2 && 1;
          return "number" == typeof f2 ? 1e3 * f2 + b3 : f2;
        }
        _getPathname(a3, b3) {
          return b3 ? a3 : (0, n.i)(a3);
        }
        resetRequestCache() {
          var a3, b3;
          null == (b3 = this.cacheHandler) || null == (a3 = b3.resetRequestCache) || a3.call(b3);
        }
        async lock(a3) {
          for (; ; ) {
            let b4 = this.locks.get(a3);
            if (v2.debug && console.log("lock get", a3, !!b4), !b4) break;
            await b4;
          }
          let { resolve: b3, promise: c2 } = new u.q();
          return v2.debug && console.log("successfully locked", a3), this.locks.set(a3, c2), () => {
            b3(), this.locks.delete(a3);
          };
        }
        async revalidateTag(a3) {
          var b3;
          return null == (b3 = this.cacheHandler) ? void 0 : b3.revalidateTag(a3);
        }
        async generateCacheKey(a3, b3 = {}) {
          let c2 = [], d2 = new TextEncoder(), e2 = new TextDecoder();
          if (b3.body) if (b3.body instanceof Uint8Array) c2.push(e2.decode(b3.body)), b3._ogBody = b3.body;
          else if ("function" == typeof b3.body.getReader) {
            let a4 = b3.body, f3 = [];
            try {
              await a4.pipeTo(new WritableStream({ write(a5) {
                "string" == typeof a5 ? (f3.push(d2.encode(a5)), c2.push(a5)) : (f3.push(a5), c2.push(e2.decode(a5, { stream: true })));
              } })), c2.push(e2.decode());
              let g3 = f3.reduce((a5, b4) => a5 + b4.length, 0), h3 = new Uint8Array(g3), i2 = 0;
              for (let a5 of f3) h3.set(a5, i2), i2 += a5.length;
              b3._ogBody = h3;
            } catch (a5) {
              console.error("Problem reading body", a5);
            }
          } else if ("function" == typeof b3.body.keys) {
            let a4 = b3.body;
            for (let d3 of (b3._ogBody = b3.body, /* @__PURE__ */ new Set([...a4.keys()]))) {
              let b4 = a4.getAll(d3);
              c2.push(`${d3}=${(await Promise.all(b4.map(async (a5) => "string" == typeof a5 ? a5 : await a5.text()))).join(",")}`);
            }
          } else if ("function" == typeof b3.body.arrayBuffer) {
            let a4 = b3.body, d3 = await a4.arrayBuffer();
            c2.push(await a4.text()), b3._ogBody = new Blob([d3], { type: a4.type });
          } else "string" == typeof b3.body && (c2.push(b3.body), b3._ogBody = b3.body);
          let f2 = "function" == typeof (b3.headers || {}).keys ? Object.fromEntries(b3.headers) : Object.assign({}, b3.headers);
          "traceparent" in f2 && delete f2.traceparent, "tracestate" in f2 && delete f2.tracestate;
          let g2 = JSON.stringify(["v3", this.fetchCacheKeyPrefix || "", a3, b3.method, f2, b3.mode, b3.redirect, b3.credentials, b3.referrer, b3.referrerPolicy, b3.integrity, b3.cache, c2]);
          {
            var h2;
            let a4 = d2.encode(g2);
            return h2 = await crypto.subtle.digest("SHA-256", a4), Array.prototype.map.call(new Uint8Array(h2), (a5) => a5.toString(16).padStart(2, "0")).join("");
          }
        }
        async get(a3, b3) {
          var c2, d2, f2, g2;
          let i2, j3;
          if (b3.kind === e.Bs.FETCH) {
            let b4 = q2.FP.getStore(), c3 = b4 ? (0, q2.E0)(b4) : null;
            if (c3) {
              let b5 = c3.fetch.get(a3);
              if ((null == b5 ? void 0 : b5.kind) === e.yD.FETCH) return { isStale: false, value: b5 };
            }
          }
          if (this.disableForTestmode || this.dev && (b3.kind !== e.Bs.FETCH || "no-cache" === this.requestHeaders["cache-control"])) return null;
          a3 = this._getPathname(a3, b3.kind === e.Bs.FETCH);
          let k2 = await (null == (c2 = this.cacheHandler) ? void 0 : c2.get(a3, b3));
          if (b3.kind === e.Bs.FETCH) {
            if (!k2) return null;
            if ((null == (f2 = k2.value) ? void 0 : f2.kind) !== e.yD.FETCH) throw Object.defineProperty(new r.z(`Expected cached value for cache key ${JSON.stringify(a3)} to be a "FETCH" kind, got ${JSON.stringify(null == (g2 = k2.value) ? void 0 : g2.kind)} instead.`), "__NEXT_ERROR_CODE", { value: "E653", enumerable: false, configurable: true });
            let c3 = t.J.getStore();
            if ([...b3.tags || [], ...b3.softTags || []].some((a4) => {
              var b4, d4;
              return (null == (b4 = this.revalidatedTags) ? void 0 : b4.includes(a4)) || (null == c3 || null == (d4 = c3.pendingRevalidatedTags) ? void 0 : d4.includes(a4));
            })) return null;
            let d3 = b3.revalidate || k2.value.revalidate, h2 = (performance.timeOrigin + performance.now() - (k2.lastModified || 0)) / 1e3, i3 = k2.value.data;
            return { isStale: h2 > d3, value: { kind: e.yD.FETCH, data: i3, revalidate: d3 } };
          }
          if ((null == k2 || null == (d2 = k2.value) ? void 0 : d2.kind) === e.yD.FETCH) throw Object.defineProperty(new r.z(`Expected cached value for cache key ${JSON.stringify(a3)} not to be a ${JSON.stringify(b3.kind)} kind, got "FETCH" instead.`), "__NEXT_ERROR_CODE", { value: "E652", enumerable: false, configurable: true });
          let l2 = null, m2 = this.cacheControls.get(o(a3));
          return (null == k2 ? void 0 : k2.lastModified) === -1 ? (i2 = -1, j3 = -1 * h.qF) : i2 = !!(false !== (j3 = this.calculateRevalidate(a3, (null == k2 ? void 0 : k2.lastModified) || performance.timeOrigin + performance.now(), this.dev ?? false, b3.isFallback)) && j3 < performance.timeOrigin + performance.now()) || void 0, k2 && (l2 = { isStale: i2, cacheControl: m2, revalidateAfter: j3, value: k2.value }), !k2 && this.prerenderManifest.notFoundRoutes.includes(a3) && (l2 = { isStale: i2, value: null, cacheControl: m2, revalidateAfter: j3 }, this.set(a3, l2.value, { ...b3, cacheControl: m2 })), l2;
        }
        async set(a3, b3, c2) {
          if ((null == b3 ? void 0 : b3.kind) === e.yD.FETCH) {
            let c3 = q2.FP.getStore(), d3 = c3 ? (0, q2.fm)(c3) : null;
            d3 && d3.fetch.set(a3, b3);
          }
          if (this.disableForTestmode || this.dev && !c2.fetchCache) return;
          a3 = this._getPathname(a3, c2.fetchCache);
          let d2 = JSON.stringify(b3).length;
          if (c2.fetchCache && d2 > 2097152 && !this.hasCustomCacheHandler && !c2.isImplicitBuildTimeCache) {
            let b4 = `Failed to set Next.js data cache for ${c2.fetchUrl || a3}, items over 2MB can not be cached (${d2} bytes)`;
            if (this.dev) throw Object.defineProperty(Error(b4), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
            console.warn(b4);
            return;
          }
          try {
            var f2;
            !c2.fetchCache && c2.cacheControl && this.cacheControls.set(o(a3), c2.cacheControl), await (null == (f2 = this.cacheHandler) ? void 0 : f2.set(a3, b3, c2));
          } catch (b4) {
            console.warn("Failed to update prerender cache for", a3, b4);
          }
        }
      }
    }, 2456: (a2, b2, c) => {
      "use strict";
      c.d(b2, { B: () => f, KD: () => i, Wc: () => l, _A: () => j2, _V: () => g, hY: () => d, j9: () => k, kO: () => h, ts: () => e });
      let d = "rsc", e = "next-action", f = "next-router-state-tree", g = "next-router-prefetch", h = "next-url", i = [d, f, g, "next-hmr-refresh", "next-router-segment-prefetch"], j2 = "_rsc", k = "x-nextjs-rewritten-path", l = "x-nextjs-rewritten-query";
    }, 2569: (a2) => {
      (() => {
        "use strict";
        "undefined" != typeof __nccwpck_require__ && (__nccwpck_require__.ab = "//");
        var b2 = {};
        (() => {
          function a3(a4, b3) {
            void 0 === b3 && (b3 = {});
            for (var c2 = function(a5) {
              for (var b4 = [], c3 = 0; c3 < a5.length; ) {
                var d3 = a5[c3];
                if ("*" === d3 || "+" === d3 || "?" === d3) {
                  b4.push({ type: "MODIFIER", index: c3, value: a5[c3++] });
                  continue;
                }
                if ("\\" === d3) {
                  b4.push({ type: "ESCAPED_CHAR", index: c3++, value: a5[c3++] });
                  continue;
                }
                if ("{" === d3) {
                  b4.push({ type: "OPEN", index: c3, value: a5[c3++] });
                  continue;
                }
                if ("}" === d3) {
                  b4.push({ type: "CLOSE", index: c3, value: a5[c3++] });
                  continue;
                }
                if (":" === d3) {
                  for (var e2 = "", f3 = c3 + 1; f3 < a5.length; ) {
                    var g3 = a5.charCodeAt(f3);
                    if (g3 >= 48 && g3 <= 57 || g3 >= 65 && g3 <= 90 || g3 >= 97 && g3 <= 122 || 95 === g3) {
                      e2 += a5[f3++];
                      continue;
                    }
                    break;
                  }
                  if (!e2) throw TypeError("Missing parameter name at ".concat(c3));
                  b4.push({ type: "NAME", index: c3, value: e2 }), c3 = f3;
                  continue;
                }
                if ("(" === d3) {
                  var h3 = 1, i2 = "", f3 = c3 + 1;
                  if ("?" === a5[f3]) throw TypeError('Pattern cannot start with "?" at '.concat(f3));
                  for (; f3 < a5.length; ) {
                    if ("\\" === a5[f3]) {
                      i2 += a5[f3++] + a5[f3++];
                      continue;
                    }
                    if (")" === a5[f3]) {
                      if (0 == --h3) {
                        f3++;
                        break;
                      }
                    } else if ("(" === a5[f3] && (h3++, "?" !== a5[f3 + 1])) throw TypeError("Capturing groups are not allowed at ".concat(f3));
                    i2 += a5[f3++];
                  }
                  if (h3) throw TypeError("Unbalanced pattern at ".concat(c3));
                  if (!i2) throw TypeError("Missing pattern at ".concat(c3));
                  b4.push({ type: "PATTERN", index: c3, value: i2 }), c3 = f3;
                  continue;
                }
                b4.push({ type: "CHAR", index: c3, value: a5[c3++] });
              }
              return b4.push({ type: "END", index: c3, value: "" }), b4;
            }(a4), d2 = b3.prefixes, f2 = void 0 === d2 ? "./" : d2, g2 = b3.delimiter, h2 = void 0 === g2 ? "/#?" : g2, i = [], j2 = 0, k = 0, l = "", m = function(a5) {
              if (k < c2.length && c2[k].type === a5) return c2[k++].value;
            }, n = function(a5) {
              var b4 = m(a5);
              if (void 0 !== b4) return b4;
              var d3 = c2[k], e2 = d3.type, f3 = d3.index;
              throw TypeError("Unexpected ".concat(e2, " at ").concat(f3, ", expected ").concat(a5));
            }, o = function() {
              for (var a5, b4 = ""; a5 = m("CHAR") || m("ESCAPED_CHAR"); ) b4 += a5;
              return b4;
            }, p = function(a5) {
              for (var b4 = 0; b4 < h2.length; b4++) {
                var c3 = h2[b4];
                if (a5.indexOf(c3) > -1) return true;
              }
              return false;
            }, q2 = function(a5) {
              var b4 = i[i.length - 1], c3 = a5 || (b4 && "string" == typeof b4 ? b4 : "");
              if (b4 && !c3) throw TypeError('Must have text between two parameters, missing text after "'.concat(b4.name, '"'));
              return !c3 || p(c3) ? "[^".concat(e(h2), "]+?") : "(?:(?!".concat(e(c3), ")[^").concat(e(h2), "])+?");
            }; k < c2.length; ) {
              var r = m("CHAR"), s = m("NAME"), t = m("PATTERN");
              if (s || t) {
                var u = r || "";
                -1 === f2.indexOf(u) && (l += u, u = ""), l && (i.push(l), l = ""), i.push({ name: s || j2++, prefix: u, suffix: "", pattern: t || q2(u), modifier: m("MODIFIER") || "" });
                continue;
              }
              var v2 = r || m("ESCAPED_CHAR");
              if (v2) {
                l += v2;
                continue;
              }
              if (l && (i.push(l), l = ""), m("OPEN")) {
                var u = o(), w2 = m("NAME") || "", x2 = m("PATTERN") || "", y = o();
                n("CLOSE"), i.push({ name: w2 || (x2 ? j2++ : ""), pattern: w2 && !x2 ? q2(u) : x2, prefix: u, suffix: y, modifier: m("MODIFIER") || "" });
                continue;
              }
              n("END");
            }
            return i;
          }
          function c(a4, b3) {
            void 0 === b3 && (b3 = {});
            var c2 = f(b3), d2 = b3.encode, e2 = void 0 === d2 ? function(a5) {
              return a5;
            } : d2, g2 = b3.validate, h2 = void 0 === g2 || g2, i = a4.map(function(a5) {
              if ("object" == typeof a5) return new RegExp("^(?:".concat(a5.pattern, ")$"), c2);
            });
            return function(b4) {
              for (var c3 = "", d3 = 0; d3 < a4.length; d3++) {
                var f2 = a4[d3];
                if ("string" == typeof f2) {
                  c3 += f2;
                  continue;
                }
                var g3 = b4 ? b4[f2.name] : void 0, j2 = "?" === f2.modifier || "*" === f2.modifier, k = "*" === f2.modifier || "+" === f2.modifier;
                if (Array.isArray(g3)) {
                  if (!k) throw TypeError('Expected "'.concat(f2.name, '" to not repeat, but got an array'));
                  if (0 === g3.length) {
                    if (j2) continue;
                    throw TypeError('Expected "'.concat(f2.name, '" to not be empty'));
                  }
                  for (var l = 0; l < g3.length; l++) {
                    var m = e2(g3[l], f2);
                    if (h2 && !i[d3].test(m)) throw TypeError('Expected all "'.concat(f2.name, '" to match "').concat(f2.pattern, '", but got "').concat(m, '"'));
                    c3 += f2.prefix + m + f2.suffix;
                  }
                  continue;
                }
                if ("string" == typeof g3 || "number" == typeof g3) {
                  var m = e2(String(g3), f2);
                  if (h2 && !i[d3].test(m)) throw TypeError('Expected "'.concat(f2.name, '" to match "').concat(f2.pattern, '", but got "').concat(m, '"'));
                  c3 += f2.prefix + m + f2.suffix;
                  continue;
                }
                if (!j2) {
                  var n = k ? "an array" : "a string";
                  throw TypeError('Expected "'.concat(f2.name, '" to be ').concat(n));
                }
              }
              return c3;
            };
          }
          function d(a4, b3, c2) {
            void 0 === c2 && (c2 = {});
            var d2 = c2.decode, e2 = void 0 === d2 ? function(a5) {
              return a5;
            } : d2;
            return function(c3) {
              var d3 = a4.exec(c3);
              if (!d3) return false;
              for (var f2 = d3[0], g2 = d3.index, h2 = /* @__PURE__ */ Object.create(null), i = 1; i < d3.length; i++) !function(a5) {
                if (void 0 !== d3[a5]) {
                  var c4 = b3[a5 - 1];
                  "*" === c4.modifier || "+" === c4.modifier ? h2[c4.name] = d3[a5].split(c4.prefix + c4.suffix).map(function(a6) {
                    return e2(a6, c4);
                  }) : h2[c4.name] = e2(d3[a5], c4);
                }
              }(i);
              return { path: f2, index: g2, params: h2 };
            };
          }
          function e(a4) {
            return a4.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
          }
          function f(a4) {
            return a4 && a4.sensitive ? "" : "i";
          }
          function g(a4, b3, c2) {
            void 0 === c2 && (c2 = {});
            for (var d2 = c2.strict, g2 = void 0 !== d2 && d2, h2 = c2.start, i = c2.end, j2 = c2.encode, k = void 0 === j2 ? function(a5) {
              return a5;
            } : j2, l = c2.delimiter, m = c2.endsWith, n = "[".concat(e(void 0 === m ? "" : m), "]|$"), o = "[".concat(e(void 0 === l ? "/#?" : l), "]"), p = void 0 === h2 || h2 ? "^" : "", q2 = 0; q2 < a4.length; q2++) {
              var r = a4[q2];
              if ("string" == typeof r) p += e(k(r));
              else {
                var s = e(k(r.prefix)), t = e(k(r.suffix));
                if (r.pattern) if (b3 && b3.push(r), s || t) if ("+" === r.modifier || "*" === r.modifier) {
                  var u = "*" === r.modifier ? "?" : "";
                  p += "(?:".concat(s, "((?:").concat(r.pattern, ")(?:").concat(t).concat(s, "(?:").concat(r.pattern, "))*)").concat(t, ")").concat(u);
                } else p += "(?:".concat(s, "(").concat(r.pattern, ")").concat(t, ")").concat(r.modifier);
                else {
                  if ("+" === r.modifier || "*" === r.modifier) throw TypeError('Can not repeat "'.concat(r.name, '" without a prefix and suffix'));
                  p += "(".concat(r.pattern, ")").concat(r.modifier);
                }
                else p += "(?:".concat(s).concat(t, ")").concat(r.modifier);
              }
            }
            if (void 0 === i || i) g2 || (p += "".concat(o, "?")), p += c2.endsWith ? "(?=".concat(n, ")") : "$";
            else {
              var v2 = a4[a4.length - 1], w2 = "string" == typeof v2 ? o.indexOf(v2[v2.length - 1]) > -1 : void 0 === v2;
              g2 || (p += "(?:".concat(o, "(?=").concat(n, "))?")), w2 || (p += "(?=".concat(o, "|").concat(n, ")"));
            }
            return new RegExp(p, f(c2));
          }
          function h(b3, c2, d2) {
            if (b3 instanceof RegExp) {
              var e2;
              if (!c2) return b3;
              for (var i = /\((?:\?<(.*?)>)?(?!\?)/g, j2 = 0, k = i.exec(b3.source); k; ) c2.push({ name: k[1] || j2++, prefix: "", suffix: "", modifier: "", pattern: "" }), k = i.exec(b3.source);
              return b3;
            }
            return Array.isArray(b3) ? (e2 = b3.map(function(a4) {
              return h(a4, c2, d2).source;
            }), new RegExp("(?:".concat(e2.join("|"), ")"), f(d2))) : g(a3(b3, d2), c2, d2);
          }
          Object.defineProperty(b2, "__esModule", { value: true }), b2.pathToRegexp = b2.tokensToRegexp = b2.regexpToFunction = b2.match = b2.tokensToFunction = b2.compile = b2.parse = void 0, b2.parse = a3, b2.compile = function(b3, d2) {
            return c(a3(b3, d2), d2);
          }, b2.tokensToFunction = c, b2.match = function(a4, b3) {
            var c2 = [];
            return d(h(a4, c2, b3), c2, b3);
          }, b2.regexpToFunction = d, b2.tokensToRegexp = g, b2.pathToRegexp = h;
        })(), a2.exports = b2;
      })();
    }, 2605: (a2, b2, c) => {
      "use strict";
      function d(a3) {
        return function() {
          let { cookie: b3 } = a3;
          if (!b3) return {};
          let { parse: d2 } = c(436);
          return d2(Array.isArray(b3) ? b3.join("; ") : b3);
        };
      }
      c.d(b2, { i: () => d });
    }, 2668: (a2, b2, c) => {
      "use strict";
      c.d(b2, { t3: () => l, uO: () => h, wi: () => r, gz: () => i, AA: () => q2, ag: () => j2, Ui: () => m, xI: () => k });
      var d = c(1087), e = c(5638), f = c(7668);
      c(6859), c(7223), c(7261), c(3951), c(9904);
      let g = "function" == typeof d.unstable_postpone;
      function h(a3) {
        return { isDebugDynamicAccesses: a3, dynamicAccesses: [], syncDynamicErrorWithStack: null };
      }
      function i(a3) {
        var b3;
        return null == (b3 = a3.dynamicAccesses[0]) ? void 0 : b3.expression;
      }
      function j2(a3, b3, c2) {
        if (b3) switch (b3.type) {
          case "cache":
          case "unstable-cache":
          case "private-cache":
            return;
        }
        if (!a3.forceDynamic && !a3.forceStatic) {
          if (a3.dynamicShouldError) throw Object.defineProperty(new f.f(`Route ${a3.route} with \`dynamic = "error"\` couldn't be rendered statically because it used \`${c2}\`. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering`), "__NEXT_ERROR_CODE", { value: "E553", enumerable: false, configurable: true });
          if (b3) switch (b3.type) {
            case "prerender-ppr":
              return m(a3.route, c2, b3.dynamicTracking);
            case "prerender-legacy":
              b3.revalidate = 0;
              let d2 = Object.defineProperty(new e.DynamicServerError(`Route ${a3.route} couldn't be rendered statically because it used ${c2}. See more info here: https://nextjs.org/docs/messages/dynamic-server-error`), "__NEXT_ERROR_CODE", { value: "E550", enumerable: false, configurable: true });
              throw a3.dynamicUsageDescription = c2, a3.dynamicUsageStack = d2.stack, d2;
          }
        }
      }
      function k(a3, b3, c2) {
        let d2 = Object.defineProperty(new e.DynamicServerError(`Route ${b3.route} couldn't be rendered statically because it used \`${a3}\`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error`), "__NEXT_ERROR_CODE", { value: "E558", enumerable: false, configurable: true });
        throw c2.revalidate = 0, b3.dynamicUsageDescription = a3, b3.dynamicUsageStack = d2.stack, d2;
      }
      function l(a3, b3, c2, d2) {
        if (false === d2.controller.signal.aborted) {
          let e2 = p(`Route ${a3} needs to bail out of prerendering at this point because it used ${b3}.`);
          d2.controller.abort(e2);
          let f2 = d2.dynamicTracking;
          f2 && f2.dynamicAccesses.push({ stack: f2.isDebugDynamicAccesses ? Error().stack : void 0, expression: b3 });
          let g2 = d2.dynamicTracking;
          g2 && null === g2.syncDynamicErrorWithStack && (g2.syncDynamicErrorWithStack = c2);
        }
        throw p(`Route ${a3} needs to bail out of prerendering at this point because it used ${b3}.`);
      }
      function m(a3, b3, c2) {
        (function() {
          if (!g) throw Object.defineProperty(Error("Invariant: React.unstable_postpone is not defined. This suggests the wrong version of React was loaded. This is a bug in Next.js"), "__NEXT_ERROR_CODE", { value: "E224", enumerable: false, configurable: true });
        })(), c2 && c2.dynamicAccesses.push({ stack: c2.isDebugDynamicAccesses ? Error().stack : void 0, expression: b3 }), d.unstable_postpone(n(a3, b3));
      }
      function n(a3, b3) {
        return `Route ${a3} needs to bail out of prerendering at this point because it used ${b3}. React throws this special object to indicate where. It should not be caught by your own try/catch. Learn more: https://nextjs.org/docs/messages/ppr-caught-error`;
      }
      if (false === function(a3) {
        return a3.includes("needs to bail out of prerendering at this point because it used") && a3.includes("Learn more: https://nextjs.org/docs/messages/ppr-caught-error");
      }(n("%%%", "^^^"))) throw Object.defineProperty(Error("Invariant: isDynamicPostpone misidentified a postpone reason. This is a bug in Next.js"), "__NEXT_ERROR_CODE", { value: "E296", enumerable: false, configurable: true });
      let o = "NEXT_PRERENDER_INTERRUPTED";
      function p(a3) {
        let b3 = Object.defineProperty(Error(a3), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        return b3.digest = o, b3;
      }
      function q2(a3) {
        return "object" == typeof a3 && null !== a3 && a3.digest === o && "name" in a3 && "message" in a3 && a3 instanceof Error;
      }
      function r(a3, b3) {
        return a3.runtimeStagePromise ? a3.runtimeStagePromise.then(() => b3) : b3;
      }
      RegExp(`\\n\\s+at Suspense \\(<anonymous>\\)(?:(?!\\n\\s+at (?:body|div|main|section|article|aside|header|footer|nav|form|p|span|h1|h2|h3|h4|h5|h6) \\(<anonymous>\\))[\\s\\S])*?\\n\\s+at __next_root_layout_boundary__ \\([^\\n]*\\)`), RegExp(`\\n\\s+at __next_metadata_boundary__[\\n\\s]`), RegExp(`\\n\\s+at __next_viewport_boundary__[\\n\\s]`), RegExp(`\\n\\s+at __next_outlet_boundary__[\\n\\s]`);
    }, 2831: (a2, b2, c) => {
      "use strict";
      c.d(b2, { F: () => g });
      var d = c(2890);
      let e = /\/[^/]*\[[^/]+\][^/]*(?=\/|$)/, f = /\/\[[^/]+\](?=\/|$)/;
      function g(a3, b3) {
        return (void 0 === b3 && (b3 = true), (0, d.m1)(a3) && (a3 = (0, d.$8)(a3).interceptedRoute), b3) ? f.test(a3) : e.test(a3);
      }
    }, 2847: (a2, b2, c) => {
      "use strict";
      c.d(b2, { E: () => e });
      var d = c(5237);
      function e(a3) {
        return (0, d.q)(a3, { strict: false }) ? Math.ceil((a3.length - 2) / 2) : a3.length;
      }
    }, 2882: (a2, b2, c) => {
      "use strict";
      var d;
      (d = c(1347)).renderToReadableStream, d.decodeReply, d.decodeReplyFromAsyncIterable, d.decodeAction, d.decodeFormState, d.registerServerReference, b2.YR = d.registerClientReference, d.createClientModuleProxy, d.createTemporaryReferenceSet;
    }, 2890: (a2, b2, c) => {
      "use strict";
      c.d(b2, { $8: () => g, VB: () => e, m1: () => f });
      var d = c(4153);
      let e = ["(..)(..)", "(.)", "(..)", "(...)"];
      function f(a3) {
        return void 0 !== a3.split("/").find((a4) => e.find((b3) => a4.startsWith(b3)));
      }
      function g(a3) {
        let b3, c2, f2;
        for (let d2 of a3.split("/")) if (c2 = e.find((a4) => d2.startsWith(a4))) {
          [b3, f2] = a3.split(c2, 2);
          break;
        }
        if (!b3 || !c2 || !f2) throw Object.defineProperty(Error("Invalid interception route: " + a3 + ". Must be in the format /<intercepting route>/(..|...|..)(..)/<intercepted route>"), "__NEXT_ERROR_CODE", { value: "E269", enumerable: false, configurable: true });
        switch (b3 = (0, d.Y)(b3), c2) {
          case "(.)":
            f2 = "/" === b3 ? "/" + f2 : b3 + "/" + f2;
            break;
          case "(..)":
            if ("/" === b3) throw Object.defineProperty(Error("Invalid interception route: " + a3 + ". Cannot use (..) marker at the root level, use (.) instead."), "__NEXT_ERROR_CODE", { value: "E207", enumerable: false, configurable: true });
            f2 = b3.split("/").slice(0, -1).concat(f2).join("/");
            break;
          case "(...)":
            f2 = "/" + f2;
            break;
          case "(..)(..)":
            let g2 = b3.split("/");
            if (g2.length <= 2) throw Object.defineProperty(Error("Invalid interception route: " + a3 + ". Cannot use (..)(..) marker at the root level or one level up."), "__NEXT_ERROR_CODE", { value: "E486", enumerable: false, configurable: true });
            f2 = g2.slice(0, -2).concat(f2).join("/");
            break;
          default:
            throw Object.defineProperty(Error("Invariant: unexpected marker"), "__NEXT_ERROR_CODE", { value: "E112", enumerable: false, configurable: true });
        }
        return { interceptingRoute: b3, interceptedRoute: f2 };
      }
    }, 2993: (a2, b2, c) => {
      "use strict";
      function d(a3, b3, c2) {
        if (a3) for (let f of (c2 && (c2 = c2.toLowerCase()), a3)) {
          var d2, e;
          if (b3 === (null == (d2 = f.domain) ? void 0 : d2.split(":", 1)[0].toLowerCase()) || c2 === f.defaultLocale.toLowerCase() || (null == (e = f.locales) ? void 0 : e.some((a4) => a4.toLowerCase() === c2))) return f;
        }
      }
      c.d(b2, { C: () => d });
    }, 3089: (a2, b2, c) => {
      "use strict";
      c.d(b2, { B: () => e });
      var d = c(199);
      function e(a3) {
        return "function" === a3.type ? `function ${a3.name}(${(0, d.Q)(a3.inputs)})${a3.stateMutability && "nonpayable" !== a3.stateMutability ? ` ${a3.stateMutability}` : ""}${a3.outputs?.length ? ` returns (${(0, d.Q)(a3.outputs)})` : ""}` : "event" === a3.type ? `event ${a3.name}(${(0, d.Q)(a3.inputs)})` : "error" === a3.type ? `error ${a3.name}(${(0, d.Q)(a3.inputs)})` : "constructor" === a3.type ? `constructor(${(0, d.Q)(a3.inputs)})${"payable" === a3.stateMutability ? " payable" : ""}` : "fallback" === a3.type ? `fallback() external${"payable" === a3.stateMutability ? " payable" : ""}` : "receive() external payable";
      }
    }, 3114: (a2, b2, c) => {
      "use strict";
      c.d(b2, { X: () => p });
      var d = c(2993), e = c(7316), f = c(1130);
      function g(a3, b3) {
        if (!a3.startsWith("/") || !b3) return a3;
        let { pathname: c2, query: d2, hash: e2 } = (0, f.R)(a3);
        return "" + b3 + c2 + d2 + e2;
      }
      function h(a3, b3) {
        if (!a3.startsWith("/") || !b3) return a3;
        let { pathname: c2, query: d2, hash: e2 } = (0, f.R)(a3);
        return "" + c2 + b3 + d2 + e2;
      }
      var i = c(4946), j2 = c(7205), k = c(460), l = c(7504);
      let m = /(?!^https?:\/\/)(127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}|\[::1\]|localhost)/;
      function n(a3, b3) {
        return new URL(String(a3).replace(m, "localhost"), b3 && String(b3).replace(m, "localhost"));
      }
      let o = Symbol("NextURLInternal");
      class p {
        constructor(a3, b3, c2) {
          let d2, e2;
          "object" == typeof b3 && "pathname" in b3 || "string" == typeof b3 ? (d2 = b3, e2 = c2 || {}) : e2 = c2 || b3 || {}, this[o] = { url: n(a3, d2 ?? e2.base), options: e2, basePath: "" }, this.analyze();
        }
        analyze() {
          var a3, b3, c2, e2, f2;
          let g2 = function(a4, b4) {
            var c3, d2;
            let { basePath: e3, i18n: f3, trailingSlash: g3 } = null != (c3 = b4.nextConfig) ? c3 : {}, h3 = { pathname: a4, trailingSlash: "/" !== a4 ? a4.endsWith("/") : g3 };
            e3 && (0, i.m)(h3.pathname, e3) && (h3.pathname = (0, l.y)(h3.pathname, e3), h3.basePath = e3);
            let j3 = h3.pathname;
            if (h3.pathname.startsWith("/_next/data/") && h3.pathname.endsWith(".json")) {
              let a5 = h3.pathname.replace(/^\/_next\/data\//, "").replace(/\.json$/, "").split("/");
              h3.buildId = a5[0], j3 = "index" !== a5[1] ? "/" + a5.slice(1).join("/") : "/", true === b4.parseData && (h3.pathname = j3);
            }
            if (f3) {
              let a5 = b4.i18nProvider ? b4.i18nProvider.analyze(h3.pathname) : (0, k.d)(h3.pathname, f3.locales);
              h3.locale = a5.detectedLocale, h3.pathname = null != (d2 = a5.pathname) ? d2 : h3.pathname, !a5.detectedLocale && h3.buildId && (a5 = b4.i18nProvider ? b4.i18nProvider.analyze(j3) : (0, k.d)(j3, f3.locales)).detectedLocale && (h3.locale = a5.detectedLocale);
            }
            return h3;
          }(this[o].url.pathname, { nextConfig: this[o].options.nextConfig, parseData: true, i18nProvider: this[o].options.i18nProvider }), h2 = (0, j2.E)(this[o].url, this[o].options.headers);
          this[o].domainLocale = this[o].options.i18nProvider ? this[o].options.i18nProvider.detectDomainLocale(h2) : (0, d.C)(null == (b3 = this[o].options.nextConfig) || null == (a3 = b3.i18n) ? void 0 : a3.domains, h2);
          let m2 = (null == (c2 = this[o].domainLocale) ? void 0 : c2.defaultLocale) || (null == (f2 = this[o].options.nextConfig) || null == (e2 = f2.i18n) ? void 0 : e2.defaultLocale);
          this[o].url.pathname = g2.pathname, this[o].defaultLocale = m2, this[o].basePath = g2.basePath ?? "", this[o].buildId = g2.buildId, this[o].locale = g2.locale ?? m2, this[o].trailingSlash = g2.trailingSlash;
        }
        formatPathname() {
          var a3;
          let b3;
          return b3 = function(a4, b4, c2, d2) {
            if (!b4 || b4 === c2) return a4;
            let e2 = a4.toLowerCase();
            return !d2 && ((0, i.m)(e2, "/api") || (0, i.m)(e2, "/" + b4.toLowerCase())) ? a4 : g(a4, "/" + b4);
          }((a3 = { basePath: this[o].basePath, buildId: this[o].buildId, defaultLocale: this[o].options.forceLocale ? void 0 : this[o].defaultLocale, locale: this[o].locale, pathname: this[o].url.pathname, trailingSlash: this[o].trailingSlash }).pathname, a3.locale, a3.buildId ? void 0 : a3.defaultLocale, a3.ignorePrefix), (a3.buildId || !a3.trailingSlash) && (b3 = (0, e.U)(b3)), a3.buildId && (b3 = h(g(b3, "/_next/data/" + a3.buildId), "/" === a3.pathname ? "index.json" : ".json")), b3 = g(b3, a3.basePath), !a3.buildId && a3.trailingSlash ? b3.endsWith("/") ? b3 : h(b3, "/") : (0, e.U)(b3);
        }
        formatSearch() {
          return this[o].url.search;
        }
        get buildId() {
          return this[o].buildId;
        }
        set buildId(a3) {
          this[o].buildId = a3;
        }
        get locale() {
          return this[o].locale ?? "";
        }
        set locale(a3) {
          var b3, c2;
          if (!this[o].locale || !(null == (c2 = this[o].options.nextConfig) || null == (b3 = c2.i18n) ? void 0 : b3.locales.includes(a3))) throw Object.defineProperty(TypeError(`The NextURL configuration includes no locale "${a3}"`), "__NEXT_ERROR_CODE", { value: "E597", enumerable: false, configurable: true });
          this[o].locale = a3;
        }
        get defaultLocale() {
          return this[o].defaultLocale;
        }
        get domainLocale() {
          return this[o].domainLocale;
        }
        get searchParams() {
          return this[o].url.searchParams;
        }
        get host() {
          return this[o].url.host;
        }
        set host(a3) {
          this[o].url.host = a3;
        }
        get hostname() {
          return this[o].url.hostname;
        }
        set hostname(a3) {
          this[o].url.hostname = a3;
        }
        get port() {
          return this[o].url.port;
        }
        set port(a3) {
          this[o].url.port = a3;
        }
        get protocol() {
          return this[o].url.protocol;
        }
        set protocol(a3) {
          this[o].url.protocol = a3;
        }
        get href() {
          let a3 = this.formatPathname(), b3 = this.formatSearch();
          return `${this.protocol}//${this.host}${a3}${b3}${this.hash}`;
        }
        set href(a3) {
          this[o].url = n(a3), this.analyze();
        }
        get origin() {
          return this[o].url.origin;
        }
        get pathname() {
          return this[o].url.pathname;
        }
        set pathname(a3) {
          this[o].url.pathname = a3;
        }
        get hash() {
          return this[o].url.hash;
        }
        set hash(a3) {
          this[o].url.hash = a3;
        }
        get search() {
          return this[o].url.search;
        }
        set search(a3) {
          this[o].url.search = a3;
        }
        get password() {
          return this[o].url.password;
        }
        set password(a3) {
          this[o].url.password = a3;
        }
        get username() {
          return this[o].url.username;
        }
        set username(a3) {
          this[o].url.username = a3;
        }
        get basePath() {
          return this[o].basePath;
        }
        set basePath(a3) {
          this[o].basePath = a3.startsWith("/") ? a3 : `/${a3}`;
        }
        toString() {
          return this.href;
        }
        toJSON() {
          return this.href;
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return { href: this.href, origin: this.origin, protocol: this.protocol, username: this.username, password: this.password, host: this.host, hostname: this.hostname, port: this.port, pathname: this.pathname, search: this.search, searchParams: this.searchParams, hash: this.hash };
        }
        clone() {
          return new p(String(this), this[o].options);
        }
      }
    }, 3173: (a2, b2, c) => {
      "use strict";
      c.d(b2, { o: () => f });
      var d = c(5826);
      class e extends Error {
        constructor() {
          super("Headers cannot be modified. Read more: https://nextjs.org/docs/app/api-reference/functions/headers");
        }
        static callable() {
          throw new e();
        }
      }
      class f extends Headers {
        constructor(a3) {
          super(), this.headers = new Proxy(a3, { get(b3, c2, e2) {
            if ("symbol" == typeof c2) return d.l.get(b3, c2, e2);
            let f2 = c2.toLowerCase(), g = Object.keys(a3).find((a4) => a4.toLowerCase() === f2);
            if (void 0 !== g) return d.l.get(b3, g, e2);
          }, set(b3, c2, e2, f2) {
            if ("symbol" == typeof c2) return d.l.set(b3, c2, e2, f2);
            let g = c2.toLowerCase(), h = Object.keys(a3).find((a4) => a4.toLowerCase() === g);
            return d.l.set(b3, h ?? c2, e2, f2);
          }, has(b3, c2) {
            if ("symbol" == typeof c2) return d.l.has(b3, c2);
            let e2 = c2.toLowerCase(), f2 = Object.keys(a3).find((a4) => a4.toLowerCase() === e2);
            return void 0 !== f2 && d.l.has(b3, f2);
          }, deleteProperty(b3, c2) {
            if ("symbol" == typeof c2) return d.l.deleteProperty(b3, c2);
            let e2 = c2.toLowerCase(), f2 = Object.keys(a3).find((a4) => a4.toLowerCase() === e2);
            return void 0 === f2 || d.l.deleteProperty(b3, f2);
          } });
        }
        static seal(a3) {
          return new Proxy(a3, { get(a4, b3, c2) {
            switch (b3) {
              case "append":
              case "delete":
              case "set":
                return e.callable;
              default:
                return d.l.get(a4, b3, c2);
            }
          } });
        }
        merge(a3) {
          return Array.isArray(a3) ? a3.join(", ") : a3;
        }
        static from(a3) {
          return a3 instanceof Headers ? a3 : new f(a3);
        }
        append(a3, b3) {
          let c2 = this.headers[a3];
          "string" == typeof c2 ? this.headers[a3] = [c2, b3] : Array.isArray(c2) ? c2.push(b3) : this.headers[a3] = b3;
        }
        delete(a3) {
          delete this.headers[a3];
        }
        get(a3) {
          let b3 = this.headers[a3];
          return void 0 !== b3 ? this.merge(b3) : null;
        }
        has(a3) {
          return void 0 !== this.headers[a3];
        }
        set(a3, b3) {
          this.headers[a3] = b3;
        }
        forEach(a3, b3) {
          for (let [c2, d2] of this.entries()) a3.call(b3, d2, c2, this);
        }
        *entries() {
          for (let a3 of Object.keys(this.headers)) {
            let b3 = a3.toLowerCase(), c2 = this.get(b3);
            yield [b3, c2];
          }
        }
        *keys() {
          for (let a3 of Object.keys(this.headers)) {
            let b3 = a3.toLowerCase();
            yield b3;
          }
        }
        *values() {
          for (let a3 of Object.keys(this.headers)) {
            let b3 = this.get(a3);
            yield b3;
          }
        }
        [Symbol.iterator]() {
          return this.entries();
        }
      }
    }, 3207: (a2, b2, c) => {
      "use strict";
      c.d(b2, { R: () => k });
      var d = c(4289), e = c(3114), f = c(9565), g = c(5826);
      let h = Symbol("internal response"), i = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
      function j2(a3, b3) {
        var c2;
        if (null == a3 || null == (c2 = a3.request) ? void 0 : c2.headers) {
          if (!(a3.request.headers instanceof Headers)) throw Object.defineProperty(Error("request.headers must be an instance of Headers"), "__NEXT_ERROR_CODE", { value: "E119", enumerable: false, configurable: true });
          let c3 = [];
          for (let [d2, e2] of a3.request.headers) b3.set("x-middleware-request-" + d2, e2), c3.push(d2);
          b3.set("x-middleware-override-headers", c3.join(","));
        }
      }
      class k extends Response {
        constructor(a3, b3 = {}) {
          super(a3, b3);
          let c2 = this.headers, i2 = new Proxy(new d.VO(c2), { get(a4, e2, f2) {
            switch (e2) {
              case "delete":
              case "set":
                return (...f3) => {
                  let g2 = Reflect.apply(a4[e2], a4, f3), h2 = new Headers(c2);
                  return g2 instanceof d.VO && c2.set("x-middleware-set-cookie", g2.getAll().map((a5) => (0, d.Ud)(a5)).join(",")), j2(b3, h2), g2;
                };
              default:
                return g.l.get(a4, e2, f2);
            }
          } });
          this[h] = { cookies: i2, url: b3.url ? new e.X(b3.url, { headers: (0, f.Cu)(c2), nextConfig: b3.nextConfig }) : void 0 };
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return { cookies: this.cookies, url: this.url, body: this.body, bodyUsed: this.bodyUsed, headers: Object.fromEntries(this.headers), ok: this.ok, redirected: this.redirected, status: this.status, statusText: this.statusText, type: this.type };
        }
        get cookies() {
          return this[h].cookies;
        }
        static json(a3, b3) {
          let c2 = Response.json(a3, b3);
          return new k(c2.body, c2);
        }
        static redirect(a3, b3) {
          let c2 = "number" == typeof b3 ? b3 : (null == b3 ? void 0 : b3.status) ?? 307;
          if (!i.has(c2)) throw Object.defineProperty(RangeError('Failed to execute "redirect" on "response": Invalid status code'), "__NEXT_ERROR_CODE", { value: "E529", enumerable: false, configurable: true });
          let d2 = "object" == typeof b3 ? b3 : {}, e2 = new Headers(null == d2 ? void 0 : d2.headers);
          return e2.set("Location", (0, f.qU)(a3)), new k(null, { ...d2, headers: e2, status: c2 });
        }
        static rewrite(a3, b3) {
          let c2 = new Headers(null == b3 ? void 0 : b3.headers);
          return c2.set("x-middleware-rewrite", (0, f.qU)(a3)), j2(b3, c2), new k(null, { ...b3, headers: c2 });
        }
        static next(a3) {
          let b3 = new Headers(null == a3 ? void 0 : a3.headers);
          return b3.set("x-middleware-next", "1"), j2(a3, b3), new k(null, { ...a3, headers: b3 });
        }
      }
    }, 3355: (a2, b2, c) => {
      "use strict";
      c.d(b2, { G: () => d });
      class d extends Error {
        constructor() {
          super(), this.message = "Internal: NoFallbackError";
        }
      }
    }, 3373: (a2) => {
      (() => {
        "undefined" != typeof __nccwpck_require__ && (__nccwpck_require__.ab = "//");
        var b2 = {};
        ({ 318: function(a3, b3) {
          (function(a4) {
            "use strict";
            class b4 extends TypeError {
              constructor(a5, b5) {
                let c2, { message: d2, explanation: e2, ...f2 } = a5, { path: g2 } = a5, h2 = 0 === g2.length ? d2 : `At path: ${g2.join(".")} -- ${d2}`;
                super(e2 ?? h2), null != e2 && (this.cause = h2), Object.assign(this, f2), this.name = this.constructor.name, this.failures = () => c2 ?? (c2 = [a5, ...b5()]);
              }
            }
            function c(a5) {
              return "object" == typeof a5 && null != a5;
            }
            function d(a5) {
              if ("[object Object]" !== Object.prototype.toString.call(a5)) return false;
              let b5 = Object.getPrototypeOf(a5);
              return null === b5 || b5 === Object.prototype;
            }
            function e(a5) {
              return "symbol" == typeof a5 ? a5.toString() : "string" == typeof a5 ? JSON.stringify(a5) : `${a5}`;
            }
            function* f(a5, b5, d2, f2) {
              var g2;
              for (let h2 of (c(g2 = a5) && "function" == typeof g2[Symbol.iterator] || (a5 = [a5]), a5)) {
                let a6 = function(a7, b6, c2, d3) {
                  if (true === a7) return;
                  false === a7 ? a7 = {} : "string" == typeof a7 && (a7 = { message: a7 });
                  let { path: f3, branch: g3 } = b6, { type: h3 } = c2, { refinement: i2, message: j3 = `Expected a value of type \`${h3}\`${i2 ? ` with refinement \`${i2}\`` : ""}, but received: \`${e(d3)}\`` } = a7;
                  return { value: d3, type: h3, refinement: i2, key: f3[f3.length - 1], path: f3, branch: g3, ...a7, message: j3 };
                }(h2, b5, d2, f2);
                a6 && (yield a6);
              }
            }
            function* g(a5, b5, d2 = {}) {
              let { path: e2 = [], branch: f2 = [a5], coerce: h2 = false, mask: i2 = false } = d2, j3 = { path: e2, branch: f2 };
              if (h2 && (a5 = b5.coercer(a5, j3), i2 && "type" !== b5.type && c(b5.schema) && c(a5) && !Array.isArray(a5))) for (let c2 in a5) void 0 === b5.schema[c2] && delete a5[c2];
              let k2 = "valid";
              for (let c2 of b5.validator(a5, j3)) c2.explanation = d2.message, k2 = "not_valid", yield [c2, void 0];
              for (let [l2, m2, n2] of b5.entries(a5, j3)) for (let b6 of g(m2, n2, { path: void 0 === l2 ? e2 : [...e2, l2], branch: void 0 === l2 ? f2 : [...f2, m2], coerce: h2, mask: i2, message: d2.message })) b6[0] ? (k2 = null != b6[0].refinement ? "not_refined" : "not_valid", yield [b6[0], void 0]) : h2 && (m2 = b6[1], void 0 === l2 ? a5 = m2 : a5 instanceof Map ? a5.set(l2, m2) : a5 instanceof Set ? a5.add(m2) : c(a5) && (void 0 !== m2 || l2 in a5) && (a5[l2] = m2));
              if ("not_valid" !== k2) for (let c2 of b5.refiner(a5, j3)) c2.explanation = d2.message, k2 = "not_refined", yield [c2, void 0];
              "valid" === k2 && (yield [void 0, a5]);
            }
            class h {
              constructor(a5) {
                let { type: b5, schema: c2, validator: d2, refiner: e2, coercer: g2 = (a6) => a6, entries: h2 = function* () {
                } } = a5;
                this.type = b5, this.schema = c2, this.entries = h2, this.coercer = g2, d2 ? this.validator = (a6, b6) => f(d2(a6, b6), b6, this, a6) : this.validator = () => [], e2 ? this.refiner = (a6, b6) => f(e2(a6, b6), b6, this, a6) : this.refiner = () => [];
              }
              assert(a5, b5) {
                return i(a5, this, b5);
              }
              create(a5, b5) {
                return j2(a5, this, b5);
              }
              is(a5) {
                return l(a5, this);
              }
              mask(a5, b5) {
                return k(a5, this, b5);
              }
              validate(a5, b5 = {}) {
                return m(a5, this, b5);
              }
            }
            function i(a5, b5, c2) {
              let d2 = m(a5, b5, { message: c2 });
              if (d2[0]) throw d2[0];
            }
            function j2(a5, b5, c2) {
              let d2 = m(a5, b5, { coerce: true, message: c2 });
              if (!d2[0]) return d2[1];
              throw d2[0];
            }
            function k(a5, b5, c2) {
              let d2 = m(a5, b5, { coerce: true, mask: true, message: c2 });
              if (!d2[0]) return d2[1];
              throw d2[0];
            }
            function l(a5, b5) {
              return !m(a5, b5)[0];
            }
            function m(a5, c2, d2 = {}) {
              let e2 = g(a5, c2, d2), f2 = function(a6) {
                let { done: b5, value: c3 } = a6.next();
                return b5 ? void 0 : c3;
              }(e2);
              return f2[0] ? [new b4(f2[0], function* () {
                for (let a6 of e2) a6[0] && (yield a6[0]);
              }), void 0] : [void 0, f2[1]];
            }
            function n(a5, b5) {
              return new h({ type: a5, schema: null, validator: b5 });
            }
            function o() {
              return n("never", () => false);
            }
            function p(a5) {
              let b5 = a5 ? Object.keys(a5) : [], d2 = o();
              return new h({ type: "object", schema: a5 || null, *entries(e2) {
                if (a5 && c(e2)) {
                  let c2 = new Set(Object.keys(e2));
                  for (let d3 of b5) c2.delete(d3), yield [d3, e2[d3], a5[d3]];
                  for (let a6 of c2) yield [a6, e2[a6], d2];
                }
              }, validator: (a6) => c(a6) || `Expected an object, but received: ${e(a6)}`, coercer: (a6) => c(a6) ? { ...a6 } : a6 });
            }
            function q2(a5) {
              return new h({ ...a5, validator: (b5, c2) => void 0 === b5 || a5.validator(b5, c2), refiner: (b5, c2) => void 0 === b5 || a5.refiner(b5, c2) });
            }
            function r() {
              return n("string", (a5) => "string" == typeof a5 || `Expected a string, but received: ${e(a5)}`);
            }
            function s(a5) {
              let b5 = Object.keys(a5);
              return new h({ type: "type", schema: a5, *entries(d2) {
                if (c(d2)) for (let c2 of b5) yield [c2, d2[c2], a5[c2]];
              }, validator: (a6) => c(a6) || `Expected an object, but received: ${e(a6)}`, coercer: (a6) => c(a6) ? { ...a6 } : a6 });
            }
            function t() {
              return n("unknown", () => true);
            }
            function u(a5, b5, c2) {
              return new h({ ...a5, coercer: (d2, e2) => l(d2, b5) ? a5.coercer(c2(d2, e2), e2) : a5.coercer(d2, e2) });
            }
            function v2(a5) {
              return a5 instanceof Map || a5 instanceof Set ? a5.size : a5.length;
            }
            function w2(a5, b5, c2) {
              return new h({ ...a5, *refiner(d2, e2) {
                for (let g2 of (yield* a5.refiner(d2, e2), f(c2(d2, e2), e2, a5, d2))) yield { ...g2, refinement: b5 };
              } });
            }
            a4.Struct = h, a4.StructError = b4, a4.any = function() {
              return n("any", () => true);
            }, a4.array = function(a5) {
              return new h({ type: "array", schema: a5, *entries(b5) {
                if (a5 && Array.isArray(b5)) for (let [c2, d2] of b5.entries()) yield [c2, d2, a5];
              }, coercer: (a6) => Array.isArray(a6) ? a6.slice() : a6, validator: (a6) => Array.isArray(a6) || `Expected an array value, but received: ${e(a6)}` });
            }, a4.assert = i, a4.assign = function(...a5) {
              let b5 = "type" === a5[0].type, c2 = Object.assign({}, ...a5.map((a6) => a6.schema));
              return b5 ? s(c2) : p(c2);
            }, a4.bigint = function() {
              return n("bigint", (a5) => "bigint" == typeof a5);
            }, a4.boolean = function() {
              return n("boolean", (a5) => "boolean" == typeof a5);
            }, a4.coerce = u, a4.create = j2, a4.date = function() {
              return n("date", (a5) => a5 instanceof Date && !isNaN(a5.getTime()) || `Expected a valid \`Date\` object, but received: ${e(a5)}`);
            }, a4.defaulted = function(a5, b5, c2 = {}) {
              return u(a5, t(), (a6) => {
                let e2 = "function" == typeof b5 ? b5() : b5;
                if (void 0 === a6) return e2;
                if (!c2.strict && d(a6) && d(e2)) {
                  let b6 = { ...a6 }, c3 = false;
                  for (let a7 in e2) void 0 === b6[a7] && (b6[a7] = e2[a7], c3 = true);
                  if (c3) return b6;
                }
                return a6;
              });
            }, a4.define = n, a4.deprecated = function(a5, b5) {
              return new h({ ...a5, refiner: (b6, c2) => void 0 === b6 || a5.refiner(b6, c2), validator: (c2, d2) => void 0 === c2 || (b5(c2, d2), a5.validator(c2, d2)) });
            }, a4.dynamic = function(a5) {
              return new h({ type: "dynamic", schema: null, *entries(b5, c2) {
                let d2 = a5(b5, c2);
                yield* d2.entries(b5, c2);
              }, validator: (b5, c2) => a5(b5, c2).validator(b5, c2), coercer: (b5, c2) => a5(b5, c2).coercer(b5, c2), refiner: (b5, c2) => a5(b5, c2).refiner(b5, c2) });
            }, a4.empty = function(a5) {
              return w2(a5, "empty", (b5) => {
                let c2 = v2(b5);
                return 0 === c2 || `Expected an empty ${a5.type} but received one with a size of \`${c2}\``;
              });
            }, a4.enums = function(a5) {
              let b5 = {}, c2 = a5.map((a6) => e(a6)).join();
              for (let c3 of a5) b5[c3] = c3;
              return new h({ type: "enums", schema: b5, validator: (b6) => a5.includes(b6) || `Expected one of \`${c2}\`, but received: ${e(b6)}` });
            }, a4.func = function() {
              return n("func", (a5) => "function" == typeof a5 || `Expected a function, but received: ${e(a5)}`);
            }, a4.instance = function(a5) {
              return n("instance", (b5) => b5 instanceof a5 || `Expected a \`${a5.name}\` instance, but received: ${e(b5)}`);
            }, a4.integer = function() {
              return n("integer", (a5) => "number" == typeof a5 && !isNaN(a5) && Number.isInteger(a5) || `Expected an integer, but received: ${e(a5)}`);
            }, a4.intersection = function(a5) {
              return new h({ type: "intersection", schema: null, *entries(b5, c2) {
                for (let d2 of a5) yield* d2.entries(b5, c2);
              }, *validator(b5, c2) {
                for (let d2 of a5) yield* d2.validator(b5, c2);
              }, *refiner(b5, c2) {
                for (let d2 of a5) yield* d2.refiner(b5, c2);
              } });
            }, a4.is = l, a4.lazy = function(a5) {
              let b5;
              return new h({ type: "lazy", schema: null, *entries(c2, d2) {
                b5 ?? (b5 = a5()), yield* b5.entries(c2, d2);
              }, validator: (c2, d2) => (b5 ?? (b5 = a5()), b5.validator(c2, d2)), coercer: (c2, d2) => (b5 ?? (b5 = a5()), b5.coercer(c2, d2)), refiner: (c2, d2) => (b5 ?? (b5 = a5()), b5.refiner(c2, d2)) });
            }, a4.literal = function(a5) {
              let b5 = e(a5), c2 = typeof a5;
              return new h({ type: "literal", schema: "string" === c2 || "number" === c2 || "boolean" === c2 ? a5 : null, validator: (c3) => c3 === a5 || `Expected the literal \`${b5}\`, but received: ${e(c3)}` });
            }, a4.map = function(a5, b5) {
              return new h({ type: "map", schema: null, *entries(c2) {
                if (a5 && b5 && c2 instanceof Map) for (let [d2, e2] of c2.entries()) yield [d2, d2, a5], yield [d2, e2, b5];
              }, coercer: (a6) => a6 instanceof Map ? new Map(a6) : a6, validator: (a6) => a6 instanceof Map || `Expected a \`Map\` object, but received: ${e(a6)}` });
            }, a4.mask = k, a4.max = function(a5, b5, c2 = {}) {
              let { exclusive: d2 } = c2;
              return w2(a5, "max", (c3) => d2 ? c3 < b5 : c3 <= b5 || `Expected a ${a5.type} less than ${d2 ? "" : "or equal to "}${b5} but received \`${c3}\``);
            }, a4.min = function(a5, b5, c2 = {}) {
              let { exclusive: d2 } = c2;
              return w2(a5, "min", (c3) => d2 ? c3 > b5 : c3 >= b5 || `Expected a ${a5.type} greater than ${d2 ? "" : "or equal to "}${b5} but received \`${c3}\``);
            }, a4.never = o, a4.nonempty = function(a5) {
              return w2(a5, "nonempty", (b5) => v2(b5) > 0 || `Expected a nonempty ${a5.type} but received an empty one`);
            }, a4.nullable = function(a5) {
              return new h({ ...a5, validator: (b5, c2) => null === b5 || a5.validator(b5, c2), refiner: (b5, c2) => null === b5 || a5.refiner(b5, c2) });
            }, a4.number = function() {
              return n("number", (a5) => "number" == typeof a5 && !isNaN(a5) || `Expected a number, but received: ${e(a5)}`);
            }, a4.object = p, a4.omit = function(a5, b5) {
              let { schema: c2 } = a5, d2 = { ...c2 };
              for (let a6 of b5) delete d2[a6];
              return "type" === a5.type ? s(d2) : p(d2);
            }, a4.optional = q2, a4.partial = function(a5) {
              let b5 = a5 instanceof h ? { ...a5.schema } : { ...a5 };
              for (let a6 in b5) b5[a6] = q2(b5[a6]);
              return p(b5);
            }, a4.pattern = function(a5, b5) {
              return w2(a5, "pattern", (c2) => b5.test(c2) || `Expected a ${a5.type} matching \`/${b5.source}/\` but received "${c2}"`);
            }, a4.pick = function(a5, b5) {
              let { schema: c2 } = a5, d2 = {};
              for (let a6 of b5) d2[a6] = c2[a6];
              return p(d2);
            }, a4.record = function(a5, b5) {
              return new h({ type: "record", schema: null, *entries(d2) {
                if (c(d2)) for (let c2 in d2) {
                  let e2 = d2[c2];
                  yield [c2, c2, a5], yield [c2, e2, b5];
                }
              }, validator: (a6) => c(a6) || `Expected an object, but received: ${e(a6)}` });
            }, a4.refine = w2, a4.regexp = function() {
              return n("regexp", (a5) => a5 instanceof RegExp);
            }, a4.set = function(a5) {
              return new h({ type: "set", schema: null, *entries(b5) {
                if (a5 && b5 instanceof Set) for (let c2 of b5) yield [c2, c2, a5];
              }, coercer: (a6) => a6 instanceof Set ? new Set(a6) : a6, validator: (a6) => a6 instanceof Set || `Expected a \`Set\` object, but received: ${e(a6)}` });
            }, a4.size = function(a5, b5, c2 = b5) {
              let d2 = `Expected a ${a5.type}`, e2 = b5 === c2 ? `of \`${b5}\`` : `between \`${b5}\` and \`${c2}\``;
              return w2(a5, "size", (a6) => {
                if ("number" == typeof a6 || a6 instanceof Date) return b5 <= a6 && a6 <= c2 || `${d2} ${e2} but received \`${a6}\``;
                if (a6 instanceof Map || a6 instanceof Set) {
                  let { size: f2 } = a6;
                  return b5 <= f2 && f2 <= c2 || `${d2} with a size ${e2} but received one with a size of \`${f2}\``;
                }
                {
                  let { length: f2 } = a6;
                  return b5 <= f2 && f2 <= c2 || `${d2} with a length ${e2} but received one with a length of \`${f2}\``;
                }
              });
            }, a4.string = r, a4.struct = function(a5, b5) {
              return console.warn("superstruct@0.11 - The `struct` helper has been renamed to `define`."), n(a5, b5);
            }, a4.trimmed = function(a5) {
              return u(a5, r(), (a6) => a6.trim());
            }, a4.tuple = function(a5) {
              let b5 = o();
              return new h({ type: "tuple", schema: null, *entries(c2) {
                if (Array.isArray(c2)) {
                  let d2 = Math.max(a5.length, c2.length);
                  for (let e2 = 0; e2 < d2; e2++) yield [e2, c2[e2], a5[e2] || b5];
                }
              }, validator: (a6) => Array.isArray(a6) || `Expected an array, but received: ${e(a6)}` });
            }, a4.type = s, a4.union = function(a5) {
              let b5 = a5.map((a6) => a6.type).join(" | ");
              return new h({ type: "union", schema: null, coercer(b6) {
                for (let c2 of a5) {
                  let [a6, d2] = c2.validate(b6, { coerce: true });
                  if (!a6) return d2;
                }
                return b6;
              }, validator(c2, d2) {
                let f2 = [];
                for (let b6 of a5) {
                  let [...a6] = g(c2, b6, d2), [e2] = a6;
                  if (!e2[0]) return [];
                  for (let [b7] of a6) b7 && f2.push(b7);
                }
                return [`Expected the value to satisfy a union of \`${b5}\`, but received: ${e(c2)}`, ...f2];
              } });
            }, a4.unknown = t, a4.validate = m;
          })(b3);
        } })[318](0, b2), a2.exports = b2;
      })();
    }, 3375: (a2, b2, c) => {
      "use strict";
      c.d(b2, { $P: () => i, My: () => j2, cK: () => k, i3: () => m, nj: () => h });
      var d = c(7116), e = c(4725), f = c(5808);
      let g = Array.from({ length: 256 }, (a3, b3) => b3.toString(16).padStart(2, "0"));
      function h(a3, b3 = {}) {
        return "number" == typeof a3 || "bigint" == typeof a3 ? k(a3, b3) : "string" == typeof a3 ? m(a3, b3) : "boolean" == typeof a3 ? i(a3, b3) : j2(a3, b3);
      }
      function i(a3, b3 = {}) {
        let c2 = `0x${Number(a3)}`;
        return "number" == typeof b3.size ? ((0, f.Sl)(c2, { size: b3.size }), (0, e.eV)(c2, { size: b3.size })) : c2;
      }
      function j2(a3, b3 = {}) {
        let c2 = "";
        for (let b4 = 0; b4 < a3.length; b4++) c2 += g[a3[b4]];
        let d2 = `0x${c2}`;
        return "number" == typeof b3.size ? ((0, f.Sl)(d2, { size: b3.size }), (0, e.eV)(d2, { dir: "right", size: b3.size })) : d2;
      }
      function k(a3, b3 = {}) {
        let c2, { signed: f2, size: g2 } = b3, h2 = BigInt(a3);
        g2 ? c2 = f2 ? (1n << 8n * BigInt(g2) - 1n) - 1n : 2n ** (8n * BigInt(g2)) - 1n : "number" == typeof a3 && (c2 = BigInt(Number.MAX_SAFE_INTEGER));
        let i2 = "bigint" == typeof c2 && f2 ? -c2 - 1n : 0;
        if (c2 && h2 > c2 || h2 < i2) {
          let b4 = "bigint" == typeof a3 ? "n" : "";
          throw new d.Ty({ max: c2 ? `${c2}${b4}` : void 0, min: `${i2}${b4}`, signed: f2, size: g2, value: `${a3}${b4}` });
        }
        let j3 = `0x${(f2 && h2 < 0 ? (1n << BigInt(8 * g2)) + BigInt(h2) : h2).toString(16)}`;
        return g2 ? (0, e.eV)(j3, { size: g2 }) : j3;
      }
      let l = new TextEncoder();
      function m(a3, b3 = {}) {
        return j2(l.encode(a3), b3);
      }
    }, 3419: (a2, b2, c) => {
      "use strict";
      c.d(b2, { B: () => e });
      var d = c(1212);
      function e({ revalidate: a3, expire: b3 }) {
        let c2 = "number" == typeof a3 && void 0 !== b3 && a3 < b3 ? `, stale-while-revalidate=${b3 - a3}` : "";
        return 0 === a3 ? "private, no-cache, no-store, max-age=0, must-revalidate" : "number" == typeof a3 ? `s-maxage=${a3}${c2}` : `s-maxage=${d.qF}${c2}`;
      }
    }, 3682: (a2, b2, c) => {
      "use strict";
      function d() {
        return { previewModeId: process.env.__NEXT_PREVIEW_MODE_ID || "", previewModeSigningKey: process.env.__NEXT_PREVIEW_MODE_SIGNING_KEY || "", previewModeEncryptionKey: process.env.__NEXT_PREVIEW_MODE_ENCRYPTION_KEY || "" };
      }
      c.r(b2), c.d(b2, { getEdgePreviewProps: () => d });
    }, 3850: (a2) => {
      (() => {
        "use strict";
        var b2 = { 328: (a3) => {
          a3.exports = function(a4) {
            for (var b3 = 5381, c2 = a4.length; c2; ) b3 = 33 * b3 ^ a4.charCodeAt(--c2);
            return b3 >>> 0;
          };
        } }, c = {};
        function d(a3) {
          var e = c[a3];
          if (void 0 !== e) return e.exports;
          var f = c[a3] = { exports: {} }, g = true;
          try {
            b2[a3](f, f.exports, d), g = false;
          } finally {
            g && delete c[a3];
          }
          return f.exports;
        }
        d.ab = "//", a2.exports = d(328);
      })();
    }, 3911: (a2, b2) => {
      "use strict";
      var c = { H: null, A: null };
      function d(a3) {
        var b3 = "https://react.dev/errors/" + a3;
        if (1 < arguments.length) {
          b3 += "?args[]=" + encodeURIComponent(arguments[1]);
          for (var c2 = 2; c2 < arguments.length; c2++) b3 += "&args[]=" + encodeURIComponent(arguments[c2]);
        }
        return "Minified React error #" + a3 + "; visit " + b3 + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
      }
      var e = Array.isArray;
      function f() {
      }
      var g = Symbol.for("react.transitional.element"), h = Symbol.for("react.portal"), i = Symbol.for("react.fragment"), j2 = Symbol.for("react.strict_mode"), k = Symbol.for("react.profiler"), l = Symbol.for("react.forward_ref"), m = Symbol.for("react.suspense"), n = Symbol.for("react.memo"), o = Symbol.for("react.lazy"), p = Symbol.iterator, q2 = Object.prototype.hasOwnProperty, r = Object.assign;
      function s(a3, b3, c2) {
        var d2 = c2.ref;
        return { $$typeof: g, type: a3, key: b3, ref: void 0 !== d2 ? d2 : null, props: c2 };
      }
      function t(a3) {
        return "object" == typeof a3 && null !== a3 && a3.$$typeof === g;
      }
      var u = /\/+/g;
      function v2(a3, b3) {
        var c2, d2;
        return "object" == typeof a3 && null !== a3 && null != a3.key ? (c2 = "" + a3.key, d2 = { "=": "=0", ":": "=2" }, "$" + c2.replace(/[=:]/g, function(a4) {
          return d2[a4];
        })) : b3.toString(36);
      }
      function w2(a3, b3, c2) {
        if (null == a3) return a3;
        var i2 = [], j3 = 0;
        return !function a4(b4, c3, i3, j4, k2) {
          var l2, m2, n2, q3 = typeof b4;
          ("undefined" === q3 || "boolean" === q3) && (b4 = null);
          var r2 = false;
          if (null === b4) r2 = true;
          else switch (q3) {
            case "bigint":
            case "string":
            case "number":
              r2 = true;
              break;
            case "object":
              switch (b4.$$typeof) {
                case g:
                case h:
                  r2 = true;
                  break;
                case o:
                  return a4((r2 = b4._init)(b4._payload), c3, i3, j4, k2);
              }
          }
          if (r2) return k2 = k2(b4), r2 = "" === j4 ? "." + v2(b4, 0) : j4, e(k2) ? (i3 = "", null != r2 && (i3 = r2.replace(u, "$&/") + "/"), a4(k2, c3, i3, "", function(a5) {
            return a5;
          })) : null != k2 && (t(k2) && (l2 = k2, m2 = i3 + (null == k2.key || b4 && b4.key === k2.key ? "" : ("" + k2.key).replace(u, "$&/") + "/") + r2, k2 = s(l2.type, m2, l2.props)), c3.push(k2)), 1;
          r2 = 0;
          var w3 = "" === j4 ? "." : j4 + ":";
          if (e(b4)) for (var x3 = 0; x3 < b4.length; x3++) q3 = w3 + v2(j4 = b4[x3], x3), r2 += a4(j4, c3, i3, q3, k2);
          else if ("function" == typeof (x3 = null === (n2 = b4) || "object" != typeof n2 ? null : "function" == typeof (n2 = p && n2[p] || n2["@@iterator"]) ? n2 : null)) for (b4 = x3.call(b4), x3 = 0; !(j4 = b4.next()).done; ) q3 = w3 + v2(j4 = j4.value, x3++), r2 += a4(j4, c3, i3, q3, k2);
          else if ("object" === q3) {
            if ("function" == typeof b4.then) return a4(function(a5) {
              switch (a5.status) {
                case "fulfilled":
                  return a5.value;
                case "rejected":
                  throw a5.reason;
                default:
                  switch ("string" == typeof a5.status ? a5.then(f, f) : (a5.status = "pending", a5.then(function(b5) {
                    "pending" === a5.status && (a5.status = "fulfilled", a5.value = b5);
                  }, function(b5) {
                    "pending" === a5.status && (a5.status = "rejected", a5.reason = b5);
                  })), a5.status) {
                    case "fulfilled":
                      return a5.value;
                    case "rejected":
                      throw a5.reason;
                  }
              }
              throw a5;
            }(b4), c3, i3, j4, k2);
            throw Error(d(31, "[object Object]" === (c3 = String(b4)) ? "object with keys {" + Object.keys(b4).join(", ") + "}" : c3));
          }
          return r2;
        }(a3, i2, "", "", function(a4) {
          return b3.call(c2, a4, j3++);
        }), i2;
      }
      function x2(a3) {
        if (-1 === a3._status) {
          var b3 = a3._result;
          (b3 = b3()).then(function(b4) {
            (0 === a3._status || -1 === a3._status) && (a3._status = 1, a3._result = b4);
          }, function(b4) {
            (0 === a3._status || -1 === a3._status) && (a3._status = 2, a3._result = b4);
          }), -1 === a3._status && (a3._status = 0, a3._result = b3);
        }
        if (1 === a3._status) return a3._result.default;
        throw a3._result;
      }
      function y() {
        return /* @__PURE__ */ new WeakMap();
      }
      function z2() {
        return { s: 0, v: void 0, o: null, p: null };
      }
      b2.Children = { map: w2, forEach: function(a3, b3, c2) {
        w2(a3, function() {
          b3.apply(this, arguments);
        }, c2);
      }, count: function(a3) {
        var b3 = 0;
        return w2(a3, function() {
          b3++;
        }), b3;
      }, toArray: function(a3) {
        return w2(a3, function(a4) {
          return a4;
        }) || [];
      }, only: function(a3) {
        if (!t(a3)) throw Error(d(143));
        return a3;
      } }, b2.Fragment = i, b2.Profiler = k, b2.StrictMode = j2, b2.Suspense = m, b2.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = c, b2.cache = function(a3) {
        return function() {
          var b3 = c.A;
          if (!b3) return a3.apply(null, arguments);
          var d2 = b3.getCacheForType(y);
          void 0 === (b3 = d2.get(a3)) && (b3 = z2(), d2.set(a3, b3)), d2 = 0;
          for (var e2 = arguments.length; d2 < e2; d2++) {
            var f2 = arguments[d2];
            if ("function" == typeof f2 || "object" == typeof f2 && null !== f2) {
              var g2 = b3.o;
              null === g2 && (b3.o = g2 = /* @__PURE__ */ new WeakMap()), void 0 === (b3 = g2.get(f2)) && (b3 = z2(), g2.set(f2, b3));
            } else null === (g2 = b3.p) && (b3.p = g2 = /* @__PURE__ */ new Map()), void 0 === (b3 = g2.get(f2)) && (b3 = z2(), g2.set(f2, b3));
          }
          if (1 === b3.s) return b3.v;
          if (2 === b3.s) throw b3.v;
          try {
            var h2 = a3.apply(null, arguments);
            return (d2 = b3).s = 1, d2.v = h2;
          } catch (a4) {
            throw (h2 = b3).s = 2, h2.v = a4, a4;
          }
        };
      }, b2.cacheSignal = function() {
        var a3 = c.A;
        return a3 ? a3.cacheSignal() : null;
      }, b2.captureOwnerStack = function() {
        return null;
      }, b2.cloneElement = function(a3, b3, c2) {
        if (null == a3) throw Error(d(267, a3));
        var e2 = r({}, a3.props), f2 = a3.key;
        if (null != b3) for (g2 in void 0 !== b3.key && (f2 = "" + b3.key), b3) q2.call(b3, g2) && "key" !== g2 && "__self" !== g2 && "__source" !== g2 && ("ref" !== g2 || void 0 !== b3.ref) && (e2[g2] = b3[g2]);
        var g2 = arguments.length - 2;
        if (1 === g2) e2.children = c2;
        else if (1 < g2) {
          for (var h2 = Array(g2), i2 = 0; i2 < g2; i2++) h2[i2] = arguments[i2 + 2];
          e2.children = h2;
        }
        return s(a3.type, f2, e2);
      }, b2.createElement = function(a3, b3, c2) {
        var d2, e2 = {}, f2 = null;
        if (null != b3) for (d2 in void 0 !== b3.key && (f2 = "" + b3.key), b3) q2.call(b3, d2) && "key" !== d2 && "__self" !== d2 && "__source" !== d2 && (e2[d2] = b3[d2]);
        var g2 = arguments.length - 2;
        if (1 === g2) e2.children = c2;
        else if (1 < g2) {
          for (var h2 = Array(g2), i2 = 0; i2 < g2; i2++) h2[i2] = arguments[i2 + 2];
          e2.children = h2;
        }
        if (a3 && a3.defaultProps) for (d2 in g2 = a3.defaultProps) void 0 === e2[d2] && (e2[d2] = g2[d2]);
        return s(a3, f2, e2);
      }, b2.createRef = function() {
        return { current: null };
      }, b2.forwardRef = function(a3) {
        return { $$typeof: l, render: a3 };
      }, b2.isValidElement = t, b2.lazy = function(a3) {
        return { $$typeof: o, _payload: { _status: -1, _result: a3 }, _init: x2 };
      }, b2.memo = function(a3, b3) {
        return { $$typeof: n, type: a3, compare: void 0 === b3 ? null : b3 };
      }, b2.use = function(a3) {
        return c.H.use(a3);
      }, b2.useCallback = function(a3, b3) {
        return c.H.useCallback(a3, b3);
      }, b2.useDebugValue = function() {
      }, b2.useId = function() {
        return c.H.useId();
      }, b2.useMemo = function(a3, b3) {
        return c.H.useMemo(a3, b3);
      }, b2.version = "19.2.0-canary-0bdb9206-20250818";
    }, 3948: (a2) => {
      "use strict";
      a2.exports = ["chrome 64", "edge 79", "firefox 67", "opera 51", "safari 12"];
    }, 3951: (a2, b2, c) => {
      "use strict";
      function d(a3) {
        return "object" == typeof a3 && null !== a3 && "digest" in a3 && "BAILOUT_TO_CLIENT_SIDE_RENDERING" === a3.digest;
      }
      c.d(b2, { C: () => d });
    }, 4023: (a2, b2, c) => {
      "use strict";
      c.d(b2, { q: () => d });
      class d {
        constructor() {
          let a3, b3;
          this.promise = new Promise((c2, d2) => {
            a3 = c2, b3 = d2;
          }), this.resolve = a3, this.reject = b3;
        }
      }
    }, 4055: (a2, b2, c) => {
      "use strict";
      c.d(b2, { q: () => f });
      class d {
        constructor(a3, b3, c2) {
          this.prev = null, this.next = null, this.key = a3, this.data = b3, this.size = c2;
        }
      }
      class e {
        constructor() {
          this.prev = null, this.next = null;
        }
      }
      class f {
        constructor(a3, b3, c2) {
          this.cache = /* @__PURE__ */ new Map(), this.totalSize = 0, this.maxSize = a3, this.calculateSize = b3, this.onEvict = c2, this.head = new e(), this.tail = new e(), this.head.next = this.tail, this.tail.prev = this.head;
        }
        addToHead(a3) {
          a3.prev = this.head, a3.next = this.head.next, this.head.next.prev = a3, this.head.next = a3;
        }
        removeNode(a3) {
          a3.prev.next = a3.next, a3.next.prev = a3.prev;
        }
        moveToHead(a3) {
          this.removeNode(a3), this.addToHead(a3);
        }
        removeTail() {
          let a3 = this.tail.prev;
          return this.removeNode(a3), a3;
        }
        set(a3, b3) {
          let c2 = (null == this.calculateSize ? void 0 : this.calculateSize.call(this, b3)) ?? 1;
          if (c2 <= 0) throw Object.defineProperty(Error(`LRUCache: calculateSize returned ${c2}, but size must be > 0. Items with size 0 would never be evicted, causing unbounded cache growth.`), "__NEXT_ERROR_CODE", { value: "E789", enumerable: false, configurable: true });
          if (c2 > this.maxSize) return console.warn("Single item size exceeds maxSize"), false;
          let e2 = this.cache.get(a3);
          if (e2) e2.data = b3, this.totalSize = this.totalSize - e2.size + c2, e2.size = c2, this.moveToHead(e2);
          else {
            let e3 = new d(a3, b3, c2);
            this.cache.set(a3, e3), this.addToHead(e3), this.totalSize += c2;
          }
          for (; this.totalSize > this.maxSize && this.cache.size > 0; ) {
            let a4 = this.removeTail();
            this.cache.delete(a4.key), this.totalSize -= a4.size, null == this.onEvict || this.onEvict.call(this, a4.key, a4.data);
          }
          return true;
        }
        has(a3) {
          return this.cache.has(a3);
        }
        get(a3) {
          let b3 = this.cache.get(a3);
          if (b3) return this.moveToHead(b3), b3.data;
        }
        *[Symbol.iterator]() {
          let a3 = this.head.next;
          for (; a3 && a3 !== this.tail; ) {
            let b3 = a3;
            yield [b3.key, b3.data], a3 = a3.next;
          }
        }
        remove(a3) {
          let b3 = this.cache.get(a3);
          b3 && (this.removeNode(b3), this.cache.delete(a3), this.totalSize -= b3.size);
        }
        get size() {
          return this.cache.size;
        }
        get currentSize() {
          return this.totalSize;
        }
      }
    }, 4116: (a2, b2, c) => {
      "use strict";
      c.d(b2, { e: () => f });
      var d = c(4946), e = c(7223);
      function f({ serverActionsManifest: a3 }) {
        return new Proxy({}, { get: (b3, c2) => {
          var f2, g, h;
          let i, j2 = null == (g = a3.edge) || null == (f2 = g[c2]) ? void 0 : f2.workers;
          if (!j2) return;
          let k = e.J.getStore();
          if (!(i = k ? j2[h = k.page, (0, d.m)(h, "app") ? h : "app" + h] : Object.values(j2).at(0))) return;
          let { moduleId: l, async: m } = i;
          return { id: l, name: c2, chunks: [], async: m };
        } });
      }
    }, 4153: (a2, b2, c) => {
      "use strict";
      c.d(b2, { P: () => g, Y: () => f });
      var d = c(9456), e = c(7426);
      function f(a3) {
        return (0, d.A)(a3.split("/").reduce((a4, b3, c2, d2) => !b3 || (0, e.V)(b3) || "@" === b3[0] || ("page" === b3 || "route" === b3) && c2 === d2.length - 1 ? a4 : a4 + "/" + b3, ""));
      }
      function g(a3) {
        return a3.replace(/\.rsc($|\?)/, "$1");
      }
    }, 4182: (a2, b2, c) => {
      a2.exports = c(6008);
    }, 4207: (a2, b2, c) => {
      "use strict";
      var d = c(1087);
      function e() {
      }
      var f = { d: { f: e, r: function() {
        throw Error("Invalid form element. requestFormReset must be passed a form that was rendered by React.");
      }, D: e, C: e, L: e, m: e, X: e, S: e, M: e }, p: 0, findDOMNode: null };
      if (!d.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE) throw Error('The "react" package in this environment is not configured correctly. The "react-server" condition must be enabled in any environment that runs React Server Components.');
      function g(a3, b3) {
        return "font" === a3 ? "" : "string" == typeof b3 ? "use-credentials" === b3 ? b3 : "" : void 0;
      }
      b2.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = f, b2.preconnect = function(a3, b3) {
        "string" == typeof a3 && (b3 = b3 ? "string" == typeof (b3 = b3.crossOrigin) ? "use-credentials" === b3 ? b3 : "" : void 0 : null, f.d.C(a3, b3));
      }, b2.prefetchDNS = function(a3) {
        "string" == typeof a3 && f.d.D(a3);
      }, b2.preinit = function(a3, b3) {
        if ("string" == typeof a3 && b3 && "string" == typeof b3.as) {
          var c2 = b3.as, d2 = g(c2, b3.crossOrigin), e2 = "string" == typeof b3.integrity ? b3.integrity : void 0, h = "string" == typeof b3.fetchPriority ? b3.fetchPriority : void 0;
          "style" === c2 ? f.d.S(a3, "string" == typeof b3.precedence ? b3.precedence : void 0, { crossOrigin: d2, integrity: e2, fetchPriority: h }) : "script" === c2 && f.d.X(a3, { crossOrigin: d2, integrity: e2, fetchPriority: h, nonce: "string" == typeof b3.nonce ? b3.nonce : void 0 });
        }
      }, b2.preinitModule = function(a3, b3) {
        if ("string" == typeof a3) if ("object" == typeof b3 && null !== b3) {
          if (null == b3.as || "script" === b3.as) {
            var c2 = g(b3.as, b3.crossOrigin);
            f.d.M(a3, { crossOrigin: c2, integrity: "string" == typeof b3.integrity ? b3.integrity : void 0, nonce: "string" == typeof b3.nonce ? b3.nonce : void 0 });
          }
        } else null == b3 && f.d.M(a3);
      }, b2.preload = function(a3, b3) {
        if ("string" == typeof a3 && "object" == typeof b3 && null !== b3 && "string" == typeof b3.as) {
          var c2 = b3.as, d2 = g(c2, b3.crossOrigin);
          f.d.L(a3, c2, { crossOrigin: d2, integrity: "string" == typeof b3.integrity ? b3.integrity : void 0, nonce: "string" == typeof b3.nonce ? b3.nonce : void 0, type: "string" == typeof b3.type ? b3.type : void 0, fetchPriority: "string" == typeof b3.fetchPriority ? b3.fetchPriority : void 0, referrerPolicy: "string" == typeof b3.referrerPolicy ? b3.referrerPolicy : void 0, imageSrcSet: "string" == typeof b3.imageSrcSet ? b3.imageSrcSet : void 0, imageSizes: "string" == typeof b3.imageSizes ? b3.imageSizes : void 0, media: "string" == typeof b3.media ? b3.media : void 0 });
        }
      }, b2.preloadModule = function(a3, b3) {
        if ("string" == typeof a3) if (b3) {
          var c2 = g(b3.as, b3.crossOrigin);
          f.d.m(a3, { as: "string" == typeof b3.as && "script" !== b3.as ? b3.as : void 0, crossOrigin: c2, integrity: "string" == typeof b3.integrity ? b3.integrity : void 0 });
        } else f.d.m(a3);
      }, b2.version = "19.2.0-canary-0bdb9206-20250818";
    }, 4211: (a2, b2, c) => {
      "use strict";
      c.d(b2, { _s: () => l, jK: () => j2 });
      var d = c(1212), e = c(2890), f = c(1640), g = c(7316);
      let h = /^([^[]*)\[((?:\[[^\]]*\])|[^\]]+)\](.*)$/;
      function i(a3) {
        let b3 = a3.startsWith("[") && a3.endsWith("]");
        b3 && (a3 = a3.slice(1, -1));
        let c2 = a3.startsWith("...");
        return c2 && (a3 = a3.slice(3)), { key: a3, repeat: c2, optional: b3 };
      }
      function j2(a3, b3) {
        let { includeSuffix: c2 = false, includePrefix: d2 = false, excludeOptionalTrailingSlash: j3 = false } = void 0 === b3 ? {} : b3, { parameterizedRoute: k2, groups: l2 } = function(a4, b4, c3) {
          let d3 = {}, j4 = 1, k3 = [];
          for (let l3 of (0, g.U)(a4).slice(1).split("/")) {
            let a5 = e.VB.find((a6) => l3.startsWith(a6)), g2 = l3.match(h);
            if (a5 && g2 && g2[2]) {
              let { key: b5, optional: c4, repeat: e2 } = i(g2[2]);
              d3[b5] = { pos: j4++, repeat: e2, optional: c4 }, k3.push("/" + (0, f.q)(a5) + "([^/]+?)");
            } else if (g2 && g2[2]) {
              let { key: a6, repeat: b5, optional: e2 } = i(g2[2]);
              d3[a6] = { pos: j4++, repeat: b5, optional: e2 }, c3 && g2[1] && k3.push("/" + (0, f.q)(g2[1]));
              let h2 = b5 ? e2 ? "(?:/(.+?))?" : "/(.+?)" : "/([^/]+?)";
              c3 && g2[1] && (h2 = h2.substring(1)), k3.push(h2);
            } else k3.push("/" + (0, f.q)(l3));
            b4 && g2 && g2[3] && k3.push((0, f.q)(g2[3]));
          }
          return { parameterizedRoute: k3.join(""), groups: d3 };
        }(a3, c2, d2), m = k2;
        return j3 || (m += "(?:/)?"), { re: RegExp("^" + m + "$"), groups: l2 };
      }
      function k(a3) {
        let b3, { interceptionMarker: c2, getSafeRouteKey: d2, segment: e2, routeKeys: g2, keyPrefix: h2, backreferenceDuplicateKeys: j3 } = a3, { key: k2, optional: l2, repeat: m } = i(e2), n = k2.replace(/\W/g, "");
        h2 && (n = "" + h2 + n);
        let o = false;
        (0 === n.length || n.length > 30) && (o = true), isNaN(parseInt(n.slice(0, 1))) || (o = true), o && (n = d2());
        let p = n in g2;
        h2 ? g2[n] = "" + h2 + k2 : g2[n] = k2;
        let q2 = c2 ? (0, f.q)(c2) : "";
        return b3 = p && j3 ? "\\k<" + n + ">" : m ? "(?<" + n + ">.+?)" : "(?<" + n + ">[^/]+?)", l2 ? "(?:/" + q2 + b3 + ")?" : "/" + q2 + b3;
      }
      function l(a3, b3) {
        var c2, i2, l2;
        let m = function(a4, b4, c3, i3, j3) {
          let l3, m2 = (l3 = 0, () => {
            let a5 = "", b5 = ++l3;
            for (; b5 > 0; ) a5 += String.fromCharCode(97 + (b5 - 1) % 26), b5 = Math.floor((b5 - 1) / 26);
            return a5;
          }), n2 = {}, o = [];
          for (let l4 of (0, g.U)(a4).slice(1).split("/")) {
            let a5 = e.VB.some((a6) => l4.startsWith(a6)), g2 = l4.match(h);
            if (a5 && g2 && g2[2]) o.push(k({ getSafeRouteKey: m2, interceptionMarker: g2[1], segment: g2[2], routeKeys: n2, keyPrefix: b4 ? d.h : void 0, backreferenceDuplicateKeys: j3 }));
            else if (g2 && g2[2]) {
              i3 && g2[1] && o.push("/" + (0, f.q)(g2[1]));
              let a6 = k({ getSafeRouteKey: m2, segment: g2[2], routeKeys: n2, keyPrefix: b4 ? d.AA : void 0, backreferenceDuplicateKeys: j3 });
              i3 && g2[1] && (a6 = a6.substring(1)), o.push(a6);
            } else o.push("/" + (0, f.q)(l4));
            c3 && g2 && g2[3] && o.push((0, f.q)(g2[3]));
          }
          return { namedParameterizedRoute: o.join(""), routeKeys: n2 };
        }(a3, b3.prefixRouteKeys, null != (c2 = b3.includeSuffix) && c2, null != (i2 = b3.includePrefix) && i2, null != (l2 = b3.backreferenceDuplicateKeys) && l2), n = m.namedParameterizedRoute;
        return b3.excludeOptionalTrailingSlash || (n += "(?:/)?"), { ...j2(a3, b3), namedRegex: "^" + n + "$", routeKeys: m.routeKeys };
      }
    }, 4289: (a2, b2, c) => {
      "use strict";
      c.d(b2, { Ud: () => d.stringifyCookie, VO: () => d.ResponseCookies, tm: () => d.RequestCookies });
      var d = c(5182);
    }, 4291: (a2, b2, c) => {
      "use strict";
      c.d(b2, { J: () => i });
      var d = c(3114), e = c(9565), f = c(5354), g = c(4289);
      let h = Symbol("internal request");
      class i extends Request {
        constructor(a3, b3 = {}) {
          let c2 = "string" != typeof a3 && "url" in a3 ? a3.url : String(a3);
          (0, e.qU)(c2), a3 instanceof Request ? super(a3, b3) : super(c2, b3);
          let f2 = new d.X(c2, { headers: (0, e.Cu)(this.headers), nextConfig: b3.nextConfig });
          this[h] = { cookies: new g.tm(this.headers), nextUrl: f2, url: f2.toString() };
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return { cookies: this.cookies, nextUrl: this.nextUrl, url: this.url, bodyUsed: this.bodyUsed, cache: this.cache, credentials: this.credentials, destination: this.destination, headers: Object.fromEntries(this.headers), integrity: this.integrity, keepalive: this.keepalive, method: this.method, mode: this.mode, redirect: this.redirect, referrer: this.referrer, referrerPolicy: this.referrerPolicy, signal: this.signal };
        }
        get cookies() {
          return this[h].cookies;
        }
        get nextUrl() {
          return this[h].nextUrl;
        }
        get page() {
          throw new f.Yq();
        }
        get ua() {
          throw new f.l_();
        }
        get url() {
          return this[h].url;
        }
      }
    }, 4430: (a2, b2, c) => {
      "use strict";
      c.d(b2, { V: () => f });
      var d = c(5022), e = c(1534);
      let f = (a3) => (0, d.di)((0, e.k)(a3), 0, 4);
    }, 4570: (a2, b2, c) => {
      "use strict";
      c.d(b2, { EI: () => q2, Fx: () => g, KK: () => p, Li: () => d, Wc: () => j2, jM: () => m, rd: () => o });
      var d = function(a3) {
        return a3.handleRequest = "BaseServer.handleRequest", a3.run = "BaseServer.run", a3.pipe = "BaseServer.pipe", a3.getStaticHTML = "BaseServer.getStaticHTML", a3.render = "BaseServer.render", a3.renderToResponseWithComponents = "BaseServer.renderToResponseWithComponents", a3.renderToResponse = "BaseServer.renderToResponse", a3.renderToHTML = "BaseServer.renderToHTML", a3.renderError = "BaseServer.renderError", a3.renderErrorToResponse = "BaseServer.renderErrorToResponse", a3.renderErrorToHTML = "BaseServer.renderErrorToHTML", a3.render404 = "BaseServer.render404", a3;
      }(d || {}), e = function(a3) {
        return a3.loadDefaultErrorComponents = "LoadComponents.loadDefaultErrorComponents", a3.loadComponents = "LoadComponents.loadComponents", a3;
      }(e || {}), f = function(a3) {
        return a3.getRequestHandler = "NextServer.getRequestHandler", a3.getServer = "NextServer.getServer", a3.getServerRequestHandler = "NextServer.getServerRequestHandler", a3.createServer = "createServer.createServer", a3;
      }(f || {}), g = function(a3) {
        return a3.compression = "NextNodeServer.compression", a3.getBuildId = "NextNodeServer.getBuildId", a3.createComponentTree = "NextNodeServer.createComponentTree", a3.clientComponentLoading = "NextNodeServer.clientComponentLoading", a3.getLayoutOrPageModule = "NextNodeServer.getLayoutOrPageModule", a3.generateStaticRoutes = "NextNodeServer.generateStaticRoutes", a3.generateFsStaticRoutes = "NextNodeServer.generateFsStaticRoutes", a3.generatePublicRoutes = "NextNodeServer.generatePublicRoutes", a3.generateImageRoutes = "NextNodeServer.generateImageRoutes.route", a3.sendRenderResult = "NextNodeServer.sendRenderResult", a3.proxyRequest = "NextNodeServer.proxyRequest", a3.runApi = "NextNodeServer.runApi", a3.render = "NextNodeServer.render", a3.renderHTML = "NextNodeServer.renderHTML", a3.imageOptimizer = "NextNodeServer.imageOptimizer", a3.getPagePath = "NextNodeServer.getPagePath", a3.getRoutesManifest = "NextNodeServer.getRoutesManifest", a3.findPageComponents = "NextNodeServer.findPageComponents", a3.getFontManifest = "NextNodeServer.getFontManifest", a3.getServerComponentManifest = "NextNodeServer.getServerComponentManifest", a3.getRequestHandler = "NextNodeServer.getRequestHandler", a3.renderToHTML = "NextNodeServer.renderToHTML", a3.renderError = "NextNodeServer.renderError", a3.renderErrorToHTML = "NextNodeServer.renderErrorToHTML", a3.render404 = "NextNodeServer.render404", a3.startResponse = "NextNodeServer.startResponse", a3.route = "route", a3.onProxyReq = "onProxyReq", a3.apiResolver = "apiResolver", a3.internalFetch = "internalFetch", a3;
      }(g || {}), h = function(a3) {
        return a3.startServer = "startServer.startServer", a3;
      }(h || {}), i = function(a3) {
        return a3.getServerSideProps = "Render.getServerSideProps", a3.getStaticProps = "Render.getStaticProps", a3.renderToString = "Render.renderToString", a3.renderDocument = "Render.renderDocument", a3.createBodyResult = "Render.createBodyResult", a3;
      }(i || {}), j2 = function(a3) {
        return a3.renderToString = "AppRender.renderToString", a3.renderToReadableStream = "AppRender.renderToReadableStream", a3.getBodyResult = "AppRender.getBodyResult", a3.fetch = "AppRender.fetch", a3;
      }(j2 || {}), k = function(a3) {
        return a3.executeRoute = "Router.executeRoute", a3;
      }(k || {}), l = function(a3) {
        return a3.runHandler = "Node.runHandler", a3;
      }(l || {}), m = function(a3) {
        return a3.runHandler = "AppRouteRouteHandlers.runHandler", a3;
      }(m || {}), n = function(a3) {
        return a3.generateMetadata = "ResolveMetadata.generateMetadata", a3.generateViewport = "ResolveMetadata.generateViewport", a3;
      }(n || {}), o = function(a3) {
        return a3.execute = "Middleware.execute", a3;
      }(o || {});
      let p = /* @__PURE__ */ new Set(["Middleware.execute", "BaseServer.handleRequest", "Render.getServerSideProps", "Render.getStaticProps", "AppRender.fetch", "AppRender.getBodyResult", "Render.renderDocument", "Node.runHandler", "AppRouteRouteHandlers.runHandler", "ResolveMetadata.generateMetadata", "ResolveMetadata.generateViewport", "NextNodeServer.createComponentTree", "NextNodeServer.findPageComponents", "NextNodeServer.getLayoutOrPageModule", "NextNodeServer.startResponse", "NextNodeServer.clientComponentLoading"]), q2 = /* @__PURE__ */ new Set(["NextNodeServer.findPageComponents", "NextNodeServer.createComponentTree", "NextNodeServer.clientComponentLoading"]);
    }, 4725: (a2, b2, c) => {
      "use strict";
      c.d(b2, { db: () => f, eV: () => e });
      var d = c(329);
      function e(a3, { dir: b3, size: c2 = 32 } = {}) {
        return "string" == typeof a3 ? f(a3, { dir: b3, size: c2 }) : function(a4, { dir: b4, size: c3 = 32 } = {}) {
          if (null === c3) return a4;
          if (a4.length > c3) throw new d.Fl({ size: a4.length, targetSize: c3, type: "bytes" });
          let e2 = new Uint8Array(c3);
          for (let d2 = 0; d2 < c3; d2++) {
            let f2 = "right" === b4;
            e2[f2 ? d2 : c3 - d2 - 1] = a4[f2 ? d2 : a4.length - d2 - 1];
          }
          return e2;
        }(a3, { dir: b3, size: c2 });
      }
      function f(a3, { dir: b3, size: c2 = 32 } = {}) {
        if (null === c2) return a3;
        let e2 = a3.replace("0x", "");
        if (e2.length > 2 * c2) throw new d.Fl({ size: Math.ceil(e2.length / 2), targetSize: c2, type: "hex" });
        return `0x${e2["right" === b3 ? "padEnd" : "padStart"](2 * c2, "0")}`;
      }
    }, 4752: (a2, b2, c) => {
      "use strict";
      let d;
      c.d(b2, { V5: () => v2 });
      var e = c(4570), f = c(9414), g = c(1212), h = c(2668), i = c(7261), j2 = c(1087);
      let k = () => {
      };
      function l(a3) {
        if (!a3.body) return [a3, a3];
        let [b3, c2] = a3.body.tee(), e2 = new Response(b3, { status: a3.status, statusText: a3.statusText, headers: a3.headers });
        Object.defineProperty(e2, "url", { value: a3.url, configurable: true, enumerable: true, writable: false }), d && e2.body && d.register(e2, new WeakRef(e2.body));
        let f2 = new Response(c2, { status: a3.status, statusText: a3.statusText, headers: a3.headers });
        return Object.defineProperty(f2, "url", { value: a3.url, configurable: true, enumerable: true, writable: false }), [e2, f2];
      }
      globalThis.FinalizationRegistry && (d = new FinalizationRegistry((a3) => {
        let b3 = a3.deref();
        b3 && !b3.locked && b3.cancel("Response object has been garbage collected").then(k);
      }));
      var m = c(9904), n = c(6859), o = c(5723), p = c(2392), q2 = c(5356).Buffer;
      let r = Symbol.for("next-patch");
      function s(a3, b3) {
        a3.shouldTrackFetchMetrics && (a3.fetchMetrics ??= [], a3.fetchMetrics.push({ ...b3, end: performance.timeOrigin + performance.now(), idx: a3.nextFetchId || 0 }));
      }
      async function t(a3, b3, c2, d2, e2, f2) {
        let g2 = await a3.arrayBuffer(), h2 = { headers: Object.fromEntries(a3.headers.entries()), body: q2.from(g2).toString("base64"), status: a3.status, url: a3.url };
        return c2 && await d2.set(b3, { kind: o.yD.FETCH, data: h2, revalidate: e2 }, c2), await f2(), new Response(g2, { headers: a3.headers, status: a3.status, statusText: a3.statusText });
      }
      async function u(a3, b3, c2, d2, e2, f2, g2, h2, i2) {
        let [j3, k2] = l(b3), m2 = j3.arrayBuffer().then(async (a4) => {
          let b4 = q2.from(a4), h3 = { headers: Object.fromEntries(j3.headers.entries()), body: b4.toString("base64"), status: j3.status, url: j3.url };
          null == f2 || f2.set(c2, h3), d2 && await e2.set(c2, { kind: o.yD.FETCH, data: h3, revalidate: g2 }, d2);
        }).catch((a4) => console.warn("Failed to set fetch cache", h2, a4)).finally(i2), n2 = `cache-set-${c2}`;
        return a3.pendingRevalidates ??= {}, n2 in a3.pendingRevalidates && await a3.pendingRevalidates[n2], a3.pendingRevalidates[n2] = m2.finally(() => {
          var b4;
          (null == (b4 = a3.pendingRevalidates) ? void 0 : b4[n2]) && delete a3.pendingRevalidates[n2];
        }), k2;
      }
      function v2(a3) {
        if (true === globalThis[r]) return;
        let b3 = function(a4) {
          let b4 = j2.cache((a5) => []);
          return function(c2, d2) {
            let e2, f2;
            if (d2 && d2.signal) return a4(c2, d2);
            if ("string" != typeof c2 || d2) {
              let b5 = "string" == typeof c2 || c2 instanceof URL ? new Request(c2, d2) : c2;
              if ("GET" !== b5.method && "HEAD" !== b5.method || b5.keepalive) return a4(c2, d2);
              f2 = JSON.stringify([b5.method, Array.from(b5.headers.entries()), b5.mode, b5.redirect, b5.credentials, b5.referrer, b5.referrerPolicy, b5.integrity]), e2 = b5.url;
            } else f2 = '["GET",[],null,"follow",null,null,null,null]', e2 = c2;
            let g2 = b4(e2);
            for (let a5 = 0, b5 = g2.length; a5 < b5; a5 += 1) {
              let [b6, c3] = g2[a5];
              if (b6 === f2) return c3.then(() => {
                let b7 = g2[a5][2];
                if (!b7) throw Object.defineProperty(new m.z("No cached response"), "__NEXT_ERROR_CODE", { value: "E579", enumerable: false, configurable: true });
                let [c4, d3] = l(b7);
                return g2[a5][2] = d3, c4;
              });
            }
            let h2 = a4(c2, d2), i2 = [f2, h2, null];
            return g2.push(i2), h2.then((a5) => {
              let [b5, c3] = l(a5);
              return i2[2] = c3, b5;
            });
          };
        }(globalThis.fetch);
        globalThis.fetch = function(a4, { workAsyncStorage: b4, workUnitAsyncStorage: c2 }) {
          let d2 = async function(d3, j3) {
            var k2, m2;
            let r2;
            try {
              (r2 = new URL(d3 instanceof Request ? d3.url : d3)).username = "", r2.password = "";
            } catch {
              r2 = void 0;
            }
            let v3 = (null == r2 ? void 0 : r2.href) ?? "", w2 = (null == j3 || null == (k2 = j3.method) ? void 0 : k2.toUpperCase()) || "GET", x2 = (null == j3 || null == (m2 = j3.next) ? void 0 : m2.internal) === true, y = "1" === process.env.NEXT_OTEL_FETCH_DISABLED, z2 = x2 ? void 0 : performance.timeOrigin + performance.now(), A = b4.getStore(), B2 = c2.getStore(), C2 = B2 ? (0, n.Br)(B2) : null;
            C2 && C2.beginRead();
            let D2 = (0, f.EK)().trace(x2 ? e.Fx.internalFetch : e.Wc.fetch, { hideSpan: y, kind: f.v8.CLIENT, spanName: ["fetch", w2, v3].filter(Boolean).join(" "), attributes: { "http.url": v3, "http.method": w2, "net.peer.name": null == r2 ? void 0 : r2.hostname, "net.peer.port": (null == r2 ? void 0 : r2.port) || void 0 } }, async () => {
              var b5;
              let c3, e2, f2, k3, m3, n2;
              if (x2 || !A || A.isDraftMode) return a4(d3, j3);
              let r3 = d3 && "object" == typeof d3 && "string" == typeof d3.method, w3 = (a5) => (null == j3 ? void 0 : j3[a5]) || (r3 ? d3[a5] : null), y2 = (a5) => {
                var b6, c4, e3;
                return void 0 !== (null == j3 || null == (b6 = j3.next) ? void 0 : b6[a5]) ? null == j3 || null == (c4 = j3.next) ? void 0 : c4[a5] : r3 ? null == (e3 = d3.next) ? void 0 : e3[a5] : void 0;
              }, D3 = y2("revalidate"), E = D3, F2 = function(a5, b6) {
                let c4 = [], d4 = [];
                for (let e3 = 0; e3 < a5.length; e3++) {
                  let f3 = a5[e3];
                  if ("string" != typeof f3 ? d4.push({ tag: f3, reason: "invalid type, must be a string" }) : f3.length > g.qq ? d4.push({ tag: f3, reason: `exceeded max length of ${g.qq}` }) : c4.push(f3), c4.length > g.o7) {
                    console.warn(`Warning: exceeded max tag count for ${b6}, dropped tags:`, a5.slice(e3).join(", "));
                    break;
                  }
                }
                if (d4.length > 0) for (let { tag: a6, reason: c5 } of (console.warn(`Warning: invalid tags passed to ${b6}: `), d4)) console.log(`tag: "${a6}" ${c5}`);
                return c4;
              }(y2("tags") || [], `fetch ${d3.toString()}`);
              if (B2) switch (B2.type) {
                case "prerender":
                case "prerender-runtime":
                case "prerender-client":
                case "prerender-ppr":
                case "prerender-legacy":
                case "cache":
                case "private-cache":
                  c3 = B2;
              }
              if (c3 && Array.isArray(F2)) {
                let a5 = c3.tags ?? (c3.tags = []);
                for (let b6 of F2) a5.includes(b6) || a5.push(b6);
              }
              let G2 = null == B2 ? void 0 : B2.implicitTags, H = A.fetchCache;
              B2 && "unstable-cache" === B2.type && (H = "force-no-store");
              let I2 = !!A.isUnstableNoStore, J2 = w3("cache"), K2 = "";
              "string" == typeof J2 && void 0 !== E && ("force-cache" === J2 && 0 === E || "no-store" === J2 && (E > 0 || false === E)) && (e2 = `Specified "cache: ${J2}" and "revalidate: ${E}", only one should be specified.`, J2 = void 0, E = void 0);
              let L2 = "no-cache" === J2 || "no-store" === J2 || "force-no-store" === H || "only-no-store" === H, M = !H && !J2 && !E && A.forceDynamic;
              "force-cache" === J2 && void 0 === E ? E = false : (L2 || M) && (E = 0), ("no-cache" === J2 || "no-store" === J2) && (K2 = `cache: ${J2}`), n2 = function(a5, b6) {
                try {
                  let c4;
                  if (false === a5) c4 = g.AR;
                  else if ("number" == typeof a5 && !isNaN(a5) && a5 > -1) c4 = a5;
                  else if (void 0 !== a5) throw Object.defineProperty(Error(`Invalid revalidate value "${a5}" on "${b6}", must be a non-negative number or false`), "__NEXT_ERROR_CODE", { value: "E179", enumerable: false, configurable: true });
                  return c4;
                } catch (a6) {
                  if (a6 instanceof Error && a6.message.includes("Invalid revalidate")) throw a6;
                  return;
                }
              }(E, A.route);
              let N = w3("headers"), O2 = "function" == typeof (null == N ? void 0 : N.get) ? N : new Headers(N || {}), P2 = O2.get("authorization") || O2.get("cookie"), Q2 = !["get", "head"].includes((null == (b5 = w3("method")) ? void 0 : b5.toLowerCase()) || "get"), R2 = void 0 == H && (void 0 == J2 || "default" === J2) && void 0 == E, S = !!((P2 || Q2) && (null == c3 ? void 0 : c3.revalidate) === 0), T2 = false;
              if (!S && R2 && (A.isBuildTimePrerendering ? T2 = true : S = true), R2 && void 0 !== B2) switch (B2.type) {
                case "prerender":
                case "prerender-runtime":
                case "prerender-client":
                  return C2 && (C2.endRead(), C2 = null), (0, i.W5)(B2.renderSignal, A.route, "fetch()");
              }
              switch (H) {
                case "force-no-store":
                  K2 = "fetchCache = force-no-store";
                  break;
                case "only-no-store":
                  if ("force-cache" === J2 || void 0 !== n2 && n2 > 0) throw Object.defineProperty(Error(`cache: 'force-cache' used on fetch for ${v3} with 'export const fetchCache = 'only-no-store'`), "__NEXT_ERROR_CODE", { value: "E448", enumerable: false, configurable: true });
                  K2 = "fetchCache = only-no-store";
                  break;
                case "only-cache":
                  if ("no-store" === J2) throw Object.defineProperty(Error(`cache: 'no-store' used on fetch for ${v3} with 'export const fetchCache = 'only-cache'`), "__NEXT_ERROR_CODE", { value: "E521", enumerable: false, configurable: true });
                  break;
                case "force-cache":
                  (void 0 === E || 0 === E) && (K2 = "fetchCache = force-cache", n2 = g.AR);
              }
              if (void 0 === n2 ? "default-cache" !== H || I2 ? "default-no-store" === H ? (n2 = 0, K2 = "fetchCache = default-no-store") : I2 ? (n2 = 0, K2 = "noStore call") : S ? (n2 = 0, K2 = "auto no cache") : (K2 = "auto cache", n2 = c3 ? c3.revalidate : g.AR) : (n2 = g.AR, K2 = "fetchCache = default-cache") : K2 || (K2 = `revalidate: ${n2}`), !(A.forceStatic && 0 === n2) && !S && c3 && n2 < c3.revalidate) {
                if (0 === n2) {
                  if (B2) switch (B2.type) {
                    case "prerender":
                    case "prerender-client":
                    case "prerender-runtime":
                      return C2 && (C2.endRead(), C2 = null), (0, i.W5)(B2.renderSignal, A.route, "fetch()");
                  }
                  (0, h.ag)(A, B2, `revalidate: 0 fetch ${d3} ${A.route}`);
                }
                c3 && D3 === n2 && (c3.revalidate = n2);
              }
              let U2 = "number" == typeof n2 && n2 > 0, { incrementalCache: V2 } = A, W2 = false;
              if (B2) switch (B2.type) {
                case "request":
                case "cache":
                case "private-cache":
                  W2 = B2.isHmrRefresh ?? false, k3 = B2.serverComponentsHmrCache;
              }
              if (V2 && (U2 || k3)) try {
                f2 = await V2.generateCacheKey(v3, r3 ? d3 : j3);
              } catch (a5) {
                console.error("Failed to generate cache key for", d3);
              }
              let X = A.nextFetchId ?? 1;
              A.nextFetchId = X + 1;
              let Y2 = () => {
              }, Z = async (b6, c4) => {
                let h2 = ["cache", "credentials", "headers", "integrity", "keepalive", "method", "mode", "redirect", "referrer", "referrerPolicy", "window", "duplex", ...b6 ? [] : ["signal"]];
                if (r3) {
                  let a5 = d3, b7 = { body: a5._ogBody || a5.body };
                  for (let c5 of h2) b7[c5] = a5[c5];
                  d3 = new Request(a5.url, b7);
                } else if (j3) {
                  let { _ogBody: a5, body: c5, signal: d4, ...e3 } = j3;
                  j3 = { ...e3, body: a5 || c5, signal: b6 ? void 0 : d4 };
                }
                let i2 = { ...j3, next: { ...null == j3 ? void 0 : j3.next, fetchType: "origin", fetchIdx: X } };
                return a4(d3, i2).then(async (a5) => {
                  if (!b6 && z2 && s(A, { start: z2, url: v3, cacheReason: c4 || K2, cacheStatus: 0 === n2 || c4 ? "skip" : "miss", cacheWarning: e2, status: a5.status, method: i2.method || "GET" }), 200 === a5.status && V2 && f2 && (U2 || k3)) {
                    let b7 = n2 >= g.AR ? g.qF : n2, c5 = U2 ? { fetchCache: true, fetchUrl: v3, fetchIdx: X, tags: F2, isImplicitBuildTimeCache: T2 } : void 0;
                    switch (null == B2 ? void 0 : B2.type) {
                      case "prerender":
                      case "prerender-client":
                      case "prerender-runtime":
                        return t(a5, f2, c5, V2, b7, Y2);
                      case "prerender-ppr":
                      case "prerender-legacy":
                      case "request":
                      case "cache":
                      case "private-cache":
                      case "unstable-cache":
                      case void 0:
                        return u(A, a5, f2, c5, V2, k3, b7, d3, Y2);
                    }
                  }
                  return await Y2(), a5;
                }).catch((a5) => {
                  throw Y2(), a5;
                });
              }, $ = false, _2 = false;
              if (f2 && V2) {
                let a5;
                if (W2 && k3 && (a5 = k3.get(f2), _2 = true), U2 && !a5) {
                  Y2 = await V2.lock(f2);
                  let b6 = A.isOnDemandRevalidate ? null : await V2.get(f2, { kind: o.Bs.FETCH, revalidate: n2, fetchUrl: v3, fetchIdx: X, tags: F2, softTags: null == G2 ? void 0 : G2.tags });
                  if (R2 && B2) switch (B2.type) {
                    case "prerender":
                    case "prerender-client":
                    case "prerender-runtime":
                      await (0, p.kf)();
                  }
                  if (b6 ? await Y2() : m3 = "cache-control: no-cache (hard refresh)", (null == b6 ? void 0 : b6.value) && b6.value.kind === o.yD.FETCH) if (A.isRevalidate && b6.isStale) $ = true;
                  else {
                    if (b6.isStale && (A.pendingRevalidates ??= {}, !A.pendingRevalidates[f2])) {
                      let a6 = Z(true).then(async (a7) => ({ body: await a7.arrayBuffer(), headers: a7.headers, status: a7.status, statusText: a7.statusText })).finally(() => {
                        A.pendingRevalidates ??= {}, delete A.pendingRevalidates[f2 || ""];
                      });
                      a6.catch(console.error), A.pendingRevalidates[f2] = a6;
                    }
                    a5 = b6.value.data;
                  }
                }
                if (a5) {
                  z2 && s(A, { start: z2, url: v3, cacheReason: K2, cacheStatus: _2 ? "hmr" : "hit", cacheWarning: e2, status: a5.status || 200, method: (null == j3 ? void 0 : j3.method) || "GET" });
                  let b6 = new Response(q2.from(a5.body, "base64"), { headers: a5.headers, status: a5.status });
                  return Object.defineProperty(b6, "url", { value: a5.url }), b6;
                }
              }
              if (A.isStaticGeneration && j3 && "object" == typeof j3) {
                let { cache: a5 } = j3;
                if (delete j3.cache, "no-store" === a5) {
                  if (B2) switch (B2.type) {
                    case "prerender":
                    case "prerender-client":
                    case "prerender-runtime":
                      return C2 && (C2.endRead(), C2 = null), (0, i.W5)(B2.renderSignal, A.route, "fetch()");
                  }
                  (0, h.ag)(A, B2, `no-store fetch ${d3} ${A.route}`);
                }
                let b6 = "next" in j3, { next: e3 = {} } = j3;
                if ("number" == typeof e3.revalidate && c3 && e3.revalidate < c3.revalidate) {
                  if (0 === e3.revalidate) {
                    if (B2) switch (B2.type) {
                      case "prerender":
                      case "prerender-client":
                      case "prerender-runtime":
                        return (0, i.W5)(B2.renderSignal, A.route, "fetch()");
                    }
                    (0, h.ag)(A, B2, `revalidate: 0 fetch ${d3} ${A.route}`);
                  }
                  A.forceStatic && 0 === e3.revalidate || (c3.revalidate = e3.revalidate);
                }
                b6 && delete j3.next;
              }
              if (!f2 || !$) return Z(false, m3);
              {
                let a5 = f2;
                A.pendingRevalidates ??= {};
                let b6 = A.pendingRevalidates[a5];
                if (b6) {
                  let a6 = await b6;
                  return new Response(a6.body, { headers: a6.headers, status: a6.status, statusText: a6.statusText });
                }
                let c4 = Z(true, m3).then(l);
                return (b6 = c4.then(async (a6) => {
                  let b7 = a6[0];
                  return { body: await b7.arrayBuffer(), headers: b7.headers, status: b7.status, statusText: b7.statusText };
                }).finally(() => {
                  var b7;
                  (null == (b7 = A.pendingRevalidates) ? void 0 : b7[a5]) && delete A.pendingRevalidates[a5];
                })).catch(() => {
                }), A.pendingRevalidates[a5] = b6, c4.then((a6) => a6[1]);
              }
            });
            if (C2) try {
              return await D2;
            } finally {
              C2 && C2.endRead();
            }
            return D2;
          };
          return d2.__nextPatched = true, d2.__nextGetStaticStore = () => b4, d2._nextOriginalFetch = a4, globalThis[r] = true, Object.defineProperty(d2, "name", { value: "fetch", writable: false }), d2;
        }(b3, a3);
      }
    }, 4890: (a2, b2, c) => {
      "use strict";
      c.d(b2, { Vw: () => q2, DO: () => f, CC: () => h, sd: () => g, Fe: () => e, Ht: () => i, uH: () => k, Id: () => p, qj: () => r, O8: () => l, po: () => s, Ow: () => m, fd: () => n, ZJ: () => o, DH: () => j2 });
      let d = "object" == typeof globalThis && "crypto" in globalThis ? globalThis.crypto : void 0;
      function e(a3) {
        if (!Number.isSafeInteger(a3) || a3 < 0) throw Error("positive integer expected, got " + a3);
      }
      function f(a3, ...b3) {
        if (!(a3 instanceof Uint8Array || ArrayBuffer.isView(a3) && "Uint8Array" === a3.constructor.name)) throw Error("Uint8Array expected");
        if (b3.length > 0 && !b3.includes(a3.length)) throw Error("Uint8Array expected of length " + b3 + ", got length=" + a3.length);
      }
      function g(a3) {
        if ("function" != typeof a3 || "function" != typeof a3.create) throw Error("Hash should be wrapped by utils.createHasher");
        e(a3.outputLen), e(a3.blockLen);
      }
      function h(a3, b3 = true) {
        if (a3.destroyed) throw Error("Hash instance has been destroyed");
        if (b3 && a3.finished) throw Error("Hash#digest() has already been called");
      }
      function i(a3, b3) {
        f(a3);
        let c2 = b3.outputLen;
        if (a3.length < c2) throw Error("digestInto() expects output buffer of length at least " + c2);
      }
      function j2(a3) {
        return new Uint32Array(a3.buffer, a3.byteOffset, Math.floor(a3.byteLength / 4));
      }
      function k(...a3) {
        for (let b3 = 0; b3 < a3.length; b3++) a3[b3].fill(0);
      }
      function l(a3) {
        return new DataView(a3.buffer, a3.byteOffset, a3.byteLength);
      }
      function m(a3, b3) {
        return a3 << 32 - b3 | a3 >>> b3;
      }
      let n = 68 === new Uint8Array(new Uint32Array([287454020]).buffer)[0] ? (a3) => a3 : function(a3) {
        for (let c2 = 0; c2 < a3.length; c2++) {
          var b3;
          a3[c2] = (b3 = a3[c2]) << 24 & 4278190080 | b3 << 8 & 16711680 | b3 >>> 8 & 65280 | b3 >>> 24 & 255;
        }
        return a3;
      };
      function o(a3) {
        return "string" == typeof a3 && (a3 = function(a4) {
          if ("string" != typeof a4) throw Error("string expected");
          return new Uint8Array(new TextEncoder().encode(a4));
        }(a3)), f(a3), a3;
      }
      function p(...a3) {
        let b3 = 0;
        for (let c3 = 0; c3 < a3.length; c3++) {
          let d2 = a3[c3];
          f(d2), b3 += d2.length;
        }
        let c2 = new Uint8Array(b3);
        for (let b4 = 0, d2 = 0; b4 < a3.length; b4++) {
          let e2 = a3[b4];
          c2.set(e2, d2), d2 += e2.length;
        }
        return c2;
      }
      class q2 {
      }
      function r(a3) {
        let b3 = (b4) => a3().update(o(b4)).digest(), c2 = a3();
        return b3.outputLen = c2.outputLen, b3.blockLen = c2.blockLen, b3.create = () => a3(), b3;
      }
      function s(a3 = 32) {
        if (d && "function" == typeof d.getRandomValues) return d.getRandomValues(new Uint8Array(a3));
        if (d && "function" == typeof d.randomBytes) return Uint8Array.from(d.randomBytes(a3));
        throw Error("crypto.getRandomValues must be defined");
      }
    }, 4946: (a2, b2, c) => {
      "use strict";
      c.d(b2, { m: () => e });
      var d = c(1130);
      function e(a3, b3) {
        if ("string" != typeof a3) return false;
        let { pathname: c2 } = (0, d.R)(a3);
        return c2 === b3 || c2.startsWith(b3 + "/");
      }
    }, 5002: (a2, b2, c) => {
      "use strict";
      function d(a3) {
        let b3 = {};
        for (let [c2, d2] of a3.entries()) {
          let a4 = b3[c2];
          void 0 === a4 ? b3[c2] = d2 : Array.isArray(a4) ? a4.push(d2) : b3[c2] = [a4, d2];
        }
        return b3;
      }
      function e(a3) {
        return "string" == typeof a3 ? a3 : ("number" != typeof a3 || isNaN(a3)) && "boolean" != typeof a3 ? "" : String(a3);
      }
      function f(a3) {
        let b3 = new URLSearchParams();
        for (let [c2, d2] of Object.entries(a3)) if (Array.isArray(d2)) for (let a4 of d2) b3.append(c2, e(a4));
        else b3.set(c2, e(d2));
        return b3;
      }
      c.d(b2, { Bw: () => f, v1: () => d });
    }, 5022: (a2, b2, c) => {
      "use strict";
      c.d(b2, { A1: () => j2, di: () => g });
      var d = c(329), e = c(5237), f = c(2847);
      function g(a3, b3, c2, { strict: d2 } = {}) {
        return (0, e.q)(a3, { strict: false }) ? function(a4, b4, c3, { strict: d3 } = {}) {
          h(a4, b4);
          let e2 = `0x${a4.replace("0x", "").slice((b4 ?? 0) * 2, (c3 ?? a4.length) * 2)}`;
          return d3 && i(e2, b4, c3), e2;
        }(a3, b3, c2, { strict: d2 }) : j2(a3, b3, c2, { strict: d2 });
      }
      function h(a3, b3) {
        if ("number" == typeof b3 && b3 > 0 && b3 > (0, f.E)(a3) - 1) throw new d.ii({ offset: b3, position: "start", size: (0, f.E)(a3) });
      }
      function i(a3, b3, c2) {
        if ("number" == typeof b3 && "number" == typeof c2 && (0, f.E)(a3) !== c2 - b3) throw new d.ii({ offset: c2, position: "end", size: (0, f.E)(a3) });
      }
      function j2(a3, b3, c2, { strict: d2 } = {}) {
        h(a3, b3);
        let e2 = a3.slice(b3, c2);
        return d2 && i(e2, b3, c2), e2;
      }
    }, 5063: (a2, b2, c) => {
      "use strict";
      c.d(b2, { B: () => e, y: () => d });
      var d = function(a3) {
        return a3.APP_PAGE = "APP_PAGE", a3.APP_ROUTE = "APP_ROUTE", a3.PAGES = "PAGES", a3.FETCH = "FETCH", a3.REDIRECT = "REDIRECT", a3.IMAGE = "IMAGE", a3;
      }({}), e = function(a3) {
        return a3.APP_PAGE = "APP_PAGE", a3.APP_ROUTE = "APP_ROUTE", a3.PAGES = "PAGES", a3.FETCH = "FETCH", a3.IMAGE = "IMAGE", a3;
      }({});
    }, 5182: (a2) => {
      "use strict";
      var b2 = Object.defineProperty, c = Object.getOwnPropertyDescriptor, d = Object.getOwnPropertyNames, e = Object.prototype.hasOwnProperty, f = {};
      function g(a3) {
        var b3;
        let c2 = ["path" in a3 && a3.path && `Path=${a3.path}`, "expires" in a3 && (a3.expires || 0 === a3.expires) && `Expires=${("number" == typeof a3.expires ? new Date(a3.expires) : a3.expires).toUTCString()}`, "maxAge" in a3 && "number" == typeof a3.maxAge && `Max-Age=${a3.maxAge}`, "domain" in a3 && a3.domain && `Domain=${a3.domain}`, "secure" in a3 && a3.secure && "Secure", "httpOnly" in a3 && a3.httpOnly && "HttpOnly", "sameSite" in a3 && a3.sameSite && `SameSite=${a3.sameSite}`, "partitioned" in a3 && a3.partitioned && "Partitioned", "priority" in a3 && a3.priority && `Priority=${a3.priority}`].filter(Boolean), d2 = `${a3.name}=${encodeURIComponent(null != (b3 = a3.value) ? b3 : "")}`;
        return 0 === c2.length ? d2 : `${d2}; ${c2.join("; ")}`;
      }
      function h(a3) {
        let b3 = /* @__PURE__ */ new Map();
        for (let c2 of a3.split(/; */)) {
          if (!c2) continue;
          let a4 = c2.indexOf("=");
          if (-1 === a4) {
            b3.set(c2, "true");
            continue;
          }
          let [d2, e2] = [c2.slice(0, a4), c2.slice(a4 + 1)];
          try {
            b3.set(d2, decodeURIComponent(null != e2 ? e2 : "true"));
          } catch {
          }
        }
        return b3;
      }
      function i(a3) {
        if (!a3) return;
        let [[b3, c2], ...d2] = h(a3), { domain: e2, expires: f2, httponly: g2, maxage: i2, path: l2, samesite: m2, secure: n, partitioned: o, priority: p } = Object.fromEntries(d2.map(([a4, b4]) => [a4.toLowerCase().replace(/-/g, ""), b4]));
        {
          var q2, r, s = { name: b3, value: decodeURIComponent(c2), domain: e2, ...f2 && { expires: new Date(f2) }, ...g2 && { httpOnly: true }, ..."string" == typeof i2 && { maxAge: Number(i2) }, path: l2, ...m2 && { sameSite: j2.includes(q2 = (q2 = m2).toLowerCase()) ? q2 : void 0 }, ...n && { secure: true }, ...p && { priority: k.includes(r = (r = p).toLowerCase()) ? r : void 0 }, ...o && { partitioned: true } };
          let a4 = {};
          for (let b4 in s) s[b4] && (a4[b4] = s[b4]);
          return a4;
        }
      }
      ((a3, c2) => {
        for (var d2 in c2) b2(a3, d2, { get: c2[d2], enumerable: true });
      })(f, { RequestCookies: () => l, ResponseCookies: () => m, parseCookie: () => h, parseSetCookie: () => i, stringifyCookie: () => g }), a2.exports = ((a3, f2, g2, h2) => {
        if (f2 && "object" == typeof f2 || "function" == typeof f2) for (let i2 of d(f2)) e.call(a3, i2) || i2 === g2 || b2(a3, i2, { get: () => f2[i2], enumerable: !(h2 = c(f2, i2)) || h2.enumerable });
        return a3;
      })(b2({}, "__esModule", { value: true }), f);
      var j2 = ["strict", "lax", "none"], k = ["low", "medium", "high"], l = class {
        constructor(a3) {
          this._parsed = /* @__PURE__ */ new Map(), this._headers = a3;
          let b3 = a3.get("cookie");
          if (b3) for (let [a4, c2] of h(b3)) this._parsed.set(a4, { name: a4, value: c2 });
        }
        [Symbol.iterator]() {
          return this._parsed[Symbol.iterator]();
        }
        get size() {
          return this._parsed.size;
        }
        get(...a3) {
          let b3 = "string" == typeof a3[0] ? a3[0] : a3[0].name;
          return this._parsed.get(b3);
        }
        getAll(...a3) {
          var b3;
          let c2 = Array.from(this._parsed);
          if (!a3.length) return c2.map(([a4, b4]) => b4);
          let d2 = "string" == typeof a3[0] ? a3[0] : null == (b3 = a3[0]) ? void 0 : b3.name;
          return c2.filter(([a4]) => a4 === d2).map(([a4, b4]) => b4);
        }
        has(a3) {
          return this._parsed.has(a3);
        }
        set(...a3) {
          let [b3, c2] = 1 === a3.length ? [a3[0].name, a3[0].value] : a3, d2 = this._parsed;
          return d2.set(b3, { name: b3, value: c2 }), this._headers.set("cookie", Array.from(d2).map(([a4, b4]) => g(b4)).join("; ")), this;
        }
        delete(a3) {
          let b3 = this._parsed, c2 = Array.isArray(a3) ? a3.map((a4) => b3.delete(a4)) : b3.delete(a3);
          return this._headers.set("cookie", Array.from(b3).map(([a4, b4]) => g(b4)).join("; ")), c2;
        }
        clear() {
          return this.delete(Array.from(this._parsed.keys())), this;
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return `RequestCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`;
        }
        toString() {
          return [...this._parsed.values()].map((a3) => `${a3.name}=${encodeURIComponent(a3.value)}`).join("; ");
        }
      }, m = class {
        constructor(a3) {
          var b3, c2, d2;
          this._parsed = /* @__PURE__ */ new Map(), this._headers = a3;
          let e2 = null != (d2 = null != (c2 = null == (b3 = a3.getSetCookie) ? void 0 : b3.call(a3)) ? c2 : a3.get("set-cookie")) ? d2 : [];
          for (let a4 of Array.isArray(e2) ? e2 : function(a5) {
            if (!a5) return [];
            var b4, c3, d3, e3, f2, g2 = [], h2 = 0;
            function i2() {
              for (; h2 < a5.length && /\s/.test(a5.charAt(h2)); ) h2 += 1;
              return h2 < a5.length;
            }
            for (; h2 < a5.length; ) {
              for (b4 = h2, f2 = false; i2(); ) if ("," === (c3 = a5.charAt(h2))) {
                for (d3 = h2, h2 += 1, i2(), e3 = h2; h2 < a5.length && "=" !== (c3 = a5.charAt(h2)) && ";" !== c3 && "," !== c3; ) h2 += 1;
                h2 < a5.length && "=" === a5.charAt(h2) ? (f2 = true, h2 = e3, g2.push(a5.substring(b4, d3)), b4 = h2) : h2 = d3 + 1;
              } else h2 += 1;
              (!f2 || h2 >= a5.length) && g2.push(a5.substring(b4, a5.length));
            }
            return g2;
          }(e2)) {
            let b4 = i(a4);
            b4 && this._parsed.set(b4.name, b4);
          }
        }
        get(...a3) {
          let b3 = "string" == typeof a3[0] ? a3[0] : a3[0].name;
          return this._parsed.get(b3);
        }
        getAll(...a3) {
          var b3;
          let c2 = Array.from(this._parsed.values());
          if (!a3.length) return c2;
          let d2 = "string" == typeof a3[0] ? a3[0] : null == (b3 = a3[0]) ? void 0 : b3.name;
          return c2.filter((a4) => a4.name === d2);
        }
        has(a3) {
          return this._parsed.has(a3);
        }
        set(...a3) {
          let [b3, c2, d2] = 1 === a3.length ? [a3[0].name, a3[0].value, a3[0]] : a3, e2 = this._parsed;
          return e2.set(b3, function(a4 = { name: "", value: "" }) {
            return "number" == typeof a4.expires && (a4.expires = new Date(a4.expires)), a4.maxAge && (a4.expires = new Date(Date.now() + 1e3 * a4.maxAge)), (null === a4.path || void 0 === a4.path) && (a4.path = "/"), a4;
          }({ name: b3, value: c2, ...d2 })), function(a4, b4) {
            for (let [, c3] of (b4.delete("set-cookie"), a4)) {
              let a5 = g(c3);
              b4.append("set-cookie", a5);
            }
          }(e2, this._headers), this;
        }
        delete(...a3) {
          let [b3, c2] = "string" == typeof a3[0] ? [a3[0]] : [a3[0].name, a3[0]];
          return this.set({ ...c2, name: b3, value: "", expires: /* @__PURE__ */ new Date(0) });
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return `ResponseCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`;
        }
        toString() {
          return [...this._parsed.values()].map(g).join("; ");
        }
      };
    }, 5209: (a2, b2, c) => {
      "use strict";
      c.d(b2, { Z: () => d });
      let d = (0, c(8826).xl)();
    }, 5237: (a2, b2, c) => {
      "use strict";
      function d(a3, { strict: b3 = true } = {}) {
        return !!a3 && "string" == typeof a3 && (b3 ? /^0x[0-9a-fA-F]*$/.test(a3) : a3.startsWith("0x"));
      }
      c.d(b2, { q: () => d });
    }, 5280: (a2, b2, c) => {
      "use strict";
      c.d(b2, { j: () => k, p: () => l });
      var d, e = c(882), f = c(5752), g = c(9633), h = c(2605);
      class i {
        constructor(a3, b3, c2) {
          this.method = a3, this.url = b3, this.body = c2;
        }
        get cookies() {
          return this._cookies ? this._cookies : this._cookies = (0, h.i)(this.headers)();
        }
      }
      class j2 {
        constructor(a3) {
          this.destination = a3;
        }
        redirect(a3, b3) {
          return this.setHeader("Location", a3), this.statusCode = b3, b3 === g.Q.PermanentRedirect && this.setHeader("Refresh", `0;url=${a3}`), this;
        }
      }
      class k extends i {
        static #a = d = f.WT;
        constructor(a3) {
          var b3;
          super(a3.method.toUpperCase(), a3.url, a3), this._req = a3, this.headers = this._req.headers, this.fetchMetrics = null == (b3 = this._req) ? void 0 : b3.fetchMetrics, this[d] = this._req[f.WT] || {}, this.streaming = false;
        }
        get originalRequest() {
          return this._req[f.WT] = this[f.WT], this._req.url = this.url, this._req.cookies = this.cookies, this._req;
        }
        set originalRequest(a3) {
          this._req = a3;
        }
        stream() {
          if (this.streaming) throw Object.defineProperty(Error("Invariant: NodeNextRequest.stream() can only be called once"), "__NEXT_ERROR_CODE", { value: "E467", enumerable: false, configurable: true });
          return this.streaming = true, new ReadableStream({ start: (a3) => {
            this._req.on("data", (b3) => {
              a3.enqueue(new Uint8Array(b3));
            }), this._req.on("end", () => {
              a3.close();
            }), this._req.on("error", (b3) => {
              a3.error(b3);
            });
          } });
        }
      }
      class l extends j2 {
        get originalResponse() {
          return e.M_ in this && (this._res[e.M_] = this[e.M_]), this._res;
        }
        constructor(a3) {
          super(a3), this._res = a3, this.textBody = void 0;
        }
        get sent() {
          return this._res.finished || this._res.headersSent;
        }
        get statusCode() {
          return this._res.statusCode;
        }
        set statusCode(a3) {
          this._res.statusCode = a3;
        }
        get statusMessage() {
          return this._res.statusMessage;
        }
        set statusMessage(a3) {
          this._res.statusMessage = a3;
        }
        setHeader(a3, b3) {
          return this._res.setHeader(a3, b3), this;
        }
        removeHeader(a3) {
          return this._res.removeHeader(a3), this;
        }
        getHeaderValues(a3) {
          let b3 = this._res.getHeader(a3);
          if (void 0 !== b3) return (Array.isArray(b3) ? b3 : [b3]).map((a4) => a4.toString());
        }
        hasHeader(a3) {
          return this._res.hasHeader(a3);
        }
        getHeader(a3) {
          let b3 = this.getHeaderValues(a3);
          return Array.isArray(b3) ? b3.join(",") : void 0;
        }
        getHeaders() {
          return this._res.getHeaders();
        }
        appendHeader(a3, b3) {
          let c2 = this.getHeaderValues(a3) ?? [];
          return c2.includes(b3) || this._res.setHeader(a3, [...c2, b3]), this;
        }
        body(a3) {
          return this.textBody = a3, this;
        }
        send() {
          this._res.end(this.textBody);
        }
        onClose(a3) {
          this.originalResponse.on("close", a3);
        }
      }
    }, 5290: (a2, b2, c) => {
      "use strict";
      function d(a3) {
        return "string" == typeof a3[0] ? e(a3) : function(a4) {
          let b3 = 0;
          for (let c3 of a4) b3 += c3.length;
          let c2 = new Uint8Array(b3), d2 = 0;
          for (let b4 of a4) c2.set(b4, d2), d2 += b4.length;
          return c2;
        }(a3);
      }
      function e(a3) {
        return `0x${a3.reduce((a4, b3) => a4 + b3.replace("0x", ""), "")}`;
      }
      c.d(b2, { aP: () => e, xW: () => d });
    }, 5308: (a2, b2, c) => {
      "use strict";
      c.d(b2, { s: () => P2 });
      var d = c(6216), e = c(5354), f = c(9565);
      let g = Symbol("response"), h = Symbol("passThrough"), i = Symbol("waitUntil");
      class j2 {
        constructor(a3, b3) {
          this[h] = false, this[i] = b3 ? { kind: "external", function: b3 } : { kind: "internal", promises: [] };
        }
        respondWith(a3) {
          this[g] || (this[g] = Promise.resolve(a3));
        }
        passThroughOnException() {
          this[h] = true;
        }
        waitUntil(a3) {
          if ("external" === this[i].kind) return (0, this[i].function)(a3);
          this[i].promises.push(a3);
        }
      }
      class k extends j2 {
        constructor(a3) {
          var b3;
          super(a3.request, null == (b3 = a3.context) ? void 0 : b3.waitUntil), this.sourcePage = a3.page;
        }
        get request() {
          throw Object.defineProperty(new e.CB({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
        respondWith() {
          throw Object.defineProperty(new e.CB({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
      }
      var l = c(4291), m = c(3207);
      function n(a3, b3) {
        let c2 = "string" == typeof b3 ? new URL(b3) : b3, d2 = new URL(a3, b3), e2 = d2.origin === c2.origin;
        return { url: e2 ? d2.toString().slice(c2.origin.length) : d2.toString(), isRelative: e2 };
      }
      var o = c(3114), p = c(2456);
      p._A;
      var q2 = c(4153), r = c(8749), s = c(6859), t = c(655), u = c(7223), v2 = c(9414), w2 = c(4570);
      class x2 {
        onClose(a3) {
          if (this.isClosed) throw Object.defineProperty(Error("Cannot subscribe to a closed CloseController"), "__NEXT_ERROR_CODE", { value: "E365", enumerable: false, configurable: true });
          this.target.addEventListener("close", a3), this.listeners++;
        }
        dispatchClose() {
          if (this.isClosed) throw Object.defineProperty(Error("Cannot close a CloseController multiple times"), "__NEXT_ERROR_CODE", { value: "E229", enumerable: false, configurable: true });
          this.listeners > 0 && this.target.dispatchEvent(new Event("close")), this.isClosed = true;
        }
        constructor() {
          this.target = new EventTarget(), this.listeners = 0, this.isClosed = false;
        }
      }
      var y = c(3682);
      c(8826);
      let z2 = Symbol.for("@next/request-context");
      var A = c(7670);
      class B2 extends l.J {
        constructor(a3) {
          super(a3.input, a3.init), this.sourcePage = a3.page;
        }
        get request() {
          throw Object.defineProperty(new e.CB({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
        respondWith() {
          throw Object.defineProperty(new e.CB({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
        waitUntil() {
          throw Object.defineProperty(new e.CB({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
      }
      let C2 = { keys: (a3) => Array.from(a3.keys()), get: (a3, b3) => a3.get(b3) ?? void 0 }, D2 = (a3, b3) => (0, v2.EK)().withPropagatedContext(a3.headers, b3, C2), E = false;
      async function F2(a3) {
        var b3;
        let e2, g2;
        if (!E && (E = true, "true" === process.env.NEXT_PRIVATE_TEST_PROXY)) {
          let { interceptTestApis: a4, wrapRequestHandler: b4 } = c(7521);
          a4(), D2 = b4(D2);
        }
        await (0, d.p)();
        let h2 = void 0 !== globalThis.__BUILD_MANIFEST;
        a3.request.url = (0, q2.P)(a3.request.url);
        let j3 = a3.bypassNextUrl ? new URL(a3.request.url) : new o.X(a3.request.url, { headers: a3.request.headers, nextConfig: a3.request.nextConfig });
        for (let a4 of [...j3.searchParams.keys()]) {
          let b4 = j3.searchParams.getAll(a4), c2 = (0, f.wN)(a4);
          if (c2) {
            for (let a5 of (j3.searchParams.delete(c2), b4)) j3.searchParams.append(c2, a5);
            j3.searchParams.delete(a4);
          }
        }
        let l2 = process.env.__NEXT_BUILD_ID || "";
        "buildId" in j3 && (l2 = j3.buildId || "", j3.buildId = "");
        let C3 = (0, f.p$)(a3.request.headers), F3 = C3.has("x-nextjs-data"), G3 = "1" === C3.get(p.hY);
        F3 && "/index" === j3.pathname && (j3.pathname = "/");
        let H2 = /* @__PURE__ */ new Map();
        if (!h2) for (let a4 of p.KD) {
          let b4 = C3.get(a4);
          null !== b4 && (H2.set(a4, b4), C3.delete(a4));
        }
        let I3 = j3.searchParams.get(p._A), J3 = new B2({ page: a3.page, input: function(a4) {
          let b4 = "string" == typeof a4, c2 = b4 ? new URL(a4) : a4;
          return c2.searchParams.delete(p._A), b4 ? c2.toString() : c2;
        }(j3).toString(), init: { body: a3.request.body, headers: C3, method: a3.request.method, nextConfig: a3.request.nextConfig, signal: a3.request.signal } });
        F3 && Object.defineProperty(J3, "__isData", { enumerable: false, value: true }), !globalThis.__incrementalCacheShared && a3.IncrementalCache && (globalThis.__incrementalCache = new a3.IncrementalCache({ CurCacheHandler: a3.incrementalCacheHandler, minimalMode: true, fetchCacheKeyPrefix: "", dev: false, requestHeaders: a3.request.headers, getPrerenderManifest: () => ({ version: -1, routes: {}, dynamicRoutes: {}, notFoundRoutes: [], preview: (0, y.getEdgePreviewProps)() }) }));
        let K3 = a3.request.waitUntil ?? (null == (b3 = function() {
          let a4 = globalThis[z2];
          return null == a4 ? void 0 : a4.get();
        }()) ? void 0 : b3.waitUntil), L3 = new k({ request: J3, page: a3.page, context: K3 ? { waitUntil: K3 } : void 0 });
        if ((e2 = await D2(J3, () => {
          if ("/middleware" === a3.page || "/src/middleware" === a3.page) {
            let b4 = L3.waitUntil.bind(L3), c2 = new x2();
            return (0, v2.EK)().trace(w2.rd.execute, { spanName: `middleware ${J3.method} ${J3.nextUrl.pathname}`, attributes: { "http.target": J3.nextUrl.pathname, "http.method": J3.method } }, async () => {
              try {
                var d2, e3, f2, h3;
                let i2 = (0, y.getEdgePreviewProps)(), j4 = await (0, A.l)("/", J3.nextUrl, null), k2 = (0, r.q9)(J3, J3.nextUrl, j4, (a4) => {
                  g2 = a4;
                }, i2), m2 = (0, t.X)({ page: "/", renderOpts: { cacheLifeProfiles: null == (e3 = a3.request.nextConfig) || null == (d2 = e3.experimental) ? void 0 : d2.cacheLife, experimental: { isRoutePPREnabled: false, cacheComponents: false, authInterrupts: !!(null == (h3 = a3.request.nextConfig) || null == (f2 = h3.experimental) ? void 0 : f2.authInterrupts) }, supportsDynamicResponse: true, waitUntil: b4, onClose: c2.onClose.bind(c2), onAfterTaskError: void 0 }, isPrefetchRequest: "1" === J3.headers.get(p._V), buildId: l2 ?? "", previouslyRevalidatedTags: [] });
                return await u.J.run(m2, () => s.FP.run(k2, a3.handler, J3, L3));
              } finally {
                setTimeout(() => {
                  c2.dispatchClose();
                }, 0);
              }
            });
          }
          return a3.handler(J3, L3);
        })) && !(e2 instanceof Response)) throw Object.defineProperty(TypeError("Expected an instance of Response to be returned"), "__NEXT_ERROR_CODE", { value: "E567", enumerable: false, configurable: true });
        e2 && g2 && e2.headers.set("set-cookie", g2);
        let M2 = null == e2 ? void 0 : e2.headers.get("x-middleware-rewrite");
        if (e2 && M2 && (G3 || !h2)) {
          let b4 = new o.X(M2, { forceLocale: true, headers: a3.request.headers, nextConfig: a3.request.nextConfig });
          h2 || b4.host !== J3.nextUrl.host || (b4.buildId = l2 || b4.buildId, e2.headers.set("x-middleware-rewrite", String(b4)));
          let { url: c2, isRelative: d2 } = n(b4.toString(), j3.toString());
          !h2 && F3 && e2.headers.set("x-nextjs-rewrite", c2), G3 && d2 && (j3.pathname !== b4.pathname && e2.headers.set(p.j9, b4.pathname), j3.search !== b4.search && e2.headers.set(p.Wc, b4.search.slice(1)));
        }
        if (e2 && M2 && G3 && I3) {
          let a4 = new URL(M2);
          a4.searchParams.has(p._A) || (a4.searchParams.set(p._A, I3), e2.headers.set("x-middleware-rewrite", a4.toString()));
        }
        let N2 = null == e2 ? void 0 : e2.headers.get("Location");
        if (e2 && N2 && !h2) {
          let b4 = new o.X(N2, { forceLocale: false, headers: a3.request.headers, nextConfig: a3.request.nextConfig });
          e2 = new Response(e2.body, e2), b4.host === j3.host && (b4.buildId = l2 || b4.buildId, e2.headers.set("Location", b4.toString())), F3 && (e2.headers.delete("Location"), e2.headers.set("x-nextjs-redirect", n(b4.toString(), j3.toString()).url));
        }
        let O3 = e2 || m.R.next(), P3 = O3.headers.get("x-middleware-override-headers"), Q2 = [];
        if (P3) {
          for (let [a4, b4] of H2) O3.headers.set(`x-middleware-request-${a4}`, b4), Q2.push(a4);
          Q2.length > 0 && O3.headers.set("x-middleware-override-headers", P3 + "," + Q2.join(","));
        }
        return { response: O3, waitUntil: ("internal" === L3[i].kind ? Promise.all(L3[i].promises).then(() => {
        }) : void 0) ?? Promise.resolve(), fetchMetrics: J3.fetchMetrics };
      }
      var G2 = c(2449), H = c(2831), I2 = c(7581), J2 = c(4211);
      class K2 {
        constructor(a3) {
          this.definition = a3, (0, H.F)(a3.pathname) && (this.dynamic = (0, I2.g)((0, J2.jK)(a3.pathname)));
        }
        get identity() {
          return this.definition.pathname;
        }
        get isDynamic() {
          return void 0 !== this.dynamic;
        }
        match(a3) {
          let b3 = this.test(a3);
          return b3 ? { definition: this.definition, params: b3.params } : null;
        }
        test(a3) {
          if (this.dynamic) {
            let b3 = this.dynamic(a3);
            return b3 ? { params: b3 } : null;
          }
          return a3 === this.definition.pathname ? {} : null;
        }
      }
      let L2 = Symbol.for("__next_internal_waitUntil__"), M = globalThis[L2] || (globalThis[L2] = { waitUntilCounter: 0, waitUntilResolve: void 0, waitUntilPromise: null });
      var N = c(8360), O2 = c(5002);
      class P2 {
        constructor(a3, b3) {
          this.routeModule = a3, this.nextConfig = b3, this.matcher = new K2(a3.definition);
        }
        static wrap(a3, b3) {
          let c2 = new P2(a3, b3.nextConfig);
          return (a4) => F2({ ...a4, IncrementalCache: G2.N, handler: c2.handler.bind(c2) });
        }
        async handler(a3, b3) {
          let { params: c2 } = (0, N.VQ)({ pageIsDynamic: this.matcher.isDynamic, page: this.matcher.definition.pathname, basePath: a3.nextUrl.basePath, rewrites: {}, caseSensitive: false }).normalizeDynamicRouteParams((0, O2.v1)(a3.nextUrl.searchParams), false), d2 = b3.waitUntil.bind(b3), e2 = new x2(), f2 = { params: c2, prerenderManifest: { version: 4, routes: {}, dynamicRoutes: {}, preview: (0, y.getEdgePreviewProps)(), notFoundRoutes: [] }, renderOpts: { supportsDynamicResponse: true, waitUntil: d2, onClose: e2.onClose.bind(e2), onAfterTaskError: void 0, experimental: { cacheComponents: false, authInterrupts: false }, cacheLifeProfiles: this.nextConfig.experimental.cacheLife }, sharedContext: { buildId: "" } }, g2 = await this.routeModule.handle(a3, f2), h2 = [M.waitUntilPromise];
          return f2.renderOpts.pendingWaitUntil && h2.push(f2.renderOpts.pendingWaitUntil), b3.waitUntil(Promise.all(h2)), g2.body ? g2 = new Response(function(a4, b4) {
            let c3 = new TransformStream(), d3 = () => b4();
            return a4.pipeTo(c3.writable).then(d3, d3), c3.readable;
          }(g2.body, () => e2.dispatchClose()), { status: g2.status, statusText: g2.statusText, headers: g2.headers }) : setTimeout(() => e2.dispatchClose(), 0), g2;
        }
      }
    }, 5335: (a2, b2, c) => {
      "use strict";
      c.d(b2, { Q: () => e, n: () => d });
      let d = /* @__PURE__ */ new Map(), e = (a3, b3) => {
        for (let c2 of a3) {
          let a4 = d.get(c2);
          if ("number" == typeof a4 && a4 >= b3) return true;
        }
        return false;
      };
    }, 5354: (a2, b2, c) => {
      "use strict";
      c.d(b2, { CB: () => d, Yq: () => e, l_: () => f });
      class d extends Error {
        constructor({ page: a3 }) {
          super(`The middleware "${a3}" accepts an async API directly with the form:
  
  export function middleware(request, event) {
    return NextResponse.redirect('/new-location')
  }
  
  Read more: https://nextjs.org/docs/messages/middleware-new-signature
  `);
        }
      }
      class e extends Error {
        constructor() {
          super(`The request.page has been deprecated in favour of \`URLPattern\`.
  Read more: https://nextjs.org/docs/messages/middleware-request-page
  `);
        }
      }
      class f extends Error {
        constructor() {
          super(`The request.ua has been removed in favour of \`userAgent\` function.
  Read more: https://nextjs.org/docs/messages/middleware-parse-user-agent
  `);
        }
      }
    }, 5638: (a2, b2, c) => {
      "use strict";
      c.r(b2), c.d(b2, { DynamicServerError: () => e, isDynamicServerError: () => f });
      let d = "DYNAMIC_SERVER_USAGE";
      class e extends Error {
        constructor(a3) {
          super("Dynamic server usage: " + a3), this.description = a3, this.digest = d;
        }
      }
      function f(a3) {
        return "object" == typeof a3 && null !== a3 && "digest" in a3 && "string" == typeof a3.digest && a3.digest === d;
      }
    }, 5723: (a2, b2, c) => {
      "use strict";
      c.d(b2, { yD: () => i.y, Bs: () => i.B, Ay: () => B2 });
      var d = c(4023);
      class e {
        constructor(a3, b3 = (a4) => a4()) {
          this.cacheKeyFn = a3, this.schedulerFn = b3, this.pending = /* @__PURE__ */ new Map();
        }
        static create(a3) {
          return new e(null == a3 ? void 0 : a3.cacheKeyFn, null == a3 ? void 0 : a3.schedulerFn);
        }
        async batch(a3, b3) {
          let c2 = this.cacheKeyFn ? await this.cacheKeyFn(a3) : a3;
          if (null === c2) return b3(c2, Promise.resolve);
          let e2 = this.pending.get(c2);
          if (e2) return e2;
          let { promise: f2, resolve: g2, reject: h2 } = new d.q();
          return this.pending.set(c2, f2), this.schedulerFn(async () => {
            try {
              let a4 = await b3(c2, g2);
              g2(a4);
            } catch (a4) {
              h2(a4);
            } finally {
              this.pending.delete(c2);
            }
          }), f2;
        }
      }
      var f = c(4055), g = c(857), h = c(2392), i = c(5063);
      function j2() {
      }
      c(9414), c(4570), new Uint8Array([60, 104, 116, 109, 108]), new Uint8Array([60, 98, 111, 100, 121]), new Uint8Array([60, 47, 104, 101, 97, 100, 62]), new Uint8Array([60, 47, 98, 111, 100, 121, 62]), new Uint8Array([60, 47, 104, 116, 109, 108, 62]), new Uint8Array([60, 47, 98, 111, 100, 121, 62, 60, 47, 104, 116, 109, 108, 62]), new Uint8Array([60, 109, 101, 116, 97, 32, 110, 97, 109, 101, 61, 34, 194, 171, 110, 120, 116, 45, 105, 99, 111, 110, 194, 187, 34]), c(5356).Buffer;
      let k = new TextEncoder();
      function l(a3) {
        return new ReadableStream({ start(b3) {
          b3.enqueue(k.encode(a3)), b3.close();
        } });
      }
      function m(a3) {
        return new ReadableStream({ start(b3) {
          b3.enqueue(a3), b3.close();
        } });
      }
      async function n(a3, b3) {
        let c2 = new TextDecoder("utf-8", { fatal: true }), d2 = "";
        for await (let e2 of a3) {
          if (null == b3 ? void 0 : b3.aborted) return d2;
          d2 += c2.decode(e2, { stream: true });
        }
        return d2 + c2.decode();
      }
      var o = c(8546), p = c(9904), q2 = c(5356).Buffer;
      class r {
        static #a = this.EMPTY = new r(null, { metadata: {}, contentType: null });
        static fromStatic(a3, b3) {
          return new r(a3, { metadata: {}, contentType: b3 });
        }
        constructor(a3, { contentType: b3, waitUntil: c2, metadata: d2 }) {
          this.response = a3, this.contentType = b3, this.metadata = d2, this.waitUntil = c2;
        }
        assignMetadata(a3) {
          Object.assign(this.metadata, a3);
        }
        get isNull() {
          return null === this.response;
        }
        get isDynamic() {
          return "string" != typeof this.response;
        }
        toUnchunkedString(a3 = false) {
          if (null === this.response) return "";
          if ("string" != typeof this.response) {
            if (!a3) throw Object.defineProperty(new p.z("dynamic responses cannot be unchunked. This is a bug in Next.js"), "__NEXT_ERROR_CODE", { value: "E732", enumerable: false, configurable: true });
            return n(this.readable);
          }
          return this.response;
        }
        get readable() {
          return null === this.response ? new ReadableStream({ start(a3) {
            a3.close();
          } }) : "string" == typeof this.response ? l(this.response) : q2.isBuffer(this.response) ? m(this.response) : Array.isArray(this.response) ? function(...a3) {
            if (0 === a3.length) return new ReadableStream({ start(a4) {
              a4.close();
            } });
            if (1 === a3.length) return a3[0];
            let { readable: b3, writable: c2 } = new TransformStream(), d2 = a3[0].pipeTo(c2, { preventClose: true }), e2 = 1;
            for (; e2 < a3.length - 1; e2++) {
              let b4 = a3[e2];
              d2 = d2.then(() => b4.pipeTo(c2, { preventClose: true }));
            }
            let f2 = a3[e2];
            return (d2 = d2.then(() => f2.pipeTo(c2))).catch(j2), b3;
          }(...this.response) : this.response;
        }
        coerce() {
          return null === this.response ? [] : "string" == typeof this.response ? [l(this.response)] : Array.isArray(this.response) ? this.response : q2.isBuffer(this.response) ? [m(this.response)] : [this.response];
        }
        unshift(a3) {
          this.response = this.coerce(), this.response.unshift(a3);
        }
        push(a3) {
          this.response = this.coerce(), this.response.push(a3);
        }
        async pipeTo(a3) {
          try {
            await this.readable.pipeTo(a3, { preventClose: true }), this.waitUntil && await this.waitUntil, await a3.close();
          } catch (b3) {
            if ((0, o.z)(b3)) return void await a3.abort(b3);
            throw b3;
          }
        }
        async pipeToNodeResponse(a3) {
          await (0, o.p)(this.readable, a3, this.waitUntil);
        }
      }
      var s = c(1983), t = c(1212);
      async function u(a3) {
        var b3, c2;
        return { ...a3, value: (null == (b3 = a3.value) ? void 0 : b3.kind) === i.y.PAGES ? { kind: i.y.PAGES, html: await a3.value.html.toUnchunkedString(true), pageData: a3.value.pageData, headers: a3.value.headers, status: a3.value.status } : (null == (c2 = a3.value) ? void 0 : c2.kind) === i.y.APP_PAGE ? { kind: i.y.APP_PAGE, html: await a3.value.html.toUnchunkedString(true), postponed: a3.value.postponed, rscData: a3.value.rscData, headers: a3.value.headers, status: a3.value.status, segmentData: a3.value.segmentData } : a3.value };
      }
      async function v2(a3) {
        var b3, c2;
        return a3 ? { isMiss: a3.isMiss, isStale: a3.isStale, cacheControl: a3.cacheControl, value: (null == (b3 = a3.value) ? void 0 : b3.kind) === i.y.PAGES ? { kind: i.y.PAGES, html: r.fromStatic(a3.value.html, t.j9), pageData: a3.value.pageData, headers: a3.value.headers, status: a3.value.status } : (null == (c2 = a3.value) ? void 0 : c2.kind) === i.y.APP_PAGE ? { kind: i.y.APP_PAGE, html: r.fromStatic(a3.value.html, t.j9), rscData: a3.value.rscData, headers: a3.value.headers, status: a3.value.status, postponed: a3.value.postponed, segmentData: a3.value.segmentData } : a3.value } : null;
      }
      function w2(a3, b3) {
        if (!a3) return b3;
        let c2 = parseInt(a3, 10);
        return Number.isFinite(c2) && c2 > 0 ? c2 : b3;
      }
      let x2 = w2(process.env.NEXT_PRIVATE_RESPONSE_CACHE_TTL, 1e4), y = w2(process.env.NEXT_PRIVATE_RESPONSE_CACHE_MAX_SIZE, 150), z2 = "__ttl_sentinel__";
      function A(a3, b3) {
        return `${a3}\0${b3 ?? z2}`;
      }
      class B2 {
        constructor(a3, b3 = y, c2 = x2) {
          this.batcher = e.create({ cacheKeyFn: ({ key: a4, isOnDemandRevalidate: b4 }) => `${a4}-${b4 ? "1" : "0"}`, schedulerFn: h.x8 }), this.revalidateBatcher = e.create({ schedulerFn: h.x8 }), this.evictedInvocationIDs = /* @__PURE__ */ new Set(), this.minimal_mode = a3, this.maxSize = b3, this.ttl = c2, this.cache = new f.q(b3, void 0, (a4) => {
            let b4 = function(a5) {
              let b5 = a5.lastIndexOf("\0");
              if (-1 === b5) return;
              let c3 = a5.slice(b5 + 1);
              return c3 === z2 ? void 0 : c3;
            }(a4);
            if (b4) {
              if (this.evictedInvocationIDs.size >= 100) {
                let a5 = this.evictedInvocationIDs.values().next().value;
                a5 && this.evictedInvocationIDs.delete(a5);
              }
              this.evictedInvocationIDs.add(b4);
            }
          });
        }
        async get(a3, b3, c2) {
          if (!a3) return b3({ hasResolved: false, previousCacheEntry: null });
          if (this.minimal_mode) {
            let b4 = A(a3, c2.invocationID), d3 = this.cache.get(b4);
            if (d3) {
              if (void 0 !== c2.invocationID) return v2(d3.entry);
              let a4 = Date.now();
              if (d3.expiresAt > a4) return v2(d3.entry);
              this.cache.remove(b4);
            }
            c2.invocationID && this.evictedInvocationIDs.has(c2.invocationID) && (0, g.mc)(`Response cache entry was evicted for invocation ${c2.invocationID}. Consider increasing NEXT_PRIVATE_RESPONSE_CACHE_MAX_SIZE (current: ${this.maxSize}).`);
          }
          let { incrementalCache: d2, isOnDemandRevalidate: e2 = false, isFallback: f2 = false, isRoutePPREnabled: h2 = false, isPrefetch: i2 = false, waitUntil: j3, routeKind: k2, invocationID: l2 } = c2, m2 = await this.batcher.batch({ key: a3, isOnDemandRevalidate: e2 }, (c3, g2) => {
            let m3 = this.handleGet(a3, b3, { incrementalCache: d2, isOnDemandRevalidate: e2, isFallback: f2, isRoutePPREnabled: h2, isPrefetch: i2, routeKind: k2, invocationID: l2 }, g2);
            return j3 && j3(m3), m3;
          });
          return v2(m2);
        }
        async handleGet(a3, b3, c2, d2) {
          let e2 = null, f2 = false;
          try {
            if ((e2 = this.minimal_mode ? null : await c2.incrementalCache.get(a3, { kind: function(a4) {
              switch (a4) {
                case s.A.PAGES:
                  return i.B.PAGES;
                case s.A.APP_PAGE:
                  return i.B.APP_PAGE;
                case s.A.IMAGE:
                  return i.B.IMAGE;
                case s.A.APP_ROUTE:
                  return i.B.APP_ROUTE;
                case s.A.PAGES_API:
                  throw Object.defineProperty(Error(`Unexpected route kind ${a4}`), "__NEXT_ERROR_CODE", { value: "E64", enumerable: false, configurable: true });
                default:
                  return a4;
              }
            }(c2.routeKind), isRoutePPREnabled: c2.isRoutePPREnabled, isFallback: c2.isFallback })) && !c2.isOnDemandRevalidate && (d2(e2), f2 = true, !e2.isStale || c2.isPrefetch)) return e2;
            let g2 = await this.revalidate(a3, c2.incrementalCache, c2.isRoutePPREnabled, c2.isFallback, b3, e2, null !== e2 && !c2.isOnDemandRevalidate, void 0, c2.invocationID);
            if (!g2) {
              if (this.minimal_mode) {
                let b4 = A(a3, c2.invocationID);
                this.cache.remove(b4);
              }
              return null;
            }
            return c2.isOnDemandRevalidate, g2;
          } catch (a4) {
            if (f2) return console.error(a4), null;
            throw a4;
          }
        }
        async revalidate(a3, b3, c2, d2, e2, f2, g2, h2, i2) {
          return this.revalidateBatcher.batch(a3, () => {
            let j3 = this.handleRevalidate(a3, b3, c2, d2, e2, f2, g2, i2);
            return h2 && h2(j3), j3;
          });
        }
        async handleRevalidate(a3, b3, c2, d2, e2, f2, g2, h2) {
          try {
            let i2 = await e2({ hasResolved: g2, previousCacheEntry: f2, isRevalidating: true });
            if (!i2) return null;
            let j3 = await u({ ...i2, isMiss: !f2 });
            if (j3.cacheControl) if (this.minimal_mode) {
              let b4 = A(a3, h2);
              this.cache.set(b4, { entry: j3, expiresAt: Date.now() + this.ttl });
            } else await b3.set(a3, j3.value, { cacheControl: j3.cacheControl, isRoutePPREnabled: c2, isFallback: d2 });
            return j3;
          } catch (e3) {
            if (null == f2 ? void 0 : f2.cacheControl) {
              let e4 = Math.min(Math.max(f2.cacheControl.revalidate || 3, 3), 30), g3 = void 0 === f2.cacheControl.expire ? void 0 : Math.max(e4 + 3, f2.cacheControl.expire);
              await b3.set(a3, f2.value, { cacheControl: { revalidate: e4, expire: g3 }, isRoutePPREnabled: c2, isFallback: d2 });
            }
            throw e3;
          }
        }
      }
    }, 5752: (a2, b2, c) => {
      "use strict";
      c.d(b2, { Ny: () => e, Ul: () => f, WT: () => d });
      let d = Symbol.for("NextInternalRequestMeta");
      function e(a3, b3) {
        let c2 = a3[d] || {};
        return "string" == typeof b3 ? c2[b3] : c2;
      }
      function f(a3, b3, c2) {
        let f2 = e(a3);
        return f2[b3] = c2, a3[d] = f2, f2;
      }
    }, 5808: (a2, b2, c) => {
      "use strict";
      c.d(b2, { ME: () => j2, Nx: () => i, Sl: () => g, uU: () => h });
      var d = c(7116), e = c(2847), f = c(606);
      function g(a3, { size: b3 }) {
        if ((0, e.E)(a3) > b3) throw new d.u({ givenSize: (0, e.E)(a3), maxSize: b3 });
      }
      function h(a3, b3 = {}) {
        let { signed: c2 } = b3;
        b3.size && g(a3, { size: b3.size });
        let d2 = BigInt(a3);
        if (!c2) return d2;
        let e2 = (a3.length - 2) / 2;
        return d2 <= (1n << 8n * BigInt(e2) - 1n) - 1n ? d2 : d2 - BigInt(`0x${"f".padStart(2 * e2, "f")}`) - 1n;
      }
      function i(a3, b3 = {}) {
        let c2 = a3;
        if (b3.size && (g(c2, { size: b3.size }), c2 = (0, f.B)(c2)), "0x00" === (0, f.B)(c2)) return false;
        if ("0x01" === (0, f.B)(c2)) return true;
        throw new d.H2(c2);
      }
      function j2(a3, b3 = {}) {
        let c2 = h(a3, b3), e2 = Number(c2);
        if (!Number.isSafeInteger(e2)) throw new d.Ty({ max: `${Number.MAX_SAFE_INTEGER}`, min: `${Number.MIN_SAFE_INTEGER}`, signed: b3.signed, size: b3.size, value: `${c2}n` });
        return e2;
      }
    }, 5826: (a2, b2, c) => {
      "use strict";
      c.d(b2, { l: () => d });
      class d {
        static get(a3, b3, c2) {
          let d2 = Reflect.get(a3, b3, c2);
          return "function" == typeof d2 ? d2.bind(a3) : d2;
        }
        static set(a3, b3, c2, d2) {
          return Reflect.set(a3, b3, c2, d2);
        }
        static has(a3, b3) {
          return Reflect.has(a3, b3);
        }
        static deleteProperty(a3, b3) {
          return Reflect.deleteProperty(a3, b3);
        }
      }
    }, 5897: (a2, b2, c) => {
      "use strict";
      function d(a3) {
        return a3.isOnDemandRevalidate ? "on-demand" : a3.isRevalidate ? "stale" : void 0;
      }
      c.d(b2, { c: () => d });
    }, 6008: (a2, b2, c) => {
      "use strict";
      let d;
      c.d(b2, { AppRouteRouteModule: () => at });
      var e = {};
      c.r(e), c.d(e, { AppRouterContext: () => W2, GlobalLayoutRouterContext: () => Y2, LayoutRouterContext: () => X, MissingSlotContext: () => $, TemplateContext: () => Z });
      var f = {};
      c.r(f), c.d(f, { appRouterContext: () => e }), c(3948);
      let g = { client: "client", server: "server", edgeServer: "edge-server" };
      g.client, g.server, g.edgeServer, Symbol("polyfills");
      var h = c(1668), i = c(460), j2 = c(2831), k = c(7504), l = c(8360), m = c(2993), n = c(7205), o = c(882), p = c(4946);
      function q2(a3) {
        return (0, p.m)(a3 || "/", "/_next/data") && "/index" === (a3 = a3.replace(/\/_next\/data\/[^/]{1,}/, "").replace(/\.json$/, "")) ? "/" : a3;
      }
      var r = c(5752);
      c(622), c(2449), c(2398);
      var s = c(5723), t = c(4153);
      let u = Symbol.for("@next/router-server-methods"), v2 = globalThis;
      var w2 = c(7502), x2 = c(7316);
      c(7538);
      class y {
        constructor({ userland: a3, definition: b3, distDir: c2, relativeProjectDir: d2 }) {
          this.userland = a3, this.definition = b3, this.isDev = false, this.distDir = c2, this.relativeProjectDir = d2;
        }
        async instrumentationOnRequestError(a3, ...b3) {
          {
            let { getEdgeInstrumentationModule: a4 } = await Promise.resolve().then(c.bind(c, 6216)), d2 = await a4();
            d2 && await (null == d2.onRequestError ? void 0 : d2.onRequestError.call(d2, ...b3));
          }
        }
        loadManifests(a3, b3) {
          {
            var d2;
            let { getEdgePreviewProps: b4 } = c(3682), e2 = (a4) => a4 ? JSON.parse(a4) : void 0;
            return { buildId: process.env.__NEXT_BUILD_ID || "", buildManifest: self.__BUILD_MANIFEST, fallbackBuildManifest: {}, reactLoadableManifest: e2(self.__REACT_LOADABLE_MANIFEST), nextFontManifest: e2(self.__NEXT_FONT_MANIFEST), prerenderManifest: { routes: {}, dynamicRoutes: {}, notFoundRoutes: [], version: 4, preview: b4() }, routesManifest: { version: 4, caseSensitive: false, basePath: "", rewrites: { beforeFiles: [], afterFiles: [], fallback: [] }, redirects: [], headers: [], i18n: void 0, skipMiddlewareUrlNormalize: false }, serverFilesManifest: { config: globalThis.nextConfig || {} }, clientReferenceManifest: null == (d2 = self.__RSC_MANIFEST) ? void 0 : d2[a3], serverActionsManifest: e2(self.__RSC_SERVER_MANIFEST), subresourceIntegrityManifest: e2(self.__SUBRESOURCE_INTEGRITY_MANIFEST), dynamicCssManifest: e2(self.__DYNAMIC_CSS_MANIFEST), interceptionRoutePatterns: (e2(self.__INTERCEPTION_ROUTE_REWRITE_MANIFEST) ?? []).map((a4) => new RegExp(a4.regex)) };
          }
        }
        async loadCustomCacheHandlers(a3, b3) {
        }
        async getIncrementalCache(a3, b3, c2) {
          return globalThis.__incrementalCache;
        }
        async onRequestError(a3, b3, c2, d2) {
          (null == d2 ? void 0 : d2.logErrorWithOriginalStack) ? d2.logErrorWithOriginalStack(b3, "app-dir") : console.error(b3), await this.instrumentationOnRequestError(a3, b3, { path: a3.url || "/", headers: a3.headers, method: a3.method || "GET" }, c2);
        }
        async prepare(a3, b3, { srcPage: c2, multiZoneDraftMode: d2 }) {
          var e2;
          let f2, g2, s2, y2, z3 = await this.loadManifests(c2, f2), { routesManifest: A2, prerenderManifest: B3, serverFilesManifest: C3 } = z3, D3 = (0, r.Ny)(a3, "relativeProjectDir") || this.relativeProjectDir, E2 = null == (e2 = v2[u]) ? void 0 : e2[D3], { basePath: F3, i18n: G3, rewrites: H2 } = A2;
          F3 && (a3.url = (0, k.y)(a3.url || "/", F3));
          let I3 = (0, h.Rk)(a3.url || "/");
          if (!I3) return;
          let J3 = false;
          (0, p.m)(I3.pathname || "/", "/_next/data") && (J3 = true, I3.pathname = q2(I3.pathname || "/"));
          let K3 = I3.pathname || "/", L3 = { ...I3.query }, M2 = (0, j2.F)(c2);
          G3 && (g2 = (0, i.d)(I3.pathname || "/", G3.locales)).detectedLocale && (a3.url = `${g2.pathname}${I3.search}`, K3 = g2.pathname, s2 || (s2 = g2.detectedLocale));
          let N2 = (0, l.VQ)({ page: c2, i18n: G3, basePath: F3, rewrites: H2, pageIsDynamic: M2, trailingSlash: false, caseSensitive: !!A2.caseSensitive }), O3 = (0, m.C)(null == G3 ? void 0 : G3.domains, (0, n.E)(I3, a3.headers), s2);
          (0, r.Ul)(a3, "isLocaleDomain", !!O3);
          let P3 = (null == O3 ? void 0 : O3.defaultLocale) || (null == G3 ? void 0 : G3.defaultLocale);
          P3 && !s2 && (I3.pathname = `/${P3}${"/" === I3.pathname ? "" : I3.pathname}`);
          let Q3 = (0, r.Ny)(a3, "locale") || s2 || P3, R3 = Object.keys(N2.handleRewrites(a3, I3));
          G3 && (I3.pathname = (0, i.d)(I3.pathname || "/", G3.locales).pathname);
          let S2 = (0, r.Ny)(a3, "params");
          if (!S2 && N2.dynamicRouteMatcher) {
            let a4 = N2.dynamicRouteMatcher(q2((null == g2 ? void 0 : g2.pathname) || I3.pathname || "/")), b4 = N2.normalizeDynamicRouteParams(a4 || {}, true);
            b4.hasValidParams && (S2 = b4.params);
          }
          let T3 = (0, r.Ny)(a3, "query") || { ...I3.query }, U3 = /* @__PURE__ */ new Set(), V3 = [];
          if (!this.isAppRouter) for (let a4 of [...R3, ...Object.keys(N2.defaultRouteMatches || {})]) {
            let b4 = Array.isArray(L3[a4]) ? L3[a4].join("") : L3[a4], c3 = Array.isArray(T3[a4]) ? T3[a4].join("") : T3[a4];
            a4 in L3 && b4 !== c3 || V3.push(a4);
          }
          if (N2.normalizeCdnUrl(a3, V3), (null == E2 ? void 0 : E2.isWrappedByNextServer) ? N2.filterInternalQuery(T3, []) : N2.normalizeQueryParams(T3, U3), N2.filterInternalQuery(L3, V3), M2) {
            let b4 = N2.normalizeDynamicRouteParams(T3, true), c3 = N2.normalizeDynamicRouteParams(S2 || {}, true).hasValidParams && S2 ? S2 : b4.hasValidParams ? T3 : {};
            if (a3.url = N2.interpolateDynamicPath(a3.url || "/", c3), I3.pathname = N2.interpolateDynamicPath(I3.pathname || "/", c3), K3 = N2.interpolateDynamicPath(K3, c3), !S2) if (b4.hasValidParams) for (let a4 in S2 = Object.assign({}, b4.params), N2.defaultRouteMatches) delete T3[a4];
            else {
              let a4 = null == N2.dynamicRouteMatcher ? void 0 : N2.dynamicRouteMatcher.call(N2, q2((null == g2 ? void 0 : g2.pathname) || I3.pathname || "/"));
              a4 && (S2 = Object.assign({}, a4));
            }
          }
          for (let a4 of U3) a4 in L3 || delete T3[a4];
          let { isOnDemandRevalidate: W3, revalidateOnlyGenerated: X2 } = (0, o.Gx)(a3, B3.preview), Y3 = (null == E2 ? void 0 : E2.nextConfig) || C3.config, Z2 = (0, t.Y)(c2), $2 = (0, r.Ny)(a3, "rewroteURL") || Z2;
          (0, j2.F)($2) && S2 && ($2 = N2.interpolateDynamicPath($2, S2)), "/index" === $2 && ($2 = "/");
          try {
            $2 = $2.split("/").map((a4) => {
              try {
                var b4;
                b4 = decodeURIComponent(a4), a4 = b4.replace(RegExp("([/#?]|%(2f|23|3f|5c))", "gi"), (a5) => encodeURIComponent(a5));
              } catch (a5) {
                throw Object.defineProperty(new w2.Xc("Failed to decode path param(s)."), "__NEXT_ERROR_CODE", { value: "E539", enumerable: false, configurable: true });
              }
              return a4;
            }).join("/");
          } catch (a4) {
          }
          return $2 = (0, x2.U)($2), { query: T3, originalQuery: L3, originalPathname: K3, params: S2, parsedUrl: I3, locale: Q3, isNextDataRequest: J3, locales: null == G3 ? void 0 : G3.locales, defaultLocale: P3, isDraftMode: false, previewData: y2, pageIsDynamic: M2, resolvedPathname: $2, isOnDemandRevalidate: W3, revalidateOnlyGenerated: X2, ...z3, serverActionsManifest: z3.serverActionsManifest, clientReferenceManifest: z3.clientReferenceManifest, nextConfig: Y3, routerServerContext: E2 };
        }
        getResponseCache(a3) {
          if (!this.responseCache) {
            let b3 = (0, r.Ny)(a3, "minimalMode") ?? false;
            this.responseCache = new s.Ay(b3);
          }
          return this.responseCache;
        }
        async handleResponse({ req: a3, nextConfig: b3, cacheKey: c2, routeKind: d2, isFallback: e2, prerenderManifest: f2, isRoutePPREnabled: g2, isOnDemandRevalidate: h2, revalidateOnlyGenerated: i2, responseGenerator: j3, waitUntil: k2 }) {
          let l2 = this.getResponseCache(a3), m2 = await l2.get(c2, j3, { routeKind: d2, isFallback: e2, isRoutePPREnabled: g2, isOnDemandRevalidate: h2, isPrefetch: "prefetch" === a3.headers.purpose, invocationID: a3.headers["x-invocation-id"], incrementalCache: await this.getIncrementalCache(a3, b3, f2), waitUntil: k2 });
          if (!m2 && c2 && !(h2 && i2)) throw Object.defineProperty(Error("invariant: cache entry required but not generated"), "__NEXT_ERROR_CODE", { value: "E62", enumerable: false, configurable: true });
          return m2;
        }
      }
      var z2 = c(8749), A = c(655);
      let B2 = ["GET", "HEAD", "OPTIONS", "POST", "PUT", "DELETE", "PATCH"];
      var C2 = c(7670), D2 = c(4752), E = c(9414), F2 = c(4570);
      c(857);
      let G2 = ["HEAD", "OPTIONS"];
      function H() {
        return new Response(null, { status: 405 });
      }
      var I2 = c(1664), J2 = c(3173);
      c(3850), c(8546);
      var K2 = c(3951), L2 = c(5638);
      let M = new Set(Object.values({ NOT_FOUND: 404, FORBIDDEN: 403, UNAUTHORIZED: 401 }));
      function N(a3) {
        if ("object" != typeof a3 || null === a3 || !("digest" in a3) || "string" != typeof a3.digest) return false;
        let [b3, c2] = a3.digest.split(";");
        return "NEXT_HTTP_ERROR_FALLBACK" === b3 && M.has(Number(c2));
      }
      var O2 = c(9633);
      function P2(a3) {
        if ("object" != typeof a3 || null === a3 || !("digest" in a3) || "string" != typeof a3.digest) return false;
        let b3 = a3.digest.split(";"), [c2, d2] = b3, e2 = b3.slice(2, -2).join(";"), f2 = Number(b3.at(-2));
        return "NEXT_REDIRECT" === c2 && ("replace" === d2 || "push" === d2) && "string" == typeof e2 && !isNaN(f2) && f2 in O2.Q;
      }
      var Q2 = c(2668);
      function R2(a3, b3) {
        let c2;
        if (!function(a4) {
          if ((0, K2.C)(a4) || P2(a4) || N(a4) || (0, L2.isDynamicServerError)(a4) || (0, Q2.AA)(a4)) return a4.digest;
        }(a3)) {
          if ("object" == typeof a3 && null !== a3 && "message" in a3 && "string" == typeof a3.message && a3.message.startsWith("This rendered a large document (>")) return void console.error(a3);
          if ("object" == typeof a3 && null !== a3 && "string" == typeof a3.message) {
            if (c2 = a3.message, "string" == typeof a3.stack) {
              let d2 = a3.stack, e2 = d2.indexOf("\n");
              if (e2 > -1) {
                let a4 = Object.defineProperty(Error(`Route ${b3} errored during the prospective render. These errors are normally ignored and may not prevent the route from prerendering but are logged here because build debugging is enabled.
          
Original Error: ${c2}`), "__NEXT_ERROR_CODE", { value: "E362", enumerable: false, configurable: true });
                a4.stack = "Error: " + a4.message + d2.slice(e2), console.error(a4);
                return;
              }
            }
          } else "string" == typeof a3 && (c2 = a3);
          if (c2) return void console.error(`Route ${b3} errored during the prospective render. These errors are normally ignored and may not prevent the route from prerendering but are logged here because build debugging is enabled. No stack was provided.
          
Original Message: ${c2}`);
          console.error(`Route ${b3} errored during the prospective render. These errors are normally ignored and may not prevent the route from prerendering but are logged here because build debugging is enabled. The thrown value is logged just following this message`), console.error(a3);
        }
      }
      var S = c(7223), T2 = c(6859), U2 = c(6225), V2 = c(2882);
      let W2 = (0, V2.YR)(function() {
        throw Error("Attempted to call AppRouterContext() from the server but AppRouterContext is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
      }, "/Users/thefirstelder/Documents/aurum_unit/frontend/node_modules/next/dist/esm/shared/lib/app-router-context.shared-runtime.js", "AppRouterContext"), X = (0, V2.YR)(function() {
        throw Error("Attempted to call LayoutRouterContext() from the server but LayoutRouterContext is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
      }, "/Users/thefirstelder/Documents/aurum_unit/frontend/node_modules/next/dist/esm/shared/lib/app-router-context.shared-runtime.js", "LayoutRouterContext"), Y2 = (0, V2.YR)(function() {
        throw Error("Attempted to call GlobalLayoutRouterContext() from the server but GlobalLayoutRouterContext is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
      }, "/Users/thefirstelder/Documents/aurum_unit/frontend/node_modules/next/dist/esm/shared/lib/app-router-context.shared-runtime.js", "GlobalLayoutRouterContext"), Z = (0, V2.YR)(function() {
        throw Error("Attempted to call TemplateContext() from the server but TemplateContext is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
      }, "/Users/thefirstelder/Documents/aurum_unit/frontend/node_modules/next/dist/esm/shared/lib/app-router-context.shared-runtime.js", "TemplateContext"), $ = (0, V2.YR)(function() {
        throw Error("Attempted to call MissingSlotContext() from the server but MissingSlotContext is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
      }, "/Users/thefirstelder/Documents/aurum_unit/frontend/node_modules/next/dist/esm/shared/lib/app-router-context.shared-runtime.js", "MissingSlotContext");
      var _2 = c(2456), aa = c(5182), ab = c(7668), ac = c(5826), ad = c(9904);
      class ae2 {
        constructor() {
          throw this.count = 0, this.earlyListeners = [], this.listeners = [], this.tickPending = false, this.taskPending = false, this.subscribedSignals = null, Object.defineProperty(new ad.z("CacheSignal cannot be used in the edge runtime, because `cacheComponents` does not support it."), "__NEXT_ERROR_CODE", { value: "E685", enumerable: false, configurable: true });
        }
        noMorePendingCaches() {
          this.tickPending || (this.tickPending = true, process.nextTick(() => {
            if (this.tickPending = false, 0 === this.count) {
              for (let a3 = 0; a3 < this.earlyListeners.length; a3++) this.earlyListeners[a3]();
              this.earlyListeners.length = 0;
            }
          })), this.taskPending || (this.taskPending = true, setTimeout(() => {
            if (this.taskPending = false, 0 === this.count) {
              for (let a3 = 0; a3 < this.listeners.length; a3++) this.listeners[a3]();
              this.listeners.length = 0;
            }
          }, 0));
        }
        inputReady() {
          return new Promise((a3) => {
            this.earlyListeners.push(a3), 0 === this.count && this.noMorePendingCaches();
          });
        }
        cacheReady() {
          return new Promise((a3) => {
            this.listeners.push(a3), 0 === this.count && this.noMorePendingCaches();
          });
        }
        beginRead() {
          if (this.count++, null !== this.subscribedSignals) for (let a3 of this.subscribedSignals) a3.beginRead();
        }
        endRead() {
          if (0 === this.count) throw Object.defineProperty(new ad.z("CacheSignal got more endRead() calls than beginRead() calls"), "__NEXT_ERROR_CODE", { value: "E678", enumerable: false, configurable: true });
          if (this.count--, 0 === this.count && this.noMorePendingCaches(), null !== this.subscribedSignals) for (let a3 of this.subscribedSignals) a3.endRead();
        }
        trackRead(a3) {
          this.beginRead();
          let b3 = this.endRead.bind(this);
          return a3.then(b3, b3), a3;
        }
        subscribeToReads(a3) {
          if (a3 === this) throw Object.defineProperty(new ad.z("A CacheSignal cannot subscribe to itself"), "__NEXT_ERROR_CODE", { value: "E679", enumerable: false, configurable: true });
          null === this.subscribedSignals && (this.subscribedSignals = /* @__PURE__ */ new Set()), this.subscribedSignals.add(a3);
          for (let b3 = 0; b3 < this.count; b3++) a3.beginRead();
          return this.unsubscribeFromReads.bind(this, a3);
        }
        unsubscribeFromReads(a3) {
          this.subscribedSignals && this.subscribedSignals.delete(a3);
        }
      }
      var af = c(2392), ag = c(9624), ah = c(7261), ai = c(1087);
      let aj = { current: null }, ak = "function" == typeof ai.cache ? ai.cache : (a3) => a3, al = console.warn;
      function am(a3) {
        return function(...b3) {
          al(a3(...b3));
        };
      }
      ak((a3) => {
        try {
          al(aj.current);
        } finally {
          aj.current = null;
        }
      });
      let an = (0, c(2058).xl)(), ao = /* @__PURE__ */ new WeakMap(), ap = { get: function(a3, b3, c2) {
        if ("then" === b3 || "catch" === b3 || "finally" === b3) {
          let d2 = ac.l.get(a3, b3, c2);
          return { [b3]: (...b4) => {
            let c3 = an.getStore();
            return c3 && c3.abortController.abort(Object.defineProperty(Error("Accessed fallback `params` during prerendering."), "__NEXT_ERROR_CODE", { value: "E691", enumerable: false, configurable: true })), new Proxy(d2.apply(a3, b4), ap);
          } }[b3];
        }
        return ac.l.get(a3, b3, c2);
      } };
      function aq(a3) {
        let b3 = ao.get(a3);
        if (b3) return b3;
        let c2 = Promise.resolve(a3);
        return ao.set(a3, c2), Object.keys(a3).forEach((b4) => {
          ag.lY.has(b4) || (c2[b4] = a3[b4]);
        }), c2;
      }
      am(function(a3, b3) {
        let c2 = a3 ? `Route "${a3}" ` : "This route ";
        return Object.defineProperty(Error(`${c2}used ${b3}. \`params\` should be awaited before using its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`), "__NEXT_ERROR_CODE", { value: "E307", enumerable: false, configurable: true });
      }), am(function(a3, b3, c2) {
        let d2 = a3 ? `Route "${a3}" ` : "This route ";
        return Object.defineProperty(Error(`${d2}used ${b3}. \`params\` should be awaited before using its properties. The following properties were not available through enumeration because they conflict with builtin property names: ${function(a4) {
          switch (a4.length) {
            case 0:
              throw Object.defineProperty(new ad.z("Expected describeListOfPropertyNames to be called with a non-empty list of strings."), "__NEXT_ERROR_CODE", { value: "E531", enumerable: false, configurable: true });
            case 1:
              return `\`${a4[0]}\``;
            case 2:
              return `\`${a4[0]}\` and \`${a4[1]}\``;
            default: {
              let b4 = "";
              for (let c3 = 0; c3 < a4.length - 1; c3++) b4 += `\`${a4[c3]}\`, `;
              return b4 + `, and \`${a4[a4.length - 1]}\``;
            }
          }
        }(c2)}. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`), "__NEXT_ERROR_CODE", { value: "E482", enumerable: false, configurable: true });
      }), c(6225).s;
      var ar = c(1212), as = c(1699);
      class at extends y {
        static #a = this.sharedModules = f;
        constructor({ userland: a3, definition: b3, distDir: c2, relativeProjectDir: d2, resolvedPagePath: e2, nextConfigOutput: f2 }) {
          if (super({ userland: a3, definition: b3, distDir: c2, relativeProjectDir: d2 }), this.workUnitAsyncStorage = T2.FP, this.workAsyncStorage = S.J, this.serverHooks = L2, this.actionAsyncStorage = U2.s, this.resolvedPagePath = e2, this.nextConfigOutput = f2, this.methods = function(a4) {
            let b4 = B2.reduce((b5, c4) => ({ ...b5, [c4]: a4[c4] ?? H }), {}), c3 = new Set(B2.filter((b5) => a4[b5]));
            for (let d3 of G2.filter((a5) => !c3.has(a5))) {
              if ("HEAD" === d3) {
                a4.GET && (b4.HEAD = a4.GET, c3.add("HEAD"));
                continue;
              }
              if ("OPTIONS" === d3) {
                let a5 = ["OPTIONS", ...c3];
                !c3.has("HEAD") && c3.has("GET") && a5.push("HEAD");
                let d4 = { Allow: a5.sort().join(", ") };
                b4.OPTIONS = () => new Response(null, { status: 204, headers: d4 }), c3.add("OPTIONS");
                continue;
              }
              throw Object.defineProperty(Error(`Invariant: should handle all automatic implementable methods, got method: ${d3}`), "__NEXT_ERROR_CODE", { value: "E211", enumerable: false, configurable: true });
            }
            return b4;
          }(a3), this.isAppRouter = true, this.hasNonStaticMethods = function(a4) {
            return !!a4.POST || !!a4.PUT || !!a4.DELETE || !!a4.PATCH || !!a4.OPTIONS;
          }(a3), this.dynamic = this.userland.dynamic, "export" === this.nextConfigOutput) if ("force-dynamic" === this.dynamic) throw Object.defineProperty(Error(`export const dynamic = "force-dynamic" on page "${b3.pathname}" cannot be used with "output: export". See more info here: https://nextjs.org/docs/advanced-features/static-html-export`), "__NEXT_ERROR_CODE", { value: "E278", enumerable: false, configurable: true });
          else if (!function(a4) {
            return "force-static" === a4.dynamic || "error" === a4.dynamic || false === a4.revalidate || void 0 !== a4.revalidate && a4.revalidate > 0 || "function" == typeof a4.generateStaticParams;
          }(this.userland) && this.userland.GET) throw Object.defineProperty(Error(`export const dynamic = "force-static"/export const revalidate not configured on route "${b3.pathname}" with "output: export". See more info here: https://nextjs.org/docs/advanced-features/static-html-export`), "__NEXT_ERROR_CODE", { value: "E301", enumerable: false, configurable: true });
          else this.dynamic = "error";
        }
        resolve(a3) {
          return B2.includes(a3) ? this.methods[a3] : () => new Response(null, { status: 400 });
        }
        async do(a3, b3, c2, e2, f2, g2, h2) {
          let i2, j3 = c2.isStaticGeneration, k2 = !!(null == (o2 = h2.renderOpts.experimental) ? void 0 : o2.cacheComponents);
          (0, D2.V5)({ workAsyncStorage: this.workAsyncStorage, workUnitAsyncStorage: this.workUnitAsyncStorage });
          let l2 = { params: h2.params ? function(a4, b4) {
            let c3 = T2.FP.getStore();
            if (c3) switch (c3.type) {
              case "prerender":
              case "prerender-client":
              case "prerender-ppr":
              case "prerender-legacy":
                return function(a5, b5, c4) {
                  switch (c4.type) {
                    case "prerender":
                    case "prerender-client": {
                      let g3 = c4.fallbackRouteParams;
                      if (g3) {
                        for (let h3 in a5) if (g3.has(h3)) {
                          var d3 = a5, e4 = b5, f3 = c4;
                          let g4 = ao.get(d3);
                          if (g4) return g4;
                          let h4 = new Proxy((0, ah.W5)(f3.renderSignal, e4.route, "`params`"), ap);
                          return ao.set(d3, h4), h4;
                        }
                      }
                      break;
                    }
                    case "prerender-ppr": {
                      let d4 = c4.fallbackRouteParams;
                      if (d4) {
                        for (let e5 in a5) if (d4.has(e5)) return function(a6, b6, c5, d5) {
                          let e6 = ao.get(a6);
                          if (e6) return e6;
                          let f4 = { ...a6 }, g3 = Promise.resolve(f4);
                          return ao.set(a6, g3), Object.keys(a6).forEach((e7) => {
                            ag.lY.has(e7) || (b6.has(e7) ? (Object.defineProperty(f4, e7, { get() {
                              let a7 = (0, ag.ke)("params", e7);
                              "prerender-ppr" === d5.type ? (0, Q2.Ui)(c5.route, a7, d5.dynamicTracking) : (0, Q2.xI)(a7, c5, d5);
                            }, enumerable: true }), Object.defineProperty(g3, e7, { get() {
                              let a7 = (0, ag.ke)("params", e7);
                              "prerender-ppr" === d5.type ? (0, Q2.Ui)(c5.route, a7, d5.dynamicTracking) : (0, Q2.xI)(a7, c5, d5);
                            }, set(a7) {
                              Object.defineProperty(g3, e7, { value: a7, writable: true, enumerable: true });
                            }, enumerable: true, configurable: true })) : g3[e7] = a6[e7]);
                          }), g3;
                        }(a5, d4, b5, c4);
                      }
                    }
                  }
                  return aq(a5);
                }(a4, b4, c3);
              case "cache":
              case "private-cache":
              case "unstable-cache":
                throw Object.defineProperty(new ad.z("createServerParamsForRoute should not be called in cache contexts."), "__NEXT_ERROR_CODE", { value: "E738", enumerable: false, configurable: true });
              case "prerender-runtime":
                var d2, e3;
                return d2 = a4, e3 = c3, (0, Q2.wi)(e3, aq(d2));
              case "request":
                return aq(a4);
            }
            (0, T2.bR)();
          }(function(a4) {
            let b4 = {};
            for (let [c3, d2] of Object.entries(a4)) void 0 !== d2 && (b4[c3] = d2);
            return b4;
          }(h2.params), c2) : void 0 }, m2 = () => {
            h2.renderOpts.pendingWaitUntil = (0, as.C)(c2).finally(() => {
              process.env.NEXT_PRIVATE_DEBUG_CACHE && console.log("pending revalidates promise finished for:", e2.url);
            });
          }, n2 = null;
          try {
            if (j3) {
              let b4 = this.userland.revalidate, e3 = false === b4 || void 0 === b4 ? ar.AR : b4;
              if (k2) {
                var o2, p2;
                let b5, h3 = new AbortController(), j4 = false, k3 = new ae2(), m3 = (0, Q2.uO)(void 0), q4 = n2 = { type: "prerender", phase: "action", rootParams: {}, fallbackRouteParams: null, implicitTags: f2, renderSignal: h3.signal, controller: h3, cacheSignal: k3, dynamicTracking: m3, allowEmptyStaticShell: false, revalidate: e3, expire: ar.AR, stale: ar.AR, tags: [...f2.tags], prerenderResumeDataCache: null, renderResumeDataCache: null, hmrRefreshHash: void 0, captureOwnerStack: void 0 };
                try {
                  b5 = this.workUnitAsyncStorage.run(q4, a3, g2, l2);
                } catch (a4) {
                  h3.signal.aborted ? j4 = true : (process.env.NEXT_DEBUG_BUILD || process.env.__NEXT_VERBOSE_LOGGING) && R2(a4, c2.route);
                }
                "object" == typeof b5 && null !== b5 && "function" == typeof b5.then && b5.then(() => {
                }, (a4) => {
                  h3.signal.aborted ? j4 = true : process.env.NEXT_DEBUG_BUILD && R2(a4, c2.route);
                });
                let r2 = (!d && (d = new ae2()), d).subscribeToReads(k3);
                if (k3.cacheReady().then(r2), await k3.cacheReady(), j4) {
                  let a4 = (0, Q2.gz)(m3);
                  if (a4) throw Object.defineProperty(new L2.DynamicServerError(`Route ${c2.route} couldn't be rendered statically because it used \`${a4}\`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error`), "__NEXT_ERROR_CODE", { value: "E558", enumerable: false, configurable: true });
                  throw console.error("Expected Next.js to keep track of reason for opting out of static rendering but one was not found. This is a bug in Next.js"), Object.defineProperty(new L2.DynamicServerError(`Route ${c2.route} couldn't be rendered statically because it used a dynamic API. See more info here: https://nextjs.org/docs/messages/dynamic-server-error`), "__NEXT_ERROR_CODE", { value: "E577", enumerable: false, configurable: true });
                }
                let s2 = new AbortController();
                m3 = (0, Q2.uO)(void 0);
                let t2 = n2 = { type: "prerender", phase: "action", rootParams: {}, fallbackRouteParams: null, implicitTags: f2, renderSignal: s2.signal, controller: s2, cacheSignal: null, dynamicTracking: m3, allowEmptyStaticShell: false, revalidate: e3, expire: ar.AR, stale: ar.AR, tags: [...f2.tags], prerenderResumeDataCache: null, renderResumeDataCache: null, hmrRefreshHash: void 0, captureOwnerStack: void 0 }, u2 = false;
                if (i2 = await new Promise((b6, d2) => {
                  (0, af.X$)(async () => {
                    try {
                      let e4 = await this.workUnitAsyncStorage.run(t2, a3, g2, l2);
                      if (u2) return;
                      if (!(e4 instanceof Response)) return void b6(e4);
                      u2 = true;
                      let f3 = false;
                      e4.arrayBuffer().then((a4) => {
                        f3 || (f3 = true, b6(new Response(a4, { headers: e4.headers, status: e4.status, statusText: e4.statusText })));
                      }, d2), (0, af.X$)(() => {
                        f3 || (f3 = true, s2.abort(), d2(aG(c2.route)));
                      });
                    } catch (a4) {
                      d2(a4);
                    }
                  }), (0, af.X$)(() => {
                    u2 || (u2 = true, s2.abort(), d2(aG(c2.route)));
                  });
                }), s2.signal.aborted) throw aG(c2.route);
                s2.abort();
              } else n2 = { type: "prerender-legacy", phase: "action", rootParams: {}, implicitTags: f2, revalidate: e3, expire: ar.AR, stale: ar.AR, tags: [...f2.tags] }, i2 = await T2.FP.run(n2, a3, g2, l2);
            } else i2 = await T2.FP.run(e2, a3, g2, l2);
          } catch (a4) {
            if (P2(a4)) {
              let c3 = P2(a4) ? a4.digest.split(";").slice(2, -2).join(";") : null;
              if (!c3) throw Object.defineProperty(Error("Invariant: Unexpected redirect url format"), "__NEXT_ERROR_CODE", { value: "E399", enumerable: false, configurable: true });
              let d2 = new Headers({ Location: c3 });
              return (0, I2.IN)(d2, e2.mutableCookies), m2(), new Response(null, { status: b3.isAction ? O2.Q.SeeOther : function(a5) {
                if (!P2(a5)) throw Object.defineProperty(Error("Not a redirect error"), "__NEXT_ERROR_CODE", { value: "E260", enumerable: false, configurable: true });
                return Number(a5.digest.split(";").at(-2));
              }(a4), headers: d2 });
            }
            if (N(a4)) return new Response(null, { status: Number(a4.digest.split(";")[1]) });
            throw a4;
          }
          if (!(i2 instanceof Response)) throw Object.defineProperty(Error(`No response is returned from route handler '${this.resolvedPagePath}'. Ensure you return a \`Response\` or a \`NextResponse\` in all branches of your handler.`), "__NEXT_ERROR_CODE", { value: "E325", enumerable: false, configurable: true });
          h2.renderOpts.fetchMetrics = c2.fetchMetrics, m2(), n2 && (h2.renderOpts.collectedTags = null == (p2 = n2.tags) ? void 0 : p2.join(","), h2.renderOpts.collectedRevalidate = n2.revalidate, h2.renderOpts.collectedExpire = n2.expire, h2.renderOpts.collectedStale = n2.stale);
          let q3 = new Headers(i2.headers);
          return (0, I2.IN)(q3, e2.mutableCookies) ? new Response(i2.body, { status: i2.status, statusText: i2.statusText, headers: q3 }) : i2;
        }
        async handle(a3, b3) {
          let c2 = this.resolve(a3.method), d2 = { page: this.definition.page, renderOpts: b3.renderOpts, buildId: b3.sharedContext.buildId, previouslyRevalidatedTags: [] };
          d2.renderOpts.fetchCache = this.userland.fetchCache;
          let e2 = { isAppRoute: true, isAction: function(a4) {
            let b4, c3;
            a4.headers instanceof Headers ? (b4 = a4.headers.get(_2.ts) ?? null, c3 = a4.headers.get("content-type")) : (b4 = a4.headers[_2.ts] ?? null, c3 = a4.headers["content-type"] ?? null);
            let d3 = "POST" === a4.method && "application/x-www-form-urlencoded" === c3, e3 = !!("POST" === a4.method && (null == c3 ? void 0 : c3.startsWith("multipart/form-data"))), f3 = void 0 !== b4 && "string" == typeof b4 && "POST" === a4.method;
            return { actionId: b4, isURLEncodedAction: d3, isMultipartAction: e3, isFetchAction: f3, isPossibleServerAction: !!(f3 || d3 || e3) };
          }(a3).isPossibleServerAction }, f2 = await (0, C2.l)(this.definition.page, a3.nextUrl, null), g2 = (0, z2.q9)(a3, a3.nextUrl, f2, void 0, b3.prerenderManifest.preview), h2 = (0, A.X)(d2), i2 = await this.actionAsyncStorage.run(e2, () => this.workUnitAsyncStorage.run(g2, () => this.workAsyncStorage.run(h2, async () => {
            if (this.hasNonStaticMethods && h2.isStaticGeneration) {
              let a4 = Object.defineProperty(new L2.DynamicServerError("Route is configured with methods that cannot be statically generated."), "__NEXT_ERROR_CODE", { value: "E582", enumerable: false, configurable: true });
              throw h2.dynamicUsageDescription = a4.message, h2.dynamicUsageStack = a4.stack, a4;
            }
            let d3 = a3;
            switch (this.dynamic) {
              case "force-dynamic":
                if (h2.forceDynamic = true, h2.isStaticGeneration) {
                  let a4 = Object.defineProperty(new L2.DynamicServerError("Route is configured with dynamic = error which cannot be statically generated."), "__NEXT_ERROR_CODE", { value: "E703", enumerable: false, configurable: true });
                  throw h2.dynamicUsageDescription = a4.message, h2.dynamicUsageStack = a4.stack, a4;
                }
                break;
              case "force-static":
                h2.forceStatic = true, d3 = new Proxy(a3, aC);
                break;
              case "error":
                h2.dynamicShouldError = true, h2.isStaticGeneration && (d3 = new Proxy(a3, aE));
                break;
              case void 0:
              case "auto":
                d3 = function(a4, b4) {
                  let c3 = { get(a5, d5, e3) {
                    switch (d5) {
                      case "search":
                      case "searchParams":
                      case "url":
                      case "href":
                      case "toJSON":
                      case "toString":
                      case "origin":
                        return aH(b4, T2.FP.getStore(), `nextUrl.${d5}`), ac.l.get(a5, d5, e3);
                      case "clone":
                        return a5[aw] || (a5[aw] = () => new Proxy(a5.clone(), c3));
                      default:
                        return ac.l.get(a5, d5, e3);
                    }
                  } }, d4 = { get(a5, e3) {
                    switch (e3) {
                      case "nextUrl":
                        return a5[au] || (a5[au] = new Proxy(a5.nextUrl, c3));
                      case "headers":
                      case "cookies":
                      case "url":
                      case "body":
                      case "blob":
                      case "json":
                      case "text":
                      case "arrayBuffer":
                      case "formData":
                        return aH(b4, T2.FP.getStore(), `request.${e3}`), ac.l.get(a5, e3, a5);
                      case "clone":
                        return a5[av] || (a5[av] = () => new Proxy(a5.clone(), d4));
                      default:
                        return ac.l.get(a5, e3, a5);
                    }
                  } };
                  return new Proxy(a4, d4);
                }(a3, h2);
                break;
              default:
                this.dynamic;
            }
            let i3 = function(a4) {
              let b4 = "/app/";
              a4.includes(b4) || (b4 = "\\app\\");
              let [, ...c3] = a4.split(b4);
              return (b4[0] + c3.join(b4)).split(".").slice(0, -1).join(".");
            }(this.resolvedPagePath), j3 = (0, E.EK)();
            return j3.setRootSpanAttribute("next.route", i3), j3.trace(F2.jM.runHandler, { spanName: `executing api route (app) ${i3}`, attributes: { "next.route": i3 } }, async () => this.do(c2, e2, h2, g2, f2, d3, b3));
          })));
          if (!(i2 instanceof Response)) return new Response(null, { status: 500 });
          if (i2.headers.has("x-middleware-rewrite")) throw Object.defineProperty(Error("NextResponse.rewrite() was used in a app route handler, this is not currently supported. Please remove the invocation to continue."), "__NEXT_ERROR_CODE", { value: "E374", enumerable: false, configurable: true });
          if ("1" === i2.headers.get("x-middleware-next")) throw Object.defineProperty(Error("NextResponse.next() was used in a app route handler, this is not supported. See here for more info: https://nextjs.org/docs/messages/next-response-next-in-app-route-handler"), "__NEXT_ERROR_CODE", { value: "E385", enumerable: false, configurable: true });
          return i2;
        }
      }
      let au = Symbol("nextUrl"), av = Symbol("clone"), aw = Symbol("clone"), ax = Symbol("searchParams"), ay = Symbol("href"), az = Symbol("toString"), aA = Symbol("headers"), aB = Symbol("cookies"), aC = { get(a3, b3, c2) {
        switch (b3) {
          case "headers":
            return a3[aA] || (a3[aA] = J2.o.seal(new Headers({})));
          case "cookies":
            return a3[aB] || (a3[aB] = I2.Ck.seal(new aa.RequestCookies(new Headers({}))));
          case "nextUrl":
            return a3[au] || (a3[au] = new Proxy(a3.nextUrl, aD));
          case "url":
            return c2.nextUrl.href;
          case "geo":
          case "ip":
            return;
          case "clone":
            return a3[av] || (a3[av] = () => new Proxy(a3.clone(), aC));
          default:
            return ac.l.get(a3, b3, c2);
        }
      } }, aD = { get(a3, b3, c2) {
        switch (b3) {
          case "search":
            return "";
          case "searchParams":
            return a3[ax] || (a3[ax] = new URLSearchParams());
          case "href":
            return a3[ay] || (a3[ay] = function(a4) {
              let b4 = new URL(a4);
              return b4.host = "localhost:3000", b4.search = "", b4.protocol = "http", b4;
            }(a3.href).href);
          case "toJSON":
          case "toString":
            return a3[az] || (a3[az] = () => c2.href);
          case "url":
            return;
          case "clone":
            return a3[aw] || (a3[aw] = () => new Proxy(a3.clone(), aD));
          default:
            return ac.l.get(a3, b3, c2);
        }
      } }, aE = { get(a3, b3, c2) {
        switch (b3) {
          case "nextUrl":
            return a3[au] || (a3[au] = new Proxy(a3.nextUrl, aF));
          case "headers":
          case "cookies":
          case "url":
          case "body":
          case "blob":
          case "json":
          case "text":
          case "arrayBuffer":
          case "formData":
            throw Object.defineProperty(new ab.f(`Route ${a3.nextUrl.pathname} with \`dynamic = "error"\` couldn't be rendered statically because it used \`request.${b3}\`.`), "__NEXT_ERROR_CODE", { value: "E611", enumerable: false, configurable: true });
          case "clone":
            return a3[av] || (a3[av] = () => new Proxy(a3.clone(), aE));
          default:
            return ac.l.get(a3, b3, c2);
        }
      } }, aF = { get(a3, b3, c2) {
        switch (b3) {
          case "search":
          case "searchParams":
          case "url":
          case "href":
          case "toJSON":
          case "toString":
          case "origin":
            throw Object.defineProperty(new ab.f(`Route ${a3.pathname} with \`dynamic = "error"\` couldn't be rendered statically because it used \`nextUrl.${b3}\`.`), "__NEXT_ERROR_CODE", { value: "E575", enumerable: false, configurable: true });
          case "clone":
            return a3[aw] || (a3[aw] = () => new Proxy(a3.clone(), aF));
          default:
            return ac.l.get(a3, b3, c2);
        }
      } };
      function aG(a3) {
        return Object.defineProperty(new L2.DynamicServerError(`Route ${a3} couldn't be rendered statically because it used IO that was not cached. See more info here: https://nextjs.org/docs/messages/cache-components`), "__NEXT_ERROR_CODE", { value: "E609", enumerable: false, configurable: true });
      }
      function aH(a3, b3, c2) {
        if (a3.dynamicShouldError) throw Object.defineProperty(new ab.f(`Route ${a3.route} with \`dynamic = "error"\` couldn't be rendered statically because it used \`${c2}\`. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering`), "__NEXT_ERROR_CODE", { value: "E553", enumerable: false, configurable: true });
        if (b3) switch (b3.type) {
          case "cache":
          case "private-cache":
            throw Object.defineProperty(Error(`Route ${a3.route} used "${c2}" inside "use cache". Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use "${c2}" outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache`), "__NEXT_ERROR_CODE", { value: "E178", enumerable: false, configurable: true });
          case "unstable-cache":
            throw Object.defineProperty(Error(`Route ${a3.route} used "${c2}" inside a function cached with "unstable_cache(...)". Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use "${c2}" outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/app/api-reference/functions/unstable_cache`), "__NEXT_ERROR_CODE", { value: "E133", enumerable: false, configurable: true });
          case "prerender":
            let d2 = Object.defineProperty(Error(`Route ${a3.route} used ${c2} without first calling \`await connection()\`. See more info here: https://nextjs.org/docs/messages/next-prerender-sync-request`), "__NEXT_ERROR_CODE", { value: "E261", enumerable: false, configurable: true });
            return (0, Q2.t3)(a3.route, c2, d2, b3);
          case "prerender-client":
            throw Object.defineProperty(new ad.z("A client prerender store should not be used for a route handler."), "__NEXT_ERROR_CODE", { value: "E720", enumerable: false, configurable: true });
          case "prerender-runtime":
            throw Object.defineProperty(new ad.z("A runtime prerender store should not be used for a route handler."), "__NEXT_ERROR_CODE", { value: "E767", enumerable: false, configurable: true });
          case "prerender-ppr":
            return (0, Q2.Ui)(a3.route, c2, b3.dynamicTracking);
          case "prerender-legacy":
            b3.revalidate = 0;
            let e2 = Object.defineProperty(new L2.DynamicServerError(`Route ${a3.route} couldn't be rendered statically because it used \`${c2}\`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error`), "__NEXT_ERROR_CODE", { value: "E558", enumerable: false, configurable: true });
            throw a3.dynamicUsageDescription = c2, a3.dynamicUsageStack = e2.stack, e2;
        }
      }
    }, 6216: (a2, b2, c) => {
      "use strict";
      async function d() {
        return "_ENTRIES" in globalThis && _ENTRIES.middleware_instrumentation && await _ENTRIES.middleware_instrumentation;
      }
      c.d(b2, { getEdgeInstrumentationModule: () => d, p: () => h });
      let e = null;
      async function f() {
        if ("phase-production-build" === process.env.NEXT_PHASE) return;
        e || (e = d());
        let a3 = await e;
        if (null == a3 ? void 0 : a3.register) try {
          await a3.register();
        } catch (a4) {
          throw a4.message = `An error occurred while loading instrumentation hook: ${a4.message}`, a4;
        }
      }
      let g = null;
      function h() {
        return g || (g = f()), g;
      }
      function i(a3) {
        return `The edge runtime does not support Node.js '${a3}' module.
Learn More: https://nextjs.org/docs/messages/node-module-in-edge-runtime`;
      }
      process !== c.g.process && (process.env = c.g.process.env, c.g.process = process);
      try {
        Object.defineProperty(globalThis, "__import_unsupported", { value: function(a3) {
          let b3 = new Proxy(function() {
          }, { get(b4, c2) {
            if ("then" === c2) return {};
            throw Object.defineProperty(Error(i(a3)), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
          }, construct() {
            throw Object.defineProperty(Error(i(a3)), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
          }, apply(c2, d2, e2) {
            if ("function" == typeof e2[0]) return e2[0](b3);
            throw Object.defineProperty(Error(i(a3)), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
          } });
          return new Proxy({}, { get: () => b3 });
        }, enumerable: false, configurable: false });
      } catch {
      }
      h();
    }, 6225: (a2, b2, c) => {
      "use strict";
      c.d(b2, { s: () => d });
      let d = (0, c(2058).xl)();
    }, 6859: (a2, b2, c) => {
      "use strict";
      c.d(b2, { Br: () => i, fm: () => g, E0: () => h, bR: () => f, FP: () => d });
      let d = (0, c(2058).xl)();
      class e extends Error {
        constructor(a3, b3) {
          super("Invariant: " + (a3.endsWith(".") ? a3 : a3 + ".") + " This is a bug in Next.js.", b3), this.name = "InvariantError";
        }
      }
      function f() {
        throw Object.defineProperty(new e("Expected workUnitAsyncStorage to have a store."), "__NEXT_ERROR_CODE", { value: "E696", enumerable: false, configurable: true });
      }
      function g(a3) {
        switch (a3.type) {
          case "prerender":
          case "prerender-runtime":
          case "prerender-ppr":
          case "prerender-client":
            return a3.prerenderResumeDataCache;
          case "prerender-legacy":
          case "request":
          case "cache":
          case "private-cache":
          case "unstable-cache":
            return null;
          default:
            return a3;
        }
      }
      function h(a3) {
        switch (a3.type) {
          case "request":
            return a3.renderResumeDataCache;
          case "prerender":
          case "prerender-runtime":
          case "prerender-client":
            if (a3.renderResumeDataCache) return a3.renderResumeDataCache;
          case "prerender-ppr":
            return a3.prerenderResumeDataCache;
          case "cache":
          case "private-cache":
          case "unstable-cache":
          case "prerender-legacy":
            return null;
          default:
            return a3;
        }
      }
      function i(a3) {
        switch (a3.type) {
          case "prerender":
          case "prerender-client":
          case "prerender-runtime":
            return a3.cacheSignal;
          case "prerender-ppr":
          case "prerender-legacy":
          case "request":
          case "cache":
          case "private-cache":
          case "unstable-cache":
            return null;
          default:
            return a3;
        }
      }
    }, 7037: (a2, b2, c) => {
      "use strict";
      c.d(b2, { lY: () => u });
      var d = c(7736), e = c(4890);
      let f = BigInt(0), g = BigInt(1), h = BigInt(2), i = BigInt(7), j2 = BigInt(256), k = BigInt(113), l = [], m = [], n = [];
      for (let a3 = 0, b3 = g, c2 = 1, d2 = 0; a3 < 24; a3++) {
        [c2, d2] = [d2, (2 * c2 + 3 * d2) % 5], l.push(2 * (5 * d2 + c2)), m.push((a3 + 1) * (a3 + 2) / 2 % 64);
        let e2 = f;
        for (let a4 = 0; a4 < 7; a4++) (b3 = (b3 << g ^ (b3 >> i) * k) % j2) & h && (e2 ^= g << (g << BigInt(a4)) - g);
        n.push(e2);
      }
      let o = (0, d.lD)(n, true), p = o[0], q2 = o[1], r = (a3, b3, c2) => c2 > 32 ? (0, d.WM)(a3, b3, c2) : (0, d.P5)(a3, b3, c2), s = (a3, b3, c2) => c2 > 32 ? (0, d.im)(a3, b3, c2) : (0, d.B4)(a3, b3, c2);
      class t extends e.Vw {
        constructor(a3, b3, c2, d2 = false, f2 = 24) {
          if (super(), this.pos = 0, this.posOut = 0, this.finished = false, this.destroyed = false, this.enableXOF = false, this.blockLen = a3, this.suffix = b3, this.outputLen = c2, this.enableXOF = d2, this.rounds = f2, (0, e.Fe)(c2), !(0 < a3 && a3 < 200)) throw Error("only keccak-f1600 function is supported");
          this.state = new Uint8Array(200), this.state32 = (0, e.DH)(this.state);
        }
        clone() {
          return this._cloneInto();
        }
        keccak() {
          (0, e.fd)(this.state32), function(a3, b3 = 24) {
            let c2 = new Uint32Array(10);
            for (let d2 = 24 - b3; d2 < 24; d2++) {
              for (let b5 = 0; b5 < 10; b5++) c2[b5] = a3[b5] ^ a3[b5 + 10] ^ a3[b5 + 20] ^ a3[b5 + 30] ^ a3[b5 + 40];
              for (let b5 = 0; b5 < 10; b5 += 2) {
                let d3 = (b5 + 8) % 10, e3 = (b5 + 2) % 10, f2 = c2[e3], g2 = c2[e3 + 1], h2 = r(f2, g2, 1) ^ c2[d3], i2 = s(f2, g2, 1) ^ c2[d3 + 1];
                for (let c3 = 0; c3 < 50; c3 += 10) a3[b5 + c3] ^= h2, a3[b5 + c3 + 1] ^= i2;
              }
              let b4 = a3[2], e2 = a3[3];
              for (let c3 = 0; c3 < 24; c3++) {
                let d3 = m[c3], f2 = r(b4, e2, d3), g2 = s(b4, e2, d3), h2 = l[c3];
                b4 = a3[h2], e2 = a3[h2 + 1], a3[h2] = f2, a3[h2 + 1] = g2;
              }
              for (let b5 = 0; b5 < 50; b5 += 10) {
                for (let d3 = 0; d3 < 10; d3++) c2[d3] = a3[b5 + d3];
                for (let d3 = 0; d3 < 10; d3++) a3[b5 + d3] ^= ~c2[(d3 + 2) % 10] & c2[(d3 + 4) % 10];
              }
              a3[0] ^= p[d2], a3[1] ^= q2[d2];
            }
            (0, e.uH)(c2);
          }(this.state32, this.rounds), (0, e.fd)(this.state32), this.posOut = 0, this.pos = 0;
        }
        update(a3) {
          (0, e.CC)(this), a3 = (0, e.ZJ)(a3), (0, e.DO)(a3);
          let { blockLen: b3, state: c2 } = this, d2 = a3.length;
          for (let e2 = 0; e2 < d2; ) {
            let f2 = Math.min(b3 - this.pos, d2 - e2);
            for (let b4 = 0; b4 < f2; b4++) c2[this.pos++] ^= a3[e2++];
            this.pos === b3 && this.keccak();
          }
          return this;
        }
        finish() {
          if (this.finished) return;
          this.finished = true;
          let { state: a3, suffix: b3, pos: c2, blockLen: d2 } = this;
          a3[c2] ^= b3, (128 & b3) != 0 && c2 === d2 - 1 && this.keccak(), a3[d2 - 1] ^= 128, this.keccak();
        }
        writeInto(a3) {
          (0, e.CC)(this, false), (0, e.DO)(a3), this.finish();
          let b3 = this.state, { blockLen: c2 } = this;
          for (let d2 = 0, e2 = a3.length; d2 < e2; ) {
            this.posOut >= c2 && this.keccak();
            let f2 = Math.min(c2 - this.posOut, e2 - d2);
            a3.set(b3.subarray(this.posOut, this.posOut + f2), d2), this.posOut += f2, d2 += f2;
          }
          return a3;
        }
        xofInto(a3) {
          if (!this.enableXOF) throw Error("XOF is not possible for this instance");
          return this.writeInto(a3);
        }
        xof(a3) {
          return (0, e.Fe)(a3), this.xofInto(new Uint8Array(a3));
        }
        digestInto(a3) {
          if ((0, e.Ht)(a3, this), this.finished) throw Error("digest() was already called");
          return this.writeInto(a3), this.destroy(), a3;
        }
        digest() {
          return this.digestInto(new Uint8Array(this.outputLen));
        }
        destroy() {
          this.destroyed = true, (0, e.uH)(this.state);
        }
        _cloneInto(a3) {
          let { blockLen: b3, suffix: c2, outputLen: d2, rounds: e2, enableXOF: f2 } = this;
          return a3 || (a3 = new t(b3, c2, d2, f2, e2)), a3.state32.set(this.state32), a3.pos = this.pos, a3.posOut = this.posOut, a3.finished = this.finished, a3.rounds = e2, a3.suffix = c2, a3.outputLen = d2, a3.enableXOF = f2, a3.destroyed = this.destroyed, a3;
        }
      }
      let u = (() => (0, e.qj)(() => new t(136, 1, 32)))();
    }, 7116: (a2, b2, c) => {
      "use strict";
      c.d(b2, { H2: () => g, Ty: () => e, u: () => h, xO: () => f });
      var d = c(1766);
      class e extends d.C {
        constructor({ max: a3, min: b3, signed: c2, size: d2, value: e2 }) {
          super(`Number "${e2}" is not in safe ${d2 ? `${8 * d2}-bit ${c2 ? "signed" : "unsigned"} ` : ""}integer range ${a3 ? `(${b3} to ${a3})` : `(above ${b3})`}`, { name: "IntegerOutOfRangeError" });
        }
      }
      class f extends d.C {
        constructor(a3) {
          super(`Bytes value "${a3}" is not a valid boolean. The bytes array must contain a single byte of either a 0 or 1 value.`, { name: "InvalidBytesBooleanError" });
        }
      }
      class g extends d.C {
        constructor(a3) {
          super(`Hex value "${a3}" is not a valid boolean. The hex value must be "0x0" (false) or "0x1" (true).`, { name: "InvalidHexBooleanError" });
        }
      }
      d.C;
      class h extends d.C {
        constructor({ givenSize: a3, maxSize: b3 }) {
          super(`Size cannot exceed ${b3} bytes. Given size: ${a3} bytes.`, { name: "SizeOverflowError" });
        }
      }
    }, 7205: (a2, b2, c) => {
      "use strict";
      function d(a3, b3) {
        let c2;
        if ((null == b3 ? void 0 : b3.host) && !Array.isArray(b3.host)) c2 = b3.host.toString().split(":", 1)[0];
        else {
          if (!a3.hostname) return;
          c2 = a3.hostname;
        }
        return c2.toLowerCase();
      }
      c.d(b2, { E: () => d });
    }, 7223: (a2, b2, c) => {
      "use strict";
      c.d(b2, { J: () => d });
      let d = (0, c(2058).xl)();
    }, 7261: (a2, b2, c) => {
      "use strict";
      c.d(b2, { W5: () => f });
      class d extends Error {
        constructor(a3, b3) {
          super(`During prerendering, ${b3} rejects when the prerender is complete. Typically these errors are handled by React but if you move ${b3} to a different context by using \`setTimeout\`, \`after\`, or similar functions you may observe this error and you should handle it in that context. This occurred at route "${a3}".`), this.route = a3, this.expression = b3, this.digest = "HANGING_PROMISE_REJECTION";
        }
      }
      let e = /* @__PURE__ */ new WeakMap();
      function f(a3, b3, c2) {
        if (a3.aborted) return Promise.reject(new d(b3, c2));
        {
          let f2 = new Promise((f3, g2) => {
            let h = g2.bind(null, new d(b3, c2)), i = e.get(a3);
            if (i) i.push(h);
            else {
              let b4 = [h];
              e.set(a3, b4), a3.addEventListener("abort", () => {
                for (let a4 = 0; a4 < b4.length; a4++) b4[a4]();
              }, { once: true });
            }
          });
          return f2.catch(g), f2;
        }
      }
      function g() {
      }
    }, 7316: (a2, b2, c) => {
      "use strict";
      function d(a3) {
        return a3.replace(/\/$/, "") || "/";
      }
      c.d(b2, { U: () => d });
    }, 7329: (a2, b2, c) => {
      "use strict";
      function d(a3) {
        let b3, c2 = { then: (d2, e) => (b3 || (b3 = a3()), b3.then((a4) => {
          c2.value = a4;
        }).catch(() => {
        }), b3.then(d2, e)) };
        return c2;
      }
      c.d(b2, { a: () => d });
    }, 7382: (a2, b2, c) => {
      "use strict";
      a2.exports = c(9802);
    }, 7426: (a2, b2, c) => {
      "use strict";
      function d(a3) {
        return "(" === a3[0] && a3.endsWith(")");
      }
      c.d(b2, { OG: () => e, V: () => d });
      let e = "__PAGE__";
    }, 7474: (a2, b2, c) => {
      "use strict";
      c.d(b2, { b: () => k, o: () => j2 });
      var d = c(8833), e = c(8657), f = c(9795), g = c(2226), h = c(9320);
      let i = new g.A(8192);
      function j2(a3, b3) {
        if (i.has(`${a3}.${b3}`)) return i.get(`${a3}.${b3}`);
        let c2 = b3 ? `${b3}${a3.toLowerCase()}` : a3.substring(2).toLowerCase(), d2 = (0, f.S)((0, e.Af)(c2), "bytes"), g2 = (b3 ? c2.substring(`${b3}0x`.length) : c2).split("");
        for (let a4 = 0; a4 < 40; a4 += 2) d2[a4 >> 1] >> 4 >= 8 && g2[a4] && (g2[a4] = g2[a4].toUpperCase()), (15 & d2[a4 >> 1]) >= 8 && g2[a4 + 1] && (g2[a4 + 1] = g2[a4 + 1].toUpperCase());
        let h2 = `0x${g2.join("")}`;
        return i.set(`${a3}.${b3}`, h2), h2;
      }
      function k(a3, b3) {
        if (!(0, h.P)(a3, { strict: false })) throw new d.M({ address: a3 });
        return j2(a3, b3);
      }
    }, 7478: (a2, b2, c) => {
      "use strict";
      c.d(b2, { Rp: () => d.R }), c(4291);
      var d = c(3207);
      c(86), "undefined" == typeof URLPattern || URLPattern, c(7223), c(6859), c(2668), c(7668), c(7261), c(5209), c(9904), c(9624), c(6225), c(857), /* @__PURE__ */ new WeakMap();
    }, 7502: (a2, b2, c) => {
      "use strict";
      c.d(b2, { Xc: () => d }), "undefined" != typeof performance && ["mark", "measure", "getEntriesByName"].every((a3) => "function" == typeof performance[a3]);
      class d extends Error {
      }
    }, 7504: (a2, b2, c) => {
      "use strict";
      c.d(b2, { y: () => e });
      var d = c(4946);
      function e(a3, b3) {
        if (!(0, d.m)(a3, b3)) return a3;
        let c2 = a3.slice(b3.length);
        return c2.startsWith("/") ? c2 : "/" + c2;
      }
    }, 7521: (a2, b2, c) => {
      "use strict";
      Object.defineProperty(b2, "__esModule", { value: true }), !function(a3, b3) {
        for (var c2 in b3) Object.defineProperty(a3, c2, { enumerable: true, get: b3[c2] });
      }(b2, { interceptTestApis: function() {
        return f;
      }, wrapRequestHandler: function() {
        return g;
      } });
      let d = c(1417), e = c(7622);
      function f() {
        return (0, e.interceptFetch)(c.g.fetch);
      }
      function g(a3) {
        return (b3, c2) => (0, d.withRequest)(b3, e.reader, () => a3(b3, c2));
      }
    }, 7538: (a2, b2, c) => {
      "use strict";
      c.d(b2, { Q: () => e });
      var d = c(2456);
      function e(a3) {
        var b3, c2;
        return (null == (c2 = a3.has) || null == (b3 = c2[0]) ? void 0 : b3.key) === d.kO;
      }
      c(9636);
    }, 7581: (a2, b2, c) => {
      "use strict";
      c.d(b2, { g: () => f });
      var d = c(7502), e = c(9636);
      function f(a3) {
        let { re: b3, groups: c2 } = a3;
        return (0, e.nH)((a4) => {
          let e2 = b3.exec(a4);
          if (!e2) return false;
          let f2 = (a5) => {
            try {
              return decodeURIComponent(a5);
            } catch (a6) {
              throw Object.defineProperty(new d.Xc("failed to decode param"), "__NEXT_ERROR_CODE", { value: "E528", enumerable: false, configurable: true });
            }
          }, g = {};
          for (let [a5, b4] of Object.entries(c2)) {
            let c3 = e2[b4.pos];
            void 0 !== c3 && (b4.repeat ? g[a5] = c3.split("/").map((a6) => f2(a6)) : g[a5] = f2(c3));
          }
          return g;
        });
      }
    }, 7622: (a2, b2, c) => {
      "use strict";
      var d = c(5356).Buffer;
      Object.defineProperty(b2, "__esModule", { value: true }), !function(a3, b3) {
        for (var c2 in b3) Object.defineProperty(a3, c2, { enumerable: true, get: b3[c2] });
      }(b2, { handleFetch: function() {
        return h;
      }, interceptFetch: function() {
        return i;
      }, reader: function() {
        return f;
      } });
      let e = c(1417), f = { url: (a3) => a3.url, header: (a3, b3) => a3.headers.get(b3) };
      async function g(a3, b3) {
        let { url: c2, method: e2, headers: f2, body: g2, cache: h2, credentials: i2, integrity: j2, mode: k, redirect: l, referrer: m, referrerPolicy: n } = b3;
        return { testData: a3, api: "fetch", request: { url: c2, method: e2, headers: [...Array.from(f2), ["next-test-stack", function() {
          let a4 = (Error().stack ?? "").split("\n");
          for (let b4 = 1; b4 < a4.length; b4++) if (a4[b4].length > 0) {
            a4 = a4.slice(b4);
            break;
          }
          return (a4 = (a4 = (a4 = a4.filter((a5) => !a5.includes("/next/dist/"))).slice(0, 5)).map((a5) => a5.replace("webpack-internal:///(rsc)/", "").trim())).join("    ");
        }()]], body: g2 ? d.from(await b3.arrayBuffer()).toString("base64") : null, cache: h2, credentials: i2, integrity: j2, mode: k, redirect: l, referrer: m, referrerPolicy: n } };
      }
      async function h(a3, b3) {
        let c2 = (0, e.getTestReqInfo)(b3, f);
        if (!c2) return a3(b3);
        let { testData: h2, proxyPort: i2 } = c2, j2 = await g(h2, b3), k = await a3(`http://localhost:${i2}`, { method: "POST", body: JSON.stringify(j2), next: { internal: true } });
        if (!k.ok) throw Object.defineProperty(Error(`Proxy request failed: ${k.status}`), "__NEXT_ERROR_CODE", { value: "E146", enumerable: false, configurable: true });
        let l = await k.json(), { api: m } = l;
        switch (m) {
          case "continue":
            return a3(b3);
          case "abort":
          case "unhandled":
            throw Object.defineProperty(Error(`Proxy request aborted [${b3.method} ${b3.url}]`), "__NEXT_ERROR_CODE", { value: "E145", enumerable: false, configurable: true });
          case "fetch":
            let { status: n, headers: o, body: p } = l.response;
            return new Response(p ? d.from(p, "base64") : null, { status: n, headers: new Headers(o) });
          default:
            return m;
        }
      }
      function i(a3) {
        return c.g.fetch = function(b3, c2) {
          var d2;
          return (null == c2 || null == (d2 = c2.next) ? void 0 : d2.internal) ? a3(b3, c2) : h(a3, new Request(b3, c2));
        }, () => {
          c.g.fetch = a3;
        };
      }
    }, 7668: (a2, b2, c) => {
      "use strict";
      c.d(b2, { f: () => d });
      class d extends Error {
        constructor(...a3) {
          super(...a3), this.code = "NEXT_STATIC_GEN_BAILOUT";
        }
      }
    }, 7670: (a2, b2, c) => {
      "use strict";
      c.d(b2, { l: () => g });
      var d = c(1212), e = c(2398), f = c(7329);
      async function g(a3, b3, c2) {
        let g2 = [], h = c2 && c2.size > 0;
        for (let b4 of ((a4) => {
          let b5 = ["/layout"];
          if (a4.startsWith("/")) {
            let c3 = a4.split("/");
            for (let a5 = 1; a5 < c3.length + 1; a5++) {
              let d2 = c3.slice(0, a5).join("/");
              d2 && (d2.endsWith("/page") || d2.endsWith("/route") || (d2 = `${d2}${!d2.endsWith("/") ? "/" : ""}layout`), b5.push(d2));
            }
          }
          return b5;
        })(a3)) b4 = `${d.gW}${b4}`, g2.push(b4);
        if (b3.pathname && !h) {
          let a4 = `${d.gW}${b3.pathname}`;
          g2.push(a4);
        }
        return { tags: g2, expirationsByCacheKind: function(a4) {
          let b4 = /* @__PURE__ */ new Map(), c3 = (0, e.fs)();
          if (c3) for (let [d2, e2] of c3) "getExpiration" in e2 && b4.set(d2, (0, f.a)(async () => e2.getExpiration(...a4)));
          return b4;
        }(g2) };
      }
    }, 7707: (a2, b2, c) => {
      "use strict";
      function d(a3) {
        return null !== a3 && "object" == typeof a3 && "then" in a3 && "function" == typeof a3.then;
      }
      c.d(b2, { Q: () => d });
    }, 7736: (a2, b2, c) => {
      "use strict";
      c.d(b2, { B4: () => n, CQ: () => u, CW: () => t, Ei: () => l, F8: () => v2, P5: () => m, TH: () => w2, Vl: () => r, Vr: () => s, WM: () => o, WQ: () => q2, im: () => p, jm: () => h, lD: () => f, qh: () => k, rE: () => i, ry: () => j2, xn: () => g });
      let d = BigInt(4294967296 - 1), e = BigInt(32);
      function f(a3, b3 = false) {
        let c2 = a3.length, g2 = new Uint32Array(c2), h2 = new Uint32Array(c2);
        for (let f2 = 0; f2 < c2; f2++) {
          let { h: c3, l: i2 } = function(a4, b4 = false) {
            return b4 ? { h: Number(a4 & d), l: Number(a4 >> e & d) } : { h: 0 | Number(a4 >> e & d), l: 0 | Number(a4 & d) };
          }(a3[f2], b3);
          [g2[f2], h2[f2]] = [c3, i2];
        }
        return [g2, h2];
      }
      let g = (a3, b3, c2) => a3 >>> c2, h = (a3, b3, c2) => a3 << 32 - c2 | b3 >>> c2, i = (a3, b3, c2) => a3 >>> c2 | b3 << 32 - c2, j2 = (a3, b3, c2) => a3 << 32 - c2 | b3 >>> c2, k = (a3, b3, c2) => a3 << 64 - c2 | b3 >>> c2 - 32, l = (a3, b3, c2) => a3 >>> c2 - 32 | b3 << 64 - c2, m = (a3, b3, c2) => a3 << c2 | b3 >>> 32 - c2, n = (a3, b3, c2) => b3 << c2 | a3 >>> 32 - c2, o = (a3, b3, c2) => b3 << c2 - 32 | a3 >>> 64 - c2, p = (a3, b3, c2) => a3 << c2 - 32 | b3 >>> 64 - c2;
      function q2(a3, b3, c2, d2) {
        let e2 = (b3 >>> 0) + (d2 >>> 0);
        return { h: a3 + c2 + (e2 / 4294967296 | 0) | 0, l: 0 | e2 };
      }
      let r = (a3, b3, c2) => (a3 >>> 0) + (b3 >>> 0) + (c2 >>> 0), s = (a3, b3, c2, d2) => b3 + c2 + d2 + (a3 / 4294967296 | 0) | 0, t = (a3, b3, c2, d2) => (a3 >>> 0) + (b3 >>> 0) + (c2 >>> 0) + (d2 >>> 0), u = (a3, b3, c2, d2, e2) => b3 + c2 + d2 + e2 + (a3 / 4294967296 | 0) | 0, v2 = (a3, b3, c2, d2, e2) => (a3 >>> 0) + (b3 >>> 0) + (c2 >>> 0) + (d2 >>> 0) + (e2 >>> 0), w2 = (a3, b3, c2, d2, e2, f2) => b3 + c2 + d2 + e2 + f2 + (a3 / 4294967296 | 0) | 0;
    }, 8327: (a2, b2, c) => {
      "use strict";
      async function d(a3, b3, c2, d2) {
      }
      c.d(b2, { I: () => d }), c(8546), c(9565);
    }, 8360: (a2, b2, c) => {
      "use strict";
      c.d(b2, { l5: () => F2, VQ: () => E });
      var d = c(460), e = c(2569), f = c(4211), g = c(7581), h = c(1640), i = c(5002);
      c(7502);
      var j2 = c(2890), k = c(2605), l = c(9636);
      function m(a3) {
        return a3.replace(/__ESC_COLON_/gi, ":");
      }
      function n(a3, b3) {
        if (!a3.includes(":")) return a3;
        for (let c2 of Object.keys(b3)) a3.includes(":" + c2) && (a3 = a3.replace(RegExp(":" + c2 + "\\*", "g"), ":" + c2 + "--ESCAPED_PARAM_ASTERISKS").replace(RegExp(":" + c2 + "\\?", "g"), ":" + c2 + "--ESCAPED_PARAM_QUESTION").replace(RegExp(":" + c2 + "\\+", "g"), ":" + c2 + "--ESCAPED_PARAM_PLUS").replace(RegExp(":" + c2 + "(?!\\w)", "g"), "--ESCAPED_PARAM_COLON" + c2));
        return a3 = a3.replace(/(:|\*|\?|\+|\(|\)|\{|\})/g, "\\$1").replace(/--ESCAPED_PARAM_PLUS/g, "+").replace(/--ESCAPED_PARAM_COLON/g, ":").replace(/--ESCAPED_PARAM_QUESTION/g, "?").replace(/--ESCAPED_PARAM_ASTERISKS/g, "*"), (0, l.jT)("/" + a3, { validate: false })(b3).slice(1);
      }
      var o = c(7316), p = c(4153), q2 = c(1212), r = c(9565);
      function s(a3) {
        try {
          return decodeURIComponent(a3);
        } catch {
          return a3;
        }
      }
      var t = c(1668);
      let u = /https?|ftp|gopher|file/;
      var v2 = c(3373), w2 = c.n(v2);
      let x2 = w2().enums(["c", "ci", "oc", "d", "di"]), y = w2().union([w2().string(), w2().tuple([w2().string(), w2().string(), x2])]), z2 = w2().tuple([y, w2().record(w2().string(), w2().lazy(() => z2)), w2().optional(w2().nullable(w2().string())), w2().optional(w2().nullable(w2().union([w2().literal("refetch"), w2().literal("refresh"), w2().literal("inside-shared-layout"), w2().literal("metadata-only")]))), w2().optional(w2().boolean())]);
      var A = c(7538), B2 = c(2456), C2 = c(7426);
      function D2(a3, b3) {
        for (let c2 in delete a3.nextInternalLocale, a3) {
          let d2 = c2 !== q2.AA && c2.startsWith(q2.AA), e2 = c2 !== q2.h && c2.startsWith(q2.h);
          (d2 || e2 || b3.includes(c2)) && delete a3[c2];
        }
      }
      function E({ page: a3, i18n: b3, basePath: c2, rewrites: q3, pageIsDynamic: w3, trailingSlash: x3, caseSensitive: y2 }) {
        let E2, F3, G2;
        return w3 && (E2 = (0, f._s)(a3, { prefixRouteKeys: false }), G2 = (F3 = (0, g.g)(E2))(a3)), { handleRewrites: function(f2, g2) {
          let p2 = {}, r2 = g2.pathname, s2 = (o2) => {
            let q4 = function(a4, b4) {
              let c3 = [], d2 = (0, e.pathToRegexp)(a4, c3, { delimiter: "/", sensitive: "boolean" == typeof (null == b4 ? void 0 : b4.sensitive) && b4.sensitive, strict: null == b4 ? void 0 : b4.strict }), f3 = (0, e.regexpToFunction)((null == b4 ? void 0 : b4.regexModifier) ? new RegExp(b4.regexModifier(d2.source), d2.flags) : d2, c3);
              return (a5, d3) => {
                if ("string" != typeof a5) return false;
                let e2 = f3(a5);
                if (!e2) return false;
                if (null == b4 ? void 0 : b4.removeUnnamedParams) for (let a6 of c3) "number" == typeof a6.name && delete e2.params[a6.name];
                return { ...d3, ...e2.params };
              };
            }(o2.source + (x3 ? "(/)?" : ""), { removeUnnamedParams: true, strict: true, sensitive: !!y2 });
            if (!g2.pathname) return false;
            let s3 = q4(g2.pathname);
            if ((o2.has || o2.missing) && s3) {
              let a4 = function(a5, b4, c3, d2) {
                void 0 === c3 && (c3 = []), void 0 === d2 && (d2 = []);
                let e2 = {}, f3 = (c4) => {
                  let d3, f4 = c4.key;
                  switch (c4.type) {
                    case "header":
                      f4 = f4.toLowerCase(), d3 = a5.headers[f4];
                      break;
                    case "cookie":
                      d3 = "cookies" in a5 ? a5.cookies[c4.key] : (0, k.i)(a5.headers)()[c4.key];
                      break;
                    case "query":
                      d3 = b4[f4];
                      break;
                    case "host": {
                      let { host: b5 } = (null == a5 ? void 0 : a5.headers) || {};
                      d3 = null == b5 ? void 0 : b5.split(":", 1)[0].toLowerCase();
                    }
                  }
                  if (!c4.value && d3) return e2[function(a6) {
                    let b5 = "";
                    for (let c5 = 0; c5 < a6.length; c5++) {
                      let d4 = a6.charCodeAt(c5);
                      (d4 > 64 && d4 < 91 || d4 > 96 && d4 < 123) && (b5 += a6[c5]);
                    }
                    return b5;
                  }(f4)] = d3, true;
                  if (d3) {
                    let a6 = RegExp("^" + c4.value + "$"), b5 = Array.isArray(d3) ? d3.slice(-1)[0].match(a6) : d3.match(a6);
                    if (b5) return Array.isArray(b5) && (b5.groups ? Object.keys(b5.groups).forEach((a7) => {
                      e2[a7] = b5.groups[a7];
                    }) : "host" === c4.type && b5[0] && (e2.host = b5[0])), true;
                  }
                  return false;
                };
                return !(!c3.every((a6) => f3(a6)) || d2.some((a6) => f3(a6))) && e2;
              }(f2, g2.query, o2.has, o2.missing);
              a4 ? Object.assign(s3, a4) : s3 = false;
            }
            if (s3) {
              try {
                if ((0, A.Q)(o2)) {
                  let a4 = f2.headers[B2.B];
                  a4 && (s3 = { ...function a5(b4, c3) {
                    for (let d2 of (void 0 === c3 && (c3 = {}), Object.values(b4[1]))) {
                      let b5 = d2[0], e3 = Array.isArray(b5), f3 = e3 ? b5[1] : b5;
                      !f3 || f3.startsWith(C2.OG) || (e3 && ("c" === b5[2] || "oc" === b5[2]) ? c3[b5[0]] = b5[1].split("/") : e3 && (c3[b5[0]] = b5[1]), c3 = a5(d2, c3));
                    }
                    return c3;
                  }(function(a5) {
                    if (void 0 !== a5) {
                      if (Array.isArray(a5)) throw Object.defineProperty(Error("Multiple router state headers were sent. This is not allowed."), "__NEXT_ERROR_CODE", { value: "E418", enumerable: false, configurable: true });
                      if (a5.length > 4e4) throw Object.defineProperty(Error("The router state header was too large."), "__NEXT_ERROR_CODE", { value: "E142", enumerable: false, configurable: true });
                      try {
                        let b4 = JSON.parse(decodeURIComponent(a5));
                        return (0, v2.assert)(b4, z2), b4;
                      } catch {
                        throw Object.defineProperty(Error("The router state header was sent but could not be parsed."), "__NEXT_ERROR_CODE", { value: "E10", enumerable: false, configurable: true });
                      }
                    }
                  }(a4)), ...s3 });
                }
              } catch (a4) {
              }
              let { parsedDestination: e2, destQuery: k2 } = function(a4) {
                let b4, c3, d2 = function(a5) {
                  let b5 = a5.destination;
                  for (let c5 of Object.keys({ ...a5.params, ...a5.query })) c5 && (b5 = b5.replace(RegExp(":" + (0, h.q)(c5), "g"), "__ESC_COLON_" + c5));
                  let c4 = function(a6) {
                    if (a6.startsWith("/")) return function(a7, b7, c5) {
                      void 0 === c5 && (c5 = true);
                      let d4 = new URL("http://n"), e5 = a7.startsWith(".") ? new URL("http://n") : d4, { pathname: f5, searchParams: g5, search: h2, hash: j4, href: k4, origin: l2 } = new URL(a7, e5);
                      if (l2 !== d4.origin) throw Object.defineProperty(Error("invariant: invalid relative URL, router received " + a7), "__NEXT_ERROR_CODE", { value: "E159", enumerable: false, configurable: true });
                      return { pathname: f5, query: c5 ? (0, i.v1)(g5) : void 0, search: h2, hash: j4, href: k4.slice(l2.length), slashes: void 0 };
                    }(a6);
                    let b6 = new URL(a6);
                    return { hash: b6.hash, hostname: b6.hostname, href: b6.href, pathname: b6.pathname, port: b6.port, protocol: b6.protocol, query: (0, i.v1)(b6.searchParams), search: b6.search, slashes: "//" === b6.href.slice(b6.protocol.length, b6.protocol.length + 2) };
                  }(b5), d3 = c4.pathname;
                  d3 && (d3 = m(d3));
                  let e4 = c4.href;
                  e4 && (e4 = m(e4));
                  let f4 = c4.hostname;
                  f4 && (f4 = m(f4));
                  let g4 = c4.hash;
                  g4 && (g4 = m(g4));
                  let j3 = c4.search;
                  return j3 && (j3 = m(j3)), { ...c4, pathname: d3, hostname: f4, href: e4, hash: g4, search: j3 };
                }(a4), { hostname: e3, query: f3, search: g3 } = d2, k3 = d2.pathname;
                d2.hash && (k3 = "" + k3 + d2.hash);
                let o3 = [], p3 = [];
                for (let a5 of ((0, l.FD)(k3, p3), p3)) o3.push(a5.name);
                if (e3) {
                  let a5 = [];
                  for (let b5 of ((0, l.FD)(e3, a5), a5)) o3.push(b5.name);
                }
                let q5 = (0, l.jT)(k3, { validate: false });
                for (let [c4, d3] of (e3 && (b4 = (0, l.jT)(e3, { validate: false })), Object.entries(f3))) Array.isArray(d3) ? f3[c4] = d3.map((b5) => n(m(b5), a4.params)) : "string" == typeof d3 && (f3[c4] = n(m(d3), a4.params));
                let r3 = Object.keys(a4.params).filter((a5) => "nextInternalLocale" !== a5);
                if (a4.appendParamsToQuery && !r3.some((a5) => o3.includes(a5))) for (let b5 of r3) b5 in f3 || (f3[b5] = a4.params[b5]);
                if ((0, j2.m1)(k3)) for (let b5 of k3.split("/")) {
                  let c4 = j2.VB.find((a5) => b5.startsWith(a5));
                  if (c4) {
                    "(..)(..)" === c4 ? (a4.params["0"] = "(..)", a4.params["1"] = "(..)") : a4.params["0"] = c4;
                    break;
                  }
                }
                try {
                  let [e4, f4] = (c3 = q5(a4.params)).split("#", 2);
                  b4 && (d2.hostname = b4(a4.params)), d2.pathname = e4, d2.hash = (f4 ? "#" : "") + (f4 || ""), d2.search = g3 ? n(g3, a4.params) : "";
                } catch (a5) {
                  if (a5.message.match(/Expected .*? to not repeat, but got an array/)) throw Object.defineProperty(Error("To use a multi-match in the destination you must add `*` at the end of the param name to signify it should repeat. https://nextjs.org/docs/messages/invalid-multi-match"), "__NEXT_ERROR_CODE", { value: "E329", enumerable: false, configurable: true });
                  throw a5;
                }
                return d2.query = { ...a4.query, ...d2.query }, { newUrl: c3, destQuery: f3, parsedDestination: d2 };
              }({ appendParamsToQuery: true, destination: o2.destination, params: s3, query: g2.query });
              if (e2.protocol) return true;
              if (Object.assign(p2, k2, s3), Object.assign(g2.query, e2.query), delete e2.query, Object.entries(g2.query).forEach(([a4, b4]) => {
                if (b4 && "string" == typeof b4 && b4.startsWith(":")) {
                  let c3 = p2[b4.slice(1)];
                  c3 && (g2.query[a4] = c3);
                }
              }), Object.assign(g2, e2), !(r2 = g2.pathname)) return false;
              if (c2 && (r2 = r2.replace(RegExp(`^${c2}`), "") || "/"), b3) {
                let a4 = (0, d.d)(r2, b3.locales);
                r2 = a4.pathname, g2.query.nextInternalLocale = a4.detectedLocale || s3.nextInternalLocale;
              }
              if (r2 === a3) return true;
              if (w3 && F3) {
                let a4 = F3(r2);
                if (a4) return g2.query = { ...g2.query, ...a4 }, true;
              }
            }
            return false;
          };
          for (let a4 of q3.beforeFiles || []) s2(a4);
          if (r2 !== a3) {
            let b4 = false;
            for (let a4 of q3.afterFiles || []) if (b4 = s2(a4)) break;
            if (!b4 && !(() => {
              let b5 = (0, o.U)(r2 || "");
              return b5 === (0, o.U)(a3) || (null == F3 ? void 0 : F3(b5));
            })()) {
              for (let a4 of q3.fallback || []) if (b4 = s2(a4)) break;
            }
          }
          return p2;
        }, defaultRouteRegex: E2, dynamicRouteMatcher: F3, defaultRouteMatches: G2, normalizeQueryParams: function(a4, b4) {
          for (let [c3, d2] of (delete a4.nextInternalLocale, Object.entries(a4))) {
            let e2 = (0, r.wN)(c3);
            e2 && (delete a4[c3], b4.add(e2), void 0 !== d2 && (a4[e2] = Array.isArray(d2) ? d2.map((a5) => s(a5)) : s(d2)));
          }
        }, getParamsFromRouteMatches: function(a4) {
          if (!E2) return null;
          let { groups: b4, routeKeys: c3 } = E2, d2 = (0, g.g)({ re: { exec: (a5) => {
            let d3 = Object.fromEntries(new URLSearchParams(a5));
            for (let [a6, b5] of Object.entries(d3)) {
              let c4 = (0, r.wN)(a6);
              c4 && (d3[c4] = b5, delete d3[a6]);
            }
            let e2 = {};
            for (let a6 of Object.keys(c3)) {
              let f2 = c3[a6];
              if (!f2) continue;
              let g2 = b4[f2], h2 = d3[a6];
              if (!g2.optional && !h2) return null;
              e2[g2.pos] = h2;
            }
            return e2;
          } }, groups: b4 })(a4);
          return d2 || null;
        }, normalizeDynamicRouteParams: (a4, b4) => {
          if (!E2 || !G2) return { params: {}, hasValidParams: false };
          var c3 = E2, d2 = G2;
          let e2 = {};
          for (let f2 of Object.keys(c3.groups)) {
            let g2 = a4[f2];
            "string" == typeof g2 ? g2 = (0, p.P)(g2) : Array.isArray(g2) && (g2 = g2.map(p.P));
            let h2 = d2[f2], i2 = c3.groups[f2].optional;
            if ((Array.isArray(h2) ? h2.some((a5) => Array.isArray(g2) ? g2.some((b5) => b5.includes(a5)) : null == g2 ? void 0 : g2.includes(a5)) : null == g2 ? void 0 : g2.includes(h2)) || void 0 === g2 && !(i2 && b4)) return { params: {}, hasValidParams: false };
            i2 && (!g2 || Array.isArray(g2) && 1 === g2.length && ("index" === g2[0] || g2[0] === `[[...${f2}]]`)) && (g2 = void 0, delete a4[f2]), g2 && "string" == typeof g2 && c3.groups[f2].repeat && (g2 = g2.split("/")), g2 && (e2[f2] = g2);
          }
          return { params: e2, hasValidParams: true };
        }, normalizeCdnUrl: (a4, b4) => function(a5, b5) {
          let c3 = (0, t.Rk)(a5.url);
          if (!c3) return a5.url;
          delete c3.search, D2(c3.query, b5), a5.url = function(a6) {
            let { auth: b6, hostname: c4 } = a6, d2 = a6.protocol || "", e2 = a6.pathname || "", f2 = a6.hash || "", g2 = a6.query || "", h2 = false;
            b6 = b6 ? encodeURIComponent(b6).replace(/%3A/i, ":") + "@" : "", a6.host ? h2 = b6 + a6.host : c4 && (h2 = b6 + (~c4.indexOf(":") ? "[" + c4 + "]" : c4), a6.port && (h2 += ":" + a6.port)), g2 && "object" == typeof g2 && (g2 = String(i.Bw(g2)));
            let j3 = a6.search || g2 && "?" + g2 || "";
            return d2 && !d2.endsWith(":") && (d2 += ":"), a6.slashes || (!d2 || u.test(d2)) && false !== h2 ? (h2 = "//" + (h2 || ""), e2 && "/" !== e2[0] && (e2 = "/" + e2)) : h2 || (h2 = ""), f2 && "#" !== f2[0] && (f2 = "#" + f2), j3 && "?" !== j3[0] && (j3 = "?" + j3), "" + d2 + h2 + (e2 = e2.replace(/[?#]/g, encodeURIComponent)) + (j3 = j3.replace("#", "%23")) + f2;
          }(c3);
        }(a4, b4), interpolateDynamicPath: (a4, b4) => function(a5, b5, c3) {
          if (!c3) return a5;
          for (let d2 of Object.keys(c3.groups)) {
            let e2, { optional: f2, repeat: g2 } = c3.groups[d2], h2 = `[${g2 ? "..." : ""}${d2}]`;
            f2 && (h2 = `[${h2}]`);
            let i2 = b5[d2];
            ((e2 = Array.isArray(i2) ? i2.map((a6) => a6 && encodeURIComponent(a6)).join("/") : i2 ? encodeURIComponent(i2) : "") || f2) && (a5 = a5.replaceAll(h2, e2));
          }
          return a5;
        }(a4, b4, E2), filterInternalQuery: (a4, b4) => D2(a4, b4) };
      }
      function F2(a3, b3) {
        return "string" == typeof a3[q2.vS] && a3[q2.c1] === b3 ? a3[q2.vS].split(",") : [];
      }
    }, 8512: (a2) => {
      (() => {
        "use strict";
        var b2 = { 993: (a3) => {
          var b3 = Object.prototype.hasOwnProperty, c2 = "~";
          function d2() {
          }
          function e2(a4, b4, c3) {
            this.fn = a4, this.context = b4, this.once = c3 || false;
          }
          function f(a4, b4, d3, f2, g2) {
            if ("function" != typeof d3) throw TypeError("The listener must be a function");
            var h2 = new e2(d3, f2 || a4, g2), i = c2 ? c2 + b4 : b4;
            return a4._events[i] ? a4._events[i].fn ? a4._events[i] = [a4._events[i], h2] : a4._events[i].push(h2) : (a4._events[i] = h2, a4._eventsCount++), a4;
          }
          function g(a4, b4) {
            0 == --a4._eventsCount ? a4._events = new d2() : delete a4._events[b4];
          }
          function h() {
            this._events = new d2(), this._eventsCount = 0;
          }
          Object.create && (d2.prototype = /* @__PURE__ */ Object.create(null), new d2().__proto__ || (c2 = false)), h.prototype.eventNames = function() {
            var a4, d3, e3 = [];
            if (0 === this._eventsCount) return e3;
            for (d3 in a4 = this._events) b3.call(a4, d3) && e3.push(c2 ? d3.slice(1) : d3);
            return Object.getOwnPropertySymbols ? e3.concat(Object.getOwnPropertySymbols(a4)) : e3;
          }, h.prototype.listeners = function(a4) {
            var b4 = c2 ? c2 + a4 : a4, d3 = this._events[b4];
            if (!d3) return [];
            if (d3.fn) return [d3.fn];
            for (var e3 = 0, f2 = d3.length, g2 = Array(f2); e3 < f2; e3++) g2[e3] = d3[e3].fn;
            return g2;
          }, h.prototype.listenerCount = function(a4) {
            var b4 = c2 ? c2 + a4 : a4, d3 = this._events[b4];
            return d3 ? d3.fn ? 1 : d3.length : 0;
          }, h.prototype.emit = function(a4, b4, d3, e3, f2, g2) {
            var h2 = c2 ? c2 + a4 : a4;
            if (!this._events[h2]) return false;
            var i, j2, k = this._events[h2], l = arguments.length;
            if (k.fn) {
              switch (k.once && this.removeListener(a4, k.fn, void 0, true), l) {
                case 1:
                  return k.fn.call(k.context), true;
                case 2:
                  return k.fn.call(k.context, b4), true;
                case 3:
                  return k.fn.call(k.context, b4, d3), true;
                case 4:
                  return k.fn.call(k.context, b4, d3, e3), true;
                case 5:
                  return k.fn.call(k.context, b4, d3, e3, f2), true;
                case 6:
                  return k.fn.call(k.context, b4, d3, e3, f2, g2), true;
              }
              for (j2 = 1, i = Array(l - 1); j2 < l; j2++) i[j2 - 1] = arguments[j2];
              k.fn.apply(k.context, i);
            } else {
              var m, n = k.length;
              for (j2 = 0; j2 < n; j2++) switch (k[j2].once && this.removeListener(a4, k[j2].fn, void 0, true), l) {
                case 1:
                  k[j2].fn.call(k[j2].context);
                  break;
                case 2:
                  k[j2].fn.call(k[j2].context, b4);
                  break;
                case 3:
                  k[j2].fn.call(k[j2].context, b4, d3);
                  break;
                case 4:
                  k[j2].fn.call(k[j2].context, b4, d3, e3);
                  break;
                default:
                  if (!i) for (m = 1, i = Array(l - 1); m < l; m++) i[m - 1] = arguments[m];
                  k[j2].fn.apply(k[j2].context, i);
              }
            }
            return true;
          }, h.prototype.on = function(a4, b4, c3) {
            return f(this, a4, b4, c3, false);
          }, h.prototype.once = function(a4, b4, c3) {
            return f(this, a4, b4, c3, true);
          }, h.prototype.removeListener = function(a4, b4, d3, e3) {
            var f2 = c2 ? c2 + a4 : a4;
            if (!this._events[f2]) return this;
            if (!b4) return g(this, f2), this;
            var h2 = this._events[f2];
            if (h2.fn) h2.fn !== b4 || e3 && !h2.once || d3 && h2.context !== d3 || g(this, f2);
            else {
              for (var i = 0, j2 = [], k = h2.length; i < k; i++) (h2[i].fn !== b4 || e3 && !h2[i].once || d3 && h2[i].context !== d3) && j2.push(h2[i]);
              j2.length ? this._events[f2] = 1 === j2.length ? j2[0] : j2 : g(this, f2);
            }
            return this;
          }, h.prototype.removeAllListeners = function(a4) {
            var b4;
            return a4 ? (b4 = c2 ? c2 + a4 : a4, this._events[b4] && g(this, b4)) : (this._events = new d2(), this._eventsCount = 0), this;
          }, h.prototype.off = h.prototype.removeListener, h.prototype.addListener = h.prototype.on, h.prefixed = c2, h.EventEmitter = h, a3.exports = h;
        }, 213: (a3) => {
          a3.exports = (a4, b3) => (b3 = b3 || (() => {
          }), a4.then((a5) => new Promise((a6) => {
            a6(b3());
          }).then(() => a5), (a5) => new Promise((a6) => {
            a6(b3());
          }).then(() => {
            throw a5;
          })));
        }, 574: (a3, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.default = function(a4, b4, c2) {
            let d2 = 0, e2 = a4.length;
            for (; e2 > 0; ) {
              let f = e2 / 2 | 0, g = d2 + f;
              0 >= c2(a4[g], b4) ? (d2 = ++g, e2 -= f + 1) : e2 = f;
            }
            return d2;
          };
        }, 821: (a3, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true });
          let d2 = c2(574);
          class e2 {
            constructor() {
              this._queue = [];
            }
            enqueue(a4, b4) {
              let c3 = { priority: (b4 = Object.assign({ priority: 0 }, b4)).priority, run: a4 };
              if (this.size && this._queue[this.size - 1].priority >= b4.priority) return void this._queue.push(c3);
              let e3 = d2.default(this._queue, c3, (a5, b5) => b5.priority - a5.priority);
              this._queue.splice(e3, 0, c3);
            }
            dequeue() {
              let a4 = this._queue.shift();
              return null == a4 ? void 0 : a4.run;
            }
            filter(a4) {
              return this._queue.filter((b4) => b4.priority === a4.priority).map((a5) => a5.run);
            }
            get size() {
              return this._queue.length;
            }
          }
          b3.default = e2;
        }, 816: (a3, b3, c2) => {
          let d2 = c2(213);
          class e2 extends Error {
            constructor(a4) {
              super(a4), this.name = "TimeoutError";
            }
          }
          let f = (a4, b4, c3) => new Promise((f2, g) => {
            if ("number" != typeof b4 || b4 < 0) throw TypeError("Expected `milliseconds` to be a positive number");
            if (b4 === 1 / 0) return void f2(a4);
            let h = setTimeout(() => {
              if ("function" == typeof c3) {
                try {
                  f2(c3());
                } catch (a5) {
                  g(a5);
                }
                return;
              }
              let d3 = "string" == typeof c3 ? c3 : `Promise timed out after ${b4} milliseconds`, h2 = c3 instanceof Error ? c3 : new e2(d3);
              "function" == typeof a4.cancel && a4.cancel(), g(h2);
            }, b4);
            d2(a4.then(f2, g), () => {
              clearTimeout(h);
            });
          });
          a3.exports = f, a3.exports.default = f, a3.exports.TimeoutError = e2;
        } }, c = {};
        function d(a3) {
          var e2 = c[a3];
          if (void 0 !== e2) return e2.exports;
          var f = c[a3] = { exports: {} }, g = true;
          try {
            b2[a3](f, f.exports, d), g = false;
          } finally {
            g && delete c[a3];
          }
          return f.exports;
        }
        d.ab = "//";
        var e = {};
        (() => {
          Object.defineProperty(e, "__esModule", { value: true });
          let a3 = d(993), b3 = d(816), c2 = d(821), f = () => {
          }, g = new b3.TimeoutError();
          class h extends a3 {
            constructor(a4) {
              var b4, d2, e2, g2;
              if (super(), this._intervalCount = 0, this._intervalEnd = 0, this._pendingCount = 0, this._resolveEmpty = f, this._resolveIdle = f, !("number" == typeof (a4 = Object.assign({ carryoverConcurrencyCount: false, intervalCap: 1 / 0, interval: 0, concurrency: 1 / 0, autoStart: true, queueClass: c2.default }, a4)).intervalCap && a4.intervalCap >= 1)) throw TypeError(`Expected \`intervalCap\` to be a number from 1 and up, got \`${null != (d2 = null == (b4 = a4.intervalCap) ? void 0 : b4.toString()) ? d2 : ""}\` (${typeof a4.intervalCap})`);
              if (void 0 === a4.interval || !(Number.isFinite(a4.interval) && a4.interval >= 0)) throw TypeError(`Expected \`interval\` to be a finite number >= 0, got \`${null != (g2 = null == (e2 = a4.interval) ? void 0 : e2.toString()) ? g2 : ""}\` (${typeof a4.interval})`);
              this._carryoverConcurrencyCount = a4.carryoverConcurrencyCount, this._isIntervalIgnored = a4.intervalCap === 1 / 0 || 0 === a4.interval, this._intervalCap = a4.intervalCap, this._interval = a4.interval, this._queue = new a4.queueClass(), this._queueClass = a4.queueClass, this.concurrency = a4.concurrency, this._timeout = a4.timeout, this._throwOnTimeout = true === a4.throwOnTimeout, this._isPaused = false === a4.autoStart;
            }
            get _doesIntervalAllowAnother() {
              return this._isIntervalIgnored || this._intervalCount < this._intervalCap;
            }
            get _doesConcurrentAllowAnother() {
              return this._pendingCount < this._concurrency;
            }
            _next() {
              this._pendingCount--, this._tryToStartAnother(), this.emit("next");
            }
            _resolvePromises() {
              this._resolveEmpty(), this._resolveEmpty = f, 0 === this._pendingCount && (this._resolveIdle(), this._resolveIdle = f, this.emit("idle"));
            }
            _onResumeInterval() {
              this._onInterval(), this._initializeIntervalIfNeeded(), this._timeoutId = void 0;
            }
            _isIntervalPaused() {
              let a4 = Date.now();
              if (void 0 === this._intervalId) {
                let b4 = this._intervalEnd - a4;
                if (!(b4 < 0)) return void 0 === this._timeoutId && (this._timeoutId = setTimeout(() => {
                  this._onResumeInterval();
                }, b4)), true;
                this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0;
              }
              return false;
            }
            _tryToStartAnother() {
              if (0 === this._queue.size) return this._intervalId && clearInterval(this._intervalId), this._intervalId = void 0, this._resolvePromises(), false;
              if (!this._isPaused) {
                let a4 = !this._isIntervalPaused();
                if (this._doesIntervalAllowAnother && this._doesConcurrentAllowAnother) {
                  let b4 = this._queue.dequeue();
                  return !!b4 && (this.emit("active"), b4(), a4 && this._initializeIntervalIfNeeded(), true);
                }
              }
              return false;
            }
            _initializeIntervalIfNeeded() {
              this._isIntervalIgnored || void 0 !== this._intervalId || (this._intervalId = setInterval(() => {
                this._onInterval();
              }, this._interval), this._intervalEnd = Date.now() + this._interval);
            }
            _onInterval() {
              0 === this._intervalCount && 0 === this._pendingCount && this._intervalId && (clearInterval(this._intervalId), this._intervalId = void 0), this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0, this._processQueue();
            }
            _processQueue() {
              for (; this._tryToStartAnother(); ) ;
            }
            get concurrency() {
              return this._concurrency;
            }
            set concurrency(a4) {
              if (!("number" == typeof a4 && a4 >= 1)) throw TypeError(`Expected \`concurrency\` to be a number from 1 and up, got \`${a4}\` (${typeof a4})`);
              this._concurrency = a4, this._processQueue();
            }
            async add(a4, c3 = {}) {
              return new Promise((d2, e2) => {
                let f2 = async () => {
                  this._pendingCount++, this._intervalCount++;
                  try {
                    let f3 = void 0 === this._timeout && void 0 === c3.timeout ? a4() : b3.default(Promise.resolve(a4()), void 0 === c3.timeout ? this._timeout : c3.timeout, () => {
                      (void 0 === c3.throwOnTimeout ? this._throwOnTimeout : c3.throwOnTimeout) && e2(g);
                    });
                    d2(await f3);
                  } catch (a5) {
                    e2(a5);
                  }
                  this._next();
                };
                this._queue.enqueue(f2, c3), this._tryToStartAnother(), this.emit("add");
              });
            }
            async addAll(a4, b4) {
              return Promise.all(a4.map(async (a5) => this.add(a5, b4)));
            }
            start() {
              return this._isPaused && (this._isPaused = false, this._processQueue()), this;
            }
            pause() {
              this._isPaused = true;
            }
            clear() {
              this._queue = new this._queueClass();
            }
            async onEmpty() {
              if (0 !== this._queue.size) return new Promise((a4) => {
                let b4 = this._resolveEmpty;
                this._resolveEmpty = () => {
                  b4(), a4();
                };
              });
            }
            async onIdle() {
              if (0 !== this._pendingCount || 0 !== this._queue.size) return new Promise((a4) => {
                let b4 = this._resolveIdle;
                this._resolveIdle = () => {
                  b4(), a4();
                };
              });
            }
            get size() {
              return this._queue.size;
            }
            sizeBy(a4) {
              return this._queue.filter(a4).length;
            }
            get pending() {
              return this._pendingCount;
            }
            get isPaused() {
              return this._isPaused;
            }
            get timeout() {
              return this._timeout;
            }
            set timeout(a4) {
              this._timeout = a4;
            }
          }
          e.default = h;
        })(), a2.exports = e;
      })();
    }, 8546: (a2, b2, c) => {
      "use strict";
      c.d(b2, { z: () => k, p: () => l });
      var d = c(1679), e = c(4023), f = c(9414), g = c(4570);
      let h = 0, i = 0, j2 = 0;
      function k(a3) {
        return (null == a3 ? void 0 : a3.name) === "AbortError" || (null == a3 ? void 0 : a3.name) === d.iL;
      }
      async function l(a3, b3, c2) {
        try {
          let { errored: k2, destroyed: l2 } = b3;
          if (k2 || l2) return;
          let m = (0, d.Vy)(b3), n = function(a4, b4) {
            let c3 = false, d2 = new e.q();
            function k3() {
              d2.resolve();
            }
            a4.on("drain", k3), a4.once("close", () => {
              a4.off("drain", k3), d2.resolve();
            });
            let l3 = new e.q();
            return a4.once("finish", () => {
              l3.resolve();
            }), new WritableStream({ write: async (b5) => {
              if (!c3) {
                if (c3 = true, "performance" in globalThis && process.env.NEXT_OTEL_PERFORMANCE_PREFIX) {
                  let a5 = function(a6 = {}) {
                    let b6 = 0 === h ? void 0 : { clientComponentLoadStart: h, clientComponentLoadTimes: i, clientComponentLoadCount: j2 };
                    return a6.reset && (h = 0, i = 0, j2 = 0), b6;
                  }();
                  a5 && performance.measure(`${process.env.NEXT_OTEL_PERFORMANCE_PREFIX}:next-client-component-loading`, { start: a5.clientComponentLoadStart, end: a5.clientComponentLoadStart + a5.clientComponentLoadTimes });
                }
                a4.flushHeaders(), (0, f.EK)().trace(g.Fx.startResponse, { spanName: "start response" }, () => void 0);
              }
              try {
                let c4 = a4.write(b5);
                "flush" in a4 && "function" == typeof a4.flush && a4.flush(), c4 || (await d2.promise, d2 = new e.q());
              } catch (b6) {
                throw a4.end(), Object.defineProperty(Error("failed to write chunk to response", { cause: b6 }), "__NEXT_ERROR_CODE", { value: "E321", enumerable: false, configurable: true });
              }
            }, abort: (b5) => {
              a4.writableFinished || a4.destroy(b5);
            }, close: async () => {
              if (b4 && await b4, !a4.writableFinished) return a4.end(), l3.promise;
            } });
          }(b3, c2);
          await a3.pipeTo(n, { signal: m.signal });
        } catch (a4) {
          if (k(a4)) return;
          throw Object.defineProperty(Error("failed to pipe response", { cause: a4 }), "__NEXT_ERROR_CODE", { value: "E180", enumerable: false, configurable: true });
        }
      }
    }, 8619: (a2, b2, c) => {
      "use strict";
      a2.exports = c(4207);
    }, 8620: (a2, b2, c) => {
      "use strict";
      c.d(b2, { BD: () => d, Ge: () => e });
      let d = /^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/, e = /^(u?int)(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/;
    }, 8657: (a2, b2, c) => {
      "use strict";
      c.d(b2, { Af: () => n, ZJ: () => j2, aT: () => m });
      var d = c(1766), e = c(5237), f = c(4725), g = c(5808), h = c(3375);
      let i = new TextEncoder();
      function j2(a3, b3 = {}) {
        var c2, d2;
        return "number" == typeof a3 || "bigint" == typeof a3 ? (c2 = a3, d2 = b3, m((0, h.cK)(c2, d2))) : "boolean" == typeof a3 ? function(a4, b4 = {}) {
          let c3 = new Uint8Array(1);
          return (c3[0] = Number(a4), "number" == typeof b4.size) ? ((0, g.Sl)(c3, { size: b4.size }), (0, f.eV)(c3, { size: b4.size })) : c3;
        }(a3, b3) : (0, e.q)(a3) ? m(a3, b3) : n(a3, b3);
      }
      let k = { zero: 48, nine: 57, A: 65, F: 70, a: 97, f: 102 };
      function l(a3) {
        return a3 >= k.zero && a3 <= k.nine ? a3 - k.zero : a3 >= k.A && a3 <= k.F ? a3 - (k.A - 10) : a3 >= k.a && a3 <= k.f ? a3 - (k.a - 10) : void 0;
      }
      function m(a3, b3 = {}) {
        let c2 = a3;
        b3.size && ((0, g.Sl)(c2, { size: b3.size }), c2 = (0, f.eV)(c2, { dir: "right", size: b3.size }));
        let e2 = c2.slice(2);
        e2.length % 2 && (e2 = `0${e2}`);
        let h2 = e2.length / 2, i2 = new Uint8Array(h2);
        for (let a4 = 0, b4 = 0; a4 < h2; a4++) {
          let c3 = l(e2.charCodeAt(b4++)), f2 = l(e2.charCodeAt(b4++));
          if (void 0 === c3 || void 0 === f2) throw new d.C(`Invalid byte sequence ("${e2[b4 - 2]}${e2[b4 - 1]}" in "${e2}").`);
          i2[a4] = 16 * c3 + f2;
        }
        return i2;
      }
      function n(a3, b3 = {}) {
        let c2 = i.encode(a3);
        return "number" == typeof b3.size ? ((0, g.Sl)(c2, { size: b3.size }), (0, f.eV)(c2, { dir: "right", size: b3.size })) : c2;
      }
    }, 8749: (a2, b2, c) => {
      "use strict";
      c.d(b2, { q9: () => l });
      var d = c(2456), e = c(3173), f = c(1664), g = c(4289), h = c(882);
      class i {
        constructor(a3, b3, c2, d2) {
          var e2;
          let f2 = a3 && (0, h.Gx)(b3, a3).isOnDemandRevalidate, g2 = null == (e2 = c2.get(h.Ic)) ? void 0 : e2.value;
          this._isEnabled = !!(!f2 && g2 && a3 && g2 === a3.previewModeId), this._previewModeId = null == a3 ? void 0 : a3.previewModeId, this._mutableCookies = d2;
        }
        get isEnabled() {
          return this._isEnabled;
        }
        enable() {
          if (!this._previewModeId) throw Object.defineProperty(Error("Invariant: previewProps missing previewModeId this should never happen"), "__NEXT_ERROR_CODE", { value: "E93", enumerable: false, configurable: true });
          this._mutableCookies.set({ name: h.Ic, value: this._previewModeId, httpOnly: true, sameSite: "none", secure: true, path: "/" }), this._isEnabled = true;
        }
        disable() {
          this._mutableCookies.set({ name: h.Ic, value: "", httpOnly: true, sameSite: "none", secure: true, path: "/", expires: /* @__PURE__ */ new Date(0) }), this._isEnabled = false;
        }
      }
      var j2 = c(9565);
      function k(a3, b3) {
        if ("x-middleware-set-cookie" in a3.headers && "string" == typeof a3.headers["x-middleware-set-cookie"]) {
          let c2 = a3.headers["x-middleware-set-cookie"], d2 = new Headers();
          for (let a4 of (0, j2.RD)(c2)) d2.append("set-cookie", a4);
          for (let a4 of new g.VO(d2).getAll()) b3.set(a4);
        }
      }
      function l(a3, b3, c2, h2, j3) {
        return function(a4, b4, c3, h3, j4, l2, m, n, o, p, q2, r) {
          function s(a5) {
            c3 && c3.setHeader("Set-Cookie", a5);
          }
          let t = {};
          return { type: "request", phase: a4, implicitTags: l2, url: { pathname: h3.pathname, search: h3.search ?? "" }, rootParams: j4, get headers() {
            return t.headers || (t.headers = function(a5) {
              let b5 = e.o.from(a5);
              for (let a6 of d.KD) b5.delete(a6);
              return e.o.seal(b5);
            }(b4.headers)), t.headers;
          }, get cookies() {
            if (!t.cookies) {
              let a5 = new g.tm(e.o.from(b4.headers));
              k(b4, a5), t.cookies = f.Ck.seal(a5);
            }
            return t.cookies;
          }, set cookies(value) {
            t.cookies = value;
          }, get mutableCookies() {
            if (!t.mutableCookies) {
              let a5 = function(a6, b5) {
                let c4 = new g.tm(e.o.from(a6));
                return f.K8.wrap(c4, b5);
              }(b4.headers, m || (c3 ? s : void 0));
              k(b4, a5), t.mutableCookies = a5;
            }
            return t.mutableCookies;
          }, get userspaceMutableCookies() {
            return t.userspaceMutableCookies || (t.userspaceMutableCookies = (0, f.EJ)(this)), t.userspaceMutableCookies;
          }, get draftMode() {
            return t.draftMode || (t.draftMode = new i(o, b4, this.cookies, this.mutableCookies)), t.draftMode;
          }, renderResumeDataCache: n ?? null, isHmrRefresh: p, serverComponentsHmrCache: q2 || globalThis.__serverComponentsHmrCache, devFallbackParams: null };
        }("action", a3, void 0, b3, {}, c2, h2, void 0, j3, false, void 0, null);
      }
    }, 8826: (a2, b2, c) => {
      "use strict";
      c.d(b2, { $p: () => i, cg: () => h, xl: () => g });
      let d = Object.defineProperty(Error("Invariant: AsyncLocalStorage accessed in runtime where it is not available"), "__NEXT_ERROR_CODE", { value: "E504", enumerable: false, configurable: true });
      class e {
        disable() {
          throw d;
        }
        getStore() {
        }
        run() {
          throw d;
        }
        exit() {
          throw d;
        }
        enterWith() {
          throw d;
        }
        static bind(a3) {
          return a3;
        }
      }
      let f = "undefined" != typeof globalThis && globalThis.AsyncLocalStorage;
      function g() {
        return f ? new f() : new e();
      }
      function h(a3) {
        return f ? f.bind(a3) : e.bind(a3);
      }
      function i() {
        return f ? f.snapshot() : function(a3, ...b3) {
          return a3(...b3);
        };
      }
    }, 8833: (a2, b2, c) => {
      "use strict";
      c.d(b2, { M: () => e });
      var d = c(1766);
      class e extends d.C {
        constructor({ address: a3 }) {
          super(`Address "${a3}" is invalid.`, { metaMessages: ["- Address must be a hex value of 20 bytes (40 hex characters).", "- Address must match its checksum counterpart."], name: "InvalidAddressError" });
        }
      }
    }, 8863: (a2, b2, c) => {
      "use strict";
      c.d(b2, { BI: () => x2, EB: () => v2, Iy: () => i, Iz: () => t, MR: () => u, M_: () => s, Nc: () => k, O: () => j2, Wq: () => p, YE: () => m, YF: () => h, YW: () => g, ZP: () => n, _z: () => q2, d_: () => D2, dm: () => C2, fo: () => y, gH: () => l, j: () => B2, kE: () => r, l3: () => z2, nK: () => A, nM: () => w2, yy: () => o });
      var d = c(9382), e = c(2847), f = c(1766);
      class g extends f.C {
        constructor({ docsPath: a3 }) {
          super("A constructor was not found on the ABI.\nMake sure you are using the correct ABI and that the constructor exists on it.", { docsPath: a3, name: "AbiConstructorNotFoundError" });
        }
      }
      class h extends f.C {
        constructor({ docsPath: a3 }) {
          super("Constructor arguments were provided (`args`), but a constructor parameters (`inputs`) were not found on the ABI.\nMake sure you are using the correct ABI, and that the `inputs` attribute on the constructor exists.", { docsPath: a3, name: "AbiConstructorParamsNotFoundError" });
        }
      }
      f.C;
      class i extends f.C {
        constructor({ data: a3, params: b3, size: c2 }) {
          super(`Data size of ${c2} bytes is too small for given parameters.`, { metaMessages: [`Params: (${(0, d.A)(b3, { includeName: true })})`, `Data:   ${a3} (${c2} bytes)`], name: "AbiDecodingDataSizeTooSmallError" }), Object.defineProperty(this, "data", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "params", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "size", { enumerable: true, configurable: true, writable: true, value: void 0 }), this.data = a3, this.params = b3, this.size = c2;
        }
      }
      class j2 extends f.C {
        constructor({ cause: a3 } = {}) {
          super('Cannot decode zero data ("0x") with ABI parameters.', { name: "AbiDecodingZeroDataError", cause: a3 });
        }
      }
      class k extends f.C {
        constructor({ expectedLength: a3, givenLength: b3, type: c2 }) {
          super(`ABI encoding array length mismatch for type ${c2}.
Expected length: ${a3}
Given length: ${b3}`, { name: "AbiEncodingArrayLengthMismatchError" });
        }
      }
      class l extends f.C {
        constructor({ expectedSize: a3, value: b3 }) {
          super(`Size of bytes "${b3}" (bytes${(0, e.E)(b3)}) does not match expected size (bytes${a3}).`, { name: "AbiEncodingBytesSizeMismatchError" });
        }
      }
      class m extends f.C {
        constructor({ expectedLength: a3, givenLength: b3 }) {
          super(`ABI encoding params/values length mismatch.
Expected length (params): ${a3}
Given length (values): ${b3}`, { name: "AbiEncodingLengthMismatchError" });
        }
      }
      class n extends f.C {
        constructor(a3, { docsPath: b3 }) {
          super(`Arguments (\`args\`) were provided to "${a3}", but "${a3}" on the ABI does not contain any parameters (\`inputs\`).
Cannot encode error result without knowing what the parameter types are.
Make sure you are using the correct ABI and that the inputs exist on it.`, { docsPath: b3, name: "AbiErrorInputsNotFoundError" });
        }
      }
      class o extends f.C {
        constructor(a3, { docsPath: b3 } = {}) {
          super(`Error ${a3 ? `"${a3}" ` : ""}not found on ABI.
Make sure you are using the correct ABI and that the error exists on it.`, { docsPath: b3, name: "AbiErrorNotFoundError" });
        }
      }
      class p extends f.C {
        constructor(a3, { docsPath: b3, cause: c2 }) {
          super(`Encoded error signature "${a3}" not found on ABI.
Make sure you are using the correct ABI and that the error exists on it.
You can look up the decoded signature here: https://4byte.sourcify.dev/?q=${a3}.`, { docsPath: b3, name: "AbiErrorSignatureNotFoundError", cause: c2 }), Object.defineProperty(this, "signature", { enumerable: true, configurable: true, writable: true, value: void 0 }), this.signature = a3;
        }
      }
      class q2 extends f.C {
        constructor({ docsPath: a3 }) {
          super("Cannot extract event signature from empty topics.", { docsPath: a3, name: "AbiEventSignatureEmptyTopicsError" });
        }
      }
      class r extends f.C {
        constructor(a3, { docsPath: b3 }) {
          super(`Encoded event signature "${a3}" not found on ABI.
Make sure you are using the correct ABI and that the event exists on it.
You can look up the signature here: https://4byte.sourcify.dev/?q=${a3}.`, { docsPath: b3, name: "AbiEventSignatureNotFoundError" });
        }
      }
      class s extends f.C {
        constructor(a3, { docsPath: b3 } = {}) {
          super(`Event ${a3 ? `"${a3}" ` : ""}not found on ABI.
Make sure you are using the correct ABI and that the event exists on it.`, { docsPath: b3, name: "AbiEventNotFoundError" });
        }
      }
      class t extends f.C {
        constructor(a3, { docsPath: b3 } = {}) {
          super(`Function ${a3 ? `"${a3}" ` : ""}not found on ABI.
Make sure you are using the correct ABI and that the function exists on it.`, { docsPath: b3, name: "AbiFunctionNotFoundError" });
        }
      }
      class u extends f.C {
        constructor(a3, { docsPath: b3 }) {
          super(`Function "${a3}" does not contain any \`outputs\` on ABI.
Cannot decode function result without knowing what the parameter types are.
Make sure you are using the correct ABI and that the function exists on it.`, { docsPath: b3, name: "AbiFunctionOutputsNotFoundError" });
        }
      }
      class v2 extends f.C {
        constructor(a3, { docsPath: b3 }) {
          super(`Encoded function signature "${a3}" not found on ABI.
Make sure you are using the correct ABI and that the function exists on it.
You can look up the signature here: https://4byte.sourcify.dev/?q=${a3}.`, { docsPath: b3, name: "AbiFunctionSignatureNotFoundError" });
        }
      }
      class w2 extends f.C {
        constructor(a3, b3) {
          super("Found ambiguous types in overloaded ABI items.", { metaMessages: [`\`${a3.type}\` in \`${(0, d.B)(a3.abiItem)}\`, and`, `\`${b3.type}\` in \`${(0, d.B)(b3.abiItem)}\``, "", "These types encode differently and cannot be distinguished at runtime.", "Remove one of the ambiguous items in the ABI."], name: "AbiItemAmbiguityError" });
        }
      }
      class x2 extends f.C {
        constructor({ expectedSize: a3, givenSize: b3 }) {
          super(`Expected bytes${a3}, got bytes${b3}.`, { name: "BytesSizeMismatchError" });
        }
      }
      class y extends f.C {
        constructor({ abiItem: a3, data: b3, params: c2, size: e2 }) {
          super(`Data size of ${e2} bytes is too small for non-indexed event parameters.`, { metaMessages: [`Params: (${(0, d.A)(c2, { includeName: true })})`, `Data:   ${b3} (${e2} bytes)`], name: "DecodeLogDataMismatch" }), Object.defineProperty(this, "abiItem", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "data", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "params", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "size", { enumerable: true, configurable: true, writable: true, value: void 0 }), this.abiItem = a3, this.data = b3, this.params = c2, this.size = e2;
        }
      }
      class z2 extends f.C {
        constructor({ abiItem: a3, param: b3 }) {
          super(`Expected a topic for indexed event parameter${b3.name ? ` "${b3.name}"` : ""} on event "${(0, d.B)(a3, { includeName: true })}".`, { name: "DecodeLogTopicsMismatch" }), Object.defineProperty(this, "abiItem", { enumerable: true, configurable: true, writable: true, value: void 0 }), this.abiItem = a3;
        }
      }
      class A extends f.C {
        constructor(a3, { docsPath: b3 }) {
          super(`Type "${a3}" is not a valid encoding type.
Please provide a valid ABI type.`, { docsPath: b3, name: "InvalidAbiEncodingType" });
        }
      }
      class B2 extends f.C {
        constructor(a3, { docsPath: b3 }) {
          super(`Type "${a3}" is not a valid decoding type.
Please provide a valid ABI type.`, { docsPath: b3, name: "InvalidAbiDecodingType" });
        }
      }
      class C2 extends f.C {
        constructor(a3) {
          super(`Value "${a3}" is not a valid array.`, { name: "InvalidArrayError" });
        }
      }
      class D2 extends f.C {
        constructor(a3) {
          super(`"${a3}" is not a valid definition type.
Valid types: "function", "event", "error"`, { name: "InvalidDefinitionTypeError" });
        }
      }
      f.C;
    }, 9320: (a2, b2, c) => {
      "use strict";
      c.d(b2, { P: () => h });
      var d = c(2226), e = c(7474);
      let f = /^0x[a-fA-F0-9]{40}$/, g = new d.A(8192);
      function h(a3, b3) {
        let { strict: c2 = true } = b3 ?? {}, d2 = `${a3}.${c2}`;
        if (g.has(d2)) return g.get(d2);
        let h2 = !!f.test(a3) && (a3.toLowerCase() === a3 || !c2 || (0, e.o)(a3) === a3);
        return g.set(d2, h2), h2;
      }
    }, 9382: (a2, b2, c) => {
      "use strict";
      c.d(b2, { A: () => f, B: () => e });
      var d = c(8863);
      function e(a3, { includeName: b3 = false } = {}) {
        if ("function" !== a3.type && "event" !== a3.type && "error" !== a3.type) throw new d.d_(a3.type);
        return `${a3.name}(${f(a3.inputs, { includeName: b3 })})`;
      }
      function f(a3, { includeName: b3 = false } = {}) {
        return a3 ? a3.map((a4) => function(a5, { includeName: b4 }) {
          return a5.type.startsWith("tuple") ? `(${f(a5.components, { includeName: b4 })})${a5.type.slice(5)}` : a5.type + (b4 && a5.name ? ` ${a5.name}` : "");
        }(a4, { includeName: b3 })).join(b3 ? ", " : ",") : "";
      }
    }, 9414: (a2, b2, c) => {
      "use strict";
      let d;
      c.d(b2, { EK: () => u, v8: () => l });
      var e = c(4570), f = c(7707);
      let g = process.env.NEXT_OTEL_PERFORMANCE_PREFIX, { context: h, propagation: i, trace: j2, SpanStatusCode: k, SpanKind: l, ROOT_CONTEXT: m } = d = c(182);
      class n extends Error {
        constructor(a3, b3) {
          super(), this.bubble = a3, this.result = b3;
        }
      }
      let o = (a3, b3) => {
        (function(a4) {
          return "object" == typeof a4 && null !== a4 && a4 instanceof n;
        })(b3) && b3.bubble ? a3.setAttribute("next.bubble", true) : (b3 && (a3.recordException(b3), a3.setAttribute("error.type", b3.name)), a3.setStatus({ code: k.ERROR, message: null == b3 ? void 0 : b3.message })), a3.end();
      }, p = /* @__PURE__ */ new Map(), q2 = d.createContextKey("next.rootSpanId"), r = 0, s = { set(a3, b3, c2) {
        a3.push({ key: b3, value: c2 });
      } };
      class t {
        getTracerInstance() {
          return j2.getTracer("next.js", "0.0.1");
        }
        getContext() {
          return h;
        }
        getTracePropagationData() {
          let a3 = h.active(), b3 = [];
          return i.inject(a3, b3, s), b3;
        }
        getActiveScopeSpan() {
          return j2.getSpan(null == h ? void 0 : h.active());
        }
        withPropagatedContext(a3, b3, c2) {
          let d2 = h.active();
          if (j2.getSpanContext(d2)) return b3();
          let e2 = i.extract(d2, a3, c2);
          return h.with(e2, b3);
        }
        trace(...a3) {
          var b3;
          let [c2, d2, i2] = a3, { fn: k2, options: l2 } = "function" == typeof d2 ? { fn: d2, options: {} } : { fn: i2, options: { ...d2 } }, n2 = l2.spanName ?? c2;
          if (!e.KK.has(c2) && "1" !== process.env.NEXT_OTEL_VERBOSE || l2.hideSpan) return k2();
          let s2 = this.getSpanContext((null == l2 ? void 0 : l2.parentSpan) ?? this.getActiveScopeSpan()), t2 = false;
          s2 ? (null == (b3 = j2.getSpanContext(s2)) ? void 0 : b3.isRemote) && (t2 = true) : (s2 = (null == h ? void 0 : h.active()) ?? m, t2 = true);
          let u2 = r++;
          return l2.attributes = { "next.span_name": n2, "next.span_type": c2, ...l2.attributes }, h.with(s2.setValue(q2, u2), () => this.getTracerInstance().startActiveSpan(n2, l2, (a4) => {
            let b4;
            g && c2 && e.EI.has(c2) && (b4 = "performance" in globalThis && "measure" in performance ? globalThis.performance.now() : void 0);
            let d3 = false, h2 = () => {
              !d3 && (d3 = true, p.delete(u2), b4 && performance.measure(`${g}:next-${(c2.split(".").pop() || "").replace(/[A-Z]/g, (a5) => "-" + a5.toLowerCase())}`, { start: b4, end: performance.now() }));
            };
            if (t2 && p.set(u2, new Map(Object.entries(l2.attributes ?? {}))), k2.length > 1) try {
              return k2(a4, (b5) => o(a4, b5));
            } catch (b5) {
              throw o(a4, b5), b5;
            } finally {
              h2();
            }
            try {
              let b5 = k2(a4);
              if ((0, f.Q)(b5)) return b5.then((b6) => (a4.end(), b6)).catch((b6) => {
                throw o(a4, b6), b6;
              }).finally(h2);
              return a4.end(), h2(), b5;
            } catch (b5) {
              throw o(a4, b5), h2(), b5;
            }
          }));
        }
        wrap(...a3) {
          let b3 = this, [c2, d2, f2] = 3 === a3.length ? a3 : [a3[0], {}, a3[1]];
          return e.KK.has(c2) || "1" === process.env.NEXT_OTEL_VERBOSE ? function() {
            let a4 = d2;
            "function" == typeof a4 && "function" == typeof f2 && (a4 = a4.apply(this, arguments));
            let e2 = arguments.length - 1, g2 = arguments[e2];
            if ("function" != typeof g2) return b3.trace(c2, a4, () => f2.apply(this, arguments));
            {
              let d3 = b3.getContext().bind(h.active(), g2);
              return b3.trace(c2, a4, (a5, b4) => (arguments[e2] = function(a6) {
                return null == b4 || b4(a6), d3.apply(this, arguments);
              }, f2.apply(this, arguments)));
            }
          } : f2;
        }
        startSpan(...a3) {
          let [b3, c2] = a3, d2 = this.getSpanContext((null == c2 ? void 0 : c2.parentSpan) ?? this.getActiveScopeSpan());
          return this.getTracerInstance().startSpan(b3, c2, d2);
        }
        getSpanContext(a3) {
          return a3 ? j2.setSpan(h.active(), a3) : void 0;
        }
        getRootSpanAttributes() {
          let a3 = h.active().getValue(q2);
          return p.get(a3);
        }
        setRootSpanAttribute(a3, b3) {
          let c2 = h.active().getValue(q2), d2 = p.get(c2);
          d2 && d2.set(a3, b3);
        }
      }
      let u = (() => {
        let a3 = new t();
        return () => a3;
      })();
    }, 9456: (a2, b2, c) => {
      "use strict";
      function d(a3) {
        return a3.startsWith("/") ? a3 : "/" + a3;
      }
      c.d(b2, { A: () => d });
    }, 9565: (a2, b2, c) => {
      "use strict";
      c.d(b2, { Cu: () => g, RD: () => f, p$: () => e, qU: () => h, wN: () => i });
      var d = c(1212);
      function e(a3) {
        let b3 = new Headers();
        for (let [c2, d2] of Object.entries(a3)) for (let a4 of Array.isArray(d2) ? d2 : [d2]) void 0 !== a4 && ("number" == typeof a4 && (a4 = a4.toString()), b3.append(c2, a4));
        return b3;
      }
      function f(a3) {
        var b3, c2, d2, e2, f2, g2 = [], h2 = 0;
        function i2() {
          for (; h2 < a3.length && /\s/.test(a3.charAt(h2)); ) h2 += 1;
          return h2 < a3.length;
        }
        for (; h2 < a3.length; ) {
          for (b3 = h2, f2 = false; i2(); ) if ("," === (c2 = a3.charAt(h2))) {
            for (d2 = h2, h2 += 1, i2(), e2 = h2; h2 < a3.length && "=" !== (c2 = a3.charAt(h2)) && ";" !== c2 && "," !== c2; ) h2 += 1;
            h2 < a3.length && "=" === a3.charAt(h2) ? (f2 = true, h2 = e2, g2.push(a3.substring(b3, d2)), b3 = h2) : h2 = d2 + 1;
          } else h2 += 1;
          (!f2 || h2 >= a3.length) && g2.push(a3.substring(b3, a3.length));
        }
        return g2;
      }
      function g(a3) {
        let b3 = {}, c2 = [];
        if (a3) for (let [d2, e2] of a3.entries()) "set-cookie" === d2.toLowerCase() ? (c2.push(...f(e2)), b3[d2] = 1 === c2.length ? c2[0] : c2) : b3[d2] = e2;
        return b3;
      }
      function h(a3) {
        try {
          return String(new URL(String(a3)));
        } catch (b3) {
          throw Object.defineProperty(Error(`URL is malformed "${String(a3)}". Please use only absolute URLs - https://nextjs.org/docs/messages/middleware-relative-urls`, { cause: b3 }), "__NEXT_ERROR_CODE", { value: "E61", enumerable: false, configurable: true });
        }
      }
      function i(a3) {
        for (let b3 of [d.AA, d.h]) if (a3 !== b3 && a3.startsWith(b3)) return a3.substring(b3.length);
        return null;
      }
    }, 9624: (a2, b2, c) => {
      "use strict";
      c.d(b2, { ke: () => e, lY: () => f });
      let d = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
      function e(a3, b3) {
        return d.test(b3) ? "`" + a3 + "." + b3 + "`" : "`" + a3 + "[" + JSON.stringify(b3) + "]`";
      }
      let f = /* @__PURE__ */ new Set(["hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toString", "valueOf", "toLocaleString", "then", "catch", "finally", "status", "displayName", "_debugInfo", "toJSON", "$$typeof", "__esModule"]);
    }, 9633: (a2, b2, c) => {
      "use strict";
      c.d(b2, { Q: () => d });
      var d = function(a3) {
        return a3[a3.SeeOther = 303] = "SeeOther", a3[a3.TemporaryRedirect = 307] = "TemporaryRedirect", a3[a3.PermanentRedirect = 308] = "PermanentRedirect", a3;
      }({});
    }, 9636: (a2, b2, c) => {
      "use strict";
      c.d(b2, { jT: () => i, FD: () => h, nH: () => j2 });
      var d = c(2569);
      let e = "_NEXTSEP_";
      function f(a3) {
        return "string" == typeof a3 && !!(/\/\(\.{1,3}\):[^/\s]+/.test(a3) || /:[a-zA-Z_][a-zA-Z0-9_]*:[a-zA-Z_][a-zA-Z0-9_]*/.test(a3));
      }
      function g(a3) {
        let b3 = a3;
        return (b3 = b3.replace(/(\([^)]*\)):([^/\s]+)/g, `$1${e}:$2`)).replace(/:([^:/\s)]+)(?=:)/g, `:$1${e}`);
      }
      function h(a3, b3, c2) {
        if ("string" != typeof a3) return (0, d.pathToRegexp)(a3, b3, c2);
        let e2 = f(a3), h2 = e2 ? g(a3) : a3;
        try {
          return (0, d.pathToRegexp)(h2, b3, c2);
        } catch (f2) {
          if (!e2) try {
            let e3 = g(a3);
            return (0, d.pathToRegexp)(e3, b3, c2);
          } catch (a4) {
          }
          throw f2;
        }
      }
      function i(a3, b3) {
        let c2 = f(a3), e2 = c2 ? g(a3) : a3;
        try {
          return (0, d.compile)(e2, b3);
        } catch (e3) {
          if (!c2) try {
            let c3 = g(a3);
            return (0, d.compile)(c3, b3);
          } catch (a4) {
          }
          throw e3;
        }
      }
      function j2(a3) {
        return (b3) => {
          let c2 = a3(b3);
          if (!c2) return false;
          let d2 = {};
          for (let [a4, b4] of Object.entries(c2)) "string" == typeof b4 ? d2[a4] = b4.replace(RegExp(`^${e}`), "") : Array.isArray(b4) ? d2[a4] = b4.map((a5) => "string" == typeof a5 ? a5.replace(RegExp(`^${e}`), "") : a5) : d2[a4] = b4;
          return d2;
        };
      }
    }, 9739: (a2, b2, c) => {
      "use strict";
      c.d(b2, { fQ: () => f }), c(9904);
      var d = c(4153);
      c(7223);
      let e = Symbol.for("next.server.action-manifests");
      function f({ page: a3, clientReferenceManifest: b3, serverActionsManifest: c2, serverModuleMap: f2 }) {
        var g;
        let h = null == (g = globalThis[e]) ? void 0 : g.clientReferenceManifestsPerPage;
        globalThis[e] = { clientReferenceManifestsPerPage: { ...h, [(0, d.Y)(a3)]: b3 }, serverActionsManifest: c2, serverModuleMap: f2 };
      }
    }, 9795: (a2, b2, c) => {
      "use strict";
      c.d(b2, { S: () => h });
      var d = c(7037), e = c(5237), f = c(8657), g = c(3375);
      function h(a3, b3) {
        let c2 = (0, d.lY)((0, e.q)(a3, { strict: false }) ? (0, f.ZJ)(a3) : a3);
        return "bytes" === (b3 || "hex") ? c2 : (0, g.nj)(c2);
      }
    }, 9802: (a2) => {
      !function() {
        "use strict";
        var b2 = { 114: function(a3) {
          function b3(a4) {
            if ("string" != typeof a4) throw TypeError("Path must be a string. Received " + JSON.stringify(a4));
          }
          function c2(a4, b4) {
            for (var c3, d3 = "", e = 0, f = -1, g = 0, h = 0; h <= a4.length; ++h) {
              if (h < a4.length) c3 = a4.charCodeAt(h);
              else if (47 === c3) break;
              else c3 = 47;
              if (47 === c3) {
                if (f === h - 1 || 1 === g) ;
                else if (f !== h - 1 && 2 === g) {
                  if (d3.length < 2 || 2 !== e || 46 !== d3.charCodeAt(d3.length - 1) || 46 !== d3.charCodeAt(d3.length - 2)) {
                    if (d3.length > 2) {
                      var i = d3.lastIndexOf("/");
                      if (i !== d3.length - 1) {
                        -1 === i ? (d3 = "", e = 0) : e = (d3 = d3.slice(0, i)).length - 1 - d3.lastIndexOf("/"), f = h, g = 0;
                        continue;
                      }
                    } else if (2 === d3.length || 1 === d3.length) {
                      d3 = "", e = 0, f = h, g = 0;
                      continue;
                    }
                  }
                  b4 && (d3.length > 0 ? d3 += "/.." : d3 = "..", e = 2);
                } else d3.length > 0 ? d3 += "/" + a4.slice(f + 1, h) : d3 = a4.slice(f + 1, h), e = h - f - 1;
                f = h, g = 0;
              } else 46 === c3 && -1 !== g ? ++g : g = -1;
            }
            return d3;
          }
          var d2 = { resolve: function() {
            for (var a4, d3, e = "", f = false, g = arguments.length - 1; g >= -1 && !f; g--) g >= 0 ? d3 = arguments[g] : (void 0 === a4 && (a4 = ""), d3 = a4), b3(d3), 0 !== d3.length && (e = d3 + "/" + e, f = 47 === d3.charCodeAt(0));
            if (e = c2(e, !f), f) if (e.length > 0) return "/" + e;
            else return "/";
            return e.length > 0 ? e : ".";
          }, normalize: function(a4) {
            if (b3(a4), 0 === a4.length) return ".";
            var d3 = 47 === a4.charCodeAt(0), e = 47 === a4.charCodeAt(a4.length - 1);
            return (0 !== (a4 = c2(a4, !d3)).length || d3 || (a4 = "."), a4.length > 0 && e && (a4 += "/"), d3) ? "/" + a4 : a4;
          }, isAbsolute: function(a4) {
            return b3(a4), a4.length > 0 && 47 === a4.charCodeAt(0);
          }, join: function() {
            if (0 == arguments.length) return ".";
            for (var a4, c3 = 0; c3 < arguments.length; ++c3) {
              var e = arguments[c3];
              b3(e), e.length > 0 && (void 0 === a4 ? a4 = e : a4 += "/" + e);
            }
            return void 0 === a4 ? "." : d2.normalize(a4);
          }, relative: function(a4, c3) {
            if (b3(a4), b3(c3), a4 === c3 || (a4 = d2.resolve(a4)) === (c3 = d2.resolve(c3))) return "";
            for (var e = 1; e < a4.length && 47 === a4.charCodeAt(e); ++e) ;
            for (var f = a4.length, g = f - e, h = 1; h < c3.length && 47 === c3.charCodeAt(h); ++h) ;
            for (var i = c3.length - h, j2 = g < i ? g : i, k = -1, l = 0; l <= j2; ++l) {
              if (l === j2) {
                if (i > j2) {
                  if (47 === c3.charCodeAt(h + l)) return c3.slice(h + l + 1);
                  else if (0 === l) return c3.slice(h + l);
                } else g > j2 && (47 === a4.charCodeAt(e + l) ? k = l : 0 === l && (k = 0));
                break;
              }
              var m = a4.charCodeAt(e + l);
              if (m !== c3.charCodeAt(h + l)) break;
              47 === m && (k = l);
            }
            var n = "";
            for (l = e + k + 1; l <= f; ++l) (l === f || 47 === a4.charCodeAt(l)) && (0 === n.length ? n += ".." : n += "/..");
            return n.length > 0 ? n + c3.slice(h + k) : (h += k, 47 === c3.charCodeAt(h) && ++h, c3.slice(h));
          }, _makeLong: function(a4) {
            return a4;
          }, dirname: function(a4) {
            if (b3(a4), 0 === a4.length) return ".";
            for (var c3 = a4.charCodeAt(0), d3 = 47 === c3, e = -1, f = true, g = a4.length - 1; g >= 1; --g) if (47 === (c3 = a4.charCodeAt(g))) {
              if (!f) {
                e = g;
                break;
              }
            } else f = false;
            return -1 === e ? d3 ? "/" : "." : d3 && 1 === e ? "//" : a4.slice(0, e);
          }, basename: function(a4, c3) {
            if (void 0 !== c3 && "string" != typeof c3) throw TypeError('"ext" argument must be a string');
            b3(a4);
            var d3, e = 0, f = -1, g = true;
            if (void 0 !== c3 && c3.length > 0 && c3.length <= a4.length) {
              if (c3.length === a4.length && c3 === a4) return "";
              var h = c3.length - 1, i = -1;
              for (d3 = a4.length - 1; d3 >= 0; --d3) {
                var j2 = a4.charCodeAt(d3);
                if (47 === j2) {
                  if (!g) {
                    e = d3 + 1;
                    break;
                  }
                } else -1 === i && (g = false, i = d3 + 1), h >= 0 && (j2 === c3.charCodeAt(h) ? -1 == --h && (f = d3) : (h = -1, f = i));
              }
              return e === f ? f = i : -1 === f && (f = a4.length), a4.slice(e, f);
            }
            for (d3 = a4.length - 1; d3 >= 0; --d3) if (47 === a4.charCodeAt(d3)) {
              if (!g) {
                e = d3 + 1;
                break;
              }
            } else -1 === f && (g = false, f = d3 + 1);
            return -1 === f ? "" : a4.slice(e, f);
          }, extname: function(a4) {
            b3(a4);
            for (var c3 = -1, d3 = 0, e = -1, f = true, g = 0, h = a4.length - 1; h >= 0; --h) {
              var i = a4.charCodeAt(h);
              if (47 === i) {
                if (!f) {
                  d3 = h + 1;
                  break;
                }
                continue;
              }
              -1 === e && (f = false, e = h + 1), 46 === i ? -1 === c3 ? c3 = h : 1 !== g && (g = 1) : -1 !== c3 && (g = -1);
            }
            return -1 === c3 || -1 === e || 0 === g || 1 === g && c3 === e - 1 && c3 === d3 + 1 ? "" : a4.slice(c3, e);
          }, format: function(a4) {
            var b4, c3;
            if (null === a4 || "object" != typeof a4) throw TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof a4);
            return b4 = a4.dir || a4.root, c3 = a4.base || (a4.name || "") + (a4.ext || ""), b4 ? b4 === a4.root ? b4 + c3 : b4 + "/" + c3 : c3;
          }, parse: function(a4) {
            b3(a4);
            var c3, d3 = { root: "", dir: "", base: "", ext: "", name: "" };
            if (0 === a4.length) return d3;
            var e = a4.charCodeAt(0), f = 47 === e;
            f ? (d3.root = "/", c3 = 1) : c3 = 0;
            for (var g = -1, h = 0, i = -1, j2 = true, k = a4.length - 1, l = 0; k >= c3; --k) {
              if (47 === (e = a4.charCodeAt(k))) {
                if (!j2) {
                  h = k + 1;
                  break;
                }
                continue;
              }
              -1 === i && (j2 = false, i = k + 1), 46 === e ? -1 === g ? g = k : 1 !== l && (l = 1) : -1 !== g && (l = -1);
            }
            return -1 === g || -1 === i || 0 === l || 1 === l && g === i - 1 && g === h + 1 ? -1 !== i && (0 === h && f ? d3.base = d3.name = a4.slice(1, i) : d3.base = d3.name = a4.slice(h, i)) : (0 === h && f ? (d3.name = a4.slice(1, g), d3.base = a4.slice(1, i)) : (d3.name = a4.slice(h, g), d3.base = a4.slice(h, i)), d3.ext = a4.slice(g, i)), h > 0 ? d3.dir = a4.slice(0, h - 1) : f && (d3.dir = "/"), d3;
          }, sep: "/", delimiter: ":", win32: null, posix: null };
          d2.posix = d2, a3.exports = d2;
        } }, c = {};
        function d(a3) {
          var e = c[a3];
          if (void 0 !== e) return e.exports;
          var f = c[a3] = { exports: {} }, g = true;
          try {
            b2[a3](f, f.exports, d), g = false;
          } finally {
            g && delete c[a3];
          }
          return f.exports;
        }
        d.ab = "//", a2.exports = d(114);
      }();
    }, 9904: (a2, b2, c) => {
      "use strict";
      c.d(b2, { z: () => d });
      class d extends Error {
        constructor(a3, b3) {
          super("Invariant: " + (a3.endsWith(".") ? a3 : a3 + ".") + " This is a bug in Next.js.", b3), this.name = "InvariantError";
        }
      }
    }, 9965: (a2, b2, c) => {
      "use strict";
      c.d(b2, { iY: () => i });
      var d = c(8863), e = c(5237), f = c(9320), g = c(366), h = c(4430);
      function i(a3) {
        let b3, { abi: c2, args: i2 = [], name: j2 } = a3, k = (0, e.q)(j2, { strict: false }), l = c2.filter((a4) => k ? "function" === a4.type ? (0, h.V)(a4) === j2 : "event" === a4.type && (0, g.h)(a4) === j2 : "name" in a4 && a4.name === j2);
        if (0 !== l.length) {
          if (1 === l.length) return l[0];
          for (let a4 of l) {
            if ("inputs" in a4) {
              if (!i2 || 0 === i2.length) {
                if (!a4.inputs || 0 === a4.inputs.length) return a4;
                continue;
              }
              if (a4.inputs && 0 !== a4.inputs.length && a4.inputs.length === i2.length && i2.every((b4, c3) => {
                let d2 = "inputs" in a4 && a4.inputs[c3];
                return !!d2 && function a5(b5, c4) {
                  let d3 = typeof b5, e2 = c4.type;
                  switch (e2) {
                    case "address":
                      return (0, f.P)(b5, { strict: false });
                    case "bool":
                      return "boolean" === d3;
                    case "function":
                    case "string":
                      return "string" === d3;
                    default:
                      if ("tuple" === e2 && "components" in c4) return Object.values(c4.components).every((c5, e3) => "object" === d3 && a5(Object.values(b5)[e3], c5));
                      if (/^u?int(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/.test(e2)) return "number" === d3 || "bigint" === d3;
                      if (/^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/.test(e2)) return "string" === d3 || b5 instanceof Uint8Array;
                      if (/[a-z]+[1-9]{0,3}(\[[0-9]{0,}\])+$/.test(e2)) return Array.isArray(b5) && b5.every((b6) => a5(b6, { ...c4, type: e2.replace(/(\[[0-9]{0,}\])$/, "") }));
                      return false;
                  }
                }(b4, d2);
              })) {
                if (b3 && "inputs" in b3 && b3.inputs) {
                  let c3 = function a5(b4, c4, d2) {
                    for (let e2 in b4) {
                      let g2 = b4[e2], h2 = c4[e2];
                      if ("tuple" === g2.type && "tuple" === h2.type && "components" in g2 && "components" in h2) return a5(g2.components, h2.components, d2[e2]);
                      let i3 = [g2.type, h2.type];
                      if (i3.includes("address") && i3.includes("bytes20") || (i3.includes("address") && i3.includes("string") || i3.includes("address") && i3.includes("bytes")) && (0, f.P)(d2[e2], { strict: false })) return i3;
                    }
                  }(a4.inputs, b3.inputs, i2);
                  if (c3) throw new d.nM({ abiItem: a4, type: c3[0] }, { abiItem: b3, type: c3[1] });
                }
                b3 = a4;
              }
            }
          }
          return b3 || l[0];
        }
      }
    } }]);
  }
});
var node_buffer_exports = {};
var init_node_buffer = __esm2({
  "node-built-in-modules:node:buffer"() {
    __reExport(node_buffer_exports, node_buffer_star);
  }
});
var node_async_hooks_exports = {};
var init_node_async_hooks = __esm2({
  "node-built-in-modules:node:async_hooks"() {
    __reExport(node_async_hooks_exports, node_async_hooks_star);
  }
});
var require_route = __commonJS({
  ".next/server/app/api/erc8004/route.js"() {
    "use strict";
    (self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([[446], { 40: (a2, b2, c) => {
      "use strict";
      c.d(b2, { Dg: () => s, Ej: () => r, Fl: () => A, HT: () => j2, Ho: () => o, M7: () => p, Ro: () => t, Ty: () => v2, di: () => q2, ii: () => z2, oB: () => m, sH: () => n, tf: () => u, u: () => y, uK: () => l, xW: () => i, xb: () => k });
      var d = c(1493), e = c(2586), f = c(6215);
      let g = new TextEncoder(), h = Array.from({ length: 256 }, (a3, b3) => b3.toString(16).padStart(2, "0"));
      function i(...a3) {
        return `0x${a3.reduce((a4, b3) => a4 + b3.replace("0x", ""), "")}`;
      }
      function j2(a3) {
        return a3 instanceof Uint8Array ? l(a3) : Array.isArray(a3) ? l(new Uint8Array(a3)) : a3;
      }
      function k(a3, b3 = {}) {
        let c2 = `0x${Number(a3)}`;
        return "number" == typeof b3.size ? (e.Sl(c2, b3.size), o(c2, b3.size)) : c2;
      }
      function l(a3, b3 = {}) {
        let c2 = "";
        for (let b4 = 0; b4 < a3.length; b4++) c2 += h[a3[b4]];
        let d2 = `0x${c2}`;
        return "number" == typeof b3.size ? (e.Sl(d2, b3.size), p(d2, b3.size)) : d2;
      }
      function m(a3, b3 = {}) {
        let c2, { signed: d2, size: e2 } = b3, f2 = BigInt(a3);
        e2 ? c2 = d2 ? (1n << 8n * BigInt(e2) - 1n) - 1n : 2n ** (8n * BigInt(e2)) - 1n : "number" == typeof a3 && (c2 = BigInt(Number.MAX_SAFE_INTEGER));
        let g2 = "bigint" == typeof c2 && d2 ? -c2 - 1n : 0;
        if (c2 && f2 > c2 || f2 < g2) {
          let b4 = "bigint" == typeof a3 ? "n" : "";
          throw new v2({ max: c2 ? `${c2}${b4}` : void 0, min: `${g2}${b4}`, signed: d2, size: e2, value: `${a3}${b4}` });
        }
        let h2 = (d2 && f2 < 0 ? BigInt.asUintN(8 * e2, BigInt(f2)) : f2).toString(16), i2 = `0x${h2}`;
        return e2 ? o(i2, e2) : i2;
      }
      function n(a3, b3 = {}) {
        return l(g.encode(a3), b3);
      }
      function o(a3, b3) {
        return e.eV(a3, { dir: "left", size: b3 });
      }
      function p(a3, b3) {
        return e.eV(a3, { dir: "right", size: b3 });
      }
      function q2(a3, b3, c2, d2 = {}) {
        let { strict: f2 } = d2;
        e.kK(a3, b3);
        let g2 = `0x${a3.replace("0x", "").slice((b3 ?? 0) * 2, (c2 ?? a3.length) * 2)}`;
        return f2 && e.X(g2, b3, c2), g2;
      }
      function r(a3) {
        return Math.ceil((a3.length - 2) / 2);
      }
      function s(a3, b3 = {}) {
        let { signed: c2 } = b3;
        b3.size && e.Sl(a3, b3.size);
        let d2 = BigInt(a3);
        if (!c2) return d2;
        let f2 = (1n << 8n * BigInt((a3.length - 2) / 2)) - 1n;
        return d2 <= f2 >> 1n ? d2 : d2 - f2 - 1n;
      }
      function t(a3, b3 = {}) {
        let { signed: c2, size: d2 } = b3;
        return c2 || d2 ? Number(s(a3, b3)) : Number(a3);
      }
      function u(a3, b3 = {}) {
        let { strict: c2 = false } = b3;
        try {
          return !function(a4, b4 = {}) {
            let { strict: c3 = false } = b4;
            if (!a4 || "string" != typeof a4) throw new w2(a4);
            if (c3 && !/^0x[0-9a-fA-F]*$/.test(a4) || !a4.startsWith("0x")) throw new x2(a4);
          }(a3, { strict: c2 }), true;
        } catch {
          return false;
        }
      }
      class v2 extends d.C {
        constructor({ max: a3, min: b3, signed: c2, size: d2, value: e2 }) {
          super(`Number \`${e2}\` is not in safe${d2 ? ` ${8 * d2}-bit` : ""}${c2 ? " signed" : " unsigned"} integer range ${a3 ? `(\`${b3}\` to \`${a3}\`)` : `(above \`${b3}\`)`}`), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "Hex.IntegerOutOfRangeError" });
        }
      }
      d.C;
      class w2 extends d.C {
        constructor(a3) {
          super(`Value \`${"object" == typeof a3 ? f.As(a3) : a3}\` of type \`${typeof a3}\` is an invalid hex type.`, { metaMessages: ['Hex types must be represented as `"0x${string}"`.'] }), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "Hex.InvalidHexTypeError" });
        }
      }
      class x2 extends d.C {
        constructor(a3) {
          super(`Value \`${a3}\` is an invalid hex value.`, { metaMessages: ['Hex values must start with `"0x"` and contain only hexadecimal characters (0-9, a-f, A-F).'] }), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "Hex.InvalidHexValueError" });
        }
      }
      d.C;
      class y extends d.C {
        constructor({ givenSize: a3, maxSize: b3 }) {
          super(`Size cannot exceed \`${b3}\` bytes. Given size: \`${a3}\` bytes.`), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "Hex.SizeOverflowError" });
        }
      }
      class z2 extends d.C {
        constructor({ offset: a3, position: b3, size: c2 }) {
          super(`Slice ${"start" === b3 ? "starting" : "ending"} at offset \`${a3}\` is out-of-bounds (size: \`${c2}\`).`), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "Hex.SliceOffsetOutOfBoundsError" });
        }
      }
      class A extends d.C {
        constructor({ size: a3, targetSize: b3, type: c2 }) {
          super(`${c2.charAt(0).toUpperCase()}${c2.slice(1).toLowerCase()} size (\`${a3}\`) exceeds padding size (\`${b3}\`).`), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "Hex.SizeExceedsPaddingSizeError" });
        }
      }
    }, 279: (a2, b2, c) => {
      "use strict";
      c.d(b2, { X9: () => g, s7: () => e, x8: () => f });
      var d = c(3516);
      class e extends d.C {
        constructor({ signature: a3, type: b3 }) {
          super(`Invalid ${b3} signature.`, { details: a3 }), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "InvalidSignatureError" });
        }
      }
      class f extends d.C {
        constructor({ signature: a3 }) {
          super("Unknown signature.", { details: a3 }), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "UnknownSignatureError" });
        }
      }
      class g extends d.C {
        constructor({ signature: a3 }) {
          super("Invalid struct signature.", { details: a3, metaMessages: ["No properties exist."] }), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "InvalidStructSignatureError" });
        }
      }
    }, 291: (a2, b2, c) => {
      "use strict";
      c.d(b2, { e: () => h });
      var d = c(8863), e = c(9304), f = c(9965);
      let g = "/docs/contract/decodeFunctionResult";
      function h(a3) {
        let { abi: b3, args: c2, functionName: h2, data: i } = a3, j2 = b3[0];
        if (h2) {
          let a4 = (0, f.iY)({ abi: b3, args: c2, name: h2 });
          if (!a4) throw new d.Iz(h2, { docsPath: g });
          j2 = a4;
        }
        if ("function" !== j2.type) throw new d.Iz(void 0, { docsPath: g });
        if (!j2.outputs) throw new d.MR(j2.name, { docsPath: g });
        let k = (0, e.n)(j2.outputs, i);
        return k && k.length > 1 ? k : k && 1 === k.length ? k[0] : void 0;
      }
    }, 296: (a2, b2, c) => {
      "use strict";
      c.d(b2, { YE: () => f, rj: () => e });
      var d = c(1766);
      class e extends d.C {
        constructor({ blockNumber: a3, chain: b3, contract: c2 }) {
          super(`Chain "${b3.name}" does not support contract "${c2.name}".`, { metaMessages: ["This could be due to any of the following:", ...a3 && c2.blockCreated && c2.blockCreated > a3 ? [`- The contract "${c2.name}" was not deployed until block ${c2.blockCreated} (current block ${a3}).`] : [`- The chain does not have the contract "${c2.name}" configured.`]], name: "ChainDoesNotSupportContract" });
        }
      }
      d.C, d.C;
      class f extends d.C {
        constructor() {
          super("No chain was provided to the Client.", { name: "ClientChainNotConfiguredError" });
        }
      }
      d.C;
    }, 437: (a2, b2, c) => {
      "use strict";
      c.d(b2, { m: () => h });
      var d = c(8863), e = c(5290), f = c(494);
      let g = "/docs/contract/encodeDeployData";
      function h(a3) {
        let { abi: b3, args: c2, bytecode: h2 } = a3;
        if (!c2 || 0 === c2.length) return h2;
        let i = b3.find((a4) => "type" in a4 && "constructor" === a4.type);
        if (!i) throw new d.YW({ docsPath: g });
        if (!("inputs" in i) || !i.inputs || 0 === i.inputs.length) throw new d.YF({ docsPath: g });
        let j2 = (0, f.h)(i.inputs, c2);
        return (0, e.aP)([h2, j2]);
      }
    }, 493: (a2, b2, c) => {
      "use strict";
      c.d(b2, { d: () => g });
      var d = c(901), e = c(7653), f = c(6193);
      function g(a3, { docsPath: b3, ...c2 }) {
        let g2 = (() => {
          let b4 = (0, f.l)(a3, c2);
          return b4 instanceof e.RM ? a3 : b4;
        })();
        return new d.zX(g2, { docsPath: b3, ...c2 });
      }
    }, 840: (a2, b2, c) => {
      "use strict";
      c.d(b2, { Ci: () => g, J8: () => h, MU: () => i });
      var d = c(5934), e = c(1766), f = c(4728);
      class g extends e.C {
        constructor({ body: a3, cause: b3, details: c2, headers: e2, status: g2, url: h2 }) {
          super("HTTP request failed.", { cause: b3, details: c2, metaMessages: [g2 && `Status: ${g2}`, `URL: ${(0, f.ID)(h2)}`, a3 && `Request body: ${(0, d.A)(a3)}`].filter(Boolean), name: "HttpRequestError" }), Object.defineProperty(this, "body", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "headers", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "status", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "url", { enumerable: true, configurable: true, writable: true, value: void 0 }), this.body = a3, this.headers = e2, this.status = g2, this.url = h2;
        }
      }
      e.C;
      class h extends e.C {
        constructor({ body: a3, error: b3, url: c2 }) {
          super("RPC Request failed.", { cause: b3, details: b3.message, metaMessages: [`URL: ${(0, f.ID)(c2)}`, `Request body: ${(0, d.A)(a3)}`], name: "RpcRequestError" }), Object.defineProperty(this, "code", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "data", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "url", { enumerable: true, configurable: true, writable: true, value: void 0 }), this.code = b3.code, this.data = b3.data, this.url = c2;
        }
      }
      e.C;
      class i extends e.C {
        constructor({ body: a3, url: b3 }) {
          super("The request took too long to respond.", { details: "The request timed out.", metaMessages: [`URL: ${(0, f.ID)(b3)}`, `Request body: ${(0, d.A)(a3)}`], name: "TimeoutError" }), Object.defineProperty(this, "url", { enumerable: true, configurable: true, writable: true, value: void 0 }), this.url = b3;
        }
      }
    }, 901: (a2, b2, c) => {
      "use strict";
      c.d(b2, { zX: () => r, bG: () => s, M: () => t, rR: () => u, Po: () => v2, $S: () => w2 });
      var d = c(7848), e = c(9954), f = c(5555), g = c(9382), h = c(5934);
      function i({ abiItem: a3, args: b3, includeFunctionName: c2 = true, includeName: d2 = false }) {
        if ("name" in a3 && "inputs" in a3 && a3.inputs) return `${c2 ? a3.name : ""}(${a3.inputs.map((a4, c3) => `${d2 && a4.name ? `${a4.name}: ` : ""}${"object" == typeof b3[c3] ? (0, h.A)(b3[c3]) : b3[c3]}`).join(", ")})`;
      }
      var j2 = c(9965), k = c(7591), l = c(8367), m = c(8863), n = c(1766), o = c(7600), p = c(2133), q2 = c(4728);
      class r extends n.C {
        constructor(a3, { account: b3, docsPath: c2, chain: e2, data: f2, gas: g2, gasPrice: h2, maxFeePerGas: i2, maxPriorityFeePerGas: j3, nonce: m2, to: n2, value: q3, stateOverride: r2 }) {
          let s2 = b3 ? (0, d.J)(b3) : void 0, t2 = (0, p.aO)({ from: s2?.address, to: n2, value: void 0 !== q3 && `${(0, k.c)(q3)} ${e2?.nativeCurrency?.symbol || "ETH"}`, data: f2, gas: g2, gasPrice: void 0 !== h2 && `${(0, l.Q)(h2)} gwei`, maxFeePerGas: void 0 !== i2 && `${(0, l.Q)(i2)} gwei`, maxPriorityFeePerGas: void 0 !== j3 && `${(0, l.Q)(j3)} gwei`, nonce: m2 });
          r2 && (t2 += `
${(0, o.uj)(r2)}`), super(a3.shortMessage, { cause: a3, docsPath: c2, metaMessages: [...a3.metaMessages ? [...a3.metaMessages, " "] : [], "Raw Call Arguments:", t2].filter(Boolean), name: "CallExecutionError" }), Object.defineProperty(this, "cause", { enumerable: true, configurable: true, writable: true, value: void 0 }), this.cause = a3;
        }
      }
      class s extends n.C {
        constructor(a3, { abi: b3, args: c2, contractAddress: d2, docsPath: e2, functionName: f2, sender: h2 }) {
          let k2 = (0, j2.iY)({ abi: b3, args: c2, name: f2 }), l2 = k2 ? i({ abiItem: k2, args: c2, includeFunctionName: false, includeName: false }) : void 0, m2 = k2 ? (0, g.B)(k2, { includeName: true }) : void 0, n2 = (0, p.aO)({ address: d2 && (0, q2.RZ)(d2), function: m2, args: l2 && "()" !== l2 && `${[...Array(f2?.length ?? 0).keys()].map(() => " ").join("")}${l2}`, sender: h2 });
          super(a3.shortMessage || `An unknown error occurred while executing the contract function "${f2}".`, { cause: a3, docsPath: e2, metaMessages: [...a3.metaMessages ? [...a3.metaMessages, " "] : [], n2 && "Contract Call:", n2].filter(Boolean), name: "ContractFunctionExecutionError" }), Object.defineProperty(this, "abi", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "args", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "cause", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "contractAddress", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "formattedArgs", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "functionName", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "sender", { enumerable: true, configurable: true, writable: true, value: void 0 }), this.abi = b3, this.args = c2, this.cause = a3, this.contractAddress = d2, this.functionName = f2, this.sender = h2;
        }
      }
      class t extends n.C {
        constructor({ abi: a3, data: b3, functionName: c2, message: d2, cause: h2 }) {
          let j3, k2, l2, n2, o2;
          if (b3 && "0x" !== b3) try {
            let { abiItem: c3, errorName: d3, args: j4 } = k2 = (0, f.W)({ abi: a3, data: b3, cause: h2 });
            if ("Error" === d3) n2 = j4[0];
            else if ("Panic" === d3) {
              let [a4] = j4;
              n2 = e.fD[a4];
            } else {
              let a4 = c3 ? (0, g.B)(c3, { includeName: true }) : void 0, b4 = c3 && j4 ? i({ abiItem: c3, args: j4, includeFunctionName: false, includeName: false }) : void 0;
              l2 = [a4 ? `Error: ${a4}` : "", b4 && "()" !== b4 ? `       ${[...Array(d3?.length ?? 0).keys()].map(() => " ").join("")}${b4}` : ""];
            }
          } catch (a4) {
            j3 = a4;
          }
          else d2 && (n2 = d2);
          j3 instanceof m.Wq && (o2 = j3.signature, l2 = [`Unable to decode signature "${o2}" as it was not found on the provided ABI.`, "Make sure you are using the correct ABI and that the error exists on it.", `You can look up the decoded signature here: https://4byte.sourcify.dev/?q=${o2}.`]), super(n2 && "execution reverted" !== n2 || o2 ? [`The contract function "${c2}" reverted with the following ${o2 ? "signature" : "reason"}:`, n2 || o2].join("\n") : `The contract function "${c2}" reverted.`, { cause: j3 ?? h2, metaMessages: l2, name: "ContractFunctionRevertedError" }), Object.defineProperty(this, "data", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "raw", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "reason", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "signature", { enumerable: true, configurable: true, writable: true, value: void 0 }), this.data = k2, this.raw = b3, this.reason = n2, this.signature = o2;
        }
      }
      class u extends n.C {
        constructor({ functionName: a3, cause: b3 }) {
          super(`The contract function "${a3}" returned no data ("0x").`, { metaMessages: ["This could be due to any of the following:", `  - The contract does not have the function "${a3}",`, "  - The parameters passed to the contract function may be invalid, or", "  - The address is not a contract."], name: "ContractFunctionZeroDataError", cause: b3 });
        }
      }
      class v2 extends n.C {
        constructor({ factory: a3 }) {
          super(`Deployment for counterfactual contract call failed${a3 ? ` for factory "${a3}".` : ""}`, { metaMessages: ["Please ensure:", "- The `factory` is a valid contract deployment factory (ie. Create2 Factory, ERC-4337 Factory, etc).", "- The `factoryData` is a valid encoded function call for contract deployment function on the factory."], name: "CounterfactualDeploymentFailedError" });
        }
      }
      class w2 extends n.C {
        constructor({ data: a3, message: b3 }) {
          super(b3 || "", { name: "RawContractError" }), Object.defineProperty(this, "code", { enumerable: true, configurable: true, writable: true, value: 3 }), Object.defineProperty(this, "data", { enumerable: true, configurable: true, writable: true, value: void 0 }), this.data = a3;
        }
      }
    }, 1478: (a2, b2, c) => {
      "use strict";
      c.d(b2, { h: () => f });
      var d = c(8833), e = c(9320);
      function f(a3, b3) {
        if (!(0, e.P)(a3, { strict: false })) throw new d.M({ address: a3 });
        if (!(0, e.P)(b3, { strict: false })) throw new d.M({ address: b3 });
        return a3.toLowerCase() === b3.toLowerCase();
      }
    }, 1493: (a2, b2, c) => {
      "use strict";
      c.d(b2, { C: () => d });
      class d extends Error {
        static setStaticOptions(a3) {
          d.prototype.docsOrigin = a3.docsOrigin, d.prototype.showVersion = a3.showVersion, d.prototype.version = a3.version;
        }
        constructor(a3, b3 = {}) {
          let c2 = (() => {
            if (b3.cause instanceof d) {
              if (b3.cause.details) return b3.cause.details;
              if (b3.cause.shortMessage) return b3.cause.shortMessage;
            }
            return b3.cause && "details" in b3.cause && "string" == typeof b3.cause.details ? b3.cause.details : b3.cause?.message ? b3.cause.message : b3.details;
          })(), e = b3.cause instanceof d && b3.cause.docsPath || b3.docsPath, f = b3.docsOrigin ?? d.prototype.docsOrigin, g = `${f}${e ?? ""}`, h = !!(b3.version ?? d.prototype.showVersion), i = b3.version ?? d.prototype.version;
          super([a3 || "An error occurred.", ...b3.metaMessages ? ["", ...b3.metaMessages] : [], ...c2 || e || h ? ["", c2 ? `Details: ${c2}` : void 0, e ? `See: ${g}` : void 0, h ? `Version: ${i}` : void 0] : []].filter((a4) => "string" == typeof a4).join("\n"), b3.cause ? { cause: b3.cause } : void 0), Object.defineProperty(this, "details", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "docs", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "docsOrigin", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "docsPath", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "shortMessage", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "showVersion", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "version", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "cause", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "BaseError" }), this.cause = b3.cause, this.details = c2, this.docs = g, this.docsOrigin = f, this.docsPath = e, this.shortMessage = a3, this.showVersion = h, this.version = i;
        }
        walk(a3) {
          return function a4(b3, c2) {
            return c2?.(b3) ? b3 : b3 && "object" == typeof b3 && "cause" in b3 && b3.cause ? a4(b3.cause, c2) : c2 ? null : b3;
          }(this, a3);
        }
      }
      Object.defineProperty(d, "defaultStaticOptions", { enumerable: true, configurable: true, writable: true, value: { docsOrigin: "https://oxlib.sh", showVersion: false, version: "ox@0.1.1" } }), d.setStaticOptions(d.defaultStaticOptions);
    }, 1512: (a2, b2, c) => {
      "use strict";
      function d(a3, b3) {
        let c2 = a3.toString(), d2 = c2.startsWith("-");
        d2 && (c2 = c2.slice(1));
        let [e, f] = [(c2 = c2.padStart(b3, "0")).slice(0, c2.length - b3), c2.slice(c2.length - b3)];
        return f = f.replace(/(0+)$/, ""), `${d2 ? "-" : ""}${e || "0"}${f ? `.${f}` : ""}`;
      }
      c.d(b2, { J: () => d });
    }, 1863: (a2, b2, c) => {
      "use strict";
      c.d(b2, { B4: () => e, SK: () => f, hX: () => g });
      var d = c(1766);
      class e extends d.C {
        constructor({ offset: a3 }) {
          super(`Offset \`${a3}\` cannot be negative.`, { name: "NegativeOffsetError" });
        }
      }
      class f extends d.C {
        constructor({ length: a3, position: b3 }) {
          super(`Position \`${b3}\` is out of bounds (\`0 < position < ${a3}\`).`, { name: "PositionOutOfBoundsError" });
        }
      }
      class g extends d.C {
        constructor({ count: a3, limit: b3 }) {
          super(`Recursive read limit of \`${b3}\` exceeded (recursive read count: \`${a3}\`).`, { name: "RecursiveReadLimitExceededError" });
        }
      }
    }, 2133: (a2, b2, c) => {
      "use strict";
      c.d(b2, { $s: () => i, Kc: () => k, Kz: () => j2, Sq: () => l, Vg: () => h, WA: () => m, aO: () => g });
      var d = c(7591), e = c(8367), f = c(1766);
      function g(a3) {
        let b3 = Object.entries(a3).map(([a4, b4]) => void 0 === b4 || false === b4 ? null : [a4, b4]).filter(Boolean), c2 = b3.reduce((a4, [b4]) => Math.max(a4, b4.length), 0);
        return b3.map(([a4, b4]) => `  ${`${a4}:`.padEnd(c2 + 1)}  ${b4}`).join("\n");
      }
      f.C, f.C;
      class h extends f.C {
        constructor({ transaction: a3 }) {
          super("Cannot infer a transaction type from provided transaction.", { metaMessages: ["Provided Transaction:", "{", g(a3), "}", "", "To infer the type, either provide:", "- a `type` to the Transaction, or", "- an EIP-1559 Transaction with `maxFeePerGas`, or", "- an EIP-2930 Transaction with `gasPrice` & `accessList`, or", "- an EIP-4844 Transaction with `blobs`, `blobVersionedHashes`, `sidecars`, or", "- an EIP-7702 Transaction with `authorizationList`, or", "- a Legacy Transaction with `gasPrice`"], name: "InvalidSerializableTransactionError" });
        }
      }
      f.C, f.C, f.C;
      class i extends f.C {
        constructor(a3, { account: b3, docsPath: c2, chain: f2, data: h2, gas: i2, gasPrice: j3, maxFeePerGas: k2, maxPriorityFeePerGas: l2, nonce: m2, to: n, value: o }) {
          super(a3.shortMessage, { cause: a3, docsPath: c2, metaMessages: [...a3.metaMessages ? [...a3.metaMessages, " "] : [], "Request Arguments:", g({ chain: f2 && `${f2?.name} (id: ${f2?.id})`, from: b3?.address, to: n, value: void 0 !== o && `${(0, d.c)(o)} ${f2?.nativeCurrency?.symbol || "ETH"}`, data: h2, gas: i2, gasPrice: void 0 !== j3 && `${(0, e.Q)(j3)} gwei`, maxFeePerGas: void 0 !== k2 && `${(0, e.Q)(k2)} gwei`, maxPriorityFeePerGas: void 0 !== l2 && `${(0, e.Q)(l2)} gwei`, nonce: m2 })].filter(Boolean), name: "TransactionExecutionError" }), Object.defineProperty(this, "cause", { enumerable: true, configurable: true, writable: true, value: void 0 }), this.cause = a3;
        }
      }
      class j2 extends f.C {
        constructor({ blockHash: a3, blockNumber: b3, blockTag: c2, hash: d2, index: e2 }) {
          let f2 = "Transaction";
          c2 && void 0 !== e2 && (f2 = `Transaction at block time "${c2}" at index "${e2}"`), a3 && void 0 !== e2 && (f2 = `Transaction at block hash "${a3}" at index "${e2}"`), b3 && void 0 !== e2 && (f2 = `Transaction at block number "${b3}" at index "${e2}"`), d2 && (f2 = `Transaction with hash "${d2}"`), super(`${f2} could not be found.`, { name: "TransactionNotFoundError" });
        }
      }
      class k extends f.C {
        constructor({ hash: a3 }) {
          super(`Transaction receipt with hash "${a3}" could not be found. The Transaction may not be processed on a block yet.`, { name: "TransactionReceiptNotFoundError" });
        }
      }
      class l extends f.C {
        constructor({ receipt: a3 }) {
          super(`Transaction with hash "${a3.transactionHash}" reverted.`, { metaMessages: ['The receipt marked the transaction as "reverted". This could mean that the function on the contract you are trying to call threw an error.', " ", "You can attempt to extract the revert reason by:", "- calling the `simulateContract` or `simulateCalls` Action with the `abi` and `functionName` of the contract", "- using the `call` Action with raw `data`"], name: "TransactionReceiptRevertedError" }), Object.defineProperty(this, "receipt", { enumerable: true, configurable: true, writable: true, value: void 0 }), this.receipt = a3;
        }
      }
      class m extends f.C {
        constructor({ hash: a3 }) {
          super(`Timed out while waiting for transaction with hash "${a3}" to be confirmed.`, { name: "WaitForTransactionReceiptTimeoutError" });
        }
      }
    }, 2346: (a2, b2, c) => {
      "use strict";
      function d() {
        let a3 = () => void 0, b3 = () => void 0;
        return { promise: new Promise((c2, d2) => {
          a3 = c2, b3 = d2;
        }), resolve: a3, reject: b3 };
      }
      c.d(b2, { Y: () => d });
    }, 2586: (a2, b2, c) => {
      "use strict";
      c.d(b2, { Sl: () => e, X: () => g, eV: () => h, kK: () => f });
      var d = c(40);
      function e(a3, b3) {
        if (d.Ej(a3) > b3) throw new d.u({ givenSize: d.Ej(a3), maxSize: b3 });
      }
      function f(a3, b3) {
        if ("number" == typeof b3 && b3 > 0 && b3 > d.Ej(a3) - 1) throw new d.ii({ offset: b3, position: "start", size: d.Ej(a3) });
      }
      function g(a3, b3, c2) {
        if ("number" == typeof b3 && "number" == typeof c2 && d.Ej(a3) !== c2 - b3) throw new d.ii({ offset: c2, position: "end", size: d.Ej(a3) });
      }
      function h(a3, b3 = {}) {
        let { dir: c2, size: e2 = 32 } = b3;
        if (0 === e2) return a3;
        let f2 = a3.replace("0x", "");
        if (f2.length > 2 * e2) throw new d.Fl({ size: Math.ceil(f2.length / 2), targetSize: e2, type: "Hex" });
        return `0x${f2["right" === c2 ? "padEnd" : "padStart"](2 * e2, "0")}`;
      }
    }, 2696: (a2, b2, c) => {
      "use strict";
      c.d(b2, { A9: () => e, NO: () => h, Pj: () => i, dV: () => f, nx: () => j2, zd: () => g });
      var d = c(3516);
      d.C;
      class e extends d.C {
        constructor({ params: a3 }) {
          super("Failed to parse ABI parameters.", { details: `parseAbiParameters(${JSON.stringify(a3, null, 2)})`, docsPath: "/api/human#parseabiparameters-1" }), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "InvalidAbiParametersError" });
        }
      }
      class f extends d.C {
        constructor({ param: a3 }) {
          super("Invalid ABI parameter.", { details: a3 }), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "InvalidParameterError" });
        }
      }
      class g extends d.C {
        constructor({ param: a3, name: b3 }) {
          super("Invalid ABI parameter.", { details: a3, metaMessages: [`"${b3}" is a protected Solidity keyword. More info: https://docs.soliditylang.org/en/latest/cheatsheet.html`] }), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "SolidityProtectedKeywordError" });
        }
      }
      class h extends d.C {
        constructor({ param: a3, type: b3, modifier: c2 }) {
          super("Invalid ABI parameter.", { details: a3, metaMessages: [`Modifier "${c2}" not allowed${b3 ? ` in "${b3}" type` : ""}.`] }), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "InvalidModifierError" });
        }
      }
      class i extends d.C {
        constructor({ param: a3, type: b3, modifier: c2 }) {
          super("Invalid ABI parameter.", { details: a3, metaMessages: [`Modifier "${c2}" not allowed${b3 ? ` in "${b3}" type` : ""}.`, `Data location can only be specified for array, struct, or mapping types, but "${c2}" was given.`] }), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "InvalidFunctionModifierError" });
        }
      }
      class j2 extends d.C {
        constructor({ abiParameter: a3 }) {
          super("Invalid ABI parameter.", { details: JSON.stringify(a3, null, 2), metaMessages: ["ABI parameter type is invalid."] }), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "InvalidAbiTypeParameterError" });
        }
      }
    }, 2934: (a2, b2, c) => {
      "use strict";
      c.d(b2, { Bv: () => f });
      var d = c(3375);
      let e = { legacy: "0x0", eip2930: "0x1", eip1559: "0x2", eip4844: "0x3", eip7702: "0x4" };
      function f(a3, b3) {
        let c2 = {};
        return void 0 !== a3.authorizationList && (c2.authorizationList = a3.authorizationList.map((a4) => ({ address: a4.address, r: a4.r ? (0, d.cK)(BigInt(a4.r)) : a4.r, s: a4.s ? (0, d.cK)(BigInt(a4.s)) : a4.s, chainId: (0, d.cK)(a4.chainId), nonce: (0, d.cK)(a4.nonce), ...void 0 !== a4.yParity ? { yParity: (0, d.cK)(a4.yParity) } : {}, ...void 0 !== a4.v && void 0 === a4.yParity ? { v: (0, d.cK)(a4.v) } : {} }))), void 0 !== a3.accessList && (c2.accessList = a3.accessList), void 0 !== a3.blobVersionedHashes && (c2.blobVersionedHashes = a3.blobVersionedHashes), void 0 !== a3.blobs && ("string" != typeof a3.blobs[0] ? c2.blobs = a3.blobs.map((a4) => (0, d.My)(a4)) : c2.blobs = a3.blobs), void 0 !== a3.data && (c2.data = a3.data), a3.account && (c2.from = a3.account.address), void 0 !== a3.from && (c2.from = a3.from), void 0 !== a3.gas && (c2.gas = (0, d.cK)(a3.gas)), void 0 !== a3.gasPrice && (c2.gasPrice = (0, d.cK)(a3.gasPrice)), void 0 !== a3.maxFeePerBlobGas && (c2.maxFeePerBlobGas = (0, d.cK)(a3.maxFeePerBlobGas)), void 0 !== a3.maxFeePerGas && (c2.maxFeePerGas = (0, d.cK)(a3.maxFeePerGas)), void 0 !== a3.maxPriorityFeePerGas && (c2.maxPriorityFeePerGas = (0, d.cK)(a3.maxPriorityFeePerGas)), void 0 !== a3.nonce && (c2.nonce = (0, d.cK)(a3.nonce)), void 0 !== a3.to && (c2.to = a3.to), void 0 !== a3.type && (c2.type = e[a3.type]), void 0 !== a3.value && (c2.value = (0, d.cK)(a3.value)), c2;
      }
    }, 3490: (a2, b2, c) => {
      "use strict";
      c.d(b2, { e: () => l });
      var d = c(1871), e = c(3816), f = c(2696), g = c(279), h = c(3516);
      class i extends h.C {
        constructor({ type: a3 }) {
          super("Circular reference detected.", { metaMessages: [`Struct "${a3}" is a circular reference.`] }), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "CircularReferenceError" });
        }
      }
      var j2 = c(8971), k = c(6678);
      function l(a3) {
        let b3 = {}, c2 = a3.length;
        for (let d2 = 0; d2 < c2; d2++) {
          let c3 = a3[d2];
          if (!(0, j2.WL)(c3)) continue;
          let e2 = (0, j2.FO)(c3);
          if (!e2) throw new g.s7({ signature: c3, type: "struct" });
          let f2 = e2.properties.split(";"), h3 = [], i2 = f2.length;
          for (let a4 = 0; a4 < i2; a4++) {
            let b4 = f2[a4].trim();
            if (!b4) continue;
            let c4 = (0, k.Pj)(b4, { type: "struct" });
            h3.push(c4);
          }
          if (!h3.length) throw new g.X9({ signature: c3 });
          b3[e2.name] = h3;
        }
        let h2 = {}, l2 = Object.entries(b3), n = l2.length;
        for (let a4 = 0; a4 < n; a4++) {
          let [c3, g2] = l2[a4];
          h2[c3] = function a5(b4 = [], c4 = {}, g3 = /* @__PURE__ */ new Set()) {
            let h3 = [], j3 = b4.length;
            for (let l3 = 0; l3 < j3; l3++) {
              let j4 = b4[l3];
              if (d.wj.test(j4.type)) h3.push(j4);
              else {
                let b5 = (0, d.Yv)(m, j4.type);
                if (!b5?.type) throw new f.nx({ abiParameter: j4 });
                let { array: l4, type: n2 } = b5;
                if (n2 in c4) {
                  if (g3.has(n2)) throw new i({ type: n2 });
                  h3.push({ ...j4, type: `tuple${l4 ?? ""}`, components: a5(c4[n2], c4, /* @__PURE__ */ new Set([...g3, n2])) });
                } else if ((0, k._o)(n2)) h3.push(j4);
                else throw new e.zz({ type: n2 });
              }
            }
            return h3;
          }(g2, b3);
        }
        return h2;
      }
      let m = /^(?<type>[a-zA-Z$_][a-zA-Z0-9$_]*)(?<array>(?:\[\d*?\])+?)?$/;
    }, 3516: (a2, b2, c) => {
      "use strict";
      c.d(b2, { C: () => d });
      class d extends Error {
        constructor(a3, b3 = {}) {
          let c2 = b3.cause instanceof d ? b3.cause.details : b3.cause?.message ? b3.cause.message : b3.details, e = b3.cause instanceof d && b3.cause.docsPath || b3.docsPath;
          super([a3 || "An error occurred.", "", ...b3.metaMessages ? [...b3.metaMessages, ""] : [], ...e ? [`Docs: https://abitype.dev${e}`] : [], ...c2 ? [`Details: ${c2}`] : [], "Version: abitype@1.2.3"].join("\n")), Object.defineProperty(this, "details", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "docsPath", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "metaMessages", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "shortMessage", { enumerable: true, configurable: true, writable: true, value: void 0 }), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "AbiTypeError" }), b3.cause && (this.cause = b3.cause), this.details = c2, this.docsPath = e, this.metaMessages = b3.metaMessages, this.shortMessage = a3;
        }
      }
    }, 3694: (a2, b2, c) => {
      "use strict";
      c.d(b2, { c: () => i });
      var d = c(7848);
      let e = 2n ** 256n - 1n;
      var f = c(8833), g = c(7653), h = c(9320);
      function i(a3) {
        let { account: b3, maxFeePerGas: c2, maxPriorityFeePerGas: i2, to: j2 } = a3, k = b3 ? (0, d.J)(b3) : void 0;
        if (k && !(0, h.P)(k.address)) throw new f.M({ address: k.address });
        if (j2 && !(0, h.P)(j2)) throw new f.M({ address: j2 });
        if (c2 && c2 > e) throw new g.BG({ maxFeePerGas: c2 });
        if (i2 && c2 && i2 > c2) throw new g.lN({ maxFeePerGas: c2, maxPriorityFeePerGas: i2 });
      }
    }, 3722: (a2, b2, c) => {
      "use strict";
      c.d(b2, { yH: () => j2 });
      var d = c(8833), e = c(329), f = c(7600), g = c(9320), h = c(3375);
      function i(a3) {
        if (a3 && 0 !== a3.length) return a3.reduce((a4, { slot: b3, value: c2 }) => {
          if (66 !== b3.length) throw new e.NV({ size: b3.length, targetSize: 66, type: "hex" });
          if (66 !== c2.length) throw new e.NV({ size: c2.length, targetSize: 66, type: "hex" });
          return a4[b3] = c2, a4;
        }, {});
      }
      function j2(a3) {
        if (!a3) return;
        let b3 = {};
        for (let { address: c2, ...e2 } of a3) {
          if (!(0, g.P)(c2, { strict: false })) throw new d.M({ address: c2 });
          if (b3[c2]) throw new f.Hi({ address: c2 });
          b3[c2] = function(a4) {
            let { balance: b4, nonce: c3, state: d2, stateDiff: e3, code: g2 } = a4, j3 = {};
            if (void 0 !== g2 && (j3.code = g2), void 0 !== b4 && (j3.balance = (0, h.cK)(b4)), void 0 !== c3 && (j3.nonce = (0, h.cK)(c3)), void 0 !== d2 && (j3.state = i(d2)), void 0 !== e3) {
              if (j3.state) throw new f.ft();
              j3.stateDiff = i(e3);
            }
            return j3;
          }(e2);
        }
        return b3;
      }
    }, 3736: (a2, b2, c) => {
      "use strict";
      c.d(b2, { Ag: () => g, E5: () => l, Rm: () => j2, SJ: () => i, UW: () => k, b2: () => e, oX: () => h, v2: () => d });
      let d = [{ inputs: [{ components: [{ name: "target", type: "address" }, { name: "allowFailure", type: "bool" }, { name: "callData", type: "bytes" }], name: "calls", type: "tuple[]" }], name: "aggregate3", outputs: [{ components: [{ name: "success", type: "bool" }, { name: "returnData", type: "bytes" }], name: "returnData", type: "tuple[]" }], stateMutability: "view", type: "function" }, { inputs: [{ name: "addr", type: "address" }], name: "getEthBalance", outputs: [{ name: "balance", type: "uint256" }], stateMutability: "view", type: "function" }, { inputs: [], name: "getCurrentBlockTimestamp", outputs: [{ internalType: "uint256", name: "timestamp", type: "uint256" }], stateMutability: "view", type: "function" }], e = [{ name: "query", type: "function", stateMutability: "view", inputs: [{ type: "tuple[]", name: "queries", components: [{ type: "address", name: "sender" }, { type: "string[]", name: "urls" }, { type: "bytes", name: "data" }] }], outputs: [{ type: "bool[]", name: "failures" }, { type: "bytes[]", name: "responses" }] }, { name: "HttpError", type: "error", inputs: [{ type: "uint16", name: "status" }, { type: "string", name: "message" }] }], f = [{ inputs: [{ name: "dns", type: "bytes" }], name: "DNSDecodingFailed", type: "error" }, { inputs: [{ name: "ens", type: "string" }], name: "DNSEncodingFailed", type: "error" }, { inputs: [], name: "EmptyAddress", type: "error" }, { inputs: [{ name: "status", type: "uint16" }, { name: "message", type: "string" }], name: "HttpError", type: "error" }, { inputs: [], name: "InvalidBatchGatewayResponse", type: "error" }, { inputs: [{ name: "errorData", type: "bytes" }], name: "ResolverError", type: "error" }, { inputs: [{ name: "name", type: "bytes" }, { name: "resolver", type: "address" }], name: "ResolverNotContract", type: "error" }, { inputs: [{ name: "name", type: "bytes" }], name: "ResolverNotFound", type: "error" }, { inputs: [{ name: "primary", type: "string" }, { name: "primaryAddress", type: "bytes" }], name: "ReverseAddressMismatch", type: "error" }, { inputs: [{ internalType: "bytes4", name: "selector", type: "bytes4" }], name: "UnsupportedResolverProfile", type: "error" }], g = [...f, { name: "resolveWithGateways", type: "function", stateMutability: "view", inputs: [{ name: "name", type: "bytes" }, { name: "data", type: "bytes" }, { name: "gateways", type: "string[]" }], outputs: [{ name: "", type: "bytes" }, { name: "address", type: "address" }] }], h = [...f, { name: "reverseWithGateways", type: "function", stateMutability: "view", inputs: [{ type: "bytes", name: "reverseName" }, { type: "uint256", name: "coinType" }, { type: "string[]", name: "gateways" }], outputs: [{ type: "string", name: "resolvedName" }, { type: "address", name: "resolver" }, { type: "address", name: "reverseResolver" }] }], i = [{ name: "text", type: "function", stateMutability: "view", inputs: [{ name: "name", type: "bytes32" }, { name: "key", type: "string" }], outputs: [{ name: "", type: "string" }] }], j2 = [{ name: "addr", type: "function", stateMutability: "view", inputs: [{ name: "name", type: "bytes32" }], outputs: [{ name: "", type: "address" }] }, { name: "addr", type: "function", stateMutability: "view", inputs: [{ name: "name", type: "bytes32" }, { name: "coinType", type: "uint256" }], outputs: [{ name: "", type: "bytes" }] }], k = [{ name: "isValidSignature", type: "function", stateMutability: "view", inputs: [{ name: "hash", type: "bytes32" }, { name: "signature", type: "bytes" }], outputs: [{ name: "", type: "bytes4" }] }], l = [{ inputs: [{ name: "_signer", type: "address" }, { name: "_hash", type: "bytes32" }, { name: "_signature", type: "bytes" }], stateMutability: "nonpayable", type: "constructor" }, { inputs: [{ name: "_signer", type: "address" }, { name: "_hash", type: "bytes32" }, { name: "_signature", type: "bytes" }], outputs: [{ type: "bool" }], stateMutability: "nonpayable", type: "function", name: "isValidSig" }];
    }, 3777: (a2, b2, c) => {
      "use strict";
      c.d(b2, { T: () => B2 });
      var d = c(8971), e = c(3490), f = c(6678);
      function g(a3) {
        let b3 = (0, e.e)(a3), c2 = [], g2 = a3.length;
        for (let e2 = 0; e2 < g2; e2++) {
          let g3 = a3[e2];
          (0, d.WL)(g3) || c2.push((0, f.uT)(g3, b3));
        }
        return c2;
      }
      var h = c(8144), i = c(7848), j2 = c(3736), k = c(6788), l = c(1766), m = c(296), n = c(901), o = c(4728), p = c(291), q2 = c(437), r = c(830), s = c(1478), t = c(3862), u = c(7968), v2 = c(493), w2 = c(5590), x2 = c(2934), y = c(4932), z2 = c(3722), A = c(3694);
      async function B2(a3, b3) {
        let { account: d2 = a3.account, authorizationList: e2, batch: f2 = !!a3.batch?.multicall, blockHash: j3, blockNumber: p2, blockTag: r2 = a3.experimental_blockTag ?? "latest", requireCanonical: u2, accessList: y2, blobs: B3, blockOverrides: C3, code: D3, data: H, factory: I2, factoryData: J2, gas: K2, gasPrice: L2, maxFeePerBlobGas: M, maxFeePerGas: N, maxPriorityFeePerGas: O2, nonce: P2, requestOptions: Q2, to: R2, value: S, stateOverride: T2, ...U2 } = b3, V2 = d2 ? (0, i.J)(d2) : void 0;
        if (D3 && (I2 || J2)) throw new l.C("Cannot provide both `code` & `factory`/`factoryData` as parameters.");
        if (D3 && R2) throw new l.C("Cannot provide both `code` & `to` as parameters.");
        let W2 = D3 && H, X = I2 && J2 && R2 && H, Y2 = W2 || X, Z = W2 ? G2({ code: D3, data: H }) : X ? function(a4) {
          let { data: b4, factory: c2, factoryData: d3, to: e3 } = a4;
          return (0, q2.m)({ abi: g(["constructor(address, bytes, address, bytes)"]), bytecode: k.WN, args: [e3, b4, c2, d3] });
        }({ data: H, factory: I2, factoryData: J2, to: R2 }) : H;
        try {
          (0, A.c)(b3);
          let c2 = (0, t.O)({ blockHash: j3, blockNumber: p2, blockTag: r2, requireCanonical: u2 }), d3 = C3 ? h.J(C3) : void 0, g2 = (0, z2.yH)(T2), i2 = a3.chain?.formatters?.transactionRequest?.format, k2 = (i2 || x2.Bv)({ ...(0, w2.o)(U2, { format: i2 }), accessList: y2, account: V2, authorizationList: e2, blobs: B3, data: Z, gas: K2, gasPrice: L2, maxFeePerBlobGas: M, maxFeePerGas: N, maxPriorityFeePerGas: O2, nonce: P2, to: Y2 ? void 0 : R2, value: S }, "call");
          if (f2 && function({ request: a4 }) {
            let { data: b4, to: c3, ...d4 } = a4;
            return !(!b4 || b4.startsWith("0x82ad56cb")) && !!c3 && !(Object.values(d4).filter((a5) => void 0 !== a5).length > 0);
          }({ request: k2 }) && !d3 && void 0 === j3) try {
            var $, _2;
            let { deployless: b4 = false } = "object" == typeof a3.batch?.multicall ? a3.batch.multicall : {}, c3 = F2(a3, { blockNumber: p2, deployless: b4 });
            if (!c3 || ($ = g2, _2 = c3, !($ && Object.keys($).some((a4) => (0, s.h)(a4, _2))))) return await E(a3, { ...k2, blockHash: j3, blockNumber: p2, blockTag: r2, multicallAddress: c3, requestOptions: Q2, requireCanonical: u2, rpcStateOverride: g2 });
          } catch (a4) {
            if (!(a4 instanceof m.YE) && !(a4 instanceof m.rj)) throw a4;
          }
          let l2 = (() => {
            let a4 = [k2, c2];
            return g2 && d3 ? [...a4, g2, d3] : g2 ? [...a4, g2] : d3 ? [...a4, {}, d3] : a4;
          })(), n2 = await a3.request({ method: "eth_call", params: l2 }, Q2);
          if ("0x" === n2) return { data: void 0 };
          return { data: n2 };
        } catch (g2) {
          if (Q2?.signal?.aborted) throw (0, o.TY)(Q2.signal);
          if ((0, o.zf)(g2)) throw g2;
          let d3 = function(a4) {
            if (!(a4 instanceof l.C)) return;
            let b4 = a4.walk();
            return "object" == typeof b4?.data ? b4.data?.data : b4.data;
          }(g2), { offchainLookup: e3, offchainLookupSignature: f3 } = await Promise.resolve().then(c.bind(c, 7762));
          if (false !== a3.ccipRead && d3?.slice(0, 10) === f3 && R2) return { data: await e3(a3, { data: d3, requestOptions: Q2, to: R2 }) };
          if (Y2 && d3?.slice(0, 10) === "0x101bb98d") throw new n.Po({ factory: I2 });
          throw (0, v2.d)(g2, { ...b3, account: V2, chain: a3.chain });
        }
      }
      let C2 = 0, D2 = /* @__PURE__ */ new WeakMap();
      async function E(a3, b3) {
        let { batchSize: c2 = 1024, deployless: d2 = false, wait: e2 = 0 } = "object" == typeof a3.batch?.multicall ? a3.batch.multicall : {}, { blockHash: f2, blockNumber: g2, blockTag: h2 = a3.experimental_blockTag ?? "latest", requireCanonical: i2, data: l2, multicallAddress: m2, requestOptions: o2, rpcStateOverride: q3, to: s2 } = b3, u2 = void 0 !== m2 ? m2 : F2(a3, { blockNumber: g2, deployless: d2 }), v3 = (0, t.O)({ blockHash: f2, blockNumber: g2, blockTag: h2, requireCanonical: i2 }), w3 = "string" == typeof v3 ? v3 : JSON.stringify(v3), x3 = q3 ? `.${JSON.stringify(q3)}` : "", { schedule: z3 } = (0, y.u)({ id: `${a3.uid}.${w3}.${function(a4) {
          if (!a4) return "default";
          let b4 = D2.get(a4);
          if (void 0 !== b4) return b4;
          let c3 = C2++;
          return D2.set(a4, c3), c3;
        }(o2)}${x3}`, wait: e2, shouldSplitBatch: (a4) => a4.reduce((a5, { data: b4 }) => a5 + (b4.length - 2), 0) > 2 * c2, fn: async (b4) => {
          let c3 = b4.map((a4) => ({ allowFailure: true, callData: a4.data, target: a4.to })), d3 = (0, r.p)({ abi: j2.v2, args: [c3], functionName: "aggregate3" }), e3 = { ...null === u2 ? { data: G2({ code: k.Ez, data: d3 }) } : { to: u2, data: d3 } }, f3 = await a3.request({ method: "eth_call", params: q3 ? [e3, v3, q3] : [e3, v3] }, o2);
          return (0, p.e)({ abi: j2.v2, args: [c3], functionName: "aggregate3", data: f3 || "0x" });
        } }), [{ returnData: A2, success: B3 }] = await z3({ data: l2, to: s2 });
        if (!B3) throw new n.$S({ data: A2 });
        return "0x" === A2 ? { data: void 0 } : { data: A2 };
      }
      function F2(a3, b3) {
        let { blockNumber: c2, deployless: d2 } = b3;
        if (d2) return null;
        if (a3.chain) return (0, u.M)({ blockNumber: c2, chain: a3.chain, contract: "multicall3" });
        throw new m.YE();
      }
      function G2(a3) {
        let { code: b3, data: c2 } = a3;
        return (0, q2.m)({ abi: g(["constructor(bytes, bytes)"]), bytecode: k.LX, args: [b3, c2] });
      }
    }, 3816: (a2, b2, c) => {
      "use strict";
      c.d(b2, { UG: () => g, xo: () => e, zz: () => f });
      var d = c(3516);
      class e extends d.C {
        constructor({ signature: a3 }) {
          super("Failed to parse ABI item.", { details: `parseAbiItem(${JSON.stringify(a3, null, 2)})`, docsPath: "/api/human#parseabiitem-1" }), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "InvalidAbiItemError" });
        }
      }
      class f extends d.C {
        constructor({ type: a3 }) {
          super("Unknown type.", { metaMessages: [`Type "${a3}" is not a valid ABI type. Perhaps you forgot to include a struct signature?`] }), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "UnknownTypeError" });
        }
      }
      class g extends d.C {
        constructor({ type: a3 }) {
          super("Unknown type.", { metaMessages: [`Type "${a3}" is not a valid ABI type.`] }), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "UnknownSolidityTypeError" });
        }
      }
    }, 3862: (a2, b2, c) => {
      "use strict";
      c.d(b2, { O: () => f });
      var d = c(1766), e = c(3375);
      function f(a3) {
        let { blockHash: b3, blockNumber: c2, blockTag: f2, requireCanonical: g } = a3;
        if (void 0 !== g && !b3) throw new d.C("`requireCanonical` can only be provided when `blockHash` is set.");
        return b3 ? g ? { blockHash: b3, requireCanonical: g } : { blockHash: b3 } : "bigint" == typeof c2 ? (0, e.cK)(c2) : f2 ?? "latest";
      }
    }, 4728: (a2, b2, c) => {
      "use strict";
      c.d(b2, { ID: () => g, RZ: () => d, TY: () => e, zf: () => f });
      let d = (a3) => a3;
      function e(a3) {
        if (a3?.reason) return a3.reason;
        if ("function" == typeof DOMException) return new DOMException("This operation was aborted", "AbortError");
        let b3 = Error("This operation was aborted");
        return b3.name = "AbortError", b3;
      }
      function f(a3) {
        return "object" == typeof a3 && null !== a3 && "name" in a3 && "AbortError" === a3.name;
      }
      let g = (a3) => {
        try {
          let b3 = new URL(a3);
          if (!b3.username && !b3.password) return a3;
          return b3.username = "", b3.password = "", b3.toString();
        } catch {
          return a3;
        }
      };
    }, 4932: (a2, b2, c) => {
      "use strict";
      c.d(b2, { u: () => f });
      var d = c(2346);
      let e = /* @__PURE__ */ new Map();
      function f({ fn: a3, id: b3, shouldSplitBatch: c2, wait: f2 = 0, sort: g }) {
        let h = async () => {
          let b4 = j2();
          i();
          let c3 = b4.map(({ args: a4 }) => a4);
          0 !== c3.length && a3(c3).then((a4) => {
            g && Array.isArray(a4) && a4.sort(g);
            for (let c4 = 0; c4 < b4.length; c4++) {
              let { resolve: d2 } = b4[c4];
              d2?.([a4[c4], a4]);
            }
          }).catch((a4) => {
            for (let c4 = 0; c4 < b4.length; c4++) {
              let { reject: d2 } = b4[c4];
              d2?.(a4);
            }
          });
        }, i = () => e.delete(b3), j2 = () => e.get(b3) || [], k = (a4) => e.set(b3, [...j2(), a4]);
        return { flush: i, async schedule(a4) {
          let { promise: b4, resolve: e2, reject: g2 } = (0, d.Y)();
          return (c2?.([...j2().map(({ args: a5 }) => a5), a4]) && h(), j2().length > 0) ? k({ args: a4, resolve: e2, reject: g2 }) : (k({ args: a4, resolve: e2, reject: g2 }), setTimeout(h, f2)), b4;
        } };
      }
    }, 5165: (a2, b2, c) => {
      "use strict";
      c.d(b2, { eL: () => d, sz: () => e });
      let d = { gwei: 9, wei: 18 }, e = { ether: -9, wei: 9 };
    }, 5356: (a2) => {
      "use strict";
      a2.exports = (init_node_buffer(), __toCommonJS(node_buffer_exports));
    }, 5521: (a2) => {
      "use strict";
      a2.exports = (init_node_async_hooks(), __toCommonJS(node_async_hooks_exports));
    }, 5555: (a2, b2, c) => {
      "use strict";
      c.d(b2, { W: () => j2 });
      var d = c(9954), e = c(8863), f = c(5022), g = c(4430), h = c(9304), i = c(9382);
      function j2(a3) {
        let { abi: b3, data: c2, cause: j3 } = a3, k = (0, f.di)(c2, 0, 4);
        if ("0x" === k) throw new e.O({ cause: j3 });
        let l = [...b3 || [], d.Mc, d.J9].find((a4) => "error" === a4.type && k === (0, g.V)((0, i.B)(a4)));
        if (!l) throw new e.Wq(k, { docsPath: "/docs/contract/decodeErrorResult", cause: j3 });
        return { abiItem: l, args: "inputs" in l && l.inputs && l.inputs.length > 0 ? (0, h.n)(l.inputs, (0, f.di)(c2, 4)) : void 0, errorName: l.name };
      }
    }, 5590: (a2, b2, c) => {
      "use strict";
      function d(a3, { format: b3 }) {
        if (!b3) return {};
        let c2 = {};
        return !function b4(d2) {
          for (let e of Object.keys(d2)) e in a3 && (c2[e] = a3[e]), d2[e] && "object" == typeof d2[e] && !Array.isArray(d2[e]) && b4(d2[e]);
        }(b3(a3 || {})), c2;
      }
      c.d(b2, { o: () => d });
    }, 5867: (a2, b2, c) => {
      "use strict";
      c.d(b2, { secp256k1: () => ay });
      var d = c(7809), e = c(4890);
      class f extends e.Vw {
        constructor(a3, b3) {
          super(), this.finished = false, this.destroyed = false, (0, e.sd)(a3);
          let c2 = (0, e.ZJ)(b3);
          if (this.iHash = a3.create(), "function" != typeof this.iHash.update) throw Error("Expected instance of class which extends utils.Hash");
          this.blockLen = this.iHash.blockLen, this.outputLen = this.iHash.outputLen;
          let d2 = this.blockLen, f2 = new Uint8Array(d2);
          f2.set(c2.length > d2 ? a3.create().update(c2).digest() : c2);
          for (let a4 = 0; a4 < f2.length; a4++) f2[a4] ^= 54;
          this.iHash.update(f2), this.oHash = a3.create();
          for (let a4 = 0; a4 < f2.length; a4++) f2[a4] ^= 106;
          this.oHash.update(f2), (0, e.uH)(f2);
        }
        update(a3) {
          return (0, e.CC)(this), this.iHash.update(a3), this;
        }
        digestInto(a3) {
          (0, e.CC)(this), (0, e.DO)(a3, this.outputLen), this.finished = true, this.iHash.digestInto(a3), this.oHash.update(a3), this.oHash.digestInto(a3), this.destroy();
        }
        digest() {
          let a3 = new Uint8Array(this.oHash.outputLen);
          return this.digestInto(a3), a3;
        }
        _cloneInto(a3) {
          a3 || (a3 = Object.create(Object.getPrototypeOf(this), {}));
          let { oHash: b3, iHash: c2, finished: d2, destroyed: e2, blockLen: f2, outputLen: g2 } = this;
          return a3.finished = d2, a3.destroyed = e2, a3.blockLen = f2, a3.outputLen = g2, a3.oHash = b3._cloneInto(a3.oHash), a3.iHash = c2._cloneInto(a3.iHash), a3;
        }
        clone() {
          return this._cloneInto();
        }
        destroy() {
          this.destroyed = true, this.oHash.destroy(), this.iHash.destroy();
        }
      }
      let g = (a3, b3, c2) => new f(a3, b3).update(c2).digest();
      g.create = (a3, b3) => new f(a3, b3);
      let h = BigInt(0), i = BigInt(1);
      function j2(a3) {
        return a3 instanceof Uint8Array || ArrayBuffer.isView(a3) && "Uint8Array" === a3.constructor.name;
      }
      function k(a3) {
        if (!j2(a3)) throw Error("Uint8Array expected");
      }
      function l(a3, b3) {
        if ("boolean" != typeof b3) throw Error(a3 + " boolean expected, got " + b3);
      }
      function m(a3) {
        let b3 = a3.toString(16);
        return 1 & b3.length ? "0" + b3 : b3;
      }
      function n(a3) {
        if ("string" != typeof a3) throw Error("hex string expected, got " + typeof a3);
        return "" === a3 ? h : BigInt("0x" + a3);
      }
      let o = "function" == typeof Uint8Array.from([]).toHex && "function" == typeof Uint8Array.fromHex, p = Array.from({ length: 256 }, (a3, b3) => b3.toString(16).padStart(2, "0"));
      function q2(a3) {
        if (k(a3), o) return a3.toHex();
        let b3 = "";
        for (let c2 = 0; c2 < a3.length; c2++) b3 += p[a3[c2]];
        return b3;
      }
      let r = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
      function s(a3) {
        return a3 >= r._0 && a3 <= r._9 ? a3 - r._0 : a3 >= r.A && a3 <= r.F ? a3 - (r.A - 10) : a3 >= r.a && a3 <= r.f ? a3 - (r.a - 10) : void 0;
      }
      function t(a3) {
        if ("string" != typeof a3) throw Error("hex string expected, got " + typeof a3);
        if (o) return Uint8Array.fromHex(a3);
        let b3 = a3.length, c2 = b3 / 2;
        if (b3 % 2) throw Error("hex string expected, got unpadded hex of length " + b3);
        let d2 = new Uint8Array(c2);
        for (let b4 = 0, e2 = 0; b4 < c2; b4++, e2 += 2) {
          let c3 = s(a3.charCodeAt(e2)), f2 = s(a3.charCodeAt(e2 + 1));
          if (void 0 === c3 || void 0 === f2) throw Error('hex string expected, got non-hex character "' + (a3[e2] + a3[e2 + 1]) + '" at index ' + e2);
          d2[b4] = 16 * c3 + f2;
        }
        return d2;
      }
      function u(a3) {
        return n(q2(a3));
      }
      function v2(a3) {
        return k(a3), n(q2(Uint8Array.from(a3).reverse()));
      }
      function w2(a3, b3) {
        return t(a3.toString(16).padStart(2 * b3, "0"));
      }
      function x2(a3, b3) {
        return w2(a3, b3).reverse();
      }
      function y(a3, b3, c2) {
        let d2;
        if ("string" == typeof b3) try {
          d2 = t(b3);
        } catch (b4) {
          throw Error(a3 + " must be hex string or Uint8Array, cause: " + b4);
        }
        else if (j2(b3)) d2 = Uint8Array.from(b3);
        else throw Error(a3 + " must be hex string or Uint8Array");
        let e2 = d2.length;
        if ("number" == typeof c2 && e2 !== c2) throw Error(a3 + " of length " + c2 + " expected, got " + e2);
        return d2;
      }
      function z2(...a3) {
        let b3 = 0;
        for (let c3 = 0; c3 < a3.length; c3++) {
          let d2 = a3[c3];
          k(d2), b3 += d2.length;
        }
        let c2 = new Uint8Array(b3);
        for (let b4 = 0, d2 = 0; b4 < a3.length; b4++) {
          let e2 = a3[b4];
          c2.set(e2, d2), d2 += e2.length;
        }
        return c2;
      }
      let A = (a3) => "bigint" == typeof a3 && h <= a3;
      function B2(a3, b3, c2) {
        return A(a3) && A(b3) && A(c2) && b3 <= a3 && a3 < c2;
      }
      function C2(a3, b3, c2, d2) {
        if (!B2(b3, c2, d2)) throw Error("expected valid " + a3 + ": " + c2 + " <= n < " + d2 + ", got " + b3);
      }
      let D2 = (a3) => (i << BigInt(a3)) - i, E = (a3) => new Uint8Array(a3), F2 = (a3) => Uint8Array.from(a3), G2 = { bigint: (a3) => "bigint" == typeof a3, function: (a3) => "function" == typeof a3, boolean: (a3) => "boolean" == typeof a3, string: (a3) => "string" == typeof a3, stringOrUint8Array: (a3) => "string" == typeof a3 || j2(a3), isSafeInteger: (a3) => Number.isSafeInteger(a3), array: (a3) => Array.isArray(a3), field: (a3, b3) => b3.Fp.isValid(a3), hash: (a3) => "function" == typeof a3 && Number.isSafeInteger(a3.outputLen) };
      function H(a3, b3, c2 = {}) {
        let d2 = (b4, c3, d3) => {
          let e2 = G2[c3];
          if ("function" != typeof e2) throw Error("invalid validator function");
          let f2 = a3[b4];
          if ((!d3 || void 0 !== f2) && !e2(f2, a3)) throw Error("param " + String(b4) + " is invalid. Expected " + c3 + ", got " + f2);
        };
        for (let [a4, c3] of Object.entries(b3)) d2(a4, c3, false);
        for (let [a4, b4] of Object.entries(c2)) d2(a4, b4, true);
        return a3;
      }
      function I2(a3) {
        let b3 = /* @__PURE__ */ new WeakMap();
        return (c2, ...d2) => {
          let e2 = b3.get(c2);
          if (void 0 !== e2) return e2;
          let f2 = a3(c2, ...d2);
          return b3.set(c2, f2), f2;
        };
      }
      let J2 = BigInt(0), K2 = BigInt(1), L2 = BigInt(2), M = BigInt(3), N = BigInt(4), O2 = BigInt(5), P2 = BigInt(8);
      function Q2(a3, b3) {
        let c2 = a3 % b3;
        return c2 >= J2 ? c2 : b3 + c2;
      }
      function R2(a3, b3, c2) {
        let d2 = a3;
        for (; b3-- > J2; ) d2 *= d2, d2 %= c2;
        return d2;
      }
      function S(a3, b3) {
        if (a3 === J2) throw Error("invert: expected non-zero number");
        if (b3 <= J2) throw Error("invert: expected positive modulus, got " + b3);
        let c2 = Q2(a3, b3), d2 = b3, e2 = J2, f2 = K2, g2 = K2, h2 = J2;
        for (; c2 !== J2; ) {
          let a4 = d2 / c2, b4 = d2 % c2, i2 = e2 - g2 * a4, j3 = f2 - h2 * a4;
          d2 = c2, c2 = b4, e2 = g2, f2 = h2, g2 = i2, h2 = j3;
        }
        if (d2 !== K2) throw Error("invert: does not exist");
        return Q2(e2, b3);
      }
      function T2(a3, b3) {
        let c2 = (a3.ORDER + K2) / N, d2 = a3.pow(b3, c2);
        if (!a3.eql(a3.sqr(d2), b3)) throw Error("Cannot find square root");
        return d2;
      }
      function U2(a3, b3) {
        let c2 = (a3.ORDER - O2) / P2, d2 = a3.mul(b3, L2), e2 = a3.pow(d2, c2), f2 = a3.mul(b3, e2), g2 = a3.mul(a3.mul(f2, L2), e2), h2 = a3.mul(f2, a3.sub(g2, a3.ONE));
        if (!a3.eql(a3.sqr(h2), b3)) throw Error("Cannot find square root");
        return h2;
      }
      let V2 = ["create", "isValid", "is0", "neg", "inv", "sqrt", "sqr", "eql", "add", "sub", "mul", "pow", "div", "addN", "subN", "mulN", "sqrN"];
      function W2(a3, b3, c2 = false) {
        let d2 = Array(b3.length).fill(c2 ? a3.ZERO : void 0), e2 = b3.reduce((b4, c3, e3) => a3.is0(c3) ? b4 : (d2[e3] = b4, a3.mul(b4, c3)), a3.ONE), f2 = a3.inv(e2);
        return b3.reduceRight((b4, c3, e3) => a3.is0(c3) ? b4 : (d2[e3] = a3.mul(b4, d2[e3]), a3.mul(b4, c3)), f2), d2;
      }
      function X(a3, b3) {
        let c2 = (a3.ORDER - K2) / L2, d2 = a3.pow(b3, c2), e2 = a3.eql(d2, a3.ONE), f2 = a3.eql(d2, a3.ZERO), g2 = a3.eql(d2, a3.neg(a3.ONE));
        if (!e2 && !f2 && !g2) throw Error("invalid Legendre symbol result");
        return e2 ? 1 : f2 ? 0 : -1;
      }
      function Y2(a3, b3) {
        void 0 !== b3 && (0, e.Fe)(b3);
        let c2 = void 0 !== b3 ? b3 : a3.toString(2).length, d2 = Math.ceil(c2 / 8);
        return { nBitLength: c2, nByteLength: d2 };
      }
      function Z(a3, b3, c2 = false, d2 = {}) {
        let e2;
        if (a3 <= J2) throw Error("invalid field: expected ORDER > 0, got " + a3);
        let { nBitLength: f2, nByteLength: g2 } = Y2(a3, b3);
        if (g2 > 2048) throw Error("invalid field: expected ORDER of <= 2048 bytes");
        let h2 = Object.freeze({ ORDER: a3, isLE: c2, BITS: f2, BYTES: g2, MASK: D2(f2), ZERO: J2, ONE: K2, create: (b4) => Q2(b4, a3), isValid: (b4) => {
          if ("bigint" != typeof b4) throw Error("invalid field element: expected bigint, got " + typeof b4);
          return J2 <= b4 && b4 < a3;
        }, is0: (a4) => a4 === J2, isOdd: (a4) => (a4 & K2) === K2, neg: (b4) => Q2(-b4, a3), eql: (a4, b4) => a4 === b4, sqr: (b4) => Q2(b4 * b4, a3), add: (b4, c3) => Q2(b4 + c3, a3), sub: (b4, c3) => Q2(b4 - c3, a3), mul: (b4, c3) => Q2(b4 * c3, a3), pow: (a4, b4) => function(a5, b5, c3) {
          if (c3 < J2) throw Error("invalid exponent, negatives unsupported");
          if (c3 === J2) return a5.ONE;
          if (c3 === K2) return b5;
          let d3 = a5.ONE, e3 = b5;
          for (; c3 > J2; ) c3 & K2 && (d3 = a5.mul(d3, e3)), e3 = a5.sqr(e3), c3 >>= K2;
          return d3;
        }(h2, a4, b4), div: (b4, c3) => Q2(b4 * S(c3, a3), a3), sqrN: (a4) => a4 * a4, addN: (a4, b4) => a4 + b4, subN: (a4, b4) => a4 - b4, mulN: (a4, b4) => a4 * b4, inv: (b4) => S(b4, a3), sqrt: d2.sqrt || ((b4) => (e2 || (e2 = a3 % N === M ? T2 : a3 % P2 === O2 ? U2 : function(a4) {
          if (a4 < BigInt(3)) throw Error("sqrt is not defined for small field");
          let b5 = a4 - K2, c3 = 0;
          for (; b5 % L2 === J2; ) b5 /= L2, c3++;
          let d3 = L2, e3 = Z(a4);
          for (; 1 === X(e3, d3); ) if (d3++ > 1e3) throw Error("Cannot find square root: probably non-prime P");
          if (1 === c3) return T2;
          let f3 = e3.pow(d3, b5), g3 = (b5 + K2) / L2;
          return function(a5, d4) {
            if (a5.is0(d4)) return d4;
            if (1 !== X(a5, d4)) throw Error("Cannot find square root");
            let e4 = c3, h3 = a5.mul(a5.ONE, f3), i2 = a5.pow(d4, b5), j3 = a5.pow(d4, g3);
            for (; !a5.eql(i2, a5.ONE); ) {
              if (a5.is0(i2)) return a5.ZERO;
              let b6 = 1, c4 = a5.sqr(i2);
              for (; !a5.eql(c4, a5.ONE); ) if (b6++, c4 = a5.sqr(c4), b6 === e4) throw Error("Cannot find square root");
              let d5 = K2 << BigInt(e4 - b6 - 1), f4 = a5.pow(h3, d5);
              e4 = b6, h3 = a5.sqr(f4), i2 = a5.mul(i2, h3), j3 = a5.mul(j3, f4);
            }
            return j3;
          };
        }(a3)), e2(h2, b4))), toBytes: (a4) => c2 ? x2(a4, g2) : w2(a4, g2), fromBytes: (a4) => {
          if (a4.length !== g2) throw Error("Field.fromBytes: expected " + g2 + " bytes, got " + a4.length);
          return c2 ? v2(a4) : u(a4);
        }, invertBatch: (a4) => W2(h2, a4), cmov: (a4, b4, c3) => c3 ? b4 : a4 });
        return Object.freeze(h2);
      }
      function $(a3) {
        if ("bigint" != typeof a3) throw Error("field order must be bigint");
        return Math.ceil(a3.toString(2).length / 8);
      }
      function _2(a3) {
        let b3 = $(a3);
        return b3 + Math.ceil(b3 / 2);
      }
      let aa = BigInt(0), ab = BigInt(1);
      function ac(a3, b3) {
        let c2 = b3.negate();
        return a3 ? c2 : b3;
      }
      function ad(a3, b3) {
        if (!Number.isSafeInteger(a3) || a3 <= 0 || a3 > b3) throw Error("invalid window size, expected [1.." + b3 + "], got W=" + a3);
      }
      function ae2(a3, b3) {
        ad(a3, b3);
        let c2 = Math.ceil(b3 / a3) + 1, d2 = 2 ** (a3 - 1), e2 = 2 ** a3;
        return { windows: c2, windowSize: d2, mask: D2(a3), maxNumber: e2, shiftBy: BigInt(a3) };
      }
      function af(a3, b3, c2) {
        let { windowSize: d2, mask: e2, maxNumber: f2, shiftBy: g2 } = c2, h2 = Number(a3 & e2), i2 = a3 >> g2;
        h2 > d2 && (h2 -= f2, i2 += ab);
        let j3 = b3 * d2, k2 = j3 + Math.abs(h2) - 1, l2 = 0 === h2;
        return { nextN: i2, offset: k2, isZero: l2, isNeg: h2 < 0, isNegF: b3 % 2 != 0, offsetF: j3 };
      }
      let ag = /* @__PURE__ */ new WeakMap(), ah = /* @__PURE__ */ new WeakMap();
      function ai(a3) {
        return ah.get(a3) || 1;
      }
      function aj(a3) {
        return H(a3.Fp, V2.reduce((a4, b3) => (a4[b3] = "function", a4), { ORDER: "bigint", MASK: "bigint", BYTES: "isSafeInteger", BITS: "isSafeInteger" })), H(a3, { n: "bigint", h: "bigint", Gx: "field", Gy: "field" }, { nBitLength: "isSafeInteger", nByteLength: "isSafeInteger" }), Object.freeze({ ...Y2(a3.n, a3.nBitLength), ...a3, ...{ p: a3.Fp.ORDER } });
      }
      function ak(a3) {
        void 0 !== a3.lowS && l("lowS", a3.lowS), void 0 !== a3.prehash && l("prehash", a3.prehash);
      }
      class al extends Error {
        constructor(a3 = "") {
          super(a3);
        }
      }
      let am = { Err: al, _tlv: { encode: (a3, b3) => {
        let { Err: c2 } = am;
        if (a3 < 0 || a3 > 256) throw new c2("tlv.encode: wrong tag");
        if (1 & b3.length) throw new c2("tlv.encode: unpadded data");
        let d2 = b3.length / 2, e2 = m(d2);
        if (e2.length / 2 & 128) throw new c2("tlv.encode: long form length too big");
        let f2 = d2 > 127 ? m(e2.length / 2 | 128) : "";
        return m(a3) + f2 + e2 + b3;
      }, decode(a3, b3) {
        let { Err: c2 } = am, d2 = 0;
        if (a3 < 0 || a3 > 256) throw new c2("tlv.encode: wrong tag");
        if (b3.length < 2 || b3[d2++] !== a3) throw new c2("tlv.decode: wrong tlv");
        let e2 = b3[d2++], f2 = 0;
        if (128 & e2) {
          let a4 = 127 & e2;
          if (!a4) throw new c2("tlv.decode(long): indefinite length not supported");
          if (a4 > 4) throw new c2("tlv.decode(long): byte length is too big");
          let g3 = b3.subarray(d2, d2 + a4);
          if (g3.length !== a4) throw new c2("tlv.decode: length bytes not complete");
          if (0 === g3[0]) throw new c2("tlv.decode(long): zero leftmost byte");
          for (let a5 of g3) f2 = f2 << 8 | a5;
          if (d2 += a4, f2 < 128) throw new c2("tlv.decode(long): not minimal encoding");
        } else f2 = e2;
        let g2 = b3.subarray(d2, d2 + f2);
        if (g2.length !== f2) throw new c2("tlv.decode: wrong value length");
        return { v: g2, l: b3.subarray(d2 + f2) };
      } }, _int: { encode(a3) {
        let { Err: b3 } = am;
        if (a3 < an) throw new b3("integer: negative integers are not allowed");
        let c2 = m(a3);
        if (8 & Number.parseInt(c2[0], 16) && (c2 = "00" + c2), 1 & c2.length) throw new b3("unexpected DER parsing assertion: unpadded hex");
        return c2;
      }, decode(a3) {
        let { Err: b3 } = am;
        if (128 & a3[0]) throw new b3("invalid signature integer: negative");
        if (0 === a3[0] && !(128 & a3[1])) throw new b3("invalid signature integer: unnecessary leading zero");
        return u(a3);
      } }, toSig(a3) {
        let { Err: b3, _int: c2, _tlv: d2 } = am, e2 = y("signature", a3), { v: f2, l: g2 } = d2.decode(48, e2);
        if (g2.length) throw new b3("invalid signature: left bytes after parsing");
        let { v: h2, l: i2 } = d2.decode(2, f2), { v: j3, l: k2 } = d2.decode(2, i2);
        if (k2.length) throw new b3("invalid signature: left bytes after parsing");
        return { r: c2.decode(h2), s: c2.decode(j3) };
      }, hexFromSig(a3) {
        let { _tlv: b3, _int: c2 } = am, d2 = b3.encode(2, c2.encode(a3.r)), e2 = b3.encode(2, c2.encode(a3.s));
        return b3.encode(48, d2 + e2);
      } }, an = BigInt(0), ao = BigInt(1), ap = (BigInt(2), BigInt(3)), aq = BigInt(4), ar = BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"), as = BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"), at = BigInt(0), au = BigInt(1), av = BigInt(2), aw = (a3, b3) => (a3 + b3 / av) / b3, ax = Z(ar, void 0, void 0, { sqrt: function(a3) {
        let b3 = BigInt(3), c2 = BigInt(6), d2 = BigInt(11), e2 = BigInt(22), f2 = BigInt(23), g2 = BigInt(44), h2 = BigInt(88), i2 = a3 * a3 * a3 % ar, j3 = i2 * i2 * a3 % ar, k2 = R2(j3, b3, ar) * j3 % ar, l2 = R2(k2, b3, ar) * j3 % ar, m2 = R2(l2, av, ar) * i2 % ar, n2 = R2(m2, d2, ar) * m2 % ar, o2 = R2(n2, e2, ar) * n2 % ar, p2 = R2(o2, g2, ar) * o2 % ar, q3 = R2(p2, h2, ar) * p2 % ar, r2 = R2(q3, g2, ar) * o2 % ar, s2 = R2(r2, b3, ar) * j3 % ar, t2 = R2(s2, f2, ar) * n2 % ar, u2 = R2(t2, c2, ar) * i2 % ar, v3 = R2(u2, av, ar);
        if (!ax.eql(ax.sqr(v3), a3)) throw Error("Cannot find square root");
        return v3;
      } }), ay = function(a3, b3) {
        let c2 = (b4) => function(a4) {
          let b5 = function(a5) {
            let b6 = aj(a5);
            return H(b6, { hash: "hash", hmac: "function", randomBytes: "function" }, { bits2int: "function", bits2int_modN: "function", lowS: "boolean" }), Object.freeze({ lowS: true, ...b6 });
          }(a4), { Fp: c3, n: d2, nByteLength: e2, nBitLength: f2 } = b5, g2 = c3.BYTES + 1, k2 = 2 * c3.BYTES + 1;
          function m2(a5) {
            return Q2(a5, d2);
          }
          let { ProjectivePoint: n2, normPrivateKeyToScalar: o2, weierstrassEquation: p2, isWithinCurveOrder: r2 } = function(a5) {
            var b6;
            let c4 = function(a6) {
              let b7 = aj(a6);
              H(b7, { a: "field", b: "field" }, { allowInfinityPoint: "boolean", allowedPrivateKeyLengths: "array", clearCofactor: "function", fromBytes: "function", isTorsionFree: "function", toBytes: "function", wrapPrivateKey: "boolean" });
              let { endo: c5, Fp: d4, a: e4 } = b7;
              if (c5) {
                if (!d4.eql(e4, d4.ZERO)) throw Error("invalid endo: CURVE.a must be 0");
                if ("object" != typeof c5 || "bigint" != typeof c5.beta || "function" != typeof c5.splitScalar) throw Error('invalid endo: expected "beta": bigint and "splitScalar": function');
              }
              return Object.freeze({ ...b7 });
            }(a5), { Fp: d3 } = c4, e3 = Z(c4.n, c4.nBitLength), f3 = c4.toBytes || ((a6, b7, c5) => {
              let e4 = b7.toAffine();
              return z2(Uint8Array.from([4]), d3.toBytes(e4.x), d3.toBytes(e4.y));
            }), g3 = c4.fromBytes || ((a6) => {
              let b7 = a6.subarray(1);
              return { x: d3.fromBytes(b7.subarray(0, d3.BYTES)), y: d3.fromBytes(b7.subarray(d3.BYTES, 2 * d3.BYTES)) };
            });
            function k3(a6) {
              let { a: b7, b: e4 } = c4, f4 = d3.sqr(a6), g4 = d3.mul(f4, a6);
              return d3.add(d3.add(g4, d3.mul(a6, b7)), e4);
            }
            function m3(a6, b7) {
              let c5 = d3.sqr(b7), e4 = k3(a6);
              return d3.eql(c5, e4);
            }
            if (!m3(c4.Gx, c4.Gy)) throw Error("bad curve params: generator point");
            let n3 = d3.mul(d3.pow(c4.a, ap), aq), o3 = d3.mul(d3.sqr(c4.b), BigInt(27));
            if (d3.is0(d3.add(n3, o3))) throw Error("bad curve params: a or b");
            function p3(a6) {
              let b7, { allowedPrivateKeyLengths: d4, nByteLength: e4, wrapPrivateKey: f4, n: g4 } = c4;
              if (d4 && "bigint" != typeof a6) {
                if (j2(a6) && (a6 = q2(a6)), "string" != typeof a6 || !d4.includes(a6.length)) throw Error("invalid private key");
                a6 = a6.padStart(2 * e4, "0");
              }
              try {
                b7 = "bigint" == typeof a6 ? a6 : u(y("private key", a6, e4));
              } catch (b8) {
                throw Error("invalid private key, expected hex or " + e4 + " bytes, got " + typeof a6);
              }
              return f4 && (b7 = Q2(b7, g4)), C2("private key", b7, ao, g4), b7;
            }
            function r3(a6) {
              if (!(a6 instanceof v3)) throw Error("ProjectivePoint expected");
            }
            let s3 = I2((a6, b7) => {
              let { px: c5, py: e4, pz: f4 } = a6;
              if (d3.eql(f4, d3.ONE)) return { x: c5, y: e4 };
              let g4 = a6.is0();
              null == b7 && (b7 = g4 ? d3.ONE : d3.inv(f4));
              let h2 = d3.mul(c5, b7), i2 = d3.mul(e4, b7), j3 = d3.mul(f4, b7);
              if (g4) return { x: d3.ZERO, y: d3.ZERO };
              if (!d3.eql(j3, d3.ONE)) throw Error("invZ was invalid");
              return { x: h2, y: i2 };
            }), t2 = I2((a6) => {
              if (a6.is0()) {
                if (c4.allowInfinityPoint && !d3.is0(a6.py)) return;
                throw Error("bad point: ZERO");
              }
              let { x: b7, y: e4 } = a6.toAffine();
              if (!d3.isValid(b7) || !d3.isValid(e4)) throw Error("bad point: x or y not FE");
              if (!m3(b7, e4)) throw Error("bad point: equation left != right");
              if (!a6.isTorsionFree()) throw Error("bad point: not in prime-order subgroup");
              return true;
            });
            class v3 {
              constructor(a6, b7, c5) {
                if (null == a6 || !d3.isValid(a6)) throw Error("x required");
                if (null == b7 || !d3.isValid(b7) || d3.is0(b7)) throw Error("y required");
                if (null == c5 || !d3.isValid(c5)) throw Error("z required");
                this.px = a6, this.py = b7, this.pz = c5, Object.freeze(this);
              }
              static fromAffine(a6) {
                let { x: b7, y: c5 } = a6 || {};
                if (!a6 || !d3.isValid(b7) || !d3.isValid(c5)) throw Error("invalid affine point");
                if (a6 instanceof v3) throw Error("projective point not allowed");
                let e4 = (a7) => d3.eql(a7, d3.ZERO);
                return e4(b7) && e4(c5) ? v3.ZERO : new v3(b7, c5, d3.ONE);
              }
              get x() {
                return this.toAffine().x;
              }
              get y() {
                return this.toAffine().y;
              }
              static normalizeZ(a6) {
                let b7 = W2(d3, a6.map((a7) => a7.pz));
                return a6.map((a7, c5) => a7.toAffine(b7[c5])).map(v3.fromAffine);
              }
              static fromHex(a6) {
                let b7 = v3.fromAffine(g3(y("pointHex", a6)));
                return b7.assertValidity(), b7;
              }
              static fromPrivateKey(a6) {
                return v3.BASE.multiply(p3(a6));
              }
              static msm(a6, b7) {
                return function(a7, b8, c5, d4) {
                  if (!Array.isArray(c5)) throw Error("array expected");
                  c5.forEach((b9, c6) => {
                    if (!(b9 instanceof a7)) throw Error("invalid point at index " + c6);
                  });
                  if (!Array.isArray(d4)) throw Error("array of scalars expected");
                  d4.forEach((a8, c6) => {
                    if (!b8.isValid(a8)) throw Error("invalid scalar at index " + c6);
                  });
                  let e4 = c5.length, f4 = d4.length;
                  if (e4 !== f4) throw Error("arrays of points and scalars must have equal length");
                  let g4 = a7.ZERO, j3 = function(a8) {
                    let b9;
                    for (b9 = 0; a8 > h; a8 >>= i, b9 += 1) ;
                    return b9;
                  }(BigInt(e4)), k4 = 1;
                  j3 > 12 ? k4 = j3 - 3 : j3 > 4 ? k4 = j3 - 2 : j3 > 0 && (k4 = 2);
                  let l2 = D2(k4), m4 = Array(Number(l2) + 1).fill(g4), n4 = Math.floor((b8.BITS - 1) / k4) * k4, o4 = g4;
                  for (let a8 = n4; a8 >= 0; a8 -= k4) {
                    m4.fill(g4);
                    for (let b10 = 0; b10 < f4; b10++) {
                      let e5 = Number(d4[b10] >> BigInt(a8) & l2);
                      m4[e5] = m4[e5].add(c5[b10]);
                    }
                    let b9 = g4;
                    for (let a9 = m4.length - 1, c6 = g4; a9 > 0; a9--) c6 = c6.add(m4[a9]), b9 = b9.add(c6);
                    if (o4 = o4.add(b9), 0 !== a8) for (let a9 = 0; a9 < k4; a9++) o4 = o4.double();
                  }
                  return o4;
                }(v3, e3, a6, b7);
              }
              _setWindowSize(a6) {
                A3.setWindowSize(this, a6);
              }
              assertValidity() {
                t2(this);
              }
              hasEvenY() {
                let { y: a6 } = this.toAffine();
                if (d3.isOdd) return !d3.isOdd(a6);
                throw Error("Field doesn't support isOdd");
              }
              equals(a6) {
                r3(a6);
                let { px: b7, py: c5, pz: e4 } = this, { px: f4, py: g4, pz: h2 } = a6, i2 = d3.eql(d3.mul(b7, h2), d3.mul(f4, e4)), j3 = d3.eql(d3.mul(c5, h2), d3.mul(g4, e4));
                return i2 && j3;
              }
              negate() {
                return new v3(this.px, d3.neg(this.py), this.pz);
              }
              double() {
                let { a: a6, b: b7 } = c4, e4 = d3.mul(b7, ap), { px: f4, py: g4, pz: h2 } = this, i2 = d3.ZERO, j3 = d3.ZERO, k4 = d3.ZERO, l2 = d3.mul(f4, f4), m4 = d3.mul(g4, g4), n4 = d3.mul(h2, h2), o4 = d3.mul(f4, g4);
                return o4 = d3.add(o4, o4), k4 = d3.mul(f4, h2), k4 = d3.add(k4, k4), i2 = d3.mul(a6, k4), j3 = d3.mul(e4, n4), j3 = d3.add(i2, j3), i2 = d3.sub(m4, j3), j3 = d3.add(m4, j3), j3 = d3.mul(i2, j3), i2 = d3.mul(o4, i2), k4 = d3.mul(e4, k4), n4 = d3.mul(a6, n4), o4 = d3.sub(l2, n4), o4 = d3.mul(a6, o4), o4 = d3.add(o4, k4), k4 = d3.add(l2, l2), l2 = d3.add(k4, l2), l2 = d3.add(l2, n4), l2 = d3.mul(l2, o4), j3 = d3.add(j3, l2), n4 = d3.mul(g4, h2), n4 = d3.add(n4, n4), l2 = d3.mul(n4, o4), i2 = d3.sub(i2, l2), k4 = d3.mul(n4, m4), k4 = d3.add(k4, k4), new v3(i2, j3, k4 = d3.add(k4, k4));
              }
              add(a6) {
                r3(a6);
                let { px: b7, py: e4, pz: f4 } = this, { px: g4, py: h2, pz: i2 } = a6, j3 = d3.ZERO, k4 = d3.ZERO, l2 = d3.ZERO, m4 = c4.a, n4 = d3.mul(c4.b, ap), o4 = d3.mul(b7, g4), p4 = d3.mul(e4, h2), q3 = d3.mul(f4, i2), s4 = d3.add(b7, e4), t3 = d3.add(g4, h2);
                s4 = d3.mul(s4, t3), t3 = d3.add(o4, p4), s4 = d3.sub(s4, t3), t3 = d3.add(b7, f4);
                let u2 = d3.add(g4, i2);
                return t3 = d3.mul(t3, u2), u2 = d3.add(o4, q3), t3 = d3.sub(t3, u2), u2 = d3.add(e4, f4), j3 = d3.add(h2, i2), u2 = d3.mul(u2, j3), j3 = d3.add(p4, q3), u2 = d3.sub(u2, j3), l2 = d3.mul(m4, t3), j3 = d3.mul(n4, q3), l2 = d3.add(j3, l2), j3 = d3.sub(p4, l2), l2 = d3.add(p4, l2), k4 = d3.mul(j3, l2), p4 = d3.add(o4, o4), p4 = d3.add(p4, o4), q3 = d3.mul(m4, q3), t3 = d3.mul(n4, t3), p4 = d3.add(p4, q3), q3 = d3.sub(o4, q3), q3 = d3.mul(m4, q3), t3 = d3.add(t3, q3), o4 = d3.mul(p4, t3), k4 = d3.add(k4, o4), o4 = d3.mul(u2, t3), j3 = d3.mul(s4, j3), j3 = d3.sub(j3, o4), o4 = d3.mul(s4, p4), l2 = d3.mul(u2, l2), new v3(j3, k4, l2 = d3.add(l2, o4));
              }
              subtract(a6) {
                return this.add(a6.negate());
              }
              is0() {
                return this.equals(v3.ZERO);
              }
              wNAF(a6) {
                return A3.wNAFCached(this, a6, v3.normalizeZ);
              }
              multiplyUnsafe(a6) {
                let { endo: b7, n: e4 } = c4;
                C2("scalar", a6, an, e4);
                let f4 = v3.ZERO;
                if (a6 === an) return f4;
                if (this.is0() || a6 === ao) return this;
                if (!b7 || A3.hasPrecomputes(this)) return A3.wNAFCachedUnsafe(this, a6, v3.normalizeZ);
                let { k1neg: g4, k1: h2, k2neg: i2, k2: j3 } = b7.splitScalar(a6), k4 = f4, l2 = f4, m4 = this;
                for (; h2 > an || j3 > an; ) h2 & ao && (k4 = k4.add(m4)), j3 & ao && (l2 = l2.add(m4)), m4 = m4.double(), h2 >>= ao, j3 >>= ao;
                return g4 && (k4 = k4.negate()), i2 && (l2 = l2.negate()), l2 = new v3(d3.mul(l2.px, b7.beta), l2.py, l2.pz), k4.add(l2);
              }
              multiply(a6) {
                let b7, e4, { endo: f4, n: g4 } = c4;
                if (C2("scalar", a6, ao, g4), f4) {
                  let { k1neg: c5, k1: g5, k2neg: h2, k2: i2 } = f4.splitScalar(a6), { p: j3, f: k4 } = this.wNAF(g5), { p: l2, f: m4 } = this.wNAF(i2);
                  j3 = A3.constTimeNegate(c5, j3), l2 = A3.constTimeNegate(h2, l2), l2 = new v3(d3.mul(l2.px, f4.beta), l2.py, l2.pz), b7 = j3.add(l2), e4 = k4.add(m4);
                } else {
                  let { p: c5, f: d4 } = this.wNAF(a6);
                  b7 = c5, e4 = d4;
                }
                return v3.normalizeZ([b7, e4])[0];
              }
              multiplyAndAddUnsafe(a6, b7, c5) {
                let d4 = v3.BASE, e4 = (a7, b8) => b8 !== an && b8 !== ao && a7.equals(d4) ? a7.multiply(b8) : a7.multiplyUnsafe(b8), f4 = e4(this, b7).add(e4(a6, c5));
                return f4.is0() ? void 0 : f4;
              }
              toAffine(a6) {
                return s3(this, a6);
              }
              isTorsionFree() {
                let { h: a6, isTorsionFree: b7 } = c4;
                if (a6 === ao) return true;
                if (b7) return b7(v3, this);
                throw Error("isTorsionFree() has not been declared for the elliptic curve");
              }
              clearCofactor() {
                let { h: a6, clearCofactor: b7 } = c4;
                return a6 === ao ? this : b7 ? b7(v3, this) : this.multiplyUnsafe(c4.h);
              }
              toRawBytes(a6 = true) {
                return l("isCompressed", a6), this.assertValidity(), f3(v3, this, a6);
              }
              toHex(a6 = true) {
                return l("isCompressed", a6), q2(this.toRawBytes(a6));
              }
            }
            v3.BASE = new v3(c4.Gx, c4.Gy, d3.ONE), v3.ZERO = new v3(d3.ZERO, d3.ONE, d3.ZERO);
            let { endo: w3, nBitLength: x3 } = c4, A3 = (b6 = w3 ? Math.ceil(x3 / 2) : x3, { constTimeNegate: ac, hasPrecomputes: (a6) => 1 !== ai(a6), unsafeLadder(a6, b7, c5 = v3.ZERO) {
              let d4 = a6;
              for (; b7 > aa; ) b7 & ab && (c5 = c5.add(d4)), d4 = d4.double(), b7 >>= ab;
              return c5;
            }, precomputeWindow(a6, c5) {
              let { windows: d4, windowSize: e4 } = ae2(c5, b6), f4 = [], g4 = a6, h2 = g4;
              for (let a7 = 0; a7 < d4; a7++) {
                h2 = g4, f4.push(h2);
                for (let a8 = 1; a8 < e4; a8++) h2 = h2.add(g4), f4.push(h2);
                g4 = h2.double();
              }
              return f4;
            }, wNAF(a6, c5, d4) {
              let e4 = v3.ZERO, f4 = v3.BASE, g4 = ae2(a6, b6);
              for (let a7 = 0; a7 < g4.windows; a7++) {
                let { nextN: b7, offset: h2, isZero: i2, isNeg: j3, isNegF: k4, offsetF: l2 } = af(d4, a7, g4);
                d4 = b7, i2 ? f4 = f4.add(ac(k4, c5[l2])) : e4 = e4.add(ac(j3, c5[h2]));
              }
              return { p: e4, f: f4 };
            }, wNAFUnsafe(a6, c5, d4, e4 = v3.ZERO) {
              let f4 = ae2(a6, b6);
              for (let a7 = 0; a7 < f4.windows && d4 !== aa; a7++) {
                let { nextN: b7, offset: g4, isZero: h2, isNeg: i2 } = af(d4, a7, f4);
                if (d4 = b7, !h2) {
                  let a8 = c5[g4];
                  e4 = e4.add(i2 ? a8.negate() : a8);
                }
              }
              return e4;
            }, getPrecomputes(a6, b7, c5) {
              let d4 = ag.get(b7);
              return d4 || (d4 = this.precomputeWindow(b7, a6), 1 !== a6 && ag.set(b7, c5(d4))), d4;
            }, wNAFCached(a6, b7, c5) {
              let d4 = ai(a6);
              return this.wNAF(d4, this.getPrecomputes(d4, a6, c5), b7);
            }, wNAFCachedUnsafe(a6, b7, c5, d4) {
              let e4 = ai(a6);
              return 1 === e4 ? this.unsafeLadder(a6, b7, d4) : this.wNAFUnsafe(e4, this.getPrecomputes(e4, a6, c5), b7, d4);
            }, setWindowSize(a6, c5) {
              ad(c5, b6), ah.set(a6, c5), ag.delete(a6);
            } });
            return { CURVE: c4, ProjectivePoint: v3, normPrivateKeyToScalar: p3, weierstrassEquation: k3, isWithinCurveOrder: function(a6) {
              return B2(a6, ao, c4.n);
            } };
          }({ ...b5, toBytes(a5, b6, d3) {
            let e3 = b6.toAffine(), f3 = c3.toBytes(e3.x);
            return (l("isCompressed", d3), d3) ? z2(Uint8Array.from([b6.hasEvenY() ? 2 : 3]), f3) : z2(Uint8Array.from([4]), f3, c3.toBytes(e3.y));
          }, fromBytes(a5) {
            let b6 = a5.length, d3 = a5[0], e3 = a5.subarray(1);
            if (b6 === g2 && (2 === d3 || 3 === d3)) {
              let a6, b7 = u(e3);
              if (!B2(b7, ao, c3.ORDER)) throw Error("Point is not on curve");
              let f3 = p2(b7);
              try {
                a6 = c3.sqrt(f3);
              } catch (a7) {
                throw Error("Point is not on curve" + (a7 instanceof Error ? ": " + a7.message : ""));
              }
              return (1 & d3) == 1 != ((a6 & ao) === ao) && (a6 = c3.neg(a6)), { x: b7, y: a6 };
            }
            if (b6 === k2 && 4 === d3) return { x: c3.fromBytes(e3.subarray(0, c3.BYTES)), y: c3.fromBytes(e3.subarray(c3.BYTES, 2 * c3.BYTES)) };
            throw Error("invalid Point, expected length of " + g2 + ", or uncompressed " + k2 + ", got " + b6);
          } }), s2 = (a5, b6, c4) => u(a5.slice(b6, c4));
          class A2 {
            constructor(a5, b6, c4) {
              C2("r", a5, ao, d2), C2("s", b6, ao, d2), this.r = a5, this.s = b6, null != c4 && (this.recovery = c4), Object.freeze(this);
            }
            static fromCompact(a5) {
              return new A2(s2(a5 = y("compactSignature", a5, 2 * e2), 0, e2), s2(a5, e2, 2 * e2));
            }
            static fromDER(a5) {
              let { r: b6, s: c4 } = am.toSig(y("DER", a5));
              return new A2(b6, c4);
            }
            assertValidity() {
            }
            addRecoveryBit(a5) {
              return new A2(this.r, this.s, a5);
            }
            recoverPublicKey(a5) {
              let { r: e3, s: f3, recovery: g3 } = this, h2 = L3(y("msgHash", a5));
              if (null == g3 || ![0, 1, 2, 3].includes(g3)) throw Error("recovery id invalid");
              let i2 = 2 === g3 || 3 === g3 ? e3 + b5.n : e3;
              if (i2 >= c3.ORDER) throw Error("recovery id 2 or 3 invalid");
              let j3 = (1 & g3) == 0 ? "02" : "03", k3 = n2.fromHex(j3 + q2(w2(i2, c3.BYTES))), l2 = S(i2, d2), o3 = m2(-h2 * l2), p3 = m2(f3 * l2), r3 = n2.BASE.multiplyAndAddUnsafe(k3, o3, p3);
              if (!r3) throw Error("point at infinify");
              return r3.assertValidity(), r3;
            }
            hasHighS() {
              return this.s > d2 >> ao;
            }
            normalizeS() {
              return this.hasHighS() ? new A2(this.r, m2(-this.s), this.recovery) : this;
            }
            toDERRawBytes() {
              return t(this.toDERHex());
            }
            toDERHex() {
              return am.hexFromSig(this);
            }
            toCompactRawBytes() {
              return t(this.toCompactHex());
            }
            toCompactHex() {
              return q2(w2(this.r, e2)) + q2(w2(this.s, e2));
            }
          }
          function G3(a5) {
            if ("bigint" == typeof a5) return false;
            if (a5 instanceof n2) return true;
            let d3 = y("key", a5).length, f3 = c3.BYTES, g3 = f3 + 1;
            if (!b5.allowedPrivateKeyLengths && e2 !== g3) return d3 === g3 || d3 === 2 * f3 + 1;
          }
          let J3 = b5.bits2int || function(a5) {
            if (a5.length > 8192) throw Error("input is too large");
            let b6 = u(a5), c4 = 8 * a5.length - f2;
            return c4 > 0 ? b6 >> BigInt(c4) : b6;
          }, L3 = b5.bits2int_modN || function(a5) {
            return m2(J3(a5));
          }, M2 = D2(f2);
          function N2(a5) {
            return C2("num < 2^" + f2, a5, an, M2), w2(a5, e2);
          }
          let O3 = { lowS: b5.lowS, prehash: false }, P3 = { lowS: b5.lowS, prehash: false };
          return n2.BASE._setWindowSize(8), { CURVE: b5, getPublicKey: function(a5, b6 = true) {
            return n2.fromPrivateKey(a5).toRawBytes(b6);
          }, getSharedSecret: function(a5, b6, c4 = true) {
            if (true === G3(a5)) throw Error("first arg must be private key");
            if (false === G3(b6)) throw Error("second arg must be public key");
            return n2.fromHex(b6).multiply(o2(a5)).toRawBytes(c4);
          }, sign: function(a5, e3, f3 = O3) {
            let { seed: g3, k2sig: h2 } = function(a6, e4, f4 = O3) {
              if (["recovered", "canonical"].some((a7) => a7 in f4)) throw Error("sign() legacy options not supported");
              let { hash: g4, randomBytes: h3 } = b5, { lowS: i2, prehash: j3, extraEntropy: k3 } = f4;
              null == i2 && (i2 = true), a6 = y("msgHash", a6), ak(f4), j3 && (a6 = y("prehashed msgHash", g4(a6)));
              let l2 = L3(a6), p3 = o2(e4), q3 = [N2(p3), N2(l2)];
              if (null != k3 && false !== k3) {
                let a7 = true === k3 ? h3(c3.BYTES) : k3;
                q3.push(y("extraEntropy", a7));
              }
              return { seed: z2(...q3), k2sig: function(a7) {
                var b6;
                let c4 = J3(a7);
                if (!r2(c4)) return;
                let e5 = S(c4, d2), f5 = n2.BASE.multiply(c4).toAffine(), g5 = m2(f5.x);
                if (g5 === an) return;
                let h4 = m2(e5 * m2(l2 + g5 * p3));
                if (h4 === an) return;
                let j4 = 2 * (f5.x !== g5) | Number(f5.y & ao), k4 = h4;
                return i2 && h4 > d2 >> ao && (k4 = (b6 = h4) > d2 >> ao ? m2(-b6) : b6, j4 ^= 1), new A2(g5, k4, j4);
              } };
            }(a5, e3, f3);
            return function(a6, b6, c4) {
              if ("number" != typeof a6 || a6 < 2) throw Error("hashLen must be a number");
              if ("number" != typeof b6 || b6 < 2) throw Error("qByteLen must be a number");
              if ("function" != typeof c4) throw Error("hmacFn must be a function");
              let d3 = E(a6), e4 = E(a6), f4 = 0, g4 = () => {
                d3.fill(1), e4.fill(0), f4 = 0;
              }, h3 = (...a7) => c4(e4, d3, ...a7), i2 = (a7 = E(0)) => {
                e4 = h3(F2([0]), a7), d3 = h3(), 0 !== a7.length && (e4 = h3(F2([1]), a7), d3 = h3());
              }, j3 = () => {
                if (f4++ >= 1e3) throw Error("drbg: tried 1000 values");
                let a7 = 0, c5 = [];
                for (; a7 < b6; ) {
                  let b7 = (d3 = h3()).slice();
                  c5.push(b7), a7 += d3.length;
                }
                return z2(...c5);
              };
              return (a7, b7) => {
                let c5;
                for (g4(), i2(a7); !(c5 = b7(j3())); ) i2();
                return g4(), c5;
              };
            }(b5.hash.outputLen, b5.nByteLength, b5.hmac)(g3, h2);
          }, verify: function(a5, c4, e3, f3 = P3) {
            let g3, h2;
            c4 = y("msgHash", c4), e3 = y("publicKey", e3);
            let { lowS: i2, prehash: k3, format: l2 } = f3;
            if (ak(f3), "strict" in f3) throw Error("options.strict was renamed to lowS");
            if (void 0 !== l2 && "compact" !== l2 && "der" !== l2) throw Error("format must be compact or der");
            let o3 = "string" == typeof a5 || j2(a5), p3 = !o3 && !l2 && "object" == typeof a5 && null !== a5 && "bigint" == typeof a5.r && "bigint" == typeof a5.s;
            if (!o3 && !p3) throw Error("invalid signature, expected Uint8Array, hex string or Signature instance");
            try {
              if (p3 && (h2 = new A2(a5.r, a5.s)), o3) {
                try {
                  "compact" !== l2 && (h2 = A2.fromDER(a5));
                } catch (a6) {
                  if (!(a6 instanceof am.Err)) throw a6;
                }
                h2 || "der" === l2 || (h2 = A2.fromCompact(a5));
              }
              g3 = n2.fromHex(e3);
            } catch (a6) {
              return false;
            }
            if (!h2 || i2 && h2.hasHighS()) return false;
            k3 && (c4 = b5.hash(c4));
            let { r: q3, s: r3 } = h2, s3 = L3(c4), t2 = S(r3, d2), u2 = m2(s3 * t2), v3 = m2(q3 * t2), w3 = n2.BASE.multiplyAndAddUnsafe(g3, u2, v3)?.toAffine();
            return !!w3 && m2(w3.x) === q3;
          }, ProjectivePoint: n2, Signature: A2, utils: { isValidPrivateKey(a5) {
            try {
              return o2(a5), true;
            } catch (a6) {
              return false;
            }
          }, normPrivateKeyToScalar: o2, randomPrivateKey: () => {
            let a5 = _2(b5.n);
            return function(a6, b6, c4 = false) {
              let d3 = a6.length, e3 = $(b6), f3 = _2(b6);
              if (d3 < 16 || d3 < f3 || d3 > 1024) throw Error("expected " + f3 + "-1024 bytes of input, got " + d3);
              let g3 = Q2(c4 ? v2(a6) : u(a6), b6 - K2) + K2;
              return c4 ? x2(g3, e3) : w2(g3, e3);
            }(b5.randomBytes(a5), b5.n);
          }, precompute: (a5 = 8, b6 = n2.BASE) => (b6._setWindowSize(a5), b6.multiply(BigInt(3)), b6) } };
        }({ ...a3, ...{ hash: b4, hmac: (a4, ...c3) => g(b4, a4, (0, e.Id)(...c3)), randomBytes: e.po } });
        return { ...c2(b3), create: c2 };
      }({ a: at, b: BigInt(7), Fp: ax, n: as, Gx: BigInt("55066263022277343669578718895168534326250603453777594175500187360389116729240"), Gy: BigInt("32670510020758816978083085130507043184471273380659243275938904335757337482424"), h: BigInt(1), lowS: true, endo: { beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"), splitScalar: (a3) => {
        let b3 = BigInt("0x3086d221a7d46bcde86c90e49284eb15"), c2 = -au * BigInt("0xe4437ed6010e88286f547fa90abfe4c3"), d2 = BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8"), e2 = BigInt("0x100000000000000000000000000000000"), f2 = aw(b3 * a3, as), g2 = aw(-c2 * a3, as), h2 = Q2(a3 - f2 * b3 - g2 * d2, as), i2 = Q2(-f2 * c2 - g2 * b3, as), j3 = h2 > e2, k2 = i2 > e2;
        if (j3 && (h2 = as - h2), k2 && (i2 = as - i2), h2 > e2 || i2 > e2) throw Error("splitScalar: Endomorphism failed, k=" + a3);
        return { k1neg: j3, k1: h2, k2neg: k2, k2: i2 };
      } } }, d.sc);
    }, 5934: (a2, b2, c) => {
      "use strict";
      c.d(b2, { A: () => d });
      let d = (a3, b3, c2) => JSON.stringify(a3, (a4, c3) => {
        let d2 = "bigint" == typeof c3 ? c3.toString() : c3;
        return "function" == typeof b3 ? b3(a4, d2) : d2;
      }, c2);
    }, 6193: (a2, b2, c) => {
      "use strict";
      c.d(b2, { l: () => f });
      var d = c(1766), e = c(7653);
      function f(a3, b3) {
        let c2 = (a3.details || "").toLowerCase(), f2 = a3 instanceof d.C ? a3.walk((a4) => a4?.code === e.A7.code) : a3;
        return f2 instanceof d.C ? new e.A7({ cause: a3, message: f2.details }) : e.A7.nodeMessage.test(c2) ? new e.A7({ cause: a3, message: a3.details }) : e.BG.nodeMessage.test(c2) ? new e.BG({ cause: a3, maxFeePerGas: b3?.maxFeePerGas }) : e.jj.nodeMessage.test(c2) ? new e.jj({ cause: a3, maxFeePerGas: b3?.maxFeePerGas }) : e.K0.nodeMessage.test(c2) ? new e.K0({ cause: a3, nonce: b3?.nonce }) : e.Oh.nodeMessage.test(c2) ? new e.Oh({ cause: a3, nonce: b3?.nonce }) : e.vW.nodeMessage.test(c2) ? new e.vW({ cause: a3, nonce: b3?.nonce }) : e.k5.nodeMessage.test(c2) ? new e.k5({ cause: a3 }) : e.lY.nodeMessage.test(c2) ? new e.lY({ cause: a3, gas: b3?.gas }) : e.Fo.nodeMessage.test(c2) ? new e.Fo({ cause: a3, gas: b3?.gas }) : e.uC.nodeMessage.test(c2) ? new e.uC({ cause: a3 }) : e.lN.nodeMessage.test(c2) ? new e.lN({ cause: a3, maxFeePerGas: b3?.maxFeePerGas, maxPriorityFeePerGas: b3?.maxPriorityFeePerGas }) : new e.RM({ cause: a3 });
      }
    }, 6215: (a2, b2, c) => {
      "use strict";
      function d(a3, b3, c2) {
        return JSON.stringify(a3, (a4, c3) => "function" == typeof b3 ? b3(a4, c3) : "bigint" == typeof c3 ? c3.toString() + "#__bigint" : c3, c2);
      }
      c.d(b2, { As: () => d });
    }, 6487: () => {
    }, 6555: (a2, b2, c) => {
      "use strict";
      let d;
      c.r(b2), c.d(b2, { ComponentMod: () => eT, default: () => eU });
      var e, f = {};
      c.r(f), c.d(f, { POST: () => eJ, runtime: () => ev });
      var g = {};
      c.r(g), c.d(g, { handler: () => eQ, patchFetch: () => eP, routeModule: () => eL, serverHooks: () => eO, workAsyncStorage: () => eM, workUnitAsyncStorage: () => eN });
      var h = c(4116), i = c(9739), j2 = c(5308), k = c(4182), l = c(1983), m = c(4752), n = c(5752), o = c(9414), p = c(4153), q2 = c(5280), r = c(1679), s = c(4570), t = c(5897), u = c(8327), v2 = c(9565), w2 = c(3419), x2 = c(1212), y = c(3355), z2 = c(5723), A = c(7478), B2 = c(7848);
      let C2 = 256;
      function D2(a10 = 11) {
        if (!d || C2 + a10 > 512) {
          d = "", C2 = 0;
          for (let a11 = 0; a11 < 256; a11++) d += (256 + 256 * Math.random() | 0).toString(16).substring(1);
        }
        return d.substring(C2, C2++ + a10);
      }
      var E = c(3736), F2 = c(291), G2 = c(830), H = c(7474), I2 = c(7968), J2 = c(2847), K2 = c(606), L2 = c(3375), M = c(1766), N = c(901);
      function O2(a10) {
        if (!(a10 instanceof M.C)) return false;
        let b10 = a10.walk((a11) => a11 instanceof N.M);
        return b10 instanceof N.M && (b10.data?.errorName === "HttpError" || b10.data?.errorName === "ResolverError" || b10.data?.errorName === "ResolverNotContract" || b10.data?.errorName === "ResolverNotFound" || b10.data?.errorName === "ReverseAddressMismatch" || b10.data?.errorName === "UnsupportedResolverProfile");
      }
      var P2 = c(7159), Q2 = c(5290), R2 = c(8657), S = c(9795), T2 = c(5237);
      function U2(a10) {
        if (66 !== a10.length || 0 !== a10.indexOf("[") || 65 !== a10.indexOf("]")) return null;
        let b10 = `0x${a10.slice(1, 65)}`;
        return (0, T2.q)(b10) ? b10 : null;
      }
      function V2(a10) {
        let b10 = new Uint8Array(32).fill(0);
        if (!a10) return (0, L2.My)(b10);
        let c10 = a10.split(".");
        for (let a11 = c10.length - 1; a11 >= 0; a11 -= 1) {
          let d10 = U2(c10[a11]), e2 = d10 ? (0, R2.ZJ)(d10) : (0, S.S)((0, R2.Af)(c10[a11]), "bytes");
          b10 = (0, S.S)((0, Q2.xW)([b10, e2]), "bytes");
        }
        return (0, L2.My)(b10);
      }
      function W2(a10) {
        let b10 = a10.replace(/^\.|\.$/gm, "");
        if (0 === b10.length) return new Uint8Array(1);
        let c10 = new Uint8Array((0, R2.Af)(b10).byteLength + 2), d10 = 0, e2 = b10.split(".");
        for (let a11 = 0; a11 < e2.length; a11++) {
          var f2;
          let b11 = (0, R2.Af)(e2[a11]);
          b11.byteLength > 255 && (b11 = (0, R2.Af)((f2 = function(a12) {
            let b12 = new Uint8Array(32).fill(0);
            return a12 ? U2(a12) || (0, S.S)((0, R2.Af)(a12)) : (0, L2.My)(b12);
          }(e2[a11]), `[${f2.slice(2)}]`))), c10[d10] = b11.length, c10.set(b11, d10 + 1), d10 += b11.length + 1;
        }
        return c10.byteLength !== d10 + 1 ? c10.slice(0, d10 + 1) : c10;
      }
      function X(a10, b10, c10) {
        let d10 = a10[b10.name];
        if ("function" == typeof d10) return d10;
        let e2 = a10[c10];
        return "function" == typeof e2 ? e2 : (c11) => b10(a10, c11);
      }
      var Y2 = c(8863), Z = c(840);
      class $ extends M.C {
        constructor(a10, { code: b10, docsPath: c10, metaMessages: d10, name: e2, shortMessage: f2 }) {
          super(f2, { cause: a10, docsPath: c10, metaMessages: d10 || a10?.metaMessages, name: e2 || "RpcError" }), Object.defineProperty(this, "code", { enumerable: true, configurable: true, writable: true, value: void 0 }), this.name = e2 || a10.name, this.code = a10 instanceof Z.J8 ? a10.code : b10 ?? -1;
        }
      }
      class _2 extends $ {
        constructor(a10, b10) {
          super(a10, b10), Object.defineProperty(this, "data", { enumerable: true, configurable: true, writable: true, value: void 0 }), this.data = b10.data;
        }
      }
      class aa extends $ {
        constructor(a10) {
          super(a10, { code: aa.code, name: "ParseRpcError", shortMessage: "Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text." });
        }
      }
      Object.defineProperty(aa, "code", { enumerable: true, configurable: true, writable: true, value: -32700 });
      class ab extends $ {
        constructor(a10) {
          super(a10, { code: ab.code, name: "InvalidRequestRpcError", shortMessage: "JSON is not a valid request object." });
        }
      }
      Object.defineProperty(ab, "code", { enumerable: true, configurable: true, writable: true, value: -32600 });
      class ac extends $ {
        constructor(a10, { method: b10 } = {}) {
          super(a10, { code: ac.code, name: "MethodNotFoundRpcError", shortMessage: `The method${b10 ? ` "${b10}"` : ""} does not exist / is not available.` });
        }
      }
      Object.defineProperty(ac, "code", { enumerable: true, configurable: true, writable: true, value: -32601 });
      class ad extends $ {
        constructor(a10) {
          super(a10, { code: ad.code, name: "InvalidParamsRpcError", shortMessage: "Invalid parameters were provided to the RPC method.\nDouble check you have provided the correct parameters." });
        }
      }
      Object.defineProperty(ad, "code", { enumerable: true, configurable: true, writable: true, value: -32602 });
      class ae2 extends $ {
        constructor(a10) {
          super(a10, { code: ae2.code, name: "InternalRpcError", shortMessage: "An internal error was received." });
        }
      }
      Object.defineProperty(ae2, "code", { enumerable: true, configurable: true, writable: true, value: -32603 });
      class af extends $ {
        constructor(a10) {
          super(a10, { code: af.code, name: "InvalidInputRpcError", shortMessage: "Missing or invalid parameters.\nDouble check you have provided the correct parameters." });
        }
      }
      Object.defineProperty(af, "code", { enumerable: true, configurable: true, writable: true, value: -32e3 });
      class ag extends $ {
        constructor(a10) {
          super(a10, { code: ag.code, name: "ResourceNotFoundRpcError", shortMessage: "Requested resource not found." }), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "ResourceNotFoundRpcError" });
        }
      }
      Object.defineProperty(ag, "code", { enumerable: true, configurable: true, writable: true, value: -32001 });
      class ah extends $ {
        constructor(a10) {
          super(a10, { code: ah.code, name: "ResourceUnavailableRpcError", shortMessage: "Requested resource not available." });
        }
      }
      Object.defineProperty(ah, "code", { enumerable: true, configurable: true, writable: true, value: -32002 });
      class ai extends $ {
        constructor(a10) {
          super(a10, { code: ai.code, name: "TransactionRejectedRpcError", shortMessage: "Transaction creation failed." });
        }
      }
      Object.defineProperty(ai, "code", { enumerable: true, configurable: true, writable: true, value: -32003 });
      class aj extends $ {
        constructor(a10, { method: b10 } = {}) {
          super(a10, { code: aj.code, name: "MethodNotSupportedRpcError", shortMessage: `Method${b10 ? ` "${b10}"` : ""} is not supported.` });
        }
      }
      Object.defineProperty(aj, "code", { enumerable: true, configurable: true, writable: true, value: -32004 });
      class ak extends $ {
        constructor(a10) {
          super(a10, { code: ak.code, name: "LimitExceededRpcError", shortMessage: "Request exceeds defined limit." });
        }
      }
      Object.defineProperty(ak, "code", { enumerable: true, configurable: true, writable: true, value: -32005 });
      class al extends $ {
        constructor(a10) {
          super(a10, { code: al.code, name: "JsonRpcVersionUnsupportedError", shortMessage: "Version of JSON-RPC protocol is not supported." });
        }
      }
      Object.defineProperty(al, "code", { enumerable: true, configurable: true, writable: true, value: -32006 });
      class am extends _2 {
        constructor(a10) {
          super(a10, { code: am.code, name: "UserRejectedRequestError", shortMessage: "User rejected the request." });
        }
      }
      Object.defineProperty(am, "code", { enumerable: true, configurable: true, writable: true, value: 4001 });
      class an extends _2 {
        constructor(a10) {
          super(a10, { code: an.code, name: "UnauthorizedProviderError", shortMessage: "The requested method and/or account has not been authorized by the user." });
        }
      }
      Object.defineProperty(an, "code", { enumerable: true, configurable: true, writable: true, value: 4100 });
      class ao extends _2 {
        constructor(a10, { method: b10 } = {}) {
          super(a10, { code: ao.code, name: "UnsupportedProviderMethodError", shortMessage: `The Provider does not support the requested method${b10 ? ` " ${b10}"` : ""}.` });
        }
      }
      Object.defineProperty(ao, "code", { enumerable: true, configurable: true, writable: true, value: 4200 });
      class ap extends _2 {
        constructor(a10) {
          super(a10, { code: ap.code, name: "ProviderDisconnectedError", shortMessage: "The Provider is disconnected from all chains." });
        }
      }
      Object.defineProperty(ap, "code", { enumerable: true, configurable: true, writable: true, value: 4900 });
      class aq extends _2 {
        constructor(a10) {
          super(a10, { code: aq.code, name: "ChainDisconnectedError", shortMessage: "The Provider is not connected to the requested chain." });
        }
      }
      Object.defineProperty(aq, "code", { enumerable: true, configurable: true, writable: true, value: 4901 });
      class ar extends _2 {
        constructor(a10) {
          super(a10, { code: ar.code, name: "SwitchChainError", shortMessage: "An error occurred when attempting to switch chain." });
        }
      }
      Object.defineProperty(ar, "code", { enumerable: true, configurable: true, writable: true, value: 4902 });
      class as extends _2 {
        constructor(a10) {
          super(a10, { code: as.code, name: "UnsupportedNonOptionalCapabilityError", shortMessage: "This Wallet does not support a capability that was not marked as optional." });
        }
      }
      Object.defineProperty(as, "code", { enumerable: true, configurable: true, writable: true, value: 5700 });
      class at extends _2 {
        constructor(a10) {
          super(a10, { code: at.code, name: "UnsupportedChainIdError", shortMessage: "This Wallet does not support the requested chain ID." });
        }
      }
      Object.defineProperty(at, "code", { enumerable: true, configurable: true, writable: true, value: 5710 });
      class au extends _2 {
        constructor(a10) {
          super(a10, { code: au.code, name: "DuplicateIdError", shortMessage: "There is already a bundle submitted with this ID." });
        }
      }
      Object.defineProperty(au, "code", { enumerable: true, configurable: true, writable: true, value: 5720 });
      class av extends _2 {
        constructor(a10) {
          super(a10, { code: av.code, name: "UnknownBundleIdError", shortMessage: "This bundle id is unknown / has not been submitted" });
        }
      }
      Object.defineProperty(av, "code", { enumerable: true, configurable: true, writable: true, value: 5730 });
      class aw extends _2 {
        constructor(a10) {
          super(a10, { code: aw.code, name: "BundleTooLargeError", shortMessage: "The call bundle is too large for the Wallet to process." });
        }
      }
      Object.defineProperty(aw, "code", { enumerable: true, configurable: true, writable: true, value: 5740 });
      class ax extends _2 {
        constructor(a10) {
          super(a10, { code: ax.code, name: "AtomicReadyWalletRejectedUpgradeError", shortMessage: "The Wallet can support atomicity after an upgrade, but the user rejected the upgrade." });
        }
      }
      Object.defineProperty(ax, "code", { enumerable: true, configurable: true, writable: true, value: 5750 });
      class ay extends _2 {
        constructor(a10) {
          super(a10, { code: ay.code, name: "AtomicityNotSupportedError", shortMessage: "The wallet does not support atomic execution but the request requires it." });
        }
      }
      Object.defineProperty(ay, "code", { enumerable: true, configurable: true, writable: true, value: 5760 });
      class az extends _2 {
        constructor(a10) {
          super(a10, { code: az.code, name: "WalletConnectSessionSettlementError", shortMessage: "WalletConnect session settlement failed." });
        }
      }
      Object.defineProperty(az, "code", { enumerable: true, configurable: true, writable: true, value: 7e3 });
      class aA extends $ {
        constructor(a10) {
          super(a10, { name: "UnknownRpcError", shortMessage: "An unknown RPC error occurred." });
        }
      }
      function aB(a10, { abi: b10, address: c10, args: d10, docsPath: e2, functionName: f2, sender: g2 }) {
        let h2 = a10 instanceof N.$S ? a10 : a10 instanceof M.C ? a10.walk((a11) => "data" in a11) || a10.walk() : {}, { code: i2, data: j3, details: k2, message: l2, shortMessage: m2 } = h2, n2 = a10 instanceof Y2.O ? new N.rR({ functionName: f2, cause: a10 }) : [3, ae2.code].includes(i2) && (j3 || k2 || l2 || m2) || i2 === af.code && "execution reverted" === k2 && j3 ? new N.M({ abi: b10, data: "object" == typeof j3 ? j3.data : j3, functionName: f2, message: h2 instanceof Z.J8 ? k2 : m2 ?? l2, cause: a10 }) : a10;
        return new N.bG(n2, { abi: b10, args: d10, contractAddress: c10, docsPath: e2, functionName: f2, sender: g2 });
      }
      var aC = c(3777);
      async function aD(a10, b10) {
        let { abi: c10, address: d10, args: e2, functionName: f2, ...g2 } = b10, h2 = (0, G2.p)({ abi: c10, args: e2, functionName: f2 });
        try {
          let { data: b11 } = await X(a10, aC.T, "call")({ ...g2, data: h2, to: d10 });
          return (0, F2.e)({ abi: c10, args: e2, functionName: f2, data: b11 || "0x" });
        } catch (a11) {
          throw aB(a11, { abi: c10, address: d10, args: e2, docsPath: "/docs/contract/readContract", functionName: f2 });
        }
      }
      async function aE(a10, b10) {
        let { blockNumber: c10, blockTag: d10, coinType: e2, name: f2, gatewayUrls: g2, strict: h2 } = b10, { chain: i2 } = a10, j3 = (() => {
          if (b10.universalResolverAddress) return b10.universalResolverAddress;
          if (!i2) throw Error("client chain not configured. universalResolverAddress is required.");
          return (0, I2.M)({ blockNumber: c10, chain: i2, contract: "ensUniversalResolver" });
        })(), k2 = i2?.ensTlds;
        if (k2 && !k2.some((a11) => f2.endsWith(a11))) return null;
        let l2 = null != e2 ? [V2(f2), BigInt(e2)] : [V2(f2)];
        try {
          let b11 = (0, G2.p)({ abi: E.Rm, functionName: "addr", args: l2 }), h3 = { address: j3, abi: E.Ag, functionName: "resolveWithGateways", args: [(0, L2.nj)(W2(f2)), b11, g2 ?? [P2.J]], blockNumber: c10, blockTag: d10 }, i3 = X(a10, aD, "readContract"), k3 = await i3(h3);
          if ("0x" === k3[0]) return null;
          let m2 = function({ coinType: a11, data: b12, args: c11 }) {
            try {
              return (0, F2.e)({ abi: E.Rm, args: c11, functionName: "addr", data: b12 });
            } catch (d11) {
              if (null == a11) throw d11;
              let c12 = (0, K2.B)(b12);
              if (20 === (0, J2.E)(c12)) return (0, H.b)(c12);
              throw d11;
            }
          }({ coinType: e2, data: k3[0], args: l2 });
          if ("0x" === m2 || "0x00" === (0, K2.B)(m2)) return null;
          return m2;
        } catch (a11) {
          if (h2) throw a11;
          if (O2(a11)) return null;
          throw a11;
        }
      }
      class aF extends M.C {
        constructor({ data: a10 }) {
          super("Unable to extract image from metadata. The metadata may be malformed or invalid.", { metaMessages: ["- Metadata must be a JSON object with at least an `image`, `image_url` or `image_data` property.", "", `Provided data: ${JSON.stringify(a10)}`], name: "EnsAvatarInvalidMetadataError" });
        }
      }
      class aG extends M.C {
        constructor({ reason: a10 }) {
          super(`ENS NFT avatar URI is invalid. ${a10}`, { name: "EnsAvatarInvalidNftUriError" });
        }
      }
      class aH extends M.C {
        constructor({ uri: a10 }) {
          super(`Unable to resolve ENS avatar URI "${a10}". The URI may be malformed, invalid, or does not respond with a valid image.`, { name: "EnsAvatarUriResolutionError" });
        }
      }
      class aI extends M.C {
        constructor({ namespace: a10 }) {
          super(`ENS NFT avatar namespace "${a10}" is not supported. Must be "erc721" or "erc1155".`, { name: "EnsAvatarUnsupportedNamespaceError" });
        }
      }
      M.C;
      let aJ = /(?<protocol>https?:\/\/[^/]*|ipfs:\/|ipns:\/|ar:\/)?(?<root>\/)?(?<subpath>ipfs\/|ipns\/)?(?<target>[\w\-.]+)(?<subtarget>\/.*)?/, aK = /^(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})(\/(?<target>[\w\-.]+))?(?<subtarget>\/.*)?$/, aL = /^data:([a-zA-Z\-/+]*);base64,([^"].*)/, aM = /^data:([a-zA-Z\-/+]*)?(;[a-zA-Z0-9].*?)?(,)/;
      async function aN(a10) {
        try {
          let b10 = await fetch(a10, { method: "HEAD" });
          if (200 === b10.status) {
            let a11 = b10.headers.get("content-type");
            return a11?.startsWith("image/");
          }
          return false;
        } catch (b10) {
          if ("object" == typeof b10 && void 0 !== b10.response || !Object.hasOwn(globalThis, "Image")) return false;
          return new Promise((b11) => {
            let c10 = new Image();
            c10.onload = () => {
              b11(true);
            }, c10.onerror = () => {
              b11(false);
            }, c10.src = a10;
          });
        }
      }
      function aO(a10, b10) {
        return a10 ? a10.endsWith("/") ? a10.slice(0, -1) : a10 : b10;
      }
      function aP({ uri: a10, gatewayUrls: b10 }) {
        let c10 = aL.test(a10);
        if (c10) return { uri: a10, isOnChain: true, isEncoded: c10 };
        let d10 = aO(b10?.ipfs, "https://ipfs.io"), e2 = aO(b10?.arweave, "https://arweave.net"), f2 = a10.match(aJ), { protocol: g2, subpath: h2, target: i2, subtarget: j3 = "" } = f2?.groups || {}, k2 = "ipns:/" === g2 || "ipns/" === h2, l2 = "ipfs:/" === g2 || "ipfs/" === h2 || aK.test(a10);
        if (a10.startsWith("http") && !k2 && !l2) {
          let c11 = a10;
          return b10?.arweave && (c11 = a10.replace(/https:\/\/arweave.net/g, b10?.arweave)), { uri: c11, isOnChain: false, isEncoded: false };
        }
        if ((k2 || l2) && i2) return { uri: `${d10}/${k2 ? "ipns" : "ipfs"}/${i2}${j3}`, isOnChain: false, isEncoded: false };
        if ("ar:/" === g2 && i2) return { uri: `${e2}/${i2}${j3 || ""}`, isOnChain: false, isEncoded: false };
        let m2 = a10.replace(aM, "");
        if (m2.startsWith("<svg") && (m2 = `data:image/svg+xml;base64,${btoa(m2)}`), m2.startsWith("data:") || m2.startsWith("{")) return { uri: m2, isOnChain: true, isEncoded: false };
        throw new aH({ uri: a10 });
      }
      function aQ(a10) {
        if ("object" != typeof a10 || !("image" in a10) && !("image_url" in a10) && !("image_data" in a10)) throw new aF({ data: a10 });
        return a10.image || a10.image_url || a10.image_data;
      }
      async function aR({ gatewayUrls: a10, uri: b10 }) {
        try {
          let c10 = await fetch(b10).then((a11) => a11.json());
          return await aS({ gatewayUrls: a10, uri: aQ(c10) });
        } catch {
          throw new aH({ uri: b10 });
        }
      }
      async function aS({ gatewayUrls: a10, uri: b10 }) {
        let { uri: c10, isOnChain: d10 } = aP({ uri: b10, gatewayUrls: a10 });
        if (d10 || await aN(c10)) return c10;
        throw new aH({ uri: b10 });
      }
      async function aT(a10, { nft: b10 }) {
        if ("erc721" === b10.namespace) return aD(a10, { address: b10.contractAddress, abi: [{ name: "tokenURI", type: "function", stateMutability: "view", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ name: "", type: "string" }] }], functionName: "tokenURI", args: [BigInt(b10.tokenID)] });
        if ("erc1155" === b10.namespace) return aD(a10, { address: b10.contractAddress, abi: [{ name: "uri", type: "function", stateMutability: "view", inputs: [{ name: "_id", type: "uint256" }], outputs: [{ name: "", type: "string" }] }], functionName: "uri", args: [BigInt(b10.tokenID)] });
        throw new aI({ namespace: b10.namespace });
      }
      async function aU(a10, { gatewayUrls: b10, record: c10 }) {
        return /eip155:/i.test(c10) ? aV(a10, { gatewayUrls: b10, record: c10 }) : aS({ uri: c10, gatewayUrls: b10 });
      }
      async function aV(a10, { gatewayUrls: b10, record: c10 }) {
        let d10 = function(a11) {
          let b11 = a11;
          b11.startsWith("did:nft:") && (b11 = b11.replace("did:nft:", "").replace(/_/g, "/"));
          let [c11, d11, e3] = b11.split("/"), [f3, g3] = c11.split(":"), [h3, i2] = d11.split(":");
          if (!f3 || "eip155" !== f3.toLowerCase()) throw new aG({ reason: "Only EIP-155 supported" });
          if (!g3) throw new aG({ reason: "Chain ID not found" });
          if (!i2) throw new aG({ reason: "Contract address not found" });
          if (!e3) throw new aG({ reason: "Token ID not found" });
          if (!h3) throw new aG({ reason: "ERC namespace not found" });
          return { chainID: Number.parseInt(g3, 10), namespace: h3.toLowerCase(), contractAddress: i2, tokenID: e3 };
        }(c10), { uri: e2, isOnChain: f2, isEncoded: g2 } = aP({ uri: await aT(a10, { nft: d10 }), gatewayUrls: b10 });
        if (f2 && (e2.includes("data:application/json;base64,") || e2.startsWith("{"))) return aS({ uri: aQ(JSON.parse(g2 ? atob(e2.replace("data:application/json;base64,", "")) : e2)), gatewayUrls: b10 });
        let h2 = d10.tokenID;
        return "erc1155" === d10.namespace && (h2 = h2.replace("0x", "").padStart(64, "0")), aR({ gatewayUrls: b10, uri: e2.replace(/(?:0x)?{id}/, h2) });
      }
      async function aW(a10, b10) {
        let { blockNumber: c10, blockTag: d10, key: e2, name: f2, gatewayUrls: g2, strict: h2 } = b10, { chain: i2 } = a10, j3 = (() => {
          if (b10.universalResolverAddress) return b10.universalResolverAddress;
          if (!i2) throw Error("client chain not configured. universalResolverAddress is required.");
          return (0, I2.M)({ blockNumber: c10, chain: i2, contract: "ensUniversalResolver" });
        })(), k2 = i2?.ensTlds;
        if (k2 && !k2.some((a11) => f2.endsWith(a11))) return null;
        try {
          let b11 = { address: j3, abi: E.Ag, args: [(0, L2.nj)(W2(f2)), (0, G2.p)({ abi: E.SJ, functionName: "text", args: [V2(f2), e2] }), g2 ?? [P2.J]], functionName: "resolveWithGateways", blockNumber: c10, blockTag: d10 }, h3 = X(a10, aD, "readContract"), i3 = await h3(b11);
          if ("0x" === i3[0]) return null;
          let k3 = (0, F2.e)({ abi: E.SJ, functionName: "text", data: i3[0] });
          return "" === k3 ? null : k3;
        } catch (a11) {
          if (h2) throw a11;
          if (O2(a11)) return null;
          throw a11;
        }
      }
      async function aX(a10, { blockNumber: b10, blockTag: c10, assetGatewayUrls: d10, name: e2, gatewayUrls: f2, strict: g2, universalResolverAddress: h2 }) {
        let i2 = await X(a10, aW, "getEnsText")({ blockNumber: b10, blockTag: c10, key: "avatar", name: e2, universalResolverAddress: h2, gatewayUrls: f2, strict: g2 });
        if (!i2) return null;
        try {
          return await aU(a10, { record: i2, gatewayUrls: d10 });
        } catch {
          return null;
        }
      }
      async function aY(a10, b10) {
        let { address: c10, blockNumber: d10, blockTag: e2, coinType: f2 = 60n, gatewayUrls: g2, strict: h2 } = b10, { chain: i2 } = a10, j3 = (() => {
          if (b10.universalResolverAddress) return b10.universalResolverAddress;
          if (!i2) throw Error("client chain not configured. universalResolverAddress is required.");
          return (0, I2.M)({ blockNumber: d10, chain: i2, contract: "ensUniversalResolver" });
        })();
        try {
          let b11 = { address: j3, abi: E.oX, args: [c10, f2, g2 ?? [P2.J]], functionName: "reverseWithGateways", blockNumber: d10, blockTag: e2 }, h3 = X(a10, aD, "readContract"), [i3] = await h3(b11);
          return i3 || null;
        } catch (a11) {
          if (h2) throw a11;
          if (O2(a11)) return null;
          throw a11;
        }
      }
      async function aZ(a10, b10) {
        let { blockNumber: c10, blockTag: d10, name: e2 } = b10, { chain: f2 } = a10, g2 = (() => {
          if (b10.universalResolverAddress) return b10.universalResolverAddress;
          if (!f2) throw Error("client chain not configured. universalResolverAddress is required.");
          return (0, I2.M)({ blockNumber: c10, chain: f2, contract: "ensUniversalResolver" });
        })(), h2 = f2?.ensTlds;
        if (h2 && !h2.some((a11) => e2.endsWith(a11))) throw Error(`${e2} is not a valid ENS TLD (${h2?.join(", ")}) for chain "${f2.name}" (id: ${f2.id}).`);
        let [i2] = await X(a10, aD, "readContract")({ address: g2, abi: [{ inputs: [{ type: "bytes" }], name: "findResolver", outputs: [{ type: "address" }, { type: "bytes32" }, { type: "uint256" }], stateMutability: "view", type: "function" }], functionName: "findResolver", args: [(0, L2.nj)(W2(e2))], blockNumber: c10, blockTag: d10 });
        return i2;
      }
      var a$ = c(493), a_ = c(5590), a0 = c(2934), a1 = c(3694);
      async function a22(a10, b10) {
        let { account: c10 = a10.account, blockNumber: d10, blockTag: e2 = "latest", blobs: f2, data: g2, gas: h2, gasPrice: i2, maxFeePerBlobGas: j3, maxFeePerGas: k2, maxPriorityFeePerGas: l2, to: m2, value: n2, ...o2 } = b10, p2 = c10 ? (0, B2.J)(c10) : void 0;
        try {
          (0, a1.c)(b10);
          let c11 = "bigint" == typeof d10 ? (0, L2.cK)(d10) : void 0, q3 = a10.chain?.formatters?.transactionRequest?.format, r2 = (q3 || a0.Bv)({ ...(0, a_.o)(o2, { format: q3 }), account: p2, blobs: f2, data: g2, gas: h2, gasPrice: i2, maxFeePerBlobGas: j3, maxFeePerGas: k2, maxPriorityFeePerGas: l2, to: m2, value: n2 }, "createAccessList"), s2 = await a10.request({ method: "eth_createAccessList", params: [r2, c11 || e2] });
          return { accessList: s2.accessList, gasUsed: BigInt(s2.gasUsed) };
        } catch (c11) {
          throw (0, a$.d)(c11, { ...b10, account: p2, chain: a10.chain });
        }
      }
      function a3(a10, { method: b10 }) {
        let c10 = {};
        return "fallback" === a10.transport.type && a10.transport.onResponse?.(({ method: a11, response: d10, status: e2, transport: f2 }) => {
          "success" === e2 && b10 === a11 && (c10[d10] = f2.request);
        }), (b11) => c10[b11] || a10.request;
      }
      async function a4(a10) {
        let b10 = a3(a10, { method: "eth_newBlockFilter" }), c10 = await a10.request({ method: "eth_newBlockFilter" });
        return { id: c10, request: b10(c10), type: "block" };
      }
      class a5 extends M.C {
        constructor(a10) {
          super(`Filter type "${a10}" is not supported.`, { name: "FilterTypeNotSupportedError" });
        }
      }
      var a6 = c(366), a7 = c(494), a8 = c(9382), a9 = c(9965);
      let ba = "/docs/contract/encodeEventTopics";
      function bb(a10) {
        let { abi: b10, eventName: c10, args: d10 } = a10, e2 = b10[0];
        if (c10) {
          let a11 = (0, a9.iY)({ abi: b10, name: c10 });
          if (!a11) throw new Y2.M_(c10, { docsPath: ba });
          e2 = a11;
        }
        if ("event" !== e2.type) throw new Y2.M_(void 0, { docsPath: ba });
        let f2 = [];
        if (d10 && "inputs" in e2) {
          let a11 = e2.inputs?.filter((a12) => "indexed" in a12 && a12.indexed), b11 = Array.isArray(d10) ? d10 : Object.values(d10).length > 0 ? a11?.map((a12) => d10[a12.name]) ?? [] : [];
          b11.length > 0 && (f2 = a11?.map((a12, c11) => Array.isArray(b11[c11]) ? b11[c11].map((d11, e3) => bc({ param: a12, value: b11[c11][e3] })) : void 0 !== b11[c11] && null !== b11[c11] ? bc({ param: a12, value: b11[c11] }) : null) ?? []);
        }
        if (e2.anonymous) return f2;
        let g2 = (0, a8.B)(e2);
        return [(0, a6.h)(g2), ...f2];
      }
      function bc({ param: a10, value: b10 }) {
        if ("string" === a10.type || "bytes" === a10.type) return (0, S.S)((0, R2.ZJ)(b10));
        if ("tuple" === a10.type || a10.type.match(/^(.*)\[(\d+)?\]$/)) throw new a5(a10.type);
        return (0, a7.h)([a10], [b10]);
      }
      async function bd(a10, b10) {
        let { address: c10, abi: d10, args: e2, eventName: f2, fromBlock: g2, strict: h2, toBlock: i2 } = b10, j3 = a3(a10, { method: "eth_newFilter" }), k2 = f2 ? bb({ abi: d10, args: e2, eventName: f2 }) : void 0, l2 = await a10.request({ method: "eth_newFilter", params: [{ address: c10, fromBlock: "bigint" == typeof g2 ? (0, L2.cK)(g2) : g2, toBlock: "bigint" == typeof i2 ? (0, L2.cK)(i2) : i2, topics: k2 }] });
        return { abi: d10, args: e2, eventName: f2, id: l2, request: j3(l2), strict: !!h2, type: "event" };
      }
      async function be(a10, { address: b10, args: c10, event: d10, events: e2, fromBlock: f2, strict: g2, toBlock: h2 } = {}) {
        let i2 = e2 ?? (d10 ? [d10] : void 0), j3 = a3(a10, { method: "eth_newFilter" }), k2 = [];
        i2 && (k2 = [i2.flatMap((a11) => bb({ abi: [a11], eventName: a11.name, args: c10 }))], d10 && (k2 = k2[0]));
        let l2 = await a10.request({ method: "eth_newFilter", params: [{ address: b10, fromBlock: "bigint" == typeof f2 ? (0, L2.cK)(f2) : f2, toBlock: "bigint" == typeof h2 ? (0, L2.cK)(h2) : h2, ...k2.length ? { topics: k2 } : {} }] });
        return { abi: i2, args: c10, eventName: d10 ? d10.name : void 0, fromBlock: f2, id: l2, request: j3(l2), strict: !!g2, toBlock: h2, type: "event" };
      }
      async function bf(a10) {
        let b10 = a3(a10, { method: "eth_newPendingTransactionFilter" }), c10 = await a10.request({ method: "eth_newPendingTransactionFilter" });
        return { id: c10, request: b10(c10), type: "transaction" };
      }
      var bg = c(5808);
      async function bh({ hash: a10, signature: b10 }) {
        let d10 = (0, T2.q)(a10) ? a10 : (0, L2.nj)(a10), { secp256k1: e2 } = await Promise.resolve().then(c.bind(c, 5867)), f2 = (() => {
          if ("object" == typeof b10 && "r" in b10 && "s" in b10) {
            let { r: a12, s: c11, v: d11, yParity: f3 } = b10, g2 = bi(Number(f3 ?? d11));
            return new e2.Signature((0, bg.uU)(a12), (0, bg.uU)(c11)).addRecoveryBit(g2);
          }
          let a11 = (0, T2.q)(b10) ? b10 : (0, L2.nj)(b10);
          if (65 !== (0, J2.E)(a11)) throw Error("invalid signature length");
          let c10 = bi((0, bg.ME)(`0x${a11.slice(130)}`));
          return e2.Signature.fromCompact(a11.substring(2, 130)).addRecoveryBit(c10);
        })().recoverPublicKey(d10.substring(2)).toHex(false);
        return `0x${f2}`;
      }
      function bi(a10) {
        if (0 === a10 || 1 === a10) return a10;
        if (27 === a10) return 0;
        if (28 === a10) return 1;
        throw Error("Invalid yParityOrV value");
      }
      async function bj({ hash: a10, signature: b10 }) {
        var c10 = await bh({ hash: a10, signature: b10 });
        let d10 = (0, S.S)(`0x${c10.substring(4)}`).substring(26);
        return (0, H.o)(`0x${d10}`);
      }
      var bk = c(9581);
      function bl(a10) {
        if (a10 < 256) return 1;
        if (a10 < 65536) return 2;
        if (a10 < 16777216) return 3;
        if (a10 < 4294967296) return 4;
        throw new M.C("Length is too large.");
      }
      async function bm(a10) {
        let { authorization: b10, signature: c10 } = a10;
        return bj({ hash: function(a11) {
          let { chainId: b11, nonce: c11, to: d10 } = a11, e2 = a11.contractAddress ?? a11.address, f2 = (0, S.S)((0, Q2.aP)(["0x05", function(a12, b12 = "hex") {
            let c12 = function a13(b13) {
              return Array.isArray(b13) ? function(a14) {
                let b14 = a14.reduce((a15, b15) => a15 + b15.length, 0), c13 = bl(b14);
                return { length: b14 <= 55 ? 1 + b14 : 1 + c13 + b14, encode(d12) {
                  for (let { encode: e3 } of (b14 <= 55 ? d12.pushByte(192 + b14) : (d12.pushByte(247 + c13), 1 === c13 ? d12.pushUint8(b14) : 2 === c13 ? d12.pushUint16(b14) : 3 === c13 ? d12.pushUint24(b14) : d12.pushUint32(b14)), a14)) e3(d12);
                } };
              }(b13.map((b14) => a13(b14))) : function(a14) {
                let b14 = "string" == typeof a14 ? (0, R2.aT)(a14) : a14, c13 = bl(b14.length);
                return { length: 1 === b14.length && b14[0] < 128 ? 1 : b14.length <= 55 ? 1 + b14.length : 1 + c13 + b14.length, encode(a15) {
                  1 === b14.length && b14[0] < 128 || (b14.length <= 55 ? a15.pushByte(128 + b14.length) : (a15.pushByte(183 + c13), 1 === c13 ? a15.pushUint8(b14.length) : 2 === c13 ? a15.pushUint16(b14.length) : 3 === c13 ? a15.pushUint24(b14.length) : a15.pushUint32(b14.length))), a15.pushBytes(b14);
                } };
              }(b13);
            }(a12), d11 = (0, bk.l)(new Uint8Array(c12.length));
            return (c12.encode(d11), "hex" === b12) ? (0, L2.My)(d11.bytes) : d11.bytes;
          }([b11 ? (0, L2.cK)(b11) : "0x", e2, c11 ? (0, L2.cK)(c11) : "0x"])]));
          return "bytes" === d10 ? (0, R2.aT)(f2) : f2;
        }(b10), signature: c10 ?? b10 });
      }
      var bn = c(7591), bo = c(8367), bp = c(2133);
      class bq extends M.C {
        constructor(a10, { account: b10, docsPath: c10, chain: d10, data: e2, gas: f2, gasPrice: g2, maxFeePerGas: h2, maxPriorityFeePerGas: i2, nonce: j3, to: k2, value: l2 }) {
          super(a10.shortMessage, { cause: a10, docsPath: c10, metaMessages: [...a10.metaMessages ? [...a10.metaMessages, " "] : [], "Estimate Gas Arguments:", (0, bp.aO)({ from: b10?.address, to: k2, value: void 0 !== l2 && `${(0, bn.c)(l2)} ${d10?.nativeCurrency?.symbol || "ETH"}`, data: e2, gas: f2, gasPrice: void 0 !== g2 && `${(0, bo.Q)(g2)} gwei`, maxFeePerGas: void 0 !== h2 && `${(0, bo.Q)(h2)} gwei`, maxPriorityFeePerGas: void 0 !== i2 && `${(0, bo.Q)(i2)} gwei`, nonce: j3 })].filter(Boolean), name: "EstimateGasExecutionError" }), Object.defineProperty(this, "cause", { enumerable: true, configurable: true, writable: true, value: void 0 }), this.cause = a10;
        }
      }
      var br = c(7653), bs = c(6193), bt = c(3722);
      class bu extends M.C {
        constructor() {
          super("`baseFeeMultiplier` must be greater than 1.", { name: "BaseFeeScalarError" });
        }
      }
      class bv extends M.C {
        constructor() {
          super("Chain does not support EIP-1559 fees.", { name: "Eip1559FeesNotSupportedError" });
        }
      }
      class bw extends M.C {
        constructor({ maxPriorityFeePerGas: a10 }) {
          super(`\`maxFeePerGas\` cannot be less than the \`maxPriorityFeePerGas\` (${(0, bo.Q)(a10)} gwei).`, { name: "MaxFeePerGasTooLowError" });
        }
      }
      class bx extends M.C {
        constructor({ blockHash: a10, blockNumber: b10 }) {
          let c10 = "Block";
          a10 && (c10 = `Block at hash "${a10}"`), b10 && (c10 = `Block at number "${b10}"`), super(`${c10} could not be found.`, { name: "BlockNotFoundError" });
        }
      }
      let by = { "0x0": "legacy", "0x1": "eip2930", "0x2": "eip1559", "0x3": "eip4844", "0x4": "eip7702" };
      function bz(a10, b10) {
        let c10 = { ...a10, blockHash: a10.blockHash ? a10.blockHash : null, blockNumber: a10.blockNumber ? BigInt(a10.blockNumber) : null, ...null != a10.blockTimestamp && { blockTimestamp: BigInt(a10.blockTimestamp) }, chainId: a10.chainId ? (0, bg.ME)(a10.chainId) : void 0, gas: a10.gas ? BigInt(a10.gas) : void 0, gasPrice: a10.gasPrice ? BigInt(a10.gasPrice) : void 0, maxFeePerBlobGas: a10.maxFeePerBlobGas ? BigInt(a10.maxFeePerBlobGas) : void 0, maxFeePerGas: a10.maxFeePerGas ? BigInt(a10.maxFeePerGas) : void 0, maxPriorityFeePerGas: a10.maxPriorityFeePerGas ? BigInt(a10.maxPriorityFeePerGas) : void 0, nonce: a10.nonce ? (0, bg.ME)(a10.nonce) : void 0, to: a10.to ? a10.to : null, transactionIndex: a10.transactionIndex ? Number(a10.transactionIndex) : null, type: a10.type ? by[a10.type] : void 0, typeHex: a10.type ? a10.type : void 0, value: a10.value ? BigInt(a10.value) : void 0, v: a10.v ? BigInt(a10.v) : void 0 };
        return a10.authorizationList && (c10.authorizationList = a10.authorizationList.map((a11) => ({ address: a11.address, chainId: Number(a11.chainId), nonce: Number(a11.nonce), r: a11.r, s: a11.s, yParity: Number(a11.yParity) }))), c10.yParity = (() => {
          if (a10.yParity) return Number(a10.yParity);
          if ("bigint" == typeof c10.v) {
            if (0n === c10.v || 27n === c10.v) return 0;
            if (1n === c10.v || 28n === c10.v) return 1;
            if (c10.v >= 35n) return +(c10.v % 2n === 0n);
          }
        })(), "legacy" === c10.type && (delete c10.accessList, delete c10.maxFeePerBlobGas, delete c10.maxFeePerGas, delete c10.maxPriorityFeePerGas, delete c10.yParity), "eip2930" === c10.type && (delete c10.maxFeePerBlobGas, delete c10.maxFeePerGas, delete c10.maxPriorityFeePerGas), "eip1559" === c10.type && delete c10.maxFeePerBlobGas, c10;
      }
      function bA(a10, b10) {
        let c10 = (a10.transactions ?? []).map((a11) => "string" == typeof a11 ? a11 : bz(a11));
        return { ...a10, baseFeePerGas: a10.baseFeePerGas ? BigInt(a10.baseFeePerGas) : null, blobGasUsed: a10.blobGasUsed ? BigInt(a10.blobGasUsed) : void 0, difficulty: a10.difficulty ? BigInt(a10.difficulty) : void 0, excessBlobGas: a10.excessBlobGas ? BigInt(a10.excessBlobGas) : void 0, gasLimit: a10.gasLimit ? BigInt(a10.gasLimit) : void 0, gasUsed: a10.gasUsed ? BigInt(a10.gasUsed) : void 0, hash: a10.hash ? a10.hash : null, logsBloom: a10.logsBloom ? a10.logsBloom : null, nonce: a10.nonce ? a10.nonce : null, number: a10.number ? BigInt(a10.number) : null, size: a10.size ? BigInt(a10.size) : void 0, timestamp: a10.timestamp ? BigInt(a10.timestamp) : void 0, transactions: c10, totalDifficulty: a10.totalDifficulty ? BigInt(a10.totalDifficulty) : null };
      }
      async function bB(a10, { blockHash: b10, blockNumber: c10, blockTag: d10 = a10.experimental_blockTag ?? "latest", includeTransactions: e2 } = {}) {
        let f2 = e2 ?? false, g2 = void 0 !== c10 ? (0, L2.cK)(c10) : void 0, h2 = null;
        if (!(h2 = b10 ? await a10.request({ method: "eth_getBlockByHash", params: [b10, f2] }, { dedupe: true }) : await a10.request({ method: "eth_getBlockByNumber", params: [g2 || d10, f2] }, { dedupe: !!g2 }))) throw new bx({ blockHash: b10, blockNumber: c10 });
        return (a10.chain?.formatters?.block?.format || bA)(h2, "getBlock");
      }
      async function bC(a10) {
        return BigInt(await a10.request({ method: "eth_gasPrice" }));
      }
      async function bD(a10, b10) {
        return bE(a10, b10);
      }
      async function bE(a10, b10) {
        let { block: c10, chain: d10 = a10.chain, request: e2 } = b10 || {};
        try {
          let b11 = d10?.fees?.maxPriorityFeePerGas ?? d10?.fees?.defaultPriorityFee;
          if ("function" == typeof b11) {
            let d11 = c10 || await X(a10, bB, "getBlock")({}), f3 = await b11({ block: d11, client: a10, request: e2 });
            if (null === f3) throw Error();
            return f3;
          }
          if (void 0 !== b11) return b11;
          let f2 = await a10.request({ method: "eth_maxPriorityFeePerGas" });
          return (0, bg.uU)(f2);
        } catch {
          let [b11, d11] = await Promise.all([c10 ? Promise.resolve(c10) : X(a10, bB, "getBlock")({}), X(a10, bC, "getGasPrice")({})]);
          if ("bigint" != typeof b11.baseFeePerGas) throw new bv();
          let e3 = d11 - b11.baseFeePerGas;
          if (e3 < 0n) return 0n;
          return e3;
        }
      }
      async function bF(a10, b10) {
        return bG(a10, b10);
      }
      async function bG(a10, b10) {
        let { block: c10, chain: d10 = a10.chain, request: e2, type: f2 = "eip1559" } = b10 || {}, g2 = await (async () => "function" == typeof d10?.fees?.baseFeeMultiplier ? d10.fees.baseFeeMultiplier({ block: c10, client: a10, request: e2 }) : d10?.fees?.baseFeeMultiplier ?? 1.2)();
        if (g2 < 1) throw new bu();
        let h2 = g2.toString().split(".")[1]?.length ?? 0, i2 = 10 ** h2, j3 = (a11) => a11 * BigInt(Math.ceil(g2 * i2)) / BigInt(i2), k2 = c10 || await X(a10, bB, "getBlock")({});
        if ("function" == typeof d10?.fees?.estimateFeesPerGas) {
          let b11 = await d10.fees.estimateFeesPerGas({ block: c10, client: a10, multiply: j3, request: e2, type: f2 });
          if (null !== b11) return b11;
        }
        if ("eip1559" === f2) {
          if ("bigint" != typeof k2.baseFeePerGas) throw new bv();
          let b11 = "bigint" == typeof e2?.maxPriorityFeePerGas ? e2.maxPriorityFeePerGas : await bE(a10, { block: k2, chain: d10, request: e2 }), c11 = j3(k2.baseFeePerGas);
          return { maxFeePerGas: e2?.maxFeePerGas ?? c11 + b11, maxPriorityFeePerGas: b11 };
        }
        return { gasPrice: e2?.gasPrice ?? j3(await X(a10, bC, "getGasPrice")({})) };
      }
      var bH = c(3862);
      async function bI(a10, { address: b10, blockHash: c10, blockNumber: d10, blockTag: e2 = "latest", requireCanonical: f2 }) {
        let g2 = (0, bH.O)({ blockHash: c10, blockNumber: d10, blockTag: e2, requireCanonical: f2 }), h2 = await a10.request({ method: "eth_getTransactionCount", params: [b10, g2] }, { dedupe: "bigint" == typeof d10 || void 0 !== c10 });
        return (0, bg.ME)(h2);
      }
      function bJ(a10) {
        let { kzg: b10 } = a10, c10 = a10.to ?? ("string" == typeof a10.blobs[0] ? "hex" : "bytes"), d10 = "string" == typeof a10.blobs[0] ? a10.blobs.map((a11) => (0, R2.aT)(a11)) : a10.blobs, e2 = [];
        for (let a11 of d10) e2.push(Uint8Array.from(b10.blobToKzgCommitment(a11)));
        return "bytes" === c10 ? e2 : e2.map((a11) => (0, L2.My)(a11));
      }
      function bK(a10) {
        let { kzg: b10 } = a10, c10 = a10.to ?? ("string" == typeof a10.blobs[0] ? "hex" : "bytes"), d10 = "string" == typeof a10.blobs[0] ? a10.blobs.map((a11) => (0, R2.aT)(a11)) : a10.blobs, e2 = "string" == typeof a10.commitments[0] ? a10.commitments.map((a11) => (0, R2.aT)(a11)) : a10.commitments, f2 = [];
        for (let a11 = 0; a11 < d10.length; a11++) {
          let c11 = d10[a11], g2 = e2[a11];
          f2.push(Uint8Array.from(b10.computeBlobKzgProof(c11, g2)));
        }
        return "bytes" === c10 ? f2 : f2.map((a11) => (0, L2.My)(a11));
      }
      let bL = c(7809).sc;
      class bM extends M.C {
        constructor({ maxSize: a10, size: b10 }) {
          super("Blob size is too large.", { metaMessages: [`Max: ${a10} bytes`, `Given: ${b10} bytes`], name: "BlobSizeTooLargeError" });
        }
      }
      class bN extends M.C {
        constructor() {
          super("Blob data must not be empty.", { name: "EmptyBlobError" });
        }
      }
      M.C, M.C;
      var bO = c(2226);
      async function bP(a10) {
        let b10 = await a10.request({ method: "eth_chainId" }, { dedupe: true });
        return (0, bg.ME)(b10);
      }
      async function bQ(a10, b10) {
        let { account: c10 = a10.account, accessList: d10, authorizationList: e2, chain: f2 = a10.chain, blobVersionedHashes: g2, blobs: h2, data: i2, gas: j3, gasPrice: k2, maxFeePerBlobGas: l2, maxFeePerGas: m2, maxPriorityFeePerGas: n2, nonce: o2, nonceManager: p2, to: q3, type: r2, value: s2, ...t2 } = b10, u2 = await (async () => {
          if (!c10 || !p2 || void 0 !== o2) return o2;
          let b11 = (0, B2.J)(c10), d11 = f2 ? f2.id : await X(a10, bP, "getChainId")({});
          return await p2.consume({ address: b11.address, chainId: d11, client: a10 });
        })();
        (0, a1.c)(b10);
        let v3 = f2?.formatters?.transactionRequest?.format, w3 = (v3 || a0.Bv)({ ...(0, a_.o)(t2, { format: v3 }), account: c10 ? (0, B2.J)(c10) : void 0, accessList: d10, authorizationList: e2, blobs: h2, blobVersionedHashes: g2, data: i2, gas: j3, gasPrice: k2, maxFeePerBlobGas: l2, maxFeePerGas: m2, maxPriorityFeePerGas: n2, nonce: u2, to: q3, type: r2, value: s2 }, "fillTransaction");
        try {
          let c11 = await a10.request({ method: "eth_fillTransaction", params: [w3] }), d11 = (f2?.formatters?.transaction?.format || bz)(c11.tx);
          delete d11.blockHash, delete d11.blockNumber, delete d11.r, delete d11.s, delete d11.transactionIndex, delete d11.v, delete d11.yParity, d11.data = d11.input, d11.gas && (d11.gas = b10.gas ?? d11.gas), d11.gasPrice && (d11.gasPrice = b10.gasPrice ?? d11.gasPrice), d11.maxFeePerBlobGas && (d11.maxFeePerBlobGas = b10.maxFeePerBlobGas ?? d11.maxFeePerBlobGas), d11.maxFeePerGas && (d11.maxFeePerGas = b10.maxFeePerGas ?? d11.maxFeePerGas), d11.maxPriorityFeePerGas && (d11.maxPriorityFeePerGas = b10.maxPriorityFeePerGas ?? d11.maxPriorityFeePerGas), void 0 !== d11.nonce && (d11.nonce = b10.nonce ?? d11.nonce);
          let e3 = await (async () => {
            if ("function" == typeof f2?.fees?.baseFeeMultiplier) {
              let c12 = await X(a10, bB, "getBlock")({});
              return f2.fees.baseFeeMultiplier({ block: c12, client: a10, request: b10 });
            }
            return f2?.fees?.baseFeeMultiplier ?? 1.2;
          })();
          if (e3 < 1) throw new bu();
          let g3 = e3.toString().split(".")[1]?.length ?? 0, h3 = 10 ** g3, i3 = (a11) => a11 * BigInt(Math.ceil(e3 * h3)) / BigInt(h3);
          return d11.feePayerSignature || (d11.maxFeePerGas && !b10.maxFeePerGas && (d11.maxFeePerGas = i3(d11.maxFeePerGas)), d11.gasPrice && !b10.gasPrice && (d11.gasPrice = i3(d11.gasPrice))), { raw: c11.raw, transaction: { from: w3.from, ...d11 }, ...c11.capabilities ? { capabilities: c11.capabilities } : {} };
        } catch (c11) {
          throw function(a11, { docsPath: b11, ...c12 }) {
            let d11 = (() => {
              let b12 = (0, bs.l)(a11, c12);
              return b12 instanceof br.RM ? a11 : b12;
            })();
            return new bp.$s(d11, { docsPath: b11, ...c12 });
          }(c11, { ...b10, chain: a10.chain });
        }
      }
      let bR = ["blobVersionedHashes", "chainId", "fees", "gas", "nonce", "type"], bS = /* @__PURE__ */ new Map(), bT = new bO.A(128);
      async function bU(a10, b10) {
        let c10, d10, e2 = b10;
        e2.account ??= a10.account, e2.parameters ??= bR;
        let { account: f2, chain: g2 = a10.chain, nonceManager: h2, parameters: i2 } = e2, j3 = "function" == typeof g2?.prepareTransactionRequest ? { fn: g2.prepareTransactionRequest, runAt: ["beforeFillTransaction"] } : Array.isArray(g2?.prepareTransactionRequest) ? { fn: g2.prepareTransactionRequest[0], runAt: g2.prepareTransactionRequest[1].runAt } : void 0;
        async function k2() {
          return c10 ? c10 : void 0 !== e2.chainId ? e2.chainId : g2 ? g2.id : c10 = await X(a10, bP, "getChainId")({});
        }
        let l2 = f2 ? (0, B2.J)(f2) : f2, m2 = e2.nonce;
        if (i2.includes("nonce") && void 0 === m2 && l2 && h2) {
          let b11 = await k2();
          m2 = await h2.consume({ address: l2.address, chainId: b11, client: a10 });
        }
        j3?.fn && j3.runAt?.includes("beforeFillTransaction") && (e2 = await j3.fn({ ...e2, chain: g2 }, { phase: "beforeFillTransaction" }), m2 ??= e2.nonce);
        let n2 = (!(i2.includes("blobVersionedHashes") || i2.includes("sidecars")) || !e2.kzg || !e2.blobs) && false !== bT.get(a10.uid) && ["fees", "gas"].some((a11) => i2.includes(a11)) && (i2.includes("chainId") && "number" != typeof e2.chainId || i2.includes("nonce") && "number" != typeof m2 || i2.includes("fees") && "bigint" != typeof e2.gasPrice && ("bigint" != typeof e2.maxFeePerGas || "bigint" != typeof e2.maxPriorityFeePerGas) || i2.includes("gas") && "bigint" != typeof e2.gas) ? await X(a10, bQ, "fillTransaction")({ ...e2, nonce: m2 }).then((b11) => {
          let { chainId: c11, from: d11, gas: f3, gasPrice: g3, nonce: h3, maxFeePerBlobGas: i3, maxFeePerGas: j4, maxPriorityFeePerGas: k3, type: l3, ...m3 } = b11.transaction;
          return bT.set(a10.uid, true), { ...e2, ...d11 ? { from: d11 } : {}, ...l3 && !e2.type ? { type: l3 } : {}, ...void 0 !== c11 ? { chainId: c11 } : {}, ...void 0 !== f3 ? { gas: f3 } : {}, ...void 0 !== g3 ? { gasPrice: g3 } : {}, ...void 0 !== h3 ? { nonce: h3 } : {}, ...void 0 !== i3 && "legacy" !== e2.type && "eip2930" !== e2.type ? { maxFeePerBlobGas: i3 } : {}, ...void 0 !== j4 && "legacy" !== e2.type && "eip2930" !== e2.type ? { maxFeePerGas: j4 } : {}, ...void 0 !== k3 && "legacy" !== e2.type && "eip2930" !== e2.type ? { maxPriorityFeePerGas: k3 } : {}, ..."nonceKey" in m3 && void 0 !== m3.nonceKey ? { nonceKey: m3.nonceKey } : {}, ..."keyAuthorization" in m3 && void 0 !== m3.keyAuthorization && null !== m3.keyAuthorization && !("keyAuthorization" in e2) ? { keyAuthorization: m3.keyAuthorization } : {}, ..."feePayerSignature" in m3 && void 0 !== m3.feePayerSignature && null !== m3.feePayerSignature ? { feePayerSignature: m3.feePayerSignature } : {}, ..."feeToken" in m3 && void 0 !== m3.feeToken && null !== m3.feeToken && !("feeToken" in e2) ? { feeToken: m3.feeToken } : {}, ...b11.capabilities ? { _capabilities: b11.capabilities } : {} };
        }).catch((b11) => {
          if ("TransactionExecutionError" !== b11.name) return e2;
          if (b11.walk?.((a11) => "ExecutionRevertedError" === a11.name)) throw b11;
          return b11.walk?.((a11) => "MethodNotFoundRpcError" === a11.name || "MethodNotSupportedRpcError" === a11.name || a11.message?.includes("eth_fillTransaction is not available")) && bT.set(a10.uid, false), e2;
        }) : e2;
        m2 ??= n2.nonce;
        let { blobs: o2, gas: p2, kzg: q3, type: r2 } = e2 = { ...n2, ...l2 ? { from: l2?.address } : {}, ...void 0 !== m2 ? { nonce: m2 } : {} };
        async function s2() {
          return d10 || (d10 = await X(a10, bB, "getBlock")({ blockTag: "latest" }));
        }
        if (j3?.fn && j3.runAt?.includes("beforeFillParameters") && (e2 = await j3.fn({ ...e2, chain: g2 }, { phase: "beforeFillParameters" })), i2.includes("nonce") && void 0 === m2 && l2 && !h2 && (e2.nonce = await X(a10, bI, "getTransactionCount")({ address: l2.address, blockTag: "pending" })), (i2.includes("blobVersionedHashes") || i2.includes("sidecars")) && o2 && q3) {
          let a11 = bJ({ blobs: o2, kzg: q3 });
          if (i2.includes("blobVersionedHashes")) {
            let b11 = function(a12) {
              let { commitments: b12, version: c11 } = a12, d11 = a12.to ?? ("string" == typeof b12[0] ? "hex" : "bytes"), e3 = [];
              for (let a13 of b12) e3.push(function(a14) {
                let { commitment: b13, version: c12 = 1 } = a14, d12 = a14.to ?? ("string" == typeof b13 ? "hex" : "bytes"), e4 = function(a15, b14) {
                  let c13 = bL((0, T2.q)(a15, { strict: false }) ? (0, R2.ZJ)(a15) : a15);
                  return "bytes" === (b14 || "hex") ? c13 : (0, L2.nj)(c13);
                }(b13, "bytes");
                return e4.set([c12], 0), "bytes" === d12 ? e4 : (0, L2.My)(e4);
              }({ commitment: a13, to: d11, version: c11 }));
              return e3;
            }({ commitments: a11, to: "hex" });
            e2.blobVersionedHashes = b11;
          }
          if (i2.includes("sidecars")) {
            let b11 = bK({ blobs: o2, commitments: a11, kzg: q3 }), c11 = function(a12) {
              let { data: b12, kzg: c12, to: d11 } = a12, e3 = a12.blobs ?? function(a13) {
                let b13 = a13.to ?? ("string" == typeof a13.data ? "hex" : "bytes"), c13 = "string" == typeof a13.data ? (0, R2.aT)(a13.data) : a13.data, d12 = (0, J2.E)(c13);
                if (!d12) throw new bN();
                if (d12 > 761855) throw new bM({ maxSize: 761855, size: d12 });
                let e4 = [], f4 = true, g4 = 0;
                for (; f4; ) {
                  let a14 = (0, bk.l)(new Uint8Array(131072)), b14 = 0;
                  for (; b14 < 4096; ) {
                    let d13 = c13.slice(g4, g4 + 31);
                    if (a14.pushByte(0), a14.pushBytes(d13), d13.length < 31) {
                      a14.pushByte(128), f4 = false;
                      break;
                    }
                    b14++, g4 += 31;
                  }
                  e4.push(a14);
                }
                return "bytes" === b13 ? e4.map((a14) => a14.bytes) : e4.map((a14) => (0, L2.My)(a14.bytes));
              }({ data: b12, to: d11 }), f3 = a12.commitments ?? bJ({ blobs: e3, kzg: c12, to: d11 }), g3 = a12.proofs ?? bK({ blobs: e3, commitments: f3, kzg: c12, to: d11 }), h3 = [];
              for (let a13 = 0; a13 < e3.length; a13++) h3.push({ blob: e3[a13], commitment: f3[a13], proof: g3[a13] });
              return h3;
            }({ blobs: o2, commitments: a11, proofs: b11, to: "hex" });
            e2.sidecars = c11;
          }
        }
        if (i2.includes("chainId") && (e2.chainId = await k2()), (i2.includes("fees") || i2.includes("type")) && void 0 === r2) try {
          e2.type = function(a11) {
            if (a11.type) return a11.type;
            if (void 0 !== a11.authorizationList) return "eip7702";
            if (void 0 !== a11.blobs || void 0 !== a11.blobVersionedHashes || void 0 !== a11.maxFeePerBlobGas || void 0 !== a11.sidecars) return "eip4844";
            if (void 0 !== a11.maxFeePerGas || void 0 !== a11.maxPriorityFeePerGas) return "eip1559";
            if (void 0 !== a11.gasPrice) return void 0 !== a11.accessList ? "eip2930" : "legacy";
            throw new bp.Vg({ transaction: a11 });
          }(e2);
        } catch {
          let b11 = bS.get(a10.uid);
          if (void 0 === b11) {
            let c11 = await s2();
            b11 = "bigint" == typeof c11?.baseFeePerGas, bS.set(a10.uid, b11);
          }
          e2.type = b11 ? "eip1559" : "legacy";
        }
        if (i2.includes("fees")) if ("legacy" !== e2.type && "eip2930" !== e2.type) {
          if (void 0 === e2.maxFeePerGas || void 0 === e2.maxPriorityFeePerGas) {
            let b11 = await s2(), { maxFeePerGas: c11, maxPriorityFeePerGas: d11 } = await bG(a10, { block: b11, chain: g2, request: e2 });
            if (void 0 === e2.maxPriorityFeePerGas && e2.maxFeePerGas && e2.maxFeePerGas < d11) throw new bw({ maxPriorityFeePerGas: d11 });
            e2.maxPriorityFeePerGas = d11, e2.maxFeePerGas = c11;
          }
        } else {
          if (void 0 !== e2.maxFeePerGas || void 0 !== e2.maxPriorityFeePerGas) throw new bv();
          if (void 0 === e2.gasPrice) {
            let b11 = await s2(), { gasPrice: c11 } = await bG(a10, { block: b11, chain: g2, request: e2, type: "legacy" });
            e2.gasPrice = c11;
          }
        }
        return i2.includes("gas") && void 0 === p2 && (e2.gas = await X(a10, bV, "estimateGas")({ ...e2, account: l2, prepare: l2?.type === "local" ? [] : ["blobVersionedHashes"] })), j3?.fn && j3.runAt?.includes("afterFillParameters") && (e2 = await j3.fn({ ...e2, chain: g2 }, { phase: "afterFillParameters" })), (0, a1.c)(e2), delete e2.parameters, e2;
      }
      async function bV(a10, b10) {
        let { account: c10 = a10.account, prepare: d10 = true } = b10, e2 = c10 ? (0, B2.J)(c10) : void 0, f2 = Array.isArray(d10) ? d10 : e2?.type !== "local" ? ["blobVersionedHashes"] : void 0;
        try {
          let c11 = await (async () => b10.to ? b10.to : b10.authorizationList && b10.authorizationList.length > 0 ? await bm({ authorization: b10.authorizationList[0] }).catch(() => {
            throw new M.C("`to` is required. Could not infer from `authorizationList`");
          }) : void 0)(), { accessList: g2, authorizationList: h2, blobs: i2, blobVersionedHashes: j3, blockNumber: k2, blockTag: l2, data: m2, gas: n2, gasPrice: o2, maxFeePerBlobGas: p2, maxFeePerGas: q3, maxPriorityFeePerGas: r2, nonce: s2, value: t2, stateOverride: u2, ...v3 } = d10 ? await bU(a10, { ...b10, parameters: f2, to: c11 }) : b10;
          if (n2 && b10.gas !== n2) return n2;
          let w3 = ("bigint" == typeof k2 ? (0, L2.cK)(k2) : void 0) || l2, x3 = (0, bt.yH)(u2);
          (0, a1.c)(b10);
          let y2 = a10.chain?.formatters?.transactionRequest?.format, z3 = (y2 || a0.Bv)({ ...(0, a_.o)(v3, { format: y2 }), account: e2, accessList: g2, authorizationList: h2, blobs: i2, blobVersionedHashes: j3, data: m2, gasPrice: o2, maxFeePerBlobGas: p2, maxFeePerGas: q3, maxPriorityFeePerGas: r2, nonce: s2, to: c11, value: t2 }, "estimateGas");
          return BigInt(await a10.request({ method: "eth_estimateGas", params: x3 ? [z3, w3 ?? a10.experimental_blockTag ?? "latest", x3] : w3 ? [z3, w3] : [z3] }));
        } catch (c11) {
          throw function(a11, { docsPath: b11, ...c12 }) {
            return new bq((() => {
              let b12 = (0, bs.l)(a11, c12);
              return b12 instanceof br.RM ? a11 : b12;
            })(), { docsPath: b11, ...c12 });
          }(c11, { ...b10, account: e2, chain: a10.chain });
        }
      }
      async function bW(a10, b10) {
        let { abi: c10, address: d10, args: e2, functionName: f2, dataSuffix: g2 = "string" == typeof a10.dataSuffix ? a10.dataSuffix : a10.dataSuffix?.value, ...h2 } = b10, i2 = (0, G2.p)({ abi: c10, args: e2, functionName: f2 });
        try {
          return await X(a10, bV, "estimateGas")({ data: `${i2}${g2 ? g2.replace("0x", "") : ""}`, to: d10, ...h2 });
        } catch (b11) {
          let a11 = h2.account ? (0, B2.J)(h2.account) : void 0;
          throw aB(b11, { abi: c10, address: d10, args: e2, docsPath: "/docs/contract/estimateContractGas", functionName: f2, sender: a11?.address });
        }
      }
      async function bX(a10, { address: b10, blockHash: c10, blockNumber: d10, blockTag: e2 = a10.experimental_blockTag ?? "latest", requireCanonical: f2 }) {
        let g2 = (0, bH.O)({ blockHash: c10, blockNumber: d10, blockTag: e2, requireCanonical: f2 });
        if (a10.batch?.multicall && a10.chain?.contracts?.multicall3) {
          let g3 = a10.chain.contracts.multicall3.address, h2 = (0, G2.p)({ abi: E.v2, functionName: "getEthBalance", args: [b10] }), { data: i2 } = await X(a10, aC.T, "call")({ to: g3, data: h2, blockHash: c10, blockNumber: d10, blockTag: e2, requireCanonical: f2 });
          return (0, F2.e)({ abi: E.v2, functionName: "getEthBalance", args: [b10], data: i2 || "0x" });
        }
        return BigInt(await a10.request({ method: "eth_getBalance", params: [b10, g2] }));
      }
      async function bY(a10) {
        return BigInt(await a10.request({ method: "eth_blobBaseFee" }));
      }
      let bZ = /* @__PURE__ */ new Map(), b$ = /* @__PURE__ */ new Map();
      async function b_(a10, { cacheKey: b10, cacheTime: c10 = 1 / 0 }) {
        let d10 = function(a11) {
          let b11 = (a12, b12) => ({ clear: () => b12.delete(a12), get: () => b12.get(a12), set: (c12) => b12.set(a12, c12) }), c11 = b11(a11, bZ), d11 = b11(a11, b$);
          return { clear: () => {
            c11.clear(), d11.clear();
          }, promise: c11, response: d11 };
        }(b10), e2 = d10.response.get();
        if (e2 && c10 > 0 && Date.now() - e2.created.getTime() < c10) return e2.data;
        let f2 = d10.promise.get();
        f2 || (f2 = a10(), d10.promise.set(f2));
        try {
          let a11 = await f2;
          return d10.response.set({ created: /* @__PURE__ */ new Date(), data: a11 }), a11;
        } finally {
          d10.promise.clear();
        }
      }
      async function b0(a10, { cacheTime: b10 = a10.cacheTime } = {}) {
        let c10;
        return BigInt(await b_(() => a10.request({ method: "eth_blockNumber" }), { cacheKey: (c10 = a10.uid, `blockNumber.${c10}`), cacheTime: b10 }));
      }
      async function b1(a10, { blockHash: b10, blockNumber: c10, blockTag: d10 = "latest" } = {}) {
        let e2, f2 = void 0 !== c10 ? (0, L2.cK)(c10) : void 0;
        return e2 = b10 ? await a10.request({ method: "eth_getBlockTransactionCountByHash", params: [b10] }, { dedupe: true }) : await a10.request({ method: "eth_getBlockTransactionCountByNumber", params: [f2 || d10] }, { dedupe: !!f2 }), (0, bg.ME)(e2);
      }
      async function b22(a10, { address: b10, blockHash: c10, blockNumber: d10, blockTag: e2 = "latest", requireCanonical: f2 }) {
        let g2 = (0, bH.O)({ blockHash: c10, blockNumber: d10, blockTag: e2, requireCanonical: f2 }), h2 = await a10.request({ method: "eth_getCode", params: [b10, g2] }, { dedupe: "bigint" == typeof d10 || void 0 !== c10 });
        if ("0x" !== h2) return h2;
      }
      var b3 = c(1478);
      function b4(a10, { args: b10, eventName: c10 } = {}) {
        return { ...a10, blockHash: a10.blockHash ? a10.blockHash : null, blockNumber: a10.blockNumber ? BigInt(a10.blockNumber) : null, blockTimestamp: a10.blockTimestamp ? BigInt(a10.blockTimestamp) : null === a10.blockTimestamp ? null : void 0, logIndex: a10.logIndex ? Number(a10.logIndex) : null, transactionHash: a10.transactionHash ? a10.transactionHash : null, transactionIndex: a10.transactionIndex ? Number(a10.transactionIndex) : null, ...c10 ? { args: b10, eventName: c10 } : {} };
      }
      var b5 = c(1863), b6 = c(9304);
      let b7 = "/docs/contract/decodeEventLog";
      function b8(a10) {
        let { abi: b10, data: c10, strict: d10, topics: e2 } = a10, f2 = d10 ?? true, [g2, ...h2] = e2;
        if (!g2) throw new Y2._z({ docsPath: b7 });
        let i2 = b10.find((a11) => "event" === a11.type && g2 === (0, a6.h)((0, a8.B)(a11)));
        if (!(i2 && "name" in i2) || "event" !== i2.type) throw new Y2.kE(g2, { docsPath: b7 });
        let { name: j3, inputs: k2 } = i2, l2 = k2?.some((a11) => !("name" in a11 && a11.name)), m2 = l2 ? [] : {}, n2 = k2.map((a11, b11) => [a11, b11]).filter(([a11]) => "indexed" in a11 && a11.indexed), o2 = [];
        for (let a11 = 0; a11 < n2.length; a11++) {
          let [b11, c11] = n2[a11], d11 = h2[a11];
          if (!d11) {
            if (f2) throw new Y2.l3({ abiItem: i2, param: b11 });
            o2.push([b11, c11]);
            continue;
          }
          m2[l2 ? c11 : b11.name || c11] = function({ param: a12, value: b12 }) {
            return "string" === a12.type || "bytes" === a12.type || "tuple" === a12.type || a12.type.match(/^(.*)\[(\d+)?\]$/) ? b12 : ((0, b6.n)([a12], b12) || [])[0];
          }({ param: b11, value: d11 });
        }
        let p2 = k2.filter((a11) => !("indexed" in a11 && a11.indexed)), q3 = f2 ? p2 : [...o2.map(([a11]) => a11), ...p2];
        if (q3.length > 0) {
          if (c10 && "0x" !== c10) try {
            let a11 = (0, b6.n)(q3, c10);
            if (a11) {
              let b11 = 0;
              if (!f2) for (let [c11, d11] of o2) m2[l2 ? d11 : c11.name || d11] = a11[b11++];
              if (l2) for (let c11 = 0; c11 < k2.length; c11++) void 0 === m2[c11] && b11 < a11.length && (m2[c11] = a11[b11++]);
              else for (let c11 = 0; c11 < p2.length; c11++) m2[p2[c11].name] = a11[b11++];
            }
          } catch (a11) {
            if (f2) {
              if (a11 instanceof Y2.Iy || a11 instanceof b5.SK) throw new Y2.fo({ abiItem: i2, data: c10, params: q3, size: (0, J2.E)(c10) });
              throw a11;
            }
          }
          else if (f2) throw new Y2.fo({ abiItem: i2, data: "0x", params: q3, size: 0 });
        }
        return { eventName: j3, args: Object.values(m2).length > 0 ? m2 : void 0 };
      }
      function b9(a10) {
        let { abi: b10, args: c10, logs: d10, strict: e2 = true } = a10, f2 = (() => {
          if (a10.eventName) return Array.isArray(a10.eventName) ? a10.eventName : [a10.eventName];
        })(), g2 = b10.filter((a11) => "event" === a11.type).map((a11) => ({ abi: a11, selector: (0, a6.h)(a11) }));
        return d10.map((a11) => {
          let b11, d11, h2 = "string" == typeof a11.blockNumber ? b4(a11) : a11, i2 = g2.filter((a12) => h2.topics[0] === a12.selector);
          if (0 === i2.length) return null;
          for (let a12 of i2) try {
            b11 = b8({ ...h2, abi: [a12.abi], strict: true }), d11 = a12;
            break;
          } catch {
          }
          if (!b11 && !e2) {
            d11 = i2[0];
            try {
              b11 = b8({ data: h2.data, topics: h2.topics, abi: [d11.abi], strict: false });
            } catch {
              let a12 = d11.abi.inputs?.some((a13) => !("name" in a13 && a13.name));
              return { ...h2, args: a12 ? [] : {}, eventName: d11.abi.name };
            }
          }
          return b11 && d11 && (!f2 || f2.includes(b11.eventName)) && function(a12) {
            let { args: b12, inputs: c11, matchArgs: d12 } = a12;
            if (!d12) return true;
            if (!b12) return false;
            function e3(a13, b13, c12) {
              try {
                if ("address" === a13.type) return (0, b3.h)(b13, c12);
                if ("string" === a13.type || "bytes" === a13.type) return (0, S.S)((0, R2.ZJ)(b13)) === c12;
                return b13 === c12;
              } catch {
                return false;
              }
            }
            return Array.isArray(b12) && Array.isArray(d12) ? d12.every((a13, d13) => {
              if (null == a13) return true;
              let f3 = c11[d13];
              return !!f3 && (Array.isArray(a13) ? a13 : [a13]).some((a14) => e3(f3, a14, b12[d13]));
            }) : !("object" != typeof b12 || Array.isArray(b12) || "object" != typeof d12 || Array.isArray(d12)) && Object.entries(d12).every(([a13, d13]) => {
              if (null == d13) return true;
              let f3 = c11.find((b13) => b13.name === a13);
              return !!f3 && (Array.isArray(d13) ? d13 : [d13]).some((c12) => e3(f3, c12, b12[a13]));
            });
          }({ args: b11.args, inputs: d11.abi.inputs, matchArgs: c10 }) ? { ...b11, ...h2 } : null;
        }).filter(Boolean);
      }
      async function ca(a10, { address: b10, blockHash: c10, fromBlock: d10, toBlock: e2, event: f2, events: g2, args: h2, strict: i2 } = {}) {
        let j3 = g2 ?? (f2 ? [f2] : void 0), k2 = [];
        j3 && (k2 = [j3.flatMap((a11) => bb({ abi: [a11], eventName: a11.name, args: g2 ? void 0 : h2 }))], f2 && (k2 = k2[0]));
        let l2 = (c10 ? await a10.request({ method: "eth_getLogs", params: [{ address: b10, topics: k2, blockHash: c10 }] }) : await a10.request({ method: "eth_getLogs", params: [{ address: b10, topics: k2, fromBlock: "bigint" == typeof d10 ? (0, L2.cK)(d10) : d10, toBlock: "bigint" == typeof e2 ? (0, L2.cK)(e2) : e2 }] })).map((a11) => b4(a11));
        return j3 ? b9({ abi: j3, args: h2, logs: l2, strict: i2 ?? false }) : l2;
      }
      async function cb(a10, b10) {
        let { abi: c10, address: d10, args: e2, blockHash: f2, eventName: g2, fromBlock: h2, toBlock: i2, strict: j3 } = b10, k2 = g2 ? (0, a9.iY)({ abi: c10, name: g2 }) : void 0, l2 = k2 ? void 0 : c10.filter((a11) => "event" === a11.type);
        return X(a10, ca, "getLogs")({ address: d10, args: e2, blockHash: f2, event: k2, events: l2, fromBlock: h2, toBlock: i2, strict: j3 });
      }
      var cc = c(5022);
      async function cd(a10, { address: b10, blockNumber: c10, blockTag: d10 = "latest" }) {
        let e2 = await b22(a10, { address: b10, ...void 0 !== c10 ? { blockNumber: c10 } : { blockTag: d10 } });
        if (e2 && 23 === (0, J2.E)(e2) && e2.startsWith("0xef0100")) return (0, H.b)((0, cc.di)(e2, 3, 23));
      }
      class ce2 extends M.C {
        constructor({ address: a10 }) {
          super(`No EIP-712 domain found on contract "${a10}".`, { metaMessages: ["Ensure that:", `- The contract is deployed at the address "${a10}".`, "- `eip712Domain()` function exists on the contract.", "- `eip712Domain()` function matches signature to ERC-5267 specification."], name: "Eip712DomainNotFoundError" });
        }
      }
      async function cf(a10, b10) {
        let { address: c10, factory: d10, factoryData: e2 } = b10;
        try {
          let [b11, f2, g2, h2, i2, j3, k2] = await X(a10, aD, "readContract")({ abi: cg, address: c10, functionName: "eip712Domain", factory: d10, factoryData: e2 });
          return { domain: { name: f2, version: g2, chainId: Number(h2), verifyingContract: i2, salt: j3 }, extensions: k2, fields: b11 };
        } catch (a11) {
          if ("ContractFunctionExecutionError" === a11.name && "ContractFunctionZeroDataError" === a11.cause.name) throw new ce2({ address: c10 });
          throw a11;
        }
      }
      let cg = [{ inputs: [], name: "eip712Domain", outputs: [{ name: "fields", type: "bytes1" }, { name: "name", type: "string" }, { name: "version", type: "string" }, { name: "chainId", type: "uint256" }, { name: "verifyingContract", type: "address" }, { name: "salt", type: "bytes32" }, { name: "extensions", type: "uint256[]" }], stateMutability: "view", type: "function" }];
      async function ch(a10, { blockCount: b10, blockNumber: c10, blockTag: d10 = "latest", rewardPercentiles: e2 }) {
        var f2;
        let g2 = "bigint" == typeof c10 ? (0, L2.cK)(c10) : void 0;
        return { baseFeePerGas: (f2 = await a10.request({ method: "eth_feeHistory", params: [(0, L2.cK)(b10), g2 || d10, e2] }, { dedupe: !!g2 })).baseFeePerGas.map((a11) => BigInt(a11)), gasUsedRatio: f2.gasUsedRatio, oldestBlock: BigInt(f2.oldestBlock), reward: f2.reward?.map((a11) => a11.map((a12) => BigInt(a12))) };
      }
      async function ci(a10, { filter: b10 }) {
        let c10 = "strict" in b10 && b10.strict, d10 = await b10.request({ method: "eth_getFilterChanges", params: [b10.id] });
        if ("string" == typeof d10[0]) return d10;
        let e2 = d10.map((a11) => b4(a11));
        return "abi" in b10 && b10.abi ? b9({ abi: b10.abi, logs: e2, strict: c10 }) : e2;
      }
      async function cj(a10, { filter: b10 }) {
        let c10 = b10.strict ?? false, d10 = (await b10.request({ method: "eth_getFilterLogs", params: [b10.id] })).map((a11) => b4(a11));
        return b10.abi ? b9({ abi: b10.abi, logs: d10, strict: c10 }) : d10;
      }
      async function ck(a10, { address: b10, blockHash: c10, blockNumber: d10, blockTag: e2 = "latest", requireCanonical: f2, storageKeys: g2 }) {
        let h2 = (0, bH.O)({ blockHash: c10, blockNumber: d10, blockTag: e2, requireCanonical: f2 });
        var i2 = await a10.request({ method: "eth_getProof", params: [b10, g2, h2] });
        return { ...i2, balance: i2.balance ? BigInt(i2.balance) : void 0, nonce: i2.nonce ? (0, bg.ME)(i2.nonce) : void 0, storageProof: i2.storageProof ? i2.storageProof.map((a11) => ({ ...a11, value: BigInt(a11.value) })) : void 0 };
      }
      async function cl(a10, { address: b10, blockHash: c10, blockNumber: d10, blockTag: e2 = "latest", requireCanonical: f2, slot: g2 }) {
        let h2 = (0, bH.O)({ blockHash: c10, blockNumber: d10, blockTag: e2, requireCanonical: f2 });
        return await a10.request({ method: "eth_getStorageAt", params: [b10, g2, h2] });
      }
      async function cm(a10, { blockHash: b10, blockNumber: c10, blockTag: d10, hash: e2, index: f2, sender: g2, nonce: h2 }) {
        let i2 = d10 || "latest", j3 = void 0 !== c10 ? (0, L2.cK)(c10) : void 0, k2 = null;
        if (e2 ? k2 = await a10.request({ method: "eth_getTransactionByHash", params: [e2] }, { dedupe: true }) : b10 ? k2 = await a10.request({ method: "eth_getTransactionByBlockHashAndIndex", params: [b10, (0, L2.cK)(f2)] }, { dedupe: true }) : (j3 || i2) && "number" == typeof f2 ? k2 = await a10.request({ method: "eth_getTransactionByBlockNumberAndIndex", params: [j3 || i2, (0, L2.cK)(f2)] }, { dedupe: !!j3 }) : g2 && "number" == typeof h2 && (k2 = await a10.request({ method: "eth_getTransactionBySenderAndNonce", params: [g2, (0, L2.cK)(h2)] }, { dedupe: true })), !k2) throw new bp.Kz({ blockHash: b10, blockNumber: c10, blockTag: i2, hash: e2, index: f2 });
        return (a10.chain?.formatters?.transaction?.format || bz)(k2, "getTransaction");
      }
      async function cn(a10, { hash: b10, transactionReceipt: c10 }) {
        let [d10, e2] = await Promise.all([X(a10, b0, "getBlockNumber")({}), b10 ? X(a10, cm, "getTransaction")({ hash: b10 }) : void 0]), f2 = c10?.blockNumber || e2?.blockNumber;
        return f2 ? d10 - f2 + 1n : 0n;
      }
      let co = { "0x0": "reverted", "0x1": "success" };
      function cp(a10, b10) {
        let c10 = { ...a10, blockNumber: a10.blockNumber ? BigInt(a10.blockNumber) : null, contractAddress: a10.contractAddress ? a10.contractAddress : null, cumulativeGasUsed: a10.cumulativeGasUsed ? BigInt(a10.cumulativeGasUsed) : null, effectiveGasPrice: a10.effectiveGasPrice ? BigInt(a10.effectiveGasPrice) : null, gasUsed: a10.gasUsed ? BigInt(a10.gasUsed) : null, logs: a10.logs ? a10.logs.map((a11) => b4(a11)) : null, to: a10.to ? a10.to : null, transactionIndex: a10.transactionIndex ? (0, bg.ME)(a10.transactionIndex) : null, status: a10.status ? co[a10.status] : null, type: a10.type ? by[a10.type] || a10.type : null };
        return a10.blobGasPrice && (c10.blobGasPrice = BigInt(a10.blobGasPrice)), a10.blobGasUsed && (c10.blobGasUsed = BigInt(a10.blobGasUsed)), c10;
      }
      async function cq(a10, { hash: b10 }) {
        let c10 = await a10.request({ method: "eth_getTransactionReceipt", params: [b10] }, { dedupe: true });
        if (!c10) throw new bp.Kc({ hash: b10 });
        return (a10.chain?.formatters?.transactionReceipt?.format || cp)(c10, "getTransactionReceipt");
      }
      var cr = c(6788);
      async function cs(a10, b10) {
        let { account: c10, authorizationList: d10, allowFailure: e2 = true, blockHash: f2, blockNumber: g2, blockOverrides: h2, blockTag: i2, requireCanonical: j3, stateOverride: k2 } = b10, l2 = b10.contracts, { batchSize: m2 = b10.batchSize ?? 1024, deployless: n2 = b10.deployless ?? false } = "object" == typeof a10.batch?.multicall ? a10.batch.multicall : {}, o2 = (() => {
          if (b10.multicallAddress) return b10.multicallAddress;
          if (n2) return null;
          if (a10.chain) return (0, I2.M)({ blockNumber: g2, chain: a10.chain, contract: "multicall3" });
          throw Error("client chain not configured. multicallAddress is required.");
        })(), p2 = [[]], q3 = 0, r2 = 0;
        for (let a11 = 0; a11 < l2.length; a11++) {
          let { abi: b11, address: d11, args: f3, functionName: g3 } = l2[a11];
          try {
            let a12 = (0, G2.p)({ abi: b11, args: f3, functionName: g3 });
            r2 += (a12.length - 2) / 2, m2 > 0 && r2 > m2 && p2[q3].length > 0 && (q3++, r2 = (a12.length - 2) / 2, p2[q3] = []), p2[q3] = [...p2[q3], { allowFailure: true, callData: a12, target: d11 }];
          } catch (h3) {
            let a12 = aB(h3, { abi: b11, address: d11, args: f3, docsPath: "/docs/contract/multicall", functionName: g3, sender: c10 });
            if (!e2) throw a12;
            p2[q3] = [...p2[q3], { allowFailure: true, callData: "0x", target: d11 }];
          }
        }
        let s2 = await Promise.allSettled(p2.map((b11) => X(a10, aD, "readContract")({ ...null === o2 ? { code: cr.Ez } : { address: o2 }, abi: E.v2, account: c10, args: [b11], authorizationList: d10, blockHash: f2, blockNumber: g2, blockOverrides: h2, blockTag: i2, functionName: "aggregate3", requireCanonical: j3, stateOverride: k2 }))), t2 = [];
        for (let a11 = 0; a11 < s2.length; a11++) {
          let b11 = s2[a11];
          if ("rejected" === b11.status) {
            if (!e2) throw b11.reason;
            for (let c12 = 0; c12 < p2[a11].length; c12++) t2.push({ status: "failure", error: b11.reason, result: void 0 });
            continue;
          }
          let c11 = b11.value;
          for (let b12 = 0; b12 < c11.length; b12++) {
            let { returnData: d11, success: f3 } = c11[b12], { callData: g3 } = p2[a11][b12], { abi: h3, address: i3, functionName: j4, args: k3 } = l2[t2.length];
            try {
              if ("0x" === g3) throw new Y2.O();
              if (!f3) throw new N.$S({ data: d11 });
              let a12 = (0, F2.e)({ abi: h3, args: k3, data: d11, functionName: j4 });
              t2.push(e2 ? { result: a12, status: "success" } : a12);
            } catch (b13) {
              let a12 = aB(b13, { abi: h3, address: i3, args: k3, docsPath: "/docs/contract/multicall", functionName: j4 });
              if (!e2) throw a12;
              t2.push({ error: a12, result: void 0, status: "failure" });
            }
          }
        }
        if (t2.length !== l2.length) throw new M.C("multicall results mismatch");
        return t2;
      }
      var ct = c(8144);
      async function cu(a10, b10) {
        let { blockNumber: c10, blockTag: d10 = a10.experimental_blockTag ?? "latest", blocks: e2, returnFullTransactions: f2, traceTransfers: g2, validation: h2 } = b10;
        try {
          let b11 = [];
          for (let a11 of e2) {
            let c11 = a11.blockOverrides ? ct.J(a11.blockOverrides) : void 0, d11 = a11.calls.map((a12) => {
              let b12 = a12.account ? (0, B2.J)(a12.account) : void 0, c12 = a12.abi ? (0, G2.p)(a12) : a12.data, d12 = { ...a12, account: b12, data: a12.dataSuffix ? (0, Q2.xW)([c12 || "0x", a12.dataSuffix]) : c12, from: a12.from ?? b12?.address };
              return (0, a1.c)(d12), (0, a0.Bv)(d12);
            }), e3 = a11.stateOverrides ? (0, bt.yH)(a11.stateOverrides) : void 0;
            b11.push({ blockOverrides: c11, calls: d11, stateOverrides: e3 });
          }
          let i2 = "bigint" == typeof c10 ? (0, L2.cK)(c10) : void 0;
          return (await a10.request({ method: "eth_simulateV1", params: [{ blockStateCalls: b11, returnFullTransactions: f2, traceTransfers: g2, validation: h2 }, i2 || d10] })).map((a11, b12) => ({ ...bA(a11), calls: a11.calls.map((a12, c11) => {
            let { abi: d11, args: f3, functionName: g3, to: h3 } = e2[b12].calls[c11], i3 = a12.error?.data ?? a12.returnData, j3 = BigInt(a12.gasUsed), k2 = a12.logs?.map((a13) => b4(a13)), l2 = "0x1" === a12.status ? "success" : "failure", m2 = d11 && "success" === l2 && "0x" !== i3 ? (0, F2.e)({ abi: d11, data: i3, functionName: g3 }) : null, n2 = (() => {
              let a13;
              if ("success" !== l2 && ("0x" === i3 ? a13 = new Y2.O() : i3 && (a13 = new N.$S({ data: i3 })), a13)) return aB(a13, { abi: d11 ?? [], address: h3 ?? "0x", args: f3, functionName: g3 ?? "<unknown>" });
            })();
            return { data: i3, gasUsed: j3, logs: k2, status: l2, ..."success" === l2 ? { result: m2 } : { error: n2 } };
          }) }));
        } catch (b11) {
          let a11 = (0, bs.l)(b11, {});
          if (a11 instanceof br.RM) throw b11;
          throw a11;
        }
      }
      var cv = c(3816), cw = c(8971), cx = c(3490), cy = c(6678);
      function cz(a10) {
        let b10;
        if ("string" == typeof a10) b10 = (0, cy.uT)(a10);
        else {
          let c10 = (0, cx.e)(a10), d10 = a10.length;
          for (let e2 = 0; e2 < d10; e2++) {
            let d11 = a10[e2];
            if (!(0, cw.WL)(d11)) {
              b10 = (0, cy.uT)(d11, c10);
              break;
            }
          }
        }
        if (!b10) throw new cv.xo({ signature: a10 });
        return b10;
      }
      var cA = c(3089), cB = c(1493), cC = c(7037), cD = c(40);
      function cE(a10, b10) {
        if (cN(a10) > b10) throw new cR({ givenSize: cN(a10), maxSize: b10 });
      }
      let cF = { zero: 48, nine: 57, A: 65, F: 70, a: 97, f: 102 };
      function cG(a10) {
        return a10 >= cF.zero && a10 <= cF.nine ? a10 - cF.zero : a10 >= cF.A && a10 <= cF.F ? a10 - (cF.A - 10) : a10 >= cF.a && a10 <= cF.f ? a10 - (cF.a - 10) : void 0;
      }
      function cH(a10, b10 = {}) {
        let { dir: c10 = "left" } = b10, d10 = a10, e2 = 0;
        for (let a11 = 0; a11 < d10.length - 1; a11++) if ("0" === d10["left" === c10 ? a11 : d10.length - a11 - 1].toString()) e2++;
        else break;
        return "left" === c10 ? d10.slice(e2) : d10.slice(0, d10.length - e2);
      }
      var cI = c(2586), cJ = c(6215);
      let cK = new TextDecoder(), cL = new TextEncoder();
      function cM(a10, b10 = {}) {
        let { size: c10 } = b10, d10 = a10;
        c10 && (cI.Sl(a10, c10), d10 = cD.M7(a10, c10));
        let e2 = d10.slice(2);
        e2.length % 2 && (e2 = `0${e2}`);
        let f2 = e2.length / 2, g2 = new Uint8Array(f2);
        for (let a11 = 0, b11 = 0; a11 < f2; a11++) {
          let c11 = cG(e2.charCodeAt(b11++)), d11 = cG(e2.charCodeAt(b11++));
          if (void 0 === c11 || void 0 === d11) throw new cB.C(`Invalid byte sequence ("${e2[b11 - 2]}${e2[b11 - 1]}" in "${e2}").`);
          g2[a11] = c11 << 4 | d11;
        }
        return g2;
      }
      function cN(a10) {
        return a10.length;
      }
      function cO(a10, b10 = {}) {
        let { size: c10 } = b10;
        void 0 !== c10 && cE(a10, c10);
        let d10 = cD.uK(a10, b10);
        return cD.Ro(d10, b10);
      }
      function cP(a10) {
        return cH(a10, { dir: "left" });
      }
      class cQ extends cB.C {
        constructor(a10) {
          super(`Bytes value \`${a10}\` is not a valid boolean.`, { metaMessages: ["The bytes array must contain a single byte of either a `0` or `1` value."] }), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "Bytes.InvalidBytesBooleanError" });
        }
      }
      cB.C;
      class cR extends cB.C {
        constructor({ givenSize: a10, maxSize: b10 }) {
          super(`Size cannot exceed \`${b10}\` bytes. Given size: \`${a10}\` bytes.`), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "Bytes.SizeOverflowError" });
        }
      }
      class cS extends cB.C {
        constructor({ offset: a10, position: b10, size: c10 }) {
          super(`Slice ${"start" === b10 ? "starting" : "ending"} at offset \`${a10}\` is out-of-bounds (size: \`${c10}\`).`), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "Bytes.SliceOffsetOutOfBoundsError" });
        }
      }
      class cT extends cB.C {
        constructor({ size: a10, targetSize: b10, type: c10 }) {
          super(`${c10.charAt(0).toUpperCase()}${c10.slice(1).toLowerCase()} size (\`${a10}\`) exceeds padding size (\`${b10}\`).`), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "Bytes.SizeExceedsPaddingSizeError" });
        }
      }
      function cU(a10, b10 = {}) {
        var c10;
        let { as: d10 = "string" == typeof a10 ? "Hex" : "Bytes" } = b10, e2 = (0, cC.lY)(a10 instanceof Uint8Array ? a10 : "string" == typeof a10 ? cM(a10) : (c10 = a10) instanceof Uint8Array ? c10 : new Uint8Array(c10));
        return "Bytes" === d10 ? e2 : cD.uK(e2);
      }
      class cV extends Map {
        constructor(a10) {
          super(), Object.defineProperty(this, "maxSize", { enumerable: true, configurable: true, writable: true, value: void 0 }), this.maxSize = a10;
        }
        get(a10) {
          let b10 = super.get(a10);
          return super.has(a10) && void 0 !== b10 && (this.delete(a10), super.set(a10, b10)), b10;
        }
        set(a10, b10) {
          if (super.set(a10, b10), this.maxSize && this.size > this.maxSize) {
            let a11 = this.keys().next().value;
            a11 && this.delete(a11);
          }
          return this;
        }
      }
      let cW = { checksum: new cV(8192) }.checksum, cX = /^0x[a-fA-F0-9]{40}$/;
      function cY(a10, b10 = {}) {
        let { strict: c10 = true } = b10;
        if (!cX.test(a10)) throw new c_({ address: a10, cause: new c0() });
        if (c10) {
          if (a10.toLowerCase() === a10) return;
          if (cZ(a10) !== a10) throw new c_({ address: a10, cause: new c1() });
        }
      }
      function cZ(a10) {
        if (cW.has(a10)) return cW.get(a10);
        cY(a10, { strict: false });
        let b10 = a10.substring(2).toLowerCase(), c10 = cU(function(a11, b11 = {}) {
          let { size: c11 } = b11, d11 = cL.encode(a11);
          return "number" == typeof c11 ? (cE(d11, c11), function(a12, b12 = {}) {
            let { dir: c12, size: d12 = 32 } = b12;
            if (0 === d12) return a12;
            if (a12.length > d12) throw new cT({ size: a12.length, targetSize: d12, type: "Bytes" });
            let e3 = new Uint8Array(d12);
            for (let b13 = 0; b13 < d12; b13++) {
              let f2 = "right" === c12;
              e3[f2 ? b13 : d12 - b13 - 1] = a12[f2 ? b13 : a12.length - b13 - 1];
            }
            return e3;
          }(d11, { dir: "right", size: c11 })) : d11;
        }(b10), { as: "Bytes" }), d10 = b10.split("");
        for (let a11 = 0; a11 < 40; a11 += 2) c10[a11 >> 1] >> 4 >= 8 && d10[a11] && (d10[a11] = d10[a11].toUpperCase()), (15 & c10[a11 >> 1]) >= 8 && d10[a11 + 1] && (d10[a11 + 1] = d10[a11 + 1].toUpperCase());
        let e2 = `0x${d10.join("")}`;
        return cW.set(a10, e2), e2;
      }
      function c$(a10, b10 = {}) {
        let { strict: c10 = true } = b10 ?? {};
        try {
          return cY(a10, { strict: c10 }), true;
        } catch {
          return false;
        }
      }
      class c_ extends cB.C {
        constructor({ address: a10, cause: b10 }) {
          super(`Address "${a10}" is invalid.`, { cause: b10 }), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "Address.InvalidAddressError" });
        }
      }
      class c0 extends cB.C {
        constructor() {
          super("Address is not a 20 byte (40 hexadecimal character) value."), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "Address.InvalidInputError" });
        }
      }
      class c1 extends cB.C {
        constructor() {
          super("Address does not match its checksum counterpart."), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "Address.InvalidChecksumError" });
        }
      }
      function c2(a10) {
        let b10 = true, c10 = "", d10 = 0, e2 = "", f2 = false;
        for (let g2 = 0; g2 < a10.length; g2++) {
          let h2 = a10[g2];
          if (["(", ")", ","].includes(h2) && (b10 = true), "(" === h2 && d10++, ")" === h2 && d10--, b10) {
            if (0 === d10) {
              if (" " === h2 && ["event", "function", "error", ""].includes(e2)) e2 = "";
              else if (e2 += h2, ")" === h2) {
                f2 = true;
                break;
              }
              continue;
            }
            if (" " === h2) {
              "," !== a10[g2 - 1] && "," !== c10 && ",(" !== c10 && (c10 = "", b10 = false);
              continue;
            }
            e2 += h2, c10 += h2;
          }
        }
        if (!f2) throw new cB.C("Unable to normalize signature.");
        return e2;
      }
      function c3(a10, b10 = {}) {
        let { prepare: c10 = true } = b10, d10 = Array.isArray(a10) || "string" == typeof a10 ? cz(a10) : a10;
        return { ...d10, ...c10 ? { hash: c6(d10) } : {} };
      }
      function c4(a10, b10, c10) {
        let d10, { args: e2 = [], prepare: f2 = true } = c10 ?? {}, g2 = cD.tf(b10, { strict: false }), h2 = a10.filter((a11) => g2 ? "function" === a11.type || "error" === a11.type ? c5(a11) === cD.di(b10, 0, 4) : "event" === a11.type && c6(a11) === b10 : "name" in a11 && a11.name === b10);
        if (0 === h2.length) throw new c8({ name: b10 });
        if (1 === h2.length) return { ...h2[0], ...f2 ? { hash: c6(h2[0]) } : {} };
        for (let a11 of h2) {
          if ("inputs" in a11) {
            if (!e2 || 0 === e2.length) {
              if (!a11.inputs || 0 === a11.inputs.length) return { ...a11, ...f2 ? { hash: c6(a11) } : {} };
              continue;
            }
            if (a11.inputs && 0 !== a11.inputs.length && a11.inputs.length === e2.length && e2.every((b11, c11) => {
              let d11 = "inputs" in a11 && a11.inputs[c11];
              return !!d11 && function a12(b12, c12) {
                let d12 = typeof b12, e3 = c12.type;
                switch (e3) {
                  case "address":
                    return c$(b12, { strict: false });
                  case "bool":
                    return "boolean" === d12;
                  case "function":
                  case "string":
                    return "string" === d12;
                  default:
                    if ("tuple" === e3 && "components" in c12) return Object.values(c12.components).every((c13, d13) => a12(Object.values(b12)[d13], c13));
                    if (/^u?int(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/.test(e3)) return "number" === d12 || "bigint" === d12;
                    if (/^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/.test(e3)) return "string" === d12 || b12 instanceof Uint8Array;
                    if (/[a-z]+[1-9]{0,3}(\[[0-9]{0,}\])+$/.test(e3)) return Array.isArray(b12) && b12.every((b13) => a12(b13, { ...c12, type: e3.replace(/(\[[0-9]{0,}\])$/, "") }));
                    return false;
                }
              }(b11, d11);
            })) {
              if (d10 && "inputs" in d10 && d10.inputs) {
                let b11 = function a12(b12, c11, d11) {
                  for (let e3 in b12) {
                    let f3 = b12[e3], g3 = c11[e3];
                    if ("tuple" === f3.type && "tuple" === g3.type && "components" in f3 && "components" in g3) return a12(f3.components, g3.components, d11[e3]);
                    let h3 = [f3.type, g3.type];
                    if (h3.includes("address") && h3.includes("bytes20") || (h3.includes("address") && h3.includes("string") || h3.includes("address") && h3.includes("bytes")) && c$(d11[e3], { strict: false })) return h3;
                  }
                }(a11.inputs, d10.inputs, e2);
                if (b11) throw new c7({ abiItem: a11, type: b11[0] }, { abiItem: d10, type: b11[1] });
              }
              d10 = a11;
            }
          }
        }
        let i2 = (() => {
          if (d10) return d10;
          let [a11, ...b11] = h2;
          return { ...a11, overloads: b11 };
        })();
        if (!i2) throw new c8({ name: b10 });
        return { ...i2, ...f2 ? { hash: c6(i2) } : {} };
      }
      function c5(...a10) {
        let b10 = (() => {
          if (Array.isArray(a10[0])) {
            let [b11, c10] = a10;
            return c4(b11, c10);
          }
          return a10[0];
        })();
        return cD.di(c6(b10), 0, 4);
      }
      function c6(...a10) {
        let b10 = (() => {
          if (Array.isArray(a10[0])) {
            let [b11, c10] = a10;
            return c4(b11, c10);
          }
          return a10[0];
        })();
        return "string" != typeof b10 && "hash" in b10 && b10.hash ? b10.hash : cU(cD.sH(function(...a11) {
          let b11 = (() => {
            if (Array.isArray(a11[0])) {
              let [b12, c10] = a11;
              return c4(b12, c10);
            }
            return a11[0];
          })();
          return c2("string" == typeof b11 ? b11 : cA.B(b11));
        }(b10)));
      }
      class c7 extends cB.C {
        constructor(a10, b10) {
          super("Found ambiguous types in overloaded ABI Items.", { metaMessages: [`\`${a10.type}\` in \`${c2(cA.B(a10.abiItem))}\`, and`, `\`${b10.type}\` in \`${c2(cA.B(b10.abiItem))}\``, "", "These types encode differently and cannot be distinguished at runtime.", "Remove one of the ambiguous items in the ABI."] }), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "AbiItem.AmbiguityError" });
        }
      }
      class c8 extends cB.C {
        constructor({ name: a10, data: b10, type: c10 = "item" }) {
          super(`ABI ${c10}${a10 ? ` with name "${a10}"` : b10 ? ` with data "${b10}"` : ""} not found.`), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "AbiItem.NotFoundError" });
        }
      }
      cB.C;
      var c9 = c(2696), da = c(199);
      let db = /^(.*)\[([0-9]*)\]$/, dc = /^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/, dd = /^(u?int)(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/, de2 = 2n ** 256n - 1n;
      function df(a10) {
        let b10 = 0;
        for (let c11 = 0; c11 < a10.length; c11++) {
          let { dynamic: d11, encoded: e3 } = a10[c11];
          d11 ? b10 += 32 : b10 += cD.Ej(e3);
        }
        let c10 = [], d10 = [], e2 = 0;
        for (let f2 = 0; f2 < a10.length; f2++) {
          let { dynamic: g2, encoded: h2 } = a10[f2];
          g2 ? (c10.push(cD.oB(b10 + e2, { size: 32 })), d10.push(h2), e2 += cD.Ej(h2)) : c10.push(h2);
        }
        return cD.xW(...c10, ...d10);
      }
      function dg(a10) {
        let b10 = a10.match(/^(.*)\[(\d+)?\]$/);
        return b10 ? [b10[2] ? Number(b10[2]) : null, b10[1]] : void 0;
      }
      function dh(a10) {
        let { type: b10 } = a10;
        if ("string" === b10 || "bytes" === b10 || b10.endsWith("[]")) return true;
        if ("tuple" === b10) return a10.components?.some(dh);
        let c10 = dg(a10.type);
        return !!(c10 && dh({ ...a10, type: c10[1] }));
      }
      let di = { bytes: new Uint8Array(), dataView: new DataView(new ArrayBuffer(0)), position: 0, positionReadCount: /* @__PURE__ */ new Map(), recursiveReadCount: 0, recursiveReadLimit: 1 / 0, assertReadLimit() {
        if (this.recursiveReadCount >= this.recursiveReadLimit) throw new dl({ count: this.recursiveReadCount + 1, limit: this.recursiveReadLimit });
      }, assertPosition(a10) {
        if (a10 < 0 || a10 > this.bytes.length - 1) throw new dk({ length: this.bytes.length, position: a10 });
      }, decrementPosition(a10) {
        if (a10 < 0) throw new dj({ offset: a10 });
        let b10 = this.position - a10;
        this.assertPosition(b10), this.position = b10;
      }, getReadCount(a10) {
        return this.positionReadCount.get(a10 || this.position) || 0;
      }, incrementPosition(a10) {
        if (a10 < 0) throw new dj({ offset: a10 });
        let b10 = this.position + a10;
        this.assertPosition(b10), this.position = b10;
      }, inspectByte(a10) {
        let b10 = a10 ?? this.position;
        return this.assertPosition(b10), this.bytes[b10];
      }, inspectBytes(a10, b10) {
        let c10 = b10 ?? this.position;
        return this.assertPosition(c10 + a10 - 1), this.bytes.subarray(c10, c10 + a10);
      }, inspectUint8(a10) {
        let b10 = a10 ?? this.position;
        return this.assertPosition(b10), this.bytes[b10];
      }, inspectUint16(a10) {
        let b10 = a10 ?? this.position;
        return this.assertPosition(b10 + 1), this.dataView.getUint16(b10);
      }, inspectUint24(a10) {
        let b10 = a10 ?? this.position;
        return this.assertPosition(b10 + 2), (this.dataView.getUint16(b10) << 8) + this.dataView.getUint8(b10 + 2);
      }, inspectUint32(a10) {
        let b10 = a10 ?? this.position;
        return this.assertPosition(b10 + 3), this.dataView.getUint32(b10);
      }, pushByte(a10) {
        this.assertPosition(this.position), this.bytes[this.position] = a10, this.position++;
      }, pushBytes(a10) {
        this.assertPosition(this.position + a10.length - 1), this.bytes.set(a10, this.position), this.position += a10.length;
      }, pushUint8(a10) {
        this.assertPosition(this.position), this.bytes[this.position] = a10, this.position++;
      }, pushUint16(a10) {
        this.assertPosition(this.position + 1), this.dataView.setUint16(this.position, a10), this.position += 2;
      }, pushUint24(a10) {
        this.assertPosition(this.position + 2), this.dataView.setUint16(this.position, a10 >> 8), this.dataView.setUint8(this.position + 2, 255 & a10), this.position += 3;
      }, pushUint32(a10) {
        this.assertPosition(this.position + 3), this.dataView.setUint32(this.position, a10), this.position += 4;
      }, readByte() {
        this.assertReadLimit(), this._touch();
        let a10 = this.inspectByte();
        return this.position++, a10;
      }, readBytes(a10, b10) {
        this.assertReadLimit(), this._touch();
        let c10 = this.inspectBytes(a10);
        return this.position += b10 ?? a10, c10;
      }, readUint8() {
        this.assertReadLimit(), this._touch();
        let a10 = this.inspectUint8();
        return this.position += 1, a10;
      }, readUint16() {
        this.assertReadLimit(), this._touch();
        let a10 = this.inspectUint16();
        return this.position += 2, a10;
      }, readUint24() {
        this.assertReadLimit(), this._touch();
        let a10 = this.inspectUint24();
        return this.position += 3, a10;
      }, readUint32() {
        this.assertReadLimit(), this._touch();
        let a10 = this.inspectUint32();
        return this.position += 4, a10;
      }, get remaining() {
        return this.bytes.length - this.position;
      }, setPosition(a10) {
        let b10 = this.position;
        return this.assertPosition(a10), this.position = a10, () => this.position = b10;
      }, _touch() {
        if (this.recursiveReadLimit === 1 / 0) return;
        let a10 = this.getReadCount();
        this.positionReadCount.set(this.position, a10 + 1), a10 > 0 && this.recursiveReadCount++;
      } };
      class dj extends cB.C {
        constructor({ offset: a10 }) {
          super(`Offset \`${a10}\` cannot be negative.`), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "Cursor.NegativeOffsetError" });
        }
      }
      class dk extends cB.C {
        constructor({ length: a10, position: b10 }) {
          super(`Position \`${b10}\` is out of bounds (\`0 < position < ${a10}\`).`), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "Cursor.PositionOutOfBoundsError" });
        }
      }
      class dl extends cB.C {
        constructor({ count: a10, limit: b10 }) {
          super(`Recursive read limit of \`${b10}\` exceeded (recursive read count: \`${a10}\`).`), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "Cursor.RecursiveReadLimitExceededError" });
        }
      }
      function dm(a10, b10, c10) {
        let { checksumAddress: d10 = false } = c10 ?? {};
        if (a10.length !== b10.length) throw new du({ expectedLength: a10.length, givenLength: b10.length });
        let e2 = df(function({ checksumAddress: a11, parameters: b11, values: c11 }) {
          let d11 = [];
          for (let e3 = 0; e3 < b11.length; e3++) d11.push(function a12({ checksumAddress: b12 = false, parameter: c12, value: d12 }) {
            let e4 = dg(c12.type);
            if (e4) {
              let [f3, g3] = e4;
              return function(b13, c13) {
                let { checksumAddress: d13, length: e5, parameter: f4 } = c13, g4 = null === e5;
                if (!Array.isArray(b13)) throw new dv(b13);
                if (!g4 && b13.length !== e5) throw new ds({ expectedLength: e5, givenLength: b13.length, type: `${f4.type}[${e5}]` });
                let h3 = false, i3 = [];
                for (let c14 = 0; c14 < b13.length; c14++) {
                  let e6 = a12({ checksumAddress: d13, parameter: f4, value: b13[c14] });
                  e6.dynamic && (h3 = true), i3.push(e6);
                }
                if (g4 || h3) {
                  let a13 = df(i3);
                  if (g4) {
                    let b14 = cD.oB(i3.length, { size: 32 });
                    return { dynamic: true, encoded: i3.length > 0 ? cD.xW(b14, a13) : b14 };
                  }
                  if (h3) return { dynamic: true, encoded: a13 };
                }
                return { dynamic: false, encoded: cD.xW(...i3.map(({ encoded: a13 }) => a13)) };
              }(d12, { checksumAddress: b12, length: f3, parameter: { ...c12, type: g3 } });
            }
            if ("tuple" === c12.type) return function(b13, c13) {
              let { checksumAddress: d13, parameter: e5 } = c13, f3 = false, g3 = [];
              for (let c14 = 0; c14 < e5.components.length; c14++) {
                let h3 = e5.components[c14], i3 = Array.isArray(b13) ? c14 : h3.name, j3 = a12({ checksumAddress: d13, parameter: h3, value: b13[i3] });
                g3.push(j3), j3.dynamic && (f3 = true);
              }
              return { dynamic: f3, encoded: f3 ? df(g3) : cD.xW(...g3.map(({ encoded: a13 }) => a13)) };
            }(d12, { checksumAddress: b12, parameter: c12 });
            if ("address" === c12.type) {
              var f2 = d12, g2 = { checksum: b12 };
              let { checksum: a13 = false } = g2;
              return cY(f2, { strict: a13 }), { dynamic: false, encoded: cD.Ho(f2.toLowerCase()) };
            }
            if ("bool" === c12.type) {
              var h2 = d12;
              if ("boolean" != typeof h2) throw new cB.C(`Invalid boolean value: "${h2}" (type: ${typeof h2}). Expected: \`true\` or \`false\`.`);
              return { dynamic: false, encoded: cD.Ho(cD.xb(h2)) };
            }
            if (c12.type.startsWith("uint") || c12.type.startsWith("int")) {
              let a13 = c12.type.startsWith("int"), [, , b13 = "256"] = dd.exec(c12.type) ?? [];
              return function(a14, { signed: b14, size: c13 }) {
                if ("number" == typeof c13) {
                  let d13 = 2n ** (BigInt(c13) - (b14 ? 1n : 0n)) - 1n, e5 = b14 ? -d13 - 1n : 0n;
                  if (a14 > d13 || a14 < e5) throw new cD.Ty({ max: d13.toString(), min: e5.toString(), signed: b14, size: c13 / 8, value: a14.toString() });
                }
                return { dynamic: false, encoded: cD.oB(a14, { size: 32, signed: b14 }) };
              }(d12, { signed: a13, size: Number(b13) });
            }
            if (c12.type.startsWith("bytes")) return function(a13, { type: b13 }) {
              let [, c13] = b13.split("bytes"), d13 = cD.Ej(a13);
              if (!c13) {
                let b14 = a13;
                return d13 % 32 != 0 && (b14 = cD.M7(b14, 32 * Math.ceil((a13.length - 2) / 2 / 32))), { dynamic: true, encoded: cD.xW(cD.Ho(cD.oB(d13, { size: 32 })), b14) };
              }
              if (d13 !== Number.parseInt(c13, 10)) throw new dt({ expectedSize: Number.parseInt(c13, 10), value: a13 });
              return { dynamic: false, encoded: cD.M7(a13) };
            }(d12, { type: c12.type });
            if ("string" === c12.type) {
              var i2 = d12;
              let a13 = cD.sH(i2), b13 = Math.ceil(cD.Ej(a13) / 32), c13 = [];
              for (let d13 = 0; d13 < b13; d13++) c13.push(cD.M7(cD.di(a13, 32 * d13, (d13 + 1) * 32)));
              return { dynamic: true, encoded: cD.xW(cD.M7(cD.oB(cD.Ej(a13), { size: 32 })), ...c13) };
            }
            throw new dw(c12.type);
          }({ checksumAddress: a11, parameter: b11[e3], value: c11[e3] }));
          return d11;
        }({ checksumAddress: d10, parameters: a10, values: b10 }));
        return 0 === e2.length ? "0x" : e2;
      }
      function dn(a10, b10) {
        if (a10.length !== b10.length) throw new du({ expectedLength: a10.length, givenLength: b10.length });
        let c10 = [];
        for (let d10 = 0; d10 < a10.length; d10++) {
          let e2 = a10[d10], f2 = b10[d10];
          c10.push(dn.encode(e2, f2));
        }
        return cD.xW(...c10);
      }
      function dp(a10) {
        return Array.isArray(a10) && "string" == typeof a10[0] || "string" == typeof a10 ? function(a11) {
          let b10 = [];
          if ("string" == typeof a11) {
            let c10 = (0, cy.NV)(a11), d10 = c10.length;
            for (let a12 = 0; a12 < d10; a12++) b10.push((0, cy.Pj)(c10[a12], { modifiers: cw.Dv }));
          } else {
            let c10 = (0, cx.e)(a11), d10 = a11.length;
            for (let e2 = 0; e2 < d10; e2++) {
              let d11 = a11[e2];
              if ((0, cw.WL)(d11)) continue;
              let f2 = (0, cy.NV)(d11), g2 = f2.length;
              for (let a12 = 0; a12 < g2; a12++) b10.push((0, cy.Pj)(f2[a12], { modifiers: cw.Dv, structs: c10 }));
            }
          }
          if (0 === b10.length) throw new c9.A9({ params: a11 });
          return b10;
        }(a10) : a10;
      }
      (dn || (dn = {})).encode = function a10(b10, c10, d10 = false) {
        if ("address" === b10) return cY(c10), cD.Ho(c10.toLowerCase(), 32 * !!d10);
        if ("string" === b10) return cD.sH(c10);
        if ("bytes" === b10) return c10;
        if ("bool" === b10) return cD.Ho(cD.xb(c10), d10 ? 32 : 1);
        let e2 = b10.match(dd);
        if (e2) {
          let [a11, b11, f3 = "256"] = e2, g3 = Number.parseInt(f3, 10) / 8;
          return cD.oB(c10, { size: d10 ? 32 : g3, signed: "int" === b11 });
        }
        let f2 = b10.match(dc);
        if (f2) {
          let [a11, b11] = f2;
          if (Number.parseInt(b11, 10) !== (c10.length - 2) / 2) throw new dt({ expectedSize: Number.parseInt(b11, 10), value: c10 });
          return cD.M7(c10, 32 * !!d10);
        }
        let g2 = b10.match(db);
        if (g2 && Array.isArray(c10)) {
          let [b11, d11] = g2, e3 = [];
          for (let b12 = 0; b12 < c10.length; b12++) e3.push(a10(d11, c10[b12], true));
          return 0 === e3.length ? "0x" : cD.xW(...e3);
        }
        throw new dw(b10);
      };
      class dq extends cB.C {
        constructor({ data: a10, parameters: b10, size: c10 }) {
          super(`Data size of ${c10} bytes is too small for given parameters.`, { metaMessages: [`Params: (${da.Q(b10)})`, `Data:   ${a10} (${c10} bytes)`] }), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "AbiParameters.DataSizeTooSmallError" });
        }
      }
      class dr extends cB.C {
        constructor() {
          super('Cannot decode zero data ("0x") with ABI parameters.'), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "AbiParameters.ZeroDataError" });
        }
      }
      class ds extends cB.C {
        constructor({ expectedLength: a10, givenLength: b10, type: c10 }) {
          super(`Array length mismatch for type \`${c10}\`. Expected: \`${a10}\`. Given: \`${b10}\`.`), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "AbiParameters.ArrayLengthMismatchError" });
        }
      }
      class dt extends cB.C {
        constructor({ expectedSize: a10, value: b10 }) {
          super(`Size of bytes "${b10}" (bytes${cD.Ej(b10)}) does not match expected size (bytes${a10}).`), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "AbiParameters.BytesSizeMismatchError" });
        }
      }
      class du extends cB.C {
        constructor({ expectedLength: a10, givenLength: b10 }) {
          super(`ABI encoding parameters/values length mismatch.
Expected length (parameters): ${a10}
Given length (values): ${b10}`), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "AbiParameters.LengthMismatchError" });
        }
      }
      class dv extends cB.C {
        constructor(a10) {
          super(`Value \`${a10}\` is not a valid array.`), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "AbiParameters.InvalidArrayError" });
        }
      }
      class dw extends cB.C {
        constructor(a10) {
          super(`Type \`${a10}\` is not a valid ABI Type.`), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "AbiParameters.InvalidTypeError" });
        }
      }
      function dx(a10, b10 = {}) {
        return c3(a10, b10);
      }
      function dy(a10, b10, c10) {
        let d10 = c4(a10, b10, c10);
        if ("function" !== d10.type) throw new c8({ name: b10, type: "function" });
        return d10;
      }
      let dz = "0x0000000000000000000000000000000000000000";
      async function dA(a10, b10) {
        let { blockNumber: c10, blockTag: d10, calls: e2, stateOverrides: f2, traceAssetChanges: g2, traceTransfers: h2, validation: i2 } = b10, j3 = b10.account ? (0, B2.J)(b10.account) : void 0;
        if (g2 && !j3) throw new M.C("`account` is required when `traceAssetChanges` is true");
        let k2 = j3 ? function(...a11) {
          let [b11, c11] = (() => {
            if (Array.isArray(a11[0])) {
              let [b12, c12] = a11;
              return [function(a12) {
                let b13 = a12.find((a13) => "constructor" === a13.type);
                if (!b13) throw new c8({ name: "constructor" });
                return b13;
              }(b12), c12];
            }
            return a11;
          })(), { bytecode: d11, args: e3 } = c11;
          return cD.xW(d11, b11.inputs?.length && e3?.length ? dm(b11.inputs, e3) : "0x");
        }(c3("constructor(bytes, bytes)"), { bytecode: cr.LX, args: ["0x6080604052348015600e575f80fd5b5061016d8061001c5f395ff3fe608060405234801561000f575f80fd5b5060043610610029575f3560e01c8063f8b2cb4f1461002d575b5f80fd5b610047600480360381019061004291906100db565b61005d565b604051610054919061011e565b60405180910390f35b5f8173ffffffffffffffffffffffffffffffffffffffff16319050919050565b5f80fd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f6100aa82610081565b9050919050565b6100ba816100a0565b81146100c4575f80fd5b50565b5f813590506100d5816100b1565b92915050565b5f602082840312156100f0576100ef61007d565b5b5f6100fd848285016100c7565b91505092915050565b5f819050919050565b61011881610106565b82525050565b5f6020820190506101315f83018461010f565b9291505056fea26469706673582212203b9fe929fe995c7cf9887f0bdba8a36dd78e8b73f149b17d2d9ad7cd09d2dc6264736f6c634300081a0033", function(...a11) {
          let [b11, c11 = []] = (() => {
            if (Array.isArray(a11[0])) {
              let [b13, c13, d12] = a11;
              return [dy(b13, c13, { args: d12 }), d12];
            }
            let [b12, c12] = a11;
            return [b12, c12];
          })(), { overloads: d11 } = b11, e3 = d11 ? dy([b11, ...d11], b11.name, { args: c11 }) : b11, f3 = c5(e3), g3 = c11.length > 0 ? dm(e3.inputs, c11) : void 0;
          return g3 ? cD.xW(f3, g3) : f3;
        }(dx("function getBalance(address)"), [j3.address])] }) : void 0, l2 = g2 ? await Promise.all(b10.calls.map(async (b11) => {
          if (!b11.data && !b11.abi) return;
          let { accessList: c11 } = await a22(a10, { account: j3.address, ...b11, data: b11.abi ? (0, G2.p)(b11) : b11.data });
          return c11.map(({ address: a11, storageKeys: b12 }) => b12.length > 0 ? a11 : null);
        })).then((a11) => a11.flat().filter(Boolean)) : [], m2 = await cu(a10, { blockNumber: c10, blockTag: d10, blocks: [...g2 ? [{ calls: [{ data: k2 }], stateOverrides: f2 }, { calls: l2.map((a11, b11) => ({ abi: [dx("function balanceOf(address) returns (uint256)")], functionName: "balanceOf", args: [j3.address], to: a11, from: dz, nonce: b11 })), stateOverrides: [{ address: dz, nonce: 0 }] }] : [], { calls: [...e2, { to: dz }].map((a11) => ({ ...a11, from: j3?.address })), stateOverrides: f2 }, ...g2 ? [{ calls: [{ data: k2 }] }, { calls: l2.map((a11, b11) => ({ abi: [dx("function balanceOf(address) returns (uint256)")], functionName: "balanceOf", args: [j3.address], to: a11, from: dz, nonce: b11 })), stateOverrides: [{ address: dz, nonce: 0 }] }, { calls: l2.map((a11, b11) => ({ to: a11, abi: [dx("function decimals() returns (uint256)")], functionName: "decimals", from: dz, nonce: b11 })), stateOverrides: [{ address: dz, nonce: 0 }] }, { calls: l2.map((a11, b11) => ({ to: a11, abi: [dx("function tokenURI(uint256) returns (string)")], functionName: "tokenURI", args: [0n], from: dz, nonce: b11 })), stateOverrides: [{ address: dz, nonce: 0 }] }, { calls: l2.map((a11, b11) => ({ to: a11, abi: [dx("function symbol() returns (string)")], functionName: "symbol", from: dz, nonce: b11 })), stateOverrides: [{ address: dz, nonce: 0 }] }] : []], traceTransfers: h2, validation: i2 }), n2 = g2 ? m2[2] : m2[0], [o2, p2, , q3, r2, s2, t2, u2] = g2 ? m2 : [], { calls: v3, ...w3 } = n2, x3 = v3.slice(0, -1) ?? [], y2 = [...o2?.calls ?? [], ...p2?.calls ?? []].map((a11) => "success" === a11.status ? (0, bg.uU)(a11.data) : null), z3 = [...q3?.calls ?? [], ...r2?.calls ?? []].map((a11) => "success" === a11.status ? (0, bg.uU)(a11.data) : null), A2 = (s2?.calls ?? []).map((a11) => "success" === a11.status ? a11.result : null), C3 = (u2?.calls ?? []).map((a11) => "success" === a11.status ? a11.result : null), D3 = (t2?.calls ?? []).map((a11) => "success" === a11.status ? a11.result : null), E2 = [];
        for (let [a11, b11] of z3.entries()) {
          let c11 = y2[a11];
          if ("bigint" != typeof b11 || "bigint" != typeof c11) continue;
          let d11 = A2[a11 - 1], e3 = C3[a11 - 1], f3 = D3[a11 - 1], g3 = 0 === a11 ? { address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", decimals: 18, symbol: "ETH" } : { address: l2[a11 - 1], decimals: f3 || d11 ? Number(d11 ?? 1) : void 0, symbol: e3 ?? void 0 };
          E2.some((a12) => a12.token.address === g3.address) || E2.push({ token: g3, value: { pre: c11, post: b11, diff: b11 - c11 } });
        }
        return { assetChanges: E2, block: w3, results: x3 };
      }
      async function dB(a10, b10) {
        let { abi: c10, address: d10, args: e2, functionName: f2, dataSuffix: g2 = "string" == typeof a10.dataSuffix ? a10.dataSuffix : a10.dataSuffix?.value, ...h2 } = b10, i2 = h2.account ? (0, B2.J)(h2.account) : a10.account, j3 = (0, G2.p)({ abi: c10, args: e2, functionName: f2 });
        try {
          let { data: k2 } = await X(a10, aC.T, "call")({ batch: false, data: `${j3}${g2 ? g2.replace("0x", "") : ""}`, to: d10, ...h2, account: i2 }), l2 = (0, F2.e)({ abi: c10, args: e2, functionName: f2, data: k2 || "0x" }), m2 = c10.filter((a11) => "name" in a11 && a11.name === b10.functionName);
          return { result: l2, request: { abi: m2, address: d10, args: e2, dataSuffix: g2, functionName: f2, ...h2, account: i2 } };
        } catch (a11) {
          throw aB(a11, { abi: c10, address: d10, args: e2, docsPath: "/docs/contract/simulateContract", functionName: f2, sender: i2?.address });
        }
      }
      async function dC(a10, { filter: b10 }) {
        return b10.request({ method: "eth_uninstallFilter", params: [b10.id] });
      }
      let dD = "0x6492649264926492649264926492649264926492649264926492649264926492";
      class dE extends cB.C {
        constructor(a10) {
          super(`Value \`${a10}\` is an invalid ERC-6492 wrapped signature.`), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "SignatureErc6492.InvalidWrappedSignatureError" });
        }
      }
      function dF(a10, b10 = {}) {
        let { recovered: c10 } = b10;
        if (void 0 === a10.r || void 0 === a10.s || c10 && void 0 === a10.yParity) throw new dJ({ signature: a10 });
        if (a10.r < 0n || a10.r > de2) throw new dK({ value: a10.r });
        if (a10.s < 0n || a10.s > de2) throw new dL({ value: a10.s });
        if ("number" == typeof a10.yParity && 0 !== a10.yParity && 1 !== a10.yParity) throw new dM({ value: a10.yParity });
      }
      function dG(a10) {
        if (130 !== a10.length && 132 !== a10.length) throw new dI({ signature: a10 });
        let b10 = BigInt(cD.di(a10, 0, 32)), c10 = BigInt(cD.di(a10, 32, 64)), d10 = (() => {
          let b11 = Number(`0x${a10.slice(130)}`);
          if (!Number.isNaN(b11)) try {
            return dH(b11);
          } catch {
            throw new dM({ value: b11 });
          }
        })();
        return void 0 === d10 ? { r: b10, s: c10 } : { r: b10, s: c10, yParity: d10 };
      }
      function dH(a10) {
        if (0 === a10 || 27 === a10) return 0;
        if (1 === a10 || 28 === a10) return 1;
        if (a10 >= 35) return +(a10 % 2 == 0);
        throw new dN({ value: a10 });
      }
      class dI extends cB.C {
        constructor({ signature: a10 }) {
          super(`Value \`${a10}\` is an invalid signature size.`, { metaMessages: ["Expected: 64 bytes or 65 bytes.", `Received ${cD.Ej(cD.HT(a10))} bytes.`] }), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "Signature.InvalidSerializedSizeError" });
        }
      }
      class dJ extends cB.C {
        constructor({ signature: a10 }) {
          super(`Signature \`${cJ.As(a10)}\` is missing either an \`r\`, \`s\`, or \`yParity\` property.`), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "Signature.MissingPropertiesError" });
        }
      }
      class dK extends cB.C {
        constructor({ value: a10 }) {
          super(`Value \`${a10}\` is an invalid r value. r must be a positive integer less than 2^256.`), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "Signature.InvalidRError" });
        }
      }
      class dL extends cB.C {
        constructor({ value: a10 }) {
          super(`Value \`${a10}\` is an invalid s value. s must be a positive integer less than 2^256.`), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "Signature.InvalidSError" });
        }
      }
      class dM extends cB.C {
        constructor({ value: a10 }) {
          super(`Value \`${a10}\` is an invalid y-parity value. Y-parity must be 0 or 1.`), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "Signature.InvalidYParityError" });
        }
      }
      class dN extends cB.C {
        constructor({ value: a10 }) {
          super(`Value \`${a10}\` is an invalid v value. v must be 27, 28 or >=35.`), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "Signature.InvalidVError" });
        }
      }
      let dO = dp("(uint256 chainId, address delegation, uint256 nonce, uint8 yParity, uint256 r, uint256 s), address to, bytes data");
      function dP(a10) {
        if ("string" == typeof a10) {
          if ("0x8010801080108010801080108010801080108010801080108010801080108010" !== cD.di(a10, -32)) throw new dQ(a10);
        } else dF(a10.authorization);
      }
      class dQ extends cB.C {
        constructor(a10) {
          super(`Value \`${a10}\` is an invalid ERC-8010 wrapped signature.`), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "SignatureErc8010.InvalidWrappedSignatureError" });
        }
      }
      var dR = c(437);
      async function dS({ address: a10, authorization: b10, signature: c10 }) {
        return (0, b3.h)((0, H.b)(a10), await bm({ authorization: b10, signature: c10 }));
      }
      var dT = c(5867);
      async function dU(a10, b10) {
        let { address: c10, chain: d10 = a10.chain, hash: e2, erc6492VerifierAddress: f2 = b10.universalSignatureVerifierAddress ?? d10?.contracts?.erc6492Verifier?.address, multicallAddress: g2 = b10.multicallAddress ?? d10?.contracts?.multicall3?.address, mode: h2 = "auto" } = b10;
        if (d10?.verifyHash) return await d10.verifyHash(a10, b10);
        let i2 = (() => {
          let a11 = b10.signature;
          return (0, T2.q)(a11) ? a11 : "object" == typeof a11 && "r" in a11 && "s" in a11 ? function({ r: a12, s: b11, to: c11 = "hex", v: d11, yParity: e3 }) {
            let f3 = (() => {
              if (0 === e3 || 1 === e3) return e3;
              if (d11 && (27n === d11 || 28n === d11 || d11 >= 35n)) return +(d11 % 2n === 0n);
              throw Error("Invalid `v` or `yParity` value");
            })(), g3 = `0x${new dT.secp256k1.Signature((0, bg.uU)(a12), (0, bg.uU)(b11)).toCompactHex()}${0 === f3 ? "1b" : "1c"}`;
            return "hex" === c11 ? g3 : (0, R2.aT)(g3);
          }(a11) : (0, L2.My)(a11);
        })();
        try {
          if ("eoa" === h2) try {
            if ((0, b3.h)((0, H.b)(c10), await bj({ hash: e2, signature: i2 }))) return true;
          } catch {
          }
          if (function(a11) {
            try {
              return dP(a11), true;
            } catch {
              return false;
            }
          }(i2)) return await dV(a10, { ...b10, multicallAddress: g2, signature: i2 });
          return await dW(a10, { ...b10, verifierAddress: f2, signature: i2 });
        } catch (a11) {
          if ("eoa" !== h2) try {
            if ((0, b3.h)((0, H.b)(c10), await bj({ hash: e2, signature: i2 }))) return true;
          } catch {
          }
          if (a11 instanceof dY) return false;
          throw a11;
        }
      }
      async function dV(a10, b10) {
        let { address: c10, blockNumber: d10, blockTag: e2, hash: f2, multicallAddress: g2 } = b10, { authorization: h2, data: i2, signature: j3, to: k2 } = function(a11) {
          dP(a11);
          let b11 = cD.Ro(cD.di(a11, -64, -32)), c11 = cD.di(a11, -b11 - 64, -64), d11 = cD.di(a11, 0, -b11 - 64), [e3, f3, g3] = function(a12, b12, c12 = {}) {
            let { as: d12 = "Array", checksumAddress: e4 = false } = c12, f4 = "string" == typeof b12 ? cM(b12) : b12, g4 = function(a13, { recursiveReadLimit: b13 = 8192 } = {}) {
              let c13 = Object.create(di);
              return c13.bytes = a13, c13.dataView = new DataView(a13.buffer, a13.byteOffset, a13.byteLength), c13.positionReadCount = /* @__PURE__ */ new Map(), c13.recursiveReadLimit = b13, c13;
            }(f4);
            if (0 === cN(f4) && a12.length > 0) throw new dr();
            if (cN(f4) && 32 > cN(f4)) throw new dq({ data: "string" == typeof b12 ? b12 : cD.uK(b12), parameters: a12, size: cN(f4) });
            let h3 = 0, i3 = "Array" === d12 ? [] : {};
            for (let b13 = 0; b13 < a12.length; ++b13) {
              let c13 = a12[b13];
              g4.setPosition(h3);
              let [f5, j4] = function a13(b14, c14, d13) {
                let { checksumAddress: e5, staticPosition: f6 } = d13, g5 = dg(c14.type);
                if (g5) {
                  let [d14, h5] = g5;
                  return function(b15, c15, d15) {
                    let { checksumAddress: e6, length: f7, staticPosition: g6 } = d15;
                    if (!f7) {
                      let d16 = g6 + cO(b15.readBytes(32)), f8 = d16 + 32;
                      b15.setPosition(d16);
                      let h7 = cO(b15.readBytes(32)), i6 = dh(c15), j5 = 0, k3 = [];
                      for (let d17 = 0; d17 < h7; ++d17) {
                        b15.setPosition(f8 + (i6 ? 32 * d17 : j5));
                        let [g7, h8] = a13(b15, c15, { checksumAddress: e6, staticPosition: f8 });
                        j5 += h8, k3.push(g7);
                      }
                      return b15.setPosition(g6 + 32), [k3, 32];
                    }
                    if (dh(c15)) {
                      let d16 = g6 + cO(b15.readBytes(32)), h7 = [];
                      for (let g7 = 0; g7 < f7; ++g7) {
                        b15.setPosition(d16 + 32 * g7);
                        let [f8] = a13(b15, c15, { checksumAddress: e6, staticPosition: d16 });
                        h7.push(f8);
                      }
                      return b15.setPosition(g6 + 32), [h7, 32];
                    }
                    let h6 = 0, i5 = [];
                    for (let d16 = 0; d16 < f7; ++d16) {
                      let [d17, f8] = a13(b15, c15, { checksumAddress: e6, staticPosition: g6 + h6 });
                      h6 += f8, i5.push(d17);
                    }
                    return [i5, h6];
                  }(b14, { ...c14, type: h5 }, { checksumAddress: e5, length: d14, staticPosition: f6 });
                }
                if ("tuple" === c14.type) return function(b15, c15, d14) {
                  let { checksumAddress: e6, staticPosition: f7 } = d14, g6 = 0 === c15.components.length || c15.components.some(({ name: a14 }) => !a14), h5 = g6 ? [] : {}, i5 = 0;
                  if (dh(c15)) {
                    let d15 = f7 + cO(b15.readBytes(32));
                    for (let f8 = 0; f8 < c15.components.length; ++f8) {
                      let j5 = c15.components[f8];
                      b15.setPosition(d15 + i5);
                      let [k3, l3] = a13(b15, j5, { checksumAddress: e6, staticPosition: d15 });
                      i5 += l3, h5[g6 ? f8 : j5?.name] = k3;
                    }
                    return b15.setPosition(f7 + 32), [h5, 32];
                  }
                  for (let d15 = 0; d15 < c15.components.length; ++d15) {
                    let j5 = c15.components[d15], [k3, l3] = a13(b15, j5, { checksumAddress: e6, staticPosition: f7 });
                    h5[g6 ? d15 : j5?.name] = k3, i5 += l3;
                  }
                  return [h5, i5];
                }(b14, c14, { checksumAddress: e5, staticPosition: f6 });
                if ("address" === c14.type) return function(a14, b15 = {}) {
                  let c15, { checksum: d14 = false } = b15, e6 = a14.readBytes(32);
                  return [(c15 = cD.uK(function(a15, b16, c16, d15 = {}) {
                    let { strict: e7 } = d15;
                    let f7 = a15.slice(-20, void 0);
                    return e7 && function(a16, b17, c17) {
                      if ("number" == typeof b17 && "number" == typeof c17 && cN(a16) !== c17 - b17) throw new cS({ offset: c17, position: "end", size: cN(a16) });
                    }(f7, -20, void 0), f7;
                  }(e6, -20)), d14 ? cZ(c15) : c15), 32];
                }(b14, { checksum: e5 });
                if ("bool" === c14.type) return [function(a14, b15 = {}) {
                  let { size: c15 } = b15, d14 = a14;
                  if (void 0 !== c15 && (cE(d14, c15), d14 = cP(d14)), d14.length > 1 || d14[0] > 1) throw new cQ(d14);
                  return !!d14[0];
                }(b14.readBytes(32), { size: 32 }), 32];
                if (c14.type.startsWith("bytes")) return function(a14, b15, { staticPosition: c15 }) {
                  let [d14, e6] = b15.type.split("bytes");
                  if (!e6) {
                    let b16 = cO(a14.readBytes(32));
                    a14.setPosition(c15 + b16);
                    let d15 = cO(a14.readBytes(32));
                    if (0 === d15) return a14.setPosition(c15 + 32), ["0x", 32];
                    let e7 = a14.readBytes(d15);
                    return a14.setPosition(c15 + 32), [cD.uK(e7), 32];
                  }
                  return [cD.uK(a14.readBytes(Number.parseInt(e6, 10), 32)), 32];
                }(b14, c14, { staticPosition: f6 });
                if (c14.type.startsWith("uint") || c14.type.startsWith("int")) {
                  var h4 = b14, i4 = c14;
                  let a14 = i4.type.startsWith("int"), d14 = Number.parseInt(i4.type.split("int")[1] || "256", 10), e6 = h4.readBytes(32);
                  return [d14 > 48 ? function(a15, b15 = {}) {
                    let { size: c15 } = b15;
                    void 0 !== c15 && cE(a15, c15);
                    let d15 = cD.uK(a15, b15);
                    return cD.Dg(d15, b15);
                  }(e6, { signed: a14 }) : cO(e6, { signed: a14 }), 32];
                }
                if ("string" === c14.type) return function(a14, { staticPosition: b15 }) {
                  let c15 = cO(a14.readBytes(32));
                  a14.setPosition(b15 + c15);
                  let d14 = cO(a14.readBytes(32));
                  if (0 === d14) return a14.setPosition(b15 + 32), ["", 32];
                  let e6 = function(a15, b16 = {}) {
                    let { size: c16 } = b16, d15 = a15;
                    return void 0 !== c16 && (cE(d15, c16), d15 = cH(d15, { dir: "right" })), cK.decode(d15);
                  }(cP(a14.readBytes(d14, 32)));
                  return a14.setPosition(b15 + 32), [e6, 32];
                }(b14, { staticPosition: f6 });
                throw new dw(c14.type);
              }(g4, c13, { checksumAddress: e4, staticPosition: 0 });
              h3 += j4, "Array" === d12 ? i3.push(f5) : i3[c13.name ?? b13] = f5;
            }
            return i3;
          }(dO, c11);
          return { authorization: function(a12, b12 = {}) {
            return "string" == typeof a12.chainId ? function(a13) {
              let { address: b13, chainId: c12, nonce: d12 } = a13, e4 = function(a14) {
                if (void 0 !== a14.r && void 0 !== a14.s) {
                  var b14 = a14;
                  let c13 = (() => {
                    var a15;
                    if ("string" == typeof b14) return dG(b14);
                    if (b14 instanceof Uint8Array) return dG(cD.uK(b14));
                    return "string" == typeof b14.r ? function(a16) {
                      let b15 = (() => {
                        let b16 = a16.v ? Number(a16.v) : void 0, c14 = a16.yParity ? Number(a16.yParity) : void 0;
                        if ("number" == typeof b16 && "number" != typeof c14 && (c14 = dH(b16)), "number" != typeof c14) throw new dM({ value: a16.yParity });
                        return c14;
                      })();
                      return { r: BigInt(a16.r), s: BigInt(a16.s), yParity: b15 };
                    }(b14) : b14.v ? { r: (a15 = b14).r, s: a15.s, yParity: dH(a15.v) } : { r: b14.r, s: b14.s, ...void 0 !== b14.yParity ? { yParity: b14.yParity } : {} };
                  })();
                  return dF(c13), c13;
                }
              }(a13);
              return { address: b13, chainId: Number(c12), nonce: BigInt(d12), ...e4 };
            }(a12) : { ...a12, ...b12.signature };
          }({ address: e3.delegation, chainId: Number(e3.chainId), nonce: e3.nonce, yParity: e3.yParity, r: e3.r, s: e3.s }), signature: d11, ...g3 && "0x" !== g3 ? { data: g3, to: f3 } : {} };
        }(b10.signature);
        if (await b22(a10, { address: c10, blockNumber: d10, blockTag: e2 }) === (0, Q2.aP)(["0xef0100", h2.address])) return await dX(a10, { address: c10, blockNumber: d10, blockTag: e2, hash: f2, signature: j3 });
        let l2 = { address: h2.address, chainId: Number(h2.chainId), nonce: Number(h2.nonce), r: (0, L2.cK)(h2.r, { size: 32 }), s: (0, L2.cK)(h2.s, { size: 32 }), yParity: h2.yParity };
        if (!await dS({ address: c10, authorization: l2 })) throw new dY();
        let m2 = await X(a10, aD, "readContract")({ ...g2 ? { address: g2 } : { code: cr.Ez }, authorizationList: [l2], abi: E.v2, blockNumber: d10, blockTag: "pending", functionName: "aggregate3", args: [[...i2 ? [{ allowFailure: true, target: k2 ?? c10, callData: i2 }] : [], { allowFailure: true, target: c10, callData: (0, G2.p)({ abi: E.UW, functionName: "isValidSignature", args: [f2, j3] }) }]] }), n2 = m2[m2.length - 1]?.returnData;
        if (n2?.startsWith("0x1626ba7e")) return true;
        throw new dY();
      }
      async function dW(a10, b10) {
        let { address: c10, factory: d10, factoryData: e2, hash: f2, signature: g2, verifierAddress: h2, ...i2 } = b10, j3 = await (async () => {
          if (!d10 && !e2 || function(a12) {
            try {
              if (cD.di(a12, -32) !== dD) throw new dE(a12);
              return true;
            } catch {
              return false;
            }
          }(g2)) return g2;
          let { data: a11, signature: b11, to: c11 } = { data: e2, signature: g2, to: d10 };
          return cD.xW(dm(dp("address, bytes, bytes"), [c11, a11, b11]), dD);
        })(), k2 = h2 ? { to: h2, data: (0, G2.p)({ abi: E.E5, functionName: "isValidSig", args: [c10, f2, j3] }), ...i2 } : { data: (0, dR.m)({ abi: E.E5, args: [c10, f2, j3], bytecode: cr.fT }), ...i2 }, { data: l2 } = await X(a10, aC.T, "call")(k2).catch((a11) => {
          if (a11 instanceof N.zX) throw new dY();
          throw a11;
        });
        if ((0, bg.Nx)(l2 ?? "0x0")) return true;
        throw new dY();
      }
      async function dX(a10, b10) {
        let { address: c10, blockNumber: d10, blockTag: e2, hash: f2, signature: g2 } = b10;
        if ((await X(a10, aD, "readContract")({ address: c10, abi: E.UW, args: [f2, g2], blockNumber: d10, blockTag: e2, functionName: "isValidSignature" }).catch((a11) => {
          if (a11 instanceof N.bG) throw new dY();
          throw a11;
        })).startsWith("0x1626ba7e")) return true;
        throw new dY();
      }
      class dY extends Error {
      }
      function dZ(a10, b10) {
        return (0, S.S)(function(a11) {
          let b11 = "string" == typeof a11 ? (0, L2.i3)(a11) : "string" == typeof a11.raw ? a11.raw : (0, L2.My)(a11.raw), c10 = (0, L2.i3)(`Ethereum Signed Message:
${(0, J2.E)(b11)}`);
          return (0, Q2.xW)([c10, b11]);
        }(a10), b10);
      }
      async function d$(a10, { address: b10, message: c10, factory: d10, factoryData: e2, signature: f2, ...g2 }) {
        let h2 = dZ(c10);
        return X(a10, dU, "verifyHash")({ address: b10, factory: d10, factoryData: e2, hash: h2, signature: f2, ...g2 });
      }
      var d_ = c(8833), d0 = c(5934);
      class d1 extends M.C {
        constructor({ domain: a10 }) {
          super(`Invalid domain "${(0, d0.A)(a10)}".`, { metaMessages: ["Must be a valid EIP-712 domain."] });
        }
      }
      class d2 extends M.C {
        constructor({ primaryType: a10, types: b10 }) {
          super(`Invalid primary type \`${a10}\` must be one of \`${JSON.stringify(Object.keys(b10))}\`.`, { docsPath: "/api/glossary/Errors#typeddatainvalidprimarytypeerror", metaMessages: ["Check that the primary type is a key in `types`."] });
        }
      }
      class d3 extends M.C {
        constructor({ type: a10 }) {
          super(`Struct type "${a10}" is invalid.`, { metaMessages: ["Struct type must not be a Solidity type."], name: "InvalidStructTypeError" });
        }
      }
      var d4 = c(9320), d5 = c(8620);
      function d6({ data: a10, primaryType: b10, types: c10 }) {
        let d10 = function a11({ data: b11, primaryType: c11, types: d11 }) {
          let e2 = [{ type: "bytes32" }], f2 = [function({ primaryType: a12, types: b12 }) {
            let c12 = (0, L2.nj)(function({ primaryType: a13, types: b13 }) {
              let c13 = "", d12 = function a14({ primaryType: b14, types: c14 }, d13 = /* @__PURE__ */ new Set()) {
                let e3 = b14.match(/^\w*/u), f3 = e3?.[0];
                if (d13.has(f3) || void 0 === c14[f3]) return d13;
                for (let b15 of (d13.add(f3), c14[f3])) a14({ primaryType: b15.type, types: c14 }, d13);
                return d13;
              }({ primaryType: a13, types: b13 });
              for (let e3 of (d12.delete(a13), [a13, ...Array.from(d12).sort()])) c13 += `${e3}(${b13[e3].map(({ name: a14, type: b14 }) => `${b14} ${a14}`).join(",")})`;
              return c13;
            }({ primaryType: a12, types: b12 }));
            return (0, S.S)(c12);
          }({ primaryType: c11, types: d11 })];
          for (let g2 of d11[c11]) {
            let [c12, h2] = function b12({ types: c13, name: d12, type: e3, value: f3 }) {
              if (void 0 !== c13[e3]) return [{ type: "bytes32" }, (0, S.S)(a11({ data: f3, primaryType: e3, types: c13 }))];
              if ("bytes" === e3) return [{ type: "bytes32" }, (0, S.S)(f3)];
              if ("string" === e3) return [{ type: "bytes32" }, (0, S.S)((0, L2.nj)(f3))];
              if (e3.lastIndexOf("]") === e3.length - 1) {
                let a12 = e3.slice(0, e3.lastIndexOf("[")), g3 = f3.map((e4) => b12({ name: d12, type: a12, types: c13, value: e4 }));
                return [{ type: "bytes32" }, (0, S.S)((0, a7.h)(g3.map(([a13]) => a13), g3.map(([, a13]) => a13)))];
              }
              return [{ type: e3 }, f3];
            }({ types: d11, name: g2.name, type: g2.type, value: b11[g2.name] });
            e2.push(c12), f2.push(h2);
          }
          return (0, a7.h)(e2, f2);
        }({ data: a10, primaryType: b10, types: c10 });
        return (0, S.S)(d10);
      }
      async function d7(a10, b10) {
        let { address: c10, factory: d10, factoryData: e2, signature: f2, message: g2, primaryType: h2, types: i2, domain: j3, ...k2 } = b10, l2 = function(a11) {
          let { domain: b11 = {}, message: c11, primaryType: d11 } = a11, e3 = { EIP712Domain: function({ domain: a12 }) {
            return ["string" == typeof a12?.name && { name: "name", type: "string" }, a12?.version && { name: "version", type: "string" }, ("number" == typeof a12?.chainId || "bigint" == typeof a12?.chainId) && { name: "chainId", type: "uint256" }, a12?.verifyingContract && { name: "verifyingContract", type: "address" }, a12?.salt && { name: "salt", type: "bytes32" }].filter(Boolean);
          }({ domain: b11 }), ...a11.types }, { domain: f3, message: g3, primaryType: h3, types: i3 } = { domain: b11, message: c11, primaryType: d11, types: e3 }, j4 = (a12, b12) => {
            for (let c12 of a12) {
              let { name: a13, type: d12 } = c12, e4 = b12[a13], f4 = d12.match(d5.Ge);
              if (f4 && ("number" == typeof e4 || "bigint" == typeof e4)) {
                let [a14, b13, c13] = f4;
                (0, L2.cK)(e4, { signed: "int" === b13, size: Number.parseInt(c13, 10) / 8 });
              }
              if ("address" === d12 && "string" == typeof e4 && !(0, d4.P)(e4)) throw new d_.M({ address: e4 });
              let g4 = d12.match(d5.BD);
              if (g4) {
                let [a14, b13] = g4;
                if (b13 && (0, J2.E)(e4) !== Number.parseInt(b13, 10)) throw new Y2.BI({ expectedSize: Number.parseInt(b13, 10), givenSize: (0, J2.E)(e4) });
              }
              let h4 = i3[d12];
              h4 && (function(a14) {
                if ("address" === a14 || "bool" === a14 || "string" === a14 || a14.startsWith("bytes") || a14.startsWith("uint") || a14.startsWith("int")) throw new d3({ type: a14 });
              }(d12), j4(h4, e4));
            }
          };
          if (i3.EIP712Domain && f3) {
            if ("object" != typeof f3) throw new d1({ domain: f3 });
            j4(i3.EIP712Domain, f3);
          }
          if ("EIP712Domain" !== h3) if (i3[h3]) j4(i3[h3], g3);
          else throw new d2({ primaryType: h3, types: i3 });
          let k3 = ["0x1901"];
          return b11 && k3.push(function({ domain: a12, types: b12 }) {
            return d6({ data: a12, primaryType: "EIP712Domain", types: b12 });
          }({ domain: b11, types: e3 })), "EIP712Domain" !== d11 && k3.push(d6({ data: c11, primaryType: d11, types: e3 })), (0, S.S)((0, Q2.xW)(k3));
        }({ message: g2, primaryType: h2, types: i2, domain: j3 });
        return X(a10, dU, "verifyHash")({ address: c10, factory: d10, factoryData: e2, hash: l2, signature: f2, ...k2 });
      }
      let d8 = /* @__PURE__ */ new Map(), d9 = /* @__PURE__ */ new Map(), ea = 0;
      function eb(a10, b10, c10) {
        let d10 = ++ea, e2 = () => d8.get(a10) || [], f2 = () => {
          let b11 = e2();
          if (!b11.some((a11) => a11.id === d10)) return;
          let c11 = d9.get(a10);
          if (1 === b11.length && c11) {
            let a11 = c11();
            a11 instanceof Promise && a11.catch(() => {
            });
          }
          (() => {
            let b12 = e2().filter((a11) => a11.id !== d10);
            if (0 === b12.length) {
              d8.delete(a10), d9.delete(a10);
              return;
            }
            d8.set(a10, b12);
          })();
        }, g2 = e2();
        if (d8.set(a10, [...g2, { id: d10, fns: b10 }]), g2 && g2.length > 0) return f2;
        let h2 = {};
        for (let a11 in b10) h2[a11] = (...b11) => {
          let c11 = e2();
          if (0 !== c11.length) for (let d11 of c11) d11.fns[a11]?.(...b11);
        };
        let i2 = c10(h2);
        return "function" == typeof i2 && d9.set(a10, i2), f2;
      }
      var ec = c(2346), ed = c(4728);
      async function ee2(a10, { signal: b10 } = {}) {
        return new Promise((c10, d10) => {
          if (b10?.aborted) return void d10((0, ed.TY)(b10));
          let e2 = () => b10?.removeEventListener("abort", g2), f2 = setTimeout(() => {
            e2(), c10();
          }, a10), g2 = () => {
            clearTimeout(f2), e2(), d10((0, ed.TY)(b10));
          };
          b10?.addEventListener("abort", g2, { once: true });
        });
      }
      function ef(a10, { delay: b10 = 100, retryCount: c10 = 2, shouldRetry: d10 = () => true, signal: e2 } = {}) {
        return new Promise((f2, g2) => {
          let h2 = async ({ count: i2 = 0 } = {}) => {
            if (e2?.aborted) return void g2((0, ed.TY)(e2));
            let j3 = async ({ error: a11 }) => {
              let c11 = "function" == typeof b10 ? b10({ count: i2, error: a11 }) : b10;
              if (c11) try {
                await ee2(c11, { signal: e2 });
              } catch (a12) {
                g2(a12);
                return;
              }
              h2({ count: i2 + 1 });
            };
            try {
              let b11 = await a10();
              f2(b11);
            } catch (a11) {
              if (e2?.aborted) return void g2((0, ed.TY)(e2));
              if ((0, ed.zf)(a11)) return void g2(a11);
              if (i2 < c10 && await d10({ count: i2, error: a11 })) return j3({ error: a11 });
              g2(a11);
            }
          };
          h2();
        });
      }
      function eg(a10, { emitOnBegin: b10, initialWaitTime: c10, interval: d10 }) {
        let e2 = true, f2 = () => e2 = false;
        return (async () => {
          let g2;
          b10 && (g2 = await a10({ unpoll: f2 }));
          let h2 = await c10?.(g2) ?? d10;
          await ee2(h2);
          let i2 = async () => {
            e2 && (await a10({ unpoll: f2 }), await ee2(d10), i2());
          };
          i2();
        })(), f2;
      }
      function eh(a10, { emitOnBegin: b10 = false, emitMissed: c10 = false, onBlockNumber: d10, onError: e2, poll: f2, pollingInterval: g2 = a10.pollingInterval }) {
        let h2;
        return (void 0 !== f2 ? f2 : "webSocket" !== a10.transport.type && "ipc" !== a10.transport.type && ("fallback" !== a10.transport.type || "webSocket" !== a10.transport.transports[0].config.type && "ipc" !== a10.transport.transports[0].config.type)) ? eb((0, d0.A)(["watchBlockNumber", a10.uid, b10, c10, g2]), { onBlockNumber: d10, onError: e2 }, (d11) => eg(async () => {
          try {
            let b11 = await X(a10, b0, "getBlockNumber")({ cacheTime: 0 });
            if (void 0 !== h2) {
              if (b11 === h2) return;
              if (b11 - h2 > 1 && c10) for (let a11 = h2 + 1n; a11 < b11; a11++) d11.onBlockNumber(a11, h2), h2 = a11;
            }
            (void 0 === h2 || b11 > h2) && (d11.onBlockNumber(b11, h2), h2 = b11);
          } catch (a11) {
            d11.onError?.(a11);
          }
        }, { emitOnBegin: b10, interval: g2 })) : eb((0, d0.A)(["watchBlockNumber", a10.uid, b10, c10]), { onBlockNumber: d10, onError: e2 }, (b11) => {
          let c11 = true, d11 = () => c11 = false;
          return (async () => {
            try {
              let e3 = (() => {
                if ("fallback" === a10.transport.type) {
                  let b12 = a10.transport.transports.find((a11) => "webSocket" === a11.config.type || "ipc" === a11.config.type);
                  return b12 ? b12.value : a10.transport;
                }
                return a10.transport;
              })(), { unsubscribe: f3 } = await e3.subscribe({ params: ["newHeads"], onData(a11) {
                if (!c11) return;
                let d12 = (0, bg.uU)(a11.result?.number);
                b11.onBlockNumber(d12, h2), h2 = d12;
              }, onError(a11) {
                b11.onError?.(a11);
              } });
              d11 = f3, c11 || d11();
            } catch (a11) {
              e2?.(a11);
            }
          })(), () => d11();
        });
      }
      async function ei(a10, b10) {
        let c10, d10, e2, f2, g2, { checkReplacement: h2 = true, confirmations: i2 = 1, hash: j3, onReplaced: k2, retryCount: l2 = 6, retryDelay: m2 = ({ count: a11 }) => 200 * ~~(1 << a11), timeout: n2 = 18e4 } = b10, o2 = (0, d0.A)(["waitForTransactionReceipt", a10.uid, j3]), p2 = b10.pollingInterval ? b10.pollingInterval : a10.chain?.experimental_preconfirmationTime ? a10.chain.experimental_preconfirmationTime : a10.pollingInterval, q3 = false, { promise: r2, resolve: s2, reject: t2 } = (0, ec.Y)(), u2 = n2 ? setTimeout(() => {
          g2?.(), f2?.(), t2(new bp.WA({ hash: j3 }));
        }, n2) : void 0;
        return f2 = eb(o2, { onReplaced: k2, resolve: s2, reject: t2 }, async (b11) => {
          if ((e2 = await X(a10, cq, "getTransactionReceipt")({ hash: j3 }).catch(() => void 0)) && i2 <= 1) {
            clearTimeout(u2), b11.resolve(e2), f2?.();
            return;
          }
          g2 = X(a10, eh, "watchBlockNumber")({ emitMissed: true, emitOnBegin: true, poll: true, pollingInterval: p2, async onBlockNumber(k3) {
            let n3 = (a11) => {
              clearTimeout(u2), g2?.(), a11(), f2?.();
            }, o3 = k3;
            if (!q3) try {
              if (e2) {
                if (i2 > 1 && (!e2.blockNumber || o3 - e2.blockNumber + 1n < i2)) return;
                n3(() => b11.resolve(e2));
                return;
              }
              if (h2 && !c10 && (q3 = true, await ef(async () => {
                (c10 = await X(a10, cm, "getTransaction")({ hash: j3 })).blockNumber && (o3 = c10.blockNumber);
              }, { delay: m2, retryCount: l2 }), q3 = false), e2 = await X(a10, cq, "getTransactionReceipt")({ hash: j3 }), i2 > 1 && (!e2.blockNumber || o3 - e2.blockNumber + 1n < i2)) return;
              n3(() => b11.resolve(e2));
            } catch (f3) {
              if (f3 instanceof bp.Kz || f3 instanceof bp.Kc) {
                if (!c10) {
                  q3 = false;
                  return;
                }
                try {
                  d10 = c10, q3 = true;
                  let f4 = await ef(() => X(a10, bB, "getBlock")({ blockNumber: o3, includeTransactions: true }), { delay: m2, retryCount: l2, shouldRetry: ({ error: a11 }) => a11 instanceof bx });
                  q3 = false;
                  let g3 = f4.transactions.find(({ from: a11, nonce: b12 }) => a11 === d10.from && b12 === d10.nonce);
                  if (!g3 || (e2 = await X(a10, cq, "getTransactionReceipt")({ hash: g3.hash }), i2 > 1 && (!e2.blockNumber || o3 - e2.blockNumber + 1n < i2))) return;
                  let h3 = "replaced";
                  g3.to === d10.to && g3.value === d10.value && g3.input === d10.input ? h3 = "repriced" : g3.from === g3.to && 0n === g3.value && (h3 = "cancelled"), n3(() => {
                    b11.onReplaced?.({ reason: h3, replacedTransaction: d10, transaction: g3, transactionReceipt: e2 }), b11.resolve(e2);
                  });
                } catch (a11) {
                  n3(() => b11.reject(a11));
                }
              } else n3(() => b11.reject(f3));
            }
          } });
        }), r2;
      }
      let ej = /^(?:(?<scheme>[a-zA-Z][a-zA-Z0-9+-.]*):\/\/)?(?<domain>[a-zA-Z0-9+-.]*(?::[0-9]{1,5})?) (?:wants you to sign in with your Ethereum account:\n)(?<address>0x[a-fA-F0-9]{40})\n\n(?:(?<statement>.*)\n\n)?/, ek = /(?:URI: (?<uri>.+))\n(?:Version: (?<version>.+))\n(?:Chain ID: (?<chainId>\d+))\n(?:Nonce: (?<nonce>[a-zA-Z0-9]+))\n(?:Issued At: (?<issuedAt>.+))(?:\nExpiration Time: (?<expirationTime>.+))?(?:\nNot Before: (?<notBefore>.+))?(?:\nRequest ID: (?<requestId>.+))?/;
      async function el(a10, b10) {
        let { address: c10, domain: d10, message: e2, nonce: f2, scheme: g2, signature: h2, time: i2 = /* @__PURE__ */ new Date(), ...j3 } = b10, k2 = function(a11) {
          let { scheme: b11, statement: c11, ...d11 } = a11.match(ej)?.groups ?? {}, { chainId: e3, expirationTime: f3, issuedAt: g3, notBefore: h3, requestId: i3, ...j4 } = a11.match(ek)?.groups ?? {}, k3 = a11.split("Resources:")[1]?.split("\n- ").slice(1);
          return { ...d11, ...j4, ...e3 ? { chainId: Number(e3) } : {}, ...f3 ? { expirationTime: new Date(f3) } : {}, ...g3 ? { issuedAt: new Date(g3) } : {}, ...h3 ? { notBefore: new Date(h3) } : {}, ...i3 ? { requestId: i3 } : {}, ...k3 ? { resources: k3 } : {}, ...b11 ? { scheme: b11 } : {}, ...c11 ? { statement: c11 } : {} };
        }(e2);
        if (!k2.address || !function(a11) {
          let { address: b11, domain: c11, message: d11, nonce: e3, scheme: f3, time: g3 = /* @__PURE__ */ new Date() } = a11;
          if (c11 && d11.domain !== c11 || e3 && d11.nonce !== e3 || f3 && d11.scheme !== f3 || d11.expirationTime && g3 >= d11.expirationTime || d11.notBefore && g3 < d11.notBefore) return false;
          try {
            if (!d11.address || !(0, d4.P)(d11.address, { strict: false }) || b11 && !(0, b3.h)(d11.address, b11)) return false;
          } catch {
            return false;
          }
          return true;
        }({ address: c10, domain: d10, message: k2, nonce: f2, scheme: g2, time: i2 })) return false;
        let l2 = dZ(e2);
        return dU(a10, { address: k2.address, hash: l2, signature: h2, ...j3 });
      }
      async function em(a10, { serializedTransaction: b10 }) {
        return a10.request({ method: "eth_sendRawTransaction", params: [b10] }, { retryCount: 0 });
      }
      async function en(a10, { serializedTransaction: b10, throwOnReceiptRevert: c10, timeout: d10 }) {
        let e2 = await a10.request({ method: "eth_sendRawTransactionSync", params: d10 ? [b10, d10] : [b10] }, { retryCount: 0 }), f2 = (a10.chain?.formatters?.transactionReceipt?.format || cp)(e2);
        if ("reverted" === f2.status && c10) throw new bp.Sq({ receipt: f2 });
        return f2;
      }
      function eo(a10) {
        return { call: (b10) => (0, aC.T)(a10, b10), createAccessList: (b10) => a22(a10, b10), createBlockFilter: () => a4(a10), createContractEventFilter: (b10) => bd(a10, b10), createEventFilter: (b10) => be(a10, b10), createPendingTransactionFilter: () => bf(a10), estimateContractGas: (b10) => bW(a10, b10), estimateGas: (b10) => bV(a10, b10), getBalance: (b10) => bX(a10, b10), getBlobBaseFee: () => bY(a10), getBlock: (b10) => bB(a10, b10), getBlockNumber: (b10) => b0(a10, b10), getBlockTransactionCount: (b10) => b1(a10, b10), getBytecode: (b10) => b22(a10, b10), getChainId: () => bP(a10), getCode: (b10) => b22(a10, b10), getContractEvents: (b10) => cb(a10, b10), getDelegation: (b10) => cd(a10, b10), getEip712Domain: (b10) => cf(a10, b10), getEnsAddress: (b10) => aE(a10, b10), getEnsAvatar: (b10) => aX(a10, b10), getEnsName: (b10) => aY(a10, b10), getEnsResolver: (b10) => aZ(a10, b10), getEnsText: (b10) => aW(a10, b10), getFeeHistory: (b10) => ch(a10, b10), estimateFeesPerGas: (b10) => bF(a10, b10), getFilterChanges: (b10) => ci(a10, b10), getFilterLogs: (b10) => cj(a10, b10), getGasPrice: () => bC(a10), getLogs: (b10) => ca(a10, b10), getProof: (b10) => ck(a10, b10), estimateMaxPriorityFeePerGas: (b10) => bD(a10, b10), fillTransaction: (b10) => bQ(a10, b10), getStorageAt: (b10) => cl(a10, b10), getTransaction: (b10) => cm(a10, b10), getTransactionConfirmations: (b10) => cn(a10, b10), getTransactionCount: (b10) => bI(a10, b10), getTransactionReceipt: (b10) => cq(a10, b10), multicall: (b10) => cs(a10, b10), prepareTransactionRequest: (b10) => bU(a10, b10), readContract: (b10) => aD(a10, b10), sendRawTransaction: (b10) => em(a10, b10), sendRawTransactionSync: (b10) => en(a10, b10), simulate: (b10) => cu(a10, b10), simulateBlocks: (b10) => cu(a10, b10), simulateCalls: (b10) => dA(a10, b10), simulateContract: (b10) => dB(a10, b10), verifyHash: (b10) => dU(a10, b10), verifyMessage: (b10) => d$(a10, b10), verifySiweMessage: (b10) => el(a10, b10), verifyTypedData: (b10) => d7(a10, b10), uninstallFilter: (b10) => dC(a10, b10), waitForTransactionReceipt: (b10) => ei(a10, b10), watchBlocks: (b10) => function(a11, { blockTag: b11 = a11.experimental_blockTag ?? "latest", emitMissed: c10 = false, emitOnBegin: d10 = false, onBlock: e2, onError: f2, includeTransactions: g2, poll: h2, pollingInterval: i2 = a11.pollingInterval }) {
          let j3, k2, l2, m2, n2 = void 0 !== h2 ? h2 : "webSocket" !== a11.transport.type && "ipc" !== a11.transport.type && ("fallback" !== a11.transport.type || "webSocket" !== a11.transport.transports[0].config.type && "ipc" !== a11.transport.transports[0].config.type), o2 = g2 ?? false;
          return n2 ? eb((0, d0.A)(["watchBlocks", a11.uid, b11, c10, d10, o2, i2]), { onBlock: e2, onError: f2 }, (e3) => eg(async () => {
            try {
              let d11 = await X(a11, bB, "getBlock")({ blockTag: b11, includeTransactions: o2 });
              if (null !== d11.number && j3?.number != null) {
                if (d11.number === j3.number) return;
                if (d11.number - j3.number > 1 && c10) for (let b12 = j3?.number + 1n; b12 < d11.number; b12++) {
                  let c11 = await X(a11, bB, "getBlock")({ blockNumber: b12, includeTransactions: o2 });
                  e3.onBlock(c11, j3), j3 = c11;
                }
              }
              (j3?.number == null || "pending" === b11 && d11?.number == null || null !== d11.number && d11.number > j3.number) && (e3.onBlock(d11, j3), j3 = d11);
            } catch (a12) {
              e3.onError?.(a12);
            }
          }, { emitOnBegin: d10, interval: i2 })) : (k2 = true, l2 = true, m2 = () => k2 = false, (async () => {
            try {
              d10 && X(a11, bB, "getBlock")({ blockTag: b11, includeTransactions: o2 }).then((a12) => {
                k2 && l2 && (e2(a12, void 0), l2 = false);
              }).catch(f2);
              let c11 = (() => {
                if ("fallback" === a11.transport.type) {
                  let b12 = a11.transport.transports.find((a12) => "webSocket" === a12.config.type || "ipc" === a12.config.type);
                  return b12 ? b12.value : a11.transport;
                }
                return a11.transport;
              })(), { unsubscribe: g3 } = await c11.subscribe({ params: ["newHeads"], async onData(b12) {
                if (!k2) return;
                let c12 = await X(a11, bB, "getBlock")({ blockNumber: b12.result?.number, includeTransactions: o2 }).catch(() => {
                });
                k2 && (e2(c12, j3), l2 = false, j3 = c12);
              }, onError(a12) {
                f2?.(a12);
              } });
              m2 = g3, k2 || m2();
            } catch (a12) {
              f2?.(a12);
            }
          })(), () => m2());
        }(a10, b10), watchBlockNumber: (b10) => eh(a10, b10), watchContractEvent: (b10) => function(a11, b11) {
          let { abi: c10, address: d10, args: e2, batch: f2 = true, eventName: g2, fromBlock: h2, onError: i2, onLogs: j3, poll: k2, pollingInterval: l2 = a11.pollingInterval, strict: m2 } = b11;
          return (void 0 !== k2 ? k2 : "bigint" == typeof h2 || "webSocket" !== a11.transport.type && "ipc" !== a11.transport.type && ("fallback" !== a11.transport.type || "webSocket" !== a11.transport.transports[0].config.type && "ipc" !== a11.transport.transports[0].config.type)) ? (() => {
            let b12 = m2 ?? false;
            return eb((0, d0.A)(["watchContractEvent", d10, e2, f2, a11.uid, g2, l2, b12, h2]), { onLogs: j3, onError: i2 }, (i3) => {
              let j4, k3;
              void 0 !== h2 && (j4 = h2 - 1n);
              let m3 = false, n2 = eg(async () => {
                if (!m3) {
                  try {
                    k3 = await X(a11, bd, "createContractEventFilter")({ abi: c10, address: d10, args: e2, eventName: g2, strict: b12, fromBlock: h2 });
                  } catch {
                  }
                  m3 = true;
                  return;
                }
                try {
                  let h3;
                  if (k3) h3 = await X(a11, ci, "getFilterChanges")({ filter: k3 });
                  else {
                    let f3 = await X(a11, b0, "getBlockNumber")({});
                    h3 = j4 && j4 < f3 ? await X(a11, cb, "getContractEvents")({ abi: c10, address: d10, args: e2, eventName: g2, fromBlock: j4 + 1n, toBlock: f3, strict: b12 }) : [], j4 = f3;
                  }
                  if (0 === h3.length) return;
                  if (f2) i3.onLogs(h3);
                  else for (let a12 of h3) i3.onLogs([a12]);
                } catch (a12) {
                  k3 && a12 instanceof af && (m3 = false), i3.onError?.(a12);
                }
              }, { emitOnBegin: true, interval: l2 });
              return async () => {
                k3 && await X(a11, dC, "uninstallFilter")({ filter: k3 }), n2();
              };
            });
          })() : (() => {
            let b12 = (0, d0.A)(["watchContractEvent", d10, e2, f2, a11.uid, g2, l2, m2 ?? false]), h3 = true, k3 = () => h3 = false;
            return eb(b12, { onLogs: j3, onError: i2 }, (b13) => ((async () => {
              try {
                let f3 = (() => {
                  if ("fallback" === a11.transport.type) {
                    let b14 = a11.transport.transports.find((a12) => "webSocket" === a12.config.type || "ipc" === a12.config.type);
                    return b14 ? b14.value : a11.transport;
                  }
                  return a11.transport;
                })(), i3 = g2 ? bb({ abi: c10, eventName: g2, args: e2 }) : [], { unsubscribe: j4 } = await f3.subscribe({ params: ["logs", { address: d10, topics: i3 }], onData(a12) {
                  if (!h3) return;
                  let d11 = a12.result;
                  try {
                    let { eventName: a13, args: e3 } = b8({ abi: c10, data: d11.data, topics: d11.topics, strict: m2 }), f4 = b4(d11, { args: e3, eventName: a13 });
                    b13.onLogs([f4]);
                  } catch (f4) {
                    let a13, c11;
                    if (f4 instanceof Y2.fo || f4 instanceof Y2.l3) {
                      if (m2) return;
                      a13 = f4.abiItem.name, c11 = f4.abiItem.inputs?.some((a14) => !("name" in a14 && a14.name));
                    }
                    let e3 = b4(d11, { args: c11 ? [] : {}, eventName: a13 });
                    b13.onLogs([e3]);
                  }
                }, onError(a12) {
                  b13.onError?.(a12);
                } });
                k3 = j4, h3 || k3();
              } catch (a12) {
                i2?.(a12);
              }
            })(), () => k3()));
          })();
        }(a10, b10), watchEvent: (b10) => function(a11, { address: b11, args: c10, batch: d10 = true, event: e2, events: f2, fromBlock: g2, onError: h2, onLogs: i2, poll: j3, pollingInterval: k2 = a11.pollingInterval, strict: l2 }) {
          let m2, n2, o2 = void 0 !== j3 ? j3 : "bigint" == typeof g2 || "webSocket" !== a11.transport.type && "ipc" !== a11.transport.type && ("fallback" !== a11.transport.type || "webSocket" !== a11.transport.transports[0].config.type && "ipc" !== a11.transport.transports[0].config.type), p2 = l2 ?? false;
          return o2 ? eb((0, d0.A)(["watchEvent", b11, c10, d10, a11.uid, e2, k2, g2]), { onLogs: i2, onError: h2 }, (h3) => {
            let i3, j4;
            void 0 !== g2 && (i3 = g2 - 1n);
            let l3 = false, m3 = eg(async () => {
              if (!l3) {
                try {
                  j4 = await X(a11, be, "createEventFilter")({ address: b11, args: c10, event: e2, events: f2, strict: p2, fromBlock: g2 });
                } catch {
                }
                l3 = true;
                return;
              }
              try {
                let g3;
                if (j4) g3 = await X(a11, ci, "getFilterChanges")({ filter: j4 });
                else {
                  let d11 = await X(a11, b0, "getBlockNumber")({});
                  g3 = i3 && i3 !== d11 ? await X(a11, ca, "getLogs")({ address: b11, args: c10, event: e2, events: f2, fromBlock: i3 + 1n, toBlock: d11 }) : [], i3 = d11;
                }
                if (0 === g3.length) return;
                if (d10) h3.onLogs(g3);
                else for (let a12 of g3) h3.onLogs([a12]);
              } catch (a12) {
                j4 && a12 instanceof af && (l3 = false), h3.onError?.(a12);
              }
            }, { emitOnBegin: true, interval: k2 });
            return async () => {
              j4 && await X(a11, dC, "uninstallFilter")({ filter: j4 }), m3();
            };
          }) : (m2 = true, n2 = () => m2 = false, (async () => {
            try {
              let d11 = (() => {
                if ("fallback" === a11.transport.type) {
                  let b12 = a11.transport.transports.find((a12) => "webSocket" === a12.config.type || "ipc" === a12.config.type);
                  return b12 ? b12.value : a11.transport;
                }
                return a11.transport;
              })(), g3 = f2 ?? (e2 ? [e2] : void 0), j4 = [];
              g3 && (j4 = [g3.flatMap((a12) => bb({ abi: [a12], eventName: a12.name, args: c10 }))], e2 && (j4 = j4[0]));
              let { unsubscribe: k3 } = await d11.subscribe({ params: ["logs", { address: b11, topics: j4 }], onData(a12) {
                if (!m2) return;
                let b12 = a12.result;
                try {
                  let { eventName: a13, args: c11 } = b8({ abi: g3 ?? [], data: b12.data, topics: b12.topics, strict: p2 }), d12 = b4(b12, { args: c11, eventName: a13 });
                  i2([d12]);
                } catch (e3) {
                  let a13, c11;
                  if (e3 instanceof Y2.fo || e3 instanceof Y2.l3) {
                    if (l2) return;
                    a13 = e3.abiItem.name, c11 = e3.abiItem.inputs?.some((a14) => !("name" in a14 && a14.name));
                  }
                  let d12 = b4(b12, { args: c11 ? [] : {}, eventName: a13 });
                  i2([d12]);
                }
              }, onError(a12) {
                h2?.(a12);
              } });
              n2 = k3, m2 || n2();
            } catch (a12) {
              h2?.(a12);
            }
          })(), () => n2());
        }(a10, b10), watchPendingTransactions: (b10) => function(a11, { batch: b11 = true, onError: c10, onTransactions: d10, poll: e2, pollingInterval: f2 = a11.pollingInterval }) {
          let g2, h2;
          return (void 0 !== e2 ? e2 : "webSocket" !== a11.transport.type && "ipc" !== a11.transport.type) ? eb((0, d0.A)(["watchPendingTransactions", a11.uid, b11, f2]), { onTransactions: d10, onError: c10 }, (c11) => {
            let d11, e3 = eg(async () => {
              try {
                if (!d11) try {
                  d11 = await X(a11, bf, "createPendingTransactionFilter")({});
                  return;
                } catch (a12) {
                  throw e3(), a12;
                }
                let f3 = await X(a11, ci, "getFilterChanges")({ filter: d11 });
                if (0 === f3.length) return;
                if (b11) c11.onTransactions(f3);
                else for (let a12 of f3) c11.onTransactions([a12]);
              } catch (a12) {
                c11.onError?.(a12);
              }
            }, { emitOnBegin: true, interval: f2 });
            return async () => {
              d11 && await X(a11, dC, "uninstallFilter")({ filter: d11 }), e3();
            };
          }) : (g2 = true, h2 = () => g2 = false, (async () => {
            try {
              let { unsubscribe: b12 } = await a11.transport.subscribe({ params: ["newPendingTransactions"], onData(a12) {
                if (!g2) return;
                let b13 = a12.result;
                d10([b13]);
              }, onError(a12) {
                c10?.(a12);
              } });
              h2 = b12, g2 || h2();
            } catch (a12) {
              c10?.(a12);
            }
          })(), () => h2());
        }(a10, b10) };
      }
      class ep extends M.C {
        constructor() {
          super("No URL was provided to the Transport. Please provide a valid RPC URL to the Transport.", { docsPath: "/docs/clients/intro", name: "UrlRequiredError" });
        }
      }
      var eq = c(4932);
      let er = { current: 0, take() {
        return this.current++;
      }, reset() {
        this.current = 0;
      } }, es = new bO.A(8192), et = 0, eu = /* @__PURE__ */ new WeakMap(), ev = "edge", ew = process.env.CIRCLE_API_KEY || "", ex = process.env.ARC_RPC_URL || "https://rpc.testnet.arc.network", ey = "0x8004A818BFB912233c491871b3d84c89A494BD9e", ez = "0x8004B663056A597Dffe9eCcC1965A193B7388713", eA = "0x8004Cb1BF31DAf7788923b405b754f57acEB4272", eB = "ARC-TESTNET", eC = process.env.ERC8004_AGENT_ID || "", eD = process.env.ERC8004_VALIDATOR_WALLET_ID || "";
      async function eE(a10, b10, c10) {
        let d10 = await fetch(`https://api.circle.com/v1/w3s${b10}`, { method: a10, headers: { "Content-Type": "application/json", Authorization: `Bearer ${ew}` }, body: c10 ? JSON.stringify(c10) : void 0 }), e2 = await d10.json();
        if (!d10.ok) throw Error(e2.message || `Circle API error: ${d10.status}`);
        return e2;
      }
      let eF = function(a10) {
        let { key: b10 = "public", name: c10 = "Public Client" } = a10;
        return function(a11) {
          let { batch: b11, chain: c11, ccipRead: d10, dataSuffix: e2, key: f2 = "base", name: g2 = "Base Client", type: h2 = "base" } = a11, i2 = a11.experimental_blockTag ?? ("number" == typeof c11?.experimental_preconfirmationTime ? "pending" : void 0), j3 = Math.min(Math.max(Math.floor((c11?.blockTime ?? 12e3) / 2), 500), 4e3), k2 = a11.pollingInterval ?? j3, l2 = a11.cacheTime ?? k2, m2 = a11.account ? (0, B2.J)(a11.account) : void 0, { config: n2, request: o2, value: p2 } = a11.transport({ account: m2, chain: c11, pollingInterval: k2 }), q3 = { account: m2, batch: b11, cacheTime: l2, ccipRead: d10, chain: c11, dataSuffix: e2, key: f2, name: g2, pollingInterval: k2, request: o2, transport: { ...n2, ...p2 }, type: h2, uid: D2(), ...i2 ? { experimental_blockTag: i2 } : {} };
          return Object.assign(q3, { extend: /* @__PURE__ */ function a12(b12) {
            return (c12) => {
              let d11 = c12(b12);
              for (let a13 in q3) delete d11[a13];
              let e3 = { ...b12, ...d11 };
              return Object.assign(e3, { extend: a12(e3) });
            };
          }(q3) });
        }({ ...a10, key: b10, name: c10, type: "publicClient" }).extend(eo);
      }({ chain: { id: 5042002, name: "Arc Testnet", nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 }, rpcUrls: { default: { http: [ex] } }, testnet: true }, transport: function(a10, b10 = {}) {
        let { batch: c10, fetchFn: d10, fetchOptions: e2, key: f2 = "http", methods: g2, name: h2 = "HTTP JSON-RPC", onFetchRequest: i2, onFetchResponse: j3, retryDelay: k2, raw: l2 } = b10;
        return ({ chain: a11, retryCount: m2, timeout: n2 }) => {
          let { batchSize: o2 = 1e3, wait: p2 = 0 } = "object" == typeof c10 ? c10 : {}, q3 = b10.retryCount ?? m2, r2 = n2 ?? b10.timeout ?? 1e4, s2 = a11?.rpcUrls.default.http[0];
          if (!s2) throw new ep();
          let t2 = function(a12, b11 = {}) {
            let { url: c11, headers: d11 } = function(a13) {
              try {
                let b12 = new URL(a13), c12 = (() => {
                  if (b12.username) {
                    let a14 = `${decodeURIComponent(b12.username)}:${decodeURIComponent(b12.password)}`;
                    return b12.username = "", b12.password = "", { url: b12.toString(), headers: { Authorization: `Basic ${btoa(a14)}` } };
                  }
                })();
                return { url: b12.toString(), ...c12 };
              } catch {
                return { url: a13 };
              }
            }(a12);
            return { async request(a13) {
              let { body: e3, fetchFn: f3 = b11.fetchFn ?? fetch, onRequest: g3 = b11.onRequest, onResponse: h3 = b11.onResponse, timeout: i3 = b11.timeout ?? 1e4 } = a13, j4 = { ...b11.fetchOptions ?? {}, ...a13.fetchOptions ?? {} }, { headers: k3, method: l3, signal: m3 } = j4;
              try {
                let a14, b12 = await function(a15, { errorInstance: b13 = Error("timed out"), timeout: c12, signal: d12 }) {
                  return new Promise((e4, f4) => {
                    (async () => {
                      let g4, h4 = new AbortController();
                      try {
                        c12 > 0 && (g4 = setTimeout(() => {
                          d12 ? h4.abort() : f4(b13);
                        }, c12)), e4(await a15({ signal: h4?.signal || null }));
                      } catch (a16) {
                        if (h4?.signal.aborted && (0, ed.zf)(a16)) return void f4(b13);
                        f4(a16);
                      } finally {
                        clearTimeout(g4);
                      }
                    })();
                  });
                }(async ({ signal: a15 }) => {
                  let b13 = { ...j4, body: Array.isArray(e3) ? (0, d0.A)(e3.map((a16) => ({ jsonrpc: "2.0", id: a16.id ?? er.take(), ...a16 }))) : (0, d0.A)({ jsonrpc: "2.0", id: e3.id ?? er.take(), ...e3 }), headers: { ...d11, "Content-Type": "application/json", ...k3 }, method: l3 || "POST", signal: m3 || (i3 > 0 ? a15 : null) }, h4 = new Request(c11, b13), n3 = await g3?.(h4, b13) ?? { ...b13, url: c11 };
                  return await f3(n3.url ?? c11, n3);
                }, { errorInstance: new Z.MU({ body: e3, url: c11 }), timeout: i3, signal: true });
                if (h3 && await h3(b12), b12.headers.get("Content-Type")?.startsWith("application/json")) a14 = await b12.json();
                else {
                  a14 = await b12.text();
                  try {
                    a14 = JSON.parse(a14 || "{}");
                  } catch (c12) {
                    if (b12.ok) throw c12;
                    a14 = { error: a14 };
                  }
                }
                if (!b12.ok) {
                  if ("number" == typeof a14.error?.code && "string" == typeof a14.error?.message) return a14;
                  throw new Z.Ci({ body: e3, details: (0, d0.A)(a14.error) || b12.statusText, headers: b12.headers, status: b12.status, url: c11 });
                }
                return a14;
              } catch (a14) {
                if (m3?.aborted) throw (0, ed.TY)(m3);
                if ((0, ed.zf)(a14) || a14 instanceof Z.Ci || a14 instanceof Z.MU) throw a14;
                throw new Z.Ci({ body: e3, cause: a14, url: c11 });
              }
            } };
          }(s2, { fetchFn: d10, fetchOptions: e2, onRequest: i2, onResponse: j3, timeout: r2 });
          return function({ key: a12, methods: b11, name: c11, request: d11, retryCount: e3 = 3, retryDelay: f3 = 150, timeout: g3, type: h3 }, i3) {
            return { config: { key: a12, methods: b11, name: c11, request: d11, retryCount: e3, retryDelay: f3, timeout: g3, type: h3 }, request: /* @__PURE__ */ function(a13, b12 = {}) {
              return async (c12, d12 = {}) => {
                let { dedupe: e4 = false, methods: f4, retryDelay: g4 = 150, retryCount: h4 = 3, signal: i4, uid: j4 } = { ...b12, ...d12 }, { method: k3 } = c12;
                if (f4?.exclude?.includes(k3) || f4?.include && !f4.include.includes(k3)) throw new aj(Error("method not supported"), { method: k3 });
                if (i4?.aborted) throw (0, ed.TY)(i4);
                let l3 = e4 ? function(a14, b13 = 0) {
                  let c13 = 3735928559 ^ b13, d13 = 1103547991 ^ b13;
                  for (let b14 = 0; b14 < a14.length; b14++) {
                    let e5 = a14.charCodeAt(b14);
                    c13 = Math.imul(c13 ^ e5, 2654435761), d13 = Math.imul(d13 ^ e5, 1597334677);
                  }
                  return c13 = Math.imul(c13 ^ c13 >>> 16, 2246822507) ^ Math.imul(d13 ^ d13 >>> 16, 3266489909), (4294967296 * (2097151 & (d13 = Math.imul(d13 ^ d13 >>> 16, 2246822507) ^ Math.imul(c13 ^ c13 >>> 16, 3266489909))) + (c13 >>> 0)).toString(36);
                }(`${j4}.${(0, d0.A)(c12)}`) : void 0;
                return function(a14, { enabled: b13 = true, id: c13 }) {
                  if (!b13 || !c13) return a14();
                  if (es.get(c13)) return es.get(c13);
                  let d13 = a14().finally(() => es.delete(c13));
                  return es.set(c13, d13), d13;
                }(() => ef(async () => {
                  try {
                    return await a13(c12, i4 ? { signal: i4 } : void 0);
                  } catch (a14) {
                    if (i4?.aborted) throw (0, ed.TY)(i4);
                    if ((0, ed.zf)(a14)) throw a14;
                    switch (a14.code) {
                      case aa.code:
                        throw new aa(a14);
                      case ab.code:
                        throw new ab(a14);
                      case ac.code:
                        throw new ac(a14, { method: c12.method });
                      case ad.code:
                        throw new ad(a14);
                      case ae2.code:
                        throw new ae2(a14);
                      case af.code:
                        throw new af(a14);
                      case ag.code:
                        throw new ag(a14);
                      case ah.code:
                        throw new ah(a14);
                      case ai.code:
                        throw new ai(a14);
                      case aj.code:
                        throw new aj(a14, { method: c12.method });
                      case ak.code:
                        throw new ak(a14);
                      case al.code:
                        throw new al(a14);
                      case am.code:
                        throw new am(a14);
                      case an.code:
                        throw new an(a14);
                      case ao.code:
                        throw new ao(a14);
                      case ap.code:
                        throw new ap(a14);
                      case aq.code:
                        throw new aq(a14);
                      case ar.code:
                        throw new ar(a14);
                      case as.code:
                        throw new as(a14);
                      case at.code:
                        throw new at(a14);
                      case au.code:
                        throw new au(a14);
                      case av.code:
                        throw new av(a14);
                      case aw.code:
                        throw new aw(a14);
                      case ax.code:
                        throw new ax(a14);
                      case ay.code:
                        throw new ay(a14);
                      case 5e3:
                        throw new am(a14);
                      case az.code:
                        throw new az(a14);
                      default:
                        if (a14 instanceof M.C) throw a14;
                        throw new aA(a14);
                    }
                  }
                }, { delay: ({ count: a14, error: b13 }) => {
                  if (b13 && b13 instanceof Z.Ci) {
                    let a15 = b13?.headers?.get("Retry-After");
                    if (a15?.match(/\d/)) return 1e3 * Number.parseInt(a15, 10);
                  }
                  return ~~(1 << a14) * g4;
                }, retryCount: h4, signal: i4, shouldRetry: ({ error: a14 }) => {
                  var b13;
                  return b13 = a14, !(0, ed.zf)(b13) && ("code" in b13 && "number" == typeof b13.code ? -1 === b13.code || b13.code === ak.code || b13.code === ae2.code || 429 === b13.code : !(b13 instanceof Z.Ci) || !b13.status || 403 === b13.status || 408 === b13.status || 413 === b13.status || 429 === b13.status || 500 === b13.status || 502 === b13.status || 503 === b13.status || 504 === b13.status || false);
                } }), { enabled: e4, id: l3 });
              };
            }(d11, { methods: b11, retryCount: e3, retryDelay: f3, uid: D2() }), value: i3 };
          }({ key: f2, methods: g2, name: h2, async request({ method: a12, params: b11 }, d11) {
            let e3 = { method: a12, params: b11 }, f3 = d11?.signal ? { signal: d11.signal } : void 0, { schedule: g3 } = (0, eq.u)({ id: `${s2}.${function(a13) {
              if (!a13) return "default";
              let b12 = eu.get(a13);
              if (void 0 !== b12) return b12;
              let c11 = et++;
              return eu.set(a13, c11), c11;
            }(d11?.signal)}`, wait: p2, shouldSplitBatch: (a13) => a13.length > o2, fn: (a13) => t2.request({ body: a13, fetchOptions: f3 }), sort: (a13, b12) => a13.id - b12.id }), h3 = async (a13) => c10 ? g3(a13) : [await t2.request({ body: a13, fetchOptions: f3 })], [{ error: i3, result: j4 }] = await h3(e3);
            if (l2) return { error: i3, result: j4 };
            if (i3) throw new Z.J8({ body: e3, error: i3, url: s2 });
            return j4;
          }, retryCount: q3, retryDelay: k2, timeout: r2, type: "http" }, { fetchOptions: e2, url: s2 });
        };
      }() });
      async function eG(a10, b10 = 12e4) {
        let c10 = Date.now();
        for (; Date.now() - c10 < b10; ) {
          let b11 = await eE("GET", `/transactions/${a10}`), c11 = b11.data?.transaction, d10 = c11?.state;
          if ("COMPLETE" === d10) return { txHash: c11.txHash, state: "COMPLETE" };
          if ("FAILED" === d10) return { state: "FAILED", error: c11?.reason || "Onchain failure" };
          await new Promise((a11) => setTimeout(a11, 2e3));
        }
        return { state: "TIMEOUT" };
      }
      async function eH(a10, b10, c10, d10, e2) {
        let f2 = (await eE("POST", "/developer/transactions/contractExecution", { walletId: a10, contractAddress: b10, abiFunctionSignature: c10, abiParameters: d10, fee: { type: "level", config: { feeLevel: "MEDIUM" } }, idempotencyKey: crypto.randomUUID() })).data, g2 = f2?.id;
        if (!g2) throw Error(`No txId returned for ${e2}`);
        let h2 = await eG(g2);
        if ("COMPLETE" !== h2.state) throw Error(`${e2} failed: ${h2.error || h2.state}`);
        return { txId: g2, txHash: h2.txHash };
      }
      let eI = [{ name: "getValidationStatus", type: "function", stateMutability: "view", inputs: [{ name: "requestHash", type: "bytes32" }], outputs: [{ name: "validatorAddress", type: "address" }, { name: "agentId", type: "uint256" }, { name: "response", type: "uint8" }, { name: "responseHash", type: "bytes32" }, { name: "tag", type: "string" }, { name: "lastUpdate", type: "uint256" }] }];
      async function eJ(a10) {
        try {
          let { action: b10, ...c10 } = await a10.json();
          switch (b10) {
            case "createWallets": {
              let a11 = await eE("POST", "/developer/walletSets", { name: c10.walletSetName || "ERC8004 Agent Wallets", idempotencyKey: crypto.randomUUID() }), b11 = a11.data?.walletSet?.id;
              if (!b11) return A.Rp.json({ error: "No walletSetId returned" }, { status: 500 });
              let d10 = await eE("POST", "/developer/wallets", { walletSetId: b11, blockchains: [eB], count: 2, accountType: "SCA", idempotencyKey: crypto.randomUUID() }), e2 = d10.data?.wallets;
              if (!e2?.length) return A.Rp.json({ error: "No wallets returned" }, { status: 500 });
              return A.Rp.json({ walletSetId: b11, ownerWallet: e2[0], validatorWallet: e2[1] });
            }
            case "getWallet": {
              let { walletId: a11 } = c10;
              if (!a11) return A.Rp.json({ error: "walletId required" }, { status: 400 });
              let b11 = await eE("GET", `/wallets/${a11}`);
              return A.Rp.json(b11.data);
            }
            case "registerAgent": {
              let { walletId: a11, metadataURI: b11 } = c10;
              if (!a11) return A.Rp.json({ error: "walletId required" }, { status: 400 });
              let d10 = await eH(a11, ey, "register(string)", [b11 || "ipfs://bafkreifbjevvqojxsrry7a24em6r3qoncnihhu2ztccju2ubwnmhe2wn7q"], "agent registration");
              return A.Rp.json(d10);
            }
            case "getAgentId": {
              let { walletAddress: a11 } = c10;
              if (!a11) return A.Rp.json({ error: "walletAddress required" }, { status: 400 });
              let b11 = await eF.getBlockNumber(), d10 = await eF.getLogs({ address: ey, event: cz("event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"), args: { to: a11 }, fromBlock: b11 > 10000n ? b11 - 10000n : 0n, toBlock: b11 });
              if (0 === d10.length) return A.Rp.json({ error: "No agent found for this wallet address" }, { status: 404 });
              let e2 = d10[d10.length - 1].args.tokenId, f2 = { address: ey, abi: [{ name: "ownerOf", type: "function", stateMutability: "view", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ name: "", type: "address" }] }, { name: "tokenURI", type: "function", stateMutability: "view", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ name: "", type: "string" }] }], client: eF }, g2 = await eF.readContract({ ...f2, functionName: "ownerOf", args: [e2] }), h2 = await eF.readContract({ ...f2, functionName: "tokenURI", args: [e2] });
              return A.Rp.json({ agentId: e2.toString(), owner: g2, metadataURI: h2 });
            }
            case "recordReputation": {
              let { walletId: a11, agentId: b11, score: d10, tag: e2 } = c10;
              if (!a11 || !b11) return A.Rp.json({ error: "walletId and agentId required" }, { status: 400 });
              let f2 = e2 || "execution", g2 = (0, S.S)((0, L2.nj)(f2)), h2 = await eH(a11, ez, "giveFeedback(uint256,int128,uint8,string,string,string,string,bytes32)", [String(b11), String(d10 ?? 100), "0", f2, f2, "", "", g2], "reputation recording");
              return A.Rp.json({ ...h2, tag: f2, score: d10 });
            }
            case "batchRecordReputation": {
              let { walletId: a11, records: b11 } = c10;
              if (!a11 || !Array.isArray(b11) || 0 === b11.length) return A.Rp.json({ error: "walletId and records[] required" }, { status: 400 });
              let d10 = [];
              for (let c11 of b11) {
                let b12 = c11.tag || "execution", e2 = (0, S.S)((0, L2.nj)(b12)), f2 = await eH(a11, ez, "giveFeedback(uint256,int128,uint8,string,string,string,string,bytes32)", [String(c11.agentId), String(c11.score ?? 100), "0", b12, "", "", "", e2], `reputation for agent ${c11.agentId}`);
                d10.push({ ...f2, agentId: c11.agentId, tag: b12, score: c11.score });
              }
              return A.Rp.json({ count: d10.length, results: d10 });
            }
            case "getAgentReputation": {
              let { agentId: a11 } = c10;
              if (!a11) return A.Rp.json({ error: "agentId required" }, { status: 400 });
              let b11 = await eF.getBlockNumber(), d10 = (await eF.getLogs({ address: ez, event: cz("event NewFeedback(uint256 indexed agentId, address indexed clientAddress, uint64 feedbackIndex, int128 value, uint8 valueDecimals, string indexed indexedTag1, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash)"), args: { agentId: BigInt(a11) }, fromBlock: b11 > 10000n ? b11 - 10000n : 0n, toBlock: b11 })).map((a12) => ({ agentId: a12.args.agentId?.toString(), validator: a12.args.clientAddress, score: a12.args.value?.toString(), tag: a12.args.tag1, txHash: a12.transactionHash })), e2 = d10.length, f2 = d10.reduce((a12, b12) => a12 + parseInt(b12.score || "0"), 0), g2 = e2 > 0 ? Math.round(f2 / e2) : 0;
              return A.Rp.json({ agentId: a11, totalReviews: e2, averageScore: g2, reviews: d10 });
            }
            case "requestValidation": {
              let { walletId: a11, agentId: b11, validatorWalletAddress: d10 } = c10;
              if (!a11 || !b11 || !d10) return A.Rp.json({ error: "walletId, agentId, and validatorWalletAddress required" }, { status: 400 });
              let e2 = c10.requestURI || "ipfs://bafkreiexamplevalidationrequest", f2 = (0, S.S)((0, L2.nj)(`validation_request_agent_${b11}_${Date.now()}`)), g2 = await eH(a11, eA, "validationRequest(address,uint256,string,bytes32)", [d10, String(b11), e2, f2], "validation request");
              return A.Rp.json({ ...g2, requestHash: f2 });
            }
            case "submitValidation": {
              let { walletId: a11, requestHash: b11, response: d10, tag: e2 } = c10;
              if (!a11 || !b11) return A.Rp.json({ error: "walletId and requestHash required" }, { status: 400 });
              let f2 = String(d10 ?? "100"), g2 = e2 || "execution_verified", h2 = `0x${"0".repeat(64)}`, i2 = await eH(a11, eA, "validationResponse(bytes32,uint8,string,bytes32,string)", [b11, f2, "", h2, g2], "validation response");
              return A.Rp.json({ ...i2, response: f2, tag: g2 });
            }
            case "getValidationStatus": {
              let { requestHash: a11 } = c10;
              if (!a11) return A.Rp.json({ error: "requestHash required" }, { status: 400 });
              let b11 = await eF.readContract({ address: eA, abi: eI, functionName: "getValidationStatus", args: [a11] });
              return A.Rp.json({ validatorAddress: b11[0], agentId: b11[1].toString(), response: b11[2], responseHash: b11[3], tag: b11[4], lastUpdate: b11[5].toString() });
            }
            case "recordExecutionResult": {
              let { steps: a11 } = c10;
              if (!Array.isArray(a11) || 0 === a11.length) return A.Rp.json({ error: "steps[] required" }, { status: 400 });
              if (!eC || !eD) return A.Rp.json({ skipped: true, note: "ERC8004_AGENT_ID and ERC8004_VALIDATOR_WALLET_ID not configured" });
              let b11 = a11.map((a12) => ({ agentId: eC, score: 100 * !!a12.success, tag: a12.tag || "execution" })), d10 = [];
              for (let a12 of b11) {
                let b12 = a12.tag, c11 = (0, S.S)((0, L2.nj)(b12)), e3 = await eH(eD, ez, "giveFeedback(uint256,int128,uint8,string,string,string,string,bytes32)", [String(a12.agentId), String(a12.score), "0", b12, "", "", "", c11], `reputation for step ${b12}`);
                d10.push({ ...e3, score: a12.score, tag: b12 });
              }
              let e2 = b11.reduce((a12, b12) => a12 + b12.score, 0) / b11.length;
              return A.Rp.json({ count: d10.length, averageScore: e2, results: d10 });
            }
            case "setupReputation": {
              let a11 = await eE("POST", "/developer/walletSets", { name: "ERC8004 Agent + Validator", idempotencyKey: crypto.randomUUID() }), b11 = a11.data?.walletSet?.id;
              if (!b11) return A.Rp.json({ error: "No walletSetId returned" }, { status: 500 });
              let c11 = await eE("POST", "/developer/wallets", { walletSetId: b11, blockchains: [eB], count: 2, accountType: "SCA", idempotencyKey: crypto.randomUUID() }), d10 = c11.data?.wallets;
              if (!d10?.length) return A.Rp.json({ error: "No wallets returned" }, { status: 500 });
              let e2 = d10[0], f2 = d10[1], g2 = await eH(e2.id, ey, "register(string)", ["ipfs://bafkreibdi6623n3xpf7ymk62ckb4bo75o3qemwkpfvp5i25j66itxvsoei"], "agent registration"), h2 = await eF.getBlockNumber(), i2 = await eF.getLogs({ address: ey, event: cz("event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"), args: { to: e2.address }, fromBlock: h2 > 10000n ? h2 - 10000n : 0n, toBlock: h2 }), j3 = i2.length > 0 ? i2[i2.length - 1].args.tokenId.toString() : "unknown (check explorer)";
              return A.Rp.json({ walletSetId: b11, ownerWalletId: e2.id, validatorWalletId: f2.id, agentId: j3, txHash: g2.txHash, envConfig: `ERC8004_AGENT_ID=${j3}
ERC8004_VALIDATOR_WALLET_ID=${f2.id}` });
            }
            case "debugEnv": {
              let a11 = null;
              try {
                let b11 = await eE("GET", "/config/entity/publicKey");
                a11 = b11.data?.publicKey?.substring(0, 30);
              } catch {
                a11 = null;
              }
              return A.Rp.json({ apiKey: (ew || "").substring(0, 30) + "...", publicKey: a11 });
            }
            default:
              return A.Rp.json({ error: "Unknown action" }, { status: 400 });
          }
        } catch (b10) {
          let a11 = b10 instanceof Error ? b10.message : String(b10);
          return A.Rp.json({ error: a11 }, { status: 500 });
        }
      }
      var eK = c(5356).Buffer;
      let eL = new k.AppRouteRouteModule({ definition: { kind: l.A.APP_ROUTE, page: "/api/erc8004/route", pathname: "/api/erc8004", filename: "route", bundlePath: "app/api/erc8004/route" }, distDir: process.env.__NEXT_RELATIVE_DIST_DIR || "", relativeProjectDir: process.env.__NEXT_RELATIVE_PROJECT_DIR || "", resolvedPagePath: "/Users/thefirstelder/Documents/aurum_unit/frontend/app/api/erc8004/route.ts", nextConfigOutput: "standalone", userland: f }), { workAsyncStorage: eM, workUnitAsyncStorage: eN, serverHooks: eO } = eL;
      function eP() {
        return (0, m.V5)({ workAsyncStorage: eM, workUnitAsyncStorage: eN });
      }
      async function eQ(a10, b10, c10) {
        var d10;
        let e2 = "/api/erc8004/route";
        "/index" === e2 && (e2 = "/");
        let f2 = await eL.prepare(a10, b10, { srcPage: e2, multiZoneDraftMode: false });
        if (!f2) return b10.statusCode = 400, b10.end("Bad Request"), null == c10.waitUntil || c10.waitUntil.call(c10, Promise.resolve()), null;
        let { buildId: g2, params: h2, nextConfig: i2, isDraftMode: j3, prerenderManifest: k2, routerServerContext: m2, isOnDemandRevalidate: A2, revalidateOnlyGenerated: B3, resolvedPathname: C3 } = f2, D3 = (0, p.Y)(e2), E2 = !!(k2.dynamicRoutes[D3] || k2.routes[C3]);
        if (E2 && !j3) {
          let a11 = !!k2.routes[C3], b11 = k2.dynamicRoutes[D3];
          if (b11 && false === b11.fallback && !a11) throw new y.G();
        }
        let F3 = null;
        !E2 || eL.isDev || j3 || (F3 = "/index" === (F3 = C3) ? "/" : F3);
        let G3 = true === eL.isDev || !E2, H2 = E2 && !G3, I3 = a10.method || "GET", J3 = (0, o.EK)(), K3 = J3.getActiveScopeSpan(), L3 = { params: h2, prerenderManifest: k2, renderOpts: { experimental: { cacheComponents: !!i2.experimental.cacheComponents, authInterrupts: !!i2.experimental.authInterrupts }, supportsDynamicResponse: G3, incrementalCache: (0, n.Ny)(a10, "incrementalCache"), cacheLifeProfiles: null == (d10 = i2.experimental) ? void 0 : d10.cacheLife, isRevalidate: H2, waitUntil: c10.waitUntil, onClose: (a11) => {
          b10.on("close", a11);
        }, onAfterTaskError: void 0, onInstrumentationRequestError: (b11, c11, d11) => eL.onRequestError(a10, b11, d11, m2) }, sharedContext: { buildId: g2 } }, M2 = new q2.j(a10), N2 = new q2.p(b10), O3 = r.u_.fromNodeNextRequest(M2, (0, r.SN)(b10));
        try {
          let d11 = async (c11) => eL.handle(O3, L3).finally(() => {
            if (!c11) return;
            c11.setAttributes({ "http.status_code": b10.statusCode, "next.rsc": false });
            let d12 = J3.getRootSpanAttributes();
            if (!d12) return;
            if (d12.get("next.span_type") !== s.Li.handleRequest) return void console.warn(`Unexpected root span type '${d12.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);
            let e3 = d12.get("next.route");
            if (e3) {
              let a11 = `${I3} ${e3}`;
              c11.setAttributes({ "next.route": e3, "http.route": e3, "next.span_name": a11 }), c11.updateName(a11);
            } else c11.updateName(`${I3} ${a10.url}`);
          }), f3 = async (f4) => {
            var g3, h3;
            let o2 = async ({ previousCacheEntry: g4 }) => {
              try {
                if (!(0, n.Ny)(a10, "minimalMode") && A2 && B3 && !g4) return b10.statusCode = 404, b10.setHeader("x-nextjs-cache", "REVALIDATED"), b10.end("This page could not be found"), null;
                let e3 = await d11(f4);
                a10.fetchMetrics = L3.renderOpts.fetchMetrics;
                let h4 = L3.renderOpts.pendingWaitUntil;
                h4 && c10.waitUntil && (c10.waitUntil(h4), h4 = void 0);
                let i3 = L3.renderOpts.collectedTags;
                if (!E2) return await (0, u.I)(M2, N2, e3, L3.renderOpts.pendingWaitUntil), null;
                {
                  let a11 = await e3.blob(), b11 = (0, v2.Cu)(e3.headers);
                  i3 && (b11[x2.VC] = i3), !b11["content-type"] && a11.type && (b11["content-type"] = a11.type);
                  let c11 = void 0 !== L3.renderOpts.collectedRevalidate && !(L3.renderOpts.collectedRevalidate >= x2.AR) && L3.renderOpts.collectedRevalidate, d12 = void 0 === L3.renderOpts.collectedExpire || L3.renderOpts.collectedExpire >= x2.AR ? void 0 : L3.renderOpts.collectedExpire;
                  return { value: { kind: z2.yD.APP_ROUTE, status: e3.status, body: eK.from(await a11.arrayBuffer()), headers: b11 }, cacheControl: { revalidate: c11, expire: d12 } };
                }
              } catch (b11) {
                throw (null == g4 ? void 0 : g4.isStale) && await eL.onRequestError(a10, b11, { routerKind: "App Router", routePath: e2, routeType: "route", revalidateReason: (0, t.c)({ isRevalidate: H2, isOnDemandRevalidate: A2 }) }, m2), b11;
              }
            }, p2 = await eL.handleResponse({ req: a10, nextConfig: i2, cacheKey: F3, routeKind: l.A.APP_ROUTE, isFallback: false, prerenderManifest: k2, isRoutePPREnabled: false, isOnDemandRevalidate: A2, revalidateOnlyGenerated: B3, responseGenerator: o2, waitUntil: c10.waitUntil });
            if (!E2) return null;
            if ((null == p2 || null == (g3 = p2.value) ? void 0 : g3.kind) !== z2.yD.APP_ROUTE) throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null == p2 || null == (h3 = p2.value) ? void 0 : h3.kind}`), "__NEXT_ERROR_CODE", { value: "E701", enumerable: false, configurable: true });
            (0, n.Ny)(a10, "minimalMode") || b10.setHeader("x-nextjs-cache", A2 ? "REVALIDATED" : p2.isMiss ? "MISS" : p2.isStale ? "STALE" : "HIT"), j3 && b10.setHeader("Cache-Control", "private, no-cache, no-store, max-age=0, must-revalidate");
            let q3 = (0, v2.p$)(p2.value.headers);
            return (0, n.Ny)(a10, "minimalMode") && E2 || q3.delete(x2.VC), !p2.cacheControl || b10.getHeader("Cache-Control") || q3.get("Cache-Control") || q3.set("Cache-Control", (0, w2.B)(p2.cacheControl)), await (0, u.I)(M2, N2, new Response(p2.value.body, { headers: q3, status: p2.value.status || 200 })), null;
          };
          K3 ? await f3(K3) : await J3.withPropagatedContext(a10.headers, () => J3.trace(s.Li.handleRequest, { spanName: `${I3} ${a10.url}`, kind: o.v8.SERVER, attributes: { "http.method": I3, "http.target": a10.url } }, f3));
        } catch (b11) {
          if (b11 instanceof y.G || await eL.onRequestError(a10, b11, { routerKind: "App Router", routePath: D3, routeType: "route", revalidateReason: (0, t.c)({ isRevalidate: H2, isOnDemandRevalidate: A2 }) }), E2) throw b11;
          return await (0, u.I)(M2, N2, new Response(null, { status: 500 })), null;
        }
      }
      let eR = null == (e = self.__RSC_MANIFEST) ? void 0 : e["/api/erc8004/route"], eS = ((a10) => a10 ? JSON.parse(a10) : void 0)(self.__RSC_SERVER_MANIFEST);
      eR && eS && (0, i.fQ)({ page: "/api/erc8004/route", clientReferenceManifest: eR, serverActionsManifest: eS, serverModuleMap: (0, h.e)({ serverActionsManifest: eS }) });
      let eT = g, eU = j2.s.wrap(eL, { nextConfig: { env: {}, eslint: { ignoreDuringBuilds: false }, typescript: { ignoreBuildErrors: false, tsconfigPath: "tsconfig.json" }, typedRoutes: false, distDir: ".next", cleanDistDir: true, assetPrefix: "", cacheMaxMemorySize: 52428800, configOrigin: "next.config.ts", useFileSystemPublicRoutes: true, generateEtags: true, pageExtensions: ["tsx", "ts", "jsx", "js"], poweredByHeader: true, compress: true, images: { deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], path: "/_next/image", loader: "default", loaderFile: "", domains: [], disableStaticImages: false, minimumCacheTTL: 60, formats: ["image/avif", "image/webp"], maximumResponseBody: 5e7, dangerouslyAllowSVG: false, contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;", contentDispositionType: "attachment", remotePatterns: [], unoptimized: false }, devIndicators: { position: "bottom-left" }, onDemandEntries: { maxInactiveAge: 6e4, pagesBufferLength: 5 }, amp: { canonicalBase: "" }, basePath: "", sassOptions: {}, trailingSlash: false, i18n: null, productionBrowserSourceMaps: false, excludeDefaultMomentLocales: true, serverRuntimeConfig: {}, publicRuntimeConfig: {}, reactProductionProfiling: false, reactStrictMode: true, reactMaxHeadersLength: 6e3, httpAgentOptions: { keepAlive: true }, logging: {}, compiler: {}, expireTime: 31536e3, staticPageGenerationTimeout: 60, output: "standalone", modularizeImports: { "@mui/icons-material": { transform: "@mui/icons-material/{{member}}" }, lodash: { transform: "lodash/{{member}}" } }, outputFileTracingRoot: "/Users/thefirstelder/Documents/aurum_unit/frontend", experimental: { useSkewCookie: false, cacheLife: { default: { stale: 300, revalidate: 900, expire: 4294967294 }, seconds: { stale: 30, revalidate: 1, expire: 60 }, minutes: { stale: 300, revalidate: 60, expire: 3600 }, hours: { stale: 300, revalidate: 3600, expire: 86400 }, days: { stale: 300, revalidate: 86400, expire: 604800 }, weeks: { stale: 300, revalidate: 604800, expire: 2592e3 }, max: { stale: 300, revalidate: 2592e3, expire: 4294967294 } }, cacheHandlers: {}, cssChunking: true, multiZoneDraftMode: false, appNavFailHandling: false, prerenderEarlyExit: true, serverMinification: true, serverSourceMaps: false, linkNoTouchStart: false, caseSensitiveRoutes: false, clientSegmentCache: false, clientParamParsing: false, dynamicOnHover: false, preloadEntriesOnStart: true, clientRouterFilter: true, clientRouterFilterRedirects: false, fetchCacheKeyPrefix: "", middlewarePrefetch: "flexible", optimisticClientCache: true, manualClientBasePath: false, cpus: 11, memoryBasedWorkersCount: false, imgOptConcurrency: null, imgOptTimeoutInSeconds: 7, imgOptMaxInputPixels: 268402689, imgOptSequentialRead: null, imgOptSkipMetadata: null, isrFlushToDisk: true, workerThreads: false, optimizeCss: false, nextScriptWorkers: false, scrollRestoration: false, externalDir: false, disableOptimizedLoading: false, gzipSize: true, craCompat: false, esmExternals: true, fullySpecified: false, swcTraceProfiling: false, forceSwcTransforms: false, largePageDataBytes: 128e3, typedEnv: false, parallelServerCompiles: false, parallelServerBuildTraces: false, ppr: false, authInterrupts: false, webpackMemoryOptimizations: false, optimizeServerReact: true, viewTransition: false, routerBFCache: false, removeUncaughtErrorAndRejectionListeners: false, validateRSCRequestHeaders: false, staleTimes: { dynamic: 0, static: 300 }, serverComponentsHmrCache: true, staticGenerationMaxConcurrency: 8, staticGenerationMinPagesPerWorker: 25, cacheComponents: false, inlineCss: false, useCache: false, globalNotFound: false, devtoolSegmentExplorer: true, browserDebugInfoInTerminal: false, optimizeRouterScrolling: false, middlewareClientMaxBodySize: 10485760, optimizePackageImports: ["lucide-react", "recharts", "framer-motion", "@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-popover", "@radix-ui/react-tabs", "@radix-ui/react-tooltip", "date-fns", "lodash-es", "ramda", "antd", "react-bootstrap", "ahooks", "@ant-design/icons", "@headlessui/react", "@headlessui-float/react", "@heroicons/react/20/solid", "@heroicons/react/24/solid", "@heroicons/react/24/outline", "@visx/visx", "@tremor/react", "rxjs", "@mui/material", "@mui/icons-material", "react-use", "effect", "@effect/schema", "@effect/platform", "@effect/platform-node", "@effect/platform-browser", "@effect/platform-bun", "@effect/sql", "@effect/sql-mssql", "@effect/sql-mysql2", "@effect/sql-pg", "@effect/sql-sqlite-node", "@effect/sql-sqlite-bun", "@effect/sql-sqlite-wasm", "@effect/sql-sqlite-react-native", "@effect/rpc", "@effect/rpc-http", "@effect/typeclass", "@effect/experimental", "@effect/opentelemetry", "@material-ui/core", "@material-ui/icons", "@tabler/icons-react", "mui-core", "react-icons/ai", "react-icons/bi", "react-icons/bs", "react-icons/cg", "react-icons/ci", "react-icons/di", "react-icons/fa", "react-icons/fa6", "react-icons/fc", "react-icons/fi", "react-icons/gi", "react-icons/go", "react-icons/gr", "react-icons/hi", "react-icons/hi2", "react-icons/im", "react-icons/io", "react-icons/io5", "react-icons/lia", "react-icons/lib", "react-icons/lu", "react-icons/md", "react-icons/pi", "react-icons/ri", "react-icons/rx", "react-icons/si", "react-icons/sl", "react-icons/tb", "react-icons/tfi", "react-icons/ti", "react-icons/vsc", "react-icons/wi"] }, htmlLimitedBots: "[\\w-]+-Google|Google-[\\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight", bundlePagesRouterDependencies: false, configFile: "/Users/thefirstelder/Documents/aurum_unit/frontend/next.config.ts", configFileName: "next.config.ts", turbopack: { root: "/Users/thefirstelder/Documents/aurum_unit/frontend" } } });
    }, 6678: (a2, b2, c) => {
      "use strict";
      c.d(b2, { _o: () => r, Pj: () => p, uT: () => l, NV: () => q2 });
      var d = c(1871), e = c(3816), f = c(2696), g = c(279), h = c(3516);
      class i extends h.C {
        constructor({ current: a3, depth: b3 }) {
          super("Unbalanced parentheses.", { metaMessages: [`"${a3.trim()}" has too many ${b3 > 0 ? "opening" : "closing"} parentheses.`], details: `Depth "${b3}"` }), Object.defineProperty(this, "name", { enumerable: true, configurable: true, writable: true, value: "InvalidParenthesisError" });
        }
      }
      let j2 = /* @__PURE__ */ new Map([["address", { type: "address" }], ["bool", { type: "bool" }], ["bytes", { type: "bytes" }], ["bytes32", { type: "bytes32" }], ["int", { type: "int256" }], ["int256", { type: "int256" }], ["string", { type: "string" }], ["uint", { type: "uint256" }], ["uint8", { type: "uint8" }], ["uint16", { type: "uint16" }], ["uint24", { type: "uint24" }], ["uint32", { type: "uint32" }], ["uint64", { type: "uint64" }], ["uint96", { type: "uint96" }], ["uint112", { type: "uint112" }], ["uint160", { type: "uint160" }], ["uint192", { type: "uint192" }], ["uint256", { type: "uint256" }], ["address owner", { type: "address", name: "owner" }], ["address to", { type: "address", name: "to" }], ["bool approved", { type: "bool", name: "approved" }], ["bytes _data", { type: "bytes", name: "_data" }], ["bytes data", { type: "bytes", name: "data" }], ["bytes signature", { type: "bytes", name: "signature" }], ["bytes32 hash", { type: "bytes32", name: "hash" }], ["bytes32 r", { type: "bytes32", name: "r" }], ["bytes32 root", { type: "bytes32", name: "root" }], ["bytes32 s", { type: "bytes32", name: "s" }], ["string name", { type: "string", name: "name" }], ["string symbol", { type: "string", name: "symbol" }], ["string tokenURI", { type: "string", name: "tokenURI" }], ["uint tokenId", { type: "uint256", name: "tokenId" }], ["uint8 v", { type: "uint8", name: "v" }], ["uint256 balance", { type: "uint256", name: "balance" }], ["uint256 tokenId", { type: "uint256", name: "tokenId" }], ["uint256 value", { type: "uint256", name: "value" }], ["event:address indexed from", { type: "address", name: "from", indexed: true }], ["event:address indexed to", { type: "address", name: "to", indexed: true }], ["event:uint indexed tokenId", { type: "uint256", name: "tokenId", indexed: true }], ["event:uint256 indexed tokenId", { type: "uint256", name: "tokenId", indexed: true }]]);
      var k = c(8971);
      function l(a3, b3 = {}) {
        if ((0, k.Ji)(a3)) return function(a4, b4 = {}) {
          let c3 = (0, k.ej)(a4);
          if (!c3) throw new g.s7({ signature: a4, type: "function" });
          let d2 = q2(c3.parameters), e2 = [], f2 = d2.length;
          for (let a5 = 0; a5 < f2; a5++) e2.push(p(d2[a5], { modifiers: k.v7, structs: b4, type: "function" }));
          let h2 = [];
          if (c3.returns) {
            let a5 = q2(c3.returns), d3 = a5.length;
            for (let c4 = 0; c4 < d3; c4++) h2.push(p(a5[c4], { modifiers: k.v7, structs: b4, type: "function" }));
          }
          return { name: c3.name, type: "function", stateMutability: c3.stateMutability ?? "nonpayable", inputs: e2, outputs: h2 };
        }(a3, b3);
        if ((0, k.Rv)(a3)) return function(a4, b4 = {}) {
          let c3 = (0, k.iB)(a4);
          if (!c3) throw new g.s7({ signature: a4, type: "event" });
          let d2 = q2(c3.parameters), e2 = [], f2 = d2.length;
          for (let a5 = 0; a5 < f2; a5++) e2.push(p(d2[a5], { modifiers: k.fC, structs: b4, type: "event" }));
          return { name: c3.name, type: "event", inputs: e2 };
        }(a3, b3);
        if ((0, k.pc)(a3)) return function(a4, b4 = {}) {
          let c3 = (0, k.kz)(a4);
          if (!c3) throw new g.s7({ signature: a4, type: "error" });
          let d2 = q2(c3.parameters), e2 = [], f2 = d2.length;
          for (let a5 = 0; a5 < f2; a5++) e2.push(p(d2[a5], { structs: b4, type: "error" }));
          return { name: c3.name, type: "error", inputs: e2 };
        }(a3, b3);
        if ((0, k.l9)(a3)) return function(a4, b4 = {}) {
          let c3 = (0, k.Yo)(a4);
          if (!c3) throw new g.s7({ signature: a4, type: "constructor" });
          let d2 = q2(c3.parameters), e2 = [], f2 = d2.length;
          for (let a5 = 0; a5 < f2; a5++) e2.push(p(d2[a5], { structs: b4, type: "constructor" }));
          return { type: "constructor", stateMutability: c3.stateMutability ?? "nonpayable", inputs: e2 };
        }(a3, b3);
        if ((0, k.v8)(a3)) {
          var c2 = a3;
          let b4 = (0, k.If)(c2);
          if (!b4) throw new g.s7({ signature: c2, type: "fallback" });
          return { type: "fallback", stateMutability: b4.stateMutability ?? "nonpayable" };
        }
        if ((0, k.sP)(a3)) return { type: "receive", stateMutability: "payable" };
        throw new g.x8({ signature: a3 });
      }
      let m = /^(?<type>[a-zA-Z$_][a-zA-Z0-9$_]*(?:\spayable)?)(?<array>(?:\[\d*?\])+?)?(?:\s(?<modifier>calldata|indexed|memory|storage{1}))?(?:\s(?<name>[a-zA-Z$_][a-zA-Z0-9$_]*))?$/, n = /^\((?<type>.+?)\)(?<array>(?:\[\d*?\])+?)?(?:\s(?<modifier>calldata|indexed|memory|storage{1}))?(?:\s(?<name>[a-zA-Z$_][a-zA-Z0-9$_]*))?$/, o = /^u?int$/;
      function p(a3, b3) {
        var c2, g2;
        let h2, i2 = function(a4, b4, c3) {
          let d2 = "";
          if (c3) for (let a5 of Object.entries(c3)) {
            if (!a5) continue;
            let b5 = "";
            for (let c4 of a5[1]) b5 += `[${c4.type}${c4.name ? `:${c4.name}` : ""}]`;
            d2 += `(${a5[0]}{${b5}})`;
          }
          return b4 ? `${b4}:${a4}${d2}` : `${a4}${d2}`;
        }(a3, b3?.type, b3?.structs);
        if (j2.has(i2)) return j2.get(i2);
        let l2 = d.wj.test(a3), t = (0, d.Yv)(l2 ? n : m, a3);
        if (!t) throw new f.dV({ param: a3 });
        if (t.name && ("address" === (c2 = t.name) || "bool" === c2 || "function" === c2 || "string" === c2 || "tuple" === c2 || d.BD.test(c2) || d.Ge.test(c2) || s.test(c2))) throw new f.zd({ param: a3, name: t.name });
        let u = t.name ? { name: t.name } : {}, v2 = "indexed" === t.modifier ? { indexed: true } : {}, w2 = b3?.structs ?? {}, x2 = {};
        if (l2) {
          h2 = "tuple";
          let a4 = q2(t.type), b4 = [], c3 = a4.length;
          for (let d2 = 0; d2 < c3; d2++) b4.push(p(a4[d2], { structs: w2 }));
          x2 = { components: b4 };
        } else if (t.type in w2) h2 = "tuple", x2 = { components: w2[t.type] };
        else if (o.test(t.type)) h2 = `${t.type}256`;
        else if ("address payable" === t.type) h2 = "address";
        else if (h2 = t.type, b3?.type !== "struct" && !r(h2)) throw new e.UG({ type: h2 });
        if (t.modifier) {
          if (!b3?.modifiers?.has?.(t.modifier)) throw new f.NO({ param: a3, type: b3?.type, modifier: t.modifier });
          if (k.v7.has(t.modifier) && (g2 = h2, !t.array && "bytes" !== g2 && "string" !== g2 && "tuple" !== g2)) throw new f.Pj({ param: a3, type: b3?.type, modifier: t.modifier });
        }
        let y = { type: `${h2}${t.array ?? ""}`, ...u, ...v2, ...x2 };
        return j2.set(i2, y), y;
      }
      function q2(a3, b3 = [], c2 = "", d2 = 0) {
        let e2 = a3.trim().length;
        for (let f2 = 0; f2 < e2; f2++) {
          let e3 = a3[f2], g2 = a3.slice(f2 + 1);
          switch (e3) {
            case ",":
              return 0 === d2 ? q2(g2, [...b3, c2.trim()]) : q2(g2, b3, `${c2}${e3}`, d2);
            case "(":
              return q2(g2, b3, `${c2}${e3}`, d2 + 1);
            case ")":
              return q2(g2, b3, `${c2}${e3}`, d2 - 1);
            default:
              return q2(g2, b3, `${c2}${e3}`, d2);
          }
        }
        if ("" === c2) return b3;
        if (0 !== d2) throw new i({ current: c2, depth: d2 });
        return b3.push(c2.trim()), b3;
      }
      function r(a3) {
        return "address" === a3 || "bool" === a3 || "function" === a3 || "string" === a3 || d.BD.test(a3) || d.Ge.test(a3);
      }
      let s = /^(?:after|alias|anonymous|apply|auto|byte|calldata|case|catch|constant|copyof|default|defined|error|event|external|false|final|function|immutable|implements|in|indexed|inline|internal|let|mapping|match|memory|mutable|null|of|override|partial|private|promise|public|pure|reference|relocatable|return|returns|sizeof|static|storage|struct|super|supports|switch|this|true|try|typedef|typeof|var|view|virtual)$/;
    }, 6788: (a2, b2, c) => {
      "use strict";
      c.d(b2, { Ez: () => g, LX: () => d, WN: () => e, fT: () => f });
      let d = "0x608060405234801561001057600080fd5b5060405161018e38038061018e83398101604081905261002f91610124565b6000808351602085016000f59050803b61004857600080fd5b6000808351602085016000855af16040513d6000823e81610067573d81fd5b3d81f35b634e487b7160e01b600052604160045260246000fd5b600082601f83011261009257600080fd5b81516001600160401b038111156100ab576100ab61006b565b604051601f8201601f19908116603f011681016001600160401b03811182821017156100d9576100d961006b565b6040528181528382016020018510156100f157600080fd5b60005b82811015610110576020818601810151838301820152016100f4565b506000918101602001919091529392505050565b6000806040838503121561013757600080fd5b82516001600160401b0381111561014d57600080fd5b61015985828601610081565b602085015190935090506001600160401b0381111561017757600080fd5b61018385828601610081565b915050925092905056fe", e = "0x608060405234801561001057600080fd5b506040516102c03803806102c083398101604081905261002f916101e6565b836001600160a01b03163b6000036100e457600080836001600160a01b03168360405161005c9190610270565b6000604051808303816000865af19150503d8060008114610099576040519150601f19603f3d011682016040523d82523d6000602084013e61009e565b606091505b50915091508115806100b857506001600160a01b0386163b155b156100e1578060405163101bb98d60e01b81526004016100d8919061028c565b60405180910390fd5b50505b6000808451602086016000885af16040513d6000823e81610103573d81fd5b3d81f35b80516001600160a01b038116811461011e57600080fd5b919050565b634e487b7160e01b600052604160045260246000fd5b60005b8381101561015457818101518382015260200161013c565b50506000910152565b600082601f83011261016e57600080fd5b81516001600160401b0381111561018757610187610123565b604051601f8201601f19908116603f011681016001600160401b03811182821017156101b5576101b5610123565b6040528181528382016020018510156101cd57600080fd5b6101de826020830160208701610139565b949350505050565b600080600080608085870312156101fc57600080fd5b61020585610107565b60208601519094506001600160401b0381111561022157600080fd5b61022d8782880161015d565b93505061023c60408601610107565b60608601519092506001600160401b0381111561025857600080fd5b6102648782880161015d565b91505092959194509250565b60008251610282818460208701610139565b9190910192915050565b60208152600082518060208401526102ab816040850160208701610139565b601f01601f1916919091016040019291505056fe", f = "0x608060405234801561001057600080fd5b5060405161069438038061069483398101604081905261002f9161051e565b600061003c848484610048565b9050806000526001601ff35b60007f64926492649264926492649264926492649264926492649264926492649264926100748361040c565b036101e7576000606080848060200190518101906100929190610577565b60405192955090935091506000906001600160a01b038516906100b69085906105dd565b6000604051808303816000865af19150503d80600081146100f3576040519150601f19603f3d011682016040523d82523d6000602084013e6100f8565b606091505b50509050876001600160a01b03163b60000361016057806101605760405162461bcd60e51b815260206004820152601e60248201527f5369676e617475726556616c696461746f723a206465706c6f796d656e74000060448201526064015b60405180910390fd5b604051630b135d3f60e11b808252906001600160a01b038a1690631626ba7e90610190908b9087906004016105f9565b602060405180830381865afa1580156101ad573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101d19190610633565b6001600160e01b03191614945050505050610405565b6001600160a01b0384163b1561027a57604051630b135d3f60e11b808252906001600160a01b03861690631626ba7e9061022790879087906004016105f9565b602060405180830381865afa158015610244573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102689190610633565b6001600160e01b031916149050610405565b81516041146102df5760405162461bcd60e51b815260206004820152603a602482015260008051602061067483398151915260448201527f3a20696e76616c6964207369676e6174757265206c656e6774680000000000006064820152608401610157565b6102e7610425565b5060208201516040808401518451859392600091859190811061030c5761030c61065d565b016020015160f81c9050601b811480159061032b57508060ff16601c14155b1561038c5760405162461bcd60e51b815260206004820152603b602482015260008051602061067483398151915260448201527f3a20696e76616c6964207369676e617475726520762076616c756500000000006064820152608401610157565b60408051600081526020810180835289905260ff83169181019190915260608101849052608081018390526001600160a01b0389169060019060a0016020604051602081039080840390855afa1580156103ea573d6000803e3d6000fd5b505050602060405103516001600160a01b0316149450505050505b9392505050565b600060208251101561041d57600080fd5b508051015190565b60405180606001604052806003906020820280368337509192915050565b6001600160a01b038116811461045857600080fd5b50565b634e487b7160e01b600052604160045260246000fd5b60005b8381101561048c578181015183820152602001610474565b50506000910152565b600082601f8301126104a657600080fd5b81516001600160401b038111156104bf576104bf61045b565b604051601f8201601f19908116603f011681016001600160401b03811182821017156104ed576104ed61045b565b60405281815283820160200185101561050557600080fd5b610516826020830160208701610471565b949350505050565b60008060006060848603121561053357600080fd5b835161053e81610443565b6020850151604086015191945092506001600160401b0381111561056157600080fd5b61056d86828701610495565b9150509250925092565b60008060006060848603121561058c57600080fd5b835161059781610443565b60208501519093506001600160401b038111156105b357600080fd5b6105bf86828701610495565b604086015190935090506001600160401b0381111561056157600080fd5b600082516105ef818460208701610471565b9190910192915050565b828152604060208201526000825180604084015261061e816060850160208701610471565b601f01601f1916919091016060019392505050565b60006020828403121561064557600080fd5b81516001600160e01b03198116811461040557600080fd5b634e487b7160e01b600052603260045260246000fdfe5369676e617475726556616c696461746f72237265636f7665725369676e6572", g = "0x608060405234801561001057600080fd5b506115b9806100206000396000f3fe6080604052600436106100f35760003560e01c80634d2301cc1161008a578063a8b0574e11610059578063a8b0574e14610325578063bce38bd714610350578063c3077fa914610380578063ee82ac5e146103b2576100f3565b80634d2301cc1461026257806372425d9d1461029f57806382ad56cb146102ca57806386d516e8146102fa576100f3565b80633408e470116100c65780633408e470146101af578063399542e9146101da5780633e64a6961461020c57806342cbb15c14610237576100f3565b80630f28c97d146100f8578063174dea7114610123578063252dba421461015357806327e86d6e14610184575b600080fd5b34801561010457600080fd5b5061010d6103ef565b60405161011a9190610c0a565b60405180910390f35b61013d60048036038101906101389190610c94565b6103f7565b60405161014a9190610e94565b60405180910390f35b61016d60048036038101906101689190610f0c565b610615565b60405161017b92919061101b565b60405180910390f35b34801561019057600080fd5b506101996107ab565b6040516101a69190611064565b60405180910390f35b3480156101bb57600080fd5b506101c46107b7565b6040516101d19190610c0a565b60405180910390f35b6101f460048036038101906101ef91906110ab565b6107bf565b6040516102039392919061110b565b60405180910390f35b34801561021857600080fd5b506102216107e1565b60405161022e9190610c0a565b60405180910390f35b34801561024357600080fd5b5061024c6107e9565b6040516102599190610c0a565b60405180910390f35b34801561026e57600080fd5b50610289600480360381019061028491906111a7565b6107f1565b6040516102969190610c0a565b60405180910390f35b3480156102ab57600080fd5b506102b4610812565b6040516102c19190610c0a565b60405180910390f35b6102e460048036038101906102df919061122a565b61081a565b6040516102f19190610e94565b60405180910390f35b34801561030657600080fd5b5061030f6109e4565b60405161031c9190610c0a565b60405180910390f35b34801561033157600080fd5b5061033a6109ec565b6040516103479190611286565b60405180910390f35b61036a600480360381019061036591906110ab565b6109f4565b6040516103779190610e94565b60405180910390f35b61039a60048036038101906103959190610f0c565b610ba6565b6040516103a99392919061110b565b60405180910390f35b3480156103be57600080fd5b506103d960048036038101906103d491906112cd565b610bca565b6040516103e69190611064565b60405180910390f35b600042905090565b60606000808484905090508067ffffffffffffffff81111561041c5761041b6112fa565b5b60405190808252806020026020018201604052801561045557816020015b610442610bd5565b81526020019060019003908161043a5790505b5092503660005b828110156105c957600085828151811061047957610478611329565b5b6020026020010151905087878381811061049657610495611329565b5b90506020028101906104a89190611367565b925060008360400135905080860195508360000160208101906104cb91906111a7565b73ffffffffffffffffffffffffffffffffffffffff16818580606001906104f2919061138f565b604051610500929190611431565b60006040518083038185875af1925050503d806000811461053d576040519150601f19603f3d011682016040523d82523d6000602084013e610542565b606091505b5083600001846020018290528215151515815250505081516020850135176105bc577f08c379a000000000000000000000000000000000000000000000000000000000600052602060045260176024527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060445260846000fd5b826001019250505061045c565b5082341461060c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610603906114a7565b60405180910390fd5b50505092915050565b6000606043915060008484905090508067ffffffffffffffff81111561063e5761063d6112fa565b5b60405190808252806020026020018201604052801561067157816020015b606081526020019060019003908161065c5790505b5091503660005b828110156107a157600087878381811061069557610694611329565b5b90506020028101906106a791906114c7565b92508260000160208101906106bc91906111a7565b73ffffffffffffffffffffffffffffffffffffffff168380602001906106e2919061138f565b6040516106f0929190611431565b6000604051808303816000865af19150503d806000811461072d576040519150601f19603f3d011682016040523d82523d6000602084013e610732565b606091505b5086848151811061074657610745611329565b5b60200260200101819052819250505080610795576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161078c9061153b565b60405180910390fd5b81600101915050610678565b5050509250929050565b60006001430340905090565b600046905090565b6000806060439250434091506107d68686866109f4565b905093509350939050565b600048905090565b600043905090565b60008173ffffffffffffffffffffffffffffffffffffffff16319050919050565b600044905090565b606060008383905090508067ffffffffffffffff81111561083e5761083d6112fa565b5b60405190808252806020026020018201604052801561087757816020015b610864610bd5565b81526020019060019003908161085c5790505b5091503660005b828110156109db57600084828151811061089b5761089a611329565b5b602002602001015190508686838181106108b8576108b7611329565b5b90506020028101906108ca919061155b565b92508260000160208101906108df91906111a7565b73ffffffffffffffffffffffffffffffffffffffff16838060400190610905919061138f565b604051610913929190611431565b6000604051808303816000865af19150503d8060008114610950576040519150601f19603f3d011682016040523d82523d6000602084013e610955565b606091505b5082600001836020018290528215151515815250505080516020840135176109cf577f08c379a000000000000000000000000000000000000000000000000000000000600052602060045260176024527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060445260646000fd5b8160010191505061087e565b50505092915050565b600045905090565b600041905090565b606060008383905090508067ffffffffffffffff811115610a1857610a176112fa565b5b604051908082528060200260200182016040528015610a5157816020015b610a3e610bd5565b815260200190600190039081610a365790505b5091503660005b82811015610b9c576000848281518110610a7557610a74611329565b5b60200260200101519050868683818110610a9257610a91611329565b5b9050602002810190610aa491906114c7565b9250826000016020810190610ab991906111a7565b73ffffffffffffffffffffffffffffffffffffffff16838060200190610adf919061138f565b604051610aed929190611431565b6000604051808303816000865af19150503d8060008114610b2a576040519150601f19603f3d011682016040523d82523d6000602084013e610b2f565b606091505b508260000183602001829052821515151581525050508715610b90578060000151610b8f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b869061153b565b60405180910390fd5b5b81600101915050610a58565b5050509392505050565b6000806060610bb7600186866107bf565b8093508194508295505050509250925092565b600081409050919050565b6040518060400160405280600015158152602001606081525090565b6000819050919050565b610c0481610bf1565b82525050565b6000602082019050610c1f6000830184610bfb565b92915050565b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b60008083601f840112610c5457610c53610c2f565b5b8235905067ffffffffffffffff811115610c7157610c70610c34565b5b602083019150836020820283011115610c8d57610c8c610c39565b5b9250929050565b60008060208385031215610cab57610caa610c25565b5b600083013567ffffffffffffffff811115610cc957610cc8610c2a565b5b610cd585828601610c3e565b92509250509250929050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b60008115159050919050565b610d2281610d0d565b82525050565b600081519050919050565b600082825260208201905092915050565b60005b83811015610d62578082015181840152602081019050610d47565b83811115610d71576000848401525b50505050565b6000601f19601f8301169050919050565b6000610d9382610d28565b610d9d8185610d33565b9350610dad818560208601610d44565b610db681610d77565b840191505092915050565b6000604083016000830151610dd96000860182610d19565b5060208301518482036020860152610df18282610d88565b9150508091505092915050565b6000610e0a8383610dc1565b905092915050565b6000602082019050919050565b6000610e2a82610ce1565b610e348185610cec565b935083602082028501610e4685610cfd565b8060005b85811015610e825784840389528151610e638582610dfe565b9450610e6e83610e12565b925060208a01995050600181019050610e4a565b50829750879550505050505092915050565b60006020820190508181036000830152610eae8184610e1f565b905092915050565b60008083601f840112610ecc57610ecb610c2f565b5b8235905067ffffffffffffffff811115610ee957610ee8610c34565b5b602083019150836020820283011115610f0557610f04610c39565b5b9250929050565b60008060208385031215610f2357610f22610c25565b5b600083013567ffffffffffffffff811115610f4157610f40610c2a565b5b610f4d85828601610eb6565b92509250509250929050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b6000610f918383610d88565b905092915050565b6000602082019050919050565b6000610fb182610f59565b610fbb8185610f64565b935083602082028501610fcd85610f75565b8060005b858110156110095784840389528151610fea8582610f85565b9450610ff583610f99565b925060208a01995050600181019050610fd1565b50829750879550505050505092915050565b60006040820190506110306000830185610bfb565b81810360208301526110428184610fa6565b90509392505050565b6000819050919050565b61105e8161104b565b82525050565b60006020820190506110796000830184611055565b92915050565b61108881610d0d565b811461109357600080fd5b50565b6000813590506110a58161107f565b92915050565b6000806000604084860312156110c4576110c3610c25565b5b60006110d286828701611096565b935050602084013567ffffffffffffffff8111156110f3576110f2610c2a565b5b6110ff86828701610eb6565b92509250509250925092565b60006060820190506111206000830186610bfb565b61112d6020830185611055565b818103604083015261113f8184610e1f565b9050949350505050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061117482611149565b9050919050565b61118481611169565b811461118f57600080fd5b50565b6000813590506111a18161117b565b92915050565b6000602082840312156111bd576111bc610c25565b5b60006111cb84828501611192565b91505092915050565b60008083601f8401126111ea576111e9610c2f565b5b8235905067ffffffffffffffff81111561120757611206610c34565b5b60208301915083602082028301111561122357611222610c39565b5b9250929050565b6000806020838503121561124157611240610c25565b5b600083013567ffffffffffffffff81111561125f5761125e610c2a565b5b61126b858286016111d4565b92509250509250929050565b61128081611169565b82525050565b600060208201905061129b6000830184611277565b92915050565b6112aa81610bf1565b81146112b557600080fd5b50565b6000813590506112c7816112a1565b92915050565b6000602082840312156112e3576112e2610c25565b5b60006112f1848285016112b8565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b600080fd5b600080fd5b600080fd5b60008235600160800383360303811261138357611382611358565b5b80830191505092915050565b600080833560016020038436030381126113ac576113ab611358565b5b80840192508235915067ffffffffffffffff8211156113ce576113cd61135d565b5b6020830192506001820236038313156113ea576113e9611362565b5b509250929050565b600081905092915050565b82818337600083830152505050565b600061141883856113f2565b93506114258385846113fd565b82840190509392505050565b600061143e82848661140c565b91508190509392505050565b600082825260208201905092915050565b7f4d756c746963616c6c333a2076616c7565206d69736d61746368000000000000600082015250565b6000611491601a8361144a565b915061149c8261145b565b602082019050919050565b600060208201905081810360008301526114c081611484565b9050919050565b6000823560016040038336030381126114e3576114e2611358565b5b80830191505092915050565b7f4d756c746963616c6c333a2063616c6c206661696c6564000000000000000000600082015250565b600061152560178361144a565b9150611530826114ef565b602082019050919050565b6000602082019050818103600083015261155481611518565b9050919050565b60008235600160600383360303811261157757611576611358565b5b8083019150509291505056fea264697066735822122020c1bc9aacf8e4a6507193432a895a8e77094f45a1395583f07b24e860ef06cd64736f6c634300080c0033";
    }, 7159: (a2, b2, c) => {
      "use strict";
      c.d(b2, { X: () => r, J: () => q2 });
      var d = c(3736), e = c(9954), f = c(8863), g = c(5022), h = c(4430), i = c(9304), j2 = c(9382), k = c(5290), l = c(494), m = c(9965);
      let n = "/docs/contract/encodeErrorResult";
      function o(a3) {
        let { abi: b3, errorName: c2, args: d2 } = a3, e2 = b3[0];
        if (c2) {
          let a4 = (0, m.iY)({ abi: b3, args: d2, name: c2 });
          if (!a4) throw new f.yy(c2, { docsPath: n });
          e2 = a4;
        }
        if ("error" !== e2.type) throw new f.yy(void 0, { docsPath: n });
        let g2 = (0, j2.B)(e2), i2 = (0, h.V)(g2), o2 = "0x";
        if (d2 && d2.length > 0) {
          if (!e2.inputs) throw new f.ZP(e2.name, { docsPath: n });
          o2 = (0, l.h)(e2.inputs, d2);
        }
        return (0, k.aP)([i2, o2]);
      }
      let p = "/docs/contract/encodeFunctionResult", q2 = "x-batch-gateway:true";
      async function r(a3) {
        let { data: b3, ccipRequest: c2 } = a3, { args: [k2] } = function(a4) {
          let { abi: b4, data: c3 } = a4, d2 = (0, g.di)(c3, 0, 4), e2 = b4.find((a5) => "function" === a5.type && d2 === (0, h.V)((0, j2.B)(a5)));
          if (!e2) throw new f.EB(d2, { docsPath: "/docs/contract/decodeFunctionData" });
          return { functionName: e2.name, args: "inputs" in e2 && e2.inputs && e2.inputs.length > 0 ? (0, i.n)(e2.inputs, (0, g.di)(c3, 4)) : void 0 };
        }({ abi: d.b2, data: b3 }), n2 = [], s = [];
        return await Promise.all(k2.map(async (a4, b4) => {
          try {
            s[b4] = a4.urls.includes(q2) ? await r({ data: a4.data, ccipRequest: c2 }) : await c2(a4), n2[b4] = false;
          } catch (a5) {
            var f2;
            n2[b4] = true, s[b4] = "HttpRequestError" === (f2 = a5).name && f2.status ? o({ abi: d.b2, errorName: "HttpError", args: [f2.status, f2.shortMessage] }) : o({ abi: [e.Mc], errorName: "Error", args: ["shortMessage" in f2 ? f2.shortMessage : f2.message] });
          }
        })), function(a4) {
          let { abi: b4, functionName: c3, result: d2 } = a4, e2 = b4[0];
          if (c3) {
            let a5 = (0, m.iY)({ abi: b4, name: c3 });
            if (!a5) throw new f.Iz(c3, { docsPath: p });
            e2 = a5;
          }
          if ("function" !== e2.type) throw new f.Iz(void 0, { docsPath: p });
          if (!e2.outputs) throw new f.MR(e2.name, { docsPath: p });
          let g2 = (() => {
            if (0 === e2.outputs.length) return [];
            if (1 === e2.outputs.length) return [d2];
            if (Array.isArray(d2)) return d2;
            throw new f.dm(d2);
          })();
          return (0, l.h)(e2.outputs, g2);
        }({ abi: d.b2, functionName: "query", result: [n2, s] });
      }
    }, 7591: (a2, b2, c) => {
      "use strict";
      c.d(b2, { c: () => f });
      var d = c(5165), e = c(1512);
      function f(a3, b3 = "wei") {
        return (0, e.J)(a3, d.eL[b3]);
      }
    }, 7600: (a2, b2, c) => {
      "use strict";
      c.d(b2, { Hi: () => e, ft: () => f, uj: () => h });
      var d = c(1766);
      class e extends d.C {
        constructor({ address: a3 }) {
          super(`State for account "${a3}" is set multiple times.`, { name: "AccountStateConflictError" });
        }
      }
      class f extends d.C {
        constructor() {
          super("state and stateDiff are set on the same account.", { name: "StateAssignmentConflictError" });
        }
      }
      function g(a3) {
        return a3.reduce((a4, { slot: b3, value: c2 }) => `${a4}        ${b3}: ${c2}
`, "");
      }
      function h(a3) {
        return a3.reduce((a4, { address: b3, ...c2 }) => {
          let d2 = `${a4}    ${b3}:
`;
          return c2.nonce && (d2 += `      nonce: ${c2.nonce}
`), c2.balance && (d2 += `      balance: ${c2.balance}
`), c2.code && (d2 += `      code: ${c2.code}
`), c2.state && (d2 += "      state:\n", d2 += g(c2.state)), c2.stateDiff && (d2 += "      stateDiff:\n", d2 += g(c2.stateDiff)), d2;
        }, "  State Override:\n").slice(0, -1);
      }
    }, 7653: (a2, b2, c) => {
      "use strict";
      c.d(b2, { A7: () => f, BG: () => g, Fo: () => n, K0: () => i, Oh: () => j2, RM: () => q2, jj: () => h, k5: () => l, lN: () => p, lY: () => m, uC: () => o, vW: () => k });
      var d = c(8367), e = c(1766);
      class f extends e.C {
        constructor({ cause: a3, message: b3 } = {}) {
          let c2 = b3?.replace("execution reverted: ", "")?.replace("execution reverted", "");
          super(`Execution reverted ${c2 ? `with reason: ${c2}` : "for an unknown reason"}.`, { cause: a3, name: "ExecutionRevertedError" });
        }
      }
      Object.defineProperty(f, "code", { enumerable: true, configurable: true, writable: true, value: 3 }), Object.defineProperty(f, "nodeMessage", { enumerable: true, configurable: true, writable: true, value: /execution reverted|gas required exceeds allowance/ });
      class g extends e.C {
        constructor({ cause: a3, maxFeePerGas: b3 } = {}) {
          super(`The fee cap (\`maxFeePerGas\`${b3 ? ` = ${(0, d.Q)(b3)} gwei` : ""}) cannot be higher than the maximum allowed value (2^256-1).`, { cause: a3, name: "FeeCapTooHighError" });
        }
      }
      Object.defineProperty(g, "nodeMessage", { enumerable: true, configurable: true, writable: true, value: /max fee per gas higher than 2\^256-1|fee cap higher than 2\^256-1/ });
      class h extends e.C {
        constructor({ cause: a3, maxFeePerGas: b3 } = {}) {
          super(`The fee cap (\`maxFeePerGas\`${b3 ? ` = ${(0, d.Q)(b3)}` : ""} gwei) cannot be lower than the block base fee.`, { cause: a3, name: "FeeCapTooLowError" });
        }
      }
      Object.defineProperty(h, "nodeMessage", { enumerable: true, configurable: true, writable: true, value: /max fee per gas less than block base fee|fee cap less than block base fee|transaction is outdated/ });
      class i extends e.C {
        constructor({ cause: a3, nonce: b3 } = {}) {
          super(`Nonce provided for the transaction ${b3 ? `(${b3}) ` : ""}is higher than the next one expected.`, { cause: a3, name: "NonceTooHighError" });
        }
      }
      Object.defineProperty(i, "nodeMessage", { enumerable: true, configurable: true, writable: true, value: /nonce too high/ });
      class j2 extends e.C {
        constructor({ cause: a3, nonce: b3 } = {}) {
          super(`Nonce provided for the transaction ${b3 ? `(${b3}) ` : ""}is lower than the current nonce of the account.
Try increasing the nonce or find the latest nonce with \`getTransactionCount\`.`, { cause: a3, name: "NonceTooLowError" });
        }
      }
      Object.defineProperty(j2, "nodeMessage", { enumerable: true, configurable: true, writable: true, value: /nonce too low|transaction already imported|already known/ });
      class k extends e.C {
        constructor({ cause: a3, nonce: b3 } = {}) {
          super(`Nonce provided for the transaction ${b3 ? `(${b3}) ` : ""}exceeds the maximum allowed nonce.`, { cause: a3, name: "NonceMaxValueError" });
        }
      }
      Object.defineProperty(k, "nodeMessage", { enumerable: true, configurable: true, writable: true, value: /nonce has max value/ });
      class l extends e.C {
        constructor({ cause: a3 } = {}) {
          super("The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.", { cause: a3, metaMessages: ["This error could arise when the account does not have enough funds to:", " - pay for the total gas fee,", " - pay for the value to send.", " ", "The cost of the transaction is calculated as `gas * gas fee + value`, where:", " - `gas` is the amount of gas needed for transaction to execute,", " - `gas fee` is the gas fee,", " - `value` is the amount of ether to send to the recipient."], name: "InsufficientFundsError" });
        }
      }
      Object.defineProperty(l, "nodeMessage", { enumerable: true, configurable: true, writable: true, value: /insufficient funds|exceeds transaction sender account balance/ });
      class m extends e.C {
        constructor({ cause: a3, gas: b3 } = {}) {
          super(`The amount of gas ${b3 ? `(${b3}) ` : ""}provided for the transaction exceeds the limit allowed for the block.`, { cause: a3, name: "IntrinsicGasTooHighError" });
        }
      }
      Object.defineProperty(m, "nodeMessage", { enumerable: true, configurable: true, writable: true, value: /intrinsic gas too high|gas limit reached/ });
      class n extends e.C {
        constructor({ cause: a3, gas: b3 } = {}) {
          super(`The amount of gas ${b3 ? `(${b3}) ` : ""}provided for the transaction is too low.`, { cause: a3, name: "IntrinsicGasTooLowError" });
        }
      }
      Object.defineProperty(n, "nodeMessage", { enumerable: true, configurable: true, writable: true, value: /intrinsic gas too low/ });
      class o extends e.C {
        constructor({ cause: a3 }) {
          super("The transaction type is not supported for this chain.", { cause: a3, name: "TransactionTypeNotSupportedError" });
        }
      }
      Object.defineProperty(o, "nodeMessage", { enumerable: true, configurable: true, writable: true, value: /transaction type not valid/ });
      class p extends e.C {
        constructor({ cause: a3, maxPriorityFeePerGas: b3, maxFeePerGas: c2 } = {}) {
          super(`The provided tip (\`maxPriorityFeePerGas\`${b3 ? ` = ${(0, d.Q)(b3)} gwei` : ""}) cannot be higher than the fee cap (\`maxFeePerGas\`${c2 ? ` = ${(0, d.Q)(c2)} gwei` : ""}).`, { cause: a3, name: "TipAboveFeeCapError" });
        }
      }
      Object.defineProperty(p, "nodeMessage", { enumerable: true, configurable: true, writable: true, value: /max priority fee per gas higher than max fee per gas|tip higher than fee cap/ });
      class q2 extends e.C {
        constructor({ cause: a3 }) {
          super(`An error occurred while executing: ${a3?.shortMessage}`, { cause: a3, name: "UnknownNodeError" });
        }
      }
    }, 7762: (a2, b2, c) => {
      "use strict";
      c.d(b2, { offchainLookup: () => t, offchainLookupSignature: () => r });
      var d = c(3777), e = c(5934), f = c(1766), g = c(4728);
      class h extends f.C {
        constructor({ callbackSelector: a3, cause: b3, data: c2, extraData: d2, sender: e2, urls: f2 }) {
          super(b3.shortMessage || "An error occurred while fetching for an offchain result.", { cause: b3, metaMessages: [...b3.metaMessages || [], b3.metaMessages?.length ? "" : [], "Offchain Gateway Call:", f2 && ["  Gateway URL(s):", ...f2.map((a4) => `    ${(0, g.ID)(a4)}`)], `  Sender: ${e2}`, `  Data: ${c2}`, `  Callback selector: ${a3}`, `  Extra data: ${d2}`].flat(), name: "OffchainLookupError" });
        }
      }
      class i extends f.C {
        constructor({ result: a3, url: b3 }) {
          super("Offchain gateway response is malformed. Response data must be a hex value.", { metaMessages: [`Gateway URL: ${(0, g.ID)(b3)}`, `Response: ${(0, e.A)(a3)}`], name: "OffchainLookupResponseMalformedError" });
        }
      }
      class j2 extends f.C {
        constructor({ sender: a3, to: b3 }) {
          super("Reverted sender address does not match target contract address (`to`).", { metaMessages: [`Contract address: ${b3}`, `OffchainLookup sender address: ${a3}`], name: "OffchainLookupSenderMismatchError" });
        }
      }
      var k = c(840), l = c(5555), m = c(494), n = c(1478), o = c(5290), p = c(5237), q2 = c(7159);
      let r = "0x556f1830", s = { name: "OffchainLookup", type: "error", inputs: [{ name: "sender", type: "address" }, { name: "urls", type: "string[]" }, { name: "callData", type: "bytes" }, { name: "callbackFunction", type: "bytes4" }, { name: "extraData", type: "bytes" }] };
      async function t(a3, { blockNumber: b3, blockTag: c2, data: e2, requestOptions: f2, to: i2 }) {
        let { args: k2 } = (0, l.W)({ data: e2, abi: [s] }), [p2, r2, t2, v2, w2] = k2, { ccipRead: x2 } = a3, y = x2 && "function" == typeof x2?.request ? x2.request : u;
        try {
          if (!(0, n.h)(i2, p2)) throw new j2({ sender: p2, to: i2 });
          let e3 = r2.includes(q2.J) ? await (0, q2.X)({ data: t2, ccipRequest: (a4) => y({ ...a4, requestOptions: f2 }) }) : await y({ data: t2, requestOptions: f2, sender: p2, urls: r2 }), { data: g2 } = await (0, d.T)(a3, { blockNumber: b3, blockTag: c2, data: (0, o.xW)([v2, (0, m.h)([{ type: "bytes" }, { type: "bytes" }], [e3, w2])]), requestOptions: f2, to: i2 });
          return g2;
        } catch (a4) {
          if (f2?.signal?.aborted) throw (0, g.TY)(f2.signal);
          if ((0, g.zf)(a4)) throw a4;
          throw new h({ callbackSelector: v2, cause: a4, data: e2, extraData: w2, sender: p2, urls: r2 });
        }
      }
      async function u({ data: a3, requestOptions: b3, sender: c2, urls: d2 }) {
        let f2 = Error("An unknown error occurred.");
        for (let h2 = 0; h2 < d2.length; h2++) {
          if (b3?.signal?.aborted) throw (0, g.TY)(b3.signal);
          let j3 = d2[h2], l2 = j3.includes("{data}") ? "GET" : "POST", m2 = "POST" === l2 ? { data: a3, sender: c2 } : void 0, n2 = "POST" === l2 ? { "Content-Type": "application/json" } : {};
          try {
            let d3, g2 = await fetch(j3.replace("{sender}", c2.toLowerCase()).replace("{data}", a3), { body: JSON.stringify(m2), headers: n2, method: l2, ...b3?.signal ? { signal: b3.signal } : {} });
            if (d3 = g2.headers.get("Content-Type")?.startsWith("application/json") ? (await g2.json()).data : await g2.text(), !g2.ok) {
              f2 = new k.Ci({ body: m2, details: d3?.error ? (0, e.A)(d3.error) : g2.statusText, headers: g2.headers, status: g2.status, url: j3 });
              continue;
            }
            if (!(0, p.q)(d3)) {
              f2 = new i({ result: d3, url: j3 });
              continue;
            }
            return d3;
          } catch (a4) {
            if (b3?.signal?.aborted) throw (0, g.TY)(b3.signal);
            if ((0, g.zf)(a4)) throw a4;
            f2 = new k.Ci({ body: m2, details: a4.message, url: j3 });
          }
        }
        throw f2;
      }
    }, 7809: (a2, b2, c) => {
      "use strict";
      c.d(b2, { sc: () => k });
      var d = c(4890);
      class e extends d.Vw {
        constructor(a3, b3, c2, e2) {
          super(), this.finished = false, this.length = 0, this.pos = 0, this.destroyed = false, this.blockLen = a3, this.outputLen = b3, this.padOffset = c2, this.isLE = e2, this.buffer = new Uint8Array(a3), this.view = (0, d.O8)(this.buffer);
        }
        update(a3) {
          (0, d.CC)(this), a3 = (0, d.ZJ)(a3), (0, d.DO)(a3);
          let { view: b3, buffer: c2, blockLen: e2 } = this, f2 = a3.length;
          for (let g2 = 0; g2 < f2; ) {
            let h2 = Math.min(e2 - this.pos, f2 - g2);
            if (h2 === e2) {
              let b4 = (0, d.O8)(a3);
              for (; e2 <= f2 - g2; g2 += e2) this.process(b4, g2);
              continue;
            }
            c2.set(a3.subarray(g2, g2 + h2), this.pos), this.pos += h2, g2 += h2, this.pos === e2 && (this.process(b3, 0), this.pos = 0);
          }
          return this.length += a3.length, this.roundClean(), this;
        }
        digestInto(a3) {
          (0, d.CC)(this), (0, d.Ht)(a3, this), this.finished = true;
          let { buffer: b3, view: c2, blockLen: e2, isLE: f2 } = this, { pos: g2 } = this;
          b3[g2++] = 128, (0, d.uH)(this.buffer.subarray(g2)), this.padOffset > e2 - g2 && (this.process(c2, 0), g2 = 0);
          for (let a4 = g2; a4 < e2; a4++) b3[a4] = 0;
          !function(a4, b4, c3, d2) {
            if ("function" == typeof a4.setBigUint64) return a4.setBigUint64(b4, c3, d2);
            let e3 = BigInt(32), f3 = BigInt(4294967295), g3 = Number(c3 >> e3 & f3), h3 = Number(c3 & f3), i3 = 4 * !!d2, j4 = 4 * !d2;
            a4.setUint32(b4 + i3, g3, d2), a4.setUint32(b4 + j4, h3, d2);
          }(c2, e2 - 8, BigInt(8 * this.length), f2), this.process(c2, 0);
          let h2 = (0, d.O8)(a3), i2 = this.outputLen;
          if (i2 % 4) throw Error("_sha2: outputLen should be aligned to 32bit");
          let j3 = i2 / 4, k2 = this.get();
          if (j3 > k2.length) throw Error("_sha2: outputLen bigger than state");
          for (let a4 = 0; a4 < j3; a4++) h2.setUint32(4 * a4, k2[a4], f2);
        }
        digest() {
          let { buffer: a3, outputLen: b3 } = this;
          this.digestInto(a3);
          let c2 = a3.slice(0, b3);
          return this.destroy(), c2;
        }
        _cloneInto(a3) {
          a3 || (a3 = new this.constructor()), a3.set(...this.get());
          let { blockLen: b3, buffer: c2, length: d2, finished: e2, destroyed: f2, pos: g2 } = this;
          return a3.destroyed = f2, a3.finished = e2, a3.length = d2, a3.pos = g2, d2 % b3 && a3.buffer.set(c2), a3;
        }
        clone() {
          return this._cloneInto();
        }
      }
      let f = Uint32Array.from([1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225]);
      var g = c(7736);
      let h = Uint32Array.from([1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298]), i = new Uint32Array(64);
      class j2 extends e {
        constructor(a3 = 32) {
          super(64, a3, 8, false), this.A = 0 | f[0], this.B = 0 | f[1], this.C = 0 | f[2], this.D = 0 | f[3], this.E = 0 | f[4], this.F = 0 | f[5], this.G = 0 | f[6], this.H = 0 | f[7];
        }
        get() {
          let { A: a3, B: b3, C: c2, D: d2, E: e2, F: f2, G: g2, H: h2 } = this;
          return [a3, b3, c2, d2, e2, f2, g2, h2];
        }
        set(a3, b3, c2, d2, e2, f2, g2, h2) {
          this.A = 0 | a3, this.B = 0 | b3, this.C = 0 | c2, this.D = 0 | d2, this.E = 0 | e2, this.F = 0 | f2, this.G = 0 | g2, this.H = 0 | h2;
        }
        process(a3, b3) {
          for (let c3 = 0; c3 < 16; c3++, b3 += 4) i[c3] = a3.getUint32(b3, false);
          for (let a4 = 16; a4 < 64; a4++) {
            let b4 = i[a4 - 15], c3 = i[a4 - 2], e3 = (0, d.Ow)(b4, 7) ^ (0, d.Ow)(b4, 18) ^ b4 >>> 3, f3 = (0, d.Ow)(c3, 17) ^ (0, d.Ow)(c3, 19) ^ c3 >>> 10;
            i[a4] = f3 + i[a4 - 7] + e3 + i[a4 - 16] | 0;
          }
          let { A: c2, B: e2, C: f2, D: g2, E: j3, F: k2, G: l, H: m } = this;
          for (let a4 = 0; a4 < 64; a4++) {
            var n, o, p, q2;
            let b4 = m + ((0, d.Ow)(j3, 6) ^ (0, d.Ow)(j3, 11) ^ (0, d.Ow)(j3, 25)) + ((n = j3) & k2 ^ ~n & l) + h[a4] + i[a4] | 0, r = ((0, d.Ow)(c2, 2) ^ (0, d.Ow)(c2, 13) ^ (0, d.Ow)(c2, 22)) + ((o = c2) & (p = e2) ^ o & (q2 = f2) ^ p & q2) | 0;
            m = l, l = k2, k2 = j3, j3 = g2 + b4 | 0, g2 = f2, f2 = e2, e2 = c2, c2 = b4 + r | 0;
          }
          c2 = c2 + this.A | 0, e2 = e2 + this.B | 0, f2 = f2 + this.C | 0, g2 = g2 + this.D | 0, j3 = j3 + this.E | 0, k2 = k2 + this.F | 0, l = l + this.G | 0, m = m + this.H | 0, this.set(c2, e2, f2, g2, j3, k2, l, m);
        }
        roundClean() {
          (0, d.uH)(i);
        }
        destroy() {
          this.set(0, 0, 0, 0, 0, 0, 0, 0), (0, d.uH)(this.buffer);
        }
      }
      g.lD(["0x428a2f98d728ae22", "0x7137449123ef65cd", "0xb5c0fbcfec4d3b2f", "0xe9b5dba58189dbbc", "0x3956c25bf348b538", "0x59f111f1b605d019", "0x923f82a4af194f9b", "0xab1c5ed5da6d8118", "0xd807aa98a3030242", "0x12835b0145706fbe", "0x243185be4ee4b28c", "0x550c7dc3d5ffb4e2", "0x72be5d74f27b896f", "0x80deb1fe3b1696b1", "0x9bdc06a725c71235", "0xc19bf174cf692694", "0xe49b69c19ef14ad2", "0xefbe4786384f25e3", "0x0fc19dc68b8cd5b5", "0x240ca1cc77ac9c65", "0x2de92c6f592b0275", "0x4a7484aa6ea6e483", "0x5cb0a9dcbd41fbd4", "0x76f988da831153b5", "0x983e5152ee66dfab", "0xa831c66d2db43210", "0xb00327c898fb213f", "0xbf597fc7beef0ee4", "0xc6e00bf33da88fc2", "0xd5a79147930aa725", "0x06ca6351e003826f", "0x142929670a0e6e70", "0x27b70a8546d22ffc", "0x2e1b21385c26c926", "0x4d2c6dfc5ac42aed", "0x53380d139d95b3df", "0x650a73548baf63de", "0x766a0abb3c77b2a8", "0x81c2c92e47edaee6", "0x92722c851482353b", "0xa2bfe8a14cf10364", "0xa81a664bbc423001", "0xc24b8b70d0f89791", "0xc76c51a30654be30", "0xd192e819d6ef5218", "0xd69906245565a910", "0xf40e35855771202a", "0x106aa07032bbd1b8", "0x19a4c116b8d2d0c8", "0x1e376c085141ab53", "0x2748774cdf8eeb99", "0x34b0bcb5e19b48a8", "0x391c0cb3c5c95a63", "0x4ed8aa4ae3418acb", "0x5b9cca4f7763e373", "0x682e6ff3d6b2b8a3", "0x748f82ee5defb2fc", "0x78a5636f43172f60", "0x84c87814a1f0ab72", "0x8cc702081a6439ec", "0x90befffa23631e28", "0xa4506cebde82bde9", "0xbef9a3f7b2c67915", "0xc67178f2e372532b", "0xca273eceea26619c", "0xd186b8c721c0c207", "0xeada7dd6cde0eb1e", "0xf57d4f7fee6ed178", "0x06f067aa72176fba", "0x0a637dc5a2c898a6", "0x113f9804bef90dae", "0x1b710b35131c471b", "0x28db77f523047d84", "0x32caab7b40c72493", "0x3c9ebe0a15c9bebc", "0x431d67c49c100d4c", "0x4cc5d4becb3e42b6", "0x597f299cfc657e2a", "0x5fcb6fab3ad6faec", "0x6c44198c4a475817"].map((a3) => BigInt(a3)));
      let k = (0, d.qj)(() => new j2());
    }, 7848: (a2, b2, c) => {
      "use strict";
      function d(a3) {
        return "string" == typeof a3 ? { address: a3, type: "json-rpc" } : a3;
      }
      c.d(b2, { J: () => d });
    }, 7968: (a2, b2, c) => {
      "use strict";
      c.d(b2, { M: () => e });
      var d = c(296);
      function e({ blockNumber: a3, chain: b3, contract: c2 }) {
        let e2 = b3?.contracts?.[c2];
        if (!e2) throw new d.rj({ chain: b3, contract: { name: c2 } });
        if (a3 && e2.blockCreated && e2.blockCreated > a3) throw new d.rj({ blockNumber: a3, chain: b3, contract: { name: c2, blockCreated: e2.blockCreated } });
        return e2.address;
      }
    }, 8144: (a2, b2, c) => {
      "use strict";
      c.d(b2, { J: () => f });
      var d = c(40);
      function e(a3) {
        return { address: a3.address, amount: d.oB(a3.amount), index: d.oB(a3.index), validatorIndex: d.oB(a3.validatorIndex) };
      }
      function f(a3) {
        return { ..."bigint" == typeof a3.baseFeePerGas && { baseFeePerGas: d.oB(a3.baseFeePerGas) }, ..."bigint" == typeof a3.blobBaseFee && { blobBaseFee: d.oB(a3.blobBaseFee) }, ..."string" == typeof a3.feeRecipient && { feeRecipient: a3.feeRecipient }, ..."bigint" == typeof a3.gasLimit && { gasLimit: d.oB(a3.gasLimit) }, ..."bigint" == typeof a3.number && { number: d.oB(a3.number) }, ..."bigint" == typeof a3.prevRandao && { prevRandao: d.oB(a3.prevRandao) }, ..."bigint" == typeof a3.time && { time: d.oB(a3.time) }, ...a3.withdrawals && { withdrawals: a3.withdrawals.map(e) } };
      }
    }, 8335: () => {
    }, 8367: (a2, b2, c) => {
      "use strict";
      c.d(b2, { Q: () => f });
      var d = c(5165), e = c(1512);
      function f(a3, b3 = "wei") {
        return (0, e.J)(a3, d.sz[b3]);
      }
    }, 8971: (a2, b2, c) => {
      "use strict";
      c.d(b2, { Dv: () => y, FO: () => p, If: () => v2, Ji: () => l, Rv: () => i, WL: () => o, Yo: () => s, ej: () => m, fC: () => z2, iB: () => j2, kz: () => g, l9: () => r, pc: () => f, sP: () => x2, v7: () => A, v8: () => u });
      var d = c(1871);
      let e = /^error (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)$/;
      function f(a3) {
        return e.test(a3);
      }
      function g(a3) {
        return (0, d.Yv)(e, a3);
      }
      let h = /^event (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)$/;
      function i(a3) {
        return h.test(a3);
      }
      function j2(a3) {
        return (0, d.Yv)(h, a3);
      }
      let k = /^function (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)(?: (?<scope>external|public{1}))?(?: (?<stateMutability>pure|view|nonpayable|payable{1}))?(?: returns\s?\((?<returns>.*?)\))?$/;
      function l(a3) {
        return k.test(a3);
      }
      function m(a3) {
        return (0, d.Yv)(k, a3);
      }
      let n = /^struct (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*) \{(?<properties>.*?)\}$/;
      function o(a3) {
        return n.test(a3);
      }
      function p(a3) {
        return (0, d.Yv)(n, a3);
      }
      let q2 = /^constructor\((?<parameters>.*?)\)(?:\s(?<stateMutability>payable{1}))?$/;
      function r(a3) {
        return q2.test(a3);
      }
      function s(a3) {
        return (0, d.Yv)(q2, a3);
      }
      let t = /^fallback\(\) external(?:\s(?<stateMutability>payable{1}))?$/;
      function u(a3) {
        return t.test(a3);
      }
      function v2(a3) {
        return (0, d.Yv)(t, a3);
      }
      let w2 = /^receive\(\) external payable$/;
      function x2(a3) {
        return w2.test(a3);
      }
      let y = /* @__PURE__ */ new Set(["memory", "indexed", "storage", "calldata"]), z2 = /* @__PURE__ */ new Set(["indexed"]), A = /* @__PURE__ */ new Set(["calldata", "memory", "storage"]);
    }, 9304: (a2, b2, c) => {
      "use strict";
      c.d(b2, { n: () => p });
      var d = c(8863), e = c(7474), f = c(9581), g = c(2847), h = c(5022), i = c(606), j2 = c(7116), k = c(5808), l = c(3375);
      function m(a3, b3 = {}) {
        void 0 !== b3.size && (0, k.Sl)(a3, { size: b3.size });
        let c2 = (0, l.My)(a3, b3);
        return (0, k.ME)(c2, b3);
      }
      var n = c(8657), o = c(494);
      function p(a3, b3) {
        let c2 = "string" == typeof b3 ? (0, n.aT)(b3) : b3, p2 = (0, f.l)(c2);
        if (0 === (0, g.E)(c2) && a3.length > 0) throw new d.O();
        if ((0, g.E)(b3) && 32 > (0, g.E)(b3)) throw new d.Iy({ data: "string" == typeof b3 ? b3 : (0, l.My)(b3), params: a3, size: (0, g.E)(b3) });
        let r = 0, s = [];
        for (let b4 = 0; b4 < a3.length; ++b4) {
          let c3 = a3[b4];
          p2.setPosition(r);
          let [f2, g2] = function a4(b5, c4, { staticPosition: f3 }) {
            let g3 = (0, o.k)(c4.type);
            if (g3) {
              let [d2, e2] = g3;
              return function(b6, c5, { length: d3, staticPosition: e3 }) {
                if (!d3) {
                  let d4 = e3 + m(b6.readBytes(32)), f5 = d4 + 32;
                  b6.setPosition(d4);
                  let g5 = m(b6.readBytes(32)), h2 = q2(c5), i2 = 0, j3 = [];
                  for (let d5 = 0; d5 < g5; ++d5) {
                    b6.setPosition(f5 + (h2 ? 32 * d5 : i2));
                    let [e4, g6] = a4(b6, c5, { staticPosition: f5 });
                    i2 += g6, j3.push(e4);
                  }
                  return b6.setPosition(e3 + 32), [j3, 32];
                }
                if (q2(c5)) {
                  let f5 = e3 + m(b6.readBytes(32)), g5 = [];
                  for (let e4 = 0; e4 < d3; ++e4) {
                    b6.setPosition(f5 + 32 * e4);
                    let [d4] = a4(b6, c5, { staticPosition: f5 });
                    g5.push(d4);
                  }
                  return b6.setPosition(e3 + 32), [g5, 32];
                }
                let f4 = 0, g4 = [];
                for (let h2 = 0; h2 < d3; ++h2) {
                  let [d4, h3] = a4(b6, c5, { staticPosition: e3 + f4 });
                  f4 += h3, g4.push(d4);
                }
                return [g4, f4];
              }(b5, { ...c4, type: e2 }, { length: d2, staticPosition: f3 });
            }
            if ("tuple" === c4.type) return function(b6, c5, { staticPosition: d2 }) {
              let e2 = 0 === c5.components.length || c5.components.some(({ name: a5 }) => !a5), f4 = e2 ? [] : {}, g4 = 0;
              if (q2(c5)) {
                let h2 = d2 + m(b6.readBytes(32));
                for (let d3 = 0; d3 < c5.components.length; ++d3) {
                  let i2 = c5.components[d3];
                  b6.setPosition(h2 + g4);
                  let [j3, k2] = a4(b6, i2, { staticPosition: h2 });
                  g4 += k2, f4[e2 ? d3 : i2?.name] = j3;
                }
                return b6.setPosition(d2 + 32), [f4, 32];
              }
              for (let h2 = 0; h2 < c5.components.length; ++h2) {
                let i2 = c5.components[h2], [j3, k2] = a4(b6, i2, { staticPosition: d2 });
                f4[e2 ? h2 : i2?.name] = j3, g4 += k2;
              }
              return [f4, g4];
            }(b5, c4, { staticPosition: f3 });
            if ("address" === c4.type) {
              var n2 = b5;
              let a5 = n2.readBytes(32);
              return [(0, e.o)((0, l.My)((0, h.A1)(a5, -20))), 32];
            }
            if ("bool" === c4.type) return [function(a5, b6 = {}) {
              let c5 = a5;
              if (void 0 !== b6.size && ((0, k.Sl)(c5, { size: b6.size }), c5 = (0, i.B)(c5)), c5.length > 1 || c5[0] > 1) throw new j2.xO(c5);
              return !!c5[0];
            }(b5.readBytes(32), { size: 32 }), 32];
            if (c4.type.startsWith("bytes")) return function(a5, b6, { staticPosition: c5 }) {
              let [d2, e2] = b6.type.split("bytes");
              if (!e2) {
                let b7 = m(a5.readBytes(32));
                a5.setPosition(c5 + b7);
                let d3 = m(a5.readBytes(32));
                if (0 === d3) return a5.setPosition(c5 + 32), ["0x", 32];
                let e3 = a5.readBytes(d3);
                return a5.setPosition(c5 + 32), [(0, l.My)(e3), 32];
              }
              return [(0, l.My)(a5.readBytes(Number.parseInt(e2, 10), 32)), 32];
            }(b5, c4, { staticPosition: f3 });
            if (c4.type.startsWith("uint") || c4.type.startsWith("int")) {
              var p3 = b5, r2 = c4;
              let a5 = r2.type.startsWith("int"), d2 = Number.parseInt(r2.type.split("int")[1] || "256", 10), e2 = p3.readBytes(32);
              return [d2 > 48 ? function(a6, b6 = {}) {
                void 0 !== b6.size && (0, k.Sl)(a6, { size: b6.size });
                let c5 = (0, l.My)(a6, b6);
                return (0, k.uU)(c5, b6);
              }(e2, { signed: a5 }) : m(e2, { signed: a5 }), 32];
            }
            if ("string" === c4.type) return function(a5, { staticPosition: b6 }) {
              let c5 = m(a5.readBytes(32));
              a5.setPosition(b6 + c5);
              let d2 = m(a5.readBytes(32));
              if (0 === d2) return a5.setPosition(b6 + 32), ["", 32];
              let e2 = a5.readBytes(d2, 32), f4 = function(a6, b7 = {}) {
                let c6 = a6;
                return void 0 !== b7.size && ((0, k.Sl)(c6, { size: b7.size }), c6 = (0, i.B)(c6, { dir: "right" })), new TextDecoder().decode(c6);
              }((0, i.B)(e2));
              return a5.setPosition(b6 + 32), [f4, 32];
            }(b5, { staticPosition: f3 });
            throw new d.j(c4.type, { docsPath: "/docs/contract/decodeAbiParameters" });
          }(p2, c3, { staticPosition: 0 });
          r += g2, s.push(f2);
        }
        return s;
      }
      function q2(a3) {
        let { type: b3 } = a3;
        if ("string" === b3 || "bytes" === b3 || b3.endsWith("[]")) return true;
        if ("tuple" === b3) return a3.components?.some(q2);
        let c2 = (0, o.k)(a3.type);
        return !!(c2 && q2({ ...a3, type: c2[1] }));
      }
    }, 9581: (a2, b2, c) => {
      "use strict";
      c.d(b2, { l: () => f });
      var d = c(1863);
      let e = { bytes: new Uint8Array(), dataView: new DataView(new ArrayBuffer(0)), position: 0, positionReadCount: /* @__PURE__ */ new Map(), recursiveReadCount: 0, recursiveReadLimit: 1 / 0, assertReadLimit() {
        if (this.recursiveReadCount >= this.recursiveReadLimit) throw new d.hX({ count: this.recursiveReadCount + 1, limit: this.recursiveReadLimit });
      }, assertPosition(a3) {
        if (a3 < 0 || a3 > this.bytes.length - 1) throw new d.SK({ length: this.bytes.length, position: a3 });
      }, decrementPosition(a3) {
        if (a3 < 0) throw new d.B4({ offset: a3 });
        let b3 = this.position - a3;
        this.assertPosition(b3), this.position = b3;
      }, getReadCount(a3) {
        return this.positionReadCount.get(a3 || this.position) || 0;
      }, incrementPosition(a3) {
        if (a3 < 0) throw new d.B4({ offset: a3 });
        let b3 = this.position + a3;
        this.assertPosition(b3), this.position = b3;
      }, inspectByte(a3) {
        let b3 = a3 ?? this.position;
        return this.assertPosition(b3), this.bytes[b3];
      }, inspectBytes(a3, b3) {
        let c2 = b3 ?? this.position;
        return this.assertPosition(c2 + a3 - 1), this.bytes.subarray(c2, c2 + a3);
      }, inspectUint8(a3) {
        let b3 = a3 ?? this.position;
        return this.assertPosition(b3), this.bytes[b3];
      }, inspectUint16(a3) {
        let b3 = a3 ?? this.position;
        return this.assertPosition(b3 + 1), this.dataView.getUint16(b3);
      }, inspectUint24(a3) {
        let b3 = a3 ?? this.position;
        return this.assertPosition(b3 + 2), (this.dataView.getUint16(b3) << 8) + this.dataView.getUint8(b3 + 2);
      }, inspectUint32(a3) {
        let b3 = a3 ?? this.position;
        return this.assertPosition(b3 + 3), this.dataView.getUint32(b3);
      }, pushByte(a3) {
        this.assertPosition(this.position), this.bytes[this.position] = a3, this.position++;
      }, pushBytes(a3) {
        this.assertPosition(this.position + a3.length - 1), this.bytes.set(a3, this.position), this.position += a3.length;
      }, pushUint8(a3) {
        this.assertPosition(this.position), this.bytes[this.position] = a3, this.position++;
      }, pushUint16(a3) {
        this.assertPosition(this.position + 1), this.dataView.setUint16(this.position, a3), this.position += 2;
      }, pushUint24(a3) {
        this.assertPosition(this.position + 2), this.dataView.setUint16(this.position, a3 >> 8), this.dataView.setUint8(this.position + 2, 255 & a3), this.position += 3;
      }, pushUint32(a3) {
        this.assertPosition(this.position + 3), this.dataView.setUint32(this.position, a3), this.position += 4;
      }, readByte() {
        this.assertReadLimit(), this._touch();
        let a3 = this.inspectByte();
        return this.position++, a3;
      }, readBytes(a3, b3) {
        this.assertReadLimit(), this._touch();
        let c2 = this.inspectBytes(a3);
        return this.position += b3 ?? a3, c2;
      }, readUint8() {
        this.assertReadLimit(), this._touch();
        let a3 = this.inspectUint8();
        return this.position += 1, a3;
      }, readUint16() {
        this.assertReadLimit(), this._touch();
        let a3 = this.inspectUint16();
        return this.position += 2, a3;
      }, readUint24() {
        this.assertReadLimit(), this._touch();
        let a3 = this.inspectUint24();
        return this.position += 3, a3;
      }, readUint32() {
        this.assertReadLimit(), this._touch();
        let a3 = this.inspectUint32();
        return this.position += 4, a3;
      }, get remaining() {
        return this.bytes.length - this.position;
      }, setPosition(a3) {
        let b3 = this.position;
        return this.assertPosition(a3), this.position = a3, () => this.position = b3;
      }, _touch() {
        if (this.recursiveReadLimit === 1 / 0) return;
        let a3 = this.getReadCount();
        this.positionReadCount.set(this.position, a3 + 1), a3 > 0 && this.recursiveReadCount++;
      } };
      function f(a3, { recursiveReadLimit: b3 = 8192 } = {}) {
        let c2 = Object.create(e);
        return c2.bytes = a3, c2.dataView = new DataView(a3.buffer ?? a3, a3.byteOffset, a3.byteLength), c2.positionReadCount = /* @__PURE__ */ new Map(), c2.recursiveReadLimit = b3, c2;
      }
    }, 9954: (a2, b2, c) => {
      "use strict";
      c.d(b2, { J9: () => f, Mc: () => e, fD: () => d });
      let d = { 1: "An `assert` condition failed.", 17: "Arithmetic operation resulted in underflow or overflow.", 18: "Division or modulo by zero (e.g. `5 / 0` or `23 % 0`).", 33: "Attempted to convert to an invalid type.", 34: "Attempted to access a storage byte array that is incorrectly encoded.", 49: "Performed `.pop()` on an empty array", 50: "Array index is out of bounds.", 65: "Allocated too much memory or created an array which is too large.", 81: "Attempted to call a zero-initialized variable of internal function type." }, e = { inputs: [{ name: "message", type: "string" }], name: "Error", type: "error" }, f = { inputs: [{ name: "reason", type: "uint256" }], name: "Panic", type: "error" };
    } }, (a2) => {
      a2.O(0, [237], () => a2(a2.s = 6555));
      var b2 = a2.O();
      (_ENTRIES = "undefined" == typeof _ENTRIES ? {} : _ENTRIES)["middleware_app/api/erc8004/route"] = b2;
    }]);
  }
});
var edgeFunctionHandler_exports = {};
__export2(edgeFunctionHandler_exports, {
  default: () => edgeFunctionHandler
});
function addDuplexToInit(init) {
  return typeof init === "undefined" || typeof init === "object" && init.duplex === void 0 ? { duplex: "half", ...init } : init;
}
function SubtleCrypto() {
  if (!(this instanceof SubtleCrypto)) return new SubtleCrypto();
  throw TypeError("Illegal constructor");
}
async function edgeFunctionHandler(request) {
  const path4 = new URL(request.url).pathname;
  const routes = globalThis._ROUTES;
  const correspondingRoute = routes.find((route) => route.regex.some((r) => new RegExp(r).test(path4)));
  if (!correspondingRoute) {
    throw new Error(`No route found for ${request.url}`);
  }
  const entry = await self._ENTRIES[`middleware_${correspondingRoute.name}`];
  const result = await entry.default({
    page: correspondingRoute.page,
    request: {
      ...request,
      page: {
        name: correspondingRoute.name
      }
    }
  });
  globalThis.__openNextAls.getStore()?.pendingPromiseRunner.add(result.waitUntil);
  const response = result.response;
  return response;
}
var OverrideRequest;
var init_edgeFunctionHandler = __esm2({
  async "node_modules/@opennextjs/aws/dist/core/edgeFunctionHandler.js"() {
    globalThis._ENTRIES = {};
    globalThis.self = globalThis;
    globalThis._ROUTES = [{ "name": "app/api/erc8004/route", "page": "/api/erc8004/route", "regex": ["^/api/erc8004$"] }];
    OverrideRequest = class extends Request {
      constructor(input, init) {
        super(input, addDuplexToInit(init));
      }
    };
    globalThis.Request = OverrideRequest;
    if (!globalThis.crypto) {
      globalThis.crypto = new webcrypto.Crypto();
    }
    if (!globalThis.CryptoKey) {
      globalThis.CryptoKey = webcrypto.CryptoKey;
    }
    if (!globalThis.SubtleCrypto) {
      globalThis.SubtleCrypto = SubtleCrypto;
    }
    if (!globalThis.Crypto) {
      globalThis.Crypto = webcrypto.Crypto;
    }
    if (!globalThis.URLPattern) {
      await Promise.resolve().then(() => (init_urlpattern_polyfill(), urlpattern_polyfill_exports));
    }
    require_server_reference_manifest();
    require_route_client_reference_manifest();
    require_middleware_build_manifest();
    require_middleware_react_loadable_manifest();
    require_next_font_manifest();
    require_interception_route_rewrite_manifest();
    require_edge_runtime_webpack();
    require__();
    require_route();
  }
});
init_logger();
var RequestCache = class {
  _caches = /* @__PURE__ */ new Map();
  /**
   * Returns the Map registered under `key`.
   * If no Map exists yet for that key, a new empty Map is created, stored, and returned.
   * Repeated calls with the same key always return the **same** Map instance.
   */
  getOrCreate(key) {
    let cache = this._caches.get(key);
    if (!cache) {
      cache = /* @__PURE__ */ new Map();
      this._caches.set(key, cache);
    }
    return cache;
  }
};
var DetachedPromise = class {
  resolve;
  reject;
  promise;
  constructor() {
    let resolve;
    let reject;
    this.promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    this.resolve = resolve;
    this.reject = reject;
  }
};
var DetachedPromiseRunner = class {
  promises = [];
  withResolvers() {
    const detachedPromise = new DetachedPromise();
    this.promises.push(detachedPromise);
    return detachedPromise;
  }
  add(promise) {
    const detachedPromise = new DetachedPromise();
    this.promises.push(detachedPromise);
    promise.then(detachedPromise.resolve, detachedPromise.reject);
  }
  async await() {
    debug(`Awaiting ${this.promises.length} detached promises`);
    const results = await Promise.allSettled(this.promises.map((p) => p.promise));
    const rejectedPromises = results.filter((r) => r.status === "rejected");
    rejectedPromises.forEach((r) => {
      error(r.reason);
    });
  }
};
async function awaitAllDetachedPromise() {
  const store = globalThis.__openNextAls.getStore();
  const promisesToAwait = store?.pendingPromiseRunner.await() ?? Promise.resolve();
  if (store?.waitUntil) {
    store.waitUntil(promisesToAwait);
    return;
  }
  await promisesToAwait;
}
function provideNextAfterProvider() {
  const NEXT_REQUEST_CONTEXT_SYMBOL = Symbol.for("@next/request-context");
  const VERCEL_REQUEST_CONTEXT_SYMBOL = Symbol.for("@vercel/request-context");
  const store = globalThis.__openNextAls.getStore();
  const waitUntil = store?.waitUntil ?? ((promise) => store?.pendingPromiseRunner.add(promise));
  const nextAfterContext = {
    get: () => ({
      waitUntil
    })
  };
  globalThis[NEXT_REQUEST_CONTEXT_SYMBOL] = nextAfterContext;
  if (process.env.EMULATE_VERCEL_REQUEST_CONTEXT) {
    globalThis[VERCEL_REQUEST_CONTEXT_SYMBOL] = nextAfterContext;
  }
}
function runWithOpenNextRequestContext({ isISRRevalidation, waitUntil, requestId = Math.random().toString(36) }, fn) {
  return globalThis.__openNextAls.run({
    requestId,
    pendingPromiseRunner: new DetachedPromiseRunner(),
    isISRRevalidation,
    waitUntil,
    writtenTags: /* @__PURE__ */ new Set(),
    requestCache: new RequestCache()
  }, async () => {
    provideNextAfterProvider();
    let result;
    try {
      result = await fn();
    } finally {
      await awaitAllDetachedPromise();
    }
    return result;
  });
}
init_stream();
init_config();
init_logger();
async function resolveConverter(converter) {
  if (typeof converter === "function") {
    return converter();
  }
  const m_1 = await Promise.resolve().then(() => (init_aws_apigw_v2(), aws_apigw_v2_exports));
  return m_1.default;
}
async function resolveWrapper(wrapper) {
  if (typeof wrapper === "function") {
    return wrapper();
  }
  const m_1 = await Promise.resolve().then(() => (init_aws_lambda(), aws_lambda_exports));
  return m_1.default;
}
async function createGenericHandler(handler3) {
  const config2 = await Promise.resolve().then(() => (init_open_next_config(), open_next_config_exports)).then((m) => m.default);
  globalThis.openNextConfig = config2;
  const handlerConfig = config2[handler3.type];
  const override = handlerConfig && "override" in handlerConfig ? handlerConfig.override : void 0;
  const converter = await resolveConverter(override?.converter);
  const { name, wrapper } = await resolveWrapper(override?.wrapper);
  debug("Using wrapper", name);
  return wrapper(handler3.handler, converter);
}
init_util2();
init_config();
init_logger();
init_config();
init_stream();
init_binary();
init_logger();
init_logger();
init_i18n();
init_queue();
var CACHE_ONE_YEAR = 60 * 60 * 24 * 365;
var CACHE_ONE_MONTH = 60 * 60 * 24 * 30;
init_i18n();
init_config();
init_stream();
init_logger();
init_i18n();
init_config();
var optionalLocalePrefixRegex = `^/(?:${RoutesManifest.locales.map((locale) => `${locale}/?`).join("|")})?`;
var optionalBasepathPrefixRegex = RoutesManifest.basePath ? `^${RoutesManifest.basePath}/?` : "^/";
var optionalPrefix = optionalLocalePrefixRegex.replace("^/", optionalBasepathPrefixRegex);
function routeMatcher(routeDefinitions) {
  const regexp = routeDefinitions.map((route) => ({
    page: route.page,
    regexp: new RegExp(route.regex.replace("^/", optionalPrefix))
  }));
  const appPathsSet = /* @__PURE__ */ new Set();
  const routePathsSet = /* @__PURE__ */ new Set();
  for (const [k, v2] of Object.entries(AppPathRoutesManifest)) {
    if (k.endsWith("page")) {
      appPathsSet.add(v2);
    } else if (k.endsWith("route")) {
      routePathsSet.add(v2);
    }
  }
  return function matchRoute(path4) {
    const foundRoutes = regexp.filter((route) => route.regexp.test(path4));
    return foundRoutes.map((foundRoute) => {
      let routeType = "page";
      if (appPathsSet.has(foundRoute.page)) {
        routeType = "app";
      } else if (routePathsSet.has(foundRoute.page)) {
        routeType = "route";
      }
      return {
        route: foundRoute.page,
        type: routeType
      };
    });
  };
}
var staticRouteMatcher = routeMatcher([
  ...RoutesManifest.routes.static,
  ...getStaticAPIRoutes()
]);
var dynamicRouteMatcher = routeMatcher(RoutesManifest.routes.dynamic);
function getStaticAPIRoutes() {
  const createRouteDefinition = (route) => ({
    page: route,
    regex: `^${route}(?:/)?$`
  });
  const dynamicRoutePages = new Set(RoutesManifest.routes.dynamic.map(({ page }) => page));
  const pagesStaticAPIRoutes = Object.keys(PagesManifest).filter((route) => route.startsWith("/api/") && !dynamicRoutePages.has(route)).map(createRouteDefinition);
  const appPathsStaticAPIRoutes = Object.values(AppPathRoutesManifest).filter((route) => (route.startsWith("/api/") || route === "/api") && !dynamicRoutePages.has(route)).map(createRouteDefinition);
  return [...pagesStaticAPIRoutes, ...appPathsStaticAPIRoutes];
}
init_util2();
init_config();
init_stream();
init_utils();
init_i18n();
init_util2();
var middlewareManifest = MiddlewareManifest;
var functionsConfigManifest = FunctionsConfigManifest;
var middleMatch = getMiddlewareMatch(middlewareManifest, functionsConfigManifest);
init_util2();
var MIDDLEWARE_HEADER_PREFIX = "x-middleware-response-";
var MIDDLEWARE_HEADER_PREFIX_LEN = MIDDLEWARE_HEADER_PREFIX.length;
var INTERNAL_HEADER_PREFIX = "x-opennext-";
var INTERNAL_HEADER_INITIAL_URL = `${INTERNAL_HEADER_PREFIX}initial-url`;
var INTERNAL_HEADER_LOCALE = `${INTERNAL_HEADER_PREFIX}locale`;
var INTERNAL_HEADER_RESOLVED_ROUTES = `${INTERNAL_HEADER_PREFIX}resolved-routes`;
var INTERNAL_HEADER_REWRITE_STATUS_CODE = `${INTERNAL_HEADER_PREFIX}rewrite-status-code`;
var INTERNAL_EVENT_REQUEST_ID = `${INTERNAL_HEADER_PREFIX}request-id`;
globalThis.__openNextAls = new AsyncLocalStorage();
var defaultHandler = async (internalEvent, options) => {
  globalThis.isEdgeRuntime = true;
  const requestId = globalThis.openNextConfig.middleware?.external ? internalEvent.headers[INTERNAL_EVENT_REQUEST_ID] : Math.random().toString(36);
  return runWithOpenNextRequestContext({ isISRRevalidation: false, waitUntil: options?.waitUntil, requestId }, async () => {
    const handler3 = await init_edgeFunctionHandler().then(() => edgeFunctionHandler_exports);
    const response = await handler3.default({
      headers: internalEvent.headers,
      method: internalEvent.method || "GET",
      nextConfig: {
        basePath: NextConfig.basePath,
        i18n: NextConfig.i18n,
        trailingSlash: NextConfig.trailingSlash
      },
      url: internalEvent.url,
      body: convertBodyToReadableStream(internalEvent.method, internalEvent.body)
    });
    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        responseHeaders[key] = responseHeaders[key] ? [...responseHeaders[key], value] : [value];
      } else {
        responseHeaders[key] = value;
      }
    });
    const body = response.body ?? emptyReadableStream();
    return {
      type: "core",
      statusCode: response.status,
      headers: responseHeaders,
      body,
      // Do we need to handle base64 encoded response?
      isBase64Encoded: false
    };
  });
};
var handler2 = await createGenericHandler({
  handler: defaultHandler,
  type: "middleware"
});
var edge_adapter_default = {
  fetch: handler2
};
export {
  edge_adapter_default as default,
  handler2 as handler
};
