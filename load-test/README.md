# Local load test

Safe **localhost-only** GET load test for the Evomi stack (10 VUs).

## Files

| File | Purpose |
|------|---------|
| `local-loadtest.js` | k6 script (10 VUs × 45s, FE pages + public API GETs) |
| `LOCAL_LOADTEST_NOTES.md` | Latest run report / findings |
| `last-run-summary.txt` | Machine snippet from last k6 run |
| `last-run-console.txt` | Console capture from last run |

## Run

```powershell
cd "D:\Documents\Rama\Folder Belajar\evomi-frontend"
k6 run .\load-test\local-loadtest.js
```

Requires:

- Next.js at `http://127.0.0.1:3000` (or set `$env:FE_BASE`)
- Laravel at `http://127.0.0.1:8000` (or set `$env:API_BASE`)
- [k6](https://k6.io/) on PATH (`choco install k6 -y`)

The script **refuses** `evomi.shop` / `api.evomi.shop` and other non-local hosts.
