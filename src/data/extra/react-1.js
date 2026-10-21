export default {
  React: {
    'JSX, Virtual DOM, and Components': {
      junior: [
        {
          q: `Why must component names start with a capital letter in JSX?`,
          short: `JSX treats lowercase tags as built-in DOM elements (strings) and capitalized tags as references to components (variables).`,
          long: `<div /> compiles to jsx('div', ...) — a string type, rendered as a DOM node.\n<MyButton /> compiles to jsx(MyButton, ...) — a reference to a function/class.\nIf you write <myButton />, React tries to create an unknown DOM element "mybutton" and warns.\nDotted names like <Form.Input /> are also treated as references.\nTo render a dynamic component, assign it to a capitalized variable first: const Tag = components[type]; <Tag />.`,
          exercises: [
            {
              task: "Predict what this renders.",
              description: "Checks lowercase component names.",
              code: `const card = () => <p>Hi</p>;
return <card />;`,
              answer: "An unknown <card> DOM element, not \"Hi\". Lowercase tags are treated as HTML. Rename to Card.",
            },
            {
              task: "Render a component from a prop.",
              description: "Checks dynamic tags.",
              code: "function Heading({ level, children }) { /* h1..h6 */ }",
              answer: "Build a capitalized variable holding the tag string, then render it.",
              solution: `function Heading({ level, children }) {
  const Tag = \`h\${level}\`;
  return <Tag>{children}</Tag>;
}`,
            },
            {
              easy: true,
              task: "Predict the type passed to jsx().",
              description: "Checks capitalized tags.",
              code: "<Card />  // compiles to jsx(?, {})",
              answer: "The Card function itself, because the tag is capitalized.",
            },
            {
              easy: true,
              task: "True or false: <user.Avatar /> works.",
              description: "Checks dotted tag names.",
              code: `const user = { Avatar };
return <user.Avatar />;`,
              answer: "True. Dotted names are treated as references, not DOM tags.",
            },
          ],
        },
        {
          q: `This component renders nothing useful and shows a JSX syntax error. Fix it.`,
          code: `function Profile({ user }) {\n  return (\n    <h1>{user.name}</h1>\n    <p class="bio">{user.bio}</p>\n  );\n}`,
          short: `A component must return a single root, and JSX uses className instead of class.`,
          long: `Adjacent JSX elements must be wrapped because return can only return one expression.\nUse a Fragment (<>...</>) to avoid an extra DOM node.\nclass is a reserved word in JS; JSX uses className (React 19 still warns on class).\nSimilarly: htmlFor instead of for, camelCase event handlers and style objects.`,
          fix: `function Profile({ user }) {\n  return (\n    <>\n      <h1>{user.name}</h1>\n      <p className="bio">{user.bio}</p>\n    </>\n  );\n}`,
          exercises: [
            {
              task: "Fix the JSX attributes.",
              description: "Checks JSX attribute names.",
              code: "<label for=\"a\" class=\"x\" tabindex=\"0\">A</label>",
              answer: "Use htmlFor, className and tabIndex. JSX uses DOM property names in camelCase.",
              solution: "<label htmlFor=\"a\" className=\"x\" tabIndex={0}>A</label>",
            },
            {
              task: "Fix the inline style.",
              description: "Checks style objects.",
              code: "<div style=\"color: red; font-size: 12px\" />",
              answer: "style takes an object with camelCase keys, not a string.",
              solution: "<div style={{ color: \"red\", fontSize: 12 }} />",
            },
            {
              easy: true,
              task: "Fix the two root elements.",
              description: "Checks single root.",
              code: "return <h1 /><p />;",
              answer: "Wrap them in a Fragment.",
              solution: "return <><h1 /><p /></>;",
            },
            {
              easy: true,
              task: "Name the JSX name for the style attribute.",
              description: "Checks style as object.",
              code: "<p style=\"font-size: 12px\" />",
              answer: "style takes an object with camelCase keys.",
              solution: "<p style={{ fontSize: 12 }} />",
            },
          ],
        },
        {
          q: `What are props, and why can't a component modify its own props?`,
          short: `Props are read-only inputs passed from parent to child; React relies on one-way data flow, so the parent owns them.`,
          long: `Props are the arguments of a component function, passed as JSX attributes.\nThey can be any value: strings, numbers, objects, functions, JSX (children).\nMutating props breaks purity: the parent's data changes silently and React will not re-render.\nTo change data, the owner keeps it in state and passes a callback down.\nIn dev, React freezes the props object, so assignments throw in strict mode code.`,
          exercises: [
            {
              task: "Fix the prop mutation.",
              description: "Checks read-only props.",
              code: `function Price({ item }) {
  item.price = item.price * 1.2;
  return <b>{item.price}</b>;
}`,
              answer: "Props are read-only; mutating changes the parent's data. Compute a new value.",
              solution: `function Price({ item }) {
  const total = item.price * 1.2;
  return <b>{total}</b>;
}`,
            },
            {
              task: "Give a default value to a prop.",
              description: "Checks default props in function components.",
              code: "function Avatar({ size }) { return <img width={size} />; }",
              answer: "Use a default in destructuring. defaultProps on function components was removed in React 19.",
              solution: "function Avatar({ size = 40 }) { return <img width={size} />; }",
            },
            {
              easy: true,
              task: "Spot the bug.",
              description: "Checks props are read-only.",
              code: "function A(props) { props.title = \"X\"; }",
              answer: "Props are read-only; do not assign to them.",
            },
            {
              easy: true,
              task: "Predict what Greeting renders.",
              description: "Checks reading props.",
              code: `const Greeting = ({ name }) => <p>Hi {name}</p>;
<Greeting name="Ann" />`,
              answer: "\"Hi Ann\", read from the name prop.",
            },
          ],
        },
      ],
      middle: [
        {
          q: `Why does this list of cards remount (lose state) every time the parent re-renders?`,
          code: `function Dashboard({ items }) {\n  const Card = ({ item }) => {\n    const [open, setOpen] = useState(false);\n    return <div onClick={() => setOpen(!open)}>{item.title} {open && 'open'}</div>;\n  };\n  return items.map(i => <Card key={i.id} item={i} />);\n}`,
          short: `Card is redefined on every render, so its type changes and React unmounts and remounts it, resetting state.`,
          long: `Reconciliation compares element types by reference.\nA component declared inside another gets a new function identity on each render.\nReact sees a different type, destroys the old subtree (state, DOM, effects) and mounts a new one.\nSymptoms: lost input focus, reset state, effects re-running, poor performance.\nFix: hoist the component to module scope and pass data via props.`,
          fix: `function Card({ item }) {\n  const [open, setOpen] = useState(false);\n  return <div onClick={() => setOpen(o => !o)}>{item.title} {open && 'open'}</div>;\n}\nfunction Dashboard({ items }) {\n  return items.map(i => <Card key={i.id} item={i} />);\n}`,
          exercises: [
            {
              task: "Fix the remounting cards.",
              description: "Checks unstable keys and types.",
              code: "cards.map(c => <Card key={`${c.id}-${Date.now()}`} {...c} />)",
              answer: "Date.now() changes every render, so keys change and cards remount. Use c.id only.",
              solution: "cards.map(c => <Card key={c.id} {...c} />)",
            },
            {
              task: "Spot why state is lost.",
              description: "Checks wrapper type changing.",
              code: `const Wrap = compact ? "span" : "div";
<Wrap><Card /></Wrap>`,
              answer: "When compact flips, the wrapper type changes, so Card remounts and loses state. Keep the same type and change styles.",
            },
            {
              easy: true,
              task: "Spot why the cards remount.",
              description: "Checks random keys.",
              code: "cards.map(c => <Card key={Math.random()} />)",
              answer: "Math.random gives a new key each render, forcing remounts.",
            },
            {
              easy: true,
              task: "Fix the key.",
              description: "Checks stable keys.",
              code: "key={Math.random()}",
              answer: "Use a stable id from the data.",
              solution: "key={c.id}",
            },
          ],
        },
        {
          q: `How does React's diffing algorithm stay O(n), and what assumptions does it make?`,
          short: `It assumes elements of different types produce different trees and uses keys to match children, comparing level by level instead of doing a generic tree diff.`,
          long: `A general tree diff is O(n^3); React uses heuristics to get O(n).\nDifferent type at the same position (div -> span, A -> B) = tear down and rebuild the subtree.\nSame DOM type = keep the node, update changed attributes, recurse into children.\nSame component type = keep the instance/state, re-render with new props.\nChildren lists are matched by key; without keys, by index.\nConsequence: moving a component to a different parent or wrapping it conditionally resets its state.`,
          exercises: [
            {
              task: "Predict how React diffs these trees.",
              description: "Checks diffing assumptions.",
              code: `// before: <div><A /></div>
// after:  <span><A /></span>`,
              answer: "Different root type, so React destroys the div tree and builds new, even though A is the same.",
            },
            {
              task: "Predict what React does without keys.",
              description: "Checks positional child matching.",
              code: "// before: [B, C]   after: [A, B, C]  (no keys)",
              answer: "It matches by index, so it updates B to A, C to B and adds C. Keys let it just insert A.",
            },
            {
              easy: true,
              task: "Name the first diffing assumption.",
              description: "Checks type assumption.",
              answer: "Different element types produce different trees.",
            },
            {
              easy: true,
              task: "Name the second diffing assumption.",
              description: "Checks key assumption.",
              code: "<li key={item.id} />",
              answer: "Keys tell React which children are the same across renders.",
            },
          ],
        },
        {
          q: `What is the children prop and how does composition replace inheritance in React?`,
          short: `children is whatever is nested inside a component's JSX tag; React composes behavior by passing elements and callbacks rather than extending classes.`,
          long: `<Card><p>Hi</p></Card> passes the p element as props.children.\nSlots: pass multiple JSX props (header, footer) for layout components.\nSpecialization: a WelcomeDialog renders <Dialog title="Welcome" /> instead of extending Dialog.\nRender props / function children pass data back to the caller.\nComposition also helps performance: children created by the parent don't re-render when the wrapper's state changes.`,
          exercises: [
            {
              task: "Make a Card that accepts any content.",
              description: "Checks the children prop.",
              code: "<Card title=\"Hi\" body=\"Text\" />",
              answer: "Accept children so callers compose any content.",
              solution: `function Card({ children }) {
  return <div className="card">{children}</div>;
}
<Card><h2>Hi</h2><p>Text</p></Card>`,
            },
            {
              task: "Replace inheritance with composition.",
              description: "Checks composition over inheritance.",
              code: "class AdminButton extends Button { /* ... */ }",
              answer: "Wrap and pass props instead: function AdminButton(p) { return <Button variant=\"danger\" {...p} />; }.",
              solution: `function AdminButton(props) {
  return <Button variant="danger" {...props} />;
}`,
            },
            {
              easy: true,
              task: "Predict what Box renders.",
              description: "Checks children prop.",
              code: `const Box = ({ children }) => <div>{children}</div>;
<Box><p>Hi</p></Box>`,
              answer: "A div with the <p> inside, passed as children.",
            },
            {
              easy: true,
              task: "True or false: React prefers inheritance for reuse.",
              description: "Checks composition over inheritance.",
              answer: "False. React prefers composition with props and children.",
            },
          ],
        },
      ],
      senior: [
        {
          q: `This component mutates during render. What breaks in concurrent React, and how do you fix it?`,
          code: `let renderCount = 0;\nfunction Row({ item, seen }) {\n  renderCount++;\n  seen.push(item.id);\n  return <li>{item.name} (#{renderCount})</li>;\n}`,
          short: `Render must be pure: React may call render multiple times, discard renders, or render out of order, so side effects during render produce duplicated or inconsistent data.`,
          long: `In concurrent rendering (transitions, Suspense) React can start a render, throw it away and retry.\nStrictMode double-invokes renders in dev to surface this: seen gets duplicates and counts jump by 2.\nMutating props (seen) also mutates the parent's data without triggering updates.\nModule-level counters are shared across all instances and SSR requests.\nFix: compute derived values from props, record "seen" in an effect or event, and keep counters in refs set in effects.`,
          fix: `function Row({ item, onSeen }) {\n  useEffect(() => { onSeen(item.id); }, [item.id, onSeen]);\n  return <li>{item.name}</li>;\n}`,
          exercises: [
            {
              task: "Fix the mutation during render.",
              description: "Checks render purity with arrays.",
              code: `function List({ items }) {
  items.sort((a, b) => a.n - b.n);
  return items.map(i => <p key={i.id}>{i.n}</p>);
}`,
              answer: "sort mutates the prop array. Use toSorted to get a new array.",
              solution: `function List({ items }) {
  const sorted = items.toSorted((a, b) => a.n - b.n);
  return sorted.map(i => <p key={i.id}>{i.n}</p>);
}`,
            },
            {
              task: "Spot why this breaks in concurrent rendering.",
              description: "Checks side effects in render.",
              code: `function Row({ id }) {
  seen.add(id);
  return <tr />;
}`,
              answer: "React may render and throw away work, so seen gets ids that never showed. Do side effects in effects.",
            },
            {
              easy: true,
              task: "Spot the render-time mutation.",
              description: "Checks mutating props in render.",
              code: "const sorted = items.sort();",
              answer: "sort() mutates the items prop array during render.",
            },
            {
              easy: true,
              task: "Fix it without mutating.",
              description: "Checks copying before sort.",
              code: "items.sort()",
              answer: "Sort a copy, e.g. with toSorted() or [...items].sort().",
              solution: "items.toSorted()",
            },
          ],
        },
        {
          q: `Explain Fiber: what problem it solved and how render and commit phases differ.`,
          short: `Fiber split rendering into interruptible units of work; the render phase computes changes (pure, can pause/restart), the commit phase applies them to the DOM synchronously.`,
          long: `The old stack reconciler recursed synchronously and could block the main thread for long trees.\nFiber represents each element as a node with links (child, sibling, return) so work can be paused and resumed.\nRender phase: call components, diff, build a work-in-progress tree; can be interrupted by higher-priority updates (lanes).\nCommit phase: mutate DOM, run layout effects, then schedule passive effects; never interrupted.\nDouble buffering: current tree vs work-in-progress tree, swapped on commit.\nThis enables transitions, Suspense, selective hydration and time slicing.`,
          ai: true,
          exercises: [
            {
              task: "Sort these into render or commit phase.",
              description: "Checks phase responsibilities.",
              code: "// 1) calling Card()  2) DOM insert  3) useLayoutEffect",
              answer: "Calling components is render. DOM insert and layout effects are commit. Render can pause; commit cannot.",
            },
            {
              task: "Name the problem Fiber solved.",
              description: "Checks Fiber motivation.",
              code: "// old stack reconciler: 200ms render blocks input",
              answer: "The old reconciler could not pause. Fiber splits work into units so React can pause and prioritize urgent updates.",
            },
            {
              easy: true,
              task: "Name the phase that can be interrupted.",
              description: "Checks render phase.",
              code: "Render phase vs commit phase",
              answer: "The render phase; the commit phase runs all at once.",
            },
            {
              easy: true,
              task: "Name the phase that changes the DOM.",
              description: "Checks commit phase.",
              answer: "The commit phase, which also runs layout effects.",
            },
          ],
        },
        {
          q: `In React 19, when should a component be a Server Component? When should it be a Client Component?`,
          short: `Default to Server Components for data fetching and static UI; use 'use client' only for interactivity, state, effects or browser APIs, keeping client boundaries as leaves.`,
          long: `Server Components run on the server only, can be async, access data directly and ship no JS.\nThey cannot use state, effects, context consumers or event handlers.\n'use client' marks a module boundary; everything it imports becomes client code.\nServer Components can pass serializable props and even server-rendered JSX (as children) into client components.\nKeep the boundary low: a client <LikeButton> inside a server <Post>.\nServer Functions ('use server') handle mutations called from the client.`,
          exercises: [
            {
              task: "Mark which component must be a Client Component.",
              description: "Checks server vs client choice.",
              code: `// A) <ProductInfo> reads db
// B) <AddToCart> uses onClick`,
              answer: "B needs \"use client\" for the event handler. A stays a Server Component and can read the db directly.",
            },
            {
              task: "Fix this so the server part stays on the server.",
              description: "Checks passing Server Components as children.",
              code: `"use client";
import Info from "./Info"; // server component
export default function Tabs() { return <Info />; }`,
              answer: "Importing into a client file makes Info client code. Pass it as children from a server parent.",
              solution: `// server: <Tabs><Info /></Tabs>
"use client";
export default function Tabs({ children }) { return <div>{children}</div>; }`,
            },
            {
              easy: true,
              task: "Pick the component type for this code.",
              description: "Checks Client Component need.",
              code: `const [n, setN] = useState(0);
<button onClick={() => setN(n + 1)} />`,
              answer: "Client Component, because it uses state and onClick.",
            },
            {
              easy: true,
              task: "Pick the component type for this code.",
              description: "Checks Server Component fit.",
              code: `const posts = await db.post.findMany();
return <List posts={posts} />;`,
              answer: "Server Component, because it only reads data and renders.",
            },
          ],
        },
      ],
      techlead: [
        {
          q: `How do you introduce the React Compiler into a large existing codebase?`,
          short: `Roll it out incrementally: enforce the Rules of React with lint first, enable the compiler per directory or via opt-in, measure, then remove manual memoization gradually.`,
          long: `Step 1: enable eslint-plugin-react-hooks recommended rules (they include compiler diagnostics) and fix violations.\nStep 2: enable the babel/vite plugin in "annotation" mode or for selected paths; use 'use no memo' as an escape hatch.\nStep 3: measure with React Profiler and real-user metrics (INP) on key flows.\nStep 4: keep existing useMemo/useCallback initially; the compiler respects them; remove later with tests.\nRisks: code relying on unstable identity, mutation during render, third-party libs with interior mutability.\nCommunicate via an RFC, owners per area, and a rollback flag.`,
          ai: true,
          exercises: [
            {
              task: "Name the first step to roll out the compiler.",
              description: "Checks incremental compiler adoption.",
              code: "// 2,000 components, some break rules",
              answer: "Enable the React Compiler lint rules first, fix violations, then turn the compiler on per directory with an opt-in mode.",
            },
            {
              task: "Opt one component out of the compiler.",
              description: "Checks compiler escape hatch.",
              code: "function LegacyGrid() { /* breaks with compiler */ }",
              answer: "Add the \"use no memo\" directive at the top of the function while you fix it.",
              solution: `function LegacyGrid() {
  "use no memo";
  // ...
}`,
            },
            {
              easy: true,
              task: "Name the plugin to try the compiler.",
              description: "Checks compiler setup.",
              code: "plugins: [[\"?\", {}]]",
              answer: "babel-plugin-react-compiler, added to the build.",
            },
            {
              easy: true,
              task: "Name a safe way to start the rollout.",
              description: "Checks gradual adoption.",
              code: "sources: (file) => file.includes(\"src/new/\")",
              answer: "Enable it for one folder first, then expand.",
            },
          ],
        },
        {
          q: `Review this "smart" component used across the product. What would you change?`,
          code: `export function UserCard({ userId }) {\n  const [user, setUser] = useState(null);\n  useEffect(() => { fetch('/api/users/' + userId).then(r => r.json()).then(setUser); }, []);\n  if (!user) return <Spinner />;\n  return <div style={{ padding: 12 }}><img src={user.avatar} />{user.name}<button onClick={() => fetch('/api/follow/' + userId, { method: 'POST' })}>Follow</button></div>;\n}`,
          short: `It mixes data fetching, mutations and presentation, has a stale-dependency bug, no error/race handling, no accessibility and is hard to test or reuse.`,
          long: `Bug: effect deps are [] so changing userId shows the old user; there is also no abort, so responses can race.\nNo error state, no loading skeleton strategy, no cache — every card refetches.\nimg lacks alt; follow button has no pending/disabled state or error feedback.\nInline styles bypass the design system.\nRedesign: a presentational UserCard({ user, onFollow, isFollowing }) plus a data hook (useUser with TanStack Query) and a mutation hook.\nStandardize via shared data layer, Storybook stories for the view, and tests for the hooks.`,
          fix: `function useUser(id) {\n  return useQuery({ queryKey: ['user', id], queryFn: () => api.getUser(id) });\n}\nexport function UserCard({ user, onFollow, isFollowing }) {\n  return (\n    <div className={styles.card}>\n      <img src={user.avatar} alt="" />\n      <span>{user.name}</span>\n      <button onClick={onFollow} disabled={isFollowing}>Follow</button>\n    </div>\n  );\n}`,
          exercises: [
            {
              task: "Spot what this component does too much.",
              description: "Checks separation of concerns.",
              code: `function OrderPanel() {
  // fetch, validate, track, format, render 400 lines
}`,
              answer: "It mixes data, logic and UI. Move fetching to a hook, logic to plain functions, keep a small view.",
            },
            {
              task: "Split data from view.",
              description: "Checks container and view split.",
              code: `function Orders() {
  const { data } = useQuery(ordersQuery);
  return <table>...</table>;
}`,
              answer: "Make a pure OrdersTable that takes rows as props; Orders only loads data. The table is easy to test and reuse.",
              solution: `function Orders() {
  const { data } = useQuery(ordersQuery);
  return <OrdersTable rows={data} />;
}`,
            },
            {
              easy: true,
              task: "Name the problem with this component.",
              description: "Checks mixed concerns.",
              code: "function UserCard() { fetch(...); return <div>...</div>; }",
              answer: "It mixes fetching and UI; split into data and view parts.",
            },
            {
              easy: true,
              task: "True or false: smart components are hard to test.",
              description: "Checks testability.",
              code: "<UserCardView user={user} /> // props only",
              answer: "True. Pure view parts with props are easier to test.",
            },
          ],
        },
        {
          q: `For a new product, how do you choose between a Vite SPA, Next.js, or React Router framework mode?`,
          short: `Choose based on SEO/first-load needs, data patterns, team skills, hosting constraints and how much you want server components versus a pure client app.`,
          long: `Internal dashboards behind auth: a Vite SPA with TanStack Query is simple and cheap to host.\nPublic, SEO-sensitive, content-heavy: Next.js App Router (RSC, streaming, caching) or React Router framework mode.\nConsider: deployment platform, edge/serverless costs, vendor coupling, build times, and migration path.\nThe React team recommends starting with a framework for new apps; a SPA is still valid when there's no server need.\nPrototype one critical flow in each option, measure TTFB/LCP/INP and DX, then write an ADR.`,
          ai: true,
          exercises: [
            {
              task: "Pick a setup for each product.",
              description: "Checks framework choice.",
              code: "// 1) marketing site + blog  2) internal tool behind login",
              answer: "Next.js or React Router framework mode for the public site with SEO. Vite SPA for the internal tool.",
            },
            {
              task: "Name one question you ask first.",
              description: "Checks requirements gathering.",
              code: "// \"Which React framework should we use?\"",
              answer: "Do we need SEO or fast first load for anonymous users? That decides if you need server rendering at all.",
            },
            {
              easy: true,
              task: "Pick a stack for a login-only dashboard.",
              description: "Checks SPA fit.",
              code: "Internal admin tool, no public pages.",
              answer: "A Vite SPA, since SEO and SSR add little here.",
            },
            {
              easy: true,
              task: "Pick a stack for a public store.",
              description: "Checks SSR need.",
              code: "Product pages need Google search traffic.",
              answer: "Next.js or React Router framework mode, for SEO and SSR.",
            },
          ],
        },
      ],
    },
    'Lists, Keys, and Fragments': {
      junior: [
        {
          q: `Fix this list. It shows a warning and it is hard to read.`,
          code: `function Todos({ todos }) {\n  return (\n    <ul>\n      {todos.map(todo => {\n        <li>{todo.text}</li>\n      })}\n    </ul>\n  );\n}`,
          short: `The arrow function uses braces without return, so map returns undefined; each item also needs a key.`,
          long: `An arrow function with { } needs an explicit return.\nmap then returns an array of undefined, and nothing renders.\nUse parentheses for an implicit return, or write return.\nAdd a stable key (todo.id) to each top-level element in the array.\nKeys must be unique among siblings, not globally.`,
          fix: `function Todos({ todos }) {\n  return (\n    <ul>\n      {todos.map(todo => (\n        <li key={todo.id}>{todo.text}</li>\n      ))}\n    </ul>\n  );\n}`,
          exercises: [
            {
              task: "Fix the list.",
              description: "Checks keys and extracting row components.",
              code: "{users.map(u => <li>{u.first} {u.last} ({u.email})</li>)}",
              answer: "Add a key and move the row into a small component for readability.",
              solution: "{users.map(u => <UserRow key={u.id} user={u} />)}",
            },
            {
              task: "Fix the empty list case.",
              description: "Checks empty states.",
              code: "<ul>{users.map(u => <UserRow key={u.id} user={u} />)}</ul>",
              answer: "An empty array shows nothing. Render an empty message when there are no users.",
              solution: `{users.length === 0 ? <p>No users</p>
  : <ul>{users.map(u => <UserRow key={u.id} user={u} />)}</ul>}`,
            },
            {
              easy: true,
              task: "Add the key.",
              description: "Checks list keys.",
              code: "todos.map(t => <li>{t.text}</li>)",
              answer: "Put key={t.id} on the li.",
              solution: "todos.map(t => <li key={t.id}>{t.text}</li>)",
            },
            {
              easy: true,
              task: "Rewrite it with a small Row component.",
              description: "Checks extracting list items.",
              code: "todos.map(t => <li>...long markup...</li>)",
              answer: "Extract a component, and keep the key in the map.",
              solution: "todos.map(t => <TodoRow key={t.id} todo={t} />)",
            },
          ],
        },
        {
          q: `What is the short Fragment syntax? When must you use the long form?`,
          short: `<>...</> groups children without a DOM node; use <Fragment key={...}> when you need a key, because the short form takes no attributes.`,
          long: `Fragments let a component return several elements.\nThey add no wrapper div, so CSS grid/flex and tables stay valid.\nShort syntax <></> cannot take props.\nIn a mapped list of groups, use <Fragment key={item.id}>.\nImport Fragment from 'react' (or use React.Fragment).`,
          exercises: [
            {
              task: "Fix the syntax error.",
              description: "Checks keyed Fragment syntax.",
              code: "rows.map(r => <key={r.id}><td>{r.a}</td></>)",
              answer: "The short syntax cannot have attributes. Use <Fragment key={r.id}>.",
              solution: "rows.map(r => <Fragment key={r.id}><td>{r.a}</td></Fragment>)",
            },
            {
              task: "Predict the DOM output.",
              description: "Checks Fragments add no node.",
              code: "<ul><><li>A</li><li>B</li></></ul>",
              answer: "<ul><li>A</li><li>B</li></ul>. Fragments add no DOM element.",
            },
            {
              easy: true,
              task: "Fix the short Fragment with a key.",
              description: "Checks keyed Fragments.",
              code: "items.map(i => <><dt /><dd /></>)",
              answer: "Short syntax cannot take a key; use <Fragment key>.",
              solution: "items.map(i => <Fragment key={i.id}><dt /><dd /></Fragment>)",
            },
            {
              easy: true,
              task: "True or false: Fragments add a DOM node.",
              description: "Checks Fragment output.",
              code: "return <><h1 /><p /></>;",
              answer: "False. Fragments render only their children.",
            },
          ],
        },
        {
          q: `Can two lists on the same page use the same keys?`,
          short: `Yes. Keys only need to be unique among siblings in one array, not across the page.`,
          long: `React uses keys to match children of one parent between renders.\nTwo different lists have different parents, so the same ids are fine.\nDuplicate keys inside one list cause a warning and wrong updates.\nKeys should be stable: same item, same key across renders.\nDo not generate keys with Math.random() or crypto.randomUUID() during render.`,
          exercises: [
            {
              task: "Predict if this causes a key warning.",
              description: "Checks key scope.",
              code: `<ul>{a.map(x => <li key={x.id} />)}</ul>
<ul>{b.map(x => <li key={x.id} />)}</ul> // same ids`,
              answer: "No warning. Keys only need to be unique among siblings, not across the page.",
            },
            {
              task: "Fix duplicate keys from merged lists.",
              description: "Checks prefixing keys.",
              code: "[...users, ...groups].map(x => <Item key={x.id} />) // ids overlap",
              answer: "Siblings now share ids. Prefix with type: key={`${x.type}-${x.id}`}.",
              solution: "[...users, ...groups].map(x => <Item key={`${x.type}-${x.id}`} />)",
            },
            {
              easy: true,
              task: "True or false: two lists can share keys.",
              description: "Checks key scope.",
              code: `<ul>{a.map(x => <li key={x.id} />)}</ul>
<ul>{b.map(x => <li key={x.id} />)}</ul>`,
              answer: "True. Keys only need to be unique among siblings.",
            },
            {
              easy: true,
              task: "Spot the key problem here.",
              description: "Checks duplicate sibling keys.",
              code: "<li key=\"a\" /><li key=\"a\" />",
              answer: "Two siblings share the key \"a\", so React may mix them up.",
            },
          ],
        },
      ],
      middle: [
        {
          q: `A user deletes the first row. The wrong row keeps its checkbox state. Why? Fix it.`,
          code: `function List({ items, onDelete }) {\n  return items.map((item, index) => (\n    <Row key={index} item={item} onDelete={() => onDelete(item.id)} />\n  ));\n}\nfunction Row({ item, onDelete }) {\n  const [checked, setChecked] = useState(false);\n  return <div><input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} />{item.name}<button onClick={onDelete}>x</button></div>;\n}`,
          short: `Index keys shift after a delete, so React reuses the old Row state for a different item.`,
          long: `After deleting index 0, the old item at index 1 now has key 0.\nReact matches by key, so it keeps Row #0's state and gives it new props.\nLocal state (checked) stays at the position, not with the item.\nThe same bug happens with insert, sort and filter.\nUse a stable unique id from the data as the key.`,
          fix: `function List({ items, onDelete }) {\n  return items.map(item => (\n    <Row key={item.id} item={item} onDelete={() => onDelete(item.id)} />\n  ));\n}`,
          exercises: [
            {
              task: "Fix the checkbox moving rows.",
              description: "Checks index keys with uncontrolled inputs.",
              code: "rows.map((r, i) => <li key={i}><input type=\"checkbox\" />{r.name}</li>)",
              answer: "With index keys, deleting row 0 gives its DOM checkbox to the next row. Use r.id as key.",
              solution: "rows.map(r => <li key={r.id}><input type=\"checkbox\" />{r.name}</li>)",
            },
            {
              task: "Name a second fix besides a stable key.",
              description: "Checks controlled state per item.",
              code: "<input type=\"checkbox\" />",
              answer: "Store checked state in data by id and make the checkbox controlled: checked={selected.has(r.id)}.",
            },
            {
              easy: true,
              task: "Spot why the checkbox state moves.",
              description: "Checks index keys on delete.",
              code: "rows.map((r, i) => <Row key={i} />)",
              answer: "Index keys shift after a delete, so state sticks to the wrong row.",
            },
            {
              easy: true,
              task: "Fix the key.",
              description: "Checks id keys.",
              code: "key={i}",
              answer: "Use the row id so state follows the row.",
              solution: "key={r.id}",
            },
          ],
        },
        {
          q: `How do you render a nested list, like categories with products?`,
          short: `Map the outer array and inside each item map the inner array; each level needs keys unique among its own siblings.`,
          long: `Outer map: each category gets key={category.id}.\nInner map: each product gets key={product.id}.\nExtract the inner list into its own component for readability.\nKeep data normalized if products are shared between categories.\nFor large trees, consider virtualization or collapsing groups.`,
          exercises: [
            {
              task: "Render categories with products.",
              description: "Checks nested maps with keys.",
              code: "const data = [{ id: \"a\", name: \"Fruit\", items: [{ id: 1, name: \"Apple\" }] }];",
              answer: "Map outer and inner arrays, each with its own key.",
              solution: `data.map(c => (
  <section key={c.id}><h2>{c.name}</h2>
    <ul>{c.items.map(p => <li key={p.id}>{p.name}</li>)}</ul>
  </section>
))`,
            },
            {
              task: "Spot the problem.",
              description: "Checks deep nesting readability.",
              code: "data.map(c => c.items.map(p => p.tags.map(t => <i>{t}</i>)))",
              answer: "No keys and three nested maps are hard to read. Extract Category and Product components with keys.",
            },
            {
              easy: true,
              task: "Fill in the inner map.",
              description: "Checks nested map.",
              code: "cats.map(c => <ul key={c.id}>{/* products */}</ul>)",
              answer: "Map products inside each category, with their own keys.",
              solution: "{c.products.map(p => <li key={p.id}>{p.name}</li>)}",
            },
            {
              easy: true,
              task: "True or false: inner keys must be globally unique.",
              description: "Checks nested key scope.",
              code: "<ul key=\"fruit\"><li key={1} /></ul><ul key=\"veg\"><li key={1} /></ul>",
              answer: "False. They only need to be unique within their own list.",
            },
          ],
        },
        {
          q: `Why should you not filter or sort a list by mutating it in render?`,
          code: `function Sorted({ items }) {\n  const sorted = items.sort((a, b) => a.name.localeCompare(b.name));\n  return sorted.map(i => <li key={i.id}>{i.name}</li>);\n}`,
          short: `sort() mutates the array in place, so it changes the parent's props and state, which breaks purity and can cause hard bugs.`,
          long: `Array.prototype.sort and reverse change the original array.\nThe array is owned by a parent, often in state, so you mutate state without setState.\nOther components may now see a sorted array unexpectedly.\nMemo comparisons may fail because the reference does not change.\nUse toSorted() / toReversed() (ES2023) or copy first with [...items].sort().`,
          fix: `function Sorted({ items }) {\n  const sorted = items.toSorted((a, b) => a.name.localeCompare(b.name));\n  return sorted.map(i => <li key={i.id}>{i.name}</li>);\n}`,
          exercises: [
            {
              task: "Fix the sort.",
              description: "Checks non-mutating array methods.",
              code: "const sorted = items.sort(byName);",
              answer: "sort mutates items, which may be props or state. Use toSorted or copy first.",
              solution: "const sorted = items.toSorted(byName);",
            },
            {
              task: "Predict the bug.",
              description: "Checks mutating state then setting it.",
              code: `items.reverse();
setItems(items);`,
              answer: "Same array reference, so React may skip the render. Create a new array with toReversed.",
              solution: "setItems(items.toReversed());",
            },
            {
              easy: true,
              task: "Spot the mutation.",
              description: "Checks reverse mutates.",
              code: "const shown = items.reverse();",
              answer: "reverse() changes the original array in place.",
            },
            {
              easy: true,
              task: "Name a non-mutating array method for sorting.",
              description: "Checks toSorted.",
              code: "items.toSorted((a, b) => a.price - b.price)",
              answer: "toSorted(), which returns a new array.",
            },
          ],
        },
      ],
      senior: [
        {
          q: `A chat list re-renders every message when a new one arrives. How do you find and fix this?`,
          code: `function Chat({ messages, onReact }) {\n  return messages.map(m => (\n    <Message key={m.id} message={m} onReact={() => onReact(m.id)} />\n  ));\n}\nconst Message = memo(function Message({ message, onReact }) { /* ... */ });`,
          short: `memo is defeated because a new onReact arrow is created for every row on each render; pass a stable callback and the id instead.`,
          long: `Use React DevTools Profiler with "highlight updates" to see which rows render and why.\nmemo does a shallow prop compare; a new function each render always fails it.\nPass a stable onReact (useCallback in the parent) plus messageId, and call onReact(id) inside the row.\nAlso check that message objects keep their identity when unchanged (immutable updates).\nWith the React Compiler, much of this is memoized automatically, but stable data identity still matters.`,
          fix: `function Chat({ messages, onReact }) {\n  return messages.map(m => <Message key={m.id} message={m} onReact={onReact} />);\n}\nconst Message = memo(function Message({ message, onReact }) {\n  return <div>{message.text}<button onClick={() => onReact(message.id)}>Like</button></div>;\n});`,
          exercises: [
            {
              task: "Name the tool to confirm the cause.",
              description: "Checks profiling re-renders.",
              code: "// chat lags when a new message arrives",
              answer: "React DevTools Profiler with \"highlight updates\" shows which messages re-render and why.",
            },
            {
              task: "Fix the message re-render.",
              description: "Checks memo with stable props.",
              code: "messages.map(m => <Message key={m.id} msg={m} onReply={() => reply(m.id)} />)",
              answer: "Wrap Message in memo and pass a stable onReply that takes an id.",
              solution: `const Message = memo(MessageImpl);
const onReply = useCallback(id => reply(id), []);
messages.map(m => <Message key={m.id} msg={m} onReply={onReply} />)`,
            },
            {
              easy: true,
              task: "Name the tool to see which messages re-render.",
              description: "Checks Profiler highlight.",
              answer: "React DevTools with \"highlight updates\" or the Profiler.",
            },
            {
              easy: true,
              task: "Name the wrapper to skip unchanged messages.",
              description: "Checks memo for rows.",
              code: "const Message = memo(function Message({ msg }) { ... });",
              answer: "React.memo on the message row, with stable keys.",
            },
          ],
        },
        {
          q: `How do keys interact with animations, like enter and exit transitions?`,
          short: `Animation libraries track items by key to know which elements entered, left or moved; unstable keys make them animate the wrong elements.`,
          long: `Framer Motion's AnimatePresence and react-transition-group keep exiting children rendered until the exit animation ends.\nThey detect removals by comparing keys between renders.\nIndex keys make a removal look like "last item removed + all others changed".\nLayout animations (FLIP) also rely on key identity to measure old and new positions.\nChanging a key on purpose can trigger a re-mount animation, e.g. a page transition keyed by route.`,
          exercises: [
            {
              task: "Predict what breaks the exit animation.",
              description: "Checks keys in animated lists.",
              code: "<AnimatePresence>{items.map((x, i) => <Item key={i} />)}</AnimatePresence>",
              answer: "With index keys, the last item animates out instead of the removed one. Use stable ids.",
            },
            {
              task: "Restart an animation on value change.",
              description: "Checks key for remount.",
              code: "<span className=\"flash\">{price}</span>",
              answer: "Set key={price}; React remounts the span so the CSS animation plays again.",
              solution: "<span key={price} className=\"flash\">{price}</span>",
            },
            {
              easy: true,
              task: "Predict what an exit animation needs.",
              description: "Checks keys for transitions.",
              code: "<AnimatePresence>{items.map(i => <motion.li key={i.id} />)}</AnimatePresence>",
              answer: "A stable key so the library knows which item is leaving.",
            },
            {
              easy: true,
              task: "Predict what changing a key does to animation.",
              description: "Checks key change remount.",
              answer: "The old item exits and a new one enters.",
            },
          ],
        },
        {
          q: `Explain how React reorders children with keys. What is the cost of moving items?`,
          short: `React builds a map of old children by key, reuses matching fibers and moves DOM nodes only when needed; moves are cheaper than remounts but still cost DOM operations.`,
          long: `React walks new children in order and tries to match old fibers at the same position.\nWhen keys stop matching, it puts remaining old children into a map by key.\nMatched fibers are reused (state kept) and marked for placement if their position moved.\nUnmatched old fibers are deleted; new keys are mounted.\nMoving one item from the end to the start can mark many nodes as moved, because the algorithm is left-to-right.\nFor huge reordered lists, virtualization or CSS order may be cheaper.`,
          ai: true,
          exercises: [
            {
              task: "Predict DOM operations.",
              description: "Checks keyed moves.",
              code: "// before: keys [a, b, c]   after: [c, a, b]",
              answer: "React moves nodes instead of recreating them. Its simple algorithm may move a and b rather than just c.",
            },
            {
              task: "Name the cost of moving a keyed item.",
              description: "Checks move cost.",
              code: "// moving an <iframe> or <video> row",
              answer: "Moving DOM nodes can reset iframes, videos and focus, and costs layout. Avoid reordering heavy nodes.",
            },
            {
              easy: true,
              task: "True or false: keyed moves keep component state.",
              description: "Checks moved items.",
              code: "[A, B, C] → [C, A, B] with keys",
              answer: "True. React moves the DOM node and keeps its state.",
            },
            {
              easy: true,
              task: "Name the cost of moving a keyed item.",
              description: "Checks DOM moves.",
              answer: "A DOM move like insertBefore; much cheaper than a remount.",
            },
          ],
        },
      ],
      techlead: [
        {
          q: `Your team keeps shipping list bugs with keys and state. How do you prevent this?`,
          short: `Combine lint rules, data contracts that guarantee ids, shared list components and review guidance.`,
          long: `Enable eslint-plugin-react rules: jsx-key and no-array-index-key (warn, with documented exceptions).\nRequire stable ids in API contracts; generate client ids at load time when missing.\nProvide shared List/Table components that accept getRowId and handle virtualization.\nAdd tests for insert/delete/reorder with stateful rows.\nDocument "where state lives" guidance: per-item state keyed by id in the parent or in the row with stable keys.`,
          exercises: [
            {
              task: "Name a lint rule that helps.",
              description: "Checks automated key checks.",
              code: "items.map((x, i) => <Row key={i} />)",
              answer: "Enable eslint-plugin-react jsx-key and no-array-index-key, plus React Compiler lint.",
            },
            {
              task: "Write a test that catches a key bug.",
              description: "Checks testing state after delete.",
              code: "// list with editable rows",
              answer: "Type into row 2, delete row 1, then assert row 2 still holds the typed text.",
            },
            {
              easy: true,
              task: "Name a lint rule that helps.",
              description: "Checks react/jsx-key.",
              code: "// eslint: \"?\": \"error\"",
              answer: "react/jsx-key, which flags missing keys in lists.",
            },
            {
              easy: true,
              task: "Name a test for key bugs.",
              description: "Checks delete-row tests.",
              answer: "Delete the first row in a test and check other rows keep state.",
            },
          ],
        },
        {
          q: `Product wants a table with 50,000 rows, sorting, grouping and inline edit. What is your technical plan?`,
          short: `Move sorting and filtering to the server or a worker, virtualize rows, use a headless table library, and keep edit state keyed by row id.`,
          long: `Clarify needs: do users really scan 50k rows, or search and filter? Export may cover bulk needs.\nUse TanStack Table (headless) with TanStack Virtual, or a grid like AG Grid if features are heavy.\nServer-side sort, filter and pagination with cursor APIs; cache with TanStack Query.\nInline edit: store drafts in a map by row id; commit with optimistic updates.\nAccessibility: grid roles and keyboard navigation are hard; buying may beat building.\nSet performance budgets (INP < 200ms) and test on low-end devices.`,
          ai: true,
          exercises: [
            {
              task: "Pick a library for 50,000 rows.",
              description: "Checks table tooling.",
              code: "// sort, group, inline edit",
              answer: "TanStack Table for logic plus TanStack Virtual for rows. Or server-side grouping and sorting for scale.",
            },
            {
              task: "Spot the risk with inline edit.",
              description: "Checks edit state in virtual lists.",
              code: "// editing row unmounts when scrolled away",
              answer: "Virtual rows unmount off screen, losing local edit state. Keep edits in a store keyed by row id.",
            },
            {
              easy: true,
              task: "Name the library for a headless table.",
              description: "Checks TanStack Table.",
              code: "const table = useReactTable({ data, columns, getCoreRowModel });",
              answer: "TanStack Table, often with TanStack Virtual.",
            },
            {
              easy: true,
              task: "Pick where to sort 50,000 rows.",
              description: "Checks server-side sorting.",
              code: "User sorts by price on 50,000 rows.",
              answer: "On the server, or in a worker, to keep the UI fast.",
            },
          ],
        },
        {
          q: `How do you set guidelines for when to use Fragments, wrapper divs, or layout components?`,
          short: `Prefer Fragments when a wrapper adds no meaning; use semantic elements when structure matters; use layout components (Stack, Grid) for spacing instead of ad-hoc divs.`,
          long: `Extra divs break CSS grid/flex children, table and list semantics, and add DOM weight.\nSemantic HTML (section, nav, ul) helps accessibility and should not be replaced by Fragments.\nLayout primitives from the design system own spacing; components should not add outer margins.\nDocument this in the UI guidelines with examples, and check in review and a11y audits.\nAutomate where possible: axe checks for list and table structure in CI.`,
          exercises: [
            {
              task: "Fix the invalid HTML.",
              description: "Checks Fragment vs wrapper div.",
              code: `<table><tbody><tr><Cells /></tr></tbody></table>
function Cells() { return <div><td>A</td><td>B</td></div>; }`,
              answer: "A div inside tr is invalid. Return a Fragment.",
              solution: "function Cells() { return <><td>A</td><td>B</td></>; }",
            },
            {
              task: "Pick Fragment, div, or layout component.",
              description: "Checks layout guidelines.",
              code: "// 1) group siblings  2) spacing between cards",
              answer: "Fragment to group without DOM. A Stack layout component for spacing, not random divs with margins.",
            },
            {
              easy: true,
              task: "Pick a Fragment or a div here.",
              description: "Checks Fragments in tables.",
              code: "<tr>{/* return two <td> */}</tr>",
              answer: "A Fragment, because a div inside a tr is invalid HTML.",
            },
            {
              easy: true,
              task: "Name a reason to use a layout component.",
              description: "Checks Stack components.",
              code: "<Stack gap={2}>...</Stack>",
              answer: "It keeps spacing consistent, like a Stack with a gap prop.",
            },
          ],
        },
      ],
    },
    'Events and Error Handling': {
      junior: [
        {
          q: `The alert shows when the page loads, not on click. Why? Fix it.`,
          code: `function Hello() {\n  return <button onClick={alert('Hi')}>Say hi</button>;\n}`,
          short: `onClick={alert('Hi')} calls alert during render and passes its return value; you must pass a function.`,
          long: `Code inside { } runs while rendering.\nalert('Hi') runs immediately and returns undefined, so onClick gets undefined.\nPass a function reference or an arrow function: onClick={() => alert('Hi')}.\nThe same mistake with setState causes an infinite render loop.\nNaming convention: handleClick for handlers, onClick for props.`,
          fix: `function Hello() {\n  return <button onClick={() => alert('Hi')}>Say hi</button>;\n}`,
          exercises: [
            {
              task: "Predict when the log runs.",
              description: "Checks calling vs passing handlers.",
              code: "<button onClick={console.log(\"hi\")}>Hi</button>",
              answer: "It logs once on every render and clicks do nothing. Pass a function: onClick={() => console.log(\"hi\")}.",
              solution: "<button onClick={() => console.log(\"hi\")}>Hi</button>",
            },
            {
              task: "Pass an argument to a handler.",
              description: "Checks handler arguments.",
              code: "<button onClick={remove}>Delete</button> // needs item.id",
              answer: "Wrap it: onClick={() => remove(item.id)}. Passing remove alone gives it the event object.",
              solution: "<button onClick={() => remove(item.id)}>Delete</button>",
            },
            {
              easy: true,
              task: "Spot why it fires on load.",
              description: "Checks calling in JSX.",
              code: "<button onClick={alert(\"Hi\")}>Go</button>",
              answer: "alert(\"Hi\") runs during render; pass a function instead.",
            },
            {
              easy: true,
              task: "Fix the handler.",
              description: "Checks arrow wrapper.",
              code: "onClick={alert(\"Hi\")}",
              answer: "Wrap the call in an arrow function.",
              solution: "onClick={() => alert(\"Hi\")}",
            },
          ],
        },
        {
          q: `What is event bubbling in React? What does onClickCapture do?`,
          short: `Events start at the clicked element and bubble up through its parents, so parent onClick handlers also run. onClickCapture runs on the way down, before the child handlers.`,
          long: `React events follow the DOM order: capture phase from the root down, then bubble phase from the target up.\nonClick handles the bubble phase; onClickCapture handles the capture phase.\nA click on a button inside a card runs the button onClick first, then the card onClick.\ne.stopPropagation() stops the event from reaching more handlers.\nCapture handlers are useful for things like logging all clicks or blocking clicks in a region.\nReact events bubble through the React tree, which matters for portals.\nonScroll does not bubble in React 17 and later.`,
          exercises: [
            {
              task: "Predict the log order.",
              description: "Checks capture vs bubble order.",
              code: `<div onClickCapture={() => log("cap")} onClick={() => log("div")}>
  <button onClick={() => log("btn")} />
</div>`,
              answer: "cap, btn, div. Capture runs top-down first, then bubble runs from the target up.",
            },
            {
              task: "Stop the parent handler from running.",
              description: "Checks stopPropagation.",
              code: "<tr onClick={openRow}><td><button onClick={del}>x</button></td></tr>",
              answer: "Call e.stopPropagation() in the button handler so the row click does not fire.",
              solution: "<button onClick={e => { e.stopPropagation(); del(); }}>x</button>",
            },
            {
              easy: true,
              task: "Predict the log order on button click.",
              description: "Checks bubbling order.",
              code: `<div onClick={() => log("div")}>
  <button onClick={() => log("button")} />
</div>`,
              answer: "\"button\" then \"div\", because events bubble up.",
            },
            {
              easy: true,
              task: "Predict the order with onClickCapture.",
              description: "Checks capture phase.",
              code: `<div onClickCapture={() => log("div")}>
  <button onClick={() => log("button")} />
</div>`,
              answer: "\"div\" first, since capture runs top-down before bubbling.",
            },
          ],
        },
        {
          q: `What is the event object in React? How do you read an input value from it?`,
          short: `React passes a SyntheticEvent that wraps the native event with a consistent API; for inputs you read e.target.value.`,
          long: `Handlers receive a SyntheticEvent with target, currentTarget, preventDefault and stopPropagation.\ne.nativeEvent gives the browser event if you need it.\nSince React 17 there is no event pooling, so you can use e in async code.\nFor checkboxes read e.target.checked; for files read e.target.files.\nIn TypeScript use types like React.ChangeEvent<HTMLInputElement>.`,
          exercises: [
            {
              task: "Read the checkbox value.",
              description: "Checks e.target.checked.",
              code: "<input type=\"checkbox\" onChange={e => setOn(e.target.value)} />",
              answer: "For checkboxes value is the string \"on\". Read e.target.checked instead.",
              solution: "<input type=\"checkbox\" onChange={e => setOn(e.target.checked)} />",
            },
            {
              task: "Spot the difference: target vs currentTarget.",
              description: "Checks event target properties.",
              code: "<div onClick={e => log(e.target, e.currentTarget)}><span>Hi</span></div>",
              answer: "Clicking the span: target is the span, currentTarget is the div with the handler.",
            },
            {
              easy: true,
              task: "Fill in the value read.",
              description: "Checks e.target.value.",
              code: "<input onChange={e => setName(?)} />",
              answer: "e.target.value holds the current input text.",
              solution: "<input onChange={e => setName(e.target.value)} />",
            },
            {
              easy: true,
              task: "Name the field for a checkbox.",
              description: "Checks e.target.checked.",
              code: "<input type=\"checkbox\" onChange={e => ?} />",
              answer: "e.target.checked, a boolean.",
            },
          ],
        },
      ],
      middle: [
        {
          q: `The dropdown closes when the user clicks inside it. Find the bug and fix it.`,
          code: `function Dropdown({ children }) {\n  const [open, setOpen] = useState(false);\n  useEffect(() => {\n    const close = () => setOpen(false);\n    document.addEventListener('click', close);\n  });\n  return <div><button onClick={() => setOpen(true)}>Open</button>{open && <div className="menu">{children}</div>}</div>;\n}`,
          short: `The document listener closes on every click, including inside the menu and on the open button; it is also added on every render and never removed.`,
          long: `No dependency array, so a new listener is added each render.\nNo cleanup, so listeners leak after unmount.\nThe listener does not check where the click happened.\nUse a ref on the container and ignore clicks inside it (ref.current.contains(e.target)).\nRegister the listener only while open, and remove it in cleanup.`,
          fix: `function Dropdown({ children }) {\n  const [open, setOpen] = useState(false);\n  const ref = useRef(null);\n  useEffect(() => {\n    if (!open) return;\n    const onDown = e => { if (!ref.current.contains(e.target)) setOpen(false); };\n    document.addEventListener('pointerdown', onDown);\n    return () => document.removeEventListener('pointerdown', onDown);\n  }, [open]);\n  return <div ref={ref}><button onClick={() => setOpen(o => !o)}>Open</button>{open && <div className="menu">{children}</div>}</div>;\n}`,
          exercises: [
            {
              task: "Fix the outside-click check.",
              description: "Checks contains for outside clicks.",
              code: "document.addEventListener(\"click\", () => setOpen(false));",
              answer: "Every click closes it, even inside. Check if the target is inside the menu ref.",
              solution: `const h = e => { if (!ref.current.contains(e.target)) setOpen(false); };
document.addEventListener("click", h);
return () => document.removeEventListener("click", h);`,
            },
            {
              task: "Name a better event than click for outside close.",
              description: "Checks pointerdown for menus.",
              code: "// menu opens and immediately closes",
              answer: "Use pointerdown on document; the opening click no longer closes it, and it also works for touch.",
            },
            {
              easy: true,
              task: "Spot why inner clicks close it.",
              description: "Checks click outside logic.",
              code: "document.addEventListener(\"click\", () => setOpen(false));",
              answer: "The document listener does not check if the click was inside.",
            },
            {
              easy: true,
              task: "Name the DOM method to check inside clicks.",
              description: "Checks contains.",
              code: "if (!ref.current.contains(e.target)) setOpen(false);",
              answer: "ref.current.contains(e.target).",
            },
          ],
        },
        {
          q: `How is onChange in React different from the native change event?`,
          short: `React onChange fires on every key press or edit, like the native input event. The native change event fires only when the field loses focus or a choice is committed.`,
          long: `In the DOM, input fires on every edit, and change fires on commit (blur for text, select for dropdowns).\nReact maps onChange to the input event for text fields, so controlled inputs update on each key.\nFor checkboxes and radios, React onChange fires when checked changes; read e.target.checked, not value.\nFor select, onChange fires when the option changes.\nIf you want commit-only behavior, use onBlur, or a native listener for change.\nReact also has onInput, which behaves almost the same as onChange for text fields.`,
          exercises: [
            {
              task: "Predict when onChange fires.",
              description: "Checks React onChange behavior.",
              code: "<input onChange={e => log(e.target.value)} /> // user types \"ab\"",
              answer: "Twice: \"a\" then \"ab\". React onChange fires on every input, like the native input event.",
            },
            {
              task: "Name the event for \"after the user leaves the field\".",
              description: "Checks blur vs change.",
              code: "// validate only when the user is done",
              answer: "Use onBlur. React onChange fires on every keystroke, unlike native change.",
            },
            {
              easy: true,
              task: "True or false: React onChange fires on each key.",
              description: "Checks onChange timing.",
              code: "<input onChange={e => log(e.target.value)} />",
              answer: "True. It acts like the native input event.",
            },
            {
              easy: true,
              task: "Name when native change fires on text inputs.",
              description: "Checks native change.",
              answer: "On blur, after the value changed.",
            },
          ],
        },
        {
          q: `What is the difference between stopPropagation and preventDefault?`,
          short: `stopPropagation stops the event from bubbling to parent handlers; preventDefault cancels the browser's default action, like form submit or link navigation.`,
          long: `preventDefault: the event still bubbles, but the browser does not follow the link or submit the form.\nstopPropagation: parents do not get the event, but default actions still happen.\nIn React 17+ events are attached at the root container, not document.\nSo stopPropagation in React also stops native listeners on the root and above, but not on elements below.\nUse onClickCapture for the capture phase.`,
          exercises: [
            {
              task: "Pick the right call for each case.",
              description: "Checks preventDefault vs stopPropagation.",
              code: "// 1) link should not navigate  2) parent should not get click",
              answer: "1) preventDefault stops the browser default. 2) stopPropagation stops bubbling to parents.",
            },
            {
              task: "Predict what happens.",
              description: "Checks preventDefault does not stop bubbling.",
              code: `<div onClick={() => log("div")}>
  <a href="/x" onClick={e => e.preventDefault()}>x</a>
</div>`,
              answer: "No navigation, but \"div\" still logs. preventDefault does not stop propagation.",
            },
            {
              easy: true,
              task: "Name the method that stops bubbling.",
              description: "Checks stopPropagation.",
              code: "<div onClick={close}><button onClick={e => e.?()} /></div>",
              answer: "e.stopPropagation(), which keeps parents from getting the event.",
            },
            {
              easy: true,
              task: "Name what preventDefault stops here.",
              description: "Checks default actions.",
              code: "<a href=\"/x\" onClick={e => e.preventDefault()}>X</a>",
              answer: "The browser navigating to the link URL.",
            },
          ],
        },
      ],
      senior: [
        {
          q: `How does React decide the priority of updates from different events? What are discrete and continuous events?`,
          short: `Updates from discrete events like click and keydown get the highest priority and render synchronously. Continuous events like mousemove and scroll get a lower priority. Updates in startTransition are lower still and can be interrupted.`,
          long: `React assigns a lane (priority) to each update based on the event that caused it.\nDiscrete events (click, keydown, input) mean the user expects an instant response; React renders them right away.\nContinuous events (mousemove, pointermove, scroll, wheel) are batched with a slightly lower priority.\nUpdates outside events (timers, network) get the default priority.\nstartTransition and useDeferredValue mark updates as non-urgent; urgent updates can interrupt them.\nPractical use: keep the input value urgent, and wrap the heavy result update in a transition.\nThis is about scheduling, not order: updates still apply in the order you call them.`,
          exercises: [
            {
              task: "Classify each event: discrete or continuous.",
              description: "Checks event priorities.",
              code: "// click, keydown, scroll, mousemove",
              answer: "click and keydown are discrete (highest priority, sync). scroll and mousemove are continuous and can be batched.",
            },
            {
              task: "Lower the priority of an update.",
              description: "Checks startTransition.",
              code: "onScroll={() => setVisibleRange(calc())}",
              answer: "Wrap it in startTransition so urgent input is handled first.",
              solution: "onScroll={() => startTransition(() => setVisibleRange(calc()))}",
            },
            {
              easy: true,
              task: "Pick discrete or continuous for a click.",
              description: "Checks discrete events.",
              code: "<button onClick={save}>Save</button>",
              answer: "Discrete: clicks get the highest, sync priority.",
            },
            {
              easy: true,
              task: "Pick discrete or continuous for mousemove.",
              description: "Checks continuous events.",
              code: "<div onMouseMove={track} />",
              answer: "Continuous: it fires often, so React can batch it lower.",
            },
          ],
        },
        {
          q: `This search fires one request per key press and sometimes shows old results. Fix it.`,
          code: `function Search() {\n  const [q, setQ] = useState('');\n  const [results, setResults] = useState([]);\n  async function onChange(e) {\n    setQ(e.target.value);\n    const res = await fetch('/api/search?q=' + e.target.value);\n    setResults(await res.json());\n  }\n  return <><input value={q} onChange={onChange} /><List items={results} /></>;\n}`,
          short: `Responses can arrive out of order, so a slow old response overwrites newer results; debounce input and abort or ignore stale requests.`,
          long: `Each key press starts a request; there is no cancel.\nIf "re" returns after "react", the list shows results for "re".\nThe query is not URL-encoded.\nFix: debounce the query, run the fetch in an effect keyed on the debounced value, and abort on cleanup.\nBetter in production: TanStack Query with queryKey ['search', q], which handles races and caching.\nAlso handle errors and loading states.`,
          fix: `function Search() {\n  const [q, setQ] = useState('');\n  const debounced = useDebounce(q, 300);\n  const [results, setResults] = useState([]);\n  useEffect(() => {\n    if (!debounced) return setResults([]);\n    const ctrl = new AbortController();\n    fetch('/api/search?q=' + encodeURIComponent(debounced), { signal: ctrl.signal })\n      .then(r => r.json()).then(setResults)\n      .catch(err => { if (err.name !== 'AbortError') console.error(err); });\n    return () => ctrl.abort();\n  }, [debounced]);\n  return <><input value={q} onChange={e => setQ(e.target.value)} /><List items={results} /></>;\n}`,
          exercises: [
            {
              task: "Debounce the search.",
              description: "Checks debounced requests.",
              code: "useEffect(() => { search(q).then(setRes); }, [q]);",
              answer: "Wait until typing stops, then search. Clear the timer on change.",
              solution: `useEffect(() => {
  const t = setTimeout(() => search(q).then(setRes), 300);
  return () => clearTimeout(t);
}, [q]);`,
            },
            {
              task: "Ignore old results.",
              description: "Checks stale responses with a flag.",
              code: "useEffect(() => { search(q).then(setRes); }, [q]);",
              answer: "Set an ignore flag in cleanup, or abort the request, so old slow responses are dropped.",
              solution: `useEffect(() => {
  let ignore = false;
  search(q).then(r => { if (!ignore) setRes(r); });
  return () => { ignore = true; };
}, [q]);`,
            },
            {
              easy: true,
              task: "Name the technique to limit requests.",
              description: "Checks debounce.",
              code: "Type \"react\" → 5 requests.",
              answer: "Debounce: wait until typing pauses before fetching.",
            },
            {
              easy: true,
              task: "Name what stops old results showing.",
              description: "Checks aborting old requests.",
              code: "return () => controller.abort();",
              answer: "Abort the old request, or ignore it in the effect cleanup.",
            },
          ],
        },
        {
          q: `Why does a menu close when focus moves to one of its own items? How do you handle focus and blur events correctly?`,
          short: `onBlur on the container fires when focus leaves any child, even if it moves to another child. Check e.relatedTarget: if the new focus is still inside the container, do not close.`,
          long: `React onFocus and onBlur bubble, like native focusin and focusout.\nWhen focus moves from one item to another inside a menu, the container gets blur then focus.\ne.relatedTarget is the element getting focus next.\nUse e.currentTarget.contains(e.relatedTarget) to know if focus stayed inside.\nrelatedTarget can be null when focus goes to the body or another window.\nMouse clicks on non-focusable elements move focus to body; make items buttons so they can take focus.\nThis is the base for accessible menus, comboboxes and popovers.`,
          exercises: [
            {
              task: "Fix the blur check.",
              description: "Checks relatedTarget on blur.",
              code: "<div onBlur={() => setOpen(false)}>...menu items...</div>",
              answer: "Blur bubbles when focus moves between items. Close only if relatedTarget is outside.",
              solution: `<div onBlur={e => {
  if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
}}>`,
            },
            {
              task: "Predict if onFocus bubbles in React.",
              description: "Checks focus events in React.",
              code: "<div onFocus={() => log(\"in\")}><input /></div>",
              answer: "Yes. React onFocus and onBlur bubble (they use focusin and focusout), so \"in\" logs.",
            },
            {
              easy: true,
              task: "Name the field that shows where focus went.",
              description: "Checks relatedTarget.",
              code: "onBlur={e => console.log(e.relatedTarget)}",
              answer: "e.relatedTarget, the element getting focus.",
            },
            {
              easy: true,
              task: "True or false: React onBlur bubbles.",
              description: "Checks focusout behavior.",
              code: "<div onBlur={() => log(\"blur\")}><input /></div>",
              answer: "True. React onBlur uses focusout, so it bubbles.",
            },
          ],
        },
      ],
      techlead: [
        {
          q: `Design a keyboard shortcut system for the whole app. How do you avoid conflicts between teams?`,
          short: `Use one central shortcut registry with scopes (global, page, dialog), a single document listener, rules to skip typing fields, and a help dialog that lists all active shortcuts. Teams register shortcuts through a hook, not their own listeners.`,
          long: `Many separate keydown listeners fight each other and break when a dialog is open.\nOne provider keeps a registry: key combo, scope, handler, description.\nScopes stack: an open dialog takes priority, then the page, then global shortcuts.\nIgnore shortcuts while the user types in inputs, textareas and contenteditable, except explicit ones like Escape.\nHandle platform keys: Cmd on Mac, Ctrl elsewhere; respect keyboard layouts by using e.key.\nAvoid browser and screen reader shortcuts; follow WCAG 2.1.4 for single-key shortcuts (allow turning them off or remapping).\nA useShortcut hook registers on mount and removes on unmount; CI checks for duplicate combos in the same scope.\nShow a "?" help dialog generated from the registry.`,
          exercises: [
            {
              task: "Spot the conflict.",
              description: "Checks global key handlers.",
              code: "// team A: \"k\" opens search   team B: \"k\" next item",
              answer: "Two global handlers react to one key. Use a central shortcut registry that warns on duplicates and scopes keys.",
            },
            {
              task: "Skip shortcuts while typing.",
              description: "Checks ignoring inputs.",
              code: "window.addEventListener(\"keydown\", e => { if (e.key === \"k\") openSearch(); });",
              answer: "Ignore events from inputs, textareas and contenteditable.",
              solution: `window.addEventListener("keydown", e => {
  if (e.target.closest("input, textarea, [contenteditable]")) return;
  if (e.key === "k") openSearch();
});`,
            },
            {
              easy: true,
              task: "Name one way to avoid shortcut conflicts.",
              description: "Checks central registry.",
              answer: "One central shortcut registry that warns on duplicates.",
            },
            {
              easy: true,
              task: "True or false: shortcuts should fire inside text inputs.",
              description: "Checks input focus guard.",
              code: "User types \"k\" in a search box; \"k\" is a shortcut.",
              answer: "False. Skip them while typing in inputs, or users lose keys.",
            },
          ],
        },
        {
          q: `Review this global error handling setup. What risks do you see?`,
          code: `window.onerror = () => { alert('Something went wrong'); location.reload(); };\nwindow.addEventListener('unhandledrejection', e => e.preventDefault());`,
          short: `It hides errors from users and monitoring, can cause reload loops, and swallows promise rejections silently.`,
          long: `alert blocks the UI and gives no useful info; reload can loop if the error happens on load.\nThird-party script errors (cross-origin "Script error.") would also trigger reloads.\npreventDefault on unhandledrejection hides errors from the console and maybe from monitoring.\nNothing is reported to a logging service with context.\nReplace with: report to monitoring, show a non-blocking toast, use boundaries for render errors, and never auto-reload without a guard.`,
          fix: `window.addEventListener('error', e => report(e.error ?? e.message, { source: 'window' }));\nwindow.addEventListener('unhandledrejection', e => report(e.reason, { source: 'promise' }));\n// UI: React error boundaries + toast for recoverable async errors`,
          exercises: [
            {
              task: "Spot the risk.",
              description: "Checks swallowing global errors.",
              code: "window.onerror = () => true;",
              answer: "Returning true hides errors from the console and other tools. Log and report instead, do not swallow.",
            },
            {
              task: "Add the missing handler.",
              description: "Checks unhandled promise rejections.",
              code: "window.addEventListener(\"error\", report);",
              answer: "Async errors need unhandledrejection too.",
              solution: `window.addEventListener("error", report);
window.addEventListener("unhandledrejection", e => report(e.reason));`,
            },
            {
              easy: true,
              task: "Name the event for unhandled promise errors.",
              description: "Checks unhandledrejection.",
              code: "window.addEventListener(\"unhandledrejection\", e => ?);",
              answer: "window's unhandledrejection event.",
            },
            {
              easy: true,
              task: "Spot the risk in this handler.",
              description: "Checks swallowed errors.",
              code: "window.onerror = () => true;",
              answer: "It hides all errors, so bugs go unnoticed.",
            },
          ],
        },
        {
          q: `How do you make event handling consistent for accessibility across the team?`,
          short: `Use native interactive elements, shared components for complex widgets, lint rules for a11y, and keyboard tests in CI.`,
          long: `Rule 1: clickable things are buttons or links, not divs with onClick.\njsx-a11y lint rules catch click-events-have-key-events and no-static-element-interactions.\nComplex widgets (menu, combobox, dialog) come from a tested library (React Aria, Radix) or the design system.\nTest with keyboard only and a screen reader for key flows.\nAdd axe checks in component tests and Playwright E2E.\nTrack a11y bugs like other bugs, with severity.`,
          exercises: [
            {
              task: "Fix the clickable div.",
              description: "Checks semantic interactive elements.",
              code: "<div onClick={open}>Open</div>",
              answer: "A div is not focusable and ignores Enter. Use a button.",
              solution: "<button type=\"button\" onClick={open}>Open</button>",
            },
            {
              task: "Name a team-wide check for this.",
              description: "Checks a11y linting.",
              code: "// many clickable divs in PRs",
              answer: "eslint-plugin-jsx-a11y with click-events-have-key-events and no-static-element-interactions, plus axe in tests.",
            },
            {
              easy: true,
              task: "Pick the right element for a click action.",
              description: "Checks semantic buttons.",
              code: "<div onClick={save}>Save</div>",
              answer: "A button, which has keyboard and focus support built in.",
            },
            {
              easy: true,
              task: "Name the keys a custom button must handle.",
              description: "Checks keyboard activation.",
              code: "<div role=\"button\" tabIndex={0} onClick={save} onKeyDown={?} />",
              answer: "Enter and Space, like a native button.",
            },
          ],
        },
      ],
    },
    'Common Hooks': {
      junior: [
        {
          q: `What does useState return? Why do we use array destructuring with it?`,
          short: `useState returns a pair: the current value and a setter function; array destructuring lets you name them freely.`,
          long: `const [count, setCount] = useState(0).\nThe initial value is used only on the first render.\nCalling the setter schedules a re-render with the new value.\nThe value does not change inside the current render; it is a snapshot.\nPass a function to useState(() => expensive()) for lazy initialization.`,
          exercises: [
            {
              task: "Predict the values.",
              description: "Checks useState return.",
              code: `const pair = useState(5);
console.log(pair.length, pair[0]);`,
              answer: "2 and 5. useState returns [value, setter]; destructuring lets you name both.",
            },
            {
              task: "Name why it returns an array, not an object.",
              description: "Checks destructuring choice.",
              code: `const [a, setA] = useState(0);
const [b, setB] = useState(0);`,
              answer: "Array destructuring lets you pick any names per use without renaming keys.",
            },
            {
              easy: true,
              task: "Name the two items useState returns.",
              description: "Checks useState return.",
              code: "const [count, setCount] = useState(0);",
              answer: "The current value and a setter function.",
            },
            {
              easy: true,
              task: "Predict the initial value of on.",
              description: "Checks initial state.",
              code: "const [on, setOn] = useState(false);",
              answer: "false, the value passed to useState.",
            },
          ],
        },
        {
          q: `This effect runs in an endless loop. Why? Fix it.`,
          code: `function Profile({ id }) {\n  const [user, setUser] = useState(null);\n  useEffect(() => {\n    fetch('/api/users/' + id).then(r => r.json()).then(setUser);\n  });\n  return <p>{user?.name}</p>;\n}`,
          short: `Without a dependency array the effect runs after every render, and setUser causes a new render, so it loops forever.`,
          long: `No array = run after every render.\nEmpty array [] = run once after mount.\n[id] = run when id changes.\nHere every fetch sets state, which re-renders and fetches again.\nAdd [id] and ignore results after the id changes.`,
          fix: `function Profile({ id }) {\n  const [user, setUser] = useState(null);\n  useEffect(() => {\n    let ignore = false;\n    fetch('/api/users/' + id).then(r => r.json()).then(u => { if (!ignore) setUser(u); });\n    return () => { ignore = true; };\n  }, [id]);\n  return <p>{user?.name}</p>;\n}`,
          exercises: [
            {
              task: "Fix the loop.",
              description: "Checks effects setting their own deps.",
              code: "useEffect(() => { setCount(count + 1); }, [count]);",
              answer: "Each update changes count, which reruns the effect forever. Remove the effect or update in an event.",
            },
            {
              task: "Fix the object dependency loop.",
              description: "Checks object deps created in render.",
              code: `const opts = { page };
useEffect(() => { load(opts).then(setData); }, [opts]);`,
              answer: "opts is new every render. Depend on page instead.",
              solution: "useEffect(() => { load({ page }).then(setData); }, [page]);",
            },
            {
              easy: true,
              task: "Spot why this loops.",
              description: "Checks effect without deps.",
              code: "useEffect(() => { setN(n + 1); });",
              answer: "No dependency array, so it runs after every render and sets state.",
            },
            {
              easy: true,
              task: "Fix it to run once on mount.",
              description: "Checks empty deps.",
              code: "useEffect(() => { load(); });",
              answer: "Add an empty dependency array.",
              solution: "useEffect(() => { load(); }, []);",
            },
          ],
        },
        {
          q: `What is useRef used for?`,
          short: `useRef holds a mutable value that survives renders without causing re-renders; it is often used to access DOM nodes.`,
          long: `const ref = useRef(initial) returns { current: initial }, the same object every render.\nAttach it to JSX with ref={ref} to get the DOM node after mount.\nChanging ref.current does not re-render.\nUse it for timers, previous values, and DOM focus or measure.\nIn React 19, ref can be passed as a normal prop to function components (no forwardRef needed).`,
          exercises: [
            {
              task: "Count renders without causing renders.",
              description: "Checks refs for mutable values.",
              code: "function Box() { /* count renders */ }",
              answer: "Increment a ref in an effect; refs persist and do not trigger re-renders.",
              solution: `const renders = useRef(0);
useEffect(() => { renders.current++; });`,
            },
            {
              task: "Spot the problem.",
              description: "Checks reading refs during render.",
              code: "return <p>{ref.current}</p>;",
              answer: "Reading a ref in render gives stale output and breaks purity. Use state for shown values.",
            },
            {
              easy: true,
              task: "Name one use of useRef.",
              description: "Checks ref purposes.",
              code: `const inputRef = useRef(null);
<input ref={inputRef} />`,
              answer: "Holding a DOM node, or a value that should not re-render.",
            },
            {
              easy: true,
              task: "Predict the log after two clicks.",
              description: "Checks ref persistence.",
              code: `const r = useRef(0);
onClick={() => { r.current++; console.log(r.current); }}`,
              answer: "2, because ref.current keeps its value between renders.",
            },
          ],
        },
      ],
      middle: [
        {
          q: `The interval shows 1 forever and never counts up. Why? Fix it.`,
          code: `function Timer() {\n  const [count, setCount] = useState(0);\n  useEffect(() => {\n    const id = setInterval(() => setCount(count + 1), 1000);\n    return () => clearInterval(id);\n  }, []);\n  return <p>{count}</p>;\n}`,
          short: `The interval callback closes over count from the first render (0), so it always sets 1; use a functional update.`,
          long: `Effects capture values from the render in which they were created.\nWith [] the effect never re-runs, so count stays 0 inside the closure.\nsetCount(c => c + 1) reads the latest state from React instead.\nAlternative: add count to deps, but that recreates the interval each tick.\nThe exhaustive-deps lint rule would warn about this.`,
          fix: `useEffect(() => {\n  const id = setInterval(() => setCount(c => c + 1), 1000);\n  return () => clearInterval(id);\n}, []);`,
          exercises: [
            {
              task: "Fix the counter.",
              description: "Checks stale closures in intervals.",
              code: `useEffect(() => {
  const id = setInterval(() => setN(n + 1), 1000);
  return () => clearInterval(id);
}, []);`,
              answer: "The closure sees n = 0 forever. Use an updater function.",
              solution: `useEffect(() => {
  const id = setInterval(() => setN(x => x + 1), 1000);
  return () => clearInterval(id);
}, []);`,
            },
            {
              task: "Predict what happens without cleanup in StrictMode.",
              description: "Checks missing interval cleanup.",
              code: "useEffect(() => { setInterval(tick, 1000); }, []);",
              answer: "Two intervals run because the effect mounts twice in development, and it leaks after unmount.",
            },
            {
              easy: true,
              task: "Spot why it stays at 1.",
              description: "Checks stale closure.",
              code: `useEffect(() => {
  setInterval(() => setCount(count + 1), 1000);
}, []);`,
              answer: "The interval sees count from the first render, which is 0.",
            },
            {
              easy: true,
              task: "Fix the update.",
              description: "Checks updater function.",
              code: "setCount(count + 1)",
              answer: "Use the updater form so it reads the latest value.",
              solution: "setCount(c => c + 1)",
            },
          ],
        },
        {
          q: `What is a custom hook? When should you write one?`,
          short: `A custom hook is a function starting with "use" that calls other hooks to reuse stateful logic between components.`,
          long: `Custom hooks share logic, not state: each call has its own state.\nWrite one when two components repeat the same hook pattern (fetch, subscription, media query).\nThe name must start with use so lint can check the Rules of Hooks.\nReturn what callers need: a value, a tuple, or an object.\nKeep them focused; do not hide unrelated effects inside.`,
          exercises: [
            {
              task: "Extract a custom hook.",
              description: "Checks extracting reusable logic.",
              code: `const [on, setOn] = useState(false);
const toggle = () => setOn(o => !o);`,
              answer: "Wrap it in a function starting with \"use\" that returns the value and toggle.",
              solution: `function useToggle(init = false) {
  const [on, setOn] = useState(init);
  return [on, () => setOn(o => !o)];
}`,
            },
            {
              task: "Predict if two components share state.",
              description: "Checks hook state isolation.",
              code: `function A() { const [on] = useToggle(); }
function B() { const [on] = useToggle(); }`,
              answer: "No. Each call has its own state. Hooks share logic, not state.",
            },
            {
              easy: true,
              task: "True or false: hooks inside share state between callers.",
              description: "Checks custom hook state.",
              code: `const a = useToggle();
const b = useToggle();`,
              answer: "False. Each call to a custom hook has its own state.",
            },
            {
              easy: true,
              task: "Name this custom hook's purpose.",
              description: "Checks extracting logic.",
              code: `function useToggle(v = false) {
  const [on, s] = useState(v);
  return [on, () => s(x => !x)];
}`,
              answer: "It reuses toggle logic across components.",
            },
          ],
        },
        {
          q: `This derived value is stored in state and gets out of sync. Fix it.`,
          code: `function Cart({ items }) {\n  const [total, setTotal] = useState(0);\n  useEffect(() => {\n    setTotal(items.reduce((s, i) => s + i.price * i.qty, 0));\n  }, [items]);\n  return <p>Total: {total}</p>;\n}`,
          short: `Values computed from props or state should be calculated during render; storing them in state adds an extra render and can show stale values.`,
          long: `The first render shows 0, then the effect sets the real total and renders again.\nIt is extra code and an extra render.\nCompute it directly: const total = items.reduce(...).\nUse useMemo only if the calculation is expensive.\nThis is one of the main cases in "You Might Not Need an Effect".`,
          fix: `function Cart({ items }) {\n  const total = items.reduce((s, i) => s + i.price * i.qty, 0);\n  return <p>Total: {total}</p>;\n}`,
          exercises: [
            {
              task: "Fix the derived state.",
              description: "Checks computing during render.",
              code: `const [items, setItems] = useState([]);
const [count, setCount] = useState(0);
// setCount(items.length) after each change`,
              answer: "Remove count state; compute it from items.",
              solution: "const count = items.length;",
            },
            {
              task: "Memoize an expensive derived value.",
              description: "Checks useMemo for derived data.",
              code: "const total = bigList.reduce((s, x) => s + x.price, 0);",
              answer: "If it is slow, wrap in useMemo with bigList as dependency. Do not store it in state.",
              solution: `const total = useMemo(
  () => bigList.reduce((s, x) => s + x.price, 0), [bigList]);`,
            },
            {
              easy: true,
              task: "Rewrite the total without state.",
              description: "Checks derived values.",
              code: "const [total, setTotal] = useState(0);",
              answer: "Compute total during render from items.",
              solution: "const total = items.reduce((s, i) => s + i.price, 0);",
            },
            {
              easy: true,
              task: "True or false: duplicate state can go stale.",
              description: "Checks single source of truth.",
              answer: "True. Two copies of one value drift apart.",
            },
          ],
        },
      ],
      senior: [
        {
          q: `If you call setState with the same value, does the component re-render? Explain how React bails out.`,
          short: `React compares the new and old value with Object.is. If they are equal, React skips the re-render of children and effects, although it may still call the component once before bailing out.`,
          long: `setCount(5) when count is already 5 is ignored after an Object.is check.\nReact may still run the component function once to confirm, but it does not re-render children or run effects.\nFor objects and arrays, equality is by reference. Mutating and setting the same object is ignored, so the screen does not change.\nCreating a new object with the same content always causes a render.\nThis is why you must update state immutably: new reference for real changes, same reference for no change.\nYou can use this on purpose: return the previous state from an updater to skip work.`,
          exercises: [
            {
              task: "Predict if Child re-renders.",
              description: "Checks same-value bailout.",
              code: `const [v, setV] = useState("a");
<button onClick={() => setV("a")} /> <Child />`,
              answer: "No. Object.is says the value is the same, so React bails out (it may render the component once more, but not children).",
            },
            {
              task: "Spot why the bailout fails.",
              description: "Checks object identity.",
              code: "setUser({ ...user });",
              answer: "A new object is never Object.is equal, so React always re-renders. Only set when something changed.",
            },
            {
              easy: true,
              task: "Predict if this re-renders.",
              description: "Checks Object.is bailout.",
              code: `const [n, setN] = useState(5);
setN(5);`,
              answer: "No, React bails out because the value is the same.",
            },
            {
              easy: true,
              task: "Predict if this re-renders.",
              description: "Checks new object identity.",
              code: "setUser({ ...user });",
              answer: "Yes. A new object is not equal by Object.is.",
            },
          ],
        },
        {
          q: `This effect re-subscribes on every render. Find why, and fix it without disabling lint.`,
          code: `function Room({ roomId, theme }) {\n  const options = { roomId, serverUrl: URL };\n  useEffect(() => {\n    const conn = createConnection(options);\n    conn.on('connected', () => showToast('Connected', theme));\n    conn.connect();\n    return () => conn.disconnect();\n  }, [options, theme]);\n}`,
          short: `options is a new object each render, and theme changes should not reconnect; create options inside the effect and move the non-reactive logic into an effect event.`,
          long: `Object dependencies compare by reference, so a new object each render re-runs the effect.\nMove the object creation inside the effect and depend on primitives (roomId).\ntheme is only read when the event fires, so it should not trigger reconnect.\nuseEffectEvent (stable in React 19.2) reads the latest props without being a dependency.\nBefore 19.2, use a ref that stores the latest callback.`,
          fix: `function Room({ roomId, theme }) {\n  const onConnected = useEffectEvent(() => showToast('Connected', theme));\n  useEffect(() => {\n    const conn = createConnection({ roomId, serverUrl: URL });\n    conn.on('connected', () => onConnected());\n    conn.connect();\n    return () => conn.disconnect();\n  }, [roomId]);\n}`,
          exercises: [
            {
              task: "Fix the re-subscribe.",
              description: "Checks inline function deps.",
              code: `const onMsg = m => setMsgs(x => [...x, m]);
useEffect(() => chat.on(onMsg), [onMsg]);`,
              answer: "onMsg is new every render. Define it inside the effect.",
              solution: `useEffect(() => {
  return chat.on(m => setMsgs(x => [...x, m]));
}, []);`,
            },
            {
              task: "Read latest props without re-subscribing.",
              description: "Checks useEffectEvent.",
              code: "useEffect(() => socket.on(\"msg\", m => notify(m, theme)), [theme]);",
              answer: "Wrap the handler in useEffectEvent so theme is current but the effect does not rerun.",
              solution: `const onMsg = useEffectEvent(m => notify(m, theme));
useEffect(() => socket.on("msg", onMsg), []);`,
            },
            {
              easy: true,
              task: "Spot why it re-subscribes.",
              description: "Checks object deps.",
              code: `const options = { room };
useEffect(() => subscribe(options), [options]);`,
              answer: "options is a new object each render, so the dep always changes.",
            },
            {
              easy: true,
              task: "Fix it with a primitive dependency.",
              description: "Checks primitive deps.",
              code: "[options]",
              answer: "Depend on room, and build options inside the effect.",
              solution: "useEffect(() => subscribe({ room }), [room]);",
            },
          ],
        },
        {
          q: `What is lazy initial state in useState? Why can StrictMode call your initializer and updater twice?`,
          short: `Passing a function to useState, like useState(() => load()), runs the expensive code only on the first render. In development, StrictMode calls these functions twice to find side effects, so they must be pure.`,
          long: `useState(load()) calls load on every render, even though React ignores the result after the first one.\nuseState(load) or useState(() => load(props.id)) calls it only once.\nThe same applies to useReducer with its third init argument.\nStrictMode in development double-invokes component bodies, initializers, and updater functions.\nIf they are pure, the result is the same and you see no difference.\nIf they push to an array, call an API, or mutate outside data, you see doubled results. That is the bug StrictMode shows.\nProduction calls them once.`,
          exercises: [
            {
              task: "Fix the slow initial state.",
              description: "Checks lazy initializer.",
              code: "const [rows] = useState(parseCsv(bigText));",
              answer: "parseCsv runs on every render. Pass a function so it runs once.",
              solution: "const [rows] = useState(() => parseCsv(bigText));",
            },
            {
              task: "Predict the log count in StrictMode.",
              description: "Checks double-invoked initializers.",
              code: "useState(() => { console.log(\"init\"); return 0; });",
              answer: "\"init\" logs twice in development StrictMode to catch impure code. Only one result is kept.",
            },
            {
              easy: true,
              task: "Spot the wasted work.",
              description: "Checks lazy initializer.",
              code: "useState(readBig())",
              answer: "readBig() runs on every render; pass a function instead.",
            },
            {
              easy: true,
              task: "Fix it with lazy initial state.",
              description: "Checks function initializer.",
              code: "useState(readBig())",
              answer: "Pass the function so React calls it once.",
              solution: "useState(readBig)",
            },
          ],
        },
      ],
      techlead: [
        {
          q: `How do you build and maintain a shared hooks library for many teams?`,
          short: `Treat it as a product: clear ownership, small focused hooks, strong typing, tests, docs, versioning and a process for adding or removing hooks.`,
          long: `Only accept hooks used by at least two teams; keep the rest local.\nRules: no hidden global side effects, SSR-safe, stable return identities, full TypeScript types.\nTest with renderHook from Testing Library, including StrictMode double effects.\nDocument usage examples and anti-patterns.\nVersion with semver and changesets; deprecate with warnings and codemods.\nPrefer proven libraries (TanStack Query, usehooks-ts) over writing your own.`,
          ai: true,
          exercises: [
            {
              task: "Name what each shared hook must include.",
              description: "Checks shared library standards.",
              code: "packages/hooks/src/useX.ts",
              answer: "Types, tests, docs with examples, and a changelog. Use semver so breaking changes are clear.",
            },
            {
              task: "Spot the problem.",
              description: "Checks breaking shared hook changes.",
              code: `// v1: useUser() -> user
// v1.1: useUser() -> { user, loading }`,
              answer: "Changing the return shape breaks callers in a minor version. Add a new hook or bump major with a codemod.",
            },
            {
              easy: true,
              task: "Name one must-have for a shared hooks library.",
              description: "Checks tests and docs.",
              answer: "Unit tests with renderHook and clear docs for each hook.",
            },
            {
              easy: true,
              task: "True or false: breaking hook changes need versioning.",
              description: "Checks semver.",
              answer: "True. Use semver and changelogs so teams can upgrade safely.",
            },
          ],
        },
        {
          q: `Review this shared useLocalStorage hook. Users see stale values across tabs and crashes in private mode. What would you change?`,
          code: `export function useLocalStorage(key, initial) {\n  const [value, setValue] = useState(\n    JSON.parse(localStorage.getItem(key)) ?? initial\n  );\n  useEffect(() => {\n    localStorage.setItem(key, JSON.stringify(value));\n  }, [value]);\n  return [value, setValue];\n}`,
          short: `It reads storage on every render, can throw on bad JSON or blocked storage, breaks on the server, ignores key changes, and never hears updates from other tabs or other hook instances. Build it on useSyncExternalStore with safe parsing.`,
          long: `localStorage.getItem runs on every render because the initial value is not lazy.\nJSON.parse throws on corrupted data; localStorage access can throw in some private modes or when storage is blocked.\nOn the server there is no localStorage, so SSR crashes.\nThe effect lacks key in its deps, so changing key writes the old value to the new key.\nTwo components using the same key do not sync, and other tabs are ignored (no storage event).\nBetter: a small store per key, subscribe to the storage event, read with useSyncExternalStore, and give a server snapshot.\nWrap reads and writes in try/catch and validate the parsed value.`,
          fix: `function read(key, initial) {\n  try {\n    const raw = localStorage.getItem(key);\n    return raw == null ? initial : JSON.parse(raw);\n  } catch {\n    return initial;\n  }\n}\nexport function useLocalStorage(key, initial) {\n  const subscribe = useCallback(cb => {\n    const onStorage = e => { if (e.key === key) cb(); };\n    window.addEventListener("storage", onStorage);\n    window.addEventListener("local-storage", cb);\n    return () => {\n      window.removeEventListener("storage", onStorage);\n      window.removeEventListener("local-storage", cb);\n    };\n  }, [key]);\n  const raw = useSyncExternalStore(\n    subscribe,\n    () => localStorage.getItem(key),\n    () => null\n  );\n  const value = raw == null ? initial : read(key, initial);\n  const set = useCallback(next => {\n    try { localStorage.setItem(key, JSON.stringify(next)); } catch {}\n    window.dispatchEvent(new Event("local-storage"));\n  }, [key]);\n  return [value, set];\n}`,
          exercises: [
            {
              task: "Make the hook safe in private mode.",
              description: "Checks localStorage exceptions.",
              code: "const v = JSON.parse(localStorage.getItem(key));",
              answer: "localStorage can throw or hold bad JSON. Wrap in try/catch with a fallback.",
              solution: `function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}`,
            },
            {
              task: "Sync the value across tabs.",
              description: "Checks the storage event.",
              code: "// tab A updates key, tab B shows old value",
              answer: "Listen to the window storage event and update state when that key changes.",
              solution: `useEffect(() => {
  const h = e => { if (e.key === key) setV(read(key, init)); };
  window.addEventListener("storage", h);
  return () => window.removeEventListener("storage", h);
}, [key]);`,
            },
            {
              easy: true,
              task: "Name the event for other-tab storage changes.",
              description: "Checks storage event.",
              code: "window.addEventListener(\"storage\", onChange);",
              answer: "The window storage event.",
            },
            {
              easy: true,
              task: "Fix the crash in private mode.",
              description: "Checks safe storage access.",
              code: "const v = localStorage.getItem(k);",
              answer: "Wrap localStorage calls in try/catch.",
              solution: `let v = null;
try { v = localStorage.getItem(k); } catch {}`,
            },
          ],
        },
        {
          q: `How do you set lint rules and review checks for hooks across a large team?`,
          short: `Turn on eslint-plugin-react-hooks with errors, not warnings, ban disabling exhaustive-deps without a comment, add the React Compiler lint rules, and back it with a short review checklist and examples.`,
          long: `Start with react-hooks/rules-of-hooks and react-hooks/exhaustive-deps as errors in CI.\nThe newer react-hooks plugin includes compiler-based rules that flag mutations during render and impure code.\nRequire a reason comment for any eslint-disable on hooks, and track the count.\nAdd custom rules for team conventions, like no fetch inside useEffect in feature code.\nReview checklist: is this effect really syncing an external system? Are deps stable? Is cleanup present?\nRoll out gradually: fix one package at a time, use a baseline file so new code is strict from day one.\nMeasure: number of disables, hook-related bugs in incidents.`,
          exercises: [
            {
              task: "Name two lint rules for hooks.",
              description: "Checks hooks linting.",
              code: "// eslint config for React",
              answer: "react-hooks/rules-of-hooks as error and react-hooks/exhaustive-deps. React Compiler rules add more.",
            },
            {
              task: "Spot what review should flag.",
              description: "Checks disabled lint rules.",
              code: `// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => load(id), []);`,
              answer: "Disabling exhaustive-deps hides a stale id bug. Require a reason or fix the deps.",
            },
            {
              easy: true,
              task: "Name the ESLint plugin for hooks.",
              description: "Checks eslint-plugin-react-hooks.",
              code: "plugins: [\"?\"]",
              answer: "eslint-plugin-react-hooks, with rules-of-hooks and exhaustive-deps.",
            },
            {
              easy: true,
              task: "True or false: exhaustive-deps warnings can be ignored.",
              description: "Checks dependency lint.",
              answer: "False. Fix the code, or explain any disable in review.",
            },
          ],
        },
      ],
    },
    'Work with Forms (controlled/not controlled components) and 3-rd party libs (e.g React Hook Forms, Formik, Yup etc)': {
      junior: [
        {
          q: `The user cannot type in this input. Why? Fix it.`,
          code: `function Name() {\n  const [name, setName] = useState('');\n  return <input value={name} />;\n}`,
          short: `The input has a value but no onChange, so React keeps it fixed at the state value; add onChange to update state.`,
          long: `A controlled input shows exactly the value from state.\nWithout onChange, state never changes, so typing has no effect.\nReact also warns: "You provided a value prop without an onChange handler".\nAdd onChange={e => setName(e.target.value)}.\nIf you only need an initial value, use defaultValue (uncontrolled) instead.`,
          fix: `function Name() {\n  const [name, setName] = useState('');\n  return <input value={name} onChange={e => setName(e.target.value)} />;\n}`,
          exercises: [
            {
              task: "Fix the input.",
              description: "Checks controlled input without onChange.",
              code: "<input value={name} />",
              answer: "value with no onChange locks the input. Add onChange that updates state.",
              solution: "<input value={name} onChange={e => setName(e.target.value)} />",
            },
            {
              task: "Spot why typing does nothing.",
              description: "Checks handler not updating state.",
              code: "<input value={name} onChange={e => e.target.value} />",
              answer: "The handler returns the value but never calls setName, so state stays the same.",
            },
            {
              easy: true,
              task: "Spot why typing does nothing.",
              description: "Checks missing onChange.",
              code: "<input value={name} />",
              answer: "value is set but there is no onChange to update it.",
            },
            {
              easy: true,
              task: "Fix the input.",
              description: "Checks controlled input.",
              code: "<input value={name} />",
              answer: "Add onChange that updates state.",
              solution: "<input value={name} onChange={e => setName(e.target.value)} />",
            },
          ],
        },
        {
          q: `How do you handle several inputs with one change handler?`,
          short: `Keep form values in one state object and use the input's name to update the matching field.`,
          long: `Give each input a name that matches a key in state.\nIn the handler, read name and value from e.target.\nUpdate with a copy: setForm(f => ({ ...f, [name]: value })).\nFor checkboxes use checked instead of value.\nFor large forms, a library like react-hook-form is simpler.`,
          exercises: [
            {
              task: "Write one handler for many inputs.",
              description: "Checks computed property names.",
              code: "<input name=\"first\" /> <input name=\"last\" />",
              answer: "Use the input name as the key in one state object.",
              solution: `const onChange = e =>
  setForm(f => ({ ...f, [e.target.name]: e.target.value }));
<input name="first" value={form.first} onChange={onChange} />`,
            },
            {
              task: "Spot the bug.",
              description: "Checks overwriting state objects.",
              code: "setForm({ [e.target.name]: e.target.value });",
              answer: "It replaces the whole object and drops other fields. Spread the previous state.",
            },
            {
              easy: true,
              task: "Fill in the computed key.",
              description: "Checks computed property names.",
              code: "setForm({ ...form, ?: e.target.value })",
              answer: "Use [e.target.name] to update the matching field.",
              solution: "setForm({ ...form, [e.target.name]: e.target.value })",
            },
            {
              easy: true,
              task: "Name the attribute the handler relies on.",
              description: "Checks name attribute.",
              code: "<input name=\"email\" onChange={onChange} />",
              answer: "The name attribute on each input.",
            },
          ],
        },
        {
          q: `How do you read form values without state, using FormData?`,
          short: `Leave inputs uncontrolled and read all values on submit with new FormData(e.currentTarget), or use React 19 form actions which receive FormData.`,
          long: `Uncontrolled inputs keep their own value in the DOM.\nGive each input a name; FormData collects them on submit.\nObject.fromEntries(formData) turns it into a plain object.\nIn React 19, <form action={fn}> calls fn(formData) and resets the form after success.\nThis is simple and fast for forms that do not need live validation.`,
          exercises: [
            {
              task: "Read all fields with FormData.",
              description: "Checks FormData on submit.",
              code: "<form onSubmit={onSubmit}><input name=\"email\" /></form>",
              answer: "Create FormData from the form and convert to an object.",
              solution: `function onSubmit(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.currentTarget));
  send(data);
}`,
            },
            {
              task: "Predict the value for an unchecked checkbox.",
              description: "Checks FormData edge cases.",
              code: `<input type="checkbox" name="agree" />
new FormData(form).get("agree")`,
              answer: "null. Unchecked checkboxes are not included. Checked ones give \"on\".",
            },
            {
              easy: true,
              task: "Predict what this returns.",
              description: "Checks FormData.get.",
              code: `const fd = new FormData(e.currentTarget);
fd.get("email");`,
              answer: "The value of the email input, as a string.",
            },
            {
              easy: true,
              task: "Name the method to get all values as an object.",
              description: "Checks Object.fromEntries.",
              code: "const data = Object.fromEntries(new FormData(form));",
              answer: "Object.fromEntries(new FormData(form)).",
            },
          ],
        },
      ],
      middle: [
        {
          q: `Validation errors show before the user types anything. How do you fix this UX problem?`,
          code: `function Email() {\n  const [email, setEmail] = useState('');\n  const error = !email.includes('@') ? 'Invalid email' : '';\n  return <><input value={email} onChange={e => setEmail(e.target.value)} />{error && <p>{error}</p>}</>;\n}`,
          short: `Track whether the field was touched (blurred) or the form was submitted, and only show errors after that.`,
          long: `Showing errors right away is annoying and confusing.\nCommon rule: validate on blur first, then on change after the first error.\nKeep a touched flag per field, plus a submitted flag for the form.\nConnect the error to the input with aria-describedby and aria-invalid.\nreact-hook-form supports this with mode: 'onTouched'.`,
          fix: `function Email() {\n  const [email, setEmail] = useState('');\n  const [touched, setTouched] = useState(false);\n  const error = touched && !email.includes('@') ? 'Invalid email' : '';\n  return (<>\n    <input value={email} onChange={e => setEmail(e.target.value)} onBlur={() => setTouched(true)} aria-invalid={!!error} aria-describedby="email-err" />\n    {error && <p id="email-err">{error}</p>}\n  </>);\n}`,
          exercises: [
            {
              task: "Show errors only after blur.",
              description: "Checks touched state.",
              code: "{errors.email && <p>{errors.email}</p>}",
              answer: "Track touched fields and show errors only if touched or after submit.",
              solution: `{touched.email && errors.email && <p>{errors.email}</p>}
<input onBlur={() => setTouched(t => ({ ...t, email: true }))} />`,
            },
            {
              task: "Pick the react-hook-form mode.",
              description: "Checks validation modes.",
              code: "useForm({ mode: ??? })",
              answer: "mode: \"onTouched\" validates after the first blur, then on each change. Good default UX.",
            },
            {
              easy: true,
              task: "Name the state that tracks visited fields.",
              description: "Checks touched state.",
              code: "const [touched, setTouched] = useState({});",
              answer: "touched, set on blur, so errors show after the user leaves.",
            },
            {
              easy: true,
              task: "Pick when to show the error.",
              description: "Checks error timing.",
              code: "User opens the form and sees \"Email required\".",
              answer: "After blur or submit, not on page load.",
            },
          ],
        },
        {
          q: `Why is react-hook-form usually faster than a controlled form with useState?`,
          short: `react-hook-form uses uncontrolled inputs with refs, so typing does not re-render the whole form; it only re-renders what subscribes to changed state.`,
          long: `A useState form re-renders the full form on every key press.\nRHF registers inputs and reads values from the DOM on submit or validation.\nformState is a proxy: components re-render only for the fields they read.\nuseWatch and useController let you subscribe to specific fields.\nFor controlled UI libraries (MUI, date pickers) use Controller.`,
          exercises: [
            {
              task: "Predict renders while typing in field A.",
              description: "Checks uncontrolled inputs in RHF.",
              code: `const { register } = useForm();
<input {...register("a")} /><Big />`,
              answer: "Zero form re-renders. register uses refs, so the DOM holds values and only watchers re-render.",
            },
            {
              task: "Spot what brings re-renders back.",
              description: "Checks watch cost.",
              code: "const all = watch(); // at form top",
              answer: "watch() with no args re-renders the whole form on any change. Use useWatch on specific fields.",
            },
            {
              easy: true,
              task: "Name the input type react-hook-form uses by default.",
              description: "Checks uncontrolled inputs.",
              code: "<input {...register(\"name\")} />",
              answer: "Uncontrolled inputs, read through refs.",
            },
            {
              easy: true,
              task: "True or false: typing re-renders the whole form.",
              description: "Checks render isolation.",
              answer: "False. react-hook-form avoids re-rendering on every key.",
            },
          ],
        },
        {
          q: `This zod schema never shows the "passwords must match" error. Fix it.`,
          code: `const schema = z.object({\n  password: z.string().min(8),\n  confirm: z.string(),\n}).refine(d => d.password === d.confirm, { message: 'Passwords must match' });\n// form shows errors.confirm?.message`,
          short: `A refine on the object puts the error at the root path, not on confirm; set path: ['confirm'] so it appears on that field.`,
          long: `Object-level refine errors have an empty path by default.\nRHF stores them in errors.root or not where the UI looks.\nAdd path: ['confirm'] to attach it to the field.\nRefinements run only after the base object schema passes.\nYup equivalent: confirm: yup.string().oneOf([yup.ref('password')], 'Passwords must match').`,
          fix: `const schema = z.object({\n  password: z.string().min(8),\n  confirm: z.string(),\n}).refine(d => d.password === d.confirm, { message: 'Passwords must match', path: ['confirm'] });`,
          exercises: [
            {
              task: "Fix the confirm password check.",
              description: "Checks refine path.",
              code: `z.object({ pw: z.string(), confirm: z.string() })
  .refine(d => d.pw === d.confirm, { message: "Must match" })`,
              answer: "Without path the error goes to the root, so no field shows it. Add path: [\"confirm\"].",
              solution: `.refine(d => d.pw === d.confirm, {
  message: "Must match", path: ["confirm"],
})`,
            },
            {
              task: "Predict when refine runs.",
              description: "Checks refine after field errors.",
              code: "// pw is empty and fails min(8)",
              answer: "The object refine does not run while field rules fail, so the match error appears only after fields are valid.",
            },
            {
              easy: true,
              task: "Name the zod method for cross-field checks.",
              description: "Checks refine.",
              code: "z.object({ pw: z.string(), confirm: z.string() }).?(...)",
              answer: "refine or superRefine on the object schema.",
            },
            {
              easy: true,
              task: "Fill in the path to show the error.",
              description: "Checks refine path.",
              code: "z.object({ pw, confirm }).refine(d => d.pw === d.confirm, { path: ? })",
              answer: "path: [\"confirm\"] puts the error on the confirm field.",
            },
          ],
        },
      ],
      senior: [
        {
          q: `How do you show server validation errors in a react-hook-form form?`,
          short: `Map the API error response to field names and call setError for each, and use a root error for messages not tied to a field.`,
          long: `Agree on an API error format, e.g. { fieldErrors: { email: ['Taken'] }, formError }.\nIn onSubmit, catch the error and call setError('email', { type: 'server', message }).\nUse setError('root.server', ...) for general errors and show them above the form.\nFocus the first field with an error (shouldFocus: true).\nErrors clear when the user edits the field, or on the next submit.\nKeep client and server rules aligned, e.g. share the zod schema.`,
          exercises: [
            {
              task: "Map server errors to fields.",
              description: "Checks setError from API response.",
              code: "// API: { errors: { email: \"Taken\" } }",
              answer: "Loop over errors and call setError for each field.",
              solution: `Object.entries(res.errors).forEach(([k, m]) =>
  setError(k, { type: "server", message: m }));`,
            },
            {
              task: "Show a form-level server error.",
              description: "Checks root errors in RHF.",
              code: "// API: 500, \"Try again later\"",
              answer: "Use setError(\"root.server\", { message }) and render errors.root?.server?.message above the button.",
            },
            {
              easy: true,
              task: "Name the method to show a server error.",
              description: "Checks setError.",
              code: "setError(\"email\", { message: \"Taken\" });",
              answer: "setError, with the field name and message.",
            },
            {
              easy: true,
              task: "Name the field for a form-wide error.",
              description: "Checks root errors.",
              code: "setError(\"root.server\", { message: \"Try again\" });",
              answer: "\"root.serverError\" or another root key.",
            },
          ],
        },
        {
          q: `The "Reset" button does not reset the form after data loads. Fix it.`,
          code: `function EditUser({ user }) {\n  const { register, reset, handleSubmit } = useForm({ defaultValues: user });\n  return (<form onSubmit={handleSubmit(save)}>\n    <input {...register('name')} />\n    <button type="button" onClick={() => reset()}>Reset</button>\n  </form>);\n}\n// user is undefined on first render, then loaded`,
          short: `defaultValues are read only once on first render, when user was undefined; call reset(user) when data arrives, or use the values prop, or render the form only after loading.`,
          long: `useForm caches defaultValues from the first render.\nLater changes to user are ignored, so reset() goes back to empty values.\nOption 1: render the form only when user exists (often the simplest).\nOption 2: pass values: user — RHF updates the form when it changes.\nOption 3: useEffect(() => { if (user) reset(user); }, [user, reset]).\nBe careful: refetches can overwrite edits; use resetOptions: { keepDirtyValues: true }.`,
          fix: `function EditUserPage({ userId }) {\n  const { data: user } = useQuery({ queryKey: ['user', userId], queryFn: () => getUser(userId) });\n  if (!user) return <Spinner />;\n  return <EditUser key={user.id} user={user} />;\n}`,
          exercises: [
            {
              task: "Fix the reset after loading.",
              description: "Checks reset with loaded values.",
              code: "const { reset } = useForm({ defaultValues: data }); // data undefined first",
              answer: "defaultValues are read once. Call reset(data) when data arrives.",
              solution: "useEffect(() => { if (data) reset(data); }, [data, reset]);",
            },
            {
              task: "Use the values option instead.",
              description: "Checks RHF values prop.",
              code: "useForm({ defaultValues: data })",
              answer: "Pass values: data; react-hook-form updates the form when values change.",
              solution: "useForm({ values: data })",
            },
            {
              easy: true,
              task: "Name the method to load new defaults.",
              description: "Checks reset with values.",
              code: "useEffect(() => { reset(user); }, [user]);",
              answer: "reset(data), which sets new default values.",
            },
            {
              easy: true,
              task: "True or false: defaultValues update after first render.",
              description: "Checks defaultValues caching.",
              code: "useForm({ defaultValues: user }); // user loads later",
              answer: "False. They are cached; use reset to change them.",
            },
          ],
        },
        {
          q: `When would you pick Formik, react-hook-form, TanStack Form or plain React 19 actions?`,
          short: `react-hook-form is the common default for complex client forms, TanStack Form for strongly typed headless needs, React 19 actions for simple and server-driven forms; Formik is mostly legacy now.`,
          long: `Formik: controlled, re-renders a lot, slow maintenance; keep it in old code, avoid in new code.\nreact-hook-form: uncontrolled, fast, big ecosystem, resolvers for zod/yup/valibot.\nTanStack Form: fully typed paths, framework-agnostic, good for complex dynamic forms.\nReact 19 actions + useActionState: progressive enhancement, works with Server Functions, little JS.\nChoose based on form complexity, SSR needs, team knowledge, and design-system integration.`,
          exercises: [
            {
              task: "Pick a tool for a two-field login form.",
              description: "Checks avoiding overkill.",
              code: "// email + password, React 19",
              answer: "Plain form with a React 19 action and native validation is enough. No library needed.",
            },
            {
              task: "Name why Formik is rarely picked today.",
              description: "Checks library trends.",
              code: "// new project, large forms",
              answer: "Formik is controlled, re-renders a lot and is barely maintained. react-hook-form or TanStack Form are faster and typed.",
            },
            {
              easy: true,
              task: "Pick a tool for a simple React 19 form.",
              description: "Checks form actions.",
              code: "<form action={save}>",
              answer: "Plain React 19 actions with a form action function.",
            },
            {
              easy: true,
              task: "Pick a tool for a big, fast form.",
              description: "Checks react-hook-form fit.",
              answer: "react-hook-form, which has few re-renders and good schema support.",
            },
          ],
        },
      ],
      techlead: [
        {
          q: `How do you migrate 200 Formik forms to react-hook-form without stopping feature work?`,
          short: `Migrate incrementally: build shared RHF field components, convert forms when touched, use codemods for simple cases, and track progress.`,
          long: `First build RHF versions of the shared field components (TextField, Select, DatePicker) with the same props.\nMove Yup schemas as-is via yupResolver; switching to zod can be a separate step.\nRule: any form edited for a feature gets migrated in the same PR if small.\nCodemods handle simple forms; complex ones get tickets.\nTrack progress on a dashboard and set a deadline for removing Formik.\nCompare tests and visual snapshots before and after.`,
          ai: true,
          exercises: [
            {
              task: "Name a safe migration order.",
              description: "Checks incremental migration.",
              code: "// 200 Formik forms",
              answer: "Migrate new and touched forms first, share one FormField wrapper, and track progress. No big bang.",
            },
            {
              task: "Name a way to avoid regressions.",
              description: "Checks tests during migration.",
              code: "// rewrite form from Formik to RHF",
              answer: "Write behavior tests with Testing Library before migrating, then keep them passing. They do not depend on the library.",
            },
            {
              easy: true,
              task: "Name the safe migration style.",
              description: "Checks incremental migration.",
              code: "200 Formik forms, 3 teams, no feature freeze.",
              answer: "Migrate forms one by one, starting with new or changed ones.",
            },
            {
              easy: true,
              task: "True or false: both libraries can run together.",
              description: "Checks coexistence.",
              answer: "True. Both can live in the app during migration.",
            },
          ],
        },
        {
          q: `Design a schema-driven form system for a product where admins create forms.`,
          short: `Store a versioned JSON schema of fields and rules, render it with a registry of field components, validate on client and server from the same schema, and keep answers tied to the schema version.`,
          long: `Schema: fields (type, label, options), conditions (show if), validation rules, layout.\nRenderer maps field types to design-system components; unknown types fail safely.\nValidation: build a zod schema at runtime from the JSON on both client and server.\nVersion every schema; submissions save the version they used.\nAccessibility built into each field component.\nConsider JSON Schema / JSON Forms or existing tools before building your own.`,
          ai: true,
          exercises: [
            {
              task: "Render a field from a schema item.",
              description: "Checks component maps.",
              code: "const field = { type: \"text\", name: \"city\", label: \"City\" };",
              answer: "Map type to a component and render it with the field config.",
              solution: `const FIELDS = { text: TextField, select: SelectField };
const C = FIELDS[field.type];
return C ? <C {...field} /> : null;`,
            },
            {
              task: "Spot the risk.",
              description: "Checks unsafe admin content.",
              code: "<p dangerouslySetInnerHTML={{ __html: field.help }} />",
              answer: "Admin text injected as HTML allows XSS. Render as text or sanitize with DOMPurify.",
            },
            {
              easy: true,
              task: "Name the format to describe a dynamic form.",
              description: "Checks JSON schema.",
              code: "[{ type: \"text\", name: \"email\", required: true }]",
              answer: "A JSON schema that maps field types to components.",
            },
            {
              easy: true,
              task: "True or false: admins' schemas need validation.",
              description: "Checks schema validation.",
              answer: "True. Validate schemas so bad configs cannot break forms.",
            },
          ],
        },
        {
          q: `Users lose form data when their session expires. How do you solve this across the app?`,
          short: `Autosave drafts locally or to the server, refresh tokens silently, and on 401 keep the form, re-authenticate in a dialog and retry the submit.`,
          long: `Save drafts to localStorage/IndexedDB (debounced) keyed by user and form id; clear after a successful submit.\nUse silent token refresh so most sessions never expire mid-edit.\nOn 401 during submit, open a login dialog, keep the form mounted, then retry.\nWarn on navigation with unsaved changes (useBlocker in React Router).\nDo not store sensitive fields (passwords, card data) in drafts.\nMake it a shared hook (useFormDraft) so all teams get it.`,
          exercises: [
            {
              task: "Save a draft before the session expires.",
              description: "Checks draft persistence.",
              code: "// long form, token expires after 30 min",
              answer: "Autosave drafts to local storage or server, debounced. Restore after login.",
            },
            {
              task: "Handle a 401 without losing data.",
              description: "Checks silent reauth.",
              code: "// submit returns 401",
              answer: "Keep the form mounted, show a login dialog or refresh the token, then retry the request.",
            },
            {
              easy: true,
              task: "Name where to save a draft.",
              description: "Checks draft storage.",
              answer: "localStorage or the server, keyed by form and user.",
            },
            {
              easy: true,
              task: "Pick what happens on a 401 during submit.",
              description: "Checks re-auth flow.",
              code: "User clicks Save after an hour away.",
              answer: "Keep the data, log in again, then retry the submit.",
            },
          ],
        },
      ],
    },
    'Built in state management (state, context) and 3-rd party libs (rtk, zustand, etc)': {
      junior: [
        {
          q: `The list does not update after adding an item. Why? Fix it.`,
          code: `function Todos() {\n  const [todos, setTodos] = useState([]);\n  function add(text) {\n    todos.push({ id: Date.now(), text });\n    setTodos(todos);\n  }\n  return <AddForm onAdd={add} />;\n}`,
          short: `push mutates the same array, and setTodos gets the same reference, so React sees no change and skips the render.`,
          long: `React compares old and new state with Object.is.\nThe same array reference means "no change".\nAlways create a new array or object when updating state.\nUse spread: setTodos(t => [...t, newTodo]).\nThe functional update also avoids stale state.`,
          fix: `function add(text) {\n  setTodos(t => [...t, { id: crypto.randomUUID(), text }]);\n}`,
          exercises: [
            {
              task: "Fix the list update.",
              description: "Checks immutable array updates.",
              code: `items.push(newItem);
setItems(items);`,
              answer: "Same array reference, so React skips the render. Create a new array.",
              solution: "setItems(prev => [...prev, newItem]);",
            },
            {
              task: "Update one item immutably.",
              description: "Checks map for updates.",
              code: `items.find(i => i.id === id).done = true;
setItems([...items]);`,
              answer: "It mutates the item, so memoized rows miss it. Replace the item with map.",
              solution: `setItems(prev => prev.map(i =>
  i.id === id ? { ...i, done: true } : i));`,
            },
            {
              easy: true,
              task: "Spot why the list stays the same.",
              description: "Checks mutating state.",
              code: `items.push(x);
setItems(items);`,
              answer: "push mutates the same array, so React sees no change.",
            },
            {
              easy: true,
              task: "Fix it with a new array.",
              description: "Checks immutable updates.",
              code: "items.push(x); setItems(items);",
              answer: "Create a new array with spread.",
              solution: "setItems(prev => [...prev, x]);",
            },
          ],
        },
        {
          q: `How do you create and use a Context in React 19?`,
          short: `Create it with createContext(default), provide a value with <MyContext value={...}>, and read it with useContext or use.`,
          long: `const ThemeContext = createContext('light').\nIn React 19 you can render <ThemeContext value="dark"> directly; .Provider still works.\nRead with useContext(ThemeContext) or use(ThemeContext) (use can be called in conditions).\nComponents without a provider above get the default value.\nAll consumers re-render when the value changes.`,
          exercises: [
            {
              task: "Provide a value in React 19 style.",
              description: "Checks Context as provider.",
              code: "<ThemeContext.Provider value=\"dark\">",
              answer: "In React 19 you can render the context itself as the provider.",
              solution: "<ThemeContext value=\"dark\"><App /></ThemeContext>",
            },
            {
              task: "Read the context in a condition.",
              description: "Checks use() with context.",
              code: `if (!show) return null;
const theme = useContext(ThemeContext);`,
              answer: "useContext cannot follow an early return. use(ThemeContext) can be called conditionally.",
              solution: `if (!show) return null;
const theme = use(ThemeContext);`,
            },
            {
              easy: true,
              task: "Name the function that makes a context.",
              description: "Checks createContext.",
              code: "const ThemeCtx = createContext(\"light\");",
              answer: "createContext, with a default value.",
            },
            {
              easy: true,
              task: "Rewrite this provider in React 19 style.",
              description: "Checks Context as provider.",
              code: "<ThemeCtx.Provider value=\"dark\">",
              answer: "React 19 lets you render the context itself as a provider.",
              solution: "<ThemeCtx value=\"dark\">",
            },
          ],
        },
        {
          q: `What is "lifting state up"?`,
          short: `Moving state to the closest common parent so that two or more children can share and change it through props.`,
          long: `Two siblings cannot read each other's state.\nMove the state to their parent.\nPass the value down as props and pass a callback to change it.\nThe parent becomes the single source of truth.\nIf the parent is far away, consider context or a store.`,
          exercises: [
            {
              task: "Lift the state up.",
              description: "Checks sharing state via parent.",
              code: `function A() { const [q, setQ] = useState(""); }
function B() { /* needs q */ }`,
              answer: "Move q to the parent and pass q and setQ down as props.",
              solution: `function Parent() {
  const [q, setQ] = useState("");
  return <><A q={q} setQ={setQ} /><B q={q} /></>;
}`,
            },
            {
              task: "Name a sign you lifted state too high.",
              description: "Checks over-lifting.",
              code: "// App holds input text for a deep form",
              answer: "Typing re-renders the whole app. Move state down to the lowest common parent.",
            },
            {
              easy: true,
              task: "Name where the shared state goes.",
              description: "Checks common parent.",
              code: "<Parent><Filter /><List /></Parent>",
              answer: "In the closest common parent of both components.",
            },
            {
              easy: true,
              task: "Predict what A and B share here.",
              description: "Checks props from parent.",
              code: `const [v, setV] = useState("");
<A v={v} /><B v={v} setV={setV} />`,
              answer: "The same value, since both read from the parent's state.",
            },
          ],
        },
      ],
      middle: [
        {
          q: `When would you choose Zustand over React Context?`,
          short: `Use Zustand for frequently changing shared client state, because components subscribe to slices with selectors; Context re-renders all consumers when the value changes.`,
          long: `Context is good for rarely changing values: theme, locale, current user, dependencies.\nZustand stores live outside React; useStore(selector) re-renders only when the selected slice changes.\nNo provider needed, actions live in the store, middleware for persist and devtools.\nContext with useReducer is fine for small, local feature state.\nFor server data, use TanStack Query instead of either.`,
          exercises: [
            {
              task: "Read one field from a Zustand store.",
              description: "Checks Zustand selectors.",
              code: "const useCart = create(set => ({ items: [], total: 0 }));",
              answer: "Pass a selector so the component re-renders only when that field changes.",
              solution: "const total = useCart(s => s.total);",
            },
            {
              task: "Name when Context is enough.",
              description: "Checks Context fit.",
              code: "// theme and locale, change rarely",
              answer: "Rarely changing values like theme or locale fit Context. Use Zustand for frequent updates with many readers.",
            },
            {
              easy: true,
              task: "Name one Zustand benefit over Context.",
              description: "Checks selector subscriptions.",
              code: "const useStore = create(set => ({ count: 0 }));",
              answer: "Components subscribe to slices, so fewer re-renders.",
            },
            {
              easy: true,
              task: "Predict who re-renders when count changes.",
              description: "Checks Zustand selectors.",
              code: "const count = useStore(s => s.count);",
              answer: "Only components that select count.",
            },
          ],
        },
        {
          q: `This context causes the whole app to re-render on every key press. Fix it.`,
          code: `function AppProvider({ children }) {\n  const [user, setUser] = useState(null);\n  const [search, setSearch] = useState('');\n  return <AppContext value={{ user, setUser, search, setSearch }}>{children}</AppContext>;\n}`,
          short: `One context holds fast-changing search and slow-changing user, and the value object is new every render; split contexts and memoize values.`,
          long: `Every provider render creates a new value object, so all consumers re-render.\nsearch changes on each key press and forces user consumers to re-render too.\nSplit into UserContext and SearchContext.\nMemoize the value with useMemo, or pass setters in a separate context (setters are stable).\nBetter: keep search local or in the URL; it rarely needs to be global.`,
          fix: `function UserProvider({ children }) {\n  const [user, setUser] = useState(null);\n  const value = useMemo(() => ({ user, setUser }), [user]);\n  return <UserContext value={value}>{children}</UserContext>;\n}\n// search: keep local to the page, or use a separate SearchContext`,
          exercises: [
            {
              task: "Fix the provider value.",
              description: "Checks memoizing context values.",
              code: "<FormCtx value={{ values, setField }}>",
              answer: "A new object each render updates all consumers. Memoize, and split fast-changing values into their own context.",
              solution: `const api = useMemo(() => ({ setField }), []);
<FormApiCtx value={api}><FormValuesCtx value={values}>`,
            },
            {
              task: "Move fast state out of global context.",
              description: "Checks state colocation.",
              code: "// search input text stored in AppContext",
              answer: "Keep the input text local to the search box; only publish the debounced query if others need it.",
            },
            {
              easy: true,
              task: "Spot why everything re-renders.",
              description: "Checks fast-changing context.",
              code: "<AppCtx.Provider value={{ user, searchText }}>",
              answer: "The text changes on each key, so all consumers update.",
            },
            {
              easy: true,
              task: "Name the fix.",
              description: "Checks splitting contexts.",
              answer: "Split contexts, or keep fast state local.",
            },
          ],
        },
        {
          q: `What does Redux Toolkit add on top of plain Redux?`,
          short: `RTK gives configureStore with good defaults, createSlice with Immer for "mutating" reducers, createAsyncThunk, and RTK Query for data fetching.`,
          long: `configureStore sets up devtools, thunk middleware, and dev checks for mutation and serializability.\ncreateSlice creates reducers and action creators together.\nImmer lets you write state.items.push(x) safely in reducers.\ncreateEntityAdapter gives normalized CRUD helpers.\nRTK Query handles caching, invalidation and loading states.\nIt is the official recommended way to write Redux.`,
          exercises: [
            {
              task: "Rewrite with createSlice.",
              description: "Checks RTK boilerplate reduction.",
              code: `const ADD = "add";
function reducer(s = [], a) { return a.type === ADD ? [...s, a.item] : s; }`,
              answer: "createSlice builds actions and an Immer reducer for you.",
              solution: `const slice = createSlice({ name: "todos", initialState: [],
  reducers: { add: (s, a) => { s.push(a.payload); } } });
export const { add } = slice.actions;`,
            },
            {
              task: "Name what RTK Query replaces.",
              description: "Checks RTK Query purpose.",
              code: "// thunks: fetchUsersPending, Fulfilled, Rejected",
              answer: "Hand-written fetch thunks and loading flags. RTK Query adds caching, dedupe and invalidation.",
            },
            {
              easy: true,
              task: "Name the RTK function for slices.",
              description: "Checks createSlice.",
              code: "const slice = ?({ name: \"todos\", initialState, reducers });",
              answer: "createSlice, which creates the reducer and actions.",
            },
            {
              easy: true,
              task: "Name RTK's data fetching tool.",
              description: "Checks RTK Query.",
              answer: "RTK Query, using createApi.",
            },
          ],
        },
      ],
      senior: [
        {
          q: `This selector makes every component re-render on any store change. Fix it.`,
          code: `const selectVisible = state => state.todos.filter(t => !t.done);\nfunction List() {\n  const todos = useSelector(selectVisible);\n  return todos.map(t => <Item key={t.id} todo={t} />);\n}`,
          short: `filter returns a new array each call, so useSelector sees a change on every store update; memoize with createSelector.`,
          long: `useSelector re-runs the selector after every dispatch and compares with ===.\nA new array is never equal, so List re-renders for unrelated actions.\nReact-Redux also warns in dev when a selector returns new references for the same input.\ncreateSelector (Reselect) caches the result while inputs are the same.\nFor per-component params, create the selector with useMemo or use a factory.`,
          fix: `const selectTodos = s => s.todos;\nconst selectVisible = createSelector([selectTodos], todos => todos.filter(t => !t.done));\nfunction List() {\n  const todos = useSelector(selectVisible);\n  return todos.map(t => <Item key={t.id} todo={t} />);\n}`,
          exercises: [
            {
              task: "Fix the selector.",
              description: "Checks selecting the whole state.",
              code: "const { user } = useSelector(s => s);",
              answer: "Selecting the whole state re-renders on any change. Select only user.",
              solution: "const user = useSelector(s => s.user);",
            },
            {
              task: "Fix a selector that returns an object.",
              description: "Checks shallowEqual.",
              code: "useSelector(s => ({ a: s.a, b: s.b }))",
              answer: "A new object each time fails the equality check. Use two selectors or shallowEqual.",
              solution: "useSelector(s => ({ a: s.a, b: s.b }), shallowEqual)",
            },
            {
              easy: true,
              task: "Spot why it always re-renders.",
              description: "Checks new objects in selectors.",
              code: "useSelector(s => s.todos.filter(t => t.done))",
              answer: "filter returns a new array each time, failing the equality check.",
            },
            {
              easy: true,
              task: "Name the tool to memoize selectors.",
              description: "Checks createSelector.",
              code: "const selectDone = ?([selectTodos], t => t.filter(x => x.done));",
              answer: "createSelector from Redux Toolkit (Reselect).",
            },
          ],
        },
        {
          q: `How do you keep state in the URL with React Router? When should you?`,
          short: `Use useSearchParams for filters, sort, page and tabs so they are shareable, survive reloads and work with back/forward.`,
          long: `Rule: if a user would expect to share or bookmark it, put it in the URL.\nuseSearchParams returns params and a setter; update with a function to keep other params.\nParse and validate params (zod) and give defaults.\nUse replace for frequent updates (typing) so history is not flooded.\nnuqs offers typed URL state hooks.\nDo not put sensitive data in the URL.`,
          exercises: [
            {
              task: "Store the active tab in the URL.",
              description: "Checks search params state.",
              code: "const [tab, setTab] = useState(\"info\");",
              answer: "Read and write it with useSearchParams so refresh and links keep it.",
              solution: `const [p, setP] = useSearchParams();
const tab = p.get("tab") ?? "info";
const setTab = t => setP({ tab: t }, { replace: true });`,
            },
            {
              task: "Name state that should not go in the URL.",
              description: "Checks URL state limits.",
              code: "// draft text, tokens, hover state",
              answer: "Secrets like tokens, large drafts and short UI state like hover. The URL is visible, shared and logged.",
            },
            {
              easy: true,
              task: "Name the hook to read ?tab=.",
              description: "Checks useSearchParams.",
              code: "const [params] = useSearchParams();",
              answer: "useSearchParams, then params.get(\"tab\").",
            },
            {
              easy: true,
              task: "Pick URL or local state for a modal's input text.",
              description: "Checks what not to put in URL.",
              answer: "Local state; draft text is not worth sharing.",
            },
          ],
        },
        {
          q: `How do you avoid the "flash of wrong content" when restoring persisted Zustand state with SSR?`,
          short: `Persisted state is only available on the client, so server HTML uses defaults; delay rendering of persisted parts until hydration, or use skipHydration and rehydrate in an effect.`,
          long: `On the server there is no localStorage, so the store has initial values.\nOn the client, persist rehydrates and the UI changes after paint, or causes hydration mismatch.\nOptions: render persisted UI only after a hasHydrated flag is true.\nUse persist's skipHydration: true and call store.persist.rehydrate() in useEffect.\nFor per-request data in Next.js, create the store per request and pass it via context, not a module singleton.\nCookies can carry small preferences (theme) so the server can render correctly.`,
          ai: true,
          exercises: [
            {
              task: "Spot the hydration flash.",
              description: "Checks persisted state on server.",
              code: "const theme = useSettings(s => s.theme); // persisted in localStorage",
              answer: "The server has no localStorage, so it renders the default, then the client switches. Read after hydration or store in a cookie.",
            },
            {
              task: "Wait for rehydration before rendering.",
              description: "Checks hasHydrated pattern.",
              code: "// zustand persist middleware",
              answer: "Track hydration and render a placeholder until done, or use skipHydration and rehydrate in an effect.",
              solution: `const [ready, setReady] = useState(false);
useEffect(() => { useSettings.persist.rehydrate(); setReady(true); }, []);
if (!ready) return <Skeleton />;`,
            },
            {
              easy: true,
              task: "Name the cause of the flash.",
              description: "Checks persisted state mismatch.",
              answer: "Server renders defaults, then the client loads stored values.",
            },
            {
              easy: true,
              task: "Name a Zustand persist option that helps.",
              description: "Checks skipHydration.",
              code: "persist(fn, { name: \"cart\", skipHydration: true })",
              answer: "skipHydration, then rehydrate in an effect.",
            },
          ],
        },
      ],
      techlead: [
        {
          q: `Write the team guide for "where state lives". What does it contain?`,
          short: `A decision tree: local state first, then lifted state, URL for shareable UI state, TanStack Query for server data, context for dependencies, and a client store only for shared, frequently updated client state.`,
          long: `Server state (API data) goes to TanStack Query or RTK Query, never copied into a store.\nURL state: filters, tabs, pagination.\nForm state: form library.\nLocal UI state: useState/useReducer near where it is used.\nContext: theme, auth session, feature flags, services.\nGlobal client store (Zustand/RTK): cross-feature client state like a multi-step editor.\nInclude examples, anti-patterns and lint or review checks.`,
          ai: true,
          exercises: [
            {
              task: "Name the sections of the guide.",
              description: "Checks state guide structure.",
              code: "// docs/state.md for 10 teams",
              answer: "A decision table: local, URL, server cache, global store, with examples, banned patterns, and lint rules that enforce it.",
            },
            {
              task: "Classify this example for the guide.",
              description: "Checks applying the guide.",
              code: "// current user's permissions",
              answer: "Server state cached with TanStack Query, read via a usePermissions hook. Not copied into a global store.",
            },
            {
              easy: true,
              task: "Name one rule in the guide.",
              description: "Checks local first.",
              code: "Is the state used by one component only?",
              answer: "Start with local state, and lift only when needed.",
            },
            {
              easy: true,
              task: "Pick a home for API data.",
              description: "Checks server cache.",
              code: "GET /api/orders result",
              answer: "A server cache like TanStack Query.",
            },
          ],
        },
        {
          q: `Review this store design. What would you change?`,
          code: `export const useStore = create(set => ({\n  user: null, products: [], productsLoading: false, cart: [], theme: 'light', modalOpen: false,\n  fetchProducts: async () => { set({ productsLoading: true }); const p = await api.products(); set({ products: p, productsLoading: false }); },\n}));`,
          short: `It is a god store that mixes server data, UI state and preferences; split it by domain, move products to TanStack Query and keep UI state local.`,
          long: `products and loading are server state: no caching, no errors, no refetch; use a query.\nmodalOpen is local UI state and should not be global.\ntheme is a preference: context or a small persisted store.\ncart can be its own slice/store with clear actions.\nOne store for everything means every team edits the same file and coupling grows.\nSplit by feature, own each slice, and add tests for actions.`,
          fix: `const useProducts = () => useQuery({ queryKey: ['products'], queryFn: api.products });\nexport const useCart = create(set => ({\n  items: [],\n  add: i => set(s => ({ items: [...s.items, i] })),\n}));\n// theme -> ThemeContext or persisted prefs store; modalOpen -> useState`,
          exercises: [
            {
              task: "Spot the problem.",
              description: "Checks storing server data in stores.",
              code: "useStore.setState({ users: await api.users() });",
              answer: "Server data in a client store has no caching, refetch or staleness logic. Use a query library instead.",
            },
            {
              task: "Fix the derived value in the store.",
              description: "Checks derived data in stores.",
              code: "{ items: [], count: 0 } // count updated manually",
              answer: "count can drift from items. Derive it in a selector: s => s.items.length.",
            },
            {
              easy: true,
              task: "Spot the problem in this store.",
              description: "Checks server data in global store.",
              code: "useStore.setState({ orders: await fetchOrders() });",
              answer: "It copies server data into a global store, which goes stale.",
            },
            {
              easy: true,
              task: "True or false: one giant store is best.",
              description: "Checks store boundaries.",
              answer: "False. Small, focused stores are easier to own and test.",
            },
          ],
        },
        {
          q: `The team wants to move from Redux to Zustand. How do you evaluate this?`,
          short: `First find the real pain (boilerplate, server state in Redux, performance), measure it, and check if RTK/RTK Query fixes it; migrate only if the benefit is clear and you can do it step by step.`,
          long: `Often the pain is hand-written Redux or server data in reducers; RTK Query or TanStack Query removes most of it.\nZustand is smaller and simpler but has fewer conventions; large teams may need rules.\nConsider devtools, middleware, SSR, testing, and team knowledge.\nIf migrating: move server state to a query library first, then move remaining slices by feature.\nBoth can run side by side during migration.\nWrite an ADR with the decision and exit criteria.`,
          ai: true,
          exercises: [
            {
              task: "Name two criteria for the evaluation.",
              description: "Checks evaluating a migration.",
              code: "// Redux -> Zustand proposal",
              answer: "Real pain points (boilerplate, perf) with numbers, and migration cost plus loss of DevTools and middleware. Try one feature first.",
            },
            {
              task: "Spot the weak argument.",
              description: "Checks hype-driven decisions.",
              code: "// \"Zustand is trending, Redux is old\"",
              answer: "Popularity is not a reason. Show measured problems and the cost to migrate.",
            },
            {
              easy: true,
              task: "Name one thing to measure first.",
              description: "Checks evaluation criteria.",
              answer: "Pain points, like boilerplate or re-render costs.",
            },
            {
              easy: true,
              task: "Name a low-risk way to try Zustand.",
              description: "Checks pilot approach.",
              answer: "Use it for one new feature first.",
            },
          ],
        },
      ],
    },
  },
};
