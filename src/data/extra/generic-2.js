export default {
  'Generic Questions': {
    'Networking (Fetch API or others)': {
      junior: [
        {
          q: `What is the difference between GET and POST? What does "idempotent" mean?`,
          short: `GET reads a resource and should have no side effects; POST submits data that usually creates or changes something. Idempotent means repeating the request gives the same server state as sending it once.`,
          long: `GET puts parameters in the URL, can be cached and bookmarked, and should not change state.\nPOST sends a body, is not cached by default and is not idempotent: two POSTs may create two orders.\nPUT and DELETE are idempotent: replacing or deleting twice ends in the same state.\nPATCH is not guaranteed idempotent (e.g. "increment by 1").\nSafe methods (GET, HEAD, OPTIONS) never change state, so browsers and proxies may retry or prefetch them.\nThis matters for retries: automatically retry idempotent requests, but use an idempotency key before retrying a POST.`,
          follow: `How can you make a payment POST request safe to retry?`,
          exercises: [
            {
              task: `Name which method is idempotent.`,
              description: `Checks idempotency.`,
              code: `// GET /apps, POST /apps, PUT /apps/1, DELETE /apps/1`,
              answer: `GET, PUT, and DELETE are idempotent; repeating them gives the same result. POST may create duplicates.`,
            },
            {
              task: `Spot the problem.`,
              description: `Checks GET with side effects.`,
              code: `<a href="/api/delete?id=5">Delete</a>`,
              answer: `GET must be safe. Link prefetching or crawlers can delete data. Use a DELETE or POST request.`,
            },
            {
              easy: true,
              task: `Which method is idempotent?`,
              description: `Checks idempotency.`,
              code: `a) GET /users/1
b) POST /users`,
              answer: `a) GET; repeating it gives the same result and no new data.`,
            },
            {
              easy: true,
              task: `Pick the method for creating a resource.`,
              description: `Checks POST use.`,
              code: `// Scenario: submit a new order form.`,
              answer: `POST, because it creates new data and is not idempotent.`,
            },
          ],
        },
        {
          q: `This code sends JSON with fetch. The server gets nothing. How do you fix it?`,
          code: `fetch('/api/users', {
  method: 'POST',
  body: { name: 'Ann' },
}).then((res) => res.json());`,
          short: `fetch does not serialize objects: the body must be a string (JSON.stringify) and the Content-Type header must say application/json. Also check res.ok before parsing.`,
          long: `Passing an object as body makes fetch call toString(), sending "[object Object]".\nWithout Content-Type: application/json most servers will not parse the body as JSON.\nfetch only rejects on network errors, so a 400/500 still resolves; check res.ok.\nres.json() throws on an empty body (e.g. 204), so guard for that.\nAlways handle errors with catch or try/await.\nThis is the most common fetch mistake for people coming from axios, which serializes automatically.`,
          fix: `const res = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Ann' }),
});
if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
const user = res.status === 204 ? null : await res.json();`,
          exercises: [
            {
              task: `Fix the bug.`,
              description: `Checks JSON body and header.`,
              code: `fetch('/api', { method: 'POST', body: { name: 'Ann' } });`,
              answer: `The object is sent as "[object Object]". Stringify it and set the content type.`,
              solution: `fetch('/api', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Ann' }),
});`,
            },
            {
              task: `Predict the result.`,
              description: `Checks reading the body twice.`,
              code: `const res = await fetch('/api');
const a = await res.json();
const b = await res.text();`,
              answer: `TypeError: body already used. Read once, or use res.clone() first.`,
            },
            {
              easy: true,
              task: `Add the missing header.`,
              description: `Checks Content-Type.`,
              code: `fetch('/api', { method: 'POST', body: JSON.stringify(d) })`,
              answer: `The server needs Content-Type: application/json to parse the body.`,
              solution: `headers: { 'Content-Type': 'application/json' }`,
            },
            {
              easy: true,
              task: `Fix the body value.`,
              description: `Checks JSON.stringify.`,
              code: `body: { name: 'Ann' }`,
              answer: `fetch turns an object into '[object Object]'; stringify it.`,
              solution: `body: JSON.stringify({ name: 'Ann' })`,
            },
          ],
        },
        {
          q: `What are HTTP headers? Name some request and response headers you use often.`,
          short: `Headers are key-value metadata sent with requests and responses. Common ones: Content-Type, Accept, Authorization, Cache-Control, Set-Cookie, ETag.`,
          long: `Request: Accept (what format I want), Content-Type (what I am sending), Authorization (credentials/token), Cookie (sent automatically), If-None-Match (conditional request).\nResponse: Content-Type, Cache-Control (how long to cache), ETag/Last-Modified (validators), Set-Cookie, Location (redirects).\nCORS uses Access-Control-Allow-Origin and friends.\nSecurity headers: Content-Security-Policy, Strict-Transport-Security.\nIn JS you read them with res.headers.get('content-type'); cross-origin, only CORS-safelisted or exposed headers are readable.\nDevTools Network tab shows all headers for debugging.`,
          exercises: [
            {
              task: `Read a response header.`,
              description: `Checks the Headers API.`,
              code: `const res = await fetch('/api/list');`,
              answer: `Use headers.get; names are case-insensitive.`,
              solution: `const total = res.headers.get('X-Total-Count');`,
            },
            {
              task: `Name two common request headers.`,
              description: `Checks header basics.`,
              answer: `Authorization for credentials and Accept or Content-Type for data format.`,
            },
            {
              easy: true,
              task: `Name the request header for the token.`,
              description: `Checks Authorization.`,
              code: `Authorization: Bearer abc123`,
              answer: `Authorization carries the credentials, here a bearer token.`,
            },
            {
              easy: true,
              task: `Name the response header for the body type.`,
              description: `Checks Content-Type.`,
              code: `Content-Type: application/json`,
              answer: `Content-Type tells the client the format of the response body.`,
            },
          ],
        },
      ],
      middle: [
        {
          q: `How does HTTP caching work? How do you cache JS bundle files and the index HTML file?`,
          short: `Cache-Control sets freshness; when stale, the browser revalidates with If-None-Match/ETag and may get a 304. Hashed assets get long immutable caching; index.html gets no-cache so it always revalidates.`,
          long: `max-age=N: fresh for N seconds, served without a request.\nno-cache: may store, but must revalidate every time; no-store: never store.\nETag + If-None-Match (or Last-Modified + If-Modified-Since) enable cheap 304 responses.\nimmutable tells the browser not to revalidate even on reload.\nFingerprinted files (app.3f9a.js): Cache-Control: public, max-age=31536000, immutable.\nindex.html: Cache-Control: no-cache so new deployments are picked up and point to new hashes.\nAPI data: often private, short max-age or stale-while-revalidate; CDN uses s-maxage.`,
          follow: `What does "stale while revalidate" do?`,
          exercises: [
            {
              task: `Write cache headers for hashed bundles.`,
              description: `Checks long-lived immutable caching.`,
              code: `# app.3f9a1c.js`,
              answer: `Hashed files never change, so cache them for a year.`,
              solution: `Cache-Control: public, max-age=31536000, immutable`,
            },
            {
              task: `Write cache headers for index.html.`,
              description: `Checks revalidating HTML.`,
              code: `# index.html must pick up new deploys`,
              answer: `HTML must always be checked, so new deploys show up.`,
              solution: `Cache-Control: no-cache`,
            },
            {
              easy: true,
              task: `Add the right cache header for index.html.`,
              description: `Checks no-cache.`,
              code: `Cache-Control: ???`,
              answer: `Use no-cache, so the browser always revalidates the HTML.`,
              solution: `Cache-Control: no-cache`,
            },
            {
              easy: true,
              task: `Add the header for hashed bundles.`,
              description: `Checks immutable.`,
              code: `/app.8f3a1c.js`,
              answer: `Hashed files never change, so cache them for a year.`,
              solution: `Cache-Control: max-age=31536000, immutable`,
            },
          ],
        },
        {
          q: `This code sends a form with a file as JSON. The server gets no file. Fix it.`,
          code: `const body = JSON.stringify({ name: nameInput.value, file: fileInput.files[0] });
await fetch('/api/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body,
});`,
          short: `A File cannot be turned into JSON; it becomes an empty object. Send FormData and let the browser set the multipart Content-Type.`,
          long: `JSON.stringify on a File gives {}, so the file data is lost.
FormData builds a multipart/form-data body that can carry files and text fields.
Do not set Content-Type yourself: the browser must add the boundary string.
fetch has no upload progress events; use XMLHttpRequest upload.onprogress if you need a progress bar.
For very large files, consider chunked or direct-to-storage uploads with signed URLs.
Strong answer: fixes the body, knows the Content-Type trap and the progress limitation.`,
          fix: `const form = new FormData();
form.append('name', nameInput.value);
form.append('file', fileInput.files[0]);
await fetch('/api/upload', { method: 'POST', body: form });`,
          follow: `Why should you not set the Content-Type header with FormData?`,
          exercises: [
            {
              task: `Fix the upload.`,
              description: `Checks FormData for files.`,
              code: `fetch('/upload', {
  method: 'POST',
  body: JSON.stringify({ file: input.files[0] }),
});`,
              answer: `A File becomes {} in JSON. Send FormData.`,
              solution: `const fd = new FormData();
fd.append('file', input.files[0]);
fetch('/upload', { method: 'POST', body: fd });`,
            },
            {
              task: `Spot the bug.`,
              description: `Checks manual multipart Content-Type.`,
              code: `fetch('/upload', {
  method: 'POST', body: fd,
  headers: { 'Content-Type': 'multipart/form-data' },
});`,
              answer: `The manual header has no boundary, so the server cannot parse it. Remove it; the browser sets it.`,
            },
            {
              easy: true,
              task: `Use the right body type.`,
              description: `Checks FormData.`,
              code: `body: JSON.stringify({ file })`,
              answer: `JSON cannot carry files; use FormData.`,
              solution: `const fd = new FormData();
fd.append('file', file);`,
            },
            {
              easy: true,
              task: `Should you set Content-Type for FormData?`,
              description: `Checks multipart boundary.`,
              code: `fetch(url, { method: 'POST', body: fd })`,
              answer: `No; the browser sets multipart with the boundary itself.`,
            },
          ],
        },
        {
          q: `What is rate limiting? How should the frontend handle a 429 response?`,
          short: `The server limits how many requests a client can send. On 429, stop, wait for the Retry-After time, then retry with backoff, and reduce requests in the first place.`,
          long: `429 Too Many Requests means the client went over a limit.
The response often has a Retry-After header in seconds or as a date.
The frontend should not retry at once; wait for Retry-After, or use exponential backoff with jitter.
Show a calm message if the user must wait.
Prevent it: debounce search, cache results, avoid duplicate requests, and batch calls.
Strong answer: reads Retry-After, uses backoff with jitter and talks about reducing traffic.`,
          follow: `Why do you add random jitter to the retry delay?`,
          exercises: [
            {
              task: `Read the wait time from a 429 response.`,
              description: `Checks the Retry-After header.`,
              code: `const res = await fetch('/api');
if (res.status === 429) { /* ? */ }`,
              answer: `Retry-After gives seconds to wait before retrying.`,
              solution: `const sec = Number(res.headers.get('Retry-After')) || 1;
await new Promise(r => setTimeout(r, sec * 1000));`,
            },
            {
              task: `Spot the problem.`,
              description: `Checks retry storms.`,
              code: `async function load() {
  const res = await fetch('/api');
  if (res.status === 429) return load();
}`,
              answer: `It retries at once forever and makes rate limiting worse. Add delay, backoff, and a max retry count.`,
            },
            {
              easy: true,
              task: `Name the status code for too many requests.`,
              description: `Checks HTTP 429.`,
              code: `if (res.status === 429) {}`,
              answer: `429 means Too Many Requests, so the client is rate limited.`,
            },
            {
              easy: true,
              task: `Predict the log output.`,
              description: `Checks the Retry-After header.`,
              code: `const h = new Headers({'Retry-After':'5'});
console.log(h.get('retry-after'));`,
              answer: `It logs "5" because header names are case-insensitive and values are strings.`,
            },
          ],
        },
      ],
      senior: [
        {
          q: `Explain HTTP 2 and HTTP 3. How do they change the way we optimize the frontend?`,
          short: `HTTP/2 multiplexes many requests over one TCP connection, making sharding harmful and reducing the need for heavy concatenation; HTTP/3 runs on QUIC (UDP), removing TCP head-of-line blocking and speeding up connection setup.`,
          long: `HTTP/1.1 allowed ~6 connections per origin, so we sprited, concatenated and sharded domains.\nHTTP/2: binary framing, multiplexing, HPACK header compression; one connection per origin.\nDomain sharding now hurts: extra DNS/TLS handshakes and broken prioritization.\nTCP head-of-line blocking remains in HTTP/2: one lost packet stalls all streams.\nHTTP/3 over QUIC: per-stream loss recovery, 1-RTT (0-RTT resumption) handshakes, connection migration on network change.\nBundling still matters for compression ratio and fewer module-graph waterfalls, but granular chunks cache better.\nServer Push is dead (removed in Chrome); use 103 Early Hints and preload instead.`,
          ai: true,
          exercises: [
            {
              task: `Name a HTTP/1 trick that HTTP/2 makes less useful.`,
              description: `Checks multiplexing impact.`,
              code: `// Domain sharding, giant sprites, one huge bundle`,
              answer: `Domain sharding: HTTP/2 multiplexes many requests on one connection, so extra domains only add connection cost.`,
            },
            {
              task: `Name the main gain of HTTP/3.`,
              description: `Checks QUIC benefits.`,
              answer: `It runs over QUIC on UDP, so one lost packet does not block other streams, and setup is faster on mobile.`,
            },
            {
              easy: true,
              task: `True or false: HTTP/3 runs over TCP.`,
              description: `Checks the HTTP/3 transport.`,
              answer: `False, HTTP/3 runs over QUIC, which uses UDP.`,
            },
            {
              easy: true,
              task: `Name the HTTP/2 feature in this comment.`,
              description: `Checks multiplexing.`,
              code: `// 20 requests, one connection, all in parallel`,
              answer: `That is multiplexing: many requests share one connection at the same time.`,
            },
          ],
        },
        {
          q: `This code refreshes the token many times at once. Fix it so it refreshes only once.`,
          code: `async function api(url, init) {
  let res = await fetch(url, withToken(init));
  if (res.status === 401) {
    await refreshToken();
    res = await fetch(url, withToken(init));
  }
  return res;
}`,
          short: `Deduplicate refreshes with a single shared in-flight promise, retry each failed request once after it settles, and log out if the refresh itself fails.`,
          long: `When 10 requests get 401 at once, each calls refreshToken: 10 refreshes, and with rotating refresh tokens 9 of them fail.\nStore one refresh promise; concurrent callers await the same one.\nClear it in finally so a later expiry can refresh again.\nRetry only once to avoid infinite loops; if refresh fails, clear session and redirect to login.\nRequest bodies that are streams cannot be replayed; clone or rebuild init.\nAlso consider proactive refresh before expiry and cross-tab coordination (BroadcastChannel or Web Locks).`,
          fix: `let refreshing = null;
function refreshOnce() {
  refreshing ??= refreshToken().finally(() => { refreshing = null; });
  return refreshing;
}
async function api(url, init, retried = false) {
  const res = await fetch(url, withToken(init));
  if (res.status !== 401 || retried) return res;
  try {
    await refreshOnce();
  } catch (e) {
    logout();
    throw e;
  }
  return api(url, init, true);
}`,
          exercises: [
            {
              task: `Fix the parallel refresh.`,
              description: `Checks sharing one in-flight promise.`,
              code: `async function getToken() {
  if (expired()) token = await refresh();
  return token;
}`,
              answer: `Five calls start five refreshes. Share one pending promise.`,
              solution: `let pending = null;
async function getToken() {
  if (expired()) pending ??= refresh().finally(() => { pending = null; });
  return pending ? (token = await pending) : token;
}`,
            },
            {
              task: `Name what to do when refresh fails.`,
              description: `Checks auth failure handling.`,
              answer: `Clear the session, stop retries, and redirect to login once, not per request.`,
            },
            {
              easy: true,
              task: `Name the shared variable that holds the pending refresh.`,
              description: `Checks the single-flight idea.`,
              code: `let refreshing = null;
refreshing ??= refreshToken();`,
              answer: `It stores one shared promise, so all callers wait on the same refresh.`,
            },
            {
              easy: true,
              task: `Predict how many refresh calls happen.`,
              description: `Checks promise sharing.`,
              code: `let p;
const get = () => (p ??= fetch('/refresh'));
get(); get(); get();`,
              answer: `Only one fetch happens because later calls reuse the same promise.`,
            },
          ],
        },
        {
          q: `How do you design a strong API client for a large app? Think about errors, retries, types and logging.`,
          short: `One typed client wrapping fetch with consistent error types, timeouts, idempotent-only retries with backoff and jitter, auth handling, request IDs for tracing, and a server-state cache like TanStack Query on top.`,
          long: `Single entry point: base URL, headers, JSON handling, auth refresh; components never call fetch directly.\nNormalize errors into typed classes (NetworkError, HttpError with status and problem+json body, TimeoutError, AbortError).\nTimeouts via AbortSignal.timeout; retries only for idempotent methods and 408/429/5xx, honoring Retry-After, with jittered exponential backoff.\nValidate responses at the boundary (zod or generated types from OpenAPI).\nSend a traceparent/X-Request-Id header and report failures with that ID to Sentry/OpenTelemetry.\nCaching, dedupe and invalidation belong to TanStack Query rather than hand-rolled caches.\nCircuit-breaker or graceful degradation for non-critical widgets.`,
          ai: true,
          exercises: [
            {
              task: `Write a typed error class for HTTP.`,
              description: `Checks structured API errors.`,
              code: `if (!res.ok) throw new Error('failed'); // no status`,
              answer: `Keep status and body so callers can handle errors by type.`,
              solution: `class HttpError extends Error {
  constructor(public status: number, public body: unknown) {
    super(\`HTTP \${status}\`);
  }
}`,
            },
            {
              task: `Name which requests are safe to retry.`,
              description: `Checks retrying only idempotent calls.`,
              code: `// GET, PUT, POST /payments`,
              answer: `GET and PUT are idempotent and safe to retry. Retry POST only with an idempotency key.`,
            },
            {
              easy: true,
              task: `Name the header the client sends for JSON.`,
              description: `Checks content type.`,
              code: `fetch('/api', { method: 'POST', headers: { /* ? */ } })`,
              answer: `Send 'Content-Type': 'application/json' with a JSON body.`,
            },
            {
              easy: true,
              task: `Spot the missing error check.`,
              description: `Checks res.ok.`,
              code: `const res = await fetch('/api');
const data = await res.json();`,
              answer: `fetch does not throw on 404 or 500, so check res.ok first.`,
            },
          ],
        },
      ],
      techlead: [
        {
          q: `Frontend and backend teams often break the API for each other. What process and tools do you add?`,
          short: `Make the contract a versioned artifact (OpenAPI/GraphQL schema), generate typed clients, check breaking changes in CI, and use consumer-driven or contract tests plus deprecation policies.`,
          long: `Schema-first or code-first with the schema exported and committed; it is the source of truth.\nGenerate the TS client (openapi-typescript, orval) so drift becomes a compile error.\nCI runs a breaking-change diff (oasdiff, graphql-inspector) on every backend PR and blocks or requires a label.\nContract tests (Pact) for critical consumer flows; MSW mocks generated from the same schema.\nAdditive changes only; removals follow a deprecation window with usage telemetry.\nShared ownership: API review guild, changelog, and a named owner per endpoint.\nMeasure: number of contract incidents per quarter.`,
          ai: true,
          exercises: [
            {
              task: `Name a tool to catch API breaking changes.`,
              description: `Checks contract testing.`,
              answer: `Pact contract tests or an OpenAPI diff check like oasdiff in the backend CI.`,
            },
            {
              task: `Spot the breaking change.`,
              description: `Checks backward-compatible API evolution.`,
              code: `// v1: { name: 'Ann' }
// v2: { fullName: 'Ann' }`,
              answer: `Renaming a field breaks old clients. Add fullName and keep name until clients move.`,
            },
            {
              easy: true,
              task: `Name the file format that describes a REST API.`,
              description: `Checks API contracts.`,
              code: `# openapi.yaml
openapi: 3.0.0`,
              answer: `OpenAPI describes endpoints and types so both teams share one contract.`,
            },
            {
              easy: true,
              task: `True or false: adding an optional field is breaking.`,
              description: `Checks backward compatibility.`,
              code: `{ "id": 1, "name": "A", "nick": "Al" }`,
              answer: `False, adding an optional response field is usually backward compatible.`,
            },
          ],
        },
        {
          q: `Users on slow mobile networks say the app does not work. How do you lead the work to fix it?`,
          short: `Get field data (RUM) segmented by region/connection, find the dominant cost (latency, payload, request waterfalls), then fix with CDN/edge, fewer round trips, smaller payloads and offline-tolerant UX, tracking agreed targets.`,
          long: `Start with data: RUM (web-vitals, Navigation/Resource Timing) sliced by country, effectiveType and device.\nReproduce with DevTools throttling and real devices or WebPageTest from those regions.\nTypical causes: far origin with no CDN, chatty APIs (waterfalls), large JSON, no compression, blocking JS.\nFixes span teams: CDN and edge caching (infra), aggregated endpoints/BFF and Brotli (backend), code splitting and prefetch (frontend).\nUX: skeletons, optimistic UI, retries, offline queue for mutations.\nSet SLOs (p75 LCP and API latency per region) and review them monthly.\nCommunicate trade-offs and sequence by impact and effort.`,
          ai: true,
          exercises: [
            {
              task: `Name the DevTools setting to test slow networks.`,
              description: `Checks network throttling.`,
              answer: `Network throttling, like Slow 4G, in the Network panel, plus CPU throttling in Performance.`,
            },
            {
              task: `Add a timeout and a retry button.`,
              description: `Checks resilient UX on bad networks.`,
              code: `const res = await fetch('/api');`,
              answer: `Fail after a time limit and let users retry instead of hanging.`,
              solution: `try {
  await fetch('/api', { signal: AbortSignal.timeout(8000) });
} catch { showRetry(); }`,
            },
            {
              easy: true,
              task: `Name the browser API that shows network type.`,
              description: `Checks connection info.`,
              code: `console.log(navigator.connection?.effectiveType);`,
              answer: `navigator.connection.effectiveType returns values like "4g" or "2g".`,
            },
            {
              easy: true,
              task: `Pick the metric: users wait for the main image.`,
              description: `Checks a key web metric.`,
              code: `// Biggest image appears after 6 seconds`,
              answer: `That is a poor LCP, Largest Contentful Paint.`,
            },
          ],
        },
        {
          q: `Would you add a backend for frontend, or BFF? What are the pros and cons? Who owns it?`,
          short: `A BFF is a frontend-owned server layer that aggregates and shapes APIs, holds tokens and caches; it reduces client complexity and round trips but adds a service the frontend team must operate.`,
          long: `Benefits: aggregate many microservice calls into one, tailor payloads, keep tokens server-side (more secure than tokens in JS), centralize caching and feature flags.\nIt enables SSR and edge rendering frameworks (Next.js route handlers, Remix loaders) naturally.\nCosts: on-call, scaling, observability, latency of an extra hop, duplicated business logic risk.\nRule: the BFF does composition and presentation, never core domain rules.\nOwnership: frontend team owns it with SRE support and the same CI/CD standards.\nAlternatives: GraphQL gateway, or improving backend endpoints directly.\nDecide by pain: number of calls per screen, auth security requirements, team skills.`,
          ai: true,
          exercises: [
            {
              task: `Name two benefits of a BFF.`,
              description: `Checks backend-for-frontend value.`,
              answer: `It combines many calls into one response shaped for the UI, and keeps tokens and secrets on the server.`,
            },
            {
              task: `Name a BFF risk.`,
              description: `Checks BFF ownership trade-offs.`,
              answer: `Business logic leaks into it, and nobody owns it. The frontend team should own it and keep it thin.`,
            },
            {
              easy: true,
              task: `Spell out the BFF acronym.`,
              description: `Checks the term.`,
              code: `// BFF`,
              answer: `Backend for Frontend, a server layer built for one client.`,
            },
            {
              easy: true,
              task: `True or false: a BFF replaces the main backend.`,
              description: `Checks BFF role.`,
              code: `// browser -> BFF -> services`,
              answer: `False, it sits in front of services and shapes data for the UI.`,
            },
          ],
        },
      ],
    },

    Performance: {
      junior: [
        {
          q: `What is lazy loading? How do you lazy load images and pages?`,
          short: `Lazy loading delays loading of resources until they are needed. Use loading="lazy" on below-the-fold images and dynamic import() / React.lazy for routes.`,
          long: `Images: <img loading="lazy" width height> lets the browser defer offscreen images.\nNever lazy-load the LCP (hero) image; it delays the main content.\nAlways set width/height or aspect-ratio to avoid layout shift (CLS).\nRoutes: const Page = lazy(() => import('./Page')) inside <Suspense> creates a separate chunk.\nBundlers (Vite, webpack) split on dynamic import automatically.\niframes also support loading="lazy".`,
          exercises: [
            {
              task: `Lazy load this image.`,
              description: `Checks native lazy loading.`,
              code: `<img src="photo.jpg" alt="Event">`,
              answer: `loading lazy defers off-screen images.`,
              solution: `<img src="photo.jpg" alt="Event" loading="lazy" width="400" height="300">`,
            },
            {
              task: `Lazy load this page component.`,
              description: `Checks React.lazy and Suspense.`,
              code: `import Settings from './Settings';`,
              answer: `Split it into its own chunk loaded on demand.`,
              solution: `const Settings = lazy(() => import('./Settings'));
<Suspense fallback={<p>Loading…</p>}><Settings /></Suspense>`,
            },
            {
              easy: true,
              task: `Add the attribute for native lazy loading.`,
              description: `Checks loading attribute.`,
              code: `<img src="cat.jpg" alt="Cat">`,
              answer: `Add loading="lazy" to the img tag.`,
            },
            {
              easy: true,
              task: `Name the function that lazy loads a module.`,
              description: `Checks dynamic import.`,
              code: `const mod = await import('./chart.js');`,
              answer: `import() loads the file only when this line runs.`,
            },
          ],
        },
        {
          q: `Why does this loop freeze the page? How do you fix it?`,
          code: `const items = document.querySelectorAll('.item');
items.forEach((el) => {
  el.style.width = el.parentNode.offsetWidth / 2 + 'px';
});`,
          short: `Reading layout (offsetWidth) after each style write forces a synchronous reflow every iteration (layout thrashing). Batch reads first, then writes.`,
          long: `The browser normally batches style changes and computes layout once per frame.\nReading offsetWidth/getBoundingClientRect after a write forces immediate layout.\nInterleaving read-write in a loop causes N forced layouts.\nFix: read all values into an array, then apply all writes.\nOr use CSS (width: 50%) and avoid JS entirely.\nDevTools Performance panel shows purple "Layout" blocks with "Forced reflow" warnings.`,
          fix: `const items = [...document.querySelectorAll('.item')];
const widths = items.map((el) => el.parentNode.offsetWidth); // reads
items.forEach((el, i) => { el.style.width = widths[i] / 2 + 'px'; }); // writes
// Better: .item { width: 50%; }`,
          exercises: [
            {
              task: `Spot why the page freezes.`,
              description: `Checks long tasks on the main thread.`,
              code: `button.onclick = () => {
  for (let i = 0; i < 1e9; i++) sum += i;
};`,
              answer: `The loop blocks the main thread, so nothing paints or responds. Split it, or move it to a worker.`,
            },
            {
              task: `Split the work into chunks.`,
              description: `Checks yielding to the browser.`,
              code: `for (const item of items) process(item);`,
              answer: `Yield every few items so the page stays responsive.`,
              solution: `for (let i = 0; i < items.length; i++) {
  process(items[i]);
  if (i % 500 === 0) await scheduler.yield();
}`,
            },
            {
              easy: true,
              task: `Name the thread that this loop blocks.`,
              description: `Checks main thread.`,
              code: `for (let i = 0; i < 1e9; i++) {}`,
              answer: `It blocks the main thread, so the page cannot paint or react.`,
            },
            {
              easy: true,
              task: `Pick the API that runs code off the main thread.`,
              description: `Checks Web Workers.`,
              code: `const w = new Worker('heavy.js');`,
              answer: `A Web Worker runs heavy code on a separate thread.`,
            },
          ],
        },
        {
          q: `What is the critical rendering path? What blocks the first paint?`,
          short: `The browser must build the DOM and CSSOM, combine them into a render tree, then layout and paint. CSS in the head and synchronous scripts block the first paint.`,
          long: `The critical rendering path is the work between receiving HTML and showing pixels.
Steps: parse HTML into the DOM, parse CSS into the CSSOM, build the render tree, run layout, then paint and composite.
CSS is render-blocking: the browser will not paint until stylesheets in the head are loaded.
Classic scripts without defer or async are parser-blocking: HTML parsing stops while they download and run.
Fixes: inline small critical CSS, defer non-critical JS, avoid long chains of imports, keep the HTML small, preconnect to important origins.
Strong answer: names render-blocking vs parser-blocking resources and how to see them in the DevTools Performance panel or Lighthouse.
Weak answer: "the page is slow because of big images".`,
          follow: `Why does a font file sometimes delay text even when CSS is loaded?`,
          exercises: [
            {
              task: `Name what blocks the first paint here.`,
              description: `Checks render-blocking resources.`,
              code: `<link rel="stylesheet" href="all.css">
<script src="app.js"></script>`,
              answer: `Both: CSS blocks rendering and the sync script blocks parsing. Defer the script and inline critical CSS.`,
            },
            {
              task: `Load a print stylesheet without blocking.`,
              description: `Checks media attribute on CSS.`,
              code: `<link rel="stylesheet" href="print.css">`,
              answer: `A non-matching media query makes it non-blocking.`,
              solution: `<link rel="stylesheet" href="print.css" media="print">`,
            },
            {
              easy: true,
              task: `True or false: a normal script blocks HTML parsing.`,
              description: `Checks script blocking.`,
              code: `<script src="app.js"></script>`,
              answer: `True, the parser stops until the script is fetched and run.`,
            },
            {
              easy: true,
              task: `Add the attribute so the script does not block.`,
              description: `Checks defer.`,
              code: `<script src="app.js"></script>`,
              answer: `Add defer so it downloads in parallel and runs after parsing.`,
            },
          ],
        },
      ],
      middle: [
        {
          q: `This code reads the layout inside a loop. The page stutters. Fix it.`,
          code: `for (const el of cards) {
  const h = el.offsetHeight;
  el.style.height = h + 10 + 'px';
}`,
          short: `Each read after a write forces the browser to recalculate layout. Do all reads first, then all writes.`,
          long: `This is called layout thrashing, or forced synchronous layout.
Writing a style makes the layout dirty. Reading offsetHeight then forces the browser to calculate layout right now.
In a loop this happens once per element, so a cheap job becomes very slow.
Fix: batch reads, then batch writes. For animation, do writes in requestAnimationFrame.
DevTools shows this as purple "Layout" blocks with a "Forced reflow" warning.
Strong answer: explains read/write batching and how to spot it in the Performance panel.`,
          fix: `const heights = cards.map((el) => el.offsetHeight);
cards.forEach((el, i) => { el.style.height = heights[i] + 10 + 'px'; });`,
          follow: `Which properties force a layout when you read them?`,
          exercises: [
            {
              task: `Fix the layout thrashing.`,
              description: `Checks batching reads and writes.`,
              code: `for (const el of items) {
  el.style.width = box.offsetWidth + 'px';
}`,
              answer: `Reading offsetWidth after a write forces layout each loop. Read once, then write.`,
              solution: `const w = box.offsetWidth;
for (const el of items) el.style.width = w + 'px';`,
            },
            {
              task: `Name two properties that force layout.`,
              description: `Checks forced synchronous layout.`,
              answer: `offsetHeight and getBoundingClientRect(). Reading them after style changes forces layout.`,
            },
            {
              easy: true,
              task: `Predict which line forces layout.`,
              description: `Checks layout reads.`,
              code: `el.style.width = '10px';
const h = el.offsetHeight;`,
              answer: `The offsetHeight read forces layout right after the write.`,
            },
            {
              easy: true,
              task: `Name the API for batching DOM writes.`,
              description: `Checks frame timing.`,
              code: `requestAnimationFrame(() => { el.style.top = '0'; });`,
              answer: `requestAnimationFrame runs the write just before the next paint.`,
            },
          ],
        },
        {
          q: `How does font loading affect page speed? What do font-display and font subsetting do?`,
          short: `Web fonts can hide text or make it jump. font-display controls what shows while the font loads, and subsetting makes the files smaller.`,
          long: `Fonts are found late: the browser downloads them only after CSS is parsed and text needs them.
Without a rule, browsers may hide text for up to 3 seconds (flash of invisible text).
font-display: swap shows a fallback font at once and swaps later; optional uses the web font only if it is ready very fast.
Swapping can cause layout shift, so match fallback metrics with size-adjust and ascent-override.
Make files small: use woff2, subset to the needed characters (unicode-range), and use variable fonts instead of many weights.
Preload only the one or two most important font files.
Strong answer: covers invisible text, layout shift, subsetting and preload.`,
          follow: `Why can preloading too many fonts make the page slower?`,
          exercises: [
            {
              task: `Fix the invisible text while loading.`,
              description: `Checks font-display.`,
              code: `@font-face {
  font-family: Brand;
  src: url(brand.woff2) format('woff2');
}`,
              answer: `Add font-display: swap so fallback text shows at once.`,
              solution: `@font-face {
  font-family: Brand;
  src: url(brand.woff2) format('woff2');
  font-display: swap;
}`,
            },
            {
              task: `Preload the main font.`,
              description: `Checks font preload with crossorigin.`,
              code: `/* Brand font is needed for above-the-fold text */`,
              answer: `Font preloads need crossorigin, or the file downloads twice.`,
              solution: `<link rel="preload" href="/brand.woff2" as="font" type="font/woff2" crossorigin>`,
            },
            {
              easy: true,
              task: `Add the descriptor that shows fallback text first.`,
              description: `Checks font-display.`,
              code: `@font-face { font-family: X; src: url(x.woff2); }`,
              answer: `Add font-display: swap; to show fallback text until the font loads.`,
            },
            {
              easy: true,
              task: `Name the best font format for the web.`,
              description: `Checks WOFF2.`,
              code: `src: url(x.woff2) format('woff2');`,
              answer: `WOFF2 is the best choice because it compresses well.`,
            },
          ],
        },
        {
          q: `Explain resource hints: preload, prefetch, preconnect, and fetch priority. When do you use each?`,
          short: `preconnect warms connections to origins; preload fetches critical current-page resources early; prefetch fetches likely next-page resources at low priority; modulepreload preloads ES modules; fetchpriority adjusts priority.`,
          long: `preconnect: DNS+TCP+TLS for critical third-party origins (fonts, API); limit to a few.\ndns-prefetch: cheaper fallback, DNS only.\npreload (as=font/style/image): high-priority fetch of late-discovered critical resources; fonts need crossorigin.\nUnused preloads waste bandwidth and Chrome warns about them.\nprefetch: idle-time fetch for future navigations; Speculation Rules API can prerender whole pages.\nmodulepreload: fetches and parses module dependencies (Vite injects this).\nfetchpriority="high|low" on img/link/script fine-tunes order, e.g. the LCP image.`,
          exercises: [
            {
              task: `Pick the right hint for each case.`,
              description: `Checks preload, prefetch, preconnect.`,
              code: `// a) LCP image  b) next page JS  c) API on another domain`,
              answer: `a) preload, b) prefetch, c) preconnect. Preload is for now, prefetch for later, preconnect warms a connection.`,
            },
            {
              task: `Lower the priority of a below-fold image.`,
              description: `Checks fetchpriority.`,
              code: `<img src="footer.jpg" alt="">`,
              answer: `fetchpriority low tells the browser it can wait.`,
              solution: `<img src="footer.jpg" alt="" fetchpriority="low" loading="lazy">`,
            },
            {
              easy: true,
              task: `Pick the hint that opens a connection early.`,
              description: `Checks preconnect.`,
              code: `<link rel="?" href="https://cdn.example.com">`,
              answer: `Use rel="preconnect" to open the connection early.`,
            },
            {
              easy: true,
              task: `Pick the hint for the next page.`,
              description: `Checks prefetch.`,
              code: `<link rel="?" href="/next.js">`,
              answer: `Use rel="prefetch" to fetch it at low priority for later.`,
            },
          ],
        },
      ],
      senior: [
        {
          q: `These imports make the bundle too big. Find the problem and fix it.`,
          code: `import _ from 'lodash';
import * as Icons from '@mui/icons-material';
import moment from 'moment';
export const fmt = (d) => moment(d).format('YYYY-MM-DD');
export const uniq = (a) => _.uniq(a);
export const Logo = () => <Icons.Home />;`,
          short: `These imports pull whole libraries into the bundle (lodash CJS, all MUI icons, moment with locales). Use per-function ESM imports, deep icon imports and a lighter date lib or Intl.`,
          long: `lodash (CJS) is not tree-shakeable; use lodash-es or native code (new Set).\nNamespace import of @mui/icons-material can force processing thousands of modules; import from '@mui/icons-material/Home'.\nmoment is large and mutable and in maintenance mode; use date-fns, dayjs or Intl.DateTimeFormat.\nCheck with rollup-plugin-visualizer or vite-bundle-analyzer.\nAdd a bundle size budget in CI (size-limit) to prevent regressions.\nAlso watch for sideEffects flags and barrel files that defeat tree-shaking.`,
          fix: `import HomeIcon from '@mui/icons-material/Home';
export const fmt = (d) => new Date(d).toISOString().slice(0, 10);
export const uniq = (a) => [...new Set(a)];
export const Logo = () => <HomeIcon />;`,
          exercises: [
            {
              task: `Fix the big import.`,
              description: `Checks icon barrel imports.`,
              code: `import * as Icons from '@mui/icons-material';
<Icons.Save />`,
              answer: `The namespace import can pull thousands of icons. Import the single icon.`,
              solution: `import SaveIcon from '@mui/icons-material/Save';`,
            },
            {
              task: `Replace moment with a smaller option.`,
              description: `Checks native Intl versus heavy libs.`,
              code: `import moment from 'moment';
moment(d).format('LL');`,
              answer: `Intl.DateTimeFormat does this with no bundle cost.`,
              solution: `new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(d);`,
            },
            {
              easy: true,
              task: `Spot the import that pulls the whole library.`,
              description: `Checks tree shaking.`,
              code: `import _ from 'lodash';
_.get(a, 'b');`,
              answer: `The default import loads all of lodash; import only the needed function.`,
            },
            {
              easy: true,
              task: `Name the tool that shows bundle contents.`,
              description: `Checks bundle analysis.`,
              code: `npx webpack-bundle-analyzer stats.json`,
              answer: `webpack-bundle-analyzer shows a map of what takes space in the bundle.`,
            },
          ],
        },
        {
          q: `Lighthouse scores are good, but real user data is bad. Why? What do you do?`,
          short: `Lighthouse runs one synthetic load on a fast machine with no user interaction or cache variety; field data reflects real devices, networks, interactions and full sessions at p75. Trust field data and use RUM to find the gap.`,
          long: `Lab: single device profile, cold load, no logged-in state, no interactions, so INP is not measured.\nField: p75 over 28 days across low-end Android, slow networks, real content and third parties.\nCLS in the field accumulates during the session (late ads, infinite scroll).\nLCP differs with personalized content, A/B scripts, consent banners.\nCollect RUM with web-vitals attribution, segment by page type, device and country.\nReproduce the worst segment in the lab with matching throttling and auth.\nTrack field p75 as the KPI; Lighthouse CI is only a regression guard.`,
          ai: true,
          exercises: [
            {
              task: `Name two reasons lab and field data differ.`,
              description: `Checks lab versus real user data.`,
              answer: `Real users have slower devices and networks, and they interact with the page, which lab runs do not measure for INP.`,
            },
            {
              task: `Write code to collect real LCP.`,
              description: `Checks the web-vitals library.`,
              code: `// Send LCP, INP, CLS from real users to /rum`,
              answer: `web-vitals reports metrics from real users.`,
              solution: `import { onLCP, onINP, onCLS } from 'web-vitals';
onLCP(send); onINP(send); onCLS(send);`,
            },
            {
              easy: true,
              task: `Name the kind of data that comes from real users.`,
              description: `Checks field data.`,
              code: `// CrUX report: 28 days of visits`,
              answer: `That is field data, also called RUM.`,
            },
            {
              easy: true,
              task: `Name the library that reports Core Web Vitals.`,
              description: `Checks web-vitals.`,
              code: `import { onINP } from 'web-vitals';
onINP(console.log);`,
              answer: `The web-vitals library reports real user metrics like INP.`,
            },
          ],
        },
        {
          q: `How do you show one hundred thousand rows smoothly? What are the downsides of virtual lists?`,
          short: `Virtualize: render only visible rows plus overscan inside a scroll container with spacer height. Trade-offs: find-in-page, accessibility, variable heights and scroll restoration get harder.`,
          long: `DOM size kills style, layout and memory; 100k nodes is far too many.\nTanStack Virtual / react-window render ~30-50 rows and translate them.\nVariable heights need measurement (measureElement) and can cause jumps.\nCtrl+F cannot find unrendered rows; screen readers need aria-rowcount/aria-rowindex.\nAlternatives: pagination or server-side filtering (often better UX), content-visibility: auto for medium lists.\nKeep row components cheap and memoized; avoid heavy per-row hooks.\nAlso consider data cost: do not ship 100k rows of JSON; page from the server.`,
          ai: true,
          exercises: [
            {
              task: `Name the technique for 100k rows.`,
              description: `Checks list virtualization.`,
              code: `rows.map(r => <Row key={r.id} {...r} />)`,
              answer: `Virtualization: render only visible rows, with a library like TanStack Virtual.`,
            },
            {
              task: `Name two downsides of virtual lists.`,
              description: `Checks virtualization trade-offs.`,
              answer: `Browser find (Ctrl+F) misses hidden rows, and screen readers and dynamic row heights need extra work.`,
            },
            {
              easy: true,
              task: `Name the rows that a virtual list renders.`,
              description: `Checks windowing.`,
              code: `// 100000 rows, 20 visible`,
              answer: `Only the visible rows plus a small buffer are in the DOM.`,
            },
            {
              easy: true,
              task: `Predict the DOM row count.`,
              description: `Checks virtualization.`,
              code: `const total = 100000;
const visible = 20;`,
              answer: `About 20 rows exist in the DOM, not 100000.`,
            },
          ],
        },
      ],
      techlead: [
        {
          q: `How do you set speed limits for pages and catch slowdowns in CI for many teams?`,
          short: `Define budgets per route (JS kB, LCP, INP proxies), enforce bundle-size and Lighthouse CI checks on PRs, track field data dashboards, and assign owners with clear escalation when budgets are broken.`,
          long: `Budgets derived from field targets: e.g. p75 LCP < 2.5s, INP < 200ms, initial JS < 170kB gzip per route.\nPR-level: size-limit or bundle analyzer diff comment; Lighthouse CI with assertions and multiple runs to reduce noise.\nMain-level: nightly synthetic runs (WebPageTest/Lighthouse) storing history.\nField: RUM dashboard per team/route with alerts on p75 regressions.\nOwnership: each route has an owning team; breaking a budget requires an approved exception with expiry.\nMake it cheap to do right: shared image component, lazy route template, dependency review.\nReview trends in a monthly perf review, not ad hoc heroics.`,
          ai: true,
          exercises: [
            {
              task: `Write a Lighthouse CI budget assertion.`,
              description: `Checks performance budgets in CI.`,
              answer: `lighthouserc assertions fail the build when a metric is over budget.`,
              solution: `assert: {
  assertions: {
    'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
  },
},`,
            },
            {
              task: `Name a way to reduce noisy CI perf results.`,
              description: `Checks stable measurement.`,
              answer: `Run several times and use the median, on the same machine type each time.`,
            },
            {
              easy: true,
              task: `Name the file that holds a size limit.`,
              description: `Checks performance budget.`,
              code: `{ "path": "dist/app.js", "maxSize": "150 kB" }`,
              answer: `A size-limit or budget config fails CI when the bundle grows.`,
            },
            {
              easy: true,
              task: `True or false: budgets should be checked only locally.`,
              description: `Checks CI enforcement.`,
              answer: `False, CI must check budgets so every pull request is covered.`,
            },
          ],
        },
        {
          q: `Marketing wants five new third party scripts. How do you handle this request?`,
          short: `Require a business case and owner per script, measure each one's cost, load them after consent and after the main content (or via a tag manager with governance / Partytown), set a third-party budget and review periodically.`,
          long: `Third parties are the top cause of poor INP and privacy risk.\nEvaluate: necessity, overlap (do two tools do the same?), size, main-thread time, privacy/GDPR.\nLoad strategy: async/defer, after load or on interaction (chat widget on click), consent-gated.\nA/B tools that hide the page (anti-flicker) hurt LCP; prefer server-side experiments.\nIsolate where possible: Partytown (worker), iframes, server-side tagging.\nCSP allowlists and SRI where feasible.\nQuarterly audit: remove unused tags, report cost per tag to stakeholders.`,
          ai: true,
          exercises: [
            {
              task: `Load this script without blocking.`,
              description: `Checks async third-party loading.`,
              code: `<script src="https://tag.example.com/t.js"></script>`,
              answer: `async stops it from blocking the parser.`,
              solution: `<script src="https://tag.example.com/t.js" async></script>`,
            },
            {
              task: `Name two questions for the marketing team.`,
              description: `Checks governance of third-party scripts.`,
              answer: `What business metric does each script serve, and who owns removing it? Then measure its cost before approval.`,
            },
            {
              easy: true,
              task: `Add the attribute that loads this script without blocking.`,
              description: `Checks async.`,
              code: `<script src="https://t.example.com/tag.js"></script>`,
              answer: `Add async so it does not block parsing.`,
            },
            {
              easy: true,
              task: `Name who to ask first about a new script.`,
              description: `Checks stakeholder talk.`,
              code: `// Marketing: add 5 new trackers`,
              answer: `Ask what business goal it serves and whether the data is already collected.`,
            },
          ],
        },
        {
          q: `This speed tracking code sends the wrong data. Fix it.`,
          code: `window.addEventListener('load', () => {
  fetch('/rum', {
    method: 'POST',
    body: JSON.stringify({ load: performance.now() }),
  });
});`,
          short: `"load time" is not a user-centric metric and the fetch may be dropped. Report Core Web Vitals with web-vitals, batch them, send with sendBeacon on visibilitychange, and sample traffic.`,
          long: `onload says little about what users experience; LCP, INP, CLS and TTFB do.\nINP and CLS are final only when the page is hidden, so report on visibilitychange (hidden).\nfetch during unload can be cancelled; sendBeacon or fetch keepalive survive.\nBatch metrics in one payload and sample (e.g. 10%) to control cost.\nAdd context: route, release version, device, effectiveType for segmentation.\nUse the attribution build to know what element or interaction caused the score.`,
          fix: `import { onLCP, onINP, onCLS, onTTFB } from 'web-vitals/attribution';
const queue = [];
const sampled = Math.random() < 0.1;
const add = (m) => sampled && queue.push({ name: m.name, value: m.value, route: location.pathname, release: __RELEASE__ });
[onLCP, onINP, onCLS, onTTFB].forEach((fn) => fn(add));
addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && queue.length) {
    navigator.sendBeacon('/rum', JSON.stringify(queue.splice(0)));
  }
});`,
          exercises: [
            {
              task: `Fix the metric sending on page close.`,
              description: `Checks sendBeacon on visibilitychange.`,
              code: `window.addEventListener('unload', () => {
  fetch('/rum', { method: 'POST', body });
});`,
              answer: `unload is unreliable and fetch may be cancelled. Use visibilitychange and sendBeacon.`,
              solution: `document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') navigator.sendBeacon('/rum', body);
});`,
            },
            {
              task: `Spot the measurement bug.`,
              description: `Checks Date.now for timing.`,
              code: `const t = Date.now();
render();
console.log(Date.now() - t);`,
              answer: `Date.now is coarse and can jump. Use performance.now() or performance.mark/measure.`,
            },
            {
              easy: true,
              task: `Name the API that sends data on page close.`,
              description: `Checks sendBeacon.`,
              code: `navigator.sendBeacon('/log', JSON.stringify(data));`,
              answer: `sendBeacon queues the request reliably even when the page unloads.`,
            },
            {
              easy: true,
              task: `Predict the rounded duration.`,
              description: `Checks performance.now.`,
              code: `const t = performance.now();
console.log(Math.round(t) >= 0);`,
              answer: `It logs true because performance.now returns time since page start.`,
            },
          ],
        },
      ],
    },

    'CI/CD': {
      junior: [
        {
          q: `What is a lockfile? Why does CI use npm ci instead of npm install?`,
          short: `A lockfile records the exact version of every package. npm ci installs exactly those versions and fails if the lockfile and package.json do not match.`,
          long: `package.json allows version ranges like ^1.2.0, so two installs can get different versions.
package-lock.json pins every package, including nested ones, to one exact version.
npm ci deletes node_modules, installs only from the lockfile and never changes it, so builds are repeatable.
npm install can update the lockfile, which hides problems in CI.
Always commit the lockfile and review changes to it.
Strong answer: explains ranges, repeatable builds and why CI must not change the lockfile.`,
          follow: `What should you check when a pull request changes the lockfile a lot?`,
          exercises: [
            {
              task: `Name the difference: npm ci vs npm install.`,
              description: `Checks reproducible installs.`,
              answer: `npm ci installs exactly from the lockfile and fails if it does not match package.json; npm install can change the lockfile.`,
            },
            {
              task: `Spot the problem.`,
              description: `Checks ignoring the lockfile.`,
              code: `# .gitignore
package-lock.json`,
              answer: `Without a committed lockfile, CI installs different versions each run. Commit it.`,
            },
            {
              easy: true,
              task: `Name the file that npm ci reads.`,
              description: `Checks lockfile.`,
              code: `npm ci`,
              answer: `It reads package-lock.json for exact versions.`,
            },
            {
              easy: true,
              task: `True or false: npm ci edits the lockfile.`,
              description: `Checks npm ci rules.`,
              code: `npm ci`,
              answer: `False, npm ci fails if package.json and the lockfile disagree.`,
            },
          ],
        },
        {
          q: `Fix this GitHub Actions workflow. It should run on pull requests and use a current Node version.`,
          code: `name: CI
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/setup-node@v1
        with:
          node-version: 14
      - run: npm install
      - run: npm test`,
          short: `It never checks out code, uses an EOL Node and an old action, only runs on push, and uses npm install. Add checkout, setup-node v4 with Node 22 and caching, trigger on pull_request, and use npm ci.`,
          long: `Without actions/checkout the repo is not in the runner.\nNode 14 is end-of-life; use an active LTS (22 or 24).\nsetup-node v4 supports cache: npm for faster installs.\nTrigger on pull_request and push to main.\nnpm ci for reproducible installs.\nAdd lint and build steps so broken builds are caught.`,
          fix: `name: CI
on:
  pull_request:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build`,
          exercises: [
            {
              task: `Fix the trigger.`,
              description: `Checks pull_request events.`,
              code: `on:
  push:
    branches: [main]`,
              answer: `Add pull_request so checks run before merging.`,
              solution: `on:
  push:
    branches: [main]
  pull_request:`,
            },
            {
              task: `Use a current Node version.`,
              description: `Checks setup-node config.`,
              code: `- uses: actions/setup-node@v2
  with: { node-version: 14 }`,
              answer: `Node 14 is end of life. Use a current LTS and a newer action.`,
              solution: `- uses: actions/setup-node@v4
  with: { node-version: 22, cache: npm }`,
            },
            {
              easy: true,
              task: `Add the trigger for pull requests.`,
              description: `Checks workflow triggers.`,
              code: `on:
  # ?`,
              answer: `on:
  pull_request:`,
            },
            {
              easy: true,
              task: `Pick the checkout action line.`,
              description: `Checks workflow steps.`,
              code: `steps:
  - uses: ?`,
              answer: `Use actions/checkout@v4 to get the repository code.`,
            },
          ],
        },
        {
          q: `What is a build artifact? Why should you build once and deploy the same thing everywhere?`,
          short: `An artifact is the output of the build (e.g. dist/ or a Docker image). Building once guarantees staging and production run exactly the same code; config differs, not the bundle.`,
          long: `Rebuilding per environment can produce different outputs (dependency updates, env vars, timing).\nWhat you tested in staging should be byte-identical to production.\nStore artifacts with a version/commit SHA (actions/upload-artifact, registry, S3).\nEnvironment-specific values come from runtime config (config.json, env injected at serve time), not build-time variables.\nVite's import.meta.env values are baked in at build time, which is why runtime config matters.\nRollback = redeploy a previous artifact.`,
          exercises: [
            {
              task: `Spot the problem.`,
              description: `Checks rebuilding per environment.`,
              code: `# staging job: npm run build && deploy
# prod job: npm run build && deploy`,
              answer: `Two builds can differ. Build once, save the artifact, and deploy the same files to both.`,
            },
            {
              task: `Save the build as an artifact.`,
              description: `Checks upload-artifact.`,
              code: `# build job -> deploy-staging, deploy-prod`,
              answer: `Upload once, then download in deploy jobs.`,
              solution: `- uses: actions/upload-artifact@v4
  with: { name: dist, path: dist }`,
            },
            {
              easy: true,
              task: `Name the folder that holds the build output.`,
              description: `Checks artifacts.`,
              code: `npm run build
# creates dist/`,
              answer: `The dist folder is the build artifact to deploy.`,
            },
            {
              easy: true,
              task: `True or false: rebuild separately for each environment.`,
              description: `Checks build once.`,
              answer: `False, build once and inject config per environment.`,
            },
          ],
        },
      ],
      middle: [
        {
          q: `How do you make a GitHub Actions pipeline faster? Think about cache, parallel jobs, and matrix.`,
          short: `Cache dependencies and build tool caches, split lint/test/build into parallel jobs, shard tests with a matrix, and skip work using path filters and concurrency cancellation.`,
          long: `setup-node cache: npm caches ~/.npm keyed by lockfile.\nactions/cache for tool caches (Vite, Turbo, Playwright browsers).\nIndependent jobs (lint, typecheck, unit) run in parallel; E2E needs build.\nMatrix shards: Playwright --shard=1/4 across 4 runners.\nconcurrency with cancel-in-progress kills outdated runs on the same branch.\npaths / paths-ignore avoid running frontend CI for docs-only changes.\nMonorepos: Nx/Turborepo affected-only builds with remote cache.`,
          exercises: [
            {
              task: `Write a matrix for two Node versions.`,
              description: `Checks matrix builds.`,
              answer: `The matrix runs the job once per version in parallel.`,
              solution: `strategy:
  matrix:
    node: [20, 22]
steps:
  - uses: actions/setup-node@v4
    with: { node-version: '\${{ matrix.node }}' }`,
            },
            {
              task: `Run lint and test in parallel.`,
              description: `Checks splitting jobs.`,
              code: `jobs:
  ci:
    steps: [lint, test]`,
              answer: `Separate jobs run at the same time.`,
              solution: `jobs:
  lint: { runs-on: ubuntu-latest, steps: [...] }
  test: { runs-on: ubuntu-latest, steps: [...] }`,
            },
            {
              easy: true,
              task: `Add the cache option for npm.`,
              description: `Checks caching.`,
              code: `- uses: actions/setup-node@v4
  with:
    node-version: 20`,
              answer: `Add cache: npm under with to reuse downloaded packages.`,
            },
            {
              easy: true,
              task: `Count the jobs the matrix creates.`,
              description: `Checks matrix size.`,
              code: `matrix:
  node: [18, 20]
  os: [ubuntu, windows]`,
              answer: `It creates 4 jobs, one for each node and os pair.`,
            },
          ],
        },
        {
          q: `This workflow leaks a secret and has too many rights. Fix it.`,
          code: `on: pull_request_target
permissions: write-all
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: \${{ github.event.pull_request.head.sha }}
      - run: echo "Token is \${{ secrets.DEPLOY_TOKEN }}"
      - run: npm ci && npm test`,
          short: `pull_request_target with checkout of the PR head runs untrusted fork code with secrets and write tokens. Use pull_request, least-privilege permissions, never echo secrets, and pin third-party actions.`,
          long: `pull_request_target runs in the base repo context with secrets; checking out the PR head lets an attacker's npm scripts steal them.\nUse pull_request for building/testing untrusted code; it gets no secrets for forks.\npermissions: contents: read by default; grant more per job only when needed.\nNever print secrets; masking is not reliable for transformed values.\nInterpolating untrusted input (PR title) in run: enables script injection; pass via env.\nPin third-party actions to a commit SHA; use OIDC instead of long-lived cloud keys.`,
          fix: `on: pull_request
permissions:
  contents: read
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm test`,
          exercises: [
            {
              task: `Spot the secret leak.`,
              description: `Checks echoing secrets in logs.`,
              code: `- run: echo "Token is \${{ secrets.NPM_TOKEN }}"`,
              answer: `Do not print secrets. Pass them through env to the tool that needs them.`,
              solution: `- run: npm publish
  env:
    NODE_AUTH_TOKEN: \${{ secrets.NPM_TOKEN }}`,
            },
            {
              task: `Limit the workflow token rights.`,
              description: `Checks least-privilege permissions.`,
              code: `permissions: write-all`,
              answer: `Give only what the job needs.`,
              solution: `permissions:
  contents: read`,
            },
            {
              easy: true,
              task: `Add the permissions line for read-only access.`,
              description: `Checks token permissions.`,
              code: `permissions:
  # ?`,
              answer: `Use contents: read to give the token only read access.`,
            },
            {
              easy: true,
              task: `Name where secrets should be stored.`,
              description: `Checks secrets.`,
              code: `env:
  TOKEN: \${{ secrets.TOKEN }}`,
              answer: `Store them in GitHub Secrets and never in the repository.`,
            },
          ],
        },
        {
          q: `What are blue green and canary deployments? How do they work for a single page app?`,
          short: `Blue-green keeps two full environments and switches traffic at once; canary sends a small share of traffic to the new version and increases it while monitoring. For SPAs, it usually means switching index.html versions at the CDN/edge.`,
          long: `Blue-green: deploy to idle environment, smoke test, flip router; rollback = flip back.\nCanary: 1% -> 10% -> 100% with automated checks on error rates and vitals.\nSPA specifics: hashed assets for both versions must coexist so open tabs don't 404 on chunks.\nRoute by cookie for stickiness so a user doesn't bounce between versions.\nTag errors and RUM with the release version to compare canary vs baseline.\nFeature flags offer finer-grained progressive delivery per feature.\nHandle chunk-load errors after deploys with a reload prompt.`,
          exercises: [
            {
              task: `Name the difference: blue-green vs canary.`,
              description: `Checks deployment strategies.`,
              answer: `Blue-green switches all traffic at once to a ready copy; canary sends a small share first and grows it.`,
            },
            {
              task: `Name an SPA issue during a switch.`,
              description: `Checks old chunks after deploy.`,
              answer: `Open tabs request old chunk files. Keep previous assets available, or reload on chunk load errors.`,
            },
            {
              easy: true,
              task: `Name the strategy that sends 5 percent of users first.`,
              description: `Checks canary.`,
              code: `// 5% new, 95% old`,
              answer: `That is a canary deployment.`,
            },
            {
              easy: true,
              task: `Name the step that switches blue to green.`,
              description: `Checks traffic switch.`,
              code: `// blue=live, green=ready`,
              answer: `Switch the router or load balancer to point to green.`,
            },
          ],
        },
      ],
      senior: [
        {
          q: `Every push starts a new end-to-end run, and old runs keep going. Add concurrency control and path filters.`,
          code: `on: [push]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright test`,
          short: `Use a concurrency group per branch with cancel-in-progress so only the latest run continues, and run heavy jobs only when relevant files change.`,
          long: `Pushing three commits quickly starts three full runs; only the last one matters.
concurrency with a group per workflow and branch cancels older runs.
Do not cancel runs on main if each deploy must finish; use cancel-in-progress only for pull requests.
paths and paths-ignore skip the workflow when only docs change.
Also add a timeout so a stuck run does not use minutes for hours.
Strong answer: knows concurrency, when not to cancel, and path filters with their required-check trap.`,
          fix: `on:
  pull_request:
    paths: ['src/**', 'tests/**', 'package-lock.json']
concurrency:
  group: e2e-\${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true
jobs:
  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npx playwright test`,
          follow: `Why should deploy jobs on main usually not use cancel-in-progress?`,
          exercises: [
            {
              task: `Cancel old runs on the same branch.`,
              description: `Checks the concurrency key.`,
              code: `# 5 pushes in a row start 5 e2e runs`,
              answer: `A concurrency group with cancel-in-progress stops older runs.`,
              solution: `concurrency:
  group: e2e-\${{ github.ref }}
  cancel-in-progress: true`,
            },
            {
              task: `Skip e2e for docs-only changes.`,
              description: `Checks path filters.`,
              code: `on:
  pull_request:`,
              answer: `paths-ignore skips the workflow when only docs change.`,
              solution: `on:
  pull_request:
    paths-ignore: ['docs/**', '**/*.md']`,
            },
            {
              easy: true,
              task: `Add the key that stops duplicate runs.`,
              description: `Checks concurrency.`,
              code: `concurrency:
  group: e2e-\${{ github.ref }}`,
              answer: `Add cancel-in-progress: true to stop older runs.`,
            },
            {
              easy: true,
              task: `Add the filter for docs-only skipping.`,
              description: `Checks paths-ignore.`,
              code: `on:
  push:
    # ?`,
              answer: `Use paths-ignore: ['docs/**'] to skip docs-only pushes.`,
            },
          ],
        },
        {
          q: `How do you protect a frontend project from attacks through its dependencies and CI?`,
          short: `Lock and audit dependencies, pin actions by SHA, least-privilege tokens, OIDC instead of static secrets, provenance/attestations for artifacts, and review new dependencies and install scripts.`,
          long: `Lockfile committed, npm ci, and Dependabot/Renovate with grouped updates and minimum release age.\nnpm audit / GitHub dependency review action blocks PRs adding vulnerable packages.\nWorms like Shai-Hulud (2025) spread via postinstall scripts and stolen npm tokens: consider ignore-scripts, trusted publishing and 2FA.\nPin third-party actions to full commit SHAs; restrict allowed actions at org level.\nGITHUB_TOKEN default read-only; OIDC for cloud deploys.\nArtifact attestations (actions/attest-build-provenance) and npm provenance prove where builds came from.\nSecret scanning and push protection enabled.`,
          ai: true,
          exercises: [
            {
              task: `Pin this action safely.`,
              description: `Checks pinning actions to a SHA.`,
              code: `- uses: some-org/deploy@main`,
              answer: `A branch can change at any time. Pin to a full commit SHA.`,
              solution: `- uses: some-org/deploy@3f1c2a9b8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b # v2.1.0`,
            },
            {
              task: `Name two dependency safety checks.`,
              description: `Checks supply chain tooling.`,
              answer: `npm audit or Dependabot alerts for known CVEs, and npm ci with a lockfile so installs cannot drift.`,
            },
            {
              easy: true,
              task: `Name the npm command that finds known vulnerabilities.`,
              description: `Checks npm audit.`,
              code: `npm audit`,
              answer: `npm audit lists known vulnerable dependencies.`,
            },
            {
              easy: true,
              task: `Pick the safer action pin.`,
              description: `Checks pinning.`,
              code: `uses: actions/checkout@main`,
              answer: `Pin to a commit SHA, since a branch can change.`,
            },
          ],
        },
        {
          q: `How do you change the API and deploy the frontend so they never break each other?`,
          short: `Use expand-and-contract: ship backward-compatible backend changes first, deploy the frontend that uses them, then remove the old path later. Keep frontend tolerant of both shapes during the transition.`,
          long: `Frontend and backend deploy independently and users have old SPA versions open for hours.\nExpand: add new field/endpoint while keeping the old one.\nMigrate: frontend switches to the new contract, possibly behind a flag.\nContract: remove old field only once telemetry shows no old clients.\nNever deploy a frontend that requires an API not yet live; gate with flags or capability checks.\nVersion the client (send X-Client-Version) so backend can detect stale clients.\nForce-refresh old clients when a hard break is unavoidable.`,
          ai: true,
          exercises: [
            {
              task: `Order these changes safely.`,
              description: `Checks expand and contract.`,
              code: `// Rename field name -> fullName`,
              answer: `Backend adds fullName and keeps name; deploy frontend using fullName; then remove name later.`,
            },
            {
              task: `Write tolerant client code during the change.`,
              description: `Checks reading old and new fields.`,
              answer: `Read the new field and fall back to the old one.`,
              solution: `const fullName = dto.fullName ?? dto.name;`,
            },
            {
              easy: true,
              task: `Name the safe first step for a renamed field.`,
              description: `Checks expand-contract.`,
              code: `// API: userName -> name`,
              answer: `Add the new field first and keep the old one for a while.`,
            },
            {
              easy: true,
              task: `Predict the value with a missing field.`,
              description: `Checks tolerant reader.`,
              code: `const name = data.name ?? data.userName;`,
              answer: `It uses userName when name is missing, so both formats work.`,
            },
          ],
        },
      ],
      techlead: [
        {
          q: `Ten frontend teams share one big repository. How do you design CI and CD for them?`,
          short: `Reusable workflows and shared actions owned by a platform team, affected-only builds with remote caching, standard quality gates, independent deploys per app, and metrics on pipeline speed and reliability.`,
          long: `Nx or Turborepo with remote cache: run only affected projects.\nReusable workflows (workflow_call) encode lint/test/build/deploy; teams opt in, not copy-paste.\nCODEOWNERS and required checks per path.\nIndependent deploy units per app with their own environments and approvals.\nPipeline SLOs: p50 PR feedback < 10 min, flake rate < 1%.\nSelf-hosted or larger runners for heavy jobs; cost monitoring.\nPlatform team runs an internal "paved road" with docs and office hours.`,
          ai: true,
          exercises: [
            {
              task: `Run tasks only for changed projects.`,
              description: `Checks affected builds.`,
              answer: `Nx or Turborepo run only what changed since main.`,
              solution: `npx nx affected -t lint test build --base=origin/main`,
            },
            {
              task: `Name a way to share build results.`,
              description: `Checks remote caching.`,
              answer: `Remote cache in Nx Cloud or Turborepo, so unchanged packages reuse earlier results.`,
            },
            {
              easy: true,
              task: `Name the tool kind for affected-project builds.`,
              description: `Checks monorepo tools.`,
              code: `npx nx affected -t test`,
              answer: `Nx affected runs tasks only for projects changed by the commit.`,
            },
            {
              easy: true,
              task: `True or false: every PR should build all projects.`,
              description: `Checks monorepo CI.`,
              answer: `False, build only affected projects to save time.`,
            },
          ],
        },
        {
          q: `A config change skipped CI and caused an outage. How do you fix the process without slowing the team?`,
          short: `Run a blameless postmortem, make the safe path the easy path (config as code through the same pipeline, validation, staged rollout), protect production with required checks, and keep a documented break-glass path.`,
          long: `Postmortem focuses on systems: why was bypass possible and attractive?\nMove config into the repo or a flag system with audit logs, validation schemas and review.\nBranch protection and required status checks on main; environment protection for production.\nProgressive rollout for config too (flags percentage, canary).\nBreak-glass procedure: allowed in emergencies, logged, reviewed after.\nAutomate validation so it costs seconds, not approvals that take days.\nTrack action items to completion and share learnings.`,
          ai: true,
          exercises: [
            {
              task: `Spot the gap.`,
              description: `Checks path filters hiding risky changes.`,
              code: `on:
  pull_request:
    paths: ['src/**']`,
              answer: `Config files outside src skip CI. Include config paths, or run a fast check on every change.`,
            },
            {
              task: `Name a blameless follow-up step.`,
              description: `Checks postmortem culture.`,
              answer: `Write a blameless postmortem focused on the process gap, then add an automatic check instead of a manual rule.`,
            },
            {
              easy: true,
              task: `Name the CI check config changes should pass.`,
              description: `Checks config validation.`,
              code: `# change: config/prod.json`,
              answer: `Add schema validation and run CI on config files too.`,
            },
            {
              easy: true,
              task: `True or false: post-mortems should find a person to blame.`,
              description: `Checks blameless culture.`,
              answer: `False, blameless reviews fix the process, not blame people.`,
            },
          ],
        },
        {
          q: `Fix this release workflow. Deploys must be approved, easy to trace, and easy to undo.`,
          code: `on:
  push:
    branches: [main]
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - run: aws s3 sync dist s3://prod-bucket --delete
        env:
          AWS_ACCESS_KEY_ID: \${{ secrets.AWS_KEY }}
          AWS_SECRET_ACCESS_KEY: \${{ secrets.AWS_SECRET }}`,
          short: `It deploys every push with static keys, no approval, no versioning, and --delete removes assets old tabs still need. Use an environment with reviewers, OIDC, versioned deploy paths, keep old assets, and record the release.`,
          long: `environment: production adds required reviewers and scoped secrets.\nOIDC role replaces long-lived keys.\nUpload hashed assets without --delete (expire via lifecycle rules) so open sessions keep working.\nUpload index.html last with no-cache so the switch is atomic.\nTag the commit/create a GitHub release and send the version to Sentry for traceability.\nRollback = re-run deploy of a previous tag or restore the previous index.html.\nconcurrency: production prevents overlapping deploys.`,
          fix: `on:
  push:
    branches: [main]
permissions:
  id-token: write
  contents: write
jobs:
  release:
    runs-on: ubuntu-latest
    environment: production
    concurrency: production
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci && npm run build
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: \${{ vars.DEPLOY_ROLE_ARN }}
          aws-region: us-east-1
      - run: aws s3 sync dist/assets s3://prod-bucket/assets --cache-control "public,max-age=31536000,immutable"
      - run: aws s3 cp dist/index.html s3://prod-bucket/index.html --cache-control "no-cache"
      - run: gh release create "v\${{ github.run_number }}" --target "\${{ github.sha }}" --generate-notes
        env:
          GH_TOKEN: \${{ github.token }}`,
          exercises: [
            {
              task: `Require approval before production deploy.`,
              description: `Checks GitHub environments.`,
              code: `jobs:
  deploy:
    runs-on: ubuntu-latest`,
              answer: `An environment with required reviewers pauses for approval.`,
              solution: `jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production`,
            },
            {
              task: `Name how to make rollback fast.`,
              description: `Checks redeploying known artifacts.`,
              answer: `Keep versioned artifacts tagged by commit, and redeploy the previous one with one command.`,
            },
            {
              easy: true,
              task: `Add the key that requires approval.`,
              description: `Checks environments.`,
              code: `deploy:
  environment: production`,
              answer: `Set a required reviewer on the production environment.`,
            },
            {
              easy: true,
              task: `Pick the tag that makes deploys traceable.`,
              description: `Checks traceability.`,
              code: `docker tag app app:$GITHUB_SHA`,
              answer: `Tagging with the commit SHA links each deploy to its code.`,
            },
          ],
        },
      ],
    },

    'Testing (Unit, Integration, E2E, Visual regression, Accessibility, Performance etc)': {
      junior: [
        {
          q: `What makes a good unit test? Explain the Arrange, Act, Assert pattern.`,
          short: `A good unit test is fast, isolated, deterministic, tests one behavior and has a clear name. AAA structures it: set up data, perform the action, verify the outcome.`,
          long: `Arrange: create inputs and mocks.\nAct: call the function or trigger the event once.\nAssert: check the observable result, not internal details.\nName tests by behavior: "returns 0 for empty cart".\nNo shared mutable state between tests; each can run alone and in any order.\nDeterministic: control time and randomness.\nFailing message should explain what broke.`,
          exercises: [
            {
              task: `Label the Arrange, Act, Assert parts.`,
              description: `Checks the AAA pattern.`,
              code: `const cart = new Cart();
cart.add({ price: 5 });
expect(cart.total).toBe(5);`,
              answer: `Line 1 arranges, line 2 acts, line 3 asserts. One act per test keeps it clear.`,
            },
            {
              task: `Spot the problem.`,
              description: `Checks testing many behaviors at once.`,
              code: `test('cart', () => {
  // tests add, remove, discount, tax, checkout
});`,
              answer: `One test checks five behaviors, so a failure is unclear. Write one test per behavior with a clear name.`,
            },
            {
              easy: true,
              task: `Name the step that checks the result.`,
              description: `Checks Assert.`,
              code: `expect(add(1, 2)).toBe(3);`,
              answer: `That is the Assert step.`,
            },
            {
              easy: true,
              task: `Name the step that calls the code.`,
              description: `Checks Act.`,
              code: `const result = add(1, 2);`,
              answer: `That is the Act step.`,
            },
          ],
        },
        {
          q: `Why does this test pass when the code is broken?`,
          code: `test('loads user', () => {
  fetchUser(1).then((user) => {
    expect(user.name).toBe('Ann');
  });
});`,
          short: `The test does not return or await the promise, so it finishes before the assertion runs. Make it async and await the result.`,
          long: `The runner sees a synchronous function that returns undefined and marks it passed.\nThe assertion runs later (or never) and its failure is lost or reported elsewhere.\nUse async/await or return the promise.\nexpect.assertions(1) guarantees an assertion actually ran.\nFor rejections use await expect(p).rejects.toThrow().\nESLint rules (vitest/valid-expect, no-floating-promises) catch this.`,
          fix: `test('loads user', async () => {
  const user = await fetchUser(1);
  expect(user.name).toBe('Ann');
});`,
          exercises: [
            {
              task: `Spot why this test always passes.`,
              description: `Checks missing assertion awaiting.`,
              code: `test('saves', () => {
  save().then(r => expect(r.ok).toBe(true));
});`,
              answer: `The test ends before the promise, so failures are ignored. Return or await it.`,
              solution: `test('saves', async () => {
  expect((await save()).ok).toBe(true);
});`,
            },
            {
              task: `Spot the problem.`,
              description: `Checks tests without assertions.`,
              code: `test('formats', () => {
  format('2026-01-01');
});`,
              answer: `No assertion, so it passes unless it throws. Assert the result.`,
            },
            {
              easy: true,
              task: `Spot why this test cannot fail.`,
              description: `Checks missing assertion.`,
              code: `test('adds', () => {
  add(1, 2);
});`,
              answer: `It has no expect, so nothing is checked.`,
            },
            {
              easy: true,
              task: `Spot the missing await.`,
              description: `Checks async tests.`,
              code: `test('loads', () => {
  expect(load()).resolves.toBe(1);
});`,
              answer: `The promise is not returned or awaited, so failure may be missed.`,
            },
          ],
        },
        {
          q: `What is code coverage? Does one hundred percent coverage mean good tests?`,
          short: `Coverage measures which lines/branches ran during tests. 100% does not mean correct: tests may run code without asserting meaningful behavior.`,
          long: `Types: statement, line, branch, function coverage; branch is most useful.\nVitest: vitest run --coverage with the v8 provider.\nCoverage shows untested code, which is valuable for finding gaps.\nIt cannot show missing requirements or weak assertions.\nChasing 100% encourages testing trivial code and implementation details.\nMutation testing (Stryker) measures whether tests detect changes.`,
          exercises: [
            {
              task: `Predict coverage and spot the gap.`,
              description: `Checks coverage without real checks.`,
              code: `const div = (a, b) => a / b;
test('div', () => { div(4, 2); });`,
              answer: `100% line coverage, but nothing is asserted and division by zero is not tested.`,
            },
            {
              task: `Name a better signal than line coverage.`,
              description: `Checks test quality metrics.`,
              answer: `Mutation testing, like Stryker, shows whether tests fail when the code is broken.`,
            },
            {
              easy: true,
              task: `True or false: 100% coverage proves no bugs.`,
              description: `Checks coverage meaning.`,
              answer: `False, coverage shows executed lines, not correct behavior.`,
            },
            {
              easy: true,
              task: `Name the coverage type for if and else paths.`,
              description: `Checks branch coverage.`,
              code: `if (a) x(); else y();`,
              answer: `Branch coverage counts whether both paths ran.`,
            },
          ],
        },
      ],
      middle: [
        {
          q: `This test checks CSS classes and waits with real timers. Fix it.`,
          code: `test('shows toast then hides it', async () => {
  const { container } = render(<Toast message="Saved" />);
  expect(container.querySelector('.toast-visible')).not.toBeNull();
  await new Promise((r) => setTimeout(r, 3000));
  expect(container.querySelector('.toast-visible')).toBeNull();
});`,
          short: `It queries CSS classes and actually waits 3 seconds. Query by role/text like a user and use fake timers to advance time instantly.`,
          long: `Class names are implementation details; refactors break the test without breaking behavior.\nReal waits make suites slow and flaky.\nvi.useFakeTimers() + vi.advanceTimersByTime(3000) is instant and deterministic.\nWrap timer advancement in act so React flushes updates.\nQuery with screen.getByRole('status') or getByText.\nRestore real timers in afterEach.`,
          fix: `beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());
test('shows toast then hides it', () => {
  render(<Toast message="Saved" />);
  expect(screen.getByRole('status')).toHaveTextContent('Saved');
  act(() => { vi.advanceTimersByTime(3000); });
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});`,
          exercises: [
            {
              task: `Fix the assertion.`,
              description: `Checks asserting behavior not classes.`,
              code: `expect(btn).toHaveClass('btn--disabled');`,
              answer: `Check what users get: a disabled button.`,
              solution: `expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();`,
            },
            {
              task: `Replace the real wait with fake timers.`,
              description: `Checks vi.useFakeTimers.`,
              code: `await new Promise(r => setTimeout(r, 3000));
expect(toast).not.toBeVisible();`,
              answer: `Fake timers make the test instant and stable.`,
              solution: `vi.useFakeTimers();
act(() => vi.advanceTimersByTime(3000));
expect(toast).not.toBeVisible();`,
            },
            {
              easy: true,
              task: `Pick the better query for a button.`,
              description: `Checks Testing Library.`,
              code: `screen.getByRole('button', { name: 'Save' })`,
              answer: `Query by role and name, as users see it.`,
            },
            {
              easy: true,
              task: `Name the Jest call that enables fake timers.`,
              description: `Checks fake timers.`,
              code: `jest.useFakeTimers();`,
              answer: `jest.useFakeTimers() replaces timers so tests need no real waiting.`,
            },
          ],
        },
        {
          q: `How do you mock network calls with MSW? Why is it better than mocking fetch?`,
          short: `MSW intercepts requests at the network level with handlers describing API responses, so components use their real fetch/client code. It works in Vitest (Node) and the browser and can be reused in Storybook.`,
          long: `Mocking fetch couples tests to how the code calls fetch (axios vs fetch, URL building).\nMSW handlers: http.get('/api/users', () => HttpResponse.json([...])).\nsetupServer in Node for Vitest; setupWorker in the browser.\nOverride per test with server.use() for errors and edge cases.\nonUnhandledRequest: 'error' catches missing mocks.\nResetHandlers after each test to keep tests isolated.\nHandlers can be generated from OpenAPI to stay in sync with the contract.`,
          exercises: [
            {
              task: `Write an MSW handler.`,
              description: `Checks MSW v2 syntax.`,
              code: `// Mock GET /api/user -> { name: 'Ann' }`,
              answer: `http.get with HttpResponse.json mocks the endpoint at the network level.`,
              solution: `import { http, HttpResponse } from 'msw';
export const handlers = [
  http.get('/api/user', () => HttpResponse.json({ name: 'Ann' })),
];`,
            },
            {
              task: `Override a handler for an error test.`,
              description: `Checks server.use per test.`,
              answer: `server.use adds a handler just for this test.`,
              solution: `server.use(
  http.get('/api/user', () => new HttpResponse(null, { status: 500 })),
);`,
            },
            {
              easy: true,
              task: `Name the layer MSW intercepts.`,
              description: `Checks MSW basics.`,
              code: `http.get('/api/user', () => HttpResponse.json({ id: 1 }))`,
              answer: `MSW intercepts requests at the network level, not the fetch function.`,
            },
            {
              easy: true,
              task: `Predict the response data.`,
              description: `Checks handler result.`,
              code: `http.get('/a', () => HttpResponse.json({ ok: true }))`,
              answer: `The client receives JSON { ok: true }.`,
            },
          ],
        },
        {
          q: `How do you add automatic accessibility checks to your tests? What can they not find?`,
          short: `Use axe-core via vitest-axe/jest-axe in component tests and @axe-core/playwright in E2E. Automated tools catch roughly a third to half of issues; keyboard flow, focus management, meaningful labels and screen reader UX need manual checks.`,
          long: `Component: const results = await axe(container); expect(results).toHaveNoViolations().\nE2E: new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag22aa']).analyze().\nScan each state (modal open, errors shown), not only initial load.\nCatches: missing labels, contrast, invalid ARIA, missing alt.\nMisses: logical focus order, whether alt text is meaningful, keyboard traps in custom widgets, announcements timing.\nAdd keyboard-only Playwright tests for critical flows.\nPeriodic manual audits with NVDA/VoiceOver.`,
          exercises: [
            {
              task: `Add an axe check to a component test.`,
              description: `Checks jest-axe or vitest-axe.`,
              code: `const { container } = render(<Form />);`,
              answer: `Run axe on the rendered DOM and expect no violations.`,
              solution: `expect(await axe(container)).toHaveNoViolations();`,
            },
            {
              task: `Name two issues axe cannot find.`,
              description: `Checks limits of automated a11y.`,
              answer: `Whether alt text is meaningful and whether focus order makes sense. These need manual keyboard and screen reader checks.`,
            },
            {
              easy: true,
              task: `Name the matcher for axe in Jest.`,
              description: `Checks jest-axe.`,
              code: `expect(await axe(container)).toHaveNoViolations();`,
              answer: `toHaveNoViolations fails the test when axe finds issues.`,
            },
            {
              easy: true,
              task: `True or false: axe finds every accessibility issue.`,
              description: `Checks automation limits.`,
              answer: `False, it catches only some issues; manual testing is still needed.`,
            },
          ],
        },
      ],
      senior: [
        {
          q: `This Playwright test fails sometimes in CI. Fix it.`,
          code: `test('creates applicant', async ({ page }) => {
  await page.goto('/applicants');
  await page.click('.btn-primary');
  await page.waitForTimeout(2000);
  await page.fill('#name', 'Ann');
  await page.click('text=Save');
  const rows = await page.$$('.row');
  expect(rows.length).toBe(11);
});`,
          short: `Fixed sleeps, CSS selectors and a count depending on shared data cause flakiness. Use role locators, web-first assertions that auto-wait, and isolated test data.`,
          long: `waitForTimeout is too short on slow CI and wastes time locally.\nLocators (getByRole) auto-wait for actionability.\nexpect(locator).toHaveCount/toBeVisible retries until timeout; $$ snapshots once.\nAsserting exactly 11 rows depends on what other tests created; use unique data and assert on it.\nSeed or create data via API in a fixture; clean up afterwards.\nUse trace: 'on-first-retry' to debug CI failures.`,
          fix: `test('creates applicant', async ({ page }) => {
  const name = \`Ann \${crypto.randomUUID().slice(0, 8)}\`;
  await page.goto('/applicants');
  await page.getByRole('button', { name: 'New applicant' }).click();
  await page.getByLabel('Name').fill(name);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('row', { name })).toBeVisible();
});`,
          exercises: [
            {
              task: `Fix the flaky wait.`,
              description: `Checks Playwright auto-waiting assertions.`,
              code: `await page.waitForTimeout(2000);
expect(await page.locator('.toast').isVisible()).toBe(true);`,
              answer: `Fixed sleeps race. Use a web-first assertion that retries.`,
              solution: `await expect(page.getByRole('status')).toBeVisible();`,
            },
            {
              task: `Spot the flaky part.`,
              description: `Checks shared test data.`,
              code: `test('rename', async ({ page }) => {
  // edits the same 'Test User' as other tests
});`,
              answer: `Tests running in parallel change the same record. Create unique data per test.`,
            },
            {
              easy: true,
              task: `Replace the fixed wait with a web-first assertion.`,
              description: `Checks auto-wait.`,
              code: `await page.waitForTimeout(3000);`,
              answer: `Use expect(locator).toBeVisible(), which retries until ready.`,
            },
            {
              easy: true,
              task: `Name the Playwright option that retries failed tests.`,
              description: `Checks retries.`,
              code: `// playwright.config.ts`,
              answer: `Set retries: 2 in the config, usually only on CI.`,
            },
          ],
        },
        {
          q: `How do you do screenshot testing without too many false failures?`,
          short: `Use Playwright toHaveScreenshot or a service (Chromatic, Percy) on stable component stories, run in a fixed Docker environment, mask dynamic content, disable animations and set sensible thresholds.`,
          long: `Rendering differs across OS, fonts and GPU: generate baselines in the same container image as CI.\nStabilize: fixed dates (page.clock), mocked data, masks for avatars/timestamps, animations: 'disabled'.\nPrefer component-level snapshots (Storybook) over whole pages: smaller, clearer diffs.\nmaxDiffPixelRatio small but non-zero for anti-aliasing.\nReview diffs as part of PR; update baselines with --update-snapshots deliberately.\nCover themes, breakpoints and key states, not everything.\nTrack false-positive rate; if reviewers rubber-stamp, the suite is useless.`,
          ai: true,
          exercises: [
            {
              task: `Reduce screenshot noise.`,
              description: `Checks masking dynamic content.`,
              code: `await expect(page).toHaveScreenshot();`,
              answer: `Mask changing areas and disable animations.`,
              solution: `await expect(page).toHaveScreenshot({
  mask: [page.getByTestId('clock')],
  animations: 'disabled',
});`,
            },
            {
              task: `Name why screenshots differ between machines.`,
              description: `Checks rendering environment drift.`,
              answer: `Different fonts, OS, and GPU rendering. Run visual tests in one Docker image.`,
            },
            {
              easy: true,
              task: `Name the Playwright call for a screenshot check.`,
              description: `Checks visual assert.`,
              code: `await expect(page).toHaveScreenshot();`,
              answer: `toHaveScreenshot compares the page to a stored baseline image.`,
            },
            {
              easy: true,
              task: `Name the option that allows tiny differences.`,
              description: `Checks threshold.`,
              code: `toHaveScreenshot({ maxDiffPixels: 100 })`,
              answer: `maxDiffPixels lets a small number of pixels differ.`,
            },
          ],
        },
        {
          q: `How do you test speed automatically and keep the results stable?`,
          short: `Combine deterministic checks (bundle size) as hard gates with noisy metrics (Lighthouse, benchmarks) using multiple runs, medians, fixed hardware and trend tracking rather than single-run thresholds.`,
          long: `Bundle size is deterministic: gate PRs with size-limit.\nLighthouse CI: 3-5 runs, median, consistent throttling, same runner type.\nRuntime: Vitest bench (tinybench) for hot functions; compare against baseline with tolerance.\nPlaywright can collect performance marks and Long Animation Frames for key interactions.\nShared CI runners are noisy: use dedicated runners or relative comparisons in the same job.\nAlert on trends over several commits.\nField RUM remains the truth.`,
          ai: true,
          exercises: [
            {
              task: `Name a stable metric for perf tests.`,
              description: `Checks noise-resistant metrics.`,
              answer: `Total blocking time or bundle size are more stable than LCP in CI. Track trends, not single runs.`,
            },
            {
              task: `Write a simple timing check.`,
              description: `Checks performance.measure.`,
              answer: `Measure between marks and assert a loose limit.`,
              solution: `performance.mark('s');
renderTable(rows);
const m = performance.measure('t', 's');
expect(m.duration).toBeLessThan(200);`,
            },
            {
              easy: true,
              task: `Name the statistic that handles one-time spikes.`,
              description: `Checks median.`,
              code: `const times = [100, 102, 98, 900];`,
              answer: `Use the median or run many times, since one slow run skews averages.`,
            },
            {
              easy: true,
              task: `Predict the median.`,
              description: `Checks stability.`,
              code: `const t = [100, 102, 900];
console.log(t[1]);`,
              answer: `It logs 102, which ignores the outlier 900.`,
            },
          ],
        },
      ],
      techlead: [
        {
          q: `How do you decide what to test at each level for a new feature? How do you get the team to follow it?`,
          short: `Choose by risk and confidence per cost: pure logic in unit tests, components with real hooks and MSW in integration tests, a few critical journeys in E2E. Make it explicit in a test plan template and review it like code.`,
          long: `Testing trophy: most value in integration tests for UI.\nUnit: complex calculations, parsers, reducers.\nIntegration: user flows within a page with mocked network.\nE2E: login, submit application, payments — revenue-critical paths only.\nContract tests for API boundaries; a11y and visual checks for UI-heavy work.\nPR template asks "what did you test and why"; reviewers check tests behave like users.\nMetrics: escaped defects by level, suite time, flake rate.`,
          ai: true,
          exercises: [
            {
              task: `Pick the test level for each check.`,
              description: `Checks choosing test levels.`,
              code: `// a) date helper  b) form validation UI  c) login to checkout flow`,
              answer: `a) unit, b) integration with Testing Library, c) one e2e test for the critical path.`,
            },
            {
              task: `Name a way to make the team follow it.`,
              description: `Checks lightweight enforcement.`,
              answer: `Add a test plan section to the PR template and check it in review.`,
            },
            {
              easy: true,
              task: `Pick the test level for a pure price function.`,
              description: `Checks test pyramid.`,
              code: `const total = price(2, 10);`,
              answer: `A unit test fits best because it has no UI or network.`,
            },
            {
              easy: true,
              task: `Pick the test level for a full checkout flow.`,
              description: `Checks E2E scope.`,
              code: `// login -> cart -> pay`,
              answer: `Use a few E2E tests for critical user journeys.`,
            },
          ],
        },
        {
          q: `Fix this Playwright config for a big test suite in CI.`,
          code: `import { defineConfig } from '@playwright/test';
export default defineConfig({
  timeout: 120000,
  retries: 5,
  workers: 1,
  use: { video: 'on', trace: 'on' },
});`,
          short: `Huge timeouts and 5 retries hide flakiness, one worker makes it slow, and always-on video/trace bloats artifacts. Use parallel workers/sharding, few retries with flaky reporting, and traces only on retry.`,
          long: `retries: 5 lets broken tests pass silently; 1-2 in CI with flaky tracking is enough.\n2-minute timeouts slow feedback on real failures.\nfullyParallel with multiple workers and sharding across machines.\nforbidOnly prevents test.only from slipping into CI.\ntrace: 'on-first-retry' and video: 'retain-on-failure' keep artifacts useful and small.\nwebServer starts the app; reporter blob for merging shards.\nProjects for browsers you actually support.`,
          fix: `import { defineConfig, devices } from '@playwright/test';
const CI = !!process.env.CI;
export default defineConfig({
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  workers: CI ? '50%' : undefined,
  timeout: 30_000,
  reporter: CI ? 'blob' : 'html',
  use: { baseURL: 'http://localhost:4173', trace: 'on-first-retry', video: 'retain-on-failure' },
  webServer: { command: 'npm run preview', url: 'http://localhost:4173', reuseExistingServer: !CI },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});`,
          exercises: [
            {
              task: `Fix this config for CI.`,
              description: `Checks retries and traces in CI.`,
              code: `export default defineConfig({
  retries: 0,
  use: { trace: 'on' },
});`,
              answer: `Retry in CI only, and keep traces only for failures to save time.`,
              solution: `export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  use: { trace: 'on-first-retry' },
});`,
            },
            {
              task: `Block test.only from reaching CI.`,
              description: `Checks forbidOnly.`,
              answer: `forbidOnly fails the run if someone left test.only.`,
              solution: `forbidOnly: !!process.env.CI,`,
            },
            {
              easy: true,
              task: `Predict retries locally.`,
              description: `Checks CI-only retries.`,
              code: `retries: process.env.CI ? 2 : 0,`,
              answer: `Locally CI is unset, so retries is 0.`,
            },
            {
              easy: true,
              task: `Name the flag that fails on test.only.`,
              description: `Checks forbidOnly.`,
              code: `forbidOnly: !!process.env.CI,`,
              answer: `forbidOnly fails the CI run if test.only is left in.`,
            },
          ],
        },
        {
          q: `You get an app with no tests and many bugs after each release. What is your six month plan?`,
          short: `Start with smoke E2E tests on critical journeys and CI gates, then test every bug fix and new code, add integration test infrastructure (MSW, factories), and expand coverage where regressions cluster, measuring escaped defects.`,
          long: `Month 1: CI pipeline with lint/typecheck; 5-10 Playwright smoke tests on revenue-critical flows.\nRule: every bug fix ships with a regression test; every new feature with tests.\nMonth 2-3: test infrastructure — Vitest, Testing Library, MSW, data factories, docs and examples.\nMonth 3-4: characterization tests around risky legacy modules before refactoring.\nMonth 4-6: a11y scans, visual regression for the design system, contract tests.\nTrack: regressions per release, time to detect, suite duration and flake rate.\nCelebrate catches; budget time explicitly in sprints.`,
          ai: true,
          exercises: [
            {
              task: `Name the first tests to add.`,
              description: `Checks risk-based test priorities.`,
              code: `// No tests, bugs after every release`,
              answer: `A few e2e smoke tests for the top user flows, plus a test for each bug as it is fixed.`,
            },
            {
              task: `Name a metric to show progress.`,
              description: `Checks measuring test impact.`,
              answer: `Bugs found after release per month. It should go down as tests grow.`,
            },
            {
              easy: true,
              task: `Pick the first test target for old code.`,
              description: `Checks priorities.`,
              code: `// checkout page broke 3 times`,
              answer: `Start with tests for the most critical and buggy flows.`,
            },
            {
              easy: true,
              task: `Name one metric to track bugs after release.`,
              description: `Checks progress measure.`,
              code: `// bugs per release: 12 -> 5`,
              answer: `Escaped defects per release show whether quality is improving.`,
            },
          ],
        },
      ],
    },

    'Version Control (Git)': {
      junior: [
        {
          q: `What is the difference between git fetch and git pull?`,
          short: `git fetch downloads new commits and branches from the remote without changing your working branch; git pull is fetch plus merge (or rebase) into the current branch.`,
          long: `fetch updates remote-tracking refs like origin/main.\nYou can inspect with git log main..origin/main before integrating.\npull = fetch + merge by default; pull --rebase replays local commits on top.\nSet git config pull.rebase true (or ff only) to avoid accidental merge commits.\nfetch is always safe; pull can create conflicts.\nUse git fetch --prune to remove deleted remote branches.`,
          exercises: [
            {
              task: `Name what each command does.`,
              description: `Checks fetch versus pull.`,
              code: `git fetch origin
git pull origin main`,
              answer: `fetch downloads remote changes only; pull fetches and then merges or rebases into your branch.`,
            },
            {
              task: `See incoming commits before merging.`,
              description: `Checks inspecting fetched changes.`,
              answer: `Fetch, then compare your branch to the remote.`,
              solution: `git fetch
git log --oneline HEAD..origin/main`,
            },
            {
              easy: true,
              task: `Name the command that only downloads changes.`,
              description: `Checks git fetch.`,
              code: `git fetch origin`,
              answer: `git fetch downloads commits without changing your branch.`,
            },
            {
              easy: true,
              task: `Rewrite git pull as two commands.`,
              description: `Checks pull equals fetch+merge.`,
              code: `git pull origin main`,
              answer: `Run git fetch origin, then git merge origin/main.`,
            },
          ],
        },
        {
          q: `You committed a secret env file. Fix the repo and stop it from happening again.`,
          code: `git add .
git commit -m "add config"
git push`,
          short: `Rotate the secret immediately, remove the file from tracking and add it to .gitignore. If it was pushed, history must be rewritten (git filter-repo) but rotation is what really matters.`,
          long: `Once pushed, assume the secret is compromised; rotate it first.\ngit rm --cached .env removes it from tracking while keeping the local file.\nAdd .env to .gitignore and commit a .env.example instead.\nTo purge history use git filter-repo, then force-push and ask teammates to re-clone.\nForks and caches may still contain it, hence rotation.\nPrevention: GitHub secret scanning push protection, pre-commit hooks (gitleaks), avoid git add . blindly.`,
          fix: `# 1. Rotate the leaked credentials first
git rm --cached .env
echo ".env" >> .gitignore
cp .env .env.example   # then strip real values
git add .gitignore .env.example
git commit -m "Stop tracking .env"
# If pushed: git filter-repo --path .env --invert-paths && git push --force-with-lease`,
          exercises: [
            {
              task: `Stop tracking the env file.`,
              description: `Checks git rm --cached.`,
              code: `# .env is already committed`,
              answer: `Remove it from the index, keep the file locally, and ignore it.`,
              solution: `git rm --cached .env
echo .env >> .gitignore
git commit -m "Stop tracking .env"`,
            },
            {
              task: `Name the most important step after a leak.`,
              description: `Checks rotating secrets.`,
              answer: `Rotate the secret at once. It stays in history and clones, so deleting the file is not enough.`,
            },
            {
              easy: true,
              task: `Add the line that ignores the env file.`,
              description: `Checks gitignore.`,
              code: `# .gitignore
`,
              answer: `Add .env to .gitignore.`,
            },
            {
              easy: true,
              task: `Name the command that unstages but keeps the file.`,
              description: `Checks git rm cached.`,
              code: `git rm --cached .env`,
              answer: `It stops tracking .env and keeps the local file.`,
            },
          ],
        },
        {
          q: `What is a good commit message? Why are small commits important?`,
          short: `A good commit has a short imperative summary (~50 chars), a blank line and a body explaining why. Small focused commits are easier to review, revert and bisect.`,
          long: `Summary in imperative mood: "Fix date parsing in report filter".\nBody explains why and any side effects; the diff shows what.\nReference the ticket (e.g. [OUT-123]) per team convention.\nConventional Commits (feat:, fix:) enable automated changelogs.\nOne logical change per commit; do not mix refactors with fixes.\nSmall commits make git revert and git bisect precise.`,
          exercises: [
            {
              task: `Improve this commit message.`,
              description: `Checks clear commit messages.`,
              code: `git commit -m "fix"`,
              answer: `Say what changed and why, in the imperative mood.`,
              solution: `git commit -m "Fix crash when cart is empty"`,
            },
            {
              task: `Name a reason for small commits.`,
              description: `Checks commit size benefits.`,
              answer: `They are easy to review, revert, and find with git bisect.`,
            },
            {
              easy: true,
              task: `Pick the better commit message.`,
              description: `Checks message quality.`,
              code: `git commit -m "fix stuff"`,
              answer: `Use a clear message like "Fix login redirect on expired session".`,
            },
            {
              easy: true,
              task: `Name the verb tense most teams use.`,
              description: `Checks message style.`,
              code: `git commit -m "Add search filter"`,
              answer: `Imperative mood, like "Add" instead of "Added".`,
            },
          ],
        },
      ],
      middle: [
        {
          q: `How do you use interactive rebase to clean up a branch before a pull request?`,
          short: `git rebase -i origin/main lets you reorder, squash, fixup, reword or drop commits. Use fixup commits with --autosquash for smoother cleanup, and only rewrite branches others are not using.`,
          long: `pick keeps a commit; reword edits the message; squash/fixup merge into the previous commit; drop removes it.\ngit commit --fixup=<sha> then git rebase -i --autosquash origin/main places fixups automatically.\nAfter rewriting, push with --force-with-lease, which refuses if the remote moved.\nNever rewrite shared branches like main.\nIf something goes wrong: git rebase --abort, or git reflog to recover.\nSome teams squash-merge PRs instead, making this less necessary.`,
          exercises: [
            {
              task: `Squash fixup commits into one.`,
              description: `Checks interactive rebase actions.`,
              code: `pick a1 Add search
pick b2 fix typo
pick c3 fix lint`,
              answer: `Change the later lines to fixup, so they join the first commit.`,
              solution: `pick a1 Add search
fixup b2 fix typo
fixup c3 fix lint`,
            },
            {
              task: `Write a fixup commit for an older commit.`,
              description: `Checks --fixup with autosquash.`,
              answer: `Create a fixup commit, then autosquash it.`,
              solution: `git commit --fixup=a1
git rebase -i --autosquash main`,
            },
            {
              easy: true,
              task: `Start an interactive rebase of the last 3 commits.`,
              description: `Checks rebase command.`,
              code: `git rebase -i ?`,
              answer: `Run git rebase -i HEAD~3.`,
            },
            {
              easy: true,
              task: `Name the word that merges a commit upward.`,
              description: `Checks squash.`,
              code: `pick a1b2 Add form
? c3d4 Fix typo`,
              answer: `Use squash (or fixup) on the second line.`,
            },
          ],
        },
        {
          q: `The gitignore file does not hide node modules and dist. Fix it.`,
          code: `# .gitignore
/node_modules
dist/
.env
# but git status still shows node_modules/ and dist/ changes`,
          short: `.gitignore only affects untracked files; these were already committed. Remove them from the index with git rm -r --cached and commit.`,
          long: `Once a file is tracked, ignore rules do not apply to it.\ngit rm -r --cached node_modules dist untracks them while leaving them on disk.\nCommit the removal; afterwards they stay ignored.\nUse git check-ignore -v <path> to debug which rule applies.\nLeading / anchors to the .gitignore's directory; node_modules/ (no slash) matches at any depth in monorepos.\nGlobal ignores (OS files, editor folders) belong in core.excludesFile.`,
          fix: `# .gitignore
node_modules/
dist/
.env

git rm -r --cached node_modules dist
git commit -m "Stop tracking build output and dependencies"`,
          exercises: [
            {
              task: `Fix the gitignore.`,
              description: `Checks ignoring already tracked files.`,
              code: `# .gitignore
node_modules/
dist/
# but dist is still tracked`,
              answer: `gitignore does not affect tracked files. Remove them from the index.`,
              solution: `git rm -r --cached dist node_modules
git commit -m "Untrack build output"`,
            },
            {
              task: `Predict which files are ignored.`,
              description: `Checks gitignore patterns.`,
              code: `/dist
*.log
!keep.log`,
              answer: `Root dist folder and all .log files, except keep.log, which ! includes again.`,
            },
            {
              easy: true,
              task: `Write the pattern that ignores node_modules.`,
              description: `Checks gitignore pattern.`,
              code: `# .gitignore
`,
              answer: `Add node_modules/ to .gitignore.`,
            },
            {
              easy: true,
              task: `Name the command to check why a file is ignored.`,
              description: `Checks check-ignore.`,
              code: `git check-ignore -v dist/app.js`,
              answer: `It prints the ignore rule that matches the file.`,
            },
          ],
        },
        {
          q: `What is git stash? When do you use git cherry pick?`,
          short: `stash shelves uncommitted changes so you can switch context and reapply later. cherry-pick applies a specific commit from another branch onto the current one, e.g. backporting a fix to a release branch.`,
          long: `git stash push -m "msg" saves changes; git stash pop reapplies and drops; apply keeps it.\n-u includes untracked files; git stash list/show to inspect.\nStashes are easy to forget; prefer a WIP commit for long-lived work.\ngit cherry-pick <sha> creates a new commit with the same change (different SHA).\n-x adds "cherry picked from" to the message for traceability.\nOveruse causes duplicate commits and conflicts; prefer merging when possible.`,
          exercises: [
            {
              task: `Save work and switch branches.`,
              description: `Checks git stash.`,
              code: `# Half-done work; urgent hotfix needed`,
              answer: `Stash saves uncommitted changes, including new files with -u.`,
              solution: `git stash push -u -m "wip search"
git switch hotfix
# later: git stash pop`,
            },
            {
              task: `Copy one fix to the release branch.`,
              description: `Checks cherry-pick.`,
              answer: `cherry-pick applies one commit on top of the current branch.`,
              solution: `git switch release
git cherry-pick a1b2c3d`,
            },
            {
              easy: true,
              task: `Name the command that saves unfinished changes.`,
              description: `Checks stash.`,
              code: `git stash`,
              answer: `git stash saves changes and cleans the working tree.`,
            },
            {
              easy: true,
              task: `Name the command that restores the latest stash.`,
              description: `Checks stash pop.`,
              code: `git stash pop`,
              answer: `git stash pop reapplies the stash and removes it from the list.`,
            },
          ],
        },
      ],
      senior: [
        {
          q: `How do git worktree, sparse checkout, and partial clone help with big repositories?`,
          short: `Worktrees let you check out multiple branches simultaneously from one repo; sparse checkout limits the working tree to needed folders; partial clone (--filter=blob:none) downloads file contents on demand.`,
          long: `git worktree add ../hotfix hotfix-branch: separate directory, shared object store, no stash juggling.\nGreat for reviewing a PR while keeping your work open, or running agents in parallel.\nSparse checkout (git sparse-checkout set apps/web packages/ui) shrinks working tree in monorepos.\nPartial clone --filter=blob:none fetches history but blobs lazily; --filter=tree:0 even lighter.\nShallow clones (--depth=1) are good for CI but break merge-base/bisect.\nScalar (bundled with git) configures these for huge repos.`,
          exercises: [
            {
              task: `Open a second branch without stashing.`,
              description: `Checks git worktree.`,
              code: `# Review a hotfix while main work is mid-change`,
              answer: `A worktree checks out another branch in a new folder.`,
              solution: `git worktree add ../hotfix hotfix
cd ../hotfix`,
            },
            {
              task: `Clone only one folder of a big repo.`,
              description: `Checks partial clone and sparse checkout.`,
              answer: `Partial clone skips blobs; sparse checkout limits files.`,
              solution: `git clone --filter=blob:none --sparse <url>
git sparse-checkout set apps/web`,
            },
            {
              easy: true,
              task: `Create a worktree for branch fix in a new folder.`,
              description: `Checks worktree add.`,
              code: `git worktree add ../fix fix`,
              answer: `This checks out branch fix in ../fix next to your repo.`,
            },
            {
              easy: true,
              task: `Add the clone flag that skips file contents.`,
              description: `Checks partial clone.`,
              code: `git clone ? https://example.com/repo.git`,
              answer: `Use --filter=blob:none to download blobs only when needed.`,
            },
          ],
        },
        {
          q: `You resolve the same merge conflicts again and again when you update a long branch. How can Git help?`,
          code: `git checkout feature/big-form
git merge origin/main   # same conflicts as yesterday
# fix by hand again...`,
          short: `Turn on git rerere so Git remembers how you solved a conflict and applies it again. Better still, merge main more often or split the branch.`,
          long: `rerere means "reuse recorded resolution".
With rerere.enabled set to true, Git saves the conflict and your fix, and next time it sees the same conflict it applies the same fix.
You still review the result and run tests before committing.
It helps with long-running branches and repeated rebases.
The real fix is process: smaller branches, feature flags, and merging main often.
Strong answer: knows rerere, its limits and the process fix.`,
          fix: `git config --global rerere.enabled true
git merge origin/main      # resolve once, commit
# next time the same conflict is solved automatically
git rerere status          # see recorded resolutions
git diff                   # always review before committing`,
          follow: `Why are long-lived branches a problem even with rerere?`,
          exercises: [
            {
              task: `Turn on reuse of conflict fixes.`,
              description: `Checks git rerere.`,
              code: `# Same conflict on every rebase of a long branch`,
              answer: `rerere records conflict resolutions and replays them later.`,
              solution: `git config --global rerere.enabled true`,
            },
            {
              task: `Name a way to avoid repeated conflicts.`,
              description: `Checks branch hygiene.`,
              answer: `Merge main into the branch often or keep branches short-lived, so conflicts stay small.`,
            },
            {
              easy: true,
              task: `Name the setting that remembers conflict fixes.`,
              description: `Checks rerere.`,
              code: `git config rerere.enabled true`,
              answer: `rerere records resolutions and reuses them on repeated conflicts.`,
            },
            {
              easy: true,
              task: `Name the command that replays commits on top of main.`,
              description: `Checks rebase.`,
              code: `git rebase origin/main`,
              answer: `git rebase moves your commits onto the latest main.`,
            },
          ],
        },
        {
          q: `How do you enforce good commits and branches with hooks and server rules?`,
          short: `Client hooks (husky + lint-staged, commitlint) give fast feedback but are bypassable; enforce truly with branch protection/rulesets, required status checks, required reviews and signed commits on the server.`,
          long: `pre-commit: lint-staged runs ESLint/Prettier on staged files only to stay fast.\ncommit-msg: commitlint validates message format/ticket key.\nHooks can be skipped with --no-verify, so CI must re-check.\nGitHub rulesets: require PR, approvals, CODEOWNERS review, status checks, linear history, block force pushes.\nRequire signed commits (SSH or GPG signing) where provenance matters.\nMerge queue ensures main stays green when many PRs merge.\nKeep hooks fast (<5s) or developers will disable them.`,
          ai: true,
          exercises: [
            {
              task: `Write a commit-msg check with commitlint.`,
              description: `Checks enforcing commit format.`,
              answer: `A commit-msg hook runs commitlint on every message.`,
              solution: `# .husky/commit-msg
npx --no -- commitlint --edit "$1"`,
            },
            {
              task: `Name why client hooks are not enough.`,
              description: `Checks server-side enforcement.`,
              answer: `Developers can skip them with --no-verify. Enforce rules with branch protection and CI checks on the server.`,
            },
            {
              easy: true,
              task: `Name the folder that holds local Git hooks.`,
              description: `Checks hooks location.`,
              code: `ls .git/hooks`,
              answer: `Hooks live in .git/hooks.`,
            },
            {
              easy: true,
              task: `Name the hook that runs before a commit is created.`,
              description: `Checks pre-commit.`,
              code: `# .git/hooks/?`,
              answer: `The pre-commit hook runs before the commit is created.`,
            },
          ],
        },
      ],
      techlead: [
        {
          q: `How do you use tags and semantic versioning for frontend releases?`,
          short: `Tag each release commit with a version like v2.4.1, follow major.minor.patch rules, and generate the changelog from commits so you can always find and redeploy any release.`,
          long: `A tag is a fixed name for one commit. Annotated tags store the author, date and message.
Semantic versioning: major for breaking changes, minor for new features, patch for fixes.
For an app (not a library) the version is mainly for tracing: which code is live, and what to roll back to.
Automate it: Conventional Commits plus a tool like release-please or semantic-release creates the version, tag and changelog.
Show the version in the app and send it with error reports, so a bug report points to an exact commit.
Strong answer: tags as release anchors, automation, and linking versions to monitoring.`,
          follow: `Why should the version number be visible in error reports?`,
          exercises: [
            {
              task: `Pick the next version.`,
              description: `Checks semantic versioning.`,
              code: `# current 2.4.1; you removed a public prop`,
              answer: `3.0.0. Removing a public API is a breaking change, so the major number goes up.`,
            },
            {
              task: `Create and push a release tag.`,
              description: `Checks annotated tags.`,
              answer: `Annotated tags keep author and message.`,
              solution: `git tag -a v2.5.0 -m "Release 2.5.0"
git push origin v2.5.0`,
            },
            {
              easy: true,
              task: `Pick the next version for a bug fix.`,
              description: `Checks semver.`,
              code: `# current: 2.4.1`,
              answer: `2.4.2, because a patch bump is for bug fixes.`,
            },
            {
              easy: true,
              task: `Pick the next version for a breaking change.`,
              description: `Checks semver major.`,
              code: `# current: 2.4.1`,
              answer: `3.0.0, because breaking changes bump the major version.`,
            },
          ],
        },
        {
          q: `Someone force pushed to main and commits are gone. Get them back and stop this from happening again.`,
          code: `git push --force origin main
# remote main now points to an old commit; 12 merged PRs vanished`,
          short: `Find the previous tip (reflog of someone's local clone, GitHub activity/events API, or PR merge SHAs), push it back, then enable rulesets that block force pushes and deletions on main.`,
          long: `Anyone who fetched recently has origin/main at the old tip; git reflog show origin/main reveals it.\nGitHub: the repository Activity view shows the force push with before/after SHAs; PR pages show merge commits.\nRestore with git push origin <old-sha>:main --force-with-lease=main:<bad-sha>.\nCommunicate to the team to avoid further pushes until restored.\nPrevention: ruleset on main blocking force pushes and deletions, require PRs, restrict bypass.\nBlameless postmortem; usually a local alias or tooling misconfiguration.`,
          fix: `# On a clone that fetched before the incident
git reflog show origin/main        # find the lost tip, e.g. 9fceb02
git push origin 9fceb02:main --force-with-lease=main:<current-bad-sha>
# Then: Settings -> Rules -> Rulesets -> target main: block force pushes, restrict deletions, require PR`,
          exercises: [
            {
              task: `Get the lost commits back.`,
              description: `Checks recovering from a force push.`,
              code: `# main was force-pushed; your local main is old`,
              answer: `A clone that has the old commits can restore them. Find the old tip in reflog and push it back.`,
              solution: `git reflog show origin/main
git push origin <old-sha>:main --force-with-lease`,
            },
            {
              task: `Name a setting to stop force pushes.`,
              description: `Checks branch protection.`,
              answer: `Branch protection or rulesets on main that block force pushes and deletions for everyone.`,
            },
            {
              easy: true,
              task: `Name the command that lists past HEAD positions.`,
              description: `Checks reflog.`,
              code: `git reflog`,
              answer: `git reflog shows where HEAD pointed, including lost commits.`,
            },
            {
              easy: true,
              task: `Name the safer force-push flag.`,
              description: `Checks force-with-lease.`,
              code: `git push --force-with-lease`,
              answer: `It refuses to overwrite remote commits you have not seen.`,
            },
          ],
        },
        {
          q: `How do you teach twenty people the same Git rules without micromanaging?`,
          short: `Write a short documented workflow, automate the rules (hooks, CI, rulesets, PR templates), provide examples and pairing, and measure outcomes like PR size and lead time instead of policing individuals.`,
          long: `One-page CONTRIBUTING guide: branch naming, commit format, PR size, review SLA.\nAutomate everything enforceable: commitlint, branch name check, PR template, required checks.\nPaved road: scripts/aliases to create branches from tickets, gh CLI usage.\nTeach the hard parts (rebase, conflicts, bisect, reflog) in a workshop with exercises.\nReview culture: kind, fast, focused on behavior; reviewers rotate.\nDashboards: PR size distribution, time to first review, revert rate.\nIterate the guide via retros.`,
          ai: true,
          exercises: [
            {
              task: `Name a way to teach Git rules at scale.`,
              description: `Checks enablement over policing.`,
              answer: `A short written guide with examples, plus automation: PR templates, commitlint, and branch rules that give quick feedback.`,
            },
            {
              task: `Respond to this situation.`,
              description: `Checks coaching instead of micromanaging.`,
              code: `// A new dev keeps pushing huge commits.`,
              answer: `Pair with them once on splitting commits, link the guide, and let review comments, not policing, reinforce it.`,
            },
            {
              easy: true,
              task: `Name the file that shows team PR rules.`,
              description: `Checks docs.`,
              code: `# CONTRIBUTING.md`,
              answer: `CONTRIBUTING.md documents the branch and commit rules.`,
            },
            {
              easy: true,
              task: `Name the tool that checks rules automatically.`,
              description: `Checks automation.`,
              code: `# CI runs commitlint on every PR`,
              answer: `Automated checks like commitlint enforce rules without manual policing.`,
            },
          ],
        },
      ],
    },
  },
};
