import javascript from './data/javascript.js';
import typescript from './data/typescript.js';
import react from './data/react.js';
import generic from './data/generic-questions.js';
import aiTooling from './data/ai-tooling.js';
import softSkills from './data/soft-skills.js';

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
