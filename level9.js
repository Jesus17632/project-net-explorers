/* ============================================================
 * level9.js — Level 9 (Building Network).
 * Diorama Orgánico: Jardín y Deck de Madera. Nodos circulares.
 * ============================================================ */
(function () {
  "use strict";

  var LEVEL = {
    number: 9, title: "Building Network", cols: 9, rows: 6,
    cells: [
      // Base (Router en el deck de madera a la izquierda)
      { r: 2, c: 0, kind: "router", active: true }, 

      // 3 Sensores Objetivos (Apagados al inicio)
      { r: 5, c: 1, kind: "sensor", item: "thermometer", active: false }, 
      { r: 1, c: 4, kind: "sensor", item: "sprinkler", active: false },   
      { r: 4, c: 8, kind: "sensor", item: "light", active: false },       

      // Los 6 Slots posibles para acomodar los 4 Nodos
      { r: 4, c: 2, kind: "slot", role: "slot", filled: false }, 
      { r: 0, c: 3, kind: "slot", role: "slot", filled: false }, 
      { r: 2, c: 5, kind: "slot", role: "slot", filled: false }, 
      { r: 5, c: 5, kind: "slot", role: "slot", filled: false }, 
      { r: 0, c: 7, kind: "slot", role: "slot", filled: false }, 
      { r: 2, c: 8, kind: "slot", role: "slot", filled: false }, 

      // Decoraciones del jardín
      { r: 0, c: 1, kind: "deco", item: "bush" },
      { r: 0, c: 5, kind: "deco", item: "pond" },
      { r: 1, c: 2, kind: "deco", item: "flowers" },
      { r: 3, c: 8, kind: "deco", item: "bush" },
      { r: 4, c: 4, kind: "deco", item: "pond" },
      { r: 5, c: 7, kind: "deco", item: "flowers" },
    ]
  };

  var solved = false, board;
  var COVERAGE_RADIUS = 3.25; 

  // --- ICONOS DE DISPOSITIVOS ORGÁNICOS (Sin cajas blancas) ---
  var ICON_ROUTER = '<svg viewBox="0 0 100 100"><rect x="15" y="30" width="70" height="40" rx="10" fill="#fff" stroke="#bdc3c7" stroke-width="4"/><path d="M25 30 L20 10 M50 30 L50 5 M75 30 L80 10" stroke="#3a4047" stroke-width="5" stroke-linecap="round"/><circle cx="35" cy="50" r="4" fill="#4fd17a"/><circle cx="50" cy="50" r="4" fill="#4fd17a"/><circle cx="65" cy="50" r="4" fill="#ffce3f"/></svg>';
  
  // Nodo Mesh Redondo y Minimalista
  var ICON_NODE   = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="35" fill="#fff" stroke="#bdc3c7" stroke-width="4"/><circle cx="50" cy="50" r="25" fill="#ecf0f1"/><circle cx="50" cy="50" r="12" fill="#00d2d3"/><circle cx="50" cy="50" r="5" fill="#fff"/></svg>';
  
  // Sensores Orgánicos
  var ICON_SPRINKLER = '<svg viewBox="0 0 100 100"><rect x="40" y="50" width="20" height="40" rx="4" fill="#95a5a6"/><polygon points="30,50 70,50 50,30" fill="#34495e"/><circle cx="50" cy="25" r="12" fill="#3498db"/><circle cx="50" cy="25" r="4" fill="#fff"/></svg>';
  var ICON_LIGHT     = '<svg viewBox="0 0 100 100"><rect x="44" y="40" width="12" height="50" fill="#7f8c8d"/><polygon points="30,40 70,40 50,20" fill="#2c3e50"/><circle cx="50" cy="20" r="14" fill="#f1c40f"/><circle cx="50" cy="20" r="6" fill="#fff"/></svg>';
  var ICON_THERMO    = '<svg viewBox="0 0 100 100"><rect x="35" y="10" width="30" height="70" rx="15" fill="#fff" stroke="#e74c3c" stroke-width="6"/><circle cx="50" cy="65" r="12" fill="#e74c3c"/><line x1="50" y1="65" x2="50" y2="30" stroke="#e74c3c" stroke-width="8" stroke-linecap="round"/><g fill="#2c3e50" class="kawaii-eyes"><circle cx="42" cy="40" r="2.5"/><circle cx="58" cy="40" r="2.5"/></g></svg>';

  // --- DECORACIONES ---
  var DECO = {
    bush: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="35" fill="#2ecc71"/><circle cx="35" cy="65" r="25" fill="#27ae60"/><circle cx="65" cy="65" r="25" fill="#27ae60"/></svg>',
    pond: '<svg viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="45" ry="25" fill="#3498db" opacity="0.85"/><path d="M30 50 Q40 45 50 50" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.6"/></svg>',
    flowers: '<svg viewBox="0 0 100 100"><path d="M40 50 V80 M60 68 V80 M30 68 V80" stroke="#27ae60" stroke-width="4" stroke-linecap="round"/><circle cx="40" cy="40" r="10" fill="#e74c3c"/><circle cx="60" cy="60" r="8" fill="#9b59b6"/><circle cx="30" cy="60" r="8" fill="#f1c40f"/></svg>'
  };

  function find(r, c) {
    for (var i = 0; i < LEVEL.cells.length; i++)
      if (LEVEL.cells[i].r === r && LEVEL.cells[i].c === c) return LEVEL.cells[i];
    return null;
  }
  function clickSfx() { if (window.NEAudio) window.NEAudio.playClick(); }

  function createConfetti() {
      var container = document.getElementById("confetti-container");
      if(!container) return;
      var colors = ['#00d2d3', '#f1c40f', '#e74c3c', '#3498db', '#9b59b6'];
      for(var i=0; i<120; i++) {
          var conf = document.createElement("div");
          conf.className = "confetti";
          conf.style.left = Math.random() * 100 + "vw";
          conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
          conf.style.animationDuration = (Math.random() * 3 + 2) + "s";
          conf.style.animationDelay = (Math.random() * 1) + "s";
          container.appendChild(conf);
      }
  }

  // Lógica BFS de Red Mesh Inalámbrica
  function updateNetwork() {
    LEVEL.cells.forEach(function(cell) {
        if (cell.kind === "router") cell.active = true;
        else if (cell.kind === "node" || cell.kind === "sensor") cell.active = false;
    });

    var changed = true;
    while(changed) {
        changed = false;
        
        LEVEL.cells.forEach(function(target) {
            if ((target.kind === "node" || target.kind === "sensor") && !target.active) {
                var canReach = LEVEL.cells.some(function(source) {
                    if ((source.kind === "router" || source.kind === "node") && source.active) {
                        var dist = Math.sqrt(Math.pow(target.r - source.r, 2) + Math.pow(target.c - source.c, 2));
                        return dist <= COVERAGE_RADIUS;
                    }
                    return false;
                });

                if (canReach) {
                    target.active = true;
                    changed = true; 
                }
            }
        });
    }
  }

  function render() {
    updateNetwork(); 
    document.querySelectorAll(".tile").forEach(t => t.remove()); 

    for (var r = 0; r < LEVEL.rows; r++) {
      for (var c = 0; c < LEVEL.cols; c++) {
        var cell = find(r, c);
        var t = document.createElement("div");
        t.className = "tile"; 
        t.dataset.rc = r + "-" + c;
        t.dataset.r = r; t.dataset.c = c;
        
        if (!cell) {
        } else if (cell.kind === "router") {
          t.classList.add("device", "router", "active");
          t.innerHTML = ICON_ROUTER;
          t.innerHTML += '<div class="coverage"></div>'; 
        } else if (cell.role === "slot") {
          t.classList.add("vacio");
          t.innerHTML = '<span class="slot-hint">+</span>';
          t.dataset.slot = "1";
        } else if (cell.kind === "node") {
          t.classList.add("device", "node");
          if(cell.active) t.classList.add("active");
          t.innerHTML = ICON_NODE;
          if (cell.active) t.innerHTML += '<div class="coverage"></div>'; 
        } else if (cell.kind === "sensor") {
          t.classList.add("device", "sensor");
          if(cell.active) t.classList.add("active");
          var icon = ICON_SPRINKLER;
          if (cell.item === "light") icon = ICON_LIGHT;
          if (cell.item === "thermometer") icon = ICON_THERMO;
          t.innerHTML = icon;
        } else if (cell.kind === "deco") {
          t.classList.add("deco"); 
          t.innerHTML = '<div class="deco-art">' + (DECO[cell.item] || "") + "</div>";
        }
        
        board.appendChild(t);
      }
    }
  }

  function checkWin() {
    if (solved) return;
    
    var sensors = LEVEL.cells.filter(function (x) { return x.kind === "sensor"; });
    if (!sensors.every(function(x){ return x.active; })) return;
    
    solved = true;
    board.classList.add("completo");
    
    var tip = document.querySelector(".tooltip");
    if (tip) {
        tip.classList.add("ok");
        var pTags = tip.querySelectorAll("p");
        if(pTags.length > 0) pTags[0].innerHTML = "<strong>Awesome!</strong>";
        if(pTags.length > 1) {
            pTags[1].style.color = "#0097a7";
            pTags[1].innerHTML = "The Mesh Nodes have successfully blanketed the entire garden with Wi-Fi signal!";
        }
    }
    
    createConfetti();
    setTimeout(function () { if (window.NEWin) NEWin.show(LEVEL.number); }, 5500);
  }

  function initDrag() {
    var pieces = document.querySelectorAll(".pieza");
    var ghost = null;
    var ghostRef = null;

    function move(e) { if(ghost) { ghost.style.left = e.clientX + "px"; ghost.style.top = e.clientY + "px"; } }
    function slotUnder(e) {
      var el = document.elementFromPoint(e.clientX, e.clientY);
      return el ? el.closest('.tile[data-slot="1"]') : null;
    }
    function onMove(e) {
      move(e);
      document.querySelectorAll(".tile.resaltar").forEach(z => z.classList.remove("resaltar"));
      var s = slotUnder(e); 
      if (s) s.classList.add("resaltar");
    }
    function onUp(e) {
      var s = slotUnder(e);
      if (ghost) { ghost.remove(); ghost = null; }
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      
      document.querySelectorAll(".tile.resaltar").forEach(el => el.classList.remove("resaltar"));
      
      if (s && !solved) {
        var rc = s.dataset.rc.split("-");
        var r = parseInt(rc[0]);
        var c = parseInt(rc[1]);
        var cell = find(r, c);

        if (cell && cell.role === "slot") {
            cell.kind = "node";
            delete cell.role;
            ghostRef.classList.add("usada");
            clickSfx(); render(); checkWin();
        }
      }
    }
    
    pieces.forEach(function(piece) {
      piece.addEventListener("pointerdown", function (e) {
        if (solved || piece.classList.contains("usada")) return;
        e.preventDefault();
        ghost = document.createElement("div");
        ghost.className = "ghost";
        ghost.innerHTML = ICON_NODE;
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