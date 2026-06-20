/* ============================================================
 * level7.js — Level 7 (The School Network).
 * 7x5 Grid. Multi-drag tray. Switch and Server mechanics.
 * Soluciones (sol) corregidas.
 * ============================================================ */
(function () {
  "use strict";

  var LEVEL = {
    number: 7, title: "The School Network", cols: 7, rows: 5,
    cells: [
      // ROW 0: Upper Classrooms
      { r: 0, c: 0, kind: "deco", item: "window" },
      { r: 0, c: 1, kind: "pc", color: "blue", plug: "right" },
      { r: 0, c: 2, kind: "pipe", shape: "curve", role: "rotate", rot: 0, sol: 2, color: "blue" }, // CORREGIDO: 2 (Sur, Oeste)
      { r: 0, c: 3, kind: "deco", item: "clock" },
      { r: 0, c: 4, kind: "pipe", shape: "curve", role: "rotate", rot: 0, sol: 1, color: "blue" }, // CORREGIDO: 1 (Sur, Este)
      { r: 0, c: 5, kind: "pc", color: "blue", plug: "left" },
      { r: 0, c: 6, kind: "deco", item: "window" },

      // ROW 1: Ceiling routing
      { r: 1, c: 0, kind: "deco", item: "bookshelf" },
      { r: 1, c: 1, kind: "deco", item: "globe" },
      { r: 1, c: 2, kind: "pipe", shape: "curve", role: "rotate", rot: 1, sol: 0, color: "blue" }, // 0 (Norte, Este)
      { r: 1, c: 3, kind: "pipe", shape: "t", role: "rotate", rot: 0, sol: 1, color: "blue" }, // 1 (Oeste, Este, Sur)
      { r: 1, c: 4, kind: "pipe", shape: "curve", role: "rotate", rot: 1, sol: 3, color: "blue" }, // 3 (Norte, Oeste)
      { r: 1, c: 5, kind: "deco", item: "board" },
      { r: 1, c: 6, kind: "deco", item: "plant" },

      // ROW 2: Lower Classrooms & Main Switch
      { r: 2, c: 0, kind: "deco", item: "window" },
      { r: 2, c: 1, kind: "pc", color: "green", plug: "right" },
      { r: 2, c: 2, kind: "pipe", shape: "straight", role: "rotate", rot: 1, sol: 0, color: "green" }, // CORREGIDO: 0 (Horizontal)
      { r: 2, c: 3, kind: "slot", accept: "switch", filled: false, role: "slot" }, // THE SWITCH
      { r: 2, c: 4, kind: "pipe", shape: "straight", role: "rotate", rot: 1, sol: 0, color: "green" }, // CORREGIDO: 0 (Horizontal)
      { r: 2, c: 5, kind: "pc", color: "green", plug: "left" },
      { r: 2, c: 6, kind: "deco", item: "window" },

      // ROW 3: Server Duct
      { r: 3, c: 0, kind: "deco", item: "bookshelf" },
      { r: 3, c: 1, kind: "deco", item: "plant" },
      { r: 3, c: 2, kind: "deco", item: "board" },
      { r: 3, c: 3, kind: "pipe", shape: "straight", role: "rotate", rot: 0, sol: 1, color: "purple" }, // CORREGIDO: 1 (Vertical)
      { r: 3, c: 4, kind: "deco", item: "plant" },
      { r: 3, c: 5, kind: "deco", item: "globe" },
      { r: 3, c: 6, kind: "deco", item: "bookshelf" },

      // ROW 4: Basement / Server Room
      { r: 4, c: 0, kind: "deco", item: "boxes" },
      { r: 4, c: 1, kind: "deco", item: "boxes" },
      { r: 4, c: 2, kind: "deco", item: "server_rack" },
      { r: 4, c: 3, kind: "slot", accept: "server", filled: false, role: "slot" }, // THE SERVER
      { r: 4, c: 4, kind: "deco", item: "server_rack" },
      { r: 4, c: 5, kind: "deco", item: "boxes" },
      { r: 4, c: 6, kind: "deco", item: "boxes" },
    ],
  };

  var PATH1 = [[0,1], [0,2], [1,2], [1,3], [2,3], [3,3], [4,3]];
  var PATH2 = [[0,5], [0,4], [1,4], [1,3], [2,3], [3,3], [4,3]];
  var PATH3 = [[2,1], [2,2], [2,3], [3,3], [4,3]];
  var PATH4 = [[2,5], [2,4], [2,3], [3,3], [4,3]];

  var solved = false, board;

  function svgStraight(color) {
    return '<svg class="cable '+color+'" viewBox="0 0 100 100"><path class="cond" d="M-10 50 H110" stroke-width="18" stroke-linecap="round"/><path class="shine" d="M-10 47 H110" stroke-width="4" stroke-linecap="round"/></svg>';
  }
  function svgCurve(color) {
    return '<svg class="cable '+color+'" viewBox="0 0 100 100"><path class="cond" d="M50 -10 V50 H110" stroke-width="18" stroke-linejoin="round" stroke-linecap="round"/><path class="shine" d="M47 -10 V47 H110" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/></svg>';
  }
  function svgT(color) {
    return '<svg class="cable '+color+'" viewBox="0 0 100 100"><path class="cond" d="M50 -10 V110 M50 50 H110" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/><path class="shine" d="M47 -10 V110 M47 47 H110" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  function svgPipe(cell) {
    if (cell.shape === "t") return svgT(cell.color);
    return cell.shape === "curve" ? svgCurve(cell.color) : svgStraight(cell.color); 
  }

  var ICON_PC     = '<svg viewBox="0 0 100 100"><rect x="20" y="25" width="60" height="40" rx="4" fill="#3a4047"/><rect x="25" y="30" width="50" height="30" rx="2" fill="#6fc7ff"/><path d="M40 65 L35 75 H65 L60 65 Z" fill="#5a6168"/><circle cx="70" cy="45" r="4" fill="#fff" opacity="0.6"/></svg>';
  var ICON_SWITCH = '<svg viewBox="0 0 100 100"><rect x="5" y="30" width="90" height="40" rx="4" fill="#2c3e50" stroke="#1a252f" stroke-width="3"/><rect x="10" y="45" width="80" height="15" fill="#34495e"/><path d="M 15 52.5 h 70" stroke="#2ecc71" stroke-dasharray="4 4" stroke-width="6"/></svg>';
  var ICON_SERVER = '<svg viewBox="0 0 100 100"><rect x="25" y="10" width="50" height="80" rx="4" fill="#2c3e50" stroke="#1a252f" stroke-width="4"/><rect x="35" y="20" width="30" height="8" fill="#34495e"/><rect x="35" y="35" width="30" height="8" fill="#34495e"/><rect x="35" y="50" width="30" height="8" fill="#34495e"/><circle cx="40" cy="75" r="4" fill="#2ecc71"/><circle cx="50" cy="75" r="4" fill="#e74c3c"/><circle cx="60" cy="75" r="4" fill="#3498db"/></svg>';

  var DECO = {
    window:'<svg viewBox="0 0 100 100"><rect x="20" y="16" width="60" height="58" rx="2" fill="#bfe4f7"/><rect x="16" y="12" width="68" height="64" rx="4" fill="none" stroke="#8b5a2b" stroke-width="6"/><path d="M50 14 V74 M18 44 H82" stroke="#8b5a2b" stroke-width="5"/></svg>',
    bookshelf:'<svg viewBox="0 0 100 100"><rect x="24" y="34" width="10" height="34" rx="1" fill="#c0392b"/><rect x="36" y="30" width="10" height="38" rx="1" fill="#2980b9"/><rect x="48" y="36" width="10" height="32" rx="1" fill="#27ae60"/><rect x="60" y="40" width="9" height="28" rx="1" fill="#8e44ad" transform="rotate(8 64 54)"/><rect x="15" y="68" width="70" height="8" fill="#8b5a2b"/></svg>',
    plant:'<svg viewBox="0 0 100 100"><path d="M50 56 C40 30 22 34 32 54 C16 48 18 66 40 60" fill="#27ae60"/><path d="M50 56 C60 28 80 34 68 54 C86 48 84 68 60 60" fill="#2ecc71"/><path d="M34 56 H66 L62 79 H38 Z" fill="#d35400"/></svg>',
    globe:'<svg viewBox="0 0 100 100"><circle cx="50" cy="45" r="25" fill="#3498db"/><path d="M30 40 Q40 25 50 35 T70 40 Q60 60 45 55 T30 40" fill="#2ecc71"/><path d="M50 70 V85 M35 85 H65" stroke="#34495e" stroke-width="6" stroke-linecap="round"/></svg>',
    board:'<svg viewBox="0 0 100 100"><rect x="15" y="25" width="70" height="45" fill="#27ae60" stroke="#e67e22" stroke-width="4"/><line x1="25" y1="35" x2="65" y2="35" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.6"/><line x1="25" y1="45" x2="55" y2="45" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.6"/></svg>',
    clock:'<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="22" fill="#fff" stroke="#34495e" stroke-width="6"/><line x1="50" y1="50" x2="50" y2="35" stroke="#34495e" stroke-width="4" stroke-linecap="round"/><line x1="50" y1="50" x2="60" y2="50" stroke="#e74c3c" stroke-width="3" stroke-linecap="round"/></svg>',
    boxes:'<svg viewBox="0 0 100 100"><rect x="25" y="55" width="30" height="25" fill="#d35400" stroke="#a04000" stroke-width="2"/><rect x="45" y="45" width="35" height="35" fill="#e67e22" stroke="#d35400" stroke-width="2"/></svg>',
    server_rack:'<svg viewBox="0 0 100 100"><rect x="30" y="20" width="40" height="60" fill="#7f8c8d"/><line x1="35" y1="30" x2="65" y2="30" stroke="#34495e" stroke-width="4"/><line x1="35" y1="45" x2="65" y2="45" stroke="#34495e" stroke-width="4"/><line x1="35" y1="60" x2="65" y2="60" stroke="#34495e" stroke-width="4"/></svg>'
  };

  function correct(cell) {
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
        
        if (r < 2 && c < 3) t.style.background = "#fff9c4"; 
        else if (r < 2 && c > 3) t.style.background = "#f8bbd0"; 
        else if (r === 2 && c < 3) t.style.background = "#cce3de"; 
        else if (r === 2 && c > 3) t.style.background = "#ffe5b4"; 
        else if (r === 4) t.style.background = "#adb5bd"; 
        else t.style.background = "#e9ecef"; 
        
        if (c === 2) t.style.borderRight = "6px solid #8b5a2b";
        if (c === 3) t.style.borderRight = "6px solid #8b5a2b";
        if (r === 1 && c !== 3) t.style.borderBottom = "6px solid #8b5a2b";
        if (r === 2 && c !== 3) t.style.borderBottom = "6px solid #8b5a2b";
        if (r === 3) t.style.borderBottom = "8px solid #8b5a2b";

        if (!cell) {
        } else if (cell.kind === "pc") {
          t.classList.add("device", "pc");
          t.innerHTML = ICON_PC + '<span class="plug '+cell.plug+' '+cell.color+'"></span>';
        } else if (cell.role === "slot") {
          if (!cell.filled) {
            t.classList.add("vacio");
            t.innerHTML = '<span class="slot-hint">+</span>';
            t.dataset.slot = "1";
          } else {
            t.classList.add("device", cell.kind);
            t.innerHTML = cell.kind === "switch" ? ICON_SWITCH : ICON_SERVER;
          }
        } else if (cell.kind === "deco") {
          t.classList.add("deco");
          t.innerHTML = '<div class="deco-art">' + (DECO[cell.item] || "") + "</div>";
        } else if (cell.kind === "pipe") {
          t.classList.add("pipe", cell.role);
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

    [PATH1, PATH2, PATH3, PATH4].forEach(function(pathArray, pIndex) {
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
          dot.style.animationDelay = (i * 0.85 + (pIndex * 0.2)) + "s";
          layer.appendChild(dot);
        }
    });
  }

  function checkWin() {
    if (solved) return;
    var slots = LEVEL.cells.filter(function (x) { return x.role === "slot"; });
    if (!slots.every(function(x){ return x.filled; })) return;

    var pipes = LEVEL.cells.filter(function (x) { return x.kind === "pipe"; });
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
            ghostRef.classList.add("usada");
            clickSfx(); render(); checkWin();
          } else {
            var tip = document.querySelector(".tooltip p");
            tip.innerHTML = "❌ <strong>Oops!</strong> That device doesn't belong there or isn't powerful enough.";
            setTimeout(function(){ tip.innerHTML = originalTip; }, 3500);
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