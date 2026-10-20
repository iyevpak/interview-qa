// JavaScript — extra questions (set 2)
export default {
  JavaScript: {
    'Class, Prototyping': {
      junior: [
        {
          q: 'What is the difference between instance properties, prototype methods and static methods in a class?',
          short: 'Instance properties live on each object, methods declared in the class body live once on Class.prototype, and static members live on the constructor function itself.',
          long: `Fields (x = 1) and this.x assignments in the constructor create own properties on every instance.
Methods in the class body are shared through Class.prototype, so 1000 instances share one function.
static members are called as Class.method(), not instance.method(); they suit factories and helpers.
Pitfall: arrow-function class fields (handle = () => {}) are created per instance, costing memory but binding this.
Strong answer: can show where each lives with Object.hasOwn and explain the memory/this trade-off.
Weak answer: thinks every method is copied onto every instance.`,
          follow: 'What changes if a method is defined as an arrow-function class field instead?',
          exercises: [
            {
              task: 'Predict each console.log.',
              description: 'Checks where members live. Run in Node or the browser console after predicting.',
              code: `class A { x = 1; m() {} static s() {} }
const a = new A();
console.log(Object.hasOwn(a, 'x'), Object.hasOwn(a, 'm'), typeof a.s, typeof A.s);`,
              answer: 'Prints true false "undefined" "function". x is an own field, m is on A.prototype, and s is on A only. A common wrong answer is thinking a.s works because "static is shared". A strong answer explains the three locations.',
            },
            {
              task: 'Add a static factory fromJSON to a User class.',
              description: 'Checks static method usage. Write the code and call User.fromJSON(\'{"name":"Ann"}\').',
              answer: 'static fromJSON(json) { const d = JSON.parse(json); return new User(d.name); }. Using this inside a static method refers to the class (so new this(d.name) also supports subclasses). Wrong answers put it on the prototype and require an instance first.',
              solution: `class User {
  constructor(name) { this.name = name; }
  static fromJSON(json) { const d = JSON.parse(json); return new this(d.name); }
}`,
            },
          ],
        },
        {
          q: 'Find and fix the bug. The subclass constructor throws a ReferenceError.',
          code: `class Animal { constructor(name) { this.name = name; } }
class Dog extends Animal {
  constructor(name) {
    this.sound = 'woof';
    super(name);
  }
}
new Dog('Rex');`,
          short: 'In a derived class, this is uninitialized until super() is called, so accessing this first throws a ReferenceError.',
          long: `Derived constructors do not create this; the base constructor does, and super() binds the result.
Any use of this before super() throws "Must call super constructor in derived class before accessing 'this'".
Forgetting super() entirely also throws when the constructor returns.
Fields declared in the subclass body are initialized right after super() returns.
Strong answer: explains why (base allocates the object, which matters for built-ins like Array/Error).
Weak answer: just reorders lines without knowing the rule.`,
          fix: `class Dog extends Animal {
  constructor(name) {
    super(name);
    this.sound = 'woof';
  }
}`,
          exercises: [
            {
              task: 'Rewrite Dog using a class field instead of a constructor.',
              description: 'Checks knowledge of field initialization order. Write it and run new Dog("Rex").',
              answer: 'class Dog extends Animal { sound = "woof"; } works with no explicit constructor, because the implicit constructor calls super(...args) and then initializes fields. Wrong answers think fields run before super. Strong answer mentions the default derived constructor.',
              solution: `class Dog extends Animal { sound = 'woof'; }`,
            },
            {
              task: 'What happens if the Dog constructor does not call super() at all?',
              description: 'Checks the derived-constructor rule. Predict, then run.',
              answer: 'new Dog() throws a ReferenceError when the constructor finishes, because this was never initialized (unless the constructor returns an object explicitly). Candidates often think it silently creates an object without name. A strong answer knows the explicit-return escape hatch exists but is rarely appropriate.',
            },
          ],
        },
        {
          q: 'What does instanceof check? How is it different from typeof?',
          short: 'instanceof walks the prototype chain of the left operand looking for Right.prototype; typeof only distinguishes primitive kinds and functions.',
          long: `a instanceof B is true if B.prototype appears anywhere in a's prototype chain.
It can be fooled: changing prototypes, Object.create, or Symbol.hasInstance alter the result.
It fails across realms (iframes, workers): an array from an iframe is not instanceof your Array; use Array.isArray.
obj.constructor === B is fragile because constructor is just a writable prototype property.
Strong answer: mentions cross-realm issues and prefers duck typing or brand checks (#x in obj) when appropriate.
Weak answer: thinks instanceof inspects how the object was "created".`,
          exercises: [
            {
              task: 'Predict the output.',
              description: 'Checks prototype-chain semantics of instanceof. Run in Node after predicting.',
              code: `function F() {}
const o = new F();
F.prototype = {};
console.log(o instanceof F, Object.create(F.prototype) instanceof F);`,
              answer: 'Prints false true. o still links to the old prototype object, and instanceof compares against the current F.prototype. Many expect true because o was created with new F. A strong answer explains it is a chain lookup, not a creation record.',
            },
            {
              task: 'Write a type check for a class without using instanceof. Use a private field.',
              description: 'Checks ergonomic brand checks. Implement static isPoint(o) and test with a plain object.',
              answer: 'Use static isPoint(o) { return #x in o; } inside class Point { #x; }. It is true only for objects constructed by Point (or subclasses) and cannot be spoofed by prototype tricks. Wrong answers check o.constructor.name. Strong answer notes it still does not cross realms.',
              solution: `class Point { #x = 0; static isPoint(o) { return #x in o; } }`,
            },
          ],
        },
      ],
      middle: [
        {
          q: 'Explain getters, setters and private methods in classes. When are accessors a bad idea?',
          short: 'get/set define accessor properties on the prototype that run code on read/write; #private methods are only callable inside the class body.',
          long: `Accessors let you keep a stable property API while computing or validating values.
They live on the prototype, so JSON.stringify and object spread do not copy them as values from the prototype.
Bad idea: expensive or side-effectful getters surprise callers (a read should be cheap and idempotent).
A setter without a getter makes reads return undefined, a frequent bug.
#methods are not on the prototype; they cannot be monkey-patched or accessed by subclasses.
Strong answer: discusses serialization, debugging visibility, and keeping getters pure.`,
          follow: 'How do you make a class with accessors serialize correctly to JSON?',
          exercises: [
            {
              task: 'Predict output of spread and JSON on an object with a getter.',
              description: 'Checks own vs prototype accessors. Run in Node.',
              code: `class T { #c = 20; get f() { return this.#c * 9 / 5 + 32; } }
const t = new T();
console.log({ ...t }, JSON.stringify(t));`,
              answer: 'Prints {} and "{}". f is a prototype accessor and #c is private, so neither is an own enumerable property. People often expect { f: 68 }. A strong answer adds toJSON() { return { f: this.f }; }.',
            },
            {
              task: 'Implement a setter that rejects negative ages with a RangeError.',
              description: 'Checks validation via accessors and private state. Write the class and test p.age = -1.',
              answer: 'Store the value in #age and in set age(v) throw RangeError for v < 0, plus a matching getter. Missing the getter is the classic mistake. Using this.age = v inside the setter causes infinite recursion, which strong candidates call out.',
              solution: `class Person {
  #age = 0;
  get age() { return this.#age; }
  set age(v) { if (v < 0) throw new RangeError('age'); this.#age = v; }
}`,
            },
          ],
        },
        {
          q: 'Find and fix the bug. The child class crashes when it is created.',
          code: `class Base {
  constructor() { this.count = 0; this.init(); }
  init() { this.count++; }
}
class Child extends Base {
  items = [];
  init() { this.items.push('x'); super.init(); }
}
new Child();`,
          short: 'The base constructor calls an overridden method before the subclass fields are initialized, so this.items is undefined and push throws.',
          long: `Order: Base constructor runs fully (including this.init()) before Child fields are initialized.
Child.init is dispatched virtually, so it runs while items is still undefined.
This is the "calling overridable methods from a constructor" anti-pattern, also present in Java/C#.
Fixes: do not call overridable methods in constructors, use an explicit init step, or a static factory.
Strong answer: explains field initialization order relative to super().
Weak answer: initializes items inside init as a hack without understanding why.`,
          fix: `class Base {
  count = 0;
  init() { this.count++; return this; }
  static create(...args) { return new this(...args).init(); }
}
class Child extends Base {
  items = [];
  init() { this.items.push('x'); return super.init(); }
}
const c = Child.create();`,
          exercises: [
            {
              task: 'Log the order of field initialization and constructors.',
              description: 'Checks evaluation order. Add console.log calls in fields (via a helper) and constructors, then run.',
              answer: 'Order is: Base fields, Base constructor body, Child fields, Child constructor body after super(). Many guess Child fields come first. A strong candidate links this to why the original code fails.',
            },
            {
              task: 'Why does a static factory using new this() work for subclasses?',
              description: 'Checks this inside static methods. Explain and demonstrate with Child.create() instanceof Child.',
              answer: 'In a static method called as Child.create(), this is Child, so new this() constructs Child. Hardcoding new Base() would lose the subclass. Strong answers note static methods are inherited via the constructor prototype chain.',
            },
          ],
        },
        {
          q: 'How does JS find a property on the prototype chain? What happens when you write to an inherited property?',
          short: 'Reads walk up the chain until found; writes normally create an own property on the target object, shadowing the inherited one, except for setters and non-writable inherited props.',
          long: `obj.x reads own property first, then prototype, up to Object.prototype, else undefined.
obj.x = 1 creates an own x even if a prototype has x, unless the inherited x is a setter (it is called) or is non-writable (silently ignored, TypeError in strict mode).
Mutating an inherited object value (obj.list.push) affects all objects sharing that prototype: a classic bug with defaults on prototypes.
delete only removes own properties.
Strong answer: knows the setter/non-writable exceptions and the shared-mutable-prototype bug.
Weak answer: thinks assignment modifies the prototype.`,
          exercises: [
            {
              task: 'Predict output.',
              description: 'Checks shared mutable state on prototypes. Run in Node.',
              code: `const proto = { tags: [], n: 0 };
const a = Object.create(proto), b = Object.create(proto);
a.tags.push('x'); a.n++;
console.log(b.tags, b.n, Object.hasOwn(a, 'n'));`,
              answer: "Prints ['x'] 0 true. push mutates the shared array, while a.n++ reads 0 from the prototype and writes an own n. Candidates often say b.tags is empty. Strong answer recommends per-instance state in constructors/fields.",
            },
            {
              task: 'Show what happens assigning to an inherited non-writable property in strict mode.',
              description: 'Checks the non-writable exception. Use Object.defineProperty on proto, then assign on a child in a module.',
              answer: 'It throws a TypeError in strict mode (modules and classes are strict) and is silently ignored in sloppy mode; no own property is created. Most candidates expect shadowing. Strong answers mention Object.defineProperty on the child as the way to shadow anyway.',
            },
          ],
        },
      ],
      senior: [
        {
          q: 'Why is extending Array or Error special? What is Symbol.species?',
          short: 'Built-ins allocate exotic objects in their own constructor, so class extends with super() is required; Symbol.species controls which constructor derived methods like map use.',
          long: `class MyArr extends Array works because super() lets Array allocate the exotic array object; ES5 function-style inheritance could not.
Array methods (map, filter, slice) create new instances via this.constructor[Symbol.species], so they return MyArr by default.
That can run your constructor with unexpected arguments (e.g. map calls new MyArr(length)).
Override static get [Symbol.species]() { return Array; } to return plain arrays.
Errors: set this.name and pass { cause } to super; Error.captureStackTrace is V8-only.
Strong answer: notes species is a known source of complexity and engine slow paths, and that some TC39 proposals limited it.`,
          ai: true,
          exercises: [
            {
              task: 'Predict the result of map on a subclass with a required constructor arg.',
              description: 'Checks species behavior. Run in Node.',
              code: `class Named extends Array {
  constructor(name, ...items) { super(...items); this.name = name; }
}
const n = new Named('a', 1, 2);
const m = n.map(x => x * 2);
console.log(m instanceof Named, m.name, [...m]);`,
              answer: 'map calls new Named(2) via species, so name becomes 2 and the array starts empty, then items are defined: prints true 2 [2, 4]. Candidates expect "a" or a plain Array. Strong answer fixes it with static get [Symbol.species]() { return Array; }.',
            },
            {
              task: 'Write a custom HttpError class that preserves the original cause and works with instanceof.',
              description: 'Checks Error subclassing best practices. Write and test with try/catch.',
              answer: 'class HttpError extends Error { constructor(status, msg, opts) { super(msg, opts); this.name = "HttpError"; this.status = status; } } and pass { cause: err }. Forgetting name gives unhelpful logs; manually copying stack is unnecessary. Strong answers mention cause is standard since ES2022.',
              solution: `class HttpError extends Error {
  constructor(status, message, options) {
    super(message, options);
    this.name = 'HttpError';
    this.status = status;
  }
}`,
            },
          ],
        },
        {
          q: 'Code review. This class does not remove its event listener. Find the bug and fix it.',
          code: `class Tracker {
  constructor(el) {
    this.el = el;
    this.clicks = 0;
    el.addEventListener('click', this.onClick.bind(this));
  }
  onClick() { this.clicks++; }
  destroy() { this.el.removeEventListener('click', this.onClick); }
}`,
          short: 'bind creates a new function each time, so removeEventListener receives a different reference and the listener never detaches; store the bound handler or use an AbortController.',
          long: `removeEventListener needs the identical function reference that was added.
this.onClick in destroy is the unbound prototype method, not the bound one.
The listener keeps the Tracker (and its data) alive as long as el lives.
Fixes: arrow-function field handler, store bound reference, or AbortController signal for bulk cleanup.
AbortController scales best when a class registers many listeners.
Strong answer: also nulls references, makes destroy idempotent, and considers the WeakRef-free design.`,
          fix: `class Tracker {
  #ac = new AbortController();
  clicks = 0;
  constructor(el) {
    el.addEventListener('click', () => { this.clicks++; }, { signal: this.#ac.signal });
  }
  destroy() { this.#ac.abort(); }
}`,
          exercises: [
            {
              task: 'Prove the original destroy does not remove the listener.',
              description: 'Checks reference equality reasoning. Run in a browser: create Tracker, destroy, click, log clicks.',
              answer: 'clicks still increments after destroy because a different function was passed to removeEventListener. Candidates sometimes blame bind "changing this". Strong answers verify with getEventListeners(el) in Chrome DevTools.',
            },
            {
              task: 'Compare arrow function fields and bound prototype methods. Think about memory and tests.',
              description: 'Checks trade-off judgment. Discuss verbally.',
              answer: 'Arrow fields allocate one closure per instance and are not on the prototype, so they cannot be spied on via Class.prototype in tests or overridden with super. Prototype methods are shared but need binding at registration. Strong answers pick based on instance count and inheritance needs, not dogma.',
            },
          ],
        },
        {
          q: 'How do standard decorators work on classes? What are the risks of using them?',
          short: 'A decorator is a function receiving the decorated value and a context object (kind, name, addInitializer, access) and returning a replacement; they enable cross-cutting concerns like logging or binding.',
          long: `Standard decorators differ from legacy TS experimentalDecorators: different signature, no parameter decorators, no reflect-metadata by default.
Method decorators return a wrapping function; field decorators return an initializer transform; accessor keyword creates auto-accessors.
context.addInitializer runs per instance (or per class for static), useful for auto-binding.
Risks: hidden control flow, tooling/transpile differences, migration pain from legacy to standard decorators.
Native browser support is still landing; most code ships them transpiled.
Strong answer: distinguishes legacy vs standard, and limits decorators to well-understood framework boundaries.`,
          ai: true,
          exercises: [
            {
              task: 'Write a standard @logged method decorator.',
              description: 'Checks the standard decorator signature. Run with TypeScript 5+ (no experimentalDecorators) or Babel.',
              answer: 'function logged(fn, ctx) { return function (...args) { console.log(String(ctx.name), args); return fn.apply(this, args); }; }. Using the legacy (target, key, descriptor) signature is the common wrong answer. Strong answers preserve this with apply.',
              solution: `function logged(fn, context) {
  return function (...args) {
    console.log(\`call \${String(context.name)}\`, args);
    return fn.apply(this, args);
  };
}`,
            },
            {
              task: 'Implement @bound using addInitializer.',
              description: 'Checks per-instance initialization. Test by passing obj.method as a callback.',
              answer: 'function bound(fn, ctx) { ctx.addInitializer(function () { this[ctx.name] = this[ctx.name].bind(this); }); }. It binds per instance at construction. Strong candidates note private methods need ctx.access instead of this[name].',
            },
          ],
        },
      ],
      techlead: [
        {
          q: 'The codebase mixes old constructor functions, classes and factory functions. How do you choose one standard and roll it out?',
          short: 'Pick per use case (classes for stateful entities with identity and inheritance-free composition, plain functions/modules for logic), codify it with lint rules, and migrate opportunistically rather than via big-bang rewrite.',
          long: `Start by inventorying patterns and where bugs come from (this-binding, prototype mutation, deep hierarchies).
Standard: classes for domain entities and framework-required APIs, composition over inheritance, max depth 1–2.
Factories/closures for small stateful utilities; plain functions for pure logic.
Enforce via ESLint (prefer-class or no-proto, no-extend-native) and code review checklists.
Migrate when touching code, with codemods for mechanical ES5 → class conversions, behind tests.
Strong answer: ties the decision to measurable pain and team skills; weak answer imposes personal taste.`,
          ai: true,
          exercises: [
            {
              task: 'Draft three ESLint rules you would enable for this standard and justify each.',
              description: 'Checks practical governance. Write a short config and rationale.',
              answer: 'Examples: no-extend-native (no patching built-ins), no-proto (no __proto__), class-methods-use-this (signals methods that should be functions), max-classes-per-file. Weak answers list formatting rules. Strong answers connect each rule to a past incident type.',
            },
            {
              task: 'Plan a migration of a 40-file ES5 prototype module to classes with minimal risk.',
              description: 'Checks rollout planning. Outline steps verbally.',
              answer: 'Add characterization tests first, run a codemod (e.g. lebab) per file, review behavior differences (classes are strict, non-callable without new, methods non-enumerable), ship incrementally behind normal CI. Ignoring the enumerable/strict differences is the common miss. Strong answers time-box and measure regression rate.',
            },
          ],
        },
        {
          q: 'Code review. A shared UI library has four levels of class inheritance. What do you recommend?',
          code: `class MaskedInput extends InputComponent {
  render() {
    const html = super.render();
    return this.applyMask(html);
  }
  validate() { return super.validate() && this.maskValid(); }
}`,
          short: 'Flatten the hierarchy into composition: small behaviors (validation, masking) as composable units or hooks, keeping at most one level of inheritance from a framework base.',
          long: `Deep trees create the fragile base class problem: a change in BaseComponent ripples unpredictably.
super chains hide control flow, making reviews and debugging slow.
Composition: inject a mask strategy and validators instead of overriding.
Migration: introduce the composed API alongside, deprecate subclasses, codemod consumers.
Communicate via an RFC with examples and semver plan for the library.
Strong answer: balances API stability for consumers with internal cleanup.`,
          fix: `class Input {
  constructor({ mask = null, validators = [] } = {}) {
    this.mask = mask;
    this.validators = validators;
  }
  validate(value) { return this.validators.every(v => v(value)); }
  format(value) { return this.mask ? this.mask(value) : value; }
}
const phone = new Input({ mask: maskPhone, validators: [required, isPhone] });`,
          exercises: [
            {
              task: 'Write an RFC outline for the change.',
              description: 'Checks communication and versioning judgment. Produce headings and key points.',
              answer: 'Problem, proposed API, migration path with deprecation warnings, codemod, semver major plan, timeline, owners. Weak answers skip consumer migration. Strong answers include adoption metrics and a sunset date.',
            },
            {
              task: 'Identify one concrete bug class the deep hierarchy enables.',
              description: 'Checks reasoning about fragile base classes. Explain with an example.',
              answer: 'E.g. BaseComponent.validate starts returning a Promise; every subclass using super.validate() && ... now gets a truthy Promise and validation silently passes. Strong candidates give such a concrete cascade, not a vague "hard to maintain".',
            },
          ],
        },
        {
          q: 'A team wants to add helper methods like groupBy to Array.prototype. What do you say?',
          short: 'Reject patching built-in prototypes: it risks collisions with future standards and other libraries; use standalone utilities or the now-standard APIs (Object.groupBy, Array.prototype.at).',
          long: `History: MooTools' Array.prototype.flatten and contains forced TC39 to rename to flat and includes ("smooshgate").
Patched prototypes leak to every dependency and can change iteration (enumerable props show in for...in).
Many helpers are already standard: Object.groupBy/Map.groupBy, at(), findLast, toSorted.
Offer a utils module or pipeline-friendly functions instead.
Enforce with no-extend-native lint rule.
Strong answer: explains ecosystem impact, not just "bad practice".`,
          exercises: [
            {
              task: 'Replace a patched arr.last() and arr.groupBy(fn) with standard APIs.',
              description: 'Checks knowledge of modern built-ins. Write code and run in Node 22+.',
              answer: 'Use arr.at(-1) and Object.groupBy(arr, fn) (or Map.groupBy for non-string keys). Weak answers write custom loops or lodash without knowing the built-ins. Strong answers mention browser baseline support.',
              solution: `const last = arr.at(-1);
const byType = Object.groupBy(arr, x => x.type);`,
            },
            {
              task: 'Show how a patched enumerable prototype method breaks for...in.',
              description: 'Checks enumerability. Assign Array.prototype.foo = fn and loop with for...in.',
              answer: 'for...in over an array then yields "foo" in addition to indices, breaking legacy code. Defining via Object.defineProperty with enumerable: false avoids that but not name collisions. Strong answers mention both issues.',
            },
          ],
        },
      ],
    },
    'Set, WeakSet, Map, WeakMap': {
      junior: [
        {
          q: 'How do you add, check, and remove items in a Set? How do you get its size?',
          short: 'Use set.add(v), set.has(v), set.delete(v) and set.size; a Set keeps unique values in insertion order.',
          long: `add returns the Set, so calls can be chained; adding an existing value does nothing.
has is fast (average constant time), unlike array.includes which scans the array.
size is a property, not a method, and there is no length.
Uniqueness uses SameValueZero: NaN equals NaN, but two different objects with the same content are different.
Strong answer: knows size vs length, the object identity rule, and iteration order.
Weak answer: calls set.length or expects deep equality.`,
          exercises: [
            {
              task: 'Predict the size of the Set.',
              description: 'Checks the SameValueZero rule. Predict, then run in Node.',
              code: `const s = new Set([1, '1', NaN, NaN, {}, {}, 0, -0]);
console.log(s.size);`,
              answer: 'The size is 6: 1, "1", NaN, {}, {}, 0. NaN is only stored once, 0 and -0 are the same, and two object literals are different. Candidates often say 4 or 8. A strong answer names SameValueZero.',
            },
            {
              task: 'Count unique words in a sentence.',
              description: 'Checks basic Set usage. Write a function and test with "a b a c".',
              answer: 'new Set(text.split(/\\s+/)).size gives 3 for "a b a c". Normalizing case with toLowerCase is a good extra step. Weak answers use nested loops.',
              solution: `const uniqueWords = (text) => new Set(text.toLowerCase().split(/\\s+/).filter(Boolean)).size;`,
            },
          ],
        },
        {
          q: 'Find and fix the bug. The Map always returns undefined.',
          code: `const prices = new Map();
prices['apple'] = 2;
console.log(prices.get('apple'));
console.log(prices.size);`,
          short: 'Bracket assignment sets a normal object property on the Map, not an entry; use prices.set and prices.get.',
          long: `A Map is still an object, so prices['apple'] = 2 creates a plain property.
Map entries are only managed by set, get, has, delete and clear.
size stays 0 and iteration with for...of does not see the property.
JSON.stringify(map) also gives "{}", another common surprise.
Strong answer: explains why both APIs exist and avoids mixing them.
Weak answer: thinks Map is just a fancy object.`,
          fix: `const prices = new Map();
prices.set('apple', 2);
console.log(prices.get('apple')); // 2
console.log(prices.size); // 1`,
          exercises: [
            {
              task: 'Convert a plain object to a Map and back.',
              description: 'Checks Object.entries and Object.fromEntries. Run with { a: 1, b: 2 }.',
              answer: 'new Map(Object.entries(obj)) and Object.fromEntries(map). This only works well for string keys. Weak answers loop manually without knowing these helpers.',
              solution: `const m = new Map(Object.entries({ a: 1, b: 2 }));
const back = Object.fromEntries(m);`,
            },
            {
              task: 'Why can a Map use an object as a key, but an object cannot?',
              description: 'Checks key types. Try obj[{}] = 1 and log Object.keys(obj).',
              answer: 'Object keys are converted to strings, so every object becomes "[object Object]" and keys collide. Map keeps the real reference. A strong answer gives a use case like storing data per DOM node.',
            },
          ],
        },
        {
          q: 'How do you loop over a Map? In what order do you get the entries?',
          short: 'Use for...of on the map, map.entries(), keys(), values() or forEach; entries come in insertion order.',
          long: `for (const [key, value] of map) destructures each entry.
forEach callback order is (value, key), which is often swapped by mistake.
Order is the order of first insertion; setting an existing key does not move it.
Deleting and adding again moves the key to the end.
Strong answer: mentions the forEach argument order and the re-insert trick used in LRU caches.
Weak answer: thinks Map order is random like some other languages.`,
          exercises: [
            {
              task: 'Predict the printed keys.',
              description: 'Checks insertion order rules. Run in Node.',
              code: `const m = new Map([['a', 1], ['b', 2]]);
m.set('a', 3);
m.delete('b'); m.set('b', 4);
console.log([...m.keys()]);`,
              answer: "Prints ['a', 'b']. Updating a keeps its position; b is deleted and added again, so it goes last (it was already last). Strong candidates explain both rules.",
            },
            {
              task: 'Sum all values in a Map.',
              description: 'Checks iteration helpers. Write it in one line.',
              answer: '[...map.values()].reduce((a, b) => a + b, 0). In 2026 you can also use map.values().reduce with iterator helpers. Weak answers use for...in, which does not work on Maps.',
            },
          ],
        },
      ],
      middle: [
        {
          q: 'What are the new Set methods, like union and intersection? When are they useful?',
          short: 'ES2025 added union, intersection, difference, symmetricDifference, isSubsetOf, isSupersetOf and isDisjointFrom; they return new Sets or booleans.',
          long: `They are baseline in modern browsers and Node 22+, so you no longer need manual filter loops.
The argument can be any set-like object with size, has and keys, for example a Map.
Results keep insertion order of the receiver mostly; do not depend on order in logic.
Use cases: permissions (user roles vs required roles), tag filters, diffing selections.
Strong answer: knows the methods exist and the set-like requirement; weak answer converts to arrays every time.
Older environments need a polyfill (core-js).`,
          exercises: [
            {
              task: 'Check if a user has all required roles.',
              description: 'Checks isSupersetOf / isSubsetOf. Write it and run in Node 22+.',
              answer: 'required.isSubsetOf(userRoles) or userRoles.isSupersetOf(required). Before ES2025 you would write [...required].every(r => userRoles.has(r)). Strong answers mention both.',
              solution: `const ok = new Set(['read', 'write']).isSubsetOf(new Set(user.roles));`,
            },
            {
              task: 'Find which items were added and removed between two selections.',
              description: 'Checks difference. Use prev and next Sets.',
              answer: 'added = next.difference(prev), removed = prev.difference(next). Using symmetricDifference loses the direction, a common mistake. Strong answers note it is linear time.',
            },
          ],
        },
        {
          q: 'Find and fix the bug. The Set of points still has duplicates.',
          code: `const seen = new Set();
for (const p of [{ x: 1, y: 2 }, { x: 1, y: 2 }]) {
  seen.add(p);
}
console.log(seen.size); // expected 1`,
          short: 'Sets compare objects by reference, not by content; use a stable primitive key such as a string.',
          long: `Each object literal is a new reference, so both are added.
Fix: derive a key like \`\${x},\${y}\` and store that, or use a Map from key to object.
JSON.stringify keys work but depend on property order, so they are fragile.
For value semantics, Records and Tuples were withdrawn; composite keys remain a manual job.
Strong answer: builds a key function and explains why JSON.stringify is risky.
Weak answer: expects Set to do deep equality.`,
          fix: `const byKey = new Map();
for (const p of points) {
  byKey.set(\`\${p.x},\${p.y}\`, p);
}
const unique = [...byKey.values()];`,
          exercises: [
            {
              task: 'Remove duplicate users by id, keeping the first one.',
              description: 'Checks Map-based dedupe. Test with two users having the same id.',
              answer: 'Loop and set only if !map.has(u.id), then take map.values(). Using new Map(users.map(u => [u.id, u])) keeps the last one, which surprises people. Strong answers state which one is kept.',
            },
            {
              task: 'Why is JSON.stringify a weak key for objects?',
              description: 'Checks key stability. Compare {a:1,b:2} and {b:2,a:1}.',
              answer: 'The two strings differ because key order differs, so equal objects get different keys. It is also slow for large objects and fails on cycles or BigInt. Strong answers prefer explicit key fields.',
            },
          ],
        },
        {
          q: 'What is a WeakSet? Give one real use case.',
          short: 'A WeakSet holds objects weakly, so they can be garbage collected; it has only add, has and delete and cannot be iterated.',
          long: `Values must be objects or non-registered symbols.
No size and no iteration, because content depends on garbage collection timing.
Use case: mark objects as "already processed" (visited nodes, initialized elements) without keeping them alive.
Another use: brand checks for objects created by your factory.
Strong answer: explains why iteration is impossible and gives a concrete use.
Weak answer: thinks WeakSet is a faster Set.`,
          exercises: [
            {
              task: 'Avoid infinite loops when walking an object graph with cycles.',
              description: 'Checks WeakSet as a visited marker. Write a deepCount function and test with a cyclic object.',
              answer: 'Keep a WeakSet of visited objects and return early if seen.has(obj). A WeakSet or Set both work here; WeakSet avoids leaks if the marker outlives the walk. Strong answers mention structuredClone also handles cycles.',
              solution: `function countNodes(obj, seen = new WeakSet()) {
  if (obj === null || typeof obj !== 'object' || seen.has(obj)) return 0;
  seen.add(obj);
  return 1 + Object.values(obj).reduce((n, v) => n + countNodes(v, seen), 0);
}`,
            },
            {
              task: 'What happens when you call weakSet.add(42)?',
              description: 'Checks allowed value types. Run in Node.',
              answer: 'It throws a TypeError ("Invalid value used in weak set") because primitives cannot be held weakly. Strong candidates add that unique symbols are allowed since ES2023.',
            },
          ],
        },
      ],
      senior: [
        {
          q: 'A teammate says this WeakMap leaks memory. Is that true? Explain.',
          code: `const meta = new WeakMap();
class Widget {
  constructor(el) {
    meta.set(el, { widget: this, el });
  }
}`,
          short: 'No. WeakMap entries are ephemerons, so a value that points back to its key does not keep the key alive; a real leak needs a strong reference somewhere else.',
          long: `Trick question: WeakMap entries are ephemerons, so a value pointing back to its key does NOT keep the key alive.
The entry is collected when el is unreachable from elsewhere.
A real leak happens if el is also stored somewhere strong: a global array, a closure in a long-lived listener, or a Map.
Debug with a heap snapshot: look at the retainers path of detached elements.
Strong answer: knows ephemeron semantics and avoids a false "fix".
Weak answer: rewrites to remove the back reference and claims it fixed a leak.`,
          fix: `// No change needed for the WeakMap itself.
// Look for strong references instead, for example:
const registry = []; // leak: holds el forever
// Fix: remove this, or store WeakRef(el) if you really need a list.`,
          ai: true,
          exercises: [
            {
              task: 'Explain what an ephemeron is.',
              description: 'Checks GC semantics. Explain in your own words.',
              answer: 'An ephemeron is a key/value pair where the value is only reachable if the key is reachable through other paths. So cycles between key and value do not prevent collection. Weak candidates think the value keeps the key alive. Strong ones relate it to WeakMap correctness.',
            },
            {
              task: 'Use DevTools to confirm detached DOM nodes are collected.',
              description: 'Checks leak debugging skill. Describe the steps in Chrome.',
              answer: 'Take a heap snapshot, remove nodes, force GC, take another, filter by "Detached", and inspect retainers. Strong answers use the comparison view and the retainers tree, not just total memory.',
            },
          ],
        },
        {
          q: 'How fast are Map and plain objects? When does each win?',
          short: 'Maps are tuned for frequent add/delete and many dynamic keys; objects with a fixed shape get hidden-class optimizations and are faster for record-like data.',
          long: `V8 gives objects hidden classes and inline caches when shapes are stable.
Adding and deleting many keys turns objects into slow dictionary mode.
Map has predictable performance for dynamic keys, any key type, and a cheap size.
Objects risk prototype keys (__proto__, constructor) unless you use Object.create(null).
Measure with real data; micro-benchmarks are easily misleading due to JIT.
Strong answer: chooses by access pattern and correctness, then measures.`,
          follow: 'What changes if you need to send the data as JSON to a server?',
          exercises: [
            {
              task: 'Show a bug with user keys in a plain object.',
              description: 'Checks prototype key risks. Use the key "__proto__" or "constructor".',
              answer: 'counts["constructor"] returns a function from Object.prototype, so counts[k] = (counts[k] || 0) + 1 gives garbage like "function...1". Map or Object.create(null) avoids it. Strong answers mention prototype pollution.',
            },
            {
              task: 'Write a fair benchmark plan for Map vs object.',
              description: 'Checks measurement discipline. Outline steps.',
              answer: 'Use realistic key counts and access patterns, warm up, run many iterations with a tool like tinybench or mitata, and avoid dead-code elimination by using results. Test on target engines. Weak answers run one console.time loop.',
            },
          ],
        },
        {
          q: 'Implement memoize for a function that takes an object argument. Keep memory safe.',
          code: `const cache = new Map();
function getLayout(node) {
  if (cache.has(node)) return cache.get(node);
  const r = expensive(node);
  cache.set(node, r);
  return r;
}`,
          short: 'A Map keeps every node alive forever; use a WeakMap so cache entries disappear with their key.',
          long: `Map holds strong references, so removed nodes stay in memory.
WeakMap works only for object keys, which fits this case.
For primitive keys, use an LRU with a size limit instead.
Also invalidate when the object changes, because the cache key is identity, not content.
Strong answer: explains identity-based caching and invalidation.
Weak answer: adds a setInterval to clear the Map.`,
          fix: `const cache = new WeakMap();
function getLayout(node) {
  let r = cache.get(node);
  if (r === undefined) {
    r = expensive(node);
    cache.set(node, r);
  }
  return r;
}`,
          exercises: [
            {
              task: 'Extend memoize to support two object arguments.',
              description: 'Checks nested WeakMaps. Write memo2(fn).',
              answer: 'Use a WeakMap from a to a WeakMap from b to result. Concatenating keys into a string does not work for objects. Strong answers generalize to a trie of WeakMaps.',
              solution: `function memo2(fn) {
  const root = new WeakMap();
  return (a, b) => {
    let inner = root.get(a);
    if (!inner) root.set(a, (inner = new WeakMap()));
    if (!inner.has(b)) inner.set(b, fn(a, b));
    return inner.get(b);
  };
}`,
            },
            {
              task: 'Why use get then compare to undefined instead of has then get?',
              description: 'Checks a micro-optimization and its edge case. Discuss.',
              answer: 'It does one lookup instead of two. But if undefined is a valid result, it will recompute each time, so has is correct then. Strong answers mention the trade-off.',
            },
          ],
        },
      ],
      techlead: [
        {
          q: 'A team stores app state in many global Maps. Memory grows all day. How do you handle this?',
          short: 'Treat it as a process problem: measure with heap snapshots and production memory metrics, give each cache an owner, size limit and eviction policy, and add lint/review rules for module-level collections.',
          long: `First confirm: measureUserAgentSpecificMemory or performance.memory trends, plus heap snapshots from long sessions.
Find which Maps grow; usually caches without eviction or listeners registries without cleanup.
Policy: every cache declares key type, max size or TTL, and owner; prefer WeakMap for object keys.
Provide one shared, tested LRU utility instead of ad-hoc Maps.
Add a soak test (long automated session) in CI with a memory budget.
Strong answer: combines tooling, ownership, and prevention; weak answer just says "use WeakMap".`,
          ai: true,
          exercises: [
            {
              task: 'Design a soak test for memory growth.',
              description: 'Checks practical test design. Outline tool and pass/fail rule.',
              answer: 'Use Playwright to repeat a user flow N times, collect heap size via CDP after forced GC, and fail if growth passes a threshold after warmup. Weak answers rely on manual checks. Strong answers handle noise with multiple samples.',
            },
            {
              task: 'Write a review checklist item for new caches.',
              description: 'Checks governance. Write 3 to 4 bullet points.',
              answer: 'Key type and why; eviction (size/TTL/WeakMap); invalidation on data change; owner and metric. Strong answers keep it short so people actually use it.',
            },
          ],
        },
        {
          q: 'Code review. This PR uses an object as a lookup table for user-provided keys. What do you change?',
          code: `const settings = {};
function save(key, value) { settings[key] = value; }
function read(key) { return settings[key] ?? 'default'; }
save(req.body.key, req.body.value);`,
          short: 'Plain objects with untrusted keys allow prototype pollution and inherited-key bugs; switch to a Map or Object.create(null), and validate keys against an allow list.',
          long: `save('__proto__', {...}) can change the prototype; read('toString') returns a function, not 'default'.
Map has no inherited keys and no special __proto__ handling.
Validate keys with an allow list or schema (zod, valibot) at the boundary.
Add tests for dangerous keys and enable a lint rule or security scanner.
Explain the fix in the review so the team learns the pattern.
Strong answer: covers both the code fix and the team-level prevention.`,
          fix: `const ALLOWED = new Set(['theme', 'lang']);
const settings = new Map();
function save(key, value) {
  if (!ALLOWED.has(key)) throw new Error('Unknown setting');
  settings.set(key, value);
}
const read = (key) => settings.get(key) ?? 'default';`,
          exercises: [
            {
              task: 'Show the read bug with the key "toString".',
              description: 'Checks inherited key behavior. Run read("toString") on the original code.',
              answer: 'It returns Object.prototype.toString, not "default", because ?? only checks null/undefined. Strong answers then show Object.hasOwn or Map as the fix.',
            },
            {
              task: 'How would you find this pattern across a big codebase?',
              description: 'Checks scaling the fix. Describe tools.',
              answer: 'Use Semgrep or CodeQL rules for obj[userInput] = ..., plus code search for known shapes. Run them in CI. Strong answers prioritize by data source (request bodies, query strings).',
            },
          ],
        },
        {
          q: 'Should the team allow WeakRef and FinalizationRegistry in product code? What rules would you set?',
          short: 'Allow them only in small, reviewed infrastructure modules; never for business logic, because GC timing is not guaranteed.',
          long: `Finalizers may run late or never; code must work if they never run.
WeakRef.deref() can change between turns, so read it once per task.
Valid uses: caches of large, re-creatable objects; cleanup of native or WASM resources as a backup.
Rules: wrapper module with tests, documented fallback, review by a senior.
Prefer explicit lifecycle (dispose, using with Symbol.dispose) for cleanup.
Strong answer: knows the spec gives no timing guarantee and offers explicit alternatives.`,
          follow: 'Does the new using keyword with Symbol.dispose change your answer?',
          exercises: [
            {
              task: 'Rewrite finalizer-based cleanup to explicit cleanup with using.',
              description: 'Checks explicit resource management. Write a class with [Symbol.dispose] (needs TS 5.2+ or a runtime that supports it).',
              answer: 'Give the class a [Symbol.dispose]() method and declare it with using conn = open(); cleanup runs at block exit, even on errors. Strong answers mention await using and Symbol.asyncDispose for async resources.',
              solution: `class Conn { [Symbol.dispose]() { this.close(); } close() {} }
{
  using c = new Conn();
  // work
} // c.close() runs here`,
            },
            {
              task: 'Why must code not depend on a finalizer running?',
              description: 'Checks spec knowledge. Explain.',
              answer: 'The engine may never collect the object (for example the page closes, or memory is not under pressure), so the callback never runs. Timing also differs between engines. Strong answers name this as the core rule.',
            },
          ],
        },
      ],
    },
    'Generators, Symbol': {
      junior: [
        {
          q: 'What is a generator function? What does the yield keyword do?',
          short: 'A generator (function*) returns an iterator; each yield pauses the function and gives a value to the caller of next().',
          long: `Calling a generator does not run its body; it returns a generator object.
Each next() runs until the next yield and returns { value, done }.
After the last line, next() returns { value: undefined, done: true } (or the returned value once).
Generators are lazy, so they can describe infinite sequences.
Strong answer: explains pause/resume and laziness with an example.
Weak answer: thinks a generator returns an array.`,
          exercises: [
            {
              task: 'Predict each next() result.',
              description: 'Checks the iterator result shape. Run in Node.',
              code: `function* g() { yield 1; yield 2; return 3; }
const it = g();
console.log(it.next(), it.next(), it.next(), it.next());`,
              answer: 'Prints {value:1,done:false} {value:2,done:false} {value:3,done:true} {value:undefined,done:true}. Many forget the return value appears with done: true. Strong answers note for...of ignores the returned 3.',
            },
            {
              task: 'Write a generator that yields numbers from start to end.',
              description: 'Checks basic generator writing. Spread it into an array to test.',
              answer: 'function* range(a, b) { for (let i = a; i <= b; i++) yield i; } then [...range(1, 3)] gives [1, 2, 3]. Weak answers build an array inside. Strong answers mention laziness.',
              solution: `function* range(start, end) {
  for (let i = start; i <= end; i++) yield i;
}`,
            },
          ],
        },
        {
          q: 'Find and fix the bug. The second loop prints nothing.',
          code: `function* letters() { yield 'a'; yield 'b'; }
const it = letters();
for (const l of it) console.log(l);
for (const l of it) console.log(l);`,
          short: 'A generator object can be consumed only once; create a new one for each loop or make an iterable whose [Symbol.iterator] calls the generator.',
          long: `Generator objects are iterators that return themselves from [Symbol.iterator].
After the first loop finishes, the generator is done forever.
Arrays are iterables that create a fresh iterator each time, so they can be looped many times.
Fix: call letters() again, or wrap it in an object with [Symbol.iterator]: letters.
Strong answer: explains iterable vs iterator.
Weak answer: thinks the generator is "broken" or needs reset().`,
          fix: `const letters = { *[Symbol.iterator]() { yield 'a'; yield 'b'; } };
for (const l of letters) console.log(l);
for (const l of letters) console.log(l);`,
          exercises: [
            {
              task: 'What is the difference between an iterable and an iterator?',
              description: 'Checks protocol vocabulary. Explain with Array as an example.',
              answer: 'An iterable has a [Symbol.iterator]() method that returns an iterator; an iterator has next(). Arrays are iterables; arr.values() is an iterator. Strong answers know generator objects are both.',
            },
            {
              task: 'What does breaking out of a for...of do to the generator?',
              description: 'Checks return() behavior. Add a finally block to the generator and break early.',
              answer: 'break calls it.return(), so the finally block runs and the generator is closed. Later next() calls return done: true. Strong answers use this for cleanup.',
            },
          ],
        },
        {
          q: 'Are two Symbols with the same description equal? What does Symbol.for do?',
          short: 'No, every Symbol() is unique; Symbol.for(key) returns a shared symbol from a global registry, so the same key gives the same symbol.',
          long: `Symbol('id') !== Symbol('id'); the description is only a label for debugging.
Symbol.for('id') === Symbol.for('id') is true, even across iframes in the same agent.
Symbol.keyFor returns the key for registered symbols, undefined otherwise.
Symbol keys are skipped by Object.keys, for...in and JSON.stringify.
Strong answer: knows the registry and when sharing across modules or realms is needed.
Weak answer: thinks symbols are just strings.`,
          exercises: [
            {
              task: 'Predict the output.',
              description: 'Checks symbol identity and visibility. Run in Node.',
              code: `const a = Symbol('x'), b = Symbol.for('x');
const o = { [a]: 1, [b]: 2, y: 3 };
console.log(a === Symbol('x'), b === Symbol.for('x'), Object.keys(o), JSON.stringify(o));`,
              answer: 'Prints false true ["y"] {"y":3}. Symbol keys are hidden from keys and JSON. Use Object.getOwnPropertySymbols or Reflect.ownKeys to see them. Strong answers mention that.',
            },
            {
              task: 'List all keys of an object, including symbols.',
              description: 'Checks Reflect.ownKeys. Test with the object above.',
              answer: 'Reflect.ownKeys(o) returns ["y", Symbol(x), Symbol(x)], including non-enumerable keys too. Weak answers use Object.keys. Strong answers know the difference from getOwnPropertySymbols.',
            },
          ],
        },
      ],
      middle: [
        {
          q: 'How do you send a value into a generator? Explain next with an argument.',
          short: 'it.next(v) resumes the generator and makes the paused yield expression evaluate to v; the first next() argument is ignored.',
          long: `const x = yield 1 pauses; the next call next(42) sets x to 42.
The first next() starts the function, so there is no yield waiting for its value.
This two-way channel is how co and redux-saga drove async flows before async/await.
throw(err) makes the paused yield throw; return(v) finishes it and runs finally.
Strong answer: traces values step by step and knows the first-call rule.
Weak answer: thinks next(v) changes the yielded value.`,
          exercises: [
            {
              task: 'Predict the output.',
              description: 'Checks two-way communication. Run in Node.',
              code: `function* calc() {
  const a = yield 'first';
  const b = yield a * 2;
  return a + b;
}
const it = calc();
console.log(it.next(5).value, it.next(10).value, it.next(1).value);`,
              answer: 'Prints first 20 11. The first 5 is ignored; a = 10 so yield gives 20; b = 1 and return gives 11. Many say 10 for the second value. Strong answers trace each pause.',
            },
            {
              task: 'Write a tiny runner that lets a generator yield promises like await.',
              description: 'Checks understanding of co-style runners. Test with yield fetch-like promises.',
              answer: 'Call next with each resolved value and throw on rejection, until done. This is what async/await does natively. Strong answers handle rejections via it.throw.',
              solution: `function run(gen) {
  const it = gen();
  return new Promise((resolve, reject) => {
    function step(method, arg) {
      let r;
      try { r = it[method](arg); } catch (e) { return reject(e); }
      if (r.done) return resolve(r.value);
      Promise.resolve(r.value).then(v => step('next', v), e => step('throw', e));
    }
    step('next');
  });
}`,
            },
          ],
        },
        {
          q: 'Find and fix the bug. The custom iterator never stops.',
          code: `const countdown = {
  from: 3,
  [Symbol.iterator]() {
    let n = this.from;
    return { next: () => ({ value: n--, done: n < 0 }) };
  },
};
console.log([...countdown]);`,
          short: 'done is computed after n is decremented, so values and done get out of step; check the condition before decrementing.',
          long: `The object literal evaluates value: n-- first, then done: n < 0 uses the new n.
So it yields 3, 2, 1 and stops before 0 — or gives off-by-one results depending on intent.
Manual iterators are easy to get wrong; a generator removes this class of bugs.
Also add return() if the iterator holds resources.
Strong answer: rewrites with a generator and explains evaluation order.
Weak answer: tweaks numbers until it "works".`,
          fix: `const countdown = {
  from: 3,
  *[Symbol.iterator]() {
    for (let n = this.from; n >= 0; n--) yield n;
  },
};
console.log([...countdown]); // [3, 2, 1, 0]`,
          exercises: [
            {
              task: 'Make a class Range iterable with a generator method.',
              description: 'Checks *[Symbol.iterator] in classes. Test with for...of.',
              answer: 'Add *[Symbol.iterator]() { for (let i = this.a; i <= this.b; i++) yield i; } to the class. Strong answers note it can be iterated many times because each call makes a new generator.',
            },
            {
              task: 'Use iterator helpers to take the first 3 even numbers from an infinite generator.',
              description: 'Checks ES2025 iterator helpers. Run in Node 22+.',
              answer: 'naturals().filter(n => n % 2 === 0).take(3).toArray() gives [0, 2, 4] (if naturals starts at 0). Spreading an infinite generator first hangs. Strong answers mention helpers are lazy.',
              solution: `function* naturals() { let n = 0; while (true) yield n++; }
naturals().filter(n => n % 2 === 0).take(3).toArray();`,
            },
          ],
        },
        {
          q: 'What is Symbol.toPrimitive? How does it change type conversion?',
          short: 'A method under Symbol.toPrimitive is called with a hint ("number", "string" or "default") whenever JS converts the object to a primitive.',
          long: `It runs before valueOf and toString, and overrides both.
Hints: +obj gives "number", template literals give "string", obj + '' and == give "default".
Date uses "default" as "string", which is why date + 1 concatenates.
It must return a primitive, else a TypeError.
Use it sparingly: implicit conversion surprises readers.
Strong answer: lists the hints and a sensible use case such as Money objects.`,
          exercises: [
            {
              task: 'Predict output for each hint.',
              description: 'Checks hint rules. Run in Node.',
              code: `const m = { [Symbol.toPrimitive](h) { return h === 'number' ? 42 : h; } };
console.log(+m, \`\${m}\`, m + '');`,
              answer: 'Prints 42 string default. The + operator with a string uses the "default" hint, not "string". Many guess "string" for the last one. Strong answers explain why.',
            },
            {
              task: 'Implement Money that prints "$1.50" in templates and gives cents for math.',
              description: 'Checks practical use. Write the class and test both cases.',
              answer: 'Return this.cents for "number" and a formatted string otherwise. Strong answers warn that money math should stay explicit and use integers.',
              solution: `class Money {
  constructor(cents) { this.cents = cents; }
  [Symbol.toPrimitive](hint) {
    return hint === 'number' ? this.cents : \`$\${(this.cents / 100).toFixed(2)}\`;
  }
}`,
            },
          ],
        },
      ],
      senior: [
        {
          q: 'Find and fix the bug. The async generator leaks an open connection when the consumer stops early.',
          code: `async function* rows(db) {
  const cursor = await db.openCursor();
  let row;
  while ((row = await cursor.next())) yield row;
  await cursor.close();
}
for await (const r of rows(db)) {
  if (r.id === 10) break;
}`,
          short: 'On break, the generator is closed by return() at the yield, so code after the loop never runs; put the cleanup in a finally block.',
          long: `break triggers it.return(), which acts like a return statement at the paused yield.
Only finally blocks run, so cursor.close() after the loop is skipped.
Errors thrown by the consumer have the same effect.
for await calls return and awaits it, so async cleanup in finally works.
Strong answer: knows the return() semantics and tests the early exit path.
Weak answer: adds a flag variable the consumer must set.`,
          fix: `async function* rows(db) {
  const cursor = await db.openCursor();
  try {
    let row;
    while ((row = await cursor.next())) yield row;
  } finally {
    await cursor.close();
  }
}`,
          exercises: [
            {
              task: 'Write a test that proves cleanup runs on break.',
              description: 'Checks testing of the early-exit path. Use a fake cursor with a close spy (Vitest or node:test).',
              answer: 'Create a fake with next() returning rows and a close spy, iterate and break, then assert close was called once. Strong answers also test the throw path.',
            },
            {
              task: 'Can you yield inside finally? What happens?',
              description: 'Checks edge semantics. Try it in Node and call return().',
              answer: 'Yes; return() then gives that yielded value with done: false, and the generator is not finished yet. That is confusing and usually a bug. Strong answers say avoid yield in finally.',
            },
          ],
        },
        {
          q: 'How would you add cancellation to an async generator that polls an API?',
          short: 'Pass an AbortSignal, forward it to fetch and timers, check signal.aborted in the loop, and rely on return() when the consumer breaks.',
          long: `Consumer break only takes effect at the next yield; a pending await fetch keeps running.
AbortSignal lets you stop the in-flight request at once.
Use AbortSignal.any([userSignal, AbortSignal.timeout(ms)]) to combine timeout and user cancel.
Sleep must also listen to the signal, or the generator waits out the delay.
Treat AbortError as normal exit, not as a failure to log.
Strong answer: covers both cancel paths (break and signal) and cleanup.`,
          ai: true,
          exercises: [
            {
              task: 'Write an abortable sleep(ms, signal).',
              description: 'Checks signal handling in timers. Test by aborting during the sleep.',
              answer: 'Create a promise with setTimeout, and on abort clear the timer and reject with signal.reason. Strong answers use { once: true } and remove the listener after the timer fires.',
              solution: `function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const t = setTimeout(() => { signal?.removeEventListener('abort', onAbort); resolve(); }, ms);
    function onAbort() { clearTimeout(t); reject(signal.reason); }
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}`,
            },
            {
              task: 'Write the polling generator using sleep and fetch with the signal.',
              description: 'Checks composition. Iterate with for await and abort after 3 results.',
              answer: 'Loop: fetch(url, { signal }), yield the JSON, then await sleep(ms, signal). Strong answers stop cleanly on AbortError and do not swallow other errors.',
            },
          ],
        },
        {
          q: 'Explain Symbol.asyncIterator and Symbol.dispose. How do they connect to language syntax?',
          short: 'Symbol.asyncIterator powers for await...of; Symbol.dispose and Symbol.asyncDispose power using and await using for automatic cleanup.',
          long: `Well-known symbols are hooks: the language looks up a symbol method to drive syntax.
for await calls obj[Symbol.asyncIterator]() (falling back to the sync iterator).
using x = res calls x[Symbol.dispose]() at block end, in reverse order, even on throw.
DisposableStack and AsyncDisposableStack group many resources.
Explicit resource management is in TypeScript 5.2+ and shipping in modern engines.
Strong answer: understands the "protocol via symbol" design and why symbols avoid name clashes.`,
          exercises: [
            {
              task: 'Make a ReadableStream-like object usable with for await.',
              description: 'Checks the async iteration protocol. Implement [Symbol.asyncIterator] as an async generator.',
              answer: 'Add async *[Symbol.asyncIterator]() { const r = this.getReader(); try { while (true) { const { done, value } = await r.read(); if (done) return; yield value; } } finally { r.releaseLock(); } }. Strong answers include the finally.',
            },
            {
              task: 'Predict the order of disposal.',
              description: 'Checks using semantics. Run with TS 5.2+ or Node with support.',
              code: `{
  using a = { [Symbol.dispose]() { console.log('a'); } };
  using b = { [Symbol.dispose]() { console.log('b'); } };
  console.log('body');
}`,
              answer: 'Prints body, b, a. Disposal runs in reverse order of declaration, like a stack. Strong answers relate this to try/finally nesting.',
            },
          ],
        },
      ],
      techlead: [
        {
          q: 'A team uses redux-saga with generators. New hires find it hard. Would you migrate? How?',
          short: 'Decide based on cost and pain: for most request/response flows, TanStack Query or RTK Query plus async/await is simpler; keep sagas only where complex orchestration really needs them, and migrate feature by feature.',
          long: `Gather data: onboarding time, bugs in saga code, which sagas are simple fetches vs real workflows.
Simple fetch-and-store sagas map directly to query libraries with caching and cancellation built in.
Complex flows (debounced races, long-running workflows) may stay or move to a state machine (XState).
Migrate incrementally: new features on the new pattern, old sagas moved when touched.
Set a clear end state and track remaining sagas.
Strong answer: avoids big-bang rewrites and gives decision criteria, not taste.`,
          ai: true,
          exercises: [
            {
              task: 'Write the criteria for keeping a saga.',
              description: 'Checks decision framing. List 3 to 4 criteria.',
              answer: 'Keep if it coordinates several actions over time, needs takeLatest/race semantics not covered by the query lib, or has heavy tests that would be costly to redo. Weak answers say "keep all" or "drop all".',
            },
            {
              task: 'Estimate migration effort for 120 sagas.',
              description: 'Checks planning. Describe how you would size it.',
              answer: 'Classify sagas by type, migrate a sample of each type to measure time, then extrapolate and add buffer. Strong answers propose parallel run and metrics, not gut feeling.',
            },
          ],
        },
        {
          q: 'Code review. A library adds a "_cache" string property to user objects. What do you suggest?',
          code: `export function getSize(obj) {
  if (obj._cache) return obj._cache;
  obj._cache = computeSize(obj);
  return obj._cache;
}`,
          short: 'Do not write string-keyed properties onto objects you do not own; use a module-private WeakMap (best) or a unique Symbol key.',
          long: `_cache can collide with user data, shows up in JSON, Object.keys and spreads.
Mutating input objects can break frozen objects (TypeError in strict mode) and React state.
A Symbol key avoids collisions but is still visible via Reflect.ownKeys and still mutates.
A WeakMap keeps the cache fully outside the object, with automatic cleanup.
Strong answer: ranks WeakMap over Symbol and explains why mutation is the core issue.`,
          fix: `const cache = new WeakMap();
export function getSize(obj) {
  if (!cache.has(obj)) cache.set(obj, computeSize(obj));
  return cache.get(obj);
}`,
          exercises: [
            {
              task: 'Show how the original code breaks with a frozen object.',
              description: 'Checks strict-mode behavior. Call getSize(Object.freeze({})) in an ES module.',
              answer: 'It throws a TypeError because modules are strict and the object is not extensible. Strong answers note this hits state from Immer or Redux Toolkit in dev mode.',
            },
            {
              task: 'When would a Symbol key still be the right choice?',
              description: 'Checks nuance. Give one case.',
              answer: 'When the data must travel with the object across modules or realms, for example a protocol method like Symbol.for("app.inspect"). Strong answers recognize that WeakMap state is local to one module instance.',
            },
          ],
        },
        {
          q: 'Your team wants to process large files in the browser with generators and streams. How do you set guidelines?',
          short: 'Standardize on Web Streams (with async iteration) for I/O, generators for pure lazy transforms, and require backpressure, cancellation and memory budgets in reviews.',
          long: `Web Streams give backpressure and pipeTo/pipeThrough; they are iterable with for await in modern browsers.
Generators are great for lazy CPU transforms but have no built-in backpressure across async boundaries.
Move heavy parsing to a Web Worker and transfer chunks to keep the main thread free.
Guidelines: never load the whole file into memory, always pass AbortSignal, measure peak memory.
Provide shared helpers so each team does not reinvent chunking.
Strong answer: names concrete APIs and a way to check compliance.`,
          follow: 'What changes if the files must also upload while they are processed?',
          exercises: [
            {
              task: 'Count lines in a large File without reading it all.',
              description: 'Checks streaming. Use file.stream() with TextDecoderStream and for await.',
              answer: 'Pipe file.stream() through new TextDecoderStream(), iterate chunks, and count "\\n". Peak memory stays near one chunk. Weak answers call file.text(). Strong answers handle the last line without a newline.',
              solution: `async function countLines(file) {
  let n = 0, last = '';
  for await (const chunk of file.stream().pipeThrough(new TextDecoderStream())) {
    for (const c of chunk) if (c === '\\n') n++;
    last = chunk.at(-1) ?? last;
  }
  return last && last !== '\\n' ? n + 1 : n;
}`,
            },
            {
              task: 'How would you check the guideline in code review?',
              description: 'Checks enforcement. List concrete signals.',
              answer: 'Flag file.text(), arrayBuffer() on large inputs, missing signal parameters, and parsing on the main thread. Add a lint rule or a review checklist. Strong answers back it with a performance test on a big fixture.',
            },
          ],
        },
      ],
    },
    'Event Loop': {
      junior: [
        {
          q: 'Why does setTimeout with 0 milliseconds not run right away?',
          short: 'setTimeout(fn, 0) schedules a task; it runs only after the current code finishes and all microtasks are done, and browsers may clamp the delay.',
          long: `JavaScript runs one piece of code at a time on the main thread.
A timer callback waits in the task queue until the call stack is empty.
Promise callbacks (microtasks) run before the next task, so they go first.
Nested timers are clamped to at least 4 ms after 5 levels; background tabs are throttled more.
Strong answer: explains the stack, queues, and that the delay is a minimum, not a guarantee.
Weak answer: says 0 means "immediately".`,
          exercises: [
            {
              task: 'Predict the order of the logs.',
              description: 'Checks sync vs task ordering. Run in a browser or Node.',
              code: `console.log('A');
setTimeout(() => console.log('B'), 0);
console.log('C');`,
              answer: 'Prints A, C, B. The timer callback waits until the script ends. Some candidates say A, B, C. Strong answers name the task queue.',
            },
            {
              task: 'Does setTimeout(fn, 1000) run exactly after one second?',
              description: 'Checks delay semantics. Block the thread for 3 seconds after scheduling and observe.',
              answer: 'No, it runs after at least one second, and later if the thread is busy. With a 3-second busy loop, it runs after about 3 seconds. Strong answers mention tab throttling too.',
            },
          ],
        },
        {
          q: 'Find and fix the bug. The loading text never shows before the heavy work.',
          code: `button.onclick = () => {
  status.textContent = 'Loading...';
  heavyCalculation(); // takes 2 seconds
  status.textContent = 'Done';
};`,
          short: 'The browser paints only after the current task ends, so it never shows "Loading..."; yield to the browser before the heavy work, or move the work to a Web Worker.',
          long: `DOM changes are applied, but rendering happens between tasks.
During the 2-second task, the page cannot paint or respond to clicks.
Quick fix: let a frame paint (requestAnimationFrame then setTimeout, or await scheduler.yield()) before starting.
Better fix: run heavyCalculation in a Web Worker so the UI stays responsive.
Strong answer: explains render timing and chooses the Worker for long work.
Weak answer: thinks textContent is "async".`,
          fix: `button.onclick = async () => {
  status.textContent = 'Loading...';
  await new Promise(r => requestAnimationFrame(() => setTimeout(r, 0)));
  heavyCalculation();
  status.textContent = 'Done';
};`,
          exercises: [
            {
              task: 'Why does await Promise.resolve() alone not fix it?',
              description: 'Checks microtask vs render timing. Try it and see.',
              answer: 'Microtasks run before rendering, so the browser still has no chance to paint. You need a new task or a frame. Strong answers explain the order: task, microtasks, render.',
            },
            {
              task: 'Move heavyCalculation to a Web Worker.',
              description: 'Checks basic Worker usage. Write main and worker code.',
              answer: 'Create new Worker(new URL("./calc.js", import.meta.url), { type: "module" }), postMessage the input, and update the status on message. Strong answers handle errors with the error event.',
            },
          ],
        },
        {
          q: 'What is a microtask? Name two ways to create one.',
          short: 'A microtask is a callback that runs right after the current script, before the next task; Promise.then and queueMicrotask create them.',
          long: `Microtasks come from promise reactions, await continuations, queueMicrotask and MutationObserver.
The engine empties the whole microtask queue after each task, before rendering.
New microtasks added during this time also run in the same round.
That means an endless chain of microtasks can freeze the page.
Strong answer: knows the "drain fully" rule and its risk.
Weak answer: thinks microtasks are just "faster timers".`,
          exercises: [
            {
              task: 'Predict the order.',
              description: 'Checks microtask vs task order. Run in Node or a browser.',
              code: `setTimeout(() => console.log('timeout'));
queueMicrotask(() => console.log('micro'));
Promise.resolve().then(() => console.log('promise'));
console.log('sync');`,
              answer: 'Prints sync, micro, promise, timeout. Microtasks run in the order they were queued, before the timer. Strong answers say why micro comes before promise.',
            },
            {
              task: 'Why can this freeze the page?',
              description: 'Checks microtask starvation. Read the code; do not run it in a real tab.',
              code: `function loop() { queueMicrotask(loop); }
loop();`,
              answer: 'Each microtask queues another, so the queue never empties and the browser never renders or handles input. A setTimeout loop would not freeze the page. Strong answers explain the difference.',
            },
          ],
        },
      ],
      middle: [
        {
          q: 'Predict the order of logs with async functions. Explain each step.',
          code: `async function a() {
  console.log('a1');
  await null;
  console.log('a2');
}
console.log('start');
a();
Promise.resolve().then(() => console.log('p'));
console.log('end');`,
          short: 'Order: start, a1, end, a2, p. Code before the first await runs synchronously; the rest is a microtask queued before the .then callback.',
          long: `Calling a() runs it synchronously until await.
await null queues the continuation as a microtask.
Then the .then callback is queued as a second microtask.
After end, microtasks run in order: a2, then p.
Awaiting a native promise takes one tick in modern engines (since the 2019 spec change); awaiting a thenable takes more.
Strong answer: explains the synchronous part of async functions.`,
          exercises: [
            {
              task: 'What changes if a() does not contain any await?',
              description: 'Checks async function sync behavior. Remove the await and predict.',
              answer: 'Then a1 and a2 both log synchronously: start, a1, a2, end, p. An async function only becomes async at the first await. Strong answers note it still returns a promise.',
            },
            {
              task: 'Explain why "return await" can change ordering.',
              description: 'Checks extra ticks. Compare return p vs return await p in an async function.',
              answer: 'return p in an async function adopts the promise, which takes extra microtask ticks, while return await p resolves after one tick. Inside try/catch, return await is needed to catch the rejection. Strong answers care more about the try/catch rule than the tick count.',
            },
          ],
        },
        {
          q: 'How can you keep the page responsive while processing a large array on the main thread?',
          short: 'Split the work into chunks and yield to the browser between chunks, using scheduler.yield() where supported or setTimeout as a fallback.',
          long: `Long tasks (over 50 ms) block input and hurt INP.
Process items in batches, check elapsed time, and yield when over a budget (for example 5 to 10 ms).
scheduler.yield() keeps your continuation at high priority; setTimeout puts it at the back of the queue.
navigator.scheduling.isInputPending was a Chromium-only option and is now discouraged in favor of yielding.
For very heavy work, a Web Worker is better.
Strong answer: uses time budgets, not fixed item counts.`,
          follow: 'What if the array processing must also be cancellable?',
          exercises: [
            {
              task: 'Write a yieldToMain helper with a fallback.',
              description: 'Checks feature detection. Run in Chrome and Firefox.',
              answer: 'Use globalThis.scheduler?.yield ? scheduler.yield() : new Promise(r => setTimeout(r, 0)). Strong answers explain why a microtask (Promise.resolve) is not a yield.',
              solution: `const yieldToMain = () =>
  globalThis.scheduler?.yield
    ? scheduler.yield()
    : new Promise(resolve => setTimeout(resolve, 0));`,
            },
            {
              task: 'Process items with a 8 ms time budget.',
              description: 'Checks time-based chunking. Use performance.now().',
              answer: 'Track a deadline; when performance.now() passes it, await yieldToMain() and reset the deadline. Strong answers keep each item small and measure with the Performance panel.',
              solution: `async function processAll(items, fn) {
  let deadline = performance.now() + 8;
  for (const item of items) {
    fn(item);
    if (performance.now() > deadline) {
      await yieldToMain();
      deadline = performance.now() + 8;
    }
  }
}`,
            },
          ],
        },
        {
          q: 'Find and fix the bug. The animation is jumpy and sometimes skips frames.',
          code: `function animate() {
  box.style.left = (parseInt(box.style.left) || 0) + 2 + 'px';
  setTimeout(animate, 16);
}
animate();`,
          short: 'setTimeout is not synced with the screen refresh and drifts; use requestAnimationFrame with time-based movement, and animate transform instead of left.',
          long: `Timers can fire mid-frame or twice per frame, so movement looks uneven.
Screens may run at 60, 120 or 144 Hz; a fixed 16 ms is wrong on many devices.
requestAnimationFrame runs right before paint and pauses in background tabs.
Move by elapsed time so speed is the same at any frame rate.
Changing left triggers layout; transform can run on the compositor.
Strong answer: covers timing, frame rate independence and compositing.`,
          fix: `let start;
function animate(t) {
  start ??= t;
  const x = ((t - start) / 1000) * 120; // 120 px per second
  box.style.transform = \`translateX(\${x}px)\`;
  if (x < 600) requestAnimationFrame(animate);
}
requestAnimationFrame(animate);`,
          exercises: [
            {
              task: 'Where does requestAnimationFrame run in the event loop?',
              description: 'Checks rendering steps. Explain the order.',
              answer: 'After a task and its microtasks, if the browser decides to render, it runs rAF callbacks, then style, layout and paint. Strong answers note rAF does not run every loop turn.',
            },
            {
              task: 'When would you use the Web Animations API or CSS instead?',
              description: 'Checks tool choice. Give one example.',
              answer: 'For simple transitions (fade, slide) CSS or element.animate() is simpler and can run off the main thread. Use rAF for physics or values from user input. Strong answers prefer the declarative tool first.',
            },
          ],
        },
      ],
      senior: [
        {
          q: 'Predict the order in Node.js. Explain the phases.',
          code: `const fs = require('node:fs');
fs.readFile(__filename, () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
  process.nextTick(() => console.log('tick'));
  Promise.resolve().then(() => console.log('promise'));
});`,
          short: 'Inside an I/O callback, the order is tick, promise, immediate, timeout: nextTick queue first, then promises, then the check phase before the next timers phase.',
          long: `The I/O callback runs in the poll phase.
After each callback, Node drains process.nextTick, then the promise microtask queue.
Next comes the check phase (setImmediate), then the loop returns to timers.
At the top level (not inside I/O), timeout vs immediate order is not guaranteed.
Overusing nextTick can starve I/O, like microtasks starve rendering.
Strong answer: knows the I/O context makes the order deterministic.`,
          ai: true,
          exercises: [
            {
              task: 'What happens to the order at the top level of the script?',
              description: 'Checks the non-determinism case. Run it a few times outside the callback.',
              answer: 'setTimeout 0 and setImmediate can print in either order, depending on how fast the loop starts. tick and promise still come first. Strong answers explain the 1 ms timer threshold.',
            },
            {
              task: 'Why prefer queueMicrotask over process.nextTick in new code?',
              description: 'Checks portability judgment. Explain.',
              answer: 'queueMicrotask is standard and works the same in browsers and Node; nextTick is Node-only and runs before promises, which can surprise people. Node docs recommend queueMicrotask for most cases.',
            },
          ],
        },
        {
          q: 'How do Web Workers and the main thread communicate? What are the costs?',
          short: 'They use postMessage with the structured clone algorithm; large data should be transferred (ArrayBuffer) or shared (SharedArrayBuffer) to avoid copy costs.',
          long: `Each worker has its own event loop and global scope, with no DOM access.
postMessage copies data via structured clone; big objects cost time on both sides.
Transferables move ownership (ArrayBuffer, MessagePort, OffscreenCanvas) with near-zero cost.
SharedArrayBuffer needs cross-origin isolation (COOP/COEP headers) and Atomics for sync.
Messages arrive as tasks, so a busy main thread delays them.
Strong answer: measures serialization cost and picks transfer when data is big.`,
          exercises: [
            {
              task: 'Send a 100 MB ArrayBuffer to a worker without copying it.',
              description: 'Checks transferables. Write the postMessage call and check byteLength afterward.',
              answer: 'worker.postMessage(buf, [buf]); after this, buf.byteLength is 0 on the main thread because ownership moved. Strong answers mention structuredClone also supports transfer.',
            },
            {
              task: 'Why would the worker reply arrive late even though the worker is fast?',
              description: 'Checks event loop thinking. Explain.',
              answer: 'The message event is a task on the main thread; if the main thread runs a long task, the reply waits. Strong answers suggest breaking up main-thread work.',
            },
          ],
        },
        {
          q: 'Find and fix the bug. The UI shows results from an old request.',
          code: `input.addEventListener('input', async (e) => {
  const res = await fetch(\`/search?q=\${e.target.value}\`);
  render(await res.json());
});`,
          short: 'Responses can come back in any order, so a slow old request can overwrite a newer one; abort previous requests (or ignore stale ones) and encode the query.',
          long: `Each input event starts a request; network timing decides which resolves last.
Fix: keep an AbortController and abort the previous request before a new one.
Also ignore AbortError, and encode the value with encodeURIComponent.
Add a debounce to reduce load.
A request id check also works but does not save bandwidth.
Strong answer: explains the race through the event loop and fixes both correctness and load.`,
          fix: `let controller;
input.addEventListener('input', async (e) => {
  controller?.abort();
  controller = new AbortController();
  try {
    const q = encodeURIComponent(e.target.value);
    const res = await fetch(\`/search?q=\${q}\`, { signal: controller.signal });
    render(await res.json());
  } catch (err) {
    if (err.name !== 'AbortError') throw err;
  }
});`,
          exercises: [
            {
              task: 'Reproduce the race in a test.',
              description: 'Checks testing async ordering. Use fake fetch with different delays (Vitest fake timers).',
              answer: 'Mock fetch so the first query resolves after 300 ms and the second after 100 ms, then assert the final render uses the second query. Strong answers run it with and without the fix.',
            },
            {
              task: 'Does abort stop the server work?',
              description: 'Checks understanding of abort scope. Explain.',
              answer: 'No, it only closes the client side and rejects the promise; the server may still finish the work. Strong answers mention server-side cancellation if needed.',
            },
          ],
        },
      ],
      techlead: [
        {
          q: 'How would you set main-thread rules for many teams working on one large app?',
          short: 'Set a long-task budget, measure INP and long animation frames in real-user monitoring per team, give shared yielding and worker helpers, and block regressions in CI.',
          long: `Define rules: no task over 50 ms in key interactions; heavy work in workers; yield in loops.
Use the Long Animation Frames API (LoAF) in RUM to attribute slow frames to scripts and owners.
Give teams a dashboard with their own INP and top scripts.
Add lab checks (Lighthouse CI, Playwright traces) with budgets for key flows.
Provide helpers (yieldToMain, worker pool) so the right way is the easy way.
Strong answer: combines measurement, ownership and enablement, not only rules.`,
          ai: true,
          exercises: [
            {
              task: 'How do you attribute a slow interaction to a team?',
              description: 'Checks RUM attribution. Describe the data you collect.',
              answer: 'Collect INP with the web-vitals attribution build and LoAF script entries (sourceURL, function name), then map URLs to owners via a CODEOWNERS-like table. Strong answers sample to control cost.',
            },
            {
              task: 'Write a CI rule for long tasks.',
              description: 'Checks practical enforcement. Describe tool and threshold.',
              answer: 'Run a Playwright script for key flows with CPU throttling, collect the trace, and fail if total blocking time or any task over a threshold grows past budget. Strong answers allow small noise margins.',
            },
          ],
        },
        {
          q: 'Code review. A shared helper wraps every callback in setTimeout 0 "to avoid blocking". What is your feedback?',
          code: `export function safe(fn) {
  return (...args) => setTimeout(() => fn(...args), 0);
}
button.addEventListener('click', safe(handleClick));`,
          short: 'Deferring does not reduce work; it adds delay, breaks preventDefault and user-activation APIs, and hides errors from the caller. Fix the slow code or chunk it instead.',
          long: `The same work still runs on the main thread, just later.
event.preventDefault() inside the delayed fn does nothing; the default action already happened.
APIs that need user activation (clipboard, fullscreen, popups) can fail.
Return values and thrown errors are lost to the caller, and tests need fake timers.
Better: profile, then optimize, chunk with scheduler.yield, or move to a worker.
Strong answer: gives specific broken behaviors and a better default.`,
          fix: `button.addEventListener('click', async (e) => {
  e.preventDefault();
  updateUiImmediately();
  await yieldToMain(); // let the browser paint feedback
  doHeavyPart();
});`,
          exercises: [
            {
              task: 'Show how preventDefault breaks with the helper.',
              description: 'Checks event timing. Use a link and call preventDefault inside safe().',
              answer: 'The browser navigates because preventDefault runs after dispatch finished. Strong answers explain that default actions happen at the end of dispatch.',
            },
            {
              task: 'How would you remove this helper across the codebase safely?',
              description: 'Checks migration planning. Outline steps.',
              answer: 'Find usages, add a lint rule to block new ones, measure interactions before and after, and replace in batches with tests. Strong answers check each site for real long work first.',
            },
          ],
        },
        {
          q: 'Should the team move some logic into Web Workers? How do you decide?',
          short: 'Move CPU-heavy, DOM-free work with clear inputs and outputs when profiling shows long tasks; keep small work on the main thread, because messaging and complexity have a cost.',
          long: `Good fits: parsing, search indexes, image processing, diffing big data.
Bad fits: tiny tasks, DOM-heavy logic, code that needs lots of shared state.
Measure: long task time vs message and clone cost.
Use a small RPC library (Comlink) or a worker pool to keep code readable.
Plan for build setup, error handling, and testing workers.
Strong answer: decides from profiles and gives a rollout with metrics.`,
          follow: 'What if the work needs a lot of shared memory with the main thread?',
          exercises: [
            {
              task: 'List three signals that a feature should use a worker.',
              description: 'Checks decision criteria. Write a short list.',
              answer: 'Repeated long tasks in profiles, pure computation without DOM, and large data that can be transferred. Strong answers add a measured INP problem as the trigger.',
            },
            {
              task: 'What can go wrong after moving to a worker?',
              description: 'Checks risk awareness. Name two issues.',
              answer: 'Clone cost can be higher than the work itself; errors in the worker are silent without handlers; bundling and CSP may block worker scripts. Strong answers plan monitoring for worker errors.',
            },
          ],
        },
      ],
    },
    'Performance Optimization': {
      junior: [
        {
          q: 'What does lazy loading mean for images? How do you do it in HTML?',
          short: 'Lazy loading delays loading off-screen images until the user scrolls near them; add loading="lazy" to img and iframe tags.',
          long: `The browser skips far-away images on first load, saving data and time.
Do not lazy-load the main image at the top (the LCP image); that makes LCP worse.
Set width and height (or aspect-ratio) so the layout does not jump (CLS).
For the LCP image, use fetchpriority="high".
Strong answer: knows when NOT to lazy-load and mentions sizes.
Weak answer: lazy-loads everything.`,
          exercises: [
            {
              task: 'Fix this hero image markup.',
              description: 'Checks LCP best practices. Edit the HTML.',
              code: `<img src="hero.jpg" loading="lazy">`,
              answer: 'Remove loading="lazy", add width/height and fetchpriority="high": <img src="hero.jpg" width="1200" height="600" fetchpriority="high" alt="...">. Strong answers also mention modern formats (AVIF/WebP).',
            },
            {
              task: 'How do you check if lazy loading works?',
              description: 'Checks DevTools use. Describe steps.',
              answer: 'Open the Network panel, filter by Img, reload, and scroll; images should load as you scroll. Strong answers also check the Lighthouse LCP element.',
            },
          ],
        },
        {
          q: 'Find and fix the bug. The page gets slower each time the user opens and closes the modal.',
          code: `function openModal() {
  modal.hidden = false;
  window.addEventListener('resize', () => positionModal());
}
function closeModal() {
  modal.hidden = true;
}`,
          short: 'Each open adds a new resize listener and none is removed, so work and memory grow; remove the listener on close.',
          long: `Anonymous functions cannot be removed with removeEventListener.
After 10 opens, every resize runs positionModal 10 times.
Use a named function or an AbortController and abort on close.
This is one of the most common memory leaks in SPAs.
Strong answer: finds the leak and uses AbortController.
Weak answer: adds a check inside positionModal.`,
          fix: `let ac;
function openModal() {
  modal.hidden = false;
  ac = new AbortController();
  window.addEventListener('resize', positionModal, { signal: ac.signal });
}
function closeModal() {
  modal.hidden = true;
  ac?.abort();
}`,
          exercises: [
            {
              task: 'How do you see how many listeners are attached?',
              description: 'Checks DevTools. Use Chrome.',
              answer: 'In the Console, run getEventListeners(window); or check the Event Listeners tab in Elements. Strong answers also use the Performance Monitor to watch the listener count.',
            },
            {
              task: 'Fix the leak without AbortController.',
              description: 'Checks the named-function approach. Write the code.',
              answer: 'Use a named function and call window.removeEventListener("resize", positionModal) on close. Strong answers note the options (capture) must match too.',
            },
          ],
        },
        {
          q: 'What are Core Web Vitals? What does each one measure?',
          short: 'LCP (loading of the main content), INP (how fast the page responds to input) and CLS (how much the layout jumps).',
          long: `Good targets: LCP under 2.5 s, INP under 200 ms, CLS under 0.1, at the 75th percentile.
INP replaced FID in March 2024.
Field data (real users, CrUX) matters more than lab data.
LCP: optimize server time, images, render-blocking CSS. INP: shorten long tasks. CLS: reserve space.
Strong answer: names targets and one fix for each.
Weak answer: lists only Lighthouse score.`,
          exercises: [
            {
              task: 'Name one common cause and fix for each vital.',
              description: 'Checks practical knowledge. Write three short pairs.',
              answer: 'LCP: big unoptimized hero image → compress and preload. INP: heavy click handler → split work. CLS: images without size or late ads → set dimensions. Strong answers give concrete numbers.',
            },
            {
              task: 'Measure the vitals in your own code.',
              description: 'Checks the web-vitals library. Write the setup.',
              answer: 'import { onLCP, onINP, onCLS } from "web-vitals"; then send each metric to analytics with navigator.sendBeacon. Strong answers know values are reported at page hide.',
            },
          ],
        },
      ],
      middle: [
        {
          q: 'How does code splitting work with dynamic import? When should you use it?',
          short: 'import() loads a module on demand and returns a promise; bundlers make a separate chunk for it. Use it for routes, heavy widgets and rarely used features.',
          long: `Route-level splitting gives the biggest win with little effort.
Split heavy, rarely used libraries (charts, editors, PDF) behind user actions.
Too many tiny chunks add request overhead and waterfalls.
Prefetch likely-next chunks on idle or hover to hide latency.
Show a loading state, and handle load errors (for example after a deploy).
Strong answer: covers trade-offs and chunk error handling.`,
          exercises: [
            {
              task: 'Load a chart library only when the user opens the chart tab.',
              description: 'Checks dynamic import. Write the click handler.',
              answer: 'On click, const { Chart } = await import("chart.js/auto"); then render. Strong answers add a spinner and catch errors.',
              solution: `tab.addEventListener('click', async () => {
  const { default: Chart } = await import('chart.js/auto');
  new Chart(canvas, config);
});`,
            },
            {
              task: 'Users see "Failed to fetch dynamically imported module" after a deploy. Why?',
              description: 'Checks deploy issues. Explain and propose a fix.',
              answer: 'Old HTML references chunk files that the new deploy removed. Keep old assets for a while, or catch the error and reload the page once. Strong answers mention both.',
            },
          ],
        },
        {
          q: 'Find and fix the bug. Scrolling feels slow on this page.',
          code: `window.addEventListener('scroll', () => {
  const y = window.scrollY;
  header.classList.toggle('small', y > 100);
  items.forEach(el => {
    if (el.getBoundingClientRect().top < innerHeight) el.classList.add('visible');
  });
});`,
          short: 'The handler measures many elements on every scroll event, causing layout work; use IntersectionObserver for visibility and a passive listener or CSS for the header.',
          long: `Scroll events fire many times per frame on some devices.
getBoundingClientRect after class changes forces synchronous layout (thrashing).
IntersectionObserver runs off the main thread and only reports changes.
For the header, a sentinel element with IntersectionObserver or CSS scroll-driven animations avoids JS on scroll.
Strong answer: replaces polling with observers.
Weak answer: just adds throttle.`,
          fix: `const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  }
});
items.forEach(el => io.observe(el));

new IntersectionObserver(([e]) => header.classList.toggle('small', !e.isIntersecting))
  .observe(document.querySelector('#top-sentinel'));`,
          exercises: [
            {
              task: 'What is a passive event listener?',
              description: 'Checks scroll performance knowledge. Explain.',
              answer: 'With { passive: true }, the browser knows you will not call preventDefault, so it can scroll right away. It matters for touch and wheel listeners. Strong answers note scroll events themselves cannot be cancelled.',
            },
            {
              task: 'How do you confirm the fix in DevTools?',
              description: 'Checks profiling. Describe steps.',
              answer: 'Record a Performance trace while scrolling, and check for purple layout blocks and "Forced reflow" warnings. They should disappear after the fix. Strong answers compare frame times.',
            },
          ],
        },
        {
          q: 'What do preload, prefetch and preconnect do? When do you use each?',
          short: 'preload fetches a resource needed now at high priority, prefetch fetches something for a future navigation at low priority, and preconnect opens the connection to an origin early.',
          long: `preload: fonts, LCP images, critical scripts found late by the parser; must be used or you waste bandwidth (console warns).
prefetch: next-page chunks; low priority, may be ignored.
preconnect: third-party origins you will use soon (API, CDN); limit to a few.
modulepreload: ES modules and their dependencies.
Speculation Rules API can prerender likely next pages in Chromium.
Strong answer: knows the cost of overuse and checks waterfalls.`,
          follow: 'What if the site has a strict data budget for mobile users?',
          exercises: [
            {
              task: 'Write the tag to preload a web font correctly.',
              description: 'Checks the crossorigin rule. Write the HTML.',
              answer: '<link rel="preload" href="/f.woff2" as="font" type="font/woff2" crossorigin>. Without crossorigin the font is fetched twice. Strong answers know this pitfall.',
            },
            {
              task: 'When can preload make things slower?',
              description: 'Checks trade-offs. Give an example.',
              answer: 'Preloading many resources competes with the LCP image and CSS for bandwidth, delaying them. Strong answers say preload only one or two critical items and measure.',
            },
          ],
        },
      ],
      senior: [
        {
          q: 'Find and fix the bug. This list of 10,000 rows makes the page freeze on load.',
          code: `const html = rows.map(r => \`<li>\${r.name}</li>\`).join('');
list.innerHTML = html;`,
          short: 'Rendering 10,000 DOM nodes is expensive (and this code also has an XSS risk); virtualize the list so only visible rows exist, or use content-visibility, and escape the data.',
          long: `Large DOM trees slow style, layout and memory.
Virtualization (TanStack Virtual, or a small custom one) renders about 30 rows plus a buffer.
content-visibility: auto lets the browser skip rendering off-screen parts with less code.
innerHTML with user data allows XSS; use textContent or a template with escaping.
Keep accessibility: virtual lists need aria-rowcount/aria-rowindex or real pagination.
Strong answer: compares options and handles XSS and a11y.`,
          fix: `const ROW = 32;
viewport.style.height = rows.length * ROW + 'px';
function render() {
  const start = Math.floor(scroller.scrollTop / ROW);
  const visible = rows.slice(start, start + 40);
  list.style.transform = \`translateY(\${start * ROW}px)\`;
  list.replaceChildren(...visible.map(r => {
    const li = document.createElement('li');
    li.textContent = r.name;
    return li;
  }));
}
scroller.addEventListener('scroll', () => requestAnimationFrame(render), { passive: true });
render();`,
          exercises: [
            {
              task: 'When is content-visibility better than virtualization?',
              description: 'Checks tool choice. Explain.',
              answer: 'For long pages with sections that must stay in the DOM (find-in-page, SEO, accessibility), content-visibility: auto with contain-intrinsic-size gives most of the gain. For 100k rows, virtualization is still needed. Strong answers mention both limits.',
            },
            {
              task: 'Show the XSS in the original code.',
              description: 'Checks security awareness. Use a name with an img onerror payload.',
              answer: 'A name like <img src=x onerror=alert(1)> runs script when inserted via innerHTML. Use textContent or escape. Strong answers mention Trusted Types as a guard.',
            },
          ],
        },
        {
          q: 'How do you find why a JavaScript bundle is big? How do you make it smaller?',
          short: 'Analyze the bundle (source-map-explorer, rollup-plugin-visualizer), find large or duplicated dependencies, then split, replace, or tree-shake them.',
          long: `Look for: whole libraries imported for one function, duplicate versions, polyfills for old browsers, and side-effect imports.
Check sideEffects in package.json and ESM builds so tree-shaking works.
Replace heavy libraries with native APIs (Intl, structuredClone, fetch).
Set a modern browserslist so fewer polyfills ship.
Track size in CI (size-limit, bundlewatch) to stop regressions.
Strong answer: has a process, not only a one-time cleanup.`,
          exercises: [
            {
              task: 'Replace a moment.js date format with a native API.',
              description: 'Checks Intl knowledge. Format a date as "Oct 20, 2026".',
              answer: 'new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d). This removes the library from the bundle. Strong answers cache the formatter.',
            },
            {
              task: 'Why can import { debounce } from "lodash" still pull in all of lodash?',
              description: 'Checks tree-shaking limits. Explain and fix.',
              answer: 'lodash is CommonJS, so bundlers cannot tree-shake it. Use lodash-es or import "lodash/debounce". Strong answers verify with the analyzer.',
            },
          ],
        },
        {
          q: 'What is the hidden class (shape) optimization in V8? How can code accidentally make it slow?',
          short: 'V8 gives objects with the same property layout a shared hidden class so property access is fast; changing shapes (different key order, deleting keys, adding keys later) makes access polymorphic or slow.',
          long: `Objects created with the same keys in the same order share a shape, so inline caches work.
Adding properties in different orders creates different shapes.
delete obj.key can turn the object into dictionary mode.
Functions that see many shapes become megamorphic and slower.
Arrays mixing types (ints, doubles, objects, holes) lose fast element kinds.
Strong answer: knows it matters only in hot paths and checks with profiling.`,
          ai: true,
          exercises: [
            {
              task: 'Rewrite to keep a stable shape.',
              description: 'Checks shape-friendly code. Edit the factory.',
              code: `function make(a, b) {
  const o = {};
  if (a) o.a = a;
  if (b) o.b = b;
  return o;
}`,
              answer: 'Always create both keys in the same order: return { a: a ?? null, b: b ?? null }. Strong answers say set to undefined/null instead of delete.',
            },
            {
              task: 'When is this optimization worth your time?',
              description: 'Checks judgment. Explain.',
              answer: 'Only in hot code paths seen in a profile (parsers, render loops, big data processing). In normal UI code, readability wins. Strong answers avoid premature micro-optimizations.',
            },
          ],
        },
      ],
      techlead: [
        {
          q: 'Your product is slow on cheap Android phones. Leadership wants it fixed this quarter. What is your plan?',
          short: 'Measure real-user data for that segment, pick the top 2 or 3 bottlenecks by impact, fix them with clear owners, and add budgets so it does not come back.',
          long: `Segment RUM data by device class and country; lab tests on a real mid-range phone.
Usual causes: too much JavaScript, long tasks on interaction, large images, third-party scripts.
Prioritize by user impact and effort; aim for quick wins first (images, third parties, code splitting).
Assign owners per metric, report progress weekly with the p75 numbers.
Add performance budgets in CI and review new dependencies.
Strong answer: has measurable goals and communicates trade-offs to leadership.`,
          ai: true,
          exercises: [
            {
              task: 'Write the goal statement for leadership.',
              description: 'Checks communication. One or two sentences with numbers.',
              answer: 'For example: "Bring p75 INP on low-end Android from 450 ms to under 200 ms and LCP under 2.5 s by end of quarter, measured in RUM." Weak answers say "make it faster". Strong answers tie it to a business metric too.',
            },
            {
              task: 'How do you handle a third-party script owned by marketing that costs 300 ms?',
              description: 'Checks stakeholder management. Explain your approach.',
              answer: 'Show the data, propose delayed loading or moving it to a worker (Partytown), and agree on a budget with marketing. Strong answers find a compromise, not a ban.',
            },
          ],
        },
        {
          q: 'Code review. A PR adds useMemo and useCallback everywhere "for performance". How do you respond?',
          code: `const label = useMemo(() => \`Hi \${name}\`, [name]);
const onClick = useCallback(() => setOpen(true), []);
const style = useMemo(() => ({ color: 'red' }), []);`,
          short: 'Memoization has its own cost and adds complexity; ask for a profile showing a problem, keep it only where it prevents expensive work or keeps a stable reference that matters, or rely on the React Compiler.',
          long: `Cheap calculations cost more with useMemo than without.
Stable references only help if a child is memoized or used in an effect dependency.
Static objects can move outside the component instead.
The React Compiler (stable since 2025) adds memoization automatically, so manual memo is often not needed.
Set a team rule: optimize after measuring with the React Profiler.
Strong answer: teaches the rule without blocking the author harshly.`,
          fix: `const style = { color: 'red' }; // module level
function Greeting({ name }) {
  const [open, setOpen] = useState(false);
  const label = \`Hi \${name}\`;
  return <button style={style} onClick={() => setOpen(true)}>{label}</button>;
}`,
          exercises: [
            {
              task: 'When is useMemo really needed?',
              description: 'Checks judgment. Give two cases.',
              answer: 'Expensive work (filtering 10k items) that runs often, or a value passed to a memoized child or effect where a new reference causes extra work. Strong answers say "measure first".',
            },
            {
              task: 'Write the team guideline in three lines.',
              description: 'Checks clear communication. Write it.',
              answer: 'Default: no manual memo. Add it when the Profiler shows a costly render or a reference breaks memoization. Prefer the React Compiler where enabled. Strong answers keep it short.',
            },
          ],
        },
        {
          q: 'How do you stop performance from getting worse release after release?',
          short: 'Make performance part of the delivery process: budgets in CI, real-user monitoring with alerts, owners for key metrics, and review rules for new dependencies.',
          long: `Lab gates: bundle size limits, Lighthouse CI on key pages, interaction traces.
Field: RUM dashboards for LCP/INP/CLS with alerts on regressions per release.
Ownership: each key page or flow has a team and a target.
Process: dependency review, performance section in PR template, regular review meeting.
Celebrate wins and share results to keep attention.
Strong answer: covers both prevention and detection, with clear owners.`,
          follow: 'What if you have no budget for a paid monitoring tool?',
          exercises: [
            {
              task: 'Set up a bundle size budget.',
              description: 'Checks tooling. Describe the config.',
              answer: 'Use size-limit with a limit per entry (for example 170 KB gzipped for main) and run it in CI with a PR comment. Strong answers allow intentional increases with approval.',
            },
            {
              task: 'Build free RUM for web vitals.',
              description: 'Checks low-cost monitoring. Outline the pipeline.',
              answer: 'Use the web-vitals library, send metrics with sendBeacon to a small endpoint, store in a database or logs, and graph p75 by release. Strong answers include release version and device info in each event.',
            },
          ],
        },
      ],
    },
    'Advanced Strategies and Integration': {
      junior: [
        {
          q: 'What is the fetch API? How do you check if a request failed?',
          short: 'fetch makes HTTP requests and returns a promise of a Response; it rejects only on network errors, so you must check response.ok for HTTP errors like 404 or 500.',
          long: `await fetch(url) resolves even for 404 or 500 responses.
Check res.ok (status 200–299) or res.status, then read the body with res.json().
Network failures, CORS blocks and aborts make the promise reject.
Send JSON with method, headers { 'Content-Type': 'application/json' } and body: JSON.stringify(data).
Strong answer: knows the ok check and error cases.
Weak answer: thinks catch handles 404.`,
          exercises: [
            {
              task: 'Write getJSON(url) that throws on HTTP errors.',
              description: 'Checks the ok check. Test with a URL that returns 404.',
              answer: 'Await fetch, if !res.ok throw new Error with the status, else return res.json(). Strong answers include the status in the error.',
              solution: `async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
}`,
            },
            {
              task: 'What happens if you call res.json() twice?',
              description: 'Checks body streams. Try it.',
              answer: 'The second call rejects with "body used already" because the body is a stream read once. Use res.clone() if you need it twice. Strong answers know why.',
            },
          ],
        },
        {
          q: 'Find and fix the bug. The data from localStorage is "[object Object]".',
          code: `const user = { name: 'Ann' };
localStorage.setItem('user', user);
const saved = localStorage.getItem('user');
console.log(saved.name);`,
          short: 'localStorage stores only strings, so the object is converted to "[object Object]"; use JSON.stringify to save and JSON.parse to read.',
          long: `setItem calls String() on the value.
Use JSON.stringify(user) and JSON.parse(saved), with try/catch for bad data.
getItem returns null if the key is missing.
localStorage is synchronous and small (about 5 MB); not for big data or secrets.
Strong answer: handles missing and corrupt values.
Weak answer: stores tokens here without thinking about XSS.`,
          fix: `localStorage.setItem('user', JSON.stringify(user));
let saved = null;
try {
  saved = JSON.parse(localStorage.getItem('user'));
} catch {}
console.log(saved?.name);`,
          exercises: [
            {
              task: 'What does JSON.parse(null) return?',
              description: 'Checks the missing-key case. Run it.',
              answer: 'It returns null, because null is converted to the string "null". So a missing key does not throw, but you must still handle null. Strong answers use optional chaining.',
            },
            {
              task: 'Where should you store large data in the browser?',
              description: 'Checks storage options. Name the API.',
              answer: 'Use IndexedDB (often through a small wrapper like idb) for large or structured data; it is async. Strong answers mention storage quotas and navigator.storage.persist().',
            },
          ],
        },
        {
          q: 'What is CORS? Why does the browser block some requests?',
          short: 'CORS lets a server say which other origins may read its responses; the browser blocks reading a cross-origin response unless the server sends the right Access-Control-Allow-* headers.',
          long: `An origin is protocol + host + port.
The same-origin policy protects users; CORS is the controlled exception.
Non-simple requests (for example JSON with custom headers) send an OPTIONS preflight first.
The fix is on the server (headers), or via a same-origin proxy in development.
Using credentials needs Access-Control-Allow-Credentials and a specific origin, not *.
Strong answer: knows it is a browser rule and the fix is server-side.`,
          exercises: [
            {
              task: 'Is this request cross-origin from https://app.com: https://api.app.com?',
              description: 'Checks the origin definition. Explain.',
              answer: 'Yes, a different subdomain is a different origin. So the API must send CORS headers. Strong answers also mention cookies may still be same-site.',
            },
            {
              task: 'Why does mode: "no-cors" not fix the problem?',
              description: 'Checks a common mistake. Try it and read the response.',
              answer: 'It gives an opaque response: status 0 and no readable body. The request goes out, but you cannot use the data. Strong answers say fix the server headers.',
            },
          ],
        },
      ],
      middle: [
        {
          q: 'Find and fix the bug. The retry logic hammers the server when it is down.',
          code: `async function fetchWithRetry(url) {
  while (true) {
    try { return await getJSON(url); }
    catch { /* try again */ }
  }
}`,
          short: 'It retries forever with no delay; add a retry limit, exponential backoff with jitter, and retry only errors that can succeed later.',
          long: `Endless instant retries create a retry storm and can take down a recovering server.
Use exponential backoff (for example 200 ms, 400 ms, 800 ms) plus random jitter.
Retry only network errors, 429 and 5xx; do not retry 400 or 401.
Respect the Retry-After header for 429/503.
Support AbortSignal so the user can cancel.
Strong answer: covers limits, jitter, status filtering and idempotency.`,
          fix: `async function fetchWithRetry(url, { retries = 3, signal } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, { signal });
      if (res.ok) return res.json();
      if (res.status < 500 && res.status !== 429) throw new Error(\`HTTP \${res.status}\`);
      if (attempt >= retries) throw new Error(\`HTTP \${res.status}\`);
    } catch (e) {
      if (signal?.aborted || attempt >= retries) throw e;
    }
    const delay = 200 * 2 ** attempt * (0.5 + Math.random());
    await new Promise(r => setTimeout(r, delay));
  }
}`,
          exercises: [
            {
              task: 'Why add jitter to the backoff?',
              description: 'Checks distributed systems basics. Explain.',
              answer: 'Without jitter, many clients retry at the same moments and create spikes. Random jitter spreads the load. Strong answers name the thundering herd problem.',
            },
            {
              task: 'Is it safe to retry a POST that creates an order?',
              description: 'Checks idempotency. Explain and fix.',
              answer: 'Not by default; it can create duplicate orders. Send an Idempotency-Key header that the server uses to dedupe. Strong answers know GET/PUT/DELETE are idempotent by design.',
            },
          ],
        },
        {
          q: 'How does a Service Worker help with offline support? What caching strategies exist?',
          short: 'A Service Worker sits between the page and the network and can answer requests from a cache; common strategies are cache-first, network-first and stale-while-revalidate.',
          long: `It runs in the background, separate from the page, and only on HTTPS.
Cache-first: static assets with hashed names.
Network-first: HTML and API data that must be fresh, with cache as a fallback.
Stale-while-revalidate: show cached data at once, update in the background.
Updates are tricky: a new worker waits until all tabs close unless you use skipWaiting carefully.
Strong answer: matches strategy to resource and plans updates (Workbox helps).`,
          exercises: [
            {
              task: 'Pick a strategy for each: app.js with hash, index.html, /api/profile.',
              description: 'Checks strategy choice. Explain each.',
              answer: 'app.[hash].js: cache-first; index.html: network-first; /api/profile: stale-while-revalidate or network-first depending on freshness needs. Strong answers explain why cache-first HTML causes stale apps.',
            },
            {
              task: 'Why do users still see the old version after a deploy?',
              description: 'Checks the update lifecycle. Explain and propose a fix.',
              answer: 'The new worker is installed but waiting while old tabs are open. Show a "new version" banner that calls skipWaiting and reloads. Strong answers avoid forced reloads during user work.',
            },
          ],
        },
        {
          q: 'What is the difference between ES modules and CommonJS at runtime?',
          short: 'ESM has static imports, live bindings and async loading with top-level await; CommonJS uses require at runtime, copies exports values, and loads synchronously.',
          long: `ESM imports are resolved before code runs, which allows tree-shaking.
ESM exports are live: if the module changes a let export, importers see the new value.
CommonJS module.exports is a plain object returned by require.
Node 22+ can require() synchronous ESM, easing interop; ESM with top-level await cannot be required.
In ESM, __dirname is replaced by import.meta.dirname (Node 20.11+).
Strong answer: explains live bindings and interop limits.`,
          follow: 'What changes when you publish a library that must support both?',
          exercises: [
            {
              task: 'Predict the output.',
              description: 'Checks live bindings. Run as two ES module files in Node.',
              code: `// counter.mjs
export let count = 0;
export const inc = () => { count++; };
// main.mjs
import { count, inc } from './counter.mjs';
inc();
console.log(count);`,
              answer: 'Prints 1 because ESM bindings are live. With CommonJS destructuring, it would print 0. Strong answers note importers cannot assign to count.',
            },
            {
              task: 'Configure package.json to ship ESM and CJS builds.',
              description: 'Checks the exports field. Write the config.',
              answer: 'Use "exports": { ".": { "import": "./dist/index.js", "require": "./dist/index.cjs" } } and "type": "module". Strong answers add "types" first and warn about the dual-package hazard.',
            },
          ],
        },
      ],
      senior: [
        {
          q: 'How do you handle errors from many independent widgets on one page?',
          short: 'Isolate failures per widget (error boundaries, try/catch around init), report them with context to monitoring, and show a fallback instead of breaking the whole page.',
          long: `One widget failure must not crash the shell.
Wrap each widget mount; in React, use an error boundary per widget area.
Global handlers (window error, unhandledrejection) catch what is left.
Add context: widget name, version, user action, release; strip personal data.
Use source maps in monitoring (Sentry or similar) but do not publish them publicly if you want to hide code.
Strong answer: covers isolation, reporting and user experience.`,
          exercises: [
            {
              task: 'Write a safeMount helper.',
              description: 'Checks isolation pattern. Write it with a fallback and a report call.',
              answer: 'Try to mount; on error, report with the widget name and render a small fallback message. Also catch async init errors with await. Strong answers avoid swallowing the error silently.',
              solution: `async function safeMount(name, el, mount) {
  try {
    await mount(el);
  } catch (error) {
    report(error, { widget: name });
    el.textContent = 'This section is unavailable.';
  }
}`,
            },
            {
              task: 'Why can error messages from a CDN script show only "Script error."?',
              description: 'Checks cross-origin script errors. Explain the fix.',
              answer: 'Browsers hide details of errors from cross-origin scripts. Add crossorigin="anonymous" to the script tag and Access-Control-Allow-Origin on the CDN. Strong answers know both are needed.',
            },
          ],
        },
        {
          q: 'Find and fix the bug. A postMessage listener in an embedded iframe is insecure.',
          code: `window.addEventListener('message', (e) => {
  if (e.data.type === 'setToken') {
    localStorage.setItem('token', e.data.token);
  }
});
parent.postMessage({ type: 'ready' }, '*');`,
          short: 'It accepts messages from any origin and sends to any origin; check e.origin (and e.source) against an allow list and use an exact targetOrigin.',
          long: `Any page that frames or opens this one can send setToken.
postMessage with '*' can leak data to an unexpected parent.
Validate origin, then validate the message shape.
Storing tokens in localStorage is readable by any XSS; prefer httpOnly cookies.
Consider MessageChannel for a private channel after a handshake.
Strong answer: fixes both directions and questions the token storage.`,
          fix: `const PARENT = 'https://app.example.com';
window.addEventListener('message', (e) => {
  if (e.origin !== PARENT || e.source !== parent) return;
  if (e.data?.type === 'setToken' && typeof e.data.token === 'string') {
    sessionState.token = e.data.token; // keep in memory
  }
});
parent.postMessage({ type: 'ready' }, PARENT);`,
          exercises: [
            {
              task: 'How would an attacker use the original listener?',
              description: 'Checks threat thinking. Describe the attack.',
              answer: 'The attacker puts the iframe on their own page and sends setToken with their token, so the victim uses the attacker account (login CSRF), or worse depending on the data. Strong answers also mention frame-ancestors CSP.',
            },
            {
              task: 'Set up a MessageChannel between parent and iframe.',
              description: 'Checks private channels. Write the parent side.',
              answer: 'Create new MessageChannel(), send port2 to the iframe with postMessage(msg, origin, [port2]), and talk over port1. Strong answers still check origin on the first message.',
            },
          ],
        },
        {
          q: 'How would you load a third-party SDK safely and without hurting performance?',
          short: 'Load it async or on demand, pin the version with Subresource Integrity, restrict it with CSP, and isolate it (iframe or worker) when it does not need DOM access.',
          long: `Use async/defer or load after user interaction; never block rendering.
SRI (integrity attribute) ensures the file did not change, but needs versioned URLs.
CSP limits script sources and connections; Trusted Types reduce DOM XSS.
Sandboxed iframes give strong isolation for widgets like payments.
Wrap the SDK in your own small interface so you can replace it.
Strong answer: balances security, speed and vendor lock-in.`,
          ai: true,
          exercises: [
            {
              task: 'Write a script tag with SRI.',
              description: 'Checks SRI syntax. Write the HTML.',
              answer: '<script src="https://cdn.x.com/sdk@2.1.0.js" integrity="sha384-..." crossorigin="anonymous" defer></script>. crossorigin is required for SRI on cross-origin scripts. Strong answers know SRI fails with "latest" URLs.',
            },
            {
              task: 'Wrap an analytics SDK behind your own interface.',
              description: 'Checks adapter pattern. Write track(event, props).',
              answer: 'Export track that queues events until the SDK loads, then forwards them; the app never calls the vendor directly. Strong answers add a no-op in tests and consent checks.',
            },
          ],
        },
      ],
      techlead: [
        {
          q: 'You must integrate a legacy jQuery app with a new React app. What strategy do you choose?',
          short: 'Use a strangler approach: mount React islands inside the legacy app (or legacy pages inside a new shell), share a small event and data contract, and move screens one by one.',
          long: `Big-bang rewrites rarely ship on time; incremental migration keeps delivering value.
Option A: React components mounted into legacy pages via createRoot on a DOM node.
Option B: new shell with routing; legacy pages in iframes or adapters until replaced.
Define contracts: auth, shared state, events (CustomEvent), styling isolation.
Track progress by screens migrated and remove dead code as you go.
Strong answer: chooses based on team size, risk and user impact, with a clear end state.`,
          ai: true,
          exercises: [
            {
              task: 'Mount a React component into a legacy page and clean it up.',
              description: 'Checks the island pattern. Write mount and unmount functions.',
              answer: 'const root = createRoot(el); root.render(<Widget {...props} />); and later root.unmount() when the legacy page removes el. Strong answers make sure unmount is called to avoid leaks.',
            },
            {
              task: 'List three risks of running two frameworks together.',
              description: 'Checks risk thinking. Write a short list.',
              answer: 'Double bundle size, CSS conflicts, and two sources of truth for state. Strong answers give a mitigation for each (shared vendor chunk, CSS scoping, one owner for state).',
            },
          ],
        },
        {
          q: 'Code review. A team adds a global event bus for all cross-module communication. What is your feedback?',
          code: `window.bus = new EventTarget();
// module A
bus.dispatchEvent(new CustomEvent('user', { detail: user }));
// module B
bus.addEventListener('user', (e) => render(e.detail));`,
          short: 'A global untyped bus hides dependencies and makes debugging hard; limit it to real cross-app events with typed, versioned contracts, and use explicit imports or state stores inside one app.',
          long: `Any code can send or listen, so data flow is invisible in code search.
Event names and payloads are untyped and can change silently.
Late listeners miss earlier events; this causes race bugs on startup.
Fine use: loose coupling between micro-frontends, with a documented contract.
Provide a typed wrapper with an event catalog and cleanup via AbortSignal.
Strong answer: accepts the need but adds structure and ownership.`,
          fix: `// events.ts — one typed catalog, owned by the platform team
type Events = { 'user:changed': { id: string; name: string } };
const target = new EventTarget();
export function emit<K extends keyof Events>(type: K, detail: Events[K]) {
  target.dispatchEvent(new CustomEvent(type, { detail }));
}
export function on<K extends keyof Events>(type: K, fn: (d: Events[K]) => void, signal?: AbortSignal) {
  target.addEventListener(type, (e) => fn((e as CustomEvent<Events[K]>).detail), { signal });
}`,
          exercises: [
            {
              task: 'How do you handle a listener that starts after the event fired?',
              description: 'Checks late-subscriber problems. Propose a fix.',
              answer: 'Keep the last value per event and send it to new listeners (replay), or expose current state from a store. Strong answers pick replay only for state-like events.',
            },
            {
              task: 'How do you change an event payload without breaking other teams?',
              description: 'Checks contract versioning. Explain.',
              answer: 'Add fields only, or add a new event name like user:changed.v2, and keep the old one until all consumers move. Strong answers track consumers and set a removal date.',
            },
          ],
        },
        {
          q: 'How do you choose between building a feature in-house and using a third-party library?',
          short: 'Compare total cost over time: fit to needs, maintenance health, bundle size, security, license and exit cost, versus team time to build and maintain your own.',
          long: `Check the library: activity, issues, release history, maintainers, downloads, license.
Check costs: bundle size, API fit, accessibility, browser support.
Security: dependency tree, supply-chain risk, audit history.
Build in-house if the core is small, strategic, or the library is a bad fit.
Always wrap the library behind your own interface to keep an exit path.
Strong answer: uses a written decision record and revisits it.`,
          follow: 'What if the library you chose stops being maintained next year?',
          exercises: [
            {
              task: 'Write a short decision record template.',
              description: 'Checks process. List the sections.',
              answer: 'Context, options considered, criteria, decision, consequences, review date. Strong answers keep it to one page and link it from the code.',
            },
            {
              task: 'How do you reduce supply-chain risk for npm packages?',
              description: 'Checks security practices. List concrete steps.',
              answer: 'Lockfiles with npm ci, automated updates with review (Renovate), npm audit or Socket checks, minimal dependencies, and disabling install scripts where possible. Strong answers mention provenance and pinning.',
            },
          ],
        },
      ],
    },
  },
};
