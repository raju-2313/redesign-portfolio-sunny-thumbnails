(() => {
  const section = document.querySelector("#worked-with");
  if (!section) return;

  const viewport = section.querySelector(".creator-window");
  const track = section.querySelector(".creator-track");
  const original = section.querySelector(".creator-set");
  const toggle = section.querySelector(".creator-toggle");
  const previous = section.querySelector(".creator-prev");
  const next = section.querySelector(".creator-next");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

  original.querySelectorAll("img").forEach((image) => {
    const fallback = () => { image.hidden = true; };
    image.addEventListener("error", fallback);
    if (image.complete && !image.naturalWidth) fallback();
  });
  document.querySelector('a[href="#worked-with"]').addEventListener("click", (event) => {
    if (!motion.matches) return;
    event.preventDefault();
    section.scrollIntoView({ behavior: "instant", block: "start" });
  });
  if (!window.gsap) return;

  let loop;
  let paused = false;
  let focused = false;
  let hovered = false;
  let visible = false;
  let browsing = false;
  let savedProgress = 0;
  let distance = 0;
  let viewportWidth = 0;

  function update() {
    const shouldBrowse = motion.matches || paused || focused;
    toggle.hidden = false;
    toggle.textContent = paused ? "RESUME ↗" : "PAUSE Ⅱ";
    toggle.setAttribute("aria-label", paused ? "Resume creator carousel" : "Pause creator carousel");
    section.classList.toggle("is-animated", !shouldBrowse);

    if (shouldBrowse && !browsing) {
      savedProgress = loop ? loop.progress() : 0;
      if (loop) loop.pause();
      gsap.set(track, { x: 0 });
      viewport.scrollLeft = 0;
    } else if (!shouldBrowse && browsing) {
      viewport.scrollLeft = 0;
      if (loop) loop.progress(savedProgress);
    }
    browsing = shouldBrowse;
    if (loop) loop.paused(shouldBrowse || hovered || !visible || document.hidden);
  }

  function measure() {
    const width = original.getBoundingClientRect().width;
    const available = viewport.clientWidth;
    if (!width || (width === distance && available === viewportWidth && loop)) return;
    const progress = browsing ? savedProgress : loop ? loop.progress() : 0;
    if (loop) loop.kill();
    distance = width;
    viewportWidth = available;
    track.querySelectorAll(':scope > .creator-set[aria-hidden="true"]').forEach((copy) => copy.remove());

    // Each full set includes its leading spacing, so the last/first seam is identical.
    for (let i = 0; i < Math.ceil(available / width); i++) {
      const copy = original.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      copy.querySelectorAll("a").forEach((link) => { link.tabIndex = -1; });
      copy.querySelectorAll("img").forEach((image) => {
        image.addEventListener("error", () => { image.hidden = true; });
      });
      track.append(copy);
    }
    loop = gsap.fromTo(track, { x: 0 }, {
      x: -width,
      duration: width / 24,
      ease: "none",
      repeat: -1,
      paused: true
    });
    loop.progress(progress);
    savedProgress = progress;
    if (browsing) gsap.set(track, { x: 0 });
    update();
  }

  toggle.addEventListener("click", () => {
    paused = !paused;
    update();
  });
  previous.addEventListener("click", () => {
    viewport.scrollBy({ left: -viewport.clientWidth * 0.8, behavior: "smooth" });
    paused = true;
    update();
  });
  next.addEventListener("click", () => {
    viewport.scrollBy({ left: viewport.clientWidth * 0.8, behavior: "smooth" });
    paused = true;
    update();
  });
  viewport.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "mouse") return;
    hovered = true;
    update();
  });
  viewport.addEventListener("pointerleave", () => {
    hovered = false;
    update();
  });
  viewport.addEventListener("focusin", (event) => {
    if (!event.target.matches(":focus-visible")) return;
    focused = true;
    update();
    const link = event.target.closest(".creator-link");
    if (link) {
      // Browse the original set in DOM order; no duplicate keyboard stops.
      const offset = link.getBoundingClientRect().left - viewport.getBoundingClientRect().left;
      viewport.scrollLeft += offset - 20;
    }
  });
  viewport.addEventListener("focusout", () => {
    requestAnimationFrame(() => {
      focused = Boolean(viewport.querySelector(":focus-visible"));
      update();
    });
  });
  document.addEventListener("visibilitychange", update);
  motion.addEventListener("change", update);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    update();
  }).observe(section);
  const observer = new ResizeObserver(measure);
  observer.observe(original);
  observer.observe(viewport);
  measure();
})();
