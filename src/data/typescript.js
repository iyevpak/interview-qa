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
            task: 'Fix the code so it compiles.',
            description: 'Checks that unions need a type alias.',
            code: 'interface Status = \'on\' | \'off\';',
            answer: 'Interfaces describe only object shapes. Unions need a type alias.',
            solution: 'type Status = \'on\' | \'off\';',
          },
          {
            task: 'Predict the type of User after both declarations.',
            description: 'Checks declaration merging of interfaces.',
            code: `interface User { name: string }
interface User { age: number }`,
            answer: 'User has both name and age: interfaces with the same name merge. Common mistake: expecting a duplicate error like with type aliases.',
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
            task: 'Fix the error without using a type assertion.',
            description: 'Checks required vs optional properties.',
            code: `interface Book { title: string; year?: number }
const b: Book = { year: 2020 };`,
            answer: 'title is required, so it must be added. Common mistake: writing as Book, which hides the missing data.',
            solution: 'const b: Book = { title: \'TS\', year: 2020 };',
          },
          {
            task: 'Make id read-only and spot the error.',
            description: 'Checks the readonly modifier.',
            code: `interface User { id: number; name: string }
const u: User = { id: 1, name: 'A' };
u.id = 2;`,
            answer: 'Add readonly before id; then u.id = 2 is a compile error. readonly is compile-time only and does not freeze the object.',
            solution: 'interface User { readonly id: number; name: string }',
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
            task: 'Add a typed global property to window.',
            description: 'Checks global augmentation via merging.',
            code: 'window.appVersion = \'1.0\'; // error',
            answer: 'Augment the global Window interface in a .d.ts file; interfaces merge, so the property is added.',
            solution: `declare global {
  interface Window { appVersion: string }
}
export {};`,
          },
          {
            task: 'Predict whether this compiles.',
            description: 'Checks that type aliases cannot merge.',
            code: `type User = { name: string };
type User = { age: number };`,
            answer: 'It fails with "Duplicate identifier". Only interfaces support declaration merging.',
          },
        ],
      },
      {
        q: 'Properties conflict. What is the difference between `extends` on interfaces and the ampersand (&) on type aliases?',
        short: 'Interface extends reports an error when a property type is incompatible; an intersection silently produces never for conflicting properties.',
        long: 'interface B extends A { x: number } errors immediately if A.x is string — good, early feedback.\ntype B = A & { x: number } compiles; B.x becomes string & number = never, and the error appears later at usage.\nInterfaces extending are also cached by name and are faster for the checker than large intersections.\nIntersections are still needed for combining unions or generic types.\nStrong candidate mentions both error timing and performance.\nWeak candidate says they are equivalent.',
        exercises: [
          {
            task: 'Predict the type of the id property.',
            description: 'Checks intersection of conflicting properties.',
            code: `type A = { id: string };
type B = { id: number };
type C = A & B;`,
            answer: 'C["id"] is never, because string & number has no values. extends would report the conflict right away.',
          },
          {
            task: 'Predict whether this interface compiles.',
            description: 'Checks extends conflict errors.',
            code: `interface A { id: string }
interface B extends A { id: number }`,
            answer: 'It fails: B incorrectly extends A because number is not assignable to string. extends checks compatibility, & silently produces never.',
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
            task: 'Explain why only the first line errors.',
            description: 'Checks excess property checks on fresh literals.',
            code: `type P = { x: number };
const a: P = { x: 1, y: 2 };
const t = { x: 1, y: 2 };
const b: P = t;`,
            answer: 'Excess property checks apply only to fresh object literals. A variable is checked structurally, so extra y is allowed.',
          },
          {
            task: 'Name two ways to allow extra properties on Opts.',
            description: 'Checks index signatures and widening options.',
            code: 'interface Opts { color?: string }',
            answer: 'Add an index signature like [key: string]: unknown, or assign through a variable. Prefer the explicit index signature.',
            solution: 'interface Opts { color?: string; [key: string]: unknown }',
          },
        ],
      },
      {
        q: 'For a public library API, when would you choose a type alias over an interface? How does it affect the users of the library?',
        short: 'Interfaces are open to augmentation by consumers and give named error messages; type aliases are closed and required for unions/mapped types. Choose deliberately because augmentation is part of the public contract.',
        long: 'Public interface: consumers can augment it (e.g. theme typing, plugin options) — a feature or a compatibility burden.\nType alias: sealed; good for unions, discriminated results, derived types.\nError messages and hover show interface names; complex aliases may be expanded.\nChanging interface → type later is a breaking change for anyone augmenting.\nStrong candidate mentions augmentation as API surface (e.g. MUI theme, styled-components DefaultTheme).\nWeak candidate talks only about syntax.',
        exercises: [
          {
            task: 'Spot the risk for library users.',
            description: 'Checks that exported interfaces can be augmented.',
            code: 'export interface Theme { color: string }',
            answer: 'Users can merge new fields into an exported interface. Good for plugins, but it makes the contract open; use type to keep it closed.',
          },
          {
            task: 'Write a public type that interfaces cannot express.',
            description: 'Checks when a type alias is required.',
            answer: 'Unions, mapped and conditional types need type aliases, for example a result type with two variants.',
            solution: `export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };`,
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
            task: 'Name the typescript-eslint rule that enforces interface or type.',
            description: 'Checks knowledge of team lint tooling.',
            answer: '@typescript-eslint/consistent-type-definitions. Pick one default, auto-fix it, and document exceptions like unions.',
          },
          {
            task: 'Respond to this review comment.',
            description: 'Checks how a lead settles style debates.',
            code: '"Please change all types to interfaces." — on a feature PR.',
            answer: 'Move the style debate out of feature PRs: decide once in a short ADR, enforce with a lint rule, and migrate separately.',
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
            task: 'Fix the duplication between the two packages.',
            description: 'Checks single source of truth for shared types.',
            code: `// web/types.ts:    interface User { id: string; name: string }
// mobile/types.ts: interface User { id: string; fullName: string }`,
            answer: 'Move User into one shared package and import it everywhere. Better: generate it from the API schema.',
            solution: `// packages/types/src/user.ts
export interface User { id: string; name: string }
// apps: import type { User } from '@acme/types';`,
          },
          {
            task: 'Name two ways to keep frontend types in sync with the backend.',
            description: 'Checks schema-driven type generation.',
            answer: 'Generate types from OpenAPI (openapi-typescript) or GraphQL codegen, or share a Zod schema and infer types from it.',
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
            task: 'Fix the subclass constructor.',
            description: 'Checks calling super before this.',
            code: `class Animal { constructor(public name: string) {} }
class Dog extends Animal {
  constructor(name: string) { this.name = name; }
}`,
            answer: 'A derived constructor must call super() before using this.',
            solution: `class Dog extends Animal {
  constructor(name: string) { super(name); }
}`,
          },
          {
            task: 'Predict whether this compiles.',
            description: 'Checks that implements only checks shape.',
            code: `interface Runner { run(): void }
class Bot implements Runner {}`,
            answer: 'It fails: Bot is missing run. implements only checks the shape; it adds no code.',
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
            task: 'Fix the override so it compiles with noImplicitOverride.',
            description: 'Checks the override keyword.',
            code: `class Shape { area() { return 0; } }
class Square extends Shape {
  area() { return 4; }
}`,
            answer: 'With noImplicitOverride, overriding members must be marked override. It also catches typos in method names.',
            solution: `class Square extends Shape {
  override area() { return 4; }
}`,
          },
          {
            task: 'Spot the problem in this override.',
            description: 'Checks override signature compatibility.',
            code: `class A { get(id: number): string { return ''; } }
class B extends A { get(id: string): string { return id; } }`,
            answer: 'B.get is not compatible with A.get: the parameter type changed from number to string, so it errors.',
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
            description: 'Checks field initialization order with inheritance.',
            code: `class Base { constructor() { this.show(); } show() {} }
class Child extends Base {
  msg = 'hi';
  show() { console.log(this.msg); }
}
new Child();`,
            answer: 'It logs undefined. The base constructor runs before child fields are initialized.',
          },
          {
            task: 'Fix the code so init runs after child fields are set.',
            description: 'Checks avoiding virtual calls in constructors.',
            code: 'class Base { constructor() { this.init(); } init() {} }',
            answer: 'Do not call overridable methods in a constructor. Call init explicitly after construction, or use a factory.',
            solution: `class Base { init() {} }
const c = new Child();
c.init();`,
          },
        ],
      },
      {
        q: 'What are getters, setters, and accessors in TS classes? What are the typing rules since TS 5.1?',
        short: 'get/set define computed properties; since TS 5.1 getter and setter types may be unrelated (setter can accept wider input), as long as both are explicitly annotated.',
        long: 'Accessors run code on read/write, useful for validation or derived state.\nTS 4.3 allowed a setter to accept a wider type than the getter returns; TS 5.1 removed the requirement that they be related.\nAccessors are on the prototype, not own properties: JSON.stringify skips them.\nauto-accessor keyword (accessor x) exists for standard decorators.\nStrong candidate mentions the type rule and serialization behaviour.\nWeak candidate only knows syntax.',
        exercises: [
          {
            task: 'Predict whether this compiles in TS 5.1+.',
            description: 'Checks unrelated getter and setter types.',
            code: `class Box {
  #v = '';
  get value(): string { return this.#v; }
  set value(v: string | number) { this.#v = String(v); }
}`,
            answer: 'It compiles. Since TS 5.1 getter and setter types can be unrelated, so the setter can accept more.',
          },
          {
            task: 'Write a getter that returns the full name.',
            description: 'Checks basic accessor syntax.',
            code: 'class User { constructor(public first: string, public last: string) {} }',
            answer: 'Use get fullName(); it is read like a property, without parentheses.',
            solution: `class User {
  constructor(public first: string, public last: string) {}
  get fullName() { return \`\${this.first} \${this.last}\`; }
}`,
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
            task: 'Fix the code so Shape cannot be created directly.',
            description: 'Checks abstract classes.',
            code: `class Shape { area(): number { return 0; } }
const s = new Shape();`,
            answer: 'Mark the class and method abstract; then new Shape() is a compile error and subclasses must implement area.',
            solution: 'abstract class Shape { abstract area(): number; }',
          },
          {
            task: 'Refactor inheritance to composition.',
            description: 'Checks favoring composition over deep hierarchies.',
            code: `class LoginForm extends Form {}
class AdminLoginForm extends LoginForm {}`,
            answer: 'Pass behavior in as parts instead of inheriting it. Each part can be tested and swapped alone.',
            solution: `function createLoginForm(opts: { validator: Validator; audit?: Audit }) {
  return { submit: (d: Creds) => opts.validator.check(d) && opts.audit?.log(d) };
}`,
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
            description: 'Checks that abstract members must be implemented.',
            code: `abstract class Job { abstract run(): void }
class Email extends Job {}`,
            answer: 'It fails: non-abstract class Email does not implement abstract member run.',
          },
          {
            task: 'Fix the code so subclasses cannot change render.',
            description: 'Checks template method with a private helper.',
            code: `abstract class Report {
  render() { return this.header() + this.body(); }
  abstract body(): string;
}`,
            answer: 'TS has no final, but you can keep header private and document render. Composition with a body function is a safer option.',
            solution: `abstract class Report {
  render() { return this.#header() + this.body(); }
  #header() { return 'Report\\n'; }
  protected abstract body(): string;
}`,
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
            task: 'Predict the output.',
            description: 'Checks that JSON loses class methods.',
            code: `class Money { constructor(public cents: number) {} format() { return '$' + this.cents / 100; } }
const m: Money = JSON.parse(JSON.stringify(new Money(500)));
m.format();`,
            answer: 'TypeError: m.format is not a function. JSON.parse returns a plain object; the type annotation lies.',
          },
          {
            task: 'Fix the code so data from JSON becomes a real instance.',
            description: 'Checks explicit mapping at boundaries.',
            code: 'const m: Money = JSON.parse(json);',
            answer: 'Parse to a plain DTO type, then map it with a factory at the boundary.',
            solution: `type MoneyDto = { cents: number };
const dto: MoneyDto = JSON.parse(json);
const m = new Money(dto.cents);`,
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
            task: 'Refactor the base class into injected helpers.',
            description: 'Checks composition instead of a god base class.',
            code: `class UserService extends BaseService {
  load() { return this.retry(() => this.http('/u')); }
}`,
            answer: 'Inject small dependencies instead of inheriting them; changes in one helper no longer break all services.',
            solution: `class UserService {
  constructor(private http: Http, private retry: Retry) {}
  load() { return this.retry(() => this.http('/u')); }
}`,
          },
          {
            task: 'Name two risks of a shared BaseService.',
            description: 'Checks understanding of fragile base classes.',
            answer: 'Fragile base class: one change breaks many children. Tight coupling: every service gets helpers it does not need.',
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
            description: 'Checks private and protected access.',
            code: `class A { private x = 1; protected y = 2; z = 3; }
const a = new A();
a.x; a.y; a.z;`,
            answer: 'a.x and a.y error: private is only for A, protected for A and subclasses. a.z is public.',
          },
          {
            task: 'Fix the subclass access error.',
            description: 'Checks protected visibility in subclasses.',
            code: `class A { private count = 0; }
class B extends A { inc() { this.count++; } }`,
            answer: 'private members are not visible in subclasses. Change it to protected.',
            solution: 'class A { protected count = 0; }',
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
            task: 'Fix the code by adding a public method.',
            description: 'Checks encapsulation with methods.',
            code: `class Wallet { private balance = 0; }
new Wallet().balance = 100;`,
            answer: 'Keep balance private and change it through a method that can validate the value.',
            solution: `class Wallet {
  private balance = 0;
  deposit(n: number) { if (n > 0) this.balance += n; }
}`,
          },
          {
            task: 'Make the property readable outside but writable only inside.',
            description: 'Checks private field with a getter.',
            code: 'class Counter { count = 0; inc() { this.count++; } }',
            answer: 'Use a private field with a public getter.',
            solution: `class Counter {
  #count = 0;
  get count() { return this.#count; }
  inc() { this.#count++; }
}`,
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
            description: 'Checks that TS private is compile-time only.',
            code: `class A { private secret = 42; }
console.log((new A() as any).secret);`,
            answer: 'It logs 42. TS private is erased at runtime; only #private is truly hidden.',
          },
          {
            task: 'Predict the output.',
            description: 'Checks JS hash private fields at runtime.',
            code: `class A { #secret = 42; }
console.log(Object.keys(new A()), JSON.stringify(new A()));`,
            answer: 'It logs [] and {}. #private fields are not own enumerable properties and cannot be read outside the class.',
          },
        ],
      },
      {
        q: 'Can a subclass make a protected member public? Can it make a public member private?',
        short: 'A subclass may widen visibility (protected → public) but not narrow it (public → private/protected), because that would break substitutability.',
        long: 'Liskov substitution: code using the base type must still be able to access its public members via a subclass instance.\nRedeclaring a protected member as public in a subclass is allowed.\nMaking a public member private in a subclass is a compile error.\nPrivate members cannot be redeclared at all in subclasses with the same name.\nStrong candidate explains the reason (substitutability).\nWeak candidate guesses either way.',
        exercises: [
          {
            task: 'Predict whether this compiles.',
            description: 'Checks widening visibility in subclasses.',
            code: `class A { protected id = 1; }
class B extends A { public id = 1; }`,
            answer: 'It compiles: a subclass can make a protected member public.',
          },
          {
            task: 'Predict whether this compiles.',
            description: 'Checks narrowing visibility in subclasses.',
            code: `class A { id = 1; }
class B extends A { private id = 1; }`,
            answer: 'It fails: a public member cannot become private, because B would no longer be assignable to A.',
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
            task: 'Predict which line fails and when.',
            description: 'Checks readonly vs Object.freeze.',
            code: `const a: { readonly x: number } = { x: 1 };
const b = Object.freeze({ x: 1 });
(a as any).x = 2; (b as any).x = 2;`,
            answer: 'Neither fails at compile time due to any. At runtime a changes; b throws in strict mode, since only freeze works at runtime.',
          },
          {
            task: 'Choose a modifier for an SDK internal field.',
            description: 'Checks runtime privacy for public APIs.',
            code: 'export class Client { private apiKey: string; }',
            answer: 'Use #apiKey: TS private is visible at runtime and in console. #private is truly hidden from users.',
            solution: 'export class Client { #apiKey: string; constructor(k: string) { this.#apiKey = k; } }',
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
            task: 'Fix the leak so the token is not serialized.',
            description: 'Checks hash private fields with JSON.',
            code: `class Api { private token = 'secret'; }
JSON.stringify(new Api()); // {"token":"secret"}`,
            answer: 'Use a #private field; JSON.stringify skips it because it is not an own property.',
            solution: `class Api { #token = 'secret'; }
JSON.stringify(new Api()); // {}`,
          },
          {
            task: 'Write a toJSON that hides the token.',
            description: 'Checks custom serialization control.',
            code: 'class Api { constructor(public url: string, private token: string) {} }',
            answer: 'Define toJSON returning only safe fields. JSON.stringify calls it automatically.',
            solution: `class Api {
  constructor(public url: string, private token: string) {}
  toJSON() { return { url: this.url }; }
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
            task: 'Fix package.json so internal files cannot be imported.',
            description: 'Checks the exports field.',
            code: '{ "name": "@acme/ui", "main": "dist/index.js" }',
            answer: 'Add an exports map; deep imports of files not listed fail in Node and bundlers.',
            solution: `{ "name": "@acme/ui",
  "exports": { ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" } } }`,
          },
          {
            task: 'Name two tools that block imports of internal files.',
            description: 'Checks boundary enforcement tooling.',
            answer: 'The package.json exports field, plus lint rules like no-restricted-imports or eslint-plugin-boundaries in CI.',
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
            task: 'Pick private or #private for each case.',
            description: 'Checks a practical rule for privacy.',
            code: '// 1) SDK secret key   2) test spies need access to a helper',
            answer: '1) #private: real runtime privacy. 2) TS private: tests can access via bracket notation, and it is cheaper.',
          },
          {
            task: 'Name a way to enforce hash private fields in lint.',
            description: 'Checks enforcing team conventions.',
            answer: 'ESLint no-restricted-syntax can ban the TS private keyword (selector on accessibility). Document the rule in the style guide.',
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
            task: 'Write a generic function that returns the first item.',
            description: 'Checks a basic generic type parameter.',
            code: 'function first(arr) { return arr[0]; }',
            answer: 'Use T for the element type so the return type follows the input.',
            solution: `function first<T>(arr: T[]): T | undefined {
  return arr[0];
}`,
          },
          {
            task: 'Predict the type of x.',
            description: 'Checks generic type inference.',
            code: `function identity<T>(v: T): T { return v; }
const x = identity('hi');`,
            answer: 'x is "hi": T is inferred as the literal type because x is const. With let it would be string.',
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
            task: 'Fix the function so it keeps the element type.',
            description: 'Checks replacing any with a generic.',
            code: 'function last(items: any[]) { return items[items.length - 1]; }',
            answer: 'Use a generic T; any loses all type information.',
            solution: `function last<T>(items: T[]): T | undefined {
  return items[items.length - 1];
}`,
          },
          {
            task: 'Predict the type of r.',
            description: 'Checks inference of generic array types.',
            code: `function wrap<T>(items: T[]) { return { items }; }
const r = wrap([1, 'a']);`,
            answer: 'r is { items: (string | number)[] }. T is inferred as the union of the element types.',
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
            task: 'Write a typed getProp using keyof.',
            description: 'Checks keyof with indexed access types.',
            code: 'function getProp(obj: any, key: string) { return obj[key]; }',
            answer: 'Constrain K to keyof T and return T[K], so the result type matches the key.',
            solution: `function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}`,
          },
          {
            task: 'Predict the error.',
            description: 'Checks keyof constraint checking.',
            code: `declare function getProp<T, K extends keyof T>(o: T, k: K): T[K];
getProp({ a: 1 }, 'b');`,
            answer: 'Error: "b" is not assignable to "a". The key must be keyof the object.',
          },
        ],
      },
      {
        q: 'What is the difference between `T extends X` in a generic constraint and in a conditional type?',
        short: 'In a constraint (<T extends X>) it restricts which types may be passed; in a conditional type (T extends X ? A : B) it is a test that selects a branch and distributes over unions.',
        long: 'Constraint: compile error if the argument does not satisfy X; inside the function T has X\'s members.\nConditional: no error, just evaluates to A or B; with naked T it distributes over union members.\ninfer is only allowed in conditional types.\nPitfall: expecting a constraint to narrow at runtime — it is purely static.\nStrong candidate gives examples of both and mentions distribution.\nWeak candidate thinks both are the same thing.',
        exercises: [
          {
            task: 'Predict the type of R.',
            description: 'Checks extends in conditional types.',
            code: `type IsString<T> = T extends string ? 'yes' : 'no';
type R = IsString<'a' | 1>;`,
            answer: 'R is "yes" | "no": conditional types distribute over unions.',
          },
          {
            task: 'Fix the call so it compiles.',
            description: 'Checks extends as a generic constraint.',
            code: `function len<T extends { length: number }>(x: T) { return x.length; }
len(42);`,
            answer: 'The constraint requires a length property. Pass a string or array instead.',
            solution: 'len(\'42\');',
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
            task: 'Write a type that unwraps a Promise.',
            description: 'Checks infer in conditional types.',
            code: 'type A = MyAwaited<Promise<number>>; // number',
            answer: 'Use infer to extract the inner type. Built-in Awaited also handles nested promises.',
            solution: 'type MyAwaited<T> = T extends Promise<infer U> ? MyAwaited<U> : T;',
          },
          {
            task: 'Write a shallow DeepReadonly for nested objects.',
            description: 'Checks recursive mapped types.',
            answer: 'Map every key to readonly and recurse into objects. Edge cases: functions, arrays, Map and Set need special handling.',
            solution: `type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};`,
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
            task: 'Fix the callback type to match the event name.',
            description: 'Checks generic keys with lookup types.',
            code: `type Events = { click: MouseEvent; keydown: KeyboardEvent };
function on(name: keyof Events, cb: (e: any) => void) {}`,
            answer: 'Make the name generic K and type the callback with Events[K].',
            solution: 'function on<K extends keyof Events>(name: K, cb: (e: Events[K]) => void) {}',
          },
          {
            task: 'Predict whether this compiles.',
            description: 'Checks lib.dom event map typing.',
            code: `window.addEventListener('keydown', e => e.key);
window.addEventListener('click', e => e.key);`,
            answer: 'The second line fails: click gives a MouseEvent, which has no key. DOM types use WindowEventMap.',
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
            task: 'Spot the problem in this type.',
            description: 'Checks readability of generic types.',
            code: `type Deep<T, D extends number[] = []> = D['length'] extends 10 ? T
  : { [K in keyof T]: Deep<T[K], [...D, 1]> };`,
            answer: 'Hard to read and slow for the checker. Prefer simpler types or explicit interfaces unless the gain is clear.',
          },
          {
            task: 'Name two signals that a generic type is too clever.',
            description: 'Checks judgement on type complexity.',
            answer: 'Errors nobody can read, and slow IDE or tsc (seen in --extendedDiagnostics). Also: only one person can change it.',
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
            task: 'Fix the client so the endpoint decides the response type.',
            description: 'Checks mapping endpoints to types.',
            code: 'const u = await api<User>(\'/orders/1\');',
            answer: 'Map each path to its response type, so callers do not write generics by hand.',
            solution: `type Routes = { '/users': User[]; '/orders': Order[] };
async function api<P extends keyof Routes>(p: P): Promise<Routes[P]> {
  return (await fetch(p)).json();
}`,
          },
          {
            task: 'Spot the problem.',
            description: 'Checks that a generic return is an unchecked cast.',
            code: `async function get<T>(url: string): Promise<T> {
  return (await fetch(url)).json();
}`,
            answer: 'T is only a cast; nothing checks the data. Validate with a schema (like Zod) or generate types.',
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
            task: 'Predict the output.',
            description: 'Checks when decorators run.',
            code: `function log(v: any, ctx: ClassMethodDecoratorContext) { console.log('dec', String(ctx.name)); }
class A { @log run() {} }
console.log('end');`,
            answer: 'It logs "dec run" then "end". Decorators run once when the class is defined, not on each call.',
          },
          {
            task: 'Name two libraries that use decorators.',
            description: 'Checks real-world decorator awareness.',
            answer: 'Angular (@Component) and NestJS (@Injectable). MobX and TypeORM also use them.',
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
            task: 'Fix the decorator for TS 5 standard decorators.',
            description: 'Checks the new method decorator signature.',
            code: 'function bound(target: any, key: string, desc: PropertyDescriptor) {}',
            answer: 'Standard method decorators get (value, context), not (target, key, descriptor).',
            solution: `function bound(value: Function, ctx: ClassMethodDecoratorContext) {
  ctx.addInitializer(function () { (this as any)[ctx.name] = value.bind(this); });
}`,
          },
          {
            task: 'Name the tsconfig flag that switches decorator modes.',
            description: 'Checks legacy vs standard decorators.',
            answer: 'experimentalDecorators: true uses legacy decorators. Without it TS 5 uses standard TC39 decorators.',
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
            task: 'Write a method decorator that logs the result.',
            description: 'Checks replacing a method in a decorator.',
            answer: 'Return a new function that calls the original with the same this and args.',
            solution: `function log<T extends (...a: any[]) => any>(fn: T, ctx: ClassMethodDecoratorContext) {
  return function (this: unknown, ...args: any[]) {
    const r = fn.apply(this, args); console.log(String(ctx.name), r); return r;
  } as T;
}`,
          },
          {
            task: 'Spot the bug in this decorator.',
            description: 'Checks preserving this in wrappers.',
            code: `function log(fn: any, ctx: ClassMethodDecoratorContext) {
  return (...args: any[]) => fn(...args);
}`,
            answer: 'The arrow function loses this; fn is called without the instance. Use a regular function and fn.apply(this, args).',
          },
        ],
      },
      {
        q: 'One member has several decorators. In what order are they evaluated and applied?',
        short: 'Decorator expressions are evaluated top to bottom, but applied bottom to top (closest to the member first), like function composition.',
        long: '@a @b method(): a() and b() factories evaluate in order a, b; then b\'s decorator wraps first, then a wraps the result.\nThe outermost (top) decorator runs first at call time because it wraps everything.\nOrder matters for e.g. @log @cache vs @cache @log.\nStrong candidate explains it as composition a(b(method)).\nWeak candidate assumes top-to-bottom application.',
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks decorator evaluation and application order.',
            code: `const d = (n: string) => { console.log('eval', n); return () => console.log('apply', n); };
class A { @d('a') @d('b') m() {} }`,
            answer: 'eval a, eval b, apply b, apply a. Expressions run top-down, decorators apply bottom-up.',
          },
          {
            task: 'Fix the order so validation runs before logging.',
            description: 'Checks how stacking order affects wrappers.',
            code: 'class A { @validate @log save() {} }',
            answer: 'The top decorator wraps last, so it runs first on call. Put @log on top if logging should wrap validation.',
            solution: 'class A { @log @validate save() {} }',
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
            task: 'Name two differences between legacy and standard decorators.',
            description: 'Checks migration knowledge.',
            answer: 'Standard ones get (value, context), not descriptors. They do not support parameter decorators or emitDecoratorMetadata.',
          },
          {
            task: 'Spot the migration risk.',
            description: 'Checks parameter decorators in standard mode.',
            code: 'class S { constructor(@Inject(TOKEN) private dep: Dep) {} }',
            answer: 'Parameter decorators do not exist in standard decorators. This code needs experimentalDecorators to compile.',
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
            task: 'Fix the field decorator to set a default.',
            description: 'Checks field initializer return in standard decorators.',
            code: `function def(v: undefined, ctx: ClassFieldDecoratorContext) {
  Object.getOwnPropertyDescriptor(ctx, 'value');
}`,
            answer: 'Field decorators get no descriptor. Return an initializer function that changes the initial value.',
            solution: `function def(n: number) {
  return (_: undefined, ctx: ClassFieldDecoratorContext) => (init: number) => init ?? n;
}`,
          },
          {
            task: 'Write a field decorator that clamps the initial value to a minimum.',
            description: 'Checks field initializer functions.',
            answer: 'Return a function that receives the initial value and returns the new one.',
            solution: `function min(n: number) {
  return (_: undefined, _c: ClassFieldDecoratorContext) => (v: number) => Math.max(v, n);
}`,
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
            task: 'Rewrite this decorator idea as a React hook.',
            description: 'Checks idiomatic React alternatives.',
            code: '@withAuth class Page extends React.Component {}',
            answer: 'Function components cannot be decorated; use a hook or wrapper component instead.',
            solution: `function Page() {
  const user = useAuth();
  return user ? <Dashboard /> : <Login />;
}`,
          },
          {
            task: 'Name two reasons to avoid decorators in React code.',
            description: 'Checks tradeoff reasoning.',
            answer: 'Decorators work only on classes, and React uses function components. They also add build config and hide behavior.',
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
            task: 'Fix tsconfig so NestJS DI works again.',
            description: 'Checks emitDecoratorMetadata requirements.',
            code: '{ "compilerOptions": { "strict": true } }',
            answer: 'NestJS needs legacy decorators and metadata to read constructor types.',
            solution: `{ "compilerOptions": { "strict": true,
  "experimentalDecorators": true, "emitDecoratorMetadata": true } }`,
          },
          {
            task: 'Spot why the dependency is undefined.',
            description: 'Checks that type-only imports lose metadata.',
            code: `import type { UsersRepo } from './repo';
@Injectable() class S { constructor(private repo: UsersRepo) {} }`,
            answer: 'import type is erased, so no runtime class exists for metadata. Use a normal import for injected classes.',
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
            task: 'Fix the code by narrowing the union.',
            description: 'Checks typeof narrowing.',
            code: 'function len(x: string | string[]) { return x.length + x.trim(); }',
            answer: 'trim exists only on string; narrow with typeof first.',
            solution: `function len(x: string | string[]) {
  return typeof x === 'string' ? x.trim().length : x.length;
}`,
          },
          {
            task: 'Predict which call is allowed.',
            description: 'Checks members common to a union.',
            code: `declare const v: string | number;
v.toString(); v.toFixed();`,
            answer: 'Only toString works: you can call only members shared by every union member.',
          },
        ],
      },
      {
        q: 'What is the difference between a union type and an intersection type?',
        short: 'A union (A | B) is a value that is one of the types; an intersection (A & B) is a value that is all of them at once.',
        long: 'Union: fewer guaranteed members, must narrow before using type-specific ones.\nIntersection: combines members of object types; conflicting primitives become never.\nLiteral unions ("a" | "b") model fixed sets of values.\nStrong candidate gives examples and mentions narrowing.\nWeak candidate mixes them up.',
        exercises: [
          {
            task: 'Predict the type of the name property in C.',
            description: 'Checks union vs intersection members.',
            code: `type A = { name: string; a: 1 };
type B = { name: string; b: 2 };
type C = A | B;`,
            answer: 'C has only name directly; a and b need narrowing. With A & B, all three exist.',
          },
          {
            task: 'Write a type that has fields of both A and B.',
            description: 'Checks intersection types.',
            code: `type A = { id: string };
type B = { createdAt: Date };`,
            answer: 'Use an intersection; the value must have all fields of both.',
            solution: `type AB = A & B;
const x: AB = { id: '1', createdAt: new Date() };`,
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
            task: 'Fix the state type so data and error cannot coexist.',
            description: 'Checks discriminated unions.',
            code: 'type State = { loading: boolean; data?: User; error?: string };',
            answer: 'Use a union with a status tag; each state has only its own fields.',
            solution: `type State =
  | { status: 'loading' }
  | { status: 'ok'; data: User }
  | { status: 'error'; error: string };`,
          },
          {
            task: 'Fix the access by narrowing on status.',
            description: 'Checks narrowing by discriminant.',
            code: `type S = { status: 'ok'; data: string } | { status: 'error'; error: string };
function show(s: S) { return s.data; }`,
            answer: 'data exists only when status is "ok"; check the tag first.',
            solution: `function show(s: S) {
  return s.status === 'ok' ? s.data : s.error;
}`,
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
            task: 'Predict the type of ids in TS 5.5+.',
            description: 'Checks inferred type predicates.',
            code: `const items = [{ id: '1' }, null];
const ids = items.filter(i => i !== null);`,
            answer: 'ids is { id: string }[]. TS 5.5 infers the type predicate from the arrow function.',
          },
          {
            task: 'Write a type guard for strings.',
            description: 'Checks user-defined type predicates.',
            code: 'const vals: unknown[] = [\'a\', 1];',
            answer: 'Return x is string so callers like filter can narrow.',
            solution: `const isString = (x: unknown): x is string => typeof x === 'string';
const strs = vals.filter(isString); // string[]`,
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
            task: 'Predict the type of R.',
            description: 'Checks intersection of unions.',
            code: 'type R = (\'a\' | \'b\') & (\'b\' | \'c\');',
            answer: 'R is "b": only the common member stays.',
          },
          {
            task: 'Predict the type of X.',
            description: 'Checks intersection of primitive types.',
            code: 'type X = string & number;',
            answer: 'X is never: no value is both a string and a number.',
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
            task: 'Write overloads so the return type follows the input.',
            description: 'Checks function overloads.',
            code: 'function parse(x: string | number): string | number { return x; }',
            answer: 'Add one overload per input type; callers see the matching return type.',
            solution: `function parse(x: string): string;
function parse(x: number): number;
function parse(x: string | number) { return x; }`,
          },
          {
            task: 'Predict the type of n.',
            description: 'Checks generic conditional return types.',
            code: `declare function f<T extends string | number>(x: T): T extends string ? string : number;
const n = f(2);`,
            answer: 'n is number: T is inferred as 2, which does not extend string.',
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
            task: 'Write a Result type for API calls.',
            description: 'Checks typed error handling.',
            answer: 'A discriminated union makes callers handle errors; thrown exceptions are untyped.',
            solution: `type Result<T, E = string> =
  | { ok: true; data: T }
  | { ok: false; error: E };`,
          },
          {
            task: 'Predict the type of err.',
            description: 'Checks that catch variables are unknown.',
            code: 'try { run(); } catch (err) { err.message; }',
            answer: 'With strict (useUnknownInCatchVariables) err is unknown, so err.message errors. Narrow with instanceof Error.',
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
            task: 'Fix the props so href and onClick are exclusive.',
            description: 'Checks union props with never.',
            code: 'type Props = { href?: string; onClick?: () => void };',
            answer: 'Use a union where each branch forbids the other prop with never.',
            solution: `type Props =
  | { href: string; onClick?: never }
  | { onClick: () => void; href?: never };`,
          },
          {
            task: 'Predict whether this compiles.',
            description: 'Checks discriminated props in JSX.',
            code: `type P = { kind: 'link'; href: string } | { kind: 'btn'; onClick: () => void };
const p: P = { kind: 'link', onClick: () => {} };`,
            answer: 'It fails: a "link" requires href and does not allow onClick.',
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
            task: 'Predict the output.',
            description: 'Checks numeric enum values.',
            code: `enum Dir { Up, Down = 5, Left }
console.log(Dir.Up, Dir.Left);`,
            answer: 'It logs 0 6. Numeric enums auto-increment from the last value.',
          },
          {
            task: 'Predict the output.',
            description: 'Checks reverse mapping in numeric enums.',
            code: `enum Dir { Up, Down }
console.log(Dir[0]);`,
            answer: 'It logs "Up". Numeric enums have a reverse mapping; string enums do not.',
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
            task: 'Fix the call without an assertion.',
            description: 'Checks using enum members.',
            code: `enum Color { Red = 'red' }
function paint(c: Color) {}
paint('red');`,
            answer: 'String enums are nominal: pass Color.Red, not the raw string.',
            solution: 'paint(Color.Red);',
          },
          {
            task: 'Write a guard that converts a string to the enum.',
            description: 'Checks safe parsing into enums.',
            code: 'enum Color { Red = \'red\', Blue = \'blue\' }',
            answer: 'Check the value against Object.values of the enum.',
            solution: `const isColor = (s: string): s is Color =>
  (Object.values(Color) as string[]).includes(s);`,
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
            task: 'Predict the output.',
            description: 'Checks keys of a numeric enum.',
            code: `enum E { A, B }
console.log(Object.keys(E));`,
            answer: 'It logs ["0","1","A","B"]: numeric enums include reverse mapping keys.',
          },
          {
            task: 'Predict whether this compiles in TS 5.x.',
            description: 'Checks enum value strictness since TS 5.0.',
            code: `enum E { A, B }
const x: E = 42;`,
            answer: 'Since TS 5.0 it fails: 42 is not a valid E value. Older versions allowed any number.',
          },
        ],
      },
      {
        q: 'Why do many teams prefer union literal types over enums in modern TS?',
        short: 'Unions are zero-cost, work with plain strings from APIs, are erasable (Node type stripping, erasableSyntaxOnly) and avoid enum quirks like reverse mapping and nominal typing.',
        long: 'Enums emit runtime code and are not tree-shakable as well.\nUnion literals compile away completely.\nPlain API strings are assignable to unions without casts.\nWhen runtime values are needed, an as const object provides both.\nStrong candidate mentions erasableSyntaxOnly and isolatedModules.\nWeak candidate says enums are deprecated (they are not).',
        exercises: [
          {
            task: 'Rewrite this enum as a union of literals.',
            description: 'Checks modern enum alternatives.',
            code: 'enum Role { Admin = \'admin\', User = \'user\' }',
            answer: 'A union has no runtime cost and accepts plain strings.',
            solution: 'type Role = \'admin\' | \'user\';',
          },
          {
            task: 'Name two reasons to prefer unions over enums.',
            description: 'Checks enum tradeoffs.',
            answer: 'Unions are erased (zero runtime code) and work with erasableSyntaxOnly and Node type stripping. Enums are nominal and emit objects.',
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
            task: 'Write an as const object with a derived union type.',
            description: 'Checks as const enum replacement.',
            answer: 'as const keeps literal values; derive the union from the object.',
            solution: `const Status = { Active: 'active', Archived: 'archived' } as const;
type Status = (typeof Status)[keyof typeof Status];`,
          },
          {
            task: 'Spot the problem with isolatedModules.',
            description: 'Checks const enum and per-file transpilers.',
            code: `// a.ts: export const enum Size { S = 1 }
// b.ts: import { Size } from './a'; Size.S;`,
            answer: 'Per-file tools like esbuild cannot inline values from another file. Use a regular enum or as const object.',
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
            task: 'Fix the switch so a new member causes an error.',
            description: 'Checks exhaustive checks with never.',
            code: `function f(p: 'free' | 'pro') {
  switch (p) { case 'free': return 0; case 'pro': return 10; }
}`,
            answer: 'Add a default that assigns p to never; a new member then fails to compile.',
            solution: '  default: { const _x: never = p; throw new Error(_x); }',
          },
          {
            task: 'Predict whether this compiles.',
            description: 'Checks satisfies never in exhaustive checks.',
            code: `type P = 'a' | 'b';
function f(p: P) { if (p === 'a') return 1; p satisfies never; }`,
            answer: 'It fails: p is still "b" at that point, not never.',
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
            task: 'Fix the code so unknown statuses do not crash.',
            description: 'Checks a fallback for unknown values.',
            code: `const labels = { active: 'Active', archived: 'Archived' };
const text = labels[status].toUpperCase();`,
            answer: 'Treat backend values as string and use a fallback when the key is unknown.',
            solution: 'const text = (labels[status as keyof typeof labels] ?? \'Unknown\').toUpperCase();',
          },
          {
            task: 'Name two ways to protect the UI from new enum values.',
            description: 'Checks defensive API typing.',
            answer: 'Validate at the boundary with a schema that has a catch value. Type the field as known values | (string & {}) and render a fallback.',
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
            task: 'Fix the shared package for Vite consumers.',
            description: 'Checks avoiding const enums in libraries.',
            code: 'export const enum Status { Active = \'active\' }',
            answer: 'Vite (esbuild) cannot inline const enums from packages. Export a regular object as const.',
            solution: `export const Status = { Active: 'active' } as const;
export type Status = (typeof Status)[keyof typeof Status];`,
          },
          {
            task: 'Name the tsconfig flag that catches this early.',
            description: 'Checks isolatedModules.',
            answer: 'isolatedModules (or verbatimModuleSyntax) flags code that per-file transpilers cannot handle.',
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
            task: 'Predict the compiled output.',
            description: 'Checks parameter properties emit.',
            code: 'class P { constructor(public x: number) {} }',
            answer: 'TS emits this.x = x in the constructor. Parameter properties are one of the few TS features with runtime code.',
          },
          {
            task: 'Predict the output.',
            description: 'Checks that types are erased.',
            code: `class A { x!: number; }
console.log(Object.keys(new A()));`,
            answer: 'With useDefineForClassFields (default for ES2022+), it logs ["x"] with undefined. Otherwise [].',
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
            task: 'Fix the lost this.',
            description: 'Checks binding methods for callbacks.',
            code: `class C { n = 0; inc() { this.n++; } }
const c = new C();
button.addEventListener('click', c.inc);`,
            answer: 'Use an arrow function property, or pass () => c.inc().',
            solution: 'class C { n = 0; inc = () => { this.n++; }; }',
          },
          {
            task: 'Predict whether TS reports an error.',
            description: 'Checks this parameter typing.',
            code: `class C { n = 0; inc(this: C) { this.n++; } }
const f = new C().inc;
f();`,
            answer: 'Yes: the this parameter makes TS error when calling f without a C context.',
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
            task: 'Write the constructor type used by mixins.',
            description: 'Checks generic constructor types.',
            answer: 'Mixins accept any class with a construct signature.',
            solution: 'type Ctor<T = {}> = new (...args: any[]) => T;',
          },
          {
            task: 'Write a Timestamped mixin.',
            description: 'Checks class expressions with generics.',
            answer: 'Return a class that extends the base and adds the field.',
            solution: `function Timestamped<B extends new (...a: any[]) => {}>(Base: B) {
  return class extends Base { createdAt = new Date(); };
}`,
          },
        ],
      },
      {
        q: 'What does `useDefineForClassFields` change? Why can it break existing code?',
        short: 'With it (default for target ES2022+), class fields use [[Define]] semantics like native JS: fields are defined after super() and shadow accessors/properties from base classes; older code relied on [[Set]] assignment.',
        long: 'Default true when target >= ES2022 (or ESNext).\nA field redeclared in a subclass without initializer resets the base value to undefined.\nFields shadow base accessors instead of calling the setter.\nFix: use declare field: Type for type-only redeclarations.\nStrong candidate knows the declare fix and the target dependency.\nWeak candidate has never heard of it.',
        exercises: [
          {
            task: 'Predict the output with useDefineForClassFields on.',
            description: 'Checks field shadowing of parent setters.',
            code: `class A { set v(x: number) { console.log('set'); } }
class B extends A { v = 1; }
new B();`,
            answer: 'Nothing logs: the field is defined with defineProperty and shadows the setter.',
          },
          {
            task: 'Fix the field so it is not reset to undefined.',
            description: 'Checks declare fields.',
            code: 'class B extends A { name!: string; } // A sets name in constructor',
            answer: 'Use declare so no field is emitted.',
            solution: 'class B extends A { declare name: string; }',
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
            task: 'Predict the output.',
            description: 'Checks structural typing vs instanceof.',
            code: `class Dog { bark() {} }
const d: Dog = { bark() {} };
console.log(d instanceof Dog);`,
            answer: 'It logs false. TS checks shape, not the prototype.',
          },
          {
            task: 'Fix the class so plain objects are not assignable.',
            description: 'Checks nominal typing via private fields.',
            code: 'class Dog { bark() {} }',
            answer: 'A #private field makes the class nominal: only real instances match.',
            solution: 'class Dog { #brand = true; bark() {} }',
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
            task: 'Write a typed factory for any class.',
            description: 'Checks constructor types with generics.',
            code: 'function create(C: Function, ...args: any[]) {}',
            answer: 'Use a construct signature and ConstructorParameters.',
            solution: `function create<T, A extends any[]>(C: new (...a: A) => T, ...args: A): T {
  return new C(...args);
}`,
          },
          {
            task: 'Predict the type of p.',
            description: 'Checks ConstructorParameters.',
            code: `class U { constructor(id: string, age: number) {} }
type p = ConstructorParameters<typeof U>;`,
            answer: 'p is [id: string, age: number], the constructor argument tuple.',
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
            task: 'Rewrite class DI with a function and plain arguments.',
            description: 'Checks lightweight DI alternatives.',
            code: '@Injectable() class Api { constructor(private http: Http) {} }',
            answer: 'Pass dependencies as arguments; easy to test and needs no container.',
            solution: `function createApi(http: Http) {
  return { getUser: (id: string) => http.get(\`/users/\${id}\`) };
}`,
          },
          {
            task: 'Name two costs of a DI container in a React app.',
            description: 'Checks tradeoff reasoning on DI.',
            answer: 'Extra runtime and decorator config, and hidden wiring. React context or module imports usually cover the needs.',
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
            task: 'Predict what TS emits for target ES2020.',
            description: 'Checks downleveling of private methods.',
            code: 'class A { #run() {} static { init(); } }',
            answer: 'TS rewrites them with WeakMap/WeakSet helpers and a static function, adding code size.',
          },
          {
            task: 'Name two ways to check browser support for new syntax.',
            description: 'Checks build target verification.',
            answer: 'Check the target and browserslist, then inspect the built output. Also check caniuse or MDN for the feature.',
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
            task: 'Write a typed Map from id to User.',
            description: 'Checks Map generics.',
            answer: 'Pass key and value types as generics.',
            solution: `const users = new Map<string, User>();
users.set('1', { id: '1', name: 'A' });`,
          },
          {
            task: 'Predict the type of u.',
            description: 'Checks Map.get return type.',
            code: `const m = new Map<string, number>();
const u = m.get('a');`,
            answer: 'u is number | undefined: the key may be missing.',
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
            task: 'Fix the code to remove duplicates.',
            description: 'Checks converting a Set to an array.',
            code: 'const unique = new Set([\'a\', \'a\']).values;',
            answer: 'Spread the Set into an array.',
            solution: 'const unique = [...new Set([\'a\', \'a\'])];',
          },
          {
            task: 'Predict the output.',
            description: 'Checks Set equality by reference.',
            code: `const s = new Set([{ id: 1 }, { id: 1 }]);
console.log(s.size);`,
            answer: 'It logs 2: objects are compared by reference.',
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
            task: 'Fix the type error without a non-null assertion.',
            description: 'Checks narrowing Map.get results.',
            code: 'const v: number = cache.get(\'a\');',
            answer: 'Store the result and check for undefined.',
            solution: `const v = cache.get('a');
if (v !== undefined) use(v);`,
          },
          {
            task: 'Predict whether has narrows get.',
            description: 'Checks Map.has limitations.',
            code: 'if (m.has(\'a\')) { const v: number = m.get(\'a\'); }',
            answer: 'It still errors: TS does not link has to get. Check the get result instead.',
          },
        ],
      },
      {
        q: 'When would you use Map instead of a plain object or Record?',
        short: 'Use Map for dynamic keys, non-string keys, frequent additions/removals, guaranteed insertion order and size; use plain objects for fixed-shape records and JSON data.',
        long: 'Objects have prototype keys (constructor, __proto__) that can collide with user keys.\nMap keys can be objects, functions, numbers without string conversion.\nMap has size and is iterable directly; performance is good for frequent mutations.\nObjects serialize to JSON; Maps do not.\nStrong candidate mentions prototype pollution risk.\nWeak candidate thinks they are interchangeable.',
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks object key coercion.',
            code: `const o: Record<string, string> = {};
o[1 as any] = 'a';
console.log(Object.keys(o));`,
            answer: 'It logs ["1"]: object keys become strings. Map keeps key types, including objects.',
          },
          {
            task: 'Name two cases where Map beats an object.',
            description: 'Checks choosing collections.',
            answer: 'Non-string keys like objects, and frequent add/remove with insertion order and size. No prototype key risks.',
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
            task: 'Write a typed emit function.',
            description: 'Checks event maps with generics.',
            code: 'type Events = { login: { id: string }; logout: void };',
            answer: 'Use K extends keyof Events so the payload follows the name.',
            solution: `function emit<K extends keyof Events>(name: K, payload: Events[K]) {}
emit('login', { id: '1' });`,
          },
          {
            task: 'Predict the error.',
            description: 'Checks payload type checking.',
            code: 'emit(\'login\', { userId: \'1\' });',
            answer: 'Error: userId is not in { id: string }. The payload must match the event type.',
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
            task: 'Fix the leak.',
            description: 'Checks WeakMap for DOM caches.',
            code: 'const sizes = new Map<HTMLElement, DOMRect>();',
            answer: 'A WeakMap lets removed elements be garbage-collected.',
            solution: 'const sizes = new WeakMap<HTMLElement, DOMRect>();',
          },
          {
            task: 'Spot why WeakMap does not work here.',
            description: 'Checks WeakMap key restrictions.',
            code: 'const w = new WeakMap<string, number>();',
            answer: 'WeakMap keys must be objects (or non-registered symbols); strings are not allowed.',
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
            task: 'Predict the output.',
            description: 'Checks JSON with Map.',
            code: 'console.log(JSON.stringify({ m: new Map([[\'a\', 1]]) }));',
            answer: 'It logs {"m":{}}. Map does not serialize, so it breaks persisted or URL state.',
          },
          {
            task: 'Fix the state so it can be serialized.',
            description: 'Checks Record over Map in stores.',
            code: 'type State = { byId: Map<string, User> };',
            answer: 'Use a plain Record in the store; build a Map in a selector if needed.',
            solution: 'type State = { byId: Record<string, User> };',
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
            task: 'Fix the hook so the Map is stable.',
            description: 'Checks memoizing derived data.',
            code: `function useById(users: User[]) {
  return new Map(users.map(u => [u.id, u]));
}`,
            answer: 'Wrap it in useMemo with users as the dependency. React Compiler can do this automatically.',
            solution: `function useById(users: User[]) {
  return useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
}`,
          },
          {
            task: 'Spot why memoization still fails.',
            description: 'Checks unstable dependencies.',
            code: 'const byId = useById(data.filter(u => u.active));',
            answer: 'filter creates a new array each render, so useMemo always recomputes. Memoize the filtered list too.',
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
            task: 'Predict the types of a and b.',
            description: 'Checks unique symbol inference.',
            code: `const a = Symbol('x');
let b = Symbol('x');`,
            answer: 'a is typeof a (unique symbol); b is symbol because let can change.',
          },
          {
            task: 'Write a typed symbol property key.',
            description: 'Checks symbols as object keys.',
            answer: 'Use a const symbol as a computed key.',
            solution: `const ID = Symbol('id');
type Item = { [ID]: string };
const it: Item = { [ID]: '1' };`,
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
            task: 'Fix the loop to print the values.',
            description: 'Checks for...of vs for...in.',
            code: `function* g() { yield 1; yield 2; }
for (const n in g()) console.log(n);`,
            answer: 'for...in iterates keys; use for...of for iterables.',
            solution: 'for (const n of g()) console.log(n);',
          },
          {
            task: 'Predict the output.',
            description: 'Checks generator laziness.',
            code: `function* g() { console.log('start'); yield 1; }
const it = g();
console.log('made');`,
            answer: 'It logs only "made". The body runs on the first next() call.',
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
            task: 'Type this generator with Generator<Y, R, N>.',
            description: 'Checks generator type parameters.',
            code: 'function* ids() { let i = 0; while (true) { const reset = yield i++; if (reset) i = 0; } }',
            answer: 'Yield number, never returns, receives boolean from next().',
            solution: `function* ids(): Generator<number, never, boolean | undefined> {
  let i = 0;
  while (true) { if (yield i++) i = 0; }
}`,
          },
          {
            task: 'Predict the output.',
            description: 'Checks generator return values.',
            code: `function* g() { yield 1; return 2; }
console.log([...g()]);`,
            answer: 'It logs [1]: spread ignores the return value.',
          },
        ],
      },
      {
        q: 'What is the iterator protocol? How does TS type it?',
        short: 'An iterable has [Symbol.iterator]() returning an iterator with next() → { value, done }; TS models this with Iterable<T>, Iterator<T, TReturn, TNext> and IterableIterator<T>.',
        long: 'Generators implement both Iterable and Iterator.\nAny object with [Symbol.iterator] works with for...of and spread.\nAsync variants: AsyncIterable, Symbol.asyncIterator, for await.\nTS 5.6 introduced IteratorObject and BuiltinIteratorReturn for built-in iterators.\nStrong candidate can hand-write an iterator without a generator.\nWeak candidate only knows arrays.',
        exercises: [
          {
            task: 'Write an object that is iterable.',
            description: 'Checks Symbol.iterator implementation.',
            answer: 'Implement [Symbol.iterator] returning an iterator; a generator method is easiest.',
            solution: `const range = {
  *[Symbol.iterator]() { yield 1; yield 2; },
};
console.log([...range]);`,
          },
          {
            task: 'Predict the type of r.',
            description: 'Checks IteratorResult typing.',
            code: `const it = [1, 2][Symbol.iterator]();
const r = it.next();`,
            answer: 'r is IteratorResult<number, any>: either { done: false; value: number } or done: true.',
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
            task: 'Write an async generator for pages.',
            description: 'Checks async generator typing.',
            code: 'declare function fetchPage(c?: string): Promise<{ items: Item[]; next?: string }>;',
            answer: 'Yield each page items until next is missing.',
            solution: `async function* pages(): AsyncGenerator<Item[]> {
  let c: string | undefined;
  do { const p = await fetchPage(c); yield p.items; c = p.next; } while (c);
}`,
          },
          {
            task: 'Write a helper that collects an async iterable.',
            description: 'Checks for await...of.',
            answer: 'Loop with for await and push. Array.fromAsync also works in modern runtimes.',
            solution: `async function collect<T>(it: AsyncIterable<T>) {
  const out: T[] = [];
  for await (const x of it) out.push(x);
  return out;
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
            task: 'Fix the generator so the reader is released.',
            description: 'Checks cleanup with finally.',
            code: `async function* lines(r: ReadableStreamDefaultReader<string>) {
  while (true) { const { value, done } = await r.read(); if (done) return; yield value; }
}`,
            answer: 'Use try/finally; break in the consumer calls return(), which runs finally.',
            solution: `  try { /* same loop */ }
  finally { r.releaseLock(); }`,
          },
          {
            task: 'Predict the output.',
            description: 'Checks that break calls return on generators.',
            code: `function* g() { try { yield 1; yield 2; } finally { console.log('done'); } }
for (const x of g()) break;`,
            answer: 'It logs "done": break calls return(), so finally runs.',
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
            task: 'Predict the output.',
            description: 'Checks iterator helpers in 2026 runtimes.',
            code: `function* nums() { let i = 0; while (true) yield i++; }
console.log(nums().filter(n => n % 2).take(2).toArray());`,
            answer: 'It logs [1, 3]. Iterator helpers are lazy and supported in modern browsers; needs lib esnext/ES2025 types.',
          },
          {
            task: 'Name two checks before adopting a new language feature.',
            description: 'Checks judgement on adoption cost.',
            answer: 'Runtime and TS lib support for your targets, and whether the team can read it. Start with a small pilot and a short guide.',
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
            task: 'Fix the code so items render page by page.',
            description: 'Checks streaming with async generators.',
            code: 'const all = await loadAll(); render(all);',
            answer: 'Yield each page and render as it arrives.',
            solution: `for await (const page of pages()) {
  render(page);
}`,
          },
          {
            task: 'Spot the UX problem.',
            description: 'Checks time to first content.',
            code: `do { const p = await fetchPage(c); all.push(...p.items); c = p.next; } while (c);
return all;`,
            answer: 'Users see nothing until the last page loads. Show the first page early.',
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
            task: 'Predict the type of x.',
            description: 'Checks Awaited on non-promises.',
            code: `async function f() { return await 5; }
const x = f();`,
            answer: 'x is Promise<number>. await on a non-promise just returns the value, and async wraps it.',
          },
          {
            task: 'Fix the return type annotation.',
            description: 'Checks async return types.',
            code: 'async function getName(): string { return \'A\'; }',
            answer: 'Async functions always return a Promise.',
            solution: 'async function getName(): Promise<string> { return \'A\'; }',
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
            task: 'Fix the code to log after the data arrives.',
            description: 'Checks awaiting async results.',
            code: `function load() {
  let data; fetch('/api').then(r => r.json()).then(d => (data = d));
  console.log(data);
}`,
            answer: 'Make the function async and await the result.',
            solution: `async function load() {
  const data = await (await fetch('/api')).json();
  console.log(data);
}`,
          },
          {
            task: 'Predict the output.',
            description: 'Checks sync vs async order.',
            code: `let x = 1;
Promise.resolve().then(() => (x = 2));
console.log(x);`,
            answer: 'It logs 1: the then callback runs later as a microtask.',
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
            task: 'Fix the floating promise.',
            description: 'Checks awaiting before navigation.',
            code: 'function onClick() { save(); navigate(\'/done\'); }',
            answer: 'Await save and handle errors, so you navigate only after success.',
            solution: `async function onClick() {
  try { await save(); navigate('/done'); } catch (e) { showError(e); }
}`,
          },
          {
            task: 'Name the lint rule that catches this.',
            description: 'Checks no-floating-promises.',
            code: 'save(); // returns a Promise',
            answer: '@typescript-eslint/no-floating-promises. Use void save() to ignore on purpose.',
          },
        ],
      },
      {
        q: 'What is the difference between microtasks and macrotasks, and how does it affect UI updates?',
        short: 'Microtasks (promise callbacks, queueMicrotask) run right after the current task, before rendering; macrotasks (setTimeout, events, messages) run one per loop iteration, with rendering possible in between.',
        long: 'A long chain of microtasks blocks rendering just like sync code.\nsetTimeout(0) yields to the browser so it can paint.\nrequestAnimationFrame runs before the next paint.\nscheduler.yield() / scheduler.postTask in modern browsers help break long tasks.\nStrong candidate connects this to INP and long tasks.\nWeak candidate thinks promises run in parallel threads.',
        exercises: [
          {
            task: 'Predict the output.',
            description: 'Checks microtask vs macrotask order.',
            code: `setTimeout(() => console.log('t'));
Promise.resolve().then(() => console.log('p'));
console.log('s');`,
            answer: 's, p, t. Sync code first, then microtasks, then timers.',
          },
          {
            task: 'Spot why the spinner never shows.',
            description: 'Checks blocking rendering with sync work.',
            code: `setLoading(true);
heavySyncWork(); // 2 seconds
setLoading(false);`,
            answer: 'The browser cannot paint while sync code runs. Move work to a worker or yield with scheduler.yield / setTimeout.',
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
            task: 'Fix the timer type for browser and Node.',
            description: 'Checks ReturnType of setTimeout.',
            code: 'let t: number = setTimeout(fn, 100);',
            answer: 'In Node the type is Timeout, not number. Use ReturnType.',
            solution: 'let t: ReturnType<typeof setTimeout> = setTimeout(fn, 100);',
          },
          {
            task: 'Write a sleep that can be cancelled.',
            description: 'Checks AbortSignal handling.',
            answer: 'Reject with the signal reason and clear the timer on abort.',
            solution: `const sleep = (ms: number, signal?: AbortSignal) => new Promise<void>((res, rej) => {
  const t = setTimeout(res, ms);
  signal?.addEventListener('abort', () => { clearTimeout(t); rej(signal.reason); }, { once: true });
});`,
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
            task: 'Fix the race with AbortController.',
            description: 'Checks cancelling old requests.',
            code: `async function search(q: string) {
  setResults(await (await fetch('/s?q=' + q)).json());
}`,
            answer: 'Abort the previous request before starting a new one.',
            solution: `let ctrl: AbortController | undefined;
async function search(q: string) {
  ctrl?.abort(); ctrl = new AbortController();
  const r = await fetch('/s?q=' + encodeURIComponent(q), { signal: ctrl.signal });
  setResults(await r.json());
}`,
          },
          {
            task: 'Name two other ways to avoid stale results.',
            description: 'Checks race condition patterns.',
            answer: 'Track a request id and ignore old responses, or use a library like TanStack Query keyed by the query.',
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
            task: 'Name three async lint rules you would require.',
            description: 'Checks typescript-eslint async rules.',
            answer: 'no-floating-promises, no-misused-promises, await-thenable. They need type-aware linting.',
          },
          {
            task: 'Spot the bug this rule catches.',
            description: 'Checks no-misused-promises.',
            code: 'if (checkAccess()) { show(); } // checkAccess is async',
            answer: 'A Promise is always truthy, so show always runs. no-misused-promises flags it.',
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
            task: 'Write a global handler for unhandled rejections.',
            description: 'Checks browser rejection events.',
            answer: 'Listen to unhandledrejection and report it to monitoring.',
            solution: `window.addEventListener('unhandledrejection', e => {
  reportError(e.reason);
});`,
          },
          {
            task: 'Spot the problem.',
            description: 'Checks swallowing errors.',
            code: 'fetchData().catch(() => {});',
            answer: 'The error is silently lost. Log or report it, and show the user a fallback.',
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
            task: 'Predict whether this runs faster as TS.',
            description: 'Checks that types are erased.',
            code: 'const sum = (a: number, b: number) => a + b;',
            answer: 'No: TS types are removed; the JS is the same. Gains come from fewer bugs, not speed.',
          },
          {
            task: 'Name one TS feature that adds runtime code.',
            description: 'Checks non-erasable syntax.',
            answer: 'Enums, namespaces and parameter properties emit code. erasableSyntaxOnly bans them.',
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
            task: 'Fix tsconfig to skip checking library .d.ts files.',
            description: 'Checks skipLibCheck.',
            code: '{ "compilerOptions": { "strict": true } }',
            answer: 'skipLibCheck skips type-checking all .d.ts files, saving a lot of time.',
            solution: '{ "compilerOptions": { "strict": true, "skipLibCheck": true } }',
          },
          {
            task: 'Name the tsconfig option that limits which files are compiled.',
            description: 'Checks include and exclude.',
            answer: 'Use include (like ["src"]) so tsc does not scan unrelated folders.',
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
            task: 'Fix the import so it is removed from the bundle.',
            description: 'Checks type-only imports.',
            code: 'import { User } from \'./models\'; // used only as a type',
            answer: 'import type is always erased, so the module is not loaded at runtime.',
            solution: 'import type { User } from \'./models\';',
          },
          {
            task: 'Name the tsconfig flag that forces explicit type imports.',
            description: 'Checks verbatimModuleSyntax.',
            answer: 'verbatimModuleSyntax: imports without type are kept as written, so type-only ones must use import type.',
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
            task: 'Fix the slow export with an explicit type.',
            description: 'Checks annotating large inferred types.',
            code: 'export const config = buildConfig(); // huge inferred type',
            answer: 'An explicit annotation stops TS from computing and printing the huge type.',
            solution: 'export const config: AppConfig = buildConfig();',
          },
          {
            task: 'Name the flag that shows slow type checking.',
            description: 'Checks tsc diagnostics.',
            answer: 'tsc --extendedDiagnostics shows time and counts; --generateTrace shows slow files and types.',
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
            task: 'Name two tsc flags to find the slow part.',
            description: 'Checks build performance diagnostics.',
            answer: '--extendedDiagnostics for totals, --generateTrace with @typescript/analyze-trace for hot spots.',
          },
          {
            task: 'Fix tsconfig for faster rebuilds.',
            description: 'Checks incremental builds.',
            code: '{ "compilerOptions": { "strict": true } }',
            answer: 'incremental saves build info, so later runs check only what changed.',
            solution: '{ "compilerOptions": { "strict": true, "incremental": true, "skipLibCheck": true } }',
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
            task: 'Spot why tsserver loads too much.',
            description: 'Checks project scope in editors.',
            code: '{ "include": ["**/*"] }',
            answer: 'It includes every file, even build output. Limit include to src and exclude dist.',
          },
          {
            task: 'Name two ways to reduce tsserver memory.',
            description: 'Checks editor performance tuning.',
            answer: 'Split into project references so the editor loads one project, and set skipLibCheck. Remove barrel files that pull in everything.',
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
            task: 'Write a tsconfig for a package used by references.',
            description: 'Checks composite projects.',
            answer: 'composite enables project references and emits .d.ts for dependents.',
            solution: `{ "compilerOptions": { "composite": true, "outDir": "dist" },
  "references": [{ "path": "../core" }] }`,
          },
          {
            task: 'Name two ways to keep CI type checks fast.',
            description: 'Checks monorepo CI strategy.',
            answer: 'Run only affected packages (Nx/Turbo) and cache .tsbuildinfo and build outputs.',
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
            task: 'Fix the CI so only changed packages run.',
            description: 'Checks affected-only builds.',
            code: `- run: npx tsc -b
- run: npm run build --workspaces`,
            answer: 'Use a tool that knows the dependency graph and caches results.',
            solution: '- run: npx turbo run typecheck build --filter=...[origin/master]',
          },
          {
            task: 'Spot the waste in this CI step.',
            description: 'Checks caching build info.',
            code: '- run: rm -rf **/*.tsbuildinfo && npx tsc -b',
            answer: 'Deleting tsbuildinfo forces a full rebuild every time. Cache it between runs.',
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
            task: 'Predict whether this compiles with strict on.',
            description: 'Checks strictNullChecks.',
            code: 'function len(s: string | null) { return s.length; }',
            answer: 'It fails: s may be null. strict turns on strictNullChecks.',
          },
          {
            task: 'Name three options that strict turns on.',
            description: 'Checks knowledge of the strict family.',
            answer: 'noImplicitAny, strictNullChecks, strictFunctionTypes (also useUnknownInCatchVariables and more).',
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
            task: 'Fix the indexing error.',
            description: 'Checks keyof typeof for keys.',
            code: `const labels = { save: 'Save', cancel: 'Cancel' };
function label(k: string) { return labels[k]; }`,
            answer: 'Type the key as keyof typeof labels.',
            solution: 'function label(k: keyof typeof labels) { return labels[k]; }',
          },
          {
            task: 'Predict the type of v with noUncheckedIndexedAccess.',
            description: 'Checks index signature safety.',
            code: `const m: Record<string, string> = {};
const v = m['x'];`,
            answer: 'v is string | undefined: the option reminds you the key may be missing.',
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
            task: 'Spot the problem.',
            description: 'Checks that as does not validate data.',
            code: `const user = (await res.json()) as User;
user.name.toUpperCase();`,
            answer: 'as only tells TS to trust you; if name is missing it crashes at runtime. Validate the data.',
          },
          {
            task: 'Write a schema check for the response.',
            description: 'Checks runtime validation with Zod.',
            answer: 'Parse the data with a schema; the type is inferred from it.',
            solution: `const User = z.object({ id: z.string(), name: z.string() });
type User = z.infer<typeof User>;
const user = User.parse(await res.json());`,
          },
        ],
      },
      {
        q: 'What are utility types like Partial, Pick, Omit, Record, and ReturnType? When do you use them?',
        short: 'Built-in mapped/conditional types that derive new types from existing ones, keeping a single source of truth: Partial for patches, Pick/Omit for subsets, Record for dictionaries, ReturnType/Parameters for function-derived types.',
        long: 'Deriving types prevents drift between related shapes (User vs UserUpdate).\nOmit is not distributive over unions; use a distributive version for discriminated unions.\nRequired, Readonly, NonNullable, Awaited, Extract, Exclude are also common.\nStrong candidate knows the Omit-on-union pitfall.\nWeak candidate redefines types by hand.',
        exercises: [
          {
            task: 'Write a type for an update payload.',
            description: 'Checks Partial with Omit.',
            code: 'type User = { id: string; name: string; email: string };',
            answer: 'Remove id and make the rest optional.',
            solution: 'type UserUpdate = Partial<Omit<User, \'id\'>>;',
          },
          {
            task: 'Predict the type of R.',
            description: 'Checks ReturnType.',
            code: `const make = () => ({ id: 1, ok: true });
type R = ReturnType<typeof make>;`,
            answer: 'R is { id: number; ok: boolean }.',
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
            task: 'Predict the type of routes.home.',
            description: 'Checks satisfies keeping literal types.',
            code: 'const routes = { home: \'/\' } satisfies Record<string, string>;',
            answer: 'It is string, but the key home stays known. satisfies checks the type without widening the object to Record.',
          },
          {
            task: 'Write a type for event handler names.',
            description: 'Checks template literal types.',
            code: 'type Ev = \'click\' | \'focus\';',
            answer: 'Use a template literal type with Capitalize.',
            solution: 'type Handler = `on${Capitalize<Ev>}`; // \'onClick\' | \'onFocus\'',
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
            task: 'Write the props type for a polymorphic as prop.',
            description: 'Checks ComponentPropsWithoutRef generics.',
            answer: 'Make the element type generic and merge its props.',
            solution: `type BoxProps<C extends React.ElementType> =
  { as?: C } & React.ComponentPropsWithoutRef<C>;`,
          },
          {
            task: 'Predict whether this compiles.',
            description: 'Checks props matching the element.',
            code: `<Box as="a" href="/x" />
<Box as="div" href="/x" />`,
            answer: 'With proper polymorphic typing, the second fails: div has no href.',
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
            task: 'Write a type from an OpenAPI generated schema.',
            description: 'Checks using generated API types.',
            code: 'import type { paths } from \'./schema\';',
            answer: 'Index into the generated paths so types follow the backend.',
            solution: 'type User = paths[\'/users/{id}\'][\'get\'][\'responses\'][\'200\'][\'content\'][\'application/json\'];',
          },
          {
            task: 'Name two ways to catch API drift in CI.',
            description: 'Checks contract checks.',
            answer: 'Regenerate types in CI and fail on a diff, or run contract tests against the OpenAPI spec.',
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
            task: 'Fix the plan to migrate step by step.',
            description: 'Checks incremental JS to TS migration.',
            code: '// plan: rename all .js to .ts in one PR',
            answer: 'Enable allowJs, migrate files gradually, and turn on strict per folder over time.',
            solution: '{ "compilerOptions": { "allowJs": true, "checkJs": false, "strict": false } }',
          },
          {
            task: 'Name two ways to add types before renaming files.',
            description: 'Checks gradual typing options.',
            answer: 'Use JSDoc types with // @ts-check, and write .d.ts files for key modules.',
          },
        ],
      },
    ],
  },
};
