/* ── Work Diamond — 3D CSS Renderer ──
   Generates a diamond-shaped grid of thumbnails and applies
   CSS 3D transforms to give it a physical exhibition feel.
*/
(function () {
  "use strict";

  var grid = document.getElementById("diamond-grid");
  if (!grid) return;

  var allFiles = (window.WORK_IMAGES || []).slice();
  if (!allFiles.length) return;

  // Shuffle images
  for (var i = allFiles.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = allFiles[i]; allFiles[i] = allFiles[j]; allFiles[j] = tmp;
  }

  // Determine layout based on screen width
  var isMobile = window.innerWidth <= 700;
  var rowCounts = isMobile ? [2, 3, 2] : [2, 3, 4, 3, 2];

  var imgIdx = 0;
  var IMG_BASE = "assets/images/thumbnails/";

  // Generate grid
  rowCounts.forEach(function(count) {
    var rowEl = document.createElement("div");
    rowEl.className = "diamond-row";

    for (var k = 0; k < count; k++) {
      var tileEl = document.createElement("div");
      tileEl.className = "diamond-tile";
      
      // Select image and loop if necessary
      var imgFile = allFiles[imgIdx % allFiles.length];
      tileEl.style.backgroundImage = "url(" + IMG_BASE + imgFile + ")";
      imgIdx++;

      // Calculate 3D position
      // colIndex represents the distance from the center of the row
      var colIndex = k - (count - 1) / 2;
      
      // Subtle curve: edges rotate away and push back slightly
      var angleY = colIndex * 14; // degrees
      var zOffset = -Math.abs(colIndex) * 20; // px push back
      
      var transformStr = "translateZ(" + zOffset + "px) rotateY(" + angleY + "deg)";
      tileEl.style.transform = transformStr;
      
      // Store base transform in a CSS variable for hover effect to build upon
      tileEl.style.setProperty("--base-transform", transformStr);
      
      // Apply subtle shading to angled tiles
      var shade = Math.abs(colIndex) * 0.15;
      tileEl.style.setProperty("--shade", shade);

      rowEl.appendChild(tileEl);
    }

    grid.appendChild(rowEl);
  });

  // Continuous subtle floating animation
  var animTime = 0;
  var isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function floatAnimation() {
    if (isReducedMotion) return;

    animTime += 0.015;
    
    // Smooth oscillations
    var rotY = Math.sin(animTime * 0.5) * 8; // gentle yaw
    var rotX = Math.cos(animTime * 0.7) * 4; // gentle pitch
    var transY = Math.sin(animTime) * 10;    // gentle float up/down

    grid.style.transform = "translateY(" + transY + "px) rotateX(" + rotX + "deg) rotateY(" + rotY + "deg)";

    requestAnimationFrame(floatAnimation);
  }

  // Handle window resize to re-render layout if crossing mobile breakpoint
  var currentIsMobile = isMobile;
  window.addEventListener("resize", function() {
    var newIsMobile = window.innerWidth <= 700;
    if (newIsMobile !== currentIsMobile) {
      // Very simple reload to rebuild layout on breakpoint change
      // Alternatively, we could clear the grid and rebuild.
      grid.innerHTML = "";
      currentIsMobile = newIsMobile;
      rowCounts = currentIsMobile ? [2, 3, 2] : [2, 3, 4, 3, 2];
      imgIdx = 0;
      
      rowCounts.forEach(function(count) {
        var rowEl = document.createElement("div");
        rowEl.className = "diamond-row";
        for (var k = 0; k < count; k++) {
          var tileEl = document.createElement("div");
          tileEl.className = "diamond-tile";
          var imgFile = allFiles[imgIdx % allFiles.length];
          tileEl.style.backgroundImage = "url(" + IMG_BASE + imgFile + ")";
          imgIdx++;
          var colIndex = k - (count - 1) / 2;
          var angleY = colIndex * 14;
          var zOffset = -Math.abs(colIndex) * 20;
          var transformStr = "translateZ(" + zOffset + "px) rotateY(" + angleY + "deg)";
          tileEl.style.transform = transformStr;
          tileEl.style.setProperty("--base-transform", transformStr);
          tileEl.style.setProperty("--shade", Math.abs(colIndex) * 0.15);
          rowEl.appendChild(tileEl);
        }
        grid.appendChild(rowEl);
      });
    }
  });

  // Start animation
  floatAnimation();

})();
