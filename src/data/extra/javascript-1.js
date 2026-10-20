// Extra JavaScript questions (part 1): 3 additional questions per topic and level.
const Q = (q, short, long, exercises, extra = {}) => ({ q, ...extra, short, long, exercises });
const E = (task, description, answer, extra = {}) => ({ task, description, ...extra, answer });

export default {
  JavaScript: {
    'Types': {
      junior: [
        Q('What is the difference between null and undefined? When does JavaScript give you each one?',
          'undefined means no value was assigned, and the engine produces it. null is an empty value that the developer sets on purpose.',
          'undefined: variables without a value, missing arguments, missing properties, functions without return.\nnull: set on purpose, and returned by APIs like document.querySelector when nothing matches.\nnull == undefined is true, but null === undefined is false.\ntypeof undefined is "undefined"; typeof null is "object" (an old bug).\nDefault parameters and destructuring defaults apply only to undefined, not to null.\nStrong answer mentions ?? treating both as nullish; weak answer says they are the same.',
          [
            E('Predict the output.', 'Checks typeof and loose equality of null/undefined.',
              '"object" "undefined", then true false. typeof null is a legacy bug; == treats null and undefined as equal only to each other.',
              { code: `console.log(typeof null, typeof undefined);
console.log(null == undefined, null === undefined);` }),
            E('Predict what the function returns.', 'Checks implicit undefined from missing return.',
              'undefined undefined. A function without return gives undefined; missing properties and short-circuited ?. also give undefined.',
              { code: `function f(a) { const x = a?.b; }
console.log(f({}), f(null));` }),
          ]),
        Q('Find and fix the bug. The age check lets wrong input pass.',
          'Input values are strings. Comparing "18" with "9" uses string order, so the result is wrong. Convert to numbers and check for NaN.',
          'input.value is always a string.\nTwo strings compare character by character: "18" < "9" is true.\nIf one side is a number, the string is converted, which hides the bug in some cases.\nNumber("") is 0, so empty input needs its own check.\nUse Number() or valueAsNumber, and Number.isNaN for validation.\nStrong answer explains string comparison; weak answer adds parseInt without handling NaN.',
          [
            E('Fix the bug.', 'Checks string-to-number comparison pitfalls.',
              '"abc" becomes NaN, so it fails, but "" becomes 0 and "9" compares fine; parse and validate explicitly.',
              { code: `const age = input.value; // "abc"
if (age >= 18) allow();`, solution: `const age = Number(input.value);
if (input.value.trim() !== '' && Number.isInteger(age) && age >= 18) allow();` }),
            E('Predict the output.', 'Checks Number vs parseInt conversion.',
              '0 NaN NaN 12. Number converts the whole string (empty is 0); parseInt reads leading digits only.',
              { code: `console.log(Number(''), parseInt(''), Number('12px'), parseInt('12px'));` }),
          ],
          { code: `const min = document.querySelector('#min').value; // "9"\nconst age = document.querySelector('#age').value; // "18"\nif (age >= min) allow();`,
            fix: `const min = Number(minInput.value);\nconst age = Number(ageInput.value);\nif (ageInput.value.trim() === '' || Number.isNaN(age)) showError();\nelse if (age >= min) allow();`,
            follow: 'What changes if you use input.valueAsNumber instead?' }),
        Q('How do you check if a value is an array, a number, or a plain object?',
          'Use Array.isArray for arrays, typeof plus Number.isFinite for numbers, and a prototype check for plain objects. typeof alone is not enough.',
          'typeof [] and typeof null both return "object".\nArray.isArray works across iframes; instanceof Array does not.\ntypeof NaN is "number", so use Number.isFinite or Number.isNaN.\nNumber.isNaN does not coerce; global isNaN("abc") returns true.\nPlain object: Object.prototype.toString.call(x) === "[object Object]", or prototype is Object.prototype or null.\nStrong answer knows these edge cases; weak answer uses typeof for everything.',
          [
            E('Predict the output.', 'Checks typeof limits for arrays and NaN.',
              '"object" "number" true. Use Array.isArray for arrays and Number.isFinite to reject NaN.',
              { code: 'console.log(typeof [], typeof NaN, Array.isArray([]));' }),
            E('Write a function that detects a plain object.', 'Checks prototype-based plain object check.',
              `Check type, non-null, and that the prototype is Object.prototype or null. Common mistake: typeof x === 'object' accepts arrays and null.`,
              { solution: `const isPlain = (x) => x !== null && typeof x === 'object' &&
  [Object.prototype, null].includes(Object.getPrototypeOf(x));` }),
          ]),
      ],
      middle: [
        Q('What happens when JavaScript converts an object to a primitive? Explain valueOf, toString and Symbol.toPrimitive.',
          'JS calls Symbol.toPrimitive with a hint if it exists. Otherwise it calls valueOf then toString (number or default hint), or toString then valueOf (string hint).',
          'Hints: "string" for template literals and String(), "number" for math and comparisons, "default" for + and ==.\nDate is special: its default hint acts like "string".\n[] + {} is "[object Object]" because [] becomes "" and {} becomes "[object Object]".\nIf a method returns an object it is skipped; if nothing returns a primitive, TypeError.\nStrong answer explains [] == false step by step.\nWeak answer memorises results without the algorithm.',
          [
            E('Predict the output.', 'Checks default object to string conversion.',
              '"[object Object]" "1,2" "[object Object]1". Objects fall back to toString when valueOf returns an object.',
              { code: `console.log(\`\${{}}\`, [1, 2] + '', {} + 1);` }),
            E('Predict the output.', 'Checks Symbol.toPrimitive hint handling.',
              '42 "hi" "hi". Unary plus uses hint number, template uses string, and + uses default.',
              { code: `const m = { [Symbol.toPrimitive]: (h) => h === 'number' ? 42 : 'hi' };
console.log(+m, \`\${m}\`, m + '');` }),
          ], { ai: true }),
        Q('Find and fix the bug. Sorting numbers gives the wrong order.',
          'sort converts elements to strings by default, so 10 comes before 9. Pass a numeric compare function.',
          'Default sort compares string forms.\nComparator (a, b) => a - b sorts ascending.\nsort mutates in place; toSorted() keeps the original (ES2023).\nReturning a boolean from the comparator is a common bug and gives unstable results.\nFor text with locales use localeCompare or Intl.Collator.\nStrong answer mentions mutation and toSorted.',
          [
            E('Predict the output.', 'Checks default lexicographic sort.',
              '[1, 10, 100, 9]. Default sort compares strings; pass (a, b) => a - b for numbers.',
              { code: 'console.log([10, 9, 1, 100].sort());' }),
            E('Sort without mutating the original array.', 'Checks toSorted and immutability.',
              'sort mutates prices in place; use toSorted (ES2023) or copy first.',
              { code: `const prices = [3, 1, 2];
const sorted = prices.sort((a, b) => a - b);`, solution: 'const sorted = prices.toSorted((a, b) => a - b);' }),
          ],
          { code: `const scores = [10, 9, 100, 1];\nscores.sort();\nconsole.log(scores); // [1, 10, 100, 9]`,
            fix: `const sorted = scores.toSorted((a, b) => a - b); // [1, 9, 10, 100]` }),
        Q('What is BigInt? When do you need it, and what are the traps?',
          'BigInt stores integers of any size. You need it above Number.MAX_SAFE_INTEGER (2^53 - 1), for example 64-bit IDs. You cannot mix it with Number in math.',
          'Numbers are 64-bit floats; integers are exact only up to 2^53 - 1.\n10n + 1 throws TypeError; convert explicitly.\nJSON.stringify throws on BigInt; send it as a string.\nMath methods do not accept BigInt, and division truncates.\nLarge IDs from APIs should arrive as strings, because JSON.parse loses precision first.\nStrong answer mentions the JSON precision trap.',
          [
            E('Predict the output.', 'Checks BigInt and Number mixing.',
              '3n, then TypeError. BigInt division truncates, and mixing BigInt with Number in arithmetic throws.',
              { code: `console.log(10n / 3n);
console.log(1n + 1);` }),
            E('Spot the problem.', 'Checks JSON serialization of BigInt.',
              'It throws TypeError: BigInt cannot be serialized. Convert to string first, e.g. id.toString(), or use a replacer.',
              { code: 'JSON.stringify({ id: 9007199254740993n });' }),
          ]),
      ],
      senior: [
        Q('TypeScript types are removed at build time. How do you check untrusted data at runtime?',
          'Parse data at the edges (API, storage, postMessage) with a schema library like Zod or Valibot, and derive TS types from the schema so they cannot drift.',
          'TS types are erased; a response typed as User can be anything.\nValidate once at the edge, then trust the data inside the app.\nSchemas give inferred types, so checks and types stay in sync.\nDecide the failure policy: throw, fallback, or report to monitoring.\nThink about bundle size and cost for big payloads.\nStrong answer explains "parse, do not validate"; weak answer says TS handles it.',
          [
            E('Spot the problem.', 'Checks that type assertions do not validate.',
              'as User is only a compile-time claim; bad data crashes at runtime. Validate with a schema (Zod, Valibot) or a type guard.',
              { code: `const user = (await res.json()) as User;
user.name.toUpperCase();` }),
            E('Write a type guard for { id: number }.', 'Checks user-defined type predicates.',
              'Return a boolean with an `x is T` predicate after checking shape at runtime.',
              { solution: `function isItem(x: unknown): x is { id: number } {
  return typeof x === 'object' && x !== null &&
    typeof (x as any).id === 'number';
}` }),
          ], { ai: true }),
        Q('Find and fix the bug. This change detector loops forever when the value is NaN.',
          'NaN triple-equals NaN is false, so every check says "changed". Object.is handles NaN and -0 correctly.',
          'Object.is(NaN, NaN) is true; Object.is(0, -0) is false.\nReact uses Object.is to compare state.\nSameValueZero (includes, Map, Set) treats NaN as equal and 0 equal to -0.\nindexOf uses === and cannot find NaN; includes can.\nStrong answer names all three equality algorithms.\nWeak answer adds a special NaN if-branch only.',
          [
            E('Predict the output.', 'Checks NaN equality semantics.',
              'false true true -1. includes uses SameValueZero, indexOf uses ===.',
              { code: 'console.log(NaN === NaN, Object.is(NaN, NaN), [NaN].includes(NaN), [NaN].indexOf(NaN));' }),
            E('Predict the output.', 'Checks Object.is with signed zero.',
              'true false. Object.is distinguishes +0 and -0; React uses Object.is for state comparison.',
              { code: 'console.log(0 === -0, Object.is(0, -0));' }),
          ],
          { code: `function changed(prev, next) { return prev !== next; }\nchanged(NaN, NaN); // true -> endless re-render`, fix: `const changed = (prev, next) => !Object.is(prev, next);` }),
        {
          q: 'Your code mixes up a user ID and an order ID. Both are strings. How can types help? What are branded types?',
          short: 'Structural typing treats all strings the same. A branded type adds a fake tag, like string & { __brand: "UserId" }, so the compiler stops you from passing one ID where another is expected.',
          long: `TypeScript is structural: two types with the same shape are interchangeable, so UserId = string gives no protection.
A brand adds a phantom property that never exists at runtime: type UserId = string & { readonly __brand: 'UserId' }.
You create branded values only in one place, such as a parser or constructor function, after validation.
At runtime nothing changes; the brand is erased, so it costs nothing.
Use cases: IDs, money in cents vs dollars, sanitized HTML, validated emails.
Trade-offs: more ceremony, and casts can bypass it; keep "as UserId" inside one module.
Strong answer: explains structural vs nominal typing and where brands are created. Weak answer: says type aliases already prevent this.`,
          exercises: [
            {
              task: 'Write a branded UserId type and constructor.',
              description: 'Checks branded type syntax.',
              answer: 'Intersect string with a unique brand; only the constructor produces it.',
              solution: `type UserId = string & { readonly __brand: 'UserId' };
const toUserId = (s: string) => s as UserId;`,
            },
            {
              task: 'Predict whether this compiles.',
              description: 'Checks branded types block mix-ups.',
              code: `type OrderId = string & { __brand: 'OrderId' };
declare function load(id: OrderId): void;
load('abc');`,
              answer: 'No. A plain string lacks the brand, so you must go through a validated constructor.',
            },
          ],
        },
      ],
      techlead: [
        Q('You start a new frontend codebase with a mixed team. Do you choose strict TypeScript, JSDoc types, or plain JavaScript? Why?',
          'Default to strict TypeScript for shared, long-lived code. JSDoc with checkJs is a good bridge for legacy or no-build code. Plain JS only for tiny throwaway work.',
          'Consider team skills, codebase lifetime, tooling and hiring.\nStrict mode from day one is cheaper than tightening later.\nJSDoc + // @ts-check gives most benefits without a compile step.\nRuntime validation is still needed at the edges.\nPlan training, lint rules (no-explicit-any) and an escape-hatch policy.\nStrong answer weighs trade-offs with real examples.',
          [
            E('Name two strict flags you enable beyond strict.', 'Checks knowledge of extra TS safety flags.',
              'noUncheckedIndexedAccess and exactOptionalPropertyTypes (also noImplicitOverride). They catch undefined from indexing and optional misuse.'),
            E('Explain how JSDoc gets type checked.', 'Checks JSDoc plus checkJs setup.',
              'With // @ts-check or checkJs, tsc checks JSDoc types in .js files without a build step.',
              { code: `// @ts-check
/** @param {number} a */
const double = (a) => a * 2;` }),
          ], { ai: true }),
        Q('Code review: this money formatting code is used everywhere. What problems do you see? What team rule would you add?',
          'It uses floats for money, hard-codes the symbol, and rounds with toFixed. Store integer cents and format with Intl.NumberFormat.',
          'toFixed rounding surprises people: 1.005.toFixed(2) is "1.00".\nFloat sums collect errors.\nSymbols and separators depend on locale.\nRule: amounts as integer minor units (or decimal strings from the backend) and one formatting helper with Intl.\nAdd tests for rounding and locales; lint against ad-hoc toFixed in money code.\nStrong answer combines the code fix with a team rule.',
          [
            E('Predict the output.', 'Checks float rounding in money math.',
              '0.30000000000000004 "1.00". Binary floats are inexact; store money as integer cents.',
              { code: 'console.log(0.1 + 0.2, (1.005).toFixed(2));' }),
            E('Format 1234.5 USD for German locale.', 'Checks Intl.NumberFormat usage.',
              'Use Intl.NumberFormat with style currency; it gives "1.234,50 $".',
              { solution: `new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'USD' }).format(1234.5);` }),
          ],
          { code: `export const format = (amount) => '$' + (amount * 1.2).toFixed(2);\nconst total = items.reduce((s, i) => s + i.price, 0);`,
            fix: `const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });\nexport const format = (cents) => usd.format(cents / 100);\nconst totalCents = items.reduce((s, i) => s + i.priceCents, 0);` }),
        Q('An API returned the string "0" instead of the number 0. A truthy check passed and caused an incident. How do you run the review and stop this kind of bug?',
          'Run a blameless post-mortem focused on the missing contract. Add schema checks at the API edge, contract tests with the backend, and rules against loose truthy checks on API data.',
          'Timeline, impact, root cause (type contract not enforced), contributing factors (no tests, no alerts).\nActions: schema parsing, types generated from OpenAPI, consumer-driven contract tests.\nPrefer explicit checks (=== 0, != null) over truthiness for numbers.\nAlert on validation failures.\nTrack actions with owners until done.\nStrong answer treats it as a system problem, not a person problem.',
          [
            E('Predict the output.', 'Checks truthiness of strings.',
              'true false false true. Any non-empty string is truthy, including "0" and a space.',
              { code: `console.log(Boolean('0'), Boolean(0), Boolean(''), Boolean(' '));` }),
            E('Name one blameless postmortem rule.', 'Checks incident review culture.',
              'Focus on system gaps, not people: add runtime schema validation at the API boundary and a regression test as action items.',
              { code: '// Incident: count === "0" passed if (count) check' }),
          ], { ai: true }),
      ],
    },
    'Function context': {
      junior: [
        {
          q: 'What does the new keyword do, step by step? What happens to this if you forget new?',
          short: 'new creates an empty object linked to the function prototype, runs the function with this set to that object, and returns it. Without new, a plain function runs with this as undefined in strict mode, or the global object otherwise.',
          long: `Steps of new F(args):
1. Create a new object.
2. Set its prototype to F.prototype.
3. Call F with this bound to the new object.
4. Return the new object, unless F returns another object.
Forgetting new on a constructor function: in sloppy mode this is globalThis, so properties leak to the global object; in strict mode it throws because this is undefined.
Classes protect you: calling a class without new throws a TypeError.
Arrow functions cannot be used with new.
Strong answer: lists the four steps and the class safety check. Weak answer: "new makes a copy of the function".`,
          exercises: [
            {
              task: 'Predict the output.',
              description: 'Checks constructor returning an object.',
              code: `function A() { this.x = 1; return { x: 2 }; }
console.log(new A().x);`,
              answer: '2. If a constructor returns an object, new returns that object instead of this.',
            },
            {
              task: 'Predict what happens.',
              description: 'Checks calling a class without new.',
              code: `class User { constructor() { this.n = 1; } }
User();`,
              answer: 'TypeError: class constructors cannot be invoked without new. Unlike old functions, classes enforce new.',
            },
          ],
        },
        Q('Find and fix the bug. The counter does not increase after one second.',
          'The method is passed to setTimeout without its object, so this is not counter. Use an arrow wrapper or bind.',
          'setTimeout calls the function as a plain function.\nInside, this is not counter (globalThis in browsers for timers in sloppy mode, or undefined in strict class code).\nFix 1: setTimeout(() => counter.inc(), 1000).\nFix 2: setTimeout(counter.inc.bind(counter), 1000).\nThe same bug happens with event listeners and array callbacks.\nStrong answer explains why the call site matters.',
          [
            E('Fix the bug.', 'Checks this in setTimeout callback.',
              `A regular function callback has this as undefined/globalThis; use an arrow to keep the method's this.`,
              { code: `const timer = { s: 0, start() {
  setTimeout(function () { this.s++; }, 1000);
} };`, solution: 'setTimeout(() => { this.s++; }, 1000);' }),
            E('Predict the output.', 'Checks lost this when passing a method.',
              '1 undefined (in strict mode/module). Detaching the method loses the receiver.',
              { code: `const o = { n: 1, get() { return this?.n; } };
const g = o.get;
console.log(o.get(), g());` }),
          ],
          { code: `const counter = {\n  count: 0,\n  inc() { this.count++; },\n};\nsetTimeout(counter.inc, 1000);`,
            fix: `setTimeout(() => counter.inc(), 1000);\n// or\nsetTimeout(counter.inc.bind(counter), 1000);` }),
        Q('Inside an event listener, what is this? Does it change with an arrow function?',
          'In a normal function listener, this is the element the listener is attached to (event.currentTarget). In an arrow function, this comes from the outer scope.',
          'element.addEventListener("click", function () { this }) gives the element.\nWith an arrow, this is whatever this was outside (often undefined in a module).\nevent.currentTarget is clearer and works in both cases.\nevent.target can be a child element, not the listener element.\nStrong answer recommends currentTarget; weak answer says this is always the clicked element.',
          [
            E('Predict the output when the button is clicked.', 'Checks this and currentTarget in listeners.',
              'true. In a regular function listener, this is the element the listener is attached to.',
              { code: `btn.addEventListener('click', function (e) {
  console.log(this === e.currentTarget);
});` }),
            E('Predict the output when the button is clicked.', 'Checks arrow function this in listeners.',
              'undefined. Arrows take this from the enclosing scope, which is undefined at module top level; use e.currentTarget.',
              { code: `// module code
btn.addEventListener('click', () => console.log(this));` }),
          ]),
      ],
      middle: [
        Q('Compare a class method and an arrow function class field. What are the trade-offs?',
          'A class method lives once on the prototype and needs binding when passed around. An arrow field is created per instance, is always bound, but uses more memory and is not on the prototype.',
          'Methods are shared; arrow fields are copied into each instance.\nArrow fields cannot be overridden with super.method() in subclasses in the normal way.\nArrow fields are hard to spy on via the prototype in tests.\nFor many instances (thousands of rows) arrow fields cost memory.\nFor a few UI objects the convenience is often worth it.\nStrong answer names inheritance and testing effects, not only memory.',
          [
            E('Predict the output.', 'Checks arrow fields live on instances.',
              'true false. Methods are shared on the prototype; arrow fields are created per instance.',
              { code: `class A { m() {} f = () => {}; }
const a = new A(), b = new A();
console.log(a.m === b.m, a.f === b.f);` }),
            E('Spot the problem.', 'Checks super calls with arrow fields.',
              'super.f is undefined because f is an instance field, not on A.prototype, so it throws. Use prototype methods for overridable behavior.',
              { code: `class A { f = () => 'A'; }
class B extends A { f = () => super.f() + 'B'; }` }),
          ], { ai: true }),
        {
          q: 'Find and fix the bug. Method chaining throws "Cannot read properties of undefined".',
          code: `class Query {
  constructor() { this.parts = []; }
  where(cond) { this.parts.push('WHERE ' + cond); }
  limit(n) { this.parts.push('LIMIT ' + n); return this; }
  build() { return this.parts.join(' '); }
}
new Query().where('a = 1').limit(10).build();`,
          short: 'where does not return anything, so the next call runs on undefined. Every chainable method must return this.',
          long: `A fluent API works because each method returns the same object (this).
If one method forgets "return this", the chain gets undefined and the next call throws.
An arrow function class field also works with return this, because this is the instance.
Alternative design: return a new object each time (immutable builder), which is safer when builders are shared.
Add a unit test that chains every method, or a TypeScript return type of this, to catch it.
Strong answer: fixes it and mentions the "this" return type or immutable builders. Weak answer: splits the chain into separate lines without understanding why.`,
          fix: `class Query {
  constructor() { this.parts = []; }
  where(cond) { this.parts.push('WHERE ' + cond); return this; }
  limit(n) { this.parts.push('LIMIT ' + n); return this; }
  build() { return this.parts.join(' '); }
}`,
          follow: 'How would you make this builder immutable, so one base query can be reused?',
          exercises: [
            {
              task: 'Fix the bug.',
              description: 'Checks returning this for chaining.',
              code: `class Q { where(c) { this.c = c; }
  limit(n) { this.n = n; return this; } }
new Q().where('a').limit(5);`,
              answer: 'where returns undefined, so .limit fails; return this from every chainable method.',
              solution: 'where(c) { this.c = c; return this; }',
            },
            {
              task: 'Predict the output.',
              description: 'Checks arrow methods on object literals.',
              code: `const o = { v: 1, inc: () => { this.v++; return this; } };
console.log(o.inc() === o);`,
              answer: 'Throws or false: arrow this is the outer scope, not o. Use method shorthand inc() { ... }.',
            },
          ],
        },
        Q('What is this at the top level of a module, a script, and a function in strict mode?',
          'At the top of an ES module, this is undefined. At the top of a classic script, it is globalThis (window). In a strict-mode plain function call, it is undefined.',
          'ES modules and class bodies are always strict.\nClassic scripts without "use strict" use sloppy mode: plain calls get globalThis.\nIn CommonJS (Node), top-level this is module.exports.\nUse globalThis when you need the global object everywhere.\nThis matters when moving old scripts to modules: code using this as window breaks.\nStrong answer covers modules versus scripts.',
          [
            E('Predict the output in a classic script.', 'Checks top-level this in scripts.',
              'true. Top-level this in a classic script is globalThis (window).',
              { code: '<script>console.log(this === window);</script>' }),
            E('Predict the output.', 'Checks this in sloppy vs strict functions.',
              'true undefined (in a classic script). Sloppy functions default this to globalThis; strict ones leave it undefined.',
              { code: `function a() { return this; }
function b() { 'use strict'; return this; }
console.log(a() === globalThis, b());` }),
          ]),
      ],
      senior: [
        Q('Find and fix the bug. The listener is never removed, and memory grows.',
          'bind creates a new function every time, so removeEventListener gets a different reference. Store the bound function once, or use an AbortController signal.',
          'removeEventListener needs the same function reference and the same capture flag.\nEach .bind(this) call returns a new function.\nStore it in a field, or use an arrow class field.\nModern option: addEventListener(type, fn, { signal }) and controller.abort() removes all at once.\nLeaked listeners keep components alive and cause duplicate handlers.\nStrong answer mentions AbortController and the capture flag.',
          [
            E('Fix the bug.', 'Checks bind creating new references.',
              'Each bind returns a new function, so remove does nothing; store the bound reference once.',
              { code: `el.addEventListener('click', this.onClick.bind(this));
el.removeEventListener('click', this.onClick.bind(this));`, solution: `this.handler = this.onClick.bind(this);
el.addEventListener('click', this.handler);
el.removeEventListener('click', this.handler);` }),
            E('Remove many listeners in one call.', 'Checks AbortController signal for listeners.',
              'Pass an AbortController signal to each addEventListener and call abort() to remove them all.',
              { solution: `const ac = new AbortController();
window.addEventListener('resize', onResize, { signal: ac.signal });
ac.abort();` }),
          ],
          { code: `class Widget {\n  mount() { window.addEventListener('resize', this.onResize.bind(this)); }\n  unmount() { window.removeEventListener('resize', this.onResize.bind(this)); }\n  onResize() { this.layout(); }\n}`,
            fix: `class Widget {\n  onResize = () => this.layout();\n  mount() { window.addEventListener('resize', this.onResize); }\n  unmount() { window.removeEventListener('resize', this.onResize); }\n}` }),
        Q('How do this and super work in static methods and in inherited classes?',
          'In a static method, this is the class it was called on, so a subclass call gets the subclass. super is fixed by where the method is defined (its home object), not by this.',
          'static create() { return new this(); } returns a subclass instance when called as Child.create().\nsuper looks up the prototype of the home object, which is set at definition time.\nCopying a method to another object keeps the old super binding.\nIn derived constructors, this is not available until super() is called (ReferenceError).\nArrow functions inside methods take both this and super from the method.\nStrong answer explains the home object idea.',
          [
            E('Predict the output.', 'Checks this in inherited static methods.',
              'true. In a static method this is the class it was called on, so B.create builds a B.',
              { code: `class A { static create() { return new this(); } }
class B extends A {}
console.log(B.create() instanceof B);` }),
            E('Fix the bug.', 'Checks this before super in derived constructors.',
              'Accessing this before super() throws ReferenceError; call super first.',
              { code: `class B extends A {
  constructor() { this.x = 1; super(); }
}`, solution: 'constructor() { super(); this.x = 1; }' }),
          ]),
        Q('What does Reflect.get with a receiver do? How does it relate to this in getters and Proxies?',
          'The receiver is the value used as this when a getter runs. In a Proxy get trap, pass receiver to Reflect.get so getters see the proxy, not the raw target.',
          'Reflect.get(target, key, receiver) runs getters with this = receiver.\nIf a trap returns target[key], getters run with this = target and skip the proxy.\nThis breaks reactivity systems (like Vue) and logging proxies for nested access.\nPrivate #fields do not work through a Proxy: methods that read #x with this = proxy throw TypeError.\nCommon fix: bind methods to the target or avoid proxies for classes with private fields.\nStrong answer mentions the private field trap.',
          [
            E('Predict the output.', 'Checks receiver argument in Reflect.get.',
              '"r". The receiver becomes this inside the getter.',
              { code: `const o = { get full() { return this.name; }, name: 'o' };
console.log(Reflect.get(o, 'full', { name: 'r' }));` }),
            E('Fix the Proxy get trap.', 'Checks forwarding receiver in Proxy traps.',
              't[k] runs getters with this = target, bypassing the proxy; forward the receiver with Reflect.get.',
              { code: `const p = new Proxy(target, {
  get(t, k, r) { return t[k]; }
});`, solution: 'get(t, k, r) { return Reflect.get(t, k, r); }' }),
          ], { ai: true }),
      ],
      techlead: [
        {
          q: 'Your team uses TypeScript. How can the compiler and the linter catch this bugs? Which settings do you turn on?',
          short: 'Turn on strict (it includes noImplicitThis), type the this parameter where needed, and add lint rules like @typescript-eslint/unbound-method and no-invalid-this.',
          long: `noImplicitThis (part of strict) errors when this has an implicit any type.
A fake first parameter "this: Foo" documents and checks what this must be; it is removed in the output.
@typescript-eslint/unbound-method flags passing obj.method as a value when the method uses this.
ThisParameterType and OmitThisParameter help when wrapping functions.
Prefer APIs that do not need this (closures, arrow fields) for callbacks in shared code.
Roll out: enable rules as warnings, fix hot spots, then make them errors in CI.
Strong answer: names concrete flags and rules and a rollout plan. Weak answer: "TypeScript solves this automatically".`,
          exercises: [
            {
              task: 'Name the tsconfig flag that catches implicit this.',
              description: 'Checks noImplicitThis knowledge.',
              code: 'function f() { return this.x; }',
              answer: 'noImplicitThis (part of strict) errors when this has an implicit any type.',
            },
            {
              task: 'Name a lint rule catching unbound method references.',
              description: 'Checks typescript-eslint unbound-method rule.',
              code: `const { save } = store;
button.onclick = save;`,
              answer: '@typescript-eslint/unbound-method flags passing class methods without binding. Fix with an arrow wrapper or bind.',
            },
          ],
        },
        {
          q: 'Many new team members come from Java or C#. How do you explain this in JavaScript so they avoid common bugs?',
          short: 'Explain that this is set by the call, not by the class. Show the four rules, then the common traps: detached methods, callbacks and arrow functions. Back it with lint rules and examples.',
          long: `In Java and C#, this always means the current instance. In JavaScript, a normal function gets this from how it is called.
Teach the rules in order: new, explicit (call, apply, bind), method call (obj.fn()), plain call.
Arrow functions have no own this; they use the outer one.
Show the classic traps with small runnable examples: passing obj.method to setTimeout, callbacks inside methods, listener removal with bind.
Give clear defaults: arrow functions for callbacks, arrow fields or bind for handlers, avoid this in utilities.
Use code review checklists and lint rules so the knowledge is enforced, not just taught.
Strong answer: maps the mental model from their language and uses practice. Weak answer: "just tell them to always use arrow functions".`,
          exercises: [
            {
              task: 'Predict the output.',
              description: 'Checks call-site this versus Java intuition.',
              code: `class C { n = 1; get() { return this.n; } }
const f = new C().get;
try { f(); } catch { console.log('err'); }`,
              answer: '"err". this depends on how the function is called, not where it is defined; class bodies are strict.',
            },
            {
              task: 'Name three rules for this.',
              description: 'Checks summary of this binding rules.',
              code: 'obj.m(); m(); new M(); m.call(x);',
              answer: 'Method call: object before the dot; plain call: undefined; new: fresh object; call/apply/bind set it explicitly. Arrows inherit.',
            },
          ],
        },
        Q('Code review: find the this-related bugs in this plugin system and propose a safer design.',
          'Hooks are stored and called detached, so this is lost, and the bind in register creates references that cannot be removed. Pass context as an argument instead of relying on this.',
          'Calling hook() from an array loses the plugin object.\nExplicit context argument (hook(ctx)) is clearer and easier to type.\nReturn an unregister function from register so callers do not need the reference.\nCatch errors per hook so one plugin cannot break others.\nDocument the contract in types.\nStrong answer combines bug fix and API improvement.',
          [
            E('Spot the problem.', 'Checks plugin callbacks losing context.',
              'p.init is passed unbound, so this inside init is undefined. Use () => p.init() or pass a context argument.',
              { code: `plugins.forEach(p => hooks.on('init', p.init));` }),
            E('Propose a safer plugin shape.', 'Checks this-free plugin design.',
              'Use factory functions receiving a context: init(ctx) { ctx.ready = true }. No reliance on this.',
              { code: 'const plugin = { init() { this.ready = true; } };', solution: 'const plugin = (ctx) => ({ init() { ctx.ready = true; } });' }),
          ],
          { code: `const hooks = [];\nexport function register(plugin) { hooks.push(plugin.onSave.bind(plugin)); }\nexport function unregister(plugin) { hooks.splice(hooks.indexOf(plugin.onSave), 1); }\nexport function run() { hooks.forEach((h) => h()); }`,
            fix: `const hooks = new Set();\nexport function register(fn) { hooks.add(fn); return () => hooks.delete(fn); }\nexport function run(ctx) { for (const fn of hooks) { try { fn(ctx); } catch (e) { report(e); } } }` }),
      ],
    },
    'Scope and Closures': {
      junior: [
        Q('What is the difference between var, let and const in scope and reassignment?',
          'var is function-scoped and can be redeclared. let and const are block-scoped. const cannot be reassigned, but the object it points to can still change.',
          'var leaks out of if and for blocks; let and const stay in the block.\nvar is hoisted and set to undefined; let and const are hoisted but in the TDZ until declared.\nTop-level var in a classic script becomes a property of window; let and const do not.\nconst obj = {}; obj.a = 1 works; obj = {} throws.\nUse const by default, let when you reassign, avoid var.\nStrong answer explains const is about the binding, not the value.',
          [
            E('Predict the output.', 'Checks block scope of let vs var.',
              '"number" "undefined". var is function-scoped; let is block-scoped.',
              { code: `{ var a = 1; let b = 2; }
console.log(typeof a, typeof b);` }),
            E('Predict what happens.', 'Checks const with object mutation.',
              'user.n = 2 works; user = {} throws TypeError. const prevents rebinding, not mutation.',
              { code: `const user = { n: 1 };
user.n = 2;
user = {};` }),
          ]),
        Q('Find and fix the bug. The function always returns the default name.',
          'The inner let creates a new variable that shadows the outer one, so the outer name is never changed. Assign to the outer variable instead.',
          'Declaring a variable with the same name in an inner block hides the outer one (shadowing).\nThe inner name is gone after the block ends.\nFix: remove let inside the block and assign to the outer variable.\nLinters catch this with no-shadow.\nStrong answer names shadowing and mentions the lint rule.\nWeak answer moves code around without explaining.',
          [
            E('Fix the bug.', 'Checks shadowing with let in blocks.',
              'The inner let creates a new block variable; assign the outer one instead.',
              { code: `function getName(u) {
  let name = 'Guest';
  if (u) { let name = u.name; }
  return name;
}`, solution: 'if (u) { name = u.name; }' }),
            E('Predict the output.', 'Checks || versus ?? defaults.',
              '"Guest" "". || replaces any falsy value; ?? replaces only null and undefined.',
              { code: `const n = '';
console.log(n || 'Guest', n ?? 'Guest');` }),
          ],
          { code: `function getName(user) {\n  let name = 'Guest';\n  if (user) {\n    let name = user.name;\n  }\n  return name;\n}`,
            fix: `function getName(user) {\n  let name = 'Guest';\n  if (user) {\n    name = user.name;\n  }\n  return name;\n}` }),
        Q('What is hoisting? Why can you call a function declaration before it is written, but not a function expression?',
          'Declarations are processed before code runs. Function declarations are hoisted with their body. A const or let function expression is in the TDZ, and a var one is undefined.',
          'function f() {} is fully available at the top of its scope.\nconst f = () => {} throws ReferenceError if called before the line.\nvar f = function () {} gives TypeError: f is not a function, because f is undefined.\nClasses are hoisted like let (TDZ).\nStrong answer explains all three error types.\nWeak answer says "JavaScript moves code to the top".',
          [
            E('Predict the output.', 'Checks var hoisting with undefined.',
              'undefined. The var declaration is hoisted and initialized to undefined; the assignment stays in place.',
              { code: `console.log(x);
var x = 5;` }),
            E('Predict what happens.', 'Checks function expression hoisting.',
              'ReferenceError: greet is in the temporal dead zone until the const line runs.',
              { code: `greet();
const greet = () => 'hi';` }),
          ]),
      ],
      middle: [
        Q('How can you create private state with closures? Compare it to private class fields.',
          'A factory function keeps variables in its scope and returns functions that use them. Nothing outside can read them. Private #fields give similar privacy inside classes.',
          'Closure privacy is real: no reflection can read local variables.\n#fields are also truly private, checked by the engine.\nClosures create new functions per instance; class methods are shared on the prototype.\n#fields support brand checks (#x in obj).\nConvention-only privacy (_name) is not private.\nStrong answer compares memory, inheritance and testing.',
          [
            E('Write a counter with private state using closure.', 'Checks closure-based encapsulation.',
              'Keep count in the factory scope and expose only methods.',
              { solution: `function counter() {
  let n = 0;
  return { inc: () => ++n, get: () => n };
}` }),
            E('Predict what happens.', 'Checks private field access outside class.',
              'SyntaxError. #private fields are only accessible inside the class body; use #n in obj checks inside it.',
              { code: `class C { #n = 1; }
console.log(new C().#n);` }),
          ]),
        Q('Find and fix the bug. Two counters share the same count.',
          'count is declared outside the factory, so every counter closes over the same variable. Move it inside the factory so each call gets its own.',
          'A closure captures variables, not copies of values.\nIf the variable is in module scope, it is shared by all functions.\nEach function call creates a new scope; put per-instance state there.\nThe same bug appears with module-level caches shared between components.\nStrong answer explains "closures capture variables by reference".',
          [
            E('Fix the bug.', 'Checks shared outer state between instances.',
              'count lives outside the factory, so all counters share it; move it inside.',
              { code: `let count = 0;
function makeCounter() { return () => ++count; }`, solution: 'function makeCounter() { let count = 0; return () => ++count; }' }),
            E('Predict the output.', 'Checks independent closures per call.',
              '1 2 1. Each call to mk creates a new scope with its own n.',
              { code: `const mk = () => { let n = 0; return () => ++n; };
const a = mk(), b = mk();
console.log(a(), a(), b());` }),
          ],
          { code: `let count = 0;\nfunction createCounter() {\n  return { inc: () => ++count };\n}\nconst a = createCounter();\nconst b = createCounter();`,
            fix: `function createCounter() {\n  let count = 0;\n  return { inc: () => ++count };\n}` }),
        Q('What is an IIFE? Do we still need it with modules and block scope?',
          'An IIFE is a function called right after it is defined, to create a private scope. Modules and let/const cover most uses today, but it is still used for async start-up code or inline scripts.',
          'Pattern: (function () { ... })(); or (() => { ... })();\nHistory: avoided globals before modules existed.\nModules give file scope; blocks { } give scope for let and const.\nModern use: (async () => { await init(); })() where top-level await is not available.\nA leading semicolon protects against ASI issues when files are concatenated.\nStrong answer knows why it was needed and what replaced it.',
          [
            E('Rewrite this IIFE using a block.', 'Checks block scope replacing IIFE.',
              'Use a block with let/const; modules already give file scope.',
              { code: '(function () { var tmp = load(); use(tmp); })();', solution: '{ const tmp = load(); use(tmp); }' }),
            E('Name one modern use of an async IIFE.', 'Checks async IIFE use cases.',
              'Running await where the callback cannot be async, like useEffect, or scripts without top-level await.',
              { code: 'useEffect(() => { (async () => { setData(await load()); })(); }, []);' }),
          ]),
      ],
      senior: [
        Q('Why can a closure keep a large object in memory even if it does not use it? How do engines share closure scopes?',
          'In V8, all closures created in the same scope share one context object. If any closure uses a big variable, the context holds it, and every closure keeps it alive.',
          'Only variables used by some inner function are put in the context.\nBut the context is shared by all inner functions of that scope.\nA small long-lived callback can then retain big data used by another short-lived one.\nFix: set the big variable to null when done, or move work into a separate function.\nUse heap snapshots and look at "context" in retainers.\nStrong answer can read a retainer path; weak answer says closures copy everything.',
          [
            E('Spot the problem.', 'Checks shared closure scope retention.',
              'Engines often share one context per scope; since a captured big, keep may retain big too. Null out big or split scopes.',
              { code: `function f() { const big = new Array(1e6);
  const a = () => big.length; return () => 1; }
const keep = f();` }),
            E('Fix the leak.', 'Checks releasing captured data in closures.',
              'The handler keeps all of data alive; capture only what is needed.',
              { code: `function setup(data) {
  el.onclick = () => console.log(data.items.length);
}`, solution: `function setup(data) {
  const n = data.items.length;
  el.onclick = () => console.log(n);
}` }),
          ], { ai: true }),
        Q('Find and fix the bug. This memoized selector returns stale data after filters change.',
          'The cache key uses only the list, but the closure also reads filter from outer scope. When filter changes, the old result is returned. Include every input in the key.',
          'Memoization is only correct if the result depends only on the key.\nReading outer variables makes hidden inputs.\nFix: pass all inputs as arguments and compare all of them.\nThe same bug exists in useMemo with missing dependencies.\nLint rules (react-hooks/exhaustive-deps) catch some cases.\nStrong answer names "hidden dependency" as the root cause.',
          [
            E('Fix the bug.', 'Checks useMemo missing dependencies.',
              'filter is missing from the dependency array, so the memo is stale; add it.',
              { code: `const visible = useMemo(
  () => items.filter(i => i.type === filter), [items]);`, solution: `const visible = useMemo(
  () => items.filter(i => i.type === filter), [items, filter]);` }),
            E('Spot the problem.', 'Checks single-key memoization by reference.',
              'State was mutated in place, so the reference is equal and stale res is returned. Update immutably.',
              { code: `let last, res;
const sel = (s) => s === last ? res : (last = s, res = calc(s));
state.list.push(x); sel(state);` }),
          ],
          { code: `let filter = 'all';\nlet lastList, lastResult;\nfunction select(list) {\n  if (list === lastList) return lastResult;\n  lastList = list;\n  return (lastResult = list.filter((i) => filter === 'all' || i.status === filter));\n}`,
            fix: `const select = memoizeLast((list, filter) =>\n  list.filter((i) => filter === 'all' || i.status === filter));\nselect(list, filter);` }),
        Q('How does a module scope differ from a closure? What problems can module-level state cause?',
          'A module is evaluated once and its top-level variables are shared by every importer. It works like one big closure, a singleton. Hidden shared state makes tests and SSR unreliable.',
          'ES modules are cached by URL; all importers get the same instance.\nModule-level caches leak between tests unless reset.\nOn a server (SSR), module state is shared between users\' requests.\nHMR can keep or duplicate state in odd ways.\nPrefer explicit instances (createStore()) passed via context or DI.\nStrong answer mentions SSR data leaks between users.',
          [
            E('Predict the output.', 'Checks module singletons across imports.',
              '1. Imports are live bindings to the single module instance.',
              { code: `// counter.js: export let n = 0; export const inc = () => n++;
import { n, inc } from './counter.js';
inc(); console.log(n);` }),
            E('Spot the problem.', 'Checks module state leaking between tests.',
              'Module state persists across tests in one worker, causing order-dependent tests. Expose a reset or inject the cache.',
              { code: `const cache = new Map();
export const get = (k) => cache.get(k);` }),
          ]),
      ],
      techlead: [
        Q('Code review: this server-rendered app stores the current user in a module variable. What is wrong, and what rule do you set?',
          'Module state is shared by all requests on the server, so one user can see another user\'s data. Keep request data in request-scoped storage, like AsyncLocalStorage or framework context.',
          'Node handles many requests in one process; module variables are global for all of them.\nWith async code, requests interleave, so the variable changes mid-render.\nThis is a security incident (data leak), not only a bug.\nFix: pass user through context or use AsyncLocalStorage.\nRule: no mutable module-level state in code that runs on the server; lint or review checklist.\nStrong answer treats it as a security issue and adds a test.',
          [
            E('Spot the problem.', 'Checks module state on SSR servers.',
              `The server module is shared by all requests, so users can see each other's data. Use per-request context.`,
              { code: `let currentUser;
export const setUser = (u) => { currentUser = u; };` }),
            E('Name a per-request storage tool in Node.', 'Checks AsyncLocalStorage for request context.',
              `AsyncLocalStorage from node:async_hooks scopes data to one request's async chain.`,
              { code: 'als.run({ user }, () => handle(req));' }),
          ],
          { code: `let currentUser = null;\nexport function setUser(u) { currentUser = u; }\nexport function renderHeader() { return '<b>' + currentUser.name + '</b>'; }`,
            fix: `export function renderHeader(ctx) { return '<b>' + escapeHtml(ctx.user.name) + '</b>'; }\n// or read the user from AsyncLocalStorage per request` }),
        Q('How do you teach closures and scope to junior developers so they avoid common bugs?',
          'Use small runnable examples of real bugs (stale closures, loop variables, shadowing), pair on code review, and back it up with lint rules. Focus on mental models, not definitions.',
          'Start with "functions remember where they were created".\nShow real bugs from your own codebase.\nUse DevTools scope panel to make closures visible.\nLint: no-shadow, no-var, react-hooks/exhaustive-deps.\nFollow up in code review with links to a short guide.\nStrong answer has concrete examples from mentoring experience.',
          [
            E('Predict the output.', 'Checks closures over loop variables with var.',
              '[3, 3, 3]. One shared var i; use let for a fresh binding per iteration.',
              { code: `const fns = [];
for (var i = 0; i < 3; i++) fns.push(() => i);
console.log(fns.map(f => f()));` }),
            E('Explain a stale closure in React.', 'Checks stale state in interval callbacks.',
              'The callback captures count = 0 forever. Use setCount(c => c + 1) and clear the interval.',
              { code: `useEffect(() => {
  setInterval(() => setCount(count + 1), 1000);
}, []);` }),
          ], { ai: true }),
        Q('Code review: a feature flag helper keeps flags in a closure and never refreshes them. What risks do you see and how do you fix it?',
          'Flags are read once and captured forever, so changes or kill switches never reach running tabs. Read flags through a function on each use, and subscribe to updates.',
          'Capturing a value at module load makes a snapshot, not a live value.\nKill switches are useless if clients never refresh.\nFix: getFlag(name) reads from a store that updates (polling, SSE, or on focus).\nDecide consistency: flags may need to stay stable during one user flow.\nAdd telemetry for which flag values clients use.\nStrong answer balances freshness with stability.',
          [
            E('Spot the problem.', 'Checks stale config captured once.',
              'Flags are loaded once and never refresh, so rollbacks do not apply. Add TTL refresh or a subscription.',
              { code: `const flags = await fetchFlags();
export const isOn = (k) => flags[k];` }),
            E('Fix the helper to refresh flags.', 'Checks TTL-based cache refresh.',
              'Refetch when the cached copy is older than a TTL.',
              { code: `let flags, at = 0;
export async function isOn(k) { return flags[k]; }`, solution: `export async function isOn(k) {
  if (Date.now() - at > 60_000) { flags = await fetchFlags(); at = Date.now(); }
  return flags[k];
}` }),
          ],
          { code: `const flags = await fetch('/flags').then((r) => r.json());\nexport const isOn = (name) => flags[name];`,
            fix: `let flags = {};\nexport const isOn = (name) => Boolean(flags[name]);\nexport async function refreshFlags() { flags = await fetch('/flags').then((r) => r.json()); }\nsetInterval(refreshFlags, 60_000);` }),
      ],
    },
    'Asynchronous code': {
      junior: [
        {
          q: 'Find and fix the bug. The numbers should print one per second, but they all print at once.',
          code: `for (let i = 1; i <= 3; i++) {
  setTimeout(() => console.log(i), 1000);
}`,
          short: 'All three timers are started at the same moment with the same delay, so they fire together after one second. Use different delays, or await a sleep inside the loop.',
          long: `setTimeout does not pause the loop. The loop finishes right away and schedules three timers.
Each timer counts from the moment it was created, so all end at about 1000 ms.
Fix 1: delay i * 1000.
Fix 2: write a sleep helper that returns a promise and await it in an async loop.
The await version is easier to stop and keeps steps in order.
Strong answer: explains that timers do not block. Weak answer: thinks setTimeout waits like sleep in other languages.`,
          fix: `const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 1; i <= 3; i++) {
  await sleep(1000);
  console.log(i);
}`,
          follow: 'How would you stop this loop early if the user leaves the page?',
          exercises: [
            {
              task: 'Fix the bug.',
              description: 'Checks sequential delays with await.',
              code: `const sleep = (ms) => new Promise(r => setTimeout(r, ms));
[1, 2, 3].forEach(async n => { await sleep(1000); console.log(n); });`,
              answer: 'forEach does not await callbacks, so all run in parallel; use for...of.',
              solution: 'for (const n of [1, 2, 3]) { await sleep(1000); console.log(n); }',
            },
            {
              task: 'Predict the output order.',
              description: 'Checks microtask versus macrotask ordering.',
              code: `setTimeout(() => console.log('t'));
Promise.resolve().then(() => console.log('p'));
console.log('s');`,
              answer: 's p t. Sync code first, then microtasks, then timers.',
            },
          ],
        },
        Q('Find and fix the bug. The check is always true, even when the user is not an admin.',
          'isAdmin is async, so it returns a Promise. A Promise object is always truthy. Await the result.',
          'Every async function returns a Promise.\nif (promise) is always true.\nFix: if (await isAdmin(user)) inside an async function.\nTypeScript and the lint rule no-misused-promises catch this.\nThe same bug happens with filter(async ...) which keeps every item.\nStrong answer mentions the lint rule and the filter trap.',
          [
            E('Fix the bug.', 'Checks forgotten await on async checks.',
              'An unawaited async call returns a Promise, which is always truthy; await it.',
              { code: `async function isAdmin() { return false; }
if (isAdmin()) showPanel();`, solution: 'if (await isAdmin()) showPanel();' }),
            E('Name a lint rule catching this.', 'Checks no-misused-promises awareness.',
              '@typescript-eslint/no-misused-promises (and no-floating-promises) flags promises in conditions.',
              { code: 'if (checkAccess()) grant();' }),
          ],
          { code: `async function isAdmin(user) {\n  const r = await fetch('/api/roles/' + user.id);\n  return (await r.json()).admin;\n}\nif (isAdmin(user)) showAdminPanel();`,
            fix: `if (await isAdmin(user)) showAdminPanel();` }),
        Q('Does fetch reject when the server returns error 404 or 500? How do you handle errors with fetch?',
          'No. fetch rejects only on network errors or abort. For 404 or 500 it resolves, so you must check response.ok or response.status.',
          'fetch resolves with a Response for any HTTP status.\nresponse.ok is true for status 200 to 299.\nThrow your own error when ok is false.\nresponse.json() can also reject if the body is not valid JSON.\nWrap it in a small helper used by the whole app.\nStrong answer knows about ok; weak answer only uses catch.',
          [
            E('Fix the error handling.', 'Checks res.ok after fetch.',
              'fetch resolves on 404/500; check res.ok and throw.',
              { code: `const data = await fetch('/api').then(r => r.json());`, solution: `const r = await fetch('/api');
if (!r.ok) throw new Error(\`HTTP \${r.status}\`);
const data = await r.json();` }),
            E('Name when fetch actually rejects.', 'Checks fetch rejection causes.',
              'On network failure, CORS block, or abort (TypeError or AbortError), not on HTTP error status codes.',
              { code: 'fetch(url).catch(e => console.log(e.name));' }),
          ]),
      ],
      middle: [
        Q('Find and fix the bug. In a search box, old results sometimes replace new ones.',
          'Requests can finish in any order, so a slow old response overwrites a fast new one. Cancel the previous request with AbortController, or ignore stale responses.',
          'This is a race condition between overlapping requests.\nAbortController cancels the old fetch; it rejects with an AbortError, which you should ignore.\nAlternative: keep a request id and only apply the latest.\nAdd debounce to send fewer requests.\nLibraries like TanStack Query handle this per query key.\nStrong answer handles AbortError separately from real errors.',
          [
            E('Fix the race with AbortController.', 'Checks cancelling stale search requests.',
              'Abort the previous request before starting a new one.',
              { code: `input.oninput = async () => {
  show(await (await fetch(\`/s?q=\${input.value}\`)).json());
};`, solution: `let ac;
input.oninput = async () => {
  ac?.abort(); ac = new AbortController();
  const r = await fetch(\`/s?q=\${input.value}\`, { signal: ac.signal });
  show(await r.json());
};` }),
            E('Fix the race in this React effect.', 'Checks ignore flag cleanup in effects.',
              'Ignore results after cleanup so older responses cannot overwrite newer ones.',
              { code: `useEffect(() => {
  search(q).then(setResults);
}, [q]);`, solution: `useEffect(() => {
  let live = true;
  search(q).then(r => live && setResults(r));
  return () => { live = false; };
}, [q]);` }),
          ],
          { code: `input.addEventListener('input', async (e) => {\n  const res = await fetch('/search?q=' + e.target.value);\n  render(await res.json());\n});`,
            fix: `let controller;\ninput.addEventListener('input', async (e) => {\n  controller?.abort();\n  controller = new AbortController();\n  try {\n    const res = await fetch('/search?q=' + encodeURIComponent(e.target.value), { signal: controller.signal });\n    render(await res.json());\n  } catch (err) {\n    if (err.name !== 'AbortError') showError(err);\n  }\n});` }),
        Q('How do you add a timeout to a fetch request?',
          'Use AbortSignal.timeout(ms) as the signal. To also support manual cancel, combine signals with AbortSignal.any.',
          'fetch(url, { signal: AbortSignal.timeout(5000) }) rejects with a TimeoutError DOMException.\nManual abort gives AbortError, so you can tell them apart.\nAbortSignal.any([userSignal, AbortSignal.timeout(5000)]) combines both (supported in modern browsers).\nPromise.race with a timer does not stop the request; it only ignores it.\nStrong answer knows race does not cancel.',
          [
            E('Add a 5 second timeout in one line.', 'Checks AbortSignal.timeout usage.',
              'Pass AbortSignal.timeout(5000); it rejects with a TimeoutError DOMException.',
              { code: 'const r = await fetch(url);', solution: 'const r = await fetch(url, { signal: AbortSignal.timeout(5000) });' }),
            E('Combine user cancel with a timeout.', 'Checks AbortSignal.any combination.',
              'AbortSignal.any aborts when either signal aborts.',
              { code: 'const ac = new AbortController();', solution: 'fetch(url, { signal: AbortSignal.any([ac.signal, AbortSignal.timeout(5000)]) });' }),
          ]),
        Q('Find and fix the bug. The error is not caught by try and catch.',
          'The error is thrown inside a setTimeout callback, which runs later, after try finished. Wrap the timer in a Promise and await it, or catch inside the callback.',
          'try and catch only catch errors thrown while the try block is running.\nCallbacks run in a later task with a new call stack.\nPromisify the timer: await new Promise((r) => setTimeout(r, ms)), then do the work.\nThe same applies to event listeners.\nGlobal handlers (window.onerror) catch it, but too late for local handling.\nStrong answer explains the call stack reason.',
          [
            E('Fix the bug.', 'Checks returning vs awaiting in try.',
              'Without await, the rejection happens after try exits; use return await.',
              { code: `async function load() {
  try { return fetchData(); } catch { return null; }
}`, solution: 'try { return await fetchData(); } catch { return null; }' }),
            E('Predict whether catch runs.', 'Checks errors thrown in timers.',
              'No. The callback runs later on a new stack, after try has finished; the error is uncaught.',
              { code: `try { setTimeout(() => { throw new Error('x'); }); }
catch { console.log('caught'); }` }),
          ],
          { code: `try {\n  setTimeout(() => { JSON.parse(bad); }, 100);\n} catch (e) {\n  report(e); // never runs\n}`,
            fix: `setTimeout(() => {\n  try { JSON.parse(bad); } catch (e) { report(e); }\n}, 100);` }),
      ],
      senior: [
        Q('Implement retry with exponential backoff and jitter. Which errors should you retry?',
          'Retry only temporary failures (network errors, 429, 502 to 504) with growing delays plus random jitter, and a maximum attempt count. Never blindly retry non-safe requests like POST without an idempotency key.',
          'Backoff: delay = base * 2^attempt, capped.\nJitter spreads retries so clients do not hit the server at the same time.\nRespect the Retry-After header for 429 and 503.\nDo not retry 400, 401, 403 or 404.\nSupport cancel with AbortSignal.\nStrong answer covers safe methods and server load.',
          [
            E('Write the delay formula with full jitter.', 'Checks exponential backoff math.',
              'Random between 0 and min(cap, base * 2^attempt) spreads retries and avoids thundering herds.',
              { solution: `const delay = (n, base = 200, cap = 10_000) =>
  Math.random() * Math.min(cap, base * 2 ** n);` }),
            E('Pick which statuses to retry.', 'Checks retryable vs non-retryable errors.',
              'Retry 408, 429, 500, 503 and network errors; not 400/401/404. Respect Retry-After and only retry idempotent requests.',
              { code: '[400, 401, 404, 408, 429, 500, 503]' }),
          ]),
        Q('How do you read a large response step by step with streams in the browser?',
          'response.body is a ReadableStream. Read chunks with a reader or for await, decode with TextDecoderStream, and process data as it arrives instead of waiting for the whole body.',
          'Streams lower memory use and show results sooner (for example NDJSON or AI token streaming).\nresponse.body.pipeThrough(new TextDecoderStream()) gives text chunks.\nChunks do not align with lines; buffer partial lines.\nCancel with AbortController or reader.cancel().\nfor await over a ReadableStream is supported in modern browsers; reader.read() works everywhere.\nStrong answer mentions the partial line problem.',
          [
            E('Read a response body chunk by chunk.', 'Checks ReadableStream reader loop.',
              'Get a reader from res.body and loop until done; decode text with TextDecoderStream.',
              { code: 'const res = await fetch(url);', solution: `const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
for (;;) { const { done, value } = await reader.read();
  if (done) break; append(value); }` }),
            E('Predict what happens.', 'Checks body can be consumed once.',
              'TypeError: body already used. Use r.clone() before reading if you need it twice.',
              { code: `const r = await fetch(url);
await r.json();
await r.text();` }),
          ]),
        Q('What does top-level await do to module loading? When is it a problem?',
          'Top-level await pauses evaluation of that module and of every module that imports it until the promise settles. A slow await can delay app start-up for the whole graph.',
          'Sibling modules that do not depend on it can still evaluate.\nUseful for loading config or WASM before exports are used.\nRisk: a network call at top level blocks first render.\nIf the promise rejects, the import fails.\nCircular imports with top-level await can deadlock.\nStrong answer prefers lazy init for non-critical data.',
          [
            E('Predict the output order.', 'Checks TLA blocking importers.',
              'a main. Importers wait until the awaited module finishes evaluating.',
              { code: `// a.js: await new Promise(r => setTimeout(r, 100)); console.log('a');
// main.js: import './a.js'; console.log('main');` }),
            E('Spot the problem.', 'Checks slow TLA in shared modules.',
              'Every importer waits on the network; a failure breaks the whole graph. Export a promise or lazy loader instead.',
              { code: `// config.js
export const config = await fetch('/config').then(r => r.json());` }),
          ]),
      ],
      techlead: [
        Q('Your product needs live updates. How do you choose between polling, Server-Sent Events, and WebSockets?',
          'Polling is simplest and cache-friendly; SSE is good for one-way server-to-client streams over HTTP; WebSockets are for frequent two-way messages. Choose by direction, rate, infrastructure and scale.',
          'Polling: easy, works with CDNs, but delayed and wasteful at high rates.\nSSE: auto reconnect, works over HTTP/2, text only, one direction.\nWebSockets: two-way, binary, but needs sticky sessions or a broker and more ops work.\nConsider mobile battery, proxies, auth and reconnection.\nStart simple; move when metrics show the need.\nStrong answer uses examples from real systems.',
          [
            E('Pick a transport for a stock ticker feed.', 'Checks SSE for one-way updates.',
              'Server-Sent Events: one-way server push over HTTP with built-in reconnect. WebSockets only if the client also sends often.',
              { code: `const es = new EventSource('/prices');` }),
            E('Pick a transport for collaborative editing.', 'Checks WebSocket for bidirectional traffic.',
              'WebSocket: full-duplex, low-latency messages both ways. Polling adds latency; SSE is one-way.',
              { code: '// many small edits both ways, low latency' }),
          ], { ai: true }),
        Q('Code review: analytics events are sent with fetch in a page unload handler and many are lost. What do you change?',
          'Unload handlers are unreliable and requests can be cancelled when the page closes. Send on visibilitychange to hidden with navigator.sendBeacon or fetch with keepalive, and batch events.',
          'unload and beforeunload do not fire reliably, especially on mobile, and they block the back/forward cache.\nvisibilitychange (hidden) is the last reliable moment.\nsendBeacon queues a small POST that survives page close.\nfetch with keepalive: true works the same way, with a body size limit (about 64 KB total).\nBatch events and flush on hidden.\nStrong answer mentions bfcache.',
          [
            E('Fix event sending on page exit.', 'Checks sendBeacon on pagehide or visibilitychange.',
              'Use visibilitychange (hidden) and navigator.sendBeacon; unload is unreliable and blocks bfcache.',
              { code: `window.addEventListener('unload', () => fetch('/log', { method: 'POST', body }));`, solution: `document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') navigator.sendBeacon('/log', body);
});` }),
            E('Name the fetch option that survives page close.', 'Checks keepalive fetch option.',
              'keepalive: true lets the request outlive the page (body up to 64KB).',
              { code: `fetch('/log', { method: 'POST', body });` }),
          ],
          { code: `window.addEventListener('unload', () => {\n  fetch('/analytics', { method: 'POST', body: JSON.stringify(queue) });\n});`,
            fix: `document.addEventListener('visibilitychange', () => {\n  if (document.visibilityState === 'hidden' && queue.length) {\n    navigator.sendBeacon('/analytics', JSON.stringify(queue.splice(0)));\n  }\n});` }),
        Q('How do you set a team standard for async error handling, from the network call to the user message?',
          'Define layers: one HTTP client that normalises errors, a data layer that handles retries and cancel, and UI rules for showing errors. Report unexpected errors to monitoring, and ignore expected ones like AbortError.',
          'Typed error classes (NetworkError, HttpError with status, ValidationError).\nOne place for retries, timeouts and auth refresh.\nUI: error boundaries, inline messages, retry buttons; never a silent catch.\nMonitoring: unhandledrejection handler, Sentry or similar, with context.\nLint: no-floating-promises.\nStrong answer shows a clear layered design and how it was adopted.',
          [
            E('Spot the problem.', 'Checks swallowed errors in async code.',
              'The error is swallowed and success shown anyway. Show an error message and rethrow or return early.',
              { code: `try { await save(); } catch (e) { console.log(e); }
toast('Saved!');` }),
            E('Name where to map errors to user messages.', 'Checks layered error handling standard.',
              'API client throws typed errors (status, code); UI boundary maps them to messages. Report unexpected errors to monitoring once.',
              { code: 'api client -> service -> UI' }),
          ], { ai: true }),
      ],
    },
    'Callbacks, Promises': {
      junior: [
        Q('What is a callback? Give one example of a sync callback and one of an async callback.',
          'A callback is a function you pass to another function to be called later. map calls it right away (sync); setTimeout or addEventListener calls it later (async).',
          'Sync: [1, 2].map((x) => x * 2) runs the callback before map returns.\nAsync: setTimeout(cb, 100) runs cb after the current code ends.\nKnowing which kind it is tells you when side effects happen.\nPass the function, do not call it: setTimeout(run) not setTimeout(run()).\nStrong answer explains the timing difference; weak answer only says "a function in a function".',
          [
            E('Predict the output order.', 'Checks sync callbacks in array methods.',
              '1 2 3. forEach calls its callback synchronously.',
              { code: `console.log(1);
[2].forEach(n => console.log(n));
console.log(3);` }),
            E('Predict the output order.', 'Checks async callbacks in queueMicrotask.',
              'after cb. The callback runs once the current sync code finishes.',
              { code: `queueMicrotask(() => console.log('cb'));
console.log('after');` }),
          ]),
        {
          q: 'Find and fix the bug. The wait function does not wait at all.',
          code: `function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve(), ms);
  });
}
await wait(2000);
console.log('two seconds later?');`,
          short: 'resolve() is called right away, and its return value (undefined) is passed to setTimeout. Pass the function itself: setTimeout(resolve, ms).',
          long: `Writing fn() calls the function now. Writing fn passes it to be called later.
Here the promise resolves immediately, so await finishes at once.
setTimeout(undefined, ms) does nothing useful.
Same bug appears with addEventListener('click', handler()).
Strong answer: explains call versus reference. Weak answer: increases the delay.`,
          fix: `function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}`,
          follow: 'How would you make wait return a value after the delay?',
          exercises: [
            {
              task: 'Fix the bug.',
              description: 'Checks passing function vs calling it.',
              code: 'const wait = (ms) => new Promise(r => setTimeout(r(), ms));',
              answer: 'r() resolves immediately; pass r itself.',
              solution: 'const wait = (ms) => new Promise(r => setTimeout(r, ms));',
            },
            {
              task: 'Name a built-in promise timer in Node.',
              description: 'Checks timers/promises API.',
              code: `import { setTimeout as sleep } from 'node:timers/promises';`,
              answer: 'node:timers/promises setTimeout returns a promise: await sleep(1000).',
            },
          ],
        },
        Q('What does finally do in a promise chain? Does it change the result?',
          'finally runs a callback when the promise settles, success or error. It does not get the value and normally passes the original result or error through.',
          'Use it for cleanup like hiding a spinner.\nThe callback gets no arguments.\nIf finally throws or returns a rejected promise, that error replaces the result.\nA normal return value from finally is ignored.\nIn async functions use try/finally the same way.\nStrong answer knows the "throw replaces" rule.',
          [
            E('Predict the output.', 'Checks finally passes values through.',
              `1. finally's return value is ignored; the original value passes through.`,
              { code: 'Promise.resolve(1).finally(() => 2).then(console.log);' }),
            E('Predict the output.', 'Checks throwing inside finally.',
              '"f". Throwing (or rejecting) in finally overrides the original result.',
              { code: `Promise.resolve(1).finally(() => { throw new Error('f'); })
  .catch(e => console.log(e.message));` }),
          ]),
      ],
      middle: [
        Q('What is wrong with wrapping an existing promise in new Promise? When do you really need the Promise constructor?',
          'Wrapping a promise in new Promise adds code and often loses errors. Only use the constructor to turn callback or event APIs into promises.',
          'The anti-pattern: new Promise((res, rej) => fetch(u).then(res)) forgets rej, so errors hang forever.\nJust return fetch(u).then(...).\nIf the executor throws synchronously, the promise rejects; errors in nested callbacks do not.\nGood uses: setTimeout, FileReader, image onload, old callback libraries.\nPromise.withResolvers() helps when resolve is needed outside.\nStrong answer spots the missing reject path.',
          [
            E('Simplify this code.', 'Checks explicit promise constructor antipattern.',
              'fetchX already returns a promise; return it directly.',
              { code: `function get() {
  return new Promise((res, rej) => fetchX().then(res).catch(rej));
}`, solution: 'function get() { return fetchX(); }' }),
            E('Wrap a callback API in a promise.', 'Checks legitimate Promise constructor use.',
              'The constructor is needed for callback or event APIs.',
              { code: 'img.onload = ...; img.onerror = ...;', solution: `const load = (src) => new Promise((res, rej) => {
  const img = new Image();
  img.onload = () => res(img); img.onerror = rej; img.src = src;
});` }),
          ]),
        Q('Find and fix the bug. "All saved" is logged before the saves finish.',
          'forEach does not wait for async callbacks; it ignores the returned promises. Use for...of with await for order, or Promise.all for parallel.',
          'forEach always returns undefined.\nAsync callbacks start and return promises that nobody awaits.\nErrors from them become unhandled rejections.\nfor...of + await runs one by one.\nPromise.all(items.map(save)) runs in parallel and fails fast.\nStrong answer chooses between sequential and parallel based on needs.',
          [
            E('Fix the bug.', 'Checks awaiting mapped promises.',
              'map returns promises that are never awaited; wrap in Promise.all.',
              { code: `items.map(async i => await save(i));
console.log('All saved');`, solution: `await Promise.all(items.map(save));
console.log('All saved');` }),
            E('Report which saves failed without stopping others.', 'Checks Promise.allSettled usage.',
              'Use allSettled and filter rejected results.',
              { code: 'await Promise.all(items.map(save));', solution: `const rs = await Promise.allSettled(items.map(save));
const failed = rs.filter(r => r.status === 'rejected');` }),
          ],
          { code: `items.forEach(async (item) => {\n  await save(item);\n});\nconsole.log('All saved');`,
            fix: `for (const item of items) {\n  await save(item);\n}\nconsole.log('All saved');\n// parallel: await Promise.all(items.map(save));` }),
        Q('What is the difference between then with two arguments and then followed by catch?',
          'then(onOk, onErr) does not catch errors thrown inside onOk. then(onOk).catch(onErr) catches errors from the original promise and from onOk.',
          'The second argument handles only the previous promise rejection.\ncatch at the end protects the whole chain above it.\nThe position of catch matters: after catch the chain continues as fulfilled.\nUsing a catch in the middle can hide errors and run later steps with undefined.\nStrong answer explains error flow with a small example.',
          [
            E('Predict the output.', 'Checks onRejected not catching onFulfilled errors.',
              `Nothing logged; unhandled rejection. The second argument only handles the previous promise's rejection.`,
              { code: `Promise.resolve().then(
  () => { throw new Error('a'); },
  () => console.log('caught'));` }),
            E('Predict the output.', 'Checks catch recovering the chain.',
              '2. catch returns a value, so the chain resumes fulfilled.',
              { code: 'Promise.reject(1).catch(e => e + 1).then(v => console.log(v));' }),
          ]),
      ],
      senior: [
        {
          q: 'Find and fix the bug. After one network error, this user loader fails forever for that ID.',
          code: `const cache = new Map();
function getUser(id) {
  if (!cache.has(id)) {
    cache.set(id, fetch('/api/users/' + id).then((r) => r.json()));
  }
  return cache.get(id);
}`,
          short: 'The cache stores the promise, including a rejected one. Remove the entry when the promise rejects, and treat HTTP errors as failures with r.ok.',
          long: `Caching the promise (not the value) is good: parallel callers share one request.
But a rejected promise stays in the cache, so every later call gets the same error.
Fix: on rejection, delete the key, then rethrow.
fetch does not reject on 404 or 500, so check r.ok, or you cache error bodies as users.
Consider a time limit (TTL) and a size limit, or a library like TanStack Query.
Strong answer: keeps request sharing, evicts failures, and checks r.ok. Weak answer: removes caching altogether.`,
          fix: `const cache = new Map();
function getUser(id) {
  if (!cache.has(id)) {
    const p = fetch('/api/users/' + id)
      .then((r) => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .catch((e) => {
        cache.delete(id);
        throw e;
      });
    cache.set(id, p);
  }
  return cache.get(id);
}`,
          follow: 'How would you add a time limit so cached users expire after one minute?',
          exercises: [
            {
              task: 'Fix the bug.',
              description: 'Checks caching rejected promises.',
              code: `const cache = new Map();
const load = (id) => cache.get(id) ?? cache.set(id, fetchUser(id)).get(id);`,
              answer: 'A rejected promise stays cached forever; delete it on failure.',
              solution: `const load = (id) => {
  if (!cache.has(id)) cache.set(id, fetchUser(id).catch(e => { cache.delete(id); throw e; }));
  return cache.get(id);
};`,
            },
            {
              task: 'Explain why the cache stores promises.',
              description: 'Checks request deduplication via cached promises.',
              code: 'load(1); load(1); // one request?',
              answer: 'Caching the promise deduplicates concurrent calls: both share one in-flight request instead of fetching twice.',
            },
          ],
        },
        Q('Find and fix the bug. A catch logs the error but the caller thinks the save worked.',
          'The catch returns undefined, so the promise resolves and the caller shows success. Rethrow after logging, or return an explicit result type.',
          'A catch that does not rethrow turns a failure into a success.\nCallers then run success code with undefined.\nRule: handle the error where you can act; otherwise log and rethrow.\nAlternative: return { ok: false, error } and make callers check it.\nAdd a cause: new Error("Save failed", { cause: e }).\nStrong answer uses error cause and explains where to handle.',
          [
            E('Fix the bug.', 'Checks rethrowing after logging.',
              'The catch swallows the error so save resolves; rethrow after logging.',
              { code: `async function save(d) {
  try { await api.post(d); } catch (e) { log(e); }
}`, solution: 'catch (e) { log(e); throw e; }' }),
            E('Predict the output.', 'Checks catch returning undefined.',
              'ok undefined. A catch that returns nothing converts failure into success.',
              { code: `Promise.reject('x').catch(() => {}).then(v => console.log('ok', v));` }),
          ],
          { code: `async function save(data) {\n  try {\n    return await api.save(data);\n  } catch (e) {\n    console.error(e);\n  }\n}\nawait save(form);\ntoast('Saved!');`,
            fix: `async function save(data) {\n  try {\n    return await api.save(data);\n  } catch (e) {\n    logger.error(e);\n    throw new Error('Save failed', { cause: e });\n  }\n}` }),
        Q('What is Promise.withResolvers? When would you use a deferred promise?',
          'Promise.withResolvers() returns { promise, resolve, reject } so you can settle the promise from outside. It fits cases where the resolve trigger is in a different place, like a queue or a dialog.',
          'It replaces the old pattern of saving resolve from inside new Promise.\nUseful for: waiting for a user to confirm a modal, request/response over postMessage, test helpers.\nRisk: a promise that is never resolved hangs forever and keeps memory.\nAdd timeouts or cleanup when the source goes away.\nAvailable in all modern browsers since 2024.\nStrong answer warns about never-settled promises.',
          [
            E('Rewrite using Promise.withResolvers.', 'Checks withResolvers syntax.',
              'withResolvers returns promise, resolve, and reject together (Baseline 2024).',
              { code: `let resolve;
const p = new Promise(r => { resolve = r; });`, solution: 'const { promise: p, resolve } = Promise.withResolvers();' }),
            E('Name a good use for a deferred promise.', 'Checks deferred use cases.',
              `Awaiting a later event resolved elsewhere, like a confirm dialog result or a 'ready' signal from another module.`,
              { code: 'button.onclick = () => resolve(true);' }),
          ]),
      ],
      techlead: [
        Q('Code review: this cache helper sometimes calls the callback right away and sometimes later. Why is that dangerous?',
          'An API that is sometimes sync and sometimes async (often called "Zalgo") makes order of code unpredictable. Make it always async, or better, return a promise.',
          'Callers write code after the call that may run before or after the callback.\nBugs appear only when data is cached, so they are hard to reproduce.\nFix: queueMicrotask(() => cb(value)) for the cached path, or return Promise.resolve(value).\nRule for shared APIs: consistent timing, documented.\nAdd tests for both cached and uncached paths.\nStrong answer names the consistency principle and adds a rule.',
          [
            E('Predict the output order on cache hit.', 'Checks Zalgo sync/async inconsistency.',
              'cb after on hit, after cb on miss. Inconsistent ordering breaks callers; always call back asynchronously.',
              { code: `function get(k, cb) { if (cache[k]) cb(cache[k]); else load(k).then(cb); }
get('a', () => console.log('cb')); console.log('after');` }),
            E('Fix the helper to be always async.', 'Checks making callbacks consistently async.',
              'Defer the sync path with queueMicrotask, or return a promise.',
              { code: 'if (cache[k]) cb(cache[k]);', solution: 'if (cache[k]) queueMicrotask(() => cb(cache[k]));' }),
          ],
          { code: `export function get(key, cb) {\n  if (cache[key]) return cb(cache[key]);\n  load(key).then((v) => { cache[key] = v; cb(v); });\n}`,
            fix: `const cache = new Map();\nexport function get(key) {\n  if (!cache.has(key)) cache.set(key, load(key).catch((e) => { cache.delete(key); throw e; }));\n  return cache.get(key);\n}` }),
        {
          q: 'A team wants every async function to return a result object, like { ok, data, error }, instead of throwing. Is that a good idea in JavaScript?',
          short: 'It makes errors explicit and typed, but it fights the language: await, try and catch, Promise.all and most libraries expect rejections. Use it at clear boundaries, not everywhere.',
          long: `Pros: errors are visible in types, callers cannot forget them, and expected failures (validation, not found) are separate from bugs.
Cons: every call site must unwrap; Promise.all, retries and libraries still throw; unexpected exceptions still happen, so you need both styles.
A good middle ground: throw for unexpected errors; return result objects for expected business outcomes at module boundaries, like an API client.
Define one shared Result type and helpers, so teams do not invent five versions.
Make sure error monitoring still sees real failures.
Strong answer: weighs both sides and defines a boundary rule. Weak answer: picks one style for everything without trade-offs.`,
          exercises: [
            {
              task: 'Spot the problem.',
              description: 'Checks ignored result objects.',
              code: `const { data } = await getUser();
render(data.name);`,
              answer: 'The error branch is ignored, so data may be undefined. Result types need discriminated unions so TS forces checking ok.',
            },
            {
              task: 'Write a discriminated Result type.',
              description: 'Checks TS discriminated union.',
              answer: 'Use ok as the discriminant so narrowing works.',
              solution: `type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: Error };`,
            },
          ],
        },
        Q('Many promises in the app never settle and memory grows. How do you find and prevent this?',
          'Look for promises waiting on events that never come, like missing reject paths, lost messages, or forgotten dialogs. Add timeouts, AbortSignal support and cleanup, and test the unhappy paths.',
          'A pending promise keeps its callbacks and their closures alive while something can still resolve it.\nCommon causes: new Promise without reject on error, listeners never removed, request maps never cleaned.\nUse heap snapshots and count pending entries in your own maps.\nRule: every waiting API accepts a signal and has a timeout.\nReview checklist: "what if this never resolves?"\nStrong answer combines tooling with a design rule.',
          [
            E('Spot the problem.', 'Checks promises that never settle.',
              'If the reply never arrives, p hangs forever with its closures. Add a timeout and reject on close.',
              { code: `const p = new Promise((res) => {
  ws.onmessage = (m) => m.id === id && res(m);
});` }),
            E('Fix the hanging wait with a timeout.', 'Checks Promise.race timeout pattern.',
              'Race against a timer that rejects, and clear listeners afterward.',
              { code: 'await waitForReply(id);', solution: `await Promise.race([waitForReply(id),
  new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000))]);` }),
          ], { ai: true }),
      ],
    },
    'Destruction and Spread operator': {
      junior: [
        Q('How do you swap two variables with destructuring? How do you skip items in array destructuring?',
          'Use [a, b] = [b, a] to swap. Leave an empty slot with a comma to skip items, like const [, second] = arr.',
          'Array destructuring works by position.\nSwap creates a temporary array on the right side, then assigns.\nA line starting with [ needs a semicolon on the line before (ASI trap).\nSkip with commas: const [first, , third] = list.\nRest collects the remaining items: const [head, ...tail] = list.\nStrong answer mentions the semicolon trap.',
          [
            E('Predict the values.', 'Checks swap via destructuring.',
              '2 1. Array destructuring swaps without a temp variable.',
              { code: `let a = 1, b = 2;
[a, b] = [b, a];
console.log(a, b);` }),
            E('Predict the values.', 'Checks skipping elements and rest.',
              '2 [4, 5]. Empty slots skip items; rest collects the remainder.',
              { code: `const [, second, , ...rest] = [1, 2, 3, 4, 5];
console.log(second, rest);` }),
          ]),
        Q('Find and fix the bug. The default value does not work when the API sends null.',
          'Destructuring defaults apply only when the value is undefined, not null. Use the ?? operator for null.',
          'const { name = "Guest" } = { name: null } gives null.\nThe same rule applies to function parameter defaults.\n?? handles both null and undefined.\n|| would also replace empty string and 0, which may be wrong.\nStrong answer explains undefined-only defaults and chooses ?? over ||.\nWeak answer uses || without thinking about 0.',
          [
            E('Fix the bug.', 'Checks defaults only apply to undefined.',
              'Prints null; defaults apply only for undefined. Use ?? after destructuring.',
              { code: `const { title = 'Untitled' } = { title: null };
console.log(title);`, solution: `const title = data.title ?? 'Untitled';` }),
            E('Predict the output.', 'Checks parameter defaults with null.',
              '5 null. Only undefined triggers parameter defaults.',
              { code: `const f = (x = 5) => x;
console.log(f(undefined), f(null));` }),
          ],
          { code: `const { name = 'Guest', age = 0 } = await getUser(); // { name: null, age: null }\nrender(name.toUpperCase()); // TypeError`,
            fix: `const user = await getUser();\nconst name = user.name ?? 'Guest';\nconst age = user.age ?? 0;` }),
        Q('What is the difference between rest parameters and the arguments object?',
          'Rest parameters (...args) give a real array of the remaining arguments. arguments is an old array-like object, not available in arrow functions.',
          'args.map works; arguments.map does not (convert with Array.from).\nArrow functions have no own arguments; they see the outer one.\nRest must be the last parameter.\nRest collects only the extra arguments, not named ones.\nUse rest in modern code.\nStrong answer mentions arrows and the array-like detail.',
          [
            E('Predict what happens.', 'Checks arguments in arrow functions.',
              `7. Arrows have no own arguments; they use the outer function's.`,
              { code: `function outer() { return (() => arguments[0])(); }
console.log(outer(7));` }),
            E('Spot the problem.', 'Checks arguments is not a real array.',
              'arguments is array-like with no reduce; use rest parameters.',
              { code: 'function sum() { return arguments.reduce((a, b) => a + b); }', solution: 'function sum(...nums) { return nums.reduce((a, b) => a + b, 0); }' }),
          ]),
      ],
      middle: [
        Q('Find and fix the bug. After copying with spread, calling a method throws.',
          'Object spread copies only own enumerable properties into a plain object. Methods on the class prototype and the prototype link are lost.',
          '{ ...instance } creates a plain Object.\nGetters are called and their values copied; setters are lost.\nPrivate #fields are not copied.\nTo clone a class instance, add a clone method or use Object.create(Object.getPrototypeOf(x)) plus assign.\nstructuredClone also drops the prototype.\nStrong answer explains own enumerable and prototype.',
          [
            E('Fix the bug.', 'Checks spread losing prototype methods.',
              'Spread copies own enumerable props only, not prototype methods; copy onto an object with the same prototype.',
              { code: `class User { greet() { return 'hi'; } }
const copy = { ...new User() };
copy.greet();`, solution: `const u = new User();
const copy = Object.assign(Object.create(Object.getPrototypeOf(u)), u);` }),
            E('Predict the output.', 'Checks shallow copy with spread.',
              `['x', 'y']. Spread is shallow; nested arrays are shared. Use structuredClone for deep copies.`,
              { code: `const a = { tags: ['x'] };
const b = { ...a };
b.tags.push('y'); console.log(a.tags);` }),
          ],
          { code: `class Cart {\n  items = [];\n  total() { return this.items.length; }\n}\nconst copy = { ...cart };\ncopy.total(); // TypeError`,
            fix: `class Cart {\n  items = [];\n  total() { return this.items.length; }\n  clone() { const c = new Cart(); c.items = [...this.items]; return c; }\n}\nconst copy = cart.clone();` }),
        {
          q: 'When do you use optional chaining, and when destructuring with defaults, to read nested API data?',
          short: 'Optional chaining (a?.b?.c) safely reads one deep value and gives undefined if a link is missing. Destructuring with defaults pulls several values at once and fills defaults, but throws if a parent is null.',
          long: `user?.address?.city returns undefined if user or address is null or undefined.
const { address: { city } = {} } = user; gives a default only when address is undefined; null still throws.
Destructuring defaults apply only to undefined; ?? applies to null and undefined.
Use optional chaining plus ?? for one or two values from unreliable data.
Use destructuring for many values from a known shape, often after validation.
Too much nested destructuring is hard to read; flatten data at the API boundary.
Strong answer: knows the null trap in destructuring. Weak answer: thinks both behave the same.`,
          exercises: [
            {
              task: 'Predict the output.',
              description: 'Checks optional chaining with calls.',
              code: `const api = { user: null };
console.log(api.user?.getName?.(), api.user?.name ?? 'anon');`,
              answer: 'undefined "anon". ?. stops at null; ?? supplies the fallback.',
            },
            {
              task: 'Spot the problem.',
              description: 'Checks destructuring from null parent.',
              code: `const { address: { city = 'N/A' } } = { address: null };`,
              answer: `TypeError: cannot destructure null; defaults do not apply to null. Use optional chaining: data.address?.city ?? 'N/A'.`,
            },
          ],
        },
        Q('Predict the values. Explain nested destructuring and renaming.',
          'x is 1, y is 3, and city is "Kyiv". The name before the colon is the source key, the name after is the new variable. Nested patterns do not create a variable for the parent key.',
          '{ a: x } means "read a, store in x".\n{ address: { city } } creates city, not address.\nIf address is undefined, nested destructuring throws.\nGuard with a default: { address: { city } = {} }.\nDefaults and renaming combine: { a: x = 5 }.\nStrong answer knows typeof address is "undefined": no address variable is created.',
          [
            E('Predict the values.', 'Checks renaming with defaults.',
              '1 0. a is undefined so x defaults; 0 is a real value.',
              { code: `const { a: x = 1, b: y = 2 } = { a: undefined, b: 0 };
console.log(x, y);` }),
            E('Predict the values.', 'Checks nested array in object destructuring.',
              '9 "k" "undefined". Nested patterns bind only leaf names, not list or meta.',
              { code: `const { list: [first], meta: { id: key } } = { list: [9, 8], meta: { id: 'k' } };
console.log(first, key, typeof meta);` }),
          ],
          { ai: true, code: `const data = { a: 1, b: { c: 3 }, address: { city: 'Kyiv' } };\nconst { a: x, b: { c: y }, address: { city } } = data;\nconsole.log(x, y, city);\nconsole.log(typeof address); // ?` }),
      ],
      senior: [
        Q('Find and fix the bug. Math.max with spread crashes on a very large array.',
          'Spread passes each item as a separate argument, and engines limit argument count (stack size). With hundreds of thousands of items it throws RangeError. Use a loop or reduce.',
          'f(...arr) puts all items on the call stack.\nLimits vary by engine, usually around 100k to a few hundred thousand.\nThe same problem exists with push(...bigArray) and String.fromCharCode(...bytes).\nUse a loop, reduce, or chunked calls.\nIt is also slower and allocates more.\nStrong answer names the stack reason and other similar APIs.',
          [
            E('Fix the crash on large arrays.', 'Checks argument limit with spread.',
              'Spread passes each item as an argument and overflows the stack; use a loop or reduce.',
              { code: 'const max = Math.max(...bigArray); // 1e6 items', solution: 'const max = bigArray.reduce((m, n) => n > m ? n : m, -Infinity);' }),
            E('Predict the output.', 'Checks Math.max with empty spread.',
              '-Infinity Infinity. Handle empty arrays explicitly.',
              { code: 'console.log(Math.max(...[]), Math.min());' }),
          ],
          { code: `const max = Math.max(...values); // values.length = 1_000_000 -> RangeError`,
            fix: `let max = -Infinity;\nfor (const v of values) if (v > max) max = v;` }),
        Q('What happens when you spread null, undefined, false, a string, or a generator?',
          'In objects, spreading null, undefined or false is ignored, which enables conditional spread. In arrays, spread needs an iterable, so null throws while a string or generator works.',
          '{ ...null } is {}; [...null] throws TypeError.\n{ ...(cond && { a: 1 }) } adds a only when cond is truthy.\n{ ..."hi" } gives { 0: "h", 1: "i" }.\n[..."héllo"] splits by code points, so emoji stay whole (unlike split("")).\nA generator can be spread only once; after that it is empty.\nStrong answer separates object spread from iterable spread.',
          [
            E('Predict the output.', 'Checks object spread of primitives.',
              `{0: 'h', 1: 'i'}. Object spread ignores null/undefined/booleans; strings spread into indexed keys.`,
              { code: `console.log({ ...null, ...undefined, ...false, ...'hi' });` }),
            E('Predict what happens.', 'Checks array spread requiring iterables.',
              `['a', 'b'], then TypeError: null is not iterable. Array spread needs an iterable.`,
              { code: `console.log([...'ab']);
console.log([...null]);` }),
          ], { ai: true }),
        Q('Find and fix the performance bug. Building an index with spread in reduce is very slow.',
          'Each step copies the whole accumulator, so the work grows with the square of the input. Mutate a local accumulator, or use Object.fromEntries or Map.',
          'reduce((acc, x) => ({ ...acc, [x.id]: x }), {}) is O(n²).\nMutating a local accumulator inside reduce is safe because nobody else sees it.\nObject.fromEntries(list.map((x) => [x.id, x])) is clear and linear.\nMap is better for many keys or non-string keys.\nImmutability rules are for shared state, not local build steps.\nStrong answer explains why local mutation is fine.',
          [
            E('Fix the performance bug.', 'Checks quadratic spread in reduce.',
              'Copying acc each step is O(n^2); mutate the accumulator or use Object.fromEntries.',
              { code: 'const byId = users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});', solution: 'const byId = Object.fromEntries(users.map(u => [u.id, u]));' }),
            E('Group users by role in one call.', 'Checks Object.groupBy usage.',
              'Object.groupBy (Baseline 2024) groups in linear time without spreads.',
              { code: `const users = [{ role: 'admin' }, { role: 'user' }];`, solution: 'const byRole = Object.groupBy(users, u => u.role);' }),
          ],
          { code: `const byId = users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});`,
            fix: `const byId = Object.fromEntries(users.map((u) => [u.id, u]));\n// or: const byId = new Map(users.map((u) => [u.id, u]));` }),
      ],
      techlead: [
        Q('Code review: a component spreads all props onto a DOM element. What risks do you see? What rule do you set?',
          'Unknown props leak into the DOM as invalid attributes, can override important ones like type or onClick, and can pass unsafe values like dangerouslySetInnerHTML. Pick known props and spread only a typed rest.',
          'Spreading props blindly makes the public API unclear.\nOrder matters: {...props} after your attributes can override them.\nReact warns on unknown DOM attributes; some values end up in HTML.\nSecurity: user-controlled objects spread into props can inject handlers or HTML.\nRule: destructure known props, type the rest as the element attributes, put fixed attributes last.\nStrong answer covers both API design and security.',
          [
            E('Spot the problem.', 'Checks unknown props leaking to DOM.',
              'Custom props reach the DOM, causing React warnings and invalid attributes. Destructure known props and spread only the rest.',
              { code: `function Button(props) { return <button {...props} />; }
<Button isPrimary onTrack={fn} />` }),
            E('Fix the prop override order.', 'Checks spread order overriding handlers.',
              'A later spread can overwrite onChange; spread first, or compose handlers.',
              { code: '<input onChange={handle} {...rest} />', solution: '<input {...rest} onChange={(e) => { rest.onChange?.(e); handle(e); }} />' }),
          ], { ai: true }),
        Q('Code review: a backend-for-frontend removes the password with rest destructuring before sending the user. Is this safe? What would you change?',
          'It works for that one field, but it is a deny-list, so new sensitive fields leak by default. Use an allow-list that picks only the fields the client needs.',
          'const { password, ...safe } = user removes only password.\nNew fields like resetToken or ssn will leak automatically.\nAllow-list: build the response object from named fields.\nBetter: a schema or DTO that defines output fields, with tests.\nAlso lint unused variables (password is unused on purpose).\nStrong answer prefers allow-lists and adds a test.',
          [
            E('Spot the problem.', 'Checks denylist filtering of secrets.',
              'New sensitive fields (tokens, hash) leak automatically. Use an allowlist DTO instead.',
              { code: `const { password, ...safe } = user;
res.json(safe);` }),
            E('Rewrite as an allowlist.', 'Checks explicit DTO mapping.',
              'Pick only public fields explicitly.',
              { code: 'res.json(safe);', solution: `const { id, name, email } = user;
res.json({ id, name, email });` }),
          ],
          { code: `app.get('/me', (req, res) => {\n  const { password, ...safeUser } = req.user;\n  res.json(safeUser);\n});`,
            fix: `const toPublicUser = ({ id, name, email, avatarUrl }) => ({ id, name, email, avatarUrl });\napp.get('/me', (req, res) => res.json(toPublicUser(req.user)));` }),
        {
          q: 'Shared functions in your codebase take many positional arguments. When would you switch to one options object with destructuring? What are the costs?',
          short: 'An options object makes calls readable, order-free and easy to extend without breaking callers. Costs: a small allocation, weaker discovery without types, and a risk of growing "god" options. Use it for more than two or three optional settings.',
          long: `createUser('Ann', true, false, null, 3) is hard to read and easy to break.
createUser({ name: 'Ann', admin: true, retries: 3 }) is self-describing, and new options can be added later.
Keep required, obvious values positional (like an id) and put optional settings in an object.
Define types and defaults in one place: function f(id, { retries = 3, timeout = 5000 } = {}).
Risks: misspelled keys are silent in plain JS, so use TypeScript or validation; options objects can grow too large, which is a sign to split the function.
Allocation cost is tiny except in very hot loops.
Plan a migration: accept both forms for one release, then deprecate.
Strong answer: gives a clear rule and a backward compatible migration. Weak answer: "always use objects".`,
          exercises: [
            {
              task: 'Spot the problem.',
              description: 'Checks positional boolean arguments.',
              code: `createUser('Ann', true, false, null, 3);`,
              answer: 'Call site is unreadable and order-fragile. An options object names each value and allows defaults.',
            },
            {
              task: 'Fix the crash when called with no options.',
              description: 'Checks defaulting the whole options object.',
              code: `function fetchList({ page = 1, size = 20 }) {}
fetchList();`,
              answer: 'Destructuring undefined throws; default the parameter to {}.',
              solution: 'function fetchList({ page = 1, size = 20 } = {}) {}',
            },
          ],
        },
      ],
    },
    'Event handling, bubbling & delegation': {
      junior: [
        Q('What are the three phases of a DOM event? How do you listen in the capture phase?',
          'Capture goes from window down to the target, then the target phase, then bubble goes back up. Pass { capture: true } (or true) as the third argument to listen during capture.',
          'Default listeners run in the bubble phase.\nCapture listeners on ancestors run before the target listeners.\nevent.eventPhase tells you the phase: 1 capture, 2 target, 3 bubble.\nTo remove a capture listener you must pass capture: true again.\nCapture is useful for global handlers that must run first.\nStrong answer can draw the path; weak answer knows only bubbling.',
          [
            E('Predict the click log order.', 'Checks capture before bubble.',
              'P capture, C, P bubble. Capture runs top-down before the target, bubble runs after.',
              { code: `parent.addEventListener('click', () => log('P bubble'));
parent.addEventListener('click', () => log('P capture'), true);
child.addEventListener('click', () => log('C'));` }),
            E('Stop the event reaching the parent.', 'Checks stopPropagation vs preventDefault.',
              'Call e.stopPropagation(); preventDefault only cancels the default action. Common mistake: confusing the two.',
              { code: `child.addEventListener('click', (e) => { /* ? */ });` }),
          ]),
        Q('Find and fix the bug. Submitting the form reloads the page and the data is lost.',
          'The default form submit sends the page to the server and reloads it. Call event.preventDefault() in the submit handler, and listen on the form, not on the button click.',
          'Listen to "submit" on the form so Enter key submits too.\nevent.preventDefault() stops the reload.\nA button inside a form is type="submit" by default; use type="button" for other buttons.\nUse new FormData(form) to read values.\nKeep HTML validation by not using novalidate unless you replace it.\nStrong answer mentions the Enter key and button type default.',
          [
            E('Fix the bug.', 'Checks preventDefault on submit.',
              'The browser submits and reloads; call preventDefault.',
              { code: `form.addEventListener('submit', () => {
  send(new FormData(form));
});`, solution: `form.addEventListener('submit', (e) => {
  e.preventDefault();
  send(new FormData(form));
});` }),
            E('Spot the problem.', 'Checks button default type in forms.',
              'A button in a form defaults to type=submit, so it submits. Add type="button".',
              { code: '<form><button onclick="openHelp()">Help</button></form>' }),
          ],
          { code: `const btn = document.querySelector('#save');\nbtn.addEventListener('click', () => {\n  save(getValues());\n});`,
            fix: `form.addEventListener('submit', (e) => {\n  e.preventDefault();\n  save(Object.fromEntries(new FormData(form)));\n});` }),
        Q('How do you run an event handler only once? How do you remove a listener?',
          'Pass { once: true } and the listener removes itself after the first call. Otherwise call removeEventListener with the same function reference, or use an AbortController signal.',
          'once: true is the simplest for one-time actions.\nremoveEventListener needs the exact same function, not a new arrow.\nAnonymous functions cannot be removed later.\n{ signal } lets you remove many listeners with controller.abort().\nForgetting to remove listeners causes leaks and duplicate calls.\nStrong answer mentions the same-reference rule.',
          [
            E('Run a handler only once.', 'Checks once listener option.',
              'Use { once: true }; it auto-removes after the first call.',
              { code: `btn.addEventListener('click', start);`, solution: `btn.addEventListener('click', start, { once: true });` }),
            E('Fix the bug.', 'Checks capture flag must match on removal.',
              'The capture flag must match, so removal fails; pass true again.',
              { code: `el.addEventListener('click', h, true);
el.removeEventListener('click', h);`, solution: `el.removeEventListener('click', h, true);` }),
          ]),
      ],
      middle: [
        Q('Find and fix the bug. Scrolling feels slow on mobile, and Chrome shows a warning about a passive listener.',
          'A non-passive touch or wheel listener makes the browser wait for the handler before scrolling. Mark it { passive: true } if it does not call preventDefault, or use CSS touch-action to block gestures.',
          'Browsers cannot scroll until they know if preventDefault will be called.\npassive: true promises no preventDefault, so scrolling starts at once.\nChrome treats touchstart and touchmove on window, document and body as passive by default.\npreventDefault inside a passive listener is ignored with a console warning.\nCSS touch-action: none or pan-y controls gestures without JavaScript.\nStrong answer knows the default-passive rule and touch-action.',
          [
            E('Fix the bug.', 'Checks passive touch listeners.',
              'Mark it passive so scrolling does not wait for the handler.',
              { code: `window.addEventListener('touchmove', onMove);`, solution: `window.addEventListener('touchmove', onMove, { passive: true });` }),
            E('Predict what happens.', 'Checks preventDefault inside passive listener.',
              'preventDefault is ignored and the console warns. Use passive: false only when you must block scrolling.',
              { code: `el.addEventListener('wheel', e => e.preventDefault(), { passive: true });` }),
          ],
          { code: `window.addEventListener('wheel', (e) => {\n  trackScroll(e.deltaY);\n}, { passive: false });`,
            fix: `window.addEventListener('wheel', (e) => {\n  trackScroll(e.deltaY);\n}, { passive: true });` }),
        Q('You want delegated handling for focus events in a form. Why does focus not work, and what do you use instead?',
          'focus and blur do not bubble, so a listener on the form never sees them. Use focusin and focusout, which bubble, or listen to focus in the capture phase.',
          'Delegation needs bubbling (or capture).\nfocusin and focusout bubble and fire for every field.\nevent.relatedTarget tells where focus came from or goes to.\nThe same applies to mouseenter/mouseleave; use mouseover/mouseout or pointerover/pointerout for delegation.\nStrong answer knows both fixes and relatedTarget.',
          [
            E('Fix the delegated focus handler.', 'Checks focusin bubbles while focus does not.',
              'focus does not bubble; use focusin (or capture phase).',
              { code: `form.addEventListener('focus', (e) => highlight(e.target));`, solution: `form.addEventListener('focusin', (e) => highlight(e.target));` }),
            E('Style a form when any field is focused.', 'Checks :focus-within CSS.',
              'Use :focus-within, no JavaScript needed.',
              { code: '.form { }', solution: '.form:focus-within { outline: 2px solid blue; }' }),
          ]),
        Q('Code review: this clickable card uses a div with a click handler. What is wrong, and how do you fix it?',
          'A div is not focusable and does not respond to Enter or Space, so keyboard and screen reader users cannot use it. Use a real button or link, which brings keyboard support and the right role.',
          'Native button: focusable, Enter and Space trigger click, role is announced.\nLink (a href) for navigation, button for actions.\nRole="button" + tabindex="0" + key handlers is a weaker fallback.\nFor a card with a link, make the heading link cover the card with CSS, and keep other buttons separate.\nTest with Tab and a screen reader.\nStrong answer chooses link versus button correctly.',
          [
            E('Spot the problem.', 'Checks div click accessibility gaps.',
              'Not focusable, no role, no Enter/Space support; keyboard and screen reader users cannot use it. Use a link or button.',
              { code: '<div class="card" onclick="open()">Plan A</div>' }),
            E('Fix the card while keeping it all clickable.', 'Checks stretched link pattern.',
              'Put a real link inside and stretch its hit area with a pseudo-element.',
              { code: '<div class="card"><h3>Plan A</h3></div>', solution: `<div class="card" style="position:relative">
  <h3><a href="/plans/a" class="stretch">Plan A</a></h3>
</div>
<style>.stretch::after{content:'';position:absolute;inset:0}</style>` }),
          ],
          { code: `<div class="card" onclick="openProduct(42)">\n  <h3>Product</h3>\n</div>`,
            fix: `<article class="card">\n  <h3><a class="title" href="/products/42">Product</a></h3>\n</article>` }),
      ],
      senior: [
        Q('Predict the order of the logs. Is dispatchEvent synchronous?',
          'Yes. dispatchEvent runs all listeners synchronously before it returns, so the order is 1, handler, 2. User clicks are different: listeners run in their own task.',
          'el.dispatchEvent(evt) calls listeners right away on the same call stack.\nIt returns false if a listener called preventDefault on a cancelable event.\nMicrotasks queued in listeners run after the whole dispatch for script dispatch, but between listeners for real user events.\nel.click() is also synchronous.\nThis affects tests and code that expects async behaviour.\nStrong answer knows the microtask difference between real and synthetic events.',
          [
            E('Predict the log order.', 'Checks dispatchEvent runs synchronously.',
              'handler after. dispatchEvent calls listeners synchronously, unlike native user events queued as tasks.',
              { code: `el.addEventListener('x', () => console.log('handler'));
el.dispatchEvent(new Event('x'));
console.log('after');` }),
            E('Fix the custom event so parents receive it.', 'Checks bubbles option on CustomEvent.',
              'Custom events do not bubble by default; set bubbles: true.',
              { code: `el.dispatchEvent(new CustomEvent('save', { detail: 1 }));`, solution: `el.dispatchEvent(new CustomEvent('save', { detail: 1, bubbles: true }));` }),
          ],
          { ai: true, code: `el.addEventListener('ping', () => console.log('handler'));\nconsole.log(1);\nel.dispatchEvent(new Event('ping'));\nconsole.log(2);` }),
        Q('Find and fix the bug. Dragging a slider stops working when the pointer leaves the thumb.',
          'Move events go to the element under the pointer, so when it leaves the thumb, updates stop. Use pointer events with setPointerCapture so all move and up events go to the thumb.',
          'Pointer events cover mouse, touch and pen with one API.\nsetPointerCapture(e.pointerId) sends later pointer events to the element.\nCapture is released on pointerup or pointercancel automatically.\nHandle pointercancel (for example, when the browser takes over a gesture).\nAdd touch-action: none so the browser does not scroll during drag.\nStrong answer mentions pointercancel and touch-action.',
          [
            E('Fix the bug.', 'Checks pointer capture for dragging.',
              'Capture the pointer so moves keep arriving outside the thumb.',
              { code: 'thumb.onpointerdown = () => thumb.onpointermove = move;', solution: `thumb.onpointerdown = (e) => {
  thumb.setPointerCapture(e.pointerId);
  thumb.onpointermove = move;
};` }),
            E('Name the CSS stopping touch scroll during drag.', 'Checks touch-action for pointer events.',
              'touch-action: none prevents the browser panning, which would fire pointercancel mid-drag.',
              { code: '.thumb { }' }),
          ],
          { code: `thumb.addEventListener('mousedown', () => { dragging = true; });\nthumb.addEventListener('mousemove', (e) => { if (dragging) setValue(e.clientX); });\nthumb.addEventListener('mouseup', () => { dragging = false; });`,
            fix: `thumb.addEventListener('pointerdown', (e) => {\n  thumb.setPointerCapture(e.pointerId);\n});\nthumb.addEventListener('pointermove', (e) => {\n  if (thumb.hasPointerCapture(e.pointerId)) setValue(e.clientX);\n});\n// CSS: .thumb { touch-action: none; }` }),
        Q('Why does window.open or clipboard writing fail when called after an await in a click handler?',
          'These APIs need user activation. Activation lasts only a short time after the user gesture, so a slow await can make it expire. Call the API before awaiting, or pass a promise to the API.',
          'Browsers track transient user activation, a few seconds after the click.\nPopup blockers stop window.open without it.\nnavigator.clipboard.write accepts ClipboardItem with promise values, so you can start the write now and fill data later (support varies).\nFullscreen and some media APIs have the same rule.\nOpen the window first, then set its location after data loads.\nStrong answer knows the activation model and a workaround.',
          [
            E('Fix the popup being blocked.', 'Checks transient user activation.',
              'Open the window synchronously, then set its location after await.',
              { code: `btn.onclick = async () => {
  const url = await getUrl();
  window.open(url);
};`, solution: `btn.onclick = async () => {
  const w = window.open('about:blank');
  w.location = await getUrl();
};` }),
            E('Copy async-fetched text on click.', 'Checks ClipboardItem with a promise.',
              'Pass a promise into ClipboardItem synchronously so activation is kept.',
              { code: 'btn.onclick = async () => navigator.clipboard.writeText(await load());', solution: `btn.onclick = () => navigator.clipboard.write([new ClipboardItem({
  'text/plain': load().then(t => new Blob([t], { type: 'text/plain' })) })]);` }),
          ]),
      ],
      techlead: [
        Q('Code review: the app adds global keyboard shortcuts on document. What problems do you look for?',
          'Shortcuts must not fire while the user types in inputs, must not break screen reader or browser keys, must be removable, and must be documented. Many single-key shortcuts also fail WCAG 2.1.4.',
          'Ignore events from input, textarea, select and contenteditable.\nCheck event.isComposing for IME input.\nUse event.key, not keyCode; respect platform modifiers (Meta on Mac).\nWCAG 2.1.4: single-character shortcuts need a way to turn off or remap.\nCentralise registration to avoid conflicts between teams.\nStrong answer covers accessibility, i18n and ownership.',
          [
            E('Spot the problem.', 'Checks shortcuts firing while typing.',
              'Fires while typing in inputs. Skip editable targets (input, textarea, isContentEditable) and check modifiers.',
              { code: `document.addEventListener('keydown', e => { if (e.key === 's') save(); });` }),
            E('Fix the shortcut for Mac and Windows.', 'Checks modifier key handling.',
              'Mac users expect Cmd; accept metaKey too and prevent the browser default.',
              { code: `if (e.ctrlKey && e.key === 's') save();`, solution: `if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); save(); }` }),
          ],
          { code: `document.addEventListener('keydown', (e) => {\n  if (e.key === 's') save();\n  if (e.key === 'Delete') removeSelected();\n});`,
            fix: `document.addEventListener('keydown', (e) => {\n  if (isTyping(e) || !shortcutsEnabled) return;\n  if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); save(); }\n  if (e.key === 'Delete') removeSelected();\n});` }),
        Q('Teams want a global event bus for communication between features. When is that a good idea, and when is it a mistake?',
          'An event bus is good for loose, fire-and-forget notifications (analytics, toasts). It is a mistake for shared state or request/response flows, where hidden coupling makes bugs hard to trace.',
          'Pros: features do not import each other; easy to add listeners.\nCons: no clear owner, hard to find who listens, order and timing bugs, leaks from missing unsubscribe.\nShared state belongs in a store or server cache.\nIf you use a bus: typed event names and payloads, unsubscribe on unmount, dev logging.\nEventTarget can be the bus without a library.\nStrong answer gives a real example where a bus helped or hurt.',
          [
            E('Spot the problem.', 'Checks hidden coupling in event buses.',
              'Hidden dependencies, untyped payloads, and leaks from unremoved listeners. Use typed events and unsubscribe on unmount.',
              { code: `bus.emit('user-updated', user);
// who listens? nobody knows` }),
            E('Write a tiny typed event bus.', 'Checks EventTarget-based bus.',
              'Reuse EventTarget with CustomEvent; return an unsubscribe.',
              { solution: `const bus = new EventTarget();
const on = (t, fn) => { bus.addEventListener(t, fn); return () => bus.removeEventListener(t, fn); };
const emit = (t, detail) => bus.dispatchEvent(new CustomEvent(t, { detail }));` }),
          ], { ai: true }),
        {
          q: 'Code review: a shared component sets onclick properties, and some pages use inline onclick in HTML. What problems do you see? What rule do you set?',
          code: `// shared/toolbar.js
saveButton.onclick = () => save();
// analytics.js
saveButton.onclick = () => track('save');
// page.html
// <button onclick="openHelp()">Help</button>`,
          short: 'An onclick property holds only one handler, so the second assignment silently removes the first. Inline handlers need global functions and block a strict Content Security Policy. Use addEventListener everywhere.',
          long: `el.onclick = fn replaces any earlier handler; addEventListener adds one more.
Here save never runs, only tracking does. This kind of bug is silent.
Inline onclick in HTML runs in the global scope and needs 'unsafe-inline' or hashes in the CSP, which weakens XSS protection.
addEventListener also supports options: once, passive, capture, and signal for cleanup.
Rule: no on* properties and no inline handlers; enforce with lint rules and a strict CSP without 'unsafe-inline'.
Strong answer: finds the overwrite and the CSP issue, and sets an enforceable rule. Weak answer: only mentions style.`,
          fix: `const controller = new AbortController();
saveButton.addEventListener('click', save, { signal: controller.signal });
saveButton.addEventListener('click', () => track('save'), { signal: controller.signal });
helpButton.addEventListener('click', openHelp, { signal: controller.signal });
// later: controller.abort() removes all three`,
          follow: 'How would you roll out a strict CSP when the old pages still use inline handlers?',
          exercises: [
            {
              task: 'Predict the output on click.',
              description: 'Checks onclick property overwriting.',
              code: `btn.onclick = () => console.log('a');
btn.onclick = () => console.log('b');`,
              answer: 'Only "b". The property holds one handler; addEventListener allows many.',
            },
            {
              task: 'Spot the problem.',
              description: 'Checks inline handlers and CSP.',
              code: '<button onclick="doThing()">Go</button>',
              answer: 'Inline handlers need global functions and are blocked by a strict CSP without unsafe-inline. Use addEventListener instead.',
            },
          ],
        },
      ],
    },
  },
};
