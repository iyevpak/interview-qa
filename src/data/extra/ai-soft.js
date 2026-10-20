// Extra questions: AI Tooling + Soft Skills
const ex = (task, description, answer, code, solution) => {
  const e = { task, description, answer };
  if (code) e.code = code;
  if (solution) e.solution = solution;
  return e;
};
// Role-play exercise for soft skills: code = scenario, answer = what a strong reply contains + red flags.
const rp = (task, scenario, answer, solution) =>
  ex(task, 'Role-play. The interviewer plays the other person and reads the scenario aloud.', answer, scenario, solution);

export default {
  'AI Tooling': {
    'Claude API': {
      junior: [
        {
          q: 'What does the content field look like in a Claude response? How do you get the text out?',
          short: 'content is an array of blocks, each with a type such as "text" or "tool_use". You filter the text blocks and join their text.',
          long: `A response is not a plain string: content is a list of typed blocks.
Most simple replies have one text block, but tool calls or thinking add other block types.
Strong: filter by type === "text", join, and handle an empty result.
Weak: always reads content[0].text and crashes when the first block is tool_use.
Red flag: parsing the raw JSON string with regex.`,
          code: `const msg = await client.messages.create({ model: 'claude-haiku-5-5', max_tokens: 512, messages });
const answer = msg.content[0].text;`,
          fix: `const answer = msg.content
  .filter((b) => b.type === 'text')
  .map((b) => b.text)
  .join('');
if (!answer) throw new Error('No text in response, stop_reason=' + msg.stop_reason);`,
          follow: 'When can the first block be something other than text?',
          exercises: [
            ex("Write a helper that returns all text from a message.", "Checks content block handling.", "Filter blocks by type \"text\", map to text, and join. content[0] may be a tool_use or thinking block.", "const textOf = (msg) => /* ? */;", `const textOf = (msg) =>
  msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('');`),
            ex("Predict what this logs.", "Checks the usage field in responses.", "It logs input and output token counts, for example { input_tokens: 12, output_tokens: 40 }. Log it to track cost.", `const msg = await client.messages.create({ model, max_tokens: 100, messages });
console.log(msg.usage);`),
          ],
        },
        {
          q: 'Which Claude model would you pick for a simple text classifier? Why?',
          short: 'Usually claude-haiku-5-5: it is the fastest and cheapest, and classification is a simple task. Move up to Sonnet only if evals show Haiku is not accurate enough.',
          long: `Opus is the most capable and most expensive, Sonnet is the balanced default, Haiku is fast and cheap.
Strong: picks by task difficulty, latency and cost, and checks the choice with a small eval set.
Weak: "always use the biggest model".
Red flag: no idea that models differ in price or speed.
Bonus: keeps the model id in config so it is easy to change.`,
          follow: 'How would you prove that the cheaper model is good enough?',
          exercises: [
            ex("Pick a model for each feature.", "Checks model trade-offs.", "Haiku for fast tagging, Sonnet for summaries, Opus for hard multi-step reasoning. Confirm with a small eval.", "// a) tag 1M tickets  b) summarize a review  c) deep architecture analysis"),
            ex("Fix the hardcoded model name.", "Checks config hygiene for model ids.", "Read the model id from config so you can change it per feature or environment without code changes.", "await client.messages.create({ model: 'claude-opus-5-5', max_tokens: 50, messages });", "await client.messages.create({ model: config.classifierModel, max_tokens: 50, messages });"),
          ],
        },
        {
          q: 'What does the system prompt do? Where do you put it in the request?',
          short: 'The system prompt sets role, rules and context for the whole conversation. It is a top-level system parameter, not a message with role "system".',
          long: `The Messages API only accepts "user" and "assistant" roles inside messages.
Instructions like tone, format and limits go in the top-level system field.
Strong: knows the field, keeps the system prompt stable, puts per-request data in the user message.
Weak: sends { role: "system" } inside messages and gets a 400 error.
Red flag: puts secrets in the system prompt and thinks users can never see them.`,
          code: `await client.messages.create({
  model: 'claude-sonnet-5-5', max_tokens: 1024,
  messages: [{ role: 'system', content: 'You are a helpful assistant.' }, { role: 'user', content: q }],
});`,
          fix: `await client.messages.create({
  model: 'claude-sonnet-5-5', max_tokens: 1024,
  system: 'You are a helpful assistant.',
  messages: [{ role: 'user', content: q }],
});`,
          exercises: [
            ex("Fix the request.", "Checks where the system prompt goes.", "There is no \"system\" role in messages, so the API returns 400. Use the top-level system parameter.", `await client.messages.create({ model, max_tokens: 512,
  messages: [{ role: 'system', content: 'Reply in French.' }, { role: 'user', content: q }],
});`, `await client.messages.create({ model, max_tokens: 512,
  system: 'Reply in French.',
  messages: [{ role: 'user', content: q }],
});`),
            ex("Say what goes in system vs the user message.", "Checks separating rules from data.", "Stable rules, role and format go in system. Per-request data like the user question or document goes in the user message."),
          ],
        },
      ],
      middle: [
        {
          q: 'How do you stream a Claude response to the browser? Show the server side.',
          short: 'Use client.messages.stream() on the server, listen for text deltas, and forward them to the browser with Server-Sent Events or a streamed fetch response.',
          long: `Streaming cuts time to first token, which matters for chat UIs.
The SDK stream gives text events and a finalMessage() with usage and stop_reason.
Strong: streams through the backend, aborts when the client disconnects, sends errors as an event, logs final usage.
Weak: waits for the full response and then "fakes" streaming.
Red flag: calls the API directly from the browser with the key.`,
          code: `app.post('/chat', async (req, res) => {
  const stream = client.messages.stream({ model: 'claude-sonnet-5-5', max_tokens: 1024, messages: req.body.messages });
  stream.on('text', (t) => res.write(t));
});`,
          fix: `app.post('/chat', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  const stream = client.messages.stream({ model: 'claude-sonnet-5-5', max_tokens: 1024, messages: req.body.messages });
  req.on('close', () => stream.abort());
  stream.on('text', (t) => res.write(\`data: \${JSON.stringify(t)}\\n\\n\`));
  try {
    const final = await stream.finalMessage();
    log.info({ usage: final.usage, stop: final.stop_reason });
    res.write('event: done\\ndata: {}\\n\\n');
  } catch (e) {
    res.write(\`event: error\\ndata: \${JSON.stringify(e.message)}\\n\\n\`);
  } finally { res.end(); }
});`,
          follow: 'What happens to cost if the user closes the tab and you do not abort?',
          exercises: [
            ex("Fix the stream so it stops when the user leaves.", "Checks aborting streams on disconnect.", "Without abort, generation keeps running and you pay for tokens nobody reads. Abort on request close.", `const stream = client.messages.stream({ model, max_tokens: 1024, messages });
stream.on('text', (t) => res.write(t));`, `const stream = client.messages.stream({ model, max_tokens: 1024, messages });
req.on('close', () => stream.abort());
stream.on('text', (t) => res.write(t));`),
            ex("Name the SDK method that returns the full final message.", "Checks the SDK streaming helpers.", "await stream.finalMessage() gives the full message with usage and stop_reason after the stream ends.", `const stream = client.messages.stream({ model, max_tokens: 1024, messages });
const msg = await stream./* ? */();`, "const msg = await stream.finalMessage();"),
          ],
        },
        {
          q: 'Show the full tool use loop. What do you send back after Claude asks for a tool?',
          short: 'When stop_reason is "tool_use", run each tool_use block, then send a user message with tool_result blocks that match each tool_use_id. Repeat until stop_reason is "end_turn".',
          long: `Claude never runs tools itself; your code does.
You must keep the assistant message with its tool_use blocks in history, then add a user message with a tool_result for every tool_use id.
Strong: loops with a max iteration limit, validates tool input, returns is_error: true on failures.
Weak: sends only the tool output as plain text, or drops the assistant turn.
Red flag: runs tool input, like shell commands, without validation.`,
          code: `const r = await client.messages.create({ model, max_tokens: 1024, tools, messages });
if (r.stop_reason === 'tool_use') {
  const call = r.content.find((b) => b.type === 'tool_use');
  const out = await runTool(call.name, call.input);
  messages.push({ role: 'user', content: JSON.stringify(out) });
}`,
          fix: `for (let i = 0; i < 10; i++) {
  const r = await client.messages.create({ model, max_tokens: 1024, tools, messages });
  messages.push({ role: 'assistant', content: r.content });
  if (r.stop_reason !== 'tool_use') return r;
  const results = [];
  for (const call of r.content.filter((b) => b.type === 'tool_use')) {
    try {
      const out = await runTool(call.name, call.input);
      results.push({ type: 'tool_result', tool_use_id: call.id, content: JSON.stringify(out) });
    } catch (e) {
      results.push({ type: 'tool_result', tool_use_id: call.id, content: e.message, is_error: true });
    }
  }
  messages.push({ role: 'user', content: results });
}
throw new Error('Tool loop limit reached');`,
          exercises: [
            ex("Fix how the tool result is sent back.", "Checks the tool_result block format.", "Send a tool_result block with the matching tool_use_id in a user message, after appending the assistant turn.", "messages.push({ role: 'user', content: JSON.stringify(out) });", `messages.push({ role: 'assistant', content: r.content });
messages.push({ role: 'user', content: [
  { type: 'tool_result', tool_use_id: call.id, content: JSON.stringify(out) },
] });`),
            ex("Spot the bug in this loop.", "Checks loop limits in tool use.", "There is no iteration cap, so a confused model can loop forever and burn money. Add a max steps limit.", `while (true) {
  const r = await client.messages.create({ model, max_tokens: 1024, tools, messages });
  if (r.stop_reason !== 'tool_use') return r;
  await runTools(r, messages);
}`, `for (let step = 0; step < 10; step++) {
  const r = await client.messages.create({ model, max_tokens: 1024, tools, messages });
  if (r.stop_reason !== 'tool_use') return r;
  await runTools(r, messages);
}
throw new Error('Too many tool steps');`),
          ],
        },
        {
          q: 'What is prompt caching? How do you turn it on for a long system prompt?',
          short: 'You mark a stable prefix with cache_control: { type: "ephemeral" }. Later requests with the same prefix read it from cache, which is cheaper and faster.',
          long: `Caching works on the exact prefix: tools, then system, then messages, up to the marked block.
Cache reads cost much less than normal input; the first write costs a bit more. The default lifetime is short, a few minutes.
Strong: puts stable content first and dynamic content last, and checks cache_read_input_tokens in usage.
Weak: puts a timestamp at the start of the system prompt, so the cache never hits.
Red flag: thinks caching stores answers. It caches the input prefix, not the output.`,
          code: `system: [{ type: 'text', text: \`Today is \${new Date().toISOString()}\\n\${LONG_DOCS}\`, cache_control: { type: 'ephemeral' } }]`,
          fix: `system: [
  { type: 'text', text: LONG_DOCS, cache_control: { type: 'ephemeral' } },
  { type: 'text', text: \`Today is \${new Date().toISOString().slice(0, 10)}\` },
]`,
          exercises: [
            ex("Add prompt caching to the long system prompt.", "Checks cache_control placement.", "Make system an array of text blocks and add cache_control: { type: \"ephemeral\" } on the stable block.", "system: LONG_RULES,", `system: [
  { type: 'text', text: LONG_RULES, cache_control: { type: 'ephemeral' } },
],`),
            ex("Spot why the cache never hits.", "Checks that cached prefixes must be identical.", "The timestamp changes the prefix every request, so the cache misses. Move changing data after the cached part.", `system: [{ type: 'text', cache_control: { type: 'ephemeral' },
  text: \`Now: \${new Date().toISOString()}\\n\${LONG_RULES}\` }],`),
          ],
        },
      ],
      senior: [
        {
          q: 'How do you handle rate limits and overloaded errors from the Claude API?',
          short: 'Retry 429 and 529 or other 5xx errors with exponential backoff and jitter, respect retry-after, set timeouts, and limit concurrency. Do not retry 400-level validation errors.',
          long: `The SDK already retries some errors through maxRetries; know the default and tune it.
Strong: classifies errors, uses a queue or semaphore, has a fallback model or degraded UX, alerts on error rate.
Also: idempotency on your side, so retries do not repeat side effects from tools.
Weak: an endless retry loop with no delay.
Red flag: retrying a 400 forever or swallowing errors silently.`,
          code: `async function ask(p) {
  while (true) {
    try { return await client.messages.create(p); } catch (e) { /* try again */ }
  }
}`,
          fix: `const client = new Anthropic({ maxRetries: 0, timeout: 60_000 });
async function ask(p, attempts = 5) {
  for (let i = 0; i < attempts; i++) {
    try { return await client.messages.create(p); }
    catch (e) {
      const retryable = e.status === 429 || e.status >= 500;
      if (!retryable || i === attempts - 1) throw e;
      const ra = Number(e.headers?.['retry-after']) * 1000;
      await sleep(ra || Math.min(30_000, 2 ** i * 500) * (0.5 + Math.random()));
    }
  }
}`,
          exercises: [
            ex("Name which errors you should retry.", "Checks retryable vs non-retryable errors.", "Retry 429 rate limit and 529 overloaded with backoff. Do not retry 400 or 401; fix the request instead.", `400 invalid_request_error
401 authentication_error
429 rate_limit_error
529 overloaded_error`),
            ex("Fix the retry loop.", "Checks exponential backoff with jitter.", "Immediate retries hammer the API. Wait longer each time with jitter, and respect the retry-after header if present.", `for (let i = 0; i < 5; i++) {
  try { return await call(); } catch { /* retry now */ }
}`, `for (let i = 0; i < 5; i++) {
  try { return await call(); }
  catch (e) { if (![429, 529].includes(e.status)) throw e;
    await sleep(2 ** i * 500 + Math.random() * 250); }
}`),
          ],
        },
        {
          q: 'A conversation is close to the context window limit. How do you manage it?',
          short: 'Track token use, then trim or summarize old turns, keep key facts in a stable memory block, and fetch details on demand instead of sending everything.',
          long: `Sending the full history every turn grows cost and latency, and in the end the request fails.
Strong: counts tokens with the count_tokens endpoint or usage, summarizes older turns, keeps tool_use and tool_result pairs together, caches the stable prefix.
Weak: cuts messages from the front without care, breaking tool pairs or leaving an assistant message first.
Red flag: "just use a bigger model" with no thought about cost.`,
          follow: 'What breaks if you drop a tool_use block but keep its tool_result?',
          exercises: [
            ex("Name two ways to keep a long chat under the limit.", "Checks context management strategies.", "Summarize older turns into a short note, and keep only the last N messages. Count tokens before sending.", `// chat history: 220 messages, ~190k tokens
// context window: 200k tokens`),
            ex("Write the call to count tokens before sending.", "Checks the token counting endpoint.", "Use client.messages.countTokens with the same model, system and messages. It returns input_tokens.", "// how many input tokens will this request use?", `const { input_tokens } = await client.messages.countTokens({ model, system, messages });
if (input_tokens > LIMIT) messages = await summarizeOld(messages);`),
          ],
        },
        {
          q: 'How do you send an image or a PDF to Claude in the Messages API?',
          short: 'Put a content block of type "image" or "document" in the user message, with a base64 source (and media_type) or a URL source, next to a text block with your question.',
          long: `User content can be an array of blocks: text, image, document.
        Image source: { type: "base64", media_type: "image/png", data } or { type: "url", url }. PDFs use type "document" with media_type "application/pdf".
        Strong: validates file type and size on the server, puts the file before the question, knows images and PDFs cost input tokens.
        Weak: pastes base64 into a text string.
        Red flag: sends user files from the browser with the API key.`,
          code: `messages: [{ role: 'user', content: 'Describe this: ' + base64Png }]`,
          fix: `messages: [{ role: 'user', content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/png', data: base64Png } },
          { type: 'text', text: 'Describe this screenshot. List any UI errors you see.' },
        ] }]`,
          follow: 'How does a large PDF affect cost and latency?',
          exercises: [
            ex("Fix the image block.", "Checks the image content block format.", "Images use type \"image\" with a source object: base64 data plus media_type, or a URL source.", "content: [{ type: 'image', data: b64 }, { type: 'text', text: 'Describe it.' }]", `content: [
  { type: 'image', source: { type: 'base64', media_type: 'image/png', data: b64 } },
  { type: 'text', text: 'Describe it.' },
]`),
            ex("Write the content block to send a PDF.", "Checks the document content block.", "Use a document block with a base64 source and media_type \"application/pdf\", then add your question as text.", "content: [ /* PDF here */, { type: 'text', text: 'Summarize.' }]", `content: [
  { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfB64 } },
  { type: 'text', text: 'Summarize.' },
]`),
          ],
        },
      ],
      techlead: [
        {
          q: 'How do you control and forecast Claude API costs for the whole team?',
          short: 'Tag every call with feature and user, log usage tokens, set per-feature budgets and alerts, and use model routing, caching and batching to reduce spend.',
          long: `Cost is tokens times the price of the model; input often dominates in RAG and agents.
Strong: one shared client wrapper with metadata, dashboards per feature, budgets for eval runs, separate keys or workspaces per environment.
Levers: a smaller model where evals allow, prompt caching, the Batches API for offline jobs, shorter outputs.
Weak: looks at the invoice once a month.
Red flag: no per-feature attribution, so nobody owns cost.`,
          exercises: [
            ex("Estimate the monthly cost.", "Checks token-based cost forecasting.", "Input: 10k×30×2k = 600M tokens, output: 150M tokens. Multiply each by its per-token price; output usually dominates per token.", `// 10,000 requests/day, 30 days
// avg 2,000 input + 500 output tokens per request`),
            ex("Name two controls for team API spend.", "Checks cost guardrails.", "Per-feature budgets with alerts on usage, and separate API keys or workspaces per team. Add caching and model tiering.", `// month 1: $800   month 2: $6,400
// nobody knows which feature caused it`),
          ],
        },
        {
          q: 'A new model version comes out. How does your team decide to switch?',
          short: 'Run the same eval suite on the old and new models, compare quality, latency and cost, roll out behind a flag with a canary, and keep a quick rollback.',
          long: `Model upgrades change behavior even when quality improves.
Strong: versioned prompts, golden datasets, automatic scoring plus human spot checks, staged rollout, monitoring.
Weak: changes the model string in production because "newer is better".
Red flag: no eval suite at all, so customers find the regressions.`,
          follow: 'Which metric would make you roll back?',
          exercises: [
            ex("Name the three steps before switching models.", "Checks safe model migration.", "Run the eval set on the new model, compare quality, cost and latency, then roll out behind a flag with rollback.", `// new model: claude-sonnet-5-5
// current:   claude-sonnet-4-5`),
            ex("Fix this so a switch is safe.", "Checks feature-flagged model rollout.", "Changing one constant switches everyone at once. Use config or a flag to roll out gradually.", "const MODEL = 'claude-sonnet-5-5'; // just bump it", `const model = flags.isOn('new-model', user)
  ? 'claude-sonnet-5-5'
  : config.currentModel;`),
          ],
        },
        {
          q: 'An LLM feature can take real actions for users. Where do you put the guardrails?',
          short: 'In code around the model: auth checks inside each tool, allowlists, input validation, human confirmation for risky actions, and audit logs. The prompt is not the guardrail.',
          long: `The model can be manipulated through user input or injected content.
Strong: tools run with the user's permissions only, destructive actions need confirmation, limits on amount and rate, full audit trail, red-team tests.
Weak: "the system prompt says never delete data".
Red flag: tools that use an admin service account for every user.`,
          exercises: [
            ex("Spot the missing guardrail.", "Checks human confirmation for risky actions.", "The model can send refunds directly. Require user confirmation and amount limits on the server.", `if (call.name === 'refund') {
  await payments.refund(call.input.orderId, call.input.amount);
}`, `if (call.name === 'refund') {
  if (call.input.amount > MAX_AUTO_REFUND) return needsHumanApproval(call);
  return askUserToConfirm(call);
}`),
            ex("Name two layers for action guardrails.", "Checks defense in depth.", "Server-side permission checks with the user scope, and confirmation for irreversible actions. Plus audit logs."),
          ],
        },
      ],
    },
    'Agentic coding workflows': {
      junior: [
        {
          q: 'What is plan mode in Claude Code? When should you use it?',
          short: 'Plan mode lets the agent read and research but not edit files. It proposes a plan first, and you approve it before any change.',
          long: `Useful for unfamiliar code, larger changes, or when you want to check the approach early.
Strong: reads the plan critically, corrects wrong assumptions, then lets it run.
Weak: approves without reading.
Red flag: uses full auto mode on a task they do not understand.`,
          follow: 'What do you look for in a plan before you approve it?',
          exercises: [
            ex("Pick tasks that need plan mode first.", "Checks when planning pays off.", "The auth refactor and the new feature: multi-file, risky changes. A typo fix does not need a plan.", "// a) fix a typo  b) refactor auth across 12 files  c) add a new checkout step"),
            ex("Name what plan mode stops the agent from doing.", "Checks plan mode behavior.", "It explores and proposes a plan without editing files or running changing commands until you approve."),
          ],
        },
        {
          q: 'The agent wants to run a shell command you do not understand. What do you do?',
          short: 'Do not approve it. Ask the agent to explain the command, or look it up, and allow it only if it is safe and needed.',
          long: `Permission prompts are the main safety control in agent tools.
Strong: reads every command, rejects destructive or network commands without a reason, asks for an explanation.
Weak: clicks "always allow" to go faster.
Red flag: approves rm -rf, git push --force or curl piped to sh without thinking.`,
          exercises: [
            ex("Explain what this command does before allowing it.", "Checks reading commands before approving.", "It deletes files in the parent folder and the home folder without asking. Deny it and ask why.", "rm -rf ../* ~/project-old"),
            ex("Name two things to do with a command you do not understand.", "Checks safe approval habits.", "Ask the agent to explain it, and check docs or man pages. Deny if unsure; never approve blindly."),
          ],
        },
        {
          q: 'How do you check that the agent really finished the task?',
          short: 'Run the tests and the app yourself, read the diff, and compare it with the original requirement. Do not trust a "done" message alone.',
          long: `Agents can claim success while tests were skipped or a step failed.
Strong: reviews git diff, runs build, lint and tests, tries the feature by hand.
Weak: trusts the summary.
Red flag: commits without reading the diff.`,
          exercises: [
            ex("Spot the problem with this agent report.", "Checks verifying agent claims.", "It skipped a test, so \"all pass\" is not real proof. Run the tests yourself and check the diff.", `Agent: "Done! All tests pass."
diff: + it.skip('handles empty cart', ...)`),
            ex("Name two checks that prove the task is done.", "Checks evidence-based completion.", "Run tests, lint and build yourself, and check the feature in the app against the acceptance criteria."),
          ],
        },
      ],
      middle: [
        {
          q: 'What are hooks in Claude Code? Give two useful examples.',
          short: 'Hooks are shell commands that run on agent events like PreToolUse or PostToolUse. Examples: block edits to secret files, or run a formatter after each edit.',
          long: `Hooks live in settings and are run by the harness, not by the model, so they always run.
A PreToolUse hook can block a call by exit code or JSON output; PostToolUse reacts after the call.
Strong: uses hooks for rules that must always hold, and keeps them fast.
Weak: writes "always run prettier" in CLAUDE.md and expects 100% compliance.
Red flag: slow hooks on every tool call that freeze the session.`,
          code: `// settings.json idea
{ "hooks": { "PreToolUse": [{ "matcher": "Edit|Write", "hooks": [{ "type": "command", "command": "./scripts/block-env.sh" }] }] } }`,
          exercises: [
            ex("Say when this hook runs.", "Checks Claude Code hook events.", "PostToolUse runs after the Edit or Write tool, so it formats every edited file automatically.", `{ "hooks": { "PostToolUse": [{ "matcher": "Edit|Write",
  "hooks": [{ "type": "command", "command": "npx prettier --write ." }] }] } }`),
            ex("Name two useful hooks for a team.", "Checks practical hook use cases.", "A PreToolUse hook that blocks edits to .env or lock files, and a PostToolUse hook that runs the formatter."),
          ],
        },
        {
          q: 'How do you split a medium feature into tasks for an agent?',
          short: 'Break it into small, testable steps with clear done criteria. Let the agent finish and verify one step before the next.',
          long: `Big vague prompts lead to big wrong diffs.
Strong: a plan first, then steps like "add API type", "add hook with tests", "add UI", each with a check.
A commit per step makes rollback easy.
Weak: one prompt, "build the whole feature".
Red flag: no tests or checks between steps.`,
          exercises: [
            ex("Split this feature into agent tasks.", "Checks task decomposition.", "API endpoint with tests, then UI form, then wiring and e2e test. Each task is small and testable.", "Feature: users can export their orders to CSV."),
            ex("Improve this task for an agent.", "Checks clear done criteria.", "Add scope, files and a check the agent can run. Vague tasks produce vague results.", "Add CSV export.", `Add GET /api/orders/export returning CSV for the current user.
Files: orders.controller.ts + test. Done when: npm test passes.`),
          ],
        },
        {
          q: 'What are slash commands and skills in Claude Code? When would you write your own?',
          short: 'Slash commands are saved prompts you run by name, like /review. Skills are folders with a SKILL.md and helper files that Claude loads when a task matches. Write your own when the team repeats the same workflow.',
          long: `Custom slash commands live in .claude/commands (project) or ~/.claude/commands (personal) as Markdown files; arguments come in through $ARGUMENTS.
        Skills live in .claude/skills/<name>/SKILL.md with a name and description in the front matter; Claude reads the description and loads the full skill only when it is relevant, which keeps context small.
        Strong: uses them for repeated, multi-step work (release notes, migration steps, PR checklist), keeps them short, checks them into git so the team shares them.
        Weak: copies the same long prompt from a notes file every time.
        Red flag: puts secrets or one-off task details into a shared command.`,
          follow: 'How is a skill different from putting the same text in CLAUDE.md?',
          exercises: [
            ex("Name when to write a custom slash command.", "Checks reusable prompts.", "When the team repeats the same prompt often, like \"review this PR with our checklist\". Save it as a command file."),
            ex("Say where this project command lives and how to run it.", "Checks custom command location.", "Project commands live in .claude/commands/. This file runs as /review in Claude Code.", `# .claude/commands/review.md
Review the current diff for bugs and missing tests.`),
          ],
        },
      ],
      senior: [
        {
          q: 'When would you NOT give a task to an agent, and do it yourself instead?',
          short: 'When the task is tiny and faster by hand, when it needs judgment or context the agent cannot get, when the risk is high and hard to check, or when you need to learn the code yourself.',
          long: `Agents are great for well-defined work with a clear way to verify it.
        They are a poor fit for: vague product decisions, security-critical code with no tests, one-line changes, sensitive data you cannot share, and work you must deeply understand to own later.
        Strong: judges cost of explaining plus cost of reviewing against cost of doing it.
        Weak: uses the agent for everything, or for nothing.
        Red flag: hands off a risky production change because "the agent is usually right".`,
          follow: 'Give an example from your work where doing it by hand was the better choice.',
          exercises: [
            ex("Pick the tasks you would do yourself.", "Checks judgment on agent delegation.", "The one-line fix and the production incident: faster by hand, or too risky. The test boilerplate suits an agent.", "// a) one-line typo  b) write 20 similar unit tests  c) live prod incident"),
            ex("Name two signs a task is wrong for an agent.", "Checks limits of agent usefulness.", "Unclear requirements that need human decisions, and no way to verify the result with tests."),
          ],
        },
        {
          q: 'How do you run several agents on one repo without conflicts?',
          short: 'Give each agent its own git worktree or branch, split the work by files or modules, and merge through normal PR review.',
          long: `Agents editing the same working tree overwrite each other.
Strong: worktrees, clear ownership per task, small PRs, CI on each branch.
Weak: two sessions in the same folder.
Red flag: auto-merging agent branches without review.`,
          exercises: [
            ex("Name the git feature that isolates parallel agents.", "Checks parallel agent setup.", "git worktree gives each agent its own folder and branch, so their edits do not clash.", "git worktree add ../app-auth -b feature/auth"),
            ex("Spot the conflict risk.", "Checks task overlap between agents.", "Both agents edit the same file, so their changes will conflict. Split work by area or run them in sequence.", `Agent A: add validation to UserForm.tsx
Agent B: restyle UserForm.tsx`),
          ],
        },
        {
          q: 'The agent is stuck in a loop: fix, test fails, fix again. How do you break it?',
          short: 'Stop it, read the failing output yourself, give a concrete hint or a narrower goal, or restart with a clean context and a summary.',
          long: `Loops usually mean a wrong assumption or a missing fact.
Strong: interrupts early, asks for a root cause analysis before more edits, adds a reproduction.
Weak: lets it run for an hour.
Red flag: lets it "fix" the problem by deleting or skipping the test.`,
          exercises: [
            ex("Name two ways to break a fix-fail loop.", "Checks recovering a stuck agent.", "Stop it and ask it to explain the root cause first, or start a fresh session with a clearer task and hints."),
            ex("Spot the bad fix.", "Checks agents gaming tests.", "The agent changed the test to match the bug. Reject it and make it fix the code instead.", `- expect(total(cart)).toBe(30);
+ expect(total(cart)).toBe(25);`),
          ],
        },
      ],
      techlead: [
        {
          q: 'How do you share MCP servers with the team safely?',
          short: 'Put shared servers in a project .mcp.json checked into git, use environment variables for secrets, review each server like a dependency, and give it the smallest scope it needs.',
          long: `MCP servers give the agent new tools: Jira, databases, browsers, docs.
        Each one is code that runs with your credentials and returns text the model will read, so it is both a supply-chain risk and a prompt-injection path.
        Strong: allowlist of approved servers, pinned versions, read-only tokens where possible, no production write access by default, secrets via env not in the file.
        Weak: everyone installs random servers from the internet.
        Red flag: a shared config with a hardcoded admin token.`,
          follow: 'What could go wrong if an MCP server returns text from a public issue tracker?',
          exercises: [
            ex("Spot the problem in this shared MCP config.", "Checks secrets in shared config.", "A real token is committed to git. Use an environment variable reference instead.", `{ "mcpServers": { "github": { "command": "github-mcp",
  "env": { "GITHUB_TOKEN": "ghp_realTokenHere" } } } }`, `{ "mcpServers": { "github": { "command": "github-mcp",
  "env": { "GITHUB_TOKEN": "\${GITHUB_TOKEN}" } } } }`),
            ex("Name two checks before approving an MCP server.", "Checks MCP supply-chain review.", "Trusted source with a pinned version, and minimal scopes for its token. Review which tools it exposes."),
          ],
        },
        {
          q: 'How do you measure if agentic workflows really help the team?',
          short: 'Track delivery outcomes like cycle time, change failure rate and review time, plus developer feedback. Compare before and after on similar work.',
          long: `Lines of code or "AI accepted percent" are weak metrics.
Strong: DORA-style metrics, defect rate of agent PRs, rework, cost per merged PR, surveys.
Weak: "people feel faster".
Red flag: using the metrics to rank individuals.`,
          exercises: [
            ex("Name two metrics for agent value.", "Checks outcome-based metrics.", "Cycle time from ticket to merge, and defect or revert rate. Pair with developer surveys."),
            ex("Spot the problem with this goal.", "Checks vanity metrics.", "Agent sessions show usage, not value. Measure delivery speed and quality instead.", "OKR: every engineer runs 20+ agent sessions per week."),
          ],
        },
        {
          q: 'Should agents run without supervision in CI? What rules would you set?',
          short: 'Yes for narrow tasks like fixing lint or triage, with a sandbox, least-privilege tokens, cost limits and human review before merge.',
          long: `Unattended agents act on untrusted input such as issue text.
Strong: isolated runners, no production secrets, read-only by default, output only as PRs, logs kept.
Weak: an agent with write access to main.
Red flag: the agent can read deploy credentials while it processes public issues.`,
          exercises: [
            ex("Spot the risk in this CI job.", "Checks unsupervised agent permissions.", "The agent can push straight to main with no review. Let it open a PR instead.", `- run: claude -p "fix lint errors" --dangerously-skip-permissions
- run: git push origin main`),
            ex("Name two rules for agents in CI.", "Checks CI agent guardrails.", "Least-privilege tokens with no secrets, and output only as a PR that a human approves."),
          ],
        },
      ],
    },
    'AI-assisted development': {
      junior: [
        {
          q: 'The AI suggests a package you have never heard of. What do you check?',
          short: 'Check that it exists on npm, its downloads, maintainers, last update, license and size. AI can invent package names that attackers then register.',
          long: `Invented package names are a real supply chain risk.
Strong: checks npm and GitHub, prefers known libraries or built-in APIs.
Weak: runs npm install right away.
Red flag: installs a package with install scripts from an unknown author.`,
          exercises: [
            ex("Name three things to check about a new package.", "Checks dependency vetting.", "It exists with the exact name, it is maintained with real downloads, and its license and advisories are fine."),
            ex("Spot the risk in this AI suggestion.", "Checks typosquatting and hallucinated packages.", "The name is close to a real package and may be fake or malicious. Check npm before installing.", "npm install react-dom-utilz"),
          ],
        },
        {
          q: 'Fix this AI-generated fetch code in a React component.',
          code: `useEffect(async () => {
  const res = await fetch('/api/user/' + id);
  setUser(await res.json());
}, []);`,
          short: 'The effect function cannot be async, id is missing from the dependencies, there is no error check, and there is no cleanup for stale responses.',
          long: `AI often writes code that looks fine but breaks React rules.
Strong: spots the async effect, missing deps, no res.ok check and the race condition.
Weak: fixes only the async part.
Red flag: disables the exhaustive-deps lint rule.`,
          fix: `useEffect(() => {
  const ctrl = new AbortController();
  (async () => {
    const res = await fetch(\`/api/user/\${id}\`, { signal: ctrl.signal });
    if (!res.ok) throw new Error(res.statusText);
    setUser(await res.json());
  })().catch((e) => { if (e.name !== 'AbortError') setError(e); });
  return () => ctrl.abort();
}, [id]);`,
          exercises: [
            ex("Fix the AI-generated fetch.", "Checks HTTP error handling with fetch.", "fetch does not throw on 404 or 500. Check res.ok before parsing.", `const res = await fetch('/api/user');
const user = await res.json();`, `const res = await fetch('/api/user');
if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
const user = await res.json();`),
            ex("Spot the bug.", "Checks async functions in useEffect.", "An effect callback must not be async, because it would return a Promise instead of cleanup. Call an inner async function.", `useEffect(async () => {
  setUser(await getUser());
}, []);`, `useEffect(() => {
  getUser().then(setUser);
}, []);`),
          ],
        },
        {
          q: 'How do you use AI to learn a new library without copying code blindly?',
          short: 'Ask it to explain concepts with small examples, check them against the official docs, and write the code yourself.',
          long: `AI may use old API versions.
Strong: asks "why", compares with the docs for the installed version, builds a small demo.
Weak: pastes the full answer into the project.
Red flag: cannot explain the code they committed.`,
          exercises: [
            ex("Improve this learning prompt.", "Checks using AI to learn, not copy.", "Ask for an explanation and a small example you will type yourself. Then check the docs.", "Write the whole TanStack Query setup for my app.", `Explain how useQuery caching works, with one small example.
Then give me a short exercise to try myself.`),
            ex("Name two ways to check AI explanations of a library.", "Checks verification habits.", "Read the official docs for the version you use, and run a small example to test the claim."),
          ],
        },
      ],
      middle: [
        {
          q: 'Review this AI-written useMemo code. Is it correct?',
          code: `const sorted = useMemo(() => items.sort((a, b) => a.price - b.price), [items]);`,
          short: 'sort() changes the original array, which is props or state. Copy first with toSorted() or [...items].sort().',
          long: `Hidden mutation bugs are common in AI code.
Strong: spots the mutation and explains the effect on parent state and re-renders.
Weak: says "looks fine, it is memoized".
Red flag: does not know which array methods mutate.`,
          fix: `const sorted = useMemo(() => items.toSorted((a, b) => a.price - b.price), [items]);`,
          exercises: [
            ex("Spot the problem with this useMemo.", "Checks missing dependencies.", "filter is missing from the deps, so the result is stale when filter changes.", `const visible = useMemo(
  () => items.filter((i) => i.type === filter),
  [items],
);`, `const visible = useMemo(
  () => items.filter((i) => i.type === filter),
  [items, filter],
);`),
            ex("Say if this useMemo is worth it.", "Checks unnecessary memoization.", "No. Adding two numbers is cheaper than the memo bookkeeping. Memo only expensive work or for stable references.", "const total = useMemo(() => a + b, [a, b]);"),
          ],
        },
        {
          q: 'The AI gives a different answer every time you ask the same question. How do you deal with that?',
          short: 'Treat AI output as a suggestion, not a fact. Make the prompt more specific, give examples and constraints, and decide using tests, docs or your own reasoning.',
          long: `Language models sample their output, so answers vary, especially for vague prompts.
        Strong: narrows the question, asks for reasons and sources, compares the options, verifies with a quick test or the official docs.
        Weak: keeps regenerating until it sees the answer it hoped for.
        Red flag: picks whichever answer came last and ships it.`,
          follow: 'What does it tell you when two answers disagree?',
          exercises: [
            ex("Name two ways to get more consistent answers.", "Checks reducing output variance.", "Give a precise prompt with examples and a fixed output format, and check answers against tests or docs."),
            ex("Predict if these two calls return the same text.", "Checks LLM non-determinism.", "Not guaranteed. Outputs can vary between runs, so validate results instead of expecting identical text.", `const a = await ask('Name a sorting algorithm.');
const b = await ask('Name a sorting algorithm.');
console.log(a === b);`),
          ],
        },
        {
          q: 'The AI wrote tests and they all pass. How do you know they are good tests?',
          short: 'Check that they test behavior, not implementation, that they cover edge cases, and that they fail when the code is broken. Break the code on purpose to see.',
          long: `AI tests often mirror the implementation or mock everything.
Strong: does a mutation-style check, reads the assertions, looks for missing edge cases.
Weak: trusts the coverage percent.
Red flag: tests with no real assertions.`,
          code: `it('formats price', () => {
  const spy = vi.spyOn(utils, 'formatPrice');
  render(<Price value={10} />);
  expect(spy).toHaveBeenCalled();
});`,
          fix: `it('formats price', () => {
  render(<Price value={10} />);
  expect(screen.getByText('$10.00')).toBeInTheDocument();
});`,
          exercises: [
            ex("Spot why this test is weak.", "Checks meaningful assertions.", "It only checks the function returns something; any wrong value passes. Assert the exact expected result.", `test('calculates tax', () => {
  expect(calcTax(100)).toBeDefined();
});`, `test('calculates 20% tax', () => {
  expect(calcTax(100)).toBe(20);
});`),
            ex("Name one quick way to prove tests catch bugs.", "Checks mutation-style test validation.", "Break the code on purpose and see if a test fails. Mutation testing tools automate this."),
          ],
        },
      ],
      senior: [
        {
          q: 'The AI suggests a clever one-line solution. When would you reject it?',
          short: 'When the team cannot easily read, debug or change it, or when it hides performance or edge case problems.',
          long: `Readability is a long-term cost.
Strong: prefers clear code, asks for tests, checks complexity.
Weak: accepts it because it is short.
Red flag: "it works, nobody needs to understand it".`,
          code: `const groups = data.reduce((a, x) => ({ ...a, [x.type]: [...(a[x.type] || []), x] }), {});`,
          fix: `// Linear time instead of quadratic copying, and easier to read
const groups = Object.groupBy(data, (x) => x.type);`,
          exercises: [
            ex("Say why you would reject this one-liner.", "Checks readability over cleverness.", "It is hard to read and debug. A short clear loop or named steps is easier to maintain.", "const r = s.split('').reduce((a, c) => ((a[c] = -~a[c]), a), {});", `const counts = {};
for (const ch of s) counts[ch] = (counts[ch] ?? 0) + 1;`),
            ex("Spot the subtle bug in this one-liner.", "Checks sort comparator defaults.", "Default sort compares strings, so [10, 9, 1] becomes [1, 10, 9]. Pass a numeric comparator.", "const sorted = nums.sort();", "const sorted = [...nums].sort((a, b) => a - b);"),
          ],
        },
        {
          q: 'How do you use AI on a legacy codebase with no tests?',
          short: 'First use AI to explain the code and write characterization tests. Then refactor in small steps behind those tests.',
          long: `Changing untested legacy code with AI is risky.
Strong: tests first, small diffs, checks behavior in the real app.
Weak: asks the AI to "modernize the whole file".
Red flag: a big rewrite with no safety net.`,
          exercises: [
            ex("Name the first thing you ask AI to do on legacy code.", "Checks characterization tests first.", "Write characterization tests that lock in current behavior. Only then refactor with AI help."),
            ex("Write a characterization test for this function.", "Checks capturing current behavior.", "Test what it does now, even odd results, so refactors cannot change behavior silently.", "function fmt(n) { return n > 999 ? (n / 1000) + 'k' : String(n); }", `test('fmt keeps current behavior', () => {
  expect(fmt(5)).toBe('5');
  expect(fmt(1500)).toBe('1.5k');
});`),
          ],
        },
        {
          q: 'Fix this AI-generated code that tries to clean user input.',
          code: `function Comment({ text }) {
  const clean = text.replace(/<script>/g, '');
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}`,
          short: 'Removing "<script>" with a regex does not stop XSS. Render the value as text, or sanitize it with a proven library like DOMPurify.',
          long: `AI often writes naive security code.
Strong: knows React escapes text by default, uses DOMPurify when HTML is required, adds a CSP.
Weak: tries to improve the regex.
Red flag: thinks blocking "<script>" is enough.`,
          fix: `function Comment({ text }) {
  return <div>{text}</div>;
}
// If HTML is truly required:
// <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />`,
          exercises: [
            ex("Spot the XSS problem.", "Checks unsafe HTML sanitizing.", "Regex sanitizing is easy to bypass, for example with onerror attributes. Use textContent or DOMPurify.", `const clean = input.replace(/<script>/gi, '');
el.innerHTML = clean;`, `el.textContent = input;
// or, if HTML is needed: el.innerHTML = DOMPurify.sanitize(input);`),
            ex("Fix the React code.", "Checks dangerouslySetInnerHTML risk.", "Rendering raw user HTML allows XSS. Render it as text, or sanitize first.", "<div dangerouslySetInnerHTML={{ __html: comment }} />", "<div>{comment}</div>"),
          ],
        },
      ],
      techlead: [
        {
          q: 'The team ships much more AI code now. How do you keep code quality high?',
          short: 'Strengthen automatic checks, keep PRs small, require tests, and make authors own and explain AI code in review.',
          long: `More code means more review load and more risk.
Strong: lint, types, tests and security scans in CI, PR size limits, architecture docs the AI can use.
Weak: "reviewers will catch it".
Red flag: lowering review standards to keep up.`,
          exercises: [
            ex("Name two quality gates for AI-heavy teams.", "Checks scaling review and checks.", "Required CI with tests, types and lint, and small PRs with an author who can explain them."),
            ex("Spot the process problem.", "Checks review capacity limits.", "PR size grew while review time fell, so reviews are rubber stamps. Cap PR size.", "Avg PR: 120 -> 900 lines. Avg review time: 20 -> 5 min."),
          ],
        },
        {
          q: 'How do you choose AI coding tools for the company?',
          short: 'Compare them on real tasks from your codebase, plus security, data handling, admin controls, cost and developer feedback.',
          long: `Vendor demos do not show the real fit.
Strong: a measured pilot, legal and security review, data retention terms, SSO and policy controls.
Weak: picks the most popular tool.
Red flag: no check on where code is sent and stored.`,
          exercises: [
            ex("Name three criteria for choosing an AI coding tool.", "Checks tool evaluation.", "Data and security terms, admin controls like SSO and audit logs, and measured value in a pilot."),
            ex("Fix this tool selection plan.", "Checks piloting before buying.", "Pick with evidence: a time-boxed pilot on real tasks with set metrics, then decide.", "Plan: buy the tool with the best demo for all 200 devs.", `Plan: 4-week pilot, 2 tools, 15 devs, real tickets.
Measure cycle time, defects, survey. Then decide.`),
          ],
        },
        {
          q: 'A client contract says their code must not be sent to third-party AI services. How does your team work on that project?',
          short: 'Follow the contract first: turn off AI tools for that repo, or use only an approved setup that the client and legal agree to. Make the rule easy to follow and check it.',
          long: `This is a legal and trust question, not a tooling preference.
        Strong: reads the exact clause with legal, configures tools per repo (disable assistant, block the domain, separate workspace), tells the team clearly, and asks the client if an approved option is acceptable, for example a provider with zero data retention under a signed agreement.
        Weak: "people will be careful".
        Red flag: quietly using AI anyway because it is faster.`,
          follow: 'How would you check that the rule is really followed?',
          exercises: [
            ex("Name two ways to enforce a no-AI client contract.", "Checks policy enforcement.", "Turn off AI tools for that repo through admin settings, and brief the team in writing. Audit it."),
            ex("Spot the contract violation.", "Checks hidden data flows to AI.", "The IDE plugin sends client code to a third-party AI service. Disable it for that workspace.", "Client repo open in IDE with AI autocomplete enabled (cloud model)."),
          ],
        },
      ],
    },
    'AI code review': {
      junior: [
        {
          q: 'The AI reviewer says your code has a bug. You think it is wrong. What do you do?',
          short: 'Check the claim carefully, test it if possible, and reply with your reasoning. If it is wrong, resolve the comment with an explanation.',
          long: `AI reviewers are useful but not always right.
Strong: checks with a test or by reading the code, stays polite, learns from it.
Weak: ignores all AI comments.
Red flag: changes code only to make the bot quiet.`,
          exercises: [
            ex("Name how you prove the AI comment is wrong.", "Checks evidence over opinion.", "Write a test for the case it describes. If the test passes, reply with it and resolve."),
            ex("Decide if this AI comment is right.", "Checks verifying AI review claims.", "Wrong. ?? only falls back on null or undefined, so 0 is kept. Reply with that reason.", `const qty = input ?? 1;
// AI: "Bug: qty becomes 1 when input is 0."`),
          ],
        },
        {
          q: 'The AI reviewer says "consider adding error handling". How do you make that comment useful?',
          short: 'Ask where exactly and what should happen on error. A good review comment names the line, the failure case and the expected behavior. Then decide if it is real.',
          long: `Generic AI comments are noise unless you turn them into a concrete case.
        Strong: asks which call can fail, what the user should see, and whether the error is already handled higher up.
        Weak: wraps everything in try/catch that hides errors.
        Red flag: adds catch blocks that swallow errors just to make the bot quiet.`,
          follow: 'When is it right to not handle an error in a function?',
          exercises: [
            ex("Rewrite this vague comment to be useful.", "Checks specific actionable feedback.", "Name the failure case and the expected behavior, so the fix is clear.", "AI: \"Consider adding error handling.\"", `"If fetch fails, the spinner never stops.
Catch the error, set loading false and show a retry message."`),
            ex("Add the missing error handling.", "Checks loading state on errors.", "Use finally so loading stops on success and on error, and show the error.", `setLoading(true);
const data = await load();
setLoading(false);`, `setLoading(true);
try { setData(await load()); }
catch (e) { setError(e); }
finally { setLoading(false); }`),
          ],
        },
        {
          q: 'How can you use AI to review your own code before you open a PR?',
          short: 'Give it your diff and ask specific questions: edge cases, naming, missing tests. Fix what is real, ignore what is not, and still read the diff yourself.',
          long: `A self-review with AI can catch small issues before a teammate spends time on them.
        Strong: asks focused questions, gives the ticket context, and checks each suggestion.
        Weak: asks "is this good?" and gets a vague yes.
        Red flag: pastes private code into a tool the company does not allow.`,
          follow: 'What is one thing AI review cannot know about your change?',
          exercises: [
            ex("Improve this self-review prompt.", "Checks focused review prompts.", "Give the goal, the diff and what to look for. A focused prompt gives useful findings.", "Review my code.", `Review this diff for a login form. Look for bugs, missing
error states and accessibility issues. List by severity.`),
            ex("Name two limits of AI self-review.", "Checks realistic self-review expectations.", "It does not know the requirements, and it can miss or invent issues. Still run tests and get human review."),
          ],
        },
      ],
      middle: [
        {
          q: 'The AI reviewer comments only on the changed lines. What kinds of bugs will it miss?',
          short: 'Bugs caused by code outside the diff: callers that now break, removed behavior, other places that need the same change, and contracts with the backend.',
          long: `Many review bots see only the diff and a few lines around it.
        They miss: a changed function signature used in other files, a renamed API field that the mobile app still reads, a config key removed but still used, missing migrations.
        Strong: asks "who else depends on this?" and searches the repo; gives the bot more context or a repo-aware tool.
        Weak: trusts the green check.
        Red flag: approves a change to a shared util without looking at its callers.`,
          follow: 'How would you give an AI reviewer more context without sending the whole repo?',
          exercises: [
            ex("Find the bug the diff does not show.", "Checks cross-file impact.", "Callers still pass one argument, so currency is undefined. A diff-only reviewer misses the call sites.", `// diff in utils.ts
- export const fmt = (n) => ...
+ export const fmt = (n, currency) => ...
// unchanged: 14 callers use fmt(price)`),
            ex("Name two bug types a diff-only reviewer misses.", "Checks limits of local review.", "Broken callers in unchanged files, and business rules or design problems outside the diff."),
          ],
        },
        {
          q: 'How do you write a good prompt for an AI code reviewer?',
          short: 'Give it the diff, the project rules, what to focus on, such as bugs and security, what to skip, such as style handled by lint, and a clear output format with severity.',
          long: `Generic prompts give generic nitpicks.
Strong: repo-specific rules, severity levels, asks for evidence and line numbers, limits the number of comments.
Weak: "review this code".
Red flag: no way to tune or reduce noise.`,
          exercises: [
            ex("Improve this reviewer prompt.", "Checks scope and output format.", "Set focus, skip style handled by linters, and ask for severity with a clear format.", "You are a code reviewer. Review the PR.", `Review for bugs, security and missing tests only. Skip style.
For each issue: file:line, severity, one-line fix. Max 10.`),
            ex("Name two context items to give an AI reviewer.", "Checks review context.", "The ticket or acceptance criteria, and team conventions like a short guidelines file."),
          ],
        },
        {
          q: 'An AI comment suggests a big refactor in a small bug fix PR. What do you do?',
          short: 'Keep the PR focused. Put the refactor idea in a ticket and fix only the bug now, unless the refactor is needed for the fix.',
          long: `Scope creep makes PRs risky and slow.
Strong: separates concerns, creates a follow-up, explains in the reply.
Weak: does the refactor and makes the PR huge.
Red flag: ignores it without any note.`,
          exercises: [
            ex("Reply to this AI comment in one sentence.", "Checks keeping PR scope small.", "Thank it, keep this PR focused on the fix, and open a separate ticket for the refactor.", `PR: fix null check (3 lines).
AI: "Rewrite this module with a state machine."`),
            ex("Name the main risk of mixing refactor into a bug fix.", "Checks review and rollback risk.", "It is harder to review and roll back. A small fix ships safely; the refactor can wait."),
          ],
        },
      ],
      senior: [
        {
          q: 'Review this AI-suggested fix for a memory leak.',
          code: `useEffect(() => {
  window.addEventListener('resize', () => setWidth(window.innerWidth));
  return () => window.removeEventListener('resize', () => setWidth(window.innerWidth));
}, []);`,
          short: 'It removes a different function, so the listener is never removed. Store the handler in a variable and pass the same reference.',
          long: `The "fix" looks correct but does nothing.
Strong: knows removeEventListener needs the same function reference.
Weak: approves because a cleanup exists.
Red flag: does not understand function identity.`,
          fix: `useEffect(() => {
  const onResize = () => setWidth(window.innerWidth);
  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('resize', onResize);
}, []);`,
          exercises: [
            ex("Review this AI fix for a timer leak.", "Checks correct cleanup return.", "The cleanup is called right away instead of returned. Return a function that clears the interval.", `useEffect(() => {
  const id = setInterval(tick, 1000);
  return clearInterval(id);
}, []);`, `useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);`),
            ex("Spot why the listener is never removed.", "Checks same function reference in cleanup.", "bind creates a new function, so removeEventListener gets a different one. Store the bound handler once.", `window.addEventListener('scroll', this.onScroll.bind(this));
// later
window.removeEventListener('scroll', this.onScroll.bind(this));`, `this.handler = this.onScroll.bind(this);
window.addEventListener('scroll', this.handler);
window.removeEventListener('scroll', this.handler);`),
          ],
        },
        {
          q: 'An AI reviewer suggests a change and the developer applies it without thinking. It adds a bug. How do you prevent this?',
          short: 'AI suggestions follow the same rule as human ones: the author owns the change. Require tests for suggested fixes, label AI suggestions clearly, and never auto-apply them on risky code.',
          long: `"One-click apply" makes it easy to accept code nobody read.
        Strong: the author must understand and test every applied suggestion; suggestions on auth, payments or data are never auto-applied; the bot explains why, not only what.
        Weak: blames the tool.
        Red flag: a workflow that auto-commits AI fixes to the PR branch with no human step.`,
          follow: 'Which code areas would you mark as "no auto-apply"?',
          exercises: [
            ex("Name two rules to stop blind AI fixes.", "Checks process against rubber-stamping.", "Every applied suggestion needs a test or a reason in the commit, and humans still review the final diff."),
            ex("Spot the bug the AI suggestion added.", "Checks verifying applied suggestions.", "The suggestion uses ||, so a valid 0 discount becomes 10. ?? was correct before.", `- const discount = input ?? 10;
+ const discount = input || 10; // AI: "simpler"`),
          ],
        },
        {
          q: 'An AI reviewer flags this line as SQL injection. Is it right?',
          code: `const rows = await db.query('SELECT * FROM users WHERE email = $1', [email]);`,
          short: 'No. This is a parameterized query, so the input is never joined into the SQL text. It is a false positive.',
          long: `Seniors must judge findings, not just accept them.
Strong: explains parameter binding and replies with evidence.
Weak: rewrites working code to please the bot.
Red flag: cannot tell safe queries from unsafe ones.`,
          exercises: [
            ex("Decide if this is SQL injection.", "Checks parameterized queries.", "No. The value is passed as a parameter, not concatenated, so the driver escapes it. The AI is wrong.", "await db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);"),
            ex("Fix the real SQL injection.", "Checks string-built SQL.", "User input is put straight into SQL. Use a parameter placeholder.", "await db.query(`SELECT * FROM users WHERE name = '${req.query.name}'`);", "await db.query('SELECT * FROM users WHERE name = $1', [req.query.name]);"),
          ],
        },
      ],
      techlead: [
        {
          q: 'Your AI reviewer posts too many comments, and people ignore it. How do you fix that?',
          short: 'Cut the noise: post only high-confidence, high-severity findings, skip style, group comments, and measure how many are accepted.',
          long: `A noisy bot trains people to ignore it, including real issues.
Strong: an acceptance rate metric, a severity threshold, a feedback loop, an owner for tuning.
Weak: turns it off, or keeps it as it is.
Red flag: no data on whether it is useful.`,
          exercises: [
            ex("Name two changes that cut AI review noise.", "Checks tuning AI reviewers.", "Raise the confidence bar and cap comments per PR, and drop style topics covered by linters."),
            ex("Fix this reviewer config.", "Checks severity filtering.", "Post only high-severity findings, so each comment is worth reading.", `ai_review:
  min_severity: info
  max_comments: unlimited`, `ai_review:
  min_severity: high
  max_comments: 5`),
          ],
        },
        {
          q: 'An AI-reviewed PR causes a production incident. Who is responsible?',
          short: 'The team and the human approvers own it. The AI is a tool. The postmortem looks for process gaps, not for blame on the bot.',
          long: `Accountability must stay with people.
Strong: a blameless postmortem, new tests or rules, a check on whether over-trust in AI was a factor.
Weak: "the bot missed it".
Red flag: nothing changes after the incident.`,
          exercises: [
            ex("Name who owns an AI-reviewed change.", "Checks accountability.", "The author and human approvers own it. The AI is a tool, like a linter."),
            ex("Name two follow-ups after the incident.", "Checks blameless postmortem actions.", "A blameless postmortem, and a test or check that would have caught the bug. Adjust the review process."),
          ],
        },
        {
          q: 'How do you roll out an AI reviewer to a team that does not trust it?',
          short: 'Start small and optional, show real value with examples, let people turn noisy rules off, and listen to feedback. Trust comes from useful comments, not from a mandate.',
          long: `Forcing a tool that people see as noise makes them ignore it.
        Strong: pilot on one or two willing teams, comment-only mode, track useful vs dismissed comments, share good catches, fix the prompt based on complaints, then expand.
        Weak: turn it on for all repos on Monday and make it a required check.
        Red flag: using AI review numbers to judge individual developers.`,
          follow: 'What would make you stop the rollout?',
          exercises: [
            ex("Name two steps to build trust in an AI reviewer.", "Checks gradual adoption.", "Start advisory on a few volunteer repos, and share accepted-comment stats openly. Let teams opt out."),
            ex("Fix this rollout plan.", "Checks piloting before mandates.", "Forcing a blocking bot on everyone kills trust. Pilot it as advisory first.", "Week 1: AI review required and blocking on all repos.", `Weeks 1-4: advisory on 3 volunteer repos.
Review accepted-comment rate, then expand.`),
          ],
        },
      ],
    },
  },
  'Soft Skills': {
    'Communication skills': {
      junior: [
        {
          q: 'How do you ask for help when you are stuck? Give an example.',
          ai: true,
          short: 'Explain the goal, what you tried, what happened and your current guess. Then ask one specific question.',
          long: `Strong: tried alone for a reasonable time first, asks with context, respects other people's time.
Strong: asks in a team channel so others can learn, not only in private messages.
Weak: "it does not work, can you help?" with no details.
Red flags: never asks and stays stuck for days, or asks before trying anything.`,
          follow: 'How long do you try alone before you ask?',
          exercises: [
            ex('Ask me for help with this CI failure.', 'Checks a clear, specific help request.', 'Strong: goal, steps tried, the error, a guess, one question. Red flag: "it does not work, help".', 'Login test fails only in CI. You tried for 2 hours.',
              `"Login test times out only in CI. It passes locally.
I tried more waits. Maybe CI uses another API URL?
Where are CI env vars set?"`),
            ex('Tell me you will miss today\'s small deadline.', 'Checks early warning with a new plan.', 'Strong: tells early, short reason, new time, an option. Red flag: says nothing until asked.', 'You promised a fix today. At 3 PM you found a deeper issue.',
              `"The bug is in the shared date helper, so it is bigger.
I need until noon tomorrow. I can ship a small workaround today."`),
          ],
        },
        {
          q: 'How do you give your update in a daily standup?',
          ai: true,
          short: 'Short and clear: what I finished, what I do next, and any blocker. Details go after the meeting.',
          long: `Strong: under one minute, names blockers clearly, links to the ticket.
Strong: offers to discuss details after the standup with only the people involved.
Weak: a long technical story, or "same as yesterday".
Red flag: hides blockers to look productive.`,
          exercises: [
            ex('Give me your standup update.', 'Checks a short, three-part update.', 'Strong: done, next, blocker with a clear ask. Red flag: long story, no blocker.', 'Yesterday: form bug. Today: table. Need the designer\'s answer.',
              `"Yesterday: form bug fixed, in review.
Today: orders table.
Blocker: Maria, need the empty state design."`),
            ex('Make this standup update shorter.', 'Checks cutting details to what matters.', 'Strong: result, next step, blocker in two sentences. Red flag: keeps every detail.', '"So I looked at the thing, maybe the API is slow, I tried caching..."',
              `"The orders API is slow, caching did not help.
Today I measure it with backend. No blockers."`),
          ],
        },
        {
          q: 'How do you write a good message in a team chat when you need an answer?',
          ai: true,
          short: 'Put the question first, add the short context and a link, say when you need the answer, and tag only the right person.',
          long: `Chat messages are read quickly, on phones, between other tasks.
        Strong: one message, not five; question at the top; a link to the ticket or code; a clear deadline.
        Weak: "hi" and then waiting for a reply before asking.
        Red flag: tagging the whole channel for a small question.`,
          follow: 'When should you move a chat conversation to a call?',
          exercises: [
            ex('Rewrite this chat message to get an answer.', 'Checks clear, self-contained async messages.', 'Strong: the full question, context, link, when you need it. Red flag: "hi" and waiting.', '"hey, quick question?"',
              `"Hi Tom, should the export include deleted users? Ticket: FE-88.
I need it by tomorrow to finish."`),
            ex('Write one message instead of five short ones.', 'Checks grouping thoughts before sending.', 'Strong: one message with the problem, link and question. Red flag: many pings.', 'You sent: "hi" / "the build" / "fails" / "on main" / "any idea?"',
              `"The main build fails since 10:00 on the lint step (link).
Did anyone change the ESLint config?"`),
          ],
        },
      ],
      middle: [
        {
          q: 'How do you say "I do not know" in a meeting?',
          ai: true,
          short: 'Say it honestly, share what you do know, and promise a follow-up with a time. It builds trust more than a confident guess.',
          long: `Guessing in a meeting can lead to wrong decisions that are hard to undo.
        Strong: "I am not sure. I think X, but I will check and reply by 3 PM."
        Weak: a long vague answer that hides the gap.
        Red flag: inventing numbers or facts to look smart.`,
          follow: 'Tell me about a time someone made a decision based on a guess.',
          exercises: [
            ex('Answer a question you cannot answer in a meeting.', 'Checks honest "I don\'t know" with follow-up.', 'Strong: says you do not know, says how to find out, gives a time. Red flag: guessing a number.', 'The PM asks how many users still use Safari 15.',
              '"I don\'t know. I will check analytics and post it here by 3 PM."'),
            ex('Correct a wrong answer you gave earlier.', 'Checks fixing a mistake openly.', 'Strong: corrects quickly in the same channel. Red flag: hopes nobody notices.', 'You said "about 10%". Analytics shows 2%.',
              '"Correction: Safari 15 is 2%, not 10%. Sorry for the confusion."'),
          ],
        },
        {
          q: 'A meeting keeps going off-topic. How do you handle it?',
          ai: true,
          short: 'Politely bring it back to the goal, park other topics for later, and make sure decisions and owners are written down.',
          long: `Strong: an agenda, a timebox, a "parking lot" for side topics, a clear summary.
Weak: says nothing, and the meeting ends with no decision.
Good answers mention a clear meeting goal stated at the start, so steering back feels natural, not personal.
Red flag: interrupts people rudely.`,
          exercises: [
            ex('Bring this meeting back on topic.', 'Checks polite facilitation.', 'Strong: names the goal, parks the topic, keeps it friendly. Red flag: lets it run, or is rude.', 'A release planning meeting turns into a debate about tabs vs spaces.',
              `"Good topic, but let's park it.
We need the release date in 10 minutes."`),
            ex('Suggest a fix for meetings that always go off topic.', 'Checks fixing the process.', 'Strong: agenda before, timebox per item, parking list, notes. Red flag: just leaving early.', 'Weekly sync runs 30 minutes over every time.'),
          ],
        },
        {
          q: 'A teammate gives you harsh feedback in public. How do you respond?',
          ai: true,
          short: 'Stay calm, take the useful part, and later talk in private about both the content and the way it was said.',
          long: `Strong: separates content from tone, does not fight in public, follows up.
Weak: gets defensive, or stays silent and angry.
Good answers show self-control and curiosity: "Is the point valid?" comes before "Was the tone fair?".
Red flag: answers with personal attacks.`,
          exercises: [
            ex('Respond to harsh public feedback.', 'Checks staying calm under public criticism.', 'Strong: calm, takes the fact, moves details to private. Red flag: fights back in public.', 'In standup a teammate says: "Your PR broke staging again."',
              `"Thanks, I will look right after standup.
Can we talk then so I understand what happened?"`),
            ex('Give private feedback about the public comment.', 'Checks addressing tone without drama.', 'Strong: "I" message, the impact, a request. Red flag: attacking them back.', 'Later, you talk with that teammate alone.',
              `"I want to fix staging, that is fair.
In standup it felt like blame. Next time, can you message me first?"`),
          ],
        },
      ],
      senior: [
        {
          q: 'How do you write a technical proposal that people read and agree with?',
          ai: true,
          short: 'Start with the problem and recommendation, show options with trade-offs, keep it short, and talk to key people before the big review.',
          long: `Strong: a clear summary at the top, data, risks, open questions, early feedback from stakeholders.
Weak: 20 pages of details without a decision.
Strong candidates mention pre-wiring: sharing a draft with the most skeptical person first.
Red flag: surprises key people in the meeting.`,
          exercises: [
            ex('Write the first three lines of a proposal.', 'Checks problem-first technical writing.', 'Strong: problem with numbers, proposal, ask and deadline. Red flag: starts with tool features.', 'You want to move from CSS modules to Tailwind.',
              `Problem: styles are duplicated, CSS grew 3x in a year.
Proposal: adopt Tailwind for new code.
Ask: feedback by Friday.`),
            ex('Answer a strong objection to your proposal.', 'Checks responding to pushback with care.', 'Strong: accepts the concern, gives a mitigation, offers a trial. Red flag: dismissing it.', 'A senior: "Tailwind makes HTML unreadable."',
              `"Fair. We can use components to hide long classes.
Can we try it on one page and review?"`),
          ],
        },
        {
          q: 'Tell me about a time you had to say no to an important stakeholder.',
          ai: true,
          short: 'A strong answer explains the reason, offers alternatives, and keeps the relationship good.',
          long: `Strong: "no, but here is what we can do", uses data, escalates properly if needed.
Weak: says yes to everything.
Listen for how they protected the relationship, for example a follow-up or a partial delivery.
Red flag: says no with no explanation, or blames others.`,
          exercises: [
            ex('Say no to the VP\'s urgent request.', 'Checks a respectful no with options.', 'Strong: shows the trade-off, offers alternatives, lets them choose. Red flag: silent yes or cold no.', 'A VP wants a new dashboard this week. The team is busy with a launch.',
              `"This week we can't without risking the launch.
We can share a spreadsheet now and build it next sprint. Would that work?"`),
            ex('Write a follow-up after saying no.', 'Checks keeping the relationship after a no.', 'Strong: confirms the plan in writing with a date. Red flag: no follow-up.', 'The VP accepted the next-sprint option.',
              `"Thanks! Plan: spreadsheet today, dashboard in sprint 14.
I will show a draft on the 12th."`),
          ],
        },
        {
          q: 'How do you communicate during a production incident?',
          ai: true,
          short: 'Short regular updates on impact, status and the next update time, in one channel, with one person coordinating.',
          long: `Strong: an incident lead, separate technical and stakeholder updates, facts only, no blame.
Weak: silence until it is fixed.
Strong: knows the difference between the incident channel for engineers and the status update for customers and leaders.
Red flag: guessing causes in public.`,
          exercises: [
            ex('Post the first incident update.', 'Checks clear incident status messages.', 'Strong: impact, status, owner, next update time. Red flag: guessing the cause, or no update time.', 'Checkout errors for 20% of users since 14:05.',
              `"14:15 Checkout errors for 20% of users since 14:05.
Investigating, owner: me. Next update 14:30."`),
            ex('Tell support what to say to customers.', 'Checks simple external messaging.', 'Strong: simple, honest, no blame, next update. Red flag: technical details or promises.', 'Support asks what to tell angry customers.',
              `"We know about the checkout problem and are fixing it.
Please try again in 30 minutes. We will update you."`),
          ],
        },
      ],
      techlead: [
        {
          q: 'How do you make sure your team knows the reason behind priorities?',
          ai: true,
          short: 'Share the business context often, link work to goals, and invite questions. Repeat the message in different formats.',
          long: `Strong: regular updates, written goals, open questions time.
Weak: shares only tickets.
Strong: checks understanding, for example by asking people to explain the priority back in their own words.
Red flag: "they do not need to know".`,
          exercises: [
            ex('Explain why the team works on this priority.', 'Checks connecting work to the business goal.', 'Strong: business reason, customer impact, the trade-off. Red flag: "because management said so".', 'The team asks why accessibility comes before new features.',
              `"Two big clients need WCAG compliance by June,
or they cannot renew. That is 30% of revenue."`),
            ex('Check that the team understood the reason.', 'Checks two-way communication of priorities.', 'Strong: ask someone to say it back, invite questions, write it down. Red flag: "any questions?" and moving on.', 'You explained the new priority in a meeting.',
              `"Can someone say in one sentence why this is first?
I will put it in our team doc too."`),
          ],
        },
        {
          q: 'How do you give feedback to your own manager?',
          ai: true,
          short: 'In private, with specific examples, the impact and a suggestion. Ask how they prefer to receive feedback.',
          long: `Strong: timely, specific, respectful, focused on outcomes.
Weak: complains to peers instead.
Strong: frames feedback around shared goals, so it sounds like help, not attack.
Red flag: never gives feedback upward.`,
          exercises: [
            ex('Give your manager feedback on late decisions.', 'Checks upward feedback with facts.', 'Strong: private, facts, impact, a request. Red flag: complaining to the team.', 'Your manager decides priorities a day before the sprint.',
              `"Priorities came the day before the last two sprints.
We lose planning time. Could we get them 3 days earlier?"`),
            ex('Ask your manager for feedback on yourself.', 'Checks asking for specific feedback.', 'Strong: a specific question about one area. Red flag: "any feedback?" only.', 'It is your monthly 1:1 with your manager.',
              '"What is one thing I could do better in planning meetings?"'),
          ],
        },
        {
          q: 'How do you get several teams to agree on a shared technical decision?',
          ai: true,
          short: 'Write a clear proposal, meet key people one by one, run a decision meeting with a clear owner, and publish the decision.',
          long: `Strong: an RFC process, a decision owner, a written record like an ADR, a timeline.
Weak: endless discussion.
Strong: names "disagree and commit" and knows when to escalate a deadlock with a deadline.
Red flag: decides alone and announces it.`,
          exercises: [
            ex('Open a meeting with three teams on a shared choice.', 'Checks a fair cross-team decision process.', 'Strong: shared goal, criteria, who decides, deadline. Red flag: pushing your team\'s choice.', 'Three teams use different date libraries. You want one.',
              `"Goal: one date library by May.
Criteria: size, time zones, support.
Each team presents, then the guild votes."`),
            ex('Handle a team that refuses the decision.', 'Checks alignment without forcing.', 'Strong: listen to reasons, find exceptions or a migration path, escalate if needed. Red flag: force or ignore.', 'One team says they will keep their library.',
              `"What blocks you? If it is effort, we can migrate it
with you over two sprints."`),
          ],
        },
      ],
    },
    'Planning and problem-solving ability': {
      junior: [
        {
          q: 'How do you estimate a small task?',
          ai: true,
          short: 'Break it into steps, estimate each one, add time for testing and review, and say how sure you are.',
          long: `Strong: a list of steps, a buffer, asks experienced people.
Weak: gives a number with no thinking.
Good juniors give a range, like "1 to 2 days", and explain what could make it longer.
Red flag: never updates the estimate when facts change.`,
          exercises: [
            ex('Estimate this small task out loud.', 'Checks breaking a task down to estimate.', 'Strong: splits into steps, adds test time, gives a range. Red flag: "5 minutes" with no thought.', 'Add a "copy to clipboard" button to the API key page.',
              `"Button and copy: 1 hour. Toast and errors: 1 hour.
Tests and review: 2 hours. About half a day."`),
            ex('Tell your lead your estimate was wrong.', 'Checks updating estimates early.', 'Strong: tells now, explains why, new estimate. Red flag: waits until the end.', 'You said 1 day. After 2 hours you see it needs 3.',
              `"The API does not return what we need, so it is 3 days, not 1.
Should I continue?"`),
          ],
        },
        {
          q: 'How do you start working on a bug report?',
          ai: true,
          short: 'Reproduce it, find where it happens, form a guess, test the guess, then fix it and add a test.',
          long: `Strong: clear steps, uses tools like DevTools and logs, writes a test.
Weak: random code changes.
Strong: writes the reproduction steps into the ticket so others can follow.
Red flag: says "works on my machine" and stops.`,
          exercises: [
            ex('Ask questions about this bug report.', 'Checks gathering facts before coding.', 'Strong: which filter, steps, expected vs actual, browser. Red flag: starts changing code at random.', '"The filter is broken."',
              `"Which filter, and what did you click?
What did you expect, and what happened?
Which browser?"`),
            ex('Name your first steps after you reproduce a bug.', 'Checks a calm debugging routine.', 'Strong: find the smallest case, check console and network, write a failing test. Red flag: random changes.', 'You can now see the bug on your machine.'),
          ],
        },
        {
          q: 'How do you break a task into smaller steps?',
          ai: true,
          short: 'Find the smallest piece that works end to end, then list steps that can each be finished and checked in a few hours.',
          long: `Small steps make progress visible and problems show up early.
        Strong: starts with a thin working slice, then adds details; each step can be reviewed alone.
        Weak: one big task "build the page" for a week.
        Red flag: no plan, starts coding and gets lost.`,
          follow: 'How do you know a step is small enough?',
          exercises: [
            ex('Break this task into small steps.', 'Checks splitting work into shippable parts.', 'Strong: page layout, data loading, edit form, upload, tests. Red flag: one big step.', 'Add a profile page with avatar upload.',
              `1. Page and route
2. Load and show profile
3. Edit form
4. Avatar upload
5. Tests`),
            ex('Choose which step to ship first.', 'Checks value-first ordering.', 'Strong: page with real data first, so others can see progress. Red flag: avatar upload first because it is fun.', 'You have the five steps for the profile page.'),
          ],
        },
      ],
      middle: [
        {
          q: 'Tell me about a hard problem you solved. How did you approach it?',
          ai: true,
          short: 'Use STAR. Show clear steps: understand, find the cause, compare options, decide, and check the result.',
          long: `Strong: data, root cause, trade-offs, a measurable result.
Weak: a lucky fix with no explanation.
Listen for "I" not only "we": the interviewer needs the candidate's own actions.
Red flag: cannot explain the cause.`,
          exercises: [
            ex('Tell me about a hard problem in one minute.', 'Checks a clear problem-solving story.', 'Strong: problem, steps tried, how found, result with numbers. Red flag: no clear role.', 'Use any real problem you solved.',
              `"Our page froze on big lists. I profiled it and found 5000 re-renders.
I memoized rows and virtualized the list. Time went from 4s to 200ms."`),
            ex('Explain what you would do differently.', 'Checks reflection on the approach.', 'Strong: a concrete change, like profiling earlier or asking sooner. Red flag: "nothing".', 'The same hard problem took you two weeks.',
              '"I would profile on day one instead of guessing for a week."'),
          ],
        },
        {
          q: 'How do you plan a feature that takes two or three weeks?',
          ai: true,
          short: 'Clarify the scope, break it into milestones, find risks early, and deliver in small pieces.',
          long: `Strong: risky parts first, regular check-ins, a feature flag.
Weak: one big PR at the end.
Strong: names a definition of done and shares a short plan with the PM before starting.
Red flag: no plan at all.`,
          exercises: [
            ex('Write a short plan for a 3-week feature.', 'Checks milestones and early risk checks.', 'Strong: milestones, risky part first, demo points. Red flag: one big delivery at the end.', 'Feature: bulk edit for the orders table.',
              `Week 1: API spike, select rows.
Week 2: edit form, save.
Week 3: errors, tests, demo.`),
            ex('Name the biggest risk and how you check it early.', 'Checks risk-first planning.', 'Strong: performance or API limits, test with a spike on day one. Red flag: find out in week 3.', 'Bulk edit must handle 1000 orders.'),
          ],
        },
        {
          q: 'The app got slow after a release. How do you find the cause?',
          ai: true,
          short: 'Measure first, compare with the last good version, narrow down the change, and confirm with data.',
          long: `Strong: profiling, comparing builds, git bisect.
Weak: guesses.
Strong: sets a performance budget or monitoring so it is caught earlier next time.
Red flag: optimizes random code.`,
          exercises: [
            ex('Name your first three steps for this slowdown.', 'Checks a data-driven performance investigation.', 'Strong: confirm with metrics, compare releases (diff), profile the slow page. Red flag: guessing and changing code.', 'The app got slow after Tuesday\'s release.',
              `"Check real user metrics to confirm.
Look at what changed in that release.
Profile the slow page with DevTools."`),
            ex('Explain what you would do if the cause is unclear.', 'Checks safe fallback steps.', 'Strong: roll back or flag off the change, bisect, ask for help. Red flag: let users suffer.', 'You cannot find the cause in one day.',
              '"Turn off the new feature flag, then bisect the commits."'),
          ],
        },
      ],
      senior: [
        {
          q: 'How do you decide when a solution is "good enough" to ship?',
          ai: true,
          short: 'Compare it with the real goal and the risk: does it solve the user problem, is it safe, can it be changed later? Ship when more polish adds little value.',
          long: `Perfect code that ships late can be worse than good code that ships now, but some areas need high quality.
        Strong: separates reversible from irreversible decisions; high bar for data, security and public APIs; lower bar for internal tools and experiments.
        Weak: "it is never done" or "ship it, we fix later" for everything.
        Red flag: ships known data-loss risks to hit a date.`,
          follow: 'Tell me about a time you shipped something "good enough". How did it go?',
          exercises: [
            ex('Decide if this feature is good enough to ship.', 'Checks shipping trade-offs.', 'Strong: ship if the edge case is safe and tracked; check impact and risk. Red flag: endless polish.', 'Works well. Missing: animations and one rare edge case.',
              `"The edge case affects under 1% and fails safely.
Ship now, ticket for the edge case and animation."`),
            ex('Name two things that must be done before shipping.', 'Checks a minimum quality bar.', 'Strong: key tests and accessibility pass, monitoring or rollback ready. Red flag: "QA will catch it".', 'The team wants to ship a new checkout step today.'),
          ],
        },
        {
          q: 'Tell me about a time you found the root cause, not only the symptom.',
          ai: true,
          short: 'A strong answer uses data and asks "why" several times, then fixes the system so the problem does not come back.',
          long: `Strong: 5 Whys, evidence, a prevention step like a test, alert or process change.
Weak: patched only the symptom.
Strong: mentions how they confirmed the cause, for example by reproducing the bug and seeing the fix remove it.
Red flag: the root cause is "a person made a mistake".`,
          exercises: [
            ex('Ask "why" to find this root cause.', 'Checks moving past the symptom.', 'Strong: asks why repeatedly (cache, headers, config) and reaches a real cause. Red flag: "clear cache" as the fix.', 'Users see old prices after a price change.',
              `"Why old prices? Cached. Why cached? API has a 1-day cache header.
Why? Default config. Fix: set the right header for prices."`),
            ex('Name how you prevent this bug next time.', 'Checks a lasting fix.', 'Strong: a test, a config review, or a doc. Red flag: no follow-up.', 'You fixed the cache header for prices.'),
          ],
        },
        {
          q: 'How do you decide between a quick fix and a proper fix?',
          ai: true,
          short: 'Look at the risk, cost, time and how often the problem will come back. Often do the quick fix now and plan the proper fix.',
          long: `Strong: makes the trade-off visible, creates a follow-up ticket with an owner.
Weak: always takes the quick fix.
Strong: gets the business owner to agree to the trade-off instead of deciding alone.
Red flag: hides the technical debt.`,
          exercises: [
            ex('Choose a quick or proper fix and explain.', 'Checks trade-offs under pressure.', 'Strong: quick fix now to stop damage, proper fix planned with a ticket. Red flag: quick fix forever.', 'A bug blocks payments now. A proper fix needs 3 days.',
              `"Hotfix today to unblock payments.
Ticket for the proper fix next sprint."`),
            ex('Convince the team to do the proper fix later.', 'Checks following up on quick fixes.', 'Strong: shows cost or risk of the hack, asks for time. Red flag: forget it.', 'Two sprints later nobody fixed it properly.',
              `"This hotfix caused two bugs this month.
Can we take 3 days for the proper fix now?"`),
          ],
        },
      ],
      techlead: [
        {
          q: 'How do you plan a big migration that takes many months?',
          ai: true,
          short: 'Split it into phases that each deliver value, keep the old and new running side by side, and have a rollback for each step.',
          long: `Strong: incremental steps, feature flags, clear success metrics, regular check-ins.
Weak: a big bang switch at the end.
Strong: plans how to keep shipping features during the migration, not only the migration itself.
Red flag: no rollback plan.`,
          exercises: [
            ex('Name the first three steps of a big migration.', 'Checks incremental, low-risk migration planning.', 'Strong: inventory, pilot one page, run both side by side. Red flag: big-bang rewrite.', 'Move 200 pages from Vue to React.',
              `"List all pages by value and risk.
Migrate one simple page as a pilot.
Run Vue and React side by side."`),
            ex('Show progress to leadership during the migration.', 'Checks simple progress reporting.', 'Strong: a metric (pages done), a trend, risks. Red flag: "it\'s going well" only.', 'Leadership asks: "Is the migration on track?"',
              `"60 of 200 pages done, about 10 per sprint.
Risk: reports pages are complex. Plan: done in Q3."`),
          ],
        },
        {
          q: 'How do you manage risks in a large project?',
          ai: true,
          short: 'List the risks early, rate them by impact and likelihood, give each one an owner and a plan, and review them often.',
          long: `Strong: a living risk list, early spikes for big risks, a plan B.
Weak: hopes for the best.
Strong: separates risks (may happen) from issues (already happening) and acts on both.
Red flag: hides risks from stakeholders.`,
          exercises: [
            ex('List the top three risks for this project.', 'Checks naming and ranking risks.', 'Strong: specific risks, impact, owner, action. Red flag: no owners.', 'New payment provider in 2 months, with an external team.',
              `1. Their API late: weekly check, mock API (me)
2. PCI rules: review early (Ana)
3. Test data: ask in week 1 (Tom)`),
            ex('Tell leadership a risk became real.', 'Checks early, clear escalation.', 'Strong: early, impact, options, a request. Red flag: hides it until launch.', 'The external team will be 3 weeks late.',
              `"The provider is 3 weeks late.
Options: move launch, or launch with card only.
I need a decision by Friday."`),
          ],
        },
        {
          q: 'How do you split work between people on your team?',
          ai: true,
          short: 'Balance delivery and growth: match tasks to skills, give stretch tasks with support, and avoid one hero owning everything.',
          long: `Strong: knows each person's goals, rotates boring work, reduces knowledge silos.
Weak: always gives hard tasks to the same person.
Strong: considers bus factor and makes sure at least two people know each critical area.
Red flag: favorites or a single point of failure.`,
          exercises: [
            ex('Assign these tasks to your team.', 'Checks balancing growth and delivery.', 'Strong: stretch tasks with support, not always the senior on hard work. Red flag: same people always get the best tasks.', 'A hard new feature, a bug list, docs. A senior, a mid, a junior.',
              `"Mid leads the feature with the senior as reviewer.
Junior takes bugs with pairing. Senior unblocks and owns docs."`),
            ex('Respond when someone always gets boring tasks.', 'Checks fairness in work split.', 'Strong: listens, agrees on a plan for a feature task. Red flag: "someone has to do it".', 'A dev says: "I only get bugs."',
              '"You are right. Next sprint you take a feature, and I pair you with Kim."'),
          ],
        },
      ],
    },
    'Teamwork and collaboration skills': {
      junior: [
        {
          q: 'How do you work with a teammate on the same feature?',
          ai: true,
          short: 'Agree on who does what, share progress often, and talk early when your work affects theirs.',
          long: `Strong: splits the work clearly, syncs often, uses small PRs.
Weak: works alone and merges at the end.
Good answers mention agreeing on interfaces or types first, so both can work in parallel.
Red flag: changes the other person's code without telling them.`,
          exercises: [
            ex('Agree with a teammate how to split one feature.', 'Checks coordination on shared work.', 'Strong: split by part, agree on interfaces, sync often. Red flag: both edit the same file without talking.', 'You and a teammate build one form together.',
              `"I take the fields, you take the API and submit.
Let's agree on the data shape now and sync at 3."`),
            ex('Message a teammate whose change broke your code.', 'Checks friendly conflict handling.', 'Strong: friendly, facts, offers to fix. Red flag: blaming in public.', 'Their merge changed a prop name you use.',
              `"Hi, your merge renamed \`onSave\`, my form broke.
I can update it, just checking it was intended."`),
          ],
        },
        {
          q: 'How do you respond to comments on your pull request?',
          ai: true,
          short: 'Read them with an open mind, fix what is right, ask questions when unclear, and explain politely when you disagree.',
          long: `Strong: thanks reviewers, replies to every comment, learns patterns.
Weak: takes comments personally.
Strong: sees review as learning and as shared ownership of the code.
Red flag: ignores comments or merges anyway.`,
          exercises: [
            ex('Reply to this review comment.', 'Checks open, curious answers to feedback.', 'Strong: thanks, agrees or explains, fixes. Red flag: defensive answer.', 'Reviewer: "Why not use the existing Button component?"',
              '"Good catch, I did not know it existed. Fixed!"'),
            ex('Reply when you do not understand a comment.', 'Checks asking instead of guessing.', 'Strong: asks for an example or a short call. Red flag: ignores it or changes code at random.', 'Reviewer: "This will cause a stale closure."',
              '"Can you show where? I am not sure how it happens here."'),
          ],
        },
        {
          q: 'A teammate is struggling with a task you know well. What do you do?',
          ai: true,
          short: 'Offer help kindly, ask what they tried, and guide them instead of taking over.',
          long: `Strong: asks first, explains, lets them do the work.
Weak: ignores it.
Good answers show empathy and patience, and respect that the task belongs to the teammate.
Red flag: takes the task over or makes them feel stupid.`,
          exercises: [
            ex('Offer help to a teammate who is stuck.', 'Checks helping without taking over.', 'Strong: offers kindly, guides instead of doing it all. Red flag: takes the keyboard.', 'A teammate fights with Git conflicts for an hour.',
              `"Want to look at it together for 10 minutes?
You drive, I can help."`),
            ex('Choose: fix it for them or teach them.', 'Checks judgment on helping.', 'Strong: fix together now quickly, teach in detail later. Red flag: always just fixing it.', 'Urgent bug blocks release. The teammate is learning.'),
          ],
        },
      ],
      middle: [
        {
          q: 'Tell me about a time you worked closely with backend developers on an API.',
          ai: true,
          short: 'A strong answer shows early agreement on the API contract, regular communication and handling changes together.',
          long: `Strong: agrees on types or a schema first, uses mocks, gives feedback early.
Weak: waits for the backend to be done.
Strong: mentions contract tests, shared types or OpenAPI to catch breaking changes early.
Red flag: blames the other team for every delay.`,
          exercises: [
            ex('Ask backend for an API change.', 'Checks clear cross-team requests.', 'Strong: problem, impact, a concrete suggestion, open to their view. Red flag: "your API is bad".', 'The list endpoint returns all 10,000 items. You need pagination.',
              `"The list returns 10k items, the page takes 6s.
Could we add \`?page\` and \`limit\`? Open to other ideas."`),
            ex('Agree on an API contract before coding.', 'Checks working in parallel safely.', 'Strong: agree on a schema or OpenAPI, mocks, a sync date. Red flag: guess and fix later.', 'Frontend and backend start the same feature on Monday.',
              `"Let's write the OpenAPI spec today.
I will use a mock, and we test the real API Thursday."`),
          ],
        },
        {
          q: 'How do you share knowledge in your team?',
          ai: true,
          short: 'Through clear docs, short demos, pairing, and good PR descriptions. Make it a habit, not a one-time event.',
          long: `Strong: writes docs where people look, presents learnings, pairs on unfamiliar areas.
Weak: knowledge stays in their head.
Strong: measures success by "others can do it without me", for example during vacations.
Red flag: keeps knowledge to feel needed.`,
          exercises: [
            ex('Name three ways to share knowledge in a team.', 'Checks practical knowledge sharing.', 'Strong: short docs, pairing, a demo or a rotation. Red flag: "people can ask me".', 'Only one person knows the build pipeline.'),
            ex('Write a short "how to" note for teammates.', 'Checks useful written docs.', 'Strong: steps, the error it fixes, where to find it. Red flag: no steps.', 'You fixed a tricky local SSL setup.',
              `Problem: "certificate invalid" locally.
Fix: run \`npm run cert\`, restart dev server.
Doc: wiki/Local-setup`),
          ],
        },
        {
          q: 'Your team agreed on an approach you did not like. What do you do?',
          ai: true,
          short: 'Say your view once with reasons, then support the team decision fully. Raise it again only if new facts appear.',
          long: `Strong: disagree and commit, collects data, stays professional.
Weak: complains later.
Strong: suggests a review point with clear criteria, so the decision can be checked with data.
Red flag: quietly does it their own way.`,
          exercises: [
            ex('Respond after the team chose another approach.', 'Checks disagree-and-commit.', 'Strong: commits fully, maybe notes the concern once. Red flag: slows down or reopens the debate.', 'The team picked REST. You wanted GraphQL.',
              `"OK, REST it is. I noted my caching worry in the ADR,
let's check it in two months."`),
            ex('Bring up the topic again with new data.', 'Checks when reopening is fair.', 'Strong: brings data, not "I told you so". Red flag: no data.', 'Two months later, REST needs 8 calls per page.',
              `"The dashboard now makes 8 calls per load.
Can we look at options again?"`),
          ],
        },
      ],
      senior: [
        {
          q: 'How do you help a team that does not work well together?',
          ai: true,
          short: 'Find the real causes by talking to people, set clear working agreements, and improve trust with small wins.',
          long: `Strong: one-on-ones, retros, clear roles, models good behavior.
Weak: waits for the manager to fix it.
Strong: looks for system causes like unclear roles or bad handoffs before blaming personalities.
Red flag: takes sides or gossips.`,
          exercises: [
            ex('Name a first step for a team that does not work well.', 'Checks diagnosing before fixing.', 'Strong: talk 1:1 to find causes, then a small change. Red flag: big rules at once.', 'PRs wait days, people work alone, nobody talks in standups.'),
            ex('Suggest one small team change and how to check it.', 'Checks experiment-based improvement.', 'Strong: one change like a daily review time, measure wait time. Red flag: no measure.', 'PRs wait 3 days for review.',
              `"Let's review PRs every day at 11 for two weeks,
then check average wait time."`),
          ],
        },
        {
          q: 'How do you mentor a mid-level developer to become senior?',
          ai: true,
          short: 'Agree on clear goals, give stretch tasks, give regular feedback, and give them visibility.',
          long: `Strong: specific growth plan, ownership of a feature, coaching instead of answers.
Weak: occasional tips.
Strong: talks about sponsoring, not only coaching: getting the person visible work and credit.
Red flag: keeps the interesting work.`,
          exercises: [
            ex('Start a mentoring talk with a mid-level dev.', 'Checks goal-setting in mentoring.', 'Strong: asks their goals, names gaps, agrees on one stretch task. Red flag: only tells stories.', 'A mid-level dev wants to be senior next year.',
              `"What does senior mean to you?
Let's pick one gap, like system design,
and find a project to grow it."`),
            ex('Give feedback to your mentee after a design review.', 'Checks specific, growth-focused feedback.', 'Strong: one strength, one gap, a next step. Red flag: only praise or only criticism.', 'Their design was good, but they did not think about errors.',
              `"The data flow was clear. Next time add an error section.
Want to review my last doc for an example?"`),
          ],
        },
        {
          q: 'How do you work with a team in another time zone?',
          ai: true,
          short: 'Use clear async communication, written decisions, a small overlap window, and clean handovers.',
          long: `Strong: good written updates, documented decisions, fair meeting times.
Weak: expects instant replies.
Strong: rotates meeting times so the same people do not always join late at night.
Red flag: always schedules meetings in their own hours only.`,
          exercises: [
            ex('Write a handoff note for a team in another time zone.', 'Checks async handoff quality.', 'Strong: status, next step, blockers, links. Red flag: "see Slack".', 'You leave for the day. The team in Asia continues the feature.',
              `Done: form + validation (PR 88).
Next: submit API (spec link).
Blocker: none. Questions in the thread.`),
            ex('Name two ways to reduce time-zone delays.', 'Checks async-first collaboration.', 'Strong: clear written questions with options, overlap hour, decision docs. Red flag: more meetings at night.', 'Questions wait a full day for answers.'),
          ],
        },
      ],
      techlead: [
        {
          q: 'How do you build a team culture where people help each other?',
          ai: true,
          short: 'Reward helping, make it safe to ask, share credit, and model the behavior yourself.',
          long: `Strong: pairing time, recognition of help, blameless reviews.
Weak: rewards only individual output.
Strong: changes how performance is judged, so helping others counts as real work.
Red flag: hero culture.`,
          exercises: [
            ex('Name two habits that build a helping culture.', 'Checks leading by example and rewarding help.', 'Strong: lead by example, praise help in public, count help in reviews. Red flag: only speed metrics.', 'People rarely help others; everyone guards their own tickets.'),
            ex('Praise help in a team message.', 'Checks specific public recognition.', 'Strong: specific, names the impact. Red flag: generic "great job, everyone".', 'Ana helped two juniors fix their tests.',
              `"Big thanks to Ana for pairing with Max and Lee on tests.
Both PRs merged today."`),
          ],
        },
        {
          q: 'How do you handle conflict between your team and another team?',
          ai: true,
          short: 'Understand both sides, focus on shared goals, agree on clear interfaces and owners, and escalate only when needed.',
          long: `Strong: meets the other lead, finds the real issue, agrees on a process.
Weak: avoids the conflict.
Strong: protects their team from drama while still being honest with them about the problem.
Red flag: talks badly about the other team.`,
          exercises: [
            ex('Talk to the other team\'s lead about the conflict.', 'Checks a calm cross-team resolution.', 'Strong: private, facts, shared goal, a joint process. Red flag: escalating first.', 'Their team keeps changing a shared component and breaks yours.',
              `"Changes to the shared Table broke us twice.
Can we add tests from both teams and review each other's PRs?"`),
            ex('Tell your team about the agreement.', 'Checks closing the loop without blame.', 'Strong: new process, why, no blame. Red flag: "they finally admitted it".', 'You agreed on shared reviews with the other team.',
              `"From now on we review each other's Table PRs.
This protects both teams."`),
          ],
        },
        {
          q: 'Two of your teams want the same senior engineer for their projects. How do you decide?',
          ai: true,
          short: 'Decide by business priority and risk, not by who asks louder. Talk to both leads, look for options like time-boxing or pairing, and explain the decision openly.',
          long: `Scarce people are a planning question.
        Strong: checks priorities with the manager, asks where the person reduces the most risk, considers the engineer's growth and wishes, offers the other team support (reviews, a design session).
        Weak: splits the person 50/50 so nobody is happy.
        Red flag: decides without asking the engineer.`,
          follow: 'How do you tell the team that did not get the person?',
          exercises: [
            ex('Decide which team gets the senior.', 'Checks fair decisions by company priority.', 'Strong: business impact and risk, input from both leads, clear reason. Red flag: decides by who asks louder.', 'Team A: revenue feature. Team B: security fix. One senior.',
              `"Security fix first: the risk is higher and short.
The senior moves to Team A in 3 weeks."`),
            ex('Tell the losing team the decision.', 'Checks explaining a decision with support.', 'Strong: reason, what help they get, when it changes. Red flag: no reason.', 'Team A did not get the senior now.',
              `"Security had to come first. Until the senior joins,
I will review your design and help with planning."`),
          ],
        },
      ],
    },
    'Can take responsibility for past mistakes and challenges?': {
      junior: [
        {
          q: 'Tell me about a time you missed a deadline. What did you do?',
          ai: true,
          short: 'A strong answer admits it clearly, explains what they did to recover, and what they changed after.',
          long: `Strong: owns it, communicated, has a lesson like asking earlier.
Weak: only external reasons.
Good answers say when they first saw the risk and how early they told people.
The lesson should be a habit, like breaking tasks smaller, not "I will try harder".
Red flag: blames others or says it never happened.`,
          exercises: [
            ex('Tell your lead you missed a deadline.', 'Checks owning a miss with a plan.', 'Strong: owns it, short reason, new date. Red flag: excuses or blaming others.', 'You missed yesterday\'s deadline for a small feature.',
              `"I missed yesterday's deadline, I underestimated the tests.
It will be ready by noon today."`),
            ex('Name what you change to avoid it next time.', 'Checks a concrete lesson.', 'Strong: add test time to estimates, warn earlier. Red flag: "try harder".', 'Your tests always take longer than planned.'),
          ],
        },
        {
          q: 'You forgot to do a task you promised a teammate. What do you do?',
          ai: true,
          short: 'Tell them as soon as you notice, apologize briefly, say when it will be done, and change something so it does not happen again.',
          long: `Small broken promises damage trust slowly.
        Strong: owns it without long excuses, fixes it fast, and uses a simple system (tickets, notes) to track promises.
        Weak: hopes the teammate also forgot.
        Red flag: blames being busy and does not give a new time.`,
          follow: 'How do you keep track of small promises?',
          exercises: [
            ex('Tell a teammate you forgot their task.', 'Checks a quick, honest apology.', 'Strong: apologize, no excuses, do it now. Red flag: pretends you were busy.', 'You promised to review their PR yesterday and forgot.',
              '"Sorry, I forgot your review yesterday. Doing it now, done in 30 minutes."'),
            ex('Name one way to stop forgetting promises.', 'Checks a simple tracking habit.', 'Strong: write it down at once, in a todo or ticket. Red flag: "I have a good memory".', 'You forget small tasks from chats.'),
          ],
        },
        {
          q: 'Tell me about a time you had to ask for more time. How did you do it?',
          ai: true,
          short: 'Ask early, explain why with facts, give a new date and options, and keep people updated.',
          long: `Asking for more time is normal; asking late is the problem.
        Strong: notices risk early, explains what changed, offers a smaller version on the old date.
        Weak: asks on the last day.
        Red flag: works all night in secret and still misses it.`,
          follow: 'How early is early enough?',
          exercises: [
            ex('Ask your lead for more time.', 'Checks asking early with a reason.', 'Strong: asks early, gives reason and new date, offers options. Red flag: asks on Friday.', 'Task due Friday. On Wednesday you see you need Monday.',
              `"I need until Monday: the API needs changes too.
I can ship the UI part on Friday if that helps."`),
            ex('Respond when your lead says no to more time.', 'Checks finding options under a fixed date.', 'Strong: proposes a smaller scope that works for the demo. Red flag: works all night silently.', 'Lead: "Friday is fixed, a client demo."',
              `"OK. For the demo I can show the main flow with mock data.
Is that enough?"`),
          ],
        },
      ],
      middle: [
        {
          q: 'Tell me about a time you took ownership of a problem that was not your fault.',
          ai: true,
          short: 'A strong answer shows the candidate fixed the problem for users and the team first, and did not waste time on who was guilty.',
          long: `Ownership means caring about the outcome, not only your own tasks.
        Strong: noticed the problem, informed the owner, helped fix it, and improved the process.
        Weak: "it was not my code, so I told them and moved on" (sometimes fine, but shows less ownership).
        Red flag: a story that mostly blames others.`,
          follow: 'When is it better to leave a problem to its owner?',
          exercises: [
            ex('Take ownership of a problem nobody owns.', 'Checks stepping up without being asked.', 'Strong: volunteers, makes a plan, shares progress. Red flag: complains in chat only.', 'Flaky tests annoy everyone. Nobody fixes them.',
              `"I will take the flaky tests this sprint.
I listed the top 5 and will fix one per day."`),
            ex('Tell the team you need help with it.', 'Checks owning without being a hero.', 'Strong: shares progress, asks the right people. Red flag: struggles alone.', 'You fixed 3 of 10 flaky tests. The rest are in another area.',
              `"Fixed 3 of 10. The other 7 are in payments.
Can someone from payments pair with me?"`),
          ],
        },
        {
          q: 'You promised a feature to another team, and now you cannot deliver it. How do you tell them?',
          ai: true,
          short: 'Tell them as early as possible, explain the reason, show what you can deliver and when, and help them adjust their plan.',
          long: `Other teams plan around your promises, so a late surprise costs them a lot.
        Strong: direct talk with the lead, honest reason, options (partial version, new date, workaround), written follow-up.
        Weak: an email on the release day.
        Red flag: says "it is almost done" for weeks.`,
          follow: 'How do you rebuild trust with that team?',
          exercises: [
            ex('Tell the other team you cannot deliver.', 'Checks early, honest bad news.', 'Strong: tells now, owns it, gives options. Red flag: tells them on the 10th.', 'You promised another team a component by the 10th. It will not be ready.',
              `"Sorry, the component won't be ready by the 10th.
I can give a basic version, or the full one on the 17th."`),
            ex('Answer their frustrated reply.', 'Checks empathy and solutions.', 'Strong: accepts it, says sorry, helps reduce impact. Red flag: defends yourself.', '"We planned our sprint on your date!"',
              `"You are right, and I am sorry.
How can I help? I can pair with your dev to use the basic version."`),
          ],
        },
        {
          q: 'Tell me about a time you failed to help a teammate when they needed it.',
          ai: true,
          short: 'A strong answer shows honest reflection, repair of the relationship, and a change in behavior.',
          long: `Strong: specific, honest, changed habit.
Weak: vague.
Strong: shows empathy for how the teammate felt and how they repaired trust.
The new habit should be visible, like regular check-ins or making time for questions.
Red flag: cannot think of any.`,
          exercises: [
            ex('Tell me when you failed to help a teammate.', 'Checks honest reflection on teamwork.', 'Strong: names it, the impact, what changed. Red flag: "I always help".', 'Example: a new dev asked for help and you said "later" all week.',
              `"A new dev asked me for help, and I kept saying later.
They were stuck 3 days. Now I block 30 minutes a day for help."`),
            ex('Apologize to that teammate.', 'Checks a sincere, short apology.', 'Strong: sorry, no excuses, offer help now. Red flag: long excuse.', 'You see the teammate was stuck because of you.',
              '"Sorry I did not help last week. Can we look at it now?"'),
          ],
        },
      ],
      senior: [
        {
          q: 'Tell me about a time you were wrong in a technical argument.',
          ai: true,
          short: 'A strong answer shows they changed their mind when facts were clear and said so publicly.',
          long: `Strong: admits openly, credits the other person.
Weak: says they were never wrong.
Strong: shows what evidence changed their mind, like a benchmark or a prototype.
They give credit publicly to the person who was right.
Red flag: still defends the wrong view.`,
          exercises: [
            ex('Admit you were wrong in a technical debate.', 'Checks changing your mind openly.', 'Strong: says it clearly, thanks the other person, next step. Red flag: quiet change or excuses.', 'You said SSR is not needed. Data shows SEO traffic fell 30%.',
              `"I was wrong about SSR, the data is clear.
Thanks Kim for pushing. Let's plan it."`),
            ex('Name what made you change your mind.', 'Checks openness to evidence.', 'Strong: names data or a test that changed it. Red flag: "I never change my mind".', 'You held a strong opinion for months.'),
          ],
        },
        {
          q: 'An incident happened because of a process you designed. How do you own it?',
          ai: true,
          short: 'Say it was your process, lead the blameless postmortem, and fix the process.',
          long: `Strong: owns it publicly, fixes the system.
Weak: blames the person who ran it.
Blameless does not mean ownerless: the process designer still owns the fix.
Strong: shares lessons with other teams that use similar processes.
Red flag: hides their role.`,
          exercises: [
            ex('Own the incident caused by your process.', 'Checks owning systems you designed.', 'Strong: "my process had a gap", fix the process, no blame on the person. Red flag: blames who ran it.', 'Your release checklist skipped DB checks. A release broke data.',
              `"The checklist I wrote had no DB check. That gap is mine.
I added it today and we will review the rest."`),
            ex('Tell the dev who ran the release it is not their fault.', 'Checks blameless culture.', 'Strong: reassures, explains the process gap, involves them in the fix. Red flag: silence.', 'The dev who ran the release feels guilty.',
              `"You followed the checklist. The gap was in it.
Want to help me improve it?"`),
          ],
        },
        {
          q: 'Tell me about a challenge you did not handle well. What would you do now?',
          ai: true,
          short: 'A strong answer is honest about the mistake and gives a clear, better approach.',
          long: `Strong: real story, reflection.
Weak: fake weakness.
Strong: a real story with real cost, not a hidden strength like "I work too hard".
The better approach must be specific enough to act on.
Red flag: no lesson.`,
          exercises: [
            ex('Tell a challenge you did not handle well.', 'Checks honest self-reflection.', 'Strong: what went wrong, the impact, a clear lesson. Red flag: a story where they are the hero.', 'Example: you rewrote a module alone instead of discussing it.',
              `"I rewrote a module alone. The team did not know it, and reviews took weeks.
Now I write a short proposal first."`),
            ex('Say what you would do now in one sentence.', 'Checks a concrete lesson.', 'Strong: one specific action. Red flag: vague "communicate better".', 'Same challenge, today.',
              '"I would write a one-page plan and get two reviewers first."'),
          ],
        },
      ],
      techlead: [
        {
          q: 'Tell me about a hiring decision that went wrong. What did you learn?',
          ai: true,
          short: 'A strong answer owns the decision, explains how they handled it fairly, and how hiring changed.',
          long: `Strong: owns it, fair handling, process change.
Weak: blames the candidate.
Strong: handled the person with respect, clear feedback and support before any exit.
They changed the interview process, for example a better work sample or more reference checks.
Red flag: no change.`,
          exercises: [
            ex('Tell me about a bad hire in one minute.', 'Checks owning a hiring mistake.', 'Strong: owns the decision, what signal was missed, what changed. Red flag: blames the candidate only.', 'Example: you hired for skills and ignored poor teamwork signs.',
              `"I ignored signs of poor teamwork because the skills were great.
Now we have a teamwork interview with clear signals."`),
            ex('Name one change to your hiring process.', 'Checks a concrete process fix.', 'Strong: a behavior round, a structured rubric, or a pairing task. Red flag: "trust my gut more".', 'The bad hire passed every technical round.'),
          ],
        },
        {
          q: 'Your team burned out on your watch. How do you own it?',
          ai: true,
          short: 'Admit your part, talk openly with the team, reduce load, and change how you plan.',
          long: `Strong: honest, acts fast, changes planning.
Weak: blames the business.
Strong: names early signals they missed, like overtime, quiet meetings or more sick days.
They change planning, such as capacity buffers and saying no to extra scope.
Red flag: ignores signals.`,
          exercises: [
            ex('Own the burnout with your team.', 'Checks accountability and care.', 'Strong: owns it, stops the cause, gives real actions. Red flag: "we all chose it".', 'Three people worked weekends for a month. Two are burned out.',
              `"I let the overtime go on too long. That is on me.
No weekend work from now. We drop two features to fix the plan."`),
            ex('Tell leadership the plan will change.', 'Checks protecting the team upward.', 'Strong: facts, risk of losing people, new plan. Red flag: hides the burnout.', 'You must cut scope to protect the team.',
              `"The team is burned out. If we keep going, we lose people.
I cut two features. New date: end of next month."`),
          ],
        },
        {
          q: 'How do you show your team that it is safe to admit mistakes?',
          ai: true,
          short: 'Admit your own mistakes first, run blameless reviews, and react calmly when people tell you bad news.',
          long: `Strong: models it, rewards early reporting.
Weak: says it but punishes.
The first reaction to bad news sets the culture; anger teaches people to hide problems.
Strong: thanks people for reporting early, in public.
Red flag: blame culture.`,
          exercises: [
            ex('Share a mistake of yours at the team meeting.', 'Checks modeling safe mistakes.', 'Strong: open, brief, what you learned, no drama. Red flag: hiding your own mistakes.', 'Your wrong estimate delayed the release.',
              `"My estimate for the release was wrong, I missed the API work.
Next time I will add a spike first."`),
            ex('Respond when a junior admits a mistake.', 'Checks rewarding honesty.', 'Strong: thanks them for telling fast, fix together, improve the system. Red flag: anger.', 'A junior says: "I deleted the test data by accident."',
              `"Thanks for telling me right away. Let's restore it,
then add a safety check so it can't happen easily."`),
          ],
        },
      ],
    },
  },
};
