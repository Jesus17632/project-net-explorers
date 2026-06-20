/* ============================================================
 *  win.js — Pantalla de victoria FLOTANTE (modal sobre el nivel).
 *  Niveles normales: tarjeta casi blanca con acentos dorados suaves.
 *  Nivel 10: tarjeta final dorada y espectacular.
 * ============================================================ */
(function () {
  "use strict";
  if (window.NEWin) return;

  var TOTAL_NIVELES = 10;
  var CONFETTI = ["#f5b301", "#ffd866", "#ff9f1c", "#fff0b8", "#e0930a", "#fffbe6"];

  function inyectarEstilos() {
    if (document.getElementById("ne-win-styles")) return;
    var css = ''
      + '.ne-win-overlay{position:fixed;inset:0;z-index:100000;display:flex;'
      + 'align-items:center;justify-content:center;overflow:hidden;'
      + 'background:rgba(28,32,26,.42);backdrop-filter:blur(6px);'
      + '-webkit-backdrop-filter:blur(6px);opacity:0;'
      + 'transition:opacity .4s ease;font-family:"Nunito",system-ui,sans-serif;}'
      + '.ne-win-overlay.show{opacity:1;}'
      + '.ne-win-card{position:relative;width:min(90vw,420px);padding:40px 32px 30px;'
      + 'background:linear-gradient(170deg,#ffffff 0%,#fffaf0 100%);'
      + 'border:1px solid #f3e4c0;border-radius:28px;text-align:center;'
      + 'box-shadow:0 22px 60px rgba(90,70,20,.28),0 0 0 5px rgba(245,179,1,.10);'
      + 'transform:scale(.85) translateY(28px);opacity:0;'
      + 'transition:transform .55s cubic-bezier(.16,1,.3,1),opacity .45s ease;}'
      + '.ne-win-overlay.show .ne-win-card{transform:scale(1) translateY(0);opacity:1;}'
      + '.ne-win-badge{position:relative;width:100px;height:100px;margin:0 auto 8px;'
      + 'border-radius:50%;display:flex;align-items:center;justify-content:center;'
      + 'background:linear-gradient(145deg,#ffd866,#f2ab12);'
      + 'box-shadow:0 10px 24px rgba(240,165,0,.4),inset 0 -4px 10px rgba(180,110,0,.3);'
      + 'transform:scale(0);opacity:0;'
      + 'animation:ne-pop .7s .2s cubic-bezier(.18,1.25,.4,1) forwards;}'
      + '@keyframes ne-pop{0%{transform:scale(0) rotate(-20deg);opacity:0}'
      + '55%{opacity:1}65%{transform:scale(1.12) rotate(5deg)}'
      + '100%{transform:scale(1) rotate(0);opacity:1}}'
      + '.ne-win-badge svg{opacity:0;transform:scale(.4);'
      + 'animation:ne-badge-in .45s .55s cubic-bezier(.18,1.4,.4,1) forwards;}'
      + '@keyframes ne-badge-in{to{opacity:1;transform:scale(1)}}'
      + '.ne-win-kicker,.ne-win-title,.ne-win-sub,.ne-win-medal,.ne-win-actions{'
      + 'opacity:0;transform:translateY(12px);animation:ne-rise .5s both;}'
      + '.ne-win-kicker{animation-delay:.45s}'
      + '.ne-win-title{animation-delay:.55s}'
      + '.ne-win-sub{animation-delay:.65s}'
      + '.ne-win-medal{animation-delay:.7s}'
      + '.ne-win-actions{animation-delay:1.15s}'
      + '@keyframes ne-rise{to{opacity:1;transform:translateY(0)}}'
      + '.ne-win-kicker{font-family:"Fredoka",sans-serif;font-weight:700;'
      + 'letter-spacing:2.5px;font-size:13px;color:#cf8d05;margin-top:10px;}'
      + '.ne-win-title{font-family:"Fredoka",sans-serif;font-weight:700;'
      + 'font-size:clamp(30px,8vw,40px);color:#3a2c10;margin:2px 0 4px;line-height:1.05;}'
      + '.ne-win-sub{font-size:16px;color:#8a7b5e;font-weight:600;margin-bottom:16px;}'
      + '.ne-win-stars{display:flex;justify-content:center;gap:12px;margin-bottom:24px;height:42px;}'
      + '.ne-win-stars b{font-size:36px;line-height:1;color:#f5b301;'
      + 'text-shadow:0 3px 6px rgba(200,130,0,.35);opacity:0;'
      + 'transform:translateY(-30px) scale(0) rotate(-35deg);'
      + 'animation:ne-drop .55s cubic-bezier(.2,1.3,.35,1) both;}'
      + '.ne-win-stars b:nth-child(1){animation-delay:.8s}'
      + '.ne-win-stars b:nth-child(2){animation-delay:1.0s}'
      + '.ne-win-stars b:nth-child(3){animation-delay:1.2s}'
      + '@keyframes ne-drop{0%{opacity:0;transform:translateY(-30px) scale(0) rotate(-35deg)}'
      + '50%{opacity:1}65%{transform:translateY(4px) scale(1.35) rotate(10deg)}'
      + '82%{transform:translateY(-2px) scale(.94) rotate(-3deg)}'
      + '100%{opacity:1;transform:translateY(0) scale(1) rotate(0)}}'
      + '.ne-win-btn{width:100%;font-family:"Fredoka",sans-serif;font-weight:700;'
      + 'font-size:18px;border:none;border-radius:16px;padding:15px 18px;cursor:pointer;'
      + 'color:#fff;background:linear-gradient(145deg,#f5b301,#e08a00);'
      + 'box-shadow:0 8px 18px rgba(224,138,0,.4);'
      + 'transition:transform .18s cubic-bezier(.2,1,.3,1),filter .18s ease,box-shadow .18s ease;}'
      + '.ne-win-btn:hover{transform:translateY(-3px);filter:brightness(1.05);'
      + 'box-shadow:0 12px 24px rgba(224,138,0,.5);}'
      + '.ne-win-btn:active{transform:translateY(-1px) scale(.99);}'
      + '.ne-confetti{position:absolute;top:-14px;width:10px;height:14px;border-radius:2px;'
      + 'will-change:transform,opacity;animation:ne-fall cubic-bezier(.3,.2,.5,1) forwards;'
      + 'pointer-events:none;}'
      + '@keyframes ne-fall{0%{transform:translateY(-20px) rotate(0);opacity:1}'
      + '85%{opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}'
      + '.ne-win-card.final{width:min(92vw,460px);padding:48px 34px 34px;border:none;'
      + 'background:radial-gradient(circle at 50% 16%,#fff7da 0%,#ffd860 48%,#f2a200 100%);'
      + 'box-shadow:0 30px 90px rgba(150,90,0,.5),0 0 0 7px rgba(255,255,255,.2);'
      + 'animation:ne-cardglow 3s ease-in-out infinite alternate;}'
      + '@keyframes ne-cardglow{0%{box-shadow:0 30px 90px rgba(150,90,0,.5),0 0 0 7px rgba(255,255,255,.16)}'
      + '100%{box-shadow:0 34px 110px rgba(245,179,1,.62),0 0 0 11px rgba(255,255,255,.3)}}'
      + '.ne-win-rays{position:absolute;top:-16px;left:50%;width:240px;height:240px;'
      + 'transform:translateX(-50%);z-index:0;border-radius:50%;opacity:0;'
      + 'background:repeating-conic-gradient(rgba(255,255,255,.55) 0deg 8deg,'
      + 'rgba(255,255,255,0) 8deg 22deg);'
      + '-webkit-mask:radial-gradient(circle,#000 36%,transparent 70%);'
      + 'mask:radial-gradient(circle,#000 36%,transparent 70%);'
      + 'animation:ne-rays-in .6s .25s ease forwards,ne-spin 14s linear infinite;}'
      + '@keyframes ne-rays-in{to{opacity:1}}'
      + '@keyframes ne-spin{to{transform:translateX(-50%) rotate(360deg)}}'
      + '.ne-win-card.final .ne-win-badge{z-index:1;width:120px;height:120px;'
      + 'background:linear-gradient(145deg,#fffbe9,#ffe48a);'
      + 'box-shadow:0 12px 30px rgba(180,120,0,.45),inset 0 -5px 12px rgba(190,130,0,.3);}'
      + '.ne-win-card.final .ne-win-badge.floating{animation:ne-float 3.4s ease-in-out infinite;}'
      + '@keyframes ne-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}'
      + '.ne-win-card.final .ne-win-kicker{position:relative;z-index:1;color:#9a5d00;'
      + 'font-size:14px;letter-spacing:3px;}'
      + '.ne-win-card.final .ne-win-title{position:relative;z-index:1;'
      + 'font-size:clamp(36px,10vw,52px);'
      + 'background:linear-gradient(100deg,#7a4a00 20%,#c47b00 40%,#fff3c4 50%,#c47b00 60%,#7a4a00 80%);'
      + 'background-size:250% 100%;-webkit-background-clip:text;background-clip:text;'
      + '-webkit-text-fill-color:transparent;color:transparent;'
      + 'animation:ne-rise .5s .55s both,ne-shine 3.5s 1s linear infinite;}'
      + '@keyframes ne-shine{to{background-position:-250% 0}}'
      + '.ne-win-card.final .ne-win-sub{position:relative;z-index:1;color:#6e4900;'
      + 'font-size:17px;font-weight:700;}'
      + '.ne-win-medal{position:relative;z-index:1;display:inline-block;margin:4px auto 18px;'
      + 'font-family:"Fredoka",sans-serif;font-weight:700;color:#fff;font-size:15px;'
      + 'padding:6px 18px;border-radius:999px;background:linear-gradient(145deg,#15402e,#0c2a1d);'
      + 'box-shadow:0 6px 14px rgba(0,0,0,.22);letter-spacing:1px;}'
      + '.ne-win-card.final .ne-win-stars b{font-size:42px;color:#fff;'
      + 'text-shadow:0 0 14px rgba(255,255,255,.9),0 3px 6px rgba(180,120,0,.45);}'
      + '.ne-win-card.final .ne-win-btn{position:relative;z-index:1;'
      + 'background:linear-gradient(145deg,#15402e,#0c2a1d);'
      + 'box-shadow:0 8px 18px rgba(0,0,0,.28);}'
      + '.ne-win-card.final .ne-win-btn:hover{box-shadow:0 12px 26px rgba(0,0,0,.35);}'
      + '@media (prefers-reduced-motion:reduce){'
      + '.ne-win-card,.ne-win-badge,.ne-win-badge svg,.ne-win-kicker,.ne-win-title,'
      + '.ne-win-sub,.ne-win-medal,.ne-win-actions,.ne-win-stars b,.ne-win-rays{'
      + 'animation-duration:.01ms!important;animation-delay:0s!important;}}';
    var st = document.createElement("style");
    st.id = "ne-win-styles";
    st.textContent = css;
    document.head.appendChild(st);
  }

  function lanzarConfetti(overlay, cantidad) {
    for (var i = 0; i < cantidad; i++) {
      var p = document.createElement("div");
      p.className = "ne-confetti";
      var size = 6 + Math.random() * 8;
      p.style.left = (Math.random() * 100) + "vw";
      p.style.width = size + "px";
      p.style.height = (size * 1.4) + "px";
      p.style.background = CONFETTI[(Math.random() * CONFETTI.length) | 0];
      p.style.animationDuration = (2.6 + Math.random() * 2.4) + "s";
      p.style.animationDelay = (Math.random() * 0.5) + "s";
      if (Math.random() < 0.5) p.style.borderRadius = "50%";
      overlay.appendChild(p);
    }
  }

  function nivelActual() {
    var m = (location.pathname.match(/level(\d+)\.html/i) || [])[1];
    return m ? parseInt(m, 10) : 1;
  }
  function nombreNivel() {
    var h = document.querySelector(".nivel-info h1, h1");
    return h ? h.textContent.trim() : "";
  }

  var ICON_CHECK = '<svg width="48" height="48" viewBox="0 0 24 24" fill="none">'
    + '<path d="M5 13l4 4L19 7" stroke="#fff" stroke-width="3" '
    + 'stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICON_TROFEO = '<svg width="62" height="62" viewBox="0 0 24 24" fill="#c47b00">'
    + '<path d="M7 4h10v2h3v2a4 4 0 0 1-4 4h-.3A5 5 0 0 1 13 16.9V19h3v2H8v-2h3v-2.1'
    + 'A5 5 0 0 1 8.3 12H8a4 4 0 0 1-4-4V6h3V4zm10 4V6H7v2a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3z"/>'
    + '</svg>';

  function show(idForzado) {
    if (document.querySelector(".ne-win-overlay")) return;
    inyectarEstilos();
    var id = idForzado || nivelActual();
    var final = id >= TOTAL_NIVELES;
    var nombre = nombreNivel();
    var overlay = document.createElement("div");
    overlay.className = "ne-win-overlay";
    var kicker = final ? "¡JUEGO COMPLETADO!" : ("NIVEL " + id + " COMPLETADO");
    var titulo = final ? "¡Felicidades!" : "¡Bien hecho!";
    var sub = final ? "Terminaste todos los niveles de NetExplorers" : (nombre || "Conexión lista");
    var boton = final
      ? '<button class="ne-win-btn" data-go="menu.html">Volver al menú</button>'
      : '<button class="ne-win-btn" data-go="level' + (id + 1) + '.html">Siguiente nivel →</button>';
    var medal = final ? '<div class="ne-win-medal">' + TOTAL_NIVELES + ' / ' + TOTAL_NIVELES + ' niveles</div>' : '';
    overlay.innerHTML =
        '<div class="ne-win-card' + (final ? ' final' : '') + '">'
      +   (final ? '<div class="ne-win-rays"></div>' : '')
      +   '<div class="ne-win-badge">' + (final ? ICON_TROFEO : ICON_CHECK) + '</div>'
      +   '<div class="ne-win-kicker">' + kicker + '</div>'
      +   '<h2 class="ne-win-title">' + titulo + '</h2>'
      +   '<p class="ne-win-sub">' + sub + '</p>'
      +   medal
      +   '<div class="ne-win-stars"><b>★</b><b>★</b><b>★</b></div>'
      +   '<div class="ne-win-actions">' + boton + '</div>'
      + '</div>';
    document.body.appendChild(overlay);
    overlay.querySelectorAll("[data-go]").forEach(function (b) {
      b.addEventListener("click", function () { window.location.href = b.getAttribute("data-go"); });
    });
    requestAnimationFrame(function () { overlay.classList.add("show"); });
    if (final) {
      var badge = overlay.querySelector(".ne-win-badge");
      setTimeout(function () { if (badge) badge.classList.add("floating"); }, 950);
    }
    lanzarConfetti(overlay, final ? 150 : 60);
    if (final) {
      setTimeout(function () { lanzarConfetti(overlay, 80); }, 800);
      setTimeout(function () { lanzarConfetti(overlay, 80); }, 1700);
    }
  }

  window.NEWin = { show: show };
})();