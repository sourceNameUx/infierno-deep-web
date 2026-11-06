/* ============================================================
   audio.js — procedural horror score: a descending lament, dissonant drones,
   a double heartbeat, inharmonic metal and rising, bowed tones in a cavern.
   Local human scream recordings and sobs follow the character animation cues.
   Circuit changes retune the synthesized score; voices briefly duck the music.
   Audio starts only from the sound toggle or an opted-in DESCENDER click.
   Background tabs suspend the context without changing the visitor's choice.
   ============================================================ */
window.APP = window.APP || {};

APP.AUDIO = (function(){
  'use strict';

  let ctx = null, master = null, scoreGain = null, voiceGain = null, bedGain = null, droneGain = null;
  let oscA = null, oscB = null, subOsc = null, noiseSrc = null;
  let started = false, enabled = false;
  let bellTimer = null, heartTimer = null, lamentTimer = null;
  let reverb = null, voiceReverb = null, samplePromise = null;
  let mixVoiceCount = 0;
  const choir = [];
  const lamentNotes = new Set();
  const voiceEchoNodes = [];
  const MIX = { score: 0.9, scoreDuringVoice: 0.56, voice: 0.86 };
  const characterVoices = new Set(), voiceCooldowns = new WeakMap();
  let vocalWave = null, vocalNoise = null;
  const voiceSamples = { pain: [], cry: [] };
  const voiceRanges = new WeakMap();
  const sampleFiles = { pain: ['pain-short.mp3', 'pain-long.mp3'], cry: ['sobbing.mp3'] };
  let previewTimer = null, previewGeneration = 0, startGeneration = 0;
  let currentCircuit = 1;

  // Normalize the decoded recordings, leaving the licensed originals untouched.
  // Peak limiting prevents loud assets from becoming an uncontrolled jump scare.
  function normalizeVoice(buffer){
    let peak = 0, energy = 0;
    for (let channel = 0; channel < buffer.numberOfChannels; channel++){
      const samples = buffer.getChannelData(channel);
      for (let i = 0; i < samples.length; i++){
        peak = Math.max(peak, Math.abs(samples[i]));
        energy += samples[i] * samples[i];
      }
    }
    if (peak < 0.001) throw new Error('The voice recording is silent.');
    const rms = Math.sqrt(energy / (buffer.length * buffer.numberOfChannels));
    const gain = Math.min(0.82 / peak, 0.20 / Math.max(0.001, rms));
    for (let channel = 0; channel < buffer.numberOfChannels; channel++){
      const samples = buffer.getChannelData(channel);
      for (let i = 0; i < samples.length; i++) samples[i] *= gain;
    }
    let first = buffer.length, last = 0;
    for (let channel = 0; channel < buffer.numberOfChannels; channel++){
      const samples = buffer.getChannelData(channel);
      for (let i = 0; i < samples.length; i++){
        if (Math.abs(samples[i]) > 0.02){ first = Math.min(first, i); last = Math.max(last, i); }
      }
    }
    // Skip recorded dead air so ducking starts with the voice, not before it.
    voiceRanges.set(buffer, { start: Math.max(0, first / buffer.sampleRate - 0.025),
      end: Math.min(buffer.duration, last / buffer.sampleRate + 0.04) });
    return buffer;
  }

  function loadVoiceSamples(){
    if (!samplePromise) samplePromise = Promise.all(Object.entries(sampleFiles).map(async ([kind, files]) => {
      const buffers = await Promise.all(files.map(async file => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        try {
          const response = await fetch('audio/' + file, { signal: controller.signal });
          if (!response.ok) throw new Error('Voice asset returned HTTP ' + response.status);
          return normalizeVoice(await ctx.decodeAudioData(await response.arrayBuffer()));
        } catch (error){
          console.warn('Using a synthesized voice fallback for ' + file + ':', error);
          return null;
        } finally {
          clearTimeout(timeout);
        }
      }));
      voiceSamples[kind] = buffers.filter(Boolean);
    }));
    return samplePromise;
  }

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
    ctx = new AC({ latencyHint: 'playback' });

    master = ctx.createGain();
    master.gain.value = 0;
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -12;
    compressor.knee.value = 10;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.012;
    compressor.release.value = 0.3;
    master.connect(compressor);
    compressor.connect(ctx.destination);
    scoreGain = ctx.createGain(); scoreGain.gain.value = MIX.score;
    const scoreFilter = ctx.createBiquadFilter();
    scoreFilter.type = 'lowpass'; scoreFilter.frequency.value = 2400; scoreFilter.Q.value = 0.5;
    scoreGain.connect(scoreFilter); scoreFilter.connect(master);
    voiceGain = ctx.createGain(); voiceGain.gain.value = MIX.voice; voiceGain.connect(master);

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
    wet.connect(scoreGain);
    voiceReverb = ctx.createGain();
    resetVoiceEcho();

    // A soft glottal pulse and breath noise feed the character vowel filters.
    const real = new Float32Array(49), imaginary = new Float32Array(49);
    for (let harmonic = 1; harmonic < imaginary.length; harmonic++) imaginary[harmonic] = 1 / Math.pow(harmonic, 1.2);
    vocalWave = ctx.createPeriodicWave(real, imaginary);
    vocalNoise = noiseBuffer(3, true);

    /* --- fire bed: brown noise through a bandpass that wanders --- */
    bedGain = ctx.createGain();
    bedGain.gain.value = 0.09;
    const bedBP = ctx.createBiquadFilter();
    bedBP.type = 'bandpass';
    bedBP.frequency.value = 650;
    bedBP.Q.value = 1.2;
    const bedLP = ctx.createBiquadFilter();
    bedLP.type = 'lowpass';
    bedLP.frequency.value = 1900;

    noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer(6);
    noiseSrc.loop = true;
    noiseSrc.connect(bedBP);
    bedBP.connect(bedLP);
    bedLP.connect(bedGain);
    bedGain.connect(scoreGain);
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
    breathDepth.gain.value = 0.035;
    breath.connect(breathDepth);
    breathDepth.connect(bedGain.gain);
    breath.start();

    /* Tritones replace the consonant fifth; a low octave anchors the dread. */
    droneGain = ctx.createGain();
    droneGain.gain.value = 0.4;
    const droneLP = ctx.createBiquadFilter();
    droneLP.type = 'lowpass';
    droneLP.frequency.value = 780;
    droneLP.Q.value = 1.2;

    oscA = ctx.createOscillator(); oscA.type = 'triangle';
    oscB = ctx.createOscillator(); oscB.type = 'triangle';
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
    droneGain.connect(scoreGain);

    /* A close, beating cluster carries tension even on small speakers. */
    const choirFilter = ctx.createBiquadFilter();
    choirFilter.type = 'bandpass';
    choirFilter.frequency.value = 850;
    choirFilter.Q.value = 0.8;
    const choirGain = ctx.createGain();
    choirGain.gain.value = 0.16;
    choirFilter.connect(choirGain);
    choirGain.connect(scoreGain);
    choirGain.connect(reverb);
    [4, 4.08, 4 * Math.pow(2, 1 / 12), 8].forEach(ratio => {
      const voice = ctx.createOscillator();
      voice.type = 'triangle';
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

  // Alternating, filtered reflections decay over several seconds. Feedback
  // stays below unity; rebuilding discards old tails on mute or circuit changes.
  function resetVoiceEcho(){
    if (!voiceReverb) return;
    voiceReverb.disconnect();
    voiceEchoNodes.forEach(node => node.disconnect());
    voiceEchoNodes.length = 0;
    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass'; highpass.frequency.value = 140; highpass.Q.value = 0.5;
    const left = ctx.createDelay(1), right = ctx.createDelay(1);
    left.delayTime.value = 0.29; right.delayTime.value = 0.43;
    const leftFilter = ctx.createBiquadFilter(), rightFilter = ctx.createBiquadFilter();
    leftFilter.type = rightFilter.type = 'lowpass';
    leftFilter.frequency.value = 2600; rightFilter.frequency.value = 2200;
    leftFilter.Q.value = rightFilter.Q.value = 0.5;
    const leftFeedback = ctx.createGain(), rightFeedback = ctx.createGain();
    leftFeedback.gain.value = rightFeedback.gain.value = 0.53;
    const leftWet = ctx.createGain(), rightWet = ctx.createGain();
    leftWet.gain.value = 0.27; rightWet.gain.value = 0.25;
    const leftPan = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
    const rightPan = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
    if (leftPan.pan){ leftPan.pan.value = -0.75; rightPan.pan.value = 0.75; }
    voiceReverb.connect(highpass); highpass.connect(left); highpass.connect(right);
    left.connect(leftFilter); right.connect(rightFilter);
    leftFilter.connect(leftFeedback); leftFeedback.connect(right);
    rightFilter.connect(rightFeedback); rightFeedback.connect(left);
    leftFilter.connect(leftWet); leftWet.connect(leftPan); leftPan.connect(voiceGain);
    rightFilter.connect(rightWet); rightWet.connect(rightPan); rightPan.connect(voiceGain);
    voiceEchoNodes.push(highpass, left, right, leftFilter, rightFilter,
      leftFeedback, rightFeedback, leftWet, rightWet, leftPan, rightPan);
  }

  // A restrained minor descent makes the score audible on ordinary speakers,
  // rather than leaving only sub-bass when the human voices enter.
  function lament(){
    if (!ctx || !enabled || document.hidden) return;
    const time = ctx.currentTime + 0.02, root = ROOTS[currentCircuit] * 4;
    [12, 11, 7, 6, 3, 1].forEach((semitones, index) => {
      const t = time + index * 0.85, duration = 2.2;
      const voice = ctx.createOscillator(), filter = ctx.createBiquadFilter();
      const envelope = ctx.createGain();
      const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
      const frequency = root * Math.pow(2, semitones / 12);
      voice.type = 'triangle';
      voice.frequency.setValueAtTime(frequency * 1.004, t);
      voice.frequency.exponentialRampToValueAtTime(frequency * 0.996, t + duration);
      filter.type = 'lowpass'; filter.frequency.value = 1600; filter.Q.value = 0.5;
      envelope.gain.setValueAtTime(0, t);
      envelope.gain.linearRampToValueAtTime(0.085 - index * 0.005, t + 0.24);
      envelope.gain.exponentialRampToValueAtTime(0.025, t + 1.25);
      envelope.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      if (pan.pan) pan.pan.value = index % 2 ? 0.35 : -0.35;
      voice.connect(filter); filter.connect(envelope); envelope.connect(pan);
      pan.connect(scoreGain); pan.connect(reverb);
      let cleaned = false;
      const cleanup = () => {
        if (cleaned) return;
        cleaned = true;
        voice.disconnect(); filter.disconnect(); envelope.disconnect(); pan.disconnect();
        lamentNotes.delete(note);
      };
      const note = { stop(){ try { voice.stop(); } catch {} cleanup(); } };
      lamentNotes.add(note);
      voice.onended = cleanup;
      voice.start(t); voice.stop(t + duration + 0.04);
    });
    lamentTimer = setTimeout(lament, 8000 + Math.random() * 1200);
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
      g.connect(pan); pan.connect(scoreGain); pan.connect(reverb);
    } else {
      g.connect(scoreGain); g.connect(reverb);
    }
    shriek(t + 0.5);
    bellTimer = setTimeout(bell, 4300 + Math.random() * 2800);
  }

  function shriek(t){
    const duration = 3.2;
    const root = ROOTS[currentCircuit] * (5 + Math.random() * 3);
    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0, t);
    envelope.gain.linearRampToValueAtTime(0.09, t + 1.8);
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
    pan.connect(scoreGain);
    pan.connect(reverb);
    const vibrato = ctx.createOscillator();
    const depth = ctx.createGain();
    vibrato.frequency.value = 6.3;
    depth.gain.value = 24;
    vibrato.connect(depth);
    [1, 1.0595].forEach((ratio, index) => {
      const voice = ctx.createOscillator();
      voice.type = 'triangle';
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
    envelope.connect(scoreGain);
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

  function clearCharacterVoices(){
    clearTimeout(previewTimer);
    previewGeneration++;
    characterVoices.forEach(sound => sound.stop());
    resetVoiceEcho();
  }

  function updateVoiceMix(){
    if (!scoreGain) return;
    const active = characterVoices.size > 0;
    if (active === (mixVoiceCount > 0)) return;
    mixVoiceCount = characterVoices.size;
    const t = ctx.currentTime;
    const gain = scoreGain.gain;
    if (gain.cancelAndHoldAtTime) gain.cancelAndHoldAtTime(t);
    else {
      const current = gain.value;
      gain.cancelScheduledValues(t);
      gain.setValueAtTime(current, t);
    }
    gain.setTargetAtTime(active ? MIX.scoreDuringVoice : MIX.score, t, active ? 0.1 : 0.5);
  }

  function trackVoice(sources, nodes, time, duration, offset = 0){
    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      nodes.forEach(node => node.disconnect());
      characterVoices.delete(sound);
      updateVoiceMix();
    };
    const sound = { stop(){
      sources.forEach(source => { try { source.stop(); } catch {} });
      cleanup();
    } };
    sources[0].onended = cleanup;
    characterVoices.add(sound);
    updateVoiceMix();
    try {
      sources.forEach((source, index) => {
        if (index === 0 && offset > 0) source.start(time, offset);
        else source.start(time);
        source.stop(time + duration + 0.04);
      });
    } catch (error){
      sound.stop();
      console.warn('Character voice playback failed:', error);
      return false;
    }
    return true;
  }

  // An opt-in preview makes the new voice unmistakable without waiting for a hit.
  function preview(){
    const generation = ++previewGeneration;
    clearTimeout(previewTimer);
    if (!ctx || !enabled || document.hidden) return;
    loadVoiceSamples().then(() => {
      if (generation !== previewGeneration || !enabled || document.hidden) return;
      previewTimer = setTimeout(() => {
        if (generation !== previewGeneration || !enabled || document.hidden || ctx.state !== 'running') return;
        let figure = null;
        const scene = APP.SCENE && APP.SCENE.scene;
        if (scene) scene.children.forEach(island => {
          if (island.userData.circuit === currentCircuit) island.traverse(actor => {
            if (!figure && actor.userData.actor) figure = actor;
          });
        });
        characterVoices.forEach(sound => sound.stop());
        resetVoiceEcho();
        character(currentCircuit === 5 ? 'cry' : 'pain', figure || { id: currentCircuit }, currentCircuit, 1, true);
      }, 180);
    });
  }

  /* Recorded pain cries and broken sobs, with a synthesized offline fallback.
     Only the selected circuit speaks; three voices and per-actor cooldowns
     keep a cage group from overwhelming the score or allocating every frame. */
  function character(kind, figure, circuit, level = 1, isPreview = false){
    if (!ctx || !enabled || document.hidden || ctx.state !== 'running' || circuit !== currentCircuit) return false;
    if (!figure || (kind !== 'pain' && kind !== 'cry') || (!isPreview && APP.SCENE && !APP.SCENE.motionEnabled)) return false;
    const t = ctx.currentTime;
    if (characterVoices.size >= 3 || (!isPreview && t < (voiceCooldowns.get(figure) || 0))) return false;
    voiceCooldowns.set(figure, t + (kind === 'cry' ? 2.7 : 0.65));

    const crying = kind === 'cry';
    const envelope = ctx.createGain();
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
    let distanceGain = 1;
    const camera = APP.SCENE && APP.SCENE.camera;
    if (camera && figure.getWorldPosition){
      const position = figure.getWorldPosition(new THREE.Vector3()).applyMatrix4(camera.matrixWorldInverse);
      distanceGain = isPreview ? 1 : Math.max(0.8, Math.min(1, 40 / Math.max(1, position.length())));
      if (pan.pan) pan.pan.value = isPreview ? 0 : Math.max(-0.8, Math.min(0.8, position.x / Math.max(4, -position.z)));
    }
    const peak = (crying ? 0.78 : 0.95) * Math.max(0, Math.min(1, level)) * distanceGain;
    const samples = voiceSamples[kind];
    if (samples.length){
      const source = ctx.createBufferSource();
      source.buffer = samples[isPreview && !crying ? samples.length - 1 : Math.floor(Math.random() * samples.length)];
      source.playbackRate.value = 0.94 + (figure.id % 4) * 0.035;
      const range = voiceRanges.get(source.buffer);
      const duration = Math.min(crying ? 2.5 : 2.4, (range.end - range.start) / source.playbackRate.value);
      const offset = range.start + (crying ? Math.random() * Math.max(0, range.end - range.start - duration * source.playbackRate.value) : 0);
      envelope.gain.setValueAtTime(0, t);
      envelope.gain.linearRampToValueAtTime(peak, t + 0.015);
      envelope.gain.setValueAtTime(peak, t + Math.max(0.02, duration - 0.08));
      envelope.gain.linearRampToValueAtTime(0, t + duration);
      source.connect(envelope); envelope.connect(pan); pan.connect(voiceGain); pan.connect(voiceReverb);
      return trackVoice([source], [source, envelope, pan], t, duration, offset);
    }

    const duration = crying ? 2.35 : 0.85 + Math.random() * 0.2;
    const base = 130 + (figure.id % 5) * 24 + Math.random() * 18;
    const voice = ctx.createOscillator(), air = ctx.createBufferSource();
    const vibrato = ctx.createOscillator(), depth = ctx.createGain(), lowpass = ctx.createBiquadFilter();
    const nodes = [voice, air, vibrato, depth, envelope, lowpass, pan];
    envelope.gain.setValueAtTime(0, t);
    if (crying){
      for (let sob = 0; sob < 3; sob++){
        const at = t + sob * 0.74, strength = peak * (1 - sob * 0.13);
        envelope.gain.setValueAtTime(0, at);
        envelope.gain.linearRampToValueAtTime(strength, at + 0.09);
        envelope.gain.linearRampToValueAtTime(strength * 0.4, at + 0.19);
        envelope.gain.linearRampToValueAtTime(strength * 0.85, at + 0.27);
        envelope.gain.linearRampToValueAtTime(0, at + 0.65);
        voice.frequency.setValueAtTime(base * (1 - sob * 0.06), at);
        voice.frequency.linearRampToValueAtTime(base * 1.32, at + 0.10);
        voice.frequency.exponentialRampToValueAtTime(base * 0.78, at + 0.65);
      }
    } else {
      envelope.gain.linearRampToValueAtTime(peak, t + 0.025);
      envelope.gain.linearRampToValueAtTime(peak * 0.65, t + 0.19);
      envelope.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      voice.frequency.setValueAtTime(base * 0.9, t);
      voice.frequency.exponentialRampToValueAtTime(base * 1.8, t + 0.055);
      voice.frequency.exponentialRampToValueAtTime(base * 1.12, t + 0.23);
      voice.frequency.exponentialRampToValueAtTime(base * 0.65, t + duration);
    }
    voice.setPeriodicWave(vocalWave);
    vibrato.frequency.value = crying ? 7.8 : 6.2;
    depth.gain.value = crying ? 42 : 24;
    vibrato.connect(depth); depth.connect(voice.detune);
    const formants = crying ? [480, 1050, 2450] : [650, 1250, 2850];
    formants.forEach((frequency, index) => {
      const filter = ctx.createBiquadFilter(), weight = ctx.createGain();
      filter.type = 'bandpass'; filter.Q.value = [5, 7, 9][index];
      filter.frequency.setValueAtTime(frequency, t);
      filter.frequency.linearRampToValueAtTime(frequency * 0.86, t + duration);
      weight.gain.value = [2.4, 1.6, 0.8][index];
      voice.connect(filter); filter.connect(weight); weight.connect(envelope);
      nodes.push(filter, weight);
    });
    const breathFilter = ctx.createBiquadFilter(), breathGain = ctx.createGain();
    breathFilter.type = 'bandpass'; breathFilter.frequency.value = 1700; breathFilter.Q.value = 0.7;
    breathGain.gain.value = crying ? 0.12 : 0.08;
    air.buffer = vocalNoise; air.loop = true;
    air.connect(breathFilter); breathFilter.connect(breathGain); breathGain.connect(envelope);
    nodes.push(breathFilter, breathGain);
    lowpass.type = 'lowpass'; lowpass.frequency.value = 4200;
    envelope.connect(lowpass); lowpass.connect(pan); pan.connect(voiceGain); pan.connect(voiceReverb);
    return trackVoice([voice, air, vibrato], nodes, t, duration);
  }

  function clearScoreTimers(){
    clearTimeout(bellTimer);
    clearTimeout(heartTimer);
    clearTimeout(lamentTimer);
    lamentNotes.forEach(note => note.stop());
  }

  function cueScore(){
    clearScoreTimers();
    heartbeat();
    bellTimer = setTimeout(bell, 650);
    lamentTimer = setTimeout(lament, 450);
  }

  async function start(){
    const generation = ++startGeneration;
    try {
      if (!started && !build()) throw new Error('Web Audio is not supported.');
      enabled = true;
      updateButton();
      if (ctx.state === 'suspended') await ctx.resume();
      if (generation !== startGeneration || !enabled) return;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0.8, ctx.currentTime, 0.25);
      mood(APP.UI.current);
      if (!document.hidden) cueScore();
      await loadVoiceSamples();
      if (generation !== startGeneration || !enabled || document.hidden) return;
      preview();
    } catch (error){
      if (generation !== startGeneration) return;
      console.warn('Ambient audio is unavailable:', error);
      stop();
      if (APP.UI) APP.UI.toast('El sonido no está disponible. Puedes seguir explorando.');
    }
  }

  function stop(){
    startGeneration++;
    if (!ctx) return;
    enabled = false;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.12);
    clearScoreTimers();
    clearCharacterVoices();
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
    const changed = id !== currentCircuit;
    if (changed) clearCharacterVoices();
    currentCircuit = ROOTS[id] ? id : 1;
    if (!ctx || !started) return;
    const f = ROOTS[id] || ROOTS[1];
    const t = ctx.currentTime;
    oscA.frequency.setTargetAtTime(f, t, 1.4);
    oscB.frequency.setTargetAtTime(f * Math.SQRT2, t, 1.4);
    subOsc.frequency.setTargetAtTime(f, t, 1.4);
    choir.forEach(({ voice, ratio }) => voice.frequency.setTargetAtTime(f * ratio, t, 1.4));
    if (changed && enabled) preview();
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
    o.connect(g); g.connect(scoreGain);
    o.start(t); o.stop(t + 0.7);
    o.onended = () => { o.disconnect(); g.disconnect(); };
  }

  document.addEventListener('visibilitychange', async () => {
    if (!ctx) return;
    try {
      if (document.hidden){ clearScoreTimers(); clearCharacterVoices(); await ctx.suspend(); }
      else if (enabled){
        await ctx.resume();
        if (!enabled || document.hidden) return;
        cueScore();
        preview();
      }
    } catch (error){ console.warn('Audio visibility transition failed:', error); }
  });
  window.addEventListener('pagehide', () => {
    startGeneration++;
    clearScoreTimers();
    clearCharacterVoices();
    if (ctx && ctx.state !== 'closed') ctx.suspend().catch(() => {});
  });

  return { start, stop, toggle, mood, thud, character, preview, get enabled(){ return enabled; } };
})();
