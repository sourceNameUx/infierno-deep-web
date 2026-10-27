/* life.js — articulated silhouettes and local, clock-driven circuit effects. */
window.APP = window.APP || {};

APP.LIFE = (function(){
  'use strict';

  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const UP = V(0, 1, 0), FRONT = V(0, 0, 1);
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const phase = (time, period) => ((time % period) + period) % period;
  let bodyGeometry;

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

  function actor(parent, material, x, y, z, seated = false){
    const root = APP.MODELS.group(parent, 'Articulated adult silhouette', x, y, z);
    root.userData.dynamic = true;
    root.userData.actor = true;
    if (!bodyGeometry) bodyGeometry = new THREE.SphereGeometry(1, 12, 8);
    const body = new THREE.InstancedMesh(bodyGeometry, material, 20);
    body.name = 'Articulated body segments';
    body.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    body.castShadow = !material.transparent;
    body.receiveShadow = !material.transparent;
    body.frustumCulled = false;
    body.renderOrder = material.transparent ? 1 : 0;
    root.add(body);

    const hipHeight = seated ? 0.80 : 1.05;
    const shoulderHeight = seated ? 1.31 : 1.81;
    const headHeight = seated ? 1.60 : 2.10;
    const rig = {
      lean: 0, turn: 0, roll: 0, nod: 0, look: 0, crouch: 0, breath: 0,
      hands: [-1, 1].map(sign => V(sign * 0.36, seated ? 0.96 : 1.04, seated ? 0.54 : 0.10)),
      feet: [-1, 1].map(sign => V(sign * 0.20, 0.09, seated ? 0.63 : 0)),
      head: APP.MODELS.group(root, 'Head attachment'),
      grips: [-1, 1].map(() => APP.MODELS.group(root, 'Hand attachment'))
    };
    const dummy = new THREE.Object3D(), rotation = new THREE.Quaternion();
    const headRotation = new THREE.Quaternion(), euler = new THREE.Euler();
    const hip = V(), center = V(), shoulder = V(), knee = V(), elbow = V();
    const end = V(), axis = V(), pole = V(), delta = V();
    let index = 0;

    function upperPoint(out, px, py, pz){
      return out.set(px, py - hipHeight, pz).applyQuaternion(rotation).add(hip);
    }
    function ellipsoid(position, sx, sy, sz, orientation){
      dummy.position.copy(position);
      if (orientation) dummy.quaternion.copy(orientation); else dummy.quaternion.identity();
      dummy.scale.set(sx, sy, sz);
      dummy.updateMatrix();
      body.setMatrixAt(index++, dummy.matrix);
    }
    function segment(a, b, radius){
      delta.subVectors(b, a);
      const length = Math.max(0.001, delta.length());
      dummy.quaternion.setFromUnitVectors(UP, delta.multiplyScalar(1 / length));
      dummy.position.copy(a).add(b).multiplyScalar(0.5);
      dummy.scale.set(radius, length * 0.5 + radius * 0.22, radius);
      dummy.updateMatrix();
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
      hip.set(0, hipHeight - rig.crouch, 0);
      rotation.setFromEuler(euler.set(rig.lean, rig.turn, rig.roll));
      upperPoint(center, 0, seated ? 1.10 : 1.53, 0);
      ellipsoid(center, 0.32 + rig.breath * 0.008, seated ? 0.33 : 0.43, 0.215, rotation);
      ellipsoid(hip, 0.245, 0.17, 0.20, rotation);
      upperPoint(center, 0, headHeight - 0.24, 0);
      ellipsoid(center, 0.095, 0.14, 0.095, rotation);
      upperPoint(rig.head.position, 0, headHeight, 0);
      headRotation.setFromEuler(euler.set(rig.nod, rig.look, 0)).premultiply(rotation);
      rig.head.quaternion.copy(headRotation);
      ellipsoid(rig.head.position, 0.18, 0.258, 0.207, headRotation);
      for (let side = 0; side < 2; side++){
        const sign = side ? 1 : -1;
        upperPoint(shoulder, sign * 0.30, shoulderHeight, 0);
        bend.set(sign * 0.85, -0.28, -0.10);
        joint(shoulder, rig.hands[side], 0.41, 0.40, bend, elbow);
        rig.grips[side].position.copy(end);
        segment(shoulder, elbow, 0.086);
        ellipsoid(elbow, 0.09, 0.09, 0.09);
        segment(elbow, end, 0.074);
        ellipsoid(end, 0.095, 0.105, 0.09);
      }
      for (let side = 0; side < 2; side++){
        const sign = side ? 1 : -1;
        shoulder.set(sign * 0.16, hip.y, 0);
        target.copy(rig.feet[side]);
        bend.set(sign * 0.08, 0, 1);
        joint(shoulder, target, seated ? 0.57 : 0.50, seated ? 0.65 : 0.49, bend, knee);
        segment(shoulder, knee, 0.11);
        ellipsoid(knee, 0.105, 0.105, 0.105);
        segment(knee, end, 0.085);
        center.copy(end); center.z += 0.09;
        ellipsoid(center, 0.12, 0.075, 0.21);
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
        void main(){float rim=pow(1.0-abs(dot(normalize(vNormal),normalize(vView))),1.6);
          float lines=0.58+0.42*smoothstep(0.15,0.85,0.5+0.5*sin(vLocal.y*92.0-uTime*2.1));
          float grain=fract(sin(dot(floor(vLocal*36.0),vec3(12.989,78.233,45.164)))*43758.5453);
          float threshold=uDissolve*2.9-0.3;
          float reveal=smoothstep(threshold,threshold+0.15,vLocal.y+grain*0.11);
          float scan=exp(-pow((vLocal.y-fract(uTime*0.18)*2.5)*15.0,2.0));
          gl_FragColor=vec4(uColor*(0.72+rim*0.8+scan*0.5),uOpacity*lines*(0.45+rim*0.55)*reveal);
          #include <encodings_fragment>
        }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false
    });
  }

  function waves(parent, motion, options){
    const emitters = options.emitters, copies = options.copies || 2;
    const material = new THREE.MeshBasicMaterial({ color: options.color, transparent: true,
      opacity: options.opacity === undefined ? 0.55 : options.opacity,
      blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false });
    const mesh = new THREE.InstancedMesh(new THREE.TorusGeometry(1, options.thickness || 0.027, 5, 48), material, emitters.length * copies);
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
          const radius = (options.from || 0.5) + ((options.to || 1.7) - (options.from || 0.5)) * progress;
          dummy.position.lerpVectors(emitter.start, emitter.end, progress);
          dummy.scale.setScalar(life < 1 ? radius : 0.001);
          dummy.updateMatrix();
          const index = emitterIndex * copies + copy;
          mesh.setMatrixAt(index, dummy.matrix);
          const glow = Math.pow(Math.max(0, Math.sin(progress * Math.PI)), 0.65) * (options.power || 1);
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
        void main(){float body=pow(abs(dot(normalize(vNormal),normalize(vView))),1.5);
          float ends=smoothstep(0.0,0.16,vUv.y)*(1.0-smoothstep(0.85,1.0,vUv.y));
          float signal=0.72+0.28*sin(vUv.y*37.0-uTime*4.0);
          gl_FragColor=vec4(uColor*1.4,(0.035+body*0.18)*ends*signal*uPower);
          #include <encodings_fragment>
        }`,
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, toneMapped: false
    });
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 1, 1, 24, 1, true), material);
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
    const count = Math.max(12, Math.round((options.count || 48) * (small ? 0.6 : 1)));
    const random = APP.TEX.rng(options.seed || 482);
    const seeds = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) seeds.set([i / count, random(), random()], i * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3));
    const uniforms = {
      uTime: { value: 0 }, uColor: { value: new THREE.Color(options.color).convertSRGBToLinear() },
      uStart: { value: options.start }, uEnd: { value: options.end },
      uRadius: { value: options.radius || 0.45 }, uLift: { value: options.lift || 0 },
      uTurns: { value: options.turns || 0 }, uPeriod: { value: options.period || 4 },
      uBurst: { value: options.burst ? 1 : 0 }, uSize: { value: options.size || 0.85 }, uPixelRatio: { value: 1 },
      uOffset: { value: options.offset || 0 }, uDuration: { value: options.duration || 1.4 },
      uPower: { value: options.power === undefined ? 1 : options.power }
    };
    const material = new THREE.ShaderMaterial({
      uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
      vertexShader: `attribute vec3 aSeed;uniform float uTime;uniform vec3 uStart;uniform vec3 uEnd;
        uniform float uRadius;uniform float uLift;uniform float uTurns;uniform float uPeriod;
        uniform float uBurst;uniform float uSize;uniform float uPixelRatio;uniform float uOffset;uniform float uDuration;
        varying float vAge;varying float vSeed;varying float vVisible;
        void main(){float age=fract((uTime+uOffset)/uPeriod+aSeed.x);vVisible=1.0;
          if(uBurst>0.5){float clock=fract((uTime+uOffset)/uPeriod)*uPeriod;
            age=(clock-aSeed.x*0.16)/uDuration;vVisible=step(0.0,age)*(1.0-step(1.0,age));age=clamp(age,0.0,1.0);}
          float angle=aSeed.y*6.28318+age*uTurns;
          vec3 p=mix(uStart,uEnd,age);float spread=sin(age*3.14159)*uRadius;
          p.xz+=vec2(cos(angle),sin(angle))*spread;p.y+=sin(age*3.14159)*uLift;
          if(uBurst>0.5){p=uStart+vec3(cos(angle)*age*uRadius,sin(age*3.14159)*uLift,sin(angle)*age*uRadius);}
          vec4 mv=modelViewMatrix*vec4(p,1.0);vAge=age;vSeed=aSeed.z;
          gl_PointSize=clamp(uSize*(0.65+aSeed.z)*250.0/max(10.0,-mv.z),1.2,10.0)*uPixelRatio;
          gl_Position=projectionMatrix*mv;}`,
      fragmentShader: `uniform vec3 uColor;uniform float uPower;varying float vAge;varying float vSeed;varying float vVisible;
        void main(){vec2 p=abs(gl_PointCoord-0.5);float square=max(p.x,p.y);
          float edge=1.0-smoothstep(0.32,0.5,square);
          float core=1.0-smoothstep(0.07,0.22,length(p));
          float fade=smoothstep(0.0,0.10,vAge)*(1.0-smoothstep(0.62,1.0,vAge));
          gl_FragColor=vec4(uColor*(0.8+vSeed*0.6)+core*0.12,edge*fade*0.72*vVisible*uPower);
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

  return { actor, animate, schedule, pulse, phase, hologram, waves, beam, stream, curtain };
})();
