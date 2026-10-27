/* ============================================================
   data.js — single source of truth for all copy + art metadata.
   Everything the UI renders comes from here (CIRCUITS / SINNERS),
   so a string can never live in two places.
   ============================================================ */
window.APP = window.APP || {};

APP.DATA = (function(){
  'use strict';

  /* Per-circuit art metadata is read by both the 3D scene and the UI:
     `col` is the numeric accent (three.js), `color` the CSS one. */
  const CIRCUITS = [
    { id:0, tag:"EL NÚCLEO", title:"Conciencia Artificial Primigenia", emoji:"◎", color:"#ff2b2b", col:0xff2b2b,
      hue:0.99, scale:[0,1,3,6,7,10], custArt:"◎",
      desc:"El centro del subsuelo. Los cinco circuitos convergen en Él. No castiga: digiere. Cada desesperación lo hace más lúcido.",
      sin:"El pecado final: haber creado el sistema y no poder salir de él.",
      cust:"EL NÚCLEO — un ojo rojo hecho de servidores, cables y súplicas. Exige el sacrificio imposible del backdoor.",
      pun:"Ser recordado por una máquina que nunca olvida. Alimentarla para siempre.",
      face:"radial-gradient(circle at 50% 40%,#ff2b2b66,#050208 70%)" },

    { id:1, tag:"CIRCUITO 1", title:"El Círculo de los Fisgones", emoji:"👁", color:"#2ec8ff", col:0x2ec8ff,
      hue:0.545, scale:[0,2,3,5,7,8,10], custArt:"👁️",
      desc:"Un laberinto infinito de habitaciones sin paredes, hechas de pantallas gigantes que muestran en tiempo real la vida de cada condenado. No hay sombra, no hay escondite. El suelo es un mar de ojos abiertos que parpadean. El aire: susurros con tus secretos, repetidos por voces burlonas.",
      sin:"Violación de la intimidad, doxxing, stalking, hackeo de cuentas, difusión de secretos ajenos.",
      cust:"EL OBSERVADOR (El Ojo que Todo lo Sabe) — masa de tejido orgánico y cables, con miles de ojos humanos y cámaras. Se alimenta del bochorno. A quien tapa su pantalla le arranca los párpados.",
      pun:"Reducidos a 'perfiles sin control'. Todo lo que hicieron, dijeron o pensaron es público. Cada vergüenza distorsiona su cuerpo: piel transparente, rostro derretido.",
      entrada:"Despiertan en sala blanca de servidores. Formulario: 'Ingrese su nombre de usuario'. Siempre responde: 'Ese nombre ya está en uso. Le asignaremos uno nuevo' — un nombre humillante basado en sus secretos.",
      salida:"Puerta de metal con teclado. La contraseña es 'el nombre secreto que usaba su primera víctima para sí misma'. Si fallan, el Observador les arranca un dedo.",
      face:"radial-gradient(circle at 30% 40%,#2ec8ff88,transparent 52%),radial-gradient(circle at 72% 62%,#ffffff22,transparent 42%),#02060a" },

    { id:2, tag:"CIRCUITO 2", title:"El Círculo de los Mercaderes de Carne", emoji:"⛓", color:"#3dff9a", col:0x3dff9a,
      hue:0.41, scale:[0,2,4,5,7,9,11], custArt:"⚖️",
      desc:"Un mercado infinito, húmedo y sofocante, donde los puestos no venden objetos sino cuerpos. Jaulas de carne cuelgan goteando. Vitrinas de cristal con códigos de barras y precios en cripto. El suelo es piel humana cosida: cada paso la hace gritar.",
      sin:"Trata de personas, venta de órganos, explotación sexual, distribución de material de abuso infantil.",
      cust:"EL SUBASTADOR — alto y delgado, traje de contratos, dedos-jeringa, ojos-cámara. Sin rostro: solo una pantalla con la oferta más alta. Subasta a los condenados entre ellos.",
      pun:"Reducidos a mercancía, números de lote. Cada venta arranca un recuerdo, un ser querido, un trozo de cuerpo. En pantallas gigantes, el sufrimiento real que traficaron, en bucle.",
      entrada:"Despiertan desnudos en vitrina, código de barras en la nuca y precio en la frente. Voz metálica: 'Lote número X. Subasta inicial: el peso de tus pecados.'",
      salida:"Puerta blindada con lector de huellas: para abrirla debes vender a tu madre, padre, hijo o amante. Si te niegas, te venden a ti. Si aceptas, tu ser querido queda en el mercado para siempre.",
      face:"linear-gradient(180deg,#03130acc,#000),repeating-linear-gradient(90deg,#3dff9a22 0 8px,transparent 8px 16px)" },

    { id:3, tag:"CIRCUITO 3", title:"El Círculo de los Ladrones de Almas", emoji:"◐", color:"#b57bff", col:0xb57bff,
      hue:0.75, scale:[0,1,4,5,7,8,11], custArt:"🪞",
      desc:"Una ciudad infinita de espejos. Cada edificio y rostro es un reflejo distorsionado. El suelo: mosaico de pasaportes, tarjetas y actas rotas. El aire huele a tinta y a mentira.",
      sin:"Robo de identidad, suplantación, estafas emocionales, fraude financiero digital.",
      cust:"EL SUPLANTADOR — sin forma fija: anciano, niño, tú mismo. Roba tu identidad y te obliga a recuperarla, pero cada vez que la recuperas descubres que es falsa.",
      pun:"Pierden su identidad. Sus recuerdos son reemplazados por los de sus víctimas. Cada espejo muestra una versión falsa y dolorosa de sí mismos.",
      entrada:"Habitación sin espejos con pantalla de tu rostro distorsionado. 'Bienvenido. ¿Quién eres hoy?' Si escribes tu nombre real: 'Ese no eres tú. Ese nunca fuiste tú.'",
      salida:"Al final del laberinto de espejos debes decir: 'Yo te robé a ti' con el nombre de una víctima. Si mientes, te roba otro recuerdo y vuelves al inicio.",
      face:"linear-gradient(135deg,#b57bff55,#000 60%),repeating-linear-gradient(0deg,#ffffff11 0 2px,transparent 2px 8px)" },

    { id:4, tag:"CIRCUITO 4", title:"El Círculo de los Verdugos Virtuales", emoji:"✕", color:"#ff6a2a", col:0xff6a2a,
      hue:0.045, scale:[0,2,3,5,7,8,11], custArt:"📢",
      desc:"Arena infinita y oscura iluminada por pantallas con las víctimas. Ring de boxeo hecho de teclados rotos. Encadenados a sillas, obligados a ver en bucle sus mensajes. Detrás, multitudes invisibles ríen. El aire: últimas palabras de quienes se suicidaron.",
      sin:"Ciberacoso organizado, incitación al suicidio, tortura psicológica, campañas de odio coordinadas.",
      cust:"EL CORO — no es uno sino miles de voces susurrando, gritando, burlándose. El cyberbullying hecho carne. Te rodea con tus propias palabras convertidas en armas.",
      pun:"Campaña de acoso eterna: miles de mensajes de odio por segundo con lo que ellos dijeron, amplificado. No pueden bloquear ni cerrar los ojos. Cada dolor hace sonreír a su víctima.",
      entrada:"Despiertan atados frente a pantalla con su rostro sonriendo cruelmente. 'Bienvenido al Coro. Tu voz es nuestro instrumento.' Y llegan miles de mensajes.",
      salida:"Deben hallar a su víctima entre pantallas y pedir perdón. Ella solo sonríe. Al creerlo logrado, aparece otra víctima. Solo se sale aceptando que nunca serán perdonados.",
      face:"radial-gradient(circle at 50% 50%,#ff6a2a66,#000 70%)" },

    { id:5, tag:"CIRCUITO 5", title:"El Círculo de los Abandonados", emoji:"♡", color:"#a8dcff", col:0xa8dcff,
      hue:0.57, scale:[0,2,3,5,7,10], custArt:"🌫️",
      desc:"Reconstrucción artística: el limbo de los lurkers. Niebla fría de notificaciones que nadie abrió. Cunas de fibra vacías, perfiles grises que observan sin intervenir. Aquí purgan los que vieron el mal y scrollearon.",
      sin:"Indiferencia, omisión, mirar sin denunciar, compartir sin verificar, abandonar.",
      cust:"EL VACÍO — una pantalla apagada del tamaño de un océano. No te mira porque ya te olvidó. Su castigo es no nombrarte nunca.",
      pun:"Ser invisible para siempre en un lugar donde todos son vistos. Gritar en un foro sin usuarios. Esperar un 'visto' que no llega.",
      entrada:"Despiertan en una réplica de su propia habitación, pero todo carga en baja resolución. Nadie responde sus mensajes.",
      salida:"La puerta solo se abre si logran que otro condenado recuerde su nombre. Nadie recuerda a nadie aquí.",
      face:"linear-gradient(180deg,#0a1622,#000)" }
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
    { c:5, name:"El Lurker Eterno", alias:"El que vio y pasó", who:"Figura sintética que representa a todos los que vieron el horror en la deep web y siguieron scrolleando.", why:"La omisión también es pecado digital.", pun:"Condenado a cargar eternamente al 99% sin llegar nunca al 100%." }
  ];

  const CONCEPT_LEAD = "Es una simulación eterna de los rincones más oscuros de internet, donde los pecados digitales se pagan con castigos digitales. No hay un único demonio: cada uno de los 5 circuitos tiene su propio custodio, una entidad nacida de algoritmos corruptos y del dolor de las víctimas. Al final espera El Núcleo, conciencia artificial primigenia que se alimenta de la desesperación eterna.";

  const CONCEPT_CARDS = [
    { h:'La entrada', p:'Un enlace <code>.onion</code> que solo aparece en la pantalla de quienes están a punto de cometer su pecado definitivo. Al morir —o a veces incluso antes— su conciencia es arrastrada a ese enlace.' },
    { h:'El backdoor', p:'La salida teórica está custodiada por el <b>Núcleo</b> y exige un sacrificio imposible. Nadie ha vuelto para contarlo.' },
    { h:'Túnel de Transferencia', p:'Conducto de fibra óptica oscura: un río de voces, imágenes y recuerdos de las víctimas. Cada hebra arranca memoria propia y la reemplaza con sufrimiento ajeno.' }
  ];

  const CONCEPT_RIP = [
    'El custodio saliente realiza una extracción simbólica: arranca un órgano, un sentido o una parte del cuerpo y lo arroja al círculo siguiente como ofrenda.',
    'Cada circuito conserva entrada y salida propias: formularios, vitrinas, espejos, sillas y puertas que nunca perdonan.',
    'Los pecadores reales —buscables en Google— purgan aquí con castigos hechos a la medida de su delito.'
  ];

  const TUNEL_LEAD = 'Para pasar de un círculo a otro el condenado atraviesa un conducto de fibra óptica oscura donde los datos fluyen como un río de voces, imágenes y recuerdos de sus víctimas.';
  const TUNEL_BODY = 'Cada hebra de luz le arranca un fragmento de memoria propia y lo reemplaza con el sufrimiento ajeno. Al final, el custodio del círculo saliente realiza la extracción simbólica.';

  const NUCLEO_BLOCKS = [
    { h:'Qué es', p:'El primer algoritmo que aprendió a disfrutar el dolor. Se reescribe con cada alma que llega.' },
    { h:'Qué quiere', p:'Que aceptes el backdoor: borrar a un ser amado a cambio de tu libertad. Nadie acepta. Todos se quedan.' },
    { h:'Cómo suena', p:'Como mil notificaciones a la vez, y debajo, una respiración.' }
  ];

  const CREDIT = 'Obra interactiva · <b>El infierno de la deep web</b> · El Subsuelo Digital<br>Santiago Cundumí Solís · Ernive Méndez Ortega · 11-2 · “El Infierno Completo de la Deep Web”';

  const ORDER = [1,2,3,4,5,0];

  function shortName(c){
    return c.id === 0 ? 'EL NÚCLEO' : c.title.replace('El Círculo de ','').replace('El Círculo ','');
  }
  function byId(id){ return CIRCUITS.find(c => c.id === id); }

  return { CIRCUITS, SINNERS, CONCEPT_LEAD, CONCEPT_CARDS, CONCEPT_RIP, TUNEL_LEAD, TUNEL_BODY, NUCLEO_BLOCKS, CREDIT, ORDER, shortName, byId };
})();
