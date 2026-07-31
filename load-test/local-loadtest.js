/**
 * Evomi LOCAL load test (k6)
 *
 * Targets localhost ONLY — refuses production hosts.
 * 10 VUs, ~45s, GET-only visitor paths (pages + public API).
 *
 * Run (PowerShell):
 *   k6 run load-test/local-loadtest.js
 *
 * Optional env overrides:
 *   $env:FE_BASE="http://127.0.0.1:3000"
 *   $env:API_BASE="http://127.0.0.1:8000"
 *   k6 run load-test/local-loadtest.js
 */

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

const FE_BASE = __ENV.FE_BASE || "http://127.0.0.1:3000";
const API_BASE = __ENV.API_BASE || "http://127.0.0.1:8000";

const BLOCKED_HOST_FRAGMENTS = [
  "evomi.shop",
  "api.evomi.shop",
  "vercel.app",
];

function assertLocalOnly(url) {
  const lower = String(url).toLowerCase();
  for (const frag of BLOCKED_HOST_FRAGMENTS) {
    if (lower.includes(frag)) {
      throw new Error(
        `Refusing non-local target: ${url}. This load test is localhost-only.`
      );
    }
  }
  if (
    !lower.includes("127.0.0.1") &&
    !lower.includes("localhost")
  ) {
    throw new Error(
      `Refusing non-local target: ${url}. Use 127.0.0.1 or localhost.`
    );
  }
}

assertLocalOnly(FE_BASE);
assertLocalOnly(API_BASE);

const errorRate = new Rate("errors");
const feLatency = new Trend("fe_latency_ms", true);
const apiLatency = new Trend("api_latency_ms", true);
const httpFails = new Counter("http_fails");

export const options = {
  vus: 10,
  duration: "45s",
  thresholds: {
    // Soft thresholds — report failures without hard-aborting the run
    http_req_failed: ["rate<0.25"],
    errors: ["rate<0.25"],
    http_req_duration: ["p(95)<8000"],
  },
  summaryTrendStats: ["avg", "min", "med", "p(90)", "p(95)", "p(99)", "max"],
};

const FE_PATHS = [
  "/",
  "/beranda",
  "/belanja",
  "/belanja/1",
  "/belanja/2",
  "/artikel",
  "/artikel/memilih-parfum-untuk-cuaca-tropis-indonesia",
  "/faq",
  "/kontak",
  "/kuis",
  "/login",
];

const API_PATHS = [
  "/api/products?locale=id",
  "/api/products/1?locale=id",
  "/api/products/2?locale=id",
  "/api/articles",
  "/api/articles/memilih-parfum-untuk-cuaca-tropis-indonesia",
  "/api/promos",
  "/api/quiz/questions?locale=id",
  "/api/payment-settings",
];

const PARAMS = {
  timeouts: "30s",
  headers: {
    Accept: "text/html,application/json,*/*",
    "User-Agent": "evomi-local-loadtest/k6",
  },
  tags: {},
};

function hit(url, kind) {
  assertLocalOnly(url);
  const res = http.get(url, {
    ...PARAMS,
    tags: { kind },
  });
  const ok = check(res, {
    "status is 2xx/3xx": (r) => r.status >= 200 && r.status < 400,
  });
  errorRate.add(!ok);
  if (!ok) {
    httpFails.add(1);
  }
  if (kind === "fe") {
    feLatency.add(res.timings.duration);
  } else {
    apiLatency.add(res.timings.duration);
  }
  return res;
}

export default function () {
  group("frontend_pages", () => {
    const path = FE_PATHS[Math.floor(Math.random() * FE_PATHS.length)];
    hit(`${FE_BASE}${path}`, "fe");
  });

  sleep(0.3 + Math.random() * 0.5);

  group("public_api", () => {
    const path = API_PATHS[Math.floor(Math.random() * API_PATHS.length)];
    hit(`${API_BASE}${path}`, "api");
  });

  sleep(0.4 + Math.random() * 0.6);
}

export function handleSummary(data) {
  const httpReqs = data.metrics.http_reqs;
  const failed = data.metrics.http_req_failed;
  const duration = data.metrics.http_req_duration;
  const errors = data.metrics.errors;
  const fails = data.metrics.http_fails;

  const lines = [
    "# k6 auto summary (machine-readable snippet)",
    `fe_base=${FE_BASE}`,
    `api_base=${API_BASE}`,
    `vus=10`,
    `duration=45s`,
    `http_reqs=${httpReqs ? httpReqs.values.count : 0}`,
    `http_req_failed_rate=${failed ? failed.values.rate : "n/a"}`,
    `error_rate=${errors ? errors.values.rate : "n/a"}`,
    `http_fails=${fails ? fails.values.count : 0}`,
    `latency_avg_ms=${duration ? duration.values.avg : "n/a"}`,
    `latency_med_ms=${duration ? duration.values.med : "n/a"}`,
    `latency_p95_ms=${duration ? duration.values["p(95)"] : "n/a"}`,
    `latency_p99_ms=${duration ? duration.values["p(99)"] : "n/a"}`,
    `latency_max_ms=${duration ? duration.values.max : "n/a"}`,
    "",
  ];

  return {
    stdout: textSummary(data, { indent: " ", enableColors: true }),
    "load-test/last-run-summary.txt": lines.join("\n"),
  };
}

function textSummary(data, opts) {
  // Minimal inline summary so the script has no external jslib dependency.
  const m = data.metrics;
  const fmt = (n) => (typeof n === "number" ? n.toFixed(2) : String(n));
  const d = m.http_req_duration ? m.http_req_duration.values : {};
  const f = m.http_req_failed ? m.http_req_failed.values : {};
  const r = m.http_reqs ? m.http_reqs.values : {};
  return [
    "",
    "=== Evomi LOCAL load test summary ===",
    `FE:  ${FE_BASE}`,
    `API: ${API_BASE}`,
    `Requests: ${r.count || 0}  |  failed rate: ${fmt(f.rate || 0)}`,
    `Latency ms — avg ${fmt(d.avg)} | med ${fmt(d.med)} | p95 ${fmt(d["p(95)"])} | p99 ${fmt(d["p(99)"])} | max ${fmt(d.max)}`,
    "",
  ].join("\n");
}
