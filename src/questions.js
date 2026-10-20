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
// { q, code?, short, long?, exercises?: [{ task, description, code?, answer, solution? }], fix?, follow?, ai? }
const TOPICS = {
  'Generic Questions': generic,
  JavaScript: javascript,
  TypeScript: typescript,
  React: react,
  'AI Tooling': aiTooling,
  'Soft Skills': softSkills,
};

// Extra files add more alternatives: { [category]: { [topic]: { [level]: [question, ...] } } }
for (const extra of [x1, x2, x3, x4, x5, x6, x7, x8, x9]) {
  for (const [cat, topics] of Object.entries(extra)) {
    for (const [topic, levels] of Object.entries(topics)) {
      for (const [level, qs] of Object.entries(levels)) {
        const base = TOPICS[cat]?.[topic]?.[level];
        if (!base) { console.warn('Unknown extra target', cat, topic, level); continue; }
        TOPICS[cat][topic][level] = [...(Array.isArray(base) ? base : [base]), ...qs];
      }
    }
  }
}

export const CATEGORIES = Object.keys(TOPICS);

const toQuestion = (x) => ({
  type: x.code ? 'code' : 'theory',
  question: x.q,
  code: x.code,
  short: x.short ?? x.a,
  long: x.long,
  exercises: x.exercises ?? (x.examples ?? []).map((e) => ({ task: e.title, answer: '', solution: e.code })),
  answerCode: x.fix,
  followUp: x.follow,
  aiResistant: !!x.ai,
});

// One entry per topic+level; `options` holds alternative questions (a level may be an object or an array).
export const QUESTIONS = Object.entries(TOPICS).flatMap(([category, topics]) =>
  Object.entries(topics).flatMap(([topic, levels]) =>
    Object.entries(levels).map(([level, x]) => ({
      id: `${category}|${topic}|${level}`,
      category,
      level,
      topic,
      options: (Array.isArray(x) ? x : [x]).map(toQuestion),
    })),
  ),
);
