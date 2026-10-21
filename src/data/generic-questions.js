// Generic Questions
// Shape: { [topic]: { junior, middle, senior, techlead } }, each level is an array of >= 2 alternative questions
// Question: { q, code?, short, long, exercises: [{ task, description, code?, answer, solution? }], fix?, follow?, ai? }
export default {
  "Browser storages": {
    junior: [
      {
        q: "Compare localStorage, sessionStorage, and cookies.",
        short: "localStorage persists (~5MB) per origin; sessionStorage lives per tab; cookies are small (~4KB), sent with every request and support HttpOnly/Secure/SameSite.",
        long: `localStorage and sessionStorage are synchronous key/value string stores scoped to the origin.
localStorage survives restarts; sessionStorage is cleared when the tab closes and is not shared between tabs.
Cookies are attached to matching HTTP requests, so they add bandwidth but can be HttpOnly (invisible to JS).
Pitfalls: storing objects without JSON.stringify, blocking the main thread with big writes, storing secrets in JS-readable storage.
Storage can throw (quota, Safari private mode) — wrap access in try/catch.
Strong answer: mentions scope, lifetime, size, request overhead, security flags and the "storage" event across tabs.
Weak answer: "they all store data, cookies are older".`,
        exercises: [
          {
            task: `Predict the output.`,
            description: `Checks that Web Storage keeps only strings.`,
            code: `localStorage.setItem('count', 1);
const c = localStorage.getItem('count');
console.log(c + 1);`,
            answer: `It logs "11". getItem returns the string "1", so + concatenates. Common mistake: expecting 2.`,
            solution: `const c = Number(localStorage.getItem('count'));
console.log(c + 1); // 2`,
          },
          {
            task: `Name the storage for a tab-only wizard step.`,
            description: `Checks sessionStorage scope and lifetime.`,
            code: `// Keep the current wizard step.
// It must reset when the tab closes.`,
            answer: `sessionStorage: it is per tab and cleared when the tab closes. localStorage would leak the step to other tabs.`,
          },
          {
            easy: true,
            task: `Name the storage that sends data with every request.`,
            description: `Checks cookie behavior.`,
            answer: `Cookies: the browser attaches them to each matching HTTP request automatically.`,
          },
          {
            easy: true,
            task: `Predict the output.`,
            description: `Checks sessionStorage across tabs.`,
            code: `sessionStorage.setItem('a', 'x');
// open the same site in a new tab
console.log(sessionStorage.getItem('a'));`,
            answer: `null, because sessionStorage is separate for every tab.`,
          },
        ],
      },
      {
        q: "Why does this code crash for some users? How do you fix it?",
        code: `const prefs = JSON.parse(localStorage.getItem('prefs'));
document.body.dataset.theme = prefs.theme;`,
        fix: `function readPrefs() {
  try {
    return JSON.parse(localStorage.getItem('prefs') ?? '{}') ?? {};
  } catch {
    return {};
  }
}
document.body.dataset.theme = readPrefs().theme ?? 'light';`,
        short: "For new users getItem returns null, JSON.parse(null) is null, and null.theme throws. Corrupted JSON or blocked storage also throws. Provide defaults and wrap in try/catch.",
        long: `getItem returns null for a missing key; JSON.parse(null) returns null (not an error), so the property access throws TypeError.
Malformed values (manual edits, old formats) make JSON.parse throw SyntaxError.
Accessing localStorage itself can throw when storage is disabled (some privacy settings, sandboxed iframes).
Fix: wrap reads in try/catch, fall back to defaults, and validate shape.
Strong answer: covers all three failure modes and suggests a shared safe helper.
Weak answer: "check if localStorage exists".`,
        exercises: [
          {
            task: `Spot the problem.`,
            description: `Checks JSON.parse on missing storage keys.`,
            code: `const user = JSON.parse(localStorage.getItem('user'));
console.log(user.name);`,
            answer: `If the key is missing, getItem returns null, JSON.parse(null) is null, and user.name throws a TypeError.`,
            solution: `const user = JSON.parse(localStorage.getItem('user') ?? 'null');
console.log(user?.name ?? 'Guest');`,
          },
          {
            task: `Write a safe getItem wrapper.`,
            description: `Checks try/catch around storage access and parsing.`,
            code: `function readJSON(key, fallback) {
  // your code
}`,
            answer: `Wrap getItem and JSON.parse in try/catch and return fallback on null or error. Storage can throw in private mode or when blocked.`,
            solution: `function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch { return fallback; }
}`,
          },
          {
            easy: true,
            task: `Fix the crash for blocked storage.`,
            description: `Checks try/catch around storage.`,
            code: `const t = localStorage.getItem('theme');
// throws in some private modes`,
            answer: `Wrap storage access in try/catch and fall back to a default value.`,
            solution: `let t = 'light';
try { t = localStorage.getItem('theme') ?? t; } catch {}`,
          },
          {
            easy: true,
            task: `Predict the result.`,
            description: `Checks JSON.parse on null.`,
            code: `const u = JSON.parse(localStorage.getItem('user'));
console.log(u.name);`,
            answer: `It throws a TypeError when the key is missing, because u is null.`,
          },
        ],
      },
    ],
    middle: [
      {
        q: "Where would you store a JWT token, and why? What is wrong with this code?",
        code: "localStorage.setItem('token', jwt);",
        short: "Anything in localStorage is readable by any XSS. Prefer an HttpOnly Secure SameSite cookie plus CSRF protection, or an in-memory access token with a refresh cookie.",
        long: `localStorage has no access control: one injected script (XSS, compromised npm dependency) can exfiltrate the token.
HttpOnly cookies cannot be read by JS, but they are sent automatically, so you need SameSite and/or CSRF tokens.
A common pattern: short-lived access token in memory, long-lived refresh token in an HttpOnly cookie scoped to /auth/refresh.
Pitfalls: long-lived tokens with no revocation, SameSite=None without Secure, assuming HttpOnly makes XSS harmless (attacker can still act as the user).
Strong answer: discusses threat model (XSS vs CSRF), token lifetime, rotation and logout.
Weak answer: "localStorage is fine because the token is encrypted".`,
        exercises: [
          {
            task: `Spot the security problem.`,
            description: `Checks XSS risk of tokens in localStorage.`,
            code: `const { token } = await res.json();
localStorage.setItem('jwt', token);`,
            answer: `Any XSS script can read localStorage and steal the token. Prefer an HttpOnly, Secure cookie set by the server.`,
          },
          {
            task: `Write the Set-Cookie header for a session token.`,
            description: `Checks secure cookie flags.`,
            answer: `Set-Cookie: sid=abc; HttpOnly; Secure; SameSite=Lax; Path=/. HttpOnly blocks JS access, Secure forces HTTPS, SameSite limits CSRF.`,
          },
          {
            easy: true,
            task: `Name the cookie flag that hides it from JavaScript.`,
            description: `Checks HttpOnly.`,
            code: `Set-Cookie: token=abc; ???; Secure`,
            answer: `HttpOnly, so scripts cannot read the cookie, which limits XSS theft.`,
          },
          {
            easy: true,
            task: `True or false: localStorage is safe from XSS.`,
            description: `Checks XSS risk.`,
            code: `localStorage.setItem('jwt', token);`,
            answer: `False: any injected script can read localStorage and steal the token.`,
          },
        ],
      },
      {
        q: "The SameSite cookie setting can be Strict, Lax, or None. What does each do? Which do you choose for a session cookie?",
        short: "Strict never sends the cookie on cross-site requests; Lax sends it on top-level GET navigations; None always sends it (requires Secure). Lax is the browser default and a good session default; Strict for sensitive actions; None only for genuine third-party embeds.",
        long: `SameSite controls whether cookies are attached to requests initiated from other sites — the core CSRF mitigation.
Strict: even following a link from email arrives "logged out", which hurts UX.
Lax: sent on top-level navigations with safe methods, not on cross-site POST/iframes/fetch — blocks most CSRF.
None: needed for cross-site iframes/widgets, must be Secure, and is increasingly restricted by third-party cookie blocking.
"Site" is registrable domain (eTLD+1), so subdomains are same-site — SameSite doesn't protect against a compromised sibling subdomain.
Strong answer: explains site vs origin, Lax default, and that state-changing GETs defeat Lax.
Weak answer: "SameSite prevents XSS".`,
        exercises: [
          {
            task: `Predict whether the cookie is sent.`,
            description: `Checks SameSite=Lax on cross-site requests.`,
            code: `// Cookie: sid=1; SameSite=Lax
// evil.com auto-submits a POST form to app.com`,
            answer: `Not sent. Lax sends cookies only on top-level GET navigations cross-site, so the cross-site POST has no session.`,
          },
          {
            task: `Fix the cookie for a cross-site iframe.`,
            description: `Checks SameSite=None needs Secure.`,
            code: `Set-Cookie: sid=1; SameSite=None`,
            answer: `Browsers reject SameSite=None without Secure. Add Secure, and expect third-party cookie blocking anyway.`,
            solution: `Set-Cookie: sid=1; SameSite=None; Secure; Partitioned`,
          },
          {
            easy: true,
            task: `Name the SameSite value that blocks all cross-site sending.`,
            description: `Checks Strict.`,
            code: `Set-Cookie: sid=1; SameSite=???`,
            answer: `Strict: the cookie is never sent on cross-site requests.`,
          },
          {
            easy: true,
            task: `Fix the cookie so SameSite=None works.`,
            description: `Checks None requires Secure.`,
            code: `Set-Cookie: sid=1; SameSite=None`,
            answer: `Add the Secure flag, because browsers reject SameSite=None without it.`,
            solution: `Set-Cookie: sid=1; SameSite=None; Secure`,
          },
        ],
      },
    ],
    senior: [
      {
        q: "An offline-first app must store 200 megabytes of data. Which storage do you use? How do you handle storage limits and schema changes?",
        short: "Use IndexedDB (via idb/Dexie) for data and the Cache API for assets, request persistent storage, check quota with navigator.storage.estimate, and run versioned migrations in onupgradeneeded.",
        long: `localStorage is too small and synchronous; IndexedDB is async, transactional, indexable and can hold hundreds of MB.
Browsers may evict "best-effort" storage under pressure — call navigator.storage.persist() and handle denial.
Check navigator.storage.estimate() before big syncs and degrade gracefully on QuotaExceededError.
Schema changes go through DB versions: each upgrade step migrates from the previous version, never skipping.
Pitfalls: Safari's historical limits/eviction after 7 days of no use, blocked upgrades when another tab holds an old connection, huge single transactions.
Strong answer: covers eviction, multi-tab "versionchange" handling, sync/conflict strategy and data encryption if sensitive.
Weak answer: "just use localStorage and compress it".`,
        exercises: [
          {
            task: `Write code to check storage quota.`,
            description: `Checks the StorageManager estimate API.`,
            code: `// Before saving 50 MB of records:
const { usage, quota } = /* ? */;`,
            answer: `Use navigator.storage.estimate() to read usage and quota before big writes.`,
            solution: `const { usage, quota } = await navigator.storage.estimate();
console.log(Math.round(usage / quota * 100) + '% used');`,
          },
          {
            task: `Name the right storage for 200 MB of records.`,
            description: `Checks IndexedDB versus localStorage limits.`,
            code: `// 200 MB of JSON records, searchable by id`,
            answer: `IndexedDB: large async storage with indexes. localStorage is about 5 MB and synchronous, so it blocks and overflows.`,
          },
          {
            easy: true,
            task: `Name the storage for 200 MB of structured data.`,
            description: `Checks IndexedDB choice.`,
            answer: `IndexedDB: it stores large structured data asynchronously, unlike localStorage.`,
          },
          {
            easy: true,
            task: `Predict the problem.`,
            description: `Checks localStorage size limit.`,
            code: `// localStorage limit is about 5 MB
localStorage.setItem('big', 'x'.repeat(6e6));`,
            answer: `It throws a QuotaExceededError because the value is over the limit.`,
          },
        ],
      },
      {
        q: "Why can this service worker show old data to users forever? How do you design caching for the app shell and API data?",
        code: `self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});`,
        fix: `const SHELL = 'shell-v42';
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== SHELL).map((k) => caches.delete(k)))));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.pathname.startsWith('/api/')) {
    // network-first for data, cache as offline fallback
    e.respondWith(fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open('api').then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});`,
        short: "Cache-first for everything means anything once cached is never refreshed, and old caches are never deleted. Use versioned caches cleaned up on activate, cache-first only for hashed static assets, network-first or stale-while-revalidate for API data, and an update flow for new SW versions.",
        long: `Cache-first is right for immutable, content-hashed assets but wrong for HTML and API data.
Version cache names and delete old ones in activate; otherwise storage grows and old shells keep being served.
API data: network-first with cache fallback (correctness) or stale-while-revalidate (speed) depending on freshness needs.
New SW waits until all tabs close; offer a "new version available — reload" prompt with skipWaiting rather than forcing mid-session.
Never cache authenticated responses without clearing them on logout; don't cache POST.
Strong answer: per-resource strategy, update lifecycle, logout/PII concerns; mentions Workbox.
Weak answer: "just unregister the service worker".`,
        exercises: [
          {
            task: `Spot why users get old data forever.`,
            description: `Checks cache-first for API responses.`,
            code: `self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request)
    .then(r => r || fetch(e.request)));
});`,
            answer: `Cache-first never revalidates, so cached API data never updates. Use network-first or stale-while-revalidate for API calls.`,
          },
          {
            task: `Name a cache strategy for each resource.`,
            description: `Checks matching strategies to resource types.`,
            code: `// hashed JS bundles, index.html, /api/*`,
            answer: `Hashed bundles: cache-first. index.html: network-first. API: network-first or stale-while-revalidate with a short max age.`,
          },
          {
            easy: true,
            task: `Name the header for cache lifetime.`,
            description: `Checks Cache-Control.`,
            code: `Cache-Control: ???=3600`,
            answer: `max-age: the response is fresh for 3600 seconds.`,
          },
          {
            easy: true,
            task: `Fix the cache strategy for always-fresh data.`,
            description: `Checks network-first idea.`,
            code: `// service worker
event.respondWith(caches.match(event.request));`,
            answer: `Try the network first, and use the cache only as an offline fallback.`,
            solution: `event.respondWith(
  fetch(event.request).catch(() => caches.match(event.request))
);`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: "Your app stores personal data in the browser. What rules do you set for GDPR, logout, and shared devices?",
        short: "Minimize what is stored, keep a data inventory, encrypt or avoid sensitive fields, enforce TTLs, wipe everything on logout, and make it part of security review.",
        long: `Start with data minimization: does this PII need to be on the device at all?
Maintain an inventory of keys/stores/caches and their owners so GDPR deletion requests are actually honored.
Logout and session expiry must clear localStorage, IndexedDB, Cache API and service worker caches (Clear-Site-Data helps).
Shared devices: prefer session-scoped storage, short TTLs and no "remember me" by default for sensitive roles.
Pitfalls: analytics/error tools capturing PII, service workers caching API responses with PII, forgetting old storage keys after refactors.
Strong answer: policy + enforcement (lint rules, review checklist, automated tests for logout cleanup).
Weak answer: "we encrypt it so it's fine".`,
        exercises: [
          {
            task: `Write a logout cleanup function.`,
            description: `Checks clearing all client-side personal data.`,
            code: `async function logout() {
  // clear storage, caches, IndexedDB, cookie
}`,
            answer: `Clear Web Storage, IndexedDB, and Cache Storage, then call the server to expire HttpOnly cookies.`,
            solution: `async function logout() {
  localStorage.clear(); sessionStorage.clear();
  for (const k of await caches.keys()) await caches.delete(k);
  indexedDB.deleteDatabase('app');
  await fetch('/logout', { method: 'POST' });
}`,
          },
          {
            task: `Name two rules for shared devices.`,
            description: `Checks privacy defaults for public computers.`,
            code: `// A library computer used by many applicants`,
            answer: `Keep personal data out of persistent storage by default, and auto-logout plus wipe local data after inactivity.`,
          },
          {
            easy: true,
            task: `Name what to do with stored personal data on logout.`,
            description: `Checks cleanup rule.`,
            code: `// user clicks "Log out"`,
            answer: `Clear it from localStorage, sessionStorage, IndexedDB, and caches.`,
          },
          {
            easy: true,
            task: `True or false: JS-encrypted localStorage is safe.`,
            description: `Checks client-side key weakness.`,
            code: `// key is inside the bundle`,
            answer: `False: attackers can read the key from the code, so it gives little protection.`,
          },
        ],
        ai: true,
      },
      {
        q: "A product team wants to save full API responses in IndexedDB for offline use. This includes applicant records. What do you ask? What limits do you set before you approve?",
        ai: true,
        short: "Ask what data is truly needed offline, who uses which devices, retention and deletion requirements; approve only with minimized fields, TTLs, wipe on logout, encryption consideration, a data inventory entry and security review.",
        long: `Clarify the user need: which screens must work offline, for how long, on managed or shared devices?
Minimize: cache projections (ids, names, statuses), not full records with sensitive fields.
Retention: TTL and maximum age, eviction on logout/session expiry/role change, honoring deletion requests.
Encryption at rest with WebCrypto helps on lost devices but keys in the same origin don't stop XSS — be explicit about the threat model.
Governance: register stores in the data inventory, add automated logout-wipe tests, and include it in privacy impact assessment.
Strong answer: balances product value and risk, defines measurable guardrails and an owner.
Weak answer: flat yes or flat no.`,
        exercises: [
          {
            task: `Name two risks of caching applicant records.`,
            description: `Checks privacy and staleness of offline data.`,
            code: `// Save full API responses with applicant PII`,
            answer: `Unencrypted personal data stays on the device after logout, and cached records go stale or ignore permission changes.`,
          },
          {
            task: `Spot the problem in this offline save.`,
            description: `Checks data minimization before storing.`,
            code: `const data = await api.getApplicant(id);
await db.put('applicants', data);`,
            answer: `It stores the full record, including fields the offline view never needs. Store only required fields with an expiry time.`,
            solution: `const { id, name, status } = await api.getApplicant(id);
await db.put('applicants', { id, name, status, exp: Date.now() + 864e5 });`,
          },
          {
            easy: true,
            task: `Name one risk of caching full API responses offline.`,
            description: `Checks sensitive data risk.`,
            code: `// response contains email, phone`,
            answer: `Personal data stays on the device, so it can leak or become stale.`,
          },
          {
            easy: true,
            task: `Add a simple rule to avoid stale offline data.`,
            description: `Checks expiry idea.`,
            code: `await db.put({ ...data, savedAt: Date.now() });`,
            answer: `Store a timestamp and delete or refresh entries older than a set age.`,
          },
        ],
      },
    ],
  },
  "Programming Principles": {
    junior: [
      {
        q: "What do DRY, KISS and YAGNI mean?",
        short: "DRY: don't repeat knowledge; KISS: prefer the simplest solution that works; YAGNI: don't build features until they're actually needed.",
        long: `DRY is about a single source of truth for knowledge/rules, not about deleting every similar-looking line.
KISS favours readable, obvious code over clever code; simplicity lowers bug rate and onboarding cost.
YAGNI warns against speculative generality: extra options, config and layers "for later".
Pitfalls: over-applying DRY creates coupled abstractions; ignoring YAGNI bloats the codebase.
Strong answer: gives a concrete example of each and notes the tension between them.
Weak answer: recites the acronyms without examples.`,
        exercises: [
          {
            task: `Name the principle this code breaks.`,
            description: `Checks recognizing YAGNI.`,
            code: `function format(v, locale, currency, plugin, legacyMode) {
  return v.toFixed(2); // only this is used
}`,
            answer: `YAGNI: four parameters exist for imagined futures. Remove them until a real need appears.`,
          },
          {
            task: `Refactor to follow DRY.`,
            description: `Checks removing duplicated knowledge.`,
            code: `const a = price * 1.2;
const b = shipping * 1.2;`,
            answer: `The tax rate is duplicated. Put it in one named constant or function.`,
            solution: `const TAX = 1.2;
const withTax = v => v * TAX;
const a = withTax(price), b = withTax(shipping);`,
          },
          {
            easy: true,
            task: `Name the principle: do not build features until needed.`,
            description: `Checks YAGNI.`,
            answer: `YAGNI: You Aren't Gonna Need It.`,
          },
          {
            easy: true,
            task: `Spot the DRY violation.`,
            description: `Checks repeated code.`,
            code: `const a = price * 1.2;
const b = cost * 1.2;
const c = fee * 1.2;`,
            answer: `The 1.2 tax rate repeats; put it in one named constant.`,
            solution: `const TAX = 1.2;
const a = price * TAX;`,
          },
        ],
      },
      {
        q: "This function does too much. Which principle does it break? How would you split it?",
        code: `function handleSignup(form) {
  if (!form.email.includes('@')) return alert('Bad email');
  fetch('/api/users', { method: 'POST', body: JSON.stringify(form) });
  document.querySelector('#msg').textContent = 'Welcome!';
  localStorage.setItem('signedUp', 'true');
}`,
        fix: `const validateSignup = (form) => (form.email.includes('@') ? null : 'Bad email');
const createUser = (form) =>
  fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });

async function handleSignup(form, ui) {
  const error = validateSignup(form);
  if (error) return ui.showError(error);
  await createUser(form);
  ui.showWelcome();
}`,
        short: "Single Responsibility / separation of concerns: validation, network, DOM and storage are mixed. Split into small functions so each can be tested and changed independently; also await the request before showing success.",
        long: `The function changes for many reasons: validation rules, API shape, UI copy, persistence.
Pure validation can be unit-tested without a DOM; the API call can be mocked; UI updates become a thin layer.
It also has a bug: it shows "Welcome!" without awaiting or checking the response.
Pitfalls: over-splitting into dozens of one-line files.
Strong answer: names SRP, splits by reason to change, spots the missing await/error handling.
Weak answer: "add comments".`,
        exercises: [
          {
            task: `Name the responsibilities in this function.`,
            description: `Checks spotting mixed responsibilities.`,
            code: `function save(form) {
  if (!form.email) throw Error('email');
  fetch('/api', { method: 'POST', body: JSON.stringify(form) });
  alert('Saved');
}`,
            answer: `Validation, network, and UI feedback. Split into validate, saveForm, and a UI notify step.`,
          },
          {
            task: `Split this into two functions.`,
            description: `Checks separating calculation from output.`,
            code: `function report(items) {
  const total = items.reduce((s, i) => s + i.price, 0);
  console.log('Total: ' + total);
}`,
            answer: `Separate the pure total calculation from printing, so the math is reusable and testable.`,
            solution: `const total = items => items.reduce((s, i) => s + i.price, 0);
const report = items => console.log('Total: ' + total(items));`,
          },
          {
            easy: true,
            task: `Name the principle broken by a function doing many jobs.`,
            description: `Checks single responsibility.`,
            code: `function saveUserAndSendEmailAndLog(u) {}`,
            answer: `Single Responsibility Principle: each function should do one thing.`,
          },
          {
            easy: true,
            task: `Split the function name into smaller ones.`,
            description: `Checks decomposition.`,
            code: `function validateAndSave(form) {}`,
            answer: `Create validate(form) and save(form), then call them in order.`,
            solution: `validate(form);
save(form);`,
          },
        ],
      },
    ],
    middle: [
      {
        q: "Which SOLID principle is broken? Fix the code.",
        code: `function pay(type, amount) {
  if (type === 'card') { /* ... */ }
  else if (type === 'paypal') { /* ... */ }
  else if (type === 'crypto') { /* ... */ }
}`,
        short: "Open/Closed: adding a payment method requires editing the function. Use a strategy map/registry so new methods are added without touching existing code.",
        long: `Every new branch modifies tested code and grows one function's responsibilities (also hurts SRP).
A strategy map turns branching into data: each handler lives in its own module and can be tested in isolation.
Unknown types should fail loudly instead of silently doing nothing.
Pitfalls: introducing class hierarchies when a plain object map is enough; leaking provider-specific params into the shared signature.
Strong answer: names OCP, shows a registry, mentions testing and error handling for unknown types.
Weak answer: "use a switch instead of if/else".`,
        exercises: [
          {
            task: `Name the SOLID principle broken here.`,
            description: `Checks Interface Segregation.`,
            code: `interface Printer {
  print(): void; scan(): void; fax(): void;
}
class BasicPrinter implements Printer { /* throws on scan, fax */ }`,
            answer: `Interface Segregation: clients depend on methods they do not use. Split into Printer, Scanner, and Fax interfaces.`,
          },
          {
            task: `Fix the Dependency Inversion problem.`,
            description: `Checks injecting dependencies instead of creating them.`,
            code: `class Report {
  api = new HttpApi();
  load() { return this.api.get('/r'); }
}`,
            answer: `Report creates a concrete HttpApi, so it cannot be swapped or mocked. Pass the dependency in.`,
            solution: `class Report {
  constructor(private api: { get(u: string): Promise<unknown> }) {}
  load() { return this.api.get('/r'); }
}`,
          },
          {
            easy: true,
            task: `Name the SOLID letter for open-closed.`,
            description: `Checks OCP.`,
            answer: `O: the Open/Closed Principle.`,
          },
          {
            easy: true,
            task: `Spot the principle broken by a growing if/else on type.`,
            description: `Checks OCP symptom.`,
            code: `if (t === 'a') {}
else if (t === 'b') {}
else if (t === 'c') {}`,
            answer: `Open/Closed: adding a type forces editing this code; use polymorphism or a map.`,
          },
        ],
      },
      {
        q: "Explain the Law of Demeter and separation of concerns. Where do you see them in frontend code?",
        short: "Law of Demeter: a unit should talk only to its direct collaborators, not reach through chains (a.b.c.d). Separation of concerns: keep UI, state, data access and domain logic in distinct layers. Both reduce coupling to structures you don't own.",
        long: `Long chains like order.customer.address.city couple the caller to the whole object graph; any shape change breaks it.
In React, prop drilling deep objects and components reaching into store internals are Demeter violations; selectors and adapters fix them.
Separation of concerns: components render, hooks orchestrate, services talk to APIs, domain modules hold rules.
Pitfalls: wrapper methods for every field ("Demeter dogma"), layers so thin they add nothing.
Strong answer: concrete frontend examples and awareness of over-application.
Weak answer: "don't use dots".`,
        exercises: [
          {
            task: `Spot the Law of Demeter problem.`,
            description: `Checks reaching through object chains.`,
            code: `const city = order.customer.address.city.name;`,
            answer: `The code depends on the whole object chain. Ask the nearest object, like order.getCityName(), or pass the needed value.`,
          },
          {
            task: `Name where this logic belongs.`,
            description: `Checks separation of concerns in components.`,
            code: `function List() {
  const [d, setD] = useState([]);
  useEffect(() => { fetch('/api').then(r => r.json()).then(setD); }, []);
  return d.map(i => <li key={i.id}>{i.name}</li>);
}`,
            answer: `Move fetching into a hook or service, like useItems. The component should only render.`,
          },
          {
            easy: true,
            task: `Spot the Law of Demeter violation.`,
            description: `Checks long call chains.`,
            code: `order.customer.address.city.name;`,
            answer: `The code reaches through many objects; ask order for the city instead.`,
          },
          {
            easy: true,
            task: `Name the idea of keeping UI and data logic apart.`,
            description: `Checks separation of concerns.`,
            code: `// component fetches, parses, and renders`,
            answer: `Separation of concerns: split fetching, logic, and rendering into separate parts.`,
          },
        ],
      },
    ],
    senior: [
      {
        q: "When is DRY bad? Give an example of a wrong abstraction you had to remove.",
        short: "When code merely looks alike but changes for different reasons; \"duplication is cheaper than the wrong abstraction\". Expect a concrete story of inlining a bad abstraction.",
        long: `Two pieces of code that are coincidentally similar will diverge; merging them forces flags and conditionals into the shared helper.
Signs of a wrong abstraction: boolean parameters, "mode" arguments, callers passing nulls, every change touching all consumers.
Fix: inline the abstraction back into callers, let them diverge, then re-extract what is truly shared.
Rule of three is a useful heuristic, but the real test is "do they change for the same reason?".
Pitfalls: abstracting across bounded contexts (e.g. admin vs applicant forms) or across teams.
Strong answer: real example, how they noticed, how they undid it safely.
Weak answer: "DRY is always good".`,
        exercises: [
          {
            task: `Spot the wrong abstraction.`,
            description: `Checks over-parameterized shared code.`,
            code: `function Button({ isIcon, isLink, isDanger, isMenu, isTab }) {
  // 80 lines of if/else
}`,
            answer: `One component serves many unrelated cases through flags. Duplicate or split into focused components instead.`,
          },
          {
            task: `Decide: merge these two functions or not?`,
            description: `Checks accidental versus real duplication.`,
            code: `const validateApplicantAge = a => a >= 16;
const validateStaffAge = a => a >= 16;`,
            answer: `Keep them separate. They look the same today, but they are different business rules that will change for different reasons.`,
          },
          {
            easy: true,
            task: `True or false: merge all similar code blocks.`,
            description: `Checks DRY limits.`,
            answer: `False: code that looks alike but changes for different reasons should stay separate.`,
          },
          {
            easy: true,
            task: `Name the cost of a wrong abstraction.`,
            description: `Checks abstraction pain.`,
            code: `function render(a, b, c, isX, isY, mode) {}`,
            answer: `Flags and parameters pile up, making code harder to read than duplication.`,
          },
        ],
        ai: true,
      },
      {
        q: "Change this code so it depends on abstractions and the business rule is easy to test. Which principles do you use?",
        code: `export async function canEnroll(studentId) {
  const res = await fetch(\`/api/students/\${studentId}\`);
  const s = await res.json();
  const today = new Date();
  return s.credits >= 30 && new Date(s.deadline) > today && !localStorage.getItem('blocked:' + studentId);
}`,
        fix: `// pure domain rule
export const isEligible = (student, now, isBlocked) =>
  student.credits >= 30 && new Date(student.deadline) > now && !isBlocked;

// orchestration with injected dependencies
export const makeCanEnroll = ({ getStudent, clock, blocklist }) => async (id) =>
  isEligible(await getStudent(id), clock.now(), blocklist.has(id));`,
        short: "Dependency Inversion and SRP: separate the pure eligibility rule from I/O (network, clock, storage) and inject those dependencies. The rule becomes a pure function tested with plain data, including time-dependent cases.",
        long: `Hidden dependencies (fetch, new Date(), localStorage) make the rule untestable without heavy mocking and flaky time behaviour.
Functional core / imperative shell: pure decision logic in the middle, side effects at the edges.
Injecting a clock makes deadline edge cases (exactly at deadline, timezones) testable.
Also note: the client-side rule is UX only; the backend must enforce enrollment eligibility.
Pitfalls: building a DI container for one function, leaking DTO shape into the domain.
Strong answer: names the principles, shows the split, mentions server-side enforcement.
Weak answer: "mock fetch with jest".`,
        exercises: [
          {
            task: `Make this function testable.`,
            description: `Checks injecting time instead of calling Date.`,
            code: `function isLate(deadline) {
  return Date.now() > deadline;
}`,
            answer: `Hidden Date.now makes tests flaky. Pass the current time as a parameter with a default.`,
            solution: `function isLate(deadline, now = Date.now()) {
  return now > deadline;
}`,
          },
          {
            task: `Write a test for the injected rule.`,
            description: `Checks testing with a fake dependency.`,
            code: `const canSubmit = (app, clock) => clock.now() < app.deadline;`,
            answer: `Pass a fake clock object, so no mocking library is needed.`,
            solution: `test('blocks late submit', () => {
  const clock = { now: () => 200 };
  expect(canSubmit({ deadline: 100 }, clock)).toBe(false);
});`,
          },
          {
            easy: true,
            task: `Name the SOLID letter for depending on abstractions.`,
            description: `Checks DIP.`,
            answer: `D: the Dependency Inversion Principle.`,
          },
          {
            easy: true,
            task: `Fix the hard dependency to make it testable.`,
            description: `Checks injecting dependencies.`,
            code: `function load() { return fetch('/api'); }`,
            answer: `Pass the fetch function as a parameter, so tests can give a fake.`,
            solution: `function load(fetchFn = fetch) {
  return fetchFn('/api');
}`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: "The team is under pressure. How do you balance good principles with fast delivery?",
        short: "Make trade-offs explicit: an agreed quality bar, tracked tech debt with owners, refactor capacity in each sprint, and a preference for reversible decisions.",
        long: `Principles are tools for long-term speed; under pressure, the question is which shortcuts are reversible.
Agree a non-negotiable floor (tests for critical paths, no security shortcuts, code review) and allow flexibility above it.
Record debt where it's created (ticket + code link + owner), and reserve capacity (e.g. 15–20%) to pay it down.
Use ADRs for bigger decisions so future teams know why a shortcut was taken.
Pitfalls: "we'll fix it later" with no ticket, hero refactors without buy-in, gold-plating under a deadline.
Strong answer: concrete mechanisms and a story of a negotiated trade-off with product.
Weak answer: "we never compromise" or "we always ship first".`,
        exercises: [
          {
            task: `Name what you would not skip under pressure.`,
            description: `Checks prioritizing quality under deadlines.`,
            code: `// Release in two days. Feature half done.`,
            answer: `Keep tests for critical paths and code review. Defer refactors, but record them as tickets with owners.`,
          },
          {
            task: `Describe how to record a shortcut.`,
            description: `Checks managing technical debt explicitly.`,
            code: `// You hardcode a rule to ship today.`,
            answer: `Add a TODO with a ticket link, log it in the debt backlog, and schedule a fix in the next sprint.`,
          },
          {
            easy: true,
            task: `Name a safe way to ship fast under pressure.`,
            description: `Checks pragmatic tradeoff.`,
            code: `// Deadline Friday, code is messy`,
            answer: `Ship the smallest working version and log the debt with a ticket to fix.`,
          },
          {
            easy: true,
            task: `Decide what to do about a risky shortcut.`,
            description: `Checks debt tracking.`,
            code: `// TODO hack: skip validation`,
            answer: `Record it as tracked tech debt with an owner and a date.`,
          },
        ],
        ai: true,
      },
      {
        q: "Your team argues a lot in code review about style and principles. How do you set and enforce rules without slowing delivery?",
        ai: true,
        short: "Write down a short set of agreed principles with rationale, automate everything automatable (formatter, lint, architecture rules), use ADRs for contested decisions, and coach reviewers to distinguish blocking issues from preferences.",
        long: `Most review friction is about things a tool can decide: formatting, import order, naming — automate them (Prettier, ESLint, dependency-cruiser).
Document a few principles with examples and rationale (e.g. "prefer composition", "domain logic is framework-agnostic").
Contested topics get a time-boxed ADR; once decided, discussion moves to proposing a new ADR, not relitigating in PRs.
Review etiquette: label comments (blocking / suggestion / nit), aim for small PRs, review SLAs.
Pitfalls: a 50-page style guide nobody reads, principles imposed by one person.
Strong answer: mix of automation, documentation and culture, with a story.
Weak answer: "I tell them who is right".`,
        exercises: [
          {
            task: `Name a tool to end formatting arguments.`,
            description: `Checks automating style in review.`,
            code: `// Reviewers argue about semicolons and quotes.`,
            answer: `Use Prettier with a shared config and a CI check. Style becomes automatic, so reviews focus on logic.`,
          },
          {
            task: `Write a short review rule for the team.`,
            description: `Checks clear comment-severity conventions.`,
            answer: `Prefix comments with blocker, suggestion, or nit. Only blockers stop the merge, so personal taste never blocks delivery.`,
          },
          {
            easy: true,
            task: `Name the best tool to end style arguments in review.`,
            description: `Checks automation.`,
            code: `// "tabs vs spaces" comment again`,
            answer: `Use an automatic formatter and linter, so style is not debated.`,
          },
          {
            easy: true,
            task: `Say where to write the agreed team rules.`,
            description: `Checks shared documentation.`,
            code: `// new hire asks about naming rules`,
            answer: `In a short written guide in the repo, such as CONTRIBUTING.`,
          },
        ],
      },
    ],
  },
  "Functional programming": {
    junior: [
      {
        q: "What is a pure function? Is the array sort method pure?",
        short: "A pure function returns the same output for the same input and has no side effects. sort mutates the array in place, so it isn't pure — use toSorted() or copy first.",
        long: `Purity makes code predictable, cacheable (memoization) and trivially testable.
Side effects include mutating arguments, I/O, reading Date.now()/Math.random(), touching the DOM or globals.
sort, reverse and splice mutate; ES2023 added toSorted, toReversed, toSpliced and with as immutable alternatives.
Pitfalls: mutating React state/props via sort, assuming map returns a deep copy.
Strong answer: defines both properties, gives side-effect examples and the immutable alternatives.
Weak answer: "a function without bugs".`,
        exercises: [
          {
            task: `Predict the output.`,
            description: `Checks that sort mutates the array.`,
            code: `const a = [3, 1, 2];
const b = a.sort();
console.log(a, a === b);`,
            answer: `[1, 2, 3] true. sort changes the array in place and returns the same array, so it is not pure.`,
            solution: `const a = [3, 1, 2];
const b = a.toSorted(); // a stays [3, 1, 2]`,
          },
          {
            task: `Is this function pure? Why?`,
            description: `Checks hidden outside state.`,
            code: `let rate = 2;
const calc = x => x * rate;`,
            answer: `No. The result depends on outer mutable rate. Pass rate as a parameter to make it pure.`,
            solution: `const calc = (x, rate) => x * rate;`,
          },
          {
            easy: true,
            task: `Predict if the function is pure.`,
            description: `Checks purity.`,
            code: `const add = (a, b) => a + b;`,
            answer: `Yes: same inputs always give the same output, with no side effects.`,
          },
          {
            easy: true,
            task: `Name why this function is impure.`,
            description: `Checks side effects.`,
            code: `let n = 0;
const inc = () => ++n;`,
            answer: `It changes outside state, so calls with the same input give different results.`,
          },
        ],
      },
      {
        q: "Rewrite this loop using map, filter and reduce.",
        code: `const result = [];
for (let i = 0; i < users.length; i++) {
  if (users[i].active) result.push(users[i].name.toUpperCase());
}`,
        fix: "const result = users.filter((u) => u.active).map((u) => u.name.toUpperCase());",
        short: "filter keeps active users, map transforms them into upper-cased names; no manual index or mutable result array.",
        long: `map transforms each element and returns a new array of the same length.
filter keeps elements for which the callback returns truthy.
reduce folds an array into any single value (sum, object, map).
They don't mutate the original and express intent declaratively.
Pitfalls: using map for side effects (use forEach), forgetting to return from a block-bodied arrow, using reduce where filter/map is clearer.
Strong answer: correct rewrite and explains each method's contract.
Weak answer: uses map with an if and gets undefined entries.`,
        exercises: [
          {
            task: `Rewrite this loop with filter and map.`,
            description: `Checks basic array methods.`,
            code: `const out = [];
for (const u of users) {
  if (u.active) out.push(u.name);
}`,
            answer: `Filter active users, then map to names.`,
            solution: `const out = users.filter(u => u.active).map(u => u.name);`,
          },
          {
            task: `Write a reduce that sums prices.`,
            description: `Checks reduce with an initial value.`,
            code: `const items = [{ price: 5 }, { price: 7 }];`,
            answer: `Start from 0 so empty arrays work. Result is 12.`,
            solution: `const total = items.reduce((sum, i) => sum + i.price, 0);`,
          },
          {
            easy: true,
            task: `Predict the output.`,
            description: `Checks map.`,
            code: `console.log([1, 2, 3].map(x => x * 2));`,
            answer: `[2, 4, 6]: map returns a new array with each item doubled.`,
          },
          {
            easy: true,
            task: `Predict the output.`,
            description: `Checks reduce sum.`,
            code: `console.log([1, 2, 3].reduce((s, x) => s + x, 0));`,
            answer: `6: reduce adds all items starting from 0.`,
          },
        ],
      },
    ],
    middle: [
      {
        q: "Write the compose, pipe, and curry functions.",
        short: "pipe/compose chain unary functions left-to-right/right-to-left via reduce; curry collects arguments until the original function's arity is reached.",
        long: `pipe(f, g)(x) === g(f(x)); compose(f, g)(x) === f(g(x)) — compose uses reduceRight.
curry relies on fn.length, which ignores default and rest parameters — a common gotcha.
These enable point-free data pipelines and partial application (configure once, use many times).
Pitfalls: losing "this", debugging long anonymous pipelines, TypeScript typing of variadic pipe.
Strong answer: correct implementation, mentions fn.length limits and a real use case.
Weak answer: memorized code without explaining arity.`,
        exercises: [
          {
            task: `Write a pipe function.`,
            description: `Checks function composition left to right.`,
            code: `const inc = x => x + 1, dbl = x => x * 2;
// pipe(inc, dbl)(3) === 8`,
            answer: `Reduce over the functions, passing the result forward.`,
            solution: `const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);`,
          },
          {
            task: `Predict the output.`,
            description: `Checks curried function calls.`,
            code: `const add = a => b => c => a + b + c;
console.log(add(1)(2)(3), typeof add(1)(2));`,
            answer: `It logs 6 and "function". Each call returns a new function until all arguments arrive.`,
          },
          {
            easy: true,
            task: `Predict the output.`,
            description: `Checks curry call.`,
            code: `const add = a => b => a + b;
console.log(add(2)(3));`,
            answer: `5: add(2) returns a function that adds 2 to its input.`,
          },
          {
            easy: true,
            task: `Name what compose does with functions.`,
            description: `Checks compose order.`,
            code: `compose(f, g)(x) // = ???`,
            answer: `f(g(x)): functions run from right to left.`,
          },
        ],
        fix: `const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);
const curry = (fn) => function c(...a) { return a.length >= fn.length ? fn(...a) : (...b) => c(...a, ...b); };`,
      },
      {
        q: "What are higher-order functions and closures? How do they make partial application possible?",
        short: "A higher-order function takes or returns functions; a closure is a function that remembers variables from the scope where it was created. Returning a closure that captures some arguments is partial application.",
        long: `map, filter, setTimeout, addEventListener and React hooks all accept functions — they are higher-order.
Closures let a returned function keep access to outer variables even after the outer function returned.
Partial application fixes some arguments now and supplies the rest later: const withTax = (rate) => (price) => price * (1 + rate).
Uses: configuring once (loggers, API clients), event handlers with ids, memoization caches.
Pitfalls: stale closures in React effects, memory leaks by capturing large objects, loop variable capture with var.
Strong answer: clear definitions plus a real use case and a pitfall.
Weak answer: "a closure is a function inside a function".`,
        exercises: [
          {
            task: `Write a function that makes multipliers.`,
            description: `Checks closures for partial application.`,
            code: `// const double = multiplier(2); double(5) === 10`,
            answer: `Return an inner function that remembers the factor through a closure.`,
            solution: `const multiplier = f => x => x * f;`,
          },
          {
            task: `Predict the output.`,
            description: `Checks closure capture with let in loops.`,
            code: `const fns = [];
for (let i = 0; i < 3; i++) fns.push(() => i);
console.log(fns.map(f => f()));`,
            answer: `[0, 1, 2]. let creates a new binding each iteration. With var it would be [3, 3, 3].`,
          },
          {
            easy: true,
            task: `Name the term for a function that takes a function.`,
            description: `Checks higher-order function.`,
            code: `[1, 2].map(x => x + 1);`,
            answer: `A higher-order function; map takes another function as an argument.`,
          },
          {
            easy: true,
            task: `Predict the output.`,
            description: `Checks closure memory.`,
            code: `const mk = n => () => n;
console.log(mk(7)());`,
            answer: `7: the inner function remembers n from its outer scope.`,
          },
        ],
      },
    ],
    senior: [
      {
        q: "Rewrite this imperative code in a functional style. Should you do it? Discuss.",
        code: `let total = 0;
for (const o of orders) { if (o.paid) { total += o.items.length * o.price; } }`,
        short: "filter + reduce expresses intent declaratively, but it makes multiple passes and allocates; for hot paths over huge arrays a loop can be better. Readability first, not dogma.",
        long: `The functional version is shorter and has no mutable outer variable, which helps reasoning and testing.
filter allocates an intermediate array; for millions of items a single reduce or for loop avoids it.
Complex reduce callbacks can be less readable than a loop — readability for the team matters most.
Measure before optimizing; most UI lists are small enough that it doesn't matter.
Pitfalls: chaining map/filter/reduce over large data in render; reduce with object spread (O(n²)).
Strong answer: writes both, discusses allocation and readability, decides based on context.
Weak answer: "functional is always better".`,
        exercises: [
          {
            task: `Rewrite this in functional style.`,
            description: `Checks replacing mutation with array methods.`,
            code: `let total = 0;
for (let i = 0; i < orders.length; i++) {
  if (orders[i].paid) total += orders[i].sum;
}`,
            answer: `Filter paid orders, then reduce the sums.`,
            solution: `const total = orders
  .filter(o => o.paid)
  .reduce((s, o) => s + o.sum, 0);`,
          },
          {
            task: `Decide: should this loop stay imperative?`,
            description: `Checks performance trade-offs of chaining.`,
            code: `// Hot path: 1M items, runs every frame
for (let i = 0; i < n; i++) acc += a[i];`,
            answer: `Keep the loop. In hot paths a plain loop avoids extra arrays and callbacks; readability gains do not justify the cost.`,
          },
          {
            easy: true,
            task: `Replace the loop mutation with map.`,
            description: `Checks functional style.`,
            code: `const out = [];
for (const x of xs) out.push(x + 1);`,
            answer: `Use xs.map(x => x + 1), which builds a new array without mutation.`,
            solution: `const out = xs.map(x => x + 1);`,
          },
          {
            easy: true,
            task: `True or false: functional style is always faster.`,
            description: `Checks tradeoffs.`,
            answer: `False: it often improves clarity, but may allocate more memory.`,
          },
        ],
        fix: "const total = orders.filter(o => o.paid).reduce((s, o) => s + o.items.length * o.price, 0);",
      },
      {
        q: `This undo feature does not work. Every history entry shows the latest state. Fix it.`,
        code: `const history = [];
const state = { items: [] };
function addItem(item) {
  history.push(state);
  state.items.push(item);
}
function undo() { return history.pop(); }`,
        short: `Every history entry points to the same object, which keeps changing. Make each update return a new state, so old states stay unchanged.`,
        long: `history.push(state) saves a reference, not a snapshot. Then state.items.push changes that same object, so every entry looks the same.
With immutable updates each change creates a new object and the old one stays as it was.
Structural sharing keeps this cheap: unchanged parts are reused, only the changed path is copied.
This is the same idea that makes Redux time travel and React change detection work.
Strong answer: explains reference vs value, fixes it with pure updates and mentions structural sharing or Immer.`,
        fix: `let state = { items: [] };
const history = [];
function addItem(item) {
  history.push(state);
  state = { ...state, items: [...state.items, item] };
}
function undo() { state = history.pop() ?? state; return state; }`,
        follow: `Is deep cloning the whole state on every change a good fix? Why not?`,
        exercises: [
          {
            task: `Spot why all history entries look the same.`,
            description: `Checks shared references in state history.`,
            code: `const state = { items: [] };
history.push(state);
state.items.push('a');
history.push(state);`,
            answer: `Both entries reference the same object, so mutation changes all of them. Push new copies instead.`,
            solution: `let state = { items: [] };
history.push(state);
state = { ...state, items: [...state.items, 'a'] };
history.push(state);`,
          },
          {
            task: `Name a built-in way to deep copy state.`,
            description: `Checks structuredClone.`,
            code: `const snapshot = /* ? */(state);`,
            answer: `structuredClone(state) makes a deep copy, including Dates and Maps. It cannot copy functions or DOM nodes.`,
          },
          {
            easy: true,
            task: `Predict the output.`,
            description: `Checks shared reference mutation.`,
            code: `const s = { n: 1 };
const h = [s]; s.n = 2;
console.log(h[0].n);`,
            answer: `2, because the history stores the same object reference.`,
          },
          {
            easy: true,
            task: `Fix the push to store a copy.`,
            description: `Checks immutable snapshot.`,
            code: `history.push(state);`,
            answer: `Push a copy of state, so later changes do not affect it.`,
            solution: `history.push({ ...state });`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: "Would you use fp-ts or Effect in a product team? Why or why not?",
        short: "Only if the safety benefits (typed errors, composable effects) outweigh onboarding cost, hiring pool and consistency; often a lighter subset of FP patterns is the better trade-off.",
        long: `These libraries give typed errors, dependency injection and composable async, which reduce whole classes of bugs.
Cost: steep learning curve, unfamiliar syntax, harder hiring and onboarding, and "two styles" in one codebase.
Evaluate on a bounded pilot (e.g. one service layer) with success criteria and an exit plan.
Alternatives: Result types, zod at boundaries, discriminated unions and pure modules give much of the value.
Pitfalls: one enthusiast introducing it without team buy-in; leaking the paradigm into UI components.
Strong answer: frames it as a team/organizational decision with a pilot and criteria.
Weak answer: pure preference ("it's cool" / "FP is too academic").`,
        exercises: [
          {
            task: `Name two costs of adding Effect to a team.`,
            description: `Checks pragmatic library adoption.`,
            code: `// Team of 8, mostly React developers`,
            answer: `A steep learning curve and unfamiliar code for new hires. Gains in typed errors must outweigh slower onboarding.`,
          },
          {
            task: `Write a simple Result type instead.`,
            description: `Checks lightweight typed error handling.`,
            answer: `A small union type gives typed errors without a library.`,
            solution: `type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };`,
          },
          {
            easy: true,
            task: `Name one cost of adopting fp-ts for a team.`,
            description: `Checks learning curve.`,
            answer: `A steep learning curve: many developers do not know the concepts.`,
          },
          {
            easy: true,
            task: `Name a simpler alternative to Either for errors.`,
            description: `Checks pragmatism.`,
            code: `// returns { ok, value, error }`,
            answer: `A plain result object or typed return, which needs no library.`,
          },
        ],
        ai: true,
      },
      {
        q: "You have a large old imperative codebase. How do you add functional patterns like immutability, pure business logic, and clear error types without a rewrite?",
        ai: true,
        short: "Incrementally: start at boundaries and new code, extract pure functions from hot spots with tests, add lint rules for new code only, provide examples and pairing, and measure outcomes like bug rate in refactored modules.",
        long: `Pick high-value areas: complex business rules with frequent bugs benefit most from pure, tested functions.
"Functional core, imperative shell": extract decisions into pure functions while keeping existing I/O code.
Apply lint rules (no param mutation, prefer-const, immutability) to new/changed files via overrides, not the whole repo at once.
Use Result/discriminated unions in new domain modules; adapt at boundaries to existing exception-based code.
Enablement: short guide, reference module, pairing sessions; track defects and change lead time in refactored areas.
Pitfalls: mandating a library, big-bang conversion, mixing styles inside one function.
Strong answer: phased plan with metrics and team buy-in.
Weak answer: "rewrite it in Elm".`,
        exercises: [
          {
            task: `Name a safe first step for adding FP.`,
            description: `Checks incremental adoption strategy.`,
            code: `// 200k lines of imperative code`,
            answer: `Extract pure business rules from new or touched code and add unit tests. Do not rewrite stable code.`,
          },
          {
            task: `Write an ESLint rule config to stop mutation.`,
            description: `Checks enforcing immutability with tooling.`,
            answer: `Enable rules like prefer-const and no-param-reassign with props, so new code avoids mutation.`,
            solution: `rules: {
  'prefer-const': 'error',
  'no-param-reassign': ['error', { props: true }],
}`,
          },
          {
            easy: true,
            task: `Name a safe first step toward immutability.`,
            description: `Checks gradual adoption.`,
            code: `state.items.push(x);`,
            answer: `Stop mutating in new code and use spread or non-mutating methods.`,
            solution: `state = { ...state, items: [...state.items, x] };`,
          },
          {
            easy: true,
            task: `Name how to add new patterns without a big rewrite.`,
            description: `Checks incremental migration.`,
            answer: `Apply them to new and touched code only, and add tests first.`,
          },
        ],
      },
    ],
  },
  OOP: {
    junior: [
      {
        q: "Name the four main ideas of object-oriented programming.",
        short: "Encapsulation, abstraction, inheritance and polymorphism.",
        long: `Encapsulation hides internal state behind a public interface (in JS: #private fields, closures).
Abstraction exposes what an object does, not how it does it.
Inheritance reuses behaviour through an is-a relationship (class extends).
Polymorphism lets different objects respond to the same message in their own way.
Pitfalls: confusing encapsulation with abstraction, thinking JS has no real privacy (it has #fields).
Strong answer: explains each with a short JS example.
Weak answer: lists the words only.`,
        exercises: [
          {
            task: `Name the OOP idea shown here.`,
            description: `Checks recognizing encapsulation.`,
            code: `class Counter {
  #n = 0;
  inc() { this.#n++; }
}`,
            answer: `Encapsulation: #n is private, and only inc can change it.`,
          },
          {
            task: `Name the OOP idea shown here.`,
            description: `Checks recognizing polymorphism.`,
            code: `shapes.forEach(s => console.log(s.area()));`,
            answer: `Polymorphism: each shape class has its own area, and the caller treats them the same way.`,
          },
          {
            easy: true,
            task: `Name the four main ideas of OOP.`,
            description: `Checks the four pillars.`,
            answer: `Encapsulation, abstraction, inheritance, and polymorphism.`,
          },
          {
            easy: true,
            task: `Name the OOP idea of hiding data inside an object.`,
            description: `Checks encapsulation.`,
            code: `class A { #secret = 1; }`,
            answer: `Encapsulation: the private field # cannot be accessed from outside.`,
          },
        ],
      },
      {
        q: "Fix this class so it works. Explain what the this keyword and the new keyword do.",
        code: `function User(name) {
  name = name;
  greet = function () { return 'Hi ' + this.name; };
}
const u = User('Ann');
console.log(u.greet());`,
        fix: `class User {
  constructor(name) {
    this.name = name;
  }
  greet() {
    return \`Hi \${this.name}\`;
  }
}
const u = new User('Ann');
console.log(u.greet()); // Hi Ann`,
        short: "Without `new` the function returns undefined, and the assignments don't use `this`. `new` creates an object, binds it to `this`, links its prototype and returns it; methods belong on the prototype (class methods).",
        long: `new does four things: creates an empty object, sets its prototype to Constructor.prototype, calls the constructor with this = that object, returns it.
Assigning name = name without this does nothing useful; greet without this/let becomes an implicit global (or ReferenceError in strict mode).
Class syntax makes the intent clear and throws if called without new.
Methods defined in the class body are shared via the prototype instead of copied per instance.
Strong answer: explains new, this and prototype sharing.
Weak answer: just adds new without fixing the assignments.`,
        exercises: [
          {
            task: `Fix the bug.`,
            description: `Checks losing this in callbacks.`,
            code: `class Timer {
  s = 0;
  start() { setInterval(function () { this.s++; }, 1000); }
}`,
            answer: `A regular function has its own this, which is not the instance. Use an arrow function.`,
            solution: `start() { setInterval(() => { this.s++; }, 1000); }`,
          },
          {
            task: `Predict the output.`,
            description: `Checks calling a class without new.`,
            code: `class User { constructor(n) { this.n = n; } }
const u = User('Ann');`,
            answer: `TypeError: class constructors cannot be called without new. Common mistake: expecting it to return undefined.`,
          },
          {
            easy: true,
            task: `Predict the output.`,
            description: `Checks the this keyword.`,
            code: `class A { x = 5; get() { return this.x; } }
console.log(new A().get());`,
            answer: `5, because this points to the new instance.`,
          },
          {
            easy: true,
            task: `Fix the missing keyword.`,
            description: `Checks new.`,
            code: `class User {}
const u = User();`,
            answer: `Add new; calling a class without new throws a TypeError.`,
            solution: `const u = new User();`,
          },
        ],
      },
    ],
    middle: [
      {
        q: "Composition or inheritance: which do you prefer, and why?",
        short: "Composition by default: it's flexible and loosely coupled. Use inheritance only for a true is-a relationship with genuinely shared behaviour.",
        long: `Inheritance couples the subclass to parent internals (fragile base class problem) and hierarchies get deep and rigid.
Composition assembles behaviour from small parts that can be swapped or tested independently.
React itself favours composition: children, render props, hooks instead of component inheritance.
Pitfalls: mixins with name collisions, composing so much that the flow becomes hard to trace.
Strong answer: explains the trade-off, gives a frontend example (hooks, wrappers).
Weak answer: "inheritance is bad" without reasoning.`,
        exercises: [
          {
            task: `Rewrite with composition.`,
            description: `Checks replacing inheritance with injected behavior.`,
            code: `class Logger {}
class UserService extends Logger {}`,
            answer: `A service is not a logger. Pass a logger in instead.`,
            solution: `class UserService {
  constructor(private logger: Logger) {}
}`,
          },
          {
            task: `Name one case where inheritance fits.`,
            description: `Checks real is-a relationships.`,
            code: `class HttpError extends Error {}`,
            answer: `Custom errors: HttpError is truly an Error and needs instanceof checks and stack traces.`,
          },
          {
            easy: true,
            task: `Name which is a "has-a" relation.`,
            description: `Checks composition.`,
            code: `class Car { engine = new Engine(); }`,
            answer: `Composition: a Car has an Engine, which is more flexible than inheritance.`,
          },
          {
            easy: true,
            task: `Name the problem of deep inheritance chains.`,
            description: `Checks tight coupling.`,
            code: `class A {} class B extends A {} class C extends B {}`,
            answer: `Tight coupling: changes in a parent class can break all children.`,
          },
        ],
      },
      {
        q: `What is the difference between an interface and an abstract class? How do you write them in TypeScript?`,
        short: `An interface only describes a shape and disappears after compiling. An abstract class can have shared code and state, exists at runtime, and a class can extend only one.`,
        long: `An interface is a contract: it lists methods and properties, has no code and no runtime cost.
A class can implement many interfaces.
An abstract class cannot be created with new; it can mix real methods with abstract ones that subclasses must write.
It exists at runtime, so instanceof works, but a class can extend only one parent.
Use interfaces for contracts between modules and for test fakes; use an abstract class when several classes share real code.
In TypeScript, structural typing means any object with the right shape fits an interface, even without "implements".
Strong answer: mentions runtime existence, single inheritance and when each is the better fit.`,
        follow: `Why are interfaces handy for writing test fakes?`,
        exercises: [
          {
            task: `Predict the compile result.`,
            description: `Checks abstract classes cannot be instantiated.`,
            code: `abstract class Shape { abstract area(): number; }
const s = new Shape();`,
            answer: `Compile error: cannot create an instance of an abstract class. Only concrete subclasses can be created.`,
          },
          {
            task: `Write an interface for a storage adapter.`,
            description: `Checks TypeScript interface design.`,
            answer: `An interface has no runtime code; any object with these methods fits.`,
            solution: `interface Storage {
  get(key: string): string | null;
  set(key: string, value: string): void;
}`,
          },
          {
            easy: true,
            task: `True or false: an abstract class can hold code.`,
            description: `Checks abstract class.`,
            answer: `True: abstract classes can have implemented methods; interfaces only describe shape.`,
          },
          {
            easy: true,
            task: `Name the TypeScript keyword for a class contract.`,
            description: `Checks interface use.`,
            code: `class Dog ??? Animal {}`,
            answer: `implements: the class must provide everything the interface describes.`,
          },
        ],
      },
    ],
    senior: [
      {
        q: "Which design patterns do you really use in frontend code, like Observer, Strategy, Adapter, or Facade? Show where.",
        short: "E.g. Observer in stores/event emitters, Strategy for interchangeable algorithms, Adapter to map API DTOs to domain models, Facade around third-party SDKs. Real examples required.",
        long: `Patterns are vocabulary for solutions you probably already use; the interview value is in concrete examples.
Observer: state stores, EventTarget, subscriptions (Redux, Zustand, RxJS).
Adapter: isolate backend DTO shape so UI doesn't break on API changes.
Facade: wrap analytics/payment SDKs so they can be mocked and replaced.
Pitfalls: forcing patterns where a function suffices, Java-style class ceremony in JS.
Strong answer: specific projects, why the pattern helped, and when it was overkill.
Weak answer: textbook definitions with no real usage.`,
        exercises: [
          {
            task: `Name the pattern.`,
            description: `Checks recognizing the Adapter pattern.`,
            code: `const toUser = (dto) => ({
  id: dto.user_id,
  name: dto.full_name,
});`,
            answer: `Adapter: it converts the API shape into the shape the app uses.`,
          },
          {
            task: `Name the pattern.`,
            description: `Checks recognizing the Strategy pattern.`,
            code: `const pricing = { student: p => p * 0.5, regular: p => p };
const price = pricing[user.type](100);`,
            answer: `Strategy: the algorithm is chosen at runtime from a map, without if/else chains.`,
          },
          {
            easy: true,
            task: `Name the pattern where many listeners react to one event.`,
            description: `Checks Observer.`,
            code: `button.addEventListener('click', fn);`,
            answer: `Observer: subscribers get notified when the subject changes.`,
          },
          {
            easy: true,
            task: `Name the pattern that swaps algorithms by object.`,
            description: `Checks Strategy.`,
            code: `const sorters = { asc, desc };
sorters[mode](list);`,
            answer: `Strategy: pick an interchangeable algorithm at runtime.`,
          },
        ],
        ai: true,
      },
      {
        q: `This class uses flags and many if statements for a status workflow. Change it with the State pattern.`,
        code: `class Application {
  status = 'draft';
  submit() {
    if (this.status === 'draft') this.status = 'submitted';
    else throw new Error('Cannot submit');
  }
  approve() {
    if (this.status === 'submitted') this.status = 'approved';
    else if (this.status === 'approved') return;
    else throw new Error('Cannot approve');
  }
  withdraw() {
    if (this.status === 'draft' || this.status === 'submitted') this.status = 'withdrawn';
    else throw new Error('Cannot withdraw');
  }
}`,
        short: `Describe the allowed moves in one place, as a state map or state objects, so each new status is one entry, not a change in every method.`,
        long: `The rules for each status are spread across all methods, so a new status means editing every method.
The State pattern puts the behavior of each status in one place.
In JavaScript a simple transition table is often enough: status -> allowed action -> next status.
For complex behavior, use one object per state with its own methods.
This also makes the UI simpler: it can ask which actions are allowed now.
Strong answer: knows the pattern, picks the simplest form that fits, mentions state machine libraries like XState for bigger flows.`,
        fix: `const TRANSITIONS = {
  draft: { submit: 'submitted', withdraw: 'withdrawn' },
  submitted: { approve: 'approved', withdraw: 'withdrawn' },
  approved: {},
  withdrawn: {},
};
class Application {
  status = 'draft';
  can(action) { return action in TRANSITIONS[this.status]; }
  do(action) {
    if (!this.can(action)) throw new Error(\`Cannot \${action} from \${this.status}\`);
    this.status = TRANSITIONS[this.status][action];
  }
}`,
        follow: `How would the UI use the can method?`,
        exercises: [
          {
            task: `Rewrite with a transition map.`,
            description: `Checks replacing flags with a state machine.`,
            code: `if (status === 'draft' && action === 'submit') status = 'review';
else if (status === 'review' && action === 'approve') status = 'done';`,
            answer: `Store allowed transitions in one object, so invalid moves are easy to reject.`,
            solution: `const next = {
  draft: { submit: 'review' },
  review: { approve: 'done', reject: 'draft' },
};
status = next[status]?.[action] ?? status;`,
          },
          {
            task: `Spot the problem with these flags.`,
            description: `Checks impossible states from booleans.`,
            code: `let isDraft = true, isSubmitted = false, isApproved = false;`,
            answer: `Booleans allow impossible combos like isDraft and isApproved both true. Use one status union instead.`,
            solution: `type Status = 'draft' | 'submitted' | 'approved';`,
          },
          {
            easy: true,
            task: `Name the pattern that replaces status if-chains.`,
            description: `Checks State pattern.`,
            code: `if (s === 'draft') {} else if (s === 'sent') {}`,
            answer: `State pattern: each status becomes its own object with its own behavior.`,
          },
          {
            easy: true,
            task: `Sketch a map instead of if for statuses.`,
            description: `Checks lookup replacement.`,
            code: `const next = { draft: 'sent', sent: 'done' };`,
            answer: `Use next[status] to find the next status without branching.`,
            solution: `status = next[status];`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: "How would you model a complex business area, like an admissions workflow, on the frontend?",
        short: "Explicit domain types and state machines (e.g. XState) for workflow states, domain logic separated from UI, and tests focused on the domain layer.",
        long: `Workflows with many states and transitions become bug-prone as scattered booleans; a state machine makes illegal states unrepresentable.
Keep domain logic in framework-agnostic modules (pure functions/types) so it survives UI rewrites (e.g. Vue → React).
Align vocabulary with backend and product (ubiquitous language) and validate at boundaries.
Test the domain layer heavily with unit tests; UI tests verify wiring only.
Pitfalls: duplicating backend rules that then drift, isLoading/isSubmitted/isApproved boolean soup.
Strong answer: shows state modelling, boundaries and ownership; mentions where the source of truth lives.
Weak answer: "put everything in Redux".`,
        exercises: [
          {
            task: `Write a union type for application status.`,
            description: `Checks modeling a domain with types.`,
            answer: `A discriminated union makes each status carry only its valid data.`,
            solution: `type Application =
  | { status: 'draft' }
  | { status: 'submitted'; submittedAt: Date }
  | { status: 'decided'; decision: 'admit' | 'deny' };`,
          },
          {
            task: `Name where business rules should live.`,
            description: `Checks keeping domain logic out of UI.`,
            code: `// canSubmit rule appears in 3 components`,
            answer: `In a domain module with pure functions, like canSubmit(app). Components import it, so the rule exists once.`,
          },
          {
            easy: true,
            task: `Name the DDD term for an object with identity.`,
            description: `Checks entity.`,
            code: `class Application { id; status; }`,
            answer: `Entity: it has identity that stays the same when its data changes.`,
          },
          {
            easy: true,
            task: `Name the DDD term for a value-compared object.`,
            description: `Checks value object.`,
            code: `const money = { amount: 5, currency: 'USD' };`,
            answer: `Value object: two with equal values are treated as the same.`,
          },
        ],
        ai: true,
      },
      {
        q: "Your frontend code mixes class services, hooks, and plain modules. There is no single style. Do you make it consistent? How?",
        ai: true,
        short: "Standardize where inconsistency costs (onboarding, testing, DI) but not for its own sake: define a target style per layer, document it with examples, apply to new code, migrate opportunistically when touching code, and enforce with lint/architecture rules.",
        long: `First find the actual cost: bugs from inconsistent patterns, onboarding time, duplicated infrastructure.
Define per-layer conventions: e.g. UI = function components + hooks; services = plain modules or factories; domain = pure functions/types.
Classes are fine where they model stateful objects with lifecycles (SDK wrappers); not mandatory elsewhere.
Rollout: ADR, reference implementation, lint rules for new files, "boy scout" migration rather than a big refactor project.
Track progress and stop when the remaining inconsistency isn't worth the cost.
Strong answer: pragmatic, cost-driven, with enforcement and an endpoint.
Weak answer: "rewrite everything to classes/functions".`,
        exercises: [
          {
            task: `Decide: rewrite all classes to hooks?`,
            description: `Checks pragmatic consistency decisions.`,
            code: `// 40 class services, 60 hooks, 30 modules`,
            answer: `No big rewrite. Set a rule for new code, document it, and migrate only when touching a file.`,
          },
          {
            task: `Write a one-line rule for new code.`,
            description: `Checks clear team conventions.`,
            answer: `Example: stateless logic is plain functions, React state is hooks, and classes only wrap stateful external clients.`,
          },
          {
            easy: true,
            task: `Name the first step to unify mixed code styles.`,
            description: `Checks decision making.`,
            code: `// classes, hooks, plain modules mixed`,
            answer: `Agree on one default style in a short written decision record.`,
          },
          {
            easy: true,
            task: `Name how to enforce the chosen style.`,
            description: `Checks automation.`,
            code: `// .eslintrc rules`,
            answer: `Add lint rules and checks in CI so violations fail the build.`,
          },
        ],
      },
    ],
  },
  "Frontend app architecture": {
    junior: [
      {
        q: "How do you structure folders in a small React app?",
        short: "Group by feature (users/, orders/) with a shared folder for reusable components, hooks and utilities.",
        long: `Feature folders keep related components, hooks, API calls and tests together, so changes stay local.
A shared/ (or common/) folder holds truly generic UI and helpers.
Type-based folders (components/, hooks/, services/) work for tiny apps but scale poorly.
Pitfalls: a giant utils.js, deep relative imports, shared/ becoming a dumping ground.
Strong answer: explains why feature-first scales and mentions path aliases and co-located tests.
Weak answer: "whatever create-react-app generates".`,
        exercises: [
          {
            task: `Suggest a folder layout for a small app.`,
            description: `Checks simple, flat React structure.`,
            code: `// 10 components, 3 pages, a few API calls`,
            answer: `Keep it flat: components, pages, hooks, and api folders. Add structure only when the app grows.`,
          },
          {
            task: `Name where this file goes.`,
            description: `Checks colocating tests and styles.`,
            code: `// Button.tsx, Button.test.tsx, Button.module.css`,
            answer: `Put all three side by side in components/Button. Colocation keeps related files together.`,
          },
          {
            easy: true,
            task: `Name a common folder for reusable UI pieces.`,
            description: `Checks basic structure.`,
            code: `src/
  components/
  pages/`,
            answer: `components/ holds shared UI pieces, while pages/ holds route screens.`,
          },
          {
            easy: true,
            task: `Name where a custom hook file should live.`,
            description: `Checks hooks folder.`,
            code: `useAuth.js`,
            answer: `In a hooks/ folder, or next to the feature that uses it.`,
          },
        ],
      },
      {
        q: "What is wrong with the structure of this component? Fix it.",
        code: `function UserPage() {
  const [users, setUsers] = useState([]);
  useEffect(() => { fetch('/api/users').then((r) => r.json()).then(setUsers); }, []);
  return (
    <div>
      {users.map((u) => (
        <div key={u.id}>
          <img src={u.avatar} /> <b>{u.name}</b>
          <button onClick={() => fetch('/api/users/' + u.id, { method: 'DELETE' })}>Delete</button>
        </div>
      ))}
    </div>
  );
}`,
        fix: `// api.js
export const getUsers = () => fetch('/api/users').then((r) => r.json());
export const deleteUser = (id) => fetch(\`/api/users/\${id}\`, { method: 'DELETE' });

// UserRow.jsx
function UserRow({ user, onDelete }) {
  return (
    <li>
      <img src={user.avatar} alt="" /> <b>{user.name}</b>
      <button onClick={() => onDelete(user.id)}>Delete {user.name}</button>
    </li>
  );
}

// UserPage.jsx
function UserPage() {
  const { users, remove } = useUsers(); // hook wraps api + state
  return <ul>{users.map((u) => <UserRow key={u.id} user={u} onDelete={remove} />)}</ul>;
}`,
        short: "Data fetching, mutations and markup are all in one component, the list doesn't update after delete, errors aren't handled and the image lacks alt. Extract an API module, a hook for state, and a presentational row component.",
        long: `Small, focused components are easier to read, test and reuse.
API calls in a module mean URLs and error handling live in one place.
The delete doesn't refresh the list or handle failures — a real bug.
Semantic list markup and alt text improve accessibility.
Pitfalls: splitting into too many tiny files, passing entire objects when a few props suffice.
Strong answer: separates data, logic and view and fixes the delete bug.
Weak answer: only moves JSX into another file.`,
        exercises: [
          {
            task: `Spot the problem.`,
            description: `Checks components defined inside components.`,
            code: `function List({ items }) {
  const Row = ({ i }) => <li>{i}</li>;
  return items.map(i => <Row key={i} i={i} />);
}`,
            answer: `Row is a new component on every render, so React remounts all rows and loses state. Move Row outside List.`,
          },
          {
            task: `Fix the derived state bug.`,
            description: `Checks computing values during render.`,
            code: `const [full, setFull] = useState('');
useEffect(() => setFull(first + ' ' + last), [first, last]);`,
            answer: `The effect causes an extra render. Compute the value directly during render.`,
            solution: `const full = first + ' ' + last;`,
          },
          {
            easy: true,
            task: `Spot the problem in this component.`,
            description: `Checks mixed concerns.`,
            code: `function List() {
  const [d, setD] = useState([]);
  fetch('/api').then(r => r.json()).then(setD);`,
            answer: `Fetch runs on every render; move it into useEffect or a data hook.`,
          },
          {
            easy: true,
            task: `Name where to put the helper formatting function.`,
            description: `Checks extracting logic.`,
            code: `const fmt = d => d.toLocaleDateString();`,
            answer: `Move it to a utils file outside the component, so it is reusable.`,
          },
        ],
      },
    ],
    middle: [
      {
        q: "Where should API calls go? Why not inside components?",
        short: "In a service/API layer consumed through query hooks: it's testable, reusable and gives one place for auth, errors and caching.",
        long: `Fetching directly in components mixes concerns, duplicates logic and makes race conditions and caching hard.
An API module defines endpoints and DTO mapping; hooks (e.g. TanStack Query) handle caching, loading and retries.
Components only render states (loading/error/data) and call mutations.
Pitfalls: useEffect fetches without cancellation, duplicated base URLs/headers, swallowing errors.
Strong answer: layered approach, mentions caching/invalidation and mocking (MSW) in tests.
Weak answer: "useEffect with fetch is fine everywhere".`,
        exercises: [
          {
            task: `Move this fetch into a hook.`,
            description: `Checks separating data fetching from UI.`,
            code: `function Users() {
  const [u, setU] = useState([]);
  useEffect(() => { fetch('/api/users').then(r => r.json()).then(setU); }, []);
}`,
            answer: `Use a data hook such as TanStack Query, so caching, loading, and errors are handled once.`,
            solution: `const useUsers = () => useQuery({
  queryKey: ['users'],
  queryFn: () => fetch('/api/users').then(r => r.json()),
});`,
          },
          {
            task: `Name two problems with fetch in many components.`,
            description: `Checks duplicated requests and logic.`,
            code: `// 5 components each fetch /api/me`,
            answer: `Duplicate network requests and duplicated error and auth handling. A shared API layer or query cache fixes both.`,
          },
          {
            easy: true,
            task: `Name the layer that should hold fetch calls.`,
            description: `Checks API layer.`,
            code: `// not in the component`,
            answer: `A separate API service module, called by hooks or query code.`,
          },
          {
            easy: true,
            task: `Fix the hardcoded URL in the component.`,
            description: `Checks centralizing endpoints.`,
            code: `fetch('https://api.x.com/users')`,
            answer: `Put the base URL in one API client, so it is changed in one place.`,
            solution: `api.get('/users');`,
          },
        ],
      },
      {
        q: `How do you handle configuration for different environments, like development, staging and production, in a frontend app?`,
        short: `Keep config out of the code: read it from build-time env variables or a runtime config file, validate it at startup, and never put secrets in it.`,
        long: `Frontend config is things like API URLs, feature flags and analytics keys.
Build-time config (for example import.meta.env in Vite) is baked into the bundle, so you need one build per environment.
Runtime config (a config.json or a window variable injected by the server) lets you build once and deploy the same artifact everywhere.
Validate config at startup with a schema so a missing value fails fast with a clear error.
Everything shipped to the browser is public, so never put secrets there.
Strong answer: compares build-time and runtime config, mentions "build once, deploy many" and validation.`,
        follow: `Why is it risky to have a different build for each environment?`,
        exercises: [
          {
            task: `Spot the security problem.`,
            description: `Checks secrets in frontend env variables.`,
            code: `VITE_API_URL=https://api.example.com
VITE_STRIPE_SECRET=sk_live_123`,
            answer: `Every VITE_ variable is bundled into public JS. Secret keys must stay on the server.`,
          },
          {
            task: `Write a runtime config loader.`,
            description: `Checks build once, configure per environment.`,
            code: `// One build must run in dev, staging, prod.`,
            answer: `Load config.json at startup, so one build works in every environment.`,
            solution: `const config = await fetch('/config.json').then(r => r.json());
export const API_URL = config.apiUrl;`,
          },
          {
            easy: true,
            task: `Name where to keep environment-specific URLs.`,
            description: `Checks env config.`,
            code: `VITE_API_URL=https://staging.x.com`,
            answer: `In environment variables set at build time, not hardcoded in source.`,
          },
          {
            easy: true,
            task: `True or false: secrets are safe in frontend env vars.`,
            description: `Checks client exposure.`,
            code: `VITE_SECRET_KEY=abc`,
            answer: `False: frontend variables end up in the bundle, so anyone can read them.`,
          },
        ],
      },
    ],
    senior: [
      {
        q: "Design a real-time dashboard with thousands of updates per minute. Draw it.",
        short: "WebSocket/SSE feed, batched/throttled updates into a normalized store, heavy work in a Web Worker, virtualized rendering, plus reconnection with resync.",
        long: `Rendering per message will melt the main thread; buffer messages and flush on requestAnimationFrame or every N ms.
Normalize by id so updates are O(1) and only affected rows re-render (selectors/memoization).
Parse/aggregate in a Worker; virtualize long lists and charts.
Handle disconnects: exponential backoff, sequence numbers or snapshots to resync missed events.
Pitfalls: storing whole payloads in React state, unbounded buffers, no backpressure, tabs in background.
Strong answer: draws data flow end-to-end and discusses failure modes and observability.
Weak answer: "use WebSockets and setState".`,
        exercises: [
          {
            task: `Write a batched update for fast messages.`,
            description: `Checks throttling renders with requestAnimationFrame.`,
            code: `ws.onmessage = e => setData(JSON.parse(e.data));`,
            answer: `Buffer messages and flush once per frame, instead of one render per message.`,
            solution: `let buf = [];
ws.onmessage = e => buf.push(JSON.parse(e.data));
const flush = () => { if (buf.length) setData(buf.splice(0)); requestAnimationFrame(flush); };
requestAnimationFrame(flush);`,
          },
          {
            task: `Name the transport for server-to-client updates.`,
            description: `Checks SSE versus WebSocket choice.`,
            code: `// Only the server pushes updates`,
            answer: `Server-Sent Events: simple, one-way, auto-reconnecting over HTTP. Use WebSocket only if the client also sends often.`,
          },
          {
            easy: true,
            task: `Name a browser API for pushing live server updates.`,
            description: `Checks WebSocket.`,
            code: `const ws = new WebSocket('wss://x.com');`,
            answer: `WebSocket: a two-way connection that streams updates without polling.`,
          },
          {
            easy: true,
            task: `Name a trick to avoid rendering every update.`,
            description: `Checks batching.`,
            code: `// 1000 messages per minute`,
            answer: `Batch updates and render once per animation frame or per short interval.`,
          },
        ],
        ai: true,
      },
      {
        q: `This page loads three things one after another, so it is slow. Change the data loading.`,
        code: `async function loadPage(userId) {
  const user = await api.getUser(userId);
  const settings = await api.getSettings(userId);
  const news = await api.getNews();
  return { user, settings, news };
}`,
        short: `The requests do not depend on each other, so start them together with Promise.all. Use allSettled when one failure should not break the page.`,
        long: `Each await waits for the previous request, so the total time is the sum of all three. This is a request waterfall.
None of the calls need data from another call, so they can run in parallel and the total time becomes the slowest one.
Promise.all fails fast if any request fails. If news is optional, use Promise.allSettled and show a partial page.
At the architecture level, start loading as early as possible (in the route loader, not deep in a child component), and avoid components that fetch only after their parent finishes.
Strong answer: finds the waterfall, chooses all vs allSettled on purpose and talks about where loading starts.`,
        fix: `async function loadPage(userId) {
  const [user, settings, news] = await Promise.allSettled([
    api.getUser(userId),
    api.getSettings(userId),
    api.getNews(),
  ]);
  if (user.status === 'rejected') throw user.reason;
  return {
    user: user.value,
    settings: settings.status === 'fulfilled' ? settings.value : DEFAULT_SETTINGS,
    news: news.status === 'fulfilled' ? news.value : [],
  };
}`,
        follow: `How do you find request waterfalls in a real app?`,
        exercises: [
          {
            task: `Fix the request waterfall.`,
            description: `Checks parallel requests with Promise.all.`,
            code: `const user = await getUser();
const stats = await getStats();
const news = await getNews();`,
            answer: `The calls are independent, so run them at the same time.`,
            solution: `const [user, stats, news] = await Promise.all([
  getUser(), getStats(), getNews(),
]);`,
          },
          {
            task: `Pick Promise.all or Promise.allSettled.`,
            description: `Checks partial failure handling.`,
            code: `// The news widget may fail; the page must still load.`,
            answer: `Promise.allSettled: it waits for all and reports each result, so one failure does not reject everything.`,
          },
          {
            easy: true,
            task: `Fix the sequential loads to run together.`,
            description: `Checks Promise.all.`,
            code: `const a = await getA();
const b = await getB();`,
            answer: `Use Promise.all so both requests run at the same time.`,
            solution: `const [a, b] = await Promise.all([getA(), getB()]);`,
          },
          {
            easy: true,
            task: `Name the problem of one request waiting for another.`,
            description: `Checks request waterfall.`,
            code: `// load user, then posts, then comments`,
            answer: `A waterfall: total time becomes the sum of all request times.`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: "Plan a step-by-step move from Vue 2 to React while you keep shipping features. What do you decide first?",
        short: "Strangler-fig approach: decide the routing/integration boundary, shared design system and API layer, feature flags, parity tests, telemetry and a clear definition of done per page.",
        long: `First decisions: integration strategy (route-level vs micro-frontend vs embedded components) and how auth/session/state are shared.
Freeze new features in Vue (or build them only in React) to avoid moving targets.
Migrate page by page behind feature flags with parity checklists and visual/E2E tests.
Track progress and errors via telemetry; define rollback per page.
Pitfalls: big-bang rewrite, two divergent design systems, duplicated business logic drifting between frameworks.
Strong answer: sequencing, risk management, team enablement and a measurable end state (Vue removal date).
Weak answer: "rewrite everything in a new repo".`,
        exercises: [
          {
            task: `Name the first decision in a Vue to React move.`,
            description: `Checks choosing a migration strategy.`,
            code: `// Big Vue 2 app, features still shipping`,
            answer: `Choose the strategy: page-by-page with a shared shell and routing, so both apps run side by side.`,
          },
          {
            task: `Name two things to share between both apps.`,
            description: `Checks avoiding duplicated cross-cutting logic.`,
            code: `// Vue and React run side by side`,
            answer: `Auth session and the API client or design tokens. Sharing them avoids two different behaviors.`,
          },
          {
            easy: true,
            task: `Name a safe way to run Vue and React together.`,
            description: `Checks incremental migration.`,
            code: `// migrate one page at a time`,
            answer: `Route by page or feature, so old and new code coexist during the move.`,
          },
          {
            easy: true,
            task: `Name what to protect before migrating a page.`,
            description: `Checks tests first.`,
            code: `// legacy page has no tests`,
            answer: `Add tests for current behavior first, so you can prove nothing broke.`,
          },
        ],
        ai: true,
      },
      {
        q: "Several teams build features in the same frontend. When would you pick micro-frontends instead of a modular monolith? What would you standardize in both cases?",
        ai: true,
        short: "Prefer a modular monolith (one repo/build, enforced module boundaries) unless teams truly need independent deployments or tech stacks. Micro-frontends add runtime, version and UX-consistency costs. Either way standardize design system, routing, auth, observability and contracts between modules.",
        long: `Micro-frontends solve organizational problems (independent deploys, autonomy) at the cost of duplicated dependencies, runtime integration, inconsistent UX and harder debugging.
A modular monolith with clear ownership (CODEOWNERS), boundary lint rules and per-module tests often gives most benefits.
If you go micro-frontends: Module Federation or route-level split, shared singleton deps, versioned contracts, shared shell for auth/nav.
Standardize: design system, error/analytics SDKs, performance budgets, release process.
Pitfalls: choosing MFEs for a 2-team org, shared state across MFEs, each team picking a framework.
Strong answer: frames as Conway's law trade-off with migration path.
Weak answer: "micro-frontends are the modern way".`,
        exercises: [
          {
            task: `Name two costs of micro-frontends.`,
            description: `Checks trade-offs of distributed frontends.`,
            code: `// 3 teams, 1 product`,
            answer: `Duplicate dependencies make bundles bigger, and shared UI and versioning get harder. A modular monolith is often enough.`,
          },
          {
            task: `Name a tool to enforce module boundaries.`,
            description: `Checks boundary linting in a monolith.`,
            code: `// features/* must not import each other`,
            answer: `Use eslint-plugin-boundaries or Nx module boundary rules, checked in CI.`,
          },
          {
            easy: true,
            task: `Name the main cost of micro-frontends.`,
            description: `Checks complexity tradeoff.`,
            code: `// 5 apps, 5 builds`,
            answer: `More operational complexity: versions, shared dependencies, and consistent UX are harder.`,
          },
          {
            easy: true,
            task: `Name a team signal that micro-frontends may help.`,
            description: `Checks when to use.`,
            code: `// 8 teams, one deploy queue`,
            answer: `Many teams blocked by one shared deploy and codebase.`,
          },
        ],
      },
    ],
  },
  CSS: {
    junior: [
      {
        q: "Explain the box model and the box-sizing property. Then center a div.",
        short: "A box is content + padding + border + margin; box-sizing: border-box makes width include padding and border. Center with flex or grid alignment.",
        long: `With content-box (default) width applies only to content, so padding/border make the element wider than declared.
border-box is the common global reset because sizes become predictable.
Margins are outside the box and vertical margins can collapse between blocks.
Centering: display:flex + justify-content/align-items, or display:grid + place-items:center.
Pitfalls: forgetting height on the parent for vertical centering, margin collapse surprises.
Strong answer: explains both box-sizing values and two centering techniques.
Weak answer: "use margin: auto" only.`,
        exercises: [
          {
            task: `Predict the element width.`,
            description: `Checks content-box versus border-box.`,
            code: `.box { width: 200px; padding: 20px; border: 5px solid; }`,
            answer: `250px with the default content-box. With box-sizing: border-box it stays 200px.`,
            solution: `*, *::before, *::after { box-sizing: border-box; }`,
          },
          {
            task: `Center a div in its parent.`,
            description: `Checks modern centering with grid.`,
            code: `.parent { height: 300px; }`,
            answer: `Grid with place-items centers both ways in one line.`,
            solution: `.parent { height: 300px; display: grid; place-items: center; }`,
          },
          {
            easy: true,
            task: `Name the value that makes padding stay inside the width.`,
            description: `Checks box-sizing.`,
            code: `* { box-sizing: ???; }`,
            answer: `border-box: width includes padding and border.`,
          },
          {
            easy: true,
            task: `Center a div with Flexbox.`,
            description: `Checks flex centering.`,
            code: `.box {
  display: flex;
  ???
}`,
            answer: `Use justify-content: center and align-items: center.`,
            solution: `justify-content: center;
align-items: center;`,
          },
        ],
      },
      {
        q: "Explain CSS specificity and the cascade. Why does this button not turn red?",
        code: `#app .btn { color: blue; }
.btn.danger { color: red; }
/* <div id="app"><button class="btn danger">Delete</button></div> */`,
        fix: `/* Avoid IDs for styling; keep specificity flat */
.app .btn { color: blue; }
.btn.danger { color: red; } /* same specificity (0,2,0), later wins */`,
        short: "Specificity is compared as (IDs, classes/attributes/pseudo-classes, elements). #app .btn is (1,1,0) and beats .btn.danger (0,2,0) regardless of order. Lower the first selector's specificity rather than adding !important.",
        long: `The cascade considers origin and importance, then cascade layers, then specificity, then source order.
Inline styles beat selectors; !important flips the order and should be a last resort.
IDs in selectors create specificity that is hard to override — prefer classes.
:where() has zero specificity; :is()/:not()/:has() take their most specific argument.
Pitfalls: specificity wars, overusing !important, deeply nested Sass generating long selectors.
Strong answer: calculates both specificities and proposes flattening.
Weak answer: "add !important".`,
        exercises: [
          {
            task: `Predict the button color.`,
            description: `Checks ID versus class specificity.`,
            code: `#save { color: blue; }
.btn.danger { color: red; }`,
            answer: `Blue. One ID (1,0,0) beats two classes (0,2,0), no matter the order.`,
          },
          {
            task: `Predict the text color.`,
            description: `Checks source order with equal specificity.`,
            code: `.a { color: red; }
.b { color: green; }
/* <p class="b a"> */`,
            answer: `Green. Same specificity, so the later rule wins. Class order in HTML does not matter.`,
          },
          {
            easy: true,
            task: `Predict the color.`,
            description: `Checks ID versus class specificity.`,
            code: `#btn { color: blue; }
.btn { color: red; }`,
            answer: `Blue: an ID selector is more specific than a class selector.`,
          },
          {
            easy: true,
            task: `Predict the color.`,
            description: `Checks source order rule.`,
            code: `p { color: red; }
p { color: green; }`,
            answer: `Green: with equal specificity, the later rule wins.`,
          },
        ],
      },
    ],
    middle: [
      {
        q: "Why does a z-index of 9999 not put the modal on top?",
        code: `.card { transform: translateZ(0); }
.card .modal { position: fixed; z-index: 9999; }`,
        short: "transform creates a new stacking context (and a containing block for fixed elements), so the modal's z-index only competes inside .card. Portal the modal to body.",
        long: `z-index only compares elements within the same stacking context.
Stacking contexts are created by transform, filter, opacity < 1, position + z-index, isolation, will-change, contain and more.
A transformed ancestor also becomes the containing block for position: fixed, so the modal is positioned relative to the card.
Fix: render the modal in a portal at document.body (or use the native <dialog> top layer).
Pitfalls: escalating z-index wars (99999), not knowing which property created the context.
Strong answer: names stacking contexts, the fixed containing block, and portal/<dialog>.
Weak answer: "increase z-index more".`,
        exercises: [
          {
            task: `Spot why the modal is under the header.`,
            description: `Checks stacking contexts.`,
            code: `.page { transform: translateZ(0); }
.modal { position: fixed; z-index: 9999; }
.header { position: relative; z-index: 10; }`,
            answer: `The transform on .page creates a stacking context, so the modal z-index works only inside it. Render the modal in a portal at body.`,
          },
          {
            task: `Name two properties that create a stacking context.`,
            description: `Checks stacking context triggers.`,
            code: `.modal-parent { /* which props trap z-index? */ }`,
            answer: `For example opacity below 1 and transform. Also position with z-index, filter, and isolation: isolate.`,
          },
          {
            easy: true,
            task: `Name the property z-index needs to work.`,
            description: `Checks positioned elements.`,
            code: `.modal { z-index: 9999; }`,
            answer: `A position other than static (or flex/grid item); otherwise z-index is ignored.`,
            solution: `.modal { position: fixed; z-index: 9999; }`,
          },
          {
            easy: true,
            task: `Name what creates a new stacking context.`,
            description: `Checks stacking context.`,
            code: `.parent { transform: scale(1); }`,
            answer: `A transform, which traps child z-index values inside the parent.`,
          },
        ],
      },
      {
        q: "Build this responsive card grid without media queries. Why does the current one break?",
        code: `.grid { display: flex; flex-wrap: wrap; }
.grid > .card { width: 33.33%; margin: 8px; }`,
        fix: `.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr));
  gap: 16px;
}`,
        short: "33.33% width plus margins exceeds 100%, so only two cards fit per row, and it never adapts to small screens. Use grid with repeat(auto-fill, minmax(...)) and gap, which handles columns and spacing intrinsically.",
        long: `Margins add to percentage widths (box-sizing doesn't include margins), causing overflow and wrapping.
gap provides spacing without affecting item width calculations (works in flex too).
auto-fill vs auto-fit: auto-fit collapses empty tracks so items stretch; auto-fill keeps empty tracks.
min(240px, 100%) prevents overflow on very narrow containers.
Pitfalls: negative margin hacks, fixed pixel widths, forgetting min-width: 0 for flex/grid children with long content.
Strong answer: explains the bug and the intrinsic grid solution.
Weak answer: adds three media queries.`,
        exercises: [
          {
            task: `Write a responsive grid without media queries.`,
            description: `Checks auto-fill with minmax.`,
            code: `.grid { display: grid; }`,
            answer: `auto-fill with minmax makes as many columns as fit.`,
            solution: `.grid {
  display: grid; gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr));
}`,
          },
          {
            task: `Explain auto-fill versus auto-fit.`,
            description: `Checks empty track behavior.`,
            code: `repeat(auto-fit, minmax(200px, 1fr))`,
            answer: `auto-fit collapses empty tracks so items stretch; auto-fill keeps empty columns. It shows only with few items.`,
          },
          {
            easy: true,
            task: `Fix the grid so cards wrap automatically.`,
            description: `Checks auto-fit.`,
            code: `.grid {
  display: grid;
  grid-template-columns: repeat(???, minmax(200px, 1fr));
}`,
            answer: `Use auto-fit, so columns wrap without media queries.`,
            solution: `repeat(auto-fit, minmax(200px, 1fr))`,
          },
          {
            easy: true,
            task: `Add the property that spaces grid items.`,
            description: `Checks gap.`,
            code: `.grid { display: grid; ??? : 16px; }`,
            answer: `gap adds space between rows and columns.`,
          },
        ],
      },
    ],
    senior: [
      {
        q: "When do you use Flexbox, Grid, container queries, the has selector, and cascade layers?",
        short: "Flex for 1D, Grid for 2D layout; container queries for component-level responsiveness; :has() for parent/state selection; @layer to control cascade order instead of specificity hacks.",
        long: `Flexbox distributes items along one axis and is content-driven; Grid defines rows and columns and is layout-driven.
Container queries let a component adapt to its container width rather than the viewport — key for reusable components.
:has() enables parent selectors (e.g. style a field when its input is invalid) without JS.
@layer orders the cascade (reset < base < components < utilities), so third-party CSS can't win by specificity.
Pitfalls: Grid for everything, forgetting container-type, heavy :has() selectors on large DOMs.
Strong answer: concrete use case for each and browser-support awareness.
Weak answer: "Grid replaced Flexbox".`,
        exercises: [
          {
            task: `Write a container query for a card.`,
            description: `Checks component-level responsiveness.`,
            code: `.card-wrap { container-type: inline-size; }`,
            answer: `The card reacts to its container width, not the viewport.`,
            solution: `@container (min-width: 400px) {
  .card { display: flex; }
}`,
          },
          {
            task: `Write a :has rule for invalid fields.`,
            description: `Checks the parent selector.`,
            code: `/* style the label wrapper when its input is invalid */`,
            answer: `Select the parent that contains an invalid input.`,
            solution: `.field:has(input:user-invalid) { border-color: red; }`,
          },
          {
            easy: true,
            task: `Name the selector that styles a parent by its child.`,
            description: `Checks :has.`,
            code: `.card:has(img) { padding: 0; }`,
            answer: `:has(), which matches a card containing an img.`,
          },
          {
            easy: true,
            task: `Choose Flexbox or Grid for a single row of buttons.`,
            description: `Checks 1D versus 2D.`,
            code: `<div class="actions"><button/><button/></div>`,
            answer: `Flexbox, because it lays out items in one dimension.`,
          },
        ],
      },
      {
        q: "How do you make CSS animations that are accessible and fast? What makes an animation stutter?",
        short: "Animate compositor-friendly properties (transform, opacity), avoid layout properties (width, top, height), respect prefers-reduced-motion, use will-change sparingly, and verify in the Performance panel. Jank comes from layout/paint on every frame or main-thread work.",
        long: `Rendering pipeline: style → layout → paint → composite. Changing width/top triggers layout each frame; transform/opacity can run on the compositor.
will-change promotes layers but costs memory — apply just before animating, remove after.
prefers-reduced-motion: reduce or remove non-essential motion (WCAG 2.3.3).
View Transitions API and @starting-style enable smooth state transitions with less JS.
Pitfalls: animating box-shadow on large elements, too many layers, JS-driven animations with setTimeout.
Strong answer: pipeline explanation, property choice, accessibility and measurement.
Weak answer: "use a library".`,
        exercises: [
          {
            task: `Fix the stuttering animation.`,
            description: `Checks animating layout properties.`,
            code: `.panel { transition: left 0.3s; }
.panel.open { left: 0; }`,
            answer: `left triggers layout each frame. Animate transform instead, which runs on the compositor.`,
            solution: `.panel { transition: transform 0.3s; transform: translateX(-100%); }
.panel.open { transform: none; }`,
          },
          {
            task: `Add reduced motion support.`,
            description: `Checks prefers-reduced-motion.`,
            code: `.spinner { animation: spin 1s infinite; }`,
            answer: `Respect the user setting by turning motion off or down.`,
            solution: `@media (prefers-reduced-motion: reduce) {
  .spinner { animation: none; }
}`,
          },
          {
            easy: true,
            task: `Name the media query to respect reduced motion.`,
            description: `Checks accessibility.`,
            code: `@media (prefers-reduced-motion: ???) {
  * { animation: none; }
}`,
            answer: `reduce: users who asked for less motion get no animation.`,
          },
          {
            easy: true,
            task: `Pick the cheaper property to animate.`,
            description: `Checks compositor properties.`,
            code: `/* left: 0 -> 100px   or   transform: translateX(100px) */`,
            answer: `transform, because it avoids layout and runs on the GPU.`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: "For a large company, which do you pick: CSS-in-JS, CSS modules, or Tailwind? What is your migration plan?",
        short: "Decide by runtime cost (runtime CSS-in-JS conflicts with RSC/streaming), DX, design tokens and consistency; usually zero-runtime options (CSS modules, Tailwind, compiled CSS-in-JS) with a gradual migration.",
        long: `Runtime CSS-in-JS (styled-components, Emotion) adds JS cost and has friction with React Server Components.
CSS modules are simple and standards-based; Tailwind gives consistency via constrained tokens but needs conventions.
Whatever the choice, design tokens (CSS custom properties) must be the shared source of truth.
Migration: freeze new usage of the old approach, codemods where possible, migrate per component with visual regression tests.
Pitfalls: mixing three approaches forever, ignoring the existing component library (e.g. MUI/Emotion).
Strong answer: criteria, pilot, metrics (bundle size, lint rules) and a timeline.
Weak answer: personal preference only.`,
        exercises: [
          {
            task: `Name a cost of runtime CSS-in-JS.`,
            description: `Checks runtime style performance.`,
            code: `// styled-components in a React 19 app`,
            answer: `It computes styles at runtime, which slows rendering and complicates streaming SSR. Zero-runtime options avoid this.`,
          },
          {
            task: `Name a safe first step for a CSS migration.`,
            description: `Checks incremental styling migration.`,
            code: `// 300 components on styled-components`,
            answer: `Use the new approach only for new components, wrap old ones, and migrate when touching files. Track progress with a lint rule.`,
          },
          {
            easy: true,
            task: `Name a benefit of CSS modules.`,
            description: `Checks scoping.`,
            code: `import s from './a.module.css';`,
            answer: `Class names are scoped locally, so styles do not clash.`,
          },
          {
            easy: true,
            task: `Name a common Tailwind drawback.`,
            description: `Checks tradeoffs.`,
            code: `<div class="p-4 flex items-center bg-white">`,
            answer: `Long class lists can hurt readability without good component extraction.`,
          },
        ],
        ai: true,
      },
      {
        q: "The design system CSS is now 600 kilobytes. Teams override it with the important flag everywhere. How do you fix this without stopping feature work?",
        ai: true,
        short: "Measure what's used, introduce cascade layers so overrides work without !important, publish tokens and component APIs that cover real override needs, deprecate and remove dead CSS incrementally, and add lint/budget guardrails.",
        long: `Audit: coverage tools to find unused CSS, grep !important overrides to learn what teams actually need.
Cascade layers (reset, design-system, app) let app styles win cleanly — removes the main reason for !important.
Close the gaps: variants/props/tokens for the common overrides; a contribution process so teams don't fork.
Split CSS per component/route to cut the initial payload; set a CSS budget in CI.
Lint: stylelint declaration-no-important, disallow targeting design-system internal class names.
Pitfalls: big-bang rewrite, breaking consumers without versioning, no deprecation path.
Strong answer: data-driven plan, migration path and governance.
Weak answer: "tell teams to stop using !important".`,
        exercises: [
          {
            task: `Rewrite with cascade layers.`,
            description: `Checks layers replacing !important.`,
            code: `.btn { color: red !important; }`,
            answer: `Put the design system in a lower layer, so app styles win without !important.`,
            solution: `@layer ds, app;
@layer ds { .btn { color: blue; } }
@layer app { .btn { color: red; } }`,
          },
          {
            task: `Name a tool to find unused CSS.`,
            description: `Checks measuring CSS coverage.`,
            answer: `Chrome DevTools Coverage tab shows unused bytes. PurgeCSS can remove unused rules in the build.`,
          },
          {
            easy: true,
            task: `Name why !important spreads in large CSS.`,
            description: `Checks override cycle.`,
            code: `.btn { color: red !important; }`,
            answer: `Teams use it to win specificity fights, which forces more !important later.`,
          },
          {
            easy: true,
            task: `Name the CSS feature to control override order safely.`,
            description: `Checks cascade layers.`,
            code: `@layer base, components, overrides;`,
            answer: `Cascade layers: later layers win regardless of selector specificity.`,
          },
        ],
      },
    ],
  },
  "Networking (Fetch API or others)": {
    junior: [
      {
        q: `This search link breaks when the user types the and sign or a space. Fix it.`,
        code: `const url = '/api/search?q=' + query + '&page=' + page;
fetch(url);`,
        short: `Query values must be encoded. Use URLSearchParams or encodeURIComponent so special characters do not break the URL.`,
        long: `A URL has parts: protocol, host, path, query string and hash.
In the query string, & separates pairs, = separates key and value, and # starts the hash.
If the user types "a&b", the server sees q=a and a new key b.
URLSearchParams or encodeURIComponent turns special characters into safe codes like %26.
Never put personal data in URLs; they end up in logs and history.
Strong answer: knows URL parts, uses URL and URLSearchParams, and mentions the privacy risk.`,
        fix: `const url = new URL('/api/search', location.origin);
url.searchParams.set('q', query);
url.searchParams.set('page', String(page));
fetch(url);`,
        follow: `What is the difference between encodeURI and encodeURIComponent?`,
        exercises: [
          {
            task: `Fix the bug.`,
            description: `Checks URL encoding of user input.`,
            code: `fetch('/search?q=' + query); // query = 'tom & jerry'`,
            answer: `The & starts a new parameter. Encode the value or use URLSearchParams.`,
            solution: `const params = new URLSearchParams({ q: query });
fetch('/search?' + params);`,
          },
          {
            task: `Predict the output.`,
            description: `Checks encodeURIComponent versus encodeURI.`,
            code: `console.log(encodeURI('a&b c'), encodeURIComponent('a&b c'));`,
            answer: `a&b%20c and a%26b%20c. encodeURI keeps & because it is for full URLs; use encodeURIComponent for values.`,
          },
          {
            easy: true,
            task: `Fix the query string with a space.`,
            description: `Checks encodeURIComponent.`,
            code: `const url = '/s?q=' + 'rock & roll';`,
            answer: `Wrap the value in encodeURIComponent so & and spaces are escaped.`,
            solution: `'/s?q=' + encodeURIComponent('rock & roll')`,
          },
          {
            easy: true,
            task: `Name a safer way to build query strings.`,
            description: `Checks URLSearchParams.`,
            code: `new URLSearchParams({ q: 'a&b' }).toString();`,
            answer: `URLSearchParams, which encodes values for you automatically.`,
          },
        ],
      },
      {
        q: "What do the HTTP status code groups mean? Which codes should a frontend handle on purpose?",
        short: "1xx informational, 2xx success, 3xx redirection, 4xx client error, 5xx server error. Frontends commonly handle 200/201/204, 400/422 (validation), 401 (re-auth), 403 (forbidden), 404, 409 (conflict), 429 (rate limit) and 5xx (retry/report).",
        long: `201 Created usually returns the new resource or Location; 204 No Content has no body — don't call res.json().
401 means unauthenticated (refresh/login); 403 means authenticated but not allowed (don't retry).
400/422 carry validation details to show next to fields.
409 indicates a conflict (stale update); 429 should respect Retry-After.
5xx: show a friendly error, maybe retry idempotent requests, and report to monitoring.
Strong answer: maps codes to concrete UI behaviour.
Weak answer: "200 is good, others are errors".`,
        exercises: [
          {
            task: `Spot the bug.`,
            description: `Checks that fetch does not reject on HTTP errors.`,
            code: `try {
  const data = await fetch('/api').then(r => r.json());
} catch { showError(); }`,
            answer: `fetch resolves on 404 and 500, so no error shows. Check res.ok.`,
            solution: `const res = await fetch('/api');
if (!res.ok) throw new Error('HTTP ' + res.status);
const data = await res.json();`,
          },
          {
            task: `Name the frontend action for each code.`,
            description: `Checks handling common status codes.`,
            code: `// 401, 403, 404, 429`,
            answer: `401: redirect to login. 403: show no access. 404: not found page. 429: wait and retry later.`,
          },
          {
            easy: true,
            task: `Name the status code group for server errors.`,
            description: `Checks 5xx.`,
            code: `HTTP/1.1 503`,
            answer: `5xx: the server failed to handle a valid request.`,
          },
          {
            easy: true,
            task: `Name the status code for "not authenticated".`,
            description: `Checks 401.`,
            code: `HTTP/1.1 ???`,
            answer: `401 Unauthorized: the user must log in again.`,
          },
        ],
      },
    ],
    middle: [
      {
        q: "Explain CORS. Why is a preflight request sent?",
        short: "Browsers block cross-origin reads unless the server opts in via Access-Control-Allow-* headers. A preflight OPTIONS request is sent for non-simple methods, headers or content types.",
        long: `CORS is enforced by the browser, not the server — curl/Postman ignore it.
Simple requests (GET/POST/HEAD with simple headers and form/text content types) go straight through; the response is just blocked if not allowed.
Anything else (PUT, DELETE, Authorization header, application/json) triggers a preflight OPTIONS.
With cookies you need credentials: 'include' plus Access-Control-Allow-Credentials: true and a specific (non-*) origin.
Pitfalls: "fixing" CORS with no-cors mode (opaque response), wildcard origin with credentials, not caching preflights (Access-Control-Max-Age).
Strong answer: explains simple vs preflighted requests and credentials rules.
Weak answer: "install a CORS browser extension".`,
        exercises: [
          {
            task: `Predict whether a preflight is sent.`,
            description: `Checks simple versus preflighted requests.`,
            code: `fetch('https://api.other.com/x', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
});`,
            answer: `Yes. JSON content type is not a simple request, so the browser sends OPTIONS first.`,
          },
          {
            task: `Fix the server headers for credentials.`,
            description: `Checks CORS with cookies.`,
            code: `Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true`,
            answer: `A wildcard origin is not allowed with credentials. Return the exact origin.`,
            solution: `Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Credentials: true
Vary: Origin`,
          },
          {
            easy: true,
            task: `Name the header a server sends to allow another origin.`,
            description: `Checks CORS header.`,
            code: `Access-Control-Allow-???: https://app.com`,
            answer: `Origin: Access-Control-Allow-Origin names the allowed website.`,
          },
          {
            easy: true,
            task: `Name the request that asks permission before the real one.`,
            description: `Checks preflight.`,
            code: `OPTIONS /api HTTP/1.1`,
            answer: `The preflight request, which uses the OPTIONS method.`,
          },
        ],
      },
      {
        q: "Fix this search. It should not send too many requests. It should never show results for an old query.",
        code: `input.addEventListener('input', async (e) => {
  const res = await fetch('/api/search?q=' + e.target.value);
  render(await res.json());
});`,
        fix: `let controller;
const search = debounce(async (q) => {
  controller?.abort();
  controller = new AbortController();
  try {
    const res = await fetch(\`/api/search?q=\${encodeURIComponent(q)}\`, { signal: controller.signal });
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    render(await res.json());
  } catch (e) {
    if (e.name !== 'AbortError') showError(e);
  }
}, 300);
input.addEventListener('input', (e) => search(e.target.value));`,
        short: "Debounce input to cut request volume, abort the previous request with AbortController so stale responses are ignored, encode the query and check res.ok.",
        long: `Every keystroke sends a request; responses can return out of order and overwrite newer results.
Debounce (wait for a pause) reduces load; AbortController cancels in-flight requests so only the latest wins.
encodeURIComponent prevents broken URLs with &, # or spaces.
Consider minimum query length, caching recent results and showing loading state.
Pitfalls: throttle instead of debounce for search, ignoring AbortError handling, debounce recreated each render in React.
Strong answer: combines debounce, abort, encoding and error handling.
Weak answer: debounce only.`,
        exercises: [
          {
            task: `Write a debounce function.`,
            description: `Checks timers and closures.`,
            code: `// debounce(fn, 300) runs fn 300ms after the last call`,
            answer: `Clear the previous timer on each call.`,
            solution: `function debounce(fn, ms) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}`,
          },
          {
            task: `Fix the stale results bug.`,
            description: `Checks aborting old requests.`,
            code: `useEffect(() => {
  fetch('/s?q=' + q).then(r => r.json()).then(setRes);
}, [q]);`,
            answer: `An old slow response can overwrite new results. Abort the old request in cleanup.`,
            solution: `useEffect(() => {
  const c = new AbortController();
  fetch('/s?q=' + q, { signal: c.signal }).then(r => r.json()).then(setRes).catch(() => {});
  return () => c.abort();
}, [q]);`,
          },
          {
            easy: true,
            task: `Name the technique that waits before sending a search.`,
            description: `Checks debounce.`,
            code: `input.oninput = debounce(search, 300);`,
            answer: `Debounce: it sends only after the user stops typing for 300 ms.`,
          },
          {
            easy: true,
            task: `Name the API to cancel an old request.`,
            description: `Checks AbortController.`,
            code: `const c = new AbortController();
fetch(url, { signal: c.signal });`,
            answer: `AbortController: call c.abort() to cancel the earlier request.`,
          },
        ],
      },
    ],
    senior: [
      {
        q: "Write a fetch wrapper with a timeout, retries with growing delays, and cancel support.",
        short: "Retry only idempotent requests and 5xx/network errors, use exponential backoff with jitter, and combine a timeout with user cancellation via AbortSignal.any.",
        long: `AbortSignal.timeout gives per-attempt timeouts; AbortSignal.any merges it with a user/component signal.
Do not retry 4xx (except 408/429) or non-idempotent POSTs without an idempotency key.
Add jitter to avoid thundering herds; respect Retry-After for 429/503.
User cancellation must stop the retry loop, not just the current attempt.
Pitfalls: retrying aborts, infinite retries, retrying inside a library that also retries.
Strong answer: correct cancellation semantics, idempotency awareness, jitter and Retry-After.
Weak answer: a while(true) loop with fixed setTimeout.`,
        exercises: [
          {
            task: `Add a timeout to this fetch.`,
            description: `Checks AbortSignal.timeout.`,
            code: `const res = await fetch(url);`,
            answer: `AbortSignal.timeout aborts the request after the given time.`,
            solution: `const res = await fetch(url, { signal: AbortSignal.timeout(5000) });`,
          },
          {
            task: `Write the delay for retry attempt n.`,
            description: `Checks exponential backoff with jitter.`,
            code: `// attempt 0, 1, 2 ... base 300ms`,
            answer: `Double the delay each time and add random jitter to avoid thundering herds.`,
            solution: `const delay = n => 300 * 2 ** n + Math.random() * 100;`,
          },
          {
            easy: true,
            task: `Name the API that adds a timeout to fetch.`,
            description: `Checks AbortSignal.timeout.`,
            code: `fetch(url, { signal: AbortSignal.???(5000) });`,
            answer: `timeout: it aborts the request after 5000 ms.`,
          },
          {
            easy: true,
            task: `Name what growing retry delays are called.`,
            description: `Checks backoff.`,
            code: `delay = 100 * 2 ** attempt;`,
            answer: `Exponential backoff: each retry waits longer than the previous one.`,
          },
        ],
        fix: `async function fetchRetry(url, { retries = 3, timeout = 5000 } = {}) {
  for (let i = 0; ; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(timeout) });
      if (res.status >= 500) throw new Error(res.status);
      return res;
    } catch (e) {
      if (i >= retries) throw e;
      await new Promise(r => setTimeout(r, 2 ** i * 300));
    }
  }
}`,
      },
      {
        q: `How do you design optimistic updates? How do you roll back when the request fails?`,
        short: `Update the UI at once, keep the previous value, send the request, and on failure restore the old value and tell the user. Then sync with the server result.`,
        long: `Optimistic updates make the app feel instant: the UI shows the change before the server confirms.
Steps: save a snapshot, apply the change, send the request, on success replace with the server data, on failure restore the snapshot and show an error.
Hard parts: two quick changes to the same item (the older response must not overwrite the newer), and server-generated values like ids.
Use temporary ids, request versions or timestamps, and an idempotency key for safe retries.
Only use it when failure is rare and easy to undo; payments should not be optimistic.
Strong answer: covers rollback, ordering problems, idempotency and when not to use it.`,
        follow: `Which actions should never be optimistic?`,
        exercises: [
          {
            task: `Fix the missing rollback.`,
            description: `Checks optimistic update error handling.`,
            code: `setTodos(t => [...t, todo]);
await api.add(todo);`,
            answer: `If the request fails the fake item stays. Remove it and show an error.`,
            solution: `setTodos(t => [...t, todo]);
try { await api.add(todo); }
catch { setTodos(t => t.filter(x => x.id !== todo.id)); notify('Save failed'); }`,
          },
          {
            task: `Name a React 19 hook for optimistic UI.`,
            description: `Checks useOptimistic.`,
            code: `const [items, addItem] = /* ? */(todos, (s, t) => [...s, t]);`,
            answer: `useOptimistic shows a temporary state during an action and reverts automatically when the action ends.`,
          },
          {
            easy: true,
            task: `Name the first step of an optimistic update.`,
            description: `Checks optimistic order.`,
            code: `// user clicks "Like"`,
            answer: `Update the UI right away, before the server confirms.`,
          },
          {
            easy: true,
            task: `Name what to do when the request fails.`,
            description: `Checks rollback.`,
            code: `const prev = state;
setState(next);`,
            answer: `Restore the saved previous state and show an error.`,
            solution: `try { await save(); } catch { setState(prev); }`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: "For your next product, how do you choose between REST, GraphQL, and tRPC?",
        short: "Decide on team and backend ownership, number and type of clients, caching needs and tooling: REST for broad/public APIs and HTTP caching, GraphQL for many clients with varied data needs, tRPC for a full-stack TypeScript monorepo.",
        long: `REST: simple, cacheable at the HTTP/CDN layer, universal tooling; risk of over/under-fetching.
GraphQL: flexible queries and strong schema for many clients; costs include server complexity, N+1, caching and security (query depth/cost limits).
tRPC: end-to-end types with almost no boilerplate, but couples client and server to TypeScript and one repo.
Consider: who owns the backend, public vs internal API, mobile clients, existing infra and team skills.
Pitfalls: picking GraphQL for one client, tRPC for a public API, ignoring versioning/deprecation strategy.
Strong answer: decision matrix tied to context, plus contract testing/OpenAPI or schema governance.
Weak answer: "GraphQL is modern, REST is old".`,
        exercises: [
          {
            task: `Pick an API style for this case.`,
            description: `Checks matching API style to context.`,
            code: `// Full-stack TypeScript monorepo, one team`,
            answer: `tRPC: end-to-end types with no schema step. It fits when the same team owns client and server in TypeScript.`,
          },
          {
            task: `Name one GraphQL downside for frontend.`,
            description: `Checks GraphQL trade-offs.`,
            answer: `HTTP caching is harder because most queries are POSTs to one URL, so you need a client cache like Apollo.`,
          },
          {
            easy: true,
            task: `Name a REST drawback that GraphQL solves.`,
            description: `Checks over-fetching.`,
            code: `GET /users/1  // returns 40 fields`,
            answer: `Over-fetching: GraphQL lets the client ask only for needed fields.`,
          },
          {
            easy: true,
            task: `Name when tRPC fits best.`,
            description: `Checks tRPC use case.`,
            code: `// TypeScript frontend and backend, one repo`,
            answer: `When both sides use TypeScript, so types are shared end to end.`,
          },
        ],
        ai: true,
      },
      {
        q: "Your single-page app makes 40 API calls when the dashboard loads. The backend team is overloaded. What do you do with the other teams?",
        ai: true,
        short: "Measure the waterfall and duplicates, fix client-side issues (deduplication, caching, parallelism, prefetch), then agree with backend on aggregated endpoints or a BFF, plus shared API standards (pagination, field selection) and observability.",
        long: `Start with data: HAR/RUM traces showing sequential waterfalls, duplicated calls, oversized payloads.
Client fixes first: query cache with dedupe, parallel requests, staleTime tuning, lazy-load below-the-fold widgets.
Then negotiate: aggregated dashboard endpoint or BFF owned by the frontend team, or GraphQL if multiple clients benefit.
Agree on API guidelines (pagination, sparse fieldsets, caching headers, ETags) and track p95 latency per endpoint.
Pitfalls: blaming backend without data, building a BFF nobody owns, premature GraphQL.
Strong answer: data-driven, collaborative, clear ownership and success metrics.
Weak answer: "ask backend to make it faster".`,
        exercises: [
          {
            task: `Name two ways to cut dashboard requests.`,
            description: `Checks reducing request count.`,
            code: `// 40 calls on dashboard load`,
            answer: `Add an aggregate endpoint or BFF for the dashboard, and cache shared data with a query client to remove duplicates.`,
          },
          {
            task: `Spot the duplicate requests.`,
            description: `Checks shared query caching.`,
            code: `// Header: useQuery(['me'])
// Sidebar: fetch('/api/me')
// Profile: fetch('/api/me')`,
            answer: `Three calls for the same data. Use one query key everywhere, so the cache shares one request.`,
          },
          {
            easy: true,
            task: `Name the HTTP header that enables response caching.`,
            description: `Checks basic HTTP caching.`,
            code: `Cache-Control: max-age=60`,
            answer: `Cache-Control tells the browser how long it may reuse a response.`,
          },
          {
            easy: true,
            task: `Fix the sequential requests.`,
            description: `Checks parallel fetching.`,
            code: `const a = await fetch('/a');
const b = await fetch('/b');`,
            answer: `Independent requests should run together with Promise.all.`,
            solution: `const [a, b] = await Promise.all([fetch('/a'), fetch('/b')]);`,
          },
        ],
      },
    ],
  },
  Performance: {
    junior: [
      {
        q: "How can you make images load faster?",
        short: "Serve correctly sized images with srcset/sizes, modern formats (AVIF/WebP), loading=\"lazy\" below the fold, and width/height to avoid layout shift.",
        long: `The biggest win is not sending a 3000px image to a 400px slot — use srcset and sizes.
AVIF/WebP are much smaller than JPEG/PNG; use <picture> for fallbacks.
Lazy-load offscreen images, but never the LCP/hero image — give it fetchpriority="high".
Always set width/height (or aspect-ratio) so the browser reserves space (CLS).
Pitfalls: lazy-loading the hero, huge SVGs/GIFs, missing CDN caching.
Strong answer: covers size, format, loading priority and CLS.
Weak answer: "compress images".`,
        exercises: [
          {
            task: `Fix this hero image markup.`,
            description: `Checks LCP image loading hints.`,
            code: `<img src="hero.png" loading="lazy">`,
            answer: `Never lazy load the LCP image. Add size, priority, and a modern format.`,
            solution: `<img src="hero.avif" width="1200" height="600"
  fetchpriority="high" alt="Campus">`,
          },
          {
            task: `Write responsive image markup.`,
            description: `Checks srcset and sizes.`,
            answer: `srcset lists widths and sizes tells the browser the display width, so it picks the smallest fitting file.`,
            solution: `<img src="a-800.jpg" alt=""
  srcset="a-400.jpg 400w, a-800.jpg 800w"
  sizes="(max-width: 600px) 100vw, 50vw">`,
          },
          {
            easy: true,
            task: `Add the attribute that prevents layout shift.`,
            description: `Checks image size attributes.`,
            code: `<img src="a.webp" alt="Cat">`,
            answer: `Add width and height so the browser reserves space.`,
            solution: `<img src="a.webp" width="400" height="300" alt="Cat">`,
          },
          {
            easy: true,
            task: `True or false: PNG is the best format for photos.`,
            description: `Checks image formats.`,
            code: `<img src="cat.png">`,
            answer: `False; AVIF or WebP make photos much smaller than PNG.`,
          },
        ],
      },
      {
        q: "Why is this page slow to show content? Fix how scripts load.",
        code: `<head>
  <script src="/analytics.js"></script>
  <script src="/app.js"></script>
  <link rel="stylesheet" href="/styles.css">
</head>`,
        fix: `<head>
  <link rel="stylesheet" href="/styles.css">
  <script src="/app.js" defer></script>
  <script src="/analytics.js" async></script>
</head>`,
        short: "Classic scripts in head block HTML parsing until they download and execute. Use defer for app code (runs in order after parsing) and async for independent scripts like analytics; keep CSS early.",
        long: `Parser-blocking scripts delay first paint; every extra network round trip adds up.
defer: downloads in parallel, executes after parsing in document order — ideal for app code.
async: executes as soon as downloaded, order not guaranteed — for independent third-party scripts.
type="module" scripts are deferred by default.
CSS is render-blocking by design; keep it small and early.
Strong answer: explains blocking, defer vs async, and module default.
Weak answer: "move scripts to the bottom" without knowing why.`,
        exercises: [
          {
            task: `Fix the render-blocking script.`,
            description: `Checks defer on script tags.`,
            code: `<head>
  <script src="app.js"></script>
</head>`,
            answer: `A plain script blocks HTML parsing. Use defer so it runs after parsing, in order.`,
            solution: `<script src="app.js" defer></script>`,
          },
          {
            task: `Pick async or defer for analytics.`,
            description: `Checks script loading order.`,
            code: `<script src="analytics.js"></script>`,
            answer: `async: it does not depend on other scripts or the DOM order, so run it whenever it loads.`,
          },
          {
            easy: true,
            task: `Predict when this script runs.`,
            description: `Checks defer behavior.`,
            code: `<script src="app.js" defer></script>`,
            answer: `It downloads in parallel and runs after the HTML is parsed.`,
          },
          {
            easy: true,
            task: `Move the script to stop blocking rendering.`,
            description: `Checks script placement.`,
            code: `<head>
  <script src="app.js"></script>
</head>`,
            answer: `Add defer so parsing is not blocked.`,
            solution: `<script src="app.js" defer></script>`,
          },
        ],
      },
    ],
    middle: [
      {
        q: "Explain the Core Web Vitals: LCP, INP, and CLS. How do you improve each one?",
        short: "LCP measures main content load (preload hero, SSR, fast TTFB); INP measures interaction responsiveness (break up long tasks); CLS measures layout stability (reserve space).",
        long: `Good thresholds: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 at the 75th percentile of real users.
LCP: reduce TTFB, preload the LCP resource, avoid client-only rendering for above-the-fold content.
INP: keep handlers short, yield to the main thread, defer non-urgent work, reduce JS.
CLS: set dimensions on media, reserve space for ads/banners, use font-display and size-adjust.
Pitfalls: optimizing Lighthouse lab scores only, ignoring field data (CrUX/RUM).
Strong answer: knows thresholds, causes and fixes, and measures with the web-vitals library.
Weak answer: confuses INP with FID or can't name what CLS measures.`,
        exercises: [
          {
            task: `Name the metric this code hurts.`,
            description: `Checks CLS from late content.`,
            code: `setTimeout(() => {
  document.body.prepend(banner);
}, 2000);`,
            answer: `CLS: inserting content above existing content shifts the layout. Reserve space or show it as an overlay.`,
          },
          {
            task: `Fix this INP problem.`,
            description: `Checks yielding during long tasks.`,
            code: `button.onclick = () => {
  heavyWork(); // 400ms
  showResult();
};`,
            answer: `Update the UI first, then yield before heavy work, so the next paint is fast.`,
            solution: `button.onclick = async () => {
  showSpinner();
  await scheduler.yield();
  heavyWork(); showResult();
};`,
          },
          {
            easy: true,
            task: `Name the metric that measures layout jumps.`,
            description: `Checks CLS meaning.`,
            code: `// banner pushes content down`,
            answer: `CLS, Cumulative Layout Shift, measures unexpected movement of visible content.`,
          },
          {
            easy: true,
            task: `Name the metric for this element.`,
            description: `Checks LCP meaning.`,
            code: `<img src="hero.jpg" class="hero">`,
            answer: `The big hero image is usually the LCP element.`,
          },
        ],
      },
      {
        q: "How do you check and reduce the JavaScript bundle size?",
        short: "Visualize the bundle (rollup-plugin-visualizer / source-map-explorer), code-split by route and heavy component, replace or tree-shake large dependencies, avoid barrel-file and CommonJS pitfalls, and enforce a size budget in CI.",
        long: `Measure first: which modules dominate, what's in the initial chunk vs lazy chunks.
Route-level splitting with dynamic import; lazy-load heavy widgets (charts, editors) on interaction.
Tree-shaking needs ESM and side-effect-free packages; deep imports avoid pulling entire icon/util libraries.
Replace heavy libs (moment → date-fns/Intl), remove polyfills for browsers you don't support.
Compression (brotli) and long-term caching with content hashes.
Pitfalls: barrel files re-exporting everything, duplicate dependency versions, optimizing gzip size of lazy chunks while the main chunk is huge.
Strong answer: process with tools and concrete techniques.
Weak answer: "minify it".`,
        exercises: [
          {
            task: `Fix the large import.`,
            description: `Checks tree shaking with named imports.`,
            code: `import _ from 'lodash';
_.debounce(fn, 300);`,
            answer: `The default import pulls all of lodash. Import only what you need, or use lodash-es.`,
            solution: `import debounce from 'lodash/debounce';`,
          },
          {
            task: `Write a lazy loaded route.`,
            description: `Checks code splitting with React.lazy.`,
            code: `import Reports from './Reports';`,
            answer: `Load the page only when needed, inside Suspense.`,
            solution: `const Reports = lazy(() => import('./Reports'));
<Suspense fallback={<Spinner />}><Reports /></Suspense>`,
          },
          {
            easy: true,
            task: `Name the command that shows bundle contents.`,
            description: `Checks bundle analysis.`,
            code: `npx vite-bundle-visualizer`,
            answer: `A bundle visualizer shows which modules take the most space.`,
          },
          {
            easy: true,
            task: `Fix this import to reduce size.`,
            description: `Checks tree shaking.`,
            code: `import _ from 'lodash';
_.debounce(fn, 100);`,
            answer: `Import only the function you need.`,
            solution: `import debounce from 'lodash/debounce';`,
          },
        ],
      },
    ],
    senior: [
      {
        q: "A table has 5,000 rows and filters. It is slow when you type. Find and fix the problem step by step, with tools.",
        short: "Profile first (React Profiler, Performance tab), then virtualize rows, defer filtering with useDeferredValue/debounce, memoize rows, colocate state, or move filtering to the server.",
        long: `Reproduce and record a Performance trace: is time spent in filtering, React rendering or layout?
React Profiler shows which components re-render per keystroke and why.
Fixes by cause: virtualization (render ~30 rows not 5,000), useDeferredValue so the input stays responsive, React.memo with stable props.
Keep input state local so typing doesn't re-render the whole page; precompute search indices.
For very large data, filter server-side with pagination.
Pitfalls: memoizing blindly without measuring, inline objects breaking memo, index keys.
Strong answer: measure → hypothesize → fix → verify with numbers.
Weak answer: "add useMemo everywhere".`,
        exercises: [
          {
            task: `Fix the slow typing in this filter.`,
            description: `Checks useDeferredValue.`,
            code: `const [q, setQ] = useState('');
const rows = filter(all, q); // slow`,
            answer: `Defer the expensive part, so typing stays responsive.`,
            solution: `const [q, setQ] = useState('');
const dq = useDeferredValue(q);
const rows = useMemo(() => filter(all, dq), [all, dq]);`,
          },
          {
            task: `Name the DevTools panel to find the cause.`,
            description: `Checks profiling tools.`,
            code: `// Typing in the filter feels laggy.`,
            answer: `React Profiler shows which components re-render and why; the Performance panel shows long tasks on the main thread.`,
          },
          {
            easy: true,
            task: `Name the React hook that delays a fast-changing value.`,
            description: `Checks debouncing idea.`,
            code: `const q = useDeferredValue(text);`,
            answer: `useDeferredValue lets typing stay fast while filtering lags behind.`,
          },
          {
            easy: true,
            task: `Fix the missing list prop.`,
            description: `Checks stable keys.`,
            code: `rows.map((r, i) => <Row key={i} {...r} />)`,
            answer: `Use a stable id as key, not the index.`,
            solution: `rows.map(r => <Row key={r.id} {...r} />)`,
          },
        ],
        follow: "Now the rows can be edited. What changes?",
        ai: true,
      },
      {
        q: `This code parses a huge JSON file on the main thread, so the page freezes. Move the work off the main thread.`,
        code: `const res = await fetch('/api/report');
const text = await res.text();
const data = JSON.parse(text); // 80 MB
const totals = computeTotals(data); // heavy loop
render(totals);`,
        short: `Do the download, parsing and heavy loop in a Web Worker and send only the small result back to the page.`,
        long: `JavaScript on the main thread blocks input and paint, so a long parse makes the page freeze.
A Web Worker runs on another thread. It can fetch, parse and compute, then post the result.
Send back only what the UI needs; posting large objects costs time because data is copied with structured clone.
For binary data, transfer ArrayBuffers instead of copying.
Also ask whether the server can send less data or pre-computed totals; that is often the best fix.
Strong answer: moves the work, keeps messages small, and questions the data size.`,
        fix: `// report.worker.js
self.onmessage = async () => {
  const data = await (await fetch('/api/report')).json();
  self.postMessage(computeTotals(data));
};

// main.js
const worker = new Worker(new URL('./report.worker.js', import.meta.url), { type: 'module' });
worker.onmessage = (e) => render(e.data);
worker.postMessage('start');`,
        follow: `What can a Web Worker not access?`,
        exercises: [
          {
            task: `Move this parsing into a worker.`,
            description: `Checks Web Worker messaging.`,
            code: `const data = JSON.parse(hugeText);`,
            answer: `Parse in a worker and post the result back.`,
            solution: `// worker.js
onmessage = e => postMessage(JSON.parse(e.data));
// main
const w = new Worker('worker.js');
w.onmessage = e => render(e.data);
w.postMessage(hugeText);`,
          },
          {
            task: `Name a cost of sending data to a worker.`,
            description: `Checks structured clone overhead.`,
            code: `worker.postMessage(hugeArrayBuffer);`,
            answer: `postMessage copies data with structured clone, which takes time. Transfer ArrayBuffers to avoid the copy.`,
          },
          {
            easy: true,
            task: `Create a worker from this file.`,
            description: `Checks Worker constructor.`,
            code: `// parse.worker.js exists`,
            answer: `Use new Worker with the file path.`,
            solution: `const w = new Worker('parse.worker.js');`,
          },
          {
            easy: true,
            task: `Send the text to the worker.`,
            description: `Checks postMessage.`,
            code: `const w = new Worker('p.js');
const text = '{}';`,
            answer: `Call postMessage to send data to a worker.`,
            solution: `w.postMessage(text);`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: "How do you make performance the job of the whole team, not one hero?",
        short: "Make it measurable and owned: performance budgets enforced in CI, RUM dashboards with alerts, clear ownership per area, and performance as part of release/design reviews.",
        long: `What isn't measured regresses; set budgets (bundle size, LCP/INP targets) agreed with product.
Enforce budgets in CI (size-limit, Lighthouse CI) so regressions block PRs instead of being found months later.
Real-user monitoring by route with owners and alerts makes it everyone's job.
Teach: lunch-and-learns, profiling playbooks, performance criteria in definition of done.
Pitfalls: one-off optimization sprints, lab-only metrics, budgets nobody looks at.
Strong answer: mechanisms + culture + examples of regressions caught.
Weak answer: "I'll optimize it myself when it gets slow".`,
        exercises: [
          {
            task: `Name two ways to make speed a team job.`,
            description: `Checks shared performance ownership.`,
            code: `// Only one engineer cares about speed`,
            answer: `Add performance budgets checked in CI, and show real user metrics on a team dashboard reviewed each sprint.`,
          },
          {
            task: `Write a simple bundle budget rule.`,
            description: `Checks automated size limits.`,
            answer: `Use a size-limit config that fails CI when the main bundle grows past a set size.`,
            solution: `// .size-limit.json
[{ "path": "dist/assets/index-*.js", "limit": "200 kB" }]`,
          },
          {
            easy: true,
            task: `Name one metric to track in every pull request.`,
            description: `Checks performance visibility.`,
            code: `// PR #12: +40 KB JS`,
            answer: `Bundle size, because every PR can show its change.`,
          },
          {
            easy: true,
            task: `Write a CI step that fails on big bundles.`,
            description: `Checks budget enforcement.`,
            code: `- run: npx size-limit`,
            answer: `size-limit fails the build when a bundle goes over budget.`,
          },
        ],
        ai: true,
      },
      {
        q: "You have three months and a small team to make a large old app faster. How do you choose what to work on?",
        ai: true,
        short: "Tie it to business outcomes: use RUM to find the slowest high-traffic journeys, estimate impact vs effort, pick a few measurable goals (e.g. p75 LCP on top 3 routes), ship incrementally with guardrails so gains aren't lost, and report results.",
        long: `Don't start with tools; start with user journeys that matter (conversion, task completion) and their field metrics.
Segment by device/network — low-end devices often reveal the real problems.
Prioritize by impact × reach / effort; quick wins (images, caching, third-party scripts) first, structural work (code-splitting, SSR) planned.
Lock in gains with budgets and alerts before moving on.
Communicate: baseline, targets, progress dashboard, business impact (correlation with conversion or support tickets).
Pitfalls: chasing Lighthouse scores, optimizing rarely-used pages, no baseline.
Strong answer: prioritization framework, measurable goals, guardrails, stakeholder communication.
Weak answer: "rewrite in a faster framework".`,
        exercises: [
          {
            task: `Name how you choose what to fix first.`,
            description: `Checks data-driven prioritization.`,
            code: `// Many slow pages, small team`,
            answer: `Use real user data: rank pages by traffic times poor metrics, then fix the biggest impact for the least effort.`,
          },
          {
            task: `Name the first thing to measure.`,
            description: `Checks establishing a baseline.`,
            code: `// Day 1 of the speed project.`,
            answer: `Field Core Web Vitals per page from RUM or CrUX. Without a baseline you cannot show progress.`,
          },
          {
            easy: true,
            task: `Name the first step before optimizing.`,
            description: `Checks measure first.`,
            code: `// page feels slow`,
            answer: `Measure real user data to find the biggest problems.`,
          },
          {
            easy: true,
            task: `Pick which page to fix first.`,
            description: `Checks impact thinking.`,
            code: `// A: home page, 1M visits
// B: admin page, 20 visits`,
            answer: `Fix A first, since it affects far more users.`,
          },
        ],
      },
    ],
  },
  "CI/CD": {
    junior: [
      {
        q: "What is CI/CD? What runs in a typical frontend pipeline?",
        short: "CI automatically builds and tests every change; CD automatically delivers/deploys it. A frontend pipeline typically runs install, lint, typecheck, tests, build and deploy.",
        long: `Continuous Integration: merge small changes often, each verified by an automated pipeline.
Continuous Delivery keeps main always deployable; Continuous Deployment ships every green build automatically.
Typical steps: npm ci, lint, typecheck, unit tests, build, E2E (maybe), deploy/preview.
Pitfalls: npm install instead of npm ci (non-reproducible), skipping tests on main, long-lived branches.
Strong answer: distinguishes delivery vs deployment and explains why each step exists.
Weak answer: "CI/CD is Jenkins".`,
        exercises: [
          {
            task: `Order these pipeline steps.`,
            description: `Checks a typical frontend CI order.`,
            code: `# test, install, build, lint, deploy`,
            answer: `install, lint, test, build, deploy. Cheap fast checks run first so failures stop early.`,
          },
          {
            task: `Name the difference: continuous delivery vs deployment.`,
            description: `Checks CD terminology.`,
            answer: `Delivery keeps every build ready to release with a manual approval; deployment releases to production automatically.`,
          },
          {
            easy: true,
            task: `Name what CI stands for.`,
            description: `Checks CI basics.`,
            code: `on: pull_request`,
            answer: `Continuous Integration: merge code often and test it automatically.`,
          },
          {
            easy: true,
            task: `Pick the step that runs first.`,
            description: `Checks pipeline order.`,
            code: `// lint, deploy, build, test`,
            answer: `Lint usually runs first because it is the fastest check.`,
          },
        ],
      },
      {
        q: "This GitHub Actions workflow passes even when tests fail. It is also slow. Fix it.",
        code: `on: push
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install
      - run: npm test || true
      - run: npm run build`,
        fix: `on:
  pull_request:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm test
      - run: npm run build`,
        short: "`|| true` swallows test failures, npm install isn't reproducible, there's no Node version pin or dependency cache, and it doesn't run on pull requests. Use setup-node with cache, npm ci, and let failing steps fail the job.",
        long: `Any step exiting non-zero fails the job — that's the point; || true defeats it.
setup-node pins the runtime and caches the npm store keyed by the lockfile.
npm ci uses the lockfile exactly and fails if out of sync.
Run on pull_request so checks gate merges; require them via branch protection.
Strong answer: finds all issues and explains each.
Weak answer: only removes || true.`,
        exercises: [
          {
            task: `Fix the bug.`,
            description: `Checks ignored test failures.`,
            code: `- run: npm test || true`,
            answer: `|| true hides the failure, so the job always passes. Remove it.`,
            solution: `- run: npm test`,
          },
          {
            task: `Speed up dependency install.`,
            description: `Checks npm caching in actions.`,
            code: `- uses: actions/setup-node@v4
  with: { node-version: 22 }
- run: npm install`,
            answer: `Enable the built-in npm cache and use npm ci.`,
            solution: `- uses: actions/setup-node@v4
  with: { node-version: 22, cache: npm }
- run: npm ci`,
          },
          {
            easy: true,
            task: `Name the file path for GitHub workflows.`,
            description: `Checks Actions basics.`,
            code: `# .github/workflows/ci.yml`,
            answer: `Workflows live in .github/workflows as YAML files.`,
          },
          {
            easy: true,
            task: `Add the trigger for pull requests.`,
            description: `Checks workflow trigger.`,
            code: `on:
  push:
    branches: [main]`,
            answer: `Add pull_request to the on block.`,
            solution: `on:
  push:
    branches: [main]
  pull_request:`,
          },
        ],
      },
    ],
    middle: [
      {
        q: "Think about preview deployments and environment variables. How do you handle secrets in a frontend build?",
        short: "Everything in the bundle is public. Only expose non-secret config (e.g. VITE_* vars); real secrets stay on the server or in a backend proxy, stored in the CI secret store.",
        long: `Build-time env vars are inlined into JS — anyone can read them in DevTools.
Vite only exposes vars prefixed with VITE_, a guardrail against leaking secrets accidentally.
Secrets (API keys with write access, DB creds) belong to backend/serverless functions; the client calls those.
Preview deployments should use separate, low-privilege credentials and data.
Pitfalls: committing .env files, printing secrets in CI logs, forked PRs gaining access to secrets.
Strong answer: explains inlining, prefix rules, proxying and CI secret scoping.
Weak answer: "we obfuscate the key".`,
        exercises: [
          {
            task: `Spot the leaked secret.`,
            description: `Checks build-time variables in bundles.`,
            code: `const key = import.meta.env.VITE_DB_PASSWORD;`,
            answer: `Anything in VITE_ env ends up in public JS. Keep secrets on the server only.`,
          },
          {
            task: `Name a rule for preview deploy secrets.`,
            description: `Checks environment isolation.`,
            code: `# Preview for every PR`,
            answer: `Use separate preview credentials with low access, never production keys, and do not expose secrets to fork PRs.`,
          },
          {
            easy: true,
            task: `True or false: frontend env variables are private.`,
            description: `Checks public bundle rule.`,
            code: `VITE_API_KEY=abc123`,
            answer: `False; values in the built bundle are visible to every user.`,
          },
          {
            easy: true,
            task: `Name where CI should store secrets.`,
            description: `Checks secret storage.`,
            code: `env:
  TOKEN: \${{ secrets.TOKEN }}`,
            answer: `In the CI provider's encrypted secrets, never in the repository.`,
          },
        ],
      },
      {
        q: `What are branch protection and required status checks? How do they fit into CI?`,
        short: `Branch protection rules stop direct pushes to main and require checks like tests and reviews to pass before a merge.`,
        long: `Without protection, anyone can push broken code to main.
Branch protection can require: a pull request, one or more approvals, passing status checks, an up-to-date branch, and no force pushes.
Required status checks are CI jobs (lint, tests, build) that must be green.
CODEOWNERS can require a review from the team that owns the changed files.
A merge queue tests the change on top of the latest main, so two green PRs cannot break main together.
Strong answer: lists the useful rules and knows about merge queues.`,
        follow: `How can two green pull requests still break main when merged?`,
        exercises: [
          {
            task: `Name two branch protection settings.`,
            description: `Checks main branch safeguards.`,
            answer: `Require passing status checks and at least one approving review before merge. Also block force pushes.`,
          },
          {
            task: `Spot the problem with this check name.`,
            description: `Checks matrix job names in required checks.`,
            code: `# required check: "test"
# job runs as matrix: test (20), test (22)`,
            answer: `Required check "test" never reports, so merges block. Require the matrix names, or add one summary job.`,
          },
          {
            easy: true,
            task: `True or false: branch protection can block direct pushes.`,
            description: `Checks branch protection.`,
            code: `git push origin main`,
            answer: `True; it forces changes through pull requests.`,
          },
          {
            easy: true,
            task: `Name the setting that requires passing CI before merge.`,
            description: `Checks status checks.`,
            code: `required_status_checks: [build, test]`,
            answer: `Required status checks block merge until they pass.`,
          },
        ],
      },
    ],
    senior: [
      {
        q: "The pipeline takes 25 minutes. How do you make it take 5?",
        short: "Measure each step, then cache dependencies and build outputs, run jobs in parallel and shard tests, run only affected projects, use a remote cache, split slow E2E and fail fast.",
        long: `Start with data: which jobs/steps dominate, and what's on the critical path?
Cache npm/pnpm store and build artifacts; use remote caching (Nx/Turborepo) for monorepos.
Parallelize independent jobs (lint, typecheck, unit) and shard test suites across runners.
Run only affected packages/tests on PRs; full suite on main/nightly.
Move slow E2E to smoke subset on PR, full on merge; fail fast on cheap checks first.
Pitfalls: caching node_modules incorrectly, flaky tests causing reruns, oversized Docker images.
Strong answer: profiling first, specific techniques, and trade-offs on coverage vs speed.
Weak answer: "buy bigger runners".`,
        exercises: [
          {
            task: `Split this job to run in parallel.`,
            description: `Checks parallel CI jobs.`,
            code: `jobs:
  ci:
    steps: [lint, typecheck, test, e2e]`,
            answer: `Make lint, typecheck, unit, and e2e separate jobs, and shard e2e across machines.`,
            solution: `jobs:
  lint: { ... }
  test: { ... }
  e2e:
    strategy: { matrix: { shard: [1, 2, 3, 4] } }`,
          },
          {
            task: `Name the first thing to check in a slow pipeline.`,
            description: `Checks measuring before optimizing.`,
            code: `# pipeline: install 6m, lint 2m, test 5m, e2e 12m`,
            answer: `Per-step timings. Find the slowest steps, often install and e2e, then cache or shard them.`,
          },
          {
            easy: true,
            task: `Add caching to speed up npm install.`,
            description: `Checks dependency cache.`,
            code: `- uses: actions/setup-node@v4`,
            answer: `Set the cache option for npm.`,
            solution: `- uses: actions/setup-node@v4
  with:
    cache: npm`,
          },
          {
            easy: true,
            task: `Predict which jobs run in parallel.`,
            description: `Checks job dependencies.`,
            code: `jobs:
  lint: {}
  test: {}
  deploy: { needs: [lint, test] }`,
            answer: `lint and test run together; deploy waits for both.`,
          },
        ],
      },
      {
        q: "This deploy script can leave production broken. Make the deploy happen all at once and easy to roll back.",
        code: `npm run build
aws s3 sync dist/ s3://app-prod --delete
aws cloudfront create-invalidation --distribution-id ABC --paths "/*"`,
        fix: `npm run build
# 1. upload hashed assets first, cache forever, never delete old ones immediately
aws s3 sync dist/assets s3://app-prod/assets --cache-control "public,max-age=31536000,immutable"
# 2. switch index.html last, never cached
aws s3 cp dist/index.html s3://app-prod/index.html --cache-control "no-cache"
aws cloudfront create-invalidation --distribution-id ABC --paths "/index.html"
# 3. prune assets older than N releases in a separate scheduled job`,
        short: "--delete removes old hashed assets while users still run the old index.html, causing chunk-load errors; index.html may update before assets exist. Upload immutable assets first, swap index.html last with no-cache, keep old assets for a while, and roll back by restoring the previous index.html.",
        long: `With content-hashed files, deployment is atomic if index.html (the pointer) is switched last.
Old tabs request old chunks after deploy — keep previous assets for several releases and handle ChunkLoadError by reloading.
Caching: hashed assets immutable for a year, index.html no-cache; invalidate only index.html.
Rollback = re-upload previous index.html (or point to a previous release prefix).
Alternatives: versioned release folders with an atomic pointer switch at the CDN/edge.
Pitfalls: invalidating /* on every deploy, caching index.html, deleting assets eagerly.
Strong answer: explains ordering, caching headers, old-tab problem and rollback.
Weak answer: "deploy at night".`,
        exercises: [
          {
            task: `Spot why this deploy can break production.`,
            description: `Checks non-atomic file uploads.`,
            code: `aws s3 sync dist/ s3://site --delete`,
            answer: `Files upload one by one, and old chunks are deleted while users still load them. Upload assets first, then index.html.`,
          },
          {
            task: `Write the deploy order.`,
            description: `Checks safe asset ordering.`,
            code: `# dist/index.html + dist/assets/*.js`,
            answer: `Upload hashed assets without delete, then upload index.html with no-cache. Keep old assets so open tabs still work.`,
          },
          {
            easy: true,
            task: `Name the strategy that switches traffic instantly.`,
            description: `Checks atomic deploy.`,
            code: `# old: blue, new: green`,
            answer: `Blue-green deploy flips traffic from old to new in one step.`,
          },
          {
            easy: true,
            task: `Fix the deploy order for hashed assets.`,
            description: `Checks upload ordering.`,
            code: `upload index.html
upload assets/`,
            answer: `Upload assets first, then index.html.`,
            solution: `upload assets/
upload index.html`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: "Design a safe release process for 5 teams that ship every day.",
        short: "Trunk-based development with feature flags, automated quality gates, canary/progressive rollout, fast rollback, clear ownership and automated release notes.",
        long: `Decouple deploy from release: code ships dark behind flags, product turns features on.
Short-lived branches into trunk, required checks and CODEOWNERS reviews.
Progressive delivery: canary or percentage rollouts with automated health checks (error rate, vitals) and auto-rollback.
Rollback must be one click and practiced; database changes follow expand/contract.
Ownership: each team owns its flags, dashboards and on-call; flags get removal dates.
Pitfalls: release trains that batch risk, flag debt, manual QA gates blocking all teams.
Strong answer: covers process, tooling, metrics (DORA) and incident learning loop.
Weak answer: "we deploy every Friday after QA sign-off".`,
        exercises: [
          {
            task: `Name two tools for safe daily releases.`,
            description: `Checks progressive delivery.`,
            code: `# 5 teams ship every day`,
            answer: `Feature flags to separate deploy from release, and canary rollouts with automatic rollback on error spikes.`,
          },
          {
            task: `Name what triggers a rollback.`,
            description: `Checks objective release gates.`,
            answer: `Clear signals like error rate or Core Web Vitals passing a set threshold after the canary step.`,
          },
          {
            easy: true,
            task: `Name a flag that turns a feature off without deploy.`,
            description: `Checks feature flags.`,
            code: `if (flags.newCheckout) show();`,
            answer: `A feature flag lets you disable code without a new release.`,
          },
          {
            easy: true,
            task: `Name the release type that sends to 5% of users.`,
            description: `Checks canary releases.`,
            code: `traffic: { new: 5, old: 95 }`,
            answer: `A canary release sends a small share of traffic first.`,
          },
        ],
        ai: true,
      },
      {
        q: "How would you use DORA metrics to measure and improve delivery? How do you avoid using them to punish teams?",
        ai: true,
        short: "Track deployment frequency, lead time for changes, change failure rate and time to restore (plus rework rate) automatically at team level, use them for improvement conversations not individual performance, and pair them with qualitative signals like developer experience surveys.",
        long: `Instrument from the pipeline and incident tools so metrics are cheap and trusted.
Use trends per team/service, not rankings across teams with different contexts.
Pick one constraint at a time (e.g. long code review wait → lead time) and run experiments.
Balance speed metrics with stability metrics so teams don't game one.
Avoid Goodhart's law: never tie metrics to individual performance reviews.
Pitfalls: vanity dashboards, comparing a platform team to a product team, counting deploys of trivial changes.
Strong answer: measurement design, cultural safeguards and an improvement story.
Weak answer: "we track story points".`,
        exercises: [
          {
            task: `Name the four DORA metrics.`,
            description: `Checks DORA basics.`,
            answer: `Deployment frequency, lead time for changes, change failure rate, and time to restore service.`,
          },
          {
            task: `Spot the problem with this goal.`,
            description: `Checks misuse of metrics.`,
            code: `// Goal: each team deploys 10 times per week`,
            answer: `Teams will game the number with tiny deploys. Use metrics for team learning trends, never to rank people.`,
          },
          {
            easy: true,
            task: `Is lower lead time better or worse?`,
            description: `Checks DORA direction.`,
            code: `lead_time: 2 days -> 1 day`,
            answer: `Better; shorter lead time means faster delivery.`,
          },
          {
            easy: true,
            task: `True or false: DORA metrics rank individual developers.`,
            description: `Checks metric misuse.`,
            code: `// goal: raise one dev's deploys`,
            answer: `False; they measure team and system delivery, not people.`,
          },
        ],
      },
    ],
  },
  "Testing (Unit, Integration, E2E, Visual regression, Accessibility, Performance etc)": {
    junior: [
      {
        q: "What is the difference between unit, integration, and end-to-end tests?",
        short: "Unit tests check an isolated function/component; integration tests check pieces working together; E2E tests drive a real browser through user flows.",
        long: `Unit tests are fast and precise but can miss wiring bugs.
Integration tests (e.g. component + store + mocked network) catch most real-world bugs at reasonable cost.
E2E tests (Playwright/Cypress) give the most confidence but are slower and more brittle.
Other types: visual regression (screenshots), accessibility (axe), performance (Lighthouse CI).
Pitfalls: only unit tests with heavy mocking, or only E2E with slow flaky suites.
Strong answer: explains trade-offs (speed, confidence, cost) and when to use each.
Weak answer: definitions without trade-offs.`,
        exercises: [
          {
            task: `Name the test level.`,
            description: `Checks classifying tests.`,
            code: `render(<LoginForm />);
await user.type(screen.getByLabelText('Email'), 'a@b.c');
await user.click(screen.getByRole('button'));
expect(await screen.findByText('Welcome')).toBeVisible();`,
            answer: `Integration: it renders a real component with user events, but no real browser or backend.`,
          },
          {
            task: `Write a unit test for this function.`,
            description: `Checks basic unit test syntax.`,
            code: `const sum = (a, b) => a + b;`,
            answer: `Call the function and assert the result.`,
            solution: `test('adds numbers', () => {
  expect(sum(2, 3)).toBe(5);
});`,
          },
          {
            easy: true,
            task: `Name the fastest test level.`,
            description: `Checks test levels.`,
            code: `// unit, integration, e2e`,
            answer: `Unit tests are fastest because they test small isolated pieces.`,
          },
          {
            easy: true,
            task: `Predict if this unit test passes.`,
            description: `Checks assertion basics.`,
            code: `const add = (a, b) => a + b;
expect(add(2, 2)).toBe(5);`,
            answer: `It fails because add(2, 2) returns 4.`,
          },
        ],
      },
      {
        q: "What is mocking? When should you mock in frontend tests?",
        short: "Mocking replaces a real dependency with a controlled fake to isolate the code under test. Mock things you don't control or that are slow/non-deterministic (network, time, randomness, browser APIs); avoid mocking your own components and modules too much.",
        long: `Mocks, stubs and spies: stubs return fixed data, spies record calls, mocks combine both with expectations.
Good candidates to mock: HTTP (prefer MSW), timers (fake timers), Date, Math.random, localStorage in some environments.
Over-mocking makes tests pass while the real integration is broken.
Reset mocks between tests to avoid leakage.
Pitfalls: mocking the module under test, asserting on mock internals, forgetting to restore spies.
Strong answer: explains what to mock and why, mentions MSW and fake timers.
Weak answer: "mock everything so tests are fast".`,
        exercises: [
          {
            task: `Write a mock for this API module.`,
            description: `Checks vi.mock usage.`,
            code: `import { getUser } from './api';`,
            answer: `Mock the module and set the return value.`,
            solution: `vi.mock('./api', () => ({
  getUser: vi.fn().mockResolvedValue({ name: 'Ann' }),
}));`,
          },
          {
            task: `Spot the over-mocking.`,
            description: `Checks mocking the unit under test.`,
            code: `vi.mock('./formatPrice');
expect(formatPrice(5)).toBe('$5.00');`,
            answer: `It mocks the very function it tests, so the test proves nothing. Mock only external boundaries.`,
          },
          {
            easy: true,
            task: `Mock this function with Jest.`,
            description: `Checks jest.fn.`,
            code: `const onSave = ?`,
            answer: `jest.fn creates a fake function that records calls.`,
            solution: `const onSave = jest.fn();`,
          },
          {
            easy: true,
            task: `True or false: mock the code you are testing.`,
            description: `Checks mocking rule.`,
            code: `jest.mock('./cart'); // testing cart.js`,
            answer: `False; mock its slow or external dependencies, not itself.`,
          },
        ],
      },
    ],
    middle: [
      {
        q: "What is wrong with this test?",
        code: `expect(wrapper.find('.btn-primary').props().onClick).toBeDefined();
expect(component.state('isOpen')).toBe(true);`,
        short: "It tests implementation details (CSS classes, internal state). Use Testing Library: find by role/name, interact with userEvent, assert what the user sees.",
        long: `Asserting that onClick exists doesn't prove clicking does anything; checking internal state breaks on refactors.
Tests should resemble how users use the app: query by role/label/text, then verify visible outcomes.
This makes tests resilient to refactors and doubles as an accessibility check (accessible names must exist).
Pitfalls: fireEvent instead of userEvent, getByTestId everywhere, snapshot tests nobody reads.
Strong answer: rewrites the test behaviourally and explains why it is more robust.
Weak answer: "use a better selector".`,
        exercises: [
          {
            task: `Spot the problem.`,
            description: `Checks testing implementation details.`,
            code: `expect(wrapper.state('count')).toBe(1);`,
            answer: `It checks internal state, not what users see. Assert the visible text instead.`,
            solution: `expect(screen.getByText('Count: 1')).toBeInTheDocument();`,
          },
          {
            task: `Spot the problem.`,
            description: `Checks missing await in async tests.`,
            code: `test('loads', () => {
  render(<Users />);
  expect(screen.findByText('Ann')).toBeTruthy();
});`,
            answer: `findByText returns a promise, which is always truthy. Await it.`,
            solution: `expect(await screen.findByText('Ann')).toBeInTheDocument();`,
          },
          {
            easy: true,
            task: `Spot why this test is weak.`,
            description: `Checks missing assertion.`,
            code: `it('adds', () => {
  add(1, 2);
});`,
            answer: `It has no expect, so it can never fail.`,
          },
          {
            easy: true,
            task: `Fix the test name.`,
            description: `Checks descriptive names.`,
            code: `it('test 1', () => {})`,
            answer: `Name the behavior, not a number.`,
            solution: `it('shows error for empty email', () => {})`,
          },
        ],
      },
      {
        q: "Rewrite this test. Handle async code correctly, find elements the way users see them, and mock the network.",
        code: `jest.mock('axios');
axios.get.mockResolvedValue({ data: [{ id: 1, name: 'Ann' }] });
const { container } = render(<UserList />);
setTimeout(() => {
  expect(container.querySelector('.user-name').textContent).toBe('Ann');
}, 100);`,
        fix: `import { http, HttpResponse } from 'msw';
import { server } from '../test/server';

it('renders users from the API', async () => {
  server.use(http.get('/api/users', () => HttpResponse.json([{ id: 1, name: 'Ann' }])));
  render(<UserList />);
  expect(await screen.findByRole('listitem', { name: /ann/i })).toBeVisible();
});`,
        short: "The setTimeout assertion runs after the test already finished (it can never fail), the test couples to axios and CSS classes. Use MSW to mock the network, findBy* queries that wait, and role-based assertions.",
        long: `Assertions inside a non-awaited setTimeout run after the test completes — false positives.
Mocking axios ties the test to the HTTP library; MSW intercepts at the network level, so switching to fetch doesn't break tests.
findBy* returns a promise that retries until the element appears or times out.
Role/name queries verify accessibility and survive markup refactors.
Also test the error and empty states with server.use overrides.
Strong answer: identifies the false positive, rewrites with MSW + findBy + roles.
Weak answer: increases the timeout.`,
        exercises: [
          {
            task: `Pick the best query for this button.`,
            description: `Checks Testing Library query priority.`,
            code: `<button class="btn-primary" data-testid="save">Save</button>`,
            answer: `getByRole('button', { name: 'Save' }). It matches how users and screen readers find it.`,
          },
          {
            task: `Fix the timing problem.`,
            description: `Checks waiting for async UI.`,
            code: `await user.click(submit);
expect(screen.getByText('Saved')).toBeInTheDocument();`,
            answer: `getBy fails if text appears later. Use findBy, which waits.`,
            solution: `await user.click(submit);
expect(await screen.findByText('Saved')).toBeInTheDocument();`,
          },
          {
            easy: true,
            task: `Add the missing await.`,
            description: `Checks async queries.`,
            code: `const btn = screen.findByRole('button');
btn.click();`,
            answer: `findBy returns a promise, so await it.`,
            solution: `const btn = await screen.findByRole('button');`,
          },
          {
            easy: true,
            task: `Pick the user-like query for this label.`,
            description: `Checks getByLabelText.`,
            code: `<label for="e">Email</label>
<input id="e">`,
            answer: `Use getByLabelText('Email').`,
          },
        ],
      },
    ],
    senior: [
      {
        q: "Show a test you wrote that found a real bug. What did you choose not to test?",
        short: "Expect a concrete story: behaviour-focused tests, network mocked with MSW, deliberate trade-offs about what wasn't worth testing, and use of visual/a11y tests where valuable.",
        long: `Good candidates describe the bug, why the test caught it, and how the test was designed (behaviour, not internals).
They should consciously skip low-value tests: trivial getters, third-party library behaviour, pure markup.
Mentions of regression tests for fixed bugs, edge cases (empty, error, slow network) and accessibility checks are strong signals.
Visual regression is valuable for design-system components; a11y scans catch missing labels/contrast early.
Pitfalls: 100% coverage obsession, testing mocks instead of code.
Strong answer: specific, reflective, explains the cost/benefit.
Weak answer: generic "I write unit tests for everything".`,
        exercises: [
          {
            task: `Write a test that catches this bug.`,
            description: `Checks edge-case testing.`,
            code: `const avg = a => a.reduce((s, x) => s + x) / a.length;`,
            answer: `Empty array throws because reduce has no initial value. Test the empty case.`,
            solution: `test('empty array', () => {
  expect(avg([])).toBe(0);
});`,
          },
          {
            task: `Name something not worth testing.`,
            description: `Checks test value judgment.`,
            answer: `Third-party library internals or simple markup without logic. Tests there add cost without catching real bugs.`,
          },
          {
            easy: true,
            task: `Name the type of bug this test catches.`,
            description: `Checks edge case idea.`,
            code: `expect(avg([])).toBe(0);`,
            answer: `It catches the empty list edge case, a divide by zero.`,
          },
          {
            easy: true,
            task: `True or false: test private implementation details.`,
            description: `Checks testing behavior.`,
            code: `expect(cmp.state.open).toBe(true);`,
            answer: `False; test behavior users see, so refactors do not break tests.`,
          },
        ],
        ai: true,
      },
      {
        q: "How do you test custom hooks, components that need context, and code with complex async logic?",
        short: "Prefer testing hooks through a small component or renderHook with real providers (query client, router, theme) via a custom render wrapper; mock only the network; control time with fake timers; assert user-observable outcomes and state transitions.",
        long: `A shared renderWithProviders helper avoids duplicated setup and keeps tests close to production wiring.
renderHook is fine for reusable hooks; for app-specific hooks testing the component is often more meaningful.
TanStack Query: new QueryClient per test with retries off to avoid flakiness and cache leaks.
Async flows: waitFor / findBy for UI, fake timers for debounce/polling, act warnings indicate unawaited updates.
Pitfalls: shared global QueryClient across tests, mocking context values that don't match real behaviour, testing implementation via internal state.
Strong answer: robust test utilities, isolation strategy and async control.
Weak answer: "I mock useContext".`,
        exercises: [
          {
            task: `Write a test for a custom hook.`,
            description: `Checks renderHook and act.`,
            code: `const useCounter = () => { const [n, s] = useState(0); return { n, inc: () => s(n + 1) }; };`,
            answer: `Use renderHook and wrap updates in act.`,
            solution: `const { result } = renderHook(() => useCounter());
act(() => result.current.inc());
expect(result.current.n).toBe(1);`,
          },
          {
            task: `Render a component that needs context.`,
            description: `Checks the wrapper option.`,
            code: `render(<Profile />); // needs ThemeProvider`,
            answer: `Pass a wrapper with the provider.`,
            solution: `render(<Profile />, {
  wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
});`,
          },
          {
            easy: true,
            task: `Name the helper to test a hook.`,
            description: `Checks renderHook.`,
            code: `const { result } = ?(() => useCounter());`,
            answer: `renderHook runs a hook inside a test component.`,
            solution: `renderHook(() => useCounter())`,
          },
          {
            easy: true,
            task: `Wrap the component in its provider.`,
            description: `Checks context wrapper.`,
            code: `render(<Page />);`,
            answer: `Pass a wrapper that supplies the context.`,
            solution: `render(<Page />, { wrapper: ThemeProvider });`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: "Define the testing strategy for the company: trophy or pyramid. Also set rules for unstable tests and coverage targets.",
        short: "Integration-heavy (testing trophy) with static analysis at the base, a thin E2E layer, quarantine flaky tests with owners and deadlines, meaningful rather than vanity coverage, and visual/a11y/perf checks where they add value.",
        long: `Pyramid (many unit, few E2E) vs trophy (static + mostly integration): for UI apps the trophy usually gives best confidence per cost.
Static checks (TypeScript, ESLint) are the cheapest tests — make them strict.
Flaky policy: auto-detect via retries, quarantine within a day, assign an owner, fix or delete within an SLA.
Coverage: use as a signal on critical modules (and diff coverage on PRs), not a global vanity number.
Add visual regression for the design system, axe scans on key pages, Lighthouse CI budgets for performance.
Pitfalls: mandating 90% coverage, ignoring flakiness until nobody trusts CI.
Strong answer: a written strategy with ownership and metrics (flake rate, escaped defects).
Weak answer: "more tests is better".`,
        exercises: [
          {
            task: `Name where most tests go in the trophy.`,
            description: `Checks the testing trophy model.`,
            answer: `Integration tests: they give the best confidence for the cost. Static types and lint form the base.`,
          },
          {
            task: `Write a rule for flaky tests.`,
            description: `Checks quarantine policy.`,
            code: `// A test fails 1 in 20 runs`,
            answer: `Quarantine it within a day, create a ticket with an owner, and fix or delete it within a set time.`,
          },
          {
            easy: true,
            task: `Name the shape: pyramid or trophy?`,
            description: `Checks trophy meaning.`,
            code: `// static, unit, integration, e2e`,
            answer: `The trophy puts most tests at integration level.`,
          },
          {
            easy: true,
            task: `True or false: 100% coverage means no bugs.`,
            description: `Checks coverage myth.`,
            code: `Coverage: 100%`,
            answer: `False; coverage shows run lines, not whether assertions are good.`,
          },
        ],
        ai: true,
      },
      {
        q: "Your end-to-end tests take 90 minutes. 15 percent of runs fail at random. Teams do not trust them anymore. What is your plan?",
        ai: true,
        short: "Stop the bleeding (quarantine flakes, make the suite non-blocking temporarily), measure flake rate per test, cut the suite to critical journeys, push coverage down to integration tests, parallelize and isolate test data, and restore it as a fast, trusted blocking gate with ownership.",
        long: `Trust is the asset: a red build nobody believes is worse than no build.
Data: per-test duration and failure history; top offenders usually cause most flakes.
Root causes: shared data, timing waits, environment instability, order dependence — fix with isolated data per test, web-first assertions, mock third parties.
Shrink: keep E2E for critical revenue/compliance paths; move edge cases to component/integration tests.
Speed: sharding, parallel workers, API-based setup instead of UI login.
Governance: owners per spec, flake SLA, dashboard.
Strong answer: phased plan with metrics and ownership.
Weak answer: "add more retries".`,
        exercises: [
          {
            task: `Shard this Playwright run.`,
            description: `Checks splitting e2e across machines.`,
            code: `npx playwright test`,
            answer: `Run shards in parallel CI jobs.`,
            solution: `npx playwright test --shard=1/4`,
          },
          {
            task: `Name the first fix for random failures.`,
            description: `Checks root-cause flakiness.`,
            code: `// 15% of runs fail at random`,
            answer: `Collect traces on retry, group failures by test, and fix the top offenders. Most are waits and shared test data.`,
          },
          {
            easy: true,
            task: `Add the Playwright flag for retries.`,
            description: `Checks retries.`,
            code: `npx playwright test`,
            answer: `Use --retries to rerun failing tests.`,
            solution: `npx playwright test --retries=2`,
          },
          {
            easy: true,
            task: `Replace the fixed wait.`,
            description: `Checks auto-waiting.`,
            code: `await page.waitForTimeout(5000);`,
            answer: `Wait for a condition instead of a fixed time.`,
            solution: `await expect(page.getByText('Done')).toBeVisible();`,
          },
        ],
      },
    ],
  },
  "Version Control (Git)": {
    junior: [
      {
        q: "What is the difference between git merge and git rebase?",
        short: "merge combines histories with a merge commit and preserves what happened; rebase replays your commits on top of another branch, producing a linear history but rewriting commit hashes.",
        long: `Merge is non-destructive: existing commits are untouched, a merge commit records the integration.
Rebase rewrites your commits onto a new base, giving a clean linear history that's easier to read and bisect.
Golden rule: don't rebase commits that others already pulled (shared/public branches).
After rebasing a pushed feature branch you need git push --force-with-lease, never plain --force.
Pitfalls: resolving the same conflicts repeatedly during rebase (git rerere helps), losing work by force-pushing over a teammate.
Strong answer: explains history shape, the golden rule and force-with-lease.
Weak answer: "they do the same thing".`,
        exercises: [
          {
            task: `Name the result of each command.`,
            description: `Checks merge versus rebase history.`,
            code: `git merge main
git rebase main`,
            answer: `merge adds a merge commit and keeps history; rebase replays your commits on main and makes linear history.`,
          },
          {
            task: `Spot the risk.`,
            description: `Checks rebasing shared branches.`,
            code: `git rebase main
git push --force  # shared branch`,
            answer: `Rebase rewrites commit IDs, so teammates lose work. Use --force-with-lease, and never rebase shared branches.`,
          },
          {
            easy: true,
            task: `True or false: merge rewrites existing commits.`,
            description: `Checks merge basics.`,
            code: `git merge feature`,
            answer: `False; merge adds a merge commit and keeps history.`,
          },
          {
            easy: true,
            task: `Name the command that replays commits on main.`,
            description: `Checks rebase.`,
            code: `git switch feature
git ? main`,
            answer: `git rebase main replays your commits on top of main.`,
            solution: `git rebase main`,
          },
        ],
      },
      {
        q: "You have a merge conflict. What does it mean? How do you fix it?",
        code: `<<<<<<< HEAD
const timeout = 5000;
=======
const timeout = 10000;
>>>>>>> feature/slow-network`,
        fix: `# decide the correct final content, e.g.:
const timeout = 10000;

git add src/config.js
git commit            # or: git merge --continue / git rebase --continue`,
        short: "Both branches changed the same lines differently. Git marks HEAD (your current branch) and the incoming branch; edit to the correct final content, remove markers, stage and continue the merge/rebase. Run tests after resolving.",
        long: `Conflict markers: between <<<<<<< HEAD and ======= is the current branch; between ======= and >>>>>>> is the incoming change.
Resolution means choosing one, combining both, or writing something new — talk to the other author if unclear.
git status shows conflicted files; git merge --abort / git rebase --abort return to the previous state.
Tools: VS Code merge editor, git mergetool; git rerere remembers resolutions.
Pitfalls: committing conflict markers, blindly choosing "ours", not running tests after resolution.
Strong answer: explains markers, resolution steps, abort option and verification.
Weak answer: "delete one side".`,
        exercises: [
          {
            task: `Read this conflict and name both sides.`,
            description: `Checks conflict markers.`,
            code: `<<<<<<< HEAD
color: red;
=======
color: blue;
>>>>>>> feature`,
            answer: `Top part is your current branch (HEAD), bottom is the incoming feature branch. Keep the right one and remove markers.`,
          },
          {
            task: `Write the commands to finish a merge.`,
            description: `Checks conflict resolution steps.`,
            answer: `Edit files, stage them, then commit.`,
            solution: `git add src/app.css
git commit`,
          },
          {
            easy: true,
            task: `Name the markers that start a conflict.`,
            description: `Checks conflict markers.`,
            code: `<<<<<<< HEAD
A
=======
B`,
            answer: `The <<<<<<< line starts your side; >>>>>>> ends the other side.`,
          },
          {
            easy: true,
            task: `Name the command that shows conflicted files.`,
            description: `Checks git status.`,
            code: `git status`,
            answer: `git status lists files as unmerged.`,
          },
        ],
      },
    ],
    middle: [
      {
        q: "You ran git reset with the hard option and lost your last commits. Your branch history is also messy. Get the work back and clean up the history.",
        code: `git log --oneline
# a1b2c3 wip
# d4e5f6 fix typo
# 0a9b8c wip again
git reset --hard HEAD~3   # oops, work is gone`,
        short: "Commits aren't really gone: git reflog records where HEAD has been, so you can reset or branch back to it. Then clean up with interactive rebase (squash/fixup) before pushing with --force-with-lease.",
        long: `reflog is local history of HEAD/branch movements, kept ~90 days by default — it's your undo log.
Recover with git reset --hard <sha> or safer git branch rescue <sha> first.
Clean history with rebase -i: squash/fixup WIP commits, reword messages, reorder logically.
git commit --fixup + rebase --autosquash keeps the flow tidy while working.
Pitfalls: rewriting history already merged to main, uncommitted changes lost by reset --hard (reflog can't save those — use stash).
Strong answer: knows reflog, safe recovery, autosquash and force-with-lease.
Weak answer: "re-clone the repo and redo the work".`,
        exercises: [
          {
            task: `Write commands to recover lost commits.`,
            description: `Checks git reflog.`,
            code: `git reset --hard HEAD~3  # oops`,
            answer: `reflog keeps where HEAD was. Reset back to that entry.`,
            solution: `git reflog
git reset --hard HEAD@{1}`,
          },
          {
            task: `Squash the last three commits.`,
            description: `Checks soft reset for squashing.`,
            answer: `Soft reset keeps changes staged, then make one commit.`,
            solution: `git reset --soft HEAD~3
git commit -m "Add search"`,
          },
          {
            easy: true,
            task: `Name the command that lists past HEAD positions.`,
            description: `Checks reflog.`,
            code: `git reflog`,
            answer: `git reflog shows where HEAD pointed, even after reset.`,
          },
          {
            easy: true,
            task: `Write the command to undo the last commit, keep changes.`,
            description: `Checks soft reset.`,
            code: `git reset ? HEAD~1`,
            answer: `reset --soft moves HEAD back and keeps changes staged.`,
            solution: `git reset --soft HEAD~1`,
          },
        ],
        fix: `git reflog                      # find the commit before the reset, e.g. HEAD@{1}
git reset --hard HEAD@{1}       # restore lost commits
git rebase -i origin/main       # squash/fixup wip commits into meaningful ones
git push --force-with-lease`,
      },
      {
        q: "Explain git reset with soft, mixed, and hard. Also explain git revert and git restore. When do you use each one?",
        short: "reset moves the branch pointer: --soft keeps changes staged, --mixed (default) keeps them unstaged, --hard discards them. revert creates a new commit undoing an old one (safe for shared history). restore discards or unstages file changes without moving branches.",
        long: `reset rewrites local history — fine before pushing, dangerous on shared branches.
--soft HEAD~1 is handy to redo the last commit; --hard throws away uncommitted work (not recoverable via reflog).
revert is the safe undo for published commits; reverting a merge needs -m 1.
git restore <file> discards working-tree changes; git restore --staged <file> unstages.
Pitfalls: reset --hard with uncommitted work, reverting a revert confusion, using checkout for everything.
Strong answer: maps each to a scenario and knows which are history-rewriting.
Weak answer: "reset and revert are the same".`,
        exercises: [
          {
            task: `Pick the right command.`,
            description: `Checks revert for pushed commits.`,
            code: `# A bad commit is already on main`,
            answer: `git revert <sha>: it adds a new commit that undoes the change, without rewriting shared history.`,
          },
          {
            task: `Undo changes to one file.`,
            description: `Checks git restore.`,
            code: `# src/app.ts has unwanted local edits`,
            answer: `restore discards working tree changes for that file.`,
            solution: `git restore src/app.ts`,
          },
          {
            easy: true,
            task: `Predict what this command keeps.`,
            description: `Checks mixed reset.`,
            code: `git reset HEAD~1`,
            answer: `It keeps your file changes but unstages them.`,
          },
          {
            easy: true,
            task: `Pick the safe undo for a pushed commit.`,
            description: `Checks revert.`,
            code: `git ? abc123`,
            answer: `git revert adds a new commit that undoes the old one.`,
            solution: `git revert abc123`,
          },
        ],
      },
    ],
    senior: [
      {
        q: "A regression appeared somewhere in the last 200 commits. How do you find it? What branching strategy makes this easier?",
        short: "Use git bisect (ideally git bisect run with an automated test) to binary-search the offending commit in ~8 steps; small, atomic, always-green commits on short-lived branches make bisect effective.",
        long: `bisect needs one good and one bad commit, then halves the range each step: log2(200) ≈ 8 checks.
git bisect run <script> automates it: exit 0 = good, 125 = skip (e.g. build broken), any other code 1–127 = bad.
It only works well if every commit builds and passes tests — squash-merging or atomic commits help.
Branching: short-lived feature branches, frequent integration, protected main with required checks.
Pitfalls: giant merge commits hiding the change, flaky tests misleading bisect, forgetting git bisect reset.
Strong answer: demonstrates bisect run and links commit hygiene to debuggability.
Weak answer: "I'd read through the commits".`,
        exercises: [
          {
            task: `Write git bisect steps.`,
            description: `Checks binary search for regressions.`,
            code: `# v1.4.0 was good, HEAD is broken`,
            answer: `Mark one bad and one good commit, then test each step.`,
            solution: `git bisect start
git bisect bad HEAD
git bisect good v1.4.0
# test, then: git bisect good | bad
git bisect reset`,
          },
          {
            task: `Automate bisect with a test.`,
            description: `Checks git bisect run.`,
            code: `# npm test -- search.test.ts fails on bad commits`,
            answer: `bisect run uses the exit code: 0 means good, non-zero means bad.`,
            solution: `git bisect run npm test -- search.test.ts`,
          },
          {
            easy: true,
            task: `Name the command that starts the search.`,
            description: `Checks bisect start.`,
            code: `git bisect ?`,
            answer: `Run git bisect start to begin a binary search.`,
            solution: `git bisect start`,
          },
          {
            easy: true,
            task: `Mark the current commit as broken.`,
            description: `Checks bisect bad.`,
            code: `git bisect ?`,
            answer: `Use git bisect bad for a commit that has the bug.`,
            solution: `git bisect bad`,
          },
        ],
      },
      {
        q: "This repository is slow to clone. CI checkouts take minutes. Find the cause and fix it.",
        code: `$ git count-objects -vH
size-pack: 4.2 GiB
$ git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | sort -k3 -n | tail -3
blob 9f2c... 312M designs/mockups.psd
blob 1a7b... 540M dist/app.bundle.zip
blob 77de... 1.1G data/seed-dump.sql`,
        fix: `# 1. stop the bleeding
echo -e "dist/\\n*.zip\\ndata/*.sql" >> .gitignore
git lfs track "*.psd"

# 2. rewrite history (coordinate with the team!)
git filter-repo --strip-blobs-bigger-than 50M

# 3. speed up CI checkouts meanwhile
# actions/checkout with fetch-depth: 1 (shallow) and sparse-checkout if monorepo`,
        short: "Large binaries and build artifacts were committed and live forever in history. Prevent new ones (.gitignore, LFS, pre-commit size checks), rewrite history with git filter-repo in a coordinated window, and use shallow/partial/sparse clones in CI.",
        long: `Git stores every version of every file; deleting a file later doesn't shrink the repo.
Find big blobs with rev-list/cat-file or git-sizer.
Rewriting history changes all SHAs: announce, freeze merges, rewrite, force-push, everyone re-clones; open PRs need rebasing.
Git LFS for binaries that must be versioned (designs); artifacts belong in artifact storage, not git.
CI: fetch-depth: 1, partial clone (--filter=blob:none), sparse-checkout for monorepos.
Pitfalls: rewriting without coordination, forgetting forks/caches still contain the data, secrets requiring rotation anyway.
Strong answer: diagnosis commands, prevention, coordinated rewrite plan and CI mitigations.
Weak answer: "delete the files and commit".`,
        exercises: [
          {
            task: `Speed up the CI checkout.`,
            description: `Checks shallow clones.`,
            code: `- uses: actions/checkout@v4
  with: { fetch-depth: 0 }`,
            answer: `Full history is not needed for builds. Use depth 1.`,
            solution: `- uses: actions/checkout@v4
  with: { fetch-depth: 1 }`,
          },
          {
            task: `Name a cause of a huge repository.`,
            description: `Checks large binaries in history.`,
            answer: `Large binary files committed in history. Remove them with git filter-repo and move them to Git LFS.`,
          },
          {
            easy: true,
            task: `Add the flag for a shallow clone.`,
            description: `Checks depth option.`,
            code: `git clone repo.git`,
            answer: `--depth 1 downloads only the latest commit.`,
            solution: `git clone --depth 1 repo.git`,
          },
          {
            easy: true,
            task: `Name the Git feature for large binary files.`,
            description: `Checks Git LFS.`,
            code: `git lfs track '*.psd'`,
            answer: `Git LFS stores large files outside normal history.`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: "Trunk-based development or GitFlow: which one do you choose for the company? How do you enforce it?",
        short: "Usually trunk-based with short-lived branches and feature flags for teams deploying continuously; GitFlow only fits versioned/scheduled releases. Enforce via branch protection, CI checks, CODEOWNERS and conventions.",
        long: `GitFlow (develop, release, hotfix branches) suits shipped software with multiple supported versions, but adds merge overhead and delays integration.
Trunk-based: branches live hours to a couple of days, merged behind flags; it correlates with better DORA metrics.
Hotfixes: fix on trunk and cherry-pick to release branches if any exist.
Enforce with branch protection, required reviews/CI, linear history or squash-merge, commit message conventions, stale branch cleanup.
Pitfalls: trunk-based without flags or good tests (broken main), GitFlow with daily deploys (merge hell).
Strong answer: context-based choice, migration path and measurable outcomes (lead time, change failure rate).
Weak answer: "GitFlow because it's the standard".`,
        exercises: [
          {
            task: `Pick a branching model for daily releases.`,
            description: `Checks trunk-based development.`,
            code: `# Many teams, deploys every day`,
            answer: `Trunk-based: short branches merged daily behind feature flags. GitFlow's long branches slow daily releases.`,
          },
          {
            task: `Name two ways to enforce the model.`,
            description: `Checks automation over policy documents.`,
            answer: `Branch protection with required checks on main, and a CI job that warns about branches older than a few days.`,
          },
          {
            easy: true,
            task: `Name the branch trunk-based work uses.`,
            description: `Checks trunk model.`,
            code: `git switch main`,
            answer: `Developers merge small changes into one main branch often.`,
          },
          {
            easy: true,
            task: `True or false: GitFlow has long-lived develop branches.`,
            description: `Checks GitFlow.`,
            code: `git checkout -b develop`,
            answer: `True; it keeps develop and release branches alive.`,
          },
        ],
        ai: true,
      },
      {
        q: "You join two teams' repositories into one monorepo, or split one. How do you plan it? What rules do you set?",
        ai: true,
        short: "Decide based on coupling and tooling: plan history preservation (subtree/filter-repo), CI with affected-only builds and remote cache, CODEOWNERS per package, consistent versioning and commit conventions, and a cutover with freeze windows and rollback.",
        long: `Why: shared code and atomic cross-package changes favour a monorepo; independent release cycles and access control may favour separate repos.
History: import with git filter-repo --to-subdirectory-filter so blame/bisect keep working.
Tooling: Nx/Turborepo/pnpm workspaces, affected-only CI, remote cache, per-package lint/test configs.
Ownership: CODEOWNERS, package boundaries, versioning strategy (independent vs fixed, changesets).
Cutover: announce, freeze, migrate open PRs, archive old repos read-only, update deploy pipelines.
Pitfalls: CI time explosion, no ownership, losing history, big-bang without a rehearsal.
Strong answer: decision criteria, technical steps, ownership and communication plan.
Weak answer: "copy the folders in".`,
        exercises: [
          {
            task: `Name a command to merge a repo with history.`,
            description: `Checks keeping history when combining repos.`,
            answer: `Add the old repo as a remote and merge with --allow-unrelated-histories into a subfolder, or use git filter-repo first.`,
          },
          {
            task: `Write a CODEOWNERS entry.`,
            description: `Checks ownership in a monorepo.`,
            answer: `CODEOWNERS sets required reviewers per folder.`,
            solution: `/apps/admissions/ @org/admissions-team
/packages/ui/ @org/design-system`,
          },
          {
            easy: true,
            task: `Name the command to add a remote.`,
            description: `Checks remote setup.`,
            code: `git remote ? other ../other.git`,
            answer: `git remote add registers another repository.`,
            solution: `git remote add other ../other.git`,
          },
          {
            easy: true,
            task: `Read this CODEOWNERS line.`,
            description: `Checks owner syntax.`,
            code: `/docs/ @team-docs`,
            answer: `The docs team is requested for review of changes there.`,
          },
        ],
      },
    ],
  },
};
