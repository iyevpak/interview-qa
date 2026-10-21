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
            task: 'Make phone optional and id read-only.',
            description: 'Checks ? and readonly modifiers.',
            code: 'interface User { id: string; phone: string }',
            answer: 'Add readonly to id and ? to phone.',
            solution: 'interface User { readonly id: string; phone?: string }',
          },
          {
            task: 'Predict whether this compiles with exactOptionalPropertyTypes.',
            description: 'Checks optional vs undefined values.',
            code: `interface O { tag?: string }
const o: O = { tag: undefined };`,
            answer: 'It fails: with that flag, optional means "may be missing", not "may be undefined". Use tag?: string | undefined.',
          },
          {
            easy: true,
            task: 'Predict whether the assignment compiles.',
            description: 'Checks readonly assignment.',
            code: `interface U { readonly id: number }
const u: U = { id: 1 };
u.id = 2;`,
            answer: 'No; id is readonly, so assigning it is an error.',
          },
          {
            easy: true,
            task: 'Predict whether this object is valid.',
            description: 'Checks optional property omission.',
            code: `interface P { name: string; age?: number }
const p: P = { name: 'Ann' };`,
            answer: 'Yes; age is optional, so it can be left out.',
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
            task: 'Fix the type so the point needs exactly two numbers.',
            description: 'Checks tuple types.',
            code: `type Point = number[];
dist([3]);`,
            answer: 'Use a tuple; then [3] is a compile error.',
            solution: 'type Point = [x: number, y: number];',
          },
          {
            task: 'Predict the type of p[2].',
            description: 'Checks out-of-range tuple access.',
            code: `const p: [number, number] = [1, 2];
const z = p[2];`,
            answer: 'It is an error: tuple of length 2 has no element at index 2.',
          },
          {
            easy: true,
            task: 'Predict whether this tuple call compiles.',
            description: 'Checks tuple length.',
            code: `function f(p: [number, number]) {}
f([1, 2, 3]);`,
            answer: 'No; the tuple needs exactly two numbers, not three.',
          },
          {
            easy: true,
            task: 'Name the type of p[0].',
            description: 'Checks tuple element types.',
            code: 'const p: [string, number] = [\'a\', 1];',
            answer: 'p[0] is string, the first tuple element type.',
          },
        ],
      },
      {
        q: 'How do you type a function with an interface or a type alias?',
        short: 'Use a call signature: `type Fn = (a: number) => string` or `interface Fn { (a: number): string }`.',
        long: 'A type alias with arrow syntax is the most common form.\nAn interface with a call signature can also add properties to the function.\nMethod syntax `m(): void` and property syntax `m: () => void` differ: method params are checked bivariantly.\nPitfall: using `Function` as a type loses all parameter checks.\nStrong answer: knows both forms and the bivariance difference under strictFunctionTypes.\nWeak answer: uses Function or any.',
        exercises: [
          {
            task: 'Write a function type for a click handler.',
            description: 'Checks function type aliases.',
            answer: 'A type alias with an arrow signature.',
            solution: `type OnClick = (id: string) => void;
const h: OnClick = id => console.log(id);`,
          },
          {
            task: 'Rewrite the type as an interface call signature.',
            description: 'Checks call signatures in interfaces.',
            code: 'type Fmt = (n: number) => string;',
            answer: 'Interfaces use a call signature without =>.',
            solution: 'interface Fmt { (n: number): string }',
          },
          {
            easy: true,
            task: 'Write a type for an add function.',
            description: 'Checks function type alias.',
            code: 'const add: Add = (a, b) => a + b;',
            answer: 'type Add = (a: number, b: number) => number;',
          },
          {
            easy: true,
            task: 'Predict whether this assignment compiles.',
            description: 'Checks parameter type match.',
            code: `type Fn = (x: number) => void;
const f: Fn = (x: string) => {};`,
            answer: 'No; string parameter does not match the number parameter.',
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
            task: 'Write a type for a function with a version property.',
            description: 'Checks hybrid callable types.',
            answer: 'Combine a call signature and a property.',
            solution: `type Fn = { (x: number): number; version: string };
const f = ((x: number) => x * 2) as Fn;
f.version = '1';`,
          },
          {
            task: 'Predict whether this compiles.',
            description: 'Checks property assignment on function declarations.',
            code: `function log(msg: string) {}
log.level = 'info';`,
            answer: 'It compiles: TS lets you add properties to function declarations in the same scope.',
          },
          {
            easy: true,
            task: 'Predict whether calling c() compiles.',
            description: 'Checks call signature use.',
            code: `interface C { (): string; n: number }
declare const c: C;
const s = c();`,
            answer: 'Yes; the call signature makes c callable and returns string.',
          },
          {
            easy: true,
            task: 'Read the property from a callable type.',
            description: 'Checks property on callable.',
            code: `interface C { (): void; n: number }
declare const c: C;
c.n;`,
            answer: 'c.n is a number; callable types can also have properties.',
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
            task: 'Fix the code by using an intersection.',
            description: 'Checks extending union types.',
            code: `type Shape = { kind: 'c'; r: number } | { kind: 's'; s: number };
interface Colored extends Shape { color: string }`,
            answer: 'An interface cannot extend a union; use a type with &.',
            solution: 'type Colored = Shape & { color: string };',
          },
          {
            task: 'Predict what Colored contains.',
            description: 'Checks intersection distributing over unions.',
            code: 'type Colored = ({ kind: \'c\' } | { kind: \'s\' }) & { color: string };',
            answer: 'It is a union of two shapes, each with color. Narrowing on kind still works.',
          },
          {
            easy: true,
            task: 'Predict whether this interface extends compile.',
            description: 'Checks extending object type alias.',
            code: `type Base = { id: string };
interface Item extends Base { name: string }`,
            answer: 'Yes; an interface can extend an object type alias, not a union.',
          },
          {
            easy: true,
            task: 'Write the union with color using intersection.',
            description: 'Checks intersection with union.',
            answer: 'type Colored = Shape & { color: string }; adds color to each member.',
          },
        ],
      },
      {
        q: 'What is an index signature? When is Record a better choice?',
        short: 'An index signature `[key: string]: T` allows any key of that type; Record<K, T> is a mapped type that can also restrict keys to a union.',
        long: '`{ [key: string]: number }` accepts any string key.\n`Record<"a" | "b", number>` requires exactly those keys.\nPitfall: with an index signature, `obj.foo` is typed as number even when missing; enable noUncheckedIndexedAccess.\nNamed properties must be compatible with the index signature type.\nFor dynamic keys, Map may be better.\nStrong answer: mentions noUncheckedIndexedAccess and key unions.\nWeak answer: treats them as identical.',
        exercises: [
          {
            task: 'Rewrite the index signature with Record.',
            description: 'Checks Record for known key unions.',
            code: 'type Prices = { [key: string]: number };',
            answer: 'Record is shorter; with a key union it also requires every key.',
            solution: 'type Prices = Record<\'small\' | \'large\', number>;',
          },
          {
            task: 'Predict whether this compiles.',
            description: 'Checks index signature consistency.',
            code: 'interface Dict { [k: string]: number; name: string }',
            answer: 'It fails: name (string) must match the index signature type number.',
          },
          {
            easy: true,
            task: 'Predict the type of obj[\'x\'].',
            description: 'Checks index signature value type.',
            code: `const obj: { [k: string]: number } = {};
const v = obj['x'];`,
            answer: 'number (or number | undefined with noUncheckedIndexedAccess).',
          },
          {
            easy: true,
            task: 'Name the utility equal to this signature.',
            description: 'Checks Record utility.',
            code: '{ [k: string]: boolean }',
            answer: 'Record<string, boolean> is the same as this index signature.',
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
            task: 'Predict which assignment fails.',
            description: 'Checks implicit index signatures.',
            code: `interface I { a: string }
type T = { a: string };
declare const i: I, t: T;
const r1: Record<string, unknown> = i;
const r2: Record<string, unknown> = t;`,
            answer: 'r1 fails: interfaces can be merged, so they get no implicit index signature. Type aliases do.',
          },
          {
            task: 'Fix the assignment for the interface.',
            description: 'Checks working around index signatures.',
            code: 'const r: Record<string, unknown> = i;',
            answer: 'Spread into a new object, or use a type alias.',
            solution: 'const r: Record<string, unknown> = { ...i };',
          },
          {
            easy: true,
            task: 'Predict whether this compiles.',
            description: 'Checks type alias to Record.',
            code: `type T = { a: string };
const t: T = { a: 'x' };
const r: Record<string, unknown> = t;`,
            answer: 'Yes; type aliases get an implicit index signature.',
          },
          {
            easy: true,
            task: 'True or false: interfaces get implicit index signatures.',
            description: 'Checks interface index signature rule.',
            code: `interface I { a: string }
const r: Record<string, unknown> = {} as I;`,
            answer: 'False; interfaces can be merged later, so TS does not assume one.',
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
            task: 'Predict whether this compiles with strictFunctionTypes.',
            description: 'Checks method vs property bivariance.',
            code: `interface S { on: (cb: (v: string | number) => void) => void }
const s: S = { on(cb: (v: string) => void) {} };`,
            answer: 'It fails: property syntax is checked strictly. Method syntax on(cb) would be bivariant and pass.',
          },
          {
            task: 'Fix the interface so it is checked strictly.',
            description: 'Checks method shorthand bivariance.',
            code: 'interface Store { on(cb: (v: string) => void): void }',
            answer: 'Use property syntax; method shorthand parameters are checked bivariantly.',
            solution: 'interface Store { on: (cb: (v: string) => void) => void }',
          },
          {
            easy: true,
            task: 'Predict whether method syntax is checked bivariantly.',
            description: 'Checks method bivariance.',
            code: 'interface S { on(cb: (v: string | number) => void): void }',
            answer: 'Yes; method syntax parameters stay bivariant even with strictFunctionTypes.',
          },
          {
            easy: true,
            task: 'Rewrite the method as a property.',
            description: 'Checks strict property syntax.',
            code: 'interface S { on(cb: (v: number) => void): void }',
            answer: 'interface S { on: (cb: (v: number) => void) => void } is checked strictly.',
          },
        ],
      },
      {
        q: 'How do interfaces and type aliases affect compiler performance in a big project?',
        short: 'Interfaces are cached by name and their extends checks are cheaper; large intersections and deep conditional aliases are re-computed and slow.',
        long: 'The TS performance wiki suggests preferring interface extends over intersections.\nIntersections are flattened and checked member by member each time.\nNamed interfaces show shorter names in errors and .d.ts files.\nHuge unions (thousands of members) cause quadratic checks.\nTools: `tsc --extendedDiagnostics`, `--generateTrace`, and @typescript/analyze-trace.\nStrong answer: measures before changing and names the tools.\nWeak answer: says types have no cost because they are erased.',
        exercises: [
          {
            task: 'Spot the performance problem.',
            description: 'Checks intersections vs interface extends.',
            code: 'type Props = A & B & C & D & E & F;',
            answer: 'Large intersections are re-computed and cached poorly. interface X extends A, B {} is cached and faster.',
          },
          {
            task: 'Rewrite the intersection with extends.',
            description: 'Checks faster interface composition.',
            code: 'type User = Base & Timestamps & { name: string };',
            answer: 'Interfaces are cached by name and give clearer errors.',
            solution: 'interface User extends Base, Timestamps { name: string }',
          },
          {
            easy: true,
            task: 'True or false: interface extends is cached.',
            description: 'Checks interface caching.',
            code: `interface B extends A { x: 1 }
type C = A & { x: 1 };`,
            answer: 'True; interface relations are cached, intersections are recomputed more often.',
          },
          {
            easy: true,
            task: 'Name the flag that shows check time.',
            description: 'Checks diagnostics flag.',
            code: 'tsc --noEmit ???',
            answer: '--extendedDiagnostics prints check time, types and memory use.',
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
            task: 'Write a form type from the API type.',
            description: 'Checks deriving types with utility types.',
            code: 'type UserDto = { id: string; name: string; createdAt: string };',
            answer: 'The form omits server fields; derive it so changes flow through.',
            solution: 'type UserForm = Omit<UserDto, \'id\' | \'createdAt\'>;',
          },
          {
            task: 'Spot the problem with sharing one type.',
            description: 'Checks separating API and UI models.',
            code: 'type User = { createdAt: string }; // used in form state and API',
            answer: 'Forms often need a Date or empty values; API sends strings. Map between them at the boundary.',
          },
          {
            easy: true,
            task: 'Make every User field optional.',
            description: 'Checks Partial utility.',
            code: 'interface User { id: string; name: string }',
            answer: 'type Draft = Partial<User>; makes every field optional.',
          },
          {
            easy: true,
            task: 'Drop id from the form type.',
            description: 'Checks Omit utility.',
            code: 'interface User { id: string; name: string }',
            answer: 'type UserForm = Omit<User, \'id\'>; removes the server id.',
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
            task: 'Fix the shared type to remove the escape hatches.',
            description: 'Checks avoiding any and loose index signatures.',
            code: 'export interface User { id: string; settings: any; [k: string]: any }',
            answer: 'any and the index signature allow any field and hide breaking changes.',
            solution: 'export interface User { id: string; settings: UserSettings }',
          },
          {
            task: 'Name two rules for safe changes to a shared type.',
            description: 'Checks type versioning discipline.',
            answer: 'Add fields as optional first, and never rename or remove without a deprecation period and semver major.',
          },
          {
            easy: true,
            task: 'Spot the unsafe type in this field.',
            description: 'Checks any in shared types.',
            code: 'export interface User { settings: any }',
            answer: 'settings: any turns off checks; use unknown or a real type.',
          },
          {
            easy: true,
            task: 'True or false: adding required fields is safe.',
            description: 'Checks breaking change rule.',
            code: 'interface User { id: string; phone: string } // phone is new',
            answer: 'False; a new required field breaks every place that builds the type.',
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
            task: 'Add a deprecation note to a field.',
            description: 'Checks TSDoc tags in shared types.',
            code: 'interface User { name: string; fullName: string }',
            answer: 'Use @deprecated; editors strike it through.',
            solution: `interface User {
  /** @deprecated Use fullName. */
  name: string;
  fullName: string;
}`,
          },
          {
            task: 'Name two ways to document shared types.',
            description: 'Checks type documentation practices.',
            answer: 'TSDoc comments with examples on each export, and generated docs like TypeDoc or API Extractor.',
          },
          {
            easy: true,
            task: 'Add a doc comment to the field.',
            description: 'Checks TSDoc comment.',
            code: 'interface User { email: string }',
            answer: 'Add /** Primary login email. */ above email; editors show it on hover.',
          },
          {
            easy: true,
            task: 'Name the tag for an old field.',
            description: 'Checks deprecated tag.',
            code: `/** ??? Use fullName. */
name: string;`,
            answer: '@deprecated; editors strike through the field and show the note.',
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
            task: 'Rewrite the class with parameter properties.',
            description: 'Checks constructor shorthand.',
            code: `class User {
  name: string;
  constructor(name: string) { this.name = name; }
}`,
            answer: 'A modifier on the parameter declares and assigns the field.',
            solution: 'class User { constructor(public name: string) {} }',
          },
          {
            task: 'Predict whether this works with erasableSyntaxOnly.',
            description: 'Checks that parameter properties emit code.',
            code: 'class A { constructor(private x: number) {} }',
            answer: 'It fails: parameter properties emit runtime code, so they are not erasable.',
          },
          {
            easy: true,
            task: 'Predict the value of p.name.',
            description: 'Checks parameter property assignment.',
            code: `class P { constructor(public name: string) {} }
const p = new P('Ann');`,
            answer: '\'Ann\'; public name creates and assigns the field.',
          },
          {
            easy: true,
            task: 'Predict whether this compiles.',
            description: 'Checks private parameter property.',
            code: `class P { constructor(private id: number) {} }
new P(1).id;`,
            answer: 'No; private id is only readable inside the class.',
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
            task: 'Fix the field so it has a value.',
            description: 'Checks strictPropertyInitialization.',
            code: 'class Counter { count: number; inc() { this.count++; } }',
            answer: 'Give it an initializer.',
            solution: 'class Counter { count = 0; inc() { this.count++; } }',
          },
          {
            task: 'Spot the risk of the ! fix.',
            description: 'Checks definite assignment assertions.',
            code: 'class A { name!: string; }',
            answer: '! silences the check; name is still undefined at runtime until set.',
          },
          {
            easy: true,
            task: 'Predict the error with strict mode.',
            description: 'Checks strictPropertyInitialization.',
            code: 'class A { n: number; }',
            answer: 'Error: n has no initializer and is not set in the constructor.',
          },
          {
            easy: true,
            task: 'Fix the field with an initializer.',
            description: 'Checks field initializer.',
            code: 'class A { n: number; }',
            answer: 'class A { n = 0; } gives the field a value.',
          },
        ],
      },
      {
        q: 'What does the super keyword do in a class?',
        short: 'super() calls the parent constructor, and super.method() calls the parent version of a method.',
        long: 'In a subclass constructor, you must call super() before using this.\nsuper.method() lets you extend parent behavior instead of replacing it.\nTS reports an error if this is used before super().\nPitfall: forgetting to pass required arguments to super.\nStrong answer: explains both uses and the order rule.\nWeak answer: only knows super() in constructors.',
        exercises: [
          {
            task: 'Fix the method so it calls the parent version.',
            description: 'Checks super.method calls.',
            code: `class A { greet() { return 'hi'; } }
class B extends A { override greet() { return greet() + '!'; } }`,
            answer: 'Use super.greet() to call the parent method.',
            solution: 'class B extends A { override greet() { return super.greet() + \'!\'; } }',
          },
          {
            task: 'Predict whether this compiles.',
            description: 'Checks this before super.',
            code: `class B extends A {
  x = 1;
  constructor() { console.log(this.x); super(); }
}`,
            answer: 'It fails: this cannot be used before super() in a derived class.',
          },
          {
            easy: true,
            task: 'Predict the error without super().',
            description: 'Checks super call requirement.',
            code: `class A { constructor(public x: number) {} }
class B extends A { constructor() { } }`,
            answer: 'Error: derived class constructors must call super().',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks super method call.',
            code: `class A { hi() { return 'A' } }
class B extends A { hi() { return super.hi() + 'B' } }
console.log(new B().hi());`,
            answer: '\'AB\'; super.hi() calls the parent method first.',
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
            task: 'Predict the error with noImplicitOverride.',
            description: 'Checks override typo detection.',
            code: `class A { render() {} }
class B extends A { override rendr() {} }`,
            answer: 'Error: rendr is not in base class A. override catches typos.',
          },
          {
            task: 'Fix the code for noImplicitOverride.',
            description: 'Checks marking overrides.',
            code: `class A { run() {} }
class B extends A { run() {} }`,
            answer: 'Add override to members that replace base members.',
            solution: 'class B extends A { override run() {} }',
          },
          {
            easy: true,
            task: 'Predict the error with override.',
            description: 'Checks override on missing method.',
            code: `class A { run() {} }
class B extends A { override walk() {} }`,
            answer: 'Error: walk does not exist in A, so override fails.',
          },
          {
            easy: true,
            task: 'Add the right keyword here.',
            description: 'Checks override keyword use.',
            code: `class A { run() {} }
class B extends A { run() {} }`,
            answer: 'Write override run() {} so the override is explicit.',
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
            task: 'Fix the code so it compiles.',
            description: 'Checks abstract class usage rules.',
            code: `abstract class Repo<T> { abstract get(id: string): Promise<T> }
class UserRepo extends Repo<User> {}`,
            answer: 'UserRepo must implement get.',
            solution: `class UserRepo extends Repo<User> {
  get(id: string) { return fetchUser(id); }
}`,
          },
          {
            task: 'Predict whether this compiles.',
            description: 'Checks instantiating abstract classes.',
            code: `abstract class A {}
const a = new A();`,
            answer: 'It fails: cannot create an instance of an abstract class.',
          },
          {
            easy: true,
            task: 'Predict whether new on abstract compiles.',
            description: 'Checks abstract instantiation.',
            code: `abstract class A {}
new A();`,
            answer: 'No; abstract classes cannot be created with new.',
          },
          {
            easy: true,
            task: 'Predict the error in this subclass.',
            description: 'Checks missing abstract implementation.',
            code: `abstract class A { abstract go(): void }
class B extends A {}`,
            answer: 'Error: B must implement the abstract method go.',
          },
        ],
      },
      {
        q: 'How do you type the this return value for fluent builders in subclasses?',
        short: 'Return the polymorphic `this` type so chained calls keep the subclass type.',
        long: 'If a method returns the class name, a subclass chain loses its own methods.\nReturning `this` makes the type follow the actual instance.\nWorks for builders and fluent APIs.\nPitfall: returning `new Base()` breaks it at runtime.\nStrong answer: names polymorphic this.\nWeak answer: overrides every method in the subclass.',
        exercises: [
          {
            task: 'Fix the builder so chaining keeps the subclass type.',
            description: 'Checks polymorphic this types.',
            code: `class Base { set(k: string): Base { return this; } }
class Q extends Base { where() { return this; } }
new Q().set('a').where();`,
            answer: 'Return type this keeps the subclass type.',
            solution: 'class Base { set(k: string): this { return this; } }',
          },
          {
            task: 'Predict the type of r.',
            description: 'Checks this return type inference.',
            code: `class A { me() { return this; } }
class B extends A { b = 1; }
const r = new B().me();`,
            answer: 'r is B: returning this infers the polymorphic this type.',
          },
          {
            easy: true,
            task: 'Predict the return type of set().',
            description: 'Checks this return type.',
            code: `class B { set(): this { return this } }
class C extends B {}
const r = new C().set();`,
            answer: 'C; the this type follows the subclass.',
          },
          {
            easy: true,
            task: 'Predict whether r.extra() compiles.',
            description: 'Checks chained subclass method.',
            code: `class B { set(): this { return this } }
class C extends B { extra() {} }
new C().set().extra();`,
            answer: 'Yes; set() returns this, so C methods stay available.',
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
            task: 'Predict the output.',
            description: 'Checks instanceof vs structure.',
            code: `class P { x = 1; }
const o = Object.create(P.prototype);
console.log(o instanceof P, 'x' in o);`,
            answer: 'true false: instanceof checks the prototype, not the fields.',
          },
          {
            task: 'Predict whether this compiles.',
            description: 'Checks structural compatibility of classes.',
            code: `class A { x = 1; }
class B { x = 2; }
const a: A = new B();`,
            answer: 'It compiles: both have the same shape.',
          },
          {
            easy: true,
            task: 'Predict whether this compiles.',
            description: 'Checks structural class typing.',
            code: `class A { x = 1 }
const a: A = { x: 2 };`,
            answer: 'Yes; classes are typed by shape, so a plain object fits.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks instanceof on plain object.',
            code: `class A { x = 1 }
const a: A = { x: 2 };
console.log(a instanceof A);`,
            answer: 'false; the plain object was not made by the A constructor.',
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
            task: 'Fix the base class so subclasses can override.',
            description: 'Checks arrow fields vs methods.',
            code: `class Base { handle = () => 'base'; }
class Child extends Base { override handle() { return 'child'; } }`,
            answer: 'Arrow fields are set on the instance and hide prototype methods. Use a method in the base.',
            solution: 'class Base { handle() { return \'base\'; } }',
          },
          {
            task: 'Predict the output.',
            description: 'Checks instance field shadowing prototype methods.',
            code: `class A { f = () => 'A'; }
class B extends A { f2() {} }
B.prototype.f = () => 'B';
console.log(new B().f());`,
            answer: 'It logs "A": the instance field wins over the prototype.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks prototype method override.',
            code: `class A { f() { return 'a' } }
class B extends A { override f() { return 'b' } }
console.log(new B().f());`,
            answer: '\'b\'; prototype methods override normally.',
          },
          {
            easy: true,
            task: 'True or false: arrow fields live on prototype.',
            description: 'Checks arrow field location.',
            answer: 'False; arrow fields are set on each instance in the constructor.',
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
            task: 'Rewrite the field with the accessor keyword.',
            description: 'Checks auto-accessors.',
            code: `class Store {
  #v = 0;
  get v() { return this.#v; }
  set v(x) { this.#v = x; }
}`,
            answer: 'accessor creates the private storage and get/set for you.',
            solution: 'class Store { accessor v = 0; }',
          },
          {
            task: 'Name one use of accessor fields.',
            description: 'Checks auto-accessors with decorators.',
            answer: 'Decorators on accessor fields can intercept get and set, for example for reactive or validated fields.',
          },
          {
            easy: true,
            task: 'Predict what accessor creates.',
            description: 'Checks accessor keyword.',
            code: 'class A { accessor n = 1 }',
            answer: 'A private storage slot plus a get and set pair for n.',
          },
          {
            easy: true,
            task: 'Predict the value of a.n.',
            description: 'Checks accessor read.',
            code: `class A { accessor n = 5 }
const a = new A();
a.n++;`,
            answer: '6; accessor fields read and write like normal fields.',
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
            task: 'Refactor the subclass into composition.',
            description: 'Checks composition over inheritance.',
            code: 'class CachedApi extends Api {}',
            answer: 'Wrap the API instead of extending it.',
            solution: `function withCache(api: Api): Api {
  const cache = new Map<string, unknown>();
  return { get: url => cache.get(url) ?? api.get(url) };
}`,
          },
          {
            task: 'Name one case where inheritance is fine.',
            description: 'Checks judgement on inheritance.',
            answer: 'Shallow hierarchies with a real is-a relation, like custom Error classes or framework base classes.',
          },
          {
            easy: true,
            task: 'Name the principle in this phrase.',
            description: 'Checks composition principle.',
            code: '\'Favor ___ over inheritance.\'',
            answer: 'Composition; build behavior by holding objects, not by extending classes.',
          },
          {
            easy: true,
            task: 'Spot the problem with this hierarchy.',
            description: 'Checks deep inheritance smell.',
            code: `class A {} class B extends A {}
class C extends B {} class D extends C {}`,
            answer: 'Deep chains are fragile; a base change can break every subclass.',
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
            task: 'Fix the custom error for ES5 output.',
            description: 'Checks setPrototypeOf with Error subclasses.',
            code: `class ApiError extends Error {
  constructor(msg: string) { super(msg); }
}`,
            answer: 'Restore the prototype so instanceof works.',
            solution: `class ApiError extends Error {
  constructor(msg: string) { super(msg); Object.setPrototypeOf(this, new.target.prototype); }
}`,
          },
          {
            task: 'Name the simpler fix for this problem.',
            description: 'Checks modern build targets.',
            answer: 'Target ES2015 or later; native classes keep the prototype correct.',
          },
          {
            easy: true,
            task: 'Name the method used in the fix.',
            description: 'Checks setPrototypeOf.',
            code: `super(msg);
???(this, ApiError.prototype);`,
            answer: 'Object.setPrototypeOf restores the prototype so instanceof works.',
          },
          {
            easy: true,
            task: 'Predict err.name without setting it.',
            description: 'Checks Error name default.',
            code: `class ApiError extends Error {}
console.log(new ApiError('x').name);`,
            answer: '\'Error\'; set this.name = \'ApiError\' to change it.',
          },
        ],
      },
      {
        q: 'How do you set rules for classes in a React and TypeScript team?',
        short: 'Use plain types and functions for data and UI; use classes only for stateful services, errors, and integration code.',
        long: 'React state needs plain serializable data.\nClasses in state break structural cloning and devtools.\nServices like API clients or a WebSocket manager fit classes well.\nDocument the rule and enforce with lint where possible.\nStrong answer: gives clear boundaries and reasons.\nWeak answer: bans or allows classes everywhere.',
        exercises: [
          {
            task: 'Rewrite the class component as a function.',
            description: 'Checks modern React style.',
            code: `class Hello extends React.Component<{ name: string }> {
  render() { return <p>{this.props.name}</p>; }
}`,
            answer: 'Function components are the default in React 19.',
            solution: `function Hello({ name }: { name: string }) {
  return <p>{name}</p>;
}`,
          },
          {
            task: 'Name one place where classes still fit in React apps.',
            description: 'Checks pragmatic class rules.',
            answer: 'Error boundaries still need a class. Also custom Error types and framework-independent domain logic.',
          },
          {
            easy: true,
            task: 'Name the hook replacing componentDidMount.',
            description: 'Checks useEffect basics.',
            answer: 'useEffect with an empty deps array runs once after mount.',
          },
          {
            easy: true,
            task: 'True or false: error boundaries need classes.',
            description: 'Checks error boundary rule.',
            answer: 'True; React error boundaries still need a class component.',
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
            task: 'Predict whether this compiles.',
            description: 'Checks default public access.',
            code: `class A { x = 1; }
new A().x = 2;`,
            answer: 'It compiles: members are public by default.',
          },
          {
            task: 'Make x readable but not writable outside.',
            description: 'Checks readonly modifier.',
            code: 'class A { x = 1; }',
            answer: 'Mark x readonly.',
            solution: 'class A { readonly x = 1; }',
          },
          {
            easy: true,
            task: 'Predict whether this compiles.',
            description: 'Checks default public access.',
            code: `class A { x = 1 }
new A().x = 2;`,
            answer: 'Yes; members are public by default.',
          },
          {
            easy: true,
            task: 'Name the modifier that blocks outside access.',
            description: 'Checks private modifier.',
            code: 'class A { ??? x = 1 }',
            answer: 'private; only code inside A can use x.',
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
            task: 'Fix the access error in the subclass.',
            description: 'Checks protected for subclasses.',
            code: `class Animal { private name = 'x'; }
class Dog extends Animal { bark() { return this.name; } }`,
            answer: 'Use protected so subclasses can read it.',
            solution: 'class Animal { protected name = \'x\'; }',
          },
          {
            task: 'Predict whether this compiles.',
            description: 'Checks protected access from outside.',
            code: `class A { protected n = 1; }
new A().n;`,
            answer: 'It fails: protected members are not visible outside the class family.',
          },
          {
            easy: true,
            task: 'Predict whether this compiles.',
            description: 'Checks protected subclass access.',
            code: `class A { protected n = 1 }
class B extends A { f() { return this.n } }`,
            answer: 'Yes; protected members are visible in subclasses.',
          },
          {
            easy: true,
            task: 'Predict whether outside access compiles.',
            description: 'Checks protected outside access.',
            code: `class A { protected n = 1 }
new A().n;`,
            answer: 'No; protected members cannot be read outside the class tree.',
          },
        ],
      },
      {
        q: 'What is the difference between private and readonly?',
        short: 'private controls who can see a member; readonly controls whether it can be reassigned after construction.',
        long: 'private hides the member from code outside the class.\nreadonly lets everyone read it, but nobody can reassign it after the constructor.\nYou can combine them: `private readonly`.\nBoth are compile-time only.\nStrong answer: says they solve different problems and can combine.\nWeak answer: thinks they are the same.',
        exercises: [
          {
            task: 'Predict which line errors.',
            description: 'Checks private vs readonly.',
            code: `class A { private a = 1; readonly b = 2; }
const x = new A();
x.a; x.b = 3;`,
            answer: 'Both: a is private (no read outside); b can be read but not written.',
          },
          {
            task: 'Make the field readable outside but fixed after construction.',
            description: 'Checks readonly fields.',
            code: 'class Order { id: string; constructor(id: string) { this.id = id; } }',
            answer: 'readonly allows assignment only in the constructor.',
            solution: 'class Order { constructor(readonly id: string) {} }',
          },
          {
            easy: true,
            task: 'Predict whether the outside read compiles.',
            description: 'Checks readonly public read.',
            code: `class A { readonly id = 1 }
console.log(new A().id);`,
            answer: 'Yes; readonly fields can be read, just not changed.',
          },
          {
            easy: true,
            task: 'Predict whether the constructor write compiles.',
            description: 'Checks readonly constructor assignment.',
            code: `class A { readonly id: number;
  constructor() { this.id = 5 } }`,
            answer: 'Yes; readonly fields can be set in the constructor.',
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
            task: 'Write a class that can only be created via a static method.',
            description: 'Checks private or protected constructors.',
            answer: 'A private constructor forces callers to use the factory.',
            solution: `class Id {
  private constructor(readonly v: string) {}
  static create() { return new Id(crypto.randomUUID()); }
}`,
          },
          {
            task: 'Predict whether this compiles.',
            description: 'Checks protected constructors.',
            code: `class Base { protected constructor() {} }
class Sub extends Base {}
new Base(); new Sub();`,
            answer: 'new Base() fails; new Sub() works. Protected constructors allow subclassing only.',
          },
          {
            easy: true,
            task: 'Predict whether new compiles here.',
            description: 'Checks protected constructor.',
            code: `class A { protected constructor() {} }
new A();`,
            answer: 'No; a protected constructor blocks new outside the class tree.',
          },
          {
            easy: true,
            task: 'Predict whether subclassing compiles.',
            description: 'Checks protected constructor extends.',
            code: `class A { protected constructor() {} }
class B extends A { constructor() { super() } }`,
            answer: 'Yes; subclasses can call a protected constructor through super.',
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
            task: 'Predict whether this compiles.',
            description: 'Checks protected access through base type.',
            code: `class Base { protected s = 1; }
class A extends Base { peek(o: Base) { return o.s; } }`,
            answer: 'It fails: protected access must go through A or a subclass of A, not Base.',
          },
          {
            task: 'Fix the code so peek compiles.',
            description: 'Checks protected access through own class.',
            code: 'peek(o: Base) { return o.s; }',
            answer: 'Accept the same class type.',
            solution: 'peek(o: A) { return o.s; }',
          },
          {
            easy: true,
            task: 'Predict whether this read compiles.',
            description: 'Checks protected via this.',
            code: `class Base { protected s = 1 }
class A extends Base { f() { return this.s } }`,
            answer: 'Yes; reading through this, an A, is allowed.',
          },
          {
            easy: true,
            task: 'Predict whether reading via A compiles.',
            description: 'Checks protected through same subclass.',
            code: `class Base { protected s = 1 }
class A extends Base { f(o: A) { return o.s } }`,
            answer: 'Yes; access through the same subclass type is allowed.',
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
            task: 'Fix the interface with a private member.',
            description: 'Checks interfaces describe public shape.',
            code: 'interface Repo { private cache: Map<string, User>; get(id: string): User }',
            answer: 'Interfaces have no access modifiers; keep private state in the class.',
            solution: `interface Repo { get(id: string): User }
class UserRepo implements Repo { #cache = new Map<string, User>(); get(id: string) { return this.#cache.get(id)!; } }`,
          },
          {
            task: 'Predict whether this compiles.',
            description: 'Checks implements with private members.',
            code: `interface I { x: number }
class A implements I { private x = 1; }`,
            answer: 'It fails: I requires a public x.',
          },
          {
            easy: true,
            task: 'Predict whether this interface compiles.',
            description: 'Checks modifiers in interface.',
            code: 'interface I { private x: number }',
            answer: 'No; private is not allowed on interface members.',
          },
          {
            easy: true,
            task: 'True or false: interfaces describe public shape only.',
            description: 'Checks interface purpose.',
            answer: 'True; interfaces only describe the public shape of an object.',
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
            task: 'Predict whether this compiles.',
            description: 'Checks nominal behavior of private members.',
            code: `class A { private x = 1; }
class B { private x = 1; }
const a: A = new B();`,
            answer: 'It fails: private members make classes nominal; they must come from the same declaration.',
          },
          {
            task: 'Write a branded type without a class.',
            description: 'Checks brand types.',
            answer: 'Intersect with a unique marker property.',
            solution: `type UserId = string & { readonly __brand: 'UserId' };
const toUserId = (s: string) => s as UserId;`,
          },
          {
            easy: true,
            task: 'Predict whether public twins are compatible.',
            description: 'Checks public structural match.',
            code: `class A { x = 1 }
class B { x = 1 }
const a: A = new B();`,
            answer: 'Yes; with only public members, same shape means compatible.',
          },
          {
            easy: true,
            task: 'Predict whether private twins are compatible.',
            description: 'Checks private nominal behavior.',
            code: `class A { private x = 1 }
class B { private x = 1 }
const a: A = new B();`,
            answer: 'No; private members must come from the same declaration.',
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
            task: 'Fix equals so it does not throw on plain objects.',
            description: 'Checks #field in obj checks.',
            code: 'equals(o: Money) { return this.#cents === o.#cents; }',
            answer: 'Use #cents in o to check it is a real instance first.',
            solution: `equals(o: unknown) {
  return typeof o === 'object' && o !== null && #cents in o && this.#cents === o.#cents;
}`,
          },
          {
            task: 'Predict the output.',
            description: 'Checks private brand checks.',
            code: `class A { #x = 1; static is(o: object) { return #x in o; } }
console.log(A.is(new A()), A.is({}));`,
            answer: 'true false: #x in o checks whether o was created by A.',
          },
          {
            easy: true,
            task: 'Name the operator that checks #field existence.',
            description: 'Checks #x in obj.',
            code: 'if (??? o) return this.#c === o.#c;',
            answer: '#c in o checks the field safely without throwing.',
          },
          {
            easy: true,
            task: 'Predict whether reading #c outside compiles.',
            description: 'Checks hard private access.',
            code: `class M { #c = 1 }
new M().#c;`,
            answer: 'No; #c is only reachable inside the class body.',
          },
        ],
      },
      {
        q: 'How do private and #private appear in .d.ts files?',
        short: 'TS private members appear by name with no type; #private fields show up as a single `#private;` marker.',
        long: 'Declaration emit keeps `private x;` without its type to keep nominal behavior.\nFor hard private fields it emits `#private;` to mark the class as branded.\nConsumers cannot see the types of internal members.\nRenaming a TS private field changes the public .d.ts, which can break consumers.\nStrong answer: knows emit shapes and why the names stay.\nWeak answer: thinks private members are removed.',
        exercises: [
          {
            task: 'Predict the generated .d.ts.',
            description: 'Checks private in declaration files.',
            code: 'export class A { private secret: string = \'\'; }',
            answer: 'It emits private secret; with no type. The name is visible, the type is hidden.',
          },
          {
            task: 'Predict the generated .d.ts.',
            description: 'Checks #private in declaration files.',
            code: 'export class A { #secret = \'\'; }',
            answer: 'It emits #private; only, so the field name and type are hidden.',
          },
          {
            easy: true,
            task: 'True or false: private types appear in .d.ts.',
            description: 'Checks private in declarations.',
            answer: 'False; .d.ts keeps the name of private members but drops their types.',
          },
          {
            easy: true,
            task: 'Predict whether #private hides at runtime.',
            description: 'Checks runtime privacy.',
            code: `class A { #s = 1 }
console.log(Object.keys(new A()));`,
            answer: '[]; #private fields are truly hidden at runtime.',
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
            task: 'Hide this member from published types.',
            description: 'Checks @internal with stripInternal.',
            code: 'export class Client { helper() {} }',
            answer: 'Mark it /** @internal */ and enable stripInternal.',
            solution: `export class Client {
  /** @internal */
  helper() {}
}`,
          },
          {
            task: 'Name a tool that checks a library public API.',
            description: 'Checks API reporting tools.',
            answer: 'API Extractor produces an API report and can trim .d.ts files by release tags.',
          },
          {
            easy: true,
            task: 'Name the tag that hides members.',
            description: 'Checks @internal tag.',
            code: '/** ??? */ helper() {}',
            answer: '@internal with stripInternal removes it from .d.ts output.',
          },
          {
            easy: true,
            task: 'Name the tsconfig flag for @internal.',
            description: 'Checks stripInternal flag.',
            answer: 'stripInternal drops @internal members from generated .d.ts files.',
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
            task: 'Fix the service so helpers are hidden.',
            description: 'Checks encapsulation of internals.',
            code: 'export class AuthService { token = \'\'; refreshInternal() {} }',
            answer: 'Make internals #private so other teams cannot use them.',
            solution: `export class AuthService {
  #token = '';
  #refresh() {}
  login(u: string, p: string) {}
}`,
          },
          {
            task: 'Name a non-breaking way to remove a used public method.',
            description: 'Checks deprecation strategy.',
            answer: 'Mark it @deprecated, add a lint warning, provide the new API, and remove it in the next major version.',
          },
          {
            easy: true,
            task: 'Make the token field hidden.',
            description: 'Checks private field fix.',
            code: 'export class AuthService { token = \'\' }',
            answer: 'Use private token = \'\' or #token so other code cannot read it.',
          },
          {
            easy: true,
            task: 'Name the tag before removing a method.',
            description: 'Checks deprecation tag.',
            answer: '@deprecated warns users first, then remove it in a major version.',
          },
        ],
      },
      {
        q: 'Do access modifiers matter for security in the browser?',
        short: 'No. All client code and memory can be read by the user; modifiers only protect code structure, not secrets.',
        long: 'TS private disappears after compile.\n#private hides from other code but not from devtools or a memory snapshot.\nSecrets like API keys must never be in the frontend.\nUse modifiers for maintainability, not for protection.\nStrong answer: separates encapsulation from security.\nWeak answer: stores tokens in private fields and calls it safe.',
        exercises: [
          {
            task: 'Spot the security problem.',
            description: 'Checks that client code is visible.',
            code: 'class Api { #apiSecret = \'sk_live_123\'; }',
            answer: 'Anything in the bundle can be read by users. Secrets must stay on the server.',
          },
          {
            task: 'Predict whether users can read this value.',
            description: 'Checks runtime visibility of TS private.',
            code: 'class Cfg { private key = \'abc\'; }',
            answer: 'Yes: it is a normal property at runtime, visible in DevTools.',
          },
          {
            easy: true,
            task: 'True or false: private hides data from users.',
            description: 'Checks private is compile-time.',
            code: 'class A { private key = \'abc\' }',
            answer: 'False; private is erased; anyone can read it in devtools.',
          },
          {
            easy: true,
            task: 'Predict the output in plain JavaScript.',
            description: 'Checks erased private keyword.',
            code: `class A { private key = 'abc' }
console.log((new A() as any).key);`,
            answer: '\'abc\'; TS private is only a compile-time check.',
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
            task: 'Fix the function to keep the type.',
            description: 'Checks generics vs any.',
            code: 'function clone(x: any) { return structuredClone(x); }',
            answer: 'A generic T flows the input type to the output.',
            solution: 'function clone<T>(x: T): T { return structuredClone(x); }',
          },
          {
            task: 'Predict whether TS reports the error.',
            description: 'Checks any spreading.',
            code: `function f(x: any) { return x; }
f(1).toUpperCase();`,
            answer: 'No: any turns off checks, so it crashes at runtime instead.',
          },
          {
            easy: true,
            task: 'Predict the type of r.',
            description: 'Checks generic inference.',
            code: `function id<T>(x: T) { return x }
const r = id(42);`,
            answer: '42 for a const, since T infers the literal; number if widened.',
          },
          {
            easy: true,
            task: 'Predict whether this compiles.',
            description: 'Checks any hides errors.',
            code: `function f(x: any) { return x }
f(1).toUpperCase();`,
            answer: 'Yes; any hides the error until it crashes at runtime.',
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
            task: 'Fix the generic so length is allowed.',
            description: 'Checks generic constraints.',
            code: 'function getLength<T>(x: T) { return x.length; }',
            answer: 'Constrain T to types with length.',
            solution: 'function getLength<T extends { length: number }>(x: T) { return x.length; }',
          },
          {
            task: 'Predict which call fails.',
            description: 'Checks constraint enforcement.',
            code: `declare function len<T extends { length: number }>(x: T): number;
len('ab'); len([1]); len(5);`,
            answer: 'len(5) fails: number has no length.',
          },
          {
            easy: true,
            task: 'Predict whether this call compiles.',
            description: 'Checks length constraint.',
            code: `function len<T extends { length: number }>(x: T) { return x.length }
len(5);`,
            answer: 'No; number has no length, so it breaks the constraint.',
          },
          {
            easy: true,
            task: 'Predict whether this call compiles.',
            description: 'Checks string satisfies constraint.',
            code: `function len<T extends { length: number }>(x: T) { return x.length }
len('hi');`,
            answer: 'Yes; strings have length, so the call returns 2.',
          },
        ],
      },
      {
        q: 'How do you write a generic interface for an API response?',
        short: 'Add a type parameter to the interface, like `interface ApiResponse<T> { data: T; error?: string }`.',
        long: 'Generic interfaces let one shape wrap many data types.\nYou pass the type when using it: ApiResponse<User>.\nYou can give a default: `<T = unknown>`.\nPitfall: making data optional everywhere instead of modeling success and failure.\nStrong answer: may suggest a discriminated union for success and error.\nWeak answer: uses any for data.',
        exercises: [
          {
            task: 'Write a generic API response type.',
            description: 'Checks generic interfaces.',
            answer: 'Put the data type as a parameter.',
            solution: `interface ApiResponse<T> { data: T; error?: string }
type UsersRes = ApiResponse<User[]>;`,
          },
          {
            task: 'Add a default type parameter.',
            description: 'Checks generic defaults.',
            code: 'interface ApiResponse<T> { data: T }',
            answer: 'Default T to unknown so it can be used without an argument.',
            solution: 'interface ApiResponse<T = unknown> { data: T }',
          },
          {
            easy: true,
            task: 'Predict the type of r.data.',
            description: 'Checks generic interface use.',
            code: `interface Res<T> { data: T }
const r: Res<string[]> = { data: [] };`,
            answer: 'string[]; T is replaced by string[].',
          },
          {
            easy: true,
            task: 'Write a generic type for a list page.',
            description: 'Checks generic paged type.',
            answer: 'type Page<T> = { items: T[]; total: number };',
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
            task: 'Write a typed Stack class.',
            description: 'Checks generic classes.',
            answer: 'Use T for the items.',
            solution: `class Stack<T> {
  #items: T[] = [];
  push(x: T) { this.#items.push(x); }
  pop(): T | undefined { return this.#items.pop(); }
}`,
          },
          {
            task: 'Predict the error.',
            description: 'Checks generic class instance typing.',
            code: `const s = new Stack<number>();
s.push('a');`,
            answer: 'Error: "a" is not assignable to number.',
          },
          {
            easy: true,
            task: 'Predict whether this push compiles.',
            description: 'Checks generic class type.',
            code: `class Box<T> { items: T[] = [] }
new Box<number>().items.push('a');`,
            answer: 'No; the Box holds numbers, so \'a\' is rejected.',
          },
          {
            easy: true,
            task: 'Predict the type of b.get().',
            description: 'Checks generic class return.',
            code: `class Box<T> { constructor(private v: T) {}
  get() { return this.v } }
const b = new Box('x');`,
            answer: 'string; T is inferred as string from the constructor.',
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
            task: 'Fix the function to keep literal types.',
            description: 'Checks const type parameters.',
            code: `function routes<T extends string[]>(p: T) { return p; }
const r = routes(['home', 'about']); // string[]`,
            answer: 'A const type parameter infers a readonly tuple of literals (TS 5.0+).',
            solution: 'function routes<const T extends readonly string[]>(p: T) { return p; }',
          },
          {
            task: 'Predict the type of r.',
            description: 'Checks as const inference.',
            code: 'const r = [\'a\', \'b\'] as const;',
            answer: 'r is readonly ["a", "b"].',
          },
          {
            easy: true,
            task: 'Name the modifier that keeps literals.',
            description: 'Checks const type parameter.',
            code: 'function f<??? T extends readonly string[]>(x: T) { return x }',
            answer: 'const; a const type parameter infers readonly literal tuples.',
          },
          {
            easy: true,
            task: 'Predict the type of r.',
            description: 'Checks as const literal.',
            code: 'const r = [\'a\', \'b\'] as const;',
            answer: 'readonly [\'a\', \'b\']; as const keeps literal tuple types.',
          },
        ],
      },
      {
        q: 'How do generic defaults and constraints work together?',
        short: 'A default is used when TS cannot infer or the caller omits the argument; the default must satisfy the constraint.',
        long: '`<T extends object = {}>` means: must be object, and {} if not given.\nDefaults must come after required parameters.\nInference wins over the default when it is possible.\nPitfall: a default that does not meet the constraint is an error.\nStrong answer: knows inference beats defaults.\nWeak answer: thinks the default always applies.',
        exercises: [
          {
            task: 'Predict whether this compiles.',
            description: 'Checks defaults must satisfy constraints.',
            code: 'type Box<T extends string = number> = { v: T };',
            answer: 'It fails: the default number does not satisfy the constraint string.',
          },
          {
            task: 'Write a type with a default and a constraint.',
            description: 'Checks combining defaults and constraints.',
            answer: 'The default must meet the constraint.',
            solution: 'type Res<T extends object = Record<string, unknown>> = { data: T };',
          },
          {
            easy: true,
            task: 'Predict the type of x.',
            description: 'Checks generic default.',
            code: `type Box<T = string> = { v: T };
const x: Box = { v: 'a' };`,
            answer: 'Box<string>; the default string is used.',
          },
          {
            easy: true,
            task: 'Predict whether this compiles.',
            description: 'Checks default breaks constraint.',
            code: 'type B<T extends string = number> = T;',
            answer: 'No; the default number does not satisfy extends string.',
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
            task: 'Predict whether this compiles.',
            description: 'Checks out variance.',
            code: `interface Box<out T> { get(): T }
const b: Box<string | number> = {} as Box<string>;`,
            answer: 'It compiles: out T is covariant, so Box<string> fits Box<string | number>.',
          },
          {
            task: 'Spot the error in the annotation.',
            description: 'Checks variance annotation correctness.',
            code: 'interface Sink<out T> { put(x: T): void }',
            answer: 'T is used as an input, so it must be in T, not out T. TS reports the mismatch.',
          },
          {
            easy: true,
            task: 'True or false: out marks covariance.',
            description: 'Checks out annotation.',
            answer: 'True; out means T is only produced, so it is covariant.',
          },
          {
            easy: true,
            task: 'Name the annotation for input-only T.',
            description: 'Checks in annotation.',
            code: 'interface Sink<??? T> { put(v: T): void }',
            answer: 'in; T is only consumed, so it is contravariant.',
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
            task: 'Fix the return type error.',
            description: 'Checks generic return assignability.',
            code: `function create<T extends { id: string }>(): T {
  return { id: crypto.randomUUID() };
}`,
            answer: 'T may have more fields, so { id } is not a T. Return the base type.',
            solution: `function create(): { id: string } {
  return { id: crypto.randomUUID() };
}`,
          },
          {
            task: 'Predict the problem.',
            description: 'Checks that T can be a subtype.',
            code: `function make<T extends { id: string }>(): T { return { id: '1' } as T; }
const u = make<{ id: string; name: string }>();`,
            answer: 'u.name is typed string but undefined at runtime. The cast hides it.',
          },
          {
            easy: true,
            task: 'Predict whether a cast fixes it.',
            description: 'Checks cast to T.',
            code: `function c<T extends { id: string }>(): T {
  return { id: '1' } as T;
}`,
            answer: 'It compiles, but the cast is unsafe since T may need more fields.',
          },
          {
            easy: true,
            task: 'True or false: callers choose T.',
            description: 'Checks who picks generic.',
            answer: 'True; the caller picks T, so the function cannot build any T itself.',
          },
        ],
      },
      {
        q: 'What is NoInfer<T> and when do you need it?',
        short: 'NoInfer (TS 5.4) blocks a position from being used for inference, so T is inferred only from the other arguments.',
        long: 'Example: `function choose<T extends string>(opts: T[], def: NoInfer<T>)`.\nWithout it, a typo in def widens T and is accepted.\nWith it, def must be one of opts.\nBefore 5.4 people used `T & {}` or a second type parameter trick.\nStrong answer: gives the default-value example.\nWeak answer: does not know it.',
        exercises: [
          {
            task: 'Fix the call so the default is checked against items.',
            description: 'Checks NoInfer.',
            code: `function pick<T>(items: T[], def: T) {}
pick(['a', 'b'], 'c'); // T becomes string`,
            answer: 'NoInfer stops def from widening T (TS 5.4+).',
            solution: 'function pick<T extends string>(items: T[], def: NoInfer<T>) {}',
          },
          {
            task: 'Predict whether this compiles.',
            description: 'Checks NoInfer behavior.',
            code: `declare function f<T extends string>(a: T[], b: NoInfer<T>): void;
f(['x', 'y'], 'z');`,
            answer: 'It fails: T is "x" | "y", and "z" is not one of them.',
          },
          {
            easy: true,
            task: 'Name the TS version adding NoInfer.',
            description: 'Checks NoInfer release.',
            answer: 'TypeScript 5.4 added the NoInfer utility type.',
          },
          {
            easy: true,
            task: 'Predict the type of T.',
            description: 'Checks NoInfer blocks inference.',
            code: `function f<T>(a: T[], d: NoInfer<T>) {}
f(['x'], 'y');`,
            answer: 'string from the array; d is not used to infer T.',
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
            task: 'Write a type test with expect-type style.',
            description: 'Checks compile-time type assertions.',
            code: 'declare function first<T>(a: T[]): T | undefined;',
            answer: 'Assert the inferred type; vitest has expectTypeOf.',
            solution: 'expectTypeOf(first([1])).toEqualTypeOf<number | undefined>();',
          },
          {
            task: 'Write a test that a bad call fails to compile.',
            description: 'Checks @ts-expect-error.',
            code: 'declare function len(x: string): number;',
            answer: '@ts-expect-error fails the build if the line has no error.',
            solution: `// @ts-expect-error numbers are not allowed
len(5);`,
          },
          {
            easy: true,
            task: 'Name a library for type tests.',
            description: 'Checks type test tooling.',
            code: 'expectTypeOf(id(1)).toEqualTypeOf<number>();',
            answer: 'expect-type or tsd; vitest also has expectTypeOf.',
          },
          {
            easy: true,
            task: 'Name the comment for expected errors.',
            description: 'Checks ts-expect-error.',
            code: `// ???
const n: number = 'x';`,
            answer: '@ts-expect-error fails if the next line has no error.',
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
            task: 'Fix the helper to return unknown.',
            description: 'Checks unknown over any.',
            code: 'export function parseJson(t: string) { return JSON.parse(t); }',
            answer: 'unknown forces callers to check the data before use.',
            solution: 'export function parseJson(t: string): unknown { return JSON.parse(t); }',
          },
          {
            task: 'Predict whether this compiles.',
            description: 'Checks unknown requires narrowing.',
            code: `const v: unknown = JSON.parse('{}');
v.name;`,
            answer: 'It fails: you must narrow unknown before reading properties.',
          },
          {
            easy: true,
            task: 'Predict the type JSON.parse returns.',
            description: 'Checks JSON.parse return.',
            code: 'const x = JSON.parse(\'{}\');',
            answer: 'any; JSON.parse returns any, so no checks follow.',
          },
          {
            easy: true,
            task: 'Predict whether this compiles.',
            description: 'Checks unknown blocks access.',
            code: `const u: unknown = JSON.parse('{}');
u.name;`,
            answer: 'No; unknown must be narrowed before reading properties.',
          },
        ],
      },
      {
        q: 'When should a team write its own generic utility types, and when should it use a library?',
        short: 'Use built-ins first, a small trusted library like type-fest next, and write custom types only for domain needs with tests.',
        long: 'Built-ins: Partial, Pick, Omit, Record, ReturnType, Awaited.\ntype-fest covers common needs and is tested.\nCustom types should live in one folder with type tests.\nAvoid copying snippets from the internet without tests.\nStrong answer: has a clear order and ownership.\nWeak answer: every developer writes their own DeepPartial.',
        exercises: [
          {
            task: 'Name a library with common utility types.',
            description: 'Checks utility library awareness.',
            answer: 'type-fest (or ts-essentials). Use it instead of maintaining tricky types yourself.',
          },
          {
            task: 'Spot the problem with this custom type.',
            description: 'Checks reinventing built-in types.',
            code: 'type MyPartial<T> = { [K in keyof T]?: T[K] };',
            answer: 'It copies the built-in Partial. Prefer built-ins; write custom ones only for real needs.',
          },
          {
            easy: true,
            task: 'Name the built-in for readonly objects.',
            description: 'Checks Readonly utility.',
            answer: 'Readonly<T> marks every property readonly.',
          },
          {
            easy: true,
            task: 'Name the built-in that removes null.',
            description: 'Checks NonNullable utility.',
            code: 'type A = ???<string | null>; // string',
            answer: 'NonNullable<T> removes null and undefined.',
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
            task: 'Write a decorator factory that takes a prefix.',
            description: 'Checks factories return decorators.',
            answer: 'A factory is a function that returns the decorator.',
            solution: `function log(prefix: string) {
  return (fn: Function, ctx: ClassMethodDecoratorContext) => {
    console.log(prefix, String(ctx.name));
  };
}`,
          },
          {
            task: 'Spot the bug.',
            description: 'Checks factory call syntax.',
            code: 'class A { @log run() {} } // log(prefix) is a factory',
            answer: 'The factory is not called; it receives the method as prefix. Use @log("x").',
          },
          {
            easy: true,
            task: 'Predict what log(\'x\') returns.',
            description: 'Checks decorator factory shape.',
            code: `function log(p: string) {
  return (fn: any, ctx: any) => fn;
}`,
            answer: 'A decorator function; the factory returns it after taking p.',
          },
          {
            easy: true,
            task: 'Spot the missing call.',
            description: 'Checks factory invocation.',
            code: `@log
class A {}  // log(prefix) is a factory`,
            answer: 'Use @log(\'x\'); a factory must be called to get the decorator.',
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
            task: 'Fix the code so the logging works.',
            description: 'Checks where decorators are allowed.',
            code: `@logged
function save() {}`,
            answer: 'Decorators work only on classes and class members. Wrap the function instead.',
            solution: 'const save = logged(function save() {});',
          },
          {
            task: 'Predict whether this compiles.',
            description: 'Checks decorators on class members.',
            code: 'class A { @logged static save() {} }',
            answer: 'It compiles: static methods can be decorated.',
          },
          {
            easy: true,
            task: 'True or false: decorators work on classes.',
            description: 'Checks decorator targets.',
            code: '@logged class A {}',
            answer: 'True; decorators apply to classes and class members only.',
          },
          {
            easy: true,
            task: 'Name a way to wrap a plain function.',
            description: 'Checks higher-order function.',
            answer: 'Use a higher-order function: const save = logged(rawSave).',
          },
        ],
      },
      {
        q: 'Which tsconfig settings matter for decorators in TypeScript 5?',
        short: 'Standard decorators work with no flag; experimentalDecorators turns on the old style, and emitDecoratorMetadata only works with the old style.',
        long: 'TS 5.0 added TC39 standard decorators, enabled by default.\nexperimentalDecorators: true switches to the legacy implementation used by Angular and NestJS.\nemitDecoratorMetadata adds reflect-metadata type info, legacy only.\nThe two styles have different signatures.\nStrong answer: knows which style the project uses and why.\nWeak answer: turns on all flags.',
        exercises: [
          {
            task: 'Name the tsconfig flags for standard decorators.',
            description: 'Checks decorator config in TS 5.',
            answer: 'None needed: remove experimentalDecorators. Set target ES2022+ or include esnext.decorators lib for metadata.',
          },
          {
            task: 'Spot the problem with this config.',
            description: 'Checks legacy metadata config.',
            code: '{ "experimentalDecorators": false, "emitDecoratorMetadata": true }',
            answer: 'emitDecoratorMetadata works only with experimentalDecorators; here it does nothing.',
          },
          {
            easy: true,
            task: 'True or false: standard decorators need experimentalDecorators.',
            description: 'Checks TS5 decorator flag.',
            code: '{ "compilerOptions": { "target": "ES2022" } }',
            answer: 'False; TS 5 standard decorators work without experimentalDecorators.',
          },
          {
            easy: true,
            task: 'Name the flag for legacy metadata.',
            description: 'Checks emitDecoratorMetadata.',
            answer: 'emitDecoratorMetadata, used with experimentalDecorators, for libraries like Angular.',
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
            task: 'Write a decorator that binds a method.',
            description: 'Checks addInitializer.',
            answer: 'addInitializer runs per instance, so you can bind there.',
            solution: `function bound(_fn: Function, ctx: ClassMethodDecoratorContext) {
  ctx.addInitializer(function (this: any) { this[ctx.name] = this[ctx.name].bind(this); });
}`,
          },
          {
            task: 'Predict when the initializer runs.',
            description: 'Checks addInitializer timing.',
            code: `function d(_: Function, ctx: ClassMethodDecoratorContext) { ctx.addInitializer(() => console.log('init')); }
class A { @d m() {} }
new A(); new A();`,
            answer: 'It logs "init" twice: method initializers run once per instance.',
          },
          {
            easy: true,
            task: 'Predict when addInitializer runs for methods.',
            description: 'Checks initializer timing.',
            answer: 'For instance members, it runs in the constructor before fields are set.',
          },
          {
            easy: true,
            task: 'Name the decorator context property for names.',
            description: 'Checks ctx.name.',
            code: `function d(fn: any, ctx: ClassMethodDecoratorContext) {
  console.log(ctx.???);
}`,
            answer: 'ctx.name gives the decorated member\'s name.',
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
            task: 'Fix the decorator so it keeps this.',
            description: 'Checks function vs arrow in wrappers.',
            code: 'return (...args: any[]) => fn(...args);',
            answer: 'Use a regular function and call fn with this.',
            solution: 'return function (this: unknown, ...args: any[]) { return fn.apply(this, args); };',
          },
          {
            task: 'Predict the output.',
            description: 'Checks this inside an arrow wrapper.',
            code: `const obj = { n: 1, get() { return this.n; } };
const wrap = (f: Function) => (...a: any[]) => f(...a);
console.log(wrap(obj.get)());`,
            answer: 'It throws a TypeError: this is undefined in strict mode, so the call loses obj.',
          },
          {
            easy: true,
            task: 'Name the call that keeps this.',
            description: 'Checks fn.call usage.',
            code: 'const r = fn.???(this, ...args);',
            answer: 'call; fn.call(this, ...args) passes the right this.',
          },
          {
            easy: true,
            task: 'Spot why arrow loses this.',
            description: 'Checks arrow this binding.',
            code: 'return (...args: any[]) => fn(...args);',
            answer: 'fn is called with no receiver, so this is undefined inside.',
          },
        ],
      },
      {
        q: 'What can a field decorator return in standard decorators?',
        short: 'An initializer function that receives the initial value and returns the value to use.',
        long: 'Field decorators get undefined as the first argument and a context.\nThey can return `(initial) => newValue` to change the starting value.\nThey cannot intercept later reads and writes; use accessor for that.\nPitfall: expecting a property descriptor.\nStrong answer: knows the accessor alternative.\nWeak answer: uses Object.defineProperty in the decorator.',
        exercises: [
          {
            task: 'Write a field decorator that trims the initial value.',
            description: 'Checks field initializer return.',
            answer: 'Return a function that receives and returns the initial value.',
            solution: `function trim(_: undefined, _c: ClassFieldDecoratorContext) {
  return (v: string) => v.trim();
}`,
          },
          {
            task: 'Predict the value of a.name.',
            description: 'Checks field decorator initializer.',
            code: `const up = (_: undefined, _c: ClassFieldDecoratorContext) => (v: string) => v.toUpperCase();
class A { @up name = 'bo'; }
console.log(new A().name);`,
            answer: 'It logs "BO": the initializer changes the starting value.',
          },
          {
            easy: true,
            task: 'Predict what a field decorator returns.',
            description: 'Checks field decorator return.',
            answer: 'A function that gets the initial value and returns the new value.',
          },
          {
            easy: true,
            task: 'Predict the value of a.n.',
            description: 'Checks initializer return.',
            code: `const dbl = (_: undefined, c: any) => (v: number) => v * 2;
class A { @dbl n = 3 }
const a = new A();`,
            answer: '6; the initializer doubles the start value 3.',
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
            task: 'Write a decorator that stores metadata.',
            description: 'Checks context.metadata.',
            answer: 'Write to context.metadata; it is attached to the class.',
            solution: `function route(path: string) {
  return (_: Function, ctx: ClassMethodDecoratorContext) => { ctx.metadata.path = path; };
}`,
          },
          {
            task: 'Read the metadata from the class.',
            description: 'Checks Symbol.metadata.',
            code: 'class C { @route(\'/x\') m() {} }',
            answer: 'Metadata lives under Symbol.metadata (needs a polyfill in some runtimes).',
            solution: 'console.log(C[Symbol.metadata]?.path); // \'/x\'',
          },
          {
            easy: true,
            task: 'Name the symbol used for metadata.',
            description: 'Checks Symbol.metadata.',
            answer: 'Symbol.metadata stores the metadata object on the class.',
          },
          {
            easy: true,
            task: 'Name the context property for metadata.',
            description: 'Checks ctx.metadata.',
            code: `function tag(_: any, ctx: ClassFieldDecoratorContext) {
  ctx.???.tagged = true;
}`,
            answer: 'ctx.metadata is a shared object for all decorators on the class.',
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
            task: 'Fix the class decorator so the type is kept.',
            description: 'Checks generic class decorators.',
            code: 'function withId(cls: any, ctx: ClassDecoratorContext) { return class extends cls {}; }',
            answer: 'Use a generic constructor type.',
            solution: `function withId<C extends new (...a: any[]) => {}>(cls: C, _: ClassDecoratorContext) {
  return class extends cls { id = crypto.randomUUID(); };
}`,
          },
          {
            task: 'Predict whether new User().id type-checks.',
            description: 'Checks decorators do not change types.',
            code: `@withId class User { name = ''; }
new User().id;`,
            answer: 'It errors: class decorators cannot change the declared type. Use a mixin function instead.',
          },
          {
            easy: true,
            task: 'True or false: class decorators change the type.',
            description: 'Checks decorator typing limit.',
            answer: 'False; TS keeps the original class type even if the class is replaced.',
          },
          {
            easy: true,
            task: 'Name a typed alternative to class decorators.',
            description: 'Checks mixin function.',
            answer: 'A mixin function, like const User = WithId(BaseUser), keeps types.',
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
            task: 'Write a decorator for an accessor that logs sets.',
            description: 'Checks ClassAccessorDecoratorContext.',
            answer: 'Return new get and set wrapping the target.',
            solution: `function logSet<T>(t: ClassAccessorDecoratorTarget<any, T>, ctx: ClassAccessorDecoratorContext) {
  return { set(this: any, v: T) { console.log(String(ctx.name), v); t.set.call(this, v); } };
}`,
          },
          {
            task: 'Spot the error.',
            description: 'Checks accessor decorators need accessor keyword.',
            code: 'class A { @logSet count = 0; }',
            answer: 'Without accessor it is a plain field, so the accessor decorator type does not match. Use accessor count = 0.',
          },
          {
            easy: true,
            task: 'Name what an accessor decorator returns.',
            description: 'Checks accessor decorator return.',
            answer: 'An object with optional get, set, and init functions.',
          },
          {
            easy: true,
            task: 'Name the context type for accessors.',
            description: 'Checks accessor context type.',
            answer: 'ClassAccessorDecoratorContext is the context for auto-accessor decorators.',
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
            task: 'Write a test for a log decorator.',
            description: 'Checks testing decorators through classes.',
            answer: 'Decorate a small test class and spy on the side effect.',
            solution: `const spy = vi.spyOn(console, 'log');
class T { @log add(a: number) { return a + 1; } }
expect(new T().add(1)).toBe(2);
expect(spy).toHaveBeenCalled();`,
          },
          {
            task: 'Name a way to test decorated logic without the decorator.',
            description: 'Checks separating logic for tests.',
            answer: 'Put the logic in a plain function the decorator calls, and test that function directly.',
          },
          {
            easy: true,
            task: 'Name the mock helper for console.',
            description: 'Checks spyOn usage.',
            code: 'const spy = vi.???(console, \'log\');',
            answer: 'spyOn; vi.spyOn lets you check calls to console.log.',
          },
          {
            easy: true,
            task: 'True or false: decorated methods test via instances.',
            description: 'Checks testing through class.',
            answer: 'True; create an instance and call the method to test the decorator.',
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
            task: 'Spot the problem.',
            description: 'Checks hidden side effects in getters.',
            code: 'class Profile { @remote(\'/api/me\') get data(): User { return undefined!; } }',
            answer: 'A getter looks cheap but does a network call, and cannot be awaited. Use an explicit async method.',
          },
          {
            task: 'Fix the getter with an async method.',
            description: 'Checks explicit async APIs.',
            code: 'get data(): User',
            answer: 'Make the call explicit and typed as a Promise.',
            solution: `async loadData(): Promise<User> {
  return (await fetch('/api/me')).json();
}`,
          },
          {
            easy: true,
            task: 'True or false: getters should stay cheap.',
            description: 'Checks getter expectations.',
            code: 'get total() { return this.a + this.b }',
            answer: 'True; callers expect a getter to be fast and free of side effects.',
          },
          {
            easy: true,
            task: 'Name the return type for async loads.',
            description: 'Checks Promise return.',
            code: 'async loadData(): ??? {}',
            answer: 'Promise<User>; async work should return a Promise.',
          },
        ],
      },
      {
        q: 'Do decorators affect bundle size and tree shaking?',
        short: 'Yes: decorated classes compile to helper calls with side effects, so bundlers often cannot remove unused classes.',
        long: 'Standard decorators emit __esDecorate and __runInitializers helpers.\nThe class definition becomes an expression with side effects.\nBundlers then keep the class even if it is unused, unless marked pure.\nUse importHelpers with tslib to avoid duplicated helpers.\nStrong answer: checks bundle output and uses sideEffects config.\nWeak answer: says types are erased so nothing changes.',
        exercises: [
          {
            task: 'Spot why this class is not tree-shaken.',
            description: 'Checks side effects in decorators.',
            code: '@register class Widget {}',
            answer: 'The decorator runs at module load and may register globally, so bundlers keep it.',
          },
          {
            task: 'Name one way to reduce decorator bundle cost.',
            description: 'Checks decorator output size.',
            answer: 'Use native decorators with a modern target so no helper code is emitted.',
          },
          {
            easy: true,
            task: 'True or false: decorators add runtime code.',
            description: 'Checks decorator runtime cost.',
            code: '@log class A {}',
            answer: 'True; decorators run at class definition and add helper code.',
          },
          {
            easy: true,
            task: 'Name what stops tree shaking here.',
            description: 'Checks side effects at load.',
            code: '@register class Widget {}',
            answer: 'register runs at load, a side effect, so the class is kept.',
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
            task: 'Fix the code with an in check.',
            description: 'Checks in operator narrowing.',
            code: `type Cat = { meow(): void }; type Dog = { bark(): void };
function speak(a: Cat | Dog) { a.meow(); }`,
            answer: 'Use in to narrow to Cat.',
            solution: `function speak(a: Cat | Dog) {
  if ('meow' in a) a.meow(); else a.bark();
}`,
          },
          {
            task: 'Name three ways to narrow a union.',
            description: 'Checks narrowing techniques.',
            answer: 'typeof, instanceof, in, equality checks on a tag, and user type predicates.',
          },
          {
            easy: true,
            task: 'Name the narrowing check used here.',
            description: 'Checks typeof narrowing.',
            code: `function f(x: string | number) {
  if (typeof x === 'string') x.toUpperCase();
}`,
            answer: 'typeof narrows x to string in the if block.',
          },
          {
            easy: true,
            task: 'Predict the type of x in else.',
            description: 'Checks else narrowing.',
            code: `function f(x: string | number) {
  if (typeof x === 'string') {} else { x }
}`,
            answer: 'number; the string case was removed by the check.',
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
            task: 'Fix the function with Array.isArray.',
            description: 'Checks array narrowing.',
            code: 'function print(x: string | string[]) { return x.join(\', \'); }',
            answer: 'Narrow arrays with Array.isArray.',
            solution: `function print(x: string | string[]) {
  return Array.isArray(x) ? x.join(', ') : x;
}`,
          },
          {
            task: 'Predict the type of x in the else branch.',
            description: 'Checks narrowing in else.',
            code: `function f(x: string | number) {
  if (typeof x === 'string') return;
  x;
}`,
            answer: 'x is number: the string case returned early.',
          },
          {
            easy: true,
            task: 'Predict whether this call compiles.',
            description: 'Checks shared union method.',
            code: 'function f(x: string | string[]) { return x.length }',
            answer: 'Yes; both string and string[] have length.',
          },
          {
            easy: true,
            task: 'Predict the type in the if.',
            description: 'Checks Array.isArray narrowing.',
            code: `function f(x: string | string[]) {
  if (Array.isArray(x)) x;
}`,
            answer: 'string[]; Array.isArray narrows to the array member.',
          },
        ],
      },
      {
        q: 'What is a literal union type? Give an example.',
        short: 'A union of exact values, like `type Size = "sm" | "md" | "lg"`, so only those values are allowed.',
        long: 'Literal types are single values: "sm", 42, true.\nA union of them works like a light enum.\nTS gives autocompletion and catches typos.\nPitfall: let variables widen to string; use const or annotate.\nStrong answer: knows widening and as const.\nWeak answer: uses string.',
        exercises: [
          {
            task: 'Write a type for button sizes.',
            description: 'Checks literal union types.',
            answer: 'List allowed strings as a union.',
            solution: `type Size = 'sm' | 'md' | 'lg';
const s: Size = 'md';`,
          },
          {
            task: 'Predict the type of a and b.',
            description: 'Checks literal widening.',
            code: `const a = 'sm';
let b = 'sm';`,
            answer: 'a is "sm"; b is string because let can change.',
          },
          {
            easy: true,
            task: 'Predict whether this compiles.',
            description: 'Checks literal union check.',
            code: `type Dir = 'up' | 'down';
const d: Dir = 'left';`,
            answer: 'No; \'left\' is not one of the allowed literals.',
          },
          {
            easy: true,
            task: 'Write a type for three log levels.',
            description: 'Checks literal union definition.',
            answer: 'type Level = \'info\' | \'warn\' | \'error\';',
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
            task: 'Write an exhaustive check helper.',
            description: 'Checks never for exhaustiveness.',
            answer: 'A function that accepts never errors if a case is missed.',
            solution: `function assertNever(x: never): never {
  throw new Error('Unexpected: ' + x);
}`,
          },
          {
            task: 'Predict whether this compiles.',
            description: 'Checks missed cases.',
            code: `type S = 'a' | 'b';
function f(s: S) { if (s === 'a') return; assertNever(s); }`,
            answer: 'It fails: s is "b", not never.',
          },
          {
            easy: true,
            task: 'Predict the type of x in default.',
            description: 'Checks never in default.',
            code: `function f(x: 'a' | 'b') {
  switch (x) { case 'a': case 'b': return;
  default: x; }
}`,
            answer: 'never; every case is handled, so nothing is left.',
          },
          {
            easy: true,
            task: 'Predict whether this assignment compiles.',
            description: 'Checks assigning to never.',
            code: 'const n: never = \'x\';',
            answer: 'No; nothing can be assigned to never.',
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
            task: 'Fix the type so id accepts both.',
            description: 'Checks unions vs intersections.',
            code: `type A = { id: string }; type B = { id: number };
const x: A & B = { id: '1' };`,
            answer: 'id is never in the intersection. Use a union if either is fine.',
            solution: 'const x: A | B = { id: \'1\' };',
          },
          {
            task: 'Predict the type of id.',
            description: 'Checks compatible intersections.',
            code: 'type T = { id: string | number } & { id: number };',
            answer: 'id is number: the overlap of the two types.',
          },
          {
            easy: true,
            task: 'Predict the type of A & B.',
            description: 'Checks compatible intersection.',
            code: `type A = { a: string };
type B = { b: number };
type AB = A & B;`,
            answer: '{ a: string; b: number }; it has both properties.',
          },
          {
            easy: true,
            task: 'Predict the type of string & number.',
            description: 'Checks primitive intersection.',
            code: 'type X = string & number;',
            answer: 'never; no value is both a string and a number.',
          },
        ],
      },
      {
        q: 'What is the difference between a type predicate and an assertion function?',
        short: 'A type predicate `x is T` returns boolean and narrows in an if; an assertion function `asserts x is T` throws and narrows the code after the call.',
        long: 'Predicate: `function isUser(x: unknown): x is User`.\nAssertion: `function assertUser(x: unknown): asserts x is User`.\nBoth are trusted by TS without checking the body is correct.\nAssertion functions need an explicit type annotation at the call site when assigned to a variable.\nTS 5.5 infers predicates from simple filters like `x => x !== null`.\nStrong answer: mentions TS 5.5 inferred predicates.\nWeak answer: knows only casts.',
        exercises: [
          {
            task: 'Write an assertion function for non-null.',
            description: 'Checks asserts return types.',
            answer: 'asserts narrows after the call or throws.',
            solution: `function assertDefined<T>(v: T): asserts v is NonNullable<T> {
  if (v == null) throw new Error('Missing');
}`,
          },
          {
            task: 'Predict the type after the call.',
            description: 'Checks type predicate vs assertion.',
            code: `declare function isStr(x: unknown): x is string;
declare const v: unknown;
isStr(v);
v;`,
            answer: 'v is still unknown: a predicate narrows only inside an if.',
          },
          {
            easy: true,
            task: 'Write a type predicate for strings.',
            description: 'Checks type predicate syntax.',
            answer: 'function isStr(x: unknown): x is string { return typeof x === \'string\' }',
          },
          {
            easy: true,
            task: 'Name the keyword in assertion signatures.',
            description: 'Checks asserts keyword.',
            code: 'function check(x: unknown): ??? x is string {}',
            answer: 'asserts; the function throws unless x is a string.',
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
            task: 'Predict the type of R.',
            description: 'Checks distributive conditional types.',
            code: `type ToArr<T> = T extends any ? T[] : never;
type R = ToArr<string | number>;`,
            answer: 'R is string[] | number[]: it distributes over the union.',
          },
          {
            task: 'Fix the type so it does not distribute.',
            description: 'Checks wrapping in a tuple.',
            code: 'type ToArr<T> = T extends any ? T[] : never;',
            answer: 'Wrap both sides in a tuple.',
            solution: 'type ToArr<T> = [T] extends [any] ? T[] : never; // (string | number)[]',
          },
          {
            easy: true,
            task: 'Predict the type of R.',
            description: 'Checks simple distribution.',
            code: `type ToArr<T> = T extends any ? T[] : never;
type R = ToArr<string | number>;`,
            answer: 'string[] | number[]; the condition runs per union member.',
          },
          {
            easy: true,
            task: 'Predict the type of R.',
            description: 'Checks wrapped no distribution.',
            code: `type ToArr<T> = [T] extends [any] ? T[] : never;
type R = ToArr<string | number>;`,
            answer: '(string | number)[]; brackets stop distribution.',
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
            task: 'Predict whether this compiles in TS 5.x.',
            description: 'Checks destructured discriminant narrowing.',
            code: `function f(r: { ok: true; data: string } | { ok: false; e: Error }) {
  const { ok } = r;
  if (ok) return r.data;
}`,
            answer: 'It compiles since TS 4.6+ for const destructuring; narrowing fails if ok is let or reassigned.',
          },
          {
            task: 'Fix the code so data is narrowed.',
            description: 'Checks destructuring the whole union.',
            code: `let { ok } = r;
if (ok) r.data;`,
            answer: 'Check r.ok directly or use const.',
            solution: 'if (r.ok) return r.data.toUpperCase();',
          },
          {
            easy: true,
            task: 'Predict whether r.data compiles here.',
            description: 'Checks direct narrowing.',
            code: `type R = { ok: true; data: string } | { ok: false };
function f(r: R) { if (r.ok) r.data; }`,
            answer: 'Yes; checking r.ok narrows r to the ok member.',
          },
          {
            easy: true,
            task: 'Name the property that tags the union.',
            description: 'Checks discriminant property.',
            code: 'type R = { ok: true; data: string } | { ok: false; error: Error };',
            answer: 'ok is the discriminant; its literal value picks the member.',
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
            task: 'Predict the type of the parameter.',
            description: 'Checks calling a union of functions.',
            code: `declare const f: ((x: string) => void) | ((x: number) => void);
f('a');`,
            answer: 'It fails: the parameter is string & number, which is never.',
          },
          {
            task: 'Fix the call by narrowing first.',
            description: 'Checks narrowing function unions.',
            code: 'type H = { kind: \'s\'; fn: (x: string) => void } | { kind: \'n\'; fn: (x: number) => void };',
            answer: 'Narrow on the tag, then call with the right type.',
            solution: `function run(h: H) {
  if (h.kind === 's') h.fn('a'); else h.fn(1);
}`,
          },
          {
            easy: true,
            task: 'Predict the parameter type of f.',
            description: 'Checks union of functions.',
            code: `declare const f: ((x: string) => void) | ((x: number) => void);
f(???);`,
            answer: 'never; the arg must fit both, string & number.',
          },
          {
            easy: true,
            task: 'Name the fix for calling the union.',
            description: 'Checks narrowing before call.',
            answer: 'Narrow to one function first, for example with a tag check.',
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
            task: 'Write a typed flag check.',
            description: 'Checks literal unions for flags.',
            answer: 'Flags as a union; removing one breaks all uses.',
            solution: `type Flag = 'newCheckout' | 'darkMode';
function isOn(f: Flag): boolean { return flags.has(f); }`,
          },
          {
            task: 'Predict what happens when darkMode is removed from Flag.',
            description: 'Checks compile-time flag cleanup.',
            code: 'isOn(\'darkMode\');',
            answer: 'Every isOn("darkMode") call becomes a compile error, so you find all usages.',
          },
          {
            easy: true,
            task: 'Write a union for two flags.',
            description: 'Checks flag literal union.',
            code: 'const f: Flag = \'darkMode\';',
            answer: 'type Flag = \'darkMode\' | \'newNav\';',
          },
          {
            easy: true,
            task: 'Predict whether this call compiles.',
            description: 'Checks unknown flag name.',
            code: `type Flag = 'darkMode';
declare function on(f: Flag): boolean;
on('newNav');`,
            answer: 'No; \'newNav\' is not in the Flag union.',
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
            task: 'Fix the catch to handle non-Error values.',
            description: 'Checks unknown in catch.',
            code: 'catch (e) { showToast(e.message); }',
            answer: 'e is unknown; narrow it first.',
            solution: `catch (e) {
  showToast(e instanceof Error ? e.message : String(e));
}`,
          },
          {
            task: 'Predict the output.',
            description: 'Checks throwing non-Error values.',
            code: 'try { throw \'oops\'; } catch (e) { console.log((e as Error).message); }',
            answer: 'It logs undefined: a string has no message. Hence catch is unknown.',
          },
          {
            easy: true,
            task: 'Predict the type of e in catch.',
            description: 'Checks catch variable type.',
            code: 'try { } catch (e) { e }',
            answer: 'unknown with useUnknownInCatchVariables, which strict turns on.',
          },
          {
            easy: true,
            task: 'Name the check that narrows to Error.',
            description: 'Checks instanceof Error.',
            code: 'if (e ??? Error) showToast(e.message);',
            answer: 'instanceof; e instanceof Error narrows e to Error.',
          },
        ],
      },
      {
        q: 'Large unions slow down your build. How do you investigate and fix it?',
        short: 'Measure with tsc traces, then reduce union size, avoid huge template literal unions, and split types.',
        long: 'Unions over about 100,000 members fail with "Expression produces a union type that is too complex".\nTemplate literal types can multiply unions quickly.\nComparing big unions is costly.\nUse --generateTrace to find hot spots.\nReplace generated unions with string plus runtime checks where precision is not needed.\nStrong answer: measures first and trades precision for speed on purpose.\nWeak answer: buys a faster laptop.',
        exercises: [
          {
            task: 'Spot why this union is slow.',
            description: 'Checks huge template literal unions.',
            code: `type Size = 1 | 2 | ... | 100;
type Grid = \`\${Size}x\${Size}\`;`,
            answer: 'It creates 10,000 members; checks against it are slow. Use a string or a branded type.',
          },
          {
            task: 'Name the flag to find slow types.',
            description: 'Checks generateTrace.',
            answer: 'tsc --generateTrace, then analyze it with @typescript/analyze-trace.',
          },
          {
            easy: true,
            task: 'Name the flag that writes a trace.',
            description: 'Checks generateTrace flag.',
            code: 'tsc --generateTrace ./trace',
            answer: '--generateTrace writes trace files you can open in Perfetto.',
          },
          {
            easy: true,
            task: 'True or false: big unions cost check time.',
            description: 'Checks union size cost.',
            answer: 'True; comparing large unions can be quadratic and slow down checks.',
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
            task: 'Predict the values.',
            description: 'Checks numeric enum defaults.',
            code: `enum E { A, B, C }
console.log(E.A, E.C);`,
            answer: '0 2: members start at 0 and increase by 1.',
          },
          {
            task: 'Predict the value of B.',
            description: 'Checks auto-increment after a set value.',
            code: 'enum E { A = 10, B }',
            answer: 'B is 11.',
          },
          {
            easy: true,
            task: 'Predict the value of Color.Blue.',
            description: 'Checks numeric enum default.',
            code: 'enum Color { Red, Green, Blue }',
            answer: '2; numeric enums start at 0 and count up.',
          },
          {
            easy: true,
            task: 'Predict the value of B.',
            description: 'Checks enum after init.',
            code: 'enum E { A = 5, B }',
            answer: '6; B follows A and adds one.',
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
            task: 'Fix the assignment.',
            description: 'Checks string enums are nominal.',
            code: `enum Status { Active = 'active' }
const s: Status = 'active';`,
            answer: 'Use the member.',
            solution: 'const s: Status = Status.Active;',
          },
          {
            task: 'Predict whether this compiles.',
            description: 'Checks comparing enums to strings.',
            code: `enum S { On = 'on' }
declare const s: S;
if (s === 'on') {}`,
            answer: 'It compiles: comparing is allowed, only assigning a raw string is not.',
          },
          {
            easy: true,
            task: 'Predict whether this compiles.',
            description: 'Checks enum member assignment.',
            code: `enum Status { Active = 'active' }
const s: Status = Status.Active;`,
            answer: 'Yes; using the enum member is the correct way.',
          },
          {
            easy: true,
            task: 'Predict the runtime value of Status.Off.',
            description: 'Checks string enum value.',
            code: `enum Status { Off = 'off' }
console.log(Status.Off);`,
            answer: '\'off\'; a string enum member holds its string value.',
          },
        ],
      },
      {
        q: 'How do you get the name of a numeric enum member from its value?',
        short: 'Numeric enums have a reverse mapping, so `Dir[0]` returns "Up"; string enums do not have it.',
        long: 'TS emits both Dir.Up = 0 and Dir[0] = "Up" for numeric members.\nThis is useful for logs and debugging.\nString enum members have no reverse mapping.\nPitfall: Object.keys on a numeric enum returns numbers and names together.\nStrong answer: knows the reverse mapping and the Object.keys pitfall.\nWeak answer: expects reverse mapping for strings too.',
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks reverse mapping.',
            code: `enum Lvl { Low, High }
console.log(Lvl[1]);`,
            answer: 'It logs "High".',
          },
          {
            task: 'Predict the output.',
            description: 'Checks no reverse mapping on string enums.',
            code: `enum C { Red = 'r' }
console.log((C as any)['r']);`,
            answer: 'It logs undefined: string enums have no reverse mapping.',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks reverse mapping.',
            code: `enum E { A, B }
console.log(E[0]);`,
            answer: '\'A\'; numeric enums map values back to names.',
          },
          {
            easy: true,
            task: 'True or false: string enums have reverse maps.',
            description: 'Checks string enum reverse mapping.',
            answer: 'False; only numeric enums get reverse mappings.',
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
            task: 'Write a map that needs every enum member.',
            description: 'Checks Record with enum keys.',
            code: 'enum Plan { Free = \'free\', Pro = \'pro\' }',
            answer: 'Record over the enum requires all keys.',
            solution: 'const price: Record<Plan, number> = { [Plan.Free]: 0, [Plan.Pro]: 10 };',
          },
          {
            task: 'Predict whether this compiles.',
            description: 'Checks missing keys in Record.',
            code: 'const p: Record<\'a\' | \'b\', number> = { a: 1 };',
            answer: 'It fails: property b is missing.',
          },
          {
            easy: true,
            task: 'Write a Record keyed by an enum.',
            description: 'Checks Record with enum.',
            code: 'enum Lang { En = \'en\', Fr = \'fr\' }',
            answer: 'const names: Record<Lang, string> = { en: \'English\', fr: \'French\' };',
          },
          {
            easy: true,
            task: 'Predict whether this compiles.',
            description: 'Checks missing Record key.',
            code: `enum L { En = 'en', Fr = 'fr' }
const m: Record<L, string> = { en: 'x' };`,
            answer: 'No; Record<L, string> needs the fr key too.',
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
            task: 'Fix the flag check.',
            description: 'Checks bitwise AND for flags.',
            code: `const p = Perm.Read | Perm.Write;
if (p === Perm.Write) {}`,
            answer: 'Use & to test one bit.',
            solution: 'if (p & Perm.Write) console.log(\'can write\');',
          },
          {
            task: 'Predict the value of p.',
            description: 'Checks bitwise OR of flags.',
            code: `enum Perm { Read = 1, Write = 2, Exec = 4 }
const p = Perm.Read | Perm.Exec;`,
            answer: 'p is 5.',
          },
          {
            easy: true,
            task: 'Predict the value of p.',
            description: 'Checks bitwise OR.',
            code: `enum Perm { Read = 1, Write = 2 }
const p = Perm.Read | Perm.Write;`,
            answer: '3; 1 | 2 sets both bits.',
          },
          {
            easy: true,
            task: 'Name the operator to test one flag.',
            description: 'Checks bitwise AND.',
            code: 'if ((p ??? Perm.Write) !== 0) {}',
            answer: '&; p & Perm.Write is nonzero when the bit is set.',
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
            task: 'Predict whether this compiles.',
            description: 'Checks computed members in string enums.',
            code: 'enum E { A = \'a\'.length, B }',
            answer: 'It fails: B needs an initializer after a computed member.',
          },
          {
            task: 'Predict the value of C.',
            description: 'Checks constant enum expressions.',
            code: 'enum E { A = 1 << 1, B = A * 2, C = B + 1 }',
            answer: 'C is 5: these are constant expressions computed at compile time.',
          },
          {
            easy: true,
            task: 'Predict the value of C.',
            description: 'Checks constant expression member.',
            code: 'enum E { A = 1 << 1, B = A * 2, C }',
            answer: '5; A is 2, B is 4, so C is 5.',
          },
          {
            easy: true,
            task: 'True or false: \'abc\'.length is constant.',
            description: 'Checks computed member.',
            answer: 'False; it is computed at runtime, so the next member needs an initializer.',
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
            task: 'Predict whether this compiles with erasableSyntaxOnly.',
            description: 'Checks erasable syntax.',
            code: 'enum Color { Red }',
            answer: 'It fails: enums emit runtime code, so Node type stripping cannot erase them.',
          },
          {
            task: 'Rewrite the enum so it is erasable.',
            description: 'Checks as const objects.',
            code: 'enum Color { Red = \'red\', Blue = \'blue\' }',
            answer: 'Use an as const object with a derived type.',
            solution: `const Color = { Red: 'red', Blue: 'blue' } as const;
type Color = (typeof Color)[keyof typeof Color];`,
          },
          {
            easy: true,
            task: 'True or false: enums emit JavaScript code.',
            description: 'Checks enum runtime output.',
            code: 'enum E { A }',
            answer: 'True; enums create a runtime object, so types cannot be just erased.',
          },
          {
            easy: true,
            task: 'Write an erasable replacement for this enum.',
            description: 'Checks as const object.',
            code: 'enum Dir { Up = \'up\', Down = \'down\' }',
            answer: 'const Dir = { Up: \'up\', Down: \'down\' } as const;',
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
            task: 'Fix the code to get only names.',
            description: 'Checks filtering reverse keys.',
            code: `enum Size { S, M, L }
const options = Object.keys(Size);`,
            answer: 'Filter out numeric keys.',
            solution: 'const options = Object.keys(Size).filter(k => isNaN(Number(k)));',
          },
          {
            task: 'Predict the output.',
            description: 'Checks Object.values on numeric enums.',
            code: `enum S { A, B }
console.log(Object.values(S));`,
            answer: 'It logs ["A", "B", 0, 1].',
          },
          {
            easy: true,
            task: 'Predict the output.',
            description: 'Checks Object.values on string enum.',
            code: `enum S { A = 'a', B = 'b' }
console.log(Object.values(S));`,
            answer: '[\'a\', \'b\']; string enums have no reverse keys.',
          },
          {
            easy: true,
            task: 'Name the filter that keeps names only.',
            description: 'Checks isNaN filter.',
            code: 'Object.keys(Size).filter(k => ???);',
            answer: 'isNaN(Number(k)) keeps names and drops the numeric keys.',
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
            task: 'Predict whether this compiles.',
            description: 'Checks enum to enum assignment.',
            code: `enum A { X } enum B { X }
const a: A = B.X;`,
            answer: 'It fails: different enums are not compatible, even with the same value.',
          },
          {
            task: 'Predict whether this compiles.',
            description: 'Checks number to enum assignment.',
            code: `enum A { X, Y }
const n: number = A.Y;
const a: A = 1;`,
            answer: 'Both compile: numeric enums are assignable to number, and 1 is a valid member value.',
          },
          {
            easy: true,
            task: 'Predict whether this compiles.',
            description: 'Checks enums from different types.',
            code: `enum A { X } enum B { X }
const a: A = B.X;`,
            answer: 'No; different enums are not compatible even with the same value.',
          },
          {
            easy: true,
            task: 'Predict whether this compiles in TS 5.',
            description: 'Checks numeric literal to enum.',
            code: `enum E { A, B }
const e: E = 7;`,
            answer: 'No; since TS 5.0, unknown numeric literals are errors.',
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
            task: 'Name a lint rule that bans enums.',
            description: 'Checks enforcing enum rules.',
            answer: 'no-restricted-syntax with selector TSEnumDeclaration, or turn on erasableSyntaxOnly in tsconfig.',
          },
          {
            task: 'Respond to this proposal.',
            description: 'Checks defending a team rule.',
            code: '"Let\'s use enums everywhere for constants."',
            answer: 'Prefer unions or as const objects: no runtime cost, work with type stripping. Allow enums only in old code.',
          },
          {
            easy: true,
            task: 'Name a common enum alternative.',
            description: 'Checks union alternative.',
            code: 'enum Size { S = \'s\', M = \'m\', L = \'l\' }',
            answer: 'A string literal union, like type Size = \'s\' | \'m\' | \'l\'.',
          },
          {
            easy: true,
            task: 'True or false: const enum suits libraries.',
            description: 'Checks const enum risks.',
            answer: 'False; const enums break with isolatedModules and across package boundaries.',
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
            task: 'Fix the duplicate enums.',
            description: 'Checks one source of truth.',
            code: `// orders: enum Status { Open = 'open' }
// ui:     enum Status { Open = 'OPEN' }`,
            answer: 'Define the values once in a shared package and import them.',
            solution: `// @acme/domain
export const Status = { Open: 'open', Done: 'done' } as const;
export type Status = (typeof Status)[keyof typeof Status];`,
          },
          {
            task: 'Spot the runtime bug.',
            description: 'Checks mismatched enum values.',
            code: 'if (order.status === UiStatus.Open) show();',
            answer: 'Backend sends "open" but UI checks "OPEN", so show never runs.',
          },
          {
            easy: true,
            task: 'Predict whether these values match.',
            description: 'Checks duplicate enum values.',
            code: `// orders: Open = 'open'
// ui: Open = 'OPEN'`,
            answer: 'No; \'open\' and \'OPEN\' differ, so comparisons fail.',
          },
          {
            easy: true,
            task: 'Name the fix for duplicate definitions.',
            description: 'Checks single source of truth.',
            answer: 'Move Status into one shared package and import it everywhere.',
          },
        ],
      },
      {
        q: 'How do you share enum-like values between a C# backend and a TypeScript frontend?',
        short: 'Generate them from one source such as OpenAPI, as string literal unions, and serialize enums as strings.',
        long: 'Numeric enums over JSON break when the order changes.\nConfigure the backend to serialize enums as strings.\nGenerate TS unions or as const objects from the OpenAPI spec.\nAdd unknown handling for forward compatibility.\nStrong answer: covers serialization, codegen, and evolution.\nWeak answer: copies values by hand.',
        exercises: [
          {
            task: 'Name two ways to share C# enums with TypeScript.',
            description: 'Checks cross-language codegen.',
            answer: 'Generate TS from the OpenAPI spec (NSwag, openapi-typescript), or serialize enums as strings and generate unions.',
          },
          {
            task: 'Spot the problem.',
            description: 'Checks numeric enum serialization.',
            code: '// C#: enum Status { Open, Done }  -> JSON: { "status": 0 }',
            answer: 'Numbers break when C# reorders members. Serialize as strings with JsonStringEnumConverter.',
          },
          {
            easy: true,
            task: 'Name a tool that generates TS from OpenAPI.',
            description: 'Checks code generation.',
            answer: 'openapi-typescript or NSwag generates TS types from the API spec.',
          },
          {
            easy: true,
            task: 'Predict the default JSON for a C# enum.',
            description: 'Checks enum serialization.',
            code: `enum Status { Open, Done }  // C#
// serialized Status.Done`,
            answer: '1; C# serializes enums as numbers unless a string converter is set.',
          },
        ],
      },
    ],
  },
  },
};
