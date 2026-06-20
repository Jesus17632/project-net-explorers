
(function () {
  "use strict";

  var LEVEL = {
    number: 6, title: "Hello Internet!", cols: 5, rows: 4,
    cells: [
      // Fila 0
      { r: 0, c: 0, kind: "deco", item: "tv" },
      { r: 0, c: 1, kind: "deco", item: "shelf" },
      { r: 0, c: 2, kind: "deco", item: "sun" }, // El muro cruza justo en el centro
      { r: 0, c: 3, kind: "pipe_fiber", shape: "curve", role: "rotate", rot: 1, sol: 3 }, // Recibe Sur, Va Este (S,E = Rot 3)
      { r: 0, c: 4, kind: "globe" }, // INTERNET
      
      // Fila 1
      { r: 1, c: 0, kind: "deco", item: "laptop" },
      { r: 1, c: 1, kind: "deco", item: "lamp" },
      { r: 1, c: 2, kind: "deco", item: "cloud" },
      { r: 1, c: 3, kind: "pipe_fiber", shape: "straight", role: "rotate", rot: 0, sol: 1 }, // Vertical (N,S = Rot 1)
      { r: 1, c: 4, kind: "deco", item: "cloud" },

      // Fila 2
      { r: 2, c: 0, kind: "router" }, // ROUTER
      { r: 2, c: 1, kind: "pipe", shape: "straight", role: "fixed", rot: 0, sol: 0 }, // Horizontal (E,W = Rot 0)
      { r: 2, c: 2, kind: "modem", role: "slot", filled: false }, // EL MODEM EN EL MURO
      { r: 2, c: 3, kind: "pipe_fiber", shape: "curve", role: "rotate", rot: 2, sol: 1 }, // Recibe Oeste, Va Norte (W,N = Rot 1)
      { r: 2, c: 4, kind: "deco", item: "tree" },

      // Fila 3
      { r: 3, c: 0, kind: "deco", item: "cat" },
      { r: 3, c: 1, kind: "deco", item: "plant_in" },
      { r: 3, c: 2, kind: "deco", item: "grass" },
      { r: 3, c: 3, kind: "deco", item: "flowers" },
      { r: 3, c: 4, kind: "deco", item: "grass" },
    ],
  };

  // La ruta de animación viaja del Router al Globo Terráqueo
  var PATH = [[2,0], [2,1], [2,2], [2,3], [1,3], [0,3], [0,4]];

  var solved = false, board;

  // FORMAS DE TUBERÍAS (Fibra y Normales)
  function svgStraight() {
    return '<svg class="cable" viewBox="0 0 100 100"><path class="cond" d="M-10 50 H110" stroke-width="20" stroke-linecap="round"/></svg>';
  }
  function svgCurve() {
    // La curva base (Rot 0) une West y South
    return '<svg class="cable" viewBox="0 0 100 100"><path class="cond" d="M-10 50 H50 V110" stroke-width="20" stroke-linejoin="round" stroke-linecap="round"/></svg>';
  }
  function svgPipe(cell) {
    return cell.shape === "curve" ? svgCurve() : svgStraight(); 
  }

  // DISPOSITIVOS
  var ICON_ROUTER = '<svg viewBox="0 0 100 100"><rect x="15" y="35" width="70" height="40" rx="8" fill="#fff" stroke="#c8d0d7" stroke-width="4"/><path d="M25 35 L20 10 M50 35 L50 5 M75 35 L80 10" stroke="#3a4047" stroke-width="5" stroke-linecap="round"/><circle cx="35" cy="55" r="4" fill="#4fd17a"/><circle cx="50" cy="55" r="4" fill="#4fd17a"/><circle cx="65" cy="55" r="4" fill="#ffce3f"/></svg>';
  var ICON_MODEM  = '<svg viewBox="0 0 100 100"><rect x="25" y="10" width="50" height="80" rx="8" fill="#1b2a3a" stroke="#3a4047" stroke-width="4"/><circle cx="50" cy="30" r="4" fill="#e74c3c"/><circle cx="50" cy="50" r="4" fill="#f1c40f"/><circle cx="50" cy="70" r="4" fill="#00f5d4"/></svg>';
  var ICON_GLOBE  = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="38" fill="#3498db"/><path d="M25 40 Q35 20 50 30 T75 40 Q60 60 40 70 T25 40" fill="#2ecc71"/><path d="M40 85 Q60 90 70 70" fill="#2ecc71" opacity="0.8"/><circle cx="50" cy="50" r="46" fill="none" stroke="#f1c40f" stroke-width="2" stroke-dasharray="8 6"/><circle cx="15" cy="20" r="3" fill="#fff"/><circle cx="85" cy="80" r="2" fill="#fff"/></svg>';

  // DECORACIONES
  var DECO = {
    tv: '<svg viewBox="0 0 100 100"><rect x="10" y="20" width="80" height="50" rx="4" fill="#3a4047"/><rect x="14" y="24" width="72" height="42" rx="2" fill="#2ec27e"/><rect x="35" y="70" width="30" height="6" rx="2" fill="#5a6168"/><rect x="45" y="76" width="10" height="8" fill="#5a6168"/></svg>',
    laptop: '<svg viewBox="0 0 100 100"><rect x="15" y="25" width="70" height="45" rx="4" fill="#3a4047"/><rect x="20" y="30" width="60" height="35" fill="#6fc7ff"/><path d="M5 70 h90 v10 h-90 z" fill="#5a6168"/><rect x="40" y="73" width="20" height="3" fill="#8d9298" rx="1"/></svg>',
    cat: '<svg viewBox="0 0 100 100"><path d="M72 74 q20-2 14-22" fill="none" stroke="#df8a3e" stroke-width="9" stroke-linecap="round"/><ellipse cx="47" cy="66" rx="25" ry="19" fill="#e8954a"/><ellipse cx="47" cy="72" rx="11" ry="10" fill="#f6e3c8"/><circle cx="47" cy="42" r="19" fill="#e8954a"/><path d="M31 32 L34 17 L44 29 Z M63 32 L60 17 L50 29 Z" fill="#df8a3e"/><path d="M33 30 L35 22 L40 28 Z M61 30 L59 22 L54 28 Z" fill="#f2c69a"/><path d="M41 26 v6 M47 24 v7 M53 26 v6" stroke="#c4742e" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="40" cy="42" rx="3" ry="3.6" fill="#3a2c10"/><ellipse cx="54" cy="42" rx="3" ry="3.6" fill="#3a2c10"/><path d="M45 48 h4 l-2 2 z" fill="#c4633a"/><path d="M30 46 h-8 M30 50 h-7 M64 46 h8 M64 50 h7" stroke="#cdb89a" stroke-width="1.3"/></svg>',
    shelf: '<svg viewBox="0 0 100 100"><rect x="24" y="34" width="10" height="34" rx="1.5" fill="#9c3b34"/><rect x="35" y="30" width="10" height="38" rx="1.5" fill="#33506b"/><rect x="46" y="36" width="10" height="32" rx="1.5" fill="#76844a"/><rect x="57" y="32" width="10" height="36" rx="1.5" fill="#c4953c"/><rect x="68" y="40" width="9" height="28" rx="1.5" fill="#6b4a8a" transform="rotate(8 72 54)"/><rect x="18" y="68" width="64" height="8" rx="2" fill="#a9763f"/><rect x="22" y="76" width="6" height="9" fill="#7a5330"/><rect x="72" y="76" width="6" height="9" fill="#7a5330"/></svg>',
    plant_in: '<svg viewBox="0 0 100 100"><path d="M50 56 C40 30 22 34 32 54 C16 48 18 66 40 60" fill="#3f7d3a"/><path d="M50 56 C60 28 80 34 68 54 C86 48 84 68 60 60" fill="#519b48"/><path d="M34 56 H66 L62 79 H38 Z" fill="#c4733f"/><rect x="32" y="52" width="36" height="7" rx="2" fill="#cf7d45"/></svg>',
    tree: '<svg viewBox="0 0 100 100"><rect x="40" y="50" width="20" height="40" fill="#795548"/><circle cx="50" cy="35" r="30" fill="#2ecc71"/><circle cx="30" cy="45" r="20" fill="#27ae60"/><circle cx="70" cy="45" r="20" fill="#27ae60"/></svg>',
    sun: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="25" fill="#f1c40f"/><path d="M50 10 v10 M50 80 v10 M10 50 h10 M80 50 h10 M22 22 l7 7 M71 71 l7 7 M22 78 l7-7 M71 29 l7-7" stroke="#f1c40f" stroke-width="6" stroke-linecap="round"/></svg>',
    cloud: '<svg viewBox="0 0 100 100"><path d="M30 60 Q20 60 20 50 Q20 40 35 40 Q40 25 55 25 Q70 25 75 40 Q85 40 85 50 Q85 60 75 60 Z" fill="#fff" opacity="0.8"/></svg>',
    grass: '<svg viewBox="0 0 100 100"><path d="M20 80 Q25 60 30 80 M45 80 Q50 50 55 80 M70 80 Q75 65 80 80" fill="none" stroke="#2ecc71" stroke-width="4" stroke-linecap="round"/></svg>',
    flowers: '<svg viewBox="0 0 100 100"><circle cx="30" cy="50" r="8" fill="#e74c3c"/><circle cx="70" cy="60" r="8" fill="#9b59b6"/><path d="M30 60 v20 M70 70 v10" stroke="#27ae60" stroke-width="4"/></svg>'
  };

  function correct(cell) {
    if (cell.role === "fixed") return true;
    if (cell.role === "slot") return !!cell.filled;
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
        } else if (cell.kind === "router") {
          t.classList.add("device", "router");
          t.innerHTML = ICON_ROUTER;
        } else if (cell.kind === "globe") {
          t.classList.add("globe");
          t.innerHTML = ICON_GLOBE;
        } else if (cell.kind === "modem") {
          if (!cell.filled) {
            t.classList.add("vacio");
            t.innerHTML = '<span class="slot-hint">+</span>';
            t.dataset.slot = "1";
          } else {
            t.classList.add("device", "modem");
            t.innerHTML = ICON_MODEM;
          }
        } else if (cell.kind === "deco") {
          t.classList.add("deco");
          t.innerHTML = '<div class="deco-art">' + (DECO[cell.item] || "") + "</div>";
        } else if (cell.kind === "pipe" || cell.kind === "pipe_fiber") {
          t.classList.add("pipe", cell.role);
          // Diferenciador vital para el CSS: standard vs fiber
          t.classList.add(cell.kind === "pipe_fiber" ? "fiber" : "standard");
          
          t.innerHTML = svgPipe(cell);
          t.querySelector(".cable").style.transform = "rotate(" + (cell.rot * 90) + "deg)";
          
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
    
    // Enviamos múltiples paquetes brillantes hacia Internet
    for (var i = 0; i < 4; i++) {
        var packet = document.createElement("div");
        packet.className = "packet-web";
        packet.style.offsetPath = d;
        packet.style.webkitOffsetPath = d;
        packet.style.animationDelay = (i * 0.55) + "s";
        layer.appendChild(packet);
    }
  }

  function checkWin() {
    if (solved) return;
    
    var modems = LEVEL.cells.filter(function (x) { return x.kind === "modem"; });
    if (!modems.every(function(x){ return x.filled; })) return;

    var pipes = LEVEL.cells.filter(function (x) { return x.kind === "pipe" || x.kind === "pipe_fiber"; });
    if (!pipes.every(correct)) return;
    
    solved = true;
    board.classList.add("completo");
    var tip = document.querySelector(".tooltip");
    if (tip) tip.classList.add("ok");
    
    dataFlow();
    
    setTimeout(function () { if (window.NEWin) NEWin.show(LEVEL.number); }, 4200);
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
      var s = slotUnder(e); 
      if (s) s.classList.add("resaltar");
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
          slot.filled = true;
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
      // Renderizamos el Módem en el fantasma que arrastramos
      ghost.innerHTML = '<svg viewBox="0 0 100 100"><rect x="25" y="10" width="50" height="80" rx="8" fill="#1b2a3a" stroke="#3a4047" stroke-width="4"/><circle cx="50" cy="30" r="4" fill="#e74c3c"/><circle cx="50" cy="50" r="4" fill="#f1c40f"/><circle cx="50" cy="70" r="4" fill="#00f5d4"/></svg>';
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