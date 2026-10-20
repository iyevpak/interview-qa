// React
export default {
  "JSX, Virtual DOM, and Components": {
    junior: [
      {
        q: "What does JSX turn into after compiling? What is the Virtual DOM? What is reconciliation?",
        short: "JSX compiles to jsx()/React.createElement calls that return plain element objects. React diffs the new element tree against the previous one (reconciliation) and applies the minimal DOM changes.",
        long: `JSX is syntax sugar: <Button kind="primary">Hi</Button> becomes jsx(Button, { kind: "primary", children: "Hi" }) with the automatic runtime (React 17+).
The result is an immutable description of UI, not real DOM nodes; "Virtual DOM" is the informal name for that tree.
On each render React compares the new tree with the previous one: different element type at a position = unmount/remount, same type = update props.
Keys help React match children in lists during this diff.
Since React 18 the work is split into a render phase (pure, interruptible) and a commit phase (DOM mutations, layout effects).
Pitfall: thinking the VDOM is "faster than the DOM" by itself — it is a programming model; the win is batching and minimal updates.
Weak answer: "JSX is HTML in JS". Strong answer: mentions the compile target, element objects, type/key-based diffing heuristics and render vs commit phases.`,
        exercises: [
          {
            task: "Predict what this component renders to the DOM.",
            description: "Checks which JS values React renders as children. Show the snippet and ask the candidate to describe the resulting DOM without running it.",
            code: `function Status({ ok }) {
  return (
    <ul>
      <li>{true}</li>
      <li>{null}</li>
      <li>{"" + 0}</li>
      <li>{ok ? "yes" : undefined}</li>
    </ul>
  );
}
<Status ok={false} />`,
            answer: "Four <li> elements: empty, empty, \"0\", empty. true, null and undefined render nothing, while the string \"0\" is rendered as text. A common wrong answer is that true renders \"true\" or that the string \"0\" is skipped like the number 0 would be in a && chain. A strong answer lists the full rule: booleans, null and undefined are ignored; strings and numbers render.",
          },
          {
            task: "Fix the JSX so it compiles. It should render a label linked to the input.",
            description: "Checks JSX vs HTML syntax differences. Give the snippet as a compile error and ask the candidate to fix it live.",
            code: `function Field() {
  return (
    <label for="email" class="lbl">Email</label>
    <input id="email">
  );
}`,
            answer: "JSX must return a single root, use className/htmlFor, and close every tag (void elements need />). Weak candidates fix only one issue (e.g. className) and miss the single-root rule. A strong answer explains why: JSX maps to JS props (class/for are reserved words) and a component returns one expression, so siblings need a Fragment.",
            solution: `function Field() {
  return (
    <>
      <label htmlFor="email" className="lbl">Email</label>
      <input id="email" />
    </>
  );
}`,
          },
        ],
      },
      {
        q: "This component throws the error \"Objects are not valid as a React child\". Why? How do you fix it?",
        code: `function Profile({ user }) {
  return <p>Joined: {user.createdAt} — {user}</p>; // createdAt is a Date
}`,
        short: "React can render strings, numbers, elements and arrays of them, but not plain objects or Date instances. Render a specific field or format the value into a string.",
        long: `Children must be React nodes: string, number, bigint, element, array/iterable of nodes, null/undefined/boolean (rendered as nothing).
A Date or a plain object is neither, so React throws during render.
Fix by formatting (toLocaleDateString, Intl.DateTimeFormat) and by rendering specific fields (user.name).
Promises are only valid via use()/Server Components in React 19, not as raw children in client components.
Strong answer lists the valid node types and formats dates deterministically to avoid SSR mismatches.`,
        fix: `function Profile({ user }) {
  return <p>Joined: {user.createdAt.toLocaleDateString()} — {user.name}</p>;
}`,
        exercises: [
          {
            task: "Predict which of these children throw an error.",
            description: "Checks valid React node types. Show the list and ask which lines fail at render.",
            code: `<div>{["a", "b"]}</div>
<div>{0}</div>
<div>{false}</div>
<div>{{ a: 1 }}</div>`,
            answer: "Only the object { a: 1 } throws. Arrays of strings render concatenated, 0 renders \"0\", and false renders nothing. A common wrong answer is that arrays also throw; a strong answer knows arrays are valid if every item is a valid node.",
          },
          {
            task: "Fix the component so it renders the list of tag names.",
            description: "Checks rendering arrays of objects. Present the error message and ask for the fix.",
            code: "<ul>{tags}</ul> // tags = [{ id: 1, name: \"react\" }]",
            answer: "tags is an array of objects, which are not valid children. Map to elements with keys. Weak answers use JSON.stringify; a strong answer renders semantic elements with stable keys.",
            solution: "<ul>{tags.map(t => <li key={t.id}>{t.name}</li>)}</ul>",
          },
        ],
      },
    ],
    middle: [
      {
        q: "What renders when count is 0? Fix it.",
        code: "{count && <Badge count={count} />}",
        short: "It renders the literal \"0\", because 0 is falsy but React renders numbers. Use count > 0 && ... or a ternary.",
        long: `&& returns the left operand when it is falsy, so the expression evaluates to 0.
React skips false, null, undefined and true, but renders numbers and strings — so "0" appears in the UI.
In React Native this can even crash ("Text strings must be rendered within a <Text>").
Fix by producing a boolean: count > 0 && ..., Boolean(count) && ..., or a ternary returning null.
Same trap with array.length && <List />.
Strong answer explains which values React renders and proposes a lint rule (e.g. react/jsx-no-leaked-render).`,
        fix: "{count > 0 ? <Badge count={count} /> : null}",
        exercises: [
          {
            task: "Predict what renders for items = [] and fix it.",
            description: "Checks the falsy-number rendering trap with arrays. Ask for the rendered output first, then the fix.",
            code: `function List({ items }) {
  return <div>{items.length && <ul>{items.map(i => <li key={i}>{i}</li>)}</ul>}</div>;
}`,
            answer: "It renders \"0\" inside the div because items.length is 0 (a number). Compare explicitly so the condition is a boolean. Many answer \"nothing renders\" because they assume all falsy values are skipped. A strong answer also mentions the react/jsx-no-leaked-render lint rule and that the same bug crashes React Native.",
            solution: `function List({ items }) {
  return <div>{items.length > 0 && <ul>{items.map(i => <li key={i}>{i}</li>)}</ul>}</div>;
}`,
          },
          {
            task: "Rewrite the nested ternary operators as simple, readable conditional rendering.",
            description: "Checks readability of conditional rendering. Ask the candidate to refactor and justify the chosen style.",
            code: "return status === \"loading\" ? <Spinner /> : status === \"error\" ? <Error /> : data.length ? <Table rows={data} /> : <Empty />;",
            answer: "Use early returns (or a lookup object) so each branch is explicit and easy to extend. Nested ternaries are correct but hard to review and extend. A strong answer handles the edge states (loading, error, empty) first and may suggest a status union type so impossible combinations cannot occur.",
            solution: `if (status === "loading") return <Spinner />;
if (status === "error") return <Error />;
if (data.length === 0) return <Empty />;
return <Table rows={data} />;`,
          },
        ],
      },
      {
        q: "What is the difference between a component, an element, and an instance? Elements are immutable. What does that mean?",
        short: "A component is a function (or class) that returns elements; an element is a plain immutable object describing what to render; instances (fibers) are React's internal per-position records holding state and effects.",
        long: `<Button /> creates an element { type: Button, props, key } — calling the component is React's job, not yours.
Elements are cheap, immutable snapshots; to update UI you create new elements on the next render.
React keeps a fiber per rendered position that holds hooks state; that is why state is tied to position and type.
Calling a component directly (Button()) bypasses React: hooks attach to the caller and keys/identity are lost.
Strong answer connects this to why components must be pure and why you never call them as functions.`,
        exercises: [
          {
            task: "Predict what happens when a component is called as a function.",
            description: "Checks elements vs direct calls. Show the code and ask what breaks when `show` toggles.",
            code: `function Parent({ show }) {
  return <div>{show && Counter()}</div>;
}`,
            answer: "Counter's useState is attached to Parent's hooks list, so toggling show changes the hook count and React throws \"Rendered fewer hooks than expected\". Using <Counter /> creates an element with its own fiber. A strong answer explains hook order belongs to the calling component.",
            solution: `function Parent({ show }) {
  return <div>{show && <Counter />}</div>;
}`,
          },
          {
            task: "Build a Layout component. It should get elements as props, like slots, not components.",
            description: "Checks passing elements as data. Ask for an API like <Layout sidebar={...} content={...} />.",
            answer: "Elements are just values, so they can be passed as props and placed anywhere. This avoids prop drilling and lets the parent control what renders. Weak answers pass component types and props separately.",
            solution: `function Layout({ sidebar, content }) {
  return <div className="grid"><aside>{sidebar}</aside><main>{content}</main></div>;
}
<Layout sidebar={<Nav />} content={<Feed user={user} />} />`,
          },
        ],
      },
    ],
    senior: [
      {
        q: "Why does Input lose focus on every keystroke?",
        code: `function Form() {
  const [v, setV] = useState('');
  const Input = () => <input value={v} onChange={e => setV(e.target.value)} />;
  return <Input />;
}`,
        short: "Input is a new component type on every render, so React unmounts the old one and mounts a new <input>, losing focus and state. Define components at module level.",
        long: `Reconciliation compares element types by reference. A function created inside render is a different reference each time.
Different type at the same position => React tears down the subtree (DOM node, state, effects) and builds a new one.
Symptoms: lost focus, reset local state, effects re-running, poor performance.
Fix: hoist the component to module scope and pass data via props, or just inline the JSX.
If you need configuration, use props or a factory called once (useMemo/module level), not per-render definitions.
Strong answer connects this to the type-based diff and mentions the same issue with HOCs applied inside render.`,
        fix: `function Input({ value, onChange }) {
  return <input value={value} onChange={e => onChange(e.target.value)} />;
}
function Form() {
  const [v, setV] = useState('');
  return <Input value={v} onChange={setV} />;
}`,
        exercises: [
          {
            task: "Toggle the highlighted prop. Does the counter state stay? Explain why.",
            description: "Checks type-based reconciliation and state preservation by position. Ask whether Counter keeps its count when the prop flips, and why.",
            code: `function App({ highlighted }) {
  return highlighted
    ? <div className="hl"><Counter /></div>
    : <section><Counter /></section>;
}`,
            answer: "State is lost: the parent element type changes (div vs section), so React unmounts the whole subtree. Keep the same wrapper type and toggle only the className to preserve Counter. A common wrong answer is \"yes, Counter is the same component\". Strong candidates explain that React compares the tree top-down by type at each position, so a parent type change discards everything below it.",
            solution: `function App({ highlighted }) {
  return <div className={highlighted ? "hl" : undefined}><Counter /></div>;
}`,
          },
          {
            task: "Fix the bug. The higher-order component resets the inner component's state on every parent render.",
            description: "Checks understanding of component identity with HOCs. Present the symptom (editor loses its text) and ask for the root cause.",
            code: `function Page({ data }) {
  const Logged = withLogging(Editor);
  return <Logged data={data} />;
}`,
            answer: "withLogging returns a new component type on each render, causing remounts. Apply the HOC once at module scope (or memoize it if it truly depends on config). Weak answers suggest useMemo on data or React.memo, which does not help. A strong answer ties it to the new type reference per render and mentions the same issue with components defined inside render.",
            solution: `const LoggedEditor = withLogging(Editor);
function Page({ data }) {
  return <LoggedEditor data={data} />;
}`,
          },
        ],
      },
      {
        q: "Why must components be pure? How does StrictMode help you find components that are not pure?",
        short: "React may render a component multiple times, out of order or discard results (concurrent rendering, StrictMode, Compiler memoization), so render must not mutate external values or cause side effects. StrictMode double-invokes render and effects in development to surface impurity.",
        long: `Purity: same props/state/context => same JSX, and no mutation of pre-existing objects during render.
Concurrent features can start a render, pause it and throw it away; side effects in render would leak.
StrictMode (dev only) calls component bodies, initializers and updaters twice, and mounts/unmounts/remounts effects once.
React Compiler relies on purity to safely memoize; impure code gives stale UI.
Side effects belong in event handlers or effects; local mutation of objects created during this render is fine.
Strong answer can spot hidden impurity (mutating props, module-level counters, Date.now in render).`,
        exercises: [
          {
            task: "Predict the output in development with StrictMode.",
            description: "Checks double render in StrictMode. Ask what the guest numbers are and why.",
            code: `let guest = 0;
function Cup() {
  guest = guest + 1;
  return <h2>Guest #{guest}</h2>;
}
<><Cup /><Cup /><Cup /></>`,
            answer: "In development you may see Guest #2, #4, #6 because each render runs twice and mutates the module variable. Production would show 1, 2, 3, hiding the bug. A strong answer fixes it by passing the number as a prop.",
            solution: `function Cup({ guest }) { return <h2>Guest #{guest}</h2>; }
<><Cup guest={1} /><Cup guest={2} /><Cup guest={3} /></>`,
          },
          {
            task: "Fix the render. It is not pure because it changes an array from props.",
            description: "Checks render purity with arrays. Present the bug (parent's list order changes unexpectedly).",
            code: `function Recent({ items }) {
  return items.reverse().map(i => <p key={i.id}>{i.text}</p>);
}`,
            answer: "reverse() mutates the parent's array in place during render. Use toReversed() or copy first. Weak answers move it into useEffect; a strong answer keeps it derived and non-mutating.",
            solution: `function Recent({ items }) {
  return items.toReversed().map(i => <p key={i.id}>{i.text}</p>);
}`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: "Ten teams work on one React app. How do you split it into components and folders?",
        ai: true,
        short: "Feature-based structure with a shared UI kit, explicit public APIs per feature, enforced import boundaries, and clear ownership (CODEOWNERS).",
        long: `Organize by domain/feature (features/billing, features/users), not by technical type (components/, hooks/) at the top level.
Each feature exposes a public index; deep imports across features are blocked with ESLint (import/no-restricted-paths, boundaries plugin) or Nx module boundaries.
A shared design system package holds presentational primitives; features compose them.
Ownership via CODEOWNERS and per-feature test suites lets teams ship independently.
Pitfalls: a "shared" or "utils" dumping ground, circular dependencies, premature monorepo splitting.
Weak answer: a folder tree only. Strong answer: talks about enforcement, ownership, change frequency, and how the structure evolved in a real project.`,
        exercises: [
          {
            task: "Write an ESLint rule config. It should stop one feature from importing the inner files of another feature.",
            description: "Checks ability to enforce architecture with tooling rather than conventions. Ask the candidate to sketch the config and explain how it is rolled out.",
            answer: "Use no-restricted-imports, import/no-restricted-paths or eslint-plugin-boundaries so features may only import from another feature's public index; CI fails on violations. Documentation-only rules erode quickly in a multi-team repo. A strong answer covers incremental rollout (warn then error), exceptions via the public API and alternatives like Nx module boundaries or eslint-plugin-boundaries.",
            solution: `// .eslintrc
rules: {
  "no-restricted-imports": ["error", {
    patterns: [{ group: ["@/features/*/*"], message: "Import from the feature's public index only." }]
  }]
}`,
          },
          {
            task: "A shared components folder has 200 mixed components. Describe the steps to reorganize it into a structure that lasts.",
            description: "Checks refactoring strategy and ownership thinking. Present the folder as a real situation and ask for a step-by-step plan.",
            answer: "Classify by ownership: generic primitives go to the design-system package, domain components move into their owning feature, dead ones are deleted (usage analysis). Add CODEOWNERS and a lint rule so the dumping ground cannot regrow. Weak answers propose a big-bang move or a new folder tree only. A strong answer uses data (import graph, usage counts), migrates incrementally and adds guardrails so the problem does not return.",
          },
        ],
      },
      {
        q: "Ten teams use this shared Button API. Review it. What is wrong? How would you redesign it?",
        ai: true,
        code: "<Button primary small danger loading icon=\"save\" iconRight onClickAsync={save} />",
        short: "Boolean prop explosion allows invalid combinations and makes the API hard to evolve. Use variant/size enums, composition for icons, native button props passthrough, and a deprecation path for the old props.",
        long: `Booleans like primary + danger can conflict; enums (variant="primary" | "danger") make illegal states unrepresentable.
Icons via composition (startIcon/children) avoid iconRight-style flags.
Forward native props and ref (React 19 ref as prop) so teams do not need escape hatches.
Async handling belongs to the caller or a separate pattern; keep the primitive dumb.
Rollout: support old props with dev warnings, ship a codemod, track usage, remove in the next major.
Strong answer considers accessibility (aria-busy, disabled vs aria-disabled) and design-system governance.`,
        fix: `type ButtonProps = React.ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
  startIcon?: React.ReactNode;
};
export function Button({ variant = "secondary", size = "md", loading, startIcon, children, ...rest }: ButtonProps) {
  return (
    <button className={"btn btn--" + variant + " btn--" + size} aria-busy={loading || undefined} disabled={loading || rest.disabled} {...rest}>
      {startIcon}{children}
    </button>
  );
}`,
        exercises: [
          {
            task: "Write a codemod plan. It should replace the primary and danger boolean props with one variant prop.",
            description: "Checks large-scale API migration. Ask how to move 1,500 call sites safely.",
            answer: "Use jscodeshift to rewrite JSX attributes, keep a runtime dev warning for leftovers, and run it per package with tests and visual regression. Weak answers rely on manual edits; a strong answer measures remaining usage and sets a removal date.",
          },
          {
            task: "Change this compound component API so teams cannot use it the wrong way.",
            description: "Checks composition patterns for design systems. Present the prop-heavy Card and ask for a composable alternative.",
            code: "<Card title=\"X\" subtitle=\"Y\" showFooter footerText=\"Z\" headerAction={<Btn />} />",
            answer: "A compound component (Card.Header, Card.Body) lets consumers compose freely without new props per need. Weak answers add more props; a strong answer explains how composition reduces API surface and versioning churn.",
            solution: `<Card>
  <Card.Header title="X" subtitle="Y" action={<Btn />} />
  <Card.Body>…</Card.Body>
  <Card.Footer>Z</Card.Footer>
</Card>`,
          },
        ],
      },
    ],
  },
  "Lists, Keys, and Fragments": {
    junior: [
      {
        q: "Why do lists need keys? What is a Fragment?",
        short: "Keys give each list item a stable identity so React can match items between renders. A Fragment groups children without adding an extra DOM node.",
        long: `Without keys React matches children by position, which breaks when items are inserted, removed or reordered.
Keys must be unique among siblings and stable across renders — ideally an id from the data.
Keys are not passed as props; the child cannot read props.key.
Fragments: <>...</> or <Fragment key={...}> when you need a key (e.g. returning dt/dd pairs from map).
Pitfalls: Math.random() keys (remount every render), index keys on dynamic lists.
Strong answer explains identity and state preservation, not just "to remove the warning".`,
        exercises: [
          {
            task: "Fix the warning: \"Each child in a list should have a unique key\".",
            description: "Checks the basic key requirement. Show the warning and ask for the fix plus where the key must go.",
            code: `function Tags({ tags }) {
  return <ul>{tags.map(t => <li>{t.label}</li>)}</ul>;
}`,
            answer: "Give each item a stable, unique key from the data on the outermost element returned from map. Common mistakes are putting the key on an inner element or using the index. A strong answer explains keys give identity among siblings and must come from stable data.",
            solution: `function Tags({ tags }) {
  return <ul>{tags.map(t => <li key={t.id}>{t.label}</li>)}</ul>;
}`,
          },
          {
            task: "How many DOM nodes does the Columns component add inside the table row tag?",
            description: "Checks what Fragments do in the DOM. Ask how many elements appear and why a div wrapper would be a problem.",
            code: `function Columns() {
  return (
    <>
      <td>A</td>
      <td>B</td>
    </>
  );
}
<table><tbody><tr><Columns /></tr></tbody></table>`,
            answer: "Exactly two <td> nodes; the Fragment adds no DOM element, which keeps the table markup valid (a wrapping <div> would be invalid HTML). Weak answers think Fragment renders a wrapper element. A strong answer mentions valid HTML structure (tables, lists, flex/grid layouts) as the main motivation.",
          },
        ],
      },
      {
        q: "Fix the list so each row renders correctly and there is no key warning.",
        code: `function Users({ users }) {
  return (
    <ul>
      {users.map(u => {
        <UserRow user={u} />;
      })}
    </ul>
  );
}`,
        short: "The arrow function uses a block body without return, so map produces undefined and nothing renders. Return the element (or use a concise body) and add a key.",
        long: `With braces the arrow needs an explicit return; otherwise each item is undefined, which React renders as nothing.
The key belongs on the element returned from map, ideally from data (u.id).
Concise body: users.map(u => <UserRow key={u.id} user={u} />).
Strong answer spots both bugs and explains why the key goes on UserRow, not inside it.`,
        fix: "{users.map(u => <UserRow key={u.id} user={u} />)}",
        exercises: [
          {
            task: "Predict what renders.",
            description: "Checks map return values and keys. Ask how many <li> appear.",
            code: "<ul>{[\"a\", \"b\", \"c\"].map(x => <li>{x}</li>)}</ul>",
            answer: "Three <li> elements render; the missing key causes a console warning but not a crash. A common wrong answer is that missing keys prevent rendering. A strong answer explains React falls back to index matching.",
          },
          {
            task: "Render grouped data: categories, each with a list of items inside.",
            description: "Checks nested lists and key scope. Provide data shape and ask for markup.",
            code: "const data = [{ id: \"fruit\", items: [{ id: 1, name: \"Apple\" }] }];",
            answer: "Keys must be unique only among siblings, so items in different categories may reuse ids. Weak answers concatenate indexes; a strong answer uses stable ids at each level.",
            solution: `{data.map(c => (
  <section key={c.id}>
    <h3>{c.id}</h3>
    <ul>{c.items.map(i => <li key={i.id}>{i.name}</li>)}</ul>
  </section>
))}`,
          },
        ],
      },
    ],
    middle: [
      {
        q: "What is wrong here? What bug will users see?",
        code: `{todos.map((todo, i) => <TodoItem key={i} todo={todo} />)}
// TodoItem has an uncontrolled <input> inside`,
        short: "Index keys tie state to position, so after deleting or reordering, inputs keep the text of the wrong row. Use a stable id like todo.id.",
        long: `When the first item is removed, item 2 now has key 0, so React reuses the component instance (and DOM input) that belonged to item 1.
Props update, but internal state and uncontrolled DOM values stay — the user sees mismatched text, checkboxes or focus.
Index keys are acceptable only for static lists that never reorder or filter and have no state.
If data has no id, generate one when the item is created (crypto.randomUUID()), never during render.
Strong answer can reproduce the bug mentally step by step.`,
        fix: "{todos.map(todo => <TodoItem key={todo.id} todo={todo} />)}",
        exercises: [
          {
            task: "Each row has an uncontrolled input with text the user typed. The user clicks \"Add to top\" once. What does the user see?",
            description: "Checks index-key bugs with prepended items. Walk through the click and ask what each row's input shows.",
            code: `const [items, setItems] = useState([{ id: 1, name: "A" }]);
// rows: items.map((it, i) => <Row key={i} item={it} />)
setItems(prev => [{ id: 2, name: "B" }, ...prev]);`,
            answer: "The typed text stays in the first row (now labeled B), and the new second row (A) has an empty input, because index keys reuse instances by position. Using key={it.id} keeps text with its item. Many say \"React updates everything correctly\" since props change. A strong answer traces that instances are matched by key, so DOM state follows position, not data.",
          },
          {
            task: "Fix how keys are created, so rows do not remount on every render.",
            description: "Checks unstable keys. Ask what happens on each render and how to repair the data.",
            code: "{rows.map(r => <Row key={Math.random()} row={r} />)}",
            answer: "Random keys change every render, so React remounts all rows (losing state and focus). Use a stable id; if data lacks one, assign ids once when the data is loaded. Some think random keys are \"unique, so fine\". A strong answer explains remounts destroy state, focus and performance, and that ids should be assigned once at ingestion, not during render.",
            solution: `// when data arrives (not during render)
const withIds = data.map(r => ({ ...r, _id: r.id ?? crypto.randomUUID() }));
setRows(withIds);
// render
{rows.map(r => <Row key={r._id} row={r} />)}`,
          },
        ],
      },
      {
        q: "When is it OK to use the array index as a key? What can you use if the data has no id?",
        short: "Index keys are fine for static lists that never reorder, filter or insert, and whose items hold no state. Otherwise generate ids at creation time, or derive a stable key from unique content.",
        long: `Index keys bind identity to position; any reordering moves state and DOM to the wrong item.
Acceptable: rendering a fixed list of labels, breadcrumbs, or read-only text that never changes order.
Alternatives: server ids, crypto.randomUUID() assigned when items are created or loaded, or a unique natural key (email, slug).
Never generate keys during render (random or Date.now), and avoid composite keys that can collide.
Strong answer also mentions performance: correct keys let React move DOM nodes instead of re-creating them.`,
        exercises: [
          {
            task: "For each case, are index keys safe? Explain why.",
            description: "Checks judgment on index keys. Give three scenarios: static footer links, sortable table, chat log that only appends.",
            answer: "Footer links: safe. Sortable table: unsafe (rows move). Append-only chat: technically safe for appends at the end, but unsafe once deletion or prepend (load older) is added. A strong answer reasons about future operations, not just current ones.",
          },
          {
            task: "Fix the key collision bug.",
            description: "Checks uniqueness of derived keys. Present the duplicate-key warning.",
            code: "{people.map(p => <Person key={p.firstName} person={p} />)}",
            answer: "Names are not unique, so two rows share a key and React may drop or mix them. Use a real id, or combine fields that are guaranteed unique. Weak answers append the index, which reintroduces positional bugs.",
            solution: "{people.map(p => <Person key={p.id} person={p} />)}",
          },
        ],
      },
    ],
    senior: [
      {
        q: "How can you use the key prop on purpose to reset component state? When is this better than useEffect?",
        short: "Changing a component's key forces a remount with fresh state, which is simpler and bug-free compared to resetting state in an effect when an identity prop changes.",
        long: `A key change tells React this is a different component instance: old state and effects are discarded, new ones initialized.
Effect-based reset (useEffect(() => setX(init), [userId])) renders once with stale state, then again — causing flashes and extra renders.
Use key when the whole subtree's state belongs to an identity (user, document, wizard run).
For partially resetting state, adjust state during render with a "prevProp" comparison or lift state up.
Cost: remount discards DOM and child state, so don't use it on huge trees that change often.
Strong answer cites the React docs pattern "Resetting all state when a prop changes".`,
        fix: "<ProfileForm key={userId} userId={userId} />",
        exercises: [
          {
            task: "This code resets state in an effect. Change it so the first render does not show old data.",
            description: "Checks the key-reset pattern versus effects. Ask the candidate to remove the effect and explain what changes for the user.",
            code: `function EditPost({ post }) {
  const [title, setTitle] = useState(post.title);
  useEffect(() => { setTitle(post.title); }, [post.id]);
  return <input value={title} onChange={e => setTitle(e.target.value)} />;
}`,
            answer: "Have the parent render <EditPost key={post.id} post={post} /> and delete the effect; a new key remounts with fresh state in a single render. Weak answers keep the effect and add more deps. A strong answer notes the effect version renders once with the old title (flash) and that key resets all child state too.",
            solution: `function EditPost({ post }) {
  const [title, setTitle] = useState(post.title);
  return <input value={title} onChange={e => setTitle(e.target.value)} />;
}
// parent
<EditPost key={post.id} post={post} />`,
          },
          {
            task: "When filter changes, reset only the page state, not the whole component. Do it without an effect.",
            description: "Checks partial state reset during render. Ask for an implementation without useEffect or key.",
            answer: "Store the previous prop in state and adjust during render; React re-renders immediately before committing, so there is no flash. Candidates often reach for useEffect, causing an extra render with a stale page. A strong answer knows React allows setState during render for the same component and that it should be guarded by a comparison to avoid loops.",
            solution: `function Results({ filter }) {
  const [page, setPage] = useState(1);
  const [prevFilter, setPrevFilter] = useState(filter);
  if (filter !== prevFilter) {
    setPrevFilter(filter);
    setPage(1);
  }
  // ...
}`,
          },
        ],
      },
      {
        q: "Why does the form in the selected tab keep the last user's input? Fix it.",
        code: `function UserTabs({ users }) {
  const [activeId, setActiveId] = useState(users[0].id);
  const active = users.find(u => u.id === activeId);
  return (
    <>
      {users.map(u => <button key={u.id} onClick={() => setActiveId(u.id)}>{u.name}</button>)}
      <UserForm user={active} />
    </>
  );
}`,
        short: "UserForm is rendered at the same position with the same type, so React preserves its state across users. Add key={active.id} to remount it per user.",
        long: `React preserves state when the same component type renders at the same position, regardless of props.
If UserForm initializes state from props (useState(user.name)), switching users does not reset it.
key={active.id} gives each user a separate instance with fresh state.
Alternative: make UserForm fully controlled by the parent, or store drafts per user id in a map if drafts must survive switching.
Strong answer weighs remount (simple, loses drafts) vs per-id state (keeps drafts).`,
        fix: "<UserForm key={active.id} user={active} />",
        exercises: [
          {
            task: "Keep a separate unsaved draft for each user when switching tabs.",
            description: "Checks state modeling beyond key resets. Ask for drafts that survive switching.",
            answer: "Store drafts in a parent map keyed by user id and pass value/onChange down. Key-based reset would discard drafts. A strong answer also discusses clearing drafts after save.",
            solution: `const [drafts, setDrafts] = useState({});
<UserForm
  value={drafts[active.id] ?? active.name}
  onChange={v => setDrafts(d => ({ ...d, [active.id]: v }))}
/>`,
          },
          {
            task: "Predict whether state is preserved in this conditional render.",
            description: "Checks position-based identity. Ask whether Counter keeps its count when isPlayerA toggles.",
            code: "{isPlayerA ? <Counter person=\"A\" /> : <Counter person=\"B\" />}",
            answer: "State is preserved: both branches render Counter at the same position, so React reuses it even with a different person prop. Adding key={person} or rendering them in different positions resets it. A common wrong answer is that different props create different instances.",
          },
        ],
      },
    ],
    techlead: [
      {
        q: "A list with ten thousand rows is slow. Should you virtualize, paginate, or filter on the server? How do you decide with the product team?",
        ai: true,
        short: "Decide from the user's task (scanning vs searching), data size, API cost and accessibility, involving UX and measuring before choosing.",
        long: `First profile: is the cost render, DOM size, data fetch or JS processing?
Searching tasks favor server-side filtering/search; scanning tasks may favor virtualization; audit/export tasks favor pagination.
Virtualization (TanStack Virtual, react-window) breaks Ctrl+F, print and some screen reader flows — discuss with UX/a11y.
Pagination is simple and shareable via URL but adds clicks.
Consider API cost: sending 10k rows to the client can be the real problem.
Strong answer describes a real trade-off negotiated with product, with metrics before/after.`,
        exercises: [
          {
            task: "A table has ten thousand rows. Before you choose virtualization or pagination, what measurement plan do you show the product team?",
            description: "Checks data-driven decision making with product. Ask how they would prove which option is right before building.",
            answer: "Capture baseline INP/long tasks while scrolling and filtering, payload size and API latency, plus usage analytics (search vs scroll, Ctrl+F, export). Agree on target thresholds and a11y requirements, then prototype the cheapest option and compare against them. Weak answers jump to a library choice. A strong answer defines user tasks, baselines and thresholds, and includes accessibility and API cost in the decision.",
          },
          {
            task: "Fix the accessibility problem in this virtualized list.",
            description: "Checks accessibility of virtualization. Ask what a screen reader user experiences and how to fix it.",
            code: `<div ref={parentRef} style={{ height: 400, overflow: "auto" }}>
  {/* absolutely positioned rows only for visible items */}
</div>`,
            answer: "Screen readers do not know the total size or position. Use list (or grid) semantics with aria-setsize and aria-posinset per row, make the scroll container focusable with a label, and offer a non-virtualized search/export path. Many candidates never consider a11y in virtual lists. A strong answer mentions set size/position attributes, keyboard focus, and offering search or export as alternatives to scanning.",
            solution: `<div ref={parentRef} role="list" aria-label="Users" tabIndex={0} style={{ height: 400, overflow: "auto" }}>
  {items.map(it => (
    <div key={it.key} role="listitem" aria-setsize={rows.length} aria-posinset={it.index + 1}>…</div>
  ))}
</div>`,
          },
        ],
      },
      {
        q: "This infinite feed re-renders every row when one new page loads. Find the cause and fix it.",
        ai: true,
        code: `function Feed() {
  const { data } = useInfiniteQuery(/* ... */);
  const rows = data?.pages.flatMap(p => p.items).map(i => ({ ...i, label: format(i) })) ?? [];
  return rows.map(r => <Row key={r.id} row={r} onSelect={() => select(r.id)} />);
}`,
        short: "Each render creates new row objects and new onSelect closures, so even a memoized Row re-renders. Keep item references stable (use select/structural sharing), pass ids with a stable callback, memoize Row, and virtualize long feeds.",
        long: `TanStack Query keeps structural sharing for data, but mapping into new objects discards it.
Derive labels inside Row or memoize the derived array; better, use the query's select option.
Pass onSelect={select} plus id instead of a new closure per row, and wrap Row in memo (or rely on React Compiler).
For thousands of rows, virtualize so only visible rows mount.
Measure with Profiler "why did this render" before and after; agree with product on page size and prefetching.
Strong answer balances code-level fixes with UX decisions like windowing and page size.`,
        fix: `const Row = memo(function Row({ item, onSelect }) {
  return <div onClick={() => onSelect(item.id)}>{format(item)}</div>;
});
function Feed() {
  const { data } = useInfiniteQuery({ /* ... */, select: d => d.pages.flatMap(p => p.items) });
  const onSelect = useCallback(id => select(id), []);
  return (data ?? []).map(i => <Row key={i.id} item={i} onSelect={onSelect} />);
}`,
        exercises: [
          {
            task: "What rules would you add to the team checklist for rendering lists?",
            description: "Checks turning a fix into team practice. Ask for 4–5 concrete review items.",
            answer: "Stable keys from data, no derived objects per render for memoized rows, stable callbacks or id-based handlers, virtualization threshold (e.g. >200 rows), and Profiler evidence for perf claims. A strong answer adds lint rules and React Compiler adoption to reduce manual memo.",
          },
          {
            task: "Each page has 20 rows. When page 2 loads, how many times does Row render? Answer for the original code and for the fix.",
            description: "Checks reasoning about memoization. Ask for numbers and why.",
            answer: "Original: 40 renders (all rows, because props are new). Fixed: about 20 (only new rows), since existing items keep references and onSelect is stable. A strong answer verifies with the Profiler rather than guessing.",
          },
        ],
      },
    ],
  },
  "Events and Error Handling": {
    junior: [
      {
        q: "How do you handle a click and prevent form submit in React?",
        short: "Pass a function to onClick, and call e.preventDefault() in the form's onSubmit handler.",
        long: `React uses camelCase event props (onClick, onSubmit) and passes a SyntheticEvent that wraps the native event.
Since React 17 handlers are attached to the root container, not document.
Pass a function reference, not a call: onClick={save}, not onClick={save()}.
Handle submit on the <form> (onSubmit) rather than the button click, so Enter key works too.
Returning false does not prevent default in React — call e.preventDefault().
Strong answer mentions e.stopPropagation, accessibility (button vs div) and React 19 form actions as an alternative.`,
        exercises: [
          {
            task: "Fix the bug: the alert fires on page load instead of on click.",
            description: "Checks passing handlers vs calling them. Ask why it fires on load and to fix it.",
            code: "<button onClick={alert(\"Saved\")}>Save</button>",
            answer: "alert(...) is executed during render; pass a function instead. Weak answers blame React re-rendering. A strong answer explains JSX attribute expressions are evaluated during render, so the call runs immediately.",
            solution: "<button onClick={() => alert(\"Saved\")}>Save</button>",
          },
          {
            task: "Build an input. It calls onRun with the value only when the user presses Enter.",
            description: "Checks keyboard events and the SyntheticEvent API. Ask for a small implementation.",
            answer: "Use onKeyDown and check e.key; read the value from e.currentTarget. Mistakes include using deprecated keyCode or onKeyPress. A strong answer uses e.key, currentTarget vs target, and considers wrapping in a form for native Enter submit.",
            solution: `function Command({ onRun }) {
  return <input onKeyDown={e => { if (e.key === "Enter") onRun(e.currentTarget.value); }} />;
}`,
          },
        ],
      },
      {
        q: "Why does this checkbox toggle twice on one click? How do you fix it?",
        code: `<label onClick={() => setChecked(c => !c)}>
  <input type="checkbox" checked={checked} readOnly /> Subscribe
</label>`,
        short: "Clicking a label dispatches a second synthetic click on its input, which bubbles back to the label, so the handler runs twice and cancels out. Handle onChange on the input instead.",
        long: `Browsers forward label clicks to the associated control; that click bubbles to the label again.
The handler runs twice and the state flips back.
Correct pattern: controlled input with checked + onChange; the label just provides the accessible name.
Strong answer knows the native label behavior and prefers semantic controls over click handlers on wrappers.`,
        fix: `<label>
  <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} /> Subscribe
</label>`,
        exercises: [
          {
            task: "Predict what happens when the user presses Enter in the input.",
            description: "Checks implicit form submission. Ask whether onSubmit fires.",
            code: `<form onSubmit={handleSubmit}>
  <input name="q" />
</form>`,
            answer: "Yes, pressing Enter in a single text input submits the form, so onSubmit fires and the page reloads unless preventDefault is called. Weak answers think only button clicks submit. A strong answer mentions buttons default to type=\"submit\" inside forms.",
          },
          {
            task: "Fix the clickable div to be accessible.",
            description: "Checks semantic event targets. Present a div with onClick used as a button.",
            code: "<div className=\"close\" onClick={onClose}>×</div>",
            answer: "A div is not focusable and has no role, so keyboard and screen reader users cannot use it. Use a <button type=\"button\">. Weak answers add tabIndex only; a strong answer uses the native element.",
            solution: "<button type=\"button\" className=\"close\" aria-label=\"Close\" onClick={onClose}>×</button>",
          },
        ],
      },
    ],
    middle: [
      {
        q: "What is wrong here?",
        code: "<button onClick={handleDelete(id)}>Delete</button>",
        short: "handleDelete(id) is called during render and its return value is passed as the handler. Wrap it: onClick={() => handleDelete(id)}.",
        long: `JSX expressions are evaluated on every render, so the delete runs immediately for every row.
If handleDelete sets state, this can cause an infinite render loop ("Too many re-renders").
Fix with an arrow function, or a curried handler that returns a function, or data attributes.
Arrow functions per item are fine in most cases; optimize only if a memoized child needs a stable reference.
Strong answer explains why it loops and when stable callbacks matter.`,
        fix: "<button onClick={() => handleDelete(id)}>Delete</button>",
        exercises: [
          {
            task: "Predict the console output when the button is clicked.",
            description: "Checks event propagation phases. Ask for the exact order of logs.",
            code: `<div onClick={() => console.log("div")} onClickCapture={() => console.log("div capture")}>
  <button onClick={() => console.log("button")}>Go</button>
</div>`,
            answer: "\"div capture\", \"button\", \"div\": capture handlers run top-down first, then bubble handlers bottom-up, mirroring the DOM. A common wrong answer is \"button, div, div capture\". A strong answer explains capture then bubble and that React mirrors native order since v17 root delegation.",
          },
          {
            task: "Fix the modal. Clicks inside the dialog must not close it. Clicks on the backdrop or the X button must still close it.",
            description: "Checks propagation in a modal pattern. Describe the bug (clicks inside the dialog close it) and ask for a fix.",
            code: `<div className="backdrop" onClick={onClose}>
  <div className="dialog">
    <button onClick={onClose}>X</button>
  </div>
</div>`,
            answer: "Clicks bubble from the dialog to the backdrop (and the X click calls onClose twice). Close from the backdrop only when the click target is the backdrop itself. Weak answers sprinkle stopPropagation everywhere, which breaks outer listeners like analytics. A strong answer uses target === currentTarget and mentions dialog semantics and focus management.",
            solution: `<div className="backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
  <div className="dialog" role="dialog" aria-modal="true">
    <button onClick={onClose}>X</button>
  </div>
</div>`,
          },
        ],
      },
      {
        q: "How are React events different from native DOM events? What changed in React 17?",
        short: "React attaches one listener per event type at the root container and dispatches SyntheticEvents through the component tree. Since React 17 the root is the container (not document), event pooling was removed, and onScroll no longer bubbles.",
        long: `SyntheticEvent normalizes browser differences and exposes nativeEvent.
Delegation at the root means stopPropagation in React stops React handlers, but native listeners on document may run before or after depending on attachment.
React 17: listeners on the root container (enables multiple React versions on a page), no pooling (you can read e.target asynchronously), onScroll does not bubble, onFocus/onBlur use focusin/focusout.
Events propagate through the React tree, so portals bubble to their React parent, not their DOM parent.
Strong answer mentions portals and mixing native listeners safely in effects.`,
        exercises: [
          {
            task: "You click inside a portal. Does the parent's onClick run?",
            description: "Checks portal event propagation. Show a modal rendered via createPortal into document.body.",
            code: `<div onClick={() => console.log("parent")}>
  {createPortal(<button>Inside</button>, document.body)}
</div>`,
            answer: "Yes: React events bubble along the React component tree, so the parent div's onClick runs even though the DOM node is elsewhere. Weak answers reason from the DOM tree. A strong answer uses stopPropagation or checks targets when that is undesired.",
          },
          {
            task: "Build a hook that detects clicks outside an element. Use native listeners.",
            description: "Checks mixing native events with React. Ask for useClickOutside(ref, onOutside).",
            answer: "Attach a pointerdown listener on document in an effect, check ref.current.contains(target), and clean up. A strong answer uses the latest-callback pattern and handles portals.",
            solution: `function useClickOutside(ref, onOutside) {
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onOutside(e); };
    document.addEventListener("pointerdown", h);
    return () => document.removeEventListener("pointerdown", h);
  }, [ref, onOutside]);
}`,
          },
        ],
      },
    ],
    senior: [
      {
        q: "Error Boundaries do not catch errors in async event handlers. Design one consistent way to handle them.",
        short: "Catch in handlers/mutations and show UI feedback (inline or toast), log centrally, and when the error should take over the UI, push it into a boundary via showBoundary or by rethrowing during render.",
        long: `Error boundaries only catch errors thrown during render, lifecycle methods and constructors of their subtree.
For handlers: try/catch, set error state, show inline message; for mutations use TanStack Query onError / mutation.error.
To escalate to a boundary: react-error-boundary's useErrorBoundary().showBoundary(err), or store the error in state and throw it during render.
React 19: errors thrown inside form actions / startTransition propagate to the nearest boundary.
Centralize logging (Sentry) with window.onerror/unhandledrejection and createRoot onUncaughtError/onCaughtError (React 19).
Strong answer distinguishes expected (validation, 4xx) from unexpected errors and has a taxonomy.`,
        exercises: [
          {
            task: "Fix the bug: the boundary never shows its fallback when the save fails.",
            description: "Checks error boundary limits with async handlers. Ask why the fallback never appears and how to surface the error.",
            code: `function Save() {
  return <button onClick={async () => { await api.save(); }}>Save</button>;
}
<ErrorBoundary fallback={<p>Failed</p>}><Save /></ErrorBoundary>`,
            answer: "Rejections in event handlers happen outside rendering, so boundaries never see them (it becomes an unhandled rejection). Catch and either show inline feedback or call showBoundary from react-error-boundary. Many think boundaries catch everything inside them. A strong answer separates expected errors (inline UI) from unexpected ones (escalate) and mentions unhandled rejection logging.",
            solution: `function Save() {
  const { showBoundary } = useErrorBoundary();
  return <button onClick={() => api.save().catch(showBoundary)}>Save</button>;
}`,
          },
          {
            task: "Build a React 19 form action. If it throws, the nearest error boundary should handle it. Explain why this works.",
            description: "Checks React 19 actions and transition error semantics. Ask the candidate to implement and explain the error path.",
            answer: "Actions run inside a transition; errors thrown from a transition are rethrown during render, so the nearest boundary catches them. Expected errors (validation) should still be returned as state via useActionState. Weak answers say boundaries never catch async errors, which is outdated for actions. A strong answer distinguishes thrown errors (boundary) from returned validation state (useActionState).",
            solution: `function Publish({ id }) {
  async function action() {
    await api.publish(id); // throws on 500 -> nearest ErrorBoundary
  }
  return <form action={action}><button>Publish</button></form>;
}`,
          },
        ],
      },
      {
        q: "This save handler can submit twice and has race conditions. Fix both problems.",
        code: `function SaveButton({ data }) {
  const [status, setStatus] = useState("idle");
  async function save() {
    setStatus("saving");
    await api.save(data);
    setStatus("saved");
  }
  return <button onClick={save}>{status === "saving" ? "Saving…" : "Save"}</button>;
}`,
        short: "Nothing blocks repeated clicks, errors leave the button stuck in \"saving\", and setting state after unmount or an older response finishing last can show wrong status. Disable while pending, handle errors, and guard stale completions (or use useMutation/useActionState).",
        long: `Double clicks start parallel saves; the button must be disabled while pending (and the backend should be idempotent).
A rejected promise skips setStatus("saved") and never resets — wrap in try/catch/finally.
If data changes and a newer save completes before an older one, the older result can overwrite status; track a request id or abort.
useMutation provides isPending, error and retry; React 19 actions give isPending automatically.
Strong answer mentions idempotency keys on the server.`,
        fix: `function SaveButton({ data }) {
  const mutation = useMutation({ mutationFn: api.save });
  return (
    <>
      <button disabled={mutation.isPending} onClick={() => mutation.mutate(data)}>
        {mutation.isPending ? "Saving…" : "Save"}
      </button>
      {mutation.isError && <p role="alert">Save failed. Try again.</p>}
    </>
  );
}`,
        exercises: [
          {
            task: "Make sure only the latest request result is used. Do it without a library.",
            description: "Checks race handling in handlers. Ask for a ref-based request id.",
            answer: "Increment a ref counter per request and ignore results whose id is not the latest. AbortController also cancels the network call. A strong answer explains why a boolean isMounted flag is not enough.",
            solution: `const reqId = useRef(0);
async function save() {
  const id = ++reqId.current;
  setStatus("saving");
  try {
    await api.save(data);
    if (id === reqId.current) setStatus("saved");
  } catch {
    if (id === reqId.current) setStatus("error");
  }
}`,
          },
          {
            task: "In the original code, api.save fails. What does the user see?",
            description: "Checks error paths. Ask for UI state and console output.",
            answer: "The button stays on \"Saving…\" forever and an unhandled promise rejection is logged. Weak answers expect React to reset state. A strong answer adds finally/catch and user feedback.",
          },
        ],
      },
    ],
    techlead: [
      {
        q: "Define one standard for showing errors: toast, inline, or full page. How do you get design and engineering to agree?",
        ai: true,
        short: "Create an error taxonomy mapped to UI patterns and components, with copy guidelines and logging rules, documented in the design system and enforced in review.",
        long: `Taxonomy: field validation -> inline; action failure -> toast or inline banner with retry; section failure -> widget boundary; fatal/route -> error page.
Build shared components (ErrorBanner, RouteErrorBoundary, toast service) so teams don't improvise.
Copy guidelines: what happened, what to do next, no stack traces; accessible (role="alert", focus management).
Define logging/alerting: what goes to Sentry, sampling, PII scrubbing.
Alignment: RFC with design, examples in Storybook, lint rules and PR checklist.
Strong answer includes a story of an inconsistency that caused real user confusion and how it was fixed.`,
        exercises: [
          {
            task: "Build one central helper. It turns API errors into UI error types. Every mutation in the app uses it.",
            description: "Checks consistency at scale through a central mechanism. Ask how they would make every team use the same error behavior.",
            answer: "One mapping function plus a global MutationCache onError keeps behavior consistent; teams opt out only via meta flags. Ad-hoc try/catch per component drifts quickly. A strong answer uses a global MutationCache/QueryCache handler with opt-out meta, typed error mapping, and tests for the mapping.",
            solution: `const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (err, _vars, _ctx, mutation) => {
      if (mutation.meta?.handlesErrors) return;
      const ui = toUserError(err);
      if (ui.kind === "toast") toast.error(ui.userMessage);
    },
  }),
});`,
          },
          {
            task: "A team shows the raw API error message in toasts. What would you ask them to change?",
            description: "Checks error UX standards and security. Present the code review scenario and ask what to require.",
            answer: "Raw messages leak internals and are not user-actionable or localized. Require mapped, localized copy with a next step, logging of the raw error with a correlation id to monitoring, and role=\"alert\"/focus handling for accessibility. Weak answers only say \"use nicer text\". A strong answer covers leakage of internals, localization, accessibility, and correlating user reports with logs.",
          },
        ],
      },
      {
        q: "Your analytics, error tracking, and feature flag SDKs all add global listeners and wrap handlers. Design how the whole app tracks events and side effects.",
        ai: true,
        short: "Centralize instrumentation in a thin, typed tracking layer with consistent event names, consent handling and sampling; keep SDKs behind adapters, avoid wrapping React handlers globally, and review event schemas like an API.",
        long: `Define a tracking plan (event names, properties, owners) versioned like an API contract.
Expose a single track() / useTrack() adapter; SDKs are swappable implementations loaded lazily after consent.
Instrument declaratively at boundaries (route changes, mutations via MutationCache, error boundaries) rather than sprinkling calls in every handler.
Protect performance: batch with sendBeacon, defer non-critical SDKs, measure their INP impact.
Privacy: PII scrubbing, consent gating, data retention.
Strong answer shows how bad instrumentation (duplicate events, broken funnels) was detected and governed.`,
        exercises: [
          {
            task: "Build a typed track function. It must follow the event schema.",
            description: "Checks API design for instrumentation. Ask for a TypeScript signature that rejects unknown events.",
            answer: "A mapped type from event name to payload makes wrong events compile errors. The adapter forwards to whichever SDK is loaded. Weak answers accept any string; a strong answer enforces schemas and handles consent.",
            solution: `type Events = { "checkout_started": { cartValue: number }; "search": { q: string } };
export function track<K extends keyof Events>(name: K, props: Events[K]) {
  if (!consent.analytics) return;
  sdk?.track(name, props);
}`,
          },
          {
            task: "Where should you send a save failed event, so you call it in as few places as possible?",
            description: "Checks central instrumentation points. Ask where in a TanStack Query app.",
            answer: "MutationCache onError sees every failed mutation, so emit once there using mutation meta for the feature name. Per-component tracking drifts and duplicates. A strong answer also ties it to the error taxonomy.",
          },
        ],
      },
    ],
  },
  "Common Hooks": {
    junior: [
      {
        q: "The user clicks once. What is count? Fix it.",
        code: `const [count, setCount] = useState(0);
const onClick = () => { setCount(count + 1); setCount(count + 1); setCount(count + 1); };`,
        short: "count becomes 1, because each call uses the same stale snapshot (0 + 1). Use the updater form setCount(c => c + 1).",
        long: `State is a snapshot per render; count is a constant 0 inside this handler's closure.
The three calls all enqueue "set to 1"; React batches them into one re-render.
The updater function receives the latest pending state, so three updaters give 3.
console.log(count) right after still prints 0 — setState doesn't mutate the variable.
Since React 18, batching also applies in timeouts, promises and native handlers.
Strong answer explains snapshots and batching, not just "setState is async".`,
        fix: `const onClick = () => {
  setCount(c => c + 1);
  setCount(c => c + 1);
  setCount(c => c + 1);
};`,
        follow: "What does console dot log of count print right after?",
        exercises: [
          {
            task: "After one click, what is logged? What does the next render show?",
            description: "Checks batching and mixing value and updater forms. Ask for the logged value and the next rendered value.",
            code: `const [n, setN] = useState(0);
function onClick() {
  setN(n + 5);
  setN(x => x + 1);
  console.log(n);
}`,
            answer: "It logs 0 (the snapshot), and the next render shows 6: the first update sets 5, then the updater adds 1 to the pending value. Common wrong answers are 6 for the log or 1 for the render. A strong answer explains the queue: replace with 5, then apply updater on the pending value.",
          },
          {
            task: "Fix the bug. Adding an item does not update the UI.",
            description: "Checks immutability with state. Describe that the list does not update and ask for the cause.",
            code: `const [items, setItems] = useState([]);
function add(item) {
  items.push(item);
  setItems(items);
}`,
            answer: "Mutating and passing the same array reference makes Object.is report no change, so React bails out. Create a new array. Weak answers suggest forceUpdate or a second setState. A strong answer explains Object.is bail-out and that mutation also breaks memoization and concurrent rendering.",
            solution: `function add(item) {
  setItems(prev => [...prev, item]);
}`,
          },
        ],
      },
      {
        q: "What are the Rules of Hooks and why do they exist?",
        short: "Call hooks only at the top level of function components or custom hooks, never in conditions, loops or nested functions. React identifies hook state by call order, so the order must be identical every render.",
        long: `Each component's hooks are stored in an ordered list on its fiber; the Nth hook call reads the Nth slot.
A conditional hook shifts the order and React reads the wrong state or throws.
Only call hooks from React functions (components, custom hooks) — not from regular utilities or class components.
eslint-plugin-react-hooks enforces this; React 19's use() is the exception that may be called conditionally.
Strong answer explains the linked-list model and how to restructure (move the condition inside the hook or split components).`,
        exercises: [
          {
            task: "Fix the hook that is called inside a condition.",
            description: "Checks Rules of Hooks. Present the code and the error \"Rendered more hooks than during the previous render\".",
            code: `function Profile({ user }) {
  if (!user) return null;
  const [tab, setTab] = useState("info");
  // ...
}`,
            answer: "The useEffect runs only when user exists, changing hook order between renders. Call the hook unconditionally and put the condition inside. A weak answer suppresses the lint rule.",
            solution: `function Profile({ user }) {
  const [tab, setTab] = useState("info");
  if (!user) return null;
  // ...
}`,
          },
          {
            task: "Predict whether this code is valid.",
            description: "Checks the use() exception. Ask whether conditional use(Context) is allowed.",
            code: `function Badge({ show }) {
  if (!show) return null;
  const theme = use(ThemeContext);
  return <span className={theme}>New</span>;
}`,
            answer: "Yes: use() can be called conditionally and in loops, unlike other hooks, because it does not store state in the hook list. It still must be called during render. A strong answer knows this React 19 nuance.",
          },
        ],
      },
    ],
    middle: [
      {
        q: "Find all the bugs.",
        code: `function User({ id }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetch('/api/users/' + id).then(r => r.json()).then(setUser);
  }, []);
  return <div>{user.name}</div>;
}`,
        short: "Missing id dependency, race condition with no abort/ignore, crash on user.name when user is null, and no loading/error/res.ok handling.",
        long: `[] deps: when id changes, the component keeps showing the old user (eslint react-hooks/exhaustive-deps catches this).
Race: fast id changes can resolve out of order and set the wrong user — use AbortController or an ignore flag in cleanup.
First render user is null -> TypeError; render a loading state or use optional chaining.
fetch doesn't reject on 4xx/5xx; check r.ok.
StrictMode double-invokes effects in dev, which surfaces missing cleanup.
Strong answer suggests TanStack Query / a framework loader instead of hand-rolled fetching.`,
        fix: `function User({ id }) {
  const [state, setState] = useState({ status: 'loading' });
  useEffect(() => {
    const ctrl = new AbortController();
    setState({ status: 'loading' });
    fetch('/api/users/' + id, { signal: ctrl.signal })
      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then(user => setState({ status: 'done', user }))
      .catch(err => { if (err.name !== 'AbortError') setState({ status: 'error', err }); });
    return () => ctrl.abort();
  }, [id]);
  if (state.status === 'loading') return <Spinner />;
  if (state.status === 'error') return <p>Failed</p>;
  return <div>{state.user.name}</div>;
}`,
        exercises: [
          {
            task: "Fix the stale closure. The interval should keep counting after 1.",
            description: "Checks stale closures in effects. Ask why the counter stops at 1.",
            code: `useEffect(() => {
  const id = setInterval(() => setCount(count + 1), 1000);
  return () => clearInterval(id);
}, []);`,
            answer: "The callback captured count = 0 forever, so it always sets 1. Use the updater form (keeping [] deps) so it reads the latest value. Adding count to deps works but recreates the interval every tick. A strong answer prefers the updater form and explains closures capture a render's snapshot.",
            solution: `useEffect(() => {
  const id = setInterval(() => setCount(c => c + 1), 1000);
  return () => clearInterval(id);
}, []);`,
          },
          {
            task: "In development with StrictMode, what does the console show on mount?",
            description: "Checks StrictMode development behavior. Ask for the exact log sequence and why it exists.",
            code: `useEffect(() => {
  console.log("subscribe");
  return () => console.log("unsubscribe");
}, []);`,
            answer: "\"subscribe\", \"unsubscribe\", \"subscribe\": StrictMode mounts, unmounts and remounts once in development to expose missing cleanup. Production logs only \"subscribe\". Many think it is a bug or that it happens in production. A strong answer says it stress-tests cleanup and that correct effects behave identically after remount.",
          },
        ],
      },
      {
        q: "When should you use useReducer instead of useState? Show an example where it stops bugs.",
        short: "Use useReducer when several state values change together, the next state depends on complex transitions, or you want testable, centralized update logic. It prevents impossible states and stale-closure bugs because dispatch is stable and the reducer always sees current state.",
        long: `Multiple useState calls updated together (loading, data, error) can drift into impossible combinations.
A reducer encodes allowed transitions in one pure function that is easy to unit test.
dispatch is stable, so it can be passed down or used in effects without dependencies.
Reducers must be pure: no fetches or mutations inside; StrictMode calls them twice in dev.
useState is still the default for simple independent values.
Strong answer models state as a discriminated union (status: "idle" | "loading" | "success" | "error").`,
        exercises: [
          {
            task: "Replace three useState calls with one reducer. Impossible states should not be possible.",
            description: "Checks state modeling. Present loading/data/error booleans and ask for a reducer.",
            code: `const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);
const [error, setError] = useState(null);`,
            answer: "A discriminated union ensures you cannot have data and error at the same time. Weak answers just move the same three fields into a reducer. A strong answer types the states and transitions.",
            solution: `function reducer(state, action) {
  switch (action.type) {
    case "start": return { status: "loading" };
    case "success": return { status: "success", data: action.data };
    case "error": return { status: "error", error: action.error };
    default: return state;
  }
}
const [state, dispatch] = useReducer(reducer, { status: "idle" });`,
          },
          {
            task: "Fix the reducer. It is not pure.",
            description: "Checks reducer purity. Ask what breaks in StrictMode.",
            code: `function reducer(state, action) {
  if (action.type === "add") { state.items.push(action.item); return state; }
  return state;
}`,
            answer: "The reducer mutates state and pushes twice in development because StrictMode double-invokes it. Return a new array instead. A strong answer explains React may call reducers more than once.",
            solution: `function reducer(state, action) {
  if (action.type === "add") return { ...state, items: [...state.items, action.item] };
  return state;
}`,
          },
        ],
      },
    ],
    senior: [
      {
        q: "Child is memoized but still re-renders. Why? When are useMemo and useCallback really worth it?",
        code: `const Child = React.memo(({ onClick, style }) => <button style={style} onClick={onClick}>Hi</button>);
function Parent() {
  const [n, setN] = useState(0);
  return <Child style={{ color: 'red' }} onClick={() => setN(n + 1)} />;
}`,
        short: "style and onClick are new references every render, so memo's shallow comparison fails. Hoist constants and use useCallback with a functional update; memoize only when it prevents real work.",
        long: `React.memo compares props with Object.is; inline objects and arrows are always new.
Fix: hoist the style constant, useCallback(() => setN(x => x + 1), []).
useMemo/useCallback are worth it when: passing to memoized children, using values as effect/hook dependencies, or caching genuinely expensive computations.
They have a cost (memory, comparisons, readability) — don't wrap everything.
Often better: move state down, or pass children as props so they aren't re-rendered.
React Compiler (stable in 2025) auto-memoizes and makes most manual memo unnecessary.
Strong answer profiles with React DevTools before optimizing.`,
        fix: `const redStyle = { color: 'red' };
function Parent() {
  const [n, setN] = useState(0);
  const handleClick = useCallback(() => setN(x => x + 1), []);
  return <Child style={redStyle} onClick={handleClick} />;
}`,
        exercises: [
          {
            task: "Fix the infinite effect loop.",
            description: "Checks referential dependencies. Ask why the network tab shows endless requests.",
            code: `function Search({ term }) {
  const options = { term, limit: 10 };
  const [res, setRes] = useState([]);
  useEffect(() => { api.search(options).then(setRes); }, [options]);
}`,
            answer: "options is a new object each render, so the effect re-runs after every setRes. Depend on primitives (or useMemo the object). Weak answers remove the dependency and silence the lint rule. A strong answer depends on primitives, adds race protection and suggests a data library.",
            solution: `useEffect(() => {
  let ignore = false;
  api.search({ term, limit: 10 }).then(r => { if (!ignore) setRes(r); });
  return () => { ignore = true; };
}, [term]);`,
          },
          {
            task: "Build a connection effect with useEffectEvent. It should use the latest theme in notifications. It must not reconnect when the theme changes.",
            description: "Checks useEffectEvent (React 19.2). Ask how to read the latest theme without reconnecting.",
            answer: "useEffectEvent (stable in React 19.2) creates a non-reactive function that always sees the latest props, so theme can stay out of the effect deps. Common wrong answers add theme to deps (reconnects) or disable the lint rule (stale theme). A strong answer explains effect events are non-reactive and must only be called from effects.",
            solution: `function Room({ roomId, theme }) {
  const onConnected = useEffectEvent(() => notify("Connected", theme));
  useEffect(() => {
    const c = connect(roomId);
    c.on("connected", onConnected);
    return () => c.disconnect();
  }, [roomId]);
}`,
          },
        ],
      },
      {
        q: "What is the difference between useEffect, useLayoutEffect, and useInsertionEffect? When does effect cleanup run?",
        short: "useEffect runs after paint (non-blocking), useLayoutEffect runs after DOM mutation but before paint (blocking, for measurement), useInsertionEffect runs before layout effects for CSS-in-JS style injection. Cleanups run before the next effect with changed deps and on unmount.",
        long: `Order on commit: DOM mutations → useInsertionEffect → refs attached → useLayoutEffect → browser paint → useEffect.
Effects triggered by a discrete user event (click) may flush synchronously before paint in React 18+.
Cleanup runs with the previous render's values before re-running the effect, and on unmount.
StrictMode runs setup → cleanup → setup once on mount in dev.
useLayoutEffect on the server does nothing (React 19 no longer warns), so measurement-driven UI should handle the first client render.
Strong answer explains why the cleanup sees old props (closure) and when blocking paint is justified.`,
        exercises: [
          {
            task: "The id changes from 1 to 2. In what order are the logs printed?",
            description: "Checks cleanup timing and closures. Ask for exact logs.",
            code: `useEffect(() => {
  console.log("effect", id);
  return () => console.log("cleanup", id);
}, [id]);`,
            answer: "\"cleanup 1\" then \"effect 2\": the cleanup from the previous render runs first and sees its own closure (id 1). Weak answers think cleanup sees the new id. A strong answer explains each render's effect has its own snapshot.",
          },
          {
            task: "Scroll a chat to the bottom on its own, with no visible jump.",
            description: "Checks choosing layout effects. Ask which hook and why.",
            answer: "Scrolling after paint shows a frame at the old position; useLayoutEffect adjusts before paint. A strong answer keeps the layout effect cheap and scoped to message changes.",
            solution: `useLayoutEffect(() => {
  const el = listRef.current;
  el.scrollTop = el.scrollHeight;
}, [messages.length]);`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: "Your code has 400 useEffect calls. Many of them only sync derived state. How do you reduce them across the team?",
        ai: true,
        short: "Adopt \"You might not need an effect\" guidelines: compute derived values in render, use a data library for fetching, enforce with lint and review, and adopt React Compiler.",
        long: `Categorize effects: data fetching, derived state, event-driven logic, external sync. Only external sync truly needs effects.
Derived state -> compute in render (useMemo if expensive). Event logic -> move into handlers. Fetching -> TanStack Query/loaders.
Resetting state -> key prop.
Enforce: eslint-plugin-react-hooks (incl. compiler rules), review checklist, examples in internal docs.
Measure progress (count of effects, bug rate) and refactor opportunistically, not big-bang.
Strong answer includes a real example of an effect-caused bug and how the team learned.`,
        exercises: [
          {
            task: "Change this chain of effects into derived values and event logic. Which rule would you teach the team?",
            description: "Checks 'you might not need an effect' at team level. Ask for a refactor plus the guideline they would teach.",
            code: `const [items, setItems] = useState([]);
const [count, setCount] = useState(0);
useEffect(() => { setCount(items.length); }, [items]);
useEffect(() => { if (count > 10) toast("Cart is large"); }, [count]);`,
            answer: "count is derived and the toast is a reaction to a user action, so neither needs an effect. Rule: effects are only for synchronizing with external systems. Weak answers keep effects but combine them. A strong answer explains effect chains cause extra renders and timing bugs, and moves logic to render or handlers.",
            solution: `const count = items.length;
function addItem(item) {
  const next = [...items, item];
  setItems(next);
  if (next.length > 10) toast("Cart is large");
}`,
          },
          {
            task: "Design a code review checklist item and a lint setup. They should stop new data fetching inside effects.",
            description: "Checks enforcement strategy. Ask how they would stop new effect-based fetching in a large codebase.",
            answer: "Enable eslint-plugin-react-hooks recommended (including React Compiler rules), add a no-restricted-syntax rule flagging fetch inside useEffect in feature code, and require TanStack Query/loaders per the ADR; track remaining effects as a metric. Guidelines alone are ignored under deadline pressure. A strong answer combines lint, review checklist, a paved-road alternative, and progress metrics.",
          },
        ],
      },
      {
        q: "Review this custom hook used by the whole team. What problems do you see? How would you set rules for shared hooks?",
        ai: true,
        code: `export function useData(url, opts) {
  const [data, setData] = useState();
  useEffect(() => {
    fetch(url, opts).then(r => r.json()).then(setData);
  }, [url, opts]);
  return data;
}`,
        short: "It re-fetches whenever callers pass inline opts, has no error/loading state, no abort or race protection, no caching, and duplicates what a data library does. Standards: wrap TanStack Query, define return shapes, tests and docs for shared hooks.",
        long: `Object deps cause refetch loops with inline options; there is no cancellation, so responses race.
Returning only data hides loading and error, pushing ad-hoc handling to every caller.
No dedup/cache means N components fire N requests.
Standard: shared data hooks are thin wrappers over useQuery with typed keys (query key factories), consistent { data, isPending, error } shape.
Process: hooks live in a reviewed package with tests (renderHook), docs and an owner; deprecate ad-hoc fetch hooks.
Strong answer pairs the code review with a migration and governance plan.`,
        fix: `export const userKeys = { detail: id => ["user", id] };
export function useUser(id) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: ({ signal }) => api.getUser(id, { signal }),
    enabled: id != null,
  });
}`,
        exercises: [
          {
            task: "Write a test for a shared hook using renderHook.",
            description: "Checks testing standards for hooks. Ask for a minimal test of useUser with a mocked API.",
            answer: "Wrap renderHook with a fresh QueryClientProvider per test and await the success state. Weak answers test implementation details. A strong answer disables retries in tests and mocks at the network layer (MSW).",
            solution: `const wrapper = ({ children }) => <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{children}</QueryClientProvider>;
const { result } = renderHook(() => useUser(1), { wrapper });
await waitFor(() => expect(result.current.data.name).toBe("Ada"));`,
          },
          {
            task: "What must be true before a hook can go into the shared hooks package?",
            description: "Checks governance. Ask for a checklist.",
            answer: "Clear single purpose, typed API and return shape, no hidden global side effects, tests and docs, at least two consumers, and an owner. A strong answer adds a deprecation policy and bundle-size awareness.",
          },
        ],
      },
    ],
  },
  "Work with Forms (controlled/not controlled components) and 3-rd party libs (e.g React Hook Forms, Formik, Yup etc)": {
    junior: [
      {
        q: "What is the difference between a controlled and an uncontrolled input?",
        short: "A controlled input's value lives in React state and updates via onChange; an uncontrolled input keeps its value in the DOM and you read it via a ref or FormData.",
        long: `Controlled: value={state} + onChange — React is the single source of truth; easy to validate, format and conditionally disable.
Uncontrolled: defaultValue + ref or reading FormData on submit — less code, fewer re-renders.
File inputs are always uncontrolled.
React Hook Form is primarily uncontrolled (refs) for performance; Formik is controlled.
Pitfall: mixing value without onChange gives a read-only input warning.
Strong answer picks one based on needs (instant validation vs simple submit) rather than "controlled is always better".`,
        exercises: [
          {
            task: "Fix the input that cannot be typed into.",
            description: "Checks controlled input basics. Ask why typing does nothing.",
            code: `const [city, setCity] = useState("");
<input value={city} />`,
            answer: "A value without onChange is read-only; React reverts each keystroke. Add an onChange handler (or use defaultValue for uncontrolled). Some think it is a browser bug. A strong answer explains React enforces the value prop each render and mentions the console warning about missing onChange.",
            solution: "<input value={city} onChange={e => setCity(e.target.value)} />",
          },
          {
            task: "Build an uncontrolled form. On submit, read the name with a ref.",
            description: "Checks uncontrolled inputs with refs. Ask for a minimal implementation.",
            answer: "Use defaultValue and a ref; read ref.current.value in the submit handler. Weak answers add useState anyway. A strong answer explains when uncontrolled is fine (simple submit) and mentions FormData as an alternative.",
            solution: `function NameForm({ onSave }) {
  const ref = useRef(null);
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(ref.current.value); }}>
      <input ref={ref} defaultValue="" />
      <button>Save</button>
    </form>
  );
}`,
          },
        ],
      },
      {
        q: "Fix the form so the page does not reload and the value is submitted.",
        code: `function Subscribe({ onSubscribe }) {
  const [email, setEmail] = useState("");
  return (
    <form>
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <button onClick={() => onSubscribe(email)}>Subscribe</button>
    </form>
  );
}`,
        short: "The button submits the form natively, reloading the page. Handle onSubmit on the form, call preventDefault, and use a proper input type and label.",
        long: `A <button> inside a form defaults to type="submit"; clicking it triggers native submission and navigation.
Handling the form's onSubmit also covers pressing Enter.
Add type="email", required and a label for accessibility and validation.
React 19 alternative: <form action={fn}> receives FormData and resets uncontrolled fields automatically.
Strong answer mentions the default button type and keyboard submission.`,
        fix: `function Subscribe({ onSubscribe }) {
  const [email, setEmail] = useState("");
  return (
    <form onSubmit={e => { e.preventDefault(); onSubscribe(email); }}>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
      <button type="submit">Subscribe</button>
    </form>
  );
}`,
        exercises: [
          {
            task: "Predict what happens when clicking Cancel.",
            description: "Checks default button type. Ask whether the form submits.",
            code: `<form onSubmit={save}>
  <button>Save</button>
  <button onClick={cancel}>Cancel</button>
</form>`,
            answer: "It submits, because buttons in forms default to type=\"submit\". Set type=\"button\" for non-submit actions. A common wrong answer is that only the last button submits.",
          },
          {
            task: "Implement the same form with a React 19 form action.",
            description: "Checks modern form APIs. Ask for an uncontrolled version using action.",
            answer: "The action receives FormData; no preventDefault or state is needed, and the form resets after success. A strong answer adds useFormStatus for a pending button.",
            solution: `function Subscribe({ onSubscribe }) {
  return (
    <form action={fd => onSubscribe(fd.get("email"))}>
      <input name="email" type="email" required aria-label="Email" />
      <button type="submit">Subscribe</button>
    </form>
  );
}`,
          },
        ],
      },
    ],
    middle: [
      {
        q: "You see the warning \"A component is changing an uncontrolled input to be controlled\". Why?",
        code: `const [name, setName] = useState();
<input value={name} onChange={e => setName(e.target.value)} />`,
        short: "The initial value is undefined, so React treats the input as uncontrolled, then it becomes controlled after typing. Initialize state with \"\".",
        long: `value={undefined} means "no controlled value", so React lets the DOM own it.
Once state becomes a string, the input switches to controlled mode — React warns because behavior is ambiguous.
Same issue when data loads async: value={user?.name} is undefined at first.
Fix: initialize with "" or use value={name ?? ""}.
For checkboxes use checked with a boolean, never undefined.
Strong answer also mentions the reverse warning and null values.`,
        fix: `const [name, setName] = useState('');
<input value={name} onChange={e => setName(e.target.value)} />`,
        exercises: [
          {
            task: "Fix the bug. The input does not show the user's name after it loads.",
            description: "Checks initial-state-from-props pitfalls with async data. Ask why the loaded name never appears.",
            code: `function Edit({ user }) { // user is undefined first, then loaded
  const [name, setName] = useState(user?.name ?? "");
  return <input value={name} onChange={e => setName(e.target.value)} />;
}`,
            answer: "useState only uses its initial value on mount, so the later user is ignored. Render the form only once data exists and key it by user id. Common fixes sync via useEffect, causing extra renders and overwriting edits. A strong answer gates on data and uses a key to initialize per user.",
            solution: `function EditPage({ user }) {
  if (!user) return <Spinner />;
  return <Edit key={user.id} user={user} />;
}`,
          },
          {
            task: "Build a controlled select with a placeholder option. It must not show the controlled or uncontrolled warning.",
            description: "Checks controlled select and placeholder handling. Ask for a warning-free implementation.",
            answer: "Keep the value a string from the start and use an empty-string placeholder. Weak answers use undefined or null as initial value. A strong answer keeps the value type stable and makes the placeholder non-selectable.",
            solution: `const [role, setRole] = useState("");
<select value={role} onChange={e => setRole(e.target.value)}>
  <option value="" disabled>Choose…</option>
  <option value="admin">Admin</option>
</select>`,
          },
        ],
      },
      {
        q: "How do you validate a form in React without a library? When should you add react-hook-form or a schema library?",
        short: "Use native constraint validation (required, type, pattern) plus a small validate function on submit/blur that stores errors in state. Add RHF + zod when forms get large, dynamic, need async rules, or must share typed schemas.",
        long: `Native attributes give free validation and accessibility; customize messages with setCustomValidity or noValidate + your own UI.
Validate on submit first, then on blur/change for touched fields to avoid noisy errors while typing.
Keep errors in a map keyed by field; connect them with aria-describedby and aria-invalid.
Libraries pay off for many fields (re-render cost), arrays of fields, async/cross-field rules and type inference.
Strong answer weighs UX timing of validation and accessibility, not just the library choice.`,
        exercises: [
          {
            task: "Add simple validation on submit. The error messages must be accessible.",
            description: "Checks hand-rolled validation and a11y. Ask for an email field with an error.",
            answer: "Store errors in state, mark the field invalid and link the message. A strong answer focuses the first invalid field on submit.",
            solution: `const [errors, setErrors] = useState({});
function onSubmit(e) {
  e.preventDefault();
  const email = new FormData(e.currentTarget).get("email");
  const next = /.+@.+/.test(email) ? {} : { email: "Enter a valid email" };
  setErrors(next);
}
<input name="email" aria-invalid={!!errors.email} aria-describedby="email-err" />
<p id="email-err">{errors.email}</p>`,
          },
          {
            task: "When does the error message appear with this code? Make the user experience better.",
            description: "Checks validation timing. Show validation on every change from the first keystroke.",
            code: "<input value={email} onChange={e => { setEmail(e.target.value); setError(validate(e.target.value)); }} />",
            answer: "The error shows immediately as the user starts typing, which is noisy. Validate on blur or submit, then live-validate once the field is touched. A strong answer mentions screen reader announcement noise too.",
          },
        ],
      },
    ],
    senior: [
      {
        q: "Build a form with react-hook-form and yup or zod. Add async validation to check if the email is taken. Add fields that depend on other fields. Show server errors on the right fields.",
        short: "Use a schema resolver for sync rules, a debounced async validate for uniqueness, watch for dependent fields, and setError to map server errors to fields with accessible messages.",
        long: `zodResolver/yupResolver keeps validation declarative and typed (z.infer).
Async rules: validate in register options or schema refine; debounce and cancel to avoid hammering the API.
Dependent fields: watch()/useWatch, schema refine/superRefine or yup .when().
Server errors: catch in onSubmit, call setError("email", { message }) or setError("root.server").
A11y: aria-invalid, aria-describedby linking to the error, focus first error (shouldFocusError default true).
Pitfalls: watch() at the top level re-renders the whole form — prefer useWatch in a child.
Strong answer covers performance (uncontrolled inputs, Controller only for custom components).`,
        exercises: [
          {
            task: "Fix the performance problem. The whole form re-renders on every key press in any field.",
            description: "Checks react-hook-form subscription performance. Ask why the form is slow and how to scope re-renders.",
            code: `function Profile() {
  const { register, control, watch } = useForm();
  const values = watch();
  return <>{/* 40 fields */}<StateSelect country={values.country} /></>;
}`,
            answer: "watch() with no arguments at the form root subscribes the whole component to every field. Move the subscription into the child with useWatch for just the needed field. Many suggest memoizing fields. A strong answer explains watch subscribes at the hook's component and useWatch isolates the subscription.",
            solution: `function StateSelect({ control }) {
  const country = useWatch({ control, name: "country" });
  return <select>{statesFor(country).map(s => <option key={s}>{s}</option>)}</select>;
}`,
          },
          {
            task: "Write a zod schema. confirmPassword must equal password. Show the error on the confirmPassword field.",
            description: "Checks cross-field schema validation. Ask for a zod schema that attaches the error correctly.",
            answer: "Use refine at the object level with a path so RHF attaches the error to the right field. A common mistake is the error landing on the root, so no field shows it. A strong answer uses path and mentions superRefine for multiple issues.",
            solution: `const schema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine(v => v.password === v.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});`,
          },
        ],
      },
      {
        q: "Fix this dynamic field list built with react-hook-form.",
        code: `function Phones({ control, register }) {
  const { fields, append, remove } = useFieldArray({ control, name: "phones" });
  return fields.map((f, i) => (
    <div key={i}>
      <input {...register("phones." + i + ".number")} />
      <button onClick={() => remove(i)}>×</button>
    </div>
  ));
}`,
        short: "Using the index as key breaks field identity when removing rows, and the remove button submits the form. Use the generated field.id as key and type=\"button\".",
        long: `useFieldArray generates a stable id per field (f.id); using the index lets inputs keep values of removed rows.
Buttons inside forms default to submit, so clicking × submits the form.
Register with template paths phones.N.number (fine) and provide defaultValues for append.
For validation of arrays use a zod array schema; show per-row errors via errors.phones?.[i]?.number.
Strong answer knows RHF's id field and the default button type pitfall.`,
        fix: `return (
  <>
    {fields.map((f, i) => (
      <div key={f.id}>
        <input {...register("phones." + i + ".number")} />
        <button type="button" onClick={() => remove(i)}>×</button>
      </div>
    ))}
    <button type="button" onClick={() => append({ number: "" })}>Add phone</button>
  </>
);`,
        exercises: [
          {
            task: "Write a zod schema for one to three phone numbers. Show errors for each row.",
            description: "Checks array validation. Ask for the schema and how errors are read.",
            answer: "z.array(...).min(1).max(3) validates the count; each item has its own rules, read via errors.phones?.[i]?.number. A strong answer also handles the array-level error (errors.phones?.root).",
            solution: `const schema = z.object({
  phones: z.array(z.object({ number: z.string().regex(/^\\+?[0-9 ]{7,}$/, "Invalid") })).min(1).max(3),
});`,
          },
          {
            task: "In the original code, there are three rows. You remove the first one. What bug do you see?",
            description: "Checks index keys with field arrays. Ask what the user sees.",
            answer: "The remaining inputs can show the wrong values (row 1's DOM reused for row 2), and the form may submit. Weak answers say RHF handles it. A strong answer explains key identity and button defaults.",
          },
        ],
      },
    ],
    techlead: [
      {
        q: "Forms look and work differently across the app: validation, layout, and accessibility. How do you make them consistent?",
        ai: true,
        short: "Provide shared form field components that wrap RHF and the design system, schema-driven validation, a11y tests, and an incremental migration plan.",
        long: `Pick one library (e.g. RHF + zod) via an ADR; document why over Formik.
Build field wrappers (TextField, SelectField) that wire label, error, aria attributes and layout automatically.
Share schemas with the backend where possible (OpenAPI/zod) so rules don't drift.
Add a11y checks (axe in tests, Storybook a11y addon) and a review checklist.
Migrate high-traffic forms first; leave stable legacy forms until touched.
Strong answer includes adoption tactics: codemods, pairing sessions, measuring defect rate.`,
        exercises: [
          {
            task: "Write the outline of an architecture decision record. It picks one form library for the whole company.",
            description: "Checks decision documentation. Ask for an ADR outline with criteria.",
            answer: "Context (current libs, defect data), options (RHF+zod, Formik+yup, TanStack Form, React 19 actions), criteria (perf, typing, a11y, server-action fit, bundle, team skills), decision, migration plan and reversal cost. Weak answers state a favorite library. A strong answer lists measurable criteria, alternatives including native React 19 actions, and a migration and reversal plan.",
          },
          {
            task: "Three teams each built their own FormError component. Define one shared API for all of them.",
            description: "Checks standardization through shared components. Ask what contract the shared component exposes.",
            answer: "Ship one field wrapper that owns label, description, error id, aria-invalid and aria-describedby, so teams pass only name/label. Deprecate the old components with a codemod and lint rule. Weak answers create yet another component without migration. A strong answer bakes in a11y wiring and plans deprecation with codemods and lint.",
            solution: "<TextField name=\"email\" label=\"Email\" description=\"We never share it\" control={control} />",
          },
        ],
      },
      {
        q: "A designer wants multi-step wizard forms with autosave. Several teams will use them. Design the architecture.",
        ai: true,
        short: "One form state across steps (single RHF instance or per-step schemas merged), step routing in the URL, debounced autosave via a mutation with conflict handling, and a reusable wizard shell with accessible step navigation.",
        long: `State: a single useForm at the wizard level with per-step zod schemas validated on Next (trigger(fields)).
URL holds the current step so refresh and back button work; guard skipping ahead.
Autosave: watch changes in a child, debounce, call a mutation with versioning (ETag/updatedAt) to detect conflicts; show save status.
Draft recovery and unsaved-changes guard (beforeunload, router blocker).
Shared shell provides progress, focus management on step change, and announces errors.
Strong answer considers server-side drafts vs local storage, analytics per step and accessibility.`,
        exercises: [
          {
            task: "Before going to the next step, validate only the fields of the current step.",
            description: "Checks partial validation with RHF. Ask for the Next handler.",
            answer: "trigger(fieldNames) validates a subset and returns a boolean. A strong answer focuses the first invalid field and keeps the URL in sync.",
            solution: `const stepFields = { 1: ["name", "email"], 2: ["address.street", "address.zip"] };
async function next() {
  const ok = await trigger(stepFields[step]);
  if (ok) setSearchParams({ step: String(step + 1) });
}`,
          },
          {
            task: "Another tab changed the same draft. How should autosave handle this conflict?",
            description: "Checks conflict resolution design. Ask what the user sees and what the API needs.",
            answer: "Send a version with each save; on 409 show a non-destructive prompt (reload theirs, keep mine, compare). Silent last-write-wins loses data. A strong answer involves design on the UX copy and logs conflict frequency.",
          },
        ],
      },
    ],
  },
  "Built in state management (state, context) and 3-rd party libs (rtk, zustand, etc)": {
    junior: [
      {
        q: "What is prop drilling and how does Context help?",
        short: "Prop drilling is passing props through many intermediate components that don't use them. Context lets any descendant read a value directly from a Provider.",
        long: `createContext + Provider + useContext (or use(Context) in React 19).
Good for low-frequency, widely needed values: theme, locale, current user.
Every consumer re-renders when the Provider's value changes.
Alternatives to Context: component composition (pass children/elements), or a state library.
Pitfall: using Context as a full global store for fast-changing data.
Strong answer mentions composition as the first fix for drilling.`,
        exercises: [
          {
            task: "Fix the bug. useContext returns the default value, not the provided value.",
            description: "Checks Provider placement. Ask why the default value is returned.",
            code: `const UserContext = createContext(null);
function App() {
  return <><UserContext.Provider value={user} /><Profile /></>;
}`,
            answer: "Profile is not inside the Provider; consumers must be descendants. Some blame createContext's argument. A strong answer explains consumers search up the tree for the nearest Provider ancestor.",
            solution: `function App() {
  return (
    <UserContext.Provider value={user}>
      <Profile />
    </UserContext.Provider>
  );
}`,
          },
          {
            task: "Move state up to the parent, so two sibling inputs show the same value.",
            description: "Checks lifting state up. Ask for the minimal change to sync two inputs.",
            answer: "Move the state to the closest common parent and pass value/onChange down. Weak answers reach for Context or a global store. A strong answer keeps state at the closest common parent first.",
            solution: `function Parent() {
  const [text, setText] = useState("");
  return <><Input value={text} onChange={setText} /><Input value={text} onChange={setText} /></>;
}`,
          },
        ],
      },
      {
        q: "Fix the bug. The counter in the toolbar does not update when the user clicks the plus button.",
        code: `function App() {
  let count = 0;
  return (
    <>
      <Toolbar count={count} />
      <button onClick={() => { count++; }}>+</button>
    </>
  );
}`,
        short: "A local variable does not trigger re-renders and is reset each render. Store the value in state with useState and update it with the setter.",
        long: `React re-renders only when state (or props/context) changes through React APIs.
count++ changes a local variable that is recreated as 0 on the next render anyway.
useState persists the value across renders and the setter schedules a re-render.
Strong answer distinguishes local variables, refs (persist, no render) and state (persist, render).`,
        fix: `function App() {
  const [count, setCount] = useState(0);
  return (
    <>
      <Toolbar count={count} />
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </>
  );
}`,
        exercises: [
          {
            task: "Predict what is displayed after clicking the button.",
            description: "Checks state vs module variables. Show a module-level counter.",
            code: `let clicks = 0;
function C() { return <button onClick={() => clicks++}>{clicks}</button>; }`,
            answer: "The DOM keeps showing 0 because no re-render is triggered, even though the variable increments. When something else re-renders, the new value appears, and all instances share it. A strong answer explains why module state is unsafe for UI.",
          },
          {
            task: "Build a Context for the current user. Add a custom hook that throws an error if used outside the provider.",
            description: "Checks context ergonomics. Ask for createContext + Provider + useUser.",
            answer: "A null default plus a guard in the hook gives a clear error instead of silent undefined. A strong answer memoizes the value if it is an object.",
            solution: `const UserContext = createContext(null);
export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
  return ctx;
}`,
          },
        ],
      },
    ],
    middle: [
      {
        q: "Why do all consumers re-render whenever anything changes?",
        code: "<AppContext.Provider value={{ user, theme, setTheme }}>",
        short: "A new value object is created every render and all values share one context, so every consumer re-renders on any change. Memoize the value, split contexts, or use a store with selectors.",
        long: `Context compares value with Object.is; an inline object is always new when the Provider's parent re-renders.
Even with useMemo, a single context means theme consumers re-render when user changes.
Fixes: useMemo for the value, split into UserContext/ThemeContext, separate state and dispatch contexts.
For fine-grained subscriptions use Zustand/Redux selectors or useSyncExternalStore.
React Compiler can memoize the object but doesn't solve the coarse-grained subscription.
Strong answer measures with the Profiler and knows memo doesn't block context updates.`,
        fix: `const value = useMemo(() => ({ user, theme, setTheme }), [user, theme]);
<AppContext.Provider value={value}>`,
        exercises: [
          {
            task: "Does IncButton re-render when count changes? Then fix it.",
            description: "Checks context re-render behavior with memo. Ask which components re-render and how to fix it.",
            code: `const Ctx = createContext();
function Provider({ children }) {
  const [count, setCount] = useState(0);
  return <Ctx.Provider value={{ count, setCount }}>{children}</Ctx.Provider>;
}
const IncButton = memo(() => { const { setCount } = useContext(Ctx); return <button onClick={() => setCount(c => c + 1)}>+</button>; });`,
            answer: "IncButton re-renders despite memo because it consumes the context and the value object changes. Put setCount in its own context (setters are stable). Many believe memo stops context updates. A strong answer splits state and setter contexts or memoizes value, knowing setters are stable.",
            solution: `const CountCtx = createContext(0);
const SetCountCtx = createContext(() => {});
// Provider: <SetCountCtx.Provider value={setCount}><CountCtx.Provider value={count}>…`,
          },
          {
            task: "Fix the Zustand selector. It causes extra re-renders. In version 5 it causes an infinite loop.",
            description: "Checks Zustand selector equality. Ask why components re-render on unrelated changes.",
            code: "const { user, theme } = useStore(s => ({ user: s.user, theme: s.theme }));",
            answer: "The selector returns a new object each time, so strict equality always fails. Select individually or use useShallow. Weak answers blame Zustand. A strong answer explains new object references fail strict equality and mentions useShallow or atomic selectors.",
            solution: `import { useShallow } from "zustand/react/shallow";
const { user, theme } = useStore(useShallow(s => ({ user: s.user, theme: s.theme })));`,
          },
        ],
      },
      {
        q: "How do you decide where state should live? Options are local, lifted up, context, the URL, or a global store.",
        short: "Keep state as close as possible to where it is used, lift it to the nearest common parent when siblings need it, put shareable navigation state in the URL, use context for low-frequency cross-cutting values, and a store only for frequently updated global client state.",
        long: `Start local; lifting is cheap and explicit.
URL: filters, tabs, pagination — anything that should survive refresh or be shareable.
Context: theme, locale, auth, dependency injection; avoid high-frequency updates.
Global store (Zustand/RTK): cross-page client state with many consumers and fine-grained subscriptions.
Server data: a query cache, not any of the above.
Avoid duplicating state; derive what you can during render.
Strong answer gives a decision flow and examples of moving state down to fix performance.`,
        exercises: [
          {
            task: "Where should each piece of state live? A modal open flag. Selected table filters. The current user. An unsaved form draft. A list of orders from the API.",
            description: "Checks state placement judgment. Ask for a one-line justification each.",
            answer: "Modal flag: local. Filters: URL. Current user: context or query cache. Draft: local form state (or persisted draft store if required). Orders: query cache. A strong answer explains trade-offs, not just labels.",
          },
          {
            task: "Change the code to remove duplicated derived state.",
            description: "Checks avoiding redundant state. Present fullName stored in state.",
            code: `const [first, setFirst] = useState("");
const [last, setLast] = useState("");
const [fullName, setFullName] = useState("");
useEffect(() => setFullName(first + " " + last), [first, last]);`,
            answer: "fullName can be computed from first and last, so storing it risks drift. Compute during render. Weak answers sync it with an effect.",
            solution: "const fullName = first + \" \" + last;",
          },
        ],
      },
    ],
    senior: [
      {
        q: "What is the difference between server state and client state? Where do TanStack Query, Zustand, Redux Toolkit, and Context fit?",
        short: "Server state (cached remote data) belongs in TanStack Query or RTK Query; global client UI state in Zustand/RTK; Context for low-frequency dependencies like theme or auth; local state stays in components.",
        long: `Server state is async, shared, can go stale and needs caching, dedup, retries and invalidation — Query libraries solve this.
Putting API data in Redux by hand duplicates what Query does and causes stale-data bugs.
Client state: UI toggles, wizard steps, selections — keep local first, lift only when needed.
RTK fits teams wanting strict patterns, devtools, middleware; Zustand is lighter with selectors.
URL is also state (filters, pagination) — prefer search params.
Strong answer gives a decision tree and examples from real apps.`,
        exercises: [
          {
            task: "Server data is copied into Redux with thunks. After edits, it becomes old. Fix the design.",
            description: "Checks server vs client state separation. Ask for the refactor and its benefits.",
            code: `useEffect(() => { dispatch(fetchProjects()); }, []);
const projects = useSelector(s => s.projects.list);`,
            answer: "Move server data to RTK Query or TanStack Query with tags/keys so mutations invalidate caches automatically; keep Redux for client state only. A common answer adds more thunks to refetch. A strong answer moves to a query cache with invalidation, gaining dedup, retries and staleness handling.",
            solution: `const { data: projects } = useQuery({ queryKey: ["projects"], queryFn: api.getProjects });
const update = useMutation({
  mutationFn: api.updateProject,
  onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
});`,
          },
          {
            task: "Build a small external store hook with useSyncExternalStore. It must not tear during concurrent rendering.",
            description: "Checks concurrent-safe external stores. Ask for a tiny store plus hook.",
            answer: "useSyncExternalStore guarantees all components read a consistent snapshot; getSnapshot must return a cached value (same reference if unchanged). Weak answers use useState plus useEffect subscriptions, which can tear. A strong answer explains snapshot caching and selector stability.",
            solution: `function createStore(initial) {
  let state = initial; const subs = new Set();
  return {
    get: () => state,
    set: fn => { state = fn(state); subs.forEach(s => s()); },
    subscribe: s => { subs.add(s); return () => subs.delete(s); },
  };
}
const store = createStore({ count: 0 });
const useCount = () => useSyncExternalStore(store.subscribe, () => store.get().count);`,
          },
        ],
      },
      {
        q: "Fix the problems in the Redux Toolkit slice and selector.",
        code: `const todos = createSlice({
  name: "todos",
  initialState: [],
  reducers: {
    toggle(state, action) {
      return state.map(t => t.id === action.payload ? (t.done = !t.done, t) : t);
    },
  },
});
const doneTodos = useSelector(s => s.todos.filter(t => t.done));`,
        short: "The reducer mutates draft items and also returns a new array, mixing Immer styles confusingly; just mutate the draft. The selector returns a new array each time, re-rendering on every store update — memoize with createSelector.",
        long: `With Immer you either mutate the draft or return a new value, not both; here it mutates items inside a map — it works but is error-prone.
Clear version: find the item and flip done.
useSelector re-renders when the selected value changes by reference; filter() always creates a new array.
createSelector memoizes derived data; RTK warns about unstable selectors in dev.
Strong answer mentions entity adapters for normalized collections.`,
        fix: `toggle(state, action) {
  const t = state.find(t => t.id === action.payload);
  if (t) t.done = !t.done;
},
// selectors.js
export const selectDoneTodos = createSelector([s => s.todos], todos => todos.filter(t => t.done));
const doneTodos = useSelector(selectDoneTodos);`,
        exercises: [
          {
            task: "With the original selector, how often does the component re-render?",
            description: "Checks selector referential stability. Ask about unrelated store updates.",
            code: "const done = useSelector(s => s.todos.filter(t => t.done));",
            answer: "It re-renders on every dispatched action anywhere in the store, because filter returns a new array each time. Weak answers think only todos changes matter. A strong answer uses memoized selectors or shallowEqual.",
          },
          {
            task: "Store data in normalized form with createEntityAdapter.",
            description: "Checks scalable store structure. Ask for an adapter with selectors.",
            answer: "Entity adapters store { ids, entities } and provide CRUD reducers and memoized selectors, making updates O(1). A strong answer explains why normalization helps lookups and avoids duplication.",
            solution: `const adapter = createEntityAdapter();
const slice = createSlice({ name: "todos", initialState: adapter.getInitialState(), reducers: { upsert: adapter.upsertOne } });
export const { selectAll, selectById } = adapter.getSelectors(s => s.todos);`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: "You get an app that uses Redux, MobX, and Context together. What is your plan?",
        ai: true,
        short: "Assess where each causes pain, pick a target architecture, and migrate incrementally per feature with adapters and metrics — no big-bang rewrite.",
        long: `Inventory: what state lives where, which features are touched most, where bugs come from.
Separate server state first (move to TanStack Query) — this usually shrinks the stores dramatically.
Choose one client store (RTK or Zustand) via ADR; freeze new code in the deprecated ones.
Migrate feature by feature; bridge with adapters/selectors so both can coexist.
Track progress (lines/stores remaining, bundle size, bug rate) and stop when ROI drops.
Strong answer acknowledges team buy-in, skills, and a story where a migration was paused or rescoped.`,
        exercises: [
          {
            task: "An app uses Redux, MobX, and Context. Which state do you move first? Explain why.",
            description: "Checks migration prioritization. Ask what goes first and why.",
            answer: "Start with server data duplicated in stores (largest bug source and easiest to replace with Query), then the most frequently changed feature's client state; leave stable, rarely touched modules until touched. Weak answers rewrite everything to one library. A strong answer prioritizes by bug rate and change frequency and keeps the migration incremental.",
          },
          {
            task: "Build an adapter hook. New code can read a MobX observable with it, without importing MobX.",
            description: "Checks adapter-based decoupling. Ask for a hook hiding MobX from consumers.",
            answer: "Wrap the observable with useSyncExternalStore via a MobX reaction, so consumers depend on a hook API that can later be reimplemented. Weak answers import observer everywhere, deepening lock-in. A strong answer isolates the dependency behind a hook so implementation can change later.",
            solution: `export function useCartCount() {
  return useSyncExternalStore(
    cb => reaction(() => cartStore.items.length, cb),
    () => cartStore.items.length
  );
}`,
          },
        ],
      },
      {
        q: "Build a feature flag provider that teams can use everywhere. When flags refresh, the whole app must not re-render.",
        ai: true,
        code: `const FlagsContext = createContext({});
export function FlagsProvider({ children }) {
  const [flags, setFlags] = useState({});
  useEffect(() => { const id = setInterval(async () => setFlags(await api.flags()), 30000); return () => clearInterval(id); }, []);
  return <FlagsContext.Provider value={flags}>{children}</FlagsContext.Provider>;
}`,
        short: "Every refresh creates a new flags object, re-rendering every consumer even if their flag did not change. Use an external store with per-flag subscriptions (useSyncExternalStore), keep values stable, and provide typed useFlag(name).",
        long: `Context propagates any value change to all consumers; polling makes that frequent.
An external store lets each component subscribe to one flag and re-render only when that flag changes.
Keep flags typed (union of names) and default to safe values while loading.
Consider bootstrapping flags server-side to avoid flicker, and avoid toggling flags mid-session for critical flows.
Governance: owners, expiry dates, cleanup of stale flags.
Strong answer covers both the technical subscription model and flag lifecycle.`,
        fix: `const store = (() => {
  let flags = {}; const subs = new Set();
  return {
    get: name => flags[name] ?? false,
    set: next => { flags = next; subs.forEach(s => s()); },
    subscribe: s => { subs.add(s); return () => subs.delete(s); },
  };
})();
export function useFlag(name) {
  return useSyncExternalStore(store.subscribe, () => store.get(name), () => false);
}`,
        exercises: [
          {
            task: "Define rules for the life of a feature flag, so old flags do not pile up.",
            description: "Checks governance thinking. Ask for rules teams must follow.",
            answer: "Every flag has an owner, purpose and expiry; CI or a dashboard lists stale flags; removing the flag is part of the feature's definition of done. A strong answer measures flag count trend.",
          },
          {
            task: "With the fixed store, one unrelated flag changes. What re-renders?",
            description: "Checks fine-grained subscriptions. Ask which components re-render.",
            answer: "Only components whose selected flag value changed re-render, because useSyncExternalStore compares each snapshot with Object.is. Weak answers think all subscribers re-render. A strong answer notes the primitive snapshot makes this cheap.",
          },
        ],
      },
    ],
  },
  "Routing": {
    junior: [
      {
        q: "In React Router, how do you define routes and read URL parameters?",
        short: "Declare routes with a path like \"/users/:id\" (via createBrowserRouter or <Routes>/<Route>) and read params with useParams().",
        long: `React Router v6/v7: createBrowserRouter([{ path, element, children }]) + <RouterProvider>, or <BrowserRouter><Routes><Route/></Routes>.
Nested routes render inside parents via <Outlet />.
useParams() returns string params; parse/validate them yourself.
Navigate with <Link to>, <NavLink> for active styles, or useNavigate() for programmatic navigation.
Query string via useSearchParams().
Strong answer knows params are always strings and handles 404 routes (path="*").`,
        exercises: [
          {
            task: "Fix the link that reloads the whole page.",
            description: "Checks client-side navigation. Ask why the page fully reloads.",
            code: "<a href=\"/users/42\">Profile</a>",
            answer: "A plain anchor triggers a full document navigation. Use Link for client-side routing. Some suggest preventDefault on the anchor. A strong answer uses Link/NavLink and mentions preserving app state and avoiding refetching assets.",
            solution: "<Link to=\"/users/42\">Profile</Link>",
          },
          {
            task: "What is the type of id? Fix the comparison bug.",
            description: "Checks param types. Ask what id is and why find fails.",
            code: `const { id } = useParams(); // URL /users/42
const user = users.find(u => u.id === id); // u.id is a number`,
            answer: "Params are always strings, so 42 === \"42\" is false and user is undefined. Convert and validate. Many assume params are typed. A strong answer converts and validates, handling invalid ids with a 404.",
            solution: `const id = Number(useParams().id);
const user = Number.isInteger(id) ? users.find(u => u.id === id) : undefined;`,
          },
        ],
      },
      {
        q: "Fix the navigation so it uses React Router correctly.",
        code: `function SaveButton({ id }) {
  async function save() {
    await api.save(id);
    window.location.href = "/items/" + id;
  }
  return <button onClick={save}>Save</button>;
}`,
        short: "Setting window.location triggers a full page reload, losing app state and refetching everything. Use useNavigate for client-side navigation.",
        long: `React Router intercepts navigation only through its APIs (Link, navigate, redirect).
window.location reloads the document, re-downloads JS and resets state.
useNavigate() returns a function; use { replace: true } when the current entry should not be kept.
In data routers, prefer actions with redirect after mutations.
Strong answer knows when a full reload is actually desired (logout, version update).`,
        fix: `function SaveButton({ id }) {
  const navigate = useNavigate();
  async function save() {
    await api.save(id);
    navigate("/items/" + id);
  }
  return <button onClick={save}>Save</button>;
}`,
        exercises: [
          {
            task: "In a nav menu, add a style for the active link.",
            description: "Checks NavLink. Ask for highlighting the current route.",
            answer: "NavLink passes isActive to className/style and sets aria-current=\"page\" automatically. Weak answers compare location manually. A strong answer mentions the end prop for index routes.",
            solution: "<NavLink to=\"/reports\" end className={({ isActive }) => isActive ? \"nav active\" : \"nav\"}>Reports</NavLink>",
          },
          {
            task: "What renders at the path users slash 42 slash settings?",
            description: "Checks nested routes and Outlet. Show the route config.",
            code: `{ path: "/", element: <Layout />, children: [
  { path: "users/:id", element: <UserPage />, children: [{ path: "settings", element: <Settings /> }] },
] }`,
            answer: "Layout renders, then UserPage via Outlet, then Settings inside UserPage's Outlet. If UserPage has no <Outlet />, Settings never appears. A strong answer explains nested route rendering.",
          },
        ],
      },
    ],
    middle: [
      {
        q: "How do you implement protected routes and lazy-loaded pages?",
        short: "Wrap routes in a guard (component or loader) that redirects unauthenticated users, and use React.lazy with Suspense (or route-level lazy) for code splitting.",
        long: `Guard as a layout route: render <Outlet /> if authed, otherwise <Navigate to="/login" replace state={{ from: location }} />.
With data routers, a loader can throw redirect("/login") before rendering anything.
replace avoids putting the protected URL in history (back button loop).
lazy(() => import()) requires a default export and a Suspense boundary; React Router also supports route.lazy.
Client-side guards are UX only — the API must enforce authorization.
Strong answer mentions returning users to the original page after login.`,
        fix: `const Users = lazy(() => import('./Users'));
function Protected({ children }) { return isAuthed ? children : <Navigate to="/login" replace />; }`,
        exercises: [
          {
            task: "Fix the login redirect. Users should go back to the page they first asked for.",
            description: "Checks redirect-after-login flow. Ask how to return users to the original page.",
            code: `// RequireAuth: <Navigate to="/login" replace />
// Login onSuccess: navigate("/")`,
            answer: "Pass the attempted location in navigation state and read it after login. Weak answers store the path in localStorage. A strong answer uses navigation state and replace to avoid history loops, and validates the target to prevent open redirects.",
            solution: `// RequireAuth
<Navigate to="/login" replace state={{ from: location }} />
// Login
const from = useLocation().state?.from?.pathname ?? "/";
navigate(from, { replace: true });`,
          },
          {
            task: "Write a data router loader. It sends users who are not logged in to another page before rendering.",
            description: "Checks loader-based guards. Ask for a guard that runs before rendering.",
            answer: "Throwing or returning redirect from a loader prevents the route component from rendering at all. Weak answers guard only in components, causing a flash of protected UI. A strong answer notes guards are UX only and the API must enforce auth.",
            solution: `{
  path: "admin",
  loader: async () => {
    if (!(await getSession())) throw redirect("/login");
    return null;
  },
  lazy: () => import("./routes/admin"),
}`,
          },
        ],
      },
      {
        q: "Fix the lazy route. On slow networks it crashes and shows a blank page.",
        code: `const Reports = lazy(() => import("./Reports")); // Reports.jsx: export function Reports() {}
<Routes>
  <Route path="/reports" element={<Reports />} />
</Routes>`,
        short: "React.lazy requires a default export and a Suspense boundary above the lazy component. Map the named export to default and wrap routes in Suspense (plus an error boundary for chunk failures).",
        long: `lazy expects a module with default; a named export yields "Element type is invalid".
Without a Suspense ancestor React throws when the component suspends.
Add an error boundary for failed chunk loads (offline, deploy).
With data routers, route.lazy can load the component and loader together, avoiding waterfalls.
Strong answer mentions prefetching on hover and route-level boundaries.`,
        fix: `const Reports = lazy(() => import("./Reports").then(m => ({ default: m.Reports })));
<ErrorBoundary fallback={<p>Failed to load page.</p>}>
  <Suspense fallback={<Spinner />}>
    <Routes>
      <Route path="/reports" element={<Reports />} />
    </Routes>
  </Suspense>
</ErrorBoundary>`,
        exercises: [
          {
            task: "When the user hovers a link, load the code for that lazy route early.",
            description: "Checks perceived performance. Ask for a simple prefetch.",
            answer: "Calling the same import() starts the download early; the browser caches the module, so lazy resolves instantly later. A strong answer avoids prefetching on touch devices and too many routes.",
            solution: `const loadReports = () => import("./Reports");
const Reports = lazy(loadReports);
<Link to="/reports" onMouseEnter={loadReports} onFocus={loadReports}>Reports</Link>`,
          },
          {
            task: "Two lazy routes are inside one Suspense boundary. The user goes from one to the other. What does the user see?",
            description: "Checks Suspense fallbacks during navigation. Ask about the old page.",
            answer: "Without transitions the fallback replaces the old page while the new chunk loads. React Router wraps navigation in startTransition (v7 by default), keeping the old UI visible instead. A strong answer knows transitions avoid hiding already-shown content.",
          },
        ],
      },
    ],
    senior: [
      {
        q: "Filters should stay after a page refresh and be easy to share. Design how to sync them with the URL. What are the risks?",
        short: "Make the URL search params the source of truth (useSearchParams), parse and validate with defaults, debounce text writes, and use replace for typing vs push for meaningful navigation.",
        long: `Don't duplicate filters in useState + URL — derive from searchParams to avoid sync bugs.
Parse/validate (zod) with defaults; ignore invalid values instead of crashing.
Debounce text input, use { replace: true } so each keystroke doesn't create a history entry.
Serialize arrays consistently (repeated keys or comma-separated); keep URLs short and readable.
Reset pagination when filters change; include params in the query key for caching.
Strong answer mentions nuqs or similar typed helpers and back/forward behavior.`,
        exercises: [
          {
            task: "Fix the bug. After the user presses Back, the page shows old filter results.",
            description: "Checks URL as single source of truth. Ask why Back shows stale results.",
            code: `const [params] = useSearchParams();
const [status, setStatus] = useState(params.get("status") ?? "all");`,
            answer: "Copying the param into state ignores later URL changes (Back/Forward). Derive status directly from searchParams on every render. Many add an effect syncing URL to state. A strong answer derives from searchParams to eliminate the duplicate state.",
            solution: `const [params, setParams] = useSearchParams();
const status = params.get("status") ?? "all";`,
          },
          {
            task: "Write a typed parser for search parameters. It should handle invalid values safely.",
            description: "Checks defensive parsing of URL input. Ask for a typed parser.",
            answer: "Validate with zod and fall back to defaults so hand-edited URLs never crash the page. Weak answers trust URL values. A strong answer treats the URL as untrusted input with defaults and catch fallbacks.",
            solution: `const Filters = z.object({
  status: z.enum(["all", "open", "closed"]).catch("all"),
  page: z.coerce.number().int().positive().catch(1),
});
const filters = Filters.parse(Object.fromEntries(params));`,
          },
        ],
      },
      {
        q: "React Router 6.4 and 7 have data routers with loaders and actions. How do they change data fetching, compared to fetching in components?",
        short: "Loaders fetch data before the route renders and run in parallel for nested routes, eliminating render-then-fetch waterfalls; actions handle mutations and automatically revalidate loaders. Data is read with useLoaderData and pending UI via useNavigation.",
        long: `Component fetching starts only after render, and nested components create sequential waterfalls.
Loaders for all matched routes start in parallel on navigation, and can be prefetched on link hover.
Actions receive form submissions (<Form method="post">), then React Router revalidates loaders — no manual refetch.
Errors go to the route's errorElement / ErrorBoundary.
Integrates well with TanStack Query (loader calls ensureQueryData).
Trade-off: routing and data become coupled; the URL drives data.
Strong answer compares with RSC/framework mode and knows when component-level queries are still fine.`,
        exercises: [
          {
            task: "Write a loader and an action for editing a project.",
            description: "Checks the loader/action workflow. Ask for route config and the form.",
            answer: "The action handles the POST and redirects; loaders revalidate automatically. A strong answer validates input in the action and returns errors with useActionData.",
            solution: `{
  path: "projects/:id/edit",
  loader: ({ params }) => api.project(params.id),
  action: async ({ request, params }) => {
    const fd = await request.formData();
    await api.updateProject(params.id, Object.fromEntries(fd));
    return redirect("/projects/" + params.id);
  },
  element: <EditProject />,
}
function EditProject() {
  const project = useLoaderData();
  return <Form method="post"><input name="name" defaultValue={project.name} /><button>Save</button></Form>;
}`,
          },
          {
            task: "Show a global pending indicator during navigation.",
            description: "Checks navigation state. Ask which hook to use.",
            answer: "useNavigation().state is \"loading\" or \"submitting\" during transitions; render a progress bar based on it. Weak answers track loading manually. A strong answer debounces the indicator to avoid flashes.",
            solution: `function GlobalSpinner() {
  const nav = useNavigation();
  return nav.state !== "idle" ? <TopProgressBar /> : null;
}`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: "You move routing from Vue Router to React Router while both apps run. How do you avoid broken links and deep links?",
        ai: true,
        short: "Keep a shared route registry as the contract, add redirects for changed paths, gate by feature flags, and verify with E2E link checks and 404 monitoring.",
        long: `Define one route manifest (path -> owning app) used by the shell/proxy to decide which app serves a URL.
Preserve URL shapes; where they must change, add permanent redirects and keep old ones for a long time.
Cross-app navigation needs full page loads or a shared history adapter — decide explicitly.
Feature flags per route allow rollback without redeploy.
Add E2E tests for deep links, bookmarks, emails/notification links; monitor 404s and analytics.
Strong answer tells how a real incident (broken email links, lost query params) was caught.`,
        exercises: [
          {
            task: "Design an automated check. It finds broken deep links during a router migration.",
            description: "Checks migration verification strategy. Ask how to catch broken deep links automatically.",
            answer: "Generate a list of URLs from the route manifest, analytics top paths and email templates; run them in Playwright against each build asserting no 404/error page and the correct final URL with query params preserved; alert on 404 rate in production. Weak answers rely on manual QA. A strong answer combines URL inventories, E2E checks and production 404 monitoring.",
          },
          {
            task: "Fix the redirect. It loses the query string.",
            description: "Checks redirect correctness. Ask what is lost and how to preserve it.",
            code: "{ path: \"/old-reports\", loader: () => redirect(\"/reports\") }",
            answer: "Forward the original search so bookmarks with filters still work. Many forget query strings. A strong answer forwards search, notes hashes never reach the server, and mentions permanent redirects for SEO when server-side.",
            solution: `{ path: "/old-reports", loader: ({ request }) => {
  const url = new URL(request.url);
  return redirect("/reports" + url.search);
} }`,
          },
        ],
      },
      {
        q: "Each route needs permissions: roles, feature flags, and customer plans. Build a route access model that scales.",
        ai: true,
        code: `// Current: checks scattered in components
function Reports() {
  const { user } = useAuth();
  if (!user.roles.includes("admin")) return <Navigate to="/" />;
  // ...
}`,
        short: "Declare access requirements as route metadata, evaluate them centrally (guard layout or loader) with one policy function, hide nav items from the same metadata, and keep the backend authoritative.",
        long: `Scattered checks drift and render protected UI briefly.
Route config carries handle: { access: { roles, flag, plan } }; a single canAccess(user, access) decides.
Evaluate in loaders (redirect before render) or a guard layout; reuse the same function to build menus.
Return 403 page vs redirect to login depending on authentication vs authorization.
Test the policy function exhaustively; audit-log denials on the server.
Strong answer stresses the server as source of truth and keeping UI and API policies in sync.`,
        fix: `const routes = [
  { path: "reports", handle: { access: { roles: ["admin"], flag: "reports" } }, lazy: () => import("./reports") },
];
export function canAccess(user, access = {}) {
  if (access.roles && !access.roles.some(r => user.roles.includes(r))) return false;
  if (access.flag && !user.flags[access.flag]) return false;
  return true;
}
function Guard() {
  const matches = useMatches();
  const { user } = useAuth();
  const ok = matches.every(m => canAccess(user, m.handle?.access));
  return ok ? <Outlet /> : <Forbidden />;
}`,
        exercises: [
          {
            task: "Build the navigation menu from the same route data.",
            description: "Checks single source of truth. Ask for a filter over routes.",
            answer: "Filtering routes with canAccess guarantees menu and guards agree. Weak answers duplicate role lists in the nav. A strong answer handles nested routes and ordering.",
            solution: "const menu = routes.filter(r => r.handle?.nav && canAccess(user, r.handle.access));",
          },
          {
            task: "For each case, should you redirect to the login page or show a 403 page?",
            description: "Checks auth vs authz UX. Ask for: not logged in, logged in without role, plan lacks feature.",
            answer: "Not logged in: redirect to login with return URL. Missing role: 403 with contact admin. Plan lacks feature: upsell/explanation page. A strong answer aligns copy with product and logs denials.",
          },
        ],
      },
    ],
  },
  "Error Handling": {
    junior: [
      {
        q: "What is an Error Boundary?",
        short: "A component that catches errors thrown while rendering its subtree and shows a fallback UI instead of unmounting the whole app.",
        long: `Implemented as a class with static getDerivedStateFromError (render fallback) and componentDidCatch (log).
There is no hook equivalent; most teams use react-error-boundary.
Without a boundary, an uncaught render error unmounts the entire root (since React 16).
Place them around routes and independent widgets so one failure doesn't blank the page.
Strong answer explains what is and isn't caught.`,
        exercises: [
          {
            task: "Chart throws an error during render. What does the user see?",
            description: "Checks boundary scope. Ask what remains visible when Chart throws.",
            code: `<App>
  <Header />
  <ErrorBoundary fallback={<p>Chart unavailable</p>}>
    <Chart />
  </ErrorBoundary>
</App>`,
            answer: "Header and the rest of the app stay visible; only the boundary's area shows \"Chart unavailable\". Some think the whole app crashes. A strong answer explains only the nearest boundary's subtree is replaced.",
          },
          {
            task: "Fix the class error boundary. It never shows its fallback.",
            description: "Checks the class boundary API. Ask why the fallback never shows.",
            code: `class Boundary extends React.Component {
  state = { error: null };
  componentDidCatch(error) { console.error(error); }
  render() { return this.state.error ? <p>Oops</p> : this.props.children; }
}`,
            answer: "Nothing sets error state. Add static getDerivedStateFromError to switch to the fallback. Weak answers call setState in componentDidCatch, which works but is the legacy path. A strong answer uses getDerivedStateFromError for rendering and componentDidCatch for logging.",
            solution: `static getDerivedStateFromError(error) {
  return { error };
}`,
          },
        ],
      },
      {
        q: "Fix the error boundary setup. A crash in one widget must not make the whole page blank.",
        code: `<ErrorBoundary fallback={<p>Something went wrong</p>}>
  <Header />
  <SalesChart />
  <OrdersTable />
</ErrorBoundary>`,
        short: "A single boundary replaces everything inside it, including healthy widgets. Wrap independent widgets in their own boundaries so failures stay isolated.",
        long: `The nearest boundary above the throwing component renders its fallback instead of its entire subtree.
Header and OrdersTable disappear even though only SalesChart failed.
Give each independent area its own boundary with a context-specific fallback; keep a route/root boundary as a safety net.
Strong answer balances granularity: too many boundaries create fragmented UI.`,
        fix: `<>
  <Header />
  <ErrorBoundary fallback={<p>Chart unavailable</p>}><SalesChart /></ErrorBoundary>
  <ErrorBoundary fallback={<p>Orders failed to load</p>}><OrdersTable /></ErrorBoundary>
</>`,
        exercises: [
          {
            task: "Use react-error-boundary to show a fallback with a retry button.",
            description: "Checks recovery basics. Ask for FallbackComponent usage.",
            answer: "FallbackComponent receives error and resetErrorBoundary; calling reset re-renders children. A strong answer avoids showing raw error messages to users.",
            solution: `function Fallback({ resetErrorBoundary }) {
  return <div role="alert"><p>Widget failed.</p><button onClick={resetErrorBoundary}>Retry</button></div>;
}
<ErrorBoundary FallbackComponent={Fallback}><SalesChart /></ErrorBoundary>`,
          },
          {
            task: "There is no error boundary at all, and a component throws. What happens?",
            description: "Checks default behavior. Ask what users see.",
            answer: "React unmounts the whole root, leaving a blank page, and logs the error. Weak answers expect only that component to disappear. A strong answer mentions root error callbacks for logging.",
          },
        ],
      },
    ],
    middle: [
      {
        q: "Which errors do Error Boundaries not catch?",
        short: "Errors in event handlers, async code (setTimeout, promises), server-side rendering, and errors thrown in the boundary itself.",
        long: `Boundaries hook into the render/commit process; code running outside it (handlers, timers, fetch callbacks) isn't covered.
Handle those with try/catch and state, or forward them to a boundary (showBoundary or throwing during render).
SSR errors are handled by the server framework (e.g. Next.js error.tsx and onError in renderToPipeableStream).
A boundary can't catch its own errors — the next boundary up does.
React 19: errors in transitions/actions do reach boundaries; root options onCaughtError/onUncaughtError help logging.
Strong answer shows how to bridge async errors into boundaries.`,
        exercises: [
          {
            task: "Predict whether the boundary catches this error.",
            description: "Checks what boundaries cannot catch. Ask whether this timer error reaches the boundary.",
            code: `function Widget() {
  useEffect(() => { setTimeout(() => { throw new Error("boom"); }, 0); }, []);
  return <p>ok</p>;
}`,
            answer: "No: the throw happens in a timer callback outside React's render/commit, so it goes to window.onerror and the widget keeps showing \"ok\". Many say yes because it is inside the component. A strong answer explains it runs outside render and lands in window.onerror.",
          },
          {
            task: "Build a hook that sends async errors to the nearest boundary. Do not use a library.",
            description: "Checks bridging async errors into render. Ask for a library-free hook.",
            answer: "Throwing inside a state updater rethrows during render, where boundaries can catch it. Weak answers use useState plus a separate throw, which works but is clunkier. A strong answer explains the updater runs during render, so the throw is caught.",
            solution: `function useThrowAsync() {
  const [, setState] = useState();
  return useCallback(err => setState(() => { throw err; }), []);
}`,
          },
        ],
      },
      {
        q: "Fix this data component. Errors should reach the boundary. Loading should be handled in a declarative way.",
        code: `function Orders() {
  const { data, error } = useQuery({ queryKey: ["orders"], queryFn: api.orders });
  if (error) console.error(error);
  return data.map(o => <OrderRow key={o.id} order={o} />);
}`,
        short: "It crashes on undefined data while loading and swallows errors in the console. Use useSuspenseQuery inside Suspense + ErrorBoundary, or handle isPending/error explicitly.",
        long: `data is undefined on first render, so data.map throws a TypeError (accidentally caught by a boundary, with a misleading error).
Logging the error does not inform the user.
useSuspenseQuery guarantees data is defined and throws errors to the nearest boundary.
Alternatively keep useQuery and render loading/error states, or set throwOnError.
Strong answer pairs it with QueryErrorResetBoundary for retry.`,
        fix: `function Orders() {
  const { data } = useSuspenseQuery({ queryKey: ["orders"], queryFn: api.orders });
  return data.map(o => <OrderRow key={o.id} order={o} />);
}
<ErrorBoundary fallback={<p>Could not load orders.</p>}>
  <Suspense fallback={<Spinner />}><Orders /></Suspense>
</ErrorBoundary>`,
        exercises: [
          {
            task: "Send only 500-range errors to the boundary. Show 404 errors inline on the page.",
            description: "Checks selective error propagation. Ask for throwOnError usage.",
            answer: "throwOnError accepts a function; return true for server errors only. 404 can render an empty state. A strong answer aligns with the error taxonomy.",
            solution: "useQuery({ queryKey: [\"order\", id], queryFn: () => api.order(id), throwOnError: err => err.status >= 500 });",
          },
          {
            task: "In the original code, what does the boundary show while loading?",
            description: "Checks misleading errors. Ask what error is reported.",
            answer: "The boundary catches \"Cannot read properties of undefined (reading 'map')\" on the first render, hiding the real situation (still loading). Monitoring shows a TypeError instead of the API issue. A strong answer fixes the loading state explicitly.",
          },
        ],
      },
    ],
    senior: [
      {
        q: "Where would you put error boundaries in an app? How can users recover, for example with retry or reset?",
        short: "Place them at the root, per route and around independent widgets; recover with resetKeys/onReset (e.g. reset on navigation) and QueryErrorResetBoundary to refetch, reporting to Sentry with context.",
        long: `Root boundary: last-resort fatal page. Route boundary: keeps nav usable. Widget boundary: isolates charts/third-party embeds.
Too granular = noisy UI; too coarse = whole page lost.
Recovery: react-error-boundary's resetErrorBoundary + resetKeys (e.g. location.pathname) so navigating away clears the error.
With TanStack Query, wrap in QueryErrorResetBoundary so retry refetches failed queries (throwOnError / useSuspenseQuery).
Report with componentStack, route, user id (no PII), release version.
Strong answer distinguishes retryable errors from bugs and avoids retry loops.`,
        exercises: [
          {
            task: "Fix the retry button. It shows the error again right away.",
            description: "Checks recovery with cached query errors. Ask why Retry fails again instantly.",
            code: `<ErrorBoundary fallbackRender={({ resetErrorBoundary }) => <button onClick={resetErrorBoundary}>Retry</button>}>
  <Suspense fallback={<Spinner />}><Dashboard /></Suspense>
</ErrorBoundary> // Dashboard uses useSuspenseQuery`,
            answer: "The failed query stays cached in error state, so remounting rethrows. Wrap with QueryErrorResetBoundary and pass reset to onReset. Many think resetErrorBoundary refetches automatically. A strong answer resets the query error state via QueryErrorResetBoundary.",
            solution: `<QueryErrorResetBoundary>{({ reset }) => (
  <ErrorBoundary onReset={reset} fallbackRender={({ resetErrorBoundary }) => <button onClick={resetErrorBoundary}>Retry</button>}>
    <Suspense fallback={<Spinner />}><Dashboard /></Suspense>
  </ErrorBoundary>
)}</QueryErrorResetBoundary>`,
          },
          {
            task: "After a deploy, lazy routes can fail to load their code. Add recovery for this error.",
            description: "Checks deploy-time chunk errors. Ask how to recover gracefully.",
            answer: "Old clients request deleted chunks; detect the import failure and reload once (guarding against loops) so the new manifest is fetched. Weak answers show a generic error. A strong answer reloads once with a loop guard and mentions keeping old chunks available for a while.",
            solution: `const lazyWithReload = factory => lazy(() => factory().catch(err => {
  if (!sessionStorage.getItem("reloaded")) {
    sessionStorage.setItem("reloaded", "1");
    location.reload();
  }
  throw err;
}));`,
          },
        ],
      },
      {
        q: "How do you design error logging for a React app? Errors should be useful, not noise.",
        short: "Capture errors centrally (root onUncaughtError/onCaughtError, boundaries, unhandledrejection), enrich them with release, route, component stack and user context, upload source maps, group and filter noise, and alert on rates for critical flows.",
        long: `React 19 createRoot options: onCaughtError (boundary caught), onUncaughtError, onRecoverableError (hydration recovery).
Add release/version, route, feature flags and anonymized user id; never send PII or tokens.
Upload source maps privately so stacks are readable.
Filter extension and third-party script errors; dedupe by fingerprint.
Correlate frontend errors with backend traces via request ids.
Strong answer defines ownership per error group and an SLO for error-free sessions.`,
        exercises: [
          {
            task: "Add error reporting at the root level in React 19.",
            description: "Checks new root options. Ask for createRoot configuration.",
            answer: "onUncaughtError and onCaughtError receive the error and errorInfo with componentStack. A strong answer also handles onRecoverableError for hydration issues.",
            solution: `createRoot(el, {
  onUncaughtError: (error, info) => report(error, { stack: info.componentStack, fatal: true }),
  onCaughtError: (error, info) => report(error, { stack: info.componentStack }),
  onRecoverableError: (error) => report(error, { level: "warning" }),
}).render(<App />);`,
          },
          {
            task: "Which of these errors should wake up the on-call engineer? A ResizeObserver loop warning. A spike of 500 errors from the checkout API. An error from a browser extension. Code chunks failing to load after a deploy.",
            description: "Checks triage judgment. Ask for a decision per item.",
            answer: "Page: checkout 500 spike, and chunk failures if they exceed a threshold after deploy. Ignore/filter: ResizeObserver warning and extension errors. A strong answer bases paging on user impact.",
          },
        ],
      },
    ],
    techlead: [
      {
        q: "Tell me about a production incident caused by a frontend error. What did you change in your process after it?",
        ai: true,
        short: "A strong answer describes a specific incident, your role, detection and mitigation, a blameless postmortem, and concrete preventive changes that stuck.",
        long: `Look for structure: impact (users, revenue, duration), detection (alert vs customer report), mitigation (rollback, flag off), root cause.
Preventive actions should be concrete: error boundary added, monitoring/alerts, contract tests, feature flags, canary releases.
Ownership without blame; how the team learned, not who failed.
Follow-ups: what would you do differently, how did you measure the fix worked?
Weak answer: generic, no numbers, "we fixed the bug". Strong answer: specific timeline, trade-offs, and a process change still in use.`,
        exercises: [
          {
            task: "A null field from the API crashed the checkout page for 40 minutes. Write the action items for the postmortem.",
            description: "Checks postmortem quality. Ask for concrete action items.",
            answer: "Add a route/widget boundary around checkout, runtime-validate API responses at the boundary (zod), alert on error-rate spikes per route, add contract tests with the backend and a feature-flag kill switch; assign owners and due dates. Weak answers say \"add null checks\". A strong answer addresses detection, containment, prevention and ownership.",
          },
          {
            task: "Define alert rules for frontend errors. Avoid too many alerts, but do not miss real incidents.",
            description: "Checks alerting design. Ask for rules balancing noise and coverage.",
            answer: "Group by fingerprint and release, alert on rate changes per route/user percentage rather than raw counts, filter known third-party/extension noise, and page only for core flows (login, checkout) while others go to a triage queue. Raw count alerts page people for noise. A strong answer uses rates, grouping, release tracking and severity by business flow.",
          },
        ],
      },
      {
        q: "One backend service is down. The dashboard should still work. Build this resilience pattern.",
        ai: true,
        code: `function Dashboard() {
  const { data: stats } = useSuspenseQuery(statsQuery);
  const { data: alerts } = useSuspenseQuery(alertsQuery); // alerts service is flaky
  return <><Stats data={stats} /><Alerts data={alerts} /></>;
}`,
        short: "Both queries suspend and fail together, so one flaky service takes down the dashboard. Split widgets into separate Suspense + ErrorBoundary units, use sensible retries/timeouts, show degraded states, and track the dependency's availability.",
        long: `Colocate each query with its widget so failures and loading are isolated.
Wrap each widget in its own ErrorBoundary + Suspense with a degraded fallback ("Alerts unavailable, retry").
Configure retry with backoff and a timeout; avoid retry storms.
Optionally show stale cached data with a warning instead of an error.
Product decision: which widgets are critical (block page) vs optional (degrade).
Strong answer turns this into a standard pattern (widget shell) and monitors per-dependency error rates.`,
        fix: `function AlertsWidget() {
  const { data } = useSuspenseQuery({ ...alertsQuery, retry: 2 });
  return <Alerts data={data} />;
}
function Widget({ title, children }) {
  return (
    <QueryErrorResetBoundary>{({ reset }) => (
      <ErrorBoundary onReset={reset} fallbackRender={({ resetErrorBoundary }) => (
        <p>{title} unavailable. <button onClick={resetErrorBoundary}>Retry</button></p>
      )}>
        <Suspense fallback={<Skeleton />}>{children}</Suspense>
      </ErrorBoundary>
    )}</QueryErrorResetBoundary>
  );
}
<><Widget title="Stats"><StatsWidget /></Widget><Widget title="Alerts"><AlertsWidget /></Widget></>`,
        exercises: [
          {
            task: "Which dashboard widgets should block the page, and which should just show less? How do you agree on it with the product team?",
            description: "Checks product-engineering alignment. Ask for criteria and process.",
            answer: "Critical widgets are those without which the page's primary task fails; others degrade. Agree via a short matrix reviewed with product and design, and encode it in the widget shell API. A strong answer includes copy for degraded states.",
          },
          {
            task: "The alerts service returns a 500 error. What does the original code do?",
            description: "Checks Suspense error propagation. Ask what the user sees.",
            answer: "After retries, the error propagates to the nearest boundary above Dashboard, so stats disappear too. A strong answer notes retries also delay the whole page.",
          },
        ],
      },
    ],
  },
  "Advanced Hooks (e.g useLayoutEffect, useImperativeHandle)": {
    junior: [
      {
        q: "What is useRef used for?",
        short: "useRef holds a mutable value that persists across renders without causing re-renders — commonly a DOM node reference or an instance variable like a timer id.",
        long: `useRef returns { current } that is the same object for the component's lifetime.
Changing ref.current does not trigger a render, so don't use it for values shown in UI.
DOM refs: <input ref={inputRef} /> then inputRef.current.focus() in an effect or handler.
Don't read/write ref.current during render (except lazy init) — it breaks purity.
React 19: ref is a normal prop for function components (no forwardRef needed) and ref callbacks can return a cleanup.
Strong answer contrasts ref vs state vs a module variable.`,
        exercises: [
          {
            task: "You click the button three times. What does the UI show?",
            description: "Checks ref vs state. Ask what label shows after clicks.",
            code: `function Clicks() {
  const count = useRef(0);
  return <button onClick={() => { count.current++; }}>Clicked {count.current}</button>;
}`,
            answer: "It still shows \"Clicked 0\": mutating a ref does not trigger a re-render. Use state for values displayed in the UI. Some say 3. A strong answer explains refs do not trigger renders and should hold non-visual values.",
          },
          {
            task: "Focus the input when the component mounts.",
            description: "Checks DOM refs. Ask for mount-time focus.",
            answer: "Attach a ref and focus it in an effect (or use the autoFocus attribute). Weak answers call focus during render. A strong answer uses an effect or autoFocus and considers a11y of stealing focus.",
            solution: `function Search() {
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return <input ref={ref} />;
}`,
          },
        ],
      },
      {
        q: "Fix the bug. The input does not get focus when edit mode opens.",
        code: `function Title({ editing }) {
  const ref = useRef(null);
  if (editing) ref.current.focus();
  return editing ? <input ref={ref} /> : <h1>Title</h1>;
}`,
        short: "During render the input is not mounted yet (ref.current is null) and side effects in render are not allowed. Focus in an effect after commit, or use a ref callback.",
        long: `Refs are attached during commit, after render; in render ref.current is still null or stale.
Accessing the DOM in render also breaks purity.
Use useEffect(() => { if (editing) ref.current?.focus(); }, [editing]).
React 19 ref callbacks can focus on attach and return a cleanup.
Strong answer knows when refs are set relative to render, commit and effects.`,
        fix: `function Title({ editing }) {
  const ref = useRef(null);
  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);
  return editing ? <input ref={ref} /> : <h1>Title</h1>;
}`,
        exercises: [
          {
            task: "Set focus with a ref callback instead of an effect.",
            description: "Checks ref callbacks. Ask for a one-line solution.",
            answer: "A ref callback runs when the node attaches; focusing there is immediate. In React 19 it can return a cleanup. Weak answers create an inline callback that re-runs every render without realizing it.",
            solution: "<input ref={node => { node?.focus(); }} />",
          },
          {
            task: "What is the value of ref dot current during the first render?",
            description: "Checks ref timing. Ask what is logged.",
            code: `const ref = useRef(null);
console.log(ref.current);
return <div ref={ref} />;`,
            answer: "It logs null: the DOM node is attached during commit, after render. Inside useEffect or useLayoutEffect it is available. A strong answer explains the render vs commit phases.",
          },
        ],
      },
    ],
    middle: [
      {
        q: "Write a custom hook called useDebouncedValue. It takes a value and a delay in milliseconds.",
        short: "Store the debounced value in state and update it from a timeout in an effect, clearing the timeout in cleanup whenever value or delay change.",
        long: `Custom hooks are functions starting with "use" that compose other hooks; each call has its own state.
The cleanup cancels the pending timeout so only the last value within ms is committed.
Include both v and ms in dependencies.
Alternative: useDeferredValue for rendering priority (not time-based), or debounce the callback instead of the value.
Pitfall: creating a lodash debounce inside render without memoization — new instance each render.
Strong answer knows when to debounce values vs callbacks and tests with fake timers.`,
        fix: `function useDebouncedValue(v, ms) {
  const [d, setD] = useState(v);
  useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t); }, [v, ms]);
  return d;
}`,
        exercises: [
          {
            task: "Write a usePrevious hook. It returns the last value that was different from the current one.",
            description: "Checks custom hook design under React rules. Ask for usePrevious.",
            answer: "Store the value in state and compare during render; this avoids reading ref.current during render, which React's rules discourage. The classic ref-in-effect version reads ref.current during render, which React Compiler flags. A strong answer knows that trade-off.",
            solution: `function usePrevious(value) {
  const [curr, setCurr] = useState(value);
  const [prev, setPrev] = useState(undefined);
  if (!Object.is(value, curr)) {
    setPrev(curr);
    setCurr(value);
  }
  return prev;
}`,
          },
          {
            task: "Fix the custom hook. It subscribes again on every render.",
            description: "Checks the latest-ref pattern. Ask why listeners churn.",
            code: `function useWindowEvent(name, handler) {
  useEffect(() => {
    window.addEventListener(name, handler);
    return () => window.removeEventListener(name, handler);
  }, [name, handler]); // callers pass inline arrows
}`,
            answer: "Inline handlers change every render. Keep the latest handler in a ref updated in a layout effect, and subscribe only when name changes. Weak answers require callers to useCallback. A strong answer handles it inside the hook and mentions useEffectEvent as the modern alternative.",
            solution: `function useWindowEvent(name, handler) {
  const ref = useRef(handler);
  useLayoutEffect(() => { ref.current = handler; });
  useEffect(() => {
    const fn = e => ref.current(e);
    window.addEventListener(name, fn);
    return () => window.removeEventListener(name, fn);
  }, [name]);
}`,
          },
        ],
      },
      {
        q: "What makes a custom hook good? How do you design its API? How do you test it?",
        short: "A good custom hook encapsulates one reusable stateful behavior, follows the Rules of Hooks, returns a small stable API (tuple for simple, object for many values), avoids hidden global side effects, and is tested with renderHook and fake timers.",
        long: `Name it use* and extract logic, not markup.
Each call has independent state; share state only via context or external stores.
Return stable functions (useCallback) when consumers may pass them to deps or memoized children.
Accept options objects for extensibility but avoid object deps causing re-subscription (destructure primitives).
Test via @testing-library/react renderHook, act and fake timers; test behavior, not internals.
Strong answer warns against "hooks that just wrap useEffect" and knows custom hooks share logic, not state.`,
        exercises: [
          {
            task: "Write a useToggle hook. The toggle function must stay the same between renders.",
            description: "Checks hook API design. Ask for [value, toggle, set].",
            answer: "Use useCallback with the updater form so toggle never changes identity. A strong answer explains why stability matters for memoized consumers.",
            solution: `function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = useCallback(() => setOn(v => !v), []);
  return [on, toggle, setOn];
}`,
          },
          {
            task: "Write a test for useDebouncedValue. Use fake timers.",
            description: "Checks hook testing. Ask for a renderHook test.",
            answer: "Rerender with a new value, advance timers inside act, and assert the debounced value updated only after the delay. Weak answers use real timeouts and make tests slow and flaky.",
            solution: `vi.useFakeTimers();
const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 300), { initialProps: { v: "a" } });
rerender({ v: "ab" });
expect(result.current).toBe("a");
act(() => vi.advanceTimersByTime(300));
expect(result.current).toBe("ab");`,
          },
        ],
      },
    ],
    senior: [
      {
        q: "The tooltip shows in the wrong place for one frame. Why? How do you fix it?",
        code: `useEffect(() => {
  const r = anchorRef.current.getBoundingClientRect();
  setPos({ top: r.bottom, left: r.left });
}, []);`,
        short: "useEffect runs after the browser paints, so the first frame shows the default position. useLayoutEffect runs after DOM mutation but before paint, so the measured position is applied without a flicker.",
        long: `useLayoutEffect fires synchronously after commit; state updates inside it re-render before the browser paints.
Use it for measuring layout (size/position), scroll restoration, or synchronously adjusting the DOM.
It blocks paint, so keep it cheap; it doesn't run on the server (use useEffect or render client-only).
Related hooks: useImperativeHandle to expose a limited API from a child; useSyncExternalStore to subscribe to external stores safely with concurrent rendering; useInsertionEffect for CSS-in-JS libraries.
Strong answer explains the render -> commit -> layout effects -> paint -> effects order.`,
        fix: `useLayoutEffect(() => {
  const r = anchorRef.current.getBoundingClientRect();
  setPos({ top: r.bottom, left: r.left });
}, []);`,
        exercises: [
          {
            task: "Update this forwardRef component to React 19. Expose only the focus and clear methods.",
            description: "Checks React 19 ref-as-prop and imperative handles. Ask for the refactor.",
            code: "const Input = forwardRef((props, ref) => <input ref={ref} {...props} />);",
            answer: "In React 19 ref is a regular prop; useImperativeHandle limits the exposed API instead of leaking the DOM node. Many keep forwardRef out of habit. A strong answer limits the exposed API and notes forwardRef is deprecated going forward.",
            solution: `function Input({ ref, ...props }) {
  const inner = useRef(null);
  useImperativeHandle(ref, () => ({
    focus: () => inner.current.focus(),
    clear: () => { inner.current.value = ""; },
  }), []);
  return <input ref={inner} {...props} />;
}`,
          },
          {
            task: "Fix this useSyncExternalStore code. It shows the warning \"getSnapshot should be cached\" and runs in an infinite loop.",
            description: "Checks getSnapshot caching. Ask why the component loops.",
            code: "useSyncExternalStore(store.subscribe, () => ({ ...store.getState() }));",
            answer: "getSnapshot returns a new object each call, so React thinks it always changed. Return the stored reference or a primitive. Weak answers add useMemo around the hook call. A strong answer returns stable references from getSnapshot.",
            solution: "useSyncExternalStore(store.subscribe, () => store.getState().user);",
          },
        ],
      },
      {
        q: "What problems do useTransition, useDeferredValue, and useId solve? When do you use each one?",
        short: "useTransition marks state updates as non-urgent so urgent input stays responsive and gives isPending; useDeferredValue defers a value derived from urgent state; useId generates stable unique ids that match between server and client for accessibility attributes.",
        long: `Transitions are interruptible renders; React keeps showing old UI instead of a Suspense fallback.
useTransition: you own the state update (tab switch, filter change); React 19 supports async functions in startTransition (actions).
useDeferredValue: you receive a value from props/urgent state and want a lagging copy for expensive rendering; React 19 adds an initialValue argument.
useId: SSR-safe ids for label/aria wiring; never use it for list keys.
None of these reduce work by themselves; they schedule it.
Strong answer contrasts with debounce and explains why the deferred consumer must be memoized.`,
        exercises: [
          {
            task: "Fix how the label is linked to the input. It must work with many instances and with server rendering.",
            description: "Checks useId. Present a hardcoded id.",
            code: `function Field({ label }) {
  return <><label htmlFor="field">{label}</label><input id="field" /></>;
}`,
            answer: "Hardcoded ids collide when the component renders twice, and Math.random breaks hydration. useId gives a unique, hydration-safe id. A strong answer derives multiple ids from one useId call.",
            solution: `function Field({ label }) {
  const id = useId();
  return <><label htmlFor={id}>{label}</label><input id={id} /></>;
}`,
          },
          {
            task: "The user switches to a tab. Its content suspends. What does the user see with startTransition, and without it?",
            description: "Checks transitions with Suspense. Ask for both cases.",
            answer: "Without a transition, the nearest Suspense fallback replaces the current tab content. With startTransition, the old tab stays visible (isPending true) until the new one is ready. A strong answer explains React avoids hiding already-revealed content in transitions.",
          },
        ],
      },
    ],
    techlead: [
      {
        q: "From React 19 and React Compiler, what would you use now? How would you upgrade a large app?",
        ai: true,
        short: "Upgrade to 18.3 first to surface deprecation warnings, run codemods, fix StrictMode issues, then roll out React 19 and the Compiler incrementally per directory with tests and performance monitoring.",
        long: `React 18.3 logs warnings for APIs removed in 19 (string refs, propTypes/defaultProps on function components, legacy context, ReactDOM.render).
Run the official react-codemod / types-react-codemod; check third-party library compatibility.
Adopt valuable features: actions/useActionState, useOptimistic, ref as prop, use(), document metadata.
React Compiler: enable via babel plugin with eslint rules first, opt-in by directory ("use memo"/sources config), compare perf and correctness.
Code that breaks Rules of React (mutating props, reading refs in render) must be fixed first.
Strong answer has a phased plan, rollback strategy and real experience of what broke.`,
        exercises: [
          {
            task: "Which code patterns stop React Compiler from optimizing a component? How do you find them in a large codebase?",
            description: "Checks Compiler readiness at scale. Ask which patterns block it and how to find them.",
            answer: "Mutating props/state, reading or writing refs during render, side effects in render and conditional hooks. Run eslint-plugin-react-hooks compiler rules across the repo to get a list, fix or annotate with \"use no memo\", then enable directory by directory. Weak answers say the compiler fixes everything. A strong answer uses lint diagnostics and incremental opt-in.",
          },
          {
            task: "Fix this component so it works safely with React Compiler.",
            description: "Checks render purity. Ask what is wrong and fix it.",
            code: `function Total({ items }) {
  items.sort((a, b) => a.price - b.price);
  return <p>{items[0]?.price}</p>;
}`,
            answer: "It mutates a prop during render, breaking purity (and the compiler's memoization assumptions). Copy before sorting. Many miss that sort mutates in place. A strong answer uses toSorted or a copy and explains purity enables memoization.",
            solution: `function Total({ items }) {
  const sorted = items.toSorted((a, b) => a.price - b.price);
  return <p>{sorted[0]?.price}</p>;
}`,
          },
        ],
      },
      {
        q: "Write a shared useMediaQuery hook for the design system. It must be safe for server rendering and must not tear.",
        ai: true,
        code: `export function useMediaQuery(q) {
  const [match, setMatch] = useState(window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    m.onchange = e => setMatch(e.matches);
  }, []);
  return match;
}`,
        short: "It crashes on the server (window), ignores query changes, never cleans up, and overwrites onchange so multiple users conflict. Use useSyncExternalStore with addEventListener, a server snapshot, and q-aware subscription.",
        long: `Accessing window during render breaks SSR; useSyncExternalStore's getServerSnapshot provides a safe default.
onchange assignment allows only one listener; use addEventListener and remove it in cleanup.
Missing q in deps means a changed query is never observed.
useSyncExternalStore prevents tearing in concurrent rendering.
Design-system concern: document the SSR default and prefer CSS media queries where possible to avoid layout shift.
Strong answer discusses hydration mismatch trade-offs and testing with mocked matchMedia.`,
        fix: `export function useMediaQuery(q, serverDefault = false) {
  const subscribe = useCallback(cb => {
    const m = window.matchMedia(q);
    m.addEventListener("change", cb);
    return () => m.removeEventListener("change", cb);
  }, [q]);
  return useSyncExternalStore(subscribe, () => window.matchMedia(q).matches, () => serverDefault);
}`,
        exercises: [
          {
            task: "Write a guideline. When should teams use the useMediaQuery hook, and when CSS media queries?",
            description: "Checks design-system judgment. Ask for a rule of thumb.",
            answer: "Use CSS for pure layout/styling changes (no JS, no hydration flicker); use the hook only when behavior or rendered structure must differ. A strong answer mentions container queries and SSR layout shift.",
          },
          {
            task: "Write a test for the hook. Mock matchMedia in it.",
            description: "Checks testing browser APIs. Ask for a minimal mock.",
            answer: "Provide a fake matchMedia with addEventListener that the test can trigger, then assert the hook updates. A strong answer wraps the trigger in act.",
            solution: `let listener; let matches = false;
window.matchMedia = () => ({ get matches() { return matches; }, addEventListener: (_, l) => { listener = l; }, removeEventListener() {} });
const { result } = renderHook(() => useMediaQuery("(min-width: 600px)"));
act(() => { matches = true; listener(); });
expect(result.current).toBe(true);`,
          },
        ],
      },
    ],
  },
  "Server side rendering as a concept and/or deeper knowledge (native and/or Next.js)": {
    junior: [
      {
        q: "What is the difference between server-side rendering and client-side rendering? Why would you use server-side rendering?",
        short: "SSR renders HTML on the server so the user sees content before JS loads and crawlers get full markup; CSR ships an empty shell and renders in the browser.",
        long: `SSR: server runs React to HTML, browser shows it, then hydration attaches event handlers.
Benefits: faster first contentful paint, SEO, link previews, works on slow devices.
Costs: server infrastructure, time-to-interactive still depends on JS, hydration bugs.
CSR: simple static hosting, good for authenticated dashboards.
Related: SSG (build time), ISR (revalidated static), streaming SSR.
Strong answer picks per page based on SEO, data freshness and personalization.`,
        exercises: [
          {
            task: "A search crawler does not run JavaScript. What does it see in an app that renders only on the client?",
            description: "Checks CSR SEO limitations. Ask what a no-JS crawler indexes.",
            code: "<body><div id=\"root\"></div><script src=\"/main.js\"></script></body>",
            answer: "An empty div: no content, title or meta tags, which hurts SEO and link previews. SSR/SSG would send the rendered HTML. Some say Google runs JS so it does not matter. A strong answer mentions other crawlers, link previews and render delays.",
          },
          {
            task: "Fix the client entry for a server-rendered page. React should attach to the existing HTML, not render it again.",
            description: "Checks hydration entry. Ask what is wrong with createRoot here.",
            code: "createRoot(document.getElementById(\"root\")).render(<App />);",
            answer: "createRoot discards the server markup; hydrateRoot reuses it and attaches handlers. Weak answers say both are equivalent. A strong answer explains hydrateRoot reuses markup and requires matching output.",
            solution: "hydrateRoot(document.getElementById(\"root\"), <App />);",
          },
        ],
      },
      {
        q: "Fix this server rendering entry. The user should see content early, not an empty page while JavaScript loads.",
        code: `// server.js
app.get("*", (req, res) => {
  res.send('<div id="root"></div><script src="/main.js"></script>');
});
// client.js
createRoot(document.getElementById("root")).render(<App />);`,
        short: "The server sends an empty shell, so this is still CSR. Render the app to HTML on the server (renderToPipeableStream) and hydrate it on the client with hydrateRoot.",
        long: `SSR means the server runs React and sends real markup.
renderToPipeableStream streams HTML and supports Suspense; onShellReady starts the response early.
The client must use hydrateRoot with the same tree to attach handlers without re-creating DOM.
Pass the URL to a router on the server (StaticRouter / createStaticHandler) and serialize initial data.
Strong answer mentions handling errors (onShellError) and status codes.`,
        fix: `// server.js
app.get("*", (req, res) => {
  const { pipe } = renderToPipeableStream(<App url={req.url} />, {
    bootstrapScripts: ["/main.js"],
    onShellReady() { res.setHeader("Content-Type", "text/html"); pipe(res); },
    onShellError() { res.status(500).send("Error"); },
  });
});
// client.js
hydrateRoot(document.getElementById("root"), <App url={location.pathname} />);`,
        exercises: [
          {
            task: "On a server-rendered page, do buttons work before main dot js loads?",
            description: "Checks hydration basics. Ask what happens when the user clicks early.",
            answer: "The HTML is visible but handlers are not attached until hydration, so clicks do nothing (React 18+ replays some discrete events after hydration). A strong answer mentions selective hydration prioritizing interacted areas.",
          },
          {
            task: "Choose server rendering, static generation, or client rendering for each page. A marketing home page. An analytics dashboard for logged-in users. Product pages that update every hour.",
            description: "Checks rendering strategy choice. Ask for a choice per page.",
            answer: "Homepage: SSG. Dashboard: CSR or SSR without caching (personalized, no SEO). Product pages: ISR/SSG with revalidation or cached SSR. A strong answer considers freshness, personalization and infra.",
          },
        ],
      },
    ],
    middle: [
      {
        q: "Why do you get a hydration mismatch error here?",
        code: `<p>{new Date().toLocaleTimeString()}</p>
{typeof window !== 'undefined' && <Ad />}`,
        short: "Server and client render different markup: the time differs and window is undefined on the server. Render client-only content after mount, and use suppressHydrationWarning only for unavoidable text like timestamps.",
        long: `Hydration expects the first client render to produce exactly the server HTML.
Non-deterministic values (Date, Math.random, locale/timezone) and environment checks during render break that.
React 18/19 recovers by client-rendering the mismatched boundary and logs an error — it's costly and can cause flicker.
Fix: useEffect + mounted state for client-only UI, next/dynamic with ssr: false, or pass the time from the server.
suppressHydrationWarning works one level deep for text content only.
Strong answer also mentions invalid HTML nesting (div inside p) and browser extensions as causes.`,
        fix: `function ClientOnly({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? children : null;
}

<p suppressHydrationWarning>{new Date().toLocaleTimeString()}</p>
<ClientOnly><Ad /></ClientOnly>`,
        exercises: [
          {
            task: "Fix the hydration error. It is caused by HTML tags nested in a wrong way.",
            description: "Checks invalid HTML nesting as a mismatch cause. Ask why hydration fails.",
            code: "<p>Price: <div className=\"amount\">{price}</div></p>",
            answer: "The browser auto-closes <p> before a <div>, so the DOM differs from React's tree. Use an inline element. Many look for dates or random values. A strong answer explains the HTML parser rewrites invalid nesting.",
            solution: "<p>Price: <span className=\"amount\">{price}</span></p>",
          },
          {
            task: "Fix the theme toggle. It causes a mismatch because it reads localStorage during render.",
            description: "Checks environment-dependent render. Ask how to fix the theme mismatch.",
            code: "const [theme] = useState(() => localStorage.getItem(\"theme\") ?? \"light\");",
            answer: "localStorage does not exist on the server and differs on the client. Render a server-safe default and sync after mount, or store the theme in a cookie readable by the server. Weak answers add typeof window checks in render, which still mismatch. A strong answer uses mount effects or cookies and mentions flash-of-wrong-theme inline scripts.",
            solution: `const [theme, setTheme] = useState("light");
useEffect(() => { setTheme(localStorage.getItem("theme") ?? "light"); }, []);`,
          },
        ],
      },
      {
        q: "What is streaming server rendering with Suspense? What is selective hydration?",
        short: "Streaming SSR sends the HTML shell immediately and streams Suspense boundaries' content as data resolves; selective hydration hydrates boundaries independently and prioritizes the ones the user interacts with.",
        long: `Old SSR (renderToString) waited for all data and hydrated the whole tree at once.
With renderToPipeableStream / renderToReadableStream, the shell plus fallbacks go out first; resolved content arrives later as HTML + inline script that swaps it in.
Hydration runs per Suspense boundary; clicking an unhydrated area makes React hydrate it first.
Place boundaries around slow data, not around everything.
Headers/status must be decided before the shell is flushed.
Strong answer connects this to TTFB, LCP and Next.js loading.tsx.`,
        exercises: [
          {
            task: "Build a page where the comments stream in after the main article.",
            description: "Checks Suspense placement for streaming. Ask for the component structure.",
            answer: "Wrap the slow part in Suspense so the article is in the shell and comments stream later. Weak answers wrap the whole page, delaying everything. A strong answer uses a skeleton fallback with stable dimensions.",
            solution: `export default function Post() {
  return (
    <>
      <Article />
      <Suspense fallback={<CommentsSkeleton />}>
        <Comments />
      </Suspense>
    </>
  );
}`,
          },
          {
            task: "The page shell is already sent. Then a component throws. What is the HTTP status?",
            description: "Checks streaming constraints. Ask what the client receives.",
            answer: "The status was already sent (usually 200) and cannot change; React renders the nearest Suspense fallback on the server and retries on the client. Weak answers expect a 500. A strong answer moves critical data checks before the shell (e.g. 404 in loaders).",
          },
        ],
      },
    ],
    senior: [
      {
        q: "Compare React Server Components and server-side rendering. What problems do they solve? What do they cost?",
        short: "SSR renders client components to HTML for the first load but still ships and hydrates all their JS; RSC run only on the server, send no JS for themselves and can access data directly, with client components opted in via \"use client\".",
        long: `RSC output is a serialized tree streamed to the client; it can be combined with SSR to produce HTML.
Benefits: smaller bundles (heavy libs stay on server), direct DB/API access, no client waterfalls, streaming with Suspense.
Server Components can't use state, effects or browser APIs; props to client components must be serializable.
Server Functions ("use server") handle mutations; must validate input and check auth — they are public endpoints.
Costs: mental model complexity, caching semantics, framework coupling (Next.js App Router), tooling maturity.
Strong answer knows where to draw the "use client" boundary (leaves) and the security implications.`,
        exercises: [
          {
            task: "Fix the error. A Server Component passes a function to a Client Component.",
            description: "Checks RSC serialization rules. Ask why the prop errors.",
            code: `// Server Component
export default function Page() {
  return <Button onClick={() => console.log("hi")} />; // Button is "use client"
}`,
            answer: "Props across the server/client boundary must be serializable; plain functions are not. Move the handler into the client component, or pass a Server Function. Many expect functions to pass like normal props. A strong answer knows only serializable values or Server Functions cross the boundary.",
            solution: `"use client";
export function Button() {
  return <button onClick={() => console.log("hi")}>Hi</button>;
}`,
          },
          {
            task: "Change the code so a large markdown library is not sent to the browser.",
            description: "Checks RSC bundle benefits and XSS. Ask for the refactor.",
            code: `"use client";
import { marked } from "marked";
export function Post({ md }) { return <article dangerouslySetInnerHTML={{ __html: marked(md) }} />; }`,
            answer: "Nothing here is interactive, so make it a Server Component; the library runs only on the server. Sanitize the HTML since it is rendered unescaped. Weak answers keep use client by default. A strong answer moves non-interactive code to the server and sanitizes HTML.",
            solution: `// Server Component (no "use client")
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
export function Post({ md }) {
  return <article dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(md)) }} />;
}`,
          },
        ],
      },
      {
        q: "Fix the data leak. This Server Component passes the full user record to a Client Component.",
        code: `// Server Component
export default async function Page() {
  const user = await db.user.findUnique({ where: { id: session.userId } });
  return <ProfileCard user={user} />; // "use client"; user includes passwordHash, apiKey
}`,
        short: "Everything passed as props to a Client Component is serialized into the RSC payload and visible in the browser. Pass only the fields the client needs (a DTO), and enforce it with server-only modules and taint APIs.",
        long: `RSC payloads ship props of client components to the browser; secrets in those props leak.
Map to a minimal DTO (name, avatarUrl) on the server.
Mark data modules with import "server-only"; React's experimental taint APIs (taintObjectReference/taintUniqueValue) can block passing sensitive objects.
Server Functions are public endpoints: validate input and check authorization inside them.
Strong answer establishes a data-access layer that returns safe DTOs by default.`,
        fix: `export default async function Page() {
  const user = await getUserProfile(session.userId); // returns { name, avatarUrl } only
  return <ProfileCard name={user.name} avatarUrl={user.avatarUrl} />;
}`,
        exercises: [
          {
            task: "Write a data access function. It returns only safe fields. It cannot be imported on the client.",
            description: "Checks server-only boundaries. Ask for the module.",
            answer: "server-only makes client imports a build error, and the function explicitly selects safe fields. A strong answer authorizes inside the function too.",
            solution: `import "server-only";
export async function getUserProfile(id) {
  const u = await db.user.findUnique({ where: { id }, select: { name: true, avatarUrl: true } });
  return u;
}`,
          },
          {
            task: "Fix the Server Function. It trusts its input without checks.",
            description: "Checks Server Function security. Present an action that updates any record by id.",
            code: `"use server";
export async function deletePost(id) { await db.post.delete({ where: { id } }); }`,
            answer: "Anyone can call the endpoint with any id. Check the session and ownership, and validate input. Weak answers rely on the UI only showing own records.",
            solution: `"use server";
export async function deletePost(id) {
  const session = await auth();
  const parsed = z.string().uuid().parse(id);
  await db.post.delete({ where: { id: parsed, authorId: session.userId } });
}`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: "Should your business admin app move to Next.js? Give reasons for and against.",
        ai: true,
        short: "For an authenticated admin app, SEO matters little, so justify it with concrete gains (bundle size, data fetching, conventions) weighed against infra, team skills, lock-in and migration cost, documented in an ADR.",
        long: `For: RSC can shrink bundles, built-in routing/data conventions, streaming, a unified full-stack story, hiring familiarity.
Against: Node server infra vs static hosting/CDN, existing backend (.NET etc.) already owns APIs, caching complexity, Vercel-centric features, migration effort.
Alternatives: Vite SPA + React Router (framework mode), TanStack Router/Start, incremental adoption.
Decide from measured pain (TTI, bundle size, dev velocity), not hype.
Plan: pilot one area, measure, then decide; ADR with options and reversal cost.
Strong answer engages with the company's actual constraints and changes its recommendation when constraints change.`,
        exercises: [
          {
            task: "You run a four-week Next.js trial in the admin app. List the metrics and the success criteria.",
            description: "Checks evaluation discipline. Ask for pilot metrics and criteria.",
            answer: "Compare against the SPA baseline: JS per route, LCP/INP from RUM, build and deploy times, infra cost, developer cycle time and defects; define go/no-go thresholds and the reversal plan up front. Weak answers decide by opinion. A strong answer sets baselines, thresholds and a reversal plan before starting.",
          },
          {
            task: "A team with a dot NET backend adds a Node server for rendering. What operations changes must they plan for?",
            description: "Checks operational awareness. Ask what a new Node tier changes for the team.",
            answer: "New runtime to host, scale and patch; observability and tracing across Node and .NET; auth/session forwarding and CSRF on Server Functions; caching/CDN rules; on-call ownership and incident runbooks. Weak answers focus only on code. A strong answer covers hosting, observability, security and on-call ownership.",
          },
        ],
      },
      {
        q: "Design caching for a server-rendered product catalog. Prices are different for each user.",
        ai: true,
        code: `// every request: full SSR, no cache
export default async function Product({ params }) {
  const product = await getProduct(params.id);
  const price = await getPriceFor(await session(), params.id);
  return <ProductView product={product} price={price} />;
}`,
        short: "Separate shared from personalized content: cache the product shell (CDN/ISR/revalidate tags) and fetch the personalized price in a dynamic slot (Suspense-streamed or client-side), invalidating by tag on product updates.",
        long: `Mixing personalized data into the page makes it uncacheable for everyone.
Cache the static product data with revalidation by tag (e.g. revalidateTag("product:" + id) on CMS update).
Render the price inside a Suspense boundary that is dynamic (streamed) or fetched on the client.
Ensure cache keys never include per-user data in shared caches (privacy incident risk).
Measure hit ratio, TTFB and correctness; document cache rules for teams.
Strong answer explains invalidation ownership and fallback when caches are stale.`,
        fix: `export default async function Product({ params }) {
  const product = await getProductCached(params.id); // cached, tagged "product:id"
  return (
    <ProductView product={product}>
      <Suspense fallback={<PriceSkeleton />}>
        <PersonalPrice id={params.id} /> {/* dynamic, per user */}
      </Suspense>
    </ProductView>
  );
}`,
        exercises: [
          {
            task: "A CDN caches a page with one user's personal price. What is the risk?",
            description: "Checks cache privacy. Ask what can go wrong.",
            answer: "Another user may receive the first user's price or data, a privacy and correctness incident. Mitigate with Cache-Control: private for personalized responses and separating dynamic slots. A strong answer mentions Vary headers and testing cache behavior.",
          },
          {
            task: "Who clears the product cache? How do you find out when it fails?",
            description: "Checks operational ownership. Ask for the flow.",
            answer: "The catalog service emits update events that call a revalidate endpoint with tags; failures are retried and alerted, with a max TTL as a safety net. A strong answer adds a dashboard comparing source vs cached versions.",
          },
        ],
      },
    ],
  },
  "Performance Optimization in React": {
    junior: [
      {
        q: "What makes a React component re-render? Name a few simple ways to avoid extra re-renders.",
        short: "A component re-renders when its state changes, its parent re-renders, or a context it uses changes. Keep state local, avoid creating new objects needlessly, and use React.memo only where it helps.",
        long: `Props changing is not a trigger by itself — a parent re-render re-renders all children by default.
A re-render is not a DOM update; React only commits differences. Re-renders are usually cheap.
Simple wins: move state down to where it's used, split large components, stable keys, avoid inline object props to memoized children.
React.memo skips rendering when props are shallow-equal.
Measure with React DevTools Profiler ("highlight updates") before optimizing.
Weak answer: "props change". Strong answer lists all three triggers and says re-renders aren't inherently bad.`,
        exercises: [
          {
            task: "Predict which components re-render when the button is clicked.",
            description: "Checks re-render triggers. Ask which components render on click.",
            code: `function App() {
  const [n, setN] = useState(0);
  return <><button onClick={() => setN(n + 1)}>{n}</button><Footer /></>;
}`,
            answer: "App and Footer both re-render: children re-render with their parent by default even without changed props. Footer would skip only if wrapped in memo (or optimized by React Compiler). Many say only App. A strong answer explains default child re-rendering and that it is usually cheap.",
          },
          {
            task: "Change the code so typing in the input does not re-render the slow list.",
            description: "Checks moving state down. Ask for the refactor.",
            code: `function Page() {
  const [text, setText] = useState("");
  return <><input value={text} onChange={e => setText(e.target.value)} /><ExpensiveList /></>;
}`,
            answer: "Move the input state into its own component so only it re-renders. Weak answers reach for memo first. A strong answer isolates state structurally so memo is unnecessary.",
            solution: `function SearchInput() {
  const [text, setText] = useState("");
  return <input value={text} onChange={e => setText(e.target.value)} />;
}
function Page() {
  return <><SearchInput /><ExpensiveList /></>;
}`,
          },
        ],
      },
      {
        q: "Fix the extra re-renders of the memoized list.",
        code: `const List = React.memo(function List({ items, onSelect }) { /* heavy */ });
function Page({ items }) {
  const [q, setQ] = useState("");
  return (
    <>
      <input value={q} onChange={e => setQ(e.target.value)} />
      <List items={items} onSelect={id => console.log(id)} />
    </>
  );
}`,
        short: "The inline onSelect arrow is a new function on every keystroke, so React.memo's shallow comparison fails. Pass a stable callback (useCallback or a module-level function).",
        long: `memo compares each prop by Object.is; a new function every render defeats it.
useCallback(fn, []) or hoisting the function keeps the reference stable.
Alternatively move the input state into its own component so Page does not re-render.
React Compiler would memoize this automatically.
Strong answer prefers structural fixes (state colocation) and verifies with the Profiler.`,
        fix: `function Page({ items }) {
  const [q, setQ] = useState("");
  const onSelect = useCallback(id => console.log(id), []);
  return (
    <>
      <input value={q} onChange={e => setQ(e.target.value)} />
      <List items={items} onSelect={onSelect} />
    </>
  );
}`,
        exercises: [
          {
            task: "Children are passed as JSX. Does memo help here?",
            description: "Checks memo with children. Ask whether Card re-renders.",
            code: `const Card = memo(({ children }) => <div>{children}</div>);
function Parent() { const [n, setN] = useState(0); return <Card><p>Hi</p></Card>; }`,
            answer: "It re-renders each time: <p>Hi</p> creates a new element object every render, so the children prop changes. Weak answers think static JSX is stable. A strong answer hoists the element or avoids memo there.",
          },
          {
            task: "Use lazy initial state for a slow calculation.",
            description: "Checks useState initializer. Present useState(parseHugeJson(raw)).",
            code: "const [data] = useState(parseHugeJson(raw));",
            answer: "Passing the value calls the function every render; passing a function runs it only once. A strong answer distinguishes this from useMemo.",
            solution: "const [data] = useState(() => parseHugeJson(raw));",
          },
        ],
      },
    ],
    middle: [
      {
        q: "Typing in the search box is slow. Why? How do you fix it?",
        code: `function Products({ products }) {
  const [query, setQuery] = useState('');
  const filtered = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      {filtered.map(p => <ProductCard key={p.id} product={p} />)}
    </>
  );
}`,
        short: "Every keystroke synchronously filters and re-renders thousands of cards, blocking input. Defer the expensive list with useDeferredValue (or startTransition), memoize the list/filter, and virtualize if the list is large.",
        long: `The input update and the heavy list render happen in the same urgent render, so the input can't update until the list finishes.
useDeferredValue(query) lets React render the input immediately and the list with the old value in the background (interruptible).
The deferred list must be memoized (React.memo or useMemo on the element), otherwise it renders anyway.
useMemo the filter if products is large; virtualize to cut DOM size.
Debouncing reduces work but adds fixed latency; deferring adapts to device speed.
Strong answer profiles first and explains why concurrent rendering helps here.`,
        fix: `const ProductList = React.memo(function ProductList({ products, query }) {
  const filtered = useMemo(
    () => products.filter(p => p.name.toLowerCase().includes(query.toLowerCase())),
    [products, query]
  );
  return filtered.map(p => <ProductCard key={p.id} product={p} />);
});

function Products({ products }) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <div style={{ opacity: isStale ? 0.6 : 1 }}>
        <ProductList products={products} query={deferredQuery} />
      </div>
    </>
  );
}`,
        exercises: [
          {
            task: "Fix the transition. It makes the controlled input feel broken.",
            description: "Checks transitions on controlled inputs. Ask why typing lags.",
            code: `const [isPending, startTransition] = useTransition();
<input value={q} onChange={e => startTransition(() => setQ(e.target.value))} />`,
            answer: "Controlled input updates must be urgent; wrapping them in a transition makes typing lag or drop characters. Keep the input state urgent and defer only the expensive consumer. Many think wrapping everything in transitions helps. A strong answer keeps input updates urgent and defers only expensive consumers.",
            solution: `<input value={q} onChange={e => setQ(e.target.value)} />
const deferredQ = useDeferredValue(q);
<Results query={deferredQ} /> // Results is memoized`,
          },
          {
            task: "How does this useMemo change render speed?",
            description: "Checks memoization cost. Ask whether this useMemo helps.",
            code: "const doubled = useMemo(() => n * 2, [n]);",
            answer: "No measurable gain: the computation is trivial, so memoization only adds overhead and noise. Reserve useMemo for expensive work or referential stability. Weak answers say memo always helps. A strong answer knows memo has overhead and mentions React Compiler.",
          },
        ],
      },
      {
        q: "What is React Compiler? What does it optimize? What are its limits?",
        short: "React Compiler (v1.0, 2025) is a build-time Babel/SWC plugin that automatically memoizes components, hooks and values based on data-flow analysis, replacing most manual memo/useMemo/useCallback. It requires code that follows the Rules of React and does not fix algorithmic or network problems.",
        long: `It inserts fine-grained caching so unchanged JSX and values are reused across renders.
It skips (bails out of) components that break rules, e.g. mutating props, reading refs in render.
Opt-in per directory or annotate with "use memo"/"use no memo"; eslint-plugin-react-hooks includes compiler rules.
It does not virtualize lists, reduce bundle size, fix context over-subscription or request waterfalls.
Existing manual memo still works; remove it gradually after measuring.
Strong answer explains rollout and verification (Profiler, tests) and works on React 17+ via the runtime package.`,
        exercises: [
          {
            task: "Predict whether React Compiler will optimize this component.",
            description: "Checks compiler bail-outs. Ask why or why not.",
            code: `function Timer() {
  const startRef = useRef(Date.now());
  return <p>{Date.now() - startRef.current}</p>;
}`,
            answer: "It bails out because it reads ref.current during render, which violates the rules. Lint reports it. A strong answer moves the read to an effect or handler.",
          },
          {
            task: "You turned on the compiler. Which manual memoization should you remove?",
            description: "Checks pragmatic migration. Ask for a strategy.",
            answer: "Keep memo that controls effect dependencies semantics until tests cover them, remove purely performance memos gradually per directory, and compare Profiler results. Weak answers delete everything at once.",
          },
        ],
      },
    ],
    senior: [
      {
        q: "A dashboard re-renders every widget when one filter changes. The bundle is 3 megabytes. Explain step by step how you find and fix the problems.",
        ai: true,
        short: "Measure first (Profiler, Web Vitals, bundle analyzer), then fix the biggest causes: coarse state/context subscriptions, unstable props, missing code splitting, heavy dependencies and request waterfalls.",
        long: `Diagnose: React DevTools Profiler (why did this render), Chrome Performance panel for long tasks, INP/LCP from RUM, bundle visualizer (rollup-plugin-visualizer, source-map-explorer).
Rendering fixes: split contexts or use store selectors so widgets subscribe only to what they need; colocate state; stable props; React Compiler.
Bundle fixes: route- and widget-level lazy loading, replace moment/lodash full imports, dynamic import for charts/editors, check duplicate deps.
Data fixes: parallelize requests, cache with TanStack Query, prefetch on hover/route.
Set performance budgets in CI (size-limit) and track INP in production.
Strong answer gives numbers from a real case and prioritizes by user impact; interviewer can change constraints (e.g. "no React upgrade allowed").`,
        exercises: [
          {
            task: "Fix the request waterfall in this route. Requests should not wait for each other.",
            description: "Checks Suspense waterfalls. Ask why loading is slow.",
            code: `function Project({ id }) {
  const { data: project } = useSuspenseQuery({ queryKey: ["p", id], queryFn: () => api.project(id) });
  return <Suspense><Tasks id={id} /></Suspense>; // Tasks also suspends on its own query
}`,
            answer: "Tasks starts fetching only after Project resolves. Start both in parallel, e.g. prefetch in a route loader or useSuspenseQueries. Many miss that nested suspending components fetch sequentially. A strong answer hoists fetching to loaders or parallel queries.",
            solution: `// route loader
loader: ({ params }) => {
  queryClient.prefetchQuery({ queryKey: ["tasks", params.id], queryFn: () => api.tasks(params.id) });
  return queryClient.ensureQueryData({ queryKey: ["p", params.id], queryFn: () => api.project(params.id) });
}`,
          },
          {
            task: "Change these imports to make the bundle smaller.",
            description: "Checks bundle hygiene. Ask how to shrink this import.",
            code: `import _ from "lodash";
import moment from "moment";
const d = moment(date).format("YYYY-MM-DD");
const u = _.uniqBy(list, "id");`,
            answer: "Full lodash and moment add hundreds of KB. Use per-method imports or native code and a lighter date library/Intl. Weak answers rely on tree shaking that lodash CJS does not support. A strong answer uses per-method imports, native APIs and a bundle analyzer.",
            solution: `import uniqBy from "lodash/uniqBy";
const d = new Date(date).toISOString().slice(0, 10); // or date-fns format
const u = uniqBy(list, "id");`,
          },
        ],
      },
      {
        q: "In this dashboard, context causes too many re-renders. Fix it.",
        code: `const DashCtx = createContext();
function DashProvider({ children }) {
  const [filters, setFilters] = useState({ region: "all", period: "30d" });
  const [hovered, setHovered] = useState(null); // updates on every mouse move
  return <DashCtx.Provider value={{ filters, setFilters, hovered, setHovered }}>{children}</DashCtx.Provider>;
}`,
        short: "High-frequency hover state shares one context with filters, so every consumer re-renders on each mouse move. Move hover state local or to a separate store with selectors, and split/memoize the rest.",
        long: `Any change to the context value re-renders all consumers; hovered changes dozens of times per second.
Keep transient UI state local to the chart, or in a store where only interested components subscribe.
Split filters and actions into separate contexts and memoize the value.
Verify with the Profiler and INP measurements.
Strong answer classifies state by update frequency and audience.`,
        fix: `const FiltersCtx = createContext();
function DashProvider({ children }) {
  const [filters, setFilters] = useState({ region: "all", period: "30d" });
  const value = useMemo(() => ({ filters, setFilters }), [filters]);
  return <FiltersCtx.Provider value={value}>{children}</FiltersCtx.Provider>;
}
// hovered: local state inside the chart, or a Zustand store with selectors`,
        exercises: [
          {
            task: "Build a hover store with Zustand. Only the tooltip should re-render.",
            description: "Checks fine-grained subscriptions. Ask for store + consumer.",
            answer: "Components subscribe via selectors; only the tooltip selects hovered. A strong answer uses transient updates (subscribe without render) for very frequent events.",
            solution: `const useHover = create(set => ({ hovered: null, setHovered: h => set({ hovered: h }) }));
function Tooltip() { const hovered = useHover(s => s.hovered); return hovered ? <Tip item={hovered} /> : null; }`,
          },
          {
            task: "In the original code, the mouse moves. Which components re-render?",
            description: "Checks context propagation. Ask about memoized consumers.",
            answer: "Every component calling useContext(DashCtx) re-renders, even if memoized and even if it only reads filters. A strong answer explains memo does not block context.",
          },
        ],
      },
    ],
    techlead: [
      {
        q: "How do you make performance a regular team habit, not a one-time cleanup?",
        ai: true,
        short: "Define user-centric budgets (Core Web Vitals, bundle size), automate checks in CI, monitor real users, give ownership per area, and make perf part of design and review.",
        long: `Pick metrics that map to user experience: LCP, INP, CLS from RUM (web-vitals, Sentry, Datadog), plus bundle size per route.
Budgets enforced in CI (size-limit, Lighthouse CI) fail PRs that regress; exceptions need sign-off.
Dashboards and alerts per area with owners; regressions treated like bugs.
Guidelines: lazy-load by default, approved libraries list, data-fetching patterns, React Compiler adoption.
Educate: profiling workshops, perf section in PR template.
Strong answer shares a concrete win and trade-off (e.g. dropped a library, negotiated a feature delay) and how they kept it from regressing.`,
        exercises: [
          {
            task: "Define a CI rule that stops the bundle from growing. Teams should not just skip it.",
            description: "Checks sustainable perf governance. Ask for a CI policy.",
            answer: "Per-route budgets with size-limit reporting deltas on every PR, a hard fail above threshold, an explicit override label requiring perf-owner approval, and a monthly review of overrides. Weak answers set budgets without escape hatches, so teams bypass them. A strong answer adds visible deltas, approvals and review.",
          },
          {
            task: "Real user data shows poor INP on the orders page. Local Lighthouse shows it is fine. What do you do first?",
            description: "Checks lab vs field data. Ask how to approach the discrepancy.",
            answer: "Lab data misses real devices and interactions; segment RUM by device and interaction target, reproduce with CPU throttling and the Performance panel, use the web-vitals attribution build to find long tasks, then fix the top offender and verify in RUM. Many trust Lighthouse alone. A strong answer segments RUM and uses attribution to find real interactions.",
          },
        ],
      },
      {
        q: "Opening an order is a key action. Add a check in CI that fails if it gets slower.",
        ai: true,
        code: `// Today: perf is checked manually before big releases
test("opens order", async ({ page }) => {
  await page.goto("/orders");
  await page.click("text=Order #1");
  await expect(page.getByRole("dialog")).toBeVisible();
});`,
        short: "Turn the E2E into a measured benchmark: throttle CPU, record interaction timing (performance marks or INP via web-vitals), run multiple iterations, compare against a stored baseline with tolerance, and report trends — while RUM remains the source of truth.",
        long: `Add performance.mark/measure around the interaction in app code (or use PerformanceObserver for event timing).
In Playwright, use CDP CPU throttling for stability and run N iterations, taking the median.
Fail when the median regresses beyond tolerance vs baseline; publish results per PR.
Lab benchmarks are noisy — use dedicated runners and keep budgets coarse.
Complement with RUM dashboards and alerts on INP for the route.
Strong answer discusses noise management and who owns triage of failures.`,
        fix: `test("open order under budget", async ({ page }) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.goto("/orders");
  const times = [];
  for (let i = 0; i < 5; i++) {
    await page.click("text=Order #1");
    await page.getByRole("dialog").waitFor();
    times.push(await page.evaluate(() => performance.getEntriesByName("order-open").at(-1).duration));
    await page.keyboard.press("Escape");
  }
  times.sort((a, b) => a - b);
  expect(times[2]).toBeLessThan(200);
});`,
        exercises: [
          {
            task: "Add the performance marks in the app that the test reads.",
            description: "Checks User Timing API. Ask where to put marks.",
            answer: "Mark on click and measure after the dialog commits (e.g. in a layout effect of the dialog). A strong answer clears marks to avoid memory growth.",
            solution: `// on click
performance.mark("order-open-start");
// in OrderDialog
useLayoutEffect(() => {
  performance.measure("order-open", "order-open-start");
}, []);`,
          },
          {
            task: "Performance tests sometimes fail at random. How do you handle this without turning off the check?",
            description: "Checks team process. Ask for a policy.",
            answer: "Use medians over runs, dedicated hardware, tolerance bands, and auto-retry once; persistent failures block merge and route to the owning team. A strong answer tracks false-positive rate and tunes thresholds.",
          },
        ],
      },
    ],
  },
  "Advanced Strategies and Integration": {
    junior: [
      {
        q: "Some libraries are not built for React, like a chart or map library that changes the DOM. How do you use one inside a React component?",
        short: "Give the library a DOM node via a ref, initialize it in useEffect, update it when props change, and destroy it in the cleanup function.",
        long: `React shouldn't render children inside the node the library controls — leave the container empty.
Initialize once (effect with [] deps), store the instance in a ref, and update via the library API in another effect.
Always clean up (destroy, remove listeners) to avoid leaks — StrictMode's double effect run in dev will reveal missing cleanup.
Check for an existing React wrapper first, but know how it works.
Strong answer separates "create" and "update" effects and mentions SSR (no window on the server).`,
        exercises: [
          {
            task: "Fix the bug. In development, a second chart appears.",
            description: "Checks imperative library cleanup. Ask why two charts appear.",
            code: `useEffect(() => {
  new Chart(canvasRef.current, config);
}, []);`,
            answer: "StrictMode runs effects twice in development and there is no cleanup, so two charts attach. Destroy the instance in the cleanup. Some disable StrictMode. A strong answer adds cleanup, since the same leak occurs on real remounts.",
            solution: `useEffect(() => {
  const chart = new Chart(canvasRef.current, config);
  return () => chart.destroy();
}, []);`,
          },
          {
            task: "Write a hook that listens to window resize and returns the width.",
            description: "Checks subscription hooks. Ask for a resize hook.",
            answer: "Subscribe in an effect, update state, and remove the listener in cleanup. Weak answers forget cleanup. A strong answer considers SSR (no window) and useSyncExternalStore as an alternative.",
            solution: `function useWindowWidth() {
  const [w, setW] = useState(() => window.innerWidth);
  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return w;
}`,
          },
        ],
      },
      {
        q: "Fix the jQuery date picker code. It must stay in sync with React state.",
        code: `function DatePicker({ value, onChange }) {
  const ref = useRef(null);
  useEffect(() => {
    $(ref.current).datepicker({ onSelect: onChange });
  });
  return <input ref={ref} value={value} />;
}`,
        short: "The plugin is re-initialized on every render without cleanup, uses a stale onChange, and React's controlled value fights the plugin. Initialize once with cleanup, keep the latest callback in a ref, and push value changes via the plugin's API on an uncontrolled input.",
        long: `No dependency array means init on every render, stacking instances and listeners.
Missing cleanup leaks DOM handlers (and duplicates in StrictMode).
A controlled value without onChange is read-only; let the plugin own the input DOM and sync via its setDate API.
Keep onChange in a ref so the plugin always calls the latest callback.
Strong answer separates create, update and destroy and mentions migrating to a native React component long-term.`,
        fix: `function DatePicker({ value, onChange }) {
  const ref = useRef(null);
  const onChangeRef = useRef(onChange);
  useLayoutEffect(() => { onChangeRef.current = onChange; });
  useEffect(() => {
    const $el = $(ref.current).datepicker({ onSelect: d => onChangeRef.current(d) });
    return () => $el.datepicker("destroy");
  }, []);
  useEffect(() => { $(ref.current).datepicker("setDate", value); }, [value]);
  return <input ref={ref} defaultValue={value} />;
}`,
        exercises: [
          {
            task: "In the original code, the component re-renders 5 times. How many date pickers exist?",
            description: "Checks effect without deps. Ask for the count and consequences.",
            answer: "Six or more (one per render, doubled in StrictMode dev), each adding handlers, so onSelect may fire multiple times. Weak answers think jQuery dedupes. A strong answer adds deps and cleanup.",
          },
          {
            task: "Write a wrapper that gives parents the plugin instance through a ref.",
            description: "Checks useImperativeHandle with third-party widgets. Ask for open()/close().",
            answer: "Expose a minimal imperative API instead of the raw jQuery object to keep encapsulation. A strong answer uses React 19 ref-as-prop.",
            solution: `function DatePicker({ ref, ...props }) {
  const inputRef = useRef(null);
  useImperativeHandle(ref, () => ({
    open: () => $(inputRef.current).datepicker("show"),
    close: () => $(inputRef.current).datepicker("hide"),
  }), []);
  return <input ref={inputRef} {...props} />;
}`,
          },
        ],
      },
    ],
    middle: [
      {
        q: "This optimistic like button can show the wrong state. Fix it with React 19 features.",
        code: `function LikeButton({ post }) {
  const [liked, setLiked] = useState(post.liked);
  async function toggle() {
    setLiked(!liked);
    await api.setLiked(post.id, !liked);
  }
  return <button onClick={toggle}>{liked ? 'Unlike' : 'Like'}</button>;
}`,
        short: "Local state is copied from props once and never rolls back on failure, so it drifts from the server. Use useOptimistic inside a transition so the optimistic value reverts automatically when the action fails or the real data arrives.",
        long: `useState(post.liked) ignores later prop updates (e.g. after refetch).
If the request fails, the UI keeps the wrong value; rapid clicks also race.
useOptimistic(value) shows a temporary state only while an async transition/action is pending, then falls back to the source of truth.
The parent should own the real data (e.g. TanStack Query cache or server action revalidation).
Handle errors: show a message; the optimistic state reverts automatically when the transition ends.
Strong answer also mentions disabling double submits and React Query's onMutate/rollback alternative.`,
        fix: `function LikeButton({ post, onLikedChange }) {
  const [optimisticLiked, setOptimisticLiked] = useOptimistic(post.liked);
  const [isPending, startTransition] = useTransition();
  function toggle() {
    startTransition(async () => {
      const next = !optimisticLiked;
      setOptimisticLiked(next);
      await api.setLiked(post.id, next);
      startTransition(() => onLikedChange(next)); // update source of truth
    });
  }
  return <button onClick={toggle} disabled={isPending}>{optimisticLiked ? 'Unlike' : 'Like'}</button>;
}`,
        exercises: [
          {
            task: "Fix this use of the use hook. It suspends forever.",
            description: "Checks use() with promises. Ask why it suspends forever.",
            code: `function Comments({ id }) {
  const comments = use(fetchComments(id));
  return comments.map(c => <p key={c.id}>{c.text}</p>);
}`,
            answer: "A new promise is created every render, so it suspends again on each retry. Create the promise outside the suspending component (parent state, a cache or a framework loader) and pass it down. Many put fetch directly in use(). A strong answer caches the promise outside render.",
            solution: `function Post({ id }) {
  const [promise] = useState(() => fetchComments(id)); // key Post by id to refetch
  return <Suspense fallback={<Spinner />}><Comments promise={promise} /></Suspense>;
}
function Comments({ promise }) {
  return use(promise).map(c => <p key={c.id}>{c.text}</p>);
}`,
          },
          {
            task: "Build a form with useActionState. Show a pending state and the returned error.",
            description: "Checks useActionState. Ask for a form with pending and error.",
            answer: "useActionState returns [state, action, isPending]; the action receives the previous state and FormData. Weak answers use manual useState flags. A strong answer explains action state flow and progressive enhancement.",
            solution: `function Rename() {
  const [error, action, isPending] = useActionState(async (_prev, fd) => {
    const res = await api.rename(fd.get("name"));
    return res.ok ? null : "Name taken";
  }, null);
  return (
    <form action={action}>
      <input name="name" />
      <button disabled={isPending}>Save</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}`,
          },
        ],
      },
      {
        q: "What are portals? When do you need them? What accessibility and event problems can they cause?",
        short: "createPortal renders children into a different DOM node (e.g. document.body) while keeping them in the React tree. Use them for modals, tooltips and popovers that must escape overflow/z-index; handle focus trapping, inert background and React-tree event bubbling.",
        long: `Portals solve CSS clipping (overflow: hidden, stacking contexts) for overlays.
Context and events still follow the React tree: a click in a portal bubbles to React ancestors.
Accessibility: role="dialog", aria-modal, labelled title, focus moved in and restored on close, Escape to close, background inert.
The native <dialog> element with showModal() provides top-layer and inert background without a portal.
SSR: portal targets don't exist on the server; render after mount.
Strong answer knows the native dialog/popover APIs as modern alternatives.`,
        exercises: [
          {
            task: "Build a modal with a portal. When it closes, focus goes back to where it was.",
            description: "Checks portal plus focus management. Ask for a minimal accessible modal.",
            answer: "Save document.activeElement on open, focus the dialog, and restore focus in cleanup. A strong answer also traps Tab and closes on Escape (or uses native <dialog>).",
            solution: `function Modal({ title, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    ref.current.focus();
    return () => prev?.focus();
  }, []);
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref} onKeyDown={e => e.key === "Escape" && onClose()}>
      {children}
    </div>,
    document.body
  );
}`,
          },
          {
            task: "A context is provided above the portal. Can you read its value inside the portal?",
            description: "Checks portals and context. Ask whether ThemeContext works inside the modal.",
            answer: "Yes: portals keep the React tree, so context from ancestors is available even though the DOM node is in body. Weak answers say context is lost. A strong answer contrasts this with mounting a separate root, where context is lost.",
          },
        ],
      },
    ],
    senior: [
      {
        q: "You move a large Vue 2 app to React one page at a time. Both run in production. How do they share login, state, routing, and the design system?",
        ai: true,
        short: "Use a strangler pattern: a shell or proxy routes URLs to the owning app, shared concerns (auth tokens, user/session, feature flags, design tokens) live in framework-agnostic modules, and pages migrate behind feature flags with parity tests.",
        long: `Integration options: separate SPAs behind a reverse proxy, React mounted inside Vue pages (createRoot into a container), or Module Federation/micro-frontends.
Auth: one token/session source (cookies or a shared auth module) — never two login flows.
State: keep cross-app state minimal; share via URL, server (refetch), or a tiny framework-agnostic store/event bus with adapters for each side.
Design system: shared tokens (CSS variables) first so both look the same; component parity checked visually.
Routing: route manifest + feature flags per page; consistent redirects and deep links.
Quality gates: parity checklist from Vue behavior, E2E on both, analytics comparison, rollback via flag.
Strong answer talks about what actually went wrong (duplicated CSS, double bundles, event leaks) and how scope was negotiated.`,
        exercises: [
          {
            task: "Fix the memory leak. A Vue page shows a React part, then the user leaves the page.",
            description: "Checks lifecycle integration between frameworks. Ask why memory grows.",
            code: `// Vue component
mounted() { createRoot(this.$el).render(<Reports />); }`,
            answer: "The React root is never unmounted, so effects and subscriptions keep running. Keep the root and unmount it in the Vue teardown hook. Weak answers ignore unmounting. A strong answer ties React root lifecycle to the host's teardown.",
            solution: `mounted() { this.root = createRoot(this.$el); this.root.render(<Reports />); },
beforeDestroy() { this.root.unmount(); }`,
          },
          {
            task: "Write a typed event bus so the Vue app and the React app can talk to each other.",
            description: "Checks cross-framework contracts. Ask for a typed bus.",
            answer: "A small framework-agnostic module with a typed event map keeps the contract explicit and testable; both sides subscribe and must unsubscribe on teardown. Weak answers use window globals. A strong answer types events and requires cleanup.",
            solution: `type Events = { "user:changed": { id: string }; "nav:go": { path: string } };
const target = new EventTarget();
export function emit<K extends keyof Events>(type: K, detail: Events[K]) {
  target.dispatchEvent(new CustomEvent(type, { detail }));
}
export function on<K extends keyof Events>(type: K, fn: (d: Events[K]) => void) {
  const h = (e: Event) => fn((e as CustomEvent).detail);
  target.addEventListener(type, h);
  return () => target.removeEventListener(type, h);
}`,
          },
        ],
      },
      {
        q: "A React widget sits in a Vue page as a custom element. It leaks memory and ignores attribute changes. Fix it.",
        code: `class OrdersWidget extends HTMLElement {
  connectedCallback() {
    createRoot(this).render(<Orders status={this.getAttribute("status")} />);
  }
}
customElements.define("orders-widget", OrdersWidget);`,
        short: "It never unmounts on disconnect, creates a new root on every reconnect, and ignores attribute updates. Keep one root per element, re-render in attributeChangedCallback (observedAttributes), and unmount in disconnectedCallback.",
        long: `Custom elements are a framework-neutral integration boundary for embedding React in Vue/Angular/legacy pages.
disconnectedCallback must unmount the root to stop effects and subscriptions.
observedAttributes + attributeChangedCallback let host frameworks pass simple props; complex data via properties or events.
Emit CustomEvents for outputs so the host can listen.
Consider shadow DOM for style isolation (and its impact on global styles/design tokens).
Strong answer weighs custom elements vs direct mount functions and React 19's improved custom element support.`,
        fix: `class OrdersWidget extends HTMLElement {
  static observedAttributes = ["status"];
  connectedCallback() { this.root ??= createRoot(this); this.render(); }
  attributeChangedCallback() { if (this.root) this.render(); }
  disconnectedCallback() { this.root?.unmount(); this.root = null; }
  render() {
    this.root.render(<Orders status={this.getAttribute("status")} onSelect={id => this.dispatchEvent(new CustomEvent("select", { detail: id }))} />);
  }
}
customElements.define("orders-widget", OrdersWidget);`,
        exercises: [
          {
            task: "There is a shared stylesheet with design tokens. Should the widget use shadow DOM or light DOM?",
            description: "Checks style isolation trade-offs. Ask for a recommendation.",
            answer: "Light DOM lets global tokens and styles apply but risks leakage; shadow DOM isolates styles but requires injecting the design-system CSS into each shadow root (CSS variables do inherit). A strong answer picks based on host CSS hygiene and tests both.",
          },
          {
            task: "In Vue, listen to the select event from the widget.",
            description: "Checks cross-framework outputs. Ask for the Vue template.",
            answer: "Custom events are listened to with @select in Vue and the payload is in event.detail. A strong answer documents the event contract and names events consistently.",
            solution: "<orders-widget :status=\"status\" @select=\"onSelect($event.detail)\" />",
          },
        ],
      },
    ],
    techlead: [
      {
        q: "Leaders want micro-frontends and one design system for 8 teams. When would you say no? If you agree, how would you set it up?",
        ai: true,
        short: "Push back if the main problem isn't team autonomy or independent deployment — micro-frontends add runtime, UX and ops cost. If justified, define domain-aligned slices, a thin shell, shared design tokens/components with versioning, and strict contracts.",
        long: `Micro-frontends solve organizational problems (independent deploys, ownership), not technical ones; a modular monolith with boundaries often suffices.
Costs: duplicated React/runtime, version skew, inconsistent UX, harder local dev and E2E, cross-app state and routing.
If going ahead: split by business domain, thin shell for routing/auth, Module Federation or import maps with shared singletons (react, react-dom), contracts via events/URL.
Design system: tokens -> primitives -> patterns; published package with semver, Storybook, visual regression, a11y checks; a dedicated team plus contribution model.
Governance: RFCs, deprecation policy, adoption metrics.
Strong answer brings real experience, quantifies trade-offs, and adapts when the interviewer changes constraints (e.g. "teams are in different time zones", "one team uses Angular").`,
        exercises: [
          {
            task: "Fix the micro-frontend setup. It loads two copies of React, and hooks break.",
            description: "Checks Module Federation singletons. Ask why hooks break.",
            code: "shared: { react: {}, \"react-dom\": {} }",
            answer: "Without singleton (and compatible requiredVersion), each remote may load its own React, causing \"Invalid hook call\" and duplicated bundles. Many miss duplicate React. A strong answer configures singleton and version constraints.",
            solution: `shared: {
  react: { singleton: true, requiredVersion: "^19.0.0" },
  "react-dom": { singleton: true, requiredVersion: "^19.0.0" },
}`,
          },
          {
            task: "Eight teams use a design system. Define rules for versions and for removing old parts.",
            description: "Checks design system governance. Ask for a versioning policy.",
            answer: "Semver with changesets, breaking changes only in majors with codemods and migration guides, deprecation warnings for at least one major cycle, support for N-1 major, and adoption dashboards to know when a version can be retired. Weak answers say just use semver. A strong answer adds codemods, deprecation windows and adoption tracking.",
          },
        ],
      },
      {
        q: "Leaders want all teams to use a lot of AI-generated UI code. How do you keep React code quality, consistency, and accessibility high?",
        ai: true,
        short: "Treat AI as a contributor bound by the same guardrails: strong lint/type/test gates, design-system-only components, documented conventions the tools consume, mandatory human review for architecture, and metrics on defects and rework.",
        long: `Codify conventions (skills/rules files, ADRs, examples) so generated code follows the house style.
Automate gates: TypeScript strict, eslint-plugin-react-hooks with compiler rules, axe in tests, visual regression, bundle budgets.
Restrict building blocks to the design system so generated UI stays consistent and accessible.
Reviews focus on architecture, security and product fit; small PRs only.
Measure: escaped defects, a11y violations, revert rate, cycle time — adjust policies based on data.
Strong answer gives concrete examples of failure modes (hallucinated APIs, inaccessible markup, duplicated components) and how gates caught them.`,
        exercises: [
          {
            task: "Define three automated checks. They should catch the most common problems in AI-generated React code.",
            description: "Checks practical guardrails. Ask for checks and what each catches.",
            answer: "Type-check plus lint with hooks/compiler rules (wrong hook usage, invalid APIs), axe-based a11y tests (missing labels, div buttons), and a dependency/duplication check (new libraries or reimplemented design-system components). A strong answer ties each to observed defect data.",
          },
          {
            task: "Review this generated component. Which problems would stop you from approving it?",
            description: "Checks review skill on typical generated code. Present the snippet.",
            code: `function Items() {
  const [items, setItems] = useState([]);
  useEffect(() => { fetch("/api/items").then(r => r.json()).then(setItems); });
  return items.map((i, idx) => <div key={idx} style={{ color: "#3b82f6" }} onClick={() => open(i)}>{i.name}</div>);
}`,
            answer: "Clickable div without keyboard support, fetch in an effect without cleanup or error handling, hard-coded colors instead of tokens, and index keys. A strong answer proposes the design-system Button, a query hook and token usage.",
          },
        ],
      },
    ],
  },
};
