// Jal Lijiye: a water buddy. Shortcuts opens this page with ?remind at set times.
// Change the reminder hours here (24-hour clock). The daily goal follows the list.
const SCHEDULE = [8, 10, 12, 14, 16, 18, 20, 22];
const GOAL = SCHEDULE.length;

const $ = (id) => document.getElementById(id);
const body = document.body;
const jal = $("jal");

// ---------- today's count, kept on this phone only ----------

function todayKey() {
  const d = new Date();
  return `jal-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
function getCount() {
  try { return Number(localStorage.getItem(todayKey())) || 0; } catch { return 0; }
}
function setCount(n) {
  try { localStorage.setItem(todayKey(), String(n)); } catch { /* private mode: count lasts this visit only */ }
}

// ---------- words ----------

function timeLabel(h) {
  const part = h < 12 ? "subah" : h < 16 ? "dopahar" : h < 20 ? "shaam" : "raat";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${part} ${h12} baje`;
}
function nextReminder() {
  const now = new Date().getHours();
  const h = SCHEDULE.find((x) => x > now);
  return h === undefined ? `Agla glass kal ${timeLabel(SCHEDULE[0])}` : `Agla glass ${timeLabel(h)}`;
}

// ---------- render ----------

const MINI = `<svg viewBox="0 0 24 30" aria-hidden="true">
  <path class="g-water" d="M4.6 10 L6.3 26 Q6.5 27.5 8 27.5 L16 27.5 Q17.5 27.5 17.7 26 L19.4 10 Z"/>
  <path class="g-line" d="M3 3 L6 26 Q6.3 28 8 28 L16 28 Q17.7 28 18 26 L21 3 Z"/></svg>`;

function render(justFilled = -1) {
  const n = getCount();
  const box = $("glasses");
  box.innerHTML = "";
  for (let i = 0; i < GOAL; i++) {
    const s = document.createElement("span");
    s.innerHTML = MINI;
    if (i < n) s.classList.add("full");
    if (i === justFilled) s.classList.add("just");
    box.appendChild(s);
  }
  box.setAttribute("aria-label", `Aaj ${n} of ${GOAL} glass`);
  $("count").textContent =
    n === 0 ? "Aaj abhi tak koi glass nahi" :
    n >= GOAL ? `Aaj ${n} glass. Poora ho gaya!` :
    `Aaj ${n} / ${GOAL} glass`;
  $("next").textContent = nextReminder();
}

// ---------- sound: three synthesized gulps, no audio files ----------

let audio;
function glugGlug() {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === "suspended") audio.resume();
    const t0 = audio.currentTime + 0.05;
    [0, 0.34, 0.7].forEach((offset, i) => gulp(t0 + offset, 1 - i * 0.08));
  } catch { /* no sound is fine */ }
}
function gulp(t, pitch) {
  const a = audio;
  // the swallow: a low "glk" that drops in pitch
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(330 * pitch, t);
  o.frequency.exponentialRampToValueAtTime(95 * pitch, t + 0.12);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.7, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.17);
  o.connect(g).connect(a.destination);
  o.start(t); o.stop(t + 0.2);
  // the bubble: a short rising "op"
  const b = a.createOscillator();
  const bg = a.createGain();
  b.type = "sine";
  b.frequency.setValueAtTime(480 * pitch, t + 0.11);
  b.frequency.exponentialRampToValueAtTime(1150 * pitch, t + 0.17);
  bg.gain.setValueAtTime(0.0001, t + 0.11);
  bg.gain.exponentialRampToValueAtTime(0.28, t + 0.125);
  bg.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  b.connect(bg).connect(a.destination);
  b.start(t + 0.11); b.stop(t + 0.22);
}

// ---------- the moments ----------

let busy = false;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

function say(main, sub) {
  $("say").textContent = main;
  $("sub").textContent = sub;
}

function comeDown() {
  if (busy || body.dataset.state === "down") return;
  jal.classList.add("instant");
  jal.classList.remove("drained");
  jal.dataset.face = "ask";
  say("Jal lijiye!", "Ek glass ho jaaye?");
  body.dataset.state = "down";
  requestAnimationFrame(() => jal.classList.remove("instant"));
  setTimeout(() => $("drink").focus({ preventScroll: true }), 900);
}

async function goUp() {
  body.dataset.state = "up";
  await wait(reduced ? 50 : 650);
  body.dataset.state = "peek";
  jal.dataset.face = "ask";
  jal.classList.add("instant");
  jal.classList.remove("drained");
  busy = false;
  delete body.dataset.busy;
}

async function drink() {
  if (busy) return;
  busy = true;
  body.dataset.busy = "";
  jal.dataset.face = "drink";
  glugGlug();
  jal.classList.add("drained");
  await wait(reduced ? 300 : 1250);

  const n = getCount() + 1;
  setCount(n);
  render(n - 1);
  jal.dataset.face = "happy";
  say("Shabaash!", n >= GOAL ? "Aaj ka poora ho gaya." : `${n} / ${GOAL} ho gaye.`);
  await wait(1700);
  goUp();
}

async function later() {
  if (busy) return;
  busy = true;
  body.dataset.busy = "";
  say("Theek hai.", nextReminder().replace("Agla glass", "Phir milte hain"));
  await wait(1100);
  goUp();
}

// ---------- wire up ----------

$("drink").addEventListener("click", drink);
$("later").addEventListener("click", later);
$("buddyHit").addEventListener("click", comeDown);

const remindUrl = location.origin + location.pathname + "?remind";
$("remindUrl").textContent = remindUrl;
$("copy").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(remindUrl); $("copy").textContent = "Copied"; }
  catch { $("copy").textContent = "Select and copy"; }
});

// Refresh the count and next time when the page comes back (new day, next hour).
document.addEventListener("visibilitychange", () => { if (!document.hidden) render(); });

render();
if (new URLSearchParams(location.search).has("remind")) {
  history.replaceState(null, "", location.pathname); // a reload won't call Jal again
  setTimeout(comeDown, 350);
}
