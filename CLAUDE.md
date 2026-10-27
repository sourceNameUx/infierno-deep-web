# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page, static interactive artwork: **"El Infierno de la Deep Web"**, a Spanish-language
3D "archipelago" of five digital-sin circuits (plus *El Núcleo*) with a case-file UI for real-world
"sinners". No build system, no package manager, no tests, no framework — three files
(`index.html`, `styles.css`, `app.js`) plus vendored Three.js.

Content and UI copy are **Spanish**; keep it that way. Markdown/docs stay in English.

## Running it

There is nothing to build or install. Open the page directly:

```sh
start index.html                      # Windows, from infierno-deep-web/
python -m http.server 8000            # or serve the folder, then http://localhost:8000
```

`file://` works — everything the scene needs is procedural and generated at runtime. The one
exception is GLB models, which load through `GLTFLoader` (XHR) and therefore need a real HTTP
server; `models/` now ships `isla_roca.glb`, so serve the folder over HTTP to see the real
rocks (from `file://` the page still works, just with the procedural fallbacks).

There is no linter, formatter, or test runner configured. Verification is manual: load the page,
check `window.__errs`, and confirm `#nothree` stays hidden.

## Architecture

**One global script, no modules.** `app.js` is a single flat `<script>` with no imports, no bundler,
no IIFE boundary. Top-level bindings use `let`/`const`, so they are **not** properties of `window`
— read them from a console as bare identifiers (`renderer`, `scene`, `composer`), not `window.renderer`.

### Script load order is load-bearing

`index.html` loads, each followed by a `document.write` CDN fallback guarded by a feature check:

```
three.min.js → OrbitControls.js → GLTFLoader.js    (the original trio)
CopyShader.js → LuminosityHighPassShader.js → EffectComposer.js
             → ShaderPass.js → RenderPass.js → UnrealBloomPass.js
```

`THREE.Pass` is defined **inside `EffectComposer.js`**, and `ShaderPass`/`RenderPass`/
`UnrealBloomPass` each do `class X extends THREE.Pass` **at script-evaluation time**, not at
construction. With `ShaderPass.js` ahead of `EffectComposer.js` the class throws while loading and
`THREE.ShaderPass` never exists — silently, because `app.js`'s error listener does not exist yet.
`initBloom()` warns by name about any missing global.

### Bloom is optional by construction

`initBloom()` feature-checks the four globals, builds the composer in a `try/catch`, and on any
failure leaves `composer = null` so `animate()` falls back to `renderer.render(scene, camera)`.
Nothing downstream may assume the composer exists.

**The render-target encoding invariant — do not "fix" this.** The composer target is created as
`HalfFloatType` with `rt.texture.encoding = THREE.sRGBEncoding`, matching `renderer.outputEncoding`.
In r128 a material resolves its output encoding as
`(_currentRenderTarget === null) ? renderer.outputEncoding : _currentRenderTarget.texture.encoding`,
so if the two differ every material needs two program variants and **recompiles every frame**.
`HalfFloatType` is what keeps three off the hardware `SRGB8_ALPHA8` path (guarded by
`type === UnsignedByteType`), so encoding still happens exactly once, in the shader. The invariant is
checked by sampling `renderer.info.programs.length` a few seconds apart with the composer live: it
must stay flat (currently 22).

The composer is built with its **default** target and then `composer.reset(rt)`, rather than by
passing a custom RT to the constructor: the constructor's custom-target branch sets `_pixelRatio`,
`_width` and `_height` from the target's *physical* size, which only public API can then correct.

### Colour pipeline

`scene.background` is a raw hex and does **not** pass through `outputEncoding`; fog and shader haze
are fed **linear** colours (`HAZE_LIN`) and encode with the exact `lin2srgb()` in the shader. That is
why background, fogged geometry and the ground plane converge on the same pixel at the horizon.

Two consequences worth knowing before touching materials:

- `ShaderMaterial` receives neither `tonemapping_fragment` nor `encodings_fragment`. Custom shaders
  must call `lin2srgb()` themselves. `pow(col, 1.0/2.2)` is **not** three.js's sRGB curve — it lacks
  the linear segment below 0.0031308, and for dark values the error is large enough to show as a
  seam where two differently-encoded surfaces meet.
- `canvasTex()` sets `t.encoding = THREE.sRGBEncoding`. The canvas hex values are sRGB, so without
  this they are consumed as linear and everything textured renders washed out.

### Data-driven rendering

`CIRCUITS` (6 entries, `id` 1–5 plus `id` 0 = El Núcleo) and `SINNERS` are the single source of
truth, and now the **only** render site — the panel/drawer generates every view from them, so a
string can no longer live in two places.

| View | Source |
|---|---|
| `viewCircuit(id)` | `CIRCUITS[id]` — `desc`, `cust`, `pun`, `entrada`, `salida` + its `SINNERS` |
| `viewConcept()` | prose literals in `app.js` |
| `viewSinners()` | `SINNERS` grouped by `c` |
| `viewSinner(name)` | `SINNERS[name]` — `who`, `why`, `pun` |

`order = [1,2,3,4,5,0]` drives prev/next and the auto-tour, so **`id: 0` is still special-cased**:
its own build path inline in `initThree()` (no `buildX()` function), its own `ISLAND_POS[0]`, its own
camera goal in `flyTo()` and no rock base.

### Layout: the 3D *is* the page

`#scene3d` is a fixed full-viewport layer; there is no document scrolling
(`body.scrollHeight <= innerHeight` on every viewport). HUD chrome (`.hud-top`, `.hud-nav`,
`.hud-hint`, `.dock`) is `pointer-events:none` with `auto` re-enabled on the actual buttons —
without that, OrbitControls never sees a `pointerdown` near the top or bottom of the screen and the
camera feels broken exactly where a user naturally grabs.

Camera framing is **derived per resize**, never fixed: `fitDistance()` takes the binding constraint
of `min(vFov, hFov)` so the ring frames correctly in portrait, and `controls.maxDistance` is
recomputed from it (133 at 16:9, 254 at 420×880) — hardcoding it traps the user unable to see the
whole archipelago. `flyTo()` shifts the framing laterally by the panel's width so a selected circuit
is not left underneath the drawer.

Island labels are DOM buttons in `#labels3d`. Every frame, all labels are projected first and then
placed in **fixed id order** against a fixed candidate offset list, taking the first free slot and
hiding the label if none fits — deterministic input, deterministic output, so labels move together at
discrete thresholds instead of each flickering on its own. `x` is clamped to the canvas: the
candidate list only resolves *vertical* collisions, so without the clamp, lateral islands in portrait
had their labels cut off by the viewport edge.

### The 3D scene is fully procedural

Islands, lava shader, cave walls, bridges, particles and all circuit props are generated in code,
with textures drawn at runtime onto canvases (`canvasTex`, `staticScreenTexture`, `lavaCrackTexture`,
`mistTexture`, …). Each circuit has a `build*()` function mutating a shared `props` group; per-frame
animation reads back through `group.userData` keys (`eye`, `swing`, `ghosts`, `mists`, `fire`, `pit`,
`shards`).

The ground is a `ShaderMaterial` with smooth value-noise fbm (≤4 octaves), a single low-frequency
domain warp and an `abs(fbm-0.5)` crease network, with `fwidth`-scaled thresholds so one screen pixel
always covers the same fraction of a vein edge. This replaced high-frequency `sin()` products that
aliased into a repeating basketweave at grazing angles. It needs `extensions:{derivatives:true}` for
the WebGL1 `fwidth` path. Its radial fade (`uFadeNear`/`uFadeFar`) is deliberately short: from
`maxDistance` most visible ground sits between radius 100 and 300, and a long fade filled the wide
shot with lava and swallowed the islands.

### Audio: a generative score, not a loop

There is no audio file. `audioStart()` synthesises an i–VI–iv–V progression in D minor at 50 bpm
(bass, pad, bells, heartbeat, cavern air) through a synthetic convolution reverb. A lookahead
scheduler (`setInterval` 300 ms, 1.5 s lookahead) keeps the score from gapping when the browser
throttles timers. `SCALES[id]` picks the mode each circuit's melody draws from, so entering another
circle genuinely changes the music.

That same lookahead is why a `visibilitychange` handler suspends the `AudioContext` on hide and
resumes it on return — without it the score kept playing from a background tab. Suspending freezes
the context clock, so already-scheduled notes do not fire in a burst on resume; the resume path only
re-arms the master gain and pushes `A.next` forward. Both directions bail out early when
`playing === false`, so a visitor who muted the audio is not un-muted by switching tabs.

It starts only from the boot click, because `AudioContext.resume()` requires a user gesture — and
that call is wrapped in `try/catch` so an audio failure cannot take the entrance animation down
with it.

### GLB override

`preloadModels()` tries to load `models/*.glb` and, on success, hides the procedural props
(`o.props.visible = false`) and swaps in the model. Named slots: `circuito{1..5}_*.glb`, `nucleo.glb`,
`isla_roca.glb`. Load failures are swallowed on purpose — the procedural version is the fallback, not
an error.

**Asset conventions** (keep them when replacing a model): plain GLB, embedded textures ≤ 2048px,
no Draco/KTX2 (r128 has no loader plugins), ≤ ~8 MB. `isla_roca.glb` was decimated 46.8k → 8k tris
with UV-preserving quadric collapse (pymeshlab) and its raised outer lip was compressed so the
plateau mean sits just below the bbox top; `applyIslaModel` anchors that top at `y = 0.9` — the same
convention as circuit sets (`baseY` in `applyCircuitModel`). Any future island asset should be
authored so the walkable plateau *is* the bbox top.

`circuito2_mercaderes.glb` came from an untextured Three.js-exported `.obj` (named groups, no
UVs/materials): converted by welding + per-group decimation (71k → 24k tris) and authoring one PBR
material per group; flat vs smooth normals baked per group. When a circuit GLB loads, the island's
procedural perimeter pillars (`group.userData.pilBits`, collected in `buildBase`) are hidden so they
don't pierce the model's platform, and model meshes get `castShadow` + `receiveShadow`.

### Entry-point / error-handling pattern

The bottom of `app.js` is the real entry point, and it branches on what loaded:

1. `THREE` undefined → show `#nothree` ("re-run from the full folder").
2. `THREE` present but no `OrbitControls` → warn, still try `initThree()`.
3. WebGL unavailable (`checkGL()`) → show `#nothree` with a hardware-acceleration hint.
4. Otherwise → `initThree()` then `preloadModels()`.

`initThree()` is also called from inside branch 2, so guard any new code against double
initialization. A global `error` listener pushes into `window.__errs` and surfaces messages into
`#nothree` — check that array first when debugging "the 3D didn't load". Note that under `file://`
the origin is opaque, so those messages arrive as `"Script error."` with no stack; serve the folder
over HTTP when you need a real stack trace.

### Performance

A frame is ~325 draw calls and ~34 k triangles for the scene, plus **14** for the bloom chain
(high-pass + 5 mips × 2 separable blurs + composite) — measured with `renderer.info.autoReset`
disabled, because with the composer live the counters reset on every pass and the final blit leaves
`renderer.info.render.calls` reading `1`. A watchdog averages 120 frames and degrades in order:
drop `pixelRatio` to 1, then disable bloom entirely. Bloom is the only resolution-bound cost, so the
pixel-ratio cap is the main lever.

## Notes

- `.env` (repo root, one level up) holds `TRIPO_API_SECRET` for the Tripo3D API used offline to
  generate the `.glb` assets. No application code reads it; never inline it into `app.js` or the HTML.
- `mini_modelo.obj` at the repo root is a unit-cube test asset, unused by the page.
- CSS uses `color-mix(in srgb, …)` and `backdrop-filter`; both need a current browser.
- `prefers-reduced-motion` disables all animations globally (last line of `styles.css`).
