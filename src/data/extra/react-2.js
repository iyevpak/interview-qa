export default {
  React: {
    "Routing": {
      junior: [
        {
          q: "What is the difference between Link, NavLink and useNavigate in React Router?",
          short: "<Link> renders an accessible anchor for declarative navigation, <NavLink> adds active/pending state for menus, and useNavigate() navigates imperatively from code (e.g. after a form submit).",
          long: "<Link to=\"/users\"> renders a real <a href>, so middle-click, copy link and screen readers work.\n<NavLink> knows whether its route matches and exposes isActive/isPending to className, style and children, and sets aria-current=\"page\".\nuseNavigate() returns a function: navigate('/done'), navigate(-1), navigate(to, { replace: true, state }).\nPrefer links for anything the user clicks to go somewhere; use navigate for side-effect-driven redirects.\nIn data routers, redirect() from a loader/action is often better than navigate in an effect.\nNever use onClick + window.location: it reloads the whole app and loses state.",
          follow: "A menu item uses a button with navigate. Why is a Link better?",
          exercises: [
            {
              task: "Highlight the active link.",
              description: "Checks NavLink.",
              code: "<Link to=\"/inbox\">Inbox</Link>",
              answer: "NavLink gives isActive to className and sets aria-current.",
              solution: `<NavLink to="/inbox" className={({ isActive }) => isActive ? "on" : ""}>
  Inbox
</NavLink>`,
            },
            {
              task: "Navigate after a save.",
              description: "Checks useNavigate.",
              code: "async function onSave() { await save(); /* go to list */ }",
              answer: "Call useNavigate in the component and navigate after save.",
              solution: `const navigate = useNavigate();
async function onSave() { await save(); navigate("/list"); }`,
            },
            {
              easy: true,
              task: "Name the component that knows if it is active.",
              description: "Checks NavLink.",
              code: "<NavLink to=\"/home\" className={({ isActive }) => ?} />",
              answer: "NavLink, which passes isActive to className.",
            },
            {
              easy: true,
              task: "Predict what navigate(-1) does.",
              description: "Checks history navigation.",
              code: `const navigate = useNavigate();
navigate(-1);`,
              answer: "It goes back one page in history.",
            },
          ]
        },
        {
          q: "Fix this route setup. The user page does not show the user ID.",
          code: `<Routes>
  <Route path="*" element={<NotFound />} />
  <Route path="/users" element={<Users />} />
  <Route path="users/:id" element={<User />} />
</Routes>

function User() {
  const id = useParams().userId;
  return <h1>User {id}</h1>;
}`,
          short: "Route order does not matter in React Router v6+/v7 (it ranks routes), so the real bug is the param name mismatch; read params by the exact name declared in the path and make sure a router wraps the tree.",
          long: "React Router ranks routes by specificity, so '*' only matches when nothing else does.\nIf you see NotFound, check that the app is wrapped in a router and that the URL really matches (trailing segments, basename).\nHere useParams().userId is undefined because the segment is named :id.\nParams are always strings: convert with Number(id) and validate.\nKeep paths consistent (relative inside nested <Routes>, absolute at the top).\nWrite a test with MemoryRouter initialEntries to lock the behavior.",
          fix: `<BrowserRouter>
  <Routes>
    <Route path="/users" element={<Users />} />
    <Route path="/users/:id" element={<User />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>

function User() {
  const { id } = useParams();
  return <h1>User {id}</h1>;
}`,
          exercises: [
            {
              task: "Fix the param name.",
              description: "Checks matching param names.",
              code: `<Route path="/users/:userId" element={<User />} />
const { id } = useParams();`,
              answer: "The param is userId, not id.",
              solution: "const { userId } = useParams();",
            },
            {
              task: "Predict the type of the param.",
              description: "Checks params are strings.",
              code: `// URL: /users/42
const { userId } = useParams();
userId === 42`,
              answer: "false. Params are always strings (or undefined). Use Number(userId).",
            },
            {
              easy: true,
              task: "Fix the path to include the id.",
              description: "Checks dynamic segments.",
              code: "<Route path=\"/user\" element={<User />} />",
              answer: "Add a :id segment to the path.",
              solution: "<Route path=\"/user/:id\" element={<User />} />",
            },
            {
              easy: true,
              task: "Name the hook that reads the id.",
              description: "Checks useParams.",
              code: "const { id } = ?();",
              answer: "useParams, which returns { id }.",
            },
          ]
        },
        {
          q: "What are nested routes? What does the Outlet component do?",
          short: "Nested routes let a parent route render shared layout while a child route fills the <Outlet /> placeholder, so URL segments map to nested UI.",
          long: "A parent route (e.g. /settings) renders a layout with tabs and an <Outlet />.\nChild routes (profile, billing) render inside that outlet when their path matches.\nIndex routes render at the parent URL with no extra segment.\nLayout routes without a path group children under shared UI (e.g. an auth shell).\nThe parent stays mounted when switching children, preserving its state.\nuseOutletContext lets the parent pass data to children without prop drilling.",
          exercises: [
            {
              task: "Render child routes inside the layout.",
              description: "Checks Outlet.",
              code: `function Layout() {
  return <><Nav /><main>{/* child here */}</main></>;
}`,
              answer: "Put <Outlet /> where children should render.",
              solution: `function Layout() {
  return <><Nav /><main><Outlet /></main></>;
}`,
            },
            {
              task: "Add an index route.",
              description: "Checks index routes.",
              code: `<Route path="settings" element={<Settings />}>
  <Route path="profile" element={<Profile />} />
</Route>`,
              answer: "Add an index route so /settings shows default content.",
              solution: "<Route index element={<General />} />",
            },
            {
              easy: true,
              task: "Name where child routes render.",
              description: "Checks Outlet.",
              code: "function Layout() { return <main>?</main>; }",
              answer: "In the parent's <Outlet />.",
            },
            {
              easy: true,
              task: "Predict the URL for this nested route.",
              description: "Checks nested paths.",
              code: `<Route path="settings">
  <Route path="profile" />
</Route>`,
              answer: "/settings/profile, since child paths are relative.",
            },
          ]
        }
      ],
      middle: [
        {
          q: "Fix this search page. Each key press adds a history entry. The Back button breaks the input.",
          code: `function Search() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  return (
    <input value={q} onChange={e => {
      setQ(e.target.value);
      setParams({ q: e.target.value });
    }} />
  );
}`,
          short: "The URL is the source of truth, so derive the value from searchParams instead of copying it into state, and use replace for keystrokes.",
          long: "Copying params into useState creates two sources of truth; Back changes the URL but not q.\nEach setParams pushes a new history entry, so Back steps through every character.\nRead the value from params directly and write with { replace: true }.\nIf typing must feel instant while the URL debounces, keep a local draft but resync it when params change.\nUse the functional form setParams(prev => ...) to preserve other params.\nDebounce data fetching, not the input value.",
          fix: `function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  return (
    <input value={q} onChange={e => {
      setParams(prev => {
        const next = new URLSearchParams(prev);
        if (e.target.value) next.set("q", e.target.value); else next.delete("q");
        return next;
      }, { replace: true });
    }} />
  );
}`,
          exercises: [
            {
              task: "Replace history instead of pushing.",
              description: "Checks replace option.",
              code: "setParams({ q: e.target.value });",
              answer: "Use replace: true while typing so Back does not step through every key.",
              solution: "setParams({ q: e.target.value }, { replace: true });",
            },
            {
              task: "Fix the input after Back.",
              description: "Checks URL as single source.",
              code: "const [q, setQ] = useState(params.get(\"q\"));",
              answer: "Local state copies the URL once and goes stale. Read q from params directly.",
              solution: "const q = params.get(\"q\") ?? \"\";",
            },
            {
              easy: true,
              task: "Spot the two sources of truth.",
              description: "Checks copying params to state.",
              code: "const [q, setQ] = useState(params.get(\"q\"));",
              answer: "q is copied into state, so Back changes the URL but not q.",
            },
            {
              easy: true,
              task: "Name the option that avoids extra history entries.",
              description: "Checks replace option.",
              code: "setParams({ q }, { replace: true });",
              answer: "{ replace: true }, so each key does not add history.",
            },
          ]
        },
        {
          q: "How do you show a loading state during navigation in React Router version 7?",
          short: "useNavigation() exposes idle/loading/submitting state for the global navigation, and useFetcher gives per-component state for non-navigating mutations.",
          long: "With loaders the old page stays visible until the next route's data resolves.\nuseNavigation().state tells you if a navigation is loading or submitting so you can show a top progress bar.\nNavLink also receives isPending for the link being navigated to.\nuseFetcher() runs a loader/action without navigating (likes, inline edits) with its own state and data.\nReturning promises from loaders lets you stream non-critical data with <Suspense>/<Await>.\nAfter actions, loaders revalidate automatically; shouldRevalidate can opt out.",
          exercises: [
            {
              task: "Show a spinner during navigation.",
              description: "Checks useNavigation.",
              code: "function Root() { return <Outlet />; }",
              answer: "Read navigation.state; it is \"loading\" while loaders run.",
              solution: `function Root() {
  const nav = useNavigation();
  return <>{nav.state === "loading" && <Bar />}<Outlet /></>;
}`,
            },
            {
              task: "Name how to keep old content visible.",
              description: "Checks pending UI choices.",
              code: "// page goes blank during navigation",
              answer: "Data routers keep the old page until loaders finish; show a progress bar or dim it instead of a blank screen.",
            },
            {
              easy: true,
              task: "Name the hook for navigation state.",
              description: "Checks useNavigation.",
              code: "const { state } = useNavigation();",
              answer: "useNavigation, whose state is \"loading\" during navigation.",
            },
            {
              easy: true,
              task: "Predict state while a loader runs.",
              description: "Checks loading state.",
              code: "loader: async () => await getUsers()",
              answer: "\"loading\", then \"idle\" when done.",
            },
          ]
        },
        {
          q: "When the page changes, how do you handle scroll position and keyboard focus?",
          ai: true,
          short: "Restore scroll per history entry (ScrollRestoration in data routers) and move focus to the new page's heading or main region so keyboard and screen reader users notice the change.",
          long: "SPAs do not reset scroll or focus automatically like full page loads do.\nReact Router's <ScrollRestoration /> restores positions on Back/Forward and scrolls to top on new navigations.\ngetKey can key scroll by pathname for lists that should remember position.\nFor a11y, focus the <h1> (tabIndex=-1) or announce the title with a live region after navigation.\nDo not steal focus on search-param-only changes like filter edits.\nUpdate document.title per route (React 19 supports <title> in components).",
          exercises: [
            {
              task: "Restore scroll in a data router.",
              description: "Checks ScrollRestoration.",
              code: "// page keeps old scroll after navigation",
              answer: "Render <ScrollRestoration /> once in the root layout.",
            },
            {
              task: "Move focus to the new page heading.",
              description: "Checks focus management on route change.",
              code: "<h1>{title}</h1>",
              answer: "Give the heading tabIndex={-1} and focus it on route change so screen readers announce it.",
              solution: `const ref = useRef(null);
useEffect(() => ref.current?.focus(), [location.pathname]);
<h1 ref={ref} tabIndex={-1}>{title}</h1>`,
            },
            {
              easy: true,
              task: "Name the component that restores scroll.",
              description: "Checks ScrollRestoration.",
              code: "<ScrollRestoration />",
              answer: "ScrollRestoration from React Router.",
            },
            {
              easy: true,
              task: "Name where focus should go after navigation.",
              description: "Checks focus management.",
              answer: "To the main heading or main content of the new page.",
            },
          ]
        }
      ],
      senior: [
        {
          q: "Fix this loader. When you switch projects fast, you sometimes see old project data.",
          code: `export async function loader({ params }) {
  const res = await fetch("/api/projects/" + params.id);
  return res.json();
}

function Project() {
  const data = useLoaderData();
  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    fetch("/api/projects/" + data.id + "/tasks").then(r => r.json()).then(setTasks);
  }, [data.id]);
}`,
          short: "Loaders get an AbortSignal on request that the router aborts on interrupted navigations; pass it to fetch and move dependent fetches into the loader instead of an un-cancelled effect.",
          long: "The router aborts stale loaders, but only if fetch receives request.signal.\nThe effect fetch has no cleanup, so a slow old response can overwrite newer tasks.\nLoad both in parallel in the loader, so data arrives together with the route.\nThrow a Response with 404 so the errorElement handles missing projects.\nIf you keep an effect, use AbortController in the cleanup.\nWith a query cache (TanStack Query), call ensureQueryData in the loader to dedupe.",
          fix: `export async function loader({ params, request }) {
  const opts = { signal: request.signal };
  const [project, tasks] = await Promise.all([
    fetch("/api/projects/" + params.id, opts).then(r => {
      if (!r.ok) throw new Response("Not found", { status: r.status });
      return r.json();
    }),
    fetch("/api/projects/" + params.id + "/tasks", opts).then(r => r.json()),
  ]);
  return { project, tasks };
}

function Project() {
  const { project, tasks } = useLoaderData();
}`,
          exercises: [
            {
              task: "Pass the abort signal.",
              description: "Checks request.signal in loaders.",
              code: `export async function loader({ params }) {
  return fetch(\`/api/p/\${params.id}\`);
}`,
              answer: "Pass request.signal so cancelled navigations abort the fetch.",
              solution: `export async function loader({ params, request }) {
  return fetch(\`/api/p/\${params.id}\`, { signal: request.signal });
}`,
            },
            {
              task: "Spot the race.",
              description: "Checks module-level caches.",
              code: `let current;
export async function loader({ params }) { current = await get(params.id); return current; }`,
              answer: "A slow older call can overwrite current after a newer one. Return data directly; do not share module state.",
            },
            {
              easy: true,
              task: "Name the loader argument that cancels requests.",
              description: "Checks request.signal.",
              code: "loader: ({ request, params }) => fetch(url, { signal: ? })",
              answer: "request.signal; pass it to fetch.",
            },
            {
              easy: true,
              task: "True or false: React Router aborts stale loaders.",
              description: "Checks loader abort.",
              code: "User clicks Project A, then Project B quickly.",
              answer: "True. It aborts the signal when a newer navigation starts.",
            },
          ]
        },
        {
          q: "How do you split code by route, and still keep navigation fast?",
          short: "Use the route lazy() property so the router loads code and data in parallel, and prefetch likely next routes on hover/intent.",
          long: "React.lazy inside an element only starts loading when rendered, after the loader finished: a waterfall.\nThe route lazy() function (or v7 framework mode route modules) lets the router fetch component, loader and action chunks together.\nSplit by route, not by tiny component; too many chunks increases request overhead.\nPrefetch on hover/focus (<Link prefetch=\"intent\"> in framework mode) or idle time.\nKeep the shell and critical path in the main bundle.\nMeasure with bundle analyzer and real-user navigation timing.",
          exercises: [
            {
              task: "Lazy load a route in a data router.",
              description: "Checks route lazy.",
              code: "{ path: \"reports\", element: <Reports /> }",
              answer: "Use the lazy option to load the module only when needed.",
              solution: "{ path: \"reports\", lazy: () => import(\"./reports\") }",
            },
            {
              task: "Prefetch a route on hover.",
              description: "Checks prefetching code.",
              code: "<Link to=\"/reports\">Reports</Link>",
              answer: "In framework mode use prefetch=\"intent\". Otherwise call the import() on mouseenter.",
              solution: "<Link to=\"/reports\" prefetch=\"intent\">Reports</Link>",
            },
            {
              easy: true,
              task: "Name the property to lazy load a route.",
              description: "Checks route lazy.",
              code: "{ path: \"/reports\", lazy: () => import(\"./reports\") }",
              answer: "The lazy property in the route object.",
            },
            {
              easy: true,
              task: "Name a way to keep navigation fast.",
              description: "Checks prefetching.",
              code: "<Link to=\"/reports\" prefetch=\"intent\" />",
              answer: "Prefetch route code on hover or when the link is visible.",
            },
          ]
        },
        {
          q: "For a new app, when do you pick React Router framework mode? When do you pick library mode?",
          ai: true,
          short: "Framework mode adds file-based route modules, SSR/pre-rendering, type-safe loaders and automatic code splitting; library mode is better when you need to embed routing in an existing SPA or custom build.",
          long: "v7 has three modes: declarative (<BrowserRouter>), data (createBrowserRouter) and framework (Vite plugin).\nFramework mode gives typegen for params/loader data, SSR, SPA mode and static pre-render.\nIt owns the build and server entry, which matters for legacy hosts or micro-frontends.\nData mode gives loaders/actions without changing the build: a good migration step.\nChoose based on SEO/first load needs, hosting, team familiarity and migration path.\nAvoid adopting SSR just for fashion: it adds server ops and hydration constraints.",
          exercises: [
            {
              task: "Pick a mode for each app.",
              description: "Checks framework vs library mode.",
              code: "// 1) public store with SEO  2) widget inside existing app",
              answer: "Framework mode for SSR, SEO and file routes. Library mode for embedding in an existing app.",
            },
            {
              task: "Name one cost of framework mode.",
              description: "Checks trade-offs.",
              code: "// switching an SPA to framework mode",
              answer: "You adopt its build, conventions and maybe a server runtime. Migration takes effort.",
            },
            {
              easy: true,
              task: "Pick a mode for a full-stack app with SSR.",
              description: "Checks framework mode.",
              code: "Public site, SEO needed, server data loading.",
              answer: "Framework mode, which adds SSR and file routes.",
            },
            {
              easy: true,
              task: "Pick a mode for adding routing to an existing SPA.",
              description: "Checks library mode.",
              code: "Existing Vite app, client only.",
              answer: "Library mode, which is just the router in your app.",
            },
          ]
        }
      ],
      techlead: [
        {
          q: "Fix this route guard. Users without access see data for a moment. The code is copied on every route.",
          code: `function Admin() {
  const user = useUser();
  const data = useAdminData();
  if (!user?.isAdmin) return <Navigate to="/login" />;
  return <Dashboard data={data} />;
}`,
          short: "Data is fetched before the check, and guards are scattered; centralize authorization in a parent layout route/loader that runs before child loaders, and enforce it on the server anyway.",
          long: "Client checks are UX, not security: the API must reject unauthorized requests.\nHere useAdminData fires before the redirect, leaking a request and possibly flashing content.\nPut the check in a pathless layout route loader (or middleware in v7) so children never load.\nRedirect with the original location so login can return the user.\nDeclare required permissions as route metadata (handle) and test the matrix.\nOne guard component means one place to audit.",
          fix: `const router = createBrowserRouter([
  {
    id: "admin",
    loader: async ({ request }) => {
      const user = await getUser(request);
      if (!user) throw redirect("/login?next=" + encodeURIComponent(new URL(request.url).pathname));
      if (!user.isAdmin) throw new Response("Forbidden", { status: 403 });
      return { user };
    },
    errorElement: <RouteError />,
    children: [{ path: "admin", element: <Admin />, loader: adminLoader }],
  },
]);`,
          exercises: [
            {
              task: "Check access in the loader.",
              description: "Checks guarding before render.",
              code: "function Admin() { if (!user.isAdmin) return <Navigate to=\"/\" />; /* ... */ }",
              answer: "Check in the loader and throw redirect, so data never loads for users without access.",
              solution: `export async function loader() {
  const user = await getUser();
  if (!user.isAdmin) throw redirect("/");
  return getAdminData();
}`,
            },
            {
              task: "Remove the copied guard.",
              description: "Checks shared parent routes.",
              code: "// requireAdmin() copied in 20 loaders",
              answer: "Put the check in a parent route loader or middleware once; child routes inherit it.",
            },
            {
              easy: true,
              task: "Name where the guard should run.",
              description: "Checks loader guards.",
              code: "loader: async () => { if (!user) throw redirect(\"/login\"); }",
              answer: "In a loader, before the page renders any data.",
            },
            {
              easy: true,
              task: "Name the function a loader throws to redirect.",
              description: "Checks redirect.",
              code: "loader: () => { if (!user) throw ?(\"/login\"); }",
              answer: "redirect, e.g. throw redirect(\"/login\").",
            },
          ]
        },
        {
          q: "Many teams work on one app. How do you keep URL rules the same for everyone?",
          ai: true,
          short: "Treat URLs as a public API: define conventions (resource paths, query param naming, versioning), own a shared route registry, and lint/test for breaking changes.",
          long: "Bookmarks, emails and integrations depend on URLs, so breaking them is a breaking change.\nAgree on resource-oriented paths, kebab-case, and stable IDs over names.\nDocument which state belongs in the URL (filters, tabs) vs memory.\nKeep a route registry/typed helpers (href builders) so links are not string-concatenated.\nWhen renaming, keep redirects and measure their traffic before removal.\nReview routing changes like API changes, with contract tests.",
          exercises: [
            {
              task: "Spot the inconsistency.",
              description: "Checks URL conventions.",
              code: "/userProfile/5   /orders-list   /Settings",
              answer: "Mixed case and styles. Agree on lowercase kebab-case nouns like /users/5 and lint route files.",
            },
            {
              task: "Build links safely.",
              description: "Checks typed route helpers.",
              code: "<Link to={\"/orders/\" + id + \"/edit\"} />",
              answer: "Use shared typed route helpers or generatePath so typos and renamed routes fail at compile time.",
              solution: "<Link to={generatePath(\"/orders/:id/edit\", { id })} />",
            },
            {
              easy: true,
              task: "Name one shared URL rule.",
              description: "Checks URL conventions.",
              code: "/order-items/42",
              answer: "Use kebab-case paths and plural resource names.",
            },
            {
              easy: true,
              task: "Name a tool to enforce route rules.",
              description: "Checks typed routes.",
              code: "paths.order(42) // \"/orders/42\"",
              answer: "A shared typed route helper, so no one hand-writes paths.",
            },
          ]
        },
        {
          q: "Your app has 300 routes. The first load is slow. How do you change the routing design?",
          short: "Split the route tree into lazily loaded feature modules with their own route definitions, keep a thin shell, and introduce budgets and ownership per module.",
          long: "Large eager route configs pull every page import into the main bundle.\nMove to route-level lazy modules owned by feature teams, registered through a manifest.\nOnly the shell, auth and top nav belong in the entry chunk.\nUse patchRoutesOnNavigation (data routers) to discover routes on demand for huge apps.\nSet per-route bundle budgets in CI and track LCP/INP per route in RUM.\nMigrate incrementally behind measurements, not big bang.",
          exercises: [
            {
              task: "Name the first fix for a slow first load.",
              description: "Checks route-based splitting.",
              code: "// all 300 route components imported eagerly",
              answer: "Lazy load each route so the first load only ships the shell and the current page.",
            },
            {
              task: "Spot the problem.",
              description: "Checks huge route config bundles.",
              code: "import { routes } from \"./routes\"; // imports every page",
              answer: "The config imports every page, so splitting fails. Use lazy() in the config instead of static imports.",
            },
            {
              easy: true,
              task: "Name the main fix for slow first load.",
              description: "Checks route code splitting.",
              code: "const Reports = lazy(() => import(\"./Reports\"));",
              answer: "Lazy load routes, so the first load ships only needed code.",
            },
            {
              easy: true,
              task: "True or false: all 300 routes belong in one bundle.",
              description: "Checks bundle splitting.",
              answer: "False. Split by route or area.",
            },
          ]
        }
      ]
    },

    "Error Handling": {
      junior: [
        {
          q: "Fix this component. It crashes when the user has no address.",
          code: `function Profile({ user }) {
  return <p>{user.address.city.toUpperCase()}</p>;
}`,
          short: "Guard optional data with optional chaining and a fallback so missing fields render gracefully instead of throwing during render.",
          long: "Throwing during render unmounts the tree up to the nearest Error Boundary (or the whole app).\nAPIs often omit optional fields; code must model that.\nUse optional chaining and nullish coalescing for display fallbacks.\nTypeScript optional types make the compiler force these checks.\nValidate API responses at the boundary (e.g. zod) for stronger guarantees.\nShow a meaningful placeholder, not an empty crash.",
          fix: `function Profile({ user }) {
  const city = user?.address?.city;
  return <p>{city ? city.toUpperCase() : "No address"}</p>;
}`,
          exercises: [
            {
              task: "Fix the crash.",
              description: "Checks optional chaining.",
              code: "<p>{user.address.city}</p>",
              answer: "address may be missing. Use optional chaining and a fallback.",
              solution: "<p>{user.address?.city ?? \"No address\"}</p>",
            },
            {
              task: "Predict the output.",
              description: "Checks undefined in JSX.",
              code: "<p>{user.address?.city}</p> // address missing",
              answer: "An empty <p>. Optional chaining gives undefined, which React renders as nothing.",
            },
            {
              easy: true,
              task: "Fix the crash with optional chaining.",
              description: "Checks safe property access.",
              code: "user.address.city",
              answer: "Use ?. so a missing address gives undefined.",
              solution: "user.address?.city",
            },
            {
              easy: true,
              task: "Predict the value here.",
              description: "Checks nullish coalescing.",
              code: `const user = {};
user.address?.city ?? "N/A"`,
              answer: "\"N/A\", because the city is undefined.",
            },
          ]
        },
        {
          q: "How do you handle fetch errors in a React component?",
          short: "fetch only rejects on network failure, so check response.ok, store an error state, and render an error message with a retry.",
          long: "fetch resolves for 404/500, so you must check res.ok and throw.\nTrack status: loading, error, success (or use TanStack Query which does it for you).\nCatch inside the async function; errors in effects are not caught by Error Boundaries.\nShow user-friendly text and a retry button; log technical details.\nAbort on unmount to avoid setting state after the component is gone.\nNever swallow errors silently with an empty catch.",
          exercises: [
            {
              task: "Fix the error check.",
              description: "Checks fetch not throwing on 4xx/5xx.",
              code: "fetch(url).then(r => r.json()).then(setData).catch(setError);",
              answer: "fetch only rejects on network errors. Check r.ok and throw otherwise.",
              solution: `fetch(url)
  .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(setData).catch(setError);`,
            },
            {
              task: "Render all three states.",
              description: "Checks loading and error UI.",
              code: "const { data, error, isPending } = useQuery(q);",
              answer: "Return early for pending and error, then render data.",
              solution: `if (isPending) return <Spinner />;
if (error) return <ErrorMsg error={error} />;
return <List items={data} />;`,
            },
            {
              easy: true,
              task: "Spot the missing check.",
              description: "Checks res.ok.",
              code: `const res = await fetch(url);
const data = await res.json();`,
              answer: "fetch does not throw on 404 or 500; check res.ok.",
            },
            {
              easy: true,
              task: "Name the three UI states to track.",
              description: "Checks loading/error/data.",
              code: `const [data, setData] = useState(null);
// what other two states?`,
              answer: "Loading, error and data.",
            },
          ]
        },
        {
          q: "Why can't try and catch around JSX catch errors in child components?",
          short: "JSX only creates element objects; children render later, so a try/catch in the parent never sees their errors. Error Boundaries are the mechanism for render errors.",
          long: "return <Child /> inside try just builds an object and returns.\nReact calls Child later during reconciliation, outside your try block.\nError Boundaries (class components with getDerivedStateFromError/componentDidCatch) catch errors in rendering below them.\nLibraries like react-error-boundary give a function-friendly API.\ntry/catch is still right for event handlers and async code.\nReact 19 adds onCaughtError/onUncaughtError on the root for reporting.",
          exercises: [
            {
              task: "Predict if the catch runs.",
              description: "Checks try/catch and JSX.",
              code: `try { return <Child />; }
catch { return <p>Error</p>; }`,
              answer: "No. <Child /> only creates an element; Child renders later, outside this try. Use an error boundary.",
            },
            {
              task: "Name where try/catch does work in React.",
              description: "Checks valid try/catch places.",
              code: "// event handlers, effects, async functions",
              answer: "In event handlers, effects and async code, where errors happen in your own call stack.",
            },
            {
              easy: true,
              task: "True or false: try/catch catches child render errors.",
              description: "Checks try/catch and JSX.",
              code: "try { return <Child />; } catch { return null; }",
              answer: "False. JSX just creates objects; children render later.",
            },
            {
              easy: true,
              task: "Name the tool that catches child render errors.",
              description: "Checks error boundaries.",
              code: "<?><Child /></?>",
              answer: "An error boundary.",
            },
          ]
        }
      ],
      middle: [
        {
          q: "Fix this error boundary. The data is fixed, but the widget still shows the error.",
          code: `<ErrorBoundary fallback={<p>Chart failed</p>}>
  <Chart data={data} />
</ErrorBoundary>`,
          short: "An Error Boundary stays in its error state until reset; provide resetKeys (or a key) tied to the inputs and a manual reset action.",
          long: "Once getDerivedStateFromError sets hasError, the boundary renders fallback forever.\nWhen data changes, the child might succeed, but the boundary never retries.\nreact-error-boundary's resetKeys resets when listed values change.\nAlternatively, change key on the boundary to remount it.\nAlso offer a Retry button via resetErrorBoundary.\nOn reset, clear caches that caused the error (e.g. queryClient reset).",
          fix: `<ErrorBoundary
  resetKeys={[data]}
  fallbackRender={({ resetErrorBoundary }) => (
    <div role="alert">
      <p>Chart failed</p>
      <button onClick={resetErrorBoundary}>Retry</button>
    </div>
  )}
>
  <Chart data={data} />
</ErrorBoundary>`,
          exercises: [
            {
              task: "Reset the boundary when data changes.",
              description: "Checks resetKeys.",
              code: "<ErrorBoundary fallback={<Err />}><Widget id={id} /></ErrorBoundary>",
              answer: "Pass resetKeys so a new id clears the error state.",
              solution: `<ErrorBoundary resetKeys={[id]} fallback={<Err />}>
  <Widget id={id} />
</ErrorBoundary>`,
            },
            {
              task: "Reset with a key instead.",
              description: "Checks remounting boundaries.",
              code: "<Boundary><Widget id={id} /></Boundary>",
              answer: "Set key={id} on the boundary; it remounts with clean state.",
              solution: "<Boundary key={id}><Widget id={id} /></Boundary>",
            },
            {
              easy: true,
              task: "Name what resets the boundary.",
              description: "Checks reset on change.",
              code: "<ErrorBoundary key={dataVersion}>",
              answer: "Change its key or resetKeys when data changes.",
            },
            {
              easy: true,
              task: "Predict the boundary without a reset.",
              description: "Checks sticky error state.",
              answer: "It keeps showing the fallback even after data is fixed.",
            },
          ]
        },
        {
          q: "Errors in click handlers and async code skip the error boundary. How can they reach it?",
          short: "They do not by default; either handle them locally, or rethrow them in render (setState(() => { throw err })), or use libraries/frameworks (useSuspenseQuery, actions) that surface them during render.",
          long: "Boundaries only catch errors thrown during render, lifecycle and constructors.\nEvent handler and promise errors bypass them.\nA common trick: setState(() => { throw error }) makes the error happen during render.\nreact-error-boundary provides useErrorBoundary().showBoundary(error).\nSuspense-based data libs throw on render, so boundaries catch fetch errors.\nForm actions in React 19: errors thrown in an action passed to <form action> propagate to the nearest boundary.",
          exercises: [
            {
              task: "Send a click error to the boundary.",
              description: "Checks showBoundary.",
              code: "onClick={async () => { await save(); }}",
              answer: "Catch and call showBoundary from react-error-boundary's useErrorBoundary.",
              solution: `const { showBoundary } = useErrorBoundary();
onClick={async () => { try { await save(); } catch (e) { showBoundary(e); } }}`,
            },
            {
              task: "Predict what happens with a transition.",
              description: "Checks errors thrown in actions.",
              code: "startTransition(async () => { await save(); }); // save throws",
              answer: "In React 19, errors thrown in a transition action go to the nearest error boundary.",
            },
            {
              easy: true,
              task: "Name the trick to send async errors to a boundary.",
              description: "Checks setState throw.",
              code: "setState(() => { throw err; });",
              answer: "Set state with an updater that throws, so it throws in render.",
            },
            {
              easy: true,
              task: "Name the react-error-boundary hook for this.",
              description: "Checks useErrorBoundary.",
              code: "const { showBoundary } = useErrorBoundary();",
              answer: "useErrorBoundary, which gives showBoundary(error).",
            },
          ]
        },
        {
          q: "What is the route error element in React Router? How do you tell a 404 from a crash?",
          short: "Each route can define an error element rendered when its loader, action or component throws; useRouteError() returns the error and isRouteErrorResponse() detects thrown Responses like 404.",
          long: "Errors bubble to the nearest route with errorElement (or ErrorBoundary export in framework mode).\nThe parent layout stays rendered, so only the failing section shows the error.\nThrow data(..., { status: 404 }) or new Response from loaders for expected HTTP errors.\nisRouteErrorResponse(err) separates those from real exceptions.\nShow friendly 404/403 pages and a generic message plus report for crashes.\nAlways have a root errorElement as last resort.",
          exercises: [
            {
              task: "Tell a 404 from a crash.",
              description: "Checks isRouteErrorResponse.",
              code: "function RouteError() { const err = useRouteError(); }",
              answer: "Check isRouteErrorResponse(err) and err.status === 404; anything else is a crash.",
              solution: `const err = useRouteError();
if (isRouteErrorResponse(err) && err.status === 404) return <NotFound />;
return <Crash />;`,
            },
            {
              task: "Throw a 404 from a loader.",
              description: "Checks throwing responses.",
              code: "const p = await getProduct(id);",
              answer: "Throw a Response or data() with status 404 so the error element handles it.",
              solution: "if (!p) throw data(\"Not found\", { status: 404 });",
            },
            {
              easy: true,
              task: "Name the route prop for errors.",
              description: "Checks errorElement.",
              code: "{ path: \"/users/:id\", element: <User />, ?: <Oops /> }",
              answer: "errorElement, rendered when the route throws.",
            },
            {
              easy: true,
              task: "Name the helper to detect a 404 response.",
              description: "Checks isRouteErrorResponse.",
              code: "if (isRouteErrorResponse(e) && e.status === 404)",
              answer: "isRouteErrorResponse, then check error.status.",
            },
          ]
        }
      ],
      senior: [
        {
          q: "Fix this error reporting. In production errors are sent twice. In development they are sent once.",
          code: `const root = createRoot(el);
window.addEventListener("error", e => report(e.error));
class AppBoundary extends React.Component {
  componentDidCatch(error) {
    if (process.env.NODE_ENV === "development") report(error);
  }
}`,
          short: "Use React 19 root options (onCaughtError, onUncaughtError, onRecoverableError) as the single reporting hook, and keep window handlers only for non-React errors with dedup.",
          long: "React rethrows uncaught errors in some paths, so both window.onerror and the boundary may report.\nThe env check is inverted: the boundary reports only in development.\nReact 19 createRoot accepts onCaughtError (caught by a boundary), onUncaughtError and onRecoverableError (e.g. hydration).\nCentralize reporting there with component stack (errorInfo.componentStack).\nKeep window error/unhandledrejection handlers for non-React code and dedupe by error identity.\nAttach release, route and user context; upload source maps.",
          fix: `const reported = new WeakSet();
function reportOnce(error, extra) {
  if (error && typeof error === "object") {
    if (reported.has(error)) return;
    reported.add(error);
  }
  report(error, extra);
}

const root = createRoot(el, {
  onCaughtError: (error, info) => reportOnce(error, { stack: info.componentStack, handled: true }),
  onUncaughtError: (error, info) => reportOnce(error, { stack: info.componentStack, handled: false }),
  onRecoverableError: (error) => reportOnce(error, { recoverable: true }),
});
window.addEventListener("unhandledrejection", e => reportOnce(e.reason));`,
          exercises: [
            {
              task: "Spot why errors are sent twice.",
              description: "Checks duplicate reporting paths.",
              code: `componentDidCatch(e) { report(e); }
window.addEventListener("error", e => report(e.error));`,
              answer: "Some errors reach both handlers in production. Report from one place, or dedupe by error identity.",
            },
            {
              task: "Use React 19 root error hooks.",
              description: "Checks createRoot error options.",
              code: "createRoot(el).render(<App />);",
              answer: "Pass onCaughtError and onUncaughtError to report once at the root.",
              solution: `createRoot(el, {
  onUncaughtError: report,
  onCaughtError: report,
}).render(<App />);`,
            },
            {
              easy: true,
              task: "Name a reason errors are sent twice.",
              description: "Checks duplicate reporting.",
              answer: "Both a boundary and a global handler report the same error.",
            },
            {
              easy: true,
              task: "Name a simple dedupe idea.",
              description: "Checks marking reported errors.",
              code: `if (err.__reported) return;
err.__reported = true;`,
              answer: "Mark the error object as reported and skip it next time.",
            },
          ]
        },
        {
          q: "How do you group errors in a React app? Think about expected, unexpected, and fatal errors.",
          ai: true,
          short: "Classify errors by who caused them and whether the user can recover, and map each class to a UI pattern, logging level and alert policy.",
          long: "Expected: validation, 404, permission, offline; show inline or page-level messages, do not page anyone.\nUnexpected: bugs, contract violations; boundary fallback + report.\nTransient: timeouts, 503; retry with backoff and keep stale data visible.\nFatal: auth expired, app version mismatch; redirect or force reload.\nModel errors as typed classes (ApiError with status, code) at the API layer.\nDocument the mapping so all teams handle errors consistently.",
          exercises: [
            {
              task: "Classify each error.",
              description: "Checks error categories.",
              code: "// 1) wrong password  2) null crash  3) app JS failed to load",
              answer: "1) Expected: show inline. 2) Unexpected: boundary and report. 3) Fatal: full page with reload.",
            },
            {
              task: "Spot the problem.",
              description: "Checks reporting expected errors.",
              code: "catch (e) { Sentry.captureException(e); } // 401 login fail",
              answer: "Expected errors like wrong password flood the error tool. Handle them in UI; report only unexpected ones.",
            },
            {
              easy: true,
              task: "Pick the group for a failed form validation.",
              description: "Checks expected errors.",
              code: "Email is already taken.",
              answer: "Expected: show it inline, do not page anyone.",
            },
            {
              easy: true,
              task: "Pick the group for a crash on app start.",
              description: "Checks fatal errors.",
              code: "Main bundle throws on load.",
              answer: "Fatal: show a full page and alert the team.",
            },
          ]
        },
        {
          q: "After a deploy, a lazy chunk fails to load. What happens, and how do you handle it?",
          short: "A failed dynamic import rejects and is thrown to the nearest Error Boundary; detect chunk load errors and offer a reload (new version), with a one-time automatic reload guard.",
          long: "After deploy, old clients request hashed chunks that no longer exist.\nReact.lazy rethrows the rejected import, so a boundary catches it.\nRecognize ChunkLoadError / 'Failed to fetch dynamically imported module'.\nReload once (guarded by sessionStorage) to fetch the new manifest.\nKeep previous assets available for a while on the CDN to reduce failures.\nVite emits vite:preloadError on window, which you can handle globally.",
          exercises: [
            {
              task: "Retry a failed chunk once with reload.",
              description: "Checks stale chunk recovery.",
              code: "const Page = lazy(() => import(\"./Page\"));",
              answer: "Catch the import error and reload once, using sessionStorage to avoid loops.",
              solution: `const Page = lazy(() => import("./Page").catch(e => {
  if (sessionStorage.getItem("r")) throw e;
  sessionStorage.setItem("r", "1"); location.reload();
  return new Promise(() => {});
}));`,
            },
            {
              task: "Name a deploy fix for missing chunks.",
              description: "Checks keeping old assets.",
              code: "// deploy deletes old JS files",
              answer: "Keep old hashed assets for some days after deploy, so open tabs can still load them.",
            },
            {
              easy: true,
              task: "Name the error type users see.",
              description: "Checks chunk load errors.",
              code: "import(\"./Chart.abc123.js\") // file deleted after deploy",
              answer: "A ChunkLoadError or failed dynamic import.",
            },
            {
              easy: true,
              task: "Name a common fix.",
              description: "Checks reload on chunk error.",
              code: "window.addEventListener(\"vite:preloadError\", () => location.reload());",
              answer: "Catch it and reload the page once to get new files.",
            },
          ]
        }
      ],
      techlead: [
        {
          q: `Review this shared request helper. During a backend outage it made the incident worse. What would you change?`,
          code: `export async function request(url, opts) {\n  for (;;) {\n    try {\n      const res = await fetch(url, opts);\n      if (!res.ok) throw new Error("HTTP " + res.status);\n      return await res.json();\n    } catch (e) {\n      await new Promise(r => setTimeout(r, 500));\n    }\n  }\n}`,
          short: `It retries forever, every 500 ms, for every error, including 400 and 401, and from every client at once. That floods a struggling backend. Use limited retries with exponential backoff and jitter, retry only safe and transient failures, respect Retry-After, and support abort.`,
          long: `Infinite retries never surface errors to the UI, so users see endless spinners.\nA fixed short delay from thousands of clients creates a retry storm that keeps the backend down.\nClient errors (400, 401, 403, 404) will not succeed on retry; only retry network errors, 408, 429 and 5xx.\nRetrying POST can create duplicates unless the API uses idempotency keys.\nUse exponential backoff with jitter, a max attempt count, and honor Retry-After.\nPass an AbortSignal so unmounted components stop retrying.\nAt scale, add a circuit breaker per service and prefer TanStack Query retry settings over custom loops.`,
          fix: `const RETRY = new Set([408, 429, 500, 502, 503, 504]);\nexport async function request(url, { signal, retries = 3, ...opts } = {}) {\n  for (let attempt = 0; ; attempt++) {\n    let res;\n    try {\n      res = await fetch(url, { ...opts, signal });\n    } catch (e) {\n      if (signal?.aborted || attempt >= retries) throw e;\n    }\n    if (res?.ok) return res.json();\n    if (res && (!RETRY.has(res.status) || attempt >= retries)) {\n      throw new HttpError(res.status);\n    }\n    const after = Number(res?.headers.get("Retry-After")) * 1000;\n    const backoff = Math.min(8000, 2 ** attempt * 300) * (0.5 + Math.random());\n    await sleep(after || backoff, signal);\n  }\n}`,
          exercises: [
            {
              task: "Spot what made the outage worse.",
              description: "Checks retry storms.",
              code: `async function req(u) {
  for (;;) { try { return await fetch(u); } catch {} }
}`,
              answer: "Endless instant retries flood the failing backend. Limit retries with exponential backoff and jitter.",
            },
            {
              task: "Add a timeout to the request.",
              description: "Checks AbortSignal.timeout.",
              code: "await fetch(url);",
              answer: "Use AbortSignal.timeout so hung requests do not pile up.",
              solution: "await fetch(url, { signal: AbortSignal.timeout(8000) });",
            },
            {
              easy: true,
              task: "Name the retry problem in outages.",
              description: "Checks retry storms.",
              code: "for (;;) { try { return await fetch(url); } catch {} }",
              answer: "Instant retries multiply load on a failing backend.",
            },
            {
              easy: true,
              task: "Name a safer retry strategy.",
              description: "Checks exponential backoff.",
              code: "delay = base * 2 ** attempt + random()",
              answer: "Exponential backoff with jitter and a retry limit.",
            },
          ],
        },
        {
          q: "How do you set reliability goals for the frontend? How do error numbers guide priorities?",
          ai: true,
          short: "Define user-centric SLOs (e.g. crash-free sessions, successful key journeys), measure via RUM and error tracking, and use error budget to decide between reliability and features.",
          long: "Pick metrics users feel: crash-free session rate, journey success rate, error-boundary fallback rate.\nSet targets per critical journey, not for every error.\nTie errors to releases so regressions block rollout (canary + automatic rollback).\nWhen the budget burns, prioritize fixes over features.\nReview top errors weekly with owners; close noise at the source.\nShare dashboards with product so trade-offs are visible.",
          exercises: [
            {
              task: "Write one frontend SLO.",
              description: "Checks defining SLOs.",
              code: "// checkout page",
              answer: "Example: 99.5% of checkout sessions have no uncaught error, and p75 INP under 200 ms, measured weekly.",
            },
            {
              task: "Use error data to prioritize.",
              description: "Checks impact-based priority.",
              code: "// error A: 5k events, 10 users. error B: 300 events, 250 users",
              answer: "Fix B first. Users affected matters more than event count.",
            },
            {
              easy: true,
              task: "Name a frontend reliability metric.",
              description: "Checks error-free sessions.",
              answer: "Percent of error-free sessions.",
            },
            {
              easy: true,
              task: "True or false: fix the most frequent error first.",
              description: "Checks impact priority.",
              answer: "Mostly true, but weigh frequency by user impact.",
            },
          ]
        },
        {
          q: "Bad data from the API crashed the app for all users. What do you change in the system?",
          short: "Validate data at the API boundary, add per-feature boundaries, contract tests with the backend, feature flags/kill switches, and a blameless postmortem with owners.",
          long: "Root cause is trusting unvalidated data deep in render.\nParse responses with schemas (zod/valibot) and fail at the edge with a typed error.\nContain impact with boundaries around features.\nAdd consumer-driven contract tests so backend changes fail CI.\nUse kill switches to disable a broken feature without deploy.\nFollow up with a blameless postmortem and tracked action items.",
          exercises: [
            {
              task: "Validate API data at the edge.",
              description: "Checks runtime schema validation.",
              code: "const user = await res.json();",
              answer: "Parse with zod so bad data fails in one place, not deep in render.",
              solution: `const User = z.object({ id: z.string(), name: z.string() });
const user = User.parse(await res.json());`,
            },
            {
              task: "Name a system change besides validation.",
              description: "Checks safe rollout.",
              code: "// API change broke all users at once",
              answer: "Contract tests between API and frontend, plus feature flags or canary releases to limit impact.",
            },
            {
              easy: true,
              task: "Name a tool to validate API data.",
              description: "Checks runtime validation.",
              code: "const user = User.parse(await res.json());",
              answer: "zod, which parses data at runtime.",
            },
            {
              easy: true,
              task: "Name the UI fix to limit damage.",
              description: "Checks local boundaries.",
              answer: "Error boundaries around features, so one bad response stays local.",
            },
          ]
        }
      ]
    },

    "Advanced Hooks (e.g useLayoutEffect, useImperativeHandle)": {
      junior: [
        {
          q: "What is the difference between useEffect and useLayoutEffect?",
          short: "useEffect runs after the browser paints; useLayoutEffect runs synchronously after DOM mutations but before paint, so you can measure and adjust layout without flicker.",
          long: "useEffect is the default for data fetching, subscriptions and logging.\nuseLayoutEffect blocks painting until it finishes, so keep it fast.\nUse it to read layout (getBoundingClientRect) and synchronously set state that changes position.\nIt does not run on the server; prefer useEffect there or guard.\nOveruse hurts performance because it delays paint.\nBoth have cleanup functions and the same dependency rules.",
          exercises: [
            {
              task: "Predict the log order.",
              description: "Checks effect timing.",
              code: `useLayoutEffect(() => log("layout"));
useEffect(() => log("effect"));
// paint`,
              answer: "\"layout\" before paint, then \"effect\" after paint. Layout effects run sync after DOM changes.",
            },
            {
              task: "Pick the hook for each task.",
              description: "Checks choosing effect type.",
              code: "// 1) fetch data  2) measure element before show",
              answer: "1) useEffect. 2) useLayoutEffect, to avoid a visible flicker.",
            },
            {
              easy: true,
              task: "Pick which runs before paint.",
              description: "Checks useLayoutEffect timing.",
              code: "useEffect(fn) vs useLayoutEffect(fn)",
              answer: "useLayoutEffect runs before paint; useEffect runs after.",
            },
            {
              easy: true,
              task: "Pick the hook for a data fetch.",
              description: "Checks default to useEffect.",
              code: "useEffect(() => { load(); }, []);",
              answer: "useEffect, since fetching does not need to block paint.",
            },
          ]
        },
        {
          q: "Fix this bug. The parent cannot focus the custom input.",
          code: `function TextInput(props) {
  return <input {...props} />;
}

function Form() {
  const ref = useRef(null);
  return (
    <>
      <TextInput ref={ref} />
      <button onClick={() => ref.current.focus()}>Focus</button>
    </>
  );
}`,
          short: "In React 18 function components need forwardRef to receive a ref; in React 19 ref is a regular prop, but the component must still pass it to the DOM element.",
          long: "Before React 19, ref on a function component was dropped (with a warning).\nforwardRef((props, ref) => ...) forwards it to the inner <input>.\nIn React 19 you can accept ref as a prop: function TextInput({ ref, ...props }).\nIn React 19 the spread actually passes ref through, but being explicit is clearer and works with types.\nforwardRef still works in 19 but will be deprecated.\nOnly expose refs when imperative access is truly needed (focus, scroll).",
          fix: `// React 19
function TextInput({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}

// React 18
const TextInput18 = forwardRef(function TextInput(props, ref) {
  return <input ref={ref} {...props} />;
});`,
          exercises: [
            {
              task: "Fix the ref in React 19.",
              description: "Checks ref as a prop.",
              code: `function Field(props) { return <input />; }
<Field ref={r} />`,
              answer: "In React 19 ref is a normal prop for function components. Pass it to the input.",
              solution: `function Field({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}`,
            },
            {
              task: "Fix it for React 18.",
              description: "Checks forwardRef.",
              code: "function Field(props) { return <input {...props} />; }",
              answer: "Wrap with forwardRef; ref is not a prop in React 18.",
              solution: "const Field = forwardRef((props, ref) => <input ref={ref} {...props} />);",
            },
            {
              easy: true,
              task: "Name what the custom input must do.",
              description: "Checks forwarding refs.",
              code: "<FancyInput ref={inputRef} /> // ref is null",
              answer: "Pass the ref to the inner input element.",
            },
            {
              easy: true,
              task: "Rewrite for React 19.",
              description: "Checks ref as a prop.",
              code: "const Input = forwardRef((p, ref) => <input ref={ref} />);",
              answer: "In React 19, ref is a normal prop for function components.",
              solution: "function Input({ ref }) { return <input ref={ref} />; }",
            },
          ]
        },
        {
          q: `What does useId do? Why not use Math.random for element ids?`,
          short: `useId returns a stable, unique id that is the same on the server and the client. Math.random gives a different value on each render and breaks hydration.`,
          long: `Labels and ARIA attributes need ids: htmlFor, aria-describedby, aria-labelledby.\nuseId() gives a unique string per component instance, stable across re-renders.\nIt matches between server rendering and hydration, so there is no mismatch.\nMath.random or a global counter changes between server and client, or between renders.\nDo not use useId for list keys. Keys must come from your data.\nFor several ids in one component, use one useId and add suffixes: id + "-email".`,
          exercises: [
            {
              task: "Fix the id.",
              description: "Checks random ids and hydration.",
              code: "const id = \"f-\" + Math.random();",
              answer: "Random ids differ between server and client and change each render. Use useId.",
              solution: "const id = useId();",
            },
            {
              task: "Use one useId for several elements.",
              description: "Checks id suffixes.",
              code: "// need ids for input and hint",
              answer: "Call useId once and add suffixes.",
              solution: `const id = useId();
<input id={id} aria-describedby={id + "-hint"} />
<p id={id + "-hint"}>8+ chars</p>`,
            },
            {
              easy: true,
              task: "Name the problem with Math.random ids.",
              description: "Checks SSR id mismatch.",
              code: "<input id={Math.random()} />",
              answer: "Server and client get different ids, causing hydration errors.",
            },
            {
              easy: true,
              task: "Fill in the label link.",
              description: "Checks useId usage.",
              code: `const id = useId();
<label htmlFor={?}>Name</label><input id={id} />`,
              answer: "Use the same id in htmlFor and id.",
            },
          ],
        }
      ],
      middle: [
        {
          q: "Fix this useImperativeHandle code. The parent calls play, but it uses old props.",
          code: `const Player = forwardRef(function Player({ src }, ref) {
  const videoRef = useRef(null);
  useImperativeHandle(ref, () => ({
    play: () => { videoRef.current.src = src; videoRef.current.play(); },
  }), []);
  return <video ref={videoRef} />;
});`,
          short: "The handle is created once because deps are empty, so play() closes over the first src; include src in deps or, better, set src declaratively.",
          long: "useImperativeHandle works like useMemo: the factory reruns when deps change.\nEmpty deps freeze closures over initial props.\nAdding src to deps updates the handle.\nBetter yet, set src declaratively via <video src={src}> and keep play() minimal.\nExpose a small, intention-revealing API, not the raw DOM node.\nIn React 19 you can take ref as a prop instead of forwardRef.",
          fix: `function Player({ src, ref }) {
  const videoRef = useRef(null);
  useImperativeHandle(ref, () => ({
    play: () => videoRef.current.play(),
    pause: () => videoRef.current.pause(),
  }), []);
  return <video ref={videoRef} src={src} />;
}`,
          exercises: [
            {
              task: "Fix the stale handle.",
              description: "Checks useImperativeHandle deps.",
              code: "useImperativeHandle(ref, () => ({ play: () => start(src) }), []);",
              answer: "Empty deps freeze the first src. Add src to deps.",
              solution: "useImperativeHandle(ref, () => ({ play: () => start(src) }), [src]);",
            },
            {
              task: "Predict what omitting the deps array does.",
              description: "Checks default handle updates.",
              code: "useImperativeHandle(ref, () => ({ play }));",
              answer: "Without deps, the handle is recreated every render, so it is always fresh but changes identity.",
            },
            {
              easy: true,
              task: "Spot why play uses old props.",
              description: "Checks stale handle.",
              code: "useImperativeHandle(ref, () => ({ play: () => start(src) }), []);",
              answer: "The handle is created once with empty deps.",
            },
            {
              easy: true,
              task: "Fix the dependency list.",
              description: "Checks handle deps.",
              code: "}), []);",
              answer: "Add src to the deps, or omit the array.",
              solution: "}), [src]);",
            },
          ]
        },
        {
          q: "What problem does useSyncExternalStore solve? How do you use it?",
          short: "It subscribes components to external mutable stores (browser APIs, custom stores) safely under concurrent rendering, preventing tearing between components.",
          long: "Concurrent rendering can read a mutable store at different times, producing inconsistent UI (tearing).\nuseSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) forces consistent reads.\ngetSnapshot must return a cached/immutable value; returning a new object each time loops.\ngetServerSnapshot provides the SSR value to avoid hydration mismatch.\nUsed internally by Redux, Zustand and others.\nGreat for navigator.onLine, matchMedia, or a small custom store.",
          exercises: [
            {
              task: "Subscribe to online status.",
              description: "Checks useSyncExternalStore.",
              code: "function useOnline() { /* your code */ }",
              answer: "Subscribe to online and offline events and read navigator.onLine.",
              solution: `const sub = cb => { addEventListener("online", cb); addEventListener("offline", cb);
  return () => { removeEventListener("online", cb); removeEventListener("offline", cb); }; };
function useOnline() {
  return useSyncExternalStore(sub, () => navigator.onLine, () => true);
}`,
            },
            {
              task: "Spot the tearing risk.",
              description: "Checks reading mutable stores in render.",
              code: "function Price() { return <b>{store.price}</b>; }",
              answer: "Reading mutable data directly does not re-render and may tear during concurrent renders. Use useSyncExternalStore.",
            },
            {
              easy: true,
              task: "Name the problem it solves.",
              description: "Checks tearing.",
              code: "Store value changes mid-render; two parts show different values.",
              answer: "Tearing: parts of the UI showing different store values.",
            },
            {
              easy: true,
              task: "Name the two main arguments.",
              description: "Checks subscribe and getSnapshot.",
              code: "useSyncExternalStore(subscribe, getSnapshot)",
              answer: "subscribe and getSnapshot.",
            },
          ]
        },
        {
          q: "An effect runs for a long time and needs the latest callback. How do you do it safely?",
          short: "Store the callback in a ref updated in a layout effect, or use React's useEffectEvent (stable in 19.2), so the effect does not resubscribe when the callback changes.",
          long: "Passing an inline callback into an effect's deps resubscribes on every render.\nOmitting it causes stale closures.\nThe 'latest ref' pattern: ref.current = cb in useLayoutEffect, then call ref.current() in the effect.\nReact 19.2 adds useEffectEvent for exactly this: a non-reactive event function used inside effects.\nDo not call effect events during render or pass them to children.\nKeep reactive values (like roomId) in deps; only the handler is non-reactive.",
          exercises: [
            {
              task: "Keep the latest callback in a ref.",
              description: "Checks latest-ref pattern.",
              code: `useEffect(() => {
  const id = setInterval(() => onTick(), 1000);
  return () => clearInterval(id);
}, []);`,
              answer: "onTick is stale. Store it in a ref updated each render, or use useEffectEvent.",
              solution: `const tick = useEffectEvent(() => onTick());
useEffect(() => {
  const id = setInterval(() => tick(), 1000);
  return () => clearInterval(id);
}, []);`,
            },
            {
              task: "Spot the misuse of useEffectEvent.",
              description: "Checks useEffectEvent rules.",
              code: `const onClick = useEffectEvent(save);
<button onClick={onClick} />`,
              answer: "Effect events are only for calling from effects, not as JSX handlers. Use a normal function here.",
            },
            {
              easy: true,
              task: "Name the hook to keep the latest callback.",
              description: "Checks useEffectEvent.",
              code: `useEffect(() => {
  const id = setInterval(() => onTick(), 1000);
  return () => clearInterval(id);
}, []);`,
              answer: "useEffectEvent, or a ref updated each render.",
            },
            {
              easy: true,
              task: "Fill in the ref update.",
              description: "Checks latest ref pattern.",
              code: `const cbRef = useRef(cb);
?`,
              answer: "Store the newest callback in the ref each render.",
              solution: "useLayoutEffect(() => { cbRef.current = cb; });",
            },
          ]
        }
      ],
      senior: [
        {
          q: "Fix this measuring hook. It warns on the server and the layout jumps.",
          code: `function useElementWidth(ref) {
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    setW(ref.current.offsetWidth);
  }, []);
  return w;
}`,
          short: "useLayoutEffect does nothing on the server, and this hook only measures once; use an isomorphic layout effect with ResizeObserver and render a sensible server fallback.",
          long: "On the server there is no layout, so the initial width is 0 and the client jumps.\nMeasuring once misses resizes; use ResizeObserver.\nUse useLayoutEffect on client, useEffect on server (isomorphic pattern) or CSS-first solutions.\nPrefer container queries/CSS when the goal is only styling.\nDisconnect the observer in cleanup.\nAvoid setState loops: only update when the width changed.",
          fix: `const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function useElementWidth(ref) {
  const [w, setW] = useState(null);
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setW(el.offsetWidth);
    const ro = new ResizeObserver(([entry]) => {
      setW(prev => (prev === entry.contentRect.width ? prev : entry.contentRect.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}`,
          exercises: [
            {
              task: "Fix the server warning.",
              description: "Checks isomorphic layout effect.",
              code: "useLayoutEffect(() => setW(ref.current.offsetWidth), []);",
              answer: "Older React warns about useLayoutEffect on the server. Use a safe wrapper that falls back to useEffect there.",
              solution: `const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;`,
            },
            {
              task: "Track size changes.",
              description: "Checks ResizeObserver.",
              code: "// width changes when sidebar toggles",
              answer: "Use a ResizeObserver on the element and disconnect in cleanup.",
              solution: `useEffect(() => {
  const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
  ro.observe(ref.current);
  return () => ro.disconnect();
}, []);`,
            },
            {
              easy: true,
              task: "Name why it warns on the server.",
              description: "Checks useLayoutEffect SSR.",
              code: "useLayoutEffect(() => measure(), []); // on the server",
              answer: "useLayoutEffect does nothing on the server, so React warns.",
            },
            {
              easy: true,
              task: "Name the browser API for size changes.",
              description: "Checks ResizeObserver.",
              code: "new ResizeObserver(([e]) => setW(e.contentRect.width))",
              answer: "ResizeObserver.",
            },
          ]
        },
        {
          q: "Explain useOptimistic and useActionState in React 19. When do you use them?",
          short: "useActionState wraps an async action and gives state, a form action and pending; useOptimistic shows a temporary optimistic value while an async transition runs and reverts automatically.",
          long: "useActionState(action, initialState) returns [state, formAction, isPending]; action receives (prevState, formData).\nIt integrates with <form action> and progressive enhancement in RSC frameworks.\nuseOptimistic(state, updateFn) returns an optimistic value plus a setter usable inside transitions/actions.\nWhen the action settles, the optimistic value is replaced by real state.\nReturn expected failures as state; throw unexpected ones.\nuseFormStatus gives pending info to nested submit buttons.",
          exercises: [
            {
              task: "Wire a form with useActionState.",
              description: "Checks action state and pending.",
              code: "async function save(prev, fd) { /* returns error or null */ }",
              answer: "useActionState gives state, a form action and isPending.",
              solution: `const [error, action, isPending] = useActionState(save, null);
<form action={action}>
  <button disabled={isPending}>Save</button>{error && <p>{error}</p>}
</form>`,
            },
            {
              task: "Predict the optimistic value after failure.",
              description: "Checks optimistic rollback.",
              code: "setOptimistic(n + 1); await api.like(); // throws",
              answer: "It returns to the real state when the action ends. useOptimistic values last only during the action.",
            },
            {
              easy: true,
              task: "Name the hook for form action state.",
              description: "Checks useActionState.",
              code: "const [state, action, pending] = useActionState(fn, null);",
              answer: "useActionState, which returns state, action and isPending.",
            },
            {
              easy: true,
              task: "Name what useOptimistic shows.",
              description: "Checks optimistic value.",
              code: "const [optimistic, addOptimistic] = useOptimistic(todos);",
              answer: "A temporary value until the action finishes.",
            },
          ]
        },
        {
          q: "What does the use hook do? How is it different from other hooks?",
          ai: true,
          short: "use() reads a promise (suspending until resolved) or a context; unlike other hooks it may be called conditionally and inside loops.",
          long: "use(promise) suspends the component until resolution and throws to Error Boundaries on rejection.\nThe promise must be stable (created outside render or cached), not created in the same render.\nIn RSC apps, servers can pass promises to client components that call use().\nuse(Context) works like useContext but can be inside if statements.\nIt cannot be used inside try/catch to catch suspension.\nPair with Suspense and Error Boundaries for loading and errors.",
          exercises: [
            {
              task: "Read a promise with use.",
              description: "Checks use() with Suspense.",
              code: "function Comments({ promise }) { /* render list */ }",
              answer: "use(promise) suspends until it resolves. Wrap with Suspense.",
              solution: `function Comments({ promise }) {
  const items = use(promise);
  return items.map(c => <p key={c.id}>{c.text}</p>);
}`,
            },
            {
              task: "Spot the bug.",
              description: "Checks creating promises in render.",
              code: "function C() { const data = use(fetch(\"/api\").then(r => r.json())); }",
              answer: "A new promise each render suspends forever. Create it once outside, cache it, or pass it from a parent.",
            },
            {
              easy: true,
              task: "True or false: use() can run inside an if.",
              description: "Checks use flexibility.",
              code: "if (show) { const v = use(Ctx); }",
              answer: "True. Unlike other hooks, use can be called conditionally.",
            },
            {
              easy: true,
              task: "Name what use() does with a promise.",
              description: "Checks use and Suspense.",
              code: "const user = use(fetchUser(id));",
              answer: "It suspends until the promise resolves, then returns the value.",
            },
          ]
        }
      ],
      techlead: [
        {
          q: "Fix this shared hook. Every user of it re-renders on each scroll event.",
          code: `export function useScroll() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const on = () => setPos({ x: scrollX, y: scrollY });
    window.addEventListener("scroll", on);
    return () => window.removeEventListener("scroll", on);
  }, []);
  return pos;
}
// consumer
const scrolled = useScroll().y > 0;`,
          short: "Expose a selector-based external store so consumers subscribe to the derived value they need; React only re-renders when the selected value changes.",
          long: "Every consumer holds full positions and re-renders on every scroll tick.\nMost consumers only need a boolean or threshold.\nUse one shared listener and useSyncExternalStore with a selector snapshot.\nPrimitive snapshots compare with Object.is, so 'scrolled' changes rarely.\nUse passive listeners and avoid layout reads in hot paths.\nDocument perf characteristics in the design system API.",
          fix: `const listeners = new Set();
function subscribe(cb) {
  if (listeners.size === 0) window.addEventListener("scroll", emit, { passive: true });
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0) window.removeEventListener("scroll", emit);
  };
}
function emit() { listeners.forEach(l => l()); }

export function useScrollSelector(select, serverValue) {
  return useSyncExternalStore(
    subscribe,
    () => select({ x: window.scrollX, y: window.scrollY }),
    () => serverValue
  );
}
// consumer
const scrolled = useScrollSelector(p => p.y > 0, false);`,
          exercises: [
            {
              task: "Throttle scroll updates.",
              description: "Checks reducing scroll re-renders.",
              code: "addEventListener(\"scroll\", () => setY(scrollY));",
              answer: "Updating state on every scroll event re-renders a lot. Use requestAnimationFrame to update once per frame.",
              solution: `let raf;
addEventListener("scroll", () => {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => setY(scrollY));
}, { passive: true });`,
            },
            {
              task: "Return a boolean instead of raw position.",
              description: "Checks narrowing hook output.",
              code: "const y = useScrollY(); const sticky = y > 100;",
              answer: "Return only isPastThreshold so callers re-render when the boolean flips, not each pixel.",
            },
            {
              easy: true,
              task: "Spot why everyone re-renders.",
              description: "Checks high-frequency state.",
              code: "window.addEventListener(\"scroll\", () => setY(scrollY));",
              answer: "Each scroll sets state in every hook user.",
            },
            {
              easy: true,
              task: "Name a fix for scroll updates.",
              description: "Checks derived boolean.",
              code: "setScrolled(scrollY > 100);",
              answer: "Store only what matters, like isScrolled, so updates are rare.",
            },
          ]
        },
        {
          q: "In a big codebase, what goes in hooks, what goes in components, and what goes in plain modules?",
          ai: true,
          short: "Hooks encapsulate stateful React logic tied to lifecycle, components own UI, and plain modules hold pure logic and I/O; keep the dependency direction UI -> hooks -> modules.",
          long: "Pure logic (formatting, validation) should be plain functions: easy to test, reusable outside React.\nHooks wrap React concerns: state, effects, subscriptions, context.\nComponents compose hooks and render; avoid business rules inside JSX.\nAvoid 'god hooks' that return 20 values; split by concern.\nDon't wrap a single useState in a hook just for naming.\nEnforce boundaries with folder conventions and lint rules (import restrictions).",
          exercises: [
            {
              task: "Place this logic.",
              description: "Checks hooks vs plain modules.",
              code: "function formatPrice(n, cur) { /* no React */ }",
              answer: "A plain module. It uses no React features, so it does not need to be a hook and is easy to test.",
            },
            {
              task: "Spot the wrong hook.",
              description: "Checks fake hooks.",
              code: "function useFormatDate(d) { return d.toLocaleDateString(); }",
              answer: "It calls no hooks, so the use prefix misleads and limits where it can be called. Rename to formatDate.",
            },
            {
              easy: true,
              task: "Pick where a date format helper goes.",
              description: "Checks plain modules.",
              code: "export const fmt = d => d.toLocaleDateString();",
              answer: "A plain module; it needs no React.",
            },
            {
              easy: true,
              task: "Pick where window size logic goes.",
              description: "Checks custom hooks.",
              code: "function useWindowSize() { const [s, set] = useState(...); }",
              answer: "A custom hook, since it uses state and effects.",
            },
          ]
        },
        {
          q: "Your team now uses React Compiler. Which hook patterns change? What do you tell the teams?",
          short: "The compiler auto-memoizes, so manual useMemo/useCallback/memo become mostly unnecessary, but rules of React (purity, no mutation during render) become strictly important and effects/refs patterns stay the same.",
          long: "React Compiler (stable 1.0 in late 2025) memoizes components and hooks at build time.\nCode that breaks the rules (mutating props, reading refs in render) gets skipped or misbehaves.\nKeep useMemo only as an explicit escape hatch (e.g. effect dependency identity), not by default.\nuseEffect, useLayoutEffect, useImperativeHandle and refs are unaffected.\nEnable eslint-plugin-react-hooks compiler rules to find violations.\nRoll out per directory and measure, using 'use no memo' to opt out problem files.",
          exercises: [
            {
              task: "Name what to remove with the compiler.",
              description: "Checks compiler impact.",
              code: "const onClick = useCallback(() => go(id), [id]);",
              answer: "Manual useMemo and useCallback are no longer needed for performance in new code. Keep them where identity matters for effects.",
            },
            {
              task: "Spot what the compiler cannot fix.",
              description: "Checks compiler limits.",
              code: "useEffect(() => { setFull(a + b); }, [a, b]);",
              answer: "Derived state in effects is still a design bug. The compiler memoizes; it does not remove bad effects.",
            },
            {
              easy: true,
              task: "Name hooks the compiler makes less needed.",
              description: "Checks auto memoization.",
              answer: "useMemo, useCallback and memo.",
            },
            {
              easy: true,
              task: "True or false: remove all memo calls at once.",
              description: "Checks careful cleanup.",
              answer: "False. Remove them slowly, with profiling and tests.",
            },
          ]
        }
      ]
    },

    "Server side rendering as a concept and/or deeper knowledge (native and/or Next.js)": {
      junior: [
        {
          q: "What is hydration?",
          short: "Hydration is React attaching event handlers and state to server-rendered HTML in the browser, reusing the existing DOM instead of re-creating it.",
          long: "The server sends HTML so users see content early.\nThe JS bundle loads and hydrateRoot walks the DOM, matching it with the component tree.\nAfter hydration the page becomes interactive.\nIf client output differs from server HTML, React reports a mismatch and may re-render client-side.\nUntil hydration completes, clicks may do nothing.\nSelective hydration in React 18+ prioritizes areas the user interacts with.",
          exercises: [
            {
              task: "Predict what happens before hydration.",
              description: "Checks HTML before hydration.",
              code: "// SSR page with <button onClick={buy}>",
              answer: "The button shows but clicks do nothing until JS loads and hydrates, attaching handlers.",
            },
            {
              task: "Hydrate a server-rendered app.",
              description: "Checks hydrateRoot.",
              code: "createRoot(document.getElementById(\"root\")).render(<App />);",
              answer: "Use hydrateRoot to reuse server HTML instead of replacing it.",
              solution: "hydrateRoot(document.getElementById(\"root\"), <App />);",
            },
            {
              easy: true,
              task: "Name the function that hydrates in React 18+.",
              description: "Checks hydrateRoot.",
              code: "hydrateRoot(document.getElementById(\"root\"), <App />);",
              answer: "hydrateRoot from react-dom/client.",
            },
            {
              easy: true,
              task: "Name what hydration attaches.",
              description: "Checks hydration purpose.",
              answer: "Event handlers and state to the server HTML.",
            },
          ]
        },
        {
          q: "Fix this Next.js component. It crashes with the error: window is not defined.",
          code: `export default function Theme() {
  const saved = localStorage.getItem("theme");
  return <div className={saved}>...</div>;
}`,
          short: "Components render on the server where window/localStorage do not exist; read browser APIs in an effect in a Client Component, or store the preference in a cookie readable by the server.",
          long: "In the App Router, components are Server Components by default, and Client Components are also prerendered on the server.\nTop-level localStorage access runs during server render and throws.\nMove browser access into useEffect inside a 'use client' component.\nThat causes a flash; for themes, a cookie read on the server avoids it.\nAlternatively, dynamic(() => import(...), { ssr: false }) inside a Client Component.\nKeep the server and client initial render identical.",
          fix: `"use client";
import { useEffect, useState } from "react";

export default function Theme({ children }) {
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    setTheme(localStorage.getItem("theme") ?? "light");
  }, []);
  return <div className={theme}>{children}</div>;
}`,
          exercises: [
            {
              task: "Fix the crash.",
              description: "Checks window access in effects.",
              code: "const w = window.innerWidth;",
              answer: "window is undefined on the server. Read it in an effect after mount.",
              solution: `const [w, setW] = useState(0);
useEffect(() => setW(window.innerWidth), []);`,
            },
            {
              task: "Load a browser-only component in Next.js.",
              description: "Checks dynamic import with ssr false.",
              code: "import Map from \"./Map\"; // uses window",
              answer: "Use next/dynamic with ssr: false inside a client component.",
              solution: "const Map = dynamic(() => import(\"./Map\"), { ssr: false });",
            },
            {
              easy: true,
              task: "Spot why it crashes on the server.",
              description: "Checks window in render.",
              code: "const w = window.innerWidth;",
              answer: "window does not exist on the server.",
            },
            {
              easy: true,
              task: "Name a safe place to read window.",
              description: "Checks effect for browser APIs.",
              code: "useEffect(() => setW(window.innerWidth), []);",
              answer: "Inside useEffect, which only runs in the browser.",
            },
          ]
        },
        {
          q: "What is the difference between SSR, SSG and ISR?",
          short: "SSR renders HTML per request, SSG renders at build time, and ISR serves static pages that are regenerated in the background after a revalidation period or on demand.",
          long: "SSR: fresh per request, personalized, higher server cost and TTFB.\nSSG: fastest, CDN cached, but stale until rebuild.\nISR: static speed plus periodic or on-demand updates (revalidatePath/revalidateTag).\nIn the App Router these are controlled by caching and dynamic APIs rather than separate functions.\nUsing cookies() or headers() makes a route dynamic.\nChoose per route based on freshness and personalization.",
          exercises: [
            {
              task: "Pick SSR, SSG or ISR.",
              description: "Checks rendering strategies.",
              code: "// 1) docs  2) user dashboard  3) product page, prices change hourly",
              answer: "1) SSG. 2) SSR or client. 3) ISR with revalidate of about an hour.",
            },
            {
              task: "Set ISR in the Next.js App Router.",
              description: "Checks revalidate.",
              code: "export default async function Page() { /* fetch products */ }",
              answer: "Export revalidate in seconds so the page regenerates at most that often.",
              solution: "export const revalidate = 3600;",
            },
            {
              easy: true,
              task: "Pick SSR, SSG or ISR for a blog.",
              description: "Checks SSG fit.",
              code: "Marketing blog, updated weekly.",
              answer: "SSG, since posts rarely change.",
            },
            {
              easy: true,
              task: "Name what ISR adds to SSG.",
              description: "Checks revalidation.",
              answer: "Rebuilding pages in the background after a set time.",
            },
          ]
        }
      ],
      middle: [
        {
          q: "Fix this hydration error. It comes from number formatting.",
          code: `"use client";
export function Price({ amount }) {
  return <span>{amount.toLocaleString()}</span>;
}`,
          short: "Server and browser may use different locales/time zones; pass an explicit locale (and currency) from the server so both render identical output.",
          long: "toLocaleString() without args uses the runtime default locale.\nThe server may be en-US while the user browser is de-DE.\nPass locale explicitly, decided on the server (Accept-Language, user settings).\nSame for dates: specify timeZone.\nsuppressHydrationWarning only hides one-level text mismatches and should be rare.\nCreate Intl formatters once and reuse them.",
          fix: `"use client";
export function Price({ amount, locale, currency }) {
  const text = new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
  return <span>{text}</span>;
}
// server: <Price amount={p.amount} locale={user.locale} currency="EUR" />`,
          exercises: [
            {
              task: "Fix the number formatting mismatch.",
              description: "Checks locale-dependent output.",
              code: "<p>{price.toLocaleString()}</p>",
              answer: "Server and browser locales differ. Pass an explicit locale and options.",
              solution: "<p>{price.toLocaleString(\"en-US\", { style: \"currency\", currency: \"USD\" })}</p>",
            },
            {
              task: "Name a tool to silence a known small mismatch.",
              description: "Checks suppressHydrationWarning.",
              code: "<time>{new Date().toISOString()}</time>",
              answer: "suppressHydrationWarning on that element, for one level only. Use rarely; fix the cause if possible.",
            },
            {
              easy: true,
              task: "Spot why numbers differ.",
              description: "Checks locale mismatch.",
              code: "n.toLocaleString()",
              answer: "Server and browser locales differ, so formatting differs.",
            },
            {
              easy: true,
              task: "Fix it with a fixed locale.",
              description: "Checks explicit locale.",
              code: "n.toLocaleString()",
              answer: "Pass an explicit locale so both sides match.",
              solution: "n.toLocaleString(\"en-US\")",
            },
          ]
        },
        {
          q: "How does data loading work in Next.js server components?",
          short: "Server Components are async and can await data directly (DB, fetch) on the server; results are rendered to RSC payload and HTML, with caching and streaming controlled by the framework.",
          long: "Fetch close to where data is used; requests are deduped within a render with fetch or React cache().\nStart independent requests in parallel to avoid waterfalls.\nWrap slow parts in <Suspense> to stream them.\nSecrets stay on the server; protect server modules with 'server-only'.\nMutations go through Server Actions followed by revalidation.\nIn Next 15+, fetch is not cached by default; opt in with caching APIs ('use cache' in newer versions).",
          exercises: [
            {
              task: "Fetch data in a Server Component.",
              description: "Checks async server components.",
              code: "export default function Page() { /* load products */ }",
              answer: "Make the component async and await data directly.",
              solution: `export default async function Page() {
  const products = await db.product.findMany();
  return <List items={products} />;
}`,
            },
            {
              task: "Fix the waterfall.",
              description: "Checks parallel fetches.",
              code: `const user = await getUser();
const posts = await getPosts();`,
              answer: "They do not depend on each other. Run in parallel with Promise.all.",
              solution: "const [user, posts] = await Promise.all([getUser(), getPosts()]);",
            },
            {
              easy: true,
              task: "True or false: Server Components can be async.",
              description: "Checks async components.",
              code: `export default async function Page() {
  const data = await getData();
}`,
              answer: "True. They can await data directly.",
            },
            {
              easy: true,
              task: "Name where the fetch runs here.",
              description: "Checks server data fetching.",
              answer: "On the server, so no data code goes to the browser.",
            },
          ]
        },
        {
          q: "What are Server Actions? What security risks do they have?",
          ai: true,
          short: "Server Actions are async server functions marked 'use server' that clients can call (often via forms); they are public HTTP endpoints, so they need authentication, authorization and input validation.",
          long: "Each action gets an ID and can be invoked by POST from the browser.\nThey support progressive enhancement with <form action>.\nNever trust arguments: validate with a schema.\nCheck session and permissions inside the action, not just in the page.\nClosed-over values are encrypted but still should not hold secrets.\nAfter mutation, call revalidatePath/revalidateTag or redirect.",
          exercises: [
            {
              task: "Spot the security hole.",
              description: "Checks auth in Server Actions.",
              code: `"use server";
export async function deletePost(id) { await db.post.delete({ where: { id } }); }`,
              answer: "Server Actions are public endpoints. Check the session and ownership inside the action.",
            },
            {
              task: "Validate action input.",
              description: "Checks input validation.",
              code: "export async function rename(fd) { await save(fd.get(\"name\")); }",
              answer: "Validate with zod; the client can send anything.",
              solution: `const name = z.string().min(1).max(80).parse(fd.get("name"));
await save(name);`,
            },
            {
              easy: true,
              task: "Name the directive for a Server Action.",
              description: "Checks use server.",
              answer: "\"use server\" at the top of the function or file.",
            },
            {
              easy: true,
              task: "Spot the security gap.",
              description: "Checks auth in actions.",
              code: `"use server";
export async function del(id) { await db.delete(id); }`,
              answer: "No auth check; anyone can call this action.",
            },
          ]
        }
      ],
      senior: [
        {
          q: "Fix this page. The whole page waits for the slow recommendations call.",
          code: `export default async function Product({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  const recs = await getRecommendations(id); // 2s
  return (
    <>
      <ProductView product={product} />
      <Recs items={recs} />
    </>
  );
}`,
          short: "Awaiting slow data at the top blocks the response; move it into an async child wrapped in <Suspense> so the shell and product stream first.",
          long: "Next.js can stream HTML in chunks, but only at Suspense boundaries.\nThe top-level await of recommendations delays TTFB for everything.\nMove the slow fetch into its own async component inside <Suspense fallback>.\nStart fetches in parallel if both are needed early.\nloading.tsx creates a route-level Suspense boundary, but finer boundaries are better.\nKeep critical content (product) outside fallbacks for SEO and LCP.",
          fix: `export default async function Product({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  return (
    <>
      <ProductView product={product} />
      <Suspense fallback={<RecsSkeleton />}>
        <RecsSection id={id} />
      </Suspense>
    </>
  );
}

async function RecsSection({ id }) {
  const recs = await getRecommendations(id);
  return <Recs items={recs} />;
}`,
          exercises: [
            {
              task: "Stream the slow part.",
              description: "Checks Suspense boundaries in RSC.",
              code: `const recs = await getRecs(); // 3s
return <><Main /><Recs items={recs} /></>;`,
              answer: "Move the slow fetch into its own component and wrap it in Suspense.",
              solution: `return <><Main />
  <Suspense fallback={<Skel />}><Recs /></Suspense></>;
// Recs is async and awaits getRecs()`,
            },
            {
              task: "Add a route-level loading UI in Next.js.",
              description: "Checks loading.js.",
              code: "app/products/page.tsx",
              answer: "Add app/products/loading.tsx; Next wraps the page in Suspense with it.",
            },
            {
              easy: true,
              task: "Name what lets the page show without the slow part.",
              description: "Checks Suspense streaming.",
              code: "<Suspense fallback={<Skeleton />}><Recs /></Suspense>",
              answer: "A Suspense boundary around recommendations.",
            },
            {
              easy: true,
              task: "Predict the page without Suspense.",
              description: "Checks blocking await.",
              answer: "The whole page waits for the slowest request.",
            },
          ]
        },
        {
          q: "Explain the cache layers in Next.js. How do you avoid old data or data leaks?",
          short: "There are request memoization, the data cache, the full route cache (static rendering) and the client router cache; personalization must be dynamic or keyed per user, and mutations must revalidate the right tags.",
          long: "Request memoization dedupes identical fetches during one render.\nData cache persists fetch/'use cache' results across requests until revalidated.\nFull route cache stores prerendered HTML/RSC payload for static routes.\nRouter cache keeps visited segments in the browser for fast back/forward.\nUser-specific data must never land in a shared cache; cached functions must not read request data inside.\nUse tags (revalidateTag/updateTag) for precise invalidation after mutations.",
          exercises: [
            {
              task: "Opt this fetch out of caching.",
              description: "Checks no-store fetch.",
              code: "await fetch(\"/api/cart\");",
              answer: "Per-user data must not be cached. Use cache: \"no-store\".",
              solution: "await fetch(\"/api/cart\", { cache: \"no-store\" });",
            },
            {
              task: "Refresh cached data after a mutation.",
              description: "Checks revalidateTag.",
              code: "// product updated in admin",
              answer: "Tag the fetch and call revalidateTag in the Server Action after the update.",
              solution: `fetch(url, { next: { tags: ["products"] } });
// in the action:
revalidateTag("products");`,
            },
            {
              easy: true,
              task: "Name one Next.js cache layer.",
              description: "Checks data cache.",
              answer: "The data cache for fetch results.",
            },
            {
              easy: true,
              task: "Name how to avoid caching user data.",
              description: "Checks no-store.",
              code: "fetch(url, { cache: \"no-store\" })",
              answer: "Use cache: \"no-store\" for per-user fetches.",
            },
          ]
        },
        {
          q: "How do you build streaming SSR without a framework?",
          ai: true,
          short: "On the server use renderToPipeableStream with onShellReady to start piping HTML and bootstrapScripts for hydration; on the client call hydrateRoot with the same tree and data.",
          long: "renderToPipeableStream(<App/>, { bootstrapScripts, onShellReady, onShellError, onAllReady, onError }).\nPipe on onShellReady for users, onAllReady for crawlers that need full HTML.\nSuspense boundaries stream later with inline swap scripts.\nSerialize initial data into the HTML (escaped) so the client renders the same output.\nSet the status code before piping; shell errors should send a fallback page.\nOn the edge/Web streams use renderToReadableStream.",
          exercises: [
            {
              task: "Send headers only when the shell is ready.",
              description: "Checks onShellReady.",
              code: "renderToPipeableStream(<App />, { /* ? */ });",
              answer: "Pipe in onShellReady; handle onShellError with a 500 page.",
              solution: `const s = renderToPipeableStream(<App />, {
  onShellReady() { res.statusCode = 200; s.pipe(res); },
  onShellError() { res.statusCode = 500; res.end("Error"); },
});`,
            },
            {
              task: "Name what to do for bots.",
              description: "Checks onAllReady.",
              code: "// crawler requests the page",
              answer: "Wait for onAllReady before piping, so bots get the full HTML in one go.",
            },
            {
              easy: true,
              task: "Name the server API for streaming in Node.",
              description: "Checks renderToPipeableStream.",
              answer: "renderToPipeableStream, piped to the response.",
            },
            {
              easy: true,
              task: "Name the callback when the shell is ready.",
              description: "Checks onShellReady.",
              code: "renderToPipeableStream(<App />, { onShellReady() { s.pipe(res); } })",
              answer: "onShellReady, where you start piping.",
            },
          ]
        }
      ],
      techlead: [
        {
          q: "Fix this design. The root layout is a client component, so the whole app ships as client code.",
          code: `// app/layout.tsx
"use client";
import { ThemeProvider } from "./theme";
import { useState } from "react";
export default function RootLayout({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <html><body>
      <ThemeProvider>
        <Sidebar open={open} onToggle={() => setOpen(o => !o)} />
        {children}
      </ThemeProvider>
    </body></html>
  );
}`,
          short: "Keep layouts as Server Components and push 'use client' down to leaf interactive pieces; providers can be client components that receive server-rendered children.",
          long: "'use client' at the root makes every imported module part of the client graph.\nServer Components passed as children to a client provider stay server-rendered.\nExtract the interactive sidebar toggle into its own client component.\nWrap providers in a small 'use client' Providers component.\nAudit bundles with the Next bundle analyzer after the change.\nSet a team rule: 'use client' only on leaves, reviewed in PRs.",
          fix: `// app/providers.tsx
"use client";
export function Providers({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

// app/sidebar.tsx
"use client";
export function Sidebar() {
  const [open, setOpen] = useState(false);
  return <nav data-open={open}><button onClick={() => setOpen(o => !o)}>Menu</button></nav>;
}

// app/layout.tsx (Server Component)
export default function RootLayout({ children }) {
  return (
    <html><body>
      <Providers>
        <Sidebar />
        {children}
      </Providers>
    </body></html>
  );
}`,
          exercises: [
            {
              task: "Fix the root layout.",
              description: "Checks keeping layouts server-side.",
              code: `"use client";
export default function RootLayout({ children }) { const [o, setO] = useState(false); /* ... */ }`,
              answer: "Move the state into a small client component; keep the layout a Server Component.",
              solution: `export default function RootLayout({ children }) {
  return <html><body><MenuToggle />{children}</body></html>;
}`,
            },
            {
              task: "Spot the problem.",
              description: "Checks client boundary spread.",
              code: "\"use client\"; // in providers.tsx wrapping everything",
              answer: "Providers as client is fine if children are passed through. Importing pages into it would make them client code.",
            },
            {
              easy: true,
              task: "Spot the problem.",
              description: "Checks client root layout.",
              code: `"use client";
export default function RootLayout({ children }) {}`,
              answer: "\"use client\" at the root makes all children client code.",
            },
            {
              easy: true,
              task: "Name the fix.",
              description: "Checks small client islands.",
              answer: "Move client parts into small client components.",
            },
          ]
        },
        {
          q: "You have many products. How do you choose between SSR, SSG, client rendering and server components?",
          ai: true,
          short: "Decide per surface based on SEO, personalization, interactivity, freshness and infra cost; standardize on a framework that supports mixing them per route.",
          long: "Marketing and docs: static with ISR, best for SEO and cost.\nLogged-in apps: CSR or SSR shell with client data; RSC can reduce JS for heavy read pages.\nCommerce: hybrid; static product content plus dynamic prices/cart.\nConsider ops: SSR needs scalable servers, caching and observability.\nTeam skills and migration risk matter as much as performance.\nMeasure with Core Web Vitals per surface and revisit.",
          exercises: [
            {
              task: "Pick a strategy for each product.",
              description: "Checks matching rendering to needs.",
              code: "// 1) blog  2) analytics app  3) e-commerce",
              answer: "Blog: SSG. Analytics behind login: client or RSC. E-commerce: SSR or ISR with streaming.",
            },
            {
              task: "Name the main question for the choice.",
              description: "Checks decision criteria.",
              code: "// SSR vs CSR",
              answer: "How fresh and personal is the data, and do anonymous users need fast first paint and SEO?",
            },
            {
              easy: true,
              task: "Pick a mode for a logged-in dashboard.",
              description: "Checks client rendering fit.",
              code: "Internal analytics app behind login.",
              answer: "Client rendering, since SEO does not matter.",
            },
            {
              easy: true,
              task: "Pick a mode for a docs site.",
              description: "Checks static generation.",
              answer: "SSG, since content rarely changes.",
            },
          ]
        },
        {
          q: "How do you run SSR in production in a reliable way?",
          short: "Treat the SSR tier as a backend service: set render and data timeouts, fall back to a client-rendered shell on failure, cache aggressively, and monitor render latency, errors and memory.",
          long: "Slow downstream APIs directly increase TTFB; use timeouts and Suspense so slow parts stream or fall back.\nOn shell errors, serve a minimal CSR shell instead of 500 when possible.\nWatch for memory leaks from module-level state (it is shared across requests).\nTrace requests with OpenTelemetry (Next.js has instrumentation.ts).\nCDN-cache public pages; vary only on what matters.\nLoad test before launches and set autoscaling on CPU/latency.",
          exercises: [
            {
              task: "Name two production SSR safeguards.",
              description: "Checks SSR reliability.",
              code: "// Node SSR server",
              answer: "Render timeouts with a client fallback, and health checks plus autoscaling. Cache public pages at the CDN.",
            },
            {
              task: "Spot the memory leak.",
              description: "Checks shared server state.",
              code: "const cache = {}; // module level, filled per request",
              answer: "Module state is shared by all requests, so it grows and can leak data between users. Scope per request.",
            },
            {
              easy: true,
              task: "Name a must-have for SSR servers.",
              description: "Checks timeouts.",
              answer: "Timeouts on data calls so one slow API does not hang requests.",
            },
            {
              easy: true,
              task: "Name a fallback when SSR fails.",
              description: "Checks CSR fallback.",
              answer: "Serve the client-rendered shell instead of an error.",
            },
          ]
        }
      ]
    },

    "Performance Optimization in React": {
      junior: [
        {
          q: `Fix this component. It does slow work on every render, even when nothing changed.`,
          code: `function Report({ rows, theme }) {\n  const [sortDir, setSortDir] = useState("asc");\n  const sorted = [...rows].sort((a, b) =>\n    sortDir === "asc" ? a.total - b.total : b.total - a.total\n  );\n  const stats = calculateStats(rows); // slow\n  return <Table rows={sorted} stats={stats} theme={theme} onSort={setSortDir} />;\n}`,
          short: `Sorting and calculateStats run on every render, including renders caused only by theme. Wrap them in useMemo with the right dependencies, after measuring that they are slow.`,
          long: `Any re-render, for example a theme change, runs all code in the component again.\nuseMemo caches a result until its dependencies change.\nsorted depends on rows and sortDir; stats depends only on rows.\nMeasure first with the Profiler or console.time; small arrays do not need memoization.\nIf the React Compiler is enabled, it can add this memoization automatically.\nDo not memoize everything; memoize slow work and values passed to memoized children.`,
          fix: `function Report({ rows, theme }) {\n  const [sortDir, setSortDir] = useState("asc");\n  const sorted = useMemo(\n    () => [...rows].sort((a, b) =>\n      sortDir === "asc" ? a.total - b.total : b.total - a.total),\n    [rows, sortDir]\n  );\n  const stats = useMemo(() => calculateStats(rows), [rows]);\n  return <Table rows={sorted} stats={stats} theme={theme} onSort={setSortDir} />;\n}`,
          exercises: [
            {
              task: "Memoize the slow work.",
              description: "Checks useMemo.",
              code: "const sorted = bigList.toSorted(compare);",
              answer: "Wrap it in useMemo with its inputs so it reruns only when they change.",
              solution: "const sorted = useMemo(() => bigList.toSorted(compare), [bigList]);",
            },
            {
              task: "Spot the wasted memo.",
              description: "Checks unnecessary useMemo.",
              code: "const label = useMemo(() => \"Hi \" + name, [name]);",
              answer: "String concat is cheap; memo adds overhead. Use useMemo only for expensive work or stable identity.",
            },
            {
              easy: true,
              task: "Name the hook to cache slow work.",
              description: "Checks useMemo.",
              code: "const r = useMemo(() => heavy(data), [data]);",
              answer: "useMemo, which recomputes only when deps change.",
            },
            {
              easy: true,
              task: "Predict when useMemo recomputes.",
              description: "Checks deps.",
              code: "useMemo(() => sort(items), [items])",
              answer: "Only when items changes.",
            },
          ],
        },
        {
          q: "What is React memo? When should you use it?",
          short: "React.memo skips re-rendering a component when its props are shallowly equal to the previous ones; use it for expensive components that receive the same props often.",
          long: "By default a parent re-render re-renders all children.\nmemo compares props shallowly with Object.is.\nNew object/function props each render defeat memo, so stabilize them (useMemo/useCallback) or let React Compiler do it.\nDon't wrap everything: the comparison has a cost and adds complexity.\nMeasure with the Profiler first.\nState or context changes inside the memoized component still re-render it.",
          exercises: [
            {
              task: "Predict if the memo component re-renders.",
              description: "Checks memo shallow compare.",
              code: `const Row = memo(RowImpl);
<Row data={{ id: 1 }} />`,
              answer: "Yes, every time. The inline object is a new reference, so the shallow compare fails.",
            },
            {
              task: "Write a custom compare for memo.",
              description: "Checks memo arePropsEqual.",
              code: "const Row = memo(RowImpl);",
              answer: "Pass a second argument that returns true when props are equal.",
              solution: `const Row = memo(RowImpl, (a, b) => a.item.id === b.item.id
  && a.item.version === b.item.version);`,
            },
            {
              easy: true,
              task: "Name what memo skips.",
              description: "Checks memo behavior.",
              answer: "Re-renders when props are shallowly equal.",
            },
            {
              easy: true,
              task: "Predict if memo helps here.",
              description: "Checks inline props break memo.",
              code: `const Row = memo(R);
<Row style={{}} />`,
              answer: "No. The inline object is new each render.",
            },
          ]
        },
        {
          q: "What is code splitting? How do you do it in React?",
          short: "Code splitting loads parts of the bundle on demand; in React use React.lazy with dynamic import() and <Suspense> for a loading fallback.",
          long: "Big bundles delay first load and interactivity.\nconst Page = lazy(() => import('./Page')) creates a separate chunk.\nWrap lazy components in <Suspense fallback={<Spinner/>}>.\nSplit by routes and heavy features (editors, charts), not tiny components.\nlazy needs a default export (or map named exports).\nUse a bundle analyzer to find big dependencies.",
          exercises: [
            {
              task: "Split a heavy modal.",
              description: "Checks lazy for rare UI.",
              code: "import Editor from \"./Editor\"; // 400 KB, opened rarely",
              answer: "Lazy load it and render inside Suspense only when open.",
              solution: `const Editor = lazy(() => import("./Editor"));
{open && <Suspense fallback={<Spin />}><Editor /></Suspense>}`,
            },
            {
              task: "Lazy load a named export.",
              description: "Checks lazy default export rule.",
              code: "export function Chart() {} // in charts.js",
              answer: "lazy needs a default export. Map it in the import.",
              solution: `const Chart = lazy(() =>
  import("./charts").then(m => ({ default: m.Chart })));`,
            },
            {
              easy: true,
              task: "Name the syntax that splits code.",
              description: "Checks dynamic import.",
              code: "const m = await import(\"./chart\");",
              answer: "Dynamic import(), which makes a separate chunk.",
            },
            {
              easy: true,
              task: "Name the React helper for lazy components.",
              description: "Checks React.lazy.",
              answer: "React.lazy, used with Suspense.",
            },
          ]
        }
      ],
      middle: [
        {
          q: `The chart page uses React lazy. Users wait two seconds after clicking the Charts tab. How do you make it feel instant?`,
          code: `const Charts = lazy(() => import("./Charts"));\n\nfunction Tabs() {\n  const [tab, setTab] = useState("table");\n  return (\n    <>\n      <button onClick={() => setTab("charts")}>Charts</button>\n      <Suspense fallback={<Spinner />}>\n        {tab === "charts" ? <Charts /> : <Table />}\n      </Suspense>\n    </>\n  );\n}`,
          short: `The chunk download starts only on click. Preload it on hover or focus, or when the browser is idle, and switch tabs inside startTransition so the old tab stays visible instead of a spinner.`,
          long: `lazy calls the import function only on first render of Charts, so the network wait starts at the click.\nKeep the import function in a variable and call it early: on pointerenter, on focus, or in requestIdleCallback after the page loads.\nThe module cache means the second call reuses the same request.\nWrap setTab in startTransition: React keeps showing the table while Charts loads, instead of replacing it with the fallback.\nUse isPending to show a small loading hint on the tab.\nCheck the chunk size too; a big chart library may need its own split.`,
          fix: `const loadCharts = () => import("./Charts");\nconst Charts = lazy(loadCharts);\n\nfunction Tabs() {\n  const [tab, setTab] = useState("table");\n  const [isPending, startTransition] = useTransition();\n  return (\n    <>\n      <button\n        onPointerEnter={loadCharts}\n        onFocus={loadCharts}\n        onClick={() => startTransition(() => setTab("charts"))}\n      >\n        Charts {isPending && "…"}\n      </button>\n      <Suspense fallback={<Spinner />}>\n        {tab === "charts" ? <Charts /> : <Table />}\n      </Suspense>\n    </>\n  );\n}`,
          exercises: [
            {
              task: "Preload the chart chunk.",
              description: "Checks preloading lazy modules.",
              code: "const Charts = lazy(() => import(\"./Charts\"));",
              answer: "Start the import on hover or idle so it is ready on click.",
              solution: `const load = () => import("./Charts");
const Charts = lazy(load);
<Tab onMouseEnter={load}>Charts</Tab>`,
            },
            {
              task: "Keep the old tab visible while loading.",
              description: "Checks transitions with Suspense.",
              code: "onClick={() => setTab(\"charts\")}",
              answer: "Wrap the change in startTransition so React keeps the old UI instead of the fallback.",
              solution: "onClick={() => startTransition(() => setTab(\"charts\"))}",
            },
            {
              easy: true,
              task: "Name a way to make the tab feel instant.",
              description: "Checks prefetch on hover.",
              code: "onMouseEnter={() => import(\"./Charts\")}",
              answer: "Preload the chunk on hover or idle time.",
            },
            {
              easy: true,
              task: "True or false: lazy chunks load before the click.",
              description: "Checks lazy timing.",
              answer: "False. They load on first render unless you preload them.",
            },
          ],
        },
        {
          q: "How do you show a list of ten thousand rows quickly?",
          short: "Virtualize the list so only visible rows (plus overscan) are in the DOM, using libraries like TanStack Virtual or react-window.",
          long: "Rendering 10k DOM nodes costs memory, layout and render time.\nVirtualization renders a window of rows and positions them in a scroll container.\nKnown row heights are simplest; dynamic heights need measurement.\nKeep row components memoized and keys stable.\nConsider pagination or server-side filtering when users cannot use 10k rows anyway.\nMind accessibility: ARIA row counts and keyboard navigation.",
          exercises: [
            {
              task: "Virtualize a long list.",
              description: "Checks TanStack Virtual basics.",
              code: "rows.map(r => <Row key={r.id} row={r} />) // 10,000 rows",
              answer: "Render only visible rows with useVirtualizer.",
              solution: `const v = useVirtualizer({ count: rows.length,
  getScrollElement: () => ref.current, estimateSize: () => 36 });
v.getVirtualItems().map(i => <Row key={i.key} row={rows[i.index]} />)`,
            },
            {
              task: "Name a CSS-only option.",
              description: "Checks content-visibility.",
              code: ".row { }",
              answer: "content-visibility: auto with contain-intrinsic-size lets the browser skip off-screen rows. React still renders them.",
            },
            {
              easy: true,
              task: "Name the technique for long lists.",
              description: "Checks virtualization.",
              answer: "Virtualization: render only visible rows.",
            },
            {
              easy: true,
              task: "Name a library for it.",
              description: "Checks virtualization libraries.",
              answer: "TanStack Virtual or react-window.",
            },
          ]
        },
        {
          q: "How do you find what is slow in a React app before you optimize?",
          ai: true,
          short: "Reproduce on realistic devices, measure with React DevTools Profiler and the Chrome Performance panel, identify the costly component or task, then fix and re-measure.",
          long: "Start from a user-visible metric: INP, LCP, or a slow interaction.\nRecord a Profiler session to see which components rendered and why (enable 'record why').\nUse the Performance panel for long tasks, layout thrash and network.\nCheck production builds; dev mode is much slower.\nFix the biggest cost first and verify improvement.\nAdd RUM (web-vitals) to see real users.",
          exercises: [
            {
              task: "Name the tool for each question.",
              description: "Checks profiling tools.",
              code: "// 1) which component renders a lot  2) long JS tasks",
              answer: "1) React DevTools Profiler. 2) Chrome Performance panel for long tasks and INP.",
            },
            {
              task: "Measure a render in code.",
              description: "Checks the Profiler component.",
              code: "<Dashboard />",
              answer: "Wrap with <Profiler id onRender> to log actualDuration.",
              solution: `<Profiler id="dash" onRender={(id, phase, ms) => log(id, phase, ms)}>
  <Dashboard />
</Profiler>`,
            },
            {
              easy: true,
              task: "Name the React tool for render timing.",
              description: "Checks Profiler.",
              answer: "The React DevTools Profiler.",
            },
            {
              easy: true,
              task: "Name the browser tool for long tasks.",
              description: "Checks Performance panel.",
              answer: "Chrome DevTools Performance panel.",
            },
          ]
        }
      ],
      senior: [
        {
          q: "Fix this dashboard. It waits for three requests, one after another.",
          code: `function Dashboard() {
  const [user, setUser] = useState(null);
  useEffect(() => { getUser().then(setUser); }, []);
  if (!user) return <Spinner />;
  return <Teams userId={user.id} />;
}
function Teams({ userId }) {
  const [teams, setTeams] = useState(null);
  useEffect(() => { getTeams(userId).then(setTeams); }, [userId]);
  if (!teams) return <Spinner />;
  return <Stats teamIds={teams.map(t => t.id)} />;
}`,
          short: "Fetch-on-render creates request waterfalls; start requests as early as possible (route loader, server, or a query prefetch) and parallelize independent ones.",
          long: "Each child only starts fetching after its parent rendered with data.\nThree round trips add up, especially on mobile latency.\nMove fetching to the route loader or server, where requests can start earlier.\nIf data is truly dependent, fetch it in one backend endpoint (BFF) or prefetch.\nTanStack Query ensureQueryData/prefetchQuery in loaders reduces waterfalls while keeping caching.\nMeasure in the network panel: the requests should overlap.",
          fix: `export async function loader() {
  const user = await queryClient.ensureQueryData(userQuery());
  const teams = await queryClient.ensureQueryData(teamsQuery(user.id));
  queryClient.prefetchQuery(statsQuery(teams.map(t => t.id)));
  return null;
}
// Better: one BFF endpoint /api/dashboard returns user, teams and stats together.

function Dashboard() {
  const { data: user } = useSuspenseQuery(userQuery());
  const { data: teams } = useSuspenseQuery(teamsQuery(user.id));
  return <Suspense fallback={<StatsSkeleton />}><Stats teamIds={teams.map(t => t.id)} /></Suspense>;
}`,
          exercises: [
            {
              task: "Fix the waterfall.",
              description: "Checks Promise.all.",
              code: `const a = await getA();
const b = await getB();
const c = await getC();`,
              answer: "Requests do not depend on each other. Start them together.",
              solution: "const [a, b, c] = await Promise.all([getA(), getB(), getC()]);",
            },
            {
              task: "Spot the hidden waterfall.",
              description: "Checks fetch-on-render in children.",
              code: "function Page() { const u = useUser(); return u && <Orders userId={u.id} />; }",
              answer: "Orders fetches only after user loads. Fetch both in a loader or prefetch orders in parallel if possible.",
            },
            {
              easy: true,
              task: "Name the API to run requests in parallel.",
              description: "Checks Promise.all.",
              code: "const [a, b, c] = await Promise.all([fa(), fb(), fc()]);",
              answer: "Promise.all, which waits for all at once.",
            },
            {
              easy: true,
              task: "Spot the waterfall.",
              description: "Checks sequential awaits.",
              code: `const a = await fa();
const b = await fb();`,
              answer: "Each await waits for the one before it.",
            },
          ]
        },
        {
          q: "How do transitions and Suspense make the app feel faster? What are the risks?",
          short: "Transitions mark updates as interruptible so urgent input stays responsive, and Suspense lets you show stable fallbacks; pitfalls include unexpected fallback flashes and work that cannot be interrupted.",
          long: "startTransition/useTransition keeps the old UI on screen while the new one renders.\nIf a transition suspends, React keeps showing old content instead of replacing it with a fallback.\nisPending lets you show subtle indicators.\nTransitions do not make slow code faster; a single heavy component still blocks.\nNon-transition updates that suspend show the nearest fallback, causing flashes.\nControlled input values cannot be updated in a transition.",
          exercises: [
            {
              task: "Predict what the user sees.",
              description: "Checks transition keeps old UI.",
              code: "startTransition(() => setPage(2)); // page 2 suspends",
              answer: "Page 1 stays on screen until page 2 is ready, instead of a fallback. Use isPending to show progress.",
            },
            {
              task: "Name a risk of transitions.",
              description: "Checks transition trade-offs.",
              code: "// user clicks, nothing seems to happen",
              answer: "Old UI stays without feedback, so it feels frozen. Always show isPending state.",
            },
            {
              easy: true,
              task: "Name what a transition keeps on screen.",
              description: "Checks old UI in transitions.",
              answer: "The old UI, instead of a fallback spinner.",
            },
            {
              easy: true,
              task: "Name one risk of transitions.",
              description: "Checks stale UI risk.",
              answer: "Users may see old content without knowing it is updating.",
            },
          ]
        },
        {
          q: "How do you make the bundle smaller in a mature React app?",
          ai: true,
          short: "Analyze the bundle, remove or replace heavy dependencies, split by route and feature, ensure tree shaking works, and move non-interactive rendering to the server where possible.",
          long: "Start with a visual bundle analyzer and source-map-explorer.\nCommon culprits: moment/lodash full imports, icon libraries, charting, polyfills.\nCheck sideEffects and ESM to keep tree shaking working.\nLazy load rarely used features; prefetch likely ones.\nRSC can keep heavy rendering libraries (markdown, syntax highlight) off the client.\nAdd size budgets in CI (size-limit) to prevent regressions.",
          exercises: [
            {
              task: "Fix the import.",
              description: "Checks tree-shaking imports.",
              code: `import _ from "lodash";
_.debounce(fn, 300);`,
              answer: "This pulls all of lodash. Import the single function or use lodash-es.",
              solution: "import debounce from \"lodash/debounce\";",
            },
            {
              task: "Name a replacement for moment.",
              description: "Checks heavy dependencies.",
              code: "import moment from \"moment\";",
              answer: "Use Intl.DateTimeFormat or date-fns. moment is large and not tree-shakable.",
            },
            {
              easy: true,
              task: "Name a fix for a big library import.",
              description: "Checks tree shaking.",
              code: "import _ from \"lodash\";",
              answer: "Import only what you need, or use a smaller library.",
              solution: "import debounce from \"lodash/debounce\";",
            },
            {
              easy: true,
              task: "Name a tool to see big modules.",
              description: "Checks bundle analyzer.",
              answer: "A bundle analyzer like rollup-plugin-visualizer.",
            },
          ]
        }
      ],
      techlead: [
        {
          q: `Review these imports. The main bundle is 900 kilobytes. What would you change, and how do you stop it from coming back?`,
          code: `import _ from "lodash";\nimport moment from "moment";\nimport * as Icons from "@mui/icons-material";\nimport { Chart } from "chart.js/auto";\n\nexport function OrderRow({ order }) {\n  const Icon = Icons[order.statusIcon];\n  return (\n    <tr>\n      <td>{_.capitalize(order.name)}</td>\n      <td>{moment(order.date).format("LL")}</td>\n      <td><Icon /></td>\n    </tr>\n  );\n}`,
          short: `Whole libraries are bundled: all of lodash, moment with locales, every MUI icon through a namespace import, and the full Chart.js registry in a row component. Use per-function imports or native APIs, a small date library or Intl, a fixed icon map, and lazy-load charts. Add size checks in CI.`,
          long: `import _ from "lodash" pulls the whole CommonJS build; use lodash-es named imports or native code.\nmoment is large and not tree-shakeable; use Intl.DateTimeFormat or date-fns.\nimport * as Icons with a dynamic lookup forces the bundler to include every icon.\nchart.js/auto registers all chart types; import only what you need, and only in a lazy-loaded chart route.\nFind these with a bundle analyzer (rollup-plugin-visualizer, source-map-explorer).\nPrevent regressions: size-limit in CI, ESLint no-restricted-imports for known heavy paths, and review of new dependencies.`,
          fix: `import { CheckCircle, Schedule, Cancel } from "@mui/icons-material";\n\nconst statusIcons = { done: CheckCircle, pending: Schedule, cancelled: Cancel };\nconst dateFmt = new Intl.DateTimeFormat(undefined, { dateStyle: "long" });\nconst capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);\n\nexport function OrderRow({ order }) {\n  const Icon = statusIcons[order.status];\n  return (\n    <tr>\n      <td>{capitalize(order.name)}</td>\n      <td>{dateFmt.format(new Date(order.date))}</td>\n      <td>{Icon && <Icon />}</td>\n    </tr>\n  );\n}`,
          exercises: [
            {
              task: "Spot the problem.",
              description: "Checks barrel imports.",
              code: "import { Button } from \"@/components\"; // index re-exports 300 files",
              answer: "Barrels can pull many modules and slow builds and tests. Import from the file or ensure sideEffects: false.",
            },
            {
              task: "Stop bundle growth in CI.",
              description: "Checks size budgets.",
              code: "// main bundle grew 200 KB unnoticed",
              answer: "Add size-limit or bundlesize checks that fail PRs over budget, and post the size diff on PRs.",
            },
            {
              easy: true,
              task: "Spot the heavy import.",
              description: "Checks full library imports.",
              code: "import * as Icons from \"icons\";",
              answer: "It pulls the whole icon library into the bundle.",
            },
            {
              easy: true,
              task: "Name a guard against regressions.",
              description: "Checks size limits in CI.",
              answer: "A bundle size check in CI, like size-limit.",
            },
          ],
        },
        {
          q: `How do you set and track performance budgets, like Core Web Vitals, for several React apps?`,
          short: `Pick a few user-centered metrics (LCP, INP, CLS, plus JavaScript size), set targets per page type, collect real user data with the web-vitals library, and show it per release and per team. Use lab checks in CI to stop regressions early.`,
          long: `Field data shows what users feel: collect LCP, INP and CLS with web-vitals and send them to your analytics with route and release tags.\nGood thresholds at the 75th percentile: LCP under 2.5 s, INP under 200 ms, CLS under 0.1.\nAdd budgets the team controls directly: JavaScript per route, number of requests, image weight.\nLab tools (Lighthouse CI, size-limit) catch regressions in pull requests; field data confirms the effect.\nGive each budget an owner; a dashboard by route makes it clear which team acts.\nWhen a budget is broken, the fix goes to the next sprint, like a bug.\nReview targets every quarter as devices and features change.`,
          exercises: [
            {
              task: "Report Web Vitals from real users.",
              description: "Checks the web-vitals library.",
              code: "import { onINP, onLCP } from \"web-vitals\";",
              answer: "Send each metric to your analytics with page and app tags.",
              solution: `onINP(m => send({ name: m.name, value: m.value, app: "admin" }));
onLCP(m => send({ name: m.name, value: m.value, app: "admin" }));`,
            },
            {
              task: "Name the good thresholds.",
              description: "Checks Core Web Vitals targets.",
              code: "// LCP, INP, CLS at p75",
              answer: "LCP 2.5 s or less, INP 200 ms or less, CLS 0.1 or less, at the 75th percentile.",
            },
            {
              easy: true,
              task: "Name one Core Web Vital.",
              description: "Checks CWV names.",
              answer: "LCP, INP or CLS.",
            },
            {
              easy: true,
              task: "Name a way to collect real user data.",
              description: "Checks RUM.",
              code: "onINP(m => send(m.value));",
              answer: "The web-vitals library sending data to analytics.",
            },
          ],
        },
        {
          q: "Your app reacts slowly to clicks on cheap Android phones. What is your plan?",
          short: "Reduce main-thread work per interaction: break long tasks, render less (virtualization, deferral), ship less JS, move work to workers or the server, and test on real low-end devices.",
          long: "INP measures the slowest interactions; low-end CPUs amplify long tasks.\nIdentify slow interactions with RUM attribution (web-vitals attribution build).\nYield to the main thread (scheduler.yield, transitions) and split heavy handlers.\nAvoid layout thrashing and large re-render trees on input.\nCut hydration cost: less client JS, RSC, partial hydration.\nTest on a real low-end device lab or CPU throttling, validated by field data.",
          exercises: [
            {
              task: "Name the first step.",
              description: "Checks measuring on real devices.",
              code: "// slow clicks on cheap Android phones",
              answer: "Measure INP from real users and profile with CPU throttling or a real device to find long tasks.",
            },
            {
              task: "Break up a long task.",
              description: "Checks yielding to the main thread.",
              code: "items.forEach(process); // 300ms",
              answer: "Process in chunks and yield with scheduler.yield or setTimeout so input can run.",
              solution: `for (const chunk of chunks(items, 100)) {
  chunk.forEach(process);
  await scheduler.yield();
}`,
            },
            {
              easy: true,
              task: "Name the metric for click response.",
              description: "Checks INP.",
              answer: "INP, Interaction to Next Paint.",
            },
            {
              easy: true,
              task: "Name one quick fix for slow clicks.",
              description: "Checks splitting long tasks.",
              answer: "Split long tasks or move work out of the click handler.",
            },
          ]
        }
      ]
    },

    "Advanced Strategies and Integration": {
      junior: [
        {
          q: "Fix this WebSocket code. It opens a new connection on every render.",
          code: `function Prices() {
  const [price, setPrice] = useState(null);
  const ws = new WebSocket("wss://example.com/prices");
  ws.onmessage = e => setPrice(JSON.parse(e.data));
  return <span>{price}</span>;
}`,
          short: "Side effects must not run during render; open the socket in useEffect and close it in the cleanup.",
          long: "Render runs often, so a new socket opens each time and old ones keep running.\nEach message updates state, which renders again: a connection leak loop.\nPut the connection in useEffect with [] (or the URL) as deps.\nReturn cleanup that closes the socket.\nStrict Mode mounts twice in dev, which helps you spot missing cleanups.\nFor shared streams, use one connection in a store or context.",
          fix: `function Prices() {
  const [price, setPrice] = useState(null);
  useEffect(() => {
    const ws = new WebSocket("wss://example.com/prices");
    ws.onmessage = e => setPrice(JSON.parse(e.data));
    return () => ws.close();
  }, []);
  return <span>{price}</span>;
}`,
          exercises: [
            {
              task: "Fix the connection.",
              description: "Checks sockets in effects.",
              code: `function Chat() {
  const ws = new WebSocket(url);
  ws.onmessage = e => add(e.data);
}`,
              answer: "Creating the socket in render opens one per render. Use an effect with cleanup.",
              solution: `useEffect(() => {
  const ws = new WebSocket(url);
  ws.onmessage = e => add(e.data);
  return () => ws.close();
}, [url]);`,
            },
            {
              task: "Predict StrictMode behavior.",
              description: "Checks double effects with sockets.",
              code: "// effect opens socket, cleanup closes it",
              answer: "In development it opens, closes, and opens again. With proper cleanup that is harmless.",
            },
            {
              easy: true,
              task: "Spot why it reconnects.",
              description: "Checks missing deps array.",
              code: `useEffect(() => {
  const ws = new WebSocket(url);
});`,
              answer: "No dependency array, so it runs after every render.",
            },
            {
              easy: true,
              task: "Name what the cleanup must do.",
              description: "Checks closing sockets.",
              code: "return () => ws.close();",
              answer: "Call ws.close().",
            },
          ]
        },
        {
          q: "How do you connect React to a REST API in a clean way?",
          short: "Put HTTP calls in a small API layer, use a data-fetching library (TanStack Query) for caching and loading/error states, and keep components focused on rendering.",
          long: "Components should not build URLs and parse responses everywhere.\nAn API module centralizes base URL, auth headers and error handling.\nTanStack Query handles caching, deduping, retries and refetching.\nMutations invalidate related queries to refresh data.\nType responses with TypeScript and validate if the backend is not trusted.\nKeep secrets on the server; the browser bundle is public.",
          exercises: [
            {
              task: "Move fetch logic out of the component.",
              description: "Checks API layer.",
              code: "useEffect(() => { fetch(\"/api/users?page=\" + p).then(...) }, [p]);",
              answer: "Put requests in an api module and call them through a query hook.",
              solution: `export const getUsers = p => http.get(\`/users?page=\${p}\`);
export const useUsers = p =>
  useQuery({ queryKey: ["users", p], queryFn: () => getUsers(p) });`,
            },
            {
              task: "Spot the problem.",
              description: "Checks base URL duplication.",
              code: "fetch(\"https://api.prod.com/users\")",
              answer: "Hardcoded hosts break other environments. Use a configured base URL from env.",
            },
            {
              easy: true,
              task: "Name a clean place for API calls.",
              description: "Checks API layer.",
              code: "export const getUser = id => http.get(`/users/${id}`);",
              answer: "A separate API module, not inside components.",
            },
            {
              easy: true,
              task: "Name a library for server data in components.",
              description: "Checks TanStack Query.",
              answer: "TanStack Query, with useQuery.",
            },
          ]
        },
        {
          q: "What are environment variables in a Vite React app? What must you never put there?",
          short: "Vite exposes variables prefixed VITE_ via import.meta.env at build time; they end up in the public bundle, so never put secrets there.",
          long: "Only VITE_-prefixed variables are exposed to client code.\nValues are inlined at build time, not read at runtime.\nAnyone can read them in the bundle, so API keys with privileges must stay on a server.\nNext.js uses NEXT_PUBLIC_ for client-exposed variables.\nFor runtime config per environment, fetch a config file or inject it in HTML.\nCommit .env.example, not real .env files.",
          exercises: [
            {
              task: "Read an env variable in Vite.",
              description: "Checks import.meta.env.",
              code: "const url = process.env.API_URL;",
              answer: "Vite uses import.meta.env and exposes only VITE_ prefixed vars.",
              solution: "const url = import.meta.env.VITE_API_URL;",
            },
            {
              task: "Spot the problem.",
              description: "Checks secrets in client env.",
              code: "VITE_STRIPE_SECRET_KEY=sk_live_...",
              answer: "Every VITE_ var is in the public bundle. Secrets must stay on the server.",
            },
            {
              easy: true,
              task: "Name the prefix Vite exposes to the client.",
              description: "Checks VITE_ prefix.",
              code: "import.meta.env.VITE_API_URL",
              answer: "VITE_; only those vars reach the client.",
            },
            {
              easy: true,
              task: "True or false: secrets are safe in VITE_ vars.",
              description: "Checks env var exposure.",
              answer: "False. They ship in the bundle, so anyone can read them.",
            },
          ]
        }
      ],
      middle: [
        {
          q: "Fix this token refresh. Many requests run at once. Each one starts its own refresh, and some fail.",
          code: `async function api(url) {
  let res = await fetch(url, { headers: { Authorization: "Bearer " + getToken() } });
  if (res.status === 401) {
    await refreshToken();
    res = await fetch(url, { headers: { Authorization: "Bearer " + getToken() } });
  }
  return res;
}`,
          short: "Deduplicate the refresh with a single shared in-flight promise so concurrent 401s wait for one refresh and then retry.",
          long: "Five concurrent 401s trigger five refreshes; refresh tokens may rotate and invalidate each other.\nKeep one refreshing promise at module level and await it from all callers.\nReset it when done (success or failure).\nIf refresh fails, log the user out and redirect to login once.\nPrefer httpOnly cookies for tokens to reduce XSS exposure.\nRetry only once to avoid loops.",
          fix: `let refreshing = null;

function refreshOnce() {
  if (!refreshing) {
    refreshing = refreshToken().finally(() => { refreshing = null; });
  }
  return refreshing;
}

async function api(url, init = {}) {
  const call = () => fetch(url, { ...init, headers: { ...init.headers, Authorization: "Bearer " + getToken() } });
  let res = await call();
  if (res.status === 401) {
    await refreshOnce();
    res = await call();
  }
  return res;
}`,
          exercises: [
            {
              task: "Share one refresh between requests.",
              description: "Checks single-flight refresh.",
              code: "async function refresh() { return api.post(\"/refresh\"); }",
              answer: "Store the pending promise and reuse it until it settles.",
              solution: `let pending = null;
function refresh() {
  pending ??= api.post("/refresh").finally(() => { pending = null; });
  return pending;
}`,
            },
            {
              task: "Name what to do when refresh fails.",
              description: "Checks refresh failure handling.",
              code: "// refresh returns 401",
              answer: "Stop retrying, clear the session, and send the user to login, keeping the return URL.",
            },
            {
              easy: true,
              task: "Name the trick to share one refresh.",
              description: "Checks shared promise.",
              code: "refreshing ??= refresh().finally(() => (refreshing = null));",
              answer: "Store the refresh promise and reuse it while pending.",
            },
            {
              easy: true,
              task: "Name the status that triggers refresh.",
              description: "Checks 401 handling.",
              answer: "401 Unauthorized.",
            },
          ]
        },
        {
          q: `How do you load a third-party script, like a payment or maps SDK, only once and only when it is needed?`,
          short: `Wrap the script loading in a module-level promise so it runs once, start it only on the pages or actions that need it, and expose it through a hook or Suspense. Clean up widgets, not the script, on unmount.`,
          long: `Adding a script tag in every component that needs it loads it many times and causes race bugs.\nKeep one cached promise per script URL at module level; every caller awaits the same promise.\nLoad it when needed: on the checkout route, or when the user opens the map.\nIn React 19 you can render <script async src="..." /> in a component; React dedupes it and can hoist it.\nUse a hook that returns the loading status, or use() with the promise inside Suspense.\nAdd a timeout and error state; ad blockers and network issues are common.\nCheck the Content Security Policy and use the vendor official loader if there is one.`,
          exercises: [
            {
              task: "Load a script only once.",
              description: "Checks memoized script loading.",
              code: "function loadMaps() { /* add <script> */ }",
              answer: "Cache the promise so all callers share one script tag.",
              solution: `let p;
export const loadMaps = () => p ??= new Promise((ok, fail) => {
  const s = Object.assign(document.createElement("script"), { src: URL, async: true, onload: ok, onerror: fail });
  document.head.append(s);
});`,
            },
            {
              task: "Load it only when needed.",
              description: "Checks on-demand loading.",
              code: "// payment SDK on every page",
              answer: "Call the loader when the user opens checkout, not at app start. Preload on hover to hide latency.",
            },
            {
              easy: true,
              task: "Name a way to load a script once.",
              description: "Checks cached loader promise.",
              answer: "Cache the load promise in a module variable.",
            },
            {
              easy: true,
              task: "Fill in the script attribute for no blocking.",
              description: "Checks async scripts.",
              code: `const s = document.createElement("script");
s.src = url; s.? = true;`,
              answer: "async, so it does not block parsing.",
            },
          ],
        },
        {
          q: "How do you share state between React and a third-party widget or an iframe?",
          ai: true,
          short: "Use explicit integration contracts: props/callbacks for embedded components, custom events or a small pub/sub for non-React code, and postMessage with origin checks for iframes.",
          long: "Treat the widget as an external system; React should not reach into its internals.\nWrap it in a component that syncs props to its API in effects.\nListen to its events and update React state via callbacks.\nFor iframes, use postMessage with strict targetOrigin and event.origin checks.\nDefine message schemas and version them.\nClean up listeners on unmount.",
          exercises: [
            {
              task: "Send data to an iframe safely.",
              description: "Checks postMessage target origin.",
              code: "frame.contentWindow.postMessage(data, \"*\");",
              answer: "\"*\" sends to any origin. Use the exact origin.",
              solution: "frame.contentWindow.postMessage(data, \"https://widget.example.com\");",
            },
            {
              task: "Spot the security bug.",
              description: "Checks checking message origin.",
              code: "window.addEventListener(\"message\", e => setState(e.data));",
              answer: "Any page can post messages. Check e.origin before trusting e.data.",
            },
            {
              easy: true,
              task: "Name the API to talk to an iframe.",
              description: "Checks postMessage.",
              code: "frame.contentWindow.postMessage(data, origin);",
              answer: "postMessage, with a checked origin.",
            },
            {
              easy: true,
              task: "Spot the security gap.",
              description: "Checks origin check.",
              code: "window.onmessage = e => apply(e.data);",
              answer: "It trusts any sender; check e.origin.",
            },
          ]
        }
      ],
      senior: [
        {
          q: "Fix this micro frontend setup. Two copies of React load, and hooks crash.",
          code: `// host webpack.config.js
new ModuleFederationPlugin({
  name: "host",
  remotes: { billing: "billing@/billing/remoteEntry.js" },
});
// billing webpack.config.js
new ModuleFederationPlugin({
  name: "billing",
  exposes: { "./App": "./src/App" },
});`,
          short: "Share React and react-dom as singletons with compatible version ranges in both host and remotes so only one React instance runs.",
          long: "Two React instances mean hooks dispatcher mismatch: 'Invalid hook call'.\nModule Federation must declare shared: { react: { singleton: true, requiredVersion } }.\nAlign major versions across teams; enforce in CI.\nUse an async bootstrap (import('./bootstrap')) so shared modules negotiate before use.\nAlso share libraries holding React context (router, query client) if they cross boundaries.\nPrefer mounting remotes with their own root and a stable contract.",
          fix: `const shared = {
  react: { singleton: true, requiredVersion: "^19.0.0" },
  "react-dom": { singleton: true, requiredVersion: "^19.0.0" },
};
// host
new ModuleFederationPlugin({ name: "host", remotes: { billing: "billing@/billing/remoteEntry.js" }, shared });
// billing
new ModuleFederationPlugin({ name: "billing", filename: "remoteEntry.js", exposes: { "./App": "./src/App" }, shared });
// index.js in both apps: import("./bootstrap");`,
          exercises: [
            {
              task: "Share React as a singleton.",
              description: "Checks Module Federation shared config.",
              code: "shared: [\"react\", \"react-dom\"]",
              answer: "Mark them singleton so all remotes use one copy.",
              solution: `shared: {
  react: { singleton: true, requiredVersion: "^19.0.0" },
  "react-dom": { singleton: true, requiredVersion: "^19.0.0" },
}`,
            },
            {
              task: "Predict the error with two React copies.",
              description: "Checks duplicate React symptoms.",
              code: "// remote uses its own React",
              answer: "\"Invalid hook call\" errors, because hooks look up the dispatcher in a different React copy.",
            },
            {
              easy: true,
              task: "Name why two Reacts break hooks.",
              description: "Checks duplicate React.",
              answer: "Hooks rely on one shared React dispatcher.",
            },
            {
              easy: true,
              task: "Name the Module Federation option to fix it.",
              description: "Checks singleton.",
              code: "shared: { react: { singleton: true } }",
              answer: "singleton: true for react and react-dom.",
            },
          ]
        },
        {
          q: "How do you build live updates in React without too many renders?",
          short: "Keep the connection in a single external store, batch and throttle updates, normalize data, and subscribe components to narrow slices.",
          long: "High-frequency messages can trigger hundreds of renders per second.\nOne connection per app, managed outside components.\nBuffer messages and flush on animation frames or intervals.\nNormalize entities by id so updates touch only affected rows.\nComponents subscribe via selectors (useSyncExternalStore, Zustand).\nHandle reconnection, backoff and resync of missed messages.",
          exercises: [
            {
              task: "Batch live updates.",
              description: "Checks throttling socket updates.",
              code: "ws.onmessage = e => setPrices(p => ({ ...p, ...JSON.parse(e.data) }));",
              answer: "Hundreds of messages a second re-render too often. Buffer and flush once per frame or interval.",
              solution: `let buf = {};
ws.onmessage = e => Object.assign(buf, JSON.parse(e.data));
setInterval(() => { setPrices(p => ({ ...p, ...buf })); buf = {}; }, 250);`,
            },
            {
              task: "Update only the changed row.",
              description: "Checks fine-grained subscriptions.",
              code: "const prices = usePrices(); // whole map",
              answer: "Subscribe each row to its own symbol with a store selector, so one update re-renders one row.",
              solution: "const price = usePriceStore(s => s.prices[symbol]);",
            },
            {
              easy: true,
              task: "Name a way to reduce live update renders.",
              description: "Checks batching updates.",
              answer: "Batch updates, e.g. once per animation frame.",
            },
            {
              easy: true,
              task: "Name a store pattern for live data.",
              description: "Checks selective subscriptions.",
              answer: "An external store with selectors, so only affected parts update.",
            },
          ]
        },
        {
          q: "How do you move a large old React codebase to hooks and React 19?",
          ai: true,
          short: "Upgrade incrementally: get on the latest minor with no warnings, enable Strict Mode, fix deprecated APIs with codemods, and convert components opportunistically when touched, backed by tests.",
          long: "First upgrade React to the latest 18.x and fix all deprecation warnings.\nRun official codemods (react-codemod, types-react-codemod) for 19 changes like removed propTypes and string refs.\nEnable Strict Mode per subtree to find unsafe effects.\nClass components still work; convert when modifying, not as a rewrite.\nAdd tests around risky areas before refactoring.\nTrack progress with metrics (warnings count, class component count).",
          exercises: [
            {
              task: "Convert this class to a function.",
              description: "Checks class to hooks migration.",
              code: `class Clock extends Component {
  componentDidMount() { this.id = setInterval(this.tick, 1000); }
  componentWillUnmount() { clearInterval(this.id); }
}`,
              answer: "Use one effect with cleanup.",
              solution: `useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);`,
            },
            {
              task: "Name a React 19 removal to check.",
              description: "Checks React 19 breaking changes.",
              code: "Comp.propTypes = { ... }; ReactDOM.render(<App />, el);",
              answer: "propTypes checks and ReactDOM.render are removed. Use TypeScript and createRoot; run the official codemods.",
            },
            {
              easy: true,
              task: "Name a safe first step.",
              description: "Checks incremental upgrade.",
              answer: "Upgrade React first, then convert classes slowly.",
            },
            {
              easy: true,
              task: "True or false: class components still work in React 19.",
              description: "Checks class support.",
              answer: "True. Classes are still supported.",
            },
          ]
        }
      ],
      techlead: [
        {
          q: "Fix this design system component. Teams copy it because its props are too rigid.",
          code: `export function Card({ title, subtitle, image, actions, footerText, showBorder, compact }) {
  return (
    <div className={compact ? "card compact" : "card"} data-border={showBorder}>
      {image && <img src={image} />}
      <h3>{title}</h3>
      {subtitle && <p>{subtitle}</p>}
      <div>{actions}</div>
      {footerText && <footer>{footerText}</footer>}
    </div>
  );
}`,
          short: "Replace boolean/prop proliferation with composition (compound components and children slots) so teams can assemble variants without forking.",
          long: "Every new use case adds another prop, and eventually teams fork.\nCompound components (Card, Card.Header, Card.Media, Card.Footer) let consumers compose.\nKeep variants as a small enum, not many booleans.\nForward native props and refs; allow className for escape hatches.\nDocument patterns in Storybook and collect feedback from teams.\nDeprecate old props gradually with codemods.",
          fix: `export function Card({ variant = "default", className, children, ...rest }) {
  return <div className={cx("card", "card-" + variant, className)} {...rest}>{children}</div>;
}
Card.Media = function CardMedia({ alt = "", ...props }) { return <img alt={alt} {...props} />; };
Card.Header = function CardHeader({ title, subtitle }) {
  return <header><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</header>;
};
Card.Actions = function CardActions({ children }) { return <div className="card-actions">{children}</div>; };
Card.Footer = function CardFooter({ children }) { return <footer>{children}</footer>; };

// usage
<Card variant="compact">
  <Card.Header title="Plan" subtitle="Monthly" />
  <Card.Actions><Button>Upgrade</Button></Card.Actions>
</Card>`,
          exercises: [
            {
              task: "Make the component accept custom content.",
              description: "Checks slots over config props.",
              code: "<Card title=\"Hi\" icon=\"star\" footerText=\"More\" />",
              answer: "Accept nodes or children for parts, so teams compose instead of copying.",
              solution: `<Card header={<Title icon={<Star />}>Hi</Title>}
  footer={<Link to="/more">More</Link>}>
  ...
</Card>`,
            },
            {
              task: "Pass extra attributes through.",
              description: "Checks rest props spreading.",
              code: "function Input({ label }) { return <input />; }",
              answer: "Spread remaining props onto the input so teams can add aria, data and events.",
              solution: `function Input({ label, ...rest }) {
  return <label>{label}<input {...rest} /></label>;
}`,
            },
            {
              easy: true,
              task: "Name a pattern for flexible components.",
              description: "Checks composition.",
              code: "<Card><Card.Header /><Card.Body /></Card>",
              answer: "Composition: accept children or slots instead of many props.",
            },
            {
              easy: true,
              task: "Name the prop to change the rendered tag.",
              description: "Checks as prop.",
              code: "<Button as=\"a\" href=\"/x\" />",
              answer: "An as prop, like as=\"a\".",
            },
          ]
        },
        {
          q: "How do you test and bring in a new frontend tool across the company?",
          ai: true,
          short: "Start from a concrete problem, run a time-boxed spike with success criteria, pilot on one product, document trade-offs in an ADR, and plan support, training and exit costs.",
          long: "Technology should solve a measured problem, not follow hype.\nDefine success metrics (performance, DX, defects) before the spike.\nPilot with one team in a real but low-risk area.\nWrite an ADR with alternatives, risks and migration/exit plan.\nInvest in docs, examples and lint rules so adoption is consistent.\nRevisit the decision after a fixed period with data.",
          exercises: [
            {
              task: "Name the steps to adopt a new tool.",
              description: "Checks evaluation process.",
              code: "// team proposes switching to Biome",
              answer: "Write a short RFC with goals, run a pilot in one repo with metrics, then roll out with docs and codemods.",
            },
            {
              task: "Spot the red flag.",
              description: "Checks risk in adoption.",
              code: "// tool v0.3, one maintainer, no releases in 8 months",
              answer: "Low maturity and bus factor of one. It may be abandoned; prefer stable tools for core workflows.",
            },
            {
              easy: true,
              task: "Name a low-risk first step.",
              description: "Checks pilot projects.",
              answer: "A pilot with one team on a real project.",
            },
            {
              easy: true,
              task: "True or false: measure success before rollout.",
              description: "Checks success criteria.",
              answer: "True. Define metrics first, like build time or bugs.",
            },
          ]
        },
        {
          q: "How do you organize one repository with many React apps and shared packages?",
          short: "Use a workspace tool (pnpm + Turborepo/Nx) with apps and packages folders, clear ownership, enforced dependency boundaries, shared configs, and affected-only CI.",
          long: "apps/ for deployables, packages/ for UI, utils, API clients and configs.\nShare ESLint, TypeScript and test configs as packages.\nEnforce boundaries (apps cannot import other apps) with lint rules or Nx tags.\nUse CODEOWNERS for ownership.\nCache builds and run only affected tasks in CI.\nVersion shared packages internally (workspace protocol) or with changesets if published.",
          exercises: [
            {
              task: "Run only affected tests.",
              description: "Checks monorepo task runners.",
              code: "// 12 apps, CI runs all tests on every PR",
              answer: "Use Turborepo or Nx affected commands with caching, so CI tests only changed packages and their dependents.",
            },
            {
              task: "Spot the dependency problem.",
              description: "Checks version drift.",
              code: "// app A: react 18, app B: react 19, shared ui uses hooks",
              answer: "Shared packages break across React versions. Align versions with one root version policy and peerDependencies.",
            },
            {
              easy: true,
              task: "Name a tool for monorepos.",
              description: "Checks monorepo tools.",
              answer: "Nx, Turborepo or pnpm workspaces.",
            },
            {
              easy: true,
              task: "Name where shared UI code lives.",
              description: "Checks shared packages.",
              code: "packages/ui  apps/admin  apps/store",
              answer: "In a shared package, like packages/ui.",
            },
          ]
        }
      ]
    }
  }
};
