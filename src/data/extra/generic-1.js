export default {
  'Generic Questions': {
    'Browser storages': {
      junior: [
        {
          q: `What data types can localStorage keep? What happens when you save an object?`,
          short: `localStorage stores only strings; non-strings are converted with String(), so an object becomes "[object Object]".`,
          long: `Web Storage keys and values are always strings.\nsetItem calls String(value) on whatever you pass.\nAn object becomes "[object Object]", numbers become "42", booleans "true".\nUse JSON.stringify on write and JSON.parse on read.\nDates become ISO strings, and Maps/Sets serialize to {} unless converted.\nFor structured or binary data prefer IndexedDB, which uses structured clone.`,
          follow: `How do you save a Date and get a Date back?`,
          exercises: [
            {
              task: `What does this code print?`,
              description: `Checks string coercion in Web Storage. Run in the browser DevTools console.`,
              code: `localStorage.setItem('n', 5);\nlocalStorage.setItem('o', { a: 1 });\nconsole.log(typeof localStorage.getItem('n'), localStorage.getItem('o'));`,
              answer: `It logs "string" and "[object Object]". Every value is coerced to a string, so the number becomes "5" and the object loses all its data. Use JSON.stringify/JSON.parse to round-trip structured values.`,
            },
            {
              task: `Write two helpers: saveJSON and loadJSON with a fallback value.`,
              description: `Checks safe serialization with a fallback for missing or corrupt data. Run in the console and try a corrupted value.`,
              answer: `saveJSON stringifies before setItem. loadJSON reads the raw string, returns the fallback when it is null, and wraps JSON.parse in try/catch so corrupt data also returns the fallback instead of crashing the app.`,
              solution: `const saveJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));\nconst loadJSON = (k, fb) => {\n  const raw = localStorage.getItem(k);\n  if (raw === null) return fb;\n  try { return JSON.parse(raw); } catch { return fb; }\n};`,
            },
          ],
        },
        {
          q: `This cart counter shows 11 instead of 2. Why? How do you fix it?`,
          code: `const count = localStorage.getItem('count') || 0;\nlocalStorage.setItem('count', count + 1);`,
          short: `getItem returns a string, so "1" + 1 concatenates to "11"; convert with Number() before doing math.`,
          long: `The first run stores 0 + 1 = 1, which is saved as "1".\nThe second run reads "1" (a string) and "1" + 1 is "11".\nThe + operator concatenates when either operand is a string.\nParse the value explicitly with Number() or parseInt.\nAlso handle NaN when the stored value is corrupt.`,
          fix: `const count = Number(localStorage.getItem('count')) || 0;\nlocalStorage.setItem('count', String(count + 1));`,
          exercises: [
            {
              task: `Dark mode is always on. Fix this check.`,
              description: `Checks string truthiness. Run in the console after setItem('dark', false).`,
              code: `localStorage.setItem('dark', false);\nif (localStorage.getItem('dark')) enableDarkMode();`,
              answer: `The stored value is the string "false", which is truthy, so dark mode is always enabled. Compare explicitly: getItem('dark') === 'true', or store JSON and parse it.`,
            },
            {
              task: `Write an increment helper. It must work even if the stored value is broken.`,
              description: `Checks parsing and NaN handling. Set 'count' to 'abc' in the console, then call the helper.`,
              answer: `Read the value, convert with Number, and fall back to 0 when the result is NaN. Write the new value back as a string. This keeps the counter working even after a manual or buggy write.`,
              solution: `function inc(key) {\n  const n = Number(localStorage.getItem(key));\n  const next = (Number.isNaN(n) ? 0 : n) + 1;\n  localStorage.setItem(key, String(next));\n  return next;\n}`,
            },
          ],
        },
        {
          q: `How do you see and clear browser storage in DevTools?`,
          short: `In Chrome the Application panel (Firefox: Storage) lists localStorage, sessionStorage, IndexedDB, cookies and Cache Storage, and "Clear site data" wipes them.`,
          long: `Open DevTools and go to Application (Chrome/Edge) or Storage (Firefox).\nEach storage type is listed per origin; you can view, edit and delete entries.\nCookies show flags such as HttpOnly, Secure, SameSite and expiry.\nStorage > "Clear site data" removes everything for the origin, with checkboxes.\nThe usage chart shows how much quota is used.\nIncognito windows start with empty storage, which helps reproduce first-visit bugs.`,
          exercises: [
            {
              task: `Find where a site keeps its cookies and local storage values.`,
              description: `Checks DevTools navigation. Open any site you use, find its cookies and localStorage keys.`,
              answer: `Open Application > Storage, expand Local Storage and Cookies for the origin and inspect the keys. HttpOnly cookies are visible there but not from document.cookie. Note how many entries third-party scripts created.`,
            },
            {
              task: `How do you clear all storage from code, for testing?`,
              description: `Checks the APIs for clearing storage. Run in the console on a test page.`,
              answer: `localStorage.clear() and sessionStorage.clear() empty Web Storage; indexedDB.deleteDatabase(name) removes a database; caches.keys() plus caches.delete clears Cache Storage. Non-HttpOnly cookies can be expired via document.cookie. Servers can also send the Clear-Site-Data header.`,
            },
          ],
        },
      ],
      middle: [
        {
          q: `This save code can throw an error. When does it throw? How do you fix it?`,
          code: `function remember(user) {\n  localStorage.setItem('user', JSON.stringify(user));\n}`,
          short: `setItem can throw QuotaExceededError (and storage access can throw SecurityError when blocked), so wrap it in try/catch and degrade gracefully.`,
          long: `Browsers cap Web Storage at roughly 5 MB per origin.\nsetItem throws a DOMException named QuotaExceededError when full.\nAccessing window.localStorage can throw SecurityError when storage is blocked or in sandboxed iframes.\nA single unhandled throw can break login or checkout.\nWrap access in a helper that catches errors and falls back to memory.\nLog the failure so you notice quota problems in the field.`,
          fix: `function remember(user) {\n  try {\n    localStorage.setItem('user', JSON.stringify(user));\n    return true;\n  } catch (e) {\n    console.warn('storage unavailable', e.name);\n    return false;\n  }\n}`,
          exercises: [
            {
              task: `Write a storage wrapper. If localStorage fails, keep data in memory.`,
              description: `Checks resilience. Test by stubbing localStorage.setItem to throw in the console.`,
              answer: `Probe storage once by writing and removing a test key inside try/catch. If it works, delegate to localStorage; otherwise use a Map with the same get/set interface. Callers never need to know which backend is used.`,
              solution: `const mem = new Map();\nlet ok = false;\ntry { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); ok = true; } catch {}\nexport const store = {\n  get: (k) => ok ? localStorage.getItem(k) : mem.get(k) ?? null,\n  set: (k, v) => { try { if (ok) return localStorage.setItem(k, v); } catch {} mem.set(k, v); },\n};`,
            },
            {
              task: `How do you check free space before a big write?`,
              description: `Checks the StorageManager API. Run navigator.storage.estimate() in the console.`,
              answer: `navigator.storage.estimate() resolves to { usage, quota } for the origin across IndexedDB, Cache Storage and others. Compare usage plus the expected write size to quota. Web Storage has its own smaller per-origin cap, so estimate is mostly useful for IndexedDB and caches.`,
            },
          ],
        },
        {
          q: `What is the storage event? When does it fire?`,
          short: `It fires in other same-origin documents (tabs/iframes) when localStorage changes, not in the tab that made the change.`,
          long: `window 'storage' fires when another document with the same origin modifies localStorage.\nThe event carries key, oldValue, newValue, url and storageArea.\nclear() fires it with key === null.\nThe tab that wrote the value does not receive it.\nsessionStorage is per tab, so its events reach only same-tab iframes.\nFor richer cross-tab messaging use BroadcastChannel.`,
          follow: `How do you log out all tabs when the user logs out in one tab?`,
          exercises: [
            {
              task: `Log out all open tabs when one tab logs out.`,
              description: `Checks the storage event. Open two tabs of the same local page and log out in one.`,
              answer: `On logout write a key like 'logout' with Date.now() (the value must change to fire). Other tabs listen for 'storage' with that key and redirect to login. BroadcastChannel('auth').postMessage('logout') is a cleaner alternative.`,
              solution: `window.addEventListener('storage', (e) => {\n  if (e.key === 'logout') location.assign('/login');\n});\nfunction logout() { localStorage.setItem('logout', String(Date.now())); }`,
            },
            {
              task: `This listener never runs. Why?`,
              description: `Checks understanding of event scope. Run in a single tab.`,
              code: `addEventListener('storage', () => console.log('changed'));\nlocalStorage.setItem('x', '1');`,
              answer: `The storage event is not delivered to the document that made the change. It will log only when another tab of the same origin writes. To react locally, call your handler directly or dispatch a custom event.`,
            },
          ],
        },
        {
          q: `When do you use IndexedDB instead of localStorage?`,
          short: `Use IndexedDB for large, structured, binary or queryable data and when you need async, non-blocking access, including from workers.`,
          long: `localStorage is synchronous, string-only and limited to about 5 MB.\nIndexedDB is asynchronous and stores structured-clone values: objects, Blobs, Files, typed arrays.\nIt supports indexes, key ranges, cursors and transactions.\nQuota is a share of disk (often gigabytes), managed by the browser.\nIt is available in Web Workers and Service Workers, unlike localStorage.\nThe raw API is verbose; small wrappers like idb make it pleasant.`,
          exercises: [
            {
              task: `Save and read one record with the idb library.`,
              description: `Checks basic IndexedDB usage. Run in a Vite project with idb installed.`,
              answer: `openDB creates the database and object stores in the upgrade callback. put writes the record and get reads by key, both returning promises. The data keeps its types, so Dates and Blobs come back intact.`,
              solution: `import { openDB } from 'idb';\nconst db = await openDB('app', 1, { upgrade(db) { db.createObjectStore('notes', { keyPath: 'id' }); } });\nawait db.put('notes', { id: 1, text: 'hi', at: new Date() });\nconsole.log(await db.get('notes', 1));`,
            },
            {
              task: `Why is localStorage slow with big data?`,
              description: `Checks understanding of sync I/O. Reason about the main thread; optionally profile a 4 MB setItem.`,
              answer: `Web Storage calls are synchronous and run on the main thread, and browsers may load the whole origin's storage into memory. Writing megabytes of JSON plus JSON.stringify blocks rendering and input. IndexedDB work is asynchronous and can move to a worker.`,
            },
          ],
        },
      ],
      senior: [
        {
          q: `This IndexedDB code fails with "transaction inactive". Why? How do you fix it?`,
          code: `const tx = db.transaction('orders', 'readwrite');\nconst store = tx.objectStore('orders');\nfor (const id of ids) {\n  const res = await fetch('/api/orders/' + id);\n  await store.put(await res.json());\n}`,
          short: `IndexedDB transactions auto-commit when no requests are pending at the end of a task; awaiting fetch lets it close, so fetch first and then write in one transaction.`,
          long: `A transaction stays active only while requests are queued against it.\nAwaiting a non-IDB promise (fetch) yields to the event loop with nothing pending.\nThe transaction commits, and the next put throws TransactionInactiveError.\nFetch all data first (in parallel), then open a short transaction and write.\nAwait tx.done (idb) to know the batch committed atomically.\nShort transactions also reduce lock contention between tabs.`,
          fix: `const items = await Promise.all(ids.map((id) => fetch('/api/orders/' + id).then((r) => r.json())));\nconst tx = db.transaction('orders', 'readwrite');\nawait Promise.all([...items.map((o) => tx.store.put(o)), tx.done]);`,
          ai: true,
          exercises: [
            {
              task: `How do you make a group of writes all succeed or all fail?`,
              description: `Checks transaction semantics. Throw inside the batch in a test page and inspect the store.`,
              answer: `All puts in one transaction commit or none do. If any request fails or you call tx.abort(), every change is rolled back. Await tx.done and catch errors to report the failed batch.`,
            },
            {
              task: `A database upgrade is blocked by another open tab. What do you do?`,
              description: `Checks multi-tab upgrades. Open the app in two tabs, bump the DB version in one.`,
              answer: `The new tab's open fires 'blocked' while the old tab holds a connection. Old tabs should listen for 'versionchange', close the db and prompt reload. With idb, use the blocking callback to close and the blocked callback to show a message.`,
            },
          ],
        },
        {
          q: `When can the browser delete your stored data? How do you protect important offline data?`,
          short: `Storage is best-effort by default and can be evicted under pressure; navigator.storage.persist() requests persistent storage, and Safari also evicts script-written data after 7 days without user interaction.`,
          long: `Each origin gets a quota derived from disk size; data is "best-effort" unless persisted.\nUnder storage pressure browsers evict whole origins, least recently used first.\nnavigator.storage.persist() asks to mark the origin persistent; Chrome grants it heuristically, Firefox may prompt.\nSafari deletes script-writable storage after 7 days without user interaction, unless the site is an installed home-screen web app.\nEviction removes the origin's IndexedDB, Cache Storage and others together.\nTreat local data as a cache that can vanish, and keep a server copy of anything important.`,
          exercises: [
            {
              task: `Ask the browser for persistent storage and show the result.`,
              description: `Checks the StorageManager API. Run in the console on an https or localhost page.`,
              answer: `Call navigator.storage.persisted() to see the current state, then navigator.storage.persist() which resolves to true or false. Show the result in settings and fall back to sync-to-server messaging when it is false.`,
              solution: `if (!(await navigator.storage.persisted())) {\n  const granted = await navigator.storage.persist();\n  console.log('persistent:', granted);\n}`,
            },
            {
              task: `The local data is suddenly gone. How should the app recover?`,
              description: `Checks resilience design. Clear site data mid-session and observe the app.`,
              answer: `On startup verify a schema/version marker; if missing, rebuild from the server. Queue unsynced writes and sync them early instead of holding them long. Tell the user when offline edits could not be recovered rather than failing silently.`,
            },
          ],
        },
        {
          q: `What is storage partitioning? How does it change iframes and third-party cookies?`,
          short: `Modern browsers key third-party storage by the top-level site, so an iframe from a.com embedded on b.com and on c.com gets separate storage.`,
          long: `Partitioning keys storage by (top-level site, embedded origin) instead of origin alone.\nFirefox, Safari and Chrome partition localStorage, IndexedDB, Cache Storage and BroadcastChannel in third-party contexts.\nThird-party cookies are blocked by default in Safari and Firefox; Chrome still allows them by default with user controls.\nCHIPS (the Partitioned cookie attribute) gives an opt-in cookie per top-level site.\nThe Storage Access API lets an iframe request unpartitioned access after a user gesture.\nEmbedded widgets (chat, SSO, payments) must not assume shared state across sites.`,
          exercises: [
            {
              task: `Set a partitioned cookie for an embedded widget.`,
              description: `Checks CHIPS. Inspect the cookie in DevTools Application > Cookies.`,
              answer: `Send Set-Cookie with Secure, SameSite=None and Partitioned, e.g. "Set-Cookie: wid=1; Secure; SameSite=None; Path=/; Partitioned". The cookie is stored per top-level site, so it works inside each embedder but cannot track across them.`,
            },
            {
              task: `How does an iframe ask for access to its own cookies?`,
              description: `Checks the Storage Access API. Run inside a cross-site iframe on a button click.`,
              answer: `Check document.hasStorageAccess(), then call document.requestStorageAccess() from a user gesture. If granted, the iframe can use its unpartitioned cookies. Browsers may require prior first-party interaction, so provide a fallback such as a popup login.`,
            },
          ],
        },
      ],
      techlead: [
        {
          q: `Teams call localStorage directly all over the app. How do you design one shared storage layer?`,
          short: `Provide one typed, namespaced, versioned storage module with error handling, data classification and cleanup on logout, and lint against direct usage.`,
          long: `Direct calls scatter keys, collide between teams and leak data after logout.\nA central module gives typed keys, a namespace/prefix and schema versions with migrations.\nIt classifies data (public, user-scoped, sensitive) and refuses sensitive data in Web Storage.\nIt handles quota and availability errors and offers in-memory fallback.\nLogout calls one clear-user-data function covering all backends.\nAn ESLint no-restricted-globals rule enforces usage; exceptions are reviewed.`,
          ai: true,
          exercises: [
            {
              task: `Write a lint rule that blocks direct use of localStorage.`,
              description: `Checks enforcement. Add to eslint config and run lint.`,
              answer: `Use no-restricted-globals and no-restricted-properties for localStorage and sessionStorage with a message pointing to the storage module. Disable the rule only inside that module via an override for its path.`,
              solution: `rules: {\n  'no-restricted-globals': ['error', { name: 'localStorage', message: 'Use @/lib/storage' }, { name: 'sessionStorage', message: 'Use @/lib/storage' }],\n  'no-restricted-properties': ['error', { object: 'window', property: 'localStorage' }],\n}`,
            },
            {
              task: `The app has forty storage keys in many places. Plan the move to the new layer.`,
              description: `Checks rollout thinking. Write the plan as bullet points.`,
              answer: `Inventory keys with grep and telemetry, assign owners and classifications. Ship the module with a read-old/write-new migration for each key, then remove old keys after a release window. Track remaining direct usages in the lint baseline until it reaches zero.`,
            },
          ],
        },
        {
          q: `Users share one computer. This logout leaves user data behind. How do you fix it?`,
          code: `function logout() {\n  localStorage.removeItem('token');\n  location.href = '/login';\n}`,
          short: `Clear every storage the app uses (Web Storage, IndexedDB, Cache Storage, in-memory caches), end the server session, and send Clear-Site-Data from the logout endpoint.`,
          long: `Removing one key leaves profile data, query caches, IndexedDB and SW caches behind.\nThe next user on a shared device can read them in DevTools.\nCall the server to revoke the session and clear HttpOnly cookies.\nThe server can respond with Clear-Site-Data: "cache", "cookies", "storage".\nAlso clear in-memory state (query clients, stores) and notify other tabs.\nAdd an E2E test that asserts storage is empty after logout.`,
          fix: `async function logout() {\n  await fetch('/auth/logout', { method: 'POST', credentials: 'include' }); // responds with Clear-Site-Data\n  queryClient.clear();\n  localStorage.clear();\n  sessionStorage.clear();\n  for (const name of await caches.keys()) await caches.delete(name);\n  for (const { name } of await indexedDB.databases()) indexedDB.deleteDatabase(name);\n  new BroadcastChannel('auth').postMessage('logout');\n  location.replace('/login');\n}`,
          exercises: [
            {
              task: `Which header can the server send on logout to clear browser data?`,
              description: `Checks Clear-Site-Data. Set it in an Express route and inspect storage after.`,
              answer: `Respond with Clear-Site-Data: "cache", "cookies", "storage" on an https response. Browsers then clear those for the origin. Use it as defense in depth, not the only mechanism.`,
            },
            {
              task: `Write a test that proves logout leaves no data.`,
              description: `Checks verification. Write it in Playwright pseudocode.`,
              answer: `Log in, browse to populate caches, log out, then evaluate localStorage.length, sessionStorage.length, indexedDB.databases() and caches.keys() and expect all empty. Also assert context.cookies() has no session cookie and that pressing Back does not show user data.`,
            },
          ],
        },
        {
          q: `Product wants to save form drafts offline for a long application. What rules do you set?`,
          short: `Store drafts in IndexedDB scoped per user, encrypt or minimize sensitive fields, sync to the server early, expire old drafts, and wipe on logout.`,
          long: `Clarify what fields are in the draft and their sensitivity (PII, documents).\nPrefer server-side autosave when online; local storage is only a buffer.\nUse IndexedDB keyed by userId and formId with timestamps and a schema version.\nExclude highly sensitive fields or encrypt with a key not kept beside the data.\nDefine a TTL (e.g. 7 days), conflict resolution with the server, and logout wipe.\nDocument it for privacy review and measure draft loss in telemetry.`,
          ai: true,
          exercises: [
            {
              task: `The same draft is edited on two devices. What happens?`,
              description: `Checks sync design. Describe the conflict policy.`,
              answer: `Store updatedAt and a server version on each draft. On sync, if the server version moved, show both versions or merge field by field. Never silently overwrite the newer server copy.`,
            },
            {
              task: `List the safety rules for the privacy review.`,
              description: `Checks policy thinking. Write 4-5 bullets.`,
              answer: `Data minimization of stored fields, per-user scoping and wipe on logout, TTL-based cleanup, no tokens in the same store, and documented retention. Include a kill switch flag to disable local drafts if an issue is found.`,
            },
          ],
        },
      ],
    },
    'Programming Principles': {
      junior: [
        {
          q: `What is the Single Responsibility Principle? Explain it in simple words.`,
          short: `A module should have one reason to change, meaning it serves one actor or concern.`,
          long: `SRP is the S in SOLID.\nA function that formats, validates and saves data changes for three reasons.\nSplitting them makes each piece easier to test and reuse.\nIt is about reasons to change, not about having only one method.\nOver-splitting into tiny files is also a smell.\nIn React, separating data fetching from rendering is a common SRP move.`,
          exercises: [
            {
              task: `List the jobs this function does.`,
              description: `Checks identifying concerns. Read the code and list them.`,
              code: `function submit(form) {\n  if (!form.email.includes('@')) return alert('bad');\n  const body = JSON.stringify(form);\n  fetch('/api/u', { method: 'POST', body });\n  document.querySelector('#msg').textContent = 'Saved';\n}`,
              answer: `Validation, serialization/network, and UI feedback are mixed. Split into validate(form), saveUser(form) and a UI layer that shows messages. Each part can then be tested on its own.`,
            },
            {
              task: `Split it into three functions.`,
              description: `Checks applying SRP. Write the code and run it in Node with a fake fetch.`,
              answer: `validate returns errors, saveUser returns the fetch promise, and submit orchestrates and updates the UI. The UI layer is now the only place touching the DOM.`,
              solution: `const validate = (f) => (f.email.includes('@') ? [] : ['email']);\nconst saveUser = (f) => fetch('/api/u', { method: 'POST', body: JSON.stringify(f) });\nasync function submit(f, show) {\n  if (validate(f).length) return show('Invalid email');\n  await saveUser(f);\n  show('Saved');\n}`,
            },
          ],
        },
        {
          q: `This code repeats the same rule three times. How do you clean it up?`,
          code: `const priceA = itemA.price * 1.2 + (itemA.price > 100 ? 0 : 5);\nconst priceB = itemB.price * 1.2 + (itemB.price > 100 ? 0 : 5);\nconst priceC = itemC.price * 1.2 + (itemC.price > 100 ? 0 : 5);`,
          short: `Extract the repeated rule into a named function so the tax and shipping logic lives in one place.`,
          long: `The same business rule is copied three times.\nChanging the tax rate means three edits and a chance to miss one.\nExtract a function with a descriptive name.\nName the magic numbers as constants.\nThis is DRY applied to knowledge, not just text.`,
          fix: `const TAX = 1.2, FREE_SHIPPING_FROM = 100, SHIPPING = 5;\nconst finalPrice = (p) => p * TAX + (p > FREE_SHIPPING_FROM ? 0 : SHIPPING);\nconst [priceA, priceB, priceC] = [itemA, itemB, itemC].map((i) => finalPrice(i.price));`,
          exercises: [
            {
              task: `Give names to the numbers in this code.`,
              description: `Checks readability. Rewrite the snippet with constants.`,
              code: `if (password.length < 8 || attempts > 5) lock();`,
              answer: `Introduce MIN_PASSWORD_LENGTH = 8 and MAX_ATTEMPTS = 5. The condition then reads like the rule. Changes happen in one place.`,
            },
            {
              task: `These two functions look alike. Should you merge them?`,
              description: `Checks judgment. Explain in two sentences.`,
              code: `const userLabel = (u) => u.firstName + ' ' + u.lastName;\nconst cityLabel = (c) => c.name + ' ' + c.country;`,
              answer: `No. They look similar but represent different knowledge and will change for different reasons. Merging them into a generic join helper adds coupling without value.`,
            },
          ],
        },
        {
          q: `What does "fail fast" mean in code?`,
          short: `Detect invalid input or state as early as possible and stop with a clear error instead of continuing with bad data.`,
          long: `Check preconditions at the start of a function.\nThrow or return early with a meaningful message.\nThis prevents errors surfacing far from their cause.\nGuard clauses also reduce nesting.\nIn UI, validate forms before submitting.\nDo not crash the whole app for user errors; show feedback instead.`,
          exercises: [
            {
              task: `Rewrite this with early returns.`,
              description: `Checks guard clauses. Run in Node.`,
              code: `function pay(order) {\n  if (order) {\n    if (order.total > 0) {\n      return charge(order);\n    }\n  }\n}`,
              answer: `Throw early for the invalid cases, then do the main work unindented. This makes failure explicit instead of silently returning undefined.`,
              solution: `function pay(order) {\n  if (!order) throw new Error('order required');\n  if (order.total <= 0) throw new Error('total must be positive');\n  return charge(order);\n}`,
            },
            {
              task: `What bug can happen here? How does fail fast help?`,
              description: `Checks reasoning. Think about where NaN shows up.`,
              code: `const total = items.reduce((s, i) => s + i.price, 0);`,
              answer: `If one item has no price, total becomes NaN and the UI shows "NaN" pages later. Validating items when they arrive from the API catches it at the source. The error then points to the bad data.`,
            },
          ],
        },
      ],
      middle: [
        {
          q: `What is the Open/Closed Principle? This switch grows with every new format. Fix it.`,
          code: `function exportData(data, type) {\n  switch (type) {\n    case 'csv': return toCsv(data);\n    case 'json': return JSON.stringify(data);\n    case 'xml': return toXml(data);\n  }\n}`,
          short: `Code should be open for extension but closed for modification; use a registry or strategy map so new formats are added without editing the core.`,
          long: `Each new format requires editing and retesting exportData.\nA registry maps type to exporter function.\nAdding a format is registering a new entry.\nUnknown types fail fast with a clear error.\nOCP is worth it where variation is real and frequent; do not abstract a single case.`,
          fix: `const exporters = { csv: toCsv, json: (d) => JSON.stringify(d), xml: toXml };\nexport const registerExporter = (type, fn) => { exporters[type] = fn; };\nexport function exportData(data, type) {\n  const fn = exporters[type];\n  if (!fn) throw new Error('Unknown export type: ' + type);\n  return fn(data);\n}`,
          exercises: [
            {
              task: `Add a YAML format without changing exportData.`,
              description: `Checks extension. Call registerExporter in a separate module.`,
              answer: `registerExporter('yaml', toYaml) in its own file extends the system. exportData stays untouched and its tests keep passing. Only the new exporter needs new tests.`,
            },
            {
              task: `When is this change too much?`,
              description: `Checks judgment. Answer in 2-3 sentences.`,
              answer: `If there are two formats that rarely change, a simple switch is clearer. Introduce the registry when variation grows or plugins come from other teams. YAGNI balances OCP.`,
            },
          ],
        },
        {
          q: `What is Dependency Inversion? Why does it help testing?`,
          short: `High-level logic should depend on abstractions, not concrete details; injecting dependencies lets tests pass fakes.`,
          long: `Without DI, business code imports fetch, Date or localStorage directly.\nTests then need global mocks and become brittle.\nPass dependencies as parameters, constructor args or context.\nThe abstraction is often just a function signature in JS/TS.\nA composition root wires real implementations at app start.\nDo not over-engineer with DI containers in small frontends.`,
          exercises: [
            {
              task: `Make this function easy to test.`,
              description: `Checks injecting time. Write a unit test with a fixed date.`,
              code: `export const isExpired = (token) => token.exp * 1000 < Date.now();`,
              answer: `Add a now parameter with a default: isExpired(token, now = Date.now()). Tests pass a fixed value without mocking globals. Production calls stay unchanged.`,
              solution: `export const isExpired = (token, now = Date.now()) => token.exp * 1000 < now;\n// test\nexpect(isExpired({ exp: 10 }, 20_000)).toBe(true);`,
            },
            {
              task: `Pass an API client into a service from outside.`,
              description: `Checks DI via factory. Write createUserService(api).`,
              answer: `createUserService takes an object with get/post. Tests pass a fake object returning canned data. The app passes the real HTTP client once at startup.`,
            },
          ],
        },
        {
          q: `What is the difference between coupling and cohesion?`,
          short: `Cohesion is how related the things inside a module are; coupling is how much modules depend on each other. Aim for high cohesion and low coupling.`,
          long: `High cohesion: a feature folder holds its UI, hooks and API calls together.\nLow coupling: modules interact through small, stable interfaces.\nTight coupling shows up as changes rippling across many files.\nShared mutable globals and deep imports into other features increase coupling.\nA public API per module reduces it.\nTools like dependency-cruiser can visualize and enforce boundaries.`,
          exercises: [
            {
              task: `What is wrong with this import?`,
              description: `Checks recognizing deep imports. Read and explain.`,
              code: `import { formatRow } from '../../orders/components/table/utils/formatRow';`,
              answer: `This reaches into another feature's internals, so refactoring orders breaks this file. Expose formatRow via the orders feature's public index, or move it to a shared module if it is generic.`,
            },
            {
              task: `Write a lint rule that blocks such imports.`,
              description: `Checks tooling. Write an ESLint no-restricted-imports pattern.`,
              answer: `Use no-restricted-imports with patterns like 'features/*/*' so only a feature's index can be imported. Violations fail lint, keeping coupling visible.`,
            },
          ],
        },
      ],
      senior: [
        {
          q: `This Square class breaks the Liskov principle. Why? How do you fix it?`,
          code: `class Rectangle { setWidth(w) { this.w = w; } setHeight(h) { this.h = h; } area() { return this.w * this.h; } }\nclass Square extends Rectangle {\n  setWidth(w) { this.w = this.h = w; }\n  setHeight(h) { this.w = this.h = h; }\n}`,
          short: `Square changes Rectangle's behavioral contract (width and height independent), so code written for Rectangle breaks; model them separately or make shapes immutable.`,
          long: `LSP: subtypes must be usable anywhere the base type is expected.\nA function that sets width 5 and height 4 expects area 20 but gets 16 for Square.\nThe is-a relationship in geometry is not a behavioral is-a.\nPrefer a Shape interface with area() and separate immutable classes.\nIn TS, similar issues appear when overrides throw "not supported".`,
          fix: `class Rectangle { constructor(w, h) { this.w = w; this.h = h; } area() { return this.w * this.h; } }\nclass Square { constructor(s) { this.s = s; } area() { return this.s * this.s; } }\n// both satisfy { area(): number }`,
          exercises: [
            {
              task: `Write a test that shows the problem.`,
              description: `Checks behavioral contracts. Run with Vitest.`,
              answer: `Write a helper that takes a Rectangle, sets width 5 and height 4 and expects area 20. Run it with both classes; Square returns 16. Shared contract tests like this catch LSP breaks.`,
            },
            {
              task: `Give an example of this problem in a UI component.`,
              description: `Checks applying LSP to frontend. Explain in 2-3 sentences.`,
              answer: `A ReadOnlyInput that extends Input but throws when onChange is called breaks the contract. Callers expecting an Input crash. Use composition or a separate prop interface instead.`,
            },
          ],
        },
        {
          q: `Sometimes two principles conflict, like DRY and loose coupling. How do you decide?`,
          short: `Shared code between independent modules couples them; prefer duplication across bounded contexts and DRY within one, deciding by who changes the code and why.`,
          long: `DRY says one source of truth for each piece of knowledge.\nSharing a helper across teams means one team's change breaks others.\nIf two copies change for different reasons, they are not the same knowledge.\nRule of three: abstract after the third real repetition.\nAcross packages, a little duplication beats a shared-library release train.\nDocument the decision so it is not "fixed" later.`,
          ai: true,
          exercises: [
            {
              task: `Two features share one address check. One feature now needs PO boxes. What do you do?`,
              description: `Checks trade-off reasoning. Decide and explain.`,
              answer: `If the rules differ by business context, split them and accept duplication. Keep shared low-level pieces (postal code rules per country) and let each feature compose them. Avoid flags like allowPoBox that grow without bound.`,
            },
            {
              task: `How do you remove a wrong abstraction?`,
              description: `Checks refactoring strategy. Outline the steps.`,
              answer: `Inline the abstraction back into each caller, delete parameters that only one caller uses, and let each copy simplify. Then look for genuinely common parts and re-extract only those. Tests keep behavior stable.`,
            },
          ],
        },
        {
          q: `This function reads and changes state at the same time. Apply Command-Query Separation.`,
          code: `function getNextId() {\n  counter += 1;\n  return counter;\n}\nif (getNextId() > 10) reset();`,
          short: `A function should either change state (command) or return data (query), not both; mixed ones make reads have surprising side effects.`,
          long: `getNextId looks like a query but mutates state.\nCalling it in a condition or a log silently advances the counter.\nSplit into currentId() and allocateId() or similar.\nSome exceptions are idiomatic (stack.pop, iterators), but name them clearly.\nIn React, side-effectful getters inside render cause bugs under StrictMode double rendering.`,
          fix: `const currentId = () => counter;\nfunction allocateId() { counter += 1; }\nif (currentId() >= 10) reset();\nallocateId();`,
          exercises: [
            {
              task: `What is wrong with this selector?`,
              description: `Checks side effects in queries. Reason about React rendering.`,
              code: `const selectUser = (s) => { analytics.track('read'); return s.user; };`,
              answer: `A selector should be a pure query. Tracking inside it fires on every render or subscription check, and twice in StrictMode development. Move tracking to an event handler or effect.`,
            },
            {
              task: `Name a case where mixing is fine.`,
              description: `Checks nuance. Answer briefly.`,
              answer: `Array.prototype.pop or an atomic compare-and-set return a value and mutate, because splitting them would cause race conditions or awkward APIs. The name makes the mutation obvious.`,
            },
          ],
        },
      ],
      techlead: [
        {
          q: `How do you turn coding principles into automatic checks in CI?`,
          short: `Encode the important ones as automated checks (lint rules, dependency constraints, type rules, size budgets) and keep the rest as documented guidelines with examples.`,
          long: `Principles that live only in a wiki erode.\nBoundaries: dependency-cruiser or eslint-plugin-boundaries to prevent feature cross-imports.\nComplexity: lint rules for max depth or cognitive complexity as warnings.\nAPIs: TypeScript strict mode and reviewed exported types.\nAdopt with a baseline so existing violations do not block, and ratchet down.\nReview rules quarterly; delete ones that cause friction without value.`,
          ai: true,
          exercises: [
            {
              task: `Write a rule so features cannot import each other.`,
              description: `Checks tooling. Write a dependency-cruiser rule.`,
              answer: `Add a forbidden rule with from path "^src/features/([^/]+)/" and to path "^src/features/(?!$1)" so a feature cannot import another. Allow shared code via src/shared. Run depcruise in CI.`,
            },
            {
              task: `The code has many old violations. How do you add the rule without blocking work?`,
              description: `Checks adoption strategy. Outline in bullets.`,
              answer: `Record current violations in a baseline file, fail CI only for new ones, and track the count on a dashboard. Teams fix violations when touching files. Remove the baseline when it hits zero.`,
            },
          ],
        },
        {
          q: `Every team edits this shared helper. What do you change in the code and in the process?`,
          code: `export function formatValue(v, type, opts = {}) {\n  if (type === 'money') return (opts.cents ? v / 100 : v).toFixed(opts.noDecimals ? 0 : 2);\n  if (type === 'date') return opts.us ? v.toLocaleDateString('en-US') : v.toISOString();\n  if (type === 'pct' && opts.legacy) return v + '%';\n  // 30 more branches...\n}`,
          short: `Split the god function into focused, owned formatters built on Intl, deprecate flags, and assign ownership so changes do not ripple across teams.`,
          long: `Many flags mean many hidden callers and combinatorial behavior.\nSplit into formatMoney, formatDate, formatPercent based on Intl.NumberFormat/DateTimeFormat.\nAdd CODEOWNERS for the shared package.\nKeep the old function as a deprecated facade delegating to new ones.\nAdd a codemod to migrate callers, then delete the facade.\nRequire tests and a changelog for shared changes.`,
          fix: `export const formatMoney = (cents, currency = 'USD', locale) =>\n  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100);\nexport const formatPercent = (ratio, locale) =>\n  new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(ratio);\n/** @deprecated use formatMoney/formatPercent */\nexport function formatValue(v, type, opts) { /* delegates */ }`,
          exercises: [
            {
              task: `Plan how to retire the old function.`,
              description: `Checks change management. Write steps with timelines.`,
              answer: `Mark it deprecated with JSDoc so IDEs strike it through, add a lint warning, provide a codemod, and set a removal date. Track remaining call sites weekly and remove when zero.`,
            },
            {
              task: `Why is Intl better than custom code here?`,
              description: `Checks platform knowledge. Answer in 2-3 sentences.`,
              answer: `Intl handles locale-specific separators, currency symbols and rounding correctly. Custom toFixed code breaks for many locales and currencies like JPY with zero decimals. It also reduces bundle code.`,
            },
          ],
        },
        {
          q: `A senior developer adds many layers of abstraction to a new product. He says it is for SOLID. What do you do?`,
          short: `Tie principles to cost of change: keep the MVP simple, abstract only at known variation points, and agree on triggers for refactoring later.`,
          long: `Principles reduce the cost of future change, but abstraction has an upfront cost.\nIn an MVP the requirements are uncertain, so speculative abstraction is often wrong.\nAsk which variation the abstraction supports and whether it is real today.\nAgree on refactor triggers (third use, second implementation).\nPair to show a simpler version and compare readability.\nRespect the intent; channel it into tests and clear module boundaries instead.`,
          ai: true,
          exercises: [
            {
              task: `Write a polite review comment for this change.`,
              description: `Checks communication. Draft a constructive PR comment.`,
              answer: `Acknowledge the goal, ask which upcoming requirement the interface supports, and propose inlining until a second implementation exists. Offer to note the extension point in an ADR. Keep tone collaborative.`,
            },
            {
              task: `Write three or four simple team rules about abstraction.`,
              description: `Checks lightweight policy. List the rules.`,
              answer: `Prefer concrete code until a second use case; abstractions need a named consumer; boundaries between features are mandatory, internal abstractions are optional; revisit at milestones. These keep speed without chaos.`,
            },
          ],
        },
      ],
    },
    'Functional programming': {
      junior: [
        {
          q: `What is immutability? Why does it matter in frontend code?`,
          short: `Immutability means not changing existing data but creating new copies; it makes changes detectable by reference and avoids surprising shared-state bugs.`,
          long: `React and many state libraries detect changes with reference equality.\nMutating an array in place keeps the same reference, so UI may not update.\nUse spread, map, filter, or toSorted/toSpliced/with (ES2023) for copies.\nconst only prevents reassignment, not mutation.\nstructuredClone makes deep copies when needed.\nObject.freeze makes objects shallowly read-only.`,
          exercises: [
            {
              task: `What does this code print?`,
              description: `Checks const vs immutability. Run in Node.`,
              code: `const a = [1, 2];\nconst b = a;\nb.push(3);\nconsole.log(a);`,
              answer: `It logs [1, 2, 3]. a and b reference the same array, and push mutates it. const only prevents reassigning a.`,
            },
            {
              task: `Add an item to a list without changing the old list.`,
              description: `Checks spread. Write addTodo(todos, todo).`,
              answer: `Return a new array with spread: [...todos, todo]. The original array stays unchanged and React sees a new reference.`,
              solution: `const addTodo = (todos, todo) => [...todos, todo];`,
            },
          ],
        },
        {
          q: `Why does sorting this list also change the original list?`,
          code: `const sorted = users.sort((a, b) => a.age - b.age);`,
          short: `sort mutates the array in place and returns the same reference; use toSorted() or copy first.`,
          long: `Array.prototype.sort sorts in place.\nsorted and users are the same array.\nIn React this mutates props or state, causing subtle bugs.\nES2023 added toSorted, toReversed, toSpliced and with, which return copies.\nThey are supported in all current browsers.\nFor older targets use [...users].sort().`,
          fix: `const sorted = users.toSorted((a, b) => a.age - b.age);`,
          exercises: [
            {
              task: `Name other array methods that change the array. What can you use instead?`,
              description: `Checks API knowledge. Name them and their non-mutating alternatives.`,
              answer: `push, pop, shift, unshift, splice, sort, reverse, fill and copyWithin mutate. Alternatives: spread/concat, slice, toSpliced, toSorted, toReversed and with(index, value).`,
            },
            {
              task: `Toggle one item in a list without changing the old list.`,
              description: `Checks map-based update. Write toggle(todos, id).`,
              answer: `Map over todos and return a new object for the matching id with done flipped; other items keep their references. That lets memoized children skip re-rendering.`,
              solution: `const toggle = (todos, id) => todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));`,
            },
          ],
        },
        {
          q: `What is a side effect? Give some frontend examples.`,
          short: `A side effect is any observable interaction beyond returning a value: network calls, DOM changes, logging, storage, timers or mutating outside variables.`,
          long: `Pure functions return the same output for the same input with no side effects.\nSide effects are necessary; the goal is to isolate them.\nExamples: fetch, document.title changes, localStorage, console.log, Math.random, Date.now.\nKeep business logic pure and push effects to edges (event handlers, effects, services).\nPure code is easy to test without mocks.`,
          exercises: [
            {
              task: `Which of these functions are pure?`,
              description: `Checks recognition. Mark each.`,
              code: `const a = (x) => x * 2;\nconst b = (x) => { console.log(x); return x; };\nconst c = () => Date.now();\nconst d = (arr) => arr.push(1);`,
              answer: `a is pure. b logs (side effect), c depends on time (non-deterministic), and d mutates its input. Only a is safe to memoize and test trivially.`,
            },
            {
              task: `Make this function pure.`,
              description: `Checks extracting effects. Refactor so the hour is passed in.`,
              code: `const greet = (name) => (new Date().getHours() < 12 ? 'Good morning ' : 'Hello ') + name;`,
              answer: `Pass the hour as a parameter: greet(name, hour). The caller provides new Date().getHours(). Tests can now check both branches deterministically.`,
            },
          ],
        },
      ],
      middle: [
        {
          q: `These reduce calls have bugs. One crashes on an empty array. Find and fix them.`,
          code: `const totals = {};\nconst max = prices.reduce((a, b) => Math.max(a, b));\norders.reduce((acc, o) => { totals[o.user] = (totals[o.user] || 0) + o.sum; }, {});`,
          short: `reduce without an initial value throws on empty arrays, and the second reduce never returns the accumulator; always pass an initial value and return acc.`,
          long: `[].reduce(fn) throws TypeError: Reduce of empty array with no initial value.\nHandle the empty case explicitly for max.\nThe callback must return the accumulator each step.\nWriting into an outer object defeats the point of reduce.\nObject.groupBy (ES2024) or Map.groupBy simplify grouping.`,
          fix: `const max = prices.length ? Math.max(...prices) : null;\nconst totals = orders.reduce((acc, o) => {\n  acc[o.user] = (acc[o.user] ?? 0) + o.sum;\n  return acc;\n}, {});`,
          exercises: [
            {
              task: `Group orders by user with Object.groupBy.`,
              description: `Checks modern APIs. Run in Node 21+ or a current browser.`,
              answer: `Object.groupBy(orders, (o) => o.user) returns a null-prototype object mapping user to array of orders. Map.groupBy returns a Map, useful for non-string keys.`,
            },
            {
              task: `Why is this code slow for big lists?`,
              description: `Checks performance awareness. Analyze the cost.`,
              code: `items.reduce((acc, i) => ({ ...acc, [i.id]: i }), {});`,
              answer: `Each step copies the whole accumulator, so it is O(n squared). For large lists mutate the local accumulator (it is not shared), or use Object.fromEntries(items.map(i => [i.id, i])).`,
            },
          ],
        },
        {
          q: `What is memoization? When is it safe to use?`,
          short: `Memoization caches a function's result by its arguments; it is only safe for pure functions with cheap-to-compare inputs.`,
          long: `If output depends only on input, repeated calls can reuse a cached result.\nImpure functions (time, network, mutation) give wrong results when memoized.\nKey by primitive arguments or by reference identity (WeakMap for objects).\nUnbounded caches leak memory; use LRU or limit size.\nReact's useMemo and memo are reference-based memoization.\nMeasure: memoizing cheap work adds overhead.`,
          exercises: [
            {
              task: `Write a memoize function for one argument.`,
              description: `Checks closures and Map. Test with a slow fibonacci in Node.`,
              answer: `Use a Map in a closure, return the cached value if present, otherwise compute and store. This works for primitives; objects are keyed by reference.`,
              solution: `const memoize = (fn) => {\n  const cache = new Map();\n  return (x) => {\n    if (!cache.has(x)) cache.set(x, fn(x));\n    return cache.get(x);\n  };\n};`,
            },
            {
              task: `Why is this memoization wrong?`,
              description: `Checks purity requirement. Reason about the output.`,
              code: `const getPrice = memoize((id) => prices[id] * rate);`,
              answer: `It reads mutable outer variables prices and rate. When rate changes the cache still returns old values. Pass rate as an argument or invalidate the cache.`,
            },
          ],
        },
        {
          q: `How do you handle errors in a functional way, without throwing?`,
          short: `Return a result value like { ok: true, value } | { ok: false, error } so callers must handle failure explicitly and types document it.`,
          long: `Exceptions are invisible in function signatures.\nA Result/Either type makes failure part of the return value.\nIn TS a discriminated union works without libraries.\nCompose with helpers like map and andThen, or early returns.\nKeep throwing for truly unexpected bugs.\nAt boundaries (fetch, JSON.parse) convert exceptions to Results.`,
          exercises: [
            {
              task: `Wrap JSON.parse so it returns a result object.`,
              description: `Checks the pattern. Write safeParse and test valid/invalid input.`,
              answer: `Catch the error and return { ok: false, error }, otherwise { ok: true, value }. Callers check ok before using value.`,
              solution: `const safeParse = (s) => {\n  try { return { ok: true, value: JSON.parse(s) }; }\n  catch (error) { return { ok: false, error }; }\n};`,
            },
            {
              task: `Chain two steps that can fail.`,
              description: `Checks composition. Parse JSON, then validate an email field.`,
              answer: `Return early if the first result is not ok, then run validation on value and return its result. A small andThen helper removes the repetition: andThen(r, f) => r.ok ? f(r.value) : r.`,
            },
          ],
        },
      ],
      senior: [
        {
          q: `Why does this map with parseInt give wrong numbers?`,
          code: `const ids = ['10', '10', '10'].map(parseInt);`,
          short: `map passes (value, index, array), so parseInt gets the index as radix and returns [10, NaN, 2]; wrap it or use Number.`,
          long: `Passing a function directly assumes it ignores extra arguments.\nparseInt(value, radix) treats the index as radix.\nRadix 0 means auto (10), radix 1 is invalid (NaN), radix 2 parses "10" as 2.\nUse map(Number) or map((s) => parseInt(s, 10)).\nIn your own HOFs, wrap callbacks with unary() when arity matters.`,
          fix: `const ids = ['10', '10', '10'].map((s) => Number.parseInt(s, 10));`,
          exercises: [
            {
              task: `Write a unary helper that passes only the first argument.`,
              description: `Checks arity control. Use it with parseInt.`,
              answer: `unary returns a function that forwards only the first argument. ['1','2'].map(unary(parseInt)) then works.`,
              solution: `const unary = (fn) => (x) => fn(x);`,
            },
            {
              task: `Is it safe to pass Number.parseFloat directly to map? Why?`,
              description: `Checks generalization. Compare with parseInt.`,
              answer: `Yes, parseFloat takes only one parameter, so extra map arguments are ignored. parseInt has an optional second parameter, which map fills with the index. Optional parameters are the trap, so prefer explicit lambdas in shared code.`,
            },
          ],
        },
        {
          q: `How do functional ideas show up in React? Where is React not pure?`,
          short: `Components are meant to be pure functions of props and state, state updates are immutable, and effects are isolated, but hooks rely on call order and hidden per-instance state.`,
          long: `Render should be pure: same props and state, same output, no side effects.\nStrictMode double-invokes render in development to expose impurity.\nState updates replace values; reducers are pure (state, action) => state.\nuseEffect isolates side effects after commit.\nHooks keep state in React's fiber, so components are not referentially transparent.\nReact Compiler relies on purity to auto-memoize, so impure renders break optimizations.`,
          ai: true,
          exercises: [
            {
              task: `What is not pure in this component?`,
              description: `Checks render purity. Explain what StrictMode reveals.`,
              code: `let renders = 0;\nfunction Badge() { renders++; return <span>{renders}</span>; }`,
              answer: `It mutates module state during render, so the number depends on render count, which StrictMode doubles in development. Concurrent rendering can also discard renders. Use state or a ref updated in an effect if you need counting.`,
            },
            {
              task: `This reducer changes the old state. Rewrite it.`,
              description: `Checks immutable reducers. Run with a quick test.`,
              code: `function reducer(s, a) { if (a.type === 'add') s.items.push(a.item); return s; }`,
              answer: `Return a new state object: { ...s, items: [...s.items, a.item] }. The original returns the same reference, so React bails out and the UI does not update.`,
            },
          ],
        },
        {
          q: `What is lazy evaluation with generators? When is it better than array methods?`,
          short: `Generators produce values on demand, so pipelines over large or infinite sequences avoid intermediate arrays and can stop early.`,
          long: `arr.map().filter().slice(0, 5) builds full intermediate arrays.\nA generator pipeline processes one item at a time through all steps.\nIt stops as soon as enough results are produced.\nIterator helpers (Iterator.prototype.map/filter/take) ship in current Chrome, Firefox and Safari.\nFor small arrays, plain array methods are faster and clearer.\nAsync generators help with paginated APIs.`,
          exercises: [
            {
              task: `Get the first three even squares, computing only what you need.`,
              description: `Checks generators. Run in Node 22+.`,
              answer: `Write a naturals generator, then chain iterator helpers map, filter and take(3), and spread into an array. Only the needed values are computed.`,
              solution: `function* naturals() { let n = 1; while (true) yield n++; }\nconsole.log([...naturals().map((n) => n * n).filter((n) => n % 2 === 0).take(3)]);`,
            },
            {
              task: `Read a paged API with an async generator.`,
              description: `Checks async iteration. Sketch it with fetch.`,
              answer: `Loop while a next cursor exists, fetch a page and yield each item. Consumers use for await and can break early, which stops further requests.`,
            },
          ],
        },
      ],
      techlead: [
        {
          q: `Split this code into pure business logic and a thin layer for side effects.`,
          code: `async function approve(appId) {\n  const app = await api.get(appId);\n  if (app.score > 80 && !app.flags.length) {\n    app.status = 'approved';\n    await api.save(app);\n    toast('Approved');\n  } else {\n    toast('Cannot approve');\n  }\n}`,
          short: `Move the decision into a pure function returning the new state or a reason, and keep fetching, saving and UI in a thin shell.`,
          long: `The business rule is tangled with I/O and UI, so testing needs mocks.\nA pure decide(app) returns { ok, next } or { ok: false, reason }.\nThe shell loads, calls decide, persists and notifies.\nRules become easy to unit test and reuse on the server.\nThis "functional core, imperative shell" scales better than a full FP library.\nIt also makes code review of rules simpler.`,
          fix: `export function decideApproval(app) {\n  if (app.flags.length) return { ok: false, reason: 'flagged' };\n  if (app.score <= 80) return { ok: false, reason: 'low score' };\n  return { ok: true, next: { ...app, status: 'approved' } };\n}\nasync function approve(appId) {\n  const r = decideApproval(await api.get(appId));\n  if (!r.ok) return toast('Cannot approve: ' + r.reason);\n  await api.save(r.next);\n  toast('Approved');\n}`,
          exercises: [
            {
              task: `Write table tests for the pure function.`,
              description: `Checks testability. Use Vitest it.each.`,
              answer: `List cases (flagged, low score, approved) with inputs and expected results and assert decideApproval output. No mocks are needed, and new rules add rows.`,
            },
            {
              task: `How does this help the team?`,
              description: `Checks leadership framing. 2-3 sentences.`,
              answer: `Rules become readable and reviewable through tests, and changes are low risk. Onboarding is easier because I/O patterns live in one place.`,
            },
          ],
        },
        {
          q: `How do you set functional style rules so the whole team can read the code?`,
          short: `Adopt pragmatic FP (immutability, pure functions, small composable helpers) and avoid dense point-free chains and category-theory jargon unless the team is fluent.`,
          long: `Readability for the median team member beats cleverness.\nRequire immutable state updates and pure domain functions.\nPrefer named intermediate variables over long pipe chains.\nUse native features (map, filter, Object.groupBy, structuredClone) before libraries.\nAllow libraries like Effect only with training and clear boundaries.\nCapture guidelines with examples in the repo and lint where possible.`,
          ai: true,
          exercises: [
            {
              task: `Rewrite this code so it is easy to read.`,
              description: `Checks judgment. Rewrite the snippet clearly.`,
              code: `const r = pipe(filter(propEq('active', true)), map(prop('email')), uniq, join(', '))(users);`,
              answer: `Use native methods with names: const emails = users.filter(u => u.active).map(u => u.email); then new Set and join. It is understandable without knowing Ramda.`,
            },
            {
              task: `Which lint rules support these guidelines?`,
              description: `Checks enforcement. Name rules.`,
              answer: `no-param-reassign with props, prefer-const, eslint-plugin-functional's immutable-data limited to domain folders, and react-hooks rules. Keep them scoped to avoid friction in imperative glue code.`,
            },
          ],
        },
        {
          q: `Should the whole company use an immutable data library, like Immer or Immutable.js?`,
          short: `Immer usually wins: plain objects, structural sharing and mutation-like syntax; Immutable.js adds custom types that leak across the codebase.`,
          long: `Manual spreading of deep updates is verbose and error-prone.\nImmer lets you write mutations on a draft and produces a new immutable object.\nRedux Toolkit already uses Immer.\nImmutable.js uses its own collections, needs toJS conversions and has low activity.\nThe native Records and Tuples proposal was withdrawn.\nMeasure overhead in hot paths; Immer has some cost for large drafts.`,
          exercises: [
            {
              task: `Update a nested field with Immer.`,
              description: `Checks Immer usage. Run with immer installed.`,
              answer: `produce(state, draft => { draft.user.address.city = 'Kyiv'; }) returns a new state with only changed branches copied. Unchanged subtrees keep references.`,
            },
            {
              task: `List the sections of a decision record for this choice.`,
              description: `Checks ADR thinking. List sections.`,
              answer: `Context (deep updates, bugs), options (manual, Immer, Immutable.js), decision with rationale, consequences (bundle size, perf, learning), and migration plan. Include revisit criteria.`,
            },
          ],
        },
      ],
    },
    OOP: {
      junior: [
        {
          q: `What is the difference between a class and an object?`,
          short: `A class is a blueprint defining properties and methods; an object is a concrete instance created from it with new.`,
          long: `class User { constructor(name) { this.name = name; } } defines the shape.\nnew User('Ann') creates an instance with its own data.\nMethods live on the prototype and are shared by instances.\nEach instance has its own field values.\nIn JS, classes are syntax over prototypes.\ninstanceof checks if the class prototype is in the object's chain.`,
          exercises: [
            {
              task: `What does this code print?`,
              description: `Checks prototype sharing. Run in Node.`,
              code: `class Dog { bark() { return 'woof'; } }\nconst a = new Dog(), b = new Dog();\nconsole.log(a.bark === b.bark, a === b);`,
              answer: `It logs true false. The method is shared on Dog.prototype, but a and b are different objects.`,
            },
            {
              task: `Write a Counter class.`,
              description: `Checks basic class syntax. Test increment and value.`,
              answer: `Store count in a field initialized to 0, add increment() that adds one, and a value getter. Each instance tracks its own count.`,
              solution: `class Counter {\n  count = 0;\n  increment() { this.count++; }\n  get value() { return this.count; }\n}`,
            },
          ],
        },
        {
          q: `This subclass throws an error about super. Why? How do you fix it?`,
          code: `class Animal { constructor(name) { this.name = name; } }\nclass Cat extends Animal {\n  constructor(name) {\n    this.lives = 9;\n  }\n}`,
          short: `A derived class constructor must call super() before using this.`,
          long: `In derived classes, this is not initialized until super runs.\nAccessing this before super throws a ReferenceError.\nCall super(name) first, then set own fields.\nIf you do not need a custom constructor, omit it.\nClass fields in subclasses are initialized right after super returns.`,
          fix: `class Cat extends Animal {\n  lives = 9;\n  constructor(name) {\n    super(name);\n  }\n}`,
          exercises: [
            {
              task: `Override a method and also call the parent method.`,
              description: `Checks super.method. Run in Node.`,
              answer: `Define speak() in the subclass and call super.speak() inside it, then add behavior. This extends rather than replaces the parent logic.`,
              solution: `class Animal { speak() { return 'sound'; } }\nclass Cat extends Animal { speak() { return super.speak() + ': meow'; } }`,
            },
            {
              task: `What does this code print?`,
              description: `Checks instanceof. Run in Node.`,
              code: `class A {}\nclass B extends A {}\nconst b = new B();\nconsole.log(b instanceof A, b instanceof B);`,
              answer: `It logs true true. B.prototype inherits from A.prototype, so both are in b's chain.`,
            },
          ],
        },
        {
          q: `What is encapsulation? How do private fields with a hash sign help?`,
          short: `Encapsulation hides internal state behind methods; #private fields are truly inaccessible outside the class.`,
          long: `Encapsulation protects invariants by controlling how state changes.\nThe old _underscore convention is only a hint.\n#field syntax is enforced by the engine.\nAccessing obj.#field outside the class is a SyntaxError.\nPrivate methods (#method) and static privates also exist.\nUse getters to expose read-only views.`,
          exercises: [
            {
              task: `Make the balance private in a bank account class.`,
              description: `Checks # syntax. Write BankAccount with deposit and balance getter.`,
              answer: `Use #balance = 0, a deposit that validates positive amounts, and get balance(). Outside code cannot set #balance directly, so invariants hold.`,
              solution: `class BankAccount {\n  #balance = 0;\n  deposit(n) { if (n <= 0) throw new Error('positive only'); this.#balance += n; }\n  get balance() { return this.#balance; }\n}`,
            },
            {
              task: `Check if an object is a real instance, using its private field.`,
              description: `Checks the #x in obj syntax. Write a static isAccount.`,
              answer: `static isAccount(o) { return #balance in o; } returns true only for real instances. It is a reliable brand check, unlike instanceof across realms.`,
            },
          ],
        },
      ],
      middle: [
        {
          q: `This method loses "this" when passed as a callback. Why? How do you fix it?`,
          code: `class Timer {\n  seconds = 0;\n  tick() { this.seconds++; }\n  start() { setInterval(this.tick, 1000); }\n}`,
          short: `Passing this.tick detaches it from the instance, so this is undefined in strict class code; use an arrow function field or bind.`,
          long: `Method calls get this from the call site (obj.method()).\nsetInterval calls the function plainly, so this is undefined (classes are strict mode).\nFix with setInterval(() => this.tick(), 1000).\nOr define tick = () => {...} as a class field (one copy per instance).\nOr bind in the constructor.\nAlso store the interval id to clear it later.`,
          fix: `class Timer {\n  seconds = 0;\n  #id;\n  tick = () => { this.seconds++; };\n  start() { this.#id = setInterval(this.tick, 1000); }\n  stop() { clearInterval(this.#id); }\n}`,
          exercises: [
            {
              task: `The listener is never removed. Why?`,
              description: `Checks bound reference identity. Explain the leak.`,
              code: `el.addEventListener('click', this.onClick.bind(this));\nel.removeEventListener('click', this.onClick.bind(this));`,
              answer: `Each bind returns a new function, so removal does nothing and the listener leaks. Store the bound function once (or use an arrow field) and pass the same reference to both calls. AbortController signals are another clean option.`,
            },
            {
              task: `Compare arrow function fields and normal methods.`,
              description: `Checks trade-offs. 2-3 sentences.`,
              answer: `Arrow fields auto-bind but are created per instance and are not on the prototype, so subclasses cannot call super.method(). Prototype methods are shared and overridable but need binding when passed around.`,
            },
          ],
        },
        {
          q: `What is polymorphism? Give a frontend example.`,
          short: `Polymorphism lets different objects respond to the same interface in their own way, so calling code does not branch on type.`,
          long: `Example: payment methods each implement pay(amount).\nCheckout calls method.pay() without knowing if it is card or PayPal.\nIn JS it is duck typing; in TS, interfaces make it explicit.\nIt replaces switch statements on type.\nIn React, components receiving the same props shape are polymorphic too.\nOveruse creates indirection; use it where variants are real.`,
          exercises: [
            {
              task: `Replace this type check with polymorphism.`,
              description: `Checks the refactor. Write shape classes with area().`,
              code: `function area(s) { if (s.type === 'circle') return Math.PI * s.r ** 2; if (s.type === 'sq') return s.a ** 2; }`,
              answer: `Create Circle and Square classes each with area(). Callers call shape.area(). Adding a triangle means a new class, not editing area().`,
            },
            {
              task: `Add TypeScript types for the shapes.`,
              description: `Checks interfaces. Write the Shape interface.`,
              answer: `interface Shape { area(): number } and classes implement it. Functions accept Shape and the compiler enforces every variant has area. A discriminated union with exhaustive switch is a valid functional alternative.`,
            },
          ],
        },
        {
          q: `What are static members? When should you use them?`,
          short: `Static members belong to the class itself, not instances; use them for factories, constants and utilities tied to the class.`,
          long: `Declared with static, accessed as ClassName.member.\nGood for factory methods like User.fromJSON(data).\nStatic blocks (static {}) run once for complex initialization.\nStatic state is shared globally, which complicates tests.\nA class with only static methods is usually better as a module of functions.\nthis inside a static method refers to the class (subclasses too).`,
          exercises: [
            {
              task: `Write a static method that builds a User from API data.`,
              description: `Checks static usage. Create User.fromApi(dto).`,
              answer: `static fromApi(dto) maps API fields to constructor args and returns new User(...). It keeps parsing logic close to the model and allows validation before construction.`,
              solution: `class User {\n  constructor(id, name) { this.id = id; this.name = name; }\n  static fromApi(d) { return new User(d.user_id, d.full_name); }\n}`,
            },
            {
              task: `Why can this static field cause test problems?`,
              description: `Checks global state awareness. Explain.`,
              code: `class Cache { static items = new Map(); }`,
              answer: `All tests share one Map, so state leaks between tests and order matters. Use instances injected where needed or reset in beforeEach.`,
            },
          ],
        },
      ],
      senior: [
        {
          q: `This class tree gets deeper with every feature. Change it to use composition.`,
          code: `class Button {}\nclass IconButton extends Button {}\nclass LoadingIconButton extends IconButton {}\nclass TooltipLoadingIconButton extends LoadingIconButton {}`,
          short: `Each feature combination needs a new subclass; compose independent behaviors (icon, loading, tooltip) as props or wrappers instead.`,
          long: `Inheritance chains create a class per combination (combinatorial explosion).\nChanges in base classes ripple to all descendants (fragile base class).\nComposition combines small pieces: Button with icon, loading and tooltip options.\nIn React use props, children and wrapper components.\nIn classes, inject collaborators (strategies) instead of extending.\nKeep inheritance shallow, for true is-a with stable bases.`,
          fix: `function Button({ icon, loading, tooltip, children, ...rest }) {\n  const btn = (\n    <button aria-busy={loading || undefined} disabled={loading} {...rest}>\n      {loading ? <Spinner /> : icon}{children}\n    </button>\n  );\n  return tooltip ? <Tooltip title={tooltip}>{btn}</Tooltip> : btn;\n}`,
          exercises: [
            {
              task: `Build a logger from small wrapper functions.`,
              description: `Checks object composition. Add timestamp and prefix behaviors.`,
              answer: `Create small functions that wrap a log function (withTimestamp, withPrefix) and combine them. Each piece is independently testable and combinable in any order.`,
            },
            {
              task: `What is the fragile base class problem?`,
              description: `Checks theory. Give an example.`,
              answer: `A base class changes add() to call addAll() internally; a subclass overriding both to count items now double-counts. Subclasses depend on base implementation details, not just its contract.`,
            },
          ],
        },
        {
          q: `This observer has no way to unsubscribe. Fix it.`,
          code: `class Store {\n  listeners = [];\n  subscribe(fn) { this.listeners.push(fn); }\n  set(v) { this.v = v; this.listeners.forEach((l) => l(v)); }\n}`,
          short: `Return an unsubscribe function, use a Set to avoid duplicates, and iterate over a copy so listeners can unsubscribe during notify.`,
          long: `Without unsubscribe, components that subscribe leak after unmount.\nReturning a cleanup function fits React's useEffect and useSyncExternalStore.\nA Set prevents duplicate subscriptions and gives O(1) delete.\nCopying before iterating avoids skipping when listeners remove themselves.\nConsider error isolation so one listener's throw does not stop others.`,
          fix: `class Store {\n  #listeners = new Set();\n  #v;\n  get = () => this.#v;\n  subscribe = (fn) => { this.#listeners.add(fn); return () => this.#listeners.delete(fn); };\n  set(v) { this.#v = v; for (const l of [...this.#listeners]) l(v); }\n}`,
          exercises: [
            {
              task: `Use this store in a React component.`,
              description: `Checks useSyncExternalStore. Write a hook.`,
              answer: `useSyncExternalStore(store.subscribe, store.get) subscribes, reads a snapshot and resubscribes correctly in concurrent rendering. The subscribe and get functions must be stable, which the arrow fields provide.`,
            },
            {
              task: `One listener throws an error. Make sure the others still run.`,
              description: `Checks robustness. Modify set().`,
              answer: `Wrap each listener call in try/catch and report errors (or rethrow in queueMicrotask) so other listeners still run. This mirrors how DOM event dispatch handles exceptions.`,
            },
          ],
        },
        {
          q: `What are mixins in JavaScript? What problems do they have?`,
          short: `Mixins add methods to a class via functions returning subclasses or Object.assign; they enable reuse but can cause name collisions and implicit dependencies.`,
          long: `Subclass factory pattern: const Serializable = (Base) => class extends Base { toJSON() {} }.\nCompose: class User extends Serializable(Eventful(Base)).\nPitfalls: name clashes, order-dependent behavior and hidden assumptions about this.\nHard to type well in TypeScript.\nReact removed mixins in favor of hooks for these reasons.\nPrefer composition with explicit collaborators.`,
          exercises: [
            {
              task: `Write a mixin that adds a createdAt field.`,
              description: `Checks the subclass-factory pattern. Run in Node.`,
              answer: `Define const Timestamped = (B) => class extends B { createdAt = new Date(); }. Use class Doc extends Timestamped(Object) {}. Instances get the field via the chain.`,
            },
            {
              task: `Two mixins both have a save method. What happens?`,
              description: `Checks pitfalls. Describe the collision.`,
              answer: `The last mixin applied wins, silently overriding the other unless it calls super.save(). Order matters and the bug is hard to see. Explicit composition makes conflicts visible.`,
            },
          ],
        },
      ],
      techlead: [
        {
          q: `For a new frontend project, how do you choose between classes and functions?`,
          short: `Default to functions and modules for UI and logic (React's model), and use classes where identity, lifecycle and encapsulated state matter, like SDK clients or complex domain objects.`,
          long: `React components and hooks are function-based; class components are legacy.\nClasses fit long-lived stateful objects: WebSocket clients, caches, editors.\nThey give encapsulation with #private and clear lifecycles (connect/dispose).\nPlain data should be plain objects for serialization and structural sharing.\nPick one convention per layer and document it.\nAvoid mixing paradigms within a module.`,
          ai: true,
          exercises: [
            {
              task: `Class or function? Decide for a date formatter, a WebSocket client, form validation and a chart renderer.`,
              description: `Checks judgment. Explain each choice.`,
              answer: `Date formatter and validation are pure functions. WebSocket client and chart renderer manage resources and lifecycle, so classes with dispose() fit. Document why so others follow.`,
            },
            {
              task: `List the sections of a short team guide on this topic.`,
              description: `Checks communication. List sections.`,
              answer: `Default paradigm per layer, when classes are allowed, data modeling (plain objects), state management, examples and anti-patterns, and review checklist. Keep it short with code examples.`,
            },
          ],
        },
        {
          q: `The whole app uses this API client class. What do you change?`,
          code: `export class Api {\n  static token;\n  static async get(url) {\n    const r = await fetch(url, { headers: { Authorization: 'Bearer ' + Api.token } });\n    return r.json();\n  }\n}`,
          short: `Static global state makes it untestable and unsafe across contexts; make it an instance with injected config, handle errors and status codes, and support cancellation.`,
          long: `Static token is global mutable state shared by tests and SSR requests.\nIt ignores non-2xx responses and network errors.\nNo AbortSignal or timeout support.\nCreate an instance with baseUrl and getToken injected.\nProvide a single app instance via module or context, and fakes in tests.\nCentralize error mapping and retries here.`,
          fix: `export class ApiClient {\n  #baseUrl; #getToken;\n  constructor({ baseUrl, getToken }) { this.#baseUrl = baseUrl; this.#getToken = getToken; }\n  async get(path, { signal } = {}) {\n    const r = await fetch(this.#baseUrl + path, {\n      signal, headers: { Authorization: 'Bearer ' + (await this.#getToken()) },\n    });\n    if (!r.ok) throw new HttpError(r.status, await r.text());\n    return r.json();\n  }\n}`,
          exercises: [
            {
              task: `Write a test with a fake token.`,
              description: `Checks testability. Use Vitest with a mocked fetch.`,
              answer: `Create ApiClient with getToken: async () => 't', stub global fetch to capture headers, and assert Authorization is 'Bearer t'. No static state needs resetting.`,
            },
            {
              task: `Two hundred places use the old class. Plan the change.`,
              description: `Checks rollout. Outline steps.`,
              answer: `Keep the static Api as a facade delegating to a default instance, migrate callers module by module, add a lint rule against the static import, and remove the facade once usage is zero.`,
            },
          ],
        },
        {
          q: `How do you bring design patterns to a team without making the code too complex?`,
          short: `Introduce patterns when they solve a present problem, name them in code review and docs, and avoid adding them speculatively.`,
          long: `Patterns are shared vocabulary, not goals.\nStart from pain points: duplicated switch logic (Strategy), API differences (Adapter), subscriptions (Observer).\nShow before/after examples from your codebase.\nPrefer language features (functions, modules) over classical heavy versions.\nReview for unnecessary indirection.\nRetrospect on patterns that did not pay off.`,
          ai: true,
          exercises: [
            {
              task: `Three vendors return users in different formats. Which pattern helps?`,
              description: `Checks mapping a problem to a pattern. Explain.`,
              answer: `Adapter: one function per vendor maps their response to your User type. The app depends only on User, and adding a vendor is a new adapter.`,
            },
            {
              task: `Someone wrote an abstract factory for only one button type. Is it good?`,
              description: `Checks judgment. Evaluate it.`,
              answer: `With one implementation the factory adds indirection without benefit. Remove it and use the component directly. Reintroduce it if variants appear.`,
            },
          ],
        },
      ],
    },
    'Frontend app architecture': {
      junior: [
        {
          q: `What is the difference between a component and a page?`,
          short: `A page is a route-level component that composes features for a URL; components are reusable building blocks inside pages.`,
          long: `Pages map to routes and handle URL params and layout.\nThey compose feature components and fetch page-level data.\nReusable components (Button, Card) know nothing about routes.\nKeeping pages thin makes features reusable elsewhere.\nRoute-level code splitting usually happens at the page boundary.`,
          exercises: [
            {
              task: `Put these files in folders: a profile page, an avatar, a useUser hook, and a date formatter.`,
              description: `Checks structure. Explain each placement.`,
              answer: `UserProfilePage in pages or routes, Avatar in shared UI components, useUser in the user feature's hooks, formatDate in shared lib/utils. This keeps responsibilities clear.`,
            },
            {
              task: `Load a page only when the user opens it.`,
              description: `Checks code splitting. Write it with React.lazy.`,
              answer: `const Settings = lazy(() => import('./pages/Settings')); and render inside Suspense with a fallback. The page's code loads only when visited.`,
            },
          ],
        },
        {
          q: `This component has a fixed API address and fetches during render. Fix it.`,
          code: `function Users() {\n  const [users, setUsers] = useState([]);\n  fetch('http://localhost:3000/users').then((r) => r.json()).then(setUsers);\n  return <ul>{users.map((u) => <li>{u.name}</li>)}</ul>;\n}`,
          short: `Fetching in render loops forever and the URL is hardcoded; move the URL to config, the request to a service, run it in an effect (or a data library), and add keys.`,
          long: `Each render fetches, setUsers re-renders, which fetches again: infinite loop.\nThe base URL should come from env config (import.meta.env.VITE_API_URL).\nA service function isolates the endpoint.\nUse useEffect with cleanup or TanStack Query for caching, loading and errors.\nList items need stable keys.`,
          fix: `// api/users.js\nexport const getUsers = (signal) => fetch(import.meta.env.VITE_API_URL + '/users', { signal }).then((r) => r.json());\n// Users.jsx\nfunction Users() {\n  const { data = [], isPending, error } = useQuery({ queryKey: ['users'], queryFn: ({ signal }) => getUsers(signal) });\n  if (isPending) return <p>Loading...</p>;\n  if (error) return <p>Failed to load</p>;\n  return <ul>{data.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;\n}`,
          exercises: [
            {
              task: `Write the same thing with useEffect, without a library.`,
              description: `Checks effect cleanup. Implement it.`,
              answer: `Create an AbortController in the effect, call getUsers(signal).then(setUsers), and abort in cleanup. Use an empty dependency array so it runs on mount.`,
            },
            {
              task: `How do you set a different API address for each environment?`,
              description: `Checks env config. Explain Vite env files.`,
              answer: `Put VITE_API_URL in .env.development and .env.production; Vite exposes only VITE_-prefixed vars on import.meta.env. They are inlined at build time, so never put secrets there.`,
            },
          ],
        },
        {
          q: `What does "separation of concerns" mean in a frontend app?`,
          short: `Splitting the app so UI, state, data access and business rules live in different places with clear interfaces.`,
          long: `UI components render and handle events.\nHooks or stores manage state.\nServices handle HTTP and mapping API data.\nPure functions hold business rules.\nThis makes each part testable and replaceable.\nIt is not about separate files for HTML/CSS/JS.`,
          exercises: [
            {
              task: `Which concern does each line belong to?`,
              description: `Checks layering. Label each line.`,
              code: `const total = items.reduce((s, i) => s + i.price, 0);\nconst res = await fetch('/api/cart');\nreturn <p>{total}</p>;`,
              answer: `reduce is business logic, fetch is data access, JSX is UI. They could live in a pure helper, a service and a component.`,
            },
            {
              task: `How does this split make testing easier?`,
              description: `Checks reasoning. 2-3 sentences.`,
              answer: `Pure logic is tested with simple unit tests. UI can be tested with mocked services. Changes to the API only touch the service layer.`,
            },
          ],
        },
      ],
      middle: [
        {
          q: `This component copies server data into local state. What is the problem? Fix it.`,
          code: `function Profile() {\n  const { data } = useQuery({ queryKey: ['me'], queryFn: getMe });\n  const [user, setUser] = useState(null);\n  useEffect(() => { if (data) setUser(data); }, [data]);\n  return <Form value={user} onSave={(u) => updateMe(u)} />;\n}`,
          short: `Copying query data into useState creates two sources of truth that drift; read from the query cache and use mutations that invalidate or update it.`,
          long: `The local copy goes stale when the query refetches or another component updates it.\nIt also causes an extra render.\nServer state belongs in the server-state cache.\nForm drafts can be local but should be initialized once (defaultValues or key).\nAfter saving, invalidate or setQueryData so all consumers update.`,
          fix: `function Profile() {\n  const qc = useQueryClient();\n  const { data } = useQuery({ queryKey: ['me'], queryFn: getMe });\n  const save = useMutation({ mutationFn: updateMe, onSuccess: (u) => qc.setQueryData(['me'], u) });\n  if (!data) return null;\n  return <Form key={data.id} defaultValue={data} onSave={save.mutate} />;\n}`,
          exercises: [
            {
              task: `This code keeps count in its own state. Fix it.`,
              description: `Checks avoiding redundant state.`,
              code: `const [items, setItems] = useState([]);\nconst [count, setCount] = useState(0); // kept in sync manually`,
              answer: `count is derivable from items.length, so storing it risks drift. Compute it during render. Use useMemo only if the derivation is expensive.`,
            },
            {
              task: `When do you use invalidate, and when setQueryData?`,
              description: `Checks cache strategy. 2-3 sentences.`,
              answer: `setQueryData updates instantly when the response contains the full new entity. invalidateQueries refetches, which is safer when the server computes related fields or lists. Often both are used.`,
            },
          ],
        },
        {
          q: `How do you organize folders by feature?`,
          short: `Group code by feature (components, hooks, api, types together) with a public index, and keep truly shared code in a shared layer.`,
          long: `src/features/orders contains its UI, hooks, API and tests.\nEach feature exposes a small public API via index.ts.\nShared UI and utilities live in src/shared.\napp/ holds providers, routing and global setup.\nFeatures should not import each other's internals.\nFeature-Sliced Design formalizes this into layers.`,
          exercises: [
            {
              task: `Draw the folder tree for orders and users.`,
              description: `Checks structure. Write the folders.`,
              answer: `src/app (router, providers), src/features/orders/{components,hooks,api,index.ts}, src/features/users/..., src/shared/{ui,lib,api}. Pages compose features.`,
            },
            {
              task: `The orders feature needs the user avatar. What do you do?`,
              description: `Checks boundaries. Explain options.`,
              answer: `Import UserAvatar from the users feature's public index, or move it to shared if generic. If both features need each other, lift the composition to the page.`,
            },
          ],
        },
        {
          q: `What is the difference between client rendering, server rendering and static generation?`,
          short: `CSR renders in the browser after JS loads; SSR renders HTML per request on the server; SSG renders HTML at build time.`,
          long: `CSR: simple hosting, slower first paint, SEO depends on crawler JS execution.\nSSR: faster first content and SEO, needs a server, hydration cost.\nSSG: fastest delivery from CDN, but data is fixed until rebuild or revalidation.\nStreaming SSR and React Server Components reduce client JS.\nInternal dashboards behind login often use CSR.\nChoose per route in frameworks like Next.js or React Router.`,
          exercises: [
            {
              task: `Choose a rendering mode for a marketing page, a product page and an admin dashboard.`,
              description: `Checks trade-offs. Explain each.`,
              answer: `Marketing: SSG. Product page: SSR or SSG with revalidation for fresh prices and SEO. Admin dashboard: CSR, since it is behind auth and highly interactive.`,
            },
            {
              task: `This line causes a hydration warning. Why?`,
              description: `Checks SSR pitfalls.`,
              code: `<p>{new Date().toLocaleTimeString()}</p>`,
              answer: `Server and client render different times, so markup differs and React reports a hydration mismatch. Render time-dependent values after mount in an effect, or use suppressHydrationWarning for intentional differences.`,
            },
          ],
        },
      ],
      senior: [
        {
          q: `This context makes the whole app re-render on every key press. Fix it.`,
          code: `const AppContext = createContext();\nfunction AppProvider({ children }) {\n  const [user, setUser] = useState(null);\n  const [search, setSearch] = useState('');\n  return <AppContext.Provider value={{ user, setUser, search, setSearch }}>{children}</AppContext.Provider>;\n}`,
          short: `A new value object every render plus unrelated state in one context makes all consumers re-render; split contexts by concern, memoize values, or move fast-changing state local or into a selector store.`,
          long: `Every consumer re-renders when the provider value changes reference.\nTyping in search changes it, so components using only user re-render too.\nSplit into UserContext and SearchContext, or keep search local to the search page.\nMemoize the value with useMemo.\nFor frequent updates with many readers use a store with selectors (Zustand, useSyncExternalStore).\nProfile with React DevTools "Highlight updates".`,
          fix: `const UserContext = createContext(null);\nfunction UserProvider({ children }) {\n  const [user, setUser] = useState(null);\n  const value = useMemo(() => ({ user, setUser }), [user]);\n  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;\n}\n// search state lives in the search feature (local state or URL)`,
          exercises: [
            {
              task: `Keep the search text in the URL instead.`,
              description: `Checks URL as state. Use useSearchParams.`,
              answer: `Read q from useSearchParams and update with setSearchParams({ q }), using replace to avoid history spam. Search becomes shareable and survives reload without global state.`,
            },
            {
              task: `Read only one value from a Zustand store.`,
              description: `Checks selectors. Write the hook call.`,
              answer: `const user = useStore((s) => s.user) re-renders only when user changes. Zustand compares selector results, so unrelated updates do not affect the component.`,
            },
          ],
        },
        {
          q: `How do you design error handling for a whole frontend app?`,
          short: `Layer it: typed errors from the API client, error boundaries per route/widget, user-friendly messages, retries where safe, and centralized reporting.`,
          long: `API client maps responses to typed errors (network, auth, validation, server).\nAuth errors trigger refresh or redirect centrally.\nValidation errors map to form fields.\nError boundaries isolate render crashes per route and widget.\nUnhandled rejections and window errors go to monitoring (e.g. Sentry) with release and user context.\nShow actionable messages and retry options, never raw stack traces.`,
          ai: true,
          exercises: [
            {
              task: `Turn HTTP status codes into error types.`,
              description: `Checks the client layer. Write a function.`,
              answer: `Check status: 401 to AuthError, 403 to ForbiddenError, 422 to ValidationError with field details, 5xx to ServerError, fetch TypeError to NetworkError. UI code switches on type rather than status codes.`,
            },
            {
              task: `Where do you put error boundaries on a dashboard?`,
              description: `Checks granularity. Describe placement.`,
              answer: `One at the app root as a last resort, one per route for navigation recovery, and one per independent widget. Reset boundaries on route change with resetKeys or key.`,
            },
          ],
        },
        {
          q: `What are the pros and cons of a Backend for Frontend, or BFF?`,
          short: `A BFF tailors APIs to one frontend, aggregating calls and hiding tokens, at the cost of another service to own, deploy and scale.`,
          long: `It aggregates several backend calls into one response for a screen.\nIt keeps secrets and tokens server-side (cookie sessions).\nIt shapes data to UI needs, reducing over-fetching.\nIt adds a latency hop, ops burden and possible logic duplication.\nThe frontend team should own it, or it becomes a bottleneck.\nFrameworks with server functions (RSC, loaders) can act as a BFF.`,
          exercises: [
            {
              task: `A dashboard makes fifteen calls to four services. Do you need a BFF?`,
              description: `Checks judgment. Decide and explain.`,
              answer: `Likely yes: one aggregated endpoint cuts round trips and centralizes auth. Confirm the team can own it and set caching and timeouts. Alternatively, ask backend for a composite endpoint.`,
            },
            {
              task: `List the security tasks of a BFF.`,
              description: `Checks security. List 3-4 items.`,
              answer: `Store tokens server-side with HttpOnly session cookies, enforce CSRF protection, validate input, and forward only needed data. Rate limit and log access.`,
            },
          ],
        },
      ],
      techlead: [
        {
          q: `In a large app, how do you define module boundaries and enforce them?`,
          short: `Define layers (app, pages, features, entities, shared) with one-way dependencies and public APIs, enforce with lint/dependency tools, and assign ownership.`,
          long: `Without boundaries everything imports everything and refactors become risky.\nAllowed direction: app > pages > features > entities > shared.\nEach slice exposes only its index.\neslint-plugin-boundaries or dependency-cruiser enforces rules in CI.\nCODEOWNERS maps folders to teams.\nNx or Turborepo can turn boundaries into packages with cached builds when needed.`,
          ai: true,
          exercises: [
            {
              task: `Write the import rules for each layer.`,
              description: `Checks enforcement. Express them as a table.`,
              answer: `shared imports nothing above; entities import shared; features import entities and shared; pages import features, entities, shared; app imports all. Imports within the same layer go through public APIs or are forbidden.`,
            },
            {
              task: `The current code is tangled. How do you add boundaries step by step?`,
              description: `Checks rollout. Outline steps.`,
              answer: `Map current dependencies, choose target layers, enable rules as warnings with a baseline, fix hotspots first, then make rules errors. Report violation counts per team.`,
            },
          ],
        },
        {
          q: `The app reads feature flags directly in many files. Redesign it.`,
          code: `if (window.FLAGS && window.FLAGS['new-checkout'] === 'on') { /* ... */ }\n// repeated in 120 files with different flag spellings`,
          short: `Wrap flags in one typed module or hook with defaults, central registry, telemetry and expiry dates, so flags are discoverable and removable.`,
          long: `Direct global access gives no types, no defaults and typos silently disable features.\nCreate a flags registry with names, defaults, owners and expiry.\nExpose useFlag('newCheckout') and isEnabled for non-React code.\nLoad from the provider SDK once, with a fallback when it fails.\nLog exposure for experiments.\nAlert on expired flags to force cleanup.`,
          fix: `// flags.ts\nexport const FLAGS = {\n  newCheckout: { default: false, owner: 'payments', expires: '2026-12-31' },\n} as const;\nexport type FlagName = keyof typeof FLAGS;\nexport function useFlag(name: FlagName): boolean {\n  const client = useFlagClient();\n  return client?.isOn(name) ?? FLAGS[name].default;\n}`,
          exercises: [
            {
              task: `How do you find and remove old flags automatically?`,
              description: `Checks process. Describe a CI check.`,
              answer: `A script reads the registry and warns or fails when a flag passed its expiry, and opens a ticket for the owner. Removing a flag means deleting the entry, so TypeScript errors show every usage.`,
            },
            {
              task: `The flag service is down. What should the app do?`,
              description: `Checks resilience. 2-3 sentences.`,
              answer: `Use defaults or the last known values cached locally, with a timeout on initialization. Do not block rendering on the flag SDK. Monitor fallback rates.`,
            },
          ],
        },
        {
          q: `How do you write and use Architecture Decision Records for frontend work?`,
          short: `ADRs are short, versioned documents capturing context, decision, alternatives and consequences, stored in the repo and referenced in reviews.`,
          long: `They answer "why is it like this?" for future team members.\nFormat: title, status, context, decision, options considered, consequences.\nStore in docs/adr with numbered files; review via PR.\nWrite them for costly-to-reverse decisions: state management, routing, styling, monorepo.\nSupersede old ADRs rather than editing history.\nLink ADRs in onboarding and code comments where relevant.`,
          ai: true,
          exercises: [
            {
              task: `Outline a decision record for choosing TanStack Query.`,
              description: `Checks the format. Fill the headings briefly.`,
              answer: `Context: duplicated fetch logic and stale data. Decision: TanStack Query for server state. Options: RTK Query, SWR, custom. Consequences: new dependency, training, removal of manual caches. Status: accepted.`,
            },
            {
              task: `Which decisions do not need a record?`,
              description: `Checks judgment. Give examples.`,
              answer: `Easily reversible or local choices, such as a helper name or one component's layout, do not need ADRs. Overdocumenting makes people ignore the folder.`,
            },
          ],
        },
      ],
    },
    CSS: {
      junior: [
        {
          q: `What is the difference between display none, visibility hidden and opacity zero?`,
          short: `display:none removes the element from layout and the accessibility tree; visibility:hidden keeps its space but hides it and removes it from a11y; opacity:0 keeps it fully present and interactive.`,
          long: `display: none - no box, no space, not focusable, hidden from screen readers.\nvisibility: hidden - space reserved, not clickable or focusable, hidden from screen readers.\nopacity: 0 - invisible but still clickable, focusable and read by screen readers.\nopacity and visibility can be transitioned; display can transition only with transition-behavior: allow-discrete.\nFor visually hidden but accessible text use a .sr-only pattern.`,
          exercises: [
            {
              task: `Write a class that hides text on screen but keeps it for screen readers.`,
              description: `Checks accessible hiding. Test with the accessibility tree in DevTools.`,
              answer: `Position absolutely with 1px size, overflow hidden, clip-path inset(50%) and white-space nowrap. The text stays in the accessibility tree but is invisible.`,
              solution: `.sr-only {\n  position: absolute; width: 1px; height: 1px;\n  padding: 0; margin: -1px; overflow: hidden;\n  clip-path: inset(50%); white-space: nowrap; border: 0;\n}`,
            },
            {
              task: `Users cannot click the page under this overlay. Why?`,
              description: `Checks interaction. Explain.`,
              code: `.overlay { position: fixed; inset: 0; opacity: 0; }`,
              answer: `The overlay is invisible but still captures clicks on content below. Use visibility: hidden or pointer-events: none when it is not shown.`,
            },
          ],
        },
        {
          q: `The text in this button is not centered vertically. Why? How do you fix it?`,
          code: `.btn { height: 40px; vertical-align: middle; }`,
          short: `vertical-align applies to inline/table-cell content, not the content inside a block; use flexbox (display: inline-flex; align-items: center).`,
          long: `vertical-align aligns an inline element relative to its line box, not its children.\nFor content inside a box, use flex or grid.\ninline-flex keeps the button inline with flex centering.\nAvoid fixed heights when possible; use padding and min-height for scaling text.\nline-height equal to height works for single lines but breaks on wrap.`,
          fix: `.btn {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 0.5rem;\n  min-height: 40px;\n  padding-inline: 1rem;\n}`,
          exercises: [
            {
              task: `Line up an icon and text in the middle.`,
              description: `Checks flex alignment. Build it in a CodePen.`,
              answer: `Use display: inline-flex, align-items: center and gap on the wrapper. The icon and text align on the same center line regardless of font size.`,
            },
            {
              task: `Center a block in the middle of the page.`,
              description: `Checks grid centering. Write the CSS.`,
              answer: `On the parent: display: grid; place-items: center; min-height: 100dvh. This centers both axes with one declaration.`,
            },
          ],
        },
        {
          q: `What are rem, em, percent, vw and px? Which unit is best for font size?`,
          short: `px is absolute, em is relative to the element's font size, rem to the root font size, % to the parent, vw to viewport width; prefer rem for font sizes so user settings are respected.`,
          long: `rem scales with the user's browser font-size preference.\nem compounds when nested, useful for component-relative spacing.\n% depends on the property (width relative to parent width).\nvw/vh relate to the viewport; dvh/svh/lvh handle mobile toolbars.\nclamp() combines them for fluid typography.\npx font sizes ignore the user's default font-size setting.`,
          exercises: [
            {
              task: `What font size does each element get?`,
              description: `Checks em compounding. Inspect in DevTools.`,
              code: `html { font-size: 16px; }\n.a { font-size: 1.5em; }\n.a .a { font-size: 1.5em; }`,
              answer: `Outer .a is 24px and nested .a is 36px because em compounds on the parent. Using 1.5rem would make both 24px.`,
            },
            {
              task: `Make a heading size grow with the screen, with a min and a max.`,
              description: `Checks clamp. Test by resizing the window.`,
              answer: `font-size: clamp(1.5rem, 1rem + 2vw, 3rem) grows with viewport but stays between bounds. Including rem in the middle term keeps zoom working.`,
            },
          ],
        },
      ],
      middle: [
        {
          q: `In this flex row, long text overflows instead of showing dots. Fix it.`,
          code: `<div class="row"><img src="a.png" /><span class="title">Very long title ...</span></div>\n<style>\n.row { display: flex; }\n.title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n</style>`,
          short: `Flex items default to min-width: auto, so they refuse to shrink below content width; set min-width: 0 on the item.`,
          long: `Flex items have min-width: auto, meaning their min-content size.\nWith nowrap text, min-content is the whole line, so it cannot shrink.\nmin-width: 0 (or overflow: hidden on the item) allows shrinking.\nThen text-overflow: ellipsis works.\nThe same issue appears in grid with 1fr; use minmax(0, 1fr).\nAlso set flex-shrink: 0 on the image so it keeps its size.`,
          fix: `.row { display: flex; align-items: center; gap: 8px; }\n.row img { flex-shrink: 0; }\n.title { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }`,
          exercises: [
            {
              task: `A wide code block breaks this grid. Fix it.`,
              description: `Checks minmax.`,
              code: `.layout { display: grid; grid-template-columns: 240px 1fr; }`,
              answer: `Use grid-template-columns: 240px minmax(0, 1fr). 1fr has an automatic minimum of min-content, so wide content pushes the column; minmax(0, 1fr) lets it shrink and the pre can scroll.`,
            },
            {
              task: `Show only two lines of text and cut the rest.`,
              description: `Checks line clamping. Test in current browsers.`,
              answer: `Use display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden. All major browsers support it; the standard line-clamp property is still rolling out.`,
            },
          ],
        },
        {
          q: `How are CSS custom properties different from Sass variables?`,
          short: `Custom properties are live at runtime, cascade and inherit, and can change via media queries or JS; Sass variables are compiled away at build time.`,
          long: `--brand: #0a58ca is set on an element and inherited by descendants.\nvar(--brand, fallback) reads it at computed-value time.\nOverride per theme, component or media query without recompiling.\nJS can set them with element.style.setProperty.\n@property registers type, initial value and inheritance, enabling transitions.\nSass is still useful for mixins and loops, but tokens work best as custom properties.`,
          exercises: [
            {
              task: `Add dark mode with custom properties.`,
              description: `Checks theming. Toggle the OS theme in DevTools rendering emulation.`,
              answer: `Define tokens on :root and redefine them in @media (prefers-color-scheme: dark). Components only use var(--bg) etc. light-dark() with color-scheme is a newer, concise option.`,
              solution: `:root { color-scheme: light dark; --bg: light-dark(#fff, #111); --fg: light-dark(#111, #eee); }\nbody { background: var(--bg); color: var(--fg); }`,
            },
            {
              task: `Animate the angle of a gradient.`,
              description: `Checks @property. Test in a current browser.`,
              answer: `Register @property --angle { syntax: '<angle>'; inherits: false; initial-value: 0deg; } and animate --angle. Unregistered custom properties cannot interpolate, so they jump.`,
            },
          ],
        },
        {
          q: `What is a stacking context? What creates one?`,
          short: `A stacking context is a group whose z-index is resolved locally; it is created by positioned elements with z-index, opacity < 1, transform, filter, isolation: isolate and others.`,
          long: `z-index only compares elements within the same stacking context.\nCreated by: root, position with z-index (not auto), position fixed/sticky, opacity < 1, transform, filter, will-change, contain: paint, isolation: isolate, flex/grid children with z-index.\nA child with z-index 9999 cannot escape a parent context with lower order.\nisolation: isolate creates a context intentionally without side effects.\nThe top layer (dialog, popover) sits above all contexts.`,
          exercises: [
            {
              task: `Build a modal that is always on top.`,
              description: `Checks the dialog element. Build it in an HTML file.`,
              answer: `Use <dialog> and call showModal(). It renders in the top layer above everything, makes the rest inert, and gives Esc to close. Style the backdrop with ::backdrop.`,
            },
            {
              task: `The dropdown is hidden under the next card. Why?`,
              description: `Checks context reasoning. Inspect the code.`,
              code: `.card { transform: translateZ(0); }\n.card .menu { position: absolute; z-index: 1000; }\n.next-card { position: relative; z-index: 1; }`,
              answer: `transform makes .card a stacking context at level 0, so the menu is trapped inside it and .next-card with z-index 1 paints above it. Remove the transform, give .card a higher z-index when open, or render the menu with popover/portal.`,
            },
          ],
        },
      ],
      senior: [
        {
          q: `Images and fonts make this page jump while loading. Fix it.`,
          code: `<img src="hero.jpg">\n<style>\n@font-face { font-family: Brand; src: url(brand.woff2); }\nbody { font-family: Brand, sans-serif; }\n</style>`,
          short: `Give images dimensions or aspect-ratio and tune font loading with font-display plus size-adjusted fallbacks so text does not reflow.`,
          long: `Images without width/height have zero size until loaded, then push content (CLS).\nAdd width and height attributes; CSS height: auto keeps responsiveness.\nOr use aspect-ratio for containers.\nFonts swapping from fallback to Brand change metrics and cause shifts.\nUse font-display: swap or optional, preload critical fonts, and adjust fallback with size-adjust and ascent-override.\nMeasure CLS with Lighthouse and the web-vitals library.`,
          fix: `<img src="hero.jpg" width="1200" height="600" alt="..." fetchpriority="high">\n<style>\nimg { max-width: 100%; height: auto; }\n@font-face { font-family: Brand; src: url(brand.woff2) format('woff2'); font-display: swap; }\n@font-face { font-family: BrandFallback; src: local('Arial'); size-adjust: 104%; ascent-override: 92%; }\nbody { font-family: Brand, BrandFallback, sans-serif; }\n</style>`,
          exercises: [
            {
              task: `Keep space for an ad before it loads.`,
              description: `Checks CLS prevention. Write CSS.`,
              answer: `Set min-height (or aspect-ratio) on the slot container matching the expected ad size. Content below no longer jumps when the ad loads.`,
            },
            {
              task: `How do you find which element moves?`,
              description: `Checks tooling. Describe the tools.`,
              answer: `Use the DevTools Performance panel (Layout shifts track) or a PerformanceObserver for 'layout-shift' entries, which list sources. The web-vitals attribution build reports the largest shift target in the field.`,
            },
          ],
        },
        {
          q: `How do container queries change the way we design components?`,
          short: `Components can respond to their container's size instead of the viewport, making them truly reusable in sidebars, grids and main areas.`,
          long: `Declare container-type: inline-size on a wrapper.\nUse @container (min-width: 400px) { ... } in component styles.\nContainer units (cqi, cqw) size relative to the container.\nStyle queries on custom properties work in Chromium and Safari; Firefox support is still arriving.\nMedia queries remain for page-level layout and user preferences.\nAvoid making the container's size depend on its children (inline-size containment).`,
          exercises: [
            {
              task: `Make a card change to a side-by-side layout when it has room.`,
              description: `Checks container queries. Put the card in a narrow and a wide column.`,
              answer: `Set .card-wrap { container-type: inline-size } and inside @container (min-width: 32rem) make .card a grid with image and text side by side. The same component adapts per placement.`,
              solution: `.card-wrap { container-type: inline-size; }\n.card { display: grid; gap: 1rem; }\n@container (min-width: 32rem) { .card { grid-template-columns: 12rem 1fr; } }`,
            },
            {
              task: `The container shrinks to zero width. Why?`,
              description: `Checks pitfalls. Explain.`,
              answer: `inline-size containment makes the element ignore its content for inline sizing, so a shrink-to-fit container (floated, inline-block, or a flex item without width) collapses. Give it a definite width or let it stretch.`,
            },
          ],
        },
        {
          q: `What can you do with the has selector? Is it slow?`,
          short: `:has() is a relational parent/previous-sibling selector that lets you style based on descendants or later siblings; keep it scoped to avoid broad invalidation.`,
          long: `form:has(:invalid) styles a form containing invalid fields.\nlabel:has(+ input:focus) targets a preceding sibling.\nbody:has(dialog[open]) can lock scroll.\nSupported in all modern browsers.\nBroad selectors like :has(*) on body can trigger heavy style recalculation on DOM changes.\nAnchor it to specific elements and simple arguments.`,
          exercises: [
            {
              task: `Highlight a card when its checkbox is checked.`,
              description: `Checks :has. Build in HTML.`,
              answer: `.card:has(input[type=checkbox]:checked) { outline: 2px solid var(--accent); } styles the card without JS. It updates live as the checkbox changes.`,
            },
            {
              task: `Stop page scroll while a modal is open.`,
              description: `Checks global use. Write the selector.`,
              answer: `html:has(dialog[open]) { overflow: hidden; } prevents background scrolling. Keep the argument narrow so recalculation stays cheap.`,
            },
          ],
        },
      ],
      techlead: [
        {
          q: `How do you use cascade layers to stop fights over specificity in a large codebase?`,
          short: `Declare a layer order (reset, tokens, base, components, utilities, overrides) so later layers win regardless of selector specificity, and put third-party CSS in a low layer.`,
          long: `@layer reset, base, components, utilities; defines precedence order up front.\nRules in later layers beat earlier ones regardless of specificity.\nUnlayered styles beat all layers (careful with legacy CSS).\nImport vendor CSS into a layer: @import url(lib.css) layer(vendor).\n!important reverses layer order, so important in reset beats important in utilities.\nMigrate gradually by wrapping legacy CSS in a layer.`,
          ai: true,
          exercises: [
            {
              task: `Write a basic layer setup.`,
              description: `Checks syntax. Create main.css.`,
              answer: `Start with @layer reset, vendor, base, components, utilities; then import vendor CSS into layer(vendor) and wrap rules in their layers. A utility class like .mt-4 then beats a component selector without !important.`,
              solution: `@layer reset, vendor, base, components, utilities;\n@import url('normalize.css') layer(reset);\n@import url('datepicker.css') layer(vendor);\n@layer components { .card .title { margin: 0; } }\n@layer utilities { .mt-4 { margin-top: 1rem; } }`,
            },
            {
              task: `How do you move old CSS into layers step by step?`,
              description: `Checks rollout. Outline steps.`,
              answer: `Wrap all legacy CSS in @layer legacy placed low, so new layered code can override it. Remove !important usages as you migrate components. Track unlayered CSS size until zero.`,
            },
          ],
        },
        {
          q: `Review this theme code for a design system with many brands.`,
          code: `.btn-primary { background: #0a58ca; }\n.brand-b .btn-primary { background: #c2185b !important; }\n.brand-b.dark .btn-primary { background: #f06292 !important; }`,
          short: `Replace hardcoded colors and brand selectors with layered design tokens (primitive > semantic > component) as custom properties, switched by a data attribute.`,
          long: `Each new brand or mode multiplies selectors and !important.\nPrimitives: --blue-600. Semantic: --color-action. Component: --btn-bg: var(--color-action).\nBrands and modes redefine semantic tokens only, on [data-brand] and [data-theme].\nGenerate tokens from a source of truth (Style Dictionary, DTCG JSON) shared with design tools.\nComponents never reference primitives directly.\nVisual regression tests per brand catch breakage.`,
          fix: `:root { --color-action: #0a58ca; }\n[data-brand='b'] { --color-action: #c2185b; }\n[data-brand='b'][data-theme='dark'] { --color-action: #f06292; }\n.btn-primary { background: var(--btn-bg, var(--color-action)); }`,
          exercises: [
            {
              task: `Describe the three levels of tokens with one example each.`,
              description: `Checks structure.`,
              answer: `Primitive: --pink-700: #c2185b. Semantic: --color-action: var(--pink-700). Component: --btn-bg: var(--color-action). Brands swap semantic mappings; components stay unchanged.`,
            },
            {
              task: `How do you check color contrast for every brand automatically?`,
              description: `Checks accessibility governance. Describe the check.`,
              answer: `In the token build, compute contrast for each foreground/background semantic pair per brand and mode and fail when below 4.5:1 for text. Also run axe in visual regression stories per brand.`,
            },
          ],
        },
        {
          q: `Many teams add CSS. How do you measure and control CSS size and speed?`,
          short: `Set budgets on CSS bytes and unused CSS, split CSS per route, avoid expensive patterns, and track metrics in CI and real-user monitoring.`,
          long: `Render-blocking CSS delays first paint; large CSS also costs parsing and style recalc.\nBudget total and critical CSS in CI (size-limit or bundler stats).\nUse Coverage in DevTools to find unused rules.\nCode-split CSS with route chunks; inline critical CSS for landing pages.\ncontent-visibility: auto skips rendering offscreen sections.\nWatch style recalc time in traces for broad :has selectors or huge DOMs.`,
          ai: true,
          exercises: [
            {
              task: `Add a CSS size limit to CI.`,
              description: `Checks tooling. Describe configuration.`,
              answer: `Use size-limit with entries for dist/assets/*.css and a gzip limit, run it in CI and comment the diff on PRs. Raising the limit requires review from an owner.`,
            },
            {
              task: `Make a long page render faster with content-visibility.`,
              description: `Checks rendering optimization. Write the CSS.`,
              answer: `Apply content-visibility: auto with contain-intrinsic-size: auto 800px to offscreen sections. The browser skips layout and paint until they near the viewport, and intrinsic size prevents scrollbar jumps.`,
            },
          ],
        },
      ],
    },
  },
};
