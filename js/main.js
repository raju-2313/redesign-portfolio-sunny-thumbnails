gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Project metadata is kept in one place so video links and editorial notes are easy to update.
const featuredProjects = [
  {number:"01", file:"3014797f.jpg", title:"I Tried Every Wild Theme Park", channel:"zooder loopers", views:"152.8K views", description:"A wild theme-park concept framed with an expressive subject, a giraffe, and a roller-coaster setting.", process:"The visual hook comes from the immediate contrast between the surprised reaction, the giraffe, and the ride behind it.", videoUrl:"https://www.youtube.com/watch?v=zNf1XWu8wII"},
  {number:"02", file:"525819c4.jpg", title:"Tinder In Real Life Show | Valentine Edition", channel:"Allen Choudhary", views:"986.4K views", description:"A Valentine-themed Tinder concept featuring two people, roses, and a direct face-to-face setup.", process:"The design makes the Valentine theme immediately legible through the red palette, roses, and the Tinder title treatment.", videoUrl:"https://www.youtube.com/watch?v=O6YF5pLqa5Q"},
  {number:"03", file:"a7109dac.jpg", title:"Tinder In Real Life | Impress The Baddie ?", channel:"Allen Choudhary", views:"6.4M views", description:"A Tinder-style social challenge built around the contrast between a featured woman and a group of potential matches.", process:"The large Tinder BADDIE label and split group composition establish the challenge premise at a glance.", videoUrl:"https://www.youtube.com/watch?v=SpLVvBWQLMg"},
  {number:"04", file:"5977fc59.jpg", title:"Being the First Person at Every Water Park", channel:"zooder loopers", views:"107.6K views", description:"A water-park premise staged with a sleeping-bag subject, a large slide, and security-guard reaction figures.", process:"The unusual first-person premise is communicated through the empty park, sleeping subject, and oversized water-park landmark.", videoUrl:"https://www.youtube.com/watch?v=DzScA437Des"}
];

const imagePath = (file) => `assets/images/thumbnails/${file.replace(/\.(?:jpe?g)$/i, ".webp")}`;
const featuredFiles = new Set(featuredProjects.map((project) => project.file.toLowerCase()));
const archiveFiles = (window.WORK_IMAGES || []).filter((file) => !featuredFiles.has(file.toLowerCase()));
const selectedProjects = featuredProjects.map((project) => ({ ...project, image: imagePath(project.file) }));
const exhibitionList = document.querySelector("#exhibition-list");

function projectMarkup(project, index) {
  const featuredMarkup = `
    <span class="exhibition-label">Video title</span>
    <p class="exhibition-value">${project.title}</p>
    <span class="exhibition-label">Creator / channel</span>
    <p class="exhibition-value">${project.channel}</p>
    <span class="exhibition-label">Views</span>
    <p class="exhibition-value">${project.views}</p>
  `;
  return `
    <article class="exhibition-project" data-cursor="view" data-project-index="${index}">
      <div class="exhibition-project-number">PROJECT ${project.number}</div>
      <div class="exhibition-artwork">
        <div class="exhibition-frame thumbnail-frame" data-lightbox="${project.image}" data-number="${project.number}" data-cursor="view" role="button" tabindex="0" aria-label="Open Project ${project.number}">
          <img src="${project.image}" alt="Sunny thumbnail project ${project.number} — ${project.title}" loading="lazy" decoding="async">
        </div>
        <div class="exhibition-details">
          <div class="exhibition-info">${featuredMarkup}</div>
          <a class="project-cta magnetic" href="${project.videoUrl}" target="_blank" rel="noopener noreferrer">Watch video <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </article>
  `;
}

if (exhibitionList) {
  exhibitionList.insertAdjacentHTML("beforeend", `
    <section class="exhibition-room" data-count="${selectedProjects.length}">
      <div class="exhibition-viewport">
        <header class="chapter-header">
          <p class="eyebrow" aria-hidden="true"></p>
          <p class="chapter-description" aria-hidden="true"></p>
        </header>
        <div class="exhibition-stage">
          <div class="exhibition-track">
            ${selectedProjects.map((project, index) => projectMarkup(project, index)).join("")}
          </div>
        </div>
        <nav class="chapter-rail" aria-label="Featured project navigation">
          <p class="chapter-rail-label"><span>01</span>SELECTED WORK</p>
          <div class="chapter-rail-line" aria-hidden="true"></div>
          <div class="chapter-rail-items">
            ${selectedProjects.map((project, index) => `
              <button class="chapter-rail-marker" type="button" data-local-index="${index}" aria-label="Go to project ${project.number}" aria-current="false" title="Go to project ${project.number}">
                <span class="chapter-rail-number">${project.number}</span>
                <span class="chapter-rail-preview"><img src="${project.image}" alt="" loading="lazy" decoding="async"></span>
                <span class="chapter-rail-dot" aria-hidden="true"></span>
              </button>
            `).join("")}
          </div>
        </nav>
        <div class="exhibition-status">
          <span class="chapter-status">01 / 01</span>
          <span class="project-status">WORK 01 / ${String(selectedProjects.length).padStart(2, "0")}</span>
        </div>
        <div class="exhibition-progress"><span></span></div>
      </div>
    </section>
  `);
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(hover: none)").matches;
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

function typewriter() {
  const target = document.querySelector("#typewriter");
  const phrases = ["Thumbnail Designer", "YouTube Thumbnail Designer", "YouTube Banner Designer"];
  if (reduceMotion) {
    target.textContent = phrases[0];
    return;
  }
  let phraseIndex = 0;
  let characterIndex = 0;
  let deleting = false;
  const tick = () => {
    const phrase = phrases[phraseIndex];
    target.textContent = phrase.slice(0, characterIndex);
    if (!deleting && characterIndex < phrase.length) { characterIndex++; setTimeout(tick, 75); return; }
    if (!deleting) { deleting = true; setTimeout(tick, 1700); return; }
    if (characterIndex > 0) { characterIndex--; setTimeout(tick, 42); return; }
    deleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    setTimeout(tick, 450);
  };
  tick();
}

const shouldRunIntroTimeline = !reduceMotion && !isTouch && window.innerWidth > 900;

if (shouldRunIntroTimeline) {
  const intro = gsap.timeline({defaults:{ease:"power3.out"}});
  intro.from(".hero", {opacity:0, duration:.6})
    .from(".site-header > *", {y:-18, opacity:0, duration:.8, stagger:.1}, "-=.45")
    .from(".hero-intro > *", {y:20, opacity:0, duration:.7, stagger:.12}, "-=.35")
    .from(".hero-title .greeting", {y:24, opacity:0, duration:.75, ease:"power3.out"}, "-=.35")
    .from(".hero-title .name", {y:45, opacity:0, duration:1.05, ease:"power4.out"}, "-=.3")
    .from(".hero-role", {y:18, opacity:0, duration:.7}, "-=.5")
    .add(typewriter, "+=.15")
    .from(".hero-footer", {opacity:0, y:15, duration:.8}, "-=.55");
  gsap.utils.toArray(".hero .reveal-up").forEach((element) => gsap.from(element, {y:45, opacity:0, duration:1, ease:"power3.out", scrollTrigger:{trigger:element, start:"top 86%", once:true}}));
} else {
  typewriter();
}

const exhibitionMedia = gsap.matchMedia();
let railNavigationTween;
let railNavigationGeneration = 0;
let railNavigationActive = false;

exhibitionMedia.add({
  compact: "(max-width: 1024px)",
  desktop: "(min-width: 1025px)",
  touch: "(hover: none)",
  reduced: "(prefers-reduced-motion: reduce)"
}, (context) => {
  const {compact, touch, reduced} = context.conditions;
  const animated = !reduced && (compact || !touch);
  const cleanups = [];

  if (!compact && !touch && !reduced) {
    gsap.utils.toArray(".reveal-up:not(.hero .reveal-up)").forEach((element) => gsap.from(element, {y:45, opacity:0, duration:1, ease:"power3.out", scrollTrigger:{trigger:element, start:"top 86%", once:true}}));
    gsap.from(".about-title .about-line", {y:35, opacity:0, duration:.9, stagger:.16, ease:"power4.out", scrollTrigger:{trigger:".about-title", start:"top 82%", once:true}});
    gsap.to(".marquee-track", {xPercent:-25, duration:18, ease:"none", repeat:-1});
  }

  gsap.utils.toArray(".exhibition-room").forEach((room) => {
    const viewport = room.querySelector(".exhibition-viewport");
    const track = room.querySelector(".exhibition-track");
    const stage = room.querySelector(".exhibition-stage");
    const projectElements = gsap.utils.toArray(".exhibition-project", track);
    // A motion wrapper avoids the legacy mobile article's !important static transforms.
    const items = compact && animated ? projectElements.map((project) => {
      const motion = document.createElement("div");
      motion.className = "exhibition-motion";
      project.before(motion);
      motion.append(project);
      return motion;
    }) : projectElements;
    const count = items.length;
    const status = room.querySelector(".project-status");
    const progress = room.querySelector(".exhibition-progress span");
    const chapterHeader = room.querySelector(".chapter-header");
    const rail = room.querySelector(".chapter-rail");
    const markers = gsap.utils.toArray(".chapter-rail-marker", rail);
    const previews = markers.map((marker) => marker.querySelector(".chapter-rail-preview img"));
    room.classList.toggle("animated-exhibition", animated);
    room.classList.toggle("reduced-exhibition", !animated);
    let activeIndex = -1;
    const setActive = (index) => {
      if (index === activeIndex) return;
      activeIndex = index;
      status.textContent = `WORK ${String(index + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`;
      rail.dataset.activeIndex = String(index);
      markers.forEach((marker, markerIndex) => {
        marker.classList.toggle("is-visited", markerIndex < index);
        marker.classList.toggle("is-active", markerIndex === index);
        marker.setAttribute("aria-current", markerIndex === index ? "step" : "false");
      });
      if (animated) projectElements.forEach((project, projectIndex) => {
        project.inert = projectIndex !== index;
        project.setAttribute("aria-hidden", String(projectIndex !== index));
      });
    };
    markers.forEach((marker) => marker.classList.add("is-revealed"));
    setActive(0);
    cleanups.push(() => {
      room.classList.remove("animated-exhibition", "reduced-exhibition");
      projectElements.forEach((project) => {
        project.inert = false;
        project.removeAttribute("aria-hidden");
        const wrapper = project.parentElement;
        if (wrapper.classList.contains("exhibition-motion")) wrapper.replaceWith(project);
      });
      markers.forEach((marker) => {
        marker.classList.remove("is-revealed", "is-active", "is-visited");
        marker.setAttribute("aria-current", "false");
      });
      delete rail.dataset.activeIndex;
      progress.style.removeProperty("transform");
    });
    if (!animated) {
      projectElements.forEach((project, index) => {
        ScrollTrigger.create({trigger:project, start:"top center", end:"bottom center", onEnter:() => setActive(index), onEnterBack:() => setActive(index)});
      });
      return;
    }

    const mainScale = (item) => {
      const availableHeight = Math.max(1, stage.clientHeight - 24);
      return Math.min(1, availableHeight / Math.max(1, item.offsetHeight));
    };
    const railTransform = (item, marker) => {
      const frame = item.querySelector(".exhibition-frame");
      const trackRect = track.getBoundingClientRect();
      const previewRect = marker.querySelector(".chapter-rail-preview").getBoundingClientRect();
      const scale = previewRect.width / frame.offsetWidth;
      const articleCenterX = trackRect.left + trackRect.width * (compact ? .5 : .54);
      const articleCenterY = trackRect.top + trackRect.height * .5;
      const frameCenterOffsetY = frame.offsetTop + frame.offsetHeight * .5 - item.offsetHeight * .5;
      return {
        x: previewRect.left + previewRect.width * .5 - articleCenterX + (compact ? rail.scrollLeft : 0),
        y: previewRect.top + previewRect.height * .5 - articleCenterY - frameCenterOffsetY * scale,
        scale
      };
    };

    markers.forEach((marker) => marker.classList.add("is-revealed"));
    gsap.set(markers, {opacity:1, x:0});
    gsap.set(items, {xPercent:-50, yPercent:-50, autoAlpha:0, scale:.58, z:-90, rotateY:5, rotateX:1});
    gsap.set(items[0], {autoAlpha:1, scale:mainScale(items[0]), z:0, rotateY:0, rotateX:0});
    gsap.set(previews, {opacity:1});
    gsap.set(previews[0], {opacity:0});

    const timeline = gsap.timeline({
      defaults: {ease:"none"},
      scrollTrigger: {
        trigger: room,
        pin: viewport,
        scrub: true,
        invalidateOnRefresh: true,
        end: () => `+=${compact ? Math.max(viewport.clientHeight * .75, (count - 1) * Math.min(viewport.clientHeight * .85, 720)) : Math.max(900, (count - 1) * Math.min(window.innerWidth * .72, 900))}`,
        onUpdate: (self) => {
          const current = Math.min(count, Math.round(self.progress * (count - 1)) + 1);
          setActive(current - 1);
          progress.style.transform = `scaleX(${self.progress})`;
        }
      }
    });

    timeline.set(items[0], {scale:() => mainScale(items[0])}, 0);
    timeline.to(chapterHeader, {opacity:.35, duration:1}, 0);
    items.forEach((item, index) => {
      if (index >= count - 1) return;
      const next = items[index + 1];
      const outgoingInfo = item.querySelectorAll(".exhibition-project-number, .exhibition-details");
      const incomingInfo = next.querySelectorAll(".exhibition-project-number, .exhibition-details");

      timeline
        .set(next, {x:() => stage.clientWidth * .55, autoAlpha:0, scale:.58, z:-90, rotateY:5, rotateX:1}, index)
        .to(previews[index + 1], {opacity:0, duration:.16}, index)
        .to(outgoingInfo, {opacity:0, duration:.28}, index)
        .to(item, {
          x:() => railTransform(item, markers[index]).x,
          y:() => railTransform(item, markers[index]).y,
          scale:() => railTransform(item, markers[index]).scale,
          z:compact ? 0 : -45,
          rotateY:compact ? 0 : -4,
          rotateX:compact ? 0 : 1,
          duration:1,
          ease:"power2.inOut",
          // Keep the landing point attached to the horizontally scrollable rail, in either direction.
          ...(compact ? {modifiers:{x:function(value) {
            return `${parseFloat(value) - rail.scrollLeft * this.ratio}px`;
          }}} : {})
        }, index)
        .to(next, {x:0, autoAlpha:1, scale:() => mainScale(next), z:0, rotateY:0, rotateX:0, duration:1, ease:"power2.inOut"}, index)
        .to(incomingInfo, {opacity:1, duration:.35}, index + .58)
        .to(previews[index], {opacity:1, duration:.14}, index + .84)
        .set(item, {autoAlpha:0}, index + .99);
    });
  });
  return () => {
    railNavigationGeneration++;
    railNavigationTween?.kill();
    railNavigationTween = null;
    railNavigationActive = false;
    cleanups.forEach((cleanup) => cleanup());
  };
});

async function goToProject(room, targetIndex) {
  if (railNavigationActive) return;

  const projectsInRoom = room.querySelectorAll(".exhibition-project");
  if (!projectsInRoom[targetIndex]) return;
  const trigger = ScrollTrigger.getAll().find((instance) => instance.trigger === room);
  if (!trigger) {
    projectsInRoom[targetIndex].scrollIntoView({behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block:"center"});
    projectsInRoom[targetIndex].querySelector("[data-lightbox]").focus({preventScroll:true});
    return;
  }

  const lastIndex = projectsInRoom.length - 1;
  const currentIndex = Math.round(trigger.progress * lastIndex);
  if (currentIndex === targetIndex) return;

  railNavigationActive = true;
  const generation = railNavigationGeneration;
  let cancelled = false;
  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  const direction = Math.sign(targetIndex - currentIndex);
  const stepDuration = 1 / Math.abs(targetIndex - currentIndex);

  try {
    for (let index = currentIndex + direction; direction > 0 ? index <= targetIndex : index >= targetIndex; index += direction) {
      const targetProgress = index / Math.max(1, lastIndex);
      const targetY = trigger.start + (trigger.end - trigger.start) * targetProgress;
      await new Promise((resolve) => {
        let settled = false;
        const finish = (wasCancelled = false) => {
          if (settled) return;
          settled = true;
          cancelled = wasCancelled;
          resolve();
        };
        railNavigationTween = gsap.to(window, {
          scrollTo:{y:targetY, autoKill:true, onAutoKill:() => finish(true)},
          duration:stepDuration,
          ease:"power3.inOut",
          overwrite:true,
          onComplete:() => finish(false),
          onInterrupt:() => finish(true)
        });
      });
      if (cancelled || generation !== railNavigationGeneration) break;
    }
  } finally {
    root.style.scrollBehavior = previousScrollBehavior;
    if (generation === railNavigationGeneration) {
      railNavigationTween = null;
      railNavigationActive = false;
    }
  }
}

document.querySelectorAll(".exhibition-room").forEach((room) => {
  room.querySelectorAll(".chapter-rail-marker").forEach((marker) => {
    marker.addEventListener("click", (event) => {
      event.preventDefault();
      goToProject(room, Number(marker.dataset.localIndex));
    });
  });
});

exhibitionMedia.add("(min-width: 1025px) and (hover: hover) and (prefers-reduced-motion: no-preference)", () => {
  const listeners = [];
  const listen = (element, event, callback) => {
    element.addEventListener(event, callback);
    listeners.push(() => element.removeEventListener(event, callback));
  };
  const magneticElements = document.querySelectorAll(".magnetic");
  magneticElements.forEach((element) => {
    listen(element, "mousemove", (event) => {
      const box = element.getBoundingClientRect();
      gsap.to(element, {x:(event.clientX-box.left-box.width/2)*.18, y:(event.clientY-box.top-box.height/2)*.18, duration:.4, ease:"power3.out"});
    });
    listen(element, "mouseleave", () => gsap.to(element, {x:0,y:0,duration:.5,ease:"elastic.out(1,.5)"}));
  });
  return () => {
    listeners.forEach((remove) => remove());
    gsap.killTweensOf(magneticElements);
    gsap.set(magneticElements, {clearProps:"transform"});
  };
});
