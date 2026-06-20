
(function () {
  "use strict";

  var LEVEL = {
    number: 3, title: "The whole house", cols: 4, rows: 4,
    cells: [
      // Fila 0 (Cuarto Superior)
      { r: 0, c: 0, kind: "deco", item: "window" },
      { r: 0, c: 1, kind: "deco", item: "lamp" },
      { r: 0, c: 2, kind: "tv" }, // TV
      { r: 0, c: 3, kind: "deco", item: "plant" },

      // Fila 1 (Línea del Modem)
      { r: 1, c: 0, kind: "router" }, // Modem
      { r: 1, c: 1, kind: "pipe", shape: "straight", role: "rotate", rot: 1, sol: 0 }, 
      { r: 1, c: 2, kind: "pipe", shape: "t",        role: "slot",   rot: 0, sol: 2, filled: false }, // Sol 2 = S, N, W (Se conecta a Izq, Arriba, Abajo)

      // Fila 2 (Cruce de la casa a la recámara)
      { r: 2, c: 2, kind: "pipe", shape: "t",        role: "rotate", rot: 3, sol: 0 }, // Sol 0 = N, S, E (Se conecta a Arriba, Abajo, Der)
      { r: 2, c: 3, kind: "phone" }, // Celular

      // Fila 3 (Oficina inferior)
      { r: 3, c: 0, kind: "deco", item: "shelf" },
      { r: 3, c: 1, kind: "pc" }, // PC
      { r: 3, c: 2, kind: "pipe", shape: "curve",    role: "rotate", rot: 0, sol: 1 }, // Sol 1 = N, W (Se conecta a Arriba, Izquierda)
      { r: 3, c: 3, kind: "deco", item: "cat" },
    ],
  };

  // Rutas independientes para animar los paquetes al ganar
  var PATH1 = [[1,0], [1,1], [1,2], [0,2]]; // Hacia la TV
  var PATH2 = [[1,0], [1,1], [1,2], [2,2], [2,3]]; // Hacia el Phone
  var PATH3 = [[1,0], [1,1], [1,2], [2,2], [3,2], [3,1]]; // Hacia la PC

  var solved = false, board;

  function svgStraight() {
    return '<svg class="cable" viewBox="0 0 100 100"><rect class="cond" x="-8" y="40" width="116" height="20" rx="10"/><rect class="shine" x="-8" y="43" width="116" height="5" rx="2.5"/></svg>';
  }
  function svgCurve() {
    return '<svg class="cable" viewBox="0 0 100 100"><path class="cond" d="M-8 50 H50 V108" fill="none" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/><path class="shine" d="M-8 47 H47 V108" fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  function svgT() {
    return '<svg class="cable" viewBox="0 0 100 100"><path class="cond" d="M50 -8 V108 M50 50 H108" fill="none" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/><path class="shine" d="M47 -8 V108 M47 47 H108" fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  function svgPipe(cell) {
    if (cell.shape === "t") return svgT();
    return cell.shape === "curve" ? svgCurve() : svgStraight(); 
  }
  function svgPreviewT() {
    return '<svg class="cable" viewBox="0 0 100 100"><path class="cond" d="M50 -8 V108 M50 50 H108" fill="none" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/><path class="shine" d="M47 -8 V108 M47 47 H108" fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  // Iconos
  var DECO = {
    window:'<svg viewBox="0 0 100 100"><defs><linearGradient id="wsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe4f7"/><stop offset="1" stop-color="#eaf6ff"/></linearGradient></defs><rect x="20" y="16" width="60" height="58" rx="2" fill="url(#wsky)"/><circle cx="65" cy="30" r="7" fill="#ffe49a"/><path d="M20 58 q12-10 24-2 q12-8 24 2 v16 H20 Z" fill="#9ccb86"/><rect x="16" y="12" width="68" height="64" rx="4" fill="none" stroke="#946537" stroke-width="6"/><path d="M50 14 V74 M18 44 H82" stroke="#946537" stroke-width="5"/><rect x="12" y="74" width="76" height="7" rx="2" fill="#7a5330"/></svg>',
    shelf:'<svg viewBox="0 0 100 100"><defs><linearGradient id="shw" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#a9763f"/><stop offset="1" stop-color="#875a2e"/></linearGradient></defs><rect x="24" y="34" width="10" height="34" rx="1.5" fill="#9c3b34"/><rect x="35" y="30" width="10" height="38" rx="1.5" fill="#33506b"/><rect x="46" y="36" width="10" height="32" rx="1.5" fill="#76844a"/><rect x="57" y="32" width="10" height="36" rx="1.5" fill="#c4953c"/><rect x="68" y="40" width="9" height="28" rx="1.5" fill="#6b4a8a" transform="rotate(8 72 54)"/><rect x="18" y="68" width="64" height="8" rx="2" fill="url(#shw)"/><rect x="22" y="76" width="6" height="9" fill="#7a5330"/><rect x="72" y="76" width="6" height="9" fill="#7a5330"/></svg>',
    lamp:'<svg viewBox="0 0 100 100"><defs><radialGradient id="lg" cx="0.5" cy="0.42" r="0.6"><stop offset="0" stop-color="#fff3c8" stop-opacity=".85"/><stop offset="1" stop-color="#ffe28a" stop-opacity="0"/></radialGradient><linearGradient id="lsh" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f1d59a"/><stop offset="1" stop-color="#e3bb6e"/></linearGradient></defs><ellipse cx="50" cy="40" rx="36" ry="32" fill="url(#lg)"/><path d="M36 26 H64 L72 50 H28 Z" fill="url(#lsh)"/><path d="M28 50 H72" stroke="#c7a25a" stroke-width="2"/><rect x="47" y="50" width="6" height="26" fill="#8d9298"/><ellipse cx="50" cy="78" rx="15" ry="4.5" fill="#70767d"/></svg>',
    plant:'<svg viewBox="0 0 100 100"><defs><linearGradient id="pot" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#c4733f"/><stop offset="1" stop-color="#a4582d"/></linearGradient></defs><path d="M50 56 C40 30 22 34 32 54 C16 48 18 66 40 60" fill="#3f7d3a"/><path d="M50 56 C60 28 80 34 68 54 C86 48 84 68 60 60" fill="#519b48"/><path d="M50 56 C49 42 46 34 42 30" stroke="#356b32" stroke-width="2.2" fill="none"/><path d="M34 56 H66 L62 79 H38 Z" fill="url(#pot)"/><rect x="32" y="52" width="36" height="7" rx="2" fill="#cf7d45"/><ellipse cx="50" cy="56" rx="15" ry="2.6" fill="#4a3326"/></svg>',
    cat:'<svg viewBox="0 0 100 100"><path d="M72 74 q20-2 14-22" fill="none" stroke="#df8a3e" stroke-width="9" stroke-linecap="round"/><ellipse cx="47" cy="66" rx="25" ry="19" fill="#e8954a"/><ellipse cx="47" cy="72" rx="11" ry="10" fill="#f6e3c8"/><circle cx="47" cy="42" r="19" fill="#e8954a"/><path d="M31 32 L34 17 L44 29 Z M63 32 L60 17 L50 29 Z" fill="#df8a3e"/><path d="M33 30 L35 22 L40 28 Z M61 30 L59 22 L54 28 Z" fill="#f2c69a"/><path d="M41 26 v6 M47 24 v7 M53 26 v6" stroke="#c4742e" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="40" cy="42" rx="3" ry="3.6" fill="#3a2c10"/><ellipse cx="54" cy="42" rx="3" ry="3.6" fill="#3a2c10"/><path d="M45 48 h4 l-2 2 z" fill="#c4633a"/><path d="M30 46 h-8 M30 50 h-7 M64 46 h8 M64 50 h7" stroke="#cdb89a" stroke-width="1.3"/></svg>'
  };

  var ICON_PC     = '<svg viewBox="0 0 100 100"><rect x="44" y="60" width="12" height="9" fill="#5a6168"/><rect x="32" y="69" width="36" height="6" rx="3" fill="#5a6168"/><rect x="16" y="18" width="68" height="46" rx="6" fill="#3a4047"/><rect x="21" y="23" width="58" height="34" rx="3" fill="#6fc7ff"/><rect x="26" y="28" width="9" height="9" rx="2" fill="#ffffff" opacity=".85"/><circle cx="62" cy="45" r="6" fill="#ffffff" opacity=".7"/></svg>';
  var ICON_ROUTER = '<svg viewBox="0 0 100 100"><rect x="30" y="20" width="4" height="27" rx="2" fill="#3a4047" transform="rotate(-12 32 33)"/><rect x="66" y="20" width="4" height="27" rx="2" fill="#3a4047" transform="rotate(12 68 33)"/><rect x="22" y="44" width="56" height="28" rx="6" fill="#eef1f4"/><rect x="22" y="44" width="56" height="28" rx="6" fill="none" stroke="#c8d0d7" stroke-width="2"/><circle cx="34" cy="58" r="3" fill="#4fd17a"/><circle cx="44" cy="58" r="3" fill="#4fd17a"/><circle cx="54" cy="58" r="3" fill="#ffce3f"/></svg>';
  var ICON_TV     = '<svg viewBox="0 0 100 100"><rect x="10" y="20" width="80" height="50" rx="4" fill="#3a4047"/><rect x="14" y="24" width="72" height="42" rx="2" fill="#2ec27e"/><rect x="35" y="70" width="30" height="6" rx="2" fill="#5a6168"/><rect x="45" y="76" width="10" height="8" fill="#5a6168"/></svg>';
  var ICON_PHONE  = '<svg viewBox="0 0 100 100"><rect x="30" y="15" width="40" height="70" rx="6" fill="#3a4047"/><rect x="34" y="19" width="32" height="56" rx="3" fill="#ff6f3c"/><circle cx="50" cy="81" r="3" fill="#5a6168"/></svg>';

  // Validación de corrección de rotación
  function correct(cell) {
    if (cell.role === "fixed") return true;
    if (cell.role === "slot")  return !!cell.filled && cell.rot === cell.sol;
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
        t.className = "tile floor"; 
        t.dataset.rc = r + "-" + c;
        if (!cell) {
          // Si no hay nada, dibuja un piso vacío
        } else if (cell.kind === "pc") {
          t.classList.add("device", "pc");
          t.innerHTML = ICON_PC + '<span class="plug right"></span>';
        } else if (cell.kind === "tv") {
          t.classList.add("device", "tv");
          t.innerHTML = ICON_TV + '<span class="plug down"></span>';
        } else if (cell.kind === "phone") {
          t.classList.add("device", "phone");
          t.innerHTML = ICON_PHONE + '<span class="plug left"></span>';
        } else if (cell.kind === "router") {
          t.classList.add("device", "router");
          t.innerHTML = ICON_ROUTER + '<span class="plug right"></span>';
        } else if (cell.kind === "deco") {
          t.classList.add("deco");
          t.innerHTML = '<div class="deco-art">' + (DECO[cell.item] || "") + "</div>";
        } else if (cell.kind === "pipe") {
          t.classList.remove("floor");
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

    // Lanza paquetes por las 3 rutas a la vez
    [PATH1, PATH2, PATH3].forEach(function(pathArray) {
        var pts = pathArray.map(function (p) {
          var el = board.querySelector('[data-rc="' + p[0] + '-' + p[1] + '"]');
          var rc = el.getBoundingClientRect();
          return (rc.left + rc.width / 2 - lr.left).toFixed(1) + " " + (rc.top + rc.height / 2 - lr.top).toFixed(1);
        });
        var d = 'path("M' + pts.join(" L") + '")';
        for (var i = 0; i < 3; i++) {
          var dot = document.createElement("div");
          dot.className = "packet";
          dot.style.offsetPath = d;
          dot.style.webkitOffsetPath = d;
          dot.style.animationDelay = (i * 0.75) + "s";
          layer.appendChild(dot);
        }
    });
  }

  function checkWin() {
    if (solved) return;
    var pipes = LEVEL.cells.filter(function (x) { return x.kind === "pipe"; });
    
    // Si todos los pipes no cumplen su solución visual, no ganas.
    if (!pipes.every(correct)) return;
    
    solved = true;
    board.classList.add("completo");
    var tip = document.querySelector(".tooltip");
    if (tip) tip.classList.add("ok");
    dataFlow();
    setTimeout(function () { if (window.NEWin) NEWin.show(LEVEL.number); }, 3600);
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
      ghost.innerHTML = svgPreviewT();
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