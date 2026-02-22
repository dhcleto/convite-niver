console.log("✅ script.js carregou");

// ===== CONFIG =====
const EVENT = {
  mapsQuery: "R. Dr. Alfredo de Castro, 250 - Barra Funda, São Paulo - SP, 01155-060 (Condomínio Expression)",
  birthdayTarget: "2026-02-25T00:00:00-03:00",
  eventTarget: "2026-02-28T13:00:00-03:00",

  // Google Forms (SEU BACKEND)
  forms: {
    enabled: true,
    actionUrl: "https://docs.google.com/forms/d/e/1FAIpQLSd2lbfjl_qoELaYTvg0gMFDYCOSEup_McwA6SFzQKKGyafxuw/formResponse",
    entryNome: "entry.978340433"
  }
};

// ===== Helpers =====
const $ = (id) => document.getElementById(id);

// ===== Maps =====
const mapsBtn = $("openMaps");
mapsBtn.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(EVENT.mapsQuery)}`;

// ===== Elements =====
const overlay = $("overlay");
const openBtn = $("openRsvp");
const closeBtn = $("closeRsvp");
const cancelBtn = $("cancelRsvp");
const form = $("rsvpForm");
const nomeEl = $("nome");
const noteEl = $("rsvpNote");

const finalOverlay = $("finalOverlay");
const finalName = $("finalName");
const closeFinal = $("closeFinal");
const okFinal = $("okFinal");

const submitBtn = form.querySelector('button[type="submit"]');

let isSubmitting = false;

// Garantia: começa fechado
overlay.hidden = true;
finalOverlay.hidden = true;

// ===== Modal functions =====
function openModal() {
  finalOverlay.hidden = true; // redundância boa
  overlay.hidden = false;
  setTimeout(() => nomeEl.focus(), 50);
}

function closeModal() {
  overlay.hidden = true;
  form.reset();
  noteEl.textContent = "Rapidinho, só pra eu me organizar.";
  isSubmitting = false;
  if (submitBtn) submitBtn.disabled = false;
}

function openFinal(nome) {
  overlay.hidden = true; // redundância boa
  finalName.textContent = nome;
  finalOverlay.hidden = false;
}

function closeFinalModal() {
  finalOverlay.hidden = true;
}

// ===== Click handlers =====
openBtn.addEventListener("click", openModal);
closeBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);

overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeModal();
});

closeFinal.addEventListener("click", closeFinalModal);
okFinal.addEventListener("click", closeFinalModal);

finalOverlay.addEventListener("click", (e) => {
  if (e.target === finalOverlay) closeFinalModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!overlay.hidden) closeModal();
  if (!finalOverlay.hidden) closeFinalModal();
});

// ===== Google Forms submit =====
async function submitToGoogleForms(nome) {
  if (!EVENT.forms.enabled) return;

  const data = new FormData();
  data.append(EVENT.forms.entryNome, nome);

  await fetch(EVENT.forms.actionUrl, {
    method: "POST",
    mode: "no-cors",
    body: data
  });
}

// ===== Submit RSVP =====
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = (nomeEl.value || "").trim();
  if (!nome) return;

  if (isSubmitting) return;
  isSubmitting = true;
  if (submitBtn) submitBtn.disabled = true;

  noteEl.textContent = "Enviando… ✅";

  try {
    await submitToGoogleForms(nome);
    closeModal();
    openFinal(nome);
  } catch (err) {
    isSubmitting = false;
    if (submitBtn) submitBtn.disabled = false;
    noteEl.textContent = "Não consegui enviar agora. Tenta de novo.";
    console.error(err);
  }
});

// ===== Countdowns =====
const cdBday = $("cdBday");
const cdEvent = $("cdEvent");

function formatCountdown(ms) {
  if (ms <= 0) return "É AGORA! 🎉";

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n) => String(n).padStart(2, "0");
  if (days > 0) return `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
}

function tick() {
  const now = Date.now();
  cdBday.textContent = formatCountdown(new Date(EVENT.birthdayTarget).getTime() - now);
  cdEvent.textContent = formatCountdown(new Date(EVENT.eventTarget).getTime() - now);
}

tick();
setInterval(tick, 1000);