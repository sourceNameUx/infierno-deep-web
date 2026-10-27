/* boot.js — real progress, a gesture-gated entrance, and a readable fallback. */
window.APP = window.APP || {};

APP.BOOT = (function(){
  'use strict';

  let entered = false, sceneReady = false;
  const interactive = ['.topbar', '#hudNav', '#dock', '#labels3d', '#scene3d'];
  const $ = id => document.getElementById(id);

  function report(message, percent){
    $('bootProgress').value = percent;
    $('bootTerm').textContent = 'EL SUBSUELO DIGITAL\n' +
      '────────────────────────────────────\n' +
      message + '\n' +
      String(Math.round(percent)).padStart(3, ' ') + '% · geometría y texturas locales';
  }

  function enter(){
    if (entered || $('bootEnter').disabled) return;
    entered = true;
    interactive.forEach(selector => {
      const node = document.querySelector(selector);
      if (node) node.inert = false;
    });
    const boot = $('boot');
    boot.classList.add('done');
    boot.setAttribute('aria-hidden', 'true');
    boot.inert = true;
    if (sceneReady) APP.SCENE.start();
    else APP.UI.viewConcept();
    if ($('bootSound').checked && APP.AUDIO) APP.AUDIO.start();
    if (sceneReady) $('btnOverview').focus({ preventScroll: true });
    setTimeout(() => $('hudHint').classList.add('gone'), 10000);
  }

  async function initialize(){
    const button = $('bootEnter');
    button.addEventListener('click', enter);
    APP.UI.init();
    interactive.forEach(selector => {
      const node = document.querySelector(selector);
      if (node) node.inert = true;
    });
    try {
      await APP.SCENE.init(report);
      sceneReady = true;
      button.innerHTML = 'DESCENDER <span class="arr" aria-hidden="true">↓</span>';
    } catch (error){
      const detail = String(error && error.message || error);
      if (!window.__errs.includes(detail)) window.__errs.push(detail);
      console.error('Scene initialization failed:', error);
      $('bootTerm').textContent = 'El 3D no está disponible en este navegador.\n' +
        'Puedes explorar todos los expedientes sin él.\n' +
        'Para recuperar la escena, activa la aceleración\n' +
        'gráfica y abre index.html en Chrome o Edge actualizado.';
      $('bootProgress').hidden = true;
      button.textContent = 'EXPLORAR LOS EXPEDIENTES';
      $('nothree').textContent = 'Modo lectura: el 3D no está disponible. Activa la aceleración gráfica y recarga para volver a la escena.';
      $('nothree').classList.remove('hidden');
      $('btnOverview').disabled = true;
      $('btnMotion').disabled = true;
      document.getElementById('labels3d').replaceChildren();
    }
    $('boot').setAttribute('aria-busy', 'false');
    button.disabled = false;
    if (document.activeElement === document.body) button.focus({ preventScroll: true });
  }

  return { initialize, get entered(){ return entered; }, get sceneReady(){ return sceneReady; } };
})();

APP.BOOT.initialize();
