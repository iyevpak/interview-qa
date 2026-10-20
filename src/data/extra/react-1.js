export default {
  React: {
    'JSX, Virtual DOM, and Components': {
      junior: [
        {
          q: `Why must component names start with a capital letter in JSX?`,
          short: `JSX treats lowercase tags as built-in DOM elements (strings) and capitalized tags as references to components (variables).`,
          long: `<div /> compiles to jsx('div', ...) — a string type, rendered as a DOM node.\n<MyButton /> compiles to jsx(MyButton, ...) — a reference to a function/class.\nIf you write <myButton />, React tries to create an unknown DOM element "mybutton" and warns.\nDotted names like <Form.Input /> are also treated as references.\nTo render a dynamic component, assign it to a capitalized variable first: const Tag = components[type]; <Tag />.`,
          exercises: [
            { task: `Render a component chosen from a map by a string prop.`, description: `Checks dynamic component rendering. Write it in a Vite React sandbox and switch the prop.`, code: `const icons = { star: StarIcon, heart: HeartIcon };\nfunction Icon({ name }) {\n  // render the right icon\n}`, answer: `Assign the lookup to a capitalized variable and render it: const Cmp = icons[name]; return Cmp ? <Cmp /> : null. Writing <icons[name] /> is invalid JSX, and a lowercase variable would be treated as a DOM tag.`, solution: `function Icon({ name }) {\n  const Cmp = icons[name];\n  return Cmp ? <Cmp /> : null;\n}` },
            { task: `Explain what this warning means: "The tag <card> is unrecognized in this browser".`, description: `Checks understanding of JSX tag resolution. Reproduce by rendering <card /> where Card is imported.`, answer: `The component was written in lowercase, so JSX compiled it to the string 'card' instead of the Card variable. React tried to create an unknown HTML element. Rename the usage to <Card /> to fix it.` },
          ],
        },
        {
          q: `This component renders nothing useful and shows a JSX syntax error. Fix it.`,
          code: `function Profile({ user }) {\n  return (\n    <h1>{user.name}</h1>\n    <p class="bio">{user.bio}</p>\n  );\n}`,
          short: `A component must return a single root, and JSX uses className instead of class.`,
          long: `Adjacent JSX elements must be wrapped because return can only return one expression.\nUse a Fragment (<>...</>) to avoid an extra DOM node.\nclass is a reserved word in JS; JSX uses className (React 19 still warns on class).\nSimilarly: htmlFor instead of for, camelCase event handlers and style objects.`,
          fix: `function Profile({ user }) {\n  return (\n    <>\n      <h1>{user.name}</h1>\n      <p className="bio">{user.bio}</p>\n    </>\n  );\n}`,
          exercises: [
            { task: `Fix the label/style issues in this snippet.`, description: `Checks JSX attribute naming. Paste into a sandbox and check the console for warnings.`, code: `<label for="email" style="color: red">Email</label>`, answer: `for becomes htmlFor, and style must be an object with camelCase keys, not a string. Correct: <label htmlFor="email" style={{ color: 'red' }}>Email</label>. A string style throws an error in React.` },
            { task: `Return two sibling rows from a table row component without breaking table markup.`, description: `Checks Fragment use where wrapper divs are invalid. Render inside a <tbody> and inspect the DOM.`, answer: `Wrap the two <tr> elements in a Fragment, because a <div> inside <tbody> is invalid HTML and breaks layout. If you need a key (e.g. in a map), use <Fragment key={id}>. Fragments add no DOM node.` },
          ],
        },
        {
          q: `What are props, and why can't a component modify its own props?`,
          short: `Props are read-only inputs passed from parent to child; React relies on one-way data flow, so the parent owns them.`,
          long: `Props are the arguments of a component function, passed as JSX attributes.\nThey can be any value: strings, numbers, objects, functions, JSX (children).\nMutating props breaks purity: the parent's data changes silently and React will not re-render.\nTo change data, the owner keeps it in state and passes a callback down.\nIn dev, React freezes the props object, so assignments throw in strict mode code.`,
          exercises: [
            { task: `A child needs to change a value displayed by its parent. Implement it.`, description: `Checks lifting state up / callback props. Build Parent + Child with a button in a sandbox.`, answer: `Keep the value in the parent's useState and pass both the value and a setter-like callback (onChange) to the child. The child calls onChange(newValue) instead of mutating props. The parent re-renders with the new value.`, solution: `function Parent() {\n  const [n, setN] = useState(0);\n  return <Child value={n} onIncrement={() => setN(v => v + 1)} />;\n}\nfunction Child({ value, onIncrement }) {\n  return <button onClick={onIncrement}>{value}</button>;\n}` },
            { task: `Provide a default value for an optional "size" prop.`, description: `Checks modern default props. Render <Button /> without size and log the value.`, answer: `Use default parameters in destructuring: function Button({ size = 'md' }). defaultProps on function components was removed in React 19, so destructuring defaults are the standard way.` },
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
            { task: `Prove the remount with a log.`, description: `Checks reasoning about type identity. Add useEffect(() => { console.log('mount'); return () => console.log('unmount'); }, []) inside the nested Card and trigger a parent re-render.`, answer: `Every parent render logs unmount then mount for each card, proving the subtree is recreated. After hoisting Card, mount is logged only once. This shows type identity, not props, decides whether state survives.` },
            { task: `When is useMemo on the inner component definition an acceptable workaround?`, description: `Checks judgement. Discuss in writing.`, answer: `Almost never; useMemo is a performance hint and React may discard the cache, causing remounts anyway. If the component needs closure values, pass them as props or use context. Hoisting is the correct fix.` },
          ],
        },
        {
          q: `How does React's diffing algorithm stay O(n), and what assumptions does it make?`,
          short: `It assumes elements of different types produce different trees and uses keys to match children, comparing level by level instead of doing a generic tree diff.`,
          long: `A general tree diff is O(n^3); React uses heuristics to get O(n).\nDifferent type at the same position (div -> span, A -> B) = tear down and rebuild the subtree.\nSame DOM type = keep the node, update changed attributes, recurse into children.\nSame component type = keep the instance/state, re-render with new props.\nChildren lists are matched by key; without keys, by index.\nConsequence: moving a component to a different parent or wrapping it conditionally resets its state.`,
          exercises: [
            { task: `Predict: toggling a wrapper div around <Counter /> — is state kept?`, description: `Checks position/type rules. Code: {wrap ? <div><Counter /></div> : <Counter />}. Run and click before toggling.`, answer: `State is lost, because at that position the type changes from div to Counter (or vice versa), so the subtree is rebuilt. To preserve state keep the tree structure stable, e.g. always render the div and toggle a className.` },
            { task: `Two branches render <Input /> in the same position: {isAdmin ? <Input placeholder="admin"/> : <Input placeholder="user"/>}. Is the typed text kept on toggle?`, description: `Checks same-type reuse. Run in a sandbox with an uncontrolled input.`, answer: `Yes — same type at the same position, so React reuses the instance and DOM node and only updates the placeholder. If you want a fresh input, give each branch a different key.` },
          ],
        },
        {
          q: `What is the children prop and how does composition replace inheritance in React?`,
          short: `children is whatever is nested inside a component's JSX tag; React composes behavior by passing elements and callbacks rather than extending classes.`,
          long: `<Card><p>Hi</p></Card> passes the p element as props.children.\nSlots: pass multiple JSX props (header, footer) for layout components.\nSpecialization: a WelcomeDialog renders <Dialog title="Welcome" /> instead of extending Dialog.\nRender props / function children pass data back to the caller.\nComposition also helps performance: children created by the parent don't re-render when the wrapper's state changes.`,
          exercises: [
            { task: `Build a Layout with header, sidebar and children slots.`, description: `Checks slot composition. Implement and render with different content.`, answer: `Accept header, sidebar and children props and place them in the layout markup. Callers pass JSX for each slot, so Layout stays agnostic of content. This is preferable to many boolean props.`, solution: `function Layout({ header, sidebar, children }) {\n  return (<div className="grid"><header>{header}</header><aside>{sidebar}</aside><main>{children}</main></div>);\n}` },
            { task: `Why doesn't <ExpensiveTree /> re-render when the wrapper's state changes in <ScrollTracker><ExpensiveTree /></ScrollTracker>?`, description: `Checks element identity optimization. Add a console.log in ExpensiveTree and scroll.`, answer: `The ExpensiveTree element is created by the parent of ScrollTracker, so when only ScrollTracker's state changes, props.children is the same element object. React bails out on identical elements. Moving state down or lifting content up is a cheap optimization without memo.` },
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
            { task: `Where is it safe to write to a ref?`, description: `Checks ref rules. Discuss and demonstrate with StrictMode on.`, answer: `In event handlers and effects. Reading or writing ref.current during render (except lazy initialization like if (ref.current === null) ref.current = new X()) makes output unpredictable. The React Compiler and lint rules flag render-time ref access.` },
            { task: `Explain why the React Compiler requires purity.`, description: `Checks React 19 compiler knowledge. Write a short explanation.`, answer: `The compiler auto-memoizes values and JSX based on their inputs; it assumes the same inputs give the same output. Side effects or mutation in render would be skipped or replayed incorrectly once memoized. It bails out on components that break the Rules of React.` },
          ],
        },
        {
          q: `Explain Fiber: what problem it solved and how render and commit phases differ.`,
          short: `Fiber split rendering into interruptible units of work; the render phase computes changes (pure, can pause/restart), the commit phase applies them to the DOM synchronously.`,
          long: `The old stack reconciler recursed synchronously and could block the main thread for long trees.\nFiber represents each element as a node with links (child, sibling, return) so work can be paused and resumed.\nRender phase: call components, diff, build a work-in-progress tree; can be interrupted by higher-priority updates (lanes).\nCommit phase: mutate DOM, run layout effects, then schedule passive effects; never interrupted.\nDouble buffering: current tree vs work-in-progress tree, swapped on commit.\nThis enables transitions, Suspense, selective hydration and time slicing.`,
          ai: true,
          exercises: [
            { task: `Show how useTransition keeps typing responsive while filtering a big list.`, description: `Checks priority lanes. Build an input + 10k item filter; compare with and without startTransition using the Performance panel.`, answer: `Keep the input value in urgent state and wrap the list filter state update in startTransition. React renders the list at transition priority and abandons stale renders when new keystrokes arrive. The input stays responsive; isPending can show a hint.`, solution: `const [text, setText] = useState('');\nconst [query, setQuery] = useState('');\nconst [isPending, startTransition] = useTransition();\nfunction onChange(e) {\n  setText(e.target.value);\n  startTransition(() => setQuery(e.target.value));\n}` },
            { task: `Which lifecycle/hooks run in the commit phase?`, description: `Checks phase mapping. List them.`, answer: `DOM mutations, ref attachment, useInsertionEffect, useLayoutEffect (and componentDidMount/Update) run synchronously in commit. useEffect runs after paint (passively), though it may flush synchronously for discrete events. Render functions and useMemo/useState initializers belong to the render phase.` },
          ],
        },
        {
          q: `In React 19, when should a component be a Server Component? When should it be a Client Component?`,
          short: `Default to Server Components for data fetching and static UI; use 'use client' only for interactivity, state, effects or browser APIs, keeping client boundaries as leaves.`,
          long: `Server Components run on the server only, can be async, access data directly and ship no JS.\nThey cannot use state, effects, context consumers or event handlers.\n'use client' marks a module boundary; everything it imports becomes client code.\nServer Components can pass serializable props and even server-rendered JSX (as children) into client components.\nKeep the boundary low: a client <LikeButton> inside a server <Post>.\nServer Functions ('use server') handle mutations called from the client.`,
          exercises: [
            { task: `Fix: a page marked 'use client' at the top just to use one onClick.`, description: `Checks boundary placement. Refactor a Next.js app router page.`, answer: `Remove 'use client' from the page so it stays a Server Component that fetches data. Extract the interactive bit into a small client component file and render it inside the page. This cuts the client bundle and keeps data access on the server.` },
            { task: `Can a Client Component import a Server Component?`, description: `Checks composition rules. Explain with an example.`, answer: `No — an import from a client module turns it into client code. Instead, pass the Server Component as children or a prop from a server parent: <ClientTabs><ServerContent /></ClientTabs>. The server renders it and the client just places the result.` },
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
            { task: `Write a rollout plan with success metrics.`, description: `Checks leadership planning. Produce a one-page plan.`, answer: `Phases: lint cleanup, pilot on 1–2 feature areas, broad enablement, memo cleanup. Metrics: compiled-component coverage, INP/rerender counts on top flows, bug reports tied to the change. Include a kill switch and clear ownership per area.` },
            { task: `A team reports a bug only after enabling the compiler. How do you triage?`, description: `Checks debugging process. Describe steps.`, answer: `Add 'use no memo' to the suspected component to confirm; then look for Rules of React violations (mutation of props/state, render-time ref reads, unstable external stores). Fix the root cause rather than leaving opt-outs, and add a regression test and a lint rule if possible.` },
          ],
        },
        {
          q: `Review this "smart" component used across the product. What would you change?`,
          code: `export function UserCard({ userId }) {\n  const [user, setUser] = useState(null);\n  useEffect(() => { fetch('/api/users/' + userId).then(r => r.json()).then(setUser); }, []);\n  if (!user) return <Spinner />;\n  return <div style={{ padding: 12 }}><img src={user.avatar} />{user.name}<button onClick={() => fetch('/api/follow/' + userId, { method: 'POST' })}>Follow</button></div>;\n}`,
          short: `It mixes data fetching, mutations and presentation, has a stale-dependency bug, no error/race handling, no accessibility and is hard to test or reuse.`,
          long: `Bug: effect deps are [] so changing userId shows the old user; there is also no abort, so responses can race.\nNo error state, no loading skeleton strategy, no cache — every card refetches.\nimg lacks alt; follow button has no pending/disabled state or error feedback.\nInline styles bypass the design system.\nRedesign: a presentational UserCard({ user, onFollow, isFollowing }) plus a data hook (useUser with TanStack Query) and a mutation hook.\nStandardize via shared data layer, Storybook stories for the view, and tests for the hooks.`,
          fix: `function useUser(id) {\n  return useQuery({ queryKey: ['user', id], queryFn: () => api.getUser(id) });\n}\nexport function UserCard({ user, onFollow, isFollowing }) {\n  return (\n    <div className={styles.card}>\n      <img src={user.avatar} alt="" />\n      <span>{user.name}</span>\n      <button onClick={onFollow} disabled={isFollowing}>Follow</button>\n    </div>\n  );\n}`,
          exercises: [
            { task: `Write the container that connects useUser and a follow mutation to UserCard.`, description: `Checks separation of concerns. Implement with TanStack Query.`, answer: `The container calls useUser(userId) and useMutation for follow, handles loading/error states, and passes data and callbacks to UserCard. Invalidate ['user', id] on success. The view stays pure and storybook-friendly.` },
            { task: `Define review checklist items this example would have failed.`, description: `Checks standards setting. Produce 5 items.`, answer: `Examples: effects list all dependencies (lint enforced); server data goes through the shared query layer; every async action has pending and error UI; images and controls are accessible; styling uses design tokens. Each item maps to a lint rule or PR template checkbox.` },
          ],
        },
        {
          q: `For a new product, how do you choose between a Vite SPA, Next.js, or React Router framework mode?`,
          short: `Choose based on SEO/first-load needs, data patterns, team skills, hosting constraints and how much you want server components versus a pure client app.`,
          long: `Internal dashboards behind auth: a Vite SPA with TanStack Query is simple and cheap to host.\nPublic, SEO-sensitive, content-heavy: Next.js App Router (RSC, streaming, caching) or React Router framework mode.\nConsider: deployment platform, edge/serverless costs, vendor coupling, build times, and migration path.\nThe React team recommends starting with a framework for new apps; a SPA is still valid when there's no server need.\nPrototype one critical flow in each option, measure TTFB/LCP/INP and DX, then write an ADR.`,
          ai: true,
          exercises: [
            { task: `Write an ADR outline for this decision.`, description: `Checks decision documentation. Produce headings and key content.`, answer: `Context (product goals, SEO, team, hosting), options considered, evaluation criteria with weights, prototype results, decision, consequences and migration/exit plan. Keep it short and link to the measured data.` },
            { task: `Your team picked a SPA but marketing now needs SEO pages. Options?`, description: `Checks pragmatic architecture. Describe 2–3 options.`, answer: `Serve marketing pages from a separate static/SSR site (Astro/Next) on the same domain; or pre-render specific routes at build time; or migrate incrementally to a framework with route-level adoption. Pick the least disruptive option that meets SEO metrics.` },
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
            { task: `Render a list of names. Show "No users" when the list is empty.`, description: `Checks list rendering and empty state. Build it in a sandbox with an empty and a full array.`, answer: `Check users.length first and return a message when it is 0. Otherwise map over users and give each li a key such as user.id. Avoid {users.length && ...} because it renders 0.`, solution: `function Users({ users }) {\n  if (users.length === 0) return <p>No users</p>;\n  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;\n}` },
            { task: `Where do you put the key: on the li or on the component inside map?`, description: `Checks key placement. Render <Item /> components inside map and test both.`, answer: `The key goes on the outermost element returned from map, e.g. <Item key={x.id} />. A key inside Item's own JSX does nothing for the list. Keys are also not passed to the component as a prop.` },
          ],
        },
        {
          q: `What is the short Fragment syntax? When must you use the long form?`,
          short: `<>...</> groups children without a DOM node; use <Fragment key={...}> when you need a key, because the short form takes no attributes.`,
          long: `Fragments let a component return several elements.\nThey add no wrapper div, so CSS grid/flex and tables stay valid.\nShort syntax <></> cannot take props.\nIn a mapped list of groups, use <Fragment key={item.id}>.\nImport Fragment from 'react' (or use React.Fragment).`,
          exercises: [
            { task: `Render a definition list with a dt and dd per item.`, description: `Checks keyed Fragments. Map an array of { term, desc } inside <dl>.`, answer: `Map each item to <Fragment key={item.term}><dt>{item.term}</dt><dd>{item.desc}</dd></Fragment>. A div wrapper would break dl semantics, and the short syntax cannot take a key.` },
            { task: `Does a Fragment appear in the DOM or in React DevTools?`, description: `Checks understanding of Fragments. Inspect a page in both tools.`, answer: `It does not appear in the DOM; its children are inserted directly into the parent. React DevTools also hides plain Fragments. They only exist in the element tree during reconciliation.` },
          ],
        },
        {
          q: `Can two lists on the same page use the same keys?`,
          short: `Yes. Keys only need to be unique among siblings in one array, not across the page.`,
          long: `React uses keys to match children of one parent between renders.\nTwo different lists have different parents, so the same ids are fine.\nDuplicate keys inside one list cause a warning and wrong updates.\nKeys should be stable: same item, same key across renders.\nDo not generate keys with Math.random() or crypto.randomUUID() during render.`,
          exercises: [
            { task: `Explain the bug when you use key={Math.random()}.`, description: `Checks key stability. Add an input to each row and type, then re-render the parent.`, answer: `Every render gives every row a new key, so React unmounts and remounts all rows. Inputs lose focus and typed text, and performance drops. Use an id from the data instead.` },
            { task: `Merge two arrays from different APIs that both have id 1. What key do you use?`, description: `Checks composite keys. Render the merged list.`, answer: `Combine a source prefix with the id, e.g. key={item.source + '-' + item.id}. This keeps keys unique and stable within the merged list.` },
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
            { task: `Items from a CSV have no id. How do you give them stable keys?`, description: `Checks key strategies. Load sample data and add/remove rows.`, answer: `Assign an id once when you load the data, e.g. with crypto.randomUUID(), and store it with the item. Do not generate ids in render. If a natural unique field exists (email, sku), use it.` },
            { task: `Move the checked state up to the list. Does the index-key bug still matter?`, description: `Checks where state lives. Refactor and test deleting.`, answer: `If checked is stored by item id in the parent (e.g. a Set of ids), the data is correct even with index keys. But DOM state like focus or uncontrolled input values can still move to the wrong row. Stable keys are still the right choice.` },
          ],
        },
        {
          q: `How do you render a nested list, like categories with products?`,
          short: `Map the outer array and inside each item map the inner array; each level needs keys unique among its own siblings.`,
          long: `Outer map: each category gets key={category.id}.\nInner map: each product gets key={product.id}.\nExtract the inner list into its own component for readability.\nKeep data normalized if products are shared between categories.\nFor large trees, consider virtualization or collapsing groups.`,
          exercises: [
            { task: `Build a CategoryList component with grouped products.`, description: `Checks nested mapping. Render data shaped as [{ id, name, products: [...] }].`, answer: `Map categories to a section with a heading and render a ProductList for each, passing products as a prop. ProductList maps products to li elements with product.id keys. This separation keeps each component simple and testable.`, solution: `function CategoryList({ categories }) {\n  return categories.map(c => (\n    <section key={c.id}>\n      <h2>{c.name}</h2>\n      <ul>{c.products.map(p => <li key={p.id}>{p.name}</li>)}</ul>\n    </section>\n  ));\n}` },
            { task: `Group a flat array of products by category before rendering.`, description: `Checks data transforms before render. Use Object.groupBy or reduce.`, answer: `Use Object.groupBy(products, p => p.category) (ES2024) or reduce to build a map. Wrap the transform in useMemo only if the list is large. Then render Object.entries(groups) with the category as key.` },
          ],
        },
        {
          q: `Why should you not filter or sort a list by mutating it in render?`,
          code: `function Sorted({ items }) {\n  const sorted = items.sort((a, b) => a.name.localeCompare(b.name));\n  return sorted.map(i => <li key={i.id}>{i.name}</li>);\n}`,
          short: `sort() mutates the array in place, so it changes the parent's props and state, which breaks purity and can cause hard bugs.`,
          long: `Array.prototype.sort and reverse change the original array.\nThe array is owned by a parent, often in state, so you mutate state without setState.\nOther components may now see a sorted array unexpectedly.\nMemo comparisons may fail because the reference does not change.\nUse toSorted() / toReversed() (ES2023) or copy first with [...items].sort().`,
          fix: `function Sorted({ items }) {\n  const sorted = items.toSorted((a, b) => a.name.localeCompare(b.name));\n  return sorted.map(i => <li key={i.id}>{i.name}</li>);\n}`,
          exercises: [
            { task: `List the array methods that mutate, and their safe versions.`, description: `Checks immutability knowledge. Write a table.`, answer: `Mutating: push, pop, shift, unshift, splice, sort, reverse, fill. Safe versions: concat or spread, slice, toSpliced, toSorted, toReversed, and with() for index replace. Use the safe ones in render and in state updates.` },
            { task: `Add a sort toggle (asc/desc) without mutating props.`, description: `Checks derived state. Implement with one piece of state.`, answer: `Store only the direction in state. Compute the sorted array during render with toSorted and a comparator that flips the sign. Do not store the sorted list in state, because it would get out of sync with props.` },
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
            { task: `Show how to append a message without changing identity of old messages.`, description: `Checks immutable updates. Write the setState call and verify with Profiler.`, answer: `Use setMessages(prev => [...prev, newMsg]). Old message objects are reused, so memoized rows bail out. Avoid mapping and cloning every message, which creates new references and re-renders all rows.` },
            { task: `When is virtualization needed in addition to memo?`, description: `Checks scaling. Explain with numbers.`, answer: `When the list has hundreds or thousands of DOM rows, mount cost and memory are the problem, not re-renders. Virtualization (react-window, TanStack Virtual) renders only visible rows. Memo helps updates; virtualization helps initial render and scrolling.` },
          ],
        },
        {
          q: `How do keys interact with animations, like enter and exit transitions?`,
          short: `Animation libraries track items by key to know which elements entered, left or moved; unstable keys make them animate the wrong elements.`,
          long: `Framer Motion's AnimatePresence and react-transition-group keep exiting children rendered until the exit animation ends.\nThey detect removals by comparing keys between renders.\nIndex keys make a removal look like "last item removed + all others changed".\nLayout animations (FLIP) also rely on key identity to measure old and new positions.\nChanging a key on purpose can trigger a re-mount animation, e.g. a page transition keyed by route.`,
          exercises: [
            { task: `Animate a page change when the route changes.`, description: `Checks key-driven remount. Use AnimatePresence with key={location.pathname}.`, answer: `Wrap the route outlet in AnimatePresence and give the motion element key={location.pathname}. When the path changes, the old element plays its exit animation and the new one enters. Without a changing key, React would just update in place.` },
            { task: `Why do removed items "jump" instead of fading out with index keys?`, description: `Checks diagnosis. Reproduce with a list and AnimatePresence.`, answer: `With index keys, removing item 2 of 5 looks like key 4 was removed and keys 2–3 got new content. So the last row fades and the middle rows change text instantly. Stable ids let the library animate the real removed item.` },
          ],
        },
        {
          q: `Explain how React reorders children with keys. What is the cost of moving items?`,
          short: `React builds a map of old children by key, reuses matching fibers and moves DOM nodes only when needed; moves are cheaper than remounts but still cost DOM operations.`,
          long: `React walks new children in order and tries to match old fibers at the same position.\nWhen keys stop matching, it puts remaining old children into a map by key.\nMatched fibers are reused (state kept) and marked for placement if their position moved.\nUnmatched old fibers are deleted; new keys are mounted.\nMoving one item from the end to the start can mark many nodes as moved, because the algorithm is left-to-right.\nFor huge reordered lists, virtualization or CSS order may be cheaper.`,
          ai: true,
          exercises: [
            { task: `Measure DOM operations when reversing a 1,000-item list.`, description: `Checks performance analysis. Use a MutationObserver to count changes, compare id keys vs index keys.`, answer: `With id keys, React moves existing nodes (insertBefore) and keeps state. With index keys, nodes stay in place but text content updates on every row. Both cost DOM work; ids are correct, index may be similar in cost for plain text but wrong for stateful rows.` },
            { task: `Why can moving the last item to the front cause many moves?`, description: `Checks algorithm details. Explain the "lastPlacedIndex" idea.`, answer: `React tracks the highest old index it has kept in place. The moved item has the highest old index, so every following item has a lower old index and is marked as moved. Moving the first item to the end is cheap by comparison.` },
          ],
        },
      ],
      techlead: [
        {
          q: `Your team keeps shipping list bugs with keys and state. How do you prevent this?`,
          short: `Combine lint rules, data contracts that guarantee ids, shared list components and review guidance.`,
          long: `Enable eslint-plugin-react rules: jsx-key and no-array-index-key (warn, with documented exceptions).\nRequire stable ids in API contracts; generate client ids at load time when missing.\nProvide shared List/Table components that accept getRowId and handle virtualization.\nAdd tests for insert/delete/reorder with stateful rows.\nDocument "where state lives" guidance: per-item state keyed by id in the parent or in the row with stable keys.`,
          exercises: [
            { task: `Write the getRowId contract for a shared DataTable.`, description: `Checks API design. Describe the prop and fallback.`, answer: `DataTable requires getRowId: (row) => string, typed as required in TypeScript. There is no index fallback, so missing ids fail at compile time. Document how to build composite ids for joined data.` },
            { task: `Write a test that catches index-key bugs.`, description: `Checks testing approach. Use React Testing Library.`, answer: `Render a list with a checkbox per row, check row 2, delete row 1, then assert the checkbox is checked on the same item name. Using getByRole('checkbox', { name: ... }) ties the check to the item. The test fails with index keys.` },
          ],
        },
        {
          q: `Product wants a table with 50,000 rows, sorting, grouping and inline edit. What is your technical plan?`,
          short: `Move sorting and filtering to the server or a worker, virtualize rows, use a headless table library, and keep edit state keyed by row id.`,
          long: `Clarify needs: do users really scan 50k rows, or search and filter? Export may cover bulk needs.\nUse TanStack Table (headless) with TanStack Virtual, or a grid like AG Grid if features are heavy.\nServer-side sort, filter and pagination with cursor APIs; cache with TanStack Query.\nInline edit: store drafts in a map by row id; commit with optimistic updates.\nAccessibility: grid roles and keyboard navigation are hard; buying may beat building.\nSet performance budgets (INP < 200ms) and test on low-end devices.`,
          ai: true,
          exercises: [
            { task: `Compare build vs buy for this grid.`, description: `Checks decision-making. Produce a short matrix.`, answer: `Build (TanStack Table): full control and design-system fit, but higher cost for a11y, virtualization and editing. Buy (AG Grid etc.): fast feature delivery and tested keyboard support, but license cost and styling limits. Decide on required features, timeline and team capacity.` },
            { task: `How do you keep scroll position and edits when data refetches?`, description: `Checks state design. Explain the approach.`, answer: `Use stable row ids as keys so virtualized rows keep identity. Keep drafts separate from server data, keyed by id, and merge in render. Use keepPreviousData/placeholderData in TanStack Query so the list does not empty during refetch.` },
          ],
        },
        {
          q: `How do you set guidelines for when to use Fragments, wrapper divs, or layout components?`,
          short: `Prefer Fragments when a wrapper adds no meaning; use semantic elements when structure matters; use layout components (Stack, Grid) for spacing instead of ad-hoc divs.`,
          long: `Extra divs break CSS grid/flex children, table and list semantics, and add DOM weight.\nSemantic HTML (section, nav, ul) helps accessibility and should not be replaced by Fragments.\nLayout primitives from the design system own spacing; components should not add outer margins.\nDocument this in the UI guidelines with examples, and check in review and a11y audits.\nAutomate where possible: axe checks for list and table structure in CI.`,
          exercises: [
            { task: `A component returns a div, which breaks a parent CSS grid. Fix it without changing the parent.`, description: `Checks Fragment usage. Reproduce with a 3-column grid.`, answer: `Return a Fragment instead of the div so the children become direct grid items. Alternatively, use display: contents on the wrapper, but it has had accessibility bugs with some roles. Fragments are the cleanest fix.` },
            { task: `Write a rule: "components should not set their own outer margin." Why?`, description: `Checks layout ownership. Explain in 3–4 sentences.`, answer: `Outer margin makes a component hard to reuse because spacing depends on context. The parent layout (Stack gap, Grid) should own spacing between children. This keeps components predictable and removes margin overrides.` },
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
            { task: `Why does onClick={setCount(count + 1)} crash the app?`, description: `Checks handler vs call. Run it in a sandbox and read the error.`, answer: `setCount runs during render, which schedules another render, which calls it again. React stops with "Too many re-renders". Wrap it: onClick={() => setCount(c => c + 1)}.` },
            { task: `Pass an item id to a click handler inside a list.`, description: `Checks passing arguments. Build a list with delete buttons.`, answer: `Use an arrow function: onClick={() => onDelete(item.id)}. Alternatively read a data attribute from e.currentTarget.dataset. The arrow is simplest and fine for performance in most cases.` },
          ],
        },
        {
          q: `What is event bubbling in React? What does onClickCapture do?`,
          short: `Events start at the clicked element and bubble up through its parents, so parent onClick handlers also run. onClickCapture runs on the way down, before the child handlers.`,
          long: `React events follow the DOM order: capture phase from the root down, then bubble phase from the target up.\nonClick handles the bubble phase; onClickCapture handles the capture phase.\nA click on a button inside a card runs the button onClick first, then the card onClick.\ne.stopPropagation() stops the event from reaching more handlers.\nCapture handlers are useful for things like logging all clicks or blocking clicks in a region.\nReact events bubble through the React tree, which matters for portals.\nonScroll does not bubble in React 17 and later.`,
          exercises: [
            { task: `Clicking Delete inside a card also opens the card. Fix it.`, description: `Checks bubbling and stopPropagation. Build the card in a sandbox.`, code: `<div onClick={openCard}>\n  <h3>{title}</h3>\n  <button onClick={() => remove(id)}>Delete</button>\n</div>`, answer: `The button click bubbles to the div. Call e.stopPropagation() in the button handler. A cleaner option is to not nest actions: make the card title the link, and keep the button outside the clickable area.`, solution: `<button onClick={e => { e.stopPropagation(); remove(id); }}>\n  Delete\n</button>` },
            { task: `In which order do these handlers log: parent onClickCapture, child onClick, parent onClick?`, description: `Checks event phases. Click the child and read the console.`, answer: `Parent onClickCapture first (capture goes down), then child onClick (target), then parent onClick (bubble goes up).` },
          ],
        },
        {
          q: `What is the event object in React? How do you read an input value from it?`,
          short: `React passes a SyntheticEvent that wraps the native event with a consistent API; for inputs you read e.target.value.`,
          long: `Handlers receive a SyntheticEvent with target, currentTarget, preventDefault and stopPropagation.\ne.nativeEvent gives the browser event if you need it.\nSince React 17 there is no event pooling, so you can use e in async code.\nFor checkboxes read e.target.checked; for files read e.target.files.\nIn TypeScript use types like React.ChangeEvent<HTMLInputElement>.`,
          exercises: [
            { task: `Log the value of a text input on each change.`, description: `Checks reading values. Build an input with onChange.`, answer: `Add onChange={e => console.log(e.target.value)}. React's onChange fires on every keystroke, like the native input event. For a controlled input, also store the value in state.` },
            { task: `What is the difference between e.target and e.currentTarget?`, description: `Checks event basics. Click a span inside a button with a handler on the button.`, answer: `e.target is the element the user actually clicked (the span). e.currentTarget is the element the handler is attached to (the button). Use currentTarget when you read data attributes of the element that owns the handler.` },
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
            { task: `Also close the dropdown when the user presses Escape.`, description: `Checks keyboard handling. Add a keydown listener and test.`, answer: `In the same effect, add a keydown listener that calls setOpen(false) when e.key === 'Escape'. Remove it in cleanup. Return focus to the trigger button for accessibility.` },
            { task: `Why use pointerdown instead of click for outside clicks?`, description: `Checks event timing. Test drag-select from inside to outside.`, answer: `click fires after mouseup and may land outside when a user drags from inside, closing the menu wrongly. pointerdown fires at the start of the interaction and works for mouse, touch and pen. It also runs before focus changes.` },
          ],
        },
        {
          q: `How is onChange in React different from the native change event?`,
          short: `React onChange fires on every key press or edit, like the native input event. The native change event fires only when the field loses focus or a choice is committed.`,
          long: `In the DOM, input fires on every edit, and change fires on commit (blur for text, select for dropdowns).\nReact maps onChange to the input event for text fields, so controlled inputs update on each key.\nFor checkboxes and radios, React onChange fires when checked changes; read e.target.checked, not value.\nFor select, onChange fires when the option changes.\nIf you want commit-only behavior, use onBlur, or a native listener for change.\nReact also has onInput, which behaves almost the same as onChange for text fields.`,
          exercises: [
            { task: `Save a text field only when the user leaves it, not on each key.`, description: `Checks onBlur versus onChange. Build it with a controlled input.`, answer: `Keep onChange to update local state, and call save in onBlur. Compare with the last saved value to skip saves when nothing changed.`, solution: `function Title({ initial, onSave }) {\n  const [v, setV] = useState(initial);\n  return (\n    <input\n      value={v}\n      onChange={e => setV(e.target.value)}\n      onBlur={() => { if (v !== initial) onSave(v); }}\n    />\n  );\n}` },
            { task: `This checkbox handler always gets "on". Why?`, description: `Checks checkbox events. Log the value in a sandbox.`, code: `<input type="checkbox" onChange={e => setAgree(e.target.value)} />`, answer: `value on a checkbox is its static value attribute, which defaults to "on". Read e.target.checked to get true or false.` },
          ],
        },
        {
          q: `What is the difference between stopPropagation and preventDefault?`,
          short: `stopPropagation stops the event from bubbling to parent handlers; preventDefault cancels the browser's default action, like form submit or link navigation.`,
          long: `preventDefault: the event still bubbles, but the browser does not follow the link or submit the form.\nstopPropagation: parents do not get the event, but default actions still happen.\nIn React 17+ events are attached at the root container, not document.\nSo stopPropagation in React also stops native listeners on the root and above, but not on elements below.\nUse onClickCapture for the capture phase.`,
          exercises: [
            { task: `A card is clickable, and it has a delete button inside. Clicking delete also opens the card. Fix it.`, description: `Checks propagation. Build both handlers and click delete.`, answer: `Call e.stopPropagation() in the delete button handler so the card's onClick does not run. A better design is to avoid nested interactive elements, for example by making the card title the link. Nested buttons hurt accessibility.` },
            { task: `Stop a link from navigating but still track the click.`, description: `Checks preventDefault. Add an onClick to an anchor.`, answer: `In onClick, call e.preventDefault() and then run the tracking and your own navigation. The event still bubbles to parent listeners. Prefer router Link components so modifier-clicks (open in new tab) keep working.` },
          ],
        },
      ],
      senior: [
        {
          q: `How does React decide the priority of updates from different events? What are discrete and continuous events?`,
          short: `Updates from discrete events like click and keydown get the highest priority and render synchronously. Continuous events like mousemove and scroll get a lower priority. Updates in startTransition are lower still and can be interrupted.`,
          long: `React assigns a lane (priority) to each update based on the event that caused it.\nDiscrete events (click, keydown, input) mean the user expects an instant response; React renders them right away.\nContinuous events (mousemove, pointermove, scroll, wheel) are batched with a slightly lower priority.\nUpdates outside events (timers, network) get the default priority.\nstartTransition and useDeferredValue mark updates as non-urgent; urgent updates can interrupt them.\nPractical use: keep the input value urgent, and wrap the heavy result update in a transition.\nThis is about scheduling, not order: updates still apply in the order you call them.`,
          exercises: [
            { task: `Dragging a slider is janky because each move re-renders a big chart. Fix it with React features.`, description: `Checks transitions for continuous events. Build it with a slow chart component.`, answer: `Keep the slider value in urgent state so the thumb moves smoothly, and pass a deferred copy to the chart with useDeferredValue. Wrap the chart in memo so it only renders when the deferred value changes.`, solution: `const [v, setV] = useState(50);\nconst deferred = useDeferredValue(v);\nreturn (\n  <>\n    <input type="range" value={v} onChange={e => setV(+e.target.value)} />\n    <SlowChart value={deferred} />\n  </>\n);` },
            { task: `Can a transition update run before an urgent update that was called later?`, description: `Checks priority versus order. Explain.`, answer: `React renders the urgent update first and may throw away the in-progress transition render. When the transition finishes, it includes both updates in the order they were called. Final state is always consistent.` },
          ],
        },
        {
          q: `This search fires one request per key press and sometimes shows old results. Fix it.`,
          code: `function Search() {\n  const [q, setQ] = useState('');\n  const [results, setResults] = useState([]);\n  async function onChange(e) {\n    setQ(e.target.value);\n    const res = await fetch('/api/search?q=' + e.target.value);\n    setResults(await res.json());\n  }\n  return <><input value={q} onChange={onChange} /><List items={results} /></>;\n}`,
          short: `Responses can arrive out of order, so a slow old response overwrites newer results; debounce input and abort or ignore stale requests.`,
          long: `Each key press starts a request; there is no cancel.\nIf "re" returns after "react", the list shows results for "re".\nThe query is not URL-encoded.\nFix: debounce the query, run the fetch in an effect keyed on the debounced value, and abort on cleanup.\nBetter in production: TanStack Query with queryKey ['search', q], which handles races and caching.\nAlso handle errors and loading states.`,
          fix: `function Search() {\n  const [q, setQ] = useState('');\n  const debounced = useDebounce(q, 300);\n  const [results, setResults] = useState([]);\n  useEffect(() => {\n    if (!debounced) return setResults([]);\n    const ctrl = new AbortController();\n    fetch('/api/search?q=' + encodeURIComponent(debounced), { signal: ctrl.signal })\n      .then(r => r.json()).then(setResults)\n      .catch(err => { if (err.name !== 'AbortError') console.error(err); });\n    return () => ctrl.abort();\n  }, [debounced]);\n  return <><input value={q} onChange={e => setQ(e.target.value)} /><List items={results} /></>;\n}`,
          exercises: [
            { task: `Write the useDebounce hook.`, description: `Checks hooks with timers. Test with fake timers in Vitest.`, answer: `Keep a state copy of the value and update it in a setTimeout inside an effect. Clear the timeout in cleanup so only the last value after the delay is applied. Dependencies are value and delay.`, solution: `function useDebounce(value, delay) {\n  const [v, setV] = useState(value);\n  useEffect(() => {\n    const t = setTimeout(() => setV(value), delay);\n    return () => clearTimeout(t);\n  }, [value, delay]);\n  return v;\n}` },
            { task: `Rewrite with TanStack Query.`, description: `Checks server-state tools. Use useQuery with enabled.`, answer: `useQuery({ queryKey: ['search', debounced], queryFn: ({ signal }) => api.search(debounced, signal), enabled: !!debounced, placeholderData: keepPreviousData }). The query key handles races, signal enables abort, and results are cached per query.` },
          ],
        },
        {
          q: `Why does a menu close when focus moves to one of its own items? How do you handle focus and blur events correctly?`,
          short: `onBlur on the container fires when focus leaves any child, even if it moves to another child. Check e.relatedTarget: if the new focus is still inside the container, do not close.`,
          long: `React onFocus and onBlur bubble, like native focusin and focusout.\nWhen focus moves from one item to another inside a menu, the container gets blur then focus.\ne.relatedTarget is the element getting focus next.\nUse e.currentTarget.contains(e.relatedTarget) to know if focus stayed inside.\nrelatedTarget can be null when focus goes to the body or another window.\nMouse clicks on non-focusable elements move focus to body; make items buttons so they can take focus.\nThis is the base for accessible menus, comboboxes and popovers.`,
          exercises: [
            { task: `Fix this popover. It closes when the user tabs from the first button to the second.`, description: `Checks relatedTarget. Build it and press Tab.`, code: `<div onBlur={() => setOpen(false)}>\n  <button>Edit</button>\n  <button>Delete</button>\n</div>`, answer: `Blur fires on the container when focus moves between children. Close only when the new focus target is outside the container.`, solution: `<div onBlur={e => {\n  if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);\n}}>\n  <button>Edit</button>\n  <button>Delete</button>\n</div>` },
            { task: `Clicking an item in a custom dropdown closes it before the click registers. Why?`, description: `Checks event order. Explain mousedown, blur and click.`, answer: `The order is mousedown, then blur on the input, then click. If blur closes the list, the item is removed before click fires. Fix it by using onMouseDown with preventDefault on items, or by checking relatedTarget so focus moving to the list does not close it.` },
          ],
        },
      ],
      techlead: [
        {
          q: `Design a keyboard shortcut system for the whole app. How do you avoid conflicts between teams?`,
          short: `Use one central shortcut registry with scopes (global, page, dialog), a single document listener, rules to skip typing fields, and a help dialog that lists all active shortcuts. Teams register shortcuts through a hook, not their own listeners.`,
          long: `Many separate keydown listeners fight each other and break when a dialog is open.\nOne provider keeps a registry: key combo, scope, handler, description.\nScopes stack: an open dialog takes priority, then the page, then global shortcuts.\nIgnore shortcuts while the user types in inputs, textareas and contenteditable, except explicit ones like Escape.\nHandle platform keys: Cmd on Mac, Ctrl elsewhere; respect keyboard layouts by using e.key.\nAvoid browser and screen reader shortcuts; follow WCAG 2.1.4 for single-key shortcuts (allow turning them off or remapping).\nA useShortcut hook registers on mount and removes on unmount; CI checks for duplicate combos in the same scope.\nShow a "?" help dialog generated from the registry.`,
          exercises: [
            { task: `Two teams both bind the "g" key on the same page. How does your system catch this?`, description: `Checks conflict detection. Describe dev and CI behavior.`, answer: `In development, registering a combo that already exists in the same scope logs an error with both owners. Shortcuts are declared in a typed config file per team, so a CI script can find duplicates before merge.` },
            { task: `Write the core of a useShortcut hook.`, description: `Checks implementation. Sketch the hook.`, answer: `The hook takes the combo, handler and scope. It stores the handler in a ref so it stays fresh, registers an entry in context on mount, and unregisters on unmount. The provider keeps one document keydown listener that finds the top scope with a matching combo and calls it.`, solution: `function useShortcut(combo, handler, scope = "page") {\n  const registry = useContext(ShortcutContext);\n  const ref = useRef(handler);\n  ref.current = handler;\n  useEffect(\n    () => registry.add({ combo, scope, run: e => ref.current(e) }),\n    [registry, combo, scope]\n  );\n}` },
          ],
        },
        {
          q: `Review this global error handling setup. What risks do you see?`,
          code: `window.onerror = () => { alert('Something went wrong'); location.reload(); };\nwindow.addEventListener('unhandledrejection', e => e.preventDefault());`,
          short: `It hides errors from users and monitoring, can cause reload loops, and swallows promise rejections silently.`,
          long: `alert blocks the UI and gives no useful info; reload can loop if the error happens on load.\nThird-party script errors (cross-origin "Script error.") would also trigger reloads.\npreventDefault on unhandledrejection hides errors from the console and maybe from monitoring.\nNothing is reported to a logging service with context.\nReplace with: report to monitoring, show a non-blocking toast, use boundaries for render errors, and never auto-reload without a guard.`,
          fix: `window.addEventListener('error', e => report(e.error ?? e.message, { source: 'window' }));\nwindow.addEventListener('unhandledrejection', e => report(e.reason, { source: 'promise' }));\n// UI: React error boundaries + toast for recoverable async errors`,
          exercises: [
            { task: `Add a safe "reload on chunk load error" for lazy routes.`, description: `Checks deploy-related errors. Simulate a missing chunk after a deploy.`, answer: `Catch errors in the lazy import, check for ChunkLoadError or "Failed to fetch dynamically imported module", and reload once. Store a flag in sessionStorage so you do not loop. Vite also emits a vite:preloadError event you can handle.` },
            { task: `How do you prevent sensitive data from leaking into error reports?`, description: `Checks privacy. List techniques.`, answer: `Use beforeSend hooks to scrub tokens, emails and form values; do not log request bodies by default. Use allowlists for context fields. Set data retention and access rules in the monitoring tool.` },
          ],
        },
        {
          q: `How do you make event handling consistent for accessibility across the team?`,
          short: `Use native interactive elements, shared components for complex widgets, lint rules for a11y, and keyboard tests in CI.`,
          long: `Rule 1: clickable things are buttons or links, not divs with onClick.\njsx-a11y lint rules catch click-events-have-key-events and no-static-element-interactions.\nComplex widgets (menu, combobox, dialog) come from a tested library (React Aria, Radix) or the design system.\nTest with keyboard only and a screen reader for key flows.\nAdd axe checks in component tests and Playwright E2E.\nTrack a11y bugs like other bugs, with severity.`,
          exercises: [
            { task: `Fix: <div onClick={open}>Settings</div>.`, description: `Checks semantic events. Test with Tab and Enter.`, answer: `Replace it with <button type="button" onClick={open}>Settings</button>. A button is focusable, works with Enter and Space, and has the right role. A div needs role, tabIndex and key handlers, and is still worse.` },
            { task: `Choose a strategy for a custom combobox.`, description: `Checks build vs buy for a11y. Compare options.`, answer: `Use a headless library like React Aria or Downshift that implements the ARIA pattern and keyboard logic, and style it with the design system. Writing it from scratch takes a long time to get right for screen readers. Document the choice in the component library.` },
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
            { task: `Build a toggle button that shows "On" or "Off".`, description: `Checks basic state. Build in a sandbox.`, answer: `Keep a boolean with useState(false) and flip it with setOn(o => !o) on click. Render the label from the state. The functional update avoids stale values.`, solution: `function Toggle() {\n  const [on, setOn] = useState(false);\n  return <button onClick={() => setOn(o => !o)}>{on ? 'On' : 'Off'}</button>;\n}` },
            { task: `Why does console.log(count) after setCount(count + 1) print the old value?`, description: `Checks state snapshots. Log in the handler.`, answer: `State updates are not applied immediately; the variable in this render is a constant snapshot. The new value appears in the next render. Use the computed value directly if you need it now.` },
          ],
        },
        {
          q: `This effect runs in an endless loop. Why? Fix it.`,
          code: `function Profile({ id }) {\n  const [user, setUser] = useState(null);\n  useEffect(() => {\n    fetch('/api/users/' + id).then(r => r.json()).then(setUser);\n  });\n  return <p>{user?.name}</p>;\n}`,
          short: `Without a dependency array the effect runs after every render, and setUser causes a new render, so it loops forever.`,
          long: `No array = run after every render.\nEmpty array [] = run once after mount.\n[id] = run when id changes.\nHere every fetch sets state, which re-renders and fetches again.\nAdd [id] and ignore results after the id changes.`,
          fix: `function Profile({ id }) {\n  const [user, setUser] = useState(null);\n  useEffect(() => {\n    let ignore = false;\n    fetch('/api/users/' + id).then(r => r.json()).then(u => { if (!ignore) setUser(u); });\n    return () => { ignore = true; };\n  }, [id]);\n  return <p>{user?.name}</p>;\n}`,
          exercises: [
            { task: `Explain the three dependency array forms.`, description: `Checks basics. Add logs and change props.`, answer: `No array runs after every render. [] runs once after mount (twice in dev StrictMode, with cleanup in between). [a, b] runs after mount and whenever a or b changes by Object.is comparison.` },
            { task: `Show a timer with setInterval and proper cleanup.`, description: `Checks cleanup. Mount and unmount the component.`, answer: `Start setInterval in an effect with [] and return () => clearInterval(id). Use setSeconds(s => s + 1) so the callback does not need the current value. Without cleanup the timer keeps running after unmount.` },
          ],
        },
        {
          q: `What is useRef used for?`,
          short: `useRef holds a mutable value that survives renders without causing re-renders; it is often used to access DOM nodes.`,
          long: `const ref = useRef(initial) returns { current: initial }, the same object every render.\nAttach it to JSX with ref={ref} to get the DOM node after mount.\nChanging ref.current does not re-render.\nUse it for timers, previous values, and DOM focus or measure.\nIn React 19, ref can be passed as a normal prop to function components (no forwardRef needed).`,
          exercises: [
            { task: `Focus an input when a button is clicked.`, description: `Checks DOM refs. Build it in a sandbox.`, answer: `Create inputRef = useRef(null), attach ref={inputRef}, and call inputRef.current.focus() in the click handler. The node is available after mount. Use optional chaining if it may be missing.` },
            { task: `Count renders of a component without causing more renders.`, description: `Checks ref vs state. Compare with state.`, answer: `Increment a ref inside an effect: useEffect(() => { renders.current++; }). Using state would trigger another render each time and loop. Do not read the ref during render to show it.` },
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
            { task: `The interval needs a "step" prop. Keep it current without restarting the timer.`, description: `Checks latest-value refs. Change step while running.`, answer: `Store step in a ref updated in an effect, and read stepRef.current inside the interval. In React 19.2+ you can use useEffectEvent for this. The interval effect stays with [] deps.` },
            { task: `What does the exhaustive-deps rule protect you from?`, description: `Checks lint understanding. Turn the rule on and read the warning.`, answer: `It finds values used in an effect that are missing from deps, which cause stale closures. Fixing it often means moving functions inside the effect or using functional updates. Disabling it usually hides a bug.` },
          ],
        },
        {
          q: `What is a custom hook? When should you write one?`,
          short: `A custom hook is a function starting with "use" that calls other hooks to reuse stateful logic between components.`,
          long: `Custom hooks share logic, not state: each call has its own state.\nWrite one when two components repeat the same hook pattern (fetch, subscription, media query).\nThe name must start with use so lint can check the Rules of Hooks.\nReturn what callers need: a value, a tuple, or an object.\nKeep them focused; do not hide unrelated effects inside.`,
          exercises: [
            { task: `Write useOnlineStatus.`, description: `Checks custom hooks with external stores. Toggle network in DevTools.`, answer: `Use useSyncExternalStore with a subscribe function that listens to online/offline events and a getSnapshot returning navigator.onLine. This is safe for concurrent rendering. Return the boolean.`, solution: `function subscribe(cb) {\n  window.addEventListener('online', cb);\n  window.addEventListener('offline', cb);\n  return () => { window.removeEventListener('online', cb); window.removeEventListener('offline', cb); };\n}\nexport function useOnlineStatus() {\n  return useSyncExternalStore(subscribe, () => navigator.onLine, () => true);\n}` },
            { task: `Two components use useCounter(). Do they share the count?`, description: `Checks hook state isolation. Render two and click one.`, answer: `No. Each component call creates its own state. To share state, lift it up, use context, or use an external store.` },
          ],
        },
        {
          q: `This derived value is stored in state and gets out of sync. Fix it.`,
          code: `function Cart({ items }) {\n  const [total, setTotal] = useState(0);\n  useEffect(() => {\n    setTotal(items.reduce((s, i) => s + i.price * i.qty, 0));\n  }, [items]);\n  return <p>Total: {total}</p>;\n}`,
          short: `Values computed from props or state should be calculated during render; storing them in state adds an extra render and can show stale values.`,
          long: `The first render shows 0, then the effect sets the real total and renders again.\nIt is extra code and an extra render.\nCompute it directly: const total = items.reduce(...).\nUse useMemo only if the calculation is expensive.\nThis is one of the main cases in "You Might Not Need an Effect".`,
          fix: `function Cart({ items }) {\n  const total = items.reduce((s, i) => s + i.price * i.qty, 0);\n  return <p>Total: {total}</p>;\n}`,
          exercises: [
            { task: `Filter a list by a search term without extra state.`, description: `Checks derived data. Build input + list.`, answer: `Keep only the search term in state and compute filtered = items.filter(...) during render. Do not keep a filteredItems state updated by an effect. Add useMemo if the list is very large.` },
            { task: `When is useMemo worth it here?`, description: `Checks performance judgement. Measure with console.time.`, answer: `When the calculation takes noticeable time (about 1ms or more) or its result is passed to memoized children that need a stable reference. For small arrays it costs more than it saves. With the React Compiler it is often automatic.` },
          ],
        },
      ],
      senior: [
        {
          q: `If you call setState with the same value, does the component re-render? Explain how React bails out.`,
          short: `React compares the new and old value with Object.is. If they are equal, React skips the re-render of children and effects, although it may still call the component once before bailing out.`,
          long: `setCount(5) when count is already 5 is ignored after an Object.is check.\nReact may still run the component function once to confirm, but it does not re-render children or run effects.\nFor objects and arrays, equality is by reference. Mutating and setting the same object is ignored, so the screen does not change.\nCreating a new object with the same content always causes a render.\nThis is why you must update state immutably: new reference for real changes, same reference for no change.\nYou can use this on purpose: return the previous state from an updater to skip work.`,
          exercises: [
            { task: `This toggle on a todo does not update the screen. Why? Fix it.`, description: `Checks reference equality in state. Run it in a sandbox.`, code: `function toggle(id) {\n  const t = todos.find(t => t.id === id);\n  t.done = !t.done;\n  setTodos(todos);\n}`, answer: `The todos array is the same reference, so Object.is says nothing changed and React bails out. The object was also mutated. Create a new array and a new object for the changed item.`, solution: `function toggle(id) {\n  setTodos(todos => todos.map(t =>\n    t.id === id ? { ...t, done: !t.done } : t\n  ));\n}` },
            { task: `Skip a re-render when a filter function returns the same items.`, description: `Checks returning previous state. Write an updater.`, answer: `In the updater, compare the result with the previous state and return prev if nothing changed. For example, setItems(prev => sameIds(prev, next) ? prev : next). Returning the same reference lets React bail out.` },
          ],
        },
        {
          q: `This effect re-subscribes on every render. Find why, and fix it without disabling lint.`,
          code: `function Room({ roomId, theme }) {\n  const options = { roomId, serverUrl: URL };\n  useEffect(() => {\n    const conn = createConnection(options);\n    conn.on('connected', () => showToast('Connected', theme));\n    conn.connect();\n    return () => conn.disconnect();\n  }, [options, theme]);\n}`,
          short: `options is a new object each render, and theme changes should not reconnect; create options inside the effect and move the non-reactive logic into an effect event.`,
          long: `Object dependencies compare by reference, so a new object each render re-runs the effect.\nMove the object creation inside the effect and depend on primitives (roomId).\ntheme is only read when the event fires, so it should not trigger reconnect.\nuseEffectEvent (stable in React 19.2) reads the latest props without being a dependency.\nBefore 19.2, use a ref that stores the latest callback.`,
          fix: `function Room({ roomId, theme }) {\n  const onConnected = useEffectEvent(() => showToast('Connected', theme));\n  useEffect(() => {\n    const conn = createConnection({ roomId, serverUrl: URL });\n    conn.on('connected', () => onConnected());\n    conn.connect();\n    return () => conn.disconnect();\n  }, [roomId]);\n}`,
          exercises: [
            { task: `Implement a useLatest ref pattern for React versions without useEffectEvent.`, description: `Checks latest-ref pattern. Use it in the Room example.`, answer: `Store the callback in a ref and update ref.current in a layout effect each render. Inside the subscription, call ref.current(). The effect does not depend on the callback, and it always calls the newest one.` },
            { task: `Can you call an effect event from a click handler?`, description: `Checks API rules. Read the docs and try it.`, answer: `No. Effect events are only meant to be called from inside effects. Calling them during render or from event handlers is not allowed, and the lint rule flags it. Regular handlers already see the latest props.` },
          ],
        },
        {
          q: `What is lazy initial state in useState? Why can StrictMode call your initializer and updater twice?`,
          short: `Passing a function to useState, like useState(() => load()), runs the expensive code only on the first render. In development, StrictMode calls these functions twice to find side effects, so they must be pure.`,
          long: `useState(load()) calls load on every render, even though React ignores the result after the first one.\nuseState(load) or useState(() => load(props.id)) calls it only once.\nThe same applies to useReducer with its third init argument.\nStrictMode in development double-invokes component bodies, initializers, and updater functions.\nIf they are pure, the result is the same and you see no difference.\nIf they push to an array, call an API, or mutate outside data, you see doubled results. That is the bug StrictMode shows.\nProduction calls them once.`,
          exercises: [
            { task: `Fix this component. It parses a large JSON string on every render.`, description: `Checks lazy initialization. Measure with console.time.`, code: `function Editor({ raw }) {\n  const [doc, setDoc] = useState(JSON.parse(raw));\n  return <Canvas doc={doc} onChange={setDoc} />;\n}`, answer: `Pass a function so the parse runs only on mount: useState(() => JSON.parse(raw)). Note that later changes to raw are ignored; reset with a key if raw can change.`, solution: `function Editor({ raw }) {\n  const [doc, setDoc] = useState(() => JSON.parse(raw));\n  return <Canvas doc={doc} onChange={setDoc} />;\n}` },
            { task: `In development, each click adds two items. In production, one. Why?`, description: `Checks impure updaters. Look at the updater code.`, code: `setItems(prev => { prev.push(newItem); return [...prev]; });`, answer: `The updater mutates prev. StrictMode calls it twice in development, so the item is pushed twice to the same array. Make the updater pure: setItems(prev => [...prev, newItem]).` },
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
            { task: `Write the acceptance criteria for a new shared hook.`, description: `Checks standards. Produce a checklist.`, answer: `Has two or more consumers, types and docs, tests covering cleanup and StrictMode, no lint disables, SSR-safe, and an owner. Breaking changes need a migration note. Reviewed by the library owners.` },
            { task: `A popular shared hook has a design flaw. How do you change it?`, description: `Checks change management. Describe the steps.`, answer: `Release a new hook or option side by side, mark the old one deprecated with a console warning in dev, and provide a codemod. Track usage until it reaches zero, then remove it in a major version. Communicate the timeline.` },
          ],
        },
        {
          q: `Review this shared useLocalStorage hook. Users see stale values across tabs and crashes in private mode. What would you change?`,
          code: `export function useLocalStorage(key, initial) {\n  const [value, setValue] = useState(\n    JSON.parse(localStorage.getItem(key)) ?? initial\n  );\n  useEffect(() => {\n    localStorage.setItem(key, JSON.stringify(value));\n  }, [value]);\n  return [value, setValue];\n}`,
          short: `It reads storage on every render, can throw on bad JSON or blocked storage, breaks on the server, ignores key changes, and never hears updates from other tabs or other hook instances. Build it on useSyncExternalStore with safe parsing.`,
          long: `localStorage.getItem runs on every render because the initial value is not lazy.\nJSON.parse throws on corrupted data; localStorage access can throw in some private modes or when storage is blocked.\nOn the server there is no localStorage, so SSR crashes.\nThe effect lacks key in its deps, so changing key writes the old value to the new key.\nTwo components using the same key do not sync, and other tabs are ignored (no storage event).\nBetter: a small store per key, subscribe to the storage event, read with useSyncExternalStore, and give a server snapshot.\nWrap reads and writes in try/catch and validate the parsed value.`,
          fix: `function read(key, initial) {\n  try {\n    const raw = localStorage.getItem(key);\n    return raw == null ? initial : JSON.parse(raw);\n  } catch {\n    return initial;\n  }\n}\nexport function useLocalStorage(key, initial) {\n  const subscribe = useCallback(cb => {\n    const onStorage = e => { if (e.key === key) cb(); };\n    window.addEventListener("storage", onStorage);\n    window.addEventListener("local-storage", cb);\n    return () => {\n      window.removeEventListener("storage", onStorage);\n      window.removeEventListener("local-storage", cb);\n    };\n  }, [key]);\n  const raw = useSyncExternalStore(\n    subscribe,\n    () => localStorage.getItem(key),\n    () => null\n  );\n  const value = raw == null ? initial : read(key, initial);\n  const set = useCallback(next => {\n    try { localStorage.setItem(key, JSON.stringify(next)); } catch {}\n    window.dispatchEvent(new Event("local-storage"));\n  }, [key]);\n  return [value, set];\n}`,
          exercises: [
            { task: `Why does the fixed version return the raw string from getSnapshot, not the parsed object?`, description: `Checks the useSyncExternalStore snapshot rule. Explain what happens with a parsed object.`, answer: `getSnapshot must return the same value when nothing changed. JSON.parse creates a new object each call, so React would think the store changed on every check and loop or warn. A string compares equal with Object.is.` },
            { task: `Write two tests that this shared hook must pass before release.`, description: `Checks quality gates for shared hooks. Describe the tests.`, answer: `First, two components with the same key stay in sync after one calls set. Second, when localStorage.getItem throws or holds invalid JSON, the hook returns the initial value and does not crash. A third good test fires a storage event to simulate another tab.` },
          ],
        },
        {
          q: `How do you set lint rules and review checks for hooks across a large team?`,
          short: `Turn on eslint-plugin-react-hooks with errors, not warnings, ban disabling exhaustive-deps without a comment, add the React Compiler lint rules, and back it with a short review checklist and examples.`,
          long: `Start with react-hooks/rules-of-hooks and react-hooks/exhaustive-deps as errors in CI.\nThe newer react-hooks plugin includes compiler-based rules that flag mutations during render and impure code.\nRequire a reason comment for any eslint-disable on hooks, and track the count.\nAdd custom rules for team conventions, like no fetch inside useEffect in feature code.\nReview checklist: is this effect really syncing an external system? Are deps stable? Is cleanup present?\nRoll out gradually: fix one package at a time, use a baseline file so new code is strict from day one.\nMeasure: number of disables, hook-related bugs in incidents.`,
          exercises: [
            { task: `A legacy package has 300 exhaustive-deps warnings. How do you turn the rule into an error without blocking everyone?`, description: `Checks rollout strategy. Describe the steps.`, answer: `Record the existing warnings in a baseline or add per-line disables with a TODO tag by script. Make the rule an error for new code. Then fix the baseline by area, owner by owner, and track the count down in a dashboard.` },
            { task: `Write three questions for the pull request template about hooks.`, description: `Checks practical review guidance. List the questions.`, answer: `Does each new effect sync with an external system, or could it be an event handler or derived value? Are all dependencies listed and stable, without disabling lint? Does every subscription, timer, or request have cleanup or abort?` },
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
            { task: `Make a read-only input that shows a value without a warning.`, description: `Checks readOnly. Render it and check the console.`, answer: `Add the readOnly attribute: <input value={x} readOnly />. React then knows the missing onChange is intended. The user can still select and copy the text.` },
            { task: `Build a controlled select with three options.`, description: `Checks select in React. Build and log the value.`, answer: `Put value on the select (not selected on option) and handle onChange with e.target.value. Store the value in state with a valid default. React keeps the selected option in sync.`, solution: `const [color, setColor] = useState('red');\n<select value={color} onChange={e => setColor(e.target.value)}>\n  <option value="red">Red</option>\n  <option value="green">Green</option>\n  <option value="blue">Blue</option>\n</select>` },
          ],
        },
        {
          q: `How do you handle several inputs with one change handler?`,
          short: `Keep form values in one state object and use the input's name to update the matching field.`,
          long: `Give each input a name that matches a key in state.\nIn the handler, read name and value from e.target.\nUpdate with a copy: setForm(f => ({ ...f, [name]: value })).\nFor checkboxes use checked instead of value.\nFor large forms, a library like react-hook-form is simpler.`,
          exercises: [
            { task: `Build a form with firstName, lastName and a "subscribe" checkbox.`, description: `Checks generic handler. Submit and log the object.`, answer: `Use one state object and a handler that picks checked for checkboxes and value otherwise. Spread the old state and set [name]. On submit call e.preventDefault() and use the state.`, solution: `function onChange(e) {\n  const { name, type, value, checked } = e.target;\n  setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));\n}` },
            { task: `Why does setForm({ [name]: value }) lose other fields?`, description: `Checks state replacement. Type in two inputs and log.`, answer: `useState replaces the whole value; it does not merge like class setState. You must spread the previous object first. Use the functional form to avoid stale data.` },
          ],
        },
        {
          q: `How do you read form values without state, using FormData?`,
          short: `Leave inputs uncontrolled and read all values on submit with new FormData(e.currentTarget), or use React 19 form actions which receive FormData.`,
          long: `Uncontrolled inputs keep their own value in the DOM.\nGive each input a name; FormData collects them on submit.\nObject.fromEntries(formData) turns it into a plain object.\nIn React 19, <form action={fn}> calls fn(formData) and resets the form after success.\nThis is simple and fast for forms that do not need live validation.`,
          exercises: [
            { task: `Build a login form that logs email and password on submit using FormData.`, description: `Checks uncontrolled forms. Build and submit.`, answer: `Add name attributes, handle onSubmit with e.preventDefault(), and create new FormData(e.currentTarget). Read values with get('email'). No state is needed. (Do not log real passwords in production.)` },
            { task: `Rewrite it with a React 19 form action.`, description: `Checks form actions. Use <form action>.`, answer: `Pass a function to action: <form action={async formData => { await login(formData.get('email')); }}>. React prevents the default submit, runs the function in a transition, and resets uncontrolled fields when it finishes.` },
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
            { task: `Do the same with react-hook-form.`, description: `Checks RHF modes. Use useForm with mode 'onTouched'.`, answer: `Call useForm({ mode: 'onTouched' }), register the field with a pattern rule, and read formState.errors.email. Errors appear after blur and then update on change. RHF handles touched state for you.` },
            { task: `Make the error accessible to screen readers.`, description: `Checks a11y. Test with VoiceOver or NVDA.`, answer: `Set aria-invalid on the input and link the message with aria-describedby. Give the message an id. Optionally move focus to the first invalid field on submit.` },
          ],
        },
        {
          q: `Why is react-hook-form usually faster than a controlled form with useState?`,
          short: `react-hook-form uses uncontrolled inputs with refs, so typing does not re-render the whole form; it only re-renders what subscribes to changed state.`,
          long: `A useState form re-renders the full form on every key press.\nRHF registers inputs and reads values from the DOM on submit or validation.\nformState is a proxy: components re-render only for the fields they read.\nuseWatch and useController let you subscribe to specific fields.\nFor controlled UI libraries (MUI, date pickers) use Controller.`,
          exercises: [
            { task: `Show a live character count for one field without re-rendering the form.`, description: `Checks useWatch. Add console.log in the form and in the counter.`, answer: `Put a small CharCount component that calls useWatch({ control, name: 'bio' }). Only CharCount re-renders on typing. Using watch() at the top of the form would re-render the whole form.` },
            { task: `Connect an MUI TextField to react-hook-form.`, description: `Checks Controller. Build and submit.`, answer: `Use <Controller name="email" control={control} render={({ field, fieldState }) => <TextField {...field} error={!!fieldState.error} helperText={fieldState.error?.message} />} />. Controller handles value, onChange, onBlur and ref.` },
          ],
        },
        {
          q: `This zod schema never shows the "passwords must match" error. Fix it.`,
          code: `const schema = z.object({\n  password: z.string().min(8),\n  confirm: z.string(),\n}).refine(d => d.password === d.confirm, { message: 'Passwords must match' });\n// form shows errors.confirm?.message`,
          short: `A refine on the object puts the error at the root path, not on confirm; set path: ['confirm'] so it appears on that field.`,
          long: `Object-level refine errors have an empty path by default.\nRHF stores them in errors.root or not where the UI looks.\nAdd path: ['confirm'] to attach it to the field.\nRefinements run only after the base object schema passes.\nYup equivalent: confirm: yup.string().oneOf([yup.ref('password')], 'Passwords must match').`,
          fix: `const schema = z.object({\n  password: z.string().min(8),\n  confirm: z.string(),\n}).refine(d => d.password === d.confirm, { message: 'Passwords must match', path: ['confirm'] });`,
          exercises: [
            { task: `Infer the form type from the schema and use it in useForm.`, description: `Checks zod + TS. Use zodResolver.`, answer: `type FormValues = z.infer<typeof schema>; then useForm<FormValues>({ resolver: zodResolver(schema) }). The schema is the single source of truth for types and validation.` },
            { task: `Why does the match error not show while password is too short?`, description: `Checks refine ordering. Type a short password and a different confirm.`, answer: `Object refinements run only when the inner fields pass their own checks. So the min(8) error appears first. Use superRefine or validate fields separately if you need both errors at once.` },
          ],
        },
      ],
      senior: [
        {
          q: `How do you show server validation errors in a react-hook-form form?`,
          short: `Map the API error response to field names and call setError for each, and use a root error for messages not tied to a field.`,
          long: `Agree on an API error format, e.g. { fieldErrors: { email: ['Taken'] }, formError }.\nIn onSubmit, catch the error and call setError('email', { type: 'server', message }).\nUse setError('root.server', ...) for general errors and show them above the form.\nFocus the first field with an error (shouldFocus: true).\nErrors clear when the user edits the field, or on the next submit.\nKeep client and server rules aligned, e.g. share the zod schema.`,
          exercises: [
            { task: `Write the onSubmit that maps server errors.`, description: `Checks setError usage. Mock an API that returns field errors.`, answer: `Wrap the API call in try/catch. For each entry in fieldErrors call setError(name, { type: 'server', message: msgs[0] }, { shouldFocus: true }) for the first. If formError exists, set root.server.`, solution: `async function onSubmit(values) {\n  try { await api.save(values); }\n  catch (e) {\n    Object.entries(e.fieldErrors ?? {}).forEach(([name, msgs], i) =>\n      setError(name, { type: 'server', message: msgs[0] }, { shouldFocus: i === 0 }));\n    if (e.formError) setError('root.server', { message: e.formError });\n  }\n}` },
            { task: `How do you share one schema between frontend and a Node backend?`, description: `Checks architecture. Describe the package setup.`, answer: `Put zod schemas in a shared package in the monorepo and import them in both. The backend validates input with schema.parse; the frontend uses zodResolver. Server-only checks (unique email) stay on the server.` },
          ],
        },
        {
          q: `The "Reset" button does not reset the form after data loads. Fix it.`,
          code: `function EditUser({ user }) {\n  const { register, reset, handleSubmit } = useForm({ defaultValues: user });\n  return (<form onSubmit={handleSubmit(save)}>\n    <input {...register('name')} />\n    <button type="button" onClick={() => reset()}>Reset</button>\n  </form>);\n}\n// user is undefined on first render, then loaded`,
          short: `defaultValues are read only once on first render, when user was undefined; call reset(user) when data arrives, or use the values prop, or render the form only after loading.`,
          long: `useForm caches defaultValues from the first render.\nLater changes to user are ignored, so reset() goes back to empty values.\nOption 1: render the form only when user exists (often the simplest).\nOption 2: pass values: user — RHF updates the form when it changes.\nOption 3: useEffect(() => { if (user) reset(user); }, [user, reset]).\nBe careful: refetches can overwrite edits; use resetOptions: { keepDirtyValues: true }.`,
          fix: `function EditUserPage({ userId }) {\n  const { data: user } = useQuery({ queryKey: ['user', userId], queryFn: () => getUser(userId) });\n  if (!user) return <Spinner />;\n  return <EditUser key={user.id} user={user} />;\n}`,
          exercises: [
            { task: `Why is key={user.id} useful on the form?`, description: `Checks key reset. Switch between two users.`, answer: `When the user changes, a new key remounts the form, so useForm initializes with the new defaultValues. It prevents values of user A showing for user B. It is simpler than syncing with effects.` },
            { task: `A background refetch overwrites what the user is typing. Fix it.`, description: `Checks keepDirtyValues. Simulate refetch on window focus.`, answer: `Use values with resetOptions: { keepDirtyValues: true } so only untouched fields update. Or disable refetchOnWindowFocus for edit screens. Warn the user if the server data changed while editing.` },
          ],
        },
        {
          q: `When would you pick Formik, react-hook-form, TanStack Form or plain React 19 actions?`,
          short: `react-hook-form is the common default for complex client forms, TanStack Form for strongly typed headless needs, React 19 actions for simple and server-driven forms; Formik is mostly legacy now.`,
          long: `Formik: controlled, re-renders a lot, slow maintenance; keep it in old code, avoid in new code.\nreact-hook-form: uncontrolled, fast, big ecosystem, resolvers for zod/yup/valibot.\nTanStack Form: fully typed paths, framework-agnostic, good for complex dynamic forms.\nReact 19 actions + useActionState: progressive enhancement, works with Server Functions, little JS.\nChoose based on form complexity, SSR needs, team knowledge, and design-system integration.`,
          exercises: [
            { task: `A login form in a Next.js app. Which tool and why?`, description: `Checks choosing tools. Explain in 3–4 sentences.`, answer: `A Server Function with useActionState is enough: few fields, server validation, works without JS. Use zod on the server and return field errors as state. A form library adds little here.` },
            { task: `A 40-field insurance wizard with conditional sections. Which tool and why?`, description: `Checks choosing tools. Explain.`, answer: `react-hook-form or TanStack Form with a zod schema per step. They handle field arrays, conditional fields and performance well. Keep the wizard state in one form instance or merge per-step results.` },
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
            { task: `Write the migration plan with phases and risks.`, description: `Checks planning. One page.`, answer: `Phase 1: shared fields and guide. Phase 2: migrate on touch plus codemods. Phase 3: finish the long tail and remove Formik. Risks: behavior differences in validation timing, untested forms, and team capacity; mitigate with tests and a feature flag on critical forms.` },
            { task: `How do you keep validation behavior the same during migration?`, description: `Checks risk control. Describe tests.`, answer: `Write tests for the old form behavior first (when errors show, what is sent). Set RHF mode to match Formik (validate on change and blur). Run the same tests after migration.` },
          ],
        },
        {
          q: `Design a schema-driven form system for a product where admins create forms.`,
          short: `Store a versioned JSON schema of fields and rules, render it with a registry of field components, validate on client and server from the same schema, and keep answers tied to the schema version.`,
          long: `Schema: fields (type, label, options), conditions (show if), validation rules, layout.\nRenderer maps field types to design-system components; unknown types fail safely.\nValidation: build a zod schema at runtime from the JSON on both client and server.\nVersion every schema; submissions save the version they used.\nAccessibility built into each field component.\nConsider JSON Schema / JSON Forms or existing tools before building your own.`,
          ai: true,
          exercises: [
            { task: `How do you handle a schema change while users have drafts?`, description: `Checks versioning. Describe the strategy.`, answer: `Drafts keep their schema version and render with it, or a migration maps old answers to new fields. Removed fields are kept in stored data but hidden. Publish schema changes as new versions, never edit in place.` },
            { task: `What security risks exist in admin-defined forms?`, description: `Checks security. List risks.`, answer: `XSS in labels or help text if rendered as HTML, regex rules that cause ReDoS, and trusting client-only validation. Sanitize rich text, limit regex features or time, and always validate on the server.` },
          ],
        },
        {
          q: `Users lose form data when their session expires. How do you solve this across the app?`,
          short: `Autosave drafts locally or to the server, refresh tokens silently, and on 401 keep the form, re-authenticate in a dialog and retry the submit.`,
          long: `Save drafts to localStorage/IndexedDB (debounced) keyed by user and form id; clear after a successful submit.\nUse silent token refresh so most sessions never expire mid-edit.\nOn 401 during submit, open a login dialog, keep the form mounted, then retry.\nWarn on navigation with unsaved changes (useBlocker in React Router).\nDo not store sensitive fields (passwords, card data) in drafts.\nMake it a shared hook (useFormDraft) so all teams get it.`,
          exercises: [
            { task: `Write useFormDraft for react-hook-form.`, description: `Checks implementation. Use watch subscription and localStorage.`, answer: `On mount, read the draft and call reset(draft). Subscribe with watch(callback) and save values debounced to localStorage, inside try/catch. Expose clearDraft() to call after submit.` },
            { task: `How do you get teams to adopt it?`, description: `Checks leadership. Describe steps.`, answer: `Ship it in the shared form components so most forms get it by default with an opt-out. Document it, demo it, and add a check in the form review checklist. Measure support tickets about lost data.` },
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
            { task: `Update the "done" flag of one todo immutably.`, description: `Checks immutable object updates. Build a toggle.`, answer: `Map over the array and return a new object for the matching id: setTodos(t => t.map(x => x.id === id ? { ...x, done: !x.done } : x)). Other items keep their references.` },
            { task: `Remove a todo by id.`, description: `Checks immutable removal. Add a delete button.`, answer: `Use filter: setTodos(t => t.filter(x => x.id !== id)). filter returns a new array, so React re-renders. Do not use splice on state.` },
          ],
        },
        {
          q: `How do you create and use a Context in React 19?`,
          short: `Create it with createContext(default), provide a value with <MyContext value={...}>, and read it with useContext or use.`,
          long: `const ThemeContext = createContext('light').\nIn React 19 you can render <ThemeContext value="dark"> directly; .Provider still works.\nRead with useContext(ThemeContext) or use(ThemeContext) (use can be called in conditions).\nComponents without a provider above get the default value.\nAll consumers re-render when the value changes.`,
          exercises: [
            { task: `Build a theme switch with Context.`, description: `Checks context basics. Toggle theme in one component, read it in another.`, answer: `Keep theme in state in a ThemeProvider, pass { theme, toggle } as the context value, and read it in children with useContext. Wrap the app with the provider.`, solution: `const ThemeContext = createContext(null);\nfunction ThemeProvider({ children }) {\n  const [theme, setTheme] = useState('light');\n  const value = useMemo(() => ({ theme, toggle: () => setTheme(t => t === 'light' ? 'dark' : 'light') }), [theme]);\n  return <ThemeContext value={value}>{children}</ThemeContext>;\n}` },
            { task: `A component reads the context but always gets the default value. Why?`, description: `Checks provider placement. Reproduce by rendering it outside the provider.`, answer: `The component is not inside the provider in the tree, or a different context object is imported (e.g. duplicated module). Move the provider higher. A custom hook that throws when the value is null helps catch this.` },
          ],
        },
        {
          q: `What is "lifting state up"?`,
          short: `Moving state to the closest common parent so that two or more children can share and change it through props.`,
          long: `Two siblings cannot read each other's state.\nMove the state to their parent.\nPass the value down as props and pass a callback to change it.\nThe parent becomes the single source of truth.\nIf the parent is far away, consider context or a store.`,
          exercises: [
            { task: `Two inputs show the same temperature in Celsius and Fahrenheit. Build it.`, description: `Checks lifting state. Type in either input.`, answer: `Store one value (celsius) in the parent and derive fahrenheit during render. Each input gets its value and an onChange that converts back to celsius. Only one state value avoids sync bugs.` },
            { task: `An accordion should allow only one open panel. Where does the state go?`, description: `Checks state ownership. Build it.`, answer: `Put openIndex in the Accordion parent and pass isOpen and onOpen to each panel. If each panel had its own state, they could not close each other.` },
          ],
        },
      ],
      middle: [
        {
          q: `When would you choose Zustand over React Context?`,
          short: `Use Zustand for frequently changing shared client state, because components subscribe to slices with selectors; Context re-renders all consumers when the value changes.`,
          long: `Context is good for rarely changing values: theme, locale, current user, dependencies.\nZustand stores live outside React; useStore(selector) re-renders only when the selected slice changes.\nNo provider needed, actions live in the store, middleware for persist and devtools.\nContext with useReducer is fine for small, local feature state.\nFor server data, use TanStack Query instead of either.`,
          exercises: [
            { task: `Create a Zustand cart store with add and remove.`, description: `Checks Zustand basics. Use it in two components.`, answer: `Use create with state and actions that call set with immutable updates. Components read with useCart(s => s.items) or useCart(s => s.add). Each component re-renders only for its slice.`, solution: `const useCart = create(set => ({\n  items: [],\n  add: item => set(s => ({ items: [...s.items, item] })),\n  remove: id => set(s => ({ items: s.items.filter(i => i.id !== id) })),\n}));` },
            { task: `Why does useCart(s => ({ items: s.items, add: s.add })) cause extra renders?`, description: `Checks selector equality. Log renders.`, answer: `The selector returns a new object each time, so the strict equality check always fails. In Zustand v5 this can even loop. Use useShallow(s => ({ ... })) or select fields separately.` },
          ],
        },
        {
          q: `This context causes the whole app to re-render on every key press. Fix it.`,
          code: `function AppProvider({ children }) {\n  const [user, setUser] = useState(null);\n  const [search, setSearch] = useState('');\n  return <AppContext value={{ user, setUser, search, setSearch }}>{children}</AppContext>;\n}`,
          short: `One context holds fast-changing search and slow-changing user, and the value object is new every render; split contexts and memoize values.`,
          long: `Every provider render creates a new value object, so all consumers re-render.\nsearch changes on each key press and forces user consumers to re-render too.\nSplit into UserContext and SearchContext.\nMemoize the value with useMemo, or pass setters in a separate context (setters are stable).\nBetter: keep search local or in the URL; it rarely needs to be global.`,
          fix: `function UserProvider({ children }) {\n  const [user, setUser] = useState(null);\n  const value = useMemo(() => ({ user, setUser }), [user]);\n  return <UserContext value={value}>{children}</UserContext>;\n}\n// search: keep local to the page, or use a separate SearchContext`,
          exercises: [
            { task: `Split state and dispatch into two contexts.`, description: `Checks context splitting. Use useReducer and log renders of a button that only dispatches.`, answer: `Provide state in StateContext and dispatch in DispatchContext. dispatch is stable, so components that only dispatch do not re-render on state changes. Wrap them in custom hooks.` },
            { task: `How do you measure which components re-render?`, description: `Checks tooling. Use React DevTools.`, answer: `Use the Profiler with "Record why each component rendered" and "Highlight updates". It shows context changes as the reason. Check before and after the fix.` },
          ],
        },
        {
          q: `What does Redux Toolkit add on top of plain Redux?`,
          short: `RTK gives configureStore with good defaults, createSlice with Immer for "mutating" reducers, createAsyncThunk, and RTK Query for data fetching.`,
          long: `configureStore sets up devtools, thunk middleware, and dev checks for mutation and serializability.\ncreateSlice creates reducers and action creators together.\nImmer lets you write state.items.push(x) safely in reducers.\ncreateEntityAdapter gives normalized CRUD helpers.\nRTK Query handles caching, invalidation and loading states.\nIt is the official recommended way to write Redux.`,
          exercises: [
            { task: `Write a counter slice with increment and incrementBy.`, description: `Checks createSlice. Dispatch from a component.`, answer: `Use createSlice with name, initialState and reducers. incrementBy reads action.payload. Export slice.actions and slice.reducer, then use useDispatch and useSelector.`, solution: `const counter = createSlice({\n  name: 'counter',\n  initialState: { value: 0 },\n  reducers: {\n    increment: s => { s.value += 1; },\n    incrementBy: (s, a) => { s.value += a.payload; },\n  },\n});` },
            { task: `Why can you "mutate" in a slice reducer but not in useState?`, description: `Checks Immer. Explain.`, answer: `createSlice wraps reducers with Immer, which records changes on a draft and returns a new immutable object. useState has no Immer, so mutation keeps the same reference. You can add use-immer for local state if you want.` },
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
            { task: `Write a selector that takes a category parameter and stays memoized per component.`, description: `Checks selector factories. Use two lists with different categories.`, answer: `Create a factory makeSelectByCategory = () => createSelector([selectTodos, (s, c) => c], (todos, c) => todos.filter(...)). In the component, useMemo(makeSelectByCategory, []) and call useSelector(s => select(s, category)). Each instance has its own cache.` },
            { task: `When should you use shallowEqual in useSelector?`, description: `Checks equality options. Compare renders.`, answer: `When the selector returns a new small object or array built from existing values, like { a: s.a, b: s.b }. shallowEqual compares the fields. For computed arrays, memoized selectors are better.` },
          ],
        },
        {
          q: `How do you keep state in the URL with React Router? When should you?`,
          short: `Use useSearchParams for filters, sort, page and tabs so they are shareable, survive reloads and work with back/forward.`,
          long: `Rule: if a user would expect to share or bookmark it, put it in the URL.\nuseSearchParams returns params and a setter; update with a function to keep other params.\nParse and validate params (zod) and give defaults.\nUse replace for frequent updates (typing) so history is not flooded.\nnuqs offers typed URL state hooks.\nDo not put sensitive data in the URL.`,
          exercises: [
            { task: `Store a page number and sort in the URL.`, description: `Checks useSearchParams. Change values and press Back.`, answer: `Read page = Number(params.get('page') ?? 1) and sort from params. Update with setParams(p => { p.set('page', String(n)); return p; }). The query key for data fetching uses these values, so the URL drives the data.` },
            { task: `A search box writes to the URL on every key press. What problems happen? Fix them.`, description: `Checks URL update strategy. Type quickly and test Back.`, answer: `Each key press adds a history entry and can trigger a fetch. Keep input state local, debounce, and write to the URL with { replace: true }. Then Back goes to the previous page, not the previous letter.` },
          ],
        },
        {
          q: `How do you avoid the "flash of wrong content" when restoring persisted Zustand state with SSR?`,
          short: `Persisted state is only available on the client, so server HTML uses defaults; delay rendering of persisted parts until hydration, or use skipHydration and rehydrate in an effect.`,
          long: `On the server there is no localStorage, so the store has initial values.\nOn the client, persist rehydrates and the UI changes after paint, or causes hydration mismatch.\nOptions: render persisted UI only after a hasHydrated flag is true.\nUse persist's skipHydration: true and call store.persist.rehydrate() in useEffect.\nFor per-request data in Next.js, create the store per request and pass it via context, not a module singleton.\nCookies can carry small preferences (theme) so the server can render correctly.`,
          ai: true,
          exercises: [
            { task: `Implement a useHasHydrated hook for a persisted store.`, description: `Checks hydration handling. Use Zustand persist API.`, answer: `Use useSyncExternalStore with store.persist.onFinishHydration as subscribe, store.persist.hasHydrated as getSnapshot, and () => false as server snapshot. Render a placeholder until it returns true.` },
            { task: `Why is a module-level store dangerous in SSR?`, description: `Checks SSR state isolation. Explain.`, answer: `On the server, module state is shared across all requests, so one user's data can leak to another. Create a store per request and provide it via context. Client-only stores without user data are fine.` },
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
            { task: `Classify these: current user, table filters, modal open, cart, product list.`, description: `Checks applying the guide. Assign each.`, answer: `Current user: query cache plus maybe a context for session. Table filters: URL. Modal open: local state. Cart: server state if persisted on the backend, else a client store with persist. Product list: TanStack Query.` },
            { task: `How do you enforce the guide?`, description: `Checks governance. Describe mechanisms.`, answer: `Add ESLint restrictions (e.g. no fetch inside store files), PR template questions, and an architecture review for new global stores. Keep examples in a reference app. Review the guide every few months.` },
          ],
        },
        {
          q: `Review this store design. What would you change?`,
          code: `export const useStore = create(set => ({\n  user: null, products: [], productsLoading: false, cart: [], theme: 'light', modalOpen: false,\n  fetchProducts: async () => { set({ productsLoading: true }); const p = await api.products(); set({ products: p, productsLoading: false }); },\n}));`,
          short: `It is a god store that mixes server data, UI state and preferences; split it by domain, move products to TanStack Query and keep UI state local.`,
          long: `products and loading are server state: no caching, no errors, no refetch; use a query.\nmodalOpen is local UI state and should not be global.\ntheme is a preference: context or a small persisted store.\ncart can be its own slice/store with clear actions.\nOne store for everything means every team edits the same file and coupling grows.\nSplit by feature, own each slice, and add tests for actions.`,
          fix: `const useProducts = () => useQuery({ queryKey: ['products'], queryFn: api.products });\nexport const useCart = create(set => ({\n  items: [],\n  add: i => set(s => ({ items: [...s.items, i] })),\n}));\n// theme -> ThemeContext or persisted prefs store; modalOpen -> useState`,
          exercises: [
            { task: `Plan how to split the store without breaking 50 components.`, description: `Checks incremental refactor. Describe steps.`, answer: `Create the new stores and hooks, then make the old store fields proxy or re-export them during the transition. Migrate components by area with codemods where possible. Remove old fields when there are no usages, checked with TypeScript and grep.` },
            { task: `How do you test Zustand stores?`, description: `Checks testing. Use Vitest.`, answer: `Call actions through useCart.getState() and assert state, resetting with setState(initial) before each test. For components, render with the real store and reset it between tests. Mock only the API layer.` },
          ],
        },
        {
          q: `The team wants to move from Redux to Zustand. How do you evaluate this?`,
          short: `First find the real pain (boilerplate, server state in Redux, performance), measure it, and check if RTK/RTK Query fixes it; migrate only if the benefit is clear and you can do it step by step.`,
          long: `Often the pain is hand-written Redux or server data in reducers; RTK Query or TanStack Query removes most of it.\nZustand is smaller and simpler but has fewer conventions; large teams may need rules.\nConsider devtools, middleware, SSR, testing, and team knowledge.\nIf migrating: move server state to a query library first, then move remaining slices by feature.\nBoth can run side by side during migration.\nWrite an ADR with the decision and exit criteria.`,
          ai: true,
          exercises: [
            { task: `List the questions you ask before approving the migration.`, description: `Checks decision-making. Write 5 questions.`, answer: `What problem do we solve, and how do we measure it? How much of Redux state is server data? Does RTK fix it at lower cost? What is the migration cost and risk? Who owns the conventions after the change?` },
            { task: `How do you run Redux and Zustand side by side safely?`, description: `Checks coexistence. Describe rules.`, answer: `Each piece of state lives in exactly one place; no syncing between stores. Migrate a whole feature slice at once. Add a lint rule that blocks new Redux slices so the old store only shrinks.` },
          ],
        },
      ],
    },
  },
};
