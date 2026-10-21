import javascript from './data/javascript.js';
import typescript from './data/typescript.js';
import react from './data/react.js';
import generic from './data/generic-questions.js';
import aiTooling from './data/ai-tooling.js';
import softSkills from './data/soft-skills.js';
import x1 from './data/extra/javascript-1.js';
import x2 from './data/extra/javascript-2.js';
import x3 from './data/extra/typescript-1.js';
import x4 from './data/extra/typescript-2.js';
import x5 from './data/extra/react-1.js';
import x6 from './data/extra/react-2.js';
import x7 from './data/extra/generic-1.js';
import x8 from './data/extra/generic-2.js';
import x9 from './data/extra/ai-soft.js';
import x10 from './data/extra/react-19.js';
import x11 from './data/extra/ai-dev.js';

export const LEVELS = [
  { id: 'junior', label: 'Junior' },
  { id: 'middle', label: 'Middle' },
  { id: 'senior', label: 'Senior' },
  { id: 'techlead', label: 'Tech Lead' },
];

export const SCALE = [
  { value: 1, label: 'Very weak / No experience' },
  { value: 2, label: 'Weak / Limited ability' },
  { value: 3, label: 'Average / Ability to produce working code' },
  { value: 4, label: 'Strong / Ability to analyse, optimise and scale' },
  { value: 5, label: 'Excellent / Deep knowledge, ability to innovate and teach' },
];

// Topic shape per level (single object or array of alternatives):
// { q, code?, short, long?, exercises?: [{ task, description, code?, answer, solution?, easy? }], fix?, follow?, ai? }
const TOPICS = {
  'Generic Questions': generic,
  JavaScript: javascript,
  TypeScript: typescript,
  React: react,
  'AI Tooling': aiTooling,
  'Soft Skills': softSkills,
};

// Extra files add more alternatives: { [category]: { [topic]: { [level]: [question, ...] } } }.
// Builds a new merged object — never mutate the imported modules (HMR re-runs this file
// while the data modules stay cached, so mutation would append extras on every reload).
const asList = (x) => (Array.isArray(x) ? x : [x]);
const MERGED = Object.fromEntries(Object.entries(TOPICS).map(([cat, topics]) => [cat,
  Object.fromEntries(Object.entries(topics).map(([topic, levels]) => [topic,
    Object.fromEntries(Object.entries(levels).map(([level, x]) => [level, asList(x)]))]))]));
for (const extra of [x1, x2, x3, x4, x5, x6, x7, x8, x9, x10, x11]) {
  for (const [cat, topics] of Object.entries(extra)) {
    for (const [topic, levels] of Object.entries(topics)) {
      for (const [level, qs] of Object.entries(levels)) {
        if (!MERGED[cat]) { console.warn('Unknown category', cat); continue; }
        // Extra files may also add whole new topics.
        MERGED[cat][topic] ??= {};
        MERGED[cat][topic][level] = [...(MERGED[cat][topic][level] ?? []), ...qs];
      }
    }
  }
}

export const CATEGORIES = Object.keys(MERGED);

const toQuestion = (x) => ({
  type: x.code ? 'code' : 'theory',
  question: x.q,
  code: x.code,
  short: x.short ?? x.a,
  long: x.long,
  // Easy warm-ups first, then the regular exercises.
  exercises: [...(x.exercises ?? [])].sort((a, b) => (b.easy ? 1 : 0) - (a.easy ? 1 : 0)),
  answerCode: x.fix,
  followUp: x.follow,
  aiResistant: !!x.ai,
});

// One entry per topic+level; `options` holds alternative questions (a level may be an object or an array).
export const QUESTIONS = Object.entries(MERGED).flatMap(([category, topics]) =>
  Object.entries(topics).flatMap(([topic, levels]) =>
    Object.entries(levels).map(([level, x]) => ({
      id: `${category}|${topic}|${level}`,
      category,
      level,
      topic,
      options: x.map(toQuestion),
    })),
  ),
);
