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
          "task": "Explain what a browser cache is to a sales colleague.",
          "description": "Checks plain language for non-technical people.",
          "code": "A sales colleague asks why customers must \"refresh\" to see the new version.",
          "answer": "Strong: a simple analogy, no jargon, checks understanding. Red flag: terms like \"HTTP headers\" or \"CDN\" with no explanation.",
          "solution": `"The browser keeps a copy of our site to load it faster.
Sometimes it shows the old copy. A refresh gets the new one.
Does that make sense?"`
        },
        {
          "task": "Explain why the page is slow on a cheap phone.",
          "description": "Checks adapting a technical reason to the audience.",
          "code": "Support asks why the app feels slow for some customers on older phones.",
          "answer": "Strong: one clear cause, an everyday comparison, what we will do. Red flag: blaming customers for old phones.",
          "solution": `"Our page asks the phone to do a lot of work at once.
Old phones are like small engines, so they are slower.
We are making the page lighter this sprint."`
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
          "task": "Restate this task in your own words.",
          "description": "Checks summarizing a request before coding.",
          "code": "Lead: \"Add a search box to the users table, should be easy.\"",
          "answer": "Strong: restates the goal, asks 2-3 key questions (fields, live search, empty result). Red flag: says \"OK\" and starts coding.",
          "solution": `"So: a search box above the users table.
Search by name and email? Live, or on Enter?
What do we show when nothing matches?"`
        },
        {
          "task": "Write a short ticket comment that confirms the scope.",
          "description": "Checks written confirmation of what is in and out.",
          "code": "You agreed on CSV export for admins only, without filters, in a call.",
          "answer": "Strong: short bullets for in scope, out of scope, open questions, tags the lead. Red flag: long text, nothing about out of scope.",
          "solution": `In scope: CSV export, admins only.
Out of scope: filters (later ticket).
Open: max rows? @lead`
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
          "task": "Reply to this review comment you disagree with.",
          "description": "Checks respectful disagreement with reasons.",
          "code": "Reviewer: \"Move this logic into a custom hook.\" You think it is used only once.",
          "answer": "Strong: thanks, gives a reason, offers a trade-off or a call. Red flag: \"No, it is fine\" or silently resolving the comment.",
          "solution": `"Good point. It is used only here, so a hook may be extra code now.
OK to keep it inline and extract if a second use appears?"`
        },
        {
          "task": "Close a review argument that has gone on too long.",
          "description": "Checks moving a stuck discussion to a decision.",
          "code": "You and a reviewer wrote 12 comments about naming in one PR.",
          "answer": "Strong: suggests a quick call or asks a third person, records the result. Red flag: comment number 13 with the same arguments.",
          "solution": `"We are going in circles. 5-minute call?
If we still disagree, let's ask Ana and follow the team style guide."`
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
          "task": "Rewrite this PR description so people read it.",
          "description": "Checks clear, scannable written updates.",
          "code": "\"Fixed stuff in the form, also some refactoring, see code.\"",
          "answer": "Strong: what and why, how to test, screenshots, risks. Red flag: just a list of commit messages.",
          "solution": `Why: email field accepted spaces (BUG-12).
What: trim and validate on blur.
Test: type " a@b.c " and submit.
Risk: low, form only.`
        },
        {
          "task": "Write a two-line weekly status update for the PM.",
          "description": "Checks short status focused on outcomes.",
          "code": "Checkout redesign: 70% done, payment step blocked by backend API.",
          "answer": "Strong: progress, blocker, ask and date. Red flag: list of tickets with no meaning for the reader.",
          "solution": `"Checkout: 70% done, on track for the 15th if the payment API lands by Friday.
Blocked: payment endpoint, @backend can you confirm the date?"`
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
          "task": "Explain this risk to a non-technical director.",
          "description": "Checks risk framing in business terms.",
          "code": "The login library has no updates for 2 years and known security issues.",
          "answer": "Strong: impact in business words, likelihood, cost of fixing, a clear ask. Red flag: CVE numbers and library names only.",
          "solution": `"Our login uses old code with known holes.
If attacked, customer data could leak.
Two weeks of work removes the risk. I suggest next sprint."`
        },
        {
          "task": "Answer: \"Why can't we just ignore it for now?\"",
          "description": "Checks calm handling of pushback with options.",
          "code": "A director says the risk you raised is \"just engineering being careful\".",
          "answer": "Strong: respects the concern, gives options with cost and risk, lets them decide. Red flag: fear tactics or giving up.",
          "solution": `"We can wait, but then I suggest a monitor and a plan B.
Option A: fix now, 2 weeks. Option B: wait, accept the risk.
Your call, I will write it down."`
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
          "task": "Give this feedback to another team's lead.",
          "description": "Checks direct but kind feedback to a peer team.",
          "code": "Their API changes broke your app twice this month with no warning.",
          "answer": "Strong: facts, impact, a request, a joint fix like contract tests. Red flag: blame in a public channel.",
          "solution": `"Two API changes broke our app this month without notice.
It cost us a day each time.
Can we agree on a changelog or contract tests?"`
        },
        {
          "task": "Tell a peer their PR reviews feel harsh.",
          "description": "Checks private, specific, behavior-focused feedback.",
          "code": "Juniors stopped asking this senior for reviews because of sharp comments.",
          "answer": "Strong: private, one concrete example, the impact, a suggestion. Red flag: \"people say you are rude\" with no examples.",
          "solution": `"Can I share something? On PR 341 you wrote 'this is wrong'.
The junior was afraid to ask more.
Maybe add why and a suggestion?"`
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
          "task": "Open a meeting to choose a state library.",
          "description": "Checks setting goal, options and decision rule.",
          "code": "Options: Zustand, Redux Toolkit, React Query only. 45 minutes.",
          "answer": "Strong: states goal, criteria, timebox, who decides. Red flag: open discussion with no decision rule.",
          "solution": `"Goal: pick one by end of meeting.
Criteria: learning curve, devtools, server data.
10 minutes per option. If no agreement, I decide and write an ADR."`
        },
        {
          "task": "Close the meeting when there is no agreement.",
          "description": "Checks making a decision and recording it.",
          "code": "After 40 minutes the team is split 50/50.",
          "answer": "Strong: names the decision, the reason, the review date, next steps. Red flag: \"let's meet again\" with no owner.",
          "solution": `"We go with Zustand: smaller and faster to learn.
We review in 2 months. Kim writes the ADR today."`
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
          "task": "Tell the team their project is paused.",
          "description": "Checks honest delivery of unwelcome news.",
          "code": "Leadership pauses the team's redesign for a compliance project.",
          "answer": "Strong: says it early and clearly, explains why, admits it is hard, next steps. Red flag: hiding it or blaming leadership.",
          "solution": `"The redesign is paused for 6 weeks for a legal deadline.
I know this is frustrating. Your work is saved.
Let's plan the hand-off together tomorrow."`
        },
        {
          "task": "Answer: \"Why do we always change priorities?\"",
          "description": "Checks handling frustration without being defensive.",
          "code": "A senior says this in the team meeting after a third change.",
          "answer": "Strong: admits the pattern, gives context, commits to an action. Red flag: \"that is how business works\".",
          "solution": `"Fair point, this is the third change.
I will ask leadership for a fixed quarter plan,
and tell you what I learn by Friday."`
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
          "task": "Ask for help after 4 hours stuck.",
          "description": "Checks asking with context, not too late.",
          "code": "Your React component re-renders forever. You tried useMemo.",
          "answer": "Strong: goal, what was tried, the error, a guess, one question. Red flag: \"it doesn't work\" with no details.",
          "solution": `"My table re-renders in a loop. I tried useMemo on the data.
I think useEffect sets state every render.
Can you look for 10 minutes?"`
        },
        {
          "task": "Name the steps you take before asking.",
          "description": "Checks a basic self-help routine.",
          "code": "You have a strange TypeScript error in a new file.",
          "answer": "Strong: read the error, search docs, make a tiny repro, take a break, then ask. Red flag: asks after one minute, or never asks."
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
          "task": "Tell your lead you cannot finish all three tasks.",
          "description": "Checks early, clear priority questions.",
          "code": "Tasks due today: a bug, a small feature, a code review.",
          "answer": "Strong: tells early, lists tasks, asks which matters most, suggests an order. Red flag: works late silently or picks alone.",
          "solution": `"I can finish two of three today.
I suggest the bug first, then the review.
The feature moves to tomorrow. OK?"`
        },
        {
          "task": "Pick an order for these tasks and explain why.",
          "description": "Checks priority by impact and who is waiting.",
          "code": "A customer bug, a teammate waiting for your review, a refactor.",
          "answer": "Strong: customer bug, then review (unblocks someone), refactor last. Red flag: easiest task first."
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
          "task": "Tell your lead the task is late.",
          "description": "Checks honest update with a new plan.",
          "code": "Estimate 3 days. Day 5. Another day needed because of an API problem.",
          "answer": "Strong: says why, new date, options like cutting scope. Red flag: waiting to be asked, \"almost done\" for days.",
          "solution": `"Day 5, not done: the API pages results differently than we thought.
One more day, or I ship without sorting today.
Which do you prefer?"`
        },
        {
          "task": "Name one change to estimate better next time.",
          "description": "Checks learning from estimation misses.",
          "code": "Your last three tasks took 60% longer than estimated.",
          "answer": "Strong: a concrete change like a spike for unknowns, ranges, or splitting tasks. Red flag: \"I will work harder\"."
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
          "task": "Ask the user for the right details about this bug.",
          "description": "Checks gathering data to reproduce a bug.",
          "code": "Support: \"The save button does nothing for one customer.\"",
          "answer": "Strong: asks browser, steps, time, console errors, screen recording, account ID. Red flag: \"works on my machine\", closes ticket.",
          "solution": `"Can you send the browser and version, the exact steps,
the time it happened, and a screen recording?
An account ID helps me check logs."`
        },
        {
          "task": "Name three ways to debug a bug you cannot reproduce.",
          "description": "Checks options beyond local reproduction.",
          "code": "The bug happens only in production for a few users.",
          "answer": "Strong: logs or error tracking, session replay, feature flag with extra logging, same browser or data. Red flag: guessing and shipping."
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
          "task": "Ask three questions about \"make the dashboard faster\".",
          "description": "Checks clarifying a vague request first.",
          "code": "The PM says only: \"Customers say the dashboard is slow.\"",
          "answer": "Strong: which part, how slow now (numbers), target, which users or devices. Red flag: starts optimizing random code.",
          "solution": `"Which part feels slow: first load or filters?
How slow is it now, and what is good enough?
Is it all users or big accounts?"`
        },
        {
          "task": "List your first three steps to make it faster.",
          "description": "Checks a measure-first plan.",
          "code": "You know first load takes 8 seconds for large accounts.",
          "answer": "Strong: measure (Lighthouse, traces), find the biggest cause, fix and measure again. Red flag: rewrite in a new framework."
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
          "task": "Convince the PM to spend a sprint on tech debt.",
          "description": "Checks business framing of technical debt.",
          "code": "Old form code causes 40% of bugs and slows every form feature.",
          "answer": "Strong: cost in bugs and time, a small scoped plan, measurable result. Red flag: \"the code is ugly\".",
          "solution": `"40% of our bugs come from the old form code.
One sprint to replace it should make future forms 2x faster.
We can measure bug count after."`
        },
        {
          "task": "Decide: fix this debt now or later?",
          "description": "Checks a clear rule for debt priority.",
          "code": "A slow build adds 4 minutes for each of 10 developers, many times a day.",
          "answer": "Strong: fix now, because it costs hours every day; debt that blocks often goes first. Red flag: \"later\" without numbers."
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
          "task": "Answer the PM who wants it in 2 weeks.",
          "description": "Checks negotiating scope instead of saying yes or no.",
          "code": "Your estimate is 6 weeks. The PM says the date is fixed.",
          "answer": "Strong: explains the gap, offers a smaller version in 2 weeks, lists what is cut. Red flag: says yes, or flat no.",
          "solution": `"Full scope is 6 weeks. In 2 weeks we can ship the core flow
without export and admin settings.
Should we look at the list together?"`
        },
        {
          "task": "Name what you need from product to shrink scope.",
          "description": "Checks focusing on the real goal.",
          "code": "Feature: a full reporting module, requested for a big client demo.",
          "answer": "Strong: asks the real goal (the demo), must-haves, who uses it, what can be fake. Red flag: cuts tests to save time."
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
          "task": "Say no to a request in quarter planning.",
          "description": "Checks saying no with reasons and alternatives.",
          "code": "Sales asks for a custom theme feature. The team is full.",
          "answer": "Strong: shows the current plan, the trade-off, offers later or smaller. Red flag: says yes to everything.",
          "solution": `"We can't add it this quarter without dropping SSO.
We can do a simple logo upload, or plan it for Q3.
Which helps you more?"`
        },
        {
          "task": "Name how you rank too many requests.",
          "description": "Checks a simple, shared priority method.",
          "code": "You have 25 requests and room for 8.",
          "answer": "Strong: impact vs effort, company goals, keep 20% for bugs and debt, share the list openly. Red flag: whoever shouts loudest."
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
          "task": "Ask the designer about a missing state.",
          "description": "Checks working with design on edge cases.",
          "code": "The design shows the list, but not loading, empty or error states.",
          "answer": "Strong: asks early, names the missing states, offers a simple default. Red flag: invents designs silently.",
          "solution": `"The list design looks great. What do we show while loading,
when it is empty, and on error?
I can use our default spinner if that is OK."`
        },
        {
          "task": "Reply to QA who found a bug in your feature.",
          "description": "Checks a positive response to QA findings.",
          "code": "QA: \"The date picker breaks on Safari.\"",
          "answer": "Strong: thanks, asks for details, gives a time to fix. Red flag: \"works for me\" or treating QA as an enemy.",
          "solution": `"Thanks for catching it! Which Safari version?
I will look today and ping you when it is ready to retest."`
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
          "task": "Respond to a teammate who wants another approach.",
          "description": "Checks listening before defending your idea.",
          "code": "You want a new component. Your teammate wants to extend an existing one.",
          "answer": "Strong: asks why, compares both, agrees or asks a senior. Red flag: \"my way is better\" with no reasons.",
          "solution": `"Why do you prefer extending it? I worry about too many props.
Can we try both for 10 minutes and pick the simpler one?"`
        },
        {
          "task": "Accept the other idea after you lose the discussion.",
          "description": "Checks disagree-and-commit.",
          "code": "The team picked your teammate's approach.",
          "answer": "Strong: supports it fully, no \"I told you so\" later. Red flag: does it badly to prove a point.",
          "solution": "\"OK, let's go with extending it. I will start on the props today.\""
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
          "task": "Write a message about a PR blocking you for 3 days.",
          "description": "Checks polite, clear follow-up with a deadline.",
          "code": "Your teammate does not answer review requests. Your work depends on it.",
          "answer": "Strong: friendly, says the impact, asks for a time, offers help. Red flag: angry message or going to the boss first.",
          "solution": `"Hi! My ticket depends on your PR 210.
Can you merge it today, or should I take over the review fixes?
Happy to pair for 15 minutes."`
        },
        {
          "task": "Decide when to involve the lead.",
          "description": "Checks escalation without blame.",
          "code": "Two days later there is still no answer.",
          "answer": "Strong: escalates as a planning problem, not a complaint about the person. Red flag: \"they are lazy\".",
          "solution": `"PR 210 is blocking my ticket for 5 days.
I could not reach Sam. Can you help us find a plan?"`
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
          "task": "Reply to a new teammate who says \"sorry for so many questions\".",
          "description": "Checks making questions feel safe.",
          "code": "A new teammate apologizes after their fifth question today.",
          "answer": "Strong: says questions are welcome, suggests notes or a doc for answers. Red flag: sighs or \"just read the code\".",
          "solution": `"Please keep asking, it saves time for both of us.
Let's add the answers to the onboarding doc so the next person benefits."`
        },
        {
          "task": "Name three things for a new teammate's first week.",
          "description": "Checks a practical onboarding plan.",
          "code": "A mid-level frontend dev joins your project on Monday.",
          "answer": "Strong: working local setup, a small real ticket, a buddy and code tour. Red flag: \"read all the docs\" only."
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
          "task": "Start a 1:1 with a junior who repeats a mistake.",
          "description": "Checks coaching instead of blaming.",
          "code": "The junior forgot error handling in 3 PRs in a row.",
          "answer": "Strong: shows the pattern kindly, asks why, agrees on a tool like a checklist. Red flag: \"you always forget\".",
          "solution": `"I see error handling missing in your last 3 PRs.
What makes it easy to miss?
Should we add it to a PR checklist together?"`
        },
        {
          "task": "Name two ways to stop the mistake for the whole team.",
          "description": "Checks fixing systems, not people.",
          "code": "Many devs forget loading and error states.",
          "answer": "Strong: lint rule or PR template checklist, shared component that handles states. Red flag: more review comments only."
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
          "task": "Suggest a simpler solution to a PM who disagrees.",
          "description": "Checks influence through the goal, not opinion.",
          "code": "PM wants a full wizard. You think one form reaches the same goal.",
          "answer": "Strong: asks about the goal, shows cost of both, suggests a test. Red flag: \"your idea is bad\".",
          "solution": `"The goal is fewer drop-offs, right?
A single form takes 3 days, the wizard 3 weeks.
Can we try the form and measure?"`
        },
        {
          "task": "Accept the PM's decision after you disagree.",
          "description": "Checks commitment after losing a debate.",
          "code": "The PM keeps the wizard after hearing your arguments.",
          "answer": "Strong: commits, notes the risk once, builds it well. Red flag: slows down or complains to the team.",
          "solution": "\"OK, we build the wizard. I noted the timeline risk in the ticket.\""
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
          "task": "Unblock two seniors who disagree on architecture.",
          "description": "Checks a fast, fair decision process.",
          "code": "One wants micro-frontends, one wants a monorepo. Team blocked for a week.",
          "answer": "Strong: written options, clear criteria, timebox or spike, decide by a date. Red flag: waiting for them to agree.",
          "solution": `"Each of you, one page: pros, cons, cost. Due Wednesday.
We compare on Thursday with our criteria.
If still split, I decide Friday."`
        },
        {
          "task": "Talk to the senior whose idea was not chosen.",
          "description": "Checks keeping trust after a decision.",
          "code": "You picked the monorepo. The other senior seems upset.",
          "answer": "Strong: private talk, values their input, gives them a real role. Red flag: ignoring the feelings.",
          "solution": `"Your concerns were real, they shaped the plan.
Can you own the build caching part, where your ideas help most?"`
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
          "task": "Reply in your first 1:1 to \"nothing ever changes\".",
          "description": "Checks building trust as a new lead.",
          "code": "A senior says the last lead promised a lot and did nothing.",
          "answer": "Strong: listens, asks for top problems, promises one small thing and does it. Red flag: big promises.",
          "solution": `"That sounds frustrating. What are the top two problems for you?
I will fix one small thing in two weeks, then we check."`
        },
        {
          "task": "Name three things you do in your first 30 days.",
          "description": "Checks listening before changing things.",
          "code": "You took over a team of 6 frontend devs.",
          "answer": "Strong: 1:1s with everyone, learn the code and process, a few quick wins. Red flag: big reorg in week one."
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
          "task": "Tell me about a mistake in under one minute.",
          "description": "Checks owning a mistake and the lesson.",
          "code": "Example: you pushed code with a console error to the main branch.",
          "answer": "Strong: clear \"I did it\", what was fixed, what changed after. Red flag: blaming others or a fake mistake.",
          "solution": `"I merged without running tests and broke the build.
I fixed it in 20 minutes and told the team.
Now I always run tests before I push."`
        },
        {
          "task": "Turn a vague lesson into a concrete habit.",
          "description": "Checks real, specific learning.",
          "code": "\"I learned to be more careful.\"",
          "answer": "Strong: names an exact habit or tool, like a checklist or test. Red flag: stays vague.",
          "solution": "\"Now I test on mobile width before every PR.\""
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
          "task": "Respond to this hard feedback.",
          "description": "Checks openness instead of defending.",
          "code": "Lead: \"Your PRs are too big and hard to review.\"",
          "answer": "Strong: thanks, asks for an example, agrees on a next step. Red flag: arguing or making excuses.",
          "solution": `"Thanks for telling me. Which PR was the worst?
I will split my next feature into smaller PRs. Can you check?"`
        },
        {
          "task": "Show how you used feedback later.",
          "description": "Checks follow-up on feedback.",
          "code": "One month later the lead asks how it is going.",
          "answer": "Strong: shows a real change and asks if it helps. Red flag: forgot the feedback.",
          "solution": "\"My PRs are now under 300 lines. Is it easier to review?\""
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
          "task": "Write the first message after you broke production.",
          "description": "Checks fast, honest incident communication.",
          "code": "Your release broke the checkout page 5 minutes ago.",
          "answer": "Strong: says what broke, that it was your change, the action now (rollback), next update. Red flag: silent fixing.",
          "solution": `"Checkout is broken after my release. Rolling back now.
Update in 10 minutes."`
        },
        {
          "task": "Name two follow-up actions after the incident.",
          "description": "Checks learning beyond the fix.",
          "code": "The rollback worked. Checkout is OK again.",
          "answer": "Strong: blameless postmortem, a test or alert so it cannot happen again. Red flag: \"be more careful\" only."
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
          "task": "Describe your part in a failed project.",
          "description": "Checks owning a share, not all or nothing.",
          "code": "The project missed its date by a month.",
          "answer": "Strong: a clear personal part, what they learned, without blaming others. Red flag: \"it was all the PM's fault\".",
          "solution": `"I did not raise early that the API was late.
I waited to be sure. Now I flag risks as soon as I see them."`
        },
        {
          "task": "Rewrite this answer to take ownership.",
          "description": "Checks shifting blame to ownership.",
          "code": "\"Backend was late, design changed, so we missed it.\"",
          "answer": "Strong: keeps the facts but adds what the speaker could have done. Red flag: only lists others' mistakes.",
          "solution": `"Backend was late and design changed.
I should have cut scope early instead of hoping to catch up."`
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
          "task": "Tell how you found a wrong decision.",
          "description": "Checks noticing a mistake with evidence.",
          "code": "You chose a heavy chart library. Bundle size grew 40%.",
          "answer": "Strong: names the signal (metrics), admits it, acts. Red flag: defends the choice despite data.",
          "solution": `"Bundle grew 40% after my chart choice.
I admitted it in the team meeting
and we moved to a lighter library over two sprints."`
        },
        {
          "task": "Explain the fix plan to the team.",
          "description": "Checks a clear correction plan.",
          "code": "You must replace the library without stopping features.",
          "answer": "Strong: small steps, behind a wrapper, measured. Red flag: big rewrite that blocks everything.",
          "solution": `"We wrap the charts first, then swap one chart per sprint.
We check bundle size in each PR."`
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
          "task": "Raise this concern so people listen.",
          "description": "Checks clear, data-based concern raising.",
          "code": "You think the new release has no rollback plan.",
          "answer": "Strong: specific risk, impact, a simple fix, in writing. Red flag: vague worry, or silence.",
          "solution": `"There is no rollback plan for Friday's release.
If it fails, checkout is down all weekend.
Can we add a feature flag?"`
        },
        {
          "task": "React when your ignored concern came true.",
          "description": "Checks helping instead of \"I told you so\".",
          "code": "The release failed, as you warned.",
          "answer": "Strong: helps fix it first, raises the process later without blame. Red flag: \"I told you so\".",
          "solution": "\"Let's roll back first. Later, can we add a rollback check to the release list?\""
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
          "task": "Share your biggest lead mistake in one minute.",
          "description": "Checks honest reflection as a leader.",
          "code": "Example: you did all hard tasks yourself and the team did not grow.",
          "answer": "Strong: real mistake, its impact on people, what changed. Red flag: humble-brag like \"I work too hard\".",
          "solution": `"I took all hard tasks myself. The team did not grow, and I burned out.
Now I pair and give hard tasks to others with support."`
        },
        {
          "task": "Name a sign you are repeating the mistake.",
          "description": "Checks self-awareness and a check habit.",
          "code": "You used to micromanage PRs.",
          "answer": "Strong: a clear signal like \"I review every PR\" and an action. Red flag: \"it will not happen again\"."
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
          "task": "Tell your manager the team missed the promise.",
          "description": "Checks owning a miss upward.",
          "code": "The team promised a launch on the 1st. It is now the 10th.",
          "answer": "Strong: owns it as the lead, says why, new date, what changes. Red flag: blames the team.",
          "solution": `"We missed the date, and that is on me: I did not cut scope early.
New date: the 20th. I added weekly risk checks."`
        },
        {
          "task": "Tell the team about the miss without blame.",
          "description": "Checks protecting the team and learning together.",
          "code": "The team feels bad after the missed date.",
          "answer": "Strong: shares ownership, thanks the work, asks for ideas. Red flag: naming who was slow.",
          "solution": `"I took responsibility with leadership.
Let's do a short retro: what should we change next time?"`
        }
      ]
    }]
  }
};
