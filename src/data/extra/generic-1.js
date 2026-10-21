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
              task: `Predict the output.`,
              description: `Checks object coercion in localStorage.`,
              code: `localStorage.setItem('u', { name: 'Ann' });
console.log(localStorage.getItem('u'));`,
              answer: `"[object Object]". setItem converts values with String(). Use JSON.stringify.`,
              solution: `localStorage.setItem('u', JSON.stringify({ name: 'Ann' }));`,
            },
            {
              task: `Predict the output.`,
              description: `Checks Date round-trip through JSON.`,
              code: `localStorage.setItem('d', JSON.stringify(new Date(0)));
const d = JSON.parse(localStorage.getItem('d'));
console.log(typeof d);`,
              answer: `"string". JSON turns a Date into an ISO string. Recreate it with new Date(d).`,
            },
            {
              easy: true,
              task: `Predict the type returned.`,
              description: `Checks string-only storage.`,
              code: `localStorage.setItem('n', 5);
typeof localStorage.getItem('n')`,
              answer: `It returns 'string' because localStorage keeps only strings.`,
            },
            {
              easy: true,
              task: `Convert the stored value to a number.`,
              description: `Checks parsing.`,
              code: `localStorage.setItem('n', '5');
const n = localStorage.getItem('n');`,
              answer: `Use Number to turn the string back into a number.`,
              solution: `const n = Number(localStorage.getItem('n'));`,
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
              task: `Fix the bug.`,
              description: `Checks number parsing from storage.`,
              code: `const n = localStorage.getItem('cart') || 0;
localStorage.setItem('cart', n + 1);`,
              answer: `getItem returns "1", so "1" + 1 is "11". Convert to a number first.`,
              solution: `const n = Number(localStorage.getItem('cart')) || 0;
localStorage.setItem('cart', String(n + 1));`,
            },
            {
              task: `Predict the output.`,
              description: `Checks boolean strings from storage.`,
              code: `localStorage.setItem('dark', false);
if (localStorage.getItem('dark')) console.log('dark on');`,
              answer: `It logs "dark on". The value is the string "false", which is truthy. Compare to "true".`,
            },
            {
              easy: true,
              task: `Predict the result.`,
              description: `Checks string concatenation.`,
              code: `'1' + 1`,
              answer: `It gives '11' because + joins a string and number as text.`,
            },
            {
              easy: true,
              task: `Predict the value for a missing key.`,
              description: `Checks null return.`,
              code: `localStorage.getItem('nope')`,
              answer: `It returns null when the key does not exist.`,
            },
          ],
        },
        {
          q: `How do you see and clear browser storage in DevTools?`,
          short: `In Chrome the Application panel (Firefox: Storage) lists localStorage, sessionStorage, IndexedDB, cookies and Cache Storage, and "Clear site data" wipes them.`,
          long: `Open DevTools and go to Application (Chrome/Edge) or Storage (Firefox).\nEach storage type is listed per origin; you can view, edit and delete entries.\nCookies show flags such as HttpOnly, Secure, SameSite and expiry.\nStorage > "Clear site data" removes everything for the origin, with checkboxes.\nThe usage chart shows how much quota is used.\nIncognito windows start with empty storage, which helps reproduce first-visit bugs.`,
          exercises: [
            {
              task: `Name the DevTools panel for storage.`,
              description: `Checks finding storage in DevTools.`,
              answer: `The Application panel in Chrome (Storage in Firefox) shows Local Storage, Session Storage, IndexedDB, and Cookies.`,
            },
            {
              task: `Write a console command to clear storage.`,
              description: `Checks clearing storage from the console.`,
              code: `// Reset the app state from DevTools.`,
              answer: `Clear both stores for the current origin.`,
              solution: `localStorage.clear();
sessionStorage.clear();`,
            },
            {
              easy: true,
              task: `Name the shortcut to open DevTools on Mac.`,
              description: `Checks DevTools basics.`,
              answer: `Press Cmd+Option+I to open DevTools on Mac.`,
            },
            {
              easy: true,
              task: `Write the call that removes one key.`,
              description: `Checks removeItem.`,
              code: `localStorage.setItem('a', '1');`,
              answer: `removeItem deletes one key.`,
              solution: `localStorage.removeItem('a');`,
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
              task: `Fix this save so it cannot crash.`,
              description: `Checks QuotaExceededError handling.`,
              code: `localStorage.setItem('draft', JSON.stringify(big));`,
              answer: `setItem throws when storage is full or blocked. Catch it and handle it.`,
              solution: `try {
  localStorage.setItem('draft', JSON.stringify(big));
} catch (e) {
  if (e.name === 'QuotaExceededError') notify('Storage full');
}`,
            },
            {
              task: `Name two cases when setItem throws.`,
              description: `Checks storage failure modes.`,
              answer: `The quota is full, or storage is blocked by browser settings or some private modes.`,
            },
            {
              easy: true,
              task: `Name the error type for a full storage.`,
              description: `Checks quota error.`,
              code: `catch (e) { console.log(e.name); }`,
              answer: `The name is QuotaExceededError when storage is full.`,
            },
            {
              easy: true,
              task: `Wrap this call so it cannot crash.`,
              description: `Checks try catch.`,
              code: `localStorage.setItem('k', 'v');`,
              answer: `Wrap it in try and catch.`,
              solution: `try { localStorage.setItem('k', 'v'); } catch {}`,
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
              task: `Predict where the event fires.`,
              description: `Checks storage event scope.`,
              code: `// Tab A: localStorage.setItem('x', '1')
window.onstorage = e => console.log(e.key);`,
              answer: `It fires in other tabs of the same origin, not in tab A that made the change.`,
            },
            {
              task: `Write a listener that syncs logout.`,
              description: `Checks cross-tab sync with storage events.`,
              code: `// Tab A logs out; tab B must follow.`,
              answer: `Listen for the key and react in other tabs.`,
              solution: `window.addEventListener('storage', e => {
  if (e.key === 'logout') location.assign('/login');
});`,
            },
            {
              easy: true,
              task: `True or false: it fires in the changing tab.`,
              description: `Checks storage event scope.`,
              code: `window.addEventListener('storage', fn);`,
              answer: `False; it fires only in other tabs of the same origin.`,
            },
            {
              easy: true,
              task: `Name the event property that holds the changed key.`,
              description: `Checks event fields.`,
              code: `addEventListener('storage', e => e.?)`,
              answer: `e.key holds the changed key.`,
              solution: `e.key`,
            },
          ],
        },
        {
          q: `When do you use IndexedDB instead of localStorage?`,
          short: `Use IndexedDB for large, structured, binary or queryable data and when you need async, non-blocking access, including from workers.`,
          long: `localStorage is synchronous, string-only and limited to about 5 MB.\nIndexedDB is asynchronous and stores structured-clone values: objects, Blobs, Files, typed arrays.\nIt supports indexes, key ranges, cursors and transactions.\nQuota is a share of disk (often gigabytes), managed by the browser.\nIt is available in Web Workers and Service Workers, unlike localStorage.\nThe raw API is verbose; small wrappers like idb make it pleasant.`,
          exercises: [
            {
              task: `Pick the storage for each case.`,
              description: `Checks matching storage to data size.`,
              code: `// a) theme name  b) 10k offline records  c) image blobs`,
              answer: `a) localStorage. b) and c) IndexedDB: it is async, large, and stores blobs and indexed objects.`,
            },
            {
              task: `Name a reason localStorage hurts speed.`,
              description: `Checks synchronous storage.`,
              answer: `It is synchronous, so big reads and writes block the main thread.`,
            },
            {
              easy: true,
              task: `True or false: localStorage reads are asynchronous.`,
              description: `Checks sync API.`,
              code: `localStorage.getItem('a');`,
              answer: `False; localStorage is synchronous and blocks the main thread.`,
            },
            {
              easy: true,
              task: `Pick the storage for large blobs.`,
              description: `Checks IndexedDB use.`,
              code: `// store a 50 MB file offline`,
              answer: `Use IndexedDB because localStorage is small and string-only.`,
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
              task: `Fix the bug.`,
              description: `Checks awaiting inside IndexedDB transactions.`,
              code: `const tx = db.transaction('s', 'readwrite');
const data = await fetch('/x').then(r => r.json());
tx.objectStore('s').put(data);`,
              answer: `The transaction auto-commits while fetch waits. Fetch first, then open the transaction.`,
              solution: `const data = await fetch('/x').then(r => r.json());
const tx = db.transaction('s', 'readwrite');
tx.objectStore('s').put(data);`,
            },
            {
              task: `Name a library that makes IndexedDB easier.`,
              description: `Checks promise wrappers for IndexedDB.`,
              answer: `idb by Jake Archibald wraps requests in promises. Dexie adds a query API.`,
            },
            {
              easy: true,
              task: `Name the callback style IndexedDB originally used.`,
              description: `Checks request events.`,
              code: `req.onsuccess = () => {};`,
              answer: `It uses events like onsuccess and onerror on request objects.`,
            },
            {
              easy: true,
              task: `Name the call that opens a database.`,
              description: `Checks indexedDB.open.`,
              code: `indexedDB.?('app', 1);`,
              answer: `indexedDB.open opens or creates a database.`,
              solution: `indexedDB.open('app', 1);`,
            },
          ],
        },
        {
          q: `When can the browser delete your stored data? How do you protect important offline data?`,
          short: `Storage is best-effort by default and can be evicted under pressure; navigator.storage.persist() requests persistent storage, and Safari also evicts script-written data after 7 days without user interaction.`,
          long: `Each origin gets a quota derived from disk size; data is "best-effort" unless persisted.\nUnder storage pressure browsers evict whole origins, least recently used first.\nnavigator.storage.persist() asks to mark the origin persistent; Chrome grants it heuristically, Firefox may prompt.\nSafari deletes script-writable storage after 7 days without user interaction, unless the site is an installed home-screen web app.\nEviction removes the origin's IndexedDB, Cache Storage and others together.\nTreat local data as a cache that can vanish, and keep a server copy of anything important.`,
          exercises: [
            {
              task: `Write code to request persistent storage.`,
              description: `Checks navigator.storage.persist.`,
              code: `// Offline drafts must not be evicted.`,
              answer: `persist asks the browser not to evict your data under storage pressure.`,
              solution: `const ok = await navigator.storage.persist();
console.log(ok ? 'persistent' : 'best effort');`,
            },
            {
              task: `Name when browsers delete stored data.`,
              description: `Checks eviction triggers.`,
              answer: `Under disk pressure, after long inactivity (Safari about 7 days for script storage), or when the user clears site data.`,
            },
            {
              easy: true,
              task: `Write the call to ask for persistence.`,
              description: `Checks persist API.`,
              code: `navigator.storage.?();`,
              answer: `navigator.storage.persist asks the browser not to evict data.`,
              solution: `navigator.storage.persist();`,
            },
            {
              easy: true,
              task: `Name the API that shows remaining quota.`,
              description: `Checks estimate.`,
              code: `navigator.storage.estimate();`,
              answer: `estimate returns usage and quota.`,
            },
          ],
        },
        {
          q: `What is storage partitioning? How does it change iframes and third-party cookies?`,
          short: `Modern browsers key third-party storage by the top-level site, so an iframe from a.com embedded on b.com and on c.com gets separate storage.`,
          long: `Partitioning keys storage by (top-level site, embedded origin) instead of origin alone.\nFirefox, Safari and Chrome partition localStorage, IndexedDB, Cache Storage and BroadcastChannel in third-party contexts.\nThird-party cookies are blocked by default in Safari and Firefox; Chrome still allows them by default with user controls.\nCHIPS (the Partitioned cookie attribute) gives an opt-in cookie per top-level site.\nThe Storage Access API lets an iframe request unpartitioned access after a user gesture.\nEmbedded widgets (chat, SSO, payments) must not assume shared state across sites.`,
          exercises: [
            {
              task: `Predict what the iframe sees.`,
              description: `Checks storage partitioning by top site.`,
              code: `// widget.com iframe on siteA.com and siteB.com
// both call localStorage.getItem('id')`,
              answer: `Different values. Storage is partitioned by top-level site, so the widget cannot share data across sites.`,
            },
            {
              task: `Name the cookie attribute for partitioned cookies.`,
              description: `Checks CHIPS.`,
              answer: `Partitioned, with Secure and SameSite=None. The cookie is keyed by the top-level site.`,
            },
            {
              easy: true,
              task: `True or false: iframe storage is shared across sites.`,
              description: `Checks partitioning.`,
              code: `// site A and B both embed widget.com`,
              answer: `False; storage is partitioned by top-level site.`,
            },
            {
              easy: true,
              task: `Name the cookie attribute that prevents cross-site sending.`,
              description: `Checks SameSite.`,
              code: `Set-Cookie: id=1; SameSite=?`,
              answer: `SameSite=Strict stops sending the cookie in cross-site requests.`,
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
              task: `Write a typed storage wrapper.`,
              description: `Checks a single storage access layer.`,
              answer: `One module handles keys, JSON, and errors.`,
              solution: `export const store = {
  get<T>(k: string, d: T): T { try { return JSON.parse(localStorage.getItem(k) ?? '') } catch { return d } },
  set(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} },
};`,
            },
            {
              task: `Name a way to stop direct localStorage use.`,
              description: `Checks enforcing the layer with lint.`,
              answer: `An ESLint no-restricted-globals or no-restricted-properties rule for localStorage, allowed only in the wrapper file.`,
            },
            {
              easy: true,
              task: `Write a safe read wrapper with a default.`,
              description: `Checks wrapper idea.`,
              code: `function get(k) {}`,
              answer: `Parse JSON inside try and return a default.`,
              solution: `function get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }`,
            },
            {
              easy: true,
              task: `Name one benefit of a shared storage layer.`,
              description: `Checks centralization.`,
              code: `storage.get('theme')`,
              answer: `One place for key names, errors, and later changes.`,
            },
          ],
        },
        {
          q: `This app checks every second if the user logged out in another tab. Redesign it.`,
          code: `setInterval(() => {
  if (!localStorage.getItem('session')) location.href = '/login';
}, 1000);`,
          short: `Use an event instead of polling: the storage event or BroadcastChannel tells other tabs right away. Keep the server as the source of truth.`,
          long: `Polling wastes CPU and battery and still has up to a second of delay.
The storage event fires in other tabs of the same origin when localStorage changes.
BroadcastChannel is a cleaner message bus between tabs: post "logout" and every tab reacts.
The session itself should be an HttpOnly cookie; tab messages only update the UI quickly.
Also handle the case where the server ends the session: any 401 response should trigger the same logout flow.
As a lead, put this in one shared auth module so teams do not write their own.
Strong answer: event-based sync, server as truth, one shared module.`,
          fix: `const channel = new BroadcastChannel('auth');
export function logout() {
  channel.postMessage({ type: 'logout' });
  handleLogout();
}
channel.onmessage = (e) => { if (e.data.type === 'logout') handleLogout(); };
function handleLogout() { clearUserData(); location.assign('/login'); }`,
          follow: `What should happen when an API call returns 401 in one tab?`,
          exercises: [
            {
              task: `Replace polling with BroadcastChannel.`,
              description: `Checks cross-tab messaging.`,
              code: `setInterval(() => {
  if (!localStorage.getItem('token')) logout();
}, 1000);`,
              answer: `Send a message on logout and react to it in other tabs.`,
              solution: `const ch = new BroadcastChannel('auth');
ch.onmessage = e => e.data === 'logout' && logout();
// on logout: ch.postMessage('logout');`,
            },
            {
              task: `Name a cost of polling every second.`,
              description: `Checks wasted work.`,
              answer: `Constant main-thread work and battery use in every open tab, plus up to one second delay.`,
            },
            {
              easy: true,
              task: `Create a channel named auth.`,
              description: `Checks BroadcastChannel.`,
              code: `const ch = ?`,
              answer: `Use new BroadcastChannel with a name.`,
              solution: `const ch = new BroadcastChannel('auth');`,
            },
            {
              easy: true,
              task: `Send a logout message.`,
              description: `Checks postMessage.`,
              code: `const ch = new BroadcastChannel('auth');`,
              answer: `Call postMessage on the channel.`,
              solution: `ch.postMessage('logout');`,
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
              task: `Name two rules for offline drafts.`,
              description: `Checks safe draft storage design.`,
              code: `// Long application form saved offline`,
              answer: `Store drafts in IndexedDB keyed by user, with a version and expiry, and delete them on logout or submit.`,
            },
            {
              task: `Write a debounced draft save.`,
              description: `Checks limiting storage writes.`,
              code: `form.addEventListener('input', save);`,
              answer: `Save after the user pauses, not on every key.`,
              solution: `let t;
form.addEventListener('input', () => {
  clearTimeout(t);
  t = setTimeout(save, 500);
});`,
            },
            {
              easy: true,
              task: `Name the event to save drafts on page hide.`,
              description: `Checks lifecycle events.`,
              code: `document.addEventListener('?', save);`,
              answer: `visibilitychange fires when the tab is hidden.`,
              solution: `visibilitychange`,
            },
            {
              easy: true,
              task: `Name data a draft should never store.`,
              description: `Checks sensitive data.`,
              code: `draft = { text, password }`,
              answer: `Passwords or tokens, since stored data is readable on the device.`,
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
              task: `Name the reasons this class would change.`,
              description: `Checks spotting multiple responsibilities.`,
              code: `class Invoice {
  total() {}
  toPdf() {}
  saveToDb() {}
}`,
              answer: `Math rules, PDF layout, and database. Three reasons to change, so split into three classes.`,
            },
            {
              task: `Split this component by responsibility.`,
              description: `Checks SRP in React.`,
              code: `function UserCard() {
  // fetches user, formats dates, renders card
}`,
              answer: `Move fetching into useUser, formatting into a helper, and keep UserCard for rendering only.`,
            },
            {
              easy: true,
              task: `Count the jobs of this function.`,
              description: `Checks SRP.`,
              code: `function save(u) {
  validate(u); api.post(u); showToast();
}`,
              answer: `It does three jobs: validate, send, and notify.`,
            },
            {
              easy: true,
              task: `True or false: SRP means one line per function.`,
              description: `Checks SRP meaning.`,
              code: `class Report {}`,
              answer: `False; it means one reason to change.`,
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
              task: `Refactor the repeated rule.`,
              description: `Checks extracting a shared function.`,
              code: `if (age >= 18 && country === 'US') {}
// same check in 2 other files`,
              answer: `Put the rule in one named function and reuse it.`,
              solution: `export const canApply = u => u.age >= 18 && u.country === 'US';`,
            },
            {
              task: `Replace the magic number.`,
              description: `Checks named constants.`,
              code: `if (file.size > 5242880) error();`,
              answer: `Name the value so it is clear and changed in one place.`,
              solution: `const MAX_FILE_BYTES = 5 * 1024 * 1024;
if (file.size > MAX_FILE_BYTES) error();`,
            },
            {
              easy: true,
              task: `Name the principle DRY stands for.`,
              description: `Checks DRY.`,
              code: `// DRY`,
              answer: `Don't Repeat Yourself: keep each rule in one place.`,
            },
            {
              easy: true,
              task: `Extract the repeated calculation.`,
              description: `Checks extract function.`,
              code: `const a = p * 1.2;
const b = q * 1.2;`,
              answer: `Put the tax rate in a named constant.`,
              solution: `const TAX = 1.2;
const a = p * TAX;`,
            },
          ],
        },
        {
          q: `What does "fail fast" mean in code?`,
          short: `Detect invalid input or state as early as possible and stop with a clear error instead of continuing with bad data.`,
          long: `Check preconditions at the start of a function.\nThrow or return early with a meaningful message.\nThis prevents errors surfacing far from their cause.\nGuard clauses also reduce nesting.\nIn UI, validate forms before submitting.\nDo not crash the whole app for user errors; show feedback instead.`,
          exercises: [
            {
              task: `Rewrite with guard clauses.`,
              description: `Checks early returns.`,
              code: `function save(u) {
  if (u) {
    if (u.email) { api.save(u); }
  }
}`,
              answer: `Return early on bad input to flatten the code.`,
              solution: `function save(u) {
  if (!u?.email) throw new Error('Email required');
  api.save(u);
}`,
            },
            {
              task: `Spot the silent failure.`,
              description: `Checks hidden errors.`,
              code: `try { init(); } catch {}`,
              answer: `The empty catch hides every error. Log it or rethrow, so problems show up early.`,
            },
            {
              easy: true,
              task: `Add a guard for null input.`,
              description: `Checks guard clause.`,
              code: `function len(s) {
  return s.length;
}`,
              answer: `Throw early when the input is invalid.`,
              solution: `if (s == null) throw new Error('s required');`,
            },
            {
              easy: true,
              task: `Name a way to fail fast on bad config.`,
              description: `Checks startup validation.`,
              code: `if (!process.env.API_URL) ?`,
              answer: `Throw at startup if a required setting is missing.`,
              solution: `throw new Error('API_URL missing');`,
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
              task: `Refactor the switch to a map.`,
              description: `Checks Open/Closed with a registry.`,
              code: `switch (fmt) {
  case 'csv': return toCsv(d);
  case 'json': return toJson(d);
}`,
              answer: `New formats are added to the map without editing logic.`,
              solution: `const exporters = { csv: toCsv, json: toJson };
return exporters[fmt](d);`,
            },
            {
              task: `Add a new format without changing code.`,
              description: `Checks extending through registration.`,
              code: `const exporters = { csv: toCsv };`,
              answer: `Register the new exporter; the export function stays closed for change.`,
              solution: `exporters.xml = toXml;`,
            },
            {
              easy: true,
              task: `Name the O in SOLID.`,
              description: `Checks OCP name.`,
              code: `// S O L I D`,
              answer: `Open/Closed: open for extension, closed for modification.`,
            },
            {
              easy: true,
              task: `Predict the cost of adding a case to a switch.`,
              description: `Checks OCP smell.`,
              code: `switch (type) { case 'a': ... }`,
              answer: `You must edit existing code, which risks breaking it.`,
            },
          ],
        },
        {
          q: `What is Dependency Inversion? Why does it help testing?`,
          short: `High-level logic should depend on abstractions, not concrete details; injecting dependencies lets tests pass fakes.`,
          long: `Without DI, business code imports fetch, Date or localStorage directly.\nTests then need global mocks and become brittle.\nPass dependencies as parameters, constructor args or context.\nThe abstraction is often just a function signature in JS/TS.\nA composition root wires real implementations at app start.\nDo not over-engineer with DI containers in small frontends.`,
          exercises: [
            {
              task: `Inject the dependency.`,
              description: `Checks dependency inversion for testing.`,
              code: `function getUsers() {
  return axios.get('/users');
}`,
              answer: `Pass the HTTP client in, so tests use a fake.`,
              solution: `const getUsers = (http = axios) => http.get('/users');`,
            },
            {
              task: `Write a fake for this test.`,
              description: `Checks fakes over mocks.`,
              code: `const getUsers = (http) => http.get('/users');`,
              answer: `A plain object with the same method works as a fake.`,
              solution: `const http = { get: async () => ({ data: [{ id: 1 }] }) };
expect((await getUsers(http)).data).toHaveLength(1);`,
            },
            {
              easy: true,
              task: `Name what you pass instead of creating inside.`,
              description: `Checks injection.`,
              code: `function f() { const api = new Api(); }`,
              answer: `Pass the dependency in as a parameter.`,
              solution: `function f(api) {}`,
            },
            {
              easy: true,
              task: `True or false: DIP says depend on abstractions.`,
              description: `Checks DIP meaning.`,
              code: `// D in SOLID`,
              answer: `True; high-level code should not depend on low-level details.`,
            },
          ],
        },
        {
          q: `What is the difference between coupling and cohesion?`,
          short: `Cohesion is how related the things inside a module are; coupling is how much modules depend on each other. Aim for high cohesion and low coupling.`,
          long: `High cohesion: a feature folder holds its UI, hooks and API calls together.\nLow coupling: modules interact through small, stable interfaces.\nTight coupling shows up as changes rippling across many files.\nShared mutable globals and deep imports into other features increase coupling.\nA public API per module reduces it.\nTools like dependency-cruiser can visualize and enforce boundaries.`,
          exercises: [
            {
              task: `Name the problem: coupling or cohesion?`,
              description: `Checks identifying low cohesion.`,
              code: `// utils.ts: formatDate, uploadFile, parseCsv, validateEmail`,
              answer: `Low cohesion: unrelated functions in one file. Group them by purpose, like date.ts and upload.ts.`,
            },
            {
              task: `Spot the tight coupling.`,
              description: `Checks knowledge of another module's internals.`,
              code: `cart.items.push(item);
cart.total += item.price;`,
              answer: `The caller changes cart internals directly. Use a cart.add(item) method that keeps total correct.`,
            },
            {
              easy: true,
              task: `True or false: high cohesion is good.`,
              description: `Checks cohesion.`,
              code: `// utils.js: dates, auth, colors`,
              answer: `True; related code belongs together in one module.`,
            },
            {
              easy: true,
              task: `True or false: high coupling is good.`,
              description: `Checks coupling.`,
              code: `import { x } from '../../other/deep';`,
              answer: `False; strong dependencies make changes ripple across modules.`,
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
              task: `Predict the area.`,
              description: `Checks Liskov violation.`,
              code: `const r = new Square();
r.setWidth(5);
r.setHeight(4);
console.log(r.area());`,
              answer: `16, not 20. Square changes both sides, so it breaks the Rectangle contract. Do not inherit; use a common Shape.`,
            },
            {
              task: `Spot the Liskov problem.`,
              description: `Checks subclasses that throw.`,
              code: `class ReadOnlyList extends List {
  add() { throw new Error('read only'); }
}`,
              answer: `Code using List expects add to work. Split into a readable interface and a writable one.`,
            },
            {
              easy: true,
              task: `Name the L in SOLID.`,
              description: `Checks LSP name.`,
              code: `// L in SOLID`,
              answer: `Liskov Substitution: subtypes must work wherever the base type does.`,
            },
            {
              easy: true,
              task: `Predict if this subclass is safe to substitute.`,
              description: `Checks LSP check.`,
              code: `class Bird { fly() {} }
class Penguin extends Bird { fly() { throw 1; } }`,
              answer: `No; code calling fly on a Bird breaks for Penguin.`,
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
              task: `Decide: share this helper across apps?`,
              description: `Checks DRY versus coupling.`,
              code: `// Same 5-line date helper in two apps`,
              answer: `Keep the copy. Sharing five lines adds a package dependency and coupling that costs more than the duplication.`,
            },
            {
              task: `Name a question to settle a principle conflict.`,
              description: `Checks reasoning about change.`,
              answer: `"Will these change for the same reason?" If yes, share; if no, duplicate.`,
            },
            {
              easy: true,
              task: `Name the cost of merging two similar helpers.`,
              description: `Checks wrong abstraction.`,
              code: `// formatA and formatB look alike`,
              answer: `They may change for different reasons and become tangled.`,
            },
            {
              easy: true,
              task: `True or false: duplication is always worse than coupling.`,
              description: `Checks trade-off.`,
              code: `// two similar helpers`,
              answer: `False; sometimes a little duplication is cheaper than wrong coupling.`,
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
              task: `Split this into a query and a command.`,
              description: `Checks Command-Query Separation.`,
              code: `function nextId() {
  return ++counter;
}`,
              answer: `Reading should not change state. Split read and write.`,
              solution: `const currentId = () => counter;
const incrementId = () => { counter++; };`,
            },
            {
              task: `Spot the CQS violation.`,
              description: `Checks getters with side effects.`,
              code: `get user() {
  this.loads++;
  return this._user;
}`,
              answer: `A getter that changes state surprises callers. Move the counter into an explicit method.`,
            },
            {
              easy: true,
              task: `Classify this function: query or command?`,
              description: `Checks CQS.`,
              code: `function getCount() { return items.length; }`,
              answer: `It is a query: it returns data and changes nothing.`,
            },
            {
              easy: true,
              task: `Classify this function: query or command?`,
              description: `Checks CQS command.`,
              code: `function add(i) { items.push(i); }`,
              answer: `It is a command: it changes state and returns nothing.`,
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
              task: `Write a lint rule for function size.`,
              description: `Checks enforcing complexity limits.`,
              answer: `ESLint can fail CI for complex or long functions.`,
              solution: `rules: {
  complexity: ['error', 10],
  'max-lines-per-function': ['warn', 60],
}`,
            },
            {
              task: `Name a tool to block circular imports.`,
              description: `Checks dependency checks in CI.`,
              answer: `madge --circular or eslint-plugin-import's import/no-cycle rule in CI.`,
            },
            {
              easy: true,
              task: `Name the tool that runs lint in CI.`,
              description: `Checks lint in CI.`,
              code: `- run: npx eslint .`,
              answer: `ESLint can fail the pipeline when a rule is broken.`,
            },
            {
              easy: true,
              task: `Write the ESLint rule for function length.`,
              description: `Checks max-lines-per-function.`,
              code: `rules: {}`,
              answer: `Use max-lines-per-function with a limit.`,
              solution: `rules: { 'max-lines-per-function': ['error', 50] }`,
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
              task: `Spot the problem with this helper.`,
              description: `Checks flag-driven shared code.`,
              code: `formatDate(d, { team: 'billing', legacy: true, short: false })`,
              answer: `Team flags show many teams changing one function. Split it into small focused helpers with an owner.`,
            },
            {
              task: `Name a process fix for a shared helper.`,
              description: `Checks ownership of shared code.`,
              answer: `Give it an owner in CODEOWNERS, add tests for each use, and require that owner's review on changes.`,
            },
            {
              easy: true,
              task: `Spot the smell in this call.`,
              description: `Checks boolean flag parameters.`,
              code: `render(item, true, false, true)`,
              answer: `Unnamed boolean flags are unreadable; use an options object or separate functions.`,
            },
            {
              easy: true,
              task: `Name one rule for a shared helper.`,
              description: `Checks change safety.`,
              code: `// Scenario: 5 teams import formatValue; you edit it.`,
              answer: `Add tests for current behavior first, so edits do not break other teams.`,
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
              task: `Spot the over-engineering.`,
              description: `Checks needless abstraction layers.`,
              code: `UserController -> UserService -> UserManager
  -> UserRepository -> UserApiAdapter -> fetch`,
              answer: `Five layers just wrap one fetch. Start with a simple service and add layers when a real need appears.`,
            },
            {
              task: `Name how you start the talk with him.`,
              description: `Checks respectful technical disagreement.`,
              code: `// Senior dev insists layers are needed for SOLID`,
              answer: `Ask which concrete change each layer makes easier, then agree on a simpler version and revisit when needs grow.`,
            },
            {
              easy: true,
              task: `Name the principle against needless layers.`,
              description: `Checks YAGNI.`,
              code: `// Scenario: one payment provider, but 4 abstraction layers.`,
              answer: `YAGNI: do not add abstraction before a real second use case exists.`,
            },
            {
              easy: true,
              task: `Decide: keep or remove this wrapper.`,
              description: `Checks useless indirection.`,
              code: `const getUser = (id) => userService.getUser(id);`,
              answer: `Remove it; it adds a layer without adding behavior.`,
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
              task: `Fix the state mutation.`,
              description: `Checks immutable updates in React.`,
              code: `const add = item => {
  items.push(item);
  setItems(items);
};`,
              answer: `Same array reference, so React may not re-render. Create a new array.`,
              solution: `const add = item => setItems(prev => [...prev, item]);`,
            },
            {
              task: `Predict the output.`,
              description: `Checks that const does not freeze objects.`,
              code: `const user = { name: 'Ann' };
user.name = 'Bob';
console.log(user.name);`,
              answer: `"Bob". const stops reassignment, not changes to the object. Use Object.freeze for shallow immutability.`,
            },
            {
              easy: true,
              task: `Predict the output.`,
              description: `Checks object mutation.`,
              code: `const a = { n: 1 };
const b = a;
b.n = 2;
console.log(a.n);`,
              answer: `It prints 2, because both names point to the same object.`,
            },
            {
              easy: true,
              task: `Fix the mutation with spread.`,
              description: `Checks immutable update.`,
              code: `const user = { name: 'Ann' };
user.name = 'Bob';`,
              answer: `Create a copy instead of changing the original.`,
              solution: `const next = { ...user, name: 'Bob' };`,
            },
          ],
        },
        {
          q: `Why does this map return a list of undefined values?`,
          code: `const names = users.map((u) => {
  u.name.toUpperCase();
});`,
          short: `An arrow function with curly braces needs an explicit return. Without it, each call returns undefined.`,
          long: `An arrow function with a body in braces is a normal block, so it returns undefined unless you write return.
Without braces, the expression is returned automatically.
To return an object without braces, wrap it in parentheses: (u) => ({ id: u.id }).
Linters catch this with array-callback-return.
Strong answer: knows both arrow forms and the object literal trap.`,
          fix: `const names = users.map((u) => u.name.toUpperCase());`,
          follow: `What does (u) => { id: u.id } return, and why?`,
          exercises: [
            {
              task: `Fix the bug.`,
              description: `Checks missing return in arrow function body.`,
              code: `const names = users.map(u => { u.name; });`,
              answer: `Curly braces need return. Use an expression body.`,
              solution: `const names = users.map(u => u.name);`,
            },
            {
              task: `Predict the output.`,
              description: `Checks returning object literals from arrows.`,
              code: `const r = [1, 2].map(n => { id: n });
console.log(r);`,
              answer: `[undefined, undefined]. Braces are read as a block with a label. Wrap the object in parentheses.`,
              solution: `const r = [1, 2].map(n => ({ id: n }));`,
            },
            {
              easy: true,
              task: `Fix the map callback.`,
              description: `Checks missing return.`,
              code: `const up = names.map((n) => { n.toUpperCase(); });`,
              answer: `Braces need an explicit return, otherwise the callback returns undefined.`,
              solution: `const up = names.map((n) => n.toUpperCase());`,
            },
            {
              easy: true,
              task: `Predict the result.`,
              description: `Checks arrow without braces.`,
              code: `[1, 2].map((x) => x * 2)`,
              answer: `It gives [2, 4], since an arrow without braces returns its expression.`,
            },
          ],
        },
        {
          q: `What is a side effect? Give some frontend examples.`,
          short: `A side effect is any observable interaction beyond returning a value: network calls, DOM changes, logging, storage, timers or mutating outside variables.`,
          long: `Pure functions return the same output for the same input with no side effects.\nSide effects are necessary; the goal is to isolate them.\nExamples: fetch, document.title changes, localStorage, console.log, Math.random, Date.now.\nKeep business logic pure and push effects to edges (event handlers, effects, services).\nPure code is easy to test without mocks.`,
          exercises: [
            {
              task: `Name the side effects in this function.`,
              description: `Checks recognizing side effects.`,
              code: `function save(u) {
  console.log('save');
  localStorage.setItem('u', JSON.stringify(u));
  return fetch('/u', { method: 'POST' });
}`,
              answer: `Logging, writing storage, and a network request. All change the outside world.`,
            },
            {
              task: `Is this function pure?`,
              description: `Checks randomness as a side effect.`,
              code: `const makeId = () => Math.random().toString(36).slice(2);`,
              answer: `No. It returns a different value each call. Pass the random source in to make it testable.`,
            },
            {
              easy: true,
              task: `Is this function pure? Say why.`,
              description: `Checks side effect basics.`,
              code: `let n = 0;
const inc = () => ++n;`,
              answer: `No, it changes outside state, so it has a side effect.`,
            },
            {
              easy: true,
              task: `Name the side effect.`,
              description: `Checks DOM side effects.`,
              code: `const show = (t) => { document.title = t; };`,
              answer: `It writes to the DOM, which lives outside the function.`,
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
              task: `Fix the crash on empty arrays.`,
              description: `Checks reduce initial value.`,
              code: `const max = nums.reduce((a, b) => Math.max(a, b));`,
              answer: `reduce with no initial value throws on []. Give a start value.`,
              solution: `const max = nums.reduce((a, b) => Math.max(a, b), -Infinity);`,
            },
            {
              task: `Fix the bug.`,
              description: `Checks returning the accumulator.`,
              code: `const byId = list.reduce((acc, x) => {
  acc[x.id] = x;
}, {});`,
              answer: `The callback returns undefined, so acc is lost. Return acc.`,
              solution: `const byId = list.reduce((acc, x) => {
  acc[x.id] = x;
  return acc;
}, {});`,
            },
            {
              easy: true,
              task: `Predict the result.`,
              description: `Checks reduce on empty array.`,
              code: `[].reduce((a, b) => a + b)`,
              answer: `It throws a TypeError, because there is no initial value.`,
            },
            {
              easy: true,
              task: `Add the missing argument.`,
              description: `Checks reduce initial value.`,
              code: `const sum = [].reduce((a, b) => a + b);`,
              answer: `Pass an initial value as second argument, so empty arrays return it.`,
              solution: `const sum = [].reduce((a, b) => a + b, 0);`,
            },
          ],
        },
        {
          q: `What is point-free style? When does it help, and when does it hurt readability?`,
          short: `Point-free style defines functions by combining other functions without naming the arguments. It is clean for short pipelines but hard to read and debug when overused.`,
          long: `Point-free means you do not mention the data: const getNames = map(prop('name')) instead of (users) => users.map((u) => u.name).
It helps when small, well-named functions are joined in a pipe and the flow reads like steps.
It hurts when the reader must guess argument order, when currying hides how many arguments a function takes, or when stack traces show only anonymous helpers.
Passing a function directly can also be a bug: ['1','2'].map(parseInt) gives wrong values because map passes extra arguments.
Strong answer: uses it for short pipelines and names arguments when it makes code clearer.`,
          follow: `Why is passing a function directly to map sometimes a bug?`,
          exercises: [
            {
              task: `Rewrite in point-free style.`,
              description: `Checks passing functions directly.`,
              code: `const ids = users.map(u => getId(u));`,
              answer: `Pass the function itself, since it takes one argument.`,
              solution: `const ids = users.map(getId);`,
            },
            {
              task: `Predict the output.`,
              description: `Checks point-free pitfalls with extra arguments.`,
              code: `console.log(['1', '2', '3'].map(Number));`,
              answer: `[1, 2, 3]. Number takes one argument, so this is safe, unlike map(parseInt).`,
            },
            {
              easy: true,
              task: `Rewrite in point-free style.`,
              description: `Checks passing function directly.`,
              code: `ids.map((id) => String(id))`,
              answer: `Pass the function itself: ids.map(String).`,
              solution: `ids.map(String)`,
            },
            {
              easy: true,
              task: `Say when point-free hurts.`,
              description: `Checks readability tradeoff.`,
              code: `const f = compose(map(g), filter(h), flip(k));`,
              answer: `It hurts when the chain is long, because arguments and intent are hidden.`,
            },
          ],
        },
        {
          q: `How do you handle errors in a functional way, without throwing?`,
          short: `Return a result value like { ok: true, value } | { ok: false, error } so callers must handle failure explicitly and types document it.`,
          long: `Exceptions are invisible in function signatures.\nA Result/Either type makes failure part of the return value.\nIn TS a discriminated union works without libraries.\nCompose with helpers like map and andThen, or early returns.\nKeep throwing for truly unexpected bugs.\nAt boundaries (fetch, JSON.parse) convert exceptions to Results.`,
          exercises: [
            {
              task: `Write a safe JSON parse that returns a result.`,
              description: `Checks returning errors as values.`,
              code: `const safeParse = s => { /* return { ok, value | error } */ };`,
              answer: `Return an object that says ok or error instead of throwing.`,
              solution: `const safeParse = s => {
  try { return { ok: true, value: JSON.parse(s) }; }
  catch (error) { return { ok: false, error }; }
};`,
            },
            {
              task: `Use the result without try/catch.`,
              description: `Checks handling a Result type.`,
              code: `const r = safeParse(input);`,
              answer: `Check the ok flag, so TypeScript narrows the type.`,
              solution: `if (r.ok) render(r.value);
else showError(r.error.message);`,
            },
            {
              easy: true,
              task: `Name a non-throwing return shape.`,
              description: `Checks result object.`,
              code: `const parse = (s) => ({ ok: true, value: JSON.parse(s) });`,
              answer: `Return { ok, value } or { ok, error }, so callers need no try/catch.`,
            },
            {
              easy: true,
              task: `Predict the output.`,
              description: `Checks error as value.`,
              code: `const r = Number('x');
console.log(Number.isNaN(r));`,
              answer: `It prints true; Number returns NaN instead of throwing.`,
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
              task: `Predict the output.`,
              description: `Checks map passing the index to parseInt.`,
              code: `console.log(['10', '10', '10'].map(parseInt));`,
              answer: `[10, NaN, 2]. map passes the index as radix: radix 1 is invalid and "10" in base 2 is 2.`,
              solution: `['10', '10', '10'].map(s => parseInt(s, 10));`,
            },
            {
              task: `Predict the output.`,
              description: `Checks extra arguments with filter(Boolean).`,
              code: `console.log([0, 1, '', 'a', null].filter(Boolean));`,
              answer: `[1, 'a']. Boolean drops all falsy values, including 0 and the empty string.`,
            },
            {
              easy: true,
              task: `Predict the output.`,
              description: `Checks map extra arguments.`,
              code: `['a', 'b'].map((x, i) => i)`,
              answer: `It gives [0, 1], because map passes the index as second argument.`,
            },
            {
              easy: true,
              task: `Fix the parseInt call.`,
              description: `Checks safe parsing.`,
              code: `['1', '2', '3'].map(parseInt)`,
              answer: `Wrap it and pass radix 10, so the index is not used as radix.`,
              solution: `['1', '2', '3'].map((s) => parseInt(s, 10))`,
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
              task: `Spot the impure render.`,
              description: `Checks side effects during render.`,
              code: `function Clock() {
  document.title = 'Now';
  return <p>{Date.now()}</p>;
}`,
              answer: `Render changes the document and reads time. Move the title update into useEffect.`,
            },
            {
              task: `Fix the reducer.`,
              description: `Checks pure reducers.`,
              code: `function reducer(s, a) {
  s.count++;
  return s;
}`,
              answer: `It mutates state, so React sees the same object. Return a new object.`,
              solution: `function reducer(s, a) {
  return { ...s, count: s.count + 1 };
}`,
            },
            {
              easy: true,
              task: `True or false: React components should be pure.`,
              description: `Checks render purity.`,
              answer: `True: same props and state should give the same JSX, without side effects in render.`,
            },
            {
              easy: true,
              task: `Name the place for a side effect.`,
              description: `Checks useEffect.`,
              code: `function A() { document.title = 'Hi'; return null; }`,
              answer: `Move the DOM write into useEffect, not the render body.`,
            },
          ],
        },
        {
          q: `What is lazy evaluation with generators? When is it better than array methods?`,
          short: `Generators produce values on demand, so pipelines over large or infinite sequences avoid intermediate arrays and can stop early.`,
          long: `arr.map().filter().slice(0, 5) builds full intermediate arrays.\nA generator pipeline processes one item at a time through all steps.\nIt stops as soon as enough results are produced.\nIterator helpers (Iterator.prototype.map/filter/take) ship in current Chrome, Firefox and Safari.\nFor small arrays, plain array methods are faster and clearer.\nAsync generators help with paginated APIs.`,
          exercises: [
            {
              task: `Write a generator for numbers from 1 up.`,
              description: `Checks infinite lazy sequences.`,
              code: `// naturals() yields 1, 2, 3, ... forever`,
              answer: `A generator yields values only when asked, so infinite is safe.`,
              solution: `function* naturals() {
  let n = 1;
  while (true) yield n++;
}`,
            },
            {
              task: `Take the first three values lazily.`,
              description: `Checks iterator helpers.`,
              code: `const it = naturals();`,
              answer: `Iterator helpers like take work lazily in modern browsers.`,
              solution: `console.log(naturals().take(3).toArray()); // [1, 2, 3]`,
            },
            {
              easy: true,
              task: `Predict the output.`,
              description: `Checks generator laziness.`,
              code: `function* g() { console.log('a'); yield 1; }
const it = g();`,
              answer: `Nothing prints yet; the body runs only on the first next() call.`,
            },
            {
              easy: true,
              task: `Complete the call to get the first value.`,
              description: `Checks next().`,
              code: `function* g() { yield 5; }
const it = g();
it.___`,
              answer: `Call it.next().value; it returns 5.`,
              solution: `it.next().value`,
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
              task: `Split the pure logic from the side effects.`,
              description: `Checks functional core, imperative shell.`,
              code: `async function apply() {
  const app = await api.get();
  if (app.score > 80) await api.admit(app.id);
}`,
              answer: `Extract the decision as a pure function; keep the API calls in a thin outer function.`,
              solution: `const shouldAdmit = app => app.score > 80;
async function apply() {
  const app = await api.get();
  if (shouldAdmit(app)) await api.admit(app.id);
}`,
            },
            {
              task: `Write a test for the pure part.`,
              description: `Checks testing pure logic without mocks.`,
              code: `const shouldAdmit = app => app.score > 80;`,
              answer: `No mocks needed: pass data, check output.`,
              solution: `expect(shouldAdmit({ score: 81 })).toBe(true);
expect(shouldAdmit({ score: 80 })).toBe(false);`,
            },
            {
              easy: true,
              task: `Extract the pure part.`,
              description: `Checks pure decision logic.`,
              code: `const canApprove = (app) => app.score > 80;`,
              answer: `A pure function that only reads input and returns a boolean is easy to test.`,
            },
            {
              easy: true,
              task: `Name what stays in the thin layer.`,
              description: `Checks side effect layer.`,
              code: `await api.post('/approve', { id });`,
              answer: `Network calls stay in the thin outer layer; the core stays pure.`,
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
              task: `Spot the readability problem.`,
              description: `Checks overly clever FP code.`,
              code: `const f = compose(map(prop('n')), filter(propEq('a', true)));`,
              answer: `Hard to read for most of the team. Plain filter and map with arrows says the same thing clearly.`,
              solution: `const f = list => list.filter(x => x.a).map(x => x.n);`,
            },
            {
              task: `Write a short team rule for FP style.`,
              description: `Checks practical style guidance.`,
              answer: `Prefer pure functions and immutable updates; avoid point-free chains longer than two steps and custom FP helpers.`,
            },
            {
              easy: true,
              task: `Pick the clearer line.`,
              description: `Checks readability rule.`,
              code: `a) arr.map(f).filter(g)
b) compose(filter(g), map(f))(arr)`,
              answer: `Prefer a), because plain method chains are readable for the whole team.`,
            },
            {
              easy: true,
              task: `Name a lint rule helping functional code.`,
              description: `Checks tooling.`,
              code: `// Scenario: team bans array mutation.`,
              answer: `Use no-param-reassign or an immutability lint rule, so it is checked automatically.`,
            },
          ],
        },
        {
          q: `Should the whole company use an immutable data library, like Immer or Immutable.js?`,
          short: `Immer usually wins: plain objects, structural sharing and mutation-like syntax; Immutable.js adds custom types that leak across the codebase.`,
          long: `Manual spreading of deep updates is verbose and error-prone.\nImmer lets you write mutations on a draft and produces a new immutable object.\nRedux Toolkit already uses Immer.\nImmutable.js uses its own collections, needs toJS conversions and has low activity.\nThe native Records and Tuples proposal was withdrawn.\nMeasure overhead in hot paths; Immer has some cost for large drafts.`,
          exercises: [
            {
              task: `Rewrite this update with Immer.`,
              description: `Checks Immer produce.`,
              code: `setUser(u => ({ ...u, address: { ...u.address, city: 'Kyiv' } }));`,
              answer: `Immer lets you write a mutation on a draft and returns a new object.`,
              solution: `setUser(produce(d => { d.address.city = 'Kyiv'; }));`,
            },
            {
              task: `Name a reason not to adopt Immutable.js.`,
              description: `Checks library trade-offs.`,
              answer: `It uses its own data types, so you convert to plain objects at every boundary. Immer works with plain objects.`,
            },
            {
              easy: true,
              task: `Name a built-in way to copy immutably.`,
              description: `Checks no library needed.`,
              code: `const next = { ...state, count: 1 };`,
              answer: `Spread copies are enough for small state; add Immer only for deep nesting.`,
            },
            {
              easy: true,
              task: `State what Immer lets you write.`,
              description: `Checks Immer idea.`,
              code: `produce(state, (d) => { d.items.push(x); });`,
              answer: `You write mutating code on a draft, and Immer returns a new immutable object.`,
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
              task: `Predict the output.`,
              description: `Checks class instances are separate objects.`,
              code: `class Dog { name = 'Rex'; }
const a = new Dog(), b = new Dog();
a.name = 'Max';
console.log(b.name, a === b);`,
              answer: `Rex false. Each new call makes a separate object from the class blueprint.`,
            },
            {
              task: `Predict the output.`,
              description: `Checks that classes are functions.`,
              code: `class A {}
console.log(typeof A, typeof new A());`,
              answer: `"function" and "object". A class is a special function; an instance is an object.`,
            },
            {
              easy: true,
              task: `Name the class and the object.`,
              description: `Checks class vs instance.`,
              code: `class Dog {}
const rex = new Dog();`,
              answer: `Dog is the class (blueprint); rex is an object (instance) made from it.`,
            },
            {
              easy: true,
              task: `Predict the output.`,
              description: `Checks instanceof.`,
              code: `class A {}
console.log(new A() instanceof A);`,
              answer: `It prints true, because the object was created by that class.`,
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
              task: `Fix the bug.`,
              description: `Checks calling super before this.`,
              code: `class Admin extends User {
  constructor(name) {
    this.role = 'admin';
    super(name);
  }
}`,
              answer: `this is not ready until super runs. Call super first.`,
              solution: `constructor(name) {
  super(name);
  this.role = 'admin';
}`,
            },
            {
              task: `Predict the output.`,
              description: `Checks calling the parent method with super.`,
              code: `class A { hi() { return 'A'; } }
class B extends A { hi() { return super.hi() + 'B'; } }
console.log(new B().hi());`,
              answer: `"AB". super.hi() calls the parent method, then B adds its part.`,
            },
            {
              easy: true,
              task: `Predict the error.`,
              description: `Checks super before this.`,
              code: `class B extends A { constructor() { this.x = 1; } }`,
              answer: `ReferenceError: you must call super() before using this in a subclass.`,
            },
            {
              easy: true,
              task: `Add the missing line.`,
              description: `Checks super call.`,
              code: `class B extends A { constructor() { /* ? */ this.x = 1; } }`,
              answer: `Call super() first, so the parent constructor sets up this.`,
              solution: `super();`,
            },
          ],
        },
        {
          q: `What is encapsulation? How do private fields with a hash sign help?`,
          short: `Encapsulation hides internal state behind methods; #private fields are truly inaccessible outside the class.`,
          long: `Encapsulation protects invariants by controlling how state changes.\nThe old _underscore convention is only a hint.\n#field syntax is enforced by the engine.\nAccessing obj.#field outside the class is a SyntaxError.\nPrivate methods (#method) and static privates also exist.\nUse getters to expose read-only views.`,
          exercises: [
            {
              task: `Predict the result.`,
              description: `Checks private field access.`,
              code: `class Bank { #balance = 10; }
console.log(new Bank().#balance);`,
              answer: `SyntaxError. #balance can only be used inside the class body.`,
            },
            {
              task: `Add a safe way to read the balance.`,
              description: `Checks getters with private fields.`,
              code: `class Bank { #balance = 10; }`,
              answer: `Expose a getter but no setter, so outside code cannot change it.`,
              solution: `class Bank {
  #balance = 10;
  get balance() { return this.#balance; }
}`,
            },
            {
              easy: true,
              task: `Predict the output.`,
              description: `Checks private field access.`,
              code: `class A { #x = 1; }
console.log(new A().x);`,
              answer: `It prints undefined; #x is private and a different name than x.`,
            },
            {
              easy: true,
              task: `Spot the syntax error.`,
              description: `Checks private access outside.`,
              code: `class A { #x = 1; }
new A().#x;`,
              answer: `Accessing #x outside the class is a SyntaxError.`,
            },
          ],
        },
      ],
      middle: [
        {
          q: `This class shows its inner list to callers. Callers can break it. Fix the encapsulation.`,
          code: `class Cart {
  items = [];
  add(item) { this.items.push(item); this.total += item.price; }
  total = 0;
}
const cart = new Cart();
cart.add({ price: 10 });
cart.items.push({ price: 99 }); // total is now wrong`,
          short: `Make the state private, change it only through methods, and return a copy or a read-only view. Better still, compute total from items.`,
          long: `Public fields let any caller change the state and skip the rules in add.
Here a direct push makes items and total disagree.
Use private fields (#items), expose a read-only copy, and keep all changes inside methods.
Derived data like total should be computed, not stored, so it can never get out of sync.
Strong answer: protects invariants, removes duplicated state, and keeps the public API small.`,
          fix: `class Cart {
  #items = [];
  add(item) { this.#items.push(item); }
  get items() { return [...this.#items]; }
  get total() { return this.#items.reduce((s, i) => s + i.price, 0); }
}`,
          follow: `When is returning a copy too slow, and what can you do instead?`,
          exercises: [
            {
              task: `Fix the encapsulation leak.`,
              description: `Checks returning internal arrays.`,
              code: `class Cart {
  #items = [];
  get items() { return this.#items; }
}`,
              answer: `Callers can push into the private array. Return a copy or a read-only view.`,
              solution: `get items() { return [...this.#items]; }`,
            },
            {
              task: `Predict the output.`,
              description: `Checks Object.freeze is shallow.`,
              code: `const cfg = Object.freeze({ list: [1] });
cfg.list.push(2);
console.log(cfg.list);`,
              answer: `[1, 2]. freeze is shallow: the inner array can still change.`,
            },
            {
              easy: true,
              task: `Make items private.`,
              description: `Checks hash private field.`,
              code: `class Cart { items = []; }`,
              answer: `Use a hash prefix, so outside code cannot touch the list.`,
              solution: `class Cart { #items = []; }`,
            },
            {
              easy: true,
              task: `Return a safe copy.`,
              description: `Checks getter with copy.`,
              code: `get items() { return this.#items; }`,
              answer: `Return a copy, so callers cannot mutate the internal array.`,
              solution: `get items() { return [...this.#items]; }`,
            },
          ],
        },
        {
          q: `What is polymorphism? Give a frontend example.`,
          short: `Polymorphism lets different objects respond to the same interface in their own way, so calling code does not branch on type.`,
          long: `Example: payment methods each implement pay(amount).\nCheckout calls method.pay() without knowing if it is card or PayPal.\nIn JS it is duck typing; in TS, interfaces make it explicit.\nIt replaces switch statements on type.\nIn React, components receiving the same props shape are polymorphic too.\nOveruse creates indirection; use it where variants are real.`,
          exercises: [
            {
              task: `Replace the if chain with polymorphism.`,
              description: `Checks shared method interface.`,
              code: `if (n.type === 'email') sendEmail(n);
else if (n.type === 'sms') sendSms(n);`,
              answer: `Give each notifier the same send method and call it.`,
              solution: `const notifiers = { email: new EmailNotifier(), sms: new SmsNotifier() };
notifiers[n.type].send(n);`,
            },
            {
              task: `Predict the output.`,
              description: `Checks method overriding.`,
              code: `class A { name() { return 'A'; } }
class B extends A { name() { return 'B'; } }
const list = [new A(), new B()];
console.log(list.map(x => x.name()));`,
              answer: `['A', 'B']. Each object uses its own class method.`,
            },
            {
              easy: true,
              task: `Predict the output.`,
              description: `Checks method overriding.`,
              code: `class A { hi() { return 'a'; } }
class B extends A { hi() { return 'b'; } }
console.log(new B().hi());`,
              answer: `It prints 'b'; the subclass method replaces the parent one.`,
            },
            {
              easy: true,
              task: `Name the polymorphism here.`,
              description: `Checks same call different behavior.`,
              code: `[new Cat(), new Dog()].forEach((a) => a.speak());`,
              answer: `One call, speak(), behaves differently per object type.`,
            },
          ],
        },
        {
          q: `What are static members? When should you use them?`,
          short: `Static members belong to the class itself, not instances; use them for factories, constants and utilities tied to the class.`,
          long: `Declared with static, accessed as ClassName.member.\nGood for factory methods like User.fromJSON(data).\nStatic blocks (static {}) run once for complex initialization.\nStatic state is shared globally, which complicates tests.\nA class with only static methods is usually better as a module of functions.\nthis inside a static method refers to the class (subclasses too).`,
          exercises: [
            {
              task: `Predict the output.`,
              description: `Checks static members belong to the class.`,
              code: `class Id { static count = 0; }
const i = new Id();
console.log(Id.count, i.count);`,
              answer: `0 undefined. Static fields live on the class, not on instances.`,
            },
            {
              task: `Write a static factory method.`,
              description: `Checks a good use of static methods.`,
              code: `class Money { constructor(cents) { this.cents = cents; } }`,
              answer: `A static factory gives a clear name for creating instances.`,
              solution: `class Money {
  constructor(cents) { this.cents = cents; }
  static fromDollars(d) { return new Money(Math.round(d * 100)); }
}`,
            },
            {
              easy: true,
              task: `Predict the output.`,
              description: `Checks static call on instance.`,
              code: `class A { static hi() { return 1; } }
console.log(new A().hi);`,
              answer: `It prints undefined; static methods live on the class, not instances.`,
            },
            {
              easy: true,
              task: `Call the static method.`,
              description: `Checks static access.`,
              code: `class Id { static next() { return 1; } }`,
              answer: `Call it on the class itself.`,
              solution: `Id.next();`,
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
              task: `Rewrite with composition.`,
              description: `Checks combining behaviors instead of subclasses.`,
              code: `class Button {}
class IconButton extends Button {}
class LoadingIconButton extends IconButton {}`,
              answer: `Use props or small parts that combine freely.`,
              solution: `<Button icon={<SaveIcon />} loading={saving}>Save</Button>`,
            },
            {
              task: `Name a problem with deep inheritance.`,
              description: `Checks fragile base class risk.`,
              answer: `A change in the base class can break every subclass, and combinations of features need new classes.`,
            },
            {
              easy: true,
              task: `Name the principle.`,
              description: `Checks composition over inheritance.`,
              answer: `Prefer composition over inheritance: combine small parts instead of deep class trees.`,
            },
            {
              easy: true,
              task: `Compose instead of extend.`,
              description: `Checks has-a.`,
              code: `class Button { constructor(icon) { this.icon = icon; } }`,
              answer: `Pass the icon as a part, so Button has an icon instead of being IconButton.`,
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
              task: `Add an unsubscribe function.`,
              description: `Checks cleanup in the Observer pattern.`,
              code: `subscribe(fn) {
  this.subs.push(fn);
}`,
              answer: `Return a function that removes the listener.`,
              solution: `subscribe(fn) {
  this.subs.add(fn);
  return () => this.subs.delete(fn);
}`,
            },
            {
              task: `Use the subscription in React.`,
              description: `Checks cleanup in useEffect.`,
              code: `useEffect(() => {
  store.subscribe(setValue);
}, []);`,
              answer: `Without cleanup, each mount adds a listener and leaks. Return the unsubscribe.`,
              solution: `useEffect(() => store.subscribe(setValue), []);`,
            },
            {
              easy: true,
              task: `Return an unsubscribe function.`,
              description: `Checks subscribe return.`,
              code: `subscribe(fn) { this.listeners.push(fn); }`,
              answer: `Return a function that removes fn from the list.`,
              solution: `return () => { this.listeners = this.listeners.filter((l) => l !== fn); };`,
            },
            {
              easy: true,
              task: `Name the leak.`,
              description: `Checks forgotten unsubscribe.`,
              code: `useEffect(() => { store.subscribe(fn); }, []);`,
              answer: `Without cleanup the listener stays forever; return the unsubscribe from the effect.`,
            },
          ],
        },
        {
          q: `What is the difference between a value object and an entity? Where do they help on the frontend?`,
          short: `An entity has an identity that stays the same when its data changes, like a user with an id. A value object is defined only by its values, is immutable, and two equal values are the same, like Money or a DateRange.`,
          long: `Entity: compared by id. A user who changes the email is still the same user.
Value object: compared by value, immutable, and it checks its own rules when created.
Examples on the frontend: Money (amount + currency), EmailAddress, DateRange where start must be before end.
Benefits: rules live in one place, invalid values cannot exist, no bugs from adding euros to dollars.
In React, immutable values also work well with memo and equality checks.
Strong answer: gives concrete examples and shows how a value object removes repeated validation.`,
          follow: `How do you compare two value objects in JavaScript, since === compares references?`,
          exercises: [
            {
              task: `Name each: entity or value object?`,
              description: `Checks identity versus value equality.`,
              code: `// Applicant { id, name }
// Money { amount, currency }`,
              answer: `Applicant is an entity, known by id. Money is a value object, equal when its values are equal.`,
            },
            {
              task: `Write an equals method for Money.`,
              description: `Checks value-based equality.`,
              code: `class Money { constructor(amount, cur) { Object.assign(this, { amount, cur }); } }`,
              answer: `Compare values, not references.`,
              solution: `equals(o) {
  return this.amount === o.amount && this.cur === o.cur;
}`,
            },
            {
              easy: true,
              task: `Predict the result.`,
              description: `Checks value equality idea.`,
              code: `const a = { x: 1 };
const b = { x: 1 };
console.log(a === b);`,
              answer: `It prints false; objects compare by reference, not by value.`,
            },
            {
              easy: true,
              task: `Entity or value object: user id 42?`,
              description: `Checks identity.`,
              code: `// Scenario: two users share the same name and age.`,
              answer: `An entity: it has an id, so equal data still means different users.`,
            },
          ],
        },
      ],
      techlead: [
        {
          q: `You build a shared library used by many teams. How do you design its public API so you can change the inside later without breaking anyone?`,
          short: `Keep the public surface small and explicit, hide internals, follow semantic versioning, deprecate before removing, and test the public API as a contract.`,
          long: `Everything you export becomes a promise. Export only what users need, from one entry point.
Hide internals with private fields, non-exported modules and the package exports field.
Prefer options objects over long positional arguments, so you can add options without breaking calls.
Use semantic versioning: breaking changes only in a major release, with a changelog and a codemod if possible.
Deprecate first: warn in development, document the replacement, remove in the next major.
Test the public API and check type changes with tools like API Extractor.
Strong answer: covers surface size, versioning, deprecation and automatic checks.`,
          follow: `How do you find out which teams use a function you want to remove?`,
          exercises: [
            {
              task: `Write a package.json exports map.`,
              description: `Checks limiting a library's public API.`,
              code: `// Hide dist/internal/* from consumers`,
              answer: `exports hides internal files, so you can change them freely.`,
              solution: `"exports": {
  ".": "./dist/index.js",
  "./button": "./dist/button.js"
}`,
            },
            {
              task: `Name a safe way to remove an old option.`,
              description: `Checks deprecation process.`,
              answer: `Mark it @deprecated with a warning in one minor version, then remove it in the next major version.`,
            },
            {
              easy: true,
              task: `Name what to export.`,
              description: `Checks public API surface.`,
              code: `// Scenario: library has index.js and many internal files.`,
              answer: `Export only from one index file, so internal files can change freely.`,
            },
            {
              easy: true,
              task: `Pick the safer change.`,
              description: `Checks backward compatibility.`,
              answer: `Add a new optional option; renaming or removing one is a breaking change.`,
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
              task: `Spot the problem in this API client.`,
              description: `Checks hard-coded global configuration.`,
              code: `class Api {
  static token = localStorage.getItem('t');
  static get(u) { return fetch(BASE + u, { headers: { Authorization: Api.token } }); }
}`,
              answer: `Token is read once at load, so it goes stale, and static state is hard to test. Create an instance with injected config.`,
            },
            {
              task: `Write a client that takes config.`,
              description: `Checks dependency injection for clients.`,
              answer: `Pass base URL and a token getter, so tests can create their own client.`,
              solution: `const createApi = ({ baseUrl, getToken }) => ({
  get: u => fetch(baseUrl + u, { headers: { Authorization: \`Bearer \${getToken()}\` } }),
});`,
            },
            {
              easy: true,
              task: `Spot the problem with static state.`,
              description: `Checks shared global state.`,
              code: `static token;`,
              answer: `Static token is global shared state, hard to test and to change per user.`,
            },
            {
              easy: true,
              task: `Fix by passing dependencies in.`,
              description: `Checks constructor injection.`,
              code: `new Api()`,
              answer: `Create instances with a config, so tests can use fakes.`,
              solution: `new Api({ token, baseUrl })`,
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
              task: `Spot the overused pattern.`,
              description: `Checks needless factory classes.`,
              code: `class ButtonFactory {
  create(label) { return new Button(label); }
}`,
              answer: `The factory adds nothing over calling new Button. Use a pattern only when it removes real complexity.`,
            },
            {
              task: `Name a way to teach patterns to the team.`,
              description: `Checks practical knowledge sharing.`,
              answer: `Show a pattern on real code in a short session or PR example, with a note on when not to use it.`,
            },
            {
              easy: true,
              task: `Name a rule before adding a pattern.`,
              description: `Checks pragmatism.`,
              code: `// Scenario: teammate wants Factory for one class.`,
              answer: `Add a pattern only when it solves a real current problem, not a possible one.`,
            },
            {
              easy: true,
              task: `Name a good way to teach patterns.`,
              description: `Checks team process.`,
              code: `// Scenario: new team of juniors.`,
              answer: `Show the pattern in a real code review, with the problem it solves.`,
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
              task: `Name each file: page or component?`,
              description: `Checks routing-level versus reusable UI.`,
              code: `// /applications route -> ApplicationsPage
// StatusBadge used in 6 places`,
              answer: `ApplicationsPage is a page tied to a route; StatusBadge is a reusable component.`,
            },
            {
              task: `Spot the problem in this component.`,
              description: `Checks reusable components reading routes.`,
              code: `function StatusBadge() {
  const { id } = useParams();
  const app = useApp(id);
}`,
              answer: `A reusable badge should not read the URL. Pass the status as a prop.`,
            },
            {
              easy: true,
              task: `Is this a page or a component?`,
              description: `Checks route-level piece.`,
              code: `<Route path="/users" element={<UsersPage />} />`,
              answer: `A page: it is tied to a route and composes smaller components.`,
            },
            {
              easy: true,
              task: `Name the reusable piece here.`,
              description: `Checks component reuse.`,
              code: `<Button label="Save" />`,
              answer: `Button is a component: small, reusable, no route knowledge.`,
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
              task: `Fix the bug.`,
              description: `Checks fetching during render.`,
              code: `function Users() {
  fetch('http://localhost:5000/users').then(r => r.json()).then(setUsers);
  return <List items={users} />;
}`,
              answer: `Fetch in render runs on every render and loops. Fetch in an effect or a query hook and use a config URL.`,
              solution: `useEffect(() => {
  fetch(\`\${API_URL}/users\`).then(r => r.json()).then(setUsers);
}, []);`,
            },
            {
              task: `Move the API address into config.`,
              description: `Checks environment variables in Vite.`,
              code: `const API = 'http://localhost:5000';`,
              answer: `Read the base URL from env so each environment can change it.`,
              solution: `const API = import.meta.env.VITE_API_URL;`,
            },
            {
              easy: true,
              task: `Move the URL out of the component.`,
              description: `Checks config.`,
              code: `fetch('http://localhost:3000/users')`,
              answer: `Use an env variable, so each environment gets its own address.`,
              solution: `fetch(\`\${import.meta.env.VITE_API_URL}/users\`)`,
            },
            {
              easy: true,
              task: `Name the problem with fetch in render.`,
              description: `Checks render side effect.`,
              code: `function A() { fetch('/x'); return null; }`,
              answer: `It runs on every render; put it in useEffect or a query hook.`,
            },
          ],
        },
        {
          q: `How do you decide whether to add a new npm package to the project?`,
          short: `Check if you really need it, then check size, maintenance, license, security and how hard it is to remove later.`,
          long: `Every package is code you ship and must maintain.
Ask first: can the platform do it (Intl, fetch, structuredClone) or can we write ten lines ourselves?
Check: bundle size (bundlephobia), last release and open issues, number of maintainers, license, known vulnerabilities.
Check if it supports tree shaking and TypeScript types.
Wrap big dependencies behind your own small module so you can replace them later.
Strong answer: weighs the cost of the dependency, not only the feature.
Weak answer: "if it has many stars, it is fine".`,
          follow: `What would make you remove a package that is already used?`,
          exercises: [
            {
              task: `Name three checks before adding a package.`,
              description: `Checks dependency evaluation.`,
              code: `// npm i tiny-date-lib`,
              answer: `Bundle size, maintenance activity, and license. Also check known vulnerabilities and whether native APIs already do it.`,
            },
            {
              task: `Replace this package with a built-in API.`,
              description: `Checks native alternatives.`,
              code: `import { v4 } from 'uuid';
const id = v4();`,
              answer: `Modern browsers have crypto.randomUUID.`,
              solution: `const id = crypto.randomUUID();`,
            },
            {
              easy: true,
              task: `Name one check before adding a package.`,
              description: `Checks dependency review.`,
              code: `// npm i left-pad`,
              answer: `Check size, maintenance, and whether a few lines of code do the same job.`,
            },
            {
              easy: true,
              task: `Name a tool to see bundle cost.`,
              description: `Checks size awareness.`,
              answer: `Bundlephobia or a bundle analyzer shows the size a package adds.`,
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
              task: `Spot the problem.`,
              description: `Checks copying props into state.`,
              code: `function Edit({ user }) {
  const [name, setName] = useState(user.name);
}`,
              answer: `State is set only once, so it goes stale when user changes. Use key={user.id} to reset, or read props directly.`,
            },
            {
              task: `Fix this with a key.`,
              description: `Checks resetting state by key.`,
              code: `<Edit user={user} />`,
              answer: `A new key remounts the form with fresh state.`,
              solution: `<Edit key={user.id} user={user} />`,
            },
            {
              easy: true,
              task: `Spot the duplicated state.`,
              description: `Checks derived state copy.`,
              code: `const [me, setMe] = useState(data);`,
              answer: `This copies server data and can go stale; read data directly instead.`,
            },
            {
              easy: true,
              task: `Fix by deriving the value.`,
              description: `Checks derive during render.`,
              code: `const [name, setName] = useState(data.name);`,
              answer: `Compute from data on render, so there is one source of truth.`,
              solution: `const name = data.name;`,
            },
          ],
        },
        {
          q: `How do you organize folders by feature?`,
          short: `Group code by feature (components, hooks, api, types together) with a public index, and keep truly shared code in a shared layer.`,
          long: `src/features/orders contains its UI, hooks, API and tests.\nEach feature exposes a small public API via index.ts.\nShared UI and utilities live in src/shared.\napp/ holds providers, routing and global setup.\nFeatures should not import each other's internals.\nFeature-Sliced Design formalizes this into layers.`,
          exercises: [
            {
              task: `Reorganize these files by feature.`,
              description: `Checks feature-based structure.`,
              code: `components/ApplicantList.tsx
hooks/useApplicants.ts
api/applicants.ts`,
              answer: `Group by feature, so related files sit together.`,
              solution: `features/applicants/
  ApplicantList.tsx
  useApplicants.ts
  api.ts
  index.ts`,
            },
            {
              task: `Spot the boundary problem.`,
              description: `Checks deep imports into features.`,
              code: `import { helper } from '@/features/billing/internal/helper';`,
              answer: `It reaches into another feature's internals. Import only from the feature's public index.`,
            },
            {
              easy: true,
              task: `Pick the feature-based path.`,
              description: `Checks folder naming.`,
              code: `a) components/UserCard.js
b) features/users/UserCard.js`,
              answer: `b) groups files by feature, so related code lives together.`,
            },
            {
              easy: true,
              task: `Say where a users-only hook belongs.`,
              description: `Checks colocation.`,
              code: `// Scenario: useUserList is used only by users pages.`,
              answer: `Inside features/users, not in a global hooks folder.`,
            },
          ],
        },
        {
          q: `How do you keep frontend types in sync with the backend API?`,
          short: `Generate types from one source of truth, like an OpenAPI or GraphQL schema, and check responses at runtime at the edge of the app.`,
          long: `Hand-written API types drift when the backend changes, and TypeScript cannot see the drift.
Better: generate types and clients from an OpenAPI spec or GraphQL schema in CI (for example openapi-typescript or GraphQL Code Generator).
Types only exist at compile time, so validate important responses at runtime with a schema (zod, valibot) in the API layer.
Map API data (DTOs) to frontend models in one place, so a backend rename changes one file.
Add contract tests so breaking changes fail in CI.
Strong answer: one source of truth, generated types, runtime validation at the boundary, mapping layer.`,
          follow: `Where do you put the mapping from API data to UI models?`,
          exercises: [
            {
              task: `Name a tool to generate types from OpenAPI.`,
              description: `Checks codegen for API types.`,
              answer: `openapi-typescript or Orval generate types from the backend schema, run in CI to catch drift.`,
            },
            {
              task: `Spot the risk in this type.`,
              description: `Checks trusting unchecked API data.`,
              code: `const user = (await res.json()) as User;`,
              answer: `as User only tells the compiler; it does not check data. Validate with a schema like Zod at the boundary.`,
              solution: `const user = UserSchema.parse(await res.json());`,
            },
            {
              easy: true,
              task: `Name a source of truth for types.`,
              description: `Checks API contract.`,
              answer: `An OpenAPI schema, from which you generate TypeScript types.`,
            },
            {
              easy: true,
              task: `Run the generator idea.`,
              description: `Checks codegen command.`,
              code: `npx openapi-typescript api.yaml -o types.ts`,
              answer: `This command turns the API schema into types, so they cannot drift.`,
            },
          ],
        },
      ],
      senior: [
        {
          q: `This shared utils folder imports code from app features. Now there is a circular import. Fix the dependency direction.`,
          code: `// shared/utils/formatUser.js
import { ROLES } from '../../features/admin/roles';
export const formatUser = (u) => \`\${u.name} (\${ROLES[u.role]})\`;

// features/admin/roles.js
import { formatUser } from '../../shared/utils/formatUser';
export const ROLES = { 1: 'Admin', 2: 'Reviewer' };
export const label = (u) => formatUser(u);`,
          short: `Shared code must never depend on features. Move the shared data down into shared, or pass it in as a parameter, so imports only point from features to shared.`,
          long: `Layers should have one direction: app -> features -> shared. Shared code knows nothing about features.
Here shared imports a feature, and the feature imports shared, so the modules form a cycle.
Cycles can give undefined values at load time, break tree shaking and make code hard to move.
Fix options: move ROLES into shared (if it is truly shared), or make formatUser take the role label as an argument.
Enforce it with lint rules such as eslint-plugin-boundaries or import/no-cycle, and with dependency-cruiser in CI.
Strong answer: explains the rule, the runtime risk of cycles and how to enforce boundaries automatically.`,
          fix: `// shared/utils/formatUser.js
export const formatUser = (u, roleLabel) => \`\${u.name} (\${roleLabel})\`;

// features/admin/roles.js
import { formatUser } from '../../shared/utils/formatUser';
export const ROLES = { 1: 'Admin', 2: 'Reviewer' };
export const label = (u) => formatUser(u, ROLES[u.role]);`,
          follow: `How would you stop new cycles from being merged?`,
          exercises: [
            {
              task: `Fix the dependency direction.`,
              description: `Checks shared code importing features.`,
              code: `// shared/utils.ts
import { formatApplicant } from '@/features/applicants';`,
              answer: `Shared code must not depend on features. Move the helper into the feature or make it generic.`,
            },
            {
              task: `Write a lint rule to block this.`,
              description: `Checks enforcing import direction.`,
              answer: `no-restricted-imports in shared files can block feature imports.`,
              solution: `// for files in src/shared/**
'no-restricted-imports': ['error', { patterns: ['@/features/*'] }]`,
            },
            {
              easy: true,
              task: `Which direction is correct?`,
              description: `Checks dependency direction.`,
              code: `a) shared imports features
b) features import shared`,
              answer: `b) features may import shared; shared must not know about features.`,
            },
            {
              easy: true,
              task: `Move the constant to fix the cycle.`,
              description: `Checks extracting shared code.`,
              code: `import { ROLES } from '../../features/admin/roles';`,
              answer: `Move ROLES to shared, so both sides import it from there.`,
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
              task: `Write a React 19 root error handler.`,
              description: `Checks global error reporting.`,
              code: `createRoot(el).render(<App />);`,
              answer: `createRoot accepts error callbacks to log uncaught render errors.`,
              solution: `createRoot(el, {
  onUncaughtError: (err, info) => report(err, info.componentStack),
}).render(<App />);`,
            },
            {
              task: `Name what error boundaries do not catch.`,
              description: `Checks boundary limits.`,
              answer: `Errors in event handlers, async code like setTimeout or fetch, and SSR. Handle those with try/catch or query error states.`,
            },
            {
              easy: true,
              task: `Name the React tool for render crashes.`,
              description: `Checks error boundary.`,
              answer: `An Error Boundary catches render errors and shows a fallback UI.`,
            },
            {
              easy: true,
              task: `Catch the fetch failure.`,
              description: `Checks async error handling.`,
              code: `const res = await fetch(url);`,
              answer: `fetch does not throw on 404; check res.ok yourself.`,
              solution: `if (!res.ok) throw new Error(res.status);`,
            },
          ],
        },
        {
          q: `How do you design a frontend that supports many languages and time zones? Where does this logic live?`,
          short: `Keep all text in message files loaded per locale, format dates, numbers and money with Intl, store times in UTC, and convert only for display.`,
          long: `Internationalization touches the whole app, so it needs one central design.
Text: no strings in components; use message keys with ICU plural and gender rules, and load locale bundles lazily.
Formatting: use Intl.DateTimeFormat, Intl.NumberFormat and Intl.RelativeTimeFormat instead of hand-made formats.
Time: the API sends ISO strings in UTC; the UI converts to the user time zone only when it displays.
Layout: support right-to-left with logical CSS properties and the dir attribute.
Process: extraction tools, translation workflow, a pseudo-locale to find hard-coded text and long strings.
Strong answer: covers text, formatting, time zones, RTL and the translation process.`,
          follow: `How do you test that no text is hard-coded?`,
          exercises: [
            {
              task: `Format this date for the user's locale.`,
              description: `Checks Intl.DateTimeFormat.`,
              code: `const d = new Date('2026-03-01T12:00:00Z');`,
              answer: `Intl formats with locale and time zone.`,
              solution: `new Intl.DateTimeFormat('de-DE', {
  dateStyle: 'medium', timeZone: 'Europe/Berlin',
}).format(d);`,
            },
            {
              task: `Spot the time zone bug.`,
              description: `Checks date-only strings parsed as UTC.`,
              code: `const due = new Date('2026-03-01');
console.log(due.getDate());`,
              answer: `Date-only strings parse as UTC midnight, so users west of UTC see February 28. Parse as a local date or keep the string.`,
            },
            {
              easy: true,
              task: `Predict the output.`,
              description: `Checks locale formatting.`,
              code: `new Intl.NumberFormat('de-DE').format(1234.5)`,
              answer: `It prints '1.234,5', because the German locale swaps separators.`,
            },
            {
              easy: true,
              task: `Choose how to store dates on the server.`,
              description: `Checks time zones.`,
              answer: `Store UTC (ISO strings) and format in the user's time zone on the client.`,
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
              task: `Name a tool to enforce module boundaries.`,
              description: `Checks automated architecture rules.`,
              answer: `dependency-cruiser or eslint-plugin-boundaries, with rules run in CI.`,
            },
            {
              task: `Write a public index for a module.`,
              description: `Checks a narrow module API.`,
              code: `// features/billing/`,
              answer: `Export only what other modules may use.`,
              solution: `// features/billing/index.ts
export { BillingPage } from './BillingPage';
export type { Invoice } from './types';`,
            },
            {
              easy: true,
              task: `Name a rule that enforces import limits.`,
              description: `Checks boundaries tooling.`,
              code: `// eslint no-restricted-imports: features/*/internal`,
              answer: `A lint rule like no-restricted-imports blocks deep imports across modules.`,
            },
            {
              easy: true,
              task: `Say what a module should expose.`,
              description: `Checks public entry.`,
              code: `// features/users/index.js`,
              answer: `Only a small index file; other files stay private to the module.`,
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
              task: `Wrap flag reads in one hook.`,
              description: `Checks centralizing feature flags.`,
              code: `if (window.flags?.newNav === 'on') {}`,
              answer: `One typed hook hides the provider and gives defaults.`,
              solution: `type Flag = 'newNav' | 'newSearch';
export const useFlag = (f: Flag) => useContext(FlagsContext)[f] ?? false;`,
            },
            {
              task: `Name a rule for old flags.`,
              description: `Checks flag cleanup.`,
              answer: `Each flag has an owner and an expiry date; a CI or lint check reports flags past expiry.`,
            },
            {
              easy: true,
              task: `Wrap the flag in one function.`,
              description: `Checks flag access.`,
              code: `window.FLAGS['new-checkout'] === 'on'`,
              answer: `One helper hides the source, so tests and changes happen in one place.`,
              solution: `isEnabled('new-checkout')`,
            },
            {
              easy: true,
              task: `Name a flag cleanup rule.`,
              description: `Checks flag lifecycle.`,
              code: `// Scenario: flag launched 100% six months ago.`,
              answer: `Remove the flag and dead code branch once the rollout is finished.`,
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
              task: `Name the main sections of an ADR.`,
              description: `Checks ADR structure.`,
              answer: `Context, decision, and consequences, plus status and date.`,
            },
            {
              task: `Name when to write an ADR.`,
              description: `Checks ADR scope.`,
              code: `// Choose TanStack Query vs Redux for server state`,
              answer: `When a decision is hard to reverse or affects many teams, like this state library choice.`,
            },
            {
              easy: true,
              task: `Name the sections of an ADR.`,
              description: `Checks ADR structure.`,
              answer: `Title, context, decision, and consequences, each a few lines.`,
            },
            {
              easy: true,
              task: `Say when to write an ADR.`,
              description: `Checks trigger.`,
              code: `// Scenario: team picks Redux vs React Query.`,
              answer: `When a decision is costly to reverse, write why you chose it.`,
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
              task: `Predict which element can be clicked.`,
              description: `Checks hidden elements and events.`,
              code: `.a { opacity: 0; }
.b { visibility: hidden; }
.c { display: none; }`,
              answer: `Only .a: it is invisible but still takes space and gets clicks. .b keeps space only; .c is removed from layout.`,
            },
            {
              task: `Write a visually hidden class.`,
              description: `Checks screen-reader-only text.`,
              code: `<button><svg aria-hidden="true"/><span class="?">Close</span></button>`,
              answer: `Hide visually but keep it readable by screen readers.`,
              solution: `.sr-only {
  position: absolute; width: 1px; height: 1px;
  overflow: hidden; clip-path: inset(50%); white-space: nowrap;
}`,
            },
            {
              easy: true,
              task: `Which one still takes space?`,
              description: `Checks hiding methods.`,
              code: `a) display: none
b) visibility: hidden`,
              answer: `b) keeps the layout space; display none removes the element from layout.`,
            },
            {
              easy: true,
              task: `Which one stays clickable?`,
              description: `Checks opacity 0.`,
              code: `opacity: 0;`,
              answer: `opacity 0 hides it visually but it still receives clicks.`,
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
              task: `Center the text vertically.`,
              description: `Checks flex alignment.`,
              code: `.btn { height: 40px; }`,
              answer: `Use inline-flex with align-items center.`,
              solution: `.btn { height: 40px; display: inline-flex; align-items: center; justify-content: center; }`,
            },
            {
              task: `Spot the problem.`,
              description: `Checks fixed line-height versus content.`,
              code: `.btn { height: 40px; line-height: 40px; padding: 8px; }`,
              answer: `Padding plus line-height overflows 40px, so text moves down. Remove the fixed line-height and use flex.`,
            },
            {
              easy: true,
              task: `Pick the real centering fix.`,
              description: `Checks flex centering.`,
              code: `.btn { display: ???; align-items: center; }`,
              answer: `vertical-align does not affect a button's content; use flex.`,
              solution: `display: flex;`,
            },
            {
              easy: true,
              task: `Which property needs inline context?`,
              description: `Checks vertical-align scope.`,
              code: `vertical-align: middle;`,
              answer: `It works on inline or table-cell elements, not on block content.`,
            },
          ],
        },
        {
          q: `What are rem, em, percent, vw and px? Which unit is best for font size?`,
          short: `px is absolute, em is relative to the element's font size, rem to the root font size, % to the parent, vw to viewport width; prefer rem for font sizes so user settings are respected.`,
          long: `rem scales with the user's browser font-size preference.\nem compounds when nested, useful for component-relative spacing.\n% depends on the property (width relative to parent width).\nvw/vh relate to the viewport; dvh/svh/lvh handle mobile toolbars.\nclamp() combines them for fluid typography.\npx font sizes ignore the user's default font-size setting.`,
          exercises: [
            {
              task: `Predict the font size.`,
              description: `Checks em compounding.`,
              code: `html { font-size: 16px; }
.a { font-size: 2em; }
.a .b { font-size: 2em; }`,
              answer: `.b is 64px. em uses the parent size, so it compounds. rem would give 32px.`,
            },
            {
              task: `Pick a unit for font size.`,
              description: `Checks accessible font sizing.`,
              code: `body { font-size: 14px; }`,
              answer: `Use rem, so text grows with the user's browser font setting.`,
              solution: `body { font-size: 0.875rem; }`,
            },
            {
              easy: true,
              task: `Convert the size.`,
              description: `Checks rem math.`,
              code: `html { font-size: 16px; }
p { font-size: 1.5rem; }`,
              answer: `The paragraph is 24px, since 1.5 times 16.`,
            },
            {
              easy: true,
              task: `Pick the unit for font size.`,
              description: `Checks accessibility.`,
              code: `font-size: ???`,
              answer: `rem respects the user's browser font setting, unlike px.`,
              solution: `font-size: 1rem;`,
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
              task: `Fix the overflowing text.`,
              description: `Checks min-width in flex items.`,
              code: `.row { display: flex; }
.title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }`,
              answer: `Flex items have min-width: auto, so they do not shrink. Set min-width: 0.`,
              solution: `.title {
  min-width: 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}`,
            },
            {
              task: `Write a two-line clamp.`,
              description: `Checks multi-line truncation.`,
              answer: `line-clamp truncates after two lines.`,
              solution: `.text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}`,
            },
            {
              easy: true,
              task: `Add the missing rule for dots.`,
              description: `Checks text-overflow.`,
              code: `.title { overflow: hidden; text-overflow: ellipsis; }`,
              answer: `Also add white-space: nowrap so the text stays on one line.`,
              solution: `white-space: nowrap;`,
            },
            {
              easy: true,
              task: `Fix flex child shrinking.`,
              description: `Checks min-width zero.`,
              code: `.title { flex: 1; }`,
              answer: `Flex items default to min-width auto; set min-width: 0 so it can shrink.`,
              solution: `min-width: 0;`,
            },
          ],
        },
        {
          q: `How are CSS custom properties different from Sass variables?`,
          short: `Custom properties are live at runtime, cascade and inherit, and can change via media queries or JS; Sass variables are compiled away at build time.`,
          long: `--brand: #0a58ca is set on an element and inherited by descendants.\nvar(--brand, fallback) reads it at computed-value time.\nOverride per theme, component or media query without recompiling.\nJS can set them with element.style.setProperty.\n@property registers type, initial value and inheritance, enabling transitions.\nSass is still useful for mixins and loops, but tokens work best as custom properties.`,
          exercises: [
            {
              task: `Predict the button color.`,
              description: `Checks runtime cascade of custom properties.`,
              code: `:root { --c: blue; }
.danger { --c: red; }
.btn { color: var(--c); }
/* <div class="danger"><button class="btn"> */`,
              answer: `Red. Custom properties inherit at runtime; a Sass variable would be fixed at build time.`,
            },
            {
              task: `Add a fallback value.`,
              description: `Checks var() fallback.`,
              code: `.card { padding: var(--space); }`,
              answer: `The second argument is used when the property is not set.`,
              solution: `.card { padding: var(--space, 1rem); }`,
            },
            {
              easy: true,
              task: `Read the variable.`,
              description: `Checks var() usage.`,
              code: `:root { --gap: 8px; }
.box { padding: var(--gap); }`,
              answer: `Padding is 8px; custom properties are read with var() at runtime.`,
            },
            {
              easy: true,
              task: `Say who can change at runtime.`,
              description: `Checks custom property vs Sass.`,
              answer: `CSS custom properties can change in the browser; Sass variables compile away.`,
            },
          ],
        },
        {
          q: `What are CSS logical properties? Why do they matter for right-to-left languages?`,
          short: `Logical properties like margin-inline-start describe sides by text direction instead of left and right, so one stylesheet works for both left-to-right and right-to-left.`,
          long: `Physical properties (margin-left, padding-right) stay fixed when the language changes.
Logical properties follow the writing mode: inline is the text direction, block is the line stacking direction.
Examples: margin-inline-start, padding-block, inset-inline-end, border-start-start-radius.
With dir="rtl" on the html element, inline-start becomes the right side automatically.
This removes a whole RTL override stylesheet and its bugs.
Strong answer: maps physical to logical names and mentions dir and icons that must flip.`,
          follow: `Which icons should flip in right-to-left layouts, and which should not?`,
          exercises: [
            {
              task: `Rewrite with logical properties.`,
              description: `Checks RTL-friendly CSS.`,
              code: `.icon { margin-left: 8px; }`,
              answer: `margin-inline-start flips in right-to-left languages.`,
              solution: `.icon { margin-inline-start: 8px; }`,
            },
            {
              task: `Name the logical version of width.`,
              description: `Checks logical sizing.`,
              answer: `inline-size. It follows the writing direction, as block-size does for height.`,
            },
            {
              easy: true,
              task: `Convert to a logical property.`,
              description: `Checks inline-start.`,
              code: `margin-left: 8px;`,
              answer: `Use margin-inline-start, so it flips automatically in right-to-left.`,
              solution: `margin-inline-start: 8px;`,
            },
            {
              easy: true,
              task: `Name the logical width property.`,
              description: `Checks inline-size.`,
              code: `width: 100px;`,
              answer: `inline-size is the logical match of width in horizontal writing.`,
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
              task: `Fix the image layout shift.`,
              description: `Checks reserving image space.`,
              code: `<img src="photo.jpg" alt="Campus">`,
              answer: `Width and height let the browser reserve space before load.`,
              solution: `<img src="photo.jpg" alt="Campus" width="800" height="450">`,
            },
            {
              task: `Reduce the font swap jump.`,
              description: `Checks fallback font metrics.`,
              code: `@font-face { font-family: Inter; src: url(inter.woff2); font-display: swap; }`,
              answer: `Match the fallback font size to the web font with size-adjust.`,
              solution: `@font-face {
  font-family: InterFallback; src: local(Arial);
  size-adjust: 107%;
}
body { font-family: Inter, InterFallback, sans-serif; }`,
            },
            {
              easy: true,
              task: `Add the missing attributes.`,
              description: `Checks image dimensions.`,
              code: `<img src="hero.jpg">`,
              answer: `Width and height let the browser reserve space and avoid layout shift.`,
              solution: `<img src="hero.jpg" width="800" height="400">`,
            },
            {
              easy: true,
              task: `Add the font-display value.`,
              description: `Checks font swap.`,
              code: `@font-face { font-family: Brand; src: url(b.woff2); }`,
              answer: `font-display: swap shows fallback text first, avoiding invisible text.`,
              solution: `font-display: swap;`,
            },
          ],
        },
        {
          q: `How do you build dark mode with CSS? Think about prefers-color-scheme, custom properties and the color-scheme property.`,
          short: `Define colors as custom properties, change their values for dark mode with prefers-color-scheme or a data attribute, and set color-scheme so built-in controls match.`,
          long: `Use semantic tokens, like --surface and --text, not raw colors in components.
Change token values in a media query (prefers-color-scheme: dark) for the system setting.
For a user toggle, also set a data-theme attribute and save the choice.
color-scheme: light dark tells the browser to style scrollbars, inputs and default backgrounds for the theme.
Avoid a flash of the wrong theme: apply the saved theme in a tiny inline script before the page paints.
Check contrast in both themes; dark mode is not just inverted colors.
Strong answer: tokens, system plus user choice, color-scheme, no flash, contrast.`,
          follow: `How do you avoid a flash of the light theme on page load?`,
          exercises: [
            {
              task: `Write a dark mode with custom properties.`,
              description: `Checks prefers-color-scheme.`,
              code: `:root { --bg: white; --fg: black; }`,
              answer: `Override the tokens in a media query.`,
              solution: `@media (prefers-color-scheme: dark) {
  :root { --bg: #111; --fg: #eee; }
}
body { background: var(--bg); color: var(--fg); }`,
            },
            {
              task: `Name what color-scheme does.`,
              description: `Checks native dark controls.`,
              code: `:root { color-scheme: light dark; }`,
              answer: `It tells the browser to style native parts like scrollbars and form controls for both themes.`,
            },
            {
              easy: true,
              task: `Write the dark mode media query.`,
              description: `Checks prefers-color-scheme.`,
              code: `@media (prefers-color-scheme: ???) { }`,
              answer: `Use dark, which matches users who prefer a dark theme.`,
              solution: `@media (prefers-color-scheme: dark) { }`,
            },
            {
              easy: true,
              task: `Tell browsers both themes are supported.`,
              description: `Checks color-scheme.`,
              code: `:root { color-scheme: ???; }`,
              answer: `This makes built-in controls and scrollbars follow the theme.`,
              solution: `:root { color-scheme: light dark; }`,
            },
          ],
        },
        {
          q: `What do CSS contain and content-visibility do? When do they help performance?`,
          short: `contain tells the browser that an element's layout or paint does not affect the rest of the page. content-visibility: auto skips rendering off-screen content until it is near the viewport.`,
          long: `By default a change inside one element can force layout of the whole page.
contain: layout paint (or contain: content) limits that work to the element.
content-visibility: auto skips layout and paint for off-screen sections, which can make long pages much faster to render.
Pair it with contain-intrinsic-size so the scrollbar does not jump when sections render.
Downsides: skipped content is still in the DOM and accessible, but find-in-page and anchor links may need care in older browsers; wrong sizes cause scroll jumps.
Strong answer: explains what is skipped, the size placeholder and how to measure the gain.`,
          follow: `Why do you need contain-intrinsic-size with content-visibility?`,
          exercises: [
            {
              task: `Speed up this long page.`,
              description: `Checks content-visibility: auto.`,
              code: `.section { /* 200 long sections */ }`,
              answer: `Skip rendering off-screen sections and reserve their size.`,
              solution: `.section {
  content-visibility: auto;
  contain-intrinsic-size: auto 600px;
}`,
            },
            {
              task: `Name a side effect of content-visibility.`,
              description: `Checks scrollbar jumps.`,
              answer: `Without contain-intrinsic-size, hidden sections have zero height, so the scrollbar jumps as you scroll.`,
            },
            {
              easy: true,
              task: `Add contain to a widget.`,
              description: `Checks contain syntax.`,
              code: `.card { contain: ???; }`,
              answer: `contain: content limits layout and paint work to the element.`,
              solution: `.card { contain: content; }`,
            },
            {
              easy: true,
              task: `Skip rendering offscreen sections.`,
              description: `Checks content-visibility.`,
              code: `.section { content-visibility: ???; }`,
              answer: `auto skips rendering work until the section is near the viewport.`,
              solution: `.section { content-visibility: auto; }`,
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
              task: `Predict the color.`,
              description: `Checks layer order beats specificity.`,
              code: `@layer base, components;
@layer components { .btn { color: red; } }
@layer base { #app .btn { color: blue; } }`,
              answer: `Red. Later layers win, no matter the selector specificity.`,
            },
            {
              task: `Put a third-party library in a low layer.`,
              description: `Checks importing CSS into a layer.`,
              code: `@import url('lib.css');`,
              answer: `Import it into a layer listed first.`,
              solution: `@layer vendor, app;
@import url('lib.css') layer(vendor);`,
            },
            {
              easy: true,
              task: `Declare layer order.`,
              description: `Checks @layer order.`,
              code: `@layer base, components, utilities;`,
              answer: `Later layers win over earlier ones, regardless of selector specificity.`,
            },
            {
              easy: true,
              task: `Predict the color.`,
              description: `Checks unlayered styles.`,
              code: `@layer a { p { color: red; } }
p { color: blue; }`,
              answer: `Blue wins; unlayered styles beat layered ones.`,
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
              task: `Spot the problem in this theme code.`,
              description: `Checks hard-coded brand colors.`,
              code: `.btn-brandA { background: #0055ff; }
.btn-brandB { background: #ff5500; }`,
              answer: `Each new brand needs new classes. Use one token and set it per brand.`,
              solution: `[data-brand='a'] { --brand: #0055ff; }
[data-brand='b'] { --brand: #ff5500; }
.btn { background: var(--brand); }`,
            },
            {
              task: `Name the token layers in a design system.`,
              description: `Checks primitive versus semantic tokens.`,
              answer: `Primitive tokens like blue-500, and semantic tokens like color-action that brands map to primitives.`,
            },
            {
              easy: true,
              task: `Name the problem with !important here.`,
              description: `Checks specificity wars.`,
              code: `.brand-b .btn-primary { background: #c2185b !important; }`,
              answer: `!important blocks later overrides and causes specificity fights.`,
            },
            {
              easy: true,
              task: `Replace the hardcoded color.`,
              description: `Checks design tokens.`,
              code: `.btn-primary { background: #0a58ca; }`,
              answer: `Use a custom property, so each brand only sets the token.`,
              solution: `.btn-primary { background: var(--color-primary); }`,
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
              task: `Name two CSS metrics to track in CI.`,
              description: `Checks CSS budgets.`,
              answer: `Total CSS bytes per page and unused CSS percent. Fail CI when a budget is exceeded.`,
            },
            {
              task: `Write a stylelint rule to limit specificity.`,
              description: `Checks keeping selectors simple.`,
              answer: `selector-max-specificity blocks heavy selectors.`,
              solution: `rules: {
  'selector-max-specificity': '0,3,0',
  'declaration-no-important': true,
}`,
            },
            {
              easy: true,
              task: `Name a tool to find unused CSS.`,
              description: `Checks CSS coverage.`,
              answer: `Chrome DevTools Coverage shows how much CSS is never used on a page.`,
            },
            {
              easy: true,
              task: `Name a budget to set.`,
              description: `Checks size limit.`,
              code: `// Scenario: CSS grew from 50KB to 400KB.`,
              answer: `Set a CSS size budget in CI and fail the build when exceeded.`,
            },
          ],
        },
      ],
    },
  },
};
