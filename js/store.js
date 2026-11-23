// Données locales (localStorage) + logique métier pure : semaines, suggestions, records.
import {EX, INC, SESS, WEEKS} from './program.js';

const KEY = 'muscu-state-v1', DRAFT = 'muscu-draft-v1';
const blank = () => ({v:1, updated:0, lastBackup:0, settings:{start:'', age:'', rhr:'', hrm:''}, sessions:[], runs:[], weights:[]});

export const iso = d => { const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return z.toISOString().slice(0, 10); };
export const today = () => iso(new Date());
export const pd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const fmtD = s => pd(s).toLocaleDateString('fr-FR', {weekday:'short', day:'numeric', month:'short'});
export const nf = (x, d = 1) => (Math.round(x * 10 ** d) / 10 ** d).toLocaleString('fr-FR');
export const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const e1 = (w, r) => (+w) * (1 + (+r) / 30);

function mondayOf(d) { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return iso(x); }

export function load() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
  s = Object.assign(blank(), s || {});
  s.settings = Object.assign(blank().settings, s.settings);
  if (!s.settings.start) s.settings.start = mondayOf(new Date());
  return s;
}
export function save(s) {
  s.updated = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(s)); return true; } catch (e) { return false; }
}
export function importJSON(txt) {
  const d = JSON.parse(txt);
  if (!Array.isArray(d.sessions)) throw new Error('format');
  const s = Object.assign(blank(), d); s.settings = Object.assign(blank().settings, d.settings);
  return s;
}
export const loadDraft = () => { try { return JSON.parse(localStorage.getItem(DRAFT) || 'null'); } catch (e) { return null; } };
export const saveDraft = d => { try { d ? localStorage.setItem(DRAFT, JSON.stringify(d)) : localStorage.removeItem(DRAFT); } catch (e) {} };

export function weekOf(s, d) {
  const days = Math.round((pd(d) - pd(s.settings.start || d)) / 864e5);
  const wk = Math.max(0, Math.floor(days / 7));
  const w = wk % 6;
  return {block: Math.floor(wk / 6) + 1, w: w + 1, ...WEEKS[w]};
}
export const sortedSessions = s => s.sessions.slice().sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
const step = id => INC[EX[id].k];

// Double progression : même charge tant que toutes les séries n'atteignent pas le haut de la fourchette.
export function suggest(s, id, variant) {
  const e = EX[id];
  for (const ss of sortedSessions(s)) {
    const st = (ss.sets[id] || []).filter(x => x.done && +x.r > 0);
    if (!st.length) continue;
    const v = (ss.variants || {})[id];
    if (variant && v && v !== variant) continue;
    const w = +st[0].w || 0, top = st.every(x => +x.r >= e.rr[1]);
    const next = top ? Math.round((w + step(id)) / 0.5) * 0.5 : w;
    return {w: next, reps: st.map(x => +x.r), up: top, last: {date: ss.date, w, reps: st.map(x => x.r)}};
  }
  return {w: '', reps: [], up: false, last: null};
}

export function newDraft(s, type, date) {
  const d = {type, date: date || today(), start: 0, sets: {}, variants: {}};
  const se = SESS[type], deload = weekOf(s, d.date).deload;
  if (se.it) for (const [, id, n] of se.it) {
    const sg = suggest(s, id), cnt = deload ? Math.ceil(n / 2) : n;
    d.sets[id] = Array.from({length: cnt}, (_, i) => ({w: sg.w, r: sg.up ? EX[id].rr[0] : (sg.reps[i] || ''), done: false}));
  }
  return d;
}

export function records(s) {
  const best = {};
  for (const ss of s.sessions) for (const [id, sets] of Object.entries(ss.sets)) for (const x of sets) {
    if (!x.done || !(+x.r > 0)) continue;
    const v = e1(x.w, x.r);
    if (!best[id] || v > best[id].v) best[id] = {v, w: x.w, r: x.r, d: ss.date};
  }
  return best;
}

export function weekVolume(s, fromDate) {
  const done = {};
  for (const ss of s.sessions) if (ss.date >= fromDate)
    for (const [id, sets] of Object.entries(ss.sets)) for (const [m, f] of Object.entries(EX[id].m))
      done[m] = (done[m] || 0) + sets.filter(x => x.done).length * f;
  return done;
}
export function plannedVolume() {
  const p = {};
  for (const k of ['UA', 'LA', 'UB', 'LB']) for (const [, id, n] of SESS[k].it) for (const [m, f] of Object.entries(EX[id].m)) p[m] = (p[m] || 0) + n * f;
  return p;
}
export {mondayOf};
