// TypeScript extra questions (part 1)
export default {
  TypeScript: {
  'Interfaces and type aliases': {
    junior: [
      {
        q: 'How do you mark a property as optional or read-only in an interface?',
        short: 'Add a question mark after the name for optional, and the readonly keyword before it for read-only.',
        long: 'An optional property `name?: string` may be missing; its type becomes `string | undefined` when you read it.\nA `readonly id: string` property cannot be reassigned after creation, but only at compile time.\nPitfall: readonly is shallow; nested objects and arrays can still be changed.\nPitfall: with exactOptionalPropertyTypes, `name?: string` no longer accepts an explicit undefined.\nStrong answer: mentions shallowness and that both are erased at runtime.\nWeak answer: thinks readonly makes the object frozen.',
        follow: 'Is readonly checked at runtime?',
        exercises: [
          {
            task: 'Make the id read-only and the email optional.',
            description: 'Checks basic modifiers. Give the interface and ask for edits in the TS Playground.',
            code: `interface User { id: string; email: string; name: string }`,
            answer: 'Use readonly before id and a question mark after email. A common wrong answer is using `email: string | undefined`, which still forces the key to exist. A strong answer explains the difference between a missing key and an undefined value.',
            solution: `interface User { readonly id: string; email?: string; name: string }`,
          },
          {
            task: 'Does this code compile? Explain why.',
            description: 'Checks that readonly is shallow. Run it in the Playground.',
            code: `interface Cfg { readonly tags: string[] }
const c: Cfg = { tags: [] };
c.tags.push('a');
c.tags = [];`,
            answer: 'The push compiles because readonly only protects the property binding, not the array. The reassignment fails. Use `readonly string[]` to block push. Weak answers say both lines fail.',
          },
        ],
      },
      {
        q: 'Fix this code. The tuple type is used like a plain array.',
        code: `type Point = number[];
function dist(p: Point) { return Math.hypot(p[0], p[1]); }
dist([3]);`,
        fix: `type Point = [x: number, y: number];
function dist(p: Point) { return Math.hypot(p[0], p[1]); }
dist([3, 4]);`,
        short: 'number[] allows any length, so a one-item array compiles. A tuple type fixes the length and the type of each position.',
        long: `A type alias can name a tuple: \`[x: number, y: number]\` means exactly two numbers.
With number[], \`p[1]\` is typed as number even when it is missing at runtime.
Labels like x and y only help readability and editor hints.
Pitfall: tuples are still mutable; use \`readonly [number, number]\` to block push.
Strong answer: picks a tuple and mentions noUncheckedIndexedAccess for plain arrays.
Weak answer: adds a runtime length check but keeps number[].`,
        follow: 'How do you make a tuple read-only?',
        exercises: [
          {
            task: 'Type the return value of this hook as a tuple.',
            description: 'Checks tuple return types like useState. Ask for code in the Playground.',
            code: 'function useToggle(init: string) { const reset = () => {}; return [init, reset]; }',
            answer: 'Without a tuple type, TS infers (string | (() => void))[] and destructuring loses types. Use `as const` or an explicit `[string, () => void]` return type.',
            solution: 'function useToggle(init: string): [string, () => void] { const reset = () => {}; return [init, reset]; }',
          },
          {
            task: 'What is the type of the last item here?',
            description: 'Checks optional and rest elements in tuples.',
            code: `type Row = [id: number, name: string, note?: string];
declare const r: Row;
const n = r[2];`,
            answer: 'It is `string | undefined` because the tuple ends with an optional element. Rest elements like `...number[]` can also appear. Weak answers say tuples cannot have optional parts.',
          },
        ],
      },
      {
        q: 'How do you type a function with an interface or a type alias?',
        short: 'Use a call signature: `type Fn = (a: number) => string` or `interface Fn { (a: number): string }`.',
        long: 'A type alias with arrow syntax is the most common form.\nAn interface with a call signature can also add properties to the function.\nMethod syntax `m(): void` and property syntax `m: () => void` differ: method params are checked bivariantly.\nPitfall: using `Function` as a type loses all parameter checks.\nStrong answer: knows both forms and the bivariance difference under strictFunctionTypes.\nWeak answer: uses Function or any.',
        exercises: [
          {
            task: 'Write a type for a comparator of two numbers that returns a number.',
            description: 'Checks function type syntax. Ask for both the alias and the interface form.',
            answer: '`type Cmp = (a: number, b: number) => number` or `interface Cmp { (a: number, b: number): number }`. A wrong answer is `Function`. A strong answer shows it used with Array.prototype.sort.',
            solution: `type Cmp = (a: number, b: number) => number;
const asc: Cmp = (a, b) => a - b;`,
          },
          {
            task: 'Why is the parameter type inferred here?',
            description: 'Checks contextual typing. Show the code and ask where the type of a comes from.',
            code: `type Handler = (e: MouseEvent) => void;
const h: Handler = (e) => console.log(e.clientX);`,
            answer: 'The annotation on h gives a contextual type, so e is MouseEvent without its own annotation. Weak answers say e is any. A strong answer names contextual typing.',
          },
        ],
      },
    ],
    middle: [
      {
        q: 'How do you type an object that can be called like a function and also has properties?',
        short: 'Use a call signature together with properties in one interface or type: `interface Fn { (x: number): string; version: string }`.',
        long: `This is called a hybrid type. Libraries like jQuery or a logger with \`log()\` and \`log.level\` work this way.
You write the call signature \`(x: number): string\` next to normal properties.
To build one, create the function first and then add the properties; TS 3.1+ understands property assignments on function declarations.
Pitfall: using Object.assign without a type can lose the call signature.
Strong answer: shows a call signature plus a property and how to create the value.
Weak answer: says it is impossible without a class.`,
        follow: 'Can you add a construct signature too?',
        exercises: [
          {
            task: 'Write a type for a counter function that also has a reset method.',
            description: 'Checks call signatures with members.',
            answer: 'Put `(): number` and `reset(): void` in one interface. Then create a function and attach reset. A strong answer shows that TS accepts `counter.reset = ...` on a function declaration.',
            solution: `interface Counter { (): number; reset(): void }
let n = 0;
function counter() { return ++n; }
counter.reset = () => { n = 0; };
const c: Counter = counter;`,
          },
          {
            task: 'Why does this fail and how do you fix it?',
            description: 'Checks building a hybrid value.',
            code: `interface Lib { (s: string): void; version: string }
const lib: Lib = (s: string) => console.log(s);`,
            answer: 'An arrow function on its own has no version property. Add it with Object.assign so the result type has both parts.',
            solution: 'const lib: Lib = Object.assign((s: string) => console.log(s), { version: \'1.0\' });',
          },
        ],
      },
      {
        q: 'Fix this code. The interface cannot extend the union type.',
        code: `type Shape = { kind: 'circle'; r: number } | { kind: 'square'; s: number };
interface Colored extends Shape { color: string }`,
        fix: `type Shape = { kind: 'circle'; r: number } | { kind: 'square'; s: number };
type Colored = Shape & { color: string };`,
        short: 'An interface can only extend an object type with statically known members; use an intersection with a type alias.',
        long: 'Interfaces need a single object type to extend, not a union.\n`Shape & { color: string }` distributes: each member of the union gets color.\nThis keeps the discriminant, so narrowing on kind still works.\nPitfall: flattening the union into one object with optional fields loses safety.\nStrong answer: explains distribution of & over |.\nWeak answer: makes all fields optional.',
        exercises: [
          {
            task: 'Narrow a Colored value and read r only for circles.',
            description: 'Checks that the intersection keeps discriminated union narrowing. Ask for a function.',
            answer: 'Switch on `c.kind`; in the circle branch `c.r` is available and `c.color` is always available. A wrong answer uses a cast. A strong answer notes the intersection distributes over the union.',
            solution: `function area(c: Colored) {
  return c.kind === 'circle' ? Math.PI * c.r ** 2 : c.s ** 2;
}`,
          },
          {
            task: 'Can an interface extend a mapped type alias? Try it.',
            description: 'Checks the rule "statically known members". Test `interface X extends Partial<User> {}`.',
            answer: 'Yes, Partial<User> resolves to an object type with known keys, so extending works. It fails only for unions or types with unknown keys, like generic T. Weak answers say interfaces can never extend type aliases.',
          },
        ],
      },
      {
        q: 'What is an index signature? When is Record a better choice?',
        short: 'An index signature `[key: string]: T` allows any key of that type; Record<K, T> is a mapped type that can also restrict keys to a union.',
        long: '`{ [key: string]: number }` accepts any string key.\n`Record<"a" | "b", number>` requires exactly those keys.\nPitfall: with an index signature, `obj.foo` is typed as number even when missing; enable noUncheckedIndexedAccess.\nNamed properties must be compatible with the index signature type.\nFor dynamic keys, Map may be better.\nStrong answer: mentions noUncheckedIndexedAccess and key unions.\nWeak answer: treats them as identical.',
        exercises: [
          {
            task: 'Why does this fail? Fix it.',
            description: 'Checks named property compatibility with index signatures. Run in the Playground.',
            code: `interface Dict { [k: string]: number; name: string }`,
            answer: 'The name property must match the index type number. Change the index to `number | string`, or move name out of the dictionary. A strong answer suggests separating metadata from the map.',
            solution: `interface Dict { name: string; values: Record<string, number> }`,
          },
          {
            task: 'Type a map from status to label, where every status must have a label.',
            description: 'Checks Record with a union key for completeness. Remove one key to see the error.',
            code: `type Status = 'new' | 'done';`,
            answer: '`const labels: Record<Status, string> = { new: "New", done: "Done" }`. Adding a status forces a new label. A weak answer uses an index signature, which does not enforce completeness.',
          },
        ],
      },
    ],
    senior: [
      {
        q: 'Why does an interface not match Record<string, unknown>, but a type alias does?',
        short: 'Type aliases of object literals get an implicit index signature; interfaces do not, because they can be merged later.',
        long: 'A type alias `{ a: string }` is assignable to `Record<string, unknown>`.\nAn interface with the same members is not, since more members may be merged in later.\nThis shows up with generic helpers like `T extends Record<string, unknown>`.\nFixes: constrain with `object`, use `Record<string, any>`, or `T extends { [K in keyof T]: unknown }`.\nStrong answer: explains the implicit index signature rule and the merge reason.\nWeak answer: says it is a compiler bug.',
        ai: true,
        exercises: [
          {
            task: 'Make this helper accept both interfaces and type aliases.',
            description: 'Checks the implicit index signature rule. Run in the Playground with an interface argument.',
            code: `function keys<T extends Record<string, unknown>>(o: T) { return Object.keys(o) as (keyof T)[] }
interface U { id: string }
declare const u: U;
keys(u);`,
            answer: 'Change the constraint to `T extends object`. Record<string, unknown> needs an index signature, which interfaces lack. A wrong fix casts at the call site. A strong answer explains why `any` works but `unknown` does not.',
            solution: `function keys<T extends object>(o: T) { return Object.keys(o) as (keyof T)[] }`,
          },
          {
            task: 'Explain why Object.keys returns string[] and not keyof T.',
            description: 'Checks understanding of structural typing. Ask for reasoning, not code.',
            answer: 'Because of structural typing, an object can have more keys than its type shows. So keyof T would lie. The cast is a deliberate unsafe choice. Weak answers call it a TS limitation that should be fixed.',
          },
        ],
      },
      {
        q: 'Fix this code. The interface method allows an unsafe callback.',
        code: `interface Store { on(cb: (v: string | number) => void): void }
const s: Store = { on(cb: (v: string) => void) { cb('x') } };
// caller passes a number later and the code breaks`,
        fix: `interface Store { on: (cb: (v: string | number) => void) => void }
const s: Store = { on(cb) { cb('x') } };`,
        short: 'Method syntax is checked bivariantly; property function syntax is checked strictly under strictFunctionTypes.',
        long: 'strictFunctionTypes only applies to function type properties, not methods.\nMethod syntax keeps bivariance for compatibility (for example Array methods).\nSo a narrower parameter type slips through and breaks at runtime.\nSwitching to property syntax makes the checker reject the unsafe implementation.\nStrong answer: names bivariance and the lint rule @typescript-eslint/method-signature-style.\nWeak answer: blames inference.',
        ai: true,
        exercises: [
          {
            task: 'Which assignment fails under strict mode? Explain.',
            description: 'Checks variance of method versus property signatures. Run both lines in the Playground.',
            code: `interface A { m(x: string | number): void }
interface B { m: (x: string | number) => void }
const a: A = { m: (x: string) => {} };
const b: B = { m: (x: string) => {} };`,
            answer: 'Only b fails. Methods are bivariant in their parameters; property functions are contravariant. Weak answers say both fail. A strong answer suggests the lint rule that enforces property style.',
          },
          {
            task: 'Explain why method bivariance exists at all.',
            description: 'Checks the design trade-off. Discuss with Array<Dog> versus Array<Animal>.',
            answer: 'Without it, Array<Dog> would not be assignable to Array<Animal> because of methods like push. TS chose usability over full soundness. A strong answer mentions it was kept when strictFunctionTypes was added in 2.6.',
          },
        ],
      },
      {
        q: 'How do interfaces and type aliases affect compiler performance in a big project?',
        short: 'Interfaces are cached by name and their extends checks are cheaper; large intersections and deep conditional aliases are re-computed and slow.',
        long: 'The TS performance wiki suggests preferring interface extends over intersections.\nIntersections are flattened and checked member by member each time.\nNamed interfaces show shorter names in errors and .d.ts files.\nHuge unions (thousands of members) cause quadratic checks.\nTools: `tsc --extendedDiagnostics`, `--generateTrace`, and @typescript/analyze-trace.\nStrong answer: measures before changing and names the tools.\nWeak answer: says types have no cost because they are erased.',
        exercises: [
          {
            task: 'Rewrite this intersection chain for better checker performance.',
            description: 'Checks the interface-over-intersection guidance. Compare with extendedDiagnostics on a large file.',
            code: `type Full = Base & Audit & Owner & { extra: string };`,
            answer: 'Use `interface Full extends Base, Audit, Owner { extra: string }`. It is cached and conflicts are reported early. A weak answer says the two forms are identical. A strong answer also notes extends reports conflicts instead of producing never.',
            solution: `interface Full extends Base, Audit, Owner { extra: string }`,
          },
          {
            task: 'How would you find which type makes tsc slow?',
            description: 'Checks tooling knowledge. Ask for concrete steps.',
            answer: 'Run `tsc --extendedDiagnostics` for totals, then `--generateTrace out` and open it in Perfetto or analyze-trace to find hot types. Weak answers only guess. A strong answer then simplifies the hot type and re-measures.',
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'Should API response types and UI form types be the same type? How do you keep them apart?',
        short: 'No. API types describe the wire format; form types describe what the UI edits. Map between them in one place.',
        long: `API data often has ISO date strings, nullable fields and server ids. Forms need Date objects, empty strings and draft values.
Using one type for both leads to \`as\` casts and fields that are optional everywhere.
Put mapping functions like toForm and toRequest next to the feature, and test them.
Pitfall: a mapping layer for every tiny screen adds noise; use Pick or Omit when the shapes really match.
Strong answer: explains boundary mapping and when to skip it.
Weak answer: makes every field optional in one shared type.`,
        follow: 'Where do you put the mapping functions?',
        exercises: [
          {
            task: 'Write a form type from this API type, where dates are Date objects and id is not editable.',
            description: 'Checks Omit and mapped changes.',
            code: 'type UserDto = { id: string; name: string; createdAt: string };',
            answer: 'Omit id, and replace createdAt with Date. A strong answer writes a toForm function too.',
            solution: `type UserForm = Omit<UserDto, 'id' | 'createdAt'> & { createdAt: Date };
const toForm = (d: UserDto): UserForm => ({ name: d.name, createdAt: new Date(d.createdAt) });`,
          },
          {
            task: 'A team made every API field optional so forms can use it. What problems does this cause?',
            description: 'Checks judgment about shared types.',
            answer: 'Every read now needs undefined checks, real missing fields are hidden, and the server contract is lost. Separate types with a mapper fix this.',
          },
        ],
      },
      {
        q: 'Fix this shared type. One change in it breaks many apps.',
        code: `// shared package
export interface User { id: string; name: string; role: string; settings: any; [k: string]: any }`,
        fix: `export interface UserSummary { readonly id: string; readonly name: string }
export interface User extends UserSummary { readonly role: 'admin' | 'member'; readonly settings: UserSettings }
export interface UserSettings { theme: 'light' | 'dark' }`,
        short: 'Remove any and the open index signature, split into smaller contracts, and use literal unions.',
        long: 'The index signature with any turns off checks for every property.\nConsumers start to depend on fields that do not exist.\nSmaller contracts (UserSummary) let apps depend only on what they use.\nreadonly and literal unions make the contract explicit.\nRoll out with deprecation and a semver major, not a silent change.\nStrong answer: talks about blast radius and versioning.\nWeak answer: only removes any.',
        exercises: [
          {
            task: 'Plan how to remove the index signature without breaking all consumers at once.',
            description: 'Checks migration strategy. Ask for steps.',
            answer: 'Add the new strict type next to the old one, mark the old one @deprecated, migrate apps one by one, then remove it in a major version. A weak answer changes it in place. A strong answer measures usage with tsc errors first.',
          },
          {
            task: 'Why is `settings: any` worse than `settings: unknown`?',
            description: 'Checks any versus unknown at a contract level. Discuss.',
            answer: 'any spreads and disables checks in consumer code. unknown forces narrowing before use. Weak answers say they are the same. A strong answer adds that the real fix is a proper type.',
          },
        ],
      },
      {
        q: 'How do you document shared types so other teams use them correctly?',
        short: 'Use TSDoc comments on types and fields, with @deprecated, @example and @see, so the editor shows the docs on hover.',
        long: `TSDoc comments (\`/** ... */\`) appear in IntelliSense, so they reach people where they code.
@deprecated makes the editor strike through old fields, which helps safe migrations.
Document units, formats and invariants, like "amount in cents" or "ISO date".
Pitfall: comments that repeat the type name add nothing; write what the type cannot say.
Strong answer: uses @deprecated for migrations and adds examples for tricky types.
Weak answer: keeps docs in a wiki that nobody opens.`,
        follow: 'How do you remove a deprecated field later?',
        exercises: [
          {
            task: 'Add docs so users know price is in cents and oldPrice should not be used.',
            description: 'Checks TSDoc tags.',
            code: 'interface Product { price: number; oldPrice?: number }',
            answer: 'Add a comment about cents and a @deprecated tag pointing to the new field.',
            solution: `interface Product {
  /** Price in cents, for example 1999 for $19.99. */
  price: number;
  /** @deprecated Use price instead. Removed in v3. */
  oldPrice?: number;
}`,
          },
          {
            task: 'Which things should a type comment explain, and which should it skip?',
            description: 'Checks taste in documentation.',
            answer: 'Explain units, formats, allowed ranges and side effects. Skip things the type already says, like "this is a string".',
          },
        ],
      },
    ],
  },
  'Classes and inheritance': {
    junior: [
      {
        q: 'What are parameter properties in a TypeScript constructor?',
        short: 'Adding public, private, protected or readonly to a constructor parameter declares and assigns a class field in one step.',
        long: '`constructor(private name: string) {}` creates a field name and assigns it.\nIt saves boilerplate in services and DTO classes.\nIt is TS-only syntax; erasableSyntaxOnly and Node type stripping reject it.\nPitfall: forgetting the modifier, so the value is just a local parameter.\nStrong answer: knows it emits real assignment code and is not just a type.\nWeak answer: thinks every parameter becomes a field.',
        exercises: [
          {
            task: 'Rewrite this class with parameter properties.',
            description: 'Checks the shorthand. Ask for a live rewrite in the Playground.',
            code: `class User {
  readonly id: string;
  private name: string;
  constructor(id: string, name: string) { this.id = id; this.name = name; }
}`,
            answer: 'Move the modifiers into the constructor parameters and remove the body. A common mistake is leaving the field declarations too, which causes duplicate identifier errors. A strong answer mentions erasableSyntaxOnly.',
            solution: `class User {
  constructor(readonly id: string, private name: string) {}
}`,
          },
          {
            task: 'Does this class have a field called name? Explain.',
            description: 'Checks that a parameter without a modifier is not a field. Show the code.',
            code: `class A { constructor(name: string) {} }
new A('x').name;`,
            answer: 'No. Without a modifier, name is just a parameter, so `.name` is an error. Weak answers say TS adds it automatically. Add public, private, or readonly to make it a field.',
          },
        ],
      },
      {
        q: 'Fix this class. The field is used before it has a value.',
        code: `class Counter {
  count: number;
  inc() { this.count++; }
}`,
        fix: `class Counter {
  count = 0;
  inc() { this.count++; }
}`,
        short: 'With strictPropertyInitialization, every field must be set in the declaration or the constructor.',
        long: 'strict mode turns on strictPropertyInitialization.\nA field without an initializer would be undefined at runtime, so count++ gives NaN.\nFix by giving a default or assigning in the constructor.\nThe `!` definite assignment operator silences the error but does not fix it.\nStrong answer: uses `!` only when a framework sets the field (for example DI).\nWeak answer: turns off strict mode.',
        exercises: [
          {
            task: 'When is `name!: string` acceptable?',
            description: 'Checks the definite assignment assertion. Discuss with an example.',
            answer: 'When something outside the constructor surely sets it, like a framework lifecycle or an init method called right after. It is a promise to the compiler, not a check. Weak answers use it everywhere to remove errors.',
          },
          {
            task: 'Fix the error without using `!`.',
            description: 'Checks constructor assignment. Run in the Playground with strict on.',
            code: `class Timer { id: number; start() { this.id = setTimeout(() => {}, 100) as unknown as number } }`,
            answer: 'Make it optional (`id?: number`) or `number | undefined`, because it really is undefined before start. That is honest typing. A strong answer also prefers `ReturnType<typeof setTimeout>` over the double cast.',
            solution: `class Timer { id?: ReturnType<typeof setTimeout>; start() { this.id = setTimeout(() => {}, 100) } }`,
          },
        ],
      },
      {
        q: 'What does the super keyword do in a class?',
        short: 'super() calls the parent constructor, and super.method() calls the parent version of a method.',
        long: 'In a subclass constructor, you must call super() before using this.\nsuper.method() lets you extend parent behavior instead of replacing it.\nTS reports an error if this is used before super().\nPitfall: forgetting to pass required arguments to super.\nStrong answer: explains both uses and the order rule.\nWeak answer: only knows super() in constructors.',
        exercises: [
          {
            task: 'Override greet so it adds an exclamation mark to the parent result.',
            description: 'Checks super.method(). Ask for code.',
            code: `class A { greet() { return 'hi' } }`,
            answer: 'In class B extends A, write `override greet() { return super.greet() + "!" }`. A strong answer adds the override keyword. A wrong answer copies the parent logic.',
            solution: `class B extends A { override greet() { return super.greet() + '!' } }`,
          },
          {
            task: 'Find the error in this constructor.',
            description: 'Checks the super order rule. Run in the Playground.',
            code: `class B extends A { x: number; constructor() { this.x = 1; super(); } }`,
            answer: 'this is used before super(), which is an error in TS and a ReferenceError at runtime. Move super() first. Weak answers think order does not matter.',
          },
        ],
      },
    ],
    middle: [
      {
        q: 'What does the override keyword do? Why turn on noImplicitOverride?',
        short: 'override marks a method that replaces a parent method; noImplicitOverride makes it required, so renames in the parent are caught.',
        long: 'Without override, renaming a parent method leaves a child method that silently no longer overrides.\nWith override, TS errors if the parent has no such member.\nnoImplicitOverride forces the keyword on every real override.\nIt also works on properties.\nStrong answer: gives the rename scenario.\nWeak answer: thinks override changes runtime behavior.',
        exercises: [
          {
            task: 'What error does this give with noImplicitOverride on?',
            description: 'Checks the flag. Enable it in Playground settings.',
            code: `class A { save() {} }
class B extends A { save() {} }`,
            answer: 'B.save needs the override modifier because it overrides a member in A. Adding override fixes it. A strong answer explains the safety gain.',
          },
          {
            task: 'Parent renamed save to persist. What does override catch?',
            description: 'Checks refactor safety. Show the code.',
            code: `class A { persist() {} }
class B extends A { override save() {} }`,
            answer: 'TS errors: save is not declared in A. Without override, B would just have a new unused method. Weak answers do not see the risk.',
          },
        ],
      },
      {
        q: 'Fix this code. The abstract class is used wrongly.',
        code: `abstract class Repo<T> { abstract get(id: string): Promise<T> }
const r = new Repo<string>();
class UserRepo extends Repo<User> {}`,
        fix: `abstract class Repo<T> { abstract get(id: string): Promise<T> }
class UserRepo extends Repo<User> {
  async get(id: string): Promise<User> { return fetchUser(id) }
}
const r = new UserRepo();`,
        short: 'Abstract classes cannot be created with new, and subclasses must implement every abstract member.',
        long: 'An abstract class is a partial template.\nnew on it is a compile error.\nA non-abstract subclass must implement all abstract members, or be abstract too.\nUnlike interfaces, abstract classes can hold shared code and exist at runtime.\nStrong answer: compares with interfaces and composition.\nWeak answer: thinks abstract is only a comment.',
        exercises: [
          {
            task: 'Type a factory that takes any concrete subclass of Repo.',
            description: 'Checks abstract construct signatures. Ask for the parameter type.',
            answer: 'Use `new () => Repo<T>` for concrete classes. `abstract new () => Repo<T>` accepts abstract classes too, but you cannot call new on it. A strong answer knows the abstract construct signature syntax added in TS 4.2.',
            solution: `function make<T>(C: new () => Repo<T>) { return new C() }`,
          },
          {
            task: 'Abstract class or interface for a payment provider? Explain.',
            description: 'Checks design judgment. Discuss.',
            answer: 'Interface if you only need a contract; abstract class if providers share real code like retries. Weak answers pick one with no reason. A strong answer prefers interface plus composed helpers.',
          },
        ],
      },
      {
        q: 'How do you type the this return value for fluent builders in subclasses?',
        short: 'Return the polymorphic `this` type so chained calls keep the subclass type.',
        long: 'If a method returns the class name, a subclass chain loses its own methods.\nReturning `this` makes the type follow the actual instance.\nWorks for builders and fluent APIs.\nPitfall: returning `new Base()` breaks it at runtime.\nStrong answer: names polymorphic this.\nWeak answer: overrides every method in the subclass.',
        exercises: [
          {
            task: 'Fix the chain so it compiles.',
            description: 'Checks polymorphic this. Run in the Playground.',
            code: `class Q { where(): Q { return this } }
class UQ extends Q { active(): UQ { return this } }
new UQ().where().active();`,
            answer: 'Change `where(): Q` to `where(): this`. Then `where()` returns UQ in the subclass. Weak answers cast. A strong answer explains the type follows the receiver.',
            solution: `class Q { where(): this { return this } }`,
          },
          {
            task: 'What does `this is Admin` mean as a return type?',
            description: 'Checks this-based type guards. Show a method example.',
            answer: 'It is a type guard on the instance: after `if (u.isAdmin())`, u is narrowed to Admin. Weak answers say it returns this. It must return boolean.',
          },
        ],
      },
    ],
    senior: [
      {
        q: 'Why can a class instance pass instanceof checks but fail structural checks, or the other way round?',
        short: 'instanceof checks the prototype chain at runtime, while TS checks shape at compile time; private members make class types nominal-like.',
        long: 'A plain object with the same shape type-checks as a class type but fails instanceof.\nClasses with private or protected members are only compatible with instances of the same declaration.\nDuplicate package copies make instanceof fail across bundles.\nAfter JSON parse, class instances become plain objects.\nStrong answer: covers duplicate packages and serialization.\nWeak answer: thinks TS types and instanceof are the same thing.',
        ai: true,
        exercises: [
          {
            task: 'Why does this compile but print false?',
            description: 'Checks structural typing versus prototype. Run it in Node.',
            code: `class P { x = 1 }
const p: P = { x: 1 };
console.log(p instanceof P);`,
            answer: 'The literal matches the shape, so TS accepts it. At runtime it has no P prototype. Add a private field to make P nominal-like. Weak answers say TS creates a P.',
          },
          {
            task: 'Why does adding `private brand` stop the assignment?',
            description: 'Checks private member nominality. Add it and re-run.',
            code: `class P { private brand = 0; x = 1 }
const p: P = { x: 1 };`,
            answer: 'Types with private members are only compatible with types from the same class declaration. The literal cannot have the private member. Strong answers mention #private too.',
          },
        ],
      },
      {
        q: 'Fix this code. Arrow function fields break subclass overrides.',
        code: `class Base { handle = () => 'base'; }
class Child extends Base { override handle() { return 'child' } }`,
        fix: `class Base { handle(): string { return 'base' } }
class Child extends Base { override handle() { return 'child' } }
// bind at the call site when passing as callback: el.onclick = () => obj.handle();`,
        short: 'An arrow field is an instance property set in the constructor, so a prototype method in the child cannot override it.',
        long: 'TS reports: class Base defines handle as a property, Child defines it as a method.\nEven if forced, the instance field shadows the prototype method at runtime.\nArrow fields also cannot use super.handle().\nThey cost one function per instance.\nFix: use methods and bind where you pass them.\nStrong answer: explains field versus prototype placement.\nWeak answer: converts both to arrows without thinking.',
        exercises: [
          {
            task: 'Explain the order of field initialization in a subclass.',
            description: 'Checks constructor and field order. Predict output, then run.',
            code: `class A { name = 'A'; constructor() { console.log(this.name) } }
class B extends A { name = 'B' }
new B();`,
            answer: 'Prints A. Base fields and constructor run before the subclass fields. Weak answers say B. A strong answer warns against calling overridable methods in constructors.',
          },
          {
            task: 'When are arrow function fields a good choice?',
            description: 'Checks trade-off judgment. Discuss.',
            answer: 'For leaf classes where the method is passed as a callback and never overridden. Cost: memory per instance and no super. Strong answers mention the field approach in old React class components.',
          },
        ],
      },
      {
        q: 'What does `accessor` do in TypeScript 5 classes?',
        short: 'The accessor keyword creates an auto-accessor: a private storage slot with a generated getter and setter, mainly for standard decorators.',
        long: '`accessor x = 1` defines get x and set x backed by a hidden private field.\nIt is part of the TC39 decorators proposal, supported since TS 4.9.\nAccessor decorators can intercept get and set, unlike field decorators.\nIt lives on the prototype as accessors, not as an own data property.\nStrong answer: links it to decorators and reactive libraries.\nWeak answer: does not know it.',
        ai: true,
        exercises: [
          {
            task: 'Write an accessor decorator that logs each set.',
            description: 'Checks ClassAccessorDecoratorContext. Use TS 5 without experimentalDecorators.',
            answer: 'Return an object with set that logs then calls target.set.call(this, v). A wrong answer uses the legacy descriptor signature. A strong answer types the target and context.',
            solution: `function logSet<T, V>(t: ClassAccessorDecoratorTarget<T, V>, ctx: ClassAccessorDecoratorContext<T, V>) {
  return { set(this: T, v: V) { console.log(String(ctx.name), v); t.set.call(this, v) } };
}
class S { @logSet accessor count = 0 }`,
          },
          {
            task: 'Does Object.keys(new S()) include count? Why?',
            description: 'Checks runtime shape of auto-accessors. Run with tsc target ES2022.',
            answer: 'No. count is a getter and setter on the prototype; the storage is a private field. This matters for serialization. Weak answers say yes.',
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'When do you allow inheritance in your codebase, and when do you ask for composition?',
        short: 'Allow shallow inheritance for true is-a relations and framework base classes; prefer composition for sharing behavior.',
        long: 'Deep hierarchies create fragile base class problems.\nRule of thumb: at most one level of your own base classes.\nShare behavior with functions, hooks, or injected services.\nAllow framework requirements like Error subclasses or web components.\nStrong answer: gives a clear rule plus exceptions and how to enforce it in review.\nWeak answer: "inheritance is bad" with no nuance.',
        exercises: [
          {
            task: 'Refactor a BaseApiService with ten protected helpers into composition.',
            description: 'Checks refactoring plan. Ask for the target shape.',
            answer: 'Create an HttpClient and small helpers, inject them into each service. Services implement an interface. Migrate one service at a time. Weak answers rewrite everything at once.',
          },
          {
            task: 'Name a valid reason to extend a class in frontend code.',
            description: 'Checks nuance. Discuss.',
            answer: 'Custom errors (class ApiError extends Error) for instanceof checks, or custom elements extending HTMLElement. A strong answer mentions setting name and cause on errors.',
          },
        ],
      },
      {
        q: 'Fix this custom error. instanceof fails in old builds.',
        code: `class ApiError extends Error {
  constructor(public status: number, msg: string) { super(msg) }
}
// compiled to ES5: err instanceof ApiError is false`,
        fix: `class ApiError extends Error {
  constructor(public status: number, msg: string, options?: ErrorOptions) {
    super(msg, options);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}`,
        short: 'When targeting ES5, extending built-ins breaks the prototype chain; restore it with Object.setPrototypeOf, or target ES2015+.',
        long: 'ES5 down-leveling calls Error as a function, which returns a new object.\nThe subclass prototype is lost, so instanceof and methods fail.\nBest fix: target ES2015 or later in tsconfig.\nOtherwise call Object.setPrototypeOf(this, new.target.prototype).\nAlso set name and pass cause for better logs.\nStrong answer: knows the root cause and prefers fixing the target.\nWeak answer: replaces instanceof with string checks.',
        exercises: [
          {
            task: 'What tsconfig setting removes this problem?',
            description: 'Checks build config knowledge. Discuss.',
            answer: 'Set target to ES2015 or newer, so native class syntax is emitted. Modern browsers support it. Weak answers do not connect target to runtime behavior.',
          },
          {
            task: 'How do you make errors safe across package boundaries?',
            description: 'Checks duplicate package issue. Discuss.',
            answer: 'instanceof fails if two copies of the package exist. Add a discriminant like `code` or a static isApiError guard. A strong answer also dedupes dependencies.',
          },
        ],
      },
      {
        q: 'How do you set rules for classes in a React and TypeScript team?',
        short: 'Use plain types and functions for data and UI; use classes only for stateful services, errors, and integration code.',
        long: 'React state needs plain serializable data.\nClasses in state break structural cloning and devtools.\nServices like API clients or a WebSocket manager fit classes well.\nDocument the rule and enforce with lint where possible.\nStrong answer: gives clear boundaries and reasons.\nWeak answer: bans or allows classes everywhere.',
        exercises: [
          {
            task: 'Explain why a class instance in Redux state is a problem.',
            description: 'Checks serialization knowledge. Discuss.',
            answer: 'Redux expects serializable values; class instances lose methods after persist or devtools replay and break equality. Weak answers say it is fine. A strong answer mentions the serializability middleware warning.',
          },
          {
            task: 'Write a lint rule plan to limit class usage.',
            description: 'Checks enforcement. Ask for tools.',
            answer: 'Use no-restricted-syntax for ClassDeclaration in component folders, with overrides for services. Weak answers rely on memory. A strong answer explains exceptions in the config.',
          },
        ],
      },
    ],
  },
  'Access modifiers (public, private, protected)': {
    junior: [
      {
        q: 'What is the default access level of a class member in TypeScript?',
        short: 'public. If you write no modifier, the member can be used from anywhere.',
        long: 'Members without a modifier are public.\nWriting public explicitly is optional but some teams require it for clarity.\nprivate and protected are compile-time only.\nPitfall: thinking default is private like in some other languages.\nStrong answer: says public and mentions the lint rule explicit-member-accessibility.\nWeak answer: says private.',
        exercises: [
          {
            task: 'Which lines compile?',
            description: 'Checks default access. Run in the Playground.',
            code: `class A { x = 1; private y = 2 }
const a = new A();
a.x; a.y;`,
            answer: 'a.x compiles because x is public by default. a.y fails because y is private. Weak answers say both fail.',
          },
          {
            task: 'Make the field visible only inside the class.',
            description: 'Checks the private keyword. Ask for code.',
            code: `class Wallet { balance = 0 }`,
            answer: 'Add private: `private balance = 0`, or use `#balance` for runtime privacy. A strong answer mentions both and the difference.',
            solution: `class Wallet { private balance = 0 }`,
          },
        ],
      },
      {
        q: 'Fix this code. A subclass cannot read the field.',
        code: `class Animal { private name = 'x' }
class Dog extends Animal { bark() { return this.name + ' barks' } }`,
        fix: `class Animal { protected name = 'x' }
class Dog extends Animal { bark() { return this.name + ' barks' } }`,
        short: 'private members are visible only in the declaring class; use protected so subclasses can access them.',
        long: 'private: only inside the same class.\nprotected: inside the class and its subclasses.\npublic: everywhere.\nPitfall: making it public just to fix the error exposes it to everyone.\nStrong answer: picks the narrowest modifier that works.\nWeak answer: makes everything public.',
        exercises: [
          {
            task: 'Can outside code read a protected field? Test it.',
            description: 'Checks protected scope. Run `new Dog().name`.',
            answer: 'No. protected is only visible inside the class hierarchy. Weak answers confuse it with public. A strong answer adds a public getter if outside access is needed.',
          },
          {
            task: 'Add a read-only public view of the protected name.',
            description: 'Checks getters. Ask for code.',
            answer: 'Add `get displayName() { return this.name }` with no setter. Outside code can read it but not change it. A strong answer mentions readonly as an alternative.',
            solution: `class Animal { protected name = 'x'; get displayName() { return this.name } }`,
          },
        ],
      },
      {
        q: 'What is the difference between private and readonly?',
        short: 'private controls who can see a member; readonly controls whether it can be reassigned after construction.',
        long: 'private hides the member from code outside the class.\nreadonly lets everyone read it, but nobody can reassign it after the constructor.\nYou can combine them: `private readonly`.\nBoth are compile-time only.\nStrong answer: says they solve different problems and can combine.\nWeak answer: thinks they are the same.',
        exercises: [
          {
            task: 'Which line fails? Explain.',
            description: 'Checks readonly. Run in the Playground.',
            code: `class C { readonly id = 1; constructor() { this.id = 2 } set() { this.id = 3 } }`,
            answer: 'The assignment in set() fails. Assigning in the constructor is allowed. Weak answers think both fail.',
          },
          {
            task: 'Make a config value that only the class can read, and nobody can change.',
            description: 'Checks combining modifiers. Ask for code.',
            answer: 'Use `private readonly apiUrl: string` set in the constructor. A strong answer uses a parameter property.',
            solution: `class Api { constructor(private readonly apiUrl: string) {} }`,
          },
        ],
      },
    ],
    middle: [
      {
        q: 'Can a protected constructor be useful? Give an example.',
        short: 'Yes: it stops direct new calls from outside while allowing subclasses or static factory methods to create instances.',
        long: 'A private constructor allows only static factories inside the class (for example singleton or validated create).\nA protected constructor also lets subclasses call super().\nOutside code must use the factory.\nThis enforces validation in one place.\nStrong answer: gives the factory pattern with validation.\nWeak answer: says constructors must be public.',
        exercises: [
          {
            task: 'Write an Email class that can only be created by Email.parse.',
            description: 'Checks private constructors. Ask for code and test `new Email("x")`.',
            answer: 'Make the constructor private and add a static parse that validates and returns Email or null. new Email outside fails. A strong answer returns a Result type.',
            solution: `class Email {
  private constructor(readonly value: string) {}
  static parse(s: string): Email | null { return s.includes('@') ? new Email(s) : null }
}`,
          },
          {
            task: 'Can a subclass extend a class with a private constructor?',
            description: 'Checks rules. Try it in the Playground.',
            answer: 'No. TS reports that the class is not extendable because its constructor is private. With protected it works. Weak answers say yes.',
          },
        ],
      },
      {
        q: 'Fix this code. A sibling instance reads a protected field.',
        code: `class Base { protected secret = 1 }
class A extends Base {
  peek(other: Base) { return other.secret }
}`,
        fix: `class Base { protected secret = 1 }
class A extends Base {
  peek(other: A) { return other.secret }
}`,
        short: 'Protected members can only be accessed through an instance of the current class or its subclasses, not through the base type.',
        long: 'Inside A you can read secret on this or on other A values.\nYou cannot read it on a Base reference, because that might be a different subclass.\nThis keeps one subclass from reading another sibling subclass data.\nprivate members, by contrast, can be read on any instance of the same class.\nStrong answer: explains the sibling rule.\nWeak answer: expects protected to work on any Base.',
        ai: true,
        exercises: [
          {
            task: 'Does this compile? Explain.',
            description: 'Checks cross-instance private access. Run in the Playground.',
            code: `class P { private v = 1; same(o: P) { return o.v === this.v } }`,
            answer: 'Yes. private is per class, not per instance, so methods can read other instances of the same class. Weak answers say no. This is common for equals methods.',
          },
          {
            task: 'Why does TypeScript block the sibling access?',
            description: 'Checks reasoning. Discuss.',
            answer: 'other may be a B that extends Base; A should not see B internals. Weak answers call it a bug. A strong answer compares it with C# and Java rules.',
          },
        ],
      },
      {
        q: 'Can an interface have private members? What do you do instead?',
        short: 'No. An interface describes only the public shape. Keep private details in the class, or hide them with module scope or closures.',
        long: `Interfaces have no access modifiers except readonly.
A class can implement an interface and add private members of its own.
To hide data from users, export only the interface and a factory function, not the class.
Pitfall: an interface that extends a class with private members can only be implemented by that class or its subclasses.
Strong answer: separates public contract from private implementation.
Weak answer: writes \`private\` in an interface.`,
        follow: 'What happens when an interface extends a class with private fields?',
        exercises: [
          {
            task: 'Fix this code.',
            description: 'Checks that interfaces have no private.',
            code: 'interface Client { private token: string; get(url: string): Promise<unknown> }',
            answer: 'Remove private from the interface and keep the token in the class.',
            solution: `interface Client { get(url: string): Promise<unknown> }
class HttpClient implements Client { private token = ''; async get(url: string) { return fetch(url); } }`,
          },
          {
            task: 'Export a counter whose count cannot be changed from outside, without a class.',
            description: 'Checks closures as privacy.',
            answer: 'Return an object with methods that close over a local variable.',
            solution: 'export function createCounter() { let n = 0; return { inc: () => ++n, get: () => n }; }',
          },
        ],
      },
    ],
    senior: [
      {
        q: 'Why does a class with a private field become incompatible with an identical class?',
        short: 'Private and protected members make class types nominal-like: they only match types from the same declaration.',
        long: 'Two classes with the same public shape are compatible.\nIf either has a private member, they are only compatible with the same original declaration.\nThis can break with two versions of the same package in node_modules.\nIt is also a cheap way to create branded types.\nStrong answer: mentions duplicate package versions.\nWeak answer: expects pure structural typing.',
        ai: true,
        exercises: [
          {
            task: 'Why does this assignment fail?',
            description: 'Checks nominal private rule. Run in the Playground.',
            code: `class A { private x = 1 }
class B { private x = 1 }
const a: A = new B();`,
            answer: 'Types have separate declarations of a private property x. Weak answers expect them to match. Without private, it would compile.',
          },
          {
            task: 'An app has a type error between two copies of a library class. How do you fix it?',
            description: 'Checks dependency debugging. Discuss steps.',
            answer: 'Run npm ls to find duplicates, dedupe or use overrides/resolutions, and make the library a peerDependency. Weak answers cast to any. A strong answer explains the private nominal rule as root cause.',
          },
        ],
      },
      {
        q: 'Fix this code. The #private check throws on plain objects.',
        code: `class Money {
  #cents: number;
  constructor(c: number) { this.#cents = c }
  equals(o: Money) { return this.#cents === o.#cents }
}
new Money(1).equals({} as Money);`,
        fix: `class Money {
  #cents: number;
  constructor(c: number) { this.#cents = c }
  equals(o: unknown): boolean { return o instanceof Object && #cents in o && this.#cents === o.#cents }
}`,
        short: 'Reading a #private field on an object without it throws TypeError; use the `#field in obj` brand check (TS 4.5+).',
        long: 'Hard private fields are checked at runtime.\nA fake or plain object makes `o.#cents` throw.\n`#cents in o` safely checks the brand and narrows o to Money.\nThis is stronger than instanceof across realms.\nStrong answer: knows ergonomic brand checks.\nWeak answer: wraps in try/catch.',
        exercises: [
          {
            task: 'Write a static isMoney guard using a brand check.',
            description: 'Checks `#x in obj` narrowing. Test with a plain object.',
            answer: 'Inside the class: `static isMoney(o: unknown): o is Money { return typeof o === "object" && o !== null && #cents in o }`. Weak answers use instanceof only. A strong answer explains it works even with prototype tricks.',
            solution: `class Money {
  #cents = 0;
  static isMoney(o: unknown): o is Money { return typeof o === 'object' && o !== null && #cents in o }
}`,
          },
          {
            task: 'Do #private fields work with Proxy? Explain.',
            description: 'Checks a known pitfall. Discuss, then try in Node.',
            answer: 'No. A Proxy has no private slots, so methods that read #field on this (the proxy) throw. This breaks some reactive libraries like Vue reactive. Strong answers mention binding to the raw target.',
          },
        ],
      },
      {
        q: 'How do private and #private appear in .d.ts files?',
        short: 'TS private members appear by name with no type; #private fields show up as a single `#private;` marker.',
        long: 'Declaration emit keeps `private x;` without its type to keep nominal behavior.\nFor hard private fields it emits `#private;` to mark the class as branded.\nConsumers cannot see the types of internal members.\nRenaming a TS private field changes the public .d.ts, which can break consumers.\nStrong answer: knows emit shapes and why the names stay.\nWeak answer: thinks private members are removed.',
        exercises: [
          {
            task: 'Predict the .d.ts output.',
            description: 'Checks declaration emit. Run `tsc --declaration` on it.',
            code: `export class A { private a: number = 1; #b = 2; protected c = 3 }`,
            answer: 'Output: `private a; #private; protected c: number;`. Private types are hidden, the hard private is one marker. Weak answers say they vanish.',
          },
          {
            task: 'Why keep private names in .d.ts at all?',
            description: 'Checks reasoning. Discuss.',
            answer: 'To keep the nominal compatibility rule and to stop subclasses from adding a member with the same name. Weak answers have no reason.',
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'How do you hide internal members from the published type files of a library?',
        short: 'Mark them with the @internal TSDoc tag and turn on stripInternal, or use API Extractor to produce a trimmed .d.ts.',
        long: `Public members still appear in .d.ts files, even if only your own packages should use them.
\`/** @internal */\` plus \`stripInternal: true\` removes them from the declaration output.
API Extractor can create a reviewed API report and trim files per release tag.
Pitfall: stripping a type that a public member uses breaks the published types.
Strong answer: combines @internal, an API report in CI, and the exports field.
Weak answer: relies on naming members with an underscore.`,
        follow: 'How does an API report in CI help reviews?',
        exercises: [
          {
            task: 'Mark the helper so it does not appear in the published types.',
            description: 'Checks stripInternal usage.',
            code: 'export class Sdk { resetCacheForTests() {} }',
            answer: 'Add the @internal comment and enable stripInternal in tsconfig.',
            solution: `export class Sdk {
  /** @internal */
  resetCacheForTests() {}
}
// tsconfig: "stripInternal": true`,
          },
          {
            task: 'Why can stripInternal break users\' builds?',
            description: 'Checks the risk.',
            answer: 'If a public type refers to an internal type, the .d.ts points to a missing name. Check the output in CI.',
          },
        ],
      },
      {
        q: 'Fix this service. Internal helpers are public and other teams use them.',
        code: `export class AuthService {
  token = '';
  refreshInternal() {}
  login(u: string, p: string) {}
}`,
        fix: `export interface AuthService { login(u: string, p: string): Promise<void> }
class AuthServiceImpl implements AuthService {
  #token = '';
  #refresh() {}
  async login(u: string, p: string) { this.#refresh() }
}
export const createAuthService = (): AuthService => new AuthServiceImpl();`,
        short: 'Hide state and helpers with #private, and expose only an interface and a factory.',
        long: 'Public by default leaks internals into other teams code.\nRemoving them later is a breaking change.\nPlan: add the new interface, deprecate old members, then remove in a major release.\nUse lint to flag explicit public members without a reason.\nStrong answer: includes the migration path.\nWeak answer: just adds private and breaks everyone.',
        exercises: [
          {
            task: 'Plan the deprecation of refreshInternal.',
            description: 'Checks migration process. Ask for steps.',
            answer: 'Add @deprecated JSDoc, find usages with search, offer the replacement, then remove in the next major. Weak answers delete it at once.',
          },
          {
            task: 'Which lint rule helps here?',
            description: 'Checks tooling. Discuss.',
            answer: '@typescript-eslint/explicit-member-accessibility forces a conscious choice per member. Strong answers also mention member-ordering.',
          },
        ],
      },
      {
        q: 'Do access modifiers matter for security in the browser?',
        short: 'No. All client code and memory can be read by the user; modifiers only protect code structure, not secrets.',
        long: 'TS private disappears after compile.\n#private hides from other code but not from devtools or a memory snapshot.\nSecrets like API keys must never be in the frontend.\nUse modifiers for maintainability, not for protection.\nStrong answer: separates encapsulation from security.\nWeak answer: stores tokens in private fields and calls it safe.',
        exercises: [
          {
            task: 'Where should an access token live in a SPA?',
            description: 'Checks security thinking. Discuss options.',
            answer: 'Prefer an httpOnly secure cookie; otherwise keep it in memory, not localStorage. Modifiers do not change risk. Weak answers say a private field is secure.',
          },
          {
            task: 'Explain to a junior why #private is not a security feature.',
            description: 'Checks communication. Ask for a short explanation.',
            answer: 'Anyone with devtools can pause code and read the value in the debugger. #private stops other code from using it, not people. A strong answer stays simple.',
          },
        ],
      },
    ],
  },
  Generics: {
    junior: [
      {
        q: 'Why use a generic function instead of a function that takes any?',
        short: 'A generic keeps the link between input and output types; any throws the type away.',
        long: '`function first(a: any[]): any` returns any, so mistakes are not caught.\n`function first<T>(a: T[]): T | undefined` returns the real element type.\nTS usually infers T from the arguments.\nPitfall: adding a type parameter that is used only once adds nothing.\nStrong answer: says a generic links two or more positions.\nWeak answer: thinks generics are just a fancy any.',
        exercises: [
          {
            task: 'Make this function generic so the return type is correct.',
            description: 'Checks basic generics. Use the Playground and hover over the result.',
            code: `function last(arr: any[]) { return arr[arr.length - 1] }`,
            answer: 'Write `function last<T>(arr: T[]): T | undefined`. The undefined covers empty arrays. Weak answers keep any or forget undefined.',
            solution: `function last<T>(arr: T[]): T | undefined { return arr[arr.length - 1] }`,
          },
          {
            task: 'What is the type of x here?',
            description: 'Checks inference. Hover in the Playground.',
            code: `function wrap<T>(v: T) { return { v } }
const x = wrap('hi');`,
            answer: '`{ v: string }`. T is inferred as string from the argument. Weak answers say any or "hi".',
          },
        ],
      },
      {
        q: 'Fix this code. The generic function reads a property that may not exist.',
        code: `function getLength<T>(x: T) { return x.length }`,
        fix: `function getLength<T extends { length: number }>(x: T) { return x.length }`,
        short: 'An unconstrained T can be anything, so add a constraint with extends.',
        long: 'Inside the function, TS only knows what the constraint promises.\n`T extends { length: number }` allows strings, arrays, and any object with length.\nPitfall: constraining to `string | any[]` is less flexible.\nStrong answer: explains that constraints describe what you need, not what you expect.\nWeak answer: uses any.',
        exercises: [
          {
            task: 'Which calls compile with the fixed function?',
            description: 'Checks constraints. Run in the Playground.',
            code: `getLength('abc'); getLength([1]); getLength(5); getLength({ length: 2 });`,
            answer: 'All except getLength(5): number has no length. Weak answers think only arrays work. Strong answers mention structural matching.',
          },
          {
            task: 'Write a generic function that returns the id of any object with an id.',
            description: 'Checks constraints plus indexed type. Ask for code.',
            answer: '`function getId<T extends { id: unknown }>(o: T): T["id"] { return o.id }`. It keeps the exact id type. Weak answers return any.',
            solution: `function getId<T extends { id: unknown }>(o: T): T['id'] { return o.id }`,
          },
        ],
      },
      {
        q: 'How do you write a generic interface for an API response?',
        short: 'Add a type parameter to the interface, like `interface ApiResponse<T> { data: T; error?: string }`.',
        long: 'Generic interfaces let one shape wrap many data types.\nYou pass the type when using it: ApiResponse<User>.\nYou can give a default: `<T = unknown>`.\nPitfall: making data optional everywhere instead of modeling success and failure.\nStrong answer: may suggest a discriminated union for success and error.\nWeak answer: uses any for data.',
        exercises: [
          {
            task: 'Write ApiResponse<T> with a default of unknown.',
            description: 'Checks generic defaults. Ask for code.',
            answer: '`interface ApiResponse<T = unknown> { data: T; status: number }`. Then ApiResponse alone means unknown data. A weak answer uses any default.',
            solution: `interface ApiResponse<T = unknown> { data: T; status: number }`,
          },
          {
            task: 'Type a fetch helper that returns Promise<ApiResponse<T>>.',
            description: 'Checks using generics in async functions. Ask for the signature.',
            answer: '`async function get<T>(url: string): Promise<ApiResponse<T>>`. A strong answer notes the T is not checked at runtime; it is a trust boundary.',
          },
        ],
      },
    ],
    middle: [
      {
        q: 'What is a generic class? Write a typed Stack.',
        short: 'A generic class has a type parameter on the class, like `class Stack<T>`. Every method then uses the same T.',
        long: `The type parameter is fixed when you create the instance: \`new Stack<number>()\` or inferred from constructor arguments.
Static members cannot use the class type parameter.
Pitfall: an empty \`new Stack()\` infers unknown, so give the type explicitly.
Strong answer: writes push and pop with correct return types, like \`T | undefined\`.
Weak answer: uses any inside the class.`,
        follow: 'Why can a static method not use T?',
        exercises: [
          {
            task: 'Write a Stack class with push, pop and peek.',
            description: 'Checks a basic generic class.',
            answer: 'pop and peek return T | undefined because the stack can be empty.',
            solution: `class Stack<T> {
  private items: T[] = [];
  push(x: T) { this.items.push(x); }
  pop(): T | undefined { return this.items.pop(); }
  peek(): T | undefined { return this.items[this.items.length - 1]; }
}`,
          },
          {
            task: 'What is the type of s here, and how do you fix it?',
            description: 'Checks inference of class type parameters.',
            code: `const s = new Stack();
s.push(1); s.push('a');`,
            answer: 'It is Stack<unknown>, so push accepts anything. Write `new Stack<string>()`.',
          },
        ],
      },
      {
        q: 'Fix this code. The literal type is lost when you pass it to a generic.',
        code: `function makeRoute<T extends string[]>(paths: T) { return paths }
const r = makeRoute(['home', 'about']); // string[]`,
        fix: `function makeRoute<const T extends readonly string[]>(paths: T) { return paths }
const r = makeRoute(['home', 'about']); // readonly ['home', 'about']`,
        short: 'Use a const type parameter (TS 5.0) so TS infers the literal tuple type.',
        long: 'By default TS widens array literals to string[].\n`const T` asks for inference as if `as const` was written.\nThe constraint should be readonly, or the const inference falls back to wider types.\nUseful for routes, event names, and config keys.\nStrong answer: knows the readonly detail.\nWeak answer: asks callers to write as const everywhere.',
        ai: true,
        exercises: [
          {
            task: 'What happens if the constraint is not readonly?',
            description: 'Checks a known pitfall. Try `<const T extends string[]>` in the Playground.',
            answer: 'A mutable array constraint rejects the readonly tuple, so TS falls back to string[]. Weak answers think it still works. Use readonly.',
          },
          {
            task: 'Get the union of route names from the result.',
            description: 'Checks indexed access on tuples. Ask for a type.',
            answer: '`type Route = (typeof r)[number]` gives "home" | "about". Weak answers write keyof. A strong answer uses this for typed navigation.',
          },
        ],
      },
      {
        q: 'How do generic defaults and constraints work together?',
        short: 'A default is used when TS cannot infer or the caller omits the argument; the default must satisfy the constraint.',
        long: '`<T extends object = {}>` means: must be object, and {} if not given.\nDefaults must come after required parameters.\nInference wins over the default when it is possible.\nPitfall: a default that does not meet the constraint is an error.\nStrong answer: knows inference beats defaults.\nWeak answer: thinks the default always applies.',
        exercises: [
          {
            task: 'Fix this declaration.',
            description: 'Checks order rules. Run in the Playground.',
            code: `interface Box<T = string, U> { a: T; b: U }`,
            answer: 'Required type parameters cannot follow optional ones. Put U first or give it a default. Weak answers do not see the problem.',
            solution: `interface Box<U, T = string> { a: T; b: U }`,
          },
          {
            task: 'What is T here and why?',
            description: 'Checks inference over default. Hover in the Playground.',
            code: `function f<T = string>(x: T) { return x }
const v = f(42);`,
            answer: 'T is 42 (literal number), inferred from the argument. The default is not used. Weak answers say string.',
          },
        ],
      },
    ],
    senior: [
      {
        q: 'What are variance annotations `in` and `out` on type parameters?',
        short: 'They declare whether a type parameter is used in input (contravariant) or output (covariant) positions; TS checks and uses them to speed up comparisons.',
        long: 'Added in TS 4.7: `interface Producer<out T>` and `interface Consumer<in T>`.\nTS checks the annotation matches real use.\nThey help with performance in complex recursive types and make intent clear.\n`in out T` means invariant.\nPitfall: wrong annotations can make unsafe code compile in edge cases; use only when needed.\nStrong answer: explains co- and contravariance with examples.\nWeak answer: does not know variance.',
        ai: true,
        exercises: [
          {
            task: 'Which annotation fits, and why?',
            description: 'Checks variance reasoning. Ask the candidate to annotate each.',
            code: `interface Getter<T> { get(): T }
interface Setter<T> { set(v: T): void }
interface State<T> { get(): T; set(v: T): void }`,
            answer: 'Getter: out. Setter: in. State: in out (invariant). Weak answers use out for all. A strong answer explains assignability for Animal and Dog.',
          },
          {
            task: 'Is Setter<Animal> assignable to Setter<Dog>? Explain.',
            description: 'Checks contravariance. Discuss, then test.',
            answer: 'Yes. Something that accepts any Animal can accept a Dog. The reverse is unsafe. Weak answers flip it.',
          },
        ],
      },
      {
        q: 'Fix this code. The generic return type cannot be satisfied.',
        code: `function create<T extends { id: string }>(): T {
  return { id: crypto.randomUUID() };
}`,
        fix: `function create<T extends { id: string }>(rest: Omit<T, 'id'>): T {
  return { ...rest, id: crypto.randomUUID() } as T;
}`,
        short: 'T could be a subtype with more fields, so `{ id }` is not a T; the caller must provide the rest.',
        long: 'Error: "{ id: string } is assignable to the constraint of type T, but T could be instantiated with a different subtype".\nA generic return type promises the exact caller-chosen type.\nIf the function cannot build that type, it must not return T.\nOptions: take the missing data as input, or return the constraint type instead.\nStrong answer: explains why and avoids blind casts.\nWeak answer: adds as T without thinking.',
        ai: true,
        exercises: [
          {
            task: 'Explain the "could be instantiated with a different subtype" error.',
            description: 'Checks understanding of generic soundness. Ask for an example T.',
            answer: 'If T is `{ id: string; name: string }`, returning `{ id }` misses name. The function does not choose T; the caller does. Weak answers say TS is too strict.',
          },
          {
            task: 'Spot the "return-only generic" smell.',
            description: 'Checks API design. Show the signature.',
            code: `function parse<T>(json: string): T { return JSON.parse(json) }`,
            answer: 'T appears only in the return type, so it is a hidden cast. Prefer returning unknown and validating, or taking a schema. Strong answers name the lint rule no-unnecessary-type-parameters.',
          },
        ],
      },
      {
        q: 'What is NoInfer<T> and when do you need it?',
        short: 'NoInfer (TS 5.4) blocks a position from being used for inference, so T is inferred only from the other arguments.',
        long: 'Example: `function choose<T extends string>(opts: T[], def: NoInfer<T>)`.\nWithout it, a typo in def widens T and is accepted.\nWith it, def must be one of opts.\nBefore 5.4 people used `T & {}` or a second type parameter trick.\nStrong answer: gives the default-value example.\nWeak answer: does not know it.',
        exercises: [
          {
            task: 'Make the bad call fail.',
            description: 'Checks NoInfer. Run in the Playground with TS 5.4+.',
            code: `function pick<T extends string>(opts: T[], def: T) { return def }
pick(['a', 'b'], 'c');`,
            answer: 'Change def to NoInfer<T>. Then T is "a" | "b" and "c" errors. Weak answers add a cast. Strong answers explain the widening.',
            solution: `function pick<T extends string>(opts: T[], def: NoInfer<T>) { return def }`,
          },
          {
            task: 'How did people do this before TS 5.4?',
            description: 'Checks history. Discuss.',
            answer: 'Common tricks: `def: T & {}` lowered inference priority, or `<T, D extends T>`. Both were hacks. Strong answers know NoInfer is the clean way.',
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'How do you test the types in a shared library?',
        short: 'Write type tests: use @ts-expect-error for code that must fail, and tools like expectTypeOf in Vitest or tsd to check exact types.',
        long: `Types are part of the public API, so they can break without any runtime test failing.
\`// @ts-expect-error\` fails the build if the next line stops erroring.
Vitest expectTypeOf and tsd compare inferred types exactly.
Run type tests in CI with tsc --noEmit or vitest typecheck.
Pitfall: testing with \`any\` values makes every type test pass.
Strong answer: tests both good and bad usage.
Weak answer: "the compiler checks it already".`,
        follow: 'Why is @ts-ignore a bad choice in type tests?',
        exercises: [
          {
            task: 'Write type tests for pick(obj, key).',
            description: 'Checks positive and negative type tests.',
            answer: 'Check the return type for a valid key and expect an error for an unknown key.',
            solution: `expectTypeOf(pick({ a: 1 }, 'a')).toEqualTypeOf<number>();
// @ts-expect-error unknown key
pick({ a: 1 }, 'b');`,
          },
          {
            task: 'Why does this type test always pass?',
            description: 'Checks the any trap.',
            code: `const data: any = load();
expectTypeOf(data).toMatchTypeOf<User>();`,
            answer: 'data is any, and any matches every type, so the test checks nothing.',
          },
        ],
      },
      {
        q: 'Fix this shared helper. It returns any, and any spreads through the code.',
        code: `export function parseJson(text: string) {
  return JSON.parse(text);
}
const user = parseJson(raw);
user.nmae.toUpperCase();`,
        fix: `export function parseJson(text: string): unknown {
  return JSON.parse(text);
}
const user = UserSchema.parse(parseJson(raw));
user.name.toUpperCase();`,
        short: 'JSON.parse returns any, so every caller loses type checks. Return unknown and make callers validate.',
        long: `any is contagious: properties of any are any, so typos compile.
Returning unknown forces a check or a schema parse at the boundary.
A generic like \`parseJson<T>()\` looks safe but is just a hidden cast.
Add lint rules like no-unsafe-assignment and no-unsafe-member-access to catch this.
Strong answer: returns unknown, validates, and mentions the lint rules.
Weak answer: adds a generic T and calls it type-safe.`,
        follow: 'Why is `parseJson<T>(text): T` still unsafe?',
        exercises: [
          {
            task: 'Find where any leaks in this code.',
            description: 'Checks tracing any.',
            code: 'async function load() { const res = await fetch(\'/items\'); const items = await res.json(); return items.map((i) => i.id); }',
            answer: 'res.json() returns any in many lib versions, so items and every map result are any. Annotate as unknown and validate.',
          },
          {
            task: 'Which typescript-eslint rules stop any from spreading?',
            description: 'Checks tooling.',
            answer: 'no-explicit-any, no-unsafe-assignment, no-unsafe-member-access, no-unsafe-call and no-unsafe-return.',
          },
        ],
      },
      {
        q: 'When should a team write its own generic utility types, and when should it use a library?',
        short: 'Use built-ins first, a small trusted library like type-fest next, and write custom types only for domain needs with tests.',
        long: 'Built-ins: Partial, Pick, Omit, Record, ReturnType, Awaited.\ntype-fest covers common needs and is tested.\nCustom types should live in one folder with type tests.\nAvoid copying snippets from the internet without tests.\nStrong answer: has a clear order and ownership.\nWeak answer: every developer writes their own DeepPartial.',
        exercises: [
          {
            task: 'Name five built-in utility types and one use each.',
            description: 'Checks basic knowledge at lead level. Quick fire.',
            answer: 'Partial for patch payloads, Pick for view models, Omit for create DTOs, Record for maps, Awaited<ReturnType<typeof f>> for async results. Weak answers know only Partial.',
          },
          {
            task: 'Review this custom type. What is wrong?',
            description: 'Checks edge cases. Show the type.',
            code: `type DeepPartial<T> = { [K in keyof T]?: DeepPartial<T[K]> };`,
            answer: 'It also maps functions and Date into objects, and arrays become odd. Handle primitives and functions first. Strong answers suggest type-fest PartialDeep.',
          },
        ],
      },
    ],
  },
  Decorators: {
    junior: [
      {
        q: 'What is a decorator factory? How is it different from a plain decorator?',
        short: 'A decorator factory is a function that takes options and returns the decorator; you call it with parentheses, like @Input().',
        long: 'Plain decorator: `@sealed` — the function itself is the decorator.\nFactory: `@Component({ selector: "x" })` — the call returns the decorator.\nFactories let you pass configuration.\nPitfall: writing `@log` when log is a factory, or `@log()` when it is not.\nStrong answer: explains the call order: the factory runs first, then the decorator.\nWeak answer: thinks parentheses are optional style.',
        exercises: [
          {
            task: 'Turn this decorator into a factory with a prefix option.',
            description: 'Checks factory shape with TS 5 standard decorators. Test in the Playground.',
            code: `function log(fn: Function, ctx: ClassMethodDecoratorContext) {
  return function (this: unknown, ...args: unknown[]) { console.log('call'); return fn.apply(this, args) };
}`,
            answer: 'Wrap it: `function log(prefix: string) { return function (fn, ctx) { ... } }` and use `@log("api")`. Weak answers add a third parameter. A strong answer types fn properly.',
            solution: `function log(prefix: string) {
  return function <A extends unknown[], R>(fn: (...a: A) => R, ctx: ClassMethodDecoratorContext) {
    return function (this: unknown, ...args: A): R { console.log(prefix, String(ctx.name)); return fn.apply(this, args) };
  };
}`,
          },
          {
            task: 'What goes wrong when you write @log without parentheses for a factory?',
            description: 'Checks a common mistake. Discuss or try it.',
            answer: 'The factory gets called as a decorator with the method as its "prefix". TS reports a type error since the signature does not match. Weak answers expect it to work.',
          },
        ],
      },
      {
        q: 'Fix this code. The decorator is placed where decorators are not allowed.',
        code: `@logged
function save() {}`,
        fix: `class Repo {
  @logged
  save() {}
}`,
        short: 'Decorators work on classes and class members only, not on plain functions or variables.',
        long: 'Allowed targets: class, method, getter, setter, field, and auto-accessor.\nStandard decorators in TS 5 do not support parameter decorators.\nFor plain functions use a higher-order function: `const save = logged(rawSave)`.\nStrong answer: lists targets and the HOF alternative.\nWeak answer: thinks decorators work anywhere.',
        exercises: [
          {
            task: 'Rewrite the decorator as a higher-order function for a plain function.',
            description: 'Checks the alternative. Ask for code.',
            answer: 'Write `function logged<A extends unknown[], R>(fn: (...a: A) => R) { return (...a: A) => { console.log(a); return fn(...a) } }`. Weak answers keep @. A strong answer keeps types.',
            solution: `function logged<A extends unknown[], R>(fn: (...a: A) => R) {
  return (...a: A): R => { console.log(a); return fn(...a) };
}`,
          },
          {
            task: 'Name the targets that standard decorators support.',
            description: 'Checks knowledge. Quick question.',
            answer: 'Classes, methods, getters, setters, fields, and accessor fields. Not parameters, in the current standard. Weak answers include parameters.',
          },
        ],
      },
      {
        q: 'Which tsconfig settings matter for decorators in TypeScript 5?',
        short: 'Standard decorators work with no flag; experimentalDecorators turns on the old style, and emitDecoratorMetadata only works with the old style.',
        long: 'TS 5.0 added TC39 standard decorators, enabled by default.\nexperimentalDecorators: true switches to the legacy implementation used by Angular and NestJS.\nemitDecoratorMetadata adds reflect-metadata type info, legacy only.\nThe two styles have different signatures.\nStrong answer: knows which style the project uses and why.\nWeak answer: turns on all flags.',
        exercises: [
          {
            task: 'A NestJS project. Which flags do you need?',
            description: 'Checks practical config. Discuss.',
            answer: 'experimentalDecorators and emitDecoratorMetadata, because Nest relies on legacy decorators and metadata for DI. Weak answers say none.',
          },
          {
            task: 'Why does this decorator not work after removing experimentalDecorators?',
            description: 'Checks signature difference. Show the code.',
            code: `function d(target: any, key: string, desc: PropertyDescriptor) {}`,
            answer: 'This is the legacy (target, key, descriptor) shape. Standard decorators get (value, context). Weak answers think it is a bug.',
          },
        ],
      },
    ],
    middle: [
      {
        q: 'What can you do with context.addInitializer in a standard decorator?',
        short: 'It registers code that runs during class or instance setup, for example to bind a method to this.',
        long: 'For method decorators, initializers run at instance construction, before fields are set.\nFor class decorators, they run after the class is defined.\nCommon use: @bound to auto-bind methods.\nAlso useful for registering classes in a registry.\nStrong answer: writes @bound with addInitializer.\nWeak answer: uses the old descriptor approach.',
        exercises: [
          {
            task: 'Write a @bound decorator with addInitializer.',
            description: 'Checks the standard API. Test by passing the method as a callback.',
            answer: 'In the decorator, call `ctx.addInitializer(function () { this[name] = this[name].bind(this) })`. Weak answers use descriptor.value. A strong answer checks ctx.private.',
            solution: `function bound<T extends object>(fn: Function, ctx: ClassMethodDecoratorContext<T>) {
  const name = ctx.name as keyof T;
  ctx.addInitializer(function (this: T) { (this as any)[name] = (this as any)[name].bind(this) });
}`,
          },
          {
            task: 'Write a class decorator that registers the class in a map by name.',
            description: 'Checks class decorators. Ask for code.',
            answer: 'Use `function register(cls: new (...a: any[]) => object, ctx: ClassDecoratorContext) { ctx.addInitializer(() => registry.set(String(ctx.name), cls)) }`. Weak answers return a new class without need.',
          },
        ],
      },
      {
        q: 'Fix this method decorator. It loses `this`.',
        code: `function timed(fn: (...a: any[]) => any, ctx: ClassMethodDecoratorContext) {
  return (...args: any[]) => {
    const t = performance.now();
    const r = fn(...args);
    console.log(performance.now() - t);
    return r;
  };
}`,
        fix: `function timed<This, A extends unknown[], R>(fn: (this: This, ...a: A) => R, ctx: ClassMethodDecoratorContext<This>) {
  return function (this: This, ...args: A): R {
    const t = performance.now();
    const r = fn.apply(this, args);
    console.log(String(ctx.name), performance.now() - t);
    return r;
  };
}`,
        short: 'Use a regular function and call the original with fn.apply(this, args); an arrow function has no own this.',
        long: 'The replacement method is called on the instance.\nAn arrow function captures the outer this (undefined), so fn runs without the instance.\nUse function and apply or call.\nType This, args, and return generically to keep types.\nPitfall: async methods need await to time correctly.\nStrong answer: fixes this and types.\nWeak answer: only renames variables.',
        exercises: [
          {
            task: 'Make @timed correct for async methods.',
            description: 'Checks async handling. Ask for code.',
            answer: 'Check if the result is a Promise and log in finally. Weak answers measure only the sync part. A strong answer keeps return type R.',
          },
          {
            task: 'What does ctx.name contain for a #private method?',
            description: 'Checks context details. Try it.',
            answer: 'The string "#name" and ctx.private is true. You use ctx.access to read it. Weak answers think private methods cannot be decorated.',
          },
        ],
      },
      {
        q: 'What can a field decorator return in standard decorators?',
        short: 'An initializer function that receives the initial value and returns the value to use.',
        long: 'Field decorators get undefined as the first argument and a context.\nThey can return `(initial) => newValue` to change the starting value.\nThey cannot intercept later reads and writes; use accessor for that.\nPitfall: expecting a property descriptor.\nStrong answer: knows the accessor alternative.\nWeak answer: uses Object.defineProperty in the decorator.',
        exercises: [
          {
            task: 'Write a @trim field decorator that trims the initial string.',
            description: 'Checks field initializer return. Test with a padded string.',
            answer: 'Return `(v: string) => v.trim()`. It changes only the first value. Weak answers think later sets are trimmed too.',
            solution: `function trim(_: undefined, ctx: ClassFieldDecoratorContext<unknown, string>) {
  return (v: string) => v.trim();
}`,
          },
          {
            task: 'How do you trim on every set?',
            description: 'Checks accessor decorators. Discuss.',
            answer: 'Use `accessor` on the field and an accessor decorator that returns a set wrapper. Weak answers try field decorators.',
          },
        ],
      },
    ],
    senior: [
      {
        q: 'How does decorator metadata work in TypeScript 5.2 and later?',
        short: 'Decorators get context.metadata, an object shared per class and exposed as Class[Symbol.metadata].',
        long: 'TS 5.2 supports the TC39 decorator metadata proposal.\nEach decorator can write to context.metadata.\nAfter class definition, read it via MyClass[Symbol.metadata].\nYou need a Symbol.metadata polyfill in many runtimes.\nIt does not include type information like emitDecoratorMetadata did.\nStrong answer: knows the polyfill and the lack of design types.\nWeak answer: mixes it up with reflect-metadata.',
        ai: true,
        exercises: [
          {
            task: 'Write a @required field decorator that collects names in metadata.',
            description: 'Checks the metadata API. Run with a Symbol.metadata polyfill.',
            answer: 'Push String(ctx.name) into `(ctx.metadata.required ??= [])`. Read later from `Cls[Symbol.metadata]`. Weak answers use a global map keyed by class.',
            solution: `(Symbol as any).metadata ??= Symbol('Symbol.metadata');
function required(_: undefined, ctx: ClassFieldDecoratorContext) {
  ((ctx.metadata.required ??= []) as string[]).push(String(ctx.name));
}`,
          },
          {
            task: 'How is metadata inherited by subclasses?',
            description: 'Checks prototype chaining of metadata. Discuss.',
            answer: 'The subclass metadata object has the parent metadata as its prototype. So reads fall back to the parent. Writing an array in place may mutate the parent; copy first. Strong answers mention that pitfall.',
          },
        ],
      },
      {
        q: 'Fix this class decorator. The returned class loses its type.',
        code: `function withId(cls: any, ctx: ClassDecoratorContext) {
  return class extends cls { id = crypto.randomUUID() };
}
@withId class User { name = '' }
new User().id; // error: id does not exist`,
        fix: `function withId<C extends new (...a: any[]) => object>(Base: C) {
  return class extends Base { id = crypto.randomUUID() };
}
const User = withId(class { name = '' });
new User().id;`,
        short: 'Decorators cannot change the declared type of a class; use a mixin function to add members visibly.',
        long: 'TS keeps the original class type after decoration.\nA class decorator may return a subclass at runtime, but the new members are invisible to the type system.\nMixins as functions make the added type explicit.\nAlternative: declare the member with an interface merge, which is less safe.\nStrong answer: knows this limitation.\nWeak answer: casts every use.',
        ai: true,
        exercises: [
          {
            task: 'Use interface merging to expose id. What are the risks?',
            description: 'Checks a workaround. Ask for code and risks.',
            answer: 'Add `interface User { id: string }` next to the class. Risk: nothing checks the decorator really adds it. Weak answers see no risk.',
          },
          {
            task: 'Why did TS choose not to let decorators change types?',
            description: 'Checks design reasoning. Discuss.',
            answer: 'Decorators run at runtime and can be arbitrary; typing their effect would need a new type-level feature. Weak answers have no idea. A strong answer links to the open issue.',
          },
        ],
      },
      {
        q: 'How do you write a decorator for an auto-accessor field?',
        short: 'Decorate an `accessor` field. The decorator gets `{ get, set }` and can return new get, set and init functions.',
        long: `Standard field decorators cannot intercept reads and writes. Auto-accessors can.
The decorator receives the target \`{ get, set }\` and a context of kind "accessor".
Return \`{ get() {}, set(v) {}, init(v) {} }\` to wrap behavior, for example validation or change tracking.
TypeScript types it with ClassAccessorDecoratorTarget and ClassAccessorDecoratorResult.
Pitfall: this needs TS 5.0+ standard decorators, not experimentalDecorators.
Strong answer: writes a working wrapper and explains why accessor is needed.
Weak answer: tries to use a property descriptor.`,
        follow: 'Why can a plain field decorator not run code on every write?',
        exercises: [
          {
            task: 'Write a decorator that logs every write to an accessor field.',
            description: 'Checks the accessor decorator shape.',
            answer: 'Return a set function that logs, then calls the original set.',
            solution: `function logged<This, V>(t: ClassAccessorDecoratorTarget<This, V>, ctx: ClassAccessorDecoratorContext<This, V>) {
  return { set(this: This, v: V) { console.log(String(ctx.name), v); t.set.call(this, v); } };
}
class User { @logged accessor name = ''; }`,
          },
          {
            task: 'Write a decorator that clamps a number accessor between 0 and 100.',
            description: 'Checks init and set.',
            answer: 'Clamp in both init and set, so the starting value is also checked.',
            solution: `function clamp(t: ClassAccessorDecoratorTarget<unknown, number>) {
  const c = (v: number) => Math.min(100, Math.max(0, v));
  return { init: c, set(this: unknown, v: number) { t.set.call(this, c(v)); } };
}`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'How do you test code that uses decorators?',
        short: 'Test the decorator on a small test class, and test business logic without the decorator where possible. Keep decorators thin.',
        long: `A decorator is just a function, so you can apply it to a tiny class in a unit test.
Keep logic in plain functions that the decorator calls; test those directly.
For framework decorators (NestJS, Angular), use the framework testing module.
Pitfall: decorators with side effects at class definition (registries) leak between tests; reset them.
Strong answer: separates decorator wiring from logic, and resets global state.
Weak answer: only tests through the full app.`,
        follow: 'How do you reset a registry that decorators fill at import time?',
        exercises: [
          {
            task: 'Write a test for a @retry(3) method decorator.',
            description: 'Checks testing decorators directly.',
            answer: 'Make a class with a method that fails twice, then succeeds. Assert it returns and was called three times.',
            solution: `class T { calls = 0; @retry(3) async run() { if (++this.calls < 3) throw new Error(); return 'ok'; } }
const t = new T();
expect(await t.run()).toBe('ok');
expect(t.calls).toBe(3);`,
          },
          {
            task: 'Why do these tests fail only when run together?',
            description: 'Checks global state from decorators.',
            answer: 'A @register decorator adds classes to a shared map when the file loads. Tests see each other\'s classes. Export a reset function or create the registry per test.',
          },
        ],
      },
      {
        q: 'Fix this code. A decorator hides a slow network call in a getter.',
        code: `class Profile {
  @remote('/api/me')
  get data(): User { return undefined! }
}`,
        fix: `class Profile {
  constructor(private api: ApiClient) {}
  loadData(): Promise<User> { return this.api.get<User>('/api/me') }
}`,
        short: 'Do not hide async side effects behind decorators and getters; make them explicit async methods.',
        long: 'A getter that triggers IO surprises readers and breaks caching rules.\nIts type says sync User, but the data comes later.\nExplicit methods returning Promise show cost and allow error handling.\nDecorators fit cross-cutting concerns like logging or validation, not data loading.\nStrong answer: sets a team rule on acceptable decorator uses.\nWeak answer: keeps the magic.',
        exercises: [
          {
            task: 'Write a short team rule for when decorators are allowed.',
            description: 'Checks guideline writing. Ask for 2-3 bullet points.',
            answer: 'Allowed: framework decorators and pure cross-cutting concerns (log, metrics). Not allowed: hidden IO, changing types, or business logic. Weak answers ban or allow all.',
          },
          {
            task: 'Why is the getter type a lie here?',
            description: 'Checks type honesty. Discuss.',
            answer: 'It says User but returns undefined until loaded, and errors are lost. The type should be Promise<User> or User | undefined. Strong answers mention the non-null assertion as a red flag.',
          },
        ],
      },
      {
        q: 'Do decorators affect bundle size and tree shaking?',
        short: 'Yes: decorated classes compile to helper calls with side effects, so bundlers often cannot remove unused classes.',
        long: 'Standard decorators emit __esDecorate and __runInitializers helpers.\nThe class definition becomes an expression with side effects.\nBundlers then keep the class even if it is unused, unless marked pure.\nUse importHelpers with tslib to avoid duplicated helpers.\nStrong answer: checks bundle output and uses sideEffects config.\nWeak answer: says types are erased so nothing changes.',
        exercises: [
          {
            task: 'How do you check if decorators block tree shaking?',
            description: 'Checks tooling. Discuss steps.',
            answer: 'Build with a bundle analyzer, import one unused decorated class, and see if it stays. Weak answers guess. Strong answers mention importHelpers and /*#__PURE__*/.',
          },
          {
            task: 'What does importHelpers do?',
            description: 'Checks tsconfig knowledge. Quick question.',
            answer: 'It imports helpers like __decorate from tslib instead of copying them into each file. That reduces size. Weak answers do not know.',
          },
        ],
      },
    ],
  },
  'Union and Intersection Types': {
    junior: [
      {
        q: 'What is narrowing? Name three ways to narrow a union.',
        short: 'Narrowing is how TS refines a union to a specific member using checks like typeof, instanceof, in, equality, or a discriminant.',
        long: 'typeof works for primitives: string, number, boolean, and so on.\ninstanceof works for classes.\nThe in operator checks if a property exists.\nEquality checks on a literal discriminant like kind narrow object unions.\nPitfall: typeof null is "object".\nStrong answer: lists several and mentions the null pitfall.\nWeak answer: uses casts instead.',
        exercises: [
          {
            task: 'Narrow this value and return its length or the number itself.',
            description: 'Checks typeof narrowing. Ask for code.',
            code: `function size(v: string | number) {}`,
            answer: '`return typeof v === "string" ? v.length : v`. Weak answers cast with as. A strong answer notes TS narrows in each branch automatically.',
            solution: `function size(v: string | number) { return typeof v === 'string' ? v.length : v }`,
          },
          {
            task: 'Why is this check not enough?',
            description: 'Checks the null pitfall. Run with strict on.',
            code: `function f(v: object | null) { if (typeof v === 'object') v.toString() }`,
            answer: 'typeof null is "object", so v may still be null and TS reports it. Add `v !== null`. Weak answers think typeof removes null.',
          },
        ],
      },
      {
        q: 'Fix this code. The function calls a method that only one union member has.',
        code: `function print(x: string | string[]) { return x.join(', ') }`,
        fix: `function print(x: string | string[]) { return Array.isArray(x) ? x.join(', ') : x }`,
        short: 'On a union, you can only use members common to all types; narrow first with Array.isArray.',
        long: 'join exists on arrays, not on strings.\nTS only allows what is safe for every member of the union.\nArray.isArray is a built-in type guard.\nAlternative: normalize: `const arr = typeof x === "string" ? [x] : x`.\nStrong answer: narrows or normalizes.\nWeak answer: casts to string[].',
        exercises: [
          {
            task: 'Normalize the input to an array first.',
            description: 'Checks the normalize pattern. Ask for code.',
            answer: '`const list = Array.isArray(x) ? x : [x]; return list.join(", ")`. This keeps one code path. Weak answers duplicate logic.',
          },
          {
            task: 'Which property can you read without narrowing?',
            description: 'Checks common members. Show the code.',
            code: `declare const v: string | string[];
v.length; v.toUpperCase(); v.slice(0, 1);`,
            answer: 'length and slice exist on both, so they compile. toUpperCase fails. Weak answers think none work. Strong answers note slice returns string | string[].',
          },
        ],
      },
      {
        q: 'What is a literal union type? Give an example.',
        short: 'A union of exact values, like `type Size = "sm" | "md" | "lg"`, so only those values are allowed.',
        long: 'Literal types are single values: "sm", 42, true.\nA union of them works like a light enum.\nTS gives autocompletion and catches typos.\nPitfall: let variables widen to string; use const or annotate.\nStrong answer: knows widening and as const.\nWeak answer: uses string.',
        exercises: [
          {
            task: 'Why does this fail? Fix it.',
            description: 'Checks literal widening. Run in the Playground.',
            code: `type Size = 'sm' | 'lg';
let s = 'sm';
function set(v: Size) {}
set(s);`,
            answer: 'let widens s to string. Use const, or annotate `let s: Size = "sm"`. Weak answers cast. A strong answer explains widening.',
            solution: `const s = 'sm';
set(s);`,
          },
          {
            task: 'Get a union type from an array of values.',
            description: 'Checks as const and indexed access. Ask for code.',
            code: `const SIZES = ['sm', 'md', 'lg'];`,
            answer: 'Add as const, then `type Size = (typeof SIZES)[number]`. Weak answers write the union again by hand. Strong answers keep one source.',
            solution: `const SIZES = ['sm', 'md', 'lg'] as const;
type Size = (typeof SIZES)[number];`,
          },
        ],
      },
    ],
    middle: [
      {
        q: 'How does the never type help with exhaustive checks?',
        short: 'After all cases are handled, the value narrows to never; assigning it to never fails if a new case is added.',
        long: 'In the default branch of a switch over a discriminant, the value is never if all cases are covered.\nA helper `assertNever(x: never)` makes a missed case a compile error.\nThe satisfies never form also works: `x satisfies never`.\nAlso throw at runtime for unexpected data.\nStrong answer: combines compile-time and runtime safety.\nWeak answer: relies on a default return.',
        exercises: [
          {
            task: 'Add an exhaustive check to this switch.',
            description: 'Checks assertNever. Add a new kind and see the error.',
            code: `type S = { kind: 'a' } | { kind: 'b' };
function f(s: S) { switch (s.kind) { case 'a': return 1; case 'b': return 2 } }`,
            answer: 'Add `default: return assertNever(s)` with `function assertNever(x: never): never { throw new Error(String(x)) }`. Weak answers add default return 0, which hides new cases.',
            solution: `function assertNever(x: never): never { throw new Error('Unexpected: ' + JSON.stringify(x)) }`,
          },
          {
            task: 'What is the type of `string & number`?',
            description: 'Checks empty intersections. Hover in the Playground.',
            answer: 'never, because no value is both. Weak answers say an object with both. Strong answers mention that conflicting literal properties also reduce object types to never.',
          },
        ],
      },
      {
        q: 'Fix this code. The intersection of conflicting props becomes never.',
        code: `type A = { id: string };
type B = { id: number };
type AB = A & B;
const x: AB = { id: '1' };`,
        fix: `type A = { id: string };
type B = { id: number };
type AB = Omit<A, 'id'> & Omit<B, 'id'> & { id: string | number };
const x: AB = { id: '1' };`,
        short: 'An intersection merges property types with &, so id becomes string & number, which is never.',
        long: 'Intersections do not override; they combine.\nConflicting primitives reduce to never, making the type impossible.\nInterfaces with extends report the conflict right away instead.\nFix: Omit the conflicting key and redefine it.\nStrong answer: compares with extends errors.\nWeak answer: expects the second type to win.',
        exercises: [
          {
            task: 'Write a Merge<A, B> type where B wins on conflicts.',
            description: 'Checks Omit composition. Test with the types above.',
            answer: '`type Merge<A, B> = Omit<A, keyof B> & B`. Weak answers use A & B. Strong answers mention flattening for readability with a mapped type.',
            solution: `type Merge<A, B> = Omit<A, keyof B> & B;`,
          },
          {
            task: 'Why is extends safer here?',
            description: 'Checks the difference. Try `interface AB extends A, B {}`.',
            answer: 'extends reports "named property id of types A and B are not identical" immediately. The intersection silently becomes never. Weak answers see no difference.',
          },
        ],
      },
      {
        q: 'What is the difference between a type predicate and an assertion function?',
        short: 'A type predicate `x is T` returns boolean and narrows in an if; an assertion function `asserts x is T` throws and narrows the code after the call.',
        long: 'Predicate: `function isUser(x: unknown): x is User`.\nAssertion: `function assertUser(x: unknown): asserts x is User`.\nBoth are trusted by TS without checking the body is correct.\nAssertion functions need an explicit type annotation at the call site when assigned to a variable.\nTS 5.5 infers predicates from simple filters like `x => x !== null`.\nStrong answer: mentions TS 5.5 inferred predicates.\nWeak answer: knows only casts.',
        exercises: [
          {
            task: 'Write assertIsString and use it.',
            description: 'Checks asserts syntax. Run in the Playground.',
            answer: '`function assertIsString(v: unknown): asserts v is string { if (typeof v !== "string") throw new TypeError() }`. After the call, v is string. Weak answers return boolean.',
            solution: `function assertIsString(v: unknown): asserts v is string {
  if (typeof v !== 'string') throw new TypeError('Not a string');
}`,
          },
          {
            task: 'What does TS 5.5 infer here?',
            description: 'Checks inferred type predicates. Hover in TS 5.5+.',
            code: `const xs = [1, null, 2].filter(x => x !== null);`,
            answer: 'number[]. TS 5.5 infers `x is number` for the arrow. Before 5.5 it was (number | null)[]. Weak answers say it is still nullable.',
          },
        ],
      },
    ],
    senior: [
      {
        q: 'What is a distributive conditional type, and how do you turn distribution off?',
        short: 'A conditional on a naked type parameter applies to each union member separately; wrap both sides in brackets to stop it.',
        long: '`type ToArr<T> = T extends any ? T[] : never` gives string[] | number[] for string | number.\n`[T] extends [any]` gives (string | number)[].\nnever distributes to never, which surprises people in IsNever checks.\nExtract and Exclude rely on distribution.\nStrong answer: shows both and the never edge case.\nWeak answer: does not know distribution.',
        ai: true,
        exercises: [
          {
            task: 'Why does this IsNever return never instead of true?',
            description: 'Checks the never edge case. Run in the Playground.',
            code: `type IsNever<T> = T extends never ? true : false;
type R = IsNever<never>;`,
            answer: 'never is an empty union, so distribution gives never. Use `[T] extends [never]`. Weak answers expect true.',
            solution: `type IsNever<T> = [T] extends [never] ? true : false;`,
          },
          {
            task: 'Implement Exclude yourself.',
            description: 'Checks distribution use. Ask for one line.',
            answer: '`type MyExclude<T, U> = T extends U ? never : T`. It relies on distribution over T. Weak answers write a mapped type.',
          },
        ],
      },
      {
        q: 'Fix this code. Destructuring breaks discriminated union narrowing.',
        code: `type R = { ok: true; data: string } | { ok: false; error: Error };
function f(r: R) {
  const { ok } = r;
  if (ok) return r.data.toUpperCase();
}`,
        fix: `type R = { ok: true; data: string } | { ok: false; error: Error };
function f(r: R) {
  if (r.ok) return r.data.toUpperCase();
}`,
        short: 'A destructured discriminant does not narrow the original object; check r.ok directly.',
        long: 'Narrowing applies to the reference you test. ok is a new variable, so r stays the full union.\nTS 4.4 added aliased conditions (const isOk = r.ok), and TS 4.6 narrows destructured variables taken from the same object together.\nBut neither narrows r through a lone destructured ok.\nDestructuring data too fails, because data is not on every member.\nSimplest fix: test r.ok, or destructure from a parameter so both names narrow together.\nStrong answer: knows the 4.4 and 4.6 rules and their limits.\nWeak answer: casts.',
        ai: true,
        exercises: [
          {
            task: 'Does this compile in TS 5? Explain.',
            description: 'Checks destructured discriminant narrowing. Run in the Playground.',
            code: `type A = { kind: 'n'; v: number } | { kind: 's'; v: string };
function f({ kind, v }: A) { if (kind === 'n') return v.toFixed() }`,
            answer: 'Yes since TS 4.6: destructured discriminant and payload from the same parameter narrow together, as long as they are const and not reassigned. Weak answers say no.',
          },
          {
            task: 'Does narrowing survive an aliased condition?',
            description: 'Checks TS 4.4 aliased conditions. Run it.',
            code: `function f(x: string | number) { const isS = typeof x === 'string'; if (isS) x.toUpperCase() }`,
            answer: 'Yes, for const aliases and a parameter that is not reassigned. If x is let and reassigned, it fails. Weak answers do not know this feature.',
          },
        ],
      },
      {
        q: 'Why does a union of functions accept only an intersection of parameters?',
        short: 'Calling `F1 | F2` is safe only with an argument valid for both, so TS intersects the parameter types.',
        long: 'For `((a: string) => void) | ((a: number) => void)`, the argument must be string & number = never.\nThis is parameter contravariance.\nIt often appears when indexing a handler map with a union key.\nFix with a generic key so TS correlates key and handler.\nTS 4.6 improved this for correlated unions with a mapped-type pattern.\nStrong answer: explains contravariance and the correlated union fix.\nWeak answer: casts the handler to any.',
        ai: true,
        exercises: [
          {
            task: 'Fix the handler call without any.',
            description: 'Checks the correlated union pattern. Run in the Playground.',
            code: `type Map = { a: string; b: number };
const h: { [K in keyof Map]: (v: Map[K]) => void } = { a: s => {}, b: n => {} };
function run(k: keyof Map, v: Map[keyof Map]) { h[k](v) }`,
            answer: 'Make it generic: `function run<K extends keyof Map>(k: K, v: Map[K]) { h[k](v) }`. TS correlates K. Weak answers cast. Strong answers name the pattern from TS PR 47109.',
            solution: `function run<K extends keyof Map>(k: K, v: Map[K]) { h[k](v) }`,
          },
          {
            task: 'What is the parameter type when calling F?',
            description: 'Checks contravariance. Hover in the Playground.',
            code: `type F = ((a: { x: 1 }) => void) | ((a: { y: 2 }) => void);`,
            answer: '{ x: 1 } & { y: 2 }. You must pass an object with both. Weak answers say a union.',
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'How do you type feature flags so that removing a flag causes errors everywhere it is used?',
        short: 'Keep all flag names in one union or const object. Code uses a typed function like `isOn(\'newCheckout\')`, so removing a name breaks every call site.',
        long: `If flags are free strings, old checks stay in code forever.
Define \`const FLAGS = ['newCheckout', 'darkMode'] as const\` and \`type Flag = typeof FLAGS[number]\`.
The flag client accepts only Flag, so deleting a name gives compile errors to clean up.
You can also map flags to value types for multivariate flags.
Pitfall: flags loaded from a remote service may not match; validate at startup.
Strong answer: one source of truth, typed access, cleanup through errors.
Weak answer: uses plain strings with a wiki list.`,
        follow: 'How do you type flags that hold a string or number, not just a boolean?',
        exercises: [
          {
            task: 'Type isOn so only known flags are allowed.',
            description: 'Checks literal unions from a const array.',
            code: `const FLAGS = ['newCheckout', 'darkMode'] as const;
function isOn(name: string): boolean { return false; }`,
            answer: 'Derive Flag from the array and use it as the parameter type.',
            solution: `type Flag = typeof FLAGS[number];
function isOn(name: Flag): boolean { return false; }`,
          },
          {
            task: 'Type a getFlag function where each flag has its own value type.',
            description: 'Checks key-to-type mapping.',
            answer: 'Use an interface of flag names to types and a generic key.',
            solution: `interface Flags { newCheckout: boolean; maxItems: number; theme: 'light' | 'dark' }
declare function getFlag<K extends keyof Flags>(k: K): Flags[K];`,
          },
        ],
      },
      {
        q: 'Fix this error handling. The error in catch is used as if it were always an Error.',
        code: `try {
  await save();
} catch (e) {
  showToast(e.message);
}`,
        fix: `try {
  await save();
} catch (e: unknown) {
  showToast(e instanceof Error ? e.message : String(e));
}`,
        short: 'Anything can be thrown, so the catch variable is unknown under strict mode (useUnknownInCatchVariables). Narrow it before reading message.',
        long: `Since TS 4.4, strict turns on useUnknownInCatchVariables, so e is unknown.
Code can throw strings, objects or undefined, not only Error.
Narrow with instanceof Error, or a type guard for your API error shape.
A shared toError or getErrorMessage helper keeps it short across the app.
Pitfall: writing \`catch (e: any)\` turns checks off again.
Strong answer: narrows, and adds a shared helper.
Weak answer: casts with \`as Error\`.`,
        follow: 'Why does TypeScript not let you write `catch (e: Error)`?',
        exercises: [
          {
            task: 'Write a getErrorMessage helper.',
            description: 'Checks narrowing unknown.',
            answer: 'Handle Error, string and other values.',
            solution: `export function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;
  return 'Unknown error';
}`,
          },
          {
            task: 'Narrow an API error with a status field.',
            description: 'Checks custom type guards.',
            code: 'type ApiError = { status: number; message: string };',
            answer: 'Write a guard that checks the object has a numeric status.',
            solution: `function isApiError(e: unknown): e is ApiError {
  return typeof e === 'object' && e !== null && typeof (e as ApiError).status === 'number';
}`,
          },
        ],
      },
      {
        q: 'Large unions slow down your build. How do you investigate and fix it?',
        short: 'Measure with tsc traces, then reduce union size, avoid huge template literal unions, and split types.',
        long: 'Unions over about 100,000 members fail with "Expression produces a union type that is too complex".\nTemplate literal types can multiply unions quickly.\nComparing big unions is costly.\nUse --generateTrace to find hot spots.\nReplace generated unions with string plus runtime checks where precision is not needed.\nStrong answer: measures first and trades precision for speed on purpose.\nWeak answer: buys a faster laptop.',
        exercises: [
          {
            task: 'Why is this type a problem?',
            description: 'Checks union explosion. Hover in the Playground.',
            code: `type D = 0|1|2|3|4|5|6|7|8|9;
type Code = \`\${D}\${D}\${D}\${D}\${D}\`;`,
            answer: 'It creates 100,000 members, which hits the limit and slows the checker. Use string with a validator. Weak answers think it is fine.',
          },
          {
            task: 'What would you do first when tsc gets slow after a type change?',
            description: 'Checks process. Discuss.',
            answer: 'Run extendedDiagnostics and generateTrace, compare with the previous commit, and find the hot type. Weak answers revert at random.',
          },
        ],
      },
    ],
  },
  Enums: {
    junior: [
      {
        q: 'What value does each member of a numeric enum get by default?',
        short: 'The first member is 0, and each next member is the previous value plus one, unless you set values.',
        long: '`enum Dir { Up, Down }` gives Up = 0, Down = 1.\nIf you set `Up = 1`, Down becomes 2.\nAfter a string member, the next member must have an explicit value.\nPitfall: inserting a member in the middle changes the values of later members.\nStrong answer: warns about reordering when values are stored or sent to a server.\nWeak answer: does not know auto-increment.',
        exercises: [
          {
            task: 'What are the values here?',
            description: 'Checks auto-increment. Predict, then log Object.values(E).',
            code: `enum E { A = 5, B, C = 10, D }`,
            answer: 'A = 5, B = 6, C = 10, D = 11. Weak answers say B = 1. A strong answer adds that Object.values also includes the reverse-mapped names.',
          },
          {
            task: 'Why is adding a member at the top risky?',
            description: 'Checks the stored value pitfall. Discuss.',
            code: `enum Role { Admin, User } // saved in DB as 0 and 1`,
            answer: 'Adding Guest first shifts Admin to 1, so old data means a different role. Set explicit values or use strings. Weak answers see no problem.',
          },
        ],
      },
      {
        q: 'Fix this code. A string is compared with a string enum.',
        code: `enum Status { Active = 'active', Off = 'off' }
const s: Status = 'active';`,
        fix: `enum Status { Active = 'active', Off = 'off' }
const s: Status = Status.Active;`,
        short: 'String enums are nominal: a plain string literal is not assignable to them, so use the enum member.',
        long: 'Numeric enums accept any number (a known hole, tightened in TS 5.0 for literal values out of range).\nString enums only accept their own members.\nWhen data comes from an API, you must validate and map strings to members.\nPitfall: casting with as Status skips validation.\nStrong answer: writes a guard using Object.values.\nWeak answer: casts.',
        exercises: [
          {
            task: 'Write a guard that checks if a string is a Status.',
            description: 'Checks runtime validation for enums. Test with a bad value.',
            answer: '`function isStatus(v: string): v is Status { return (Object.values(Status) as string[]).includes(v) }`. Weak answers cast. A strong answer notes this works for string enums but numeric ones need care.',
            solution: `function isStatus(v: string): v is Status {
  return (Object.values(Status) as string[]).includes(v);
}`,
          },
          {
            task: 'Does `const n: Dir = 99` compile for a numeric enum Dir { A, B }?',
            description: 'Checks TS 5.0 enum changes. Run in TS 5.x.',
            answer: 'No in TS 5.0+: a literal out of the enum range is an error. A computed number like `const x: number = 99; const n: Dir = x` still compiles. Weak answers say any number works.',
          },
        ],
      },
      {
        q: 'How do you get the name of a numeric enum member from its value?',
        short: 'Numeric enums have a reverse mapping, so `Dir[0]` returns "Up"; string enums do not have it.',
        long: 'TS emits both Dir.Up = 0 and Dir[0] = "Up" for numeric members.\nThis is useful for logs and debugging.\nString enum members have no reverse mapping.\nPitfall: Object.keys on a numeric enum returns numbers and names together.\nStrong answer: knows the reverse mapping and the Object.keys pitfall.\nWeak answer: expects reverse mapping for strings too.',
        exercises: [
          {
            task: 'What does this print?',
            description: 'Checks the reverse mapping shape. Run in Node.',
            code: `enum D { Up, Down }
console.log(Object.keys(D));`,
            answer: '["0", "1", "Up", "Down"]. Weak answers say only names. Filter with isNaN(Number(k)) to get names.',
          },
          {
            task: 'Get only the member names of a numeric enum.',
            description: 'Checks filtering. Ask for code.',
            answer: '`Object.keys(D).filter(k => isNaN(Number(k)))`. Weak answers use Object.keys directly. A strong answer suggests string enums or const objects instead.',
            solution: `const names = Object.keys(D).filter(k => isNaN(Number(k)));`,
          },
        ],
      },
    ],
    middle: [
      {
        q: 'How do you use an enum as an object key type and require all members?',
        short: 'Use Record<MyEnum, Value>; TS then requires a key for every enum member.',
        long: '`const labels: Record<Status, string> = { [Status.Active]: "On", [Status.Off]: "Off" }`.\nAdding a new member forces you to add a label.\nThis is a simple compile-time completeness check.\nIt works for string and numeric enums.\nStrong answer: uses this for lookup tables instead of switch.\nWeak answer: uses an index signature.',
        exercises: [
          {
            task: 'Create a color map for this enum that breaks when a member is added.',
            description: 'Checks Record with enums. Add a member and see the error.',
            code: `enum Level { Low = 'low', High = 'high' }`,
            answer: 'Use `const colors: Record<Level, string> = { [Level.Low]: "green", [Level.High]: "red" }`. Weak answers use `{ [k: string]: string }`.',
            solution: `const colors: Record<Level, string> = { [Level.Low]: 'green', [Level.High]: 'red' };`,
          },
          {
            task: 'What is `keyof typeof Level`?',
            description: 'Checks enum object keys. Hover in the Playground.',
            answer: '"Low" | "High", the member names. `Level` as a type means the values. Weak answers mix them up.',
          },
        ],
      },
      {
        q: 'Fix this code. Enum members are combined as flags but the check is wrong.',
        code: `enum Perm { Read = 1, Write = 2, Exec = 4 }
const p = Perm.Read | Perm.Write;
if (p === Perm.Write) console.log('can write');`,
        fix: `enum Perm { None = 0, Read = 1 << 0, Write = 1 << 1, Exec = 1 << 2 }
const p = Perm.Read | Perm.Write;
if ((p & Perm.Write) !== 0) console.log('can write');`,
        short: 'For bit flags, test with bitwise AND, not equality, because the value holds several flags.',
        long: 'Flag enums use powers of two so members can be combined.\nRead | Write = 3, which is not equal to Write.\n`(p & Perm.Write) !== 0` checks if the flag is set.\nUse `1 << n` to make the intent clear.\nStrong answer: knows bitwise checks and a None member.\nWeak answer: compares with ===.',
        exercises: [
          {
            task: 'Remove the Write flag from p.',
            description: 'Checks bitwise operations. Ask for one line.',
            answer: '`p & ~Perm.Write`. Weak answers subtract, which breaks if the flag is not set.',
          },
          {
            task: 'Is a flag enum a good idea for a UI permission model?',
            description: 'Checks judgment. Discuss.',
            answer: 'Rarely: bits are hard to read in JSON and logs. A Set of string permissions is clearer. Use flags when size or speed really matters. Weak answers like the cleverness.',
          },
        ],
      },
      {
        q: 'What are constant and computed enum members?',
        short: 'Constant members have values known at compile time, like literals or simple expressions. Computed members use runtime values, like a function call.',
        long: `Constant members: literals, references to other constant members, and simple math like \`1 << 2\`.
Computed members: anything else, like \`'abc'.length\` or \`getValue()\`.
After a computed member, the next member needs an explicit value.
const enums allow only constant members because they are inlined.
String enums cannot have computed members.
Pitfall: a computed member makes the enum harder to inline and to read.
Strong answer: gives examples and the rule about the next member.
Weak answer: does not know the difference.`,
        follow: 'Why can a const enum not have computed members?',
        exercises: [
          {
            task: 'Which line has an error and why?',
            description: 'Checks the rule after a computed member.',
            code: 'enum E { A = 1, B = \'abc\'.length, C }',
            answer: 'B is computed, so C needs a value. Add `C = 5` or move C above B.',
          },
          {
            task: 'Are these members constant or computed?',
            description: 'Checks classification.',
            code: 'enum Perm { Read = 1 << 0, Write = 1 << 1, Both = Read | Write }',
            answer: 'Read and Write are constant; Both is constant too because it uses other constant members.',
          },
        ],
      },
    ],
    senior: [
      {
        q: 'Why does `erasableSyntaxOnly` reject enums?',
        short: 'Enums emit runtime code, so they cannot be removed by simple type stripping like in Node or the TS 5.8 erasable-only mode.',
        long: 'TS 5.8 added erasableSyntaxOnly to match Node native type stripping.\nErasable syntax can be deleted without changing behavior.\nEnums, namespaces with values, and parameter properties generate JS, so they are errors.\nThis pushes codebases toward as const objects and unions.\nStrong answer: links it to Node --experimental-strip-types and future JS type annotations.\nWeak answer: does not know the flag.',
        ai: true,
        exercises: [
          {
            task: 'List three features that erasableSyntaxOnly forbids.',
            description: 'Checks knowledge. Quick question.',
            answer: 'Enums, namespaces with runtime code, and constructor parameter properties. Also legacy import = require. Weak answers list types.',
          },
          {
            task: 'Plan a migration away from enums in a big codebase.',
            description: 'Checks planning. Ask for steps.',
            answer: 'Replace each enum with an as const object and type of the same name, so most call sites keep compiling. Do it per package with a codemod. Then turn on the flag. Weak answers do a big bang.',
          },
        ],
      },
      {
        q: 'Fix this code. Looping over a numeric enum gives both names and numbers.',
        code: `enum Size { S, M, L }
const options = Object.keys(Size);
// ['0', '1', '2', 'S', 'M', 'L']`,
        fix: `enum Size { S, M, L }
const options = Object.keys(Size).filter((k) => isNaN(Number(k))) as (keyof typeof Size)[];
// ['S', 'M', 'L']`,
        short: 'Numeric enums have a reverse mapping, so the object has number keys too. Filter out numeric keys, or use a string enum or const object.',
        long: `The compiled numeric enum looks like \`{ 0: 'S', 1: 'M', S: 0, M: 1, ... }\`.
Object.keys and Object.values return both halves.
Filter keys that are not numbers, or switch to a string enum, which has no reverse mapping.
Pitfall: Object.values on a numeric enum returns names and numbers mixed.
Strong answer: explains the reverse mapping and gives a typed fix.
Weak answer: hard-codes the list.`,
        follow: 'Do string enums have this problem?',
        exercises: [
          {
            task: 'Get only the numeric values of the enum, typed as Size[].',
            description: 'Checks filtering values.',
            code: 'enum Size { S, M, L }',
            answer: 'Filter values by typeof number.',
            solution: 'const values = Object.values(Size).filter((v): v is Size => typeof v === \'number\');',
          },
          {
            task: 'Rewrite Size as a const object so iteration is simple.',
            description: 'Checks the const object pattern.',
            answer: 'Use as const and derive the type from values.',
            solution: `const Size = { S: 0, M: 1, L: 2 } as const;
type Size = typeof Size[keyof typeof Size];
Object.keys(Size); // ['S', 'M', 'L']`,
          },
        ],
      },
      {
        q: 'How do numeric enums compare with number and with each other for type safety?',
        short: 'Numeric enums are assignable to and from number in many cases, and two different enums are not assignable to each other.',
        long: 'Any number expression is assignable to a numeric enum type (literals out of range fail since TS 5.0).\nAn enum value is assignable to number.\nEnum A and enum B are never compatible, even with the same values.\nSince TS 5.0 all enums are union enums, so narrowing on members works.\nStrong answer: knows the 5.0 changes and remaining holes.\nWeak answer: thinks numeric enums are fully safe.',
        ai: true,
        exercises: [
          {
            task: 'Which lines compile in TS 5?',
            description: 'Checks enum assignability. Run each line.',
            code: `enum A { X } enum B { X }
declare let n: number;
const a1: A = n;
const a2: A = 5;
const a3: A = B.X;
const n2: number = A.X;`,
            answer: 'a1 compiles (number expression), a2 fails (literal not in enum), a3 fails (different enum), n2 compiles. Weak answers say a3 works because values match.',
          },
          {
            task: 'How do you make numeric IDs safe without enums?',
            description: 'Checks branded types. Ask for code.',
            answer: 'Use a branded type like `type UserId = number & { readonly __brand: "UserId" }` and a constructor function. Weak answers use enums. Strong answers explain brand erasure.',
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'Do you allow TypeScript enums in new code? Defend your rule.',
        short: 'Most modern teams prefer literal unions or as const objects; allow enums only in legacy code or where a framework needs them.',
        long: 'Reasons against: runtime code, nominal quirks, const enum issues, erasableSyntaxOnly.\nReasons for: familiar to C# and Java developers, readable member names.\nas const objects keep member names and stay plain JS.\nEnforce with a lint rule (no-restricted-syntax on TSEnumDeclaration).\nStrong answer: gives a rule, reasons, and a migration plan.\nWeak answer: "enums are bad" with no reasons.',
        exercises: [
          {
            task: 'Write the lint config that bans new enums.',
            description: 'Checks enforcement. Ask for eslint config.',
            answer: '`"no-restricted-syntax": ["error", { selector: "TSEnumDeclaration", message: "Use an as const object" }]`. Weak answers rely on review. Strong answers allow legacy files with overrides.',
          },
          {
            task: 'How would you explain the rule to a backend C# team?',
            description: 'Checks communication. Ask for a short pitch.',
            answer: 'TS enums are not like C# enums: they add runtime code and have type holes. A const object gives the same names with plain JS. A strong answer stays respectful and concrete.',
          },
        ],
      },
      {
        q: 'Fix this package setup. Two copies of the same enum exist, and the values do not match.',
        code: `// packages/orders/status.ts
export enum Status { Open = 'open', Done = 'done' }
// packages/ui/status.ts
export enum Status { Open = 'OPEN', Done = 'DONE' }`,
        fix: `// packages/contracts/status.ts
export const Status = { Open: 'open', Done: 'done' } as const;
export type Status = typeof Status[keyof typeof Status];
// orders and ui import from '@acme/contracts'`,
        short: 'Keep one source of truth in a shared contracts package (or generate it from the API) and import it everywhere.',
        long: `Two enums with the same name are different types, and values can drift.
TypeScript will not warn, because each package only sees its own copy.
Move the values to one package, ideally generated from the backend schema.
A const object avoids enum quirks and works with isolatedModules.
Pitfall: duplicated package versions in node_modules can still bring two copies; check with npm ls.
Strong answer: single source, generation, and a check for duplicate versions.
Weak answer: syncs them by hand.`,
        follow: 'How do you find two versions of the same package in a monorepo?',
        exercises: [
          {
            task: 'Why does this assignment fail even though the values are the same?',
            description: 'Checks that enums are nominal.',
            code: `import { Status as A } from 'orders';
import { Status as B } from 'ui';
const s: A = B.Open;`,
            answer: 'Enums with the same members are still different types. Use one shared type.',
          },
          {
            task: 'Propose a CI check that stops new copies of this enum.',
            description: 'Checks process thinking.',
            answer: 'Add a lint rule (no-restricted-syntax or a custom rule) for enum Status outside contracts, or a codegen diff check.',
          },
        ],
      },
      {
        q: 'How do you share enum-like values between a C# backend and a TypeScript frontend?',
        short: 'Generate them from one source such as OpenAPI, as string literal unions, and serialize enums as strings.',
        long: 'Numeric enums over JSON break when the order changes.\nConfigure the backend to serialize enums as strings.\nGenerate TS unions or as const objects from the OpenAPI spec.\nAdd unknown handling for forward compatibility.\nStrong answer: covers serialization, codegen, and evolution.\nWeak answer: copies values by hand.',
        exercises: [
          {
            task: 'What setting makes ASP.NET Core send enums as strings?',
            description: 'Checks cross-stack knowledge. Quick question.',
            answer: 'Add JsonStringEnumConverter to the JSON options. Then the OpenAPI spec shows string values. Weak answers do not know.',
          },
          {
            task: 'How do you keep generated enums from breaking old clients?',
            description: 'Checks evolution strategy. Discuss.',
            answer: 'Only add values, never rename or reuse them, and make clients handle unknown values. Strong answers mention a deprecation period.',
          },
        ],
      },
    ],
  },
  },
};
