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
              task: 'Predict the output.',
              description: 'Checks static vs instance access.',
              code: `class A { static n = 1; }
const a = new A();
console.log(a.n, A.n);`,
              answer: 'undefined 1. Static fields live on the class itself, not on instances.',
            },
            {
              task: 'Predict the output.',
              description: 'Checks prototype method sharing.',
              code: `class B { f() {} g = () => {} }
const x = new B(), y = new B();
console.log(x.f === y.f, x.g === y.g);`,
              answer: 'true false. Methods are shared on the prototype; arrow fields are created per instance.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks static on class only.',
              code: `class A { static s() { return 1; } }
console.log(typeof new A().s);`,
              answer: '"undefined"; static methods live on the class.',
            },
            {
              easy: true,
              task: 'True or false: methods are shared.',
              description: 'Checks prototype method sharing.',
              code: `class A { m() {} }
console.log(new A().m === new A().m);`,
              answer: 'True; methods live on A.prototype.',
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
              task: 'Fix the bug.',
              description: 'Checks super call before this.',
              code: `class B extends A {
  constructor() { this.x = 1; super(); }
}`,
              answer: 'Call super() before touching this; this is uninitialized until super runs.',
              solution: `class B extends A {
  constructor() { super(); this.x = 1; }
}`,
            },
            {
              task: 'Predict what happens.',
              description: 'Checks missing super in derived constructor.',
              code: `class A {}
class B extends A { constructor() {} }
new B();`,
              answer: 'ReferenceError: a derived constructor must call super() or return an object.',
            },
            {
              easy: true,
              task: 'Name the call required first.',
              description: 'Checks super before this.',
              code: 'class B extends A { constructor() { ??? ; this.x = 1; } }',
              answer: 'super() must run before using this.',
            },
            {
              easy: true,
              task: 'True or false: subclass needs a constructor.',
              description: 'Checks default derived constructor.',
              code: `class B extends A {}
new B();`,
              answer: 'False; a default constructor calls super automatically.',
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
              description: 'Checks typeof quirks.',
              code: 'console.log(typeof null, typeof [], typeof (() => {}));',
              answer: 'object object function. typeof null is a historic bug; use Array.isArray for arrays.',
            },
            {
              task: 'Predict the output.',
              description: 'Checks instanceof uses prototype chain.',
              code: `class A {}
const o = Object.create(A.prototype);
console.log(o instanceof A);`,
              answer: `true. instanceof checks whether A.prototype is in o's prototype chain, not how o was built.`,
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks instanceof Array.',
              code: 'console.log([] instanceof Array);',
              answer: 'true; Array.prototype is in the chain.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks typeof array.',
              code: 'console.log(typeof []);',
              answer: '"object"; typeof does not distinguish arrays.',
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
              task: 'Predict the output.',
              description: 'Checks getter without setter.',
              code: `'use strict';
class T { get v() { return 1; } }
const t = new T(); t.v = 5;`,
              answer: 'TypeError in strict mode (class bodies are strict too): accessor property has no setter.',
            },
            {
              task: 'Spot the problem.',
              description: 'Checks expensive work hidden in getters.',
              code: `class List {
  get total() { return this.items.reduce((s, i) => s + i.price, 0); }
}
for (let i = 0; i < n; i++) use(list.total);`,
              answer: 'The getter looks like a cheap field but recomputes each access. Cache the value or use an explicit method.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks getter syntax.',
              code: `class A { get v() { return 3; } }
console.log(new A().v);`,
              answer: '3; getters are read like properties.',
            },
            {
              easy: true,
              task: 'True or false: private methods are callable outside.',
              description: 'Checks private methods.',
              code: `class A { #m() {} }
new A().#m();`,
              answer: 'False; this is a SyntaxError outside the class.',
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
              task: 'Predict the output.',
              description: 'Checks parent constructor calling overridden method.',
              code: `class A { constructor() { this.init(); } init() {} }
class B extends A {
  name = 'b';
  init() { console.log(this.name); }
}
new B();`,
              answer: 'undefined. Parent constructor runs before subclass fields are initialized.',
            },
            {
              task: 'Fix the bug.',
              description: 'Checks passing constructor arguments to super.',
              code: `class A { constructor(id) { this.id = id; } }
class B extends A { constructor(id) { super(); } }
console.log(new B(7).id);`,
              answer: 'Logs undefined; pass the argument to super.',
              solution: 'class B extends A { constructor(id) { super(id); } }',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks parent constructor runs first.',
              code: `class A { constructor() { console.log("A"); } }
class B extends A { constructor() { super(); console.log("B"); } }
new B();`,
              answer: 'A then B; super runs the parent first.',
            },
            {
              easy: true,
              task: 'True or false: fields init before super returns.',
              description: 'Checks child field timing.',
              answer: 'False; child fields initialize right after super() returns.',
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
              task: 'Predict the output.',
              description: 'Checks shadowing on write.',
              code: `const proto = { x: 1 };
const o = Object.create(proto);
o.x = 2;
console.log(proto.x, o.x);`,
              answer: '1 2. Assignment creates an own property on o, shadowing the inherited one.',
            },
            {
              task: 'Predict the output.',
              description: 'Checks mutation of shared prototype object.',
              code: `const proto = { list: [] };
const a = Object.create(proto), b = Object.create(proto);
a.list.push(1);
console.log(b.list);`,
              answer: '[1]. a.list reads the inherited array and mutates it; no own property is created.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks inherited property lookup.',
              code: `const p = { x: 1 }, o = Object.create(p);
console.log(o.x);`,
              answer: '1; lookup walks up to the prototype.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks write creates own property.',
              code: `const p = { x: 1 }, o = Object.create(p);
o.x = 2; console.log(p.x);`,
              answer: '1; writing creates an own property on o.',
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
              task: 'Predict the output.',
              description: 'Checks Symbol.species on Array subclasses.',
              code: `class MyArr extends Array {}
const m = MyArr.from([1, 2]).map(x => x);
console.log(m instanceof MyArr);`,
              answer: 'true. map uses Symbol.species, which defaults to the subclass constructor.',
            },
            {
              task: 'Fix the custom error.',
              description: 'Checks name and cause on Error subclasses.',
              code: `class HttpError extends Error {
  constructor(msg, status) { super(msg); }
}`,
              answer: 'Set name and status so logs and checks work; optionally pass cause.',
              solution: `class HttpError extends Error {
  name = 'HttpError';
  constructor(msg, status, opts) { super(msg, opts); this.status = status; }
}`,
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks custom Error name.',
              code: `class MyErr extends Error {}
console.log(new MyErr() instanceof Error);`,
              answer: 'true; subclass instances are still Errors.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks Array subclass map result.',
              code: `class L extends Array {}
console.log(L.from([1]).map(x => x) instanceof L);`,
              answer: 'true; map uses Symbol.species to make an L.',
            },
          ],
        },
        {
          q: 'Find and fix the bug. After saving and loading from localStorage, calling format throws.',
          code: `class Money {
  #cents;
  constructor(cents) { this.#cents = cents; }
  format() { return '$' + (this.#cents / 100).toFixed(2); }
}
localStorage.setItem('price', JSON.stringify(new Money(500)));
const price = JSON.parse(localStorage.getItem('price'));
price.format();`,
          short: 'JSON.stringify keeps only own enumerable public properties, so a private field gives "{}". JSON.parse returns a plain object without the class prototype. Add toJSON and a static fromJSON.',
          long: `JSON has no idea about classes, prototypes, methods or private fields.
JSON.stringify calls toJSON if it exists; use it to choose the saved shape.
JSON.parse always returns plain objects; you must rebuild instances yourself, for example with a static fromJSON or a reviver.
Version the saved shape so you can migrate old data later.
The same applies to postMessage and structuredClone: class identity and private fields are lost.
Strong answer: explains both directions and suggests a schema check on load. Weak answer: makes the field public.`,
          fix: `class Money {
  #cents;
  constructor(cents) { this.#cents = cents; }
  format() { return '$' + (this.#cents / 100).toFixed(2); }
  toJSON() { return { cents: this.#cents }; }
  static fromJSON({ cents }) { return new Money(cents); }
}
localStorage.setItem('price', JSON.stringify(new Money(500)));
const price = Money.fromJSON(JSON.parse(localStorage.getItem('price')));`,
          follow: 'How would you restore many different classes from one JSON document?',
          exercises: [
            {
              task: 'Predict the output.',
              description: 'Checks JSON drops methods and prototype.',
              code: `class P { constructor(n) { this.n = n; } hi() {} }
const o = JSON.parse(JSON.stringify(new P(1)));
console.log(o instanceof P, typeof o.hi);`,
              answer: 'false undefined. JSON keeps only own data properties; rehydrate with new P(o.n).',
            },
            {
              task: 'Write a static fromJSON that rehydrates a class.',
              description: 'Checks restoring class instances from plain data.',
              code: 'class Money { constructor(c) { this.cents = c; } }',
              answer: 'Add a static factory that builds a real instance from parsed data.',
              solution: `class Money {
  constructor(c) { this.cents = c; }
  static fromJSON(d) { return new Money(d.cents); }
}`,
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks JSON drops class prototype.',
              code: `class A { f() {} }
const o = JSON.parse(JSON.stringify(new A()));
console.log(typeof o.f);`,
              answer: 'undefined, because JSON keeps only data, not methods.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks Date becomes string in JSON.',
              code: `const s = JSON.stringify({ d: new Date(0) });
console.log(typeof JSON.parse(s).d);`,
              answer: 'string, because Date serializes to an ISO string.',
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
              task: 'Write a method decorator that logs calls.',
              description: 'Checks standard decorator signature.',
              code: 'class S { @log save() {} }',
              answer: 'A method decorator receives (value, context) and returns a replacement function.',
              solution: `function log(fn, ctx) {
  return function (...a) { console.log(ctx.name); return fn.apply(this, a); };
}`,
            },
            {
              task: 'Name two risks of decorators in shared code.',
              description: 'Checks awareness of tooling and hidden behavior.',
              code: '// TS experimentalDecorators vs TC39 decorators',
              answer: 'Legacy and standard decorator semantics differ, and decorators hide behavior, making debugging and tree shaking harder.',
            },
            {
              easy: true,
              task: 'Name the symbol.',
              description: 'Checks decorator syntax character.',
              code: `@logged
class User {}`,
              answer: 'The @ symbol applies a decorator to the class.',
            },
            {
              easy: true,
              task: 'True or false: decorators run at class definition time.',
              description: 'Checks when decorators execute.',
              code: `function dec(c) { console.log('run'); }
@dec class A {}`,
              answer: 'True, the decorator runs once when the class is defined.',
            },
          ],
        },
      ],
      techlead: [
        {
          q: 'How would you design error classes for a large frontend app? Should you extend Error? What fields do you add?',
          short: 'Extend Error so stack traces and instanceof work. Add a stable code, a name, and the original error as cause. Keep a small, shared set of error types, and make them easy to log and show to users.',
          long: `class AppError extends Error with this.name set, so logs show the right type.
Use the standard cause option: new AppError('Load failed', { cause: err }) keeps the original error.
Add a stable machine-readable code (like "AUTH_EXPIRED") for handling and analytics; message text can change.
Keep a small set: NetworkError, HttpError (with status), ValidationError, AuthError.
instanceof breaks across realms and duplicated package copies, so also check code or name.
Do not put secrets or personal data in messages; they go to monitoring.
Map errors to user messages in one place, not in every component.
Strong answer: covers cause, codes, and the instanceof limits. Weak answer: throws plain strings.`,
          exercises: [
            {
              task: 'Spot the problem.',
              description: 'Checks losing the original error.',
              code: `try { await api() }
catch (e) { throw new Error('Load failed'); }`,
              answer: `Original stack and details are lost. Use new Error('Load failed', { cause: e }).`,
            },
            {
              task: 'Name fields for an app error class.',
              description: 'Checks useful error metadata design.',
              code: 'class AppError extends Error { /* ? */ }',
              answer: 'code (stable id), user-safe message, retryable flag, cause, and context like requestId; avoid secrets.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks instanceof with custom errors.',
              code: `class ApiError extends Error {}
console.log(new ApiError() instanceof Error);`,
              answer: 'true, because ApiError extends Error.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks the name property default.',
              code: `class ApiError extends Error {}
console.log(new ApiError('x').name);`,
              answer: 'Error, because name is inherited unless you set it.',
              solution: `class ApiError extends Error {
  name = 'ApiError';
}`,
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
              task: 'Refactor inheritance to composition.',
              description: 'Checks composition over deep hierarchies.',
              code: `class Button extends Clickable {}
class Clickable extends Focusable {}`,
              answer: 'Compose small behaviors (hooks or helpers) instead of chains, so changes in a base class do not ripple.',
              solution: `function Button(p) {
  const focus = useFocus(); const click = useClick(p);
  return <button {...focus} {...click} />;
}`,
            },
            {
              task: 'Name one risk of deep inheritance.',
              description: 'Checks fragile base class problem.',
              code: '// Level1 > Level2 > Level3 > Level4',
              answer: 'Fragile base class: a change at the top silently breaks subclasses, and behavior is hard to trace.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks prototype chain lookup.',
              code: `class A { hi() { return 'A'; } }
class B extends A {}
console.log(new B().hi());`,
              answer: 'A, because B inherits hi from A.',
            },
            {
              easy: true,
              task: 'Name the principle.',
              description: 'Checks composition over inheritance.',
              code: '// Prefer: { ...withLogger, ...withTheme }',
              answer: 'Composition over inheritance: combine small parts instead of deep class chains.',
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
              task: 'Spot the problem.',
              description: 'Checks enumerable prototype pollution.',
              code: `Array.prototype.last = function () { return this.at(-1); };
for (const k in [1]) console.log(k);`,
              answer: 'Logs 0 and last: the added method is enumerable and leaks into for...in. It can also clash with future standards.',
            },
            {
              task: 'Rewrite as a safe helper.',
              description: 'Checks standalone utility instead of patching.',
              code: 'Array.prototype.groupBy = function (f) { /*...*/ };',
              answer: 'Use the built-in Object.groupBy or a plain imported function.',
              solution: 'const byType = Object.groupBy(items, i => i.type);',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks prototype methods appear in for...in.',
              code: `Array.prototype.x = 1;
for (const k in [5]) console.log(k);`,
              answer: 'Logs 0 and x, because enumerable prototype props show in for...in.',
            },
            {
              easy: true,
              task: 'True or false: Array.prototype changes affect all arrays.',
              description: 'Checks global prototype mutation.',
              code: `Array.prototype.hi = () => 'hi';
console.log([].hi());`,
              answer: 'True, every array shares Array.prototype, so all see hi.',
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
              task: 'Predict the output.',
              description: 'Checks Set uniqueness and size.',
              code: `const s = new Set([1, 1, '1']);
s.add(2).delete(1);
console.log(s.size);`,
              answer: `2. Duplicates collapse, '1' differs from 1, add returns the Set; left with '1' and 2.`,
            },
            {
              task: 'Write a one-liner to dedupe an array.',
              description: 'Checks Set to array conversion.',
              code: 'const a = [3, 1, 3, 2, 1];',
              answer: 'Spread a Set back into an array; insertion order is kept.',
              solution: 'const unique = [...new Set(a)]; // [3, 1, 2]',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks Set ignores duplicates.',
              code: `const s = new Set([1, 1, 2]);
console.log(s.size);`,
              answer: '2, because a Set stores each value once.',
            },
            {
              easy: true,
              task: 'Name the method.',
              description: 'Checks Set membership test.',
              code: `const s = new Set(['a']);
s.___('a'); // true`,
              answer: 'has, which returns true when the value is in the Set.',
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
              task: 'Predict the output.',
              description: 'Checks object keys by reference.',
              code: `const m = new Map();
m.set({ id: 1 }, 'a');
console.log(m.get({ id: 1 }));`,
              answer: 'undefined. Object keys compare by reference; use the same object or a primitive key like id.',
            },
            {
              task: 'Fix the bug.',
              description: 'Checks bracket access versus get.',
              code: `const m = new Map();
m['x'] = 1;
console.log(m.get('x'), m.size);`,
              answer: 'Brackets set a plain property, not an entry; use set.',
              solution: `m.set('x', 1);
console.log(m.get('x'), m.size); // 1 1`,
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks Map key type strictness.',
              code: `const m = new Map([[1, 'a']]);
console.log(m.get('1'));`,
              answer: 'undefined, because number 1 and string \'1\' are different keys.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks bracket access on Map.',
              code: `const m = new Map();
m['k'] = 1;
console.log(m.get('k'));`,
              answer: 'undefined, because brackets set a plain property, not a Map entry.',
              solution: 'm.set(\'k\', 1);',
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
              task: 'Predict the output.',
              description: 'Checks Map insertion order.',
              code: `const m = new Map([['b', 1], ['a', 2]]);
m.set('b', 3);
console.log([...m.keys()]);`,
              answer: `['b', 'a']. Updating an existing key keeps its original insertion position.`,
            },
            {
              task: 'Write code to convert a Map to an object.',
              description: 'Checks Map and object conversion.',
              code: `const m = new Map([['x', 1], ['y', 2]]);`,
              answer: 'Use Object.fromEntries, which accepts any iterable of pairs.',
              solution: 'const obj = Object.fromEntries(m); // { x: 1, y: 2 }',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks Map insertion order.',
              code: `const m = new Map([['b', 1], ['a', 2]]);
console.log([...m.keys()]);`,
              answer: '[\'b\', \'a\'], because Map keeps insertion order.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks forEach argument order.',
              code: 'new Map([[\'k\', \'v\']]).forEach((a, b) => console.log(a));',
              answer: 'v, because forEach passes value first, then key.',
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
              task: 'Predict the output.',
              description: 'Checks Set.prototype.intersection.',
              code: `const a = new Set([1, 2, 3]);
console.log([...a.intersection(new Set([2, 3, 4]))]);`,
              answer: '[2, 3]. intersection returns a new Set of shared elements.',
            },
            {
              task: 'Predict the output.',
              description: 'Checks isSubsetOf and difference.',
              code: `const s = new Set([1, 2]);
console.log(s.isSubsetOf(new Set([1, 2, 3])), [...s.difference(new Set([1]))]);`,
              answer: 'true [2]. difference keeps items not in the other set.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks Set union.',
              code: `const a = new Set([1, 2]);
console.log([...a.union(new Set([2, 3]))]);`,
              answer: '[1, 2, 3], union combines values without duplicates.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks Set intersection.',
              code: `const a = new Set([1, 2]);
console.log([...a.intersection(new Set([2, 3]))]);`,
              answer: '[2], intersection keeps only shared values.',
            },
          ],
        },
        {
          q: 'Find and fix the bug. Saved preferences are empty after a page reload.',
          code: `const prefs = new Map([['theme', 'dark'], ['lang', 'en']]);
localStorage.setItem('prefs', JSON.stringify(prefs));
const loaded = JSON.parse(localStorage.getItem('prefs'));
console.log(loaded.get('theme'));`,
          short: 'JSON.stringify turns a Map into "{}", because Map entries are not object properties. Save the entries as an array or a plain object, and rebuild the Map when you load.',
          long: `JSON only knows objects, arrays, strings, numbers, booleans and null.
A Map stores data internally, not as properties, so it serializes to {}.
Sets have the same problem.
Save with [...map] or Object.fromEntries(map), and load with new Map(array) or new Map(Object.entries(obj)).
Object.fromEntries only works well when keys are strings.
structuredClone and postMessage do support Map and Set, but JSON does not.
Strong answer: knows both directions and the string-key limit. Weak answer: switches everything to plain objects.`,
          fix: `localStorage.setItem('prefs', JSON.stringify([...prefs]));
const loaded = new Map(JSON.parse(localStorage.getItem('prefs')));
console.log(loaded.get('theme')); // "dark"`,
          follow: 'How would you save a Set of numbers?',
          exercises: [
            {
              task: 'Predict the output.',
              description: 'Checks JSON serialization of Set.',
              code: `console.log(JSON.stringify({ tags: new Set(['a']) }));`,
              answer: '{"tags":{}}. Sets and Maps serialize as empty objects; convert to arrays first.',
            },
            {
              task: 'Fix the save and load of a Map.',
              description: 'Checks persisting Map via entries.',
              code: `localStorage.p = JSON.stringify(prefs);
const prefs2 = JSON.parse(localStorage.p);`,
              answer: 'Serialize entries and rebuild the Map on load.',
              solution: `localStorage.p = JSON.stringify([...prefs]);
const prefs2 = new Map(JSON.parse(localStorage.p));`,
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks JSON.stringify on a Map.',
              code: 'console.log(JSON.stringify(new Map([[\'a\', 1]])));',
              answer: '{}, because Map entries are not own enumerable properties.',
              solution: 'JSON.stringify([...map])',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks reading a missing storage key.',
              code: 'console.log(localStorage.getItem(\'nope\'));',
              answer: 'null, because missing keys return null.',
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
              task: 'Predict what happens.',
              description: 'Checks WeakSet value restrictions.',
              code: `const ws = new WeakSet();
ws.add(1);`,
              answer: 'TypeError. WeakSet holds only objects (or non-registered symbols), not primitives.',
            },
            {
              task: 'Write a guard to process each node once.',
              description: 'Checks WeakSet as visited marker.',
              code: 'function init(el) { /* run once per element */ }',
              answer: 'Track elements in a WeakSet so removed nodes can be collected.',
              solution: `const seen = new WeakSet();
function init(el) {
  if (seen.has(el)) return; seen.add(el); setup(el);
}`,
            },
            {
              easy: true,
              task: 'True or false: WeakSet can hold numbers.',
              description: 'Checks WeakSet value types.',
              code: 'new WeakSet().add(1);',
              answer: 'False, it throws TypeError; WeakSet holds only objects (or non-registered symbols).',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks WeakSet has method.',
              code: `const o = {};
const ws = new WeakSet([o]);
console.log(ws.has(o));`,
              answer: 'true, because o was added to the WeakSet.',
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
              task: 'Spot the leak.',
              description: 'Checks value referencing its own key.',
              code: `const wm = new WeakMap();
wm.set(el, { el, handler });
window.cache = { el };`,
              answer: 'The leak is window.cache holding el strongly. WeakMap values referencing their key do not keep it alive alone.',
            },
            {
              task: 'Explain why WeakMap has no size.',
              description: 'Checks non-enumerability of weak collections.',
              code: `const wm = new WeakMap();
console.log(wm.size);`,
              answer: 'undefined. Entries vanish on GC at unpredictable times, so size and iteration are not exposed.',
            },
            {
              easy: true,
              task: 'True or false: WeakMap keys block garbage collection.',
              description: 'Checks weak key references.',
              code: `const wm = new WeakMap();
let k = {}; wm.set(k, 1); k = null;`,
              answer: 'False, WeakMap holds keys weakly, so unused keys can be collected.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks WeakMap has no size.',
              code: 'console.log(new WeakMap().size);',
              answer: 'undefined, because WeakMap is not countable or iterable.',
            },
          ],
        },
        {
          q: 'You need a Map with a two-part key, like user ID and date. Map compares objects by reference. What are your options?',
          short: 'Use a string key built from the parts, a nested Map (Map of Maps), or a helper that interns key objects. Each has trade-offs in speed, memory and safety.',
          long: `Map uses SameValueZero: primitives by value, objects by reference. So map.get([1, 'x']) never finds a new array.
Option 1: string key, like userId + '|' + date. Simple and fast; pick a separator that cannot appear in the parts, or use JSON.stringify of an array.
Option 2: nested Maps: map.get(userId)?.get(date). No string building, easy to delete all entries for one user, but more code.
Option 3: intern keys: keep one canonical key object per combination and reuse it; useful with WeakMap, but the intern table itself needs cleanup.
The Records and Tuples proposal that would have given value-based keys was withdrawn, so do not plan on it.
Strong answer: compares options and mentions separator collisions. Weak answer: uses arrays as keys and expects them to match.`,
          exercises: [
            {
              task: 'Write a composite key for a Map.',
              description: 'Checks string key encoding.',
              code: `const m = new Map();
// key: userId + date`,
              answer: 'Join parts with a safe separator into a primitive key.',
              solution: `const key = (u, d) => \`\${u}|\${d}\`;
m.set(key(7, '2026-01-01'), data);`,
            },
            {
              task: 'Name a second option besides string keys.',
              description: 'Checks nested Map approach.',
              code: '// Map<userId, Map<date, value>>',
              answer: `Use nested Maps: outer by userId, inner by date. Avoids encoding bugs and allows deleting one user's entries.`,
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks object keys by reference.',
              code: `const m = new Map([[{ id: 1 }, 'a']]);
console.log(m.get({ id: 1 }));`,
              answer: 'undefined, because a new object is a different reference.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks string composite keys.',
              code: `const m = new Map([['1|2024', 'a']]);
console.log(m.get(\`\${1}|\${2024}\`));`,
              answer: 'a, because equal strings match as Map keys.',
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
              task: 'Predict the output.',
              description: 'Checks WeakMap memo cache hits.',
              code: `const memo = new WeakMap();
const f = o => memo.get(o) ?? (memo.set(o, o.x * 2), o.x * 2);
console.log(f({ x: 1 }) , memo.has({ x: 1 }));`,
              answer: '2 false. A new literal is a different object, so the cache lookup misses.',
            },
            {
              task: 'Spot the problem.',
              description: 'Checks memory growth in Map caches.',
              code: `const cache = new Map();
const calc = o => cache.get(o) ?? cache.set(o, heavy(o)).get(o);`,
              answer: 'Map keeps every object alive forever. Use WeakMap so entries die with their keys.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks WeakMap with object key.',
              code: `const c = new WeakMap(), k = {};
c.set(k, 42);
console.log(c.get(k));`,
              answer: '42, because the same object reference is the key.',
            },
            {
              easy: true,
              task: 'True or false: memoize caches results by input.',
              description: 'Checks the memoize concept.',
              code: 'const memo = f => { const c = new Map(); return x => c.has(x) ? c.get(x) : (c.set(x, f(x)), c.get(x)); };',
              answer: 'True, memoize returns a stored result when the same input repeats.',
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
              task: 'Name two fixes for growing global Maps.',
              description: 'Checks cache eviction strategies.',
              code: 'const usersById = new Map(); // grows all day',
              answer: 'Add bounded LRU eviction or TTL, and delete entries on logout or route leave; use WeakMap for object keys.',
            },
            {
              task: 'Write a tiny LRU set using Map order.',
              description: 'Checks Map insertion order for eviction.',
              code: 'function put(m, k, v, max) { /* ... */ }',
              answer: 'Re-insert on write; delete the oldest key when over limit.',
              solution: `function put(m, k, v, max) {
  m.delete(k); m.set(k, v);
  if (m.size > max) m.delete(m.keys().next().value);
}`,
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks Map holds keys strongly.',
              code: `const m = new Map();
let o = {}; m.set(o, 1); o = null;
console.log(m.size);`,
              answer: '1, because Map keeps a strong reference to the key.',
            },
            {
              easy: true,
              task: 'Name the method.',
              description: 'Checks clearing a Map.',
              code: `const m = new Map([[1, 1]]);
m.___();
console.log(m.size); // 0`,
              answer: 'clear, which removes all entries from the Map.',
            },
          ],
        },
        {
          q: 'Code review: this WeakMap cache never gets a hit after state updates. Why? What team rule would you add?',
          code: `const heightCache = new WeakMap();
function getHeight(row) {
  if (!heightCache.has(row)) heightCache.set(row, measure(row));
  return heightCache.get(row);
}
// reducer
state.rows = state.rows.map((r) => ({ ...r }));`,
          short: 'The WeakMap is keyed by object identity, but the reducer copies every row on each update, so every key is new. Keep identity for unchanged items, or key by a stable ID.',
          long: `WeakMap caches only work if the same object is used again.
Copying all rows makes every lookup a miss, so measure runs again for every row, and the old entries wait for garbage collection.
Fix the reducer: copy only the row that changed and keep the others as they are.
Or key a bounded Map by row.id plus a version, if objects are always recreated.
Team rule: immutable updates must keep identity for unchanged data. This also helps React memo and selectors.
Add a check in tests or dev tools that counts cache hits.
Strong answer: links the cache miss to identity and fixes the reducer. Weak answer: switches to a Map and leaks memory.`,
          fix: `// reducer: only the changed row gets a new object
state.rows = state.rows.map((r) => (r.id === changedId ? { ...r, ...patch } : r));`,
          follow: 'When is keying by ID in a normal Map better than a WeakMap here?',
          exercises: [
            {
              task: 'Predict the output.',
              description: 'Checks immutable updates create new keys.',
              code: `const wm = new WeakMap();
let s = { a: 1 }; wm.set(s, 'x');
s = { ...s, a: 2 };
console.log(wm.get(s));`,
              answer: 'undefined. Spread creates a new object, so the reference-keyed cache misses.',
            },
            {
              task: 'Suggest a cache key fix.',
              description: 'Checks keying cache on stable inputs.',
              code: 'cache.set(state, selectTotal(state));',
              answer: 'Key on the specific slice that the selector reads, like state.items, which only changes when it actually updates.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks spread creates a new object.',
              code: `const a = { x: 1 };
console.log({ ...a } === a);`,
              answer: 'false, because spread makes a new object reference.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks WeakMap miss on new reference.',
              code: `const c = new WeakMap(); let s = {};
c.set(s, 1); s = { ...s };
console.log(c.get(s));`,
              answer: 'undefined, because the copy is a new key.',
            },
          ],
        },
        {
          q: 'A team wants to add an immutable collections library, like Immutable.js. When is it worth it compared with native Map, Set and plain objects?',
          short: 'Usually it is not worth it today. Native structures with spread, Immer, and readonly types cover most needs. A persistent collections library helps only for very large, often-changed data where structural sharing matters.',
          long: `Costs: extra bundle size, a second API to learn, and conversions (toJS, fromJS) at every boundary, which are slow and cause bugs.
Libraries and devtools expect plain objects and arrays.
Benefits: structural sharing makes updates of huge collections cheap; value equality for keys; immutability enforced at runtime.
Alternatives: Immer for easy immutable updates, Object.freeze in dev, TypeScript readonly types, and normalized state.
Decide with a measured problem, such as slow updates on lists with 100k items, not a feeling.
If you adopt it, keep it inside one module and expose plain data.
Strong answer: weighs bundle size, interop and real need. Weak answer: "immutable is always better".`,
          exercises: [
            {
              task: 'Predict the output.',
              description: 'Checks shallow freeze limitations.',
              code: `const o = Object.freeze({ list: [1] });
o.list.push(2);
console.log(o.list.length);`,
              answer: '2. Object.freeze is shallow; nested objects stay mutable.',
            },
            {
              task: 'Write an immutable update without a library.',
              description: 'Checks native immutable array methods.',
              code: `const items = [3, 1, 2];
// sorted copy, items unchanged`,
              answer: 'Use ES2023 non-mutating methods like toSorted, toSpliced, with.',
              solution: 'const sorted = items.toSorted((a, b) => a - b);',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks Object.freeze is shallow.',
              code: `const o = Object.freeze({ a: { b: 1 } });
o.a.b = 2;
console.log(o.a.b);`,
              answer: '2, because freeze only protects the top level.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks spread for immutable update.',
              code: `const a = [1, 2];
const b = [...a, 3];
console.log(a.length);`,
              answer: '2, because spread copies, leaving the original unchanged.',
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
              task: 'Predict the output.',
              description: 'Checks lazy generator execution.',
              code: `function* g() { console.log('start'); yield 1; }
const it = g();
console.log('made');
it.next();`,
              answer: 'made, then start. A generator body runs only when next is called.',
            },
            {
              task: 'Write an infinite id generator.',
              description: 'Checks yield in a loop.',
              code: '// ids.next().value -> 1, 2, 3...',
              answer: 'Loop forever and yield an incremented counter.',
              solution: `function* ids() { let i = 0; while (true) yield ++i; }
const it = ids();`,
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks first next call.',
              code: `function* g() { yield 1; }
console.log(g().next());`,
              answer: '{ value: 1, done: false }, the first yield returns 1.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks generators are lazy.',
              code: `function* g() { console.log('hi'); }
const it = g();`,
              answer: 'Nothing logs, because the body runs only on next().',
            },
          ],
        },
        {
          q: 'Find and fix the bug. The last value is missing from the array.',
          code: `function* steps() {
  yield 'start';
  yield 'middle';
  return 'end';
}
console.log([...steps()]); // expected ['start', 'middle', 'end']`,
          short: 'Spread and for...of ignore the value from return; they stop when done is true. Use yield for every value you want in the loop.',
          long: `Each next() gives { value, done }.
yield gives { value, done: false }. return gives { value, done: true }.
Loops and spread stop as soon as done is true, and they drop that value.
You can still see the return value by calling next() by hand.
Use return for a final summary only when you call next() yourself or use yield*.
Strong answer: explains the done flag. Weak answer: adds an extra yield without knowing why.`,
          fix: `function* steps() {
  yield 'start';
  yield 'middle';
  yield 'end';
}`,
          follow: 'How can you read the return value of a generator?',
          exercises: [
            {
              task: 'Predict the output.',
              description: 'Checks return value ignored by spread.',
              code: `function* g() { yield 1; return 2; }
console.log([...g()]);`,
              answer: '[1]. Spread and for...of ignore the value from return (done: true).',
            },
            {
              task: 'Predict the output.',
              description: 'Checks reusing an exhausted iterator.',
              code: `const it = [1, 2].values();
console.log([...it], [...it]);`,
              answer: '[1, 2] []. Iterators are single-use; the second spread gets nothing.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks spread ignores return value.',
              code: `function* g() { yield 1; return 2; }
console.log([...g()]);`,
              answer: '[1], because spread skips the returned value.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks done flag with return.',
              code: `function* g() { return 5; }
console.log(g().next());`,
              answer: '{ value: 5, done: true }, return finishes the generator.',
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
              description: 'Checks Symbol.for registry.',
              code: `console.log(Symbol('a') === Symbol('a'), Symbol.for('a') === Symbol.for('a'));`,
              answer: 'false true. Symbol.for returns a shared registry symbol per key.',
            },
            {
              task: 'Predict the output.',
              description: 'Checks symbol keys are hidden from keys.',
              code: `const k = Symbol('k');
const o = { [k]: 1, a: 2 };
console.log(Object.keys(o), JSON.stringify(o));`,
              answer: `['a'] {"a":2}. Symbol keys are skipped by Object.keys and JSON.`,
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks unique Symbols.',
              code: 'console.log(Symbol(\'a\') === Symbol(\'a\'));',
              answer: 'false, because every Symbol() call is unique.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks global Symbol registry.',
              code: 'console.log(Symbol.for(\'a\') === Symbol.for(\'a\'));',
              answer: 'true, because Symbol.for reuses the registry symbol.',
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
              description: 'Checks first next argument ignored.',
              code: `function* g() { const x = yield 1; console.log(x); }
const it = g();
it.next('a'); it.next('b');`,
              answer: 'Logs b. The first next starts the generator; its argument is discarded.',
            },
            {
              task: 'Predict the output.',
              description: 'Checks throw into a generator.',
              code: `function* g() { try { yield 1; } catch (e) { yield 'caught'; } }
const it = g(); it.next();
console.log(it.throw(new Error()).value);`,
              answer: 'caught. throw resumes at the yield and raises the error there.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks value passed to next.',
              code: `function* g() { const x = yield; console.log(x); }
const it = g(); it.next(); it.next(7);`,
              answer: '7, because next(7) becomes the result of yield.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks first next argument ignored.',
              code: `function* g() { const x = yield; console.log(x); }
const it = g(); it.next(1); it.next();`,
              answer: 'undefined, because the first next value is ignored.',
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
              task: 'Fix the bug.',
              description: 'Checks iterator done flag.',
              code: `const it = { i: 0, next() { return { value: this.i++ }; },
  [Symbol.iterator]() { return this; } };`,
              answer: 'Without done: true, loops never end; return done when finished.',
              solution: `next() { return this.i < 3
  ? { value: this.i++, done: false } : { value: undefined, done: true }; }`,
            },
            {
              task: 'Rewrite the iterator as a generator.',
              description: 'Checks generators simplify iterators.',
              code: 'class Range { constructor(n) { this.n = n; } }',
              answer: 'Make Symbol.iterator a generator method; done is handled automatically.',
              solution: `class Range {
  constructor(n) { this.n = n; }
  *[Symbol.iterator]() { for (let i = 0; i < this.n; i++) yield i; }
}`,
            },
            {
              easy: true,
              task: 'Name the property.',
              description: 'Checks the iterator end signal.',
              code: 'return { value: undefined, ___: true };',
              answer: 'done, which must be true to stop iteration.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks iterator protocol result.',
              code: `const it = [1][Symbol.iterator]();
it.next();
console.log(it.next().done);`,
              answer: 'true, because the one item was already consumed.',
            },
          ],
        },
        {
          q: 'What does yield star (yield*) do? How do you use it to combine generators?',
          short: 'yield* hands control to another iterable and yields all of its values. Its result is the return value of the inner generator.',
          long: `yield* works with any iterable: arrays, strings, Sets, other generators.
It forwards next, throw and return calls to the inner generator.
The expression const r = yield* inner() gets inner's return value.
Useful for recursion, like walking a tree, and for building pipelines out of small generators.
yield inner() (without the star) yields the generator object itself, a common bug.
Strong answer: mentions recursion and the return value. Weak answer: thinks yield* is just a loop.`,
          exercises: [
            {
              task: 'Predict the output.',
              description: 'Checks yield star delegation.',
              code: `function* a() { yield 1; yield 2; }
function* b() { yield 0; yield* a(); yield 3; }
console.log([...b()]);`,
              answer: '[0, 1, 2, 3]. yield* yields every value from the inner iterable.',
            },
            {
              task: 'Predict the output.',
              description: 'Checks yield star on a string.',
              code: `function* g() { yield* 'hi'; }
console.log([...g()]);`,
              answer: `['h', 'i']. yield* works on any iterable, including strings.`,
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks yield* delegation.',
              code: `function* a() { yield 1; }
function* b() { yield* a(); yield 2; }
console.log([...b()]);`,
              answer: '[1, 2], yield* yields all values from a first.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks yield* over an array.',
              code: `function* g() { yield* [3, 4]; }
console.log([...g()]);`,
              answer: '[3, 4], because yield* works with any iterable.',
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
              task: 'Fix the bug.',
              description: 'Checks finally cleanup in async generators.',
              code: `async function* rows(db) {
  const c = await db.open();
  while (true) yield await c.read();
  c.close();
}`,
              answer: 'Code after the loop never runs on early break; use try/finally.',
              solution: `async function* rows(db) {
  const c = await db.open();
  try { while (true) yield await c.read(); }
  finally { await c.close(); }
}`,
            },
            {
              task: 'Predict the output.',
              description: 'Checks break triggers return and finally.',
              code: `function* g() { try { yield 1; yield 2; } finally { console.log('done'); } }
for (const x of g()) break;`,
              answer: `Logs done. break calls the iterator's return(), which runs finally.`,
            },
            {
              easy: true,
              task: 'True or false: break in for await calls return().',
              description: 'Checks async iterator cleanup.',
              code: 'for await (const row of rows()) break;',
              answer: 'True, breaking early calls the iterator\'s return method.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks finally runs on early exit.',
              code: `function* g() { try { yield 1; } finally { console.log('close'); } }
for (const x of g()) break;`,
              answer: 'close, because break triggers return, which runs finally.',
            },
          ],
        },
        {
          q: 'What are iterator helpers, like map, filter, take and drop on iterators? How are they different from array methods?',
          short: 'Iterator helpers (ES2025) add lazy methods to iterators, such as gen().filter(f).map(g).take(5). They process one value at a time and never build full arrays, so they work with large or infinite sequences.',
          long: `Methods include map, filter, take, drop, flatMap, reduce, toArray, forEach, some, every and find.
They are lazy: nothing runs until you pull values, for example with for...of or toArray.
take(5) stops after five values and closes the source, so an infinite generator is fine.
Array methods are eager and create a new array at every step.
Iterator.from wraps any iterable or iterator-like object.
Iterators can be used only once.
Async iterator helpers are a separate, later proposal.
Strong answer: explains laziness and single use. Weak answer: thinks they are the same as array methods.`,
          exercises: [
            {
              task: 'Predict the output.',
              description: 'Checks lazy iterator helpers with take.',
              code: `function* nat() { let i = 0; while (true) yield i++; }
console.log(nat().filter(n => n % 2).take(3).toArray());`,
              answer: '[1, 3, 5]. Iterator helpers are lazy, so infinite sources work with take.',
            },
            {
              task: 'Spot the difference.',
              description: 'Checks laziness versus array eagerness.',
              code: '[1, 2, 3].values().map(x => (console.log(x), x));',
              answer: 'Nothing logs: iterator map is lazy until consumed. Array map would run immediately and allocate a new array.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks iterator take helper.',
              code: `function* n() { let i = 0; while (true) yield i++; }
console.log([...n().take(3)]);`,
              answer: '[0, 1, 2], take stops after three values.',
            },
            {
              easy: true,
              task: 'True or false: iterator map is lazy.',
              description: 'Checks laziness of iterator helpers.',
              code: 'const it = [1, 2].values().map(x => x * 2);',
              answer: 'True, nothing is computed until you consume the iterator.',
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
              task: 'Rewrite with using for automatic cleanup.',
              description: 'Checks explicit resource management.',
              code: `const lock = acquire();
try { work(); } finally { lock[Symbol.dispose](); }`,
              answer: 'using calls Symbol.dispose at scope exit, even on throw.',
              solution: `{
  using lock = acquire();
  work();
}`,
            },
            {
              task: 'Make this object work with for await.',
              description: 'Checks Symbol.asyncIterator implementation.',
              code: 'const feed = { pages: [1, 2] };',
              answer: 'Define an async generator under Symbol.asyncIterator.',
              solution: `const feed = { pages: [1, 2],
  async *[Symbol.asyncIterator]() { for (const p of this.pages) yield fetchPage(p); } };`,
            },
            {
              easy: true,
              task: 'Name the loop.',
              description: 'Checks syntax for Symbol.asyncIterator.',
              code: 'for ___ (const chunk of stream) {}',
              answer: 'await, since for await...of uses Symbol.asyncIterator.',
            },
            {
              easy: true,
              task: 'Name the keyword.',
              description: 'Checks syntax using Symbol.dispose.',
              code: `___ res = getResource();
// res[Symbol.dispose]() runs at block end`,
              answer: 'using, which calls Symbol.dispose when the block ends.',
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
              task: 'Rewrite the saga effect as async code.',
              description: 'Checks migration path from sagas.',
              code: 'function* load() { const u = yield call(api.user); yield put(set(u)); }',
              answer: 'Use async/await or TanStack Query; migrate feature by feature behind tests.',
              solution: `async function load(dispatch) {
  const u = await api.user(); dispatch(set(u));
}`,
            },
            {
              task: 'Name one reason to keep sagas.',
              description: 'Checks balanced migration judgment.',
              code: '// complex cancel/race flows across actions',
              answer: 'Complex orchestration like takeLatest, race and cancellation is tested and working; rewriting has risk with little user value.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks generator pausing at yield.',
              code: `function* saga() { yield 'a'; yield 'b'; }
const it = saga(); it.next();
console.log(it.next().value);`,
              answer: 'b, because each next resumes to the following yield.',
            },
            {
              easy: true,
              task: 'Name the keyword.',
              description: 'Checks async alternative to generators.',
              code: 'async function load() { const d = ___ fetch(u); }',
              answer: 'await, which pauses an async function like yield pauses generators.',
            },
          ],
        },
        {
          q: 'Code review: a library stores a session token under a Symbol key and calls it private. Is it private? What do you suggest?',
          code: `const TOKEN = Symbol('token');
export class Session {
  constructor(token) { this[TOKEN] = token; }
  request(url) { return fetch(url, { headers: { Authorization: this[TOKEN] } }); }
}`,
          short: 'Symbol keys are hidden from for...in, Object.keys and JSON, but not private. Object.getOwnPropertySymbols and Reflect.ownKeys reveal them. Use a #private field or a module WeakMap for real privacy.',
          long: `Symbols avoid name clashes, which is their real job.
Any code with the object can list its symbols and read the value.
Private fields (#token) are truly private: no reflection can read them from outside the class.
A module-level WeakMap keyed by instance is another option and works with any object.
Note: a token in memory is never safe from code running in the same page (XSS). Keeping secrets out of JS, like HttpOnly cookies, is the stronger fix.
Team rule: Symbol for clash-free extension points, #private for secrets and invariants.
Strong answer: shows how to read the symbol and mentions XSS limits. Weak answer: says Symbols are private.`,
          fix: `export class Session {
  #token;
  constructor(token) { this.#token = token; }
  request(url) { return fetch(url, { headers: { Authorization: this.#token } }); }
}`,
          follow: 'Even with a private field, how could an attacker on the page still get the token?',
          exercises: [
            {
              task: 'Show how to read a symbol-keyed value.',
              description: 'Checks symbols are not private.',
              code: `const s = Symbol('token');
const session = { [s]: 'abc' };`,
              answer: 'Object.getOwnPropertySymbols exposes it, so it is not private.',
              solution: `const [k] = Object.getOwnPropertySymbols(session);
console.log(session[k]); // 'abc'`,
            },
            {
              task: 'Rewrite with true privacy.',
              description: 'Checks private class fields.',
              code: 'class Session { constructor(t) { this[TOKEN] = t; } }',
              answer: 'Use a #private field; it is inaccessible outside the class body.',
              solution: 'class Session { #token; constructor(t) { this.#token = t; } }',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks Symbol keys are discoverable.',
              code: `const k = Symbol('t');
const o = { [k]: 1 };
console.log(Object.getOwnPropertySymbols(o).length);`,
              answer: '1, because symbol keys are still visible via reflection.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks true private fields.',
              code: `class A { #t = 1; }
console.log(Object.keys(new A()).length);`,
              answer: '0, because #private fields are not exposed as properties.',
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
              task: 'Write a loop that reads a file in chunks.',
              description: 'Checks streaming instead of full load.',
              code: 'async function count(file) { /* bytes */ }',
              answer: 'Iterate file.stream() with for await to avoid loading it whole.',
              solution: `async function count(file) {
  let n = 0;
  for await (const c of file.stream()) n += c.length;
  return n;
}`,
            },
            {
              task: 'Name two guidelines for large file processing.',
              description: 'Checks memory and responsiveness rules.',
              code: '// 2 GB CSV upload preview',
              answer: 'Stream chunks instead of reading whole files, and do heavy parsing in a Web Worker with cancellation via AbortSignal.',
            },
            {
              easy: true,
              task: 'Name the method.',
              description: 'Checks reading a file as a stream.',
              code: 'const stream = file.___();',
              answer: 'stream, which returns a ReadableStream of the Blob or File.',
            },
            {
              easy: true,
              task: 'True or false: generators process items one at a time.',
              description: 'Checks lazy chunk processing.',
              code: 'function* chunks(a) { for (const x of a) yield x; }',
              answer: 'True, each value is produced only when requested.',
            },
          ],
        },
      ],
    },
    'Event Loop': {
      junior: [
        {
          q: 'JavaScript runs on one thread. So how can the browser download files and count timers at the same time?',
          short: 'Your JavaScript runs on one main thread, but the browser has other threads for network, timers and more. When they finish, they put a callback in a queue, and the event loop runs it when the stack is empty.',
          long: `The JS engine has one call stack, so only one piece of your code runs at a time.
Web APIs like fetch, setTimeout and DOM events are handled by the browser outside the engine.
When the work is done, the callback goes into a task queue or, for promises, the microtask queue.
The event loop moves callbacks to the stack only when it is empty.
So long-running JS blocks everything, even finished downloads, until it ends.
Web Workers give you real extra threads for your own code.
Strong answer: separates the engine from browser APIs. Weak answer: says JavaScript is multi-threaded.`,
          exercises: [
            {
              task: 'Predict the output.',
              description: 'Checks timer delay is minimum.',
              code: `setTimeout(() => console.log('t'), 0);
const end = Date.now() + 100; while (Date.now() < end);
console.log('loop');`,
              answer: 'loop, then t. Timers wait for the call stack to clear; the delay is a minimum.',
            },
            {
              task: 'Name what runs fetch while JS is busy.',
              description: 'Checks browser threads beyond JS.',
              code: `fetch('/big.zip'); heavySyncWork();`,
              answer: 'The browser network thread downloads in parallel; only the callback waits for the JS thread to be free.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks setTimeout runs later.',
              code: `setTimeout(() => console.log('a'), 0);
console.log('b');`,
              answer: 'b then a, because the timer callback waits for the stack.',
            },
            {
              easy: true,
              task: 'True or false: JS itself counts timers.',
              description: 'Checks Web APIs run outside JS.',
              code: 'setTimeout(cb, 1000); // who counts the 1000ms?',
              answer: 'False, the browser tracks timers and network outside the JS thread.',
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
              task: 'Fix the bug.',
              description: 'Checks yielding to rendering.',
              code: `el.textContent = 'Loading...';
heavyWork();`,
              answer: 'The browser cannot paint during sync work; yield a frame first.',
              solution: `el.textContent = 'Loading...';
requestAnimationFrame(() => setTimeout(heavyWork));`,
            },
            {
              task: 'Predict whether the text paints.',
              description: 'Checks microtasks block rendering.',
              code: `el.textContent = 'Loading';
await Promise.resolve();
heavyWork();`,
              answer: 'No. Microtasks run before rendering, so awaiting a resolved promise does not let the browser paint.',
            },
            {
              easy: true,
              task: 'True or false: the DOM repaints during synchronous code.',
              description: 'Checks rendering waits for the stack.',
              code: `el.textContent = 'Loading';
while (Date.now() < t) {} // busy wait`,
              answer: 'False, the browser paints only after the current task finishes.',
            },
            {
              easy: true,
              task: 'Predict what the user sees.',
              description: 'Checks blocked paint.',
              code: `el.textContent = 'Loading';
heavyWork(); // 3s sync
el.textContent = 'Done';`,
              answer: 'Only Done, because no paint happens while the code blocks.',
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
              task: 'Predict the output.',
              description: 'Checks microtask before macrotask.',
              code: `setTimeout(() => console.log(1));
queueMicrotask(() => console.log(2));
console.log(3);`,
              answer: '3 2 1. Sync code first, then microtasks, then timer tasks.',
            },
            {
              task: 'Spot the problem.',
              description: 'Checks recursive microtasks starve rendering.',
              code: `function loop() { queueMicrotask(loop); }
loop();`,
              answer: 'The microtask queue never empties, so the page freezes; timers and rendering never run.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks microtask before macrotask.',
              code: `setTimeout(() => console.log('t'));
Promise.resolve().then(() => console.log('p'));`,
              answer: 'p then t, microtasks run before the next timer task.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks queueMicrotask ordering.',
              code: `queueMicrotask(() => console.log('m'));
console.log('s');`,
              answer: 's then m, microtasks run after the current script.',
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
              task: 'Predict the output.',
              description: 'Checks code after await is a microtask.',
              code: `async function f() { console.log(1); await null; console.log(2); }
f(); console.log(3);`,
              answer: '1 3 2. Code before await runs synchronously; the rest resumes as a microtask.',
            },
            {
              task: 'Predict the output.',
              description: 'Checks then chain ordering.',
              code: `Promise.resolve().then(() => console.log('a')).then(() => console.log('b'));
Promise.resolve().then(() => console.log('c'));`,
              answer: 'a c b. Each then schedules the next only after the previous resolves.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks sync start of async function.',
              code: `async function f() { console.log(1); }
f(); console.log(2);`,
              answer: '1 then 2, an async function runs synchronously until await.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks code after await.',
              code: `async function f() { await null; console.log(1); }
f(); console.log(2);`,
              answer: '2 then 1, code after await runs as a microtask.',
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
              task: 'Write chunked processing that yields between batches.',
              description: 'Checks scheduler.yield usage.',
              code: 'async function run(items) { /* process each */ }',
              answer: 'Process in batches and yield so input and paint can happen.',
              solution: `async function run(items) {
  for (let i = 0; i < items.length; i++) {
    process(items[i]);
    if (i % 500 === 0) await scheduler.yield();
  }
}`,
            },
            {
              task: 'Name a fallback where scheduler.yield is missing.',
              description: 'Checks yielding alternatives.',
              code: 'await scheduler.yield();',
              answer: 'await new Promise(r => setTimeout(r)) yields a macrotask; a microtask like Promise.resolve does not yield.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks yielding with setTimeout.',
              code: `setTimeout(() => console.log('chunk2'));
console.log('chunk1');`,
              answer: 'chunk1 then chunk2, setTimeout lets the browser breathe between.',
            },
            {
              easy: true,
              task: 'Name the API.',
              description: 'Checks idle-time scheduling.',
              code: '___(deadline => processSome(deadline));',
              answer: 'requestIdleCallback, which runs work when the browser is idle.',
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
              task: 'Fix the bug.',
              description: 'Checks rAF over setInterval for animation.',
              code: `setInterval(() => { box.style.left = x++ + 'px'; }, 16);`,
              answer: 'Intervals drift from refresh; use requestAnimationFrame and transform.',
              solution: `function step() {
  box.style.transform = \`translateX(\${x++}px)\`;
  requestAnimationFrame(step);
}
requestAnimationFrame(step);`,
            },
            {
              task: 'Spot the problem.',
              description: 'Checks frame-rate dependent movement.',
              code: 'function step() { x += 2; requestAnimationFrame(step); }',
              answer: 'Speed depends on refresh rate (60 vs 120 Hz). Use the rAF timestamp delta to scale movement.',
            },
            {
              easy: true,
              task: 'Name the API.',
              description: 'Checks frame-synced animation.',
              code: 'function step() { move(); ___(step); }',
              answer: 'requestAnimationFrame, which syncs updates with the screen refresh.',
            },
            {
              easy: true,
              task: 'True or false: setInterval(fn, 16) matches screen frames exactly.',
              description: 'Checks timer drift.',
              code: 'setInterval(move, 16);',
              answer: 'False, timers drift and are not synced to repaints.',
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
              task: 'Predict the output in Node.js.',
              description: 'Checks nextTick before promises.',
              code: `Promise.resolve().then(() => console.log('p'));
process.nextTick(() => console.log('t'));`,
              answer: 't p. In CommonJS, the nextTick queue drains before the promise microtask queue.',
            },
            {
              task: 'Predict the output in Node.js.',
              description: 'Checks setImmediate inside I/O callback.',
              code: `fs.readFile(f, () => {
  setTimeout(() => console.log('timeout'));
  setImmediate(() => console.log('immediate'));
});`,
              answer: 'immediate, then timeout. After the poll phase, the check phase runs before the next timers phase.',
            },
            {
              easy: true,
              task: 'Predict the output in Node.js.',
              description: 'Checks nextTick before promises.',
              code: `Promise.resolve().then(() => console.log('p'));
process.nextTick(() => console.log('n'));`,
              answer: 'n then p, nextTick queue runs before promise microtasks.',
            },
            {
              easy: true,
              task: 'Predict the output in Node.js.',
              description: 'Checks setImmediate after sync code.',
              code: `setImmediate(() => console.log('i'));
console.log('s');`,
              answer: 's then i, setImmediate runs in the check phase later.',
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
              task: 'Rewrite to transfer the buffer instead of copying.',
              description: 'Checks transferable objects.',
              code: 'worker.postMessage({ buf });',
              answer: 'Pass a transfer list so the ArrayBuffer moves without cloning.',
              solution: 'worker.postMessage({ buf }, [buf]);',
            },
            {
              task: 'Predict what happens.',
              description: 'Checks structured clone limits.',
              code: 'worker.postMessage({ fn: () => 1 });',
              answer: 'DataCloneError. Functions and DOM nodes cannot be structured-cloned.',
            },
            {
              easy: true,
              task: 'Name the method.',
              description: 'Checks sending data to a worker.',
              code: `const w = new Worker('w.js');
w.___({ n: 5 });`,
              answer: 'postMessage, which sends a copy of the data to the worker.',
            },
            {
              easy: true,
              task: 'True or false: workers can access the DOM.',
              description: 'Checks worker limitations.',
              code: `// worker.js
document.body.textContent = 'x';`,
              answer: 'False, workers have no DOM; they talk via messages.',
            },
          ],
        },
        {
          q: 'Find and fix the bug. The countdown is wrong after the tab was in the background.',
          code: `let left = 60;
const id = setInterval(() => {
  left--;
  label.textContent = left + 's';
  if (left === 0) clearInterval(id);
}, 1000);`,
          short: 'Timers are not exact. Browsers throttle them in background tabs and delay them when the main thread is busy, so counting ticks drifts. Compute the time left from a fixed deadline on each tick.',
          long: `setInterval only promises "not earlier than"; a busy main thread delays callbacks.
Background tabs throttle timers to once per second or less, and Chrome can throttle hidden tabs much more.
Each tick here assumes exactly one second passed, so errors add up.
Fix: store a deadline with Date.now() or performance.now() and compute the remaining time each tick.
Also update when the tab becomes visible again (visibilitychange).
For animation use requestAnimationFrame, which pauses in hidden tabs.
Strong answer: explains throttling and uses a deadline. Weak answer: lowers the interval to 100 ms.`,
          fix: `const deadline = Date.now() + 60_000;
function tick() {
  const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
  label.textContent = left + 's';
  if (left === 0) clearInterval(id);
}
const id = setInterval(tick, 250);
document.addEventListener('visibilitychange', tick);
tick();`,
          follow: 'Why might performance.now() be better than Date.now() here?',
          exercises: [
            {
              task: 'Fix the bug.',
              description: 'Checks time-based countdown instead of ticks.',
              code: `let left = 60;
setInterval(() => render(--left), 1000);`,
              answer: 'Background tabs throttle timers; compute from a deadline.',
              solution: `const end = Date.now() + 60_000;
setInterval(() => render(Math.ceil((end - Date.now()) / 1000)), 1000);`,
            },
            {
              task: 'Name the event to resync on tab return.',
              description: 'Checks Page Visibility API.',
              code: '// tab becomes visible again',
              answer: `visibilitychange; check document.visibilityState === 'visible' and recompute the UI.`,
            },
            {
              easy: true,
              task: 'True or false: background tabs throttle timers.',
              description: 'Checks timer throttling.',
              code: 'setInterval(tick, 1000); // tab hidden',
              answer: 'True, browsers slow timers in hidden tabs to save power.',
            },
            {
              easy: true,
              task: 'Name the method.',
              description: 'Checks reliable elapsed time.',
              code: `const start = ___();
// later: left = total - (now - start)`,
              answer: 'Date.now (or performance.now), which measures real elapsed time.',
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
              task: 'Name two enforceable main-thread rules.',
              description: 'Checks performance budgets for teams.',
              code: '// 12 teams, one SPA',
              answer: 'Set long-task and INP budgets per route checked in CI, and require heavy work to go to workers or yield.',
            },
            {
              task: 'Write code that reports long tasks.',
              description: 'Checks PerformanceObserver for long tasks.',
              code: '// log tasks > 50ms',
              answer: 'Observe longtask entries and send them to monitoring.',
              solution: `new PerformanceObserver(l => l.getEntries()
  .forEach(e => report(e.duration))
).observe({ type: 'longtask', buffered: true });`,
            },
            {
              easy: true,
              task: 'Name the metric.',
              description: 'Checks responsiveness Web Vital.',
              answer: 'INP (Interaction to Next Paint) measures input responsiveness.',
            },
            {
              easy: true,
              task: 'True or false: a long task is over 50ms.',
              description: 'Checks long task definition.',
              code: '// task took 120ms',
              answer: 'True, tasks over 50ms block the main thread noticeably.',
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
              task: 'Predict the output.',
              description: 'Checks setTimeout does not reduce work.',
              code: `const wrap = f => setTimeout(f, 0);
[1, 2, 3].forEach(() => wrap(heavy100ms));`,
              answer: 'Three 100ms long tasks still block; deferring only moves work, it does not split it.',
            },
            {
              task: 'Spot the problem.',
              description: 'Checks ordering bugs from deferred callbacks.',
              code: `wrap(() => setUser(u));
console.log(getUser());`,
              answer: 'getUser runs before the deferred set, so it reads stale data. Hidden async breaks ordering assumptions.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks setTimeout 0 is not instant.',
              code: `setTimeout(() => console.log('a'), 0);
Promise.resolve().then(() => console.log('b'));`,
              answer: 'b then a, setTimeout 0 still waits for microtasks and a task.',
            },
            {
              easy: true,
              task: 'True or false: setTimeout 0 makes heavy work non-blocking.',
              description: 'Checks deferral vs splitting.',
              code: 'setTimeout(() => heavyLoop(), 0);',
              answer: 'False, it only delays the work; it still blocks when it runs.',
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
              task: 'Decide: worker or main thread?',
              description: 'Checks worker cost-benefit judgment.',
              code: '// parse 20 MB JSON vs format 10 dates',
              answer: 'Worker for large JSON parsing (long task); main thread for tiny formatting, since messaging overhead outweighs gains.',
            },
            {
              task: `Name a reason a worker can't help.`,
              description: 'Checks worker DOM limitations.',
              code: '// work: measure and update DOM layout',
              answer: 'Workers have no DOM access; layout and DOM updates must stay on the main thread.',
            },
            {
              easy: true,
              task: 'True or false: workers suit CPU-heavy work.',
              description: 'Checks when to use workers.',
              code: 'const w = new Worker(\'hash.js\');',
              answer: 'True, heavy computation in a worker keeps the UI responsive.',
            },
            {
              easy: true,
              task: 'Name the transfer cost.',
              description: 'Checks data copying to workers.',
              code: 'worker.postMessage(bigArray);',
              answer: 'Structured cloning, which copies data and costs time for large payloads.',
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
              task: 'Fix the image markup.',
              description: 'Checks lazy loading above the fold.',
              code: '<img src="hero.jpg" loading="lazy">',
              answer: 'Do not lazy-load the LCP hero; load eagerly with high priority.',
              solution: '<img src="hero.jpg" fetchpriority="high" width="1200" height="600">',
            },
            {
              task: 'Spot the problem.',
              description: 'Checks layout shift from missing dimensions.',
              code: '<img src="a.jpg" loading="lazy">',
              answer: 'Missing width and height cause layout shift (CLS) when it loads; set dimensions or aspect-ratio.',
            },
            {
              easy: true,
              task: 'Name the attribute value.',
              description: 'Checks native image lazy loading.',
              code: '<img src="a.jpg" loading="___">',
              answer: 'lazy, which delays loading until the image nears the viewport.',
            },
            {
              easy: true,
              task: 'True or false: lazy images load before scrolling near them.',
              description: 'Checks lazy loading behavior.',
              code: '<img src="far.jpg" loading="lazy">',
              answer: 'False, they load only when close to the viewport.',
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
              task: 'Fix the bug.',
              description: 'Checks removing event listeners on close.',
              code: `function open() {
  window.addEventListener('keydown', onKey);
}
function close() { modal.remove(); }`,
              answer: 'The listener accumulates each open; remove it on close.',
              solution: `function close() {
  window.removeEventListener('keydown', onKey);
  modal.remove();
}`,
            },
            {
              task: 'Rewrite cleanup using AbortController.',
              description: 'Checks signal-based listener removal.',
              code: `el.addEventListener('click', a);
window.addEventListener('resize', b);`,
              answer: 'Pass one signal; abort removes all listeners at once.',
              solution: `const ac = new AbortController();
el.addEventListener('click', a, { signal: ac.signal });
window.addEventListener('resize', b, { signal: ac.signal });
// close: ac.abort();`,
            },
            {
              easy: true,
              task: 'Name the method.',
              description: 'Checks removing an event listener.',
              code: 'window.___(\'resize\', onResize);',
              answer: 'removeEventListener, which detaches the handler and avoids leaks.',
            },
            {
              easy: true,
              task: 'True or false: removing a modal element removes window listeners.',
              description: 'Checks listener leaks.',
              answer: 'False, listeners on window stay until you remove them.',
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
              task: 'Name the metric this hurts.',
              description: 'Checks INP from slow handlers.',
              code: 'btn.onclick = () => { heavy300ms(); show(); };',
              answer: 'INP (Interaction to Next Paint); the click waits 300ms before the next frame paints.',
            },
            {
              task: 'Name the metric this hurts.',
              description: 'Checks CLS from injected content.',
              code: 'setTimeout(() => header.prepend(banner), 2000);',
              answer: 'CLS: inserting content above existing content shifts layout. Reserve space ahead of time.',
            },
            {
              easy: true,
              task: 'Name the metric.',
              description: 'Checks loading Web Vital.',
              code: 'new PerformanceObserver(l => {}).observe({ type: \'largest-contentful-paint\' });',
              answer: 'LCP (Largest Contentful Paint) measures main content load time.',
            },
            {
              easy: true,
              task: 'Name the metric.',
              description: 'Checks layout stability Web Vital.',
              answer: 'CLS (Cumulative Layout Shift) measures unexpected layout movement.',
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
              task: 'Rewrite to load the chart library on demand.',
              description: 'Checks dynamic import.',
              code: `import { Chart } from 'big-chart';
btn.onclick = () => new Chart(el);`,
              answer: 'Use dynamic import so the library is a separate chunk.',
              solution: `btn.onclick = async () => {
  const { Chart } = await import('big-chart');
  new Chart(el);
};`,
            },
            {
              task: 'Split a React route with lazy.',
              description: 'Checks React.lazy and Suspense.',
              code: `import Settings from './Settings';`,
              answer: 'Wrap a dynamic import with lazy and render inside Suspense.',
              solution: `const Settings = lazy(() => import('./Settings'));
<Suspense fallback={<Spinner />}><Settings /></Suspense>`,
            },
            {
              easy: true,
              task: 'Predict the return type.',
              description: 'Checks dynamic import returns promise.',
              code: `const p = import('./chart.js');
console.log(p instanceof Promise);`,
              answer: 'true, dynamic import returns a Promise of the module.',
            },
            {
              easy: true,
              task: 'True or false: dynamic import creates a separate chunk.',
              description: 'Checks bundler code splitting.',
              answer: 'True, bundlers split dynamically imported modules into their own chunk.',
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
              task: 'Fix the bug.',
              description: 'Checks passive scroll listeners.',
              code: `window.addEventListener('touchmove', track);`,
              answer: 'Mark it passive so the browser can scroll without waiting.',
              solution: `window.addEventListener('touchmove', track, { passive: true });`,
            },
            {
              task: 'Spot the problem.',
              description: 'Checks layout thrashing in scroll handlers.',
              code: `onscroll = () => items.forEach(i => {
  i.style.top = i.offsetTop + 1 + 'px';
});`,
              answer: 'Interleaved reads and writes force layout per item. Batch reads then writes, or use IntersectionObserver or CSS.',
            },
            {
              easy: true,
              task: 'Name the option.',
              description: 'Checks passive scroll listeners.',
              code: 'el.addEventListener(\'scroll\', fn, { ___: true });',
              answer: 'passive, which promises no preventDefault so scrolling stays smooth.',
            },
            {
              easy: true,
              task: 'True or false: reading offsetHeight can force layout.',
              description: 'Checks forced reflow.',
              answer: 'True, reading layout after DOM writes forces a sync reflow.',
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
              task: 'Pick the right hint for each case.',
              description: 'Checks preload versus prefetch.',
              code: `// A: font used on this page
// B: JS for the next page`,
              answer: 'A: rel=preload as=font crossorigin (current page, high priority). B: rel=prefetch (future navigation, idle priority).',
            },
            {
              task: 'Write a hint for a third-party API origin.',
              description: 'Checks preconnect usage.',
              code: '// app calls https://api.example.com soon',
              answer: 'Preconnect warms DNS, TCP and TLS early.',
              solution: '<link rel="preconnect" href="https://api.example.com" crossorigin>',
            },
            {
              easy: true,
              task: 'Name the rel value.',
              description: 'Checks early connection hint.',
              code: '<link rel="___" href="https://api.x.com">',
              answer: 'preconnect, which opens the connection early before requests.',
            },
            {
              easy: true,
              task: 'Name the rel value.',
              description: 'Checks next-page resource hint.',
              code: '<link rel="___" href="/next.js">',
              answer: 'prefetch, which loads a likely-future resource at low priority.',
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
              task: 'Name the fix for rendering 10,000 rows.',
              description: 'Checks list virtualization.',
              code: 'rows.map(r => <Row key={r.id} {...r} />)',
              answer: 'Virtualize: render only visible rows (e.g. TanStack Virtual) or paginate.',
            },
            {
              task: 'Apply a CSS-only improvement.',
              description: 'Checks content-visibility for offscreen rows.',
              code: '.row { }',
              answer: 'content-visibility: auto skips rendering offscreen rows; add contain-intrinsic-size to keep scroll height.',
              solution: '.row { content-visibility: auto; contain-intrinsic-size: auto 40px; }',
            },
            {
              easy: true,
              task: 'True or false: rendering 10,000 DOM rows is cheap.',
              description: 'Checks DOM size cost.',
              answer: 'False, many DOM nodes slow layout and painting.',
            },
            {
              easy: true,
              task: 'Name the technique.',
              description: 'Checks rendering only visible rows.',
              answer: 'Virtualization (windowing) renders only the rows on screen.',
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
              task: 'Fix the import to enable tree shaking.',
              description: 'Checks whole-library imports.',
              code: `import _ from 'lodash';
_.debounce(fn, 200);`,
              answer: 'Import only what you need from an ESM build.',
              solution: `import debounce from 'lodash-es/debounce';
debounce(fn, 200);`,
            },
            {
              task: 'Name a tool to find large modules.',
              description: 'Checks bundle analysis tooling.',
              code: '// vite build output is 2 MB',
              answer: 'rollup-plugin-visualizer or source-map-explorer show a treemap of which modules take the space.',
            },
            {
              easy: true,
              task: 'Name the technique.',
              description: 'Checks removing unused exports.',
              code: 'import { debounce } from \'lodash-es\';',
              answer: 'Tree shaking, which drops unused exports from the bundle.',
            },
            {
              easy: true,
              task: 'True or false: import _ from \'lodash\' includes all lodash.',
              description: 'Checks whole-library imports.',
              answer: 'True, CommonJS lodash cannot be tree-shaken, so it all ships.',
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
              task: 'Spot the problem.',
              description: 'Checks inconsistent property order.',
              code: `const a = { x: 1, y: 2 };
const b = { y: 2, x: 1 };
points.forEach(p => p.x + p.y);`,
              answer: 'Different property order creates different shapes, making the access site polymorphic and slower. Create objects consistently.',
            },
            {
              task: 'Spot the problem.',
              description: 'Checks delete changing object shape.',
              code: 'function clear(user) { delete user.token; }',
              answer: 'delete can drop the object into slow dictionary mode. Set user.token = undefined instead.',
            },
            {
              easy: true,
              task: 'True or false: same property order gives same shape.',
              description: 'Checks hidden class sharing.',
              code: `const a = { x: 1, y: 2 };
const b = { x: 3, y: 4 };`,
              answer: 'True, objects created with same keys in same order share a shape.',
            },
            {
              easy: true,
              task: 'True or false: delete keeps the object shape fast.',
              description: 'Checks delete shape cost.',
              code: `const o = { a: 1, b: 2 };
delete o.a;`,
              answer: 'False, delete can move the object to slow dictionary mode.',
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
              task: 'Name the first step of your plan.',
              description: 'Checks measuring on real devices.',
              code: '// complaint: slow on cheap Android',
              answer: 'Measure first: field RUM data by device class plus profiling on a real low-end phone with CPU throttling.',
            },
            {
              task: 'Name two high-impact fixes for low-end phones.',
              description: 'Checks JS cost reduction priorities.',
              code: '// 1.5 MB JS, long tasks on load',
              answer: 'Cut and split JS with route-level code splitting, and break up long tasks or defer third-party scripts.',
            },
            {
              easy: true,
              task: 'Name the DevTools feature.',
              description: 'Checks CPU throttling for testing.',
              answer: 'CPU throttling in the Performance panel simulates slow phones.',
            },
            {
              easy: true,
              task: 'True or false: less JavaScript helps cheap phones.',
              description: 'Checks JS parse cost.',
              answer: 'True, slow CPUs spend long time parsing and running JS.',
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
              task: 'Spot the problem.',
              description: 'Checks useless memoization.',
              code: 'const total = useMemo(() => a + b, [a, b]);',
              answer: 'Memoizing trivial math costs more than recomputing. Memoize only measured expensive work or referential needs.',
            },
            {
              task: 'Name what removes most manual memoization in React 19.',
              description: 'Checks React Compiler awareness.',
              code: '// useMemo/useCallback everywhere',
              answer: 'React Compiler auto-memoizes components and values, so manual useMemo/useCallback is rarely needed.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks new function each render.',
              code: `const a = () => {};
const b = () => {};
console.log(a === b);`,
              answer: 'false, each arrow function is a new reference.',
            },
            {
              easy: true,
              task: 'True or false: useMemo is free.',
              description: 'Checks memoization cost.',
              answer: 'False, it costs memory and comparison work on every render.',
            },
          ],
        },
        {
          q: 'How do you prove that a performance fix helped real users and the business, not just a lab score?',
          short: 'Measure real users (RUM) before and after, ideally with an A/B test or staged rollout. Look at percentiles like p75 by device and country, and link them to business metrics like conversion.',
          long: `Lab tools (Lighthouse) are good for finding problems, but they are not real users.
Collect field data with the web-vitals library or your monitoring tool: LCP, INP, CLS at p75, split by device class, network and page type.
Roll out behind a feature flag or A/B test, so you compare groups at the same time and avoid seasonal noise.
Define success first: for example, INP p75 under 200 ms on low-end Android, plus checkout conversion.
Watch for side effects, like errors or lost analytics.
Report results in plain terms: "checkout loads 1.2 seconds faster for 40 percent of users, conversion up 2 percent".
Strong answer: uses field data, percentiles and controlled rollout. Weak answer: shows a better Lighthouse score.`,
          exercises: [
            {
              task: 'Write code to collect INP from real users.',
              description: 'Checks RUM with web-vitals library.',
              code: `import { onINP } from 'web-vitals';`,
              answer: 'Send field metrics to analytics, then compare before and after.',
              solution: `onINP(m => navigator.sendBeacon('/rum', JSON.stringify(m)));`,
            },
            {
              task: 'Name a way to tie speed to business impact.',
              description: 'Checks A/B experiment validation.',
              code: '// fix shipped, LCP improved',
              answer: 'Run an A/B test or holdout and compare conversion or retention, using p75 field metrics, not lab scores.',
            },
            {
              easy: true,
              task: 'Name the data type.',
              description: 'Checks real-user monitoring.',
              answer: 'RUM (real user monitoring) collects metrics from actual users.',
            },
            {
              easy: true,
              task: 'Name the API.',
              description: 'Checks measuring custom timings.',
              code: 'performance.___(\'start\');',
              answer: 'mark, which records a timestamp for later measurement.',
            },
          ],
        },
      ],
    },
    'Advanced Strategies and Integration': {
      junior: [
        {
          q: 'What is the difference between localStorage, sessionStorage and cookies? When do you use each?',
          short: 'localStorage keeps data until it is cleared. sessionStorage keeps it only for one tab session. Cookies are small, are sent to the server with requests, and can be HttpOnly so JS cannot read them.',
          long: `localStorage: about 5 MB per origin, strings only, shared by all tabs of the site, stays after the browser closes.
sessionStorage: same API, but only for one tab, and cleared when the tab closes.
Cookies: about 4 KB, sent with every matching request, have expiry, Secure, SameSite and HttpOnly options.
Web storage is synchronous, so large reads can block the main thread; IndexedDB is better for big data.
Never store auth tokens in localStorage if you can avoid it; any XSS can read it. HttpOnly cookies are safer.
Strong answer: mentions sending to the server, tab scope, and security. Weak answer: "they are all the same storage".`,
          exercises: [
            {
              task: 'Pick storage for each case.',
              description: 'Checks storage choice by lifetime.',
              code: '// A: auth session  B: wizard draft per tab  C: theme',
              answer: 'A: HttpOnly Secure cookie. B: sessionStorage (per tab). C: localStorage (persists, client only).',
            },
            {
              task: 'Spot the problem.',
              description: 'Checks XSS risk of tokens in localStorage.',
              code: `localStorage.setItem('token', jwt);`,
              answer: 'Any XSS script can read localStorage. Prefer HttpOnly cookies for auth tokens.',
            },
            {
              easy: true,
              task: 'True or false: sessionStorage survives closing the tab.',
              description: 'Checks sessionStorage lifetime.',
              answer: 'False, sessionStorage is cleared when the tab closes.',
            },
            {
              easy: true,
              task: 'True or false: cookies go with every request.',
              description: 'Checks cookie transmission.',
              answer: 'True, matching cookies are sent to the server automatically.',
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
              task: 'Predict the output.',
              description: 'Checks localStorage stores strings.',
              code: `localStorage.setItem('n', 5);
console.log(typeof localStorage.getItem('n'));`,
              answer: 'string. Values are coerced to strings; parse numbers back.',
            },
            {
              task: 'Write a safe read helper.',
              description: 'Checks JSON.parse with fallback.',
              code: 'function load(key, fallback) { /* ... */ }',
              answer: 'Wrap parse in try/catch; missing or corrupt data returns the fallback.',
              solution: `function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}`,
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks storage stringifies values.',
              code: `localStorage.setItem('n', 5);
console.log(typeof localStorage.getItem('n'));`,
              answer: 'string, because localStorage stores only strings.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks object to string conversion.',
              code: 'console.log(String({ a: 1 }));',
              answer: '[object Object], the default toString for plain objects.',
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
              task: 'Predict why this triggers a preflight.',
              description: 'Checks non-simple request headers.',
              code: `fetch('https://api.x.com', { method: 'POST',
  headers: { 'Content-Type': 'application/json' } });`,
              answer: 'JSON content type is not a simple header, so the browser sends OPTIONS first.',
            },
            {
              task: 'Fix the cookie-based cross-origin request.',
              description: 'Checks credentials with CORS.',
              code: `fetch('https://api.x.com/me');`,
              answer: 'Send credentials; the server must return a specific Allow-Origin (not *) and Allow-Credentials: true.',
              solution: `fetch('https://api.x.com/me', { credentials: 'include' });`,
            },
            {
              easy: true,
              task: 'Name the header.',
              description: 'Checks CORS allowed origin.',
              answer: 'Access-Control-Allow-Origin tells the browser which origins may read.',
            },
            {
              easy: true,
              task: 'True or false: different ports mean different origins.',
              description: 'Checks origin definition.',
              code: 'http://localhost:3000 vs http://localhost:4000',
              answer: 'True, origin is scheme, host, and port together.',
            },
          ],
        },
      ],
      middle: [
        {
          q: 'Find and fix the bug. After a new deploy, clicking "Edit" does nothing for some users.',
          code: `editButton.addEventListener('click', async () => {
  const { openEditor } = await import('./editor.js');
  openEditor();
});`,
          short: 'Users with the old page still ask for old chunk files, which the deploy removed. The dynamic import rejects and nothing handles it. Catch the error, tell the user, and reload or retry.',
          long: `Bundlers give chunks hashed names; a new deploy creates new names.
A tab opened before the deploy still points to old names, and if old files are deleted, import() fails with a chunk load error.
The rejection in an event handler is unhandled, so the user just sees nothing.
Fixes: catch the error and show a message with a reload button; or reload once automatically; keep old chunks on the CDN for some time after a deploy.
Vite fires a vite:preloadError event you can listen to.
Strong answer: names the deploy cause and both client and deploy fixes. Weak answer: adds a console.log.`,
          fix: `editButton.addEventListener('click', async () => {
  try {
    const { openEditor } = await import('./editor.js');
    openEditor();
  } catch (err) {
    showToast('A new version is available. Please reload the page.');
    reportError(err);
  }
});`,
          follow: 'How would you avoid this on the server side during deploys?',
          exercises: [
            {
              task: 'Handle chunk load failure after deploy.',
              description: 'Checks stale chunk recovery.',
              code: `const Edit = lazy(() => import('./Edit'));`,
              answer: 'Old HTML references deleted chunks; catch the error and reload once.',
              solution: `const Edit = lazy(() => import('./Edit').catch(() => {
  location.reload(); return new Promise(() => {});
}));`,
            },
            {
              task: 'Name a cache header fix.',
              description: 'Checks HTML caching versus hashed assets.',
              code: '// index.html cached 1 day',
              answer: 'Serve index.html with no-cache and keep hashed assets long-lived, so users get fresh chunk names.',
            },
            {
              easy: true,
              task: 'True or false: old chunks may vanish after deploy.',
              description: 'Checks stale chunk loading.',
              answer: 'True, hashed files from the old build may be deleted.',
            },
            {
              easy: true,
              task: 'Predict the result.',
              description: 'Checks failed dynamic import.',
              code: 'await import(\'/old-chunk.abc123.js\'); // 404',
              answer: 'It rejects, so the handler fails unless you catch it.',
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
              task: 'Name the strategy for each resource.',
              description: 'Checks caching strategy choice.',
              code: '// A: hashed JS  B: /api/feed  C: avatar',
              answer: 'A: cache-first. B: network-first with cache fallback. C: stale-while-revalidate.',
            },
            {
              task: 'Write a cache-first fetch handler.',
              description: 'Checks basic Service Worker fetch.',
              code: `self.addEventListener('fetch', e => { /* ... */ });`,
              answer: 'Respond from cache, else hit the network.',
              solution: `self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request)
    .then(r => r ?? fetch(e.request)));
});`,
            },
            {
              easy: true,
              task: 'Name the strategy.',
              description: 'Checks cache-first caching.',
              code: 'caches.match(req).then(r => r || fetch(req));',
              answer: 'Cache first, which serves cached data and falls back to network.',
            },
            {
              easy: true,
              task: 'Name the event.',
              description: 'Checks intercepting requests in SW.',
              code: 'self.addEventListener(\'___\', e => e.respondWith(...));',
              answer: 'fetch, which lets a Service Worker answer network requests.',
            },
          ],
        },
        {
          q: 'What are import maps? What problem do they solve?',
          short: 'An import map is a JSON block in the page that tells the browser where bare imports, like import "react", should load from. It lets you use bare module names without a bundler.',
          long: `Browsers only understand URLs in imports, like "./a.js" or "https://...". A bare name like "lodash" fails without help.
<script type="importmap"> maps names to URLs: { "imports": { "lodash": "/vendor/lodash.js" } }.
"scopes" lets different parts of the app use different versions.
Useful for no-build setups, micro-frontends sharing one copy of a library, and cache busting with hashed file names.
The map must load before the module scripts that use it; modern browsers support multiple import maps merged together.
Strong answer: explains bare specifiers and a real use case. Weak answer: confuses import maps with source maps.`,
          exercises: [
            {
              task: 'Write an import map for a bare specifier.',
              description: 'Checks import map syntax.',
              code: `import confetti from 'confetti';`,
              answer: 'Map the bare name to a URL in a script type=importmap.',
              solution: `<script type="importmap">
{ "imports": { "confetti": "/vendor/confetti.js" } }
</script>`,
            },
            {
              task: 'Predict what happens without an import map.',
              description: 'Checks bare specifiers in browsers.',
              code: `<script type="module">import React from 'react';</script>`,
              answer: 'TypeError: browsers cannot resolve bare specifiers without an import map or bundler.',
            },
            {
              easy: true,
              task: 'Name the script type.',
              description: 'Checks import map declaration.',
              code: '<script type="___">{"imports":{}}</script>',
              answer: 'importmap, which maps bare module names to URLs.',
            },
            {
              easy: true,
              task: 'Predict what loads.',
              description: 'Checks bare specifier mapping.',
              code: `// importmap: {"imports":{"lodash":"/lib/lodash.js"}}
import _ from 'lodash';`,
              answer: '/lib/lodash.js, the import map resolves the bare name.',
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
              task: 'Write a per-widget error boundary usage.',
              description: 'Checks isolating widget failures.',
              code: '<Dashboard><Weather /><Stocks /></Dashboard>',
              answer: 'Wrap each widget so one crash does not blank the page.',
              solution: `<ErrorBoundary fallback={<WidgetError />}><Weather /></ErrorBoundary>
<ErrorBoundary fallback={<WidgetError />}><Stocks /></ErrorBoundary>`,
            },
            {
              task: 'Name what error boundaries do not catch.',
              description: 'Checks boundary limits.',
              code: 'onClick={() => { throw new Error() }}',
              answer: 'Event handlers, async code and timers. Catch them yourself or report via window error and unhandledrejection.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks try/catch isolation.',
              code: `try { throw new Error('w1'); } catch { console.log('ok'); }
console.log('w2');`,
              answer: 'ok then w2, catching one error lets other code run.',
            },
            {
              easy: true,
              task: 'Name the event.',
              description: 'Checks global unhandled rejection.',
              code: 'window.addEventListener(\'___\', e => log(e.reason));',
              answer: 'unhandledrejection, which fires for uncaught promise rejections.',
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
              task: 'Fix the bug.',
              description: 'Checks origin validation in postMessage.',
              code: `window.addEventListener('message', e => {
  setToken(e.data.token);
});`,
              answer: 'Any page can post messages; verify origin first.',
              solution: `window.addEventListener('message', e => {
  if (e.origin !== 'https://app.example.com') return;
  setToken(e.data.token);
});`,
            },
            {
              task: 'Spot the problem.',
              description: 'Checks wildcard target origin.',
              code: `parent.postMessage({ token }, '*');`,
              answer: `'*' leaks the token to any embedder. Pass the exact expected target origin.`,
            },
            {
              easy: true,
              task: 'Name the property.',
              description: 'Checks message sender check.',
              code: 'window.onmessage = e => { if (e.___ !== \'https://app.com\') return; };',
              answer: 'origin, which identifies who sent the message.',
            },
            {
              easy: true,
              task: 'True or false: \'*\' target origin is safe for secrets.',
              description: 'Checks postMessage target origin.',
              code: 'parent.postMessage(token, \'*\');',
              answer: 'False, any page embedding the frame could receive the token.',
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
              task: 'Write a non-blocking SDK load.',
              description: 'Checks async script injection.',
              code: '<script src="https://sdk.vendor.com/v1.js"></script>',
              answer: 'Load async (or on idle) so parsing is not blocked; pin version and add SRI.',
              solution: `<script async src="https://sdk.vendor.com/v1.2.3.js"
  integrity="sha384-..." crossorigin="anonymous"></script>`,
            },
            {
              task: 'Name two safety controls for third-party scripts.',
              description: 'Checks CSP and isolation.',
              code: '// vendor chat widget',
              answer: 'A strict CSP allowlist plus SRI, and sandboxed iframes for untrusted widgets.',
            },
            {
              easy: true,
              task: 'Name the attribute.',
              description: 'Checks non-blocking script load.',
              code: '<script src="sdk.js" ___></script>',
              answer: 'async, which downloads without blocking HTML parsing.',
            },
            {
              easy: true,
              task: 'Name the attribute.',
              description: 'Checks script integrity check.',
              code: '<script src="sdk.js" ___="sha384-..."></script>',
              answer: 'integrity, which blocks the script if its hash changes.',
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
              task: 'Mount React inside a jQuery page.',
              description: 'Checks incremental islands approach.',
              code: '<div id="cart"></div>',
              answer: 'Render React into one container and migrate widget by widget (strangler pattern).',
              solution: `createRoot(document.getElementById('cart')).render(<Cart />);`,
            },
            {
              task: 'Spot the problem.',
              description: 'Checks DOM ownership conflicts.',
              code: `$('#cart li').remove(); // React renders #cart`,
              answer: 'jQuery mutating React-owned DOM breaks reconciliation. Each DOM subtree must have one owner; communicate via events.',
            },
            {
              easy: true,
              task: 'Name the pattern.',
              description: 'Checks gradual replacement strategy.',
              answer: 'Strangler fig: replace the legacy app piece by piece.',
            },
            {
              easy: true,
              task: 'Name the method.',
              description: 'Checks mounting React into a DOM node.',
              code: 'ReactDOM.___(document.getElementById(\'w\')).render(<App />);',
              answer: 'createRoot, which mounts React inside any existing element.',
            },
          ],
        },
        {
          q: 'Code review: the app picks its API URL from the hostname in many files. What problems do you see? How should configuration work?',
          code: `const API = location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : location.hostname.includes('staging')
    ? 'https://api.staging.example.com'
    : 'https://api.example.com';`,
          short: 'Logic copied across files breaks when a new environment appears, and it is easy to call the wrong API. Put config in one module, and load it at runtime, so one build works in every environment.',
          long: `Duplicated hostname checks drift apart; a new preview environment silently calls production.
Build-time variables (like import.meta.env) bake values into the bundle, so you need one build per environment.
"Build once, deploy many": serve a small config.json or inject window.__CONFIG__ from the server, and read it in one config module.
Validate config at startup and fail loudly if it is missing.
Never put secrets in frontend config; everything there is public.
Strong answer: centralizes config, explains build-time versus runtime, and keeps secrets out. Weak answer: adds another else-if branch.`,
          fix: `// config.js
let config;
export async function loadConfig() {
  const res = await fetch('/config.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Config missing');
  config = await res.json();
  if (!config.apiUrl) throw new Error('apiUrl not set');
}
export const getConfig = () => config;`,
          follow: 'What is the trade-off of loading config at runtime instead of at build time?',
          exercises: [
            {
              task: 'Spot the problem.',
              description: 'Checks scattered hostname-based config.',
              code: `const api = location.hostname.includes('stg')
  ? 'https://stg.api' : 'https://api';`,
              answer: 'Logic duplicates across files and breaks on new hosts. Centralize config in one typed module.',
            },
            {
              task: 'Rewrite using build-time config.',
              description: 'Checks environment variables in Vite.',
              code: 'const API = getApiFromHost();',
              answer: 'Read one env var in a single config module; or load runtime config.json to build once, deploy anywhere.',
              solution: 'export const config = { apiUrl: import.meta.env.VITE_API_URL };',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks hostname property.',
              code: `// URL: https://staging.app.com:8080/x
console.log(location.hostname);`,
              answer: 'staging.app.com, hostname excludes the port and path.',
            },
            {
              easy: true,
              task: 'True or false: env config belongs in one module.',
              description: 'Checks centralizing configuration.',
              answer: 'True, one config module avoids duplicated, drifting logic.',
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
              task: 'Name three criteria to evaluate a library.',
              description: 'Checks library selection judgment.',
              code: '// date picker: build or adopt?',
              answer: 'Maintenance activity, bundle size, accessibility, license and API fit versus in-house cost of ownership.',
            },
            {
              task: 'Decide: build or buy for this case.',
              description: 'Checks complexity-driven decision.',
              code: '// need: rich text editor with collaboration',
              answer: 'Use a mature library: editors are complex (selection, IME, a11y); building in-house is a huge long-term burden.',
            },
            {
              easy: true,
              task: 'True or false: dependencies add maintenance cost.',
              description: 'Checks third-party tradeoffs.',
              answer: 'True, you must track updates, security fixes, and breaking changes.',
            },
            {
              easy: true,
              task: 'Name the command.',
              description: 'Checks dependency vulnerability scan.',
              code: '$ npm ___',
              answer: 'audit, which reports known vulnerabilities in dependencies.',
            },
          ],
        },
      ],
    },
  },
};
