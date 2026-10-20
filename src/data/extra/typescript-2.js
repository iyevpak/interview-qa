export default {
  TypeScript: {
    'Class, Prototyping': {
      junior: [
        {
          q: 'What does instanceof check? Does it work with interfaces?',
          short: 'instanceof checks the prototype chain at runtime. Interfaces do not exist at runtime, so you cannot use instanceof with them.',
          long: `\`x instanceof Foo\` walks x's prototype chain looking for Foo.prototype.
TypeScript uses it for narrowing inside an if block.
Interfaces and type aliases are erased, so \`x instanceof User\` fails if User is an interface.
For interfaces, write a type guard function or use the \`in\` operator.
Pitfall: instanceof can fail across iframes or with two copies of the same library.
Strong answer: knows it is a runtime check and suggests a type guard for interfaces.
Weak answer: thinks TypeScript adds runtime checks for interfaces.`,
          follow: 'Why can instanceof fail with two copies of a library?',
          exercises: [
            {
              task: 'Fix this code. User is an interface.',
              description: 'Checks that interfaces are erased.',
              code: `interface User { name: string }
function hi(x: unknown) { if (x instanceof User) console.log(x.name); }`,
              answer: 'Write a type guard that checks the shape, or use `\'name\' in x`.',
              solution: `function isUser(x: unknown): x is User {
  return typeof x === 'object' && x !== null && 'name' in x;
}`,
            },
            {
              task: 'What does this print?',
              description: 'Checks the prototype chain.',
              code: `class Animal {}
class Dog extends Animal {}
const d = new Dog();
console.log(d instanceof Dog, d instanceof Animal);`,
              answer: 'It prints true twice, because Dog.prototype inherits from Animal.prototype.',
            },
          ],
        },
        {
          q: 'Fix this code. It assigns a value to a getter that has no setter.',
          code: `class Temp {
  private c = 0;
  get celsius() { return this.c; }
}
const t = new Temp();
t.celsius = 20;`,
          fix: `class Temp {
  private c = 0;
  get celsius() { return this.c; }
  set celsius(v: number) { this.c = v; }
}
const t = new Temp();
t.celsius = 20;`,
          short: 'A getter without a setter is read-only in TypeScript, so the assignment is an error. Add a setter or use a method.',
          long: `TypeScript treats a get-only accessor as a readonly property.
At runtime, the assignment would be ignored or throw in strict mode.
The getter and setter live on the prototype, not on the instance.
Pitfall: adding a setter without validation can let bad values in.
Strong answer: adds a setter and maybe validates the value.
Weak answer: makes the private field public.`,
          follow: 'Where do getters live, on the instance or on the prototype?',
          exercises: [
            {
              task: 'Add a setter that rejects negative values.',
              description: 'Checks setter logic.',
              code: 'class Box { private w = 0; get width() { return this.w; } }',
              answer: 'Throw or ignore when v is below zero. A strong answer explains why validation fits in a setter.',
              solution: `class Box {
  private w = 0;
  get width() { return this.w; }
  set width(v: number) { if (v < 0) throw new Error('negative'); this.w = v; }
}`,
            },
            {
              task: 'Does Object.keys(new Temp()) include celsius? Why?',
              description: 'Checks where accessors live.',
              answer: 'No. Accessors are on the prototype, so Object.keys only shows own fields like c. This also matters for JSON.stringify.',
            },
          ],
        },
        {
          q: 'What is a static member in a class? How do you type it?',
          short: 'Static members belong to the constructor function, not instances; their types live on typeof ClassName.',
          long: `static count = 0 is stored on the class itself.\nAccess it as Counter.count, not this.count in instance methods.\nInstance type is Counter; constructor type is typeof Counter.\nStatic blocks (static { ... }) run once at class evaluation.\nStatic members cannot reference the class type parameters.\nAbstract static members are not supported.`,
          exercises: [
            {
              task: 'Write a class that counts how many objects were created.',
              description: 'Checks static usage. Run with ts-node or tsx.',
              answer: 'Declare static created = 0 and increment Counter.created in the constructor. Reading it from an instance requires the class name. The type of Counter.created is number.',
              solution: `class Counter { static created = 0; constructor() { Counter.created++; } }`,
            },
            {
              task: 'A generic class has a static field of type T. Why is this an error?',
              description: 'Checks generics and statics. Paste in playground.',
              answer: 'Statics are shared by all instantiations of the class, so they cannot depend on T. TS reports TS2302. Use a generic static method instead, e.g. static of<U>(x: U): Box<U>.',
            },
          ],
        },
      ],
      middle: [
        {
          q: 'How does TypeScript type a class, its prototype, and its instances?',
          short: 'ClassName is the instance type; typeof ClassName is the constructor type with a prototype property typed as the instance type.',
          long: `class Foo produces both a value (constructor) and a type (instance shape).\ntypeof Foo includes construct signature new (...) => Foo and statics.\nFoo.prototype is typed as Foo, even though it lacks own fields at runtime.\nInstanceType<typeof Foo> recovers Foo; ConstructorParameters gives args.\nPrivate/protected members make class types effectively nominal.\nMethods live on the prototype; arrow-field functions live per instance.`,
          exercises: [
            {
              task: 'Write a function that takes a class and its arguments. It should return a new instance with correct types.',
              description: 'Checks constructor typing. Run tsc --strict.',
              answer: 'Use a generic over the constructor type with C extends new (...a: any[]) => any. Use ConstructorParameters<C> for args and InstanceType<C> for the result. This keeps argument checking intact.',
              solution: `function create<C extends new (...a: any[]) => any>(c: C, ...args: ConstructorParameters<C>): InstanceType<C> { return new c(...args); }`,
            },
            {
              task: 'Two classes have the same public fields. Why does a private field make them different?',
              description: 'Checks structural vs nominal classes. Playground.',
              answer: 'TS compares classes structurally by public members. A private or protected member must originate from the same declaration to be compatible. So adding a private field makes the class nominal in practice.',
            },
          ],
        },
        {
          q: 'Fix this code. A method is added to the prototype by hand, and TypeScript does not know about it.',
          code: `class Money { constructor(public cents: number) {} }
(Money.prototype as any).format = function () { return '$' + this.cents / 100; };
new Money(150).format();`,
          fix: `class Money { constructor(public cents: number) {} }
interface Money { format(): string }
Money.prototype.format = function (this: Money) { return '$' + this.cents / 100; };
new Money(150).format();`,
          short: 'Declare the method with an interface that has the same name as the class. The interface merges into the instance type.',
          long: `A class creates an instance type, and an interface with the same name merges into it.
Then \`Money.prototype.format = ...\` type-checks, and calls work.
The \`this: Money\` parameter types \`this\` inside the function.
Pitfall: the merged interface only promises the method; if the assignment never runs, calls crash.
Better for your own code: add the method inside the class. Use merging for patches and plugins.
Strong answer: knows class plus interface merging and its risk.
Weak answer: keeps \`as any\`.`,
          follow: 'When is patching a prototype a bad idea?',
          exercises: [
            {
              task: 'Add a typed method last() to arrays with global augmentation.',
              description: 'Checks augmenting a built-in prototype.',
              answer: 'Use `declare global { interface Array<T> { last(): T | undefined } }` and add it to Array.prototype. A strong answer warns about conflicts with future standard methods.',
              solution: `declare global { interface Array<T> { last(): T | undefined } }
Array.prototype.last = function () { return this[this.length - 1]; };
export {};`,
            },
            {
              task: 'Why is the method missing on the instance in this check?',
              description: 'Checks own versus prototype properties.',
              code: `const m = new Money(1);
console.log(m.hasOwnProperty('format'));`,
              answer: 'hasOwnProperty is false because format is on the prototype. `\'format\' in m` is true.',
            },
          ],
        },
        {
          q: 'Fix this code. One class field uses another field before it is set.',
          code: `class Price {
  total = this.net * (1 + this.tax);
  net = 100;
  tax = 0.2;
}`,
          fix: `class Price {
  net = 100;
  tax = 0.2;
  total = this.net * (1 + this.tax);
}`,
          short: 'Fields are set from top to bottom. total runs first, when net and tax are still undefined, so it becomes NaN. TS reports "used before its initialization".',
          long: `Class field initializers run in source order, before the constructor body.
TypeScript gives error 2729 when a field reads another field declared below it.
In a subclass, parent fields are set during super(), then child fields.
Pitfall: a getter for total avoids order problems and stays correct when net changes.
Strong answer: reorders fields or uses a getter, and explains the order.
Weak answer: adds \`!\` to silence it.`,
          follow: 'When do child class fields get their values compared with the parent constructor?',
          exercises: [
            {
              task: 'Change total into a getter so it always matches net and tax.',
              description: 'Checks derived values.',
              answer: 'A getter computes on read, so there is no order problem and no stale value.',
              solution: 'class Price { net = 100; tax = 0.2; get total() { return this.net * (1 + this.tax); } }',
            },
            {
              task: 'What does this print?',
              description: 'Checks parent and child initialization order.',
              code: `class A { name = 'base'; constructor() { console.log(this.name); } }
class B extends A { name = 'child'; }
new B();`,
              answer: 'It prints "base" because the parent constructor runs before the child field is set. Weak answers say "child".',
            },
          ],
        },
      ],
      senior: [
        {
          q: 'What is a static block in a class, and when do you use it?',
          short: 'A `static { ... }` block runs once when the class is defined. Use it for setup of static fields that needs more than one expression.',
          long: `Static blocks came in ES2022 and TypeScript 4.4.
They can read and set private static fields, so setup logic stays inside the class.
They run in order with static field initializers.
Typical use: building a lookup table, try/catch around setup, or sharing private access with a helper outside the class.
Pitfall: heavy work in a static block runs on import and slows startup.
Strong answer: gives a real use and mentions it runs at class definition.
Weak answer: confuses it with a constructor.`,
          follow: 'When does a static block run?',
          exercises: [
            {
              task: 'Move this setup code into a static block.',
              description: 'Checks syntax and access to private statics.',
              code: `class Currency { static #byCode = new Map<string, number>(); }
for (const [c, d] of [['USD', 2], ['JPY', 0]] as const) /* cannot reach #byCode here */;`,
              answer: 'Inside the class, a static block can fill the private map. A strong answer notes this keeps #byCode private.',
              solution: `class Currency {
  static #byCode = new Map<string, number>();
  static {
    for (const [c, d] of [['USD', 2], ['JPY', 0]] as const) Currency.#byCode.set(c, d);
  }
}`,
            },
            {
              task: 'In which order do the logs appear?',
              description: 'Checks static order.',
              code: `class X {
  static a = console.log('a');
  static { console.log('block'); }
  static b = console.log('b');
}`,
              answer: 'It logs "a" then "block" then "b": static fields and blocks run top to bottom.',
            },
          ],
        },
        {
          q: 'Fix this mixin. It should also accept abstract classes.',
          code: `type Ctor = new (...a: any[]) => {};\nfunction Timestamped<B extends Ctor>(Base: B) { return class extends Base { at = Date.now(); }; }\nabstract class Entity {}\nTimestamped(Entity); // error`,
          short: 'Use abstract new (...) => ... in the constraint so abstract classes are accepted.',
          long: `An abstract class does not satisfy a concrete construct signature.\nTS 4.2 added abstract construct signatures.\nabstract new (...a: any[]) => {} accepts both abstract and concrete classes.\nThe returned class must then also be declared abstract.\nMixins with abstract bases keep abstract members enforced.\nThis is the usual fix for mixin libraries.`,
          fix: `type AbstractCtor = abstract new (...a: any[]) => {};\nfunction Timestamped<B extends AbstractCtor>(Base: B) {\n  abstract class T extends Base { at = Date.now(); }\n  return T;\n}`,
          exercises: [
            {
              task: 'Check that abstract methods are still required after using the mixin.',
              description: 'Checks abstract propagation. tsc --strict.',
              answer: 'A concrete class that extends the mixin must implement all abstract members or TS2515 is reported. The mixin preserves the abstract shape. This confirms correct typing.',
            },
            {
              task: 'Why can you not call "new Base" inside this mixin?',
              description: 'Checks abstract construct semantics. Playground.',
              answer: 'An abstract construct signature cannot be invoked with new. Only extending it is allowed. If the mixin needs to instantiate, require a concrete constructor instead.',
            },
          ],
        },
        {
          q: 'Fix this old prototype-style code. TypeScript cannot type it.',
          code: `function Animal(this: any, name: string) { this.name = name; }\nAnimal.prototype.speak = function () { return this.name; };\nconst a = new Animal('x'); // error: 'new' expression lacks construct signature`,
          short: 'Convert to a class, or declare an interface for instances plus a constructor interface and cast once.',
          long: `TS does not infer construct signatures from function + prototype in .ts files.\nIn .js with checkJs it does via JS inference, but not in TS.\nThe idiomatic fix is an ES class.\nFor legacy code, declare interface Animal and interface AnimalCtor { new (n: string): Animal }.\nCast the function once at the boundary.\nThis keeps consumers typed during gradual migration.`,
          fix: `class Animal {\n  constructor(public name: string) {}\n  speak() { return this.name; }\n}`,
          exercises: [
            {
              task: 'Type the old function without rewriting it. Use interfaces and one cast.',
              description: 'Checks declaration-level typing. tsc --strict.',
              answer: 'Declare interface Animal { name: string; speak(): string } and const AnimalCtor = Animal as unknown as { new (name: string): Animal }. Consumers use new AnimalCtor("x") with full types. The single cast is the controlled unsafe boundary.',
            },
            {
              task: 'How can a declaration file describe a prototype-based library?',
              description: 'Checks declaration authoring. Discussion.',
              answer: 'Write declare class Animal { constructor(name: string); name: string; speak(): string } in the .d.ts. declare class describes shape regardless of runtime implementation. This is how DefinitelyTyped models ES5 libraries.',
            },
          ],
        },
      ],
      techlead: [
        {
          q: 'Node can now remove types and run TypeScript directly. What class rules do you set for your team?',
          short: 'Ban non-erasable syntax (enums, namespaces, parameter properties) in code that must run under type stripping, and lint for it.',
          long: `Node 22.6+/23 strips types but cannot transform TS-only runtime syntax.\nTS 5.8 --erasableSyntaxOnly errors on enums, namespaces with values, parameter properties, import =.\nApply it to packages that run in Node directly or with fast transpilers.\nFrameworks like Angular/NestJS may need exceptions.\nDocument the rule and enforce via tsconfig, not review.\nPlan the migration package by package with codemods.`,
          ai: true,
          exercises: [
            {
              task: 'You have forty packages. Plan how to turn on erasableSyntaxOnly.',
              description: 'Checks rollout planning. Discussion.',
              answer: 'Enable it in a shared base tsconfig behind a per-package opt-out. Run tsc to count violations per package, codemod parameter properties and enums, then remove opt-outs. Track progress in CI and block new violations immediately.',
            },
            {
              task: 'What do you use instead of each banned feature?',
              description: 'Checks alternatives. Discussion.',
              answer: 'Enums become as const objects plus union types. Parameter properties become explicit fields. Value namespaces become ES modules. import = becomes ES import or createRequire.',
            },
          ],
        },
        {
          q: 'Fix this code. Class objects lose their methods after we save them to a cache as JSON.',
          code: `class Money { constructor(public amount: number, public currency: string) { } add(o: Money) { return new Money(this.amount + o.amount, this.currency); } }\nconst m: Money = JSON.parse(cache.get('m')); m.add(x); // TypeError`,
          short: 'JSON.parse returns plain objects; parse with a schema and rehydrate via a factory at the boundary.',
          long: `Typing JSON.parse output as Money is a lie: methods are missing.\nStructural typing hides it because the cast is unchecked.\nIntroduce a DTO type and a fromJSON factory.\nValidate with a schema (zod/valibot) at cache, storage and network boundaries.\nOr move to plain data + functions so serialization is lossless.\nMake the rule: classes never cross serialization boundaries untyped.`,
          fix: `type MoneyDTO = { amount: number; currency: string };\nclass Money {\n  static fromJSON(d: MoneyDTO) { return new Money(d.amount, d.currency); }\n  // ...constructor and add as before\n}\nconst m = Money.fromJSON(MoneySchema.parse(JSON.parse(raw)));`,
          ai: true,
          exercises: [
            {
              task: 'Add a toJSON method. Show that save and load keep the behavior.',
              description: 'Checks serialization contract. Write a vitest test.',
              answer: 'toJSON returns the DTO, JSON.stringify calls it automatically, and fromJSON rehydrates. A test asserting Money.fromJSON(JSON.parse(JSON.stringify(m))).add works covers it. Schema validation catches corrupt data.',
            },
            {
              task: 'Suggest a rule that stops people from typing JSON.parse results as classes.',
              description: 'Checks enforcement thinking. Discussion.',
              answer: 'Ban explicit annotations on JSON.parse via a custom lint rule or use a typed wrapper returning unknown (ts-reset does this). Developers must then validate. Code review alone does not scale.',
            },
          ],
        },
        {
          q: 'A shared UI library is used by many teams. Should it export classes or factory functions? Why?',
          short: 'Prefer factory functions and interfaces for public APIs: better tree-shaking, no instanceof coupling across bundles, and easier evolution.',
          long: `Classes leak nominal behavior through private members and instanceof.\nDuplicate package copies break instanceof checks across bundles.\nClass methods are not tree-shakable individually.\nFactories returning interfaces allow changing implementation freely.\nClasses still fit stateful long-lived objects with lifecycles.\nDecide per API, document it, and keep constructors internal.`,
          ai: true,
          exercises: [
            {
              task: 'Change a public Client class to a createClient function. Do not break users.',
              description: 'Checks backward-compatible API evolution. Discussion plus tsc.',
              answer: 'Export interface Client and createClient, and keep the class exported but deprecated as an alias delegating to the factory. Publish a minor version with the deprecation and remove in the next major. Use api-extractor to verify the surface.',
            },
            {
              task: 'An app has two copies of the same library. Why does instanceof fail?',
              description: 'Checks runtime identity issues. Discussion.',
              answer: 'Each copy has its own class constructor, so instanceof against the other copy returns false. Error handling like err instanceof SdkError silently fails. Use brand properties or Symbol.for-based checks instead.',
            },
          ],
        },
      ],
    },

    'Set, WeakSet, Map, WeakMap': {
      junior: [
        {
          q: 'You need unique values. What is the difference between a Set and an array?',
          short: 'Set<T> guarantees uniqueness with O(1) has/add; arrays allow duplicates and need O(n) includes.',
          long: `new Set<string>() stores unique values using SameValueZero.\nhas, add and delete are average O(1).\nArrays keep order and allow indexes; Set keeps insertion order only.\nConvert with [...set] or Array.from(set).\nObjects are compared by reference, not structure.\nTS infers Set<T> from the constructor argument.`,
          exercises: [
            {
              task: 'Write a generic function that removes duplicates. Use a Set.',
              description: 'Checks generic Set usage. Run with tsx.',
              answer: 'Return [...new Set(items)]. Type parameter T is preserved. For objects, it deduplicates by reference only.',
              solution: `const unique = <T,>(items: T[]): T[] => [...new Set(items)];`,
            },
            {
              task: 'A Set gets two objects that look the same. What is its size?',
              description: 'Checks reference equality. node.',
              code: `new Set([{ a: 1 }, { a: 1 }]).size`,
              answer: 'It is 2 because the two objects are different references. Set does not compare structurally. Use a Map keyed by an id to dedupe objects.',
            },
          ],
        },
        {
          q: 'Fix this error. An empty Set has the type unknown.',
          code: `const ids = new Set();\nids.add(1);\nconst first: number = [...ids][0];`,
          short: 'Pass the type argument explicitly: new Set<number>().',
          long: `With no arguments TS cannot infer T and defaults to unknown.\nSpreading gives unknown[], not assignable to number.\nAlways annotate empty collections: new Set<number>(), new Map<string, User>().\nAlternatively annotate the variable: const ids: Set<number> = new Set().\nThis also applies to empty arrays under noImplicitAny.`,
          fix: `const ids = new Set<number>();\nids.add(1);\nconst first = [...ids][0]; // number | undefined with noUncheckedIndexedAccess`,
          exercises: [
            {
              task: 'Fix an empty Map used as a cache from string to User.',
              description: 'Checks explicit generics. tsc --strict.',
              answer: 'Write new Map<string, User>(). Otherwise it is Map<any, any> and gives no safety. Annotating is the only way when starting empty.',
            },
            {
              task: 'What type does map.get return? Why?',
              description: 'Checks optional return. Playground.',
              answer: 'It is V | undefined because the key might be missing. Narrow with a check or use has first, though has does not narrow get. Store the result in a variable and check it.',
            },
          ],
        },
        {
          q: 'Fix this loop. It should print each name and score from the Map.',
          code: `const scores = new Map<string, number>([['a', 1]]);\nfor (const [name, score] of scores.keys()) console.log(name, score);`,
          short: 'keys() yields keys only; iterate the Map directly or use entries() to destructure pairs.',
          long: `for..of over a Map yields [key, value] tuples.\nkeys() yields K, values() yields V, entries() yields [K, V].\nDestructuring a string key gives its first characters, a silent bug.\nTS allows it because strings are iterable, so there is no error.\nUse forEach((value, key)) with value first if preferred.`,
          fix: `for (const [name, score] of scores) console.log(name, score);`,
          exercises: [
            {
              task: 'Turn a Map of string to number into a plain object.',
              description: 'Checks Object.fromEntries. tsx.',
              answer: 'Use Object.fromEntries(map). The result type is { [k: string]: number }. Non-string keys get stringified.',
            },
            {
              task: 'Add up all values in a Map of string to number.',
              description: 'Checks values() iteration. tsx.',
              answer: 'Use [...map.values()].reduce((a, b) => a + b, 0). Or loop with for (const v of map.values()). Both are typed as number.',
            },
          ],
        },
      ],
      middle: [
        {
          q: 'Why must WeakMap keys be objects? How does TypeScript check this?',
          short: 'Weak references require garbage-collectable keys; TS constrains K extends WeakKey (object or symbol since ES2023 lib).',
          long: `WeakMap<K extends WeakKey, V>; older libs used K extends object.\nTS 5.2 introduced WeakKey to allow symbols per ES2023.\nPrimitives like strings are never collected, so they are disallowed.\nRegistered symbols (Symbol.for) are rejected at runtime.\nWeakMaps are not iterable and have no size.\nUse them for per-object metadata without leaks.`,
          exercises: [
            {
              task: 'Why does a WeakMap with string keys give an error?',
              description: 'Checks constraint. Playground.',
              answer: 'string does not satisfy WeakKey. TS reports type does not satisfy constraint. Use Map for primitive keys.',
            },
            {
              task: 'Store private data for page elements. Use a typed WeakMap.',
              description: 'Checks practical usage. tsc.',
              answer: 'const meta = new WeakMap<Element, { clicks: number }>(). Entries disappear when the element is collected. No manual cleanup is needed.',
            },
          ],
        },
        {
          q: 'Fix this code. A Map with array keys never finds the value.',
          code: `const prices = new Map<[string, string], number>();
prices.set(['USD', 'EUR'], 0.92);
console.log(prices.get(['USD', 'EUR'])); // undefined`,
          fix: `const prices = new Map<\`\${string}:\${string}\`, number>();
const key = (a: string, b: string) => \`\${a}:\${b}\` as const;
prices.set(key('USD', 'EUR'), 0.92);
console.log(prices.get(key('USD', 'EUR'))); // 0.92`,
          short: 'Map compares object keys by reference, so a new array is a different key. Use a string key built from the parts.',
          long: `Map uses SameValueZero: primitives by value, objects by identity.
Two arrays with the same items are different objects.
Build a stable string key, and a template literal type can describe its format.
Pitfall: choose a separator that cannot appear in the parts.
Strong answer: explains identity and types the key.
Weak answer: uses JSON.stringify everywhere without thinking about key order.`,
          follow: 'Why is JSON.stringify a risky key for objects?',
          exercises: [
            {
              task: 'Does this Set have size 1 or 2?',
              description: 'Checks object identity in Set.',
              code: 'const s = new Set([{ id: 1 }, { id: 1 }]);',
              answer: 'Size is 2, because the two objects are different references.',
            },
            {
              task: 'Remove duplicate users by id using a Map.',
              description: 'Checks keyed de-duplication.',
              code: 'type User = { id: number; name: string };',
              answer: 'Map by id, then take values.',
              solution: 'const unique = (us: User[]) => [...new Map(us.map((u) => [u.id, u])).values()];',
            },
          ],
        },
        {
          q: 'Fix this code. Saving a Map as JSON gives an empty object.',
          code: `const scores = new Map<string, number>([['ann', 3]]);
localStorage.setItem('s', JSON.stringify(scores)); // "{}"`,
          fix: `const scores = new Map<string, number>([['ann', 3]]);
localStorage.setItem('s', JSON.stringify([...scores]));
const back = new Map<string, number>(JSON.parse(localStorage.getItem('s') ?? '[]'));`,
          short: 'JSON.stringify ignores Map entries. Convert to an array of pairs (or Object.fromEntries) before saving, and rebuild the Map when loading.',
          long: `A Map has no own enumerable properties, so JSON sees an empty object.
Save \`[...map]\` (pairs) or \`Object.fromEntries(map)\` for string keys.
When loading, JSON.parse returns any; validate it or type it as unknown first.
Sets have the same problem: save \`[...set]\`.
Pitfall: Object.fromEntries turns non-string keys into strings.
Strong answer: converts both ways and validates on load.
Weak answer: expects JSON to handle Map.`,
          follow: 'When would you choose pairs over Object.fromEntries?',
          exercises: [
            {
              task: 'Write a replacer and reviver for JSON that keep Maps.',
              description: 'Checks JSON hooks.',
              answer: 'Tag Maps in the replacer and rebuild them in the reviver.',
              solution: `const replacer = (_: string, v: unknown) => v instanceof Map ? { __map: [...v] } : v;
const reviver = (_: string, v: any) => v && v.__map ? new Map(v.__map) : v;`,
            },
            {
              task: 'What does this print?',
              description: 'Checks Set serialization.',
              code: 'console.log(JSON.stringify(new Set([\'a\'])));',
              answer: 'It prints "{}". Use `[...tags]` to get ["a"].',
            },
          ],
        },
      ],
      senior: [
        {
          q: 'What are ReadonlyMap and ReadonlySet? When do you return them from a function?',
          short: 'They are types without set, add, delete or clear. Return them when callers should read the collection but not change it.',
          long: `ReadonlyMap<K, V> and ReadonlySet<T> keep get, has, size and iteration.
A normal Map is assignable to ReadonlyMap, so no copy is needed.
This protects internal caches that a class exposes.
Pitfall: it is only a compile-time check; a cast back to Map can still change it.
Pitfall: values inside are not deep-readonly.
Strong answer: uses them for public getters and knows the limits.
Weak answer: thinks they freeze the Map at runtime.`,
          follow: 'Can a caller still change the objects stored as values?',
          exercises: [
            {
              task: 'Change this getter so callers cannot add users.',
              description: 'Checks ReadonlyMap.',
              code: 'class Store { private users = new Map<string, User>(); getUsers() { return this.users; } }',
              answer: 'Return ReadonlyMap; the internal field stays a Map.',
              solution: 'class Store { private users = new Map<string, User>(); getUsers(): ReadonlyMap<string, User> { return this.users; } }',
            },
            {
              task: 'Does this compile?',
              description: 'Checks readonly methods.',
              code: `const tags: ReadonlySet<string> = new Set(['a']);
tags.add('b');`,
              answer: 'No, add does not exist on ReadonlySet.',
            },
          ],
        },
        {
          q: 'Fix this registry. The get method should return the right type for each key.',
          code: `const registry = new Map<string, unknown>();\nregistry.set('theme', 'dark');\nconst t: 'dark' | 'light' = registry.get('theme'); // error`,
          short: 'Wrap Map in a generic class keyed by a schema interface so get<K> returns Schema[K].',
          long: `Map<K, V> cannot correlate individual keys with value types.\nDefine interface Schema { theme: 'dark' | 'light'; count: number }.\nWrap a Map with get<K extends keyof Schema>(k: K): Schema[K] | undefined.\nInternally store unknown and cast once.\nThe cast is safe because set is equally constrained.\nThis pattern powers typed DI containers and caches.`,
          fix: `class TypedMap<S> {\n  private m = new Map<keyof S, unknown>();\n  set<K extends keyof S>(k: K, v: S[K]) { this.m.set(k, v); }\n  get<K extends keyof S>(k: K) { return this.m.get(k) as S[K] | undefined; }\n}`,
          exercises: [
            {
              task: 'Use typed token objects as keys instead of strings.',
              description: 'Checks phantom types. tsc.',
              answer: 'Define class Token<T> { declare _t: T; constructor(public name: string) {} } and get<T>(t: Token<T>): T. The phantom field carries T. Tokens can be WeakMap keys too.',
            },
            {
              task: 'Why is the cast inside the class acceptable?',
              description: 'Checks reasoning about soundness. Discussion.',
              answer: 'All writes go through the typed set, so the stored value for key K always has type S[K]. The invariant is maintained by encapsulation. The cast is confined to one place.',
            },
          ],
        },
        {
          q: 'Fix this WeakRef cache. It crashes when the object was already removed from memory.',
          code: `const refs = new Map<string, WeakRef<Bitmap>>();\nfunction get(k: string) { return refs.get(k)!.deref()!.draw(); }`,
          short: 'deref() returns T | undefined; handle collection and clean entries with FinalizationRegistry.',
          long: `WeakRef<T> holds a weak reference; deref() may return undefined anytime.\nAssertions hide this reality.\nCheck the result and recreate on miss.\nUse FinalizationRegistry to delete stale map entries.\nFinalization timing is non-deterministic; never rely on it for logic.\nRequires lib es2021.`,
          fix: `const reg = new FinalizationRegistry<string>(k => { if (!refs.get(k)?.deref()) refs.delete(k); });\nfunction get(k: string) {\n  let b = refs.get(k)?.deref();\n  if (!b) { b = load(k); refs.set(k, new WeakRef(b)); reg.register(b, k); }\n  return b.draw();\n}`,
          exercises: [
            {
              task: 'Why can the cleanup callback delete a new entry by mistake?',
              description: 'Checks race reasoning. Discussion.',
              answer: 'If the key was re-set with a new WeakRef before the old target finalized, the callback deletes the new one. Guard by checking refs.get(k)?.deref() === undefined before deleting. Finalization is asynchronous.',
            },
            {
              task: 'When should you use WeakMap instead of WeakRef?',
              description: 'Checks API choice. Discussion.',
              answer: 'When the key object exists and you want metadata tied to it, WeakMap is simpler and deterministic. WeakRef is for caching values looked up by primitive keys. Most apps never need WeakRef.',
            },
          ],
        },
      ],
      techlead: [
        {
          q: 'When would you use a WeakMap to store private data instead of #private fields?',
          short: 'Use a WeakMap when you add data to objects you do not own, like DOM nodes or objects from a library. Use #private for your own classes.',
          long: `A WeakMap keyed by an object holds extra data without changing the object and without stopping garbage collection.
#private fields only work inside the class that declares them.
WeakMap fits caches, metadata, and per-object state in shared libraries.
TypeScript downlevels #private to WeakMaps for old targets anyway.
Pitfall: WeakMaps are not iterable and cannot be debugged easily.
Strong answer: picks by ownership of the object.
Weak answer: uses WeakMap for everything.`,
          follow: 'Why is a WeakMap not iterable?',
          exercises: [
            {
              task: 'Store a click count for any DOM element without adding a property to it.',
              description: 'Checks WeakMap for foreign objects.',
              answer: 'Use WeakMap<Element, number>.',
              solution: `const clicks = new WeakMap<Element, number>();
function track(el: Element) { clicks.set(el, (clicks.get(el) ?? 0) + 1); }`,
            },
            {
              task: 'A team writes this. What would you change?',
              description: 'Checks the better choice for own classes.',
              code: `const tokens = new WeakMap<Client, string>();
class Client { constructor(t: string) { tokens.set(this, t); } }`,
              answer: 'For their own class, #token is simpler and clearer.',
            },
          ],
        },
        {
          q: 'Fix this server code. A module-level Map is shared between requests and leaks user data.',
          code: `const currentUser = new Map<string, User>();
export async function handler(req: Request) {
  currentUser.set('me', await auth(req));
  return render(currentUser.get('me')!);
}`,
          fix: `import { AsyncLocalStorage } from 'node:async_hooks';
const userStore = new AsyncLocalStorage<User>();
export async function handler(req: Request) {
  return userStore.run(await auth(req), () => render(userStore.getStore()!));
}`,
          short: 'A module Map lives for the whole server process, so concurrent requests overwrite each other. Keep per-request data in request scope, like AsyncLocalStorage or passed parameters.',
          long: `In SSR and Node servers, modules load once and are shared by all requests.
Two awaiting requests can read each other's data from a shared Map.
Pass data as arguments, use framework request context, or AsyncLocalStorage.
Module-level Maps are fine for real global caches with no user data.
Pitfall: the bug only appears under load, so tests pass.
Strong answer: explains concurrency and gives a scoped solution.
Weak answer: clears the Map at the end of each request.`,
          follow: 'Which caches are safe at module level on a server?',
          exercises: [
            {
              task: 'Why does clearing the Map at the end of the handler not fix it?',
              description: 'Checks concurrency reasoning.',
              answer: 'Requests overlap at await points, so another request can read or overwrite the entry before it is cleared.',
            },
            {
              task: 'Write a code review rule for module state in SSR code.',
              description: 'Checks policy.',
              answer: 'No mutable module state with user data; caches must have a key that includes the tenant or be read-only.',
            },
          ],
        },
        {
          q: 'Products support different browsers. How do you decide to use new collection methods?',
          short: 'Align TS lib with the real runtime baseline, polyfill deliberately, and gate via a shared tsconfig and browserslist.',
          long: `TS lib only declares APIs; it does not polyfill.\nMismatch between lib and targets causes runtime TypeErrors.\nDefine a baseline (e.g. Baseline 2024) per product.\nSet lib in a shared tsconfig to match, and add core-js where needed.\nUse eslint-plugin-compat to catch unsupported APIs.\nRevisit quarterly as browser support grows.`,
          ai: true,
          exercises: [
            {
              task: 'Write a rule for using the newest lib in shared packages.',
              description: 'Checks governance. Discussion.',
              answer: 'Shared packages target the lowest consumer baseline lib. esnext APIs require a polyfill dependency or a feature check. Exceptions need sign-off and a compat lint pass.',
            },
            {
              task: 'How does the lib setting affect Map.groupBy?',
              description: 'Checks lib knowledge. tsc.',
              answer: 'Map.groupBy and Object.groupBy are in lib es2024 (TS 5.4+). Without it TS reports the property missing. Runtime support is Node 21+ and modern browsers.',
            },
          ],
        },
      ],
    },

    'Generators, Symbol': {
      junior: [
        {
          q: 'What is Symbol.iterator? How do you make a class work with a for-of loop?',
          short: 'Implement [Symbol.iterator]() returning an iterator; TS then allows for..of and spread on instances.',
          long: `Any object with [Symbol.iterator]() is iterable.\nA generator method is the shortest implementation: *[Symbol.iterator]().\nTS types it as Iterable<T> via the return type.\nfor..of, spread and Array.from use it.\nTarget ES2015+ or enable downlevelIteration for older targets.\nInfer the element type from yield.`,
          exercises: [
            {
              task: 'Make a Range class that you can loop over.',
              description: 'Checks iterator implementation. tsx.',
              answer: 'Add *[Symbol.iterator]() { for (let i = this.start; i < this.end; i++) yield i; }. [...new Range(0,3)] gives [0,1,2]. The element type is number.',
            },
            {
              task: 'Why does spread fail when the target is ES5?',
              description: 'Checks compiler options. tsc --target es5.',
              answer: 'Without downlevelIteration TS only supports arrays for spread/for..of in ES5. It reports TS2802. Enable the flag or raise the target.',
            },
          ],
        },
        {
          q: 'Fix this code. We use a symbol as an object key, but get an error.',
          code: `const id = Symbol('id');\nconst obj: { [key: string]: number } = {};\nobj[id] = 1; // error`,
          short: 'Declare the property with a computed symbol key or use a unique symbol const in the type.',
          long: `const id = Symbol() gives type unique symbol.\nString index signatures do not cover symbols.\nUse a type with [id]: number or an index signature [key: symbol]: number.\nSymbol keys are skipped by JSON.stringify and Object.keys.\nThey are useful for hidden metadata.`,
          fix: `const id = Symbol('id');\nconst obj: { [id]: number } = { [id]: 1 };`,
          exercises: [
            {
              task: 'Does Object.keys return symbol keys?',
              description: 'Checks enumeration. node.',
              answer: 'No. Use Object.getOwnPropertySymbols or Reflect.ownKeys. JSON.stringify also ignores them.',
            },
            {
              task: 'Why can a symbol made with "let" not be a key in a type?',
              description: 'Checks unique symbol. Playground.',
              answer: 'let widens to symbol, not unique symbol. Only const or readonly static declarations get unique symbol. Computed type keys require a unique symbol.',
            },
          ],
        },
        {
          q: 'Fix this code. The generator gives values only the first time.',
          code: `function* nums() { yield 1; yield 2; }\nconst g = nums();\nconsole.log([...g], [...g]); // [1,2] []`,
          short: 'Generator objects are single-use iterators; call the generator function again or wrap it in an iterable.',
          long: `Calling nums() creates one iterator that can be consumed once.\nAfter completion further next() returns done: true.\nCall nums() each time, or expose an object with [Symbol.iterator]: nums.\nTS types the object as Generator<number, void, unknown>.\nArrays are reusable; generators are lazy and one-shot.`,
          fix: `const iterable = { [Symbol.iterator]: nums };\nconsole.log([...iterable], [...iterable]);`,
          exercises: [
            {
              task: 'What is the full type of the generator object?',
              description: 'Checks Generator types. Playground hover.',
              answer: 'Generator<1 | 2, void, unknown> with literal inference, or Generator<number, void, unknown> with annotation. The params are yield, return and next types. They describe values yielded, returned, and passed in.',
            },
            {
              task: 'Write a "take" generator. It returns the first N items.',
              description: 'Checks lazy iteration. tsx.',
              answer: 'Loop for..of, yield each item, and return after n items. Breaking calls return() on the source. It works on infinite generators.',
            },
          ],
        },
      ],
      middle: [
        {
          q: 'The Generator type has three type parameters. What does each one mean?',
          short: 'T is the yielded type, TReturn is the value returned at done: true, TNext is the type passed into next().',
          long: `const x = yield value; gets TNext from the caller's next(arg).\nreturn value becomes TReturn.\nIterating via for..of ignores TReturn.\nTS infers TNext as unknown unless annotated.\nUse explicit annotations for coroutine-style generators.\nTS 5.6 added --strictBuiltinIteratorReturn affecting TReturn of built-ins.`,
          exercises: [
            {
              task: 'Type a generator that gets numbers and gives back the running total.',
              description: 'Checks TNext usage. tsx.',
              answer: 'function* acc(): Generator<number, void, number> { let s = 0; while (true) s += yield s; }. Call next() once to start, then next(5). Each call returns the new total.',
            },
            {
              task: 'Why is the value in the first "next" call ignored?',
              description: 'Checks generator semantics. node.',
              answer: 'The first next starts execution up to the first yield; there is no yield expression waiting to receive a value. Subsequent next values become the result of the paused yield. This is a common bug.',
            },
          ],
        },
        {
          q: 'Fix this branded type. It is too easy to fake.',
          code: `type UserId = string & { __brand: 'UserId' };\nconst id = 'x' as UserId; // anywhere in the codebase`,
          short: 'Use a unique symbol brand declared in one module and create values only via a validating constructor.',
          long: `String-literal brands can be faked by any module that writes the same property.\ndeclare const brand: unique symbol makes the key unexportable.\nExport only a parse/make function that validates.\nCasts outside that module should be lint-banned.\nBrands have zero runtime cost.\nUse them for IDs, currency, sanitized HTML.`,
          fix: `declare const UserIdBrand: unique symbol;\nexport type UserId = string & { readonly [UserIdBrand]: true };\nexport function toUserId(s: string): UserId {\n  if (!/^u_/.test(s)) throw new Error('bad id');\n  return s as UserId;\n}`,
          exercises: [
            {
              task: 'Show that a user ID and an org ID cannot be mixed.',
              description: 'Checks brand incompatibility. tsc.',
              answer: 'Passing a UserId to a function expecting OrgId errors since brand keys differ. Both remain assignable to string. That is the desired one-way compatibility.',
            },
            {
              task: 'What do brands cost at runtime?',
              description: 'Checks erasure. Inspect tsc output.',
              answer: 'Zero; the brand only exists in types. The emitted value is a plain string. Validation cost exists only in the constructor function.',
            },
          ],
        },
        {
          q: 'Fix this code. The generator return value is lost in the for-of loop.',
          code: `function* steps(): Generator<string, number> {
  yield 'a'; yield 'b';
  return 2;
}
for (const s of steps()) console.log(s);
// how many steps? the 2 is never seen`,
          fix: `function* steps(): Generator<string, number> {
  yield 'a'; yield 'b';
  return 2;
}
const it = steps();
let r = it.next();
while (!r.done) { console.log(r.value); r = it.next(); }
console.log('count', r.value); // 2`,
          short: 'for-of ignores the value from return. Call next() by hand to read the final result, where done is true.',
          long: `A generator yields TYield values and finally returns TReturn.
for-of, spread and Array.from stop when done is true and drop that value.
To read it, loop with next(), or use \`yield*\` inside another generator, which evaluates to the return value.
Pitfall: putting real data in the return value surprises users; yield it instead if callers need it.
Strong answer: knows for-of drops the return and shows next() or yield*.
Weak answer: thinks the return value is yielded.`,
          follow: 'What does `const x = yield* inner()` give you?',
          exercises: [
            {
              task: 'Get the inner return value in an outer generator.',
              description: 'Checks yield* result.',
              code: 'function* inner(): Generator<number, string> { yield 1; return \'done\'; }',
              answer: 'yield* passes inner values through and evaluates to the return.',
              solution: 'function* outer() { const msg = yield* inner(); yield msg.length; }',
            },
            {
              task: 'What does this log?',
              description: 'Checks spread with return.',
              code: `function* g() { yield 1; yield 2; return 3; }
console.log([...g()]);`,
              answer: 'It logs [1, 2]; 3 is dropped.',
            },
          ],
        },
      ],
      senior: [
        {
          q: 'TypeScript 5.6 changed iterator types. What changed, and why does it matter?',
          short: 'Built-in iterators now return IteratorObject/ArrayIterator types, and their TReturn becomes undefined instead of any under the new strict flag.',
          long: `Before 5.6, built-ins like map.values() had TReturn = any.\nTS 5.6 introduces BuiltinIteratorReturn intrinsic: undefined under strictBuiltinIteratorReturn, any otherwise.\nThe flag is included in strict.\nNew names: ArrayIterator, MapIterator, SetIterator, IteratorObject.\nThey support iterator helper methods (map, filter, take).\nCode reading .value after done may now error.`,
          exercises: [
            {
              task: 'Find code that breaks with the new strict iterator flag.',
              description: 'Checks migration. tsc 5.6 --strict.',
              answer: 'Code like const v: string = map.keys().next().value now errors because value is string | undefined. Check done first. That was always a runtime risk.',
            },
            {
              task: 'Why did TypeScript add the IteratorObject type?',
              description: 'Checks lib design. Discussion.',
              answer: 'It models the shared Iterator.prototype that iterator helpers live on. Built-in iterators extend it. This lets helpers be typed once for all iterators.',
            },
          ],
        },
        {
          q: 'Fix this code. The "using" keyword does not compile.',
          code: `class Conn { close() {} }\nfunction q() {\n  using c = new Conn(); // error\n}`,
          short: 'Implement [Symbol.dispose]() on the class and include esnext.disposable in lib; TS 5.2+.',
          long: `using requires the value to be Disposable: [Symbol.dispose](): void.\nawait using requires AsyncDisposable: [Symbol.asyncDispose](): Promise<void>.\nTS 5.2 added support; lib esnext.disposable declares the symbols.\nRuntime may need a Symbol.dispose polyfill.\nDisposal happens in reverse order at scope exit, even on throw.\nDisposableStack groups dynamic resources.`,
          fix: `class Conn implements Disposable {\n  close() {}\n  [Symbol.dispose]() { this.close(); }\n}\nfunction q() { using c = new Conn(); }`,
          exercises: [
            {
              task: 'Use "await using" with a file handle.',
              description: 'Checks async disposal. Node 22+, tsx.',
              answer: 'Implement [Symbol.asyncDispose]() returning handle.close(). Declare await using h = await openFile(). It closes even if the body throws.',
            },
            {
              task: 'You have several "using" lines. In what order are they cleaned up?',
              description: 'Checks semantics. tsx with logs.',
              answer: 'They dispose in reverse declaration order, like a stack. Errors during disposal aggregate into SuppressedError. This mirrors try/finally nesting.',
            },
          ],
        },
        {
          q: 'Fix this code. A sync generator tries to read an async source.',
          code: `function* lines(stream: AsyncIterable<string>) {
  for await (const l of stream) yield l.trim();
}`,
          fix: `async function* lines(stream: AsyncIterable<string>): AsyncGenerator<string> {
  for await (const l of stream) yield l.trim();
}
for await (const l of lines(src)) console.log(l);`,
          short: 'for await only works in async functions. Make it an async generator, and consume it with for await.',
          long: `A normal generator cannot use await or for await.
\`async function*\` returns an AsyncGenerator; each next() returns a Promise.
Consumers must use for await or call next() and await it.
TS types it as AsyncGenerator<T, TReturn, TNext>.
Pitfall: a sync for-of on an async generator is a type error, since it has Symbol.asyncIterator, not Symbol.iterator.
Strong answer: makes it async and fixes the consumer.
Weak answer: wraps in Promise.all.`,
          follow: 'Which symbol does for await look for?',
          exercises: [
            {
              task: 'Type this async generator that yields numbers and returns a total.',
              description: 'Checks AsyncGenerator type parameters.',
              code: 'async function* nums() { let t = 0; for (const n of [1, 2]) { t += n; yield n; } return t; }',
              answer: 'Use AsyncGenerator<number, number>.',
              solution: 'async function* nums(): AsyncGenerator<number, number> { let t = 0; for (const n of [1, 2]) { t += n; yield n; } return t; }',
            },
            {
              task: 'Why does this not compile?',
              description: 'Checks sync loops on async iterables.',
              code: 'for (const n of nums()) console.log(n);',
              answer: 'An AsyncGenerator is not iterable with for-of. Use for await inside an async function.',
            },
          ],
        },
      ],
      techlead: [
        {
          q: 'Should shared libraries use Symbol.dispose if some users run old runtimes?',
          short: 'Only with an explicit baseline, polyfill strategy and fallback API; protocols must degrade gracefully.',
          long: `Symbol.dispose is undefined in older runtimes without a polyfill.\nTS emits helpers for using but relies on the symbol existing.\nShip explicit close()/dispose() methods alongside the symbol.\nDocument required polyfills in the package README and peer deps.\nTest the package on the lowest supported runtime in CI.\nDecide via ADR, not per-PR.`,
          ai: true,
          exercises: [
            {
              task: 'Write a short decision record for adding "using" support to the library.',
              description: 'Checks decision writing. Discussion.',
              answer: 'Include context (resource leaks), decision (implement Disposable plus close()), consequences (polyfill need, TS 5.2 minimum), and alternatives. Add a CI matrix requirement. Set a review date.',
            },
            {
              task: 'How do you find missing polyfills in production?',
              description: 'Checks operational thinking. Discussion.',
              answer: 'Add feature checks with telemetry at SDK init and fail soft. Monitor error tracking for TypeError on symbol keys. Tie it to browser support dashboards.',
            },
          ],
        },
        {
          q: 'Fix this data stream. Teams forget to clean up, and database connections leak.',
          code: `export async function* streamOrders() { const c = await db.connect(); for await (const r of c.query()) yield r; }`,
          short: 'Ensure cleanup in finally, wrap streams in disposable handles, and expose higher-level helpers so consumers cannot forget teardown.',
          long: `Without finally, early break leaks the connection.\nConsumers that call next() manually never trigger return().\nAdd try/finally with c.release().\nOffer collect/forEachBatch helpers for common use.\nImplement Symbol.asyncDispose on handles for await using.\nAdd review checks for unconsumed async iterators.`,
          fix: `export async function* streamOrders() {\n  const c = await db.connect();\n  try { for await (const r of c.query()) yield r; }\n  finally { await c.release(); }\n}`,
          ai: true,
          exercises: [
            {
              task: 'Write a leak test. Break the loop after one row.',
              description: 'Checks cleanup guarantees. Integration test.',
              answer: 'Count open connections before and after a loop that breaks immediately. With finally the count returns to baseline. Without it, it grows.',
            },
            {
              task: 'What should be public: the generator, a helper, or both?',
              description: 'Checks API design judgement. Discussion.',
              answer: 'Expose helpers as the default path and the generator for advanced users, documented with cleanup rules. Helpers encode safe usage. This reduces leak incidents.',
            },
          ],
        },
        {
          q: 'How do you add branded ID types to a big codebase without stopping feature work?',
          short: 'Start at boundaries (API parsing, routing params), introduce constructors, and expand incrementally with codemods and lint bans on casts.',
          long: `Brands spread; adding one causes many compile errors.\nIntroduce at parse boundaries first, keep internal signatures accepting both temporarily.\nProvide constructors and type guards in one module.\nBan "as UserId" outside that module via lint.\nTrack adoption per package.\nMeasure bug classes avoided (ID mixups) to justify cost.`,
          ai: true,
          exercises: [
            {
              task: 'Plan the first three steps to add a branded org ID.',
              description: 'Checks incremental rollout. Discussion.',
              answer: 'Define the brand and parser, apply it to API response schemas, then switch the most bug-prone functions to require OrgId. Leave others accepting string for now. Tighten over sprints.',
            },
            {
              task: 'Describe a lint rule that stops casts to branded types.',
              description: 'Checks enforcement. Discussion.',
              answer: 'Use no-restricted-syntax with a selector for TSAsExpression whose type is a brand name, excluding the brand module via overrides. Errors guide developers to the parser. It is cheap to maintain.',
            },
          ],
        },
      ],
    },

    'Event Loop': {
      junior: [
        {
          q: 'What does Promise.all return, and how does TypeScript type it?',
          short: 'It returns one promise with an array of results in the same order. TS types it as a tuple, so each position keeps its own type.',
          long: `\`await Promise.all([getUser(), getPosts()])\` gives \`[User, Post[]]\`.
It rejects as soon as any promise rejects; other work keeps running.
TypeScript uses a mapped tuple type with Awaited for each item.
Pitfall: passing an array variable, not a literal, gives an array type instead of a tuple.
Strong answer: knows order, fail-fast, and tuple typing.
Weak answer: thinks it runs promises one by one.`,
          follow: 'What is the difference with Promise.allSettled?',
          exercises: [
            {
              task: 'What are the types of user and posts?',
              description: 'Checks tuple inference.',
              code: `declare function getUser(): Promise<User>;
declare function getPosts(): Promise<Post[]>;
const [user, posts] = await Promise.all([getUser(), getPosts()]);`,
              answer: 'user is User and posts is Post[].',
            },
            {
              task: 'Make these two calls run at the same time.',
              description: 'Checks sequential vs parallel awaits.',
              code: `const a = await loadA();
const b = await loadB();`,
              answer: 'Start both, then await Promise.all.',
              solution: 'const [a, b] = await Promise.all([loadA(), loadB()]);',
            },
          ],
        },
        {
          q: 'Fix this code. The forEach loop does not wait for the async work.',
          code: `async function saveAll(items: Item[]) {\n  items.forEach(async i => { await save(i); });\n  console.log('done');\n}`,
          short: 'forEach ignores returned promises; use for..of with await or Promise.all.',
          long: `forEach calls the callback and discards its Promise.\n'done' logs before saves finish and errors become unhandled.\nUse for..of for sequential work.\nUse await Promise.all(items.map(save)) for parallel work.\nLint rule no-misused-promises catches this pattern.`,
          fix: `async function saveAll(items: Item[]) {\n  await Promise.all(items.map(save));\n  console.log('done');\n}`,
          exercises: [
            {
              task: 'Rewrite it to save items one by one.',
              description: 'Checks sequential pattern. tsx.',
              answer: 'Use for (const i of items) await save(i). Each save completes before the next starts. Use this when order or rate limits matter.',
            },
            {
              task: 'Which lint rule finds the original bug?',
              description: 'Checks tooling. typescript-eslint.',
              answer: '@typescript-eslint/no-misused-promises flags async callbacks where void is expected. no-floating-promises catches unawaited calls. Both require type-aware linting.',
            },
          ],
        },
        {
          q: 'Fix this code. The try/catch does not catch the error from the async call.',
          code: `async function save() {
  try {
    api.post('/save');
  } catch (e) {
    showError(e);
  }
}`,
          fix: `async function save() {
  try {
    await api.post('/save');
  } catch (e) {
    showError(e);
  }
}`,
          short: 'Without await, the promise rejects later, after try has finished. Add await so the rejection is thrown inside try.',
          long: `try/catch only catches errors thrown while the try block runs.
A promise that rejects later becomes an unhandled rejection.
Adding await pauses the function, so the rejection is thrown inside try.
The lint rule no-floating-promises finds this.
Pitfall: \`return api.post()\` inside try also escapes the catch; use \`return await\`.
Strong answer: adds await and mentions return await.
Weak answer: wraps it in another try.`,
          follow: 'Why does `return api.post()` inside try also skip the catch?',
          exercises: [
            {
              task: 'Does the catch run here?',
              description: 'Checks return vs return await.',
              code: 'async function f() { try { return fail(); } catch { return \'caught\'; } }',
              answer: 'No, the promise is returned and rejects later. Use return await.',
            },
            {
              task: 'Which lint rule catches the original bug?',
              description: 'Checks tooling.',
              answer: '@typescript-eslint/no-floating-promises.',
            },
          ],
        },
      ],
      middle: [
        {
          q: 'What does the Awaited type do? When do you need it?',
          short: 'Awaited<T> unwraps promise types recursively, like await does. Awaited<Promise<Promise<number>>> is number.',
          long: `Awaited was added in TS 4.5 to model what await really returns.
It also unwraps thenables and works through unions.
Use it with ReturnType: \`Awaited<ReturnType<typeof fetchUser>>\` gives the resolved data type.
Promise.all and async functions use it inside their types.
Pitfall: writing your own \`T extends Promise<infer U> ? U : T\` only unwraps one level.
Strong answer: shows ReturnType plus Awaited.
Weak answer: does not know it exists.`,
          follow: 'How does Awaited handle a union like Promise<string> | number?',
          exercises: [
            {
              task: 'Get the data type that loadUser resolves to.',
              description: 'Checks Awaited with ReturnType.',
              code: 'async function loadUser() { return { id: 1, name: \'A\' }; }',
              answer: 'Combine Awaited and ReturnType.',
              solution: 'type User = Awaited<ReturnType<typeof loadUser>>;',
            },
            {
              task: 'What is the type T?',
              description: 'Checks unions.',
              code: 'type T = Awaited<Promise<string> | number>;',
              answer: 'string | number.',
            },
          ],
        },
        {
          q: 'Fix this click handler. It hides errors from the promise.',
          code: `button.addEventListener('click', () => { submit(); });`,
          short: 'Handle the promise explicitly with void + catch or an async wrapper that reports errors.',
          long: `submit() returns a Promise that nobody awaits.\nRejections become unhandledrejection events.\nno-floating-promises flags it.\nMark intentional fire-and-forget with void and attach .catch.\nCentralize error reporting in a helper.\nShow user feedback on failure.`,
          fix: `button.addEventListener('click', () => {\n  void submit().catch(reportError);\n});`,
          exercises: [
            {
              task: 'Write a typed helper for promises you do not await.',
              description: 'Checks helper design. tsx.',
              answer: 'Implement fireAndForget(p: Promise<unknown>) { void p.catch(reportError); }. Accept Promise<unknown> to work with any result. Use it in UI handlers.',
            },
            {
              task: 'Set up the no-floating-promises rule so "void" is allowed.',
              description: 'Checks lint config. eslint.',
              answer: 'The rule allows void by default (ignoreVoid: true). Keep it enabled so intent is explicit. Combine with no-misused-promises.',
            },
          ],
        },
        {
          q: 'Fix this code. One failed request loses all results, but we need partial results.',
          code: `const [a, b] = await Promise.all([loadA(), loadB()]); // one failure loses both`,
          short: 'Use Promise.allSettled and narrow each PromiseSettledResult by status.',
          long: `Promise.all rejects on the first failure.\nallSettled returns PromiseSettledResult<T>[] with status 'fulfilled' or 'rejected'.\nNarrowing on status gives value or reason.\nreason is typed any; treat it as unknown.\nTuples keep per-position types.\nDecide per feature whether partial data is acceptable.`,
          fix: `const [a, b] = await Promise.allSettled([loadA(), loadB()]);\nif (a.status === 'fulfilled') use(a.value);\nif (b.status === 'rejected') log(b.reason);`,
          exercises: [
            {
              task: 'Write a type guard that keeps only successful results.',
              description: 'Checks narrowing with filter. tsc.',
              answer: 'const isFulfilled = <T,>(r: PromiseSettledResult<T>): r is PromiseFulfilledResult<T> => r.status === "fulfilled". Filter results and map to value. TS 5.5 can also infer such predicates.',
            },
            {
              task: 'What is the difference between Promise.any and Promise.race?',
              description: 'Checks combinators. node.',
              answer: 'race settles with the first settled promise, even a rejection. any resolves with the first fulfillment and rejects with AggregateError if all fail. Use any for redundant mirrors.',
            },
          ],
        },
      ],
      senior: [
        {
          q: 'How do you cancel async work across many layers? How do you type it?',
          short: 'Thread an optional signal: AbortSignal through every async function, check signal.throwIfAborted(), and pass it to fetch/timers.',
          long: `AbortController/AbortSignal is the standard cancellation primitive.\nAdd { signal?: AbortSignal } to options of async APIs.\nCall signal?.throwIfAborted() between steps.\nAbortSignal.timeout(ms) and AbortSignal.any([...]) compose signals.\nDistinguish abort errors by err.name === 'AbortError'.\nReact Query passes signal to queryFn automatically.`,
          exercises: [
            {
              task: 'Write a sleep function that stops when the signal aborts.',
              description: 'Checks signal plumbing. tsx.',
              answer: 'Create a promise with setTimeout, add an abort listener that clears the timer and rejects with signal.reason. Remove the listener on resolve. Check signal.aborted first.',
            },
            {
              task: 'Combine a user cancel with a five second timeout.',
              description: 'Checks AbortSignal.any. Node 20+.',
              answer: 'AbortSignal.any([controller.signal, AbortSignal.timeout(5000)]). Pass it to fetch. Whichever fires first aborts.',
            },
          ],
        },
        {
          q: 'Fix this long loop. It freezes the page.',
          code: `function processAll(rows: Row[]) { for (const r of rows) heavy(r); }`,
          short: 'Chunk work and yield to the event loop between chunks (scheduler.yield or setTimeout), or move it to a Web Worker.',
          long: `A long task blocks input and paint, hurting INP.\nSplit into chunks of a few ms.\nYield with await scheduler.yield() where supported, fallback to setTimeout.\nMicrotask yields do not help; rendering waits for microtasks.\nFor CPU-heavy work, use a Worker with typed messages.\nMeasure with Performance panel long tasks.`,
          fix: `const yieldToMain = (): Promise<void> => {\n  const s = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;\n  return s?.yield ? s.yield() : new Promise(r => setTimeout(r, 0));\n};\nasync function processAll(rows: Row[]) {\n  let last = performance.now();\n  for (const r of rows) {\n    heavy(r);\n    if (performance.now() - last > 8) { await yieldToMain(); last = performance.now(); }\n  }\n}`,
          exercises: [
            {
              task: 'Why does awaiting a resolved promise not unfreeze the page?',
              description: 'Checks microtask vs paint. Chrome DevTools.',
              answer: 'Microtasks drain before the browser renders or handles input. So the loop effectively remains one long task. A macrotask or scheduler.yield is needed.',
            },
            {
              task: 'Type the messages between the page and a Web Worker.',
              description: 'Checks typed messaging. tsc.',
              answer: 'Define type In = { type: "start"; rows: Row[] } and Out = { type: "progress"; n: number } | { type: "done" }. Use MessageEvent<In> in the worker and narrow on type. Share the types module.',
            },
          ],
        },
        {
          q: 'Fix this retry helper. It retries without any delay and without a limit.',
          code: `async function retry<T>(fn: () => Promise<T>): Promise<T> {
  try { return await fn(); }
  catch { return retry(fn); }
}`,
          fix: `const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
async function retry<T>(fn: () => Promise<T>, tries = 3, delay = 200): Promise<T> {
  try { return await fn(); }
  catch (e) {
    if (tries <= 1) throw e;
    await sleep(delay);
    return retry(fn, tries - 1, delay * 2);
  }
}`,
          short: 'Add a maximum number of tries and an exponential backoff with a delay, and rethrow the last error.',
          long: `Retrying with no delay floods the server and can loop forever.
Use a limit, a growing delay (backoff), and maybe random jitter.
Only retry errors that can succeed later, like network errors or 503, not 400.
Keep T generic so the result type flows to the caller.
Pitfall: retrying non-idempotent POST requests can create duplicates.
Strong answer: limit, backoff, which errors to retry, idempotency.
Weak answer: adds a fixed delay only.`,
          follow: 'Which requests are not safe to retry?',
          exercises: [
            {
              task: 'Add a shouldRetry callback so 4xx errors are not retried.',
              description: 'Checks selective retry.',
              answer: 'Pass a predicate and rethrow when it returns false.',
              solution: `async function retry<T>(fn: () => Promise<T>, shouldRetry: (e: unknown) => boolean, tries = 3): Promise<T> {
  try { return await fn(); }
  catch (e) { if (tries <= 1 || !shouldRetry(e)) throw e; return retry(fn, shouldRetry, tries - 1); }
}`,
            },
            {
              task: 'Why add random jitter to the delay?',
              description: 'Checks distributed thinking.',
              answer: 'Many clients failing at the same time would retry at the same moment. Jitter spreads them out.',
            },
          ],
        },
      ],
      techlead: [
        {
          q: 'How do you handle errors from async code in React components across the app?',
          short: 'Error boundaries do not catch errors from promises. Handle them in the data layer (like TanStack Query error states), and rethrow into a boundary when you want the boundary UI.',
          long: `React error boundaries only catch errors during render, lifecycle and constructors.
Errors in event handlers and effects with promises must be caught by your code.
Data libraries expose error state, and can throw to the nearest boundary with throwOnError.
Add a global unhandledrejection listener for logging.
Pitfall: every component inventing its own try/catch and toast leads to inconsistent UX.
Strong answer: one strategy per error type: inline, toast, boundary, and logging.
Weak answer: "wrap the app in an error boundary".`,
          follow: 'How do you send a promise error to an error boundary?',
          exercises: [
            {
              task: 'Why does the boundary not show here?',
              description: 'Checks boundary limits.',
              code: `function Page() {
  useEffect(() => { fetch('/x').then(() => { throw new Error('x'); }); }, []);
  return null;
}`,
              answer: 'The error happens in a promise after render, so the boundary never sees it.',
            },
            {
              task: 'Show a way to rethrow an async error so the boundary catches it.',
              description: 'Checks a known pattern.',
              answer: 'Store the error in state and throw it during render.',
              solution: `const [err, setErr] = useState<unknown>();
if (err) throw err;
useEffect(() => { load().catch(setErr); }, []);`,
            },
          ],
        },
        {
          q: 'Fix this Node service. Parsing big JSON blocks all other requests.',
          code: `app.post('/import', (req, res) => { const data = JSON.parse(req.body.toString()); process(data); res.send('ok'); });`,
          short: 'Offload parsing/processing to worker_threads or stream-parse, and enforce payload limits.',
          long: `JSON.parse is synchronous and blocks the event loop.\nAll other requests stall during parsing.\nEnforce body size limits first.\nUse streaming parsers or a worker pool (piscina) with typed tasks.\nMonitor event loop lag with perf_hooks.monitorEventLoopDelay.\nReturn 202 and process asynchronously for large imports.`,
          fix: `app.post('/import', limit('5mb'), async (req, res) => {\n  const result = await pool.run(req.body, { name: 'parseAndProcess' });\n  res.json(result);\n});`,
          ai: true,
          exercises: [
            {
              task: 'Add event loop delay monitoring with alerts.',
              description: 'Checks observability. Node perf_hooks.',
              answer: 'Create monitorEventLoopDelay({ resolution: 20 }), enable it, and export p99 to metrics periodically. Alert above a threshold like 200ms. This catches blocking regressions.',
            },
            {
              task: 'Type the input and output of the worker task.',
              description: 'Checks typed boundaries. tsc.',
              answer: 'Define ImportTask and ImportResult types shared by main and worker. Validate input inside the worker with a schema. Transfer buffers to avoid copying.',
            },
          ],
        },
        {
          q: 'How do you track page response time to clicks, called INP, as a team metric?',
          short: 'Collect field INP with web-vitals attribution, set budgets, attribute long tasks to code, and gate regressions.',
          long: `INP measures input delay plus processing plus presentation.\nUse web-vitals onINP with attribution to find slow handlers.\nSend to analytics with route and component tags.\nSet budgets (p75 < 200ms) per key page.\nFix patterns: chunking, deferring non-urgent work, startTransition.\nReview trends in team rituals, not just incidents.`,
          ai: true,
          exercises: [
            {
              task: 'Write code that sends INP data to a server.',
              description: 'Checks implementation. web-vitals package.',
              answer: 'Import onINP from web-vitals/attribution, and in the callback send metric.value and attribution.interactionTarget via navigator.sendBeacon. Type the payload. Sample to control volume.',
            },
            {
              task: 'You have three slow pages and little time. Which do you fix first?',
              description: 'Checks prioritization. Discussion.',
              answer: 'Rank by user impact: traffic times excess latency. Fix the highest-traffic pages first, prefer cheap fixes like deferring analytics work. Re-measure after each fix.',
            },
          ],
        },
      ],
    },

    'Performance Optimization': {
      junior: [
        {
          q: 'What is the difference between tsc and tools like esbuild or Vite for TypeScript?',
          short: 'esbuild, SWC and Vite only remove types and do not type-check. tsc checks types and can also emit code. Most projects use a fast transpiler plus tsc --noEmit.',
          long: `Transpilers handle each file alone, so they are very fast.
They cannot report type errors, and they need isolatedModules-safe code.
Run tsc --noEmit in CI and in the editor to catch type errors.
Pitfall: "the dev server works" does not mean the types are correct.
Strong answer: explains the split and the isolatedModules link.
Weak answer: thinks Vite reports type errors.`,
          follow: 'Why do transpilers need isolatedModules?',
          exercises: [
            {
              task: 'Does Vite fail to build this code?',
              description: 'Checks that bundlers skip type checks.',
              code: 'const n: number = \'text\';',
              answer: 'No, Vite builds it. Only tsc reports the error.',
            },
            {
              task: 'Add a type check to this package.json.',
              description: 'Checks scripts.',
              code: '{ "scripts": { "build": "vite build" } }',
              answer: 'Add a typecheck script with tsc --noEmit and run it in CI.',
              solution: '{ "scripts": { "build": "vite build", "typecheck": "tsc --noEmit" } }',
            },
          ],
        },
        {
          q: 'Fix this config. The compiler also checks the build output folder.',
          code: `{ "compilerOptions": { "outDir": "dist" } }`,
          short: 'Set include to source folders and exclude dist/coverage so tsc does not process generated files.',
          long: `Without include, tsc includes all .ts files under the folder.\nGenerated .d.ts in dist may get re-checked or cause duplicates.\nAdd "include": ["src"].\nexclude only filters include results; it does not stop imports.\nUse separate tsconfig for tests if needed.\nVerify with tsc --listFilesOnly.`,
          fix: `{\n  "compilerOptions": { "outDir": "dist" },\n  "include": ["src"],\n  "exclude": ["dist", "coverage"]\n}`,
          exercises: [
            {
              task: 'List all files the compiler includes.',
              description: 'Checks diagnostics. tsc --listFilesOnly.',
              answer: 'Run tsc --listFilesOnly and look for unexpected paths. Adjust include accordingly. Fewer files means faster checks.',
            },
            {
              task: 'Why are excluded files sometimes still checked?',
              description: 'Checks module resolution. Discussion.',
              answer: 'If an included file imports an excluded file, tsc follows the import and checks it. exclude only affects initial globbing. Remove the import to drop it.',
            },
          ],
        },
        {
          q: 'Fix this import. It adds the whole library to the bundle.',
          code: `import _ from 'lodash';\nconst x = _.debounce(fn, 100);`,
          short: 'Use ESM per-function imports (lodash-es named import) so bundlers tree-shake unused code.',
          long: `Default-importing CommonJS lodash includes the whole library.\nlodash-es is ESM and tree-shakable.\nNamed imports let the bundler drop unused exports.\nTS types are provided by @types/lodash-es.\nVerify with a bundle analyzer.\nPrefer native APIs when available.`,
          fix: `import { debounce } from 'lodash-es';\nconst x = debounce(fn, 100);`,
          exercises: [
            {
              task: 'Measure the bundle size before and after.',
              description: 'Checks tooling. rollup-plugin-visualizer or vite build.',
              answer: 'Build both versions and compare chunk sizes in the visualizer. The ESM named import is much smaller. Record results in the PR.',
            },
            {
              task: 'What does verbatimModuleSyntax change for imports?',
              description: 'Checks TS emit. tsc.',
              answer: 'Imports without type modifier are kept as written; type-only imports must use import type. This makes elision predictable for bundlers. It replaces importsNotUsedAsValues.',
            },
          ],
        },
      ],
      middle: [
        {
          q: 'What is incremental build? What is the tsbuildinfo file for?',
          short: 'incremental saves program state to .tsbuildinfo so subsequent tsc runs only re-check changed files and dependents.',
          long: `"incremental": true writes .tsbuildinfo after compile.\nNext runs compare file hashes and skip unchanged work.\ncomposite implies incremental for project references.\nCache the file in CI to benefit across runs.\nWorks with noEmit since TS 4.0.\nDelete it if state becomes corrupt.`,
          exercises: [
            {
              task: 'Turn on incremental. Measure two runs in a row.',
              description: 'Checks speedup. tsc --noEmit --incremental --extendedDiagnostics.',
              answer: 'The second run is significantly faster. The tsbuildinfo file stores hashes and diagnostics. Commit nothing; cache it in CI.',
            },
            {
              task: 'Change where the tsbuildinfo file is saved.',
              description: 'Checks config. tsconfig.',
              answer: 'Set "tsBuildInfoFile": "node_modules/.cache/tsbuildinfo". It keeps the repo clean and is easy to cache. Ignore it in git.',
            },
          ],
        },
        {
          q: 'Fix this code. A type re-export breaks the build with isolatedModules.',
          code: `// index.ts
import { User, createUser } from './user';
export { User, createUser };`,
          fix: `// index.ts
export type { User } from './user';
export { createUser } from './user';`,
          short: 'User is only a type. A file-by-file transpiler cannot know that, so it keeps the export and fails at runtime. Use export type.',
          long: `With isolatedModules (or verbatimModuleSyntax), TS reports "Re-exporting a type requires export type".
The transpiler sees one file and cannot tell if User is a value.
\`export type\` and \`import type\` are always removed from output.
This also keeps bundles smaller and avoids side-effect imports.
Pitfall: inline \`import { type User }\` still keeps the import line under verbatimModuleSyntax if other values are imported.
Strong answer: explains why the transpiler needs the hint.
Weak answer: turns off isolatedModules.`,
          follow: 'What does verbatimModuleSyntax change?',
          exercises: [
            {
              task: 'Fix this re-export so it works with verbatimModuleSyntax.',
              description: 'Checks export type with star exports.',
              code: 'export * from \'./types\'; // types.ts only has types',
              answer: 'Use export type * (TS 5.0+) for type-only modules.',
              solution: 'export type * from \'./types\';',
            },
            {
              task: 'Which lint rule adds type keywords for you?',
              description: 'Checks tooling.',
              answer: '@typescript-eslint/consistent-type-imports and consistent-type-exports.',
            },
          ],
        },
        {
          q: 'Fix this index file. It slows down tests and the dev server.',
          code: `// src/components/index.ts\nexport * from './Button';\nexport * from './Table';\n// ... 200 exports\nimport { Button } from '@/components';`,
          short: 'Import from concrete modules (or use package exports subpaths) so tools do not load and transform every module.',
          long: `export * barrels force bundlers and test runners to evaluate all re-exported modules.\nVite dev and Vitest transform every file in the chain.\nTree-shaking in prod may work, but dev time suffers.\nImport directly: '@/components/Button'.\nLint with no-restricted-imports or eslint-plugin-barrel-files.\nKeep barrels only at package public boundaries.`,
          fix: `import { Button } from '@/components/Button';`,
          exercises: [
            {
              task: 'Measure test time before and after you remove the index imports.',
              description: 'Checks impact. vitest with timings.',
              answer: 'Compare import/transform time in the Vitest summary. Direct imports reduce modules loaded per test file. Document the improvement.',
            },
            {
              task: 'Write a lint config that bans importing from the index file.',
              description: 'Checks enforcement. eslint.',
              answer: 'Use no-restricted-imports with paths: [{ name: "@/components", message: "Import from the component file" }]. Fix existing imports with a codemod. CI enforces it.',
            },
          ],
        },
      ],
      senior: [
        {
          q: 'How does isolatedDeclarations make monorepo builds faster?',
          short: 'isolatedDeclarations requires exported APIs to be explicitly annotated so .d.ts can be generated per file without type-checking, enabling parallel tools.',
          long: `Normally .d.ts emit needs the full checker to infer types.\nWith isolatedDeclarations (TS 5.5), every export must have explicit types.\nTools (oxc, swc, tsc) can emit declarations file-by-file in parallel.\nDownstream packages can start type-checking earlier.\nIt also speeds checking since inference results are simpler.\nCost: more annotations; quick fixes in editors help.`,
          exercises: [
            {
              task: 'Turn on isolatedDeclarations in one package. Fix the errors.',
              description: 'Checks adoption. tsc --isolatedDeclarations --declaration.',
              answer: 'Errors appear on exports lacking explicit types. Use the editor quick fix to add annotations. The package then supports fast declaration emit.',
            },
            {
              task: 'Why do inferred return types slow down type checking?',
              description: 'Checks compiler reasoning. Discussion.',
              answer: 'Consumers must compute the inferred type from the implementation, which may involve deep generic instantiation. An explicit annotation is a cache the checker can trust. It also stabilizes public API.',
            },
          ],
        },
        {
          q: 'Fix this project setup. Every change rebuilds everything.',
          code: `// root tsconfig.json\n{ "include": ["packages/*/src"] }`,
          short: 'Make each package composite with its own tsconfig and reference dependencies; run tsc -b from a references-only root.',
          long: `A single include of all packages is one giant program.\nAny change invalidates checks across the repo.\nEach package: composite: true, declaration: true, references to deps.\nRoot tsconfig: files: [] and references to all packages.\ntsc -b builds in dependency order and skips up-to-date projects.\nCache tsbuildinfo and outputs in CI.`,
          fix: `// root\n{ "files": [], "references": [{ "path": "packages/core" }, { "path": "packages/app" }] }\n// packages/app/tsconfig.json\n{ "compilerOptions": { "composite": true }, "references": [{ "path": "../core" }] }`,
          exercises: [
            {
              task: 'Check that only changed projects rebuild.',
              description: 'Checks build mode. tsc -b --verbose.',
              answer: 'Verbose output prints which projects are up to date. Change one file in app; core stays up to date. That proves isolation.',
            },
            {
              task: 'Why does "tsc -p" on the root do nothing useful here?',
              description: 'Checks references semantics. tsc.',
              answer: 'With files: [] the root program is empty; -p does not follow references. Only -b (build mode) traverses them. Use tsc -b for typecheck.',
            },
          ],
        },
        {
          q: 'Fix this generic function. It creates too much work for the type checker.',
          code: `function pipe<T extends readonly ((x: any) => any)[]>(...fns: T): (x: Parameters<T[0]>[0]) => ReturnType<Last<T>> { ... }`,
          short: 'Replace deeply computed generics with fixed overloads or simpler signatures; measure instantiation counts.',
          long: `Variadic tuple + conditional types on every call can cause heavy instantiations.\nextendedDiagnostics shows Instantiation count.\nOverloads for 1..10 functions are cheaper and give clearer errors.\nAvoid recomputing Parameters/ReturnType chains for each element.\nfp-ts and RxJS use overloads for pipe for this reason.\nKeep a type-performance test (e.g. @ark/attest) in CI.`,
          fix: `function pipe<A, B>(f1: (a: A) => B): (a: A) => B;\nfunction pipe<A, B, C>(f1: (a: A) => B, f2: (b: B) => C): (a: A) => C;\nfunction pipe(...fns: Array<(x: unknown) => unknown>) { return (x: unknown) => fns.reduce((v, f) => f(v), x); }`,
          exercises: [
            {
              task: 'Compare the instantiation count for both versions.',
              description: 'Checks measurement. tsc --extendedDiagnostics.',
              answer: 'Run the checker on a file with many pipe calls and compare Instantiations. Overloads are usually far lower. Use the number to justify the change.',
            },
            {
              task: 'Add a test that fails if type checking gets slower.',
              description: 'Checks CI guard. @ark/attest bench.',
              answer: 'Use attest bench with .types() to assert an instantiation budget for a sample call. CI fails if the budget is exceeded. This prevents regressions.',
            },
          ],
        },
      ],
      techlead: [
        {
          q: 'TypeScript is getting a new native compiler written in Go. How do you prepare for it?',
          short: 'Evaluate the native compiler (tsgo) in CI and editors early, track compatibility gaps, and keep JS API-dependent tools on tsc until parity.',
          long: `Microsoft is porting the compiler to Go (TypeScript 7), with large speedups reported.\nTS 6 is a bridge release with deprecations aligning with TS 7.\nTools using the compiler API (typed lint, codegen) may lag.\nRun tsgo in CI as a parallel non-blocking job to compare diagnostics.\nAddress deprecations (e.g. old module resolution modes) now.\nSwitch blocking checks once parity is proven.`,
          ai: true,
          exercises: [
            {
              task: 'Design a CI test that compares the old and new compilers.',
              description: 'Checks evaluation approach. Discussion.',
              answer: 'Run both on the same commits, record duration and diff diagnostics. Track mismatches as issues. Promote tsgo when diffs are zero for a period.',
            },
            {
              task: 'Which tools may break during this switch?',
              description: 'Checks dependency awareness. Discussion.',
              answer: 'typescript-eslint typed rules, ts-morph codegen, custom transformers and editor plugins rely on the JS API. Each needs a compatibility plan. Keep tsc available for them.',
            },
          ],
        },
        {
          q: 'Fix this setup. Every package copies the same tsconfig settings, and they slowly become different.',
          code: `// packages/a/tsconfig.json
{ "compilerOptions": { "strict": true, "target": "ES2022" } }
// packages/b/tsconfig.json
{ "compilerOptions": { "strict": false, "target": "ES2017" } }`,
          fix: `// tsconfig.base.json
{ "compilerOptions": { "strict": true, "target": "ES2022", "skipLibCheck": true } }
// packages/a/tsconfig.json
{ "extends": "../../tsconfig.base.json", "include": ["src"] }`,
          short: 'Put shared options in a base tsconfig and use extends. Packages only add what is really different.',
          long: `Copied configs drift, so packages get different strictness and targets.
A base config, or a shared package like @acme/tsconfig, keeps one source.
Since TS 5.0, extends can take an array of configs.
Paths like include and outDir are relative to the config that defines them, so keep them per package.
Pitfall: overriding strict in one package hides bugs that appear when code moves.
Strong answer: base config, small overrides, and a check in CI.
Weak answer: keeps copies and syncs them in reviews.`,
          follow: 'Why should include and outDir stay in each package config?',
          exercises: [
            {
              task: 'Extend two shared configs in one package.',
              description: 'Checks the TS 5.0 array extends.',
              answer: 'Use an array in extends; later configs win.',
              solution: '{ "extends": ["@acme/tsconfig/base.json", "@acme/tsconfig/react.json"], "include": ["src"] }',
            },
            {
              task: 'How do you see the final options after extends?',
              description: 'Checks tooling.',
              answer: 'Run tsc --showConfig in the package.',
            },
          ],
        },
        {
          q: 'How do you measure type-check time and keep it from growing over months?',
          short: 'Record tsc --extendedDiagnostics in CI, track check time per package, and alert on big jumps. Use --generateTrace to find the cause.',
          long: `extendedDiagnostics prints check time, memory and the number of types.
Save these numbers from CI runs and plot them over time.
Set a budget, like "check time may not grow more than 20 percent in one PR".
When it jumps, run --generateTrace and @typescript/analyze-trace.
Pitfall: CI machines vary, so compare type counts too, not only seconds.
Strong answer: measures, budgets, and has a way to debug.
Weak answer: waits until people complain.`,
          follow: 'Why is the number of instantiated types a useful metric?',
          exercises: [
            {
              task: 'Which tsc flags do you use to find a slow file?',
              description: 'Checks diagnostics tools.',
              answer: '--extendedDiagnostics for totals, --generateTrace for details, then analyze-trace.',
            },
            {
              task: 'Write a CI rule for type-check time.',
              description: 'Checks policy.',
              answer: 'Save diagnostics each run; fail or warn if check time or instantiations grow over a set budget versus main.',
            },
          ],
        },
      ],
    },

    'Advanced Strategies and Integration': {
      junior: [
        {
          q: 'What is the difference between unknown and any?',
          short: 'any disables type checking; unknown accepts any value but must be narrowed before use.',
          long: `any spreads silently and hides bugs.\nunknown is the type-safe top type.\nYou must narrow unknown with typeof, instanceof or guards.\ncatch variables are unknown under useUnknownInCatchVariables (strict).\nPrefer unknown for external data and JSON.\nLint with no-explicit-any.`,
          exercises: [
            {
              task: 'Get the message from an unknown error in a catch block.',
              description: 'Checks narrowing. tsc --strict.',
              answer: 'Use err instanceof Error ? err.message : String(err). Direct err.message errors on unknown. This handles non-Error throws.',
            },
            {
              task: 'JSON.parse returns any. How do you make it safer?',
              description: 'Checks awareness. Discussion.',
              answer: 'The lib types it as any for compatibility. Assign to unknown and validate with a schema. ts-reset changes it to unknown globally.',
            },
          ],
        },
        {
          q: 'Fix this code. The Role type should be a union of the two values.',
          code: `const ROLES = ['admin', 'user'];\ntype Role = typeof ROLES[number]; // string`,
          short: 'Add as const so the array is a readonly tuple of literals and the derived type becomes a union.',
          long: `Without as const the array widens to string[].\nas const makes readonly ['admin', 'user'].\ntypeof ROLES[number] then gives 'admin' | 'user'.\nYou get runtime values and types from one source.\nUse it instead of enums in many cases.\nCombine with satisfies to validate shape.`,
          fix: `const ROLES = ['admin', 'user'] as const;\ntype Role = typeof ROLES[number]; // 'admin' | 'user'`,
          exercises: [
            {
              task: 'Write a type guard that checks if a string is a Role.',
              description: 'Checks guards with as const. tsc.',
              answer: 'Use (ROLES as readonly string[]).includes(x) in a function returning x is Role. The cast is needed since includes expects Role. The guard narrows x.',
            },
            {
              task: 'Use satisfies to check a config object with one key per role.',
              description: 'Checks satisfies. tsc 4.9+.',
              answer: 'const perms = { admin: [...], user: [...] } satisfies Record<Role, string[]>. Missing keys error and literal types are kept. Unlike annotation, inference is not widened.',
            },
          ],
        },
        {
          q: 'Fix this path alias. It works in the editor but fails when the code runs.',
          code: `// tsconfig: "paths": { "@/*": ["src/*"] }\nimport { api } from '@/api'; // Node: Cannot find package '@/api'`,
          short: 'paths only affects type resolution; configure the bundler/runtime too (Vite alias, package.json imports, or tsconfig-paths).',
          long: `tsc does not rewrite import paths in output.\nThe runtime or bundler must resolve the alias.\nVite: vite-tsconfig-paths or resolve.alias.\nNode: prefer package.json "imports" with #src/* (subpath imports).\nTS supports subpath imports with moduleResolution node16/nodenext/bundler.\nKeep one source of truth.`,
          fix: `// package.json\n{ "imports": { "#/*": "./src/*" } }\nimport { api } from '#/api.js';`,
          exercises: [
            {
              task: 'Set up Vite so it uses the tsconfig path aliases.',
              description: 'Checks tooling. vite.config.ts.',
              answer: 'Add vite-tsconfig-paths plugin or resolve.alias { "@": path.resolve("src") }. Restart the dev server. Imports then resolve at runtime.',
            },
            {
              task: 'Why are package imports better for Node packages?',
              description: 'Checks standards. Discussion.',
              answer: 'They are a Node standard understood by runtime, bundlers and TS without extra plugins. paths is TS-only. Fewer moving parts.',
            },
          ],
        },
      ],
      middle: [
        {
          q: 'How do you get TypeScript types from a runtime schema, like zod? Why do it?',
          short: 'Define the schema once and use z.infer<typeof Schema> for the type, so validation and types never drift.',
          long: `Hand-written interfaces plus separate validation drift apart.\nSchema-first: const User = z.object({...}); type User = z.infer<typeof User>.\nparse throws; safeParse returns a discriminated result.\nz.input vs z.output differ with transforms.\nValidate at boundaries (API, storage, URL params).\nStandard Schema lets libraries accept any compatible validator.`,
          exercises: [
            {
              task: 'Validate an API response. Handle errors without throwing.',
              description: 'Checks safeParse. tsx with zod.',
              answer: 'const r = User.safeParse(json); if (!r.success) report(r.error); else use(r.data). r.data is typed User. Errors include paths.',
            },
            {
              task: 'Explain input and output types with a date transform.',
              description: 'Checks transforms. tsc.',
              answer: 'z.string().transform(s => new Date(s)) has input string and output Date. Forms often need the input type; consumers need output. Choose deliberately.',
            },
          ],
        },
        {
          q: 'Fix this type file. Our new env variable type is not used.',
          code: `// types/env.d.ts\nimport 'vite/client';\ninterface ImportMetaEnv { VITE_API_URL: string }`,
          short: 'Inside a module file, augmentations of globals must be wrapped in declare global, or keep the file a script without imports.',
          long: `A top-level import turns the .d.ts into a module.\nDeclarations then become module-scoped, not global merges.\nWrap with declare global { interface ImportMetaEnv {...} }.\nOr use /// <reference types="vite/client" /> to keep it a script.\nEnsure the file is in include.\nAdd readonly for env values.`,
          fix: `/// <reference types="vite/client" />\ninterface ImportMetaEnv { readonly VITE_API_URL: string }\ninterface ImportMeta { readonly env: ImportMetaEnv }`,
          exercises: [
            {
              task: 'Add a typed analytics field to the global window object.',
              description: 'Checks declare global. tsc.',
              answer: 'In a module file write declare global { interface Window { analytics?: Analytics } } plus export {}. The property becomes available on window. Keep it optional if not always present.',
            },
            {
              task: 'Add a new color to the theme type of a library like MUI.',
              description: 'Checks module augmentation. tsc.',
              answer: 'declare module "@mui/material/styles" { interface Palette { brand: PaletteColor } }. The file must import the module. Interfaces merge.',
            },
          ],
        },
        {
          q: 'Fix this code. An npm package has no types, so the import fails.',
          code: `import slugify from 'tiny-slug';
// Could not find a declaration file for module 'tiny-slug'`,
          fix: `// src/types/tiny-slug.d.ts
declare module 'tiny-slug' {
  export default function slugify(text: string, sep?: string): string;
}
// app code
import slugify from 'tiny-slug';`,
          short: 'Check for @types/tiny-slug first. If there is none, write a small declaration file with declare module.',
          long: `Many packages ship types, others have them in DefinitelyTyped as @types/name.
If neither exists, add a .d.ts file with \`declare module 'name'\` and type only what you use.
A quick \`declare module 'name';\` makes everything any, which is a temporary escape only.
Make sure the .d.ts is in the tsconfig include.
Pitfall: a .d.ts file with a top-level import becomes a module and changes how declare module works.
Strong answer: tries @types, then writes a narrow declaration.
Weak answer: uses @ts-ignore on the import.`,
          follow: 'What is the risk of the short `declare module \'x\';` form?',
          exercises: [
            {
              task: 'Write types for a CSS module import.',
              description: 'Checks wildcard module declarations.',
              answer: 'Declare a module pattern for *.module.css.',
              solution: `declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}`,
            },
            {
              task: 'Why is the declaration ignored here?',
              description: 'Checks include settings.',
              code: '{ "include": ["src/app"] } // file is in src/types/tiny-slug.d.ts',
              answer: 'The types folder is outside include, so TS never reads the file.',
            },
          ],
        },
      ],
      senior: [
        {
          q: 'How do you create API types from an OpenAPI file? How do you use them in a client?',
          short: 'Use openapi-typescript to generate path types and openapi-fetch (or similar) so calls are typed by path and method; regenerate in CI.',
          long: `openapi-typescript emits a paths interface from the spec.\nopenapi-fetch uses it: client.GET('/users/{id}', { params: { path: { id } } }).\nResponse and error types come from the spec.\nRun generation in CI and fail if the output differs (drift check).\nVersion the spec alongside the backend.\nAdd runtime validation where the backend is untrusted.`,
          exercises: [
            {
              task: 'Add a CI check. It fails when generated types are out of date.',
              description: 'Checks pipeline. GitHub Actions.',
              answer: 'Run the generator, then git diff --exit-code on the output. Failure means types are stale. Developers regenerate and commit.',
            },
            {
              task: 'Compare openapi-typescript and orval.',
              description: 'Checks tool choice. Discussion.',
              answer: 'openapi-typescript emits types only and pairs with a tiny runtime client. orval generates full clients and React Query hooks. Choose based on how much generated runtime code you accept.',
            },
          ],
        },
        {
          q: 'Fix this generic hook. The wrong default value does not cause an error.',
          code: `function useSelect<T>(options: T[], initial: T) { /* ... */ }\nuseSelect(['a', 'b'], 'c'); // T becomes string, no error`,
          short: 'Wrap the secondary parameter in NoInfer<T> (TS 5.4) so T is inferred only from options.',
          long: `TS infers T from all candidate positions.\n'c' widens T to include it, hiding the bug.\nNoInfer<T> excludes a position from inference.\nWith a const type parameter, literals are kept.\nResult: initial must be one of the options.\nUseful in hooks, defaults and fallback params.`,
          fix: `function useSelect<const T extends string>(options: readonly T[], initial: NoInfer<T>) { /* ... */ }\nuseSelect(['a', 'b'], 'c'); // error`,
          exercises: [
            {
              task: 'What does a const type parameter add here?',
              description: 'Checks TS 5.0 feature. Playground.',
              answer: 'const T infers literal types as if as const was written. Without it T would widen to string. Together with NoInfer the check becomes precise.',
            },
            {
              task: 'How did people solve this before TypeScript 5.4?',
              description: 'Checks historical patterns. tsc.',
              answer: 'Use a second type parameter: <T, U extends T>(options: T[], initial: U), or the T & {} trick to lower inference priority. NoInfer is the clean replacement. Mention the version requirement.',
            },
          ],
        },
        {
          q: 'Fix this library package. Users get wrong types for ESM and CommonJS.',
          code: `// package.json\n{ "main": "dist/index.js", "module": "dist/index.mjs", "types": "dist/index.d.ts" }`,
          short: 'Use an exports map with per-condition types (import → .d.ts for ESM, require → .d.cts) and validate with arethetypeswrong.',
          long: `With moduleResolution node16/nodenext/bundler, TS reads exports.\nOne .d.ts for both formats misrepresents CJS vs ESM (masquerading).\nEmit separate declaration files for each format alongside JS.\nPut types first inside each condition.\nRun npx @arethetypeswrong/cli on the packed tarball.\nOr ship ESM-only if consumers allow (Node 22 require(esm)).`,
          fix: `{\n  "type": "module",\n  "exports": {\n    ".": {\n      "import": { "types": "./dist/index.d.ts", "default": "./dist/index.js" },\n      "require": { "types": "./dist/index.d.cts", "default": "./dist/index.cjs" }\n    }\n  }\n}`,
          exercises: [
            {
              task: 'Run arethetypeswrong. Explain the result.',
              description: 'Checks validation. npm pack && npx @arethetypeswrong/cli *.tgz.',
              answer: 'It shows a matrix per resolution mode with problems like FalseCJS or Masquerading as ESM. Fix exports until all green. Add it to CI.',
            },
            {
              task: 'Pick a build tool that outputs both ESM and CommonJS.',
              description: 'Checks tooling. Discussion.',
              answer: 'tsup or tsdown emit both formats and matching declaration files. Configure dts: true and format: ["esm", "cjs"]. Verify with attw.',
            },
          ],
        },
      ],
      techlead: [
        {
          q: 'How do you manage @ts-ignore and @ts-expect-error comments in a big codebase?',
          short: 'Ban @ts-ignore and allow @ts-expect-error only with a description. Track the count, and remove them when the cause is fixed.',
          long: `@ts-ignore hides any error, even new ones, and stays forever.
@ts-expect-error fails when the error goes away, so it cleans itself up.
The lint rule ban-ts-comment can require a description of at least some length.
Count suppressions in CI and make the number go down, like a ratchet.
Pitfall: a suppression on a line hides every error on that line, not only the expected one.
Strong answer: policy, lint rule, tracking, and ownership.
Weak answer: allows them freely to keep shipping.`,
          follow: 'Why is @ts-expect-error safer than @ts-ignore?',
          exercises: [
            {
              task: 'Configure the lint rule for these comments.',
              description: 'Checks ban-ts-comment.',
              answer: 'Ban ts-ignore and require a description for ts-expect-error.',
              solution: `"@typescript-eslint/ban-ts-comment": ["error", {
  "ts-ignore": true,
  "ts-expect-error": "allow-with-description",
  "minimumDescriptionLength": 10
}]`,
            },
            {
              task: 'What happens when the bug under this comment is fixed?',
              description: 'Checks behavior.',
              code: `// @ts-expect-error lib types are wrong, see issue 123
lib.call(1);`,
              answer: 'tsc reports "Unused @ts-expect-error directive", so the comment must be removed.',
            },
          ],
        },
        {
          q: 'Fix this monorepo import. Packages import each other with long relative paths.',
          code: `import { formatDate } from '../../../packages/utils/src/date';`,
          short: 'Consume packages by name via workspace dependencies and exports maps; enforce boundaries with lint and project references.',
          long: `Relative cross-package imports bypass package boundaries and build order.\nThey break when packages are published or moved.\nDeclare workspace:* dependencies and import '@org/utils/date'.\nExpose public API via exports; keep internals private.\nUse eslint boundaries or Nx module boundary rules.\nProject references give correct incremental builds.`,
          fix: `// apps/web/package.json\n{ "dependencies": { "@org/utils": "workspace:*" } }\nimport { formatDate } from '@org/utils/date';`,
          ai: true,
          exercises: [
            {
              task: 'Write a lint config that bans relative imports between packages.',
              description: 'Checks enforcement. eslint.',
              answer: 'Use no-restricted-imports with a pattern like "**/packages/*/src/**" or eslint-plugin-boundaries. Fail CI. Provide a codemod to fix existing imports.',
            },
            {
              task: 'How can you use package source code in dev without building it first?',
              description: 'Checks dev ergonomics. Discussion.',
              answer: 'Use a custom exports condition (e.g. "development": "./src/index.ts") and set customConditions in tsconfig and the bundler. Production resolves built dist. This keeps fast dev and correct boundaries.',
            },
          ],
        },
        {
          q: 'How do you turn on stricter compiler flags in a large codebase?',
          short: 'Enable flags incrementally per package or file with tooling that tracks and blocks new errors, while burning down legacy errors.',
          long: `Flags: strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes.\nFlipping flags globally creates thousands of errors.\nEnable per package via tsconfig overrides, or per file with typescript-strict-plugin.\nBlock new errors in CI; allow known ones temporarily via a baseline.\nPrioritize flags by bug-catching value.\nCommunicate timelines and share fix patterns.`,
          ai: true,
          exercises: [
            {
              task: 'In what order do you turn on the flags? Explain why.',
              description: 'Checks prioritization. Discussion.',
              answer: 'strictNullChecks first for biggest bug reduction, then noImplicitAny, then noUncheckedIndexedAccess, and exactOptionalPropertyTypes last since it is noisy. Each step is measured by errors found. Adjust based on incident data.',
            },
            {
              task: 'Design a CI check that blocks only new strict errors.',
              description: 'Checks tooling design. Discussion.',
              answer: 'Run tsc with strict flags, normalize errors into a file:code list, and diff against a committed baseline. New entries fail CI; removed entries shrink the baseline. Tools like betterer automate this.',
            },
          ],
        },
      ],
    },
  },
};
