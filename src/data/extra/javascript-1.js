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
            E('Predict the output of each line.', 'Checks nullish handling. The interviewer shows the snippet and asks for answers before running it.',
              'f() logs 5 because the default applies to undefined. f(null) logs null because defaults ignore null. null ?? 1 is 1, and 0 ?? 1 is 0. Common mistake: thinking f(null) gives 5.',
              { code: `function f(x = 5) { console.log(x); }\nf();\nf(null);\nconsole.log(null ?? 1, 0 ?? 1);` }),
            E('Write a function isNil. It returns true only for null and undefined.', 'Checks the double-equals-null idiom versus explicit checks.',
              'v == null is the short idiom, because loose equality matches only null and undefined. Using !v is wrong, because 0, empty string and false also return true.',
              { solution: `const isNil = (v) => v == null;` }),
          ]),
        Q('Find and fix the bug. The age check lets wrong input pass.',
          'Input values are strings. Comparing "18" with "9" uses string order, so the result is wrong. Convert to numbers and check for NaN.',
          'input.value is always a string.\nTwo strings compare character by character: "18" < "9" is true.\nIf one side is a number, the string is converted, which hides the bug in some cases.\nNumber("") is 0, so empty input needs its own check.\nUse Number() or valueAsNumber, and Number.isNaN for validation.\nStrong answer explains string comparison; weak answer adds parseInt without handling NaN.',
          [
            E('Predict three results: "10" > "9", "10" > 9, and "abc" < 1.', 'Checks comparison coercion rules.',
              '"10" > "9" is false (string order, "1" comes before "9"). "10" > 9 is true, because the string becomes a number. "abc" < 1 is false, because NaN compares false with everything.'),
            E('Fix a sum of two inputs. It shows "1020" instead of 30.', 'The candidate gets two input values added with plus.',
              'Plus joins strings if either side is a string. Convert both with Number() first and validate with Number.isFinite.',
              { code: `const total = a.value + b.value;`, solution: `const total = Number(a.value) + Number(b.value);` }),
          ],
          { code: `const min = document.querySelector('#min').value; // "9"\nconst age = document.querySelector('#age').value; // "18"\nif (age >= min) allow();`,
            fix: `const min = Number(minInput.value);\nconst age = Number(ageInput.value);\nif (ageInput.value.trim() === '' || Number.isNaN(age)) showError();\nelse if (age >= min) allow();`,
            follow: 'What changes if you use input.valueAsNumber instead?' }),
        Q('How do you check if a value is an array, a number, or a plain object?',
          'Use Array.isArray for arrays, typeof plus Number.isFinite for numbers, and a prototype check for plain objects. typeof alone is not enough.',
          'typeof [] and typeof null both return "object".\nArray.isArray works across iframes; instanceof Array does not.\ntypeof NaN is "number", so use Number.isFinite or Number.isNaN.\nNumber.isNaN does not coerce; global isNaN("abc") returns true.\nPlain object: Object.prototype.toString.call(x) === "[object Object]", or prototype is Object.prototype or null.\nStrong answer knows these edge cases; weak answer uses typeof for everything.',
          [
            E('Write a function typeOf. It returns "null", "array", "date", or the normal type name.', 'Checks combining typeof with Object.prototype.toString.',
              'Object.prototype.toString.call returns tags like "[object Array]" that you can slice. This also handles null correctly.',
              { solution: `const typeOf = (v) => Object.prototype.toString.call(v).slice(8, -1).toLowerCase();` }),
            E('Predict: isNaN of "abc", Number.isNaN of "abc", and typeof NaN.', 'Quick check on NaN rules.',
              'true, false, "number". Global isNaN converts the string to NaN first. Number.isNaN returns true only for the real NaN value.'),
          ]),
      ],
      middle: [
        Q('What happens when JavaScript converts an object to a primitive? Explain valueOf, toString and Symbol.toPrimitive.',
          'JS calls Symbol.toPrimitive with a hint if it exists. Otherwise it calls valueOf then toString (number or default hint), or toString then valueOf (string hint).',
          'Hints: "string" for template literals and String(), "number" for math and comparisons, "default" for + and ==.\nDate is special: its default hint acts like "string".\n[] + {} is "[object Object]" because [] becomes "" and {} becomes "[object Object]".\nIf a method returns an object it is skipped; if nothing returns a primitive, TypeError.\nStrong answer explains [] == false step by step.\nWeak answer memorises results without the algorithm.',
          [
            E('Build a Money object. As a string it prints "$5.00". Plus one gives 6.', 'Checks Symbol.toPrimitive with hints.',
              'Return the formatted string for hint "string" and the number otherwise. Many candidates override only toString, which then breaks math.',
              { solution: `const m = { amount: 5, [Symbol.toPrimitive](hint) { return hint === 'string' ? '$' + this.amount.toFixed(2) : this.amount; } };` }),
            E('Explain step by step why empty array double-equals not empty array is true.', 'Shows [] == ![]. Checks the loose equality algorithm.',
              '![] is false because arrays are truthy. [] == false: the boolean becomes 0, [] becomes "" then 0. 0 == 0 is true. Strong candidates explain the order of conversions.'),
          ], { ai: true }),
        Q('Find and fix the bug. Sorting numbers gives the wrong order.',
          'sort converts elements to strings by default, so 10 comes before 9. Pass a numeric compare function.',
          'Default sort compares string forms.\nComparator (a, b) => a - b sorts ascending.\nsort mutates in place; toSorted() keeps the original (ES2023).\nReturning a boolean from the comparator is a common bug and gives unstable results.\nFor text with locales use localeCompare or Intl.Collator.\nStrong answer mentions mutation and toSorted.',
          [
            E('Sort users by age, oldest first. Do not change the original array.', 'Checks toSorted and comparator direction.',
              'users.toSorted((a, b) => b.age - a.age). Using sort directly mutates shared state, a frequent bug with React props.',
              { solution: `const byAge = users.toSorted((a, b) => b.age - a.age);` }),
            E('Find the bug in a compare function that returns a greater than b.', 'The comparator must return a negative, zero or positive number.',
              'A boolean becomes 1 or 0, never negative, so the order is not valid and results vary by engine. Return a - b.'),
          ],
          { code: `const scores = [10, 9, 100, 1];\nscores.sort();\nconsole.log(scores); // [1, 10, 100, 9]`,
            fix: `const sorted = scores.toSorted((a, b) => a - b); // [1, 9, 10, 100]` }),
        Q('What is BigInt? When do you need it, and what are the traps?',
          'BigInt stores integers of any size. You need it above Number.MAX_SAFE_INTEGER (2^53 - 1), for example 64-bit IDs. You cannot mix it with Number in math.',
          'Numbers are 64-bit floats; integers are exact only up to 2^53 - 1.\n10n + 1 throws TypeError; convert explicitly.\nJSON.stringify throws on BigInt; send it as a string.\nMath methods do not accept BigInt, and division truncates.\nLarge IDs from APIs should arrive as strings, because JSON.parse loses precision first.\nStrong answer mentions the JSON precision trap.',
          [
            E('Predict: is 9007199254740993 triple-equal to 9007199254740992?', 'Checks the safe integer range.',
              'true. 2^53 + 1 cannot be stored and rounds to 2^53. This is why 64-bit IDs must be strings.'),
            E('Make JSON.stringify work for an object that has a BigInt.', 'Checks replacer usage.',
              'Use a replacer that converts bigint to string. Patching BigInt.prototype.toJSON works but is a global side effect.',
              { solution: `JSON.stringify(obj, (k, v) => typeof v === 'bigint' ? v.toString() : v);` }),
          ]),
      ],
      senior: [
        Q('TypeScript types are removed at build time. How do you check untrusted data at runtime?',
          'Parse data at the edges (API, storage, postMessage) with a schema library like Zod or Valibot, and derive TS types from the schema so they cannot drift.',
          'TS types are erased; a response typed as User can be anything.\nValidate once at the edge, then trust the data inside the app.\nSchemas give inferred types, so checks and types stay in sync.\nDecide the failure policy: throw, fallback, or report to monitoring.\nThink about bundle size and cost for big payloads.\nStrong answer explains "parse, do not validate"; weak answer says TS handles it.',
          [
            E('Write a type guard isUser. The shape is id as string and age as number.', 'Checks manual runtime narrowing.',
              'Check it is a non-null object, then each field type. Common mistake: forgetting null.',
              { solution: `function isUser(x) { return typeof x === 'object' && x !== null && typeof x.id === 'string' && Number.isFinite(x.age); }` }),
            E('How would you add schema checks to 200 existing endpoints?', 'Open discussion about step-by-step adoption.',
              'Start in report-only mode that logs mismatches, cover critical endpoints first, then switch to strict. Strong answers mention telemetry and contract tests with the backend.'),
          ], { ai: true }),
        Q('Find and fix the bug. This change detector loops forever when the value is NaN.',
          'NaN triple-equals NaN is false, so every check says "changed". Object.is handles NaN and -0 correctly.',
          'Object.is(NaN, NaN) is true; Object.is(0, -0) is false.\nReact uses Object.is to compare state.\nSameValueZero (includes, Map, Set) treats NaN as equal and 0 equal to -0.\nindexOf uses === and cannot find NaN; includes can.\nStrong answer names all three equality algorithms.\nWeak answer adds a special NaN if-branch only.',
          [
            E('Predict three results: includes NaN, indexOf NaN, and the size of a Set with 0 and minus 0.', 'Shows [NaN].includes(NaN), [NaN].indexOf(NaN), new Set([0, -0]).size.',
              'true, -1, 1. includes and Set use SameValueZero; indexOf uses ===.'),
            E('Write shallowEqual using Object.is.', 'Common in memoisation.',
              'Compare key counts and each own key with Object.is. Without the key count check, extra keys pass.',
              { solution: `function shallowEqual(a, b) {\n  if (Object.is(a, b)) return true;\n  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;\n  const ka = Object.keys(a);\n  return ka.length === Object.keys(b).length && ka.every((k) => Object.hasOwn(b, k) && Object.is(a[k], b[k]));\n}` }),
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
              task: 'Make a branded UserId type and a function that creates it.',
              description: 'Checks the brand pattern and a single creation point.',
              answer: 'Declare the brand type, then a toUserId function that validates the string and casts once. Other code can only get a UserId through it.',
              solution: `type UserId = string & { readonly __brand: 'UserId' };
function toUserId(s: string): UserId {
  if (!/^u_\\d+$/.test(s)) throw new Error('Bad user id');
  return s as UserId;
}`,
            },
            {
              task: 'Does a branded type change the JavaScript output? Explain.',
              description: 'Checks that the candidate knows types are erased.',
              answer: 'No. The brand exists only for the type checker. The emitted code is a plain string, so there is no runtime cost and also no runtime protection.',
            },
          ],
        },
      ],
      techlead: [
        Q('You start a new frontend codebase with a mixed team. Do you choose strict TypeScript, JSDoc types, or plain JavaScript? Why?',
          'Default to strict TypeScript for shared, long-lived code. JSDoc with checkJs is a good bridge for legacy or no-build code. Plain JS only for tiny throwaway work.',
          'Consider team skills, codebase lifetime, tooling and hiring.\nStrict mode from day one is cheaper than tightening later.\nJSDoc + // @ts-check gives most benefits without a compile step.\nRuntime validation is still needed at the edges.\nPlan training, lint rules (no-explicit-any) and an escape-hatch policy.\nStrong answer weighs trade-offs with real examples.',
          [
            E('Name three lint or tsconfig rules you would enforce. Explain each one.', 'The interviewer asks the candidate to justify every rule.',
              'Examples: strict true, noUncheckedIndexedAccess, no-explicit-any as error with documented exceptions. Strong answers name the bug class each rule prevents.'),
            E('Plan a move of a 100k-line JavaScript app to TypeScript.', 'Checks a step-by-step strategy.',
              'allowJs, convert leaf modules first, track a coverage metric, tighten strictness folder by folder. A big-bang rewrite is the weak answer.'),
          ], { ai: true }),
        Q('Code review: this money formatting code is used everywhere. What problems do you see? What team rule would you add?',
          'It uses floats for money, hard-codes the symbol, and rounds with toFixed. Store integer cents and format with Intl.NumberFormat.',
          'toFixed rounding surprises people: 1.005.toFixed(2) is "1.00".\nFloat sums collect errors.\nSymbols and separators depend on locale.\nRule: amounts as integer minor units (or decimal strings from the backend) and one formatting helper with Intl.\nAdd tests for rounding and locales; lint against ad-hoc toFixed in money code.\nStrong answer combines the code fix with a team rule.',
          [
            E('Rewrite format with Intl.NumberFormat for euros in the German locale.', 'Checks Intl knowledge.',
              'Create the formatter once with locale "de-DE", style currency, currency EUR, and format cents / 100. Caching the formatter matters for speed.',
              { solution: `const eur = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });\nconst format = (cents) => eur.format(cents / 100);` }),
            E('Predict 1.005 to fixed 2 and explain it.', 'Shows 1.005.toFixed(2). Checks float representation.',
              '"1.00", because 1.005 is stored as 1.00499999... Weak answers expect "1.01".'),
          ],
          { code: `export const format = (amount) => '$' + (amount * 1.2).toFixed(2);\nconst total = items.reduce((s, i) => s + i.price, 0);`,
            fix: `const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });\nexport const format = (cents) => usd.format(cents / 100);\nconst totalCents = items.reduce((s, i) => s + i.priceCents, 0);` }),
        Q('An API returned the string "0" instead of the number 0. A truthy check passed and caused an incident. How do you run the review and stop this kind of bug?',
          'Run a blameless post-mortem focused on the missing contract. Add schema checks at the API edge, contract tests with the backend, and rules against loose truthy checks on API data.',
          'Timeline, impact, root cause (type contract not enforced), contributing factors (no tests, no alerts).\nActions: schema parsing, types generated from OpenAPI, consumer-driven contract tests.\nPrefer explicit checks (=== 0, != null) over truthiness for numbers.\nAlert on validation failures.\nTrack actions with owners until done.\nStrong answer treats it as a system problem, not a person problem.',
          [
            E('Write the action items with owners and deadlines.', 'Role-play: the candidate writes the action list.',
              'Good items are specific and checkable, like "Add a Zod schema for orders by Friday, owner X". Vague items like "be more careful" are a red flag.'),
            E('Explain why "0" is truthy and 0 is falsy. Suggest a safer check.', 'Quick technical check inside the leadership question.',
              'Only the empty string is a falsy string. Convert with Number and validate, or check typeof first.'),
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
              code: `function Person(name) { this.name = name; }
const p = Person('Ann');
console.log(p);`,
              task: 'Predict what happens in sloppy mode and in strict mode.',
              description: 'A constructor function is called without new.',
              answer: 'Sloppy mode: this is the global object, so a global variable name is created and p is undefined. Strict mode: this is undefined, so setting this.name throws a TypeError.',
            },
            {
              task: 'What does new return if the constructor returns an object? What if it returns a number?',
              description: 'Checks the return rule.',
              answer: 'If it returns an object, new gives you that object instead. If it returns a primitive like a number, the return value is ignored and the new instance is returned.',
            },
          ],
        },
        Q('Find and fix the bug. The counter does not increase after one second.',
          'The method is passed to setTimeout without its object, so this is not counter. Use an arrow wrapper or bind.',
          'setTimeout calls the function as a plain function.\nInside, this is not counter (globalThis in browsers for timers in sloppy mode, or undefined in strict class code).\nFix 1: setTimeout(() => counter.inc(), 1000).\nFix 2: setTimeout(counter.inc.bind(counter), 1000).\nThe same bug happens with event listeners and array callbacks.\nStrong answer explains why the call site matters.',
          [
            E('Fix the same bug when the method is passed to addEventListener.', 'Checks the candidate sees the same pattern.',
              'Use an arrow wrapper or bind. Mention that with bind you must keep the bound reference to remove the listener later.',
              { code: `button.addEventListener('click', counter.inc);`, solution: `button.addEventListener('click', () => counter.inc());` }),
            E('Explain why the arrow wrapper fixes the problem.', 'Short theory check.',
              'The arrow calls counter.inc() as a method call, so this is counter. The arrow itself does not need its own this.'),
          ],
          { code: `const counter = {\n  count: 0,\n  inc() { this.count++; },\n};\nsetTimeout(counter.inc, 1000);`,
            fix: `setTimeout(() => counter.inc(), 1000);\n// or\nsetTimeout(counter.inc.bind(counter), 1000);` }),
        Q('Inside an event listener, what is this? Does it change with an arrow function?',
          'In a normal function listener, this is the element the listener is attached to (event.currentTarget). In an arrow function, this comes from the outer scope.',
          'element.addEventListener("click", function () { this }) gives the element.\nWith an arrow, this is whatever this was outside (often undefined in a module).\nevent.currentTarget is clearer and works in both cases.\nevent.target can be a child element, not the listener element.\nStrong answer recommends currentTarget; weak answer says this is always the clicked element.',
          [
            E('Predict what is logged when the span inside the button is clicked.', 'Shows a normal-function listener on a button that contains a span.',
              'this is the button and event.target is the span. Many candidates think this is the span.',
              { code: `button.addEventListener('click', function (e) {\n  console.log(this.tagName, e.target.tagName);\n});` }),
            E('Rewrite the listener as an arrow function without using this.', 'Checks currentTarget.',
              'Use e.currentTarget, which is the element the listener is attached to.',
              { solution: `button.addEventListener('click', (e) => {\n  e.currentTarget.classList.toggle('active');\n});` }),
          ]),
      ],
      middle: [
        Q('Compare a class method and an arrow function class field. What are the trade-offs?',
          'A class method lives once on the prototype and needs binding when passed around. An arrow field is created per instance, is always bound, but uses more memory and is not on the prototype.',
          'Methods are shared; arrow fields are copied into each instance.\nArrow fields cannot be overridden with super.method() in subclasses in the normal way.\nArrow fields are hard to spy on via the prototype in tests.\nFor many instances (thousands of rows) arrow fields cost memory.\nFor a few UI objects the convenience is often worth it.\nStrong answer names inheritance and testing effects, not only memory.',
          [
            E('Predict the output when a subclass calls super.handle().', 'Parent defines handle as an arrow field, child defines a method that calls super.handle().',
              'It throws TypeError: super.handle is not a function, because the arrow field is on the instance, not on Parent.prototype. Also the instance field shadows the child method.',
              { code: `class Parent { handle = () => 'parent'; }\nclass Child extends Parent { handle() { return super.handle() + '!'; } }\nconsole.log(new Child().handle());` }),
            E('Choose method or arrow field for a Row class with 10,000 instances. Explain.', 'Short judgment question.',
              'Prefer a prototype method and bind only where it is passed as a callback, or use event delegation. Arrow fields would create 10,000 function objects.'),
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
              task: 'Make where return a new Query instead of changing the old one.',
              description: 'Checks the immutable builder idea.',
              answer: 'Create a new instance, copy the parts with the new item added, and return it. The original stays the same, so it can be shared safely.',
              solution: `where(cond) {
  const q = new Query();
  q.parts = [...this.parts, 'WHERE ' + cond];
  return q;
}`,
            },
            {
              task: 'In TypeScript, what return type makes chaining work in subclasses?',
              description: 'Checks the polymorphic this type.',
              answer: 'Use the return type this. Then a subclass method chain keeps the subclass type, not the base class type.',
            },
          ],
        },
        Q('What is this at the top level of a module, a script, and a function in strict mode?',
          'At the top of an ES module, this is undefined. At the top of a classic script, it is globalThis (window). In a strict-mode plain function call, it is undefined.',
          'ES modules and class bodies are always strict.\nClassic scripts without "use strict" use sloppy mode: plain calls get globalThis.\nIn CommonJS (Node), top-level this is module.exports.\nUse globalThis when you need the global object everywhere.\nThis matters when moving old scripts to modules: code using this as window breaks.\nStrong answer covers modules versus scripts.',
          [
            E('Predict what is logged in a classic script versus a module.', 'Shows console.log(this === window) in both contexts.',
              'true in a classic script, false in a module (this is undefined). Many candidates do not know modules change this.'),
            E('Fix old code that uses this.setTimeout at the top level after moving to modules.', 'Migration bug.',
              'Use globalThis.setTimeout or just setTimeout. this is undefined in modules.',
              { code: `this.setTimeout(run, 100);`, solution: `setTimeout(run, 100);` }),
          ]),
      ],
      senior: [
        Q('Find and fix the bug. The listener is never removed, and memory grows.',
          'bind creates a new function every time, so removeEventListener gets a different reference. Store the bound function once, or use an AbortController signal.',
          'removeEventListener needs the same function reference and the same capture flag.\nEach .bind(this) call returns a new function.\nStore it in a field, or use an arrow class field.\nModern option: addEventListener(type, fn, { signal }) and controller.abort() removes all at once.\nLeaked listeners keep components alive and cause duplicate handlers.\nStrong answer mentions AbortController and the capture flag.',
          [
            E('Rewrite the component to remove all its listeners with one call.', 'Checks AbortController with addEventListener.',
              'Create a controller in mount, pass signal to each listener, call abort in unmount.',
              { solution: `mount() {\n  this.ac = new AbortController();\n  window.addEventListener('resize', () => this.onResize(), { signal: this.ac.signal });\n  window.addEventListener('scroll', () => this.onScroll(), { signal: this.ac.signal, passive: true });\n}\nunmount() { this.ac.abort(); }` }),
            E('Explain why this call still fails: add with capture true, remove without it.', 'Shows add with { capture: true } and remove with no options.',
              'Capture is part of the listener identity. Remove must pass the same capture value. Other options like passive do not matter for removal.'),
          ],
          { code: `class Widget {\n  mount() { window.addEventListener('resize', this.onResize.bind(this)); }\n  unmount() { window.removeEventListener('resize', this.onResize.bind(this)); }\n  onResize() { this.layout(); }\n}`,
            fix: `class Widget {\n  onResize = () => this.layout();\n  mount() { window.addEventListener('resize', this.onResize); }\n  unmount() { window.removeEventListener('resize', this.onResize); }\n}` }),
        Q('How do this and super work in static methods and in inherited classes?',
          'In a static method, this is the class it was called on, so a subclass call gets the subclass. super is fixed by where the method is defined (its home object), not by this.',
          'static create() { return new this(); } returns a subclass instance when called as Child.create().\nsuper looks up the prototype of the home object, which is set at definition time.\nCopying a method to another object keeps the old super binding.\nIn derived constructors, this is not available until super() is called (ReferenceError).\nArrow functions inside methods take both this and super from the method.\nStrong answer explains the home object idea.',
          [
            E('Predict the class of the object created by Child.create().', 'Parent has static create() { return new this(); }.',
              'It is a Child instance, because this is Child at call time. Weak answers say Parent.',
              { code: `class Parent { static create() { return new this(); } }\nclass Child extends Parent {}\nconsole.log(Child.create() instanceof Child);` }),
            E('Explain the error when this is used before super in a constructor.', 'Shows a derived constructor setting this.x before super().',
              'ReferenceError: the object is created by the base constructor, so this does not exist until super() returns.'),
          ]),
        Q('What does Reflect.get with a receiver do? How does it relate to this in getters and Proxies?',
          'The receiver is the value used as this when a getter runs. In a Proxy get trap, pass receiver to Reflect.get so getters see the proxy, not the raw target.',
          'Reflect.get(target, key, receiver) runs getters with this = receiver.\nIf a trap returns target[key], getters run with this = target and skip the proxy.\nThis breaks reactivity systems (like Vue) and logging proxies for nested access.\nPrivate #fields do not work through a Proxy: methods that read #x with this = proxy throw TypeError.\nCommon fix: bind methods to the target or avoid proxies for classes with private fields.\nStrong answer mentions the private field trap.',
          [
            E('Fix a logging proxy so getters that use this are also logged.', 'Trap returns target[key].',
              'Return Reflect.get(target, key, receiver). Now this inside the getter is the proxy, so inner reads also go through the trap.',
              { code: `new Proxy(obj, { get(t, k) { log(k); return t[k]; } });`, solution: `new Proxy(obj, { get(t, k, r) { log(k); return Reflect.get(t, k, r); } });` }),
            E('Predict what happens when a class with a private field is wrapped in a Proxy and a method is called.', 'Method reads this.#count.',
              'TypeError, because this is the proxy and the proxy has no #count slot. Strong candidates know this limit.'),
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
              task: 'Type this in a standalone function so it can only be called on a Button.',
              description: 'Checks the this parameter syntax.',
              answer: 'Add this: Button as the first parameter. Callers must use call, apply, or a method call on a Button, or the compiler errors.',
              solution: `function onClick(this: Button, e: MouseEvent) {
  this.setPressed(true);
}`,
            },
            {
              task: 'Which lint rule warns about passing a class method as a callback? What does it suggest?',
              description: 'Checks tool knowledge.',
              answer: '@typescript-eslint/unbound-method. It suggests binding, using an arrow wrapper, or declaring the method as an arrow field or with this: void.',
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
              code: `const obj = { name: 'Ann', greet() { return this.name; } };
const g = obj.greet;
g(); // undefined or TypeError`,
              task: 'Write a short code example you would show to explain a detached method.',
              description: 'Checks teaching ability with a minimal example.',
              answer: 'Show a method that works as obj.greet() but fails as const g = obj.greet; g(). Then fix it with bind or an arrow wrapper.',
            },
            {
              task: 'List three rules you would put in the team guide about this.',
              description: 'Checks practical, short guidance.',
              answer: 'For example: use arrow functions for callbacks; never pass a method that uses this without binding it; prefer plain functions and closures in shared utilities.',
            },
          ],
        },
        Q('Code review: find the this-related bugs in this plugin system and propose a safer design.',
          'Hooks are stored and called detached, so this is lost, and the bind in register creates references that cannot be removed. Pass context as an argument instead of relying on this.',
          'Calling hook() from an array loses the plugin object.\nExplicit context argument (hook(ctx)) is clearer and easier to type.\nReturn an unregister function from register so callers do not need the reference.\nCatch errors per hook so one plugin cannot break others.\nDocument the contract in types.\nStrong answer combines bug fix and API improvement.',
          [
            E('Implement register that returns an unregister function.', 'Checks a clean subscription API.',
              'Store the handler in a Set and return a function that deletes it.',
              { solution: `const hooks = new Set();\nexport function register(fn) { hooks.add(fn); return () => hooks.delete(fn); }\nexport function run(ctx) { for (const fn of hooks) { try { fn(ctx); } catch (e) { report(e); } } }` }),
            E('Explain why passing context as an argument is easier to test than this.', 'Short theory.',
              'Tests can pass any fake object directly. No bind or call is needed and types describe the input clearly.'),
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
            E('Predict what is logged.', 'Shows var and let declared inside an if block, then read outside.',
              'a is 1 because var ignores blocks. Reading b throws ReferenceError because let is block-scoped.',
              { code: `if (true) { var a = 1; let b = 2; }\nconsole.log(a);\nconsole.log(b);` }),
            E('Explain why this const array can still change.', 'Shows const list = []; list.push(1).',
              'const blocks reassignment of the variable, not changes inside the object. Use Object.freeze for a shallow read-only object.'),
          ]),
        Q('Find and fix the bug. The function always returns the default name.',
          'The inner let creates a new variable that shadows the outer one, so the outer name is never changed. Assign to the outer variable instead.',
          'Declaring a variable with the same name in an inner block hides the outer one (shadowing).\nThe inner name is gone after the block ends.\nFix: remove let inside the block and assign to the outer variable.\nLinters catch this with no-shadow.\nStrong answer names shadowing and mentions the lint rule.\nWeak answer moves code around without explaining.',
          [
            E('Find the shadowing bug in a loop that sums values.', 'Shows let total declared again inside the loop.',
              'Each loop creates a new total, so the outer one stays 0. Remove the inner let.',
              { code: `let total = 0;\nfor (const n of nums) { let total = total + n; }`, solution: `let total = 0;\nfor (const n of nums) { total = total + n; }` }),
            E('Predict the result of the same code with var instead of let inside the loop.', 'Checks var redeclaration rules.',
              'var redeclares the same function-scoped variable, so the sum works. But this is confusing; avoid it.'),
          ],
          { code: `function getName(user) {\n  let name = 'Guest';\n  if (user) {\n    let name = user.name;\n  }\n  return name;\n}`,
            fix: `function getName(user) {\n  let name = 'Guest';\n  if (user) {\n    name = user.name;\n  }\n  return name;\n}` }),
        Q('What is hoisting? Why can you call a function declaration before it is written, but not a function expression?',
          'Declarations are processed before code runs. Function declarations are hoisted with their body. A const or let function expression is in the TDZ, and a var one is undefined.',
          'function f() {} is fully available at the top of its scope.\nconst f = () => {} throws ReferenceError if called before the line.\nvar f = function () {} gives TypeError: f is not a function, because f is undefined.\nClasses are hoisted like let (TDZ).\nStrong answer explains all three error types.\nWeak answer says "JavaScript moves code to the top".',
          [
            E('Predict the error for each call.', 'Shows three calls before definitions: declaration, var expression, const arrow.',
              'a() works. b() throws TypeError because b is undefined. c() throws ReferenceError because of the TDZ.',
              { code: `a(); b(); c();\nfunction a() {}\nvar b = function () {};\nconst c = () => {};` }),
            E('Explain why a team might still prefer const arrow functions.', 'Short opinion question.',
              'Order of definition becomes explicit, no accidental reassignment, and this works like outer code. Some prefer declarations for readability; both are fine with a team rule.'),
          ]),
      ],
      middle: [
        Q('How can you create private state with closures? Compare it to private class fields.',
          'A factory function keeps variables in its scope and returns functions that use them. Nothing outside can read them. Private #fields give similar privacy inside classes.',
          'Closure privacy is real: no reflection can read local variables.\n#fields are also truly private, checked by the engine.\nClosures create new functions per instance; class methods are shared on the prototype.\n#fields support brand checks (#x in obj).\nConvention-only privacy (_name) is not private.\nStrong answer compares memory, inheritance and testing.',
          [
            E('Write createWallet with a private balance and deposit and getBalance functions.', 'Checks closure-based encapsulation.',
              'Keep balance as a local let; return an object with functions that read and change it. Validate the amount.',
              { solution: `function createWallet() {\n  let balance = 0;\n  return {\n    deposit(n) { if (n > 0) balance += n; },\n    getBalance: () => balance,\n  };\n}` }),
            E('Rewrite createWallet as a class with a private field.', 'Comparison exercise.',
              'Use #balance and methods on the prototype. Mention that this version shares methods but needs care when methods are passed as callbacks.',
              { solution: `class Wallet {\n  #balance = 0;\n  deposit(n) { if (n > 0) this.#balance += n; }\n  getBalance() { return this.#balance; }\n}` }),
          ]),
        Q('Find and fix the bug. Two counters share the same count.',
          'count is declared outside the factory, so every counter closes over the same variable. Move it inside the factory so each call gets its own.',
          'A closure captures variables, not copies of values.\nIf the variable is in module scope, it is shared by all functions.\nEach function call creates a new scope; put per-instance state there.\nThe same bug appears with module-level caches shared between components.\nStrong answer explains "closures capture variables by reference".',
          [
            E('Predict the output of the buggy code.', 'Two counters created, a.inc() twice and b.inc() once.',
              'It logs 3, because both share one count. Fixed version logs 2 and 1.'),
            E('Explain where state lives after the fix.', 'Theory follow-up.',
              'Each createCounter call creates a new environment record with its own count. The returned functions keep that record alive.'),
          ],
          { code: `let count = 0;\nfunction createCounter() {\n  return { inc: () => ++count };\n}\nconst a = createCounter();\nconst b = createCounter();`,
            fix: `function createCounter() {\n  let count = 0;\n  return { inc: () => ++count };\n}` }),
        Q('What is an IIFE? Do we still need it with modules and block scope?',
          'An IIFE is a function called right after it is defined, to create a private scope. Modules and let/const cover most uses today, but it is still used for async start-up code or inline scripts.',
          'Pattern: (function () { ... })(); or (() => { ... })();\nHistory: avoided globals before modules existed.\nModules give file scope; blocks { } give scope for let and const.\nModern use: (async () => { await init(); })() where top-level await is not available.\nA leading semicolon protects against ASI issues when files are concatenated.\nStrong answer knows why it was needed and what replaced it.',
          [
            E('Rewrite this IIFE with block scope.', 'Shows an IIFE that only hides two variables.',
              'Use a plain block with let or const inside. Same privacy, less noise.',
              { code: `(function () { const a = 1; const b = 2; run(a, b); })();`, solution: `{\n  const a = 1;\n  const b = 2;\n  run(a, b);\n}` }),
            E('Find the bug when two files are joined and the second starts with an IIFE.', 'First file ends with const x = y without a semicolon.',
              'JS reads y(function...) as a function call. Add a semicolon at the end of the line or before the IIFE.'),
          ]),
      ],
      senior: [
        Q('Why can a closure keep a large object in memory even if it does not use it? How do engines share closure scopes?',
          'In V8, all closures created in the same scope share one context object. If any closure uses a big variable, the context holds it, and every closure keeps it alive.',
          'Only variables used by some inner function are put in the context.\nBut the context is shared by all inner functions of that scope.\nA small long-lived callback can then retain big data used by another short-lived one.\nFix: set the big variable to null when done, or move work into a separate function.\nUse heap snapshots and look at "context" in retainers.\nStrong answer can read a retainer path; weak answer says closures copy everything.',
          [
            E('Find the leak in this code.', 'One inner function uses a big array, another small one is stored globally.',
              'Both closures share the context with bigData, so the stored handler keeps it alive. Move processing to a separate function or clear bigData.',
              { code: `function setup() {\n  const bigData = new Array(1e6).fill('x');\n  const process = () => bigData.length;\n  process();\n  window.onresize = () => console.log('resize');\n}` }),
            E('Describe how you confirm the leak in Chrome DevTools.', 'Practical debugging question.',
              'Take heap snapshots before and after, compare, find the array, check its retainers for a context of the resize handler. Strong answers mention the Allocation timeline.'),
          ], { ai: true }),
        Q('Find and fix the bug. This memoized selector returns stale data after filters change.',
          'The cache key uses only the list, but the closure also reads filter from outer scope. When filter changes, the old result is returned. Include every input in the key.',
          'Memoization is only correct if the result depends only on the key.\nReading outer variables makes hidden inputs.\nFix: pass all inputs as arguments and compare all of them.\nThe same bug exists in useMemo with missing dependencies.\nLint rules (react-hooks/exhaustive-deps) catch some cases.\nStrong answer names "hidden dependency" as the root cause.',
          [
            E('Write memoizeLast that caches only the last call for any number of arguments.', 'Common pattern for selectors.',
              'Store last args and result; compare each argument with Object.is.',
              { solution: `function memoizeLast(fn) {\n  let lastArgs, lastResult;\n  return (...args) => {\n    if (lastArgs && args.length === lastArgs.length && args.every((a, i) => Object.is(a, lastArgs[i]))) return lastResult;\n    lastArgs = args;\n    return (lastResult = fn(...args));\n  };\n}` }),
            E('Explain why a memoized function should be pure.', 'Theory.',
              'If it reads outside state or has side effects, cached results become wrong or side effects are skipped.'),
          ],
          { code: `let filter = 'all';\nlet lastList, lastResult;\nfunction select(list) {\n  if (list === lastList) return lastResult;\n  lastList = list;\n  return (lastResult = list.filter((i) => filter === 'all' || i.status === filter));\n}`,
            fix: `const select = memoizeLast((list, filter) =>\n  list.filter((i) => filter === 'all' || i.status === filter));\nselect(list, filter);` }),
        Q('How does a module scope differ from a closure? What problems can module-level state cause?',
          'A module is evaluated once and its top-level variables are shared by every importer. It works like one big closure, a singleton. Hidden shared state makes tests and SSR unreliable.',
          'ES modules are cached by URL; all importers get the same instance.\nModule-level caches leak between tests unless reset.\nOn a server (SSR), module state is shared between users\' requests.\nHMR can keep or duplicate state in odd ways.\nPrefer explicit instances (createStore()) passed via context or DI.\nStrong answer mentions SSR data leaks between users.',
          [
            E('Explain why a test passes alone but fails when run with others.', 'Module has let cache = new Map().',
              'The cache keeps values from earlier tests. Export a reset function, use vi.resetModules, or design an instance-based cache.'),
            E('Refactor a module-level cache into a factory.', 'Checks design skill.',
              'Return a cache object from createCache; the app creates one and passes it down.',
              { code: `const cache = new Map();\nexport const get = (k) => cache.get(k);`, solution: `export function createCache() {\n  const cache = new Map();\n  return { get: (k) => cache.get(k), set: (k, v) => cache.set(k, v), clear: () => cache.clear() };\n}` }),
          ]),
      ],
      techlead: [
        Q('Code review: this server-rendered app stores the current user in a module variable. What is wrong, and what rule do you set?',
          'Module state is shared by all requests on the server, so one user can see another user\'s data. Keep request data in request-scoped storage, like AsyncLocalStorage or framework context.',
          'Node handles many requests in one process; module variables are global for all of them.\nWith async code, requests interleave, so the variable changes mid-render.\nThis is a security incident (data leak), not only a bug.\nFix: pass user through context or use AsyncLocalStorage.\nRule: no mutable module-level state in code that runs on the server; lint or review checklist.\nStrong answer treats it as a security issue and adds a test.',
          [
            E('Rewrite it with AsyncLocalStorage.', 'Checks knowledge of request-scoped storage in Node.',
              'Create one storage instance, run each request inside storage.run(user, handler), and read with getStore().',
              { solution: `import { AsyncLocalStorage } from 'node:async_hooks';\nconst userStore = new AsyncLocalStorage();\nexport const getUser = () => userStore.getStore();\napp.use((req, res, next) => userStore.run(req.user, next));` }),
            E('How would you check if this bug already leaked data in production?', 'Incident judgment.',
              'Check logs for mismatched user IDs in responses, estimate exposure window, involve security, and follow disclosure rules. Strong answers act fast and transparently.'),
          ],
          { code: `let currentUser = null;\nexport function setUser(u) { currentUser = u; }\nexport function renderHeader() { return '<b>' + currentUser.name + '</b>'; }`,
            fix: `export function renderHeader(ctx) { return '<b>' + escapeHtml(ctx.user.name) + '</b>'; }\n// or read the user from AsyncLocalStorage per request` }),
        Q('How do you teach closures and scope to junior developers so they avoid common bugs?',
          'Use small runnable examples of real bugs (stale closures, loop variables, shadowing), pair on code review, and back it up with lint rules. Focus on mental models, not definitions.',
          'Start with "functions remember where they were created".\nShow real bugs from your own codebase.\nUse DevTools scope panel to make closures visible.\nLint: no-shadow, no-var, react-hooks/exhaustive-deps.\nFollow up in code review with links to a short guide.\nStrong answer has concrete examples from mentoring experience.',
          [
            E('Prepare a five-minute exercise that shows a stale closure.', 'The candidate designs it live.',
              'A good exercise is tiny, runnable, and has a clear "aha". For example a timer that logs an old state value.'),
            E('Tell how you handled a team member who kept making the same scope bug.', 'Behavioural question.',
              'Strong answers describe pairing, a lint rule, and checking progress, not blame.'),
          ], { ai: true }),
        Q('Code review: a feature flag helper keeps flags in a closure and never refreshes them. What risks do you see and how do you fix it?',
          'Flags are read once and captured forever, so changes or kill switches never reach running tabs. Read flags through a function on each use, and subscribe to updates.',
          'Capturing a value at module load makes a snapshot, not a live value.\nKill switches are useless if clients never refresh.\nFix: getFlag(name) reads from a store that updates (polling, SSE, or on focus).\nDecide consistency: flags may need to stay stable during one user flow.\nAdd telemetry for which flag values clients use.\nStrong answer balances freshness with stability.',
          [
            E('Rewrite the helper so flags can update without a page reload.', 'Checks store plus subscribe design.',
              'Keep flags in a mutable store, expose getFlag and subscribe, refresh on an interval or push event.',
              { solution: `let flags = {};\nconst subs = new Set();\nexport const getFlag = (n) => Boolean(flags[n]);\nexport const subscribe = (fn) => (subs.add(fn), () => subs.delete(fn));\nexport function setFlags(next) { flags = next; subs.forEach((fn) => fn()); }` }),
            E('When should a flag value NOT change during a session?', 'Judgment.',
              'During a checkout or a multi-step form, switching behaviour mid-flow can break it. Strong answers mention snapshotting per flow.'),
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
              task: 'Write the sleep helper.',
              description: 'Checks wrapping setTimeout in a promise.',
              answer: 'Return a new promise and pass resolve to setTimeout as the callback.',
              solution: 'const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));',
            },
            {
              task: 'Fix it without async and await.',
              description: 'Checks the delay-based fix.',
              answer: 'Multiply the delay by i, so the timers end at 1, 2 and 3 seconds.',
              solution: 'for (let i = 1; i <= 3; i++) setTimeout(() => console.log(i), i * 1000);',
            },
          ],
        },
        Q('Find and fix the bug. The check is always true, even when the user is not an admin.',
          'isAdmin is async, so it returns a Promise. A Promise object is always truthy. Await the result.',
          'Every async function returns a Promise.\nif (promise) is always true.\nFix: if (await isAdmin(user)) inside an async function.\nTypeScript and the lint rule no-misused-promises catch this.\nThe same bug happens with filter(async ...) which keeps every item.\nStrong answer mentions the lint rule and the filter trap.',
          [
            E('Find the bug in filter with an async callback.', 'Shows users.filter(async (u) => await isActive(u)).',
              'filter gets Promises, which are truthy, so nothing is removed. Resolve all checks first with Promise.all, then filter.',
              { solution: `const flags = await Promise.all(users.map(isActive));\nconst active = users.filter((_, i) => flags[i]);` }),
            E('What does an async function return when you return 5?', 'Quick theory.',
              'A Promise fulfilled with 5. You need await or then to get 5.'),
          ],
          { code: `async function isAdmin(user) {\n  const r = await fetch('/api/roles/' + user.id);\n  return (await r.json()).admin;\n}\nif (isAdmin(user)) showAdminPanel();`,
            fix: `if (await isAdmin(user)) showAdminPanel();` }),
        Q('Does fetch reject when the server returns error 404 or 500? How do you handle errors with fetch?',
          'No. fetch rejects only on network errors or abort. For 404 or 500 it resolves, so you must check response.ok or response.status.',
          'fetch resolves with a Response for any HTTP status.\nresponse.ok is true for status 200 to 299.\nThrow your own error when ok is false.\nresponse.json() can also reject if the body is not valid JSON.\nWrap it in a small helper used by the whole app.\nStrong answer knows about ok; weak answer only uses catch.',
          [
            E('Write a helper getJson that throws on bad HTTP status.', 'Checks response.ok handling.',
              'Check r.ok, throw an Error with the status, otherwise return r.json().',
              { solution: `async function getJson(url) {\n  const r = await fetch(url);\n  if (!r.ok) throw new Error('HTTP ' + r.status);\n  return r.json();\n}` }),
            E('Predict: which branch runs for a 404?', 'Shows fetch(...).then(() => log("ok")).catch(() => log("error")).',
              '"ok" runs, because the Promise resolves. Many juniors expect "error".'),
          ]),
      ],
      middle: [
        Q('Find and fix the bug. In a search box, old results sometimes replace new ones.',
          'Requests can finish in any order, so a slow old response overwrites a fast new one. Cancel the previous request with AbortController, or ignore stale responses.',
          'This is a race condition between overlapping requests.\nAbortController cancels the old fetch; it rejects with an AbortError, which you should ignore.\nAlternative: keep a request id and only apply the latest.\nAdd debounce to send fewer requests.\nLibraries like TanStack Query handle this per query key.\nStrong answer handles AbortError separately from real errors.',
          [
            E('Implement the "latest request wins" fix without AbortController.', 'Checks the request id pattern.',
              'Increment a counter before each request and compare it after the response.',
              { solution: `let lastId = 0;\nasync function search(q) {\n  const id = ++lastId;\n  const data = await getJson('/search?q=' + encodeURIComponent(q));\n  if (id === lastId) render(data);\n}` }),
            E('Explain why the request id fix still wastes resources.', 'Comparison question.',
              'Old requests still run and use the network and server. AbortController actually stops them on the client side.'),
          ],
          { code: `input.addEventListener('input', async (e) => {\n  const res = await fetch('/search?q=' + e.target.value);\n  render(await res.json());\n});`,
            fix: `let controller;\ninput.addEventListener('input', async (e) => {\n  controller?.abort();\n  controller = new AbortController();\n  try {\n    const res = await fetch('/search?q=' + encodeURIComponent(e.target.value), { signal: controller.signal });\n    render(await res.json());\n  } catch (err) {\n    if (err.name !== 'AbortError') showError(err);\n  }\n});` }),
        Q('How do you add a timeout to a fetch request?',
          'Use AbortSignal.timeout(ms) as the signal. To also support manual cancel, combine signals with AbortSignal.any.',
          'fetch(url, { signal: AbortSignal.timeout(5000) }) rejects with a TimeoutError DOMException.\nManual abort gives AbortError, so you can tell them apart.\nAbortSignal.any([userSignal, AbortSignal.timeout(5000)]) combines both (supported in modern browsers).\nPromise.race with a timer does not stop the request; it only ignores it.\nStrong answer knows race does not cancel.',
          [
            E('Write fetchWithTimeout that supports both a timeout and a caller signal.', 'Checks AbortSignal.any.',
              'Combine the caller signal and a timeout signal.',
              { solution: `function fetchWithTimeout(url, { signal, ms = 5000, ...opts } = {}) {\n  const timeout = AbortSignal.timeout(ms);\n  return fetch(url, { ...opts, signal: signal ? AbortSignal.any([signal, timeout]) : timeout });\n}` }),
            E('Explain the problem with Promise.race and setTimeout for timeouts.', 'Theory.',
              'The race rejects, but the fetch keeps running and the timer may keep running too. Clean up the timer and abort the request.'),
          ]),
        Q('Find and fix the bug. The error is not caught by try and catch.',
          'The error is thrown inside a setTimeout callback, which runs later, after try finished. Wrap the timer in a Promise and await it, or catch inside the callback.',
          'try and catch only catch errors thrown while the try block is running.\nCallbacks run in a later task with a new call stack.\nPromisify the timer: await new Promise((r) => setTimeout(r, ms)), then do the work.\nThe same applies to event listeners.\nGlobal handlers (window.onerror) catch it, but too late for local handling.\nStrong answer explains the call stack reason.',
          [
            E('Write a sleep function and use it to fix the code.', 'Checks promisifying a timer.',
              'Return a Promise resolved by setTimeout, then await it in the async function.',
              { solution: `const sleep = (ms) => new Promise((r) => setTimeout(r, ms));\nasync function run() {\n  try { await sleep(100); JSON.parse(bad); } catch (e) { report(e); }\n}` }),
            E('Does catch catch an error from a promise that you do not await?', 'Shows try { doAsync(); } catch {}.',
              'No. The rejection happens later and becomes an unhandled rejection. You must await or attach catch.'),
          ],
          { code: `try {\n  setTimeout(() => { JSON.parse(bad); }, 100);\n} catch (e) {\n  report(e); // never runs\n}`,
            fix: `setTimeout(() => {\n  try { JSON.parse(bad); } catch (e) { report(e); }\n}, 100);` }),
      ],
      senior: [
        Q('Implement retry with exponential backoff and jitter. Which errors should you retry?',
          'Retry only temporary failures (network errors, 429, 502 to 504) with growing delays plus random jitter, and a maximum attempt count. Never blindly retry non-safe requests like POST without an idempotency key.',
          'Backoff: delay = base * 2^attempt, capped.\nJitter spreads retries so clients do not hit the server at the same time.\nRespect the Retry-After header for 429 and 503.\nDo not retry 400, 401, 403 or 404.\nSupport cancel with AbortSignal.\nStrong answer covers safe methods and server load.',
          [
            E('Write retry(fn, { retries, base }) with full jitter.', 'The candidate codes it live.',
              'Loop with try and catch, stop if the error is not retryable or attempts are used, wait a random time between 0 and the capped backoff.',
              { solution: `async function retry(fn, { retries = 3, base = 200, max = 5000, isRetryable = () => true } = {}) {\n  for (let i = 0; ; i++) {\n    try { return await fn(); }\n    catch (e) {\n      if (i >= retries || !isRetryable(e)) throw e;\n      const delay = Math.random() * Math.min(max, base * 2 ** i);\n      await new Promise((r) => setTimeout(r, delay));\n    }\n  }\n}` }),
            E('Explain what can go wrong when 10,000 clients retry with the same fixed delay.', 'System thinking.',
              'They all retry at the same moment (thundering herd) and can keep the server down. Jitter and a circuit breaker help.'),
          ]),
        Q('How do you read a large response step by step with streams in the browser?',
          'response.body is a ReadableStream. Read chunks with a reader or for await, decode with TextDecoderStream, and process data as it arrives instead of waiting for the whole body.',
          'Streams lower memory use and show results sooner (for example NDJSON or AI token streaming).\nresponse.body.pipeThrough(new TextDecoderStream()) gives text chunks.\nChunks do not align with lines; buffer partial lines.\nCancel with AbortController or reader.cancel().\nfor await over a ReadableStream is supported in modern browsers; reader.read() works everywhere.\nStrong answer mentions the partial line problem.',
          [
            E('Parse a stream of newline-separated JSON objects.', 'Checks buffering between chunks.',
              'Keep a buffer, split by newline, keep the last part for the next chunk, parse complete lines.',
              { solution: `async function* ndjson(res) {\n  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();\n  let buf = '';\n  for (;;) {\n    const { value, done } = await reader.read();\n    if (done) break;\n    buf += value;\n    const lines = buf.split('\\n');\n    buf = lines.pop();\n    for (const l of lines) if (l.trim()) yield JSON.parse(l);\n  }\n  if (buf.trim()) yield JSON.parse(buf);\n}` }),
            E('What happens if you call response.json() after reading the body as a stream?', 'Checks body usage rules.',
              'It rejects with TypeError, because the body is already used. A body can be read only once; use response.clone() before reading if you need it twice.'),
          ]),
        Q('What does top-level await do to module loading? When is it a problem?',
          'Top-level await pauses evaluation of that module and of every module that imports it until the promise settles. A slow await can delay app start-up for the whole graph.',
          'Sibling modules that do not depend on it can still evaluate.\nUseful for loading config or WASM before exports are used.\nRisk: a network call at top level blocks first render.\nIf the promise rejects, the import fails.\nCircular imports with top-level await can deadlock.\nStrong answer prefers lazy init for non-critical data.',
          [
            E('Refactor a module that awaits a config fetch at top level so it does not block start-up.', 'Checks lazy initialisation.',
              'Export a function that caches the promise and returns it on demand.',
              { code: `export const config = await fetch('/config').then((r) => r.json());`, solution: `let configPromise;\nexport const getConfig = () => (configPromise ??= fetch('/config').then((r) => r.json()));` }),
            E('When is top-level await the right choice?', 'Judgment.',
              'When a module cannot work at all without the value, like a WASM module or a required polyfill, and the cost is small. Strong answers mention measuring start-up time.'),
          ]),
      ],
      techlead: [
        Q('Your product needs live updates. How do you choose between polling, Server-Sent Events, and WebSockets?',
          'Polling is simplest and cache-friendly; SSE is good for one-way server-to-client streams over HTTP; WebSockets are for frequent two-way messages. Choose by direction, rate, infrastructure and scale.',
          'Polling: easy, works with CDNs, but delayed and wasteful at high rates.\nSSE: auto reconnect, works over HTTP/2, text only, one direction.\nWebSockets: two-way, binary, but needs sticky sessions or a broker and more ops work.\nConsider mobile battery, proxies, auth and reconnection.\nStart simple; move when metrics show the need.\nStrong answer uses examples from real systems.',
          [
            E('Pick a transport for a notification badge that updates a few times per hour.', 'Short decision.',
              'Polling on focus plus a long interval, or SSE if infrastructure already supports it. WebSockets are overkill here.'),
            E('Pick a transport for a collaborative editor.', 'Contrast case.',
              'WebSockets (or WebRTC) for low-latency two-way updates, with a CRDT or OT layer. Strong answers mention reconnection and offline sync.'),
          ], { ai: true }),
        Q('Code review: analytics events are sent with fetch in a page unload handler and many are lost. What do you change?',
          'Unload handlers are unreliable and requests can be cancelled when the page closes. Send on visibilitychange to hidden with navigator.sendBeacon or fetch with keepalive, and batch events.',
          'unload and beforeunload do not fire reliably, especially on mobile, and they block the back/forward cache.\nvisibilitychange (hidden) is the last reliable moment.\nsendBeacon queues a small POST that survives page close.\nfetch with keepalive: true works the same way, with a body size limit (about 64 KB total).\nBatch events and flush on hidden.\nStrong answer mentions bfcache.',
          [
            E('Rewrite the code using visibilitychange and sendBeacon.', 'Checks the modern pattern.',
              'Listen to visibilitychange, check document.visibilityState === "hidden", send the queued events as one beacon.',
              { solution: `document.addEventListener('visibilitychange', () => {\n  if (document.visibilityState === 'hidden' && queue.length) {\n    navigator.sendBeacon('/analytics', JSON.stringify(queue.splice(0)));\n  }\n});` }),
            E('Why does an unload listener hurt performance?', 'Theory.',
              'Pages with unload listeners are often not put into the back/forward cache, so back navigation is slower.'),
          ],
          { code: `window.addEventListener('unload', () => {\n  fetch('/analytics', { method: 'POST', body: JSON.stringify(queue) });\n});`,
            fix: `document.addEventListener('visibilitychange', () => {\n  if (document.visibilityState === 'hidden' && queue.length) {\n    navigator.sendBeacon('/analytics', JSON.stringify(queue.splice(0)));\n  }\n});` }),
        Q('How do you set a team standard for async error handling, from the network call to the user message?',
          'Define layers: one HTTP client that normalises errors, a data layer that handles retries and cancel, and UI rules for showing errors. Report unexpected errors to monitoring, and ignore expected ones like AbortError.',
          'Typed error classes (NetworkError, HttpError with status, ValidationError).\nOne place for retries, timeouts and auth refresh.\nUI: error boundaries, inline messages, retry buttons; never a silent catch.\nMonitoring: unhandledrejection handler, Sentry or similar, with context.\nLint: no-floating-promises.\nStrong answer shows a clear layered design and how it was adopted.',
          [
            E('Sketch the error classes and where each is created.', 'Design exercise on a whiteboard.',
              'HttpError in the client, ValidationError in schema parsing, AbortError passed through and ignored by UI. Strong answers keep the list small.'),
            E('How would you find all floating promises in an existing codebase?', 'Practical question.',
              'Enable @typescript-eslint/no-floating-promises, fix or mark with void on purpose, and track the count down over time.'),
          ], { ai: true }),
      ],
    },
    'Callbacks, Promises': {
      junior: [
        Q('What is a callback? Give one example of a sync callback and one of an async callback.',
          'A callback is a function you pass to another function to be called later. map calls it right away (sync); setTimeout or addEventListener calls it later (async).',
          'Sync: [1, 2].map((x) => x * 2) runs the callback before map returns.\nAsync: setTimeout(cb, 100) runs cb after the current code ends.\nKnowing which kind it is tells you when side effects happen.\nPass the function, do not call it: setTimeout(run) not setTimeout(run()).\nStrong answer explains the timing difference; weak answer only says "a function in a function".',
          [
            E('Predict the order of the logs.', 'Shows forEach with a log, then setTimeout with a log, then a final log.',
              'forEach logs first (sync), then the final log, then the timer log.',
              { code: `[1].forEach(() => console.log('each'));\nsetTimeout(() => console.log('timer'));\nconsole.log('end');` }),
            E('Find the bug: the function runs at once, not after one second.', 'Shows setTimeout(save(), 1000).',
              'save() is called now and its result is passed. Pass save or () => save().',
              { solution: `setTimeout(save, 1000);` }),
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
              code: 'button.addEventListener(\'click\', save());',
              task: 'Find the same kind of bug in this code.',
              description: 'Checks recognizing call versus reference in another place.',
              answer: 'save() runs right away when the page loads, and its result is used as the listener. Pass save, or an arrow function that calls it.',
            },
            {
              task: 'Make a delay helper that resolves with a value.',
              description: 'Checks passing arguments through setTimeout.',
              answer: 'Call resolve with the value inside an arrow function, or pass the value as the third argument of setTimeout.',
              solution: 'const delay = (ms, value) => new Promise((r) => setTimeout(r, ms, value));',
            },
          ],
        },
        Q('What does finally do in a promise chain? Does it change the result?',
          'finally runs a callback when the promise settles, success or error. It does not get the value and normally passes the original result or error through.',
          'Use it for cleanup like hiding a spinner.\nThe callback gets no arguments.\nIf finally throws or returns a rejected promise, that error replaces the result.\nA normal return value from finally is ignored.\nIn async functions use try/finally the same way.\nStrong answer knows the "throw replaces" rule.',
          [
            E('Hide the loading spinner after the request, success or failure.', 'Checks finally usage.',
              'Show it before, call hide in finally.',
              { solution: `showSpinner();\nload().then(render).catch(showError).finally(hideSpinner);` }),
            E('Predict the value: resolve 1, then finally returns 2.', 'Shows Promise.resolve(1).finally(() => 2).then(console.log).',
              '1, because the return value of finally is ignored.'),
          ]),
      ],
      middle: [
        Q('What is wrong with wrapping an existing promise in new Promise? When do you really need the Promise constructor?',
          'Wrapping a promise in new Promise adds code and often loses errors. Only use the constructor to turn callback or event APIs into promises.',
          'The anti-pattern: new Promise((res, rej) => fetch(u).then(res)) forgets rej, so errors hang forever.\nJust return fetch(u).then(...).\nIf the executor throws synchronously, the promise rejects; errors in nested callbacks do not.\nGood uses: setTimeout, FileReader, image onload, old callback libraries.\nPromise.withResolvers() helps when resolve is needed outside.\nStrong answer spots the missing reject path.',
          [
            E('Simplify this wrapped promise.', 'Shows a function that wraps fetch in new Promise.',
              'Return the chain directly. Errors now flow to the caller.',
              { code: `function load(u) {\n  return new Promise((resolve) => {\n    fetch(u).then((r) => r.json()).then(resolve);\n  });\n}`, solution: `const load = (u) => fetch(u).then((r) => r.json());` }),
            E('Promisify loading an image.', 'A correct use of the constructor.',
              'Resolve on load and reject on error.',
              { solution: `const loadImage = (src) => new Promise((resolve, reject) => {\n  const img = new Image();\n  img.onload = () => resolve(img);\n  img.onerror = reject;\n  img.src = src;\n});` }),
          ]),
        Q('Find and fix the bug. "All saved" is logged before the saves finish.',
          'forEach does not wait for async callbacks; it ignores the returned promises. Use for...of with await for order, or Promise.all for parallel.',
          'forEach always returns undefined.\nAsync callbacks start and return promises that nobody awaits.\nErrors from them become unhandled rejections.\nfor...of + await runs one by one.\nPromise.all(items.map(save)) runs in parallel and fails fast.\nStrong answer chooses between sequential and parallel based on needs.',
          [
            E('Change the fix so saves run in parallel but all errors are collected.', 'Checks Promise.allSettled.',
              'Use allSettled and filter rejected results.',
              { solution: `const results = await Promise.allSettled(items.map(save));\nconst failed = results.filter((r) => r.status === 'rejected');` }),
            E('Explain why reduce with async callbacks is tricky.', 'Shows items.reduce(async (acc, i) => ...).',
              'The accumulator becomes a promise, so you must await acc in each step. It is easy to get wrong; a for...of loop is clearer.'),
          ],
          { code: `items.forEach(async (item) => {\n  await save(item);\n});\nconsole.log('All saved');`,
            fix: `for (const item of items) {\n  await save(item);\n}\nconsole.log('All saved');\n// parallel: await Promise.all(items.map(save));` }),
        Q('What is the difference between then with two arguments and then followed by catch?',
          'then(onOk, onErr) does not catch errors thrown inside onOk. then(onOk).catch(onErr) catches errors from the original promise and from onOk.',
          'The second argument handles only the previous promise rejection.\ncatch at the end protects the whole chain above it.\nThe position of catch matters: after catch the chain continues as fulfilled.\nUsing a catch in the middle can hide errors and run later steps with undefined.\nStrong answer explains error flow with a small example.',
          [
            E('Predict which handler runs when onOk throws.', 'Shows p.then(() => { throw 1 }, () => log("A")).catch(() => log("B")).',
              'B runs. The second argument of the same then does not see errors from the first argument.'),
            E('Fix a chain where a catch in the middle hides an error.', 'Shows getUser().catch(log).then((u) => u.name).',
              'catch returns undefined, so u.name throws later. Rethrow in catch or move catch to the end.',
              { solution: `getUser().then((u) => u.name).catch(log);` }),
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
              task: 'Why cache the promise and not the resolved value?',
              description: 'Checks understanding of request de-duplication.',
              answer: 'If two callers ask at the same time, both get the same pending promise, so only one request is sent. Caching the value only helps after the first request finishes.',
            },
            {
              task: 'Add a TTL so entries expire.',
              description: 'Checks a simple expiry design.',
              answer: 'Store the promise with a timestamp and ignore or delete entries older than the TTL.',
              solution: `const TTL = 60_000;
function getUser(id) {
  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < TTL) return hit.p;
  const p = load(id).catch((e) => { cache.delete(id); throw e; });
  cache.set(id, { p, at: Date.now() });
  return p;
}`,
            },
          ],
        },
        Q('Find and fix the bug. A catch logs the error but the caller thinks the save worked.',
          'The catch returns undefined, so the promise resolves and the caller shows success. Rethrow after logging, or return an explicit result type.',
          'A catch that does not rethrow turns a failure into a success.\nCallers then run success code with undefined.\nRule: handle the error where you can act; otherwise log and rethrow.\nAlternative: return { ok: false, error } and make callers check it.\nAdd a cause: new Error("Save failed", { cause: e }).\nStrong answer uses error cause and explains where to handle.',
          [
            E('Rewrite it to return a result object instead of throwing.', 'Checks a result-type design.',
              'Return { ok: true, data } or { ok: false, error }. The caller must check ok.',
              { solution: `async function save(d) {\n  try { return { ok: true, data: await api.save(d) }; }\n  catch (error) { return { ok: false, error }; }\n}` }),
            E('When is swallowing an error acceptable?', 'Judgment question.',
              'For truly optional work, like a prefetch or analytics, with a comment. Never for user data.'),
          ],
          { code: `async function save(data) {\n  try {\n    return await api.save(data);\n  } catch (e) {\n    console.error(e);\n  }\n}\nawait save(form);\ntoast('Saved!');`,
            fix: `async function save(data) {\n  try {\n    return await api.save(data);\n  } catch (e) {\n    logger.error(e);\n    throw new Error('Save failed', { cause: e });\n  }\n}` }),
        Q('What is Promise.withResolvers? When would you use a deferred promise?',
          'Promise.withResolvers() returns { promise, resolve, reject } so you can settle the promise from outside. It fits cases where the resolve trigger is in a different place, like a queue or a dialog.',
          'It replaces the old pattern of saving resolve from inside new Promise.\nUseful for: waiting for a user to confirm a modal, request/response over postMessage, test helpers.\nRisk: a promise that is never resolved hangs forever and keeps memory.\nAdd timeouts or cleanup when the source goes away.\nAvailable in all modern browsers since 2024.\nStrong answer warns about never-settled promises.',
          [
            E('Write confirmDialog that returns a promise resolved by button clicks.', 'Checks deferred usage.',
              'Create resolvers, attach button listeners, resolve true or false, and clean up listeners.',
              { solution: `function confirmDialog(dialog) {\n  const { promise, resolve } = Promise.withResolvers();\n  const ac = new AbortController();\n  dialog.querySelector('.ok').addEventListener('click', () => resolve(true), { signal: ac.signal });\n  dialog.querySelector('.cancel').addEventListener('click', () => resolve(false), { signal: ac.signal });\n  dialog.showModal();\n  return promise.finally(() => { ac.abort(); dialog.close(); });\n}` }),
            E('Implement request and response over postMessage using a map of pending promises.', 'Checks ids and cleanup.',
              'Give each request an id, store resolvers in a Map, resolve on matching reply, delete on settle, reject on timeout.'),
          ]),
      ],
      techlead: [
        Q('Code review: this cache helper sometimes calls the callback right away and sometimes later. Why is that dangerous?',
          'An API that is sometimes sync and sometimes async (often called "Zalgo") makes order of code unpredictable. Make it always async, or better, return a promise.',
          'Callers write code after the call that may run before or after the callback.\nBugs appear only when data is cached, so they are hard to reproduce.\nFix: queueMicrotask(() => cb(value)) for the cached path, or return Promise.resolve(value).\nRule for shared APIs: consistent timing, documented.\nAdd tests for both cached and uncached paths.\nStrong answer names the consistency principle and adds a rule.',
          [
            E('Rewrite get to always return a promise.', 'Checks a consistent API.',
              'Cache the promise itself, so callers always await. This also removes duplicate requests in flight.',
              { solution: `const cache = new Map();\nexport function get(key) {\n  if (!cache.has(key)) cache.set(key, load(key).catch((e) => { cache.delete(key); throw e; }));\n  return cache.get(key);\n}` }),
            E('Explain why caching the promise is better than caching the value.', 'Theory.',
              'Parallel callers share one request, and the API is always async. Remember to remove failed promises from the cache.'),
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
              task: 'Write a small helper that turns a promise into a result object.',
              description: 'Checks the adapter pattern between styles.',
              answer: 'Await the promise in try and catch, and return ok true with data, or ok false with the error.',
              solution: `async function toResult(p) {
  try { return { ok: true, data: await p }; }
  catch (error) { return { ok: false, error }; }
}`,
            },
            {
              task: 'Which failures should be returned as values, and which should be thrown?',
              description: 'Checks the boundary rule.',
              answer: 'Return expected outcomes the caller must handle, like "email taken" or "not found". Throw for bugs and unexpected failures, like a null reference or a broken server, so they reach monitoring.',
            },
          ],
        },
        Q('Many promises in the app never settle and memory grows. How do you find and prevent this?',
          'Look for promises waiting on events that never come, like missing reject paths, lost messages, or forgotten dialogs. Add timeouts, AbortSignal support and cleanup, and test the unhappy paths.',
          'A pending promise keeps its callbacks and their closures alive while something can still resolve it.\nCommon causes: new Promise without reject on error, listeners never removed, request maps never cleaned.\nUse heap snapshots and count pending entries in your own maps.\nRule: every waiting API accepts a signal and has a timeout.\nReview checklist: "what if this never resolves?"\nStrong answer combines tooling with a design rule.',
          [
            E('Add a timeout and signal to a waitForMessage function.', 'Checks cleanup in all paths.',
              'Reject on timeout or abort, and remove the listener in every case.',
              { solution: `function waitForMessage(type, { signal, ms = 5000 } = {}) {\n  const { promise, resolve, reject } = Promise.withResolvers();\n  const ac = new AbortController();\n  const done = AbortSignal.any([ac.signal, ...(signal ? [signal] : [])]);\n  window.addEventListener('message', (e) => { if (e.data?.type === type) resolve(e.data); }, { signal: done });\n  const t = setTimeout(() => reject(new Error('timeout')), ms);\n  signal?.addEventListener('abort', () => reject(signal.reason), { once: true });\n  return promise.finally(() => { clearTimeout(t); ac.abort(); });\n}` }),
            E('What would you add to the code review checklist?', 'Process question.',
              'Every promise has a reject path, a timeout or signal, and cleanup in finally. Short and checkable items win.'),
          ], { ai: true }),
      ],
    },
    'Destruction and Spread operator': {
      junior: [
        Q('How do you swap two variables with destructuring? How do you skip items in array destructuring?',
          'Use [a, b] = [b, a] to swap. Leave an empty slot with a comma to skip items, like const [, second] = arr.',
          'Array destructuring works by position.\nSwap creates a temporary array on the right side, then assigns.\nA line starting with [ needs a semicolon on the line before (ASI trap).\nSkip with commas: const [first, , third] = list.\nRest collects the remaining items: const [head, ...tail] = list.\nStrong answer mentions the semicolon trap.',
          [
            E('Swap a and b without a temporary variable.', 'Basic syntax check.',
              '[a, b] = [b, a]. Use let, since const cannot be reassigned.',
              { solution: `let a = 1, b = 2;\n[a, b] = [b, a];` }),
            E('Get the first item and all the others from an array.', 'Checks rest in array destructuring.',
              'const [first, ...others] = list. The rest element must be last.',
              { solution: `const [first, ...others] = [1, 2, 3]; // 1, [2, 3]` }),
          ]),
        Q('Find and fix the bug. The default value does not work when the API sends null.',
          'Destructuring defaults apply only when the value is undefined, not null. Use the ?? operator for null.',
          'const { name = "Guest" } = { name: null } gives null.\nThe same rule applies to function parameter defaults.\n?? handles both null and undefined.\n|| would also replace empty string and 0, which may be wrong.\nStrong answer explains undefined-only defaults and chooses ?? over ||.\nWeak answer uses || without thinking about 0.',
          [
            E('Predict the values of a, b and c.', 'Shows const { a = 1, b = 1, c = 1 } = { a: undefined, b: null, c: 0 }.',
              'a is 1, b is null, c is 0. Only undefined triggers the default.'),
            E('Fix the function so null count becomes 10, but 0 stays 0.', 'Checks ?? versus ||.',
              'Use count ?? 10. With || the value 0 would become 10.',
              { code: `function show({ count = 10 }) { return count; }\nshow({ count: null }); // null`, solution: `function show({ count }) { return count ?? 10; }` }),
          ],
          { code: `const { name = 'Guest', age = 0 } = await getUser(); // { name: null, age: null }\nrender(name.toUpperCase()); // TypeError`,
            fix: `const user = await getUser();\nconst name = user.name ?? 'Guest';\nconst age = user.age ?? 0;` }),
        Q('What is the difference between rest parameters and the arguments object?',
          'Rest parameters (...args) give a real array of the remaining arguments. arguments is an old array-like object, not available in arrow functions.',
          'args.map works; arguments.map does not (convert with Array.from).\nArrow functions have no own arguments; they see the outer one.\nRest must be the last parameter.\nRest collects only the extra arguments, not named ones.\nUse rest in modern code.\nStrong answer mentions arrows and the array-like detail.',
          [
            E('Write sum that accepts any number of arguments.', 'Checks rest syntax.',
              'Collect with ...nums and use reduce with a start value of 0.',
              { solution: `const sum = (...nums) => nums.reduce((s, n) => s + n, 0);` }),
            E('Predict what this arrow function logs for arguments.', 'Arrow inside a normal function f(1, 2).',
              'It logs the arguments of f, because arrows do not have their own arguments.',
              { code: `function f() {\n  const g = () => console.log(arguments.length);\n  g(9, 9, 9);\n}\nf(1, 2);` }),
          ]),
      ],
      middle: [
        Q('Find and fix the bug. After copying with spread, calling a method throws.',
          'Object spread copies only own enumerable properties into a plain object. Methods on the class prototype and the prototype link are lost.',
          '{ ...instance } creates a plain Object.\nGetters are called and their values copied; setters are lost.\nPrivate #fields are not copied.\nTo clone a class instance, add a clone method or use Object.create(Object.getPrototypeOf(x)) plus assign.\nstructuredClone also drops the prototype.\nStrong answer explains own enumerable and prototype.',
          [
            E('Add a with method that returns an updated copy of a Point class.', 'Checks immutable update for class instances.',
              'Create a new instance with merged values.',
              { solution: `class Point {\n  constructor(x, y) { this.x = x; this.y = y; }\n  with(changes) { return new Point(changes.x ?? this.x, changes.y ?? this.y); }\n}` }),
            E('Predict what is copied when you spread a Date.', 'Shows const d2 = { ...new Date() }.',
              'An empty object, because Date stores its value in an internal slot, not in own properties.'),
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
              code: `const user = { address: null };
console.log(user.address?.city ?? 'Unknown');
const { address: { city } = {} } = user;`,
              task: 'Predict the result of each line.',
              description: 'Checks the null versus undefined behavior.',
              answer: 'Line 1 gives "Unknown". Line 2 throws a TypeError, because the default {} is used only for undefined, and address is null.',
            },
            {
              task: 'Read name and city safely with defaults, even if address is null.',
              description: 'Checks combining both tools.',
              answer: 'Use optional chaining with ?? for each value, or replace null with an empty object before destructuring.',
              solution: `const name = user?.name ?? 'Guest';
const city = user?.address?.city ?? 'Unknown';`,
            },
          ],
        },
        Q('Predict the values. Explain nested destructuring and renaming.',
          'x is 1, y is 3, and city is "Kyiv". The name before the colon is the source key, the name after is the new variable. Nested patterns do not create a variable for the parent key.',
          '{ a: x } means "read a, store in x".\n{ address: { city } } creates city, not address.\nIf address is undefined, nested destructuring throws.\nGuard with a default: { address: { city } = {} }.\nDefaults and renaming combine: { a: x = 5 }.\nStrong answer knows typeof address is "undefined": no address variable is created.',
          [
            E('Fix the code so it does not throw when address is missing.', 'Shows const { address: { city } } = user with no address.',
              'Add a default empty object for address.',
              { solution: `const { address: { city } = {} } = user;` }),
            E('Rename id to userId with a default of 0.', 'Syntax check.',
              'const { id: userId = 0 } = user.'),
          ],
          { ai: true, code: `const data = { a: 1, b: { c: 3 }, address: { city: 'Kyiv' } };\nconst { a: x, b: { c: y }, address: { city } } = data;\nconsole.log(x, y, city);\nconsole.log(typeof address); // ?` }),
      ],
      senior: [
        Q('Find and fix the bug. Math.max with spread crashes on a very large array.',
          'Spread passes each item as a separate argument, and engines limit argument count (stack size). With hundreds of thousands of items it throws RangeError. Use a loop or reduce.',
          'f(...arr) puts all items on the call stack.\nLimits vary by engine, usually around 100k to a few hundred thousand.\nThe same problem exists with push(...bigArray) and String.fromCharCode(...bytes).\nUse a loop, reduce, or chunked calls.\nIt is also slower and allocates more.\nStrong answer names the stack reason and other similar APIs.',
          [
            E('Append a large array to another without spread.', 'Shows target.push(...source) with 500k items.',
              'Use a for loop, or push in chunks. concat creates a new array and is also safe.',
              { solution: `for (const item of source) target.push(item);` }),
            E('Convert a large Uint8Array to a string safely.', 'Shows String.fromCharCode(...bytes).',
              'Use TextDecoder for text, or call fromCharCode in chunks of a few thousand bytes.',
              { solution: `const text = new TextDecoder().decode(bytes);` }),
          ],
          { code: `const max = Math.max(...values); // values.length = 1_000_000 -> RangeError`,
            fix: `let max = -Infinity;\nfor (const v of values) if (v > max) max = v;` }),
        Q('What happens when you spread null, undefined, false, a string, or a generator?',
          'In objects, spreading null, undefined or false is ignored, which enables conditional spread. In arrays, spread needs an iterable, so null throws while a string or generator works.',
          '{ ...null } is {}; [...null] throws TypeError.\n{ ...(cond && { a: 1 }) } adds a only when cond is truthy.\n{ ..."hi" } gives { 0: "h", 1: "i" }.\n[..."héllo"] splits by code points, so emoji stay whole (unlike split("")).\nA generator can be spread only once; after that it is empty.\nStrong answer separates object spread from iterable spread.',
          [
            E('Predict each result.', 'Shows four spread expressions.',
              '{} , TypeError, ["a","b"], and the second spread of the same generator is []. Generators are consumed once.',
              { code: `console.log({ ...null });\nconsole.log([...undefined]);\nconsole.log([...'ab']);\nconst g = (function* () { yield 1; })();\nconsole.log([...g], [...g]);` }),
            E('Add a header only when a token exists, in one expression.', 'Checks conditional spread.',
              'Spread a conditional object into the headers.',
              { solution: `const headers = { 'Content-Type': 'application/json', ...(token && { Authorization: 'Bearer ' + token }) };` }),
          ], { ai: true }),
        Q('Find and fix the performance bug. Building an index with spread in reduce is very slow.',
          'Each step copies the whole accumulator, so the work grows with the square of the input. Mutate a local accumulator, or use Object.fromEntries or Map.',
          'reduce((acc, x) => ({ ...acc, [x.id]: x }), {}) is O(n²).\nMutating a local accumulator inside reduce is safe because nobody else sees it.\nObject.fromEntries(list.map((x) => [x.id, x])) is clear and linear.\nMap is better for many keys or non-string keys.\nImmutability rules are for shared state, not local build steps.\nStrong answer explains why local mutation is fine.',
          [
            E('Measure the difference for 10,000 items.', 'The candidate writes a quick benchmark.',
              'Use performance.now around both versions. The spread version is often hundreds of times slower at this size. Strong answers warm up and repeat.'),
            E('Group users by role in linear time.', 'Checks Object.groupBy or a loop.',
              'Use Object.groupBy (ES2024) or a loop with push.',
              { solution: `const byRole = Object.groupBy(users, (u) => u.role);` }),
          ],
          { code: `const byId = users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});`,
            fix: `const byId = Object.fromEntries(users.map((u) => [u.id, u]));\n// or: const byId = new Map(users.map((u) => [u.id, u]));` }),
      ],
      techlead: [
        Q('Code review: a component spreads all props onto a DOM element. What risks do you see? What rule do you set?',
          'Unknown props leak into the DOM as invalid attributes, can override important ones like type or onClick, and can pass unsafe values like dangerouslySetInnerHTML. Pick known props and spread only a typed rest.',
          'Spreading props blindly makes the public API unclear.\nOrder matters: {...props} after your attributes can override them.\nReact warns on unknown DOM attributes; some values end up in HTML.\nSecurity: user-controlled objects spread into props can inject handlers or HTML.\nRule: destructure known props, type the rest as the element attributes, put fixed attributes last.\nStrong answer covers both API design and security.',
          [
            E('Fix the Button so type is always "button" unless set, and custom props do not reach the DOM.', 'Shows <button {...props}>.',
              'Destructure custom props, default type, spread the rest first, then fixed attributes.',
              { code: `function Button(props) { return <button {...props} />; }`, solution: `function Button({ variant = 'primary', type = 'button', className, ...rest }) {\n  return <button {...rest} type={type} className={cx('btn', variant, className)} />;\n}` }),
            E('Explain the risk of spreading API data into props.', 'Security discussion.',
              'If an API object contains keys like dangerouslySetInnerHTML or href with javascript:, they reach the element. Map fields explicitly.'),
          ], { ai: true }),
        Q('Code review: a backend-for-frontend removes the password with rest destructuring before sending the user. Is this safe? What would you change?',
          'It works for that one field, but it is a deny-list, so new sensitive fields leak by default. Use an allow-list that picks only the fields the client needs.',
          'const { password, ...safe } = user removes only password.\nNew fields like resetToken or ssn will leak automatically.\nAllow-list: build the response object from named fields.\nBetter: a schema or DTO that defines output fields, with tests.\nAlso lint unused variables (password is unused on purpose).\nStrong answer prefers allow-lists and adds a test.',
          [
            E('Rewrite toPublicUser as an allow-list.', 'Checks explicit field picking.',
              'Return a new object with only the needed fields.',
              { solution: `const toPublicUser = ({ id, name, avatarUrl }) => ({ id, name, avatarUrl });` }),
            E('Write a test that fails if a new field appears in the public user.', 'Checks guarding the contract.',
              'Assert Object.keys(toPublicUser(fullUser)).sort() equals the expected list.'),
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
              code: 'function fetchList(url, page, pageSize, sort) { /* ... */ }',
              task: 'Change this function to an options object without breaking old callers.',
              description: 'Checks backward compatible API changes.',
              answer: 'Check if the second argument is an object. If not, map the old positional values into the new options, and log a deprecation warning.',
              solution: `function fetchList(url, opts = {}, ...rest) {
  if (typeof opts !== 'object') {
    console.warn('fetchList positional args are deprecated');
    opts = { page: opts, pageSize: rest[0], sort: rest[1] };
  }
  const { page = 1, pageSize = 20, sort = 'name' } = opts;
  /* ... */
}`,
            },
            {
              task: 'How do you catch a misspelled option key, like retires instead of retries?',
              description: 'Checks safety of options objects.',
              answer: 'In TypeScript, the excess property check flags unknown keys in object literals. In plain JS, validate keys against an allowed list in development builds.',
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
            E('Predict the order when the button is clicked.', 'Shows a capture listener and a bubble listener on a parent div, and one on the button.',
              'parent capture, button, parent bubble. Capture listeners run on the way down.',
              { code: `div.addEventListener('click', () => console.log('parent capture'), true);\ndiv.addEventListener('click', () => console.log('parent bubble'));\nbutton.addEventListener('click', () => console.log('button'));` }),
            E('Name an event that does not bubble.', 'Theory check.',
              'focus, blur, mouseenter, mouseleave, load, and scroll on elements do not bubble. focusin and focusout are the bubbling versions of focus and blur.'),
          ]),
        Q('Find and fix the bug. Submitting the form reloads the page and the data is lost.',
          'The default form submit sends the page to the server and reloads it. Call event.preventDefault() in the submit handler, and listen on the form, not on the button click.',
          'Listen to "submit" on the form so Enter key submits too.\nevent.preventDefault() stops the reload.\nA button inside a form is type="submit" by default; use type="button" for other buttons.\nUse new FormData(form) to read values.\nKeep HTML validation by not using novalidate unless you replace it.\nStrong answer mentions the Enter key and button type default.',
          [
            E('Find why clicking "Cancel" also submits the form.', 'Shows <button>Cancel</button> inside a form.',
              'Buttons in forms default to type="submit". Add type="button".',
              { solution: `<button type="button" id="cancel">Cancel</button>` }),
            E('Read all form fields into a plain object.', 'Checks FormData.',
              'Object.fromEntries(new FormData(form)). Note: fields with the same name keep only the last value this way.',
              { solution: `const data = Object.fromEntries(new FormData(form));` }),
          ],
          { code: `const btn = document.querySelector('#save');\nbtn.addEventListener('click', () => {\n  save(getValues());\n});`,
            fix: `form.addEventListener('submit', (e) => {\n  e.preventDefault();\n  save(Object.fromEntries(new FormData(form)));\n});` }),
        Q('How do you run an event handler only once? How do you remove a listener?',
          'Pass { once: true } and the listener removes itself after the first call. Otherwise call removeEventListener with the same function reference, or use an AbortController signal.',
          'once: true is the simplest for one-time actions.\nremoveEventListener needs the exact same function, not a new arrow.\nAnonymous functions cannot be removed later.\n{ signal } lets you remove many listeners with controller.abort().\nForgetting to remove listeners causes leaks and duplicate calls.\nStrong answer mentions the same-reference rule.',
          [
            E('Find why removeEventListener does not work.', 'Shows add and remove with two separate arrow functions.',
              'Each arrow is a new function. Store it in a variable and pass the same one.',
              { code: `el.addEventListener('click', () => go());\nel.removeEventListener('click', () => go());`, solution: `const onClick = () => go();\nel.addEventListener('click', onClick);\nel.removeEventListener('click', onClick);` }),
            E('Show a welcome message only on the first click.', 'Checks the once option.',
              'Add the listener with { once: true }.',
              { solution: `button.addEventListener('click', showWelcome, { once: true });` }),
          ]),
      ],
      middle: [
        Q('Find and fix the bug. Scrolling feels slow on mobile, and Chrome shows a warning about a passive listener.',
          'A non-passive touch or wheel listener makes the browser wait for the handler before scrolling. Mark it { passive: true } if it does not call preventDefault, or use CSS touch-action to block gestures.',
          'Browsers cannot scroll until they know if preventDefault will be called.\npassive: true promises no preventDefault, so scrolling starts at once.\nChrome treats touchstart and touchmove on window, document and body as passive by default.\npreventDefault inside a passive listener is ignored with a console warning.\nCSS touch-action: none or pan-y controls gestures without JavaScript.\nStrong answer knows the default-passive rule and touch-action.',
          [
            E('Block page scroll only inside a drawing canvas.', 'Checks touch-action versus preventDefault.',
              'Set touch-action: none on the canvas with CSS and use pointer events.',
              { solution: `canvas { touch-action: none; }` }),
            E('Predict what happens when preventDefault is called in a passive listener.', 'Shows a wheel listener with { passive: true } calling preventDefault.',
              'Nothing is prevented; the browser logs a warning. Scrolling continues.'),
          ],
          { code: `window.addEventListener('wheel', (e) => {\n  trackScroll(e.deltaY);\n}, { passive: false });`,
            fix: `window.addEventListener('wheel', (e) => {\n  trackScroll(e.deltaY);\n}, { passive: true });` }),
        Q('You want delegated handling for focus events in a form. Why does focus not work, and what do you use instead?',
          'focus and blur do not bubble, so a listener on the form never sees them. Use focusin and focusout, which bubble, or listen to focus in the capture phase.',
          'Delegation needs bubbling (or capture).\nfocusin and focusout bubble and fire for every field.\nevent.relatedTarget tells where focus came from or goes to.\nThe same applies to mouseenter/mouseleave; use mouseover/mouseout or pointerover/pointerout for delegation.\nStrong answer knows both fixes and relatedTarget.',
          [
            E('Highlight the field group of the focused input with one listener on the form.', 'Checks focusin delegation.',
              'Listen to focusin and focusout on the form and use closest to find the group.',
              { solution: `form.addEventListener('focusin', (e) => e.target.closest('.group')?.classList.add('active'));\nform.addEventListener('focusout', (e) => e.target.closest('.group')?.classList.remove('active'));` }),
            E('Detect when focus leaves a whole menu, not just one item.', 'Checks relatedTarget.',
              'In focusout, close the menu only if the menu does not contain e.relatedTarget.',
              { solution: `menu.addEventListener('focusout', (e) => {\n  if (!menu.contains(e.relatedTarget)) closeMenu();\n});` }),
          ]),
        Q('Code review: this clickable card uses a div with a click handler. What is wrong, and how do you fix it?',
          'A div is not focusable and does not respond to Enter or Space, so keyboard and screen reader users cannot use it. Use a real button or link, which brings keyboard support and the right role.',
          'Native button: focusable, Enter and Space trigger click, role is announced.\nLink (a href) for navigation, button for actions.\nRole="button" + tabindex="0" + key handlers is a weaker fallback.\nFor a card with a link, make the heading link cover the card with CSS, and keep other buttons separate.\nTest with Tab and a screen reader.\nStrong answer chooses link versus button correctly.',
          [
            E('Make the whole card clickable but keep one link as the real target.', 'Checks the stretched link pattern.',
              'Put a link in the title and use a ::after pseudo-element with position absolute to cover the card.',
              { solution: `.card { position: relative; }\n.card a.title::after { content: ''; position: absolute; inset: 0; }` }),
            E('Which keys should activate a custom role="button" element?', 'Accessibility check.',
              'Enter and Space. Native button handles both; with a div you must add them yourself, and Space should fire on keyup.'),
          ],
          { code: `<div class="card" onclick="openProduct(42)">\n  <h3>Product</h3>\n</div>`,
            fix: `<article class="card">\n  <h3><a class="title" href="/products/42">Product</a></h3>\n</article>` }),
      ],
      senior: [
        Q('Predict the order of the logs. Is dispatchEvent synchronous?',
          'Yes. dispatchEvent runs all listeners synchronously before it returns, so the order is 1, handler, 2. User clicks are different: listeners run in their own task.',
          'el.dispatchEvent(evt) calls listeners right away on the same call stack.\nIt returns false if a listener called preventDefault on a cancelable event.\nMicrotasks queued in listeners run after the whole dispatch for script dispatch, but between listeners for real user events.\nel.click() is also synchronous.\nThis affects tests and code that expects async behaviour.\nStrong answer knows the microtask difference between real and synthetic events.',
          [
            E('Predict the order with a microtask in each of two listeners, for el.click().', 'Two listeners each log and queue a microtask.',
              'With el.click(): L1, L2, M1, M2, because the stack is not empty between listeners. With a real user click: L1, M1, L2, M2.'),
            E('Use the return value of dispatchEvent to let listeners cancel an action.', 'Checks cancelable custom events.',
              'Dispatch a cancelable event and skip the action if it returns false.',
              { solution: `const ok = el.dispatchEvent(new CustomEvent('before-delete', { cancelable: true, detail: { id } }));\nif (ok) remove(id);` }),
          ],
          { ai: true, code: `el.addEventListener('ping', () => console.log('handler'));\nconsole.log(1);\nel.dispatchEvent(new Event('ping'));\nconsole.log(2);` }),
        Q('Find and fix the bug. Dragging a slider stops working when the pointer leaves the thumb.',
          'Move events go to the element under the pointer, so when it leaves the thumb, updates stop. Use pointer events with setPointerCapture so all move and up events go to the thumb.',
          'Pointer events cover mouse, touch and pen with one API.\nsetPointerCapture(e.pointerId) sends later pointer events to the element.\nCapture is released on pointerup or pointercancel automatically.\nHandle pointercancel (for example, when the browser takes over a gesture).\nAdd touch-action: none so the browser does not scroll during drag.\nStrong answer mentions pointercancel and touch-action.',
          [
            E('Explain why the old code needed listeners on document.', 'Shows a mousemove listener added to document on mousedown.',
              'Without capture, the only way to keep getting moves was a global listener. Pointer capture removes the need and the cleanup work.'),
            E('Add keyboard support to the slider.', 'Accessibility follow-up.',
              'Use role="slider" with aria-valuenow, min and max, and handle Arrow, Home, End and Page keys. Or use a native input type="range".'),
          ],
          { code: `thumb.addEventListener('mousedown', () => { dragging = true; });\nthumb.addEventListener('mousemove', (e) => { if (dragging) setValue(e.clientX); });\nthumb.addEventListener('mouseup', () => { dragging = false; });`,
            fix: `thumb.addEventListener('pointerdown', (e) => {\n  thumb.setPointerCapture(e.pointerId);\n});\nthumb.addEventListener('pointermove', (e) => {\n  if (thumb.hasPointerCapture(e.pointerId)) setValue(e.clientX);\n});\n// CSS: .thumb { touch-action: none; }` }),
        Q('Why does window.open or clipboard writing fail when called after an await in a click handler?',
          'These APIs need user activation. Activation lasts only a short time after the user gesture, so a slow await can make it expire. Call the API before awaiting, or pass a promise to the API.',
          'Browsers track transient user activation, a few seconds after the click.\nPopup blockers stop window.open without it.\nnavigator.clipboard.write accepts ClipboardItem with promise values, so you can start the write now and fill data later (support varies).\nFullscreen and some media APIs have the same rule.\nOpen the window first, then set its location after data loads.\nStrong answer knows the activation model and a workaround.',
          [
            E('Fix a handler that fetches a URL and then opens it in a new tab.', 'Shows await fetch then window.open(url).',
              'Open a blank window right away, then set its location when the URL arrives. Close it on error.',
              { solution: `button.addEventListener('click', async () => {\n  const win = window.open('about:blank');\n  try {\n    const { url } = await getJson('/report-url');\n    win.location = url;\n  } catch (e) { win.close(); showError(e); }\n});` }),
            E('Which APIs need user activation? Name three.', 'Knowledge check.',
              'window.open popups, requestFullscreen, clipboard write in some browsers, audio autoplay with sound, and showPicker on inputs.'),
          ]),
      ],
      techlead: [
        Q('Code review: the app adds global keyboard shortcuts on document. What problems do you look for?',
          'Shortcuts must not fire while the user types in inputs, must not break screen reader or browser keys, must be removable, and must be documented. Many single-key shortcuts also fail WCAG 2.1.4.',
          'Ignore events from input, textarea, select and contenteditable.\nCheck event.isComposing for IME input.\nUse event.key, not keyCode; respect platform modifiers (Meta on Mac).\nWCAG 2.1.4: single-character shortcuts need a way to turn off or remap.\nCentralise registration to avoid conflicts between teams.\nStrong answer covers accessibility, i18n and ownership.',
          [
            E('Write a guard that skips shortcuts while typing.', 'Checks the editable target check.',
              'Return early for editable targets and IME composition.',
              { solution: `function isTyping(e) {\n  const t = e.target;\n  return e.isComposing || t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName);\n}` }),
            E('How do you stop two teams from using the same shortcut?', 'Process question.',
              'One shortcut registry with a lint or test for duplicates, plus a help dialog listing all shortcuts.'),
          ],
          { code: `document.addEventListener('keydown', (e) => {\n  if (e.key === 's') save();\n  if (e.key === 'Delete') removeSelected();\n});`,
            fix: `document.addEventListener('keydown', (e) => {\n  if (isTyping(e) || !shortcutsEnabled) return;\n  if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); save(); }\n  if (e.key === 'Delete') removeSelected();\n});` }),
        Q('Teams want a global event bus for communication between features. When is that a good idea, and when is it a mistake?',
          'An event bus is good for loose, fire-and-forget notifications (analytics, toasts). It is a mistake for shared state or request/response flows, where hidden coupling makes bugs hard to trace.',
          'Pros: features do not import each other; easy to add listeners.\nCons: no clear owner, hard to find who listens, order and timing bugs, leaks from missing unsubscribe.\nShared state belongs in a store or server cache.\nIf you use a bus: typed event names and payloads, unsubscribe on unmount, dev logging.\nEventTarget can be the bus without a library.\nStrong answer gives a real example where a bus helped or hurt.',
          [
            E('Build a tiny typed bus on top of EventTarget.', 'Checks a simple, standard design.',
              'Extend EventTarget, emit CustomEvent, return an unsubscribe function from on.',
              { solution: `class Bus extends EventTarget {\n  emit(type, detail) { this.dispatchEvent(new CustomEvent(type, { detail })); }\n  on(type, fn) {\n    const h = (e) => fn(e.detail);\n    this.addEventListener(type, h);\n    return () => this.removeEventListener(type, h);\n  }\n}` }),
            E('Name signs that a bus is being misused.', 'Judgment.',
              'Events that expect a reply, events used to sync state, chains of events triggering events, or nobody knowing all listeners.'),
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
              code: `btn.onclick = () => console.log('A');
btn.onclick = () => console.log('B');
btn.addEventListener('click', () => console.log('C'));`,
              task: 'What is logged when the button is clicked?',
              description: 'Checks property versus listener behavior.',
              answer: 'Only "B" and "C". The second onclick replaced the first. The listener added with addEventListener runs too.',
            },
            {
              task: 'Which CSP setting blocks inline event handlers?',
              description: 'Checks the security link.',
              answer: 'A script-src without unsafe-inline (for example with nonces or strict-dynamic). Inline on* attributes are then blocked, unless you add unsafe-hashes, which you should avoid.',
            },
          ],
        },
      ],
    },
  },
};
