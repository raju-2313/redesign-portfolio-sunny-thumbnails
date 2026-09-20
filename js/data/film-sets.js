// Use the full thumbnail archive so the hero film feels dense and complete.
// The 57 images are split into evenly balanced sets so the circular reel remains filled
// while still rotating through the complete portfolio.
(() => {
  const thumbnails = Array.from(new Set(window.WORK_IMAGES || []));
  if (!thumbnails.length) return;

  const setCount = Math.min(5, thumbnails.length);
  const baseSize = Math.floor(thumbnails.length / setCount);
  const remainder = thumbnails.length % setCount;
  const sizes = Array.from({ length: setCount }, (_, index) => baseSize + (index < remainder ? 1 : 0));

  let cursor = 0;
  window.FILM_SETS = sizes.map((size, index) => {
    const images = thumbnails.slice(cursor, cursor + size);
    cursor += size;
    return { id: String(index + 1).padStart(2, '0'), images };
  });
})();
