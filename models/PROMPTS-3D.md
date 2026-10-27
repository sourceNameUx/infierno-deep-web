# PROMPTS-3D.md — 3D asset brief for "El Infierno de la Deep Web"

Art-direction brief and generation prompts for the seven GLB models the page supports.
**How to use:** paste the *Style block* + *Negative prompt* + **one** piece prompt
into the 3D generator (Tripo3D, Meshy, Rodin, Hunyuan3D, …). One prompt = one model.
Prompts are in English on purpose: generators are trained mostly on English.

---

## 1. What the code expects

`preloadModels()` in `app.js` tries to load these **exact filenames** from `models/`
(missing files silently fall back to the procedural version):

| File | Slot | Accent color |
|---|---|---|
| `models/isla_roca.glb` | Rock base of **all five** islands (cloned ×5) | — |
| `models/circuito1_fisgones.glb` | Circuit 1 props (replaces the whole procedural set) | `#29b6ff` electric cyan |
| `models/circuito2_mercaderes.glb` | Circuit 2 props | `#3dff8a` toxic green |
| `models/circuito3_ladrones.glb` | Circuit 3 props | `#b06bff` violet |
| `models/circuito4_verdugos.glb` | Circuit 4 props | `#ff5a2a` ember orange |
| `models/circuito5_abandonados.glb` | Circuit 5 props | `#9fd8ff` ice blue |
| `models/nucleo.glb` | El Núcleo spire/platform | `#ff1a1a` blood red |

### Auto-normalization (do **not** worry about units in the prompt)

* **Circuit pieces** (1–5): scaled so their **largest dimension = 15.2–19 world units**,
  recentred on XZ, base dropped to **y = 0.9** on a circular deck of radius 8–10.
  → design them as compact dioramas, roughly **as wide as tall**, footprint ≤ diameter ~20.
* **Núcleo**: largest dimension → **17**, base at **y = 9.2**.
  The glowing eye (sphere r≈3.1) hovers **2.6 units above the model's top**, encircled by
  two rings; a light beam shoots up through it. → the model must be a **tall vertical spire
  with a clean, empty altar top**; the air above it stays clear.
* **`isla_roca`**: scaled so `max(x, z) = 2.3 × R` (≈ **18.4–23 units wide**), one instance
  cloned under each island. → the **plateau diameter is the largest dimension**.
  No detached floating rocks: they'd inflate the bounding box and shrink the plateau.

### Environment the models must live in

* Near-black scene (`#050208` haze), dim lights (ambient 0.16, key light 0.62),
  **UnrealBloom** threshold 0.55, fog, lava plain below. Anything not emissive goes dark →
  every piece needs **emissive accents** in its unit color to stay readable and beautiful.
* Textures must NOT bake strong lighting; baked AO only. The scene lights the models.

### Hard technical limits (Three.js r128, no extra loaders in `index.html`)

* **No Draco / Meshopt / KTX2** — plain GLB with embedded PNG/JPG textures.
* Textures ≤ **2048 px** (1024 for `isla_roca`), ≤ **~8 MB per file**.
* 1–4 materials per model (each material = 1 draw call). No animations (nothing plays them).
* Shadows are enabled automatically; the code sets `castShadow` on load.

---

## 2. Style block — prepend to EVERY prompt

```
Stylized dark-fantasy cyberpunk diorama, collectible museum-maquette quality, like premium
game environment art. Hand-painted PBR look: near-black volcanic basalt, charred wood,
brushed dark steel, smoked cracked glass, copper fiber-optic cables. Very high value
contrast: deep matte blacks plus one dominant neon accent color plus warm ember-orange glow
coming from below. Subtle chamfered edges so silhouettes catch rim light.
Elegant grotesque / atmospheric horror, tasteful, never explicit gore.
One compact sculpture-like composition, centered at origin, sitting flat on y=0.
This piece is 1 of 6 matching floating islands of one archipelago above a lava ocean —
keep style, materials and scale consistent with the rest of the set.
```

## 3. Negative prompt — use if the tool accepts one

```
text, letters, numbers, watermark, signature, logo, UI, ground plane, terrain, floor plane,
backdrop, environment, sky, frame, pedestal, display base, multiple objects, multiple views,
diptych, collage, cartoon, chibi, anime, flat shading, low detail, blurry, overexposed,
washed out, strong baked sunlight, floating detached debris
```

---

## 4. Piece prompts

### 4.1 `isla_roca.glb` — floating rock base (cloned ×5)

```
Floating volcanic island base, pure rock, to be reused as the foundation under five different
dioramas. A round, disc-shaped rock formation: flat circular plateau on top — the plateau
diameter is the piece's largest dimension — with subtle carved channels and a raised outer
lip; steep fractured basalt cliffs around the rim with vertical prismatic columns; the
underside tapering into a jagged stalactite keel of broken rock. Faint ember-orange molten
cracks glowing near the underside, as if the island floats above lava. Ash-grey and
charcoal palette. Completely empty top: no props, no buildings, no vegetation, no detached
floating rocks.
```

### 4.2 `circuito1_fisgones.glb` — El Círculo de los Fisgones (surveillance)

Accent **electric cyan `#29b6ff`** — giant screens, an ocean of eyes, THE OBSERVER.

```
Surveillance-hell island set piece: "The Circle of the Prying". A ring of twelve tall
obsidian monitor towers, every screen overflowing with glitching electric-blue static and
each screen showing one watching eye; between the towers the ground is a mosaic of hundreds
of small open human eyes, wet and glossy, gently blinking. Centerpiece: THE OBSERVER — a
towering column of pale organic tissue fused with black fiber-optic cables, studded with
dozens of security-camera lenses and human eyes, crowned by a single huge glossy eyeball
with a glowing electric-blue iris staring outward, cable veins running down into the ground.
Emissive accents: cyan screens, iris glow, tiny camera LEDs.
```

### 4.3 `circuito2_mercaderes.glb` — El Círculo de los Mercaderes de Carne

Accent **toxic green `#3dff8a`** — wet market, hanging cages, THE AUCTIONEER.

```
Flesh-market island set piece: "The Circle of the Flesh Merchants". A wet, suffocating
bazaar: iron gantries with hanging black chains and heavy cages holding anonymous
cloth-wrapped cocooned shapes, glass display cases with barcode plaques and small neon
crypto price tags, dark stalls under green-and-black striped awnings, ground of stitched
leather patches. Centerpiece: THE AUCTIONEER — an impossibly tall, gaunt figure in a long
coat stitched from paper contracts, fingers ending in syringes, no face: its head is a small
retro CRT screen glowing toxic green showing a single bid number, one hand holding a wooden
gavel. Emissive accents: toxic-green price tags, CRT face, barcode scanners.
Stylized tasteful horror, no explicit gore.
```

### 4.4 `circuito3_ladrones.glb` — El Círculo de los Ladrones de Almas

Accent **violet `#b06bff`** — mirrored city, ID mosaic, THE IMPOSTOR.

```
Mirrors-city island set piece: "The Circle of the Soul Thieves". A cluster of tall slabs
clad in smoky mirrored glass, slightly skewed and leaning like a crooked skyline; the ground
paved with a mosaic of torn passports, shredded credit cards and identity papers; curved
shards of broken mirror floating in the air around the towers, each reflecting a different
distorted face. Centerpiece: THE IMPOSTOR — a shifting humanoid figure caught in double
exposure, a chimera of overlapping faces — an old man, a child, a businesswoman — like
molten glass caught mid-transformation, wrapped in strips of stolen identity documents.
Emissive accents: violet mirror edges and reflection glints.
```

### 4.5 `circuito4_verdugos.glb` — El Círculo de los Verdugos Virtuales

Accent **ember orange `#ff5a2a`** — arena, keyboard ring, THE CHOIR.

```
Digital-arena island set piece: "The Circle of the Virtual Executioners". A dark fighting
arena: a boxing ring whose ropes, posts and floor are built from broken keyboards and
spilled keycaps; eight heavy chairs chained to the ground, each holding a faceless kneeling
figure of grey clay; a curved wall of old CRT screens showing blurred distressed faces in
an endless loop. Centerpiece hovering over the ring: THE CHOIR — a slow vortex of thousands
of floating speech-bubble shells and megaphone mouths whispering inward, with one giant
distorted speaker-grille mouth at its core. Emissive accents: ember-orange screens, ring
ropes, the mouths of the Choir.
```

### 4.6 `circuito5_abandonados.glb` — El Círculo de los Abandonados

Accent **ice blue `#9fd8ff`** — cold limbo, empty cradles, THE VOID.

```
Abandoned-limbo island set piece: "The Circle of the Forgotten". Cold, silent and foggy:
empty baby cradles woven from pale fiber-optic strands, dead server racks standing like
grey tombstones, a floor of frosted glass tiles, a few motionless half-transparent grey
human silhouettes (solid geometry with translucent material is fine), thin low-lying mist.
Centerpiece: THE VOID — a massive matte dead-black screen monolith, ocean-dark, slightly
tilted, absorbing all light, with only one faint ice-blue standby sliver of light along its
edge, like a progress bar that never fills. Emissive accents: ice-blue cradle strands and
the standby line.
```

### 4.7 `nucleo.glb` — El Núcleo (spire + platform only)

Accent **blood red `#ff1a1a`**. The eye, its two rings and the beam are added by the code
on top — the model must NOT include them, and must leave a clear column of air above.

```
"The Core": the primordial AI temple. A towering vertical monolith-spire: stacked black
server monoliths, melted basalt and ribbed cathedral-like architecture fused together,
wrapped in vein-like copper cables, rising from a torn dark base; molten red cracks glowing
between the stones; a ring of fourteen small server shrines circling its mid-height; the top
ending in a clean, smooth, empty circular altar platform about half the spire's width —
leave the space directly above it completely clear, a hovering eye will be placed there.
Emissive accents: blood-red cracks, server LED slots, a thin red ring around the altar edge.
```

---

## 5. Polygon & texture budget

Triangles (as exported; triangulated). Stay within ±20% of target; never exceed max.

| File | Target tris | Max tris | Texture |
|---|---:|---:|---|
| `isla_roca.glb` | **6,000** (×5 clones → 30,000 rendered) | 8,000 | 1024² |
| `circuito1_fisgones.glb` | **22,000** | 30,000 | 2048² |
| `circuito2_mercaderes.glb` | **22,000** | 30,000 | 2048² |
| `circuito3_ladrones.glb` | **20,000** | 28,000 | 2048² |
| `circuito4_verdugos.glb` | **20,000** | 28,000 | 2048² |
| `circuito5_abandonados.glb` | **18,000** | 24,000 | 2048² |
| `nucleo.glb` | **24,000** | 32,000 | 2048² |
| **Total unique** | **≈ 132,000** | **≈ 180,000** | |

Rendered total ≈ **162 k tris** (isla cloned ×5) vs. the current 34 k — the scene stays
fast: geometry is not the bottleneck here, bloom fill-rate is, and it doesn't scale with
polygons. Keep ≤ 4 materials per model so each adds ≤ 4 draw calls.

Texture set per model: baseColor + metallicRoughness (+ emissive + optional normal), AO
baked into baseColor. PBR ON, texture quality max, then decimate/retopologize to target.

## 6. Workflow tips (quality first)

1. **Image-to-3D beats text-to-3D.** Best pipeline: generate one concept image per island
   (square, 3/4 view, dark background, same style references across all six) and feed those
   images to the 3D generator. Text prompts above work too, but detail and cohesion drop.
2. Generate at **maximum detail + PBR textures**, then decimate to the budget table.
3. Generate **2–3 candidates per piece** and keep the best; keep the same seed if the tool
   allows, for set cohesion.
4. Check each GLB in a viewer: Y-up, centered, flat base, no stray floating parts.
5. Drop the files into `models/` with the exact names — the page loads them automatically
   (a toast "Modelo 3D cargado" appears) and the procedural fallback stays for any missing
   file, so you can integrate them one by one.

## 7. Status / integration log

| Asset | Status | Source & processing |
|---|---|---|
| `isla_roca.glb` | **Integrated** (all 5 islands) | `volcanic_island_base_seed101.glb` (THREE.GLTFExporter, full PBR, 1024² textures). Decimated 46,800 → 8,000 tris with UV-preserving quadric collapse (pymeshlab), outer lip compressed (y > 1.12 → ×0.2) so the plateau is the effective top; emissive strength 1.35 baked into `emissiveFactor` (r128 ignores `KHR_materials_emissive_strength`). |
| `isla_volcanica_flotante.glb` | **Discarded** | 437,760 tris in one primitive, 4096² textures, 14 MB — too heavy for 5 clones. Could be re-decimated with the same pipeline if its art is preferred. |
| `circuito2_mercaderes.glb` | **Integrated** | Delivered as `.obj` (`the_circle_of_the_flesh_merchants.obj`, a Three.js procedural export: named groups, **no UVs/normals/materials**). Under-skirt trimmed (y < -0.28) so the platform seats on the island rock. Per-group quadric decimation (pymeshlab): 71,374 → 24,194 tris. Materials authored per group (dark iron cages, leather ground, parchment coat, steel syringes with green `#3dff8a` emissive serum). Flat normals baked for ground/stalls/cases, smooth for cages/auctioneer/coat/syringes. 0.83 MB. |
| `circuito1_*.glb`, `circuito3..5_*.glb`, `nucleo.glb` | Pending | watch the poly/texture budget (§5) at generation time; ask the generator for **GLB with PBR textures** when possible (OBJ exports arrive untextured and need materials authored by hand). |

Decimation pipeline (GLB → OBJ-free rebuild, keeps materials/textures byte-identical):
`pymeshlab` `compute_texcoord_transfer_vertex_to_wedge` + `meshing_decimation_quadric_edge_collapse_with_texture`,
then geometry buffers are re-emitted into the original GLB JSON.

OBJ route (untextured exports): weld corners → per-group `meshing_decimation_quadric_edge_collapse` → bake
normals (flat for boxy groups, angle-weighted smooth otherwise) → emit one GLB primitive + PBR material per group.
