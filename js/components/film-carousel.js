(() => {
  const root = document.querySelector(".circular-film-carousel");
  const files = [...new Set(window.WORK_IMAGES || [])];
  if (!root || !files.length) return;

  const hero = root.closest(".hero");
  const canvas = root.querySelector("canvas");
  const button = root.querySelector(".film-reset");
  const filmGroup = root.querySelector(".film-group");
  const status = root.querySelector(".film-status");
  const assigned = new Set();
  const filmSets = (window.FILM_SETS || [])
    .map((set, index) => ({
      id: String(set.id ?? index + 1),
      images: (set.images || []).filter((file) => {
        if (!files.includes(file) || assigned.has(file)) return false;
        assigned.add(file);
        return true;
      }),
    }))
    .filter((set) => set.images.length);
  if (!filmSets.length) return;
  const context = canvas.getContext("2d");
  if (!context) return;
  const motionPreference = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );
  const frames = files.map((file) => ({ file, image: null, texture: null }));
  const tau = Math.PI * 2;
  const modulo = (value, length) => ((value % length) + length) % length;
  let geometry;
  let progress = 0;
  let activeSetIndex = 0;
  let isTransitioning = false;
  let transition = null;
  const speed = 26;
  const entries = new Map(frames.map((entry) => [entry.file, entry]));
  const activeFrames = () => {
    const baseFrames = filmSets[activeSetIndex].images.map((file) => entries.get(file));
    if (!geometry || !geometry.circumference || !geometry.pitch) return baseFrames;
    const minNeeded = Math.ceil(geometry.circumference / geometry.pitch);
    const result = [...baseFrames];
    while (result.length < minNeeded) {
      result.push(...baseFrames);
    }
    return result;
  };
  const tapeLength = () => activeFrames().length * geometry.pitch;
  let inView = false;
  let animationFrame = 0;
  let lastTime = null;
  const mobileStrips = [...hero.querySelectorAll(".mobile-film-strip")];
  const mobileTracks = mobileStrips.map((strip) =>
    strip.querySelector(".mobile-film-track"),
  );
  const resetSlot = hero.querySelector(".mobile-film-reset-slot");
  const imagePath = (file) =>
    `assets/images/thumbnails/${encodeURIComponent(file.replace(/\.(?:jpe?g)$/i, ".webp"))}`;
  const mobileProgress = [0, 0];
  const mobileSpeeds = [36, 30];
  let mobileLayout = window.matchMedia("(max-width: 1024px)").matches;
  let mobileSetIndex = -1;
  let mobilePeriods = [];
  let layoutVersion = 0;

  function measureMobile() {
    const set = filmSets[activeSetIndex].images;
    const split = Math.ceil(set.length / 2);
    const rows = [set.slice(0, split), set.slice(split)];
    if (mobileSetIndex !== activeSetIndex) {
      rows.forEach((row, index) => {
        const images = [...row, ...row].map((file) => {
          const image = document.createElement("img");
          image.src = imagePath(file);
          image.alt = "";
          image.width = 160;
          image.height = 90;
          image.decoding = "async";
          image.draggable = false;
          return image;
        });
        mobileTracks[index].replaceChildren(...images);
      });
      mobileSetIndex = activeSetIndex;
    }
    root.style.top = "0px";
    root.style.width = `${hero.clientWidth}px`;
    root.style.height = `${hero.clientHeight}px`;
    root.style.bottom = "auto";
    const centerX = resetSlot.offsetLeft + resetSlot.offsetWidth / 2;
    const centerY = resetSlot.offsetTop + resetSlot.offsetHeight / 2;
    const controlSize = resetSlot.offsetHeight;
    geometry = {
      mobile: true,
      width: root.clientWidth,
      height: root.clientHeight,
      centerX,
      centerY,
      controlSize,
    };
    root.style.setProperty("--film-center-x", `${centerX}px`);
    root.style.setProperty("--film-center-y", `${centerY}px`);
    root.style.setProperty("--film-control-size", `${controlSize}px`);
    mobilePeriods = rows.map((row, index) => {
      const track = mobileTracks[index];
      mobileStrips[index].style.transformOrigin =
        `${centerX - mobileStrips[index].offsetLeft}px ${centerY - mobileStrips[index].offsetTop}px`;
      return (
        row.length *
        (parseFloat(getComputedStyle(track.firstElementChild).width) +
          parseFloat(getComputedStyle(track).columnGap))
      );
    });
    renderMobile();
  }

  function renderMobile() {
    mobileTracks.forEach((track, index) => {
      const period = mobilePeriods[index];
      if (!period) return;
      const distance = modulo(mobileProgress[index], period);
      const x = index === 0 ? distance - period : -distance;
      track.style.transform = `translate3d(${x}px, 0, 0)`;
    });
  }

  function point(distance) {
    const angle = -distance / geometry.radius;
    return {
      x: geometry.centerX + geometry.radius * Math.cos(angle),
      y: geometry.centerY + geometry.radius * Math.sin(angle),
      nx: -Math.cos(angle),
      ny: -Math.sin(angle),
      rotation: angle + Math.PI,
    };
  }

  function frameOutline(start, end) {
    const path = new Path2D();
    const steps = Math.ceil((end - start) / 3);
    const cornerRadius = Math.min(4, geometry.imageHeight / 8);
    for (const side of [1, -1]) {
      for (let i = 0; i <= steps; i++) {
        const distance =
          start + (end - start) * (side === 1 ? i / steps : 1 - i / steps);
        const corner = Math.max(
          0,
          cornerRadius - Math.min(distance - start, end - distance),
        );
        const inset =
          cornerRadius -
          Math.sqrt(Math.max(0, cornerRadius ** 2 - corner ** 2));
        const p = point(distance);
        const halfWidth = geometry.imageWidth / 2 - inset;
        const x = p.x + p.nx * side * halfWidth;
        const y = p.y + p.ny * side * halfWidth;
        if (side === 1 && i === 0) path.moveTo(x, y);
        else path.lineTo(x, y);
      }
    }
    path.closePath();
    return path;
  }

  function load(entry) {
    if (entry.ready) return entry.ready;
    const image = new Image();
    entry.image = image;
    image.decoding = "async";
    image.fetchPriority = "low";
    entry.ready = new Promise((resolve, reject) => {
      image.onload = async () => {
        try {
          await image.decode();
          resolve();
          if (!animationFrame) render();
        } catch (error) {
          reject(error);
        }
      };
      image.onerror = () =>
        reject(new Error(`Unable to load film image: ${entry.file}`));
    });
    entry.ready = entry.ready.catch((error) => {
      entry.failed = true;
      throw error;
    });
    image.src = imagePath(entry.file);
    return entry.ready;
  }

  async function prepareSet(index, retry = false) {
    const nextFrames = filmSets[index].images.map((file) => entries.get(file));
    if (retry)
      nextFrames.forEach((entry) => {
        if (entry.failed) {
          entry.ready = null;
          entry.image = null;
          entry.failed = false;
        }
      });
    await Promise.all(nextFrames.map(load));
    if (!mobileLayout && geometry?.imageWidth > 0) nextFrames.forEach(texture);
  }

  function texture(entry) {
    if (entry.texture) return entry.texture;
    const { imageWidth, imageHeight, radius, ratio, centerX, centerY } =
      geometry;
    const sag = radius * (1 - Math.cos(imageHeight / (2 * radius)));
    const width = Math.ceil(imageWidth + sag * 2 + 8);
    const height = Math.ceil(imageHeight * (1 + imageWidth / (2 * radius)) + 8);
    const originX = imageWidth / 2 + 4;
    const originY = height / 2;
    const sharp = document.createElement("canvas");
    sharp.width = Math.ceil(width * ratio);
    sharp.height = Math.ceil(height * ratio);
    const ctx = sharp.getContext("2d");
    const start = Math.PI * radius - imageHeight / 2;
    ctx.scale(ratio, ratio);
    ctx.translate(originX - (centerX - radius), originY - centerY);
    ctx.clip(frameOutline(start, start + imageHeight));
    // Cache the bent photographic surface once; playback only rotates this texture.
    const slices = Math.ceil(imageHeight / 2);
    const sliceHeight = imageHeight / slices;
    const image = entry.image;
    for (let slice = 0; slice < slices; slice++) {
      const p = point(start + (slice + 0.5) * sliceHeight);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.drawImage(
        image,
        0,
        (slice * image.naturalHeight) / slices,
        image.naturalWidth,
        image.naturalHeight / slices,
        -imageWidth / 2,
        -sliceHeight / 2 - 0.4,
        imageWidth,
        sliceHeight + 0.8,
      );
      ctx.restore();
    }
    const soft = document.createElement("canvas");
    soft.width = sharp.width;
    soft.height = sharp.height;
    const softContext = soft.getContext("2d");
    softContext.filter = `blur(${ratio * 0.8}px)`;
    softContext.drawImage(sharp, 0, 0);
    softContext.filter = "none";
    softContext.globalCompositeOperation = "destination-in";
    softContext.drawImage(sharp, 0, 0);
    entry.texture = { sharp, soft, width, height, originX, originY };
    return entry.texture;
  }

  function frameStart(index) {
    const { arcStart, imageHeight, pitch } = geometry;
    // Feed the unique frames through the short arc; recycle only outside its clipped ends.
    return (
      modulo(index * pitch + progress + imageHeight, tapeLength()) +
      arcStart -
      imageHeight
    );
  }

  function render() {
    if (mobileLayout) {
      if (mobileSetIndex !== activeSetIndex) measureMobile();
      else renderMobile();
      return;
    }
    if (!geometry || geometry.imageWidth <= 0 || geometry.height <= 0) return;
    const {
      width,
      height,
      ratio,
      imageWidth,
      imageHeight,
      arcStart,
      arcEnd,
      ribbon,
      material,
    } = geometry;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.drawImage(material, 0, 0, width, height);
    context.save();
    context.clip(ribbon);

    activeFrames().forEach((entry, index) => {
      const start = frameStart(index);
      const end = start + imageHeight;
      if (end < arcStart || start > arcEnd) return;
      const center = point(start + imageHeight / 2);
      const margin = imageWidth;
      if (
        center.x < -margin ||
        center.x > width + margin ||
        center.y < -margin ||
        center.y > height + margin
      )
        return;
      load(entry).catch(() => {});
      const image = entry.image;
      if (!image.complete || !image.naturalWidth) return;
      const distanceFromFront =
        (1 + Math.cos(-(start + imageHeight / 2) / geometry.radius)) / 2;
      const softness = Math.min(0.8, distanceFromFront * 1.4);
      const opacity = 1 - distanceFromFront * 0.13;
      const tile = texture(entry);
      context.save();
      context.translate(center.x, center.y);
      context.rotate(center.rotation);
      context.globalAlpha = opacity;
      context.drawImage(
        tile.sharp,
        -tile.originX,
        -tile.originY,
        tile.width,
        tile.height,
      );
      if (softness > 0.01) {
        context.globalAlpha = opacity * softness;
        context.drawImage(
          tile.soft,
          -tile.originX,
          -tile.originY,
          tile.width,
          tile.height,
        );
      }
      context.restore();
    });
    context.restore();
  }

  function measure() {
    if (mobileLayout) {
      measureMobile();
      return;
    }
    const mobile = window.innerWidth <= 700;
    const heroRect = hero.getBoundingClientRect();
    const footerElement = hero.querySelector(".hero-footer");
    if (mobile) {
      const role = hero.querySelector(".hero-role").getBoundingClientRect();
      const top = role.bottom - heroRect.top + 16;
      root.style.top = `${top}px`;
      root.style.height = `${Math.max(0, Math.min(hero.clientHeight, footerElement.offsetTop) - top - 16)}px`;
      root.style.bottom = "auto";
      root.style.removeProperty("width");
    } else {
      root.style.top = "0px";
      root.style.height = `${hero.clientHeight}px`;
      root.style.bottom = "auto";
      const name = hero.querySelector(".name").getBoundingClientRect();
      const left = Math.max(
        heroRect.width * 0.5,
        name.right - heroRect.left + 28,
      );
      root.style.width = `${Math.max(0, heroRect.width - left)}px`;
    }
    const width = root.clientWidth;
    const height = root.clientHeight;
    const baseImageWidth = mobile
      ? Math.min(52, width * 0.16, height * 0.26)
      : Math.min(112, heroRect.width * 0.0625);
    const centerY = height / 2;
    const radius = Math.max(
      1,
      mobile
        ? Math.max(
            Math.min(width, height) * 0.43,
            Math.min(width * 0.28, 46 + baseImageWidth / 2),
          )
        : Math.min(
            heroRect.width * 0.3,
            height * 0.365,
            footerElement.offsetTop - centerY - 20,
          ) -
            baseImageWidth / 2 -
            4,
    );
    const controlSize = mobile
      ? Math.max(44, Math.min(56, radius * 0.7))
      : Math.max(56, Math.min(112, radius * 0.4));
    const imageWidth = Math.min(
      baseImageWidth,
      Math.max(0, (radius - controlSize / 2 - 24) * 2),
    );
    const edgeInset = mobile
      ? 12
      : Math.min(heroRect.width * 0.06, (radius - imageWidth / 2 - 4) * 0.6);
    const centerX = width - Math.max(edgeInset, controlSize / 2 + 12);
    const circumference = tau * radius;
    const imageHeight = (imageWidth * 9) / 16;
    const pitch = imageHeight + (mobile ? 2 : 3);
    const halfWidth = imageWidth / 2 + (mobile ? 3 : 4);
    // Extend both ribbon ends beyond the clipping edge, including the inner edge.
    const exitAngle = Math.acos(
      Math.min(1, (width - centerX + 8) / Math.max(1, radius - halfWidth)),
    );
    const arcStart = radius * exitAngle;
    const arcEnd = radius * (tau - exitAngle);
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const outer = radius + halfWidth;
    const inner = Math.max(1, radius - halfWidth);
    const ribbon = new Path2D();
    ribbon.arc(centerX, centerY, outer, -arcEnd / radius, -arcStart / radius);
    ribbon.arc(
      centerX,
      centerY,
      inner,
      -arcStart / radius,
      -arcEnd / radius,
      true,
    );
    ribbon.closePath();
    const edges = [outer, inner].map((r) => {
      const path = new Path2D();
      path.arc(centerX, centerY, r, -arcEnd / radius, -arcStart / radius);
      return path;
    });
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    const material = document.createElement("canvas");
    material.width = canvas.width;
    material.height = canvas.height;
    const materialContext = material.getContext("2d");
    materialContext.scale(ratio, ratio);
    materialContext.fillStyle = "#20201d";
    materialContext.shadowColor = "rgba(0, 0, 0, .32)";
    materialContext.shadowBlur = 10;
    materialContext.shadowOffsetX = -3;
    materialContext.fill(ribbon);
    materialContext.shadowBlur = 0;
    materialContext.shadowOffsetX = 0;
    materialContext.strokeStyle = "rgba(225, 220, 207, .34)";
    materialContext.lineWidth = 1;
    edges.forEach((path) => materialContext.stroke(path));
    geometry = {
      width,
      height,
      imageWidth,
      imageHeight,
      pitch,
      radius,
      centerX,
      centerY,
      circumference,
      arcStart,
      arcEnd,
      ribbon,
      ratio,
      material,
      controlSize,
    };
    frames.forEach((entry) => {
      entry.texture = null;
    });
    root.style.setProperty("--film-center-x", `${centerX}px`);
    root.style.setProperty("--film-center-y", `${centerY}px`);
    root.style.setProperty("--film-control-size", `${controlSize}px`);
    render();
  }

  function updateSetState() {
    root.dataset.activeSet = filmSets[activeSetIndex].id;
    status.textContent = `Film set ${activeSetIndex + 1} of ${filmSets.length}`;
    button.setAttribute(
      "aria-label",
      `Show next film set; current set ${activeSetIndex + 1} of ${filmSets.length}`,
    );
  }

  function finishTransition() {
    transition = null;
    isTransitioning = false;
    gsap.set(filmGroup, { scale: 1, x: 0 });
    gsap.set(mobileStrips, { scale: 1 });
    gsap.set(button, { x: 0 });
    button.disabled = false;
    button.removeAttribute("aria-busy");
    syncPlayback();
    prepareSet((activeSetIndex + 1) % filmSets.length).catch(() => {});
  }

  async function nextSet() {
    if (!geometry || isTransitioning) return;
    isTransitioning = true;
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    syncPlayback();
    const nextIndex = (activeSetIndex + 1) % filmSets.length;
    const version = layoutVersion;
    try {
      // Decode/cache before collapsing, so the hidden swap never introduces a loading pause.
      await prepareSet(nextIndex, true);
    } catch {
      if (version !== layoutVersion) return;
      finishTransition();
      status.textContent =
        "The next film set could not load. Please try again.";
      return;
    }
    if (version !== layoutVersion) return;
    const swapSet = () => {
      activeSetIndex = nextIndex;
      progress = 0;
      mobileProgress.fill(0);
      render();
      updateSetState();
    };
    if (motionPreference.matches) {
      swapSet();
      finishTransition();
      return;
    }
    if (mobileLayout) {
      transition = gsap
        .timeline({
          paused: true,
          defaults: { ease: "power3.inOut" },
          onComplete: finishTransition,
        })
        .to(mobileStrips, { scale: 0.01, duration: 0.65 })
        .call(swapSet)
        .to(mobileStrips, { scale: 1, duration: 0.65 });
      syncPlayback();
      return;
    }
    const slide = () =>
      -Math.min(
        28,
        geometry.controlSize * 0.25,
        Math.max(0, geometry.centerX - geometry.controlSize / 2 - 8),
      );
    transition = gsap
      .timeline({
        paused: true,
        defaults: { ease: "power3.inOut" },
        onComplete: finishTransition,
      })
      .to(filmGroup, { scale: 0.01, duration: 0.65 })
      .to([button, filmGroup], { x: slide, duration: 0.28 })
      .call(swapSet)
      .to([button, filmGroup], { x: 0, duration: 0.28 })
      .to(filmGroup, { scale: 1, duration: 0.65 });
    syncPlayback();
  }

  function tick(time) {
    animationFrame = 0;
    if (
      !inView ||
      document.hidden ||
      motionPreference.matches ||
      isTransitioning
    )
      return;
    const delta =
      lastTime === null ? 0 : Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    if (mobileLayout) {
      mobileProgress.forEach((distance, index) => {
        mobileProgress[index] = modulo(
          distance + delta * mobileSpeeds[index],
          mobilePeriods[index],
        );
      });
    } else {
      progress = modulo(progress + delta * speed, tapeLength());
    }
    render();
    animationFrame = requestAnimationFrame(tick);
  }

  function syncPlayback() {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    lastTime = null;
    if (transition) {
      if (motionPreference.matches) transition.progress(1);
      else transition.paused(!inView || document.hidden);
    }
    if (
      inView &&
      !document.hidden &&
      !motionPreference.matches &&
      !isTransitioning
    )
      animationFrame = requestAnimationFrame(tick);
  }

  gsap.set(button, { xPercent: -50, yPercent: -50, x: 0, y: 0 });
  button.addEventListener("click", nextSet);
  document.addEventListener("visibilitychange", syncPlayback);
  motionPreference.addEventListener("change", syncPlayback);
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    syncPlayback();
  }).observe(root);
  new ResizeObserver(measure).observe(hero);
  window.addEventListener("resize", measure, { passive: true });
  document.fonts.ready.then(measure);
  gsap
    .matchMedia()
    .add(
      { strips: "(max-width: 1024px)", circle: "(min-width: 1025px)" },
      (ctx) => {
        mobileLayout = ctx.conditions.strips;
        measure();
        syncPlayback();
        return () => {
          layoutVersion++;
          transition?.kill();
          finishTransition();
        };
      },
    );
  updateSetState();
  prepareSet(activeSetIndex).catch(() => {});
  const warmNextSet = () =>
    prepareSet((activeSetIndex + 1) % filmSets.length).catch(() => {});
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(warmNextSet, {timeout: 2500});
  } else {
    window.setTimeout(warmNextSet, 1200);
  }
})();
