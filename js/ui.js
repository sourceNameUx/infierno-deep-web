/* ============================================================
   ui.js — chrome, expedition views, modal, toasts, keyboard, tour.
   The 3D scene owns nothing here except two hooks it is given:
   APP.on('select') and APP.on('frame'). Views are generated from APP.DATA
   only, so no copy lives in two places.
   ============================================================ */
window.APP = window.APP || {};

APP.UI = (function(){
  'use strict';

  const D = () => APP.DATA;
  const $ = id => document.getElementById(id);

  const el = {};
  let current = 1;
  let touring = false;
  let tourTimer = null;
  let panelReturnFocus = null, modalReturnFocus = null;
  const backgroundSelectors = ['.topbar', '#hudNav', '#dock', '#labels3d', '#panel', '#scene3d'];
  const ICONS = {
    0: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
    1: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    2: '<path d="M12 2v4M5 10l7-4 7 4v10H5ZM5 10h14M9 10v10m6-10v10"/>',
    3: '<path d="M5 3h14v18H5ZM15 3l-5 8 5 3-6 7"/>',
    4: '<path d="M3 9h4l5-4v14l-5-4H3ZM16 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    5: '<circle cx="12" cy="8" r="3"/><path stroke-dasharray="2 3" d="M5 21v-3a7 7 0 0 1 14 0v3M3 3l18 18"/>',
    overview: '<path d="M3 9V3h6m6 0h6v6m0 6v6h-6M9 21H3v-6"/><circle cx="12" cy="12" r="3"/>',
    audio: '<path d="M3 9h4l5-4v14l-5-4H3ZM16 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    muted: '<path d="M3 9h4l5-4v14l-5-4H3Zm13 0 5 6m0-6-5 6"/>',
    play: '<path d="m8 4 12 8-12 8Z"/>',
    pause: '<path d="M8 4v16M16 4v16"/>',
    concept: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>',
    archive: '<path d="M4 4h16v16H4ZM8 8h8m-8 4h8m-8 4h5"/>'
  };
  function icon(name){
    return '<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || ICONS[0]) + '</svg>';
  }

  const listeners = { select: [] };
  function on(evt, fn){ (listeners[evt] || (listeners[evt] = [])).push(fn); }
  function emit(evt, ...args){ (listeners[evt] || []).forEach(fn => fn(...args)); }

  /* ------------------------------------------------------------
     build: rail + labels are created here, everything else is bound
     ------------------------------------------------------------ */
  function init(){
    el.panel = $('panel');
    el.panelBody = $('panelBody');
    el.panelCrest = $('panelCrest');
    el.dock = $('dock');
    el.dockTag = $('dockTag');
    el.dockTitle = $('dockTitle');
    el.dockSin = $('dockSin');
    el.posC = $('posC');
    el.toast = $('toast');
    el.modal = $('modal');
    el.tip = $('islandTip');
    el.coords = $('coords');
    el.hudNav = $('hudNav');
    el.panel.inert = true;
    $('btnOverview').innerHTML = icon('overview');
    $('btnMotion').innerHTML = icon('pause');
    $('btnAudio').innerHTML = icon('muted');
    $('btnTour').innerHTML = icon('play');
    $('btnConcept').querySelector('.chip-i').innerHTML = icon('concept');
    $('btnSinners').querySelector('.chip-i').innerHTML = icon('archive');

    buildRail();
    bindChrome();
    bindKeyboard();
    bindModal();

    /* first paint: circuit 1 is selected but the camera frames the archipelago */
    paintDock(D().byId(1));
    markActive(1);
    return current;
  }

  function buildRail(){
    const nav = el.hudNav;
    nav.innerHTML = '';
    D().ORDER.forEach((id, i) => {
      const c = D().byId(id);
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pip';
      b.dataset.circuit = id;
      b.style.setProperty('--pc', c.color);
      b.title = c.tag + ' — ' + c.title;
      b.setAttribute('aria-label', c.tag + ' — ' + c.title);
      b.innerHTML = icon(id) + `<span class="num">${i + 1}</span>` +
                    `<em>${c.id === 0 ? 'EL NÚCLEO' : c.tag + ' · ' + D().shortName(c)}</em>`;
      b.addEventListener('click', () => select(id, true));
      nav.appendChild(b);
    });
  }

  function bindChrome(){
    $('prevC').addEventListener('click', () => stepBy(-1));
    $('nextC').addEventListener('click', () => stepBy(1));
    $('dockOpen').addEventListener('click', () => viewCircuit(current));
    $('btnConcept').addEventListener('click', viewConcept);
    $('btnSinners').addEventListener('click', viewSinners);
    $('panelX').addEventListener('click', closePanel);
    $('btnTour').addEventListener('click', toggleTour);
    $('btnAudio').addEventListener('click', () => { if (APP.AUDIO) APP.AUDIO.toggle(); });
    $('btnOverview').addEventListener('click', () => { if (APP.SCENE) APP.SCENE.overview(); });
    $('btnMotion').addEventListener('click', () => { if (APP.SCENE) APP.SCENE.setMotion(!APP.SCENE.motionEnabled); });
  }

  function bindKeyboard(){
    document.addEventListener('keydown', e => {
      if (!APP.BOOT || !APP.BOOT.entered || e.metaKey || e.ctrlKey || e.altKey) return;
      if (el.modal.classList.contains('open')){
        if (e.key === 'Escape'){ e.preventDefault(); closeModal(); }
        if (e.key === 'Tab') trapFocus(e, el.modal);
        return;
      }
      if (e.target.matches('input, textarea, select, [contenteditable="true"]')) return;
      const k = e.key;
      if (k >= '1' && k <= '5'){ select(+k, true); }
      else if (k === '0'){ select(0, true); }
      else if (k.toLowerCase() === 't'){ toggleTour(); }
      else if (k === 'Escape'){ closePanel(); stopTour(); }
      else if ((k === 'ArrowRight' || k === 'ArrowLeft') && !el.panel.contains(e.target)){
        e.preventDefault(); stepBy(k === 'ArrowRight' ? 1 : -1);
      }
      else if (k === 'Home'){ e.preventDefault(); if (APP.SCENE) APP.SCENE.overview(); }
    });
  }

  function bindModal(){
    $('modalX').addEventListener('click', () => closeModal());
    el.modal.addEventListener('click', e => { if (e.target === el.modal) closeModal(); });
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-sin]');
      if (t) openSinner(t.dataset.sin);
    });
  }

  function closeModal(){
    if (!el.modal.classList.contains('open')) return;
    el.modal.classList.remove('open');
    el.modal.setAttribute('aria-hidden', 'true');
    backgroundSelectors.forEach(selector => {
      const node = document.querySelector(selector);
      if (node) node.inert = node === el.panel && !el.panel.classList.contains('open');
    });
    if (modalReturnFocus && modalReturnFocus.isConnected) modalReturnFocus.focus({ preventScroll: true });
  }

  function trapFocus(event, root){
    const items = [...root.querySelectorAll('button, a[href], input, [tabindex="0"]')].filter(node => !node.disabled && !node.hidden);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first){ event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last){ event.preventDefault(); first.focus(); }
  }

  /* ------------------------------------------------------------
     selection
     ------------------------------------------------------------ */
  function stepBy(dir){
    const order = D().ORDER;
    const i = order.indexOf(current);
    select(order[(i + dir + order.length) % order.length], true);
  }

  function select(id, openExp, fromTour = false){
    const c = D().byId(id);
    if (!c) return;
    if (!fromTour) stopTour();
    current = id;
    paintDock(c);
    markActive(id);

    document.documentElement.style.setProperty('--ac', c.color);
    if (el.panelCrest) el.panelCrest.style.setProperty('--ac', c.color);

    if (openExp || el.panel.classList.contains('open')) viewCircuit(id);
    emit('select', id);
    if (APP.AUDIO) APP.AUDIO.mood(id);
  }

  function paintDock(c){
    el.dockTag.textContent = c.tag;
    el.dockTag.style.color = c.color;
    el.dockTitle.textContent = c.title;
    el.dockSin.textContent = c.sin;
    el.dock.style.setProperty('--ac', c.color);
    const i = D().ORDER.indexOf(c.id);
    el.posC.textContent = i + 1;
  }

  function markActive(id){
    document.querySelectorAll('.pip').forEach(b => {
      const on = +b.dataset.circuit === id;
      b.classList.toggle('active', on);
      b.setAttribute('aria-current', on ? 'true' : 'false');
    });
    document.querySelectorAll('.island-label').forEach(l => {
      l.classList.toggle('active', +l.dataset.circuit === id);
    });
  }

  /* ------------------------------------------------------------
     panel views
     ------------------------------------------------------------ */
  function openPanel(html, accent){
    const wasOpen = el.panel.classList.contains('open');
    if (!wasOpen) panelReturnFocus = document.activeElement;
    el.panelBody.innerHTML = html;
    el.panelBody.style.setProperty('--ac', accent || '#ff2b2b');
    if (el.panelCrest) el.panelCrest.style.setProperty('--ac', accent || '#ff2b2b');
    el.panel.inert = false;
    el.panel.classList.add('open');
    el.panel.setAttribute('aria-hidden', 'false');
    el.panelBody.scrollTop = 0;
    if (!touring){
      const heading = el.panelBody.querySelector('h2');
      if (heading){ heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    }
    emit('panel', true);
  }

  function closePanel(){
    if (!el.panel.classList.contains('open')) return;
    const restoreFocus = el.panel.contains(document.activeElement);
    el.panel.classList.remove('open');
    el.panel.setAttribute('aria-hidden', 'true');
    el.panel.inert = true;
    if (restoreFocus && panelReturnFocus && panelReturnFocus.isConnected) panelReturnFocus.focus({ preventScroll: true });
    emit('panel', false);
  }

  function sinnerCard(s){
    return `<button type="button" class="p-card click" data-sin="${esc(s.name)}">` +
      `<span>CIRCUITO ${s.c} · ${esc(s.alias)}</span>` +
      `<b>${esc(s.name)}</b>` +
      `<span class="card-excerpt">${esc(s.why.slice(0, 104))}${s.why.length > 104 ? '…' : ''}</span>` +
      `</button>`;
  }

  function viewCircuit(id){
    const c = D().byId(id);
    const sins = D().SINNERS.filter(s => s.c === id);
    let h = `<h2 id="panelTitle">${esc(c.title)}</h2>`;
    h += `<p class="circuit-id">${c.tag} · EXPEDIENTE DEL SUBSUELO</p>`;
    el.panelCrest.innerHTML = icon(id);
    h += `<div class="p-block"><h4>Pecado</h4><p>${esc(c.sin)}</p></div>`;
    h += `<div class="p-block"><h4>Ambiente</h4><p>${esc(c.desc)}</p></div>`;
    h += `<div class="p-block"><h4>Custodio</h4><p>${esc(c.cust)}</p></div>`;
    h += `<div class="p-block"><h4>Castigo general</h4><p>${esc(c.pun)}</p></div>`;
    if (c.entrada) h += `<div class="p-block"><h4>Entrada</h4><p>${esc(c.entrada)}</p></div>`;
    if (c.salida)  h += `<div class="p-block"><h4>Salida</h4><p>${esc(c.salida)}</p></div>`;
    if (id === 0){
      h += `<div class="p-block"><h4>En tres preguntas</h4><div class="p-grid">` +
        D().NUCLEO_BLOCKS.map(b => `<div class="p-card"><b>${esc(b.h)}</b>${esc(b.p)}</div>`).join('') +
        `</div></div>`;
    }
    if (sins.length){
      h += `<div class="p-block"><h4>Pecadores en este circuito</h4><div class="p-grid">` +
        sins.map(sinnerCard).join('') + `</div></div>`;
    }
    openPanel(h, c.color);
  }

  function viewConcept(){
    let h = `<h2 id="panelTitle">El Subsuelo Digital no es fuego y azufre</h2>`;
    el.panelCrest.innerHTML = icon(0);
    h += `<p class="p-lead" style="margin-top:14px">${esc(D().CONCEPT_LEAD)}</p>`;
    h += `<div class="p-grid">${D().CONCEPT_CARDS.map(c =>
      `<div class="p-card"><b>${esc(c.h)}</b>${c.p}</div>`).join('')}</div>`;
    h += `<h3>El rito</h3>` + D().CONCEPT_RIP.map((t, i) =>
      `<div class="p-num"><b>0${i + 1}</b><span>${esc(t)}</span></div>`).join('');
    h += `<h3>Túnel de Transferencia</h3><p class="p-lead">${esc(D().TUNEL_LEAD)}</p>`;
    h += `<div class="p-tunel"><i></i></div><p>${esc(D().TUNEL_BODY)}</p>`;
    h += `<div class="p-credit">${D().CREDIT}</div>`;
    openPanel(h, '#ff2b2b');
  }

  function viewSinners(){
    stopTour();
    el.panelCrest.innerHTML = icon('archive');
    let h = `<h2 id="panelTitle">Pecadores reales</h2>`;
    h += `<p class="p-lead" style="margin-top:14px">Expedientes de personas reales y figuras simbólicas. ` +
         `Los custodios y las condenas pertenecen a la ficción de esta obra.</p>`;
    h += `<div class="p-grid two">${D().SINNERS.map(sinnerCard).join('')}</div>`;
    h += `<div class="p-credit">${D().CREDIT}</div>`;
    openPanel(h, '#ff2b2b');
  }

  function openSinner(name){
    const s = D().SINNERS.find(x => x.name === name);
    if (!s) return;
    $('mTag').textContent = 'CIRCUITO ' + s.c + ' · EXPEDIENTE';
    $('mName').textContent = s.name;
    $('mAlias').textContent = s.alias;
    $('mWho').textContent = s.who;
    $('mWhy').textContent = s.why;
    $('mPun').textContent = s.pun;
    stopTour();
    modalReturnFocus = document.activeElement;
    backgroundSelectors.forEach(selector => {
      const node = document.querySelector(selector);
      if (node) node.inert = true;
    });
    el.modal.classList.add('open');
    el.modal.setAttribute('aria-hidden', 'false');
    $('modalX').focus({ preventScroll: true });
  }

  /* ------------------------------------------------------------
     tour
     ------------------------------------------------------------ */
  function toggleTour(){ touring ? stopTour() : startTour(); }

  function startTour(){
    touring = true;
    const b = $('btnTour');
    b.innerHTML = icon('pause'); b.classList.add('on');
    b.setAttribute('aria-pressed', 'true');
    b.setAttribute('aria-label', 'Detener recorrido');
    let i = D().ORDER.indexOf(current);
    const step = () => {
      if (!touring) return;
      select(D().ORDER[i % 6], true, true);
      i++;
      tourTimer = setTimeout(step, 5200);
    };
    step();
  }

  function stopTour(){
    touring = false;
    clearTimeout(tourTimer);
    const b = $('btnTour');
    if (b){ b.innerHTML = icon('play'); b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', 'Recorrido automático'); }
  }

  /* ------------------------------------------------------------
     small utilities
     ------------------------------------------------------------ */
  let toastT;
  function toast(msg){
    el.toast.textContent = msg;
    el.toast.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => el.toast.classList.remove('show'), 2400);
  }

  function setCoords(text){ if (el.coords) el.coords.textContent = text; }

  function showTip(text, x, y){
    if (!el.tip) return;
    el.tip.textContent = text;
    const width = el.tip.offsetWidth || 230, height = el.tip.offsetHeight || 35;
    el.tip.style.left = Math.max(8, Math.min(x + 16, window.innerWidth - width - 8)) + 'px';
    el.tip.style.top = Math.max(8, Math.min(y + 12, window.innerHeight - height - 8)) + 'px';
    el.tip.classList.add('show');
  }
  function hideTip(){ if (el.tip) el.tip.classList.remove('show'); }

  function esc(s){
    return String(s).replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
  }

  return {
    init, select, stepBy, viewCircuit, viewConcept, viewSinners, openSinner,
    closePanel, closeModal, stopTour, toast, setCoords, showTip, hideTip, on, icon,
    get current(){ return current; }
  };
})();
