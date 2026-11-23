(() => {
"use strict";
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch (e) { return d } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) {} }
};
const pad = n => String(n).padStart(2, "0");
const dkey = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const today = () => dkey(new Date());
const fmt = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ":" + pad(s % 60) };
const median = a => { const b = [...a].sort((x, y) => x - y); const m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2 };
const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
const sd = a => { const m = mean(a); return Math.sqrt(mean(a.map(x => (x - m) ** 2))) };
const pct = (a, p) => { const b = [...a].sort((x, y) => x - y); return b[Math.min(b.length - 1, Math.max(0, Math.round(p * (b.length - 1))))] };
const pick = a => a[Math.floor(Math.random() * a.length)];
const nowS = () => performance.now() / 1000;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const f1 = v => (Math.round(v * 10) / 10).toString().replace(".", ",");
const { CHANT, LISTS, REFLEXES, MINICOURS, SPEECH_TEXT, EMO_PHRASE, PARLER, PARLER_WARM, PARLER_TEXTS } = window;
const REWRITES = [];

/* ============ Notes ============ */
const NOMS = ["Do", "Do♯", "Ré", "Ré♯", "Mi", "Fa", "Fa♯", "Sol", "Sol♯", "La", "La♯", "Si"];
const SCI = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
const m2f = m => 440 * Math.pow(2, (m - 69) / 12);
const f2m = f => 69 + 12 * Math.log2(f / 440);
const pc = m => ((Math.round(m) % 12) + 12) % 12;
const nom = m => NOMS[pc(m)] + (Math.floor(Math.round(m) / 12) - 2);   // La3 = 440 Hz
const sci = m => SCI[pc(m)] + (Math.floor(Math.round(m) / 12) - 1);
const isBlack = m => [1, 3, 6, 8, 10].includes(pc(m));

/* ============ État ============ */
const legacy = store.get("av3", null);
const S = Object.assign({
  centre: legacy && legacy.centre ? legacy.centre : null,
  c: { mod: 0, sess: 0 }, r: { mod: 0, sess: 0 }, v: { mod: 0, sess: 0 }, timbre: null, day: 0, missions: [], coursWeek: null, coursCount: 0,
  conf: [], notes: [], prep: {},
  m: { euh: [], doute: [], souffle: [], stab: [], onset: [], dyn: [], speak: [], range: null, passage: null }
}, store.get("voix1", {}));
const save = () => store.set("voix1", S);
const centre = () => S.centre || 55;
const push = (k, v) => { S.m[k] = (S.m[k] || []).concat({ d: today(), v }).slice(-90); save() };
const last = k => { const a = S.m[k] || []; return a.length ? a[a.length - 1].v : null };
function markDone() { const l = store.get("voix1:log", {}); l[today()] = 1; store.set("voix1:log", l) }
function streak() { const l = store.get("voix1:log", {}); let n = 0; const d = new Date(); if (!l[dkey(d)]) d.setDate(d.getDate() - 1); while (l[dkey(d)]) { n++; d.setDate(d.getDate() - 1) } return n }

/* ============ Audio ============ */
const A = { ctx: null, stream: null, an: null, buf: null, on: false, muteUntil: 0, fn: new Set(), hist: [], raw: [], silent: 0 };
function ctx() { if (!A.ctx) { const K = window.AudioContext || window.webkitAudioContext; A.ctx = new K() } if (A.ctx.state === "suspended") A.ctx.resume(); return A.ctx }
let yinD = null;
function yin(buf, sr) {
  const len = buf.length, tauMin = Math.max(2, Math.floor(sr / 1100)), tauMax = Math.min(Math.floor(sr / 70), Math.floor(len / 2) - 1), W = len - tauMax - 1;
  if (!yinD || yinD.length < tauMax + 2) yinD = new Float32Array(tauMax + 2);
  const d = yinD;
  for (let tau = 1; tau <= tauMax; tau++) { let s = 0; for (let i = 0; i < W; i++) { const x = buf[i] - buf[i + tau]; s += x * x } d[tau] = s }
  let run = 0; for (let tau = 1; tau <= tauMax; tau++) { run += d[tau]; d[tau] = run > 0 ? d[tau] * tau / run : 1 }
  let tau = -1; for (let t = tauMin; t <= tauMax; t++) { if (d[t] < 0.15) { while (t + 1 <= tauMax && d[t + 1] < d[t]) t++; tau = t; break } }
  if (tau < 0) return null;
  let bt = tau; if (tau > 1 && tau < tauMax) { const a = d[tau - 1], b = d[tau], c = d[tau + 1], den = a + c - 2 * b; if (den) bt = tau + (a - c) / (2 * den) }
  return { f: sr / bt, p: 1 - d[tau] };
}
let micError = null;
const gUM = c => navigator.mediaDevices.getUserMedia(c);
async function startMic() {
  const c = ctx();
  if (A.on && A.stream && A.stream.getAudioTracks().some(t => t.readyState === "live")) return true;
  A.on = false;
  try {
    if (!window.isSecureContext) throw Object.assign(new Error("https"), { name: "Insecure" });
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw Object.assign(new Error("api"), { name: "NoApi" });
    try { A.stream = await gUM({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: true } }) }
    catch (e) { if (e.name === "OverconstrainedError" || e.name === "TypeError" || e.name === "NotReadableError") A.stream = await gUM({ audio: true }); else throw e }
  } catch (e) { micError = e; return false }
  try { await c.resume() } catch (e) {}
  const src = c.createMediaStreamSource(A.stream);
  A.an = c.createAnalyser(); A.an.fftSize = 2048; src.connect(A.an); A.buf = new Float32Array(2048); A.on = true; A.hist = [];
  A.stream.getAudioTracks().forEach(t => t.onended = () => { A.on = false });
  requestAnimationFrame(loop); return true;
}
function loop() {
  if (!A.on) return;
  A.an.getFloatTimeDomainData(A.buf);
  const t = nowS(); let rms = 0; for (let i = 0; i < A.buf.length; i++) rms += A.buf[i] * A.buf[i]; rms = Math.sqrt(rms / A.buf.length);
  let midi = null;
  if (t > A.muteUntil && rms > 0.003) { const r = yin(A.buf, A.ctx.sampleRate); if (r && r.p > 0.8 && r.f > 60 && r.f < 1200) { A.raw.push(f2m(r.f)); if (A.raw.length > 5) A.raw.shift(); midi = median(A.raw); A.silent = 0 } }
  if (midi === null && ++A.silent > 3) A.raw.length = 0;
  const s = { t, midi, rms }; A.hist.push(s); while (A.hist.length && t - A.hist[0].t > 10) A.hist.shift();
  A.fn.forEach(f => f(s));
  requestAnimationFrame(loop);
}
function playNote(m, dur = 1) {
  const c = ctx(), t = c.currentTime, o = c.createOscillator(), g = c.createGain();
  o.type = "triangle"; o.frequency.value = m2f(m);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.3, t + .03); g.gain.setValueAtTime(.3, t + dur - .1); g.gain.linearRampToValueAtTime(0, t + dur);
  o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + .05);
  A.muteUntil = nowS() + dur + .2; A.raw.length = 0;
  return new Promise(r => setTimeout(r, dur * 1000 + 150));
}
async function playMelody(notes, step, alive) { for (const m of notes) { if (alive && !alive()) return; await playNote(m, step) } }
function beep() { try { const c = ctx(), t = c.currentTime, o = c.createOscillator(), g = c.createGain(); o.frequency.value = 880; g.gain.setValueAtTime(.12, t); g.gain.exponentialRampToValueAtTime(.001, t + .3); o.connect(g).connect(c.destination); o.start(t); o.stop(t + .35) } catch (e) {} }
function say(text) {
  try {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = "fr-FR"; u.rate = 1.02;
    const v = speechSynthesis.getVoices().find(v => /^fr/i.test(v.lang)); if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch (e) {}
}
if ("speechSynthesis" in window) { try { speechSynthesis.getVoices() } catch (e) {} }

const inApp = /wv\)|FBAN|FBAV|Instagram|Line\/|WhatsApp|Snapchat/i.test(navigator.userAgent);
function micHelp(el, retry) {
  const box = document.createElement("div"); box.className = "warn";
  const name = micError && micError.name || "inconnu";
  const openOut = "Ouvre la page directement dans Chrome ou Safari, pas depuis un lien dans une appli.";
  let msg;
  if (window.top !== window.self) msg = "Cette page est affichée à l'intérieur d'une autre page, qui bloque le micro. " + openOut;
  else if (name === "Insecure") msg = "La page doit être ouverte en https.";
  else if (name === "NoApi") msg = "Ce navigateur ne donne pas accès au micro. " + openOut;
  else if (name === "NotFoundError" || name === "OverconstrainedError") msg = "Aucun micro trouvé sur cet appareil.";
  else if (name === "NotReadableError" || name === "AbortError") msg = "Le micro est utilisé par une autre appli. Ferme-la, recharge la page et réessaie.";
  else msg = "Le micro est refusé pour ce site." + (inApp ? " " + openOut : "") +
    "<br><b>Android</b> : icône à gauche de l'adresse → Autorisations → Micro → Autoriser." +
    "<br><b>iPhone</b> : « aA » dans la barre d'adresse → Réglages du site web → Micro → Autoriser.<br>Puis recharge la page.";
  box.innerHTML = "<b>Micro indisponible</b><span>" + msg + "</span><span class='xs muted mono'>" + name + "</span>";
  const b = document.createElement("button"); b.className = "btn sm"; b.textContent = "Réessayer"; b.onclick = () => { box.remove(); retry() };
  box.appendChild(b); el.prepend(box);
}

/* ============ Courbe ============ */
let colors = {};
function readColors() { const cs = getComputedStyle(document.documentElement); ["--card", "--fill", "--line", "--muted", "--ink", "--ok", "--near", "--off", "--accent", "--ok-soft"].forEach(k => colors[k] = cs.getPropertyValue(k).trim()) }
readColors();
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", readColors);
function fit(cv) { const r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1; const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr); if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h } return { w: r.width, h: r.height, dpr } }
const devColor = (c, tol) => { const a = Math.abs(c); return a <= tol ? colors["--ok"] : a <= tol * 2 ? colors["--near"] : colors["--off"] };
function drawRoll(cv, pts, o) {
  const { w, h, dpr } = fit(cv); if (!w) return; const g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, w, h);
  const lo = o.lo, hi = o.hi, lab = 40, lh = h / (hi - lo), y = m => h - ((m - lo) / (hi - lo)) * h;
  g.font = "11px ui-monospace, Menlo, monospace"; g.textBaseline = "middle";
  for (let m = Math.ceil(lo); m <= Math.floor(hi); m++) {
    const yy = y(m);
    g.strokeStyle = colors["--line"]; g.globalAlpha = isBlack(m) ? .35 : .8; g.lineWidth = pc(m) === 0 ? 1 : .5; g.beginPath(); g.moveTo(lab, yy); g.lineTo(w, yy); g.stroke(); g.globalAlpha = 1;
    if (!isBlack(m) && (lh >= 11 || pc(m) === 0)) { g.fillStyle = colors["--muted"]; g.fillText(nom(m), 8, yy) }
  }
  if (o.target != null) { const yy = y(o.target), band = lh * (o.tol / 50); g.fillStyle = colors["--ok-soft"]; g.fillRect(lab, yy - band, w - lab, band * 2); g.strokeStyle = colors["--ok"]; g.lineWidth = 1.5; g.beginPath(); g.moveTo(lab, yy); g.lineTo(w, yy); g.stroke() }
  const x = t => lab + ((t - o.t0) / (o.t1 - o.t0)) * (w - lab);
  g.lineWidth = 3; g.lineCap = "round"; let prev = null;
  for (const p of pts) {
    if (p.midi == null || p.midi < lo - 1 || p.midi > hi + 1 || p.t < o.t0) { prev = null; continue }
    const ref = o.target != null ? o.target : Math.round(p.midi), c = (p.midi - ref) * 100, X = x(p.t), Y = y(p.midi);
    g.strokeStyle = g.fillStyle = devColor(c, o.tol);
    if (prev && p.t - prev.t < 0.12) { g.beginPath(); g.moveTo(prev.X, prev.Y); g.lineTo(X, Y); g.stroke() } else { g.beginPath(); g.arc(X, Y, 1.6, 0, 7); g.fill() }
    prev = { t: p.t, X, Y };
  }
  if (o.empty) { g.fillStyle = colors["--muted"]; g.textAlign = "center"; g.font = "15px -apple-system, system-ui, sans-serif"; g.fillText(o.empty, lab + (w - lab) / 2, h / 2); g.textAlign = "left" }
}
function pitchWidget(el, opts = {}) {
  const tol = opts.tol || 25;
  el.insertAdjacentHTML("beforeend", `<div class="card pw"><div class="pw-top"><div><span class="pw-n">–</span><span class="pw-sci"></span></div><span class="pw-c muted">${A.on ? "J'écoute" : "Micro en attente"}</span></div><div class="needle"><span class="zone" style="left:${50 - tol}%;width:${2 * tol}%"></span><span class="mid"></span><span class="pin"></span></div><canvas class="roll"></canvas></div>`);
  const root = el.lastElementChild, cv = root.querySelector("canvas");
  const W = { target: opts.target ?? null, centre: centre(), tol };
  const draw = () => { const t = nowS(), c = W.target != null ? W.target : Math.round(W.centre), half = opts.half || 7; drawRoll(cv, A.hist, { lo: c - half, hi: c + half, t0: t - 7, t1: t, target: W.target, tol, empty: A.on ? null : "La courbe apparaîtra ici" }) };
  const f = s => {
    if (!root.isConnected) { A.fn.delete(f); return }
    if (s.midi != null) {
      const ref = W.target != null ? W.target : Math.round(s.midi), c = Math.round((s.midi - ref) * 100);
      root.querySelector(".pw-n").textContent = nom(s.midi); root.querySelector(".pw-sci").textContent = sci(s.midi);
      const pcEl = root.querySelector(".pw-c"); pcEl.classList.remove("muted");
      pcEl.textContent = W.target != null ? (Math.abs(c) <= tol ? "Juste" : c > 0 ? "Trop haut" : "Trop bas") : (c > 0 ? "+" : "") + c + " cents"; pcEl.style.color = devColor(c, tol);
      const pin = root.querySelector(".pin"); pin.style.left = (50 + Math.max(-50, Math.min(50, c))) + "%"; pin.style.background = devColor(c, tol);
      W.centre += (s.midi - W.centre) * 0.03;
    }
    draw();
  };
  A.fn.add(f); requestAnimationFrame(draw);
  return { set target(v) { W.target = v; draw() }, destroy() { A.fn.delete(f) } };
}

/* ============ Enregistrement ============ */
async function recordInto(onAudio) {
  if (typeof MediaRecorder === "undefined" || !(await startMic())) return null;
  const chunks = []; const mr = new MediaRecorder(A.stream);
  mr.ondataavailable = e => { if (e.data.size) chunks.push(e.data) };
  mr.onstop = () => onAudio(URL.createObjectURL(new Blob(chunks, { type: mr.mimeType || "audio/webm" })));
  mr.start(); return { stop() { if (mr.state === "recording") mr.stop() } };
}
function recorder(el, { max = 150, label = "Enregistrer" } = {}) {
  const box = document.createElement("div"); box.style.cssText = "display:flex;flex-direction:column;gap:8px";
  box.innerHTML = `<div class="row"><button class="btn pri">${label}</button><span class="mono small muted"></span></div><div></div>`;
  el.appendChild(box);
  const btn = box.querySelector("button"), ck = box.querySelector("span"), pl = box.lastElementChild;
  let r = null, iv = null, t0 = 0;
  btn.onclick = async () => {
    if (r) { r.stop(); r = null; clearInterval(iv); btn.textContent = "Refaire"; ck.textContent = ""; return }
    r = await recordInto(url => { pl.innerHTML = ""; const au = document.createElement("audio"); au.controls = true; au.src = url; pl.appendChild(au) });
    if (!r) { micHelp(el, () => btn.click()); return }
    t0 = nowS(); btn.textContent = "Arrêter";
    iv = setInterval(() => { const s = nowS() - t0; ck.textContent = "● " + fmt(s); if (s >= max) btn.click() }, 250);
  };
  return { stop() { if (r) { r.stop(); r = null; clearInterval(iv) } } };
}

/* ============ Moteur de séance ============ */
const R = { steps: [], i: 0, res: {}, alive: false, clean: [], tok: 0, kind: "" };
let wakeLock = null;
async function wake() { try { wakeLock = await navigator.wakeLock.request("screen") } catch (e) {} }
function cleanup() { R.alive = false; R.clean.forEach(f => { try { f() } catch (e) {} }); R.clean = []; try { speechSynthesis.cancel() } catch (e) {} }
const KICK = { chant: "Chanter", voix: "Parler", parole: "Communication", bilan: "Bilan" };
function startSeance(kind, steps) { R.kind = kind; R.steps = steps; R.i = 0; R.res = {}; location.hash = "seance"; renderStep(); wake() }
function renderStep() {
  cleanup(); R.alive = true; const tok = ++R.tok;
  const s = R.steps[R.i], n = R.steps.length;
  $("#sWhere").textContent = (R.i + 1) + " sur " + n + (s.min ? " · " + s.min : "");
  $("#sBar").style.width = (R.i / n * 100) + "%";
  $("#sKicker").className = "kicker " + (s.block || "");
  $("#sKicker").textContent = (KICK[s.block] || "") + (s.sub ? " · " + s.sub : "");
  $("#sTitle").textContent = s.t;
  const body = $("#sBody"); body.innerHTML = "";
  if (s.how) body.insertAdjacentHTML("beforeend", `<p class="prose">${s.how}</p>`);
  $("#sFoot").hidden = false; $("#sNext").textContent = R.i === n - 1 ? "Terminer" : "Suivant";
  const api = {
    alive: () => R.alive && R.tok === tok,
    on(fn) { A.fn.add(fn); R.clean.push(() => A.fn.delete(fn)) },
    off(fn) { A.fn.delete(fn) },
    onClean(fn) { R.clean.push(fn) },
    res: R.res
  };
  s.run(body, api);
  window.scrollTo({ top: 0 });
}
$("#sNext").onclick = () => { if (R.i >= R.steps.length - 1) finish(); else { R.i++; renderStep() } };
$("#sQuit").onclick = () => { cleanup(); location.hash = "" };
const tag = (o, block, min, sub) => Object.assign(o, { block, min, sub });

function timerBox(el, sec, api, onStart) {
  el.insertAdjacentHTML("beforeend", `<div class="card timer"><span class="clock">${fmt(sec)}</span><button class="btn pri">Démarrer</button></div>`);
  const box = el.lastElementChild, clk = box.querySelector(".clock"), b = box.querySelector("button");
  let left = sec, run = false, lastT = 0, iv = null;
  const tick = () => { if (!api.alive()) { clearInterval(iv); return } if (!run) return; const t = nowS(); left -= t - lastT; lastT = t; clk.textContent = fmt(left); if (left <= 0) { run = false; clearInterval(iv); iv = null; beep(); box.classList.add("end"); b.textContent = "Encore"; left = sec } };
  b.onclick = () => { run = !run; lastT = nowS(); box.classList.remove("end"); if (run) { b.textContent = "Pause"; if (!iv) iv = setInterval(tick, 250); if (onStart) onStart() } else b.textContent = "Reprendre" };
  api.onClean(() => clearInterval(iv));
}
const card = (el, html, cls = "") => { el.insertAdjacentHTML("beforeend", `<div class="card ${cls}">${html}</div>`); return el.lastElementChild };

/* ============ Exercices de chant ============ */
function baseNote(spec) {
  if (spec.base === "passage") return S.m.passage ? S.m.passage - 4 : centre() + 2;
  return centre() + (spec.base || 0);
}
function chipsHtml(ns) { return ns.map(m => `<span class="chip">${nom(m)}</span>`).join("") }

function exBreath() {
  return { t: "Le « sss » chronométré", how: "Inspire par le ventre et les côtes, puis expire sur un « sss » régulier, le plus longtemps possible, sans forcer à la fin. Appuie au début, puis quand tu n'as plus d'air. Trois essais.", run: (el, api) => {
    const c = card(el, `<div class="timer"><span class="clock">0,0 s</span><button class="btn pri">Je commence</button></div><p class="result muted">Objectif : 20 secondes réguliers.</p>`);
    const b = c.querySelector("button"), clk = c.querySelector(".clock"), res = c.querySelector(".result"); let on = false, t0 = 0, iv = null; const tries = [];
    b.onclick = () => {
      if (!on) { on = true; t0 = nowS(); b.textContent = "Plus d'air"; iv = setInterval(() => clk.textContent = f1(nowS() - t0) + " s", 100); return }
      on = false; clearInterval(iv); const s = nowS() - t0; tries.push(s); b.textContent = "Essai suivant";
      res.classList.remove("muted"); res.innerHTML = "Essais : " + tries.map(x => "<b>" + f1(x) + " s</b>").join(" · ") + (Math.max(...tries) >= 20 ? ". Excellent." : ". Objectif : 20 secondes.");
      push("souffle", +s.toFixed(1));
    };
    api.onClean(() => clearInterval(iv));
  } };
}

function exStable(spec) {
  const sec = spec.sec || 8, tol = spec.tol || 25;
  const VOW = ["i", "é", "a", "o", "ou"];
  const cueText = el => spec.cue === "vowels" ? VOW[Math.floor(el / 2) % VOW.length]
    : spec.cue === "messa" ? (el < sec * .15 ? "très doux" : el < sec * .5 ? "↗ plus fort" : el < sec * .6 ? "fort" : el < sec * .92 ? "↘ plus doux" : "très doux") : "";
  return { t: spec.t, how: spec.how, run: (el, api) => {
    const notes = () => spec.rel.map(r => centre() + r);
    const c = card(el, `<div class="chips">${chipsHtml(notes())}</div>${spec.cue ? '<p class="cue"></p>' : ""}<p class="say muted">La note est jouée, puis tu la tiens ${sec} secondes.</p><div class="row"><button class="btn pri go">Commencer</button><button class="btn again" disabled>Réécouter</button></div>`);
    const chipsEl = c.querySelector(".chips"), say_ = c.querySelector(".say"), go = c.querySelector(".go"), again = c.querySelector(".again"), cue = c.querySelector(".cue");
    const res = document.createElement("p"); res.className = "result";
    let w = null, cur = null;
    again.onclick = () => { if (cur != null) playNote(cur, 1.2) };
    go.onclick = async () => {
      if (!(await startMic())) { micHelp(el, () => go.click()); return }
      if (!w) { w = pitchWidget(el, { tol }); api.onClean(() => w.destroy()); el.appendChild(res) }
      go.disabled = true; again.disabled = false; res.textContent = ""; chipsEl.innerHTML = chipsHtml(notes());
      const ns = notes(), chips = [...chipsEl.children], out = [];
      for (let i = 0; i < ns.length; i++) {
        if (!api.alive()) return;
        cur = ns[i]; w.target = cur; chips.forEach(x => x.classList.remove("cur")); chips[i].classList.add("cur");
        say_.textContent = "Écoute…"; if (cue) cue.textContent = ""; await playNote(cur, 1.2); if (!api.alive()) return;
        say_.textContent = "À toi.";
        const r = await new Promise(done => {
          let start = null, n = 0, good = 0; const cents = [], dbs = []; const t0 = nowS();
          const f = s => {
            if (!api.alive()) { api.off(f); done(null); return }
            if (start == null) { if (s.midi != null) start = s.t; else { if (s.t - t0 > 8) { api.off(f); done({ pct: 0, sd: null, db: null }) } return } }
            const e = s.t - start; n++;
            if (s.midi != null) { const cc = (s.midi - cur) * 100; if (Math.abs(cc) <= tol) good++; if (Math.abs(cc) < 100) cents.push(cc); dbs.push(20 * Math.log10(s.rms + 1e-9)) }
            if (cue) cue.textContent = cueText(e);
            say_.textContent = fmt(sec - e) + " · " + Math.round(good / n * 100) + " % juste";
            if (e >= sec) { api.off(f); done({ pct: good / n * 100, sd: cents.length > 5 ? sd(cents) : null, db: dbs.length > 10 ? pct(dbs, .92) - pct(dbs, .08) : null }) }
          }; api.on(f);
        });
        if (!r) return;
        out.push(r); chips[i].classList.remove("cur"); chips[i].classList.add(r.pct >= 70 ? "ok" : "ko");
      }
      const P = mean(out.map(o => o.pct)), sds = out.map(o => o.sd).filter(x => x != null), dbs = out.map(o => o.db).filter(x => x != null);
      const SD = sds.length ? mean(sds) : null, DB = dbs.length ? mean(dbs) : null;
      if (cue) cue.textContent = ""; say_.textContent = "Terminé."; go.disabled = false; go.textContent = "Refaire"; w.target = null; cur = null; again.disabled = true;
      res.innerHTML = "Justesse <b>" + Math.round(P) + " %</b>" + (SD != null ? " · stabilité <b>±" + Math.round(SD) + " cents</b>" : "") + (spec.dyn && DB != null ? " · nuance <b>" + Math.round(DB) + " dB</b>" : "") + ". " +
        (spec.dyn ? (DB != null && DB >= 15 ? "Belle amplitude." : "Ose plus de contraste entre très doux et fort.") : SD != null && SD <= 12 ? "Note très stable." : "Vise une ligne plus droite sur la courbe.");
      if (SD != null) push("stab", Math.round(SD)); if (spec.dyn && DB != null) push("dyn", Math.round(DB));
    };
  } };
}

function exOnset(spec) {
  const n = spec.n || 5;
  return { t: spec.t, how: spec.how, run: (el, api) => {
    const target = () => centre() + spec.rel;
    const c = card(el, `<div class="chips">${Array.from({ length: n }, (_, i) => `<span class="chip">${i + 1}</span>`).join("")}</div><p class="say muted">La note est jouée, puis tu fais ${n} attaques.</p><div class="row"><button class="btn pri go">Commencer</button><button class="btn again" disabled>Réécouter</button></div>`);
    const chips = [...c.querySelectorAll(".chip")], say_ = c.querySelector(".say"), go = c.querySelector(".go"), again = c.querySelector(".again");
    const res = document.createElement("p"); res.className = "result"; let w = null;
    again.onclick = () => playNote(target(), 1.2);
    go.onclick = async () => {
      if (!(await startMic())) { micHelp(el, () => go.click()); return }
      if (!w) { w = pitchWidget(el, { tol: 30 }); api.onClean(() => w.destroy()); el.appendChild(res) }
      const m = target(); w.target = m; go.disabled = true; again.disabled = false; res.textContent = ""; chips.forEach(x => { x.className = "chip" });
      say_.textContent = "Écoute…"; await playNote(m, 1.2); if (!api.alive()) return;
      const lat = [], first = [];
      for (let i = 0; i < n; i++) {
        if (!api.alive()) return;
        chips[i].classList.add("cur"); say_.textContent = "Attaque " + (i + 1) + " : « a » court.";
        const r = await new Promise(done => {
          let phase = "silence", quiet = 0, start = 0, lastT = nowS(), out = null; const t0 = nowS();
          const f = s => {
            if (!api.alive()) { api.off(f); done(null); return }
            const dt = s.t - lastT; lastT = s.t;
            if (phase === "silence") { if (s.midi == null) quiet += dt; else quiet = 0; if (quiet > .25) phase = "wait" }
            else if (phase === "wait") { if (s.midi != null) { phase = "land"; start = s.t; out = { first: (s.midi - m) * 100, lat: null } } }
            else if (phase === "land") { if (s.midi != null && Math.abs((s.midi - m) * 100) <= 30) { out.lat = (s.t - start) * 1000; phase = "end" } else if (s.t - start > 1) phase = "end"; quiet = 0 }
            else if (phase === "end") { if (s.midi == null) quiet += dt; else quiet = 0; if (quiet > .15) { api.off(f); done(out) } }
            if (s.t - t0 > 8) { api.off(f); done(out || { first: null, lat: null }) }
          }; api.on(f);
        });
        if (!r) return;
        chips[i].classList.remove("cur");
        if (r.lat != null) { lat.push(r.lat); chips[i].textContent = Math.round(r.lat) + " ms"; chips[i].classList.add(r.lat <= 150 ? "ok" : "ko") } else { chips[i].textContent = "raté"; chips[i].classList.add("ko") }
        if (r.first != null && Math.abs(r.first) < 300) first.push(r.first);
      }
      go.disabled = false; go.textContent = "Refaire"; again.disabled = true; say_.textContent = "Terminé.";
      const L = lat.length ? median(lat) : null, F = first.length ? mean(first) : 0;
      res.innerHTML = (L != null ? "Temps pour arriver sur la note : <b>" + Math.round(L) + " ms</b>. " : "Aucune attaque n'a atteint la note. ") +
        (F < -40 ? "Tu arrives souvent par en dessous : entends la note avant d'attaquer, et vise-la directement." : F > 40 ? "Tu arrives souvent trop haut : attaque plus légèrement." : L != null && L <= 150 ? "Attaques précises." : "Vise la note directement, sans glisser.");
      if (L != null) push("onset", Math.round(L));
    };
  } };
}

function exSiren(spec) {
  const sec = spec.sec || 60;
  return { t: spec.t, how: spec.how, run: (el, api) => {
    const c = card(el, `<div class="timer"><span class="clock">${fmt(sec)}</span><button class="btn pri">Commencer</button></div>`);
    const b = c.querySelector("button"), clk = c.querySelector(".clock");
    const res = document.createElement("p"); res.className = "result";
    let on = false, t0 = 0, iv = null, f = null, w = null, lo = null, hi = null, prev = null; const breaks = [];
    const end = () => {
      if (!on) return; on = false; clearInterval(iv); api.off(f); b.textContent = "Recommencer";
      if (lo == null) { res.textContent = "Je n'ai pas assez entendu ta voix."; return }
      const span = hi - lo, cnt = {}; breaks.forEach(x => cnt[x] = (cnt[x] || 0) + 1);
      const top = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0];
      S.m.range = { lo, hi }; if (top && top[1] >= 2) S.m.passage = +top[0]; save();
      res.innerHTML = "Tessiture mesurée : <b>" + nom(lo) + " → " + nom(hi) + "</b> (" + Math.floor(span / 12) + " octave" + (span >= 24 ? "s" : "") + (span % 12 ? " et " + (span % 12) + " demi-tons" : "") + "). " +
        (top && top[1] >= 2 ? "Ta voix saute autour de <b>" + nom(+top[0]) + "</b> : c'est ton passage. Allège la voix en l'approchant." : "Aucune cassure nette : ton passage est fluide.");
    };
    b.onclick = async () => {
      if (on) { end(); return }
      if (!(await startMic())) { micHelp(el, () => b.click()); return }
      if (!w) { w = pitchWidget(el, { half: 14, tol: 50 }); api.onClean(() => w.destroy()); el.appendChild(res) }
      on = true; t0 = nowS(); lo = hi = prev = null; breaks.length = 0; b.textContent = "Terminer"; res.textContent = "";
      f = s => {
        if (s.midi != null) {
          if (prev && s.t - prev.t < .06 && Math.abs(s.midi - prev.midi) >= 1.5) breaks.push(Math.round(Math.min(s.midi, prev.midi) + .5));
          prev = { t: s.t, midi: s.midi };
          const rec = A.hist.filter(h => s.t - h.t <= .3);
          if (rec.length >= 6 && rec.every(h => h.midi != null)) { const ms = rec.map(h => h.midi); if (Math.max(...ms) - Math.min(...ms) < .8) { const nn = Math.round(median(ms)); if (lo == null || nn < lo) lo = nn; if (hi == null || nn > hi) hi = nn } }
        } else prev = null;
      };
      api.on(f);
      iv = setInterval(() => { const l = sec - (nowS() - t0); clk.textContent = fmt(l); if (l <= 0) { beep(); end() } }, 250);
    };
    api.onClean(() => clearInterval(iv));
  } };
}

function exSeq(spec) {
  const tol = spec.tol || 30, chain = !!spec.chain;
  return { t: spec.t, how: spec.how, run: (el, api) => {
    const notes = () => spec.rel.map(r => baseNote(spec) + r);
    const c = card(el, `<div class="chips">${chipsHtml(notes())}</div><p class="say muted">${chain ? "Le motif est joué une fois, puis tu le chantes d'une traite." : "Chaque note est jouée, puis tu la répètes."}</p><div class="row"><button class="btn pri go">Commencer</button><button class="btn stop" disabled>Arrêter</button></div>`);
    const chipsEl = c.querySelector(".chips"), say_ = c.querySelector(".say"), go = c.querySelector(".go"), stop = c.querySelector(".stop");
    const res = document.createElement("p"); res.className = "result"; let w = null, halt = false;
    stop.onclick = () => { halt = true };
    go.onclick = async () => {
      if (!(await startMic())) { micHelp(el, () => go.click()); return }
      if (!w) { w = pitchWidget(el, { tol, half: 9 }); api.onClean(() => w.destroy()); el.appendChild(res) }
      halt = false; go.disabled = true; stop.disabled = false; res.textContent = ""; chipsEl.innerHTML = chipsHtml(notes());
      const ns = notes(), chips = [...chipsEl.children]; let ok = 0;
      const alive = () => api.alive() && !halt;
      if (chain) { say_.textContent = "Écoute…"; await playMelody(ns, .38, alive); if (!alive()) return; say_.textContent = "À toi, d'une traite !"; A.muteUntil = 0 }
      for (let i = 0; i < ns.length; i++) {
        if (!alive()) break;
        const m = ns[i]; w.target = m; chips.forEach(x => x.classList.remove("cur")); chips[i].classList.add("cur");
        if (!chain) { say_.textContent = "Écoute…"; await playNote(m, .8); if (!alive()) break; say_.textContent = "À toi."; }
        const r = await new Promise(done => {
          const t0 = nowS(); let since = null;
          const f = s => {
            if (!alive()) { api.off(f); done(null); return }
            if (s.midi != null && Math.abs((s.midi - m) * 100) <= tol) { if (since == null) since = s.t; if (s.t - since >= (chain ? .12 : .5)) { api.off(f); done(true); return } } else since = null;
            if (s.t - t0 > (chain ? 2.5 : 6)) { api.off(f); done(false) }
          }; api.on(f);
        });
        if (r == null) break;
        chips[i].classList.remove("cur"); chips[i].classList.add(r ? "ok" : "ko"); if (r) ok++;
      }
      if (!api.alive()) return;
      go.disabled = false; stop.disabled = true; go.textContent = "Refaire"; w.target = null;
      if (halt) { say_.textContent = "Arrêté."; return }
      say_.textContent = "Terminé."; const sc = ok / ns.length * 100;
      res.innerHTML = "<b>" + ok + " / " + ns.length + "</b> notes justes. " + (sc >= 80 ? "Très bien." : "Refais-le : la deuxième fois est souvent meilleure.");
    };
  } };
}

function exTimer(spec) { return { t: spec.t, how: spec.how, run: (el, api) => timerBox(el, spec.sec || 120, api) } }

function exEmotion() {
  const EMO = [["Tendre", "Plus d'air, attaques douces, volume faible."], ["Joyeuse", "Son clair, léger sourire, attaques nettes."], ["Triste", "Plus lent, plus sombre, un peu soufflé."], ["Décidée", "Appui fort, attaques franches, fins de phrase stables."]];
  return { t: "Une phrase, quatre émotions", how: "Écoute la mélodie, puis chante-la sur « la » quatre fois, avec une intention différente à chaque fois. Enregistre chaque version.", run: (el, api) => {
    const c = card(el, `<button class="btn pri">Écouter la mélodie</button>`);
    c.querySelector("button").onclick = () => playMelody(EMO_PHRASE.map(r => centre() - 2 + r), .42, api.alive);
    EMO.forEach(([n, h]) => { const box = document.createElement("div"); box.className = "emo"; box.innerHTML = `<b>${n}</b><span class="small muted">${h}</span>`; el.appendChild(box); const r = recorder(box, { max: 30, label: "Enregistrer" }); api.onClean(() => r.stop()) });
    card(el, `<p class="label">À la réécoute</p><p class="prose">Qu'est-ce qui a changé d'une version à l'autre : le souffle, l'attaque, la couleur, le volume, le tempo ? Laquelle sonne le plus juste émotionnellement ?</p>`);
  } };
}

function exSpeech(spec) {
  return { t: spec.t, how: spec.how, run: (el, api) => {
    const c = card(el, `<p class="prose">${SPEECH_TEXT}</p><button class="btn pri">Je commence à lire</button>`);
    const b = c.querySelector("button"); const res = document.createElement("p"); res.className = "result";
    let on = false, v = [], f = null, w = null;
    b.onclick = async () => {
      if (!on) {
        if (!(await startMic())) { micHelp(el, () => b.click()); return }
        if (!w) { w = pitchWidget(el, { half: 10, tol: 50 }); api.onClean(() => w.destroy()); el.appendChild(res) }
        on = true; v = []; b.textContent = "J'ai fini"; f = s => { if (s.midi != null) v.push(s.midi) }; api.on(f); return;
      }
      on = false; api.off(f); b.textContent = "Relire";
      if (v.length < 30) { res.textContent = "Je n'ai pas assez entendu ta voix."; return }
      const md = median(v), var_ = sd(v), comfort = centre() - 4;
      res.innerHTML = "Ta voix parlée tourne autour de <b>" + nom(md) + "</b> (zone de confort : " + nom(comfort) + ") et varie de <b>" + f1(var_) + " demi-tons</b>. " +
        (md > comfort + 2 ? "Elle monte un peu : ralentis, respire, et repars d'un « mm-hmm ». " : "Hauteur posée. ") +
        (var_ < 2 ? "Elle reste plate : appuie davantage les mots importants." : var_ <= 5 ? "Bonne variation." : "Très expressive.");
      push("speak", +f1(var_).replace(",", "."));
    };
  } };
}
function exProj(spec) { return { t: spec.t, how: spec.how, run: (el, api) => { timerBox(el, 150, api); const r = recorder(el, { max: 160, label: "M'enregistrer" }); api.onClean(() => r.stop()) } } }

/* ============ Coach vocal · Parler ============ */
const timbre = () => S.timbre != null ? S.timbre : centre() - 4;
const ZONE = 3;
function zoneWidget(el) {
  el.insertAdjacentHTML("beforeend", `<div class="card pw"><div class="pw-top"><div><span class="pw-n">–</span><span class="pw-sci"></span></div><span class="pw-c muted">${A.on ? "J'écoute" : "Micro en attente"}</span></div><canvas class="roll"></canvas><p class="xs muted" style="margin:0">Bande verte : ta zone, autour de ta note naturelle (${nom(timbre())}).</p></div>`);
  const root = el.lastElementChild, cv = root.querySelector("canvas"); const T = timbre(); let sm = null;
  const draw = () => { const t = nowS(); drawRoll(cv, A.hist, { lo: T - 9, hi: T + 9, t0: t - 8, t1: t, target: T, tol: ZONE * 50, empty: A.on ? null : "La courbe apparaîtra ici" }) };
  const f = s => {
    if (!root.isConnected) { A.fn.delete(f); return }
    if (s.midi != null && Math.abs(s.midi - T) < 12) {
      sm = sm == null ? s.midi : sm + (s.midi - sm) * .08; const d = sm - T;
      root.querySelector(".pw-n").textContent = nom(sm); root.querySelector(".pw-sci").textContent = sci(sm);
      const c = root.querySelector(".pw-c"); c.classList.remove("muted");
      c.textContent = Math.abs(d) <= ZONE ? "Dans ta zone" : d > 0 ? "Tu montes" : "Tu descends";
      c.style.color = Math.abs(d) <= ZONE ? colors["--ok"] : Math.abs(d) <= ZONE + 2 ? colors["--near"] : colors["--off"];
    }
    draw();
  };
  A.fn.add(f); requestAnimationFrame(draw);
  return { destroy() { A.fn.delete(f) } };
}

function exFind() {
  return { t: "Trouver ta note naturelle", how: "Appuie sur Commencer, puis : cinq « mm-hmm » comme pour approuver quelqu'un, lèvres fermées, sans réfléchir. Ensuite compte de 1 à 10 sur un soupir détendu, comme affalé dans un canapé.", run: (el, api) => {
    const c = card(el, `<button class="btn pri go">Commencer</button><p class="say muted"></p>`);
    const go = c.querySelector(".go"), say_ = c.querySelector(".say"); const res = document.createElement("p"); res.className = "result";
    let on = false, v = [], f = null, w = null, iv = null, t0 = 0;
    const stop = () => {
      on = false; api.off(f); clearInterval(iv); go.textContent = "Recommencer"; say_.textContent = "";
      if (v.length < 25) { res.textContent = "Je n'ai pas assez entendu ta voix. Rapproche le téléphone et recommence."; return }
      const lo = pct(v, .1), hi = pct(v, .9), core = v.filter(x => x >= lo && x <= hi), T = Math.round(median(core) * 2) / 2;
      const prev = S.timbre; S.timbre = T; if (S.centre == null) S.centre = Math.max(45, Math.min(67, Math.round(T + 4))); save(); push("timbre", T);
      res.innerHTML = `Ta note naturelle : <b>${nom(T)}</b> (${Math.round(m2f(T))} Hz). Ta zone va de ${nom(T - ZONE)} à ${nom(T + ZONE)}.` +
        (prev != null && Math.abs(prev - T) >= 1 ? ` La dernière fois : ${nom(prev)}. Un écart d'un ou deux demi-tons d'un jour à l'autre est normal.` : "");
    };
    go.onclick = async () => {
      if (on) { stop(); return }
      if (!(await startMic())) { micHelp(el, () => go.click()); return }
      if (!w) { w = pitchWidget(el, { half: 9, tol: 50 }); api.onClean(() => w.destroy()); el.appendChild(res) }
      on = true; v = []; res.textContent = ""; go.textContent = "J'ai fini"; t0 = nowS();
      iv = setInterval(() => { const s = nowS() - t0; say_.textContent = s < 8 ? "Cinq « mm-hmm »…" : "Compte de 1 à 10 sur un soupir…"; if (s > 25) stop() }, 300);
      f = s => { if (!api.alive()) { api.off(f); return } if (s.midi != null) v.push(s.midi) }; api.on(f);
    };
    api.onClean(() => clearInterval(iv));
  } };
}

/* Analyse d'une prise parlée : zone, variation, fins de phrase, effet des objections */
function analyseVoice(fr, T, marks) {
  const voiced = fr.filter(s => s.midi != null && Math.abs(s.midi - T) < 12);
  if (voiced.length < 40) return null;
  const ms = voiced.map(s => s.midi), md = median(ms), lo = pct(ms, .1), hi = pct(ms, .9);
  const out = { md, off: md - T, zone: Math.round(voiced.filter(s => Math.abs(s.midi - T) <= ZONE).length / voiced.length * 100), vari: (hi - lo) / 2 };
  // Segments : groupes de parole séparés par plus de 0,35 s sans voix
  const segs = []; let cur = null, lastV = -9;
  for (const s of fr) {
    if (s.midi != null && Math.abs(s.midi - T) < 12) { if (!cur || s.t - lastV > .35) { cur = []; segs.push(cur) } cur.push(s); lastV = s.t }
  }
  const long = segs.filter(g => g[g.length - 1].t - g[0].t > .9);
  if (long.length) {
    let good = 0;
    for (const g of long) {
      const tEnd = g[g.length - 1].t, tail = g.filter(s => s.t > tEnd - .3), body = g.filter(s => s.t <= tEnd - .3);
      if (!tail.length || !body.length) { good++; continue }
      const rB = median(body.map(s => s.rms)), rT = median(tail.map(s => s.rms)), pT = median(tail.map(s => s.midi));
      if (rT >= rB * .35 && pT >= T - 5) good++;
    }
    out.fins = Math.round(good / long.length * 100); out.nseg = long.length;
  }
  if (marks && marks.length) {
    const before = voiced.filter(s => s.t < marks[0]).map(s => s.midi);
    const after = voiced.filter(s => marks.some(m => s.t > m && s.t < m + 8)).map(s => s.midi);
    if (before.length > 20 && after.length > 20) out.jump = median(after) - median(before);
  }
  return out;
}

function exVoice(spec) {
  return { t: spec.t, how: spec.how, run: (el, api) => {
    const free = spec.mode === "free", sec = spec.sec || 60;
    let topic = free ? pick(LISTS.QUICK) : null;
    const text = free ? "" : PARLER_TEXTS[spec.text != null ? spec.text : (S.day + S.v.sess) % PARLER_TEXTS.length];
    const c = card(el, free ? `<p class="label">Question</p><p class="keep topic">${esc(topic)}</p><button class="btn ghost sm other">Une autre question</button>` : `<p class="prose">${text}</p>`);
    const ctl = card(el, `<div class="timer"><span class="clock">${free ? fmt(sec) : "0:00"}</span><button class="btn pri go">${free ? "Je commence" : "Je commence à lire"}</button></div>${spec.pressure ? '<p class="small muted obj" style="margin:0">Des objections vont tomber pendant que tu parles.</p>' : ""}`);
    const go = ctl.querySelector(".go"), clk = ctl.querySelector(".clock"), objEl = ctl.querySelector(".obj");
    const ot = c.querySelector(".other"); if (ot) ot.onclick = () => { topic = pick(LISTS.QUICK); c.querySelector(".topic").textContent = topic };
    const res = document.createElement("div");
    let on = false, fr = [], f = null, w = null, iv = null, t0 = 0, marks = [], plan = [], mute = 0;
    const stop = () => {
      on = false; api.off(f); clearInterval(iv); try { speechSynthesis.cancel() } catch (e) {} go.textContent = "Refaire";
      const T = timbre(), r = analyseVoice(fr, T, marks);
      if (!r) { res.innerHTML = '<p class="result">Je n\'ai pas assez entendu ta voix. Parle un peu plus longtemps, téléphone plus près.</p>'; return }
      const lines = [];
      lines.push(`Dans ta zone : <b>${r.zone} %</b> du temps.`);
      lines.push(`Ta voix tourne autour de <b>${nom(r.md)}</b>` + (Math.abs(r.off) < 1 ? ", pile sur ta note naturelle." : r.off > 0 ? `, ${f1(r.off)} demi-ton${r.off >= 2 ? "s" : ""} au-dessus de ta note naturelle.` : `, ${f1(-r.off)} demi-ton${-r.off >= 2 ? "s" : ""} en dessous de ta note naturelle.`));
      lines.push(`Variation : <b>${f1(r.vari)} demi-tons</b>` + (r.vari < 1.8 ? " : plutôt plate, appuie davantage tes mots-clés." : r.vari <= 5 ? " : voix vivante." : " : très expressive, garde-la dans ta zone."));
      if (r.fins != null) lines.push(`Fins de phrase pleines : <b>${r.fins} %</b> (${r.nseg} phrases).`);
      if (r.jump != null) lines.push(`Après les objections, ta voix ${Math.abs(r.jump) < 1 ? "est restée stable" : r.jump > 0 ? `est montée de <b>${f1(r.jump)} demi-ton${r.jump >= 2 ? "s" : ""}</b>` : `est descendue de ${f1(-r.jump)} demi-ton${-r.jump >= 2 ? "s" : ""}`}.`);
      let tip;
      if (r.jump != null && r.jump >= 1) tip = "Sous la pression, ta voix monte. La prochaine fois : objection, inspiration basse, puis réponse.";
      else if (r.off >= 2) tip = "Ta voix est montée au-dessus de ta note. Ralentis, respire aux points, et repars d'un « mm-hmm ».";
      else if (r.off <= -2) tip = "Tu pousses ta voix vers le grave. Laisse-la remonter vers ta note naturelle : elle portera mieux.";
      else if (r.fins != null && r.fins < 80) tip = "Des fins de phrase s'éteignent. Reprends de l'air avant d'être vide, et appuie le dernier mot.";
      else if (r.vari < 1.8) tip = "Ton timbre est bien placé. Fais maintenant bouger la mélodie autour.";
      else tip = "Timbre bien placé. Refais-le demain pour l'ancrer.";
      res.innerHTML = `<div class="card tint"><p class="result" style="margin:0">${lines.join("<br>")}</p></div><p class="prose">${tip}</p>`;
      push("zone", r.zone); push("pvar", +r.vari.toFixed(1)); if (r.fins != null) push("fins", r.fins); if (r.jump != null) push("jump", +r.jump.toFixed(1));
    };
    go.onclick = async () => {
      if (on) { stop(); return }
      if (!(await startMic())) { micHelp(el, () => go.click()); return }
      if (!w) { w = zoneWidget(el); api.onClean(() => w.destroy()); el.appendChild(res) }
      on = true; fr = []; marks = []; res.innerHTML = ""; go.textContent = free ? "J'ai fini" : "J'ai fini de lire"; t0 = nowS();
      plan = spec.pressure ? (free ? [14 + Math.random() * 6, 34 + Math.random() * 8] : [10 + Math.random() * 5, 24 + Math.random() * 6]) : [];
      const objs = [...LISTS.OBJ].sort(() => Math.random() - .5);
      iv = setInterval(() => {
        const s = nowS() - t0; clk.textContent = free ? fmt(sec - s) : fmt(s);
        if (plan.length && s >= plan[0]) { plan.shift(); const o = objs.pop(); marks.push(nowS()); mute = nowS() + 1; say(o); if (objEl) objEl.innerHTML = "<b>« " + esc(o) + " »</b> Inspire, puis réponds sur ta note." }
        if (free && s >= sec) { beep(); stop() } else if (s > 240) stop();
      }, 250);
      f = s => { if (!api.alive()) { api.off(f); return } let tts = false; try { tts = speechSynthesis.speaking } catch (e) {} if (tts || s.t < mute) { if (tts) mute = s.t + .4; return } fr.push(s) };
      api.on(f);
    };
    api.onClean(() => clearInterval(iv));
  } };
}

/* ============ Exercices de parole ============ */
const FOCUS = ["Message clé plus tôt", "Annoncer le plan", "Moins de mots de doute", "Moins de « euh »", "Phrases plus courtes", "Plus de pauses", "Revenir au fil", "Fins de phrase affirmées"];
const COUNTERS = { euh: "« euh »", doute: "mot de doute" };
function exTakes(spec) {
  const sec = spec.sec || 60, takes = spec.takes || 3, counters = spec.counters || ["euh", "doute"];
  return { t: spec.t, how: spec.how, run: (el, api) => {
    const topicFn = spec.topic ? () => spec.topic : () => pick(LISTS[spec.topics]);
    const tc = card(el, `<p class="label">Sujet</p><p class="topic"></p>${spec.topic ? "" : '<button class="btn ghost sm nx">Autre sujet</button>'}`);
    const show = () => tc.querySelector(".topic").textContent = topicFn(); show();
    const nx = tc.querySelector(".nx"); if (nx) nx.onclick = show;
    if (spec.summary) card(el, spec.summary);
    if (spec.fields && spec.fields.length) card(el, `<p class="label">Prépare en quelques mots</p><div class="fields">${spec.fields.map(f => `<label>${f}<input></label>`).join("")}</div>`);
    const pressure = spec.pressureList || (spec.pressure ? LISTS[spec.pressure] : null);
    const wrap = document.createElement("div"); wrap.style.cssText = "display:flex;flex-direction:column;gap:16px"; el.appendChild(wrap);
    let focus = null; const hist = [];
    function take(n) {
      const box = document.createElement("div"); box.className = "take";
      box.innerHTML = `<div class="row between"><p class="label">Prise ${n} sur ${takes}</p>${focus ? `<span class="small" style="color:var(--accent)">Objectif : ${esc(focus)}</span>` : ""}</div>
        <div class="timer"><span class="clock">${fmt(sec)}</span><button class="btn pri go">Démarrer</button></div>
        <div class="bn"></div>
        <div class="counters">${counters.map(k => `<button class="counter" data-k="${k}" disabled><b>0</b><span>${COUNTERS[k]}</span></button>`).join("")}</div>
        <div class="pl"></div><p class="result"></p>`;
      wrap.appendChild(box); box.scrollIntoView({ behavior: "smooth", block: "start" });
      const go = box.querySelector(".go"), clk = box.querySelector(".clock"), pl = box.querySelector(".pl"), res = box.querySelector(".result"), bn = box.querySelector(".bn");
      const cnt = {}; counters.forEach(k => cnt[k] = 0);
      box.querySelectorAll(".counter").forEach(b => b.onclick = () => { if (on) { cnt[b.dataset.k]++; b.querySelector("b").textContent = cnt[b.dataset.k] } });
      let on = false, t0 = 0, iv = null, rec = null, pt = null, done = false;
      const end = () => {
        if (!on) return; on = false; clearInterval(iv); clearTimeout(pt); if (rec) rec.stop(); go.disabled = true; go.textContent = "Terminé";
        box.querySelectorAll(".counter").forEach(b => b.disabled = true);
        const s = Math.max(10, Math.min(sec, nowS() - t0)), per = {}; counters.forEach(k => per[k] = cnt[k] / (s / 60)); hist.push(cnt);
        res.innerHTML = counters.map(k => `<b>${cnt[k]}</b> ${COUNTERS[k]}`).join(" · ") + (hist.length > 1 ? `<span class="muted"> (prise précédente : ${counters.map(k => hist[hist.length - 2][k]).join(" · ")})</span>` : "");
        if (done) return; done = true;
        if (n < takes) {
          box.insertAdjacentHTML("beforeend", `<p class="small"><b>Réécoute ta prise</b>, puis choisis un seul point à corriger :</p><div class="chips">${FOCUS.map(f => `<button class="chip" aria-pressed="false">${f}</button>`).join("")}</div><button class="btn pri nt">Prise ${n + 1}</button>`);
          box.querySelectorAll("button.chip").forEach(c => c.onclick = () => { box.querySelectorAll("button.chip").forEach(x => x.setAttribute("aria-pressed", "false")); c.setAttribute("aria-pressed", "true"); focus = c.textContent });
          box.querySelector(".nt").onclick = e => { e.target.disabled = true; take(n + 1) };
        } else {
          counters.forEach(k => push(k, +per[k].toFixed(1)));
          box.insertAdjacentHTML("beforeend", `<p class="small muted">Compare ta première et ta dernière prise : qu'est-ce qui a changé ?</p>`);
        }
      };
      go.onclick = async () => {
        on = true; t0 = nowS(); go.textContent = "Arrêter"; go.onclick = end;
        box.querySelectorAll(".counter").forEach(b => b.disabled = false);
        iv = setInterval(() => { const l = sec - (nowS() - t0); clk.textContent = fmt(l); if (l <= 0) { beep(); end() } }, 200);
        if (pressure) {
          const at = sec * (.35 + Math.random() * .25) * 1000;
          pt = setTimeout(() => { if (!on || !api.alive()) return; const q = pick(pressure); bn.innerHTML = `<div class="banner">${esc(q)}</div>`; say(q) }, at);
        }
        rec = await recordInto(url => { const au = document.createElement("audio"); au.controls = true; au.src = url; pl.innerHTML = ""; pl.appendChild(au) });
        if (!rec) pl.innerHTML = '<p class="xs muted">Sans micro : pas d\'enregistrement, fais quand même l\'exercice à voix haute.</p>';
        if (!on && rec) rec.stop();
      };
      api.onClean(() => { clearInterval(iv); clearTimeout(pt); if (rec) rec.stop() });
    }
    take(1);
  } };
}

function exRapid(spec) {
  const n = spec.n || 5, sec = spec.sec || 30;
  return { t: spec.t, how: spec.how, run: (el, api) => {
    const pool = [...(spec.items || LISTS[spec.list])].sort(() => Math.random() - .5).slice(0, n);
    const c = card(el, `<div class="row between"><p class="label qn">Question 1 sur ${pool.length}</p><span class="clock" style="font-size:28px">${fmt(sec)}</span></div><div class="bn"><p class="muted">La question sera lue à voix haute.</p></div><div class="checks">${spec.checks.map(x => `<label><input type="checkbox"> ${x}</label>`).join("")}</div><button class="btn pri big go">Poser la question</button><p class="result"></p>`);
    const go = c.querySelector(".go"), clk = c.querySelector(".clock"), bn = c.querySelector(".bn"), qn = c.querySelector(".qn"), res = c.querySelector(".result");
    let i = -1, iv = null, total = 0, got = 0;
    const tally = () => { const boxes = [...c.querySelectorAll(".checks input")]; total += boxes.length; got += boxes.filter(b => b.checked).length; boxes.forEach(b => b.checked = false) };
    const next = () => {
      if (i >= 0) tally();
      i++; clearInterval(iv);
      if (i >= pool.length) { bn.innerHTML = ""; go.hidden = true; clk.textContent = "–"; res.innerHTML = "Critères réussis : <b>" + got + " / " + total + "</b>. " + (got / total >= .8 ? "Réflexes bien en place." : "Refais la série demain : ces réflexes s'installent par répétition."); return }
      qn.textContent = "Question " + (i + 1) + " sur " + pool.length;
      bn.innerHTML = `<div class="banner">${esc(pool[i])}</div>`; say(pool[i]);
      go.textContent = i === pool.length - 1 ? "Terminer" : "Question suivante";
      const t0 = nowS(); iv = setInterval(() => { const l = sec - (nowS() - t0); clk.textContent = fmt(l); if (l <= 0) { clearInterval(iv); beep() } }, 200);
    };
    go.onclick = next;
    api.onClean(() => clearInterval(iv));
  } };
}

function exRewrite(spec) {
  return { t: spec.t, how: "Lis chaque phrase hésitante à voix haute, puis trouve ta version affirmée et dis-la, voix qui descend à la fin. Touche la phrase pour voir une proposition.", run: (el) => {
    const g = document.createElement("div"); g.className = "group"; el.appendChild(g);
    REWRITES.forEach(([a, b]) => {
      const cell = document.createElement("button"); cell.className = "cell"; cell.innerHTML = `<div class="t"><b style="font-weight:500">${esc(a)}</b><span hidden style="color:var(--ok);font-weight:600;font-size:16px;margin-top:6px">${esc(b)}</span></div>`;
      cell.onclick = () => { const s = cell.querySelector("span"); s.hidden = !s.hidden }; g.appendChild(cell);
    });
  } };
}

function build(spec) {
  switch (spec.k) {
    case "breath": return exBreath();
    case "stable": return exStable(spec);
    case "onset": return exOnset(spec);
    case "siren": return exSiren(spec);
    case "seq": return exSeq(spec);
    case "timer": return exTimer(spec);
    case "emotion": return exEmotion();
    case "speech": return exSpeech(spec);
    case "proj": return exProj(spec);
    case "find": return exFind();
    case "voice": return exVoice(spec);
    case "takes": return exTakes(spec);
    case "rapid": return exRapid(spec);
    case "rewrite": return exRewrite(spec);
  }
}

/* ============ Leçons ============ */
const deepHtml = M => `<details class="more"><summary>Approfondir</summary><ul>${M.deep.map(d => `<li>${d}</li>`).join("")}</ul></details>`;
function INTRO(M) {
  return { t: M.t, run: el => {
    card(el, `<p class="lede">${M.why}</p><p class="prose">${M.x}</p>`);
    card(el, `<p class="label">C'est réussi quand</p><p class="keep">${M.ok}</p>`, "tint");
    el.insertAdjacentHTML("beforeend", deepHtml(M));
  } };
}
function RAPPEL(M, k) {
  return { t: M.t, run: el => {
    card(el, `<p class="label">Rappel · séance ${k + 1}${M.n < 99 ? " sur " + M.n : ""}</p><p class="keep">${M.ok}</p>`, "tint");
    el.insertAdjacentHTML("beforeend", `<details class="more"><summary>Relire l'explication</summary><p class="prose">${M.x}</p></details>` + deepHtml(M));
  } };
}
function partSteps(list, st, block, minIntro, minEx) {
  const M = list[st.mod], k = st.sess, ex = M.ex;
  const sub = M.t;
  if (k === 0) return [tag(INTRO(M), block, minIntro, "nouveau"), tag(build(ex[0]), block, minEx, sub)];
  return [tag(RAPPEL(M, k), block, "20 s", "pratique"), tag(build(ex[k % ex.length]), block, minEx, sub)];
}
const CALIB = { t: "Ta zone de voix", run: (el, api) => {
  const c = card(el, `<p class="prose">Une seule fois : l'appli écoute ta voix parlée pour placer les exercices de chant au bon endroit. Appuie sur Commencer et dis normalement : « Bonjour, je m'appelle… et aujourd'hui je travaille ma voix. »</p><button class="btn pri go">Commencer</button><p class="say"></p><p class="small muted">Sans micro : <button class="btn ghost sm lo">voix plutôt grave</button> · <button class="btn ghost sm hi">voix plutôt aiguë</button></p>`);
  const say_ = c.querySelector(".say"), go = c.querySelector(".go");
  const setC = (v, txt) => { S.centre = Math.max(45, Math.min(67, v)); save(); say_.innerHTML = (txt || "") + "Ta note de confort : <b>" + nom(S.centre) + "</b>." };
  c.querySelector(".lo").onclick = () => setC(50); c.querySelector(".hi").onclick = () => setC(60);
  go.onclick = async () => {
    if (!(await startMic())) { micHelp(el, () => go.click()); return }
    go.disabled = true; const v = []; const t0 = nowS(); say_.textContent = "Je t'écoute…";
    const f = s => { if (!api.alive()) { api.off(f); return } if (s.midi != null) v.push(s.midi);
      if (v.length > 150 || s.t - t0 > 9) { api.off(f); go.disabled = false; go.textContent = "Recommencer";
        if (v.length < 30) { say_.textContent = "Je n'ai pas assez entendu ta voix. Rapproche-toi et recommence."; return }
        setC(Math.round(median(v) + 4), "Ta voix parlée tourne autour de " + nom(median(v)) + ". ") } };
    api.on(f);
  };
} };

const rp = n => (n || 0) + " reprise" + ((n || 0) > 1 ? "s" : "");
/* ============ Réflexes : boucle écrire, dire, réécouter, refaire ============ */
const FOCUS2 = ["Dire ma destination plus tôt", "Annoncer le nombre de points", "Finir mes phrases", "Phrases plus courtes", "Appuyer mes mots-clés", "Boucler sur ma destination"];
const checksFor = i => REFLEXES.slice(0, i + 1).flatMap(r => r.checks);
const dayIndex = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5);
function missionToday() { const M = REFLEXES[S.r.mod]; return M.missions[dayIndex() % M.missions.length] }
function weekKey() { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return dkey(d) }

function rIntro(M) {
  return { t: M.t, run: el => {
    card(el, `<p class="lede">${M.why}</p><p class="prose">${M.x}</p>`);
    card(el, `<p class="label">La règle</p><p class="keep">${M.rule}</p>`, "tint");
    card(el, `<p class="label">Ta mission pour aujourd'hui</p><p class="prose">${missionToday()}</p>`);
  } };
}
function rRappel(M, k) {
  return { t: M.t, run: el => {
    card(el, `<p class="label">Rappel · séance ${k + 1}${M.n < 99 ? " sur " + M.n : ""}</p><p class="keep">${M.rule}</p>`, "tint");
    el.insertAdjacentHTML("beforeend", `<details class="more"><summary>Relire l'explication</summary><p class="prose">${M.x}</p></details>`);
  } };
}
function exWrite(fields, pool, sec, how) {
  return { t: "Écrire avant de parler", how: how || "Pose ta structure en quelques mots. C'est ici que ta pensée s'organise : ne rédige pas, note des mots.", run: (el, api) => {
    if (!api.res.topic) api.res.topic = pick(pool);
    api.res.fields = fields; api.res.notes = api.res.notes || [];
    const tc = card(el, `<p class="label">Sujet</p><p class="topic"></p><button class="btn ghost sm nx">Autre sujet</button>`);
    const show = () => tc.querySelector(".topic").textContent = api.res.topic; show();
    tc.querySelector(".nx").onclick = () => { api.res.topic = pick(pool); show() };
    const fc = card(el, `<div class="fields">${fields.map((f, i) => `<label>${f}<input data-i="${i}" value="${esc(api.res.notes[i] || "")}"></label>`).join("")}</div>`);
    fc.querySelectorAll("input").forEach(inp => inp.oninput = () => { api.res.notes[+inp.dataset.i] = inp.value.trim() });
    timerBox(el, sec, api);
  } };
}
function notesCard(el, res, extra) {
  const items = (res.fields || []).map((f, i) => res.notes && res.notes[i] ? `<li><span class="muted">${esc(f)} :</span> ${esc(res.notes[i])}</li>` : "").join("");
  card(el, `<p class="label">Sujet</p><p class="keep">${esc(res.topic || "")}</p>${items ? `<ul style="margin:0;padding-left:1.1em;display:flex;flex-direction:column;gap:4px">${items}</ul>` : ""}${extra || ""}`);
}
function takeBox(el, api, n, sec, onDone) {
  const c = card(el, `<div class="timer"><span class="clock">${fmt(sec)}</span><button class="btn pri">Démarrer</button></div><div class="pl"></div>`);
  const b = c.querySelector("button"), clk = c.querySelector(".clock"), pl = c.querySelector(".pl");
  let on = false, t0 = 0, iv = null, rec = null;
  const end = () => { if (!on) return; on = false; clearInterval(iv); if (rec) rec.stop(); b.textContent = "Refaire la prise"; if (!rec && onDone) onDone() };
  b.onclick = async () => {
    if (on) { end(); return }
    on = true; t0 = nowS(); b.textContent = "Arrêter"; pl.innerHTML = "";
    iv = setInterval(() => { const l = sec - (nowS() - t0); clk.textContent = fmt(l); if (l <= 0) { beep(); end() } }, 200);
    rec = await recordInto(url => { api.res["audio" + n] = url; const au = document.createElement("audio"); au.controls = true; au.src = url; pl.innerHTML = ""; pl.appendChild(au); if (onDone) onDone() });
    if (!rec) pl.innerHTML = '<p class="xs muted">Sans micro, pas d\'enregistrement : fais quand même la prise à voix haute.</p>';
    if (!on && rec) rec.stop();
  };
  api.onClean(() => { clearInterval(iv); if (rec) rec.stop() });
}
function reviewBlock(el, api, n, checks) {
  const box = document.createElement("div"); box.style.cssText = "display:flex;flex-direction:column;gap:16px"; el.appendChild(box);
  if (n === 1) {
    const ac = card(box, `<p class="label">Ta prise</p><div class="au"><p class="xs muted">Chargement…</p></div>`);
    const fill = (tries) => { const url = api.res.audio1; const au = ac.querySelector(".au"); if (url) { au.innerHTML = ""; const a = document.createElement("audio"); a.controls = true; a.src = url; au.appendChild(a) } else if (tries > 0) setTimeout(() => fill(tries - 1), 300); else au.innerHTML = '<p class="small muted">Pas d\'enregistrement : repense à ta prise.</p>' };
    fill(6);
  }
  api.res["check" + n] = checks.map(() => null);
  const cc = card(box, `<p class="label">À la réécoute</p>${checks.map((q, i) => `<div class="row between" style="flex-wrap:nowrap"><span style="flex:1">${q}</span><div class="row" style="flex-wrap:nowrap;gap:6px"><button class="chip yn" data-i="${i}" data-v="1" aria-pressed="false">Oui</button><button class="chip yn" data-i="${i}" data-v="0" aria-pressed="false">Non</button></div></div>`).join("")}`);
  cc.querySelectorAll(".yn").forEach(b => b.onclick = () => { const i = +b.dataset.i; api.res["check" + n][i] = b.dataset.v === "1"; cc.querySelectorAll(`.yn[data-i="${i}"]`).forEach(x => x.setAttribute("aria-pressed", x === b)); upd() });
  api.res["rep" + n] = 0;
  const rc = card(box, `<p class="label">Combien de fois t'es-tu repris ?</p><p class="small muted">Chaque « enfin, je veux dire », chaque phrase recommencée.</p><div class="row"><button class="btn sm m">−</button><b class="mono v" style="font-size:24px;min-width:2ch;text-align:center">0</b><button class="btn sm p">+</button></div>`);
  rc.querySelector(".m").onclick = () => { api.res["rep" + n] = Math.max(0, api.res["rep" + n] - 1); rc.querySelector(".v").textContent = api.res["rep" + n]; upd() };
  rc.querySelector(".p").onclick = () => { api.res["rep" + n]++; rc.querySelector(".v").textContent = api.res["rep" + n]; upd() };
  let cmp = null;
  if (n === 1) {
    const fc = card(box, `<p class="label">Un seul point à corriger pour la prise suivante</p><div class="chips">${FOCUS2.map(f => `<button class="chip" aria-pressed="false">${f}</button>`).join("")}</div>`);
    fc.querySelectorAll("button.chip").forEach(c => c.onclick = () => { fc.querySelectorAll("button.chip").forEach(x => x.setAttribute("aria-pressed", "false")); c.setAttribute("aria-pressed", "true"); api.res.focus = c.textContent });
  } else cmp = card(box, `<p class="result"></p>`, "tint");
  function upd() {
    if (!cmp) return;
    const sc = k => { const a = api.res["check" + k] || []; return a.filter(x => x === true).length + " / " + a.length };
    cmp.querySelector(".result").innerHTML = `Prise 1 : <b>${sc(1)}</b> oui · ${rp(api.res.rep1)}<br>Prise 2 : <b>${sc(2)}</b> oui · ${rp(api.res.rep2)}`;
  }
  upd();
}
function exTake(n, sec, how) {
  return { t: n === 1 ? "Dire" : "Refaire", how, run: (el, api) => {
    notesCard(el, api.res, n === 2 && api.res.focus ? `<p class="small" style="color:var(--accent);font-weight:600">Objectif de cette prise : ${esc(api.res.focus)}</p>` : "");
    let shown = false;
    takeBox(el, api, n, sec, n === 2 ? () => { if (!shown) { shown = true; reviewBlock(el, api, 2, api.res.checks) } } : null);
  } };
}
function exReview() { return { t: "Réécouter", how: "Écoute ta prise une fois, en entier, puis réponds honnêtement.", run: (el, api) => reviewBlock(el, api, 1, api.res.checks) } }
const BILAN = { t: "Bilan", run: (el, api) => {
  card(el, `<p class="label">Ta mission pour aujourd'hui</p><p class="keep">${missionToday()}</p><p class="small muted">Ce soir, coche-la sur l'écran Aujourd'hui.</p>`);
  const c = card(el, `<label class="label" for="nextFocus">Ce que je retiens de cette séance</label><textarea id="nextFocus" placeholder="Ex. : quand j'annonce deux points, je ne me perds plus"></textarea>`);
  const ta = c.querySelector("textarea"); ta.oninput = () => { api.res.note = ta.value.trim() };
} };

function seance() {
  const i = S.r.mod, M = REFLEXES[i], k = S.r.sess;
  R.res.checks = checksFor(i);
  const steps = [
    tag(k === 0 ? rIntro(M) : rRappel(M, k), "parole", k === 0 ? "2 min" : "20 s", k === 0 ? "nouveau réflexe" : "pratique"),
    tag(exWrite(M.fields, LISTS[M.topics], 180), "parole", "3 min", M.t),
    tag(exTake(1, 60, "Une minute, en t'enregistrant. Suis ta structure, sans lire tes notes mot à mot."), "parole", "1 min", M.t),
    tag(exReview(), "parole", "2 min", M.t),
    tag(exTake(2, 60, "Même sujet. Concentre-toi sur ton seul point à corriger."), "parole", "3 min", M.t),
    tag(BILAN, "bilan", "30 s")
  ];
  startSeance("day", steps); R.res.checks = checksFor(i);
}
function coursSeance() {
  const steps = [
    tag({ t: "Le mini-cours de la semaine", run: el => { card(el, `<p class="prose">${MINICOURS.how}</p>`); card(el, `<p class="label">Structure</p><p class="keep">Destination, trois points, un exemple, boucle.</p>`, "tint") } }, "parole", "1 min", "mini-cours"),
    tag(exWrite(MINICOURS.fields, MINICOURS.topics, 300, "Prépare ton cours en mots-clés. Imagine un élève qui débute."), "parole", "5 min", "mini-cours"),
    tag(exTake(1, 180, "Fais ton cours en trois minutes, en t'enregistrant."), "parole", "3 min", "mini-cours"),
    tag(exReview(), "parole", "2 min", "mini-cours")
  ];
  startSeance("cours", steps); R.res.checks = MINICOURS.checks;
}
function chantSeance() {
  startSeance("chant", [...(S.centre == null ? [tag(CALIB, "chant", "30 s", "réglage")] : []), ...partSteps(CHANT, S.c, "chant", "1 min", "4 min")]);
}

function voixSeance() {
  const W = PARLER_WARM[(S.day + S.v.sess + S.v.mod) % PARLER_WARM.length];
  const steps = [];
  if (S.timbre == null && PARLER[S.v.mod].ex[0].k !== "find") steps.push(tag(exFind(), "voix", "1 min", "réglage"));
  steps.push(tag(exTimer({ t: W.t, how: W.how, sec: 60 }), "voix", "1 min", "échauffement"));
  steps.push(...partSteps(PARLER, S.v, "voix", "1 min", "3 min"));
  startSeance("voix", steps);
}
function checkSeance() {
  startSeance("check", [tag(exVoice({ t: "Contrôle express", how: "Trois « mm-hmm » pour te caler, puis lis le texte normalement.", mode: "read", text: 0 }), "voix", "1 min", "contrôle")]);
}

function finish() {
  cleanup();
  const body = $("#sBody"); $("#sBar").style.width = "100%"; $("#sFoot").hidden = true; body.innerHTML = "";
  $("#sKicker").className = "kicker bilan"; $("#sKicker").textContent = "Terminé"; $("#sWhere").textContent = "";
  const back = (label, hash) => { body.insertAdjacentHTML("beforeend", `<button class="btn big pri">${label}</button>`); body.lastElementChild.onclick = () => { location.hash = hash } };
  if (R.kind === "prep") {
    $("#sTitle").textContent = "Répétition terminée";
    card(body, `<p class="prose">Réécoute tes prises. Avant la vraie présentation : relis ta destination, respire longuement, et dis-toi « je suis prêt ».</p>`);
    back("Retour", "preparer"); return;
  }
  if (R.kind === "chant") {
    const st = S.c, M = CHANT[st.mod]; st.sess++; let msg;
    if (st.sess >= M.n && st.mod < CHANT.length - 1) { st.mod++; st.sess = 0; msg = `« ${M.t} » terminé. Prochaine séance : <b>${CHANT[st.mod].t}</b>.` }
    else msg = `Prochaine séance : encore « ${M.t} »${M.n < 99 ? ` (${st.sess + 1}/${M.n})` : ""}.`;
    save(); $("#sTitle").textContent = "Séance de chant terminée"; card(body, `<p class="prose">${msg}</p>`); back("Retour", "chant"); return;
  }
  if (R.kind === "voix") {
    const st = S.v, M = PARLER[st.mod]; st.sess++; let msg;
    if (st.sess >= M.n && st.mod < PARLER.length - 1) { st.mod++; st.sess = 0; msg = `« ${M.t} » terminé. Prochaine séance : <b>${PARLER[st.mod].t}</b>.` }
    else msg = `Prochaine séance : encore « ${M.t} »${M.n < 99 ? ` (${st.sess + 1}/${M.n})` : ""}.`;
    save(); $("#sTitle").textContent = "Séance de voix terminée"; card(body, `<p class="prose">${msg}</p>`); back("Retour", "parler"); return;
  }
  if (R.kind === "check") { $("#sTitle").textContent = "Contrôle terminé"; card(body, `<p class="prose">Dans la journée, cale ta première phrase de chaque réunion sur ta note naturelle.</p>`); back("Retour", "parler"); return }
  const yes = k => (R.res["check" + k] || []).filter(x => x === true).length, tot = k => (R.res["check" + k] || []).length;
  if (R.kind === "cours") {
    S.coursWeek = weekKey(); S.coursCount = (S.coursCount || 0) + 1; save();
    $("#sTitle").textContent = "Mini-cours terminé";
    card(body, `<p class="prose">Critères réussis : <b>${yes(1)} / ${tot(1)}</b>, <b>${rp(R.res.rep1)}</b>. Garde cet enregistrement en tête : dans quelques semaines, refais un cours sur le même sujet et compare.</p>`);
    back("Retour à l'accueil", ""); return;
  }
  markDone(); S.day++;
  if (R.res.note) S.notes = S.notes.concat({ d: today(), v: R.res.note }).slice(-120);
  const k = R.res.check2 ? 2 : 1;
  if (R.res["rep" + k] != null) push("rep", R.res["rep" + k]);
  if (tot(k)) push("struct", Math.round(yes(k) / tot(k) * 100));
  $("#sTitle").textContent = "Séance terminée";
  if (R.res.check1) card(body, `<p class="result">Prise 1 : <b>${yes(1)} / ${tot(1)}</b> · ${rp(R.res.rep1)}${R.res.check2 ? `<br>Prise 2 : <b>${yes(2)} / ${tot(2)}</b> · ${rp(R.res.rep2)}` : ""}</p>`, "tint");
  const st = S.r, M = REFLEXES[st.mod]; st.sess++;
  const c = card(body, ""); let btn = null;
  if (st.sess >= M.n && st.mod < REFLEXES.length - 1) {
    const prev = st.mod; st.mod++; st.sess = 0;
    c.innerHTML = `<p class="prose">Réflexe « ${M.t} » travaillé. Prochaine séance : <b>${REFLEXES[st.mod].t}</b>.</p>`;
    btn = ["Rester une séance de plus", () => { S.r.mod = prev; S.r.sess = M.n - 1 }];
  } else {
    c.innerHTML = `<p class="prose">Prochaine séance : encore « ${M.t} »${M.n < 99 ? ` (${st.sess + 1}/${M.n})` : ""}.</p>`;
    if (st.mod < REFLEXES.length - 1) btn = ["Passer au réflexe suivant", () => { S.r.mod++; S.r.sess = 0 }];
  }
  save();
  if (btn) { const b = document.createElement("button"); b.className = "btn sm"; b.textContent = btn[0]; b.onclick = () => { btn[1](); save(); b.disabled = true; b.textContent = "C'est noté" }; c.appendChild(b) }
  back("Retour à l'accueil", "");
}

/* ============ Écrans ============ */
function weekHtml() { const l = store.get("voix1:log", {}); let h = ""; const now = new Date(); for (let i = 6; i >= 0; i--) { const d = new Date(now); d.setDate(now.getDate() - i); h += `<i class="${l[dkey(d)] ? "on" : ""}" title="${d.toLocaleDateString("fr-FR", { weekday: "long" })}"></i>` } return h }
function stateText(M, st, noun) { return st.sess === 0 ? (noun || "Nouveau module") : "Pratique · séance " + (st.sess + 1) + (M.n < 99 ? " sur " + M.n : "") }
function renderHome() {
  const ds = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }); $("#date").textContent = ds.charAt(0).toUpperCase() + ds.slice(1);
  const done = !!store.get("voix1:log", {})[today()], st = streak();
  const M = REFLEXES[S.r.mod], next = S.r.mod < REFLEXES.length - 1;
  const mis = missionToday(), rec = (S.missions || []).find(x => x.d === today());
  const coursDone = S.coursWeek === weekKey(), coursTopic = MINICOURS.topics[Math.floor(dayIndex() / 7) % MINICOURS.topics.length];
  $("#homeBody").innerHTML = `
    <div><p class="section-label">Mission du jour</p><div class="card">
      <p class="keep" style="font-size:19px;line-height:1.4">${esc(mis)}</p>
      ${rec ? `<p class="small" style="color:${rec.done ? "var(--ok)" : "var(--muted)"};font-weight:600">${rec.done ? "Faite aujourd'hui. Bravo." : "Pas eu l'occasion aujourd'hui."}</p>` : `<p class="small muted">À appliquer dans tes conversations. Ce soir, dis-moi si tu l'as fait.</p><div class="row"><button class="btn sm pri" id="misYes">Je l'ai fait</button><button class="btn sm" id="misNo">Pas eu l'occasion</button></div>`}
    </div></div>
    <section class="hero-card">
      <div class="row between"><span class="eyebrow">Exercice du jour · 10 min</span><span class="xs muted">${st ? "Série : " + st + " j" : ""}</span></div>
      <div class="week">${weekHtml()}</div>
      <div class="group" style="background:var(--fill)"><div class="cell"><div class="ic parole">${S.r.mod + 1}</div><div class="t"><b>${esc(M.t)}</b><span>Réflexe ${S.r.mod + 1} sur ${REFLEXES.length} · ${stateText(M, S.r, "À découvrir")}</span></div></div></div>
      <p class="small muted">Écrire, dire, réécouter, refaire.</p>
      <button class="btn big pri" id="go">${done ? "Refaire un exercice" : "Commencer"}</button>
    </section>
    <div><p class="section-label">Mini-cours de la semaine</p><div class="group"><div class="cell"><div class="ic chant">✎</div><div class="t"><b>${esc(coursTopic)}</b><span>${coursDone ? "Fait cette semaine" : "3 minutes pour enseigner un sujet · 10 min en tout"}</span></div><button class="btn sm ${coursDone ? "" : "pri"}" id="goCours">${coursDone ? "Refaire" : "Faire"}</button></div></div></div>
    ${next ? `<div class="group"><button class="cell" id="skipR"><div class="t"><b>Passer au réflexe suivant</b><span>${esc(REFLEXES[S.r.mod + 1].t)}</span></div><span class="chev">›</span></button></div>` : ""}`;
  $("#go").onclick = seance;
  $("#goCours").onclick = () => { coursSeance(); R.res.topic = coursTopic };
  const rec_ = v => { S.missions = (S.missions || []).filter(x => x.d !== today()).concat({ d: today(), text: mis, done: v }).slice(-120); save(); renderHome() };
  const y = $("#misYes"); if (y) { y.onclick = () => rec_(true); $("#misNo").onclick = () => rec_(false) }
  const sk = $("#skipR"); if (sk) sk.onclick = () => { S.r.mod++; S.r.sess = 0; save(); renderHome() };
}
function renderChant() {
  const C = CHANT[S.c.mod];
  $("#chantBody").innerHTML = `<section class="hero-card">
      <span class="eyebrow">Séance de chant · 5 min</span>
      <div class="group" style="background:var(--fill)"><div class="cell"><div class="ic chant">♪</div><div class="t"><b>${esc(C.t)}</b><span>Module ${S.c.mod + 1} sur ${CHANT.length} · ${stateText(C, S.c)}</span></div></div></div>
      <button class="btn big pri" id="goChant">Commencer</button></section>`;
  $("#goChant").onclick = chantSeance;
  listModules($("#lChant"), CHANT, S.c, "c");
  $$("#lChant .cell").forEach(b => b.onclick = () => { S.c.mod = +b.dataset.i; S.c.sess = 0; save(); renderChant() });
  const r = S.m.range;
  $("#cStats").innerHTML = [
    [(S.m.souffle || []).length ? f1(Math.max(...S.m.souffle.map(x => x.v))) + " s" : "–", "record de souffle"],
    [last("stab") != null ? "±" + last("stab") + " cents" : "–", "stabilité d'une note"],
    [last("onset") != null ? last("onset") + " ms" : "–", "précision d'attaque"],
    [last("dyn") != null ? last("dyn") + " dB" : "–", "amplitude des nuances"],
    [r ? nom(r.lo) + " → " + nom(r.hi) : "–", "tessiture"],
    [S.m.passage ? nom(S.m.passage) : "–", "passage"]
  ].map(x => `<div class="stat"><b>${x[0]}</b><span>${x[1]}</span></div>`).join("");
  $("#cNote").textContent = S.centre != null ? nom(S.centre) : "–";
}
function renderParler() {
  const M = PARLER[S.v.mod], T = S.timbre;
  $("#parlerBody").innerHTML = `<section class="hero-card">
      <span class="eyebrow">Séance de voix · 5 min</span>
      <div class="group" style="background:var(--fill)"><div class="cell"><div class="ic voix">${S.v.mod + 1}</div><div class="t"><b>${esc(M.t)}</b><span>Module ${S.v.mod + 1} sur ${PARLER.length} · ${stateText(M, S.v)}</span></div></div></div>
      <p class="small muted">Échauffement d'une minute, puis l'exercice du module.</p>
      <button class="btn big pri" id="goVoix">Commencer</button></section>
    <div class="group"><button class="cell" id="goCheck"><div class="ic voix">✓</div><div class="t"><b>Contrôle express · 1 min</b><span>${T != null ? "Vérifie que ta voix est sur ta note aujourd'hui" : "Mesure d'abord ta note naturelle"}</span></div><span class="chev">›</span></button></div>
    <div><p class="section-label">Avant une réunion · 30 s</p><div class="card"><p class="prose" style="margin:0">Trois « mm-hmm », lèvres fermées. Une longue expiration. Ta première phrase sur la note du « mm-hmm ». Et si ta voix monte en cours de route : ralentis, respire au prochain point.</p></div></div>`;
  $("#goVoix").onclick = voixSeance;
  $("#goCheck").onclick = () => T != null ? checkSeance() : startSeance("check", [tag(exFind(), "voix", "1 min", "réglage")]);
  listModules($("#lVoix"), PARLER, S.v, "v");
  $$("#lVoix .cell").forEach(b => b.onclick = () => { S.v.mod = +b.dataset.i; S.v.sess = 0; save(); renderParler() });
  const a = k => S.m[k] || [], avg = (arr, n) => arr.length ? Math.round(mean(arr.slice(n).map(x => x.v))) : null;
  const z = a("zone"), fi = a("fins"), j = a("jump");
  $("#vStats").innerHTML = [
    [T != null ? nom(T) : "–", "note naturelle" + (T != null ? " · " + Math.round(m2f(T)) + " Hz" : "")],
    [z.length ? avg(z, -5) + " %" : "–", "dans ta zone" + (z.length > 5 ? " · au début " + avg(z.slice(0, 5), 0) + " %" : "")],
    [last("pvar") != null ? f1(last("pvar")) + " dt" : "–", "variation de la voix"],
    [fi.length ? avg(fi, -5) + " %" : "–", "fins de phrase pleines"],
    [j.length ? (last("jump") > 0 ? "+" : "") + f1(last("jump")) + " dt" : "–", "écart après une objection"],
    [(S.m.souffle || []).length ? f1(Math.max(...S.m.souffle.map(x => x.v))) + " s" : "–", "record de souffle"]
  ].map(x => `<div class="stat"><b>${x[0]}</b><span>${x[1]}</span></div>`).join("");
  $("#vNote").textContent = T != null ? nom(T) : "–";
}
$("#vDown").onclick = () => { S.timbre = (S.timbre != null ? S.timbre : timbre()) - .5; save(); renderParler() };
$("#vUp").onclick = () => { S.timbre = (S.timbre != null ? S.timbre : timbre()) + .5; save(); renderParler() };
function listModules(el, list, st, key) {
  el.innerHTML = list.map((M, i) => `<button class="cell ${i === st.mod ? "cur" : ""}" data-k="${key}" data-i="${i}"><div class="ic n">${i + 1}</div><div class="t"><b>${esc(M.t)}</b><span>${i === st.mod ? stateText(M, st, key === "r" ? "À découvrir" : "Nouveau module") : i < st.mod ? "Vu" : ""}</span></div>${i === st.mod ? '<span class="val">En cours</span>' : '<span class="chev">›</span>'}</button>`).join("");
}
function renderParcours() {
  listModules($("#lParole"), REFLEXES, S.r, "r");
  $$("#lParole .cell").forEach(b => b.onclick = () => { S.r.mod = +b.dataset.i; S.r.sess = 0; save(); renderParcours() });
  const reps = S.m.rep || [], str = S.m.struct || [], mis = S.missions || [];
  const avg = a => a.length ? f1(mean(a.map(x => x.v))) : "–";
  const stats = [
    [reps.length ? avg(reps.slice(-5)) : "–", "reprises par prise" + (reps.length > 5 ? " · au début " + avg(reps.slice(0, 5)) : "")],
    [str.length ? Math.round(mean(str.slice(-5).map(x => x.v))) + " %" : "–", "critères de structure réussis"],
    [mis.filter(x => x.done).length + " / " + mis.length, "missions faites"],
    [String(S.day), "exercices faits"],
    [String(S.coursCount || 0), "mini-cours donnés"]
  ];
  $("#stats").innerHTML = stats.map(s => `<div class="stat"><b>${s[0]}</b><span>${s[1]}</span></div>`).join("");
  $("#lMissions").innerHTML = mis.length ? mis.slice(-7).reverse().map(m => `<div class="cell"><div class="ic ${m.done ? "bilan" : "n"}">${m.done ? "✓" : "–"}</div><div class="t"><b style="font-weight:400">${esc(m.text)}</b><span>${m.d.split("-").reverse().slice(0, 2).join("/")}</span></div></div>`).join("") : '<div class="cell"><div class="t"><span>Tes missions apparaîtront ici.</span></div></div>';
}
$("#cDown").onclick = () => { S.centre = Math.max(43, centre() - 1); save(); renderChant() };
$("#cUp").onclick = () => { S.centre = Math.min(69, centre() + 1); save(); renderChant() };

/* Préparer */
const PF = { pSubject: "subject", pKey: "key", pP1: "p1", pP2: "p2", pP3: "p3", pObj: "obj" };
Object.entries(PF).forEach(([id, k]) => { const el = $("#" + id); el.value = S.prep[k] || ""; el.oninput = () => { S.prep[k] = el.value; save() } });
$("#pGo").onclick = () => {
  const P = S.prep, objs = (P.obj || "").split("\n").map(s => s.trim()).filter(Boolean);
  const pts = [P.p1, P.p2, P.p3].filter(Boolean);
  const summary = `<p class="label">Ta structure</p>${P.key ? `<p class="keep">${esc(P.key)}</p>` : '<p class="muted">Pas de destination : ajoute-la dans Préparer.</p>'}${pts.length ? `<ol style="margin:0;padding-left:1.2em">${pts.map(p => `<li>${esc(p)}</li>`).join("")}</ol>` : ""}`;
  const steps = [tag(exTakes({ t: "Répétition", how: "Présente comme pour de vrai : destination, nombre de points, mots-clés, boucle. Une objection va tomber pendant que tu parles : réponds, puis reviens à ta destination.", topic: P.subject || "Ta présentation", summary, sec: 120, takes: 2, pressureList: objs.length ? objs : LISTS.OBJ }), "parole", "5 min", "préparer")];
  if (objs.length) steps.push(tag(exRapid({ t: "Tes objections, une par une", how: "Pour chacune : reformuler, reconnaître, répondre.", items: objs, n: objs.length, sec: 45, checks: ["Reformulé", "Reconnu ce qui est juste", "Répondu sans me justifier"] }), "parole", "", "préparer"));
  startSeance("prep", steps);
};

/* Courbe libre */
$("#lStart").onclick = async () => { if (!(await startMic())) { micHelp($("#lBody"), () => $("#lStart").click()); return } $("#lStart").hidden = true; if (!$("#lBody").querySelector(".pw")) pitchWidget($("#lBody"), { half: 12, tol: 20 }) };

/* Test du micro */
$("#mtOpen").onclick = async () => {
  const out = $("#mtOut"); out.hidden = false; const lines = []; let verdict = "";
  const ua = navigator.userAgent, and = (ua.match(/Android [\d.]+/) || [""])[0], br = (ua.match(/(Chrome|CriOS|Firefox|SamsungBrowser|Version)\/[\d.]+/) || [""])[0];
  const render = () => { out.innerHTML = `<div class="meter"><i></i></div><p class="small">${verdict}</p><pre class="mono xs" style="white-space:pre-wrap;margin:0">${lines.join("\n")}</pre><button class="btn sm cp">Copier le rapport</button>`; out.querySelector(".cp").onclick = () => { navigator.clipboard?.writeText("Voix · diagnostic micro\n" + location.host + "\n" + lines.join("\n")).then(() => out.querySelector(".cp").textContent = "Copié", () => {}) } };
  const add = (ok, l, d) => { lines.push((ok === true ? "✓ " : ok === false ? "✗ " : "• ") + l + (d ? " : " + d : "")); render() };
  add(null, "Appareil", (and || "?") + " · " + (br || "?"));
  add(window.isSecureContext, "https", location.protocol);
  const pol = document.permissionsPolicy || document.featurePolicy;
  if (pol && pol.allowsFeature) { const ok = pol.allowsFeature("microphone"); add(ok, "Le site autorise le micro", ok ? "oui" : "non, bloqué par l'hébergeur") }
  try { const s = await navigator.permissions.query({ name: "microphone" }); add(s.state !== "denied", "Autorisation du navigateur", { granted: "accordée", prompt: "pas encore demandée", denied: "refusée" }[s.state] || s.state) } catch (e) {}
  if (!(await startMic())) { const e = micError || {}; add(false, "Ouverture du micro", (e.name || "?") + (e.message ? " – " + e.message : "")); verdict = "Le micro n'a pas pu s'ouvrir."; render(); micHelp(out, () => $("#mtOpen").click()); return }
  add(true, "Ouverture du micro", "ok"); add(A.ctx.state === "running", "Moteur audio", A.ctx.state);
  verdict = "Parle ou chante 5 secondes."; render();
  let max = 0, notes = 0; const t0 = nowS();
  await new Promise(done => { const f = s => { const i = out.querySelector(".meter i"); if (i) i.style.width = Math.min(100, Math.max(0, (20 * Math.log10(s.rms + 1e-6) + 60) / 50 * 100)) + "%"; max = Math.max(max, s.rms); if (s.midi != null) notes++; if (s.t - t0 > 5) { A.fn.delete(f); done() } }; A.fn.add(f) });
  add(max > .003, "Son capté", (20 * Math.log10(max + 1e-9)).toFixed(0) + " dB"); add(notes > 5, "Notes reconnues", String(notes));
  verdict = notes > 5 ? "Tout fonctionne." : "Le micro capte mal : rapproche-toi et refais le test."; render();
};

/* ============ Navigation ============ */
const SCREENS = ["home", "preparer", "parler", "chant", "parcours", "libre", "seance"];
function route() {
  let h = location.hash.slice(1);
  if (h === "seance" && !R.steps.length) h = "";
  if (h !== "seance") cleanup();
  const sc = SCREENS.includes(h) ? h : "home";
  SCREENS.forEach(s => $("#" + s).hidden = s !== sc);
  $("#tabbar").hidden = sc === "seance" || sc === "libre";
  $$(".tab").forEach(t => t.setAttribute("aria-current", (t.dataset.go || "home") === sc ? "page" : "false"));
  if (sc === "home") renderHome();
  if (sc === "parcours") renderParcours();
  if (sc === "chant") renderChant();
  if (sc === "parler") renderParler();
  if (sc !== "seance" && wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null }
  window.scrollTo({ top: 0 });
}
$$("[data-go]").forEach(b => b.onclick = () => { location.hash = b.dataset.go });
window.addEventListener("hashchange", route);
route();
if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
})();
