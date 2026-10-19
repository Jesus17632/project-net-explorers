(function () {
  "use strict";
  if (window.__neAudioInit) return;   // evita doble inicialización
  window.__neAudioInit = true;

  if (typeof Howl === "undefined") { console.warn("[audio] Howler.js no está cargado."); return; }

  var KEY_MUTE  = "ne_audio_muted";
  var CLICK_VOL = 0.45;
  var MUSIC_VOL = 0.18, FADE_MS = 900;

  function isMuted() { return localStorage.getItem(KEY_MUTE) === "1"; }

  var IN_IFRAME = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();

  // clicks de botones y elementos con data-sfx reproducen un efecto de sonido
  var sfxClick = new Howl({ src: ["assets/sounds/click.mp3"], volume: CLICK_VOL });
  var SFX_SEL = "button, [role='button'], .tool, .card, .card-wrap, .btn-nav, .btn-jugar, .niv, .btn-volver, [data-sfx]";
  document.addEventListener("pointerdown", function (e) {
    if (isMuted()) return;
    if (e.button !== undefined && e.button !== 0) return;
    var el = e.target.closest(SFX_SEL);
    if (!el || el.id === "ne-mute-btn" || el.classList.contains("bloqueado")) return;
    sfxClick.play();
  }, true);

  if (IN_IFRAME) {
    window.NEAudio = { playClick: function () { if (!isMuted()) sfxClick.play(); }, isMuted: isMuted };
    return;
  }

  // musica de fondo (loop) y botón de mute

  var muted = isMuted(), started = false;
  var bgMusic = new Howl({ src: ["assets/sounds/menu-music.mp3"], loop: true, volume: MUSIC_VOL, html5: false });

  // Respaldo del loop: si el loop falla, reinicia la música al terminar
  bgMusic.on("end", function () {
    if (!muted) bgMusic.play();
  });

  Howler.mute(muted);

  // Arranca la música al cargar si el usuario ya interactuó con la página en otra visita
  function forceStart() {
    if (muted || started) return;
    if (Howler.ctx && Howler.ctx.state === "suspended") Howler.ctx.resume();
    started = true;
    var id = bgMusic.play();
    bgMusic.fade(0, MUSIC_VOL, FADE_MS, id);
  }
  forceStart(); 

  function onGesture(e) {
    if (e && e.target && e.target.closest && e.target.closest("#ne-mute-btn")) return;
    forceStart();
  }
  ["pointerdown", "touchstart", "keydown", "click"].forEach(function (ev) {
    document.addEventListener(ev, onGesture, { capture: true, passive: true });
  });


  window.addEventListener("focus", forceStart, true);
  window.addEventListener("blur", forceStart, true);

  function setMuted(m) {
    muted = m;
    localStorage.setItem(KEY_MUTE, m ? "1" : "0");
    Howler.mute(m);
    if (!m) forceStart();
    updateBtn();
  }

  var btn;
  var ICON_ON  = '<svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 8.5a4 4 0 0 1 0 7" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>';
  var ICON_OFF = '<svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9l5 6M21 9l-5 6" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>';
  function updateBtn() {
    if (!btn) return;
    btn.innerHTML = muted ? ICON_OFF : ICON_ON;
    btn.title = muted ? "Activar sonido" : "Silenciar";
    btn.setAttribute("aria-label", btn.title);
    btn.style.background = muted ? "#5b6470" : "#2e9e6a";
  }
  function crearBoton() {
    if (document.getElementById("ne-mute-btn")) { btn = document.getElementById("ne-mute-btn"); updateBtn(); return; }
    btn = document.createElement("button");
    btn.id = "ne-mute-btn";
    var s = btn.style;
    s.position="fixed"; s.top="14px"; s.right="14px"; s.zIndex="99999";
    s.width="44px"; s.height="44px"; s.borderRadius="50%"; s.border="none";
    s.cursor="pointer"; s.padding="0"; s.display="flex"; s.alignItems="center";
    s.justifyContent="center"; s.boxShadow="0 2px 10px rgba(21,64,46,0.25)";
    s.transition="transform .15s ease"; s.userSelect="none";
    btn.addEventListener("mouseenter", function(){ btn.style.transform="scale(1.1)"; });
    btn.addEventListener("mouseleave", function(){ btn.style.transform="scale(1)"; });
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (muted) setMuted(false);
      else if (!started) { forceStart(); updateBtn(); }
      else setMuted(true);
    });
    document.body.appendChild(btn);
    updateBtn();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", crearBoton);
  else crearBoton();

  window.NEAudio = { playClick: function(){ if(!muted) sfxClick.play(); }, setMuted: setMuted, isMuted: function(){ return muted; } };
})();