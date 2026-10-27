/* atmosphere.js — a storm-lit server necropolis beyond the playable islands. */
window.APP = window.APP || {};

APP.ATMOSPHERE = (function(){
  'use strict';

  function create(scene, camera, motions, smallDevice){
    const random = APP.TEX.rng(7204);
    const uniforms = { uTime: { value: 0 }, uYaw: { value: 0 }, uAspect: { value: 1 } };
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
      uniforms, depthTest: false, depthWrite: false, fog: false, toneMapped: false,
      vertexShader: `varying vec3 vDirection;
        void main(){vDirection=vec3(position.xy,-1.0);gl_Position=vec4(position.xy,0.99999,1.0);}`,
      fragmentShader: `
        uniform float uTime;uniform float uYaw;uniform float uAspect;varying vec3 vDirection;
        float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
        float noise(vec3 p){
          vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
          return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),
            mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
            mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),
            mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
        }
        float fbm(vec3 p){float result=0.0,a=0.5;
          for(int i=0;i<4;i++){result+=noise(p)*a;p=p*2.03+vec3(7.1,3.7,9.2);a*=0.5;}return result;}
        vec3 encode(vec3 c){return mix(12.92*c,1.055*pow(max(c,vec3(0)),vec3(1.0/2.4))-0.055,step(vec3(0.0031308),c));}
        void main(){
          vec3 d=normalize(vec3(vDirection.x*uAspect,vDirection.y*0.85,-1.0));
          float horizon=exp(-abs(d.y+0.06)*3.6);
          vec3 col=mix(vec3(0.026,0.018,0.064),vec3(0.12,0.048,0.059),horizon);
          vec3 p=d*vec3(4.0,5.0,4.0)+vec3(uTime*0.009+uYaw*0.3,0.0,uTime*0.004);
          float bank=fbm(p),detail=fbm(p*2.4+vec3(bank*2.0,0.0,-uTime*0.007));
          float cloud=smoothstep(0.25,0.69,bank*0.76+detail*0.34);
          float edge=smoothstep(0.34,0.52,bank)*(1.0-smoothstep(0.52,0.65,bank));
          col=mix(col,vec3(0.018,0.016,0.040),cloud*0.88);
          col+=vec3(0.15,0.031,0.013)*edge*horizon*(0.35+detail);
          float cold=pow(max(0.0,sin(atan(d.z,d.x)*2.0+0.7)),3.0);
          col+=vec3(0.014,0.059,0.088)*edge*cold;
          // A slow cloud glow accompanies distant electrical activity.
          float glow=pow(max(0.0,sin(uTime*0.27+d.x*6.0+d.z*4.0)),12.0);
          col+=vec3(0.018,0.029,0.055)*glow*cloud;
          gl_FragColor=vec4(encode(col),1.0);
        }`
    }));
    sky.name = 'Copper and violet storm canopy';
    sky.renderOrder = -100;
    sky.frustumCulled = false;
    scene.add(sky);
    const view = new THREE.Vector3();
    motions.push(time => {
      uniforms.uTime.value = time;
      camera.getWorldDirection(view);
      uniforms.uYaw.value = Math.atan2(view.x, -view.z);
      uniforms.uAspect.value = camera.aspect;
    });

    createSkyline(scene, uniforms, random, smallDevice);
    createLightning(scene, motions, random, smallDevice);
    createCloudBanks(scene, motions, random, smallDevice);
  }

  function createSkyline(scene, skyUniforms, random, smallDevice){
    // A layered matte horizon stays readable at the overview's steep angle.
    // Clip-space geometry renders behind the world; only its parallax follows orbit.
    const count = smallDevice ? 26 : 38;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    for (let layer = 0; layer < 3; layer++){
      const blocks = [], spires = [], lights = [], colors = [];
      const base = 0.05 + (2 - layer) * 0.11;
      const uniforms = { uYaw: skyUniforms.uYaw, uParallax: { value: 0.018 + layer * 0.012 },
        uColor: { value: new THREE.Color([0x554259, 0x3b304c, 0x292339][layer]) } };
      const vertex = `uniform float uYaw;uniform float uParallax;varying float vHeight;
        void main(){vec4 p=vec4(position,1.0);
          #ifdef USE_INSTANCING
            p=instanceMatrix*p;
          #endif
          p.x=mod(p.x+uYaw*uParallax+1.5,3.0)-1.5;
          vHeight=p.y;gl_Position=vec4(p.xy,0.9999,1.0);}`;
      for (let i = 0; i < count; i++){
        const x = -1.5 + i / count * 3 + random() * 0.025;
        const height = 0.13 + Math.pow(random(), 1.4) * (0.33 - layer * 0.035);
        const width = 0.019 + random() * 0.038;
        blocks.push({ x, y: base + height / 2, w: width, h: height });
        blocks.push({ x, y: base + height * 1.1, w: width * 0.55, h: height * 0.2 });
        spires.push({ x, y: base + height * 1.2 + 0.025, w: width * 0.25, h: 0.05 });
        color.setHex(i % 3 === 0 ? 0x6696ab : 0xad705a);
        const line = (ax, ay, bx, by) => {
          lights.push(ax, ay, 0, bx, by, 0);
          colors.push(color.r, color.g, color.b, color.r, color.g, color.b);
        };
        line(x, base + height * 0.22, x, base + height * 0.91);
        for (let band = 0; band < 3; band++){
          const y = base + height * (0.45 + band * 0.13);
          line(x - width * 0.33, y, x + width * 0.33, y);
        }
      }
      const material = new THREE.ShaderMaterial({ uniforms, depthTest: false, depthWrite: false,
        toneMapped: false, vertexShader: vertex,
        fragmentShader: `uniform vec3 uColor;varying float vHeight;
          void main(){vec3 mist=vec3(0.20,0.15,0.24);
            gl_FragColor=vec4(mix(mist,uColor,smoothstep(0.04,0.5,vHeight)),1.0);}` });
      const towers = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 0.001), material, blocks.length);
      const needles = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 4), material, spires.length);
      const place = (mesh, items) => {
        items.forEach((item, index) => {
          dummy.position.set(item.x, item.y, 0);
          dummy.scale.set(item.w, item.h, 0.001);
          dummy.updateMatrix(); mesh.setMatrixAt(index, dummy.matrix);
        });
        mesh.instanceMatrix.needsUpdate = true;
        mesh.frustumCulled = false;
        mesh.renderOrder = -80 + layer * 2;
        scene.add(mesh);
      };
      towers.name = 'Distant server citadels'; needles.name = 'Transmission spires';
      place(towers, blocks); place(needles, spires);
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(lights, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      const seams = new THREE.LineSegments(geometry, new THREE.ShaderMaterial({
        uniforms, depthTest: false, depthWrite: false, toneMapped: false, vertexColors: true,
        vertexShader: vertex.replace('varying float vHeight;', 'varying float vHeight;varying vec3 vColor;')
          .replace('vHeight=p.y;', 'vHeight=p.y;vColor=color;'),
        fragmentShader: `varying vec3 vColor;varying float vHeight;
          void main(){gl_FragColor=vec4(vColor*(0.45+0.35*smoothstep(0.1,0.7,vHeight)),1.0);}`
      }));
      seams.name = 'Remote data channels';
      seams.frustumCulled = false;
      seams.renderOrder = towers.renderOrder + 1;
      scene.add(seams);
    }
  }

  function createLightning(scene, motions, random, smallDevice){
    const vertices = [], phases = [];
    const count = smallDevice ? 7 : 11;
    for (let bolt = 0; bolt < count; bolt++){
      const center = new THREE.Vector3(-1.05 + bolt / (count - 1) * 2.1, 0, 0);
      const right = new THREE.Vector3(1, 0, 0);
      const phase = bolt / count;
      let x = 0, y = 0.84 + random() * 0.17;
      const ribbon = (ax, ay, bx, by, width) => {
        const a = center.clone().addScaledVector(right, ax); a.y = ay;
        const b = center.clone().addScaledVector(right, bx); b.y = by;
        const corners = [a.clone().addScaledVector(right, -width), a.clone().addScaledVector(right, width),
          b.clone().addScaledVector(right, width), b.clone().addScaledVector(right, -width)];
        [0, 1, 2, 0, 2, 3].forEach(i => { vertices.push(...corners[i].toArray()); phases.push(phase); });
      };
      for (let step = 0; step < 10; step++){
        const nextX = x + (random() - 0.5) * 0.07;
        const nextY = y - 0.023 - random() * 0.03;
        ribbon(x, y, nextX, nextY, (smallDevice ? 0.0025 : 0.0009) + (10 - step) * 0.00006);
        if (step === 3 || step === 6){
          const branchX = nextX + (random() < 0.5 ? -1 : 1) * 0.055;
          ribbon(nextX, nextY, branchX, nextY - 0.035, 0.0007);
          ribbon(branchX, nextY - 0.035, branchX + 0.02, nextY - 0.08, 0.0004);
        }
        x = nextX; y = nextY;
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('aPhase', new THREE.Float32BufferAttribute(phases, 1));
    const uniforms = { uTime: { value: 0 }, uMotion: { value: 0 } };
    const material = new THREE.ShaderMaterial({
      uniforms, depthTest: false, depthWrite: false, side: THREE.DoubleSide,
      transparent: false, blending: THREE.AdditiveBlending, toneMapped: false,
      vertexShader: `attribute float aPhase;varying float vPhase;
        void main(){vPhase=aPhase;gl_Position=vec4(position.xy,0.9999,1.0);}`,
      fragmentShader: `uniform float uTime;uniform float uMotion;varying float vPhase;
        void main(){float age=mod(uTime+vPhase*17.0,17.0);
          float pulse=exp(-pow((age-1.5)*2.8,2.0))+0.35*exp(-pow((age-2.3)*4.0,2.0));
          float intensity=mix(0.32,0.12+0.88*pulse,uMotion);
          gl_FragColor=vec4(vec3(0.53,0.78,1.0)*1.7,intensity);}`
    });
    const lightning = new THREE.Mesh(geometry, material);
    lightning.name = 'Branching electrical storms';
    lightning.frustumCulled = false;
    lightning.renderOrder = -90;
    scene.add(lightning);
    motions.push(time => {
      uniforms.uTime.value = time;
      uniforms.uMotion.value = APP.SCENE.motionEnabled ? 1 : 0;
    });
  }

  function createCloudBanks(scene, motions, random, smallDevice){
    const size = 128;
    const canvas = APP.TEX.canvas(size, size), context = canvas.getContext('2d');
    const image = context.createImageData(size, size);
    for (let y = 0; y < size; y++){
      for (let x = 0; x < size; x++){
        const u = x / size, v = y / size;
        const n = APP.TEX.pfbm(u * 5, v * 5, 5, 5, 4, 172);
        const radius = Math.hypot((u - 0.5) * 2, (v - 0.5) * 2);
        const alpha = Math.max(0, 1 - radius) * APP.TEX.smoothstep(0.22, 0.7, n);
        const offset = (y * size + x) * 4;
        image.data[offset] = image.data[offset + 1] = image.data[offset + 2] = 255;
        image.data[offset + 3] = alpha * 230;
      }
    }
    context.putImageData(image, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    const count = smallDevice ? 12 : 20;
    const cloudMaterial = new THREE.SpriteMaterial({ map: texture, color: 0xa17388,
      opacity: 0.45, depthWrite: false, fog: false });
    for (let i = 0; i < count; i++){
      const cloud = new THREE.Sprite(cloudMaterial);
      const angle = i / count * Math.PI * 2;
      const radius = 164 + random() * 50, altitude = 18 + random() * 100;
      cloud.position.set(Math.cos(angle) * radius, altitude, Math.sin(angle) * radius);
      cloud.scale.set(95 + random() * 70, 28 + random() * 25, 1);
      cloud.name = 'Drifting ash cloud';
      scene.add(cloud);
      motions.push(time => {
        cloud.position.x = Math.cos(angle + time * 0.0012) * radius;
        cloud.position.z = Math.sin(angle + time * 0.0012) * radius;
        cloud.position.y = altitude + Math.sin(time * 0.07 + i) * 2;
      });
    }
  }

  return { create };
})();
