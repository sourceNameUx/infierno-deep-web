/* ============================================================
   tex.js — procedural texture factory.
   No image assets ship with this piece: every map is drawn at runtime on a
   canvas (albedo, roughness, emissive) or generated as a field and converted
   to a tangent-space normal map. All noise is PERIODIC so maps tile without
   seams, which is what lets a 3 m rock and a 30 m cliff share one material.
   ============================================================ */
window.APP = window.APP || {};

APP.TEX = (function(){
  'use strict';

  let ANISO = 4;
  const cache = new Map();

  /* ---------- deterministic hashing / noise ---------- */
  function rng(seed){
    let a = seed >>> 0;
    return function(){
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash2i(x, y, s){
    let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(s | 0, 1442695041);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  const smooth = t => t * t * (3 - 2 * t);

  /* periodic value noise: px/py are the lattice repetitions across the tile */
  function pnoise(x, y, px, py, s){
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const fx = smooth(x - x0), fy = smooth(y - y0);
    const ax = ((x0 % px) + px) % px, bx = ((x0 + 1) % px + px) % px;
    const ay = ((y0 % py) + py) % py, by = ((y0 + 1) % py + py) % py;
    const a = hash2i(ax, ay, s), b = hash2i(bx, ay, s);
    const c = hash2i(ax, by, s), d = hash2i(bx, by, s);
    const i1 = a + (b - a) * fx, i2 = c + (d - c) * fx;
    return i1 + (i2 - i1) * fy;
  }
  function pfbm(x, y, px, py, oct, s){
    let v = 0, amp = 0.5, f = 1, norm = 0;
    for (let o = 0; o < oct; o++){
      v += amp * pnoise(x * f, y * f, px * f, py * f, s + o * 131);
      norm += amp; amp *= 0.5; f *= 2;
    }
    return v / norm;
  }
  /* periodic worley — returns F1 and F2 so we can draw plate seams */
  function pworley(x, y, cells, s){
    const cx = Math.floor(x), cy = Math.floor(y);
    let f1 = 9, f2 = 9;
    for (let j = -1; j <= 1; j++){
      for (let i = -1; i <= 1; i++){
        const gx = cx + i, gy = cy + j;
        const wx = ((gx % cells) + cells) % cells, wy = ((gy % cells) + cells) % cells;
        const ox = hash2i(wx, wy, s), oy = hash2i(wx, wy, s + 77);
        const px = gx + ox, py = gy + oy;
        const d = Math.hypot(px - x, py - y);
        if (d < f1){ f2 = f1; f1 = d; } else if (d < f2){ f2 = d; }
      }
    }
    return [f1, f2];
  }

  /* ---------- field -> canvas helpers ---------- */
  function field(w, h, fn){
    const f = new Float32Array(w * h);
    for (let y = 0; y < h; y++){
      for (let x = 0; x < w; x++) f[y * w + x] = fn(x / w, y / h, x, y);
    }
    return f;
  }
  function canvas(w, h){
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }
  function wrapTex(cv, srgb){
    const t = new THREE.CanvasTexture(cv);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = ANISO;
    if (srgb) t.encoding = THREE.sRGBEncoding;
    t.needsUpdate = true;
    return t;
  }
  /* tangent-space normal from a height field. Sobel-ish central differences;
     the wrap is what keeps the tile seamless under normal mapping. */
  function normalFromField(f, w, h, strength){
    const cv = canvas(w, h), g = cv.getContext('2d');
    const img = g.createImageData(w, h), d = img.data;
    const at = (x, y) => f[(((y % h) + h) % h) * w + (((x % w) + w) % w)];
    for (let y = 0; y < h; y++){
      for (let x = 0; x < w; x++){
        const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
        const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
        let nx = -dx, ny = -dy, nz = 1;
        const l = Math.hypot(nx, ny, nz);
        nx /= l; ny /= l; nz /= l;
        const i = (y * w + x) * 4;
        d[i] = (nx * 0.5 + 0.5) * 255;
        d[i + 1] = (ny * 0.5 + 0.5) * 255;
        d[i + 2] = (nz * 0.5 + 0.5) * 255;
        d[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    return cv;
  }
  function paint(w, h, cb){
    const cv = canvas(w, h), g = cv.getContext('2d');
    cb(g, w, h, cv);
    return cv;
  }
  /* grey field -> RGBA canvas through a colour ramp (used for roughness / masks) */
  function greyCanvas(f, w, h){
    const cv = canvas(w, h), g = cv.getContext('2d');
    const img = g.createImageData(w, h), d = img.data;
    for (let i = 0; i < w * h; i++){
      const v = Math.max(0, Math.min(255, f[i] * 255)) | 0;
      d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v;
      d[i * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return cv;
  }

  /* ---------- helpers ---------- */
  const rnd = rng(1337);
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
  function smoothstep(e0, e1, v){ const t = clamp01((v - e0) / (e1 - e0)); return t * t * (3 - 2 * t); }

  /* ============================================================
     ROCK / BASALT — the shared stone of the whole archipelago.
     Height: plate seams (worley) + strata + grit + micro pitting.
     ============================================================ */
  function basalt(opts){
    opts = opts || {};
    const S = opts.size || 512;
    const seed = opts.seed || 7;
    const hi = opts.hi || [0.39, 0.36, 0.35];
    const lo = opts.lo || [0.075, 0.075, 0.085];
    const ember = opts.ember || [1.0, 0.26, 0.05];

    const plate = field(S, S, (u, v) => {
      const x = u * 5, y = v * 5;
      const [f1, f2] = pworley(x, y, 5, seed);
      const seam = smoothstep(0.0, 0.16, f2 - f1);        // 0 on the seam
      const n = pfbm(u * 9, v * 9, 9, 9, 4, seed + 3);
      return seam * 0.72 + n * 0.28;
    });
    const strata = field(S, S, (u, v) => {
      const band = Math.sin((v * 22 + pfbm(u * 4, v * 4, 4, 4, 3, seed + 11) * 3.2) * Math.PI) * 0.5 + 0.5;
      return band;
    });
    const grit = field(S, S, (u, v) => pfbm(u * 64, v * 64, 64, 64, 3, seed + 21));
    const pit = field(S, S, (u, v) => {
      const [f1] = pworley(u * 34, v * 34, 34, seed + 41);
      return smoothstep(0.26, 0.0, f1);                    // small craters
    });

    const H = new Float32Array(S * S);
    for (let i = 0; i < H.length; i++){
      H[i] = clamp01(plate[i] * 0.58 + strata[i] * 0.16 + grit[i] * 0.22 - pit[i] * 0.20);
    }

    /* albedo: tint by height, add mineral speckle and a warm dust film in the cracks */
    const cv = canvas(S, S), g = cv.getContext('2d');
    const img = g.createImageData(S, S), d = img.data;
    for (let i = 0; i < S * S; i++){
      const hgt = H[i];
      const t = smoothstep(0.18, 0.92, hgt);
      let r = lerp(lo[0], hi[0], t), gg = lerp(lo[1], hi[1], t), b = lerp(lo[2], hi[2], t);
      const sp = hash2i(i % S, (i / S) | 0, seed + 99);
      const spark = sp > 0.965 ? 0.22 : 0;
      r += spark; gg += spark; b += spark * 0.85;
      const crack = 1 - smoothstep(0.06, 0.34, plate[i]);
      r = lerp(r, r * 1.5 + ember[0] * 0.06, crack * 0.5);
      gg = lerp(gg, gg * 1.2 + ember[1] * 0.03, crack * 0.5);
      b = lerp(b, b * 1.1 + ember[2] * 0.02, crack * 0.5);
      d[i * 4] = clamp01(r) * 255; d[i * 4 + 1] = clamp01(gg) * 255; d[i * 4 + 2] = clamp01(b) * 255; d[i * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);

    /* roughness: seams are rougher, polished plate faces slightly less */
    const R = new Float32Array(S * S);
    for (let i = 0; i < R.length; i++){
      const crack = 1 - smoothstep(0.06, 0.34, plate[i]);
      R[i] = clamp01(0.86 + grit[i] * 0.12 - crack * 0.10);
    }

    return {
      map: wrapTex(cv, true),
      normalMap: wrapTex(normalFromField(H, S, S, opts.normalStrength || 2.6), false),
      roughnessMap: wrapTex(greyCanvas(R, S, S), false)
    };
  }

  /* ============================================================
     METAL — brushed steel with grime, used on pillars, chains, cages.
     ============================================================ */
  function metal(opts){
    opts = opts || {};
    const S = opts.size || 512, seed = opts.seed || 21;
    const base = opts.base || [0.20, 0.205, 0.225];
    const brush = field(S, S, (u, v) => {
      /* anisotropic: long streaks along X, tight noise across Y */
      return pfbm(u * 3, v * 200, 3, 200, 3, seed) * 0.7 + pfbm(u * 40, v * 40, 40, 40, 2, seed + 9) * 0.3;
    });
    const grime = field(S, S, (u, v) => {
      const n = pfbm(u * 6, v * 6, 6, 6, 4, seed + 31);
      return smoothstep(0.35, 0.8, n);
    });
    const scratch = field(S, S, (u, v) => {
      const a = Math.sin((u * 34 + v * 2) * Math.PI * 2 + pfbm(u * 8, v * 8, 8, 8, 2, seed + 51) * 8);
      return smoothstep(0.86, 1.0, a);
    });
    const H = new Float32Array(S * S);
    for (let i = 0; i < S * S; i++) H[i] = clamp01(brush[i] * 0.7 + grime[i] * 0.2 - scratch[i] * 0.18);

    const cv = canvas(S, S), g = cv.getContext('2d');
    const img = g.createImageData(S, S), d = img.data;
    for (let i = 0; i < S * S; i++){
      const b = brush[i], gr = grime[i], sc = scratch[i];
      let r = base[0] * (0.55 + b * 0.85), gg = base[1] * (0.55 + b * 0.85), bb = base[2] * (0.58 + b * 0.9);
      r = lerp(r, r * 1.9, sc * 0.6); gg = lerp(gg, gg * 1.9, sc * 0.6); bb = lerp(bb, bb * 1.9, sc * 0.6);
      r = lerp(r, r * 0.35, gr * 0.7); gg = lerp(gg, gg * 0.35, gr * 0.7); bb = lerp(bb, bb * 0.38, gr * 0.7);
      d[i * 4] = clamp01(r) * 255; d[i * 4 + 1] = clamp01(gg) * 255; d[i * 4 + 2] = clamp01(bb) * 255; d[i * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);

    const R = new Float32Array(S * S);
    for (let i = 0; i < S * S; i++) R[i] = clamp01(0.30 + grime[i] * 0.55 - scratch[i] * 0.16);
    return {
      map: wrapTex(cv, true),
      normalMap: wrapTex(normalFromField(H, S, S, 1.5), false),
      roughnessMap: wrapTex(greyCanvas(R, S, S), false)
    };
  }

  /* ============================================================
     SCREEN — a live terminal/monitor face. Emissive, glyphs, scanlines.
     ============================================================ */
  function screen(accentRGB, glyph, opts){
    opts = opts || {};
    const W = 256, H = 256;
    return wrapTex(paint(W, H, (g, w, h) => {
      const r = rng(opts.seed || 5);
      g.fillStyle = '#01030a'; g.fillRect(0, 0, w, h);
      /* backlight bleed from the centre */
      const grd = g.createRadialGradient(w / 2, h * 0.42, 4, w / 2, h * 0.42, w * 0.9);
      grd.addColorStop(0, `rgba(${accentRGB},.20)`);
      grd.addColorStop(1, `rgba(${accentRGB},0)`);
      g.fillStyle = grd; g.fillRect(0, 0, w, h);
      /* static */
      for (let i = 0; i < 900; i++){
        g.fillStyle = `rgba(${accentRGB},${(r() * 0.5).toFixed(3)})`;
        g.fillRect(r() * w, r() * h, 1.5, 1.5);
      }
      /* the glyph: an eye / face / bar, kept small so the screen still reads as a screen */
      g.globalAlpha = 0.7;
      g.fillStyle = glyph || `rgb(${accentRGB})`;
      g.beginPath(); g.ellipse(w / 2, h * 0.36, 26, 15, 0, 0, 7); g.fill();
      g.globalAlpha = 1;
      g.fillStyle = '#000';
      g.beginPath(); g.arc(w / 2, h * 0.36, 7, 0, 7); g.fill();
      g.fillStyle = `rgba(${accentRGB},.75)`;
      g.beginPath(); g.arc(w / 2, h * 0.36, 2.4, 0, 7); g.fill();
      /* a data column */
      g.globalAlpha = .5; g.font = '9px monospace'; g.fillStyle = `rgb(${accentRGB})`;
      for (let y = h * 0.58; y < h - 8; y += 11){
        const s = '█▓░▚▞';
        g.fillText(s[(r() * 5) | 0] + ' ' + ((r() * 0xffff) | 0).toString(16).padStart(4, '0'), 9, y);
      }
      g.globalAlpha = 1;
      /* scanlines + vignette */
      g.fillStyle = 'rgba(0,0,0,.28)';
      for (let y = 0; y < h; y += 3) g.fillRect(0, y, w, 1);
      const vg = g.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.75);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.65)');
      g.fillStyle = vg; g.fillRect(0, 0, w, h);
    }), true);
  }

  /* ============================================================
     BARCODE / PRICE PLATE
     ============================================================ */
  function barcode(accentRGB, label){
    const W = 128, H = 256;
    return wrapTex(paint(W, H, (g, w, h) => {
      const r = rng(88);
      g.fillStyle = '#05070a'; g.fillRect(0, 0, w, h);
      g.fillStyle = `rgb(${accentRGB})`;
      let x = 8;
      while (x < w - 8){
        const bw = 1 + r() * 4;
        if (r() > 0.28) g.fillRect(x, 16, bw, h - 62);
        x += bw + 1.5 + r() * 2.5;
      }
      g.font = 'bold 11px monospace'; g.fillText(label || 'LOTE-X', 8, h - 30);
      g.font = '8px monospace'; g.globalAlpha = .6;
      g.fillText('0 ' + (((r() * 1e9) | 0) + '').slice(0, 9), 8, h - 16);
      g.globalAlpha = 1;
      g.strokeStyle = `rgba(${accentRGB},.35)`; g.lineWidth = 2;
      g.strokeRect(3, 3, w - 6, h - 6);
    }), true);
  }

  /* ============================================================
     CLOTH — awnings, tarps, banners. Weave + stripes.
     ============================================================ */
  function cloth(accentRGB, opts){
    opts = opts || {};
    const S = 256, seed = opts.seed || 3;
    const weave = field(S, S, (u, v) => {
      const a = Math.sin(u * 96 * Math.PI * 2) * 0.5 + 0.5;
      const b = Math.sin(v * 96 * Math.PI * 2) * 0.5 + 0.5;
      return (a * b) * 0.6 + pfbm(u * 8, v * 8, 8, 8, 3, seed) * 0.4;
    });
    const stain = field(S, S, (u, v) => smoothstep(0.55, 0.9, pfbm(u * 4, v * 4, 4, 4, 4, seed + 17)));
    const cv = canvas(S, S), g = cv.getContext('2d');
    const img = g.createImageData(S, S), d = img.data;
    const stripes = opts.stripes || 8;
    for (let y = 0; y < S; y++){
      for (let x = 0; x < S; x++){
        const i = y * S + x;
        const band = (Math.floor(x / S * stripes) % 2) === 0;
        const wv = weave[i], st = stain[i];
        let r, gg, bb;
        if (band){ r = 0.035; gg = 0.05; bb = 0.045; }
        else { r = accentRGB[0] / 255 * 0.6; gg = accentRGB[1] / 255 * 0.6; bb = accentRGB[2] / 255 * 0.6; }
        const k = 0.55 + wv * 0.9;
        r *= k; gg *= k; bb *= k;
        r *= 1 - st * 0.5; gg *= 1 - st * 0.55; bb *= 1 - st * 0.5;
        d[i * 4] = clamp01(r) * 255; d[i * 4 + 1] = clamp01(gg) * 255; d[i * 4 + 2] = clamp01(bb) * 255; d[i * 4 + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    const R = new Float32Array(S * S);
    for (let i = 0; i < S * S; i++) R[i] = 0.88 + weave[i] * 0.1;
    return { map: wrapTex(cv, true), normalMap: wrapTex(normalFromField(weave, S, S, 0.9), false),
             roughnessMap: wrapTex(greyCanvas(R, S, S), false) };
  }

  /* ============================================================
     LEATHER / STITCHED SKIN — circuit 2's floor.
     ============================================================ */
  function leather(opts){
    opts = opts || {};
    const S = 512, seed = opts.seed || 13;
    const pores = field(S, S, (u, v) => pfbm(u * 46, v * 46, 46, 46, 3, seed));
    const wrinkle = field(S, S, (u, v) => {
      const n = pfbm(u * 7, v * 7, 7, 7, 4, seed + 5);
      return Math.abs(n - 0.5);
    });
    const seams = field(S, S, (u, v) => {
      const gx = Math.abs(((u * 4) % 1) - 0.5), gy = Math.abs(((v * 4) % 1) - 0.5);
      const edge = Math.min(gx, gy);
      return 1 - smoothstep(0.018, 0.045, edge);
    });
    const H = new Float32Array(S * S);
    for (let i = 0; i < S * S; i++) H[i] = clamp01(pores[i] * 0.4 + wrinkle[i] * 1.2 - seams[i] * 0.55);
    const cv = canvas(S, S), g = cv.getContext('2d');
    const img = g.createImageData(S, S), d = img.data;
    for (let i = 0; i < S * S; i++){
      const t = pores[i], w = wrinkle[i], s = seams[i];
      let r = 0.16 + t * 0.16, gg = 0.085 + t * 0.09, bb = 0.075 + t * 0.08;
      r *= 1 - w * 0.5; gg *= 1 - w * 0.55; bb *= 1 - w * 0.55;
      /* stitch thread catches the light */
      r = lerp(r, 0.34, s * 0.7); gg = lerp(gg, 0.26, s * 0.7); bb = lerp(bb, 0.22, s * 0.7);
      d[i * 4] = clamp01(r) * 255; d[i * 4 + 1] = clamp01(gg) * 255; d[i * 4 + 2] = clamp01(bb) * 255; d[i * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    const R = new Float32Array(S * S);
    for (let i = 0; i < S * S; i++) R[i] = clamp01(0.62 + pores[i] * 0.2 + seams[i] * 0.12);
    return { map: wrapTex(cv, true), normalMap: wrapTex(normalFromField(H, S, S, 2.2), false),
             roughnessMap: wrapTex(greyCanvas(R, S, S), false) };
  }

  /* ============================================================
     MIRRORED SMOKE — circuit 3 slabs.
     ============================================================ */
  function smokedGlass(){
    const S = 256;
    const cv = canvas(S, S), g = cv.getContext('2d');
    const base = g.createLinearGradient(0, 0, S, S);
    base.addColorStop(0, '#1a1426'); base.addColorStop(0.42, '#0c0913');
    base.addColorStop(0.58, '#221a33'); base.addColorStop(1, '#08060d');
    g.fillStyle = base; g.fillRect(0, 0, S, S);
    const r = rng(4);
    /* smudges + a reflected vertical light strip */
    for (let i = 0; i < 40; i++){
      const x = r() * S, y = r() * S, rad = 20 + r() * 70;
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, `rgba(190,170,255,${0.03 + r() * 0.05})`);
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    g.globalAlpha = .2; g.fillStyle = '#d9ccff';
    g.fillRect(S * 0.62, 0, S * 0.05, S);
    g.globalAlpha = 1;
    return wrapTex(cv, true);
  }

  /* ============================================================
     SOFT DOT — sprite for embers / glows.
     ============================================================ */
  function softDot(inner, mid){
    const cv = paint(64, 64, (g) => {
      const gr = g.createRadialGradient(32, 32, 1, 32, 32, 31);
      gr.addColorStop(0, inner || 'rgba(255,236,200,1)');
      gr.addColorStop(0.32, mid || 'rgba(255,140,50,.65)');
      gr.addColorStop(1, 'rgba(255,60,0,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    });
    return wrapTex(cv, true);
  }

  /* ============================================================
     ENVIRONMENT PROBE — an equirectangular painting of the cavern.
     Metals with metalness need something to reflect; without it they read as
     flat plastic. This is cheap (one 1024×512 canvas) and does the heavy
     lifting for every chrome/steel surface in the scene.
     ============================================================ */
  function envEquirect(){
    const W = 1024, H = 512;
    const cv = paint(W, H, (g, w, h) => {
      const sky = g.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#05040a');
      sky.addColorStop(0.42, '#0a0710');
      sky.addColorStop(0.56, '#1a0a08');
      sky.addColorStop(0.74, '#4a1505');
      sky.addColorStop(0.88, '#8a2d02');
      sky.addColorStop(1, '#3a0d02');
      g.fillStyle = sky; g.fillRect(0, 0, w, h);
      const r = rng(9);
      /* a handful of cold rim lights: distant monitors on the cavern wall */
      const tints = ['#2ec8ff', '#b57bff', '#ff6a2a', '#3dff9a', '#a8dcff'];
      for (let i = 0; i < 26; i++){
        const x = r() * w, y = h * (0.22 + r() * 0.3);
        const rad = 40 + r() * 120;
        const t = tints[(r() * tints.length) | 0];
        const gr = g.createRadialGradient(x, y, 0, x, y, rad);
        gr.addColorStop(0, t + 'aa'); gr.addColorStop(0.4, t + '33'); gr.addColorStop(1, t + '00');
        g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
      }
      /* lava glow along the horizon line */
      for (let i = 0; i < 60; i++){
        const x = r() * w, rad = 60 + r() * 160;
        const gr = g.createRadialGradient(x, h * 0.82, 0, x, h * 0.82, rad);
        gr.addColorStop(0, 'rgba(255,110,20,.55)');
        gr.addColorStop(0.5, 'rgba(255,60,0,.16)');
        gr.addColorStop(1, 'rgba(255,40,0,0)');
        g.fillStyle = gr; g.fillRect(x - rad, h * 0.82 - rad, rad * 2, rad * 2);
      }
      /* ceiling specks */
      for (let i = 0; i < 500; i++){
        g.fillStyle = `rgba(255,180,120,${0.1 + r() * 0.5})`;
        g.fillRect(r() * w, r() * h * 0.36, 1.4, 1.4);
      }
    });
    const t = new THREE.CanvasTexture(cv);
    t.mapping = THREE.EquirectangularReflectionMapping;
    t.encoding = THREE.sRGBEncoding;
    t.needsUpdate = true;
    return t;
  }

  /* ============================================================
     LAVA CRACK SHEET — emissive map for the Core spire.
     ============================================================ */
  function lavaCracks(seed){
    const S = 512, s = seed || 31;
    const cv = canvas(S, S), g = cv.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, S, S);
    const f = field(S, S, (u, v) => Math.abs(pfbm(u * 6, v * 6, 6, 6, 4, s) - 0.5));
    const img = g.createImageData(S, S), d = img.data;
    for (let i = 0; i < S * S; i++){
      const v = 1 - smoothstep(0.0, 0.028, f[i]);
      const glow = Math.pow(v, 1.6);
      d[i * 4] = 255 * glow;
      d[i * 4 + 1] = 130 * glow * glow;
      d[i * 4 + 2] = 40 * glow * glow * glow;
      d[i * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return wrapTex(cv, true);
  }

  /* ============================================================
     TINY LABEL / PLAQUE — etched metal plates for the pedestals.
     ============================================================ */
  function plaque(){
    const W = 256, H = 128;
    return wrapTex(paint(W, H, (g, w, h) => {
      g.fillStyle = '#0a0806'; g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(255,180,120,.35)'; g.lineWidth = 2;
      g.strokeRect(8, 8, w - 16, h - 16);
      g.strokeStyle = 'rgba(255,180,120,.14)'; g.lineWidth = 1;
      g.strokeRect(14, 14, w - 28, h - 28);
      g.fillStyle = 'rgba(255,200,150,.55)';
      g.font = 'bold 15px monospace'; g.fillText('CIRCUITO', 24, 52);
      g.font = '10px monospace'; g.fillStyle = 'rgba(255,140,100,.4)';
      g.fillText('EXPEDIENTE · SUBSUELO DIGITAL', 24, 74);
      g.fillText('NO ABRIR SIN CONDENA', 24, 92);
    }), true);
  }

  /* ---------- public API ---------- */
  const memo = (key, fn) => {
    if (cache.has(key)) return cache.get(key);
    const v = fn(); cache.set(key, v); return v;
  };

  return {
    rng, pnoise, pfbm, pworley, field, canvas, paint, normalFromField, greyCanvas,
    wrapTex, clamp01, smoothstep, lerp, hash2i,
    basalt: o => memo('basalt' + JSON.stringify(o || {}), () => basalt(o)),
    metal:  o => memo('metal' + JSON.stringify(o || {}), () => metal(o)),
    leather:o => memo('leather' + JSON.stringify(o || {}), () => leather(o)),
    cloth:  (rgb, o) => memo('cloth' + rgb + JSON.stringify(o || {}), () => cloth(rgb, o)),
    screen: (rgb, glyph, o) => memo('screen' + rgb + (o && o.seed), () => screen(rgb, glyph, o)),
    barcode:(rgb, label) => memo('bc' + rgb + label, () => barcode(rgb, label)),
    smokedGlass: () => memo('glass', smokedGlass),
    softDot: (a, b) => memo('dot' + a + b, () => softDot(a, b)),
    envEquirect: () => memo('env', envEquirect),
    lavaCracks: s => memo('lc' + s, () => lavaCracks(s)),
    plaque: () => memo('plaque', plaque),
    setAnisotropy(n){
      ANISO = Math.max(1, n);
      cache.forEach(value => {
        const textures = value.isTexture ? [value] : Object.values(value);
        textures.forEach(texture => {
          if (texture && texture.isTexture){ texture.anisotropy = ANISO; texture.needsUpdate = true; }
        });
      });
    }
  };
})();
