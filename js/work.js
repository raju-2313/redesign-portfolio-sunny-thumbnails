gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const imagePath = (file) => `assets/images/thumbnails/${file.replace(/\.(?:jpe?g)$/i, ".webp")}`;
const catalog = window.WORK_CATALOG || [];
const categories = window.WORK_CATEGORIES || [];
const moreWorkGrid = document.querySelector("#more-work-grid");
const workFilters = document.querySelector("#work-filters");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxNumber = document.querySelector("#lightbox-number");
const lightboxClose = document.querySelector(".lightbox-close");
let lastFocusedElement;
let renderGeneration = 0;

const counts = catalog.reduce((result, item) => {
  result[item.category] = (result[item.category] || 0) + 1;
  return result;
}, {});

const allFilter = {key: "all", label: "ALL WORK", count: catalog.length};
const filters = [allFilter, ...categories.map((category) => ({
  ...category,
  count: counts[category.key] || 0
}))];

function renderFilters(activeKey) {
  workFilters.innerHTML = filters.map((filter) => `
    <button class="work-filter${filter.key === activeKey ? " is-active" : ""}" type="button" data-filter="${filter.key}" aria-pressed="${filter.key === activeKey}">
      <span>${filter.label}</span><span class="work-filter-count">${filter.count}</span>
    </button>
  `).join("");
}

function renderGrid(activeKey) {
  const visibleItems = activeKey === "all"
    ? catalog
    : catalog.filter((item) => item.category === activeKey);
  const generation = ++renderGeneration;

  moreWorkGrid.classList.add("is-filtering");
  window.setTimeout(() => {
    if (generation !== renderGeneration) return;
    moreWorkGrid.innerHTML = visibleItems.map((item, index) => `
      <button class="more-work-item" type="button" data-lightbox="${imagePath(item.src)}" data-number="${String(index + 1).padStart(2, "0")}" aria-label="Open ${item.category} thumbnail ${String(index + 1).padStart(2, "0")}">
        <img src="${imagePath(item.src)}" alt="Sunny ${item.category} thumbnail study ${String(index + 1).padStart(2, "0")}" loading="lazy" decoding="async">
      </button>
    `).join("");
    moreWorkGrid.classList.remove("is-filtering");
    bindLightboxes();
  }, 90);
}

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
  else gsap.to(lightbox, {opacity: 0, duration: 0.3, ease: "power2.in", onComplete: finish});
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
  else gsap.fromTo(lightbox, {opacity: 0}, {opacity: 1, duration: 0.45, ease: "power3.out"});
}

function bindLightboxes() {
  moreWorkGrid.querySelectorAll("[data-lightbox]").forEach((trigger) => {
    trigger.addEventListener("click", () => openLightbox(trigger));
    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(trigger);
      }
    });
  });
}

if (moreWorkGrid && workFilters && catalog.length) {
  renderFilters("all");
  renderGrid("all");
  workFilters.addEventListener("click", (event) => {
    const filter = event.target.closest("[data-filter]");
    if (!filter) return;
    renderFilters(filter.dataset.filter);
    renderGrid(filter.dataset.filter);
  });
}

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
