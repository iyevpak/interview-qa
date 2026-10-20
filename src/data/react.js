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
            task: "Write the compiled output of this JSX.",
            description: "Checks the JSX compile target.",
            code: "<Button kind=\"primary\">Save</Button>",
            answer: "jsx(Button, { kind: \"primary\", children: \"Save\" }) with the automatic runtime. It returns a plain element object, not a DOM node.",
            solution: "jsx(Button, { kind: \"primary\", children: \"Save\" })",
          },
          {
            task: "Predict what happens to Counter's state.",
            description: "Checks type-based reconciliation.",
            code: `{isAdmin
  ? <div><Counter /></div>
  : <section><Counter /></section>}`,
            answer: "Counter remounts and loses state when isAdmin flips. A different parent element type at the same position means React tears down the whole subtree.",
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
            task: "Predict what renders.",
            description: "Checks which values React can render.",
            code: `const tags = ["a", "b"];
const n = 5n;
return <p>{tags}{n}{{}.toString()}</p>;`,
            answer: "\"ab5[object Object]\". Arrays and bigint render; the call returns a string. Only a raw object as a child would throw.",
          },
          {
            task: "Fix the render of a date.",
            description: "Checks rendering non-primitive values.",
            code: "<span>{order.createdAt}</span> // a Date",
            answer: "A Date is an object, so React throws. Format it to a string first, e.g. with toLocaleDateString or Intl.DateTimeFormat.",
            solution: "<span>{order.createdAt.toLocaleDateString()}</span>",
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
            task: "Predict the output when items is empty.",
            description: "Checks the && pitfall with numbers.",
            code: "<div>{items.length && <List items={items} />}</div>",
            answer: "It renders \"0\". The number 0 is falsy but React still renders numbers. Use items.length > 0 && ...",
            solution: "<div>{items.length > 0 && <List items={items} />}</div>",
          },
          {
            task: "Name two safe ways to render conditionally.",
            description: "Checks conditional rendering patterns.",
            code: "{price && <Price value={price} />} // price may be 0",
            answer: "Use a boolean check like price != null && ..., or a ternary returning null. Common mistake: relying on truthiness when 0 is valid.",
            solution: "{price != null ? <Price value={price} /> : null}",
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
            task: "Spot the problem.",
            description: "Checks that elements are immutable.",
            code: `const el = <Title text="Hi" />;
el.props.text = "Bye";`,
            answer: "Element props are frozen in development, so this throws or does nothing. Create a new element or use cloneElement instead.",
            solution: "const el2 = cloneElement(el, { text: \"Bye\" });",
          },
          {
            task: "Classify each line: component, element, or neither.",
            description: "Checks component vs element vocabulary.",
            code: `function Card() { return <div />; }
const a = <Card />;
const b = Card;`,
            answer: "Card and b are components (functions). a is an element: a plain object describing what to render. Function components have no instances.",
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
            task: "Spot why the input loses focus.",
            description: "Checks components defined inside render.",
            code: `function Form() {
  const Field = () => <input />;
  return <Field />;
}`,
            answer: "Field is a new function on each render, so React sees a new type and remounts the input. Move Field outside Form.",
            solution: `const Field = () => <input />;
function Form() { return <Field />; }`,
          },
          {
            task: "Predict whether the input keeps its value.",
            description: "Checks identity of inline component types.",
            code: "{useMemo(() => () => <input />, [])}",
            answer: "This renders a function, not an element; React warns and renders nothing. Components must be referenced in JSX as <Field />, defined at module level.",
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
            task: "Spot the impure part.",
            description: "Checks render purity.",
            code: `let count = 0;
function Badge() {
  count++;
  return <b>{count}</b>;
}`,
            answer: "Render mutates a module variable, so output depends on how often React renders. StrictMode double render shows wrong numbers. Use state or props.",
          },
          {
            task: "Predict the console in development StrictMode.",
            description: "Checks StrictMode double invocation.",
            code: `function App() {
  console.log("render");
  useEffect(() => console.log("effect"), []);
  return null;
}`,
            answer: "Render runs twice and the effect runs, cleans up, and runs again. React 19 dims the second log. Production runs each once.",
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
            task: "Name two ways to keep teams from importing internals.",
            description: "Checks module boundaries at scale.",
            code: "import { helper } from \"@/features/billing/utils/internal\";",
            answer: "Expose a public index per feature and block deep imports with ESLint no-restricted-imports or boundaries rules. Also use CODEOWNERS per folder.",
          },
          {
            task: "Suggest a folder layout for a feature.",
            description: "Checks feature-based structure.",
            code: "src/components/  src/hooks/  src/utils/  // 400 files each",
            answer: "Group by feature: features/orders/{components,hooks,api,index.ts}, plus a shared ui package. Folders by type do not scale across teams.",
            solution: `src/features/orders/{ui,hooks,api,index.ts}
src/shared/ui/
src/app/routes/`,
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
            task: "Spot the invalid combination.",
            description: "Checks boolean prop explosion.",
            code: "<Button primary danger small large />",
            answer: "primary and danger, small and large conflict but types allow them. Use enums: variant=\"danger\" size=\"sm\".",
            solution: "<Button variant=\"danger\" size=\"sm\" />",
          },
          {
            task: "Type the Button props to pass native attributes through.",
            description: "Checks extending native button props in TS.",
            code: "type ButtonProps = { variant: \"primary\" | \"ghost\" };",
            answer: "Extend ComponentProps<\"button\"> so type, disabled, aria-* and onClick work natively, then spread rest onto <button>.",
            solution: `type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "ghost";
};`,
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
            task: "Fix the key warning without adding a div.",
            description: "Checks keyed Fragments.",
            code: `items.map(i => (
  <><dt>{i.term}</dt><dd>{i.def}</dd></>
))`,
            answer: "The short syntax cannot take a key. Use <Fragment key={i.id}> to group without extra DOM.",
            solution: `items.map(i => (
  <Fragment key={i.id}>
    <dt>{i.term}</dt><dd>{i.def}</dd>
  </Fragment>
))`,
          },
          {
            task: "Predict if Child can read the key prop.",
            description: "Checks that key is not a prop.",
            code: `<Child key="a" />
function Child(props) { return props.key; }`,
            answer: "props.key is undefined and React warns. key is used by React for reconciliation only; pass a separate prop if needed.",
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
            task: "Fix the key.",
            description: "Checks where the key must go.",
            code: `users.map(u => <Row user={u} />)
function Row({ user }) { return <li key={user.id}>{user.name}</li>; }`,
            answer: "The key must be on the element returned by map, not inside Row. Put key on <Row>.",
            solution: "users.map(u => <Row key={u.id} user={u} />)",
          },
          {
            task: "Spot the problem with this key.",
            description: "Checks unstable keys.",
            code: "items.map(i => <Item key={Math.random()} {...i} />)",
            answer: "A new key each render remounts every item, losing state and focus and hurting speed. Use a stable id from the data.",
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
            task: "Predict what the user sees after removing the first todo.",
            description: "Checks index keys with stateful rows.",
            code: `todos.map((t, i) => <TodoRow key={i} todo={t} />)
// TodoRow has local "editing" state`,
            answer: "The editing state stays at index 0 and moves to the next todo. Index keys tie state to position, not item.",
            solution: "todos.map(t => <TodoRow key={t.id} todo={t} />)",
          },
          {
            task: "Name a case where duplicate keys cause bugs.",
            description: "Checks key uniqueness.",
            code: "tags.map(t => <Chip key={t.name} />) // names repeat",
            answer: "Duplicate keys make React drop or merge items, so a row may disappear or keep wrong state. Keys must be unique among siblings.",
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
            task: "Decide if the index key is safe here.",
            description: "Checks when index keys are acceptable.",
            code: `const DAYS = ["Mon", "Tue", "Wed"];
DAYS.map((d, i) => <th key={i}>{d}</th>)`,
            answer: "Yes. The list is static, never reorders, and items have no state. Index keys are safe for fixed, stateless lists.",
          },
          {
            task: "Fix the id generation.",
            description: "Checks generating stable ids.",
            code: "rows.map(r => <Row key={crypto.randomUUID()} row={r} />)",
            answer: "A new UUID each render remounts rows. Assign ids once when data arrives, then use them as keys.",
            solution: `const withIds = data.map(r => ({ ...r, id: crypto.randomUUID() }));
// store withIds in state once
withIds.map(r => <Row key={r.id} row={r} />)`,
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
            task: "Reset the form when userId changes, without an effect.",
            description: "Checks key-based state reset.",
            code: "<ProfileForm userId={userId} />",
            answer: "Pass key={userId}. React remounts the form with fresh state; no effect, no extra render with stale values.",
            solution: "<ProfileForm key={userId} userId={userId} />",
          },
          {
            task: "Spot the problem with this reset.",
            description: "Checks effect-based state reset anti-pattern.",
            code: "useEffect(() => { setDraft(\"\"); }, [chatId]);",
            answer: "It renders once with the old draft, then resets, causing a flash. Use key={chatId} on the component instead.",
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
            task: "Predict what happens to the input when switching tabs.",
            description: "Checks state preserved at same position.",
            code: "{tab === \"a\" ? <Form name=\"a\" /> : <Form name=\"b\" />}",
            answer: "The input keeps its state. Same type at the same position means React updates props, not remounts. Add a key per tab.",
            solution: "<Form key={tab} name={tab} />",
          },
          {
            task: "Name two ways to keep separate state per tab.",
            description: "Checks state preservation choices.",
            code: "<Form name={tab} />",
            answer: "Give each a key (key={tab}), or render both and hide the inactive one to keep both states. Or lift state up by tab id.",
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
            task: "Name the trade-off of virtualization.",
            description: "Checks virtualization costs.",
            code: "<FixedSizeList itemCount={10000} itemSize={36} />",
            answer: "Fast rendering, but Ctrl+F, printing and screen readers only see visible rows. Keep accessible row counts and keyboard navigation.",
          },
          {
            task: "Pick an approach for 10,000 filtered search results.",
            description: "Checks choosing pagination vs virtualization.",
            code: "// users search, rarely scroll past 50 rows",
            answer: "Filter and paginate on the server. Users rarely browse that deep, so do not ship and render 10,000 rows.",
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
            task: "Spot why every row re-renders.",
            description: "Checks memo broken by inline props.",
            code: `const Row = memo(RowImpl);
items.map(i => <Row key={i.id} item={i} onSelect={() => pick(i.id)} />)`,
            answer: "The inline arrow is a new function each render, so memo always fails. Pass a stable callback and the id.",
            solution: `const onSelect = useCallback(id => pick(id), []);
items.map(i => <Row key={i.id} item={i} onSelect={onSelect} />)`,
          },
          {
            task: "Spot the bug in the page merge.",
            description: "Checks immutable updates keeping item identity.",
            code: "setItems(prev => [...prev, ...page].map(i => ({ ...i })));",
            answer: "Copying every item creates new objects, so memoized rows all re-render. Append only: [...prev, ...page].",
            solution: "setItems(prev => [...prev, ...page]);",
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
            task: "Fix the handler so it does not run on render.",
            description: "Checks passing vs calling a handler.",
            code: "<button onClick={save(id)}>Save</button>",
            answer: "save(id) runs during render and passes its result. Wrap it in an arrow function.",
            solution: "<button onClick={() => save(id)}>Save</button>",
          },
          {
            task: "Stop the form from reloading the page.",
            description: "Checks preventDefault on submit.",
            code: "<form onSubmit={() => send()}>",
            answer: "Call e.preventDefault() in onSubmit. Or use a React 19 form action, which handles submit for you.",
            solution: "<form onSubmit={e => { e.preventDefault(); send(); }}>",
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
            task: "Spot why the toggle fires twice.",
            description: "Checks label click double events.",
            code: `<label onClick={toggle}>
  <input type="checkbox" checked={on} readOnly /> Dark
</label>`,
            answer: "Clicking the label also fires a click on the input, which bubbles to the label. Use onChange on the input instead.",
            solution: `<label>
  <input type="checkbox" checked={on} onChange={toggle} /> Dark
</label>`,
          },
          {
            task: "Predict the console in StrictMode.",
            description: "Checks impure updater functions.",
            code: "setOn(prev => { console.log(\"x\"); return !prev; });",
            answer: "\"x\" logs twice in development StrictMode, but on flips once. Updaters must be pure because React may call them twice.",
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
            task: "Fix the handler.",
            description: "Checks event handler arguments.",
            code: "<input onChange={setName} />",
            answer: "setName receives the event object, not the text. Read e.target.value.",
            solution: "<input onChange={e => setName(e.target.value)} />",
          },
          {
            task: "Spot the problem.",
            description: "Checks string handlers in JSX.",
            code: "<button onClick=\"handleClick()\">Go</button>",
            answer: "React needs a function, not a string. A string handler throws a warning and does nothing.",
            solution: "<button onClick={handleClick}>Go</button>",
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
            task: "Predict the log order on a button click.",
            description: "Checks React vs native listener order.",
            code: `document.addEventListener("click", () => log("doc"));
<button onClick={() => log("react")} />`,
            answer: "\"react\" then \"doc\". Since React 17, handlers attach to the root container, which is below document in the bubble path.",
          },
          {
            task: "Name what changed for e.persist() in React 17.",
            description: "Checks event pooling removal.",
            code: "setTimeout(() => console.log(e.target), 0);",
            answer: "Event pooling was removed, so e works asynchronously and persist() does nothing. Before 17, e.target was null here.",
          },
        ],
      },
    ],
    senior: [
      {
        q: `When do you need addEventListener in an effect instead of a JSX event prop? What are passive listeners?`,
        short: `Use addEventListener for targets React does not render (window, document, third-party nodes) and when you need options like passive: false. Passive listeners promise not to call preventDefault, so the browser can scroll without waiting.`,
        long: `JSX props only attach to elements React renders. For window resize, keydown on document, or visibilitychange, add listeners in an effect and remove them in cleanup.\nReact attaches onWheel, onTouchStart and onTouchMove as passive, so e.preventDefault() inside them is ignored with a warning.\nTo block scroll or zoom (custom wheel zoom on a map), add a native listener with { passive: false } on a ref.\nKeep handlers fresh with a ref or useEffectEvent, so you do not re-subscribe every render.\nAlways clean up, or StrictMode will show double listeners.\nUse AbortController signal option to remove many listeners at once.`,
        exercises: [
          {
            task: "Add a window resize listener with cleanup.",
            description: "Checks effect listeners and cleanup.",
            code: `useEffect(() => {
  window.addEventListener("resize", onResize);
}, []);`,
            answer: "Return a cleanup that removes the same function, or listeners leak and double in StrictMode.",
            solution: `useEffect(() => {
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
}, [onResize]);`,
          },
          {
            task: "Fix preventDefault in a wheel handler.",
            description: "Checks passive listeners.",
            code: "<div onWheel={e => e.preventDefault()} />",
            answer: "React attaches wheel as passive, so preventDefault is ignored. Use addEventListener with { passive: false } on a ref.",
            solution: `useEffect(() => {
  const el = ref.current, h = e => e.preventDefault();
  el.addEventListener("wheel", h, { passive: false });
  return () => el.removeEventListener("wheel", h);
}, []);`,
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
            task: "Stop a double submit.",
            description: "Checks pending state guards.",
            code: "async function onSave() { await api.save(form); }",
            answer: "Track pending and disable the button, or use useActionState which exposes isPending. Ignore clicks while pending.",
            solution: `const [, save, isPending] = useActionState(saveAction, null);
<button disabled={isPending} formAction={save}>Save</button>`,
          },
          {
            task: "Fix the stale response race.",
            description: "Checks aborting older requests.",
            code: `useEffect(() => {
  api.get(q).then(setRes);
}, [q]);`,
            answer: "Older slow responses can overwrite newer ones. Abort in cleanup with AbortController.",
            solution: `useEffect(() => {
  const c = new AbortController();
  api.get(q, { signal: c.signal }).then(setRes);
  return () => c.abort();
}, [q]);`,
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
            task: "Pick the error pattern for each case.",
            description: "Checks matching error UI to severity.",
            code: "// 1) invalid email  2) save failed  3) page data 500",
            answer: "Inline for field errors, toast for failed background actions, full page or section state for missing page data.",
          },
          {
            task: "Say how you would get design and engineering to agree.",
            description: "Checks cross-team decision making.",
            code: "// Designers want toasts everywhere; engineers want inline.",
            answer: "Write a short decision doc with real examples, agree on rules per case, then ship one shared ErrorState component.",
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
            task: "Spot the problem.",
            description: "Checks vendor SDKs in components.",
            code: "<button onClick={() => { analytics.track(\"buy\"); buy(); }}>",
            answer: "Vendor calls spread through UI make swapping hard and can throw. Use a thin track() facade with error isolation.",
          },
          {
            task: "Name two risks of SDKs patching global listeners.",
            description: "Checks global side effect risks.",
            code: "window.addEventListener = wrap(window.addEventListener);",
            answer: "Order conflicts and broken stopPropagation, plus memory leaks and slower input. Load SDKs lazily and own one event bus.",
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
            task: "Predict count after one click.",
            description: "Checks state snapshot in handlers.",
            code: `setCount(count + 1);
setCount(count + 1);
setCount(count + 1);`,
            answer: "count increases by 1. Each call reads the same snapshot. Use an updater function.",
            solution: `setCount(c => c + 1);
setCount(c => c + 1);
setCount(c => c + 1);`,
          },
          {
            task: "Predict what is logged.",
            description: "Checks state updates are not immediate.",
            code: `function onClick() {
  setCount(count + 1);
  console.log(count);
}`,
            answer: "The old value. State updates on the next render; the variable in this closure does not change.",
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
            task: "Spot the rule violation.",
            description: "Checks hooks in conditions.",
            code: `if (!user) return null;
const [tab, setTab] = useState("a");`,
            answer: "The hook runs only sometimes, so hook order changes between renders. Call hooks before any early return.",
          },
          {
            task: "Name why hooks must be called in the same order.",
            description: "Checks how React tracks hooks.",
            code: `const [a] = useState(1);
const [b] = useState(2);`,
            answer: "React stores hook state by call order in a list per component. Changing order gives hooks the wrong state.",
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
            task: "Fix the crash on first render.",
            description: "Checks null-safe initial state.",
            code: `const [user, setUser] = useState(null);
return <div>{user.name}</div>;`,
            answer: "user is null before fetch finishes. Guard with a loading state or optional chaining.",
            solution: `if (!user) return <Spinner />;
return <div>{user.name}</div>;`,
          },
          {
            task: "Fix the missing dependency.",
            description: "Checks effect dependencies.",
            code: "useEffect(() => { load(id); }, []);",
            answer: "The effect does not rerun when id changes, so it shows old data. Add id to dependencies.",
            solution: "useEffect(() => { load(id); }, [id]);",
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
            task: "Rewrite as a reducer.",
            description: "Checks moving related state into useReducer.",
            code: `setLoading(true); setError(null);
// later
setLoading(false); setData(d);`,
            answer: "Separate setters allow impossible states like loading with error. A reducer with status keeps transitions valid.",
            solution: `function reducer(s, a) {
  if (a.type === "start") return { status: "loading" };
  if (a.type === "done") return { status: "ok", data: a.data };
  return s;
}`,
          },
          {
            task: "Spot the bug in this reducer.",
            description: "Checks reducer purity.",
            code: `case "add":
  state.items.push(action.item);
  return state;`,
            answer: "It mutates and returns the same object, so React skips the render. Return a new object.",
            solution: `case "add":
  return { ...state, items: [...state.items, action.item] };`,
          },
        ],
      },
    ],
    senior: [
      {
        q: `This component reads a ref during render to show a count. The screen does not update. Why? Fix it.`,
        code: `function ClickCounter() {\n  const clicks = useRef(0);\n  return (\n    <button onClick={() => { clicks.current += 1; }}>\n      Clicked {clicks.current} times\n    </button>\n  );\n}`,
        short: `Changing ref.current does not trigger a render, and reading refs during render is not allowed. Values shown on screen must live in state.`,
        long: `A ref is a mutable box that React does not track.\nUpdating clicks.current changes the value, but React does not know, so the UI stays old.\nReading or writing ref.current during render makes the component impure; the React Compiler and its lint rules flag it.\nRule: if the value affects what you render, use state. If it is only used in handlers or effects (timer id, previous value, DOM node), use a ref.\nA common senior mistake is to mix both: keep state for display and a ref only to read the latest value inside async callbacks.`,
        fix: `function ClickCounter() {\n  const [clicks, setClicks] = useState(0);\n  return (\n    <button onClick={() => setClicks(c => c + 1)}>\n      Clicked {clicks} times\n    </button>\n  );\n}`,
        exercises: [
          {
            task: "Fix the counter so the screen updates.",
            description: "Checks refs do not trigger renders.",
            code: `const clicks = useRef(0);
<button onClick={() => clicks.current++}>{clicks.current}</button>`,
            answer: "Changing a ref does not re-render. Use state for values shown on screen.",
            solution: `const [clicks, setClicks] = useState(0);
<button onClick={() => setClicks(c => c + 1)}>{clicks}</button>`,
          },
          {
            task: "Pick ref or state for each value.",
            description: "Checks ref vs state choice.",
            code: "// 1) timer id  2) input text shown  3) previous scroll position",
            answer: "Ref for the timer id and previous scroll; state for displayed text. Use refs for values that do not affect output.",
          },
        ],
      },
      {
        q: `How does React batch state updates in React 18 and 19? What is flushSync, and when do you need it?`,
        short: `Since React 18, all updates in the same tick are batched into one render, also inside promises and timeouts. flushSync forces React to render and update the DOM right away, for rare cases where you must read the DOM after a state change.`,
        long: `Before React 18, only updates inside React event handlers were batched.\nWith createRoot, automatic batching covers setTimeout, promises, and native listeners too.\nSeveral setState calls in one handler cause one render and one commit.\nflushSync(() => setItems(next)) renders synchronously, so the next line can read the new DOM.\nTypical use: scroll to a newly added item, or keep focus correct with a third-party widget.\nflushSync is expensive and can hurt performance; do not use it as a general fix.\nState inside the current handler is still the old value; use the updater form for chained updates.`,
        exercises: [
          {
            task: "Predict how many renders happen.",
            description: "Checks automatic batching in React 18+.",
            code: `setTimeout(() => {
  setA(1);
  setB(2);
}, 0);`,
            answer: "One render. Since React 18, updates are batched everywhere, including timeouts and promises.",
          },
          {
            task: "Scroll to a new item right after adding it.",
            description: "Checks flushSync use.",
            code: `setItems([...items, item]);
listRef.current.lastChild.scrollIntoView();`,
            answer: "The DOM is not updated yet. Wrap the update in flushSync so the DOM commits first. Use sparingly.",
            solution: `flushSync(() => setItems([...items, item]));
listRef.current.lastChild.scrollIntoView();`,
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
            task: "Remove the effect.",
            description: "Checks derived state in render.",
            code: `const [full, setFull] = useState("");
useEffect(() => setFull(first + " " + last), [first, last]);`,
            answer: "Compute it during render. The effect adds an extra render and can get out of sync.",
            solution: "const full = first + \" \" + last;",
          },
          {
            task: "Move this logic out of the effect.",
            description: "Checks events vs effects.",
            code: `useEffect(() => {
  if (submitted) api.post(form);
}, [submitted]);`,
            answer: "Sending is caused by a user action, so call api.post in the submit handler, not an effect watching a flag.",
            solution: "function onSubmit() { api.post(form); }",
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
            task: "Fix the endless refetch.",
            description: "Checks object deps from callers.",
            code: `useData("/api", { headers: { a: 1 } });
// inside: useEffect(..., [url, opts])`,
            answer: "The inline object is new each render, so the effect reruns forever. Depend on stable primitives or let callers memoize.",
          },
          {
            task: "Name two rules for shared hooks.",
            description: "Checks shared hook standards.",
            code: "export function useData(url) { /* ... */ }",
            answer: "Return a typed, consistent shape like { data, error, isLoading }, and require tests plus docs. Prefer wrapping TanStack Query over custom fetching.",
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
            task: "Make this input controlled.",
            description: "Checks controlled input wiring.",
            code: "<input defaultValue={name} />",
            answer: "Pass value and onChange so React state is the source of truth.",
            solution: `const [name, setName] = useState("");
<input value={name} onChange={e => setName(e.target.value)} />`,
          },
          {
            task: "Read an uncontrolled input on submit.",
            description: "Checks uncontrolled inputs with refs.",
            code: `const ref = useRef(null);
<input ref={ref} defaultValue="a" />`,
            answer: "Read ref.current.value in the submit handler. The DOM holds the value; React does not track it.",
            solution: `function onSubmit(e) {
  e.preventDefault();
  send(ref.current.value);
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
            task: "Fix the submit.",
            description: "Checks submit button and preventDefault.",
            code: `<form>
  <input value={v} onChange={e => setV(e.target.value)} />
  <button onClick={() => send(v)}>Send</button>
</form>`,
            answer: "The button submits the form and reloads the page. Handle onSubmit with preventDefault.",
            solution: `<form onSubmit={e => { e.preventDefault(); send(v); }}>
  <input value={v} onChange={e => setV(e.target.value)} />
  <button>Send</button>
</form>`,
          },
          {
            task: "Submit with a React 19 form action.",
            description: "Checks form actions and FormData.",
            code: `<form action={???}>
  <input name="email" />
</form>`,
            answer: "Pass a function to action. React calls it with FormData and prevents reload.",
            solution: `<form action={fd => send(fd.get("email"))}>
  <input name="email" />
</form>`,
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
            task: "Fix the warning.",
            description: "Checks undefined value switching modes.",
            code: `const [user] = useState({});
<input value={user.name} onChange={...} />`,
            answer: "user.name starts undefined, so the input begins uncontrolled. Default to an empty string.",
            solution: "<input value={user.name ?? \"\"} onChange={...} />",
          },
          {
            task: "Spot the problem.",
            description: "Checks value without onChange.",
            code: "<input value={email} />",
            answer: "A value with no onChange makes the input read-only and React warns. Add onChange, readOnly, or use defaultValue.",
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
            task: "Write a simple required-email check.",
            description: "Checks manual validation.",
            code: `function validate(values) {
  // return errors object
}`,
            answer: "Return an errors map and show messages only after blur or submit.",
            solution: `function validate(v) {
  const e = {};
  if (!v.email) e.email = "Required";
  else if (!v.email.includes("@")) e.email = "Invalid";
  return e;
}`,
          },
          {
            task: "Name a native validation feature to use first.",
            description: "Checks built-in HTML validation.",
            code: "<input name=\"email\" />",
            answer: "Use type=\"email\" and required. The browser validates for free and exposes validity for styling and messages.",
            solution: "<input name=\"email\" type=\"email\" required />",
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
            task: "Add a zod rule for an optional field that becomes required.",
            description: "Checks conditional schema validation.",
            code: "z.object({ hasPhone: z.boolean(), phone: z.string().optional() })",
            answer: "Use superRefine or refine to require phone when hasPhone is true, with path [\"phone\"].",
            solution: `schema.refine(d => !d.hasPhone || !!d.phone, {
  message: "Phone required",
  path: ["phone"],
});`,
          },
          {
            task: "Show a server error on the email field.",
            description: "Checks setError in react-hook-form.",
            code: `const { setError } = useForm();
// server says: email taken`,
            answer: "Call setError(\"email\", { message }) after the request fails; it shows like any field error.",
            solution: "setError(\"email\", { type: \"server\", message: \"Email taken\" });",
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
            task: "Fix the key in useFieldArray.",
            description: "Checks field.id keys.",
            code: "fields.map((f, i) => <input key={i} {...register(`a.${i}`)} />)",
            answer: "Use f.id from useFieldArray. Index keys mix up rows after remove.",
            solution: "fields.map((f, i) => <input key={f.id} {...register(`a.${i}`)} />)",
          },
          {
            task: "Fix the remove button.",
            description: "Checks default button type in forms.",
            code: "<button onClick={() => remove(i)}>x</button>",
            answer: "Buttons in a form default to type submit, so it submits the form. Add type=\"button\".",
            solution: "<button type=\"button\" onClick={() => remove(i)}>x</button>",
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
            task: "Spot the accessibility problem.",
            description: "Checks labels and error linking.",
            code: `<span>Email</span>
<input />
<p className="err">Required</p>`,
            answer: "No label and no link to the error. Use <label htmlFor> and aria-describedby plus aria-invalid.",
            solution: `<label htmlFor="email">Email</label>
<input id="email" aria-invalid aria-describedby="email-err" />
<p id="email-err">Required</p>`,
          },
          {
            task: "Name two parts of a shared form kit.",
            description: "Checks form consistency strategy.",
            code: "// 12 teams, 12 form styles",
            answer: "A FormField component that wires label, error and ARIA, plus shared zod schemas. Enforce with lint and Storybook docs.",
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
            task: "Fix the autosave so it does not fire on each key.",
            description: "Checks debounced autosave.",
            code: "useEffect(() => { save(values); }, [values]);",
            answer: "Debounce the save and abort stale requests. Saving on every key floods the server.",
            solution: `const debounced = useDebouncedValue(values, 800);
useEffect(() => { save(debounced); }, [debounced]);`,
          },
          {
            task: "Name where wizard step state should live.",
            description: "Checks state placement for wizards.",
            code: "// step 1..4, user can refresh or share link",
            answer: "Step in the URL, draft in one form store saved to server. Then refresh and back button work.",
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
            task: "Replace the drilled prop with Context.",
            description: "Checks basic context usage.",
            code: "<Layout theme={theme}><Sidebar theme={theme} /></Layout>",
            answer: "Create a context, wrap the tree in a provider, read it with use or useContext where needed.",
            solution: `const ThemeContext = createContext("light");
<ThemeContext value={theme}><Layout /></ThemeContext>
const theme = use(ThemeContext);`,
          },
          {
            task: "Name a non-Context fix for drilling.",
            description: "Checks composition as an alternative.",
            code: "<Page user={user} /> // Page passes user 3 levels down",
            answer: "Pass the ready element as children or a slot: <Page header={<Avatar user={user} />} />. No middle component needs user.",
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
            task: "Spot why the toolbar does not update.",
            description: "Checks duplicated state in siblings.",
            code: `function Toolbar() { const [n] = useState(0); return n; }
function Plus() { const [n, setN] = useState(0); /* ... */ }`,
            answer: "Each has its own state. Lift count to the common parent and pass it down with a setter.",
          },
          {
            task: "Predict the value read by the consumer.",
            description: "Checks missing provider default.",
            code: `const Ctx = createContext(0);
function Badge() { return use(Ctx); }
<Badge />  // no provider`,
            answer: "0. Without a provider above, consumers get the default value from createContext.",
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
            task: "Fix the re-render on every parent render.",
            description: "Checks unstable provider value.",
            code: "<Ctx value={{ user, setUser }}>",
            answer: "A new object every render updates all consumers. Memoize the value.",
            solution: `const value = useMemo(() => ({ user, setUser }), [user]);
<Ctx value={value}>`,
          },
          {
            task: "Name a way to limit consumer re-renders.",
            description: "Checks splitting contexts.",
            code: "<AppCtx value={{ theme, cart, user }}>",
            answer: "Split into separate contexts by change rate, e.g. ThemeCtx and CartCtx, or use a store with selectors.",
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
            task: "Pick where each state lives.",
            description: "Checks state placement decisions.",
            code: "// 1) modal open  2) search filters  3) logged-in user",
            answer: "Modal open: local. Filters: URL for sharing. User: context or server-state cache.",
          },
          {
            task: "Spot the problem.",
            description: "Checks over-globalized state.",
            code: "store.set({ hoveredRowId: id });",
            answer: "Hover is local, short-lived UI state. Putting it in a global store re-renders listeners and adds noise. Keep it local.",
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
            task: "Replace this with TanStack Query.",
            description: "Checks server state caching.",
            code: `const [data, setData] = useState();
useEffect(() => { fetch("/api/me").then(r => r.json()).then(setData); }, []);`,
            answer: "useQuery handles caching, dedupe, retries and refetch for server state.",
            solution: `const { data } = useQuery({
  queryKey: ["me"],
  queryFn: () => fetch("/api/me").then(r => r.json()),
});`,
          },
          {
            task: "Classify each as server or client state.",
            description: "Checks state categories.",
            code: "// 1) product list  2) sidebar open  3) cart draft",
            answer: "Product list: server. Sidebar: client. Cart draft: client until saved, then server.",
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
            task: "Fix the reducer to use Immer properly.",
            description: "Checks Immer draft mutation.",
            code: `toggle(state, { payload }) {
  return state.map(t => t.id === payload ? (t.done = !t.done, t) : t);
}`,
            answer: "Mutating and returning mixes styles. Just mutate the draft and return nothing.",
            solution: `toggle(state, { payload }) {
  const t = state.find(t => t.id === payload);
  if (t) t.done = !t.done;
}`,
          },
          {
            task: "Memoize the selector.",
            description: "Checks createSelector.",
            code: "useSelector(s => s.todos.filter(t => t.done))",
            answer: "filter returns a new array each time, so it re-renders on any store change. Use createSelector.",
            solution: `const selectDone = createSelector(
  [s => s.todos], todos => todos.filter(t => t.done));
useSelector(selectDone);`,
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
            task: "Name the first step with three state libraries.",
            description: "Checks migration planning.",
            code: "// Redux + MobX + Context in one app",
            answer: "Map which state lives where and classify server vs client state. Move server state to TanStack Query first; it removes most code.",
          },
          {
            task: "Spot the risk.",
            description: "Checks big-bang rewrites.",
            code: "// plan: rewrite all stores in one sprint",
            answer: "A big-bang rewrite blocks features and adds risk. Migrate per feature behind adapters with tests.",
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
            task: "Read one flag without re-rendering on others.",
            description: "Checks useSyncExternalStore selectors.",
            code: "const flags = useContext(FlagsCtx); // whole object",
            answer: "Keep flags in an external store and subscribe to one key with useSyncExternalStore.",
            solution: `function useFlag(key) {
  return useSyncExternalStore(store.subscribe,
    () => store.get(key));
}`,
          },
          {
            task: "Spot the problem.",
            description: "Checks primitive snapshot stability.",
            code: "useSyncExternalStore(sub, () => ({ ...store.flags }))",
            answer: "getSnapshot returns a new object each call, causing endless re-renders. Return a cached or primitive value.",
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
            task: "Read the id from the URL.",
            description: "Checks useParams.",
            code: "<Route path=\"/users/:id\" element={<User />} />",
            answer: "Call useParams in User. Values are strings, so convert if you need a number.",
            solution: `function User() {
  const { id } = useParams();
  return <p>User {id}</p>;
}`,
          },
          {
            task: "Add a 404 route.",
            description: "Checks catch-all routes.",
            code: `<Routes>
  <Route path="/" element={<Home />} />
</Routes>`,
            answer: "Add a path=\"*\" route last; it matches anything not matched before.",
            solution: "<Route path=\"*\" element={<NotFound />} />",
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
            task: "Fix the link.",
            description: "Checks Link vs anchor.",
            code: "<a href=\"/settings\">Settings</a>",
            answer: "An anchor reloads the whole app. Use Link for client navigation.",
            solution: "<Link to=\"/settings\">Settings</Link>",
          },
          {
            task: "Fix the navigation during render.",
            description: "Checks navigate in effects or Navigate.",
            code: `if (!user) navigate("/login");
return <Dashboard />;`,
            answer: "Calling navigate during render is a side effect. Return <Navigate> instead.",
            solution: `if (!user) return <Navigate to="/login" replace />;
return <Dashboard />;`,
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
            task: "Write a simple protected route wrapper.",
            description: "Checks route guards with Outlet.",
            code: `<Route element={<RequireAuth />}>
  <Route path="admin" element={<Admin />} />
</Route>`,
            answer: "RequireAuth returns Outlet when logged in, otherwise Navigate to login with the current location.",
            solution: `function RequireAuth() {
  const user = useUser();
  const loc = useLocation();
  return user ? <Outlet /> : <Navigate to="/login" state={{ from: loc }} />;
}`,
          },
          {
            task: "Lazy load the Admin page.",
            description: "Checks React.lazy with Suspense.",
            code: "import Admin from \"./Admin\";",
            answer: "Use lazy with a dynamic import and wrap with Suspense.",
            solution: `const Admin = lazy(() => import("./Admin"));
<Suspense fallback={<Spinner />}><Admin /></Suspense>`,
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
            task: "Spot why the page is blank.",
            description: "Checks missing Suspense boundary.",
            code: `const Report = lazy(() => import("./Report"));
<Route path="r" element={<Report />} />`,
            answer: "No Suspense boundary above, so React has nothing to show while loading. Wrap in Suspense with a fallback.",
          },
          {
            task: "Handle a failed chunk load.",
            description: "Checks error boundaries for lazy imports.",
            code: "const Report = lazy(() => import(\"./Report\"));",
            answer: "A network failure rejects the import and throws. Wrap with an error boundary offering retry or reload.",
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
            task: "Read and update a filter in the URL.",
            description: "Checks useSearchParams.",
            code: "const [status, setStatus] = useState(\"all\");",
            answer: "Use useSearchParams so the filter survives refresh and can be shared.",
            solution: `const [params, setParams] = useSearchParams();
const status = params.get("status") ?? "all";
setParams({ status: "open" });`,
          },
          {
            task: "Name two risks of URL filters.",
            description: "Checks URL state pitfalls.",
            code: "?status=open&q=...&page=3",
            answer: "Invalid or tampered values must be validated, and each change may add history entries; use replace for typing.",
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
            task: "Move the fetch to a loader.",
            description: "Checks data router loaders.",
            code: "useEffect(() => { fetch(`/api/p/${id}`).then(...); }, [id]);",
            answer: "A loader fetches before render and in parallel with code, avoiding waterfalls.",
            solution: `export async function loader({ params }) {
  return fetch(\`/api/p/\${params.id}\`);
}
const data = useLoaderData();`,
          },
          {
            task: "Name what actions do after a form submit.",
            description: "Checks actions and revalidation.",
            code: "<Form method=\"post\">...</Form>",
            answer: "The route action runs, then loaders revalidate automatically, so the UI shows fresh data without manual refetch.",
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
            task: "Name how to keep old Vue URLs working.",
            description: "Checks redirects during migration.",
            code: "// Vue: /#/orders/5   React: /orders/5",
            answer: "Add a redirect map for old paths, including hash URLs, and test deep links in CI.",
          },
          {
            task: "Spot the risk.",
            description: "Checks two routers fighting.",
            code: "// both Vue Router and React Router listen to history",
            answer: "Both routers react to the same URL changes and can fight. Give each a path prefix and one owner per route.",
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
            task: "Write a can() check for a route.",
            description: "Checks central permission checks.",
            code: "{ path: \"billing\", requires: { role: \"admin\", flag: \"billing\" } }",
            answer: "Keep rules as data on routes and check in one function used by router and menu.",
            solution: `function can(user, req) {
  return (!req.role || user.roles.includes(req.role))
    && (!req.flag || user.flags[req.flag]);
}`,
          },
          {
            task: "Spot the security gap.",
            description: "Checks client-only authorization.",
            code: "if (user.role !== \"admin\") return <Navigate to=\"/\" />;",
            answer: "Client checks only hide UI. The API must also enforce permissions, or users can call it directly.",
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
            task: "Write a minimal error boundary.",
            description: "Checks class error boundary API.",
            code: `class Boundary extends Component {
  // your code
}`,
            answer: "Use getDerivedStateFromError to set state and render fallback; log in componentDidCatch.",
            solution: `class Boundary extends Component {
  state = { err: null };
  static getDerivedStateFromError(err) { return { err }; }
  render() { return this.state.err ? <p>Error</p> : this.props.children; }
}`,
          },
          {
            task: "Name why a function component cannot be a boundary.",
            description: "Checks boundary implementation limits.",
            code: "function Boundary({ children }) { /* try/catch? */ }",
            answer: "There is no hook for getDerivedStateFromError yet. Use a class or react-error-boundary.",
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
            task: "Place the boundary so only the widget fails.",
            description: "Checks boundary granularity.",
            code: "<Boundary><Page><Chart /><Table /></Page></Boundary>",
            answer: "A single top boundary blanks the page. Wrap each widget in its own boundary.",
            solution: `<Page>
  <Boundary><Chart /></Boundary>
  <Boundary><Table /></Boundary>
</Page>`,
          },
          {
            task: "Predict what renders when Chart throws.",
            description: "Checks unhandled render errors.",
            code: "<App><Chart /></App> // no boundary",
            answer: "React unmounts the whole tree, leaving a blank page. Since React 19, it also reports to the root onUncaughtError.",
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
            task: "Predict whether the boundary catches this.",
            description: "Checks event handler errors.",
            code: "<button onClick={() => { throw new Error(\"x\"); }}>",
            answer: "No. Errors in event handlers are not in render, so boundaries ignore them. Use try/catch or set error state.",
          },
          {
            task: "Name two more error types boundaries miss.",
            description: "Checks boundary limits.",
            code: "setTimeout(() => { throw err; });",
            answer: "Async code like timeouts and promises, and errors in the boundary itself. Server rendering errors are handled separately too.",
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
            task: "Send an async error to the boundary.",
            description: "Checks rethrowing via state.",
            code: "fetchUser().catch(err => /* ??? */);",
            answer: "Store the error in state and throw it during render, or use useQuery with throwOnError.",
            solution: `const [err, setErr] = useState(null);
if (err) throw err;
fetchUser().catch(setErr);`,
          },
          {
            task: "Load data declaratively with Suspense.",
            description: "Checks use() with promises.",
            code: "const [user, setUser] = useState(null);",
            answer: "Pass a cached promise and read it with use. Suspense shows the fallback, the boundary catches errors.",
            solution: `function User({ userPromise }) {
  const user = use(userPromise);
  return <p>{user.name}</p>;
}`,
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
            task: "Add a retry button to the fallback.",
            description: "Checks resetting error boundaries.",
            code: "<ErrorBoundary fallback={<p>Error</p>}>",
            answer: "Use fallbackRender with resetErrorBoundary, and resetKeys to reset when inputs change.",
            solution: `<ErrorBoundary fallbackRender={({ resetErrorBoundary }) =>
  <button onClick={resetErrorBoundary}>Retry</button>}>`,
          },
          {
            task: "Name where boundaries usually go.",
            description: "Checks boundary placement strategy.",
            code: "// app shell, routes, widgets",
            answer: "One at the root, one per route, and around risky widgets. The shell and navigation should stay usable.",
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
            task: "Add context to this error report.",
            description: "Checks useful error metadata.",
            code: "Sentry.captureException(err);",
            answer: "Add route, release, user id (not PII) and feature tags so errors can be grouped and owned.",
            solution: `Sentry.captureException(err, {
  tags: { route, feature: "checkout" },
});`,
          },
          {
            task: "Name two ways to cut error noise.",
            description: "Checks filtering error logs.",
            code: "// 50% of errors: ResizeObserver loop, extensions",
            answer: "Filter known browser noise and extension frames, and sample repeated errors. Alert on rate changes, not counts.",
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
            task: "Describe one process change after an incident.",
            description: "Checks learning from incidents.",
            code: "// a null field crashed checkout for 2 hours",
            answer: "Good answers name a concrete fix: schema validation at API edge, boundary around checkout, or a canary release with alerts.",
          },
          {
            task: "Say what belongs in a blameless postmortem.",
            description: "Checks incident writing.",
            code: "// incident review meeting tomorrow",
            answer: "Timeline, impact, root cause, what helped, and owned action items with dates. Focus on systems, not people.",
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
            task: "Make one failing widget not break the dashboard.",
            description: "Checks partial failure isolation.",
            code: "const [a, b] = await Promise.all([getA(), getB()]);",
            answer: "Promise.all fails if one fails. Use allSettled or separate queries with per-widget error states.",
            solution: `const [a, b] = await Promise.allSettled([getA(), getB()]);
// render each by status`,
          },
          {
            task: "Name two resilience patterns for a down service.",
            description: "Checks frontend resilience.",
            code: "// recommendations API is down",
            answer: "Show cached or stale data with a notice, and retry with backoff. Hide the optional widget instead of the page.",
          },
        ],
      },
    ],
  },
  "Advanced Hooks (e.g useLayoutEffect, useImperativeHandle)": {
    junior: [
      {
        q: `What does useImperativeHandle do? When should you use it?`,
        short: `It lets a component choose what a parent sees through its ref, for example only focus() and clear() instead of the whole DOM node. Use it rarely, for imperative actions like focus, scroll or play.`,
        long: `By default a ref on a DOM element gives the parent the full DOM node.\nuseImperativeHandle(ref, () => ({ focus, clear }), [deps]) replaces that with a small custom object.\nIn React 19, ref is a normal prop on function components, so you read it from props; forwardRef is no longer needed.\nUse it for actions that do not fit props: focus, scrollIntoView, play, pause, open a native dialog.\nAvoid it for data flow. If something can be expressed as a prop (isOpen, value), use a prop.\nKeep the exposed API small so you can change the internals later.`,
        exercises: [
          {
            task: "Expose only focus() to the parent.",
            description: "Checks useImperativeHandle basics.",
            code: `function Input({ ref }) {
  const inner = useRef(null);
  return <input ref={inner} />;
}`,
            answer: "Use useImperativeHandle to expose a small API instead of the whole DOM node.",
            solution: `useImperativeHandle(ref, () => ({
  focus: () => inner.current.focus(),
}));`,
          },
          {
            task: "Decide if this needs an imperative handle.",
            description: "Checks preferring props over handles.",
            code: "modalRef.current.open();",
            answer: "No. Opening a modal is state; pass an open prop. Use handles for focus, scroll or media playback.",
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
            task: "Focus the input when edit mode opens.",
            description: "Checks focusing after render.",
            code: `setEditing(true);
inputRef.current.focus();`,
            answer: "The input does not exist yet. Focus in an effect after it mounts, or use autoFocus.",
            solution: `useEffect(() => {
  if (editing) inputRef.current?.focus();
}, [editing]);`,
          },
          {
            task: "Use a ref callback to focus on mount.",
            description: "Checks callback refs.",
            code: "{editing && <input ref={???} />}",
            answer: "A callback ref runs when the node mounts. In React 19 it can return a cleanup.",
            solution: "{editing && <input ref={el => el?.focus()} />}",
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
            task: "Fix the debounce hook.",
            description: "Checks timer cleanup in effects.",
            code: `useEffect(() => {
  setTimeout(() => setV(value), delay);
}, [value, delay]);`,
            answer: "Without cleanup old timers still fire. Clear the timer on change.",
            solution: `useEffect(() => {
  const t = setTimeout(() => setV(value), delay);
  return () => clearTimeout(t);
}, [value, delay]);`,
          },
          {
            task: "Test the debounce hook with fake timers.",
            description: "Checks hook testing.",
            code: "const { result, rerender } = renderHook(...);",
            answer: "Use vi.useFakeTimers, rerender with a new value, advance by delay inside act, then expect the new value.",
            solution: `vi.useFakeTimers();
rerender({ v: "b" });
act(() => vi.advanceTimersByTime(300));
expect(result.current).toBe("b");`,
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
            task: "Improve this hook's return value.",
            description: "Checks hook API design.",
            code: "return [data, loading, error, refetch, reset];",
            answer: "Long tuples are easy to misorder. Return an object: { data, isLoading, error, refetch }.",
          },
          {
            task: "Spot the problem.",
            description: "Checks hooks hiding effects.",
            code: `function useUser() {
  useEffect(() => { track("view"); }, []);
}`,
            answer: "A hidden side effect surprises callers and runs on every use. Keep hooks focused; track in the page.",
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
            task: "Fix the one-frame flicker.",
            description: "Checks useLayoutEffect for measurements.",
            code: `useEffect(() => {
  setTop(ref.current.getBoundingClientRect().bottom);
}, []);`,
            answer: "useEffect runs after paint, so one wrong frame shows. useLayoutEffect runs before paint.",
            solution: `useLayoutEffect(() => {
  setTop(ref.current.getBoundingClientRect().bottom);
}, []);`,
          },
          {
            task: "Name the cost of useLayoutEffect.",
            description: "Checks layout effect trade-offs.",
            code: "useLayoutEffect(() => heavyWork(), [list]);",
            answer: "It blocks painting, so heavy work makes the UI janky, and it warns on the server in older React. Use only for measuring.",
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
            task: "Make a slow filter non-blocking.",
            description: "Checks useDeferredValue.",
            code: "<Results query={query} /> // slow render",
            answer: "Defer the value so typing stays fast and results update when React has time.",
            solution: `const deferred = useDeferredValue(query);
<Results query={deferred} />`,
          },
          {
            task: "Fix the id.",
            description: "Checks useId for labels.",
            code: `<label htmlFor="name">Name</label>
<input id="name" />`,
            answer: "Fixed ids clash when the component renders twice. useId gives a unique id stable on server and client.",
            solution: `const id = useId();
<label htmlFor={id}>Name</label>
<input id={id} />`,
          },
        ],
      },
    ],
    techlead: [
      {
        q: `In a design system, when is useImperativeHandle a good API, and when is it a warning sign?`,
        short: `It is good for small, real imperative actions like focus, scroll, or select text. It is a warning sign when it exposes state or data, like open, setValue, or getItems, because that hides state from React and from the parent.`,
        long: `Design system inputs often need focus() for form errors and accessibility; a tiny handle is fine.\nMedia and canvas components may expose play, pause, or toDataURL.\nWarning signs: methods that change visible state (open, setTab, setValue), getters for internal data, or large handles that copy the whole DOM API.\nThose make components hard to control, test, and server render, and they break when internals change.\nRule: prefer props and callbacks; allow a handle only for actions that cannot be data.\nDocument the handle as public API, type it, and version it like props.\nIn React 19 ref is a prop, so the handle shape is part of the props type.`,
        exercises: [
          {
            task: "Decide if this handle is a good API.",
            description: "Checks imperative APIs in design systems.",
            code: "dialogRef.current.setTitle(\"Hi\");",
            answer: "No. Title is data; pass it as a prop. Handles are fine for focus(), scrollTo() or play().",
          },
          {
            task: "Spot the warning sign.",
            description: "Checks leaking internals via handles.",
            code: "useImperativeHandle(ref, () => inputEl.current);",
            answer: "It leaks the whole DOM node, so callers depend on internals. Expose only the methods you support.",
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
            task: "Write useMediaQuery with useSyncExternalStore.",
            description: "Checks tear-free media queries.",
            code: "function useMediaQuery(q) { /* your code */ }",
            answer: "Subscribe to matchMedia change events; provide a server snapshot to avoid crashes.",
            solution: `function useMediaQuery(q) {
  return useSyncExternalStore(
    cb => { const m = matchMedia(q); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); },
    () => matchMedia(q).matches,
    () => false);
}`,
          },
          {
            task: "Spot the server problem.",
            description: "Checks window on the server.",
            code: "const [m] = useState(window.matchMedia(q).matches);",
            answer: "window does not exist on the server, so it crashes. Use a server snapshot or read it in an effect.",
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
            task: "Pick SSR or CSR for each page.",
            description: "Checks rendering choices.",
            code: "// 1) public product page  2) internal admin grid",
            answer: "SSR for the public page for SEO and fast first paint. CSR is fine for the logged-in admin grid.",
          },
          {
            task: "Name one cost of SSR.",
            description: "Checks SSR trade-offs.",
            code: "// moving from Vite SPA to SSR",
            answer: "You need a server running, plus hydration cost and server-safe code. Time to interactive may not improve.",
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
            task: "Replace the blocking server render.",
            description: "Checks streaming SSR APIs.",
            code: `const html = renderToString(<App />);
res.send(html);`,
            answer: "renderToString waits for everything and does not support Suspense streaming. Use renderToPipeableStream.",
            solution: `const { pipe } = renderToPipeableStream(<App />, {
  onShellReady() { res.setHeader("content-type", "text/html"); pipe(res); },
});`,
          },
          {
            task: "Add a fallback for the slow part.",
            description: "Checks Suspense in streaming.",
            code: "<Layout><Reviews /></Layout> // Reviews is slow",
            answer: "Wrap Reviews in Suspense so the shell streams first and Reviews streams later.",
            solution: `<Layout>
  <Suspense fallback={<Skeleton />}><Reviews /></Suspense>
</Layout>`,
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
            task: "Fix the mismatch.",
            description: "Checks non-deterministic render values.",
            code: "<p>{new Date().toLocaleTimeString()}</p>",
            answer: "Server and client times differ. Render the time after mount in an effect, or pass it from server.",
            solution: `const [t, setT] = useState(null);
useEffect(() => setT(new Date().toLocaleTimeString()), []);
<p>{t}</p>`,
          },
          {
            task: "Spot the mismatch.",
            description: "Checks browser-only branches.",
            code: "return typeof window !== \"undefined\" ? <Mobile /> : <Desktop />;",
            answer: "Server renders Desktop, client renders Mobile during hydration, so they mismatch. Decide after mount instead.",
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
            task: "Predict what reaches the browser first.",
            description: "Checks streaming order.",
            code: `<Header />
<Suspense fallback={<Spin />}><Comments /></Suspense>`,
            answer: "Header and the Spin fallback stream first. Comments HTML streams later and replaces the fallback in place.",
          },
          {
            task: "Explain selective hydration in one sentence.",
            description: "Checks hydration priority.",
            code: "// user clicks Comments before it hydrates",
            answer: "React hydrates Suspense parts separately and prioritizes the part the user interacts with.",
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
            task: "Spot what cannot run in a Server Component.",
            description: "Checks RSC constraints.",
            code: `export default function Page() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(1)}>{n}</button>;
}`,
            answer: "Server Components cannot use state or event handlers. Move the button into a \"use client\" component.",
          },
          {
            task: "Name a benefit of RSC over SSR.",
            description: "Checks RSC value.",
            code: "import { marked } from \"marked\"; // 40 KB",
            answer: "Server Component code and its libraries are never shipped to the browser, so the bundle is smaller.",
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
            task: "Fix the leak.",
            description: "Checks props crossing to client.",
            code: "<ProfileCard user={user} /> // user has passwordHash",
            answer: "All props to a Client Component are serialized and sent to the browser. Pass only needed fields.",
            solution: "<ProfileCard name={user.name} avatar={user.avatar} />",
          },
          {
            task: "Name a guard against server-only leaks.",
            description: "Checks server-only modules.",
            code: "import { db } from \"./db\";",
            answer: "Add import \"server-only\" to server modules so importing them from client code fails the build. React taint APIs also help.",
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
            task: "Name one strong reason against Next.js here.",
            description: "Checks framework fit.",
            code: "// admin app, all behind login, Vite SPA works well",
            answer: "No SEO need and SPA works; Next.js adds server ops and complexity for little gain.",
          },
          {
            task: "Name one strong reason for Next.js.",
            description: "Checks framework value.",
            code: "// many slow dashboards, heavy client bundle",
            answer: "Server Components and streaming can cut bundle size and speed up data-heavy pages.",
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
            task: "Spot the caching bug.",
            description: "Checks caching personalized responses.",
            code: `res.setHeader("Cache-Control", "public, max-age=600");
// page includes user-specific prices`,
            answer: "A shared CDN may serve one user's prices to others. Use private, or cache the shell and fetch prices per user.",
          },
          {
            task: "Split what can be cached.",
            description: "Checks splitting static and personal data.",
            code: "// product details + user price",
            answer: "Cache product details publicly; fetch the user price separately with no-store or a private cache.",
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
            task: "Predict whether Child re-renders.",
            description: "Checks parent re-render cascade.",
            code: `function Parent() {
  const [n, setN] = useState(0);
  return <><button onClick={() => setN(n + 1)} /><Child /></>;
}`,
            answer: "Yes. A parent render re-renders all children by default, even with no props. Wrap Child in memo or move state down.",
          },
          {
            task: "Avoid the re-render by moving state down.",
            description: "Checks state colocation.",
            code: `function Page() {
  const [q, setQ] = useState("");
  return <><input value={q} onChange={e => setQ(e.target.value)} /><HeavyChart /></>;
}`,
            answer: "Move the input and its state into a SearchBox component; HeavyChart no longer re-renders.",
            solution: `function SearchBox() {
  const [q, setQ] = useState("");
  return <input value={q} onChange={e => setQ(e.target.value)} />;
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
            task: "Fix the memo.",
            description: "Checks inline object props.",
            code: `const List = memo(ListImpl);
<List items={items} style={{ gap: 8 }} />`,
            answer: "The inline style object is new each render, so memo fails. Hoist it to a constant.",
            solution: `const STYLE = { gap: 8 };
<List items={items} style={STYLE} />`,
          },
          {
            task: "Fix the filtered prop.",
            description: "Checks useMemo for derived arrays.",
            code: "<List items={items.filter(i => i.active)} />",
            answer: "filter creates a new array every render. Memoize it.",
            solution: `const active = useMemo(() => items.filter(i => i.active), [items]);
<List items={active} />`,
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
            task: "Keep typing fast while results update.",
            description: "Checks useTransition for heavy updates.",
            code: "onChange={e => { setQ(e.target.value); setResults(filter(e.target.value)); }}",
            answer: "Mark the heavy update as a transition so the input stays responsive.",
            solution: `const [, start] = useTransition();
onChange={e => {
  setQ(e.target.value);
  start(() => setResults(filter(e.target.value)));
}}`,
          },
          {
            task: "Name how to confirm what is slow.",
            description: "Checks profiling first.",
            code: "// typing lags in search box",
            answer: "Record with React DevTools Profiler to see which components render and how long. Then fix the biggest one.",
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
            task: "Predict if the compiler can optimize this.",
            description: "Checks compiler bailouts on rule breaks.",
            code: `function Card({ item }) {
  item.seen = true;
  return <p>{item.name}</p>;
}`,
            answer: "No. Mutating props breaks React rules, so the compiler skips this component. Fix the mutation first.",
          },
          {
            task: "Name what the compiler replaces.",
            description: "Checks compiler scope.",
            code: `const v = useMemo(() => calc(a), [a]);
const f = useCallback(() => go(b), [b]);`,
            answer: "Manual useMemo, useCallback and memo. It does not fix slow algorithms, big bundles or network waterfalls.",
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
            task: "Name the first step for a 3 MB bundle.",
            description: "Checks bundle analysis.",
            code: "// vite build -> 3 MB main.js",
            answer: "Run a bundle analyzer like rollup-plugin-visualizer to find the largest modules, then split routes and replace heavy libraries.",
          },
          {
            task: "Spot why every widget re-renders.",
            description: "Checks context-driven re-renders.",
            code: `<FiltersCtx value={{ filters, setFilters }}>
  <Dashboard /> {/* 20 widgets read the context */}
</FiltersCtx>`,
            answer: "Every widget reads the whole context object. Select only needed fields with a store, or split contexts.",
          },
        ],
      },
      {
        q: `This gallery page is slow to load on mobile. Fix the image loading.`,
        code: `function Gallery({ photos }) {\n  return (\n    <div className="grid">\n      {photos.map(p => (\n        <img key={p.id} src={p.originalUrl} alt="" />\n      ))}\n    </div>\n  );\n}`,
        short: `All 200 full-size images download at once, with no sizes, so layout jumps and the main image competes with off-screen ones. Use responsive srcset and sizes, lazy loading, width and height, and real alt text.`,
        long: `originalUrl may be several megabytes; phones download it even for a small thumbnail.\nsrcset with sizes lets the browser pick the right file for the screen.\nloading="lazy" delays off-screen images; keep the first visible image eager, and give it fetchPriority="high" if it is the LCP image.\nwidth and height (or aspect-ratio in CSS) reserve space and stop layout shift (CLS).\ndecoding="async" keeps decoding off the critical path.\nalt="" hides images from screen readers; photos with meaning need real text.\nFor very long galleries, add virtualization too.`,
        fix: `function Gallery({ photos }) {\n  return (\n    <div className="grid">\n      {photos.map((p, i) => (\n        <img\n          key={p.id}\n          src={p.url400}\n          srcSet={\`\${p.url400} 400w, \${p.url800} 800w\`}\n          sizes="(max-width: 600px) 50vw, 25vw"\n          width={400}\n          height={300}\n          loading={i < 4 ? "eager" : "lazy"}\n          fetchPriority={i === 0 ? "high" : "auto"}\n          decoding="async"\n          alt={p.title}\n        />\n      ))}\n    </div>\n  );\n}`,
        exercises: [
          {
            task: "Fix image loading for a gallery.",
            description: "Checks lazy and responsive images.",
            code: "<img src={photo.full} />",
            answer: "Add loading=\"lazy\", width and height to avoid layout shift, and srcset for smaller mobile files.",
            solution: `<img src={photo.full} srcSet={\`\${photo.sm} 480w, \${photo.full} 1600w\`}
  sizes="(max-width: 600px) 480px, 1600px"
  loading="lazy" width={400} height={300} alt={photo.alt} />`,
          },
          {
            task: "Name what to do for the hero image.",
            description: "Checks LCP image priority.",
            code: "<img src={hero} loading=\"lazy\" />",
            answer: "Do not lazy load the LCP image. Use fetchPriority=\"high\" so it loads first.",
            solution: "<img src={hero} fetchPriority=\"high\" alt=\"\" />",
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
            task: "Name two habits to keep performance healthy.",
            description: "Checks team performance practices.",
            code: "// perf cleanups every 6 months",
            answer: "Bundle size budgets in CI and real-user Core Web Vitals dashboards with owners. Review perf in PRs that touch hot paths.",
          },
          {
            task: "Spot the problem with this metric.",
            description: "Checks lab vs field data.",
            code: "// \"Lighthouse is 98 on my MacBook\"",
            answer: "A lab score on a fast laptop hides real users on slow phones. Track field data like INP and LCP.",
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
            task: "Write a simple perf check for a key action.",
            description: "Checks performance tests in CI.",
            code: "// Playwright test: open order",
            answer: "Measure with performance.mark around the action and fail if time is over budget, run several times to reduce noise.",
            solution: `const ms = await page.evaluate(() =>
  performance.getEntriesByName("order-open")[0].duration);
expect(ms).toBeLessThan(500);`,
          },
          {
            task: "Name a way to reduce flaky perf tests.",
            description: "Checks reliable perf testing.",
            code: "// timing varies 30% between CI runs",
            answer: "Run many times and compare medians, use CPU throttling and fixed hardware, and compare against a baseline, not a fixed number.",
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
            task: "Mount a chart library in an effect.",
            description: "Checks integrating DOM libraries.",
            code: `function Chart({ data }) {
  const ref = useRef(null);
  return <div ref={ref} />;
}`,
            answer: "Create the chart in an effect on the ref, destroy it in cleanup, update data in another effect.",
            solution: `useEffect(() => {
  const c = new LibChart(ref.current);
  return () => c.destroy();
}, []);`,
          },
          {
            task: "Spot the problem.",
            description: "Checks React and libraries owning the same DOM.",
            code: `<div ref={ref}>{items.map(i => <p key={i}>{i}</p>)}</div>
// library also writes into ref.current`,
            answer: "React and the library both change the same nodes, which breaks reconciliation. Give the library an empty div.",
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
            task: "Sync React state into the date picker.",
            description: "Checks updating imperative widgets.",
            code: "useEffect(() => { $(ref.current).datepicker(); }, []);",
            answer: "Add an effect that calls the picker's setDate when value changes, and destroy on unmount.",
            solution: `useEffect(() => {
  $(ref.current).datepicker("setDate", value);
}, [value]);`,
          },
          {
            task: "Fix the stale onChange.",
            description: "Checks stale callbacks in widgets.",
            code: `useEffect(() => {
  $(el).datepicker({ onSelect: d => onChange(d) });
}, []);`,
            answer: "onSelect captures the first onChange. Keep the latest callback in a ref or use useEffectEvent.",
            solution: `const onSelect = useEffectEvent(d => onChange(d));
useEffect(() => {
  $(el).datepicker({ onSelect: d => onSelect(d) });
}, []);`,
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
            task: "Write an optimistic like with useOptimistic.",
            description: "Checks React 19 optimistic updates.",
            code: "const [liked, setLiked] = useState(false);",
            answer: "Show the optimistic value during the action; it reverts if the action fails.",
            solution: `const [optLiked, setOpt] = useOptimistic(liked);
async function toggle() {
  setOpt(!liked);
  setLiked(await api.like(!liked));
}`,
          },
          {
            task: "Spot the bug.",
            description: "Checks optimistic updates outside transitions.",
            code: "setOpt(true); // called in a plain onClick, no action",
            answer: "useOptimistic updates must run inside an action or startTransition, otherwise React warns and the value does not stick.",
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
            task: "Render a modal into document.body.",
            description: "Checks createPortal.",
            code: "function Modal({ children }) { /* your code */ }",
            answer: "Use createPortal to escape overflow and z-index of parents.",
            solution: `function Modal({ children }) {
  return createPortal(<div role="dialog">{children}</div>, document.body);
}`,
          },
          {
            task: "Predict if the parent onClick fires.",
            description: "Checks event bubbling through portals.",
            code: `<div onClick={() => log("parent")}>
  {createPortal(<button>x</button>, document.body)}
</div>`,
            answer: "Yes. React events bubble through the React tree, not the DOM tree, so the parent handler fires.",
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
            task: "Name how to share login between Vue and React.",
            description: "Checks shared auth during migration.",
            code: "// Vue and React pages, same domain",
            answer: "Use a shared HttpOnly cookie session, or one auth module both apps import. Do not keep two copies of tokens.",
          },
          {
            task: "Name a way to share the design system.",
            description: "Checks design tokens across frameworks.",
            code: "// Vue buttons and React buttons look different",
            answer: "Share design tokens as CSS variables so both frameworks use the same colors and spacing; build components per framework.",
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
            task: "Clean up React in a custom element.",
            description: "Checks unmounting roots.",
            code: `connectedCallback() {
  createRoot(this).render(<Widget />);
}`,
            answer: "Keep the root and unmount it in disconnectedCallback, or it leaks.",
            solution: `connectedCallback() { this.root = createRoot(this); this.render(); }
disconnectedCallback() { this.root.unmount(); }`,
          },
          {
            task: "React to attribute changes.",
            description: "Checks observedAttributes.",
            code: `class W extends HTMLElement {
  // attribute "user-id" changes are ignored
}`,
            answer: "Declare observedAttributes and re-render in attributeChangedCallback.",
            solution: `static observedAttributes = ["user-id"];
attributeChangedCallback() {
  this.root?.render(<Widget userId={this.getAttribute("user-id")} />);
}`,
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
            task: "Name when to say no to micro-frontends.",
            description: "Checks architecture trade-offs.",
            code: "// 8 teams, one product, one release cadence",
            answer: "If teams share one deploy and one product, a modular monorepo is simpler. MFEs add runtime cost and version issues.",
          },
          {
            task: "Name one must-have if you do micro-frontends.",
            description: "Checks MFE setup basics.",
            code: "// each team bundles its own React",
            answer: "Share one React copy as a singleton and agree on contracts for routing, auth and design tokens.",
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
            task: "Spot the problems in this AI code.",
            description: "Checks reviewing generated UI.",
            code: "<div onClick={submit} className=\"btn\">Submit</div>",
            answer: "A div is not focusable or keyboard accessible. Use a real <button>. Lint with jsx-a11y to catch this.",
          },
          {
            task: "Name two guardrails for AI UI code.",
            description: "Checks quality controls.",
            code: "// teams paste generated components daily",
            answer: "Strict lint and type checks in CI, plus required use of design system components. Add axe tests and human review.",
          },
        ],
      },
    ],
  },
};
