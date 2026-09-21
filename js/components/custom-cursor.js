(function () {
  "use strict";

  const cursor = document.querySelector(".cursor");
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!cursor || !canHover) return;

  const moveX = gsap.quickTo(cursor, "left", {duration: 0.2, ease: "power3.out"});
  const moveY = gsap.quickTo(cursor, "top", {duration: 0.2, ease: "power3.out"});
  const hoverSelector = "a, button, input, textarea, select, [role='button'], p, h1, h2, h3, h4, h5, h6, span, img";

  window.addEventListener("mousemove", (event) => {
    moveX(event.clientX);
    moveY(event.clientY);
    cursor.classList.toggle("active", Boolean(event.target.closest(hoverSelector)));
  });
})();
