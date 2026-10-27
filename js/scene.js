/*
 * scene.js — the cavern, lava, fibers, lighting and camera.
 * Three.js r128 globals only. No network assets, imports or build step.
 * Rendering is optional: the dossier UI remains usable without WebGL.
 */
window.APP = window.APP || {};

APP.SCENE = (function(){
  'use strict';

  const POSITIONS = {
    1: [-26, 0, -9], 2: [26, 0, -11], 3: [25, 0, 15],
    4: [-25, 0, 17], 5: [0, -1, 31], 0: [0, 8, -7]
  };
  const HAZE = 0x272236;
  const DIRECTION = [0.18, 0.70, 1];
  const islands = new Map(), labels = new Map();
  const motions = [], packets = [], pickables = [];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let renderer, scene, camera, controls, composer = null;
  let lava, particles, worldBounds, initPromise;
  let width = 1, height = 1, pixelRatio = 1, activeView = null;
  let ready = false, running = false, frameId = 0, lastTime = 0, elapsed = 0;
  let motionEnabled = !reduced.matches, flight = null, viewport = null;
  let frameSamples = 0, frameCost = 0, qualityStage = 0;
  let lastLabelFrame = 0, lastReadout = 0;
  const pointer = { x: 0, y: 0, downX: 0, downY: 0, dragged: false, held: false };
  let raycaster, ndc, viewFrustum, viewProjection;

  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const yieldTask = () => new Promise(resolve => setTimeout(resolve, 0));
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  function init(progress){
    if (!initPromise) initPromise = initialize(progress || (() => {}));
    return initPromise;
  }

  async function initialize(progress){
    if (typeof THREE === 'undefined') throw new Error('The local Three.js library did not load.');
    const canvas = document.getElementById('scene3d');
    progress('Preparando la cámara y la luz…', 0);
    await yieldTask();
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.info.autoReset = false;
    const smallDevice = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 700;
    pixelRatio = Math.min(window.devicePixelRatio || 1, smallDevice ? 1.25 : 1.65);
    renderer.setPixelRatio(pixelRatio);
    renderer.shadowMap.enabled = !smallDevice;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(HAZE);
    scene.fog = new THREE.FogExp2(new THREE.Color(HAZE).convertSRGBToLinear(), 0.0048);
    camera = new THREE.PerspectiveCamera(43, 1, 0.2, 950);
    viewFrustum = new THREE.Frustum();
    viewProjection = new THREE.Matrix4();
    camera.position.set(18, 85, 125);
    if (THREE.OrbitControls){
      controls = new THREE.OrbitControls(camera, canvas);
      controls.enableDamping = !reduced.matches;
      controls.dampingFactor = 0.065;
      controls.enablePan = false;
      controls.minDistance = 13;
      controls.maxPolarAngle = Math.PI * 0.47;
      controls.minPolarAngle = Math.PI * 0.08;
      controls.rotateSpeed = 0.48;
      controls.zoomSpeed = 0.8;
      controls.target.set(0, 6, 0);
      controls.addEventListener('start', () => { flight = null; APP.UI.stopTour(); });
      controls.update();
    } else {
      controls = { target: V(0, 6, 0), update(){ camera.lookAt(this.target); }, dispose(){} };
      console.warn('OrbitControls is unavailable; circuit navigation remains active.');
    }
    raycaster = new THREE.Raycaster();
    ndc = new THREE.Vector2();
    APP.TEX.setAnisotropy(Math.min(8, renderer.capabilities.getMaxAnisotropy()));
    createLights(!smallDevice);

    progress('Tallando basalto y generando materiales…', 12);
    await yieldTask();
    APP.MODELS.createMaterials(smallDevice ? 256 : 512);
    createEnvironmentMap();
    for (let i = 0; i < APP.DATA.ORDER.length; i++){
      const id = APP.DATA.ORDER[i];
      progress('Construyendo ' + APP.DATA.byId(id).tag.toLowerCase() + '…', 25 + i * 9);
      await yieldTask();
      const island = APP.MODELS.build(id);
      island.position.fromArray(POSITIONS[id]);
      scene.add(island);
      islands.set(id, island);
      const bounds = new THREE.Sphere(
        island.position.clone().add(V(0, (island.userData.top - 3.7) / 2, 0)),
        Math.hypot(island.userData.radius + 1.5, (island.userData.top + 3.7) / 2)
      );
      // Hidden circuits resume at the shared clock's current phase when revisited.
      motions.push(time => {
        if (!ready || viewFrustum.intersectsSphere(bounds)) island.userData.motion.forEach(update => update(time));
      });
      createLabel(id);
      createPickVolume(island, id);
      const c = APP.DATA.byId(id);
      const light = new THREE.PointLight(c.col, id === 0 ? 2.0 : 0.8, id === 0 ? 38 : 19, 2);
      light.position.set(POSITIONS[id][0], POSITIONS[id][1] + (id === 0 ? 19 : 4.5), POSITIONS[id][2] + 1.5);
      scene.add(light);
    }
    progress('Conectando los túneles de transferencia…', 82);
    await yieldTask();
    createLava(smallDevice);
    createCavern();
    APP.ATMOSPHERE.create(scene, camera, motions, smallDevice);
    APP.CREATURES.create(scene, camera, motions, smallDevice);
    createFibers();
    createParticles(smallDevice ? 580 : 1050);
    createMist();
    setupBloom(smallDevice);
    worldBounds = new THREE.Box3(V(-36, -8, -22), V(36, 34.8, 40));
    bindInput(canvas);
    APP.UI.on('select', id => flyTo(id));
    APP.UI.on('panel', () => { if (ready) reframe(false); });
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', visibilityChanged);
    if (reduced.addEventListener) reduced.addEventListener('change', () => setMotion(!reduced.matches));
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      running = false;
      cancelAnimationFrame(frameId);
      showRendererNotice('Se perdió la conexión con la tarjeta gráfica. Puedes seguir leyendo los expedientes. Recarga la página para recuperar el 3D.');
    });
    canvas.addEventListener('webglcontextrestored', () => {
      showRendererNotice('La tarjeta gráfica volvió a responder. Recarga la página para reconstruir la escena.');
    });
    motions.forEach(fn => fn(0));
    ready = true;
    resize();
    reframe(true);
    render();
    progress('Seis destinos. Ninguna salida.', 100);
    setMotion(motionEnabled);
    return true;
  }

  function createLights(shadows){
    scene.add(new THREE.HemisphereLight(0xa9bfdc, 0x432014, 1.05));
    const key = new THREE.DirectionalLight(0xd9e5ff, 2.45);
    key.position.set(-38, 78, 43);
    key.castShadow = shadows;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -54, right: 54, top: 52, bottom: -52, near: 1, far: 175 });
    key.shadow.bias = -0.00015;
    key.shadow.normalBias = 0.055;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xff8a51, 1.2);
    rim.position.set(24, 17, -55);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(0x91b7df, 0.72);
    fill.position.set(35, 8, 48);
    scene.add(fill);
  }

  function createEnvironmentMap(){
    if (!THREE.PMREMGenerator) return;
    let generator;
    try {
      generator = new THREE.PMREMGenerator(renderer);
      const source = APP.TEX.envEquirect();
      const target = generator.fromEquirectangular(source);
      scene.environment = target.texture;
      scene.userData.environmentTarget = target;
    } catch (error){
      console.warn('Environment reflections are unavailable; using direct lighting.', error);
    } finally {
      if (generator) generator.dispose();
    }
  }

  function createLava(smallDevice){
    const uniforms = {
      uTime: { value: 0 },
      uHaze: { value: new THREE.Color(HAZE).convertSRGBToLinear() }
    };
    const mat = new THREE.ShaderMaterial({
      uniforms, extensions: { derivatives: true }, toneMapped: false, transparent: true,
      vertexShader: `varying vec3 vWorld; varying float vDepth; uniform float uTime;
        void main(){vec4 w=modelMatrix*vec4(position,1.0);
          w.y+=0.18*sin(w.x*0.14+uTime*0.34)*cos(w.z*0.12-uTime*0.23);
          vWorld=w.xyz;
          vec4 p=viewMatrix*w;vDepth=-p.z;gl_Position=projectionMatrix*p;}`,
      fragmentShader: `
        varying vec3 vWorld; varying float vDepth;
        uniform float uTime; uniform vec3 uHaze;
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float noise(vec2 p){vec2 i=floor(p), f=fract(p);f=f*f*(3.0-2.0*f);
          return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+1.0),f.x),f.y);}
        float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<4;i++){v+=noise(p)*a;p=p*2.03+vec2(4.1,7.7);a*=0.5;}return v;}
        // Warped cellular plates leave branching channels between cooled rafts.
        vec3 plates(vec2 p){
          vec2 cell=floor(p), local=fract(p);float first=9.0,second=9.0,seed=0.0;
          for(int y=-1;y<=1;y++){for(int x=-1;x<=1;x++){
            vec2 offset=vec2(float(x),float(y)),id=cell+offset;
            vec2 center=0.18+0.64*vec2(hash(id),hash(id+37.2));
            vec2 delta=offset+center-local;float d=dot(delta,delta);
            if(d<first){second=first;first=d;seed=hash(id+91.7);}
            else if(d<second){second=d;}
          }}
          return vec3(sqrt(first),sqrt(second)-sqrt(first),seed);
        }
        vec3 encode(vec3 c){return mix(12.92*c,1.055*pow(max(c,vec3(0.0)),vec3(1.0/2.4))-0.055,step(vec3(0.0031308),c));}
        void main(){
          vec2 p=vWorld.xz*0.19;
          vec2 drift=vec2(uTime*0.014,-uTime*0.009);
          vec2 warp=vec2(fbm(p*0.43+drift),fbm(p*0.43+vec2(5.7,2.1)-drift));
          vec2 flow=p+2.1*(warp-0.5)+drift;
          flow+=(vec2(noise(p*1.8+drift),noise(p*1.8+19.8-drift))-0.5)*0.7;
          vec3 plate=plates(flow);
          float field=fbm(flow*0.67+vec2(7.2,-uTime*0.024));
          float aa=max(fwidth(plate.y),0.003);
          float heat=0.65+0.35*sin(field*12.0+uTime*0.37);
          float channelWidth=mix(0.028,0.105,smoothstep(0.3,0.7,field));
          float channel=1.0-smoothstep(channelWidth,channelWidth+0.10+aa,plate.y);
          float core=1.0-smoothstep(0.005,channelWidth*0.5+aa,plate.y);
          float rim=1.0-smoothstep(channelWidth+0.10,channelWidth+0.24+aa,plate.y);
          // Cooler regions merge into rafts; hotter pools dissolve their borders.
          float activity=smoothstep(0.28,0.64,field);
          float pool=smoothstep(0.57,0.68,field);
          channel=max(channel,pool);
          core*=0.35+0.65*activity;
          rim*=0.25+0.75*activity;

          // Fine fissures and stretched folds advect independently of the crust.
          float detailFade=1.0-smoothstep(0.12,0.65,length(fwidth(flow)));
          float grain=noise(flow*9.0);
          float fracture=abs(fbm(flow*3.8+plate.z)-0.47);
          float crackAA=max(fwidth(fracture),0.002);
          float hairline=(1.0-smoothstep(0.006,0.021+crackAA,fracture))*detailFade;
          float folds=sin(flow.x*7.0+flow.y*3.0+field*24.0-uTime*0.65);
          folds=0.5+0.5*folds*(1.0-smoothstep(0.3,2.0,fwidth(folds)));
          float crustHeight=smoothstep(0.0,0.28,plate.y)+grain*0.12*detailFade;
          vec3 dx=dFdx(vWorld),dy=dFdy(vWorld),up=vec3(0.0,1.0,0.0);
          vec3 rx=cross(dy,up),ry=cross(up,dx);
          float det=dot(dx,rx);
          vec3 gradient=dFdx(crustHeight)*rx+dFdy(crustHeight)*ry;
          vec3 normal=normalize(up*(abs(det)+0.00001)-sign(det)*gradient*0.65);
          float relief=0.5+0.5*max(0.0,dot(normal,normalize(vec3(-0.4,0.8,0.3))));
          vec3 crust=mix(vec3(0.008,0.006,0.007),vec3(0.041,0.023,0.019),grain)*relief;
          crust+=vec3(0.24,0.014,0.001)*rim*rim;
          crust+=vec3(0.58,0.041,0.002)*hairline*(0.08+0.26*heat)*(1.0-channel);
          vec3 molten=mix(vec3(0.66,0.027,0.001),vec3(1.5,0.24,0.009),folds)*heat;
          molten+=vec3(1.15,0.65,0.11)*core*(0.65+0.35*folds);
          molten*=0.22+0.65*activity;
          vec3 col=mix(crust,molten,channel);
          float distanceFade=smoothstep(80.0,240.0,length(vWorld.xz));
          float haze=1.0-exp(-0.000027*vDepth*vDepth);
          col=mix(col,uHaze,max(distanceFade,haze*0.84));
          vec3 encoded=encode(col);
          float luminance=dot(encoded,vec3(0.299,0.587,0.114));
          encoded*=min(1.0,2.1/max(0.001,luminance));
          float horizonAlpha=1.0-smoothstep(80.0,220.0,length(vWorld.xz));
          gl_FragColor=vec4(encoded,horizonAlpha);
        }`
    });
    lava = new THREE.Mesh(new THREE.PlaneGeometry(850, 850, smallDevice ? 48 : 96, smallDevice ? 48 : 96), mat);
    lava.name = 'Molten currents and cooling crust';
    lava.rotation.x = -Math.PI / 2;
    lava.position.y = -13.0;
    scene.add(lava);
    createLavaVents(smallDevice);
  }

  function createLavaVents(smallDevice){
    const random = APP.TEX.rng(641);
    const count = smallDevice ? 12 : 24;
    const vents = Array.from({ length: count }, () => {
      const angle = random() * Math.PI * 2, radius = 16 + random() * 63;
      return { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius,
        size: 0.65 + random() * 0.8, phase: random(), period: 5 + random() * 6 };
    });
    const bubbleMat = new THREE.MeshStandardMaterial({
      color: 0x481306, emissive: 0xff4b05, emissiveIntensity: 1.1,
      roughness: 0.38, metalness: 0.15
    });
    const bubbles = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 8), bubbleMat, count);
    const rippleMat = new THREE.MeshBasicMaterial({ color: 0xff6b10, transparent: true,
      opacity: 0.58, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
    const ripples = new THREE.InstancedMesh(new THREE.TorusGeometry(1, 0.035, 4, 28), rippleMat, count);
    bubbles.name = 'Swelling lava blisters';
    ripples.name = 'Expanding molten vent rims';
    bubbles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    ripples.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    bubbles.frustumCulled = ripples.frustumCulled = false;
    const dummy = new THREE.Object3D();
    const ringColor = new THREE.Color();
    let previousTime = -1;
    motions.push(time => {
      if (time === previousTime) return;
      previousTime = time;
      vents.forEach((vent, index) => {
        const life = (time / vent.period + vent.phase) % 1;
        const swell = Math.sin(Math.PI * clamp(life / 0.68, 0, 1));
        const size = Math.max(0.001, vent.size * swell);
        const surface = -13 + 0.18 * Math.sin(vent.x * 0.14 + time * 0.34) * Math.cos(vent.z * 0.12 - time * 0.23);
        dummy.position.set(vent.x, surface - 0.14, vent.z);
        dummy.rotation.set(0, vent.phase * Math.PI, 0);
        dummy.scale.set(size, size * 0.6, size);
        dummy.updateMatrix(); bubbles.setMatrixAt(index, dummy.matrix);
        const expansion = clamp((life - 0.45) / 0.55, 0, 1);
        const ringSize = vent.size * (0.75 + expansion * 2.6);
        dummy.position.y = surface + 0.05;
        dummy.rotation.set(-Math.PI / 2, 0, 0);
        dummy.scale.set(ringSize, ringSize, Math.max(0.001, Math.sin(expansion * Math.PI) * 4));
        // Collapse the whole ring outside its visible lifetime.
        if (expansion <= 0 || expansion >= 0.98) dummy.scale.setScalar(0.001);
        dummy.updateMatrix(); ripples.setMatrixAt(index, dummy.matrix);
        const glow = Math.sin(expansion * Math.PI) * (1 - expansion);
        ringColor.setRGB(glow, glow, glow);
        ripples.setColorAt(index, ringColor);
      });
      bubbles.instanceMatrix.needsUpdate = ripples.instanceMatrix.needsUpdate = true;
      ripples.instanceColor.needsUpdate = true;
    });
    scene.add(bubbles, ripples);
  }

  function createCavern(){
    const random = APP.TEX.rng(890);
    const column = APP.GEO.basaltColumn(0.35, 0.95, 1, 389, 6);
    const mat = APP.MODELS.materials.stone.clone();
    mat.color.setHex(0x5c6677);
    const cliffs = new THREE.InstancedMesh(column, mat, 80);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 80; i++){
      const a = i / 80 * Math.PI * 2;
      const r = 142 + random() * 45;
      const h = 8 + random() * 22;
      dummy.position.set(Math.cos(a) * r, -16 + h / 2, Math.sin(a) * r);
      dummy.scale.set(3 + random() * 5, h, 3 + random() * 5);
      dummy.rotation.set((random() - 0.5) * 0.12, random() * 6.28, (random() - 0.5) * 0.09);
      dummy.updateMatrix();
      cliffs.setMatrixAt(i, dummy.matrix);
    }
    cliffs.instanceMatrix.needsUpdate = true;
    cliffs.name = 'Distant columnar cavern';
    scene.add(cliffs);
  }

  function createFibers(){
    const B = APP.MODELS;
    const root = B.group(scene, 'Transfer conduits');
    for (let id = 1; id <= 5; id++){
      const start = V(...POSITIONS[id]);
      const end = V(...POSITIONS[0]);
      const direction = end.clone().sub(start); direction.y = 0; direction.normalize();
      start.addScaledVector(direction, 6.6); start.y -= 0.45;
      end.addScaledVector(direction, -6.7); end.y -= 0.45;
      const c1 = start.clone().lerp(end, 0.34); c1.y -= 2.8;
      const c2 = start.clone().lerp(end, 0.72); c2.y -= 2.2;
      const { curve } = B.tube(root, [start, c1, c2, end], 0.18, B.materials.dark, 40);
      const side = V(-direction.z, 0, direction.x).multiplyScalar(0.21);
      for (const sign of [-1, 1]){
        B.tube(root, [start, c1, c2, end].map(p => p.clone().addScaledVector(side, sign)), 0.026, B.materials.accents[id], 40);
      }
      for (let j = 0; j < 14; j++){
        const t = j / 13;
        const collar = B.ring(root, 0.26, 0.034, B.materials.brass);
        collar.position.copy(curve.getPoint(t));
        collar.quaternion.setFromUnitVectors(V(0, 0, 1), curve.getTangent(t).normalize());
      }
      for (let j = 0; j < 2; j++){
        const packet = B.sphere(scene, 0.105, B.materials.accents[id], 0, 0, 0, 12);
        packet.castShadow = false;
        packets.push({ mesh: packet, curve, phase: j * 0.5 + id * 0.04 });
      }
    }
    B.bake(root);
  }

  function createParticles(count){
    const random = APP.TEX.rng(94);
    const positions = new Float32Array(count * 3), seeds = new Float32Array(count);
    for (let i = 0; i < count; i++){
      positions[i * 3] = (random() - 0.5) * 148;
      positions[i * 3 + 1] = random() * 50;
      positions[i * 3 + 2] = (random() - 0.5) * 142;
      seeds[i] = random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: pixelRatio } },
      vertexShader: `attribute float aSeed;uniform float uTime;uniform float uPixelRatio;
        varying float vLife;varying float vSeed;
        void main(){vec3 p=position;p.y=mod(p.y+uTime*(0.37+aSeed*0.6),50.0)-12.0;
          p.x+=sin(uTime*0.18+aSeed*72.0)*1.7;p.z+=cos(uTime*0.11+aSeed*35.0)*1.4;
          vec4 mv=modelViewMatrix*vec4(p,1.0);vLife=smoothstep(-12.0,-6.0,p.y)*(1.0-smoothstep(12.0,38.0,p.y));
          vLife*=1.0-smoothstep(90.0,195.0,-mv.z);vSeed=aSeed;
          gl_PointSize=clamp((1.0+aSeed*1.8)*130.0/max(1.0,-mv.z),1.0,6.0)*uPixelRatio;
          gl_Position=projectionMatrix*mv;}`,
      fragmentShader: `varying float vLife;varying float vSeed;
        void main(){vec2 p=gl_PointCoord-0.5;float r=length(p)*2.0;
          float a=pow(max(0.0,1.0-r),2.3)*vLife*0.62;
          vec3 col=mix(vec3(1.0,0.22,0.035),vec3(1.0,0.69,0.32),vSeed);
          gl_FragColor=vec4(col,a);}`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false
    });
    particles = new THREE.Points(geo, mat);
    particles.frustumCulled = false;
    particles.name = 'Buoyant embers';
    scene.add(particles);
  }

  function createMist(){
    const texture = APP.TEX.softDot('rgba(176,212,240,.44)', 'rgba(92,135,167,.19)');
    const mat = new THREE.SpriteMaterial({ map: texture, color: 0x7798b8, transparent: true, opacity: 0.24, depthWrite: false });
    for (let i = 0; i < 9; i++){
      const sprite = new THREE.Sprite(mat);
      sprite.position.set(Math.sin(i * 2.4) * 32, -2.5 + i % 3, Math.cos(i * 2.4) * 30);
      sprite.scale.set(24, 5.8, 1);
      scene.add(sprite);
    }
    const coldMat = mat.clone(); coldMat.opacity = 0.33;
    const fog = new THREE.Sprite(coldMat);
    fog.position.set(0, 0.5, 32);
    fog.scale.set(17, 3.9, 1);
    scene.add(fog);
  }

  function setupBloom(smallDevice){
    if (smallDevice || !THREE.EffectComposer || !THREE.RenderPass || !THREE.ShaderPass || !THREE.UnrealBloomPass) return;
    const floatSupported = renderer.capabilities.isWebGL2 || (renderer.extensions.has('OES_texture_half_float') && renderer.extensions.has('EXT_color_buffer_half_float'));
    if (!floatSupported) return;
    try {
      composer = new THREE.EffectComposer(renderer);
      const target = new THREE.WebGLRenderTarget(composer.renderTarget1.width, composer.renderTarget1.height, {
        type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat
      });
      // r128 must use the SAME output encoding for the backbuffer and target.
      // Half float avoids the hardware SRGB8_ALPHA8 double-encoding path.
      target.texture.encoding = renderer.outputEncoding;
      composer.reset(target);
      composer.addPass(new THREE.RenderPass(scene, camera));
      composer.addPass(new THREE.UnrealBloomPass(new THREE.Vector2(1, 1), 0.55, 0.45, 0.82));
    } catch (error){
      console.warn('Bloom is unavailable; rendering the scene directly.', error);
      disableBloom();
    }
  }

  function disableBloom(){
    if (!composer) return;
    composer.passes.forEach(pass => { if (pass.dispose) pass.dispose(); });
    composer.renderTarget1.dispose(); composer.renderTarget2.dispose();
    if (composer.copyPass){
      composer.copyPass.material.dispose();
      if (composer.copyPass.fsQuad) composer.copyPass.fsQuad.dispose();
    }
    composer = null;
  }

  /* Fit the actual projected bounds into the unobscured viewport. Both axes
     constrain the distance; portrait users can always zoom back to all six. */
  function measureViewport(){
    const panel = document.getElementById('panel');
    const desktop = width > 900;
    const dock = document.getElementById('dock').getBoundingClientRect();
    const topbar = document.querySelector('.topbar').getBoundingClientRect();
    const panelOpen = panel.classList.contains('open');
    const right = desktop && panelOpen ? width - panel.getBoundingClientRect().width - 18 : width - 24;
    const left = desktop ? 83 : 16;
    const top = Math.max(74, topbar.bottom - 12);
    const bottom = Math.max(top + 100, Math.min(height - 38, dock.top - 12));
    viewport = { left, right: Math.max(left + 120, right), top, bottom, panelOpen };
  }

  function boundsForView(){
    if (activeView === null) return worldBounds;
    const island = islands.get(activeView);
    const p = island.position, r = island.userData.radius + 0.5;
    return new THREE.Box3(V(p.x - r, p.y - 3.7, p.z - r), V(p.x + r, p.y + island.userData.top + 0.7, p.z + r));
  }

  function frameForBounds(bounds){
    const target = bounds.getCenter(new THREE.Vector3());
    const direction = V(...DIRECTION).normalize();
    const right = V(0, 1, 0).cross(direction).normalize();
    const up = direction.clone().cross(right).normalize();
    const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const tx = tangent * camera.aspect * (viewport.right - viewport.left) / width * 0.88;
    const ty = tangent * (viewport.bottom - viewport.top) / height * 0.89;
    let distance = 12;
    for (const x of [bounds.min.x, bounds.max.x]){
      for (const y of [bounds.min.y, bounds.max.y]){
        for (const z of [bounds.min.z, bounds.max.z]){
          const p = V(x, y, z).sub(target);
          const depth = p.dot(direction);
          distance = Math.max(distance, Math.abs(p.dot(right)) / tx + depth, Math.abs(p.dot(up)) / ty + depth);
        }
      }
    }
    return { target, position: target.clone().addScaledVector(direction, distance), distance };
  }

  function updateViewOffset(){
    camera.setViewOffset(width, height,
      width / 2 - (viewport.left + viewport.right) / 2,
      height / 2 - (viewport.top + viewport.bottom) / 2, width, height);
    camera.updateProjectionMatrix();
  }

  function reframe(instant){
    if (!ready || !worldBounds) return;
    measureViewport();
    updateViewOffset();
    const frame = frameForBounds(boundsForView());
    const wide = frameForBounds(worldBounds);
    controls.maxDistance = Math.max(220, wide.distance * 1.7);
    if (instant || reduced.matches){
      camera.position.copy(frame.position); controls.target.copy(frame.target); controls.update(); flight = null;
    } else {
      flight = { from: camera.position.clone(), targetFrom: controls.target.clone(), to: frame.position, targetTo: frame.target, age: 0, duration: 1.7 };
    }
    if (!running) render();
  }

  function flyTo(id){
    if (!islands.has(id)) return;
    activeView = id;
    reframe(false);
  }

  function overview(){
    activeView = null;
    APP.UI.stopTour();
    APP.UI.closePanel();
    reframe(false);
  }

  function resize(){
    if (!renderer) return;
    width = Math.max(1, window.innerWidth); height = Math.max(1, window.innerHeight);
    renderer.setSize(width, height, false);
    if (composer){ composer.setPixelRatio(pixelRatio); composer.setSize(width, height); }
    camera.aspect = width / height;
    reframe(true);
    measureLabels();
  }

  function createLabel(id){
    const c = APP.DATA.byId(id);
    const label = document.createElement('button');
    label.type = 'button'; label.className = 'island-label'; label.dataset.circuit = id;
    label.style.setProperty('--lc', c.color);
    label.innerHTML = '<b>' + (id === 0 ? 'N' : '0' + id) + '</b> ' + (id === 0 ? 'EL NÚCLEO' : APP.DATA.shortName(c).replace(/^los /, '').toUpperCase());
    label.setAttribute('aria-label', c.tag + ': ' + c.title);
    label.addEventListener('click', () => APP.UI.select(id, true));
    label.classList.toggle('active', id === APP.UI.current);
    document.getElementById('labels3d').appendChild(label);
    labels.set(id, { element: label, width: 130, height: 30 });
  }

  function measureLabels(){
    labels.forEach(label => {
      label.width = label.element.offsetWidth || 130;
      label.height = label.element.offsetHeight || 30;
    });
  }

  function updateLabels(){
    if (!viewport) return;
    const occupied = [];
    const point = new THREE.Vector3();
    const offsets = [0, -32, 32, -64, 64, -96, 96];
    for (const id of APP.DATA.ORDER){
      const item = labels.get(id), island = islands.get(id);
      if (!item || !island) continue;
      point.copy(island.position); point.y += island.userData.top + 1.2; point.project(camera);
      let chosen = null;
      if (point.z > -1 && point.z < 1 && Math.abs(point.x) < 1.25 && Math.abs(point.y) < 1.25){
        const x = clamp((point.x * 0.5 + 0.5) * width - item.width / 2, viewport.left, viewport.right - item.width);
        const initialY = (0.5 - point.y * 0.5) * height;
        for (const offset of offsets){
          const y = initialY + offset;
          const rect = { x, y, w: item.width, h: item.height };
          if (y < viewport.top || y + item.height > viewport.bottom) continue;
          if (occupied.some(r => rect.x < r.x + r.w + 8 && rect.x + rect.w + 8 > r.x && rect.y < r.y + r.h + 5 && rect.y + rect.h + 5 > r.y)) continue;
          chosen = rect; break;
        }
      }
      item.element.style.visibility = chosen ? 'visible' : 'hidden';
      if (chosen){
        occupied.push(chosen);
        item.element.style.transform = `translate3d(${Math.round(chosen.x)}px,${Math.round(chosen.y)}px,0)`;
      }
    }
  }

  function createPickVolume(island, id){
    const h = island.userData.top + 2;
    const geo = new THREE.CylinderGeometry(island.userData.radius, island.userData.radius, h, 16);
    const proxy = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
    proxy.position.y = h / 2 - 1;
    proxy.visible = false;
    proxy.userData.circuit = id;
    island.add(proxy);
    pickables.push(proxy);
  }

  function hitTest(x, y){
    ndc.set(x / width * 2 - 1, 1 - y / height * 2);
    scene.updateMatrixWorld();
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(pickables, false);
    return hits.length ? hits[0].object.userData.circuit : null;
  }

  function bindInput(canvas){
    canvas.addEventListener('pointerdown', e => {
      pointer.held = true; pointer.dragged = false;
      pointer.downX = e.clientX; pointer.downY = e.clientY;
      APP.UI.hideTip();
    });
    canvas.addEventListener('pointermove', e => {
      pointer.x = e.clientX; pointer.y = e.clientY;
      if (pointer.held){
        if (Math.hypot(e.clientX - pointer.downX, e.clientY - pointer.downY) > 5) pointer.dragged = true;
        return;
      }
      if (e.pointerType === 'touch') return;
      const id = hitTest(e.clientX, e.clientY);
      canvas.style.cursor = id === null ? 'grab' : 'pointer';
      if (id === null) APP.UI.hideTip();
      else APP.UI.showTip(APP.DATA.byId(id).tag + ' · abrir expediente', e.clientX, e.clientY);
    });
    canvas.addEventListener('pointerup', e => {
      const clicked = pointer.held && !pointer.dragged && Math.hypot(e.clientX - pointer.downX, e.clientY - pointer.downY) < 6;
      pointer.held = false;
      if (clicked){
        const id = hitTest(e.clientX, e.clientY);
        if (id !== null) APP.UI.select(id, true);
      }
    });
    canvas.addEventListener('pointerleave', () => { pointer.held = false; APP.UI.hideTip(); });
    canvas.addEventListener('pointercancel', () => { pointer.held = false; APP.UI.hideTip(); });
    canvas.addEventListener('wheel', () => { flight = null; APP.UI.hideTip(); APP.UI.stopTour(); }, { passive: true });
  }

  function render(){
    if (!renderer || !scene || !camera) return;
    renderer.info.reset();
    try {
      if (composer) composer.render(); else renderer.render(scene, camera);
    } catch (error){
      if (!composer) throw error;
      console.warn('Post-processing failed; switching to direct rendering.', error);
      disableBloom(); renderer.render(scene, camera);
    }
    updateLabels();
  }

  function frame(now){
    if (!running || document.hidden) return;
    const dt = Math.min(0.05, (now - (lastTime || now)) / 1000);
    const wallMs = lastTime ? now - lastTime : 16;
    lastTime = now;
    if (motionEnabled) elapsed += dt;
    if (flight){
      flight.age += dt;
      const u = clamp(flight.age / flight.duration, 0, 1);
      const ease = u * u * u * (u * (u * 6 - 15) + 10);
      camera.position.lerpVectors(flight.from, flight.to, ease);
      controls.target.lerpVectors(flight.targetFrom, flight.targetTo, ease);
      if (u >= 1) flight = null;
    }
    controls.update();
    camera.updateMatrixWorld();
    viewProjection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    viewFrustum.setFromProjectionMatrix(viewProjection);
    motions.forEach(fn => fn(elapsed));
    packets.forEach(p => p.mesh.position.copy(p.curve.getPoint((elapsed * 0.055 + p.phase) % 1)));
    lava.material.uniforms.uTime.value = elapsed;
    particles.material.uniforms.uTime.value = elapsed;
    renderer.info.reset();
    try {
      if (composer) composer.render(dt); else renderer.render(scene, camera);
    } catch (error){
      if (composer){ disableBloom(); renderer.render(scene, camera); }
      else { running = false; showRendererNotice('No se pudo dibujar la escena. Los expedientes siguen disponibles; prueba a recargar la página.'); throw error; }
    }
    if (now - lastLabelFrame > 33){ updateLabels(); lastLabelFrame = now; }
    if (now - lastReadout > 400){
      APP.UI.setCoords('SECTOR 0x0' + APP.UI.current + ' · ' + (activeView === null ? 'VISTA GENERAL' : 'CONEXIÓN ACTIVA'));
      lastReadout = now;
    }
    // A two-stage, bounded degradation; never repeatedly rebuild the scene.
    if (now > 5000 && wallMs < 180 && qualityStage < 2){
      frameCost += wallMs; frameSamples++;
      if (frameSamples >= 120){
        if (frameCost / frameSamples > 38){
          if (qualityStage === 0 && pixelRatio > 1){
            pixelRatio = 1; renderer.setPixelRatio(1);
            particles.material.uniforms.uPixelRatio.value = 1;
            resize();
          } else { disableBloom(); renderer.shadowMap.enabled = false; }
          qualityStage++;
        }
        frameSamples = 0; frameCost = 0;
      }
    }
    frameId = requestAnimationFrame(frame);
  }

  function start(){
    if (!ready || running || document.hidden) return;
    running = true; lastTime = 0;
    frameId = requestAnimationFrame(frame);
  }

  function visibilityChanged(){
    if (document.hidden){ running = false; cancelAnimationFrame(frameId); lastTime = 0; }
    else if (APP.BOOT && APP.BOOT.entered) start();
  }

  function setMotion(enabled){
    motionEnabled = !!enabled;
    document.documentElement.classList.toggle('motion-paused', !motionEnabled);
    const button = document.getElementById('btnMotion');
    if (button){
      button.setAttribute('aria-pressed', String(!motionEnabled));
      button.setAttribute('aria-label', motionEnabled ? 'Pausar movimiento' : 'Reanudar movimiento');
      button.title = motionEnabled ? 'Pausar movimiento' : 'Reanudar movimiento';
    }
    if (!motionEnabled && APP.UI.stopTour) APP.UI.stopTour();
    if (controls) controls.enableDamping = motionEnabled && !reduced.matches;
  }

  function showRendererNotice(text){
    const notice = document.getElementById('nothree');
    notice.textContent = text; notice.classList.remove('hidden');
  }

  function diagnostics(){
    let meshCount = 0;
    if (scene) scene.traverse(o => { if (o.isMesh) meshCount++; });
    return {
      ready, running, motionEnabled, islands: islands.size, meshCount,
      pixelRatio, bloom: !!composer,
      drawCalls: renderer ? renderer.info.render.calls : 0,
      triangles: renderer ? renderer.info.render.triangles : 0,
      programs: renderer ? renderer.info.programs.length : 0
    };
  }

  return { init, start, flyTo, overview, resize, setMotion, diagnostics,
    get motionEnabled(){ return motionEnabled; },
    get renderer(){ return renderer; }, get scene(){ return scene; }, get camera(){ return camera; },
    get controls(){ return controls; }, get composer(){ return composer; } };
})();
