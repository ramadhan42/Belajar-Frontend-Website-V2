#!/usr/bin/env node
/**
 * Verify that CSS/JS referenced by https://evomi.shop HTML actually exist.
 * Usage: node scripts/verify-live-assets.mjs [url]
 */
const url = process.argv[2] || "https://evomi.shop/";

async function main() {
  const res = await fetch(url, { redirect: "follow" });
  const html = await res.text();
  const assets = [
    ...html.matchAll(/\/_next\/static\/[^"'\s\\]+/g),
  ].map((m) => m[0]);
  const unique = [...new Set(assets)].filter(
    (a) => a.endsWith(".css") || a.endsWith(".js") || a.includes("/media/"),
  );

  let ok = 0;
  let fail = 0;
  const failures = [];

  for (const path of unique) {
    const assetUrl = new URL(path, url).toString();
    try {
      const r = await fetch(assetUrl, { method: "HEAD", redirect: "follow" });
      if (r.ok) ok += 1;
      else {
        fail += 1;
        failures.push(`${r.status} ${path}`);
      }
    } catch (e) {
      fail += 1;
      failures.push(`ERR ${path} (${e.message})`);
    }
  }

  console.log(`Checked ${unique.length} assets from ${url}`);
  console.log(`OK: ${ok}  FAIL: ${fail}`);
  if (failures.length) {
    console.log("\nMissing/broken:");
    for (const f of failures.slice(0, 40)) console.log(" ", f);
    process.exitCode = 1;
  } else {
    console.log("All referenced assets returned OK.");
  }
}

main();
