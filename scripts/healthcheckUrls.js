#!/usr/bin/env node
// Checks every URL in src/data/resources.json with a HEAD request.
// Usage: node scripts/healthcheckUrls.js

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const resources = JSON.parse(
  readFileSync(join(__dirname, '../src/data/resources.json'), 'utf-8')
);

const TIMEOUT_MS = 10_000;
const CONCURRENCY = 5;

async function check(resource) {
  const { name, url } = resource;
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { 'User-Agent': 'Arrive-Healthcheck/1.0' },
    });
    const ok = res.status < 400;
    const label = ok ? 'PASS' : 'FAIL';
    console.log(`${label}  ${res.status}  ${name}\n       ${url}`);
    return ok;
  } catch (err) {
    const reason = err.name === 'TimeoutError' ? 'timeout' : err.message;
    console.log(`FAIL  ERR  ${name}\n       ${url}\n       ${reason}`);
    return false;
  }
}

async function runWithConcurrency(items, fn, limit) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const item = items[i++];
      results.push(await fn(item));
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

console.log(`\nArrive URL Healthcheck — ${resources.length} resources\n${'─'.repeat(60)}`);

const results = await runWithConcurrency(resources, check, CONCURRENCY);

const passing = results.filter(Boolean).length;
const failing = results.length - passing;

console.log(`\n${'─'.repeat(60)}`);
console.log(`Total checked: ${results.length}`);
console.log(`Passing:       ${passing}`);
console.log(`Failing:       ${failing}`);
process.exit(failing > 0 ? 1 : 0);
