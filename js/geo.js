/* ============================================================
   geo.js — geometry helpers.
   The islands are generated, not imported: every rock, column, chain and
   cable in the scene comes out of these functions. Displacement is driven by
   a seeded 3D value noise so shapes are irregular but reproducible.
   ============================================================ */
window.APP = window.APP || {};

APP.GEO = (function(){
  'use strict';

  /* ---------- 3D value noise (periodic-free, seeded) ---------- */
  function h3(x, y, z, s){
    let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^
            Math.imul(z | 0, 2147483647) ^ Math.imul(s | 0, 1442695041);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  const sm = t => t * t * (3 - 2 * t);
  function noise3(x, y, z, s){
    const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
    const fx = sm(x - ix), fy = sm(y - iy), fz = sm(z - iz);
    const c = (dx, dy, dz) => h3(ix + dx, iy + dy, iz + dz, s);
    const x00 = c(0,0,0) + (c(1,0,0) - c(0,0,0)) * fx;
    const x10 = c(0,1,0) + (c(1,1,0) - c(0,1,0)) * fx;
    const x01 = c(0,0,1) + (c(1,0,1) - c(0,0,1)) * fx;
    const x11 = c(0,1,1) + (c(1,1,1) - c(0,1,1)) * fx;
    const y0 = x00 + (x10 - x00) * fy, y1 = x01 + (x11 - x01) * fy;
    return y0 + (y1 - y0) * fz;
  }
  function fbm3(x, y, z, oct, s){
    let v = 0, a = 0.5, f = 1, n = 0;
    for (let i = 0; i < oct; i++){
      v += a * noise3(x * f, y * f, z * f, s + i * 17);
      n += a; a *= 0.5; f *= 2.03;
    }
    return v / n;
  }

  /* ---------- displacement ----------
     Push every vertex along its normal by fbm, then optionally squash Y so the
     bottom flattens (islands must sit on a plateau, not a lens). */
  function displace(geo, amp, freq, seed, opts){
    opts = opts || {};
    geo.computeVertexNormals();
    const pos = geo.attributes.position, nrm = geo.attributes.normal;
    const v = new THREE.Vector3(), n = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++){
      v.fromBufferAttribute(pos, i);
      n.fromBufferAttribute(nrm, i);
      let d = fbm3(v.x * freq, v.y * freq, v.z * freq, opts.oct || 4, seed) - 0.5;
      /* abs() of a signed field gives creases — reads as fractured stone */
      if (opts.crease) d = -Math.abs(d) * opts.crease;
      v.addScaledVector(n, d * amp);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    geo.computeBoundingSphere();
    return geo;
  }

  /* ---------- rocky disc ----------
     The footprint of every island: a low cylinder whose sides are chewed by
     noise, with a slightly domed top so props sit on an uneven plateau. */
  function rockyDisc(R, height, seed, seg){
    const g = new THREE.CylinderGeometry(R, R * 0.74, height, seg || 56, 6, false);
    const pos = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++){
      v.fromBufferAttribute(pos, i);
      const yN = (v.y + height / 2) / height;          // 0 bottom .. 1 top
      const ang = Math.atan2(v.z, v.x);
      const radial = Math.hypot(v.x, v.z);
      if (radial < R * 0.98){
        /* top face: gentle undulation so it is not a mirror-flat disc */
        if (yN > 0.92){
          const bump = (fbm3(v.x * 0.22, 0, v.z * 0.22, 3, seed) - 0.5) * 1.1;
          pos.setY(i, v.y + bump);
        }
        continue;
      }
      /* side wall: noise in angle+height, stronger at the waist */
      const band = Math.sin(yN * Math.PI);
      const d = (fbm3(Math.cos(ang) * 2.2, yN * 3.4, Math.sin(ang) * 2.2, 4, seed) - 0.5);
      const k = 1 + d * 0.30 * band;
      pos.setX(i, v.x * k);
      pos.setZ(i, v.z * k);
      if (band > 0.2) pos.setY(i, v.y + d * 0.9);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }

  /* ---------- stalactite keel under an island ---------- */
  function keel(R, depth, seed){
    const g = new THREE.ConeGeometry(R * 0.82, depth, 12, 7, true);
    g.rotateX(Math.PI);
    displace(g, depth * 0.13, 0.16, seed, { crease: 1.4, oct: 4 });
    const pos = g.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++){
      v.fromBufferAttribute(pos, i);
      pos.setY(i, v.y - depth * 0.5);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }

  /* ---------- prismatic basalt column ----------
     A tapered hexagonal shaft with a jagged top, used in clusters around the
     rims. Cheap (one lathe-ish extrude) but the silhouette does the work. */
  function basaltColumn(topR, botR, h, seed, sides){
    const n = sides || 6;
    const g = new THREE.CylinderGeometry(topR, botR, h, n, 4, false);
    const pos = g.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++){
      v.fromBufferAttribute(pos, i);
      const yN = (v.y + h / 2) / h;
      const ang = Math.atan2(v.z, v.x);
      const d = (fbm3(Math.cos(ang) * 3, yN * 4, Math.sin(ang) * 3, 3, seed) - 0.5);
      const k = 1 + d * 0.26;
      pos.setX(i, v.x * k); pos.setZ(i, v.z * k);
      if (yN > 0.85) pos.setY(i, v.y + d * h * 0.14);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }

  /* ---------- chain link path ----------
     Returns a group of torus links laid along a curve. Used for the hanging
     cages and the bound figures. */
  function chain(curve, links, linkR, tubeR, mat){
    const grp = new THREE.Group();
    const geo = new THREE.TorusGeometry(linkR, tubeR, 5, 10);
    for (let i = 0; i < links; i++){
      const t = i / links;
      const m = new THREE.Mesh(geo, mat);
      m.position.copy(curve.getPoint(t));
      m.rotation.set(i % 2 ? Math.PI / 2 : 0, t * Math.PI * 2, i % 2 ? Math.PI / 2 : 0);
      grp.add(m);
    }
    return grp;
  }

  /* ---------- sagging cable ----------
     Quadratic droop between two points; used for the fiber spans and the
     rigging above the market. */
  function cable(a, b, sag, radial, mat, seg){
    const mid = a.clone().add(b).multiplyScalar(0.5);
    mid.y -= sag;
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, seg || 20, radial, 5, false), mat);
    return { mesh: m, curve };
  }

  /* ---------- instanced scatter ----------
     One InstancedMesh per cluster keeps draw calls down while still giving
     hundreds of pebbles/rubble pieces. */
  function scatter(parent, geo, mat, count, radius, seed, opts){
    opts = opts || {};
    const inst = new THREE.InstancedMesh(geo, mat, count);
    const rnd = APP.TEX.rng(seed);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), p = new THREE.Vector3();
    const yScale = opts.yScale || 1;
    for (let i = 0; i < count; i++){
      const a = rnd() * Math.PI * 2;
      const r = Math.pow(rnd(), opts.radialPow || 0.65) * radius;
      const size = (opts.min || 0.15) + rnd() * ((opts.max || 0.7) - (opts.min || 0.15));
      p.set(Math.cos(a) * r, (opts.y || 0) + (opts.yJitter ? (rnd() - 0.5) * opts.yJitter : 0), Math.sin(a) * r);
      if (opts.ring){ p.set(Math.cos(a) * opts.ring, p.y, Math.sin(a) * opts.ring); }
      e.set(rnd() * 6.28, rnd() * 6.28, rnd() * 6.28);
      q.setFromEuler(e);
      s.set(size, size * yScale, size);
      m.compose(p, q, s);
      inst.setMatrixAt(i, m);
    }
    inst.instanceMatrix.needsUpdate = true;
    inst.castShadow = !!opts.shadow;
    inst.receiveShadow = true;
    parent.add(inst);
    return inst;
  }

  /* ---------- capsule (r128 has no CapsuleGeometry) ---------- */
  function capsule(r, len, seg){
    const g = new THREE.CylinderGeometry(r, r, len, seg || 10, 1, false);
    const top = new THREE.SphereGeometry(r, seg || 10, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const bot = new THREE.SphereGeometry(r, seg || 10, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    top.translate(0, len / 2, 0); bot.translate(0, -len / 2, 0);
    return merge([g, top, bot]);
  }

  /* ---------- minimal geometry merge (position/normal/uv) ---------- */
  function merge(geos){
    const out = new THREE.BufferGeometry();
    const pos = [], nrm = [], uv = [], idx = [];
    let offset = 0;
    geos.forEach(g => {
      const p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv;
      for (let i = 0; i < p.count; i++){
        pos.push(p.getX(i), p.getY(i), p.getZ(i));
        nrm.push(n ? n.getX(i) : 0, n ? n.getY(i) : 1, n ? n.getZ(i) : 0);
        uv.push(u ? u.getX(i) : 0, u ? u.getY(i) : 0);
      }
      if (g.index){
        for (let i = 0; i < g.index.count; i++) idx.push(g.index.getX(i) + offset);
      } else {
        for (let i = 0; i < p.count; i++) idx.push(i + offset);
      }
      offset += p.count;
    });
    out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    out.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
    out.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    out.setIndex(idx);
    out.computeBoundingSphere();
    return out;
  }

  /* ---------- rock cluster ---------- */
  function rockCluster(count, R, seed, mat, opts){
    opts = opts || {};
    const grp = new THREE.Group();
    const rnd = APP.TEX.rng(seed);
    for (let i = 0; i < count; i++){
      const a = rnd() * Math.PI * 2;
      const r = R * (0.3 + rnd() * 0.75);
      const size = (opts.min || 0.4) + rnd() * ((opts.max || 1.6) - (opts.min || 0.4));
      const g = new THREE.DodecahedronGeometry(size, 0);
      displace(g, size * 0.55, 1.1, seed + i, { oct: 3 });
      const m = new THREE.Mesh(g, mat);
      m.position.set(Math.cos(a) * r, (opts.y || 0) + rnd() * size * 0.4, Math.sin(a) * r);
      m.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
      m.castShadow = true; m.receiveShadow = true;
      grp.add(m);
    }
    return grp;
  }

  return { noise3, fbm3, displace, rockyDisc, keel, basaltColumn, chain, cable, scatter,
           capsule, merge, rockCluster, rng: () => APP.TEX.rng(1) };
})();
