export default {
  TypeScript: {
    'Class, Prototyping': {
      junior: [
        {
          q: 'What is a parameter property in a class constructor?',
          short: 'Adding an access modifier (public/private/protected/readonly) to a constructor parameter declares and assigns a class field in one step.',
          long: `constructor(private name: string) {} is shorthand for declaring a field and assigning this.name = name.\nIt works with public, private, protected and readonly.\nIt is TS-only syntax that emits real JS assignments, so it is not erasable.\nWith --erasableSyntaxOnly (TS 5.8) or Node type stripping it is rejected.\nMany teams still use it for DI-heavy code (Angular, NestJS).\nPrefer explicit fields when targeting type-stripping runtimes.`,
          exercises: [
            {
              task: 'Rewrite this class. Use normal fields instead of parameter properties.',
              description: 'Checks understanding of what the shorthand emits. Run with tsc and compare output JS.',
              code: `class User { constructor(public id: number, private readonly email: string) {} }`,
              answer: 'Declare id: number and private readonly email: string as fields and assign them in the constructor body. The emitted JS is identical in behavior. The explicit form also passes erasableSyntaxOnly.',
              solution: `class User {\n  id: number;\n  private readonly email: string;\n  constructor(id: number, email: string) { this.id = id; this.email = email; }\n}`,
            },
            {
              task: 'Can you change a readonly field inside a method? Explain.',
              description: 'Checks readonly semantics. Paste into the TS playground.',
              answer: 'No. readonly fields may only be assigned in the declaration or the constructor. Assigning in a method gives error TS2540. At runtime nothing prevents mutation; it is compile-time only.',
            },
          ],
        },
        {
          q: 'Fix this error. A field has no starting value.',
          code: `class Counter {\n  count: number;\n  label: string;\n  constructor() { this.label = 'c'; }\n}`,
          short: 'Under strictPropertyInitialization every non-optional field must be initialized in the declaration or constructor.',
          long: `strict enables strictPropertyInitialization.\ncount is never assigned, so TS2564 is reported.\nFix by giving a default, assigning in the constructor, or making it optional.\nThe definite assignment assertion (count!: number) silences the check but is unsafe.\nUse ! only when a framework guarantees initialization (e.g. lifecycle hooks).`,
          fix: `class Counter {\n  count = 0;\n  label: string;\n  constructor() { this.label = 'c'; }\n}`,
          exercises: [
            {
              task: 'Fix three fields. Use a different way for each one.',
              description: 'Checks the options for initialization. Run tsc --strict.',
              code: `class A { a: number; b: string; c: Date; }`,
              answer: 'Use a default (a = 0), an optional modifier (b?: string), and constructor assignment for c. Each satisfies strictPropertyInitialization. Avoid ! unless initialization is guaranteed externally.',
              solution: `class A { a = 0; b?: string; c: Date; constructor() { this.c = new Date(); } }`,
            },
            {
              task: 'When is the exclamation mark on a field okay to use?',
              description: 'Checks judgement on assertions. Discussion.',
              answer: 'It is acceptable when something outside the constructor reliably assigns the field before use, like Angular @ViewChild or an init() called by a framework. It disables a safety check, so a reviewer should see a reason. Prefer redesigning to constructor injection.',
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
          q: 'Fix this code. A typo in the child class creates a new method by mistake.',
          code: `class Base { render() {} }\nclass Child extends Base { renderr() { /* meant to override */ } }`,
          short: 'Enable noImplicitOverride and mark overriding methods with override so renames and typos become errors.',
          long: `Without override, a typo or base rename silently creates a new method.\nThe override keyword asserts a base member with that name exists.\nnoImplicitOverride requires override on every overriding member.\nBase renames then produce TS4113/TS4114 errors in subclasses.\nIt also documents intent for readers.\nIt costs nothing at runtime; it is erased.`,
          fix: `// tsconfig: "noImplicitOverride": true\nclass Base { render() {} }\nclass Child extends Base { override render() {} }`,
          exercises: [
            {
              task: 'Turn on noImplicitOverride in a small project. Fix all errors.',
              description: 'Checks migration skill. Run tsc --noEmit.',
              answer: 'Each method that shadows a base member gets override. Any method marked override without a base counterpart errors, revealing typos. The fix is mechanical and safe.',
            },
            {
              task: 'A method has the override keyword, but the parent has no such method. What happens?',
              description: 'Checks keyword semantics. Playground.',
              answer: 'TS4113: This member cannot have an override modifier because it is not declared in the base class. This catches renames in the base. It is the main value of the keyword.',
            },
          ],
        },
        {
          q: 'Fix this code. The child method does not replace the parent arrow function.',
          code: `class Base { handle = () => 'base'; }\nclass Child extends Base { handle() { return 'child'; } }\nnew Child().handle(); // 'base'`,
          short: 'Arrow fields are own instance properties that shadow prototype methods; use a method and bind where needed.',
          long: `Field initializers run in the constructor and create own properties.\nChild.handle lives on the prototype, which the own property shadows.\nTS reports an error: a property cannot be overridden by a method (TS2425).\nUse prototype methods and bind at the call site or in the constructor.\nArrow fields also cost memory per instance and cannot use super.\nKeep arrow fields for leaf classes and callbacks only.`,
          fix: `class Base { handle() { return 'base'; } }\nclass Child extends Base { override handle() { return 'child'; } }\nconst fn = child.handle.bind(child);`,
          exercises: [
            {
              task: 'Where is the handle function stored in each version? Check with Object.hasOwn.',
              description: 'Checks prototype understanding. Run with node after tsc.',
              answer: 'With an arrow field, Object.hasOwn(instance, "handle") is true. With a method it is false and the function is on Base.prototype. This explains the shadowing.',
            },
            {
              task: 'Pass a method as an event callback safely. Do not use an arrow field.',
              description: 'Checks this-binding options. tsc --strict.',
              answer: 'Bind in the constructor: this.handle = this.handle.bind(this), or wrap at the call site with () => obj.handle(). Optionally declare a this parameter (handle(this: Base)) so unbound usage errors at compile time.',
            },
          ],
        },
      ],
      senior: [
        {
          q: 'How does the "this" return type help with method chaining in child classes?',
          short: 'Returning this from methods types the return as the subclass instance, so chained calls keep subclass methods.',
          long: `A method returning this gets the polymorphic this type.\nIn a subclass chain, base methods return the subclass type.\nReturning the class name instead loses subclass members.\nthis types also work in interfaces and type guards (this is Foo).\nThey cannot be used in static members.\nUseful for builders, query DSLs and fluent configs.`,
          exercises: [
            {
              task: 'Build a query builder with a "where" method. Add a child class with "orderBy". Chain both.',
              description: 'Checks this-typing. tsc --strict.',
              answer: 'Declare where(): this and return this. The subclass instance calling where() retains its type, so orderBy is available. If where returned QueryBuilder the chain would fail.',
            },
            {
              task: 'Write an isFile method that narrows "this" to a file node.',
              description: 'Checks this-based type guards. Playground.',
              answer: 'Declare isFile(): this is FileNode { return this instanceof FileNode; }. After if (node.isFile()) node narrows to FileNode. This avoids casting in tree walkers.',
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
          q: 'Fix this cache. It keeps growing and never frees memory.',
          code: `const cache = new Map<object, string>();\nfunction label(o: object) {\n  if (!cache.has(o)) cache.set(o, expensive(o));\n  return cache.get(o)!;\n}`,
          short: 'Use WeakMap for object-keyed caches so entries are collected with their keys.',
          long: `A Map holds strong references; every key stays alive.\nIn long-lived SPAs this leaks memory per processed object.\nWeakMap releases entries when the key is unreachable.\nAlso remove the non-null assertion by storing the computed value.\nFor primitive keys use an LRU with a size bound.\nMeasure with heap snapshots.`,
          fix: `const cache = new WeakMap<object, string>();\nfunction label(o: object) {\n  let v = cache.get(o);\n  if (v === undefined) { v = expensive(o); cache.set(o, v); }\n  return v;\n}`,
          exercises: [
            {
              task: 'Write a generic memoize helper that uses a WeakMap.',
              description: 'Checks generic WeakMap typing. tsc --strict.',
              answer: 'Create a WeakMap<K, V> inside and return (k: K) => cached or computed. The constraint K extends object (or WeakKey) is required. Types flow from fn.',
            },
            {
              task: 'How do you check that the memory leak is fixed?',
              description: 'Checks tooling. Chrome DevTools.',
              answer: 'Take heap snapshots before and after processing many objects, then compare retained sizes. With WeakMap the objects disappear after GC. Node can use --expose-gc and process.memoryUsage.',
            },
          ],
        },
        {
          q: 'Fix this code. Calling "has" does not make "get" safe.',
          code: `const users = new Map<string, User>();\nif (users.has(id)) {\n  users.get(id).name; // possibly undefined\n}`,
          short: 'has does not narrow get in TS; read once, then check undefined.',
          long: `TS has no link between has and get calls.\nThe get result remains User | undefined.\nUsing ! is unsafe if values can be undefined.\nRead the value into a variable and check it.\nThis also avoids two lookups.\nA wrapper getOrThrow is useful for invariants.`,
          fix: `const user = users.get(id);\nif (user) user.name;`,
          exercises: [
            {
              task: 'Write a helper. It gets a value, or creates and saves it if missing.',
              description: 'Checks typed helper. tsx.',
              answer: 'Get the value; if undefined, compute with make(), set and return it. Return type V. Newer libs may type Map.prototype.getOrInsert as the proposal advances; check your lib target.',
            },
            {
              task: 'The Map values can be undefined. Why is the exclamation mark dangerous?',
              description: 'Checks value semantics. Discussion.',
              answer: 'has may be true while the stored value is undefined, so ! lies. The check must be on the value itself. That is why the read-then-check pattern is preferred.',
            },
          ],
        },
      ],
      senior: [
        {
          q: 'How does TypeScript type the new Set methods, like union and intersection?',
          short: 'TS 5.5+ lib esnext.collection types them; they accept ReadonlySetLike<U> and return new Sets.',
          long: `Methods: union, intersection, difference, symmetricDifference, isSubsetOf, isSupersetOf, isDisjointFrom.\nAvailable with lib esnext (TS 5.5+).\nArguments are set-like: size, has, keys — so Maps also work.\nunion<U> returns Set<T | U>; intersection<U> returns Set<T & U>.\nRuntime support: modern evergreen browsers and Node 22.\nPolyfill or guard for older targets.`,
          exercises: [
            {
              task: 'Find the permissions a user is missing. Use the difference method.',
              description: 'Checks API usage. Node 22 + lib esnext.',
              answer: 'required.difference(granted) returns a Set of missing items. Typed as Set<T>. It does not mutate either set.',
            },
            {
              task: 'What happens if your lib setting does not include these methods?',
              description: 'Checks lib config. tsc.',
              answer: 'TS errors that the property does not exist on Set. Runtime may still support it. Add the lib or write a helper function.',
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
          q: 'Some state must be saved as JSON. What rules do you set for Map and Set in that state?',
          short: 'Keep serializable state as plain records/arrays and derive Maps/Sets in selectors; enforce with types and middleware checks.',
          long: `JSON drops Map/Set to {}; structuredClone keeps them but not across HTTP.\nSSR hydration and localStorage need JSON-safe types.\nDefine a Serializable<T> type that rejects Map/Set/Date/functions.\nDerive indexes (Map by id) with memoized selectors.\nRedux Toolkit's serializableCheck enforces it at runtime in dev.\nDocument exceptions such as in-memory query caches.`,
          ai: true,
          exercises: [
            {
              task: 'Write a type check that finds Map fields in a state type.',
              description: 'Checks type-level enforcement. tsc.',
              answer: 'Define a recursive type mapping Map/Set/functions to never, then assert State extends Serializable<State>. Compile errors point at offending fields. type-fest Jsonify is a ready alternative.',
            },
            {
              task: 'The store already uses many Sets. How do you migrate it?',
              description: 'Checks rollout thinking. Discussion.',
              answer: 'Introduce selectors that return Sets derived from arrays, migrate writers slice by slice, and add a persistence migration version. Keep tests on selector outputs. Remove the Sets once no writer uses them.',
            },
          ],
        },
        {
          q: 'Fix this code. It builds a new Map on every call in a hot path.',
          code: `export function findCountry(code: string) {\n  const m = new Map(COUNTRIES.map(c => [c.code, c]));\n  return m.get(code);\n}`,
          short: 'Build the index once at module scope (or lazily) and type it as ReadonlyMap.',
          long: `Rebuilding is O(n) per call and allocates garbage.\nHoist to module scope or lazy-init once.\nExpose ReadonlyMap to prevent mutation by consumers.\nas const on the source gives literal key types.\nProfile to confirm; small tables may not matter.\nAdd a lint or review rule for allocation in hot paths.`,
          fix: `const BY_CODE: ReadonlyMap<string, Country> = new Map(COUNTRIES.map(c => [c.code, c] as const));\nexport const findCountry = (code: string) => BY_CODE.get(code);`,
          ai: true,
          exercises: [
            {
              task: 'Measure the speed of both versions.',
              description: 'Checks measurement. Use vitest bench or mitata.',
              answer: 'The hoisted version is orders of magnitude faster for repeated calls. Allocation also drops to zero per call. Present numbers before mandating a pattern.',
            },
            {
              task: 'Make the key type a union of the real country codes.',
              description: 'Checks as const typing. tsc.',
              answer: 'Declare COUNTRIES as const and type CountryCode = typeof COUNTRIES[number]["code"]. Use ReadonlyMap<CountryCode, Country>. Callers then get autocomplete and errors on bad codes.',
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
          q: 'Fix this helper. It does not close the source when the loop stops early.',
          code: `function* mapIter<T, U>(src: Iterator<T>, f: (t: T) => U) {\n  let r = src.next();\n  while (!r.done) { yield f(r.value); r = src.next(); }\n}`,
          short: 'Consume via for..of over an Iterable so return() propagates, or call src.return?.() in finally.',
          long: `Manual next() loops do not propagate early termination.\nfor..of calls return() on break, throw or return.\nAccept Iterable<T> and use for..of inside the generator.\nOr wrap the loop in try/finally calling src.return?.().\nThis matters for resources (file handles, DB cursors).\nES2025 iterator helpers (Iterator.prototype.map) do this natively.`,
          fix: `function* mapIter<T, U>(src: Iterable<T>, f: (t: T) => U) {\n  for (const v of src) yield f(v);\n}`,
          exercises: [
            {
              task: 'Prove that cleanup runs. Add a finally block to the source generator.',
              description: 'Checks return propagation. tsx.',
              answer: 'Put console.log in finally of the source; break after the first item of the mapped iterator. With for..of the finally logs; with manual next it does not. That demonstrates the fix.',
            },
            {
              task: 'Rewrite it with the new iterator helper methods.',
              description: 'Checks modern API. Node 22 + lib esnext.',
              answer: 'Use Iterator.from(src).map(f). TS 5.6+ types it as IteratorObject. It handles return propagation correctly.',
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
          q: 'Fix this async generator. Requests keep running after the consumer stops.',
          code: `async function* pages(url: string) {\n  while (url) { const r = await fetch(url).then(r => r.json()); yield r.items; url = r.next; }\n}`,
          short: 'Accept an AbortSignal, abort in finally when the consumer returns, and type the yielded items.',
          long: `If the consumer breaks, no new page is fetched, but an in-flight request is not cancelled.\nfinally in the generator runs on return(), but only after the pending await resolves.\nPass AbortSignal to fetch and abort it on teardown.\nType as AsyncGenerator<Item[], void, undefined>.\nValidate JSON with a schema rather than trusting any.\nConsumers use for await with break.`,
          fix: `async function* pages(url: string, signal?: AbortSignal): AsyncGenerator<Item[], void, undefined> {\n  const ac = new AbortController();\n  signal?.addEventListener('abort', () => ac.abort());\n  try {\n    let next: string | null = url;\n    while (next) {\n      const r = PageSchema.parse(await (await fetch(next, { signal: ac.signal })).json());\n      yield r.items; next = r.next;\n    }\n  } finally { ac.abort(); }\n}`,
          exercises: [
            {
              task: 'Write a test. Check that fetch is stopped after the loop breaks.',
              description: 'Checks teardown. vitest with mocked fetch.',
              answer: 'Mock fetch to capture signal, consume one page and break. Assert signal.aborted is true. Finally runs on return().',
            },
            {
              task: 'Why can "return" not stop a waiting await inside the generator?',
              description: 'Checks async generator queueing. Discussion.',
              answer: 'Async generator requests are queued; return() waits until the current next() settles. So cancellation must come from outside via a signal. That is why AbortSignal is required.',
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
          q: 'What does an async function always return? How do you type it?',
          short: 'It always returns a Promise; TS types the return as Promise<T> where T is the returned value.',
          long: `async function f() { return 1 } has type () => Promise<number>.\nThrowing inside rejects the promise.\nThe return annotation must be Promise<...>.\nawait pauses the function and schedules continuation as a microtask.\nCallers must await or handle the promise.\nForgetting await is a common bug caught by no-floating-promises.`,
          exercises: [
            {
              task: 'Type an async function that returns a user or null.',
              description: 'Checks return typing. tsc.',
              answer: 'Write async function load(): Promise<User | null>. Annotating as User | null errors with TS1064. The promise wraps the union.',
            },
            {
              task: 'Look at this code. In what order are the numbers printed?',
              description: 'Checks microtask scheduling. node.',
              code: `async function f() { await null; console.log(2); }\nconsole.log(1); f(); console.log(3);`,
              answer: 'It logs 1, 3, 2. Code after await resumes in a microtask. The sync code runs to completion first.',
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
          q: 'Fix the type of the setTimeout result in browser code.',
          code: `let timer: number = setTimeout(() => {}, 100); // error when @types/node is present`,
          short: 'Use ReturnType<typeof setTimeout> so it works with both DOM and Node typings.',
          long: `DOM types return number; @types/node returns NodeJS.Timeout.\nIf both are loaded, the Node overload often wins.\nReturnType<typeof setTimeout> adapts to the environment.\nOr use window.setTimeout explicitly for DOM number.\nClear with clearTimeout(timer).`,
          fix: `let timer: ReturnType<typeof setTimeout> = setTimeout(() => {}, 100);`,
          exercises: [
            {
              task: 'Why are Node types loaded in a browser project?',
              description: 'Checks types inclusion. Inspect tsconfig types.',
              answer: 'Tools like Vite or test frameworks depend on it and TS includes all @types by default. Set "types": [] or a list in tsconfig to limit. That prevents global leaks.',
            },
            {
              task: 'Write a debounce function. Type the timer correctly.',
              description: 'Checks typing in practice. tsx.',
              answer: 'Store let t: ReturnType<typeof setTimeout> | undefined, clear it on each call, and set a new timeout. Type the function generically over args with Parameters. It works in both environments.',
            },
          ],
        },
      ],
      middle: [
        {
          q: 'Compare queueMicrotask, promise then, setTimeout zero, and requestAnimationFrame. When does each run?',
          short: 'Microtasks (queueMicrotask, then) run before rendering and next task; setTimeout queues a task; rAF runs before next paint.',
          long: `After each task, all microtasks drain.\nqueueMicrotask and resolved promise callbacks are microtasks.\nsetTimeout(fn, 0) schedules a task (min ~4ms when nested).\nrequestAnimationFrame runs once per frame before paint.\nLong microtask chains can starve rendering.\nscheduler.yield (Chrome) yields to let input be processed.`,
          exercises: [
            {
              task: 'Look at this code. In what order are the letters printed?',
              description: 'Checks queue order. node.',
              code: `setTimeout(() => console.log('A'));\nqueueMicrotask(() => console.log('B'));\nPromise.resolve().then(() => console.log('C'));\nconsole.log('D');`,
              answer: 'D, B, C, A. Synchronous first, then microtasks in queue order, then the timer task. Microtasks fully drain before tasks.',
            },
            {
              task: 'Write a nextFrame helper that returns a promise.',
              description: 'Checks promise wrapping. tsc DOM lib.',
              answer: 'return new Promise<number>(r => requestAnimationFrame(r)). The resolved value is the timestamp. Useful for awaiting layout.',
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
          q: 'Fix this search. An old response can replace a newer one.',
          code: `async function search(q: string) { const r = await api(q); render(r); }`,
          short: 'Abort the previous request with AbortController (or compare a request id) before rendering.',
          long: `Responses can resolve out of order.\nAn older slow response overwrites newer results.\nKeep an AbortController per in-flight request and abort on new call.\nIgnore AbortError in the catch.\nAlternatively compare a monotonically increasing id.\nGeneralize as latest<A, R>(fn) returning a wrapped function.`,
          fix: `function latest<A extends unknown[], R>(fn: (signal: AbortSignal, ...a: A) => Promise<R>) {\n  let ac: AbortController | undefined;\n  return (...a: A) => { ac?.abort(); ac = new AbortController(); return fn(ac.signal, ...a); };\n}\nconst search = latest((signal, q: string) => api(q, { signal }));`,
          exercises: [
            {
              task: 'Write a test. Two responses come back in the wrong order.',
              description: 'Checks race handling. vitest fake timers.',
              answer: 'Mock api to resolve the first call after 200ms and the second after 50ms. Assert only the second result renders and the first rejects with AbortError. Advance timers to drive it.',
            },
            {
              task: 'How does the generic tuple keep the argument types here?',
              description: 'Checks generic inference. Playground.',
              answer: 'A extends unknown[] captures the parameter list as a tuple. The returned function reuses ...a: A. Calls are checked exactly against the original signature.',
            },
          ],
        },
      ],
      techlead: [
        {
          q: 'What company-wide rules do you set for correct async code?',
          short: 'Type-aware lint (no-floating-promises, no-misused-promises, await-thenable), signal-threading conventions, and global rejection telemetry.',
          long: `Enable typed linting via projectService in typescript-eslint.\nMake async lint rules errors, not warnings.\nRequire AbortSignal in public async APIs.\nRegister unhandledrejection handlers reporting to monitoring.\nDocument patterns for fire-and-forget, retries and timeouts.\nTrack violations in CI and fail on new ones.`,
          ai: true,
          exercises: [
            {
              task: 'What does typed linting cost in CI for a big repo?',
              description: 'Checks trade-off analysis. Discussion.',
              answer: 'Typed lint needs a TS program, so it can be several times slower. Mitigate with projectService, caching and linting only changed packages. The bug prevention usually justifies it.',
            },
            {
              task: 'There are eight hundred old errors. Plan how to turn on no-floating-promises.',
              description: 'Checks incremental adoption. Discussion.',
              answer: 'Baseline existing violations (ESLint bulk suppressions or a generated disable list), make the rule error for new code, and burn down by package. Owners get dashboards. Remove the baseline when empty.',
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
          q: 'What does skipLibCheck do? Is it safe?',
          short: 'It skips type-checking of all .d.ts files, speeding up builds; it is widely used and generally safe for apps.',
          long: `Declaration files from node_modules can be large.\nskipLibCheck stops checking them for internal consistency.\nYour code is still checked against their types.\nIt can hide conflicts between two @types versions.\nMost templates (Vite, Next) enable it.\nLibrary authors should still validate their own .d.ts output.`,
          exercises: [
            {
              task: 'Measure build time with and without skipLibCheck.',
              description: 'Checks measurement. tsc --extendedDiagnostics.',
              answer: 'Compare Check time in extendedDiagnostics output. It is typically lower with the flag. Report numbers.',
            },
            {
              task: 'Name one risk of skipLibCheck.',
              description: 'Checks awareness. Discussion.',
              answer: 'Broken or conflicting declaration files go unnoticed until types misbehave. Duplicate global declarations may silently merge. Library authors should run without it.',
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
          q: 'Fix this slow type. It makes the editor lag.',
          code: `type Paths<T> = T extends object ? { [K in keyof T]: \`\${K & string}\` | \`\${K & string}.\${Paths<T[K]>}\` }[keyof T] : never;\ntype All = Paths<HugeConfig>;`,
          short: 'Limit recursion depth, avoid full cross-product unions, and compute paths lazily per key.',
          long: `Recursive template literals over deep objects explode into huge unions.\nTS caps unions at 100k members and instantiations depth.\nAdd a depth counter tuple to stop recursion.\nPrefer checking a given path (ValidPath<T, P>) over enumerating all.\nUse tsc --generateTrace to locate costly types.\nSimplify or replace with codegen for very large configs.`,
          fix: `type Prev = [never, 0, 1, 2, 3, 4];\ntype Paths<T, D extends number = 4> = [D] extends [never] ? never :\n  T extends object ? { [K in keyof T & string]: K | \`\${K}.\${Paths<T[K], Prev[D]>}\` }[keyof T & string] : never;`,
          exercises: [
            {
              task: 'Make a trace and find the slow type.',
              description: 'Checks diagnostics. tsc --generateTrace out && npx @typescript/analyze-trace out.',
              answer: 'analyze-trace lists hot spots with file positions. The Paths instantiation shows up with large check times. Fix and re-run to confirm.',
            },
            {
              task: 'Why is checking one path cheaper than listing all paths?',
              description: 'Checks type complexity reasoning. Discussion.',
              answer: 'Validation walks one branch per segment, linear in path length. Enumeration builds every possible path, exponential in breadth and depth. Prefer validating the path the user wrote.',
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
          q: 'Fix this CI step. Type checking takes fifteen minutes.',
          code: `- run: pnpm -r exec tsc --noEmit`,
          short: 'Use project references with tsc -b, cache tsbuildinfo, run only affected packages, and parallelize with a task runner.',
          long: `Running tsc per package re-checks shared dependencies repeatedly.\ntsc -b shares built declarations across projects.\nCache .tsbuildinfo and dist d.ts between CI runs.\nUse Turborepo/Nx affected detection for PRs.\nRemote cache lets CI reuse local results.\nTrack typecheck duration as a team metric.`,
          fix: `- uses: actions/cache@v4\n  with: { path: '**/*.tsbuildinfo', key: tsc-\${{ github.sha }}, restore-keys: tsc- }\n- run: pnpm turbo run typecheck --filter=...[origin/master]`,
          ai: true,
          exercises: [
            {
              task: 'Why does the cache use restore keys?',
              description: 'Checks CI caching. GitHub Actions.',
              answer: 'Exact keys rarely match across commits; restore-keys loads the latest prefix match. tsc incremental then only checks changes. Save a fresh cache at the end.',
            },
            {
              task: 'Set a time limit and an alert for type checking.',
              description: 'Checks governance. Discussion.',
              answer: 'Record duration per run, set a budget like 3 minutes p90, and alert on regressions. Investigate with generateTrace when exceeded. Assign ownership to platform team.',
            },
          ],
        },
        {
          q: 'How do you balance clever types against build speed and developer comfort?',
          short: 'Define a complexity budget: prefer simple types at boundaries, keep advanced types in a few vetted libraries, and measure type performance in CI.',
          long: `Clever types can multiply check time and produce unreadable errors.\nMost app code benefits from plain interfaces and generics.\nAllow advanced types in shared, tested utilities only.\nRequire type tests (expectTypeOf, tsd) for them.\nMeasure via extendedDiagnostics and attest budgets.\nReview DX: error message quality and IDE latency.`,
          ai: true,
          exercises: [
            {
              task: 'Write review rules for adding a new complex utility type.',
              description: 'Checks standards setting. Discussion.',
              answer: 'It must solve a recurring problem, have type tests, stay under an instantiation budget, and produce readable errors. Document usage examples. Otherwise prefer simpler types.',
            },
            {
              task: 'A teammate keeps adding deep recursive types. What do you do?',
              description: 'Checks leadership. Discussion.',
              answer: 'Show measured cost and DX impact, agree on the budget together, and channel the expertise into the shared utilities library. Pair on simpler alternatives. Keep it about outcomes, not taste.',
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
          q: 'Fix this switch. A new shape type does not cause an error.',
          code: `type Shape = { kind: 'circle'; r: number } | { kind: 'square'; s: number } | { kind: 'tri'; b: number; h: number };\nfunction area(x: Shape) {\n  switch (x.kind) { case 'circle': return 3.14 * x.r ** 2; case 'square': return x.s ** 2; }\n  return 0;\n}`,
          short: 'Add a default branch assigning to never (or satisfies never) so unhandled kinds fail compilation.',
          long: `return 0 hides missing cases.\nIn default, x is narrowed to remaining members.\nAssigning to never fails if any remain.\nswitch-exhaustiveness-check lint rule is another guard.\nThrow at runtime for unexpected data from outside.\nExplicit return type helps too.`,
          fix: `function area(x: Shape): number {\n  switch (x.kind) {\n    case 'circle': return Math.PI * x.r ** 2;\n    case 'square': return x.s ** 2;\n    case 'tri': return (x.b * x.h) / 2;\n    default: { const _e: never = x; throw new Error('unknown ' + JSON.stringify(_e)); }\n  }\n}`,
          exercises: [
            {
              task: 'Write an assertNever helper function.',
              description: 'Checks helper. tsc.',
              answer: 'function assertNever(x: never): never { throw new Error("Unexpected " + String(x)); }. Call it in default. Compile errors appear if cases are missing.',
            },
            {
              task: 'Turn on the lint rule that checks all switch cases.',
              description: 'Checks lint. typescript-eslint.',
              answer: 'Add @typescript-eslint/switch-exhaustiveness-check as error with typed linting. It reports missing cases even without default. Useful for many switches.',
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
          q: 'How do you build a type-safe contract between frontend and backend teams?',
          short: 'Pick a single source of truth (OpenAPI, tRPC, GraphQL schema, or shared zod), generate or infer types, and enforce compatibility in CI.',
          long: `Hand-maintained duplicate types drift.\nOpenAPI fits polyglot backends; tRPC fits TS full-stack monorepos.\nGraphQL codegen gives typed operations per query.\nRun breaking-change detection (oasdiff, graphql-inspector) in CI.\nValidate at runtime where trust is low.\nDefine versioning and deprecation policy.`,
          ai: true,
          exercises: [
            {
              task: 'The backend is .NET and the frontend is React. Do you choose tRPC or OpenAPI?',
              description: 'Checks architecture judgement. Discussion.',
              answer: 'tRPC requires a TS server, so OpenAPI with generated TS types fits a .NET backend. Add codegen in CI and contract tests. tRPC is only viable with a BFF in TS.',
            },
            {
              task: 'Write a rule for breaking changes in the API contract.',
              description: 'Checks governance. Discussion.',
              answer: 'Breaking changes need a new version or deprecation window, detected automatically with oasdiff in PRs. Additive changes are allowed. Consumers get changelog and migration notes.',
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
