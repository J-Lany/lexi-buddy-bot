// Test-only env preload. Loaded via `--import` BEFORE any test module (and
// therefore before src/config/env.ts, which validates required env at
// import time). CI has no .env file and doesn't set these, so without this
// preload every test file that transitively imports config/env.ts fails
// immediately with "Missing env: ...".
//
// `??=` only fills a value that is not already set, so real env vars
// (local .env, CI secrets) always win — this never overrides anything.
// These are fake, non-functional placeholders: no real Telegram/Upstash
// calls are made by the unit tests that need this preload.
process.env.NODE_ENV ??= "test";
process.env.TELEGRAM_BOT_TOKEN ??= "test-telegram-token";
process.env.BACKEND_BASE_URL ??= "http://127.0.0.1:4000";
process.env.TELEGRAM_BOT_INTERNAL_TOKEN ??= "test-internal-token";
process.env.UPSTASH_REDIS_REST_URL ??= "http://127.0.0.1:8079";
process.env.UPSTASH_REDIS_REST_TOKEN ??= "test-upstash-token";
