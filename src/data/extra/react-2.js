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
            { task: "Build a menu. It must highlight the current page.", description: "Checks NavLink usage. Create 3 routes and a menu in a Vite app, click around and inspect aria-current in DevTools.", answer: "Use <NavLink className={({ isActive }) => isActive ? 'active' : ''}>. NavLink sets aria-current=\"page\" automatically. Use the end prop on the root link so '/' is not active for every page." },
            { task: "After you create an order, go to the order page.", description: "Checks imperative navigation. Write a submit handler that awaits an API mock, then navigates; test with React Testing Library and MemoryRouter.", answer: "Call const navigate = useNavigate(); after the await, navigate('/orders/' + id, { replace: true }). replace prevents the Back button from returning to the filled form. In a data router you could instead return redirect() from the action." }
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
            { task: "Write a test. The page for user 42 must show the text User 42.", description: "Checks route testing. Use MemoryRouter initialEntries={['/users/42']} with Vitest + RTL.", answer: "Render the Routes inside MemoryRouter with initialEntries and assert screen.getByRole('heading', { name: 'User 42' }). This isolates routing from the browser URL. Add a second case for an unknown path that expects NotFound." },
            { task: "Check that the ID is a number. If not, show the Not Found page.", description: "Checks param handling. Add a guard in the component (or loader) and test with /users/abc.", answer: "Parse with Number(id) and check Number.isInteger. If invalid, render <NotFound /> or, in a data router, throw new Response('Not found', { status: 404 }) from the loader so the errorElement handles it." }
          ]
        },
        {
          q: "What are nested routes? What does the Outlet component do?",
          short: "Nested routes let a parent route render shared layout while a child route fills the <Outlet /> placeholder, so URL segments map to nested UI.",
          long: "A parent route (e.g. /settings) renders a layout with tabs and an <Outlet />.\nChild routes (profile, billing) render inside that outlet when their path matches.\nIndex routes render at the parent URL with no extra segment.\nLayout routes without a path group children under shared UI (e.g. an auth shell).\nThe parent stays mounted when switching children, preserving its state.\nuseOutletContext lets the parent pass data to children without prop drilling.",
          exercises: [
            { task: "Make a settings page with two tabs. Both tabs share one header.", description: "Checks layout + Outlet. Build it in a Vite sandbox and confirm header state persists when switching tabs.", answer: "Define <Route path=\"settings\" element={<SettingsLayout/>}> with children <Route index element={<Profile/>}/> and <Route path=\"billing\" .../>. SettingsLayout renders the header, NavLinks and <Outlet/>. The layout does not unmount between tabs." },
            { task: "Pass the current user from the layout to the child pages.", description: "Checks useOutletContext. Implement and log in the child.", answer: "Render <Outlet context={{ user }} /> in the layout and call useOutletContext() in children. Type it with a small hook like useUser() for safety. For widely shared data prefer a loader or context." }
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
            { task: "Keep the page number in the URL. Reset it to one when the search text changes.", description: "Checks functional URL updates. Implement and test with MemoryRouter initialEntries=['/s?q=a&page=3'].", answer: "In the updater copy prev, set q and set page to '1'. Other params remain untouched. Asserting the location via a small LocationDisplay test component verifies the URL." },
            { task: "Add a history entry only when the user presses Enter.", description: "Checks push vs replace semantics. Implement both behaviors and verify with the browser Back button.", answer: "Use replace: true while typing and a plain setParams on submit so Back returns to the previous committed search. This gives meaningful history entries without noise." }
          ]
        },
        {
          q: "How do you show a loading state during navigation in React Router version 7?",
          short: "useNavigation() exposes idle/loading/submitting state for the global navigation, and useFetcher gives per-component state for non-navigating mutations.",
          long: "With loaders the old page stays visible until the next route's data resolves.\nuseNavigation().state tells you if a navigation is loading or submitting so you can show a top progress bar.\nNavLink also receives isPending for the link being navigated to.\nuseFetcher() runs a loader/action without navigating (likes, inline edits) with its own state and data.\nReturning promises from loaders lets you stream non-critical data with <Suspense>/<Await>.\nAfter actions, loaders revalidate automatically; shouldRevalidate can opt out.",
          exercises: [
            { task: "Show a progress bar at the top while a page loads.", description: "Checks useNavigation. Add a slow loader (setTimeout) and render a bar in the root layout.", answer: "In the root layout read const nav = useNavigation() and render the bar when nav.state !== 'idle'. Add a small delay before showing to avoid flicker on fast loads." },
            { task: "Add a Done button on a task. It must not change the page.", description: "Checks useFetcher. Wire fetcher.Form to an action and render optimistic state.", answer: "Use const fetcher = useFetcher(); render <fetcher.Form method=\"post\" action=\"/todos/1\">. Derive the optimistic value from fetcher.formData while submitting. Loaders revalidate after the action." }
          ]
        },
        {
          q: "When the page changes, how do you handle scroll position and keyboard focus?",
          ai: true,
          short: "Restore scroll per history entry (ScrollRestoration in data routers) and move focus to the new page's heading or main region so keyboard and screen reader users notice the change.",
          long: "SPAs do not reset scroll or focus automatically like full page loads do.\nReact Router's <ScrollRestoration /> restores positions on Back/Forward and scrolls to top on new navigations.\ngetKey can key scroll by pathname for lists that should remember position.\nFor a11y, focus the <h1> (tabIndex=-1) or announce the title with a live region after navigation.\nDo not steal focus on search-param-only changes like filter edits.\nUpdate document.title per route (React 19 supports <title> in components).",
          exercises: [
            { task: "Move focus to the page title after each page change.", description: "Checks a11y routing. Implement a hook using useLocation and test with keyboard + VoiceOver.", answer: "In an effect keyed on location.pathname, focus a ref attached to <h1 tabIndex={-1}>. Skip the first render so initial load does not jump. Key on pathname only so query changes do not move focus." },
            { task: "Keep the list scroll position when the user goes back from a detail page.", description: "Checks ScrollRestoration. Add <ScrollRestoration getKey={l => l.pathname} /> and test Back.", answer: "Keying by pathname makes the list restore its own position regardless of history entry. Ensure the list data is ready (loader or cache) before restoration, otherwise height is wrong and the position is lost." }
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
            { task: "Reproduce the bug. Make the first project load slowly.", description: "Checks race reasoning. Use MSW with delay() and click project 1 then 2 quickly.", answer: "Without the signal, project 1's tasks arrive last and overwrite state. With the loader version the router aborts the first request and only renders project 2. Assert in the network tab that the first request is cancelled." },
            { task: "Use the loader together with TanStack Query cache.", description: "Checks loader + cache composition. Use queryClient.ensureQueryData in the loader and useQuery in the component.", answer: "The loader warms the cache and the component reads it via useQuery (or useSuspenseQuery) with the same key. Navigating back is instant from cache, and background refetch keeps it fresh." }
          ]
        },
        {
          q: "How do you split code by route, and still keep navigation fast?",
          short: "Use the route lazy() property so the router loads code and data in parallel, and prefetch likely next routes on hover/intent.",
          long: "React.lazy inside an element only starts loading when rendered, after the loader finished: a waterfall.\nThe route lazy() function (or v7 framework mode route modules) lets the router fetch component, loader and action chunks together.\nSplit by route, not by tiny component; too many chunks increases request overhead.\nPrefetch on hover/focus (<Link prefetch=\"intent\"> in framework mode) or idle time.\nKeep the shell and critical path in the main bundle.\nMeasure with bundle analyzer and real-user navigation timing.",
          exercises: [
            { task: "Change a React lazy route to use the route lazy property.", description: "Checks data router lazy loading. Compare network waterfalls in DevTools before and after.", answer: "Define { path: 'reports', lazy: () => import('./reports') } where the module exports Component and loader. The router fetches the module once and runs the loader immediately, removing the serial chunk then data delay." },
            { task: "Load the next page code when the user hovers a menu link.", description: "Checks prefetch strategy. Trigger import() on pointerenter/focus and verify chunks are cached.", answer: "Call the same dynamic import on hover; the module cache dedupes it. Avoid prefetching on slow networks (check navigator.connection.saveData). Measure the improvement in navigation latency." }
          ]
        },
        {
          q: "For a new app, when do you pick React Router framework mode? When do you pick library mode?",
          ai: true,
          short: "Framework mode adds file-based route modules, SSR/pre-rendering, type-safe loaders and automatic code splitting; library mode is better when you need to embed routing in an existing SPA or custom build.",
          long: "v7 has three modes: declarative (<BrowserRouter>), data (createBrowserRouter) and framework (Vite plugin).\nFramework mode gives typegen for params/loader data, SSR, SPA mode and static pre-render.\nIt owns the build and server entry, which matters for legacy hosts or micro-frontends.\nData mode gives loaders/actions without changing the build: a good migration step.\nChoose based on SEO/first load needs, hosting, team familiarity and migration path.\nAvoid adopting SSR just for fashion: it adds server ops and hydration constraints.",
          exercises: [
            { task: "Write a short decision for an internal admin app.", description: "Checks trade-off reasoning. List requirements (auth-only, no SEO, existing Webpack host) and decide.", answer: "For an auth-only admin with an existing host, data mode in library form usually wins: loaders/actions without owning the build. Framework SPA mode is an option if the team wants typegen and can move to Vite. SSR adds little value without SEO or first-load constraints." },
            { task: "Plan a step by step move from simple routes to data routes.", description: "Checks migration planning. Describe steps that keep the app shippable.", answer: "Switch to createBrowserRouter with createRoutesFromElements to keep the tree, then move fetching into loaders route by route. Add errorElement per route group. Finally consider framework mode once routes are modular." }
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
            { task: "Write tests for three users: guest, normal user and admin.", description: "Checks guard testing. Use createMemoryRouter with mocked getUser in Vitest.", answer: "Anonymous should redirect to /login with next, user should render the 403 error element, admin should render the dashboard. Assert the admin loader is never called in the first two cases." },
            { task: "Design a way to store permissions on each route.", description: "Checks scalability. Sketch a handle: { perm: 'reports.view' } convention and how menus reuse it.", answer: "Store required permissions on routes, read them in the guard loader via matched routes, and generate navigation from the same config. This keeps menus and access consistent. The server remains the authority." }
          ]
        },
        {
          q: "Many teams work on one app. How do you keep URL rules the same for everyone?",
          ai: true,
          short: "Treat URLs as a public API: define conventions (resource paths, query param naming, versioning), own a shared route registry, and lint/test for breaking changes.",
          long: "Bookmarks, emails and integrations depend on URLs, so breaking them is a breaking change.\nAgree on resource-oriented paths, kebab-case, and stable IDs over names.\nDocument which state belongs in the URL (filters, tabs) vs memory.\nKeep a route registry/typed helpers (href builders) so links are not string-concatenated.\nWhen renaming, keep redirects and measure their traffic before removal.\nReview routing changes like API changes, with contract tests.",
          exercises: [
            { task: "Design a typed helper that builds links.", description: "Checks type-safe links. Sketch the TypeScript signature and usage.", answer: "Export routes as a const map and a function href('userDetail', { id }) whose params are inferred from the path pattern. React Router v7 framework mode offers href() typegen. Links become refactor-safe." },
            { task: "Plan how to remove old URLs safely.", description: "Checks change management. Write rollout steps.", answer: "Add redirects from old to new URLs, log hits, notify integrators, and remove only after usage drops near zero. Keep a 410 or helpful page for stragglers. Track in a deprecation register." }
          ]
        },
        {
          q: "Your app has 300 routes. The first load is slow. How do you change the routing design?",
          short: "Split the route tree into lazily loaded feature modules with their own route definitions, keep a thin shell, and introduce budgets and ownership per module.",
          long: "Large eager route configs pull every page import into the main bundle.\nMove to route-level lazy modules owned by feature teams, registered through a manifest.\nOnly the shell, auth and top nav belong in the entry chunk.\nUse patchRoutesOnNavigation (data routers) to discover routes on demand for huge apps.\nSet per-route bundle budgets in CI and track LCP/INP per route in RUM.\nMigrate incrementally behind measurements, not big bang.",
          exercises: [
            { task: "Design a list where each feature adds its own routes lazily.", description: "Checks modular architecture. Describe the manifest shape and loading flow.", answer: "Each feature exposes { path, lazy: () => import('./routes') }. The shell builds the router from the manifest; patchRoutesOnNavigation can fetch child routes when first visited. Ownership and budgets attach to each entry." },
            { task: "Name the numbers that show the change worked.", description: "Checks measurable outcomes. List 3-4 metrics with targets.", answer: "Main bundle size (e.g. under 200 KB gzip), p75 LCP on the landing page, p75 route transition time, and the number of routes over budget. Track them before and after in RUM and CI." }
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
            { task: "Write a test for a user with no address.", description: "Checks defensive rendering. Use RTL and expect 'No address'.", answer: "render(<Profile user={{ name: 'A' }} />) and assert getByText('No address'). Before the fix the test throws a TypeError. Add a case with an address too." },
            { task: "Add types so TypeScript finds this bug.", description: "Checks TS help. Make address optional and run tsc.", answer: "Declare address?: { city?: string }. tsc then errors on user.address.city, forcing a guard. Types document what the API can actually return." }
          ]
        },
        {
          q: "How do you handle fetch errors in a React component?",
          short: "fetch only rejects on network failure, so check response.ok, store an error state, and render an error message with a retry.",
          long: "fetch resolves for 404/500, so you must check res.ok and throw.\nTrack status: loading, error, success (or use TanStack Query which does it for you).\nCatch inside the async function; errors in effects are not caught by Error Boundaries.\nShow user-friendly text and a retry button; log technical details.\nAbort on unmount to avoid setting state after the component is gone.\nNever swallow errors silently with an empty catch.",
          exercises: [
            { task: "Write a hook that loads JSON. It returns data, error and loading.", description: "Checks fetch error handling. Test with MSW returning 500.", answer: "Inside an effect create AbortController, fetch with signal, throw on !res.ok, set data or error, and abort in cleanup. Ignore AbortError. The test asserts the error message appears for 500." },
            { task: "Add a Retry button that loads the data again.", description: "Checks recovery. Increment a retry counter in the effect deps.", answer: "Keep const [attempt, setAttempt] = useState(0) and include it in the effect dependencies. Clicking Retry calls setAttempt(a => a + 1), rerunning the fetch and resetting the error." }
          ]
        },
        {
          q: "Why can't try and catch around JSX catch errors in child components?",
          short: "JSX only creates element objects; children render later, so a try/catch in the parent never sees their errors. Error Boundaries are the mechanism for render errors.",
          long: "return <Child /> inside try just builds an object and returns.\nReact calls Child later during reconciliation, outside your try block.\nError Boundaries (class components with getDerivedStateFromError/componentDidCatch) catch errors in rendering below them.\nLibraries like react-error-boundary give a function-friendly API.\ntry/catch is still right for event handlers and async code.\nReact 19 adds onCaughtError/onUncaughtError on the root for reporting.",
          exercises: [
            { task: "Show that try and catch around a broken child does not work.", description: "Checks the mental model. Render a throwing child inside try and observe the crash.", answer: "The error bubbles to the root and the app unmounts (or the dev overlay shows). Wrapping in <ErrorBoundary fallback={...}> renders the fallback instead. This proves the render happens outside the parent function." },
            { task: "Wrap a widget with the react-error-boundary library.", description: "Checks library usage. Install it and render a fallback with a reset button.", answer: "<ErrorBoundary FallbackComponent={Fallback} onReset={...}> where Fallback receives error and resetErrorBoundary. Clicking reset re-renders the children. Use resetKeys to reset automatically when inputs change." }
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
            { task: "Connect the error boundary with TanStack Query reset.", description: "Checks library integration. Use QueryErrorResetBoundary with useSuspenseQuery.", answer: "Wrap with <QueryErrorResetBoundary>{({ reset }) => <ErrorBoundary onReset={reset} ...>}. Retry then refetches failed queries instead of rethrowing the cached error." },
            { task: "Test that new data clears the error.", description: "Checks resetKeys. RTL: render with bad data, rerender with good data.", answer: "First render shows 'Chart failed'; rerender with valid data and assert the chart appears. Without resetKeys the fallback persists, proving the fix." }
          ]
        },
        {
          q: "Errors in click handlers and async code skip the error boundary. How can they reach it?",
          short: "They do not by default; either handle them locally, or rethrow them in render (setState(() => { throw err })), or use libraries/frameworks (useSuspenseQuery, actions) that surface them during render.",
          long: "Boundaries only catch errors thrown during render, lifecycle and constructors.\nEvent handler and promise errors bypass them.\nA common trick: setState(() => { throw error }) makes the error happen during render.\nreact-error-boundary provides useErrorBoundary().showBoundary(error).\nSuspense-based data libs throw on render, so boundaries catch fetch errors.\nForm actions in React 19: errors thrown in an action passed to <form action> propagate to the nearest boundary.",
          exercises: [
            { task: "A save fails after a click. Send the error to the nearest boundary.", description: "Checks showBoundary. Implement with react-error-boundary.", answer: "const { showBoundary } = useErrorBoundary(); in the catch call showBoundary(err). The boundary fallback renders. Prefer local inline errors for expected validation failures." },
            { task: "The server returns a validation error. Do you show it inline or in a boundary?", description: "Checks error classification. Explain your choice.", answer: "A 422 is expected and recoverable in context, so show inline field errors. Boundaries are for unexpected failures where the UI cannot continue. Mixing them makes UX confusing." }
          ]
        },
        {
          q: "What is the route error element in React Router? How do you tell a 404 from a crash?",
          short: "Each route can define an error element rendered when its loader, action or component throws; useRouteError() returns the error and isRouteErrorResponse() detects thrown Responses like 404.",
          long: "Errors bubble to the nearest route with errorElement (or ErrorBoundary export in framework mode).\nThe parent layout stays rendered, so only the failing section shows the error.\nThrow data(..., { status: 404 }) or new Response from loaders for expected HTTP errors.\nisRouteErrorResponse(err) separates those from real exceptions.\nShow friendly 404/403 pages and a generic message plus report for crashes.\nAlways have a root errorElement as last resort.",
          exercises: [
            { task: "Build one error page for 404, 403 and unknown errors.", description: "Checks useRouteError. Throw each type from a loader and view it.", answer: "Read err = useRouteError(); if isRouteErrorResponse(err) switch on err.status for 404/403, else log and show a generic message. Include a link home." },
            { task: "When a page crashes, keep the sidebar on screen.", description: "Checks boundary placement. Configure nested routes.", answer: "Put errorElement on the child route (or a pathless wrapper of the content area), not only the root. The layout with the sidebar keeps rendering and only the outlet shows the error." }
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
            { task: "Test that each error is sent only once.", description: "Checks dedup. Mock report and throw in a component under a boundary.", answer: "Render a throwing component inside a boundary on a root created with the options; assert report was called once with handled: true. Throw in a setTimeout to verify the window path." },
            { task: "Add the page and app version to each report.", description: "Checks actionable reporting. Add tags in the reporter.", answer: "Read the current pathname, app version from build env, and a hashed user or tenant id. Group by fingerprint (message + top frame). This makes alerts triageable." }
          ]
        },
        {
          q: "How do you group errors in a React app? Think about expected, unexpected, and fatal errors.",
          ai: true,
          short: "Classify errors by who caused them and whether the user can recover, and map each class to a UI pattern, logging level and alert policy.",
          long: "Expected: validation, 404, permission, offline; show inline or page-level messages, do not page anyone.\nUnexpected: bugs, contract violations; boundary fallback + report.\nTransient: timeouts, 503; retry with backoff and keep stale data visible.\nFatal: auth expired, app version mismatch; redirect or force reload.\nModel errors as typed classes (ApiError with status, code) at the API layer.\nDocument the mapping so all teams handle errors consistently.",
          exercises: [
            { task: "Write an ApiError class and map each error to a UI action.", description: "Checks taxonomy in code. Sketch TS classes and a switch.", answer: "class ApiError extends Error { status; code; } and a function toUi(err) returning 'inline' | 'retry' | 'login' | 'boundary'. Components call it rather than inspecting raw responses." },
            { task: "Write alert rules for each error group.", description: "Checks operational thinking. Produce a short table.", answer: "Unexpected errors alert on spike rate per release; transient errors alert on sustained elevated rate; expected errors only appear in dashboards. This avoids alert fatigue." }
          ]
        },
        {
          q: "After a deploy, a lazy chunk fails to load. What happens, and how do you handle it?",
          short: "A failed dynamic import rejects and is thrown to the nearest Error Boundary; detect chunk load errors and offer a reload (new version), with a one-time automatic reload guard.",
          long: "After deploy, old clients request hashed chunks that no longer exist.\nReact.lazy rethrows the rejected import, so a boundary catches it.\nRecognize ChunkLoadError / 'Failed to fetch dynamically imported module'.\nReload once (guarded by sessionStorage) to fetch the new manifest.\nKeep previous assets available for a while on the CDN to reduce failures.\nVite emits vite:preloadError on window, which you can handle globally.",
          exercises: [
            { task: "Write a lazy helper that reloads the page once on chunk errors.", description: "Checks resilience. Simulate a 404 chunk via DevTools request blocking.", answer: "Wrap the import in catch: if it is a chunk error and no reload flag is set, set the flag and location.reload(); otherwise rethrow to the boundary. Clear the flag on successful load." },
            { task: "Suggest a deploy plan that avoids these errors.", description: "Checks infra thinking. Describe asset retention.", answer: "Upload new assets before switching HTML, keep old hashed assets for days, and use immutable caching. Optionally poll a version endpoint and prompt users to refresh." }
          ]
        }
      ],
      techlead: [
        {
          q: "Fix this setup. One error in any widget makes the whole app blank.",
          code: `root.render(
  <ErrorBoundary fallback={<FullPageError />}>
    <App />
  </ErrorBoundary>
);`,
          short: "Use layered boundaries: root last resort, per-route, and per-independent-widget, each with appropriate fallback and reset, plus a shared component so teams apply it consistently.",
          long: "A single root boundary turns a small bug into a full outage.\nLayer by blast radius: app shell, route content, independent widgets.\nWidgets that are optional (recommendations, charts) degrade to a small placeholder.\nCritical flows (checkout) use route-level fallbacks with clear recovery.\nProvide a shared <Boundary name=\"...\"> that reports the name for ownership.\nReview boundary placement in design reviews like you review loading states.",
          fix: `function Boundary({ name, fallback, children }) {
  return (
    <ErrorBoundary
      fallbackRender={({ resetErrorBoundary }) => fallback ?? <WidgetError onRetry={resetErrorBoundary} />}
      onError={(e, info) => report(e, { boundary: name, stack: info.componentStack })}
    >
      {children}
    </ErrorBoundary>
  );
}

root.render(
  <Boundary name="root" fallback={<FullPageError />}>
    <App />
  </Boundary>
);
// inside pages:
<Boundary name="revenue-chart"><RevenueChart /></Boundary>`,
          exercises: [
            { task: "A dashboard has six widgets and a sidebar. Where do you put error boundaries?", description: "Checks placement strategy. Draw the tree and justify each boundary.", answer: "Root boundary for shell crashes, a route boundary for the dashboard content, and one per widget so failures stay local. The sidebar sits outside the content boundary so navigation always works." },
            { task: "How do you make sure new widgets always have a boundary?", description: "Checks governance. Describe how to enforce boundaries.", answer: "Require the shared Boundary in a widget template/generator and check in PR review; optionally a custom ESLint rule for components in /widgets. Dashboards by boundary name show ownership of errors." }
          ]
        },
        {
          q: "How do you set reliability goals for the frontend? How do error numbers guide priorities?",
          ai: true,
          short: "Define user-centric SLOs (e.g. crash-free sessions, successful key journeys), measure via RUM and error tracking, and use error budget to decide between reliability and features.",
          long: "Pick metrics users feel: crash-free session rate, journey success rate, error-boundary fallback rate.\nSet targets per critical journey, not for every error.\nTie errors to releases so regressions block rollout (canary + automatic rollback).\nWhen the budget burns, prioritize fixes over features.\nReview top errors weekly with owners; close noise at the source.\nShare dashboards with product so trade-offs are visible.",
          exercises: [
            { task: "Write reliability goals for a checkout flow.", description: "Checks SLO design. Give 2-3 SLOs with targets and windows.", answer: "99.5% of checkout sessions complete without a boundary fallback over 28 days; p75 INP under 200 ms on the payment step; under 0.1% unhandled errors per session. Each has an owner and alert on burn rate." },
            { task: "Describe a release check that uses error data.", description: "Checks rollout safety. Outline a canary process.", answer: "Ship to 5% of users, compare new-error and crash-free rates against baseline, and auto-roll back if thresholds are exceeded. Promote gradually. This catches regressions before full exposure." }
          ]
        },
        {
          q: "Bad data from the API crashed the app for all users. What do you change in the system?",
          short: "Validate data at the API boundary, add per-feature boundaries, contract tests with the backend, feature flags/kill switches, and a blameless postmortem with owners.",
          long: "Root cause is trusting unvalidated data deep in render.\nParse responses with schemas (zod/valibot) and fail at the edge with a typed error.\nContain impact with boundaries around features.\nAdd consumer-driven contract tests so backend changes fail CI.\nUse kill switches to disable a broken feature without deploy.\nFollow up with a blameless postmortem and tracked action items.",
          exercises: [
            { task: "Add schema checks to the API client.", description: "Checks boundary validation. Implement with zod and test with a malformed payload.", answer: "Define a schema and call schema.safeParse on responses; on failure throw a ContractError with path details and report it. Components get typed data or a handled error, never undefined fields." },
            { task: "Write the follow-up tasks after the incident.", description: "Checks leadership follow-up. List items with owners and dates.", answer: "Schema validation in the API layer, widget boundaries on the affected pages, contract tests in the backend pipeline, and a kill switch for the feature. Each gets an owner, due date and verification step." }
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
            { task: "Show the flicker difference with a tooltip.", description: "Checks timing. Position a tooltip based on its measured height using each hook; throttle CPU in DevTools.", answer: "With useEffect you may briefly see the tooltip in the wrong place; with useLayoutEffect the correction happens before paint. The rule: measuring + adjusting visible layout needs useLayoutEffect." },
            { task: "Log the order of render, layout effect and effect.", description: "Checks lifecycle order. Add console.log in each and observe.", answer: "Order: render, React commits DOM, layout effect, browser paint, effect. Cleanups run before the next corresponding effect. This explains when each hook sees the DOM." }
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
            { task: "Write a test. Clicking Focus must focus the input.", description: "Checks ref forwarding. RTL + user-event, assert document.activeElement.", answer: "Click the button with userEvent and expect(screen.getByRole('textbox')).toHaveFocus(). The test fails if the ref is not forwarded." },
            { task: "Add a cleanup function to a callback ref in React 19.", description: "Checks callback ref cleanup. Log on attach and detach.", answer: "Pass ref={node => { console.log('attach'); return () => console.log('detach'); }}. React 19 calls the returned cleanup on unmount instead of calling the ref with null." }
          ]
        },
        {
          q: "What is useReducer? When is it better than useState?",
          short: "useReducer manages state via a pure reducer(state, action), which is better when the next state depends on multiple fields or many event types update related state.",
          long: "dispatch({ type: 'add', item }) describes what happened; the reducer decides how state changes.\nAll transitions live in one testable pure function.\ndispatch is stable, so passing it down does not break memoization.\nGood for forms, wizards, and state machines.\nuseState is simpler for independent values.\nCombine with context to share dispatch without prop drilling.",
          exercises: [
            { task: "A cart uses three useState calls. Change it to useReducer.", description: "Checks reducer design. Write unit tests for the reducer alone.", answer: "Define actions add/remove/clear and a reducer that returns new state immutably. Test the reducer as a pure function without rendering. Components only dispatch actions." },
            { task: "Block wrong state changes in a loading reducer.", description: "Checks state machines. Ignore 'success' when not 'loading'.", answer: "In the reducer, switch on state.status first and return state unchanged for invalid actions. This avoids impossible states like success after cancel." }
          ]
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
            { task: "Write a test for the play method.", description: "Checks handle testing. Mock HTMLMediaElement.prototype.play in jsdom.", answer: "Spy on play, render with a ref, call ref.current.play() and assert the spy was called. jsdom does not implement media playback, so mocking is required." },
            { task: "Explain why src is now a prop and not set inside play.", description: "Checks declarative design. Short write-up.", answer: "Declarative props keep React in control and avoid stale closures. Imperative methods should only perform actions that cannot be expressed as state, like play or focus." }
          ]
        },
        {
          q: "What problem does useSyncExternalStore solve? How do you use it?",
          short: "It subscribes components to external mutable stores (browser APIs, custom stores) safely under concurrent rendering, preventing tearing between components.",
          long: "Concurrent rendering can read a mutable store at different times, producing inconsistent UI (tearing).\nuseSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) forces consistent reads.\ngetSnapshot must return a cached/immutable value; returning a new object each time loops.\ngetServerSnapshot provides the SSR value to avoid hydration mismatch.\nUsed internally by Redux, Zustand and others.\nGreat for navigator.onLine, matchMedia, or a small custom store.",
          exercises: [
            { task: "Write a hook that tells if the user is online.", description: "Checks the API. Toggle offline in DevTools to test.", answer: "subscribe adds online/offline listeners and returns cleanup; getSnapshot returns navigator.onLine; getServerSnapshot returns true. Components rerender on change without tearing." },
            { task: "The snapshot function returns a new object each time. Find the bug.", description: "Checks snapshot identity. Explain the infinite loop warning for getSnapshot returning { count: store.count }.", answer: "A new object each call looks like a change every time, causing rerender loops. Return store state that only changes identity on update, or a primitive." }
          ]
        },
        {
          q: "An effect runs for a long time and needs the latest callback. How do you do it safely?",
          short: "Store the callback in a ref updated in a layout effect, or use React's useEffectEvent (stable in 19.2), so the effect does not resubscribe when the callback changes.",
          long: "Passing an inline callback into an effect's deps resubscribes on every render.\nOmitting it causes stale closures.\nThe 'latest ref' pattern: ref.current = cb in useLayoutEffect, then call ref.current() in the effect.\nReact 19.2 adds useEffectEvent for exactly this: a non-reactive event function used inside effects.\nDo not call effect events during render or pass them to children.\nKeep reactive values (like roomId) in deps; only the handler is non-reactive.",
          exercises: [
            { task: "Write a useInterval hook.", description: "Checks latest-ref pattern. Test that changing callback does not reset the interval.", answer: "Keep savedCb ref updated on each render; set the interval in an effect depending only on ms, calling savedCb.current(). Use fake timers in Vitest to assert ticks continue after rerender." },
            { task: "Write the same hook with useEffectEvent.", description: "Checks React 19.2 API. Compare code size.", answer: "const onTick = useEffectEvent(callback); useEffect(() => { const id = setInterval(() => onTick(), ms); return () => clearInterval(id); }, [ms]). The linter knows onTick is not a dependency." }
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
            { task: "Use CSS container queries instead of the hook where you can.", description: "Checks CSS-first thinking. Implement a card that changes layout at 400px.", answer: "Set container-type: inline-size on the wrapper and use @container (min-width: 400px). No JS, no hydration jump. Keep JS measurement for computations like virtualization." },
            { task: "Test the hook with a fake ResizeObserver.", description: "Checks testing strategy. Mock the global and trigger callbacks.", answer: "Mock ResizeObserver to capture the callback, render with renderHook, call the callback with a fake entry inside act, and assert the returned width updates." }
          ]
        },
        {
          q: "Explain useOptimistic and useActionState in React 19. When do you use them?",
          short: "useActionState wraps an async action and gives state, a form action and pending; useOptimistic shows a temporary optimistic value while an async transition runs and reverts automatically.",
          long: "useActionState(action, initialState) returns [state, formAction, isPending]; action receives (prevState, formData).\nIt integrates with <form action> and progressive enhancement in RSC frameworks.\nuseOptimistic(state, updateFn) returns an optimistic value plus a setter usable inside transitions/actions.\nWhen the action settles, the optimistic value is replaced by real state.\nReturn expected failures as state; throw unexpected ones.\nuseFormStatus gives pending info to nested submit buttons.",
          exercises: [
            { task: "Build a comment form. New comments appear before the server answers.", description: "Checks both hooks. Simulate a slow server action.", answer: "Use useOptimistic(comments, (list, c) => [...list, { ...c, pending: true }]); in the form action call addOptimistic then await save. When saving resolves, update the real list; on failure the optimistic item disappears." },
            { task: "Return form errors from useActionState.", description: "Checks error-as-state. Render field errors.", answer: "The action returns { errors: { email: '...' } } instead of throwing. The component renders state.errors next to fields. isPending disables the submit button." }
          ]
        },
        {
          q: "What does the use hook do? How is it different from other hooks?",
          ai: true,
          short: "use() reads a promise (suspending until resolved) or a context; unlike other hooks it may be called conditionally and inside loops.",
          long: "use(promise) suspends the component until resolution and throws to Error Boundaries on rejection.\nThe promise must be stable (created outside render or cached), not created in the same render.\nIn RSC apps, servers can pass promises to client components that call use().\nuse(Context) works like useContext but can be inside if statements.\nIt cannot be used inside try/catch to catch suspension.\nPair with Suspense and Error Boundaries for loading and errors.",
          exercises: [
            { task: "The component calls use with a new fetch on each render. Find the bug.", description: "Checks promise stability. Explain the infinite suspend of use(fetch(url).then(r => r.json())).", answer: "Each render creates a new promise, so React suspends forever. Create the promise in a parent, loader or cache (or server) and pass it down." },
            { task: "Send a slow promise from a Next.js server component to a client component.", description: "Checks RSC + use. Implement page and client component.", answer: "In the server page start const p = getStats() without await and render <Suspense><Stats promise={p} /></Suspense>. The client component calls use(p). The shell streams immediately." }
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
            { task: "Measure re-renders before and after the fix with the Profiler.", description: "Checks verification. Record while scrolling a page with 20 consumers.", answer: "Before: every consumer commits per scroll event. After: consumers commit only when their selected value changes. Include the profiler screenshots in the PR." },
            { task: "Write a review checklist for shared hooks.", description: "Checks governance. List 4-5 items.", answer: "SSR safety (server snapshot), minimal re-render surface, stable return identities, cleanup of listeners, tests with renderHook and docs on cost. Shared hooks multiply mistakes across teams." }
          ]
        },
        {
          q: "In a big codebase, what goes in hooks, what goes in components, and what goes in plain modules?",
          ai: true,
          short: "Hooks encapsulate stateful React logic tied to lifecycle, components own UI, and plain modules hold pure logic and I/O; keep the dependency direction UI -> hooks -> modules.",
          long: "Pure logic (formatting, validation) should be plain functions: easy to test, reusable outside React.\nHooks wrap React concerns: state, effects, subscriptions, context.\nComponents compose hooks and render; avoid business rules inside JSX.\nAvoid 'god hooks' that return 20 values; split by concern.\nDon't wrap a single useState in a hook just for naming.\nEnforce boundaries with folder conventions and lint rules (import restrictions).",
          exercises: [
            { task: "Split a very large page component into layers.", description: "Checks separation. Describe resulting files and responsibilities for a 400-line page.", answer: "Extract pure calculations into a module, data fetching into useOrdersQuery, UI state into useOrderFilters, and leave the page composing them. Each piece gets focused tests." },
            { task: "Add lint rules that protect these layers.", description: "Checks enforcement. Use eslint import restrictions.", answer: "Configure no-restricted-imports or eslint-plugin-boundaries so /lib cannot import React or /components, and hooks cannot import components. CI fails on violations." }
          ]
        },
        {
          q: "Your team now uses React Compiler. Which hook patterns change? What do you tell the teams?",
          short: "The compiler auto-memoizes, so manual useMemo/useCallback/memo become mostly unnecessary, but rules of React (purity, no mutation during render) become strictly important and effects/refs patterns stay the same.",
          long: "React Compiler (stable 1.0 in late 2025) memoizes components and hooks at build time.\nCode that breaks the rules (mutating props, reading refs in render) gets skipped or misbehaves.\nKeep useMemo only as an explicit escape hatch (e.g. effect dependency identity), not by default.\nuseEffect, useLayoutEffect, useImperativeHandle and refs are unaffected.\nEnable eslint-plugin-react-hooks compiler rules to find violations.\nRoll out per directory and measure, using 'use no memo' to opt out problem files.",
          exercises: [
            { task: "Plan how to turn on the compiler in a large app.", description: "Checks rollout strategy. Write phases and metrics for a 500-component app.", answer: "Fix lint violations first, enable the compiler for a pilot directory, compare Profiler and RUM metrics, then expand. Keep an opt-out list and remove manual memoization gradually." },
            { task: "Give three examples of code the compiler cannot optimize.", description: "Checks rules knowledge. Give 3 examples.", answer: "Mutating an object received as props during render, reading ref.current in render, and conditionally calling hooks. The compiler bails out of such components, so they need fixing." }
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
            { task: "Render a counter on the server. Watch when it starts to work.", description: "Checks the concept. Use a Next.js page with a client counter, throttle network to Slow 3G.", answer: "HTML appears first but clicks do nothing until the JS loads and hydrates. This gap is why bundle size matters for SSR pages." },
            { task: "Create a hydration error on purpose and read it.", description: "Checks mismatch awareness. Render Date.now() in a component and inspect the console.", answer: "The server and client values differ, so React logs a mismatch with a diff. Fix by rendering time in an effect or passing a fixed value from the server." }
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
            { task: "Stop the theme flash by using a cookie.", description: "Checks server-readable state. Use cookies() from next/headers in the layout.", answer: "Set a theme cookie when the user toggles. In the root layout read (await cookies()).get('theme') and render the class on <html>. No flash, and server and client agree." },
            { task: "Explain why client components still run on the server.", description: "Checks the rendering model. Short explanation.", answer: "'use client' marks the boundary for the client bundle, but Next.js still prerenders those components to HTML for the first load. Browser-only code must therefore be in effects or guarded." }
          ]
        },
        {
          q: "What is the difference between SSR, SSG and ISR?",
          short: "SSR renders HTML per request, SSG renders at build time, and ISR serves static pages that are regenerated in the background after a revalidation period or on demand.",
          long: "SSR: fresh per request, personalized, higher server cost and TTFB.\nSSG: fastest, CDN cached, but stale until rebuild.\nISR: static speed plus periodic or on-demand updates (revalidatePath/revalidateTag).\nIn the App Router these are controlled by caching and dynamic APIs rather than separate functions.\nUsing cookies() or headers() makes a route dynamic.\nChoose per route based on freshness and personalization.",
          exercises: [
            { task: "Pick a method for a blog, a product page and a user dashboard.", description: "Checks reasoning. Justify each choice.", answer: "Blog: static/ISR. Product page: ISR with on-demand revalidation on price change. Dashboard: dynamic SSR or client fetching since it is personalized." },
            { task: "Make a Next.js page update every sixty seconds.", description: "Checks configuration. Use export const revalidate.", answer: "Add export const revalidate = 60 to the page or use fetch(url, { next: { revalidate: 60 } }). The page is served from cache and regenerated in the background after 60 seconds." }
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
            { task: "Show a date that is the same on server and client.", description: "Checks time zone handling. Use Intl.DateTimeFormat with timeZone.", answer: "Pass the user's time zone and locale from server data and format with both explicitly. Alternatively format on the server only in a Server Component." },
            { task: "When is it OK to use suppressHydrationWarning?", description: "Checks judgment. Give an example.", answer: "Only for unavoidable differences like a timestamp intentionally updated on the client. It applies one level deep and hides bugs if overused." }
          ]
        },
        {
          q: "How does data loading work in Next.js server components?",
          short: "Server Components are async and can await data directly (DB, fetch) on the server; results are rendered to RSC payload and HTML, with caching and streaming controlled by the framework.",
          long: "Fetch close to where data is used; requests are deduped within a render with fetch or React cache().\nStart independent requests in parallel to avoid waterfalls.\nWrap slow parts in <Suspense> to stream them.\nSecrets stay on the server; protect server modules with 'server-only'.\nMutations go through Server Actions followed by revalidation.\nIn Next 15+, fetch is not cached by default; opt in with caching APIs ('use cache' in newer versions).",
          exercises: [
            { task: "Load user and orders at the same time, not one after another.", description: "Checks parallel fetching. Rewrite two sequential awaits.", answer: "Start both promises and await Promise.all([userP, ordersP]), or move orders into a child component in Suspense. Measure TTFB difference." },
            { task: "Stop a server-only file from being imported on the client.", description: "Checks boundaries. Use the server-only package.", answer: "Add import 'server-only' at the top of the module. Importing it into a client component then fails at build time, preventing secret leaks." }
          ]
        },
        {
          q: "What are Server Actions? What security risks do they have?",
          ai: true,
          short: "Server Actions are async server functions marked 'use server' that clients can call (often via forms); they are public HTTP endpoints, so they need authentication, authorization and input validation.",
          long: "Each action gets an ID and can be invoked by POST from the browser.\nThey support progressive enhancement with <form action>.\nNever trust arguments: validate with a schema.\nCheck session and permissions inside the action, not just in the page.\nClosed-over values are encrypted but still should not hold secrets.\nAfter mutation, call revalidatePath/revalidateTag or redirect.",
          exercises: [
            { task: "Write a safe server action that updates a profile.", description: "Checks validation + auth. Use zod and a session helper.", answer: "Inside the action: get the session, reject if missing, parse formData with zod, ensure the user can edit that profile, update DB, revalidatePath('/profile'). Return field errors for invalid input." },
            { task: "Explain why hiding a button is not access control.", description: "Checks security model. Short answer.", answer: "Anyone can call the action endpoint directly with crafted requests. Authorization must happen on the server inside the action." }
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
            { task: "Check the streaming with curl.", description: "Checks streaming. Run curl -N against the production build and observe chunks.", answer: "The first chunk contains the shell and product; the recs HTML arrives later with an inline script that swaps the fallback. TTFB drops by about the recommendations latency." },
            { task: "When do you use a loading file, and when an inline Suspense?", description: "Checks boundary design. Explain trade-offs.", answer: "loading.tsx gives an instant fallback for navigations to the whole segment; inline Suspense keeps fast content visible and isolates slow parts. Use both: route skeleton plus granular boundaries." }
          ]
        },
        {
          q: "Explain the cache layers in Next.js. How do you avoid old data or data leaks?",
          short: "There are request memoization, the data cache, the full route cache (static rendering) and the client router cache; personalization must be dynamic or keyed per user, and mutations must revalidate the right tags.",
          long: "Request memoization dedupes identical fetches during one render.\nData cache persists fetch/'use cache' results across requests until revalidated.\nFull route cache stores prerendered HTML/RSC payload for static routes.\nRouter cache keeps visited segments in the browser for fast back/forward.\nUser-specific data must never land in a shared cache; cached functions must not read request data inside.\nUse tags (revalidateTag/updateTag) for precise invalidation after mutations.",
          exercises: [
            { task: "A cached price function reads the user tier from a cookie. Find the leak.", description: "Checks cache safety. Explain and fix.", answer: "The first user's prices get cached for everyone. Pass tier as an argument so it becomes part of the cache key, or keep the call uncached. Never read request-scoped data inside shared cached functions." },
            { task: "Refresh product pages after a price change.", description: "Checks tag revalidation. Write the action.", answer: "Tag the fetch or cached function with 'product:' + id and call revalidateTag for that tag in the update action. Only affected entries refresh." }
          ]
        },
        {
          q: "How do you build streaming SSR without a framework?",
          ai: true,
          short: "On the server use renderToPipeableStream with onShellReady to start piping HTML and bootstrapScripts for hydration; on the client call hydrateRoot with the same tree and data.",
          long: "renderToPipeableStream(<App/>, { bootstrapScripts, onShellReady, onShellError, onAllReady, onError }).\nPipe on onShellReady for users, onAllReady for crawlers that need full HTML.\nSuspense boundaries stream later with inline swap scripts.\nSerialize initial data into the HTML (escaped) so the client renders the same output.\nSet the status code before piping; shell errors should send a fallback page.\nOn the edge/Web streams use renderToReadableStream.",
          exercises: [
            { task: "Build a small Express server that renders React.", description: "Checks the API. Render App with a Suspense child that resolves after 1s.", answer: "In the handler call renderToPipeableStream and in onShellReady set content-type and pipe(res). The client entry runs hydrateRoot(document, <App />). The slow section appears after 1s without blocking the shell." },
            { task: "Put the first data into the HTML in a safe way.", description: "Checks XSS awareness. Explain escaping.", answer: "JSON.stringify can contain </script>, so escape < as \\u003c before injecting. Or use a framework that serializes safely. Never interpolate raw user strings into HTML." }
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
            { task: "Measure the client code size before and after.", description: "Checks verification. Use @next/bundle-analyzer on a production build.", answer: "Compare First Load JS per route. Pages using only server components should shrink significantly. Record numbers in the PR as evidence." },
            { task: "Write team rules for where to put use client.", description: "Checks governance. 3-5 rules.", answer: "Default to Server Components; add 'use client' only to components using state, effects or browser APIs; pass server content as children; never import server-only modules into client files; review in PRs with bundle checks." }
          ]
        },
        {
          q: "You have many products. How do you choose between SSR, SSG, client rendering and server components?",
          ai: true,
          short: "Decide per surface based on SEO, personalization, interactivity, freshness and infra cost; standardize on a framework that supports mixing them per route.",
          long: "Marketing and docs: static with ISR, best for SEO and cost.\nLogged-in apps: CSR or SSR shell with client data; RSC can reduce JS for heavy read pages.\nCommerce: hybrid; static product content plus dynamic prices/cart.\nConsider ops: SSR needs scalable servers, caching and observability.\nTeam skills and migration risk matter as much as performance.\nMeasure with Core Web Vitals per surface and revisit.",
          exercises: [
            { task: "Make a decision table for four product areas.", description: "Checks structured reasoning. Columns: SEO, personalization, freshness, choice.", answer: "Fill rows like marketing (high SEO, low personalization: SSG), catalog (high SEO, medium: ISR + dynamic islands), account (none: CSR/SSR), admin (none: CSR). Record assumptions." },
            { task: "Estimate the server cost of moving the catalog to SSR.", description: "Checks cost thinking. List cost drivers.", answer: "Requests per second, render time per request, cache hit ratio and edge vs region placement. Good caching keeps cost close to static; poor caching multiplies server load." }
          ]
        },
        {
          q: "How do you run SSR in production in a reliable way?",
          short: "Treat the SSR tier as a backend service: set render and data timeouts, fall back to a client-rendered shell on failure, cache aggressively, and monitor render latency, errors and memory.",
          long: "Slow downstream APIs directly increase TTFB; use timeouts and Suspense so slow parts stream or fall back.\nOn shell errors, serve a minimal CSR shell instead of 500 when possible.\nWatch for memory leaks from module-level state (it is shared across requests).\nTrace requests with OpenTelemetry (Next.js has instrumentation.ts).\nCDN-cache public pages; vary only on what matters.\nLoad test before launches and set autoscaling on CPU/latency.",
          exercises: [
            { task: "A server file keeps the current user in a module variable. What is the problem?", description: "Checks request isolation. Explain impact.", answer: "Module state is shared across concurrent requests, so one user's data can leak into another's response. Use request-scoped storage (cookies, headers, AsyncLocalStorage) instead." },
            { task: "Design dashboards and alerts for the SSR servers.", description: "Checks observability. List metrics.", answer: "p50/p95 render time per route, error rate, downstream latency, cache hit ratio, memory and event loop lag. Alert on p95 TTFB and error-rate burn, linked to traces." }
          ]
        }
      ]
    },

    "Performance Optimization in React": {
      junior: [
        {
          q: "Fix this list. React warns about keys. Inputs show wrong values after sorting.",
          code: `{items.map((item, index) => (
  <li key={index}>
    <input defaultValue={item.name} />
  </li>
))}`,
          short: "Index keys tie state to position, so reordering mixes up DOM state; use a stable unique id from the data.",
          long: "Keys tell React which element is which between renders.\nWith index keys, after sorting React reuses the wrong DOM nodes.\nUncontrolled inputs keep their old values in the wrong rows.\nUse item.id (from the backend or generated once on creation).\nNever generate keys with Math.random() during render: everything remounts.\nIndex keys are fine only for static lists that never reorder.",
          fix: `{items.map(item => (
  <li key={item.id}>
    <input defaultValue={item.name} />
  </li>
))}`,
          exercises: [
            { task: "Show the bug by sorting the list.", description: "Checks key understanding. Type in the first input, then sort reverse.", answer: "With index keys the typed value stays in the first row even though the item moved. With id keys the value moves with its item." },
            { task: "What happens if the key is a random number?", description: "Checks remount cost. Observe key={Math.random()} with the Profiler.", answer: "Every render creates new keys, so React unmounts and remounts every row, losing state and focus and costing performance." }
          ]
        },
        {
          q: "What is React memo? When should you use it?",
          short: "React.memo skips re-rendering a component when its props are shallowly equal to the previous ones; use it for expensive components that receive the same props often.",
          long: "By default a parent re-render re-renders all children.\nmemo compares props shallowly with Object.is.\nNew object/function props each render defeat memo, so stabilize them (useMemo/useCallback) or let React Compiler do it.\nDon't wrap everything: the comparison has a cost and adds complexity.\nMeasure with the Profiler first.\nState or context changes inside the memoized component still re-render it.",
          exercises: [
            { task: "Measure a list item before and after memo.", description: "Checks profiling. Use React DevTools 'Highlight updates' and Profiler.", answer: "Before, every item re-renders on parent state changes. After memo with stable props, only changed items render. Record commit times." },
            { task: "You pass an inline style object. Why does memo not help?", description: "Checks referential equality. Explain style={{ color: 'red' }}.", answer: "The inline object is new every render, so shallow comparison fails. Hoist it to a constant or memoize it." }
          ]
        },
        {
          q: "What is code splitting? How do you do it in React?",
          short: "Code splitting loads parts of the bundle on demand; in React use React.lazy with dynamic import() and <Suspense> for a loading fallback.",
          long: "Big bundles delay first load and interactivity.\nconst Page = lazy(() => import('./Page')) creates a separate chunk.\nWrap lazy components in <Suspense fallback={<Spinner/>}>.\nSplit by routes and heavy features (editors, charts), not tiny components.\nlazy needs a default export (or map named exports).\nUse a bundle analyzer to find big dependencies.",
          exercises: [
            { task: "Load a heavy chart only when the user opens its tab.", description: "Checks lazy + Suspense. Check the network tab for the new chunk.", answer: "Declare const Chart = lazy(() => import('./Chart')) at module level and render it inside Suspense when the tab is active. The chunk downloads only when needed." },
            { task: "Lazy is called inside the component. What goes wrong?", description: "Checks lazy placement. Explain behavior.", answer: "Calling lazy in render creates a new component type each render, causing remounts and state loss. Always declare lazy components at module scope." }
          ]
        }
      ],
      middle: [
        {
          q: "Fix this slow filter. Each key press filters a big list and typing feels slow.",
          code: `function Products({ products }) {
  const [query, setQuery] = useState("");
  const filtered = products.filter(p => expensiveMatch(p, query));
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <List items={filtered} />
    </>
  );
}`,
          short: "Keep the input urgent and defer the expensive list with useDeferredValue, memoizing the filter and the list so React can interrupt stale renders.",
          long: "Expensive synchronous work in the same render as the input update delays the keystroke.\nuseDeferredValue(query) gives a lagging value React renders at low priority.\nuseMemo on the deferred value avoids recomputation when unrelated state changes.\nmemo(List) lets the urgent render skip the list.\nShow staleness via query !== deferredQuery (e.g. dim the list).\nFor huge lists also virtualize.",
          fix: `const List = memo(function List({ items }) { /* ... */ });

function Products({ products }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const filtered = useMemo(
    () => products.filter(p => expensiveMatch(p, deferredQuery)),
    [products, deferredQuery]
  );
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <div style={{ opacity: query !== deferredQuery ? 0.6 : 1 }}>
        <List items={filtered} />
      </div>
    </>
  );
}`,
          exercises: [
            { task: "Compare input speed before and after the fix.", description: "Checks measurement. Use Chrome Performance panel with 4x CPU throttle and look at INP.", answer: "Before, input events show long tasks blocking the next paint. After, keystrokes paint quickly while the list renders in the background. INP improves noticeably." },
            { task: "How is debounce different from useDeferredValue?", description: "Checks concepts. Short comparison.", answer: "Debounce delays work by a fixed time even on fast devices; useDeferredValue renders as soon as possible and is interruptible. Debounce is still useful for network requests." }
          ]
        },
        {
          q: "How do you show a list of ten thousand rows quickly?",
          short: "Virtualize the list so only visible rows (plus overscan) are in the DOM, using libraries like TanStack Virtual or react-window.",
          long: "Rendering 10k DOM nodes costs memory, layout and render time.\nVirtualization renders a window of rows and positions them in a scroll container.\nKnown row heights are simplest; dynamic heights need measurement.\nKeep row components memoized and keys stable.\nConsider pagination or server-side filtering when users cannot use 10k rows anyway.\nMind accessibility: ARIA row counts and keyboard navigation.",
          exercises: [
            { task: "Use TanStack Virtual to show a long table.", description: "Checks implementation. Count DOM rows in DevTools while scrolling.", answer: "Use useVirtualizer with count, getScrollElement and estimateSize, render only virtualItems with absolute translateY. DOM row count stays around visible + overscan." },
            { task: "The browser search cannot find hidden rows. What do you do?", description: "Checks trade-offs. Explain the Ctrl+F limitation and mitigation.", answer: "Off-screen rows are not in the DOM, so browser search cannot find them. Provide in-app search/filter, or use content-visibility: auto for medium lists instead." }
          ]
        },
        {
          q: "How do you find what is slow in a React app before you optimize?",
          ai: true,
          short: "Reproduce on realistic devices, measure with React DevTools Profiler and the Chrome Performance panel, identify the costly component or task, then fix and re-measure.",
          long: "Start from a user-visible metric: INP, LCP, or a slow interaction.\nRecord a Profiler session to see which components rendered and why (enable 'record why').\nUse the Performance panel for long tasks, layout thrash and network.\nCheck production builds; dev mode is much slower.\nFix the biggest cost first and verify improvement.\nAdd RUM (web-vitals) to see real users.",
          exercises: [
            { task: "A modal opens slowly. Profile it and write what you find.", description: "Checks profiling workflow. Record and write findings.", answer: "Record opening the modal, sort commits by duration, inspect the heaviest components and their render reasons. Typical finding: the whole page re-renders because modal state lives at the top." },
            { task: "Send Web Vitals numbers from real users to a server.", description: "Checks RUM. Send INP/LCP to an endpoint.", answer: "Import onINP, onLCP, onCLS from web-vitals and send metrics with navigator.sendBeacon including route. Aggregate p75 per route in your analytics." }
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
            { task: "Measure the request chain in DevTools.", description: "Checks diagnosis. Throttle to Fast 4G and screenshot the network timeline.", answer: "Before, three sequential bars that start only after renders. After loader prefetching or a BFF, requests start before rendering or become one. Report the time to content difference." },
            { task: "Argue for one backend endpoint for this dashboard.", description: "Checks architecture reasoning. List pros and cons of a BFF.", answer: "Pros: one round trip, tailored payload, server-side joins. Cons: another service to maintain and coupling to UI. Worth it for critical dashboards on high-latency clients." }
          ]
        },
        {
          q: "How do transitions and Suspense make the app feel faster? What are the risks?",
          short: "Transitions mark updates as interruptible so urgent input stays responsive, and Suspense lets you show stable fallbacks; pitfalls include unexpected fallback flashes and work that cannot be interrupted.",
          long: "startTransition/useTransition keeps the old UI on screen while the new one renders.\nIf a transition suspends, React keeps showing old content instead of replacing it with a fallback.\nisPending lets you show subtle indicators.\nTransitions do not make slow code faster; a single heavy component still blocks.\nNon-transition updates that suspend show the nearest fallback, causing flashes.\nControlled input values cannot be updated in a transition.",
          exercises: [
            { task: "Switch tabs without showing the loading fallback.", description: "Checks transitions + Suspense. Implement with useTransition.", answer: "Wrap setTab in startTransition; React keeps the old tab visible while the new one suspends. Show isPending on the tab button." },
            { task: "A transition still feels slow with one heavy loop. Why?", description: "Checks limits. Explain with a 300ms synchronous loop.", answer: "React yields between components, not inside one component's render. A single 300ms render blocks the main thread; split the work or move it to a worker." }
          ]
        },
        {
          q: "How do you make the bundle smaller in a mature React app?",
          ai: true,
          short: "Analyze the bundle, remove or replace heavy dependencies, split by route and feature, ensure tree shaking works, and move non-interactive rendering to the server where possible.",
          long: "Start with a visual bundle analyzer and source-map-explorer.\nCommon culprits: moment/lodash full imports, icon libraries, charting, polyfills.\nCheck sideEffects and ESM to keep tree shaking working.\nLazy load rarely used features; prefetch likely ones.\nRSC can keep heavy rendering libraries (markdown, syntax highlight) off the client.\nAdd size budgets in CI (size-limit) to prevent regressions.",
          exercises: [
            { task: "Add a bundle size limit to CI.", description: "Checks prevention. Configure size-limit with a budget for the main chunk.", answer: "Add size-limit config with path and limit, run it in CI and fail when exceeded. Include its report in PR comments for visibility." },
            { task: "Icon imports make the bundle big. Fix it.", description: "Checks tree shaking. Compare root vs deep imports.", answer: "Barrel imports may pull every icon in dev or non-ESM builds; use per-icon imports or a plugin that rewrites them. Verify with the analyzer that only used icons remain." }
          ]
        }
      ],
      techlead: [
        {
          q: "Fix this store usage. Every component re-renders on any store change.",
          code: `const useStore = create(set => ({ user: null, cart: [], ui: {}, set }));

function CartBadge() {
  const { cart } = useStore();
  return <span>{cart.length}</span>;
}`,
          short: "Calling the store hook without a selector subscribes to the whole state; select the minimal value (primitive if possible) so components only update when it changes.",
          long: "Zustand compares the selected value; with no selector it is the whole state object.\nAny change (ui flag, user) re-renders CartBadge.\nSelect primitives: useStore(s => s.cart.length).\nFor multiple values use useShallow to compare shallowly.\nAgree on this as a team convention and lint for it.\nThe same principle applies to Redux useSelector and context splitting.",
          fix: `function CartBadge() {
  const count = useStore(s => s.cart.length);
  return <span>{count}</span>;
}

// multiple fields
import { useShallow } from "zustand/react/shallow";
const { name, email } = useStore(useShallow(s => ({ name: s.user?.name, email: s.user?.email })));`,
          exercises: [
            { task: "Prove the fix with the Profiler.", description: "Checks measurement. Toggle a UI flag and see if CartBadge renders.", answer: "Before, CartBadge appears in every commit. After, it renders only when cart length changes. Include the profiler evidence in the PR." },
            { task: "Write a lint rule or review rule for store usage.", description: "Checks governance. Describe enforcement.", answer: "Ban destructuring from useStore() without a selector via no-restricted-syntax, and document selector patterns. Reviewers check for whole-store subscriptions." }
          ]
        },
        {
          q: "How do you make performance a habit across many React teams?",
          ai: true,
          short: "Define user-centric budgets per route (LCP, INP, JS size), automate checks in CI, monitor RUM in production, and give teams ownership and time to fix regressions.",
          long: "Pick a few metrics everyone understands: p75 LCP, INP, CLS, JS per route.\nBudgets in CI (Lighthouse CI, size-limit) catch regressions before merge.\nRUM dashboards per team/route show real impact.\nMake regressions visible in PRs, not quarterly audits.\nReserve capacity each sprint for performance debt.\nCelebrate wins with before/after data to keep momentum.",
          exercises: [
            { task: "Set performance limits for three pages.", description: "Checks budget design. Give numbers and reasons.", answer: "Landing: LCP under 2.5s, 150 KB JS. Search: INP under 200ms. Editor: allowed 400 KB JS but lazy loaded after shell. Targets reflect user expectations and device mix." },
            { task: "A pull request breaks a limit. What is the process?", description: "Checks process. Describe the workflow.", answer: "CI fails or warns with the diff; the PR author either fixes or requests a time-boxed exception with an owner and ticket. Exceptions are reviewed regularly." }
          ]
        },
        {
          q: "Your app reacts slowly to clicks on cheap Android phones. What is your plan?",
          short: "Reduce main-thread work per interaction: break long tasks, render less (virtualization, deferral), ship less JS, move work to workers or the server, and test on real low-end devices.",
          long: "INP measures the slowest interactions; low-end CPUs amplify long tasks.\nIdentify slow interactions with RUM attribution (web-vitals attribution build).\nYield to the main thread (scheduler.yield, transitions) and split heavy handlers.\nAvoid layout thrashing and large re-render trees on input.\nCut hydration cost: less client JS, RSC, partial hydration.\nTest on a real low-end device lab or CPU throttling, validated by field data.",
          exercises: [
            { task: "Find the slowest click with web-vitals attribution.", description: "Checks diagnosis. Log interaction target and phases.", answer: "Use onINP from web-vitals/attribution and log interactionTarget plus input delay, processing and presentation times. Group by target to find the worst handlers." },
            { task: "A click handler takes 400 milliseconds. Split it up.", description: "Checks long task mitigation. Show the approach.", answer: "Update the visible state first, then yield (await scheduler.yield() or setTimeout) before heavy work, or move computation to a Web Worker. The next paint happens quickly, lowering INP." }
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
            { task: "Count the open connections in DevTools.", description: "Checks the leak. Open the Network WS tab before and after the fix.", answer: "Before, connections multiply with each message. After, one connection exists (two briefly in Strict Mode dev, then one). Unmounting closes it." },
            { task: "Let the parent choose which price to follow.", description: "Checks dependencies. Add a symbol prop.", answer: "Include the URL/symbol in deps so the effect closes the old socket and opens a new one when it changes. The cleanup prevents leaks." }
          ]
        },
        {
          q: "How do you connect React to a REST API in a clean way?",
          short: "Put HTTP calls in a small API layer, use a data-fetching library (TanStack Query) for caching and loading/error states, and keep components focused on rendering.",
          long: "Components should not build URLs and parse responses everywhere.\nAn API module centralizes base URL, auth headers and error handling.\nTanStack Query handles caching, deduping, retries and refetching.\nMutations invalidate related queries to refresh data.\nType responses with TypeScript and validate if the backend is not trusted.\nKeep secrets on the server; the browser bundle is public.",
          exercises: [
            { task: "Write a hook that loads todos with TanStack Query.", description: "Checks basics. Use useQuery with queryKey ['todos'].", answer: "Write api.getTodos() and useQuery({ queryKey: ['todos'], queryFn: api.getTodos }). Components read data, isPending and error. Refetching and caching come for free." },
            { task: "Add a todo, then refresh the list.", description: "Checks invalidation. Use useMutation.", answer: "useMutation({ mutationFn: api.addTodo, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }) }). The list refetches after adding." }
          ]
        },
        {
          q: "What are environment variables in a Vite React app? What must you never put there?",
          short: "Vite exposes variables prefixed VITE_ via import.meta.env at build time; they end up in the public bundle, so never put secrets there.",
          long: "Only VITE_-prefixed variables are exposed to client code.\nValues are inlined at build time, not read at runtime.\nAnyone can read them in the bundle, so API keys with privileges must stay on a server.\nNext.js uses NEXT_PUBLIC_ for client-exposed variables.\nFor runtime config per environment, fetch a config file or inject it in HTML.\nCommit .env.example, not real .env files.",
          exercises: [
            { task: "Show that a Vite variable appears in the built files.", description: "Checks understanding. Build and grep the dist folder.", answer: "Run the build and search dist for the value; it is in plain text. This demonstrates why secrets cannot live there." },
            { task: "Move a call with a private key behind your own server.", description: "Checks secure integration. Describe the change.", answer: "Create a server endpoint that holds the key and calls the third-party API; the React app calls your endpoint. Add auth and rate limiting to that endpoint." }
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
            { task: "Test that three failed requests cause only one refresh.", description: "Checks dedup. Use MSW returning 401 and count refresh calls.", answer: "Fire three api() calls with Promise.all; MSW returns 401 for the first attempts. Assert the refresh handler ran once and all three succeed on retry." },
            { task: "Handle the case when the refresh fails.", description: "Checks failure path. Implement logout.", answer: "If refreshOnce rejects, clear session state and redirect to /login once (guard with a flag). Do not retry endlessly." }
          ]
        },
        {
          q: "How do you build forms with validation in a large React app?",
          short: "Use a form library (react-hook-form) with schema validation (zod/yup) shared with the backend where possible, and keep fields uncontrolled for performance.",
          long: "react-hook-form registers inputs and avoids re-rendering the whole form per keystroke.\nSchemas define rules once and give TypeScript types.\nShow errors accessibly (aria-invalid, aria-describedby).\nMap server validation errors back to fields with setError.\nIn React 19/Next, forms can use actions with useActionState for progressive enhancement.\nBuild reusable field components wrapping the design system.",
          exercises: [
            { task: "Build a sign up form with zod and react-hook-form.", description: "Checks integration. Use zodResolver and test with RTL.", answer: "Define a schema, use useForm({ resolver: zodResolver(schema) }), register fields and render errors. Tests type invalid values and assert error messages appear." },
            { task: "The server says the email already exists. Show it on the email field.", description: "Checks server errors. Use setError for a 409 response.", answer: "In the submit catch, call setError('email', { message: 'Email already registered' }). The field shows the error and gets focus." }
          ]
        },
        {
          q: "How do you share state between React and a third-party widget or an iframe?",
          ai: true,
          short: "Use explicit integration contracts: props/callbacks for embedded components, custom events or a small pub/sub for non-React code, and postMessage with origin checks for iframes.",
          long: "Treat the widget as an external system; React should not reach into its internals.\nWrap it in a component that syncs props to its API in effects.\nListen to its events and update React state via callbacks.\nFor iframes, use postMessage with strict targetOrigin and event.origin checks.\nDefine message schemas and version them.\nClean up listeners on unmount.",
          exercises: [
            { task: "Write a safe message bridge for an iframe.", description: "Checks secure messaging. Write typed send and listen helpers with postMessage.", answer: "send(msg) calls iframe.contentWindow.postMessage(msg, ALLOWED_ORIGIN). The listener checks event.origin and validates msg.type before handling. Remove listeners in cleanup." },
            { task: "Why is a star as the target origin dangerous?", description: "Checks security. Short answer about '*'.", answer: "If the iframe navigates to another origin, your data goes to whoever loaded it. Always pass the exact expected origin." }
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
            { task: "Find out at runtime if two React copies are loaded.", description: "Checks diagnosis. Compare React identities.", answer: "Log the React version and compare module identity in host and remote, or inspect loaded chunks for two react-dom copies. After the fix only one exists." },
            { task: "Write a React version rule for all teams.", description: "Checks governance. Write rules.", answer: "Same React major across all apps, upgraded together; shared deps declared in a common config package; CI fails on mismatch. Breaking upgrades coordinated by a platform team." }
          ]
        },
        {
          q: "How do you build live updates in React without too many renders?",
          short: "Keep the connection in a single external store, batch and throttle updates, normalize data, and subscribe components to narrow slices.",
          long: "High-frequency messages can trigger hundreds of renders per second.\nOne connection per app, managed outside components.\nBuffer messages and flush on animation frames or intervals.\nNormalize entities by id so updates touch only affected rows.\nComponents subscribe via selectors (useSyncExternalStore, Zustand).\nHandle reconnection, backoff and resync of missed messages.",
          exercises: [
            { task: "Group incoming messages and apply them once per frame.", description: "Checks throttling. Implement a buffer flushed with requestAnimationFrame.", answer: "Push messages into a map keyed by id; schedule a rAF flush if not scheduled; in the flush apply all updates to the store once. Rendering happens at most once per frame." },
            { task: "Design reconnect logic that also loads missed data.", description: "Checks reliability. Outline steps.", answer: "On disconnect, retry with exponential backoff and jitter; on reconnect send the last sequence number or refetch a snapshot. Show a 'reconnecting' indicator." }
          ]
        },
        {
          q: "How do you move a large old React codebase to hooks and React 19?",
          ai: true,
          short: "Upgrade incrementally: get on the latest minor with no warnings, enable Strict Mode, fix deprecated APIs with codemods, and convert components opportunistically when touched, backed by tests.",
          long: "First upgrade React to the latest 18.x and fix all deprecation warnings.\nRun official codemods (react-codemod, types-react-codemod) for 19 changes like removed propTypes and string refs.\nEnable Strict Mode per subtree to find unsafe effects.\nClass components still work; convert when modifying, not as a rewrite.\nAdd tests around risky areas before refactoring.\nTrack progress with metrics (warnings count, class component count).",
          exercises: [
            { task: "Name four React 19 breaking changes that affect old code.", description: "Checks upgrade knowledge. Name 4.", answer: "Removed: propTypes checks and defaultProps for function components, string refs, legacy context, ReactDOM.render/hydrate (use createRoot/hydrateRoot), and the UMD builds. Render errors are also no longer re-thrown the same way." },
            { task: "Plan the order of steps for the upgrade.", description: "Checks sequencing. Outline phases.", answer: "Clean warnings on 18.3, run codemods, upgrade dependencies that peer-depend on React, then upgrade to 19 behind thorough tests. Finally adopt new features gradually." }
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
            { task: "Plan the move away from the old props.", description: "Checks change management. Outline steps.", answer: "Ship the compound API alongside, mark old props deprecated with dev warnings, provide a codemod, and remove in the next major after usage hits zero. Track usage via code search." },
            { task: "Describe how teams can add changes to the design system.", description: "Checks governance. Describe how teams propose changes.", answer: "RFC or issue template, design + a11y review, Storybook story and tests required, release with changelog. Office hours help teams contribute rather than fork." }
          ]
        },
        {
          q: "How do you test and bring in a new frontend tool across the company?",
          ai: true,
          short: "Start from a concrete problem, run a time-boxed spike with success criteria, pilot on one product, document trade-offs in an ADR, and plan support, training and exit costs.",
          long: "Technology should solve a measured problem, not follow hype.\nDefine success metrics (performance, DX, defects) before the spike.\nPilot with one team in a real but low-risk area.\nWrite an ADR with alternatives, risks and migration/exit plan.\nInvest in docs, examples and lint rules so adoption is consistent.\nRevisit the decision after a fixed period with data.",
          exercises: [
            { task: "Write the outline of a decision record for TanStack Query.", description: "Checks decision documentation. List ADR sections.", answer: "Context and problem, options considered, decision, consequences (positive and negative), migration plan, and review date. Include metrics from the pilot." },
            { task: "When do you stop a pilot? Give examples.", description: "Checks risk management. Give exit criteria.", answer: "Abort if bundle grows over a threshold, if bugs increase, or if the team cannot onboard within two weeks. Exit criteria prevent sunk-cost adoption." }
          ]
        },
        {
          q: "How do you organize one repository with many React apps and shared packages?",
          short: "Use a workspace tool (pnpm + Turborepo/Nx) with apps and packages folders, clear ownership, enforced dependency boundaries, shared configs, and affected-only CI.",
          long: "apps/ for deployables, packages/ for UI, utils, API clients and configs.\nShare ESLint, TypeScript and test configs as packages.\nEnforce boundaries (apps cannot import other apps) with lint rules or Nx tags.\nUse CODEOWNERS for ownership.\nCache builds and run only affected tasks in CI.\nVersion shared packages internally (workspace protocol) or with changesets if published.",
          exercises: [
            { task: "Draw the folders for three apps and a design system.", description: "Checks organization. Provide a tree.", answer: "apps/admin, apps/portal, apps/marketing; packages/ui, packages/api-client, packages/config-eslint, packages/config-ts. Each package has an owner and README." },
            { task: "Make CI run only for the changed packages.", description: "Checks scalability. Describe with Turborepo.", answer: "Run turbo run test lint build --filter=...[origin/main] so only changed packages and dependents run, with remote caching enabled. CI time scales with the change, not repo size." }
          ]
        }
      ]
    }
  }
};
