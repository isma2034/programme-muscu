// Interface de l'app. Données : store.js · Programme : program.js · Exemples : library.js
import {EX, SESS, PLAN, WEEKS, MUS, TARGET, INC, FR} from './program.js';
import {LIB, VARIANTS} from './library.js';
import * as St from './store.js';
const {esc, nf, fmtD, today, pd, iso} = St;

const $ = s => document.querySelector(s);
let S = St.load();
let D = St.loadDraft();
let openGroup = null, selEx = 'bench', libFilter = '', libMus = '';
const VERSION = '1.0.0';

/* ---------- utilitaires ---------- */
const img = (libId, k = 0) => LIB[libId] ? LIB[libId].images[k] || LIB[libId].images[0] : '';
const mainLib = id => VARIANTS[id][0];
const varName = libId => FR[libId] || LIB[libId]?.name || libId;
const anim = libId => { const l = LIB[libId]; if (!l) return ''; return `<div class="anim">${l.images.map(s => `<img src="${s}" alt="${esc(varName(libId))}" loading="lazy">`).join('')}</div>`; };
let tt;
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2400); }
function persist(msg) { const ok = St.save(S); if (msg) toast(ok ? msg : 'Stockage plein ou bloqué : exporte tes données'); }
function haptic(ms = 15) { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} }
function sheet(html) { $('#sheetIn').innerHTML = html; $('#sheet').classList.add('on'); }
function closeSheet() { $('#sheet').classList.remove('on'); }

/* ---------- en-tête ---------- */
function renderTop(view) {
  const t = today(), wi = St.weekOf(S, t), mon = pd(St.mondayOf(new Date()));
  const titles = {seance: D ? SESS[D.type].n : 'Séance', exos: 'Exercices', progres: 'Progrès', poids: 'Poids & nutrition', plus: 'Plan & réglages'};
  let sub = `<span class="pill">Bloc ${wi.block} · sem. ${wi.w}/6</span><span>${wi.deload ? '<b>Deload</b>' : `Effort : <b>${wi.rir} reps en réserve</b>`}</span>`;
  let extra = '';
  if (view === 'seance') {
    extra = `<div class="days">${[0,1,2,3,4,5,6].map(i => { const d = new Date(mon); d.setDate(mon.getDate() + i); const ds = iso(d), ty = PLAN[d.getDay()];
      const done = S.sessions.some(x => x.date === ds) || S.runs.some(x => x.date === ds);
      return `<button class="day ${ds === t ? 'now' : ''} ${done ? 'done' : ''} ${SESS[ty].run ? 'run' : ''}" data-ty="${ty}" data-d="${ds}">${d.toLocaleDateString('fr-FR', {weekday:'short'})}<b>${({UA:'Haut A',LA:'Bas A',UB:'Haut B',LB:'Bas B',EZ:'Footing',IN:'Fract.',RE:'Repos'})[ty]}</b></button>`; }).join('')}</div>`;
    if (D && SESS[D.type].it) { const all = Object.values(D.sets).flat(), n = all.filter(x => x.done).length; extra += `<div class="prog" aria-label="Progression"><i style="width:${all.length ? n / all.length * 100 : 0}%"></i></div>`; }
  }
  $('#top').innerHTML = `<h1>${esc(titles[view])}</h1><div class="sub">${sub}</div>${extra}`;
}

/* ---------- séance ---------- */
function groupsOf(type) { const g = []; for (const it of SESS[type].it) { const k = it[0][0]; let x = g.find(y => y.k === k); if (!x) g.push(x = {k, it: []}); x.it.push(it); } return g; }
function firstOpenGroup() { const g = groupsOf(D.type).find(gr => gr.it.some(([, id]) => D.sets[id].some(x => !x.done))); return g ? g.k : null; }
function ensureDraft() { if (!D) { D = St.newDraft(S, PLAN[new Date().getDay()]); St.saveDraft(D); } }

function renderSeance() {
  ensureDraft();
  const se = SESS[D.type], wi = St.weekOf(S, D.date), v = $('#v-seance');
  const opts = Object.entries(SESS).map(([k, x]) => `<option value="${k}" ${k === D.type ? 'selected' : ''}>${x.n}</option>`).join('');
  let h = '';
  const daysSinceBackup = (Date.now() - (S.lastBackup || 0)) / 864e5;
  if (S.sessions.length >= 3 && daysSinceBackup > 14) h += `<div class="banner">Tes données ne vivent que sur ce téléphone. <a href="#plus">Fais une sauvegarde</a> (30 secondes).</div>`;
  h += `<div class="card"><div class="row"><div class="sp"><b>${esc(se.f)}</b><div class="sm">${fmtD(D.date)}${se.min ? ` · ~${se.min} min` : ''}${wi.deload ? ' · deload' : ''}</div></div></div>
    <div class="grid2" style="margin-top:10px"><label class="f">Séance<select id="pick">${opts}</select></label><label class="f">Date<input type="date" id="ddate" value="${esc(D.date)}"></label></div></div>`;
  if (se.it) {
    if (openGroup === null) openGroup = firstOpenGroup();
    for (const g of groupsOf(D.type)) for (const [lab, id] of g.it) h += exCard(lab, id, g.k === openGroup, wi);
    const n = Object.values(D.sets).flat().filter(x => x.done).length;
    h += `<button class="pri wide" id="finish" ${n ? '' : 'disabled'}>Terminer la séance · ${n} séries</button>
      <div class="row" style="margin-top:8px"><button class="sp" id="reset">Recommencer</button></div>`;
  } else if (se.run) h += runCard(wi);
  else h += `<div class="card empty">Jour de repos. Marche, mobilité, et au moins 7 h de sommeil : c'est là que le muscle se construit.</div>`;
  h += historyHtml();
  v.innerHTML = h;
}
function exCard(lab, id, open, wi) {
  const e = EX[id], sets = D.sets[id], done = sets.filter(x => x.done).length, full = done === sets.length;
  const vId = D.variants[id] || mainLib(id), sg = St.suggest(S, id, D.variants[id]);
  let h = `<article class="ex ${full ? 'full' : ''}" data-ex="${id}"><button class="exh" data-g="${lab[0]}" aria-expanded="${open}">
    <img src="${img(vId)}" alt="" loading="lazy"><span class="t"><span class="tag ${lab.length > 1 ? 'ss' : ''}">${lab}</span> <b>${esc(varName(vId) === e.n || !D.variants[id] ? e.n : varName(vId))}</b><span class="sm">${sets.length} × ${e.rr[0]}–${e.rr[1]}${lab.length > 1 ? ' · superset' : ''}</span></span><span class="c">${done}/${sets.length}</span></button>`;
  if (!open) return h + '</article>';
  const sug = sg.last ? `Dernière fois (${fmtD(sg.last.date)}) : <b>${nf(sg.last.w)} kg</b> × ${esc(sg.last.reps.join(' · '))}. ${sg.up ? `<b>Monte à ${nf(sg.w)} kg</b> et repars en bas de fourchette.` : `Garde ${nf(sg.w)} kg, vise +1 rep.`}` : `Première fois : prends une charge où il te reste ~${wi.deload ? 4 : 2} reps en réserve à ${e.rr[1]} reps.`;
  h += `<div class="exb">${anim(vId)}<ul class="cues">${e.c.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
    <div class="sm">Machine prise ? Variante :</div><div class="chips">${VARIANTS[id].map(x => `<button class="chip ${x === vId ? 'on' : ''}" data-var="${x}" data-ex="${id}">${esc(varName(x))}</button>`).join('')}</div>
    <div class="sug ${sg.up ? 'up' : ''}">${sug}</div>
    <div class="lbl"><span></span><span>kg</span><span>reps</span><span></span></div>
    ${sets.map((x, i) => `<div class="set ${x.done ? 'on' : ''}" data-ex="${id}" data-i="${i}" data-lab="${lab}"><span>${i + 1}</span>
      <div class="stp"><button data-st="w" data-d="-1" aria-label="moins">−</button><input inputmode="decimal" data-f="w" value="${esc(x.w)}" aria-label="Charge série ${i + 1}"><button data-st="w" data-d="1" aria-label="plus">+</button></div>
      <div class="stp"><button data-st="r" data-d="-1" aria-label="moins">−</button><input inputmode="numeric" data-f="r" value="${esc(x.r)}" placeholder="${e.rr[1]}" aria-label="Reps série ${i + 1}"><button data-st="r" data-d="1" aria-label="plus">+</button></div>
      <button class="chk" aria-label="Valider la série ${i + 1}">✓</button></div>`).join('')}
    <div class="row" style="margin-top:10px"><button class="sp addset" data-ex="${id}">+ série</button><button class="sp rmset" data-ex="${id}" ${sets.length > 1 ? '' : 'disabled'}>− série</button><button class="sp info" data-ex="${id}">Fiche</button></div></div></article>`;
  return h;
}
function runCard(wi) {
  const four = wi.w % 2 === 1;
  const desc = D.type === 'EZ' ? '30 à 45 min à allure conversation (65–75 % de la FC max).'
    : wi.deload ? 'Semaine de deload : remplace par un footing facile.'
    : four ? '<b>4×4 norvégien</b> : 10 min d\'échauffement, 4 × 4 min à 90–95 % FC max, 3 min de trot entre chaque.'
    : '<b>Rounds de boxe</b> : 10 min d\'échauffement, 6 × 3 min dur (88–92 %), 1 min de récup marchée.';
  return `<div class="card"><p style="margin-top:0">${desc}</p>${zonesHtml()}
    <div class="grid2" style="margin-top:12px"><label class="f">Durée (min)<input id="rmin" inputmode="numeric"></label><label class="f">Distance (km)<input id="rkm" inputmode="decimal"></label><label class="f">FC moyenne<input id="rhrv" inputmode="numeric"></label><label class="f">Note<input id="rnote" maxlength="200" placeholder="sensations, parcours…"></label></div>
    <button class="pri wide" id="saveRun" style="margin-top:12px">Enregistrer la course</button></div>`;
}
function historyHtml() {
  const items = [...S.sessions.map(x => ({d: x.date, t: SESS[x.type].n, id: 's' + x.id, x: Object.values(x.sets).flat().length + ' séries'})),
    ...S.runs.map(x => ({d: x.date, t: SESS[x.kind].n, id: 'r' + x.id, x: `${x.min} min${x.km ? ' · ' + nf(+x.km) + ' km' : ''}`}))].sort((a, b) => b.d.localeCompare(a.d)).slice(0, 10);
  return `<h2>Historique</h2>` + (items.length ? `<div class="card" style="padding:4px 14px"><ul class="hist">${items.map(l => `<li><span class="sm" style="width:92px">${fmtD(l.d)}</span><b class="sp">${esc(l.t)}</b><span class="sm">${esc(l.x)}</span><button class="del" data-id="${l.id}">Supprimer</button></li>`).join('')}</ul></div>` : `<div class="card empty">Rien encore. Ta première séance apparaîtra ici.</div>`);
}

/* ---------- exercices (bibliothèque hors ligne) ---------- */
function renderExos() {
  const ids = Object.keys(EX).filter(id => (!libMus || Object.keys(EX[id].m)[0] === libMus) && (!libFilter || (EX[id].n + ' ' + VARIANTS[id].map(varName).join(' ')).toLowerCase().includes(libFilter.toLowerCase())));
  const where = id => Object.entries(SESS).filter(([, s]) => s.it && s.it.some(x => x[1] === id)).map(([, s]) => s.n).join(', ');
  $('#v-exos').innerHTML = `<input id="q" type="search" placeholder="Chercher un exercice…" value="${esc(libFilter)}" aria-label="Chercher">
    <div class="chips" style="margin:10px 0"><button class="chip ${!libMus ? 'on' : ''}" data-mus="">Tous</button>${Object.entries(MUS).map(([k, n]) => `<button class="chip ${libMus === k ? 'on' : ''}" data-mus="${k}">${n}</button>`).join('')}</div>
    <p class="sm">${ids.length} exercices du programme, chacun avec 2 variantes. Photos disponibles hors ligne.</p>
    <div class="lib">${ids.map(id => `<button data-info="${id}"><img src="${img(mainLib(id))}" alt="" loading="lazy"><span>${esc(EX[id].n)}<small>${esc(where(id))}</small></span></button>`).join('') || '<p class="empty">Aucun résultat.</p>'}</div>`;
}
function infoSheet(id, focus) {
  const e = EX[id], cur = focus || mainLib(id), l = LIB[cur];
  sheet(`<div class="row"><h2 class="sp" style="margin:0">${esc(cur === mainLib(id) ? e.n : varName(cur))}</h2><button id="closeSheet" aria-label="Fermer">✕</button></div>
    <p class="sm">${Object.keys(e.m).map(m => MUS[m]).join(' · ')} · ${e.rr[0]}–${e.rr[1]} reps · repos ${e.rest} s</p>${anim(cur)}
    <h3 style="margin-top:14px">Points clés</h3><ul class="cues">${e.c.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
    <h3>Variantes</h3><div class="vars lib">${VARIANTS[id].map(x => `<button data-info="${id}" data-focus="${x}" style="${x === cur ? 'border-color:var(--red)' : ''}"><img src="${img(x)}" alt="" loading="lazy"><span>${esc(varName(x))}</span></button>`).join('')}</div>
    ${l ? `<details style="margin-top:14px"><summary>Instructions détaillées (anglais)</summary><ol class="sm">${l.instructions.map(s => `<li>${esc(s)}</li>`).join('')}</ol></details>` : ''}`);
}

/* ---------- progrès ---------- */
const charts = [];
function renderProgres() {
  const ws = St.mondayOf(new Date()), done = St.weekVolume(S, ws), planned = St.plannedVolume(), mx = 22;
  const wkS = S.sessions.filter(x => x.date >= ws).length, wkR = S.runs.filter(x => x.date >= ws).length;
  const recs = St.records(S), used = Object.keys(recs);
  if (!used.includes(selEx) && used.length) selEx = used[0];
  $('#v-progres').innerHTML = `<div class="kpis"><div class="kpi"><b>${wkS}/4</b><span>séances muscu</span></div><div class="kpi"><b>${wkR}/2</b><span>courses</span></div><div class="kpi"><b>${S.sessions.length}</b><span>séances au total</span></div></div>
    <div class="card"><h3>Séries par muscle cette semaine</h3><p class="sm">Rouge : fait depuis lundi · trait bleu : prévu · zone verte : cible.</p>
    ${Object.keys(MUS).map(m => { const [a, b] = TARGET[m]; return `<div class="vol"><span>${MUS[m]}</span><div class="track"><i style="left:${a / mx * 100}%;width:${(b - a) / mx * 100}%"></i><b style="width:${Math.min(100, (planned[m] || 0) / mx * 100)}%"></b><u style="width:${Math.min(100, (done[m] || 0) / mx * 100)}%"></u></div><span class="num">${nf(done[m] || 0)} / ${nf(planned[m] || 0)}</span></div>`; }).join('')}</div>
    <div class="card"><h3>1RM estimé</h3><select id="selEx" style="margin-top:10px">${Object.keys(EX).map(id => `<option value="${id}" ${id === selEx ? 'selected' : ''}>${esc(EX[id].n)}</option>`).join('')}</select>
    <div class="fig" id="e1fig"><svg></svg></div><p class="sm">Formule d'Epley : charge × (1 + reps/30). ±10 % : regarde la tendance, pas le chiffre exact.</p></div>
    <div class="card"><h3>Records</h3>${used.length ? `<div class="scroll"><table><thead><tr><th>Exercice</th><th class="n">Meilleure série</th><th class="n">1RM est.</th></tr></thead><tbody>${used.sort((a, b) => recs[b].v - recs[a].v).map(id => `<tr><td>${esc(EX[id].n)}<div class="sm">${fmtD(recs[id].d)}</div></td><td class="n">${nf(+recs[id].w)} kg × ${esc(recs[id].r)}</td><td class="n"><b>${nf(recs[id].v, 0)} kg</b></td></tr>`).join('')}</tbody></table></div>` : `<div class="empty">Tes records apparaîtront après ta première séance.</div>`}</div>`;
  const pts = St.sortedSessions(S).reverse().map(s => { const st = (s.sets[selEx] || []).filter(x => x.done && +x.r > 0); return st.length ? {d: s.date, v: Math.max(...st.map(x => St.e1(x.w, x.r)))} : null; }).filter(Boolean);
  lineChart($('#e1fig'), pts);
}
function lineChart(fig, pts, extra) {
  const svg = fig.querySelector('svg');
  const draw = () => {
    const W = svg.clientWidth, H = svg.clientHeight, P = {l: 40, r: 10, t: 12, b: 26};
    if (!W) return;
    if (pts.length < 2) { svg.innerHTML = `<text x="${W / 2}" y="${H / 2}" text-anchor="middle" fill="currentColor" opacity=".55" font-size="15">${pts.length ? 'Encore une séance et la courbe apparaît' : 'Pas encore de données'}</text>`; return; }
    const vs = pts.map(p => p.v).concat(extra ? extra.map(p => p.v) : []);
    let lo = Math.min(...vs), hi = Math.max(...vs); const pad = (hi - lo) * .15 || 2; lo -= pad; hi += pad;
    const t0 = +pd(pts[0].d), t1 = +pd(pts[pts.length - 1].d);
    const X = d => P.l + (+pd(d) - t0) / Math.max(1, t1 - t0) * (W - P.l - P.r), Y = v => P.t + (hi - v) / (hi - lo) * (H - P.t - P.b);
    const path = a => a.map((p, i) => (i ? 'L' : 'M') + X(p.d).toFixed(1) + ' ' + Y(p.v).toFixed(1)).join('');
    svg.innerHTML = [lo, (lo + hi) / 2, hi].map(v => `<line x1="${P.l}" x2="${W - P.r}" y1="${Y(v)}" y2="${Y(v)}" stroke="currentColor" opacity=".12"/><text x="${P.l - 6}" y="${Y(v) + 4}" text-anchor="end" font-size="12" fill="currentColor" opacity=".6">${nf(v, 0)}</text>`).join('')
      + `<text x="${P.l}" y="${H - 6}" font-size="12" fill="currentColor" opacity=".6">${fmtD(pts[0].d)}</text><text x="${W - P.r}" y="${H - 6}" text-anchor="end" font-size="12" fill="currentColor" opacity=".6">${fmtD(pts[pts.length - 1].d)}</text>`
      + (extra && extra.length > 1 ? `<path d="${path(extra)}" fill="none" stroke="#e23b2e" stroke-width="3"/>` : '')
      + `<path d="${path(pts)}" fill="none" stroke="#2550c4" stroke-width="${extra ? 1.5 : 3}" opacity="${extra ? .7 : 1}"/>` + pts.map(p => `<circle cx="${X(p.d)}" cy="${Y(p.v)}" r="3.5" fill="#2550c4"/>`).join('');
  };
  const ro = new ResizeObserver(draw); ro.observe(svg); charts.push(ro);
}

/* ---------- poids ---------- */
function renderPoids() {
  const ws = S.weights.slice().sort((a, b) => a.date.localeCompare(b.date)), lastKg = ws.length ? +ws[ws.length - 1].kg : 80;
  const avg = a => a.reduce((x, y) => x + y, 0) / a.length, t = pd(today());
  const win = (a, b) => ws.filter(x => { const dd = (t - pd(x.date)) / 864e5; return dd >= a && dd < b; }).map(x => +x.kg);
  const w1 = win(0, 7), w2 = win(7, 14);
  let trend = '', adv = 'Pèse-toi 3 à 7 fois par semaine, le matin à jeun. Le conseil apparaît après deux semaines de mesures.';
  if (w1.length && w2.length) { const d = avg(w1) - avg(w2), pct = d / avg(w2) * 100; trend = `${d >= 0 ? '+' : ''}${nf(d, 2)} kg/sem`;
    adv = pct < 0.2 ? 'Prise trop lente : ajoute ~150 kcal par jour.' : pct > 0.5 ? 'Prise trop rapide : retire ~150 kcal par jour pour limiter le gras.' : 'Rythme idéal pour une prise de muscle propre. Ne change rien.'; }
  const ma = ws.map(x => ({d: x.date, v: avg(ws.filter(y => { const dd = (pd(x.date) - pd(y.date)) / 864e5; return dd >= 0 && dd < 7; }).map(y => +y.kg))}));
  $('#v-poids').innerHTML = `<div class="card"><div class="row" style="align-items:flex-end"><div class="sp"><span class="cond" style="font-size:44px">${ws.length ? nf(lastKg) + ' kg' : '—'}</span><div class="sm">${trend ? 'Tendance ' + trend : 'Aucune tendance encore'}</div></div></div><p style="margin-bottom:0">${adv}</p></div>
    <div class="card"><div class="grid2"><label class="f">Date<input type="date" id="wd" value="${today()}"></label><label class="f">Poids (kg)<input id="wk" inputmode="decimal" placeholder="${nf(lastKg)}"></label></div><button class="pri wide" id="saveW" style="margin-top:10px">Ajouter la pesée</button></div>
    <div class="card"><h3>Courbe</h3><div class="fig" id="wfig"><svg></svg></div><p class="sm">Bleu : pesées · rouge : moyenne sur 7 jours.</p></div>
    <div class="card"><h3>Cibles de prise de muscle</h3><table><tbody>
      <tr><td>Rythme de prise</td><td class="n"><b>${nf(lastKg * .0025)}–${nf(lastKg * .005)} kg/sem</b></td></tr><tr><td>Surplus</td><td class="n"><b>+200 à 350 kcal/j</b></td></tr>
      <tr><td>Protéines</td><td class="n"><b>${Math.round(lastKg * 1.6)}–${Math.round(lastKg * 2.2)} g/j</b></td></tr><tr><td>Par repas (×4)</td><td class="n">${Math.round(lastKg * .4)}–${Math.round(lastKg * .55)} g</td></tr></tbody></table>
      <p class="sm">Le bénéfice des protéines plafonne vers 1,6 g/kg. Rythme et surplus : repères de coach, moins solides que le reste du programme. Ajuste avec la tendance.</p></div>
    ${ws.length ? `<div class="card" style="padding:4px 14px"><ul class="hist">${ws.slice().reverse().slice(0, 14).map(x => `<li><span class="sp">${fmtD(x.date)}</span><b class="num">${nf(+x.kg)} kg</b><button class="delw" data-d="${x.date}">Supprimer</button></li>`).join('')}</ul></div>` : ''}`;
  lineChart($('#wfig'), ws.map(x => ({d: x.date, v: +x.kg})), ma);
}

/* ---------- plus : plan, zones, outils, sauvegarde ---------- */
function hrMax() { const s = S.settings; return +s.hrm || (+s.age ? Math.round(208 - 0.7 * s.age) : 0); }
function zonesHtml() {
  const M = hrMax(), R = +S.settings.rhr;
  if (!M) return `<p class="sm">Renseigne ton âge dans Plus pour voir tes zones cardio.</p>`;
  const z = (a, b) => R ? `${Math.round(R + a * (M - R))}–${Math.round(R + b * (M - R))}` : `${Math.round(a * M)}–${Math.round(b * M)}`;
  return `<table><tbody><tr><td>Facile</td><td class="n"><b>${z(.65, .75)} bpm</b></td></tr><tr><td>Rounds de boxe</td><td class="n"><b>${z(.88, .92)} bpm</b></td></tr><tr><td>4×4 norvégien</td><td class="n"><b>${z(.9, .95)} bpm</b></td></tr></tbody></table><p class="sm">FC max ${+S.settings.hrm ? 'mesurée' : 'estimée (208 − 0,7 × âge, ±10 bpm)'} : ${M} bpm${R ? ' · Karvonen avec ta FC de repos' : ''}.</p>`;
}
function renderPlus() {
  const s = S.settings;
  $('#v-plus').innerHTML = `<h2 style="margin-top:4px">La semaine</h2><div class="card scroll"><table><tbody>
    ${[[1,'Lundi'],[2,'Mardi'],[3,'Mercredi'],[4,'Jeudi'],[5,'Vendredi'],[6,'Samedi'],[0,'Dimanche']].map(([d, n]) => `<tr><td>${n}</td><td><b>${SESS[PLAN[d]].n}</b></td><td class="sm">${esc(SESS[PLAN[d]].f)}</td></tr>`).join('')}</tbody></table>
    <p class="sm">Jours décalés ? Choisis la séance dans l'onglet Séance. Muscu et course le même jour : muscu d'abord, 3 à 6 h d'écart.</p></div>
    <h2>Le cycle de 6 semaines</h2><div class="card"><table><tbody>${WEEKS.map((w, i) => `<tr><td>Sem. ${i + 1}</td><td><b>${w.rir} RIR</b></td><td class="sm">${esc(w.note)}</td></tr>`).join('')}</tbody></table>
    <label class="f" style="margin-top:10px">Début du cycle<input type="date" id="cstart" value="${esc(s.start)}"></label></div>
    <h2>Les règles</h2><div class="card"><ul class="cues">
      <li><b>Double progression</b> : même charge tant que toutes les séries n'atteignent pas le haut de la fourchette, puis +2,5 kg (haut, machines), +5 kg (bas, barre), +2 kg (haltères). L'app te le propose.</li>
      <li><b>Proximité de l'échec</b> : le levier n°1. Polyarticulaires à 1–3 reps de l'échec, isolation à 0–1.</li>
      <li><b>Repos</b> : 2 min sur les gros mouvements, 60–90 s ailleurs. En superset (A1/A2) : 30 s puis l'autre exercice.</li>
      <li><b>Amplitude</b> : cherche l'étirement, pause en bas sur mollets, curl incliné, extensions.</li>
      <li><b>Volume</b> : 16–20 séries/sem. pour pecs, dos, épaules ; 10–16 ailleurs. Une série indirecte compte pour une demi-série.</li>
      <li><b>Durée</b> : 1h15–1h30. Évite les 2 h, les dernières séries perdent en qualité.</li></ul></div>
    <h2>Zones cardio</h2><div class="card"><div class="grid2"><label class="f">Âge<input id="age" inputmode="numeric" value="${esc(s.age)}"></label><label class="f">FC repos<input id="rhr" inputmode="numeric" value="${esc(s.rhr)}" placeholder="ex. 58"></label><label class="f">FC max mesurée<input id="hrm" inputmode="numeric" value="${esc(s.hrm)}" placeholder="optionnel"></label></div>
      <button class="wide" id="saveHr" style="margin-top:10px">Enregistrer</button><div style="margin-top:10px">${zonesHtml()}</div></div>
    <h2>Disques</h2><div class="card"><div class="grid2"><label class="f">Charge totale (kg)<input id="pl" inputmode="decimal" value="80"></label><label class="f">Barre<select id="bar"><option value="20">20 kg</option><option value="15">15 kg</option><option value="10">10 kg</option></select></label></div><p class="cond" id="plates" style="font-size:22px;margin:12px 0 0"></p></div>
    <h2>Sauvegarde</h2><div class="card"><p style="margin-top:0">Tout est stocké sur ce téléphone, sans compte ni serveur. Exporte régulièrement un fichier de sauvegarde${S.lastBackup ? ` (dernière : ${new Date(S.lastBackup).toLocaleDateString('fr-FR')})` : ''}.</p>
      <div class="grid2"><button class="pri" id="expF">Télécharger la sauvegarde</button><button id="expC">Copier (JSON)</button></div>
      <label class="f" style="margin-top:12px">Restaurer depuis un fichier<input type="file" id="impF" accept="application/json,.json"></label>
      <details style="margin-top:10px"><summary class="sm">Coller un JSON (ex. depuis l'ancienne page claude.ai)</summary><textarea id="imp" rows="3" style="margin-top:8px"></textarea><button id="impB" style="margin-top:8px">Importer</button></details></div>
    <h2>Installer sur le téléphone</h2><div class="card"><ul class="cues"><li><b>iPhone</b> : ouvre la page dans Safari → bouton Partager → « Sur l'écran d'accueil ».</li><li><b>Android</b> : Chrome → menu ⋮ → « Installer l'application ».</li><li>Une fois ouverte une fois en ligne, l'app et les ${Object.keys(LIB).length} exemples marchent sans réseau.</li></ul>
      <p class="sm" id="swState">Version ${VERSION}</p></div>
    <h2>Sources</h2><div class="card"><ul class="sm">
      <li><a href="https://sportrxiv.org/index.php/server/preprint/view/460">Pelland et al. — volume et fréquence</a></li><li><a href="https://www.frontiersin.org/articles/10.3389/fspor.2024.1429789/full">Singer et al. 2024 — temps de repos</a></li>
      <li><a href="https://peerj.com/articles/16777">Coleman et al. 2024 — deload</a></li><li><a href="https://www.strongerbyscience.com/stretch-mediated-hypertrophy/">Hypertrophie en étirement</a></li>
      <li><a href="https://link.springer.com/doi/10.1007/s40279-022-01688-x">Schumann et al. 2022 — muscu + endurance</a></li><li><a href="https://pubmed.ncbi.nlm.nih.gov/17414804/">Helgerud et al. 2007 — 4×4</a></li>
      <li><a href="https://pubmed.ncbi.nlm.nih.gov/28698222/">Morton et al. 2018 — protéines</a></li><li><a href="https://github.com/yuhonas/free-exercise-db">Images : free-exercise-db (domaine public)</a></li></ul></div>`;
  plates();
  if ('serviceWorker' in navigator) navigator.serviceWorker.getRegistration().then(r => { const el = $('#swState'); if (el) el.textContent = `Version ${VERSION} · ${r && r.active ? 'disponible hors ligne ✓' : 'mode hors ligne en cours d\'installation…'}`; });
}
function plates() {
  const el = $('#plates'); if (!el) return;
  const tot = parseFloat(($('#pl').value || '').replace(',', '.')), bar = +$('#bar').value;
  if (!(tot > bar)) { el.textContent = tot === bar ? 'Barre seule' : '—'; return; }
  let side = (tot - bar) / 2; const out = [];
  for (const p of [25, 20, 15, 10, 5, 2.5, 1.25]) while (side >= p - 1e-9) { out.push(p); side -= p; }
  el.textContent = 'Par côté : ' + out.map(p => nf(p, 2)).join(' + ') + (side > 0.01 ? ` (reste ${nf(side, 2)} kg)` : '');
}

/* ---------- navigation ---------- */
const VIEWS = ['seance', 'exos', 'progres', 'poids', 'plus'];
const cur = () => { const h = location.hash.slice(1); return VIEWS.includes(h) ? h : 'seance'; };
function render() {
  charts.splice(0).forEach(r => r.disconnect());
  const v = cur();
  for (const x of VIEWS) $('#v-' + x).classList.toggle('on', x === v);
  for (const a of document.querySelectorAll('#tabs a')) a.classList.toggle('on', a.getAttribute('href') === '#' + v);
  renderTop(v);
  ({seance: renderSeance, exos: renderExos, progres: renderProgres, poids: renderPoids, plus: renderPlus})[v]();
}
addEventListener('hashchange', () => { render(); scrollTo(0, 0); });

/* ---------- minuteur de repos ---------- */
let tEnd = 0, tDur = 1, tInt = null, actx = null, wake = null;
const C = 163.4;
function beep() { try { if (!actx) return; for (const [f, at] of [[880, 0], [1175, .18]]) { const o = actx.createOscillator(), g = actx.createGain(); o.frequency.value = f; o.connect(g); g.connect(actx.destination); g.gain.setValueAtTime(.3, actx.currentTime + at); g.gain.exponentialRampToValueAtTime(.001, actx.currentTime + at + .35); o.start(actx.currentTime + at); o.stop(actx.currentTime + at + .4); } } catch (e) {} }
function startTimer(sec, label) { tDur = sec; tEnd = Date.now() + sec * 1000; $('#tl').textContent = label; $('#timer').classList.add('on'); clearInterval(tInt); tick(); tInt = setInterval(tick, 250); }
function tick() {
  const left = Math.max(0, (tEnd - Date.now()) / 1000), s = Math.ceil(left);
  $('#tt').textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  $('#tring').setAttribute('stroke-dashoffset', (C * (1 - left / tDur)).toFixed(1));
  if (left <= 0) { clearInterval(tInt); beep(); haptic([250, 120, 250]); $('#tl').textContent = 'Go, série suivante !'; setTimeout(() => { if (Date.now() >= tEnd) $('#timer').classList.remove('on'); }, 6000); }
}
function stopTimer() { clearInterval(tInt); $('#timer').classList.remove('on'); }
$('#tplus').addEventListener('click', () => { tEnd += 15000; tDur += 15; clearInterval(tInt); tick(); tInt = setInterval(tick, 250); });
$('#tminus').addEventListener('click', () => { tEnd = Math.max(Date.now(), tEnd - 15000); tick(); });
$('#tstop').addEventListener('click', stopTimer);
async function keepAwake() { try { if ('wakeLock' in navigator && !wake) { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); } } catch (e) {} }
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && D && D.start) keepAwake(); });

/* ---------- actions ---------- */
function setFromRow(row) { const x = D.sets[row.dataset.ex][+row.dataset.i]; x.w = row.querySelector('[data-f=w]').value.replace(',', '.'); x.r = row.querySelector('[data-f=r]').value; return x; }
function finishSession() {
  const sets = {}, before = St.records(S);
  for (const [id, a] of Object.entries(D.sets)) { const d = a.filter(x => x.done).map(x => ({w: +x.w || 0, r: +x.r || 0, done: true})); if (d.length) sets[id] = d; }
  const variants = {}; for (const id in D.variants) if (sets[id]) variants[id] = D.variants[id];
  const mins = D.start ? Math.round((Date.now() - D.start) / 60000) : 0;
  S.sessions.push({id: Date.now(), date: D.date, type: D.type, sets, variants, min: mins});
  persist();
  const after = St.records(S), prs = Object.keys(sets).filter(id => after[id] && (!before[id] || after[id].v > before[id].v + 0.01));
  const n = Object.values(sets).flat().length, ton = Object.values(sets).flat().reduce((t, x) => t + x.w * x.r, 0);
  sheet(`<h2 style="margin-top:0">Séance terminée</h2><div class="sum"><div class="kpi"><b>${n}</b><span>séries</span></div><div class="kpi"><b>${nf(ton / 1000)} t</b><span>soulevées</span></div><div class="kpi"><b>${mins || '—'}</b><span>minutes</span></div></div>
    ${prs.length ? `<h3>Records battus</h3><ul class="cues">${prs.map(id => `<li><b>${esc(EX[id].n)}</b> : ${nf(after[id].v, 0)} kg en 1RM estimé</li>`).join('')}</ul>` : '<p class="mut">Pas de record cette fois : la régularité fait le reste.</p>'}
    <button class="pri wide" id="closeSheet" style="margin-top:12px">Fermer</button>`);
  stopTimer(); try { wake && wake.release(); } catch (e) {}
  D = St.newDraft(S, PLAN[new Date().getDay()] === D.type ? D.type : PLAN[new Date().getDay()]); St.saveDraft(D); openGroup = null; render(); scrollTo(0, 0);
}
function download(name, text) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], {type: 'application/json'})); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }

document.addEventListener('input', ev => {
  const el = ev.target, row = el.closest('.set');
  if (row && D) { setFromRow(row); St.saveDraft(D); }
  if (el.id === 'q') { libFilter = el.value; const pos = el.selectionStart; renderExos(); const q = $('#q'); q.focus(); q.setSelectionRange(pos, pos); }
  if (el.id === 'pl') plates();
});
document.addEventListener('change', async ev => {
  const el = ev.target;
  if (el.id === 'pick') { D = St.newDraft(S, el.value, D ? D.date : today()); St.saveDraft(D); openGroup = null; render(); }
  else if (el.id === 'ddate' && D) { D.date = el.value || today(); St.saveDraft(D); render(); }
  else if (el.id === 'selEx') { selEx = el.value; render(); }
  else if (el.id === 'bar') plates();
  else if (el.id === 'cstart') { S.settings.start = el.value || St.mondayOf(new Date()); persist('Début du cycle enregistré'); render(); }
  else if (el.id === 'impF' && el.files[0]) { try { S = St.importJSON(await el.files[0].text()); persist('Données restaurées'); render(); } catch (e) { toast('Fichier invalide'); } }
});
document.addEventListener('click', ev => {
  const b = ev.target.closest('button'); if (!b) { if (ev.target.id === 'sheet') closeSheet(); return; }
  if (b.id === 'closeSheet') return closeSheet();
  if (b.classList.contains('day')) { D = St.newDraft(S, b.dataset.ty, b.dataset.d); St.saveDraft(D); openGroup = null; location.hash === '#seance' || !location.hash ? render() : (location.hash = 'seance'); return; }
  if (b.classList.contains('exh')) { openGroup = openGroup === b.dataset.g ? '' : b.dataset.g; render(); const a = document.querySelector(`.exh[data-g="${b.dataset.g}"]`); a && a.scrollIntoView({block: 'start', behavior: 'smooth'}); return; }
  if (b.dataset.st) {
    const row = b.closest('.set'), id = row.dataset.ex, inp = row.querySelector(`[data-f=${b.dataset.st}]`);
    const stepv = b.dataset.st === 'w' ? INC[EX[id].k] : 1, v = parseFloat((inp.value || '0').replace(',', '.')) || 0;
    inp.value = Math.max(0, Math.round((v + stepv * +b.dataset.d) * 100) / 100); setFromRow(row); St.saveDraft(D); haptic(8); return;
  }
  if (b.classList.contains('chk')) {
    try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); actx.resume && actx.resume(); } catch (e) {}
    const row = b.closest('.set'), id = row.dataset.ex, x = setFromRow(row);
    if (!x.done && !(+x.r > 0)) { toast('Indique le nombre de reps'); row.querySelector('[data-f=r]').focus(); return; }
    x.done = !x.done; if (!D.start) { D.start = Date.now(); } keepAwake(); St.saveDraft(D); haptic(20);
    if (x.done) {
      const lab = row.dataset.lab, pair = SESS[D.type].it.find(it => it[0] === lab.replace('1', '2'));
      if (lab.endsWith('1') && pair) startTimer(30, 'Enchaîne ' + EX[pair[1]].n); else startTimer(EX[id].rest, 'Repos · ' + EX[id].n);
      const g = groupsOf(D.type).find(gr => gr.k === lab[0]);
      if (g.it.every(([, i]) => D.sets[i].every(s => s.done))) { openGroup = firstOpenGroup(); }
    }
    render(); return;
  }
  if (b.classList.contains('addset')) { const a = D.sets[b.dataset.ex], l = a[a.length - 1]; a.push({w: l ? l.w : '', r: '', done: false}); St.saveDraft(D); render(); return; }
  if (b.classList.contains('rmset')) { const a = D.sets[b.dataset.ex]; if (a.length > 1) a.pop(); St.saveDraft(D); render(); return; }
  if (b.dataset.var) { const id = b.dataset.ex; if (b.dataset.var === mainLib(id)) delete D.variants[id]; else D.variants[id] = b.dataset.var; St.saveDraft(D); render(); return; }
  if (b.classList.contains('info')) return infoSheet(b.dataset.ex);
  if (b.dataset.info) return infoSheet(b.dataset.info, b.dataset.focus);
  if (b.dataset.mus !== undefined) { libMus = b.dataset.mus; renderExos(); return; }
  if (b.id === 'finish') return finishSession();
  if (b.id === 'reset') { D = St.newDraft(S, D.type, D.date); St.saveDraft(D); openGroup = null; stopTimer(); render(); return; }
  if (b.id === 'saveRun') {
    const min = +$('#rmin').value; if (!min) { toast('Indique au moins la durée'); return; }
    S.runs.push({id: Date.now(), date: D.date, kind: D.type, min, km: $('#rkm').value.replace(',', '.'), hr: $('#rhrv').value, note: $('#rnote').value.slice(0, 200)});
    persist('Course enregistrée'); render(); return;
  }
  if (b.classList.contains('del') || b.classList.contains('delw')) {
    if (!b.dataset.arm) { b.dataset.arm = 1; b.textContent = 'Confirmer ?'; b.classList.add('pri'); setTimeout(() => { if (b.isConnected) { delete b.dataset.arm; b.textContent = 'Supprimer'; b.classList.remove('pri'); } }, 3000); return; }
    if (b.classList.contains('delw')) S.weights = S.weights.filter(x => x.date !== b.dataset.d);
    else { const id = +b.dataset.id.slice(1); if (b.dataset.id[0] === 's') S.sessions = S.sessions.filter(x => x.id !== id); else S.runs = S.runs.filter(x => x.id !== id); }
    persist('Supprimé'); render(); return;
  }
  if (b.id === 'saveW') {
    const kg = parseFloat(($('#wk').value || '').replace(',', '.')), d = $('#wd').value || today();
    if (!(kg > 30 && kg < 250)) { toast('Poids invalide'); return; }
    S.weights = S.weights.filter(x => x.date !== d); S.weights.push({date: d, kg}); persist('Pesée enregistrée'); render(); return;
  }
  if (b.id === 'saveHr') { Object.assign(S.settings, {age: $('#age').value, rhr: $('#rhr').value, hrm: $('#hrm').value}); persist('Zones enregistrées'); render(); return; }
  if (b.id === 'expF') { download(`muscu-sauvegarde-${today()}.json`, JSON.stringify(S, null, 1)); S.lastBackup = Date.now(); persist('Sauvegarde téléchargée'); return; }
  if (b.id === 'expC') { navigator.clipboard.writeText(JSON.stringify(S)).then(() => { S.lastBackup = Date.now(); persist('Copié'); }, () => toast('Copie refusée : utilise le téléchargement')); return; }
  if (b.id === 'impB') { try { S = St.importJSON($('#imp').value); persist('Données importées'); render(); } catch (e) { toast('JSON invalide'); } }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

/* ---------- démarrage ---------- */
render();
if ('serviceWorker' in navigator) {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').then(reg => {
    reg.addEventListener('updatefound', () => { const w = reg.installing; w && w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) toast('Mise à jour prête : relance l\'app'); }); });
  }).catch(() => {}));
}
try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) {}
