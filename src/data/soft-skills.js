// Soft Skills
export default {
  "Communication skills": {
    "junior": [{
      "q": "Pick a technical idea you learned recently. Explain it to me as if I am not technical.",
      "ai": true,
      "short": "Look for clarity and simplicity: an everyday analogy, no jargon, and checking that the listener understood.",
      "long": `This tests whether the candidate can adapt to the audience - a daily need when talking to PMs, designers and support.
Strong candidates: pick a concrete concept, use an analogy, keep it to a minute, and ask "does that make sense?".
Weak candidates: recite definitions full of jargon ("it's an async non-blocking event loop...").
Watch whether they notice confusion and adjust instead of repeating louder.
Red flags: condescension, inability to simplify, or picking something they clearly do not understand.`,
      "exercises": [
        {
          "task": "Role-play: a new account manager joins. Explain what an API is in less than one minute.",
          "description": "Checks adapting technical language to a non-technical audience. Interviewer plays the account manager and may look confused once.",
          "answer": "Strong: an everyday analogy (waiter taking orders between you and the kitchen), one concrete product example, no jargon, a comprehension check. Red flags: acronyms (REST, JSON, endpoints) without explanation, talking for 3+ minutes, condescending tone.",
          "solution": `"An API is like a waiter. You don't walk into the kitchen - you tell the waiter
what you want, they bring it back. When our app shows a customer's invoices,
it asks the billing system's 'waiter' for them. Does that make sense, or should
I use a different example?"`
        },
        {
          "task": "Role-play: the support lead asks why a bug fix 'takes so long'. Explain it in simple words.",
          "description": "Checks empathy plus plain-language status communication. Interviewer plays an impatient support lead.",
          "code": `Context: the bug only happens for some customers in one time zone;
you need to reproduce it before fixing it safely.`,
          "answer": "Strong: acknowledges the frustration, explains in plain words (we have to see it happen before we can fix it safely), gives a time frame for the next update, asks for help (customer examples). Red flags: 'it's complicated', blaming QA, no next update time.",
          "solution": `"I get it - customers are waiting. The bug only shows up for some customers in
one time zone, and we can't fix it safely until we can make it happen on our side.
If you can send me two affected account IDs, that speeds things up a lot. I'll
update you by 3pm either way."`
        }
      ]
    }, {
      "q": "How do you make sure you understood a task correctly before you start coding?",
      "ai": true,
      "short": "Restate the task in your own words, ask about acceptance criteria and edge cases, confirm in writing, and share early progress to catch misunderstandings.",
      "long": `Misunderstood requirements are one of the most expensive mistakes a junior can make - days of work in the wrong direction.
Strong candidates: summarize back ("so the goal is..."), ask about edge cases (empty, error, mobile), check designs/specs, confirm in the ticket, and show a draft early.
Weak candidates: "I just start and ask if I get stuck".
Red flags: never asking questions to look smart, or asking the same questions repeatedly without notes.`,
      "exercises": [
        {
          "task": "Role-play: at the end of a meeting, your lead explains a task very fast. Check that you understood it.",
          "description": "Checks active listening and clarifying questions. Interviewer says: 'Add export to the reports page, CSV is fine, should be quick.'",
          "code": `Unknowns: which reports, which columns, filters applied or not, file size limits, who can export.`,
          "answer": "Strong: restates the goal, asks 2-4 targeted questions (scope, filters, permissions, large data), proposes a written summary. Avoids interrogating with 15 questions. Red flags: 'OK!' and leaving, or questions that show no thought.",
          "solution": `"Just to make sure: a CSV export button on the Reports page, for the report
currently shown. Should it include the active filters? All columns or the visible
ones? And is it for all users or admins only? I'll write this in the ticket so
we're aligned."`
        },
        {
          "task": "After the talk, write a ticket comment. It should confirm what is in scope.",
          "description": "Checks written confirmation habits. Candidate writes a short comment.",
          "answer": "Strong: bullet list of in-scope, out-of-scope and open questions, tagging the decision maker. This prevents 'that's not what I meant' later. Red flags: long prose, no explicit out-of-scope.",
          "solution": `Scope (confirmed with @lead):
- CSV export of the current report, active filters applied, visible columns
- Admins only
Out of scope: Excel format, scheduled exports
Open: max rows? (asking backend team)`
        }
      ]
    }],
    "middle": [{
      "q": "Tell me about a time you disagreed with a code review. What was the argument? How did it end?",
      "ai": true,
      "short": "Look for specifics, arguments backed by data or examples, and genuine openness to being wrong - whatever the outcome.",
      "long": `Disagreement is normal; how it is handled shows maturity.
Strong candidates: describe the technical point precisely, how they gathered evidence (benchmark, docs, prototype), moved the discussion to a call when the thread got long, and accepted the outcome.
Bonus if they admit they were wrong at least once, or describe a compromise.
Weak candidates: vague stories, "I just changed it to make them happy", or "they eventually agreed I was right" without how.
Red flags: personal attacks, holding grudges, escalating trivia to managers, never having disagreed.`,
      "exercises": [
        {
          "task": "Role-play: a senior reviewer blocks your PR. They want you to use a pattern you think is too much. Reply in the PR.",
          "description": "Checks handling review disagreement with evidence and openness. Candidate writes the PR reply.",
          "code": `Reviewer: "Please replace this array filter with a memoized selector for performance."
Facts: list has max 50 items; you profiled filter at < 0.1ms.`,
          "answer": "Strong: assumes good intent, brings data, proposes a condition for revisiting, offers a quick call, and stays open to being wrong. Red flags: 'it's fine, approving myself', sarcasm, appealing to another reviewer behind their back.",
          "solution": `"Good point to check - I profiled it: the list is capped at 50 items and the
filter takes < 0.1ms (screenshot attached). I'd keep it simple for now and add a
comment to memoize if the list grows past ~1k. Happy to jump on a 10-min call if
you see a case I'm missing."`
        },
        {
          "task": "Rewrite this review comment so it is helpful and polite.",
          "description": "Checks giving constructive feedback. Candidate rewrites the comment; ask how the author would feel reading each version.",
          "code": `"This is wrong. Why would you ever do it like this?"`,
          "answer": "Strong: states the concrete problem and impact, suggests a fix or pattern, links to an example, separates blocking from nit, uses a question instead of judgment. Red flags: personal tone, no explanation, vague 'fix this'.",
          "solution": `"Blocking: this fetch has no error handling, so if the API fails the page stays
blank. Our pattern is handleApiError in src/lib/api.ts - could you use that?
Happy to pair if useful."`
        }
      ]
    }, {
      "q": "How do you write a good written update or PR description? How do you make people really read it?",
      "ai": true,
      "short": "Lead with the point (what and why), keep it skimmable with bullets, include evidence (screenshots, test results), call out risks and what you need from the reader.",
      "long": `Remote and cross-timezone teams depend on writing; a clear PR description speeds review and leaves a record.
Strong candidates: TL;DR first, context and decision, how to test, risks, explicit asks with names.
Weak candidates: 'fixed stuff' or a wall of text.
Red flags: no evidence of testing, or hiding risky changes inside a 'refactor' PR.`,
      "exercises": [
        {
          "task": "Rewrite this PR description.",
          "description": "Checks clear technical writing. Candidate rewrites it in ~5 minutes.",
          "code": `Title: fixes
Body: fixed the bug with dates and also refactored some stuff and updated deps`,
          "answer": "Strong: specific title, why the change is needed, what changed (split concerns or explain why together), how it was tested, risks, screenshots if UI. Red flags: still mixing unrelated changes without saying so, no testing info.",
          "solution": `Title: Fix invoice dates shown a day early for US time zones

Why: dates were parsed as UTC midnight, then shown in local time (FE-318).
What: parse as local date in formatInvoiceDate; added tests for UTC-8 and UTC+10.
Also: bumped date-fns 3.3 -> 3.6 (needed for parseISO fix) - no API changes.
Testing: unit tests; manual check in Chrome with TZ=America/Los_Angeles.
Risk: low; affects invoice list and PDF only.`
        },
        {
          "task": "Write a 4-line end-of-week update to your team lead.",
          "description": "Checks concise status writing. Candidate writes the update.",
          "answer": "Strong: done, in progress, blocked/risks, next - with specifics, not activity lists. Red flags: 'worked on stuff', hiding a blocker.",
          "solution": `Done: CSV export shipped behind flag (FE-301).
In progress: invoice date fix, PR up, needs review from Ana.
Risk: export times out above 50k rows - investigating Monday.
Next: pagination for export or a background job, will propose options Tue.`
        }
      ]
    }],
    "senior": [{
      "q": "How do you explain a big technical risk to people who are not technical?",
      "ai": true,
      "short": "Translate it into business impact, likelihood and timeline, present options with trade-offs, and give a clear recommendation.",
      "long": `Stakeholders need decisions, not stack traces.
Strong structure: what can happen (user/revenue impact), how likely, when, options (with cost and trade-off), recommendation, what you need from them.
Communicate early and in writing, then follow up; avoid both alarmism and downplaying.
Strong candidates: give a concrete example and mention a written summary.
Weak candidates: technical detail dumps or "I tell my manager and they handle it".
Red flags: hiding risk until it materialises, or using fear to push personal preferences.`,
      "exercises": [
        {
          "task": "Write an email to the VP of Product about a risk. The payment SDK will soon stop being supported.",
          "description": "Checks framing technical risk as business impact with a decision ask. Candidate drafts the email in ~5 minutes.",
          "code": `Facts: vendor ends support March 1 (8 weeks). After that card payments may fail.
Full upgrade = 2 sprints (delays feature X ~3 weeks). Minimal patch = 1 sprint, redo in Q3.`,
          "answer": "Strong: subject states the risk and date; impact in business terms; likelihood; 2-3 options with cost/trade-off; clear recommendation; explicit ask with a deadline. Red flags: technical detail dump (TLS ciphers, adapter layers), no recommendation, alarmist tone, sending it the week before.",
          "solution": `Subject: Risk - payment SDK end-of-life on March 1, decision needed by Friday

Impact: after March 1 card checkout may fail for all customers.
Likelihood: high (vendor confirmed the date).
Options:
  A) Full upgrade now - 2 sprints, delays feature X by ~3 weeks.
  B) Minimal patch - 1 sprint, must be redone in Q3.
Recommendation: A - it removes the risk for good.
Ask: confirm by Friday so we can start next sprint.`
        },
        {
          "task": "Role-play: the risk is not clear yet. In a meeting, a non-technical manager says 'just tell me, is it safe or not?'",
          "description": "Checks honest communication under uncertainty. Interviewer plays the exec and demands a yes/no.",
          "answer": "Strong: gives a direct answer with honest uncertainty (likely/unlikely + what would change it), the worst-case impact, what you are doing to reduce uncertainty, and when they'll hear back. Red flags: false certainty, refusing to answer, hiding behind jargon.",
          "solution": `"Short answer: probably safe for the next month, but I'm not certain yet. The
worst case is checkout failures for a few hours. We'll know for sure by Thursday
after a load test, and I'll send you a yes/no then with a fallback plan."`
        }
      ]
    }, {
      "q": "How do you give negative feedback to a colleague or another team? How do you keep a good relationship?",
      "ai": true,
      "short": "Privately, specifically and promptly: describe the situation, behaviour and impact, ask for their view, and agree on what changes. Focus on the work, not the person.",
      "long": `Seniors are expected to raise hard topics, not route everything through managers.
Strong candidates: use a structure (Situation-Behaviour-Impact), choose the right channel (1:1 not public Slack), are curious about the other side, and follow up.
Weak candidates: avoid it until it explodes, or vent to others.
Red flags: public criticism, sarcasm, feedback only via performance reviews.`,
      "exercises": [
        {
          "task": "Role-play: another team often changes their API without warning. This breaks your frontend. Talk to their lead.",
          "description": "Checks cross-team feedback. Interviewer plays the other team's lead, slightly defensive.",
          "code": `Facts: 3 breaking changes in 6 weeks; last one caused a 2-hour checkout outage.`,
          "answer": "Strong: SBI with facts, acknowledges their pressures, asks what's happening on their side, proposes a concrete process (versioning, contract tests, changelog channel), agrees on next step. Red flags: accusing, escalating to directors first, vague complaints.",
          "solution": `"Thanks for making time. In the last six weeks three API changes reached us without
notice; the last one broke checkout for two hours. I know you're under delivery
pressure too - what does your release process look like? Could we try contract
tests in your CI and a #api-changes heads-up for breaking changes? I can help set up the tests."`
        },
        {
          "task": "Role-play: another senior often interrupts juniors in design reviews. Give this person feedback.",
          "description": "Checks peer feedback on behaviour. Interviewer plays the senior, who says 'I'm just being efficient.'",
          "answer": "Strong: private, specific example, impact on the juniors and the team, acknowledges their intent, a concrete ask. Red flags: making it about personality, going to the manager first, backing down entirely at the first pushback.",
          "solution": `"In Tuesday's review you cut in twice while Lena was explaining her approach. I know
you want to move fast, but she didn't speak again for the rest of the meeting, and
we may miss ideas that way. Could you let people finish and save questions for the
end? I'd want the same feedback if I did it."`
        }
      ]
    }],
    "techlead": [{
      "q": "How do you run a meeting where a technical decision must be made?",
      "ai": true,
      "short": "Send a short pre-read with options and a recommendation, invite only the people needed, name who decides, time-box the discussion, and write down the decision and owners at the end.",
      "long": `Many decision meetings end with "let's discuss more" because nobody prepared or nobody owns the decision.
Strong candidates: written pre-read (problem, options, trade-offs, recommendation), clear decider, quiet voices invited to speak, parking lot for side topics, decision + next steps posted within the hour.
Weak candidates: open discussion with no agenda, hoping for consensus.
Red flags: deciding alone after the meeting without telling people, or letting the loudest person win by default.`,
      "follow": "What do you do when the meeting ends without a decision?",
      "exercises": [
        {
          "task": "Role-play: open a 30-minute meeting to choose between two state management libraries.",
          "description": "Checks facilitation. Interviewer plays a team member; judge structure and clarity.",
          "answer": "Strong: states the goal and the decider, recaps the pre-read in one minute, sets a time box, asks each person for concerns, closes with a decision or a clear next step. Red flags: no goal, no decider, starts with own opinion for ten minutes.",
          "solution": `"Goal for today: pick our state library for the new app. I'll make the call at the
end unless we have a clear consensus. You all read the comparison doc - quick recap:
option A is simpler, option B handles server cache better. Let's take 15 minutes for
concerns, starting with the people who'll use it most. Priya, you first?"`
        },
        {
          "task": "Role-play: one senior keeps talking and others stay quiet. Handle it in the meeting.",
          "description": "Checks balancing voices without embarrassing anyone.",
          "answer": "Strong: thanks the senior, summarizes their point, and directly invites others; uses a round or written input. Red flags: lets it continue, or shames the senior in front of the team.",
          "solution": `"Thanks, Mark - so your main worry is the learning curve. Let's hear from people
who haven't spoken yet. Ana, Leo - what concerns do you have? One minute each."`
        }
      ]
    }, {
      "q": "How do you tell your team about a team change, a new priority, or a decision they will not like?",
      "ai": true,
      "short": "Tell them early and directly, explain the why and what it means for them, be honest about what you don't know, give space for reactions, and follow up 1:1.",
      "long": `Teams handle bad news better than surprises or spin.
Strong candidates: prepare (FAQ, impact per person), deliver in person/live before written, own the message even if they disagreed, listen to concerns, follow up with individuals most affected.
Weak candidates: forward the email from above, or blame leadership ("not my decision").
Red flags: hiding information, promising things outside their control.`,
      "exercises": [
        {
          "task": "Role-play: tell the team their project is cancelled. The team must focus on a compliance deadline instead.",
          "description": "Checks delivering unpopular news. Interviewer plays a team member who asks 'so our 3 months were wasted?'",
          "answer": "Strong: direct opening, the business reason, what happens to the work (archived, learnings kept), what's next and why it matters, acknowledges disappointment, open Q&A and 1:1s. Red flags: 'leadership decided, not me', sugar-coating, no answer to 'was it wasted'.",
          "solution": `"I have hard news: we're pausing the recommendations project to meet the
compliance deadline in March - without it we can't sell to EU customers. I know
that's frustrating after three months. The work isn't wasted: the data pipeline is
reused in the compliance work and we'll document where we stopped. I'll do 1:1s
this week to talk about what this means for each of you."`
        },
        {
          "task": "Write the message you send after the meeting.",
          "description": "Checks written reinforcement of a hard message. Candidate drafts the message.",
          "answer": "Strong: summarizes the decision and reason, next steps with dates, what's still unknown, where to ask questions. Red flags: new information that wasn't said live, corporate tone.",
          "solution": `"Recap from today: recommendations is paused until after the March compliance deadline.
Next: kickoff for compliance work Thursday; code and notes archived in /recs-paused.
Unknown yet: whether we resume in Q2 - I'll update by end of February.
Questions any time, here or in 1:1s."`
        }
      ]
    }]
  },
  "Planning and problem-solving ability": {
    "junior": [{
      "q": "You are stuck on a problem for 4 hours. What do you do?",
      "ai": true,
      "short": "Timebox the struggle, document what has been tried, and ask for help with context (goal, attempts, error) rather than staying silent.",
      "long": `The balance is between independence and wasting a day.
Strong candidates: break the problem down, read error messages/docs, minimal repro, timebox (e.g. 1-2 hours), then ask a specific question showing what they tried.
Weak candidates: "I keep trying until it works" or ask immediately without trying anything.
Bonus: mention rubber-ducking or using AI/search as part of investigation.
Red flags: hiding being stuck until standup the next day, or "I'd just skip that task".`,
      "exercises": [
        {
          "task": "You are stuck for 2 hours on a login redirect loop. Write a message asking for help.",
          "description": "Checks asking for help effectively. Candidate writes the message; judge context and specificity.",
          "code": `Ticket FE-231. After OAuth login users loop back to /login.
You checked: cookies, auth guard, returnUrl logging (empty after callback).`,
          "answer": "Strong: goal, what was tried, observed evidence, a specific question, and a small time ask. Red flags: 'it doesn't work, can you help?', no context, waiting a whole day before asking.",
          "solution": `"Hey, I'm stuck on the login redirect loop (FE-231).
Goal: after login, go back to the original page.
Tried: clearing cookies, checking the auth guard, logging returnUrl - it's empty
after the OAuth callback. No errors, just loops.
Do you know where returnUrl should survive the callback? 10 min to look together?"`
        },
        {
          "task": "Role-play: at standup, tell the team you are blocked. It should not sound like an excuse.",
          "description": "Checks concise status communication. Candidate speaks for 30 seconds as at standup.",
          "answer": "Strong: one sentence on status, one on the blocker, one concrete ask with a name. Red flags: a long technical monologue, 'still working on it' for the third day, no ask.",
          "solution": `"Yesterday: narrowed the login loop to the OAuth callback dropping returnUrl.
Blocked: I don't know how we persist state across the redirect. Priya, could
I grab 15 minutes after standup?"`
        }
      ]
    }, {
      "q": "You have three tasks due today and can only finish one or two. What do you do?",
      "ai": true,
      "short": "Clarify priorities with whoever owns them, communicate early what won't get done, and focus on the highest-impact task instead of half-finishing all three.",
      "long": `Juniors often try to do everything and silently miss deadlines.
Strong candidates: list tasks with impact and deadlines, ask the lead to prioritize if unclear, tell stakeholders early, finish one fully.
Weak candidates: "I'd stay late" as the only answer.
Red flags: deciding alone to drop someone's request without telling them.`,
      "exercises": [
        {
          "task": "Write the message asking your lead to help prioritize.",
          "description": "Checks asking for prioritization with a proposal. Candidate writes the message.",
          "code": `Tasks: bug for a customer demo tomorrow, design review comments, refactor ticket.`,
          "answer": "Strong: lists tasks with impact and estimate, proposes an order, asks for confirmation. Lead with a proposal, not 'what should I do?'. Red flag: no proposal or no mention of what slips.",
          "solution": `"I can't finish all three today. Proposal: 1) demo bug (customer tomorrow, ~3h),
2) design review comments (~2h). The refactor moves to tomorrow. OK with you?"`
        },
        {
          "task": "Role-play: tell the designer you will work on their review comments tomorrow, not today.",
          "description": "Checks expectation setting with a peer. Interviewer plays the designer.",
          "answer": "Strong: short, gives a reason, a specific new time, and offers something now if it's blocking. Red flags: ignoring them, over-apologizing without a time.",
          "solution": `"Hi! I'm on a customer demo bug today, so I'll get to your review comments tomorrow
morning. Is any of it blocking you today? If so, tell me which and I'll squeeze it in."`
        }
      ]
    }],
    "middle": [{
      "q": "You estimated 3 days. Now it is day 5 and the task is not done. What do you do?",
      "ai": true,
      "short": "Communicate as soon as the slip is visible, explain why, give a new estimate and options (re-scope, split, get help).",
      "long": `The real problem is usually not the slip but the silence about it.
Strong candidates: they would have flagged it on day 2-3, explain the cause (unknowns, scope creep), propose options, and adjust future estimates.
They also reflect: what made the estimate wrong and how to estimate better (spikes, buffers, splitting tasks).
Weak candidates: "I'd work late to catch up" without telling anyone.
Red flags: blaming others, repeatedly saying "almost done", no learning.`,
      "exercises": [
        {
          "task": "Role-play: tell the PM the feature will be one week late.",
          "description": "Checks owning and communicating a slip. Interviewer plays the PM and asks 'why didn't I hear earlier?'",
          "code": `Estimate: 3 days, now day 5. Cause: legacy API returns dates in 3 formats
(found on day 2, not flagged). Done: parsing + validation. Left: error UI (~1.5 days).`,
          "answer": "Strong: leads with the news, owns the late flag, explains the cause briefly, states what's done/left, offers options (ship behind flag, cut scope), asks for a decision, says what changes next time. Red flags: 'almost done' again, blaming the legacy team, burying the slip in detail.",
          "solution": `"Quick heads-up: CSV import will be late. I estimated 3 days, we're on day 5.
The legacy API returns dates in 3 formats - I found it on day 2 and should have
flagged it then. Parsing and validation are done; the error report UI needs
~1.5 days. Option: ship import tomorrow behind a flag and the UI next sprint.
Which do you prefer? Next time I'll raise surprises the same day."`
        },
        {
          "task": "Write a short retro note. Explain why the estimate was wrong and what you will change.",
          "description": "Checks reflection and estimation improvement. Candidate writes a short retro note.",
          "answer": "Strong: specific root cause (unknown data formats), concrete practice changes (spike unknown integrations, estimate ranges, split tasks, flag at 50% overrun). Red flags: 'estimates are always wrong', no change.",
          "solution": `Why: I estimated without checking real API data; 3 date formats added 2 days.
Changes: (1) half-day spike before estimating legacy integrations,
(2) give ranges ("3-5 days") when unknowns exist,
(3) flag in the channel as soon as I pass 50% over estimate.`
        }
      ]
    }, {
      "q": "How do you debug a bug that you cannot reproduce on your machine?",
      "ai": true,
      "short": "Gather data (logs, user steps, environment), form hypotheses, narrow down systematically (bisect, feature flags, extra logging), and communicate progress while investigating.",
      "long": `Tests structured problem solving, not tool knowledge.
Strong candidates: collect facts (who, when, browser, data), compare environments, add targeted logging/telemetry, try to reproduce with production-like data, git bisect if a regression, timebox and share findings.
Weak candidates: random changes hoping it fixes it.
Red flags: closing as "cannot reproduce" without investigation.`,
      "exercises": [
        {
          "task": "Explain your plan step by step: 'Some users see a blank page after login, only in production.'",
          "description": "Checks systematic debugging. Interviewer reveals facts if asked: Safari only, started Tuesday, Sentry shows a SyntaxError.",
          "answer": "Strong: asks for data first (browsers, time, error tracking), correlates with deployments, forms a hypothesis (new syntax unsupported in older Safari), verifies, fixes and adds a guard (browserslist/test). Red flags: guessing without asking for data.",
          "solution": `"First, who and since when? ... Safari, since Tuesday. What did we deploy Tuesday?
Sentry shows a SyntaxError, so likely a new syntax/API older Safari doesn't support.
I'd check the bundle target and browserslist, reproduce in that Safari version on
BrowserStack, fix the target, and add that browser to our test matrix."`
        },
        {
          "task": "You are still investigating. Write a status update to the PM.",
          "description": "Checks communication during uncertainty. Candidate writes a short message.",
          "answer": "Strong: what's known, impact, current hypothesis, next step and next update time. Red flag: silence until it's fixed, or overpromising a fix time.",
          "solution": `"Update on blank page after login: affects Safari 15 users (~3% of logins) since
Tuesday's release. Likely cause: a build setting that older Safari can't run.
Verifying now; next update by 2pm with a fix ETA."`
        }
      ]
    }],
    "senior": [{
      "q": "Here is an unclear request: \"Make the dashboard faster.\" Split it into smaller steps now.",
      "ai": true,
      "short": "Ask clarifying questions, define metrics and a baseline, form hypotheses, measure, then prioritize fixes by impact versus effort.",
      "long": `This tests structured thinking under ambiguity.
Strong candidates: ask who/what is slow (initial load? filters? specific users/data size?), define a target (e.g. LCP < 2.5s, filter response < 300ms), measure first (RUM, Lighthouse, profiler, network waterfall), list hypotheses (bundle size, waterfall requests, slow API, re-renders), prioritize quick wins.
They talk about validating results after the change.
Weak candidates: jump straight to a solution ("add React.memo everywhere", "rewrite in X").
Red flags: no questions, no measurement.`,
      "exercises": [
        {
          "task": "Role-play: the CEO says 'the dashboard is slow, fix it'. Ask your questions. Then suggest the first step.",
          "description": "Checks structured thinking under ambiguity. Interviewer plays the CEO and answers clarifying questions briefly.",
          "answer": "Strong: asks which part, for whom, since when, how slow; defines a measurable target; proposes measuring first (RUM/profiling) before changing code; sets a check-in time. Red flags: promising a rewrite, jumping to React.memo everywhere, no metric.",
          "solution": `"Happy to. A few questions so we fix the right thing: is it the first load or
filtering? For all customers or big accounts? Since a recent release? I'll pull
real-user data and profile a large account today, then come back tomorrow with
the top 2-3 causes, a target like 'filters under 300ms', and what each fix costs."`
        },
        {
          "task": "The problem is 'dashboard is slow'. Put these possible causes in order and explain the order.",
          "description": "Checks prioritization by impact vs effort. Candidate orders the list and justifies it.",
          "code": `a) 2MB JS bundle (LCP 4.1s)
b) 6 sequential API calls on load (waterfall ~1.8s)
c) Chart re-renders on every filter change (~400ms)
d) Rewrite in a different framework`,
          "answer": "b first (high impact, low effort - parallelize/batch), then a (code splitting, measurable LCP gain), then c (memoize/virtualize the chart for filter latency); d is not a hypothesis but a solution with huge cost and no evidence. Re-measure after each change.",
          "solution": "1) b: parallelize calls (Promise.all / one aggregated endpoint) - saves ~1.5s. 2) a: route-level code splitting, lazy-load charts. 3) c: memoize chart data, avoid re-render on unrelated state. Skip d. Re-measure p75 after each step."
        }
      ]
    }, {
      "q": "How do you choose between fixing technical debt and building new features?",
      "ai": true,
      "short": "Quantify the debt's cost (incidents, slowed delivery, onboarding time), tie it to business outcomes, and propose incremental paydown alongside features rather than a big-bang rewrite.",
      "long": `Seniors need to argue for debt work in terms product understands.
Strong candidates: show data (bug rates in a module, lead time, on-call pages), pick debt that blocks upcoming roadmap work, use an ongoing budget (e.g. 20%) or bundle refactors with features, measure results.
Weak candidates: "we need a rewrite" without evidence.
Red flags: secretly doing refactors inside feature estimates without telling anyone, or never doing them.`,
      "exercises": [
        {
          "task": "Role-play: you want 3 weeks to refactor the checkout module. Convince the PM.",
          "description": "Checks business framing of technical work. Interviewer plays a skeptical PM.",
          "code": `Data: 40% of production bugs last quarter came from checkout; each checkout feature takes ~2x estimates;
next quarter's roadmap has 3 checkout features.`,
          "answer": "Strong: leads with business impact (bugs, slowed roadmap), shows data, ties to upcoming work, proposes an incremental plan with a measurable outcome, offers trade-offs. Red flags: 'the code is ugly', all-or-nothing rewrite.",
          "solution": `"Checkout caused 40% of last quarter's production bugs, and features there take
about twice as long as estimated. We have three checkout features next quarter.
If we spend 3 weeks splitting the payment step first, I expect those features to
land faster and with fewer incidents. We can do it incrementally - first feature
starts in week 2. I'll report bug and lead-time numbers after."`
        },
        {
          "task": "The PM says 'no time this quarter'. What do you do next?",
          "description": "Checks negotiation and persistence without conflict. Discussion.",
          "answer": "Strong: accept the constraint, propose a smaller slice (refactor only what the next feature touches), add the cost to estimates transparently, track the data and revisit. Red flags: doing it secretly or giving up entirely.",
          "solution": "\"Understood. Then let's refactor only the parts each checkout feature touches, included in its estimate - about +2 days each. I'll track bug counts and revisit next planning.\""
        }
      ]
    }],
    "techlead": [{
      "q": "Product wants a feature in 2 weeks. You estimate 6 weeks. Explain the conversation step by step.",
      "ai": true,
      "short": "Understand the underlying goal, propose MVP slices that fit the window, make risks explicit, and negotiate scope - not quality.",
      "long": `Start with why the date matters (event, contract, competitor) - that shapes the options.
Then show what drives the 6 weeks and what can be cut, deferred or simplified; offer a 2-week slice that delivers the core value.
Be explicit that cutting tests or reviews is not an option - that just moves cost to later incidents.
Strong candidates: collaborative tone, concrete slicing, written agreement.
Weak candidates: "6 weeks, take it or leave it" or caving to 2 weeks.
Red flags: padding estimates as a negotiation tactic, or promising and missing.`,
      "exercises": [
        {
          "task": "Role-play: product wants the feature in 2 weeks. You estimate 6 weeks. Lead the conversation.",
          "description": "Checks scope negotiation with product. Interviewer plays the PM and reveals the demo only if asked why.",
          "code": `Breakdown: UI 1w, permissions 2w, integrations 2w, QA 1w.
Reason for date (you don't know yet): a sales demo to a key prospect.`,
          "answer": "Strong: asks why the date matters first, shows the breakdown, offers a slice that meets the real goal (demo), names non-negotiables (tests, review), confirms in writing. Red flags: 'take it or leave it', caving to 2 weeks, padding estimates.",
          "solution": `"Before we talk dates - what happens in 2 weeks? ... A demo, got it. Then we
don't need the whole thing. The 6 weeks are UI 1, permissions 2, integrations 2,
QA 1. For the demo: UI plus the Salesforce integration, admin-only, behind a flag -
that fits in 2 weeks. The rest follows over 4 weeks. Tests and review stay in.
I'll write this up today so we both agree on what 'done in 2 weeks' means."`
        },
        {
          "task": "The PM asks your team to 'skip tests to meet the date'. Write your reply to the PM.",
          "description": "Checks defending quality with business arguments. Candidate writes the reply to the PM.",
          "answer": "Strong: explains the cost in business terms (bugs in front of the customer, slower later work), offers a scope trade instead, stays collaborative. Red flags: flat 'no' with no alternative, or quietly agreeing.",
          "solution": `"I'd rather cut scope than tests - skipping them usually means we find bugs
during the demo instead of before it, and the next feature gets slower. If we
drop the CSV export from this release, we make the date with tests in. Does that
work for the demo?"`
        }
      ]
    }, {
      "q": "How do you plan a quarter when the team gets more requests than it can do?",
      "ai": true,
      "short": "Collect demands, estimate roughly, align with company goals, reserve capacity for unplanned work and debt, make explicit trade-offs with stakeholders, and publish what is and isn't committed.",
      "long": `The lead turns too many requests into a realistic, agreed plan.
Strong candidates: know team capacity (vacations, on-call, support load), keep a buffer (15-25%), rank by impact and alignment, involve the team in estimates, get stakeholder sign-off on the cut line, review mid-quarter.
Weak candidates: accept everything, or plan at 100% capacity.
Red flags: no buffer, committing without team input, no visible 'not doing' list.`,
      "exercises": [
        {
          "task": "Your team has about 40 engineer-weeks. The requests need about 70. How do you build and present the plan?",
          "description": "Checks capacity planning and stakeholder management. Candidate explains steps and the presentation.",
          "answer": "Strong: subtract buffer and keep-the-lights-on work first (~30 weeks real), rank requests with stakeholders against goals, show the cut line explicitly, keep a 'next' list, agree on a revisit point. Red flags: planning all 40 weeks for features, hiding the cut line.",
          "solution": `Capacity 40w - on-call/support 6w - buffer 6w = 28w for planned work.
Rank 70w of asks by goal alignment + impact/effort with PM.
Commit: top items up to 28w. Stretch: next 6w. Not this quarter: rest (published).
Review at week 6 with stakeholders.`
        },
        {
          "task": "Role-play: a stakeholder's project did not make it into the plan. They ask you to 'just squeeze it in'.",
          "description": "Checks saying no with options. Interviewer plays the stakeholder, a senior manager.",
          "answer": "Strong: empathize, explain the trade-off (what would have to drop), offer options (swap with something, smaller version, next quarter date, escalate to shared leadership to decide). Red flags: yes to avoid conflict, or a flat no without options.",
          "solution": `"I understand it matters. We're at capacity, so adding it means dropping something
- the closest swap is the reporting revamp. Alternatively a smaller version in 2 weeks
of stretch time, or first thing next quarter. If you think it should beat reporting,
let's take it to Maria together this week."`
        }
      ]
    }]
  },
  "Teamwork and collaboration skills": {
    "junior": [{
      "q": "How do you work with designers and QA? Give an example.",
      "ai": true,
      "short": "Look for early involvement, asking questions before building, and tight feedback loops rather than handoffs over a wall.",
      "long": `Good engineers treat designers and QA as partners, not gatekeepers.
Strong candidates: review designs before implementation, ask about edge states (empty, error, loading, mobile), share previews early, give QA test notes and fix bugs without defensiveness.
Weak candidates: "I build what's in Figma and QA tells me if it's wrong".
Red flags: dismissive language ("QA just finds trivial stuff"), never talking to designers.`,
      "exercises": [
        {
          "task": "Role-play: you got a design for a checkout form. Lead the first meeting with the designer.",
          "description": "Checks proactive collaboration with design. Interviewer plays the designer; see which missing states they raise.",
          "code": `The Figma shows the happy path only.`,
          "answer": "Strong: asks about empty/error/loading states, mobile, accessibility (labels, focus), validation messages, and agrees on when to share a preview. Red flags: building silently and inventing missing states, 'not my job'.",
          "solution": `"Looks great. Before I start: what should we show if the card is declined, or
while payment is processing? How does this look on mobile? And what's the
copy for validation errors? I'll share a preview link mid-sprint so you can
check spacing before QA."`
        },
        {
          "task": "QA reopened your ticket with a bug. You think the bug is out of scope. Reply to QA.",
          "description": "Checks non-defensive collaboration with QA. Candidate writes the ticket reply.",
          "answer": "Strong: thanks them, checks the facts, explains reasoning, proposes a path (new ticket, PM decision) instead of arguing. Red flags: defensiveness, 'works on my machine', closing it without a reply.",
          "solution": `"Thanks for catching this. It reproduces for me too. It comes from the old
address component, not this change, so I'd suggest a separate ticket so this one
can ship - I've created FE-412 and tagged the PM to prioritize. Does that work?"`
        }
      ]
    }, {
      "q": "A teammate disagrees with you about how to build something. What do you do?",
      "ai": true,
      "short": "Listen to understand their reasoning, share yours with facts, look for what's best for the project, and if still stuck, ask a senior or try a quick experiment - then commit to the decision.",
      "long": `Juniors should show they can disagree respectfully and let go of ego.
Strong candidates: ask questions first, argue with examples or small prototypes, accept a decision even if it isn't theirs.
Weak candidates: give in immediately every time, or insist on their way.
Red flags: going silent and doing it their way anyway, complaining to others.`,
      "exercises": [
        {
          "task": "Role-play: a teammate wants API calls directly in components. You think a shared hook is better.",
          "description": "Checks respectful technical disagreement. Interviewer plays the teammate and says 'hooks are overkill for this'.",
          "answer": "Strong: asks why they prefer it, explains the benefit concretely (reuse, testing, consistency with codebase), suggests a quick check or asks a senior, accepts the outcome. Red flags: 'that's wrong', citing rules without reasons.",
          "solution": `"Can I understand why you'd keep it in the component? ... Makes sense for one place.
My worry is we already fetch users in two other screens, and the codebase uses
hooks in features/*/api. Want to ask Dana which way she'd go, or try the hook for
this one and see if it feels heavy?"`
        },
        {
          "task": "The team decides against your proposal. What do you say and do next?",
          "description": "Checks disagree-and-commit. Short answer.",
          "answer": "Strong: accepts openly, implements the chosen approach well, maybe notes a revisit condition. Red flags: passive resistance, 'told you so' later.",
          "solution": "\"Fair enough, let's go with the component approach. If we end up fetching users in a fourth place, maybe we revisit.\" Then implement it properly."
        }
      ]
    }],
    "middle": [{
      "q": "A teammate's PR is blocking you, and they do not answer. What do you do?",
      "ai": true,
      "short": "Reach out directly and kindly, offer help, look for ways to unblock yourself, and escalate respectfully if it continues.",
      "long": `Tests initiative and respect at the same time.
Strong candidates: ping directly (maybe they are overloaded or out), offer to pair or take part of the work, work around in the meantime (stub, branch off their branch), then raise it at standup or with the lead without blame.
Weak candidates: wait silently for days, or complain to the manager first.
Red flags: merging or rewriting the teammate's work without telling them, passive-aggressive comments.`,
      "exercises": [
        {
          "task": "A teammate's PR has blocked you for 3 days. Write a message to them.",
          "description": "Checks unblocking oneself while respecting a teammate. Candidate writes the direct message.",
          "answer": "Strong: friendly, assumes good intent, offers concrete help, says how you'll unblock yourself, suggests raising it together if it's a priority issue. Red flags: passive aggression, CC'ing the manager first, copying their code into your PR.",
          "solution": `"Hey Sam, my ticket depends on your auth-refactor PR. Anything I can help with to
get it over the line - review, tests, splitting it? Meanwhile I'll branch off yours
so I'm not blocked. If it's stuck on priorities, happy to raise it at standup together."`
        },
        {
          "task": "Role-play: two days later there is still no answer. Bring it up at standup.",
          "description": "Checks escalating without blame. Candidate speaks as at standup.",
          "answer": "Strong: factual, no blame, states impact and an ask (re-prioritize, reassign review, pair). Red flags: naming and shaming, complaining, or continuing to wait silently.",
          "solution": `"I'm blocked on the auth-refactor PR - I'm working off Sam's branch, but I can't
merge until it lands. Sam, I know you're swamped; could I take the test part, or
could someone else review it today? Otherwise this slips to next sprint."`
        }
      ]
    }, {
      "q": "You know a project well. How do you help a new teammate start on it?",
      "ai": true,
      "short": "Prepare a short plan: environment setup, architecture walkthrough, a good first task with a buddy, regular check-ins, and make it safe to ask questions; fix the docs gaps they find.",
      "long": `Mid-level engineers often become onboarding buddies; doing it well multiplies the team.
Strong candidates: first-day setup guide, a small real task shipped in week 1, pairing sessions, check-ins, encourage them to improve docs with fresh eyes.
Weak candidates: "send them the wiki link".
Red flags: being annoyed by questions, giving them only throwaway tasks.`,
      "exercises": [
        {
          "task": "Write a first-week plan for a new mid-level frontend engineer.",
          "description": "Checks structured onboarding. Candidate drafts a day-by-day plan.",
          "answer": "Strong: setup with a buddy day 1, architecture walkthrough, a small real ticket shipped by day 3-4, meet key people (PM, designer, QA), a check-in at the end of the week, ask for docs fixes. Red flags: a week of reading only.",
          "solution": `Day 1: laptop setup with buddy, run app + tests, read README/CLAUDE.md, fix any doc gaps found.
Day 2: architecture walkthrough (1h), pair on a bug.
Day 3-4: own a small ticket (good-first-issue), PR reviewed same day.
Day 4: coffee with PM, designer, QA.
Day 5: retro with buddy - what was confusing? Plan week 2.`
        },
        {
          "task": "Role-play: the new teammate says sorry for 'asking too many questions'.",
          "description": "Checks psychological safety. Interviewer plays the new teammate.",
          "answer": "Strong: reassures sincerely, explains questions are expected and valuable (they reveal doc gaps), suggests a format if batching helps both. Red flags: 'yeah, try googling first' or making them feel like a burden.",
          "solution": `"Please keep asking - that's how you'll get up to speed, and your questions show
us where the docs are bad. If it's easier, keep a list and we'll go through it
at 4pm daily, but anything blocking, ping me right away."`
        }
      ]
    }],
    "senior": [{
      "q": "A junior makes the same mistakes in PRs again and again. How do you help?",
      "ai": true,
      "short": "Pair with them, find the root cause (knowledge gap, unclear standards, rushing), automate what can be caught by lint/tests, and give constructive, specific feedback.",
      "long": `Repeated mistakes are usually a system or knowledge problem, not laziness.
Strong candidates: talk privately, ask what is hard, pair on the next task, add lint rules or a checklist, link to examples, celebrate improvement.
They separate "teach" comments from blocking issues and avoid drowning the junior in 40 comments.
Weak candidates: keep leaving the same comments, or rewrite the code themselves.
Red flags: public shaming, complaining to the manager without trying to help.`,
      "exercises": [
        {
          "task": "Role-play: have a 1:1 with a junior. They forgot error handling in 3 PRs in a row.",
          "description": "Checks coaching and root-cause thinking about people. Interviewer plays the junior and gives short answers.",
          "answer": "Strong: private, curious ('what's tricky here?'), finds the root cause (knowledge gap vs rushing), offers pairing and resources, agrees on a concrete next step, plans to automate the check. Red flags: lecturing, 'you keep making the same mistake', comparing to others.",
          "solution": `"I noticed error handling came up in your last three PRs - I want to help, not
nag. How do you usually decide what happens when the API fails? ... Got it, the
handleApiError pattern isn't documented well. Let's pair on your next ticket for
an hour, and I'll add a lint rule for floating promises so the tooling catches it."`
        },
        {
          "task": "Rewrite this review comment from a senior to a junior.",
          "description": "Checks kind, specific review feedback. Candidate rewrites the comment.",
          "code": `"Again no error handling. Please read the codebase before opening PRs."`,
          "answer": "Strong: describes the issue and user impact, points to the pattern, offers help, keeps it about the code. Red flags: 'again', sarcasm, public frustration.",
          "solution": `"This fetch has no error handling - if the API fails the page stays blank. Our
pattern is in src/lib/api.ts (handleApiError). Want to pair for 15 min? Happy to
walk through why we do it this way."`
        }
      ]
    }, {
      "q": "How do you work with a product manager you often disagree with?",
      "ai": true,
      "short": "Understand their goals and constraints, disagree on substance with data, separate 'what/why' (their call) from 'how' (engineering's call), and build trust through delivery and regular 1:1s.",
      "long": `Senior engineers are partners to product; friction here slows the whole team.
Strong candidates: regular syncs, ask about the problem and metrics behind requests, bring alternatives that meet the goal cheaper, document decisions, respect their final call on priorities.
Weak candidates: "I just build what they ask" or constant fights.
Red flags: undermining the PM in front of the team, going around them.`,
      "exercises": [
        {
          "task": "Role-play: the PM wants the feature built exactly as written. You see a simpler way to reach the same goal.",
          "description": "Checks influencing without authority. Interviewer plays the PM attached to their spec.",
          "code": `Spec: custom drag-and-drop dashboard builder (6 weeks).
Goal (from PRD): let managers see the 3 metrics they care about first.
Alternative: pin/reorder metric cards (1 week).`,
          "answer": "Strong: start from the goal, offer the alternative as a cheaper experiment, suggest validating with users/data, defer to the PM on the decision. Red flags: 'your spec is overkill', building the alternative without agreement.",
          "solution": `"I want to make sure we hit the goal: managers seeing their 3 key metrics first,
right? What if we ship pinning and reordering cards in a week, and watch usage?
If people still ask for full customization, the builder is the next step and we'll
have real data for it. Your call - I'm happy either way."`
        },
        {
          "task": "Suggest three habits that would reduce repeated conflicts with this PM.",
          "description": "Checks building working relationships proactively. Short list.",
          "answer": "Strong: concrete habits - weekly 1:1, involve engineering early in discovery, shared decision log, joint user calls. Red flags: 'escalate to manager each time'.",
          "solution": "1) Weekly 30-min sync on upcoming work. 2) Engineering joins discovery before specs are written. 3) Decision log in the team wiki so debates aren't repeated."
        }
      ]
    }],
    "techlead": [{
      "q": "Two strong seniors disagree on architecture. The team is blocked. What do you do this week?",
      "ai": true,
      "short": "Agree on decision criteria, time-box a spike or short RFC, make a decision (disagree and commit) and record it in an ADR.",
      "long": `The lead's job is to unblock, not necessarily to pick the winner personally.
Steps: get both to write their proposal against shared criteria (requirements, risk, cost, reversibility), run a 1-2 day spike if facts are missing, facilitate a decision meeting, decide by a fixed date, document it.
Make sure both feel heard and that the "losing" side is credited for raising risks.
Strong candidates: process + deadline + relationship care.
Weak candidates: let them argue until consensus, or decide by seniority alone.
Red flags: avoiding the conflict, letting it become personal.`,
      "exercises": [
        {
          "task": "Role-play: two seniors disagree on state management: Zustand or Redux Toolkit. Start the decision meeting.",
          "description": "Checks facilitating conflict to a decision. Candidate opens the meeting as the lead.",
          "answer": "Strong: states the goal and deadline, restates agreed criteria, gives each side equal time, credits both, states how the decision will be made (consensus or lead decides by Friday), and 'disagree and commit'. Red flags: picking by seniority, letting it drag, taking sides publicly before hearing both.",
          "solution": `"Thanks both for the RFCs - they're excellent. Goal today: a decision, so the
team is unblocked Monday. We agreed on four criteria: performance, team
familiarity, migration cost, reversibility. Ten minutes each, then we score
together. If we don't converge, I'll decide by Friday and write the ADR, and
I'll ask us all to commit to it."`
        },
        {
          "task": "Write the ADR summary. It should describe the decision fairly.",
          "description": "Checks fair documentation of contested decisions. Candidate writes a short ADR.",
          "answer": "Strong: context, options, decision with reasons tied to criteria, consequences and revisit triggers, credit to the side that wasn't chosen. Red flags: one-sided history, no revisit condition.",
          "solution": `ADR-014: State management for the editor
Status: Accepted
Context: Zustand vs Redux Toolkit - see RFC-21, RFC-22.
Decision: Zustand - lower boilerplate, team familiarity, easy to reverse.
Consequences: revisit if we need time-travel debugging or complex middleware.
Thanks to Maria for documenting the Redux option and its risks.`
        }
      ]
    }, {
      "q": "You just took over a team. How do you build trust and good teamwork?",
      "ai": true,
      "short": "Listen first (1:1s, current pain points), keep existing commitments, make a few early visible improvements, be transparent about changes, and give credit generously.",
      "long": `A new lead who changes everything in week one loses the team.
Strong candidates: 30/60/90 plan, 1:1s with everyone asking what works and what doesn't, learn the system and history before judging, quick wins the team asked for, explain reasoning for changes, protect the team from churn.
Weak candidates: impose processes from the previous job immediately.
Red flags: criticizing the previous lead, making big decisions without context.`,
      "exercises": [
        {
          "task": "Write your plan for the first 30 days with the new team.",
          "description": "Checks listening-first leadership. Candidate drafts the plan.",
          "answer": "Strong: 1:1s with all, stakeholder conversations, shadow on-call and rituals, learn architecture and debt, identify 1-2 quick wins the team named, share observations before changes. Red flags: reorganizing processes in week 1.",
          "solution": `Week 1-2: 1:1s (what's working, what's frustrating, what should I not change?),
meet PM/design/partner teams, shadow standup/retro/on-call.
Week 3: architecture + debt walkthrough led by the team.
Week 4: share "what I heard" back to the team; pick 2 quick wins they named
(e.g. flaky CI, unclear on-call handoff). No process changes before that.`
        },
        {
          "task": "Role-play: in your first 1:1, a senior says 'the last lead promised a lot, and nothing changed'.",
          "description": "Checks credibility and honest commitments. Interviewer plays the skeptical senior.",
          "answer": "Strong: acknowledges without criticizing the predecessor, asks what was promised and what mattered most, commits small and specific with a date, follows through. Red flags: big promises, badmouthing the previous lead.",
          "solution": `"That's fair, and I'd be skeptical too. What were the things that mattered most
to you? ... I won't promise all of it. The flaky CI you mentioned - I'll get it on
the plan this sprint and update you in two weeks, whatever the result."`
        }
      ]
    }]
  },
  "Can take responsibility for past mistakes and challenges?": {
    "junior": [{
      "q": "Tell me about a mistake you made at work or in a project. What did you learn?",
      "ai": true,
      "short": "Look for honesty and a real lesson learned. Blame-shifting or claiming no mistakes is a red flag.",
      "long": `Everyone makes mistakes; the question is self-awareness and growth.
Strong candidates: a real, specific mistake, owning their part, what they did to fix it and what they do differently now.
Weak candidates: humble-brag mistakes ("I work too hard"), very vague stories.
Red flags: blaming teammates, tools or the process entirely, or "I can't think of any".`,
      "exercises": [
        {
          "task": "Role-play: your change broke the team demo. The demo starts in one hour. Tell the team.",
          "description": "Checks immediate ownership under pressure. Candidate writes the team message.",
          "answer": "Strong: tells immediately, owns it plainly, states what you're doing (revert) and ETA, asks for help if needed. Red flags: hoping nobody notices, blaming the CI, over-apologizing without action.",
          "solution": `"Heads-up: I broke the demo branch - I pushed without running tests. I'm
reverting now, should be green in 10 minutes. I'll ping when it's back.
Sorry, and I'll add a pre-push test check after the demo."`
        },
        {
          "task": "This answer blames other people. Rewrite it so the speaker takes responsibility.",
          "description": "Checks distinguishing accountability from blame. Candidate rewrites the answer in first person.",
          "code": `"My teammate didn't document the API, so my part didn't work.
I learned not to trust other people's code."`,
          "answer": "Strong: owns their part (didn't ask, didn't test the integration early), describes the fix and a lasting habit. Red flags: keeping the blame, a lesson that is about other people.",
          "solution": `"I assumed how the API worked instead of asking, and only tested the integration
the day before. When it failed I paired with my teammate to fix it. Now I check
contracts early and write a quick integration test on day one."`
        }
      ]
    }, {
      "q": "Tell me about feedback that was hard to hear. What did you do with it?",
      "ai": true,
      "short": "Look for openness: listening without defending, asking for specifics, acting on it, and following up.",
      "long": `Coachability matters more than current skill at junior level.
Strong candidates: a specific piece of feedback, their honest first reaction, how they clarified it, the concrete change, and evidence it worked.
Weak candidates: feedback that was really praise, or they disagreed and changed nothing.
Red flags: "I never really got negative feedback", blaming the person who gave it.`,
      "exercises": [
        {
          "task": "Role-play: your lead says your PRs are too big and hard to review. Answer right away.",
          "description": "Checks receiving feedback live. Interviewer plays the lead giving the feedback directly.",
          "answer": "Strong: thanks them, asks for an example and what 'good' looks like, proposes a concrete change, avoids excuses. Red flags: 'but the task was big', defensiveness, agreeing with no plan.",
          "solution": `"Thanks for telling me. Which PR was hardest to review? ... Got it. What size works
for you - under ~300 lines? I'll split my next ticket into smaller PRs, starting
with the API layer, and check with you if it's better."`
        },
        {
          "task": "Turn this weak answer into a strong one.",
          "code": `"My manager said I should speak up more in meetings, but I'm just
not a talkative person, so I don't think it applies to me."`,
          "description": "Checks reflection and growth mindset. Candidate rewrites in first person.",
          "answer": "Strong: accepts the underlying concern (ideas aren't heard), finds an approach that fits their style (prepare notes, comment async, speak once per meeting), shows a result. Red flags: dismissing feedback because of personality.",
          "solution": `"My manager said my ideas weren't reaching the team because I stayed quiet in
meetings. I'm introverted, so I started writing 2-3 points before each planning
and sharing one in the meeting or in the doc. Two months later my caching
proposal got picked up from one of those notes."`
        }
      ]
    }],
    "middle": [{
      "q": "Have you ever broken production? What happened next?",
      "ai": true,
      "short": "Look for ownership, fast communication, a fix or rollback, and prevention steps afterwards.",
      "long": `Breaking production is common at this level; hiding it is the real problem.
Strong candidates: noticed or got alerted, told the team immediately, rolled back or hot-fixed, helped with the blameless postmortem and added a test, alert or process change.
Weak candidates: no clear role, or the story ends at "we fixed it".
Red flags: covering it up, blaming QA/reviewer, no prevention step.`,
      "exercises": [
        {
          "task": "Role-play: you caused a production incident 15 minutes ago. Prices show NaN for EUR. Post an update in #incidents.",
          "description": "Checks incident communication when you caused it. Candidate writes the channel update.",
          "answer": "Strong: owns it, states impact and scope, action taken (rollback) with ETA, next update time. Red flags: hiding authorship, speculating, silence until fixed.",
          "solution": `"Incident: EUR prices show NaN on product pages since 14:05 - caused by my
price formatter change (PR #482). Rolling back now, ETA 10 min. USD unaffected.
Next update 14:30 or when rollback is confirmed."`
        },
        {
          "task": "Write the 'what we will change' part of the blameless postmortem.",
          "description": "Checks blameless, systemic follow-up. Candidate writes action items with owners.",
          "answer": "Strong: systemic fixes, owners, dates; no individual blame; addresses detection and prevention. Red flags: 'be more careful', blaming reviewer/QA, actions without owners.",
          "solution": `Action items:
1. Locale snapshot tests for price formatting (EUR, JPY, de-DE) - me, Fri.
2. Alert on NaN/empty price render rate > 0.1% - Priya, next sprint.
3. Canary deploy for pricing code (10% for 30 min) - platform team, Q3.
4. No Friday-afternoon deploys for checkout/pricing - team agreement.`
        }
      ]
    }, {
      "q": "Tell me about a project that failed or missed its goals. What was your part in it?",
      "ai": true,
      "short": "Look for clear ownership of their part (not just 'the project'), honest analysis of causes, and concrete lessons applied later.",
      "long": `Mid-level engineers should separate system causes from their own contribution.
Strong candidates: specific project, measurable miss, their decisions (estimates, missed signals, not raising concerns), what they'd do differently and evidence they did.
Weak candidates: only external causes (management, scope changes).
Red flags: "nothing I could have done", or excessive self-blame without lessons.`,
      "exercises": [
        {
          "task": "Answer in STAR format. Add a clear 'my part' section.",
          "description": "Checks structured, accountable storytelling. Candidate answers aloud in ~2 minutes; interviewer may ask 'what would you do differently?'",
          "answer": "Strong: concise situation, measurable miss, own decisions named plainly, lesson applied since. Red flags: 'we' throughout with no 'I', or a story with no consequence.",
          "solution": `S: Rebuilding search for our marketplace; goal was launch in Q2.
T: I owned the frontend and the estimate.
A/My part: I estimated without checking the facet API, which didn't support our
filters; I noticed in week 3 but didn't raise it until week 6.
R: Launch slipped 5 weeks. Since then I do a spike on unknown integrations before
estimating, and flag risks in the channel the day I find them.`
        },
        {
          "task": "Role-play: the interviewer disagrees: 'Wasn't it really the backend team's fault?'",
          "description": "Checks staying accountable under a tempting exit. Interviewer offers the excuse.",
          "answer": "Strong: acknowledges shared causes without taking the excuse, restates own part and lesson. Red flags: grabbing the excuse, or attacking the other team.",
          "solution": `"They could have documented the API limits better, and we fixed that together later.
But I saw the problem in week 3 and waited three weeks to raise it - that part was
mine, and it's the part I can change."`
        }
      ]
    }],
    "senior": [{
      "q": "Tell me about a technical decision that was wrong. How did you find out? What did you do?",
      "ai": true,
      "short": "Look for self-awareness, evidence-driven discovery, and a course correction made without ego.",
      "long": `Seniors make bigger bets, so some are wrong; the signal is how quickly and honestly they adapt.
Strong candidates: explain the context and why the decision seemed right, the signals that it was wrong (metrics, team pain), how they raised it, the migration or mitigation, and how they now decide (ADRs, spikes, reversibility).
Weak candidates: tiny decisions, or decisions that were "wrong" only because of others.
Red flags: sunk-cost defence of the decision long after evidence, no reflection.`,
      "exercises": [
        {
          "task": "Role-play: 6 months ago you chose micro-frontends. In a planning meeting, tell the team it was a mistake.",
          "description": "Checks admitting a wrong decision publicly with data. Candidate speaks to the team as in planning.",
          "code": `Data: build time 3x, onboarding 2-3 weeks, cross-app state bugs weekly. Team of 6.`,
          "answer": "Strong: owns the decision directly, shows data, explains why it seemed right then, proposes a concrete path back with cost, invites input. Red flags: sunk-cost defence, vague 'it didn't work out', blaming the team's execution.",
          "solution": `"I want to own something: pushing for micro-frontends was premature for a team
of six. Builds are 3x slower, onboarding takes weeks and we hit state bugs every
week. It seemed right when we expected three teams. I've drafted an RFC to merge
back into a modular monolith over two sprints - I'd love your input on the order."`
        },
        {
          "task": "After that, what new habits did you start for making decisions? Say them as in an interview.",
          "description": "Checks durable learning from mistakes. Candidate states their habits as in the interview.",
          "answer": "Strong: concrete, repeatable practices (ADRs with revisit triggers, spikes, prefer reversible options, define success metrics up front). Red flags: generic 'I think more carefully now'.",
          "solution": `"Now for any big architectural bet I write an ADR with the problem we have
today, the success metric, and a revisit date. I spike the riskiest part first,
prefer reversible options, and ask someone who disagrees to review it."`
        }
      ]
    }, {
      "q": "Tell me about a time you raised a concern and others ignored it. Later, were you right or wrong? What did you do?",
      "ai": true,
      "short": "Look for how clearly and constructively they raised it, whether they escalated appropriately, and humility either way - no 'I told you so'.",
      "long": `Seniors are expected to raise risks effectively, not just once in a meeting.
Strong candidates: raised it with data in writing, proposed mitigations, escalated if impact was high, committed once decided, and when proven right helped fix it without blame (or when wrong, admitted it openly).
Weak candidates: mentioned it once and dropped it, or kept relitigating.
Red flags: "I told you so" attitude, or quietly letting it fail to prove a point.`,
      "exercises": [
        {
          "task": "In a meeting, the team rejects your concern. Write the risk note you send afterwards.",
          "description": "Checks raising concerns constructively in writing. Scenario: team decides to skip load testing before Black Friday.",
          "answer": "Strong: respectful, states the decision, the risk and likelihood, a cheap mitigation, and commitment to the decision. Red flags: passive-aggressive tone, 'for the record' blame-shifting.",
          "solution": `"Following up on today: we're skipping the full load test before Black Friday to ship
the promo features. I'm committed to that plan. One risk to note: checkout hit 80% DB
CPU at last year's peak. A 2-hour smoke load test on checkout only would cover most of
it - I can run it Thursday if we agree."`
        },
        {
          "task": "Role-play: the risk happened and checkout went down. At the retro, someone says 'you warned us'. Answer.",
          "description": "Checks humility and team focus. Interviewer plays a teammate.",
          "answer": "Strong: deflects credit, focuses on the system fix, avoids blame, invites the team into the process change. Red flags: 'yes, I did', or false modesty that hides the lesson.",
          "solution": `"I flagged it, but I also didn't push hard enough for the smoke test. The real
question is how we make load testing part of the release checklist so it doesn't
depend on someone's hunch. Can we pick an owner for that today?"`
        }
      ]
    }],
    "techlead": [{
      "q": "What is your biggest mistake as a lead? What do you do differently now?",
      "ai": true,
      "short": "Look for genuine reflection on a people or leadership mistake and a concrete, lasting change in behaviour.",
      "long": `Lead mistakes are often about people: delegation, communication, avoiding conflict, hero mode, hiring.
Strong candidates: a real lead-level mistake, its impact on the team, what feedback revealed it, and specific habits they changed (regular 1:1s, delegating with context, earlier hard conversations).
Weak candidates: purely technical mistakes, or generic "I learned to communicate better".
Red flags: no mistakes as a lead, blaming the team or upper management.`,
      "exercises": [
        {
          "task": "Role-play: in a 1:1, a senior says 'I don't feel I'm growing. You take all the hard problems.' Answer.",
          "description": "Checks receiving hard feedback as a lead. Interviewer plays the senior engineer.",
          "answer": "Strong: thanks them, doesn't get defensive, acknowledges the pattern, asks what they want to own, commits to a concrete change and a follow-up. Red flags: justifying ('it was faster'), promising vaguely, punishing the feedback.",
          "solution": `"Thank you for telling me - that's fair, and I've been in hero mode. Which of
the upcoming problems would you want to own? The search re-architecture is
yours if you want it; I'll review rather than implement. Let's check in on
how it's going in two weeks."`
        },
        {
          "task": "Here is a weak answer to 'biggest mistake as a lead'. Make it a strong one.",
          "description": "Checks self-reflection quality for lead-level mistakes. Candidate rewrites the weak answer.",
          "code": `"My biggest mistake was trusting my team too much - they didn't deliver,
so now I review every PR myself."`,
          "answer": "Strong: reframes as the lead's own failure (unclear expectations, no check-ins), explains the impact, and the change (clear goals, regular 1:1s, delegating with context, early feedback) - not more control. Red flags: blaming the team, micromanagement as the 'lesson'.",
          "solution": `"I delegated a big project without clear outcomes or check-ins, and found out
it was off track a week before the deadline. That was on me. Now I agree on
what 'done' looks like up front, have weekly check-ins on risky work, and give
feedback early instead of taking the work back."`
        }
      ]
    }, {
      "q": "Your team missed a big promise while you were the lead. How do you take responsibility with managers and with the team?",
      "ai": true,
      "short": "Own it upward without throwing the team under the bus, explain causes and recovery plan, protect the team publicly, and run an honest blameless retro internally.",
      "long": `Leads absorb accountability upward and distribute learning downward.
Strong candidates: communicate early to leadership with impact and a recovery plan, take responsibility as the lead (planning, risk management), avoid naming individuals, run a retro focused on systems, follow through on changes.
Weak candidates: explain why it was not really their fault.
Red flags: blaming specific engineers to leadership, or pretending to the team that nothing went wrong.`,
      "exercises": [
        {
          "task": "Role-play: tell your VP the integration launch will not happen this quarter.",
          "description": "Checks upward accountability. Interviewer plays the VP and asks 'who dropped the ball?'",
          "answer": "Strong: leads with the news and impact, owns it as the lead, explains causes at system level, gives a recovery plan with a date and what you need, deflects 'who' to process. Red flags: naming an engineer, vague new date.",
          "solution": `"The partner integration will miss Q3; realistic date is October 20. That's on me - I
didn't plan for the partner's sandbox delays and I raised it too late. Plan: we've
cut scope to the two endpoints the customer needs, and I need a contact on their
side with authority to unblock testing. On 'who' - this was a planning gap, not one
person, and I'll fix how we track external dependencies."`
        },
        {
          "task": "Write how you start the team retro. It should show that nobody is blamed.",
          "description": "Checks psychological safety after failure. Candidate writes what they'd say in the first minute.",
          "answer": "Strong: states the miss plainly, owns the lead's part first, sets ground rules (systems not people), clear goal (2-3 changes with owners). Red flags: skipping own accountability, letting it turn into blame.",
          "solution": `"We missed the Q3 integration date. I'll start with my part: I tracked the partner
dependency too loosely and raised the alarm late. Today is about what in our
process let this happen, not who. Goal: leave with two or three changes, each with
an owner."`
        }
      ]
    }]
  }
};
