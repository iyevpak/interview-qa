// TypeScript
export default {
  'Interfaces and type aliases': {
    junior: [
      {
        q: 'When do you use interface vs type?',
        short: 'Interfaces describe object shapes and support extends and declaration merging; type aliases can name any type (unions, primitives, tuples, mapped and conditional types).',
        long: 'Both can describe object shapes and are mostly interchangeable for that purpose.\nInterfaces: extends, implements, declaration merging (useful for augmenting libraries/globals), and slightly better error messages and caching in the checker.\nType aliases: unions, intersections, primitives, tuples, mapped/conditional/template literal types; they cannot be reopened.\nPitfall: thinking one is "faster" or "more correct" at runtime: both are erased completely.\nStrong candidate: "interface for public object contracts and extension, type for compositions and unions; consistency matters more than the choice."\nWeak candidate: "they are the same" or "type is newer so it is better" with no mention of merging or unions.',
        exercises: [
          {
            task: 'Rewrite this type alias as an interface that extends a base Entity interface.',
            description: 'Checks that the candidate can move between the two syntaxes and knows extends. Give the snippet and ask for a live rewrite.',
            code: 'type User = { id: string; name: string };',
            answer: 'Interfaces compose with extends; the shared id moves into a reusable Entity contract. A common wrong answer is using an intersection inside an interface body. A strong answer also mentions that the type alias version could use & to get the same result.',
            solution: `interface Entity { id: string }
interface User extends Entity { name: string }`,
          },
          {
            task: 'Predict whether this compiles and explain why.',
            description: 'Checks the core limitation of interfaces. Show the line and ask "does this compile?" before discussing.',
            code: 'interface Status = \'on\' | \'off\';',
            answer: 'It does not compile: an interface can only describe an object shape. Unions require a type alias. Weak candidates say it compiles because "interface and type are the same". Strong ones immediately say interfaces describe object shapes only and add that type aliases cannot be merged in return.',
            solution: 'type Status = \'on\' | \'off\';',
          },
        ],
      },
      {
        q: 'Fix the type error: the object is missing a property and has a wrong type.',
        code: `interface Product { id: number; title: string; price?: number }
const p: Product = { id: '1', price: 10 };`,
        short: 'id must be a number and the required title is missing; optional properties (price?) may be omitted, required ones may not.',
        long: 'Checks reading an interface and its error messages.\nRequired vs optional (?) properties; literal types must match the declared type.\nPitfall: fixing with as Product, which silences the error without fixing data.\nStrong candidate reads the compiler error and explains both problems.\nWeak candidate casts or switches to any.',
        fix: `interface Product { id: number; title: string; price?: number }
const p: Product = { id: 1, title: 'Book', price: 10 };`,
        exercises: [
          {
            task: 'Make the email property optional and the id property readonly.',
            description: 'Checks modifiers on interface members. Ask the candidate to add them and show an invalid assignment.',
            code: 'interface User { id: string; email: string }',
            answer: 'Use readonly for id and ? for email. Readonly only blocks reassignment at compile time; it does not freeze the object. Weak answers try Object.freeze in the type.',
            solution: `interface User { readonly id: string; email?: string }
const u: User = { id: '1' };
// u.id = '2'; // Error: read-only`,
          },
          {
            task: 'Type a function parameter with an inline object type. Then move it into a named type.',
            description: 'Checks that inline and named types are equivalent. Ask why naming helps.',
            code: 'function greet(user: { name: string }) { return \'Hi \' + user.name; }',
            answer: 'Inline and named types are structurally identical; naming improves reuse, readability and error messages. A strong answer mentions either type or interface works here.',
            solution: `type Greetable = { name: string };
function greet(user: Greetable): string { return 'Hi ' + user.name; }`,
          },
        ],
      },
    ],
    middle: [
      {
        q: 'What happens here and why? Is it a bug or a feature?',
        code: `interface Window { myGlobal: string }
interface User { name: string }
interface User { age: number }
const u: User = { name: 'A' };`,
        short: 'Declaration merging: the two User declarations merge, so age is required and the assignment errors. Merging is a feature (meant for augmenting Window or libraries); type aliases cannot merge.',
        long: 'Interfaces with the same name in the same scope merge their members.\nHere User becomes { name: string; age: number }, so { name: "A" } is missing age → compile error.\nThe Window declaration is the intended use: global/module augmentation (in a module file it must be inside declare global { }).\nPitfall: accidental merging with a global name (e.g. naming your interface Event or Request) silently adds members.\nConflicting property types across merged declarations are an error.\nStrong candidate explains merging, module vs global scope, and the declare global/declare module augmentation pattern.\nWeak candidate guesses it is a duplicate identifier error.',
        exercises: [
          {
            task: 'A third-party module has a Request interface. Use module augmentation to add a typed `user` property to it.',
            description: 'Checks module augmentation, the main practical use of declaration merging. Ask the candidate where the file lives and why it needs export {}.',
            code: '// lib: declare module \'web-lib\' { interface Request { url: string } }',
            answer: 'Module augmentation reopens the library interface; it only works with interfaces because they merge, and the file must be a module. A wrong answer redeclares the interface globally, which does not reach the module scope. Strong answers mention the file must be a module and be included by tsconfig.',
            solution: `export {};
declare module 'web-lib' {
  interface Request { user?: { id: string } }
}`,
          },
          {
            task: 'Fix the error so both declarations describe one Config.',
            description: 'Checks that the candidate knows type aliases cannot merge and how to combine them instead. Ask for two possible fixes.',
            code: `type Config = { url: string };
type Config = { timeout: number };`,
            answer: 'Type aliases cannot be redeclared; either use merging interfaces or combine with an intersection under one name. Strong candidates offer both an intersection and switching to merging interfaces, and note intersections report conflicts as never rather than as errors.',
            solution: 'type Config = { url: string } & { timeout: number };',
          },
        ],
      },
      {
        q: 'Properties conflict. What is the difference between `extends` on interfaces and the ampersand (&) on type aliases?',
        short: 'Interface extends reports an error when a property type is incompatible; an intersection silently produces never for conflicting properties.',
        long: 'interface B extends A { x: number } errors immediately if A.x is string — good, early feedback.\ntype B = A & { x: number } compiles; B.x becomes string & number = never, and the error appears later at usage.\nInterfaces extending are also cached by name and are faster for the checker than large intersections.\nIntersections are still needed for combining unions or generic types.\nStrong candidate mentions both error timing and performance.\nWeak candidate says they are equivalent.',
        exercises: [
          {
            task: 'Predict where the error appears.',
            description: 'Checks conflict handling in extends vs &. Ask for both lines.',
            code: `interface A { x: string }
interface B extends A { x: number }
type C = A & { x: number };
const c: C = { x: 1 };`,
            answer: 'B errors at the declaration (incompatible x). C compiles but c errors because x is never. Strong answers prefer extends for earlier, clearer errors.',
          },
          {
            task: 'Override a property to a narrower type using extends.',
            description: 'Checks compatible overrides. Ask why narrowing is allowed but widening is not.',
            code: 'interface Base { status: string }',
            answer: 'A subtype may narrow a property (string → literal union) because it stays assignable to the base. Widening breaks substitutability.',
            solution: `interface Base { status: string }
interface Order extends Base { status: 'new' | 'paid' }`,
          },
        ],
      },
    ],
    senior: [
      {
        q: 'Why does this assignment fail, but the version with a variable works? Think about excess property checks.',
        code: `interface Opts { color?: string }
const a: Opts = { colour: 'red' }; // error
const tmp = { colour: 'red' };
const b: Opts = tmp; // ok?`,
        short: 'Excess property checks apply only to fresh object literals. The variable version is not fresh, but Opts is a weak type (all optional), so it still errors because there is no overlapping property.',
        long: 'Freshness: an object literal assigned directly to a typed target is checked for unknown properties (catches typos like colour).\nOnce the literal is stored in a variable it loses freshness and normal structural assignability applies.\nWeak type detection: if the target has only optional properties, the source must share at least one property — so const b: Opts = tmp actually errors too (no properties in common).\nWith a non-weak target (e.g. a required field) the variable version would compile silently.\nUse satisfies to check a literal against a type while keeping its narrow inferred type.\nStrong candidate knows both freshness and weak-type detection and mentions satisfies.\nWeak candidate says "TS is structural so extra props are always allowed".',
        fix: `interface Opts { color?: string }
const tmp = { color: 'red' } satisfies Opts; // checked, keeps literal type
const b: Opts = tmp;`,
        exercises: [
          {
            task: 'Predict which lines error and why.',
            description: 'Checks precise knowledge of freshness and weak type detection. Ask the candidate to mark each line OK or Error before explaining.',
            code: `interface Opts { retries: number; verbose?: boolean }
const a: Opts = { retries: 1, verbos: true };
const raw = { retries: 1, verbos: true };
const b: Opts = raw;`,
            answer: 'Line a errors (excess property on a fresh literal). Line b compiles: raw is not fresh and Opts is not a weak type because retries is required and overlaps. The common mistake is saying both error or applying the weak-type rule here; Opts has a required field so it is not weak. A strong answer names both rules and when each applies.',
          },
          {
            task: 'Type a routes config. Values must match a shape, but keys stay as literals for autocomplete.',
            description: 'Checks practical use of satisfies to keep inference while validating. Point at the typo line and ask how to catch it.',
            code: `type RouteDef = { path: string; auth: boolean };
const routes: Record<string, RouteDef> = { home: { path: '/', auth: false } };
routes.hom; // no error, typo slips through`,
            answer: 'An annotation widens keys to string; satisfies validates each value while keeping the inferred literal keys. Weak answers use as const alone (no validation) or a union of keys maintained by hand. Strong answers explain that annotations widen while satisfies only checks.',
            solution: `type RouteDef = { path: string; auth: boolean };
const routes = { home: { path: '/', auth: false } } satisfies Record<string, RouteDef>;
// routes.hom; // Error: property 'hom' does not exist`,
          },
        ],
      },
      {
        q: 'For a public library API, when would you choose a type alias over an interface? How does it affect the users of the library?',
        short: 'Interfaces are open to augmentation by consumers and give named error messages; type aliases are closed and required for unions/mapped types. Choose deliberately because augmentation is part of the public contract.',
        long: 'Public interface: consumers can augment it (e.g. theme typing, plugin options) — a feature or a compatibility burden.\nType alias: sealed; good for unions, discriminated results, derived types.\nError messages and hover show interface names; complex aliases may be expanded.\nChanging interface → type later is a breaking change for anyone augmenting.\nStrong candidate mentions augmentation as API surface (e.g. MUI theme, styled-components DefaultTheme).\nWeak candidate talks only about syntax.',
        exercises: [
          {
            task: 'Design a theme type. Apps should be able to extend it with their own tokens.',
            description: 'Checks intentional augmentation points. Ask how a consumer adds a token.',
            answer: 'Export an empty interface as an extension point; consumers augment it via declare module. A type alias cannot be augmented. Strong answers note this is the MUI/styled-components pattern.',
            solution: `// library
export interface CustomTokens {}
export type Theme = { primary: string } & CustomTokens;
// app
declare module 'my-lib' { interface CustomTokens { brand: string } }`,
          },
          {
            task: 'When you hover, does the type show the alias name? Predict the answer.',
            description: 'Checks how aliases display in tooling. Ask how to keep names readable.',
            code: `type Id = string;
type User = { id: Id };
declare const u: User;
const x = u.id;`,
            answer: 'Primitive aliases like Id are usually shown as string because aliases are not nominal. Strong answers mention branded types or interfaces when names matter in errors.',
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'Would you use a lint rule to force interface or type? How do you make this kind of decision in a team?',
        short: 'Yes, via @typescript-eslint/consistent-type-definitions; the decision is made once through a short RFC/ADR because the value is consistency, not the specific choice.',
        long: 'Low-stakes style choices should be automated so they never come up in code review.\nProcess: propose in a short ADR with trade-offs, timebox discussion, pick a default, encode in lint with autofix.\nAllow documented exceptions (e.g. interface where declaration merging is required).\nMeasure: fewer review nits, onboarding docs reference the rule.\nPitfall: big-bang reformatting PRs that pollute git blame — use autofix plus .git-blame-ignore-revs.\nStrong candidate focuses on process, automation and avoiding bikeshedding.\nWeak candidate argues passionately for one side or enforces by review comments only.',
        ai: true,
        exercises: [
          {
            task: 'Set up linting so object shapes always use `type`. The rule should fix existing code automatically.',
            description: 'Checks how the candidate turns a style decision into tooling. Ask about rollout on a large codebase, not just config.',
            answer: 'Use consistent-type-definitions with the "type" option; run eslint --fix once in a dedicated commit added to .git-blame-ignore-revs. Strong answers cover autofix, one isolated commit, blame-ignore and communicating the change. Weak answers stop at "add the rule".',
            solution: `// eslint.config.js
export default [{ rules: { '@typescript-eslint/consistent-type-definitions': ['error', 'type'] } }];`,
          },
          {
            task: 'Write a short decision section for an ADR about interface versus type.',
            description: 'Checks decision documentation and governance. Ask the candidate to draft the decision in two minutes.',
            answer: 'A good ADR states the context, the chosen default, documented exceptions (declaration merging, unions) and how it is enforced, so the decision is never re-litigated in reviews. Strong answers state context, decision, exceptions and enforcement; weak answers argue the merits of one syntax without a process.',
            solution: `// Decision: object shapes use interface; unions/mapped types use type.
// Exception: augmentation always uses interface.
// Enforcement: @typescript-eslint/consistent-type-definitions (error, autofix).`,
          },
        ],
      },
      {
        q: 'Fix this shared types file. Types are copied into many packages and slowly become different.',
        code: `// packages/web/types.ts
export interface User { id: string; name: string }
// packages/mobile/types.ts
export interface User { id: string; fullName: string }`,
        short: 'Move shared contracts into a single package (ideally generated from the API schema) and import types from there instead of copying them.',
        long: 'Duplicated types drift silently because each copy compiles on its own.\nA contracts package (or codegen from OpenAPI) becomes the single source of truth.\nImport with import type so no runtime dependency is added.\nVersion the package; breaking changes are visible in one place.\nStrong candidate also adds ownership and CI checks.\nWeak candidate syncs copies manually.',
        fix: `// packages/contracts/src/user.ts
export interface User { id: string; name: string }
// packages/web and mobile
import type { User } from '@acme/contracts';`,
        ai: true,
        exercises: [
          {
            task: 'Set up the contracts package so it contains only types.',
            description: 'Checks a types-only package setup. Ask what lands in the bundle.',
            answer: 'A package with only .d.ts output (or emitDeclarationOnly) adds zero runtime cost; consumers use import type. Strong answers mention exports with a types condition.',
            solution: `// packages/contracts/package.json
// { "name": "@acme/contracts", "types": "./dist/index.d.ts", "exports": { ".": { "types": "./dist/index.d.ts" } } }
// tsconfig: { "compilerOptions": { "emitDeclarationOnly": true, "declaration": true } }`,
          },
          {
            task: 'In CI, find when a local type stops matching the shared type.',
            description: 'Checks compile-time compatibility tests. Ask how the test fails.',
            answer: 'A type-level assertion that the local type is assignable to the shared one fails tsc when they diverge. Strong answers prefer deleting the local copy altogether.',
            solution: `import type { User } from '@acme/contracts';
type LocalUser = { id: string; name: string };
const _check: User = {} as LocalUser; // fails if shapes diverge`,
          },
        ],
      },
    ],
  },
  'Classes and inheritance': {
    junior: [
      {
        q: 'How do you extend a class and call the parent constructor in TS? What does `implements` do?',
        short: 'Use class B extends A and call super() before touching this in the constructor. implements only checks at compile time that the class matches an interface; it has no runtime effect.',
        long: 'extends sets up the prototype chain; a derived constructor must call super(...) before accessing this.\nMethods can be overridden; with noImplicitOverride the override keyword is required.\nimplements is a compile-time contract: it does not add members or inherit implementation, and parameter types are not inferred from the interface.\nA class can implement many interfaces but extend only one class.\nPitfall: expecting implements to provide default methods, or forgetting super().\nStrong candidate mentions override, single inheritance, and that implements is erased.\nWeak candidate confuses extends and implements.',
        exercises: [
          {
            task: 'Fix the constructor error.',
            description: 'Checks the super() rule in derived constructors. Show the snippet and ask what the compiler says.',
            code: `class Animal { constructor(public name: string) {} }
class Dog extends Animal {
  constructor(name: string) { this.name = name; }
}`,
            answer: 'A derived constructor must call super() before accessing this; super also assigns name via the parameter property. Some candidates remove the constructor entirely, which also works; ask why. Strong answers mention that this is unavailable until super() returns.',
            solution: `class Animal { constructor(public name: string) {} }
class Dog extends Animal {
  constructor(name: string) { super(name); }
}`,
          },
          {
            task: 'Make this class satisfy the Shape interface.',
            description: 'Checks that implements is a contract with no default behaviour. Ask what error message appears.',
            code: `interface Shape { area(): number }
class Square implements Shape { constructor(public size: number) {} }`,
            answer: 'implements requires every interface member; add area() with a compatible signature. A wrong answer expects the interface to supply area(). Strong answers add that implements has no runtime effect and does not infer parameter types.',
            solution: `interface Shape { area(): number }
class Square implements Shape {
  constructor(public size: number) {}
  area(): number { return this.size ** 2; }
}`,
          },
        ],
      },
      {
        q: 'Fix the errors in this subclass.',
        code: `class Shape { constructor(protected name: string) {} area() { return 0; } }
class Circle extends Shape {
  constructor(public r: number) {}
  area() { return Math.PI * r * r; }
}`,
        short: 'The subclass must call super() with the parent arguments, and instance fields are accessed via this.r, not r.',
        long: 'Two classic mistakes: missing super(...) and forgetting this.\nParameter properties (public r) still require super() first.\noverride documents intent and is required with noImplicitOverride.\nStrong candidate spots both errors from the code alone.\nWeak candidate needs the compiler output to find them.',
        fix: `class Shape { constructor(protected name: string) {} area(): number { return 0; } }
class Circle extends Shape {
  constructor(public r: number) { super('circle'); }
  override area(): number { return Math.PI * this.r * this.r; }
}`,
        exercises: [
          {
            task: 'Add a static factory method to a class.',
            description: 'Checks static members. Ask how it is called.',
            code: 'class Temp { constructor(public c: number) {} }',
            answer: 'Static members live on the class, not instances: Temp.fromF(212). Weak answers call it on an instance.',
            solution: `class Temp {
  constructor(public c: number) {}
  static fromF(f: number): Temp { return new Temp((f - 32) * 5 / 9); }
}`,
          },
          {
            task: 'Predict the output.',
            description: 'Checks method overriding and super calls. Ask for the string.',
            code: `class A { hi() { return 'A'; } }
class B extends A { override hi() { return super.hi() + 'B'; } }
console.log(new B().hi());`,
            answer: '"AB": super.hi() calls the parent implementation. Strong answers mention super works for methods but not for arrow-function fields.',
          },
        ],
      },
    ],
    middle: [
      {
        q: 'Why does this compile but crash at runtime?',
        code: `class Base {
  constructor() { this.init(); }
  init() {}
}
class Child extends Base {
  items: string[] = [];
  init() { this.items.push('x'); }
}
new Child();`,
        short: 'The Base constructor runs before Child field initializers, so Child.init sees items as undefined. Avoid calling overridable methods from constructors.',
        long: 'Order of construction: Base constructor body runs (inside super()), then Child fields are initialized, then the rest of the Child constructor.\nthis.init() dispatches virtually to Child.init, which reads this.items before it is assigned → TypeError.\nTS does not catch this because definite-assignment analysis does not cross the constructor/virtual call boundary.\nFixes: explicit init after construction, a factory, or pass data via constructor parameters.\nWith useDefineForClassFields the semantics are the same (fields defined after super).\nStrong candidate explains initialization order precisely.\nWeak candidate blames TS or suggests "just add ?".',
        fix: `class Base {
  init(): void {}
}
class Child extends Base {
  items: string[] = [];
  override init(): void { this.items.push('x'); }
  static create(): Child {
    const c = new Child();
    c.init();
    return c;
  }
}
Child.create();`,
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks field initialization order with inheritance. Ask for the output before running it.',
            code: `class A { name = 'A'; constructor() { console.log(this.name); } }
class B extends A { name = 'B'; }
new B();`,
            answer: 'It logs "A": A\'s constructor runs before B\'s field initializer overwrites name. Many say "B" because the instance is a B. Strong answers walk through: super() runs A fields and constructor, then B fields are assigned.',
          },
          {
            task: 'A method was renamed in the base class, but a subclass still overrides the old name. Turn on a compiler check that catches this, and fix the code.',
            description: 'Checks awareness of noImplicitOverride as a refactoring safety net. Ask what happens if Base.save is renamed.',
            code: `class Base { save() {} }
class Child extends Base { save() {} }`,
            answer: 'With noImplicitOverride, overriding members must use override, so if Base.save is renamed the compiler reports Child.save. Weak answers rely on tests to catch the silent duplicate method. Strong answers explain that override makes the intent checkable by the compiler.',
            solution: `// tsconfig: "noImplicitOverride": true
class Base { save() {} }
class Child extends Base { override save() {} }`,
          },
        ],
      },
      {
        q: 'What are getters, setters, and accessors in TS classes? What are the typing rules since TS 5.1?',
        short: 'get/set define computed properties; since TS 5.1 getter and setter types may be unrelated (setter can accept wider input), as long as both are explicitly annotated.',
        long: 'Accessors run code on read/write, useful for validation or derived state.\nTS 4.3 allowed a setter to accept a wider type than the getter returns; TS 5.1 removed the requirement that they be related.\nAccessors are on the prototype, not own properties: JSON.stringify skips them.\nauto-accessor keyword (accessor x) exists for standard decorators.\nStrong candidate mentions the type rule and serialization behaviour.\nWeak candidate only knows syntax.',
        exercises: [
          {
            task: 'Write a setter that accepts a string or a number, but the getter returns a number.',
            description: 'Checks divergent accessor types. Ask what the compiler allows.',
            answer: 'Since TS 4.3 the setter can accept a wider type; the getter returns the normalized value. Strong answers note explicit annotations are required.',
            solution: `class Price {
  #v = 0;
  get value(): number { return this.#v; }
  set value(v: string | number) { this.#v = Number(v); }
}`,
          },
          {
            task: 'Predict the JSON output.',
            description: 'Checks that accessors are not own properties. Ask why.',
            code: `class P { #x = 1; get x() { return this.#x; } }
console.log(JSON.stringify(new P()));`,
            answer: '"{}": getters live on the prototype and #x is not a property. Strong answers add a toJSON method to control serialization.',
          },
        ],
      },
    ],
    senior: [
      {
        q: 'Compare abstract classes, interfaces, and composition. How would you refactor this deep chain: Component, then Form, then LoginForm, then AdminLoginForm?',
        short: 'Abstract classes share implementation, interfaces only define contracts, composition assembles behaviour from small parts. Flatten the hierarchy by extracting behaviours (validation, submission, auth) into composable units.',
        long: 'Deep hierarchies create fragile base class problems: changes to Form ripple to every subclass, and behaviours cannot be mixed freely.\nAbstract class: shared code + abstract hooks (template method); runtime presence; single inheritance.\nInterface: pure contract, zero runtime cost, many per class.\nComposition: inject strategies/services (validator, submitter) or use hooks/functions in React.\nRefactor plan: identify varying behaviour per level, extract into interfaces + implementations, compose in one flat class or hook, migrate incrementally with tests.\nStrong candidate gives a concrete extraction and talks about incremental migration.\nWeak candidate says "inheritance is bad" without a plan.',
        exercises: [
          {
            task: 'Fix the error. You cannot create an abstract class, but a factory must accept any concrete subclass.',
            description: 'Checks abstract construct signatures and constructor types. Ask why typeof Repo is rejected.',
            code: `abstract class Repo { abstract find(id: string): string }
function make(C: typeof Repo) { return new C(); }`,
            answer: 'typeof Repo has an abstract construct signature; accept a concrete constructor type instead. A common workaround is casting to any. Strong answers use a concrete new () => Repo type and mention abstract new () => Repo for the opposite case.',
            solution: `abstract class Repo { abstract find(id: string): string }
function make(C: new () => Repo): Repo { return new C(); }
class MemRepo extends Repo { find(id: string) { return id; } }
make(MemRepo);`,
          },
          {
            task: 'Replace inheritance with composition. AdminLoginForm only adds one extra permission check.',
            description: 'Checks composition over inheritance in a concrete refactor. Ask how a third variant would be added.',
            code: `class LoginForm { submit(u: string) { return 'ok:' + u; } }
class AdminLoginForm extends LoginForm {
  override submit(u: string) { if (!u.startsWith('admin')) throw new Error('denied'); return super.submit(u); }
}`,
            answer: 'Inject the varying behaviour (a guard) instead of subclassing; new rules no longer need new subclasses. Weak answers add yet another subclass. Strong answers inject behaviour and show that new rules become data, not new classes.',
            solution: `type Guard = (u: string) => void;
class LoginForm {
  constructor(private guards: Guard[] = []) {}
  submit(u: string): string { this.guards.forEach(g => g(u)); return 'ok:' + u; }
}
const adminOnly: Guard = u => { if (!u.startsWith('admin')) throw new Error('denied'); };
const adminForm = new LoginForm([adminOnly]);`,
          },
        ],
      },
      {
        q: 'Fix the code so a subclass cannot forget to implement a required step.',
        code: `class Report {
  render() { return this.header() + this.body(); }
  header() { return 'Report\\n'; }
  body() { return ''; } // subclasses should override
}`,
        short: 'Make the class abstract and the step an abstract method; the compiler then forces every concrete subclass to implement it.',
        long: 'Template method pattern: base defines the algorithm, subclasses supply steps.\nabstract prevents direct instantiation and enforces implementation.\nprotected hides steps from callers.\nPitfall: default empty implementations silently produce wrong output.\nStrong candidate also discusses when composition (passing body as a function) is simpler.\nWeak candidate adds a runtime throw in the base method.',
        fix: `abstract class Report {
  render(): string { return this.header() + this.body(); }
  protected header(): string { return 'Report\\n'; }
  protected abstract body(): string;
}
class Sales extends Report {
  protected body(): string { return 'sales'; }
}`,
        exercises: [
          {
            task: 'Predict whether this compiles.',
            description: 'Checks abstract enforcement. Ask for the error.',
            code: `abstract class A { abstract run(): void }
class B extends A {}`,
            answer: 'It does not compile: non-abstract class B does not implement inherited abstract member run. Strong answers mention B could also be marked abstract.',
          },
          {
            task: 'Replace the abstract class with a function-based composition.',
            description: 'Checks alternatives to inheritance. Ask for trade-offs.',
            answer: 'Passing the varying step as a function avoids inheritance entirely; good for single-step variation. Strong answers mention testability.',
            solution: `function renderReport(body: () => string, header = () => 'Report\\n'): string {
  return header() + body();
}
renderReport(() => 'sales');`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'Your domain layer uses class hierarchies, and the UI uses plain objects. Serialization bugs keep happening. What architecture rule do you set?',
        short: 'Define a clear boundary: plain DTO types cross the network/state/cache, a mapping layer converts to and from domain classes, and runtime validation guards the edge.',
        long: 'Class instances lose prototypes when serialized (JSON, structuredClone, localStorage, persisted caches), so methods disappear and instanceof fails.\nRule: only plain, serializable data in stores, caches, URLs and messages.\nMapping functions (toDomain/toDto) live in one layer and are unit tested.\nValidate incoming data (zod/valibot) at the boundary.\nEnforce with lint (e.g. Redux serializableCheck, import boundaries) and document in an ADR.\nStrong candidate identifies the root cause (prototype loss) and makes the rule enforceable.\nWeak candidate patches individual bugs or adds class-transformer everywhere.',
        ai: true,
        exercises: [
          {
            task: 'Write a check that fails when class instances get into a serialized store.',
            description: 'Checks how to make a serialization rule enforceable. Ask what fails and where it is reported.',
            answer: 'Redux Toolkit serializableCheck middleware (or a test that round-trips state through JSON and compares) catches instances early. Strong answers mention dev-only middleware cost and a JSON round-trip test as an alternative. Weak answers rely on code review.',
            solution: `import { configureStore } from '@reduxjs/toolkit';
const store = configureStore({
  reducer: { app: (s: object = {}) => s },
  middleware: gdm => gdm({ serializableCheck: true }),
});`,
          },
          {
            task: 'Fix the bug: a cached Date comes back as a string after reading from localStorage.',
            description: 'Checks understanding of prototype/Date loss through JSON. Ask why the cast did not help.',
            code: `type Session = { expiresAt: Date };
const s = JSON.parse(localStorage.getItem('s')!) as Session;
s.expiresAt.getTime(); // TypeError`,
            answer: 'JSON has no Date; store a DTO with an ISO string and map explicitly at the boundary. A wrong answer adds a reviver hack per call site. Strong answers introduce a DTO plus mapper at a single boundary and explain that casts are erased.',
            solution: `type SessionDto = { expiresAt: string };
type Session = { expiresAt: Date };
const toSession = (d: SessionDto): Session => ({ expiresAt: new Date(d.expiresAt) });
const raw = localStorage.getItem('s');
const s = raw ? toSession(JSON.parse(raw) as SessionDto) : null;`,
          },
        ],
      },
      {
        q: 'Fix this design. Twenty services extend a shared BaseService, and every change breaks some of them.',
        code: `class BaseService {
  protected http = fetch;
  protected log(msg: string) { console.log(msg); }
  protected retry<T>(fn: () => Promise<T>) { return fn(); }
}
class UserService extends BaseService {}`,
        short: 'Replace the fragile base class with injected dependencies behind small interfaces, so services depend only on what they use and can be tested in isolation.',
        long: 'Fragile base class: every protected member is an implicit API for 20 subclasses.\nComposition with small interfaces (Http, Logger) reduces coupling and enables mocks.\nMigrate incrementally: new services use DI, old ones moved one by one.\nEnforce via lint/architecture rules and code review guidelines.\nStrong candidate plans a migration, not a rewrite.\nWeak candidate adds more methods to the base class.',
        fix: `interface Http { get<T>(url: string): Promise<T> }
interface Logger { log(msg: string): void }
class UserService {
  constructor(private http: Http, private logger: Logger) {}
  async get(id: string) {
    this.logger.log('get ' + id);
    return this.http.get<{ id: string }>('/users/' + id);
  }
}`,
        ai: true,
        exercises: [
          {
            task: 'Write a unit test double for the Http interface.',
            description: 'Checks that the refactor enables testing. Ask what the test asserts.',
            answer: 'Because UserService depends on an interface, a plain object can stand in for the network. Strong answers note no module mocking is needed.',
            solution: `const fakeHttp = { get: async <T,>(url: string) => ({ id: url.split('/').pop() }) as T };
const svc = new UserService(fakeHttp, { log: () => {} });`,
          },
          {
            task: 'Plan the migration in three steps.',
            description: 'Checks incremental change management. Ask how risk is limited.',
            answer: '1) Extract interfaces and inject them in BaseService itself; 2) migrate services one at a time to composition; 3) delete BaseService when unused. Strong answers mention tracking progress and freezing new subclassing via lint.',
          },
        ],
      },
    ],
  },
  'Access modifiers (public, private, protected)': {
    junior: [
      {
        q: 'What do public, private and protected mean?',
        short: 'public is accessible anywhere (the default), private only inside the declaring class, protected inside the class and its subclasses.',
        long: 'Members are public by default.\nprivate restricts access to the declaring class body; protected also allows subclasses.\nThese are compile-time checks only — the emitted JS has normal properties.\nParameter properties (constructor(private x: number)) declare and assign in one step.\nPitfall: assuming private hides data at runtime or from JSON.stringify.\nStrong candidate mentions default public, parameter properties and that checks are erased.\nWeak candidate only recites definitions.',
        exercises: [
          {
            task: 'Predict which lines error.',
            description: 'Checks the visibility rules of protected vs private. Ask which lines error and why.',
            code: `class A { protected x = 1; private y = 2; }
class B extends A { show() { return this.x + this.y; } }
new B().x;`,
            answer: 'this.y errors (private is class-only) and new B().x errors (protected is not accessible from outside). Candidates often think protected is visible on instances outside the class. A strong answer explains both errors precisely.',
          },
          {
            task: 'Shorten this class using parameter properties.',
            description: 'Checks parameter properties. Ask for the shortest equivalent class.',
            code: `class User {
  private id: string;
  public name: string;
  constructor(id: string, name: string) { this.id = id; this.name = name; }
}`,
            answer: 'Parameter properties declare and assign fields directly in the constructor signature. Strong answers note that parameter properties emit code and are flagged by erasableSyntaxOnly.',
            solution: `class User {
  constructor(private id: string, public name: string) {}
}`,
          },
        ],
      },
      {
        q: 'Fix the errors: outside code accesses members it should not.',
        code: `class Wallet { private balance = 0; protected owner = 'me'; }
const w = new Wallet();
w.balance = 100;
console.log(w.owner);`,
        short: 'private and protected members are not accessible from outside; expose behaviour through public methods instead.',
        long: 'Encapsulation: keep state private, expose intent-revealing methods.\nprotected allows subclasses only, never external code.\nPitfall: making everything public to "fix" errors.\nStrong candidate adds methods that express behaviour (deposit) rather than raw setters.\nWeak candidate changes modifiers to public.',
        fix: `class Wallet {
  private balance = 0;
  protected owner = 'me';
  deposit(n: number): void { this.balance += n; }
  getOwner(): string { return this.owner; }
}
const w = new Wallet();
w.deposit(100);
console.log(w.getOwner());`,
        exercises: [
          {
            task: 'Make a property readable from outside but writable only inside the class.',
            description: 'Checks getter-only exposure. Ask about alternatives.',
            code: 'class Counter { count = 0; inc() { this.count++; } }',
            answer: 'Use a private field with a public getter, or public readonly when it never changes. Strong answers mention the #private version too.',
            solution: `class Counter {
  private _count = 0;
  get count(): number { return this._count; }
  inc(): void { this._count++; }
}`,
          },
          {
            task: 'Predict which line errors.',
            description: 'Checks readonly modifier. Ask when readonly can be assigned.',
            code: 'class A { readonly id: string; constructor() { this.id = \'x\'; } reset() { this.id = \'y\'; } }',
            answer: 'The assignment in reset errors; readonly fields can only be assigned in the declaration or the constructor.',
          },
        ],
      },
    ],
    middle: [
      {
        q: 'Is the value really private? What prints?',
        code: `class Acc { private balance = 100; #pin = 1234; }
const a = new Acc();
console.log((a as any).balance, (a as any)['#pin']);`,
        short: 'It prints 100 and undefined. TS private is compile-time only, while #pin is a real JS private field that cannot be accessed from outside at all.',
        long: 'TS private disappears after compilation: balance is a regular own property, so any cast or bracket access reads it.\n#pin is an ECMAScript private field: stored in a hidden slot, not a property; a["#pin"] looks up a normal string key and gets undefined.\n# fields are not visible to Object.keys or JSON.stringify, and cannot be accessed by subclasses.\nTrade-offs: # is truly encapsulated but cannot be reached in tests via casting and needs ES2022 or downlevel WeakMap emit.\nTS private allows bracket access a["balance"] as an intentional escape hatch.\nStrong candidate explains runtime vs compile-time privacy.\nWeak candidate thinks both throw or both print values.',
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks runtime behaviour of # fields vs TS private. Ask what happens on the second call.',
            code: `class A { #n = 1; static read(o: any) { return o.#n; } }
console.log(A.read(new A()));
console.log(A.read({}));`,
            answer: 'First logs 1. The second throws a TypeError at runtime: reading a #private field from an object without it throws (unlike TS private). Many expect undefined like normal properties. Strong answers mention the brand check `#n in o` to avoid the TypeError.',
          },
          {
            task: 'Make the counter truly private at runtime while keeping the same API.',
            description: 'Checks migration from compile-time to runtime privacy. Ask about compatibility with older targets.',
            code: 'class Counter { private count = 0; inc() { return ++this.count; } }',
            answer: 'Replace the TS-only private modifier with an ECMAScript #private field. Strong answers mention ES2022 targets or WeakMap downlevel emit and that subclasses cannot access #count.',
            solution: 'class Counter { #count = 0; inc(): number { return ++this.#count; } }',
          },
        ],
      },
      {
        q: 'Can a subclass make a protected member public? Can it make a public member private?',
        short: 'A subclass may widen visibility (protected → public) but not narrow it (public → private/protected), because that would break substitutability.',
        long: 'Liskov substitution: code using the base type must still be able to access its public members via a subclass instance.\nRedeclaring a protected member as public in a subclass is allowed.\nMaking a public member private in a subclass is a compile error.\nPrivate members cannot be redeclared at all in subclasses with the same name.\nStrong candidate explains the reason (substitutability).\nWeak candidate guesses either way.',
        exercises: [
          {
            task: 'Predict which subclass compiles.',
            description: 'Checks visibility widening vs narrowing. Ask for both.',
            code: `class Base { protected a = 1; public b = 2; }
class X extends Base { public a = 1; }
class Y extends Base { private b = 2; }`,
            answer: 'X compiles (widening protected → public). Y errors: b is public in Base and cannot become private. Strong answers mention substitutability.',
          },
          {
            task: 'Access a protected member of another instance of the same class.',
            description: 'Checks protected access rules across instances. Ask why it is allowed.',
            code: 'class Node2 { protected value = 1; equals(o: Node2) { return this.value === o.value; } }',
            answer: 'It compiles: access is checked per class, not per instance, so methods can read protected members of other instances of the same class (or subclass).',
          },
        ],
      },
    ],
    senior: [
      {
        q: 'Explain readonly, private, hash private, and Object.freeze. Which one do you use for a public SDK API, and why?',
        short: 'readonly and private are compile-time only; #private is enforced by the runtime; Object.freeze is shallow runtime immutability. For an SDK use #private so consumers cannot depend on internals.',
        long: 'readonly: prevents reassignment in TS, nothing at runtime; does not make nested objects immutable.\nprivate: compile-time visibility; JS consumers or casts can still read and depend on it, turning internals into accidental API.\n#private: hard privacy, safe to rename/remove without breaking consumers; not accessible to subclasses.\nObject.freeze: runtime, shallow; affects all properties; writes throw in strict mode.\nFor SDKs: #private for internals, readonly in types for public data, return copies or readonly types for collections.\nStrong candidate connects privacy to semver and Hyrum\'s law.\nWeak candidate treats them as synonyms.',
        exercises: [
          {
            task: 'Expose a list that users cannot change, not through types and not at runtime.',
            description: 'Checks designing an immutable public surface. Ask how consumers could still mutate the list.',
            code: 'class Store { items: string[] = []; }',
            answer: 'Keep the array #private and expose a readonly view; return a frozen copy if runtime protection is needed. Weak answers only use readonly in the type, which a cast bypasses. Strong answers combine # storage, readonly types and copies, and discuss the copy cost.',
            solution: `class Store {
  #items: string[] = [];
  add(i: string): void { this.#items.push(i); }
  get items(): readonly string[] { return Object.freeze([...this.#items]); }
}`,
          },
          {
            task: 'Predict whether this compiles.',
            description: 'Checks that private members make classes nominal. Ask for a prediction first.',
            code: `class Box { private v = 1; }
class Other { private v = 1; }
const b: Box = new Other();`,
            answer: 'It does not compile: classes with private members are compared nominally, so Other is not assignable to Box despite the identical shape. Most candidates assume structural typing applies. Strong answers explain the private-member nominal rule and how it is used deliberately.',
          },
        ],
      },
      {
        q: 'Fix the leak. A "private" token shows up in serialized data and in logs.',
        code: `class Api {
  private token: string;
  constructor(token: string) { this.token = token; }
}
console.log(JSON.stringify(new Api('secret'))); // {"token":"secret"}`,
        short: 'TS private is erased, so the token is a normal property visible to JSON.stringify, console.log and error reporters. Use #private (and optionally toJSON) for secrets.',
        long: 'Compile-time privacy does nothing for logs, Sentry payloads or devtools.\n#private fields are not enumerable properties and are skipped by JSON.stringify.\nconsole.log in browsers may still show # fields in devtools, so never rely on privacy for real secrecy in the client.\nStrong candidate distinguishes encapsulation from security.\nWeak candidate thinks private hides data at runtime.',
        fix: `class Api {
  #token: string;
  constructor(token: string) { this.#token = token; }
  toJSON(): object { return { type: 'Api' }; }
}
console.log(JSON.stringify(new Api('secret'))); // {"type":"Api"}`,
        exercises: [
          {
            task: 'Predict whether Object.keys shows each field.',
            description: 'Checks runtime visibility of fields. Ask for the array.',
            code: `class A { private a = 1; #b = 2; public c = 3; }
console.log(Object.keys(new A()));`,
            answer: '["a", "c"]: TS private is a normal property; #b is not a property at all.',
          },
          {
            task: 'Add custom output for when Node logs this object.',
            description: 'Checks controlling debug output. Ask when to use it.',
            answer: 'Node calls [Symbol.for("nodejs.util.inspect.custom")] in console.log; returning a redacted view avoids leaking secrets in server logs.',
            solution: `class Api {
  #token = 'secret';
  [Symbol.for('nodejs.util.inspect.custom')]() { return 'Api { token: [redacted] }'; }
}`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'How do you define the public API of a shared internal package? How do you stop other teams from importing its internal files?',
        short: 'Use package.json "exports" to expose only entry points, enforce import boundaries with lint, track the surface with API Extractor, and version with semver and changelogs.',
        long: 'Physical enforcement: "exports" makes deep imports fail resolution for Node and modern bundlers (moduleResolution bundler/node16).\nLint enforcement: no-restricted-imports or eslint-plugin-boundaries / Nx module boundaries in a monorepo.\nAPI review: API Extractor generates an .api.md report; changes show up in PR diffs.\nMark internals with @internal and stripInternal.\nVersioning: semver, changesets, deprecation periods.\nStrong candidate combines tooling with governance (owners, review).\nWeak candidate relies on a README asking people not to import internals.',
        ai: true,
        exercises: [
          {
            task: 'Hide an internal helper from the published d.ts files of a package.',
            description: 'Checks controlling the published type surface. Ask how internals leak today.',
            code: `export class Client {
  /** @internal */
  resetCache(): void {}
}`,
            answer: 'Mark it @internal and enable stripInternal so it is removed from declaration output (API Extractor can enforce the same). Strong answers mention stripInternal caveats (it is officially unsupported for some cases) and API Extractor as a more robust gate.',
            solution: '// tsconfig.json: { "compilerOptions": { "declaration": true, "stripInternal": true } }',
          },
          {
            task: 'Make deep imports into the acme ui src folder fail when the module is resolved.',
            description: 'Checks package exports as physical enforcement. Ask what error consumers see.',
            answer: 'An "exports" map limits importable subpaths; any path not listed fails with ERR_PACKAGE_PATH_NOT_EXPORTED in Node and modern bundlers. Strong answers mention moduleResolution must be node16/bundler for TS to honour exports, plus a lint rule for monorepo source imports.',
            solution: `// package.json
// { "exports": { ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" } } }`,
          },
        ],
      },
      {
        q: 'Your team mixes `private` and hash `#private` at random. Define a rule and explain it.',
        short: 'Pick one default by context: #private for library/SDK code and secrets (runtime enforced), TS private for app code where testing ergonomics and decorators matter; enforce with lint.',
        long: '#private: true encapsulation, safe refactors, but no access from tests via casts and incompatible with some decorator/proxy patterns (MobX, Vue reactivity).\nTS private: zero runtime cost, test-friendly escape hatch, works with proxies.\nRule example: packages published externally use #; app code uses private; secrets always #.\nEnforce with eslint (e.g. no-restricted-syntax on PrivateIdentifier in app folders or the reverse).\nStrong candidate mentions proxy incompatibility of # fields.\nWeak candidate chooses by taste.',
        ai: true,
        exercises: [
          {
            task: 'Explain why hash private fields break with a reactive store built on Proxy.',
            description: 'Checks a real compatibility issue. Ask for the error.',
            code: `class S { #n = 1; get n() { return this.#n; } }
const p = new Proxy(new S(), {});
p.n;`,
            answer: 'The getter runs with this = proxy, and the proxy has no #n slot, so it throws TypeError. Strong answers mention MobX/Vue reactive objects hitting this.',
          },
          {
            task: 'Write a lint rule that forbids #private in app code.',
            description: 'Checks policy enforcement. Ask about exceptions.',
            answer: 'no-restricted-syntax on PrivateIdentifier, scoped by files, enforces the rule; allow exceptions in a security folder.',
            solution: 'export default [{ files: [\'src/app/**\'], rules: { \'no-restricted-syntax\': [\'error\', { selector: \'PrivateIdentifier\', message: \'Use TS private in app code\' }] } }];',
          },
        ],
      },
    ],
  },
  Generics: {
    junior: [
      {
        q: 'What are generics? Write a generic identity function. Then write a typed signature like useState.',
        short: 'Generics are type parameters that link input and output types so a function or type works for many types without losing type information.',
        long: 'Without generics you choose between a specific type (not reusable) or any (unsafe).\nA type parameter T is usually inferred from arguments: identity(5) gives T = number.\nGenerics can be constrained (T extends ...) and have defaults (T = string).\nPitfall: a type parameter used only once (e.g. only in the return type) is a smell — it is just an unchecked cast.\nStrong candidate shows inference and constraints.\nWeak candidate only says "like templates" and uses any.',
        fix: `function identity<T>(v: T): T {
  return v;
}

type SetState<S> = (next: S | ((prev: S) => S)) => void;
declare function useState<S>(initial: S | (() => S)): [S, SetState<S>];`,
        exercises: [
          {
            task: 'Replace any with a generic so the return type follows the input.',
            description: 'Checks basic generic functions. Ask the candidate to explain what T is inferred as for a string array.',
            code: 'function last(arr: any[]): any { return arr[arr.length - 1]; }',
            answer: 'A type parameter T links the element type of the input to the return type. Weak answers keep any or return T without undefined. Strong answers include undefined for empty arrays.',
            solution: 'function last<T>(arr: T[]): T | undefined { return arr[arr.length - 1]; }',
          },
          {
            task: 'Write a generic Box type and a function that wraps a value in it.',
            description: 'Checks generic types and inference. Ask for the type of box("a").',
            answer: 'Generic types are parameterized like functions; T is inferred from the argument. Strong answers mention that T is inferred from the argument and can be passed explicitly.',
            solution: `type Box<T> = { value: T };
function box<T>(value: T): Box<T> { return { value }; }
const b = box(42); // Box<number>`,
          },
        ],
      },
      {
        q: 'Fix the error: the function loses the array element type.',
        code: `function wrap(items: any[]) { return { items, count: items.length }; }
const r = wrap(['a', 'b']);
r.items[0].toFixed(); // no error, crashes at runtime`,
        short: 'Replace any with a type parameter T so the element type flows through to the result and misuse is caught.',
        long: 'any disables checking for everything downstream.\nT is inferred from the argument (string here).\nThe return type now carries T, so wrong method calls are compile errors.\nStrong candidate explains inference and why any spreads.\nWeak candidate uses unknown[] and then casts.',
        fix: `function wrap<T>(items: T[]): { items: T[]; count: number } {
  return { items, count: items.length };
}
const r = wrap(['a', 'b']);
// r.items[0].toFixed(); // Error: toFixed does not exist on string`,
        exercises: [
          {
            task: 'Call a generic function with an explicit type argument.',
            description: 'Checks explicit vs inferred type arguments. Ask when explicit is needed.',
            code: 'function empty<T>(): T[] { return []; }',
            answer: 'With no arguments, T cannot be inferred and defaults to unknown; pass it explicitly: empty<string>(). Strong answers mention defaults (T = string).',
            solution: `function empty<T = string>(): T[] { return []; }
const xs = empty<number>();`,
          },
          {
            task: 'Write a generic Pair type and a swap function.',
            description: 'Checks multiple type parameters. Ask for the swapped type.',
            answer: 'Two type parameters keep both positions typed; swap returns Pair<B, A>.',
            solution: `type Pair<A, B> = [A, B];
function swap<A, B>([a, b]: Pair<A, B>): Pair<B, A> { return [b, a]; }
const s = swap([1, 'x']); // [string, number]`,
          },
        ],
      },
    ],
    middle: [
      {
        q: 'Make this type-safe so the return type matches the key.',
        code: 'function getProp(obj: any, key: string) { return obj[key]; }',
        short: 'Make the object type T and constrain the key to K extends keyof T, then return the indexed access type T[K].',
        long: 'keyof T produces a union of the object\'s keys; K extends keyof T restricts arguments to valid keys and keeps the literal key.\nT[K] is an indexed access type, so getProp(user, "age") returns number.\nInvalid keys are compile errors, with autocomplete in the IDE.\nPitfall: typing key as keyof T without a separate K returns the union of all value types.\nStrong candidate explains why a separate K is needed.\nWeak candidate keeps any or uses string with a cast.',
        fix: `function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const age = getProp({ name: 'A', age: 3 }, 'age'); // number`,
        exercises: [
          {
            task: 'Fix the error by constraining T.',
            description: 'Checks generic constraints. Ask what types can now be passed.',
            code: 'function longest<T>(a: T, b: T) { return a.length >= b.length ? a : b; }',
            answer: 'T has no length unless constrained; extends { length: number } allows strings, arrays and more. Wrong fixes use T extends string, which is too narrow. Strong answers note arrays and strings both work and the return keeps the specific type.',
            solution: `function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}`,
          },
          {
            task: 'Write a groupBy whose result keys are typed by the key function.',
            description: 'Checks combining generics with Record and PropertyKey. Ask why Partial is used.',
            answer: 'Constrain the key type to PropertyKey and return a Partial Record so missing groups are visible in the type. Strong answers explain that not every key will have a group, so plain Record would lie.',
            solution: `function groupBy<T, K extends PropertyKey>(items: T[], key: (t: T) => K): Partial<Record<K, T[]>> {
  const out: Partial<Record<K, T[]>> = {};
  for (const it of items) (out[key(it)] ??= []).push(it);
  return out;
}`,
          },
        ],
      },
      {
        q: 'What is the difference between `T extends X` in a generic constraint and in a conditional type?',
        short: 'In a constraint (<T extends X>) it restricts which types may be passed; in a conditional type (T extends X ? A : B) it is a test that selects a branch and distributes over unions.',
        long: 'Constraint: compile error if the argument does not satisfy X; inside the function T has X\'s members.\nConditional: no error, just evaluates to A or B; with naked T it distributes over union members.\ninfer is only allowed in conditional types.\nPitfall: expecting a constraint to narrow at runtime — it is purely static.\nStrong candidate gives examples of both and mentions distribution.\nWeak candidate thinks both are the same thing.',
        exercises: [
          {
            task: 'Write a conditional type that returns the element type of an array or the type itself.',
            description: 'Checks conditional types with infer. Ask for results of two inputs.',
            answer: 'infer captures the element type in the true branch; non-arrays fall through. Flatten<string[]> is string, Flatten<number> is number.',
            solution: `type Flatten<T> = T extends readonly (infer U)[] ? U : T;
type A = Flatten<string[]>; // string
type B = Flatten<number>; // number`,
          },
          {
            task: 'Predict which call errors.',
            description: 'Checks generic constraints. Ask for the message.',
            code: `function len<T extends { length: number }>(x: T) { return x.length; }
len('abc'); len([1]); len(5);`,
            answer: 'len(5) errors: number has no length property. Strings and arrays satisfy the constraint structurally.',
          },
        ],
      },
    ],
    senior: [
      {
        q: 'Write a DeepReadonly type. Also write a type that gets the resolved value type of a function that returns a Promise. What edge cases are there?',
        short: 'Use a recursive conditional/mapped type for DeepReadonly and Awaited<ReturnType<F>> for the resolved type. Edge cases: functions, arrays/tuples, Map/Set, Date, class instances and recursion depth.',
        long: 'Mapped types over arrays and tuples are homomorphic, so { readonly [K in keyof T] } produces readonly arrays/tuples correctly.\nFunctions must be excluded or they become an object type with no call signature.\nMap/Set need special handling: mapping their keys only makes methods readonly, not the contents.\nDate and class instances get their methods marked readonly — usually acceptable but worth stating.\nAwaited recursively unwraps nested promises and thenables (TS 4.5+).\nDeep recursion can hit "Type instantiation is excessively deep" on huge types.\nStrong candidate lists edge cases unprompted and tests the types.\nWeak candidate writes a one-level Readonly or uses ReturnType without Awaited.',
        fix: `type DeepReadonly<T> =
  T extends (...args: any[]) => any ? T
  : T extends Map<infer K, infer V> ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
  : T extends Set<infer U> ? ReadonlySet<DeepReadonly<U>>
  : T extends object ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T;

type AsyncReturn<F extends (...args: any[]) => Promise<unknown>> = Awaited<ReturnType<F>>;`,
        exercises: [
          {
            task: 'Write a type that makes only the given keys optional.',
            description: 'Checks composing utility types. Ask for the resulting type of the example.',
            answer: 'Combine Omit for the untouched keys with Partial<Pick> for the selected ones. Weak answers rewrite with mapped types from scratch incorrectly. Strong answers mention flattening the intersection for nicer hover output.',
            solution: `type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type U = PartialBy<{ id: string; name: string }, 'id'>; // { name: string; id?: string }`,
          },
          {
            task: 'Predict the result types. Explain how conditional types distribute over unions.',
            description: 'Checks distributive conditional types. Ask for both results before explaining.',
            code: `type ToArray<T> = T extends unknown ? T[] : never;
type A = ToArray<string | number>;
type NoDist<T> = [T] extends [unknown] ? T[] : never;
type B = NoDist<string | number>;`,
            answer: 'A is string[] | number[] because naked type parameters distribute over unions; B is (string | number)[] because wrapping in a tuple disables distribution. Many think A is (string | number)[]. Strong answers know only naked type parameters distribute and how [T] disables it.',
          },
        ],
      },
      {
        q: 'Fix the types, so the callback gets the correct event type for each event name.',
        code: `type Events = { click: MouseEvent; keydown: KeyboardEvent };
function on(name: keyof Events, cb: (e: Events[keyof Events]) => void) {}
on('click', e => e.clientX); // error: clientX does not exist on KeyboardEvent`,
        short: 'Capture the key in a type parameter K so the callback type is Events[K] for that specific key rather than the union of all events.',
        long: 'keyof Events without a type parameter widens to the union, so the callback gets MouseEvent | KeyboardEvent.\nA generic K preserves the literal key and indexes the map precisely.\nThis is the pattern behind addEventListener typings (HTMLElementEventMap).\nPitfall: when K is itself a union, the callback type becomes a union again.\nStrong candidate relates it to lib.dom typings.\nWeak candidate overloads every event manually.',
        fix: `type Events = { click: MouseEvent; keydown: KeyboardEvent };
function on<K extends keyof Events>(name: K, cb: (e: Events[K]) => void): void {}
on('click', e => e.clientX); // e: MouseEvent`,
        exercises: [
          {
            task: 'Write a type-safe `get` for nested paths, two levels deep.',
            description: 'Checks chained indexed access with generics. Ask for the return type.',
            answer: 'Two type parameters chained by constraints give precise nested types without string paths.',
            solution: `function get2<T, K1 extends keyof T, K2 extends keyof T[K1]>(o: T, k1: K1, k2: K2): T[K1][K2] {
  return o[k1][k2];
}
const n = get2({ a: { b: 1 } }, 'a', 'b'); // number`,
          },
          {
            task: 'Predict the inferred type of K when called with a union.',
            description: 'Checks generic behaviour with union arguments. Ask for the callback parameter type.',
            code: `type Events = { click: MouseEvent; keydown: KeyboardEvent };
declare function on<K extends keyof Events>(name: K, cb: (e: Events[K]) => void): void;
declare const name: 'click' | 'keydown';
on(name, e => {});`,
            answer: 'K is "click" | "keydown", so e is MouseEvent | KeyboardEvent. Strong answers note the correlation is lost with union keys.',
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'Clever generic types make the IDE slow and confuse the team. How do you decide what is too much?',
        short: 'Readability over cleverness: complex types live in well-documented, tested library code, app code stays simple, and compiler performance is measured.',
        long: 'Types are code: they need review, tests and maintenance.\nGuidelines: prefer explicit simple types in app code; allow advanced types in shared utils with docs and type tests (expectTypeOf, tsd, @ts-expect-error).\nMeasure: tsc --extendedDiagnostics, --generateTrace, IDE latency complaints.\nRed flags: deep recursive conditionals, huge unions, types nobody can explain in review.\nIt is fine to use a slightly looser type plus runtime validation when exact typing is too costly.\nStrong candidate gives concrete criteria and measurement.\nWeak candidate either bans generics or celebrates type gymnastics.',
        ai: true,
        exercises: [
          {
            task: 'Add a test that fails at compile time if a utility type changes its behavior.',
            description: 'Checks testing types in CI. Ask how a regression would be noticed.',
            answer: 'A type-level assertion via an Equal helper, or vitest expectTypeOf, turns type behaviour into a CI-checked test. Strong answers mention expectTypeOf/tsd as more readable options and that the tests run under tsc.',
            solution: `type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
type _t = Expect<Equal<Awaited<Promise<number>>, number>>;`,
          },
          {
            task: 'This generic signature is too complex for application code. Simplify it.',
            description: 'Checks pragmatic simplification. Ask what is lost and whether it matters.',
            code: 'function setField<T extends Record<string, unknown>, K extends keyof T, V extends T[K]>(o: T, k: K, v: V): T & { [P in K]: V } { return { ...o, [k]: v }; }',
            answer: 'App code rarely needs the precise intersection result; returning T keeps safety for keys and values and is far easier to read. Strong answers weigh precision vs readability; weak answers defend the complex signature without a use case.',
            solution: `function setField<T, K extends keyof T>(o: T, k: K, v: T[K]): T {
  return { ...o, [k]: v };
}`,
          },
        ],
      },
      {
        q: 'Fix this API client. Every call needs a generic written by hand, and nothing links it to the endpoint.',
        code: `async function api<T>(url: string): Promise<T> {
  return (await fetch(url)).json();
}
const u = await api<User>('/orders/1'); // wrong type, no error`,
        short: 'Map endpoints to response types once and derive the return type from the path, so callers cannot pick an unrelated generic.',
        long: 'A free-floating <T> is just a disguised cast; callers can lie.\nAn endpoint map ties URL to response type in one place (ideally generated from OpenAPI).\nAdd runtime validation for untrusted responses.\nStrong candidate mentions codegen and validation.\nWeak candidate keeps manual generics.',
        fix: `type Endpoints = {
  '/users/:id': { id: string; name: string };
  '/orders/:id': { id: string; total: number };
};
async function api<P extends keyof Endpoints>(path: P, id: string): Promise<Endpoints[P]> {
  const res = await fetch(path.replace(':id', id));
  return (await res.json()) as Endpoints[P];
}
const order = await api('/orders/:id', '1'); // { id: string; total: number }`,
        ai: true,
        exercises: [
          {
            task: 'Explain why a function `api` with a generic T, that returns a Promise of T, is unsafe.',
            description: 'Checks recognizing return-only generics as casts. Ask for a counterexample.',
            answer: 'A type parameter used only in the return position cannot be checked; it is equivalent to as T. Any T can be requested for any URL, so mistakes compile. Strong answers cite the "golden rule of generics".',
          },
          {
            task: 'Add zod validation to the endpoint map.',
            description: 'Checks combining types with runtime safety. Ask where schemas live.',
            answer: 'Store schemas instead of types and derive types with z.infer; parse responses before returning.',
            solution: `import { z } from 'zod';
const endpoints = { '/users/:id': z.object({ id: z.string(), name: z.string() }) };
type EP = typeof endpoints;
async function api<P extends keyof EP>(p: P, id: string): Promise<z.infer<EP[P]>> {
  return endpoints[p].parse(await (await fetch(p.replace(':id', id))).json());
}`,
          },
        ],
      },
    ],
  },
  Decorators: {
    junior: [
      {
        q: 'What is a decorator? Where have you seen them, for example in Angular, NestJS, or MobX?',
        short: 'A decorator is a function applied with @ to a class or class member at definition time to annotate it or replace/wrap its behaviour.',
        long: 'Decorators run once when the class is defined, not on each call.\nCommon uses: Angular @Component/@Injectable, NestJS @Controller/@Get, MobX @observable, TypeORM @Entity, class-validator.\nTS 5.0+ supports standard (TC39) decorators; the older experimentalDecorators mode is still used by many frameworks.\nThey work only on classes and class members, not plain functions.\nStrong candidate knows there are two decorator systems and roughly how they differ.\nWeak candidate confuses decorators with HOCs or thinks they are inert annotations.',
        exercises: [
          {
            task: 'Predict when the decorator runs.',
            description: 'Checks when decorators execute. Ask for the log order.',
            code: `function mark(_v: unknown, ctx: ClassMethodDecoratorContext) { console.log('decorating', String(ctx.name)); }
class A { @mark run() {} }
console.log('defined');`,
            answer: '"decorating run" logs before "defined": decorators run once at class definition, not when methods are called or instances created. Many think decorators run on each call. Strong answers say they run once during class definition.',
          },
          {
            task: 'Write a class decorator that logs the class name when it is defined.',
            description: 'Checks the basic class decorator signature. Ask what ctx.name contains.',
            answer: 'A standard class decorator receives the class and a ClassDecoratorContext whose name is the class name. Strong answers mention that ctx.name can be undefined for anonymous classes.',
            solution: `function logged(_value: Function, ctx: ClassDecoratorContext) {
  console.log('defined', ctx.name);
}
@logged class Service {}`,
          },
        ],
      },
      {
        q: 'Fix the decorator so it compiles with TS 5 standard decorators.',
        code: `function readonly(target: any, key: string, desc: PropertyDescriptor) {
  desc.writable = false;
}
class A { @readonly run() {} }`,
        short: 'That is the legacy (target, key, descriptor) signature; standard decorators receive (value, context) and use context.addInitializer for per-instance setup.',
        long: 'Legacy signature only works with experimentalDecorators.\nStandard method decorators get the method and a context object; they cannot modify the descriptor directly.\naddInitializer runs during construction for each instance.\nStrong candidate identifies which decorator mode the code targets.\nWeak candidate enables experimentalDecorators without understanding the difference.',
        fix: `function frozen(value: Function, ctx: ClassMethodDecoratorContext) {
  ctx.addInitializer(function (this: any) {
    Object.defineProperty(this, ctx.name, { value: (value as Function).bind(this), writable: false });
  });
}
class A { @frozen run() {} }`,
        exercises: [
          {
            task: 'Write a method decorator that prints "called" before the method runs.',
            description: 'Checks the basic standard decorator replacement pattern. Ask what is returned.',
            answer: 'Return a replacement function that logs and calls the original with apply(this, args).',
            solution: `function called(fn: Function, _ctx: ClassMethodDecoratorContext) {
  return function (this: unknown, ...args: unknown[]) { console.log('called'); return fn.apply(this, args); };
}`,
          },
          {
            task: 'Predict which flag is required for this code.',
            description: 'Checks recognizing decorator modes. Ask for the tsconfig flag.',
            code: `function d(target: object, key: string) {}
class A { @d x = 1; }`,
            answer: 'A (target, key) property decorator is legacy and requires experimentalDecorators: true. Standard field decorators receive (undefined, context).',
          },
        ],
      },
    ],
    middle: [
      {
        q: 'Write a log method decorator with TS 5 standard decorators. It logs the arguments and the result.',
        short: 'Standard decorators receive (value, context) and can return a replacement method; the replacement must preserve this and the original signature.',
        long: 'Signature: (originalMethod, context: ClassMethodDecoratorContext) → optional replacement.\nUse a regular function (not arrow) so this is the instance; call target with this.\nGeneric This/Args/R keep the method type intact instead of any.\ncontext also gives name, static, private, and addInitializer (e.g. for auto-binding).\nPitfall: async methods return a promise, so logging result logs the promise; handle with then if needed.\nStrong candidate types it generically and mentions addInitializer.\nWeak candidate writes the legacy (target, key, descriptor) form while claiming it is TS 5 standard.',
        fix: `function log<This, Args extends unknown[], R>(
  target: (this: This, ...args: Args) => R,
  ctx: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => R>,
) {
  return function (this: This, ...args: Args): R {
    const result = target.call(this, ...args);
    console.log(String(ctx.name), args, result);
    return result;
  };
}

class Calc {
  @log add(a: number, b: number): number { return a + b; }
}
new Calc().add(1, 2); // logs: add [1, 2] 3`,
        exercises: [
          {
            task: 'Fix the decorator so `this` works inside the wrapped method.',
            description: 'Checks this-binding inside method decorators. Ask what this.n evaluates to in the broken version.',
            code: `function trace(fn: Function, _ctx: ClassMethodDecoratorContext) {
  return (...args: unknown[]) => fn(...args);
}
class A { n = 1; @trace get() { return this.n; } }`,
            answer: 'An arrow function captures the decorator\'s this, and fn(...) is called without a receiver; use a function expression and fn.apply(this, args). Weak fixes bind in the constructor manually. Strong answers use a function expression with apply and keep generic types.',
            solution: `function trace<This, A extends unknown[], R>(fn: (this: This, ...a: A) => R, _ctx: ClassMethodDecoratorContext) {
  return function (this: This, ...args: A): R { return fn.apply(this, args); };
}
class A { n = 1; @trace get() { return this.n; } }`,
          },
          {
            task: 'Write a retry decorator factory for async methods. It takes the number of retries.',
            description: 'Checks decorator factories. Ask how the retry count reaches the decorator.',
            answer: 'A factory returns the decorator; the replacement loops and rethrows the last error. Strong answers mention the factory closure and that it only fits async methods; they may add backoff.',
            solution: `function retry(times: number) {
  return function <This, A extends unknown[], R>(fn: (this: This, ...a: A) => Promise<R>, _ctx: ClassMethodDecoratorContext) {
    return async function (this: This, ...args: A): Promise<R> {
      let last: unknown;
      for (let i = 0; i <= times; i++) {
        try { return await fn.apply(this, args); } catch (e) { last = e; }
      }
      throw last;
    };
  };
}`,
          },
        ],
      },
      {
        q: 'One member has several decorators. In what order are they evaluated and applied?',
        short: 'Decorator expressions are evaluated top to bottom, but applied bottom to top (closest to the member first), like function composition.',
        long: '@a @b method(): a() and b() factories evaluate in order a, b; then b\'s decorator wraps first, then a wraps the result.\nThe outermost (top) decorator runs first at call time because it wraps everything.\nOrder matters for e.g. @log @cache vs @cache @log.\nStrong candidate explains it as composition a(b(method)).\nWeak candidate assumes top-to-bottom application.',
        exercises: [
          {
            task: 'Predict the log order.',
            description: 'Checks evaluation vs application order. Ask the candidate to write the four lines.',
            code: `function d(n: string) { console.log('eval', n); return (v: Function, _c: ClassMethodDecoratorContext) => { console.log('apply', n); }; }
class A { @d('a') @d('b') m() {} }`,
            answer: 'eval a, eval b, apply b, apply a. Expressions evaluate top-down; decorators apply bottom-up.',
          },
          {
            task: 'Choose the right order for the cache and log decorators, so logging happens only on a cache miss.',
            description: 'Checks practical consequences of order. Ask for reasoning.',
            answer: 'Put @cache on top: @cache @log m(). cache wraps log, so log runs only when cache calls through. Strong answers explain composition cache(log(m)).',
          },
        ],
      },
    ],
    senior: [
      {
        q: 'What are the differences between experimentalDecorators and the standard TC39 decorators? What are the risks when you migrate?',
        short: 'They have different signatures and semantics: standard decorators get (value, context), have no parameter decorators and no emitDecoratorMetadata. Frameworks like NestJS and Angular DI still rely on the legacy mode.',
        long: 'Legacy: (target, propertyKey, descriptor), parameter decorators, emitDecoratorMetadata (reflect-metadata) for DI type info.\nStandard (TS 5.0+): (value, context) with kind/name/addInitializer; accessor keyword for auto-accessors; context.metadata / Symbol.metadata since TS 5.2.\nNo parameter decorators in standard → constructor injection by type metadata does not work.\nEvaluation order and field decorator semantics differ (field decorators return initializers, cannot see a descriptor).\nMigration risk: libraries written for one mode break in the other; flipping the flag changes behaviour project-wide.\nStrong candidate checks framework support and migrates per package with tests.\nWeak candidate thinks only the syntax changed.',
        exercises: [
          {
            task: 'Predict whether this compiles with standard decorators, with experimentalDecorators turned off.',
            description: 'Checks knowledge that standard decorators dropped parameter decorators. Ask for a prediction.',
            code: `function inject(_t: object, _k: string | symbol | undefined, _i: number) {}
class Svc { constructor(@inject private db: object) {} }`,
            answer: 'It does not compile: standard decorators do not support parameter decorators; this requires experimentalDecorators. Many assume it works as in NestJS. Strong answers explain that framework DI still requires experimentalDecorators.',
          },
          {
            task: 'Attach metadata with standard decorators and read it from the class.',
            description: 'Checks standard decorator metadata (TS 5.2). Ask where the metadata is stored.',
            answer: 'TS 5.2+ exposes context.metadata, stored on Class[Symbol.metadata] (needs a Symbol.metadata polyfill in older runtimes). Strong answers mention the polyfill need and the lib setting esnext.decorators.',
            solution: `(Symbol as any).metadata ??= Symbol('Symbol.metadata');
function route(path: string) {
  return (_v: unknown, ctx: ClassMethodDecoratorContext) => { ctx.metadata[String(ctx.name)] = path; };
}
class Ctrl { @route('/users') list() {} }
console.log(Ctrl[Symbol.metadata]); // { list: '/users' }`,
          },
        ],
      },
      {
        q: 'Fix this field decorator. It tries to read the descriptor, but standard field decorators do not get one.',
        code: `function min(n: number) {
  return function (_v: undefined, ctx: ClassFieldDecoratorContext) {
    const d = Object.getOwnPropertyDescriptor(ctx, 'value'); // nonsense
  };
}
class Form { @min(3) name = ''; }`,
        short: 'Standard field decorators receive undefined as the value and may return an initializer function that transforms the initial value; to intercept later writes use an auto-accessor.',
        long: 'Fields have no descriptor at decoration time (they are defined per instance).\nThe returned initializer runs for each instance with the initial value.\nTo validate every assignment use accessor fields with get/set replacement.\nStrong candidate knows initializer vs accessor decorators.\nWeak candidate tries to use legacy descriptor tricks.',
        fix: `function min(n: number) {
  return function <T>(_v: undefined, ctx: ClassFieldDecoratorContext<T, string>) {
    return function (this: T, initial: string): string {
      if (initial.length < n) throw new Error(\`\${String(ctx.name)} must be >= \${n} chars\`);
      return initial;
    };
  };
}
class Form { @min(3) name = 'Ann'; }`,
        exercises: [
          {
            task: 'Validate every assignment, not just the initial value.',
            description: 'Checks auto-accessor decorators. Ask what changes in the class.',
            answer: 'Use the accessor keyword and return a set wrapper; plain fields cannot intercept writes in standard decorators.',
            solution: `function nonEmpty<T>(t: ClassAccessorDecoratorTarget<T, string>, _c: ClassAccessorDecoratorContext<T, string>) {
  return { set(this: T, v: string) { if (!v) throw new Error('empty'); t.set.call(this, v); } };
}
class F { @nonEmpty accessor name = 'x'; }`,
          },
          {
            task: 'Predict what ctx.kind is for each decorator.',
            description: 'Checks the context.kind values. Ask for all four.',
            code: 'class A { @d static s() {} @d m() {} @d f = 1; @d accessor a = 1; }',
            answer: '"method", "method" (with static: true), "field", "accessor". Strong answers mention "getter", "setter" and "class" kinds too.',
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'Would you allow decorators in a React codebase? Explain why.',
        short: 'Usually no: hooks and higher-order functions fit React better, while decorators add build configuration, legacy/standard ambiguity and class-based patterns. Exceptions (e.g. MobX stores) are documented.',
        long: 'Modern React is function components and hooks; decorators only apply to classes.\nTooling cost: Babel/SWC/esbuild decorator config, two incompatible modes, library compatibility.\nHidden behaviour: decorators make data flow less explicit for newcomers.\nValid exceptions: MobX class stores, DI containers in non-UI layers — scoped and documented.\nDecision via ADR, enforce with lint (e.g. no decorators outside /stores).\nStrong candidate weighs team skills, tooling and consistency.\nWeak candidate answers with personal taste only.',
        ai: true,
        exercises: [
          {
            task: 'Convert a MobX-style decorated store to a decorator-free version.',
            description: 'Checks pragmatic migration away from decorators. Ask what build config disappears.',
            code: 'class Store { @observable count = 0; @action inc() { this.count++; } }',
            answer: 'makeAutoObservable infers observables and actions without decorators, removing build configuration requirements. Strong answers mention makeObservable for explicit annotations and the tradeoff of inference.',
            solution: `import { makeAutoObservable } from 'mobx';
class Store {
  count = 0;
  constructor() { makeAutoObservable(this); }
  inc() { this.count++; }
}`,
          },
          {
            task: 'Write an ESLint rule that forbids decorators outside the src stores folder.',
            description: 'Checks enforcing an architectural policy with lint. Ask how exceptions are approved.',
            answer: 'no-restricted-syntax on the Decorator node, with an override for the allowed folder, makes the policy enforceable. Strong answers combine the rule with a documented ADR; weak answers rely on review.',
            solution: `export default [
  { rules: { 'no-restricted-syntax': ['error', { selector: 'Decorator', message: 'Decorators only in src/stores' }] } },
  { files: ['src/stores/**'], rules: { 'no-restricted-syntax': 'off' } },
];`,
          },
        ],
      },
      {
        q: 'Fix the NestJS-style dependency injection. It breaks after you turn on TS 5 standard decorators.',
        code: `// tsconfig: experimentalDecorators removed
@Injectable()
class UsersService { constructor(private repo: UsersRepo) {} }`,
        short: 'Constructor injection by type relies on emitDecoratorMetadata, which only exists with legacy decorators; keep experimentalDecorators for such frameworks until they support standard decorators.',
        long: 'Standard decorators have no parameter decorators or design:paramtypes metadata.\nFlipping the flag silently breaks DI resolution at runtime.\nPlan: pin legacy mode per package, track framework roadmap, test DI wiring in CI.\nStrong candidate checks framework compatibility before flipping flags.\nWeak candidate removes the flag repo-wide.',
        fix: `// tsconfig.json
// { "compilerOptions": { "experimentalDecorators": true, "emitDecoratorMetadata": true } }
@Injectable()
class UsersService { constructor(private repo: UsersRepo) {} }`,
        ai: true,
        exercises: [
          {
            task: 'Write a CI smoke test that catches broken dependency injection setup.',
            description: 'Checks protecting against runtime-only failures. Ask what it asserts.',
            answer: 'Bootstrapping the module in a test and resolving key providers fails fast if metadata is missing.',
            solution: `// test: const app = await NestFactory.createApplicationContext(AppModule);
// expect(app.get(UsersService)).toBeDefined();`,
          },
          {
            task: 'In a monorepo, decide which decorator mode each package uses.',
            description: 'Checks scoping compiler options. Ask how it is configured.',
            answer: 'Each package tsconfig sets its own decorator flags; a shared base config omits them. Strong answers document which packages are legacy and why.',
          },
        ],
      },
    ],
  },
  'Union and Intersection Types': {
    junior: [
      {
        q: 'Why does this fail? Fix it.',
        code: 'function format(id: string | number) { return id.toUpperCase(); }',
        short: 'On a union you can only use members common to all types; toUpperCase exists only on string, so narrow with typeof first.',
        long: 'A union A | B means the value could be either, so only shared members are allowed.\nNarrowing: typeof, instanceof, in, equality, truthiness, discriminant properties and custom type guards.\nAfter narrowing, TS knows the specific type in that branch via control flow analysis.\nPitfall: casting with as string hides the bug at runtime for numbers.\nStrong candidate lists several narrowing techniques.\nWeak candidate uses as any.',
        fix: `function format(id: string | number): string {
  return typeof id === 'string' ? id.toUpperCase() : String(id);
}`,
        exercises: [
          {
            task: 'Fix the error by narrowing.',
            description: 'Checks union narrowing. Ask which check works for arrays.',
            code: 'function len(x: string | string[]) { return x.toUpperCase().length; }',
            answer: 'toUpperCase exists only on string; narrow with Array.isArray or typeof. Wrong answers use typeof x === "array". Strong answers use Array.isArray.',
            solution: `function len(x: string | string[]): number {
  return Array.isArray(x) ? x.join('').length : x.length;
}`,
          },
          {
            task: 'Write a type that combines Named and Aged and create a value of it.',
            description: 'Checks intersections. Ask what happens if a property is missing.',
            answer: 'An intersection requires all members of both types. Strong answers explain that all properties of both types are required.',
            solution: `type Named = { name: string };
type Aged = { age: number };
const p: Named & Aged = { name: 'Ann', age: 30 };`,
          },
        ],
      },
      {
        q: 'What is the difference between a union type and an intersection type?',
        short: 'A union (A | B) is a value that is one of the types; an intersection (A & B) is a value that is all of them at once.',
        long: 'Union: fewer guaranteed members, must narrow before using type-specific ones.\nIntersection: combines members of object types; conflicting primitives become never.\nLiteral unions ("a" | "b") model fixed sets of values.\nStrong candidate gives examples and mentions narrowing.\nWeak candidate mixes them up.',
        exercises: [
          {
            task: 'Write a union of string literals for button sizes and use it.',
            description: 'Checks literal unions. Ask what happens with an invalid value.',
            answer: 'A literal union restricts values to the listed strings; "xl" is a compile error.',
            solution: `type Size = 'sm' | 'md' | 'lg';
function button(size: Size) { return size; }
button('md');
// button('xl'); // Error`,
          },
          {
            task: 'Predict whether this compiles.',
            description: 'Checks union property access. Ask for the error.',
            code: `type A = { a: number }; type B = { b: string };
function f(x: A | B) { return x.a; }`,
            answer: 'It does not compile: a exists only on A. Use "a" in x to narrow.',
          },
        ],
      },
    ],
    middle: [
      {
        q: 'Model request state so data and error can never exist at the same time. Handle every case.',
        code: 'type State = { loading: boolean; data?: User; error?: string };',
        short: 'Use a discriminated union with a literal status field, and an assertNever(never) default branch so adding a new state becomes a compile error until handled.',
        long: 'The optional-flags version allows impossible combinations (loading with data and error).\nA discriminated union has a common literal property; checking it narrows to one variant.\nIn the default branch the value is never when all cases are handled; passing it to assertNever enforces exhaustiveness.\nAlternatively: const _x: never = s, or the switch-exhaustiveness-check lint rule.\nPitfall: using boolean flags as discriminants for more than two states.\nStrong candidate mentions "make illegal states unrepresentable".\nWeak candidate adds runtime ifs without changing the type.',
        fix: `type User = { id: string; name: string };
type State =
  | { status: 'loading' }
  | { status: 'success'; data: User }
  | { status: 'error'; error: string };

function assertNever(x: never): never {
  throw new Error(\`Unexpected state: \${JSON.stringify(x)}\`);
}

function render(s: State): string {
  switch (s.status) {
    case 'loading': return 'Loading...';
    case 'success': return s.data.name;
    case 'error': return s.error;
    default: return assertNever(s);
  }
}`,
        exercises: [
          {
            task: 'Add a new state and let the compiler find every place that must handle it.',
            description: 'Checks exhaustiveness checking. Have the candidate add the state and observe the error.',
            code: `type Req = { s: 'idle' } | { s: 'done'; data: string };
function view(r: Req) {
  switch (r.s) { case 'idle': return '-'; case 'done': return r.data; default: { const x: never = r; return x; } }
}`,
            answer: 'Adding { s: \'error\' } makes the default branch receive a non-never value, producing a compile error until a case is added. Strong answers explain that the never assignment fails as soon as a variant is unhandled.',
            solution: `type Req = { s: 'idle' } | { s: 'done'; data: string } | { s: 'error'; msg: string };
function view(r: Req): string {
  switch (r.s) {
    case 'idle': return '-';
    case 'done': return r.data;
    case 'error': return r.msg;
    default: { const x: never = r; return x; }
  }
}`,
          },
          {
            task: 'The condition is saved in a variable first. Predict whether narrowing still works here.',
            description: 'Checks control flow analysis of aliased conditions. Ask whether it compiles.',
            code: `type R = { ok: true; value: number } | { ok: false; error: string };
function f(r: R) { const ok = r.ok; if (ok) return r.value; }`,
            answer: 'This compiles in TS 4.4+ (aliased conditions narrow const references). It fails if ok is declared with let or r is reassigned; keep the discriminant as a const or check r.ok directly. Many say it fails; since TS 4.4 it compiles. Strong answers know the const requirement.',
            solution: `type R = { ok: true; value: number } | { ok: false; error: string };
function f(r: R) { if (r.ok) return r.value; return r.error; }`,
          },
        ],
      },
      {
        q: 'Fix the type guard: filter does not narrow the array.',
        code: `type Item = { id: string } | null;
const items: Item[] = [{ id: '1' }, null];
const ids = items.filter(i => i !== null).map(i => i.id);`,
        short: 'Before TS 5.5 a plain arrow did not narrow through filter; a type predicate does. TS 5.5 infers predicates for simple cases like this, so it compiles there too.',
        long: 'filter has an overload taking a type predicate (value is S) that returns S[].\nTS 5.5 added inferred type predicates, so i => i !== null now narrows automatically.\nInference fails for more complex callbacks (e.g. truthiness on numbers where 0 is falsy).\nStrong candidate knows both the explicit predicate and the 5.5 change.\nWeak candidate uses a non-null assertion in map.',
        fix: `type Item = { id: string } | null;
const items: Item[] = [{ id: '1' }, null];
const ids = items.filter((i): i is { id: string } => i !== null).map(i => i.id);`,
        exercises: [
          {
            task: 'Does TypeScript 5.5 infer a type predicate here? Predict the answer.',
            description: 'Checks limits of inferred predicates. Ask why.',
            code: 'const xs = [0, 1, undefined].filter(x => !!x);',
            answer: 'No: !!x also removes 0, so "x is number" would be wrong in the false branch; TS keeps (number | undefined)[]. Use x !== undefined.',
          },
          {
            task: 'Write a reusable isDefined helper.',
            description: 'Checks generic type predicates. Ask for usage.',
            answer: 'A generic predicate removes null and undefined for any type.',
            solution: `const isDefined = <T,>(v: T | null | undefined): v is T => v != null;
const xs = [1, null, 2].filter(isDefined); // number[]`,
          },
        ],
      },
    ],
    senior: [
      {
        q: 'What is the type of X and Y? Explain.',
        code: `type X = { a: string } & { a: number };
type Y = (string | number) & (number | boolean);`,
        short: 'X.a is string & number, which is never, so X cannot be constructed (TS keeps X as an object type with a: never). Y distributes to number.',
        long: 'Intersection of object types merges properties; overlapping properties are intersected.\nstring & number is never, so X.a: never — no value can satisfy it.\nFor conflicting literal (discriminant) properties, e.g. { k: "a" } & { k: "b" }, TS 3.9+ reduces the whole intersection to never.\nY: intersection distributes over unions: (string & number) | (string & boolean) | (number & number) | (number & boolean) → number.\nUnion = "either" (fewer guarantees, more values); intersection = "both" (more guarantees, fewer values).\nStrong candidate reasons with set theory and knows the discriminant reduction rule.\nWeak candidate guesses X.a is string | number.',
        exercises: [
          {
            task: 'Write a type that requires exactly one of two properties.',
            description: 'Checks modelling mutually exclusive props. Ask what error the both-props value gives.',
            answer: 'Use a union where each branch forbids the other key via ?: never. Weak answers use two optional fields. Strong answers explain ?: never and mention an XOR helper type.',
            solution: `type OneOf = { id: string; email?: never } | { email: string; id?: never };
const a: OneOf = { id: '1' };
// const b: OneOf = { id: '1', email: 'x' }; // Error`,
          },
          {
            task: 'Predict the type of T.',
            description: 'Checks keyof on unions vs intersections. Ask for the type.',
            code: 'type T = keyof ({ a: 1; b: 2 } | { b: 3; c: 4 });',
            answer: 'T is "b": keyof a union gives only the keys common to all members (keyof of an intersection would give the union of keys). Many answer "a" | "b" | "c". Strong answers explain the common-keys rule.',
          },
        ],
      },
      {
        q: 'Fix the function. The return type should depend on the argument type, not always be a union.',
        code: `function parse(input: string | number): string | number {
  return typeof input === 'string' ? input.trim() : input * 2;
}
const n = parse(2); // string | number`,
        short: 'Use overloads (or a conditional generic return type) so each input type maps to its own output type.',
        long: 'A union in and union out loses correlation between input and output.\nOverloads give precise call-site types; the implementation signature is hidden.\nConditional return types (T extends string ? string : number) need casts in the body.\nTS 5.8 added limited checking of conditional returns, but overloads remain the clearest.\nStrong candidate compares overloads vs conditional types.\nWeak candidate casts at every call site.',
        fix: `function parse(input: string): string;
function parse(input: number): number;
function parse(input: string | number): string | number {
  return typeof input === 'string' ? input.trim() : input * 2;
}
const n = parse(2); // number`,
        exercises: [
          {
            task: 'Write the same function with a conditional return type.',
            description: 'Checks conditional return types. Ask why a cast is needed.',
            answer: 'TS cannot verify each branch against an unresolved conditional type, so the body needs a cast.',
            solution: `function parse<T extends string | number>(x: T): T extends string ? string : number {
  return (typeof x === 'string' ? x.trim() : x * 2) as T extends string ? string : number;
}`,
          },
          {
            task: 'Predict the call result with a union argument.',
            description: 'Checks overload resolution with unions. Ask for the error.',
            code: `function f(x: string): string;
function f(x: number): number;
function f(x: any) { return x; }
declare const v: string | number;
f(v);`,
            answer: 'It errors: no single overload accepts string | number. Add a third overload for the union.',
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'How do you design types for API errors in the whole app? Compare Result types and exceptions.',
        short: 'Choose deliberately: Result<T, E> unions make expected failures explicit in types, exceptions suit unexpected ones. Map errors once at the boundary and keep UI handling consistent.',
        long: 'TS cannot type thrown errors (catch gives unknown), so expected failures (validation, 404, conflict) benefit from Result unions.\nUnexpected failures (network down, bugs) can still throw and be caught by error boundaries / global handlers.\nBoundary mapping: the API client converts HTTP responses into a typed AppError union.\nConsistency: one Result helper or library (neverthrow, Effect) — not a mix of styles per feature.\nUI: shared patterns for toasts, inline errors, retry.\nStrong candidate reasons about trade-offs (verbosity vs safety) and team adoption.\nWeak candidate picks one dogmatically.',
        ai: true,
        exercises: [
          {
            task: 'Write a small Result helper with a map function for the team.',
            description: 'Checks designing a minimal shared abstraction. Ask how the team would adopt it.',
            answer: 'Keeping the helper tiny and well-typed encourages consistent use without adopting a big library. Strong answers keep the helper tiny and discuss when a library is justified.',
            solution: `type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
const err = <E>(error: E): Result<never, E> => ({ ok: false, error });
function map<T, U, E>(r: Result<T, E>, f: (t: T) => U): Result<U, E> {
  return r.ok ? ok(f(r.value)) : r;
}`,
          },
          {
            task: 'Where API data enters the app, turn unknown thrown values into a typed union of errors.',
            description: 'Checks normalizing unknown errors at a boundary. Ask why catch gives unknown.',
            code: 'async function load() { try { return await fetch(\'/x\'); } catch (e) { throw e; } }',
            answer: 'Normalize unknown into a known AppError once so UI code switches on a typed union instead of guessing. Strong answers mention useUnknownInCatchVariables and a single mapping function.',
            solution: `type AppError = { kind: 'network'; message: string } | { kind: 'unknown' };
function toAppError(e: unknown): AppError {
  return e instanceof TypeError ? { kind: 'network', message: e.message } : { kind: 'unknown' };
}
async function load(): Promise<Response | AppError> {
  try { return await fetch('/x'); } catch (e) { return toAppError(e); }
}`,
          },
        ],
      },
      {
        q: 'Fix the props type so invalid combinations are rejected.',
        code: `type ButtonProps = { href?: string; onClick?: () => void; disabled?: boolean };
// allowed: <Button href="/x" onClick={...} disabled />`,
        short: 'Model mutually exclusive props as a union with ?: never so a link cannot also be a disabled button with a click handler.',
        long: 'All-optional props allow nonsense combinations that crash or confuse.\nUnion + never makes illegal states unrepresentable at the call site.\nTrade-off: error messages get noisier; document the pattern.\nStrong candidate relates it to design-system API quality.\nWeak candidate adds runtime warnings only.',
        fix: `type LinkProps = { href: string; onClick?: never; disabled?: never };
type ActionProps = { onClick: () => void; href?: never; disabled?: boolean };
type ButtonProps = LinkProps | ActionProps;`,
        ai: true,
        exercises: [
          {
            task: 'Predict whether this compiles.',
            description: 'Checks the never trick. Ask for the error.',
            code: `type P = { href: string; onClick?: never } | { onClick: () => void; href?: never };
const p: P = { href: '/', onClick: () => {} };`,
            answer: 'It does not compile: neither branch allows both props.',
          },
          {
            task: 'Write a reusable XOR helper type.',
            description: 'Checks generalizing the pattern. Ask for usage.',
            answer: 'Map the other type\'s keys to never in each branch.',
            solution: `type Without<T, U> = { [K in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = (T & Without<U, T>) | (U & Without<T, U>);
type Props = XOR<{ href: string }, { onClick: () => void }>;`,
          },
        ],
      },
    ],
  },
  Enums: {
    junior: [
      {
        q: 'What is an enum? What is the difference between numeric and string enums?',
        short: 'An enum is a named set of constants that exists at runtime. Numeric enums auto-increment and have reverse mapping; string enums need explicit values and are more readable in logs.',
        long: 'Enums are one of the few TS features that emit JavaScript (an object).\nNumeric: Red = 0, Green = 1, ...; reverse mapping Color[0] === "Red".\nString: each member must be initialized; no reverse mapping; values are meaningful when serialized.\nString enums are nominal-ish: a plain "active" string is not assignable to Status.\nPitfall: numeric enum values in APIs are unreadable and fragile if members are reordered.\nStrong candidate mentions runtime emission and reverse mapping.\nWeak candidate thinks enums are type-only.',
        exercises: [
          {
            task: 'Predict the values of each member.',
            description: 'Checks numeric enum auto-increment. Ask for each value.',
            code: 'enum Level { Low = 1, Mid, High = 10, Max }',
            answer: 'Low = 1, Mid = 2, High = 10, Max = 11: numeric members auto-increment from the previous value. Many think Max is 4. Strong answers explain increments from the previous member.',
          },
          {
            task: 'Convert this numeric enum into a string enum so logs are readable.',
            description: 'Checks string enums. Ask why they are better for logs and APIs.',
            code: 'enum Role { Admin, User }',
            answer: 'String enums require explicit initializers and serialize to meaningful values. Strong answers mention no reverse mapping and stable values.',
            solution: 'enum Role { Admin = \'admin\', User = \'user\' }',
          },
        ],
      },
      {
        q: 'Fix the error: the function receives a string but expects an enum.',
        code: `enum Color { Red = 'red', Blue = 'blue' }
function paint(c: Color) {}
paint('red');`,
        short: 'String enum types only accept their members, not raw strings with the same value; pass Color.Red.',
        long: 'String enums are nominal-ish: "red" is not assignable to Color.\nThis is a common surprise when values come from APIs.\nAlternative: a union type "red" | "blue" accepts plain strings.\nStrong candidate mentions the union alternative.\nWeak candidate casts with as Color everywhere.',
        fix: `enum Color { Red = 'red', Blue = 'blue' }
function paint(c: Color) {}
paint(Color.Red);`,
        exercises: [
          {
            task: 'Iterate over all values of a string enum.',
            description: 'Checks runtime enum objects. Ask for the output.',
            code: 'enum Dir { Up = \'UP\', Down = \'DOWN\' }',
            answer: 'Object.values gives ["UP", "DOWN"]; string enums have no reverse mapping.',
            solution: `enum Dir { Up = 'UP', Down = 'DOWN' }
const all = Object.values(Dir); // Dir[]`,
          },
          {
            task: 'Predict the output.',
            description: 'Checks reverse mapping. Ask for both lines.',
            code: `enum N { A, B }
console.log(N.B, N[1]);`,
            answer: '1 "B": numeric enums have reverse mapping from value to name.',
          },
        ],
      },
    ],
    middle: [
      {
        q: 'What is the output and why is it surprising?',
        code: `enum Color { Red, Green }
console.log(Object.keys(Color));
const c: Color = 42; // compiles?`,
        short: 'Object.keys gives ["0", "1", "Red", "Green"] because of reverse mapping. Since TS 5.0 assigning the out-of-range literal 42 is an error, though arbitrary number variables are still accepted.',
        long: 'Numeric enums compile to an object with both name→value and value→name entries, so iterating keys yields both (integer-like keys first).\nTo list names: Object.keys(Color).filter(k => Number.isNaN(Number(k))).\nBefore TS 5.0 any number was assignable to a numeric enum; TS 5.0 made all enums union enums, so a literal not matching any member errors.\nA non-literal number (const n: number = 42; const c: Color = n) still compiles — a hole in type safety.\nString enums do not have these issues.\nStrong candidate knows the reverse mapping and the TS 5.0 change.\nWeak candidate expects ["Red", "Green"].',
        exercises: [
          {
            task: 'Write a function that safely converts an API string into a string enum member.',
            description: 'Checks safe conversion from external strings. Ask why a cast is insufficient.',
            code: 'enum Status { Active = \'active\', Archived = \'archived\' }',
            answer: 'Check membership against Object.values at runtime; a cast alone would accept any string. Weak answers use `as Status`. Strong answers validate at runtime.',
            solution: `enum Status { Active = 'active', Archived = 'archived' }
function toStatus(v: string): Status | undefined {
  return (Object.values(Status) as string[]).includes(v) ? (v as Status) : undefined;
}`,
          },
          {
            task: 'Predict whether this compiles.',
            description: 'Checks nominal behaviour of enums. Ask for a prediction.',
            code: `enum A { X = 'x' }
enum B { X = 'x' }
const a: A = B.X;`,
            answer: 'It does not compile: enums are nominal, so B.X is not assignable to A even though the values are equal. Many assume equal values make them compatible. Strong answers explain enum nominality.',
          },
        ],
      },
      {
        q: 'Why do many teams prefer union literal types over enums in modern TS?',
        short: 'Unions are zero-cost, work with plain strings from APIs, are erasable (Node type stripping, erasableSyntaxOnly) and avoid enum quirks like reverse mapping and nominal typing.',
        long: 'Enums emit runtime code and are not tree-shakable as well.\nUnion literals compile away completely.\nPlain API strings are assignable to unions without casts.\nWhen runtime values are needed, an as const object provides both.\nStrong candidate mentions erasableSyntaxOnly and isolatedModules.\nWeak candidate says enums are deprecated (they are not).',
        exercises: [
          {
            task: 'Convert this enum into an as const object with a type.',
            description: 'Checks the modern replacement. Ask for the call sites.',
            code: 'enum Role { Admin = \'admin\', User = \'user\' }',
            answer: 'Call sites (Role.Admin) stay the same and plain strings become assignable.',
            solution: `const Role = { Admin: 'admin', User: 'user' } as const;
type Role = (typeof Role)[keyof typeof Role];`,
          },
          {
            task: 'Predict whether this compiles.',
            description: 'Checks union assignability. Ask why.',
            code: `type Role = 'admin' | 'user';
const fromApi: string = 'admin';
const r: Role = fromApi;`,
            answer: 'It does not compile: string is wider than Role. Validate at runtime before assigning.',
          },
        ],
      },
    ],
    senior: [
      {
        q: 'Compare enum, const enum, union of literals, and an `as const` object. Think about bundle size, isolatedModules, and runtime.',
        short: 'Enums emit runtime code and tree-shake poorly; const enum is inlined but breaks with isolatedModules/Babel/esbuild across files; union literals are zero-cost but have no runtime values; an as const object gives both runtime values and a union type.',
        long: 'enum: runtime object (IIFE), poorly tree-shaken, nominal-ish typing, numeric pitfalls.\nconst enum: inlined at compile time, but single-file transpilers cannot see other files; isolatedModules restricts them and libraries should never ship them.\nUnion literal type: no runtime cost, great with discriminated unions, but you cannot iterate values.\nas const object: plain JS, iterable, tree-shakable, compatible with erasableSyntaxOnly / Node type stripping (TS 5.8).\nTrend: many teams ban enums in favour of as const objects.\nStrong candidate mentions isolatedModules and erasable syntax.\nWeak candidate only discusses syntax preference.',
        fix: `const Status = { Active: 'active', Archived: 'archived' } as const;
type Status = (typeof Status)[keyof typeof Status]; // 'active' | 'archived'

function isStatus(v: string): v is Status {
  return (Object.values(Status) as string[]).includes(v);
}`,
        exercises: [
          {
            task: 'Replace the enum, so the code works with erasableSyntaxOnly and with Node type stripping.',
            description: 'Checks erasable syntax. Ask which call sites change.',
            code: 'export enum Theme { Light = \'light\', Dark = \'dark\' }',
            answer: 'Enums emit runtime code; an as const object plus a derived union type is erasable and keeps the same call sites. Strong answers note call sites stay the same and the type is a union of values.',
            solution: `export const Theme = { Light: 'light', Dark: 'dark' } as const;
export type Theme = (typeof Theme)[keyof typeof Theme];`,
          },
          {
            task: 'This const enum is imported from another file. Explain why it breaks a Vite or esbuild build.',
            description: 'Checks const enum with isolated transpilers. Ask what the bundle contains.',
            code: `// colors.ts
export const enum Color { Red = 'red' }
// app.ts
import { Color } from './colors';
console.log(Color.Red);`,
            answer: 'esbuild transpiles files in isolation and cannot inline values from another file, so Color is imported as a runtime binding that does not exist. Use a regular enum or an as const object (isolatedModules flags it). Strong answers explain esbuild limits and isolatedModules.',
          },
        ],
      },
      {
        q: 'Fix the exhaustive switch. Adding a new enum member does not give a compile error.',
        code: `enum Plan { Free = 'free', Pro = 'pro' }
function price(p: Plan): number {
  switch (p) {
    case Plan.Free: return 0;
    case Plan.Pro: return 10;
  }
  return 0;
}`,
        short: 'The fallback return 0 hides unhandled members; assigning to never in default makes new members a compile error.',
        long: 'Enums and unions both support exhaustiveness via never.\nA silent default turns a missing case into a wrong price at runtime.\nAlternatively enable @typescript-eslint/switch-exhaustiveness-check.\nStrong candidate mentions both tools.\nWeak candidate keeps the default return.',
        fix: `enum Plan { Free = 'free', Pro = 'pro' }
function price(p: Plan): number {
  switch (p) {
    case Plan.Free: return 0;
    case Plan.Pro: return 10;
    default: {
      const unreachable: never = p;
      throw new Error(\`Unknown plan \${unreachable}\`);
    }
  }
}`,
        exercises: [
          {
            task: 'Use a Record to force handling of every enum member.',
            description: 'Checks Record-based exhaustiveness. Ask what happens when a member is added.',
            answer: 'Record<Plan, number> requires a key for every member; adding a member errors until a price is added.',
            solution: `enum Plan { Free = 'free', Pro = 'pro' }
const PRICES: Record<Plan, number> = { [Plan.Free]: 0, [Plan.Pro]: 10 };`,
          },
          {
            task: 'Predict whether this compiles under isolatedModules.',
            description: 'Checks declare const enum limitations. Ask why.',
            code: `declare const enum E { A = 1 }
console.log(E.A);`,
            answer: 'It errors under isolatedModules: ambient const enums cannot be inlined by single-file transpilers.',
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'The backend sends new enum values without warning, and the UI crashes. How do you make the frontend safe against this?',
        short: 'Always handle an unknown value with a fallback, validate responses at runtime, generate types from the API contract, and agree on a versioning/additive-change policy with the backend.',
        long: 'Treat enums from the network as open sets: type them as Known | (string & {}) or validate and map unknown to "unknown".\nRender fallbacks instead of throwing in switch defaults on the UI path; log/monitor unknown values.\nRuntime validation (e.g. zod with .catch) at the API boundary.\nCodegen from OpenAPI keeps types in sync; contract tests (Pact) catch drift in CI.\nProcess: backend announces additive changes; frontend deploys tolerant code first.\nStrong candidate combines code resilience with process.\nWeak candidate only says "ask backend to tell us".',
        ai: true,
        exercises: [
          {
            task: 'Type a backend status. Known values should autocomplete, but unknown values must not break the build or the UI.',
            description: 'Checks typing open sets of values. Ask why (string & {}) instead of string.',
            answer: 'The (string & {}) trick keeps literal autocomplete while accepting any string; the UI must render a fallback. Strong answers explain that plain string collapses the union and loses autocomplete.',
            solution: `type OrderStatus = 'new' | 'paid' | 'shipped' | (string & {});
const LABELS: Record<string, string> = { new: 'New', paid: 'Paid', shipped: 'Shipped' };
const label = (s: OrderStatus): string => LABELS[s] ?? 'Unknown';`,
          },
          {
            task: 'Write a zod schema. Unknown enum values should become a fallback value instead of failing.',
            description: 'Checks resilient validation. Ask what is logged when unknown appears.',
            answer: '.catch() on the enum replaces invalid input with a default, keeping parsing resilient. Strong answers add monitoring for unknown values.',
            solution: `import { z } from 'zod';
const Status = z.enum(['active', 'archived', 'unknown']).catch('unknown');
Status.parse('deleted'); // 'unknown'`,
          },
        ],
      },
      {
        q: 'Fix the shared package. It exports a const enum, and apps built with Vite use it.',
        code: `// @acme/constants
export const enum Status { Active = 'active', Archived = 'archived' }`,
        short: 'Libraries must not ship const enums: consumers using isolated transpilers cannot inline them, and preserveConstEnums creates mismatches. Export a runtime object plus a union type.',
        long: 'const enum values are inlined only by tsc with full program info.\nVite/esbuild/SWC treat them as imports of a non-existent runtime value.\nas const objects work everywhere and are tree-shakable.\nRoll out as a minor version with the same member names to avoid breakage.\nStrong candidate considers consumers\' toolchains.\nWeak candidate tells consumers to switch to tsc.',
        fix: `// @acme/constants
export const Status = { Active: 'active', Archived: 'archived' } as const;
export type Status = (typeof Status)[keyof typeof Status];`,
        ai: true,
        exercises: [
          {
            task: 'Write a lint rule that bans enums repo-wide.',
            description: 'Checks enforcement. Ask about exceptions.',
            answer: 'no-restricted-syntax on TSEnumDeclaration bans all enums; scope exceptions by file pattern.',
            solution: 'export default [{ rules: { \'no-restricted-syntax\': [\'error\', { selector: \'TSEnumDeclaration\', message: \'Use as const objects\' }] } }];',
          },
          {
            task: 'Turn on a compiler flag that reports enums and other syntax that cannot simply be erased.',
            description: 'Checks TS 5.8 erasableSyntaxOnly. Ask what else it flags.',
            answer: 'erasableSyntaxOnly errors on enums, namespaces with values, parameter properties and import = aliases.',
            solution: '// tsconfig.json: { "compilerOptions": { "erasableSyntaxOnly": true } }',
          },
        ],
      },
    ],
  },
  'Class, Prototyping': {
    junior: [
      {
        q: 'Does TypeScript change how classes work at runtime?',
        short: 'No. Types are erased and compiled JS uses normal prototype-based classes; only a few features (parameter properties, enums, decorators, namespaces) emit extra code.',
        long: 'TS classes compile to ES classes (or functions + prototypes for old targets).\nMethods live on the prototype; fields are own properties of each instance.\nType annotations, interfaces, implements, access modifiers (except #) and abstract leave no trace at runtime.\nEmitting features: enums, namespaces, parameter properties, decorators; useDefineForClassFields affects field semantics.\nTS 5.8 erasableSyntaxOnly flags emitting features for Node type stripping.\nStrong candidate knows which features emit code.\nWeak candidate thinks TS adds runtime type checks.',
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks that methods are shared on the prototype. Ask for the output.',
            code: `class A { hi() { return 'hi'; } }
const a1 = new A(), a2 = new A();
console.log(a1.hi === a2.hi);`,
            answer: 'true: methods live on A.prototype and are shared by all instances. Strong answers explain memory implications of per-instance functions.',
          },
          {
            task: 'Predict the output and explain the difference.',
            description: 'Checks arrow function fields vs methods. Ask for both values.',
            code: `class A { hi = () => 'hi'; }
console.log(new A().hi === new A().hi, Object.hasOwn(new A(), 'hi'));`,
            answer: 'false, true: arrow function fields are created per instance as own properties, not on the prototype. Strong answers note arrow fields fix this-binding but cost memory and cannot be overridden via super.',
          },
        ],
      },
      {
        q: 'Fix the lost `this` when passing a method as a callback.',
        code: `class Counter {
  count = 0;
  inc() { this.count++; }
}
const c = new Counter();
setTimeout(c.inc, 0); // TypeError or wrong this`,
        short: 'Prototype methods do not bind this; when passed as a callback they lose the instance. Use an arrow function field, bind, or wrap in a lambda.',
        long: 'Methods live on the prototype and get this from the call site.\nArrow fields capture this lexically per instance.\nAlternatives: setTimeout(() => c.inc()) or c.inc.bind(c).\nTS can warn via noImplicitThis and this parameters.\nStrong candidate explains why and lists trade-offs (memory of arrow fields).\nWeak candidate only knows "use bind".',
        fix: `class Counter {
  count = 0;
  inc = (): void => { this.count++; };
}
const c = new Counter();
setTimeout(c.inc, 0);`,
        exercises: [
          {
            task: 'Add a `this` parameter, so wrong use gives a compile error.',
            description: 'Checks this parameters. Ask for the error.',
            code: `class A { n = 1; get(this: A) { return this.n; } }
const g = new A().get;
g();`,
            answer: 'The call g() errors because this would be void, not A. this parameters are erased at runtime.',
          },
          {
            task: 'Predict the output.',
            description: 'Checks prototype lookup. Ask why.',
            code: `class A {}
(A.prototype as any).hello = () => 'hi';
console.log((new A() as any).hello());`,
            answer: '"hi": instances look up missing properties on the prototype. TS does not know about it without declaration merging.',
          },
        ],
      },
    ],
    middle: [
      {
        q: 'Type a mixin function that adds timestamps to any class.',
        short: 'Accept a generic constructor type B extends new (...args: any[]) => {} and return class extends Base, so the result has both the base members and the added ones.',
        long: 'TS requires a mixin base constructor to have a single rest parameter of type any[].\nThe returned class expression type is inferred as B & the new members.\nMixins can be composed: Timestamped(Activatable(User)).\nYou can constrain the base: B extends Ctor<{ id: string }> to require members.\nPitfall: private/protected members in an exported anonymous class cause declaration emit errors (TS4094).\nStrong candidate explains the any[] requirement and composition.\nWeak candidate uses Object.assign on prototypes with casts.',
        fix: `type Ctor<T = {}> = new (...args: any[]) => T;

function Timestamped<B extends Ctor>(Base: B) {
  return class extends Base {
    createdAt = new Date();
    touch(): void { this.createdAt = new Date(); }
  };
}

class User { constructor(public name: string) {} }
const TimestampedUser = Timestamped(User);
const u = new TimestampedUser('Ann');
console.log(u.name, u.createdAt);`,
        exercises: [
          {
            task: 'Fix the mixin so it compiles.',
            description: 'Checks the mixin constructor constraint. Ask what the error says.',
            code: `function Loggable<B extends new () => object>(Base: B) {
  return class extends Base { log() { console.log(this); } };
}`,
            answer: 'A mixin base constructor must have a single rest parameter of type any[]. Strong answers know the any[] rest parameter rule.',
            solution: `function Loggable<B extends new (...args: any[]) => object>(Base: B) {
  return class extends Base { log(): void { console.log(this); } };
}`,
          },
          {
            task: 'Use declaration merging to add a typed method to an existing class prototype.',
            description: 'Checks class/interface declaration merging. Ask whether this is a good idea.',
            code: 'class Vec { constructor(public x: number) {} }',
            answer: 'An interface with the same name merges into the class instance type; the implementation is assigned to the prototype. Strong answers mention it is risky for shared code and prefer subclassing or functions.',
            solution: `class Vec { constructor(public x: number) {} }
interface Vec { double(): Vec }
Vec.prototype.double = function (this: Vec) { return new Vec(this.x * 2); };`,
          },
        ],
      },
      {
        q: 'What does `useDefineForClassFields` change? Why can it break existing code?',
        short: 'With it (default for target ES2022+), class fields use [[Define]] semantics like native JS: fields are defined after super() and shadow accessors/properties from base classes; older code relied on [[Set]] assignment.',
        long: 'Default true when target >= ES2022 (or ESNext).\nA field redeclared in a subclass without initializer resets the base value to undefined.\nFields shadow base accessors instead of calling the setter.\nFix: use declare field: Type for type-only redeclarations.\nStrong candidate knows the declare fix and the target dependency.\nWeak candidate has never heard of it.',
        exercises: [
          {
            task: 'Fix the subclass field that resets the base value to undefined.',
            description: 'Checks the declare field modifier. Ask why it works.',
            code: `class Base { data: unknown = 'x'; }
class Child extends Base { data!: string; }
console.log(new Child().data);`,
            answer: 'With define semantics, data!: string re-defines the field as undefined. declare only narrows the type without emitting a field.',
            solution: `class Base { data: unknown = 'x'; }
class Child extends Base { declare data: string; }`,
          },
          {
            task: 'Predict whether the base setter runs.',
            description: 'Checks [[Define]] vs [[Set]]. Ask for the log.',
            code: `class Base { set v(x: number) { console.log('set', x); } }
class Child extends Base { v = 1; }
new Child();`,
            answer: 'With useDefineForClassFields it logs nothing: the field is defined directly, shadowing the setter. TS reports an error for this pattern (property overrides accessor).',
          },
        ],
      },
    ],
    senior: [
      {
        q: 'Why does this pass the type check but fail at runtime? Think about structural typing.',
        code: `class Cat { meow() {} }
const fake: Cat = { meow() {} };
console.log(fake instanceof Cat);`,
        short: 'TS is structural: the literal has the same shape as Cat so it type-checks, but instanceof checks the prototype chain, so it prints false. Private/# members or brands give nominal-like behaviour.',
        long: 'Class types are compared by members, not by name or prototype.\ninstanceof is a runtime prototype check, so a structurally compatible plain object fails it.\nIf a class has a private or # member, only instances of that class (or subclasses) are assignable — this makes the type effectively nominal.\nBranded types (string & { __brand: "UserId" }) give nominal typing for primitives.\nPitfall: relying on instanceof for data from JSON, iframes or duplicated package copies.\nStrong candidate explains structural vs nominal and the private-member trick.\nWeak candidate thinks it is a TS bug.',
        exercises: [
          {
            task: 'Predict whether this compiles and what it logs.',
            description: 'Checks that any bypasses types. Ask for compile and runtime results.',
            code: `class Point { constructor(public x: number) {} }
const p: Point = Object.create(null);
console.log(p instanceof Point, p.x);`,
            answer: 'It compiles because Object.create returns any; it logs false and undefined. Types only describe shape and can be bypassed by any. Strong answers mention noImplicitAny does not catch any-returning APIs and suggest unknown.',
          },
          {
            task: 'Write a type guard for structurally typed objects. Do not use instanceof.',
            description: 'Checks structural type guards. Ask why instanceof is not used.',
            answer: 'A property-based guard checks the shape at runtime, matching TS\'s structural model and working for plain JSON objects. Strong answers mention cross-realm and JSON data.',
            solution: `type Cat = { kind: 'cat'; meow(): void };
function isCat(x: unknown): x is Cat {
  return typeof x === 'object' && x !== null && (x as { kind?: unknown }).kind === 'cat';
}`,
          },
        ],
      },
      {
        q: 'Fix the types of a class factory. It takes a constructor and returns an instance.',
        code: `function create(C: Function, ...args: any[]) { return new (C as any)(...args); }
const d = create(Date, 0); // any`,
        short: 'Type the parameter as a construct signature new (...args: A) => T so both constructor arguments and the instance type are inferred.',
        long: 'Function loses all information; any spreads.\nConstruct signatures capture argument tuple A and instance type T.\nInstanceType<typeof X> and ConstructorParameters<typeof X> are the utility equivalents.\nAbstract classes need abstract new (...) => T.\nStrong candidate mentions the utility types.\nWeak candidate keeps any.',
        fix: `function create<T, A extends unknown[]>(C: new (...args: A) => T, ...args: A): T {
  return new C(...args);
}
const d = create(Date, 0); // Date`,
        exercises: [
          {
            task: 'Use utility types to get the instance type and the constructor parameters of a class.',
            description: 'Checks InstanceType and ConstructorParameters. Ask for both types.',
            code: 'class User { constructor(public id: string, public age: number) {} }',
            answer: 'InstanceType gives User, ConstructorParameters gives [id: string, age: number].',
            solution: `type U = InstanceType<typeof User>;
type P = ConstructorParameters<typeof User>;`,
          },
          {
            task: 'Predict whether this compiles.',
            description: 'Checks abstract construct signatures. Ask for the fix.',
            code: `abstract class A {}
function make(C: new () => A) { return new C(); }
make(A);`,
            answer: 'It errors: an abstract class is not assignable to a concrete construct signature. That is desired here; use abstract new () => A only when you will not instantiate it.',
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'Should your frontend team use a class-based dependency injection container? Explain your choice.',
        short: 'Usually not in React apps. Modules, React context and plain functions cover most needs. A container fits big Angular-style or Node codebases with many services.',
        long: `DI containers like InversifyJS or tsyringe rely on decorators and reflect-metadata.
They add runtime cost, setup and a learning curve.
In React, context and hooks already give injection points; tests can mock modules.
A container makes sense when you have many long-lived services with complex lifetimes.
Pitfall: hidden wiring makes it hard to find where an object comes from.
Strong answer: weighs testability, team size and tooling, and picks a simple default.
Weak answer: "DI is always good" or "never".`,
        follow: 'How would you inject a fake API client in tests without a container?',
        exercises: [
          {
            task: 'Rewrite this to inject the API client with React context instead of a global import.',
            description: 'Checks simple DI without a container.',
            code: `import { api } from './api';
export function useUser(id: string) { return api.getUser(id); }`,
            answer: 'Create a context with a default client, provide a fake in tests, and read it with a hook.',
            solution: `const ApiContext = createContext<Api>(realApi);
export const useApi = () => useContext(ApiContext);
export function useUser(id: string) { return useApi().getUser(id); }`,
          },
          {
            task: 'Name two signs that a codebase really needs a DI container.',
            description: 'Checks judgment.',
            answer: 'Many services with dependencies on each other, different lifetimes per request or scope, and many test setups that rebuild the graph by hand.',
          },
        ],
      },
      {
        q: 'Your team wants to use private methods and static blocks in classes. How do you check the build output and browser support?',
        short: 'Check the tsconfig target and the bundler target. If the target is older than ES2022, these features are compiled into WeakMaps and helper functions.',
        long: `With target ES2022 or later, TypeScript leaves #private and static blocks as they are.
With a lower target, it downlevels them, which adds helpers and is slower.
The bundler (esbuild, SWC) may also transform them based on its own target.
Use browserslist and a check in CI to keep targets in one place.
Pitfall: tsconfig target and bundler target disagree, so output is not what you expect.
Strong answer: inspects real output and aligns targets with supported browsers.
Weak answer: assumes TS always outputs modern code.`,
        follow: 'Why might the tsconfig target not matter when you use Vite?',
        exercises: [
          {
            task: 'What does tsc output for #count with target ES2020?',
            description: 'Checks downlevel knowledge.',
            code: 'class C { #count = 0; inc() { this.#count++; } }',
            answer: 'It emits a WeakMap and helper functions like __classPrivateFieldGet. With ES2022 it keeps #count.',
          },
          {
            task: 'Write a short rule for the team about class feature targets.',
            description: 'Checks policy writing.',
            answer: 'One browserslist file drives the bundler; tsconfig target matches it; review output size after a target change.',
          },
        ],
      },
    ],
  },
  'Set, WeakSet, Map, WeakMap': {
    junior: [
      {
        q: 'How do you type a Map from user id to User?',
        short: 'new Map<string, User>(); get(id) returns User | undefined, so handle the missing case.',
        long: 'Map<K, V> preserves insertion order and allows any key type (objects too), unlike plain objects.\nType arguments can be inferred from an initial entries array.\nget returns V | undefined; has/set/delete/size behave as expected.\nSet<T> stores unique values; equality is SameValueZero (NaN equals NaN, objects by reference).\nPitfall: using a non-null assertion on get without checking.\nStrong candidate mentions undefined from get and reference equality for object keys.\nWeak candidate uses Record and never handles missing keys.',
        exercises: [
          {
            task: 'Predict the size.',
            description: 'Checks reference equality in Set. Ask for the size.',
            code: `const s = new Set([{ id: 1 }, { id: 1 }, 'a', 'a']);
console.log(s.size);`,
            answer: '3: the two objects are different references, while the string duplicates collapse. Many answer 2. Strong answers explain SameValueZero.',
          },
          {
            task: 'Convert this object lookup into a typed Map and read a value safely.',
            description: 'Checks Map typing. Ask what get returns for missing keys.',
            code: 'const prices: { [k: string]: number } = { apple: 1 };',
            answer: 'Map makes "missing" explicit: get returns number | undefined. Strong answers mention ?? default.',
            solution: `const prices = new Map<string, number>([['apple', 1]]);
const p = prices.get('pear') ?? 0;`,
          },
        ],
      },
      {
        q: 'Fix the bug: duplicates are not removed.',
        code: `const ids = ['a', 'b', 'a'];
const unique = new Set(ids).values;
console.log(unique.length);`,
        short: 'values is a method returning an iterator, not an array; spread the Set (or Array.from) to get a deduplicated array.',
        long: 'new Set(iterable) removes duplicates by SameValueZero.\nSpread or Array.from converts back to an array (typed string[]).\nPitfall: accessing .length on a Set (use .size).\nStrong candidate also mentions object references are not deduplicated by value.\nWeak candidate writes a manual loop with indexOf.',
        fix: `const ids = ['a', 'b', 'a'];
const unique = [...new Set(ids)];
console.log(unique.length); // 2`,
        exercises: [
          {
            task: 'Check membership efficiently.',
            description: 'Checks Set.has vs Array.includes. Ask about complexity.',
            code: `const allowed = ['a', 'b', 'c'];
const ok = (x: string) => allowed.includes(x);`,
            answer: 'Set.has is O(1) on average versus O(n) for includes; useful for large or frequently checked lists.',
            solution: `const allowed = new Set(['a', 'b', 'c']);
const ok = (x: string) => allowed.has(x);`,
          },
          {
            task: 'Predict the output.',
            description: 'Checks Map key equality. Ask why.',
            code: `const m = new Map<object, number>();
m.set({}, 1);
console.log(m.get({}));`,
            answer: 'undefined: object keys are compared by reference, and {} creates a new object.',
          },
        ],
      },
    ],
    middle: [
      {
        q: 'Why does this error and how do you fix it safely?',
        code: `const cache = new Map<string, number>();
if (cache.has('a')) {
  const v: number = cache.get('a');
}`,
        short: 'has() does not narrow get(), so get still returns number | undefined. Call get once and check the result for undefined.',
        long: 'TS has no link between has(k) and a later get(k): they are separate method calls and the map could change in between.\nThe idiomatic fix is a single get followed by an undefined check — also one lookup instead of two.\nIf undefined is a valid stored value, use has plus a non-null assertion knowingly, or store wrapped values.\nPitfall: cache.get("a")! everywhere hides real bugs.\nStrong candidate explains why narrowing cannot work here.\nWeak candidate adds ! or as number.',
        fix: `const cache = new Map<string, number>();
const v = cache.get('a');
if (v !== undefined) {
  const n: number = v;
  console.log(n);
}`,
        exercises: [
          {
            task: 'Fix the type error when building a Map from an array.',
            description: 'Checks tuple inference in map callbacks. Ask why the error occurs.',
            code: `const users = [{ id: 'a', name: 'Ann' }];
const m: Map<string, { id: string; name: string }> = new Map(users.map(u => [u.id, u]));`,
            answer: 'u => [u.id, u] is inferred as an array of a union type, not a tuple; mark it as const or annotate the tuple. Strong answers know arrays infer as (string | User)[] without as const.',
            solution: `const users = [{ id: 'a', name: 'Ann' }];
const m = new Map(users.map(u => [u.id, u] as const));`,
          },
          {
            task: 'Predict whether this compiles.',
            description: 'Checks weak collection key rules. Ask for a prediction.',
            code: 'const ws = new WeakSet<string>();',
            answer: 'It does not compile: WeakSet and WeakMap keys must be objects (or non-registered symbols with the ES2023 lib in TS 5.2+); primitives cannot be weakly held. Strong answers mention symbols as keys in ES2023.',
          },
        ],
      },
      {
        q: 'When would you use Map instead of a plain object or Record?',
        short: 'Use Map for dynamic keys, non-string keys, frequent additions/removals, guaranteed insertion order and size; use plain objects for fixed-shape records and JSON data.',
        long: 'Objects have prototype keys (constructor, __proto__) that can collide with user keys.\nMap keys can be objects, functions, numbers without string conversion.\nMap has size and is iterable directly; performance is good for frequent mutations.\nObjects serialize to JSON; Maps do not.\nStrong candidate mentions prototype pollution risk.\nWeak candidate thinks they are interchangeable.',
        exercises: [
          {
            task: 'Fix the prototype key collision.',
            description: 'Checks a classic object-as-map bug. Ask why it breaks.',
            code: `const counts: Record<string, number> = {};
for (const w of ['constructor']) counts[w] = (counts[w] ?? 0) + 1;
console.log(counts.constructor);`,
            answer: 'counts.constructor initially resolves to Object (inherited), so ?? 0 does not apply and the result is a string. Map or Object.create(null) avoids inherited keys.',
            solution: `const counts = new Map<string, number>();
for (const w of ['constructor']) counts.set(w, (counts.get(w) ?? 0) + 1);`,
          },
          {
            task: 'Convert a Map to a plain object for JSON.',
            description: 'Checks Object.fromEntries. Ask for the type.',
            code: 'const m = new Map([[\'a\', 1]]);',
            answer: 'Object.fromEntries(m) gives { [k: string]: number }; JSON.stringify then works.',
          },
        ],
      },
    ],
    senior: [
      {
        q: 'Write a typed event emitter where event names map to payload types.',
        short: 'Parameterize the emitter with an event map type and use K extends keyof E so on/emit tie the event name to its payload type E[K].',
        long: 'The event map (e.g. { login: { userId: string } }) is the single source of truth.\nGeneric methods with K extends keyof E give autocomplete for names and correct payload types.\nInternally a Map of Sets loses the per-key correlation, so one localized any is acceptable; keep it private.\nReturn an unsubscribe function to avoid leaks.\nPitfalls: listeners unsubscribing during emit; memory leaks; using any in the public API.\nWeakMap/WeakSet are useful when data is keyed by objects that should be garbage-collected.\nStrong candidate keeps the public API fully typed and explains the internal looseness.\nWeak candidate uses string and any everywhere.',
        fix: `type Listener<P> = (payload: P) => void;

class Emitter<E extends Record<string, unknown>> {
  private listeners = new Map<keyof E, Set<Listener<any>>>();

  on<K extends keyof E>(event: K, fn: Listener<E[K]>): () => void {
    let set = this.listeners.get(event);
    if (!set) { set = new Set(); this.listeners.set(event, set); }
    set.add(fn);
    return () => { set.delete(fn); };
  }

  emit<K extends keyof E>(event: K, payload: E[K]): void {
    this.listeners.get(event)?.forEach(fn => fn(payload));
  }
}

const bus = new Emitter<{ login: { userId: string }; logout: undefined }>();
const off = bus.on('login', p => console.log(p.userId));
bus.emit('login', { userId: '1' });
off();`,
        exercises: [
          {
            task: 'Write memoize for functions that take one object argument. It must not leak memory.',
            description: 'Checks memory-safe caching. Ask what happens when the key object is discarded.',
            answer: 'A WeakMap keyed by the argument lets cached results be collected together with their keys. Strong answers explain WeakMap entries become collectable.',
            solution: `function memoizeObj<K extends object, V>(fn: (k: K) => V): (k: K) => V {
  const cache = new WeakMap<K, V>();
  return k => {
    if (cache.has(k)) return cache.get(k) as V;
    const v = fn(k);
    cache.set(k, v);
    return v;
  };
}`,
          },
          {
            task: 'Type an event map. When the payload is undefined, emit should not need a payload argument.',
            description: 'Checks conditional rest parameters. Ask how logout is called.',
            code: 'type Events = { logout: undefined; login: { id: string } };',
            answer: 'Conditional rest-tuple parameters make the payload argument absent for undefined payloads. Strong answers explain the tuple trick.',
            solution: `type Events = { logout: undefined; login: { id: string } };
declare function emit<K extends keyof Events>(
  event: K, ...args: Events[K] extends undefined ? [] : [Events[K]]
): void;
emit('logout');
emit('login', { id: '1' });`,
          },
        ],
      },
      {
        q: 'Fix the memory leak: the cache keeps DOM nodes alive after they are removed.',
        code: `const sizes = new Map<HTMLElement, DOMRect>();
function measure(el: HTMLElement) {
  if (!sizes.has(el)) sizes.set(el, el.getBoundingClientRect());
  return sizes.get(el)!;
}`,
        short: 'A Map holds strong references to its keys; a WeakMap lets removed elements be garbage-collected along with their cached values.',
        long: 'Strong keys keep detached DOM trees in memory indefinitely.\nWeakMap keys must be objects; entries disappear when the key is unreachable.\nWeakMaps are not iterable and have no size, by design.\nAlso avoid ! by using a single get.\nStrong candidate mentions detached DOM leaks and devtools heap snapshots.\nWeak candidate adds manual cleanup calls.',
        fix: `const sizes = new WeakMap<HTMLElement, DOMRect>();
function measure(el: HTMLElement): DOMRect {
  let r = sizes.get(el);
  if (!r) { r = el.getBoundingClientRect(); sizes.set(el, r); }
  return r;
}`,
        exercises: [
          {
            task: 'Predict why WeakMap has no size or iteration.',
            description: 'Checks the design rationale. Ask for a short explanation.',
            answer: 'GC timing is non-deterministic; exposing size or iteration would leak GC behaviour and make code depend on it.',
          },
          {
            task: 'Use WeakRef to cache objects that may be collected.',
            description: 'Checks WeakRef usage. Ask about deref.',
            answer: 'WeakRef holds a reference that may be cleared; deref() returns undefined after collection.',
            solution: `let ref: WeakRef<object> | undefined;
function getBig(): object {
  let v = ref?.deref();
  if (!v) { v = { big: new Array(1e6) }; ref = new WeakRef(v); }
  return v;
}`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'Where would you allow Map or Set in state? Think about Redux, the query cache, and the URL. These cannot be serialized easily.',
        short: 'Not in persisted or serialized state (Redux store, persisted Query cache, URL, localStorage); fine in local component state, derived selectors and memoized computations. Make it a team rule.',
        long: 'JSON.stringify turns Map/Set into {}, breaking persistence, devtools, SSR hydration and time-travel debugging.\nRedux Toolkit warns via serializableCheck; keep normalized Record<string, T> or arrays in stores.\nDerive Maps/Sets in selectors with memoization for fast lookups.\nLocal state and refs can use any structure.\nIf needed across boundaries, convert explicitly (Object.fromEntries, Array.from).\nStrong candidate knows the concrete failure modes and the derive pattern.\nWeak candidate bans Map/Set entirely or ignores serialization.',
        ai: true,
        exercises: [
          {
            task: 'Fix the store. Selected IDs are kept in a Set, and the saved state comes back empty.',
            description: 'Checks serializable state design. Ask why the state comes back empty.',
            code: 'type State = { selected: Set<string> };',
            answer: 'Sets serialize to {}; store a serializable array and derive a Set where fast lookup is needed. Strong answers derive Sets in selectors.',
            solution: `type State = { selected: string[] };
const selectSelectedSet = (s: State) => new Set(s.selected);`,
          },
          {
            task: 'Write a JSON replacer and reviver, so Maps survive serialization when you must store them.',
            description: 'Checks explicit serialization boundaries. Ask where to place this code.',
            answer: 'Tag Maps as entry arrays on the way out and rebuild them on the way in; keep this explicit at one boundary. Strong answers keep it in one persistence layer.',
            solution: `const replacer = (_k: string, v: unknown) => (v instanceof Map ? { __map: [...v] } : v);
const reviver = (_k: string, v: any) => (v && v.__map ? new Map(v.__map) : v);
const back = JSON.parse(JSON.stringify({ m: new Map([['a', 1]]) }, replacer), reviver);`,
          },
        ],
      },
      {
        q: 'Fix the selector. It creates a new Map on every render, so memoization does not work.',
        code: `function useUsersById(users: { id: string }[]) {
  return new Map(users.map(u => [u.id, u] as const));
}`,
        short: 'Derived Maps must be memoized on their input; otherwise every render produces a new reference and downstream memo/effects rerun.',
        long: 'Map/Set are great for derived lookups but have identity semantics.\nuseMemo or reselect keeps the same instance while input is unchanged.\nNever mutate a Map stored in state; create a new one so React detects change.\nStrong candidate ties this to referential equality rules.\nWeak candidate stores the Map in state and mutates it.',
        fix: `import { useMemo } from 'react';
function useUsersById(users: { id: string }[]) {
  return useMemo(() => new Map(users.map(u => [u.id, u] as const)), [users]);
}`,
        ai: true,
        exercises: [
          {
            task: 'Fix the state update that mutates a Set in place.',
            description: 'Checks immutability with collections in React. Ask why nothing re-renders.',
            code: `const [sel, setSel] = useState(new Set<string>());
const toggle = (id: string) => { sel.add(id); setSel(sel); };`,
            answer: 'Same reference means React bails out; create a new Set.',
            solution: 'const toggle = (id: string) => setSel(prev => new Set(prev).add(id));',
          },
          {
            task: 'Decide whether to store a Map in Redux.',
            description: 'Checks team rules. Ask for the recommendation.',
            answer: 'No: store arrays or Records and derive Maps in memoized selectors. Strong answers cite serializableCheck and devtools.',
          },
        ],
      },
    ],
  },
  'Generators, Symbol': {
    junior: [
      {
        q: 'What is the difference between symbol and unique symbol in TS?',
        short: 'symbol is the general type of all symbols; unique symbol is a subtype for one specific symbol declared with const (or readonly static), so it can be used as a literal property key in types.',
        long: 'Every Symbol() call creates a distinct value, but the type symbol does not distinguish them.\nconst k = Symbol() is inferred as typeof k (a unique symbol), so it can key properties in interfaces/types.\nlet k = Symbol() widens to symbol and cannot be used as a computed key in a type.\nWell-known symbols (Symbol.iterator, Symbol.asyncIterator, Symbol.dispose) customize language behaviour.\nSymbol-keyed properties are skipped by JSON.stringify and for...in.\nStrong candidate explains the const requirement and well-known symbols.\nWeak candidate says they are the same.',
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks generator return vs yield. Ask for the array.',
            code: `function* g() { yield 1; yield 2; return 3; }
console.log([...g()]);`,
            answer: '[1, 2]: spread and for...of ignore the return value of a generator. Many include 3. Strong answers explain done: true values are skipped.',
          },
          {
            task: 'Fix the error: the symbol cannot be used as a property key in the type.',
            description: 'Checks unique symbol. Ask why let fails.',
            code: `let key = Symbol('k');
type T = { [key]: string };`,
            answer: 'let widens to symbol; declare it with const so it is a unique symbol usable as a type-level key. Strong answers explain widening.',
            solution: `const key = Symbol('k');
type T = { [key]: string };`,
          },
        ],
      },
      {
        q: 'Fix the code so it prints numbers 1 to 3 using the generator.',
        code: `function* count() { yield 1; yield 2; yield 3; }
for (const n in count()) console.log(n);`,
        short: 'for...in iterates enumerable keys of an object; for...of iterates the values of an iterable such as a generator.',
        long: 'Generators return iterators consumed by for...of, spread or Array.from.\nfor...in on a generator object iterates nothing useful.\nTyping: Generator<number> or inferred.\nStrong candidate explains iterable protocol briefly.\nWeak candidate confuses in and of.',
        fix: `function* count(): Generator<number> { yield 1; yield 2; yield 3; }
for (const n of count()) console.log(n);`,
        exercises: [
          {
            task: 'Write a generator that yields an infinite sequence of ids and take three.',
            description: 'Checks laziness. Ask why it does not hang.',
            answer: 'The generator only computes values on demand via next().',
            solution: `function* ids(): Generator<number> { let i = 1; while (true) yield i++; }
const g = ids();
const three = [g.next().value, g.next().value, g.next().value];`,
          },
          {
            task: 'Predict the output.',
            description: 'Checks Symbol uniqueness. Ask why.',
            code: 'console.log(Symbol(\'a\') === Symbol(\'a\'), Symbol.for(\'a\') === Symbol.for(\'a\'));',
            answer: 'false true: Symbol() always creates a new symbol; Symbol.for uses the global registry.',
          },
        ],
      },
    ],
    middle: [
      {
        q: 'Type this generator properly.',
        code: 'function* idGen() { let i = 0; while (true) { const reset = yield i++; if (reset) i = 0; } }',
        short: 'Use Generator<Yield, Return, Next>: it yields number, never returns (infinite loop) so Return is never, and next() receives boolean | undefined.',
        long: 'Generator<T, TReturn, TNext>: T = yielded values, TReturn = value of return, TNext = argument passed to next().\nThe value of a yield expression is TNext; without an annotation it is implicitly any, which noImplicitAny reports.\nThe first next() argument is always ignored, so TNext should include undefined.\nIterableIterator<T> / Iterable<T> is enough when you only consume via for...of.\nTS 5.6 added IteratorObject, BuiltinIteratorReturn and iterator helper typings.\nStrong candidate explains all three parameters and the first-next quirk.\nWeak candidate writes Generator<number> and cannot explain the rest.',
        fix: `function* idGen(): Generator<number, never, boolean | undefined> {
  let i = 0;
  while (true) {
    const reset = yield i++;
    if (reset) i = 0;
  }
}

const g = idGen();
g.next();     // { value: 0, done: false }
g.next();     // { value: 1, done: false }
g.next(true); // { value: 0, done: false }`,
        exercises: [
          {
            task: 'Make this class iterable with for...of, yielding typed values.',
            description: 'Checks Symbol.iterator implementation. Ask for the type of s.',
            code: 'class Bag { constructor(private items: string[]) {} }',
            answer: 'Implement [Symbol.iterator] as a generator method; TS then types for...of elements as string. Strong answers use yield* delegation.',
            solution: `class Bag {
  constructor(private items: string[]) {}
  *[Symbol.iterator](): Generator<string> { yield* this.items; }
}
for (const s of new Bag(['a'])) console.log(s);`,
          },
          {
            task: 'Predict the output.',
            description: 'Checks the first next() quirk. Ask for the log.',
            code: `function* g() { const x = yield 1; console.log('got', x); }
const it = g();
it.next('a');
it.next('b');`,
            answer: 'It logs "got b": the first next() argument is discarded because no yield is waiting yet. Many answer "got a". Strong answers explain why.',
          },
        ],
      },
      {
        q: 'What is the iterator protocol? How does TS type it?',
        short: 'An iterable has [Symbol.iterator]() returning an iterator with next() → { value, done }; TS models this with Iterable<T>, Iterator<T, TReturn, TNext> and IterableIterator<T>.',
        long: 'Generators implement both Iterable and Iterator.\nAny object with [Symbol.iterator] works with for...of and spread.\nAsync variants: AsyncIterable, Symbol.asyncIterator, for await.\nTS 5.6 introduced IteratorObject and BuiltinIteratorReturn for built-in iterators.\nStrong candidate can hand-write an iterator without a generator.\nWeak candidate only knows arrays.',
        exercises: [
          {
            task: 'Hand-write an iterator without a generator.',
            description: 'Checks understanding of the protocol. Ask for the types.',
            answer: 'Return an object with next() producing IteratorResult values.',
            solution: `function range(n: number): Iterable<number> {
  return {
    [Symbol.iterator](): Iterator<number> {
      let i = 0;
      return { next: () => (i < n ? { value: i++, done: false } : { value: undefined, done: true }) };
    },
  };
}`,
          },
          {
            task: 'Predict whether spreading this object works.',
            description: 'Checks iterable requirement. Ask for the error.',
            code: `const o = { a: 1 };
const arr = [...o];`,
            answer: 'It does not compile (and throws at runtime): plain objects are not iterable. Use Object.values(o).',
          },
        ],
      },
    ],
    senior: [
      {
        q: 'Type an async generator for paginated data. Add a helper that collects it into an array.',
        short: 'Use async function* returning AsyncGenerator<T> that loops over pages and yields items, and accept AsyncIterable<T> in consumers like collect.',
        long: 'Async generators make pagination lazy: the next page is fetched only when the consumer asks for more items.\nConsumers should depend on AsyncIterable<T> (the minimal interface); producers can declare AsyncGenerator<T, R, N>.\nfor await...of handles iteration; breaking out calls return() so finally blocks run for cleanup.\nCancellation: pass an AbortSignal to fetchPage.\nPitfalls: collect on an infinite source never finishes; errors surface at the consumer\'s next iteration.\nArray.fromAsync (ES2024) can replace collect.\nStrong candidate mentions laziness, cleanup and cancellation.\nWeak candidate loads all pages eagerly into an array.',
        fix: `type Page<T> = { items: T[]; next: string | null };

async function* paginate<T>(
  fetchPage: (cursor: string | null) => Promise<Page<T>>,
): AsyncGenerator<T, void, undefined> {
  let cursor: string | null = null;
  do {
    const page: Page<T> = await fetchPage(cursor);
    yield* page.items;
    cursor = page.next;
  } while (cursor !== null);
}

async function collect<T>(it: AsyncIterable<T>): Promise<T[]> {
  const out: T[] = [];
  for await (const x of it) out.push(x);
  return out;
}`,
        exercises: [
          {
            task: 'Implement automatic cleanup with the `using` declaration from TS 5.2.',
            description: 'Checks explicit resource management (TS 5.2). Ask when dispose runs.',
            answer: 'An object with [Symbol.dispose] is disposed when the scope exits, even on errors (requires the esnext.disposable lib and a Symbol.dispose polyfill where missing). Strong answers mention lib and polyfill requirements.',
            solution: `class Conn implements Disposable {
  [Symbol.dispose]() { console.log('closed'); }
}
function run() {
  using c = new Conn();
  console.log('working');
} // logs working, closed`,
          },
          {
            task: 'Write a typed async generator. It joins several AsyncIterables, one after another.',
            description: 'Checks async generator delegation. Ask about ordering.',
            answer: 'yield* delegates to each inner async iterable in turn. Strong answers note sequential behaviour.',
            solution: `async function* concat<T>(...sources: AsyncIterable<T>[]): AsyncGenerator<T> {
  for (const s of sources) yield* s;
}`,
          },
        ],
      },
      {
        q: 'Fix the async iteration. The consumer stops early, but the stream is never closed.',
        code: `async function* lines(reader: ReadableStreamDefaultReader<string>) {
  while (true) {
    const { value, done } = await reader.read();
    if (done) return;
    yield value;
  }
}`,
        short: 'When the consumer breaks, return() is called on the generator; only a finally block runs, so cleanup must live there.',
        long: 'for await...of calls return() on early exit (break, throw, return).\nWithout try/finally the reader stays locked and resources leak.\nThe same applies to sync generators and file handles.\nAlternatively, await using with Symbol.asyncDispose (TS 5.2).\nStrong candidate mentions return() semantics.\nWeak candidate relies on the consumer to clean up.',
        fix: `async function* lines(reader: ReadableStreamDefaultReader<string>): AsyncGenerator<string> {
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) return;
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}`,
        exercises: [
          {
            task: 'Predict whether finally runs.',
            description: 'Checks generator return semantics. Ask for the log.',
            code: `function* g() { try { yield 1; yield 2; } finally { console.log('done'); } }
for (const x of g()) break;`,
            answer: 'Yes, "done" is logged: break calls return() which runs finally.',
          },
          {
            task: 'Implement Symbol.asyncDispose on a connection.',
            description: 'Checks await using (TS 5.2). Ask for requirements.',
            answer: 'await using calls [Symbol.asyncDispose] at scope exit; needs the esnext.disposable lib and runtime support or polyfill.',
            solution: `class Conn implements AsyncDisposable {
  async [Symbol.asyncDispose]() { console.log('closed'); }
}
async function run() { await using c = new Conn(); }`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'Would you bring iterator helpers or generators to a team that does not know them? How do you judge the cost of new language features?',
        short: 'Only with a measurable benefit: weigh readability for the current team, runtime/browser support and polyfills, tooling, and training cost, then pilot in a contained area.',
        long: 'Criteria: problem fit (lazy/streaming data, pagination), readability, support matrix (iterator helpers are ES2025), polyfill bundle cost, debugging experience.\nPilot in one module, gather feedback, document patterns, add lint rules if needed.\nPrefer encapsulating generators behind simple functions so not everyone has to master them.\nAvoid novelty for its own sake, but do not block good tools out of unfamiliarity.\nStrong candidate describes an adoption process and success criteria.\nWeak candidate decides by personal enthusiasm.',
        ai: true,
        exercises: [
          {
            task: 'The team does not know generators. Rewrite this generator pipeline as plain array code, and explain what you lose.',
            description: 'Checks pragmatism about language features. Ask when generators are justified.',
            code: `function* evens(xs: number[]) { for (const x of xs) if (x % 2 === 0) yield x; }
const r = [...evens([1, 2, 3, 4])];`,
            answer: 'For small finite arrays, filter is clearer; generators pay off only for lazy, infinite or streaming data. Strong answers mention laziness or infinite data.',
            solution: 'const r = [1, 2, 3, 4].filter(x => x % 2 === 0);',
          },
          {
            task: 'Use iterator helpers only when they exist. Otherwise use a fallback.',
            description: 'Checks support matrix awareness. Ask how to decide on polyfills.',
            answer: 'Iterator helpers are ES2025; feature-detect or polyfill (core-js) and keep lib settings aligned with real targets. Strong answers align lib with browserslist.',
            solution: `const it = [1, 2, 3].values();
const result: number[] = typeof (it as any).map === 'function'
  ? (it as any).map((x: number) => x * 2).toArray()
  : Array.from(it, x => x * 2);`,
          },
        ],
      },
      {
        q: 'Fix this streaming UI that loads all pages before rendering anything.',
        code: `async function loadAll(): Promise<Item[]> {
  const all: Item[] = [];
  let cursor: string | null = null;
  do { const p = await fetchPage(cursor); all.push(...p.items); cursor = p.next; } while (cursor);
  return all;
}`,
        short: 'Yield each page as it arrives so the UI can render progressively and stop early, instead of waiting for the whole dataset.',
        long: 'Eager loading hurts time-to-first-content and memory.\nAsync generators give progressive rendering and natural cancellation via break.\nIn React, prefer useInfiniteQuery for UI state; generators fit services and workers.\nStrong candidate weighs generator vs library patterns.\nWeak candidate adds a spinner.',
        fix: `async function* pages(): AsyncGenerator<Item[]> {
  let cursor: string | null = null;
  do {
    const p: { items: Item[]; next: string | null } = await fetchPage(cursor);
    yield p.items;
    cursor = p.next;
  } while (cursor);
}
// UI: for await (const batch of pages()) render(batch);`,
        ai: true,
        exercises: [
          {
            task: 'Cancel the iteration when the component unmounts.',
            description: 'Checks cancellation. Ask how the generator stops.',
            answer: 'Check an AbortSignal in the loop and break; breaking triggers the generator\'s cleanup.',
            solution: `async function consume(signal: AbortSignal) {
  for await (const batch of pages()) {
    if (signal.aborted) break;
    console.log(batch.length);
  }
}`,
          },
          {
            task: 'For a React list, choose between async generators and useInfiniteQuery.',
            description: 'Checks architectural judgment. Ask for criteria.',
            answer: 'useInfiniteQuery handles caching, refetching and UI state; async generators suit non-UI pipelines (exports, workers). Strong answers avoid reinventing caching.',
          },
        ],
      },
    ],
  },
  'Event Loop': {
    junior: [
      {
        q: 'How do you type the return value of an async function? What type do you get when you `await` something that is not a promise?',
        short: 'An async function returning T is typed as Promise<T>. Awaiting a non-promise value of type T simply gives T (execution still resumes on a microtask).',
        long: 'async functions always return a promise, so the annotation must be Promise<T> (or omitted and inferred).\nawait unwraps promises and thenables; the resulting type is Awaited<T>.\nAwaiting a plain value still yields to the microtask queue before continuing.\nUse Promise<void> for functions with no meaningful result.\nPitfall: annotating async function f(): User is a compile error.\nStrong candidate knows Awaited and the microtask behaviour.\nWeak candidate thinks await on a non-promise is synchronous or an error.',
        exercises: [
          {
            task: 'Fix the return type annotation.',
            description: 'Checks async return types. Ask for the correct annotation.',
            code: 'async function getCount(): number { return 1; }',
            answer: 'An async function always returns a promise, so the annotation must be Promise<number>. Strong answers explain async always wraps in a promise.',
            solution: 'async function getCount(): Promise<number> { return 1; }',
          },
          {
            task: 'Predict the order of logs.',
            description: 'Checks microtask vs macrotask order. Ask for the order.',
            code: `console.log(1);
setTimeout(() => console.log(2));
Promise.resolve().then(() => console.log(3));
console.log(4);`,
            answer: '1, 4, 3, 2: synchronous code first, then microtasks (promise callbacks), then macrotasks (timers). Many answer 1, 2, 3, 4. Strong answers explain queues.',
          },
        ],
      },
      {
        q: 'Fix the code: the result is logged before the data arrives.',
        code: `function load() {
  let data;
  fetch('/api').then(r => r.json()).then(d => { data = d; });
  console.log(data);
}`,
        short: 'Promise callbacks run later, after the synchronous code; await the promise (or log inside then) to use the result.',
        long: 'console.log runs synchronously before the promise settles.\nasync/await makes the order explicit.\nType the JSON result as unknown until validated.\nStrong candidate explains the event loop ordering.\nWeak candidate adds setTimeout.',
        fix: `async function load(): Promise<void> {
  const res = await fetch('/api');
  const data: unknown = await res.json();
  console.log(data);
}`,
        exercises: [
          {
            task: 'Type a function that returns a promise of a string array.',
            description: 'Checks Promise<T> annotations. Ask what happens with a wrong return.',
            answer: 'Annotate as Promise<string[]>; returning numbers is a compile error.',
            solution: 'async function names(): Promise<string[]> { return [\'a\', \'b\']; }',
          },
          {
            task: 'Predict the output.',
            description: 'Checks await ordering. Ask for the sequence.',
            code: `async function f() { console.log(1); await null; console.log(2); }
f(); console.log(3);`,
            answer: '1, 3, 2: code after await resumes in a microtask.',
          },
        ],
      },
    ],
    middle: [
      {
        q: 'Why does TS complain and what is the runtime bug?',
        code: `async function save() {}
function onClick() {
  save();
  navigate('/done');
}`,
        short: 'It is a floating promise: navigation happens before save finishes and any rejection is unhandled. Await it with error handling; the no-floating-promises lint rule (not tsc itself) flags this.',
        long: 'tsc does not complain about unawaited promises; typescript-eslint no-floating-promises does (requires type-aware linting).\nsave() starts and returns a pending promise; navigate runs immediately in the same tick.\nIf save rejects, it becomes an unhandledrejection; the user sees success while data was not saved.\nFix: await with try/catch, or explicitly mark fire-and-forget with void save().catch(report).\nIn React handlers, no-misused-promises catches passing async functions where void is expected.\nStrong candidate distinguishes tsc vs lint and explains the ordering.\nWeak candidate says "add async" without await.',
        fix: `declare function navigate(path: string): void;
async function save(): Promise<void> {}

async function onClick(): Promise<void> {
  try {
    await save();
    navigate('/done');
  } catch (e) {
    console.error('Save failed', e);
  }
}`,
        exercises: [
          {
            task: 'Fix the bug. The loop runs requests one by one, but they do not depend on each other.',
            description: 'Checks accidental sequential awaits. Ask how long it takes for 10 ids.',
            code: `async function loadAll(ids: string[]) {
  const out = [];
  for (const id of ids) out.push(await fetch('/u/' + id));
  return out;
}`,
            answer: 'Start all requests first and await them together with Promise.all. Strong answers mention concurrency limits for large lists.',
            solution: `async function loadAll(ids: string[]): Promise<Response[]> {
  return Promise.all(ids.map(id => fetch('/u/' + id)));
}`,
          },
          {
            task: 'Predict the result: does forEach wait for the async callbacks?',
            description: 'Checks forEach with async callbacks. Ask for the log order.',
            code: `const ids = [1, 2];
ids.forEach(async id => { await Promise.resolve(); console.log(id); });
console.log('done');`,
            answer: 'No: "done" logs first, then 1 and 2. forEach ignores returned promises; no-misused-promises flags this. Strong answers suggest for...of or Promise.all.',
          },
        ],
      },
      {
        q: 'What is the difference between microtasks and macrotasks, and how does it affect UI updates?',
        short: 'Microtasks (promise callbacks, queueMicrotask) run right after the current task, before rendering; macrotasks (setTimeout, events, messages) run one per loop iteration, with rendering possible in between.',
        long: 'A long chain of microtasks blocks rendering just like sync code.\nsetTimeout(0) yields to the browser so it can paint.\nrequestAnimationFrame runs before the next paint.\nscheduler.yield() / scheduler.postTask in modern browsers help break long tasks.\nStrong candidate connects this to INP and long tasks.\nWeak candidate thinks promises run in parallel threads.',
        exercises: [
          {
            task: 'Fix the UI freeze when processing a large array.',
            description: 'Checks yielding to the browser. Ask why promises alone do not help.',
            code: 'async function processAll(items: number[]) { for (const i of items) await Promise.resolve(heavy(i)); }',
            answer: 'Awaiting resolved promises only queues microtasks, which still block paint. Yield with a macrotask every chunk.',
            solution: `declare function heavy(n: number): void;
async function processAll(items: number[]) {
  for (let i = 0; i < items.length; i++) {
    heavy(items[i]);
    if (i % 100 === 0) await new Promise(r => setTimeout(r, 0));
  }
}`,
          },
          {
            task: 'Predict the order.',
            description: 'Checks rAF vs timers vs microtasks. Ask for the likely order.',
            code: `requestAnimationFrame(() => console.log('raf'));
setTimeout(() => console.log('timeout'));
queueMicrotask(() => console.log('micro'));`,
            answer: 'micro first; then usually timeout and raf in either order depending on frame timing. Strong answers note raf is tied to rendering, not a fixed queue position.',
          },
        ],
      },
    ],
    senior: [
      {
        q: 'Type a setTimeout handle that works in the browser and in Node. Also write a typed sleep with AbortSignal.',
        short: 'Use ReturnType<typeof setTimeout> to avoid number vs NodeJS.Timeout conflicts, and implement sleep that rejects with signal.reason on abort, handles an already-aborted signal and removes its listener.',
        long: 'With both DOM and @types/node loaded, setTimeout may resolve to Node\'s overload returning NodeJS.Timeout, so typing the handle as number breaks.\nReturnType<typeof setTimeout> adapts to whichever environment types are active.\nAbort handling: check signal.aborted first, clear the timer on abort, remove the listener on success to avoid leaks with long-lived signals.\nReject with signal.reason (a DOMException AbortError by default).\nAlternatives: AbortSignal.timeout(ms), Node timers/promises setTimeout(ms, value, { signal }).\nStrong candidate covers the already-aborted and listener-leak edge cases.\nWeak candidate types the handle as any.',
        fix: `let timer: ReturnType<typeof setTimeout> | undefined;

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const onAbort = () => {
      clearTimeout(id);
      reject(signal?.reason);
    };
    const id = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}`,
        exercises: [
          {
            task: 'Write a typed timeout wrapper for any promise.',
            description: 'Checks Promise.race with cleanup. Ask what leaks without finally.',
            answer: 'Race the promise against a rejecting timer and always clear the timer. Strong answers mention the timer keeps running and the original promise is not cancelled.',
            solution: `function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let t: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, rej) => { t = setTimeout(() => rej(new Error('timeout')), ms); });
  return Promise.race([p, timeout]).finally(() => clearTimeout(t));
}`,
          },
          {
            task: 'Type Promise.allSettled results and extract only the fulfilled values.',
            description: 'Checks typing allSettled. Ask why a type guard is needed.',
            answer: 'A type guard on PromiseSettledResult narrows to PromiseFulfilledResult<T> inside filter. Strong answers explain filter does not narrow without a predicate.',
            solution: `async function fulfilled<T>(ps: Promise<T>[]): Promise<T[]> {
  const rs = await Promise.allSettled(ps);
  return rs.filter((r): r is PromiseFulfilledResult<T> => r.status === 'fulfilled').map(r => r.value);
}`,
          },
        ],
      },
      {
        q: 'Fix the race condition: fast typing shows results for an older query.',
        code: `async function search(q: string) {
  const res = await fetch('/search?q=' + q);
  setResults(await res.json());
}`,
        short: 'Responses can arrive out of order; abort the previous request (or ignore stale responses) so only the latest query updates the UI.',
        long: 'Out-of-order responses are a classic event-loop race.\nAbortController cancels the network request and rejects with AbortError.\nAlternative: track a request id and ignore stale results.\nAlso encode the query and debounce input.\nStrong candidate handles AbortError separately.\nWeak candidate adds a delay.',
        fix: `let controller: AbortController | undefined;
async function search(q: string): Promise<void> {
  controller?.abort();
  controller = new AbortController();
  try {
    const res = await fetch('/search?q=' + encodeURIComponent(q), { signal: controller.signal });
    setResults(await res.json());
  } catch (e) {
    if ((e as Error).name !== 'AbortError') throw e;
  }
}
declare function setResults(r: unknown): void;`,
        exercises: [
          {
            task: 'Ignore old responses without aborting the requests.',
            description: 'Checks the request-id pattern. Ask when to prefer it.',
            answer: 'Increment a counter per request and only apply results if the id is still current; useful when the API cannot be cancelled.',
            solution: `let latest = 0;
async function search(q: string) {
  const id = ++latest;
  const data = await (await fetch('/search?q=' + encodeURIComponent(q))).json();
  if (id === latest) console.log(data);
}`,
          },
          {
            task: 'Predict what the catch receives when aborting.',
            description: 'Checks abort error typing. Ask for the name.',
            answer: 'A DOMException named "AbortError" (or signal.reason if abort(reason) was passed). catch gives unknown, so narrow before reading name.',
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'Which typescript-eslint rules for async code would you make required? Why?',
        short: 'no-floating-promises, no-misused-promises, await-thenable, return-await and promise-function-async, each justified by real bugs they prevent.',
        long: 'no-floating-promises: unhandled rejections and ordering bugs (the most valuable one).\nno-misused-promises: async callbacks passed where void is expected (event handlers, forEach, conditions on promises).\nawait-thenable: awaiting non-promises signals a misunderstanding.\nreturn-await (in-try-catch): ensures rejections are caught inside try blocks.\nThese need type-aware linting (parserOptions.projectService), which costs CI time — mitigate with caching.\nRollout: enable as warnings, fix, then make errors; allow documented void for fire-and-forget.\nStrong candidate ties each rule to a bug class and discusses rollout cost.\nWeak candidate lists rules without reasons.',
        ai: true,
        exercises: [
          {
            task: 'The rule no-misused-promises reports this React handler. Fix it without turning off the rule.',
            description: 'Checks fixing lint findings properly. Ask why the rule fires.',
            code: '<button onClick={async () => { await save(); }}>Save</button>',
            answer: 'Wrap the async work in a void-returning handler and handle errors explicitly. Strong answers mention the handler expects void.',
            solution: '<button onClick={() => { void save().catch(reportError); }}>Save</button>',
          },
          {
            task: 'Write a concurrency limiter for async tasks.',
            description: 'Checks concurrency control. Ask how results stay ordered.',
            answer: 'Run at most n tasks at once by having n workers pull from a shared index. Strong answers explain index-based assignment.',
            solution: `async function pool<T>(tasks: (() => Promise<T>)[], n: number): Promise<T[]> {
  const out: T[] = new Array(tasks.length);
  let i = 0;
  const worker = async () => { while (i < tasks.length) { const idx = i++; out[idx] = await tasks[idx](); } };
  await Promise.all(Array.from({ length: Math.min(n, tasks.length) }, worker));
  return out;
}`,
          },
        ],
      },
      {
        q: 'How do you prevent unhandled promise rejections from reaching production unnoticed?',
        short: 'Combine type-aware lint rules (no-floating-promises, no-misused-promises), global unhandledrejection handlers reporting to monitoring, and consistent error boundaries in data-fetching layers.',
        long: 'Lint catches most floating promises at author time.\nwindow.addEventListener("unhandledrejection") and process.on("unhandledRejection") report what slips through.\nData libraries (React Query) centralize error handling.\nTests: fail on unhandled rejections in the test runner.\nStrong candidate covers prevention, detection and response.\nWeak candidate relies on try/catch discipline.',
        ai: true,
        exercises: [
          {
            task: 'Add a global handler that reports unhandled rejections.',
            description: 'Checks detection in the browser. Ask what to send.',
            answer: 'Listen to unhandledrejection and report event.reason to monitoring; optionally preventDefault to avoid console noise.',
            solution: `window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
  console.error('unhandled', e.reason);
});`,
          },
          {
            task: 'Make the test runner fail on unhandled rejections.',
            description: 'Checks CI enforcement. Ask how.',
            answer: 'Vitest reports unhandled errors as failures by default (dangerouslyIgnoreUnhandledErrors is off); Node can run with --unhandled-rejections=strict.',
          },
        ],
      },
    ],
  },
  'Performance Optimization': {
    junior: [
      {
        q: 'Does TypeScript make the app faster at runtime?',
        short: 'No. Types are erased, so runtime performance is the same as the equivalent JavaScript; TS helps catch bugs and refactor safely.',
        long: 'The compiler removes types and emits plain JS; the browser never sees TS.\nPerformance depends on the emitted JS, the target (downleveling can add helpers) and the bundler.\nSome TS features emit extra code (enums, decorators), which slightly affects bundle size.\nIndirect benefit: safer refactors make optimizations less risky.\nStrong candidate mentions erasure and that target affects output.\nWeak candidate says static types make JS engines faster.',
        exercises: [
          {
            task: 'Predict what this compiles to in JavaScript.',
            description: 'Checks type erasure. Ask what the output JS is.',
            code: `interface User { id: string }
const greet = (u: User): string => 'hi ' + u.id;`,
            answer: 'The interface and annotations disappear: const greet = (u) => \'hi \' + u.id; Strong answers mention only syntax is removed.',
          },
          {
            task: 'Predict whether the cast changes runtime behavior.',
            description: 'Checks that assertions are erased. Ask for the output.',
            code: `const n = '5' as unknown as number;
console.log(n + 1);`,
            answer: 'It logs "51": assertions are erased, so the value is still a string at runtime. Many answer 6. Strong answers explain the cast is not a conversion.',
          },
        ],
      },
      {
        q: 'Fix the tsconfig, so the build does not type-check libraries in node_modules every time.',
        code: '{ "compilerOptions": { "strict": true } }',
        short: 'skipLibCheck skips checking .d.ts files (mostly from node_modules) and incremental reuses results between builds, both cutting compile time.',
        long: 'Most projects check thousands of library declaration files needlessly.\nskipLibCheck is widely recommended; it may hide conflicts between @types packages.\nincremental writes .tsbuildinfo to reuse previous work.\nStrong candidate knows the trade-off of skipLibCheck.\nWeak candidate disables strict to "speed up".',
        fix: '{ "compilerOptions": { "strict": true, "skipLibCheck": true, "incremental": true } }',
        exercises: [
          {
            task: 'Exclude build output from compilation.',
            description: 'Checks include/exclude. Ask why it matters.',
            code: '{ "include": ["**/*"] }',
            answer: 'Including dist doubles work and can cause duplicate declarations; restrict include to src.',
            solution: '{ "include": ["src"], "exclude": ["dist", "node_modules"] }',
          },
          {
            task: 'Predict whether types affect bundle size.',
            description: 'Checks erasure. Ask for the answer.',
            answer: 'No: types are removed; only runtime constructs (enums, decorators, helpers from low targets) add bytes.',
          },
        ],
      },
    ],
    middle: [
      {
        q: 'What is `import type` and why does it matter for bundles?',
        short: 'import type imports only types and is always fully erased, so it never pulls a module (and its side effects) into the bundle; verbatimModuleSyntax requires it for type-only imports.',
        long: 'Regular imports used only as types are usually elided, but single-file transpilers (esbuild, SWC, Babel) cannot always know whether a name is a type.\nimport type / inline import { type X } makes intent explicit and guarantees erasure.\nverbatimModuleSyntax (TS 5.0) keeps non-type imports as written and errors on type-only usage without the type modifier.\nBenefits: avoids accidental side-effect imports, breaks runtime circular dependencies, smaller bundles.\nLint: consistent-type-imports with autofix.\nStrong candidate mentions isolated transpilers and verbatimModuleSyntax.\nWeak candidate thinks it only affects readability.',
        exercises: [
          {
            task: 'Fix the import so it is always removed under verbatimModuleSyntax.',
            description: 'Checks import type with verbatimModuleSyntax. Ask what the compiler says.',
            code: `import { User } from './models';
export function name(u: User) { return u.name; }`,
            answer: 'User is only used as a type; mark it with import type (or an inline type modifier) so nothing is emitted. Strong answers mention inline `type` modifiers.',
            solution: `import type { User } from './models';
export function name(u: User): string { return u.name; }`,
          },
          {
            task: 'Explain why this import can keep a heavy module in the bundle. Then fix it.',
            description: 'Checks side-effect imports in bundles. Ask how the bundle changes.',
            code: `import { Chart } from './chart'; // chart.ts runs side effects on load
type Props = { chart: Chart };`,
            answer: 'Without import type, a transpiler may preserve the import, executing side effects and bundling the module; import type is always removed. Strong answers explain isolated transpilers.',
            solution: `import type { Chart } from './chart';
type Props = { chart: Chart };`,
          },
        ],
      },
      {
        q: 'Fix the slow type check. A huge inferred return type causes it.',
        code: `export const api = createApi({ /* 200 endpoints */ });
export type Api = typeof api;`,
        short: 'Very large inferred types are re-computed and serialized wherever used; declaring an explicit interface lets the checker reuse a named type.',
        long: 'Exported inferred types end up inlined in .d.ts files and slow every consumer.\nExplicit interfaces are cached by name and give better errors.\nUse --generateTrace to confirm the hot spot.\nisolatedDeclarations enforces explicit export types.\nStrong candidate measures before and after.\nWeak candidate blames the IDE.',
        fix: `export interface Api {
  getUser(id: string): Promise<{ id: string }>;
  // ...explicitly declared endpoints
}
export const api: Api = createApi({});
declare function createApi(cfg: object): Api;`,
        exercises: [
          {
            task: 'Find which files take longest to check.',
            description: 'Checks diagnostics tooling. Ask for commands.',
            answer: 'Run tsc --generateTrace and analyze with @typescript/analyze-trace, or inspect in Perfetto/Chrome tracing.',
            solution: '// tsc --noEmit --generateTrace trace && npx @typescript/analyze-trace trace',
          },
          {
            task: 'Predict which version is faster for the type checker.',
            description: 'Checks interface vs intersection cost. Ask why.',
            code: `type A = X & Y & Z;
interface B extends X, Y, Z {}`,
            answer: 'B: interfaces are cached and compared by name; repeated intersections are re-normalized.',
          },
        ],
      },
    ],
    senior: [
      {
        q: 'tsc takes 4 minutes. How do you find the cause and make it faster?',
        short: 'Measure first with --extendedDiagnostics and --generateTrace, then use project references with incremental builds, skipLibCheck, simplify heavy types, and transpile with esbuild/swc while tsc only typechecks.',
        long: 'Diagnose: --extendedDiagnostics (check time, type counts, memory), --generateTrace + @typescript/analyze-trace to find slow files/types, --listFiles / --explainFiles to spot accidental includes.\nConfig: narrow include, skipLibCheck, incremental/tsBuildInfo, project references (tsc -b) to rebuild only what changed.\nCode: avoid huge unions and deep recursive conditional types, add explicit return types on exported functions, prefer interface extends over large intersections.\nPipeline: esbuild/swc/Vite for transpile, tsc --noEmit in a parallel CI job; isolatedDeclarations for fast .d.ts.\nThe native TypeScript port (tsgo / TS 7) promises roughly 10x faster checks.\nStrong candidate starts from measurement.\nWeak candidate jumps to "buy a faster CI machine".',
        exercises: [
          {
            task: 'Rewrite this type so it is cheaper for the type checker.',
            description: 'Checks checker performance techniques. Ask why interfaces are faster.',
            code: 'type Big = A & B & C & D & E & F; // used in hundreds of places',
            answer: 'Interfaces that extend are cached by name and checked faster than large repeated intersections. Strong answers mention caching and measurement first.',
            solution: 'interface Big extends A, B, C, D, E, F {}',
          },
          {
            task: 'Set up a fast dev loop. Transpile with Vite or esbuild, and run the type check separately.',
            description: 'Checks split transpile/typecheck pipelines. Ask what CI runs.',
            answer: 'Keep tsc as a --noEmit typecheck (incremental) running in parallel; the bundler only strips types. Strong answers keep typecheck as a required CI gate.',
            solution: `// package.json scripts
// "dev": "vite", "typecheck": "tsc --noEmit --incremental", "ci": "npm run typecheck && vite build"`,
          },
        ],
      },
      {
        q: 'The editor is slow and tsserver uses a lot of memory in a big repo. How do you fix it?',
        short: 'Make sure each tsconfig includes only what it needs, split the repo with project references, exclude build output, and check tsserver logs.',
        long: `tsserver loads every file in the project of the open file.
A root tsconfig that includes the whole monorepo loads everything.
Use solution-style tsconfig files with project references, so the editor loads one package at a time.
Exclude dist, coverage and generated files.
Turn on the tsserver log or use "TypeScript: Open TS Server log" to see slow requests.
Pitfall: raising memory with maxTsServerMemory hides the cause.
Strong answer: scopes projects and measures.
Weak answer: "buy a faster laptop".`,
        follow: 'What is a solution-style tsconfig?',
        exercises: [
          {
            task: 'Fix this root tsconfig so the editor does not load every package.',
            description: 'Checks solution configs.',
            code: '{ "include": ["packages/**/*"] }',
            answer: 'Use files: [] and references to each package.',
            solution: '{ "files": [], "references": [{ "path": "packages/app" }, { "path": "packages/ui" }] }',
          },
          {
            task: 'Which folders do you exclude and why?',
            description: 'Checks hygiene.',
            answer: 'dist, build, coverage and generated code, because they double the files and slow everything.',
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'A monorepo has 30 packages. How do you set up TS builds and CI so the type check stays fast?',
        short: 'Project references with composite builds, affected-only tasks via Nx/Turborepo, remote caching, and isolatedDeclarations so declaration emit is parallel and cheap.',
        long: 'Each package is a composite project; tsc -b builds in dependency order and reuses .tsbuildinfo.\nThe task runner (Nx/Turbo) runs typecheck only for affected packages and caches results remotely across CI and developers.\nisolatedDeclarations (TS 5.5) lets tools emit .d.ts per file without a full typecheck.\nKeep package boundaries clean (no deep imports, no cycles) so the graph stays shallow.\nTrack metrics: typecheck time per package, cache hit rate.\nStrong candidate designs for both local DX and CI.\nWeak candidate runs one giant tsc over the whole repo.',
        ai: true,
        exercises: [
          {
            task: 'Fix this exported function so isolatedDeclarations passes.',
            description: 'Checks isolatedDeclarations requirements. Ask why inference is not allowed.',
            code: 'export function makeUser(name: string) { return { name, createdAt: new Date() }; }',
            answer: 'isolatedDeclarations requires explicit types on exports so .d.ts can be emitted per file without inference. Strong answers explain per-file .d.ts emit.',
            solution: `export function makeUser(name: string): { name: string; createdAt: Date } {
  return { name, createdAt: new Date() };
}`,
          },
          {
            task: 'Set up project references so `app` rebuilds only when `core` changes.',
            description: 'Checks project references setup. Ask what tsc -b skips.',
            answer: 'core is composite; app references it, and tsc -b uses .tsbuildinfo to skip up-to-date projects. Strong answers mention tsbuildinfo.',
            solution: `// core/tsconfig.json: { "compilerOptions": { "composite": true } }
// app/tsconfig.json:  { "references": [{ "path": "../core" }] }
// build: tsc -b app`,
          },
        ],
      },
      {
        q: 'Fix the CI pipeline. It type-checks and builds the whole monorepo on every PR.',
        code: `# ci.yml
- run: npx tsc -b
- run: npm run build --workspaces`,
        short: 'Run only affected packages and reuse cached results (local and remote) so CI time scales with the change, not the repo size.',
        long: 'Affected detection (Turbo/Nx filters) limits work to changed packages and their dependents.\nRemote caching shares outputs across CI runs and developers.\nProject references keep tsc incremental per package.\nTrack cache hit rate and p95 CI time as metrics.\nStrong candidate addresses correctness (cache keys, env inputs).\nWeak candidate buys bigger runners.',
        fix: `# ci.yml
- run: npx turbo run typecheck build --filter=...[origin/main]
# turbo.json: tasks.typecheck.dependsOn = ["^typecheck"], outputs = ["*.tsbuildinfo"]
# remote cache enabled via TURBO_TOKEN / TURBO_TEAM`,
        ai: true,
        exercises: [
          {
            task: 'Define the cache inputs, so a change in environment variables clears the cache.',
            description: 'Checks cache correctness. Ask what goes wrong otherwise.',
            answer: 'Declare relevant env vars and config files as inputs; otherwise stale cached builds can ship.',
            solution: `// turbo.json
// { "tasks": { "build": { "env": ["API_URL"], "inputs": ["src/**", "tsconfig.json"] } } }`,
          },
          {
            task: 'Measure the effect of the CI changes.',
            description: 'Checks data-driven decisions. Ask for metrics.',
            answer: 'Track median/p95 pipeline duration, cache hit rate and cost per PR before and after; report to the team.',
          },
        ],
      },
    ],
  },
  'Advanced Strategies and Integration': {
    junior: [
      {
        q: 'What does the "strict" option in tsconfig turn on?',
        short: 'strict turns on a family of checks — noImplicitAny, strictNullChecks, strictFunctionTypes, strictBindCallApply, strictPropertyInitialization, noImplicitThis, alwaysStrict, useUnknownInCatchVariables — for much safer types.',
        long: 'strict is a shorthand; new strict-family flags added in future TS versions are enabled automatically.\nstrictNullChecks is the most impactful: null/undefined must be handled explicitly.\nnoImplicitAny prevents silently untyped parameters.\nNot included: noUncheckedIndexedAccess, exactOptionalPropertyTypes, noImplicitOverride — worth enabling too.\nMigrating legacy code: enable flags one by one or per folder.\nStrong candidate names several flags and extras beyond strict.\nWeak candidate says "it makes TS stricter".',
        exercises: [
          {
            task: 'Fix the error reported under strict mode.',
            description: 'Checks noImplicitAny. Ask what flag reports this.',
            code: 'function greet(name) { return \'Hi \' + name; }',
            answer: 'noImplicitAny (part of strict) requires an explicit parameter type. Strong answers name the flag.',
            solution: 'function greet(name: string): string { return \'Hi \' + name; }',
          },
          {
            task: 'Fix the strictNullChecks error.',
            description: 'Checks strictNullChecks with DOM APIs. Ask for a safe fix.',
            code: `const el = document.getElementById('app');
el.textContent = 'ready';`,
            answer: 'getElementById returns HTMLElement | null; handle null instead of assuming the element exists. Weak answers use the ! operator. Strong answers handle null.',
            solution: `const el = document.getElementById('app');
if (el) el.textContent = 'ready';`,
          },
        ],
      },
      {
        q: 'Fix the error. It happens when you index an object with any string.',
        code: `const labels = { save: 'Save', cancel: 'Cancel' };
function label(key: string) { return labels[key]; }`,
        short: 'Under strict, an arbitrary string cannot index an object with known keys; restrict the parameter to keyof typeof labels.',
        long: 'Implicit any from index access is an error with noImplicitAny.\nkeyof typeof derives the allowed keys from the value.\nCallers get autocomplete and typo protection.\nStrong candidate uses typeof/keyof instead of an index signature.\nWeak candidate adds as any.',
        fix: `const labels = { save: 'Save', cancel: 'Cancel' };
type LabelKey = keyof typeof labels;
function label(key: LabelKey): string { return labels[key]; }`,
        exercises: [
          {
            task: 'Add an index signature for a dictionary with fully dynamic keys.',
            description: 'Checks when index signatures are appropriate. Ask about undefined.',
            answer: 'Record<string, string> allows any key; enable noUncheckedIndexedAccess to get string | undefined on reads.',
            solution: `const dict: Record<string, string> = {};
dict['x'] = 'y';`,
          },
          {
            task: 'Predict the type of k.',
            description: 'Checks keyof typeof. Ask for the result.',
            code: `const cfg = { a: 1, b: 2 };
type K = keyof typeof cfg;`,
            answer: 'K is "a" | "b".',
          },
        ],
      },
    ],
    middle: [
      {
        q: 'How do you safely type an API response? Is `as User` enough?',
        short: 'No: as User is an unchecked assertion that lies if the server sends something else. Validate at runtime with a schema (zod/valibot) and infer the TS type from it.',
        long: 'res.json() returns Promise<any>; casting moves the error from the boundary to somewhere deep in the UI.\nSchema validation checks shape at runtime and gives a single source of truth for type and validation.\nUse safeParse to handle failures gracefully and report them.\nAlternative: OpenAPI codegen for types plus validation on critical paths.\nPitfall: validating huge payloads on hot paths costs CPU — validate once at the boundary.\nStrong candidate explains assertion vs validation and failure handling.\nWeak candidate thinks generics like fetchJson<User>() add safety.',
        fix: `import { z } from 'zod';

const User = z.object({ id: z.string(), name: z.string() });
type User = z.infer<typeof User>;

async function getUser(id: string): Promise<User> {
  const res = await fetch(\`/api/users/\${id}\`);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return User.parse(await res.json());
}`,
        exercises: [
          {
            task: 'Replace the unsafe cast with a validated parse.',
            description: 'Checks runtime validation vs casts. Ask what happens with port: "80".',
            code: 'const cfg = JSON.parse(text) as { port: number };',
            answer: 'A cast trusts the input; a schema checks it and throws or reports on mismatch. Strong answers mention parse vs safeParse.',
            solution: `import { z } from 'zod';
const Cfg = z.object({ port: z.number().int() });
const cfg = Cfg.parse(JSON.parse(text));`,
          },
          {
            task: 'Write an assertion function that narrows unknown to a string.',
            description: 'Checks assertion functions. Ask how x is typed after the call.',
            answer: 'An asserts signature narrows the variable for the rest of the scope after the call. Strong answers explain asserts narrowing.',
            solution: `function assertString(v: unknown): asserts v is string {
  if (typeof v !== 'string') throw new TypeError('expected string');
}
const x: unknown = 'a';
assertString(x);
x.toUpperCase();`,
          },
        ],
      },
      {
        q: 'What are utility types like Partial, Pick, Omit, Record, and ReturnType? When do you use them?',
        short: 'Built-in mapped/conditional types that derive new types from existing ones, keeping a single source of truth: Partial for patches, Pick/Omit for subsets, Record for dictionaries, ReturnType/Parameters for function-derived types.',
        long: 'Deriving types prevents drift between related shapes (User vs UserUpdate).\nOmit is not distributive over unions; use a distributive version for discriminated unions.\nRequired, Readonly, NonNullable, Awaited, Extract, Exclude are also common.\nStrong candidate knows the Omit-on-union pitfall.\nWeak candidate redefines types by hand.',
        exercises: [
          {
            task: 'Type a PATCH payload from a User type without the id.',
            description: 'Checks combining utility types. Ask for the resulting type.',
            code: 'type User = { id: string; name: string; email: string };',
            answer: 'Omit removes id and Partial makes the rest optional.',
            solution: `type User = { id: string; name: string; email: string };
type UserPatch = Partial<Omit<User, 'id'>>;`,
          },
          {
            task: 'Predict the problem when you use Omit on a discriminated union.',
            description: 'Checks a common pitfall. Ask for the fix.',
            code: `type S = { kind: 'a'; x: number; id: string } | { kind: 'b'; y: string; id: string };
type T = Omit<S, 'id'>;`,
            answer: 'T keeps only common keys (kind), losing x and y. Use a distributive version: type DOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never.',
          },
        ],
      },
    ],
    senior: [
      {
        q: 'Explain `satisfies`, template literal types, and infer. Use an example from real code.',
        short: 'satisfies checks a value against a type without widening its inferred type; template literal types model string patterns; infer extracts parts of a type inside a conditional type.',
        long: 'satisfies (TS 4.9): validate config objects while keeping literal keys/values for autocomplete and precise inference — unlike an annotation, which widens to the annotated type.\nTemplate literal types build or match string patterns (event handler names, route paths, CSS units).\ninfer declares a type variable inside an extends clause, enabling parsing of strings, function params and promise values.\nReal uses: typed router params, onX handler names, i18n keys, typed fetch wrappers.\nPitfall: recursive template types on long strings can hit depth limits and slow the checker.\nStrong candidate gives a real use case and knows the trade-offs.\nWeak candidate confuses satisfies with as.',
        fix: `type Route = \`/users/\${string}\`;
const profile: Route = '/users/42';

type Params<T extends string> =
  T extends \`\${string}:\${infer P}/\${infer Rest}\` ? P | Params<Rest>
  : T extends \`\${string}:\${infer P}\` ? P
  : never;

type P = Params<'/users/:userId/posts/:postId'>; // 'userId' | 'postId'

const routes = {
  user: '/users/:id',
  post: '/posts/:postId',
} satisfies Record<string, string>;
type UserParams = Params<typeof routes.user>; // 'id' (literal type kept)`,
        exercises: [
          {
            task: 'Write a type that converts snake_case string literals to camelCase.',
            description: 'Checks recursive template literal types. Ask for the result.',
            answer: 'Recursive template literal types with infer split on underscores and capitalize the rest. Strong answers mention recursion limits.',
            solution: `type Camel<S extends string> = S extends \`\${infer H}_\${infer T}\` ? \`\${H}\${Capitalize<Camel<T>>}\` : S;
type X = Camel<'user_first_name'>; // 'userFirstName'`,
          },
          {
            task: 'Predict the type of each constant and explain the difference.',
            description: 'Checks satisfies vs annotation vs as const. Ask for the three types.',
            code: `const a: Record<string, string> = { mode: 'dark' };
const b = { mode: 'dark' } satisfies Record<string, string>;
const c = { mode: 'dark' } as const satisfies Record<string, string>;`,
            answer: 'a is Record<string, string> (keys lost); b is { mode: string } (checked, keys kept); c is { readonly mode: "dark" } (literal values kept too). Strong answers explain widening.',
          },
        ],
      },
      {
        q: 'Fix the types of this React polymorphic component with an `as` prop. The props must match the rendered element.',
        code: `function Box(props: { as?: string; [k: string]: any }) {
  const C = props.as ?? 'div';
  return <C {...props} />;
}`,
        short: 'Make the component generic over the element type and derive allowed props from ComponentPropsWithoutRef<E>, so href is only valid when as="a".',
        long: 'Index signatures with any accept everything and give no autocomplete.\nGeneric E extends ElementType ties props to the element.\nOmit avoids clashing with the as prop itself.\nRefs need forwardRef or React 19 ref-as-prop with ComponentPropsWithRef.\nStrong candidate discusses type complexity and compile cost.\nWeak candidate keeps any.',
        fix: `import type { ComponentPropsWithoutRef, ElementType } from 'react';
type BoxProps<E extends ElementType> = { as?: E } & Omit<ComponentPropsWithoutRef<E>, 'as'>;
function Box<E extends ElementType = 'div'>({ as, ...rest }: BoxProps<E>) {
  const C: ElementType = as ?? 'div';
  return <C {...rest} />;
}
// <Box as="a" href="/x" /> ok; <Box as="div" href="/x" /> error`,
        exercises: [
          {
            task: 'Type a component that forwards all native button props.',
            description: 'Checks ComponentProps usage. Ask for autocomplete behaviour.',
            answer: 'Extend ComponentPropsWithoutRef<"button"> so consumers get all native attributes typed.',
            solution: `import type { ComponentPropsWithoutRef } from 'react';
type ButtonProps = ComponentPropsWithoutRef<'button'> & { variant?: 'primary' | 'ghost' };
function Button({ variant = 'primary', ...rest }: ButtonProps) { return <button data-variant={variant} {...rest} />; }`,
          },
          {
            task: 'Predict whether this compiles.',
            description: 'Checks generic inference from as. Ask for the error.',
            code: '<Box as="button" href="/x" />',
            answer: 'It does not compile: href is not a valid button attribute, because props are derived from ComponentPropsWithoutRef<"button">.',
          },
        ],
      },
    ],
    techlead: [
      {
        q: 'Your API types are written by hand, and they stop matching the backend. How did you solve this in a real project?',
        short: 'Generate types from a single contract (OpenAPI/GraphQL/shared schemas), add runtime validation at the boundary, and run contract or codegen-diff checks in CI so drift fails the build.',
        long: 'Source of truth: backend publishes OpenAPI; frontend generates types/clients (openapi-typescript, orval) in CI.\nAlternatively shared zod schemas in a monorepo, or tRPC for TS-only stacks.\nRuntime validation on critical endpoints catches deploy-order mismatches.\nContract tests (Pact) or schema diff checks block breaking changes.\nProcess: versioning policy, deprecation windows, codegen diffs reviewed in PRs.\nStrong candidate describes a concrete rollout and its trade-offs (codegen noise, spec quality).\nWeak candidate suggests "being more careful".',
        ai: true,
        exercises: [
          {
            task: 'Fix how the generated types are used. A renamed backend field should break the build, not production.',
            description: 'Checks contract-driven typing. Ask how drift is detected.',
            code: 'const name = (data as any).fullName;',
            answer: 'Using the generated response type instead of any turns contract drift into a compile error when types are regenerated. Strong answers combine codegen with tsc.',
            solution: `import type { components } from './generated/api';
type User = components['schemas']['User'];
const getName = (data: User) => data.fullName;`,
          },
          {
            task: 'Describe a CI step that finds changes in the backend contract before merge.',
            description: 'Checks CI design for API contracts. Ask what blocks the merge.',
            answer: 'Regenerate types from the latest OpenAPI spec and fail on diff, then run tsc; together they surface breaking changes in the PR. Strong answers include diff and typecheck.',
            solution: `// ci: openapi-typescript $SPEC_URL -o src/generated/api.ts
//     git diff --exit-code src/generated || (echo 'API changed' && exit 1)
//     tsc --noEmit`,
          },
        ],
      },
      {
        q: 'Fix the step-by-step migration plan. A JS codebase with 300 thousand lines needs TypeScript, but feature work must not stop.',
        code: '// plan: rename all .js to .ts in one PR and fix errors',
        short: 'Migrate incrementally: allowJs lets JS and TS coexist, new code is TS, leaf modules convert first, and progress is tracked; a big-bang rename blocks the team and hides real errors behind any.',
        long: 'Big-bang migrations create massive merge conflicts and any-spam.\nallowJs + incremental conversion keeps shipping.\nStart strict for new files; use ts-expect-error with tickets for legacy issues.\nMetrics and lint (no-explicit-any as warning → error) show progress.\nStrong candidate includes ownership and timeline.\nWeak candidate converts everything with any.',
        fix: `// tsconfig.json
// { "compilerOptions": { "allowJs": true, "checkJs": false, "strict": true, "noEmit": true } }
// 1. Add tsconfig with allowJs; new files in .ts
// 2. Convert leaf modules first; use // @ts-check on JS gradually
// 3. Track progress (% TS files, # of any / ts-expect-error) in CI`,
        ai: true,
        exercises: [
          {
            task: 'Type-check a JS file without converting it to TS.',
            description: 'Checks JSDoc + @ts-check. Ask what it catches.',
            code: `// utils.js
export function add(a, b) { return a + b; }`,
            answer: '@ts-check with JSDoc types enables checking in JS files; errors show in the editor and tsc.',
            solution: `// @ts-check
/** @param {number} a @param {number} b @returns {number} */
export function add(a, b) { return a + b; }`,
          },
          {
            task: 'Track the remaining migration work in CI.',
            description: 'Checks measurable progress. Ask for metrics.',
            answer: 'Count .js vs .ts files and occurrences of any/@ts-expect-error per PR; fail if the count increases (ratchet).',
          },
        ],
      },
    ],
  },
};
