/* life.js — articulated anatomical figures and local, clock-driven circuit effects. */
window.APP = window.APP || {};

APP.LIFE = (function(){
  'use strict';

  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const UP = V(0, 1, 0), FRONT = V(0, 0, 1);
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const phase = (time, period) => ((time % period) + period) % period;
  let bodyGeometry, baseActorMat, featureGeoCache;

  function getFeatureGeo(key, make){
    if (!featureGeoCache) featureGeoCache = new Map();
    if (!featureGeoCache.has(key)) featureGeoCache.set(key, make());
    return featureGeoCache.get(key);
  }

  function schedule(motion, update){
    let previous = -1;
    const tick = time => {
      if (time === previous) return;
      previous = time;
      update(time);
    };
    motion.push(tick);
    return tick;
  }

  function pulse(time, period = 3.6, offset = 0){
    const age = phase(time + offset, period);
    return Math.exp(-Math.pow((age - 0.55) / 0.27, 2));
  }

  function getBaseActorMaterial(){
    if (!baseActorMat){
      const stone = APP.MODELS && APP.MODELS.materials ? APP.MODELS.materials.stone : null;
      baseActorMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.62,
        metalness: 0.08,
        normalMap: stone ? stone.normalMap : null,
        normalScale: new THREE.Vector2(0.22, 0.22)
      });
    }
    return baseActorMat;
  }

  function buildHeadFeatures(headGroup, profile, isHologram, holoMat){
    const B = APP.MODELS;
    const skinMat = isHologram ? holoMat : new THREE.MeshStandardMaterial({
      color: profile.skin || 0xd2b6ac, roughness: 0.54, metalness: 0.06
    });
    const darkMat = isHologram ? holoMat : (B.materials ? B.materials.dark : skinMat);
    const hairMat = isHologram ? holoMat : new THREE.MeshStandardMaterial({
      color: profile.hairColor || 0x1c1614, roughness: 0.85, metalness: 0.05
    });

    if (!profile.faceless){
      // Brow ridge, nose bridge, cheekbones, and sculpted jaw
      const brow = new THREE.Mesh(getFeatureGeo('brow', () => new THREE.BoxGeometry(0.23, 0.042, 0.08)), skinMat);
      brow.position.set(0, 0.065, 0.155);
      headGroup.add(brow);

      const nose = new THREE.Mesh(getFeatureGeo('nose', () => new THREE.ConeGeometry(0.034, 0.11, 6)), skinMat);
      nose.position.set(0, 0.005, 0.205);
      nose.rotation.x = Math.PI * 0.42;
      headGroup.add(nose);

      // Deep eye sockets + eyeballs
      const eyeMat = isHologram ? holoMat : new THREE.MeshBasicMaterial({
        color: profile.eyeGlow || 0x150a0c
      });
      for (const side of [-1, 1]){
        const socket = new THREE.Mesh(getFeatureGeo('socket', () => new THREE.SphereGeometry(0.036, 8, 6)), darkMat);
        socket.position.set(side * 0.064, 0.032, 0.165);
        socket.scale.set(1.1, 0.85, 0.6);
        headGroup.add(socket);

        const pupil = new THREE.Mesh(getFeatureGeo('pupil', () => new THREE.SphereGeometry(0.022, 8, 6)), eyeMat);
        pupil.position.set(side * 0.064, 0.032, 0.182);
        headGroup.add(pupil);

        const ear = new THREE.Mesh(getFeatureGeo('ear', () => new THREE.SphereGeometry(0.038, 8, 6)), skinMat);
        ear.position.set(side * 0.175, 0.01, -0.01);
        ear.scale.set(0.45, 1.15, 0.7);
        headGroup.add(ear);
      }

      // Sunken mouth / grimace crease
      const mouth = new THREE.Mesh(getFeatureGeo('mouth', () => new THREE.BoxGeometry(0.095, 0.022, 0.04)), darkMat);
      mouth.position.set(0, -0.085, 0.168);
      headGroup.add(mouth);
    }

    if (profile.beard && !isHologram){
      const beard = new THREE.Mesh(getFeatureGeo('beard', () => new THREE.SphereGeometry(0.155, 12, 8)), hairMat);
      beard.position.set(0, -0.085, 0.045);
      beard.scale.set(0.96, 0.92, 1.05);
      headGroup.add(beard);
    }

    const hairStyle = profile.hair || 'short';
    if (hairStyle === 'short'){
      const cap = new THREE.Mesh(getFeatureGeo('hair-short', () => new THREE.SphereGeometry(0.192, 14, 10)), hairMat);
      cap.position.set(0, 0.055, -0.018);
      cap.scale.set(0.98, 1.08, 1.05);
      headGroup.add(cap);
    } else if (hairStyle === 'messy'){
      const cap = new THREE.Mesh(getFeatureGeo('hair-messy', () => new THREE.DodecahedronGeometry(0.205, 1)), hairMat);
      cap.position.set(0, 0.065, -0.015);
      cap.scale.set(0.98, 1.12, 1.08);
      headGroup.add(cap);
    } else if (hairStyle === 'hood'){
      const hoodMat = isHologram ? holoMat : new THREE.MeshStandardMaterial({
        color: profile.top || 0x161922, roughness: 0.88, metalness: 0.08, side: THREE.DoubleSide
      });
      const hood = new THREE.Mesh(getFeatureGeo('hood', () => new THREE.SphereGeometry(0.235, 14, 12)), hoodMat);
      hood.position.set(0, 0.02, -0.025);
      hood.scale.set(1.02, 1.22, 1.15);
      headGroup.add(hood);
    } else if (hairStyle === 'slick'){
      const cap = new THREE.Mesh(getFeatureGeo('hair-slick', () => new THREE.SphereGeometry(0.19, 14, 10)), hairMat);
      cap.position.set(0, 0.07, -0.03);
      cap.scale.set(0.94, 1.05, 1.14);
      headGroup.add(cap);
    }
  }

  function buildHandFeatures(gripGroup, sideSign, profile, isHologram, holoMat){
    const skinMat = isHologram ? holoMat : new THREE.MeshStandardMaterial({
      color: profile.skin || 0xd2b6ac, roughness: 0.58, metalness: 0.06
    });
    const fingerGeo = getFeatureGeo('finger', () => new THREE.CylinderGeometry(0.014, 0.011, 0.095, 6));
    for (let f = 0; f < 4; f++){
      const finger = new THREE.Mesh(fingerGeo, skinMat);
      const spread = (f - 1.5) * 0.024;
      finger.position.set(spread, -0.055, 0.025);
      finger.rotation.x = 0.38 + f * 0.06;
      gripGroup.add(finger);
    }
    const thumb = new THREE.Mesh(fingerGeo, skinMat);
    thumb.position.set(-sideSign * 0.052, -0.025, 0.035);
    thumb.rotation.set(0.35, 0, sideSign * 0.65);
    gripGroup.add(thumb);
  }

  function actor(parent, material, x, y, z, seated = false, customProfile = null){
    const root = APP.MODELS.group(parent, 'Articulated adult silhouette', x, y, z);
    root.userData.dynamic = true;
    root.userData.actor = true;

    const isHologram = !!(material && material.isShaderMaterial);
    const isDark = !isHologram && material && material.color && material.color.r < 0.25;
    const profile = Object.assign({
      build: 'normal',
      skin: isDark ? 0x9b8e8a : 0xd4b8ae,
      top: isDark ? 0x11151e : 0x262d38,
      bottom: isDark ? 0x0c0f16 : 0x1b2029,
      shoes: 0x0e1015,
      hair: isDark ? 'hood' : 'short',
      hairColor: 0x1a1412,
      bareChest: false,
      bareFeet: false,
      faceless: false
    }, customProfile || {});

    if (!bodyGeometry){
      bodyGeometry = new THREE.SphereGeometry(1, 16, 12);
    }
    const instMat = isHologram ? material : getBaseActorMaterial();
    const SEGMENT_COUNT = 30;
    const body = new THREE.InstancedMesh(bodyGeometry, instMat, SEGMENT_COUNT);
    body.name = 'Articulated anatomical segments';
    body.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    body.castShadow = !instMat.transparent;
    body.receiveShadow = !instMat.transparent;
    body.frustumCulled = false;
    body.renderOrder = instMat.transparent ? 1 : 0;
    root.add(body);

    const cSkin = new THREE.Color(profile.skin);
    const cTop = new THREE.Color(profile.bareChest ? profile.skin : profile.top);
    const cWaist = new THREE.Color(profile.bareChest ? profile.skin : profile.top).multiplyScalar(0.88);
    const cBottom = new THREE.Color(profile.bottom);
    const cShoes = new THREE.Color(profile.bareFeet ? profile.skin : profile.shoes);
    const cJoint = new THREE.Color(profile.skin).multiplyScalar(0.92);

    const widthMul = profile.build === 'broad' ? 1.18 : profile.build === 'gaunt' ? 0.82 : profile.build === 'tall' ? 0.88 : 1.0;
    const limbMul = profile.build === 'broad' ? 1.15 : profile.build === 'gaunt' ? 0.78 : profile.build === 'tall' ? 0.86 : 1.0;

    const hipHeight = seated ? 0.80 : 1.05;
    const shoulderHeight = seated ? 1.31 : 1.81;
    const headHeight = seated ? 1.60 : 2.10;
    const rig = {
      lean: 0, turn: 0, roll: 0, nod: 0, look: 0, crouch: 0, breath: 0, shake: 0,
      hands: [-1, 1].map(sign => V(sign * 0.36, seated ? 0.96 : 1.04, seated ? 0.54 : 0.10)),
      feet: [-1, 1].map(sign => V(sign * 0.20, 0.09, seated ? 0.63 : 0)),
      head: APP.MODELS.group(root, 'Head attachment'),
      chest: APP.MODELS.group(root, 'Chest attachment'),
      grips: [-1, 1].map(() => APP.MODELS.group(root, 'Hand attachment'))
    };

    buildHeadFeatures(rig.head, profile, isHologram, material);
    for (let side = 0; side < 2; side++){
      buildHandFeatures(rig.grips[side], side ? 1 : -1, profile, isHologram, material);
    }

    const dummy = new THREE.Object3D(), rotation = new THREE.Quaternion();
    const headRotation = new THREE.Quaternion(), euler = new THREE.Euler();
    const hip = V(), center = V(), waist = V(), shoulder = V(), knee = V(), elbow = V();
    const end = V(), axis = V(), pole = V(), delta = V();
    let index = 0, shakePhase = 0, colorsAssigned = false;

    function upperPoint(out, px, py, pz){
      return out.set(px, py - hipHeight, pz).applyQuaternion(rotation).add(hip);
    }
    function ellipsoid(position, sx, sy, sz, orientation, col){
      dummy.position.copy(position);
      if (orientation) dummy.quaternion.copy(orientation); else dummy.quaternion.identity();
      dummy.scale.set(sx, sy, sz);
      dummy.updateMatrix();
      if (!colorsAssigned && !isHologram && col) body.setColorAt(index, col);
      body.setMatrixAt(index++, dummy.matrix);
    }
    function segment(a, b, rTop, rBot, col){
      delta.subVectors(b, a);
      const length = Math.max(0.001, delta.length());
      dummy.quaternion.setFromUnitVectors(UP, delta.multiplyScalar(1 / length));
      dummy.position.copy(a).add(b).multiplyScalar(0.5);
      const rMid = (rTop + rBot) * 0.5;
      dummy.scale.set(rMid, length * 0.5 + rMid * 0.18, rMid * 0.94);
      dummy.updateMatrix();
      if (!colorsAssigned && !isHologram && col) body.setColorAt(index, col);
      body.setMatrixAt(index++, dummy.matrix);
    }
    // Two-bone IK keeps hands on props while shoulders and heads react.
    function joint(origin, target, first, second, bend, out){
      axis.subVectors(target, origin);
      const rawDistance = axis.length();
      if (rawDistance < 0.0001) axis.copy(UP); else axis.multiplyScalar(1 / rawDistance);
      const distance = clamp(rawDistance, Math.abs(first - second) + 0.001, first + second - 0.001);
      end.copy(origin).addScaledVector(axis, distance);
      const along = (first * first - second * second + distance * distance) / (2 * distance);
      pole.copy(bend).addScaledVector(axis, -bend.dot(axis));
      if (pole.lengthSq() < 0.0001) pole.copy(FRONT).addScaledVector(axis, -FRONT.dot(axis));
      pole.normalize();
      out.copy(origin).addScaledVector(axis, along)
        .addScaledVector(pole, Math.sqrt(Math.max(0, first * first - along * along)));
    }
    const bend = V(), target = V();
    rig.update = () => {
      index = 0;
      shakePhase += 0.73;
      const tremorX = rig.shake ? Math.sin(shakePhase * 19.0) * rig.shake * 0.045 : 0;
      const tremorZ = rig.shake ? Math.cos(shakePhase * 23.0) * rig.shake * 0.035 : 0;
      hip.set(tremorX, hipHeight - rig.crouch, tremorZ);
      rotation.setFromEuler(euler.set(rig.lean, rig.turn, rig.roll));

      // 1-2: Upper Ribcage & Tapered Waist/Abdomen
      upperPoint(center, 0, seated ? 1.14 : 1.58, 0);
      rig.chest.position.copy(center);
      rig.chest.quaternion.copy(rotation);
      ellipsoid(center, (0.31 + rig.breath * 0.012) * widthMul, seated ? 0.25 : 0.31, 0.205 * widthMul, rotation, cTop);

      upperPoint(waist, 0, seated ? 0.96 : 1.29, -0.01);
      ellipsoid(waist, (0.235 + rig.breath * 0.008) * widthMul, seated ? 0.19 : 0.24, 0.175 * widthMul, rotation, cWaist);

      // 3-4: Sculpted Pectoral / Chest muscles
      for (const sign of [-1, 1]){
        upperPoint(center, sign * 0.115 * widthMul, seated ? 1.18 : 1.63, 0.085);
        ellipsoid(center, 0.125 * widthMul, 0.115, 0.11, rotation, cTop);
      }

      // 5: Pelvis / Hips
      ellipsoid(hip, 0.255 * widthMul, 0.165, 0.205 * widthMul, rotation, cBottom);

      // 6: Neck & Trapezius column
      upperPoint(center, 0, headHeight - 0.22, -0.01);
      ellipsoid(center, 0.088 * limbMul, 0.15, 0.092 * limbMul, rotation, cSkin);

      // 7-8: Cranium + Sculpted Jaw/Chin
      upperPoint(rig.head.position, 0, headHeight, 0);
      headRotation.setFromEuler(euler.set(rig.nod + tremorZ * 1.4, rig.look + tremorX * 1.8, tremorX * 0.9)).premultiply(rotation);
      rig.head.quaternion.copy(headRotation);
      ellipsoid(rig.head.position, 0.168, 0.215, 0.195, headRotation, cSkin);
      center.set(0, -0.095, 0.035).applyQuaternion(headRotation).add(rig.head.position);
      ellipsoid(center, 0.122, 0.135, 0.145, headRotation, cSkin);

      // 9-20: Left & Right Arms (Deltoid cap, Upper arm, Elbow, Forearm, Wrist, Palm) -> 6 * 2 = 12 segments
      for (let side = 0; side < 2; side++){
        const sign = side ? 1 : -1;
        upperPoint(shoulder, sign * 0.315 * widthMul, shoulderHeight, 0);
        // Deltoid cap
        ellipsoid(shoulder, 0.115 * limbMul, 0.125 * limbMul, 0.11 * limbMul, rotation, cTop);

        bend.set(sign * 0.85, -0.28, -0.10);
        joint(shoulder, rig.hands[side], 0.41, 0.40, bend, elbow);
        rig.grips[side].position.copy(end);
        // Orient hand grip along forearm direction
        delta.subVectors(end, elbow);
        if (delta.lengthSq() > 0.0001){
          rig.grips[side].quaternion.setFromUnitVectors( new THREE.Vector3(0, -1, 0), delta.clone().normalize() );
        }
        // Upper arm (clothed or bare)
        segment(shoulder, elbow, 0.094 * limbMul, 0.078 * limbMul, cTop);
        // Elbow joint
        ellipsoid(elbow, 0.078 * limbMul, 0.078 * limbMul, 0.078 * limbMul, null, cJoint);
        // Forearm (muscular taper, exposed skin)
        segment(elbow, end, 0.078 * limbMul, 0.058 * limbMul, cSkin);
        // Wrist
        ellipsoid(end, 0.056 * limbMul, 0.052 * limbMul, 0.052 * limbMul, null, cSkin);
        // Sculpted Palm
        center.copy(end).addScaledVector(delta.normalize(), 0.045);
        ellipsoid(center, 0.068 * limbMul, 0.082 * limbMul, 0.038 * limbMul, rig.grips[side].quaternion, cSkin);
      }

      // 21-30: Left & Right Legs (Thigh, Knee, Calf, Ankle, Foot/Boot) -> 5 * 2 = 10 segments
      for (let side = 0; side < 2; side++){
        const sign = side ? 1 : -1;
        shoulder.set(sign * 0.165 * widthMul + tremorX * 0.5, hip.y, tremorZ * 0.5);
        target.copy(rig.feet[side]);
        bend.set(sign * 0.08, 0, 1);
        joint(shoulder, target, seated ? 0.57 : 0.50, seated ? 0.65 : 0.49, bend, knee);
        // Thigh
        segment(shoulder, knee, 0.125 * limbMul, 0.095 * limbMul, cBottom);
        // Knee patella
        ellipsoid(knee, 0.096 * limbMul, 0.098 * limbMul, 0.096 * limbMul, null, cBottom);
        // Calf / Shin
        segment(knee, end, 0.094 * limbMul, 0.068 * limbMul, profile.bareFeet ? cSkin : cBottom);
        // Ankle
        ellipsoid(end, 0.068 * limbMul, 0.068 * limbMul, 0.068 * limbMul, null, cShoes);
        // Sculpted Boot / Foot
        center.copy(end); center.z += 0.095; center.y -= 0.015;
        ellipsoid(center, 0.105 * limbMul, 0.072, 0.215, null, cShoes);
      }

      if (!colorsAssigned && !isHologram && body.instanceColor){
        body.instanceColor.needsUpdate = true;
        colorsAssigned = true;
      }
      body.instanceMatrix.needsUpdate = true;
    };
    root.userData.rig = rig;
    rig.update();
    return root;
  }

  function animate(figure, motion, pose){
    return schedule(motion, time => {
      pose(time, figure.userData.rig);
      figure.userData.rig.update();
      figure.userData.poseTime = time;
    });
  }

  // Trigger once when the animation crosses a cue, never on every recoil frame.
  // Skip stale cues after offscreen culling; paused poses produce no new sounds.
  function vocal(figure, motion, circuit, options){
    let previous = null;
    return schedule(motion, time => {
      const clock = time + (options.offset || 0);
      const cycle = Math.floor((clock - options.at) / options.period);
      const crossed = previous !== null && cycle !== Math.floor((previous - options.at) / options.period);
      const timely = previous !== null && clock > previous && clock - previous <= 0.25;
      previous = clock;
      if (crossed && timely && APP.AUDIO) APP.AUDIO.character(options.kind || 'pain', figure, circuit, options.level === undefined ? 1 : options.level);
    });
  }

  function hologram(color, opacity = 0.45){
    return new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(color).convertSRGBToLinear() },
        uTime: { value: 0 }, uOpacity: { value: opacity }, uDissolve: { value: 0 } },
      vertexShader: `varying vec3 vLocal;varying vec3 vNormal;varying vec3 vView;
        void main(){vec4 p=vec4(position,1.0);vec3 n=normal;
          #ifdef USE_INSTANCING
            mat3 im=mat3(instanceMatrix);
            n/=vec3(dot(im[0],im[0]),dot(im[1],im[1]),dot(im[2],im[2]));
            n=im*n;p=instanceMatrix*p;
          #endif
          vLocal=p.xyz;vec4 mv=modelViewMatrix*p;vView=-mv.xyz;
          vNormal=normalize(normalMatrix*n);gl_Position=projectionMatrix*mv;}`,
      fragmentShader: `uniform vec3 uColor;uniform float uTime;uniform float uOpacity;uniform float uDissolve;
        varying vec3 vLocal;varying vec3 vNormal;varying vec3 vView;
        void main(){float rim=pow(1.0-abs(dot(normalize(vNormal),normalize(vView))),1.5);
          float lines=0.58+0.42*smoothstep(0.15,0.85,0.5+0.5*sin(vLocal.y*92.0-uTime*2.4));
          float grain=fract(sin(dot(floor(vLocal*36.0),vec3(12.989,78.233,45.164)))*43758.5453);
          float threshold=uDissolve*2.9-0.3;
          float reveal=smoothstep(threshold,threshold+0.18,vLocal.y+grain*0.14);
          float edgeBurn=smoothstep(threshold,threshold+0.06,vLocal.y+grain*0.14)*(1.0-smoothstep(threshold+0.06,threshold+0.22,vLocal.y+grain*0.14));
          float scan=exp(-pow((vLocal.y-fract(uTime*0.22)*2.5)*14.0,2.0));
          vec3 col=uColor*(0.76+rim*0.95+scan*0.65)+vec3(0.95,0.12,0.18)*edgeBurn*2.2;
          gl_FragColor=vec4(col,uOpacity*lines*(0.48+rim*0.58)*reveal);
          #include <encodings_fragment>
        }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false
    });
  }

  function waves(parent, motion, options){
    const emitters = options.emitters, copies = options.copies || 2;
    const material = new THREE.MeshBasicMaterial({ color: options.color, transparent: true,
      opacity: options.opacity === undefined ? 0.68 : options.opacity,
      blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false });
    const mesh = new THREE.InstancedMesh(new THREE.TorusGeometry(1, options.thickness || 0.032, 10, 64), material, emitters.length * copies);
    mesh.name = options.name || 'Propagating signal waves';
    mesh.userData.dynamic = true; mesh.userData.effect = 'waves';
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false; mesh.renderOrder = 2;
    parent.add(mesh);
    const dummy = new THREE.Object3D(), color = new THREE.Color(), normal = V();
    schedule(motion, time => {
      emitters.forEach((emitter, emitterIndex) => {
        normal.subVectors(emitter.end, emitter.start);
        if (normal.lengthSq() < 0.0001) normal.copy(emitter.normal || UP);
        dummy.quaternion.setFromUnitVectors(FRONT, normal.normalize());
        for (let copy = 0; copy < copies; copy++){
          const age = phase(time + (options.offset === undefined ? 0.9 : options.offset) - (emitter.delay || 0) - copy * (options.spacing || 0.27), options.period || 3.6);
          const life = age / (options.travel || 1.8);
          const progress = clamp(life, 0, 1);
          const ease = 1 - Math.pow(1 - progress, 1.6);
          const radius = (options.from || 0.5) + ((options.to || 1.7) - (options.from || 0.5)) * ease;
          dummy.position.lerpVectors(emitter.start, emitter.end, progress);
          dummy.scale.setScalar(life < 1 ? radius : 0.001);
          dummy.updateMatrix();
          const index = emitterIndex * copies + copy;
          mesh.setMatrixAt(index, dummy.matrix);
          const glow = Math.pow(Math.max(0, Math.sin(progress * Math.PI)), 0.55) * (options.power || 1);
          color.setRGB(glow, glow, glow);
          mesh.setColorAt(index, color);
        }
      });
      mesh.instanceMatrix.needsUpdate = mesh.instanceColor.needsUpdate = true;
      mesh.userData.effectTime = time;
    });
    return mesh;
  }

  function beam(parent, color, radius = 0.7){
    const material = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(color).convertSRGBToLinear() }, uTime: { value: 0 }, uPower: { value: 1 } },
      vertexShader: `varying vec2 vUv;varying vec3 vNormal;varying vec3 vView;
        void main(){vUv=uv;vec4 mv=modelViewMatrix*vec4(position,1.0);
          vNormal=normalize(normalMatrix*normal);vView=-mv.xyz;gl_Position=projectionMatrix*mv;}`,
      fragmentShader: `uniform vec3 uColor;uniform float uTime;uniform float uPower;
        varying vec2 vUv;varying vec3 vNormal;varying vec3 vView;
        void main(){float body=pow(abs(dot(normalize(vNormal),normalize(vView))),1.4);
          float ends=smoothstep(0.0,0.14,vUv.y)*(1.0-smoothstep(0.84,1.0,vUv.y));
          float signal=0.68+0.32*sin(vUv.y*42.0-uTime*5.2);
          float pulseBand=exp(-pow(fract(vUv.y*2.0-uTime*0.85)-0.5,2.0)*28.0);
          vec3 col=uColor*(1.45+pulseBand*0.9);
          gl_FragColor=vec4(col,(0.045+body*0.22+pulseBand*0.09)*ends*signal*uPower);
          #include <encodings_fragment>
        }`,
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, toneMapped: false
    });
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 1, 1, 28, 1, true), material);
    mesh.name = 'Tracking scan volume';
    mesh.userData.dynamic = true; mesh.userData.effect = 'beam'; mesh.renderOrder = 2;
    mesh.frustumCulled = false;
    parent.add(mesh);
    const direction = V();
    mesh.userData.aim = (start, end, time, power = 1) => {
      direction.subVectors(start, end);
      const length = Math.max(0.001, direction.length());
      mesh.position.copy(start).add(end).multiplyScalar(0.5);
      mesh.quaternion.setFromUnitVectors(UP, direction.multiplyScalar(1 / length));
      mesh.scale.set(radius, length, radius);
      material.uniforms.uTime.value = time; material.uniforms.uPower.value = power;
      mesh.userData.effectTime = time;
    };
    return mesh;
  }

  function stream(parent, motion, options){
    const small = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 700;
    const baseCount = (options.count || 48) * 1.9;
    const count = Math.max(24, Math.round(baseCount * (small ? 0.6 : 1)));
    const random = APP.TEX.rng(options.seed || 482);
    const seeds = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) seeds.set([i / count, random(), random()], i * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3));
    const secondary = options.secondaryColor || 0xff1e38;
    const uniforms = {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(options.color).convertSRGBToLinear() },
      uColor2: { value: new THREE.Color(secondary).convertSRGBToLinear() },
      uStart: { value: options.start }, uEnd: { value: options.end },
      uRadius: { value: options.radius || 0.45 }, uLift: { value: options.lift || 0 },
      uTurns: { value: options.turns || 0 }, uPeriod: { value: options.period || 4 },
      uBurst: { value: options.burst ? 1 : 0 }, uSize: { value: (options.size || 0.85) * 1.55 },
      uPixelRatio: { value: 1 },
      uOffset: { value: options.offset || 0 }, uDuration: { value: options.duration || 1.4 },
      uPower: { value: options.power === undefined ? 1 : options.power }
    };
    const material = new THREE.ShaderMaterial({
      uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
      vertexShader: `attribute vec3 aSeed;uniform float uTime;uniform vec3 uStart;uniform vec3 uEnd;
        uniform float uRadius;uniform float uLift;uniform float uTurns;uniform float uPeriod;
        uniform float uBurst;uniform float uSize;uniform float uPixelRatio;uniform float uOffset;uniform float uDuration;
        varying float vAge;varying float vSeed;varying float vVisible;varying float vSpark;
        void main(){
          float age=fract((uTime+uOffset)/uPeriod+aSeed.x);
          vVisible=1.0;
          if(uBurst>0.5){
            float clock=fract((uTime+uOffset)/uPeriod)*uPeriod;
            age=(clock-aSeed.x*0.22)/uDuration;
            vVisible=step(0.0,age)*(1.0-step(1.0,age));
            age=clamp(age,0.0,1.0);
          }
          float angle=aSeed.y*6.28318+age*(uTurns+1.6*(aSeed.z-0.5));
          vec3 p=mix(uStart,uEnd,age);
          float envelope=sin(age*3.14159);
          float spread=envelope*uRadius*(0.55+0.65*aSeed.z);
          float turbX=sin(age*12.5+uTime*2.4+aSeed.y*19.0)*0.09*uRadius;
          float turbZ=cos(age*11.0-uTime*2.1+aSeed.z*23.0)*0.09*uRadius;
          p.xz+=vec2(cos(angle),sin(angle))*spread+vec2(turbX,turbZ);
          p.y+=envelope*uLift+sin(age*9.4+aSeed.x*15.0)*0.08;
          if(uBurst>0.5){
            float burstEase=1.0-pow(1.0-age,2.2);
            float grav=age*age*0.55;
            p=uStart+vec3(
              cos(angle)*burstEase*uRadius*(0.45+0.75*aSeed.z),
              sin(age*3.14159)*uLift*(0.5+0.7*aSeed.y)-grav,
              sin(angle)*burstEase*uRadius*(0.45+0.75*aSeed.z)
            );
          }
          vec4 mv=modelViewMatrix*vec4(p,1.0);
          vAge=age;vSeed=aSeed.z;
          vSpark=0.65+0.35*sin(uTime*9.0+aSeed.x*47.0+aSeed.y*31.0);
          float sizePulse=0.75+0.45*sin(age*3.14159);
          gl_PointSize=clamp(uSize*sizePulse*(0.55+aSeed.z*0.95)*340.0/max(8.0,-mv.z),2.2,24.0)*uPixelRatio;
          gl_Position=projectionMatrix*mv;
        }`,
      fragmentShader: `uniform vec3 uColor;uniform vec3 uColor2;uniform float uPower;
        varying float vAge;varying float vSeed;varying float vVisible;varying float vSpark;
        void main(){
          vec2 uv=gl_PointCoord-0.5;
          float r=length(uv)*2.0;
          if(r>1.0) discard;
          float glow=exp(-r*r*3.4);
          float core=exp(-r*r*16.0);
          float ring=smoothstep(0.55,0.2,r)*0.35;
          float fade=smoothstep(0.0,0.12,vAge)*(1.0-smoothstep(0.66,1.0,vAge));
          vec3 baseCol=mix(uColor,uColor2,smoothstep(0.62,0.96,vSeed)*0.45);
          vec3 col=baseCol*(0.75+vSeed*0.65+ring)*(0.82+0.28*vSpark)+vec3(1.0,0.92,0.88)*core*0.85;
          float alpha=(glow*0.78+core*0.55)*fade*vVisible*uPower;
          gl_FragColor=vec4(col,alpha);
          #include <encodings_fragment>
        }`
    });
    const points = new THREE.Points(geometry, material);
    points.name = options.name || 'Flowing data fragments';
    points.userData.dynamic = true; points.userData.effect = 'stream';
    points.frustumCulled = false; points.renderOrder = 2;
    points.onBeforeRender = renderer => { uniforms.uPixelRatio.value = renderer.getPixelRatio(); };
    parent.add(points);
    schedule(motion, time => { uniforms.uTime.value = time; points.userData.effectTime = time; });
    return points;
  }

  /* Visceral 3D blood droplet & splatter particle system */
  function blood(parent, motion, options){
    const small = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 700;
    const count = Math.max(20, Math.round((options.count || 42) * (small ? 0.6 : 1)));
    const random = APP.TEX.rng(options.seed || 666);
    const seeds = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) seeds.set([i / count, random(), random()], i * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3));
    const uniforms = {
      uTime: { value: 0 },
      uStart: { value: options.start },
      uEnd: { value: options.end || options.start },
      uRadius: { value: options.radius === undefined ? 0.55 : options.radius },
      uLift: { value: options.lift === undefined ? 0.65 : options.lift },
      uGravity: { value: options.gravity === undefined ? 2.4 : options.gravity },
      uPeriod: { value: options.period || 2.4 },
      uBurst: { value: options.burst ? 1 : 0 },
      uOffset: { value: options.offset || 0 },
      uDuration: { value: options.duration || 1.15 },
      uSize: { value: options.size || 1.15 },
      uPixelRatio: { value: 1 },
      uPower: { value: options.power === undefined ? 1 : options.power }
    };
    const material = new THREE.ShaderMaterial({
      uniforms, transparent: true, depthWrite: false,
      blending: THREE.NormalBlending, toneMapped: false,
      vertexShader: `attribute vec3 aSeed;uniform float uTime;uniform vec3 uStart;uniform vec3 uEnd;
        uniform float uRadius;uniform float uLift;uniform float uGravity;uniform float uPeriod;
        uniform float uBurst;uniform float uOffset;uniform float uDuration;uniform float uSize;uniform float uPixelRatio;
        varying float vAge;varying float vSeed;varying float vVisible;
        void main(){
          float age=fract((uTime+uOffset)/uPeriod+aSeed.x);
          vVisible=1.0;
          if(uBurst>0.5){
            float clock=fract((uTime+uOffset)/uPeriod)*uPeriod;
            age=(clock-aSeed.x*0.18)/uDuration;
            vVisible=step(0.0,age)*(1.0-step(1.0,age));
            age=clamp(age,0.0,1.0);
          }
          float angle=aSeed.y*6.28318;
          float radial=(0.25+0.75*aSeed.z)*uRadius;
          vec3 p;
          if(uBurst>0.5){
            float outDist=pow(age,0.68)*radial;
            p=uStart+vec3(
              cos(angle)*outDist,
              age*uLift*(0.45+0.75*aSeed.y)-age*age*uGravity,
              sin(angle)*outDist
            );
          } else {
            float fall=age*age;
            p=mix(uStart,uEnd,fall);
            float splash=smoothstep(0.82,1.0,age);
            p.xz+=vec2(cos(angle),sin(angle))*(radial*(0.28+splash*1.35));
            p.y+=splash*0.18*sin((age-0.82)*17.0);
          }
          vec4 mv=modelViewMatrix*vec4(p,1.0);
          vAge=age;vSeed=aSeed.z;
          float dropScale=(1.0-0.35*age)*(0.6+0.75*aSeed.z);
          gl_PointSize=clamp(uSize*dropScale*310.0/max(7.0,-mv.z),2.4,22.0)*uPixelRatio;
          gl_Position=projectionMatrix*mv;
        }`,
      fragmentShader: `uniform float uPower;varying float vAge;varying float vSeed;varying float vVisible;
        void main(){
          vec2 uv=gl_PointCoord-0.5;
          uv.x*=1.18;
          float r=length(uv)*2.0;
          if(r>1.0) discard;
          float body=smoothstep(1.0,0.22,r);
          float spec=exp(-length(uv-vec2(-0.12,-0.14))*14.0);
          float fade=smoothstep(0.0,0.06,vAge)*(1.0-smoothstep(0.78,1.0,vAge));
          vec3 darkBlood=vec3(0.11,0.003,0.008);
          vec3 arterial=vec3(0.68,0.012,0.025);
          vec3 col=mix(darkBlood,arterial,smoothstep(0.85,0.18,r)*(0.65+0.35*vSeed));
          col+=vec3(1.0,0.28,0.28)*spec*0.55;
          float alpha=body*fade*vVisible*uPower*0.92;
          gl_FragColor=vec4(col,alpha);
          #include <encodings_fragment>
        }`
    });
    const points = new THREE.Points(geometry, material);
    points.name = options.name || 'Arterial blood droplets';
    points.userData.dynamic = true; points.userData.effect = 'blood';
    points.frustumCulled = false; points.renderOrder = 3;
    points.onBeforeRender = renderer => { uniforms.uPixelRatio.value = renderer.getPixelRatio(); };
    parent.add(points);
    schedule(motion, time => { uniforms.uTime.value = time; points.userData.effectTime = time; });
    return points;
  }

  /* Glistening procedural blood pool with organic splatter lobes & drip ripples */
  function bloodPool(parent, motion, options){
    const radius = options.radius || 1.15;
    const uniforms = {
      uTime: { value: 0 },
      uSeed: { value: options.seed || 13.7 },
      uPulse: { value: 0 }
    };
    const material = new THREE.ShaderMaterial({
      uniforms, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2,
      vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader: `varying vec2 vUv;uniform float uTime;uniform float uSeed;uniform float uPulse;
        void main(){
          vec2 p=(vUv-0.5)*2.0;
          float r=length(p);
          float a=atan(p.y,p.x);
          float lobes=0.72+0.12*sin(a*5.0+uSeed)+0.08*cos(a*9.0-uSeed*2.1)+0.06*sin(a*15.0+uSeed*3.7);
          float edge=smoothstep(lobes,lobes-0.18,r);
          float drop1=smoothstep(0.11,0.03,length(p-vec2(cos(uSeed)*0.78,sin(uSeed)*0.78)));
          float drop2=smoothstep(0.08,0.02,length(p-vec2(cos(uSeed+2.2)*0.84,sin(uSeed+2.2)*0.84)));
          float drop3=smoothstep(0.09,0.02,length(p-vec2(cos(uSeed+4.4)*0.80,sin(uSeed+4.4)*0.80)));
          float mask=max(edge,max(drop1,max(drop2,drop3)));
          if(mask<0.01) discard;
          float ripple=sin(r*26.0-uTime*3.8)*exp(-r*3.5)*(0.25+0.75*uPulse);
          float centerGlow=smoothstep(lobes,0.0,r);
          vec3 coagulated=vec3(0.07,0.002,0.005);
          vec3 fresh=vec3(0.46,0.008,0.016);
          vec3 glint=vec3(0.95,0.16,0.18)*max(0.0,ripple)*0.45;
          vec3 col=mix(coagulated,fresh,centerGlow*0.85+uPulse*0.25)+glint;
          gl_FragColor=vec4(col,mask*0.88);
          #include <encodings_fragment>
        }`
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(radius * 2, radius * 2), material);
    mesh.rotation.x = -Math.PI / 2;
    if (options.position) mesh.position.copy(options.position);
    mesh.name = options.name || 'Coagulated blood pool';
    mesh.userData.dynamic = true; mesh.userData.effect = 'bloodPool';
    mesh.renderOrder = 1;
    parent.add(mesh);
    schedule(motion, time => {
      uniforms.uTime.value = time;
      if (options.period) uniforms.uPulse.value = pulse(time, options.period, options.offset || 0);
    });
    return mesh;
  }

  function curtain(parent, motion, color, width, height, offset = 0){
    const material = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(color).convertSRGBToLinear() }, uOffset: { value: offset } },
      vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader: `varying vec2 vUv;uniform float uTime;uniform float uOffset;uniform vec3 uColor;
        void main(){float scan=fract(uTime*0.15+uOffset);float distance=abs(vUv.y-scan);
          float band=exp(-distance*distance*850.0);
          float edge=smoothstep(0.0,0.08,vUv.x)*(1.0-smoothstep(0.92,1.0,vUv.x));
          edge*=smoothstep(0.0,0.06,vUv.y)*(1.0-smoothstep(0.94,1.0,vUv.y));
          float traces=pow(max(0.0,sin(vUv.x*56.0+sin(vUv.y*19.0+uTime)*0.5)),14.0);
          gl_FragColor=vec4(uColor*(1.0+band*0.7),edge*(band*0.44+traces*0.055));
          #include <encodings_fragment>
        }`,
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, toneMapped: false
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
    mesh.name = 'Sweeping identity reconstruction field';
    mesh.userData.dynamic = true; mesh.userData.effect = 'curtain'; mesh.renderOrder = 2;
    parent.add(mesh);
    schedule(motion, time => { material.uniforms.uTime.value = time; mesh.userData.effectTime = time; });
    return mesh;
  }

  return { actor, animate, vocal, schedule, pulse, phase, hologram, waves, beam, stream, blood, bloodPool, curtain };
})();
