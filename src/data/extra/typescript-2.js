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
              task: 'Fix the check so it compiles.',
              description: 'Checks instanceof only works with classes.',
              code: `interface Cat { meow(): void }
if (pet instanceof Cat) pet.meow();`,
              answer: 'Interfaces do not exist at runtime. Use an in check or a type guard.',
              solution: 'if (\'meow\' in pet) pet.meow();',
            },
            {
              task: 'Predict the output.',
              description: 'Checks instanceof with prototypes.',
              code: `class A {} class B extends A {}
console.log(new B() instanceof A);`,
              answer: 'true: instanceof walks the prototype chain.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks instanceof with a class.',
              code: `class A {}
console.log(new A() instanceof A);`,
              answer: 'true, because A.prototype is in the object\'s prototype chain.',
            },
            {
              easy: true,
              task: 'True or false: instanceof works with interfaces.',
              description: 'Checks interfaces at runtime.',
              answer: 'False; interfaces are erased and do not exist at runtime.',
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
              task: 'Fix the code by adding a setter.',
              description: 'Checks getter-only properties.',
              code: `class Temp { private c = 0; get celsius() { return this.c; } }
new Temp().celsius = 20;`,
              answer: 'A getter without a setter is read-only. Add set.',
              solution: `class Temp {
  private c = 0;
  get celsius() { return this.c; }
  set celsius(v: number) { this.c = v; }
}`,
            },
            {
              task: 'Predict the type TS gives to celsius.',
              description: 'Checks inferred readonly from getters.',
              code: `class T { get celsius() { return 1; } }
type K = T['celsius'];`,
              answer: 'K is number, and the property is treated as readonly.',
            },
            {
              easy: true,
              task: 'Predict whether this compiles.',
              description: 'Checks a getter-only property.',
              code: `class T { get v() { return 1; } }
new T().v = 2;`,
              answer: 'No; v is readonly because it has only a getter.',
            },
            {
              easy: true,
              task: 'Name what a getter needs to allow assignment.',
              description: 'Checks setter pairing.',
              code: 'class T { get v() { return 1; } }',
              answer: 'A matching set v(x) accessor, which makes the property writable.',
            },
          ],
        },
        {
          q: 'What is a static member in a class? How do you type it?',
          short: 'Static members belong to the constructor function, not instances; their types live on typeof ClassName.',
          long: `static count = 0 is stored on the class itself.\nAccess it as Counter.count, not this.count in instance methods.\nInstance type is Counter; constructor type is typeof Counter.\nStatic blocks (static { ... }) run once at class evaluation.\nStatic members cannot reference the class type parameters.\nAbstract static members are not supported.`,
          exercises: [
            {
              task: 'Write a static counter on a class.',
              description: 'Checks static members.',
              answer: 'Static members live on the class, not on instances.',
              solution: `class User {
  static count = 0;
  constructor() { User.count++; }
}`,
            },
            {
              task: 'Predict whether this compiles.',
              description: 'Checks static access through instances.',
              code: `class A { static v = 1; }
new A().v;`,
              answer: 'It fails: v exists on A, not on the instance.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks static access on class.',
              code: `class C { static n = 5; }
console.log(C.n);`,
              answer: '5, because static members live on the class itself.',
            },
            {
              easy: true,
              task: 'Predict whether this compiles.',
              description: 'Checks static access on instance.',
              code: `class C { static n = 5; }
new C().n;`,
              answer: 'No; static members are not available on instances.',
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
              task: 'Predict the types of a and b.',
              description: 'Checks class type vs typeof class.',
              code: `class User { name = ''; }
let a: User; let b: typeof User;`,
              answer: 'a is an instance type; b is the constructor type, with new() and statics.',
            },
            {
              task: 'Write a type for the instance from a constructor.',
              description: 'Checks InstanceType.',
              code: 'class Svc {}',
              answer: 'InstanceType gets the instance type from typeof Svc.',
              solution: 'type S = InstanceType<typeof Svc>; // Svc',
            },
            {
              easy: true,
              task: 'Name the type of the class value.',
              description: 'Checks typeof Class.',
              code: `class P {}
const k = P;`,
              answer: 'typeof P, the constructor type, not the instance type P.',
            },
            {
              easy: true,
              task: 'Predict the type of x.',
              description: 'Checks instance type from class.',
              code: `class P { a = 1; }
const x = new P();`,
              answer: 'P, the instance type with property a: number.',
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
              task: 'Fix the code so TS knows about format.',
              description: 'Checks adding methods properly.',
              code: `(Money.prototype as any).format = function () {};
new Money(150).format();`,
              answer: 'Declare format in the class instead of patching the prototype.',
              solution: `class Money {
  constructor(public cents: number) {}
  format() { return '$' + this.cents / 100; }
}`,
            },
            {
              task: 'Write a declaration merge for the prototype method.',
              description: 'Checks interface merging with classes.',
              code: 'class Money { constructor(public cents: number) {} }',
              answer: 'An interface with the same name merges into the class type.',
              solution: `interface Money { format(): string }
Money.prototype.format = function () { return '$' + this.cents / 100; };`,
            },
            {
              easy: true,
              task: 'True or false: casting to any adds type info.',
              description: 'Checks any casts.',
              answer: 'False; as any only hides errors and teaches TS nothing.',
            },
            {
              easy: true,
              task: 'Name the feature that adds methods to a class type.',
              description: 'Checks declaration merging.',
              code: 'interface Money { format(): string }',
              answer: 'Declaration merging: an interface with the same name extends the class type.',
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
              task: 'Fix the field order.',
              description: 'Checks field initialization order.',
              code: 'class Price { total = this.net * 2; net = 100; }',
              answer: 'Fields initialize top to bottom; declare net first.',
              solution: 'class Price { net = 100; total = this.net * 2; }',
            },
            {
              task: 'Predict the value of total.',
              description: 'Checks use before initialization.',
              code: 'class P { total = this.net * 2; net = 100; }',
              answer: 'TS errors: net is used before initialization. At runtime it would be NaN.',
            },
            {
              easy: true,
              task: 'Predict the value of a.',
              description: 'Checks field init order.',
              code: `class K { a = this.b; b = 1; }
console.log(new K().a);`,
              answer: 'undefined, because fields initialize top to bottom.',
            },
            {
              easy: true,
              task: 'Predict whether this compiles.',
              description: 'Checks used-before-init error.',
              code: 'class K { a = this.b + 1; b = 1; }',
              answer: 'No; TS reports b is used before its initialization.',
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
              task: 'Write a static block that fills a lookup map.',
              description: 'Checks static initialization blocks.',
              answer: 'A static block runs once when the class is defined.',
              solution: `class Codes {
  static map = new Map<string, number>();
  static { ['a', 'b'].forEach((k, i) => Codes.map.set(k, i)); }
}`,
            },
            {
              task: 'Predict the output.',
              description: 'Checks static block timing.',
              code: `class A { static { console.log('A'); } }
console.log('end');`,
              answer: '"A" then "end": the block runs at class definition.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks when a static block runs.',
              code: 'class S { static { console.log(\'init\'); } }',
              answer: 'init prints once, when the class is defined.',
            },
            {
              easy: true,
              task: 'True or false: static blocks can read private statics.',
              description: 'Checks static block access.',
              code: 'class S { static #x = 1; static { S.#x++; } }',
              answer: 'True; static blocks run inside the class and can use private members.',
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
              task: 'Fix the constructor type to accept abstract classes.',
              description: 'Checks abstract construct signatures.',
              code: 'type Ctor = new (...a: any[]) => {};',
              answer: 'Use an abstract construct signature.',
              solution: 'type Ctor = abstract new (...a: any[]) => {};',
            },
            {
              task: 'Predict whether this compiles.',
              description: 'Checks passing abstract classes to new().',
              code: `abstract class E {}
const C: new () => E = E;`,
              answer: 'It fails: an abstract class cannot be assigned to a concrete constructor type.',
            },
            {
              easy: true,
              task: 'Name the keyword for abstract constructor types.',
              description: 'Checks abstract new signatures.',
              code: 'type C = abstract new () => object;',
              answer: 'abstract, written before new in the constructor type.',
            },
            {
              easy: true,
              task: 'Predict whether this compiles.',
              description: 'Checks new on abstract class.',
              code: `abstract class E {}
new E();`,
              answer: 'No; you cannot create an instance of an abstract class.',
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
              task: 'Rewrite the prototype code as a class.',
              description: 'Checks modern class syntax.',
              code: `function Animal(this: any, name: string) { this.name = name; }
Animal.prototype.speak = function () { return this.name; };`,
              answer: 'A class gives TS full types for fields and methods.',
              solution: `class Animal {
  constructor(public name: string) {}
  speak() { return this.name; }
}`,
            },
            {
              task: 'Predict whether this compiles.',
              description: 'Checks new on plain functions.',
              code: `function F(this: any) {}
new F();`,
              answer: 'With noImplicitAny it errors: a plain function has no construct signature. Use a class.',
            },
            {
              easy: true,
              task: 'Predict whether this compiles.',
              description: 'Checks calling class without new.',
              code: `class A {}
A();`,
              answer: 'No; class constructors must be called with new.',
            },
            {
              easy: true,
              task: 'Name what replaces Animal.prototype.speak in a class.',
              description: 'Checks class method syntax.',
              code: 'class Animal { speak() { return \'hi\'; } }',
              answer: 'A class method; it is stored on Animal.prototype automatically.',
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
              task: 'Predict whether Node can run this file.',
              description: 'Checks Node type stripping limits.',
              code: 'class A { constructor(private x: number) {} }',
              answer: 'Not with strip-only mode: parameter properties need transforms. Use erasableSyntaxOnly to catch it.',
            },
            {
              task: 'Rewrite the class so it is erasable.',
              description: 'Checks erasable class syntax.',
              code: 'class A { constructor(private x: number) {} }',
              answer: 'Declare the field and assign it.',
              solution: `class A {
  #x: number;
  constructor(x: number) { this.#x = x; }
}`,
            },
            {
              easy: true,
              task: 'Predict whether Node can strip this.',
              description: 'Checks parameter properties.',
              code: 'class P { constructor(public x: number) {} }',
              answer: 'No; parameter properties need code generation, so type stripping fails.',
            },
            {
              easy: true,
              task: 'Name the flag that bans non-erasable syntax.',
              description: 'Checks erasable syntax option.',
              answer: 'erasableSyntaxOnly reports enums, namespaces, and parameter properties.',
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
              task: 'Fix the cache read so methods come back.',
              description: 'Checks rehydrating class instances.',
              code: `const m: Money = JSON.parse(cache.get('m')!);
m.add(other);`,
              answer: 'JSON gives a plain object. Build an instance from the data.',
              solution: `const d = JSON.parse(cache.get('m')!) as { amount: number; currency: string };
const m = new Money(d.amount, d.currency);`,
            },
            {
              task: 'Write a static fromJSON method.',
              description: 'Checks factory methods for parsing.',
              code: 'class Money { constructor(public amount: number, public currency: string) {} }',
              answer: 'A static factory keeps the mapping in one place.',
              solution: `static fromJSON(d: { amount: number; currency: string }) {
  return new Money(d.amount, d.currency);
}`,
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks JSON drops methods.',
              code: `class A { f() {} }
const o = JSON.parse(JSON.stringify(new A()));
console.log(typeof o.f);`,
              answer: 'undefined; JSON keeps only data, not prototype methods.',
            },
            {
              easy: true,
              task: 'True or false: as Money changes the object.',
              description: 'Checks type assertions at runtime.',
              code: 'const m = JSON.parse(s) as Money;',
              answer: 'False; assertions are compile-time only and do not restore the prototype.',
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
              task: 'Rewrite the exported class as a factory.',
              description: 'Checks factory exports for libraries.',
              code: 'export class Toast { constructor(private msg: string) {} show() {} }',
              answer: 'Factories hide internals and avoid this and instanceof issues across packages.',
              solution: `export function createToast(msg: string) {
  return { show: () => render(msg) };
}`,
            },
            {
              task: 'Spot the risk with instanceof across packages.',
              description: 'Checks duplicate package copies.',
              code: 'if (err instanceof LibError) {} // two versions installed',
              answer: 'Two copies of the library mean two classes, so instanceof fails. Use a tag property check.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks instanceof across copies.',
              code: `// A from pkg copy 1, a from pkg copy 2
console.log(a instanceof A);`,
              answer: 'Can be false; two package copies have different class identities.',
            },
            {
              easy: true,
              task: 'Name one plus of factory functions.',
              description: 'Checks factory benefits.',
              code: 'export const createStore = () => ({ get() {} });',
              answer: 'No new or this binding issues, and internals stay private via closure.',
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
              task: 'Write code that removes duplicates.',
              description: 'Checks Set for uniqueness.',
              code: 'const tags = [\'a\', \'b\', \'a\'];',
              answer: 'Spread a Set back to an array.',
              solution: 'const unique = [...new Set(tags)];',
            },
            {
              task: 'Predict the output.',
              description: 'Checks Set.has vs includes.',
              code: `const s = new Set([NaN]);
console.log(s.has(NaN), [NaN].indexOf(NaN));`,
              answer: 'true -1: Set uses SameValueZero, indexOf uses ===.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks Set size with duplicates.',
              code: 'console.log(new Set([1, 1, 2]).size);',
              answer: '2, because a Set keeps only unique values.',
            },
            {
              easy: true,
              task: 'Name the faster lookup: Set.has or array.includes.',
              description: 'Checks lookup cost.',
              code: 's.has(x); arr.includes(x);',
              answer: 'Set.has, which is near O(1) while includes scans O(n).',
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
              task: 'Fix the Set type.',
              description: 'Checks generic Set typing.',
              code: `const ids = new Set();
ids.add(1);`,
              answer: 'Without a type argument, it is Set<unknown>. Add a generic.',
              solution: 'const ids = new Set<number>();',
            },
            {
              task: 'Predict the type of s.',
              description: 'Checks Set inference from values.',
              code: 'const s = new Set([1, 2]);',
              answer: 's is Set<number>.',
            },
            {
              easy: true,
              task: 'Predict the type of s.',
              description: 'Checks Set inference from values.',
              code: 'const s = new Set([1, 2]);',
              answer: 'Set<number>, inferred from the initial values.',
            },
            {
              easy: true,
              task: 'Write an empty Set of strings.',
              description: 'Checks explicit generic argument.',
              answer: 'new Set<string>() sets the element type explicitly.',
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
              task: 'Fix the loop to print name and score.',
              description: 'Checks Map iteration.',
              code: 'for (const [name, score] of scores.keys()) console.log(name, score);',
              answer: 'keys() gives only keys. Iterate the Map itself for pairs.',
              solution: 'for (const [name, score] of scores) console.log(name, score);',
            },
            {
              task: 'Predict the output.',
              description: 'Checks Map insertion order.',
              code: `const m = new Map([['b', 1], ['a', 2]]);
console.log([...m.keys()]);`,
              answer: '["b", "a"]: Map keeps insertion order.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks Map entries in for-of.',
              code: `const m = new Map([['a', 1]]);
for (const [k, v] of m) console.log(k, v);`,
              answer: 'a 1, because iterating a Map gives [key, value] pairs.',
            },
            {
              easy: true,
              task: 'Name the method that gives only values.',
              description: 'Checks Map values iterator.',
              code: 'const m = new Map([[\'a\', 1]]);',
              answer: 'm.values() returns an iterator of the values only.',
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
              task: 'Predict whether this compiles.',
              description: 'Checks WeakMap key constraint.',
              code: 'const w = new WeakMap<number, string>();',
              answer: 'It fails: keys must be objects (WeakKey). Primitives cannot be garbage-collected.',
            },
            {
              task: 'Write a WeakMap for per-element data.',
              description: 'Checks WeakMap with DOM keys.',
              answer: 'Elements as keys; entries go away when the element does.',
              solution: `const meta = new WeakMap<Element, { clicks: number }>();
meta.set(button, { clicks: 0 });`,
            },
            {
              easy: true,
              task: 'Predict whether this compiles.',
              description: 'Checks string key in WeakSet.',
              code: 'const w = new WeakSet<string>();',
              answer: 'No; WeakSet values must be objects, not strings.',
            },
            {
              easy: true,
              task: 'True or false: you can loop over a WeakMap.',
              description: 'Checks WeakMap iteration.',
              answer: 'False; WeakMap is not iterable because keys can vanish anytime.',
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
              task: 'Fix the lookup by using a string key.',
              description: 'Checks Map key equality by reference.',
              code: `prices.set(['USD', 'EUR'], 0.92);
prices.get(['USD', 'EUR']);`,
              answer: 'Arrays are compared by reference. Join them into a string key.',
              solution: `const prices = new Map<string, number>();
prices.set('USD:EUR', 0.92);
prices.get('USD:EUR');`,
            },
            {
              task: 'Predict the output.',
              description: 'Checks reference keys.',
              code: `const k = ['a'];
const m = new Map([[k, 1]]);
console.log(m.get(k), m.get(['a']));`,
              answer: '1 undefined: only the same array reference matches.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks object key identity.',
              code: `const k = { a: 1 };
const m = new Map([[k, 1]]);
console.log(m.get({ a: 1 }));`,
              answer: 'undefined; Map compares object keys by reference, not content.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks same reference lookup.',
              code: `const k = [1];
const m = new Map([[k, 'x']]);
console.log(m.get(k));`,
              answer: 'x, because the same array reference is used.',
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
              task: 'Fix the save so data is kept.',
              description: 'Checks serializing Maps.',
              code: 'localStorage.setItem(\'s\', JSON.stringify(scores));',
              answer: 'Convert the Map to entries or an object first.',
              solution: `localStorage.setItem('s', JSON.stringify([...scores]));
const back = new Map<string, number>(JSON.parse(localStorage.getItem('s') ?? '[]'));`,
            },
            {
              task: 'Write a one-line Map to object conversion.',
              description: 'Checks Object.fromEntries.',
              code: 'const m = new Map([[\'a\', 1]]);',
              answer: 'Object.fromEntries accepts Map entries.',
              solution: 'const obj = Object.fromEntries(m); // { a: 1 }',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks JSON of a Set.',
              code: 'console.log(JSON.stringify(new Set([1])));',
              answer: '{} because Set has no enumerable own properties.',
            },
            {
              easy: true,
              task: 'Write a Map from a plain object.',
              description: 'Checks Object.entries to Map.',
              answer: 'new Map(Object.entries(obj)) turns key-value pairs into a Map.',
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
              task: 'Fix the return type so callers cannot change the Map.',
              description: 'Checks ReadonlyMap.',
              code: 'getCache(): Map<string, User> { return this.#cache; }',
              answer: 'ReadonlyMap removes set, delete and clear from the type.',
              solution: 'getCache(): ReadonlyMap<string, User> { return this.#cache; }',
            },
            {
              task: 'Predict whether this compiles.',
              description: 'Checks ReadonlySet methods.',
              code: `const s: ReadonlySet<number> = new Set([1]);
s.add(2);`,
              answer: 'It fails: add does not exist on ReadonlySet.',
            },
            {
              easy: true,
              task: 'Predict whether this compiles.',
              description: 'Checks set on ReadonlyMap.',
              code: `const m: ReadonlyMap<string, number> = new Map();
m.set('a', 1);`,
              answer: 'No; ReadonlyMap has no set method in its type.',
            },
            {
              easy: true,
              task: 'True or false: ReadonlySet freezes it at runtime.',
              description: 'Checks readonly is type-only.',
              answer: 'False; it only hides mutating methods in types.',
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
              task: 'Write a typed registry with a key map.',
              description: 'Checks typed get by key.',
              code: 'type Reg = { theme: \'dark\' | \'light\'; size: number };',
              answer: 'Use K extends keyof Reg so get returns Reg[K].',
              solution: `const store = new Map<keyof Reg, unknown>();
function get<K extends keyof Reg>(k: K) { return store.get(k) as Reg[K]; }`,
            },
            {
              task: 'Predict the type of t.',
              description: 'Checks unknown from Map<string, unknown>.',
              code: `const r = new Map<string, unknown>();
const t = r.get('theme');`,
              answer: 't is unknown: the Map does not know per-key types.',
            },
            {
              easy: true,
              task: 'Predict the type of v.',
              description: 'Checks Map get return type.',
              code: `const m = new Map<string, number>();
const v = m.get('a');`,
              answer: 'number | undefined, because the key may be missing.',
            },
            {
              easy: true,
              task: 'Name the type for a key-to-value map.',
              description: 'Checks keyof on a record.',
              code: 'type Reg = { theme: \'dark\' | \'light\'; size: number };',
              answer: 'Use K extends keyof Reg and return Reg[K].',
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
              task: 'Fix the cache so it handles freed objects.',
              description: 'Checks WeakRef deref returning undefined.',
              code: 'return refs.get(k)!.deref()!.draw();',
              answer: 'deref may return undefined after GC; check it.',
              solution: `const obj = refs.get(k)?.deref();
if (!obj) { refs.delete(k); return; }
return obj.draw();`,
            },
            {
              task: 'Predict the type of x.',
              description: 'Checks WeakRef.deref type.',
              code: `declare const r: WeakRef<Bitmap>;
const x = r.deref();`,
              answer: 'x is Bitmap | undefined.',
            },
            {
              easy: true,
              task: 'Predict the type of x.',
              description: 'Checks deref return type.',
              code: `declare const r: WeakRef<Date>;
const x = r.deref();`,
              answer: 'Date | undefined, since the object may be garbage collected.',
            },
            {
              easy: true,
              task: 'Fix the call safely.',
              description: 'Checks optional chaining on deref.',
              code: 'ref.deref()!.draw();',
              answer: 'Use ref.deref()?.draw() so a freed object does not crash.',
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
              task: 'Write private data with a WeakMap.',
              description: 'Checks WeakMap privacy pattern.',
              answer: 'Store data keyed by instance in a module WeakMap.',
              solution: `const secrets = new WeakMap<User, string>();
class User { constructor(s: string) { secrets.set(this, s); } }`,
            },
            {
              task: 'Name one case for WeakMap over #private.',
              description: 'Checks choosing privacy mechanisms.',
              answer: 'Attaching data to objects you do not own, like DOM nodes or third-party instances.',
            },
            {
              easy: true,
              task: 'Name the syntax for true private fields.',
              description: 'Checks hash private fields.',
              code: 'class A { #secret = 1; }',
              answer: '#secret, a runtime-private field checked by JavaScript itself.',
            },
            {
              easy: true,
              task: 'True or false: WeakMap keys stop garbage collection.',
              description: 'Checks WeakMap memory behavior.',
              answer: 'False; WeakMap holds keys weakly, so entries go when keys go.',
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
              task: 'Fix the handler so user data stays per request.',
              description: 'Checks request-scoped state.',
              code: `const currentUser = new Map<string, User>();
currentUser.set('me', await auth(req));`,
              answer: 'Keep data in local variables, not module state.',
              solution: `export async function handler(req: Request) {
  const user = await auth(req);
  return render(user);
}`,
            },
            {
              task: 'Name the Node API for request context.',
              description: 'Checks AsyncLocalStorage.',
              answer: 'AsyncLocalStorage keeps a value per async request chain.',
            },
            {
              easy: true,
              task: 'Predict the risk.',
              description: 'Checks module-level state on server.',
              code: 'let user: User; // module scope in server',
              answer: 'All requests share it, so one user may see another user\'s data.',
            },
            {
              easy: true,
              task: 'Name the class from node:async_hooks.',
              description: 'Checks per-request storage API.',
              answer: 'AsyncLocalStorage keeps data for each request\'s async context.',
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
              task: 'Predict the output in a 2026 browser.',
              description: 'Checks new Set methods.',
              code: `const a = new Set([1, 2]), b = new Set([2, 3]);
console.log([...a.intersection(b)]);`,
              answer: '[2]. Set methods are Baseline 2024; TS needs lib ES2025 or esnext.',
            },
            {
              task: 'Name two ways to use new methods safely.',
              description: 'Checks browser support decisions.',
              answer: 'Check Baseline and your browserslist, then polyfill (core-js) or wait. Set tsconfig lib to match the targets.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks Set union method.',
              code: 'console.log([...new Set([1]).union(new Set([2]))]);',
              answer: '[1, 2]; union returns a new Set with both values.',
            },
            {
              easy: true,
              task: 'Name the tsconfig setting for new Set types.',
              description: 'Checks lib option.',
              answer: 'lib with ESNext (or ES2025) adds types for new Set methods.',
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
              task: 'Make the class work with for-of.',
              description: 'Checks implementing Symbol.iterator.',
              code: 'class Bag { items = [1, 2]; }',
              answer: 'Add a [Symbol.iterator] generator method.',
              solution: `class Bag {
  items = [1, 2];
  *[Symbol.iterator]() { yield* this.items; }
}`,
            },
            {
              task: 'Predict the output.',
              description: 'Checks spread with custom iterables.',
              code: `const r = { *[Symbol.iterator]() { yield 'a'; yield 'b'; } };
console.log([...r].join(''));`,
              answer: '"ab".',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks spreading a string.',
              code: 'console.log([...\'hi\']);',
              answer: '[\'h\', \'i\'], because strings have Symbol.iterator.',
            },
            {
              easy: true,
              task: 'Predict whether this compiles.',
              description: 'Checks for-of on plain object.',
              code: 'for (const x of { a: 1 }) {}',
              answer: 'No; a plain object has no Symbol.iterator.',
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
              task: 'Fix the type so a symbol key is allowed.',
              description: 'Checks symbol index signatures.',
              code: `const obj: { [key: string]: number } = {};
obj[id] = 1;`,
              answer: 'Add a symbol index signature or a specific key.',
              solution: 'const obj: { [id]: number } = { [id]: 1 };',
            },
            {
              task: 'Predict the output.',
              description: 'Checks symbol keys and Object.keys.',
              code: `const s = Symbol('x');
console.log(Object.keys({ [s]: 1, a: 2 }));`,
              answer: '["a"]: symbol keys are not included.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks symbol uniqueness.',
              code: 'console.log(Symbol(\'a\') === Symbol(\'a\'));',
              answer: 'false; each Symbol() call makes a new unique value.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks symbol keys in Object.keys.',
              code: `const s = Symbol();
console.log(Object.keys({ [s]: 1 }));`,
              answer: '[] because Object.keys skips symbol keys.',
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
              task: 'Fix the code so the values come twice.',
              description: 'Checks generator objects are one-time.',
              code: `const g = nums();
console.log([...g], [...g]);`,
              answer: 'A generator object can be used once. Call the function again.',
              solution: 'console.log([...nums()], [...nums()]);',
            },
            {
              task: 'Predict the output.',
              description: 'Checks iterating arrays vs generators.',
              code: `const arr = [1, 2];
console.log([...arr], [...arr]);`,
              answer: '[1,2] [1,2]: arrays create a new iterator each time.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks generator next result.',
              code: `function* g() { yield 1; }
const it = g();
console.log(it.next());`,
              answer: '{ value: 1, done: false } for the first yield.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks generator body is lazy.',
              code: `function* g() { console.log('run'); yield 1; }
g();`,
              answer: 'Nothing prints; the body runs only when next() is called.',
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
              task: 'Predict the types in Generator<A, B, C>.',
              description: 'Checks generator type parameters.',
              code: 'function* g(): Generator<number, string, boolean> {}',
              answer: 'number is yielded, string is returned, boolean is what next() sends in.',
            },
            {
              task: 'Fix the type of the generator.',
              description: 'Checks yield and return types.',
              code: 'function* g(): Generator<string> { yield 1; return \'x\'; }',
              answer: 'It yields numbers, so the yield type must be number.',
              solution: 'function* g(): Generator<number, string> { yield 1; return \'x\'; }',
            },
            {
              easy: true,
              task: 'Name the yield type here.',
              description: 'Checks first Generator parameter.',
              code: 'function* g(): Generator<number, string, boolean> {}',
              answer: 'number is the yield type; string is return; boolean is next() input.',
            },
            {
              easy: true,
              task: 'Predict the type of x.',
              description: 'Checks the TNext parameter.',
              code: `function* g(): Generator<number, void, string> {
  const x = yield 1;
}`,
              answer: 'string, the type passed into next().',
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
              task: 'Fix the brand so only one function can create it.',
              description: 'Checks unique symbol brands.',
              code: 'type UserId = string & { __brand: \'UserId\' };',
              answer: 'Use a non-exported unique symbol and one validating factory.',
              solution: `declare const brand: unique symbol;
export type UserId = string & { [brand]: 'UserId' };
export const toUserId = (s: string): UserId => { if (!s) throw Error(); return s as UserId; };`,
            },
            {
              task: 'Predict whether this compiles.',
              description: 'Checks brand assignability.',
              code: `type UserId = string & { __b: 'U' };
const id: UserId = 'abc';`,
              answer: 'It fails: a plain string has no brand.',
            },
            {
              easy: true,
              task: 'Predict whether this compiles.',
              description: 'Checks raw string to brand.',
              code: `type Id = string & { __brand: 'Id' };
const id: Id = 'x';`,
              answer: 'No; a plain string lacks the brand property.',
            },
            {
              easy: true,
              task: 'Name the symbol form for a private brand.',
              description: 'Checks unique symbol brands.',
              code: 'declare const tag: unique symbol;',
              answer: 'unique symbol, which cannot be faked outside its module.',
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
              task: 'Fix the code to read the return value.',
              description: 'Checks next() for generator returns.',
              code: 'for (const s of steps()) console.log(s);',
              answer: 'for-of ignores the return value. Call next() manually.',
              solution: `const it = steps();
let r = it.next();
while (!r.done) r = it.next();
console.log(r.value); // 2`,
            },
            {
              task: 'Predict the output.',
              description: 'Checks yield* return value.',
              code: `function* inner() { yield 1; return 'r'; }
function* outer() { const v = yield* inner(); console.log(v); }
[...outer()];`,
              answer: 'It logs "r": yield* returns the inner return value.',
            },
            {
              easy: true,
              task: 'Predict the output.',
              description: 'Checks return value in spread.',
              code: `function* g() { yield 1; return 2; }
console.log([...g()]);`,
              answer: '[1]; spread and for-of ignore the return value.',
            },
            {
              easy: true,
              task: 'Predict the last next() result.',
              description: 'Checks done with return value.',
              code: `function* g() { return 2; }
console.log(g().next());`,
              answer: '{ value: 2, done: true } shows the return value.',
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
              task: 'Predict the type of it in TS 5.6+.',
              description: 'Checks built-in iterator types.',
              code: 'const it = [1, 2].values();',
              answer: 'ArrayIterator<number>, a subtype of IteratorObject with helper methods.',
            },
            {
              task: 'Name the flag added with this change.',
              description: 'Checks strictBuiltinIteratorReturn.',
              answer: 'strictBuiltinIteratorReturn makes built-in iterator return types undefined instead of any.',
            },
            {
              easy: true,
              task: 'Name the new iterator type from TS 5.6.',
              description: 'Checks IteratorObject naming.',
              answer: 'IteratorObject, with built-in subtypes like ArrayIterator and MapIterator.',
            },
            {
              easy: true,
              task: 'Predict the type of it.',
              description: 'Checks array values iterator type.',
              code: 'const it = [1, 2].values();',
              answer: 'ArrayIterator<number> in TS 5.6 and later.',
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
              task: 'Fix the class so using works.',
              description: 'Checks Symbol.dispose.',
              code: `class Conn { close() {} }
using c = new Conn();`,
              answer: 'using needs [Symbol.dispose] and lib esnext.disposable (or ES2025 lib).',
              solution: `class Conn {
  close() {}
  [Symbol.dispose]() { this.close(); }
}`,
            },
            {
              task: 'Predict the output.',
              description: 'Checks disposal order.',
              code: '{ using a = res(\'a\'); using b = res(\'b\'); } // res logs on dispose',
              answer: 'b then a: resources are disposed in reverse order.',
            },
            {
              easy: true,
              task: 'Name the symbol a using class needs.',
              description: 'Checks disposable protocol.',
              code: 'class Conn { [Symbol.dispose]() {} }',
              answer: 'Symbol.dispose, called automatically when the block ends.',
            },
            {
              easy: true,
              task: 'Predict the output order.',
              description: 'Checks dispose timing.',
              code: `{ using c = { [Symbol.dispose]() { console.log('b'); } };
  console.log('a'); }`,
              answer: 'a then b; disposal runs when the block exits.',
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
              task: 'Fix the generator to read async data.',
              description: 'Checks async generators.',
              code: `function* lines(s: AsyncIterable<string>) {
  for await (const l of s) yield l.trim();
}`,
              answer: 'for await needs an async generator.',
              solution: `async function* lines(s: AsyncIterable<string>) {
  for await (const l of s) yield l.trim();
}`,
            },
            {
              task: 'Predict the return type.',
              description: 'Checks async generator types.',
              code: 'async function* g() { yield 1; }',
              answer: 'AsyncGenerator<number, void, unknown>.',
            },
            {
              easy: true,
              task: 'Name the keyword for an async generator.',
              description: 'Checks async function* syntax.',
              answer: 'async function* lets you use for await and yield together.',
            },
            {
              easy: true,
              task: 'Predict whether this compiles.',
              description: 'Checks for await in sync generator.',
              code: 'function* g(s: AsyncIterable<number>) { for await (const x of s) yield x; }',
              answer: 'No; for await needs an async function or async generator.',
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
              task: 'Write a fallback for Symbol.dispose.',
              description: 'Checks polyfilling well-known symbols.',
              answer: 'Provide the symbol if missing so the library works on old runtimes.',
              solution: '(Symbol as any).dispose ??= Symbol(\'Symbol.dispose\');',
            },
            {
              task: 'Name one way to support both old and new users.',
              description: 'Checks compatibility in libraries.',
              answer: 'Provide a normal close() method too, and add [Symbol.dispose] that calls it.',
            },
            {
              easy: true,
              task: 'Name the symbol for async disposal.',
              description: 'Checks asyncDispose name.',
              code: 'class C { async [Symbol.asyncDispose]() {} }',
              answer: 'Symbol.asyncDispose, used by await using.',
            },
            {
              easy: true,
              task: 'True or false: old runtimes have Symbol.dispose.',
              description: 'Checks runtime support.',
              answer: 'False; older runtimes need a polyfill or a close() fallback.',
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
              task: 'Fix the stream so the connection is always released.',
              description: 'Checks finally in async generators.',
              code: `export async function* streamOrders() {
  const c = await db.connect();
  for await (const r of c.query()) yield r;
}`,
              answer: 'finally runs on completion, error, or early break.',
              solution: `  const c = await db.connect();
  try { for await (const r of c.query()) yield r; }
  finally { await c.release(); }`,
            },
            {
              task: 'Rewrite with await using.',
              description: 'Checks async disposal.',
              code: 'const c = await db.connect();',
              answer: 'await using calls [Symbol.asyncDispose] when the scope ends.',
              solution: 'await using c = await db.connect();',
            },
            {
              easy: true,
              task: 'Name the block that always runs cleanup.',
              description: 'Checks finally in generators.',
              code: 'async function* s() { try { yield 1; } finally { close(); } }',
              answer: 'finally runs even when the consumer breaks out early.',
            },
            {
              easy: true,
              task: 'Predict whether finally runs on break.',
              description: 'Checks return() on early exit.',
              code: 'for await (const r of stream()) break;',
              answer: 'Yes; break calls return(), which runs the generator\'s finally block.',
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
              task: 'Write a branded id with a safe constructor.',
              description: 'Checks gradual brand adoption.',
              answer: 'Add a brand and one entry point; migrate call sites slowly.',
              solution: `type OrderId = string & { readonly __brand: 'OrderId' };
const OrderId = (s: string) => s as OrderId;`,
            },
            {
              task: 'Name two steps for a gradual rollout.',
              description: 'Checks migration strategy.',
              answer: 'Brand new APIs first, accept plain strings at old edges, then tighten folder by folder with lint.',
            },
            {
              easy: true,
              task: 'Write a branded type for OrderId.',
              description: 'Checks brand syntax.',
              answer: 'type OrderId = string & { readonly __brand: \'OrderId\' }.',
            },
            {
              easy: true,
              task: 'Predict whether this compiles.',
              description: 'Checks mixing two brands.',
              code: `declare const u: UserId;
const o: OrderId = u;`,
              answer: 'No; UserId and OrderId have different brands.',
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
              task: 'Predict the type of r.',
              description: 'Checks Promise.all tuple typing.',
              code: 'const r = await Promise.all([Promise.resolve(1), Promise.resolve(\'a\')]);',
              answer: 'r is [number, string]: TS keeps the tuple order.',
            },
            {
              task: 'Fix the code to run requests in parallel.',
              description: 'Checks sequential vs parallel awaits.',
              code: `const a = await loadA();
const b = await loadB();`,
              answer: 'Start both, then await them together.',
              solution: 'const [a, b] = await Promise.all([loadA(), loadB()]);',
            },
            {
              easy: true,
              task: 'Predict the type of r.',
              description: 'Checks Promise.all tuple types.',
              code: 'const r = await Promise.all([Promise.resolve(1), Promise.resolve(\'a\')]);',
              answer: '[number, string], a tuple matching input order.',
            },
            {
              easy: true,
              task: 'Predict what happens on one rejection.',
              description: 'Checks Promise.all fail-fast.',
              code: 'await Promise.all([ok(), fail()]);',
              answer: 'It rejects right away with the first error.',
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
              task: 'Fix the loop so it waits.',
              description: 'Checks forEach with async callbacks.',
              code: `items.forEach(async i => { await save(i); });
console.log('done');`,
              answer: 'forEach ignores promises. Use for...of or Promise.all.',
              solution: `for (const i of items) await save(i);
console.log('done');`,
            },
            {
              task: 'Predict the output.',
              description: 'Checks async callbacks order.',
              code: `[1].forEach(async () => { await null; console.log('a'); });
console.log('b');`,
              answer: '"b" then "a".',
            },
            {
              easy: true,
              task: 'Predict the output order.',
              description: 'Checks await order in for-of.',
              code: `for (const i of [1, 2]) await log(i);
console.log('done');`,
              answer: '1, 2, then done; for-of with await runs in sequence.',
            },
            {
              easy: true,
              task: 'Name the parallel alternative to forEach async.',
              description: 'Checks Promise.all with map.',
              answer: 'await Promise.all(items.map(save)) waits for all saves.',
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
              task: 'Fix the try/catch so it catches the error.',
              description: 'Checks await inside try.',
              code: 'try { api.post(\'/save\'); } catch (e) { showError(e); }',
              answer: 'Without await, the rejection happens after try ends.',
              solution: 'try { await api.post(\'/save\'); } catch (e) { showError(e); }',
            },
            {
              task: 'Predict the output.',
              description: 'Checks returning a promise from try.',
              code: `async function f() { try { return Promise.reject('x'); } catch { return 'caught'; } }
f().catch(console.log);`,
              answer: 'It logs "x": return without await skips the catch. Use return await.',
            },
            {
              easy: true,
              task: 'Predict whether catch runs.',
              description: 'Checks awaited rejection in try.',
              code: 'try { await Promise.reject(\'x\'); } catch { console.log(\'c\'); }',
              answer: 'Yes, it prints c because the rejection was awaited.',
            },
            {
              easy: true,
              task: 'Name what the missing word is.',
              description: 'Checks missing await.',
              code: 'try { api.post(\'/save\'); } catch {}',
              answer: 'await; without it the rejection escapes the try block.',
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
              task: 'Predict the type of A.',
              description: 'Checks Awaited unwrapping.',
              code: 'type A = Awaited<Promise<Promise<number>>>;',
              answer: 'A is number: Awaited unwraps nested promises.',
            },
            {
              task: 'Write the result type of an async function.',
              description: 'Checks Awaited with ReturnType.',
              code: 'async function load() { return { id: 1 }; }',
              answer: 'Combine Awaited and ReturnType.',
              solution: 'type Data = Awaited<ReturnType<typeof load>>; // { id: number }',
            },
            {
              easy: true,
              task: 'Predict the type of A.',
              description: 'Checks Awaited unwrapping.',
              code: 'type A = Awaited<Promise<Promise<number>>>;',
              answer: 'number; Awaited unwraps nested promises.',
            },
            {
              easy: true,
              task: 'Predict the type of R.',
              description: 'Checks ReturnType of async function.',
              code: `async function f() { return 1; }
type R = ReturnType<typeof f>;`,
              answer: 'Promise<number>; use Awaited to get number.',
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
              task: 'Fix the handler so errors are handled.',
              description: 'Checks catching floating promises.',
              code: 'button.addEventListener(\'click\', () => { submit(); });',
              answer: 'Catch the error so it is not unhandled.',
              solution: `button.addEventListener('click', () => {
  submit().catch(showError);
});`,
            },
            {
              task: 'Name the lint rule for async event handlers.',
              description: 'Checks no-misused-promises.',
              code: 'button.addEventListener(\'click\', async () => { await submit(); });',
              answer: '@typescript-eslint/no-misused-promises (checksVoidReturn) flags async functions where void is expected.',
            },
            {
              easy: true,
              task: 'Name the type of floating promise bug.',
              description: 'Checks unhandled promise rejection.',
              code: 'button.onclick = () => { submit(); };',
              answer: 'An unhandled rejection, since nobody catches submit\'s error.',
            },
            {
              easy: true,
              task: 'Write a handler that catches errors.',
              description: 'Checks catch on a promise.',
              answer: '() => { submit().catch(showError); } handles the rejection.',
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
              task: 'Fix the code to keep partial results.',
              description: 'Checks Promise.allSettled.',
              code: 'const [a, b] = await Promise.all([loadA(), loadB()]);',
              answer: 'allSettled never rejects; check each status.',
              solution: `const [a, b] = await Promise.allSettled([loadA(), loadB()]);
if (a.status === 'fulfilled') use(a.value);`,
            },
            {
              task: 'Predict the output.',
              description: 'Checks Promise.any.',
              code: 'Promise.any([Promise.reject(1), Promise.resolve(2)]).then(console.log);',
              answer: 'It logs 2: any resolves with the first success.',
            },
            {
              easy: true,
              task: 'Predict the status values.',
              description: 'Checks allSettled result shape.',
              code: `const r = await Promise.allSettled([Promise.reject(1)]);
console.log(r[0].status);`,
              answer: 'rejected; allSettled reports each result instead of throwing.',
            },
            {
              easy: true,
              task: 'Name the field holding a fulfilled value.',
              description: 'Checks fulfilled result field.',
              answer: 'value holds it; rejected results have a reason field.',
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
              task: 'Fix the function so it can be cancelled.',
              description: 'Checks passing AbortSignal down.',
              code: 'async function load(id: string) { return fetch(\'/x/\' + id); }',
              answer: 'Accept a signal and pass it to fetch.',
              solution: `async function load(id: string, signal?: AbortSignal) {
  return fetch('/x/' + id, { signal });
}`,
            },
            {
              task: 'Write a signal that aborts after 5 seconds or on user cancel.',
              description: 'Checks AbortSignal.any and timeout.',
              code: 'const user = new AbortController();',
              answer: 'AbortSignal.any combines signals.',
              solution: 'const signal = AbortSignal.any([user.signal, AbortSignal.timeout(5000)]);',
            },
            {
              easy: true,
              task: 'Name the object that sends cancel signals.',
              description: 'Checks AbortController.',
              code: 'const c = new AbortController();',
              answer: 'AbortController; pass c.signal to work and call c.abort().',
            },
            {
              easy: true,
              task: 'Write a signal that aborts after 1 second.',
              description: 'Checks AbortSignal.timeout.',
              answer: 'AbortSignal.timeout(1000) returns a signal that aborts after 1 second.',
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
              task: 'Fix the loop so the page stays responsive.',
              description: 'Checks yielding to the main thread.',
              code: 'function processAll(rows: Row[]) { for (const r of rows) heavy(r); }',
              answer: 'Yield regularly so the browser can paint and handle input.',
              solution: `async function processAll(rows: Row[]) {
  for (const [i, r] of rows.entries()) {
    heavy(r);
    if (i % 100 === 0) await new Promise(res => setTimeout(res));
  }
}`,
            },
            {
              task: 'Name two other ways to avoid freezing the page.',
              description: 'Checks main-thread offloading.',
              answer: 'Move work to a Web Worker, or use scheduler.yield() where supported.',
            },
            {
              easy: true,
              task: 'True or false: setTimeout runs during a sync loop.',
              description: 'Checks event loop blocking.',
              answer: 'False; callbacks wait until the sync loop finishes.',
            },
            {
              easy: true,
              task: 'Name an API to yield to the browser.',
              description: 'Checks scheduler.yield.',
              code: 'await scheduler.yield();',
              answer: 'scheduler.yield() lets the browser handle input between chunks.',
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
              task: 'Fix the retry with a limit and delay.',
              description: 'Checks bounded retries with backoff.',
              code: 'catch { return retry(fn); }',
              answer: 'Add a counter and wait longer each time.',
              solution: `async function retry<T>(fn: () => Promise<T>, n = 3, ms = 200): Promise<T> {
  try { return await fn(); }
  catch (e) { if (n <= 0) throw e; await sleep(ms); return retry(fn, n - 1, ms * 2); }
}`,
            },
            {
              task: 'Spot the problem.',
              description: 'Checks retrying non-retryable errors.',
              code: 'retry(() => api.post(\'/pay\'));',
              answer: 'Retrying a payment can charge twice. Retry only safe or idempotent calls.',
            },
            {
              easy: true,
              task: 'Write a promise-based sleep helper.',
              description: 'Checks delay with setTimeout.',
              answer: 'const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));',
            },
            {
              easy: true,
              task: 'Predict the problem with endless retry.',
              description: 'Checks unbounded recursion risk.',
              code: 'catch { return retry(fn); }',
              answer: 'It can loop forever and hammer the server with no limit.',
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
              task: 'Write an error boundary fallback usage.',
              description: 'Checks React error boundaries.',
              answer: 'Wrap parts of the tree so one crash does not break the page.',
              solution: `<ErrorBoundary fallback={<p>Something went wrong.</p>}>
  <Orders />
</ErrorBoundary>`,
            },
            {
              task: 'Spot why the boundary does not catch this.',
              description: 'Checks boundaries and async errors.',
              code: 'onClick={async () => { await save(); }} // save throws',
              answer: 'Error boundaries catch render errors, not event handler or async errors. Catch and show state instead.',
            },
            {
              easy: true,
              task: 'True or false: error boundaries catch async errors.',
              description: 'Checks boundary limits.',
              answer: 'False; they catch render errors, not errors in promises or handlers.',
            },
            {
              easy: true,
              task: 'Predict whether the boundary catches this.',
              description: 'Checks errors in event handlers.',
              code: '<button onClick={() => { throw new Error(); }} />',
              answer: 'No; event handler errors are not caught by error boundaries.',
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
              task: 'Fix the handler so it does not block other requests.',
              description: 'Checks moving CPU work off the event loop.',
              code: 'const data = JSON.parse(req.body.toString());',
              answer: 'Parse big payloads in a worker thread, or stream-parse them.',
              solution: 'const data = await runInWorker(\'parse\', req.body);',
            },
            {
              task: 'Name two ways to handle big JSON in Node.',
              description: 'Checks Node CPU-heavy work.',
              answer: 'Use worker_threads, or a streaming parser. Also limit request body size.',
            },
            {
              easy: true,
              task: 'True or false: JSON.parse is async.',
              description: 'Checks JSON.parse blocking.',
              answer: 'False; it is synchronous and blocks the event loop.',
            },
            {
              easy: true,
              task: 'Name the Node module for CPU work threads.',
              description: 'Checks worker_threads.',
              code: 'import { Worker } from \'node:worker_threads\';',
              answer: 'node:worker_threads runs heavy work off the main thread.',
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
              task: 'Write code that reports INP.',
              description: 'Checks web-vitals usage.',
              answer: 'Use the web-vitals library and send values to analytics.',
              solution: `import { onINP } from 'web-vitals';
onINP(m => sendToAnalytics('INP', m.value));`,
            },
            {
              task: 'Name the good INP threshold.',
              description: 'Checks Core Web Vitals targets.',
              answer: '200 ms or less at the 75th percentile is good.',
            },
            {
              easy: true,
              task: 'Name the library that reports INP.',
              description: 'Checks web-vitals package.',
              code: 'import { onINP } from \'web-vitals\';',
              answer: 'web-vitals, whose onINP callback gives the INP value.',
            },
            {
              easy: true,
              task: 'Name the poor INP threshold.',
              description: 'Checks INP thresholds.',
              answer: 'Above 500 ms is poor; 200 ms or less is good.',
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
              task: 'Predict whether esbuild reports this error.',
              description: 'Checks transpile-only tools.',
              code: 'const n: number = \'x\';',
              answer: 'No: esbuild and Vite only strip types. Run tsc --noEmit for checks.',
            },
            {
              task: 'Write the npm script for type checks with Vite.',
              description: 'Checks separating build and type check.',
              answer: 'Run tsc without output next to the Vite build.',
              solution: '"build": "tsc -b && vite build"',
            },
            {
              easy: true,
              task: 'True or false: Vite type-checks your code.',
              description: 'Checks Vite transpile-only behavior.',
              answer: 'False; Vite uses esbuild to strip types without checking them.',
            },
            {
              easy: true,
              task: 'Name the tsc flag for check only.',
              description: 'Checks noEmit.',
              code: 'tsc --noEmit',
              answer: '--noEmit checks types and writes no files.',
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
              task: 'Fix tsconfig so dist is not checked.',
              description: 'Checks exclude and include.',
              code: '{ "compilerOptions": { "outDir": "dist" } }',
              answer: 'Include only source files.',
              solution: '{ "compilerOptions": { "outDir": "dist" }, "include": ["src"] }',
            },
            {
              task: 'Predict what tsc includes by default.',
              description: 'Checks default include.',
              code: '{ "compilerOptions": {} }',
              answer: 'All .ts files in the folder tree, except node_modules and outDir.',
            },
            {
              easy: true,
              task: 'Name the key for skipped folders.',
              description: 'Checks exclude option.',
              code: '{ "exclude": ["dist"] }',
              answer: 'exclude removes dist from the files tsc checks.',
            },
            {
              easy: true,
              task: 'Predict if node_modules is excluded by default.',
              description: 'Checks default exclude.',
              answer: 'Yes; without exclude, tsc skips node_modules and outDir by default.',
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
              task: 'Fix the import so only debounce is bundled.',
              description: 'Checks tree-shakeable imports.',
              code: 'import _ from \'lodash\';',
              answer: 'Use lodash-es named imports or a per-method import.',
              solution: 'import { debounce } from \'lodash-es\';',
            },
            {
              task: 'Name a way to see what is in the bundle.',
              description: 'Checks bundle analysis.',
              answer: 'Use a bundle visualizer like rollup-plugin-visualizer or source-map-explorer.',
            },
            {
              easy: true,
              task: 'Write a named import of debounce.',
              description: 'Checks ESM named import.',
              answer: 'import { debounce } from \'lodash-es\'; enables tree shaking.',
            },
            {
              easy: true,
              task: 'Name the term for removing unused code.',
              description: 'Checks tree shaking.',
              answer: 'Tree shaking, which drops unused exports from the bundle.',
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
              task: 'Fix tsconfig to reuse previous build info.',
              description: 'Checks incremental option.',
              code: '{ "compilerOptions": { "noEmit": true } }',
              answer: 'incremental writes .tsbuildinfo so later runs check less.',
              solution: '{ "compilerOptions": { "noEmit": true, "incremental": true } }',
            },
            {
              task: 'Spot the CI problem.',
              description: 'Checks caching tsbuildinfo.',
              code: '# CI runs on a fresh container each time',
              answer: 'tsbuildinfo is lost every run, so incremental does nothing. Cache it.',
            },
            {
              easy: true,
              task: 'Name the flag that turns on incremental.',
              description: 'Checks incremental option.',
              code: '{ "compilerOptions": { "incremental": true } }',
              answer: 'incremental: true saves build info for faster rebuilds.',
            },
            {
              easy: true,
              task: 'Predict the file extension tsc writes.',
              description: 'Checks build info file name.',
              answer: '.tsbuildinfo, which stores data from the last build.',
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
              task: 'Fix the re-export for isolatedModules.',
              description: 'Checks export type.',
              code: `import { User, createUser } from './user';
export { User, createUser };`,
              answer: 'Type-only re-exports must say export type.',
              solution: `export type { User } from './user';
export { createUser } from './user';`,
            },
            {
              task: 'Predict whether this compiles with verbatimModuleSyntax.',
              description: 'Checks inline type modifiers.',
              code: 'import { type User, createUser } from \'./user\';',
              answer: 'It compiles: the type modifier removes User from the emitted import.',
            },
            {
              easy: true,
              task: 'Write a type-only import.',
              description: 'Checks import type syntax.',
              answer: 'import type { User } from \'./user\'; is erased at runtime.',
            },
            {
              easy: true,
              task: 'Predict whether this works with isolatedModules.',
              description: 'Checks export type syntax.',
              code: 'export type { User } from \'./user\';',
              answer: 'Yes; export type tells the compiler to erase it safely.',
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
              task: 'Fix the import to skip the barrel file.',
              description: 'Checks direct imports.',
              code: 'import { Button } from \'@/components\';',
              answer: 'Import the file directly so tools load less code.',
              solution: 'import { Button } from \'@/components/Button\';',
            },
            {
              task: 'Name the lint rule that blocks barrel imports.',
              description: 'Checks enforcing import paths.',
              answer: 'no-restricted-imports with the barrel path, or eslint-plugin-barrel-files.',
            },
            {
              easy: true,
              task: 'Name a barrel file.',
              description: 'Checks barrel concept.',
              code: `// index.ts
export * from './Button';`,
              answer: 'A file that re-exports many modules from one index.',
            },
            {
              easy: true,
              task: 'Write a direct import of Button.',
              description: 'Checks bypassing barrels.',
              answer: 'import { Button } from \'@/components/Button\'; loads only that file.',
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
              task: 'Fix the export for isolatedDeclarations.',
              description: 'Checks explicit return types.',
              code: 'export function sum(a: number, b: number) { return a + b; }',
              answer: 'Exports need explicit types so .d.ts files can be made per file.',
              solution: 'export function sum(a: number, b: number): number { return a + b; }',
            },
            {
              task: 'Name the main benefit of isolatedDeclarations.',
              description: 'Checks parallel declaration emit.',
              answer: 'Fast tools can emit .d.ts per file without the type checker, so packages build in parallel.',
            },
            {
              easy: true,
              task: 'Predict whether this passes isolatedDeclarations.',
              description: 'Checks inferred export type.',
              code: 'export const f = () => 1;',
              answer: 'No; exported functions need an explicit return type.',
            },
            {
              easy: true,
              task: 'Fix the export for isolatedDeclarations.',
              description: 'Checks explicit return type.',
              code: 'export function f() { return 1; }',
              answer: 'Write export function f(): number so types need no inference.',
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
              task: 'Fix the setup with project references.',
              description: 'Checks splitting builds.',
              code: '{ "include": ["packages/*/src"] }',
              answer: 'Give each package its own composite config and reference them.',
              solution: '{ "files": [], "references": [{ "path": "packages/core" }, { "path": "packages/web" }] }',
            },
            {
              task: 'Name the command that builds references.',
              description: 'Checks tsc build mode.',
              answer: 'tsc -b builds referenced projects in order and skips unchanged ones.',
            },
            {
              easy: true,
              task: 'Name the tsconfig key for references.',
              description: 'Checks references option.',
              code: '{ "references": [{ "path": "./packages/a" }] }',
              answer: 'references, listing other projects to build first.',
            },
            {
              easy: true,
              task: 'Name the flag each referenced project needs.',
              description: 'Checks composite option.',
              answer: 'composite: true, so the project can be referenced.',
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
              task: 'Fix the signature with simple overloads.',
              description: 'Checks simpler generic types.',
              code: 'function pipe<T extends readonly ((x: any) => any)[]>(...fns: T) {}',
              answer: 'A few overloads are fast and readable.',
              solution: `function pipe<A, B>(f: (a: A) => B): (a: A) => B;
function pipe<A, B, C>(f: (a: A) => B, g: (b: B) => C): (a: A) => C;
function pipe(...fns: Function[]) { return (x: any) => fns.reduce((v, f) => f(v), x); }`,
            },
            {
              task: 'Name a sign that a generic is too costly.',
              description: 'Checks type instantiation limits.',
              answer: 'Errors like "Type instantiation is excessively deep", or high counts in --extendedDiagnostics.',
            },
            {
              easy: true,
              task: 'Name the flag that lists slow types.',
              description: 'Checks generateTrace.',
              code: 'tsc --generateTrace out',
              answer: '--generateTrace writes a trace that shows slow type checks.',
            },
            {
              easy: true,
              task: 'True or false: deep recursive types slow checks.',
              description: 'Checks type complexity cost.',
              answer: 'True; deep recursion and big unions make the checker do more work.',
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
              task: 'Name two steps to prepare for the native compiler.',
              description: 'Checks TS 7 readiness.',
              answer: 'Remove deprecated options and run tsgo (@typescript/native-preview) in CI to compare results.',
            },
            {
              task: 'Spot the option likely to break.',
              description: 'Checks deprecated config.',
              code: '{ "compilerOptions": { "target": "ES5", "moduleResolution": "node" } }',
              answer: 'ES5 target and node10 resolution are deprecated. Move to ES2020+ and bundler or nodenext.',
            },
            {
              easy: true,
              task: 'Name the npm package for the Go preview.',
              description: 'Checks native preview package.',
              answer: '@typescript/native-preview, which provides the tsgo command.',
            },
            {
              easy: true,
              task: 'True or false: the Go compiler changes TS syntax.',
              description: 'Checks language compatibility.',
              answer: 'False; it aims to keep the same language, only much faster.',
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
              task: 'Fix the configs with a shared base.',
              description: 'Checks tsconfig extends.',
              code: '// a: { "strict": true }   b: { "strict": false }',
              answer: 'Put settings in one base and extend it.',
              solution: `// packages/a/tsconfig.json
{ "extends": "@acme/tsconfig/base.json", "include": ["src"] }`,
            },
            {
              task: 'Predict which wins.',
              description: 'Checks extends override order.',
              code: '{ "extends": "./base.json", "compilerOptions": { "strict": false } } // base: strict true',
              answer: 'strict is false: local options override the base.',
            },
            {
              easy: true,
              task: 'Name the key that shares a base config.',
              description: 'Checks extends option.',
              code: '{ "extends": "../../tsconfig.base.json" }',
              answer: 'extends, which pulls settings from a shared base file.',
            },
            {
              easy: true,
              task: 'Predict the final strict value.',
              description: 'Checks override after extends.',
              code: `// base: strict true
{ "extends": "./base.json", "compilerOptions": { "strict": false } }`,
              answer: 'false; local compilerOptions override the base config.',
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
              task: 'Name the flag that prints check time.',
              description: 'Checks measuring tsc performance.',
              answer: 'tsc --extendedDiagnostics shows check time, memory, and instantiations.',
            },
            {
              task: 'Name one way to stop slow growth.',
              description: 'Checks tracking over time.',
              answer: 'Record check time in CI on each merge and alert when it grows past a budget.',
            },
            {
              easy: true,
              task: 'Name the flag for timing details.',
              description: 'Checks extendedDiagnostics.',
              code: 'tsc --extendedDiagnostics',
              answer: '--extendedDiagnostics prints check time, memory, and type counts.',
            },
            {
              easy: true,
              task: 'True or false: CI can fail on slow checks.',
              description: 'Checks budget enforcement.',
              answer: 'True; compare check time with a budget and fail when it grows.',
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
              task: 'Predict which line errors.',
              description: 'Checks unknown vs any.',
              code: `const a: any = 1; const u: unknown = 1;
a.foo(); u.foo();`,
              answer: 'Only u.foo() errors: unknown must be narrowed first.',
            },
            {
              task: 'Fix the code to use the unknown value.',
              description: 'Checks narrowing unknown.',
              code: 'function f(v: unknown) { return v.toUpperCase(); }',
              answer: 'Narrow with typeof.',
              solution: `function f(v: unknown) {
  return typeof v === 'string' ? v.toUpperCase() : '';
}`,
            },
            {
              easy: true,
              task: 'Predict whether this compiles.',
              description: 'Checks unknown property access.',
              code: `const v: unknown = 'a';
v.length;`,
              answer: 'No; unknown must be narrowed before use.',
            },
            {
              easy: true,
              task: 'Predict whether this compiles.',
              description: 'Checks any property access.',
              code: `const v: any = 5;
v.foo.bar;`,
              answer: 'Yes; any turns off checks, so it fails only at runtime.',
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
              task: 'Fix the array so Role is a union.',
              description: 'Checks as const for literal arrays.',
              code: `const ROLES = ['admin', 'user'];
type Role = (typeof ROLES)[number];`,
              answer: 'as const keeps literal types.',
              solution: `const ROLES = ['admin', 'user'] as const;
type Role = (typeof ROLES)[number]; // 'admin' | 'user'`,
            },
            {
              task: 'Write a guard that checks a string is a Role.',
              description: 'Checks includes with readonly tuples.',
              answer: 'Widen the array for includes, then narrow.',
              solution: 'const isRole = (s: string): s is Role => (ROLES as readonly string[]).includes(s);',
            },
            {
              easy: true,
              task: 'Predict the type of r.',
              description: 'Checks as const tuple.',
              code: 'const r = [\'a\', \'b\'] as const;',
              answer: 'readonly [\'a\', \'b\'], keeping literal types.',
            },
            {
              easy: true,
              task: 'Predict the type of x.',
              description: 'Checks literal widening in let.',
              code: 'let x = \'admin\';',
              answer: 'string, because let widens the literal type.',
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
              task: 'Name two ways to make the alias work at runtime.',
              description: 'Checks path alias runtime support.',
              answer: 'Use package.json "imports" with #/* aliases, or configure the bundler (Vite resolve.alias).',
            },
            {
              task: 'Rewrite the alias with Node subpath imports.',
              description: 'Checks package imports field.',
              code: 'import { api } from \'@/api\';',
              answer: 'Node supports # imports natively; TS reads them too.',
              solution: `// package.json: "imports": { "#/*": "./src/*" }
import { api } from '#/api.js';`,
            },
            {
              easy: true,
              task: 'True or false: tsc rewrites path aliases.',
              description: 'Checks paths are type-only.',
              answer: 'False; paths only guide type lookup and are not rewritten in output.',
            },
            {
              easy: true,
              task: 'Name the package.json key for subpath imports.',
              description: 'Checks imports field.',
              code: '{ "imports": { "#api": "./src/api.ts" } }',
              answer: 'imports, whose keys must start with #.',
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
              task: 'Write a schema and infer its type.',
              description: 'Checks z.infer.',
              answer: 'Define once; get both validation and types.',
              solution: `const User = z.object({ id: z.string(), age: z.number() });
type User = z.infer<typeof User>;`,
            },
            {
              task: 'Fix the code to validate safely without throwing.',
              description: 'Checks safeParse.',
              code: 'const u = User.parse(data);',
              answer: 'safeParse returns a result object.',
              solution: `const r = User.safeParse(data);
if (!r.success) return showError(r.error);
use(r.data);`,
            },
            {
              easy: true,
              task: 'Name the zod helper for inferred types.',
              description: 'Checks z.infer.',
              code: 'const S = z.object({ id: z.number() });',
              answer: 'z.infer<typeof S> gives { id: number }.',
            },
            {
              easy: true,
              task: 'Name the method that does not throw.',
              description: 'Checks safeParse.',
              answer: 'safeParse returns { success, data or error } instead of throwing.',
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
              task: 'Fix the env types so they merge.',
              description: 'Checks module vs global declaration files.',
              code: `import 'vite/client';
interface ImportMetaEnv { VITE_API_URL: string }`,
              answer: 'The import makes the file a module, so the interface is local. Use a triple-slash reference.',
              solution: `/// <reference types="vite/client" />
interface ImportMetaEnv { readonly VITE_API_URL: string }`,
            },
            {
              task: 'Predict the type of the variable.',
              description: 'Checks ImportMetaEnv usage.',
              code: 'const url = import.meta.env.VITE_API_URL;',
              answer: 'string, once ImportMetaEnv is merged correctly.',
            },
            {
              easy: true,
              task: 'Name the problem an import causes in .d.ts.',
              description: 'Checks module vs global scope.',
              code: 'import \'vite/client\';',
              answer: 'The file becomes a module, so its interfaces are not global.',
            },
            {
              easy: true,
              task: 'Name the block that fixes global types.',
              description: 'Checks declare global.',
              code: 'declare global { interface ImportMetaEnv { X: string } }',
              answer: 'declare global, which merges types into global scope from a module.',
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
              task: 'Write a declaration for the untyped package.',
              description: 'Checks declare module.',
              code: 'import slugify from \'tiny-slug\';',
              answer: 'Add a .d.ts with declare module.',
              solution: `// types/tiny-slug.d.ts
declare module 'tiny-slug' {
  export default function slugify(s: string): string;
}`,
            },
            {
              task: 'Name the first thing to check.',
              description: 'Checks DefinitelyTyped.',
              answer: 'Check for @types/tiny-slug on npm (DefinitelyTyped) before writing your own.',
            },
            {
              easy: true,
              task: 'Write a quick shorthand module declaration.',
              description: 'Checks ambient module shorthand.',
              answer: 'declare module \'tiny-slug\'; makes all imports from it any.',
            },
            {
              easy: true,
              task: 'Name the scope for community types.',
              description: 'Checks DefinitelyTyped packages.',
              code: 'npm i -D @types/tiny-slug',
              answer: '@types, published from DefinitelyTyped.',
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
              task: 'Write the command to generate types from OpenAPI.',
              description: 'Checks openapi-typescript.',
              answer: 'openapi-typescript turns the spec into a paths type.',
              solution: 'npx openapi-typescript ./openapi.yaml -o src/api/schema.d.ts',
            },
            {
              task: 'Write a typed client call.',
              description: 'Checks openapi-fetch usage.',
              code: `import createClient from 'openapi-fetch';
import type { paths } from './schema';`,
              answer: 'The client checks path, params and response types.',
              solution: `const api = createClient<paths>({ baseUrl: '/api' });
const { data } = await api.GET('/users/{id}', { params: { path: { id: '1' } } });`,
            },
            {
              easy: true,
              task: 'Name a tool that generates OpenAPI types.',
              description: 'Checks openapi-typescript.',
              code: 'npx openapi-typescript api.yaml -o api.d.ts',
              answer: 'openapi-typescript turns an OpenAPI file into TS types.',
            },
            {
              easy: true,
              task: 'True or false: generated types validate responses.',
              description: 'Checks types vs runtime.',
              answer: 'False; types are compile-time only and do not check real data.',
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
              task: 'Fix the hook so the default must be an option.',
              description: 'Checks NoInfer in hooks.',
              code: 'function useSelect<T>(options: T[], initial: T) {}',
              answer: 'NoInfer makes T come only from options.',
              solution: 'function useSelect<T extends string>(options: T[], initial: NoInfer<T>) {}',
            },
            {
              task: 'Predict the type of T.',
              description: 'Checks inference from multiple arguments.',
              code: `declare function f<T>(a: T[], b: T): T;
const r = f(['a'], 'c');`,
              answer: 'r is string: both arguments widen T to string.',
            },
            {
              easy: true,
              task: 'Name the utility that blocks inference.',
              description: 'Checks NoInfer.',
              code: 'function f<T>(a: T[], d: NoInfer<T>) {}',
              answer: 'NoInfer<T>, so T is inferred only from the other argument.',
            },
            {
              easy: true,
              task: 'Predict the type of T.',
              description: 'Checks literal inference with const.',
              code: `function f<const T>(x: T) {}
f('a');`,
              answer: '\'a\', because the const modifier keeps literal types.',
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
              task: 'Fix the package.json with an exports map.',
              description: 'Checks dual package types.',
              code: '{ "main": "dist/index.js", "module": "dist/index.mjs", "types": "dist/index.d.ts" }',
              answer: 'Give each format its own types with conditions.',
              solution: `{ "exports": { ".": {
  "import": { "types": "./dist/index.d.mts", "default": "./dist/index.mjs" },
  "require": { "types": "./dist/index.d.ts", "default": "./dist/index.js" } } } }`,
            },
            {
              task: 'Name a tool that checks package types.',
              description: 'Checks are-the-types-wrong.',
              answer: '@arethetypeswrong/cli (attw) checks types for each resolution mode.',
            },
            {
              easy: true,
              task: 'Name the package.json key for entry points.',
              description: 'Checks exports field.',
              code: '{ "exports": { ".": "./dist/index.js" } }',
              answer: 'exports, which controls entry points for ESM and CommonJS.',
            },
            {
              easy: true,
              task: 'Name the condition for type files.',
              description: 'Checks types condition.',
              answer: 'types, placed first inside each exports condition block.',
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
              task: 'Fix the comment so it fails when not needed.',
              description: 'Checks ts-expect-error vs ts-ignore.',
              code: `// @ts-ignore
legacyCall(1);`,
              answer: '@ts-expect-error errors when the line no longer has an error.',
              solution: `// @ts-expect-error legacy API takes string, OUT-123
legacyCall(1);`,
            },
            {
              task: 'Name the lint rule that controls these comments.',
              description: 'Checks ban-ts-comment.',
              answer: '@typescript-eslint/ban-ts-comment can ban @ts-ignore and require a description.',
            },
            {
              easy: true,
              task: 'Predict whether this errors.',
              description: 'Checks unused ts-expect-error.',
              code: `// @ts-expect-error
const n: number = 1;`,
              answer: 'Yes; an unused @ts-expect-error is reported as an error.',
            },
            {
              easy: true,
              task: 'True or false: @ts-ignore warns when unneeded.',
              description: 'Checks ts-ignore behavior.',
              answer: 'False; @ts-ignore stays silent even when no error exists.',
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
              task: 'Fix the import with a package name.',
              description: 'Checks workspace packages.',
              code: 'import { formatDate } from \'../../../packages/utils/src/date\';',
              answer: 'Depend on the workspace package and import by name.',
              solution: 'import { formatDate } from \'@acme/utils\';',
            },
            {
              task: 'Spot the problem with deep relative imports.',
              description: 'Checks package boundaries.',
              code: '\'../../../packages/utils/src/date\'',
              answer: 'It skips the package public API and breaks when folders move.',
            },
            {
              easy: true,
              task: 'Name the package.json field for workspaces.',
              description: 'Checks workspaces config.',
              code: '{ "workspaces": ["packages/*"] }',
              answer: 'workspaces, which links local packages by name.',
            },
            {
              easy: true,
              task: 'Write the import with a package name.',
              description: 'Checks workspace package import.',
              answer: 'import { formatDate } from \'@acme/utils\'; uses the package\'s exports.',
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
              task: 'Name two ways to turn on a strict flag gradually.',
              description: 'Checks incremental strictness.',
              answer: 'Use a separate tsconfig for strict folders, or tools like ts-strictify or betterer to block new errors.',
            },
            {
              task: 'Predict what this flag reports.',
              description: 'Checks noUncheckedIndexedAccess.',
              code: `const arr: string[] = [];
arr[0].toUpperCase();`,
              answer: 'With noUncheckedIndexedAccess, arr[0] is string | undefined, so this errors.',
            },
            {
              easy: true,
              task: 'Name the flag that bans implicit any.',
              description: 'Checks noImplicitAny.',
              code: 'function f(x) {}',
              answer: 'noImplicitAny, which errors when x has no type.',
            },
            {
              easy: true,
              task: 'Predict what this flag reports.',
              description: 'Checks noUncheckedIndexedAccess.',
              code: `const a: number[] = [];
const n: number = a[0];`,
              answer: 'An error; a[0] becomes number | undefined.',
            },
          ],
        },
      ],
    },
  },
};
