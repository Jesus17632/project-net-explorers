
(function () {
  "use strict";

  // Inyectamos CSS de electricidad para cambiar el color a amarillo al ganar
  var style = document.createElement('style');
  style.innerHTML = `
    #board.completo .tile.pipe .cable rect.cond { fill: #facc15 !important; }
    #board.completo .tile.pipe .cable path.cond { stroke: #facc15 !important; }
    #board.completo .tile.pipe { filter: drop-shadow(0 0 11px rgba(250, 204, 21, 0.7)) !important; }
    #board.completo .plug { background: #facc15 !important; }
    .packet.power { background: radial-gradient(circle, #ffffff 0%, #fef08a 42%, rgba(250,204,21,0) 72%) !important; filter: drop-shadow(0 0 10px rgba(250,204,21,1)) !important; }
    .wifi-beam { position: absolute; width: 64px; height: 64px; z-index: 10; opacity: 0; pointer-events: none; transition: opacity 0.5s ease; animation: float-wifi 1.2s ease-in-out infinite alternate; filter: drop-shadow(0 0 8px rgba(46, 194, 126, 0.6)); }
    .wifi-beam path { fill: #2ec27e; }
    @keyframes float-wifi { from { transform: translateY(0px) scale(0.9); } to { transform: translateY(-12px) scale(1.1); } }
  `;
  document.head.appendChild(style);

  var LEVEL = {
    number: 2, title: "Share the Printer", cols: 5, rows: 4,
    cells: [
      { r: 1, c: 0, kind: "outlet" },
      { r: 1, c: 1, kind: "pipe", shape: "curve",    role: "fixed",  rot: 1, sol: 0 },
      { r: 2, c: 1, kind: "pipe", shape: "curve",    role: "slot",   rot: 3, sol: 2, filled: false },
      { r: 2, c: 2, kind: "pipe", shape: "straight", role: "fixed",  rot: 0, sol: 0 },
      { r: 2, c: 3, kind: "pipe", shape: "straight", role: "rotate", rot: 1, sol: 0 },
      { r: 2, c: 4, kind: "printer" },
      { r: 3, c: 1, kind: "router_deco" }, // Decorativo para el Wi-Fi
      
      { r: 0, c: 0, kind: "deco", item: "window" },
      { r: 0, c: 4, kind: "deco", item: "shelf" },
      { r: 3, c: 4, kind: "deco", item: "toybox" },
    ],
  };

  // El camino viaja del Enchufe (1,0) a la Impresora (2,4)
  var PATH = [[1,0], [1,1], [2,1], [2,2], [2,3], [2,4]];

  var solved = false, board;

  function svgStraight() {
    return '<svg class="cable" viewBox="0 0 100 100">'
      + '<rect class="cond" x="-8" y="40" width="116" height="20" rx="10"/>'
      + '<rect class="shine" x="-8" y="43" width="116" height="5" rx="2.5"/></svg>';
  }
  function svgCurve() {
    return '<svg class="cable" viewBox="0 0 100 100">'
      + '<path class="cond" d="M-8 50 H50 V108" fill="none" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>'
      + '<path class="shine" d="M-8 47 H47 V108" fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  function svgPipe(cell) { return cell.shape === "curve" ? svgCurve() : svgStraight(); }
  
  function svgPreviewL() {
    return '<svg class="cable" viewBox="0 0 100 100">'
      + '<path class="cond" d="M50 18 V50 H82" fill="none" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>'
      + '<path class="shine" d="M47 18 V47 H82" fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  var DECO = {
    window:'<svg viewBox="0 0 100 100"><defs><linearGradient id="wsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe4f7"/><stop offset="1" stop-color="#eaf6ff"/></linearGradient></defs><rect x="20" y="16" width="60" height="58" rx="2" fill="url(#wsky)"/><circle cx="65" cy="30" r="7" fill="#ffe49a"/><path d="M20 58 q12-10 24-2 q12-8 24 2 v16 H20 Z" fill="#9ccb86"/><rect x="16" y="12" width="68" height="64" rx="4" fill="none" stroke="#946537" stroke-width="6"/><path d="M50 14 V74 M18 44 H82" stroke="#946537" stroke-width="5"/><rect x="12" y="74" width="76" height="7" rx="2" fill="#7a5330"/></svg>',
    shelf:'<svg viewBox="0 0 100 100"><defs><linearGradient id="shw" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#a9763f"/><stop offset="1" stop-color="#875a2e"/></linearGradient></defs><rect x="24" y="34" width="10" height="34" rx="1.5" fill="#9c3b34"/><rect x="35" y="30" width="10" height="38" rx="1.5" fill="#33506b"/><rect x="46" y="36" width="10" height="32" rx="1.5" fill="#76844a"/><rect x="57" y="32" width="10" height="36" rx="1.5" fill="#c4953c"/><rect x="68" y="40" width="9" height="28" rx="1.5" fill="#6b4a8a" transform="rotate(8 72 54)"/><rect x="18" y="68" width="64" height="8" rx="2" fill="url(#shw)"/><rect x="22" y="76" width="6" height="9" fill="#7a5330"/><rect x="72" y="76" width="6" height="9" fill="#7a5330"/></svg>',
    toybox:'<svg viewBox="0 0 100 100"><defs><linearGradient id="chest" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#b07c45"/><stop offset="1" stop-color="#8d6133"/></linearGradient></defs><circle cx="62" cy="36" r="10" fill="#c44b41"/><rect x="32" y="30" width="14" height="14" rx="2" fill="#3f6b9c"/><rect x="24" y="44" width="52" height="32" rx="4" fill="url(#chest)"/><rect x="22" y="40" width="56" height="10" rx="3" fill="#6f4a28"/><rect x="46" y="50" width="8" height="6" rx="1" fill="#d8b15e"/></svg>'
  };

  var ICON_OUTLET  = '<svg viewBox="0 0 100 100"><rect x="30" y="20" width="40" height="60" rx="6" fill="#fdfdfd" stroke="#d5dce2" stroke-width="4"/><circle cx="40" cy="40" r="4" fill="#23262e"/><circle cx="60" cy="40" r="4" fill="#23262e"/><circle cx="50" cy="65" r="5" fill="#23262e"/></svg>';
  var ICON_PRINTER = '<svg viewBox="0 0 100 100"><rect x="25" y="15" width="50" height="25" rx="3" fill="#ffffff" stroke="#c8d0d7" stroke-width="2"/><path d="M 35 25 H 65 M 35 32 H 65" stroke="#eef1f4" stroke-width="3" stroke-linecap="round"/><rect x="15" y="40" width="70" height="30" rx="6" fill="#eef1f4" stroke="#c8d0d7" stroke-width="2"/><rect x="25" y="70" width="50" height="15" rx="2" fill="#ffffff" stroke="#c8d0d7" stroke-width="2"/><circle cx="72" cy="55" r="4" fill="#4fd17a"/><rect x="20" y="52" width="40" height="4" rx="2" fill="#3a4047" opacity="0.1"/></svg>';
  var ICON_ROUTER  = '<svg viewBox="0 0 100 100"><rect x="30" y="20" width="4" height="27" rx="2" fill="#3a4047" transform="rotate(-12 32 33)"/><rect x="66" y="20" width="4" height="27" rx="2" fill="#3a4047" transform="rotate(12 68 33)"/><rect x="22" y="44" width="56" height="28" rx="6" fill="#eef1f4"/><rect x="22" y="44" width="56" height="28" rx="6" fill="none" stroke="#c8d0d7" stroke-width="2"/><circle cx="34" cy="58" r="3" fill="#4fd17a"/><circle cx="44" cy="58" r="3" fill="#4fd17a"/><circle cx="54" cy="58" r="3" fill="#ffce3f"/></svg>';
  var SVG_WIFI     = '<svg viewBox="0 0 24 24"><path d="M12 2C7.3 2 3.1 4.3.5 7.9L2 9.8C4.1 6.8 7.8 4.9 12 4.9S19.9 6.8 22 9.8L23.5 7.9C20.9 4.3 16.7 2 12 2zM12 8C9.1 8 6.5 9.4 4.9 11.6L6.4 13.5C7.6 11.8 9.7 10.7 12 10.7S16.4 11.8 17.6 13.5L19.1 11.6C17.5 9.4 14.9 8 12 8zM12 14C10.3 14 8.9 14.8 8.1 16.1L12 21L15.9 16.1C15.1 14.8 13.7 14 12 14z"/></svg>';

  function correct(cell) {
    if (cell.role === "fixed") return true;
    if (cell.role === "slot")  return !!cell.filled;
    if (cell.shape === "straight") return (cell.rot - cell.sol) % 2 === 0;
    return cell.rot === cell.sol;
  }
  
  function find(r, c) {
    for (var i = 0; i < LEVEL.cells.length; i++)
      if (LEVEL.cells[i].r === r && LEVEL.cells[i].c === c) return LEVEL.cells[i];
    return null;
  }
  
  function clickSfx() { if (window.NEAudio) window.NEAudio.playClick(); }

  function render() {
    board.innerHTML = "";
    for (var r = 0; r < LEVEL.rows; r++) {
      for (var c = 0; c < LEVEL.cols; c++) {
        var cell = find(r, c);
        var t = document.createElement("div");
        t.className = "tile";
        t.dataset.rc = r + "-" + c;
        if (!cell) {
          t.classList.add("floor");
        } else if (cell.kind === "outlet") {
          t.classList.add("device", "outlet");
          t.innerHTML = ICON_OUTLET + '<span class="plug right"></span>';
        } else if (cell.kind === "printer") {
          t.classList.add("device", "printer");
          t.innerHTML = ICON_PRINTER + '<span class="plug left"></span>';
        } else if (cell.kind === "router_deco") {
          t.classList.add("device", "router");
          t.innerHTML = ICON_ROUTER; // Sin el enchufe porque es inalámbrico
        } else if (cell.kind === "deco") {
          t.classList.add("floor", "deco");
          t.innerHTML = '<div class="deco-art">' + (DECO[cell.item] || "") + "</div>";
        } else if (cell.kind === "pipe") {
          t.classList.add("pipe", cell.role);
          if (cell.role === "slot" && !cell.filled) {
            t.classList.add("vacio");
            t.innerHTML = '<span class="slot-hint">+</span>';
          } else {
            if (correct(cell)) t.classList.add("ok");
            t.innerHTML = svgPipe(cell);
            t.querySelector(".cable").style.transform = "rotate(" + (cell.rot * 90) + "deg)";
          }
          if (cell.role === "rotate") {
            t.classList.add("girable");
            (function (cell) {
              t.addEventListener("click", function () {
                if (solved) return;
                cell.rot = (cell.rot + 1) % 4;
                clickSfx(); render(); checkWin();
              });
            })(cell);
          }
          if (cell.role === "slot") t.dataset.slot = "1";
        }
        board.appendChild(t);
      }
    }
  }

  function dataFlow() {
    var layer = document.createElement("div");
    layer.className = "flujo-layer";
    board.appendChild(layer);
    var lr = layer.getBoundingClientRect();
    var pts = PATH.map(function (p) {
      var el = board.querySelector('[data-rc="' + p[0] + '-' + p[1] + '"]');
      var rc = el.getBoundingClientRect();
      return (rc.left + rc.width / 2 - lr.left).toFixed(1) + " " + (rc.top + rc.height / 2 - lr.top).toFixed(1);
    });
    var d = 'path("M' + pts.join(" L") + '")';
    for (var i = 0; i < 4; i++) {
      var dot = document.createElement("div");
      dot.className = "packet power"; // Agregamos power para que brille amarillo
      dot.style.offsetPath = d;
      dot.style.webkitOffsetPath = d;
      dot.style.animationDelay = (i * 0.65) + "s";
      layer.appendChild(dot);
    }
  }

  function checkWin() {
    if (solved) return;
    var pipes = LEVEL.cells.filter(function (x) { return x.kind === "pipe"; });
    if (!pipes.every(correct)) return;
    
    solved = true;
    board.classList.add("completo");
    var tip = document.querySelector(".tooltip");
    if (tip) tip.classList.add("ok");
    dataFlow();

    // Animación de señal Wi-Fi flotante desde la Impresora al Router
    setTimeout(function() {
      var wifi = document.createElement("div");
      wifi.className = "wifi-beam";
      wifi.innerHTML = SVG_WIFI;
      // Posición centrada entre (3,1) y (2,4)
      wifi.style.left = "48%";
      wifi.style.top = "62%";
      board.appendChild(wifi);
      setTimeout(function() { wifi.style.opacity = "1"; }, 100);
    }, 1500);

    setTimeout(function () { if (window.NEWin) NEWin.show(LEVEL.number); }, 3800);
  }

  function initDrag() {
    var piece = document.getElementById("pieza-arrastrable");
    if (!piece) return;
    var ghost = null;
    function move(e) { ghost.style.left = e.clientX + "px"; ghost.style.top = e.clientY + "px"; }
    function slotUnder(e) {
      var el = document.elementFromPoint(e.clientX, e.clientY);
      return el ? el.closest('[data-slot="1"]') : null;
    }
    function onMove(e) {
      move(e);
      var prev = document.querySelector(".tile.resaltar");
      if (prev) prev.classList.remove("resaltar");
      var s = slotUnder(e); if (s) s.classList.add("resaltar");
    }
    function onUp(e) {
      var s = slotUnder(e);
      if (ghost) { ghost.remove(); ghost = null; }
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      var prev = document.querySelector(".tile.resaltar");
      if (prev) prev.classList.remove("resaltar");
      if (s && !solved) {
        var slot = LEVEL.cells.filter(function (x) { return x.role === "slot"; })[0];
        if (slot && !slot.filled) {
          slot.filled = true; slot.rot = slot.sol;
          piece.classList.add("usada");
          clickSfx(); render(); checkWin();
        }
      }
    }
    piece.addEventListener("pointerdown", function (e) {
      if (solved || piece.classList.contains("usada")) return;
      e.preventDefault();
      ghost = document.createElement("div");
      ghost.className = "ghost";
      ghost.innerHTML = svgPreviewL();
      document.body.appendChild(ghost);
      move(e);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    });
  }

  function renderTitle() {
    var cont = document.getElementById("titulo");
    if (!cont) return;
    var words = (LEVEL.title || "").split(" ");
    words.forEach(function (w, wi) {
      var cls = (wi === words.length - 1) ? "o" : "g";
      for (var i = 0; i < w.length; i++) {
        var sp = document.createElement("span");
        sp.className = cls; sp.textContent = w[i];
        cont.appendChild(sp);
      }
      if (wi < words.length - 1) {
        var gap = document.createElement("span");
        gap.className = "sp"; gap.innerHTML = "&nbsp;";
        cont.appendChild(gap);
      }
    });
  }

  function initProgress() {
    var prog = document.getElementById("progreso");
    if (!prog) return;
    for (var i = 1; i <= 10; i++) {
      var d = document.createElement("div");
      d.className = "progreso-dot" + (i === LEVEL.number ? " activo" : "");
      prog.appendChild(d);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    board = document.getElementById("board");
    renderTitle(); initProgress(); render(); initDrag();
  });
})();