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
const { CHANT, PAROLE, LISTS, REWRITES, FEAR, DEFIS, SPEECH_TEXT, EMO_PHRASE } = window;

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
  c: { mod: 0, sess: 0 }, p: { mod: 0, sess: 0 }, day: 0, defi: 0, defisDone: [],
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
const KICK = { chant: "Chant", parole: "Parole", bilan: "Bilan" };
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

const BILAN = { t: "Bilan", run: (el, api) => {
  const F = FEAR[S.day % FEAR.length];
  card(el, `<p class="label">Ta confiance à l'oral aujourd'hui</p><div class="stars">${[1, 2, 3, 4, 5].map(i => `<button aria-pressed="false" aria-label="${i} sur 5">${i}</button>`).join("")}</div>`);
  el.querySelectorAll(".stars button").forEach((b, i) => b.onclick = () => { el.querySelectorAll(".stars button").forEach((x, j) => x.setAttribute("aria-pressed", j <= i)); api.res.conf = i + 1 });
  card(el, `<p class="label">Le regard des autres · ${F[0]}</p><p class="prose">${F[1]}</p>`);
  if (S.defi < DEFIS.length) card(el, `<p class="label">Défi réel de la semaine</p><p class="keep">${DEFIS[S.defi]}</p><p class="small muted">Coche-le sur l'écran Aujourd'hui quand c'est fait.</p>`);
  const c = card(el, `<label class="label" for="nextFocus">La prochaine fois, je veux améliorer</label><textarea id="nextFocus" placeholder="Ex. : annoncer mon plan dès la première phrase"></textarea>`);
  const ta = c.querySelector("textarea"); ta.oninput = () => { api.res.note = ta.value.trim() };
} };

function seance() {
  const steps = [
    ...(S.centre == null ? [tag(CALIB, "chant", "30 s", "réglage")] : []),
    ...partSteps(CHANT, S.c, "chant", "1 min", "4 min"),
    ...partSteps(PAROLE, S.p, "parole", "2 min", "8 min"),
    tag(BILAN, "bilan", "1 min")
  ];
  startSeance("day", steps);
}

function finish() {
  cleanup();
  const body = $("#sBody"); $("#sBar").style.width = "100%"; $("#sFoot").hidden = true; body.innerHTML = "";
  $("#sKicker").className = "kicker bilan"; $("#sKicker").textContent = "Terminé"; $("#sWhere").textContent = "";
  if (R.kind === "prep") {
    $("#sTitle").textContent = "Répétition terminée";
    card(body, `<p class="prose">Réécoute tes prises. Avant la vraie présentation : relis ton message clé, trois respirations longues, et « je suis excité ».</p>`);
    body.insertAdjacentHTML("beforeend", `<button class="btn big pri">Retour</button>`); body.lastElementChild.onclick = () => { location.hash = "preparer" }; return;
  }
  markDone(); S.day++;
  if (R.res.conf) S.conf = S.conf.concat({ d: today(), v: R.res.conf }).slice(-120);
  if (R.res.note) S.notes = S.notes.concat({ d: today(), v: R.res.note }).slice(-120);
  $("#sTitle").textContent = "Séance terminée";
  const lines = [];
  [["c", CHANT, "Chant"], ["p", PAROLE, "Parole"]].forEach(([key, list, label]) => {
    const st = S[key], M = list[st.mod]; st.sess++;
    if (st.sess >= M.n && st.mod < list.length - 1) { lines.push({ key, label, text: `« ${M.t} » terminé. Prochaine séance : <b>${list[st.mod + 1].t}</b>.`, stay: true, prevMod: st.mod, n: M.n }); st.mod++; st.sess = 0 }
    else lines.push({ key, label, text: `Prochaine séance : encore « ${M.t} »${M.n < 99 ? ` (${st.sess + 1}/${M.n})` : ""}.`, skip: st.mod < list.length - 1, list });
  });
  save();
  const g = document.createElement("div"); g.className = "group"; body.appendChild(g);
  lines.forEach(L => {
    const cell = document.createElement("div"); cell.className = "cell";
    cell.innerHTML = `<div class="ic ${L.key === "c" ? "chant" : "parole"}">${L.key === "c" ? "♪" : "”"}</div><div class="t"><b>${L.label}</b><span>${L.text}</span></div>`;
    if (L.stay || L.skip) {
      const b = document.createElement("button"); b.className = "btn sm"; b.textContent = L.stay ? "Rester" : "Passer";
      b.onclick = () => { const st = S[L.key]; if (L.stay) { st.mod = L.prevMod; st.sess = L.n - 1 } else { st.mod++; st.sess = 0 } save(); b.disabled = true; b.textContent = "OK" };
      cell.appendChild(b);
    }
    g.appendChild(cell);
  });
  body.insertAdjacentHTML("beforeend", `<button class="btn big pri">Retour à l'accueil</button>`); body.lastElementChild.onclick = () => { location.hash = "" };
}

/* ============ Écrans ============ */
function weekHtml() { const l = store.get("voix1:log", {}); let h = ""; const now = new Date(); for (let i = 6; i >= 0; i--) { const d = new Date(now); d.setDate(now.getDate() - i); h += `<i class="${l[dkey(d)] ? "on" : ""}" title="${d.toLocaleDateString("fr-FR", { weekday: "long" })}"></i>` } return h }
function stateText(M, st) { return st.sess === 0 ? "Nouveau module" : "Pratique · séance " + (st.sess + 1) + (M.n < 99 ? " sur " + M.n : "") }
function renderHome() {
  const ds = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }); $("#date").textContent = ds.charAt(0).toUpperCase() + ds.slice(1);
  const done = !!store.get("voix1:log", {})[today()], st = streak();
  const C = CHANT[S.c.mod], P = PAROLE[S.p.mod];
  const nextC = S.c.mod < CHANT.length - 1, nextP = S.p.mod < PAROLE.length - 1;
  $("#homeBody").innerHTML = `
    <section class="hero-card">
      <div class="row between"><span class="eyebrow">Séance du jour · 15 min</span><span class="xs muted">${st ? "Série : " + st + " j" : ""}</span></div>
      <div class="week">${weekHtml()}</div>
      <div class="group" style="background:var(--fill)">
        <div class="cell"><div class="ic chant">♪</div><div class="t"><b>${esc(C.t)}</b><span>Chant · ${stateText(C, S.c)}</span></div><span class="val">5 min</span></div>
        <div class="cell"><div class="ic parole">”</div><div class="t"><b>${esc(P.t)}</b><span>Parole · ${stateText(P, S.p)}</span></div><span class="val">10 min</span></div>
      </div>
      <button class="btn big pri" id="go">${done ? "Refaire une séance" : "Commencer"}</button>
      ${done ? '<p class="small muted" style="text-align:center">Séance du jour faite. Bravo.</p>' : ""}
    </section>
    ${S.defi < DEFIS.length ? `<div><p class="section-label">Défi réel de la semaine</p><div class="group"><div class="cell"><div class="ic defi">!</div><div class="t"><b style="font-weight:500">${esc(DEFIS[S.defi])}</b></div><button class="btn sm pri" id="defiDone">Fait</button></div></div></div>` : ""}
    <div><p class="section-label">Avancer plus vite</p><div class="group">
      ${nextC ? `<button class="cell" id="skipC"><div class="t"><b>Chant : passer au module suivant</b><span>${esc(CHANT[S.c.mod + 1].t)}</span></div><span class="chev">›</span></button>` : ""}
      ${nextP ? `<button class="cell" id="skipP"><div class="t"><b>Parole : passer au module suivant</b><span>${esc(PAROLE[S.p.mod + 1].t)}</span></div><span class="chev">›</span></button>` : ""}
    </div></div>`;
  $("#go").onclick = seance;
  const dd = $("#defiDone"); if (dd) dd.onclick = () => { S.defisDone = (S.defisDone || []).concat({ d: today(), i: S.defi }); S.defi++; save(); renderHome() };
  const sc = $("#skipC"); if (sc) sc.onclick = () => { S.c.mod++; S.c.sess = 0; save(); renderHome() };
  const sp = $("#skipP"); if (sp) sp.onclick = () => { S.p.mod++; S.p.sess = 0; save(); renderHome() };
}
function listModules(el, list, st, key) {
  el.innerHTML = list.map((M, i) => `<button class="cell ${i === st.mod ? "cur" : ""}" data-k="${key}" data-i="${i}"><div class="ic n">${i + 1}</div><div class="t"><b>${esc(M.t)}</b><span>${i === st.mod ? stateText(M, st) : i < st.mod ? "Vu" : ""}</span></div>${i === st.mod ? '<span class="val">En cours</span>' : '<span class="chev">›</span>'}</button>`).join("");
}
function renderParcours() {
  listModules($("#lChant"), CHANT, S.c, "c"); listModules($("#lParole"), PAROLE, S.p, "p");
  $$("#lChant .cell, #lParole .cell").forEach(b => b.onclick = () => { const st = S[b.dataset.k]; st.mod = +b.dataset.i; st.sess = 0; save(); renderParcours() });
  $("#lDefis").innerHTML = DEFIS.map((d, i) => `<button class="cell ${i === S.defi ? "cur" : ""}" data-d="${i}"><div class="ic ${i < S.defi ? "bilan" : "n"}">${i < S.defi ? "✓" : i + 1}</div><div class="t"><b style="font-weight:${i === S.defi ? 600 : 400}">${esc(d)}</b></div></button>`).join("");
  $$("#lDefis .cell").forEach(b => b.onclick = () => { S.defi = +b.dataset.d; save(); renderParcours() });
  const conf = S.conf.slice(-5), r = S.m.range;
  const stats = [
    [last("euh") != null ? f1(last("euh")) + " /min" : "–", "« euh »"],
    [last("doute") != null ? f1(last("doute")) + " /min" : "–", "mots de doute"],
    [conf.length ? f1(mean(conf.map(x => x.v))) + " / 5" : "–", "confiance (5 dernières)"],
    [(S.m.souffle || []).length ? f1(Math.max(...S.m.souffle.map(x => x.v))) + " s" : "–", "record de souffle"],
    [last("stab") != null ? "±" + last("stab") + " cents" : "–", "stabilité d'une note"],
    [last("onset") != null ? last("onset") + " ms" : "–", "précision d'attaque"],
    [last("dyn") != null ? last("dyn") + " dB" : "–", "amplitude des nuances"],
    [r ? nom(r.lo) + " → " + nom(r.hi) : "–", "tessiture" + (S.m.passage ? " · passage " + nom(S.m.passage) : "")]
  ];
  $("#stats").innerHTML = stats.map(s => `<div class="stat"><b>${s[0]}</b><span>${s[1]}</span></div>`).join("");
  $("#cNote").textContent = S.centre != null ? nom(S.centre) : "–";
}
$("#cDown").onclick = () => { S.centre = Math.max(43, centre() - 1); save(); renderParcours() };
$("#cUp").onclick = () => { S.centre = Math.min(69, centre() + 1); save(); renderParcours() };

/* Préparer */
const PF = { pSubject: "subject", pKey: "key", pP1: "p1", pP2: "p2", pP3: "p3", pObj: "obj" };
Object.entries(PF).forEach(([id, k]) => { const el = $("#" + id); el.value = S.prep[k] || ""; el.oninput = () => { S.prep[k] = el.value; save() } });
$("#pGo").onclick = () => {
  const P = S.prep, objs = (P.obj || "").split("\n").map(s => s.trim()).filter(Boolean);
  const pts = [P.p1, P.p2, P.p3].filter(Boolean);
  const summary = `<p class="label">Ta structure</p>${P.key ? `<p class="keep">${esc(P.key)}</p>` : '<p class="muted">Pas de message clé : ajoute-le dans Préparer.</p>'}${pts.length ? `<ol style="margin:0;padding-left:1.2em">${pts.map(p => `<li>${esc(p)}</li>`).join("")}</ol>` : ""}`;
  const steps = [tag(exTakes({ t: "Répétition", how: "Présente comme pour de vrai. Une objection va tomber pendant que tu parles : réponds, puis reviens à ton message clé.", topic: P.subject || "Ta présentation", summary, sec: 120, takes: 2, pressureList: objs.length ? objs : LISTS.OBJ }), "parole", "5 min", "préparer")];
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
const SCREENS = ["home", "preparer", "parcours", "libre", "seance"];
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
  if (sc !== "seance" && wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null }
  window.scrollTo({ top: 0 });
}
$$("[data-go]").forEach(b => b.onclick = () => { location.hash = b.dataset.go });
window.addEventListener("hashchange", route);
route();
if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
})();
