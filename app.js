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
const { LISTS, THEMES, VOCAB, PARLER_TEXTS } = window;

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
const old = store.get("voix1", {});
const S = Object.assign({ seen: {}, timbre: old.timbre != null ? old.timbre : null, words: [], m: { souffle: (old.m && old.m.souffle) || [] }, n: 0 }, store.get("voix2", {}));
const save = () => store.set("voix2", S);
const centre = () => S.timbre != null ? S.timbre + 4 : 55;
const push = (k, v) => { S.m[k] = (S.m[k] || []).concat({ d: today(), v }).slice(-90); save() };

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

function timerBox(el, sec, api, onStart) {
  el.insertAdjacentHTML("beforeend", `<div class="card timer"><span class="clock">${fmt(sec)}</span><button class="btn pri">Démarrer</button></div>`);
  const box = el.lastElementChild, clk = box.querySelector(".clock"), b = box.querySelector("button");
  let left = sec, run = false, lastT = 0, iv = null;
  const tick = () => { if (!api.alive()) { clearInterval(iv); return } if (!run) return; const t = nowS(); left -= t - lastT; lastT = t; clk.textContent = fmt(left); if (left <= 0) { run = false; clearInterval(iv); iv = null; beep(); box.classList.add("end"); b.textContent = "Encore"; left = sec } };
  b.onclick = () => { run = !run; lastT = nowS(); box.classList.remove("end"); if (run) { b.textContent = "Pause"; if (!iv) iv = setInterval(tick, 250); if (onStart) onStart() } else b.textContent = "Reprendre" };
  api.onClean(() => clearInterval(iv));
}
const card = (el, html, cls = "") => { el.insertAdjacentHTML("beforeend", `<div class="card ${cls}">${html}</div>`); return el.lastElementChild };


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
      const prev = S.timbre; S.timbre = T; save(); push("timbre", T);
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
    const text = free ? "" : PARLER_TEXTS[spec.text != null ? spec.text : S.n % PARLER_TEXTS.length];
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


/* ============ Exercices dans les fiches ============ */
/* Petit contexte d'exécution : tout ce qui écoute le micro est arrêté quand on change d'écran. */
const V = { tok: 0, clean: [] };
function cleanup() { V.tok++; V.clean.forEach(f => { try { f() } catch (e) {} }); V.clean = []; try { speechSynthesis.cancel() } catch (e) {} }
function mkApi() {
  const tok = V.tok;
  return { alive: () => V.tok === tok, on(fn) { A.fn.add(fn); V.clean.push(() => A.fn.delete(fn)) }, off(fn) { A.fn.delete(fn) }, onClean(fn) { V.clean.push(fn) } };
}

/* Enregistrement avec compteur, et interruptions parlées facultatives */
function recBox(el, api, { sec = 60, cut = null } = {}) {
  const c = card(el, `<div class="timer"><span class="clock">0:00</span><button class="btn pri go">M'enregistrer</button></div><p class="small muted hint">Objectif : ${sec >= 60 ? Math.round(sec / 60) + " min" : sec + " s"}.${cut ? " L'appli va t'interrompre." : ""}</p><div class="play"></div>`);
  const go = c.querySelector(".go"), clk = c.querySelector(".clock"), hint = c.querySelector(".hint"), play = c.querySelector(".play");
  let r = null, iv = null, t0 = 0, plan = [];
  const stop = () => { if (!r) return; r.stop(); r = null; clearInterval(iv); go.textContent = "Recommencer"; try { speechSynthesis.cancel() } catch (e) {} };
  go.onclick = async () => {
    if (r) { stop(); return }
    r = await recordInto(url => { play.innerHTML = `<audio controls src="${url}"></audio>`; });
    if (!r) { micHelp(el, () => go.click()); return }
    t0 = nowS(); go.textContent = "Arrêter"; play.innerHTML = "";
    plan = cut ? [sec * .3 + Math.random() * sec * .15, sec * .65 + Math.random() * sec * .1] : [];
    const pool = cut ? [...LISTS[cut]].sort(() => Math.random() - .5) : [];
    iv = setInterval(() => {
      const s = nowS() - t0; clk.textContent = fmt(s); clk.style.color = s >= sec ? "var(--ok)" : "";
      if (plan.length && s >= plan[0]) { plan.shift(); const o = pool.pop(); say(o); hint.innerHTML = `<b>« ${esc(o)} »</b>` }
      if (s > sec * 2 + 30) stop();
    }, 250);
  };
  api.onClean(() => { stop(); clearInterval(iv) });
}
function topicBox(el, list) {
  let topic = pick(LISTS[list]);
  const c = card(el, `<p class="label">Sujet</p><p class="topic">${esc(topic)}</p><button class="btn ghost sm other">Un autre sujet</button>`);
  c.querySelector(".other").onclick = () => { topic = pick(LISTS[list]); c.querySelector(".topic").textContent = topic };
}
function checksBox(el, checks) {
  if (!checks || !checks.length) return;
  card(el, `<p class="label">À la réécoute</p><ul class="ticks">${checks.map(x => `<li>${x}</li>`).join("")}</ul>`);
}
function trRec(el, api, sp) { topicBox(el, sp.list); recBox(el, api, { sec: sp.sec, cut: sp.cut }); checksBox(el, sp.checks) }
function trAsk(el, api, sp) {
  const pool = [...LISTS[sp.list]].sort(() => Math.random() - .5); let i = 0;
  const c = card(el, `<p class="label">L'appli te dit</p><p class="topic q">Appuie sur « Écouter ».</p><div class="row"><button class="btn pri sm hear">Écouter</button><button class="btn sm nx">Suivante</button></div>`);
  const q = c.querySelector(".q");
  const show = () => { q.textContent = pool[i % pool.length]; say(pool[i % pool.length]) };
  c.querySelector(".hear").onclick = show;
  c.querySelector(".nx").onclick = () => { i++; show() };
  recBox(el, api, { sec: 45 }); checksBox(el, sp.checks);
}
function trTimer(el, api, sp) { timerBox(el, sp.sec || 60, api) }
function runTrain(el, api, sp) {
  const box = document.createElement("div"); box.className = "stack"; el.appendChild(box);
  if (sp.how) box.insertAdjacentHTML("beforeend", `<p class="prose">${sp.how}</p>`);
  if (sp.k === "rec") trRec(box, api, sp);
  else if (sp.k === "ask") trAsk(box, api, sp);
  else if (sp.k === "timer") trTimer(box, api, sp);
  else {
    const ex = sp.k === "find" ? exFind() : sp.k === "breath" ? exBreath() : exVoice(Object.assign({ t: "" }, sp));
    if (!sp.how && ex.how) box.insertAdjacentHTML("beforeend", `<p class="prose">${ex.how}</p>`);
    ex.run(box, api);
  }
}

/* ============ Vocabulaire : répétition espacée ============ */
const DAYS = [0, 1, 3, 7, 14, 30, 60];
const addDays = n => { const d = new Date(); d.setDate(d.getDate() + n); return dkey(d) };
const due = () => S.words.filter(w => w.due <= today());
const hasWord = w => S.words.some(x => x.w.toLowerCase() === w.toLowerCase());
function addWord(w, d, e) {
  if (!w.trim() || !d.trim() || hasWord(w.trim())) return false;
  S.words.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), w: w.trim(), d: d.trim(), e: (e || "").trim(), box: 0, due: today() }); save(); return true;
}

/* ============ Écrans ============ */
const view = $("#view");
const ICON = { fond: "parole", voix: "voix", corps: "corps", echange: "echange", mots: "mots" };
const back = (label, hash) => `<button class="back" data-href="${hash}"><span aria-hidden="true">‹</span> ${esc(label)}</button>`;
const cellLink = (href, title, sub, right = '<span class="chev">›</span>', lead = "") => `<button class="cell" data-href="${href}">${lead}<div class="t"><b>${title}</b>${sub ? `<span>${sub}</span>` : ""}</div>${right}</button>`;
const seenMark = () => '<span class="chev">›</span>';

function renderTheme(T) {
  view.innerHTML = `
    <header><h1 class="large">${T.t}</h1><p class="sub">${T.sub}</p></header>
    <div class="group">${T.fiches.map((f, i) => cellLink("f/" + f.id, esc(f.t), esc(f.sub), seenMark(f.id), `<div class="ic ${ICON[T.id]}">${i + 1}</div>`)).join("")}</div>`;
}

function findFiche(id) {
  for (const T of THEMES) { const i = T.fiches.findIndex(f => f.id === id); if (i >= 0) return { T, F: T.fiches[i], i, list: T.fiches } }
  const i = VOCAB.findIndex(f => f.id === id); if (i >= 0) return { T: { id: "mots", t: "Mots" }, F: VOCAB[i], i, list: VOCAB, vocab: true };
  return null;
}

function renderFiche(id, tab) {
  const r = findFiche(id); if (!r) { location.hash = ""; return }
  const { T, F, i, list, vocab } = r;
  const trains = F.train ? [].concat(F.train) : [];
  const tabs = [["comprendre", "Comprendre"]];
  if (vocab) tabs.push(["mots", "Les mots"]); else if (trains.length) tabs.push(["entrainer", "S'entraîner"]);
  tabs.push(["quotidien", "Au quotidien"]);
  const cur = tabs.some(t => t[0] === tab) ? tab : "comprendre";
  const next = list[i + 1];
  view.innerHTML = `
    ${back(T.t, T.id)}
    <header><p class="eyebrow ${ICON[T.id]}">${T.t} · ${i + 1} sur ${list.length}</p><h1 class="title">${esc(F.t)}</h1></header>
    <div class="keycard"><p>${F.key}</p></div>
    <div class="seg" role="tablist">${tabs.map(t => `<button role="tab" aria-selected="${t[0] === cur}" data-href="f/${F.id}/${t[0]}">${t[1]}</button>`).join("")}</div>
    <div class="stack" id="panel"></div>
    ${next ? `<div class="group">${cellLink("f/" + next.id, "Fiche suivante", esc(next.t))}</div>` : ""}`;
  const p = $("#panel");
  if (cur === "comprendre") {
    p.insertAdjacentHTML("beforeend", `<p class="prose">${F.why}</p>`);
    if (F.how) card(p, `<p class="label">Comment</p><ol class="steps">${F.how.map(h => `<li>${h}</li>`).join("")}</ol>`);
    if (F.ex) card(p, `<p class="label">Exemple</p>${F.ex.q ? `<p class="small muted">« ${F.ex.q} »</p>` : ""}${F.ex.bad ? `<p class="ex bad"><span>Au lieu de</span>${F.ex.bad}</p>` : ""}<p class="ex good"><span>${F.ex.bad ? "Dis plutôt" : "Par exemple"}</span>${F.ex.good}</p>`);
  } else if (cur === "entrainer") {
    const api = mkApi();
    trains.forEach((sp, k) => { if (trains.length > 1) p.insertAdjacentHTML("beforeend", `<p class="section-label" style="padding-left:0">${k + 1}. ${sp.k === "find" ? "Trouver ta note" : sp.k === "breath" ? "Le souffle" : "Parler"}</p>`); runTrain(p, api, sp) });
  } else if (cur === "mots") {
    const all = F.words.every(w => hasWord(w[0]));
    p.innerHTML = `<div class="group">${F.words.map(w => `<div class="cell"><div class="t"><b>${esc(w[0])}</b><span>${esc(w[1])}</span></div><button class="btn sm add" data-w="${esc(w[0])}" ${hasWord(w[0]) ? "disabled" : ""}>${hasWord(w[0]) ? "Ajouté" : "Ajouter"}</button></div>`).join("")}</div>
      <button class="btn big ${all ? "" : "pri"}" id="addAll" ${all ? "disabled" : ""}>${all ? "Tous les mots sont dans ton paquet" : "Tout ajouter à mon paquet"}</button>`;
    const addOne = w => { const x = F.words.find(y => y[0] === w); if (x) addWord(x[0], x[1], x[2]) };
    $$("#panel .add").forEach(b => b.onclick = () => { addOne(b.dataset.w); renderFiche(F.id, "mots") });
    $("#addAll").onclick = () => { F.words.forEach(w => addOne(w[0])); renderFiche(F.id, "mots") };
  } else {
    card(p, `<p class="label">À essayer</p><p class="daily">${F.daily}</p>`);
    p.insertAdjacentHTML("beforeend", `<p class="foot-note" style="padding:0 4px">Sans obligation : essaie-le quand l'occasion se présente.</p>`);
  }
  bindLinks();
}

function renderMots() {
  const d = due().length, n = S.words.length;
  view.innerHTML = `
    <header><h1 class="large">Mots</h1><p class="sub">Enrichir ton vocabulaire, mot après mot.</p></header>
    <section class="hero">
      <p class="big-num">${d}</p><p class="muted">${n ? (d ? `mot${d > 1 ? "s" : ""} à revoir aujourd'hui` : "Rien à revoir aujourd'hui") : "Ton paquet est vide"}</p>
      ${n ? `<button class="btn big ${d ? "pri" : ""}" data-href="reviser">${d ? "Réviser" : "Réviser quand même"}</button>` : `<button class="btn big pri" data-href="ajouter">Ajouter un premier mot</button>`}
    </section>
    <div class="group">
      ${cellLink("ajouter", "Ajouter un mot", "")}
      ${cellLink("paquet", "Mon paquet", n + " mot" + (n > 1 ? "s" : ""))}
    </div>
    <div><p class="section-label">Fiches de vocabulaire</p>
    <div class="group">${VOCAB.map((f, i) => cellLink("f/" + f.id, esc(f.t), esc(f.sub), seenMark(f.id), `<div class="ic mots">${i + 1}</div>`)).join("")}</div></div>`;
  bindLinks();
}

function renderAdd(id) {
  const w = id ? S.words.find(x => x.id === id) : null;
  view.innerHTML = `
    ${back(w ? "Mon paquet" : "Mots", w ? "paquet" : "mots")}
    <header><h1 class="title">${w ? "Modifier le mot" : "Ajouter un mot"}</h1></header>
    <div class="card fields">
      <label>Mot<input id="aW" autocomplete="off" autocapitalize="off" value="${w ? esc(w.w) : ""}"></label>
      <label>Définition<textarea id="aD" rows="2">${w ? esc(w.d) : ""}</textarea></label>
      <label>Exemple <span class="opt">facultatif</span><textarea id="aE" rows="2" placeholder="Une phrase où tu l'utilises">${w ? esc(w.e) : ""}</textarea></label>
    </div>
    <button class="btn big pri" id="aSave">${w ? "Enregistrer" : "Ajouter au paquet"}</button>
    <p class="small" id="aMsg" style="text-align:center;min-height:1.4em"></p>
    ${w ? '<button class="btn big danger" id="aDel">Supprimer ce mot</button>' : ""}`;
  bindLinks();
  const msg = $("#aMsg");
  $("#aSave").onclick = () => {
    const W = $("#aW").value.trim(), Dd = $("#aD").value.trim(), E = $("#aE").value.trim();
    if (!W || !Dd) { msg.textContent = "Il faut un mot et une définition."; return }
    if (w) { w.w = W; w.d = Dd; w.e = E; save(); location.hash = "paquet"; return }
    if (!addWord(W, Dd, E)) { msg.textContent = "Ce mot est déjà dans ton paquet."; return }
    $("#aW").value = $("#aD").value = $("#aE").value = ""; msg.textContent = "« " + W + " » ajouté."; $("#aW").focus();
  };
  if (w) $("#aDel").onclick = () => { if (confirm("Supprimer « " + w.w + " » ?")) { S.words = S.words.filter(x => x !== w); save(); location.hash = "paquet" } };
}

function renderPaquet() {
  const ws = [...S.words].sort((a, b) => a.w.localeCompare(b.w, "fr"));
  const lvl = w => w.box >= 4 ? "Acquis" : w.due <= today() ? "À revoir" : "En cours";
  view.innerHTML = `
    ${back("Mots", "mots")}
    <header><h1 class="title">Mon paquet</h1><p class="sub">${ws.length} mot${ws.length > 1 ? "s" : ""} · ${ws.filter(w => w.box >= 4).length} acquis</p></header>
    ${ws.length ? `<div class="group">${ws.map(w => cellLink("ajouter/" + w.id, esc(w.w), esc(w.d), `<span class="val">${lvl(w)}</span>`)).join("")}</div><p class="foot-note">Touche un mot pour le modifier.</p>` : `<div class="card"><p class="muted">Ajoute des mots toi-même, ou depuis les fiches de vocabulaire.</p></div>`}`;
  bindLinks();
}

/* Révision : une carte à la fois */
const RV = { q: [], i: 0, ok: 0, flip: false };
function startReview() {
  let q = due(); if (!q.length) q = [...S.words].sort(() => Math.random() - .5).slice(0, 10);
  RV.q = q.sort(() => Math.random() - .5).slice(0, 20).map(w => ({ w, mode: w.e && Math.random() < .25 ? "use" : Math.random() < .5 ? "def2w" : "w2def" }));
  RV.i = 0; RV.ok = 0; RV.flip = false; renderReview();
}
function renderReview() {
  if (!RV.q.length) { location.hash = "mots"; return }
  if (RV.i >= RV.q.length) {
    view.innerHTML = `${back("Mots", "mots")}<section class="hero"><p class="big-num">${RV.ok}/${RV.q.length}</p><p class="muted">mots retrouvés</p><button class="btn big pri" data-href="mots">Terminer</button></section>`;
    bindLinks(); return;
  }
  const { w, mode } = RV.q[RV.i];
  const ask = mode === "def2w" ? ["Quel est le mot ?", esc(w.d)] : mode === "w2def" ? ["Que veut dire ce mot ?", esc(w.w)] : ["Utilise-le à voix haute dans une phrase", esc(w.w)];
  const ans = mode === "def2w" ? `<p class="flash-a">${esc(w.w)}</p>` : `<p class="prose">${esc(w.d)}</p>`;
  view.innerHTML = `
    <div class="rv-top">${back("Mots", "mots")}<span class="small muted">${RV.i + 1} / ${RV.q.length}</span></div>
    <div class="bar"><i style="width:${RV.i / RV.q.length * 100}%"></i></div>
    <section class="flash">
      <p class="label">${ask[0]}</p>
      <p class="${mode === "def2w" ? "flash-d" : "flash-w"}">${ask[1]}</p>
      ${RV.flip ? `<div class="flash-back">${ans}${w.e ? `<p class="small muted">« ${esc(w.e)} »</p>` : ""}</div>` : ""}
    </section>
    ${RV.flip ? `<div class="pair"><button class="btn big" id="rNo">À revoir</button><button class="btn big pri" id="rYes">Je savais</button></div>` : `<button class="btn big pri" id="rFlip">${mode === "use" ? "Voir la définition" : "Retourner la carte"}</button>`}
    <p class="foot-note" style="text-align:center">${RV.flip ? "Sois honnête : c'est ce qui fait revenir les bons mots." : "Réponds de tête, puis retourne la carte."}</p>`;
  bindLinks();
  if (!RV.flip) $("#rFlip").onclick = () => { RV.flip = true; renderReview() };
  else {
    $("#rYes").onclick = () => { w.box = Math.min(DAYS.length - 1, w.box + 1); w.due = addDays(DAYS[w.box]); RV.ok++; save(); RV.i++; RV.flip = false; renderReview() };
    $("#rNo").onclick = () => { w.box = 0; w.due = today(); save(); RV.q.push({ w, mode: RV.q[RV.i].mode }); RV.i++; RV.flip = false; renderReview() };
  }
}

/* ============ Navigation ============ */
function bindLinks() { $$("#view [data-href]").forEach(b => b.onclick = () => { location.hash = b.dataset.href }) }
function route() {
  cleanup();
  const h = location.hash.slice(1), [a, b, c] = h.split("/");
  const tabId = THEMES.some(T => T.id === a) ? a : a === "mots" || a === "reviser" || a === "ajouter" || a === "paquet" ? "mots" : a === "f" ? (findFiche(b) || { T: { id: "fond" } }).T.id : "fond";
  $$(".tab").forEach(t => t.setAttribute("aria-current", t.dataset.go === tabId ? "page" : "false"));
  const T = THEMES.find(T => T.id === a);
  if (a === "f") renderFiche(b, c);
  else if (a === "mots") renderMots();
  else if (a === "ajouter") renderAdd(b);
  else if (a === "paquet") renderPaquet();
  else if (a === "reviser") startReview();
  else renderTheme(T || THEMES[0]);
  if (a !== "f" || !c) window.scrollTo({ top: 0 });
  bindLinks();
}
$$(".tab").forEach(b => b.onclick = () => { location.hash = b.dataset.go });
window.addEventListener("hashchange", route);
route();
if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
})();
