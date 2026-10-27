/* ============================================================
   audio.js — procedural horror score: dissonant drones, a double heartbeat,
   breathing noise, inharmonic metal and rising, bowed shrieks in a cavern.
   Circuit changes retune the score. All sound is synthesized locally.
   Audio starts only from the sound toggle or an opted-in DESCENDER click.
   Background tabs suspend the context without changing the visitor's choice.
   ============================================================ */
window.APP = window.APP || {};

APP.AUDIO = (function(){
  'use strict';

  let ctx = null, master = null, bedGain = null, droneGain = null;
  let oscA = null, oscB = null, subOsc = null, noiseSrc = null;
  let started = false, enabled = false;
  let bellTimer = null, heartTimer = null;
  let reverb = null;
  const choir = [];
  let currentCircuit = 1;

  /* roots per circuit — a minor-ish set that reads as "underground" */
  const ROOTS = { 0: 43.65, 1: 55.00, 2: 49.00, 3: 58.27, 4: 46.25, 5: 61.74 };

  function noiseBuffer(seconds, whiteNoise = false){
    const len = ctx.sampleRate * seconds;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++){
      const white = Math.random() * 2 - 1;
      /* one-pole lowpass: brown-ish noise, much less hiss than white */
      last = (last + 0.02 * white) / 1.02;
      d[i] = whiteNoise ? white : last * 3.2;
    }
    return buf;
  }

  function build(){
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();

    master = ctx.createGain();
    master.gain.value = 0;
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -12;
    compressor.knee.value = 10;
    compressor.ratio.value = 6;
    compressor.attack.value = 0.004;
    compressor.release.value = 0.3;
    master.connect(compressor);
    compressor.connect(ctx.destination);

    /* A shared stereo cavern tail; dry bass stays defined beneath it. */
    reverb = ctx.createConvolver();
    const impulse = ctx.createBuffer(2, Math.floor(ctx.sampleRate * 3.6), ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++){
      const samples = impulse.getChannelData(channel);
      for (let i = 0; i < samples.length; i++){
        samples[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / samples.length, 2.4);
      }
    }
    reverb.buffer = impulse;
    const wet = ctx.createGain();
    wet.gain.value = 0.38;
    reverb.connect(wet);
    wet.connect(master);

    /* --- fire bed: brown noise through a bandpass that wanders --- */
    bedGain = ctx.createGain();
    bedGain.gain.value = 0.13;
    const bedBP = ctx.createBiquadFilter();
    bedBP.type = 'bandpass';
    bedBP.frequency.value = 650;
    bedBP.Q.value = 1.2;
    const bedLP = ctx.createBiquadFilter();
    bedLP.type = 'lowpass';
    bedLP.frequency.value = 1900;

    noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer(6, true);
    noiseSrc.loop = true;
    noiseSrc.connect(bedBP);
    bedBP.connect(bedLP);
    bedLP.connect(bedGain);
    bedGain.connect(master);
    bedGain.connect(reverb);

    /* slow wobble on the filter so the fire "breathes" */
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.19;
    const lfoAmt = ctx.createGain();
    lfoAmt.gain.value = 430;
    lfo.connect(lfoAmt);
    lfoAmt.connect(bedBP.frequency);
    lfo.start();

    const breath = ctx.createOscillator();
    const breathDepth = ctx.createGain();
    breath.frequency.value = 0.23;
    breathDepth.gain.value = 0.09;
    breath.connect(breathDepth);
    breathDepth.connect(bedGain.gain);
    breath.start();

    /* Tritones replace the consonant fifth; a low octave anchors the dread. */
    droneGain = ctx.createGain();
    droneGain.gain.value = 0.32;
    const droneLP = ctx.createBiquadFilter();
    droneLP.type = 'lowpass';
    droneLP.frequency.value = 780;
    droneLP.Q.value = 1.2;

    oscA = ctx.createOscillator(); oscA.type = 'sawtooth';
    oscB = ctx.createOscillator(); oscB.type = 'sawtooth';
    subOsc = ctx.createOscillator(); subOsc.type = 'sine';
    oscA.frequency.value = ROOTS[1];
    oscB.frequency.value = ROOTS[1] * Math.SQRT2;
    oscB.detune.value = -11;
    subOsc.frequency.value = ROOTS[1];

    const gA = ctx.createGain(); gA.gain.value = 0.34;
    const gB = ctx.createGain(); gB.gain.value = 0.22;
    const gS = ctx.createGain(); gS.gain.value = 0.5;

    oscA.connect(gA); oscB.connect(gB); subOsc.connect(gS);
    gA.connect(droneLP); gB.connect(droneLP); gS.connect(droneLP);
    droneLP.connect(droneGain);
    droneGain.connect(master);

    /* A close, beating cluster carries tension even on small speakers. */
    const choirFilter = ctx.createBiquadFilter();
    choirFilter.type = 'bandpass';
    choirFilter.frequency.value = 850;
    choirFilter.Q.value = 0.8;
    const choirGain = ctx.createGain();
    choirGain.gain.value = 0.12;
    choirFilter.connect(choirGain);
    choirGain.connect(master);
    choirGain.connect(reverb);
    [4, 4.08, 4 * Math.pow(2, 1 / 12)].forEach(ratio => {
      const voice = ctx.createOscillator();
      voice.type = 'sawtooth';
      voice.frequency.value = ROOTS[1] * ratio;
      voice.connect(choirFilter);
      voice.start();
      choir.push({ voice, ratio });
    });

    /* very slow tremolo so the drone never sits perfectly still */
    const trem = ctx.createOscillator();
    trem.frequency.value = 0.31;
    const tremAmt = ctx.createGain();
    tremAmt.gain.value = 0.085;
    trem.connect(tremAmt);
    tremAmt.connect(droneGain.gain);
    trem.start();

    oscA.start(); oscB.start(); subOsc.start();
    noiseSrc.start();

    started = true;
    return true;
  }

  /* Inharmonic strikes and bowed rises alternate across the stereo field. */
  function bell(){
    if (!ctx || !enabled || document.hidden) return;
    const t = ctx.currentTime;
    const degree = [0, 1, 6, 13][Math.floor(Math.random() * 4)];
    const base = ROOTS[currentCircuit] * 4 * Math.pow(2, degree / 12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.15, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 3.4);

    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (pan) pan.pan.value = Math.random() * 1.6 - 0.8;

    [1, 2.41, 3.77].forEach((mult, i) => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = base * mult;
      const og = ctx.createGain();
      og.gain.value = 1 / (i + 1.6);
      o.connect(og);
      og.connect(g);
      o.start(t);
      o.stop(t + 3.5);
      o.onended = () => {
        o.disconnect(); og.disconnect();
        if (i === 2){ g.disconnect(); if (pan) pan.disconnect(); }
      };
    });
    if (pan){
      g.connect(pan); pan.connect(master); pan.connect(reverb);
    } else {
      g.connect(master); g.connect(reverb);
    }
    shriek(t + 0.5);
    bellTimer = setTimeout(bell, 4300 + Math.random() * 2800);
  }

  function shriek(t){
    const duration = 3.2;
    const root = ROOTS[currentCircuit] * (5 + Math.random() * 3);
    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0, t);
    envelope.gain.linearRampToValueAtTime(0.11, t + 1.8);
    envelope.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 2;
    filter.frequency.setValueAtTime(650, t);
    filter.frequency.exponentialRampToValueAtTime(2300, t + 2.4);
    filter.connect(envelope);
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
    if (pan.pan){
      const side = Math.random() < 0.5 ? -0.75 : 0.75;
      pan.pan.setValueAtTime(side, t);
      pan.pan.linearRampToValueAtTime(-side, t + duration);
    }
    envelope.connect(pan);
    pan.connect(master);
    pan.connect(reverb);
    const vibrato = ctx.createOscillator();
    const depth = ctx.createGain();
    vibrato.frequency.value = 6.3;
    depth.gain.value = 24;
    vibrato.connect(depth);
    [1, 1.0595].forEach((ratio, index) => {
      const voice = ctx.createOscillator();
      voice.type = 'sawtooth';
      voice.frequency.setValueAtTime(root * ratio, t);
      voice.frequency.exponentialRampToValueAtTime(root * ratio * 2.1, t + duration);
      depth.connect(voice.detune);
      voice.connect(filter);
      voice.start(t);
      voice.stop(t + duration + 0.05);
      voice.onended = () => {
        voice.disconnect();
        if (index === 1){
          filter.disconnect(); envelope.disconnect(); pan.disconnect();
          vibrato.disconnect(); depth.disconnect();
        }
      };
    });
    vibrato.start(t);
    vibrato.stop(t + duration + 0.05);
  }

  function pulse(t, level, pitch){
    const voice = ctx.createOscillator();
    voice.type = 'sine';
    voice.frequency.setValueAtTime(pitch, t);
    voice.frequency.exponentialRampToValueAtTime(43, t + 0.2);
    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0, t);
    envelope.gain.linearRampToValueAtTime(level, t + 0.009);
    envelope.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    voice.connect(envelope);
    envelope.connect(master);
    voice.start(t);
    voice.stop(t + 0.32);
    voice.onended = () => { voice.disconnect(); envelope.disconnect(); };
  }

  function heartbeat(){
    if (!ctx || !enabled || document.hidden) return;
    const t = ctx.currentTime + 0.02;
    pulse(t, 0.48, 135);
    pulse(t + 0.23, 0.32, 110);
    heartTimer = setTimeout(heartbeat, 880 + Math.random() * 110);
  }

  function clearScoreTimers(){
    clearTimeout(bellTimer);
    clearTimeout(heartTimer);
  }

  function cueScore(){
    clearScoreTimers();
    heartbeat();
    bellTimer = setTimeout(bell, 650);
  }

  async function start(){
    try {
      if (!started && !build()) throw new Error('Web Audio is not supported.');
      if (ctx.state === 'suspended') await ctx.resume();
      enabled = true;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0.8, ctx.currentTime, 0.25);
      updateButton();
      mood(APP.UI.current);
      cueScore();
    } catch (error){
      console.warn('Ambient audio is unavailable:', error);
      enabled = false;
      updateButton();
      if (APP.UI) APP.UI.toast('El sonido no está disponible. Puedes seguir explorando.');
    }
  }

  function stop(){
    if (!ctx) return;
    enabled = false;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.12);
    clearScoreTimers();
    updateButton();
  }

  function updateButton(){
    const button = document.getElementById('btnAudio');
    button.classList.toggle('on', enabled);
    button.innerHTML = APP.UI.icon(enabled ? 'audio' : 'muted');
    button.setAttribute('aria-pressed', String(enabled));
    button.setAttribute('aria-label', enabled ? 'Silenciar sonido ambiental' : 'Activar sonido ambiental');
    button.title = enabled ? 'Silenciar sonido ambiental' : 'Activar sonido ambiental';
  }

  function toggle(){ enabled ? stop() : start(); }

  /* circuit change: glide the drone to a new root. An exponential ramp keeps
     the pitch move smooth instead of a click. */
  function mood(id){
    currentCircuit = ROOTS[id] ? id : 1;
    if (!ctx || !started) return;
    const f = ROOTS[id] || ROOTS[1];
    const t = ctx.currentTime;
    oscA.frequency.setTargetAtTime(f, t, 1.4);
    oscB.frequency.setTargetAtTime(f * Math.SQRT2, t, 1.4);
    subOsc.frequency.setTargetAtTime(f, t, 1.4);
    choir.forEach(({ voice, ratio }) => voice.frequency.setTargetAtTime(f * ratio, t, 1.4));
  }

  /* one-shot impact used when a dossier opens */
  function thud(){
    if (!ctx || !enabled) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(38, t + 0.5);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.22, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + 0.7);
    o.onended = () => { o.disconnect(); g.disconnect(); };
  }

  document.addEventListener('visibilitychange', async () => {
    if (!ctx) return;
    try {
      if (document.hidden){ clearScoreTimers(); await ctx.suspend(); }
      else if (enabled){
        await ctx.resume();
        cueScore();
      }
    } catch (error){ console.warn('Audio visibility transition failed:', error); }
  });
  window.addEventListener('pagehide', () => {
    clearScoreTimers();
    if (ctx && ctx.state !== 'closed') ctx.suspend().catch(() => {});
  });

  return { start, stop, toggle, mood, thud, get enabled(){ return enabled; } };
})();
