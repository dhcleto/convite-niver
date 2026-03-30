document.addEventListener("DOMContentLoaded", function () {

console.log("✅ script.js carregou");

// ===== CONFIG =====
const EVENT = {
  forms: {
    enabled: true,
    actionUrl: "https://docs.google.com/forms/d/e/1FAIpQLSd2lbfjl_qoELaYTvg0gMFDYCOSEup_McwA6SFzQKKGyafxuw/formResponse",
    entryNome: "entry.978340433"
  }
};

// ===== Helpers =====
const $ = (id) => document.getElementById(id);

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

const submitBtn = form?.querySelector('button[type="submit"]');

let isSubmitting = false;

// Garantia: começa fechado
if (overlay) overlay.hidden = true;
if (finalOverlay) finalOverlay.hidden = true;

// ===== Modal functions =====
function openModal() {
  if (!overlay) return;

  if (finalOverlay) finalOverlay.hidden = true;

  overlay.hidden = false;

  setTimeout(() => {
    if (nomeEl) nomeEl.focus();
  }, 50);
}

function closeModal() {
  if (!overlay) return;

  overlay.hidden = true;

  form?.reset();

  if (noteEl) {
    noteEl.textContent = "Rapidinho, só pra eu me organizar.";
  }

  isSubmitting = false;

  if (submitBtn) submitBtn.disabled = false;
}

function openFinal(nome) {
  if (!finalOverlay) return;

  overlay.hidden = true;

  if (finalName) finalName.textContent = nome;

  finalOverlay.hidden = false;
}

function closeFinalModal() {
  if (finalOverlay) finalOverlay.hidden = true;
}

// ===== Click handlers =====
openBtn?.addEventListener("click", openModal);
closeBtn?.addEventListener("click", closeModal);
cancelBtn?.addEventListener("click", closeModal);

overlay?.addEventListener("click", (e) => {
  if (e.target === overlay) closeModal();
});

closeFinal?.addEventListener("click", closeFinalModal);
okFinal?.addEventListener("click", closeFinalModal);

finalOverlay?.addEventListener("click", (e) => {
  if (e.target === finalOverlay) closeFinalModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;

  if (overlay && !overlay.hidden) closeModal();
  if (finalOverlay && !finalOverlay.hidden) closeFinalModal();
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
form?.addEventListener("submit", async (e) => {

  e.preventDefault();

  const nome = (nomeEl?.value || "").trim();
  if (!nome) return;

  if (isSubmitting) return;

  isSubmitting = true;

  if (submitBtn) submitBtn.disabled = true;

  if (noteEl) {
    noteEl.textContent = "Enviando… ✅";
  }

  try {

    await submitToGoogleForms(nome);

    closeModal();
    openFinal(nome);

  } catch (err) {

    isSubmitting = false;

    if (submitBtn) submitBtn.disabled = false;

    if (noteEl) {
      noteEl.textContent = "Não consegui enviar agora. Tenta de novo.";
    }

    console.error(err);
  }

});

});
