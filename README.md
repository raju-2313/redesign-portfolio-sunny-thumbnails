# Sunny Thumbnails — Portfolio Redesign

A redesigned interactive portfolio website for Sunny, showcasing thumbnail design work through an exhibition-style interface.

A static website with one entry point: `index.html`. No bundler, compilation, npm installation, or build step is required. Existing animation code and stylesheet boundaries are retained deliberately.

## Features

- Responsive portfolio experience with a portrait header.
- Interactive hero film carousel: a desktop circular film installation and two opposing, infinitely looping mobile horizontal film strips.
- RESET FILM collapse/expansion and switching between 28/29 thumbnail sets.
- GSAP animations and a scroll-driven exhibition of all 57 thumbnails.
- Interactive project rail with sequential forward/reverse click navigation.
- Existing YouTube links, artwork lightbox, keyboard controls, and reduced-motion support.

## Tech stack

- HTML5, CSS3, and JavaScript using classic browser scripts.
- GSAP 3.12.5, ScrollTrigger, and ScrollToPlugin via jsDelivr.
- Google Fonts: Manrope, Instrument Sans, and DM Mono.
- Static assets ready for Vercel hosting; no deployment is implied.

## Project map

```text
index.html
assets\images\thumbnails\          All 57 original JPEG assets
assets\images\misc\portfolio-owner.png  Header portrait, separate from film thumbnails
css\
  site.css                         Original site styles, including legacy responsive rules
  film-carousel.css                Circular film, stage and RESET FILM control
  responsive-sections.css          Mobile/tablet sections, exhibition and rail
  mobile-film.css                  Mobile/tablet hero and two film strips
js\
  main.js                          Project metadata/rendering, hero intro, exhibition,
                                   ScrollTrigger, rail navigation, lightbox and pointer effects
  components\film-carousel.js      Desktop circle and mobile strips; shared set/reset state
  data\thumbnails.js               Generated window.WORK_IMAGES filename manifest
  data\film-sets.js                Derives window.FILM_SETS from rendered project order
scripts\generate-work-manifest.ps1  Development-only manifest generator
README.md                          Setup, dependencies and maintenance
.gitignore                         Excludes local-only files from Git
.vercelignore                      Limits deployment uploads to the static website
```

No empty placeholder folders or speculative modules are needed. Fonts are supplied by Google Fonts, the reset icon is inline SVG, and the noise texture is an inline CSS data URL; there are no separate local font or icon assets.

## Preview locally

From the project root in PowerShell, with Python 3 installed:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Open **http://127.0.0.1:4173/**. If that port is already in use, use another port. Stop the server with Ctrl+C. This server is for local preview, not production hosting.

No `package.json`, dependency installation, or lockfile is needed. Python is only a local preview tool, not a production dependency.

With Node.js installed, syntax-check the browser scripts from PowerShell:

```powershell
node --check .\js\main.js
node --check .\js\components\film-carousel.js
node --check .\js\data\thumbnails.js
node --check .\js\data\film-sets.js
```

## Runtime dependency order — preserve it

`index.html` loads these stylesheets in this exact cascade order:

1. `css/site.css`
2. `css/film-carousel.css`
3. `css/responsive-sections.css`
4. `css/mobile-film.css`

It then loads classic scripts, in order, at the end of the document:

1. GSAP **3.12.5** from jsDelivr.
2. GSAP ScrollTrigger **3.12.5** from jsDelivr.
3. GSAP ScrollToPlugin **3.12.5** from jsDelivr.
4. `js/data/thumbnails.js` defines `window.WORK_IMAGES`.
5. `js/main.js` registers plugins and synchronously builds the exhibition and rail.
6. `js/data/film-sets.js` reads the rendered project images to create the **28 + 29** film sets.
7. `js/components/film-carousel.js` consumes both globals and initializes the film.

Do not reorder these scripts, add `async`, convert them to modules, or split their shared state as part of routine file maintenance. The main script intentionally keeps exhibition and rail logic together. Both film layouts intentionally share one controller, active-set state, reset lock and animation-frame loop.

## Assets and content

- `js/main.js` contains the four featured projects and their existing YouTube URLs. Other projects come from the filename manifest. The research CSVs do **not** control live video links.
- Both JavaScript controllers resolve image paths relative to `index.html`, under `assets/images/thumbnails/`. This also supports hosting the whole site under a subdirectory.
- All 57 filenames and image bytes are retained. `84aa289d.jpg` and `b1d62ce1.jpg` are byte-identical but separately referenced; do not deduplicate them without an explicit content change.
- `js/data/film-sets.js` uses exhibition order, not the directory's display order. It must run after exhibition rendering.

If thumbnail files are deliberately added or renamed, regenerate the manifest from the project root:

```powershell
powershell -NoProfile -File .\scripts\generate-work-manifest.ps1
```

The generator uses PowerShell on Windows, resolves paths relative to its own location, sorts JPEG filenames, and writes `js/data/thumbnails.js`. It does not regenerate project metadata or video links. The current film setup expects 57 thumbnails; changing that collection is a separate behavior/content task.

## Responsive behavior and checks

The existing breakpoint remains **1024px**: mobile/tablet uses two opposing film strips; larger widths use the circular film. Existing reduced-motion handling and responsive GSAP contexts remain in their original scripts.

After intentional changes, verify desktop and mobile: RESET FILM in both directions through the two sets, seamless opposing strips, exhibition forward/reverse scrolling, sequential rail clicks, rapid-click handling, lightbox and keyboard controls, and resizing across the breakpoint. Confirm 57 project images, 28/29 set membership, the four video links, no failed asset requests, and no page-level horizontal overflow. Syntax checks alone are not browser regression tests.

## Vercel deployment

Deployment is a separate, manual step:

1. In Vercel, choose **Add New → Project** and import the GitHub repository `raju-2313/redesign-portfolio-sunny-thumbnails`.
2. Select the `main` branch and use the **repository root** as Root Directory (leave it unset; do not select a nested folder).
3. Choose **Other** as the Framework Preset.
4. Leave the **Build Command empty**; enable its override if necessary to explicitly skip a build. There is no install command or dependency installation to run.
5. Use **`.`** as the Output Directory to serve the repository root.
6. Deploy when ready, then check the hero, film reset, exhibition, rail, and image requests on the resulting URL.

No `vercel.json`, framework conversion, build tool, or environment variable is required. `.vercelignore` allowlists `index.html`, `css`, `js`, and `assets` for deployment uploads. Documentation and the manifest generator remain in GitHub for maintenance, not browser runtime use.

For any static host, publish those same four entries together, preserving relative paths and filename case. The site has no server-side routes or SPA rewrite requirement.

Internet access is required for the unchanged jsDelivr GSAP dependencies and Google Fonts. The existing social and YouTube links also point to external services. Their availability is outside this repository's control.

## Repository scope and safety

The repository includes all production HTML, CSS, JavaScript, the 57 original JPEG thumbnails, the header portrait, and the manifest generator. Animation logic, styling, asset bytes, data order, and video URLs are unchanged by repository preparation.

Existing local `reference` CSVs and optional `package.json` shortcuts are intentionally ignored, not deleted. Backups, screenshots, recordings, assistant/editor files, environment files, credentials, logs, dependencies, and caches must not be committed. `.gitignore` covers these local-only categories without excluding production images.

Before publishing changes, review `git status` and the staged file list, check for secrets, verify all local references exist with matching filename case, and test desktop/mobile behavior. Do not deduplicate referenced thumbnails or split shared animation state as part of deployment maintenance.
