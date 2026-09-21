(function () {
  "use strict";

  const cursor = document.querySelector(".cursor");
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!cursor || !canHover) return;

  const moveX = gsap.quickTo(cursor, "left", {duration: 0.2, ease: "power3.out"});
  const moveY = gsap.quickTo(cursor, "top", {duration: 0.2, ease: "power3.out"});

  window.addEventListener("mousemove", (event) => {
    moveX(event.clientX);
    moveY(event.clientY);
    cursor.classList.toggle("active", event.target !== document.body && event.target !== document.documentElement);
  });
})();
