// Keep the existing project order: projects 01–28, then projects 29–57.
// These two film sets do not alter the exhibition rooms or project data.
(() => {
  const thumbnails = Array.from(document.querySelectorAll('.exhibition-project img'), (image) =>
    decodeURIComponent(new URL(image.src).pathname.split('/').pop()));
  window.FILM_SETS = [
    {id: '01', images: thumbnails.slice(0, 28)},
    {id: '02', images: thumbnails.slice(28, 57)}
  ];
})();
