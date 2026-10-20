// Generic Questions
// Shape: { [topic]: { junior, middle, senior, techlead } }, each level is an array of >= 2 alternative questions
// Question: { q, code?, short, long, exercises: [{ task, description, code?, answer, solution? }], fix?, follow?, ai? }
export default {
  "Browser storages": {
    junior: [
      {
        q: "Compare localStorage, sessionStorage and cookies.",
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
            task: "Predict what is logged and fix the bug.",
            description: "Checks understanding that Web Storage is string-only. Show the snippet and ask the candidate to predict both logs before running it.",
            code: `localStorage.setItem('user', { name: 'Ann' });
console.log(localStorage.getItem('user'));
localStorage.setItem('count', 1);
console.log(localStorage.getItem('count') + 1);`,
            answer: "Logs '[object Object]' and '11': Web Storage stores only strings, so values are coerced with String(). Serialize with JSON.stringify and parse on read. A common wrong answer is that the object is stored as-is or that the second log prints 2. A strong answer also mentions guarding JSON.parse with try/catch for corrupted values.",
            solution: `localStorage.setItem('user', JSON.stringify({ name: 'Ann' }));
JSON.parse(localStorage.getItem('user')).name; // 'Ann'
localStorage.setItem('count', '1');
Number(localStorage.getItem('count')) + 1;     // 2`,
          },
          {
            task: "Implement a cross-tab listener that updates the theme when another tab changes it — and explain why it does not fire in the tab that made the change.",
            description: "Checks knowledge of the storage event and cross-tab sync. Ask them to write the listener from scratch, then ask which tab receives the event.",
            answer: "The storage event fires only in other same-origin documents, never in the one that called setItem, so the writing tab must apply the change itself. Many candidates assume the event fires everywhere including the writer. Strong answers mention BroadcastChannel as an alternative for richer cross-tab messaging.",
            solution: `window.addEventListener('storage', (e) => {
  if (e.key === 'theme') {
    document.documentElement.dataset.theme = e.newValue ?? 'light';
  }
});`,
          },
        ],
      },
      {
        q: "Why does this code crash for some users, and how do you fix it?",
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
            task: "Predict the output of each line.",
            description: "Checks null/undefined handling with Web Storage. Ask the candidate to predict before running.",
            code: `console.log(localStorage.getItem('missing'));
console.log(JSON.parse(localStorage.getItem('missing')));
console.log(JSON.parse(undefined));`,
            answer: "null, null, then SyntaxError: getItem returns null for missing keys, JSON.parse(null) coerces to 'null' and returns null, but JSON.parse(undefined) coerces to 'undefined', which isn't valid JSON. Strong answers know the coercion rule.",
          },
          {
            task: "Implement a `remember(key, value, ttlMs)` / `recall(key)` pair that expires values.",
            description: "Checks designing a small storage wrapper. Ask how expired entries get cleaned up.",
            answer: "Store the value with an expiry timestamp and delete it on read when expired. Strong answers mention that expired keys linger until read and that clock changes affect Date.now().",
            solution: `export function remember(key, value, ttlMs) {
  localStorage.setItem(key, JSON.stringify({ value, exp: Date.now() + ttlMs }));
}
export function recall(key) {
  try {
    const item = JSON.parse(localStorage.getItem(key));
    if (!item || Date.now() > item.exp) { localStorage.removeItem(key); return undefined; }
    return item.value;
  } catch { return undefined; }
}`,
          },
        ],
      },
    ],
    middle: [
      {
        q: "Where would you store a JWT and why? What is wrong with this?",
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
            task: "Find the security issues in this cookie and fix them.",
            description: "Checks cookie security flags in a realistic Express snippet. Ask the candidate to list every problem before rewriting it.",
            code: "res.cookie('session', id, { sameSite: 'none', maxAge: 365 * 24 * 3600 * 1000 });",
            answer: "It is JS-readable (no httpOnly), SameSite=None without Secure is rejected by browsers, and a one-year session is far too long. Use httpOnly, secure, SameSite=Lax/Strict and a short lifetime with rotation. Weak answers fix only one flag. A strong answer explains each flag's threat (XSS, CSRF, interception) and mentions server-side session expiry and rotation.",
            solution: `res.cookie('session', id, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 30 * 60 * 1000,
});`,
          },
          {
            task: "Fix the refresh logic so ten parallel requests after page load trigger only one /auth/refresh call.",
            description: "Checks async concurrency reasoning around token refresh. Describe the scenario (dashboard fires 10 requests on load) and let them find the race.",
            code: `let accessToken = null;
async function authFetch(url) {
  if (!accessToken) {
    const r = await fetch('/auth/refresh', { method: 'POST', credentials: 'include' });
    accessToken = (await r.json()).accessToken;
  }
  return fetch(url, { headers: { Authorization: \`Bearer \${accessToken}\` } });
}`,
            answer: "Each call sees accessToken === null before the first refresh resolves, so all of them refresh (and rotating refresh tokens may invalidate each other). Share a single in-flight promise. A common wrong fix is a boolean 'isRefreshing' flag that makes other callers skip instead of wait. Strong answers share the promise, reset it on failure and handle 401 retry once.",
            solution: `let accessToken = null;
let refreshing = null;
function refresh() {
  refreshing ??= fetch('/auth/refresh', { method: 'POST', credentials: 'include' })
    .then((r) => { if (!r.ok) throw new Error('refresh failed'); return r.json(); })
    .then((d) => (accessToken = d.accessToken))
    .finally(() => { refreshing = null; });
  return refreshing;
}
async function authFetch(url) {
  if (!accessToken) await refresh();
  return fetch(url, { headers: { Authorization: \`Bearer \${accessToken}\` } });
}`,
          },
        ],
      },
      {
        q: "What do the SameSite cookie values (Strict, Lax, None) do, and which do you choose for a session cookie?",
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
            task: "For each request, say whether a `SameSite=Lax` cookie for app.example.com is sent.",
            description: "Checks precise SameSite semantics. Read the scenarios aloud and ask for yes/no with reasoning.",
            code: `// 1. User clicks a link on evil.com to https://app.example.com/dashboard
// 2. evil.com auto-submits <form method="POST" action="https://app.example.com/transfer">
// 3. evil.com runs fetch('https://app.example.com/api/me', { credentials: 'include' })
// 4. api.example.com page fetches app.example.com with credentials`,
            answer: "1 yes (top-level GET navigation), 2 no (cross-site POST), 3 no (cross-site fetch), 4 yes (api.example.com is same-site). A common mistake is answering by origin instead of site.",
          },
          {
            task: "Find the CSRF hole that SameSite=Lax doesn't cover and fix it.",
            description: "Checks that safe-method semantics matter. Show the route and ask what an attacker can do.",
            code: `app.get('/account/delete', requireSession, (req, res) => {
  deleteAccount(req.user.id);
  res.redirect('/');
});`,
            answer: "Lax still sends cookies on top-level GET navigations, so a link to this URL deletes the account. State-changing operations must use POST/DELETE (plus CSRF token for defense in depth).",
            solution: `app.post('/account/delete', requireSession, verifyCsrf, (req, res) => {
  deleteAccount(req.user.id);
  res.sendStatus(204);
});`,
          },
        ],
      },
    ],
    senior: [
      {
        q: "Offline-first app needs to store 200MB of data. Which storage and how do you handle quota & schema migrations?",
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
            task: "Explain why this IndexedDB code throws TransactionInactiveError and fix it.",
            description: "Checks deep IndexedDB transaction lifetime knowledge. Ask what error appears and why before asking for a fix.",
            code: `const tx = db.transaction('orders', 'readwrite');
const store = tx.objectStore('orders');
for (const id of ids) {
  const res = await fetch(\`/api/orders/\${id}\`);
  store.put(await res.json());
}`,
            answer: "An IDB transaction auto-commits once control returns to the event loop with no pending requests, so awaiting fetch inside it kills it. Do all network work first, then write in one short transaction. Candidates often blame permissions or quota. A strong answer explains auto-commit semantics and why only IDB requests (not arbitrary promises) keep a transaction alive.",
            solution: `const orders = await Promise.all(
  ids.map((id) => fetch(\`/api/orders/\${id}\`).then((r) => r.json())),
);
const tx = db.transaction('orders', 'readwrite');
orders.forEach((o) => tx.objectStore('orders').put(o));
await tx.done; // idb wrapper`,
          },
          {
            task: "Add version 4 to an existing idb schema that splits `fullName` into `firstName`/`lastName` for existing records without data loss.",
            description: "Checks schema migration design with real data transformation. Let the candidate write the upgrade callback, then ask what happens for a user upgrading from v1 directly.",
            answer: "Data migrations run inside the upgrade transaction using a cursor; only fall-through `if (oldVersion < n)` steps keep users who skip versions working. Don't await anything other than requests on that tx. Weak answers use a switch without fall-through or recreate the store and lose data. Strong answers mention testing migrations from every old version and handling blocked upgrades in other tabs.",
            solution: `openDB('app', 4, {
  async upgrade(db, oldVersion, _v, tx) {
    if (oldVersion < 1) db.createObjectStore('people', { keyPath: 'id' });
    if (oldVersion < 4) {
      let cursor = await tx.objectStore('people').openCursor();
      while (cursor) {
        const { fullName = '', ...rest } = cursor.value;
        const [firstName, ...last] = fullName.split(' ');
        await cursor.update({ ...rest, firstName, lastName: last.join(' ') });
        cursor = await cursor.continue();
      }
    }
  },
});`,
          },
        ],
      },
      {
        q: "Why might this service worker show users stale data forever, and how do you design caching for an app shell plus API data?",
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
            task: "Implement stale-while-revalidate for /api/config.",
            description: "Checks Cache API and fetch event mechanics. Ask them to write the handler and explain what the user sees.",
            answer: "Return the cached response immediately if any, while fetching and updating the cache in the background via waitUntil. Strong answers handle the no-cache case and errors.",
            solution: `self.addEventListener('fetch', (e) => {
  if (!e.request.url.endsWith('/api/config')) return;
  e.respondWith(caches.open('cfg').then(async (cache) => {
    const cached = await cache.match(e.request);
    const network = fetch(e.request).then((res) => {
      if (res.ok) cache.put(e.request, res.clone());
      return res;
    });
    e.waitUntil(network.catch(() => {}));
    return cached || network;
  }));
});`,
          },
          {
            task: "Users report they keep seeing the old app after deploys. Explain the SW lifecycle cause and design an update UX.",
            description: "Checks waiting/activate lifecycle. No single code answer required; ask for the sequence of events.",
            answer: "The new SW installs but waits while any tab is controlled by the old one. Detect registration.waiting, show a 'reload to update' banner, post a SKIP_WAITING message and reload on controllerchange. Forcing skipWaiting silently can mix old HTML with new assets.",
          },
        ],
      },
    ],
    techlead: [
      {
        q: "Your app stores PII in the browser. What policy do you define (GDPR, logout, shared devices)?",
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
            task: "Review this logout implementation for a shared-device kiosk and list what PII can survive it.",
            description: "Checks threat modelling on shared devices. Present the code as a real PR and ask the candidate to review it as the approver.",
            code: `function logout() {
  localStorage.removeItem('token');
  location.href = '/login';
}`,
            answer: "Other localStorage keys, sessionStorage, IndexedDB, Cache API/service-worker caches, HttpOnly cookies and the HTTP cache all survive, as does the server session. Invalidate server-side and send Clear-Site-Data plus a client wipe of all stores. A weak answer only suggests localStorage.clear(). Strong answers cover server-side invalidation, the back/forward cache and HTTP cache, and turning the review into a team checklist.",
          },
          {
            task: "Design an automated check that proves logout leaves no app data behind, suitable for CI.",
            description: "Checks ability to turn a policy into enforceable automation. Ask how they would make the policy impossible to regress, not just documented.",
            answer: "A Playwright test logs in, exercises PII-heavy pages, logs out, then asserts localStorage/sessionStorage are empty, indexedDB.databases() and caches.keys() are empty, and cookies are cleared. Weak answers stop at 'add it to docs'. Strong answers make the test a required CI gate with a named owner and extend it whenever a new storage mechanism is introduced.",
            solution: `test('logout wipes client data', async ({ page, context }) => {
  await loginAndBrowse(page);
  await page.getByRole('button', { name: 'Log out' }).click();
  const leftovers = await page.evaluate(async () => ({
    ls: localStorage.length,
    ss: sessionStorage.length,
    dbs: (await indexedDB.databases()).length,
    caches: (await caches.keys()).length,
  }));
  expect(leftovers).toEqual({ ls: 0, ss: 0, dbs: 0, caches: 0 });
  expect(await context.cookies()).toEqual([]);
});`,
          },
        ],
        ai: true,
      },
      {
        q: "A product team wants to cache full API responses (including applicant records) in IndexedDB for offline use. What questions do you ask and what guardrails do you set before approving?",
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
            task: "Write the acceptance criteria you would attach to this feature ticket.",
            description: "Checks turning policy into testable requirements. Ask for 4–6 concrete criteria.",
            answer: "E.g. only listed fields cached; entries expire after N hours; all stores wiped on logout and session expiry (automated test); no caching on devices flagged shared; store registered in data inventory; security review sign-off. Weak answers are vague ('secure caching').",
          },
          {
            task: "A teammate proposes encrypting IndexedDB with a key stored in localStorage. Evaluate it.",
            description: "Checks threat-model reasoning. Ask what attacks it does and doesn't stop.",
            answer: "It protects little: any XSS can read both key and data, and disk-level attackers get the key too. It helps only if the key is non-extractable (CryptoKey in IDB) or derived from server-held material, and even then mainly against offline disk access. Strong answers state the threat model first.",
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
            task: "Refactor to remove the duplicated knowledge.",
            description: "Checks DRY as 'single source of truth for knowledge'. Ask what happens when product changes the minimum to 10.",
            code: `if (password.length < 8) showError('Too short');
// ... elsewhere
const isValid = password.length >= 8;`,
            answer: "The rule 'minimum 8 characters' lives in two places and can drift. Put it in one named constant/function used by both. A weak answer only removes visually duplicated lines. A strong answer names the business rule and shows that only one place must change.",
            solution: `const MIN_PASSWORD_LENGTH = 8;
const isPasswordLongEnough = (p) => p.length >= MIN_PASSWORD_LENGTH;
if (!isPasswordLongEnough(password)) showError('Too short');`,
          },
          {
            task: "Which principle does this violate, and how would you simplify it?",
            description: "Checks KISS and readability judgement. Ask for the simplest correct version and what made the original hard to read.",
            code: `const isEven = (n) => {
  const s = n.toString(2);
  return s[s.length - 1] === '0' ? true : false;
};`,
            answer: "KISS: binary strings and a redundant ternary obscure a simple check. Use n % 2 === 0. Some candidates keep the ternary or reach for bitwise tricks. Strong answers prefer the obvious expression and mention that clever code costs reviewers time.",
            solution: "const isEven = (n) => n % 2 === 0;",
          },
        ],
      },
      {
        q: "This function does too much. Which principle does it break and how would you split it?",
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
            task: "Rename these to follow clean naming and explain each change.",
            description: "Checks naming as a principle (readability). Ask for better names and why.",
            code: `const d = 18;
function getData2() { /* fetches active users */ }
let flag = user.age >= d;
const n = 3; // max retries`,
            answer: "Use intention-revealing names: isAdult/age, fetchActiveUsers, MAX_RETRIES. Booleans read as questions, functions as verbs, constants in UPPER_SNAKE. Weak answers only lengthen names.",
            solution: `const ADULT_AGE = 18;
function fetchActiveUsers() { /* ... */ }
const isAdult = user.age >= ADULT_AGE;
const MAX_RETRIES = 3;`,
          },
          {
            task: "Simplify this nested code with early returns.",
            description: "Checks KISS and readability via guard clauses. Ask them to refactor without changing behaviour.",
            code: `function discount(user) {
  if (user) {
    if (user.isMember) {
      if (user.years > 5) return 0.2;
      else return 0.1;
    } else return 0;
  } else return 0;
}`,
            answer: "Guard clauses flatten nesting and make the happy path obvious. Strong answers confirm behaviour is unchanged for every branch.",
            solution: `function discount(user) {
  if (!user?.isMember) return 0;
  return user.years > 5 ? 0.2 : 0.1;
}`,
          },
        ],
      },
    ],
    middle: [
      {
        q: "Which SOLID principle is violated? Refactor.",
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
            task: "Which SOLID principle is violated and how do you fix it?",
            description: "Checks Liskov Substitution with the classic square/rectangle trap. Ask which principle is broken and why inheritance looked tempting.",
            code: `class Rectangle { setWidth(w) { this.w = w; } setHeight(h) { this.h = h; } area() { return this.w * this.h; } }
class Square extends Rectangle {
  setWidth(w) { this.w = this.h = w; }
  setHeight(h) { this.w = this.h = h; }
}
// r.setWidth(5); r.setHeight(4); expect(r.area()).toBe(20) fails for Square`,
            answer: "Liskov Substitution: Square cannot replace Rectangle without breaking callers' expectations. Don't model it as inheritance; use separate immutable shapes sharing an area() interface. A common wrong answer is Open/Closed or 'Square should override area()'. Strong answers explain behavioural contracts, not just method signatures.",
            solution: `const rectangle = (w, h) => ({ area: () => w * h });
const square = (s) => ({ area: () => s * s });`,
          },
          {
            task: "Refactor this hook so it is testable without hitting the network (Dependency Inversion).",
            description: "Checks Dependency Inversion in a React context. Ask how they would unit-test the hook today and what makes it hard.",
            code: `function useUser(id) {
  const [u, setU] = useState(null);
  useEffect(() => { fetch(\`/api/users/\${id}\`).then((r) => r.json()).then(setU); }, [id]);
  return u;
}`,
            answer: "The hook depends on a concrete transport. Inject an API abstraction (parameter or context) so tests pass a fake and production passes the real client. Weak answers jump to mocking global fetch. Strong answers inject the dependency, discuss MSW as an alternative for integration tests and keep the abstraction small.",
            solution: `const ApiContext = createContext(realApi);
function useUser(id) {
  const api = useContext(ApiContext);
  const [u, setU] = useState(null);
  useEffect(() => { api.getUser(id).then(setU); }, [api, id]);
  return u;
}
// test: <ApiContext.Provider value={{ getUser: async () => ({ id: 1 }) }}>`,
          },
        ],
      },
      {
        q: "Explain the Law of Demeter and separation of concerns. How do they show up in frontend code?",
        short: "Law of Demeter: a unit should talk only to its direct collaborators, not reach through chains (a.b.c.d). Separation of concerns: keep UI, state, data access and domain logic in distinct layers. Both reduce coupling to structures you don't own.",
        long: `Long chains like order.customer.address.city couple the caller to the whole object graph; any shape change breaks it.
In React, prop drilling deep objects and components reaching into store internals are Demeter violations; selectors and adapters fix them.
Separation of concerns: components render, hooks orchestrate, services talk to APIs, domain modules hold rules.
Pitfalls: wrapper methods for every field ("Demeter dogma"), layers so thin they add nothing.
Strong answer: concrete frontend examples and awareness of over-application.
Weak answer: "don't use dots".`,
        exercises: [
          {
            task: "Refactor this component so it doesn't depend on the full API response shape.",
            description: "Checks Demeter and adapters. Show the component and ask what breaks when the API changes.",
            code: `function ShippingLabel({ order }) {
  return <p>{order.data.customer.addresses[0].city}, {order.data.customer.addresses[0].zip}</p>;
}`,
            answer: "Map the DTO to what the component needs at the boundary (adapter or selector); the component receives flat props. Strong answers place the mapping in the data layer, not the component.",
            solution: `const toShipping = (dto) => {
  const a = dto.data.customer.addresses[0] ?? {};
  return { city: a.city ?? '', zip: a.zip ?? '' };
};
function ShippingLabel({ city, zip }) {
  return <p>{city}, {zip}</p>;
}`,
          },
          {
            task: "Identify the mixed concerns in this hook and propose layers.",
            description: "Checks separation of concerns. Ask them to sketch where each piece moves.",
            code: `function useInvoices() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    fetch('/api/invoices', { headers: { 'X-Client': 'web' } })
      .then((r) => r.json())
      .then((d) => setRows(d.map((i) => ({ ...i, overdue: new Date(i.due) < new Date(), label: '$' + i.amount.toFixed(2) }))));
  }, []);
  return rows;
}`,
            answer: "It mixes HTTP details, business rule (overdue) and formatting. Move fetching to an API module, the overdue rule to a pure domain function, and formatting to the UI; the hook only composes them.",
          },
        ],
      },
    ],
    senior: [
      {
        q: "When is DRY harmful? Give an example of a wrong abstraction you had to undo.",
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
            task: "Two teams share this helper and both keep adding options. Refactor it.",
            description: "Checks recognising a wrong abstraction in shared code. Present it as a real cross-team helper and ask how they would undo it safely.",
            code: `export function formatDate(d, { short, withTime, utc, forReport, legacyUS } = {}) {
  // 60 lines of branching
}`,
            answer: "Boolean options per consumer are a sign of a wrong abstraction. Inline it back, give each context a purpose-built function built on Intl.DateTimeFormat, and share only the stable primitive. Weak answers add yet another option or split into a class hierarchy. Strong answers describe inlining per consumer, deprecating the old helper and migrating callers incrementally.",
            solution: `const fmt = (opts) => new Intl.DateTimeFormat('en-US', opts);
export const formatReportDate = (d) => fmt({ dateStyle: 'medium', timeZone: 'UTC' }).format(d);
export const formatActivityTime = (d) => fmt({ dateStyle: 'short', timeStyle: 'short' }).format(d);`,
          },
          {
            task: "Two validators look identical today — should you merge them? Justify with the 'reason to change' test.",
            description: "Checks judgement about coincidental duplication. There is no single correct code answer — evaluate reasoning.",
            code: `const isValidApplicantZip = (z) => /^\\d{5}$/.test(z);
const isValidWarehouseZip = (z) => /^\\d{5}$/.test(z);`,
            answer: "Only merge if they change for the same reason. Applicant addresses may soon accept international postcodes while warehouses stay US-only, so keeping them separate (possibly sharing a US_ZIP constant) is cheaper than a later flag. A weak answer merges them automatically because of DRY. Strong answers ask about domain ownership and likely future changes before deciding.",
          },
        ],
        ai: true,
      },
      {
        q: "Refactor this code to depend on abstractions and make the business rule testable. What principles are you applying?",
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
            task: "Write tests for `isEligible` covering the deadline boundary.",
            description: "Checks how the refactor pays off in tests. Ask which edge cases matter.",
            answer: "Because it is pure, tests pass plain objects and a fixed date. Strong answers test exactly-at-deadline, one ms before/after and the blocked flag.",
            solution: `const now = new Date('2026-09-01T00:00:00Z');
it('rejects at exact deadline', () =>
  expect(isEligible({ credits: 30, deadline: '2026-09-01T00:00:00Z' }, now, false)).toBe(false));
it('accepts before deadline', () =>
  expect(isEligible({ credits: 30, deadline: '2026-09-01T00:00:01Z' }, now, false)).toBe(true));
it('rejects blocked', () =>
  expect(isEligible({ credits: 99, deadline: '2030-01-01' }, now, true)).toBe(false));`,
          },
          {
            task: "This 'utility' module has 40 unrelated exports used everywhere. Plan how to break it up safely.",
            description: "Checks large-scale refactoring with cohesion in mind. Ask for steps, not code.",
            answer: "Group exports by domain/reason to change, move each group into its feature or a cohesive shared module, keep re-exports from the old path with deprecation, migrate callers with a codemod, then delete. Strong answers mention lint rules preventing new imports from the old module.",
          },
        ],
      },
    ],
    techlead: [
      {
        q: "How do you balance principles with delivery speed when the team is under pressure?",
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
            task: "Product asks to skip tests for a 2-day deadline feature. Walk through how you negotiate the trade-off.",
            description: "Checks negotiation and quality leadership under pressure. Role-play as the product manager and push back on their first proposal.",
            answer: "Separate the non-negotiable floor (tests for money/auth paths, review) from the flexible part, offer scope cuts or a flagged release, and record any debt as a ticket with an owner and date agreed with product. Weak answers either refuse flatly or give in completely. Strong answers offer concrete alternatives, quantify risk and agree on a written follow-up.",
          },
          {
            task: "Your team's tech-debt backlog has 300 tickets and nobody touches it. Propose a mechanism to make it actionable.",
            description: "Checks ability to make tech debt visible and prioritised. Ask how they would report progress to leadership.",
            answer: "Triage by cost of delay (incidents, velocity drag), cap the list, tag by area owner, reserve a fixed capacity per sprint and report impact (e.g. build time, bug rate) so paying debt is visible business value. Weak answers propose a 'debt sprint'. Strong answers tie debt to measurable outcomes and continuous capacity with owners.",
          },
        ],
        ai: true,
      },
      {
        q: "Your team argues endlessly in code review about style and principles. How do you set and enforce engineering principles without slowing delivery?",
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
            task: "Draft the review-comment convention you'd introduce and how you'd roll it out.",
            description: "Checks practical review culture design. Ask for the convention and adoption plan.",
            answer: "E.g. prefixes like 'blocking:', 'suggestion:', 'nit:', 'question:' (Conventional Comments), documented in CONTRIBUTING, demoed in a team meeting and modelled by leads; measure PR cycle time before and after.",
          },
          {
            task: "Two seniors disagree on whether to adopt a state-management library. Facilitate the decision.",
            description: "Checks conflict facilitation. Role-play one of the seniors.",
            answer: "Clarify the problem and criteria first, have each write their option against the criteria, run a small spike if needed, decide with a named decider and record an ADR with revisit conditions. Strong answers keep it about trade-offs, not people.",
          },
        ],
      },
    ],
  },
  "Functional programming": {
    junior: [
      {
        q: "What is a pure function? Is Array.prototype.sort pure?",
        short: "A pure function returns the same output for the same input and has no side effects. sort mutates the array in place, so it isn't pure — use toSorted() or copy first.",
        long: `Purity makes code predictable, cacheable (memoization) and trivially testable.
Side effects include mutating arguments, I/O, reading Date.now()/Math.random(), touching the DOM or globals.
sort, reverse and splice mutate; ES2023 added toSorted, toReversed, toSpliced and with as immutable alternatives.
Pitfalls: mutating React state/props via sort, assuming map returns a deep copy.
Strong answer: defines both properties, gives side-effect examples and the immutable alternatives.
Weak answer: "a function without bugs".`,
        exercises: [
          {
            task: "Predict the output.",
            description: "Checks mutation and default sort comparator. Ask to predict all three values before running.",
            code: `const nums = [10, 1, 5];
const sorted = nums.sort();
console.log(sorted, nums, sorted === nums);`,
            answer: "[1, 10, 5] [1, 10, 5] true: sort mutates in place, returns the same array, and the default comparator compares strings. Use toSorted((a, b) => a - b). Most candidates expect [1, 5, 10] or think nums is unchanged. A strong answer explains string comparison and the ES2023 toSorted alternative.",
          },
          {
            task: "Make this function pure.",
            description: "Checks the definition of purity in practice. Ask what makes the original impure, then for a pure rewrite.",
            code: `const cart = [];
function addItem(item) {
  cart.push(item);
  return cart.length;
}`,
            answer: "It mutates outer state and returns a value that depends on it. Take the cart as input and return a new cart. Weak answers just rename the function. Strong answers mention easier testing and safe use with React state.",
            solution: "const addItem = (cart, item) => [...cart, item];",
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
            task: "Predict the output.",
            description: "Checks map's contract and a classic gotcha. Ask to predict before running.",
            code: "console.log(['1', '2', '3'].map(parseInt));",
            answer: "[1, NaN, NaN]: map passes (value, index), and parseInt uses the index as the radix (0 → default 10, 1 → invalid, 2 → '3' not valid binary). Fix with map(Number) or map((s) => parseInt(s, 10)).",
          },
          {
            task: "Use reduce to count how many times each word appears.",
            description: "Checks reduce with an object accumulator. Ask them to write it.",
            code: "const words = ['a', 'b', 'a', 'c', 'b', 'a'];",
            answer: "Start with an empty object and increment counts; strong answers mention Map or Object.groupBy alternatives and avoiding spread in each iteration.",
            solution: `const counts = words.reduce((acc, w) => {
  acc[w] = (acc[w] ?? 0) + 1;
  return acc;
}, {});
// { a: 3, b: 2, c: 1 }`,
          },
        ],
      },
    ],
    middle: [
      {
        q: "Implement compose/pipe and curry.",
        short: "pipe/compose chain unary functions left-to-right/right-to-left via reduce; curry collects arguments until the original function's arity is reached.",
        long: `pipe(f, g)(x) === g(f(x)); compose(f, g)(x) === f(g(x)) — compose uses reduceRight.
curry relies on fn.length, which ignores default and rest parameters — a common gotcha.
These enable point-free data pipelines and partial application (configure once, use many times).
Pitfalls: losing "this", debugging long anonymous pipelines, TypeScript typing of variadic pipe.
Strong answer: correct implementation, mentions fn.length limits and a real use case.
Weak answer: memorized code without explaining arity.`,
        exercises: [
          {
            task: "Predict the output and explain.",
            description: "Checks deep understanding of fn.length and currying limits. Ask to predict the output, then explain.",
            code: `const curry = (fn) => function c(...a) {
  return a.length >= fn.length ? fn(...a) : (...b) => c(...a, ...b);
};
const sum = curry((a, b = 0, ...rest) => a + b);
console.log(sum(1), typeof sum(1));`,
            answer: "1 'number': fn.length counts parameters before the first default/rest, so it is 1 and curry calls fn immediately. Pass the arity explicitly for such functions. Candidates often expect a function to be returned. A strong answer proposes curry(fn, arity = fn.length) and notes TypeScript typing issues.",
          },
          {
            task: "Implement a `memoize` for single-argument pure functions and explain when it is unsafe.",
            description: "Checks memoization implementation and its trade-offs. Ask them to write it, then ask where it would break.",
            answer: "Cache results in a Map keyed by the argument. It is unsafe for impure functions and leaks memory for unbounded inputs; object arguments are keyed by reference. Weak answers use JSON.stringify keys everywhere without noting cost. Strong answers mention cache bounds (LRU/WeakMap) and referential arguments.",
            solution: `const memoize = (fn) => {
  const cache = new Map();
  return (x) => {
    if (!cache.has(x)) cache.set(x, fn(x));
    return cache.get(x);
  };
};`,
          },
        ],
        fix: `const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);
const curry = (fn) => function c(...a) { return a.length >= fn.length ? fn(...a) : (...b) => c(...a, ...b); };`,
      },
      {
        q: "What are higher-order functions and closures, and how do they enable partial application?",
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
            task: "Predict the output and fix it so it prints 0 1 2.",
            description: "Checks closures and var vs let scoping. Ask to predict first.",
            code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i));
}`,
            answer: "Prints 3 3 3: var is function-scoped, so all callbacks share one i that is 3 when they run. let creates a new binding per iteration.",
            solution: `for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i));
}`,
          },
          {
            task: "Implement `once(fn)` that calls fn only the first time and returns the cached result afterwards.",
            description: "Checks closures holding private state. Ask about `this` and arguments forwarding.",
            answer: "Keep a called flag and result in the closure; forward this and arguments. Strong answers release the fn reference after the first call to avoid holding memory.",
            solution: `function once(fn) {
  let called = false, result;
  return function (...args) {
    if (!called) { called = true; result = fn.apply(this, args); fn = null; }
    return result;
  };
}`,
          },
        ],
      },
    ],
    senior: [
      {
        q: "Rewrite this imperative code functionally — and discuss whether you should.",
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
            task: "Find the bug in this immutable update and fix it.",
            description: "Checks shallow vs deep immutable updates. Ask what changes in the original state after the second line.",
            code: `const next = { ...state, user: state.user };
next.user.address.city = 'Boston';`,
            answer: "Spread is shallow, so next.user is the same object as state.user and the original state is mutated (React/Redux won't detect a change). Copy every level on the path or use structuredClone/Immer. A common wrong answer is 'spread creates a copy so it's safe'. Strong answers mention Immer and why reference equality matters for memoized selectors.",
            solution: `const next = {
  ...state,
  user: { ...state.user, address: { ...state.user.address, city: 'Boston' } },
};`,
          },
          {
            task: "Implement `groupBy(items, keyFn)` without O(n²) copying and compare with the built-in.",
            description: "Checks pragmatic FP: local mutation vs observable purity. Ask for an O(n) implementation.",
            answer: "Mutating a local accumulator inside the function is fine — purity is about observable behaviour. ES2024 Object.groupBy / Map.groupBy do exactly this. Weak answers use reduce with spread (O(n²)). Strong answers know Object.groupBy and explain why the local mutation is acceptable.",
            solution: `const groupBy = (items, keyFn) => {
  const out = {};
  for (const it of items) (out[keyFn(it)] ??= []).push(it);
  return out;
};
// Built-in: Object.groupBy(items, keyFn)`,
          },
        ],
        fix: "const total = orders.filter(o => o.paid).reduce((s, o) => s + o.items.length * o.price, 0);",
      },
      {
        q: "Why is this React component showing a stale count, and how does it relate to closures and immutability?",
        code: `function Counter() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCount(count + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return <p>{count}</p>;
}`,
        fix: `useEffect(() => {
  const id = setInterval(() => setCount((c) => c + 1), 1000);
  return () => clearInterval(id);
}, []);`,
        short: "The interval callback closes over count from the first render (0), so it keeps setting 1. Use the functional updater setCount(c => c + 1), or include count in deps (which restarts the interval).",
        long: `Each render creates new closures; the effect ran once (empty deps) and captured count = 0 forever.
Functional updates receive the latest state, avoiding the stale closure without re-subscribing.
Alternatives: useRef for mutable latest value, useEffectEvent (React 19.2+) for event-like logic inside effects.
This is FP thinking: state is an immutable snapshot per render, not a mutable variable.
Pitfalls: silencing exhaustive-deps lint, adding count to deps and recreating intervals every tick.
Strong answer: explains render snapshots, offers the updater and discusses trade-offs.
Weak answer: "make count a global".`,
        exercises: [
          {
            task: "Fix the stale closure in this event listener without re-adding the listener on every change.",
            description: "Checks stale closures with external subscriptions. Ask for two possible fixes.",
            code: `function Search({ query }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Enter') runSearch(query); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}`,
            answer: "The handler captures the initial query. Keep the latest value in a ref updated each render (or useEffectEvent in React 19.2+), so the listener registered once reads the current value.",
            solution: `function Search({ query }) {
  const latest = useRef(query);
  useEffect(() => { latest.current = query; });
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Enter') runSearch(latest.current); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}`,
          },
          {
            task: "Write a reducer for a todo list that never mutates state, supporting add, toggle and remove.",
            description: "Checks immutable updates in practice. Ask them to write it and explain why immutability matters for React.",
            answer: "Return new arrays/objects for every change; React and memoized selectors rely on reference changes to detect updates.",
            solution: `function todos(state, action) {
  switch (action.type) {
    case 'add': return [...state, { id: action.id, text: action.text, done: false }];
    case 'toggle': return state.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t));
    case 'remove': return state.filter((t) => t.id !== action.id);
    default: return state;
  }
}`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: "Would you adopt fp-ts/Effect in a product team? Why/why not?",
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
            task: "A senior engineer opens a PR rewriting the API layer with Effect. How do you respond?",
            description: "Checks how the candidate handles a paradigm-changing proposal from a strong engineer. Role-play as the author defending the PR.",
            answer: "Thank them, but move the decision to an RFC with team input: goals, pilot scope, onboarding plan, success metrics and exit plan. Avoid merging a paradigm shift through a single PR. Weak answers approve because it's 'better code' or reject dismissively. Strong answers keep the engineer motivated while moving the decision to a transparent process.",
          },
          {
            task: "Define 3 lightweight FP conventions you would make team-wide instead of a full library, and how you'd enforce them.",
            description: "Checks ability to extract value from FP without heavy frameworks. Ask how each convention is enforced, not just stated.",
            answer: "E.g. no mutation of props/state (immutability lint rules), Result/discriminated unions for expected errors in the domain layer, and pure domain modules without I/O (enforced by import-boundary lint rules). Weak answers list conventions with no enforcement. Strong answers tie each one to tooling and code review guidelines.",
          },
        ],
        ai: true,
      },
      {
        q: "How do you introduce functional patterns (immutability, pure domain logic, explicit error types) into a large legacy imperative codebase without a rewrite?",
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
            task: "Propose ESLint configuration that enforces immutability only in new domain code.",
            description: "Checks pragmatic tooling rollout. Ask how they scope it.",
            answer: "Use flat-config file globs to apply rules like no-param-reassign (props: true) and prefer-const only to src/domain/**, expanding gradually.",
            solution: `export default [
  {
    files: ['src/domain/**/*.{js,ts}'],
    rules: {
      'no-param-reassign': ['error', { props: true }],
      'prefer-const': 'error',
    },
  },
];`,
          },
          {
            task: "After six months, how do you show leadership the FP initiative was worth it?",
            description: "Checks outcome measurement. Ask for concrete metrics.",
            answer: "Compare refactored vs untouched modules on defect rate, test coverage of business rules, change lead time and incident count; include developer survey data. Strong answers admit confounders and set expectations up front.",
          },
        ],
      },
    ],
  },
  OOP: {
    junior: [
      {
        q: "Name the four OOP pillars.",
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
            task: "Predict the output.",
            description: "Checks private class fields. Ask to predict the three values.",
            code: `class User {
  #password = 'secret';
  name = 'Ann';
}
const u = new User();
console.log(u.name, u.password, Object.keys(u));`,
            answer: "'Ann' undefined ['name']: #password is a truly private field, not a property; u.#password outside the class is a SyntaxError. Candidates often think u.password returns 'secret' or that # is just a naming convention. A strong answer contrasts #fields with the old _underscore convention and closures.",
          },
          {
            task: "Fix the error.",
            description: "Checks constructor rules in derived classes. Ask what error is thrown and why.",
            code: `class Animal { constructor(name) { this.name = name; } }
class Dog extends Animal {
  constructor(name) { this.sound = 'woof'; super(name); }
}
new Dog('Rex');`,
            answer: "ReferenceError: `this` cannot be used in a derived constructor before super() is called. Call super first. Weak answers just reorder lines without explaining. Strong answers state that super() initialises `this` in derived classes.",
            solution: `class Dog extends Animal {
  constructor(name) { super(name); this.sound = 'woof'; }
}`,
          },
        ],
      },
      {
        q: "Fix this class so it works and explain what `this` and `new` do.",
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
            task: "Predict the output.",
            description: "Checks prototype method sharing. Ask to predict and explain.",
            code: `class A { m() {} f = () => {}; }
const a = new A(), b = new A();
console.log(a.m === b.m, a.f === b.f);`,
            answer: "true, false: class methods live on the prototype and are shared; arrow class fields are created per instance. Strong answers mention the memory/binding trade-off.",
          },
          {
            task: "Add a static factory and a getter to this class.",
            description: "Checks static members and accessors. Ask for an implementation.",
            code: `class Temperature {
  constructor(celsius) { this.celsius = celsius; }
}`,
            answer: "static methods belong to the class, not instances; getters compute derived values on access.",
            solution: `class Temperature {
  constructor(celsius) { this.celsius = celsius; }
  static fromFahrenheit(f) { return new Temperature((f - 32) * 5 / 9); }
  get fahrenheit() { return this.celsius * 9 / 5 + 32; }
}
Temperature.fromFahrenheit(212).celsius; // 100`,
          },
        ],
      },
    ],
    middle: [
      {
        q: "Composition vs inheritance — which do you prefer and why?",
        short: "Composition by default: it's flexible and loosely coupled. Use inheritance only for a true is-a relationship with genuinely shared behaviour.",
        long: `Inheritance couples the subclass to parent internals (fragile base class problem) and hierarchies get deep and rigid.
Composition assembles behaviour from small parts that can be swapped or tested independently.
React itself favours composition: children, render props, hooks instead of component inheritance.
Pitfalls: mixins with name collisions, composing so much that the flow becomes hard to trace.
Strong answer: explains the trade-off, gives a frontend example (hooks, wrappers).
Weak answer: "inheritance is bad" without reasoning.`,
        exercises: [
          {
            task: "Predict what happens and fix it.",
            description: "Checks `this` binding with detached methods. Ask what happens after one second.",
            code: `class Timer {
  seconds = 0;
  tick() { this.seconds++; }
  start() { setInterval(this.tick, 1000); }
}`,
            answer: "Passing this.tick detaches the method; setInterval calls it with `this` = window/undefined, so seconds is never updated on the instance (TypeError in strict non-browser contexts). Bind it or use an arrow class field. Many say seconds becomes NaN or that it works. Strong answers compare bind, arrow fields (per-instance cost) and wrapping in an arrow.",
            solution: `class Timer {
  seconds = 0;
  tick = () => { this.seconds++; };
  start() { setInterval(this.tick, 1000); }
}`,
          },
          {
            task: "Refactor this inheritance chain to composition.",
            description: "Checks composition over inheritance with dependency injection. Ask how they would test HttpClient without console output.",
            code: `class Logger { log(m) { console.log(m); } }
class HttpClient extends Logger { get(u) { this.log(u); return fetch(u); } }
class AuthClient extends HttpClient { /* adds token */ }`,
            answer: "An HTTP client is not a logger; inheritance makes it impossible to swap the logger. Inject collaborators. Weak answers add another subclass. Strong answers show constructor injection and mention swapping implementations per environment.",
            solution: `class HttpClient {
  constructor({ logger, getToken }) { this.logger = logger; this.getToken = getToken; }
  async get(url) {
    this.logger.log(url);
    return fetch(url, { headers: { Authorization: \`Bearer \${await this.getToken()}\` } });
  }
}`,
          },
        ],
      },
      {
        q: "How do prototypes and the prototype chain work in JavaScript, and how do classes relate to them?",
        short: "Every object has an internal [[Prototype]] link; property lookup walks this chain until found or null. Classes are syntax over constructor functions and prototypes: methods go on Class.prototype, extends links prototypes.",
        long: `obj.prop checks own properties first, then Object.getPrototypeOf(obj), and so on up to Object.prototype and null.
class B extends A sets B.prototype's prototype to A.prototype and B's prototype to A (for statics).
Shadowing: assigning obj.x creates an own property, it doesn't modify the prototype.
instanceof checks whether Constructor.prototype appears in the chain.
Pitfalls: modifying built-in prototypes, using __proto__, deep chains hurting lookup readability.
Strong answer: explains lookup, shadowing, and what class/extends compile to.
Weak answer: "JS has classes like Java".`,
        exercises: [
          {
            task: "Predict the output.",
            description: "Checks prototype lookup and shadowing. Ask to predict each line.",
            code: `const base = { kind: 'proto' };
const a = Object.create(base);
const b = Object.create(base);
console.log(a.kind);
a.kind = 'own';
console.log(a.kind, b.kind, Object.getPrototypeOf(a) === base);`,
            answer: "'proto', 'own', 'proto', true: lookup finds the prototype value until an own property shadows it; other objects still see the prototype value.",
          },
          {
            task: "Rewrite this class using only Object.create / constructor functions.",
            description: "Checks understanding of what class syntax does. Ask them to write equivalent code.",
            code: `class Animal { constructor(n) { this.n = n; } speak() { return this.n; } }
class Dog extends Animal { speak() { return super.speak() + ' woofs'; } }`,
            answer: "Methods go on the constructor's prototype; inheritance links prototypes and calls the parent constructor.",
            solution: `function Animal(n) { this.n = n; }
Animal.prototype.speak = function () { return this.n; };
function Dog(n) { Animal.call(this, n); }
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
Dog.prototype.speak = function () { return Animal.prototype.speak.call(this) + ' woofs'; };`,
          },
        ],
      },
    ],
    senior: [
      {
        q: "Which design patterns do you actually use in frontend? (Observer, Strategy, Adapter, Facade) Show where.",
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
            task: "Implement a Facade around an analytics SDK so it can be swapped and is a no-op in tests.",
            description: "Checks the Facade pattern for third-party SDKs. Ask them to design the API and explain how it is tested.",
            answer: "Expose a small domain-level API (track/identify) that hides the vendor; choose the implementation at startup and inject a no-op or spy in tests. Weak answers just re-export the vendor object. Strong answers expose domain events, handle the SDK not being loaded and keep vendor types out of the app.",
            solution: `export function createAnalytics(vendor) {
  return {
    trackApplicationSubmitted: (id) => vendor?.track('application_submitted', { id }),
    identify: (user) => vendor?.identify(user.id, { role: user.role }),
  };
}
export const analytics = createAnalytics(import.meta.env.PROD ? window.amplitude : null);`,
          },
          {
            task: "Find the memory leak in this Observer usage and fix it.",
            description: "Checks Observer cleanup in React. Ask what happens after the component unmounts many times.",
            code: `function Price({ store }) {
  const [p, setP] = useState(store.get());
  useEffect(() => { store.subscribe(setP); }, [store]);
  return p;
}`,
            answer: "The subscription is never removed, so unmounted components keep receiving updates and stay referenced. Return the unsubscribe function (or use useSyncExternalStore). Weak answers miss the leak entirely. Strong answers return the unsubscribe or use useSyncExternalStore for tearing-safe subscriptions.",
            solution: "const p = useSyncExternalStore(store.subscribe, store.get);",
          },
        ],
        ai: true,
      },
      {
        q: "Refactor this class to follow SOLID and make it testable.",
        code: `class ReportService {
  async generate(userId) {
    const user = await fetch('/api/users/' + userId).then((r) => r.json());
    const rows = await fetch('/api/orders?user=' + userId).then((r) => r.json());
    const csv = rows.map((r) => [r.id, r.total].join(',')).join('\\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv]));
    a.download = user.name + '.csv';
    a.click();
  }
}`,
        fix: `class ReportService {
  constructor({ api, formatter, downloader }) {
    Object.assign(this, { api, formatter, downloader });
  }
  async generate(userId) {
    const [user, rows] = await Promise.all([this.api.getUser(userId), this.api.getOrders(userId)]);
    this.downloader.save(\`\${user.name}.csv\`, this.formatter.format(rows));
  }
}
const csvFormatter = { format: (rows) => rows.map((r) => [r.id, r.total].join(',')).join('\\n') };`,
        short: "It violates SRP and DIP: it fetches, formats and triggers downloads. Inject an API client, a formatter (Strategy — CSV/XLSX) and a downloader; parallelize the fetches. Each part becomes testable and swappable.",
        long: `Three reasons to change: API shape, file format, delivery mechanism.
Injecting collaborators lets tests pass fakes and verify the formatter with plain data.
The formatter is a Strategy: adding XLSX doesn't touch ReportService (Open/Closed).
Also fix: sequential independent fetches (use Promise.all), unescaped CSV values, leaked object URLs (revokeObjectURL).
Pitfalls: introducing interfaces/classes for everything; plain functions/objects are fine in JS.
Strong answer: identifies principles, correct refactor, spots CSV escaping and URL leak.
Weak answer: splits into methods within the same class only.`,
        exercises: [
          {
            task: "Fix the CSV formatter so values containing commas, quotes or newlines are valid.",
            description: "Checks attention to data correctness in the extracted Strategy. Ask what breaks with a name like 'Smith, John'.",
            code: "const toCsv = (rows) => rows.map((r) => r.join(',')).join('\\n');",
            answer: "Quote fields containing special characters and double internal quotes (RFC 4180). Strong answers also mention CSV injection (prefix cells starting with =,+,-,@).",
            solution: `const cell = (v) => {
  const s = String(v ?? '');
  return /[",\\n]/.test(s) ? \`"\${s.replace(/"/g, '""')}"\` : s;
};
const toCsv = (rows) => rows.map((r) => r.map(cell).join(',')).join('\\n');`,
          },
          {
            task: "Write a unit test for ReportService using fakes.",
            description: "Checks how DI pays off in testing. Ask them to write it without mocking globals.",
            answer: "Pass fake api/formatter/downloader objects and assert the downloader received the right filename and content.",
            solution: `it('downloads a CSV named after the user', async () => {
  const save = vi.fn();
  const svc = new ReportService({
    api: { getUser: async () => ({ name: 'Ann' }), getOrders: async () => [{ id: 1, total: 5 }] },
    formatter: csvFormatter,
    downloader: { save },
  });
  await svc.generate(7);
  expect(save).toHaveBeenCalledWith('Ann.csv', '1,5');
});`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: "How would you model a complex domain (e.g. admissions workflow) on the frontend?",
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
            task: "Model the rule 'decided applications can't be edited, withdrawn ones can be reopened only by admins' and decide where it lives.",
            description: "Checks domain modelling and source-of-truth decisions. Let the candidate sketch the model, then add a new rule to see if it scales.",
            answer: "Encode states and transitions in a shared domain module (state machine or transition table with guards), backed by the backend as source of truth; the frontend uses it for UX only and never as the security boundary. Weak answers scatter if-checks in components. Strong answers centralise transitions with guards and keep the backend authoritative.",
          },
          {
            task: "Backend adds a new status 'waitlisted'. How do you make sure the frontend can't silently mishandle it?",
            description: "Checks resilience to backend schema evolution. Ask how they would detect the gap at compile time and at runtime.",
            answer: "Use a discriminated union with exhaustive switch checks (assertNever) so the compiler flags every unhandled place, validate API responses at the boundary (zod) and render a safe fallback for unknown values in production. Weak answers rely on QA to notice. Strong answers combine exhaustive type checks, boundary validation and monitoring for unknown values.",
            solution: `function label(s) {
  switch (s.status) {
    case 'draft': return 'Draft';
    case 'submitted': return 'Submitted';
    case 'decided': return 'Decided';
    default: { const _never = s; return 'Unknown'; }
  }
}`,
          },
        ],
        ai: true,
      },
      {
        q: "Your frontend codebase mixes class-based services, functional hooks and plain modules with no consistent paradigm. Do you standardize, and how?",
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
            task: "Write a short ADR outline for 'Service layer conventions'.",
            description: "Checks decision documentation. Ask for headings and key content.",
            answer: "Context (current mix and its costs), decision (e.g. factory functions with injected deps), alternatives considered (classes, singletons), consequences (migration approach, lint rule), status and revisit date.",
          },
          {
            task: "A senior dev insists on adding an IoC container library. Evaluate the proposal.",
            description: "Checks judging tooling against needs. Role-play the advocate.",
            answer: "Ask which problem it solves that module-level DI or React context doesn't; consider bundle size, learning curve and decorators/reflect-metadata requirements. Usually reject or pilot in one area with clear success criteria.",
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
            task: "Reorganise these files into a feature-first structure.",
            description: "Checks basic project structuring. Give the list and ask them to reorganise it, explaining where tests would go.",
            code: `src/components/UserList.jsx
src/components/OrderTable.jsx
src/hooks/useUsers.js
src/hooks/useOrders.js
src/api/users.js
src/api/orders.js
src/components/Button.jsx`,
            answer: "Group by feature and keep only generic pieces in shared, so a change to orders touches one folder. Weak answers add more type-based folders. Strong answers co-locate tests and explain why shared/ must stay small.",
            solution: `src/features/users/{UserList.jsx,useUsers.js,api.js}
src/features/orders/{OrderTable.jsx,useOrders.js,api.js}
src/shared/ui/Button.jsx`,
          },
          {
            task: "What is wrong with this import and how do you improve it?",
            description: "Checks tooling basics for maintainable imports. Ask what breaks when this file moves.",
            code: "import { Button } from '../../../../shared/ui/Button';",
            answer: "Deep relative paths are brittle when files move and hard to read. Configure a path alias (e.g. @/) in the bundler and tsconfig. Weak answers suggest copying files to avoid long paths. Strong answers mention configuring both the bundler and TypeScript/ESLint resolvers.",
            solution: "import { Button } from '@/shared/ui/Button';",
          },
        ],
      },
      {
        q: "What's wrong with this component's structure? Refactor it.",
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
            task: "Split this component into container and presentational parts.",
            description: "Checks basic component decomposition. Ask which part is easy to reuse in Storybook.",
            code: `function Weather() {
  const [w, setW] = useState(null);
  useEffect(() => { fetch('/api/weather').then((r) => r.json()).then(setW); }, []);
  return w ? <p>{w.city}: {w.temp}°</p> : <p>Loading…</p>;
}`,
            answer: "The presentational component receives data and callbacks only; the container owns fetching/state. The presentational part becomes trivially testable.",
            solution: `const WeatherView = ({ weather }) =>
  weather ? <p>{weather.city}: {weather.temp}°</p> : <p>Loading…</p>;
function Weather() {
  const [w, setW] = useState(null);
  useEffect(() => { fetch('/api/weather').then((r) => r.json()).then(setW); }, []);
  return <WeatherView weather={w} />;
}`,
          },
          {
            task: "Explain where you'd put a `formatCurrency` helper used by three features.",
            description: "Checks shared vs feature code decisions. Ask for the folder and naming.",
            answer: "In shared/ (e.g. shared/lib/formatCurrency.js) because it is generic and used across features; if only one feature used it, it would stay in that feature folder.",
          },
        ],
      },
    ],
    middle: [
      {
        q: "Where should API calls live? Why not inside components?",
        short: "In a service/API layer consumed through query hooks: it's testable, reusable and gives one place for auth, errors and caching.",
        long: `Fetching directly in components mixes concerns, duplicates logic and makes race conditions and caching hard.
An API module defines endpoints and DTO mapping; hooks (e.g. TanStack Query) handle caching, loading and retries.
Components only render states (loading/error/data) and call mutations.
Pitfalls: useEffect fetches without cancellation, duplicated base URLs/headers, swallowing errors.
Strong answer: layered approach, mentions caching/invalidation and mocking (MSW) in tests.
Weak answer: "useEffect with fetch is fine everywhere".`,
        exercises: [
          {
            task: "Find the race condition and fix it.",
            description: "Checks race conditions in data fetching. Describe a user typing quickly on a slow network and ask what they see.",
            code: `useEffect(() => {
  fetch(\`/api/users?q=\${query}\`).then((r) => r.json()).then(setUsers);
}, [query]);`,
            answer: "Responses can arrive out of order, so a slow old query can overwrite newer results. Abort the previous request in cleanup, or use a query library that keys by query. Weak answers add a debounce only, which reduces but doesn't fix the race. Strong answers use AbortController or TanStack Query and encode the query param.",
            solution: `useEffect(() => {
  const c = new AbortController();
  fetch(\`/api/users?q=\${encodeURIComponent(query)}\`, { signal: c.signal })
    .then((r) => r.json())
    .then(setUsers)
    .catch((e) => { if (e.name !== 'AbortError') setError(e); });
  return () => c.abort();
}, [query]);`,
          },
          {
            task: "After saving a user, the list still shows old data. Fix it with TanStack Query.",
            description: "Checks server-state cache invalidation. Ask why the list didn't update and how to fix it.",
            code: "const save = useMutation({ mutationFn: updateUser });",
            answer: "The cached ['users'] query isn't invalidated. Invalidate (or update via setQueryData) on success. Weak answers call refetch from the component manually. Strong answers invalidate by key or apply an optimistic update with rollback.",
            solution: `const qc = useQueryClient();
const save = useMutation({
  mutationFn: updateUser,
  onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
});`,
          },
        ],
      },
      {
        q: "How do you decide where state lives: local component state, lifted state, context, a global store or server-state cache?",
        short: "Keep state as close as possible to where it's used; lift it only when siblings need it; context for low-frequency app-wide values (theme, user); server data in a server-state cache (TanStack Query); a global client store only for complex shared client state; URL for shareable UI state like filters.",
        long: `Most "global state" is actually server cache — treat it as such (caching, refetching, invalidation).
URL state (search params) for filters, pagination and tabs makes views shareable and back-button friendly.
Context re-renders all consumers on change; split contexts or use a store with selectors for frequently-changing values.
Form state belongs to a form library or local state, not the global store.
Pitfalls: putting everything in Redux, duplicating server data into client stores, prop drilling 6 levels deep.
Strong answer: a decision ladder with reasons and examples.
Weak answer: "always use Redux" or "always use context".`,
        exercises: [
          {
            task: "For each piece of state, say where it should live.",
            description: "Checks the state placement decision ladder. Read the list and ask for placement plus reason.",
            code: `// 1. Whether a dropdown is open
// 2. Table filters and current page
// 3. List of applicants from the API
// 4. Current user and theme
// 5. Unsaved values of a 10-field form`,
            answer: "1 local state; 2 URL search params; 3 server-state cache; 4 context; 5 local/form library. Weak answers put all in a global store.",
          },
          {
            task: "Fix the performance problem in this context provider.",
            description: "Checks context re-render behaviour. Ask why every consumer re-renders on each parent render.",
            code: `function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
}`,
            answer: "A new value object is created every render, so all consumers re-render. Memoize the value (and split rarely/frequently changing values into separate contexts).",
            solution: `function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const value = useMemo(() => ({ user, setUser }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}`,
          },
        ],
      },
    ],
    senior: [
      {
        q: "Design a real-time dashboard with thousands of updates/minute. Draw it.",
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
            task: "The batching code below grows memory forever when the tab is in the background. Explain and fix.",
            description: "Checks real-time UI under browser throttling. Ask what happens when the tab is hidden for an hour.",
            code: `socket.onmessage = (e) => {
  buffer.push(JSON.parse(e.data));
  requestAnimationFrame(flush);
};`,
            answer: "rAF is paused in background tabs, so the buffer is never flushed (and one rAF per message is scheduled). Coalesce by id, cap the buffer, and fall back to a timer when document.hidden. Weak answers miss that rAF pauses. Strong answers coalesce updates, bound memory and consider resync on visibilitychange.",
            solution: `const pending = new Map();
let scheduled = false;
socket.onmessage = (e) => {
  const u = JSON.parse(e.data);
  pending.set(u.id, u); // latest wins
  if (scheduled) return;
  scheduled = true;
  const run = () => { scheduled = false; store.applyUpdates([...pending.values()]); pending.clear(); };
  document.hidden ? setTimeout(run, 1000) : requestAnimationFrame(run);
};`,
          },
          {
            task: "Design how the dashboard recovers after a 2-minute network outage without showing stale or duplicated data.",
            description: "Checks resilient real-time design. There is no single code answer — ask them to walk through the reconnect timeline.",
            answer: "Track the last applied sequence number; on reconnect request events since that seq, or a fresh snapshot if the gap is too large, discard events with seq <= last applied, and show a 'reconnecting/stale' indicator meanwhile. Weak answers simply reconnect and keep streaming. Strong answers handle gaps, duplicates and user-visible staleness.",
          },
        ],
        ai: true,
      },
      {
        q: "This app crashes entirely when one widget fails. Make the architecture resilient.",
        code: `function Dashboard() {
  return (
    <>
      <Header />
      <RevenueChart />   {/* throws on malformed data */}
      <TasksList />
    </>
  );
}`,
        fix: `import { ErrorBoundary } from 'react-error-boundary';

function WidgetFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>This widget failed to load.</p>
      <button onClick={resetErrorBoundary}>Retry</button>
    </div>
  );
}

function Dashboard() {
  return (
    <>
      <Header />
      <ErrorBoundary FallbackComponent={WidgetFallback} onError={reportError}>
        <Suspense fallback={<Skeleton />}><RevenueChart /></Suspense>
      </ErrorBoundary>
      <ErrorBoundary FallbackComponent={WidgetFallback} onError={reportError}>
        <TasksList />
      </ErrorBoundary>
    </>
  );
}`,
        short: "A render error unmounts the whole React tree. Wrap independent widgets in error boundaries with fallbacks and retry, report errors to monitoring, validate API data at the boundary, and isolate loading with Suspense.",
        long: `Error boundaries catch render/lifecycle errors in their subtree; they don't catch event handlers or async code — handle those explicitly.
Granularity: route-level boundary as a last resort plus per-widget boundaries for independent features.
Validate data at the API boundary (zod) so malformed data becomes a handled error state, not a crash.
Report to Sentry/Datadog with context; add a reset mechanism (resetKeys) for retries.
Pitfalls: one global boundary only, swallowing errors without reporting, fallback UI that itself can throw.
Strong answer: boundaries + validation + observability + async error handling.
Weak answer: "wrap everything in try/catch".`,
        exercises: [
          {
            task: "Explain which of these errors an error boundary catches.",
            description: "Checks error boundary limits. Ask yes/no for each with reasoning.",
            code: `// 1. A child throws during render
// 2. onClick handler throws
// 3. fetch().then() rejects inside useEffect
// 4. The error boundary's own render throws`,
            answer: "Only 1 is caught. Event handler errors (2), async errors in effects/promises (3) and errors in the boundary itself (4) are not; handle them with try/catch, error state or a higher boundary. Strong answers mention showBoundary from react-error-boundary to forward async errors.",
          },
          {
            task: "Add runtime validation so malformed API data shows an error state instead of crashing.",
            description: "Checks boundary validation design. Ask them to write the parsing layer.",
            answer: "Parse responses with a schema at the API layer; failures become rejected queries handled by the UI's error state and reported with details.",
            solution: `import { z } from 'zod';
const Revenue = z.array(z.object({ month: z.string(), total: z.number() }));
export const getRevenue = async () => {
  const res = await fetch('/api/revenue');
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return Revenue.parse(await res.json());
};`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: "Plan an incremental Vue 2 → React migration while shipping features. What do you decide first?",
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
            task: "Halfway through the migration, Vue and React pages show different validation messages for the same form. What process change do you make?",
            description: "Checks how the candidate fixes process issues during a migration. Present it as an escalation from QA.",
            answer: "Extract business rules into a framework-agnostic shared module (or schema from the backend) consumed by both, add parity tests per migrated page, and make 'no duplicated business logic' part of the definition of done. Weak answers fix the one form. Strong answers address the systemic cause and add parity gates.",
          },
          {
            task: "Leadership asks for a date when Vue is gone. How do you produce a credible estimate?",
            description: "Checks estimation and stakeholder communication. Push back on any single date they give.",
            answer: "Inventory pages with complexity/traffic scores, use throughput from already migrated pages as a baseline, add risk buffers for shared infrastructure, and publish a burn-down that is re-forecast every sprint. Weak answers give a gut-feel date. Strong answers give a range based on data and a re-forecast cadence.",
          },
        ],
        ai: true,
      },
      {
        q: "Several teams want to build features in the same frontend. When would you choose micro-frontends over a modular monolith, and what would you standardize either way?",
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
            task: "Write the architecture rule that prevents features from importing each other's internals, and how you'd enforce it.",
            description: "Checks module boundary enforcement. Ask for a concrete tool configuration.",
            answer: "Features expose a public index; internals are private. Enforce with eslint-plugin-boundaries / no-restricted-imports or dependency-cruiser in CI.",
            solution: `// eslint.config.js
export default [{
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [{ group: ['@/features/*/*'], message: 'Import from the feature public index only.' }],
    }],
  },
}];`,
          },
          {
            task: "Two teams' micro-frontends ship different React versions and users see broken hooks. How do you prevent this organizationally and technically?",
            description: "Checks shared dependency governance. Ask for both the policy and the mechanism.",
            answer: "Declare React as a shared singleton with a required version range in Module Federation, owned by a platform team; upgrade in lockstep via a shared dependency policy and CI checks that fail on mismatches.",
          },
        ],
      },
    ],
  },
  CSS: {
    junior: [
      {
        q: "Explain the box model and box-sizing. Center a div.",
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
            task: "Predict the rendered width of .box.",
            description: "Checks the box model calculation. Ask for the width and how to make it exactly 200px.",
            code: ".box { width: 200px; padding: 20px; border: 5px solid; }",
            answer: "250px with the default content-box (200 + 2×20 + 2×5). With box-sizing: border-box it would be 200px. A common wrong answer is 200px or 240px. Strong answers explain why border-box is a global reset in most projects.",
          },
          {
            task: "Predict the gap between the two paragraphs and explain.",
            description: "Checks margin collapsing. Ask to predict the gap before showing it rendered.",
            code: `p { margin: 20px 0; }
.second { margin-top: 30px; }
/* <p>One</p><p class="second">Two</p> */`,
            answer: "30px, not 50px: adjacent vertical block margins collapse to the larger one. Most candidates say 50px. Strong answers list what prevents collapsing (flex/grid, padding, border, BFC).",
          },
        ],
      },
      {
        q: "Explain CSS specificity and the cascade. Why doesn't this button turn red?",
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
            task: "Calculate the specificity of each selector.",
            description: "Checks specificity arithmetic. Ask for the tuple for each.",
            code: `a:hover
#nav a
ul li.active:first-child  /* careful */
:where(#nav) a`,
            answer: "(0,1,1), (1,0,1), (0,2,1), (0,0,1): :hover counts as a class, ::before as an element, :where() contributes zero.",
          },
          {
            task: "Make this utility always win over component styles without !important.",
            description: "Checks modern specificity tools. Ask for at least one approach.",
            code: `.card .title { margin: 16px; }
.mt-0 { margin-top: 0; }  /* loses */`,
            answer: "Lower component specificity with :where(), or use cascade layers so utilities are in a later layer.",
            solution: `:where(.card) .title { margin: 16px; }  /* (0,1,0) */
.mt-0 { margin-top: 0; }                /* later, same specificity -> wins */`,
          },
        ],
      },
    ],
    middle: [
      {
        q: "Why does z-index: 9999 not put the modal on top?",
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
            task: "Explain why the dropdown is clipped and fix it.",
            description: "Checks overflow clipping and positioning. Show it as a bug report: 'menu cut off inside card'.",
            code: `.card { position: relative; overflow: hidden; border-radius: 8px; }
.card .menu { position: absolute; top: 100%; }`,
            answer: "overflow: hidden clips absolutely positioned descendants whose containing block is inside it, and z-index cannot escape clipping. Render the menu in a portal or the native popover top layer. Weak answers add z-index, which doesn't help with clipping. Strong answers mention portals, the popover API and anchor positioning.",
          },
          {
            task: "Which rule wins, and what color is the link?",
            description: "Checks specificity calculation including :is(). Ask for each selector's specificity first.",
            code: `#nav a { color: blue; }
.nav .link.active { color: red; }
a:is(.link, #main) { color: green; }
/* <nav id="nav" class="nav"><a class="link active">x</a></nav> */`,
            answer: "Green. Specificities are (1,0,1), (0,3,0) and (1,0,1) — :is() takes the specificity of its most specific argument (#main) even though .link is what matched. The ID rules beat red, and among the two ties the later one wins. Candidates often pick red because it has the most classes, or blue because ID beats classes. Strong answers know :is() takes its most specific argument and that order breaks ties.",
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
            task: "Fix the overflowing text in this flex layout.",
            description: "Checks min-width: auto on flex items. Ask why ellipsis doesn't work.",
            code: `.row { display: flex; }
.row .title { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.row .actions { flex: none; }`,
            answer: "Flex items default to min-width: auto, so they can't shrink below content width. Set min-width: 0 on the flexible item.",
            solution: ".row .title { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }",
          },
          {
            task: "Explain the difference between auto-fill and auto-fit with 2 items in a wide container.",
            description: "Checks grid track sizing. Draw or describe the container and ask what happens.",
            answer: "auto-fill creates as many tracks as fit, leaving empty ones so the 2 items stay at min size; auto-fit collapses empty tracks so the 2 items stretch to fill the row.",
          },
        ],
      },
    ],
    senior: [
      {
        q: "Flexbox vs Grid, container queries, :has(), cascade layers — when do you use each?",
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
            task: "Make this card layout responsive to its container instead of the viewport.",
            description: "Checks container queries for component-level responsiveness. Describe the card used both in a sidebar and in main content.",
            code: "@media (min-width: 600px) { .card { flex-direction: row; } }",
            answer: "Media queries react to the viewport, so a card in a narrow sidebar still switches. Declare a query container on the wrapper and use @container. Weak answers add more media queries. Strong answers set container-type and mention container query units.",
            solution: `.card-wrapper { container-type: inline-size; }
.card { display: flex; flex-direction: column; }
@container (min-width: 600px) { .card { flex-direction: row; } }`,
          },
          {
            task: "A third-party widget's `.btn` styles override yours. Fix it without !important or specificity hacks.",
            description: "Checks cascade layers. Ask how to win without !important or higher specificity.",
            answer: "Put third-party CSS in a lower cascade layer; later layers (and unlayered styles) win regardless of specificity. Weak answers increase specificity or use !important. Strong answers explain layer order and that unlayered styles beat layered ones.",
            solution: `@import url('widget.css') layer(vendor);
@layer vendor, app;
@layer app { .btn { background: var(--color-primary); } }`,
          },
        ],
      },
      {
        q: "How do you build an accessible, performant animation strategy in CSS? What makes an animation janky?",
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
            task: "Rewrite this animation to be compositor-friendly and accessible.",
            description: "Checks property choice and reduced motion. Ask why the original janks.",
            code: `.drawer { position: fixed; left: -300px; transition: left 300ms; }
.drawer.open { left: 0; }`,
            answer: "Animating left triggers layout each frame; use transform and wrap motion in a reduced-motion media query.",
            solution: `.drawer { position: fixed; left: 0; transform: translateX(-100%); transition: transform 300ms ease; }
.drawer.open { transform: translateX(0); }
@media (prefers-reduced-motion: reduce) {
  .drawer { transition: none; }
}`,
          },
          {
            task: "Animate an element from display: none to visible with pure CSS.",
            description: "Checks modern CSS (@starting-style, transition-behavior). Ask whether it is possible without JS.",
            answer: "Use @starting-style for the entry state and transition-behavior: allow-discrete so display participates in the transition; works in current evergreen browsers with graceful fallback.",
            solution: `.toast { transition: opacity 200ms, display 200ms allow-discrete; opacity: 1; }
.toast[hidden] { display: none; opacity: 0; }
@starting-style { .toast { opacity: 0; } }`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: "CSS-in-JS vs CSS modules vs Tailwind for a large org — your pick and migration plan?",
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
            task: "Write the success metrics and guardrails for migrating from Emotion to CSS modules across 6 teams.",
            description: "Checks migration planning and measurable outcomes. Ask how they would know the migration is done and worth it.",
            answer: "Metrics: % components migrated, runtime style JS removed from bundle, INP/LCP change, visual-regression diffs; guardrails: lint rule banning new Emotion imports, codemods, per-team owners and a deadline with review checkpoints. Weak answers have no metrics or end date. Strong answers combine adoption, performance and quality metrics with enforcement.",
          },
          {
            task: "Two product teams define their own blue. How do you set up tokens so the brand can change in one place and dark mode works?",
            description: "Checks design token architecture. Ask how dark mode and rebranding are handled.",
            answer: "Create primitive tokens (palette) and semantic tokens (--color-action) mapped to primitives per theme; components only use semantic tokens, enforced by stylelint disallowing raw hex. Weak answers have a single flat list of hex values. Strong answers separate primitive and semantic tokens and enforce usage.",
            solution: `:root { --blue-600: #1a56db; --color-action: var(--blue-600); }
[data-theme='dark'] { --color-action: #76a9fa; }
.button { background: var(--color-action); }`,
          },
        ],
        ai: true,
      },
      {
        q: "The design system's CSS has grown to 600KB and teams override it with !important everywhere. How do you fix this without stopping feature work?",
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
            task: "Write the stylelint rules you'd add and how you'd roll them out without blocking 500 existing violations.",
            description: "Checks guardrail rollout with baselines. Ask about existing violations.",
            answer: "Enable declaration-no-important and selector rules for new files or with a baseline (warnings for existing code, errors for new), track the count down per team over time.",
          },
          {
            task: "Propose the layer order for app, design system, third-party and reset CSS and explain it.",
            description: "Checks cascade layer architecture. Ask for the @layer declaration.",
            answer: "@layer reset, third-party, design-system, app, overrides; later layers win, so app styles beat the design system without specificity games, and a small overrides layer replaces !important.",
            solution: "@layer reset, third-party, design-system, app, overrides;",
          },
        ],
      },
    ],
  },
  "Networking (Fetch API or others)": {
    junior: [
      {
        q: "Does fetch reject on 404/500?",
        short: "No — fetch only rejects on network failures (or abort). You must check response.ok / response.status yourself.",
        long: `fetch resolves for any HTTP response, including 4xx and 5xx.
response.ok is true for 200–299; anything else should be turned into an error by your code.
Rejection happens on DNS/network failures, CORS blocks and AbortController aborts.
Pitfalls: calling res.json() on an error HTML page, forgetting credentials for cookies, no timeout by default.
Strong answer: shows a wrapper that throws with status and parses error bodies safely.
Weak answer: "yes, catch handles it".`,
        exercises: [
          {
            task: "Fix the bug: errors from the server are never shown.",
            description: "Checks that fetch doesn't reject on HTTP errors. Ask what the user sees when the server returns 500.",
            code: `try {
  const data = await fetch('/api/save', { method: 'POST' }).then((r) => r.json());
  show('Saved!');
} catch {
  show('Failed');
}`,
            answer: "A 500 response resolves the promise, so 'Saved!' appears whenever the error body happens to be JSON. Check res.ok and throw. Most candidates think the catch runs. Strong answers check res.ok and handle non-JSON error bodies.",
            solution: `try {
  const res = await fetch('/api/save', { method: 'POST' });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  show('Saved!');
} catch {
  show('Failed');
}`,
          },
          {
            task: "Send a JSON body with fetch and explain each part.",
            description: "Checks basic fetch usage for POST JSON. Ask them to write it from memory.",
            answer: "Use method POST, a Content-Type: application/json header, and JSON.stringify the body; without the header many servers won't parse it. Weak answers forget the header or pass an object directly as body. Strong answers also check the response status.",
            solution: `await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Ann' }),
});`,
          },
        ],
      },
      {
        q: "What do HTTP status code classes mean, and which codes should a frontend handle explicitly?",
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
            task: "Map each status to the UI behaviour you'd implement.",
            description: "Checks practical status handling. Read the codes and ask for behaviour.",
            code: "401, 403, 422, 429, 503",
            answer: "401 → refresh token or redirect to login; 403 → 'no access' message; 422 → field errors; 429 → wait for Retry-After and retry; 503 → friendly error with retry. Weak answers show the same generic toast for all.",
          },
          {
            task: "Fix this code that breaks on a successful DELETE.",
            description: "Checks 204 handling. Ask why it throws even though the request succeeded.",
            code: `const res = await fetch('/api/items/1', { method: 'DELETE' });
const data = await res.json();`,
            answer: "204 No Content has no body, so res.json() throws a SyntaxError. Check status/content before parsing.",
            solution: `const res = await fetch('/api/items/1', { method: 'DELETE' });
if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
const data = res.status === 204 ? null : await res.json();`,
          },
        ],
      },
    ],
    middle: [
      {
        q: "Explain CORS. Why does a preflight request happen?",
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
            task: "Will this request trigger a preflight? Why does the cookie never get sent?",
            description: "Checks simple vs preflighted requests and credentials. Ask two separate questions: preflight? cookie?",
            code: "fetch('https://api.example.com/me', { headers: { Accept: 'application/json' } });",
            answer: "No preflight: GET with only a safelisted header is a simple request. Cookies aren't sent cross-origin because credentials defaults to 'same-origin'; add credentials: 'include' and the server must reply with Allow-Credentials: true and an explicit origin. Candidates often say any cross-origin request is preflighted. Strong answers know the safelisted headers and credentials modes.",
          },
          {
            task: "Find the misconfiguration.",
            description: "Checks CORS with credentials. Ask what the browser does with this response.",
            code: `Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true`,
            answer: "Browsers reject a wildcard origin for credentialed requests. Echo a whitelisted Origin value and add Vary: Origin so caches don't serve the wrong header. Weak answers think it works because it's 'most permissive'. Strong answers mention echoing the Origin and Vary: Origin.",
          },
        ],
      },
      {
        q: "Fix this search so it doesn't flood the server and never shows results for an old query.",
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
            task: "Implement debounce.",
            description: "Checks closures and timers. Ask them to write it from scratch and explain leading vs trailing.",
            answer: "Clear the pending timer on each call and schedule a new one; the function runs after calls stop for `ms`. Strong answers forward this/args and mention cancel().",
            solution: `function debounce(fn, ms) {
  let t;
  const d = function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), ms);
  };
  d.cancel = () => clearTimeout(t);
  return d;
}`,
          },
          {
            task: "Explain how AbortSignal.timeout differs from setTimeout + controller.abort and when you'd combine signals.",
            description: "Checks modern abort APIs. Ask for code combining a user cancel with a timeout.",
            answer: "AbortSignal.timeout creates a signal that aborts with a TimeoutError after the delay; AbortSignal.any merges it with a user signal so either cancels the request.",
            solution: `const res = await fetch(url, {
  signal: AbortSignal.any([userController.signal, AbortSignal.timeout(8000)]),
});`,
          },
        ],
      },
    ],
    senior: [
      {
        q: "Implement fetch with timeout, retry with exponential backoff, and cancellation.",
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
            task: "Implement a request deduplicator so concurrent identical GETs share one network call.",
            description: "Checks promise sharing and response body semantics. Ask for an implementation and then for edge cases.",
            answer: "Keep a Map of in-flight promises keyed by URL and delete the entry when settled; share parsed JSON rather than the Response because a body can be read only once. Weak answers return the same Response to everyone and hit 'body already used'. Strong answers handle errors and clean up the map.",
            solution: `const inflight = new Map();
export function dedupedJson(url) {
  if (!inflight.has(url)) {
    inflight.set(url, fetch(url)
      .then((r) => { if (!r.ok) throw new Error(\`HTTP \${r.status}\`); return r.json(); })
      .finally(() => inflight.delete(url)));
  }
  return inflight.get(url);
}`,
          },
          {
            task: "Why is retrying this POST dangerous and how do you make retries safe?",
            description: "Checks idempotency in retries. Describe a timeout after the payment server processed the request.",
            code: "await fetchRetry('/api/payments', { method: 'POST', body });",
            answer: "If the first attempt reached the server but the response was lost, a retry charges twice. Send an Idempotency-Key generated once per logical operation so the server deduplicates. Weak answers say 'just don't retry'. Strong answers use idempotency keys reused across retries of the same operation.",
            solution: `const key = crypto.randomUUID();
await fetchRetry('/api/payments', {
  method: 'POST',
  body,
  headers: { 'Idempotency-Key': key, 'Content-Type': 'application/json' },
});`,
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
        q: "Compare WebSockets, Server-Sent Events and long polling. How do you choose, and what production concerns apply?",
        short: "SSE: simple one-way server→client over HTTP with auto-reconnect; WebSockets: full-duplex, binary, lower overhead per message but more infra work; long polling: fallback with highest overhead. Production concerns: reconnection/resync, auth, proxies/load balancers, backpressure and scaling connections.",
        long: `SSE (EventSource) is great for notifications and live feeds; it uses HTTP, works with HTTP/2 multiplexing, reconnects automatically and supports Last-Event-ID for resume.
EventSource can't set custom headers — use cookies or a token in the URL (with care), or fetch-based SSE.
WebSockets suit chat, collaboration, games; you implement heartbeats, reconnection and message ordering yourself.
Infra: sticky sessions or a pub/sub backplane, idle timeouts on proxies, connection limits per server.
Pitfalls: one socket per component, no heartbeat (zombie connections), unbounded client buffers.
Strong answer: choice by requirements, plus reconnection, auth and scaling details.
Weak answer: "WebSockets are always better".`,
        exercises: [
          {
            task: "Implement an SSE client that resumes from the last event after reconnect.",
            description: "Checks EventSource semantics. Ask what the browser does automatically.",
            answer: "EventSource auto-reconnects and sends Last-Event-ID if the server set ids, so the server can replay missed events. Strong answers handle onerror and closing on unmount.",
            solution: `const es = new EventSource('/api/stream', { withCredentials: true });
es.addEventListener('task-updated', (e) => store.apply(JSON.parse(e.data)));
es.onerror = () => { /* browser retries automatically; show 'reconnecting' */ };
// server: "id: 42\\nevent: task-updated\\ndata: {...}\\n\\n"
// later: es.close();`,
          },
          {
            task: "Add a heartbeat to detect dead WebSocket connections.",
            description: "Checks connection liveness. Ask why onclose may never fire.",
            answer: "Half-open connections (network drop, sleeping laptop) may not fire close for minutes. Send periodic pings and close/reconnect if no pong arrives in time.",
            solution: `function withHeartbeat(ws, interval = 15000) {
  let timeout;
  const ping = setInterval(() => {
    ws.send(JSON.stringify({ type: 'ping' }));
    timeout = setTimeout(() => ws.close(4000, 'heartbeat timeout'), 5000);
  }, interval);
  ws.addEventListener('message', (e) => { if (JSON.parse(e.data).type === 'pong') clearTimeout(timeout); });
  ws.addEventListener('close', () => { clearInterval(ping); clearTimeout(timeout); });
}`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: "REST vs GraphQL vs tRPC for your next product — how do you decide?",
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
            task: "Mobile and web teams complain the REST API needs 6 calls per screen. Evaluate options and pick one.",
            description: "Checks API strategy decisions with multiple clients. Let the candidate ask clarifying questions first.",
            answer: "Options: BFF per client, composite endpoints, GraphQL gateway. A BFF or GraphQL is justified if several clients have divergent needs; weigh ownership, caching and the team's ability to operate it. Weak answers pick GraphQL by default. Strong answers compare options against ownership, caching and operational cost.",
          },
          {
            task: "Define how breaking API changes are rolled out without breaking deployed frontends.",
            description: "Checks API evolution and backward compatibility. Ask about users with a tab open for a week.",
            answer: "Expand/contract: add the new field/endpoint, migrate clients, monitor usage, then remove after a deprecation window; contract tests (OpenAPI/Pact) in CI catch accidental breaks. Weak answers coordinate releases by date. Strong answers use expand/contract, deprecation telemetry and contract tests.",
          },
        ],
        ai: true,
      },
      {
        q: "Your SPA makes 40 API calls on dashboard load and the backend team is overloaded. What do you do across teams?",
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
            task: "Given a waterfall where 12 calls happen sequentially after /me, propose fixes.",
            description: "Checks network waterfall analysis. Describe the trace and ask for prioritized fixes.",
            answer: "Parallelize calls that don't depend on each other, prefetch /me data in HTML or with preload, include needed data in /me, and lazy-load widgets below the fold. Strong answers prioritize by critical path.",
          },
          {
            task: "Draft the API guidelines you'd propose to backend teams to reduce chattiness.",
            description: "Checks cross-team standards. Ask for 4–5 rules.",
            answer: "E.g. consistent cursor pagination, sparse fieldsets/include parameters, batch endpoints for common screens, ETag/Cache-Control on GETs, and documented SLOs per endpoint; agreed via RFC and checked in API review.",
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
            task: "Find the performance issues in this hero image.",
            description: "Checks image loading basics and LCP. Ask the candidate to list every problem in the tag.",
            code: "<img src=\"hero-4000px.png\" loading=\"lazy\" alt=\"\">",
            answer: "Oversized PNG, lazy-loading the likely LCP image delays it, and no width/height causes CLS. Serve sized AVIF/WebP via srcset, load it eagerly with fetchpriority=\"high\", and set dimensions. Weak answers only say 'compress it'. Strong answers cover format, size, priority, CLS and alt text.",
            solution: `<img src="hero-1600.webp" srcset="hero-800.webp 800w, hero-1600.webp 1600w"
     sizes="100vw" width="1600" height="900" fetchpriority="high" alt="Campus at sunset">`,
          },
          {
            task: "Name two ways to avoid loading JavaScript for a page the user may never visit.",
            description: "Checks code-splitting fundamentals. Ask how they would verify the chunk is loaded lazily.",
            answer: "Route-level code splitting with dynamic import() (React.lazy) and deferring third-party scripts until interaction or idle. Weak answers suggest minification only. Strong answers mention dynamic import and checking the Network tab.",
            solution: "const Reports = lazy(() => import('./pages/Reports'));",
          },
        ],
      },
      {
        q: "Why is this page slow to show content? Fix the script loading.",
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
            task: "Predict the execution order.",
            description: "Checks defer vs async semantics. Ask to predict the possible orders.",
            code: `<script async src="a.js"></script>
<script defer src="b.js"></script>
<script defer src="c.js"></script>
<script>console.log('inline')</script>`,
            answer: "inline runs immediately during parsing; b.js and c.js run after parsing in order b, c (defer); a.js runs whenever it downloads, possibly before or after. Strong answers note DOMContentLoaded waits for deferred scripts but not async.",
          },
          {
            task: "Add resource hints for a third-party font CDN and the hero image.",
            description: "Checks preconnect/preload usage. Ask which hint fits each case.",
            answer: "preconnect to the font origin to save DNS/TLS time, preload the hero image with fetchpriority high. Overusing preload competes with critical resources.",
            solution: `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="image" href="/hero-1600.webp" fetchpriority="high">`,
          },
        ],
      },
    ],
    middle: [
      {
        q: "Explain Core Web Vitals (LCP, INP, CLS) and how to improve each.",
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
            task: "This click handler gives INP of 600ms. Improve it.",
            description: "Checks INP and main-thread work. Ask what the user experiences and how to improve it.",
            code: `button.onclick = () => {
  const result = heavyCompute(data); // 500ms
  render(result);
  analytics.track('clicked');
};`,
            answer: "Show immediate feedback first, yield so the browser can paint, move heavyCompute to a Worker or chunk it, and defer analytics. Weak answers wrap everything in setTimeout. Strong answers give immediate feedback, yield and offload heavy work.",
            solution: `button.onclick = async () => {
  showSpinner();
  await (globalThis.scheduler?.yield?.() ?? new Promise((r) => setTimeout(r)));
  const result = await worker.compute(data);
  render(result);
  requestIdleCallback(() => analytics.track('clicked'));
};`,
          },
          {
            task: "A cookie banner pushes content down after load (CLS 0.25). Fix it.",
            description: "Checks CLS causes and fixes. Ask how they'd measure the improvement.",
            answer: "Reserve space for it up front, or render it as an overlay (position: fixed) so it doesn't shift content. Weak answers hide the banner. Strong answers reserve space or overlay and verify with field data.",
          },
        ],
      },
      {
        q: "How do you analyze and reduce JavaScript bundle size?",
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
            task: "Explain why this import may bloat the bundle and fix it.",
            description: "Checks tree-shaking awareness. Ask what ends up in the bundle.",
            code: `import _ from 'lodash';
const d = _.debounce(fn, 300);`,
            answer: "lodash (CommonJS) isn't tree-shakable, so the whole library is bundled. Import the specific function or use lodash-es / native alternatives.",
            solution: `import debounce from 'lodash/debounce';
const d = debounce(fn, 300);`,
          },
          {
            task: "Lazy-load a heavy chart component only when its tab is opened, with a fallback.",
            description: "Checks code-splitting in React. Ask them to write it.",
            answer: "Use React.lazy with dynamic import and Suspense; the chart chunk downloads only when rendered. Strong answers prefetch on hover.",
            solution: `const RevenueChart = lazy(() => import('./RevenueChart'));
function ReportsTab({ active }) {
  if (!active) return null;
  return (
    <Suspense fallback={<Skeleton height={300} />}>
      <RevenueChart />
    </Suspense>
  );
}`,
          },
        ],
      },
    ],
    senior: [
      {
        q: "A 5,000-row table with filters lags when typing. Diagnose and fix step by step with tools.",
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
            task: "Explain why React.memo doesn't stop re-renders here and fix it.",
            description: "Checks React.memo pitfalls. Ask why the Profiler still shows every Row rendering.",
            code: `const Row = memo(({ row, onSelect, style }) => /* ... */);
// parent
{rows.map((r) => <Row key={r.id} row={r} onSelect={() => select(r.id)} style={{ height: 36 }} />)}`,
            answer: "New function and style objects on each render break shallow equality. Pass a stable callback taking an id and hoist constant styles. Weak answers add useMemo everywhere. Strong answers fix prop identity and verify with the Profiler.",
            solution: `const ROW_STYLE = { height: 36 };
const onSelect = useCallback((id) => select(id), [select]);
{rows.map((r) => <Row key={r.id} row={r} onSelect={onSelect} style={ROW_STYLE} />)}`,
          },
          {
            task: "A Performance trace shows long 'Layout' blocks inside a scroll handler. Diagnose the code.",
            description: "Checks layout thrashing diagnosis from a trace. Ask what the trace's purple blocks mean.",
            code: `items.forEach((el) => {
  el.style.width = container.offsetWidth / 3 + 'px';
});`,
            answer: "Layout thrashing: reading offsetWidth after each write forces synchronous layout every iteration. Read once, then write (or use CSS grid instead of JS sizing). Weak answers blame the scroll event itself. Strong answers batch reads and writes or remove JS layout.",
            solution: `const w = container.offsetWidth / 3;
items.forEach((el) => { el.style.width = w + 'px'; });`,
          },
        ],
        follow: "Rows are now editable — what changes?",
        ai: true,
      },
      {
        q: "This SPA's memory grows every time users navigate between pages until the tab crashes. Find the leaks and fix them.",
        code: `function LiveTasks() {
  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    window.addEventListener('resize', () => setTasks((t) => [...t]));
    const id = setInterval(() => fetchTasks().then(setTasks), 5000);
    cache.push(tasks);
  }, []);
  return <List items={tasks} />;
}`,
        fix: `function LiveTasks() {
  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    const onResize = () => setTasks((t) => [...t]);
    window.addEventListener('resize', onResize);
    const controller = new AbortController();
    const id = setInterval(() => fetchTasks({ signal: controller.signal }).then(setTasks).catch(() => {}), 5000);
    return () => {
      window.removeEventListener('resize', onResize);
      clearInterval(id);
      controller.abort();
    };
  }, []);
  return <List items={tasks} />;
}`,
        short: "The effect never cleans up: the resize listener and interval survive unmount and retain the component closure; a module-level cache grows without bound. Return a cleanup that removes listeners, clears intervals and aborts requests; bound caches. Diagnose with heap snapshots comparing before/after navigation.",
        long: `Typical SPA leaks: listeners on window/document, timers, subscriptions, detached DOM nodes held in JS, unbounded caches/maps.
Diagnose: Memory panel heap snapshots — navigate away and back several times, compare, look at retainers and "Detached" nodes.
Fix with effect cleanup, AbortController, WeakMap/WeakRef for caches keyed by objects, LRU limits.
Third-party widgets often need explicit destroy() calls on unmount.
Pitfalls: assuming GC handles everything, StrictMode double effects hiding missing cleanups, closures capturing large data.
Strong answer: systematic heap-snapshot process and correct cleanup patterns.
Weak answer: "restart the browser".`,
        exercises: [
          {
            task: "Describe the exact DevTools steps to confirm and locate a leak in a route transition.",
            description: "Checks hands-on memory profiling. Ask for a step-by-step procedure.",
            answer: "Take a heap snapshot on page A, navigate to B and back N times, force GC, take another snapshot, use Comparison view to find growing constructors, inspect Retainers to find the holding reference (listener, closure, cache), fix and repeat to verify flat memory.",
          },
          {
            task: "Replace this unbounded cache with a bounded one.",
            description: "Checks cache design for long-lived SPAs. Ask for an LRU implementation.",
            code: `const cache = new Map();
export const getCached = (k, load) => cache.get(k) ?? (cache.set(k, load(k)), cache.get(k));`,
            answer: "Use a Map's insertion order: on get, re-insert to mark as recent; on set beyond capacity, delete the oldest key.",
            solution: `export function lru(limit = 100) {
  const m = new Map();
  return {
    get(k) { if (!m.has(k)) return undefined; const v = m.get(k); m.delete(k); m.set(k, v); return v; },
    set(k, v) { m.delete(k); m.set(k, v); if (m.size > limit) m.delete(m.keys().next().value); },
  };
}`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: "How do you make performance a team responsibility rather than a hero project?",
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
            task: "RUM shows p75 LCP regressed from 2.1s to 3.4s after a release; nobody owns it. Describe your first week.",
            description: "Checks incident leadership for performance regressions. Ask about day 1 vs day 5.",
            answer: "Correlate by route/device/release to find the cause, assign an owner, roll back or flag-off if severe, then add the missing guardrail (budget/alert) and write a blameless review. Weak answers jump straight to optimising code. Strong answers mitigate, find root cause and add a guardrail.",
          },
          {
            task: "Marketing wants to add three tag-manager scripts. How do you decide and govern this?",
            description: "Checks governance of third-party scripts. Role-play as the marketing lead.",
            answer: "Measure their cost (lab + RUM experiment), require a performance and privacy review, load them deferred/consented or server-side, and include them in a third-party budget with an owner. Weak answers block or allow outright. Strong answers measure, set rules and own a budget.",
          },
        ],
        ai: true,
      },
      {
        q: "You have one quarter and a small team to improve performance of a large legacy app. How do you choose what to work on?",
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
            task: "Write three quarterly OKRs for this performance initiative.",
            description: "Checks goal setting with measurable outcomes. Ask for objectives and key results.",
            answer: "E.g. Objective: fast core journeys — KR1 p75 LCP on top 3 routes ≤ 2.5s (from 3.8s); KR2 p75 INP ≤ 200ms on the applicant table; KR3 budgets enforced in CI for all routes with zero unowned regressions.",
          },
          {
            task: "Product questions whether performance work is worth delaying features. Make the case.",
            description: "Checks business framing. Role-play as the product manager.",
            answer: "Use your own data: correlation between load time and task completion/conversion, support tickets about slowness, competitive benchmarks; propose a capped investment with measured checkpoints rather than an open-ended project.",
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
            task: "Explain why CI uses `npm ci` instead of `npm install`.",
            description: "Checks reproducible installs. Ask what happens if the lockfile is outdated.",
            answer: "npm ci installs exactly what package-lock.json specifies, fails if it is out of sync with package.json, and starts from a clean node_modules — reproducible and usually faster. Weak answers say they are the same. Strong answers mention lockfile strictness and clean installs.",
          },
          {
            task: "Order these pipeline steps to fail fast and explain: build, lint, e2e, install, unit tests, typecheck.",
            description: "Checks pipeline ordering. Ask them to order the steps and justify it.",
            answer: "install → lint/typecheck (cheap, parallel) → unit tests → build → e2e. Cheap checks first give feedback in seconds and save compute. Weak answers put e2e first. Strong answers optimise for fast feedback and parallelism.",
          },
        ],
      },
      {
        q: "This GitHub Actions workflow passes even when tests fail and is slow. Fix it.",
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
            task: "Explain what a required status check is and why it matters.",
            description: "Checks connecting CI to branch protection. Ask what happens without it.",
            answer: "Branch protection can require named checks to pass before merging; without it, a red CI run is advisory and broken code can still be merged.",
          },
          {
            task: "Make the test job run against Node 20 and 22 in parallel.",
            description: "Checks matrix builds. Ask them to write the YAML.",
            answer: "A strategy.matrix runs one job per value in parallel; reference it via the matrix context.",
            solution: `jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: \${{ matrix.node }}, cache: npm }
      - run: npm ci
      - run: npm test`,
          },
        ],
      },
    ],
    middle: [
      {
        q: "Preview deployments and environment variables — how do you handle secrets in a frontend build?",
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
            task: "Spot the leak in this Vite env file and fix it.",
            description: "Checks build-time env var exposure. Show the .env and ask if it is safe.",
            code: `# .env
VITE_API_URL=https://api.example.com
VITE_SENDGRID_KEY=SG.xxxxx`,
            answer: "Every VITE_* variable is inlined into the public bundle, so the email API key is exposed. Rotate it and call SendGrid from a backend endpoint that holds the secret. Weak answers say .env isn't committed so it's safe. Strong answers know VITE_ vars are inlined and rotate the key.",
          },
          {
            task: "Explain how to deploy the same build artifact to staging and production when API URLs differ.",
            description: "Checks build-once-deploy-many. Ask how they ensure staging and prod run the same artifact.",
            answer: "Build once, then inject runtime config (e.g. /config.json served per environment) instead of baking env vars at build time, so what you tested is exactly what you ship. Weak answers rebuild per environment. Strong answers inject runtime config.",
            solution: `const config = await fetch('/config.json').then((r) => r.json());
createApp({ apiUrl: config.apiUrl });`,
          },
        ],
      },
      {
        q: "What are preview (ephemeral) environments and how do you set them up for a frontend app safely?",
        short: "A per-PR deployment with a unique URL so reviewers, QA and designers test changes before merge. Build the PR, deploy to a unique path/subdomain, post the URL to the PR, point it at a non-production API, protect access, and tear it down on close.",
        long: `Benefits: faster feedback, visual review, E2E against a real deployment, product sign-off.
Configuration: runtime config or build-time env pointing to staging/mock APIs, never production data.
Security: forked PRs must not get secrets (pull_request vs pull_request_target), add auth or noindex to previews.
Cleanup: delete on PR close to control cost; keep URLs predictable (pr-123.preview.example.com).
Pitfalls: previews hitting production, leaking secrets through untrusted PR code, CORS/auth callbacks not allowing preview domains.
Strong answer: workflow, security around forks, data isolation and cleanup.
Weak answer: "Vercel does it".`,
        exercises: [
          {
            task: "Explain why this workflow is dangerous for a public repo.",
            description: "Checks GitHub Actions security with forks. Ask what an attacker could do.",
            code: `on: pull_request_target
jobs:
  preview:
    steps:
      - uses: actions/checkout@v4
        with: { ref: \${{ github.event.pull_request.head.sha }} }
      - run: npm ci && npm run build
      - run: deploy --token \${{ secrets.DEPLOY_TOKEN }}`,
            answer: "pull_request_target runs with repository secrets, and checking out the PR head executes untrusted code (npm install scripts, build) with those secrets. Use pull_request for untrusted code or never check out the head in pull_request_target.",
          },
          {
            task: "Add a job that deletes the preview when the PR is closed.",
            description: "Checks lifecycle automation. Ask them to write the trigger and step.",
            answer: "Trigger on pull_request closed and remove the environment named by the PR number.",
            solution: `on:
  pull_request:
    types: [closed]
jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - run: ./scripts/delete-preview.sh pr-\${{ github.event.number }}`,
          },
        ],
      },
    ],
    senior: [
      {
        q: "Pipeline takes 25 minutes. How do you make it 5?",
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
            task: "Fix the caching mistake.",
            description: "Checks CI caching correctness. Ask what happens after a dependency update.",
            code: `- uses: actions/cache@v4
  with:
    path: node_modules
    key: deps-\${{ runner.os }}`,
            answer: "The key never changes, so dependency updates reuse a stale cache. Key on the lockfile hash and cache the package manager store (setup-node cache: npm) rather than node_modules. Weak answers say caching is fine. Strong answers key on lockfile hash and cache the package store.",
            solution: `- uses: actions/setup-node@v4
  with: { node-version: 22, cache: npm }
- run: npm ci`,
          },
          {
            task: "E2E tests fail randomly ~5% of runs and devs click 'rerun'. Describe what you change in the pipeline.",
            description: "Checks flaky test management. Ask how they would measure flakiness.",
            answer: "Detect flakes (retries with reporting), quarantine flaky tests out of the blocking path with owners, collect traces on failure, and fix root causes (network waits, shared test data). Weak answers increase retries. Strong answers quarantine with owners and fix root causes.",
          },
        ],
      },
      {
        q: "This deploy script can leave production in a broken state. Make the deployment atomic and rollback-friendly.",
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
            task: "Handle ChunkLoadError in the client after a deploy.",
            description: "Checks client-side resilience to deploys. Ask what users experience without it.",
            answer: "Lazy imports for chunks that no longer exist fail; catch the error and reload once (guarding against loops) so the user gets the new index.html.",
            solution: `const lazyWithReload = (factory) => lazy(() =>
  factory().catch((e) => {
    if (!sessionStorage.getItem('reloaded')) {
      sessionStorage.setItem('reloaded', '1');
      location.reload();
    }
    throw e;
  }));`,
          },
          {
            task: "Describe a rollback procedure that takes under one minute.",
            description: "Checks operational readiness. Ask for exact steps and how it's tested.",
            answer: "Keep each release in a versioned prefix; rollback switches the CDN origin path or index.html pointer to the previous version via a single pipeline job, rehearsed regularly; invalidate only index.html.",
          },
        ],
      },
    ],
    techlead: [
      {
        q: "Design a release process for 5 teams shipping daily safely.",
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
            task: "A bad release reached 100% of users in 2 minutes. Propose pipeline changes that prevent a repeat.",
            description: "Checks release safety design after an incident. Ask what they would change first.",
            answer: "Progressive rollout with automated health gates and auto-rollback, feature flags to decouple release, and a blameless postmortem; track change failure rate and MTTR. Weak answers add manual QA. Strong answers add progressive delivery and automated rollback.",
          },
          {
            task: "Write the policy for stale feature flags across 5 teams.",
            description: "Checks flag lifecycle governance. Ask how the policy is enforced.",
            answer: "Each flag has an owner and expiry at creation; CI/lint warns on expired flags, a monthly report lists them, and removal is part of the feature's definition of done. Weak answers rely on reminders. Strong answers automate expiry warnings and ownership.",
          },
        ],
        ai: true,
      },
      {
        q: "How would you measure and improve your organization's delivery performance using DORA metrics without turning them into a weapon?",
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
            task: "Lead time is 9 days; deploys are daily. Find where time goes and propose improvements.",
            description: "Checks value-stream analysis. Ask what data they'd collect.",
            answer: "Break lead time into coding, waiting for review, review, waiting for merge/deploy; typically review wait dominates. Improve with smaller PRs, review SLAs, pairing, and automated checks that speed up reviews.",
          },
          {
            task: "A director wants to rank teams by deployment frequency. Respond.",
            description: "Checks protecting metric integrity. Role-play as the director.",
            answer: "Explain that cross-team ranking invites gaming and ignores context; propose trend-based team goals, combined speed/stability metrics and a quarterly review of improvements instead.",
          },
        ],
      },
    ],
  },
  "Testing (Unit, Integration, E2E, Visual regression, Accessibility, Performance etc)": {
    junior: [
      {
        q: "Unit vs integration vs E2E tests?",
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
            task: "Write a unit test for `sum(a, b)` including an edge case.",
            description: "Checks basic unit test writing. Ask them to write tests including an edge case.",
            answer: "A good test covers the normal case and edge cases (negatives, floats) with clear names. Weak answers use toBe for floats. Strong answers use toBeCloseTo and name tests clearly.",
            solution: `import { it, expect } from 'vitest';
it('adds numbers', () => expect(sum(2, 3)).toBe(5));
it('handles floats', () => expect(sum(0.1, 0.2)).toBeCloseTo(0.3));`,
          },
          {
            task: "Explain why this test passes even though fetchUser rejects, and fix it.",
            description: "Checks async testing. Ask why the test passes when it shouldn't.",
            code: `it('loads user', () => {
  fetchUser(1).then((u) => expect(u.name).toBe('Ann'));
});`,
            answer: "The promise isn't returned or awaited, so the test finishes before the assertion runs. Make the test async and await. Weak answers blame the test runner. Strong answers await or return the promise.",
            solution: `it('loads user', async () => {
  const u = await fetchUser(1);
  expect(u.name).toBe('Ann');
});`,
          },
        ],
      },
      {
        q: "What is mocking, and when should you mock in frontend tests?",
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
            task: "Write a test that verifies `onSave` is called with the form data when the button is clicked.",
            description: "Checks spies with Testing Library. Ask them to write it.",
            answer: "Pass a vi.fn() as the callback, interact like a user, and assert on the call arguments.",
            solution: `it('calls onSave with the name', async () => {
  const onSave = vi.fn();
  render(<NameForm onSave={onSave} />);
  await userEvent.type(screen.getByLabelText('Name'), 'Ann');
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(onSave).toHaveBeenCalledWith({ name: 'Ann' });
});`,
          },
          {
            task: "Make this test deterministic.",
            description: "Checks controlling time in tests. Ask why it fails on some days.",
            code: `it('shows greeting', () => {
  render(<Greeting />); // 'Good morning' before 12:00
  expect(screen.getByText('Good morning')).toBeInTheDocument();
});`,
            answer: "It depends on the real current date. Use fake timers with a fixed system time.",
            solution: `it('shows morning greeting', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-01-01T09:00:00'));
  render(<Greeting />);
  expect(screen.getByText('Good morning')).toBeInTheDocument();
  vi.useRealTimers();
});`,
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
            task: "Fix this flaky Testing Library test.",
            description: "Checks async queries in Testing Library. Ask why the test fails intermittently.",
            code: `render(<Users />);
expect(screen.getByText('Ann')).toBeInTheDocument();`,
            answer: "Data loads asynchronously, so getByText runs before it arrives. Use findBy* (which waits) for async content. Weak answers add waitFor with setTimeout. Strong answers use findBy queries.",
            solution: `render(<Users />);
expect(await screen.findByText('Ann')).toBeInTheDocument();`,
          },
          {
            task: "Test that a debounced search calls the API once after typing stops.",
            description: "Checks fake timers with userEvent. Ask them to write the test.",
            answer: "Use fake timers wired into userEvent, type, advance time past the debounce, and assert the call count. Weak answers use real timers with sleeps. Strong answers configure advanceTimers in userEvent.setup.",
            solution: `vi.useFakeTimers();
const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
render(<Search onSearch={spy} />);
await user.type(screen.getByRole('searchbox'), 'ann');
vi.advanceTimersByTime(300);
expect(spy).toHaveBeenCalledTimes(1);
expect(spy).toHaveBeenCalledWith('ann');`,
          },
        ],
      },
      {
        q: "Rewrite this test with proper async handling, user-centric queries and network mocking.",
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
            task: "Add a test for the error state using MSW.",
            description: "Checks testing unhappy paths. Ask them to write it.",
            answer: "Override the handler to return 500 and assert the alert appears.",
            solution: `it('shows an error when loading fails', async () => {
  server.use(http.get('/api/users', () => new HttpResponse(null, { status: 500 })));
  render(<UserList />);
  expect(await screen.findByRole('alert')).toHaveTextContent(/could not load users/i);
});`,
          },
          {
            task: "Explain getBy vs queryBy vs findBy and when to use each.",
            description: "Checks Testing Library query semantics. Ask for an example of each.",
            answer: "getBy throws if not found (assert presence now), queryBy returns null (assert absence), findBy returns a promise that waits (async appearance). A common mistake is using getBy for elements that appear after fetches.",
          },
        ],
      },
    ],
    senior: [
      {
        q: "Show a test you wrote that caught a real bug. What did you intentionally not test?",
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
            task: "This E2E test is flaky in CI. Identify the problems and rewrite it.",
            description: "Checks E2E flakiness causes. Ask them to rewrite the test.",
            code: `await page.click('.save');
await page.waitForTimeout(2000);
expect(await page.textContent('.toast')).toBe('Saved');`,
            answer: "Fixed sleeps race with real timing, CSS selectors are brittle, and the non-retrying expect checks once. Use role locators and web-first assertions that auto-wait. Weak answers increase the timeout. Strong answers use role locators and auto-waiting assertions.",
            solution: `await page.getByRole('button', { name: 'Save' }).click();
await expect(page.getByRole('status')).toHaveText('Saved');`,
          },
          {
            task: "A visual regression suite produces 40 diffs per PR from font anti-aliasing. Explain how you make it useful again.",
            description: "Checks visual regression stability. Ask how to reduce noise.",
            answer: "Run in a pinned Docker image/browser, disable animations, mask dynamic regions, use a small threshold, and scope screenshots to components (Storybook) rather than full pages. Weak answers raise thresholds a lot. Strong answers pin environments and scope screenshots.",
          },
        ],
        ai: true,
      },
      {
        q: "How do you test custom hooks, context-dependent components and code with complex async flows effectively?",
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
            task: "Write a `renderWithProviders` helper for a React Query + Router app.",
            description: "Checks test infrastructure design. Ask what must be fresh per test.",
            answer: "Create a new QueryClient per call with retry disabled and wrap with QueryClientProvider and MemoryRouter; return render's result plus the client.",
            solution: `export function renderWithProviders(ui, { route = '/' } = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const result = render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
  return { ...result, client };
}`,
          },
          {
            task: "Test a polling hook that refetches every 5 seconds and stops on unmount.",
            description: "Checks fake timers with hooks. Ask how to verify it stops.",
            answer: "Use renderHook with fake timers, advance time and count calls; unmount and advance again to verify no further calls.",
            solution: `vi.useFakeTimers();
const fetcher = vi.fn().mockResolvedValue([]);
const { unmount } = renderHook(() => usePolling(fetcher, 5000));
await vi.advanceTimersByTimeAsync(10000);
expect(fetcher).toHaveBeenCalledTimes(3); // initial + 2 polls
unmount();
await vi.advanceTimersByTimeAsync(10000);
expect(fetcher).toHaveBeenCalledTimes(3);`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: "Define the testing strategy (trophy vs pyramid), flaky test policy, and coverage targets for the org.",
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
            task: "Escaped defects are rising despite 85% coverage. Describe how you investigate and what you change.",
            description: "Checks test strategy analysis from data. Ask what metrics they would track.",
            answer: "Classify escaped bugs by layer and cause, compare with where tests actually exist, then shift investment (contract/integration tests, E2E for top flows) and track escaped-defect rate instead of coverage. Weak answers push coverage higher. Strong answers analyse escaped defects and shift test investment.",
          },
          {
            task: "Define acceptance criteria for adding a new test type (e.g. accessibility scans) to the blocking pipeline.",
            description: "Checks gating policy design. Ask how to introduce a11y scans without blocking all teams.",
            answer: "It must be fast enough, stable (flake rate below threshold during a non-blocking trial), actionable (clear failures with owners) and start from a baseline so existing violations don't block everyone. Weak answers turn it on blocking immediately. Strong answers start non-blocking with a baseline.",
          },
        ],
        ai: true,
      },
      {
        q: "Your E2E suite takes 90 minutes and is 15% flaky; teams have stopped trusting it. What's your plan?",
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
            task: "Rewrite the login step that every E2E test repeats through the UI.",
            description: "Checks E2E speed techniques. Ask how to authenticate once.",
            answer: "Log in once in a setup project, save storage state, and reuse it in all tests.",
            solution: `// auth.setup.js
setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_USER);
  await page.getByLabel('Password').fill(process.env.E2E_PASS);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.context().storageState({ path: '.auth/user.json' });
});
// playwright.config.js: projects use { storageState: '.auth/user.json', dependencies: ['setup'] }`,
          },
          {
            task: "Define the metrics dashboard you'd show weekly to track progress.",
            description: "Checks outcome tracking. Ask which numbers matter.",
            answer: "Suite duration p50/p95, flake rate (tests passing on retry), quarantined test count and age, escaped defects in covered journeys, and rerun count per PR.",
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
            task: "You committed to main instead of a feature branch (not pushed). Move the commit.",
            description: "Checks basic branch/reset mechanics. Ask for the exact commands.",
            answer: "Create a branch at the current commit, then reset main back one commit. Weak answers suggest re-cloning. Strong answers create the branch before resetting.",
            solution: `git branch feature/login
git reset --hard HEAD~1   # main back to before the commit
git checkout feature/login`,
          },
          {
            task: "Explain the difference between these commands.",
            description: "Checks fetch vs pull. Ask which is safer to run anytime.",
            code: `git fetch origin
git pull origin main`,
            answer: "fetch downloads remote refs without touching your branch; pull = fetch + merge (or rebase if configured) into the current branch. Weak answers say they're identical. Strong answers explain pull merges or rebases into the current branch.",
          },
        ],
      },
      {
        q: "You have a merge conflict. What does this mean and how do you resolve it?",
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
            task: "Write the commands to see what changed in your working tree, stage only one file and commit it.",
            description: "Checks the basic staging workflow. Ask for exact commands.",
            answer: "git status / git diff show changes; git add <file> stages one file; git commit -m creates the commit. Strong answers mention git add -p for partial staging.",
            solution: `git status
git diff
git add src/login.js
git commit -m "Fix login redirect"`,
          },
          {
            task: "Explain what this .gitignore does and fix the mistake.",
            description: "Checks .gitignore basics. Ask why .env is still tracked.",
            code: `node_modules/
dist/
.env`,
            answer: ".gitignore only affects untracked files; .env was committed before, so it stays tracked. Remove it from the index (and rotate any secrets).",
            solution: `git rm --cached .env
git commit -m "Stop tracking .env"`,
          },
        ],
      },
    ],
    middle: [
      {
        q: "You ran git reset --hard and lost your last commits, and your branch history is messy. Recover the work and clean up the history.",
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
            task: "Undo a commit that is already pushed to a shared main branch.",
            description: "Checks safe undo on shared branches. Ask why not reset.",
            answer: "Don't rewrite shared history; create an inverse commit with git revert (use -m 1 for a merge commit). Weak answers force-push a reset. Strong answers revert and mention -m for merges.",
            solution: `git revert <sha>
git push`,
          },
          {
            task: "Bring one bug-fix commit from main into release/2.3 without merging everything else.",
            description: "Checks cherry-pick for hotfixes. Ask how to trace the original commit.",
            answer: "Cherry-pick the commit; -x records the original sha in the message for traceability. Weak answers merge main into release. Strong answers use cherry-pick -x.",
            solution: `git checkout release/2.3
git cherry-pick -x <sha>`,
          },
        ],
        fix: `git reflog                      # find the commit before the reset, e.g. HEAD@{1}
git reset --hard HEAD@{1}       # restore lost commits
git rebase -i origin/main       # squash/fixup wip commits into meaningful ones
git push --force-with-lease`,
      },
      {
        q: "Explain the difference between git reset (soft, mixed, hard), git revert and git restore. When do you use each?",
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
            task: "Choose the right command for each scenario.",
            description: "Checks mapping commands to scenarios. Read scenarios and ask for commands.",
            code: `// 1. Fix the message/content of your last unpushed commit
// 2. Unstage a file you accidentally added
// 3. Throw away local edits to one file
// 4. Undo a commit already on shared main`,
            answer: "1 git commit --amend (or reset --soft HEAD~1); 2 git restore --staged file; 3 git restore file; 4 git revert <sha>. Weak answers use reset --hard everywhere.",
          },
          {
            task: "Use git stash to switch branches with uncommitted work, including untracked files.",
            description: "Checks stash usage. Ask for the commands and a pitfall.",
            answer: "git stash -u includes untracked files; pop reapplies and removes the stash. Pitfall: stashes are easy to forget; name them with -m.",
            solution: `git stash push -u -m "wip login form"
git checkout hotfix/urgent
# ...
git checkout feature/login
git stash pop`,
          },
        ],
      },
    ],
    senior: [
      {
        q: "A regression appeared somewhere in the last 200 commits. How do you find it, and what branching strategy keeps this manageable?",
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
            task: "Write a bisect script for a regression that only shows up after building the app.",
            description: "Checks automated bisect scripting. Ask what exit codes mean.",
            answer: "Exit 125 when the commit can't be built so bisect skips it, otherwise return the test's exit code. Weak answers don't handle unbuildable commits. Strong answers use exit 125 to skip.",
            solution: `#!/bin/sh
npm ci --silent && npm run build || exit 125
npx vitest run src/features/tasks/filter.test.js`,
          },
          {
            task: "A secret was committed 20 commits ago and pushed. List what you do, in order.",
            description: "Checks secret leak response. Ask for the order of actions.",
            answer: "Revoke/rotate the secret first (history rewriting does not un-leak it), then purge it with git filter-repo or BFG, force-push and have everyone re-clone, and add secret scanning/pre-commit hooks. Weak answers only rewrite history. Strong answers rotate the secret first.",
          },
        ],
      },
      {
        q: "This repository is slow to clone and CI checkouts take minutes. Diagnose and fix it.",
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
            task: "Configure CI checkout to be fast for a large monorepo where the job only needs `apps/web`.",
            description: "Checks shallow and sparse checkout. Ask for the actions/checkout config.",
            answer: "Use a shallow fetch and sparse-checkout limited to needed paths; note that tools needing history (affected detection, bisect) require more depth.",
            solution: `- uses: actions/checkout@v4
  with:
    fetch-depth: 1
    sparse-checkout: |
      apps/web
      packages/ui`,
          },
          {
            task: "Write a pre-commit check that blocks files larger than 5MB.",
            description: "Checks prevention automation. Ask for a script or tool.",
            answer: "Check staged file sizes and fail if any exceed the limit; in CI add the same check so --no-verify can't bypass it.",
            solution: `#!/bin/sh
git diff --cached --name-only --diff-filter=AM | while read -r f; do
  size=$(wc -c < "$f")
  if [ "$size" -gt 5242880 ]; then echo "Blocked: $f is larger than 5MB"; exit 1; fi
done`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: "Trunk-based development vs GitFlow — which policy do you set for the org and how do you enforce it?",
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
            task: "Teams merge with merge commits, squash and rebase inconsistently. Pick a policy and justify it.",
            description: "Checks merge policy decisions. Ask how they would enforce it.",
            answer: "E.g. squash-merge PRs with a conventional title for a linear, bisectable main where each commit is a reviewed, green unit; enforce via repository settings and a PR-title check. Weak answers leave it to preference. Strong answers configure repo settings and checks.",
          },
          {
            task: "A team keeps a 3-week-old feature branch with constant conflicts. Explain how you coach them out of it.",
            description: "Checks coaching on long-lived branches. Ask what metrics they'd watch.",
            answer: "Split the work into small mergeable slices behind a feature flag, merge to trunk daily, use branch-by-abstraction for refactors, and track branch age as a team metric. Weak answers just tell them to rebase more. Strong answers split work and use flags.",
          },
        ],
        ai: true,
      },
      {
        q: "You're merging two teams' repositories into a monorepo (or splitting one). How do you plan the migration and what conventions do you set?",
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
            task: "Write the commands to import repo B into a monorepo under packages/b preserving history.",
            description: "Checks history-preserving migration mechanics. Ask for exact steps.",
            answer: "Rewrite B's history into the subdirectory with filter-repo, then merge it into the monorepo with --allow-unrelated-histories.",
            solution: `git clone repo-b && cd repo-b
git filter-repo --to-subdirectory-filter packages/b
cd ../monorepo
git remote add b ../repo-b && git fetch b
git merge --allow-unrelated-histories b/main -m "Import repo-b into packages/b"`,
          },
          {
            task: "Draft the communication and cutover plan for the migration weekend.",
            description: "Checks change management. Ask for timeline and rollback.",
            answer: "Announce two weeks ahead with a guide, freeze merges at T-0, run a rehearsed migration script, verify CI/deploys, migrate open PRs with a helper script, set old repos read-only, and keep a rollback (unarchive old repos) until a go/no-go checkpoint.",
          },
        ],
      },
    ],
  },
};
