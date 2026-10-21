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
            task: 'Predict the output.',
            description: 'Checks typeof quirks.',
            code: 'console.log(typeof null, typeof NaN, typeof []);',
            answer: 'object number object. typeof null is a legacy bug; arrays are objects, use Array.isArray.',
          },
          {
            task: 'Predict each comparison.',
            description: 'Checks == vs === with null.',
            code: `null == undefined;
null === undefined;
null == 0;`,
            answer: 'true, false, false. null loosely equals only undefined; === also compares types.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks typeof of a string.',
            code: 'console.log(typeof \'hi\');',
            answer: '"string", because text values are string primitives.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks strict equality types.',
            code: 'console.log(1 === \'1\');',
            answer: 'false, because === does not convert types.',
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
            task: 'Fix the bug.',
            description: 'Checks string concatenation from inputs.',
            code: `const a = input1.value; // '2'
const b = input2.value; // '3'
console.log(a + b);`,
            answer: `Prints '23' because input values are strings. Convert with Number() first.`,
            solution: 'console.log(Number(a) + Number(b));',
          },
          {
            task: 'Predict the output.',
            description: 'Checks += with mixed types.',
            code: `let t = 0;
['1', 2, 3].forEach(x => t += x);
console.log(t);`,
            answer: `'0123'. Once t becomes a string, + concatenates. Common mistake: expecting 6.`,
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks Number() conversion.',
            code: 'console.log(Number(\'5\') + 1);',
            answer: '6, because Number turns the string into a number first.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks string plus number.',
            code: 'console.log(\'2\' + 2);',
            answer: '"22", because + with a string concatenates.',
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
            task: 'Predict each result.',
            description: 'Checks + and - coercion.',
            code: `console.log('5' - 2, '5' + 2, +'');`,
            answer: `3 '52' 0. Minus forces numbers, plus with a string concatenates, empty string becomes 0.`,
          },
          {
            task: 'Predict each result.',
            description: 'Checks object to primitive coercion.',
            code: 'console.log([] + [], [] + {}, [1] == 1);',
            answer: `'' '[object Object]' true. Objects convert via toString; [1] becomes '1' then 1.`,
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks string minus number.',
            code: 'console.log(\'5\' - 2);',
            answer: '3, because - always converts operands to numbers.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks true as a number.',
            code: 'console.log(true + 1);',
            answer: '2, because true converts to 1.',
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
            task: 'Spot the problem.',
            description: 'Checks falsy zero bug.',
            code: `function show(count) {
  return count || 'N/A';
}
show(0);`,
            answer: `Returns 'N/A' because 0 is falsy. Use ?? to only fall back on null or undefined.`,
            solution: `return count ?? 'N/A';`,
          },
          {
            task: 'Name all falsy values.',
            description: 'Checks falsy value list.',
            answer: `false, 0, -0, 0n, '', null, undefined, NaN (plus document.all). Everything else, including [] and {}, is truthy.`,
          },
          {
            easy: true,
            task: 'True or false: an empty array is falsy.',
            description: 'Checks empty array truthiness.',
            code: 'console.log(Boolean([]));',
            answer: 'false statement; Boolean([]) is true since all objects are truthy.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks empty string falsiness.',
            code: 'console.log(!!\'\');',
            answer: 'false, because the empty string is falsy.',
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
            task: 'Fix the comparison.',
            description: 'Checks float comparison with epsilon.',
            code: 'console.log(0.1 + 0.2 === 0.3);',
            answer: 'Floats are binary approximations. Compare with a tolerance.',
            solution: 'Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON',
          },
          {
            task: 'Format cents as dollars safely.',
            description: 'Checks integer money handling.',
            code: `const cents = 1999;
// show "$19.99"`,
            answer: 'Keep money as integer cents and format with Intl.NumberFormat.',
            solution: `new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'})
  .format(cents / 100);`,
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks float addition result.',
            code: 'console.log(0.1 + 0.2 === 0.3);',
            answer: 'false, because binary floats cannot represent 0.1 exactly.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks integer cents math.',
            code: 'console.log(10 + 20 === 30);',
            answer: 'true, because small integers are exact in floats.',
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
            task: 'Spot the problem.',
            description: 'Checks NaN in equality.',
            code: `const eq = (a, b) => a === b;
eq(NaN, NaN);`,
            answer: 'Returns false because NaN !== NaN. Use Object.is(a, b) for primitives.',
          },
          {
            task: 'Find the bug.',
            description: 'Checks key count in deep equal.',
            code: `function eq(a, b) {
  return Object.keys(a).every(k => eq(a[k], b[k]));
}`,
            answer: 'It ignores extra keys in b and lacks a primitive base case. Compare key counts and use Object.is for non-objects.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks object identity.',
            code: 'console.log({} === {});',
            answer: 'false, because two objects are different references.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks NaN self-comparison.',
            code: 'console.log(NaN === NaN);',
            answer: 'false, because NaN never equals anything, even itself.',
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
            task: 'Name two lint rules against coercion bugs.',
            description: 'Checks tooling for type safety.',
            answer: 'ESLint eqeqeq and @typescript-eslint/strict-boolean-expressions; also enable TS strictNullChecks.',
          },
          {
            task: 'Fix it with TypeScript.',
            description: 'Checks strict null checks.',
            code: `function len(s: string | null) {
  return s.length;
}`,
            answer: 'With strict on, TS errors on s.length. Handle null explicitly.',
            solution: 'return s?.length ?? 0;',
          },
          {
            easy: true,
            task: 'Name the operator that avoids coercion.',
            description: 'Checks strict equality choice.',
            code: 'a == b // replace with?',
            answer: 'Use ===, because it compares without type conversion.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks nullish coalescing.',
            code: 'console.log(0 ?? 5);',
            answer: '0, because ?? only falls back on null or undefined.',
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
            task: 'Spot the problem.',
            description: 'Checks silent API type change.',
            code: `// v1: { id: 42 }   v2: { id: '42' }
if (user.id === selectedId) select();`,
            answer: 'The comparison silently fails after id became a string. Validate responses at the boundary, e.g. with zod.',
          },
          {
            task: 'Write a runtime check for the response.',
            description: 'Checks boundary validation.',
            code: 'const data = await res.json();',
            answer: 'Parse at the boundary and fail loudly on unexpected shapes.',
            solution: `const User = z.object({ id: z.number() });
const user = User.parse(data);`,
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks a string id comparison.',
            code: 'console.log(42 === \'42\');',
            answer: 'false, so an API switching id to string breaks checks.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks typeof on API number.',
            code: 'console.log(typeof JSON.parse(\'{"n":"7"}\').n);',
            answer: '"string", because the JSON value was quoted.',
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
            description: 'Checks this in arrow method.',
            code: `const o = { n: 1, f: () => this?.n };
console.log(o.f());`,
            answer: 'undefined. Arrow functions take this from the outer scope, not from the object.',
          },
          {
            task: 'Predict the output in strict mode.',
            description: 'Checks this in plain call.',
            code: `'use strict';
function f() { return this; }
console.log(f());`,
            answer: 'undefined. A plain call gives undefined in strict mode, globalThis in sloppy mode.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks this in a method.',
            code: `const o = { n: 1, f() { return this.n; } };
console.log(o.f());`,
            answer: '1, because this is the object before the dot.',
          },
          {
            easy: true,
            task: 'True or false: arrows get their own this.',
            description: 'Checks arrow this rule.',
            code: 'const f = () => this;',
            answer: 'False; arrow functions take this from the surrounding scope.',
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
            task: 'Fix the bug.',
            description: 'Checks lost this in setTimeout.',
            code: `const u = { name: 'Ann', hi() {
  setTimeout(function () { console.log(this.name); });
}};`,
            answer: 'The regular callback has its own this. Use an arrow function.',
            solution: 'setTimeout(() => console.log(this.name));',
          },
          {
            task: 'Predict the output.',
            description: 'Checks extracted method call.',
            code: `const u = { name: 'Ann', hi() { return this?.name; } };
const hi = u.hi;
console.log(hi());`,
            answer: 'undefined. The method is called without a receiver, so this is undefined in modules.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks a detached method.',
            code: `const o = { n: 'Ann', f() { return this?.n; } };
const g = o.f;
console.log(g());`,
            answer: 'undefined, because g is called without an object.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks bind fixing this.',
            code: `const o = { n: 'Ann', f() { return this.n; } };
console.log(o.f.bind(o)());`,
            answer: '"Ann", because bind locks this to o.',
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
            description: 'Checks this in nested function.',
            code: `const o = { v: 1, f() {
  return [1].map(function () { return this?.v; });
}};
console.log(o.f());`,
            answer: `[undefined]. The inner function has its own this. Use an arrow or map's thisArg.`,
            solution: 'return [1].map(() => this.v);',
          },
          {
            task: 'Fix the class handler.',
            description: 'Checks this in class callbacks.',
            code: `class C { n = 1;
  log() { console.log(this.n); } }
btn.addEventListener('click', new C().log);`,
            answer: 'this becomes the button. Use an arrow class field or bind.',
            solution: 'log = () => console.log(this.n);',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks arrow inside a method.',
            code: `const o = { n: 2, f() { return (() => this.n)(); } };
console.log(o.f());`,
            answer: '2, because the arrow uses this from f.',
          },
          {
            easy: true,
            task: 'True or false: callbacks keep the method\'s this.',
            description: 'Checks callback this loss.',
            code: '[1].forEach(function () { console.log(this); });',
            answer: 'False; a regular callback gets its own this when called.',
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
            task: 'Rewrite using apply.',
            description: 'Checks call vs apply.',
            code: 'Math.max.call(null, 1, 5, 3);',
            answer: 'apply takes arguments as an array.',
            solution: 'Math.max.apply(null, [1, 5, 3]);',
          },
          {
            task: 'Predict the output.',
            description: 'Checks bind is permanent.',
            code: `function f() { return this.x; }
const g = f.bind({ x: 1 });
console.log(g.call({ x: 2 }));`,
            answer: '1. A bound function ignores later call or apply this values.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks call with an argument.',
            code: `function f(x) { return this.a + x; }
console.log(f.call({ a: 1 }, 2));`,
            answer: '3, because call sets this and passes args one by one.',
          },
          {
            easy: true,
            task: 'Name the method returning a new function.',
            description: 'Checks bind returns function.',
            code: 'const g = f.???(obj);',
            answer: 'bind, because it returns a new function instead of calling.',
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
            task: 'Predict the output.',
            description: 'Checks partial application with bind.',
            code: `const add = (a, b, c) => a + b + c;
const add5 = add.bind(null, 2, 3);
console.log(add5(10));`,
            answer: '15. bind pre-fills arguments 2 and 3, so c is 10.',
          },
          {
            task: 'Predict the output.',
            description: 'Checks new on bound function.',
            code: `function P(n) { this.n = n; }
const B = P.bind({ n: 0 }, 7);
console.log(new B().n);`,
            answer: '7. new ignores the bound this but keeps bound arguments.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks bind preset argument.',
            code: `const add = (a, b) => a + b;
console.log(add.bind(null, 1)(2));`,
            answer: '3, because bind preset a to 1.',
          },
          {
            easy: true,
            task: 'True or false: bind calls the function immediately.',
            description: 'Checks bind is lazy.',
            code: 'const g = f.bind(obj);',
            answer: 'False; bind returns a new function to call later.',
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
            description: 'Checks bind vs implicit binding.',
            code: `function f() { return this.id; }
const o = { id: 1, f: f.bind({ id: 2 }) };
console.log(o.f());`,
            answer: '2. Explicit bind beats implicit method-call binding.',
          },
          {
            task: 'Predict the output.',
            description: 'Checks arrow ignores call.',
            code: `const f = () => this;
console.log(f.call({ a: 1 }) === globalThis);`,
            answer: 'In a classic script, true: arrows ignore call. In an ES module top-level this is undefined, so false.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks explicit binding wins.',
            code: `function f() { return this.x; }
console.log(f.call({ x: 5 }));`,
            answer: '5, because call sets this explicitly.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks new creates this.',
            code: `function P() { this.v = 1; }
console.log(new P().v);`,
            answer: '1, because new binds this to a fresh object.',
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
            task: 'Name one rule for new components.',
            description: 'Checks style decisions in legacy code.',
            code: '// mix of class components, hooks, utils',
            answer: 'New code uses function components and hooks; touch class code only via refactor tickets, enforced by lint.',
          },
          {
            task: 'Convert to a function component.',
            description: 'Checks removing this from components.',
            code: `class C extends React.Component {
  state = { n: 0 };
  inc = () => this.setState({ n: this.state.n + 1 });
}`,
            answer: 'Hooks remove this entirely.',
            solution: `function C() {
  const [n, setN] = useState(0);
  const inc = () => setN(v => v + 1);
}`,
          },
          {
            easy: true,
            task: 'Name the hook replacing this.state.',
            description: 'Checks hooks basics.',
            code: 'const [count, setCount] = ???(0);',
            answer: 'useState, because function components keep state with hooks.',
          },
          {
            easy: true,
            task: 'True or false: function components use this.',
            description: 'Checks function components lack this.',
            answer: 'False; function components read props and hooks, not this.',
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
            task: 'Fix the crash.',
            description: 'Checks passing methods as callbacks.',
            code: `const store = { items: [], add(x) { this.items.push(x); } };
[1, 2].forEach(store.add);`,
            answer: 'this is lost. Wrap in an arrow or pass thisArg.',
            solution: '[1, 2].forEach(x => store.add(x));',
          },
          {
            task: 'Name a lint rule that catches this.',
            description: 'Checks tooling for unbound methods.',
            code: 'promise.then(service.handle);',
            answer: '@typescript-eslint/unbound-method flags passing methods without binding.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks a passed method callback.',
            code: `const o = { n: 1, f() { return this?.n; } };
console.log([0].map(o.f)[0]);`,
            answer: 'undefined, because map calls f without o as this.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks arrow wrapper fix.',
            code: `const o = { n: 1, f() { return this.n; } };
console.log([0].map(() => o.f())[0]);`,
            answer: '1, because the arrow calls f on o.',
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
            description: 'Checks var in setTimeout loop.',
            code: `for (var i = 0; i < 3; i++)
  setTimeout(() => console.log(i));`,
            answer: '3 3 3. var is function-scoped, so all callbacks share one i. Use let.',
            solution: 'for (let i = 0; i < 3; i++)',
          },
          {
            task: 'Predict the output.',
            description: 'Checks closure array of functions.',
            code: `const fs = [];
for (let i = 0; i < 2; i++) fs.push(() => i);
console.log(fs[0](), fs[1]());`,
            answer: '0 1. let creates a fresh binding per iteration.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks let in a loop.',
            code: 'for (let i = 0; i < 2; i++) setTimeout(() => console.log(i));',
            answer: '0 then 1, because let creates a new i per iteration.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks var after the loop.',
            code: `for (var i = 0; i < 3; i++) {}
console.log(i);`,
            answer: '3, because var is function-scoped and survives the loop.',
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
            task: 'Write a counter with private state.',
            description: 'Checks basic closure.',
            answer: 'The inner function keeps count alive.',
            solution: `function counter() {
  let n = 0;
  return () => ++n;
}`,
          },
          {
            task: 'Predict the output.',
            description: 'Checks separate closures.',
            code: `const mk = () => { let n = 0; return () => ++n; };
const a = mk(), b = mk();
a(); console.log(a(), b());`,
            answer: '2 1. Each call to mk creates its own n.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks closure remembers a variable.',
            code: `function make() { const x = 7; return () => x; }
console.log(make()());`,
            answer: '7, because the inner function closes over x.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks closure sees updates.',
            code: `let n = 1; const f = () => n;
n = 2;
console.log(f());`,
            answer: '2, because closures capture the variable, not the value.',
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
            task: 'Write once(fn).',
            description: 'Checks closure flag.',
            answer: 'Run fn on first call, cache the result.',
            solution: `const once = fn => { let done, r;
  return (...a) => done ? r : (done = true, r = fn(...a));
};`,
          },
          {
            task: 'Spot the memory risk.',
            description: 'Checks unbounded memo cache.',
            code: `const cache = new Map();
const memo = x => cache.get(x) ?? (cache.set(x, f(x)), cache.get(x));`,
            answer: 'The Map grows forever. Use an LRU limit or WeakMap for object keys.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks a cache hit.',
            code: `const cache = {}; cache[2] = 4;
console.log(2 in cache);`,
            answer: 'true, because memoize stores results by key.',
          },
          {
            easy: true,
            task: 'True or false: memoize cache entries are freed automatically.',
            description: 'Checks memoize memory growth.',
            code: 'const cache = new Map(); // never cleared',
            answer: 'False; a plain cache grows forever unless you limit it.',
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
            task: 'Fix the bug.',
            description: 'Checks debounce created per render.',
            code: `function Search() {
  const run = debounce(search, 300);
  return <input onChange={e => run(e.target.value)} />;
}`,
            answer: 'A new debounce is made each render. Keep one instance.',
            solution: 'const run = useMemo(() => debounce(search, 300), []);',
          },
          {
            task: 'Find the bug in debounce.',
            description: 'Checks timer clearing.',
            code: `function debounce(fn, ms) {
  let t;
  return (...a) => { t = setTimeout(() => fn(...a), ms); };
}`,
            answer: 'It never clears the old timer. Call clearTimeout(t) before setting.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks clearTimeout cancels.',
            code: `const t = setTimeout(() => console.log('run'), 10);
clearTimeout(t);`,
            answer: 'Nothing, because clearTimeout cancels the timer before it runs.',
          },
          {
            easy: true,
            task: 'True or false: debounce delays the call.',
            description: 'Checks debounce idea.',
            code: 'input.oninput = debounce(search, 300);',
            answer: 'True; it runs only after calls stop for the wait time.',
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
            description: 'Checks TDZ with let.',
            code: `console.log(x);
let x = 1;`,
            answer: 'ReferenceError. let is hoisted but uninitialized until its line runs.',
          },
          {
            task: 'Predict the output.',
            description: 'Checks TDZ shadowing.',
            code: `let a = 1;
{ console.log(a); let a = 2; }`,
            answer: 'ReferenceError. The inner a shadows the outer one and is in its TDZ.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks var hoisting.',
            code: `console.log(a);
var a = 1;`,
            answer: 'undefined, because var is hoisted and set to undefined.',
          },
          {
            easy: true,
            task: 'True or false: const can be read before declaration.',
            description: 'Checks TDZ for const.',
            code: `console.log(c);
const c = 1;`,
            answer: 'False; reading it in the TDZ throws a ReferenceError.',
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
            description: 'Checks lexical scope.',
            code: `const x = 'global';
function f() { return x; }
function g() { const x = 'local'; return f(); }
console.log(g());`,
            answer: `'global'. Scope is decided where f is defined, not where it is called.`,
          },
          {
            task: 'Predict the output.',
            description: 'Checks function vs var hoisting.',
            code: `console.log(typeof a, typeof b);
function a() {}
var b = () => {};`,
            answer: 'function undefined. Function declarations hoist fully; var hoists only the name.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks function declaration hoisting.',
            code: `console.log(f());
function f() { return 1; }`,
            answer: '1, because function declarations are hoisted whole.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks inner shadowing.',
            code: `const x = 1;
{ const x = 2; }
console.log(x);`,
            answer: '1, because the inner x lives only in its block.',
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
            task: 'Spot the leak.',
            description: 'Checks listener closure leak.',
            code: `useEffect(() => {
  window.addEventListener('resize', () => setW(innerWidth));
}, []);`,
            answer: 'The listener is never removed. Return a cleanup with a named handler.',
            solution: `const h = () => setW(innerWidth);
window.addEventListener('resize', h);
return () => window.removeEventListener('resize', h);`,
          },
          {
            task: 'Name a way to detect closure leaks.',
            description: 'Checks memory debugging tools.',
            answer: 'Take DevTools heap snapshots before and after repeated navigation and compare retained objects; or run memlab in CI.',
          },
          {
            easy: true,
            task: 'Name the DevTools tool for leaks.',
            description: 'Checks heap snapshot tool.',
            code: '// leak suspected after navigating',
            answer: 'Memory panel heap snapshots show objects still kept in memory.',
          },
          {
            easy: true,
            task: 'Name the method that removes a listener.',
            description: 'Checks listener cleanup.',
            code: 'window.addEventListener(\'resize\', onResize);',
            answer: 'removeEventListener, so the closure can be garbage collected.',
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
            task: 'Fix the stale closure.',
            description: 'Checks stale state in interval.',
            code: `useEffect(() => {
  const id = setInterval(() => setN(n + 1), 1000);
  return () => clearInterval(id);
}, []);`,
            answer: 'n is frozen at 0. Use a functional update.',
            solution: 'setInterval(() => setN(v => v + 1), 1000);',
          },
          {
            task: 'Name the lint rule that catches it.',
            description: 'Checks hooks dependency linting.',
            code: 'useEffect(() => { log(count); }, []);',
            answer: 'react-hooks/exhaustive-deps warns that count is missing from dependencies.',
          },
          {
            easy: true,
            task: 'True or false: closures capture state at creation.',
            description: 'Checks stale closure idea.',
            code: 'const f = () => count; // count later changes',
            answer: 'True for const state; an old closure sees the old value.',
          },
          {
            easy: true,
            task: 'Name the setState form avoiding stale state.',
            description: 'Checks functional update.',
            code: 'setCount(count + 1);',
            answer: 'Use setCount(c => c + 1), which always gets the latest value.',
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
            task: 'Predict the output order.',
            description: 'Checks async callback order.',
            code: `console.log(1);
setTimeout(() => console.log(2));
console.log(3);`,
            answer: '1 3 2. setTimeout queues the callback after the current code finishes.',
          },
          {
            task: 'Name a browser API that is async.',
            description: 'Checks async APIs knowledge.',
            answer: 'fetch, setTimeout, addEventListener callbacks, requestAnimationFrame. They do not block the main thread.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks setTimeout runs later.',
            code: `setTimeout(() => console.log('B'));
console.log('A');`,
            answer: 'A then B, because the timer callback runs after sync code.',
          },
          {
            easy: true,
            task: 'True or false: JS runs two lines simultaneously.',
            description: 'Checks single thread.',
            code: 'console.log(1); console.log(2);',
            answer: 'False; the main thread runs one thing at a time.',
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
            task: 'Fix the bug.',
            description: 'Checks missing await.',
            code: `async function load() {
  const res = fetch('/api');
  console.log(res.json());
}`,
            answer: 'fetch returns a promise. Await both fetch and json().',
            solution: `const res = await fetch('/api');
console.log(await res.json());`,
          },
          {
            task: 'Fix the bug.',
            description: 'Checks return from callback.',
            code: `function get() {
  fetch('/a').then(r => r.json()).then(d => { return d; });
}
console.log(get());`,
            answer: 'get returns nothing. Return the promise and await it.',
            solution: `return fetch('/a').then(r => r.json());`,
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks logging a promise.',
            code: `const p = Promise.resolve(1);
console.log(p instanceof Promise);`,
            answer: 'true, because without await you hold the promise, not data.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks await unwraps.',
            code: '(async () => console.log(await Promise.resolve(3)))();',
            answer: '3, because await gives the resolved value.',
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
            task: 'Make it parallel.',
            description: 'Checks sequential awaits.',
            code: `const a = await getA();
const b = await getB();`,
            answer: 'Independent requests run one after another. Start both together.',
            solution: 'const [a, b] = await Promise.all([getA(), getB()]);',
          },
          {
            task: 'Spot the problem.',
            description: 'Checks await in loop.',
            code: `for (const id of ids) {
  out.push(await fetchUser(id));
}`,
            answer: 'Requests run serially. Use Promise.all(ids.map(fetchUser)) if order and limits allow.',
          },
          {
            easy: true,
            task: 'True or false: Promise.all runs requests in parallel.',
            description: 'Checks parallel awaiting.',
            code: 'await Promise.all([getA(), getB()]);',
            answer: 'True; all requests start before awaiting any of them.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks Promise.all result.',
            code: 'Promise.all([1, 2]).then(console.log);',
            answer: '[1, 2], because results keep input order.',
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
            task: 'Pick the right combinator.',
            description: 'Checks Promise.any use case.',
            code: `// first mirror that succeeds wins
const res = await Promise.???([m1(), m2()]);`,
            answer: 'Promise.any: resolves on first success, ignores failures until all fail.',
          },
          {
            task: 'Predict the result.',
            description: 'Checks Promise.race with rejection.',
            code: `Promise.race([
  new Promise((_, r) => setTimeout(r, 10, 'err')),
  new Promise(r => setTimeout(r, 20, 'ok')),
]).catch(console.log);`,
            answer: `Logs 'err'. race settles with the first settled promise, even a rejection.`,
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks Promise.race winner.',
            code: 'Promise.race([Promise.resolve(\'a\'), new Promise(() => {})]).then(console.log);',
            answer: '"a", because race settles with the first settled promise.',
          },
          {
            easy: true,
            task: 'Name the combinator that never rejects early.',
            description: 'Checks allSettled.',
            code: 'Promise.???([fetchA(), fetchB()]);',
            answer: 'Promise.allSettled, which waits for all and reports each status.',
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
            task: 'Spot the problem.',
            description: 'Checks unbounded concurrency.',
            code: 'await Promise.all(urls.map(u => fetch(u)));',
            answer: 'With 1000 urls all start at once. Limit concurrency with a pool or p-limit.',
          },
          {
            task: 'Predict the result order.',
            description: 'Checks Promise.all keeps order.',
            code: `const d = ms => new Promise(r => setTimeout(r, ms, ms));
console.log(await Promise.all([d(30), d(10)]));`,
            answer: '[30, 10]. Promise.all keeps input order, not completion order.',
          },
          {
            easy: true,
            task: 'True or false: map with async starts all at once.',
            description: 'Checks unbounded start.',
            code: 'urls.map(u => fetch(u));',
            answer: 'True; every fetch starts immediately, with no limit.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks Promise.all ordering.',
            code: `const d = (v, ms) => new Promise(r => setTimeout(() => r(v), ms));
Promise.all([d('a', 20), d('b', 5)]).then(console.log);`,
            answer: '[\'a\', \'b\'], because results follow input order, not finish order.',
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
            task: 'Name a way to handle backpressure.',
            description: 'Checks stream backpressure.',
            code: 'const reader = stream.getReader();',
            answer: 'Pull with await reader.read() only when ready; Streams use highWaterMark and pull-based reads.',
          },
          {
            task: 'Spot the problem.',
            description: 'Checks unbounded queue growth.',
            code: `socket.onmessage = e => queue.push(e.data);
setInterval(() => process(queue.shift()), 100);`,
            answer: 'The queue grows without limit if messages arrive faster. Batch, drop, or throttle the producer.',
          },
          {
            easy: true,
            task: 'True or false: unbounded buffers can exhaust memory.',
            description: 'Checks backpressure risk.',
            code: 'queue.push(item); // never drained',
            answer: 'True; a fast producer fills the buffer faster than it drains.',
          },
          {
            easy: true,
            task: 'Name the stream method returning false when full.',
            description: 'Checks write return value.',
            code: 'const ok = stream.write(chunk);',
            answer: 'write() returns false; wait for \'drain\' before writing more.',
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
            task: 'Fix the race.',
            description: 'Checks stale responses with AbortController.',
            code: `useEffect(() => {
  fetch(\`/q?s=\${s}\`).then(r => r.json()).then(setData);
}, [s]);`,
            answer: 'Old responses can land last. Abort on cleanup.',
            solution: `const c = new AbortController();
fetch(url, { signal: c.signal }).then(r => r.json()).then(setData);
return () => c.abort();`,
          },
          {
            task: 'Name a shared tool for this.',
            description: 'Checks standard data-fetching libraries.',
            answer: 'TanStack Query: keyed caching, dedupe, and cancellation give every team the same async pattern.',
          },
          {
            easy: true,
            task: 'Name the API that cancels fetch.',
            description: 'Checks AbortController.',
            code: 'fetch(url, { signal });',
            answer: 'AbortController, whose signal cancels an in-flight fetch.',
          },
          {
            easy: true,
            task: 'True or false: responses arrive in request order.',
            description: 'Checks race basics.',
            answer: 'False; a later request can finish first.',
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
            task: 'Spot the problem.',
            description: 'Checks N+1 requests.',
            code: 'items.forEach(i => fetch(`/api/item/${i.id}`));',
            answer: 'One request per item. Add a batch endpoint like /api/items?ids=1,2,3.',
          },
          {
            task: 'Name two client fixes for rate limits.',
            description: 'Checks request reduction techniques.',
            answer: 'Dedupe and cache requests, limit concurrency, and retry 429s with exponential backoff honoring Retry-After.',
          },
          {
            easy: true,
            task: 'Name the HTTP status for rate limiting.',
            description: 'Checks 429 status.',
            code: '// server replies when overloaded',
            answer: '429 Too Many Requests means the client sent too many.',
          },
          {
            easy: true,
            task: 'True or false: batching reduces request count.',
            description: 'Checks batching idea.',
            code: 'ids.forEach(id => fetch(\'/item/\' + id));',
            answer: 'True; one /items?ids= call replaces many single requests.',
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
            description: 'Checks promise states.',
            code: `const p = new Promise(() => {});
setTimeout(() => console.log(p));`,
            answer: 'Promise { <pending> }. It never resolves or rejects.',
          },
          {
            task: 'Rewrite with async/await.',
            description: 'Checks try/catch error handling.',
            code: 'get().then(show).catch(logError);',
            answer: 'Await inside try and catch errors.',
            solution: `try { show(await get()); }
catch (e) { logError(e); }`,
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks catch handling a rejection.',
            code: 'Promise.reject(\'x\').catch(e => console.log(\'got\', e));',
            answer: 'got x, because catch handles the rejection.',
          },
          {
            easy: true,
            task: 'Name the state of a new pending promise.',
            description: 'Checks pending state.',
            code: 'new Promise(() => {});',
            answer: 'pending, because resolve or reject is never called.',
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
            task: 'Find the bug.',
            description: 'Checks BOM or wrong response type.',
            code: `const r = await fetch('/data.json');
JSON.parse(r);`,
            answer: 'r is a Response, not text. Use await r.json() or await r.text().',
            solution: 'const data = await r.json();',
          },
          {
            task: 'Make it safe.',
            description: 'Checks try/catch around JSON.parse.',
            code: `const cfg = JSON.parse(localStorage.getItem('cfg'));`,
            answer: 'Wrap in try/catch and default; null parses to null, bad text throws.',
            solution: `let cfg;
try { cfg = JSON.parse(localStorage.getItem('cfg')) ?? {}; }
catch { cfg = {}; }`,
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks parsing valid JSON.',
            code: 'console.log(JSON.parse(\'{"a":1}\').a);',
            answer: '1, because the string is valid JSON.',
          },
          {
            easy: true,
            task: 'True or false: JSON allows single quotes.',
            description: 'Checks JSON string quotes.',
            code: 'JSON.parse("{\'a\':1}");',
            answer: 'False; JSON requires double quotes, so this throws.',
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
            description: 'Checks catch return value.',
            code: `Promise.reject(1)
  .catch(e => e + 1)
  .then(v => console.log(v));`,
            answer: '2. catch returns a value, so the chain recovers and continues.',
          },
          {
            task: 'Predict the output.',
            description: 'Checks missing return in then.',
            code: `Promise.resolve(1)
  .then(v => { v * 2; })
  .then(console.log);`,
            answer: 'undefined. The block body has no return.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks then after catch.',
            code: 'Promise.reject(1).catch(() => 2).then(console.log);',
            answer: '2, because catch returns a value and the chain recovers.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks finally runs.',
            code: 'Promise.resolve().finally(() => console.log(\'done\'));',
            answer: 'done, because finally runs on any outcome.',
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
            task: 'Flatten the nesting.',
            description: 'Checks callback hell refactor.',
            code: 'getUser(id, u => getPosts(u, p => render(p)));',
            answer: 'With promisified APIs, await reads top-down.',
            solution: `const u = await getUser(id);
render(await getPosts(u));`,
          },
          {
            task: 'Name a problem async/await still has.',
            description: 'Checks remaining async pitfalls.',
            answer: 'No built-in cancellation, easy accidental serial awaits, and forgotten awaits causing unhandled rejections.',
          },
          {
            easy: true,
            task: 'True or false: await works in regular functions.',
            description: 'Checks await placement.',
            code: 'function f() { await g(); }',
            answer: 'False; await needs an async function or module top level.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks async returns a promise.',
            code: `async function f() { return 1; }
console.log(f() instanceof Promise);`,
            answer: 'true, because async functions always return promises.',
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
            task: 'Promisify readFile.',
            description: 'Checks Node callback conversion.',
            code: 'fs.readFile(path, (err, data) => {});',
            answer: 'Wrap it in a Promise or use util.promisify.',
            solution: `const read = p => new Promise((res, rej) =>
  fs.readFile(p, (e, d) => e ? rej(e) : res(d)));`,
          },
          {
            task: 'Predict the output.',
            description: 'Checks allSettled result shape.',
            code: `const r = await Promise.allSettled([Promise.reject('x')]);
console.log(r);`,
            answer: `[{ status: 'rejected', reason: 'x' }]. allSettled never rejects.`,
          },
          {
            easy: true,
            task: 'Name Node\'s built-in promisify helper.',
            description: 'Checks util.promisify.',
            code: 'const read = ???(fs.readFile);',
            answer: 'util.promisify converts error-first callback functions to promises.',
          },
          {
            easy: true,
            task: 'Name the callback\'s first argument.',
            description: 'Checks error-first callbacks.',
            code: 'fs.readFile(\'a.txt\', (err, data) => {});',
            answer: 'err, because Node callbacks pass the error first.',
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
            description: 'Checks thenable adoption.',
            code: `const t = { then(r) { r(42); } };
console.log(await t);`,
            answer: '42. await adopts any object with a then method.',
          },
          {
            task: 'Predict the output order.',
            description: 'Checks microtask timing.',
            code: `Promise.resolve().then(() => console.log('a'));
console.log('b');`,
            answer: 'b a. then callbacks always run as microtasks after current sync code.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks then is async.',
            code: `Promise.resolve().then(() => console.log('B'));
console.log('A');`,
            answer: 'A then B, because then callbacks run as microtasks.',
          },
          {
            easy: true,
            task: 'True or false: an object with then is thenable.',
            description: 'Checks thenable definition.',
            code: 'const t = { then(r) { r(1); } };',
            answer: 'True; any object with a then method is a thenable.',
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
            task: 'Log unhandled rejections globally.',
            description: 'Checks unhandledrejection event.',
            answer: 'Listen on window and report to monitoring.',
            solution: `window.addEventListener('unhandledrejection', e =>
  report(e.reason));`,
          },
          {
            task: 'Name a lint rule against floating promises.',
            description: 'Checks no-floating-promises rule.',
            code: 'save(); // returns a promise',
            answer: '@typescript-eslint/no-floating-promises forces await, .catch, or explicit void.',
          },
          {
            easy: true,
            task: 'Name the browser unhandled rejection event.',
            description: 'Checks unhandledrejection event.',
            answer: 'unhandledrejection, fired on window when a rejection has no handler.',
          },
          {
            easy: true,
            task: 'True or false: a missing catch crashes silently.',
            description: 'Checks floating promise.',
            code: 'fetchData(); // no await, no catch',
            answer: 'True; the rejection is unhandled and easy to miss.',
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
            task: 'Spot the problem.',
            description: 'Checks double error handling.',
            code: `function load(cb) {
  return fetchData().then(d => cb(null, d)).catch(cb);
}`,
            answer: 'If cb throws, catch calls cb again with that error. Pick one style: return the promise only.',
          },
          {
            task: 'Name a migration step.',
            description: 'Checks gradual API migration.',
            answer: 'Add a promise version, wrap old callback API around it, mark the callback one deprecated, migrate callers, then remove.',
          },
          {
            easy: true,
            task: 'True or false: mixing callbacks and promises is clearer.',
            description: 'Checks single style.',
            answer: 'False; one style avoids handling the same error twice.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks then rejection reaches catch.',
            code: 'Promise.resolve().then(() => { throw \'e\'; }).catch(console.log);',
            answer: 'e, because a throw in then rejects the chain.',
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
            task: 'Is the original mutated?',
            description: 'Checks sort mutation.',
            code: `const a = [3, 1, 2];
const b = a.sort();
console.log(a);`,
            answer: 'Yes: [1, 2, 3]. sort mutates in place; use toSorted() for a copy.',
          },
          {
            task: 'Is the original mutated?',
            description: 'Checks shallow spread nested mutation.',
            code: `const o = { u: { n: 1 } };
const c = { ...o };
c.u.n = 2; console.log(o.u.n);`,
            answer: 'Yes, prints 2. Spread is shallow, so u is shared.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks map returns new array.',
            code: `const a = [1, 2];
a.map(x => x * 2);
console.log(a);`,
            answer: '[1, 2], because map returns a new array.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks push mutates.',
            code: `const a = [1];
a.push(2);
console.log(a);`,
            answer: '[1, 2], because push changes the original array.',
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
            task: 'Name rest or spread in each line.',
            description: 'Checks rest vs spread.',
            code: `const [h, ...t] = arr;
f(...arr);`,
            answer: 'First is rest (collects), second is spread (expands).',
          },
          {
            task: 'Write a sum function using rest.',
            description: 'Checks rest parameters.',
            answer: 'Rest gathers arguments into an array.',
            solution: 'const sum = (...n) => n.reduce((a, b) => a + b, 0);',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks spread into Math.max.',
            code: 'console.log(Math.max(...[1, 5, 3]));',
            answer: '5, because spread passes array items as arguments.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks rest collects args.',
            code: `const f = (...a) => a.length;
console.log(f(1, 2, 3));`,
            answer: '3, because rest gathers all arguments into an array.',
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
            task: 'Predict the values.',
            description: 'Checks default with null.',
            code: `const { a = 1, b = 2 } = { a: null, b: undefined };
console.log(a, b);`,
            answer: 'null 2. Defaults only apply for undefined.',
          },
          {
            task: 'Fix the crash.',
            description: 'Checks destructuring undefined.',
            code: `function f({ x }) { return x; }
f();`,
            answer: 'Destructuring undefined throws. Add a default parameter.',
            solution: 'function f({ x } = {}) { return x; }',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks destructuring default.',
            code: `const { a = 1 } = {};
console.log(a);`,
            answer: '1, because a is missing so the default applies.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks default with null.',
            code: `const { a = 1 } = { a: null };
console.log(a);`,
            answer: 'null, because defaults apply only for undefined.',
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
            description: 'Checks spread overwrite order.',
            code: 'console.log({ a: 1, ...{ a: 2, b: 3 }, b: 4 });',
            answer: '{ a: 2, b: 4 }. Later properties win.',
          },
          {
            task: 'Predict the output.',
            description: 'Checks spread skips prototype.',
            code: `class P { get x() { return 1; } }
console.log({ ...new P() });`,
            answer: '{}. Spread copies only own enumerable props; class getters live on the prototype.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks spread copies properties.',
            code: `const a = { x: 1 };
console.log({ ...a, y: 2 });`,
            answer: '{ x: 1, y: 2 }, because spread copies a\'s properties.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks earlier key wins.',
            code: 'console.log({ x: 9, ...{ x: 1 } }.x);',
            answer: '1, because the later spread overwrites x.',
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
            task: 'Update the nested item immutably.',
            description: 'Checks nested immutable update.',
            code: `const s = { list: [{ id: 1, done: false }] };
// set id 1 done: true`,
            answer: 'Copy each level along the path.',
            solution: `const next = { ...s, list: s.list.map(i =>
  i.id === 1 ? { ...i, done: true } : i) };`,
          },
          {
            task: 'Predict the output.',
            description: 'Checks structuredClone limits.',
            code: 'structuredClone({ f() {} });',
            answer: 'Throws DataCloneError. Functions cannot be cloned.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks spread copy is new.',
            code: `const a = { b: 1 };
const c = { ...a };
console.log(a === c);`,
            answer: 'false, because spread creates a new object.',
          },
          {
            easy: true,
            task: 'True or false: Immer lets you write mutating code.',
            description: 'Checks Immer idea.',
            answer: 'True; Immer turns draft mutations into immutable updates.',
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
            description: 'Checks JSON clone data loss.',
            code: `const c = JSON.parse(JSON.stringify({ d: new Date(0), u: undefined }));
console.log(c);`,
            answer: `{ d: '1970-01-01T00:00:00.000Z' }. Dates become strings, undefined is dropped.`,
          },
          {
            task: 'Is the nested array shared?',
            description: 'Checks Object.assign shallowness.',
            code: `const a = { t: [1] };
const b = Object.assign({}, a);
console.log(a.t === b.t);`,
            answer: 'true. Object.assign is a shallow copy.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks shallow copy sharing.',
            code: `const a = { n: { v: 1 } };
const b = { ...a };
console.log(a.n === b.n);`,
            answer: 'true, because spread copies only the top level.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks structuredClone deep copy.',
            code: `const a = { n: { v: 1 } };
console.log(structuredClone(a).n === a.n);`,
            answer: 'false, because structuredClone copies nested objects too.',
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
            task: 'Spot the performance problem.',
            description: 'Checks spread in hot loop.',
            code: `const out = rows.reduce((acc, r) =>
  ({ ...acc, [r.id]: r }), {});`,
            answer: 'Copies acc each step, O(n^2) allocations. Mutate a local object instead.',
            solution: `const out = {};
for (const r of rows) out[r.id] = r;`,
          },
          {
            task: 'Name a tool to confirm GC pressure.',
            description: 'Checks profiling knowledge.',
            answer: 'Chrome DevTools Performance panel shows GC events; Memory allocation timeline shows hot allocation sites.',
          },
          {
            easy: true,
            task: 'True or false: spread copies every property.',
            description: 'Checks spread cost.',
            code: 'const next = { ...bigObject };',
            answer: 'True; cost grows with object size on every call.',
          },
          {
            easy: true,
            task: 'Name the DevTools panel for CPU time.',
            description: 'Checks Performance panel.',
            answer: 'The Performance panel records where CPU and GC time goes.',
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
            task: 'Fix the reducer.',
            description: 'Checks mutation in reducer.',
            code: `case 'add':
  state.items.push(action.item);
  return { ...state };`,
            answer: 'items is the same array, so memoized children miss updates. Copy it.',
            solution: 'return { ...state, items: [...state.items, action.item] };',
          },
          {
            task: 'Name a team rule.',
            description: 'Checks immutability enforcement.',
            answer: 'Use Immer or Redux Toolkit for nested updates and enable eslint-plugin-functional or immutable types like Readonly.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks mutation keeps reference.',
            code: `const s = { a: 1 };
const t = s; t.a = 2;
console.log(s === t);`,
            answer: 'true, so React sees no change and may skip re-render.',
          },
          {
            easy: true,
            task: 'True or false: reducers must return new objects on change.',
            description: 'Checks reducer immutability.',
            answer: 'True; a new reference signals the state changed.',
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
            task: 'Predict the log.',
            description: 'Checks target vs currentTarget.',
            code: `ul.addEventListener('click', e =>
  console.log(e.target.tagName, e.currentTarget.tagName));
// user clicks an <li>`,
            answer: 'LI UL. target is the clicked element, currentTarget the element with the listener.',
          },
          {
            task: 'Write delegation for list buttons.',
            description: 'Checks event delegation with closest.',
            answer: 'One listener on the parent, match with closest.',
            solution: `list.addEventListener('click', e => {
  const b = e.target.closest('button[data-id]');
  if (b) remove(b.dataset.id);
});`,
          },
          {
            easy: true,
            task: 'True or false: click events bubble up.',
            description: 'Checks bubbling default.',
            answer: 'True; clicks travel from the target up to ancestors.',
          },
          {
            easy: true,
            task: 'Name the property for the clicked element.',
            description: 'Checks event.target.',
            code: 'ul.onclick = (e) => console.log(e.???);',
            answer: 'event.target, the element that was actually clicked.',
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
            task: 'Fix the bug.',
            description: 'Checks calling vs passing a handler.',
            code: `btn.addEventListener('click', save());`,
            answer: 'save() runs now and passes its result. Pass the function.',
            solution: `btn.addEventListener('click', save);`,
          },
          {
            task: 'Fix the React bug.',
            description: 'Checks onClick with arguments.',
            code: '<button onClick={remove(id)}>X</button>',
            answer: 'It calls remove during render. Wrap in an arrow.',
            solution: '<button onClick={() => remove(id)}>X</button>',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks call vs reference.',
            code: `function f() { console.log('ran'); }
const h = f;`,
            answer: 'Nothing, because f is referenced, not called.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks calling in assignment.',
            code: `function f() { console.log('ran'); }
const h = f();`,
            answer: 'ran, because f() calls the function immediately.',
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
            task: 'Predict the log order.',
            description: 'Checks capture vs bubble.',
            code: `div.addEventListener('click', () => log('cap'), true);
div.addEventListener('click', () => log('bub'));
// click child span`,
            answer: 'cap then bub. Capture runs top-down before the target, bubble runs after.',
          },
          {
            task: 'Predict the log.',
            description: 'Checks stopPropagation scope.',
            code: `span.onclick = e => { e.stopPropagation(); log('span'); };
div.onclick = () => log('div');`,
            answer: `Only 'span'. stopPropagation stops the event reaching the parent div.`,
          },
          {
            easy: true,
            task: 'Name the third argument enabling capture.',
            description: 'Checks capture option.',
            code: 'el.addEventListener(\'click\', fn, ???);',
            answer: 'true or { capture: true } runs the handler in capture phase.',
          },
          {
            easy: true,
            task: 'Name the method that stops bubbling.',
            description: 'Checks stopPropagation.',
            answer: 'event.stopPropagation() stops the event reaching parents.',
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
            task: 'Pick the right method.',
            description: 'Checks preventDefault for forms.',
            code: `form.addEventListener('submit', e => {
  // stop page reload
});`,
            answer: 'e.preventDefault() stops the default navigation; it does not stop bubbling.',
          },
          {
            task: 'Predict the log.',
            description: 'Checks stopImmediatePropagation.',
            code: `btn.addEventListener('click', e => { e.stopImmediatePropagation(); log(1); });
btn.addEventListener('click', () => log(2));`,
            answer: 'Only 1. stopImmediatePropagation also skips other listeners on the same element.',
          },
          {
            easy: true,
            task: 'Name the method blocking link navigation.',
            description: 'Checks preventDefault.',
            code: 'a.onclick = (e) => e.???();',
            answer: 'preventDefault, which cancels the browser\'s default action.',
          },
          {
            easy: true,
            task: 'True or false: preventDefault stops bubbling.',
            description: 'Checks preventDefault scope.',
            answer: 'False; it only cancels the default action, bubbling continues.',
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
            task: 'Fix the bug.',
            description: 'Checks closest() in delegated handlers.',
            code: `list.addEventListener('click', e => {
  if (e.target.matches('li')) select(e.target);
});
// clicking <li><b>x</b></li> does nothing`,
            answer: `e.target is the <b>, not the li. Use closest('li') and check the list contains it.`,
            solution: `list.addEventListener('click', e => {
  const li = e.target.closest('li');
  if (li && list.contains(li)) select(li);
});`,
          },
          {
            task: 'Spot the problem.',
            description: 'Checks listener removal with identical references.',
            code: `list.addEventListener('click', e => onClick(e));
list.removeEventListener('click', e => onClick(e));`,
            answer: 'Two different arrow functions, so nothing is removed. Keep one reference or use an AbortController signal.',
            solution: `const ac = new AbortController();
list.addEventListener('click', onClick, { signal: ac.signal });
ac.abort();`,
          },
          {
            easy: true,
            task: 'True or false: delegation handles added items.',
            description: 'Checks delegation benefit.',
            answer: 'True; the parent listener sees events from new children.',
          },
          {
            easy: true,
            task: 'Name the method finding nearest matching ancestor.',
            description: 'Checks closest().',
            code: 'e.target.???(\'li\')',
            answer: 'closest, which walks up from the target to a matching element.',
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
            task: 'Predict whether the parent handler runs.',
            description: 'Checks the bubbles option of CustomEvent.',
            code: `parent.addEventListener('ping', () => console.log('got'));
child.dispatchEvent(new CustomEvent('ping', { detail: 1 }));`,
            answer: 'Nothing logs. CustomEvent defaults to bubbles: false; pass bubbles: true to reach the parent.',
          },
          {
            task: 'Predict the value of ok.',
            description: 'Checks cancelable and preventDefault return value.',
            code: `el.addEventListener('save', e => e.preventDefault());
const ok = el.dispatchEvent(
  new CustomEvent('save', { cancelable: true }));`,
            answer: 'ok is false. dispatchEvent returns false when a cancelable event was preventDefault-ed. Common mistake: forgetting cancelable: true.',
          },
          {
            easy: true,
            task: 'True or false: CustomEvent bubbles by default.',
            description: 'Checks bubbles default.',
            answer: 'False; set bubbles: true to make it bubble.',
          },
          {
            easy: true,
            task: 'Name the option carrying custom data.',
            description: 'Checks detail option.',
            code: 'new CustomEvent(\'save\', { ???: { id: 1 } });',
            answer: 'detail, read later as event.detail.',
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
            task: 'Suggest a safer alternative to stopPropagation here.',
            description: 'Checks non-destructive event handling between teams.',
            code: `menu.addEventListener('click', e => e.stopPropagation());
// host's document click-to-close never fires`,
            answer: 'Let it bubble; the host checks e.composedPath() or menu.contains(e.target) to ignore inside clicks.',
            solution: `document.addEventListener('click', e => {
  if (!menu.contains(e.target)) closeMenu();
});`,
          },
          {
            task: 'Name two rules for a host and micro-frontend event contract.',
            description: 'Checks cross-team event conventions.',
            code: '// host + 3 MFE teams share one document',
            answer: `Namespace custom events (e.g. 'cart:add') with documented detail schemas, and ban stopPropagation on shared ancestors without review.`,
          },
          {
            easy: true,
            task: 'True or false: stopPropagation affects other apps\' listeners.',
            description: 'Checks global side effect.',
            answer: 'True; ancestors, including the host, never get the event.',
          },
          {
            easy: true,
            task: 'Name a safer way to share events.',
            description: 'Checks custom events.',
            answer: 'Dispatch a custom event instead of stopping propagation.',
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
            task: 'Rewrite to use one delegated listener.',
            description: 'Checks delegation replacing per-cell listeners.',
            code: `cells.forEach(td =>
  td.addEventListener('click', () => edit(td)));`,
            answer: `Attach one listener on the table and use closest('td'); it survives re-renders and uses less memory.`,
            solution: `table.addEventListener('click', e => {
  const td = e.target.closest('td');
  if (td) edit(td);
});`,
          },
          {
            task: 'Fix the leak on re-render.',
            description: 'Checks cleanup of listeners in React effects.',
            code: `useEffect(() => {
  window.addEventListener('resize', onResize);
});`,
            answer: 'No deps and no cleanup, so a listener is added every render. Add [] deps and return a removal.',
            solution: `useEffect(() => {
  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('resize', onResize);
}, []);`,
          },
          {
            easy: true,
            task: 'True or false: one parent listener can replace many.',
            description: 'Checks delegation for tables.',
            answer: 'True; one table listener handles clicks on every cell.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks duplicate listeners.',
            code: `const f = () => console.log('x');
el.addEventListener('click', () => f());
el.addEventListener('click', () => f());`,
            answer: 'x twice per click, because two different functions were added.',
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
            description: 'Checks own versus inherited properties.',
            code: `const a = { x: 1 };
const b = Object.create(a);
console.log(b.x, Object.hasOwn(b, 'x'));`,
            answer: '1 false. x is found on the prototype a, not on b itself.',
          },
          {
            task: 'Predict the output.',
            description: 'Checks that class methods live on prototype.',
            code: `class Dog { bark() {} }
const d = new Dog();
console.log(d.bark === Dog.prototype.bark);`,
            answer: 'true. Class methods are defined once on Dog.prototype and shared by all instances.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks inherited method lookup.',
            code: `const p = { hi() { return 'hi'; } };
const o = Object.create(p);
console.log(o.hi());`,
            answer: 'hi, because o finds hi on its prototype.',
          },
          {
            easy: true,
            task: 'True or false: class methods live on the prototype.',
            description: 'Checks class prototype methods.',
            answer: 'True; methods are stored on Class.prototype, shared by instances.',
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
            task: 'Fix the bug.',
            description: 'Checks this binding in callbacks.',
            code: `class Cart {
  items = [];
  add(x) { this.items.push(x); }
}
const { add } = new Cart(); add(1);`,
            answer: 'Destructured method loses this, so this is undefined. Bind it or make add an arrow class field.',
            solution: `class Cart {
  items = [];
  add = (x) => { this.items.push(x); };
}`,
          },
          {
            task: 'Fix the bug.',
            description: 'Checks shared state on the prototype.',
            code: `function List() {}
List.prototype.items = [];
const a = new List(), b = new List();
a.items.push(1); // b.items is [1] too`,
            answer: 'The array lives on the prototype and is shared. Create it per instance in the constructor.',
            solution: 'function List() { this.items = []; }',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks missing this prefix.',
            code: `class C { items = []; add() { return typeof items; } }
console.log(new C().add());`,
            answer: '"undefined", because items alone is not this.items.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks this.items access.',
            code: `class C { items = [1]; count() { return this.items.length; } }
console.log(new C().count());`,
            answer: '1, because fields are accessed through this.',
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
            description: 'Checks shadowing a prototype property.',
            code: `const p = { n: 1 };
const o = Object.create(p);
o.n = 2;
console.log(p.n, o.n);`,
            answer: '1 2. Assignment creates an own property on o, shadowing p.n.',
          },
          {
            task: 'Predict the output.',
            description: 'Checks instanceof after changing prototype.',
            code: `function F() {}
const f = new F();
F.prototype = {};
console.log(f instanceof F);`,
            answer: `false. instanceof checks F.prototype now, which is a new object not in f's chain.`,
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks own property shadows prototype.',
            code: `const p = { x: 1 };
const o = Object.create(p); o.x = 2;
console.log(p.x);`,
            answer: '1, because assigning on o creates its own x.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks hasOwnProperty.',
            code: `const o = Object.create({ x: 1 });
console.log(o.hasOwnProperty('x'));`,
            answer: 'false, because x lives on the prototype.',
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
            description: 'Checks static inheritance via constructor prototype.',
            code: `class A { static hi() { return 'A'; } }
class B extends A {}
console.log(B.hi(), Object.getPrototypeOf(B) === A);`,
            answer: `A true. B's own prototype is A, so static methods are inherited.`,
          },
          {
            task: 'Fix the bug.',
            description: 'Checks super() before using this.',
            code: `class B extends A {
  constructor() {
    this.x = 1;
    super();
  }
}`,
            answer: 'Accessing this before super() throws ReferenceError. Call super() first.',
            solution: `constructor() {
  super();
  this.x = 1;
}`,
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks instanceof with extends.',
            code: `class A {} class B extends A {}
console.log(new B() instanceof A);`,
            answer: 'true, because B.prototype links to A.prototype.',
          },
          {
            easy: true,
            task: 'True or false: super() must precede this in constructors.',
            description: 'Checks super order.',
            answer: 'True; using this before super() throws a ReferenceError.',
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
            task: 'Complete the code to call the parent method.',
            description: 'Checks parent calls with Object.create inheritance.',
            code: `const animal = { speak() { return 'sound'; } };
const dog = Object.create(animal);
dog.speak = function () { /* parent + '!' */ };`,
            answer: 'Call the parent with the correct this via animal.speak.call(this).',
            solution: `dog.speak = function () {
  return animal.speak.call(this) + '!';
};`,
          },
          {
            task: 'Predict the output.',
            description: 'Checks private field brand checks.',
            code: `class A {
  #id = 1;
  static is(o) { return #id in o; }
}
console.log(A.is(new A()), A.is({}));`,
            answer: 'true false. `#id in o` is an ergonomic brand check; private fields are not visible on other objects.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks Object.create prototype.',
            code: `const p = {};
console.log(Object.getPrototypeOf(Object.create(p)) === p);`,
            answer: 'true, because Object.create sets the given prototype.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks Object.create(null).',
            code: 'console.log(typeof Object.create(null).toString);',
            answer: '"undefined", because the object has no prototype.',
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
            description: 'Checks Object.assign mixin overwriting.',
            code: `const A = { log() { return 'A'; } };
const B = { log() { return 'B'; } };
const o = Object.assign({}, A, B);
console.log(o.log());`,
            answer: 'B. Object.assign copies left to right, so later mixins overwrite earlier methods.',
          },
          {
            task: 'Write a mixin that keeps super calls working.',
            description: 'Checks class-factory mixins chaining super.',
            code: `const Loggable = (Base) => class extends Base {
  /* log() should call super.log() */
};`,
            answer: 'Use subclass-factory mixins; each extends the previous so super.log() reaches the next in chain.',
            solution: `const Loggable = (Base) => class extends Base {
  log() { super.log?.(); console.log('L'); }
};`,
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks Object.assign overwrite.',
            code: `const o = Object.assign({}, { f: 1 }, { f: 2 });
console.log(o.f);`,
            answer: '2, because later sources overwrite earlier ones.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks Object.assign copies methods.',
            code: `const o = Object.assign({}, { hi() { return 'hi'; } });
console.log(o.hi());`,
            answer: 'hi, because methods are copied as own properties.',
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
            task: 'Choose a class or a module for this.',
            description: 'Checks choosing plain functions for stateless utilities.',
            code: `export class DateUtils {
  static format(d) { return d.toISOString(); }
}`,
            answer: 'Use plain exported functions: no state, simpler imports, and better tree-shaking than a static-only class.',
            solution: 'export const format = (d) => d.toISOString();',
          },
          {
            task: 'Name a good case for a class in frontend code.',
            description: 'Checks when classes fit modern frontends.',
            answer: 'Long-lived stateful objects with identity, like a WebSocket client or custom elements, which require extending HTMLElement.',
          },
          {
            easy: true,
            task: 'Pick class or module for date helpers.',
            description: 'Checks stateless utils choice.',
            answer: 'A plain module, because pure helpers need no state or instances.',
          },
          {
            easy: true,
            task: 'True or false: classes suit long-lived stateful objects.',
            description: 'Checks class use case.',
            answer: 'True; classes group state with the methods that change it.',
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
            task: 'Fix the leak of internal state.',
            description: 'Checks encapsulation with private fields and copies.',
            code: `class Order {
  items = [];
  getItems() { return this.items; }
}`,
            answer: 'Callers can mutate the array. Use a #private field and return a copy or frozen view.',
            solution: `class Order {
  #items = [];
  getItems() { return [...this.#items]; }
}`,
          },
          {
            task: 'Spot the problem.',
            description: 'Checks invariants enforced through methods.',
            code: 'account.balance -= 500; // anywhere in app',
            answer: 'Rules bypassed by direct mutation. Make balance private and expose withdraw(amount) that validates.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks returned array is shared.',
            code: `class C { #a = [1]; get a() { return this.#a; } }
const c = new C(); c.a.push(2);
console.log(c.a.length);`,
            answer: '2, because the getter leaks the internal array.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks private field access.',
            code: `class C { #x = 1; }
console.log('x' in new C());`,
            answer: 'false, because #x is private and not a normal property.',
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
            task: 'Write a one-liner removing duplicates from an array.',
            description: 'Checks Set-based deduplication.',
            code: 'const a = [1, 2, 2, 3, 1];',
            answer: 'Spread a Set; it keeps first-occurrence order.',
            solution: 'const unique = [...new Set(a)];',
          },
          {
            task: 'Predict the output.',
            description: 'Checks object keys stringify, Map keys do not.',
            code: `const o = {}, m = new Map();
o[1] = 'a'; m.set(1, 'a');
console.log(o['1'], m.get('1'));`,
            answer: `a undefined. Object keys become strings; Map keeps the number 1 distinct from '1'.`,
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks Set dedup size.',
            code: 'console.log(new Set([1, 1, 2]).size);',
            answer: '2, because a Set keeps only unique values.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks Map key types.',
            code: `const m = new Map([[1, 'a']]);
console.log(m.get('1'));`,
            answer: 'undefined, because Map keeps 1 and \'1\' as different keys.',
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
            description: 'Checks Set uses reference equality for objects.',
            code: `const s = new Set([{ id: 1 }, { id: 1 }]);
console.log(s.size);`,
            answer: '2. Objects are compared by reference, not content.',
          },
          {
            task: 'Write code deduplicating users by id.',
            description: 'Checks dedup by key using Map.',
            code: 'const users = [{ id: 1 }, { id: 1 }, { id: 2 }];',
            answer: 'Key a Map by id, then take its values; the last duplicate wins.',
            solution: 'const unique = [...new Map(users.map(u => [u.id, u])).values()];',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks Set size with primitives.',
            code: 'console.log(new Set([1, 1, 2]).size);',
            answer: '2, because Set stores each primitive value once.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks Set.has with new object.',
            code: `const s = new Set([{ id: 1 }]);
console.log(s.has({ id: 1 }));`,
            answer: 'false, because a new object literal is a different reference.',
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
            task: 'Spot the problem.',
            description: 'Checks WeakMap key type rules.',
            code: `const wm = new WeakMap();
wm.set('user-1', { visits: 3 });`,
            answer: 'Throws TypeError: WeakMap keys must be objects or non-registered symbols, not strings.',
          },
          {
            task: 'Name why WeakMap cannot be iterated.',
            description: 'Checks WeakMap trade-offs versus Map.',
            code: `const meta = new WeakMap();
for (const k of meta) {} // TypeError`,
            answer: 'Entries can vanish whenever GC runs, so no size, keys, or iteration are exposed.',
          },
          {
            easy: true,
            task: 'True or false: WeakMap keys can be strings.',
            description: 'Checks WeakMap key types.',
            code: 'new WeakMap().set("a", 1);',
            answer: 'False; it throws TypeError because keys must be objects.',
          },
          {
            easy: true,
            task: 'True or false: WeakMap has a size property.',
            description: 'Checks WeakMap is not enumerable.',
            code: 'console.log(new WeakMap().size);',
            answer: 'False; it logs undefined because WeakMap entries cannot be counted.',
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
            task: 'Fix the bug.',
            description: 'Checks WeakMap for DOM-keyed metadata.',
            code: `const state = new Map();
function track(el) { state.set(el, { clicks: 0 }); }
// removed elements are never freed`,
            answer: 'Map holds strong references. Use WeakMap so entries are collected with removed nodes.',
            solution: 'const state = new WeakMap();',
          },
          {
            task: 'Spot the problem.',
            description: 'Checks detached DOM leaks via arrays.',
            code: `const opened = [];
function open(el) { opened.push(el); }
function close(el) { el.remove(); }`,
            answer: 'The array still references removed nodes, so they leak. Remove them from the array or use a WeakSet.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks Map holds keys strongly.',
            code: `const m = new Map();
let el = {};
m.set(el, 1); el = null;
console.log(m.size);`,
            answer: '1, because Map still strongly references the key object.',
          },
          {
            easy: true,
            task: 'Name the collection that frees unused keys.',
            description: 'Checks WeakMap for garbage collection.',
            code: '// cache.set(domNode, data)',
            answer: 'WeakMap, since its keys do not prevent garbage collection.',
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
            task: 'Implement the get method for a Map-based LRU.',
            description: 'Checks re-insertion to refresh recency.',
            code: `get(key) {
  // this.map is a Map; mark key as most recent
}`,
            answer: 'Delete and re-set the key; Map insertion order makes it the newest.',
            solution: `get(key) {
  if (!this.map.has(key)) return undefined;
  const v = this.map.get(key);
  this.map.delete(key); this.map.set(key, v);
  return v;
}`,
          },
          {
            task: 'Write the eviction line for put.',
            description: 'Checks finding the oldest Map key in O(1).',
            code: `if (this.map.size > this.cap) {
  // evict least recently used
}`,
            answer: 'The first key in iteration order is the oldest.',
            solution: 'this.map.delete(this.map.keys().next().value);',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks Map insertion order.',
            code: `const m = new Map([["a",1],["b",2]]);
console.log([...m.keys()][0]);`,
            answer: '"a", because Map iterates keys in insertion order.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks re-insert moves key to end.',
            code: `const m = new Map([["a",1],["b",2]]);
m.delete("a"); m.set("a",1);
console.log([...m.keys()]);`,
            answer: '["b", "a"], because deleting then setting moves the key to the end.',
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
            description: 'Checks Map serialization with JSON.',
            code: `const m = new Map([['a', 1]]);
console.log(JSON.stringify(m));`,
            answer: '{} . Maps do not serialize; convert with Object.fromEntries(m) first.',
          },
          {
            task: 'Pick array or Set for frequent membership checks.',
            description: 'Checks lookup cost of includes versus has.',
            code: `const banned = [/* 100k ids */];
ids.filter(id => !banned.includes(id));`,
            answer: 'Use a Set: has() is O(1) on average, while includes() is O(n) per check.',
            solution: `const bannedSet = new Set(banned);
ids.filter(id => !bannedSet.has(id));`,
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks Map accepts object keys.',
            code: `const k = {};
const m = new Map([[k, "v"]]);
console.log(m.get(k));`,
            answer: '"v", because Map can use any value, including objects, as keys.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks object keys become strings.',
            code: `const o = {};
o[1] = "x";
console.log(typeof Object.keys(o)[0]);`,
            answer: '"string", because plain object keys are converted to strings.',
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
            task: 'Spot the problem.',
            description: 'Checks FinalizationRegistry is not reliable cleanup.',
            code: `const reg = new FinalizationRegistry(id => socket.close(id));
reg.register(view, view.id);`,
            answer: 'Callbacks may run late or never, so critical cleanup is unreliable. Close explicitly in a dispose method.',
          },
          {
            task: 'Predict what deref() may return.',
            description: 'Checks WeakRef semantics.',
            code: `const ref = new WeakRef(bigObj);
bigObj = null;
later(() => console.log(ref.deref()));`,
            answer: 'Either the object or undefined, depending on whether GC ran. Always handle undefined.',
          },
          {
            easy: true,
            task: 'True or false: deref() may return undefined.',
            description: 'Checks WeakRef target can be collected.',
            code: `const r = new WeakRef(obj);
r.deref();`,
            answer: 'True; once the target is garbage collected, deref returns undefined.',
          },
          {
            easy: true,
            task: 'True or false: finalizers run at guaranteed times.',
            description: 'Checks FinalizationRegistry timing.',
            answer: 'False; cleanup callbacks may run late or never, so do not rely on them.',
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
            description: 'Checks prototype keys on plain objects.',
            code: `const flags = { beta: true };
const key = 'toString';
console.log(Boolean(flags[key]));`,
            answer: 'true. Inherited Object.prototype members look like enabled flags; use Object.hasOwn or a Map.',
          },
          {
            task: 'Fix the prototype pollution risk.',
            description: 'Checks safe dictionaries for user keys.',
            code: `const flags = {};
flags[userKey] = userValue; // userKey may be '__proto__'`,
            answer: `Use a Map, or Object.create(null), so '__proto__' is just a normal key.`,
            solution: `const flags = new Map();
flags.set(userKey, userValue);`,
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks in operator sees prototype.',
            code: `const flags = {};
console.log("toString" in flags);`,
            answer: 'true, because in also checks inherited prototype properties.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks Object.create(null) has no prototype.',
            code: `const flags = Object.create(null);
console.log("toString" in flags);`,
            answer: 'false, because the object has no prototype to inherit from.',
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
            description: 'Checks Symbol uniqueness and Symbol.for.',
            code: `console.log(Symbol('a') === Symbol('a'));
console.log(Symbol.for('a') === Symbol.for('a'));`,
            answer: 'false then true. Each Symbol() is unique; Symbol.for uses a global registry.',
          },
          {
            task: 'Predict the output.',
            description: 'Checks symbol keys hidden from JSON and keys.',
            code: `const id = Symbol('id');
const o = { [id]: 1, a: 2 };
console.log(Object.keys(o), JSON.stringify(o));`,
            answer: `['a'] {"a":2}. Symbol keys are skipped by Object.keys and JSON.`,
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks typeof Symbol.',
            code: 'console.log(typeof Symbol("id"));',
            answer: '"symbol", because Symbol is its own primitive type.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks Symbol.for registry sharing.',
            code: 'console.log(Symbol.for("a") === Symbol.for("a"));',
            answer: 'true, because Symbol.for returns the same registered symbol per key.',
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
            task: 'Fix the bug.',
            description: 'Checks generator object is single-use.',
            code: `const g = gen();
for (const x of g) console.log(x);
for (const x of g) console.log(x); // nothing`,
            answer: 'A generator is exhausted after one pass. Call gen() again for a second loop.',
            solution: `for (const x of gen()) console.log(x);
for (const x of gen()) console.log(x);`,
          },
          {
            task: 'Fix the bug.',
            description: 'Checks for...of on plain objects.',
            code: `const o = { a: 1, b: 2 };
for (const v of o) console.log(v);`,
            answer: 'Plain objects are not iterable (TypeError). Iterate Object.values(o) or Object.entries(o).',
            solution: 'for (const v of Object.values(o)) console.log(v);',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks generator body is lazy.',
            code: `function* g() { console.log("run"); }
const it = g();
console.log("done");`,
            answer: '"done" only, because calling a generator does not run its body.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks next() returns value object.',
            code: `function* g() { yield 1; }
console.log(g().next());`,
            answer: '{ value: 1, done: false }, because next returns the yielded value.',
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
            task: 'Make range iterable with a generator method.',
            description: 'Checks Symbol.iterator with generator syntax.',
            code: 'const range = { from: 1, to: 3 };',
            answer: 'Add a *[Symbol.iterator]() generator that yields each value.',
            solution: `const range = { from: 1, to: 3,
  *[Symbol.iterator]() {
    for (let i = this.from; i <= this.to; i++) yield i;
  } };`,
          },
          {
            task: 'Predict the output.',
            description: 'Checks spread consumes iterables.',
            code: `function* g() { yield 1; yield 2; return 3; }
console.log([...g()]);`,
            answer: '[1, 2]. The return value is not included by spread or for...of.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks spreading a generator.',
            code: `function* g() { yield 1; yield 2; }
console.log([...g()]);`,
            answer: '[1, 2], because spread consumes every yielded value.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks plain objects are not iterable.',
            code: 'for (const x of { a: 1 }) {}',
            answer: 'TypeError, because plain objects lack Symbol.iterator.',
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
            description: 'Checks Symbol.toPrimitive hint handling.',
            code: `const m = { [Symbol.toPrimitive](h) {
  return h === 'number' ? 42 : 'money'; } };
console.log(+m, \`\${m}\`);`,
            answer: `42 money. Unary + passes hint 'number'; template literals pass 'string'.`,
          },
          {
            task: 'Predict the output.',
            description: 'Checks Symbol.toStringTag customization.',
            code: `class Temp { get [Symbol.toStringTag]() { return 'Temp'; } }
console.log(Object.prototype.toString.call(new Temp()));`,
            answer: '[object Temp]. Symbol.toStringTag customizes the default toString tag.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks Symbol.toStringTag.',
            code: `const o = { [Symbol.toStringTag]: "Foo" };
console.log(String(o));`,
            answer: '"[object Foo]", because toStringTag customizes the default tag.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks arrays have Symbol.iterator.',
            code: 'console.log(typeof [][Symbol.iterator]);',
            answer: '"function", because arrays implement the iterator protocol.',
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
            task: 'Complete the async generator for paginated fetching.',
            description: 'Checks async generators with cursors.',
            code: `async function* pages(url) {
  // follow data.next until null
}`,
            answer: 'Loop while url exists, fetch, yield items, then move to next.',
            solution: `async function* pages(url) {
  while (url) {
    const d = await (await fetch(url)).json();
    yield d.items; url = d.next;
  }
}`,
          },
          {
            task: 'Name two ways to stop the pagination loop.',
            description: 'Checks cancelling async iteration.',
            code: 'for await (const items of pages(u)) render(items);',
            answer: 'break out of for await (calls return()), or pass an AbortSignal to fetch and abort it.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks async generator returns promises.',
            code: `async function* g() { yield 1; }
console.log(g().next() instanceof Promise);`,
            answer: 'true, because async generator next always returns a promise.',
          },
          {
            easy: true,
            task: 'Name the loop for async iterables.',
            description: 'Checks for await syntax.',
            code: 'for ___ (const page of pages()) {}',
            answer: 'for await...of, which awaits each value from an async iterable.',
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
            description: 'Checks return() triggers finally.',
            code: `function* g() {
  try { yield 1; yield 2; } finally { console.log('done'); }
}
const it = g(); it.next();
console.log(it.return(9));`,
            answer: `Logs 'done' then {value: 9, done: true}. return() runs finally blocks before finishing.`,
          },
          {
            task: 'Predict the output.',
            description: 'Checks throw() caught inside generator.',
            code: `function* g() {
  try { yield 1; } catch (e) { yield 'caught ' + e; }
}
const it = g(); it.next();
console.log(it.throw('x').value);`,
            answer: 'caught x. throw() resumes the generator by throwing at the paused yield.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks done after last yield.',
            code: `function* g() { yield 1; }
const it = g(); it.next();
console.log(it.next().done);`,
            answer: 'true, because the generator finished after its only yield.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks return() value.',
            code: `function* g() { yield 1; }
console.log(g().return(5));`,
            answer: '{ value: 5, done: true }, because return ends the generator with that value.',
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
            task: 'Pick the simplest tool for this flow.',
            description: 'Checks async/await suits sequential requests.',
            code: '// load user, then their orders, then show',
            answer: 'async/await: it is sequential, readable, and needs no library. Common mistake: reaching for RxJS by default.',
          },
          {
            task: 'Name when observables are worth it.',
            description: 'Checks fit of RxJS for streams.',
            code: '// typeahead: debounce, cancel stale, retry, merge sockets',
            answer: 'For multi-event streams needing debounce, cancellation, and combining sources, RxJS operators like switchMap fit well.',
          },
          {
            easy: true,
            task: 'True or false: async/await suits one-off requests.',
            description: 'Checks choosing the simplest async tool.',
            code: 'const user = await getUser(id);',
            answer: 'True; a single async value needs no observable or saga machinery.',
          },
          {
            easy: true,
            task: 'Name the tool for continuous event streams.',
            description: 'Checks observables for multi-value streams.',
            code: '// mouse moves, websocket messages',
            answer: 'Observables, since they model many values over time with cancellation.',
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
            task: 'Redesign to avoid key clashes.',
            description: 'Checks Symbol keys for library metadata.',
            code: 'function tag(obj) { obj._meta = { seen: true }; }',
            answer: 'Use a module-private Symbol key, or better a WeakMap, so user data is never touched.',
            solution: `const meta = new WeakMap();
function tag(obj) { meta.set(obj, { seen: true }); }`,
          },
          {
            task: 'Spot the problem.',
            description: 'Checks hidden metadata leaking into serialization.',
            code: `user._meta = { seen: true };
api.save(JSON.stringify(user));`,
            answer: '_meta gets sent to the server and may clash or fail validation. Store metadata outside the object.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks symbol keys hidden from Object.keys.',
            code: `const s = Symbol("meta");
console.log(Object.keys({ [s]: 1 }));`,
            answer: '[], because Object.keys ignores symbol-keyed properties.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks JSON.stringify skips symbol keys.',
            code: 'console.log(JSON.stringify({ [Symbol("m")]: 1 }));',
            answer: '"{}", because JSON serialization skips symbol keys.',
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
            description: 'Checks sync, microtask, and macrotask order.',
            code: `setTimeout(() => console.log(1));
Promise.resolve().then(() => console.log(2));
console.log(3);`,
            answer: '3 2 1. Sync code first, then microtasks, then the timer task.',
          },
          {
            task: 'Predict the output.',
            description: 'Checks await splits sync and microtask parts.',
            code: `async function f() { console.log(1); await null; console.log(2); }
f(); console.log(3);`,
            answer: '1 3 2. Code before await runs synchronously; the rest is a microtask.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks setTimeout 0 runs later.',
            code: `setTimeout(() => console.log("a"), 0);
console.log("b");`,
            answer: 'b a, because the timeout callback waits for the call stack to clear.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks Promise executor runs sync.',
            code: `new Promise(() => console.log("a"));
console.log("b");`,
            answer: 'a b, because the Promise executor runs synchronously.',
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
            description: 'Checks microtasks drain before next task.',
            code: `setTimeout(() => console.log('t'));
queueMicrotask(() => {
  console.log('m1');
  queueMicrotask(() => console.log('m2'));
});`,
            answer: 'm1 m2 t. The microtask queue is fully drained, including new microtasks, before the next task.',
          },
          {
            task: 'Spot the problem.',
            description: 'Checks infinite microtasks starve rendering.',
            code: `function loop() { queueMicrotask(loop); }
loop();`,
            answer: 'The microtask queue never empties, so tasks and rendering never run; the page freezes.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks microtask before macrotask.',
            code: `setTimeout(() => console.log("t"));
Promise.resolve().then(() => console.log("p"));`,
            answer: 'p t, because microtasks run before the next macrotask.',
          },
          {
            easy: true,
            task: 'Name the queue holding promise callbacks.',
            description: 'Checks microtask queue knowledge.',
            code: 'Promise.resolve().then(cb);',
            answer: 'The microtask queue, which drains after the current task finishes.',
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
            description: 'Checks then chains interleaving.',
            code: `Promise.resolve().then(() => console.log('a')).then(() => console.log('b'));
Promise.resolve().then(() => console.log('c'));`,
            answer: 'a c b. b is queued only after a runs, so c gets in between.',
          },
          {
            task: 'Predict the output.',
            description: 'Checks Promise executor runs synchronously.',
            code: `new Promise(r => { console.log(1); r(); })
  .then(() => console.log(2));
console.log(3);`,
            answer: '1 3 2. The executor runs synchronously; then callbacks are microtasks.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks await resumes asynchronously.',
            code: `(async () => { await null; console.log("a"); })();
console.log("b");`,
            answer: 'b a, because code after await resumes in a microtask.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks queueMicrotask order.',
            code: `queueMicrotask(() => console.log(1));
console.log(2);`,
            answer: '2 1, because microtasks run after the current synchronous code.',
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
            task: 'Pick the right API for smooth animation.',
            description: 'Checks requestAnimationFrame versus setTimeout.',
            code: 'setInterval(() => move(box), 16);',
            answer: 'Use requestAnimationFrame: it syncs with the display refresh and pauses in background tabs.',
            solution: `function tick() { move(box); requestAnimationFrame(tick); }
requestAnimationFrame(tick);`,
          },
          {
            task: 'Predict the output.',
            description: 'Checks MutationObserver callbacks are microtasks.',
            code: `new MutationObserver(() => console.log('mo'))
  .observe(el, { attributes: true });
setTimeout(() => console.log('t'));
el.id = 'x'; console.log('sync');`,
            answer: 'sync mo t. MutationObserver callbacks run as microtasks, before the timer task.',
          },
          {
            easy: true,
            task: 'Name the API that runs before repaint.',
            description: 'Checks requestAnimationFrame timing.',
            code: 'requestAnimationFrame(draw);',
            answer: 'requestAnimationFrame, which schedules the callback before the next paint.',
          },
          {
            easy: true,
            task: 'Name the API for low-priority background work.',
            description: 'Checks requestIdleCallback purpose.',
            code: '___(() => sendAnalytics());',
            answer: 'requestIdleCallback, which runs work when the browser is idle.',
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
            task: 'Explain why this still blocks the page.',
            description: 'Checks async does not make CPU work non-blocking.',
            code: `async function sum() {
  let s = 0; for (let i = 0; i < 1e9; i++) s += i;
  return s;
}`,
            answer: 'async does not move work off the main thread; the loop runs synchronously. Chunk it or use a Web Worker.',
          },
          {
            task: 'Fix the bug to keep the UI responsive.',
            description: 'Checks yielding to the main thread in chunks.',
            code: 'for (const item of items) heavy(item); // 10k items',
            answer: 'Process in chunks and yield between them, e.g. scheduler.yield() or setTimeout.',
            solution: `for (const [i, item] of items.entries()) {
  heavy(item);
  if (i % 100 === 0) await scheduler.yield();
}`,
          },
          {
            easy: true,
            task: 'True or false: async functions run on another thread.',
            description: 'Checks async is still single-threaded.',
            code: 'async function f() { while (true) {} }',
            answer: 'False; the loop still blocks the main thread.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks sync code before await runs immediately.',
            code: `async function f() { console.log("a"); }
f(); console.log("b");`,
            answer: 'a b, because an async function runs synchronously until its first await.',
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
            task: 'Predict the output in Node.js.',
            description: 'Checks nextTick runs before promise microtasks.',
            code: `Promise.resolve().then(() => console.log('p'));
process.nextTick(() => console.log('n'));
console.log('s');`,
            answer: 's n p. The nextTick queue drains before the promise microtask queue.',
          },
          {
            task: 'Predict the output in Node.js.',
            description: 'Checks setImmediate versus setTimeout inside I/O.',
            code: `fs.readFile(f, () => {
  setTimeout(() => console.log('t'));
  setImmediate(() => console.log('i'));
});`,
            answer: 'i t. Inside an I/O callback, the check phase comes before the next timers phase.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks nextTick before promises.',
            code: `Promise.resolve().then(() => console.log("p"));
process.nextTick(() => console.log("n"));`,
            answer: 'n p, because Node runs the nextTick queue before promise microtasks.',
          },
          {
            easy: true,
            task: 'Name the Node phase running setImmediate.',
            description: 'Checks check phase.',
            code: 'setImmediate(cb);',
            answer: 'The check phase, which runs right after the poll phase.',
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
            task: `Name how you'd find which interactions cause bad INP.`,
            description: 'Checks field measurement of INP.',
            code: 'onINP(m => send(m), { reportAllChanges: true });',
            answer: 'Use web-vitals attribution build to log target element and long animation frame scripts, segmented by device class.',
          },
          {
            task: 'Name two ways to reproduce slow-device INP locally.',
            description: 'Checks lab reproduction of field issues.',
            code: '// field p75 INP: 600ms on low-end Android',
            answer: 'Use DevTools CPU throttling 4-6x with the Performance panel, or test on a real low-end Android device.',
          },
          {
            easy: true,
            task: 'Name the field metric INP measures.',
            description: 'Checks INP definition.',
            answer: 'Interaction responsiveness: delay from user input to the next paint.',
          },
          {
            easy: true,
            task: 'True or false: lab tests fully reflect cheap devices.',
            description: 'Checks need for real-user monitoring.',
            answer: 'False; use field RUM data because real devices and conditions vary widely.',
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
            task: 'Fix the click handler to protect INP.',
            description: 'Checks deferring non-urgent work after paint.',
            code: `btn.onclick = () => {
  analytics.track(buildBigPayload());
  openMenu();
};`,
            answer: 'Do the UI update first, then yield before analytics so the next paint is not blocked.',
            solution: `btn.onclick = async () => {
  openMenu();
  await scheduler.yield();
  analytics.track(buildBigPayload());
};`,
          },
          {
            task: 'Name a better way to send analytics data.',
            description: 'Checks non-blocking analytics transport.',
            code: `xhr.open('POST', url, false); xhr.send(data);`,
            answer: 'Synchronous XHR blocks the thread. Use navigator.sendBeacon or fetch with keepalive.',
            solution: 'navigator.sendBeacon(url, data);',
          },
          {
            easy: true,
            task: 'Name the API to yield to the browser.',
            description: 'Checks yielding in handlers.',
            code: 'await scheduler.___();',
            answer: 'scheduler.yield, which lets the browser paint before continuing work.',
          },
          {
            easy: true,
            task: 'True or false: setTimeout can defer analytics work.',
            description: 'Checks deferring non-urgent work.',
            code: 'setTimeout(() => track(e), 0);',
            answer: 'True; it moves work out of the handler so the next paint is sooner.',
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
            task: 'Pick debounce or throttle for each case.',
            description: 'Checks matching rate-limiting to use cases.',
            code: '// a) search input  b) scroll progress bar',
            answer: 'a) debounce: wait until typing stops. b) throttle: update regularly during continuous scrolling.',
          },
          {
            task: 'Predict how many times save runs.',
            description: 'Checks debounce collapses bursts.',
            code: `const d = debounce(save, 300);
d(); d(); d(); // within 100ms`,
            answer: 'Once, 300ms after the last call. Throttle would run on a fixed cadence instead.',
          },
          {
            easy: true,
            task: 'Pick debounce or throttle for search input.',
            description: 'Checks debounce use case.',
            code: 'input.oninput = ___(search, 300);',
            answer: 'Debounce, so search runs only after typing pauses.',
          },
          {
            easy: true,
            task: 'Pick debounce or throttle for scroll tracking.',
            description: 'Checks throttle use case.',
            code: 'window.onscroll = ___(track, 100);',
            answer: 'Throttle, so it runs at most once per interval during scrolling.',
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
            task: 'Fix the slow input using React 19 APIs.',
            description: 'Checks useDeferredValue for heavy filtering.',
            code: `const [q, setQ] = useState('');
const list = items.filter(i => i.name.includes(q));`,
            answer: 'Defer the filter query so typing stays urgent, and memoize the filtering.',
            solution: `const dq = useDeferredValue(q);
const list = useMemo(
  () => items.filter(i => i.name.includes(dq)), [dq]);`,
          },
          {
            task: 'Spot the problem.',
            description: 'Checks rendering huge lists without virtualization.',
            code: `{filtered.map(i => <Row key={i.id} item={i} />)}
// filtered may have 50k rows`,
            answer: 'Rendering 50k DOM rows is slow. Virtualize the list (e.g. react-window or TanStack Virtual).',
          },
          {
            easy: true,
            task: 'Name the hook to memoize filtered results.',
            description: 'Checks useMemo basics.',
            code: 'const list = ___(() => items.filter(f), [items, f]);',
            answer: 'useMemo, which recomputes only when dependencies change.',
          },
          {
            easy: true,
            task: 'True or false: filtering 50k items per keystroke is cheap.',
            description: 'Checks cost of work per keystroke.',
            code: 'items.filter(i => i.name.includes(q));',
            answer: 'False; repeated heavy work on every key press makes typing laggy.',
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
            task: 'Fix the debounce bug.',
            description: 'Checks this and args forwarding in debounce.',
            code: `function debounce(fn, ms) {
  let t;
  return () => { clearTimeout(t); t = setTimeout(fn, ms); };
}`,
            answer: 'Arguments and this are dropped. Capture them and apply when the timer fires.',
            solution: `return function (...args) {
  clearTimeout(t);
  t = setTimeout(() => fn.apply(this, args), ms);
};`,
          },
          {
            task: 'Spot the problem.',
            description: 'Checks unstable keys in lists.',
            code: '{items.map((it, i) => <Item key={i} {...it} />)}',
            answer: 'Index keys break state and cause extra work when items are inserted or reordered. Use a stable id.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks clearTimeout cancels callback.',
            code: `const t = setTimeout(() => console.log("x"), 10);
clearTimeout(t);`,
            answer: 'Nothing, because clearTimeout cancels the pending callback.',
          },
          {
            easy: true,
            task: 'Name the React prop missing here.',
            description: 'Checks list keys.',
            code: 'items.map(i => <li>{i.name}</li>)',
            answer: 'key, which helps React track list items across renders.',
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
            task: 'Name a fix for this slow initial load.',
            description: 'Checks route-based code splitting.',
            code: `import Admin from './Admin'; // 400 KB, rarely used`,
            answer: 'Lazy-load the route with React.lazy and dynamic import so it ships only when visited.',
            solution: `const Admin = lazy(() => import('./Admin'));`,
          },
          {
            task: 'Spot the problem.',
            description: 'Checks request waterfalls on load.',
            code: `const user = await getUser();
const config = await getConfig(); // independent`,
            answer: 'Independent requests run sequentially, creating a waterfall. Start them together with Promise.all.',
            solution: 'const [user, config] = await Promise.all([getUser(), getConfig()]);',
          },
          {
            easy: true,
            task: 'Name the technique for loading routes on demand.',
            description: 'Checks code splitting.',
            code: 'const Page = lazy(() => import("./Page"));',
            answer: 'Code splitting with dynamic import, which shrinks the initial bundle.',
          },
          {
            easy: true,
            task: 'True or false: uncompressed images slow page loads.',
            description: 'Checks image optimization.',
            code: '<img src="hero-8mb.png">',
            answer: 'True; large images delay rendering, so compress and size them properly.',
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
            task: 'Fix the layout thrashing.',
            description: 'Checks batching reads before writes.',
            code: `els.forEach(el => {
  el.style.width = box.offsetWidth + 'px';
});`,
            answer: 'Each write invalidates layout, so the next read forces reflow. Read once, then write.',
            solution: `const w = box.offsetWidth + 'px';
els.forEach(el => { el.style.width = w; });`,
          },
          {
            task: 'Name a cheaper way to animate this.',
            description: 'Checks compositor-only properties.',
            code: `el.style.left = x + 'px'; // every frame`,
            answer: 'Animate transform: translateX instead; it avoids layout and can run on the compositor.',
          },
          {
            easy: true,
            task: 'True or false: reading offsetHeight can force layout.',
            description: 'Checks forced synchronous layout.',
            code: `el.style.width = "10px";
el.offsetHeight;`,
            answer: 'True; reading layout after a style write forces the browser to recalculate.',
          },
          {
            easy: true,
            task: 'Name the CSS property that avoids layout.',
            description: 'Checks transform for animation.',
            code: 'el.style.___ = "translateX(10px)";',
            answer: 'transform, which is composited and does not trigger layout.',
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
            task: 'Spot the leak.',
            description: 'Checks uncleared intervals in components.',
            code: `useEffect(() => {
  setInterval(poll, 1000);
}, []);`,
            answer: 'The interval keeps running after unmount. Return a cleanup that calls clearInterval.',
            solution: `useEffect(() => {
  const id = setInterval(poll, 1000);
  return () => clearInterval(id);
}, []);`,
          },
          {
            task: 'Name the DevTools workflow to confirm a leak.',
            description: 'Checks heap snapshot comparison.',
            code: '// memory grows after opening/closing a modal',
            answer: 'Take heap snapshots before and after repeating the action, compare, and look for detached nodes and retainers.',
          },
          {
            easy: true,
            task: 'Spot the leak.',
            description: 'Checks unremoved event listeners.',
            code: `window.addEventListener("resize", onResize);
// component unmounts, never removed`,
            answer: 'The listener stays attached, keeping the component closure alive.',
          },
          {
            easy: true,
            task: 'Name the DevTools panel for heap snapshots.',
            description: 'Checks Memory panel.',
            answer: 'The Memory panel, where heap snapshots can be compared over time.',
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
            task: 'Name how to enforce a bundle budget in CI.',
            description: 'Checks automated performance budgets.',
            code: '// main.js must stay under 200 KB gzip',
            answer: 'Add size-limit or Lighthouse CI budgets that fail the PR when exceeded.',
          },
          {
            task: 'Suggest one ownership practice for performance.',
            description: 'Checks team ownership of metrics.',
            code: '// INP regressed; nobody noticed for 3 weeks',
            answer: 'Assign a metric owner per area and alert on RUM dashboards for p75 regressions, reviewed weekly.',
          },
          {
            easy: true,
            task: 'Name the term for a performance limit.',
            description: 'Checks performance budgets.',
            code: '// bundle must stay under 200 KB',
            answer: 'A performance budget, a measurable limit the team agrees to keep.',
          },
          {
            easy: true,
            task: 'True or false: dashboards alone guarantee ownership.',
            description: 'Checks need for clear owners.',
            answer: 'False; metrics need a named owner who acts on regressions.',
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
            task: 'Replace the library with a built-in API.',
            description: 'Checks Intl.DateTimeFormat over date libraries.',
            code: `import moment from 'moment';
moment(d).format('MMM D, YYYY');`,
            answer: 'Intl.DateTimeFormat is built in and zero KB.',
            solution: `new Intl.DateTimeFormat('en-US',
  { month: 'short', day: 'numeric', year: 'numeric' }).format(d);`,
          },
          {
            task: 'Name a guardrail to stop heavy dependencies.',
            description: 'Checks process to prevent bundle bloat.',
            code: '// PR adds a 300 KB dependency',
            answer: 'A CI bundle-size check with PR comments, plus review rule requiring justification for new dependencies.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks built-in date formatting.',
            code: 'new Date(2024, 0, 5).toLocaleDateString("en-US");',
            answer: '"1/5/2024", because Intl formats dates without any library.',
          },
          {
            easy: true,
            task: 'Name the built-in API for date formatting.',
            description: 'Checks Intl.DateTimeFormat.',
            code: 'new Intl.___("en-US").format(d);',
            answer: 'DateTimeFormat, which formats dates natively with no bundle cost.',
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
            task: 'Fix the import.',
            description: 'Checks named versus default imports.',
            code: `// math.js
export function add(a, b) { return a + b; }
// app.js
import add from './math.js';`,
            answer: 'There is no default export. Use a named import with braces.',
            solution: `import { add } from './math.js';`,
          },
          {
            task: 'Predict the output.',
            description: 'Checks live bindings in ES modules.',
            code: `// c.js
export let n = 0; export const inc = () => n++;
// app.js
import { n, inc } from './c.js';
inc(); console.log(n);`,
            answer: '1. ES module imports are live bindings, not copies.',
          },
          {
            easy: true,
            task: 'Fix the import for a default export.',
            description: 'Checks default import syntax.',
            code: `// a.js: export default fn
import { fn } from "./a.js";`,
            answer: 'Use import fn from "./a.js", because default exports need no braces.',
          },
          {
            easy: true,
            task: 'True or false: a module can have two defaults.',
            description: 'Checks single default export.',
            answer: 'False; a module has at most one default export.',
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
            task: 'Fix the script tag.',
            description: 'Checks type=module for ESM in browsers.',
            code: `<script src="app.js"></script>
<!-- app.js uses import -->`,
            answer: 'Add type="module" so the browser parses it as an ES module.',
            solution: '<script type="module" src="app.js"></script>',
          },
          {
            task: 'Fix the bug.',
            description: 'Checks browsers need resolvable import specifiers.',
            code: `<script type="module">
  import { debounce } from 'lodash-es';
</script>`,
            answer: 'Bare specifiers fail without a bundler. Add an import map or use a full URL path.',
            solution: `<script type="importmap">
{"imports":{"lodash-es":"/vendor/lodash-es/lodash.js"}}
</script>`,
          },
          {
            easy: true,
            task: 'Name the attribute enabling import in scripts.',
            description: 'Checks type=module.',
            code: '<script ___ src="app.js"></script>',
            answer: 'type="module", which lets the browser parse import statements.',
          },
          {
            easy: true,
            task: 'True or false: module scripts are deferred.',
            description: 'Checks module script loading.',
            code: '<script type="module" src="a.js"></script>',
            answer: 'True; module scripts are deferred by default.',
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
            task: 'Spot what breaks tree-shaking.',
            description: 'Checks namespace object usage patterns.',
            code: `import _ from 'lodash';
_.debounce(fn, 300);`,
            answer: 'CommonJS lodash imports the whole library. Use lodash-es named imports so unused code is removed.',
            solution: `import { debounce } from 'lodash-es';`,
          },
          {
            task: 'Spot the problem.',
            description: 'Checks side effects preventing dead-code removal.',
            code: `// utils.js
export const a = () => 1;
window.utilsLoaded = true;`,
            answer: 'Top-level side effects make the module unremovable. Avoid them or mark sideEffects correctly in package.json.',
          },
          {
            easy: true,
            task: 'True or false: named ESM imports help tree-shaking.',
            description: 'Checks static import analysis.',
            code: 'import { debounce } from "lodash-es";',
            answer: 'True; static named imports let bundlers drop unused exports.',
          },
          {
            easy: true,
            task: 'Spot what blocks tree-shaking.',
            description: 'Checks CommonJS is not static.',
            code: 'const _ = require("lodash");',
            answer: 'require is dynamic CommonJS, so bundlers keep the whole library.',
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
            task: 'Fix for ESM.',
            description: 'Checks require is unavailable in ESM.',
            code: `// package.json has "type": "module"
const fs = require('fs');`,
            answer: 'require is not defined in ESM. Use import (or createRequire for legacy cases).',
            solution: `import fs from 'node:fs';`,
          },
          {
            task: 'Fix for ESM.',
            description: 'Checks __dirname replacement in ESM.',
            code: `const p = path.join(__dirname, 'data.json');`,
            answer: '__dirname does not exist in ESM. Use import.meta.dirname (Node 20.11+).',
            solution: `const p = path.join(import.meta.dirname, 'data.json');`,
          },
          {
            easy: true,
            task: 'True or false: __dirname exists in ESM.',
            description: 'Checks ESM globals.',
            code: 'console.log(__dirname);',
            answer: 'False; ESM lacks __dirname, so derive it from import.meta.url.',
          },
          {
            easy: true,
            task: 'Name the package.json field enabling ESM.',
            description: 'Checks "type": "module".',
            code: '{ "___": "module" }',
            answer: '"type", set to "module" so .js files are treated as ESM.',
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
            task: 'Pick Web Worker, Service Worker, or WebAssembly.',
            description: 'Checks matching workers to use cases.',
            code: '// a) offline cache  b) parse 50MB CSV  c) run C++ codec',
            answer: 'a) Service Worker, b) Web Worker, c) WebAssembly (often inside a Worker).',
          },
          {
            task: 'Spot the problem.',
            description: 'Checks workers lack DOM access.',
            code: `// worker.js
self.onmessage = e => {
  document.body.textContent = e.data;
};`,
            answer: 'Workers have no DOM. Post the result back and update the DOM on the main thread.',
            solution: `self.onmessage = e => self.postMessage(e.data);
// main: worker.onmessage = e => (el.textContent = e.data);`,
          },
          {
            easy: true,
            task: 'Pick a worker for offline caching.',
            description: 'Checks Service Worker purpose.',
            answer: 'Service Worker, because it intercepts network requests and caches responses.',
          },
          {
            easy: true,
            task: 'True or false: Web Workers can access the DOM.',
            description: 'Checks worker limitations.',
            code: '// inside worker: document.body',
            answer: 'False; workers have no DOM access and communicate via messages.',
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
            task: 'Fix the slow data transfer.',
            description: 'Checks transferable ArrayBuffers.',
            code: 'worker.postMessage(bigBuffer); // 200 MB, copied',
            answer: 'Structured clone copies the buffer. Transfer ownership instead for zero-copy.',
            solution: 'worker.postMessage(bigBuffer, [bigBuffer]);',
          },
          {
            task: 'Spot the problem.',
            description: 'Checks worker creation cost and message granularity.',
            code: `for (const row of rows) {
  const w = new Worker('calc.js');
  w.postMessage(row);
}`,
            answer: 'A new worker and message per row adds huge overhead. Reuse one worker and send batches.',
          },
          {
            easy: true,
            task: 'Name how data reaches a worker.',
            description: 'Checks postMessage basics.',
            code: 'worker.___(data);',
            answer: 'postMessage, which copies data to the worker via structured clone.',
          },
          {
            easy: true,
            task: 'True or false: postMessage copies objects by default.',
            description: 'Checks structured clone cost.',
            code: 'worker.postMessage(bigArray);',
            answer: 'True; data is cloned unless transferred, which costs time for large data.',
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
            task: 'Decide if micro-frontends fit this team.',
            description: 'Checks when micro-frontends are overkill.',
            code: '// one team of 5, one app, one release cycle',
            answer: 'No: a modular monolith is simpler. Micro-frontends pay off with many autonomous teams needing independent deploys.',
          },
          {
            task: 'Pick an integration for an untrusted vendor app.',
            description: 'Checks iframe isolation trade-off.',
            code: `// embed partner's billing UI in our shell`,
            answer: 'Use an iframe with sandbox and postMessage: strong isolation, at the cost of shared styling and performance.',
          },
          {
            easy: true,
            task: 'True or false: tiny teams need micro-frontends.',
            description: 'Checks micro-frontend overhead.',
            answer: 'False; their overhead pays off mainly with many independent teams.',
          },
          {
            easy: true,
            task: 'Name one micro-frontend integration method.',
            description: 'Checks integration options.',
            answer: 'Module Federation, which loads remote bundles at runtime.',
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
            task: 'Fix the script include.',
            description: 'Checks Subresource Integrity for third-party scripts.',
            code: '<script src="https://cdn.vendor.com/widget.js"></script>',
            answer: `Pin a version and add integrity plus crossorigin so a tampered file won't run.`,
            solution: `<script src="https://cdn.vendor.com/widget@2.1.0.js"
  integrity="sha384-..." crossorigin="anonymous"></script>`,
          },
          {
            task: 'Name a way to isolate the widget.',
            description: 'Checks sandboxing and CSP for third parties.',
            code: '// widget only needs to show a chat bubble',
            answer: 'Load it in a sandboxed cross-origin iframe and restrict script-src with CSP to allow only its origin.',
          },
          {
            easy: true,
            task: 'Name the attribute verifying a script hash.',
            description: 'Checks Subresource Integrity.',
            code: '<script src="cdn.js" ___="sha384-..."></script>',
            answer: 'integrity, which blocks the script if its content hash changes.',
          },
          {
            easy: true,
            task: 'Name the element isolating third-party content.',
            description: 'Checks sandboxed iframe.',
            code: '<___ sandbox src="widget.html">',
            answer: 'iframe, whose sandbox attribute restricts what the widget can do.',
          },
        ],
      },
    ],
  },
};
