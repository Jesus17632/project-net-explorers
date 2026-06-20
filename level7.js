/* ============================================================
 * level7.js — Level 7 (The School Network).
 * Estilo Nivel 1 Restaurado (Alfombras y Madera). Lógica 100% funcional.
 * ============================================================ */
(function () {
  "use strict";

  var LEVEL = {
    number: 7, title: "The School Network", cols: 7, rows: 5,
    cells: [
      // ROW 0: Upper Classrooms
      { r: 0, c: 0, kind: "deco", item: "window" },
      { r: 0, c: 1, kind: "pc", color: "blue", plug: "right" },
      { r: 0, c: 2, kind: "pipe", shape: "curve", role: "rotate", rot: 0, sol: 2, color: "blue" }, 
      { r: 0, c: 3, kind: "deco", item: "clock" },
      { r: 0, c: 4, kind: "pipe", shape: "curve", role: "rotate", rot: 0, sol: 1, color: "blue" }, 
      { r: 0, c: 5, kind: "pc", color: "blue", plug: "left" },
      { r: 0, c: 6, kind: "deco", item: "window" },

      // ROW 1: Ceiling routing
      { r: 1, c: 0, kind: "deco", item: "bookshelf" },
      { r: 1, c: 1, kind: "deco", item: "globe" },
      { r: 1, c: 2, kind: "pipe", shape: "curve", role: "rotate", rot: 1, sol: 0, color: "blue" }, 
      { r: 1, c: 3, kind: "pipe", shape: "t", role: "rotate", rot: 0, sol: 0, color: "blue" }, // (W, E, S) = sol: 0
      { r: 1, c: 4, kind: "pipe", shape: "curve", role: "rotate", rot: 1, sol: 3, color: "blue" }, 
      { r: 1, c: 5, kind: "deco", item: "board" },
      { r: 1, c: 6, kind: "deco", item: "plant" },

      // ROW 2: Lower Classrooms & Main Switch
      { r: 2, c: 0, kind: "deco", item: "window" },
      { r: 2, c: 1, kind: "pc", color: "green", plug: "right" },
      { r: 2, c: 2, kind: "pipe", shape: "straight", role: "rotate", rot: 1, sol: 0, color: "green" }, 
      { r: 2, c: 3, kind: "slot", accept: "switch", filled: false, role: "slot" }, // HUECO PARA SWITCH
      { r: 2, c: 4, kind: "pipe", shape: "straight", role: "rotate", rot: 1, sol: 0, color: "green" }, 
      { r: 2, c: 5, kind: "pc", color: "green", plug: "left" },
      { r: 2, c: 6, kind: "deco", item: "window" },

      // ROW 3: Server Duct
      { r: 3, c: 0, kind: "deco", item: "bookshelf" },
      { r: 3, c: 1, kind: "deco", item: "plant" },
      { r: 3, c: 2, kind: "deco", item: "board" },
      { r: 3, c: 3, kind: "pipe", shape: "straight", role: "rotate", rot: 0, sol: 1, color: "purple" }, // Vertical
      { r: 3, c: 4, kind: "deco", item: "plant" },
      { r: 3, c: 5, kind: "deco", item: "globe" },
      { r: 3, c: 6, kind: "deco", item: "bookshelf" },

      // ROW 4: Basement / Server Room
      { r: 4, c: 0, kind: "deco", item: "boxes" },
      { r: 4, c: 1, kind: "deco", item: "boxes" },
      { r: 4, c: 2, kind: "deco", item: "boxes" },
      { r: 4, c: 3, kind: "slot", accept: "server", filled: false, role: "slot" }, // HUECO PARA SERVER
      { r: 4, c: 4, kind: "deco", item: "boxes" },
      { r: 4, c: 5, kind: "deco", item: "boxes" },
      { r: 4, c: 6, kind: "deco", item: "boxes" },
    ],
  };

  // Rutas de Animación de datos
  var PATH1 = [[0,1], [0,2], [1,2], [1,3], [2,3], [3,3], [4,3]];
  var PATH2 = [[0,5], [0,4], [1,4], [1,3], [2,3], [3,3], [4,3]];
  var PATH3 = [[2,1], [2,2], [2,3], [3,3], [4,3]];
  var PATH4 = [[2,5], [2,4], [2,3], [3,3], [4,3]];

  var solved = false, board;

  // --- SVGs DE CABLES MATEMÁTICAMENTE EXACTOS (SIN RELLENOS NEGROS) ---
  function svgStraight(color) {
    return '<svg class="cable '+color+'" viewBox="0 0 100 100" style="overflow:visible;">'
      + '<path class="cond" d="M 0 50 L 100 50"/>'
      + '<path class="shine" d="M 0 50 L 100 50"/></svg>';
  }
  function svgCurve(color) {
    return '<svg class="cable '+color+'" viewBox="0 0 100 100" style="overflow:visible;">'
      + '<path class="cond" d="M 50 0 L 50 25 Q 50 50 75 50 L 100 50"/>'
      + '<path class="shine" d="M 50 0 L 50 25 Q 50 50 75 50 L 100 50"/></svg>';
  }
  function svgT(color) {
    return '<svg class="cable '+color+'" viewBox="0 0 100 100" style="overflow:visible;">'
      + '<path class="cond" d="M 0 50 L 100 50 M 50 50 L 50 100"/>'
      + '<path class="shine" d="M 0 50 L 100 50 M 50 50 L 50 100"/></svg>';
  }
  function svgPipe(cell) {
    if (cell.shape === "t") return svgT(cell.color);
    return cell.shape === "curve" ? svgCurve(cell.color) : svgStraight(cell.color); 
  }

  // --- ICONOS LIMPIOS Y ORGÁNICOS (Sin cuadrados blancos detrás) ---
  var ICON_PC     = '<svg viewBox="0 0 100 100"><rect x="15" y="25" width="70" height="45" rx="6" fill="#3a4047"/><rect x="20" y="30" width="60" height="35" rx="3" fill="#6fc7ff"/><path d="M40 70 L35 85 H65 L60 70 Z" fill="#5a6168"/><circle cx="70" cy="48" r="4" fill="#fff" opacity="0.6"/></svg>';
  var ICON_SWITCH = '<svg viewBox="0 0 100 100"><rect x="5" y="30" width="90" height="40" rx="6" fill="#2c3e50" stroke="#1a252f" stroke-width="5"/><rect x="10" y="45" width="80" height="15" fill="#34495e"/><path d="M 15 52.5 h 70" stroke="#2ecc71" stroke-dasharray="6 6" stroke-width="8"/></svg>';
  var ICON_SERVER = '<svg viewBox="0 0 100 100"><rect x="25" y="10" width="50" height="80" rx="6" fill="#2c3e50" stroke="#1a252f" stroke-width="5"/><rect x="35" y="25" width="30" height="8" fill="#34495e"/><rect x="35" y="40" width="30" height="8" fill="#34495e"/><rect x="35" y="55" width="30" height="8" fill="#34495e"/><circle cx="40" cy="75" r="4" fill="#2ecc71"/><circle cx="50" cy="75" r="4" fill="#e74c3c"/><circle cx="60" cy="75" r="4" fill="#3498db"/></svg>';
  var ICON_ROUTER = '<svg viewBox="0 0 100 100"><rect x="15" y="35" width="70" height="40" rx="10" fill="#fff" stroke="#bdc3c7" stroke-width="4"/><path d="M25 35 L20 10 M50 35 L50 5 M75 35 L80 10" stroke="#3a4047" stroke-width="5" stroke-linecap="round"/><circle cx="35" cy="55" r="4" fill="#4fd17a"/><circle cx="50" cy="55" r="4" fill="#4fd17a"/><circle cx="65" cy="55" r="4" fill="#ffce3f"/></svg>';

  // --- DECORACIONES ---
  var DECO = {
    window:'<svg viewBox="0 0 100 100"><rect x="15" y="15" width="70" height="70" rx="4" fill="#bfe4f7"/><path d="M15 50 H85 M50 15 V85" stroke="#fff" stroke-width="6"/><rect x="12" y="12" width="76" height="76" rx="6" fill="none" stroke="#eccc68" stroke-width="8"/></svg>',
    bookshelf:'<svg viewBox="0 0 100 100"><rect x="24" y="34" width="10" height="34" rx="2" fill="#ff4757"/><rect x="36" y="30" width="10" height="38" rx="2" fill="#1e90ff"/><rect x="48" y="36" width="10" height="32" rx="2" fill="#2ed573"/><rect x="60" y="40" width="9" height="28" rx="2" fill="#9b59b6" transform="rotate(8 64 54)"/><rect x="15" y="68" width="70" height="10" rx="4" fill="#cda268"/></svg>',
    plant:'<svg viewBox="0 0 100 100"><path d="M50 56 C40 30 22 34 32 54 C16 48 18 66 40 60" fill="#2ed573"/><path d="M50 56 C60 28 80 34 68 54 C86 48 84 68 60 60" fill="#7bed9f"/><path d="M34 56 H66 L62 79 H38 Z" fill="#ff7f50"/></svg>',
    globe:'<svg viewBox="0 0 100 100"><circle cx="50" cy="45" r="30" fill="#70a1ff"/><path d="M30 40 Q40 25 50 35 T70 40 Q60 60 45 55 T30 40" fill="#7bed9f"/><path d="M50 75 V90 M35 90 H65" stroke="#3a4047" stroke-width="8" stroke-linecap="round"/></svg>',
    board:'<svg viewBox="0 0 100 100"><rect x="15" y="25" width="70" height="45" fill="#2ed573" stroke="#ffa502" stroke-width="6" rx="4"/><line x1="25" y1="35" x2="65" y2="35" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.8"/><line x1="25" y1="45" x2="55" y2="45" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.8"/></svg>',
    clock:'<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="26" fill="#fff" stroke="#2f3542" stroke-width="8"/><line x1="50" y1="50" x2="50" y2="35" stroke="#2f3542" stroke-width="5" stroke-linecap="round"/><line x1="50" y1="50" x2="60" y2="50" stroke="#ff4757" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="50" r="4" fill="#2f3542"/></svg>',
    boxes:'<svg viewBox="0 0 100 100"><rect x="25" y="55" width="30" height="25" fill="#ff7f50" stroke="#e15f41" stroke-width="4" rx="2"/><rect x="45" y="45" width="35" height="35" fill="#ffa502" stroke="#e15f41" stroke-width="4" rx="2"/></svg>'
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

  // --- CONFETI MÁGICO ---
  function createConfetti() {
      var container = document.getElementById("confetti-container");
      if(!container) return;
      var colors = ['#3498db', '#2ecc71', '#9b59b6', '#f1c40f', '#e74c3c'];
      for(var i=0; i<100; i++) {
          var conf = document.createElement("div");
          conf.className = "confetti";
          conf.style.left = Math.random() * 100 + "vw";
          conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
          conf.style.animationDuration = (Math.random() * 3 + 2) + "s";
          conf.style.animationDelay = (Math.random() * 1) + "s";
          container.appendChild(conf);
      }
  }

  function render() {
    document.querySelectorAll(".tile").forEach(t => t.remove()); 
    
    for (var r = 0; r < LEVEL.rows; r++) {
      for (var c = 0; c < LEVEL.cols; c++) {
        var cell = find(r, c);
        var t = document.createElement("div");
        t.className = "tile"; 
        t.dataset.r = r; t.dataset.c = c;
        t.dataset.rc = r + "-" + c;

        if (!cell) {
          // Vacío deja ver la madera y alfombra debajo
        } else if (cell.kind === "pc") {
          t.classList.add("device", "pc");
          t.innerHTML = '<div class="device-box">' + ICON_PC + '</div><span class="plug '+cell.plug+' '+cell.color+'"></span>';
        } else if (cell.role === "slot") {
          if (!cell.filled) {
            t.classList.add("vacio");
            var iconHint = cell.accept === "switch" ? ICON_SWITCH : ICON_SERVER;
            t.innerHTML = '<div class="slot-hint-icon">' + iconHint + '</div>';
            t.dataset.slot = "1";
          } else {
            t.classList.add("device", cell.kind);
            t.innerHTML = '<div class="device-box">' + (cell.kind === "switch" ? ICON_SWITCH : ICON_SERVER) + '</div>';
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
          if(pIndex === 2 || pIndex === 3) dot.classList.add("p-green");
          
          dot.style.offsetPath = d;
          dot.style.webkitOffsetPath = d;
          dot.style.animationDelay = (i * 0.7) + "s";
          layer.appendChild(dot);
        }
    });
    
    // Flujo morado al servidor final
    var ptsServer = [[2,3], [3,3], [4,3]].map(function (p) {
          var el = board.querySelector('[data-rc="' + p[0] + '-' + p[1] + '"]');
          var rc = el.getBoundingClientRect();
          return (rc.left + rc.width / 2 - lr.left).toFixed(1) + " " + (rc.top + rc.height / 2 - lr.top).toFixed(1);
    });
    var dServer = 'path("M' + ptsServer.join(" L") + '")';
    for (var i = 0; i < 3; i++) {
        var dot = document.createElement("div");
        dot.className = "packet p-purple";
        dot.style.offsetPath = dServer;
        dot.style.webkitOffsetPath = dServer;
        dot.style.animationDelay = (i * 0.7) + "s";
        layer.appendChild(dot);
    }
  }

  function checkWin() {
    if (solved) return;
    var slots = LEVEL.cells.filter(function (x) { return x.role === "slot"; });
    if (!slots.every(function(x){ return x.filled; })) return;

    var pipes = LEVEL.cells.filter(function (x) { return x.kind === "pipe"; });
    if (!pipes.every(correct)) return;
    
    solved = true;
    board.classList.add("completo");
    
    createConfetti();
    dataFlow();
    
    var tip = document.querySelector(".tooltip");
    if (tip) {
        tip.classList.add("ok");
        var pTags = tip.querySelectorAll("p");
        if(pTags.length > 0) pTags[0].innerHTML = "<strong>Awesome!</strong>";
        if(pTags.length > 1) {
            pTags[1].style.color = "#0097a7";
            pTags[1].innerHTML = "The Switch connects all classrooms, and everything routes perfectly to the main Server!";
        }
    }
    
    setTimeout(function () { if (window.NEWin) NEWin.show(LEVEL.number); }, 5500);
  }

  function initDrag() {
    var pieces = document.querySelectorAll(".pieza");
    var ghost = null;
    var ghostRef = null;
    var originalTip = document.querySelector(".tooltip p:nth-child(2)").innerHTML;

    function move(e) { if(ghost) { ghost.style.left = e.clientX + "px"; ghost.style.top = e.clientY + "px"; } }
    
    // Función precisa para encontrar la celda de destino
    function slotUnder(e) {
      if(ghost) ghost.style.pointerEvents = 'none';
      var el = document.elementFromPoint(e.clientX, e.clientY);
      if(ghost) ghost.style.pointerEvents = 'auto';
      return el ? el.closest('.tile[data-slot="1"]') : null;
    }
    
    function onMove(e) {
      move(e);
      document.querySelectorAll(".tile.resaltar").forEach(z => z.classList.remove("resaltar"));
      var s = slotUnder(e); 
      if (s && !s.classList.contains("filled")) {
          s.classList.add("resaltar");
      }
    }
    
    function onUp(e) {
      var s = slotUnder(e);
      if (ghost) { ghost.remove(); ghost = null; }
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      
      document.querySelectorAll(".tile.resaltar").forEach(el => el.classList.remove("resaltar"));
      
      if (s && !solved) {
        // Encontramos EXACTAMENTE qué celda es en el Array principal
        var rc = s.dataset.rc.split("-");
        var r = parseInt(rc[0]);
        var c = parseInt(rc[1]);
        var cell = find(r, c);
        var type = ghostRef.dataset.type;

        if (cell && cell.role === "slot" && !cell.filled) {
          if (cell.accept === type) {
            cell.filled = true;
            cell.kind = type; 
            ghostRef.classList.add("usada");
            clickSfx(); render(); checkWin();
          } else {
            // Animación de rebote/error si el niño pone el aparato equivocado
            s.style.borderColor = "#e74c3c";
            s.style.boxShadow = "inset 0 0 0 4px rgba(231,76,60,.8)";
            setTimeout(() => { if(!s.classList.contains("filled")) { s.style.borderColor = ""; s.style.boxShadow = ""; } }, 500);
            
            var tipP = document.querySelector(".tooltip p:nth-child(2)");
            if(type === "router") {
                tipP.innerHTML = "<span style='color:#e74c3c'>❌ Oops! A home router isn't powerful enough for a school. Try the Switch or Server!</span>";
            } else {
                tipP.innerHTML = "<span style='color:#e74c3c'>❌ Oops! That device doesn't belong there. Look at the gray silhouettes!</span>";
            }
            setTimeout(function(){ tipP.innerHTML = originalTip; }, 3500);
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
        
        // Renderizamos en el ghost solo la imagen limpia del aparato correspondiente
        var type = piece.dataset.type;
        if(type === "router") ghost.innerHTML = ICON_ROUTER;
        else if(type === "switch") ghost.innerHTML = ICON_SWITCH;
        else if(type === "server") ghost.innerHTML = ICON_SERVER;

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