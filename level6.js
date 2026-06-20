/* ============================================================
 * level6.js — Level 6 (Hello Internet!).
 * Diorama Arquitectónico Limpio. Sin cuadros blancos.
 * ============================================================ */
(function () {
  "use strict";

  var LEVEL = {
    number: 6, title: "Hello Internet!", cols: 5, rows: 4,
    cells: [
      // Fila 0
      { r: 0, c: 0, kind: "deco", item: "clock" },
      { r: 0, c: 1, kind: "deco", item: "picture" },
      { r: 0, c: 2, kind: "deco", item: "none" }, 
      { r: 0, c: 3, kind: "deco", item: "none" }, 
      { r: 0, c: 4, kind: "deco", item: "none" }, 
      
      // Fila 1
      { r: 1, c: 0, kind: "deco", item: "window" },
      { r: 1, c: 1, kind: "deco", item: "none" },
      { r: 1, c: 2, kind: "deco", item: "none" }, 
      { r: 1, c: 3, kind: "globe" }, // El Internet (Sobre el poste)
      { r: 1, c: 4, kind: "deco", item: "none" }, 

      // Fila 2
      { r: 2, c: 0, kind: "router" }, // En el escritorio
      { r: 2, c: 1, kind: "pipe_standard", shape: "straight", role: "fixed", rot: 0, sol: 0 }, 
      { r: 2, c: 2, kind: "modem", role: "slot", filled: false }, // MÓDEM EMPOTRADO
      { r: 2, c: 3, kind: "pipe_fiber", shape: "straight", role: "rotate", rot: 0, sol: 1 }, // Fibra Vertical
      { r: 2, c: 4, kind: "deco", item: "tree" }, 

      // Fila 3
      { r: 3, c: 0, kind: "deco", item: "pc" },
      { r: 3, c: 1, kind: "deco", item: "cat" },
      { r: 3, c: 2, kind: "pipe_fiber", shape: "curve", role: "rotate", rot: 1, sol: 0 }, // Fibra N a E
      { r: 3, c: 3, kind: "pipe_fiber", shape: "curve", role: "rotate", rot: 2, sol: 3 }, // Fibra W a N
      { r: 3, c: 4, kind: "deco", item: "bones" }, 
    ],
  };

  var solved = false, board;

  // --- SVGs DE CABLES MATEMÁTICAMENTE EXACTOS (0 a 100) ---
  function svgStraight() {
    return '<svg class="cable" viewBox="0 0 100 100" style="overflow:visible;">'
      + '<path class="cond" d="M 0 50 L 100 50"/>'
      + '<path class="shine" d="M 0 50 L 100 50"/></svg>';
  }
  function svgCurve() {
    return '<svg class="cable" viewBox="0 0 100 100" style="overflow:visible;">'
      + '<path class="cond" d="M 50 0 L 50 25 Q 50 50 75 50 L 100 50"/>'
      + '<path class="shine" d="M 50 0 L 50 25 Q 50 50 75 50 L 100 50"/></svg>';
  }
  function svgPipe(cell) { return cell.shape === "curve" ? svgCurve() : svgStraight(); }

  // --- ICONOS DE DISPOSITIVOS ---
  var ICON_ROUTER = '<svg viewBox="0 0 100 100" style="overflow:visible;">'
    + '<path d="M 85 50 L 100 50" stroke="#7f8c8d" stroke-width="20" stroke-linecap="round"/>'
    + '<path d="M 85 50 L 100 50" stroke="rgba(255,255,255,0.2)" stroke-width="6" stroke-linecap="round"/>'
    + '<rect x="15" y="30" width="70" height="40" rx="10" fill="#fff" stroke="#bdc3c7" stroke-width="4"/>'
    + '<path d="M25 30 L20 10 M50 30 L50 5 M75 30 L80 10" stroke="#3a4047" stroke-width="5" stroke-linecap="round"/>'
    + '<circle cx="35" cy="50" r="4" fill="#4fd17a"/><circle cx="50" cy="50" r="4" fill="#4fd17a"/><circle cx="65" cy="50" r="4" fill="#ffce3f"/></svg>';
  
  var ICON_MODEM  = '<svg viewBox="0 0 100 100" style="overflow:visible;">'
    + '<path d="M 0 50 L 20 50" stroke="#7f8c8d" stroke-width="20" stroke-linecap="round"/>'
    + '<path d="M 0 50 L 20 50" stroke="rgba(255,255,255,0.2)" stroke-width="6" stroke-linecap="round"/>'
    + '<path d="M 50 80 L 50 100" stroke="#1a252f" stroke-width="24" stroke-linecap="round"/>'
    + '<path d="M 50 80 L 50 100" stroke="rgba(0,245,212,0.15)" stroke-width="6" stroke-linecap="round"/>'
    + '<rect x="25" y="10" width="50" height="80" rx="12" fill="#2c3e50" stroke="#1a252f" stroke-width="6"/>'
    + '<rect x="40" y="25" width="20" height="50" rx="6" fill="#34495e"/>'
    + '<circle cx="50" cy="40" r="5" fill="#f1c40f"/>'
    + '<circle cx="50" cy="60" r="5" fill="#e74c3c" id="modem-led"/></svg>';
  
  var ICON_GLOBE  = '<svg viewBox="0 0 100 100" style="overflow:visible;">'
    + '<path d="M 50 80 L 50 100" stroke="#1a252f" stroke-width="24" stroke-linecap="round"/>'
    + '<circle cx="50" cy="50" r="38" fill="#3498db"/>'
    + '<path d="M25 40 Q35 20 50 30 T75 40 Q60 60 40 70 T25 40" fill="#2ecc71"/>'
    + '<circle cx="50" cy="50" r="46" fill="none" stroke="#f1c40f" stroke-width="4" stroke-dasharray="10 12"/>'
    + '<circle cx="20" cy="25" r="4" fill="#fff" opacity="0.8"/><circle cx="80" cy="75" r="3" fill="#fff" opacity="0.8"/></svg>';

  // --- DECORACIONES ---
  var DECO = {
    window: '<svg viewBox="0 0 100 100"><rect x="15" y="15" width="70" height="70" rx="4" fill="#81d4fa"/><path d="M15 50 H85 M50 15 V85" stroke="#fff" stroke-width="6"/><rect x="12" y="12" width="76" height="76" rx="6" fill="none" stroke="#8d6e63" stroke-width="8"/></svg>',
    clock: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="30" fill="#fff" stroke="#bdc3c7" stroke-width="6"/><circle cx="50" cy="50" r="4" fill="#2c3e50"/><line x1="50" y1="50" x2="50" y2="30" stroke="#e74c3c" stroke-width="3" stroke-linecap="round"/><line x1="50" y1="50" x2="65" y2="50" stroke="#2c3e50" stroke-width="4" stroke-linecap="round"/></svg>',
    picture: '<svg viewBox="0 0 100 100"><rect x="20" y="25" width="60" height="50" fill="#e0f7fa" stroke="#f1c40f" stroke-width="6" rx="4"/><circle cx="65" cy="40" r="6" fill="#ffca28"/><path d="M20 75 L40 50 L55 65 L65 55 L80 75 Z" fill="#81c784"/></svg>',
    pc: '<svg viewBox="0 0 100 100"><rect x="15" y="25" width="70" height="45" rx="6" fill="#3a4047"/><rect x="20" y="30" width="60" height="35" rx="2" fill="#bdc3c7" id="pc-screen"/><path d="M35 70 L30 85 H70 L65 70 Z" fill="#5a6168"/></svg>',
    cat: '<svg viewBox="0 0 100 100"><ellipse cx="50" cy="65" rx="20" ry="16" fill="#e67e22"/><circle cx="50" cy="45" r="16" fill="#e67e22"/><path d="M38 35 L40 22 L48 32 Z M62 35 L60 22 L52 32 Z" fill="#e67e22"/><ellipse cx="44" cy="45" rx="2" ry="3" fill="#2c3e50"/><ellipse cx="56" cy="45" rx="2" ry="3" fill="#2c3e50"/><path d="M48 50 Q50 53 52 50" fill="none" stroke="#2c3e50" stroke-width="2"/><path d="M70 70 Q85 70 80 50" fill="none" stroke="#e67e22" stroke-width="6" stroke-linecap="round"/></svg>',
    bones: '<svg viewBox="0 0 100 100"><path d="M20 50 Q40 40 50 60 T80 50" fill="none" stroke="#d7ccc8" stroke-width="6" stroke-linecap="round" opacity="0.4"/><circle cx="15" cy="50" r="5" fill="#d7ccc8" opacity="0.4"/><circle cx="85" cy="50" r="5" fill="#d7ccc8" opacity="0.4"/></svg>',
    tree: '<svg viewBox="0 0 100 100"><rect x="40" y="50" width="20" height="40" fill="#795548"/><circle cx="50" cy="35" r="30" fill="#2ecc71"/><circle cx="30" cy="45" r="20" fill="#27ae60"/><circle cx="70" cy="45" r="20" fill="#27ae60"/></svg>'
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

  // --- CONFETI MAGICO ---
  function createConfetti() {
      var container = document.getElementById("confetti-container");
      if(!container) return;
      var colors = ['#00f5d4', '#f1c40f', '#e74c3c', '#3498db', '#9b59b6'];
      for(var i=0; i<120; i++) {
          var conf = document.createElement("div");
          conf.className = "confetti";
          conf.style.left = Math.random() * 100 + "vw";
          conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
          conf.style.animationDuration = (Math.random() * 3 + 2) + "s";
          conf.style.animationDelay = (Math.random() * 1.5) + "s";
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
        t.dataset.rc = r + "-" + c;
        
        if (!cell || cell.item === "none") {
        } else if (cell.kind === "router") {
          t.classList.add("device", "router");
          t.innerHTML = '<div class="device-box">' + ICON_ROUTER + '</div>';
        } else if (cell.kind === "globe") {
          t.classList.add("globe");
          t.innerHTML = ICON_GLOBE;
        } else if (cell.kind === "modem") {
          if (!cell.filled) {
            t.classList.add("vacio");
            t.innerHTML = '<div class="slot-hint-icon">' + ICON_MODEM + '</div>';
            t.dataset.slot = "1";
          } else {
            t.classList.add("device", "modem");
            t.innerHTML = '<div class="device-box">' + ICON_MODEM + '</div>';
          }
        } else if (cell.kind === "deco") {
          t.classList.add("deco");
          t.innerHTML = '<div class="deco-art">' + (DECO[cell.item] || "") + "</div>";
        } else if (cell.kind.includes("pipe")) {
          t.classList.add("pipe", cell.role);
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

  function checkWin() {
    if (solved) return;
    
    var modems = LEVEL.cells.filter(function (x) { return x.kind === "modem"; });
    if (!modems.every(function(x){ return x.filled; })) return;

    var pipes = LEVEL.cells.filter(function (x) { return x.kind.includes("pipe"); });
    if (!pipes.every(correct)) return;
    
    solved = true;
    board.classList.add("completo");
    
    // Cambiar LEDs y pantalla al ganar
    setTimeout(function() {
        var led = document.getElementById("modem-led");
        if(led) led.setAttribute("fill", "#00f5d4"); 
        var screen = document.getElementById("pc-screen");
        if(screen) screen.setAttribute("fill", "#6fc7ff"); 
    }, 600);

    var tip = document.querySelector(".tooltip");
    if (tip) {
        tip.classList.add("ok");
        var pTags = tip.querySelectorAll("p");
        if(pTags.length > 0) pTags[0].innerHTML = "<strong>Awesome!</strong>";
        if(pTags.length > 1) {
            pTags[1].style.color = "#0097a7";
            pTags[1].innerHTML = "The house is now successfully translating signals to the vast Fiber Optic network of the global Internet.";
        }
    }
    
    createConfetti();
    
    setTimeout(function () { if (window.NEWin) NEWin.show(LEVEL.number); }, 5500);
  }

  function initDrag() {
    var piece = document.getElementById("pieza-arrastrable");
    if (!piece) return;
    
    piece.innerHTML = ICON_MODEM;
    
    var ghost = null;
    function move(e) { if(ghost) { ghost.style.left = e.clientX + "px"; ghost.style.top = e.clientY + "px"; } }
    function slotUnder(e) {
      if(ghost) ghost.style.pointerEvents = 'none';
      var el = document.elementFromPoint(e.clientX, e.clientY);
      if(ghost) ghost.style.pointerEvents = 'auto';
      return el ? el.closest('[data-slot="1"]') : null;
    }
    function onMove(e) {
      move(e);
      document.querySelectorAll(".tile.resaltar").forEach(z => z.classList.remove("resaltar"));
      var s = slotUnder(e); 
      if (s && !s.classList.contains("filled")) s.classList.add("resaltar");
    }
    function onUp(e) {
      var s = slotUnder(e);
      if (ghost) { ghost.remove(); ghost = null; }
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      document.querySelectorAll(".tile.resaltar").forEach(el => el.classList.remove("resaltar"));
      
      if (s && !solved && !s.classList.contains("filled")) {
        var slot = LEVEL.cells.filter(function (x) { return x.role === "slot"; })[0];
        if (slot && !slot.filled) {
          slot.filled = true;
          piece.classList.add("usada");
          clickSfx(); render(); checkWin();
        } else {
          s.style.borderColor = "#e74c3c";
          setTimeout(() => { if(!s.classList.contains("filled")) s.style.borderColor = "rgba(255,255,255,0.5)"; }, 500);
        }
      }
    }
    piece.addEventListener("pointerdown", function (e) {
      if (solved || piece.classList.contains("usada")) return;
      e.preventDefault();
      ghost = document.createElement("div");
      ghost.className = "ghost";
      ghost.innerHTML = ICON_MODEM;
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