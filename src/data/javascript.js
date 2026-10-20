// JavaScript
export default {
  Types: {
    junior: [
      {
        q: 'What are the primitive types in JS? What is the difference between double equals (==) and triple equals (===)? What does typeof null return?',
        short: 'Seven primitives: string, number, bigint, boolean, undefined, symbol, null. === compares without type coercion, == coerces first; typeof null returns "object" (a historical bug).',
        long: `Primitives are immutable values compared by value; everything else (objects, arrays, functions) is an object compared by reference.
typeof returns "function" for functions and "object" for null and arrays — use Array.isArray and value === null for those checks.
== applies the Abstract Equality algorithm (e.g. '1' == 1, null == undefined, 0 == ''), which is a common source of bugs; === checks type and value.
Exceptions to ===: NaN !== NaN and +0 === -0; Object.is handles both.
Strong candidate: lists all seven including bigint/symbol, knows the null quirk and when == null is an acceptable idiom (null or undefined check).
Weak candidate: says "arrays are a type", forgets bigint/symbol, or claims == is "just slower".`,
        exercises: [
          {
            task: 'Predict the output of each line.',
            description: 'Checks typeof results for special values. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `console.log(typeof NaN);
console.log(typeof function () {});
console.log(typeof null);`,
            answer: '"number", "function", "object". NaN is a numeric value; functions get their own typeof result; null reports "object" due to a legacy bug. A common wrong answer is that typeof NaN is "NaN" or typeof null is "null". A strong answer explains why null is a legacy quirk and how to check for it with === null.',
          },
          {
            task: 'Fix the check so it is true only for real arrays.',
            description: 'Checks reliable array detection. Show the snippet, ask the candidate to explain the bug first, then write the fix.',
            code: `function isList(v) { return typeof v === 'object'; }
console.log(isList(null), isList({}));`,
            answer: 'typeof returns "object" for null, plain objects and arrays alike. Use Array.isArray. Weak candidates use instanceof Array, which fails across iframes/realms. A strong answer picks Array.isArray and mentions that typeof cannot tell objects, arrays and null apart.',
            solution: 'function isList(v) { return Array.isArray(v); }',
          },
        ],
      },
      {
        q: 'Find and fix the bug: the total is wrong.',
        code: `const a = document.querySelector('#a').value; // '2'
const b = document.querySelector('#b').value; // '3'
console.log(a + b);`,
        short: 'Input values are always strings, so + concatenates and prints "23". Convert explicitly with Number() (and check for NaN) before adding.',
        fix: 'console.log(Number(a) + Number(b)); // 5',
        long: `DOM input .value is always a string, even for type="number" (valueAsNumber exists for numeric inputs).
+ concatenates if either operand is a string; -, *, / convert to numbers, which makes the bug inconsistent and easy to miss.
Fix with Number(x) or parseFloat, and validate with Number.isNaN; avoid unary + in shared code because it is less readable.
Strong candidate explains why + is special and handles invalid input; weak candidate wraps the result in parseInt or only tests with numbers.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks + vs - coercion with strings. Ask the candidate to predict before running.',
            code: 'console.log(\'3\' * \'4\', \'3\' + 4 + 5, 3 + 4 + \'5\');',
            answer: '12 "345" "75". * converts both sides to numbers. + is evaluated left to right and concatenates once a string is involved, so 3 + 4 happens first in the last case. Common wrong answer: "345" for the last one.',
          },
          {
            task: 'Fix the validation so empty input is rejected.',
            description: 'Checks Number() edge cases. Show the snippet and ask what Number("") returns.',
            code: `function isValidAge(s) { return !Number.isNaN(Number(s)); }
console.log(isValidAge(''));`,
            answer: 'Number("") and Number("  ") return 0, not NaN, so empty input passes. Trim the input and reject empty strings, or use a stricter parse. A strong answer also mentions range checks.',
            solution: `function isValidAge(s) {
  const t = s.trim();
  return t !== '' && Number.isInteger(Number(t)) && Number(t) >= 0;
}`,
          },
        ],
      },
    ],
    middle: [
      {
        q: 'Predict each result without running it, then explain the coercion rules.',
        ai: true,
        code: `[] + {}
[] == ![]
'5' - 2
'5' + 2
null == undefined
null >= 0
NaN === NaN`,
        short: '"[object Object]", true, 3, "52", true, true, false — + with a string concatenates, other arithmetic converts to number, and null is special-cased in ==.',
        long: `[] + {}: both convert to primitives via ToPrimitive → "" + "[object Object]".
[] == ![]: ![] is false (objects are truthy); then [] → "" → 0 and false → 0, so 0 == 0 is true.
'5' - 2: minus only works on numbers → 3. '5' + 2: + concatenates if either side is a string → "52".
null == undefined is true by spec, and neither equals anything else with ==.
null >= 0 is true because relational operators convert null to 0, while null == 0 is false — == does not convert null.
NaN is not equal to anything, itself included; use Number.isNaN or Object.is.
Strong candidate explains ToPrimitive / ToNumber steps; weak one memorizes outputs or guesses.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks left-to-right evaluation with boolean-to-number coercion. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `console.log(1 < 2 < 3);
console.log(3 > 2 > 1);`,
            answer: 'true, false. Comparisons go left to right: 3 > 2 gives true, then true > 1 becomes 1 > 1, which is false. Most people expect true for both lines because they read it as math. A strong answer evaluates step by step and names the conversion true → 1.',
          },
          {
            task: 'Fix the bug: input "0" should count as a valid quantity.',
            description: 'Checks the difference between || and ??. Show the snippet, ask the candidate to explain the bug first, then write the fix.',
            code: `function qty(input) { return input || 'not set'; }
console.log(qty(0));`,
            answer: '|| treats every falsy value (0, "", NaN) as missing. ?? only falls back on null/undefined. A weak fix adds special cases like input === 0. A strong answer explains falsy vs nullish and knows ?? cannot be mixed with || unless you add parentheses.',
            solution: 'function qty(input) { return input ?? \'not set\'; }',
          },
        ],
      },
      {
        q: 'Explain truthy and falsy values in JS. Which values are falsy? When does checking for truthy values cause bugs?',
        short: 'The falsy values are false, 0, -0, 0n, "", null, undefined and NaN (plus document.all); everything else is truthy, including "0", [] and {}. Truthiness checks cause bugs when 0 or "" are valid values.',
        long: `Conditions, &&, || and ! convert values to boolean using ToBoolean.
Surprises: "0", "false", [] and {} are truthy, so if (arr) does not check for an empty array — use arr.length.
Bugs: if (count) skips 0; value || default replaces valid 0/""; React's {count && <X/>} renders "0".
Use ?? for null/undefined defaults, explicit comparisons, and Boolean(x) for intent.
Strong candidate lists all falsy values and the React 0 pitfall; weak candidate thinks [] is falsy.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks ToBoolean on objects and strings. Ask for predictions line by line.',
            code: 'console.log(!!\'0\', !![], !!\'\', !!NaN, Boolean(new Boolean(false)));',
            answer: 'true true false false true. Every object is truthy, including a Boolean wrapper holding false, and non-empty strings are truthy even when they look like "0". Common mistake: thinking [] or "0" is falsy.',
          },
          {
            task: 'Fix the bug: page 0 is never loaded.',
            description: 'Checks truthiness vs nullish checks. Show it as a code review comment.',
            code: `function load(page) {
  if (!page) page = 1;
  return fetchPage(page);
}`,
            answer: 'Page 0 is falsy, so it gets replaced by 1. Check only for null/undefined with ?? or an explicit comparison. A strong answer asks whether 0 is a valid page in this API.',
            solution: `function load(page) {
  page ??= 1;
  return fetchPage(page);
}`,
          },
        ],
      },
    ],
    senior: [
      {
        q: 'Why is 0.1 plus 0.2 not equal to 0.3? How would you handle money in a frontend app?',
        short: 'IEEE-754 binary doubles cannot represent 0.1 exactly, so the sum is 0.30000000000000004. Store money as integer minor units (or BigInt / a decimal library) and format with Intl.NumberFormat.',
        long: `All JS numbers are 64-bit doubles; decimal fractions like 0.1 have infinite binary expansions and get rounded.
Errors accumulate in sums, so equality checks fail; comparisons need an epsilon (Number.EPSILON) — fine for geometry, not for money.
For money: keep amounts in cents as integers (safe up to Number.MAX_SAFE_INTEGER), or BigInt for huge values, or a decimal library (decimal.js, big.js) when you need division/percentages with explicit rounding modes.
Format only at the edges with Intl.NumberFormat (currency, locale); never use toFixed for intermediate math — it returns a string and rounds surprisingly ((1.005).toFixed(2) is "1.00").
Ideally the backend is the source of truth for totals, taxes and rounding.
Strong candidate mentions minor units, rounding policy and display formatting; weak candidate suggests Math.round everywhere or parseFloat(toFixed()).`,
        exercises: [
          {
            task: 'Predict the output and explain.',
            description: 'Checks safe-integer limits and BigInt. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `console.log(9007199254740992 === 9007199254740993);
console.log(2n ** 64n);`,
            answer: 'true, then 18446744073709551616n. Beyond Number.MAX_SAFE_INTEGER (2^53 - 1), doubles cannot represent every integer; BigInt has arbitrary precision. Candidates often call this a bug in ===. A strong answer cites 2^53, Number.isSafeInteger, and when IDs from APIs should stay strings or become BigInt.',
          },
          {
            task: 'Implement splitting a total in cents into n parts that add up exactly to the total.',
            description: 'Checks exact money arithmetic with integer cents. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            code: 'function split(totalCents, n) { /* ... */ }',
            answer: 'Floor-divide, then hand out the remainder one cent at a time so the sum stays exact. Splitting with total / n and rounding loses or invents cents. A strong answer keeps integers, distributes the remainder deterministically, and mentions banking rules about who gets the extra cent.',
            solution: `function split(totalCents, n) {
  const base = Math.floor(totalCents / n), rest = totalCents % n;
  return Array.from({ length: n }, (_, i) => base + (i < rest ? 1 : 0));
}
console.log(split(1000, 3)); // [334, 333, 333]`,
          },
        ],
      },
      {
        q: 'Find the bug in this deep-equality helper and fix it.',
        code: `function equal(a, b) {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  const ka = Object.keys(a);
  return ka.length === Object.keys(b).length && ka.every((k) => equal(a[k], b[k]));
}
console.log(equal(null, {}), equal(NaN, NaN), equal([1], { 0: 1 }));`,
        short: 'It crashes on null (typeof null is "object", so Object.keys(null) throws), treats NaN as unequal to itself, and considers [1] equal to { 0: 1 }. Use Object.is, null guards, and prototype/array checks.',
        fix: `function equal(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b) || Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
  const ka = Object.keys(a);
  return ka.length === Object.keys(b).length && ka.every((k) => Object.hasOwn(b, k) && equal(a[k], b[k]));
}`,
        long: `typeof null === "object" lets null into the object branch, where Object.keys(null) throws a TypeError.
=== says NaN !== NaN; Object.is fixes NaN (but also distinguishes +0 and -0 — decide what you want).
Arrays and plain objects with the same keys compare equal unless you check Array.isArray or prototypes.
Also missing: own-key check in b, Dates/Maps/Sets, cycles.
Strong candidate finds all three bugs and lists remaining limitations; weak candidate only notices one.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks Object.is vs === edge cases. Ask before running.',
            code: 'console.log(Object.is(0, -0), 0 === -0, 1 / -0, [NaN].includes(NaN), [NaN].indexOf(NaN));',
            answer: 'false true -Infinity true -1. includes uses SameValueZero (NaN matches); indexOf uses === (it does not). Many candidates miss the includes/indexOf difference.',
          },
          {
            task: 'Implement a safe JSON number parser. It rejects numbers that are too big to store exactly as safe integers.',
            description: 'Checks precision awareness at API boundaries. Live-code, then discuss IDs.',
            answer: 'Parse the string, then reject results that are not safe integers, since precision is already lost at that point. A strong answer suggests keeping large IDs as strings or using JSON.parse with a reviver/source text.',
            solution: `function parseId(s) {
  const n = Number(s);
  if (!Number.isSafeInteger(n)) throw new RangeError('Unsafe id: ' + s);
  return n;
}
console.log(parseId('42'));`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'Your team keeps shipping bugs from implicit type coercion and from null or undefined. What rules and tools would you add for the whole company?',
        ai: true,
        short: 'TypeScript strict mode (plus noUncheckedIndexedAccess), ESLint rules like eqeqeq and no-implicit-coercion, runtime validation at API boundaries (e.g. zod), and tracking bug categories to prove impact.',
        long: `Start by measuring: tag incidents/bugs by root cause so you know coercion/null bugs are really the problem and can verify improvement.
Static layer: TS strict (strictNullChecks), noUncheckedIndexedAccess, exactOptionalPropertyTypes where feasible; roll out incrementally per package to avoid a big-bang.
Lint layer: eqeqeq (allow == null), no-implicit-coercion, @typescript-eslint/strict-boolean-expressions, enforced in CI.
Runtime layer: types lie at boundaries — validate API responses, localStorage, URL params with a schema library and fail loudly.
Process: review checklist, shared utilities (parseMoney, safe formatters), onboarding docs.
Strong candidate balances tooling with adoption cost and measurement; weak candidate says "just be careful" or only "use TypeScript".`,
        exercises: [
          {
            task: 'Implement a parser for API data you do not trust. It must never let null or a wrong type through.',
            description: 'Checks validation at trust boundaries. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            code: 'function parseOrder(json) { /* expects { id: number, total: number } */ }',
            answer: 'Check types explicitly at the boundary and throw early, so the rest of the app can trust its types. Relying on TypeScript types alone is the common mistake, because types disappear at runtime. A strong answer suggests a schema library (zod/valibot) for scale and failing loudly with telemetry.',
            solution: `function parseOrder(json) {
  if (!json || !Number.isInteger(json.id) || !Number.isFinite(json.total)) throw new TypeError('Bad order');
  return { id: json.id, total: json.total };
}`,
          },
          {
            task: 'Fix this code so it passes the lint rules eqeqeq and no-implicit-coercion. Do not change its behavior.',
            description: 'Checks lint-friendly explicit conversions. Show the snippet, ask the candidate to explain the bug first, then write the fix.',
            code: `if (count == '0') hide();
const n = +input;
const flag = !!value;`,
            answer: 'Make the conversions explicit: Number(count) === 0, Number(input), Boolean(value). A careless fix changes behavior, e.g. count === "0" misses the number 0. A strong answer keeps semantics identical and explains why explicit conversion reads better in review.',
            solution: `if (Number(count) === 0) hide();
const n = Number(input);
const flag = Boolean(value);`,
          },
        ],
      },
      {
        q: 'Code review: this API layer changes types without telling anyone. What would you change? What team rule would you add?',
        code: `export async function getPrice(id) {
  const r = await fetch('/price/' + id);
  const d = await r.json();
  return d.price * 1 || 0;
}`,
        short: 'The "* 1 || 0" hides malformed data and HTTP errors by turning them into a price of 0, which is a business bug. Validate the payload, fail loudly, encode the URL, and make "no silent coercion at boundaries" a review rule.',
        fix: `export async function getPrice(id) {
  const r = await fetch('/price/' + encodeURIComponent(id));
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const d = await r.json();
  if (typeof d?.price !== 'number' || !Number.isFinite(d.price)) throw new TypeError('Invalid price payload');
  return d.price;
}`,
        long: `A price of 0 is a valid-looking value: users may see free items, and monitoring sees nothing.
Also missing: r.ok handling and encodeURIComponent for the id.
Rule: boundary functions validate with a schema and throw typed errors; UI decides how to show failure.
Enforce with lint (no-implicit-coercion), shared fetch wrapper, and alerts on validation failures.
Strong candidate talks about failure visibility and business impact; weak candidate only reformats the code.`,
        exercises: [
          {
            task: 'Fix the default values so they do not hide missing data.',
            description: 'Checks fail-loud vs fail-silent design. Present as a PR review.',
            code: 'const discount = config.discount || 0.1;',
            answer: 'If discount is legitimately 0, || turns it into 10%; if config is malformed, the bug is hidden. Use ?? and validate the config at startup. A strong answer separates "missing" from "zero".',
            solution: `if (config.discount != null && typeof config.discount !== 'number') throw new TypeError('discount must be a number');
const discount = config.discount ?? 0.1;`,
          },
          {
            task: 'Implement a small assertNumber helper. Teams can reuse it where data enters the app.',
            description: 'Checks how to build shared guardrails. Live-code and discuss the error messages.',
            answer: 'A reusable assertion with a clear message standardizes boundary checks and produces useful error reports. A strong answer also returns the narrowed value so it composes.',
            solution: `function assertNumber(v, name) {
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new TypeError(name + ' must be a finite number, got ' + JSON.stringify(v));
  return v;
}
console.log(assertNumber(5, 'qty'));`,
          },
        ],
      },
    ],
  },
  'Function context': {
    junior: [
      {
        q: 'What is `this` inside a regular function? What is it inside an arrow function?',
        short: 'In a regular function `this` depends on how it is called (obj.method() → obj, plain call → undefined in strict mode / globalThis otherwise). An arrow function has no own `this` and uses the enclosing scope\'s.',
        long: `Binding rules for regular functions, in priority order: new (fresh object) > explicit call/apply/bind > implicit (obj.fn()) > default (undefined in strict, globalThis in sloppy mode).
Arrow functions capture this lexically at creation; call/apply/bind cannot change it and they cannot be used with new.
Classic pitfall: passing a method as a callback (setTimeout(obj.fn)) loses the implicit binding.
Arrows are great for callbacks inside methods, but wrong as object methods that need the object as this.
Strong candidate names the four rules and the "losing this" pitfall; weak candidate says "this is the object where the function is defined".`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks arrow functions and lexical this. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `const user = {
  name: 'Ann',
  greet: () => 'Hi ' + this?.name,
};
console.log(user.greet());`,
            answer: '"Hi undefined". The arrow function takes this from the module scope, where it is undefined, not from user. Many expect "Hi Ann" because the function sits inside the object literal. A strong answer explains that object literals do not create a scope for this.',
          },
          {
            task: 'Fix the bug so the button logs "Ann".',
            description: 'Checks losing the implicit binding. Show the snippet, ask the candidate to explain the bug first, then write the fix.',
            code: `const user = { name: 'Ann', log() { console.log(this.name); } };
const handler = user.log;
handler();`,
            answer: 'Copying the method out loses its implicit binding. Bind it, or wrap it in an arrow function. A weak answer blames the variable name. A strong answer names the call-site rule and offers bind, an arrow wrapper, or a class field arrow.',
            solution: `const handler = user.log.bind(user);
handler(); // Ann`,
          },
        ],
      },
      {
        q: 'Find and fix the bug: the greeting prints "Hello, undefined".',
        code: `const user = {
  name: 'Ann',
  greet: () => 'Hello, ' + this.name,
};
console.log(user.greet());`,
        short: 'Arrow functions do not get their own this; they take it from the surrounding scope (the module), not from the object. Use a method shorthand so this is the object it is called on.',
        fix: `const user = {
  name: 'Ann',
  greet() { return 'Hello, ' + this.name; },
};`,
        long: `Object literals do not create a scope for this, so the arrow sees the outer this (undefined in modules, window in sloppy scripts).
Method shorthand (greet() {}) is a regular function, so obj.greet() sets this to obj.
Arrow functions are good for callbacks inside methods, not for the methods themselves.
Strong candidate explains lexical this; weak candidate changes this.name to user.name without understanding why.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks plain call vs method call. Ask before running; assume strict mode.',
            code: `'use strict';
function who() { return this; }
const o = { who };
console.log(who(), o.who() === o);`,
            answer: 'undefined true. A plain call in strict mode has this undefined; calling via o sets this to o. Common wrong answer: window for the first one (only in sloppy mode).',
          },
          {
            task: 'Fix the bug so setInterval increments the counter.',
            description: 'Checks this in timer callbacks. Show the snippet and ask what this is inside the callback.',
            code: `function Clock() {
  this.ticks = 0;
  setInterval(function () { this.ticks++; }, 1000);
}`,
            answer: 'The callback is called by the timer, so this is not the Clock instance. Use an arrow function so this is captured from the constructor. A strong answer also mentions clearing the interval.',
            solution: `function Clock() {
  this.ticks = 0;
  this.id = setInterval(() => { this.ticks++; }, 1000);
}`,
          },
        ],
      },
    ],
    middle: [
      {
        q: 'What is printed and why? Fix it.',
        code: `const counter = {
  count: 0,
  inc() {
    setTimeout(function () { this.count++; console.log(this.count); }, 0);
  },
};
counter.inc();`,
        short: 'NaN — the regular callback is invoked by the timer with `this` set to window (or the Timeout object in Node), not counter, so undefined++ gives NaN. Use an arrow function or .bind(this).',
        fix: 'inc() { setTimeout(() => { this.count++; console.log(this.count); }, 0); }',
        long: `inc() is called as counter.inc(), so inside inc this is counter — but the inner function is a separate call made by the timer.
Browsers call timer callbacks with this = window (even in strict mode); Node passes the Timeout object. Either way .count is undefined, and undefined + 1 is NaN.
Fixes: arrow function (lexical this), .bind(this), or capturing const self = this (old style).
The same bug shows up with event listeners, array callbacks, and promise chains in class methods.
Strong candidate explains why the call site matters and gives multiple fixes; weak candidate says "this refers to setTimeout".`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks call vs bind precedence. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `function show() { return this.v; }
const a = { v: 1, show };
const b = { v: 2 };
console.log(a.show.call(b), show.bind(a).call(b));`,
            answer: '2 1. call sets this explicitly; a bound function ignores later call/apply. A frequent wrong answer is 2 2. A strong answer knows that bind creates a permanently bound function that only new can override.',
          },
          {
            task: 'Fix the class so the callback keeps its instance.',
            description: 'Checks callbacks inside class methods (strict mode). Show the snippet, ask the candidate to explain the bug first, then write the fix.',
            code: `class Timer {
  ticks = 0;
  start() { [1, 2].forEach(function () { this.ticks++; }); }
}
new Timer().start();`,
            answer: 'The plain function gets this = undefined (class bodies are strict), so it throws TypeError. Use an arrow function or pass thisArg. Candidates often expect NaN as in sloppy mode; class code is strict, so this is undefined and it throws. A strong answer also mentions forEach\'s thisArg parameter.',
            solution: 'start() { [1, 2].forEach(() => { this.ticks++; }); }',
          },
        ],
      },
      {
        q: 'Explain the difference between call, apply and bind. When would you use each?',
        short: 'call and apply invoke the function right away with a given this (call takes arguments individually, apply takes an array); bind returns a new function with this (and optionally leading arguments) fixed for later calls.',
        long: `call(ctx, a, b) — immediate invocation, e.g. borrowing methods: Array.prototype.slice.call(arguments).
apply(ctx, [a, b]) — same with an array; mostly replaced by spread (fn(...args)).
bind(ctx, a) — creates a bound function for callbacks/event handlers and for partial application; binding is permanent (only new overrides it).
Arrow functions ignore all three for this.
Strong candidate mentions method borrowing, partial application and that bind cannot be re-bound; weak candidate only recites "apply takes an array".`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks that bound functions cannot be re-bound. Ask before running.',
            code: `function f() { return this.x; }
const g = f.bind({ x: 1 }).bind({ x: 2 });
console.log(g(), f.call({ x: 3 }));`,
            answer: '1 3. The first bind wins forever; a second bind changes nothing (except adding partial args). Many answer 2.',
          },
          {
            task: 'Implement max of an array using Math.max without spread, then with spread.',
            description: 'Checks practical use of apply. Quick warm-up.',
            code: 'const nums = [3, 9, 2];',
            answer: 'Math.max takes separate arguments; apply passes an array as an argument list (this is irrelevant, so pass null). Spread is the modern equivalent; for very large arrays both can hit argument limits, so use reduce.',
            solution: `console.log(Math.max.apply(null, nums)); // 9
console.log(Math.max(...nums));        // 9`,
          },
        ],
      },
    ],
    senior: [
      {
        q: 'Implement Function.prototype.myBind. It must support partial application and the `new` keyword.',
        code: `Function.prototype.myBind = function (ctx, ...args) {
  // your code
};`,
        short: 'Return a function that calls the original with ctx and the pre-filled args; when invoked with new, ignore ctx and use the new instance, and keep the prototype chain.',
        fix: `Function.prototype.myBind = function (ctx, ...args) {
  const fn = this;
  function bound(...rest) {
    return fn.apply(this instanceof bound ? this : ctx, [...args, ...rest]);
  }
  bound.prototype = Object.create(fn.prototype);
  return bound;
};`,
        long: `Core: capture the target function (this inside myBind), the context and leading args; return a wrapper that concatenates args.
new handling: when the bound function is called with new, this is an instance of bound; the spec says the bound context is ignored, so pass this through. new.target can be used instead of instanceof.
Prototype: instances created via new bound() should be instanceof the original — linking bound.prototype to fn.prototype via Object.create avoids mutating the original prototype.
Edge cases: validate typeof this === 'function' (throw TypeError), constructors that return objects, native bind also sets name ("bound fn") and length.
Strong candidate handles new and mentions spec differences; weak candidate only does fn.apply(ctx, args) and forgets partial args.`,
        exercises: [
          {
            task: 'Implement myCall without using call, apply or bind.',
            description: 'Checks implementing explicit binding by hand. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            code: 'Function.prototype.myCall = function (ctx, ...args) { /* ... */ };',
            answer: 'Temporarily attach the function to the context under a unique Symbol key, call it as a method, then delete the key. Weak versions use a string key like "fn", which can collide with existing properties, or forget to delete it. A strong answer boxes primitives with Object(ctx) and cleans up in finally.',
            solution: `Function.prototype.myCall = function (ctx, ...args) {
  const obj = ctx == null ? globalThis : Object(ctx);
  const key = Symbol('fn');
  obj[key] = this;
  try { return obj[key](...args); } finally { delete obj[key]; }
};
function f(x) { return this.a + x; }
console.log(f.myCall({ a: 1 }, 2)); // 3`,
          },
          {
            task: 'Predict the output.',
            description: 'Checks IIFE vs arrow this inside methods. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `const obj = {
  name: 'obj',
  outer() {
    return [function () { return this; }(), (() => this.name)()];
  },
};
console.log(obj.outer());`,
            answer: '[undefined, "obj"] in strict mode (ES modules). The IIFE is a plain call so its this is undefined; the arrow function inherits this from outer. People often expect obj for both. A strong answer separates "where the function is written" from "how it is called".',
          },
        ],
      },
      {
        q: 'Explain the order of the rules for `this`. What happens when you call new on a bound function? What about arrow functions?',
        short: 'The order is: new binding > explicit (call/apply/bind) > implicit (obj.fn()) > default (undefined in strict / globalThis). new on a bound function ignores the bound this but keeps the bound arguments; arrow functions ignore all rules and use lexical this (and cannot be constructed).',
        long: `Default: plain call → undefined in strict mode, globalThis in sloppy mode.
Implicit: obj.fn() → obj; it is lost when the method is extracted or passed as a callback.
Explicit: call/apply/bind override implicit; bind is permanent.
new: creates a new object and uses it as this, even if the function was bound — the spec defines [[Construct]] on bound functions this way.
Arrows: lexical this, cannot be used with new, call/apply's first argument is ignored.
Strong candidate gives this order with examples and edge cases (bound + new, callbacks); weak candidate lists rules without precedence.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks implicit vs explicit precedence. Ask before running.',
            code: `const a = { v: 'a', f() { return this.v; } };
const b = { v: 'b' };
console.log(a.f.call(b), (0, a.f)?.call?.(a));`,
            answer: '"b" "a". Explicit call beats implicit; the comma expression detaches the method, but call(a) sets this again. A strong answer explains why (0, a.f)() alone would lose this.',
          },
          {
            task: 'Predict the output.',
            description: 'Checks new vs bind precedence. Ask the candidate to explain step by step.',
            code: `function P(n) { this.n = n; }
const Bound = P.bind({ n: 'ignored' }, 7);
const p = new Bound();
console.log(p.n, p instanceof P);`,
            answer: '7 true. new ignores the bound this but keeps the pre-filled arguments; instances still link to P.prototype. Common wrong answer: "ignored".',
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'An old codebase mixes class components with `this` bugs, hooks, and plain functions. How do you choose the coding style rules?',
        ai: true,
        short: 'Prefer functions/closures and hooks for new code, document a migration path, enforce with lint rules, and migrate opportunistically when files are touched rather than big-bang.',
        long: `Decide based on data: where do bugs cluster, what is the team comfortable with, what does the framework recommend going forward.
Guideline: new UI code uses function components + hooks; class components remain supported but are not extended; utilities are plain functions.
Enforce with lint (no-invalid-this, prefer-arrow-callback, react/prefer-stateless-function) and code review.
Migration: boy-scout rule when touching a file, with tests first; prioritize high-churn/high-bug areas; avoid rewriting stable code just for style.
Document patterns and anti-patterns (stale closures in hooks replace this-binding bugs — they are not free).
Strong candidate weighs risk, cost and consistency; weak candidate demands a full rewrite or has no opinion.`,
        exercises: [
          {
            task: 'Fix this class so handlers keep `this`. Do not bind them inside every render.',
            description: 'Checks stable handler identity in class components. Show the snippet, ask the candidate to explain the bug first, then write the fix.',
            code: `class List {
  constructor(items) { this.items = items; }
  onClick(e) { console.log(this.items.length); }
  render(el) { el.addEventListener('click', this.onClick); }
}`,
            answer: 'Make the handler a class-field arrow so it is bound once per instance; or bind once in the constructor. Binding inside render creates a new function every time, which breaks removal and memoization. A strong answer weighs class fields vs constructor bind, and the per-instance memory cost.',
            solution: `class List {
  constructor(items) { this.items = items; }
  onClick = () => { console.log(this.items.length); };
  render(el) { el.addEventListener('click', this.onClick); }
}`,
          },
          {
            task: 'Rewrite this this-based object as a closure-based factory with the same API.',
            description: 'Checks closures as an alternative to this. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            code: 'const counter = { n: 0, inc() { return ++this.n; } };',
            answer: 'Keep state in a closure variable so callers can pass methods around without losing context. A weak answer keeps this but adds arrows everywhere. A strong answer mentions the trade-off: closures cannot share methods via the prototype.',
            solution: `function createCounter() {
  let n = 0;
  return { inc: () => ++n };
}
const { inc } = createCounter();
console.log(inc(), inc()); // 1 2`,
          },
        ],
      },
      {
        q: 'Code review: a shared utility passes object methods as callbacks in many places. This keeps causing crashes because `this` is lost. What do you change?',
        code: `export function retry(fn, times) {
  return async (...args) => {
    for (let i = 0; i < times; i++) {
      try { return await fn(...args); } catch (e) { if (i === times - 1) throw e; }
    }
  };
}
const safeLoad = retry(apiClient.load, 3); // crashes: this is undefined`,
        short: 'Passing apiClient.load detaches it, so this is undefined inside. Fix at the call site (bind or arrow wrapper), and make wrappers forward this with fn.apply(this, args) so they are transparent.',
        fix: `export function retry(fn, times) {
  return async function (...args) {
    for (let i = 0; i < times; i++) {
      try { return await fn.apply(this, args); } catch (e) { if (i === times - 1) throw e; }
    }
  };
}
const safeLoad = retry(apiClient.load.bind(apiClient), 3);`,
        long: `Higher-order utilities should preserve this and arguments; otherwise they break methods silently.
Call sites should pass bound functions or arrows: retry(() => apiClient.load(), 3).
Longer term: design APIs that do not depend on this (closure-based clients) and lint with no-invalid-this/unbound-method (typescript-eslint).
Add a unit test that wraps a method using this.
Strong candidate fixes both the utility and the call site and proposes a lint rule; weak candidate fixes only one place.`,
        exercises: [
          {
            task: 'Fix the call site without changing the utility.',
            description: 'Checks quick, safe fixes in review. Ask for two options.',
            code: 'const safeLoad = retry(apiClient.load, 3);',
            answer: 'Either bind the method or wrap it in an arrow. The arrow also allows extra logic and works for methods defined on the prototype. A strong answer explains why both preserve this.',
            solution: `const safeLoad = retry(() => apiClient.load(), 3);
// or: retry(apiClient.load.bind(apiClient), 3)`,
          },
          {
            task: 'Implement a logging wrapper, like a decorator. It must keep `this` and the return value.',
            description: 'Checks transparent higher-order functions. Live-code, then test with a method.',
            answer: 'Use a regular function and apply so this and arguments pass through; return the result. An arrow wrapper would lose the caller\'s this.',
            solution: `function logged(fn) {
  return function (...args) {
    console.log('call', fn.name, args);
    return fn.apply(this, args);
  };
}
const o = { x: 2, double: logged(function double(n) { return n * this.x; }) };
console.log(o.double(5)); // 10`,
          },
        ],
      },
    ],
  },
  'Scope and Closures': {
    junior: [
      {
        q: 'What does this print? Predict it before you run it. Then fix it in two ways.',
        ai: true,
        code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}`,
        short: '3 3 3 — var is function-scoped, so all callbacks share one i, which is 3 when they run. Fix with let (new binding per iteration), or pass i as a setTimeout argument / IIFE.',
        fix: 'for (let i = 0; i < 3; i++) setTimeout(() => console.log(i), 0);',
        follow: 'What if the delay is i times 1000?',
        long: `A closure captures variables (bindings), not values.
With var there is a single i for the whole function; the loop finishes before any timer fires, leaving i === 3.
let in a for loop creates a fresh binding per iteration and copies the value forward, so each callback sees its own i.
Alternatives: setTimeout(console.log, 0, i), or an IIFE ((j) => setTimeout(() => console.log(j)))(i).
Follow-up: with i * 1000 and var it prints 3 three times at 0s, 1s, 2s — the delay is evaluated immediately, the log is not.
Strong candidate explains binding vs value; weak candidate says "setTimeout is async" without explaining why it is 3.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks shadowing and function scope. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `let a = 1;
function f() { let a = 2; return a; }
console.log(f(), a);`,
            answer: '2 1. The inner a is a separate variable in the function scope and shadows the outer one. Some answer 2 2, thinking the assignment leaks out. A strong answer names shadowing and explains that let creates a new binding.',
          },
          {
            task: 'Implement makeCounter. It returns a function that gives 1, then 2, then 3, and so on.',
            description: 'Checks closures keeping private state. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            answer: 'The returned function closes over a private count variable. Using a global counter is the common mistake. A strong answer shows that each makeCounter() call gets independent state.',
            solution: `function makeCounter() { let c = 0; return () => ++c; }
const next = makeCounter();
console.log(next(), next()); // 1 2`,
          },
        ],
      },
      {
        q: 'What is a closure? Give a simple practical example.',
        short: 'A closure is a function together with the variables from the scope where it was created; it can use them even after the outer function has returned. Example: a counter factory or an event handler remembering an id.',
        long: `Every JS function captures its lexical environment; "closure" names the case where an inner function outlives its outer one.
Uses: private state (counters, modules), function factories, callbacks that remember context, memoization.
Closures capture variables, not values — later changes are visible.
Memory: anything captured stays alive as long as the function does.
Strong candidate gives a real use case and the "variables not values" nuance; weak candidate only says "a function inside a function".`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks that closures capture variables, not values. Ask before running.',
            code: `function make() {
  let n = 1;
  const get = () => n;
  n = 5;
  return get;
}
console.log(make()());`,
            answer: '5. get reads the current value of n when called, not the value at creation time. Common wrong answer: 1.',
          },
          {
            task: 'Implement a greeter factory. makeGreeter("Hi") returns a function. That function takes a name and returns "Hi, name".',
            description: 'Checks function factories. Quick live-code warm-up.',
            answer: 'The returned function closes over the greeting parameter. A strong answer shows two greeters with independent settings.',
            solution: `const makeGreeter = (greeting) => (name) => greeting + ', ' + name;
console.log(makeGreeter('Hi')('Ann'), makeGreeter('Yo')('Bob'));`,
          },
        ],
      },
    ],
    middle: [
      {
        q: 'Implement once and memoize. What is the memory risk of memoize?',
        short: 'Both keep state in a closure. memoize\'s cache grows unbounded and keeps keys/results alive — bound it (LRU/TTL) or use WeakMap for object keys.',
        fix: `const once = (fn) => { let done = false, r; return (...a) => done ? r : (done = true, r = fn(...a)); };
const memoize = (fn) => { const c = new Map(); return (k) => c.has(k) ? c.get(k) : (c.set(k, fn(k)), c.get(k)); };`,
        long: `once: a closure flag plus a cached result; subsequent calls return the first result. Consider whether this should be forwarded (fn.apply(this, a)).
memoize: a Map keyed by argument; works only for pure functions. Multi-arg needs a key strategy (JSON.stringify is slow and lossy; nested Maps or a resolver function are better).
Memory: the closure keeps the Map alive as long as the memoized function lives — a module-level memoize is effectively a global leak.
Mitigations: LRU size limit, TTL, WeakMap when keys are objects (entries die with the key), or scoping the memoized function to a component lifecycle.
For async functions, evict rejected promises so failures are not cached forever.
Strong candidate brings up key strategy, eviction and async; weak candidate stops at the Map.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks var vs let bindings in loops. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `const fns = [];
for (var i = 0; i < 3; i++) fns.push(() => i);
for (let j = 0; j < 3; j++) fns.push(() => j);
console.log(fns.map((f) => f()));`,
            answer: '[3, 3, 3, 0, 1, 2]. var gives one shared binding; let gives a new binding per iteration. Candidates often guess [0, 1, 2, 0, 1, 2]. A strong answer explains the per-iteration binding of let and that i is 3 when the loop ends.',
          },
          {
            task: 'Implement a private bank account with deposit and balance. Code outside must not be able to change the balance.',
            description: 'Checks data privacy via closures. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            answer: 'Keep the balance in a closure variable and expose only functions. Exposing a balance property that can be overwritten defeats the purpose. A strong answer compares this with #private fields.',
            solution: `function account() {
  let bal = 0;
  return { deposit: (n) => (bal += n), balance: () => bal };
}
const acc = account();
acc.deposit(5);
console.log(acc.balance(), acc.bal); // 5 undefined`,
          },
        ],
      },
      {
        q: 'Find and fix the bug. The search still runs on every key press, even with debounce.',
        code: `input.addEventListener('input', (e) => {
  const run = debounce(search, 300);
  run(e.target.value);
});`,
        short: 'A new debounced function, with a new closure and timer, is created on every event. Each one fires once. Create the debounced function once, outside the handler.',
        long: `debounce keeps its timer in a closure. The timer is shared only between calls to the same returned function.
Creating it inside the handler makes a fresh closure each time, so there is nothing to cancel.
Create the wrapper once at module or component setup and reuse it.
In React, keep it in useMemo or useRef, or it is recreated on every render.
Strong answer: explains the closure lifetime and gives the framework version. Weak answer: increases the delay.`,
        fix: `const run = debounce(search, 300);
input.addEventListener('input', (e) => run(e.target.value));`,
        follow: 'How would you keep the same debounced function in a React component?',
        exercises: [
          {
            code: `function makeCounter() { let count = 0; return () => console.log(++count); }
const a = makeCounter();
const b = makeCounter();
a(); a(); b();`,
            task: 'How many times does log run? Explain.',
            description: 'Checks understanding of separate closures.',
            answer: 'Three times. Each makeCounter call creates its own count variable, so a and b do not share state: a logs 1 and 2, b logs 1.',
          },
          {
            task: 'Fix the React version so the debounce works.',
            description: 'The debounced function is created in the component body.',
            answer: 'Keep it stable across renders with useMemo (or useRef) and cancel it on unmount. Use a ref to read the latest callback if it changes.',
            solution: `const run = useMemo(() => debounce((q) => search(q), 300), []);
useEffect(() => () => run.cancel?.(), [run]);`,
          },
        ],
      },
    ],
    senior: [
      {
        q: 'Explain the TDZ, the temporal dead zone. What happens here and why?',
        code: `let x = 1;
{
  console.log(x);
  let x = 2;
}`,
        short: 'ReferenceError — the inner let x is hoisted to the top of the block and shadows the outer x, but it is in the temporal dead zone until its declaration line runs.',
        long: `let/const/class declarations are hoisted (the binding exists from the block start) but are uninitialized until evaluation reaches them; accessing them in between throws ReferenceError.
Scope resolution is lexical and static: inside the block, the name x always refers to the inner binding, so the outer x is not visible.
var is hoisted and initialized to undefined, which hides bugs; the TDZ makes them loud.
typeof is not safe in the TDZ (typeof x throws), unlike for undeclared variables.
Default parameters have their own TDZ: function f(a = b, b) {} throws when b is used before initialization.
Strong candidate explains "hoisted but uninitialized" and shadowing; weak candidate says "let is not hoisted" or expects 1.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks hoisting of declarations vs expressions. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `console.log(typeof hoisted, typeof notHoisted);
function hoisted() {}
var notHoisted = function () {};`,
            answer: '"function undefined". Function declarations are hoisted with their body; var is hoisted and set to undefined, and the assignment happens later. A common wrong answer is a ReferenceError for notHoisted. A strong answer separates hoisting of the declaration from hoisting of the assignment.',
          },
          {
            task: 'Fix the bug: each handler should log its own index without using let.',
            description: 'Checks pre-ES6 closure capture patterns. Show the snippet, ask the candidate to explain the bug first, then write the fix.',
            code: `var handlers = [];
for (var i = 0; i < 3; i++) handlers.push(function () { return i; });`,
            answer: 'Create a new scope per iteration with a function factory, so each closure captures its own value. Weak answers fall back to let, which the task forbids. A strong answer explains why a new function scope per iteration fixes it (IIFE or factory).',
            solution: `var handlers = [];
function make(n) { return function () { return n; }; }
for (var i = 0; i < 3; i++) handlers.push(make(i));
console.log(handlers.map(function (h) { return h(); })); // [0, 1, 2]`,
          },
        ],
      },
      {
        q: 'Explain lexical scope and dynamic scope. How do the scope chain and hoisting work in JavaScript?',
        short: 'JavaScript uses lexical scope: where a function is written determines which variables it can see, not where it is called from. Name lookup walks the chain of enclosing scopes up to the global scope; declarations are hoisted to the top of their scope (var initialized to undefined, let/const/class left uninitialized in the TDZ).',
        long: `Scopes: global, module, function, block (let/const/class), plus catch and the parameter scope.
The scope chain is fixed when the code is parsed; this is the exception to the "lexical" rule, being determined at call time.
Hoisting: function declarations are fully hoisted; var is hoisted as undefined; let/const are hoisted but in the TDZ.
eval and with can break lexical rules, which is why strict mode restricts them.
Closures are a direct consequence of lexical scope.
Strong candidate separates scope from this and explains the TDZ; weak candidate thinks a function sees the caller's variables.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks lexical vs call-site lookup. Ask before running.',
            code: `const v = 'global';
function show() { return v; }
function run() { const v = 'local'; return show(); }
console.log(run());`,
            answer: '"global". show looks up v where it was defined, not where it is called. Candidates who think in dynamic scope answer "local".',
          },
          {
            task: 'Predict the output.',
            description: 'Checks function declarations inside blocks and hoisting. Ask the candidate to explain each step.',
            code: `console.log(typeof f);
var f = 1;
function f() {}
console.log(typeof f);`,
            answer: '"function" then "number". The function declaration is hoisted with its body; then the var assignment runs and overwrites f with 1. Common wrong answer: undefined first.',
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'In a long-running SPA, closures can cause memory leaks. How would you find these leaks before they reach production?',
        ai: true,
        short: 'Automated heap checks in E2E (e.g. memlab), a review checklist for cleaning up listeners/timers/subscriptions, and memory monitoring in RUM (measureUserAgentSpecificMemory) with alerts.',
        long: `Typical leak sources: event listeners and intervals not removed on unmount, subscriptions, global caches/maps, detached DOM nodes captured by closures, third-party widgets.
Prevention: conventions (every subscription returns a cleanup; AbortController for listeners), lint rules (react-hooks/exhaustive-deps), code review checklist.
Detection pre-prod: scripted scenarios (navigate in/out N times) with memlab or Puppeteer heap snapshots, failing CI if retained size grows beyond a threshold.
Detection in prod: performance.measureUserAgentSpecificMemory (cross-origin isolated) or performance.memory in Chrome, correlation with session length, crash reports on mobile.
Ownership: assign leak bugs to feature owners, track the trend per release.
Strong candidate describes a repeatable pipeline and root causes; weak candidate says "use Chrome DevTools when someone complains".`,
        exercises: [
          {
            task: 'Fix the leak: this cache is captured by a long-lived closure and never shrinks.',
            description: 'Checks unbounded module-level caches. Show the snippet, ask the candidate to explain the bug first, then write the fix.',
            code: `const cache = {};
export function getReport(id) {
  return cache[id] ??= buildReport(id);
}`,
            answer: 'Bound the cache (an LRU with a max size) or make its lifetime explicit with a clear() tied to logout or navigation. Swapping in a WeakMap with string keys is a wrong fix, because WeakMap keys must be objects. A strong answer adds eviction plus explicit lifecycle hooks and monitoring.',
            solution: `const cache = new Map();
const MAX = 100;
export function getReport(id) {
  if (cache.has(id)) { const v = cache.get(id); cache.delete(id); cache.set(id, v); return v; }
  const v = buildReport(id);
  cache.set(id, v);
  if (cache.size > MAX) cache.delete(cache.keys().next().value);
  return v;
}
export const clearReports = () => cache.clear();`,
          },
          {
            task: 'Implement a subscribe helper that returns an unsubscribe function, so teams cannot forget to clean up.',
            description: 'Checks API design that enforces cleanup. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            answer: 'Return the cleanup from the same call that registers the listener; this matches the useEffect cleanup contract. A weak answer relies on documentation alone. A strong answer designs the API so cleanup is the default (returned disposer, AbortSignal option).',
            solution: `function createEmitter() {
  const subs = new Set();
  return {
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
    emit(v) { subs.forEach((fn) => fn(v)); },
  };
}
const em = createEmitter();
const off = em.subscribe(console.log);
em.emit(1); off(); em.emit(2); // logs 1 only`,
          },
        ],
      },
      {
        q: 'Code review: this React-style hook has a stale closure bug. Several teams hit it. Explain the bug and define a team pattern to prevent it.',
        code: `function useTicker() {
  let count = 0; // imagine useState
  const [state, setState] = [count, (v) => { count = v; }];
  setInterval(() => setState(state + 1), 1000);
  return () => count;
}`,
        short: 'The interval callback captured state once (0), so it keeps setting 1 forever. Use functional updates (setState(c => c + 1)) or a ref for the latest value, and always return a cleanup for the interval.',
        fix: `function useTicker() {
  let count = 0;
  const setState = (updater) => { count = updater(count); };
  const id = setInterval(() => setState((c) => c + 1), 1000);
  return { get: () => count, stop: () => clearInterval(id) };
}`,
        long: `Stale closures happen when a long-lived callback captures a value from one render/iteration and never sees updates.
In React: setInterval in useEffect with [] dependencies, event listeners, debounced callbacks.
Team pattern: functional state updates, useRef for "latest value", exhaustive-deps lint enabled as an error, cleanup for every subscription.
Document it with a minimal repro in the team guide.
Strong candidate explains why the value is frozen and both fixes; weak candidate adds more dependencies until it "works".`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks frozen captured values. Ask before running.',
            code: `let state = 0;
const captured = state;
const tick = () => (state = captured + 1);
tick(); tick(); tick();
console.log(state);`,
            answer: '1. Each tick computes from the captured 0, not the latest state. A functional update that reads the current value would give 3.',
          },
          {
            task: 'Implement a "latest ref" helper, so callbacks always read the newest value.',
            description: 'Checks the ref pattern behind useLatest/useEvent. Live-code and discuss when to use it.',
            answer: 'Store the value in a mutable box that is updated on every change; long-lived callbacks read box.current instead of a captured value.',
            solution: `function createLatest(initial) {
  const ref = { current: initial };
  return { set: (v) => { ref.current = v; }, ref };
}
const latest = createLatest(0);
const log = () => console.log(latest.ref.current);
latest.set(5); log(); // 5`,
          },
        ],
      },
    ],
  },
  'Asynchronous code': {
    junior: [
      {
        q: 'What is the difference between synchronous and asynchronous code? Give a browser example.',
        short: 'Synchronous code runs to completion and blocks the thread; asynchronous code starts work and continues, handling the result later via callbacks/promises. Examples: fetch, setTimeout, event listeners.',
        long: `JS runs on a single main thread; a long synchronous task blocks rendering and input.
Async APIs hand work to the browser (network, timers, I/O) and queue a callback when done; the event loop runs it once the stack is empty.
async/await is syntax over promises — it looks sequential but does not block the thread.
Pitfall: async does not mean parallel CPU work; heavy computation still blocks unless moved to a Web Worker.
Strong candidate mentions the single thread and event loop; weak candidate says "async runs in another thread".`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks timer queue ordering. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `console.log('a');
setTimeout(() => console.log('b'), 100);
setTimeout(() => console.log('c'), 0);
console.log('d');`,
            answer: 'a d c b. Synchronous logs run first, then timers fire in order of expiry. Some say c runs before d because the delay is 0. A strong answer explains that the synchronous code always finishes first.',
          },
          {
            task: 'Implement sleep(ms) that returns a promise, and use it to log "done" after 50ms.',
            description: 'Checks wrapping callbacks in promises. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            answer: 'Wrap setTimeout in a Promise and resolve it when the timer fires. Calling resolve immediately or forgetting to return the promise are typical bugs. A strong answer also shows the await sleep(50) usage.',
            solution: `const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
sleep(50).then(() => console.log('done'));`,
          },
        ],
      },
      {
        q: 'Find and fix the bug: data is logged as undefined.',
        code: `let data;
fetch('/api/user').then((r) => r.json()).then((d) => { data = d; });
console.log(data);`,
        short: 'console.log runs immediately, before the request finishes, so data is still undefined. Use the value inside the then callback or after await.',
        fix: `async function main() {
  const r = await fetch('/api/user');
  const data = await r.json();
  console.log(data);
}
main();`,
        long: `fetch is asynchronous; the rest of the synchronous code keeps running.
The callback assigning data runs later, after the current code (and the network) finishes.
Fix: move the usage into the async flow — then callback or async/await.
Strong candidate explains the order of execution; weak candidate adds setTimeout to "wait".`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks async function return values. Ask before running.',
            code: `async function getNum() { return 42; }
console.log(getNum());
getNum().then(console.log);`,
            answer: 'First a Promise (shown as Promise { 42 }), then 42. An async function always returns a promise, even for plain values. Common wrong answer: 42 twice.',
          },
          {
            task: 'Fix the bug: the error is not caught.',
            description: 'Checks try/catch with missing await. Show it as a code review.',
            code: `async function save() {
  try {
    return api.post('/save');
  } catch (e) {
    console.log('failed');
  }
}`,
            answer: 'Returning the promise without await exits the try block before it rejects, so catch never runs. Use return await inside try/catch.',
            solution: `async function save() {
  try {
    return await api.post('/save');
  } catch (e) {
    console.log('failed');
  }
}`,
          },
        ],
      },
    ],
    middle: [
      {
        q: 'This is slow. Why? Rewrite it. What if one request fails?',
        code: `async function loadAll(ids) {
  const result = [];
  for (const id of ids) result.push(await fetchUser(id));
  return result;
}`,
        short: 'Each await waits for the previous request, so total time is the sum. Start all requests and await Promise.all; use Promise.allSettled to tolerate failures and limit concurrency for many ids.',
        fix: 'const loadAll = (ids) => Promise.all(ids.map(fetchUser));',
        long: `Sequential awaits are correct only when requests depend on each other; here they are independent.
Promise.all runs them concurrently and preserves order; total time ≈ the slowest request.
Promise.all rejects on the first failure (other requests keep running but their results are lost); Promise.allSettled returns a status per item so you can show partial data.
For hundreds of ids, unbounded parallelism can hit connection/rate limits — use a concurrency limit or a batch endpoint.
Consider AbortController to cancel the rest when the user navigates away.
Strong candidate discusses failure semantics and concurrency; weak candidate uses forEach(async ...), which does not wait at all.`,
        exercises: [
          {
            task: 'Fix the bug: the function returns before any item is saved.',
            description: 'Checks async callbacks in forEach. Show the snippet, ask the candidate to explain the bug first, then write the fix.',
            code: `async function saveAll(items) {
  items.forEach(async (it) => { await save(it); });
  console.log('all saved');
}`,
            answer: 'forEach ignores the promises its callback returns. Await Promise.all over map (or use for...of for sequential saves). Making forEach "async" does nothing for the outer function. A strong answer picks parallel vs sequential deliberately and handles failures (allSettled).',
            solution: `async function saveAll(items) {
  await Promise.all(items.map((it) => save(it)));
  console.log('all saved');
}`,
          },
          {
            task: 'Implement withTimeout with a promise and a time in ms. It rejects if the promise does not finish in time.',
            description: 'Checks promise racing and resource cleanup. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            answer: 'Race the promise against a timer that rejects, and clear the timer either way. Forgetting clearTimeout leaves a timer that keeps Node alive. A strong answer notes that the original operation keeps running unless it is cancelled with AbortSignal.',
            solution: `function withTimeout(p, ms) {
  let t;
  const timeout = new Promise((_, rej) => { t = setTimeout(() => rej(new Error('Timeout')), ms); });
  return Promise.race([p, timeout]).finally(() => clearTimeout(t));
}
withTimeout(new Promise((r) => setTimeout(r, 100)), 10).catch((e) => console.log(e.message)); // Timeout`,
          },
        ],
      },
      {
        q: 'Compare Promise.all, Promise.allSettled, Promise.race and Promise.any. Give a use case for each.',
        short: 'all resolves with every result or rejects on the first failure; allSettled always resolves with a status per promise; race settles with the first one to settle (success or failure); any resolves with the first success and rejects with AggregateError only if all fail.',
        long: `all: independent requests that are all required (page data); fails fast.
allSettled: dashboards with independent widgets — show what loaded, report what failed.
race: timeouts (race the request against a rejecting timer).
any: redundant sources/mirrors — take the fastest successful one.
None of them cancel the other promises; use AbortController for that.
Empty input: all/allSettled resolve to [], any rejects, race stays pending forever.
Strong candidate knows the empty-input and no-cancellation details; weak candidate confuses race and any.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks race vs any semantics. Ask before running.',
            code: `const fail = Promise.reject(new Error('f'));
const ok = new Promise((r) => setTimeout(() => r('ok'), 10));
Promise.race([fail, ok]).catch((e) => console.log('race', e.message));
Promise.any([fail, ok]).then((v) => console.log('any', v));`,
            answer: '"race f" then "any ok". race takes the first to settle, which is the rejection; any skips rejections and waits for a success.',
          },
          {
            task: 'Predict the output.',
            description: 'Checks empty-input behavior of combinators. Ask the candidate to reason about each.',
            code: `Promise.all([]).then((v) => console.log('all', v));
Promise.any([]).catch((e) => console.log('any', e.constructor.name));`,
            answer: '"all []" and "any AggregateError". There is nothing to wait for, so all resolves immediately; any rejects because no promise can succeed. race([]) would never settle.',
          },
        ],
      },
    ],
    senior: [
      {
        q: 'Implement a function that runs async tasks, at most N at the same time. Keep the order of results.',
        code: 'async function runWithLimit(tasks /* () => Promise */, limit) {}',
        short: 'Use a worker pool: start N workers that each pull the next task index from a shared counter and write results by index, then await all workers.',
        fix: `async function runWithLimit(tasks, limit) {
  const res = []; let i = 0;
  const worker = async () => { while (i < tasks.length) { const k = i++; res[k] = await tasks[k](); } };
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return res;
}`,
        follow: 'Add cancellation via AbortSignal and retries with backoff.',
        long: `Tasks must be functions returning promises — passing promises would mean they already started.
The shared index is safe because JS is single-threaded: i++ happens synchronously between awaits.
Writing res[k] preserves input order regardless of completion order.
Error semantics: this version rejects on the first failure (like Promise.all) while other workers continue; alternatives collect settled results or stop workers via a flag.
Extensions: an AbortSignal checked before each task and passed to tasks, retry with exponential backoff + jitter, progress callbacks.
Strong candidate explains why it is race-free and defines error behavior; weak candidate chunks into batches of N (slower — each batch waits for its slowest task).`,
        exercises: [
          {
            task: 'Implement fetchJson with a url and a signal. It can be cancelled and rejects with AbortError. Then show how to cancel it.',
            description: 'Checks cancellation with AbortController. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            answer: 'Pass the signal to fetch; calling abort() makes the pending fetch reject with a DOMException named AbortError. Some think abort() resolves the promise, or that it stops server work. A strong answer distinguishes AbortError from real failures in UI handling.',
            solution: `async function fetchJson(url, signal) {
  const r = await fetch(url, { signal });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}
const ctrl = new AbortController();
fetchJson('https://example.com/data.json', ctrl.signal).catch((e) => console.log(e.name)); // AbortError
ctrl.abort();`,
          },
          {
            task: 'Predict the output and the total time.',
            description: 'Checks promise creation vs awaiting. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `const wait = (v, ms) => new Promise((r) => setTimeout(() => r(v), ms));
(async () => {
  const a = wait('a', 100);
  const b = wait('b', 100);
  console.log(await a, await b);
})();`,
            answer: '"a b" after about 100ms, not 200ms. Both timers start when the promises are created; await only waits for them. A frequent wrong answer is 200ms. A strong answer explains that promises are eager, and the danger: if a rejects first, b may become an unhandled rejection.',
          },
        ],
      },
      {
        q: 'What is backpressure? In JavaScript, how do you handle a producer that is faster than its consumer?',
        short: 'Backpressure means the consumer signals the producer to slow down so data does not pile up in memory. In JS you use pull-based designs (async iterators, ReadableStream), bounded queues, or concurrency limits instead of firing everything at once.',
        long: `Example: reading a huge file or WebSocket stream and processing it slower than it arrives; unbounded arrays of promises grow until memory runs out.
Streams API: ReadableStream with highWaterMark and pull(); pipeTo/pipeThrough propagate backpressure automatically.
Async iterators: for await pulls one item at a time; the producer does not run ahead.
Bounded queues/semaphores: limit in-flight work; drop or buffer with explicit policies (throttle, sample).
Node streams: write() returning false and the 'drain' event.
Strong candidate gives a concrete case and a mechanism; weak candidate says "use Promise.all".`,
        exercises: [
          {
            task: 'Implement a semaphore that limits how many async operations run at once.',
            description: 'Checks bounded concurrency primitives. Live-code and test with timers.',
            answer: 'Keep a counter and a queue of waiters; acquire waits when the limit is reached, release wakes the next waiter. This bounds memory and load.',
            solution: `function semaphore(max) {
  let active = 0; const queue = [];
  const acquire = () => active < max ? (active++, Promise.resolve()) : new Promise((r) => queue.push(r));
  const release = () => { const next = queue.shift(); next ? next() : active--; };
  return async (fn) => { await acquire(); try { return await fn(); } finally { release(); } };
}
const limit = semaphore(2);
[1, 2, 3].forEach((n) => limit(() => new Promise((r) => setTimeout(() => r(console.log('done', n)), 10))));`,
          },
          {
            task: 'Implement a ReadableStream that produces numbers lazily, only when the consumer pulls.',
            description: 'Checks pull-based streams. Works in modern browsers and Node 18+.',
            answer: 'pull() is called only when the internal queue has room, so the producer never runs ahead of the consumer.',
            solution: `let n = 0;
const stream = new ReadableStream({
  pull(controller) { n < 3 ? controller.enqueue(n++) : controller.close(); },
});
(async () => { for await (const v of stream) console.log(v); })(); // 0 1 2`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'Requests race each other, so users see old or mixed data on many screens. How do you make all teams handle async data the same way?',
        ai: true,
        short: 'Introduce one data layer (e.g. TanStack Query) with cache keys, cancellation, dedup, retry and invalidation policies, document the patterns, and lint against raw fetch in components.',
        long: `Root causes: out-of-order responses overwriting newer state, no cancellation on unmount/param change, duplicate caches per screen, missing invalidation after mutations.
Standardize on a server-state library: query keys, staleTime policy, automatic dedup, AbortSignal integration, mutation → invalidate flow, optimistic updates with rollback.
Shared API client: auth, error normalization, retries with backoff for idempotent requests only.
Guardrails: ESLint no-restricted-syntax/imports for fetch in components, templates/generators, code review checklist.
Observability: log race/abort counts and error rates per endpoint; error boundaries per route.
Rollout: pilot on the worst screen, measure bug reduction, then migrate.
Strong candidate diagnoses race mechanics and gives an adoption plan; weak candidate adds more useEffect flags.`,
        exercises: [
          {
            task: 'Fix the race: a slow response for an old query can overwrite results for the new one.',
            description: 'Checks race conditions in search UIs. Show the snippet, ask the candidate to explain the bug first, then write the fix.',
            code: `let results;
async function onSearch(q) {
  results = await api.search(q);
}`,
            answer: 'Cancel the previous request with AbortController (or compare a request id) so only the latest response is applied. Debouncing alone is the common wrong fix, because responses can still arrive out of order. A strong answer combines cancellation with a latest-wins check and moves it into a shared data layer.',
            solution: `let results, ctrl;
async function onSearch(q) {
  ctrl?.abort();
  ctrl = new AbortController();
  try { results = await api.search(q, { signal: ctrl.signal }); }
  catch (e) { if (e.name !== 'AbortError') throw e; }
}`,
          },
          {
            task: 'Implement a stale-while-revalidate getter. Return cached data right away, and refresh it in the background.',
            description: 'Checks stale-while-revalidate caching. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            answer: 'Serve the cached value if there is one, start a refresh, and only wait when nothing is cached yet. This is the pattern data libraries standardize. A weak version waits for the refresh every time. A strong answer discusses staleness windows, error handling of background refreshes, and dedup.',
            solution: `const cache = new Map();
function swr(key, loader) {
  const refresh = loader().then((v) => (cache.set(key, v), v));
  return cache.has(key) ? Promise.resolve(cache.get(key)) : refresh;
}
let n = 0;
const load = () => Promise.resolve(++n);
swr('k', load).then(console.log);                              // 1
setTimeout(() => swr('k', load).then(console.log), 10);          // 1 (refresh to 2 runs in background)`,
          },
        ],
      },
      {
        q: 'Code review: a page sends 300 requests when it loads. The API starts to block requests because of rate limits. What do you change in the code and in the process?',
        code: `async function loadDashboard(widgetIds) {
  return Promise.all(widgetIds.map((id) => fetch('/api/widget/' + id).then((r) => r.json())));
}`,
        short: 'Prefer a batch endpoint (or GraphQL/BFF) so it is one request; if that is impossible, add a concurrency limit and handle failures with allSettled. Process: agree on API design with the backend and add request-count budgets and monitoring.',
        fix: `async function loadDashboard(widgetIds) {
  const r = await fetch('/api/widgets?ids=' + widgetIds.map(encodeURIComponent).join(','));
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}`,
        long: `Unbounded Promise.all over hundreds of items overloads browser connection pools and the API and fails entirely on one error.
Best fix is architectural: a batch endpoint or backend-for-frontend aggregation.
Short-term: concurrency limit (e.g. 6), allSettled with partial UI, caching/dedup via a data layer, lazy-load widgets outside the viewport.
Process: requests-per-page budget, RUM/network monitoring, API design reviews with backend teams.
Strong candidate goes beyond code to API contracts; weak candidate just adds retries (making it worse).`,
        exercises: [
          {
            task: 'Fix the code so one failed widget does not break the whole dashboard.',
            description: 'Checks partial-failure handling. Present as a review comment.',
            code: `const data = await Promise.all(ids.map(loadWidget));
render(data);`,
            answer: 'Use allSettled and render each widget according to its status, so failures are isolated and reported. A strong answer also mentions per-widget retry buttons.',
            solution: `const results = await Promise.allSettled(ids.map(loadWidget));
render(results.map((r) => (r.status === 'fulfilled' ? r.value : { error: r.reason.message })));`,
          },
          {
            task: 'Implement loading widgets only when they scroll into view.',
            description: 'Checks lazy loading to reduce request volume. Discuss trade-offs with prefetch.',
            answer: 'An IntersectionObserver triggers each widget\'s request when it becomes visible, cutting initial requests dramatically.',
            solution: `const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { io.unobserve(e.target); loadWidget(e.target.dataset.id); }
}, { rootMargin: '200px' });
document.querySelectorAll('[data-widget]').forEach((el) => io.observe(el));`,
          },
        ],
      },
    ],
  },
  'Callbacks, Promises': {
    junior: [
      {
        q: 'What are the three states of a Promise? How do you handle errors with .then and async/await?',
        short: 'pending, fulfilled, rejected (fulfilled/rejected = settled, and a promise settles only once). Use .catch() in chains or try/catch around await.',
        long: `A promise represents a future value; once settled, its state and value never change.
.then(onFulfilled, onRejected) returns a new promise, enabling chaining; returning a value or promise from a handler feeds the next step.
.catch(fn) is .then(undefined, fn) and catches errors from all previous steps; .finally runs regardless of outcome.
With async/await, a rejected awaited promise throws, so try/catch works; an async function always returns a promise.
Pitfalls: forgetting to return inside .then, not awaiting (floating promises), unhandled rejections.
Strong candidate knows chaining semantics; weak candidate thinks catch only catches the immediately preceding then.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks value passing through then chains. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `Promise.resolve(1)
  .then((x) => x + 1)
  .then((x) => { console.log(x); });`,
            answer: '2. Each then passes its return value on to the next handler. Some expect 1, or a promise object. A strong answer explains that a returned value becomes the next fulfillment value.',
          },
          {
            task: 'Fix the bug: the error is never caught.',
            description: 'Checks catching errors from async functions. Show the snippet, ask the candidate to explain the bug first, then write the fix.',
            code: `async function load() { throw new Error('fail'); }
try { load(); } catch (e) { console.log('caught'); }`,
            answer: 'load() returns a rejected promise; a synchronous try/catch does not see it. Await it, or attach .catch. Candidates assume try/catch catches everything. A strong answer explains that async functions never throw synchronously; they return rejected promises.',
            solution: `load().catch(() => console.log('caught'));
// or inside an async function: try { await load(); } catch { ... }`,
          },
        ],
      },
      {
        q: 'Find and fix the bug. JSON.parse crashes, but the file is fine.',
        code: `const fs = require('fs');
fs.readFile('config.json', 'utf8', (data) => {
  console.log(JSON.parse(data));
});`,
        short: 'Node callbacks are error-first: the first argument is the error (null on success), the second is the data. Here data is actually the error value.',
        long: `The Node convention is callback(err, result).
On success err is null, so JSON.parse(null) gives null, and on failure you try to parse an Error.
Always check err first and return early.
JSON.parse can also throw, so wrap it in try and catch.
Modern code can use fs.promises.readFile with await instead.
Strong answer: names the error-first convention and handles parse errors. Weak answer: adds try and catch around everything without fixing the arguments.`,
        fix: `fs.readFile('config.json', 'utf8', (err, data) => {
  if (err) return console.error('Cannot read config', err);
  try {
    console.log(JSON.parse(data));
  } catch (e) {
    console.error('Bad JSON', e);
  }
});`,
        follow: 'How would you write the same code with fs.promises and await?',
        exercises: [
          {
            task: 'Rewrite it with fs.promises and async and await.',
            description: 'Checks moving from callbacks to promises.',
            answer: 'Await readFile inside try and catch. Read errors and parse errors both go to the same catch.',
            solution: `const { readFile } = require('fs/promises');
async function loadConfig() {
  try {
    return JSON.parse(await readFile('config.json', 'utf8'));
  } catch (e) {
    console.error('Cannot load config', e);
  }
}`,
          },
          {
            task: 'Write your own function in error-first callback style.',
            description: 'Checks that the candidate can follow the convention.',
            answer: 'Call cb(error) on failure and cb(null, value) on success, and call it only once.',
            solution: `function divide(a, b, cb) {
  if (b === 0) return cb(new Error('Division by zero'));
  cb(null, a / b);
}`,
          },
        ],
      },
    ],
    middle: [
      {
        q: 'What is printed? Find the bug.',
        code: `function getData() {
  return fetch('/api').then(r => { r.json(); });
}
getData().then(d => console.log(d));`,
        short: 'undefined — the arrow function with braces has no return, so the chain resolves to undefined. Use `r => r.json()`, and check r.ok because fetch does not reject on HTTP errors like 404.',
        long: `Arrow functions return implicitly only without braces; with a block body you need an explicit return.
r.json() still runs but its promise is dropped (a floating promise — parse errors become unhandled rejections).
fetch rejects only on network errors/abort; 4xx/5xx resolve with r.ok === false, so you must throw yourself.
Better version: then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).
Strong candidate spots both bugs (missing return and r.ok); weak candidate spots neither or blames fetch.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks recovery in promise chains. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `Promise.reject(new Error('x'))
  .catch((e) => 'recovered')
  .then((v) => console.log(v))
  .catch(() => console.log('not here'));`,
            answer: '"recovered". A catch that returns a value turns the chain back into a fulfilled one. People often expect "not here" or an error. A strong answer compares this to try/catch: once handled, the error is gone unless rethrown.',
          },
          {
            task: 'Convert this callback pyramid into async/await.',
            description: 'Checks callback-to-promise refactoring. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            code: `getUser(1, (e, u) => {
  if (e) return done(e);
  getOrders(u.id, (e2, orders) => {
    if (e2) return done(e2);
    done(null, orders.length);
  });
});`,
            answer: 'Promisify the callbacks, then write the steps in order and let one try/catch handle errors. A weak version mixes callbacks and await. A strong answer uses util.promisify in Node and keeps error-first semantics.',
            solution: `const getUserP = promisify(getUser), getOrdersP = promisify(getOrders);
async function countOrders() {
  const u = await getUserP(1);
  const orders = await getOrdersP(u.id);
  return orders.length;
}`,
          },
        ],
      },
      {
        q: 'What is callback hell? How do promises and async and await solve it? What problems are still left?',
        short: 'Callback hell is deeply nested callbacks with repeated error handling and lost control flow. Promises flatten it into chains with one catch, and async/await makes it read like synchronous code; cancellation, floating promises and accidental sequential awaits remain problems.',
        long: `Callbacks: inversion of control (the callee may call you twice or never), manual error passing (err first), hard to compose loops and parallel work.
Promises: guaranteed single settlement, chaining, error propagation, combinators (all, allSettled).
async/await: try/catch, normal loops, readable sequencing.
Remaining issues: no built-in cancellation (AbortController), unhandled rejections, forgetting await, accidental sequential awaits, mixing styles.
Strong candidate mentions inversion of control and the remaining issues; weak candidate only says "promises look nicer".`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks then-chain flattening with returned promises. Ask before running.',
            code: `Promise.resolve(1)
  .then((v) => new Promise((r) => setTimeout(() => r(v + 1), 10)))
  .then((v) => console.log(v));`,
            answer: '2. Returning a promise from then makes the chain wait for it and unwrap its value; you never get a promise inside a promise.',
          },
          {
            task: 'Fix the bug: the callback can be called twice.',
            description: 'Checks inversion-of-control problems with callbacks. Show as a code review.',
            code: `function readConfig(cb) {
  try { cb(null, JSON.parse(raw)); }
  catch (e) { cb(e); }
}`,
            answer: 'If cb itself throws, the catch block calls cb a second time with the error. Parse first, then call cb outside the try (or use promises, which settle only once).',
            solution: `function readConfig(cb) {
  let cfg;
  try { cfg = JSON.parse(raw); } catch (e) { return cb(e); }
  cb(null, cfg);
}`,
          },
        ],
      },
    ],
    senior: [
      {
        q: 'Turn a Node-style callback API into a promise API. Then implement Promise.allSettled yourself.',
        short: 'promisify wraps the call in new Promise and resolves/rejects from the error-first callback; allSettled maps each input into a promise that never rejects and returns Promise.all of those.',
        fix: `const promisify = (fn) => (...a) => new Promise((res, rej) => fn(...a, (e, v) => e ? rej(e) : res(v)));
const allSettled = (ps) => Promise.all(ps.map(p => Promise.resolve(p)
  .then(value => ({ status: 'fulfilled', value }), reason => ({ status: 'rejected', reason }))));`,
        long: `promisify: append a callback (err, value) => ...; reject on truthy err, otherwise resolve. Production versions preserve this (fn.call(this, ...)) and handle multi-value callbacks.
allSettled: Promise.resolve(p) normalizes plain values and thenables; the two-argument then converts both outcomes to result objects, so Promise.all never short-circuits.
Order is preserved because Promise.all keeps input order.
Edge cases: an empty array resolves to [], the spec accepts any iterable (use Array.from), synchronous throws inside fn become rejections (the Promise executor catches them).
Strong candidate handles values/thenables and this; weak candidate uses .then(...).catch(...), which can misreport errors thrown inside the fulfilled handler.`,
        exercises: [
          {
            task: 'Implement Promise.all yourself. Keep the order of results, and reject on the first failure.',
            description: 'Checks combinator internals. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            code: 'function all(iterable) { /* ... */ }',
            answer: 'Count how many have resolved, store each result at its index, resolve when all are done, and reject immediately on any rejection. An empty input resolves to []. Common bugs: pushing results in completion order, never resolving for an empty input, not wrapping plain values. A strong answer covers all three and iterables.',
            solution: `function all(iterable) {
  return new Promise((resolve, reject) => {
    const items = Array.from(iterable), out = [];
    let left = items.length;
    if (!left) return resolve(out);
    items.forEach((p, i) => Promise.resolve(p).then((v) => { out[i] = v; if (--left === 0) resolve(out); }, reject));
  });
}
all([1, Promise.resolve(2)]).then(console.log); // [1, 2]`,
          },
          {
            task: 'Predict the output.',
            description: 'Checks executor timing and single settlement. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `const p = new Promise((resolve) => {
  console.log('A');
  resolve('B');
  resolve('C');
  console.log('D');
});
p.then(console.log);
console.log('E');`,
            answer: 'A D E B. The executor runs synchronously; only the first resolve counts; then handlers run as microtasks. Some think resolve stops execution or that C wins. A strong answer explains that settlement is one-time and the executor is synchronous.',
          },
        ],
      },
      {
        q: 'Explain thenables and how a promise adopts another value. Why is a then callback always asynchronous?',
        short: 'A thenable is any object with a then method; resolving a promise with one makes the promise adopt its state. Then callbacks always run as microtasks, even for already-settled promises, so behavior is consistent (never sometimes sync, sometimes async).',
        long: `resolve(x): if x is a promise or thenable, the outer promise follows it — that is why returning a promise from then flattens the chain.
Resolving a promise with itself rejects with a TypeError (cycle).
Adopting a native promise costs extra microtask ticks, which affects ordering puzzles.
Always-async callbacks avoid "Zalgo" (APIs that are sometimes synchronous), which causes subtle ordering bugs.
await uses the same resolution procedure, so you can await any thenable.
Strong candidate knows thenable adoption and the Zalgo reasoning; weak candidate thinks only Promise instances can be awaited.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks awaiting a custom thenable. Ask before running.',
            code: `const thenable = { then(resolve) { resolve('from thenable'); } };
(async () => console.log(await thenable))();`,
            answer: '"from thenable". await (like Promise.resolve) adopts any object with a then method. Many candidates expect the object itself to be logged.',
          },
          {
            task: 'Predict the output.',
            description: 'Checks extra ticks when resolving with a promise. Ask the candidate to count microtasks.',
            code: `const p = Promise.resolve();
new Promise((r) => r(p)).then(() => console.log('A'));
p.then(() => console.log('B')).then(() => console.log('C'));`,
            answer: 'B C A. Resolving with a native promise adds two extra microtask ticks (a job calls p.then, then the reaction), so A runs after C. A strong answer explains the adoption steps rather than guessing.',
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'In production, unhandled promise rejections disappear without any error. How do you make them visible and make sure the code handles them?',
        ai: true,
        short: 'Report window "unhandledrejection" events to error tracking (e.g. Sentry), enforce @typescript-eslint/no-floating-promises in CI, and set review norms and alert thresholds.',
        long: `Visibility: global unhandledrejection (browser) / process 'unhandledRejection' (Node) handlers forwarding to the error tracker with context (route, release, user action).
Prevention: no-floating-promises and no-misused-promises in typescript-eslint, require-await; ban async callbacks in forEach.
Patterns: a centralized API client normalizing errors, error boundaries + query library error states, explicit void for fire-and-forget.
Operations: dashboards and alerts on new error groups per release, uploaded source maps, ownership routing.
Culture: every caught error is either handled with UX or rethrown — no empty catch blocks (no-empty lint).
Strong candidate covers detection, prevention and ownership; weak candidate adds catch(() => {}) everywhere, which hides problems.`,
        exercises: [
          {
            task: 'Fix this so failures are visible instead of swallowed.',
            description: 'Checks error visibility policy. Show the snippet, ask the candidate to explain the bug first, then write the fix.',
            code: `async function sync() {
  try { await api.push(); } catch (e) {}
}`,
            answer: 'Empty catches hide incidents. Report the error with context and rethrow it, or show it in the UI. Adding a console.log only is not observability. A strong answer distinguishes expected errors (handled with UX) from unexpected ones (reported and rethrown).',
            solution: `async function sync() {
  try { await api.push(); }
  catch (e) { reportError(e, { op: 'sync' }); throw e; }
}`,
          },
          {
            task: 'Implement a retry helper. It retries only idempotent requests, and the wait time doubles each time.',
            description: 'Checks safe retry policy. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            answer: 'Retrying a non-idempotent POST can create duplicates; limit attempts and add jitter so clients do not retry in lockstep. Retrying everything, including POSTs, is the classic mistake. A strong answer mentions idempotency keys, jitter, and caps.',
            solution: `async function request(fn, { method = 'GET', attempts = 3 } = {}) {
  const retryable = ['GET', 'PUT', 'DELETE'].includes(method);
  for (let i = 0; ; i++) {
    try { return await fn(); }
    catch (e) {
      if (!retryable || i + 1 >= attempts) throw e;
      await new Promise((r) => setTimeout(r, 100 * 2 ** i + Math.random() * 50));
    }
  }
}`,
          },
        ],
      },
      {
        q: 'Code review: a shared helper mixes callbacks and promises. Some errors are handled twice. Refactor it and suggest a migration plan.',
        code: `export function getUser(id, cb) {
  return api.get('/users/' + id)
    .then((u) => { cb && cb(null, u); return u; })
    .catch((e) => { cb && cb(e); throw e; });
}`,
        short: 'If cb throws inside then, catch calls cb again with that error, and rethrowing creates unhandled rejections for callback users. Expose one promise API and a thin legacy adapter, then migrate callers incrementally.',
        fix: `export async function getUser(id) {
  return api.get('/users/' + encodeURIComponent(id));
}
// temporary adapter for legacy callers:
export function getUserCb(id, cb) {
  getUser(id).then((u) => cb(null, u), (e) => cb(e));
}`,
        long: `Mixed APIs double-handle errors and make ownership of failures unclear.
Use .then(onOk, onErr) in the adapter so an exception in the success callback is not routed to the error callback.
Migration: deprecate the callback signature (JSDoc @deprecated, lint rule), codemod call sites, remove the adapter by a set date.
Measure progress (count of adapter usages) and make it part of tech-debt tracking.
Strong candidate spots the double call and proposes a staged migration; weak candidate rewrites everything in one PR.`,
        exercises: [
          {
            task: 'Predict how many times the callback is called, and with what values.',
            description: 'Checks then/catch routing. Ask before running.',
            code: `Promise.resolve('u')
  .then((u) => { cb(null, u); })
  .catch((e) => cb(e));
function cb(err, v) { console.log('cb', err ? 'error' : v); if (!err) throw new Error('boom'); }`,
            answer: 'Twice: "cb u" then "cb error". The throw inside the first cb rejects the chain, and catch calls cb again. A strong answer suggests then(onOk, onErr).',
          },
          {
            task: 'Implement an adapter that warns one time when someone uses the old callback API. It should be easy to update with a codemod.',
            description: 'Checks deprecation strategy. Discuss telemetry of usage.',
            answer: 'A once-only warning (and optional telemetry) makes remaining usages visible without spamming logs.',
            solution: `let warned = false;
export function getUserCb(id, cb) {
  if (!warned) { warned = true; console.warn('getUserCb is deprecated; use getUser()'); }
  getUser(id).then((u) => cb(null, u), (e) => cb(e));
}`,
          },
        ],
      },
    ],
  },
  'Destruction and Spread operator': {
    junior: [
      {
        q: 'Is the original mutated? Why?',
        code: `const user = { name: 'Ann', address: { city: 'Kyiv' } };
const copy = { ...user };
copy.address.city = 'Lviv';
console.log(user.address.city);`,
        short: 'Yes, it prints "Lviv" — object spread is a shallow copy, so copy.address and user.address are the same object. Use structuredClone or spread the nested levels.',
        long: `Spread copies own enumerable properties one level deep; nested objects are copied by reference.
Changing copy.name would not affect user, but mutating copy.address does.
Deep copy options: structuredClone (handles Dates, Maps, Sets, cycles; not functions/DOM nodes/class prototypes), manual nested spread, or libraries.
JSON.parse(JSON.stringify()) loses undefined and functions, turns Dates into strings, and fails on cycles.
Strong candidate explains reference semantics and structuredClone limits; weak candidate thinks spread is a deep copy.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks array/object destructuring with defaults and renaming. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `const [a, , b = 5] = [1, 2];
const { x, y: z = 3 } = { x: 9 };
console.log(a, b, x, z);`,
            answer: '1 5 9 3. Holes skip elements, defaults fill undefined values, and y: z renames the property. Some think b is 2 or that y becomes a variable. A strong answer explains holes, defaults on undefined, and renaming.',
          },
          {
            task: 'Fix the bug: adding an item mutates the original array.',
            description: 'Checks reference vs copy. Show the snippet, ask the candidate to explain the bug first, then write the fix.',
            code: `const base = ['a'];
const next = base;
next.push('b');
console.log(base);`,
            answer: 'Assignment copies the reference, not the array. Spread into a new array instead. A weak answer uses slice without understanding why. A strong answer notes that a spread copy is still shallow for nested objects.',
            solution: `const next = [...base, 'b'];
console.log(base, next); // ['a'] ['a', 'b']`,
          },
        ],
      },
      {
        q: 'What is the difference between rest and spread syntax? Give an example of each.',
        short: 'Both use ..., but spread expands an iterable or object into elements/properties (in calls, array or object literals), while rest collects the remaining items into an array or object (in parameters and destructuring).',
        long: `Spread: Math.max(...nums), [...a, ...b], { ...defaults, ...opts } — copies are shallow.
Rest: function f(...args), const [first, ...others] = arr, const { id, ...rest } = obj.
Rest must be last; there can be only one rest element.
Object spread copies own enumerable properties; array spread works on any iterable (strings, Sets, Maps).
Strong candidate gives both contexts and mentions shallow copying; weak candidate thinks they are the same feature.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks array spread on iterables. Ask before running.',
            code: 'console.log([...\'hi\'], [...new Set([1, 1, 2])], Math.max(...[]));',
            answer: '[\'h\', \'i\'] [1, 2] -Infinity. Spread works on any iterable; Math.max with no arguments returns -Infinity. Common wrong answer: NaN or 0 for the last one.',
          },
          {
            task: 'Implement a sum function that accepts any number of arguments.',
            description: 'Checks rest parameters. Quick warm-up.',
            answer: 'Rest parameters collect all arguments into a real array, unlike the old arguments object.',
            solution: `const sum = (...nums) => nums.reduce((s, n) => s + n, 0);
console.log(sum(1, 2, 3), sum()); // 6 0`,
          },
        ],
      },
    ],
    middle: [
      {
        q: 'What are the values of a, b, c, d? What happens if options is undefined?',
        code: `function f({ a = 1, b: { c } = {}, ...d } = {}) { return [a, c, d]; }
f({ a: null, b: { c: 3 }, e: 5 });`,
        short: 'Returns [null, 3, { e: 5 }] — defaults apply only for undefined, not null; b is not a variable, only c is extracted. The `= {}` parameter default prevents a TypeError when f() is called with no argument.',
        long: `The a = 1 default is skipped because null is a value; only undefined triggers defaults.
b: { c } is a nested pattern — it binds c, not b. The = {} default protects against a missing b.
...d collects the remaining own enumerable properties (here e), excluding a and b.
Without the outer = {}, f() would throw "Cannot destructure property ... of undefined".
f({ b: null }) would still throw — null does not trigger the default.
Strong candidate notices that b is not bound and the null-vs-undefined difference; weak candidate says a is 1.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks spread override order and explicit undefined. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `const defaults = { theme: 'light', size: 'm' };
const user = { size: undefined, theme: 'dark' };
console.log({ ...defaults, ...user });`,
            answer: '{ theme: \'dark\', size: undefined }. Later spreads win, and an explicit undefined still overwrites the default. People often expect size \'m\' because undefined "doesn\'t count". A strong answer suggests filtering undefined values when merging options.',
          },
          {
            task: 'Implement omit, which takes an object and some keys. Use rest syntax or filtering. Do not change the object.',
            description: 'Checks non-mutating property removal. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            answer: 'Build a new object from the entries whose keys are not listed. Using delete on the original is the common mistake. A strong answer also shows const { b, ...rest } = obj for a single known key.',
            solution: `const omit = (obj, ...keys) => Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)));
console.log(omit({ a: 1, b: 2, c: 3 }, 'b')); // { a: 1, c: 3 }`,
          },
        ],
      },
      {
        q: 'Explain how object spread merges objects. Talk about property order, overwriting, getters, and what is not copied.',
        short: 'Properties are copied left to right, so later objects overwrite earlier keys (even with undefined). Only own enumerable properties are copied; getters are invoked and their values copied, while prototypes, non-enumerable properties and setters are not carried over.',
        long: `{ ...a, ...b }: keys keep the order of first insertion, but values come from the last occurrence.
Spreading null/undefined is allowed and adds nothing; spreading a string creates index keys.
Getters on the source are evaluated, so the copy has plain data properties.
Symbols are copied if they are own and enumerable.
Unlike Object.assign, spread does not call setters on the target (it defines new properties).
Strong candidate mentions getters, null-safety and undefined overwriting; weak candidate assumes deep merge.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks key order vs value precedence. Ask before running.',
            code: `const a = { x: 1, y: 2 };
const b = { y: 3, z: 4, x: undefined };
console.log({ ...a, ...b });`,
            answer: '{ x: undefined, y: 3, z: 4 }. The key order follows first insertion (x, y, z), but values come from the last spread, and undefined overwrites.',
          },
          {
            task: 'Predict the output.',
            description: 'Checks that getters are evaluated at spread time. Ask the candidate to explain.',
            code: `let n = 0;
const src = { get id() { return ++n; } };
const copy = { ...src };
console.log(copy.id, copy.id, n);`,
            answer: '1 1 1. The getter ran once during spreading; the copy holds a plain value. Candidates often expect 2 for the second read.',
          },
        ],
      },
    ],
    senior: [
      {
        q: 'Update a deeply nested item immutably, without a library. When would you use Immer or structuredClone instead?',
        code: `const state = { users: { byId: { 7: { profile: { tags: ['a'] } } } } };
// add tag 'b' to user 7 immutably`,
        short: 'Copy every level on the path to the change and reuse everything else (structural sharing). For complex updates use Immer; structuredClone copies everything, which breaks reference equality and memoization.',
        fix: `const next = { ...state, users: { ...state.users, byId: { ...state.users.byId,
  7: { ...state.users.byId[7], profile: { ...state.users.byId[7].profile,
    tags: [...state.users.byId[7].profile.tags, 'b'] } } } } };`,
        long: `Immutable updates matter for React/Redux change detection: unchanged branches must keep identity, changed ones get new references.
Manual nested spread is verbose and easy to get wrong (forgetting a level mutates shared state).
Immer lets you write mutating code on a draft and produces a structurally shared result; it also freezes in dev.
structuredClone deep copies the whole tree — every selector sees "new" data, causing re-renders, and it is slower.
Normalizing state (byId/allIds) keeps update paths short.
Strong candidate explains structural sharing and why it matters for memoization; weak candidate deep clones everything.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks what spread actually copies. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `class P { constructor() { this.x = 1; } get double() { return this.x * 2; } }
const copy = { ...new P() };
console.log(copy.double, copy instanceof P);`,
            answer: 'undefined false. Spread copies only own enumerable properties: the getter lives on the prototype and the prototype link is lost. Many expect 2 and true. A strong answer lists the losses: getters/setters (copied as values only if they are own properties), the prototype, and non-enumerable props.',
          },
          {
            task: 'Implement an immutable update. Remove the item with id 2 from a nested list, and rename item 3.',
            description: 'Checks nested immutable updates with filter/map. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            code: 'const state = { list: { items: [{ id: 1, n: \'a\' }, { id: 2, n: \'b\' }, { id: 3, n: \'c\' }] } };',
            answer: 'Copy the path (state → list → items), use filter/map for the array, and copy only the changed item. Weak answers mutate with splice, or deep clone everything. A strong answer preserves the identity of unchanged items for memoization.',
            solution: `const next = {
  ...state,
  list: {
    ...state.list,
    items: state.list.items.filter((i) => i.id !== 2).map((i) => (i.id === 3 ? { ...i, n: 'C' } : i)),
  },
};
console.log(next.list.items[0] === state.list.items[0]); // true`,
          },
        ],
      },
      {
        q: 'Explain shallow copy and deep copy in JS. Compare spread, Object.assign, structuredClone, and JSON stringify then parse.',
        short: 'Spread and Object.assign create shallow copies (nested objects are shared); structuredClone performs a deep copy that supports Dates, Maps, Sets and cycles but not functions, DOM nodes or class prototypes; JSON round-tripping is a lossy deep copy (drops undefined/functions, turns Dates into strings, fails on cycles and BigInt).',
        long: `Shallow copies are fast and are what immutable updates need (structural sharing).
Object.assign mutates its first argument and triggers setters; spread creates a new object.
structuredClone: available in modern browsers/Node 17+; loses prototypes, so class instances become plain objects; throws on functions.
JSON: loses undefined, functions, Symbols; NaN/Infinity become null; Dates become strings.
Choose based on data shape; deep cloning big trees is expensive and breaks memoization.
Strong candidate knows the limits of each; weak candidate always uses JSON.parse(JSON.stringify()).`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks JSON round-trip losses. Ask before running.',
            code: `const o = { d: new Date(0), u: undefined, n: NaN, f() {} };
console.log(JSON.parse(JSON.stringify(o)));`,
            answer: '{ d: \'1970-01-01T00:00:00.000Z\', n: null }. The Date becomes a string, NaN becomes null, and undefined values and functions are dropped.',
          },
          {
            task: 'Predict what happens.',
            description: 'Checks structuredClone limits. Ask the candidate to explain.',
            code: `class User { hi() { return 'hi'; } }
const c = structuredClone(new User());
console.log(c instanceof User, typeof c.hi);
try { structuredClone({ f() {} }); } catch (e) { console.log(e.name); }`,
            answer: 'false "undefined", then DataCloneError. structuredClone drops prototypes and cannot clone functions. Many candidates expect class instances to survive.',
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'A dashboard with a lot of data spreads large objects in code that runs very often. This puts pressure on garbage collection. How would you prove it? What would you change?',
        ai: true,
        short: 'Profile first (Performance and Memory/allocation tabs) to confirm allocation churn; then normalize state, use structural sharing, avoid spreading in loops/selectors, and memoize selectors.',
        long: `Prove: record a performance profile during the slow interaction — look for frequent minor GCs, allocation sampling pointing at object spread/array copies in hot functions, long tasks.
Typical culprits: reduce with { ...acc, [k]: v } (O(n²)), selectors returning new objects on every call, spreading props in list items.
Fixes: mutate a local object inside a function and return it (local mutation is fine), normalized maps, memoized selectors (reselect), virtualization, moving aggregation to a worker or the backend.
Verify: compare before/after metrics (INP, GC time, heap), add a perf regression test or budget.
Communicate trade-offs: readability vs performance; only optimize measured hot paths.
Strong candidate leads with measurement and targeted fixes; weak candidate bans spread globally.`,
        exercises: [
          {
            task: 'Fix this slow code path. The grouping is O of n squared, because it copies the accumulator on every step.',
            description: 'Checks quadratic allocations in reduce. Show the snippet, ask the candidate to explain the bug first, then write the fix.',
            code: 'const byType = rows.reduce((acc, r) => ({ ...acc, [r.type]: [...(acc[r.type] || []), r] }), {});',
            answer: 'Mutating a local accumulator is safe because nothing else can see it yet; it brings the cost down to O(n). Object.groupBy does the same. Some argue immutability is always required. A strong answer explains that local mutation inside a pure function is invisible, and backs the change with profiling data.',
            solution: `const byType = {};
for (const r of rows) (byType[r.type] ??= []).push(r);
// or: Object.groupBy(rows, (r) => r.type)`,
          },
          {
            task: 'Implement a selector. It returns the same array object when its input has not changed.',
            description: 'Checks memoized selectors and reference stability. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            answer: 'Without memoization, filter returns a new array every call and breaks React.memo/useMemo equality checks downstream. A weak answer uses JSON comparison, which is expensive. A strong answer discusses cache size 1 vs keyed caches and reselect.',
            solution: `function createSelector(fn) {
  let lastIn, lastOut;
  return (input) => (input === lastIn ? lastOut : (lastIn = input, lastOut = fn(input)));
}
const selectActive = createSelector((users) => users.filter((u) => u.active));
const users = [{ active: true }];
console.log(selectActive(users) === selectActive(users)); // true`,
          },
        ],
      },
      {
        q: 'Code review: a reducer updates nested state. It mixes mutation and spread, so some re-renders are missed. Fix it and set a team rule.',
        code: `function reducer(state, action) {
  if (action.type === 'rename') {
    state.users[action.id].name = action.name;
    return { ...state };
  }
  return state;
}`,
        short: 'The top-level spread creates a new state object, but users and the user object are mutated in place, so memoized components that compare those references never update. Copy every level on the path, or use Immer, and enforce immutability in dev (freeze, lint).',
        fix: `function reducer(state, action) {
  if (action.type === 'rename') {
    const user = state.users[action.id];
    return { ...state, users: { ...state.users, [action.id]: { ...user, name: action.name } } };
  }
  return state;
}`,
        long: `Shallow copying the root is not an immutable update; selectors comparing state.users or the user see the same references.
Also, the previous state is corrupted, which breaks undo/time-travel debugging.
Standard: Immer (or Redux Toolkit) for nested updates, normalized state, eslint-plugin-immutable or no-param-reassign for reducers, dev-time deep freeze.
Teach the "copy the path" rule with a diagram in the guide.
Strong candidate explains why re-renders are missed and proposes tooling; weak candidate adds a deep clone of the whole state.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks reference equality after a shallow root copy. Ask before running.',
            code: `const state = { users: { 1: { name: 'A' } } };
const next = { ...state };
next.users[1].name = 'B';
console.log(next.users === state.users, state.users[1].name);`,
            answer: 'true "B". Only the root was copied; the nested objects are shared, so the "old" state was mutated too.',
          },
          {
            task: 'Implement a deepFreeze that runs only in development. It should catch mutations early.',
            description: 'Checks guardrails for immutability. Discuss enabling it only in development.',
            answer: 'Freezing recursively makes mutations throw in strict mode, so bugs surface in tests instead of as missed re-renders.',
            solution: `function deepFreeze(o) {
  Object.values(o).forEach((v) => { if (v && typeof v === 'object') deepFreeze(v); });
  return Object.freeze(o);
}
'use strict';
const s = deepFreeze({ a: { b: 1 } });
try { s.a.b = 2; } catch (e) { console.log(e.name); } // TypeError in strict code`,
          },
        ],
      },
    ],
  },
  'Event handling, bubbling & delegation': {
    junior: [
      {
        q: 'Explain event bubbling and event delegation. What is the difference between event.target and event.currentTarget?',
        short: 'Events propagate from the target up through its ancestors (bubbling), so one listener on a parent can handle its children (delegation). target is where the event originated; currentTarget is the element whose listener is running.',
        long: `Propagation has three phases: capture (window → target), target, bubble (target → window).
Delegation: attach one listener to a container and inspect event.target — fewer listeners, and it works for dynamically added children.
target can be a nested element (an icon inside a button), so use closest() to find the logical item.
Some events do not bubble (focus, blur, mouseenter) — use focusin/focusout or capture.
Strong candidate explains the phases and the closest() nuance; weak candidate confuses target and currentTarget.`,
        exercises: [
          {
            task: 'Fix the bug: the form reloads the page on submit.',
            description: 'Checks default actions vs propagation. Show the snippet, ask the candidate to explain the bug first, then write the fix.',
            code: `form.addEventListener('submit', () => {
  console.log('sending');
});`,
            answer: 'Submitting a form triggers navigation by default. Call event.preventDefault(). Candidates sometimes use stopPropagation, which does not stop submission. A strong answer also mentions return false only works in inline/jQuery handlers.',
            solution: `form.addEventListener('submit', (e) => {
  e.preventDefault();
  console.log('sending');
});`,
          },
          {
            task: 'Predict what is logged when the inner <b> is clicked.',
            description: 'Checks target vs currentTarget. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `// <div id="box"><b>hi</b></div>
box.addEventListener('click', (e) => console.log(e.target.tagName, e.currentTarget.id));`,
            answer: '"B box". target is the clicked element; currentTarget is the element the listener is attached to. Mixing the two up is the common mistake. A strong answer notes that currentTarget is null after dispatch ends (e.g. inside a setTimeout).',
          },
        ],
      },
      {
        q: 'Find and fix the bug: the handler runs immediately on page load, not on click.',
        code: `function onSave() { console.log('saved'); }
saveBtn.addEventListener('click', onSave());`,
        short: 'onSave() calls the function immediately and passes its return value (undefined) as the listener. Pass the function reference itself, or wrap it in an arrow function if you need arguments.',
        fix: 'saveBtn.addEventListener(\'click\', onSave);',
        long: `addEventListener expects a function; the parentheses invoke it right away.
To pass arguments, use an arrow: addEventListener('click', () => onSave(id)).
Keep a reference if you need to remove the listener later.
Strong candidate explains reference vs call; weak candidate moves the code around until it works.`,
        exercises: [
          {
            task: 'Predict what happens when the link is clicked.',
            description: 'Checks default actions. Ask the candidate what the user sees.',
            code: `// <a href="/next" id="link">Next</a>
link.addEventListener('click', (e) => {
  console.log('clicked');
});`,
            answer: 'It logs "clicked" and then navigates to /next, because the default action still happens. Call e.preventDefault() to stop the navigation.',
          },
          {
            task: 'Implement a handler that shows which key was pressed in an input.',
            description: 'Checks the event object. Quick warm-up in the browser console.',
            answer: 'The event object passed to the listener has properties like key, target and type.',
            solution: `// <input id="field">
field.addEventListener('keydown', (e) => {
  console.log('Key:', e.key);
});`,
          },
        ],
      },
    ],
    middle: [
      {
        q: 'You click the span element. What is logged, and in what order? How would you stop the parent handler?',
        code: `parent.addEventListener('click', () => console.log('parent'));
parent.addEventListener('click', () => console.log('parent capture'), true);
child.addEventListener('click', (e) => console.log('child'));
// <div id="parent"><button id="child"><span>x</span></button></div>`,
        short: '"parent capture", "child", "parent" — capture listeners on ancestors run first, then bubbling goes from the button up. Calling e.stopPropagation() in the child handler prevents the parent bubble listener.',
        long: `Clicking the span dispatches with target = span. The capture phase runs ancestor capture listeners top-down → "parent capture".
The button is an ancestor of the span, so its (bubble) listener runs during bubbling → "child", then the div → "parent".
stopPropagation stops propagation to other elements; stopImmediatePropagation also stops remaining listeners on the same element.
preventDefault is different — it cancels the default action (form submit, link navigation), not propagation.
Stopping propagation breaks analytics and delegated handlers elsewhere; prefer checking e.target or using flags.
Strong candidate explains why the span click reaches the button listener and the stop/prevent difference; weak candidate says "child, parent, parent capture".`,
        exercises: [
          {
            task: 'Fix the bug: the listener cannot be removed.',
            description: 'Checks listener identity and options. Show the snippet, ask the candidate to explain the bug first, then write the fix.',
            code: `btn.addEventListener('click', () => save(), true);
btn.removeEventListener('click', () => save());`,
            answer: 'You need the same function reference and the same capture flag that you registered with. Weak answers forget the capture flag. A strong answer also offers an AbortController signal as an alternative.',
            solution: `const onClick = () => save();
btn.addEventListener('click', onClick, true);
btn.removeEventListener('click', onClick, true);`,
          },
          {
            task: 'Implement a one-time click listener without manually calling removeEventListener.',
            description: 'Checks listener options. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            answer: 'The once option removes the listener automatically after its first call. Manual removal inside the handler works but is noisy. A strong answer lists the other options too: passive and signal.',
            solution: 'btn.addEventListener(\'click\', () => console.log(\'first click only\'), { once: true });',
          },
        ],
      },
      {
        q: 'Explain the difference between stopPropagation, stopImmediatePropagation, and preventDefault. When should you use each one?',
        short: 'stopPropagation stops the event from reaching other elements in the propagation path; stopImmediatePropagation also prevents the remaining listeners on the current element; preventDefault cancels the browser default action (navigation, form submit, scrolling) without affecting propagation.',
        long: `They are independent: you can prevent the default and still let the event bubble.
preventDefault only works for cancelable events, and not in passive listeners (common for touch/wheel).
stopPropagation breaks delegated handlers, analytics and click-outside logic higher up — use it sparingly and document why.
stopImmediatePropagation is useful when your listener must override others on the same element (e.g. library integration).
Check e.defaultPrevented downstream to coordinate.
Strong candidate mentions passive listeners and the side effects of stopping propagation; weak candidate thinks preventDefault stops bubbling.`,
        exercises: [
          {
            task: 'Predict the output when the button is clicked.',
            description: 'Checks that preventDefault does not stop bubbling. Ask before running.',
            code: `// <div id="wrap"><button id="btn">x</button></div>
wrap.addEventListener('click', (e) => console.log('wrap', e.defaultPrevented));
btn.addEventListener('click', (e) => e.preventDefault());`,
            answer: '"wrap true". The event still bubbles; defaultPrevented tells the ancestor that the default was cancelled.',
          },
          {
            task: 'Fix the bug. preventDefault in this scroll handler does nothing, and the console shows a warning.',
            description: 'Checks passive listeners. Discuss why browsers default to passive for touch/wheel.',
            code: `document.addEventListener('wheel', (e) => {
  if (zoomMode) e.preventDefault();
});`,
            answer: 'Wheel and touch listeners on document are passive by default, so preventDefault is ignored. Register with { passive: false }, ideally only on the element that needs it, since it hurts scroll performance.',
            solution: `zoomArea.addEventListener('wheel', (e) => {
  if (zoomMode) e.preventDefault();
}, { passive: false });`,
          },
        ],
      },
    ],
    senior: [
      {
        q: 'Implement a delegated handler. It must work for items added later, with nested elements, and it must be removable.',
        short: 'One listener on the container, closest() to resolve nested targets to the item, a contains() guard so matches outside the container are ignored, and an AbortController signal for clean removal.',
        fix: `const ctrl = new AbortController();
list.addEventListener('click', (e) => {
  const item = e.target.closest('[data-id]');
  if (item && list.contains(item)) select(item.dataset.id);
}, { signal: ctrl.signal });
// later: ctrl.abort();`,
        long: `closest() walks up from the actual target, so clicks on icons/text inside the item still work.
The contains() check prevents matching an ancestor outside the list that also has data-id (closest searches all the way up to the document).
Items added later work automatically because the listener is on the stable parent.
AbortController removes many listeners at once without keeping function references; removeEventListener needs the same function and capture flag.
Consider keyboard accessibility (use buttons, handle Enter/Space), passive listeners for scroll/touch, and non-bubbling events.
Note React 17+ delegates to the root container instead of document, which changed how native stopPropagation interacts with React handlers.
Strong candidate covers nested targets, the guard, cleanup and a11y; weak candidate attaches a listener per item and re-attaches on every render.`,
        exercises: [
          {
            task: 'Implement a click outside handler for a dropdown. It must also work when the dropdown is inside a shadow root.',
            description: 'Checks click-outside and shadow DOM. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            answer: 'Check event.composedPath(), which includes nodes inside shadow trees, instead of target.contains, which stops at the shadow boundary. Using target.contains fails because the target is retargeted to the host. A strong answer uses pointerdown with capture so inner stopPropagation cannot block it.',
            solution: `function onClickOutside(el, cb) {
  const handler = (e) => { if (!e.composedPath().includes(el)) cb(e); };
  document.addEventListener('pointerdown', handler, true);
  return () => document.removeEventListener('pointerdown', handler, true);
}`,
          },
          {
            task: 'Predict whether the parent logs when focus moves to the input.',
            description: 'Checks non-bubbling events. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `// <form id="f"><input></form>
f.addEventListener('focus', () => console.log('focus'));
f.addEventListener('focusin', () => console.log('focusin'));`,
            answer: 'Only "focusin" is logged. focus does not bubble; focusin does (or register focus with capture: true). Many expect both to log. A strong answer lists other non-bubbling events: blur, mouseenter/leave, load on elements.',
          },
        ],
      },
      {
        q: 'How do custom events work in the DOM? Explain the CustomEvent options bubbles, cancelable, and composed. How do they work with shadow DOM?',
        short: 'You create one with new CustomEvent(type, { detail, bubbles, cancelable, composed }) and dispatch it with element.dispatchEvent. By default it does not bubble, cannot be cancelled and does not cross shadow-root boundaries; composed: true lets it escape the shadow DOM, with target retargeted to the host.',
        long: `detail carries the payload; it should be serializable and versioned for public contracts.
bubbles: true is needed for delegation on ancestors.
cancelable: true plus dispatchEvent's return value (false if preventDefault was called) lets listeners veto an action ("before-close").
composed: true crosses shadow boundaries; outside listeners see the host as target, and composedPath() reveals the inner path.
Dispatch is synchronous: listeners run before dispatchEvent returns.
Strong candidate knows dispatch is synchronous and about the cancelable veto pattern; weak candidate assumes custom events bubble by default.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks synchronous dispatch and the cancel return value. Ask before running.',
            code: `const t = new EventTarget();
t.addEventListener('close', (e) => { console.log('listener'); e.preventDefault(); });
console.log('before');
const allowed = t.dispatchEvent(new CustomEvent('close', { cancelable: true }));
console.log('after', allowed);`,
            answer: 'before, listener, after false. dispatchEvent runs listeners synchronously and returns false when a cancelable event was prevented.',
          },
          {
            task: 'Fix the bug: the parent never receives the event from the element.',
            description: 'Checks bubbles for custom events. Show the snippet and ask why the parent listener is silent.',
            code: `child.dispatchEvent(new CustomEvent('item:select', { detail: { id: 1 } }));
parent.addEventListener('item:select', (e) => console.log(e.detail.id));`,
            answer: 'Custom events do not bubble by default, and the listener is also added after the dispatch (which is synchronous). Add bubbles: true and register the listener first.',
            solution: `parent.addEventListener('item:select', (e) => console.log(e.detail.id));
child.dispatchEvent(new CustomEvent('item:select', { detail: { id: 1 }, bubbles: true }));`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'A micro-frontend and the host page both call stopPropagation. This breaks each other\'s handlers. How do you agree on event rules between teams?',
        ai: true,
        short: 'Ban stopPropagation as a default practice, communicate via namespaced CustomEvents or a shared, typed event bus contract, and back it with documentation and cross-app integration tests.',
        long: `Problem: DOM propagation is a shared global resource; stopping it in one app silently breaks delegated handlers, analytics and outside-click logic in another.
Contract: no stopPropagation on bubbling events except documented cases; use event.defaultPrevented or custom flags to signal "handled".
Communication: namespaced CustomEvents (e.g. "checkout:item-added") with versioned, typed detail payloads, or a small shared event bus package.
Isolation: shadow DOM / scoped roots for widgets, listening on their own root rather than document.
Governance: an RFC/ADR for the event catalog, contract tests in CI that mount host + MFE, an owner per event.
Strong candidate proposes a contract and enforcement; weak candidate suggests more stopPropagation or setTimeout hacks.`,
        exercises: [
          {
            task: 'Implement a typed event bus with namespaces. Micro-frontends can share it without using DOM event propagation.',
            description: 'Checks cross-team event contracts. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            answer: 'Wrapping EventTarget in a small API gives a clear contract, unsubscription and no stopPropagation conflicts. A weak design uses window globals with magic strings. A strong answer adds namespacing, versioned payloads, and teardown.',
            solution: `function createBus(ns) {
  const t = new EventTarget();
  return {
    emit: (name, detail) => t.dispatchEvent(new CustomEvent(ns + ':' + name, { detail })),
    on(name, fn) { const h = (e) => fn(e.detail); t.addEventListener(ns + ':' + name, h); return () => t.removeEventListener(ns + ':' + name, h); },
  };
}
const bus = createBus('cart');
const off = bus.on('add', console.log);
bus.emit('add', { sku: 'A1' }); off();`,
          },
          {
            task: 'Fix this widget so it no longer breaks host analytics.',
            description: 'Checks propagation etiquette in shared DOM. Show the snippet, ask the candidate to explain the bug first, then write the fix.',
            code: `widget.addEventListener('click', (e) => {
  e.stopPropagation();
  toggle();
});`,
            answer: 'Stopping propagation hides the click from every ancestor listener. Mark the event as handled instead, and let consumers check that. Removing the stopPropagation without a replacement can cause double handling. A strong answer defines a documented "handled" signal.',
            solution: `widget.addEventListener('click', (e) => {
  e.preventDefault(); // or set a documented flag
  toggle();
});
// host: if (e.defaultPrevented) skip default behavior, still track analytics`,
          },
        ],
      },
      {
        q: 'Code review: a large table adds a listener to every cell. It adds them again on each re-render. What do you change? What team rule do you set?',
        code: `function render(rows) {
  table.innerHTML = rows.map((r) => '<tr><td class="cell">' + r.name + '</td></tr>').join('');
  table.querySelectorAll('.cell').forEach((td) => td.addEventListener('click', () => edit(td)));
}`,
        short: 'Use one delegated listener on the table, registered once, and build rows with textContent instead of innerHTML. Guideline: delegate for large or dynamic collections, never build HTML from untrusted strings, and make sure cells are keyboard accessible.',
        fix: `table.addEventListener('click', (e) => {
  const td = e.target.closest('td.cell');
  if (td && table.contains(td)) edit(td);
});
function render(rows) {
  table.replaceChildren(...rows.map((r) => {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.className = 'cell';
    td.textContent = r.name;
    tr.append(td);
    return tr;
  }));
}`,
        long: `Thousands of listeners waste memory and setup time, and re-attaching on each render is quadratic work.
innerHTML with r.name is an XSS risk; textContent is safe.
Delegation handles new rows automatically; closest + contains handle nested markup.
Accessibility: clickable cells need buttons or a role/tabindex with keyboard handlers.
Guideline in the frontend handbook plus a lint rule against innerHTML (no-unsanitized).
Strong candidate covers performance, security and a11y; weak candidate only removes old listeners before adding new ones.`,
        exercises: [
          {
            task: 'Predict the problem with this code after 10 re-renders.',
            description: 'Checks listener accumulation. Ask what the user experiences.',
            code: `function render() {
  saveBtn.addEventListener('click', save); // called on every render
}`,
            answer: 'Adding the same function reference is de-duplicated, so save still runs once per click. With an inline arrow (() => save()) every render would add a new listener, and save would run 10 times. A strong answer explains the identity rule.',
          },
          {
            task: 'Implement a delegated keyboard handler so table cells are editable with Enter.',
            description: 'Checks accessible delegation. Discuss tabindex and roles.',
            answer: 'The same delegation pattern works for keydown; cells need tabindex to receive focus.',
            solution: `table.addEventListener('keydown', (e) => {
  const td = e.target.closest('td.cell');
  if (td && e.key === 'Enter') edit(td);
});
// render cells with td.tabIndex = 0`,
          },
        ],
      },
    ],
  },
  'Class, Prototyping': {
    junior: [
      {
        q: 'What is a prototype? How does `class` relate to prototypes?',
        short: 'Every object has an internal link ([[Prototype]]) to another object; property lookup walks this chain. class is mostly syntax sugar over constructor functions and prototypes.',
        long: `When a property is not found on an object, the engine looks at its prototype, then that object's prototype, up to Object.prototype and finally null.
Methods declared in a class body live on Class.prototype and are shared by instances; instance fields live on each object.
Object.getPrototypeOf(obj) reads the link; __proto__ is a legacy accessor.
class differs from plain functions: it must be called with new, methods are non-enumerable, the body is strict, it has a TDZ, and it supports private fields and super.
Strong candidate distinguishes fn.prototype from an object's [[Prototype]]; weak candidate thinks class creates copies of methods per instance.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks super method calls. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `class A { hi() { return 'A'; } }
class B extends A { hi() { return super.hi() + 'B'; } }
console.log(new B().hi());`,
            answer: '"AB". super.hi() calls the parent method with the same this. Some expect "B" only. A strong answer explains that super looks up the parent prototype while keeping the current this.',
          },
          {
            task: 'Fix the bug: the subclass throws a ReferenceError.',
            description: 'Checks derived constructors and super(). Show the snippet, ask the candidate to explain the bug first, then write the fix.',
            code: `class Animal { constructor(name) { this.name = name; } }
class Dog extends Animal {
  constructor(name) { this.sound = 'woof'; super(name); }
}
new Dog('Rex');`,
            answer: 'In a derived class, this is not initialized until super() runs, so call super first. Weak answers remove the constructor entirely, which loses the extra field. A strong answer explains why this is uninitialized before super().',
            solution: `class Dog extends Animal {
  constructor(name) { super(name); this.sound = 'woof'; }
}`,
          },
        ],
      },
      {
        q: 'Find and fix the bug. Adding an item throws "items is not defined".',
        code: `class Cart {
  constructor() {
    this.items = [];
  }
  add(item) {
    items.push(item);
  }
}
new Cart().add('apple');`,
        short: 'Instance properties are not variables in scope. Inside a method you must read them through this, so write this.items.push(item).',
        long: `In Java or C#, fields can be used without this. In JavaScript you cannot.
items without this looks for a variable in the scope chain and finds none, so a ReferenceError is thrown.
If a global named items exists, the bug is worse: the code changes the wrong array silently.
Class bodies run in strict mode, so there is no accidental global creation.
Strong answer: explains scope lookup versus property lookup. Weak answer: declares a global items array.`,
        fix: `class Cart {
  constructor() {
    this.items = [];
  }
  add(item) {
    this.items.push(item);
  }
}`,
        follow: 'How could you write the items field without a constructor?',
        exercises: [
          {
            task: 'Rewrite the class using a class field instead of the constructor.',
            description: 'Checks modern field syntax.',
            answer: 'Declare items = [] in the class body. Each instance gets its own array.',
            solution: `class Cart {
  items = [];
  add(item) { this.items.push(item); }
}`,
          },
          {
            task: 'Add a total getter that sums item prices.',
            description: 'Checks this inside a getter.',
            answer: 'Use get total() and read this.items inside it. It is used like a property: cart.total.',
            solution: `get total() {
  return this.items.reduce((sum, i) => sum + i.price, 0);
}`,
          },
        ],
      },
    ],
    middle: [
      {
        q: 'What is printed?',
        code: `function Animal() {}
Animal.prototype.speak = () => 'generic';
const a = new Animal();
Animal.prototype = { speak: () => 'new' };
console.log(a.speak(), new Animal().speak());`,
        short: '"generic new" — `a` keeps its link to the old prototype object; reassigning Animal.prototype only affects instances created afterwards.',
        long: `new Animal() sets the instance's [[Prototype]] to whatever Animal.prototype points to at that moment.
Reassigning Animal.prototype replaces the reference on the function; existing instances still point to the original object.
Mutating the prototype (Animal.prototype.speak = ...) instead would affect all instances, old and new.
Side effects: the new prototype object lacks constructor, so new Animal().constructor === Object; and a instanceof Animal is now false because instanceof checks the current Animal.prototype.
Strong candidate distinguishes mutation vs reassignment and mentions instanceof; weak candidate answers "new new".`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks shared mutable state on prototypes. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `const proto = { list: [] };
const a = Object.create(proto);
const b = Object.create(proto);
a.list.push(1);
console.log(b.list, Object.hasOwn(a, 'list'));`,
            answer: '[1] false. Both objects share the prototype\'s array; push mutates it without creating an own property. Many expect [] for b. A strong answer advises initializing mutable state in the constructor, never on the prototype.',
          },
          {
            task: 'Implement a static factory and a getter on a class.',
            description: 'Checks static members and accessors. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            code: 'class Temperature { /* fromFahrenheit(f), get celsius */ }',
            answer: 'Static methods live on the constructor; getters live on the prototype. Putting fromFahrenheit on instances is a common mix-up. A strong answer explains where each member lives.',
            solution: `class Temperature {
  constructor(c) { this.c = c; }
  static fromFahrenheit(f) { return new Temperature((f - 32) * 5 / 9); }
  get celsius() { return Math.round(this.c); }
}
console.log(Temperature.fromFahrenheit(212).celsius); // 100`,
          },
        ],
      },
      {
        q: 'Class B extends class A. Explain how the prototype chain is built. What do B.prototype and Object.getPrototypeOf(B) point to?',
        short: 'Object.getPrototypeOf(B.prototype) === A.prototype, so instances inherit A\'s methods; and Object.getPrototypeOf(B) === A, so static methods are inherited too. Instances of B have [[Prototype]] B.prototype.',
        long: `There are two chains: instance chain (b → B.prototype → A.prototype → Object.prototype → null) and constructor chain (B → A → Function.prototype).
That is why static methods are inherited and super.staticMethod() works inside statics.
extends null and extending built-ins (Array, Error) have special behavior.
instanceof walks the instance chain looking for B.prototype.
Strong candidate describes both chains; weak candidate only knows "B inherits from A".`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks static inheritance. Ask before running.',
            code: `class A { static create() { return new this(); } }
class B extends A {}
console.log(B.create() instanceof B, Object.getPrototypeOf(B) === A);`,
            answer: 'true true. Statics are inherited through the constructor chain, and this inside create is B, so new this() creates a B.',
          },
          {
            task: 'Predict the output.',
            description: 'Checks method overriding and shadowing via own properties. Ask the candidate to walk the chain.',
            code: `class A { who() { return 'A'; } }
class B extends A { who() { return 'B'; } }
const b = new B();
b.who = () => 'own';
console.log(b.who(), B.prototype.who.call(b), A.prototype.who.call(b));`,
            answer: '"own" "B" "A". An own property shadows the prototype chain; you can still call any prototype method explicitly.',
          },
        ],
      },
    ],
    senior: [
      {
        q: 'Implement inheritance without `class`, using Object.create. Include calls to the parent method. What are private hash fields, and how are they different from closures?',
        short: 'Set Child.prototype = Object.create(Parent.prototype), restore constructor, call Parent.call(this, ...) in the constructor and Parent.prototype.method.call(this) for super calls. #fields are per-class hard-private slots checked at runtime; closures give privacy via scope but need a function per instance.',
        long: `Constructor inheritance: Parent.call(this, args) initializes parent state on the child instance.
Prototype inheritance: Object.create(Parent.prototype) links the chain without running Parent; set Child.prototype.constructor = Child; optionally Object.setPrototypeOf(Child, Parent) for static inheritance.
super.method() equivalent: Parent.prototype.method.call(this, ...).
#private fields: lexically scoped to the class body, not reachable via obj['#x'], Object.keys or Reflect; accessing them on the wrong object throws TypeError; #x in obj is a brand check.
Pitfall: #fields do not work through a Proxy (the proxy is not the branded object).
Closures: privacy via captured variables; methods must be created per instance (more memory) and cannot be shared via the prototype.
Strong candidate gets the constructor fix and super call right and knows brand checks; weak candidate writes Child.prototype = Parent.prototype (shared object, mutations leak to the parent).`,
        exercises: [
          {
            task: 'Implement myInstanceOf with an object and a constructor. It walks up the prototype chain.',
            description: 'Checks how instanceof works. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            answer: 'Compare each prototype in the chain to Ctor.prototype until you reach null. Weak versions check obj.constructor, which can be reassigned. A strong answer handles primitives and mentions Symbol.hasInstance.',
            solution: `function myInstanceOf(obj, Ctor) {
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) return false;
  for (let p = Object.getPrototypeOf(obj); p; p = Object.getPrototypeOf(p)) if (p === Ctor.prototype) return true;
  return false;
}
console.log(myInstanceOf([], Object), myInstanceOf(1, Number)); // true false`,
          },
          {
            task: 'Predict the output.',
            description: 'Checks private field brand checks. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `class Box {
  #v = 1;
  static read(o) { try { return o.#v; } catch (e) { return e.constructor.name; } }
}
console.log(Box.read(new Box()), Box.read({}));`,
            answer: '1 TypeError. Private fields are brand-checked: reading #v from an object that is not a Box throws TypeError. Some expect undefined for the plain object. A strong answer mentions #v in o as a non-throwing brand check.',
          },
        ],
      },
      {
        q: 'Find and fix the bug in this mixin code. Methods from the second mixin overwrite the first one, and super calls break.',
        code: `const Serializable = { toJSON() { return { ...this }; } };
const Validated = { toJSON() { this.validate(); return Serializable.toJSON(); } };
class Model { validate() {} }
Object.assign(Model.prototype, Serializable, Validated);`,
        short: 'Object.assign copies methods flat, so the last mixin silently wins, and Serializable.toJSON() is called with the wrong this (the mixin object). Use subclass-factory mixins so each layer can call super.toJSON() correctly.',
        fix: `const Serializable = (Base) => class extends Base { toJSON() { return { ...this }; } };
const Validated = (Base) => class extends Base { toJSON() { this.validate(); return super.toJSON(); } };
class Base { validate() {} }
class Model extends Validated(Serializable(Base)) {}
console.log(JSON.stringify(Object.assign(new Model(), { a: 1 }))); // {"a":1}`,
        long: `Flat copying loses layering: there is no super chain, and name collisions are silent.
Calling Serializable.toJSON() directly sets this to Serializable, not the instance.
Subclass factories (Base) => class extends Base create a real prototype chain, so super works and order is explicit.
Alternatives: composition (has-a) instead of mixins; TypeScript supports the factory pattern.
Strong candidate explains both the collision and the this bug; weak candidate renames one method.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks this when calling an object method directly. Ask before running.',
            code: `const helper = { name: 'helper', who() { return this.name; } };
const model = { name: 'model', who() { return helper.who(); } };
console.log(model.who());`,
            answer: '"helper". helper.who() is called on helper, so this is helper, not model. Use helper.who.call(this) to delegate.',
          },
          {
            task: 'Implement a Timestamped mixin factory that adds createdAt and works with super constructors.',
            description: 'Checks subclass-factory mixins. Live-code and compose with a base class.',
            answer: 'The factory returns a class that extends any base, calls super with the arguments, then adds its own state.',
            solution: `const Timestamped = (Base) => class extends Base {
  constructor(...args) { super(...args); this.createdAt = Date.now(); }
};
class User { constructor(name) { this.name = name; } }
const u = new (Timestamped(User))('Ann');
console.log(u.name, typeof u.createdAt); // Ann number`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'In a modern frontend, when should you use classes, and when plain function modules? Give an example from your own projects.',
        ai: true,
        short: 'Classes fit stateful, long-lived entities with identity — services, SDK clients, domain models, custom elements; functions/hooks fit UI and data transformations. Look for a concrete, reasoned example.',
        long: `Good fits for classes: API clients with configuration and interceptors, WebSocket managers, domain models with invariants, Web Components (required), error subclasses.
Functional modules fit UI (React hooks), pure transformations and selectors — easier to tree-shake, test and compose.
Trade-offs: classes give encapsulation and instanceof, but invite deep inheritance hierarchies and this-binding bugs; prefer composition over inheritance.
Tree-shaking: unused class methods are not removed; unused exported functions are.
Team guidelines should state defaults and exceptions.
Strong candidate gives a real example with reasons and trade-offs; weak candidate is dogmatic ("OOP is dead" or "always classes").`,
        exercises: [
          {
            task: 'Refactor this deep inheritance chain into composition.',
            description: 'Checks composition over inheritance. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            code: `class Base {}
class Loggable extends Base { log(m) { console.log(m); } }
class Cacheable extends Loggable { cache = new Map(); }
class UserService extends Cacheable { get(id) { this.log('get ' + id); } }`,
            answer: 'Inject capabilities as collaborators. That gives looser coupling, easier testing and no fragile base class. Just flattening into one big class is not composition. A strong answer highlights dependency injection for testing.',
            solution: `class UserService {
  constructor({ logger, cache }) { this.logger = logger; this.cache = cache; }
  get(id) { this.logger.log('get ' + id); return this.cache.get(id); }
}
const svc = new UserService({ logger: console, cache: new Map() });
svc.get(1);`,
          },
          {
            task: 'Implement a minimal custom element. This is the one place where frontend code needs classes.',
            description: 'Checks where classes are required. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            answer: 'Web Components must extend HTMLElement; lifecycle callbacks are class methods. Some think custom elements can be functions. A strong answer covers lifecycle callbacks and observedAttributes.',
            solution: `class HelloTag extends HTMLElement {
  connectedCallback() { this.textContent = 'Hello ' + (this.getAttribute('name') || 'world'); }
}
customElements.define('hello-tag', HelloTag);`,
          },
        ],
      },
      {
        q: 'Code review: a domain model lets other code change its internal data. Its rules get broken all over the app. How do you fix the class and guide the team?',
        code: `class Cart {
  constructor() { this.items = []; this.total = 0; }
  add(item) { this.items.push(item); this.total += item.price; }
}
// elsewhere: cart.items.pop(); // total is now wrong`,
        short: 'Make the state private (#items), expose read-only copies, derive total instead of storing it, and validate in the methods. The guideline: domain objects own their invariants, and other code changes them only through their methods.',
        fix: `class Cart {
  #items = [];
  add(item) {
    if (!(item.price >= 0)) throw new RangeError('Invalid price');
    this.#items.push(Object.freeze({ ...item }));
  }
  remove(id) { this.#items = this.#items.filter((i) => i.id !== id); }
  get items() { return [...this.#items]; }
  get total() { return this.#items.reduce((s, i) => s + i.price, 0); }
}`,
        long: `A stored total that is updated separately from items will drift; derived values cannot.
Public mutable arrays let any caller break the invariants.
#private fields enforce encapsulation at runtime; getters return copies (or frozen views).
Team guidance: rich domain models for core business rules, immutable value objects, tests per invariant.
Watch performance: derived totals are O(n); memoize if needed.
Strong candidate talks about invariants and encapsulation; weak candidate adds a comment "do not modify items".`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks that getters returning internal arrays leak mutation. Ask before running.',
            code: `class Box { #list = [1]; get list() { return this.#list; } }
const b = new Box();
b.list.push(2);
console.log(b.list.length);`,
            answer: '2. The getter returns the internal array itself, so callers can still mutate it. Return a copy or a frozen array to protect it.',
          },
          {
            task: 'Implement an immutable Money value object with add() that returns a new instance.',
            description: 'Checks value objects. Discuss equality and currency mismatch.',
            answer: 'Value objects are immutable and validate on creation; operations return new instances, and mismatched currencies throw.',
            solution: `class Money {
  constructor(cents, currency) { this.cents = cents; this.currency = currency; Object.freeze(this); }
  add(o) {
    if (o.currency !== this.currency) throw new Error('Currency mismatch');
    return new Money(this.cents + o.cents, this.currency);
  }
}
console.log(new Money(100, 'USD').add(new Money(50, 'USD')).cents); // 150`,
          },
        ],
      },
    ],
  },
  'Set, WeakSet, Map, WeakMap': {
    junior: [
      {
        q: 'How do you remove duplicates from an array? What is the difference between a Map and a plain object?',
        short: '[...new Set(arr)]. A Map accepts any key type (objects included), keeps insertion order, has size, is directly iterable and is optimized for frequent adds/deletes; plain object keys are only strings/symbols.',
        long: `Set stores unique values using SameValueZero equality (NaN equals NaN, objects by reference).
Deduplicating objects by a field needs a Map keyed by that field.
Object keys are coerced to strings (obj[1] and obj['1'] are the same); objects used as keys become "[object Object]".
Objects have inherited prototype keys (risky with user-provided keys like "__proto__"); Map does not — or use Object.create(null).
Objects are better for fixed-shape records and JSON; Map for dynamic dictionaries.
Strong candidate mentions key coercion and prototype pollution; weak candidate says they are identical.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks Set equality semantics. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `const s = new Set([1, '1', 1, {}, {}]);
console.log(s.size);`,
            answer: '4. 1 and "1" are different values, and every {} literal is a distinct object. Common answers are 2 or 3. A strong answer explains reference equality for objects and no type coercion.',
          },
          {
            task: 'Implement counting word frequencies with a Map.',
            description: 'Checks Map as a counter. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            code: 'const words = [\'a\', \'b\', \'a\'];',
            answer: 'Read the current count with get, defaulting to 0, then set it to that plus one. Using a plain object works but has prototype-key risks. A strong answer uses ?? 0 rather than || 0 for clarity.',
            solution: `const freq = new Map();
for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);
console.log([...freq]); // [['a', 2], ['b', 1]]`,
          },
        ],
      },
      {
        q: 'Find and fix the bug: the Set does not remove duplicate users.',
        code: `const users = [{ id: 1 }, { id: 1 }, { id: 2 }];
const unique = [...new Set(users)];
console.log(unique.length); // 3`,
        short: 'A Set compares objects by reference, and each { id: 1 } is a different object. Deduplicate by a key, for example with a Map keyed by id.',
        fix: `const unique = [...new Map(users.map((u) => [u.id, u])).values()];
console.log(unique.length); // 2`,
        long: `Set uses SameValueZero: primitives by value, objects by reference.
To deduplicate objects, choose a key (id) and use a Map or a Set of seen ids.
The Map approach keeps the last occurrence; the filter + Set approach keeps the first.
Strong candidate explains reference equality and the first-vs-last choice; weak candidate uses JSON.stringify as the key without thinking about property order.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks basic Map API. Ask before running.',
            code: `const m = new Map([['a', 1]]);
m.set('b', 2).set('a', 3);
console.log(m.size, m.get('a'), [...m.keys()]);`,
            answer: '2 3 [\'a\', \'b\']. set returns the map (chainable), updating an existing key keeps its original position, and size counts entries.',
          },
          {
            task: 'Implement a function that checks whether an array has duplicates.',
            description: 'Checks using Set for uniqueness. Quick warm-up.',
            answer: 'Compare the Set size with the array length; a smaller set means duplicates. This is O(n).',
            solution: `const hasDuplicates = (arr) => new Set(arr).size !== arr.length;
console.log(hasDuplicates([1, 2, 2]), hasDuplicates([1, 2])); // true false`,
          },
        ],
      },
    ],
    middle: [
      {
        q: 'When would you use WeakMap over Map? Give a real use case.',
        short: 'When the key is an object whose lifetime you do not control: WeakMap holds keys weakly, so entries disappear when the key is garbage-collected. Typical uses: metadata/caches for DOM nodes or objects, private data. It is not iterable and has no size.',
        long: `Map keeps strong references — a Map of DOM nodes keeps removed nodes alive (a leak).
WeakMap keys must be objects (or non-registered symbols); values are kept alive only while the key is alive.
Because GC timing is non-deterministic, WeakMap has no iteration, size or clear.
Use cases: caching computed data per object, associating state with DOM elements, private data before #fields, tracking visited objects in deep clone/traversal (WeakSet).
WeakSet: mark objects (e.g. "already processed") without preventing GC.
Strong candidate explains why it is not iterable; weak candidate says "WeakMap is a faster Map".`,
        exercises: [
          {
            task: 'Implement the intersection and difference of two Sets.',
            description: 'Checks set operations. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            answer: 'Filter one Set by membership in the other; has() is O(1). Newer engines also provide Set.prototype.intersection/difference. Nested loops (O(n·m)) are the weak answer. A strong answer knows the new built-in Set methods and their availability.',
            solution: `const a = new Set([1, 2, 3]), b = new Set([2, 3, 4]);
const inter = new Set([...a].filter((x) => b.has(x)));
const diff = new Set([...a].filter((x) => !b.has(x)));
console.log([...inter], [...diff]); // [2, 3] [1]`,
          },
          {
            task: 'Predict the output.',
            description: 'Checks SameValueZero key equality. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `const m = new Map();
m.set(NaN, 'nan').set(0, 'zero');
console.log(m.get(NaN), m.get(-0), m.size);`,
            answer: '"nan" "zero" 2. Map uses SameValueZero, so NaN matches NaN and -0 matches 0. Some expect undefined for NaN. A strong answer contrasts this with === and Object.is.',
          },
        ],
      },
      {
        q: 'Find and fix the bug. This cache uses DOM nodes as keys. It keeps growing even after the nodes are removed.',
        code: `const sizes = new Map();
function measure(el) {
  if (!sizes.has(el)) sizes.set(el, el.getBoundingClientRect());
  return sizes.get(el);
}`,
        short: 'A Map holds strong references to its keys, so detached elements (and everything they reference) can never be garbage-collected. A WeakMap releases an entry when its key is no longer reachable elsewhere.',
        fix: `const sizes = new WeakMap();
function measure(el) {
  if (!sizes.has(el)) sizes.set(el, el.getBoundingClientRect());
  return sizes.get(el);
}`,
        long: `Detached DOM nodes held by a Map are a classic leak and show up as "Detached HTMLDivElement" in heap snapshots.
WeakMap fits because keys are objects, entries are per element, and you never need to iterate.
Limitations: no size, no iteration, keys must be objects.
Also note the cached rect goes stale after layout changes — think about invalidation (ResizeObserver).
Strong candidate mentions the stale-cache issue as well as the leak; weak candidate adds manual delete calls in some places.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks WeakMap API restrictions. Ask before running.',
            code: `const wm = new WeakMap();
try { wm.set('key', 1); } catch (e) { console.log(e.name); }
console.log(typeof wm.size, typeof wm.forEach);`,
            answer: 'TypeError, then "undefined undefined". WeakMap keys must be objects (or non-registered symbols), and there is no size or iteration because GC timing is unobservable.',
          },
          {
            task: 'Implement a WeakSet-based guard that processes each object only once.',
            description: 'Checks WeakSet for marking objects. Discuss why not a Set.',
            answer: 'A WeakSet remembers processed objects without keeping them alive.',
            solution: `const processed = new WeakSet();
function processOnce(obj) {
  if (processed.has(obj)) return false;
  processed.add(obj);
  return true;
}
const o = {};
console.log(processOnce(o), processOnce(o)); // true false`,
          },
        ],
      },
    ],
    senior: [
      {
        q: 'Build an LRU cache with a Map. Get and put must run in constant time, O of 1.',
        short: 'Map preserves insertion order: on access delete and re-insert to mark the key as most recent, and on overflow evict the first (least recently used) key via keys().next().value.',
        fix: `class LRU {
  constructor(max) { this.max = max; this.m = new Map(); }
  get(k) { if (!this.m.has(k)) return; const v = this.m.get(k); this.m.delete(k); this.m.set(k, v); return v; }
  put(k, v) { this.m.delete(k); this.m.set(k, v); if (this.m.size > this.max) this.m.delete(this.m.keys().next().value); }
}`,
        long: `All Map operations used (has/get/delete/set, first key) are O(1) on average.
get must refresh recency; put must delete first so updating an existing key moves it to the end.
Classic alternative: hash map + doubly linked list — the Map-based version relies on spec-guaranteed insertion order.
Edge cases: max <= 0, storing undefined values (use has to distinguish a miss), TTL expiration, sizing by bytes instead of count.
Use cases: memoization, image/data caches in SPAs.
Strong candidate explains why delete+set is needed and the complexity; weak candidate uses an array with indexOf (O(n)).`,
        exercises: [
          {
            task: 'Fix the leak: removed DOM nodes stay in memory.',
            description: 'Checks weak references for DOM metadata. Show the snippet, ask the candidate to explain the bug first, then write the fix.',
            code: `const state = new Map();
function attach(node) { state.set(node, { open: false }); }`,
            answer: 'A Map holds its keys strongly. A WeakMap lets detached nodes be garbage-collected along with their state. Calling map.delete manually works only if every removal path remembers to call it. A strong answer explains that GC handles WeakMap entries automatically.',
            solution: `const state = new WeakMap();
function attach(node) { state.set(node, { open: false }); }`,
          },
          {
            task: 'Implement groupBy that returns a Map. Keep the groups in the order they first appear.',
            description: 'Checks ordered grouping. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            answer: 'A Map keeps insertion order and allows any key type, including objects. Map.groupBy is the built-in version. A weak version uses an object and loses non-string keys. A strong answer mentions Map.groupBy / Object.groupBy.',
            solution: `function groupBy(arr, keyFn) {
  const m = new Map();
  for (const x of arr) { const k = keyFn(x); if (!m.has(k)) m.set(k, []); m.get(k).push(x); }
  return m;
}
console.log(groupBy([1, 2, 3, 4], (n) => (n % 2 ? 'odd' : 'even'))); // Map { odd => [1, 3], even => [2, 4] }`,
          },
        ],
      },
      {
        q: 'When should you choose Map or Set instead of plain objects or arrays? Think about speed, key types, iteration order, and serialization.',
        short: 'Use Map for dynamic dictionaries with frequent adds/deletes, non-string keys or untrusted keys, and Set for fast membership checks; use plain objects for fixed-shape records and JSON. Map/Set have O(1) average operations, guaranteed insertion order, and size, but do not serialize to JSON directly.',
        long: `Arrays: includes/indexOf are O(n); Set.has is O(1) average — use Sets for membership in hot paths.
Objects: keys are strings/symbols; integer-like keys are ordered numerically first; inherited keys such as "__proto__" are risky with user input.
Map: any key type, insertion order, size, optimized for churn; delete on objects can make engines fall back to slower representations.
Serialization: JSON.stringify(map) gives {}; use Object.fromEntries or [...map].
Memory: Maps have overhead per entry; for small fixed shapes objects are faster.
Strong candidate mentions integer-key ordering and serialization; weak candidate says "Map is always faster".`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks object key ordering rules. Ask before running.',
            code: `const o = { b: 1, 2: 'x', a: 2, 1: 'y' };
console.log(Object.keys(o));
console.log([...new Map([['b', 1], [2, 'x'], ['a', 2], [1, 'y']]).keys()]);`,
            answer: '[\'1\', \'2\', \'b\', \'a\'] and [\'b\', 2, \'a\', 1]. Objects list integer-like keys first in ascending order, then strings in insertion order; Map keeps pure insertion order and key types.',
          },
          {
            task: 'Fix the serialization bug: the saved state loses its Map.',
            description: 'Checks JSON with Map. Ask for both directions (save and load).',
            code: `const state = { tags: new Map([['a', 1]]) };
localStorage.setItem('s', JSON.stringify(state)); // tags: {}`,
            answer: 'JSON.stringify turns a Map into {}. Convert it to entries (or an object) when saving and rebuild the Map when loading.',
            solution: `const save = (s) => JSON.stringify({ ...s, tags: [...s.tags] });
const load = (json) => { const o = JSON.parse(json); return { ...o, tags: new Map(o.tags) }; };
console.log(load(save({ tags: new Map([['a', 1]]) })).tags.get('a')); // 1`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'When is it OK to use WeakRef or FinalizationRegistry? Would you allow them in your codebase?',
        ai: true,
        short: 'Rarely — GC timing is non-deterministic and finalizers may never run. Possibly for caches of large, re-creatable objects or as a safety net for releasing external resources; require strong justification, tests and documentation.',
        long: `WeakRef lets you hold an object without preventing GC; deref() returns the object or undefined.
FinalizationRegistry calls a callback some time after an object is collected — maybe never (e.g. on page unload), so never rely on it for correctness.
Justified: memory-sensitive caches (decoded images, large parsed documents) that can be rebuilt, leak-detection tooling, safety-net cleanup for Wasm/native handles where explicit dispose is the primary path.
Not justified: business logic, required cleanup, anything tests depend on deterministically.
Policy: allowed only in a reviewed shared utility, with explicit dispose APIs, documentation, and behavior verified under memory pressure.
Strong candidate explains non-determinism and prefers explicit lifecycles; weak candidate wants them to "fix memory leaks".`,
        exercises: [
          {
            task: 'Predict whether this test is reliable.',
            description: 'Checks testing non-deterministic GC. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `let obj = {};
const ref = new WeakRef(obj);
obj = null;
expect(ref.deref()).toBeUndefined();`,
            answer: 'It is not reliable. Garbage collection is non-deterministic and the object may still be alive right after obj = null, so the test is flaky. Some try to force GC with --expose-gc in tests. A strong answer explains why tests must not depend on GC timing at all.',
          },
          {
            task: 'Implement a resource wrapper with a dispose method. Use a FinalizationRegistry only to warn about leaks.',
            description: 'Checks explicit disposal vs finalizers. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            answer: 'Correctness comes from dispose(); the registry just reports handles that were never disposed. Relying on the finalizer for cleanup is the mistake. A strong answer mentions the "using" declaration (Symbol.dispose) as the future direction.',
            solution: `const leaks = new FinalizationRegistry((id) => console.warn('Handle', id, 'was not disposed'));
class Resource {
  constructor(id) { this.id = id; leaks.register(this, id, this); }
  dispose() { leaks.unregister(this); /* release */ }
}
new Resource(1).dispose();`,
          },
        ],
      },
      {
        q: 'Code review: a feature flag service uses a plain object. The user controls its keys. What risks do you see? What do you change?',
        code: `const flags = {};
for (const [k, v] of Object.entries(JSON.parse(userInput))) flags[k] = v;
if (flags.isAdmin) showAdminPanel();`,
        short: 'User-controlled keys allow setting security-relevant flags (isAdmin) and may enable prototype pollution via "__proto__" when the object is later merged. Use an allow-list, a Map (or Object.create(null)), type checks, and never decide authorization on the client.',
        fix: `const ALLOWED = new Set(['darkMode', 'betaSearch']);
const flags = new Map();
for (const [k, v] of Object.entries(JSON.parse(userInput))) {
  if (ALLOWED.has(k) && typeof v === 'boolean') flags.set(k, v);
}
if (flags.get('isAdmin')) showAdminPanel(); // never true from user input`,
        long: `Risks: privilege flags from input, "__proto__"/"constructor" keys polluting prototypes in deep merges, wrong types ("false" string is truthy).
Map avoids prototype keys entirely; Object.create(null) is an alternative.
Allow-list keys and validate types with a schema.
Authorization must be enforced server-side; client flags only affect UI.
Add security review checklist items and lint rules (no-prototype-builtins, security plugins).
Strong candidate raises both pollution and the authorization point; weak candidate only switches to Map.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks prototype pollution via a naive merge. Ask before running.',
            code: `function merge(t, s) { for (const k in s) { if (typeof s[k] === 'object') merge(t[k] ??= {}, s[k]); else t[k] = s[k]; } return t; }
merge({}, JSON.parse('{"__proto__": {"polluted": true}}'));
console.log(({}).polluted);`,
            answer: 'true. t["__proto__"] resolves to Object.prototype, so the merge writes polluted onto every object. Skip dangerous keys or merge into Maps / null-prototype objects.',
          },
          {
            task: 'Fix the merge so it is safe against prototype pollution.',
            description: 'Checks secure-by-default utilities. Live-code the guard.',
            code: 'function merge(t, s) { for (const k in s) t[k] = s[k]; return t; }',
            answer: 'Iterate own keys only and skip "__proto__", "constructor" and "prototype"; better, use structured validation before merging.',
            solution: `const BLOCKED = new Set(['__proto__', 'constructor', 'prototype']);
function merge(t, s) {
  for (const k of Object.keys(s)) if (!BLOCKED.has(k)) t[k] = s[k];
  return t;
}`,
          },
        ],
      },
    ],
  },
  'Generators, Symbol': {
    junior: [
      {
        q: 'What is a Symbol and why would you use one?',
        short: 'A unique, immutable primitive, typically used as a non-colliding property key. Well-known symbols like Symbol.iterator let you customize built-in language behavior.',
        long: `Symbol('desc') always creates a new unique value; the description is only a label.
Symbol.for('key') uses a global registry — the same key returns the same symbol across modules and realms.
Symbol-keyed properties are skipped by for...in, Object.keys and JSON.stringify, but visible via Object.getOwnPropertySymbols/Reflect.ownKeys — so they are not truly private.
Well-known symbols: Symbol.iterator, Symbol.asyncIterator, Symbol.toPrimitive, Symbol.toStringTag, Symbol.hasInstance.
Strong candidate mentions well-known symbols and that symbols are not private; weak candidate says "a Symbol is a string constant".`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks the iterator protocol result shape. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `function* g() { yield 1; yield 2; }
const it = g();
console.log(it.next(), it.next(), it.next());`,
            answer: '{ value: 1, done: false } { value: 2, done: false } { value: undefined, done: true }. Some think the last call throws, or returns value 2 with done true. A strong answer explains that done becomes true only after the last yield.',
          },
          {
            task: 'Use a Symbol to implement a hidden "id" property that does not clash with other keys.',
            description: 'Checks symbols as property keys. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            answer: 'A Symbol key cannot clash with string keys and is skipped by Object.keys and JSON.stringify. Some believe symbols make properties private. A strong answer notes they are still reachable via Object.getOwnPropertySymbols.',
            solution: `const ID = Symbol('id');
const item = { name: 'x', [ID]: 42 };
console.log(item[ID], JSON.stringify(item)); // 42 '{"name":"x"}'`,
          },
        ],
      },
      {
        q: 'Find and fix the bug: the loop prints nothing.',
        code: `function* nums() { yield 1; yield 2; }
const it = nums();
console.log([...it]);
for (const n of it) console.log(n);`,
        short: 'A generator object can be iterated only once; the spread already consumed it, so the for...of loop finds it finished. Create a new generator for each iteration.',
        fix: `function* nums() { yield 1; yield 2; }
console.log([...nums()]);
for (const n of nums()) console.log(n);`,
        long: `Generator objects are iterators that are their own iterables; once done, they stay done.
Arrays and other collections create a fresh iterator each time, so they can be iterated repeatedly.
For a reusable iterable, implement [Symbol.iterator]() that returns a new generator each time.
Strong candidate explains iterator vs iterable; weak candidate thinks generators reset automatically.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks generator laziness. Ask before running.',
            code: `function* g() { console.log('start'); yield 1; }
const it = g();
console.log('created');
it.next();`,
            answer: '"created" then "start". Calling a generator function only creates the generator; its body runs on the first next().',
          },
          {
            task: 'Implement a generator that yields each character of a string twice.',
            description: 'Checks yield in a loop. Quick warm-up.',
            answer: 'Loop over the string and yield each character twice.',
            solution: `function* doubleChars(s) { for (const ch of s) { yield ch; yield ch; } }
console.log([...doubleChars('ab')].join('')); // aabb`,
          },
        ],
      },
    ],
    middle: [
      {
        q: 'Make this object iterable with for...of using a generator.',
        code: `const range = { from: 1, to: 5 };
for (const n of range) console.log(n);`,
        short: 'for...of calls obj[Symbol.iterator]() and needs an iterator with next(); a generator function is the simplest way to implement it.',
        fix: 'range[Symbol.iterator] = function* () { for (let i = this.from; i <= this.to; i++) yield i; };',
        long: `The iteration protocol: an iterable has [Symbol.iterator]() returning an iterator; the iterator's next() returns { value, done }.
A generator function returns a generator object that is both an iterator and an iterable, and yield produces values lazily.
Use a regular function* (not an arrow) so this refers to range.
Once iterable, the object works with spread, Array.from, array destructuring, new Set, Promise.all, etc.
Generators pause at each yield, enabling lazy and infinite sequences.
Strong candidate can also write the manual next() version; weak candidate tries Object.entries or forEach.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks two-way communication with yield. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `function* g() {
  const x = yield 1;
  console.log('got', x);
}
const it = g();
it.next('ignored');
it.next('hello');`,
            answer: '"got hello". The value passed to the first next() is discarded; the second next() resumes yield with "hello". A frequent wrong answer is "got ignored". A strong answer explains that the first next() only starts the generator.',
          },
          {
            task: 'Implement a generator that yields the Fibonacci sequence, and take the first 6 values.',
            description: 'Checks lazy infinite sequences. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            answer: 'An infinite generator is safe because values are produced lazily, only when requested. Spreading an infinite generator hangs the program. A strong answer uses break/take and explains laziness.',
            solution: `function* fib() { let [a, b] = [0, 1]; while (true) { yield a; [a, b] = [b, a + b]; } }
const out = [];
for (const n of fib()) { if (out.length === 6) break; out.push(n); }
console.log(out); // [0, 1, 1, 2, 3, 5]`,
          },
        ],
      },
      {
        q: 'Explain well-known symbols, like Symbol.iterator, Symbol.toPrimitive, Symbol.toStringTag, and Symbol.hasInstance. Why do they exist?',
        short: 'Well-known symbols are built-in Symbol values that the language looks up to customize behavior: iteration (Symbol.iterator), conversion to primitives (Symbol.toPrimitive), Object.prototype.toString output (Symbol.toStringTag) and instanceof (Symbol.hasInstance). Symbols were used so new hooks could not collide with existing string-named properties.',
        long: `Symbol.iterator / Symbol.asyncIterator: for...of, spread, for await.
Symbol.toPrimitive(hint): controls +obj, template literals and comparisons; hint is "number", "string" or "default".
Symbol.toStringTag: changes "[object X]", used by libraries for branding.
Symbol.hasInstance: customizes instanceof (rarely a good idea).
Others: Symbol.species, Symbol.isConcatSpreadable, Symbol.dispose (explicit resource management).
Strong candidate explains the collision-free motivation and gives one practical use; weak candidate only knows Symbol.iterator.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks Symbol.toStringTag. Ask before running.',
            code: `class Temp { get [Symbol.toStringTag]() { return 'Temperature'; } }
console.log(Object.prototype.toString.call(new Temp()), String(new Temp()));`,
            answer: '"[object Temperature]" twice. toString uses Symbol.toStringTag for the tag, and String() falls back to Object.prototype.toString.',
          },
          {
            task: 'Implement Symbol.toPrimitive so a Money object prints nicely and works as a number when you add it.',
            description: 'Checks conversion hooks. Discuss whether implicit conversion is a good idea.',
            answer: 'Return a formatted string for the "string" hint and a number otherwise.',
            solution: `class Money {
  constructor(c) { this.c = c; }
  [Symbol.toPrimitive](hint) { return hint === 'string' ? '$' + (this.c / 100).toFixed(2) : this.c; }
}
const m = new Money(250);
console.log(String(m), m + 50); // $2.50 300`,
          },
        ],
      },
    ],
    senior: [
      {
        q: 'Use an async generator and for await to read a paginated API. How do you cancel it?',
        short: 'An async generator fetches one page, yields its items and follows the next link; consumers pull lazily with for await. Cancel by breaking out of the loop (which calls return() on the generator) or by aborting an AbortSignal passed to fetch.',
        fix: `async function* pages(url, signal) {
  while (url) {
    const res = await fetch(url, { signal }).then(r => r.json());
    yield res.items;
    url = res.next;
  }
}
for await (const items of pages('/api?page=1', ctrl.signal)) render(items);`,
        long: `Pull-based: the next page is requested only when the consumer asks, giving natural backpressure.
break/return/throw inside for await calls the generator's return(), running its finally blocks — good for cleanup.
break does not abort a fetch already in flight; AbortController cancels the network request and makes the awaited fetch reject with an AbortError.
Error handling: try/finally inside the generator; consider retries per page.
Generators are single-consumer and sequential; for prefetching, start the next request before yielding.
Strong candidate distinguishes break vs abort and mentions finally; weak candidate loads all pages into an array first.`,
        exercises: [
          {
            task: 'Use generators to implement a lazy map and filter pipeline. It should process only the items that are needed.',
            description: 'Checks lazy pipelines. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            answer: 'Each stage pulls one item at a time, so taking 2 results stops the source early. Weak answers use array map/filter, which process everything. A strong answer explains pull-based evaluation and early return() cleanup.',
            solution: `function* map(it, f) { for (const x of it) yield f(x); }
function* filter(it, p) { for (const x of it) if (p(x)) yield x; }
function* take(it, n) { if (n <= 0) return; for (const x of it) { yield x; if (--n === 0) return; } }
const src = [1, 2, 3, 4, 5, 6];
console.log([...take(filter(map(src, (x) => x * 10), (x) => x > 20), 2)]); // [30, 40]`,
          },
          {
            task: 'Make this class iterable asynchronously so it works with for await.',
            description: 'Checks async iteration protocol. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            code: 'class Feed { constructor(pages) { this.pages = pages; } }',
            answer: 'Implement Symbol.asyncIterator as an async generator method. Using Symbol.iterator with promises is a common mix-up. A strong answer knows that for await calls Symbol.asyncIterator.',
            solution: `class Feed {
  constructor(pages) { this.pages = pages; }
  async *[Symbol.asyncIterator]() {
    for (const p of this.pages) { await new Promise((r) => setTimeout(r, 5)); yield p; }
  }
}
(async () => { for await (const p of new Feed(['a', 'b'])) console.log(p); })();`,
          },
        ],
      },
      {
        q: 'Explain the full generator protocol: next, return, and throw. How do finally blocks behave? Where is this useful?',
        short: 'next(v) resumes the generator and makes the paused yield evaluate to v; return(v) forces completion, running finally blocks; throw(e) raises e at the paused yield, where the generator can catch it. This powers coroutines (redux-saga, co), cleanup on early exit, and two-way protocols.',
        long: `The first next() starts execution; its argument is ignored.
return() runs finally blocks; a yield inside finally can even delay completion.
throw() lets a consumer inject errors (e.g. a cancelled request) into the generator.
for...of calls return() automatically on break, return or exceptions — that is how iterators clean up resources.
yield* delegates to another iterator, forwarding next/throw/return.
Strong candidate explains how break triggers return() and how sagas use throw; weak candidate only knows next().`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks throw() into a generator. Ask before running.',
            code: `function* g() {
  try { yield 1; }
  catch (e) { console.log('caught', e); yield 2; }
}
const it = g();
it.next();
console.log(it.throw('boom'));`,
            answer: '"caught boom" then { value: 2, done: false }. throw raises the error at the paused yield; the generator catches it and continues to the next yield.',
          },
          {
            task: 'Predict the output.',
            description: 'Checks yield* delegation. Ask the candidate to explain the return value.',
            code: `function* inner() { yield 'a'; return 'r'; }
function* outer() { const res = yield* inner(); yield res; }
console.log([...outer()]);`,
            answer: '[\'a\', \'r\']. yield* forwards inner\'s yields and evaluates to inner\'s return value, which outer then yields. Spread alone ignores return values.',
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'For complex async flows, you can use generators or sagas, async and await, or observables like RxJS. Which one would you pick for the team, and why?',
        ai: true,
        short: 'It depends on flow complexity and team skills: async/await plus a query library covers most apps; RxJS shines for streams, cancellation and composing events; sagas are mostly legacy. Look for honest trade-offs including onboarding cost.',
        long: `async/await: native, easy to read and debug; weak at cancellation (needs AbortController) and multi-value streams.
Observables (RxJS): composable operators (switchMap, debounceTime, retry) and built-in cancellation via unsubscribe; steep learning curve and easy to misuse.
Generators/redux-saga: testable declarative effects and cancellation; tied to Redux, declining ecosystem, harder onboarding.
Decision criteria: nature of the flows (request/response vs live streams like WebSockets), team experience, hiring, bundle size, existing stack, debugging tools.
A pragmatic answer: default to async/await + TanStack Query, allow RxJS in isolated real-time modules behind an interface.
Strong candidate gives criteria and a migration story; weak candidate picks based on hype.`,
        exercises: [
          {
            task: 'Rewrite this saga-style generator flow with async/await and AbortController.',
            description: 'Checks migrating sagas to async/await. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            code: `function* loadUser(id) {
  const user = yield call(api.user, id);
  yield put({ type: 'loaded', user });
}`,
            answer: 'The plain async version is easier to onboard and debug; cancellation goes through an AbortSignal. A weak migration loses cancellation. A strong answer adds AbortSignal handling and testability via injected dependencies.',
            solution: `async function loadUser(id, { signal, dispatch }) {
  const user = await api.user(id, { signal });
  dispatch({ type: 'loaded', user });
}`,
          },
          {
            task: 'Implement a minimal observable with subscribe and unsubscribe. Then discuss what RxJS adds on top.',
            description: 'Checks what observables really are. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            answer: 'An observable is a function that takes an observer and returns a teardown. RxJS adds operators, schedulers and error/complete semantics. Some think observables are just promises. A strong answer covers multiple values, laziness, and teardown.',
            solution: `function interval(ms) {
  return { subscribe(next) { let i = 0; const t = setInterval(() => next(i++), ms); return () => clearInterval(t); } };
}
const unsub = interval(10).subscribe(console.log);
setTimeout(unsub, 35); // logs 0 1 2`,
          },
        ],
      },
      {
        q: 'Code review: a library puts string keys like "_meta" on user objects. These keys clash with app data. How would you redesign it?',
        code: `export function tag(obj, info) {
  obj._meta = info;
  return obj;
}
export const getTag = (obj) => obj._meta;`,
        short: 'String keys collide with user data and show up in JSON and Object.keys. Use a WeakMap side table (invisible and GC-friendly) or a module-private Symbol key, and document the choice in the library guidelines.',
        fix: `const meta = new WeakMap();
export function tag(obj, info) {
  meta.set(obj, info);
  return obj;
}
export const getTag = (obj) => meta.get(obj);`,
        long: `"_meta" pollutes user objects, can be overwritten, and leaks into serialization and equality checks.
A Symbol key avoids collisions and is hidden from JSON/Object.keys, but is still visible via getOwnPropertySymbols and fails on frozen objects.
A WeakMap side table does not touch the object at all, works with frozen objects, and frees memory with the object.
Symbol.for would share across realms/packages — use only when that is intended.
Strong candidate compares Symbol vs WeakMap trade-offs (frozen objects, proxies); weak candidate renames the key to "__meta__".`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks Symbol properties on frozen objects. Ask before running.',
            code: `'use strict';
const META = Symbol('meta');
const o = Object.freeze({ a: 1 });
try { o[META] = 1; } catch (e) { console.log(e.name); }`,
            answer: 'TypeError. Frozen objects reject new properties, including Symbol keys; a WeakMap side table would still work.',
          },
          {
            task: 'Implement a brand check with a Symbol that is private to the module. It lets you safely recognize library objects.',
            description: 'Checks Symbol-based branding. Discuss realms and Symbol.for.',
            answer: 'A private Symbol works as a brand only the module can set. Symbol.for would allow cross-bundle checks but can be forged.',
            solution: `const BRAND = Symbol('lib.brand');
export const make = (v) => ({ v, [BRAND]: true });
export const isLibObject = (o) => Boolean(o && o[BRAND]);
console.log(isLibObject(make(1)), isLibObject({ v: 1 })); // true false`,
          },
        ],
      },
    ],
  },
  'Event Loop': {
    junior: [
      {
        q: 'What does this print? Why?',
        code: `console.log('A');
setTimeout(() => console.log('B'), 0);
console.log('C');`,
        short: 'A C B — the setTimeout callback is queued as a macrotask and runs only after the current synchronous code finishes and the call stack is empty.',
        long: `Synchronous code runs to completion first; it is never interrupted by callbacks.
setTimeout(fn, 0) means "after at least 0ms" — the callback is queued as a task once the timer expires (nested timers are clamped to ≥4ms).
The event loop picks the next task only when the stack is empty, after draining microtasks.
So even a 0ms timer cannot run before 'C'.
Strong candidate mentions the queue and the empty stack; weak candidate says "0 means immediately".`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks microtask vs macrotask priority. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `setTimeout(() => console.log('timeout'), 0);
Promise.resolve().then(() => console.log('promise'));
console.log('sync');`,
            answer: 'sync, promise, timeout. Microtasks (promise callbacks) run before the next macrotask (the timer). A common wrong answer is sync, timeout, promise. A strong answer names both queues and the drain order.',
          },
          {
            task: 'Fix the bug: the spinner never shows because the loop blocks before the browser paints.',
            description: 'Checks rendering only happens between tasks. Show the snippet, ask the candidate to explain the bug first, then write the fix.',
            code: `spinner.hidden = false;
heavyWork(); // 2s synchronous
spinner.hidden = true;`,
            answer: 'Rendering happens only between tasks. Let the browser paint first (double requestAnimationFrame or setTimeout), then do the work, ideally in a Worker. Wrapping the work in a promise does not help. A strong answer recommends a Worker for long tasks.',
            solution: `spinner.hidden = false;
requestAnimationFrame(() => setTimeout(() => {
  heavyWork();
  spinner.hidden = true;
}, 0));`,
          },
        ],
      },
      {
        q: 'What are the call stack, the task queue, also called macrotask queue, and the microtask queue? How do they work together?',
        short: 'The call stack runs the current synchronous code; when it is empty, the event loop first drains all microtasks (promise callbacks, queueMicrotask), may render, then takes the next macrotask (timers, events, network callbacks).',
        long: `JavaScript has one main thread, so only one piece of code runs at a time.
Macrotasks: setTimeout/setInterval callbacks, DOM events, message events, I/O.
Microtasks: promise reactions, await continuations, queueMicrotask, MutationObserver.
After each macrotask, all microtasks run before the browser can render or start the next task.
A long synchronous function blocks everything, including clicks and painting.
Strong candidate explains the order and its effect on UI; weak candidate thinks setTimeout runs on a separate thread.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks the basic order of the three kinds of work. Ask before running.',
            code: `setTimeout(() => console.log(1));
queueMicrotask(() => console.log(2));
console.log(3);`,
            answer: '3 2 1. Synchronous code first, then the microtask, then the timer task.',
          },
          {
            task: 'Fix the bug: the counter display does not update while the loop runs.',
            description: 'Checks that rendering waits for the stack to clear. Ask what the user sees.',
            code: `for (let i = 1; i <= 5; i++) {
  counter.textContent = i;
  busyWait(500);
}`,
            answer: 'The browser cannot paint while the loop holds the main thread, so the user only sees 5 at the end. Yield between steps with setTimeout (or use a Worker for the heavy part).',
            solution: `async function run() {
  for (let i = 1; i <= 5; i++) {
    counter.textContent = i;
    await new Promise((r) => setTimeout(r, 500));
  }
}
run();`,
          },
        ],
      },
    ],
    middle: [
      {
        q: 'Predict the order without running. Explain each step.',
        ai: true,
        code: `console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3')).then(() => console.log('4'));
queueMicrotask(() => console.log('5'));
(async () => { console.log('6'); await null; console.log('7'); })();
console.log('8');`,
        short: '1 6 8 3 5 7 4 2 — sync code first (an async function body runs synchronously until its first await), then microtasks in FIFO order, with the chained .then queued as a later microtask, then the timer macrotask.',
        follow: 'Where does requestAnimationFrame fit?',
        long: `Sync: '1'; setTimeout queues a macrotask; .then(3) queues microtask M1; queueMicrotask queues M2; the IIFE logs '6' and await null queues M3; then '8'.
Microtask drain: M1 logs '3' and resolves its promise, queuing '4' (M4); M2 logs '5'; M3 resumes the async function → '7'; M4 logs '4'.
All microtasks are drained before the next macrotask, then the timer logs '2'.
Follow-up: requestAnimationFrame callbacks run in the rendering step before the next paint, after microtasks; relative to setTimeout 0 the order is not guaranteed.
Awaiting a non-promise or a native promise takes one microtask tick in modern engines.
Strong candidate narrates the queues step by step; weak candidate puts 2 before the promises or 6 after 8.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks microtask draining between macrotasks. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `setTimeout(() => {
  console.log('t1');
  Promise.resolve().then(() => console.log('p1'));
}, 0);
setTimeout(() => console.log('t2'), 0);`,
            answer: 't1 p1 t2. After each macrotask the microtask queue is drained, so p1 runs before the second timer. Many answer t1 t2 p1. A strong answer explains the checkpoint after each task.',
          },
          {
            task: 'Predict the output.',
            description: 'Checks await resumption order. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `async function a() { console.log('a1'); await b(); console.log('a2'); }
async function b() { console.log('b'); }
a();
console.log('end');`,
            answer: 'a1 b end a2. b runs synchronously inside a; the code after await resumes as a microtask. Some put a2 before end. A strong answer explains that code after await always resumes asynchronously.',
          },
        ],
      },
      {
        q: 'Where do requestAnimationFrame, requestIdleCallback, and MutationObserver fit in the event loop? When would you use each one?',
        short: 'requestAnimationFrame callbacks run once per frame right before style/layout/paint, which makes them ideal for visual updates; requestIdleCallback runs when the browser is idle after a frame, for low-priority work; MutationObserver callbacks are microtasks fired after DOM changes.',
        long: `rAF: synchronize animations and DOM writes with the display refresh; paused in background tabs.
rIC: analytics, prefetching, cache warming; has a deadline (timeRemaining()) and an optional timeout; not supported in Safari.
MutationObserver: batched DOM change notifications delivered as microtasks — before rendering.
setTimeout(0) is not frame-aligned and can cause jank for animations.
Strong candidate places each correctly relative to microtasks and rendering; weak candidate treats rAF as a faster setTimeout.`,
        exercises: [
          {
            task: 'Predict the order (in a browser).',
            description: 'Checks MutationObserver as a microtask. Ask before running.',
            code: `const mo = new MutationObserver(() => console.log('mutation'));
mo.observe(document.body, { childList: true });
setTimeout(() => console.log('timeout'));
document.body.append(document.createElement('div'));
console.log('sync');`,
            answer: 'sync, mutation, timeout. The observer callback is queued as a microtask, so it runs before the timer task.',
          },
          {
            task: 'Implement a smooth progress bar. It writes to the DOM at most once per frame.',
            description: 'Checks rAF batching. Discuss why multiple writes per frame are wasted.',
            answer: 'Store the latest value and schedule a single rAF; only the final value of each frame is rendered.',
            solution: `let latest = 0, scheduled = false;
function setProgress(v) {
  latest = v;
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => { scheduled = false; bar.style.transform = 'scaleX(' + latest + ')'; });
}`,
          },
        ],
      },
    ],
    senior: [
      {
        q: 'Why does this freeze the page even though it is "async"? Fix it.',
        code: `async function process(items) {
  for (const it of items) await Promise.resolve(heavy(it));
}`,
        short: 'heavy() runs synchronously and each await only schedules a microtask; microtasks drain before rendering or input handling, so the browser never gets a chance to paint. Yield to a macrotask (scheduler.yield(), setTimeout/MessageChannel chunking) or move the work to a Web Worker.',
        fix: 'for (const it of items) { heavy(it); await new Promise(r => setTimeout(r)); }',
        long: `Promise.resolve(heavy(it)) computes heavy(it) synchronously first; wrapping the result in a promise does not offload work.
The event loop renders only between tasks, and microtasks queued during the drain keep running — effectively one giant task.
Fixes: yield via a macrotask every N items or every ~5–10ms of work (check performance.now()), scheduler.yield()/postTask where supported, requestIdleCallback for low-priority work, or a Web Worker for real parallelism.
setTimeout yielding gets ~4ms clamping after nesting; MessageChannel or scheduler.yield are faster.
Measure with the Performance panel (long tasks, INP).
Strong candidate explains microtask vs task and time-sliced chunking; weak candidate adds more async/await.`,
        exercises: [
          {
            task: 'Implement yieldToMain. Use scheduler.yield when it exists. Otherwise use MessageChannel.',
            description: 'Checks yielding strategies. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            answer: 'scheduler.yield resumes with priority; MessageChannel posts a task without the roughly 4ms clamp that nested setTimeout gets. Using setTimeout(0) in tight loops adds clamping delay. A strong answer mentions feature detection and priority.',
            solution: `function yieldToMain() {
  if (globalThis.scheduler?.yield) return scheduler.yield();
  return new Promise((r) => { const { port1, port2 } = new MessageChannel(); port1.onmessage = () => { port1.close(); r(); }; port2.postMessage(null); });
}
yieldToMain().then(() => console.log('resumed'));`,
          },
          {
            task: 'Predict whether "timeout" ever logs.',
            description: 'Checks microtask starvation. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `setTimeout(() => console.log('timeout'), 0);
function spin() { Promise.resolve().then(spin); }
spin();`,
            answer: 'It never logs. Each microtask queues another, so the microtask queue never empties and the timer task (and rendering) are starved. Some expect the timer to run eventually. A strong answer connects this to frozen UIs and recursive promise loops.',
          },
        ],
      },
      {
        q: 'How is the Node.js event loop different from the browser one? Explain its phases. Compare process.nextTick and setImmediate.',
        short: 'Node uses libuv with phases (timers, pending callbacks, poll, check, close callbacks); setImmediate runs in the check phase after poll, while process.nextTick callbacks run before promise microtasks, after the current operation. Browsers have task queues plus rendering steps instead of these phases.',
        long: `Phases: timers (setTimeout/setInterval) → pending callbacks → poll (I/O) → check (setImmediate) → close.
Between callbacks Node drains the nextTick queue first, then promise microtasks.
setTimeout(0) vs setImmediate order is non-deterministic in the main module, but inside an I/O callback setImmediate always runs first.
Recursive nextTick can starve I/O, just as recursive microtasks starve rendering in browsers.
Browsers: no nextTick/setImmediate; rendering opportunities between tasks.
Strong candidate knows the nextTick-before-promises rule and the I/O-callback ordering; weak candidate says Node and browsers are identical.`,
        exercises: [
          {
            task: 'Predict the output (Node.js).',
            description: 'Checks nextTick vs promise microtasks. Ask before running.',
            code: `Promise.resolve().then(() => console.log('promise'));
process.nextTick(() => console.log('nextTick'));
console.log('sync');`,
            answer: 'sync, nextTick, promise. Node drains the nextTick queue before the promise microtask queue.',
          },
          {
            task: 'Predict the output (Node.js).',
            description: 'Checks setImmediate vs setTimeout inside an I/O callback. Ask the candidate to explain the phases.',
            code: `require('node:fs').readFile(__filename, () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
});`,
            answer: 'immediate, timeout. After the poll phase (where the I/O callback ran), the loop goes to the check phase first, then wraps around to timers. In the main module the order would not be guaranteed. (Run it as CommonJS, since it uses require and __filename.)',
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'INP is bad in production on cheap, slow devices. How would you organize the investigation across teams?',
        ai: true,
        short: 'Collect RUM data with attribution (web-vitals library, Long Animation Frames API), map slow interactions to owning teams, set budgets, and fix via yielding, workers and code splitting — tracking INP per release.',
        long: `Measure first: field data (CrUX + own RUM) segmented by device class, page and interaction; lab tests with CPU throttling do not fully reflect reality.
Attribution: the web-vitals attribution build gives the target element and the input delay / processing / presentation breakdown; LoAF identifies scripts responsible for long frames.
Organize: a dashboard of the worst interactions with owners, a perf champion per team, priorities by user impact.
Typical fixes: break up long tasks, defer non-critical work until after paint, reduce hydration/re-render cost, virtualize large lists, move CPU work to workers, trim third-party scripts.
Governance: budgets and alerts in CI/RUM, regression tracking per release, postmortems for regressions.
Strong candidate talks about field data, attribution and ownership; weak candidate runs Lighthouse once and minifies code.`,
        exercises: [
          {
            task: 'Use PerformanceObserver event timing to collect slow interactions from real users.',
            description: 'Checks field attribution of slow interactions. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            answer: 'Event Timing entries carry the duration and the target, which attribute slow interactions to features and owners. The web-vitals library wraps this for INP. Lab-only measurement is the weak answer. A strong answer covers sampling, privacy, and mapping targets to owners.',
            solution: `new PerformanceObserver((list) => {
  for (const e of list.getEntries()) {
    if (e.duration > 200) navigator.sendBeacon('/rum', JSON.stringify({ name: e.name, dur: e.duration, target: e.target?.id }));
  }
}).observe({ type: 'event', durationThreshold: 104, buffered: true });`,
          },
          {
            task: 'Fix this handler. The screen should update quickly, and the analytics must not hurt INP.',
            description: 'Checks interaction-to-next-paint optimization. Show the snippet, ask the candidate to explain the bug first, then write the fix.',
            code: `button.onclick = () => {
  trackAnalytics();   // 80ms
  rebuildIndex();     // 150ms
  button.classList.add('active');
};`,
            answer: 'Apply the visual change first, then defer non-urgent work until after the next paint (or move it to idle time or a Worker). Reordering alone without deferring is not enough. A strong answer explains the input/processing/presentation phases of INP.',
            solution: `button.onclick = () => {
  button.classList.add('active');
  requestAnimationFrame(() => setTimeout(() => { trackAnalytics(); rebuildIndex(); }, 0));
};`,
          },
        ],
      },
      {
        q: 'Code review: an analytics SDK does heavy synchronous work in every click handler. This hurts INP in every product that uses it. What do you change? What rules do you set for third-party scripts?',
        code: `document.addEventListener('click', (e) => {
  const payload = buildPayload(e); // 60ms: serializes the DOM path, computes hashes
  navigator.sendBeacon('/collect', JSON.stringify(payload));
}, true);`,
        short: 'Capture only cheap data in the handler, defer serialization to idle time, and batch beacons. Governance: performance budgets and contract tests for third-party scripts, loading them async/deferred, and monitoring their long tasks with LoAF attribution.',
        fix: `const queue = [];
document.addEventListener('click', (e) => {
  queue.push({ t: e.timeStamp, target: e.target.closest('[data-track]')?.dataset.track });
  scheduleFlush();
}, { capture: true, passive: true });
let scheduled = false;
function scheduleFlush() {
  if (scheduled) return;
  scheduled = true;
  (window.requestIdleCallback || setTimeout)(() => {
    scheduled = false;
    navigator.sendBeacon('/collect', JSON.stringify(queue.splice(0)));
  });
}`,
        long: `A capture-phase listener on document runs for every click before the app's own handlers, so its 60ms is added to every interaction.
Fix: minimal synchronous work (timestamps, ids), batch and send in idle callbacks or after the next paint, consider a Worker for hashing.
Governance: third-party script review, async loading, performance budgets in vendor contracts, LoAF/long-task attribution in RUM, the ability to kill-switch scripts.
Strong candidate fixes the code and sets up vendor governance; weak candidate only wraps the code in setTimeout without batching or measuring.`,
        exercises: [
          {
            task: 'Predict the impact.',
            description: 'Checks capture listeners on document. Ask how INP changes for every product.',
            code: 'document.addEventListener(\'click\', () => busyWait(60), true);',
            answer: 'Every click anywhere in the app gets at least 60ms of processing delay before any app handler can respond, which directly worsens INP. A strong answer suggests measuring it with Event Timing attribution.',
          },
          {
            task: 'Implement a kill switch, so you can turn off a broken third-party script remotely.',
            description: 'Checks operational control over third parties. Discuss the config source and its fallback.',
            answer: 'Load third-party scripts through a loader that checks a remote config first, so ops can disable them without a deploy.',
            solution: `async function loadThirdParty(name, src) {
  const cfg = await fetch('/config/scripts.json').then((r) => r.json()).catch(() => ({}));
  if (cfg[name] === false) return;
  const s = document.createElement('script');
  s.src = src; s.async = true;
  document.head.append(s);
}`,
          },
        ],
      },
    ],
  },
  'Performance Optimization': {
    junior: [
      {
        q: 'What is the difference between debounce and throttle? Where would you use each one?',
        short: 'Debounce runs the function only after calls stop for a given delay (search input, autosave); throttle runs it at most once per interval while calls continue (scroll, resize, mousemove).',
        long: `Debounce resets a timer on each call; the function fires once after a quiet period (trailing) or optionally immediately (leading).
Throttle guarantees a steady rate during continuous events — useful for scroll position tracking or infinite-scroll checks.
For visual updates tied to frames, requestAnimationFrame-based throttling is often better.
Pitfall: in React, recreating the debounced function on every render resets its timer — keep it stable (useMemo/useRef) and cancel on unmount.
Strong candidate gives correct use cases and leading/trailing options; weak candidate swaps the definitions.`,
        exercises: [
          {
            task: 'Fix the bug: the resize handler runs hundreds of times per second.',
            description: 'Checks rAF-based throttling. Show the snippet, ask the candidate to explain the bug first, then write the fix.',
            code: 'window.addEventListener(\'resize\', () => recalcLayout());',
            answer: 'Throttle the handler to once per animation frame. Debouncing would delay updates until resizing stops. A strong answer explains why frame alignment matches rendering.',
            solution: `let queued = false;
window.addEventListener('resize', () => {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; recalcLayout(); });
});`,
          },
          {
            task: 'Predict which loop is faster and why.',
            description: 'Checks algorithmic complexity of lookups. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `const arr = Array.from({ length: 1e5 }, (_, i) => i);
// A: arr.includes(x) inside a loop over arr
// B: const set = new Set(arr); set.has(x) inside the loop`,
            answer: 'B. Array includes is O(n) per lookup (O(n²) overall); Set.has is O(1) on average. Some think includes is "native so fast". A strong answer reasons about Big-O and the cost of building the Set.',
          },
        ],
      },
      {
        q: 'Find and fix the performance bug. The search filters a list of 50 thousand items on every key press, so the input is slow.',
        code: `input.addEventListener('input', (e) => {
  render(items.filter((i) => i.name.includes(e.target.value)));
});`,
        short: 'The expensive filter and render run on every keystroke. Debounce the handler so the work runs once the user pauses typing; for large lists also virtualize the rendering.',
        fix: `const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
input.addEventListener('input', debounce((e) => {
  render(items.filter((i) => i.name.includes(e.target.value)));
}, 200));`,
        long: `Each keystroke triggers filtering of 50k items plus a large DOM update, so input handling is slow.
Debounce (200–300ms) reduces how often the work runs; throttle is better if results must update while typing.
Also consider: lowercase/precompute search fields once, render only visible rows, move filtering to a Worker for huge data.
Strong candidate debounces and mentions rendering cost; weak candidate micro-optimizes the filter callback.`,
        exercises: [
          {
            task: 'Predict how many times save runs.',
            description: 'Checks debounce behavior. Ask before running.',
            code: `const debounce = (fn, ms) => { let t; return () => { clearTimeout(t); t = setTimeout(fn, ms); }; };
let calls = 0;
const save = debounce(() => console.log('save', ++calls), 50);
save(); save(); setTimeout(save, 100);`,
            answer: 'Twice. The first two calls collapse into one (save 1 at about 50ms); the third, after the pause, runs again (save 2 at about 150ms).',
          },
          {
            task: 'Fix the bug: each scroll event triggers a style recalculation in a loop.',
            description: 'Checks DOM read/write in scroll handlers. Ask how many layouts happen.',
            code: `window.addEventListener('scroll', () => {
  items.forEach((el) => { el.style.opacity = el.getBoundingClientRect().top < 500 ? 1 : 0.5; });
});`,
            answer: 'Reading the rect after writing styles forces layout on every item. Use IntersectionObserver instead, or at least batch reads and writes in a rAF.',
            solution: `const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { e.target.style.opacity = e.isIntersecting ? 1 : 0.5; });
});
items.forEach((el) => io.observe(el));`,
          },
        ],
      },
    ],
    middle: [
      {
        q: 'Implement debounce. What is wrong with how this list renders?',
        code: 'items.forEach(i => { list.innerHTML += \'<li>\' + i + \'</li>\'; });',
        short: 'innerHTML += re-serializes and re-parses the whole list on every iteration (O(n²)) and injects unescaped strings (XSS). Build nodes with textContent in a DocumentFragment and insert once.',
        fix: 'const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };',
        long: `innerHTML += reads the current HTML, concatenates, and replaces all children — existing nodes are destroyed (losing listeners, focus, state) and rebuilt each time.
The cost grows quadratically with the number of items and causes long tasks for big lists.
Security: item values containing HTML markup become live DOM — use textContent or sanitize.
Better: create elements, set textContent, append them to a DocumentFragment, then append once; or list.replaceChildren(...nodes).
For thousands of rows, virtualize.
Debounce: clear the previous timer on each call and schedule a new one; forward args (and this if needed); production versions add cancel/flush.
Strong candidate names both the performance and XSS problems; weak candidate only says "innerHTML is slow".`,
        exercises: [
          {
            task: 'Implement lazy loading of images that enter the viewport using IntersectionObserver.',
            description: 'Checks viewport-based lazy loading. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            answer: 'Observe the placeholders and set src once they intersect, then stop observing. Native loading="lazy" covers simple cases. Scroll listeners with getBoundingClientRect are the weak approach. A strong answer mentions rootMargin for prefetching.',
            solution: `const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.src = e.target.dataset.src; io.unobserve(e.target); }
});
document.querySelectorAll('img[data-src]').forEach((img) => io.observe(img));`,
          },
          {
            task: 'Fix the bug: the debounced search fires on every keystroke in this component-like code.',
            description: 'Checks debounce identity across calls. Show the snippet, ask the candidate to explain the bug first, then write the fix.',
            code: `function onInput(e) {
  const run = debounce(() => search(e.target.value), 300);
  run();
}`,
            answer: 'A new debounced function (with its own timer) is created on every call. Create it once and reuse it. A frequent bug is in React components that re-render. A strong answer stabilizes the function (useMemo/useRef) and cancels on unmount.',
            solution: `const runSearch = debounce((q) => search(q), 300);
function onInput(e) { runSearch(e.target.value); }`,
          },
        ],
      },
      {
        q: 'What are the main causes of slow page loads in a SPA? What fixes each one?',
        short: 'The usual causes are large JavaScript bundles, render-blocking resources, unoptimized images and fonts, request waterfalls, and slow server responses. They are addressed by code splitting, compression and caching, lazy loading, preloading critical resources, image optimization, and SSR or streaming.',
        long: `Big bundles: code splitting by route, tree-shaking, removing heavy dependencies, analyzing with a bundle visualizer.
Render-blocking CSS/JS: defer/async scripts, critical CSS, font-display: swap.
Images: modern formats (AVIF/WebP), responsive srcset, lazy loading, explicit dimensions (avoids CLS).
Waterfalls: preload/preconnect, parallel data fetching, avoiding fetch-on-render chains.
Caching: long-lived hashed assets, CDN, HTTP/2+.
Measure with LCP/INP/CLS in the field, not just Lighthouse.
Strong candidate links causes to metrics; weak candidate lists "minify" only.`,
        exercises: [
          {
            task: 'Predict which is loaded first and why.',
            description: 'Checks resource hints. Ask the candidate to reason about the browser.',
            code: `<link rel="preload" href="/hero.avif" as="image">
<script src="/app.js"></script>
<!-- hero.avif is set later via CSS background in app.js -->`,
            answer: 'With preload the hero image starts downloading immediately, in parallel with app.js; without it, the browser would only discover the image after the JS runs. This improves LCP. A strong answer warns that over-preloading competes for bandwidth.',
          },
          {
            task: 'Fix the image so it does not cause layout shift and loads efficiently.',
            description: 'Checks CLS and responsive images. Ask what to add.',
            code: '<img src="/photo-2000.jpg">',
            answer: 'Add width/height (or aspect-ratio) to reserve space, srcset/sizes for responsive sizes, and lazy loading for below-the-fold images.',
            solution: `<img src="/photo-800.jpg"
     srcset="/photo-400.jpg 400w, /photo-800.jpg 800w, /photo-2000.jpg 2000w"
     sizes="(max-width: 600px) 100vw, 800px"
     width="800" height="533" loading="lazy" decoding="async" alt="Team photo">`,
          },
        ],
      },
    ],
    senior: [
      {
        q: 'Explain layout thrashing and fix it.',
        code: 'boxes.forEach(b => { b.style.width = b.offsetWidth + 10 + \'px\'; });',
        short: 'Each iteration writes a style, and the next read (offsetWidth) forces a synchronous layout, so layout runs n times. Batch all reads first, then all writes (or use requestAnimationFrame / transforms).',
        long: `Browsers defer layout until needed; reading geometry (offsetWidth, getBoundingClientRect, scrollTop) after a style write forces a synchronous "forced reflow".
Interleaving reads and writes in a loop turns one layout into n layouts — visible as purple "Layout" blocks with forced-reflow warnings in the Performance panel.
Fix: a read phase collects all measurements, a write phase applies them; libraries like fastdom formalize this.
Prefer transform/opacity for animations (compositor-only, no layout), ResizeObserver instead of polling sizes, and CSS containment (contain: layout) to limit layout scope.
Strong candidate lists layout-triggering properties and the DevTools signal; weak candidate suggests wrapping everything in setTimeout.`,
        exercises: [
          {
            task: 'Implement windowing: render only the visible rows of a 100k-row list.',
            description: 'Checks list virtualization. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            answer: 'Compute the visible index range from scrollTop and the row height, and offset a spacer so the scrollbar stays correct. A weak answer paginates instead of virtualizing. A strong answer covers overscan, variable heights, and accessibility concerns.',
            solution: `function visibleRange(scrollTop, viewportH, rowH, total, overscan = 5) {
  const start = Math.max(0, Math.floor(scrollTop / rowH) - overscan);
  const end = Math.min(total, Math.ceil((scrollTop + viewportH) / rowH) + overscan);
  return { start, end, offsetY: start * rowH };
}
console.log(visibleRange(5000, 600, 50, 100000)); // { start: 95, end: 117, offsetY: 4750 }`,
          },
          {
            task: 'Predict which line forces a synchronous layout.',
            description: 'Checks forced synchronous layout. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `el.style.width = '100px';   // 1
el.classList.add('wide');   // 2
const h = el.offsetHeight; // 3
el.style.color = 'red';    // 4`,
            answer: 'Line 3. Reading geometry after style writes forces layout; writes alone are batched until the next frame. Some pick line 1 or 2. A strong answer lists layout-triggering reads.',
          },
        ],
      },
      {
        q: 'How do you find and fix a memory leak in a long-running SPA? Explain the tools and the common causes.',
        short: 'Reproduce with a repeatable scenario, take heap snapshots before and after (DevTools Memory panel), compare retained objects and follow retainer paths to the root. Common causes are uncleaned listeners/timers/subscriptions, growing caches, detached DOM nodes and closures capturing large objects.',
        long: `Workflow: baseline snapshot → repeat the action N times → force GC → snapshot → compare "Objects allocated between snapshots".
Look for detached DOM trees, growing arrays/maps, and listeners in the "Retainers" panel.
Allocation instrumentation on a timeline shows what keeps being allocated.
Fix patterns: cleanup functions, AbortController for listeners, bounded caches/WeakMap, avoiding globals, unsubscribing observables.
Automate with memlab in CI for critical flows.
Strong candidate describes the snapshot-diff and retainer workflow; weak candidate says "reload the page".`,
        exercises: [
          {
            task: 'Fix the leak in this component-like code.',
            description: 'Checks cleanup of intervals and listeners. Ask what keeps the component alive.',
            code: `function mountClock(el) {
  setInterval(() => { el.textContent = new Date().toLocaleTimeString(); }, 1000);
  window.addEventListener('resize', () => el.classList.toggle('small', innerWidth < 600));
}`,
            answer: 'The interval and the resize listener keep el alive forever and keep running after unmount. Return a cleanup function that clears both (an AbortController removes the listener).',
            solution: `function mountClock(el) {
  const id = setInterval(() => { el.textContent = new Date().toLocaleTimeString(); }, 1000);
  const ctrl = new AbortController();
  window.addEventListener('resize', () => el.classList.toggle('small', innerWidth < 600), { signal: ctrl.signal });
  return () => { clearInterval(id); ctrl.abort(); };
}`,
          },
          {
            task: 'After run returns, can the large array be garbage collected? Predict the answer.',
            description: 'Checks closure retention. Ask the candidate to explain what keeps it alive.',
            code: `let handler;
function run() {
  const big = new Array(1e6).fill(0);
  handler = () => big.length;
}
run();`,
            answer: 'No. handler is a global closure that references big, so big stays reachable. Setting handler = null (or not capturing big) allows collection.',
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'How do you make a team care about performance? Think about budgets, monitoring, and ownership. What did you do in a past team?',
        ai: true,
        short: 'Define budgets enforced in CI (bundle size, Lighthouse/Web Vitals), RUM dashboards with SLOs, perf review for big features, and clear ownership. Look for real experience and measurable outcomes.',
        long: `Make performance visible: RUM dashboards for LCP/INP/CLS by page and device, shared in team rituals.
Budgets: bundle size limits (size-limit), Lighthouse CI thresholds, PRs failing on regressions with an explicit override process.
Ownership: each route/feature has an owner; perf regressions are bugs with SLAs.
Process: perf considerations in design docs, profiling for big features, perf sprints only as a complement.
Education: brown bags, documented patterns, perf champions per team.
Tie performance to business metrics (conversion, retention) to keep it prioritized.
Strong candidate tells a concrete story with numbers; weak candidate lists tools without process or results.`,
        exercises: [
          {
            task: 'Implement a CI check. It fails when the gzipped main bundle grows more than 5 percent over the baseline.',
            description: 'Checks bundle size budgets in CI. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            answer: 'Compare against a committed baseline so regressions are caught in review, not in production. A weak answer checks only the raw size. A strong answer uses compressed sizes, a baseline process, and owners for overrides.',
            solution: `import { gzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';
const size = gzipSync(readFileSync('dist/main.js')).length;
const base = JSON.parse(readFileSync('size-baseline.json', 'utf8')).main;
if (size > base * 1.05) { console.error('Bundle grew', size, 'vs', base); process.exit(1); }`,
          },
          {
            task: 'Fix this real user monitoring (RUM) snippet so it does not lose data when the page closes.',
            description: 'Checks reliable RUM beacons. Show the snippet, ask the candidate to explain the bug first, then write the fix.',
            code: `window.addEventListener('unload', () => {
  fetch('/rum', { method: 'POST', body: JSON.stringify(metrics) });
});`,
            answer: 'unload is unreliable (it breaks the bfcache and rarely fires on mobile). Send on visibilitychange → hidden, using sendBeacon or fetch with keepalive. Many still use unload. A strong answer knows the bfcache impact and the visibilitychange/pagehide guidance.',
            solution: `document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') navigator.sendBeacon('/rum', JSON.stringify(metrics));
});`,
          },
        ],
      },
      {
        q: 'Code review: a PR adds a 300 KB date library. It is used for one date format on the landing page. What do you say? How do you stop this from happening again?',
        code: `import moment from 'moment';
export const formatDate = (d) => moment(d).format('MMM D, YYYY');`,
        short: 'Replace it with the built-in Intl.DateTimeFormat (zero bytes added), and if a library is truly needed, choose a tree-shakeable one. Prevent it systematically with bundle-size budgets in CI, size-diff comments on PRs, and a dependency review step.',
        fix: `const fmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
export const formatDate = (d) => fmt.format(new Date(d));`,
        long: `Moment is large and not tree-shakeable, and the landing page is the most performance-sensitive route.
Intl covers most formatting needs with locale support; caching the formatter avoids repeated construction.
Systematic: size-limit or bundlewatch in CI with per-route budgets, PR comments showing the size delta, an approved-dependency list, ESLint no-restricted-imports for known heavy packages.
Educate with examples and measure LCP impact.
Strong candidate offers a native alternative and process guardrails; weak candidate approves because "it is only one import".`,
        exercises: [
          {
            task: 'Fix the import to avoid pulling the whole library.',
            description: 'Checks tree-shakeable imports. Ask what changes in the bundle.',
            code: `import _ from 'lodash';
const f = _.debounce(save, 200);`,
            answer: 'Importing the default lodash object pulls in the entire library. Import the single function (lodash-es named import or a per-method path) so only the needed code ships.',
            solution: `import debounce from 'lodash-es/debounce';
const f = debounce(save, 200);`,
          },
          {
            task: 'Implement an ESLint config entry that blocks known heavy imports.',
            description: 'Checks guardrail tooling. Discuss the message and exceptions.',
            answer: 'no-restricted-imports with a clear message points developers to the approved alternative at review time.',
            solution: `// eslint config
rules: {
  'no-restricted-imports': ['error', {
    paths: [
      { name: 'moment', message: 'Use Intl.DateTimeFormat or date-fns.' },
      { name: 'lodash', message: 'Import per-method from lodash-es.' },
    ],
  }],
}`,
          },
        ],
      },
    ],
  },
  'Advanced Strategies and Integration': {
    junior: [
      {
        q: 'What are ES modules? Difference between default and named exports?',
        short: 'ES modules are the standard static import/export system, each with its own scope. Named exports can be many and are imported by exact name; a module has at most one default export, imported under any name. Named exports are friendlier to refactoring and tooling.',
        long: `Modules are evaluated once and cached; imports are live read-only bindings, not copies.
Static structure (top-level import/export) enables tree-shaking and early errors; import() provides dynamic loading for code splitting.
Module code runs in strict mode, top-level this is undefined, and top-level await is allowed.
Default exports allow inconsistent naming across files and complicate auto-imports/renames; many teams prefer named exports.
In browsers: <script type="module"> is deferred by default and subject to CORS.
Strong candidate mentions live bindings and dynamic import; weak candidate equates ESM with CommonJS require.`,
        exercises: [
          {
            task: 'Fix the import so it matches the export.',
            description: 'Checks named vs default imports. Show the snippet, ask the candidate to explain the bug first, then write the fix.',
            code: `// math.js
export const sum = (a, b) => a + b;
// app.js
import sum from './math.js';`,
            answer: 'sum is a named export, so it needs braces; a default import would be undefined (or fail to resolve). Some add a default export everywhere instead. A strong answer explains that the import syntax must match the export.',
            solution: 'import { sum } from \'./math.js\';',
          },
          {
            task: 'Predict the output (live bindings).',
            description: 'Checks ESM live bindings. Ask the candidate to predict the result before running it, then run it to confirm.',
            code: `// counter.js
export let count = 0;
export const inc = () => { count++; };
// app.js
import { count, inc } from './counter.js';
inc();
console.log(count);`,
            answer: '1. ES module imports are live bindings to the exporting variable, not copies (unlike destructuring a CommonJS require). Many answer 0, as with CommonJS. A strong answer notes imports are read-only: count++ in app.js would throw.',
          },
        ],
      },
      {
        q: 'Find and fix the bug: the browser says "Cannot use import statement outside a module".',
        code: `<!-- index.html -->
<script src="./app.js"></script>
// app.js
import { sum } from './math.js';
console.log(sum(1, 2));`,
        short: 'Browsers treat scripts as classic scripts unless they are marked type="module". Add type="module", and serve the files over HTTP, because modules do not load from file:// URLs because of CORS.',
        fix: '<script type="module" src="./app.js"></script>',
        long: `Module scripts are deferred by default, run in strict mode, have their own scope and support import/export.
Imports need full relative paths with extensions in the browser (./math.js), unless a bundler or import map resolves them.
Opening the HTML file directly (file://) fails due to CORS; use a dev server.
Strong candidate mentions defer behavior and file extensions; weak candidate switches to require.`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks that modules are evaluated once. Ask before running.',
            code: `// log.js
console.log('log.js evaluated');
export const x = 1;
// app.js
import './log.js';
import { x } from './log.js';
console.log(x);`,
            answer: '"log.js evaluated" once, then 1. Modules are cached by URL and evaluated only once, no matter how many times they are imported.',
          },
          {
            task: 'Export a constant and a function as named exports. Then import them with an alias.',
            description: 'Checks named export/import syntax. Quick warm-up.',
            answer: 'Named exports can be renamed at import time with "as", which avoids name clashes.',
            solution: `// config.js
export const API_URL = '/api';
export function buildUrl(path) { return API_URL + path; }
// app.js
import { buildUrl as url, API_URL } from './config.js';
console.log(url('/users'), API_URL);`,
          },
        ],
      },
    ],
    middle: [
      {
        q: 'How does tree-shaking work and what breaks it?',
        short: 'The bundler statically analyzes ESM imports/exports and drops unused exports. It is broken by CommonJS, modules with side effects (or a missing/incorrect "sideEffects" flag), barrel files re-exporting everything, and dynamic property access.',
        long: `It relies on static import/export: the bundler marks used exports and the minifier removes dead code.
CommonJS (require, module.exports) is dynamic, so bundlers usually keep everything.
Top-level side effects (polyfills, global registration, CSS imports) force a module to be kept unless package.json declares "sideEffects" correctly.
Barrel files (index.js re-exporting everything) can pull in heavy modules, especially combined with side effects, and slow down dev builds.
import * as utils followed by utils[name] defeats analysis; class methods cannot be shaken individually.
Verify with a bundle analyzer rather than assumptions.
Strong candidate explains sideEffects and how to verify; weak candidate says "Webpack removes unused code automatically".`,
        exercises: [
          {
            task: 'Implement code splitting by route, so the admin page code loads only when the user goes there.',
            description: 'Checks dynamic import and chunking. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            answer: 'Dynamic import() creates a separate chunk that is fetched on demand. Static imports defeat splitting. A strong answer mentions preloading on hover, and error handling for failed chunk loads.',
            solution: `async function openAdmin() {
  const { renderAdmin } = await import('./admin.js');
  renderAdmin(document.getElementById('app'));
}`,
          },
          {
            task: 'Fix the barrel import. It adds the whole icon library to the bundle.',
            description: 'Checks barrel files and side effects. Show the snippet, ask the candidate to explain the bug first, then write the fix.',
            code: 'import { CloseIcon } from \'icons\'; // index.js re-exports 2000 icons with side effects',
            answer: 'Import the module directly (a deep import), or make sure the package declares sideEffects: false so the bundler can prune it. Some blame tree-shaking in general. A strong answer verifies the result with a bundle analyzer.',
            solution: 'import CloseIcon from \'icons/CloseIcon\';',
          },
        ],
      },
      {
        q: 'Find and fix the bug. This code mixes CommonJS and ESM. It breaks after the project moves to ESM.',
        code: `// package.json: "type": "module"
const fs = require('fs');
const data = JSON.parse(fs.readFileSync(__dirname + '/data.json', 'utf8'));
module.exports = data;`,
        short: 'In ES modules require, module.exports and __dirname do not exist. Use import/export and resolve paths with import.meta.url (or import.meta.dirname in recent Node).',
        fix: `import { readFileSync } from 'node:fs';
const data = JSON.parse(readFileSync(new URL('./data.json', import.meta.url), 'utf8'));
export default data;`,
        long: `With "type": "module", .js files are ESM: strict mode, no require/module/exports/__filename/__dirname.
Use new URL('./file', import.meta.url) for file paths; JSON can also be imported with import attributes (with { type: 'json' }).
createRequire from node:module can bridge legacy require calls.
Mixed packages need "exports" maps with import/require conditions.
Strong candidate knows the replacements and dual-package concerns; weak candidate renames files to .cjs without understanding why.`,
        exercises: [
          {
            task: 'Predict the output when importing a CommonJS module from ESM.',
            description: 'Checks CJS default interop. Ask what the default import contains.',
            code: `// lib.cjs
module.exports = { a: 1 };
module.exports.b = 2;
// app.mjs
import lib from './lib.cjs';
console.log(lib);`,
            answer: '{ a: 1, b: 2 }. Node exposes module.exports as the default export of a CommonJS module. Named imports may or may not work depending on static analysis (cjs-module-lexer).',
          },
          {
            task: 'Fix the dynamic import path so it works after bundling.',
            description: 'Checks bundler-analyzable dynamic imports. Discuss why fully dynamic paths fail.',
            code: 'const page = await import(pageName);',
            answer: 'Bundlers cannot know which files to include for a fully dynamic specifier. Use a partially static path or an explicit map of loaders.',
            solution: `const pages = {
  home: () => import('./pages/home.js'),
  about: () => import('./pages/about.js'),
};
const page = await pages[pageName]();`,
          },
        ],
      },
    ],
    senior: [
      {
        q: 'When would you use a Web Worker, a Service Worker, or WebAssembly? Give a real example for each.',
        short: 'Web Worker: CPU-heavy work off the main thread (parsing a large CSV, search indexing). Service Worker: a network proxy for offline caching, background sync and push. WebAssembly: performance-critical or ported native code (image/video codecs, CAD, SQLite).',
        long: `Web Worker: a separate thread without DOM access; communicates via postMessage (structured clone) or transferables/SharedArrayBuffer (requires cross-origin isolation). Use it for anything causing long tasks.
Service Worker: event-driven, intercepts fetch within its scope, lives independently of pages, enables offline/PWA, caching strategies (stale-while-revalidate) and push notifications. Pitfalls: update lifecycle, stale caches, HTTPS only.
WebAssembly: near-native compute speed and reuse of C/C++/Rust libraries (ffmpeg, SQLite); JS↔Wasm calls and data copying have overhead; often runs inside a worker.
They combine well: Wasm inside a worker, a Service Worker caching the Wasm binary.
Strong candidate gives concrete cases and costs (serialization, update lifecycle, binary size); weak candidate mixes up Web Workers and Service Workers.`,
        exercises: [
          {
            task: 'Implement offloading a heavy computation to a Web Worker behind a promise API.',
            description: 'Checks worker RPC design. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            answer: 'Wrap postMessage/onmessage in a promise and use an id to match responses to requests. A weak version has no request ids, so concurrent calls get mixed up. A strong answer mentions transferables and error propagation.',
            solution: `// worker.js: onmessage = (e) => postMessage({ id: e.data.id, result: heavy(e.data.input) });
const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
let seq = 0; const pending = new Map();
worker.onmessage = (e) => { pending.get(e.data.id)(e.data.result); pending.delete(e.data.id); };
const run = (input) => new Promise((r) => { const id = ++seq; pending.set(id, r); worker.postMessage({ id, input }); });`,
          },
          {
            task: 'Implement a cache-first Service Worker fetch handler for static assets.',
            description: 'Checks service worker caching strategies. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            answer: 'Answer from the cache when possible, otherwise go to the network and store a copy. Version the cache names so updates take effect. Caching HTML cache-first is dangerous because users get stuck on old versions. A strong answer covers versioning and cleanup in activate.',
            solution: `self.addEventListener('fetch', (event) => {
  if (event.request.destination !== 'script' && event.request.destination !== 'style') return;
  event.respondWith(caches.open('static-v1').then(async (cache) => {
    const hit = await cache.match(event.request);
    if (hit) return hit;
    const res = await fetch(event.request);
    cache.put(event.request, res.clone());
    return res;
  }));
});`,
          },
        ],
      },
      {
        q: 'Find and fix the bug: the Web Worker version is slower than the main-thread version.',
        code: `const worker = new Worker('worker.js');
for (const row of rows) worker.postMessage(row); // 100k small messages
worker.onmessage = (e) => results.push(e.data);`,
        short: 'Sending 100k individual messages pays structured-clone and messaging overhead each time, which outweighs the computation. Batch the data into one message and use transferable ArrayBuffers for zero-copy handoff.',
        fix: `const worker = new Worker('worker.js');
const buffer = new Float64Array(rows.map((r) => r.value)).buffer;
worker.postMessage({ buffer }, [buffer]); // one message, zero-copy transfer
worker.onmessage = (e) => { results = new Float64Array(e.data.buffer); };`,
        long: `Every postMessage serializes (structured clone) and queues a task on both sides.
Batch into chunks; for numeric data, use typed arrays and transfer their buffers (ownership moves, no copy).
SharedArrayBuffer allows true sharing but requires cross-origin isolation and Atomics for synchronization.
Measure: worker startup cost, serialization time, and whether the task is actually CPU-bound.
Strong candidate talks about cloning cost and transferables; weak candidate concludes "workers are slow".`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks transferable semantics. Ask before running (browser).',
            code: `const buf = new ArrayBuffer(8);
const w = new Worker(URL.createObjectURL(new Blob(['onmessage=()=>{}'])));
w.postMessage(buf, [buf]);
console.log(buf.byteLength);`,
            answer: '0. Transferring moves ownership to the worker, so the sender\'s buffer becomes detached (length 0).',
          },
          {
            task: 'Fix the worker so errors are not silently lost.',
            description: 'Checks error handling in worker RPC. Ask how the caller learns about failures.',
            code: `// worker.js
onmessage = (e) => postMessage(heavy(e.data)); // heavy may throw`,
            answer: 'An exception in the worker only fires an error event; the caller\'s promise would hang. Catch errors and reply with an error object, so the main thread can reject.',
            solution: `// worker.js
onmessage = (e) => {
  try { postMessage({ ok: true, result: heavy(e.data) }); }
  catch (err) { postMessage({ ok: false, error: String(err) }); }
};`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'When are micro-frontends worth it, and when are they a mistake? How would you connect them: Module Federation, iframes, or web components?',
        ai: true,
        short: 'Worth it when many independent teams need autonomous deploys on a large product; a mistake for small teams because of complexity, duplicated dependencies and inconsistent UX. The integration choice trades isolation (iframes) against depth of integration (Module Federation, web components).',
        long: `The primary driver is organizational — team autonomy and independent release cadence — not technology.
Costs: runtime integration complexity, duplicated frameworks (bundle size), version skew, shared state/routing problems, inconsistent design, harder E2E testing and debugging.
Options: Module Federation (shares deps at runtime, couples to bundler and versions), web components (framework-agnostic boundary, SSR/styling challenges), iframes (strong isolation and security, poor UX integration, a11y and performance cost), build-time packages (simplest, but no independent deploys).
Must-haves: a shared design system, contracts for routing/events/auth, a version policy for shared deps, performance budgets, clear ownership.
Alternative to try first: a well-modularized monorepo with enforced boundaries.
Strong candidate starts from organizational needs and acknowledges costs; weak candidate recommends micro-frontends for any growing app.`,
        exercises: [
          {
            task: 'Implement a loader in the host page. It mounts a remote micro-frontend and keeps its failures contained.',
            description: 'Checks resilient micro-frontend mounting. Live-code it; let the candidate write it first, then compare with the solution and discuss edge cases.',
            answer: 'Load the remote dynamically, enforce a mount/unmount contract and fall back gracefully, so one team cannot take down the shell. Without isolation, one remote failure crashes the shell. A strong answer adds timeouts, error boundaries, and monitoring.',
            solution: `async function mountRemote(url, el) {
  try {
    const remote = await import(/* @vite-ignore */ url);
    if (typeof remote.mount !== 'function') throw new Error('Contract violation');
    return remote.mount(el);
  } catch (e) {
    el.textContent = 'This section is temporarily unavailable.';
    reportError(e);
    return () => {};
  }
}`,
          },
          {
            task: 'Fix this shared dependency setup. Right now it ships two copies of React.',
            description: 'Checks shared dependency governance. Show the snippet, ask the candidate to explain the bug first, then write the fix.',
            code: `// host: react@18.2, remote: react@18.3, both bundle their own copy
// symptom: 'Invalid hook call' and +130KB`,
            answer: 'Declare React as a shared singleton with one agreed version range in Module Federation, and enforce it with a version policy in CI. Pinning the versions manually in each repo drifts quickly. A strong answer enforces the policy centrally, in CI.',
            solution: `// module federation config (host and remote)
shared: {
  react: { singleton: true, requiredVersion: '^18.2.0' },
  'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
}`,
          },
        ],
      },
      {
        q: 'Code review: a team adds a third-party widget. They inject its script with full access to the page. What risks do you see? How would you add the widget instead?',
        code: `const s = document.createElement('script');
s.src = 'https://cdn.vendor.example/widget.js';
document.body.append(s);
// widget reads window.APP_STATE, including the user token`,
        short: 'An injected script runs with full page privileges, so it can read tokens and the DOM and break the app; a compromised CDN becomes a supply-chain attack. Prefer a sandboxed iframe with a postMessage contract (validating origins), or at least SRI, a CSP, and never exposing secrets on window.',
        fix: `<!-- isolate the widget and pass only what it needs -->
<iframe src="https://widget.vendor.example/embed" sandbox="allow-scripts allow-same-origin" title="Support chat"></iframe>
<script>
  const frame = document.querySelector('iframe');
  frame.addEventListener('load', () => frame.contentWindow.postMessage({ type: 'init', locale: 'en' }, 'https://widget.vendor.example'));
</script>`,
        long: `Risks: data exfiltration (tokens, PII), DOM tampering, performance hits, global namespace conflicts, CDN compromise.
Mitigations: sandboxed cross-origin iframe with an explicit postMessage API, origin checks on both sides; Subresource Integrity (integrity attribute) for pinned versions; a strict CSP; HttpOnly cookies instead of tokens in JS.
Process: vendor security review, data processing agreements, performance budgets, a kill switch.
Strong candidate weighs isolation vs UX integration and mentions SRI/CSP; weak candidate only loads it async.`,
        exercises: [
          {
            task: 'Fix the message handler so it only trusts the vendor origin.',
            description: 'Checks postMessage security. Ask what an attacker could send.',
            code: `window.addEventListener('message', (e) => {
  if (e.data.type === 'resize') frame.style.height = e.data.h + 'px';
});`,
            answer: 'Without an origin check any window can send messages. Verify e.origin (and e.source) and validate the payload shape.',
            solution: `window.addEventListener('message', (e) => {
  if (e.origin !== 'https://widget.vendor.example' || e.source !== frame.contentWindow) return;
  if (e.data?.type === 'resize' && Number.isFinite(e.data.h)) frame.style.height = Math.min(e.data.h, 2000) + 'px';
});`,
          },
          {
            task: 'Implement loading a pinned vendor script with Subresource Integrity.',
            description: 'Checks supply-chain protection. Discuss how hashes are updated.',
            answer: 'The integrity attribute makes the browser refuse the script if its content does not match the hash; crossorigin is required for CORS-checked fetches.',
            solution: `const s = document.createElement('script');
s.src = 'https://cdn.vendor.example/widget@2.3.1.js';
s.integrity = 'sha384-<hash from the vendor release>';
s.crossOrigin = 'anonymous';
s.async = true;
document.head.append(s);`,
          },
        ],
      },
    ],
  },
};
