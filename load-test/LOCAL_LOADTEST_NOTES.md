# Evomi LOCAL Load Test Notes

**Date/time:** 2026-07-31 ~17:22–17:23 WIB (UTC+7)  
**Tool:** k6 v2.1.0 (installed via Chocolatey)  
**Script:** `load-test/local-loadtest.js`  
**Scope:** Localhost only — production (`evomi.shop` / `api.evomi.shop`) was not targeted.

---

## Environment / servers before run

| Service | URL | Status |
|---------|-----|--------|
| Frontend (Next.js) | `http://127.0.0.1:3000` | **Up** (existing `next dev` PID already bound to 3000) |
| Backend (Laravel) | `http://127.0.0.1:8000` | **Up** (`php artisan serve` or equivalent already responding) |

A second `npm run dev` attempt was aborted because port 3000 was already in use by an existing Next.js process. Load test used the existing server.

---

## Test configuration

| Setting | Value |
|---------|-------|
| Virtual users (VUs) | **10** |
| Duration | **45 seconds** (+ graceful stop; wall ~60s) |
| Method | **GET only** (no register/login/checkout/cart writes) |
| FE base | `http://127.0.0.1:3000` |
| API base | `http://127.0.0.1:8000` |

### Frontend paths exercised

- `/`, `/beranda`
- `/belanja`, `/belanja/1`, `/belanja/2`
- `/artikel`, `/artikel/memilih-parfum-untuk-cuaca-tropis-indonesia`
- `/faq`, `/kontak`, `/kuis`, `/login`

### Public API GETs exercised

- `/api/products?locale=id`, `/api/products/1|2?locale=id`
- `/api/articles`, `/api/articles/{slug}`
- `/api/promos`
- `/api/quiz/questions?locale=id`
- `/api/payment-settings`

---

## Summary metrics (k6)

| Metric | Value |
|--------|-------|
| Total HTTP requests | **60** |
| Completed iterations | **30** |
| HTTP failed rate | **0%** (0 failed checks / 0 connection errors) |
| Custom error rate | **0%** |
| Latency avg | **~8,669 ms** |
| Latency median | **~6,408 ms** |
| Latency **p95** | **~23,458 ms** |
| Latency p99 | **~28,194 ms** |
| Latency max | **~28,640 ms** |
| Threshold `http_req_duration` p95 &lt; 8s | **FAILED** (k6 exit code 99) |
| Threshold `http_req_failed` rate &lt; 25% | **PASSED** |

Raw snippet also saved at `load-test/last-run-summary.txt`. Console capture: `load-test/last-run-console.txt`.

**Throughput note:** Only ~1.3 req/s across 10 VUs because responses were very slow under concurrent Next.js load — VUs spent most of the time waiting.

---

## Errors found

### Hard errors (status / connection)

- **None.** No `connection refused`, timeouts that failed the request, 4xx, or 5xx observed in the k6 run.
- All checks for `status is 2xx/3xx` passed.
- Pre-flight and post-run probes also returned **200** for FE pages and public API endpoints.

### Soft / performance findings (important)

1. **Severe latency under 10 concurrent VUs**
   - p95 ≈ **23.5 s**, max ≈ **28.6 s**.
   - Soft threshold `p(95) < 8000ms` was crossed → k6 reported threshold failure (not an HTTP error).

2. **Frontend is the bottleneck; API is comparatively healthy**
   - Post-run sequential probe (1 client, no concurrency):

   | Target | Status | Latency |
   |--------|--------|---------|
   | FE `/` | 200 | ~2,402 ms |
   | FE `/beranda` | 200 | ~2,146 ms |
   | FE `/belanja` | 200 | ~829 ms |
   | FE `/artikel` | 200 | ~1,118 ms |
   | API `/api/products` | 200 | ~205 ms |
   | API `/api/articles` | 200 | ~218 ms |
   | API `/api/promos` | 200 | ~168 ms |
   | API `/api/quiz/questions` | 200 | ~181 ms |

   Under concurrency, Next.js `next dev` (Turbopack) latency balloons far beyond single-user times. Laravel API stayed in the ~150–250 ms range when probed alone.

3. **Homepage payload is large**
   - `/` ≈ **205 KB** HTML in a single response (dev mode / RSC payload). Contributes to slow TTFB + transfer under load.

4. **Dev-server caveat**
   - Results reflect **local development** servers, not production Node/`php-fpm`/CDN. Do **not** treat these latencies as live-site SLOs.

---

## Recommendations

1. **Treat this run as a local stability smoke test, not a capacity benchmark.** Re-run against a production-like build (`next start` + tuned PHP/MySQL) if you need real capacity numbers.
2. **If local UX feels sluggish with a few tabs open:** expected under `next dev` + concurrent compiles; prefer fewer concurrent heavy pages or use `next build && next start` for local performance checks.
3. **Investigate FE first:** large homepage HTML, SSR/data-fetch waterfalls, and Turbopack compile stalls under parallel routes.
4. **API looks fine for public GETs** at this load; no need to chase Laravel for this 10-VU GET scenario.
5. **Keep load tests GET-only** against localhost; never point this script at `evomi.shop` / `api.evomi.shop` (script refuses those hosts).
6. **Optional next runs:** raise duration to 2–5 minutes, or split FE-only vs API-only scenarios to isolate metrics more cleanly.

---

## How to re-run

Prerequisites: frontend on `:3000`, backend on `:8000`, k6 on PATH.

```powershell
# From frontend repo root
cd "D:\Documents\Rama\Folder Belajar\evomi-frontend"

# Optional overrides
# $env:FE_BASE = "http://127.0.0.1:3000"
# $env:API_BASE = "http://127.0.0.1:8000"

k6 run .\load-test\local-loadtest.js
```

If k6 is missing after a new shell:

```powershell
choco install k6 -y
# then open a new PowerShell, or refresh PATH
```

Start servers if needed:

```powershell
# Terminal A — frontend
cd "D:\Documents\Rama\Folder Belajar\evomi-frontend"
npm run dev

# Terminal B — backend
cd "D:\Documents\Rama\Folder Belajar\evomi-backend"
php artisan serve
```
