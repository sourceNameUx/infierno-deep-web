/* creatures.js — phone-bats and surveillance moths inhabit the digital ruins. */
window.APP = window.APP || {};

APP.CREATURES = (function(){
  'use strict';

  function screenTexture(tint){
    const canvas = APP.TEX.paint(128, 256, (g, w, h) => {
      g.fillStyle = '#06121d'; g.fillRect(0, 0, w, h);
      const glow = g.createRadialGradient(64, 112, 5, 64, 112, 110);
      glow.addColorStop(0, tint + '70'); glow.addColorStop(1, tint + '00');
      g.fillStyle = glow; g.fillRect(0, 0, w, h);
      g.fillStyle = tint;
      // Pixel eyes, a battery indicator, and a home bar read as a haunted phone.
      g.beginPath(); g.moveTo(19, 90); g.lineTo(53, 101); g.lineTo(53, 121); g.lineTo(19, 114); g.fill();
      g.beginPath(); g.moveTo(109, 90); g.lineTo(75, 101); g.lineTo(75, 121); g.lineTo(109, 114); g.fill();
      g.fillRect(42, 144, 9, 6); g.fillRect(59, 149, 9, 6); g.fillRect(76, 144, 9, 6);
      g.fillRect(98, 16, 16, 7); g.fillRect(115, 18, 3, 3);
      for (let i = 0; i < 4; i++) g.fillRect(12 + i * 5, 25 - i * 3, 3, 3 + i * 3);
      g.font = 'bold 12px monospace'; g.textAlign = 'center'; g.fillText('NO SIGNAL', 64, 199);
      g.fillStyle = '#b4d2dd'; g.fillRect(43, 240, 42, 3);
      g.fillStyle = '#00000035';
      for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 1);
    });
    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.sRGBEncoding;
    return texture;
  }

  function wing(parent, sign, materials, insect){
    const B = APP.MODELS;
    const pivot = B.group(parent, 'Articulated circuit wing', sign * (insect ? 1.25 : 1.05), 0.45, 0);
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    if (insect){
      shape.bezierCurveTo(1.5, 2.0, 4.4, 2.5, 5.0, 1.4);
      shape.bezierCurveTo(5.2, 0.4, 2.4, -0.4, 0, 0);
    } else {
      shape.lineTo(1.6, 1.9); shape.lineTo(4.8, 1.05);
      shape.quadraticCurveTo(3.1, 0.6, 3.6, -1.5);
      shape.quadraticCurveTo(2.0, -0.6, 1.8, -2.0);
      shape.quadraticCurveTo(0.8, -0.6, 0, -0.8);
    }
    shape.closePath();
    const membrane = new THREE.ShapeGeometry(shape, 10);
    if (sign < 0) membrane.scale(-1, 1, 1);
    B.mesh(pivot, membrane, materials.membrane);
    const tips = insect ? [[4.8, 1.4], [3.2, 0.35], [2.2, 1.8]] : [[1.6, 1.9], [4.8, 1.05], [3.6, -1.5], [1.8, -2.0]];
    tips.forEach(([x, y]) => {
      B.rod(pivot, new THREE.Vector3(0, 0, 0.035), new THREE.Vector3(x * sign, y, 0.035), 0.027, materials.trace);
      B.sphere(pivot, 0.065, materials.trace, x * sign, y, 0.035, 8);
    });
    pivot.traverse(object => { if (object.isMesh) object.castShadow = object.receiveShadow = false; });
    B.bake(pivot);
    return pivot;
  }

  function phone(materials, screen){
    const B = APP.MODELS;
    const root = B.group(null, 'Phone-bat');
    root.userData.kind = 'phone-bat';
    const body = B.group(root, 'Haunted handset');
    B.box(body, 2.35, 4.4, 0.42, materials.shell);
    B.box(body, 2.15, 4.17, 0.08, materials.dark, 0, 0, 0.24);
    B.mesh(body, new THREE.PlaneGeometry(1.94, 3.85), screen, 0, 0, 0.291);
    B.box(body, 0.65, 0.12, 0.035, materials.dark, 0, 1.82, 0.32);
    B.sphere(body, 0.065, materials.lens, 0.45, 1.84, 0.33, 8);
    B.box(body, 0.09, 0.5, 0.17, materials.trace, 1.2, 0.55, 0);
    B.tube(body, [new THREE.Vector3(0, -2.2, 0), new THREE.Vector3(0.2, -2.8, 0),
      new THREE.Vector3(-0.25, -3.3, 0), new THREE.Vector3(0.1, -3.8, 0)], 0.065, materials.dark, 12);
    B.box(body, 0.34, 0.46, 0.18, materials.shell, 0.1, -3.95, 0);
    B.box(body, 0.21, 0.13, 0.12, materials.trace, 0.1, -4.2, 0);
    const wings = [-1, 1].map(sign => wing(root, sign, materials, false));
    body.traverse(object => { if (object.isMesh) object.castShadow = object.receiveShadow = false; });
    B.bake(body);
    return { root, wings };
  }

  function cameraMoth(materials){
    const B = APP.MODELS;
    const root = B.group(null, 'Surveillance moth');
    root.userData.kind = 'camera-moth';
    const body = B.group(root, 'Flying camera');
    B.box(body, 3.0, 1.85, 1.05, materials.shell);
    B.box(body, 1.1, 0.5, 0.65, materials.dark, 0, 1.1, 0);
    const housing = B.cylinder(body, 0.91, 0.96, 0.7, materials.dark, 0, 0, 0.75, 20);
    housing.rotation.x = Math.PI / 2;
    B.ring(body, 0.72, 0.07, materials.trace, 0, 0, 1.12);
    B.mesh(body, new THREE.CircleGeometry(0.65, 24), materials.lens, 0, 0, 1.13);
    B.mesh(body, new THREE.CircleGeometry(0.27, 16), materials.dark, 0, 0, 1.15);
    B.sphere(body, 0.10, materials.trace, -0.22, 0.27, 1.18, 8);
    B.box(body, 0.47, 0.25, 0.08, materials.trace, 1.0, 0.55, 0.57);
    [-1, 1].forEach(sign => {
      B.rod(body, new THREE.Vector3(sign * 0.8, 0.95, 0), new THREE.Vector3(sign * 1.45, 2.15, 0), 0.045, materials.shell);
      B.sphere(body, 0.13, materials.trace, sign * 1.45, 2.15, 0, 8);
      B.rod(body, new THREE.Vector3(sign * 0.8, -0.8, 0), new THREE.Vector3(sign * 1.5, -1.5, 0.35), 0.045, materials.dark);
    });
    const wings = [-1, 1].map(sign => wing(root, sign, materials, true));
    body.traverse(object => { if (object.isMesh) object.castShadow = object.receiveShadow = false; });
    B.bake(body);
    return { root, wings };
  }

  function create(scene, camera, motions, smallDevice){
    // Portrait framing moves the camera farther away; keep the small flock readable.
    const fog = !smallDevice;
    const shell = new THREE.MeshStandardMaterial({ color: 0x8598b3, metalness: 0.72, roughness: 0.34, fog });
    const dark = new THREE.MeshStandardMaterial({ color: 0x10121e, metalness: 0.4, roughness: 0.48, fog });
    const makeMaterials = (color, insect) => ({
      shell, dark,
      trace: new THREE.MeshBasicMaterial({ color, toneMapped: false, fog }),
      lens: new THREE.MeshBasicMaterial({ color: insect ? 0xff493a : color, toneMapped: false, fog }),
      membrane: new THREE.MeshStandardMaterial({ color: insect ? 0x34636e : 0x452044,
        emissive: color, emissiveIntensity: insect ? 0.18 : 0.10, roughness: 0.58,
        metalness: 0.2, side: THREE.DoubleSide, fog })
    });
    const cyan = makeMaterials(0x67e0f1, false), rose = makeMaterials(0xf48ac0, false);
    const insect = makeMaterials(0xe4b66c, true);
    const screen = tint => new THREE.MeshBasicMaterial({ map: screenTexture(tint), toneMapped: false, fog });
    const cyanScreen = screen('#73e9ff'), roseScreen = screen('#ff8cbd');
    const flock = [
      { ...phone(cyan, cyanScreen), home: smallDevice ? [-30, 41, 14] : [-36, 22, 18], size: smallDevice ? 1.8 : 1.1, phase: 0.4 },
      { ...phone(rose, roseScreen), home: smallDevice ? [28, 43, 11] : [37, 24, 15], size: smallDevice ? 1.65 : 0.95, phase: 2.6 },
      { ...cameraMoth(insect), home: smallDevice ? [14, 0, 56] : [18, 10, 46], size: smallDevice ? 1.6 : 0.88, phase: 1.7 }
    ];
    if (!smallDevice){
      flock.push({ ...phone(cyan, cyanScreen), home: [10, 38, -15], size: 0.75, phase: 4.2 });
      flock.push({ ...cameraMoth(insect), home: [-20, 10, 43], size: 0.73, phase: 5.4 });
    }
    flock.forEach((creature, index) => {
      const { root, wings, home, size, phase } = creature;
      root.scale.setScalar(size);
      scene.add(root);
      motions.push(time => {
        const path = time * (0.13 + index * 0.014) + phase;
        root.position.set(home[0] + Math.sin(path) * 5.2,
          home[1] + Math.sin(path * 1.7) * 1.7, home[2] + Math.cos(path) * 3.3);
        root.lookAt(camera.position);
        root.rotateZ(Math.sin(path) * 0.16);
        const flap = Math.sin(time * (root.userData.kind === 'phone-bat' ? 3.7 : 7.5) + phase);
        wings.forEach((pivot, side) => {
          const sign = side ? 1 : -1;
          pivot.rotation.y = sign * (0.24 + flap * 0.65);
          pivot.rotation.z = sign * (0.06 + flap * 0.10);
        });
      });
    });
  }

  return { create };
})();
