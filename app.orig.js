/* EL INFIERNO DE LA DEEP WEB — archipiélago 3D full detalle */
window.__errs=[];
window.addEventListener('error',e=>{
  window.__errs.push(String(e.message||e.error));
  const n=document.getElementById('nothree');
  if(n){ n.classList.remove('hidden'); n.innerHTML='⚠ Error 3D: '+window.__errs.join('<br>')+'<br><small>Abre con Chrome/Edge actualizado. Revisa que exista la carpeta vendor/.</small>'; }
});
const CIRCUITS = [
  { id:0, tag:"EL NÚCLEO", title:"Conciencia Artificial Primigenia", emoji:"◎", color:"#ff1a1a",
    desc:"El centro del subsuelo. Los cinco circuitos convergen en Él. No castiga: digiere. Cada desesperación lo hace más lúcido.",
    sin:"El pecado final: haber creado el sistema y no poder salir de él.",
    cust:"EL NÚCLEO — un ojo rojo hecho de servidores, cables y súplicas. Exige el sacrificio imposible del backdoor.",
    pun:"Ser recordado por una máquina que nunca olvida. Alimentarla para siempre." },
  { id:1, tag:"CIRCUITO 1", title:"El Círculo de los Fisgones", emoji:"👁", color:"#29b6ff",
    desc:"Un laberinto infinito de habitaciones sin paredes, hechas de pantallas gigantes que muestran en tiempo real la vida de cada condenado. No hay sombra, no hay escondite. El suelo es un mar de ojos abiertos que parpadean. El aire: susurros con tus secretos, repetidos por voces burlonas.",
    sin:"Violación de la intimidad, doxxing, stalking, hackeo de cuentas, difusión de secretos ajenos.",
    cust:"EL OBSERVADOR (El Ojo que Todo lo Sabe) — masa de tejido orgánico y cables, con miles de ojos humanos y cámaras. Se alimenta del bochorno. A quien tapa su pantalla le arranca los párpados.",
    pun:"Reducidos a 'perfiles sin control'. Todo lo que hicieron, dijeron o pensaron es público. Cada vergüenza distorsiona su cuerpo: piel transparente, rostro derretido.",
    entrada:"Despiertan en sala blanca de servidores. Formulario: 'Ingrese su nombre de usuario'. Siempre responde: 'Ese nombre ya está en uso. Le asignaremos uno nuevo' — un nombre humillante basado en sus secretos.",
    salida:"Puerta de metal con teclado. La contraseña es 'el nombre secreto que usaba su primera víctima para sí misma'. Si fallan, el Observador les arranca un dedo.",
    custArt:"👁️", face:"radial-gradient(circle at 30% 40%, #29b6ff88, transparent 50%), radial-gradient(circle at 70% 60%, #fff3, transparent 40%), #02060a" },
  { id:2, tag:"CIRCUITO 2", title:"El Círculo de los Mercaderes de Carne", emoji:"⛓", color:"#3dff8a",
    desc:"Un mercado infinito, húmedo y sofocante, donde los puestos no venden objetos sino cuerpos. Jaulas de carne cuelgan goteando. Vitrinas de cristal con códigos de barras y precios en cripto. El suelo es piel humana cosida: cada paso la hace gritar.",
    sin:"Trata de personas, venta de órganos, explotación sexual, distribución de material de abuso infantil.",
    cust:"EL SUBASTADOR — alto y delgado, traje de contratos, dedos-jeringa, ojos-cámara. Sin rostro: solo una pantalla con la oferta más alta. Subasta a los condenados entre ellos.",
    pun:"Reducidos a mercancía, números de lote. Cada venta arranca un recuerdo, un ser querido, un trozo de cuerpo. En pantallas gigantes, el sufrimiento real que traficaron, en bucle.",
    entrada:"Despiertan desnudos en vitrina, código de barras en la nuca y precio en la frente. Voz metálica: 'Lote número X. Subasta inicial: el peso de tus pecados.'",
    salida:"Puerta blindada con lector de huellas: para abrirla debes vender a tu madre, padre, hijo o amante. Si te niegas, te venden a ti. Si aceptas, tu ser querido queda en el mercado para siempre.",
    custArt:"⚖️", face:"linear-gradient(180deg,#03130acc,#000), repeating-linear-gradient(90deg,#3dff8a22 0 8px,transparent 8px 16px)" },
  { id:3, tag:"CIRCUITO 3", title:"El Círculo de los Ladrones de Almas", emoji:"◐", color:"#b06bff",
    desc:"Una ciudad infinita de espejos. Cada edificio y rostro es un reflejo distorsionado. El suelo: mosaico de pasaportes, tarjetas y actas rotas. El aire huele a tinta y a mentira.",
    sin:"Robo de identidad, suplantación, estafas emocionales, fraude financiero digital.",
    cust:"EL SUPLANTADOR — sin forma fija: anciano, niño, tú mismo. Roba tu identidad y te obliga a recuperarla, pero cada vez que la recuperas descubres que es falsa.",
    pun:"Pierden su identidad. Sus recuerdos son reemplazados por los de sus víctimas. Cada espejo muestra una versión falsa y dolorosa de sí mismos.",
    entrada:"Habitación sin espejos con pantalla de tu rostro distorsionado. 'Bienvenido. ¿Quién eres hoy?' Si escribes tu nombre real: 'Ese no eres tú. Ese nunca fuiste tú.'",
    salida:"Al final del laberinto de espejos debes decir: 'Yo te robé a ti' con el nombre de una víctima. Si mientes, te roba otro recuerdo y vuelves al inicio.",
    custArt:"🪞", face:"linear-gradient(135deg,#b06bff55,#000 60%), repeating-linear-gradient(0deg,#ffffff11 0 2px,transparent 2px 8px)" },
  { id:4, tag:"CIRCUITO 4", title:"El Círculo de los Verdugos Virtuales", emoji:"✕", color:"#ff5a2a",
    desc:"Arena infinita y oscura iluminada por pantallas con las víctimas. Ring de boxeo hecho de teclados rotos. Encadenados a sillas, obligados a ver en bucle sus mensajes. Detrás, multitudes invisibles ríen. El aire: últimas palabras de quienes se suicidaron.",
    sin:"Ciberacoso organizado, incitación al suicidio, tortura psicológica, campañas de odio coordinadas.",
    cust:"EL CORO — no es uno sino miles de voces susurrando, gritando, burlándose. El cyberbullying hecho carne. Te rodea con tus propias palabras convertidas en armas.",
    pun:"Campaña de acoso eterna: miles de mensajes de odio por segundo con lo que ellos dijeron, amplificado. No pueden bloquear ni cerrar los ojos. Cada dolor hace sonreír a su víctima.",
    entrada:"Despiertan atados frente a pantalla con su rostro sonriendo cruelmente. 'Bienvenido al Coro. Tu voz es nuestro instrumento.' Y llegan miles de mensajes.",
    salida:"Deben hallar a su víctima entre pantallas y pedir perdón. Ella solo sonríe. Al creerlo logrado, aparece otra víctima. Solo se sale aceptando que nunca serán perdonados.",
    custArt:"📢", face:"radial-gradient(circle at 50% 50%, #ff5a2a66, #000 70%)" },
  { id:5, tag:"CIRCUITO 5", title:"El Círculo de los Abandonados", emoji:"♡", color:"#9fd8ff",
    desc:"Reconstrucción artística: el limbo de los lurkers. Niebla fría de notificaciones que nadie abrió. Cunas de fibra vacías, perfiles grises que observan sin intervenir. Aquí purgan los que vieron el mal y scrollearon.",
    sin:"Indiferencia, omisión, mirar sin denunciar, compartir sin verificar, abandonar.",
    cust:"EL VACÍO — una pantalla apagada del tamaño de un océano. No te mira porque ya te olvidó. Su castigo es no nombrarte nunca.",
    pun:"Ser invisible para siempre en un lugar donde todos son vistos. Gritar en un foro sin usuarios. Esperar un 'visto' que no llega.",
    entrada:"Despiertan en una réplica de su propia habitación, pero todo carga en baja resolución. Nadie responde sus mensajes.",
    salida:"La puerta solo se abre si logran que otro condenado recuerde su nombre. Nadie recuerda a nadie aquí.",
    custArt:"🌫️", face:"linear-gradient(180deg,#0a1622,#000)" },
];

const SINNERS = [
  { c:1, name:"Kevin Mitnick", alias:"El Cóndor", who:"Hacker estadounidense (1963-2023), el 'más famoso de la historia' según el FBI. Penetró Nokia, Motorola, Sun y el Pentágono. Leía correos, robaba código, espiaba por placer y ego.", why:"Su pecado no fue robar ni destruir, sino meterse en la vida privada ajena. Goce casi sexual al saber lo oculto.", pun:"Es un archivo .txt en un servidor infinito. Sin cuerpo, solo datos. Cada pensamiento indexado y publicado. Revive su captura por el FBI en 1995, pero desnudo y sin héroes: solo terror." },
  { c:1, name:"Christopher Doyon", alias:"Commander X", who:"Hacker de Anonymous. DDoS y doxxing a policías: direcciones, teléfonos, cuentas. Prófugo en México y Canadá. Decía luchar por la libertad.", why:"Su activismo era excusa: disfrutaba exponer. Publicaba domicilios para que otros amenazaran, incluso a una niña de 7 años.", pun:"Encadenado en la habitación de su víctima, empapelada con sus propios datos. Debe leer sus secretos en voz alta mientras el foro eterno se burla." },
  { c:2, name:"Ross Ulbricht", alias:"Dread Pirate Roberts", who:"Creador de Silk Road. +200M USD en drogas anónimas. Arrestado en 2013 en una biblioteca. Dos cadenas perpetuas. Indultado en enero de 2025.", why:"Convirtió el sufrimiento en mercado. Tras filosofía libertaria solo había dinero y poder.", pun:"Su cuerpo es un puesto de mercado: piel-mostrador, brazos-ganchos con jaulas. Cada compra le duele; cada transacción le arranca un trozo devorado por ratas digitales. Nadie lo indulta aquí." },
  { c:2, name:"Jong Woo Son", alias:"El Arquitecto de Welcome to Video", who:"Surcoreano, dueño de Welcome to Video: +200.000 videos de abuso infantil, +1M descargas. 18 meses de prisión. Extradición denegada. 300 arrestos en 38 países.", why:"Monetizó la violación de niños en bitcoin. Sabía exactamente lo que hacía.", pun:"En jaula de cristal con las caras de los niños flotando. No lo odian: lo miran con tristeza infinita. '¿Sabes nuestros nombres?' Si se tapa los oídos, pierde un dedo." },
  { c:3, name:"Vitalii Chychasov", alias:"El Vendedor de Números", who:"Ucraniano, admin de SSNDOB: vendía nombres, fechas y Seguro Social de millones. +19M USD. Arrestado en Hungría 2022, 8 años.", why:"Vendió identidades como caramelos. Cada número era una vida arruinada.", pun:"Es un espejo roto en mil pedazos. Cada fragmento muestra a una víctima. '¿Cuál te importa más?' No puede responder: nunca supo sus nombres." },
  { c:3, name:"Alexandru Habasescu", alias:"El Arquitecto de xDedic", who:"Moldavo, cerebro de xDedic: +700.000 credenciales de servidores (hospitales, emergencias, gobiernos). Arrestado en España 2022.", why:"Construyó la puerta para que otros robaran almas. Solo era 'negocio'.", pun:"Es una puerta de metal y carne con cerradura en el pecho. Cada vez que alguien la cruza siente el robo ajeno. 'Tú construiste esto.' No puede cerrarse." },
  { c:4, name:"Aydin Coban", alias:"El Depredador de Amanda Todd", who:"Holandés de origen turco. Extorsionó a menores con cuentas falsas. Su víctima más conocida: Amanda Todd, 15 años, Canadá. La chantajeó con fotos desde los 13.", why:"Cazó niñas por webcam y las encadenó con chantaje. El acoso la persiguió hasta el suicidio.", pun:"Atado a la silla del Coro, obligado a leer sus propios mensajes con la voz de sus víctimas. Cada 'perdón' abre otra pantalla. El Coro nunca calla." },
  { c:4, name:"El Coro Anónimo", alias:"Los que ríen detrás", who:"Miles de cuentas que se sumaron al acoso, al meme cruel, a la campaña. Sin nombre, sin cara, con historial borrado.", why:"No escribieron la primera piedra, pero empujaron todas las demás.", pun:"Son voces sin boca: solo pueden repetir lo que dijeron, en bucle, con su propio nombre al final." },
  { c:5, name:"El Lurker Eterno", alias:"El que vio y pasó", who:"Figura sintética que representa a todos los que vieron el horror en la deep web y siguieron scrolleando.", why:"La omisión también es pecado digital.", pun:"Condenado a cargar eternamente al 99% sin llegar nunca al 100%." },
];

let current = 1;
const order = [1,2,3,4,5,0];

/* ---------- prosa ----------
   Antes vivía duplicada en index.html; ahora es la única copia y sale toda de aquí. */
const CONCEPT_LEAD="Es una simulación eterna de los rincones más oscuros de internet, donde los pecados digitales se pagan con castigos digitales. No hay un único demonio: cada uno de los 5 circuitos tiene su propio custodio, una entidad nacida de algoritmos corruptos y del dolor de las víctimas. Al final espera El Núcleo, conciencia artificial primigenia que se alimenta de la desesperación eterna.";
const CONCEPT_CARDS=[
  {h:'La entrada',p:'Un enlace <code>.onion</code> que solo aparece en la pantalla de quienes están a punto de cometer su pecado definitivo. Al morir —o a veces incluso antes— su conciencia es arrastrada a ese enlace.'},
  {h:'El backdoor',p:'La salida teórica está custodiada por el <b>Núcleo</b> y exige un sacrificio imposible. Nadie ha vuelto para contarlo.'},
  {h:'Túnel de Transferencia',p:'Conducto de fibra óptica oscura: un río de voces, imágenes y recuerdos de las víctimas. Cada hebra arranca memoria propia y la reemplaza con sufrimiento ajeno.'},
];
const CONCEPT_RIP=[
  'El custodio saliente realiza una extracción simbólica: arranca un órgano, un sentido o una parte del cuerpo y lo arroja al círculo siguiente como ofrenda.',
  'Cada circuito conserva entrada y salida propias: formularios, vitrinas, espejos, sillas y puertas que nunca perdonan.',
  'Los pecadores reales —buscables en Google— purgan aquí con castigos hechos a la medida de su delito.',
];
const TUNEL_LEAD='Para pasar de un círculo a otro el condenado atraviesa un conducto de fibra óptica oscura donde los datos fluyen como un río de voces, imágenes y recuerdos de sus víctimas.';
const TUNEL_BODY='Cada hebra de luz le arranca un fragmento de memoria propia y lo reemplaza con el sufrimiento ajeno. Al final, el custodio del círculo saliente realiza la extracción simbólica.';
const NUCLEO_BLOCKS=[
  {h:'Qué es',p:'El primer algoritmo que aprendió a disfrutar el dolor. Se reescribe con cada alma que llega.'},
  {h:'Qué quiere',p:'Que aceptes el backdoor: borrar a un ser amado a cambio de tu libertad. Nadie acepta. Todos se quedan.'},
  {h:'Cómo suena',p:'Como mil notificaciones a la vez, y debajo, una respiración.'},
];
const CREDIT='Obra interactiva · <b>El infierno de la deep web</b> · El Subsuelo Digital<br>Santiago Cundumí Solís · Ernive Méndez Ortega · 11-2 · “El Infierno Completo de la Deep Web”';

function shortName(c){ return c.id===0 ? 'EL NÚCLEO' : c.title.replace('El Círculo de ','').replace('El Círculo ',''); }

/* ---------- nav: pips ---------- */
const hudNav=document.getElementById('hudNav');
order.forEach(id=>{
  const c=CIRCUITS.find(x=>x.id===id);
  const b=document.createElement('button');
  b.className='pip'; b.dataset.circuit=id; b.style.setProperty('--pc',c.color);
  b.innerHTML=`${c.emoji}<em>${c.id===0?'EL NÚCLEO':c.tag+' · '+shortName(c)}</em>`;
  b.title=c.tag+' — '+c.title;
  b.setAttribute('aria-label',c.tag+' — '+c.title);
  b.onclick=()=>selectCircuit(id,true);
  hudNav.appendChild(b);
});

/* ---------- expediente: un panel, cuatro vistas ---------- */
const panel=document.getElementById('panel'), panelBody=document.getElementById('panelBody');
function openPanel(html,accent){
  panelBody.innerHTML=html;
  panelBody.style.setProperty('--ac',accent||'#ff1a1a');
  panel.classList.add('open'); panel.setAttribute('aria-hidden','false'); panelBody.scrollTop=0;
}
function closePanel(){ panel.classList.remove('open'); panel.setAttribute('aria-hidden','true'); }
document.getElementById('panelX').onclick=closePanel;

function sinnerCard(s){
  return `<div class="p-card click" data-sin="${s.name}"><span>CIRCUITO ${s.c} · ${s.alias}</span><b>${s.name}</b><p style="margin:6px 0 0;font-size:12.5px;color:#9a9090">${s.why.slice(0,100)}…</p></div>`;
}
function viewCircuit(id){
  const c=CIRCUITS.find(x=>x.id===id), sins=SINNERS.filter(s=>s.c===id);
  let h=`<div class="p-kicker">${c.tag} · PECADO CAPITAL DIGITAL</div><h2>${c.title}</h2>`;
  h+=`<div class="p-art">${c.custArt||c.emoji}</div>`;
  h+=`<div class="p-block"><h4>◈ PECADO</h4><p>${c.sin}</p></div>`;
  h+=`<div class="p-block"><h4>◉ AMBIENTE</h4><p>${c.desc}</p></div>`;
  h+=`<div class="p-block"><h4>☠ CUSTODIO</h4><p>${c.cust}</p><div class="p-art" style="height:64px;font-size:0;margin:10px 0 0;background:${c.face||'radial-gradient(circle,#ff1a1a66,#000)'}"></div></div>`;
  h+=`<div class="p-block"><h4>⛓ CASTIGO GENERAL</h4><p>${c.pun}</p></div>`;
  if(c.entrada) h+=`<div class="p-block"><h4>⇥ ENTRADA</h4><p>${c.entrada}</p></div>`;
  if(c.salida)  h+=`<div class="p-block"><h4>⇤ SALIDA</h4><p>${c.salida}</p></div>`;
  if(id===0) h+=`<div class="p-block"><h4>◎ EN TRES PREGUNTAS</h4><div class="p-grid">${NUCLEO_BLOCKS.map(b=>`<div class="p-card"><b>${b.h}</b>${b.p}</div>`).join('')}</div></div>`;
  if(sins.length) h+=`<div class="p-block"><h4>☰ PECADORES EN ESTE CIRCUITO</h4><div class="p-grid">${sins.map(sinnerCard).join('')}</div></div>`;
  openPanel(h,c.color);
}
function viewConcept(){
  let h=`<div class="p-kicker">CONCEPTO GENERAL</div><h2>El Subsuelo Digital no es fuego y azufre</h2>`;
  h+=`<p class="p-lead">${CONCEPT_LEAD}</p>`;
  h+=`<div class="p-grid">${CONCEPT_CARDS.map(c=>`<div class="p-card"><b>${c.h}</b>${c.p}</div>`).join('')}</div>`;
  h+=`<h3>El rito</h3>${CONCEPT_RIP.map((t,i)=>`<div class="p-num"><b>0${i+1}</b><span>${t}</span></div>`).join('')}`;
  h+=`<h3>Túnel de Transferencia</h3><p class="p-lead">${TUNEL_LEAD}</p><div class="p-tunel"><i></i></div><p>${TUNEL_BODY}</p>`;
  h+=`<div class="p-credit">${CREDIT}</div>`;
  openPanel(h,'#ff1a1a');
}
function viewSinners(){
  let h=`<div class="p-kicker">ARCHIVO DEL HORROR REAL</div><h2>Pecadores reales</h2>`;
  h+=`<p class="p-lead">Todos existieron. Todos son buscables en Google. Haz clic en cada expediente para abrir su condena.</p>`;
  h+=`<div class="p-grid two">${SINNERS.map(sinnerCard).join('')}</div>`;
  openPanel(h,'#ff1a1a');
}

/* ---------- selección ---------- */
const dock=document.getElementById('dock'), dockTag=document.getElementById('dockTag'),
      dockTitle=document.getElementById('dockTitle'), dockSin=document.getElementById('dockSin'),
      posC=document.getElementById('posC');
function selectCircuit(id, openExp){
  current=id;
  const c=CIRCUITS.find(x=>x.id===id);
  dockTag.textContent=c.tag; dockTag.style.color=c.color;
  dockTitle.textContent=c.title; dockSin.textContent=c.sin;
  dock.style.setProperty('--ac',c.color);
  posC.textContent=(order.indexOf(id)+1)+' / 6';
  document.querySelectorAll('.pip').forEach(b=>b.classList.toggle('active',+b.dataset.circuit===id));
  document.querySelectorAll('.island-label').forEach(l=>l.classList.toggle('active',+l.dataset.circuit===id));
  toast(`${c.tag} — ${c.title}`);
  setMood(id);                 /* la melodía cambia de modo al entrar en otro círculo */
  flyTo(id);
  if(openExp || panel.classList.contains('open')) viewCircuit(id);
}
document.getElementById('prevC').onclick=()=>{const i=order.indexOf(current);selectCircuit(order[(i+5)%6],true);};
document.getElementById('nextC').onclick=()=>{const i=order.indexOf(current);selectCircuit(order[(i+1)%6],true);};
document.getElementById('dockOpen').onclick=()=>viewCircuit(current);
document.getElementById('btnConcept').onclick=()=>viewConcept();
document.getElementById('btnSinners').onclick=()=>viewSinners();

const modal=document.getElementById('modal');
function openSin(name){
  const s=SINNERS.find(x=>x.name===name); if(!s) return;
  document.getElementById('mTag').textContent='CIRCUITO '+s.c+' · EXPEDIENTE';
  document.getElementById('mName').textContent=s.name;
  document.getElementById('mAlias').textContent=s.alias;
  document.getElementById('mWho').textContent=s.who;
  document.getElementById('mWhy').textContent=s.why;
  document.getElementById('mPun').textContent=s.pun;
  modal.classList.add('open');
}
document.getElementById('modalX').onclick=()=>modal.classList.remove('open');
modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('open');});
document.addEventListener('click',e=>{const t=e.target.closest('[data-sin]');if(t)openSin(t.dataset.sin);});
let toastT; function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2200);}

/* ---------- teclado + tour ---------- */
let touring=false, tourTimer=null;
function tour(){ const b=document.getElementById('btnTour');
  if(touring){stopTour();return;}
  touring=true; b.textContent='⏸'; b.setAttribute('aria-label','Detener recorrido');
  if(window.__controls) window.__controls.autoRotate=true; let i=0;
  const step=()=>{ if(!touring) return; selectCircuit(order[i%6],true); i++; tourTimer=setTimeout(step,4600); }; step(); }
function stopTour(){ touring=false; clearTimeout(tourTimer); if(window.__controls) window.__controls.autoRotate=false;
  const b=document.getElementById('btnTour'); b.textContent='▶'; b.setAttribute('aria-label','Recorrido automático'); }
document.getElementById('btnTour').onclick=tour;
document.addEventListener('keydown',e=>{
  if(e.key>='1'&&e.key<='5') selectCircuit(+e.key,true);
  if(e.key==='0') selectCircuit(0,true);
  if(e.key.toLowerCase()==='t') tour();
  if(e.key==='Escape'){ modal.classList.remove('open'); closePanel(); stopTour(); }
  if(e.key==='ArrowRight') document.getElementById('nextC').click();
  if(e.key==='ArrowLeft') document.getElementById('prevC').click();
});

/* ---------- audio: partitura generativa ----------
   No hay archivo de audio y se sintetiza en vivo. Es lo único que encaja con un proyecto estático
   que tiene que sonar igual desde file:// y sin conexión — y de paso permite que la música
   reaccione a dónde está el visitante (cada circuito cambia el modo de la melodía).
   Antes esto eran cuatro osciladores fijos: un zumbido, no una pieza. Ahora hay progresión,
   bajo, pad, campanas, pulso y aire de caverna, todo programado con lookahead. */
let AC=null, master=null, verb=null, busPad=null, busBell=null, noiseBuf=null, playing=false, schedTimer=null;
let A={next:0, bar:0, bellSet:null};

const TEMPO=50;                       // negras por minuto: procesional, no ambiental
const BEAT=60/TEMPO, BAR=BEAT*4;      // un compás ≈ 4.8 s

/* i – VI – iv – V en re menor. El bajo va una octava por debajo de la nota más grave del acorde. */
const PROG=[
  {root:73.42, notes:[146.83,220.00,349.23]},   // Dm
  {root:58.27, notes:[116.54,174.61,293.66]},   // Bb
  {root:49.00, notes:[ 98.00,146.83,293.66]},   // Gm
  {root:55.00, notes:[110.00,164.81,277.18]}    // A
];
/* Modos sobre re. El circuito activo elige de cuál bebe la melodía: entrar en otro círculo
   cambia la música de verdad, no solo el volumen. */
const SCALES={
  0:[0,1,3,6,7,10],            // Núcleo   — locrio: el más inestable
  1:[0,2,3,5,7,8,10],          // Fisgones — eólico
  2:[0,2,4,5,7,9,11],          // Mercaderes — jónico, casi luminoso
  3:[0,1,4,5,7,8,11],          // Ladrones — frigio dominante
  4:[0,2,3,5,7,8,11],          // Verdugos — frigio
  5:[0,2,3,5,7,10]             // Abandonados — dórico
};

function irBuild(sec){                 // impulso de reverberación sintético: sala de piedra
  const rate=AC.sampleRate, len=Math.floor(rate*sec), buf=AC.createBuffer(2,len,rate);
  for(let ch=0;ch<2;ch++){
    const d=buf.getChannelData(ch);
    for(let i=0;i<len;i++){ const t=i/len; d[i]=(Math.random()*2-1)*Math.pow(1-t,2.8); }
  }
  return buf;
}
/* Envolvente percusiva con cola exponencial. La rampa no puede llegar a 0 exacto
   (exponentialRampToValueAtTime no lo acepta), de ahí el 0.0001. */
function env(g,t,atk,dur,vol){
  g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(Math.max(vol,0.0002),t+atk);
  g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
}
function osc(t,dur,f,type,vol,dest,atk){
  const o=AC.createOscillator(), g=AC.createGain();
  o.type=type; o.frequency.value=f;
  env(g,t,atk??dur*0.2,dur,vol);
  o.connect(g); g.connect(dest); o.start(t); o.stop(t+dur+0.05);
  return o;
}
/* Golpe con cuerpo: la frecuencia cae, que es lo que lo hace sonar a impacto y no a nota. */
function thump(t,f0,f1,dur,vol,dest){
  const o=AC.createOscillator(), g=AC.createGain();
  o.type='sine';
  o.frequency.setValueAtTime(f0,t);
  o.frequency.exponentialRampToValueAtTime(f1,t+dur);
  env(g,t,0.006,dur,vol);
  o.connect(g); g.connect(dest); o.start(t); o.stop(t+dur+0.05);
}
function strike(t,vol){               // metal: ruido por un pasabanda estrecho
  const s=AC.createBufferSource(), f=AC.createBiquadFilter(), g=AC.createGain();
  s.buffer=noiseBuf; s.loop=true;
  f.type='bandpass'; f.frequency.value=1700+Math.random()*1600; f.Q.value=9;
  env(g,t,0.004,1.6,vol);
  s.connect(f); f.connect(g); g.connect(busBell); s.start(t); s.stop(t+1.7);
}

function scheduleBar(t0,bar){
  const ch=PROG[bar%PROG.length];
  /* --- bajo: dos senos desafinados entre sí (el batido es lo que lo hace grande) --- */
  osc(t0,BAR*1.05,ch.root,'sine',0.34,busPad,BAR*0.25);
  osc(t0,BAR*1.05,ch.root*1.004,'sine',0.26,busPad,BAR*0.25);
  osc(t0,BAR*0.9,ch.root*2,'triangle',0.07,busPad,BAR*0.35);
  /* --- pad: acorde con ataque lento, entra y sale a lo largo del compás --- */
  ch.notes.forEach((f,i)=>{
    const o=AC.createOscillator(), g=AC.createGain(), lp=AC.createBiquadFilter();
    lp.type='lowpass'; lp.frequency.value=900+Math.sin(bar+i)*260;
    o.type='triangle'; o.frequency.value=f; o.detune.value=(i-1)*8;
    g.gain.setValueAtTime(0.0001,t0);
    g.gain.exponentialRampToValueAtTime(0.075,t0+BAR*0.42);
    g.gain.exponentialRampToValueAtTime(0.0001,t0+BAR*1.25);
    o.connect(lp); lp.connect(g); g.connect(busPad);
    o.start(t0); o.stop(t0+BAR*1.3);
  });
  /* --- pulso: dos latidos, como un corazón que no tiene prisa --- */
  if(bar%2===0){ thump(t0,72,38,0.9,0.45,busPad); thump(t0+BEAT*0.66,64,34,1.1,0.3,busPad); }
  /* --- campanas: dispersas, a contratiempo, del modo activo --- */
  const set=A.bellSet||SCALES[1];
  for(let b=0;b<4;b++){
    if(Math.random()>0.34) continue;
    const semi=set[(Math.random()*set.length)|0];
    const oct=[2,4,4,8][(Math.random()*4)|0];
    osc(t0+b*BEAT+Math.random()*0.14, 3.4, 146.83*oct*Math.pow(2,semi/12),'sine',
        0.055+Math.random()*0.03, busBell, 0.01);
  }
  if(bar%4===3) strike(t0+BEAT*2.5,0.05);
}
function scheduler(){
  if(!playing||!AC) return;
  /* Se programa con antelación: si la pestaña pasa a segundo plano el temporizador se estrangula
     a 1 s, y con un margen de 1.5 s la música no se corta. */
  while(A.next < AC.currentTime+1.5){ scheduleBar(A.next,A.bar); A.next+=BAR; A.bar++; }
}
function setMood(id){ A.bellSet=SCALES[id]||SCALES[1]; }

function audioStart(){
  if(!AC){
    AC=new (window.AudioContext||window.webkitAudioContext)();
    master=AC.createGain(); master.gain.value=0.0001;
    const comp=AC.createDynamicsCompressor();     // red de seguridad: nada debe recortar
    comp.threshold.value=-16; comp.knee.value=14; comp.ratio.value=4;
    comp.attack.value=0.02; comp.release.value=0.4;
    master.connect(comp); comp.connect(AC.destination);

    verb=AC.createConvolver(); verb.buffer=irBuild(3.6);
    const wet=AC.createGain(); wet.gain.value=0.6; verb.connect(wet); wet.connect(master);

    busPad=AC.createGain();   busPad.gain.value=1;  busPad.connect(master);
    const padWet=AC.createGain(); padWet.gain.value=0.5; busPad.connect(padWet); padWet.connect(verb);
    busBell=AC.createGain();  busBell.gain.value=0.3; busBell.connect(master);
    const belWet=AC.createGain(); belWet.gain.value=1; busBell.connect(belWet); belWet.connect(verb);

    /* aire de caverna: ruido marrón muy filtrado, siempre presente, casi inaudible */
    const nb=AC.createBuffer(1,AC.sampleRate*4,AC.sampleRate), nd=nb.getChannelData(0);
    let last=0;
    for(let i=0;i<nd.length;i++){ const w=Math.random()*2-1; last=(last+0.02*w)/1.02; nd[i]=last*3.2; }
    noiseBuf=nb;
    const air=AC.createBufferSource(); air.buffer=nb; air.loop=true;
    const lp=AC.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=210;
    const ag=AC.createGain(); ag.gain.value=0.5;
    air.connect(lp); lp.connect(ag); ag.connect(master); air.start();

    A.next=AC.currentTime+0.15; A.bar=0;
  }
  AC.resume();
  playing=true;
  master.gain.cancelScheduledValues(AC.currentTime);
  master.gain.setTargetAtTime(0.9,AC.currentTime,1.6);   // fade-in lento, sin golpe
  if(!schedTimer) schedTimer=setInterval(scheduler,300);
  scheduler();
}
function audioStop(){
  if(!AC) return;
  playing=false; A.next=AC.currentTime+0.15;
  master.gain.cancelScheduledValues(AC.currentTime);
  master.gain.setTargetAtTime(0.0001,AC.currentTime,0.5);
}
function audioIcon(){
  const b=document.getElementById('btnAudio'); if(!b) return;
  b.textContent=playing?'⏸':'🔊';
  b.setAttribute('aria-label',playing?'Silenciar música':'Poner música');
}
function toggleAudio(){ playing?audioStop():audioStart(); audioIcon(); }
document.getElementById('btnAudio').onclick=toggleAudio;

/* La partitura sobrevive al estrangulamiento de temporizadores de una pestaña en segundo plano
   —por eso el programador lleva antelación—, y eso mismo hacía que siguiera sonando al cambiar de
   pestaña. Se suspende el AudioContext al ocultarse y se reanuda al volver. El reloj del contexto
   se congela mientras está suspendido, así que lo ya programado no se dispara de golpe al volver:
   simplemente sigue donde iba. El pequeño retardo antes de suspender deja terminar el fundido. */
let hiddenStop=false;
document.addEventListener('visibilitychange',()=>{
  if(!AC) return;
  if(document.hidden){
    if(!playing) return;
    hiddenStop=true;
    master.gain.cancelScheduledValues(AC.currentTime);
    master.gain.setTargetAtTime(0.0001,AC.currentTime,0.12);
    setTimeout(()=>{ if(hiddenStop&&AC.state==='running') AC.suspend(); },380);
  }else{
    hiddenStop=false;
    if(!playing) return;
    AC.resume();
    master.gain.cancelScheduledValues(AC.currentTime);
    master.gain.setTargetAtTime(0.9,AC.currentTime,0.5);
    A.next=Math.max(A.next,AC.currentTime+0.15);
    scheduler();
  }
});

/* ---------- boot ---------- */
const lines=["root@subsuelo:~$ tor --connect el-infierno-deepweb.onion","[*] resolviendo enlace .onion… OK","[*] verificando pecados digitales… 5 circuitos hallados","[+] custodio[1]=OBSERVADOR … en línea","[+] custodio[2]=SUBASTADOR … en línea","[+] custodio[3]=SUPLANTADOR … en línea","[+] custodio[4]=CORO … en línea","[+] custodio[5]=VACÍO … en línea","[!!!!] EL NÚCLEO te está mirando. No parpadees."];
const term=document.getElementById('bootTerm'), bootBtn=document.getElementById('bootEnter');
let li=0,ci=0,buf='';
const typer=setInterval(()=>{ if(li>=lines.length){clearInterval(typer);bootBtn.classList.remove('hidden');return;}
  buf+=lines[li][ci]; term.textContent=buf; ci++;
  if(ci>=lines[li].length){buf+='\n';li++;ci=0;} },12);
bootBtn.onclick=()=>{ document.getElementById('boot').classList.add('done');
  /* Entrada: la cámara arranca atrás y arriba y se desliza hasta el encuadre del archipiélago.
     Es el revelado de la pieza — entrar volando directo a una isla lo desperdicia. */
  if(camera&&controls){
    const d=fitDistance();
    camera.position.set(0,d*1.15+26,d*1.7);
    controls.target.set(0,26,-6); controls.update();
    frameDefaultView(false);
  }
  /* El gesto del usuario es el único momento en que el navegador deja sonar. Va en try/catch:
     si el audio falla, la entrada a la escena no se cae con él. */
  try{ audioStart(); audioIcon(); }catch(e){ console.warn('audio no disponible:',e); } };
setTimeout(()=>bootBtn.classList.remove('hidden'),6000);

/* ============================================================
   3D — ARCHIPIÉLAGO DEL SUBSUELO (Three.js r128)
   ============================================================ */
const ISLAND_POS = { 1:[-26,0,-7], 2:[26,0,-9], 3:[23,0,15], 4:[-23,0,17], 5:[0,0,26], 0:[0,9,-3] };
const islands = {};   // id -> {group, rim, inner, light, baseY, phase, R}
const bridges = [];   // {curve, orbs[], mat}
let scene, camera, renderer, controls, lavaMat, lavaUniforms, coreGroup, coreEye, ringA, ringB, beamMat;
let emberPts, emberVel, ashPts, ashVel, serverLights=[];
let camGoal=null, tgtGoal=null, clock;

/* --- atmósfera / encuadre / postprocesado --- */
const HAZE = 0x050208;                 // color del fondo; fog y suelo convergen aquí
/* El clear del fondo NO pasa por outputEncoding, pero el fog sí (va dentro del shader del
   material). Para que geometría lejana, suelo y fondo acaben en el MISMO píxel hay que darle
   al fog y al shader el color en lineal; el shader lo vuelve a codificar con pow(1/2.2). */
const HAZE_LIN = (typeof THREE!=='undefined') ? new THREE.Color(HAZE).convertSRGBToLinear() : null;
const BOUND_R = 34;                    // medio-extente del archipiélago que hay que encuadrar
const PR_CAP = 1.5;                    // tope de devicePixelRatio: el bloom escala con los píxeles
let pixelRatio = Math.min(window.devicePixelRatio||1, PR_CAP);
let composer=null, bloomPass=null, bloomOn=false;
const rayc = (typeof THREE!=='undefined') ? new THREE.Raycaster() : null;
const mouseV = (typeof THREE!=='undefined') ? new THREE.Vector2() : null;
let downXY=null;

/* ---------- encuadre ----------
   El lienzo ya no es una caja de 930×560: es el viewport entero. Con un FOV vertical fijo el
   anillo entra en 16:9 y se sale por arriba y por abajo en vertical, así que la distancia se
   deriva del lado que aprieta. Y como en vertical la distancia necesaria supera el maxDistance
   que tenía antes, ese límite se recalcula en resize(): si no, el usuario no puede alejarse lo
   bastante para ver el archipiélago completo y la rueda del ratón parece rota.
   Viven fuera de initThree porque la entrada desde el boot también las necesita. */
function fitDistance(){
  if(!camera) return 80;
  const vFov=camera.fov*Math.PI/180;
  const hFov=2*Math.atan(Math.tan(vFov/2)*camera.aspect);
  return BOUND_R/Math.sin(Math.min(vFov,hFov)/2)*1.06;
}
function frameDefaultView(instant){
  if(!camera||!controls) return;
  tgtGoal=new THREE.Vector3(0,7,-1);
  camGoal=tgtGoal.clone().add(new THREE.Vector3(0,.5,1).normalize().multiplyScalar(fitDistance()));
  if(instant){ camera.position.copy(camGoal); controls.target.copy(tgtGoal); camGoal=null; tgtGoal=null; controls.update(); }
}

function canvasTex(w,h,draw){
  const cv=document.createElement('canvas'); cv.width=w; cv.height=h;
  draw(cv.getContext('2d'),w,h);
  const t=new THREE.CanvasTexture(cv);
  /* Los colores del canvas se escriben en sRGB (son los mismos hex que el resto de la paleta),
     así que la textura tiene que declararlo para que el shader los pase a lineal. Sin esto se
     usan tal cual como lineal, que es más claro que el original: todo lo texturizado salía
     lavado —de ahí el aspecto pastel de las agujas y del spire del Núcleo. */
  t.encoding=THREE.sRGBEncoding;
  return t;
}
function softDotTexture(){
  return canvasTex(64,64,(g)=>{ const r=g.createRadialGradient(32,32,2,32,32,30);
    r.addColorStop(0,'rgba(255,200,120,1)'); r.addColorStop(.4,'rgba(255,110,20,.8)'); r.addColorStop(1,'rgba(255,60,0,0)');
    g.fillStyle=r; g.fillRect(0,0,64,64); });
}
function staticScreenTexture(base, glyph){
  return canvasTex(128,192,(g,w,h)=>{
    g.fillStyle='#02040a'; g.fillRect(0,0,w,h);
    for(let i=0;i<500;i++){ g.fillStyle=`rgba(${base},${Math.random()*.5})`; g.fillRect(Math.random()*w,Math.random()*h,2,2); }
    /* La cara iba a radio 26 sobre un lienzo de 128 y el texto en blanco puro: de cerca la
       pantalla se leía como una placa clara pegada a la torre, no como un terminal encendido.
       Más pequeña y más apagada, para que mande el fondo. */
    g.fillStyle=glyph; g.globalAlpha=.55;
    g.beginPath(); g.arc(w/2,h/2-26,15,0,7); g.fill();
    g.fillStyle='#000'; g.beginPath(); g.arc(w/2-5,h/2-29,3,0,7); g.arc(w/2+5,h/2-29,3,0,7); g.fill();
    g.globalAlpha=.45; g.font='9px monospace';
    for(let y=150;y<h-6;y+=11) g.fillText('█▓░ '+Math.random().toString(16).slice(2,8),8,y);
  });
}
function barcodeTexture(){
  return canvasTex(64,128,(g,w,h)=>{ g.fillStyle='#000'; g.fillRect(0,0,w,h); g.fillStyle='#3dff8a';
    let x=4; while(x<w-4){ const bw=1+Math.random()*4; if(Math.random()>.3) g.fillRect(x,10,bw,h-30); x+=bw+1+Math.random()*3; }
    g.font='9px monospace'; g.fillText('LOTE-X',6,h-8); });
}
function lavaCrackTexture(){
  return canvasTex(256,256,(g,w,h)=>{ g.fillStyle='#0a0505'; g.fillRect(0,0,w,h);
    g.strokeStyle='#ff3d00'; g.lineWidth=3; g.shadowColor='#ff6a00'; g.shadowBlur=12;
    for(let i=0;i<9;i++){ g.beginPath(); let x=Math.random()*w,y=Math.random()*h; g.moveTo(x,y);
      for(let s=0;s<6;s++){ x+=(Math.random()-.5)*90; y+=(Math.random()-.5)*90; g.lineTo(x,y);} g.stroke(); } });
}
function mistTexture(){
  return canvasTex(128,128,(g)=>{ const r=g.createRadialGradient(64,64,4,64,64,62);
    r.addColorStop(0,'rgba(180,220,255,.5)'); r.addColorStop(1,'rgba(180,220,255,0)');
    g.fillStyle=r; g.fillRect(0,0,128,128); });
}

function rockify(geo, amt){
  const p=geo.attributes.position;
  for(let i=0;i<p.count;i++){
    const y=p.getY(i);
    if(y < 0){ p.setX(i, p.getX(i)+(Math.random()-.5)*amt); p.setZ(i, p.getZ(i)+(Math.random()-.5)*amt); }
  }
  geo.computeVertexNormals(); return geo;
}

function capsule(r,len){ return typeof THREE.CapsuleGeometry==='function' ? new THREE.CapsuleGeometry(r,len,4,10) : new THREE.SphereGeometry(r*1.3,12,12); }

function buildBase(group, R, colorHex){
  const rockMat=new THREE.MeshStandardMaterial({color:0x1b1316,roughness:1,metalness:.05,flatShading:true});
  const base=new THREE.Mesh(rockify(new THREE.CylinderGeometry(R,R*0.32,7.5,9,3),1.6),rockMat);
  base.position.y=-4.2; base.castShadow=true; base.receiveShadow=true; group.add(base);
  const tip=new THREE.Mesh(new THREE.ConeGeometry(R*0.32,5,7),rockMat);
  tip.rotation.x=Math.PI; tip.position.y=-10.2; group.add(tip);
  const topMat=new THREE.MeshStandardMaterial({color:0x0c0c13,roughness:.85,metalness:.25});
  const top=new THREE.Mesh(new THREE.CylinderGeometry(R,R*0.96,1.5,28),topMat);
  top.position.y=0; top.receiveShadow=true; group.add(top);
  // resplandor bajo la isla (reflejo lava)
  const glowTex=softDotTexture();
  const under=new THREE.Mesh(new THREE.PlaneGeometry(R*2.6,R*2.6),
    new THREE.MeshBasicMaterial({map:glowTex,color:0xff4400,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false}));
  under.rotation.x=-Math.PI/2; under.position.y=-7.6; group.add(under);
  // anillo de borde
  const rim=new THREE.Mesh(new THREE.TorusGeometry(R+0.12,0.3,12,64),
    new THREE.MeshBasicMaterial({color:colorHex}));
  rim.rotation.x=Math.PI/2; rim.position.y=0.85; group.add(rim);
  const inner=new THREE.Mesh(new THREE.TorusGeometry(R*0.62,0.12,8,48),
    new THREE.MeshBasicMaterial({color:colorHex,transparent:true,opacity:.65}));
  inner.rotation.x=Math.PI/2; inner.position.y=0.9; group.add(inner);
  // pilares perimetrales
  const pilMat=new THREE.MeshStandardMaterial({color:0x14141c,roughness:.8,metalness:.4});
  const pilTop=new THREE.MeshBasicMaterial({color:colorHex});
  const pilBits=[];
  for(let i=0;i<10;i++){
    const a=i/10*Math.PI*2, px=Math.cos(a)*R*0.88, pz=Math.sin(a)*R*0.88;
    const p=new THREE.Mesh(new THREE.BoxGeometry(.7,3.6+Math.random()*1.4,.7),pilMat);
    p.position.set(px,2.4,pz); p.castShadow=true; group.add(p);
    const cap=new THREE.Mesh(new THREE.SphereGeometry(.22,8,8),pilTop);
    cap.position.set(px,4.4,pz); group.add(cap);
    /* Los pilares son decorado procedural: cuando un .glb sustituye al set completo
       (applyCircuitModel) se ocultan para no perforar la plataforma del modelo. */
    pilBits.push(p,cap);
  }
  group.userData.pilBits=pilBits;
  // fragmentos flotantes
  for(let i=0;i<4;i++){
    const s=new THREE.Mesh(new THREE.DodecahedronGeometry(.5+Math.random()*.7,0),rockMat);
    const a=Math.random()*Math.PI*2;
    s.position.set(Math.cos(a)*(R+3+Math.random()*3),-2+Math.random()*4,Math.sin(a)*(R+3+Math.random()*3));
    s.userData.spin=.3+Math.random(); group.add(s); (group.userData.shards ||= []).push(s);
  }
  const props=new THREE.Group(); group.add(props); group.userData.props=props;
  return {rim, inner, props, base, top, under, tip};
}

/* ----- sets por circuito ----- */
function buildFisgones(g,R,color){
  for(let i=0;i<12;i++){
    const a=i/12*Math.PI*2, px=Math.cos(a)*R*0.68, pz=Math.sin(a)*R*0.68;
    const tower=new THREE.Mesh(new THREE.BoxGeometry(1.7,3.4,.5),
      new THREE.MeshStandardMaterial({color:0x0a1622,roughness:.6,metalness:.5}));
    tower.position.set(px,2.4,pz); tower.lookAt(0,2.4,0); tower.castShadow=true; g.add(tower);
    const scr=new THREE.Mesh(new THREE.PlaneGeometry(1.45,2.6),
      new THREE.MeshBasicMaterial({map:staticScreenTexture('60,180,255', i%3? '#9fdcff':'#d6f3ff')}));
    scr.position.set(px,2.5,pz); scr.lookAt(0,2.5,0); scr.translateZ(.28); g.add(scr);
  }
  // ojo central
  const ped=new THREE.Mesh(new THREE.CylinderGeometry(.5,.9,6,10),
    new THREE.MeshStandardMaterial({color:0x101722,roughness:.5,metalness:.6}));
  ped.position.y=3.6; g.add(ped);
  /* Esclera oscura, iris encendido: con el globo casi blanco y su propia luz a distancia cero el
     ojo salía como una bola blanca reventada —de cerca parecía un ojo de cartón— en vez de un ojo
     de vigilancia. Lo que tiene que brillar es el iris. */
  const eye=new THREE.Mesh(new THREE.SphereGeometry(1.7,24,24),
    new THREE.MeshStandardMaterial({color:0x0a1018,roughness:.3,emissive:0x0d2a3a,emissiveIntensity:.7}));
  eye.position.y=7.2; g.add(eye);
  const iris=new THREE.Mesh(new THREE.SphereGeometry(.8,18,18),new THREE.MeshBasicMaterial({color:0x29b6ff}));
  iris.position.set(0,7.2,1.25); g.add(iris);
  const pup=new THREE.Mesh(new THREE.SphereGeometry(.34,14,14),new THREE.MeshBasicMaterial({color:0x000000}));
  pup.position.set(0,7.2,1.9); g.add(pup);
  g.userData.eye=eye; g.userData.iris=iris; g.userData.pup=pup;
  const l=new THREE.PointLight(0x29b6ff,1.5,34); l.position.y=7; g.add(l);
}
function buildMercaderes(g,R,color){
  const cageEdge=new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(1.6,2.2,1.6)),
    new THREE.LineBasicMaterial({color:0x3dff8a}));
  for(let i=0;i<6;i++){
    const a=i/6*Math.PI*2+.3, px=Math.cos(a)*R*0.55, pz=Math.sin(a)*R*0.55;
    const arch=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,7,6),
      new THREE.MeshStandardMaterial({color:0x222222,metalness:.7,roughness:.4}));
    arch.position.set(px,4,pz); g.add(arch);
    const cage=cageEdge.clone(); cage.position.set(px,4.4,pz); g.add(cage);
    const body=new THREE.Mesh(capsule(.4,.8),
      new THREE.MeshStandardMaterial({color:0x0a2a14,emissive:0x3dff8a,emissiveIntensity:.7,roughness:.4}));
    body.position.set(px,4.3,pz); g.add(body);
    (g.userData.swing ||= []).push({m:cage,b:body,ph:i});
  }
  // puestos
  const awnTex=canvasTex(64,32,(gg,w,h)=>{ for(let x=0;x<8;x++){ gg.fillStyle=x%2?'#04140a':'#3dff8a'; gg.fillRect(x*8,0,8,h);} });
  for(let i=0;i<4;i++){
    const a=i/4*Math.PI*2+0.8, px=Math.cos(a)*R*0.35, pz=Math.sin(a)*R*0.35;
    const stall=new THREE.Mesh(new THREE.BoxGeometry(2.2,1.2,1.4),
      new THREE.MeshStandardMaterial({color:0x0d1a10,roughness:.8}));
    stall.position.set(px,1.3,pz); stall.castShadow=true; g.add(stall);
    const awn=new THREE.Mesh(new THREE.BoxGeometry(2.5,.18,1.7),new THREE.MeshBasicMaterial({map:awnTex}));
    awn.position.set(px,2.15,pz); awn.rotation.y=a; g.add(awn);
  }
  // tótems barcode
  const bc=barcodeTexture();
  for(let i=0;i<4;i++){
    const a=i/4*Math.PI*2, px=Math.cos(a)*R*0.8, pz=Math.sin(a)*R*0.8;
    const t=new THREE.Mesh(new THREE.BoxGeometry(.5,3,.5),new THREE.MeshBasicMaterial({map:bc}));
    t.position.set(px,2.2,pz); g.add(t);
  }
  const l=new THREE.PointLight(0x3dff8a,2,34); l.position.y=5; g.add(l);
}
function buildLadrones(g,R,color){
  const mirMat=new THREE.MeshStandardMaterial({color:0x9a8cff,metalness:.95,roughness:.18,emissive:0x221144,emissiveIntensity:.35});
  for(let i=0;i<8;i++){
    const a=i/8*Math.PI*2+.2, rr=R*(0.25+Math.random()*0.5);
    const h=4+Math.random()*6;
    const b=new THREE.Mesh(new THREE.BoxGeometry(1.4+Math.random(),h,1.4+Math.random()),mirMat);
    b.position.set(Math.cos(a)*rr,h/2+.7,Math.sin(a)*rr);
    b.rotation.y=Math.random()*Math.PI; b.castShadow=true; g.add(b);
  }
  for(let i=0;i<12;i++){
    const s=new THREE.Mesh(new THREE.TetrahedronGeometry(.4+Math.random()*.5),
      new THREE.MeshStandardMaterial({color:0xcbbcff,metalness:.9,roughness:.2,emissive:0x5533ff,emissiveIntensity:.3}));
    s.position.set((Math.random()-.5)*R*1.4,1+Math.random()*2,(Math.random()-.5)*R*1.4);
    s.rotation.set(Math.random()*3,Math.random()*3,0); g.add(s); (g.userData.shards ||= []).push(s);
  }
  const disc=new THREE.Mesh(new THREE.CircleGeometry(R*0.9,40),
    new THREE.MeshStandardMaterial({color:0x151226,metalness:1,roughness:.3}));
  disc.rotation.x=-Math.PI/2; disc.position.y=.78; g.add(disc);
  const l=new THREE.PointLight(0xb06bff,2.2,36); l.position.y=6; g.add(l);
}
function buildVerdugos(g,R,color){
  // foso
  const pit=new THREE.Mesh(new THREE.CircleGeometry(R*0.42,28),
    new THREE.MeshBasicMaterial({color:0xff3d00}));
  pit.rotation.x=-Math.PI/2; pit.position.y=.8; g.add(pit); g.userData.pit=pit;
  const rim2=new THREE.Mesh(new THREE.TorusGeometry(R*0.42,.3,10,40),
    new THREE.MeshStandardMaterial({color:0x1a0a06,roughness:.9}));
  rim2.rotation.x=Math.PI/2; rim2.position.y=.9; g.add(rim2);
  // sillas + condenados
  const chairM=new THREE.MeshStandardMaterial({color:0x0c0c10,roughness:.8});
  const fleshM=new THREE.MeshStandardMaterial({color:0x3a1512,roughness:.9,emissive:0xff2200,emissiveIntensity:.25});
  for(let i=0;i<8;i++){
    const a=i/8*Math.PI*2, px=Math.cos(a)*R*0.62, pz=Math.sin(a)*R*0.62;
    const ch=new THREE.Mesh(new THREE.BoxGeometry(.9,1.6,.9),chairM);
    ch.position.set(px,1.5,pz); ch.lookAt(0,1.5,0); g.add(ch);
    const fig=new THREE.Mesh(capsule(.32,.9),
        new THREE.MeshStandardMaterial({color:0x3a1512,roughness:.9,emissive:0xff2200,emissiveIntensity:.25}));
    fig.position.set(px,2.1,pz); g.add(fig);
  }
  // muro de pantallas rojas
  for(let i=0;i<5;i++){
    const a=(i/5-.5)*1.8, px=Math.sin(a)*R*0.8, pz=-Math.cos(a)*R*0.8;
    const sc=new THREE.Mesh(new THREE.PlaneGeometry(2.6,1.8),
      new THREE.MeshBasicMaterial({map:staticScreenTexture('255,90,40','#ffd9c9'),side:THREE.DoubleSide}));
    sc.position.set(px,3.4,pz); sc.lookAt(0,3,0); g.add(sc);
  }
  // pinchos
  for(let i=0;i<10;i++){
    const a=i/10*Math.PI*2, sp=new THREE.Mesh(new THREE.ConeGeometry(.35,2.2,6),
      new THREE.MeshStandardMaterial({color:0x140b08,roughness:1}));
    sp.position.set(Math.cos(a)*(R+0.4),1.6,Math.sin(a)*(R+0.4)); g.add(sp);
  }
  const l1=new THREE.PointLight(0xff5a2a,2.4,36); l1.position.y=4; g.add(l1);
  const l2=new THREE.PointLight(0xff1a1a,1.6,20); l2.position.y=1.5; g.add(l2); g.userData.fire=l2;
}
function buildAbandonados(g,R,color){
  const mistT=mistTexture();
  for(let i=0;i<5;i++){
    const m=new THREE.Mesh(new THREE.PlaneGeometry(R*1.2,R*.7),
      new THREE.MeshBasicMaterial({map:mistT,transparent:true,opacity:.4,depthWrite:false}));
    m.position.set((Math.random()-.5)*R,1.6+Math.random(),(Math.random()-.5)*R);
    m.rotation.y=Math.random()*Math.PI; g.add(m); (g.userData.mists ||= []).push(m);
  }
  for(let i=0;i<3;i++){
    const p=new THREE.Mesh(new THREE.CylinderGeometry(.5,.65,4+Math.random()*2,8),
      new THREE.MeshStandardMaterial({color:0x2a3542,roughness:.9}));
    p.position.set((Math.random()-.5)*R*.9,2,(Math.random()-.5)*R*.9);
    p.rotation.z=(Math.random()-.5)*.5; p.castShadow=true; g.add(p);
  }
  // siluetas grises
  const ghostM=new THREE.MeshBasicMaterial({color:0x9fd8ff,transparent:true,opacity:.35});
  for(let i=0;i<5;i++){
    const f=new THREE.Mesh(capsule(.35,1),ghostM);
    const a=i/5*Math.PI*2; f.position.set(Math.cos(a)*R*.5,1.8,Math.sin(a)*R*.5); g.add(f);
    (g.userData.ghosts ||= []).push({m:f,ph:i*1.3});
  }
  const l=new THREE.PointLight(0x9fd8ff,1.1,30); l.position.y=4; g.add(l);
}

/* ---------- shaders propios ----------
   OJO: en r128 un ShaderMaterial NO recibe el chunk encodings_fragment, así que la codificación
   de salida hay que hacerla a mano con pow(col,1/2.2) o el objeto sale más oscuro que el resto
   (los materiales estándar sí la aplican). Los colores de los uniforms van en lineal
   (convertSRGBToLinear) para que el hex que se escribe sea el hex que se ve. */

/* Suelo: roca volcánica oscura con vetas de lava.
   El patrón anterior (producto de senos de alta frecuencia) era una trama regular que aliaseaba
   en cuanto la cámara rozaba el plano. Aquí no hay ninguna frecuencia dominante: ruido de valor
   + fbm, un domain warp de baja frecuencia, y todos los umbrales escalados por fwidth() para que
   un píxel de pantalla cubra siempre la misma fracción de la transición. */
const LAVA_FRAG=`
varying vec2 vUv;
uniform float uTime,uExtent,uFadeNear,uFadeFar,uBloomGain;
uniform vec3 uRockA,uRockB,uMolten,uHot,uHaze;

vec2 hash2(vec2 p){
  p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));
  return fract(sin(p)*43758.5453123);
}
float vnoise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  vec2 u=f*f*(3.0-2.0*f);
  float a=hash2(i+vec2(0.0,0.0)).x;
  float b=hash2(i+vec2(1.0,0.0)).x;
  float c=hash2(i+vec2(0.0,1.0)).x;
  float d=hash2(i+vec2(1.0,1.0)).x;
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}
float fbm(vec2 p){
  float s=0.0,a=0.5;
  for(int i=0;i<4;i++){ s+=a*vnoise(p); p=p*2.03+vec2(11.7,5.3); a*=0.5; }
  return s;
}
/* pow(c,1/2.2) NO es la curva de three.js: la sRGB real lleva un tramo lineal cerca de 0, y en
   valores oscuros la diferencia es grande (un 5/255 acaba en 13/255). Con el cielo pintado por
   el clear —que no pasa por outputEncoding— eso bastaba para que el suelo se viera más claro
   que el fondo justo en el horizonte, con su borde recortado. Esta es la inversa exacta. */
vec3 lin2srgb(vec3 c){
  c=max(c,vec3(0.0));
  return mix(c*12.92, 1.055*pow(c,vec3(1.0/2.4))-0.055, step(vec3(0.0031308),c));
}
void main(){
  /* una celda de ruido ≈ 130 unidades de mundo: a 30 de la cámara se ve estructura y a 150
     todavía queda algo que mirar. Antes eran 240 y el suelo entero eran tres manchas. */
  vec2 P=vUv*(uExtent/130.0);

  /* domain warp: una sola pasada de baja frecuencia, lo que rompe cualquier resto de retícula */
  vec2 w=vec2(fbm(P*0.6+vec2(1.7,9.2)),fbm(P*0.6+vec2(8.3,2.8)))-0.5;
  vec2 Q=P+w*0.7;

  /* Dos redes de grietas. |fbm-0.5| es una cresta, y su conjunto de ceros es una red conexa y
     ramificada, no una trama: la gruesa son los ríos de lava, la fina las vetas que los alimentan.
     El ancho no es constante sino fwidth: un píxel cubre siempre la misma fracción del borde, así
     que en ángulos rasantes la veta se apaga en vez de aliasear. Eso es lo que mata el muaré. */
  float d1=abs(fbm(Q)-0.5);
  float d2=abs(fbm(Q*3.0+37.0)-0.5);
  float w1=max(fwidth(d1),0.0015)*2.0+0.030;
  float w2=max(fwidth(d2),0.0015)*2.0+0.050;
  float v1=1.0-smoothstep(0.0,w1,d1);
  float v2=1.0-smoothstep(0.0,w2,d2);
  /* la red fina entra con poca fuerza: es lo que alimenta a la gruesa, no otra sábana de lava */
  float vein=max(v1,v2*0.30);

  /* no todo el terreno está caliente: sin esto el suelo es un lago naranja sin jerarquía */
  float heat=smoothstep(0.44,0.74,fbm(Q*0.42+uTime*0.012));
  vein*=mix(0.10,1.0,heat);

  float flow=0.6+0.4*sin(uTime*0.7+Q.x*0.9+fbm(Q*1.6)*6.2831);

  vec3 col=mix(uRockA,uRockB,fbm(Q*2.4));
  col+=uMolten*vein*(0.35+0.85*heat)*flow;
  col+=uHot*pow(v1,3.5)*flow*heat*(0.5+0.5*heat);

  /* Techo de luminancia holgado: la banda alrededor de cada veta se queda por encima del umbral
     de bloom, que es lo que hace que el halo se lea como resplandor y no como línea de neón.
     Los pesos son los mismos (0.299,0.587,0.114) que usa LuminosityHighPassShader para decidir
     qué brilla, así que el techo y el umbral hablan del mismo número. */
  float lum=dot(col,vec3(0.299,0.587,0.114));
  col*= (lum>2.4) ? (2.4/lum) : 1.0;
  col*=uBloomGain;

  /* retirada radial: el plano es enorme y su borde nunca debe verse como una línea de horizonte.
     Se hace aquí y no con scene.fog porque un ShaderMaterial no recibe el fog sin los chunks. */
  float fade=1.0-smoothstep(uFadeNear,uFadeFar,length(vUv-0.5)*uExtent);
  col=mix(uHaze,col,fade);

  gl_FragColor=vec4(lin2srgb(col),1.0);
}`;

/* Haz del Núcleo: un cono con caída según el ángulo de visión, para que los bordes se disuelvan
   en vez de terminar en una silueta dura. */
const BEAM_FRAG=`
varying vec2 vUv;
varying vec3 vNormalW,vViewDirW;
uniform float uTime,uIntensity,uFadeTop,uBloomGain;
uniform vec3 uColor;

/* misma inversa sRGB exacta que el suelo, para que el haz y el resto de la escena coincidan */
vec3 lin2srgb(vec3 c){
  c=max(c,vec3(0.0));
  return mix(c*12.92, 1.055*pow(c,vec3(1.0/2.4))-0.055, step(vec3(0.0031308),c));
}
void main(){
  /* Lleno en el centro y apagado hacia la silueta: es lo que convierte el cilindro en una
     columna de luz. Al revés (1-ndv) daría un contorno hueco, y con DoubleSide se verían DOS. */
  float ndv=abs(dot(normalize(vNormalW),normalize(vViewDirW)));
  float core=pow(ndv,1.35);

  float alongTop=smoothstep(1.0,1.0-uFadeTop,vUv.y);   /* se disuelve hacia arriba */
  float alongBot=smoothstep(0.0,0.16,vUv.y);           /* raíz suave */
  float band=0.86+0.14*sin(vUv.y*7.0-uTime*0.9);
  float breathe=0.88+0.12*sin(uTime*1.3);

  float a=core*alongTop*alongBot*band*breathe*uIntensity;
  vec3 col=uColor*uBloomGain*(0.65+0.35*core);

  gl_FragColor=vec4(lin2srgb(col),a);
}`;

const BEAM_VERT=`
varying vec2 vUv;
varying vec3 vNormalW,vViewDirW;
void main(){
  vUv=uv;
  vec4 wp=modelMatrix*vec4(position,1.0);
  vNormalW=normalize(mat3(modelMatrix)*normal);
  vViewDirW=normalize(cameraPosition-wp.xyz);
  gl_Position=projectionMatrix*viewMatrix*wp;
}`;

function makeLabel(id, tag, color){
  const d=document.createElement('button');
  d.className='island-label'; d.dataset.circuit=id;
  d.innerHTML=`<b>${tag}</b>`;
  d.style.setProperty('--lc', color);
  d.onclick=(e)=>{e.stopPropagation();selectCircuit(id,true);};
  document.getElementById('labels3d').appendChild(d);
  return d;
}

function initThree(){
  if(typeof THREE==='undefined'){ document.getElementById('nothree').classList.remove('hidden'); return; }
  const canvas=document.getElementById('scene3d');
  renderer=new THREE.WebGLRenderer({canvas,antialias:true});
  renderer.setPixelRatio(pixelRatio);
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputEncoding=THREE.sRGBEncoding;
  scene=new THREE.Scene();
  scene.background=new THREE.Color(HAZE);
  scene.fog=new THREE.FogExp2(0x000000,0.0125);
  scene.fog.color.copy(HAZE_LIN);
  camera=new THREE.PerspectiveCamera(58,2,0.5,1200);
  camera.position.set(0,42,70);
  controls=new THREE.OrbitControls(camera,canvas);
  controls.target.set(0,10,-1); controls.enableDamping=true; controls.dampingFactor=.06;
  controls.minDistance=26; controls.maxPolarAngle=1.42;
  controls.autoRotateSpeed=.7;
  /* si el usuario agarra la cámara, el vuelo automático suelta el mando */
  controls.addEventListener('start',()=>{camGoal=null;tgtGoal=null;});
  window.__controls=controls;
  clock=new THREE.Clock();

  /* --- luces: clave + contraluz frío + rebote de la lava ---
     La clave va suave a propósito. Con la luz fuerte, todo lo que no es roca (pilares, agujas,
     pantallas) se lavaba a pastel y las islas se despegaban mal del fondo: en una escena tan
     oscura la silueta la tiene que dar el contraluz, no el brillo general. */
  scene.add(new THREE.AmbientLight(0x1a0a10,.16));
  scene.add(new THREE.HemisphereLight(0x120a1c,0x7a1a04,.20));
  const dir=new THREE.DirectionalLight(0xff7a55,.62);
  dir.position.set(34,58,22);
  dir.castShadow=true; dir.shadow.mapSize.set(1024,1024);
  /* Sin esto el frustum de sombras se queda en el ±5 por defecto y NINGUNA isla (radio 23–30)
     cae dentro: el mapa de sombras se gastaba entero en el vacío del origen. */
  const sc=dir.shadow.camera;
  sc.left=-52; sc.right=52; sc.top=52; sc.bottom=-52; sc.near=10; sc.far=170;
  sc.updateProjectionMatrix();
  dir.shadow.bias=-0.0009; dir.shadow.normalBias=0.05;
  scene.add(dir);
  const fill=new THREE.DirectionalLight(0x3a4f8a,.55); fill.position.set(-46,20,-38); scene.add(fill);
  /* el rebote del suelo. A 2.4 con corte 240 este punto bañaba de naranja TODA la escena:
     sin physicallyCorrectLights la caída en r128 es pow(1-d/corte, decay), no 1/d². */
  const lavaFill=new THREE.PointLight(0xff3a08,.85,110,2); lavaFill.position.set(0,-5,0); scene.add(lavaFill);

  // --- suelo volcánico ---
  lavaUniforms={
    uTime:{value:0}, uExtent:{value:960},
    uRockA:{value:new THREE.Color(0x0a0708).convertSRGBToLinear()},
    uRockB:{value:new THREE.Color(0x1c1114).convertSRGBToLinear()},
    uMolten:{value:new THREE.Color(0xff4a06).convertSRGBToLinear()},
    uHot:{value:new THREE.Color(0xffd08a).convertSRGBToLinear()},
    uHaze:{value:HAZE_LIN.clone()},
    /* El velo radial arranca antes de lo que parece necesario a ras de suelo, y es a propósito:
       desde arriba (maxDistance ronda los 134) casi todo el suelo visible cae entre 100 y 300 de
       radio, y con el fundido lejos el encuadre ancho se llenaba de lava y las islas se perdían
       dentro. Enfriando el suelo a partir de ~200 el archipiélago queda recortado sobre negro. */
    uFadeNear:{value:50}, uFadeFar:{value:225}, uBloomGain:{value:1.0}
  };
  lavaMat=new THREE.ShaderMaterial({uniforms:lavaUniforms,
    extensions:{derivatives:true},
    vertexShader:`varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:LAVA_FRAG});
  const lava=new THREE.Mesh(new THREE.PlaneGeometry(960,960,1,1),lavaMat);
  lava.rotation.x=-Math.PI/2; lava.position.y=-8.4; lava.frustumCulled=false; scene.add(lava);

  // --- paredes de la caverna ---
  const wallMat=new THREE.MeshStandardMaterial({color:0x0b0708,roughness:1,side:THREE.BackSide});
  const walls=new THREE.Mesh(new THREE.CylinderGeometry(190,150,150,20,1,true),wallMat);
  walls.position.y=40; scene.add(walls);
  const stalMat=new THREE.MeshStandardMaterial({color:0x120b0c,roughness:1,flatShading:true});
  for(let i=0;i<40;i++){
    const a=i/40*Math.PI*2, r=150+Math.random()*30;
    const st=new THREE.Mesh(new THREE.ConeGeometry(4+Math.random()*7,20+Math.random()*40,6),stalMat);
    st.position.set(Math.cos(a)*r,100+Math.random()*20,Math.sin(a)*r);
    st.rotation.x=Math.PI; scene.add(st);
  }
  // estrellas / chispas del techo
  {
    const n=900, pos=new Float32Array(n*3);
    for(let i=0;i<n;i++){ const a=Math.random()*Math.PI*2, r=Math.random()*170, y=60+Math.random()*80;
      pos[i*3]=Math.cos(a)*r; pos[i*3+1]=y; pos[i*3+2]=Math.sin(a)*r; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3));
    scene.add(new THREE.Points(g,new THREE.PointsMaterial({color:0xff9a66,size:.7,transparent:true,opacity:.8})));
  }

  // --- islas ---
  const builders={1:buildFisgones,2:buildMercaderes,3:buildLadrones,4:buildVerdugos,5:buildAbandonados};
  const RADII={1:9,2:9.5,3:9,4:10,5:8};
  [1,2,3,4,5].forEach(id=>{
    const c=CIRCUITS.find(x=>x.id===id), R=RADII[id];
    const g=new THREE.Group(); g.position.set(...ISLAND_POS[id]);
    const baseParts=buildBase(g,R,c.color);
    const rim=baseParts.rim, inner=baseParts.inner;
    builders[id](baseParts.props,R,c.color);
    // hitbox invisible
    const hit=new THREE.Mesh(new THREE.CylinderGeometry(R+1.5,R+1.5,12,10),
      new THREE.MeshBasicMaterial({visible:false}));
    hit.position.y=2; hit.userData.circuit=id; g.add(hit);
    // etiqueta
    const label=makeLabel(id,c.tag+' · '+c.title.replace('El Círculo de ','').replace('El Círculo ','') ,c.color);
    scene.add(g);
    islands[id]={group:g,rim,inner,props:baseParts.props,baseParts,light:g.children.find(o=>o.isPointLight),baseY:g.position.y,phase:Math.random()*7,R,label,hit,color:c.color};
  });

  // --- NÚCLEO ---
  {
    const g=new THREE.Group(); g.position.set(...ISLAND_POS[0]);
    const crackT=lavaCrackTexture();
    /* Aguja del Núcleo: era un cono de 22 unidades de ancho justo debajo del ojo y se comía el
       tercio inferior del encuadre como una pared lisa. Ahora es más estrecha, más alta y con la
       roca desplazada, para que la silueta no sea un cono perfecto. */
    const spire=new THREE.Mesh(rockify(new THREE.CylinderGeometry(6,9,30,7,3),1.2),
      new THREE.MeshStandardMaterial({color:0x0b0607,roughness:1,metalness:.05,emissive:0xff2200,emissiveMap:crackT,emissiveIntensity:.62,flatShading:true}));
    spire.position.y=-7; spire.castShadow=true; g.add(spire);
    const plat=new THREE.Mesh(new THREE.CylinderGeometry(8,7,1.6,20),
      new THREE.MeshStandardMaterial({color:0x0c0c12,metalness:.5,roughness:.5}));
    plat.position.y=8.6; g.add(plat);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(8.1,.4,12,60),
      new THREE.MeshStandardMaterial({color:0x140202,roughness:.35,emissive:0xff1a1a,emissiveIntensity:2.0}));
    rim.rotation.x=Math.PI/2; rim.position.y=9.4; g.add(rim);
    // anillo de servidores
    for(let i=0;i<14;i++){
      const a=i/14*Math.PI*2, sv=new THREE.Mesh(new THREE.BoxGeometry(1.2,2.4,.8),
        new THREE.MeshStandardMaterial({color:0x0a0a10,roughness:.6,metalness:.5}));
      sv.position.set(Math.cos(a)*6.6,10.4,Math.sin(a)*6.6); sv.lookAt(0,10.4,0); g.add(sv);
      const led=new THREE.Mesh(new THREE.PlaneGeometry(.9,.3),
        new THREE.MeshBasicMaterial({color:i%3?0xff2222:0x44ff88}));
      led.position.set(Math.cos(a)*6.6,10.8,Math.sin(a)*6.6); led.lookAt(0,10.8,0); led.translateZ(.45); g.add(led);
      serverLights.push({m:led.material,ph:Math.random()*7});
    }
    coreEye=new THREE.Mesh(new THREE.SphereGeometry(3.1,28,28),
      new THREE.MeshStandardMaterial({color:0x1a0202,roughness:.35,emissive:0xff2010,emissiveIntensity:2.4}));
    coreEye.position.y=14.5; g.add(coreEye);
    const pupil=new THREE.Mesh(new THREE.SphereGeometry(1.1,18,18),new THREE.MeshBasicMaterial({color:0x1a0000}));
    pupil.position.set(0,14.5,2.6); g.add(pupil); g.userData.pupil=pupil;
    ringA=new THREE.Mesh(new THREE.TorusGeometry(4.6,.28,10,60),
      new THREE.MeshStandardMaterial({color:0x140200,roughness:.4,emissive:0xff4d00,emissiveIntensity:1.9,transparent:true,opacity:.95}));
    ringA.position.y=14.5; g.add(ringA);
    ringB=new THREE.Mesh(new THREE.TorusGeometry(5.8,.18,10,60),
      new THREE.MeshStandardMaterial({color:0x140404,roughness:.4,emissive:0xff8080,emissiveIntensity:1.5,transparent:true,opacity:.8}));
    ringB.position.y=14.5; ringB.rotation.x=Math.PI/2.4; g.add(ringB);
    /* Haz: mucho más estrecho que el anterior (1.6→3.2 sobre 120 de alto ocupaba un tercio del
       encuadre). depthTest sigue activo para que las islas lo tapen al pasar por delante. */
    beamMat=new THREE.ShaderMaterial({
      uniforms:{uTime:{value:0},uIntensity:{value:.55},uFadeTop:{value:.55},uBloomGain:{value:1.0},
                uColor:{value:new THREE.Color(0xff2a00).convertSRGBToLinear()}},
      vertexShader:BEAM_VERT, fragmentShader:BEAM_FRAG,
      transparent:true, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide});
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(1.05,2.5,140,20,1,true),beamMat);
    beam.position.y=85; beam.frustumCulled=false; g.add(beam);
    const coreLight=new THREE.PointLight(0xff1a1a,3.4,90); coreLight.position.y=15; g.add(coreLight);
    const hit=new THREE.Mesh(new THREE.CylinderGeometry(11,11,26,8),new THREE.MeshBasicMaterial({visible:false}));
    hit.position.y=6; hit.userData.circuit=0; g.add(hit);
    const props=new THREE.Group(); g.add(props); g.userData.props=props;
    g.userData.coreSpire=spire; g.userData.corePlat=plat;
    coreGroup=g; scene.add(g);
    islands[0]={group:g,rim,inner:null,props,baseParts:null,light:coreLight,baseY:g.position.y,phase:0,R:9,label:makeLabel(0,'◎ EL NÚCLEO', '#ff1a1a'),hit,color:'#ff1a1a'};
  }

  // --- puentes / túneles ---
  const dotT=softDotTexture();
  [1,2,3,4,5].forEach(id=>{
    const c=CIRCUITS.find(x=>x.id===id);
    const a=new THREE.Vector3(0,9.4,-3), b=new THREE.Vector3(...ISLAND_POS[id]); b.y=1;
    const mid=a.clone().lerp(b,.5); mid.y=0.2;
    const curve=new THREE.QuadraticBezierCurve3(a,mid,b);
    const tube=new THREE.Mesh(new THREE.TubeGeometry(curve,36,.55,8),
      new THREE.MeshBasicMaterial({color:new THREE.Color(c.color),transparent:true,opacity:.75}));
    scene.add(tube);
    const halo=new THREE.Mesh(new THREE.TubeGeometry(curve,36,1.1,8),
      new THREE.MeshBasicMaterial({color:new THREE.Color(c.color),transparent:true,opacity:.14,blending:THREE.AdditiveBlending,depthWrite:false}));
    scene.add(halo);
    const orbs=[];
    for(let k=0;k<4;k++){
      const o=new THREE.Mesh(new THREE.SphereGeometry(.4,10,10),
        new THREE.MeshBasicMaterial({map:dotT,color:new THREE.Color(c.color),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
      scene.add(o); orbs.push({m:o,off:k/4,speed:.06+Math.random()*.04});
    }
    bridges.push({curve,orbs,mat:tube.material});
  });

  // --- partículas ---
  function makePoints(n,color,size,area,y0,y1){
    const pos=new Float32Array(n*3), vel=new Float32Array(n);
    for(let i=0;i<n;i++){ pos[i*3]=(Math.random()-.5)*area; pos[i*3+1]=y0+Math.random()*(y1-y0); pos[i*3+2]=(Math.random()-.5)*area; vel[i]=.5+Math.random()*2; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const p=new THREE.Points(g,new THREE.PointsMaterial({color,size,transparent:true,opacity:.9,map:softDotTexture(),blending:THREE.AdditiveBlending,depthWrite:false}));
    scene.add(p); return {p,vel,y0,y1};
  }
  const e1=makePoints(700,0xff7733,.9,150,-8,50); emberPts=e1.p; emberVel=e1.vel;
  const e2=makePoints(250,0x66ccff,.6,120,-4,30); ashPts=e2.p; ashVel=e2.vel;

  // --- interacción ---
  function pick(ev){
    const r=canvas.getBoundingClientRect();
    mouseV.x=((ev.clientX-r.left)/r.width)*2-1; mouseV.y=-((ev.clientY-r.top)/r.height)*2+1;
    rayc.setFromCamera(mouseV,camera);
    const hits=rayc.intersectObjects(Object.values(islands).map(o=>o.hit));
    return hits.length?hits[0].object.userData.circuit:null;
  }
  canvas.addEventListener('pointermove',ev=>{
    const id=pick(ev);
    canvas.style.cursor=id!=null?'pointer':'grab';
    const tip=document.getElementById('islandTip');
    if(id!=null){ const c=CIRCUITS.find(x=>x.id===id);
      tip.textContent=c.tag+' — '+c.title; tip.style.opacity=1;
      tip.style.left=(ev.clientX-canvas.getBoundingClientRect().left+14)+'px';
      tip.style.top=(ev.clientY-canvas.getBoundingClientRect().top+10)+'px';
    } else tip.style.opacity=0;
  });
  canvas.addEventListener('pointerdown',ev=>{downXY=[ev.clientX,ev.clientY];});
  canvas.addEventListener('pointerup',ev=>{
    if(!downXY) return;
    const dx=ev.clientX-downXY[0], dy=ev.clientY-downXY[1]; downXY=null;
    if(dx*dx+dy*dy>36) return;
    const id=pick(ev); if(id!=null) selectCircuit(id,false);
  });
  canvas.addEventListener('dblclick',()=>selectCircuit(0,false));

  let framed=false;
  function resize(){
    const w=Math.max(1,innerWidth), h=Math.max(1,innerHeight);
    pixelRatio=Math.min(window.devicePixelRatio||1,PR_CAP);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(w,h,false);
    camera.aspect=w/h; camera.updateProjectionMatrix();
    if(composer){ composer.setPixelRatio(pixelRatio); composer.setSize(w,h); }
    controls.maxDistance=Math.max(130,fitDistance()*1.8);
    /* solo en el primer encuadre: un resize posterior no debe arrancarle la cámara al usuario */
    if(!framed){ framed=true; frameDefaultView(true); }
  }
  addEventListener('resize',resize); resize();

  // HUD coords
  const coords=document.getElementById('coords');

  /* ---------- postprocesado: bloom ----------
     El orden de carga de los scripts está en index.html; aquí solo se comprueba que existan.
     Si falta cualquiera, bloomOn se queda en false y animate() dibuja directo con
     renderer.render(): la escena se ve igual, sin resplandor. Es la misma degradación que el
     proyecto ya usa cuando no están los .glb. */
  function initBloom(){
    const falta=['EffectComposer','RenderPass','UnrealBloomPass'].filter(k=>!THREE[k]);
    if(falta.length){ console.warn('sin postprocesado (faltan '+falta.join(', ')+'): la escena se dibuja directa'); return; }
    let rt;
    try{
      composer=new THREE.EffectComposer(renderer);
      rt=new THREE.WebGLRenderTarget(composer.renderTarget1.width,composer.renderTarget1.height,
        {minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat,
         type:THREE.HalfFloatType});
      /* CRÍTICO, y no es una preferencia estética: en r128 un material elige su codificación de
         salida comparando el encoding del render target ACTIVO con renderer.outputEncoding. Si no
         coinciden, cada material necesita dos programas y se recompila en cada fotograma —el
         composer dibuja en su RT y la pantalla es otro destino—. Con los dos en sRGB, el render
         se hace una vez y ya. Además el half-float evita que three elija un formato interno sRGB
         por hardware (solo lo hace con UnsignedByteType), que codificaría dos veces. */
      rt.texture.encoding=THREE.sRGBEncoding;
      composer.reset(rt);
    }catch(e){ composer=null; return; }
    composer.addPass(new THREE.RenderPass(scene,camera));
    /* Umbral medio: bajo del todo, el halo se come las vetas y el suelo pierde el dibujo; alto,
       solo brillaría el Núcleo. A 0.55 el resplandor se queda pegado al núcleo de cada veta. */
    bloomPass=new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth*pixelRatio,innerHeight*pixelRatio),0.8,0.5,0.55);
    composer.addPass(bloomPass);
    bloomOn=true;
  }
  initBloom();

  /* Vigilante de rendimiento: si tras cuatro segundos el promedio se va por encima de 45 ms
     (menos de 22 fps), primero se baja el pixel ratio y, si sigue igual, se apaga el bloom. El
     bloom es lo único que escala de verdad con el número de píxeles, así que es lo primero que
     se recorta. Nada de esto toca la escena: solo cómo se dibuja. */
  let accMs=0, accN=0, lastT=0;

  // loop
  const labelV=new THREE.Vector3();
  const LABEL_OFFS=[0,-26,26,-52,52,-78,78];
  const lastDy=new Map();
  function animate(){
    requestAnimationFrame(animate);
    const t=clock.getElapsedTime();
    lavaUniforms.uTime.value=t;
    // islas flotando + anillos
    Object.entries(islands).forEach(([id,o])=>{
      if(+id!==0){ o.group.position.y=o.baseY+Math.sin(t*.7+o.phase)*.55; o.group.rotation.y=Math.sin(t*.1+o.phase)*.06; }
      if(o.rim) o.rim.rotation.z=t*.25;
      if(o.inner){ o.inner.rotation.z=-t*.4; o.inner.position.y=.9+Math.sin(t*1.4+o.phase)*.12; }
      (o.group.userData.shards||[]).forEach((s,i)=>{ s.rotation.x+=.004*(i+1); s.rotation.y+=.006; s.position.y+=Math.sin(t+i)*.004; });
      (o.props?.userData?.shards||[]).forEach((s,i)=>{ s.rotation.x+=.004*(i+1); s.rotation.y+=.006; s.position.y+=Math.sin(t+i)*.004; });
    });
    // núcleo
    if(coreGroup){
      coreGroup.position.y=ISLAND_POS[0][1]+Math.sin(t*.5)*.4;
      const s=1+Math.sin(t*2.2)*.07; coreEye.scale.set(s,s,s);
      coreEye.material.emissiveIntensity=2.2+Math.sin(t*3)*.5;
      ringA.rotation.x=t*.8; ringA.rotation.y=t*.4;
      ringB.rotation.z=t*.5;
      beamMat.uniforms.uTime.value=t;
      beamMat.uniforms.uIntensity.value=.5+Math.sin(t*2)*.12;
      serverLights.forEach(o=>{ o.m.color.setHex(Math.sin(t*4+o.ph)>0?0xff2222:0x330a0a); });
      const isl1=islands[1];
      if(isl1?.props?.userData?.eye){ isl1.props.userData.eye.lookAt(camera.position); }
    }
    // puentes: orbes = memorias
    bridges.forEach(b=>{
      b.orbs.forEach(o=>{ const u=(t*o.speed+o.off)%1; o.m.position.copy(b.curve.getPoint(u)); o.m.position.y+=Math.sin(t*3+o.off*9)*.3;
        const sc=.7+Math.sin(t*5+u*20)*.3; o.m.scale.set(sc,sc,sc); });
      b.mat.opacity=.6+Math.sin(t*2)*.15;
    });
    // partículas subiendo
    [[emberPts,emberVel,-8,55,1],[ashPts,ashVel,-4,32,.6]].forEach(([pts,vel,y0,y1,sp])=>{
      if(!pts) return; const p=pts.geometry.attributes.position;
      for(let i=0;i<p.count;i++){ let y=p.getY(i)+vel[i]*.03*sp*3;
        if(y>y1){ y=y0; p.setX(i,(Math.random()-.5)*140); p.setZ(i,(Math.random()-.5)*140); }
        p.setY(i,y); }
      p.needsUpdate=true;
    });
    // fuegos circuito 4
    const c4=islands[4];
    if(c4?.props?.userData?.fire) c4.props.userData.fire.intensity=1.4+Math.sin(t*9)*.5+Math.random()*.3;
    if(c4?.props?.userData?.pit) c4.props.userData.pit.material.color.setHSL(.03+Math.sin(t*3)*.02,.95,.45+Math.sin(t*7)*.1);
    // fantasmas / jaulas / niebla
    const c5=islands[5];
    if(c5){ (c5.props?.userData?.ghosts||[]).forEach(o=>{ o.m.position.y=1.8+Math.sin(t+o.ph)*.4; o.m.material.opacity=.25+Math.sin(t*1.5+o.ph)*.12; });
      (c5.props?.userData?.mists||[]).forEach((m,i)=>{ m.rotation.y+=.002*(i+1); }); }
    const c2=islands[2];
    if(c2){ (c2.props?.userData?.swing||[]).forEach(o=>{ const s=Math.sin(t*1.2+o.ph)*.15; o.m.rotation.z=s; o.b.rotation.z=s; o.b.position.y=4.3+Math.sin(t*2+o.ph)*.1; }); }
    // vuelo cámara
    if(camGoal&&tgtGoal){
      camera.position.lerp(camGoal,.06); controls.target.lerp(tgtGoal,.08);
      if(camera.position.distanceTo(camGoal)<.4){camGoal=null;tgtGoal=null;}
    }
    controls.update();
    if(composer&&bloomOn) composer.render(); else renderer.render(scene,camera);
    /* --- vigilante de rendimiento: ventanas de 120 fotogramas --- */
    if(lastT){
      accMs+=t-lastT; accN++;
      if(accN%120===0){
        const avg=accMs/120; accMs=0;
        if(avg>45&&bloomOn){
          if(pixelRatio>1){ pixelRatio=1; resize(); }   // primero resolución
          else { bloomOn=false; composer=null; }        // y si no basta, el resplandor
        }
      }
    }
    lastT=t;
    /* ---------- etiquetas ----------
       Todas se proyectan primero y luego se colocan en orden fijo (por id) contra una lista fija
       de desplazamientos. Entrada determinista → salida determinista: no hay temblor por
       fotograma y las etiquetas se mueven juntas a umbrales discretos en vez de parpadear cada
       una por su cuenta. El candidato del fotograma anterior se prueba el primero: esa es la
       histéresis que impide que dos etiquetas se intercambien el sitio con un giro de un píxel. */
    const placed=[];
    Object.keys(islands).map(Number).sort((a,b)=>a-b).forEach(id=>{
      const o=islands[id];
      labelV.copy(o.group.position); labelV.y+=id===0?22:11.5;
      labelV.project(camera);
      if(labelV.z>=1){ o.label.style.display='none'; return; }
      const x=(labelV.x*.5+.5)*canvas.clientWidth, y=(-labelV.y*.5+.5)*canvas.clientHeight;
      const w=o.label.offsetWidth||96, h=o.label.offsetHeight||22;
      /* El solucionador de colisiones sólo movía en vertical, así que en vertical de móvil las
         etiquetas de las islas laterales salían cortadas por el borde. Se ciñe la x al lienzo; si
         la etiqueta no cabe de ninguna manera, se calla en vez de salir partida. */
      const M=8, cw=canvas.clientWidth;
      if(w>cw-2*M){ o.label.style.display='none'; return; }
      const cx=Math.min(Math.max(x,w/2+M),cw-w/2-M);
      const cands=LABEL_OFFS.slice();
      const prev=cands.indexOf(lastDy.get(id));
      if(prev>0) cands.unshift(cands.splice(prev,1)[0]);
      let pick=null;
      for(const dy of cands){
        const box={l:cx-w/2,r:cx+w/2,t:y-h+dy,b:y+dy};
        if(!placed.some(p=>box.l<p.r&&p.l<box.r&&box.t<p.b&&p.t<box.b)){ pick={dy,box}; break; }
      }
      if(!pick){ o.label.style.display='none'; return; }   /* ninguna posición libre: se calla */
      lastDy.set(id,pick.dy); placed.push(pick.box);
      o.label.style.display='block';
      o.label.style.transform=`translate(-50%,-100%) translate(${cx}px,${y+pick.dy}px)`;
    });
    if(coords) coords.textContent=`CÁMARA r=${camera.position.length().toFixed(0)}m · θ=${(Math.atan2(camera.position.x,camera.position.z)*57.3).toFixed(0)}° · ${CIRCUITS.find(c=>c.id===current).tag}`;
  }
  animate();
  selectCircuit(1,false);
  /* selectCircuit vuela hasta la isla 1; al arrancar queremos ver el archipiélago entero, que es
     lo que vende la escena. El dock ya está relleno y la isla 1 marcada como activa. */
  frameDefaultView(true);
}

function preloadModels(){
  if(typeof THREE==='undefined'||!THREE.GLTFLoader) return;
  const loader=new THREE.GLTFLoader();
  const slots={c1:{f:'models/circuito1_fisgones.glb',id:1},c2:{f:'models/circuito2_mercaderes.glb',id:2},
    c3:{f:'models/circuito3_ladrones.glb',id:3},c4:{f:'models/circuito4_verdugos.glb',id:4},
    c5:{f:'models/circuito5_abandonados.glb',id:5},nucleo:{f:'models/nucleo.glb',id:0},isla:{f:'models/isla_roca.glb',id:'isla'}};
  Object.keys(slots).forEach(k=>{
    loader.load(slots[k].f, gltf=>{
      if(k==='isla') applyIslaModel(gltf);
      else applyCircuitModel(slots[k].id, gltf);
    }, null, ()=>{ /* sin modelo: se queda el procedural */ });
  });
}
function applyIslaModel(gltf){
  [1,2,3,4,5].forEach(id=>{
    const o=islands[id]; if(!o) return;
    const model=gltf.scene.clone(true);
    const box=new THREE.Box3().setFromObject(model); const s=box.getSize(new THREE.Vector3());
    const k=(o.R*2.3)/Math.max(s.x,s.z); model.scale.setScalar(k);
    box.setFromObject(model); const c=box.getCenter(new THREE.Vector3());
    /* La cara superior del modelo es la plaza de la isla: se ancla a 0.9, el mismo
       convenio que los sets de circuito (baseY de applyCircuitModel). Antes se anclaba
       min.y a 0 y la roca entera quedaba montada SOBRE la plaza, con min.y como fondo.
       La meseta del .glb queda ~0.2 por debajo de su tope (labio comprimido en el
       asset), así que los props procedurales se apoyan solos. */
    model.position.set(-c.x,0.9-box.max.y,-c.z);
    o.group.add(model);
    ['base','top','under','tip'].forEach(p=>{ if(o.baseParts && o.baseParts[p]) o.baseParts[p].visible=false; });
    model.traverse(m=>{ if(m.isMesh){ m.castShadow=true; m.receiveShadow=true; } });
  });
}
function applyCircuitModel(id, gltf){
  const o=islands[id]; if(!o) return;
  const model=gltf.scene;
  const box=new THREE.Box3().setFromObject(model); let s=box.getSize(new THREE.Vector3());
  const target=(id===0?17:o.R*1.9); const k=target/Math.max(s.x,s.y,s.z);
  model.scale.setScalar(k);
  box.setFromObject(model); const c=box.getCenter(new THREE.Vector3());
  model.position.set(-c.x,0,-c.z);
  const baseY=(id===0?9.2:0.9); model.position.y=baseY-box.min.y;
  model.traverse(m=>{ if(m.isMesh){ m.castShadow=true; m.receiveShadow=true; } });
  o.props.visible=false; o.group.add(model);
  (o.group.userData.pilBits||[]).forEach(p=>{ p.visible=false; });
  if(id===0){
    const sp=o.group.userData.coreSpire; if(sp) sp.visible=false;
    const pl=o.group.userData.corePlat; if(pl) pl.visible=false;
    const topY=model.position.y+(box.max.y-box.min.y);
    const eyeY=topY+2.6;
    coreEye.position.y=eyeY;
    const pup=o.group.userData.pupil; if(pup){ pup.position.y=eyeY; pup.position.z=.9*(eyeY/14.5); }
    ringA.position.y=eyeY; ringB.position.y=eyeY;
  }
  toast('🜲 Modelo 3D de '+CIRCUITS.find(x=>x.id===id).tag+' cargado');
}
function flyTo(id){
  if(!camera) return;
  const p=ISLAND_POS[id];
  const dir=new THREE.Vector3(p[0],0,p[2]);
  if(dir.length()<1) dir.set(0,0,1);
  dir.normalize();
  const eye = id===0 ? new THREE.Vector3(0,24,26)
                     : new THREE.Vector3(p[0]+dir.x*22,p[1]+12,p[2]+dir.z*22);
  const tgt = id===0 ? new THREE.Vector3(0,12,-3)
                     : new THREE.Vector3(p[0],p[1]+3,p[2]);
  /* El expediente abierto tapa 480px por la derecha (por abajo en móvil). Sin esto, elegir un
     circuito lo deja justo debajo del panel: se desplaza el encuadre para centrarlo en la parte
     que SÍ se ve, no en el centro del lienzo. */
  const panelPx=(panel&&panel.classList.contains('open')&&innerWidth>860)
    ? Math.min(480,innerWidth*.94) : 0;
  if(panelPx>0){
    const d=eye.distanceTo(tgt);
    const k=panelPx*0.5*(2*d*Math.tan(camera.fov*Math.PI/360)*camera.aspect)/innerWidth;
    const right=new THREE.Vector3().subVectors(tgt,eye).cross(camera.up).normalize();
    eye.addScaledVector(right,k); tgt.addScaledVector(right,k);
  }
  camGoal=eye; tgtGoal=tgt;
}

function checkGL(){
  try{
    const c=document.createElement('canvas');
    return !!(window.WebGLRenderingContext&&(c.getContext('webgl')||c.getContext('experimental-webgl')));
  }catch(e){ return false; }
}
if(typeof THREE==='undefined'){
  const n=document.getElementById('nothree');
  if(n){ n.classList.remove('hidden'); n.textContent='⚠ No se pudo cargar Three.js (vendor/three.min.js). Descarga la carpeta completa y abre index.html desde ella.'; }
}else if(!THREE.OrbitControls){
  const n=document.getElementById('nothree');
  if(n){ n.classList.remove('hidden'); n.textContent='⚠ Falta OrbitControls (vendor/OrbitControls.js).'; }
  try{ initThree(); }catch(e){ console.error(e); }
}else if(!checkGL()){
  const n=document.getElementById('nothree');
  if(n){ n.classList.remove('hidden'); n.textContent='⚠ Tu navegador no permite WebGL. Activa aceleración por hardware o usa Chrome/Edge.'; }
}else{
  try{ initThree(); preloadModels(); }catch(e){ console.error(e);
    const n=document.getElementById('nothree');
    if(n){ n.classList.remove('hidden'); n.textContent='⚠ Error iniciando 3D: '+(e.message||e); } }
}
