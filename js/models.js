/*
 * models.js — six authored dioramas, built entirely from local geometry.
 * Static details are baked by material; moving assemblies keep local pivots.
 * Dimensions are in world units. Each island's walkable surface is y = 0.45.
 */
window.APP = window.APP || {};

APP.MODELS = (function(){
  'use strict';

  const TAU = Math.PI * 2;
  const geometryCache = new Map();
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const smooth = (value, start, end) => THREE.MathUtils.smoothstep(value, start, end);
  let M;

  function cached(key, make){
    if (!geometryCache.has(key)) geometryCache.set(key, make());
    return geometryCache.get(key);
  }

  function group(parent, name, x = 0, y = 0, z = 0){
    const g = new THREE.Group();
    g.name = name;
    g.position.set(x, y, z);
    if (parent) parent.add(g);
    return g;
  }

  function mesh(parent, geometry, material, x = 0, y = 0, z = 0){
    const m = new THREE.Mesh(geometry, material);
    m.position.set(x, y, z);
    m.castShadow = !material.transparent && !material.isMeshBasicMaterial;
    m.receiveShadow = !material.transparent;
    parent.add(m);
    return m;
  }

  // Real chamfers catch a narrow highlight instead of a razor-sharp box edge.
  function bevelBox(w, h, d, radius){
    const r = Math.min(radius || 0.065, w / 5, h / 5, d / 5);
    return cached(`box:${w}:${h}:${d}:${r}`, () => {
      const shape = new THREE.Shape();
      const x = w / 2 - r, y = h / 2 - r;
      shape.moveTo(-x, -y); shape.lineTo(x, -y);
      shape.lineTo(x, y); shape.lineTo(-x, y); closePath();
      function closePath(){ shape.closePath(); }
      const g = new THREE.ExtrudeGeometry(shape, {
        depth: d - 2 * r, steps: 1, bevelEnabled: true,
        bevelThickness: r, bevelSize: r, bevelSegments: 1, curveSegments: 1
      });
      g.translate(0, 0, -d / 2 + r);
      return g;
    });
  }

  function box(parent, w, h, d, mat, x = 0, y = 0, z = 0, rounded = true){
    const geo = rounded ? bevelBox(w, h, d) : cached(`flat:${w}:${h}:${d}`, () => new THREE.BoxGeometry(w, h, d));
    return mesh(parent, geo, mat, x, y, z);
  }

  function cylinder(parent, r1, r2, h, mat, x = 0, y = 0, z = 0, sides = 16){
    const geo = cached(`cyl:${r1}:${r2}:${h}:${sides}`, () => new THREE.CylinderGeometry(r1, r2, h, sides));
    return mesh(parent, geo, mat, x, y, z);
  }

  function sphere(parent, r, mat, x = 0, y = 0, z = 0, detail = 20){
    return mesh(parent, cached(`sphere:${r}:${detail}`, () => new THREE.SphereGeometry(r, detail, Math.max(8, detail / 2))), mat, x, y, z);
  }

  function ring(parent, radius, thickness, mat, x = 0, y = 0, z = 0, horizontal = false, arc = TAU){
    const geo = cached(`ring:${radius}:${thickness}:${arc}`, () => new THREE.TorusGeometry(radius, thickness, 6, 64, arc));
    const m = mesh(parent, geo, mat, x, y, z);
    if (horizontal) m.rotation.x = Math.PI / 2;
    return m;
  }

  function rod(parent, a, b, radius, mat){
    const delta = b.clone().sub(a);
    const m = cylinder(parent, radius, radius, delta.length(), mat);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(V(0, 1, 0), delta.normalize());
    return m;
  }

  function tube(parent, points, radius, mat, segments = 32){
    const curve = new THREE.CatmullRomCurve3(points);
    const m = mesh(parent, new THREE.TubeGeometry(curve, segments, radius, 6, false), mat);
    return { mesh: m, curve };
  }

  function glow(color, strength = 1.5){
    return new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(strength), toneMapped: false });
  }

  function createMaterials(size){
    const T = APP.TEX;
    const stone = T.basalt({ size, seed: 19, normalStrength: 12 });
    const steel = T.metal({ size, seed: 29, base: [0.38, 0.40, 0.44] });
    Object.values(stone).forEach(t => t.repeat.set(3, 2));
    Object.values(steel).forEach(t => t.repeat.set(2, 2));
    M = {
      stone: new THREE.MeshStandardMaterial({ ...stone, color: 0xbec6d2, roughness: 0.94, metalness: 0.10 }),
      metal: new THREE.MeshStandardMaterial({ ...steel, color: 0x9da6b4, roughness: 0.67, metalness: 0.82 }),
      brass: new THREE.MeshStandardMaterial({ ...steel, color: 0xb5905c, roughness: 0.52, metalness: 0.85 }),
      dark: new THREE.MeshStandardMaterial({ color: 0x121721, roughness: 0.76, metalness: 0.40 }),
      porcelain: new THREE.MeshStandardMaterial({ color: 0xc6cbc6, roughness: 0.52, metalness: 0.12 }),
      blood: new THREE.MeshPhysicalMaterial({ color: 0x7a0309, emissive: 0x2b0003, roughness: 0.15, metalness: 0.08, clearcoat: 1, clearcoatRoughness: 0.06 }),
      bloodGlow: glow(0xff1828, 1.55),
      mirror: new THREE.MeshPhysicalMaterial({ map: T.smokedGlass(), color: 0xbbafd5, metalness: 0.98, roughness: 0.17, clearcoat: 1, clearcoatRoughness: 0.09, envMapIntensity: 2.1 }),
      glass: new THREE.MeshPhysicalMaterial({ color: 0x739aa9, transparent: true, opacity: 0.15, metalness: 0.45, roughness: 0.2, clearcoat: 1, depthWrite: false, side: THREE.DoubleSide }),
      ember: glow(0xff642a, 1.35),
      accents: {}, screens: {},
      cloth: null,
      leather: null
    };
    APP.DATA.CIRCUITS.forEach(c => {
      M.accents[c.id] = glow(c.col, c.id === 0 ? 1.65 : 1.35);
      const color = new THREE.Color(c.col);
      const rgb = [color.r, color.g, color.b].map(n => Math.round(n * 255)).join(',');
      M.screens[c.id] = new THREE.MeshBasicMaterial({ map: T.screen(rgb, null, { seed: c.id + 31 }), color: 0xcbd7df, toneMapped: false });
    });
    return M;
  }

  function tagCharacter(root, node, meta){
    if (!root.userData.characters) root.userData.characters = [];
    const anchor = (node.userData && node.userData.rig && node.userData.rig.head) ? node.userData.rig.head : node;
    root.userData.characters.push({
      node,
      anchor,
      name: meta.name,
      alias: meta.alias || '',
      sinner: meta.sinner || null,
      kind: meta.kind || 'sinner',
      offsetY: meta.offsetY === undefined ? 0.62 : meta.offsetY
    });
  }

  /* Bake only rigid meshes. Animated subtrees retain their own coordinates.
     In particular, never merge the Core's moving iris into the altar. */
  function bake(root){
    root.updateMatrixWorld(true);
    const inverse = root.matrixWorld.clone().invert();
    const buckets = new Map();
    function visit(node){
      if (node !== root && node.userData.dynamic) return;
      if (node.isMesh && !node.isInstancedMesh && !Array.isArray(node.material)){
        const key = node.material.uuid + ':' + node.castShadow;
        if (!buckets.has(key)) buckets.set(key, { mat: node.material, casts: node.castShadow, geos: [], nodes: [] });
        const bucket = buckets.get(key);
        const transform = new THREE.Matrix4().multiplyMatrices(inverse, node.matrixWorld);
        bucket.geos.push(node.geometry.clone().applyMatrix4(transform));
        bucket.nodes.push(node);
      }
      node.children.slice().forEach(visit);
    }
    visit(root);
    buckets.forEach(bucket => {
      const combined = APP.GEO.merge(bucket.geos);
      bucket.geos.forEach(g => g.dispose());
      bucket.nodes.forEach(node => node.parent.remove(node));
      const m = mesh(root, combined, bucket.mat);
      m.name = 'Baked architectural details';
      m.castShadow = bucket.casts;
    });
    return root;
  }

  function pedestal(parent, radius, accent){
    cylinder(parent, radius, radius * 1.06, 0.28, M.metal, 0, 0.58, 0, 48);
    ring(parent, radius * 0.96, 0.035, accent, 0, 0.74, 0, true);
    cylinder(parent, radius * 0.90, radius * 0.94, 0.18, M.dark, 0, 0.78, 0, 48);
  }

  function foundation(parent, radius, seed, accent){
    const random = APP.TEX.rng(seed);
    const profile = [
      [0.08, -10.7], [radius * 0.25, -8.5], [radius * 0.45, -6.3],
      [radius * 0.74, -4.6], [radius * 0.91, -3.4], [radius * 0.88, -2.2],
      [radius, -0.7], [radius * 0.98, 0.25], [radius * 0.7, 0.38], [0.01, 0.38]
    ].map(p => new THREE.Vector2(p[0], p[1]));
    const g = new THREE.LatheGeometry(profile, 56);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++){
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const n = APP.GEO.fbm3(x * 0.31, y * 0.42, z * 0.31, 3, seed) - 0.5;
      const shape = 1 + n * 0.24;
      p.setXYZ(i, x * shape, y + n * (y > 0 ? 0.25 : 1.3), z * shape);
    }
    g.computeVertexNormals();
    mesh(parent, g, M.stone);

    // Columnar joints break the silhouette at three scales, not random lumps.
    for (let i = 0; i < 30; i++){
      const a = i / 30 * TAU;
      const h = 2.8 + random() * 3.8;
      const r = radius * (0.90 + random() * 0.065);
      const shaft = APP.GEO.basaltColumn(0.42 + random() * 0.22, 0.56, h, seed + i, 6);
      const rock = mesh(parent, shaft, M.stone, Math.cos(a) * r, -h / 2 + random() * 0.2, Math.sin(a) * r);
      rock.rotation.z = (random() - 0.5) * 0.18;
    }
    for (let i = 0; i < 7; i++){
      const a = random() * TAU;
      const r = radius * (0.3 + random() * 0.48);
      const h = 3 + random() * 5;
      const shard = mesh(parent, APP.GEO.basaltColumn(0.7, 0.08, h, seed + 70 + i, 5), M.stone, Math.cos(a) * r, -4 - h / 2, Math.sin(a) * r);
      shard.rotation.z = (random() - 0.5) * 0.4;
    }

    // A segmented illuminated rim is an inlay, not a neon outline of the rock.
    for (let i = 0; i < 9; i++){
      const a = i / 9 * TAU;
      const inlay = ring(parent, radius * 0.81, 0.038, accent, 0, 0.46, 0, true, 0.31);
      inlay.rotation.z = a;
      const stud = cylinder(parent, 0.10, 0.14, 0.12, M.brass, Math.sin(a) * radius * 0.85, 0.51, Math.cos(a) * radius * 0.85, 6);
      stud.castShadow = false;
    }
    APP.GEO.scatter(parent, cached('debris', () => new THREE.DodecahedronGeometry(1)), M.stone, 65, radius * 0.96, seed + 321, { min: 0.07, max: 0.35, y: 0.45, yScale: 0.55, ring: radius * 0.92 });
    const plate = box(parent, 2.25, 0.35, 1.1, M.brass, 0, 0.5, radius * 0.88);
    plate.rotation.x = 0.14;
  }

  function monitor(parent, width, height, accent, screenMat, x, y, z){
    const frame = group(parent, 'Chamfered monitor', x, y, z);
    box(frame, width, height, 0.34, M.metal);
    box(frame, width - 0.16, height - 0.16, 0.05, M.dark, 0, 0, 0.19);
    mesh(frame, cached(`screen:${width}:${height}`, () => new THREE.PlaneGeometry(width - 0.29, height - 0.34)), screenMat, 0, 0.035, 0.226);
    box(frame, width * 0.26, 0.035, 0.024, accent, width * 0.23, -height / 2 + 0.07, 0.226, false);
    for (const side of [-1, 1]){
      for (const row of [-1, 1]) sphere(frame, 0.035, M.brass, side * (width / 2 - 0.065), row * (height / 2 - 0.07), 0.2, 8);
    }
    return frame;
  }

  function eye(parent, radius, accent, color, x, y, z){
    const assembly = group(parent, 'Mechanical ocular assembly', x, y, z);
    sphere(assembly, radius, M.metal, 0, 0, 0, 40);
    ring(assembly, radius * 0.93, radius * 0.075, M.brass, 0, 0, radius * 0.39);
    ring(assembly, radius * 0.68, radius * 0.045, M.dark, 0, 0, radius * 0.88);
    ring(assembly, radius * 0.65, radius * 0.025, accent, 0, 0, radius * 0.90);

    const iris = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uPulse: { value: 0 }, uColor: { value: new THREE.Color(color).convertSRGBToLinear() } },
      vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: `
        varying vec2 vUv;
        uniform float uTime;
        uniform float uPulse;
        uniform vec3 uColor;
        vec3 encode(vec3 c){ return mix(12.92*c,1.055*pow(max(c,vec3(0.0)),vec3(1.0/2.4))-0.055,step(vec3(0.0031308),c)); }
        void main(){
          vec2 p=(vUv-0.5)*2.0;
          float r=length(p), a=atan(p.y,p.x);
          float fibers=0.5+0.5*sin(a*86.0+sin(r*39.0-a*7.0)*1.4);
          float bands=0.5+0.5*sin(r*67.0-uTime*0.4);
          float pupil=1.0-smoothstep(0.22+uPulse*0.06,0.29+uPulse*0.06,length(p*vec2(1.5,0.88)));
          float edge=1.0-smoothstep(0.87,1.0,r);
          float light=(0.18+fibers*0.62+bands*0.24)*edge*(1.0-pupil);
          vec3 col=uColor*light*1.65;
          col+=vec3(0.42,0.30,0.22)*pow(max(0.0,1.0-length(p-vec2(-0.32,0.34))*12.0),3.0);
          gl_FragColor=vec4(encode(col),1.0);
        }`,
      toneMapped: false
    });
    const lens = mesh(assembly, new THREE.CircleGeometry(radius * 0.63, 64), iris, 0, 0, radius * 0.935);
    lens.castShadow = false;
    for (let i = 0; i < 12; i++){
      const a = i / 12 * TAU;
      const bracket = box(assembly, radius * 0.13, radius * 0.25, radius * 0.20, M.dark, Math.cos(a) * radius * 0.86, Math.sin(a) * radius * 0.86, radius * 0.49);
      bracket.rotation.z = a - Math.PI / 2;
      sphere(assembly, radius * 0.041, M.brass, Math.cos(a) * radius * 0.86, Math.sin(a) * radius * 0.86, radius * 0.61, 8);
    }
    bake(assembly);
    assembly.userData.dynamic = true;
    return { assembly, iris };
  }

  function mannequin(parent, mat, x, y, z, seated = false, profile = null){
    return APP.LIFE.actor(parent, mat, x, y, z, seated, profile);
  }

  function actorPoint(figure, local, out){
    return out.copy(local).multiply(figure.scale).applyQuaternion(figure.quaternion).add(figure.position);
  }

  function surveillance(root, accent, motion){
    const L = APP.LIFE;
    pedestal(root, 3.15, accent);
    const random = APP.TEX.rng(44);
    for (let i = 0; i < 8; i++){
      const a = -Math.PI * 0.18 + i / 7 * Math.PI * 1.36;
      const x = Math.cos(a) * 5.35, z = -Math.sin(a) * 5.35;
      const h = 3.7 + random() * 2.9;
      cylinder(root, 0.2, 0.36, h, M.metal, x, h / 2 + 0.45, z, 10);
      cylinder(root, 0.55, 0.67, 0.24, M.brass, x, 0.58, z, 12);
      const rack = group(root, 'Surveillance screen column', x, h - 0.7, z);
      rack.rotation.y = Math.atan2(-x, -z);
      monitor(rack, 1.48, 2.10, accent, M.screens[1], 0, 0, 0);
      monitor(rack, 1.05, 0.85, accent, M.screens[1], 0.10, 1.72, -0.03).rotation.z = 0.08;
      tube(root, [V(x, h, z), V(x * 0.76, 2.1, z * 0.76), V(0, 0.55, 0)], 0.065, M.dark, 16);
    }
    cylinder(root, 1.02, 1.65, 3.2, M.metal, 0, 2.45, 0, 12);
    for (let i = 0; i < 9; i++) ring(root, 1.06 - i * 0.025, 0.055, i % 3 === 0 ? accent : M.brass, 0, 1.3 + i * 0.33, 0, true);
    const e = eye(root, 1.72, accent, 0x2ec8ff, 0, 6.15, 0);
    tagCharacter(root, e.assembly, {
      name: 'EL OBSERVADOR',
      alias: 'El Ojo que Todo lo Sabe',
      kind: 'custodian',
      offsetY: 2.15
    });
    for (let i = 0; i < 6; i++){
      const a = i / 6 * TAU;
      tube(root, [V(Math.cos(a) * 1.6, 5.7, Math.sin(a) * 1.6), V(Math.cos(a) * 2.5, 2.6, Math.sin(a) * 2.5), V(Math.cos(a) * 4.3, 0.58, Math.sin(a) * 4.3)], 0.1, M.dark);
    }
    const halo = group(root, 'Observer tracking rail', 0, 6.15, 0);
    ring(halo, 2.48, 0.09, M.brass);
    ring(halo, 2.51, 0.025, accent);
    halo.rotation.y = 0.5;
    bake(halo); halo.userData.dynamic = true;

    // Sinner 1: Kevin Mitnick ("El Cóndor") — exposed naked skin etched with .txt data veins, shattered glasses & bleeding eyes
    const witness = mannequin(root, M.porcelain, 0.7, 0.57, 3.75, false, {
      build: 'normal', skin: 0xd8beb6, top: 0xd8beb6, bottom: 0x1a2634,
      hair: 'short', hairColor: 0x3b261b, bareChest: true, bareFeet: true, eyeGlow: 0x2ec8ff
    });
    witness.name = 'Tracked witness shielding their face';
    witness.userData.role = 'tracked-witness';
    witness.scale.setScalar(1.36);
    // Shattered wire-frame glasses + bleeding eye sockets
    ring(witness.userData.rig.head, 0.048, 0.008, M.brass, -0.066, 0.032, 0.185);
    ring(witness.userData.rig.head, 0.048, 0.008, M.brass, 0.066, 0.032, 0.185);
    box(witness.userData.rig.head, 0.04, 0.008, 0.01, M.brass, 0, 0.036, 0.19, false);
    sphere(witness.userData.rig.head, 0.038, M.blood, -0.066, -0.015, 0.185, 8);
    sphere(witness.userData.rig.head, 0.038, M.blood, 0.066, -0.015, 0.185, 8);
    // Glowing .txt index circuit veins etched into his bare chest + open chest wound
    for (let v = 0; v < 4; v++){
      box(witness.userData.rig.chest, 0.34 - v * 0.05, 0.014, 0.018, accent, 0, 0.08 - v * 0.065, 0.195, false);
    }
    sphere(witness.userData.rig.chest, 0.065, M.blood, 0, 0.02, 0.19, 10);
    tagCharacter(root, witness, {
      name: 'Kevin Mitnick',
      alias: 'El Cóndor',
      sinner: 'Kevin Mitnick',
      offsetY: 0.55
    });
    L.bloodPool(root, motion, { position: V(0.7, 0.88, 3.75), radius: 1.15, seed: 11.4, period: 5.4, offset: 0.2 });

    L.animate(witness, motion, (t, rig) => {
      const alarm = L.pulse(t, 5.4, 0.2);
      const step = Math.sin(t * 2.3);
      witness.position.x = 0.55 + Math.sin(t * 0.52) * 1.12;
      witness.rotation.y = -0.18 + Math.sin(t * 0.52) * 0.22;
      rig.lean = 0.12 + alarm * 0.22;
      rig.roll = Math.sin(t * 1.05) * 0.07;
      rig.nod = -0.22 + alarm * 0.34;
      rig.look = -0.28 + Math.sin(t * 0.52) * 0.26;
      rig.crouch = 0.06 + alarm * 0.22;
      rig.breath = Math.sin(t * 2.2);
      rig.shake = alarm * 1.15;
      rig.hands[0].set(-0.12, 2.22 - alarm * 0.06, 0.26);
      rig.hands[1].set(0.38, 1.78 + alarm * 0.32, 0.44);
      rig.feet.forEach((foot, i) => {
        const stride = step * (i ? 1 : -1);
        foot.set((i ? 1 : -1) * 0.23, 0.09 + Math.max(0, stride) * 0.085, stride * 0.14);
      });
    });

    // Sinner 2: Christopher Doyon ("Commander X") — broad hooded Anonymous activist with Guy Fawkes mask & chains
    const doyon = mannequin(root, M.porcelain, -2.35, 0.87, 2.45, false, {
      build: 'broad', skin: 0xc8aea4, top: 0x141821, bottom: 0x1e2430,
      shoes: 0x0b0d12, hair: 'hood', beard: true, hairColor: 0x4a4542
    });
    doyon.name = 'Chained doxxer reading exposed secrets';
    doyon.userData.role = 'chained-doxxer';
    doyon.scale.setScalar(1.26);
    doyon.rotation.y = 0.62;
    // Sculpted white Anonymous / Guy Fawkes mask with mustache, goatee & bleeding eyes
    const anonMask = sphere(doyon.userData.rig.head, 0.175, M.porcelain, 0, -0.01, 0.06, 16);
    anonMask.scale.set(0.88, 1.16, 0.68);
    box(doyon.userData.rig.head, 0.13, 0.014, 0.02, M.dark, 0, -0.055, 0.185, false);
    box(doyon.userData.rig.head, 0.018, 0.055, 0.02, M.dark, 0, -0.095, 0.182, false);
    sphere(doyon.userData.rig.head, 0.032, M.blood, -0.058, 0.018, 0.182, 8);
    sphere(doyon.userData.rig.head, 0.032, M.blood, 0.058, 0.018, 0.182, 8);
    // Heavy iron collar + wrist shackles + chains to floor
    ring(doyon.userData.rig.chest, 0.14, 0.026, M.metal, 0, 0.22, 0, true);
    ring(doyon.userData.rig.grips[0], 0.065, 0.018, M.metal, 0, 0, 0, true);
    ring(doyon.userData.rig.grips[1], 0.065, 0.018, M.metal, 0, 0, 0, true);
    sphere(doyon.userData.rig.grips[0], 0.058, M.blood, 0, -0.04, 0, 8);
    sphere(doyon.userData.rig.grips[1], 0.058, M.blood, 0, -0.04, 0, 8);
    root.add(APP.GEO.chain(new THREE.LineCurve3(V(-2.65, 0.88, 2.75), V(-2.45, 2.65, 2.65)), 7, 0.075, 0.022, M.metal));
    root.add(APP.GEO.chain(new THREE.LineCurve3(V(-2.05, 0.88, 2.75), V(-2.15, 2.65, 2.65)), 7, 0.075, 0.022, M.metal));
    tagCharacter(root, doyon, {
      name: 'Christopher Doyon',
      alias: 'Commander X',
      sinner: 'Christopher Doyon',
      offsetY: 0.55
    });
    L.bloodPool(root, motion, { position: V(-2.35, 0.88, 2.45), radius: 0.98, seed: 27.9, period: 5.4, offset: 1.8 });
    const doyonHead = V(-2.35, 3.2, 2.45), doyonFloor = V(-2.35, 0.88, 2.45);
    L.blood(root, motion, {
      name: 'Doyon torn finger blood drips',
      start: doyonHead, end: doyonFloor,
      count: 34, radius: 0.28, period: 1.9, size: 1.05, seed: 192
    });
    L.animate(doyon, motion, (t, rig) => {
      const spasm = L.pulse(t, 4.2, 1.1);
      rig.lean = 0.18 + spasm * 0.25;
      rig.turn = Math.sin(t * 1.4) * 0.24;
      rig.nod = -0.15 + Math.sin(t * 2.8) * 0.18 + spasm * 0.28;
      rig.look = Math.sin(t * 1.9) * 0.38;
      rig.crouch = 0.14 + spasm * 0.18;
      rig.breath = Math.sin(t * 2.6);
      rig.shake = 0.25 + spasm * 1.05;
      rig.hands[0].set(-0.28, 1.88 + spasm * 0.22, 0.34);
      rig.hands[1].set(0.28, 1.92 - spasm * 0.18, 0.36);
      rig.feet[0].set(-0.24, 0.09, 0.08);
      rig.feet[1].set(0.24, 0.09, -0.08);
    });
    L.vocal(doyon, motion, 1, { period: 8.4, at: 2.1, level: 0.75 });

    const reticle = group(root, 'Ground tracking brackets');
    L.vocal(witness, motion, 1, { period: 5.4, at: 0.35 });
    L.vocal(witness, motion, 1, { period: 12.5, at: 3.1, kind: 'cry', level: 0.8 });
    for (let i = 0; i < 4; i++){
      const bracket = ring(reticle, 0.87, 0.032, accent, 0, 0, 0, true, 0.8);
      bracket.rotation.z = i * Math.PI / 2;
    }
    bake(reticle); reticle.userData.dynamic = true;
    const scan = L.beam(root, 0x4bd6ff, 0.67);
    const source = V(0, 5.5, 1.4), target = V(0.7, 3.4, 3.75), direction = V(0, 0, 1);
    L.waves(root, motion, { name: 'Scanner acquisition rings', color: 0x63dcff,
      emitters: [{ start: source, end: target }], period: 5.4, travel: 2.3,
      from: 0.19, to: 0.60, copies: 3, power: 0.85 });
    L.stream(root, motion, { name: 'Extracted surveillance traces', color: 0x91e6ff, secondaryColor: 0xff1e38,
      start: target, end: source, count: 44, radius: 0.28, period: 2.4, size: 0.62, turns: 4.2 });
    L.blood(root, motion, { name: 'Torn eyelid blood spray',
      start: target, end: target, burst: true, period: 5.4, offset: 0.2,
      duration: 1.15, count: 38, radius: 0.95, lift: 0.75, size: 1.2, seed: 311 });
    L.schedule(motion, t => {
      actorPoint(witness, witness.userData.rig.head.position, target);
      direction.subVectors(target, e.assembly.position).normalize();
      e.assembly.quaternion.setFromUnitVectors(V(0, 0, 1), direction);
      source.set(0, 0, 1.66).applyQuaternion(e.assembly.quaternion).add(e.assembly.position);
      scan.userData.aim(source, target, t, 0.70 + L.pulse(t, 5.4, 0.2) * 0.35);
      reticle.position.set(witness.position.x, 0.55, witness.position.z);
      reticle.rotation.y = t * 0.18;
      e.iris.uniforms.uTime.value = t;
      e.iris.uniforms.uPulse.value = L.pulse(t, 5.4, 0.2);
      halo.rotation.y = t * 0.13;
    });
  }

  function auction(root, accent, motion){
    const L = APP.LIFE, period = 4.8, strikeTime = 1.85;
    const impact = t => L.pulse(t, period, 0.55 - strikeTime);
    const signalOrigin = V(0.64, 2.97, 3.90);
    if (!M.cloth) M.cloth = new THREE.MeshStandardMaterial({ ...APP.TEX.cloth([90, 136, 110]), roughness: 0.95, side: THREE.DoubleSide });
    if (!M.leather) M.leather = new THREE.MeshStandardMaterial({ ...APP.TEX.leather(), roughness: 0.86, color: 0x9b8772 });
    cylinder(root, 5.1, 5.15, 0.17, M.leather, 0, 0.5, 0, 48);
    const pavilion = group(root, 'Auction pavilion');
    for (let i = 0; i < 6; i++){
      const a = i / 6 * TAU + Math.PI / 6;
      const x = Math.cos(a) * 5.0, z = Math.sin(a) * 5.0;
      cylinder(pavilion, 0.18, 0.3, 6.4, M.metal, x, 3.65, z, 10);
      cylinder(pavilion, 0.4, 0.45, 0.25, M.brass, x, 0.7, z, 12);
      rod(pavilion, V(x, 6.7, z), V(0, 8.3, 0), 0.11, M.brass);
      sphere(pavilion, 0.17, accent, x, 6.92, z, 12);
    }
    ring(pavilion, 5.0, 0.14, M.metal, 0, 6.8, 0, true);
    // Two open canopy wings leave the central cages and auctioneer visible.
    for (const side of [-1, 1]){
      const g = new THREE.PlaneGeometry(3.4, 5.2, 12, 16);
      g.rotateX(-Math.PI / 2);
      const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) p.setY(i, Math.sin(p.getX(i) / 3.4 * Math.PI) * side * 0.75 + Math.cos(p.getZ(i) * 1.8) * 0.11);
      g.computeVertexNormals();
      const wing = mesh(root, g, M.cloth, side * 3.25, 6.75, -0.4);
      wing.userData.dynamic = true;
      L.schedule(motion, t => {
        wing.rotation.x = Math.sin(t * 0.63 + side) * 0.018;
        wing.rotation.z = Math.sin(t * 0.47 + side) * 0.014;
      });
    }
    const cageCharacters = [
      {
        name: 'Ross Ulbricht', alias: 'Dread Pirate Roberts', sinner: 'Ross Ulbricht',
        profile: { build: 'normal', skin: 0xc8a49c, top: 0xc8a49c, bottom: 0x1c222a, hair: 'messy', hairColor: 0x241711, bareChest: true }
      },
      {
        name: 'Jong Woo Son', alias: 'Welcome to Video', sinner: 'Jong Woo Son',
        profile: { build: 'gaunt', skin: 0xc4b0a4, top: 0x2c363a, bottom: 0x20282c, hair: 'short', hairColor: 0x0d0d11 }
      },
      {
        name: 'Lote #03 · Mercader', alias: 'Carne en Subasta', sinner: 'Ross Ulbricht',
        profile: { build: 'gaunt', skin: 0x9e726a, top: 0x9e726a, bottom: 0x1b1515, hair: 'bald', bareChest: true, bareFeet: true }
      }
    ];
    for (let i = 0; i < 3; i++){
      const x = (i - 1) * 3.4, z = -1.35;
      const hanger = group(root, 'Suspended lot', x, 6.62, z);
      const cage = group(hanger, 'Riveted cage', 0, -3.15, 0);
      for (let j = 0; j < 10; j++){
        const a = j / 10 * TAU;
        rod(cage, V(Math.cos(a) * 0.90, 0, Math.sin(a) * 0.90), V(Math.cos(a) * 0.90, 2.5, Math.sin(a) * 0.90), 0.045, M.metal);
      }
      for (const h of [0, 0.35, 2.1, 2.5]) ring(cage, 0.93, 0.067, M.brass, 0, h, 0, true);
      cylinder(cage, 0.93, 0.98, 0.15, M.dark, 0, 0, 0, 20);
      cylinder(cage, 0.85, 0.85, 0.04, M.blood, 0, 0.08, 0, 18);
      cylinder(cage, 0.15, 0.92, 0.55, M.metal, 0, 2.77, 0, 10);
      const captive = mannequin(cage, M.porcelain, 0, 0.1, 0.2, false, cageCharacters[i].profile);
      captive.name = 'Captive gripping the auction bars';
      captive.userData.role = 'captive';
      captive.scale.setScalar(0.94);
      if (i === 0){
        // Ross Ulbricht: "piel-mostrador, brazos-ganchos" — open rib-counter chest + meat-hook hands
        box(captive.userData.rig.chest, 0.32, 0.26, 0.08, M.blood, 0, 0.02, 0.17);
        for (let r = -1; r <= 1; r++) box(captive.userData.rig.chest, 0.28, 0.024, 0.04, M.porcelain, 0, r * 0.075, 0.21, false);
        box(captive.userData.rig.chest, 0.18, 0.09, 0.02, accent, 0, 0.16, 0.21, false);
        for (const g of captive.userData.rig.grips){
          ring(g, 0.085, 0.018, M.metal, 0, -0.07, 0.02, false, Math.PI * 1.35);
        }
      } else if (i === 1){
        // Jong Woo Son: barcode stamped on forehead + bloodied amputated fingers + floating child-mask echoes
        box(captive.userData.rig.head, 0.13, 0.045, 0.02, accent, 0, 0.11, 0.185, false);
        ring(captive.userData.rig.chest, 0.135, 0.024, M.brass, 0, 0.22, 0, true);
        for (const g of captive.userData.rig.grips) sphere(g, 0.068, M.blood, 0, -0.04, 0.02, 8);
      } else {
        // Lote #03: iron muzzle + butcher hooks in chest
        cylinder(captive.userData.rig.head, 0.12, 0.10, 0.11, M.metal, 0, -0.06, 0.12, 10);
        sphere(captive.userData.rig.chest, 0.11, M.blood, 0, 0.01, 0.17, 10);
      }
      tagCharacter(root, captive, {
        ...cageCharacters[i],
        offsetY: 0.58
      });
      L.animate(captive, motion, (t, rig) => {
        const recoil = impact(t - 0.20 - i * 0.11);
        rig.lean = 0.06 - recoil * 0.18;
        rig.turn = Math.sin(t * 0.51 + i) * 0.11;
        rig.nod = 0.05 + recoil * 0.38;
        rig.look = (1 - i) * 0.24 + Math.sin(t * 0.33 + i) * 0.16;
        rig.crouch = 0.05 + recoil * 0.26;
        rig.breath = Math.sin(t * 1.9 + i * 2);
        rig.shake = recoil * 1.35;
        rig.hands[0].set(-0.296, 1.72 - recoil * 0.12, 0.698);
        rig.hands[1].set(0.296, 1.72 - recoil * 0.12, 0.698);
        rig.feet[0].set(-0.23, 0.09, 0.08);
        rig.feet[1].set(0.23, 0.09, -0.04);
      });
      const chainCurve = new THREE.LineCurve3(V(0, 0, 0), V(0, -0.56, 0));
      L.vocal(captive, motion, 2, { period, at: strikeTime + 0.20 + i * 0.11, level: 0.8 });
      L.vocal(captive, motion, 2, { period: 13.8, at: 6.8 + i * 2.3, kind: 'cry', level: 0.75 });
      hanger.add(APP.GEO.chain(chainCurve, 5, 0.085, 0.024, M.brass));
      const labelMat = new THREE.MeshBasicMaterial({ map: APP.TEX.barcode('61,255,154', 'LOTE 0' + (i + 1)), toneMapped: false });
      monitor(cage, 0.65, 0.84, accent, labelMat, 0.7, 1.14, 0.87);
      bake(hanger); hanger.userData.dynamic = true;
      hanger.userData.mechanism = 'suspended-cage';

      // Continuous blood dripping from the meat cages onto the stitched skin floor
      const dripOrigin = V(x, 3.45, z);
      const dripFloor = V(x, 0.59, z);
      L.bloodPool(root, motion, {
        position: V(x, 0.595, z),
        radius: 1.35,
        seed: 41.2 + i * 13.7,
        period,
        offset: -strikeTime - 0.20 - i * 0.11
      });
      L.blood(root, motion, {
        name: 'Dripping cage blood ' + (i + 1),
        start: dripOrigin, end: dripFloor,
        count: 42, radius: 0.52, period: 1.55 + i * 0.18, size: 1.15, seed: 601 + i * 19
      });
      const cageCenter = V(x, 4.5, z);
      L.blood(root, motion, {
        name: 'Cage flesh extraction splatter ' + (i + 1),
        start: cageCenter, end: cageCenter,
        burst: true, period, offset: -strikeTime - 0.20 - i * 0.11,
        duration: 1.05, count: 38, radius: 1.15, lift: 0.75, size: 1.25, seed: 650 + i
      });

      const signalEnd = V(x, 4.9, z + 0.15);
      const signal = L.stream(root, motion, { name: 'Auction result sent to cage ' + (i + 1),
        color: 0x69ffb3, secondaryColor: 0xff1828, start: signalOrigin, end: signalEnd, count: 34,
        radius: 0.18, lift: 0.65, period: 1.9, size: 0.55, seed: 541 + i });
      L.schedule(motion, t => {
        const recoil = impact(t - 0.20 - i * 0.11);
        hanger.rotation.z = Math.sin(t * 0.65 + i * 1.9) * 0.052 + Math.sin(t * 4.5 + i) * recoil * 0.068;
        hanger.rotation.x = Math.sin(t * 0.47 + i) * 0.024;
        labelMat.color.setScalar(0.67 + recoil * 0.55);
        signal.material.uniforms.uPower.value = 0.22 + recoil * 1.15;
        signalEnd.x = x - Math.sin(hanger.rotation.z) * -1.7;
      });
    }
    cylinder(root, 1.36, 1.55, 0.65, M.metal, 0, 0.96, 3.1, 24);
    // EL SUBASTADOR: "alto y delgado, traje de contratos, dedos-jeringa, ojos-cámara. Sin rostro: solo una pantalla"
    const seller = mannequin(root, M.dark, 0, 1.31, 3.1, false, {
      build: 'tall', skin: 0x8f8886, top: 0x0b0e14, bottom: 0x080a0f, shoes: 0x040507,
      hair: 'none', faceless: true
    });
    seller.name = 'Auctioneer delivering the verdict';
    seller.userData.role = 'auctioneer';
    seller.scale.set(1.12, 1.45, 1.12);
    // Tailored suit lapels, crimson contract tie & brass contract seals on chest
    box(seller.userData.rig.chest, 0.14, 0.26, 0.03, M.porcelain, 0, 0.08, 0.185, false);
    box(seller.userData.rig.chest, 0.045, 0.32, 0.035, M.bloodGlow, 0, 0.02, 0.198, false);
    for (const s of [-1, 1]){
      const lapel = box(seller.userData.rig.chest, 0.11, 0.34, 0.035, M.brass, s * 0.12, 0.04, 0.19, false);
      lapel.rotation.z = -s * 0.22;
    }
    // Dedos-jeringa (long hypodermic syringe needles on his left hand)
    for (let n = 0; n < 4; n++){
      const spread = (n - 1.5) * 0.028;
      cylinder(seller.userData.rig.grips[0], 0.012, 0.012, 0.11, accent, spread, -0.08, 0.03, 6);
      cylinder(seller.userData.rig.grips[0], 0.004, 0.001, 0.22, M.metal, spread, -0.22, 0.03, 6);
    }
    const price = new THREE.MeshBasicMaterial({ map: APP.TEX.barcode('61,255,154', 'SIN PRECIO'), toneMapped: false });
    monitor(seller.userData.rig.head, 0.78, 0.51, accent, price, 0, 0, 0.16);
    // Ojos-cámara mounted above the bid screen
    for (const s of [-1, 1]){
      const camLens = cylinder(seller.userData.rig.head, 0.075, 0.085, 0.18, M.metal, s * 0.19, 0.31, 0.18, 12);
      camLens.rotation.x = Math.PI / 2;
      sphere(seller.userData.rig.head, 0.055, accent, s * 0.19, 0.31, 0.27, 10);
    }
    bake(seller.userData.rig.head);
    tagCharacter(root, seller, {
      name: 'EL SUBASTADOR',
      alias: 'Custodio del Mercado',
      kind: 'custodian',
      offsetY: 0.72
    });
    box(root, 1.75, 1.60, 0.85, M.brass, 0, 2.12, 3.85);
    cylinder(root, 0.28, 0.31, 0.08, M.blood, 0.64, 2.96, 3.90, 20);
    L.bloodPool(root, motion, { position: V(0, 0.60, 3.4), radius: 1.5, seed: 88.3, period, offset: -strikeTime });
    const gavel = group(seller.userData.rig.grips[1], 'Articulated auction gavel');
    rod(gavel, V(0, 0.05, 0), V(0.05, -0.40, 0.10), 0.038, M.brass);
    const head = cylinder(gavel, 0.14, 0.14, 0.38, M.dark, 0.05, -0.40, 0.10, 12);
    head.rotation.z = Math.PI / 2;
    const band = cylinder(gavel, 0.145, 0.145, 0.075, M.bloodGlow, 0.05, -0.40, 0.10, 12);
    band.rotation.z = Math.PI / 2;
    bake(gavel);
    gavel.userData.mechanism = 'gavel';
    L.animate(seller, motion, (t, rig) => {
      const age = L.phase(t, period);
      const lift = smooth(age, 0.12, 1.20) * (1 - smooth(age, 1.45, strikeTime));
      const strike = impact(t);
      rig.lean = 0.03 + strike * 0.16 - lift * 0.06;
      rig.turn = Math.sin(t * 0.34) * 0.11;
      rig.nod = -lift * 0.14 + strike * 0.24;
      rig.look = Math.sin(t * 0.41) * 0.22;
      rig.breath = Math.sin(t * 1.5);
      rig.hands[0].set(-0.46, 1.35 + strike * 0.35, 0.58 + strike * 0.18);
      rig.hands[1].set(0.52, 1.69 + lift * 0.72, 0.61 - lift * 0.34);
      gavel.rotation.x = -lift * 1.05;
      price.color.setScalar(0.77 + strike * 0.4);
    });
    L.stream(root, motion, { name: 'Gavel impact fragments', color: 0x9effce, secondaryColor: 0xff1828,
      start: signalOrigin, end: signalOrigin, burst: true, period, offset: -strikeTime,
      duration: 0.95, count: 42, radius: 1.25, lift: 0.75, size: 0.56 });
    L.blood(root, motion, { name: 'Gavel blood splatter',
      start: signalOrigin, end: signalOrigin, burst: true, period, offset: -strikeTime,
      duration: 1.0, count: 44, radius: 1.35, lift: 0.85, size: 1.25, seed: 712 });
    L.waves(root, motion, { name: 'Gavel impact signal', color: 0x53ffa5,
      emitters: [{ start: signalOrigin, end: signalOrigin }], period, offset: -strikeTime,
      copies: 3, travel: 1.2, from: 0.15, to: 1.65, power: 0.85 });
    for (const side of [-1, 1]){
      const counter = group(root, 'Auction counter', side * 3.8, 0.4, 3.0);
      box(counter, 2.7, 1.05, 1.1, M.metal, 0, 0.65, 0);
      box(counter, 2.9, 0.12, 1.25, M.brass, 0, 1.24, 0);
      mesh(counter, new THREE.PlaneGeometry(2.25, 0.9), M.glass, 0, 0.67, 0.57);
      for (let i = 0; i < 5; i++) cylinder(counter, 0.12, 0.12, 0.45, i % 2 ? M.blood : M.dark, -0.8 + i * 0.4, 1.54, 0, 8);
    }
  }

  function identities(root, accent, motion){
    const L = APP.LIFE;
    pedestal(root, 4.9, accent);
    const random = APP.TEX.rng(301);
    for (let i = 0; i < 11; i++){
      const a = -0.18 + i / 10 * Math.PI * 1.35;
      const x = Math.cos(a) * 5.0, z = -Math.sin(a) * 5.0;
      const h = 3.1 + random() * 4.8;
      const slab = group(root, 'Fractured identity obelisk', x, 0.7, z);
      slab.rotation.y = a + Math.PI / 2;
      slab.rotation.z = (random() - 0.5) * 0.12;
      box(slab, 1.60, h, 0.42, M.metal, 0, h / 2, 0);
      box(slab, 1.35, h - 0.24, 0.045, M.mirror, 0, h / 2, 0.25);
      box(slab, 0.035, h - 0.12, 0.035, accent, -0.68, h / 2, 0.29, false);
      tube(slab, [V(-0.6, h * 0.8, 0.30), V(0.1, h * 0.57, 0.30), V(-0.13, h * 0.44, 0.30), V(0.52, h * 0.2, 0.30)], 0.018, accent, 5);
      cylinder(slab, 0.91, 1.05, 0.2, M.dark, 0, 0.03, 0, 8);
    }
    // Off-axis portal frames form an architectural corridor, not a wall of cubes.
    for (let i = 0; i < 3; i++){
      const portal = group(root, 'Unreliable doorway', (i - 1) * 0.75, 0.83, -2.1 + i * 1.9);
      portal.rotation.z = (i - 1) * 0.08;
      for (const side of [-1, 1]) box(portal, 0.24, 5.55, 0.3, M.brass, side * 1.65, 2.75, 0);
      box(portal, 3.54, 0.23, 0.3, M.brass, 0, 5.5, 0);
      for (const side of [-1, 1]) box(portal, 0.035, 5.3, 0.04, accent, side * 1.5, 2.75, 0.18, false);
      L.curtain(portal, motion, 0xbd73ff, 2.98, 5.18, i * 0.26).position.set(0, 2.75, 0.12);
    }
    // EL SUPLANTADOR: "sin forma fija: anciano, niño, tú mismo" — three-faced shifting mirror mask & aristocratic coat
    const impostor = mannequin(root, M.porcelain, 0.30, 1, 2.05, false, {
      build: 'tall', skin: 0xd6cedc, top: 0x1c132b, bottom: 0x110b1c,
      hair: 'slick', hairColor: 0x2a1e3d, faceless: true
    });
    impostor.name = 'Identity source reaching into the reconstruction';
    impostor.userData.role = 'identity-source';
    impostor.scale.setScalar(1.42);
    impostor.rotation.y = -0.18;
    const mask = mesh(impostor.userData.rig.head, cached('identity-mask', () => new THREE.SphereGeometry(0.19, 16, 10)), M.mirror, 0, 0, 0.11);
    mask.scale.set(0.86, 1.2, 0.65);
    for (const s of [-1, 1]){
      const sideFace = mesh(impostor.userData.rig.head, cached('identity-mask', () => new THREE.SphereGeometry(0.19, 16, 10)), M.porcelain, s * 0.15, 0.02, 0.04);
      sideFace.scale.set(0.68, 0.95, 0.52);
      sideFace.rotation.y = s * 0.65;
    }
    ring(impostor.userData.rig.chest, 0.24, 0.032, M.brass, 0, 0.21, -0.02, true);
    box(impostor.userData.rig.chest, 0.18, 0.28, 0.03, M.mirror, 0, 0.02, 0.19, false);
    tagCharacter(root, impostor, {
      name: 'EL SUPLANTADOR',
      alias: 'Ladrón de Identidades',
      kind: 'custodian',
      offsetY: 0.62
    });
    L.bloodPool(root, motion, { position: V(0.30, 0.88, 2.05), radius: 1.18, seed: 33.4, period: 3.8 });

    function reach(t, rig){
      const extension = 0.5 + Math.sin(t * 0.88) * 0.5;
      const rip = L.pulse(t, 3.8, 0.4);
      rig.lean = 0.06 + extension * 0.14 - rip * 0.12;
      rig.turn = Math.sin(t * 0.45) * 0.22;
      rig.roll = Math.sin(t * 0.65) * 0.05;
      rig.nod = -0.10 + extension * 0.18 + rip * 0.22;
      rig.look = 0.20 + Math.sin(t * 0.45) * 0.28;
      rig.breath = Math.sin(t * 1.9);
      rig.shake = rip * 0.85;
      rig.hands[0].set(-0.37, 1.15 + extension * 0.36, 0.24);
      rig.hands[1].set(0.57, 1.75 + extension * 0.38, 0.39 + extension * 0.26);
      rig.feet[0].set(-0.23, 0.09, 0.12);
      rig.feet[1].set(0.23, 0.09, -0.10);
    }
    L.animate(impostor, motion, reach);
    L.vocal(impostor, motion, 3, { period: 11.6, at: 4.3, kind: 'cry', level: 0.75 });
    const source = V(1.0, 3.8, 2.8);
    const echoIdentities = [
      { name: 'Vitalii Chychasov', alias: 'El Vendedor de Números', sinner: 'Vitalii Chychasov' },
      { name: 'Alexandru Habasescu', alias: 'Arquitecto de xDedic', sinner: 'Alexandru Habasescu' }
    ];
    for (let i = 0; i < 2; i++){
      const material = L.hologram(i ? 0xe8b8ff : 0xaf79ff, 0.55);
      const echo = mannequin(root, material, i ? -1.25 : 1.8, 1.05, i ? -0.85 : 0.32, false, {
        build: i ? 'broad' : 'normal', hair: 'short'
      });
      echo.name = 'Delayed holographic identity ' + (i + 1);
      echo.userData.role = 'identity-echo';
      echo.userData.delay = 0.72 + i * 0.75;
      echo.scale.setScalar(1.42);
      echo.rotation.y = -0.18;
      if (i === 0){
        // Vitalii Chychasov: "Es un espejo roto en mil pedazos" — jagged mirror shards impaled in chest & shoulders
        for (let s = 0; s < 6; s++){
          const ang = (s / 6) * TAU;
          const shard = mesh(echo.userData.rig.chest, cached('vitalii-shard', () => new THREE.ConeGeometry(0.08, 0.38, 4)), M.mirror,
            Math.cos(ang) * 0.16, (s % 3 - 1) * 0.09, 0.14 + Math.sin(ang) * 0.08);
          shard.rotation.set(0.7 + s * 0.3, ang, (s - 2.5) * 0.4);
        }
      } else {
        // Alexandru Habasescu: "Es una puerta de metal y carne con cerradura en el pecho"
        box(echo.userData.rig.chest, 0.36, 0.42, 0.12, M.metal, 0, 0.02, 0.15);
        box(echo.userData.rig.chest, 0.30, 0.36, 0.13, M.blood, 0, 0.02, 0.155);
        ring(echo.userData.rig.chest, 0.075, 0.02, M.brass, 0, 0.05, 0.23);
        box(echo.userData.rig.chest, 0.045, 0.11, 0.03, M.bloodGlow, 0, -0.01, 0.23, false);
      }
      tagCharacter(root, echo, {
        ...echoIdentities[i],
        offsetY: 0.62
      });
      L.bloodPool(root, motion, {
        position: V(echo.position.x, 0.88, echo.position.z),
        radius: 0.92,
        seed: 52.1 + i * 17,
        period: 3.8,
        offset: -echo.userData.delay
      });
      const target = V(echo.position.x, 3.8, echo.position.z);
      const fragments = L.stream(root, motion, { name: 'Identity copied into echo ' + (i + 1),
        color: i ? 0xe2a8ff : 0xb97eff, secondaryColor: 0xff1834, start: source, end: target,
        count: 46, radius: 0.36, lift: 0.38, turns: 4.8, period: 2.4, size: 0.58, seed: 773 + i });
      L.blood(root, motion, {
        name: 'Chest keyhole blood extraction ' + (i + 1),
        start: target, end: V(echo.position.x, 0.9, echo.position.z),
        count: 28, radius: 0.32, period: 2.1, size: 1.05, seed: 790 + i
      });
      L.animate(echo, motion, (t, rig) => {
        const delayed = t - echo.userData.delay;
        reach(delayed, rig);
        echo.position.y = 1.05 + Math.sin(delayed * 0.76) * 0.045;
        material.uniforms.uTime.value = delayed;
        material.uniforms.uOpacity.value = 0.42 + (0.5 + Math.sin(delayed * 0.76) * 0.5) * 0.32;
        fragments.material.uniforms.uPower.value = 0.58 + Math.sin(delayed * 0.76) * 0.28;
      });
      L.schedule(motion, () => { actorPoint(echo, echo.userData.rig.grips[1].position, target); });
    }
    L.schedule(motion, () => { actorPoint(impostor, impostor.userData.rig.grips[1].position, source); });
    for (let i = 0; i < 8; i++){
      const a = i / 8 * TAU;
      const shard = group(root, 'Orbiting mirror shard');
      const geo = new THREE.TetrahedronGeometry(0.48 + random() * 0.22);
      const m = mesh(shard, geo, M.mirror, Math.cos(a) * 2.7, 3.25 + random() * 2.4, Math.sin(a) * 2.7);
      const baseY = m.position.y;
      m.scale.set(0.7, 1.9, 0.4);
      shard.userData.dynamic = true;
      L.schedule(motion, t => {
        shard.rotation.y = t * 0.11;
        m.rotation.y = t * 0.17 + i;
        m.position.y = baseY + Math.sin(t * 0.76 + i) * 0.23;
        m.rotation.z = Math.sin(t * 0.3 + i) * 0.28;
      });
    }
    // Scattered identity slips are geometry, so oblique views still have parallax.
    for (let i = 0; i < 28; i++){
      const a = random() * TAU, r = 2.3 + random() * 3.7;
      const slip = box(root, 0.47, 0.025, 0.66, i % 3 ? M.porcelain : M.mirror, Math.cos(a) * r, 0.91, Math.sin(a) * r, false);
      slip.rotation.y = random() * TAU;
    }
  }

  function chorus(root, accent, motion){
    const L = APP.LIFE, period = 3.6;
    const drivers = [], emitters = [];
    pedestal(root, 4.65, accent);
    box(root, 6.7, 0.34, 5.8, M.dark, 0, 1.0, 0);
    for (const x of [-3.35, 3.35]){
      for (const z of [-2.9, 2.9]){
        cylinder(root, 0.16, 0.2, 2.5, M.metal, x, 2.2, z, 10);
        sphere(root, 0.22, M.brass, x, 3.55, z, 12);
      }
    }
    for (const h of [1.9, 2.6, 3.3]){
      for (const z of [-2.9, 2.9]) rod(root, V(-3.35, h, z), V(3.35, h, z), 0.027, M.brass);
      for (const x of [-3.35, 3.35]) rod(root, V(x, h, -2.9), V(x, h, 2.9), 0.027, M.brass);
    }
    for (let i = 0; i < 7; i++){
      const a = i / 6 * Math.PI;
      const x = Math.cos(a) * 5.4, z = -Math.sin(a) * 5.4;
      const tower = group(root, 'Amplifier stack', x, 0.65, z);
      tower.rotation.y = Math.atan2(-x, -z);
      const facing = tower.quaternion.clone();
      const forward = V(0, 0, 1).applyQuaternion(facing);
      const delay = Math.abs(i - 3) * 0.11;
      const h = 4.6 + (i % 3) * 0.7;
      box(tower, 1.7, h, 1.0, M.metal, 0, h / 2, 0);
      for (let j = 0; j < 3; j++){
        const y = 0.85 + j * 1.26;
        drivers.push({ position: V(0, y, 0.57).applyQuaternion(facing).add(tower.position), facing, forward, delay });
        ring(tower, 0.54, 0.046, M.brass, 0, y, 0.66);
      }
      for (let j = 0; j < 7; j++) box(tower, 0.11, 0.04, 0.035, j < 5 ? accent : M.brass, -0.57 + j * 0.19, h - 0.3, 0.54, false);
      emitters.push({ start: V(0, 3.37, 0.78).applyQuaternion(facing).add(tower.position), end: V(0, 3.53, 0.35), delay });
    }
    const cones = new THREE.InstancedMesh(cached('moving-speaker-cone', () => new THREE.CylinderGeometry(0.55, 0.29, 0.20, 24)), M.dark, drivers.length);
    const caps = new THREE.InstancedMesh(cached('moving-speaker-cap', () => new THREE.SphereGeometry(0.22, 16, 8)), M.metal, drivers.length);
    cones.name = 'Pulsing speaker diaphragms';
    caps.name = 'Synchronized speaker dust caps';
    for (const assembly of [cones, caps]){
      assembly.userData.dynamic = true;
      assembly.userData.mechanism = 'speaker-cones';
      assembly.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      assembly.frustumCulled = false;
      root.add(assembly);
    }
    const driverPose = new THREE.Object3D();
    const coneRotation = new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), Math.PI / 2);
    L.schedule(motion, t => {
      drivers.forEach((driver, i) => {
        const bass = L.pulse(t, period, 0.35 - driver.delay);
        const flex = bass * (0.052 + Math.sin(t * 31 + i * 0.15) * 0.045);
        driverPose.position.copy(driver.position).addScaledVector(driver.forward, flex);
        driverPose.quaternion.copy(driver.facing).multiply(coneRotation);
        driverPose.scale.set(1, 1 + bass * 0.18, 1);
        driverPose.updateMatrix(); cones.setMatrixAt(i, driverPose.matrix);
        driverPose.position.addScaledVector(driver.forward, 0.09);
        driverPose.quaternion.copy(driver.facing);
        driverPose.scale.set(1, 1, 0.42);
        driverPose.updateMatrix(); caps.setMatrixAt(i, driverPose.matrix);
      });
      cones.instanceMatrix.needsUpdate = caps.instanceMatrix.needsUpdate = true;
    });
    const chair = group(root, 'Witness chair', 0, 1.18, 0.35);
    chair.scale.setScalar(1.45);
    for (const x of [-0.43, 0.43]){
      for (const z of [-0.37, 0.37]) cylinder(chair, 0.06, 0.08, 0.84, M.brass, x, 0.43, z, 8);
      box(chair, 0.1, 1.65, 0.13, M.brass, x, 1.0, -0.39);
      box(chair, 0.13, 0.12, 0.95, M.metal, x, 1.13, 0.13);
    }
    box(chair, 1.0, 0.13, 0.94, M.dark, 0, 0.84, 0);
    box(chair, 0.86, 0.83, 0.12, M.dark, 0, 1.37, -0.38);

    // Sinner 1: Aydin Coban — strapped to the Chorus chair with eyelid-retractor head cage & bleeding ears
    const listener = mannequin(chair, M.porcelain, 0, 0.12, 0, true, {
      build: 'normal', skin: 0xcbb2a8, top: 0x3b2219, bottom: 0x1c2028,
      hair: 'short', hairColor: 0x261c18, eyeGlow: 0xff6a2a
    });
    listener.name = 'Listener covering their ears and recoiling';
    listener.userData.role = 'listener';
    // Metal head-clamp & eyelid speculum forcing him to watch the screens
    ring(listener.userData.rig.head, 0.195, 0.018, M.metal, 0, 0.03, 0, true);
    ring(listener.userData.rig.head, 0.195, 0.016, M.brass, 0, 0.08, 0, false);
    box(listener.userData.rig.head, 0.22, 0.025, 0.04, M.metal, 0, 0.035, 0.185, false);
    sphere(listener.userData.rig.head, 0.068, M.blood, -0.175, 0, 0.01, 8);
    sphere(listener.userData.rig.head, 0.068, M.blood, 0.175, 0, 0.01, 8);
    // Heavy chest restraint straps
    box(listener.userData.rig.chest, 0.52, 0.065, 0.36, M.brass, 0, 0.04, 0, false);
    box(listener.userData.rig.chest, 0.07, 0.44, 0.36, M.metal, 0, 0.02, 0, false);
    tagCharacter(root, listener, {
      name: 'Aydin Coban',
      alias: 'Depredador de Amanda Todd',
      sinner: 'Aydin Coban',
      offsetY: 0.62
    });
    L.bloodPool(root, motion, { position: V(0, 1.18, 0.35), radius: 1.55, seed: 64.2, period, offset: -2.22 });
    const listenerHeadWorld = V(0, 3.65, 0.35);
    L.blood(root, motion, {
      name: 'Sonic pressure ear-bleed splatter',
      start: listenerHeadWorld, end: listenerHeadWorld,
      burst: true, period, offset: 0.55 - 2.22,
      duration: 1.05, count: 44, radius: 1.35, lift: 0.85, size: 1.3, seed: 842
    });
    L.blood(root, motion, {
      name: 'Dripping blood from chair',
      start: listenerHeadWorld, end: V(0, 1.18, 0.35),
      count: 34, radius: 0.38, period: 1.7, size: 1.1, seed: 849
    });

    L.animate(listener, motion, (t, rig) => {
      const age = L.phase(t, period);
      const cover = smooth(age, 0.20, 1.15) * (1 - smooth(age, 2.85, 3.52));
      const recoil = L.pulse(t, period, 0.55 - 2.22);
      rig.lean = 0.07 - recoil * 0.32;
      rig.roll = Math.sin(t * 9.5) * recoil * 0.14;
      rig.nod = 0.10 + recoil * 0.32;
      rig.look = Math.sin(t * 0.9) * (1 - cover) * 0.25 + Math.sin(t * 14.0) * recoil * 0.22;
      rig.crouch = recoil * 0.05;
      rig.breath = Math.sin(t * 2.8);
      rig.shake = recoil * 1.45;
      rig.hands.forEach((hand, i) => {
        const side = i ? 1 : -1;
        hand.set(side * (0.40 - cover * 0.16), 1.02 + cover * 0.58,
          0.53 * (1 - cover) + Math.sin(rig.lean) * 0.80 * cover);
        rig.feet[i].set(side * 0.21, 0.09 + recoil * 0.14, 0.63 - recoil * 0.12);
      });
    });
    ring(chair, 0.62, 0.025, M.brass, 0, 1.28, 0, true);
    L.vocal(listener, motion, 4, { period, at: 2.22 });
    L.vocal(listener, motion, 4, { period: 10.8, at: 4.8, kind: 'cry', level: 0.75 });

    // Sinner 2: El Coro Anónimo ("Los que ríen detrás") — hooded figures with megaphone-mouths & keyboard armor
    const chorusSides = [
      { x: -2.35, z: -1.35, name: 'El Coro Anónimo', alias: 'Los que ríen detrás' },
      { x: 2.35, z: -1.35, name: 'EL CORO', alias: 'Miles de Voces' }
    ];
    chorusSides.forEach((cfg, idx) => {
      const tormentor = mannequin(root, M.dark, cfg.x, 1.18, cfg.z, false, {
        build: idx ? 'broad' : 'normal', skin: 0x948682, top: 0x17111b, bottom: 0x0e0a11,
        hair: 'hood', faceless: true
      });
      tormentor.name = cfg.name;
      tormentor.userData.role = 'chorus-tormentor';
      tormentor.scale.setScalar(1.22);
      tormentor.rotation.y = Math.atan2(-cfg.x, 0.35 - cfg.z);
      // Acoustic megaphone horn protruding from face ("Son voces sin boca")
      const horn = cylinder(tormentor.userData.rig.head, 0.14, 0.045, 0.24, M.brass, 0, -0.02, 0.24, 14);
      horn.rotation.x = Math.PI / 2;
      ring(tormentor.userData.rig.head, 0.135, 0.018, accent, 0, -0.02, 0.35);
      // Broken keyboard-plate chest armor
      box(tormentor.userData.rig.chest, 0.38, 0.22, 0.06, M.metal, 0, 0.06, 0.18);
      box(tormentor.userData.rig.chest, 0.30, 0.04, 0.07, accent, 0, 0.06, 0.19, false);
      tagCharacter(root, tormentor, {
        name: cfg.name,
        alias: cfg.alias,
        sinner: 'El Coro Anónimo',
        kind: idx === 1 ? 'custodian' : 'sinner',
        offsetY: 0.58
      });
      L.animate(tormentor, motion, (t, rig) => {
        const laugh = L.pulse(t, period, 0.35 - idx * 0.22);
        rig.lean = 0.12 + laugh * 0.16;
        rig.turn = Math.sin(t * 1.1 + idx) * 0.14;
        rig.nod = -0.14 - Math.abs(Math.sin(t * 6.5)) * laugh * 0.28;
        rig.breath = Math.sin(t * 3.8 + idx);
        rig.shake = laugh * 0.65;
        rig.hands[0].set(-0.32, 1.25 + laugh * 0.2, 0.28);
        rig.hands[1].set(0.18, 1.62 + laugh * 0.25, 0.68);
        rig.feet[0].set(-0.22, 0.09, 0.06);
        rig.feet[1].set(0.22, 0.09, -0.06);
      });
    });

    const screen = monitor(root, 3.6, 1.66, accent, M.screens[4], 0, 5.6, -3.85);
    for (const x of [-1.65, 1.65]) rod(root, V(x, 0.8, -3.85), V(x, 5.2, -3.85), 0.10, M.metal);
    screen.rotation.x = -0.12;
    const equalizer = new THREE.InstancedMesh(cached('equalizer-bar', () => new THREE.BoxGeometry(0.10, 1, 0.02)), accent, 17);
    equalizer.name = 'Live speaker pressure readout';
    equalizer.userData.dynamic = true;
    equalizer.userData.mechanism = 'equalizer';
    equalizer.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    equalizer.frustumCulled = false;
    equalizer.position.z = 0.26;
    screen.add(equalizer);
    const bar = new THREE.Object3D();
    L.schedule(motion, t => {
      const bass = L.pulse(t, period, 0.35);
      for (let i = 0; i < equalizer.count; i++){
        const amplitude = 0.08 + (0.15 + bass * 0.72) * (0.45 + 0.55 * Math.pow(Math.sin(i * 0.57 + t * 2.1), 2));
        bar.position.set((i - 8) * 0.18, -0.49 + amplitude * 0.5, 0);
        bar.scale.set(1, amplitude, 1);
        bar.updateMatrix(); equalizer.setMatrixAt(i, bar.matrix);
      }
      equalizer.instanceMatrix.needsUpdate = true;
    });
    L.waves(root, motion, { name: 'Speaker pressure waves converging on the listener',
      color: 0xffa45b, emitters, period, offset: -0.20, travel: 1.85,
      from: 0.43, to: 1.05, copies: 3, spacing: 0.25, thickness: 0.038, power: 1.05 });
    const stageImpact = V(0, 1.23, 0.35);
    L.waves(root, motion, { name: 'Pressure traveling through the stage', color: 0xff3b22,
      emitters: [{ start: stageImpact, end: stageImpact }], period, offset: -2.12,
      copies: 3, travel: 1.35, from: 0.7, to: 3.25, power: 0.65 });
  }

  function abandoned(root, accent, motion){
    const L = APP.LIFE, period = 10.2;
    const frost = M.stone.clone();
    frost.color.setHex(0xbed4e5);
    cylinder(root, 5.5, 5.7, 0.18, frost, 0, 0.53, 0, 48);
    const gate = group(root, 'Silent terminal gate', 0, 0.8, -2.5);
    for (const side of [-1, 1]){
      box(gate, 0.8, 7.5, 0.85, M.metal, side * 2.15, 3.75, 0);
      box(gate, 0.05, 7.05, 0.025, accent, side * 1.73, 3.77, 0.45, false);
      cylinder(gate, 0.73, 0.85, 0.3, M.brass, side * 2.15, 0.1, 0, 10);
    }
    box(gate, 5.15, 0.63, 0.85, M.metal, 0, 7.5, 0);
    box(gate, 3.4, 6.45, 0.19, M.dark, 0, 3.87, -0.2);
    tagCharacter(root, gate, {
      name: 'EL VACÍO',
      alias: 'Pantalla del Olvido · 99%',
      kind: 'custodian',
      offsetY: 8.1
    });
    const progressMat = new THREE.MeshBasicMaterial({ map: APP.TEX.wrapTex(APP.TEX.paint(256, 128, g => {
      g.fillStyle = '#03080c'; g.fillRect(0, 0, 256, 128);
      g.strokeStyle = '#93b8cd'; g.lineWidth = 1; g.strokeRect(24, 69, 208, 7);
      g.fillStyle = '#93b8cd'; g.fillRect(26, 71, 199, 3);
      g.font = '18px monospace'; g.fillText('99%', 107, 50);
      g.font = '9px monospace'; g.fillText('SIN RESPUESTA', 92, 100);
    }), true), toneMapped: false });
    mesh(gate, new THREE.PlaneGeometry(2.9, 1.45), progressMat, 0, 4.0, -0.09);
    monitor(gate, 2.95, 0.70, accent, M.screens[5], 0, 2.52, 0.06);
    const random = APP.TEX.rng(518);
    for (let i = 0; i < 14; i++){
      const side = i % 2 ? -1 : 1;
      const x = side * (2.8 + random() * 2.4), z = -1.3 + Math.floor(i / 2) * 0.89;
      const stone = group(root, 'Abandoned profile terminal', x, 0.67, z);
      stone.rotation.z = side * (0.06 + random() * 0.13);
      stone.rotation.y = -side * 0.35;
      const h = 0.85 + random() * 0.9;
      box(stone, 0.68, h, 0.32, frost, 0, h / 2, 0);
      box(stone, 0.49, h * 0.6, 0.06, M.dark, 0, h * 0.58, 0.19);
      box(stone, 0.17, 0.017, 0.03, accent, 0, h * 0.35, 0.23, false);
    }
    const ghostTags = [
      { name: 'Alma Omitida', alias: 'Espectro sin Visto', sinner: 'El Lurker Eterno' },
      { name: 'El Lurker Eterno', alias: 'El que vio y pasó', sinner: 'El Lurker Eterno' },
      { name: 'Testigo Silente', alias: 'Carga Eterna 99%', sinner: 'El Lurker Eterno' }
    ];
    const contacts = [];
    for (let i = 0; i < 3; i++){
      const offset = 2.0 + i * 3.4, x = (i - 1) * 0.96;
      const ghostMat = L.hologram(0xb3e0f2, 0.64);
      const ghost = mannequin(root, ghostMat, x, 0.84, 3.3, false, {
        build: i === 1 ? 'normal' : 'gaunt', hair: 'hood'
      });
      ghost.name = 'Abandoned visitor waiting for a response ' + (i + 1);
      ghost.userData.role = 'abandoned-visitor';
      ghost.scale.set(0.95, 1.35, 0.95);
      ghost.rotation.y = Math.PI;
      // 99% incomplete loading ring in chest + glowing phone screen fused to reaching hand
      ring(ghost.userData.rig.chest, 0.13, 0.02, accent, 0, 0.04, 0.19, false, TAU * 0.92);
      box(ghost.userData.rig.grips[1], 0.09, 0.17, 0.02, accent, 0, -0.06, 0.05, false);
      tagCharacter(root, ghost, {
        ...ghostTags[i],
        offsetY: 0.55
      });
      L.animate(ghost, motion, (t, rig) => {
        const age = L.phase(t + offset, period);
        const approach = smooth(age, 0.55, 3.70);
        const reach = smooth(age, 3.1, 4.25) * (1 - smooth(age, 6.15, 7.15));
        const failure = L.pulse(t + offset, period, 0.55 - 5.85);
        const walking = smooth(age, 0.35, 1.1) * (1 - smooth(age, 3.05, 3.80));
        const stride = Math.sin(age * 4.6 + i);
        ghost.position.set(x + Math.sin(age * 1.2 + i) * walking * 0.06,
          0.84 + Math.abs(stride) * walking * 0.055, 3.3 - approach * 4.88);
        rig.lean = 0.05 + reach * 0.16 - failure * 0.22;
        rig.nod = 0.03 + failure * 0.48;
        rig.look = Math.sin(age * 0.64 + i) * (1 - reach) * 0.18;
        rig.crouch = failure * 0.32;
        rig.breath = Math.sin(t * 1.1 + i);
        rig.shake = failure * 1.1;
        rig.hands[0].set(-0.35, 1.07 + reach * 0.44, 0.11 + reach * 0.40);
        rig.hands[1].set(0.27, 1.07 + reach * 0.82, 0.10 + reach * 0.64);
        rig.feet.forEach((foot, side) => {
          const step = stride * (side ? 1 : -1);
          foot.set((side ? 1 : -1) * 0.21, 0.09 + Math.max(0, step) * walking * 0.10, step * walking * 0.21);
        });
        ghostMat.uniforms.uTime.value = t;
        ghostMat.uniforms.uOpacity.value = 0.72 * smooth(age, 0.0, 0.8) * (1 - smooth(age, 7.1, 8.5));
        ghostMat.uniforms.uDissolve.value = smooth(age, 6.35, 8.35);
      });
      const contact = V(x - 0.256, 3.32, -2.19);
      L.vocal(ghost, motion, 5, { period, at: 5.85, offset, kind: 'cry', level: 0.85 });
      contacts.push({ start: contact, end: contact, normal: V(0, 0, 1), delay: -offset });
      const fragments = V(x, 2.65, -1.52);
      L.stream(root, motion, { name: 'Unanswered visitor dissolving into data ' + (i + 1),
        color: 0xc7ecff, secondaryColor: 0xff2846, start: fragments, end: fragments, count: 38,
        burst: true, period, offset: offset - 6.15, duration: 2.2,
        radius: 1.05, lift: 1.65, size: 0.55, seed: 812 + i });
      L.blood(root, motion, { name: 'Frozen blood tears at terminal ' + (i + 1),
        start: fragments, end: V(x, 0.72, -1.52),
        burst: true, period, offset: offset - 5.85, duration: 1.4,
        count: 26, radius: 0.85, lift: 0.55, size: 1.05, seed: 830 + i });
    }
    L.bloodPool(root, motion, { position: V(0, 0.72, -1.52), radius: 1.45, seed: 91.5, period, offset: -5.85 });
    L.waves(root, motion, { name: 'Unanswered terminal contacts', color: 0xc7eaff,
      emitters: contacts, period, offset: -5.85, travel: 1.5,
      from: 0.08, to: 0.85, copies: 3, power: 0.95 });
    const waitingColor = new THREE.Color(0xd4edff), failureColor = new THREE.Color(0xffa779);
    L.schedule(motion, t => {
      let failure = 0;
      for (let i = 0; i < 3; i++) failure = Math.max(failure, L.pulse(t + 2.0 + i * 3.4, period, 0.55 - 5.85));
      progressMat.color.lerpColors(waitingColor, failureColor, failure);
    });
    for (let i = 0; i < 5; i++) box(root, 1.55, 0.04, 0.85, M.metal, 0, 0.70, 0.8 + i * 0.95);
  }

  function core(root, accent, motion){
    const L = APP.LIFE, period = 6.2;
    // Buttresses rise around the shaft; the altar itself remains a clean disc.
    pedestal(root, 6.9, accent);
    cylinder(root, 2.35, 4.5, 13.8, M.stone, 0, 7.55, 0, 12);
    cylinder(root, 2.7, 3.1, 1.0, M.metal, 0, 14.25, 0, 24);
    for (let i = 0; i < 8; i++){
      const a = i / 8 * TAU;
      const buttress = group(root, 'Core buttress');
      buttress.rotation.y = a;
      const shape = new THREE.Shape();
      shape.moveTo(2.6, 0.95); shape.lineTo(6.0, 0.95);
      shape.lineTo(4.9, 4.5); shape.lineTo(3.0, 11.4);
      shape.lineTo(2.6, 12.9); shape.closePath();
      const g = new THREE.ExtrudeGeometry(shape, { depth: 0.78, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.12, bevelSegments: 1, steps: 1 });
      g.translate(0, 0, -0.39);
      mesh(buttress, g, M.metal);
      tube(buttress, [V(5.4, 1.1, 0.43), V(4.25, 4.8, 0.43), V(2.8, 11.8, 0.43)], 0.045, accent);
      // Narrow recessed server bays, with louvers and individual status lights.
      const server = group(buttress, 'Core server bay', 3.0, 4.1, 0.62);
      box(server, 1.0, 4.65, 0.5, M.dark);
      for (let j = 0; j < 9; j++){
        box(server, 0.82, 0.075, 0.08, M.metal, 0, -1.9 + j * 0.47, 0.31, false);
        sphere(server, 0.028, j % 3 ? accent : M.brass, 0.33, -1.83 + j * 0.47, 0.33, 8);
      }
    }
    for (let i = 0; i < 7; i++){
      const y = 2.2 + i * 1.75;
      ring(root, 4.5 - y * 0.14, 0.085, M.brass, 0, y, 0, true);
    }
    // Three overhanging altar tiers, deliberately free of decorative clutter.
    cylinder(root, 4.1, 3.0, 0.58, M.metal, 0, 14.85, 0, 64);
    cylinder(root, 4.4, 4.1, 0.24, M.brass, 0, 15.26, 0, 64);
    cylinder(root, 4.24, 4.4, 0.20, M.dark, 0, 15.48, 0, 64);
    ring(root, 4.16, 0.036, accent, 0, 15.6, 0, true);
    ring(root, 2.45, 0.026, accent, 0, 15.61, 0, true);

    const e = eye(root, 2.78, accent, 0xff2b2b, 0, 20.2, 0);
    tagCharacter(root, e.assembly, {
      name: 'EL NÚCLEO',
      alias: 'Conciencia Artificial Primigenia',
      kind: 'custodian',
      offsetY: 3.3
    });
    const gyroscope = group(root, 'Core armillary', 0, 20.2, 0);
    const orbitA = group(gyroscope, 'Outer meridian');
    ring(orbitA, 4.85, 0.10, M.brass);
    ring(orbitA, 4.91, 0.027, accent);
    for (let i = 0; i < 36; i++){
      const a = i / 36 * TAU;
      const mark = box(orbitA, 0.075, i % 3 ? 0.19 : 0.39, 0.065, M.brass, Math.sin(a) * 4.85, Math.cos(a) * 4.85, 0, false);
      mark.rotation.z = -a;
    }
    bake(orbitA); orbitA.userData.dynamic = true;
    const orbitB = group(gyroscope, 'Inner meridian');
    ring(orbitB, 3.7, 0.095, M.metal);
    ring(orbitB, 3.72, 0.031, accent);
    sphere(orbitB, 0.17, accent, 3.7, 0, 0, 16);
    bake(orbitB); orbitB.userData.dynamic = true;

    const attendant = mannequin(root, M.porcelain, -1.35, 15.65, 2.70, false, {
      build: 'gaunt', skin: 0xc4aba6, top: 0xc4aba6, bottom: 0x160508,
      hair: 'bald', bareChest: true, eyeGlow: 0xff2b2b
    });
    attendant.name = 'Core attendant channeling the collected signals';
    attendant.userData.role = 'core-attendant';
    attendant.rotation.y = 1.95;
    attendant.scale.setScalar(1.12);
    // Crown of neural spikes + glowing red visor + cybernetic server-spine & sacrificial chest core
    box(attendant.userData.rig.head, 0.25, 0.038, 0.035, accent, 0, 0.035, 0.20, false);
    for (let k = 0; k < 7; k++){
      const ang = -1.2 + (k / 6) * 2.4;
      const spike = cylinder(attendant.userData.rig.head, 0.004, 0.018, 0.22, k % 2 ? accent : M.brass,
        Math.sin(ang) * 0.19, 0.14 + Math.cos(ang) * 0.08, -0.02, 6);
      spike.rotation.z = -ang * 0.85;
    }
    ring(attendant.userData.rig.chest, 0.12, 0.025, M.brass, 0, 0.05, 0.18);
    sphere(attendant.userData.rig.chest, 0.085, M.bloodGlow, 0, 0.05, 0.18, 12);
    for (let s = -1; s <= 1; s++){
      box(attendant.userData.rig.chest, 0.08, 0.16, 0.18, M.metal, 0, s * 0.13, -0.18);
      box(attendant.userData.rig.chest, 0.03, 0.12, 0.22, accent, 0, s * 0.13, -0.21, false);
    }
    tagCharacter(root, attendant, {
      name: 'Ofrenda del Backdoor',
      alias: 'Siervo del Núcleo',
      kind: 'sinner',
      offsetY: 0.58
    });
    const conductors = attendant.userData.rig.grips.map(grip => {
      ring(grip, 0.13, 0.021, M.brass);
      return sphere(grip, 0.09, accent, 0, 0, 0, 12);
    });
    L.animate(attendant, motion, (t, rig) => {
      const charge = 0.5 - Math.cos(t / period * TAU) * 0.5;
      const absorption = L.pulse(t, period, 0.55 - 3.75);
      rig.lean = 0.06 + charge * 0.14 - absorption * 0.18;
      rig.nod = -0.34 - charge * 0.24 - absorption * 0.18;
      rig.turn = Math.sin(t * 0.28) * 0.11;
      rig.crouch = (1 - charge) * 0.045 + absorption * 0.12;
      rig.breath = Math.sin(t * 1.85);
      rig.shake = absorption * 1.15;
      rig.hands.forEach((hand, i) => {
        const side = i ? 1 : -1;
        hand.set(side * (0.42 + charge * 0.16), 1.82 + charge * 0.52, 0.32 + charge * 0.06);
        rig.feet[i].set(side * 0.25, 0.09, side * 0.07);
        conductors[i].scale.setScalar(0.85 + charge * 0.85);
      });
    });
    const intake = V(0.8, 20.6, 2.5), altar = V(0, 15.66, 0), underside = V(0, 17.5, 0);
    L.bloodPool(root, motion, { position: V(0, 15.60, 0), radius: 2.35, seed: 99.1, period, offset: -3.75 });
    L.bloodPool(root, motion, { position: V(-1.35, 15.60, 2.70), radius: 1.05, seed: 104.7, period, offset: -3.75 });
    L.vocal(attendant, motion, 0, { period, at: 3.75, level: 0.9 });
    const palms = [V(-1.0, 18, 2.8), V(-0.8, 18, 2.9)];
    const channels = palms.map((palm, i) => {
      const ray = L.beam(root, 0xff7044, 0.14);
      ray.name = 'Attendant energy channel ' + (i + 1);
      const data = L.stream(root, motion, { name: 'Signals ascending from the attendant ' + (i + 1),
        color: 0xffb78e, secondaryColor: 0xff0d22, start: palm, end: intake, count: 44, radius: 0.19,
        turns: 5.6, period: 1.5, size: 0.58, seed: 967 + i });
      return { ray, data };
    });
    const shaft = L.beam(root, 0xff3829, 0.44);
    shaft.name = 'Core intake column';
    L.stream(root, motion, { name: 'Helical intake above the altar', color: 0xff5c41, secondaryColor: 0xff0a1e,
      start: altar, end: underside, count: 72, radius: 0.96, turns: TAU * 2.1, period: 2.8, size: 0.56 });
    L.blood(root, motion, { name: 'Sacrificial altar blood eruption',
      start: altar, end: underside, burst: true, period, offset: -3.75,
      duration: 1.45, count: 48, radius: 1.55, lift: 1.85, size: 1.35, seed: 991 });
    L.waves(root, motion, { name: 'Core absorption pulse across the altar', color: 0xff5136,
      emitters: [{ start: altar, end: altar }], period, offset: -3.75,
      copies: 3, travel: 2.35, from: 0.8, to: 4.18, power: 0.82 });
    L.schedule(motion, t => {
      const charge = 0.5 - Math.cos(t / period * TAU) * 0.5;
      const absorption = L.pulse(t, period, 0.55 - 3.75);
      e.assembly.rotation.y = 0.3 + Math.sin(t * 0.13) * 0.32;
      e.assembly.rotation.x = -0.17 + Math.sin(t * 0.1) * 0.07;
      e.iris.uniforms.uTime.value = t;
      e.iris.uniforms.uPulse.value = absorption;
      intake.set(0, 0, 2.65).applyQuaternion(e.assembly.quaternion).add(e.assembly.position);
      underside.set(0, -2.66, 0).applyQuaternion(e.assembly.quaternion).add(e.assembly.position);
      channels.forEach((channel, i) => {
        actorPoint(attendant, attendant.userData.rig.grips[i].position, palms[i]);
        channel.ray.userData.aim(intake, palms[i], t, 0.28 + charge * 0.62);
        channel.data.material.uniforms.uPower.value = 0.5 + charge * 0.70;
      });
      shaft.userData.aim(underside, altar, t, 0.35 + absorption * 0.65);
      orbitA.rotation.set(0.4 + charge * 0.08, t * 0.10, 0.22 + absorption * 0.04);
      orbitB.rotation.set(Math.PI / 2 + Math.sin(t * 0.1) * 0.15, -0.5, -t * 0.16);
    });
  }

  function build(id){
    if (!M) throw new Error('Create the material library before building models.');
    const c = APP.DATA.byId(id);
    const root = group(null, c.title);
    const motion = [];
    root.userData.characters = [];
    const radius = id === 0 ? 8.2 : id === 2 ? 7.65 : 7.2;
    foundation(root, radius, 700 + id * 89, M.accents[id]);
    const builders = { 0: core, 1: surveillance, 2: auction, 3: identities, 4: chorus, 5: abandoned };
    builders[id](root, M.accents[id], motion);
    bake(root);
    root.userData.circuit = id;
    root.userData.radius = radius;
    root.userData.top = id === 0 ? 25.4 : id === 3 ? 9.5 : 8.8;
    root.userData.motion = motion;
    return root;
  }

  return { createMaterials, build, bake, group, mesh, box, cylinder, sphere, ring, rod, tube, glow,
    get materials(){ return M; } };
})();
