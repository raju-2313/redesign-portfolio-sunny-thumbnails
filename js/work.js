gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const imagePath = (file) => `assets/images/thumbnails/${file}`;
const featuredFiles = new Set(["3014797f.jpg", "525819c4.jpg", "a7109dac.jpg", "5977fc59.jpg"]);
const archiveFiles = (window.WORK_IMAGES || []).filter((file) => !featuredFiles.has(file.toLowerCase()));
const moreWorkGrid = document.querySelector("#more-work-grid");

if (moreWorkGrid) {
  moreWorkGrid.innerHTML = archiveFiles.map((file, index) => `
    <button class="more-work-item" type="button" data-lightbox="${imagePath(file)}" data-number="${String(index + 1).padStart(2, "0")}" aria-label="Open thumbnail ${String(index + 1).padStart(2, "0")}">
      <img src="${imagePath(file)}" alt="Sunny thumbnail study ${String(index + 1).padStart(2, "0")}" loading="lazy" decoding="async">
    </button>
  `).join("");
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxNumber = document.querySelector("#lightbox-number");
const lightboxClose = document.querySelector(".lightbox-close");
let lastFocusedElement;

function closeLightbox() {
  if (!lightbox.classList.contains("is-open")) return;
  const finish = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    if (lastFocusedElement) lastFocusedElement.focus();
  };
  gsap.killTweensOf(lightbox);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) finish();
  else gsap.to(lightbox, {opacity:0, duration:.3, ease:"power2.in", onComplete:finish});
}

function openLightbox(trigger) {
  lastFocusedElement = document.activeElement;
  lightboxImage.src = trigger.dataset.lightbox;
  lightboxImage.alt = trigger.querySelector("img").alt;
  lightboxNumber.textContent = trigger.dataset.number;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
  lightboxClose.focus();
  gsap.killTweensOf(lightbox);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) lightbox.style.opacity = "1";
  else gsap.fromTo(lightbox, {opacity:0}, {opacity:1, duration:.45, ease:"power3.out"});
}

document.querySelectorAll("[data-lightbox]").forEach((trigger) => {
  trigger.addEventListener("click", () => openLightbox(trigger));
  trigger.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openLightbox(trigger);
    }
  });
});
lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLightbox();
  if (event.key === "Tab" && lightbox.classList.contains("is-open")) {
    event.preventDefault();
    lightboxClose.focus();
  }
});
