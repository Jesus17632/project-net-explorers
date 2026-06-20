/* ============================================================
 * level8.js — Level 8 (Signal Travels Far).
 * 9x6 Grid. Antennas (x2) and Repeater logic fixed.
 * Colorful Kawaii aesthetics.
 * ============================================================ */
(function () {
  "use strict";

  var LEVEL = {
    number: 8, title: "Signal Travels Far", cols: 9, rows: 6,
    cells: [
      // ROW 0: Sky and Roofs
      { r: 0, c: 0, kind: "deco", item: "sun" },
      { r: 0, c: 1, kind: "slot", accept: "antenna", role: "slot", filled: false }, // Techo A
      { r: 0, c: 2, kind: "pipe_wireless", shape: "straight", role: "rotate", rot: 1, sol: 0 },
      { r: 0, c: 3, kind: "pipe_wireless", shape: "straight", role: "rotate", rot: 0, sol: 0 },
      { r: 0, c: 4, kind: "pipe_wireless", shape: "straight", role: "rotate", rot: 1, sol: 0 },
      { r: 0, c: 5, kind: "pipe_wireless", shape: "straight", role: "rotate", rot: 0, sol: 0 },
      { r: 0, c: 6, kind: "pipe_wireless", shape: "straight", role: "rotate", rot: 1, sol: 0 },
      { r: 0, c: 7, kind: "slot", accept: "antenna", role: "slot", filled: false }, // Techo B
      { r: 0, c: 8, kind: "deco", item: "cloud" },

      // ROW 1: Upper floors / Mid sky
      { r: 1, c: 0, kind: "deco", item: "window" },
      { r: 1, c: 1, kind: "pipe", shape: "straight", role: "fixed", rot: 1, sol: 1 }, 
      { r: 1, c: 2, kind: "deco", item: "cloud" },
      { r: 1, c: 3, kind: "deco", item: "mountains" },
      { r: 1, c: 5, kind: "deco", item: "cloud" },
      { r: 1, c: 6, kind: "deco", item: "mountains" },
      { r: 1, c: 7, kind: "pipe", shape: "straight", role: "fixed", rot: 1, sol: 1 }, 
      { r: 1, c: 8, kind: "deco", item: "window" },

      // ROW 2: Ground floor / Surface
      { r: 2, c: 0, kind: "pc" }, // Casa A
      { r: 2, c: 1, kind: "router_cross", role: "fixed" }, // Conector múltiple Casa A
      { r: 2, c: 2, kind: "deco", item: "tree" },
      { r: 2, c: 4, kind: "deco", item: "lake" },
      { r: 2, c: 6, kind: "deco", item: "tree" },
      { r: 2, c: 7, kind: "router_cross", role: "fixed" }, // Conector múltiple Casa B
      { r: 2, c: 8, kind: "pc" }, // Casa B

      // ROW 3: Shallow Dirt (Subsuelo superior)
      { r: 3, c: 1, kind: "pipe_underground", shape: "straight", role: "fixed", rot: 1, sol: 1 },
      { r: 3, c: 3, kind: "deco", item: "bones" },
      { r: 3, c: 5, kind: "deco", item: "roots" },
      { r: 3, c: 7, kind: "pipe_underground", shape: "straight", role: "fixed", rot: 1, sol: 1 },

      // ROW 4: Deep Dirt & Repeater
      { r: 4, c: 1, kind: "pipe_underground", shape: "curve", role: "rotate", rot: 1, sol: 0 }, 
      { r: 4, c: 2, kind: "pipe_underground", shape: "straight", role: "rotate", rot: 1, sol: 0 }, 
      { r: 4, c: 3, kind: "pipe_underground", shape: "straight", role: "rotate", rot: 0, sol: 0 }, 
      { r: 4, c: 4, kind: "slot", accept: "repeater", role: "slot", filled: false }, // EL REPETIDOR
      { r: 4, c: 5, kind: "pipe_underground", shape: "straight", role: "rotate", rot: 1, sol: 0 }, 
      { r: 4, c: 6, kind: "pipe_underground", shape: "straight", role: "rotate", rot: 0, sol: 0 }, 
      { r: 4, c: 7, kind: "pipe_underground", shape: "curve", role: "rotate", rot: 2, sol: 3 }, 

      // ROW 5: Bedrock
      { r: 5, c: 2, kind: "deco", item: "gold" },
      { r: 5, c: 6, kind: "deco", item: "bones" },
    ]
  };

  var PATH_AIR = [[2,1], [1,1], [0,1], [0,2], [0,3], [0,4], [0,5], [0,6], [0,7], [1,7], [2,7]];
  var PATH_GROUND = [[2,1], [3,1], [4,1], [4,2], [4,3], [4,4], [4,5], [4,6], [4,7], [3,7], [2,7]];

  var solved = false, board;

  // GENERADORES SVG
  function svgStraight() { return '<svg class="cable" viewBox="0 0 100 100"><path class="cond" d="M-10 50 H110" /><path class="core" d="M-10 50 H110" /></svg>'; }
  function svgCurve() { return '<svg class="cable" viewBox="0 0 100 100"><path class="cond" d="M50 -10 V50 H110" stroke-linejoin="round"/><path class="core" d="M50 -10 V50 H110" stroke-linejoin="round"/></svg>'; }
  function svgPipe(cell) { return cell.shape === "curve" ? svgCurve() : svgStraight(); }

  // ICONOS HARDWARE (Ahora todos con caritas Kawaii ^ᴗ^)
  var ICON_PC     = '<svg viewBox="0 0 100 100"><rect x="15" y="25" width="70" height="45" rx="6" fill="#3a4047"/><rect x="20" y="30" width="60" height="35" rx="2" fill="#6fc7ff"/><path d="M35 70 L30 85 H70 L65 70 Z" fill="#5a6168"/><circle cx="50" cy="47" r="8" fill="#fff" opacity="0.4"/><g fill="#2c3e50"><circle cx="42" cy="45" r="3"/><circle cx="58" cy="45" r="3"/><path d="M 46 51 Q 50 56 54 51" fill="none" stroke="#2c3e50" stroke-width="2.5" stroke-linecap="round"/></g></svg>';
  var ICON_ROUTER = '<svg viewBox="0 0 100 100"><rect x="15" y="35" width="70" height="40" rx="8" fill="#fff" stroke="#c8d0d7" stroke-width="4"/><circle cx="30" cy="60" r="4" fill="#4fd17a"/><circle cx="40" cy="60" r="4" fill="#4fd17a"/><circle cx="50" cy="60" r="4" fill="#ffce3f"/><g fill="#2c3e50"><circle cx="65" cy="45" r="2.5"/><circle cx="78" cy="45" r="2.5"/><path d="M 68 50 Q 71.5 54 75 50" fill="none" stroke="#2c3e50" stroke-width="2" stroke-linecap="round"/></g></svg>';
  var ICON_ANTENNA = '<svg viewBox="0 0 100 100"><path d="M50 80 V40" stroke="#34495e" stroke-width="6" stroke-linecap="round"/><path d="M30 30 Q50 60 70 30" fill="none" stroke="#7f8c8d" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="40" r="8" fill="#e74c3c"/><path d="M40 20 Q50 10 60 20 M30 10 Q50 -5 70 10" fill="none" stroke="#3498db" stroke-width="3" stroke-linecap="round"/><rect x="40" y="55" width="20" height="16" rx="4" fill="#bdc3c7"/><g fill="#2c3e50"><circle cx="45" cy="60" r="1.5"/><circle cx="55" cy="60" r="1.5"/><path d="M48 64 Q50 67 52 64" fill="none" stroke="#2c3e50" stroke-width="1.5" stroke-linecap="round"/></g></svg>';
  var ICON_REPEATER = '<svg viewBox="0 0 100 100"><rect x="15" y="30" width="70" height="40" rx="8" fill="#2c3e50" stroke="#1a252f" stroke-width="4"/><line x1="-5" y1="50" x2="15" y2="50" stroke="#2980b9" stroke-width="8"/><line x1="85" y1="50" x2="105" y2="50" stroke="#2980b9" stroke-width="8"/><circle cx="30" cy="60" r="3" fill="#2ecc71"/><circle cx="38" cy="60" r="3" fill="#f1c40f"/><circle cx="46" cy="60" r="3" fill="#e74c3c"/><g fill="#ecf0f1"><circle cx="60" cy="45" r="2.5"/><circle cx="75" cy="45" r="2.5"/><path d="M64 50 Q67.5 54 71 50" fill="none" stroke="#ecf0f1" stroke-width="2" stroke-linecap="round"/></g></svg>';

  // DECORACIONES 
  var DECO = {
    sun: '<div class="anim-spin"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="22" fill="#f1c40f"/><path d="M50 12 v10 M50 78 v10 M12 50 h10 M78 50 h10 M23 23 l7 7 M70 70 l7 7 M23 77 l7-7 M70 23 l7-7" stroke="#f1c40f" stroke-width="5" stroke-linecap="round"/><g fill="#d35400"><circle cx="42" cy="48" r="2.5"/><circle cx="58" cy="48" r="2.5"/><path d="M 46 52 Q 50 58 54 52" fill="none" stroke="#d35400" stroke-width="2" stroke-linecap="round"/></g></svg></div>',
    cloud: '<div class="anim-float"><svg viewBox="0 0 100 100"><path d="M30 60 Q20 60 20 50 Q20 40 35 40 Q40 25 55 25 Q70 25 75 40 Q85 40 85 50 Q85 60 75 60 Z" fill="#fff" opacity="0.95"/><g fill="#34495e"><circle cx="46" cy="46" r="2"/><circle cx="60" cy="46" r="2"/><path d="M 50 50 Q 53 54 56 50" fill="none" stroke="#34495e" stroke-width="1.5" stroke-linecap="round"/></g></svg></div>',
    mountains: '<svg viewBox="0 0 100 100"><path d="M10 100 L40 40 L60 70 L80 30 L110 100 Z" fill="#b2bec3" opacity="0.8"/><path d="M40 40 L50 60 L30 60 Z" fill="#dfe6e9" opacity="0.8"/></svg>',
    window:'<svg viewBox="0 0 100 100"><rect x="25" y="20" width="50" height="50" fill="#81d4fa" stroke="#8b5a2b" stroke-width="6"/><path d="M50 20 V70 M25 45 H75" stroke="#8b5a2b" stroke-width="6"/></svg>',
    tree: '<svg viewBox="0 0 100 100"><rect x="42" y="60" width="16" height="40" fill="#795548"/><circle cx="50" cy="40" r="30" fill="#2ecc71"/><circle cx="30" cy="50" r="20" fill="#27ae60"/><circle cx="70" cy="50" r="20" fill="#27ae60"/></svg>',
    lake: '<svg viewBox="0 0 100 100"><ellipse cx="50" cy="80" rx="45" ry="15" fill="#3498db" opacity="0.9"/></svg>',
    bones: '<svg viewBox="0 0 100 100"><path d="M30 50 Q40 40 50 50 T70 50" fill="none" stroke="#ecf0f1" stroke-width="6" stroke-linecap="round" opacity="0.6"/><circle cx="25" cy="50" r="6" fill="#ecf0f1" opacity="0.6"/><circle cx="75" cy="50" r="6" fill="#ecf0f1" opacity="0.6"/></svg>',
    gold: '<svg viewBox="0 0 100 100"><polygon points="40,40 60,40 70,60 50,70 30,60" fill="#f1c40f"/><polygon points="40,40 50,55 60,40" fill="#f39c12"/><polygon points="30,60 50,55 50,70" fill="#e67e22"/></svg>',
    roots: '<svg viewBox="0 0 100 100"><path d="M50 0 Q45 20 50 40 T40 70 M50 40 Q60 60 55 80" fill="none" stroke="#4e342e" stroke-width="4" stroke-linecap="round"/></svg>'
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
        t.dataset.r = r; t.dataset.c = c;
        t.dataset.rc = r + "-" + c;
        
        // PINTADO ARQUITECTÓNICO Y DE NATURALEZA (Mejorado)
        if (c < 2) {
            if(r < 3) t.style.background = "#ffcc80"; // Casa A (Naranja claro)
            else t.style.background = "var(--tierra)"; 
            if (c === 1 && r < 3) t.style.borderRight = "8px solid #8b5a2b";
        } else if (c > 6) {
            if(r < 3) t.style.background = "#ce93d8"; // Casa B (Morado claro)
            else t.style.background = "var(--tierra)"; 
            if (c === 7 && r < 3) t.style.borderLeft = "8px solid #8b5a2b";
        } else {
            // Zona Central Libre (Cielo visible por CSS)
            if (r < 2) t.style.background = "transparent";
            else if (r === 2) t.style.background = "#81c784"; // Pasto más vivo
            else if (r === 5) t.style.background = "var(--tierra-profunda)";
            else t.style.background = "var(--tierra)";
        }
        
        if (r === 1 && (c < 2 || c > 6)) t.style.borderBottom = "6px solid #8b5a2b"; // Techo/Piso interior
        if (r === 2 && (c < 2 || c > 6)) t.style.borderBottom = "12px solid #4e342e"; // Cimientos
        if (r === 2 && c >= 2 && c <= 6) t.style.borderBottom = "10px solid #2e7d32"; // Borde del pasto grueso

        if (!cell) {
        } else if (cell.kind === "pc") {
          t.classList.add("device", "pc"); t.innerHTML = ICON_PC;
        } else if (cell.kind === "router_cross") {
          t.classList.add("device", "router"); t.innerHTML = ICON_ROUTER;
        } else if (cell.role === "slot") {
          if (!cell.filled) {
            t.classList.add("vacio");
            t.innerHTML = '<span class="slot-hint">+</span>';
            t.dataset.slot = "1";
          } else {
            t.classList.add("device", cell.kind);
            t.innerHTML = cell.kind === "antenna" ? ICON_ANTENNA : ICON_REPEATER;
          }
        } else if (cell.kind === "deco") {
          t.classList.add("deco"); t.innerHTML = '<div class="deco-art">' + (DECO[cell.item] || "") + "</div>";
        } else if (cell.kind.includes("pipe")) {
          t.classList.add("pipe", cell.role);
          t.classList.add(cell.kind === "pipe_underground" ? "underground" : "wireless");
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

    var ptsAir = PATH_AIR.map(function (p) {
      var el = board.querySelector('[data-rc="' + p[0] + '-' + p[1] + '"]');
      var rc = el.getBoundingClientRect();
      return (rc.left + rc.width / 2 - lr.left).toFixed(1) + " " + (rc.top + rc.height / 2 - lr.top).toFixed(1);
    });
    var dAir = 'path("M' + ptsAir.join(" L") + '")';
    for (var i = 0; i < 4; i++) {
        var dotA = document.createElement("div");
        dotA.className = "packet-air";
        dotA.style.offsetPath = dAir; dotA.style.webkitOffsetPath = dAir;
        dotA.style.animationDelay = (i * 0.7) + "s";
        layer.appendChild(dotA);
    }

    var ptsGround = PATH_GROUND.map(function (p) {
      var el = board.querySelector('[data-rc="' + p[0] + '-' + p[1] + '"]');
      var rc = el.getBoundingClientRect();
      return (rc.left + rc.width / 2 - lr.left).toFixed(1) + " " + (rc.top + rc.height / 2 - lr.top).toFixed(1);
    });
    var dGround = 'path("M' + ptsGround.join(" L") + '")';
    for (var j = 0; j < 4; j++) {
        var dotG = document.createElement("div");
        dotG.className = "packet-ground";
        dotG.style.offsetPath = dGround; dotG.style.webkitOffsetPath = dGround;
        dotG.style.animationDelay = (j * 0.8) + "s";
        layer.appendChild(dotG);
    }
  }

  function checkWin() {
    if (solved) return;
    var slots = LEVEL.cells.filter(function (x) { return x.role === "slot"; });
    if (!slots.every(function(x){ return x.filled; })) return;

    var pipes = LEVEL.cells.filter(function (x) { return x.kind.includes("pipe"); });
    if (!pipes.every(correct)) return;
    
    solved = true;
    board.classList.add("completo");
    var tip = document.querySelector(".tooltip");
    if (tip) tip.classList.add("ok");
    
    dataFlow();
    setTimeout(function () { if (window.NEWin) NEWin.show(LEVEL.number); }, 4500);
  }

  function initDrag() {
    var pieces = document.querySelectorAll(".pieza");
    var ghost = null;
    var ghostRef = null;
    var originalTip = document.querySelector(".tooltip p").innerHTML;

    function move(e) { if(ghost) { ghost.style.left = e.clientX + "px"; ghost.style.top = e.clientY + "px"; } }
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
        var r = parseInt(s.dataset.r);
        var c = parseInt(s.dataset.c);
        var cell = find(r, c);
        var type = ghostRef.dataset.type;

        if (cell && cell.role === "slot" && !cell.filled) {
          if (cell.accept === type) {
            cell.filled = true;
            cell.kind = type; 
            
            // LÓGICA CORREGIDA: Si ya no quedan slots vacíos para este tipo, se bloquea en la bandeja
            var remaining = LEVEL.cells.some(function(x) { return x.role === "slot" && x.accept === type && !x.filled; });
            if (!remaining) {
                ghostRef.classList.add("usada");
            }
            
            clickSfx(); render(); checkWin();
          } else {
            var tip = document.querySelector(".tooltip p");
            tip.innerHTML = "❌ <strong>Oops!</strong> That hardware doesn't work there. Repeaters go underground, Antennas go on roofs.";
            setTimeout(function(){ tip.innerHTML = originalTip; }, 4000);
          }
        }
      }
    }
    
    pieces.forEach(function(piece) {
      piece.addEventListener("pointerdown", function (e) {
        if (solved || piece.classList.contains("usada")) return;
        e.preventDefault();
        ghost = document.createElement("div");
        ghost.className = "ghost";
        ghost.innerHTML = piece.innerHTML; 
        document.body.appendChild(ghost);
        ghostRef = piece;
        move(e);
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
      });
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