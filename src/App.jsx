import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box, Button, Collapse, Drawer, IconButton, InputBase, Stack, Switch, Tooltip, Typography, useMediaQuery,
} from '@mui/material';
import { LEVELS, CATEGORIES, QUESTIONS, SCALE } from './questions';
import { C, fonts } from './theme';
import { Gloss, GLOSSARY, findTerms } from './glossary';

// ── persistence ────────────────────────────────────────────────
const STORE = 'interview-notebook:v1';
const load = () => { try { return JSON.parse(localStorage.getItem(STORE)) ?? {}; } catch { return {}; } };
function usePersisted(key, initial) {
  const [v, setV] = useState(() => load()[key] ?? initial);
  useEffect(() => {
    try { localStorage.setItem(STORE, JSON.stringify({ ...load(), [key]: v })); } catch { /* private mode */ }
  }, [key, v]);
  return [v, setV];
}

const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const fmt = (n) => (n == null ? '—' : n.toFixed(1));

// ── small pieces ───────────────────────────────────────────────
function Code({ children, title, tone = 'dark' }) {
  return (
    <Box sx={{ my: 1.25 }}>
      {title && (
        <Typography sx={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: C.muted, mb: .5 }}>
          {title}
        </Typography>
      )}
      <Box component="pre" sx={{
        m: 0, p: 2, overflowX: 'auto', fontFamily: fonts.mono, fontSize: 13, lineHeight: 1.6, borderRadius: 1,
        bgcolor: tone === 'dark' ? C.code : '#f1ece0', color: tone === 'dark' ? '#ece6d8' : C.ink,
        borderLeft: `3px solid ${tone === 'dark' ? C.accent : C.moss}`,
      }}>
        <code>{String(children).trim()}</code>
      </Box>
    </Box>
  );
}

function Tag({ children, color = C.muted, bg = 'transparent' }) {
  return (
    <Box component="span" sx={{
      fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: '.06em', textTransform: 'uppercase',
      color, bgcolor: bg, border: `1px solid ${color}`, px: .75, py: .1, borderRadius: .5, whiteSpace: 'nowrap',
    }}>{children}</Box>
  );
}

function Score({ value, onChange }) {
  return (
    <Stack direction="row" role="radiogroup" aria-label="Score" sx={{ border: `1px solid ${C.rule}`, borderRadius: 1, overflow: 'hidden', width: 'fit-content' }}>
      {SCALE.map((s) => {
        const on = value === s.value;
        return (
          <Tooltip key={s.value} title={`${s.value} — ${s.label}`} placement="top">
            <Box component="button" role="radio" aria-checked={on}
              onClick={(e) => { e.stopPropagation(); onChange(on ? null : s.value); }}
              sx={{
                all: 'unset', cursor: 'pointer', width: 44, height: 38, display: 'grid', placeItems: 'center',
                fontFamily: fonts.mono, fontSize: 14, fontWeight: 600,
                color: on ? '#fff' : C.muted, bgcolor: on ? C.accent : 'transparent',
                borderRight: `1px solid ${C.rule}`, '&:last-of-type': { borderRight: 0 },
                transition: 'background .15s, color .15s',
                '&:hover': { bgcolor: on ? C.accent : C.accentSoft, color: on ? '#fff' : C.ink },
                '&:focus-visible': { outline: `2px solid ${C.accent}`, outlineOffset: -2 },
              }}>
              {s.value}
            </Box>
          </Tooltip>
        );
      })}
    </Stack>
  );
}

function Exercise({ n, ex }) {
  const [show, setShow] = useState(false);
  return (
    <Box sx={{ mb: 1.25, px: 1.75, py: 1.25, border: `1px solid ${C.rule}`, borderRadius: 1, bgcolor: '#fbf8f1' }}>
      <Stack direction="row" spacing={1} alignItems="baseline" justifyContent="space-between">
        <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
          <Box component="span" sx={{ fontFamily: fonts.mono, color: C.accent, mr: 1, fontSize: 12 }}>EX{n}</Box>
          <Gloss>{ex.task}</Gloss>
        </Typography>
        <Button size="small" onClick={(e) => { e.stopPropagation(); setShow((v) => !v); }}
          sx={{ color: C.moss, minWidth: 0, px: .5, whiteSpace: 'nowrap', flexShrink: 0 }}>
          {show ? 'Hide' : 'Answer'}
        </Button>
      </Stack>
      {ex.description && <Typography sx={{ fontSize: 12.5, color: C.muted }}><Gloss>{ex.description}</Gloss></Typography>}
      {ex.code && <Code>{ex.code}</Code>}
      <Collapse in={show} unmountOnExit>
        <Box sx={{ mt: 1, pl: 1.5, borderLeft: `2px solid ${C.moss}` }}>
          <Typography sx={{ whiteSpace: 'pre-line', lineHeight: 1.55, fontSize: 14.5 }}><Gloss>{ex.answer}</Gloss></Typography>
          {ex.solution && <Code tone="light">{ex.solution}</Code>}
        </Box>
      </Collapse>
    </Box>
  );
}

// Abbreviations in the question, spelled out so they can be read aloud.
function Terms({ text }) {
  const terms = findTerms(...text);
  if (!terms.length) return null;
  return (
    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1.5, rowGap: .5 }}>
      {terms.map((t) => (
        <Typography key={t} sx={{ fontSize: 12.5, color: C.muted }}>
          <Box component="span" sx={{ fontFamily: fonts.mono, fontWeight: 600, color: C.ink }}>{t}</Box> = {GLOSSARY[t]}
        </Typography>
      ))}
    </Box>
  );
}

// Alternative questions for one topic: numbered rows with type + one-line preview.
function Picker({ options, value, onChange }) {
  return (
    <Box role="radiogroup" aria-label="Choose a question" sx={{ mb: 2, border: `1px solid ${C.rule}`, borderRadius: 1, overflow: 'hidden' }}>
      {options.map((o, i) => {
        const on = i === value;
        return (
          <Box key={i} component="button" role="radio" aria-checked={on}
            onClick={(e) => { e.stopPropagation(); onChange(i); }}
            sx={{
              all: 'unset', boxSizing: 'border-box', cursor: 'pointer', width: '100%',
              display: 'grid', gridTemplateColumns: '28px 62px 1fr', alignItems: 'center', gap: 1, px: 1.5, py: .75,
              borderBottom: `1px solid ${C.rule}`, '&:last-of-type': { borderBottom: 0 },
              bgcolor: on ? C.accentSoft : 'transparent', '&:hover': { bgcolor: on ? C.accentSoft : '#f7f2e7' },
              '&:focus-visible': { outline: `2px solid ${C.accent}`, outlineOffset: -2 },
            }}>
            <Typography sx={{ fontFamily: fonts.mono, fontSize: 12, fontWeight: 600, color: on ? C.accent : C.muted }}>Q{i + 1}</Typography>
            <Typography sx={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase', color: o.type === 'code' ? C.moss : C.muted }}>
              {o.type === 'code' ? 'Code' : 'Theory'}{o.aiResistant ? ' ★' : ''}
            </Typography>
            <Typography noWrap sx={{ fontSize: 13.5, color: on ? C.ink : C.muted, fontWeight: on ? 600 : 400 }} title={o.question}>{o.question}</Typography>
          </Box>
        );
      })}
    </Box>
  );
}

// ── question card ──────────────────────────────────────────────
function QuestionCard({ q: topicQ, opt, setOpt, index, score, onScore, active, onFocus, presenting, open, onToggle }) {
  const q = { ...topicQ, ...topicQ.options[opt] };
  const [tab, setTab] = useState('short');
  useEffect(() => setTab('short'), [opt]);
  const tabs = [
    ['short', 'Short'],
    q.long && ['long', 'Long'],
    q.exercises.length > 0 && ['exercises', `Exercises · ${q.exercises.length}`],
  ].filter(Boolean);
  const ref = useRef(null);
  useEffect(() => { if (active) ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, [active]);

  return (
    <Box ref={ref} className="rise" onClick={onFocus} sx={{
      animationDelay: `${Math.min(index, 10) * 30}ms`,
      position: 'relative', bgcolor: C.card, border: `1px solid ${active ? C.ink : C.rule}`, borderRadius: 1,
      p: { xs: 2, md: 3 }, mb: 2, transition: 'border-color .15s, box-shadow .15s',
      boxShadow: active ? `4px 4px 0 ${C.ink}` : 'none',
    }}>
      {/* margin number, like a printed exam */}
      <Typography aria-hidden sx={{
        position: 'absolute', left: { xs: 'auto', md: -56 }, right: { xs: 16, md: 'auto' }, top: { xs: 12, md: 20 },
        fontFamily: fonts.display, fontSize: { xs: 22, md: 34 }, fontWeight: 800, color: score ? C.accent : C.rule, lineHeight: 1,
      }}>
        {String(index + 1).padStart(2, '0')}
      </Typography>

      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1.5, pr: { xs: 5, md: 0 } }}>
        <Typography sx={{ fontFamily: fonts.display, fontWeight: 600, fontSize: 18 }}>{q.topic}</Typography>
        {q.type === 'code' ? <Tag color={C.moss}>Code fix</Tag> : <Tag>Theory</Tag>}
        {q.aiResistant && <Tag color={C.accent} bg={C.accentSoft}>AI-resistant</Tag>}
      </Stack>

      {topicQ.options.length > 1 && !presenting && <Picker options={topicQ.options} value={opt} onChange={setOpt} />}

      <Typography sx={{ fontSize: 17, lineHeight: 1.6, maxWidth: '68ch', fontWeight: 500 }}><Gloss>{q.question}</Gloss></Typography>
      <Terms text={[q.question, q.followUp]} />
      {q.code && <Code>{q.code}</Code>}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between" sx={{ mt: 2 }}>
        <Score value={score} onChange={onScore} />
        {!presenting && (
          <Button size="small" onClick={(e) => { e.stopPropagation(); onToggle(); }} aria-expanded={open}
            sx={{ color: C.ink, borderBottom: `1px dashed ${C.ink}`, borderRadius: 0, px: .5 }}>
            {open ? 'Hide answer' : 'Reveal answer'} <Box component="kbd" sx={{ ml: 1, fontFamily: fonts.mono, fontSize: 11, color: C.muted }}>A</Box>
          </Button>
        )}
      </Stack>

      {!presenting && (
        <Collapse in={open} unmountOnExit>
          <Box sx={{ mt: 2.5, pt: 2, borderTop: `1px dashed ${C.rule}` }}>
            <Stack direction="row" spacing={0.5} sx={{ mb: 1.5 }}>
              {tabs.map(([v, l]) => (
                <Box key={v} component="button" onClick={(e) => { e.stopPropagation(); setTab(v); }} sx={{
                  all: 'unset', cursor: 'pointer', fontSize: 13, fontWeight: 600, px: 1.25, py: .5, borderRadius: .5,
                  color: tab === v ? C.card : C.muted, bgcolor: tab === v ? C.ink : 'transparent',
                  '&:hover': { color: tab === v ? C.card : C.ink },
                  '&:focus-visible': { outline: `2px solid ${C.accent}` },
                }}>{l}</Box>
              ))}
            </Stack>
            {tab === 'short' && (
              <>
                <Typography sx={{ whiteSpace: 'pre-line', lineHeight: 1.6, maxWidth: '72ch' }}><Gloss>{q.short}</Gloss></Typography>
                {q.answerCode && <Code title="Solution" tone="light">{q.answerCode}</Code>}
              </>
            )}
            {tab === 'long' && <Typography sx={{ whiteSpace: 'pre-line', lineHeight: 1.7, maxWidth: '72ch' }}><Gloss>{q.long}</Gloss></Typography>}
            {tab === 'exercises' && q.exercises.map((ex, i) => <Exercise key={i} n={i + 1} ex={ex} />)}
            {q.followUp && (
              <Box sx={{ mt: 2, p: 1.5, bgcolor: C.accentSoft, borderRadius: 1 }}>
                <Typography sx={{ fontSize: 14 }}><b>Follow-up →</b> <Gloss>{q.followUp}</Gloss></Typography>
              </Box>
            )}
          </Box>
        </Collapse>
      )}
    </Box>
  );
}

// ── sidebar ────────────────────────────────────────────────────
function Sidebar({ level, setLevel, category, setCategory, stats, presenting, setPresenting, onSummary }) {
  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
      <Box>
        <Typography variant="h1" sx={{ fontSize: 30, lineHeight: 1 }}>Interview<br /><Box component="span" sx={{ color: C.accent, fontStyle: 'italic' }}>Notebook</Box></Typography>
        <Typography sx={{ fontFamily: fonts.mono, fontSize: 11, color: C.muted, mt: 1 }}>FRONTEND · {QUESTIONS.reduce((n, q) => n + q.options.length, 0)} QUESTIONS</Typography>
      </Box>

      <Box>
        <Label>Level</Label>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: .5 }}>
          {LEVELS.map((l) => (
            <Box key={l.id} component="button" onClick={() => setLevel(l.id)} aria-pressed={level === l.id} sx={{
              all: 'unset', cursor: 'pointer', textAlign: 'center', py: 1, fontWeight: 600, fontSize: 14, borderRadius: .5,
              border: `1px solid ${level === l.id ? C.ink : C.rule}`, bgcolor: level === l.id ? C.ink : C.card, color: level === l.id ? C.card : C.ink,
              '&:focus-visible': { outline: `2px solid ${C.accent}`, outlineOffset: 2 },
            }}>{l.label}</Box>
          ))}
        </Box>
      </Box>

      <Box component="nav" aria-label="Categories">
        <Label>Sections</Label>
        {CATEGORIES.map((c) => {
          const s = stats[c];
          const on = c === category;
          return (
            <Box key={c} component="button" onClick={() => setCategory(c)} aria-current={on ? 'page' : undefined} sx={{
              all: 'unset', cursor: 'pointer', display: 'block', width: '100%', boxSizing: 'border-box', py: 1, px: 1.25, mb: .25, borderRadius: .5,
              bgcolor: on ? C.accentSoft : 'transparent', '&:hover': { bgcolor: on ? C.accentSoft : '#efe8d9' },
              '&:focus-visible': { outline: `2px solid ${C.accent}` },
            }}>
              <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                <Typography sx={{ fontWeight: on ? 600 : 500, fontSize: 14.5 }}>{c}</Typography>
                <Typography sx={{ fontFamily: fonts.mono, fontSize: 12, color: s.avg ? C.accent : C.muted }}>{fmt(s.avg)}</Typography>
              </Stack>
              <Box sx={{ mt: .75, height: 3, bgcolor: C.rule, borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ height: '100%', width: `${(s.rated / s.total) * 100}%`, bgcolor: C.accent, transition: 'width .3s' }} />
              </Box>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ mt: 'auto' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Screen-share mode</Typography>
            <Typography sx={{ fontSize: 12, color: C.muted }}>Hides answers <kbd>P</kbd></Typography>
          </Box>
          <Switch checked={presenting} onChange={(e) => setPresenting(e.target.checked)} inputProps={{ 'aria-label': 'Screen-share mode' }} />
        </Stack>
        <Button fullWidth variant="contained" disableElevation onClick={onSummary} sx={{ bgcolor: C.ink, '&:hover': { bgcolor: '#000' } }}>
          Scorecard summary
        </Button>
      </Box>
    </Box>
  );
}

const Label = ({ children }) => (
  <Typography sx={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: C.muted, mb: 1 }}>{children}</Typography>
);

// ── summary drawer ─────────────────────────────────────────────
function Summary({ open, onClose, level, scores, notes, picked, stats, onReset }) {
  const levelLabel = LEVELS.find((l) => l.id === level).label;
  const overall = avg(Object.values(stats).flatMap((s) => s.values));
  const text = [
    `Frontend interview — ${levelLabel}`,
    `Overall: ${fmt(overall)} / 5`,
    '',
    ...CATEGORIES.flatMap((c) => {
      const rows = QUESTIONS.filter((q) => q.level === level && q.category === c && scores[q.id]);
      const note = notes[`${level}|${c}`];
      if (!rows.length && !note) return [];
      return [`${c}: ${fmt(stats[c].avg)}`, ...rows.map((q) => `  • ${q.topic}: ${scores[q.id]}/5 — asked: ${q.options[picked[q.id] ?? 0]?.question ?? ''}`), ...(note ? [`  Notes: ${note}`] : []), ''];
    }),
  ].join('\n');
  const [copied, setCopied] = useState(false);

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 440 }, bgcolor: C.paper, p: 3 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h2" sx={{ fontSize: 26 }}>Scorecard</Typography>
        <IconButton onClick={onClose} aria-label="Close">✕</IconButton>
      </Stack>
      <Typography sx={{ color: C.muted, mb: 3 }}>{levelLabel} level</Typography>

      <Box sx={{ textAlign: 'center', py: 3, mb: 3, border: `1px solid ${C.ink}`, boxShadow: `4px 4px 0 ${C.ink}`, bgcolor: C.card }}>
        <Typography sx={{ fontFamily: fonts.display, fontSize: 64, fontWeight: 800, lineHeight: 1, color: C.accent }}>{fmt(overall)}</Typography>
        <Typography sx={{ fontSize: 13, color: C.muted, mt: 1 }}>
          {overall ? SCALE[Math.round(overall) - 1].label : 'No scores yet'}
        </Typography>
      </Box>

      {CATEGORIES.map((c) => (
        <Stack key={c} direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.25 }}>
          <Typography sx={{ width: 140, fontSize: 14 }}>{c}</Typography>
          <Box sx={{ flex: 1, height: 8, bgcolor: C.rule, borderRadius: 1, overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: `${((stats[c].avg ?? 0) / 5) * 100}%`, bgcolor: C.accent }} />
          </Box>
          <Typography sx={{ fontFamily: fonts.mono, fontSize: 13, width: 28, textAlign: 'right' }}>{fmt(stats[c].avg)}</Typography>
        </Stack>
      ))}

      <Stack direction="row" spacing={1} sx={{ mt: 'auto', pt: 3 }}>
        <Button fullWidth variant="contained" disableElevation
          onClick={() => navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); })}>
          {copied ? 'Copied ✓' : 'Copy as text'}
        </Button>
        <Button color="inherit" onClick={() => { if (confirm('Clear all scores and notes?')) onReset(); }}>Reset</Button>
      </Stack>
    </Drawer>
  );
}

// ── app ────────────────────────────────────────────────────────
export default function App() {
  const [level, setLevel] = usePersisted('level', 'junior');
  const [category, setCategory] = usePersisted('category', CATEGORIES[0]);
  const [scores, setScores] = usePersisted('scores', {});
  const [picked, setPicked] = usePersisted('picked', {});
  const [notes, setNotes] = usePersisted('notes', {});
  const [presenting, setPresenting] = useState(false);
  const [query, setQuery] = useState('');
  const [openIds, setOpenIds] = useState({});
  const [active, setActive] = useState(0);
  const [summary, setSummary] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const desktop = useMediaQuery('(min-width:1000px)');

  const list = useMemo(() => {
    const s = query.trim().toLowerCase();
    return QUESTIONS.filter((q) => q.level === level && q.category === category &&
      (!s || `${q.topic} ${q.options.map((o) => o.question).join(' ')}`.toLowerCase().includes(s)));
  }, [level, category, query]);

  useEffect(() => setActive(0), [level, category, query]);

  const stats = useMemo(() => Object.fromEntries(CATEGORIES.map((c) => {
    const qs = QUESTIONS.filter((q) => q.level === level && q.category === c);
    const values = qs.map((q) => scores[q.id]).filter(Boolean);
    return [c, { total: qs.length, rated: values.length, values, avg: avg(values) }];
  })), [level, scores]);

  const setScore = useCallback((id, v) => setScores((s) => ({ ...s, [id]: v })), [setScores]);
  const toggle = (id) => setOpenIds((o) => ({ ...o, [id]: !o[id] }));

  // keyboard: j/k move, 1-5 score, a reveal, p presenting
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest('input, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
      const q = list[active];
      if (e.key === 'j' || e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, list.length - 1)); }
      else if (e.key === 'k' || e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
      else if (/^[1-5]$/.test(e.key) && q) setScore(q.id, Number(e.key));
      else if (e.key === 'a' && q && !presenting) toggle(q.id);
      else if ((e.key === ']' || e.key === '[') && q) {
        const n = q.options.length;
        setPicked((p) => ({ ...p, [q.id]: ((p[q.id] ?? 0) + (e.key === ']' ? 1 : n - 1)) % n }));
      }
      else if (e.key === 'p') setPresenting((p) => !p);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [list, active, presenting, setScore, setPicked]);

  const noteKey = `${level}|${category}`;
  const sidebar = (
    <Sidebar {...{ level, setLevel, category, stats, presenting, setPresenting }}
      setCategory={(c) => { setCategory(c); setNavOpen(false); window.scrollTo({ top: 0 }); }}
      onSummary={() => setSummary(true)} />
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {desktop ? (
        <Box component="aside" sx={{ width: 280, flexShrink: 0, position: 'sticky', top: 0, height: '100vh', borderRight: `1px solid ${C.rule}`, bgcolor: 'rgba(246,241,231,.9)' }}>
          {sidebar}
        </Box>
      ) : (
        <Drawer open={navOpen} onClose={() => setNavOpen(false)} PaperProps={{ sx: { width: 290, bgcolor: C.paper } }}>{sidebar}</Drawer>
      )}

      <Box component="main" sx={{ flex: 1, minWidth: 0, px: { xs: 2, md: 10 }, py: { xs: 2, md: 5 } }}>
        <Box sx={{ maxWidth: 860, mx: 'auto' }}>
          {!desktop && (
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Button onClick={() => setNavOpen(true)} sx={{ color: C.ink }}>☰ Sections</Button>
              <Typography sx={{ fontFamily: fonts.mono, fontSize: 12 }}>{LEVELS.find((l) => l.id === level).label}</Typography>
            </Stack>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-end' }} spacing={2} sx={{ mb: 1 }}>
            <Box>
              <Typography sx={{ fontFamily: fonts.mono, fontSize: 12, color: C.accent, letterSpacing: '.1em' }}>
                {LEVELS.find((l) => l.id === level).label.toUpperCase()} · {stats[category].rated}/{stats[category].total} SCORED
              </Typography>
              <Typography variant="h1" sx={{ fontSize: { xs: 36, md: 52 }, lineHeight: 1.05 }}>{category}</Typography>
            </Box>
            <InputBase placeholder="Filter topics…" value={query} onChange={(e) => setQuery(e.target.value)}
              inputProps={{ 'aria-label': 'Filter topics' }}
              sx={{ border: `1px solid ${C.rule}`, bgcolor: C.card, px: 1.5, py: .5, borderRadius: 1, width: { xs: '100%', sm: 220 }, fontSize: 14 }} />
          </Stack>

          <Typography sx={{ fontSize: 12.5, color: C.muted, mb: 3 }}>
            Keys: <kbd>J</kbd>/<kbd>K</kbd> move · <kbd>[</kbd>/<kbd>]</kbd> switch question · <kbd>1</kbd>–<kbd>5</kbd> score · <kbd>A</kbd> answer · <kbd>P</kbd> screen-share. ★ = AI-resistant.
          </Typography>

          {presenting && (
            <Box sx={{ mb: 2, p: 1.5, border: `1px dashed ${C.accent}`, color: C.accent, borderRadius: 1, fontSize: 14 }}>
              Screen-share mode is on — answers are hidden.
            </Box>
          )}

          {list.map((q, i) => (
            <QuestionCard key={q.id} q={q} opt={Math.min(picked[q.id] ?? 0, q.options.length - 1)}
              setOpt={(v) => setPicked((p) => ({ ...p, [q.id]: v }))} index={i} score={scores[q.id]} onScore={(v) => setScore(q.id, v)}
              active={i === active} onFocus={() => setActive(i)} presenting={presenting}
              open={!!openIds[q.id]} onToggle={() => toggle(q.id)} />
          ))}
          {!list.length && <Typography sx={{ color: C.muted, py: 6, textAlign: 'center' }}>Nothing matches “{query}”.</Typography>}

          <Box sx={{ mt: 4 }}>
            <Label>Additional notes · {category}</Label>
            <InputBase multiline minRows={4} fullWidth value={notes[noteKey] ?? ''} placeholder="Observations, red flags, follow-ups…"
              onChange={(e) => setNotes((n) => ({ ...n, [noteKey]: e.target.value }))}
              inputProps={{ 'aria-label': `Additional notes for ${category}` }}
              sx={{ bgcolor: C.card, border: `1px solid ${C.rule}`, borderRadius: 1, p: 2, fontSize: 15,
                backgroundImage: `repeating-linear-gradient(transparent 0 27px, ${C.rule} 27px 28px)`, lineHeight: '28px' }} />
          </Box>
        </Box>
      </Box>

      <Summary open={summary} onClose={() => setSummary(false)} level={level} scores={scores} notes={notes} picked={picked} stats={stats}
        onReset={() => { setScores({}); setNotes({}); }} />
    </Box>
  );
}
