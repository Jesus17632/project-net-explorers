/* ============================================================
 * level9.js — Level 9 (Smart Garden).
 * 9x6 Grid. IoT Mesh Network. Euclidean Distance Coverage.
 * ============================================================ */
(function () {
  "use strict";

  var LEVEL = {
    number: 9, title: "Building Network", cols: 9, rows: 6,
    cells: [
      // Base (Router en la casa de madera a la izquierda)
      { r: 2, c: 0, kind: "router", active: true }, 

      // 3 Sensores Objetivos (Apagados al inicio)
      { r: 5, c: 1, kind: "sensor", item: "thermometer", active: false }, // Termómetro
      { r: 1, c: 4, kind: "sensor", item: "sprinkler", active: false },   // Aspersor
      { r: 4, c: 8, kind: "sensor", item: "light", active: false },       // Lámpara solar

      // Los 6 Slots posibles para acomodar los 4 Nodos (2 son señuelos inútiles)
      { r: 4, c: 2, kind: "slot", role: "slot", filled: false }, // Ayuda al termómetro y aspersor
      { r: 0, c: 3, kind: "slot", role: "slot", filled: false }, // Señuelo (muy lejos)
      { r: 2, c: 5, kind: "slot", role: "slot", filled: false }, // Puente central
      { r: 5, c: 5, kind: "slot", role: "slot", filled: false }, // Puente inferior
      { r: 0, c: 7, kind: "slot", role: "slot", filled: false }, // Señuelo (arriba a la derecha)
      { r: 2, c: 8, kind: "slot", role: "slot", filled: false }, // Puente a la lámpara

      // Decoraciones del jardín
      { r: 0, c: 1, kind: "deco", item: "bush" },
      { r: 0, c: 5, kind: "deco", item: "pond" },
      { r: 1, c: 2, kind: "deco", item: "flowers" },
      { r: 3, c: 1, kind: "deco", item: "path" },
      { r: 3, c: 8, kind: "deco", item: "bush" },
      { r: 4, c: 4, kind: "deco", item: "pond" },
      { r: 5, c: 7, kind: "deco", item: "flowers" },
    ]
  };

  var solved = false, board;
  var COVERAGE_RADIUS = 3.25; // Radio exacto para que las distancias funcionen como en tu imagen

  // ICONOS HARDWARE (Kawaii Style)
  var ICON_ROUTER = '<svg viewBox="0 0 100 100"><rect x="15" y="35" width="70" height="40" rx="8" fill="#fff" stroke="#c8d0d7" stroke-width="4"/><circle cx="30" cy="55" r="4" fill="#4fd17a"/><circle cx="40" cy="55" r="4" fill="#f1c40f"/><circle cx="50" cy="55" r="4" fill="#e74c3c"/><g fill="#2c3e50" class="kawaii-eyes"><circle cx="65" cy="45" r="2.5"/><circle cx="78" cy="45" r="2.5"/><path d="M68 50 Q71.5 54 75 50" fill="none" stroke="#2c3e50" stroke-width="2" stroke-linecap="round"/></g><path d="M40 25 Q50 15 60 25 M30 15 Q50 0 70 15" fill="none" stroke="#00d2d3" stroke-width="3" stroke-linecap="round"/></svg>';
  var ICON_NODE   = '<svg viewBox="0 0 100 100"><rect x="25" y="40" width="50" height="50" rx="8" fill="#ecf0f1" stroke="#bdc3c7" stroke-width="4"/><line x1="50" y1="40" x2="50" y2="15" stroke="#7f8c8d" stroke-width="6" stroke-linecap="round"/><circle cx="50" cy="15" r="8" fill="#00d2d3"/><g fill="#2c3e50" class="kawaii-eyes"><circle cx="40" cy="60" r="3"/><circle cx="60" cy="60" r="3"/><path d="M45 68 Q50 73 55 68" fill="none" stroke="#2c3e50" stroke-width="2.5" stroke-linecap="round"/></g></svg>';
  
  var ICON_SPRINKLER = '<svg viewBox="0 0 100 100"><rect x="35" y="60" width="30" height="30" rx="4" fill="#95a5a6"/><polygon points="25,60 75,60 50,40" fill="#34495e"/><circle cx="50" cy="35" r="8" fill="#3498db"/><g fill="#2c3e50" class="kawaii-eyes"><circle cx="45" cy="55" r="2"/><circle cx="55" cy="55" r="2"/><path d="M48 60 Q50 63 52 60" fill="none" stroke="#2c3e50" stroke-width="1.5"/></g></svg>';
  var ICON_LIGHT     = '<svg viewBox="0 0 100 100"><rect x="42" y="45" width="16" height="50" fill="#7f8c8d"/><polygon points="30,45 70,45 50,25" fill="#2c3e50"/><circle cx="50" cy="25" r="12" fill="#f1c40f"/><g fill="#2c3e50" class="kawaii-eyes"><circle cx="46" cy="35" r="1.5"/><circle cx="54" cy="35" r="1.5"/></g></svg>';
  var ICON_THERMO    = '<svg viewBox="0 0 100 100"><rect x="35" y="15" width="30" height="70" rx="15" fill="#fff" stroke="#e74c3c" stroke-width="6"/><circle cx="50" cy="65" r="10" fill="#e74c3c"/><line x1="50" y1="65" x2="50" y2="30" stroke="#e74c3c" stroke-width="8" stroke-linecap="round"/><g fill="#2c3e50" class="kawaii-eyes"><circle cx="42" cy="40" r="2.5"/><circle cx="58" cy="40" r="2.5"/></g></svg>';

  // DECORACIONES JARDÍN
  var DECO = {
    bush: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="35" fill="#2ecc71"/><circle cx="35" cy="65" r="25" fill="#27ae60"/><circle cx="65" cy="65" r="25" fill="#27ae60"/></svg>',
    pond: '<svg viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="45" ry="25" fill="#3498db" opacity="0.85"/><path d="M30 50 Q40 45 50 50" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.6"/></svg>',
    flowers: '<svg viewBox="0 0 100 100"><path d="M40 50 V80 M60 68 V80 M30 68 V80" stroke="#27ae60" stroke-width="4" stroke-linecap="round"/><circle cx="40" cy="40" r="10" fill="#e74c3c"/><circle cx="60" cy="60" r="8" fill="#9b59b6"/><circle cx="30" cy="60" r="8" fill="#f1c40f"/></svg>',
    path: '<svg viewBox="0 0 100 100"><path d="M10 100 Q40 50 90 10" fill="none" stroke="#8b5a2b" stroke-width="20" stroke-linecap="round" opacity="0.4"/></svg>'
  };

  function find(r, c) {
    for (var i = 0; i < LEVEL.cells.length; i++)
      if (LEVEL.cells[i].r === r && LEVEL.cells[i].c === c) return LEVEL.cells[i];
    return null;
  }
  function clickSfx() { if (window.NEAudio) window.NEAudio.playClick(); }

  // ── LÓGICA DE MALLA INALÁMBRICA (BFS por distancia) ──
  function updateNetwork() {
    // 1. Reset: Apagar todo excepto el Router
    LEVEL.cells.forEach(function(cell) {
        if (cell.kind === "router") cell.active = true;
        else if (cell.kind === "node" || cell.kind === "sensor") cell.active = false;
    });

    var changed = true;
    while(changed) {
        changed = false;
        
        // 2. Iterar nodos inactivos y ver si están en el radio de un nodo activo
        LEVEL.cells.forEach(function(target) {
            if ((target.kind === "node" || target.kind === "sensor") && !target.active) {
                var canReach = LEVEL.cells.some(function(source) {
                    if ((source.kind === "router" || source.kind === "node") && source.active) {
                        // Distancia euclidiana
                        var dist = Math.sqrt(Math.pow(target.r - source.r, 2) + Math.pow(target.c - source.c, 2));
                        return dist <= COVERAGE_RADIUS;
                    }
                    return false;
                });

                if (canReach) {
                    target.active = true;
                    changed = true; // Si encendimos uno, hay que volver a revisar si hace puente a otro
                }
            }
        });
    }
  }

  function render() {
    updateNetwork(); 
    board.innerHTML = "";
    
    // Madera lateral (Casa)
    var homeZone = document.createElement("div");
    homeZone.style.position = "absolute";
    homeZone.style.top = "0"; homeZone.style.left = "0"; homeZone.style.bottom = "0"; homeZone.style.width = "86px";
    homeZone.style.background = "#e6ccb2"; homeZone.style.borderRight = "8px solid #8b5a2b";
    homeZone.style.zIndex = "1";
    board.appendChild(homeZone);

    for (var r = 0; r < LEVEL.rows; r++) {
      for (var c = 0; c < LEVEL.cols; c++) {
        var cell = find(r, c);
        var t = document.createElement("div");
        t.className = "tile"; 
        t.dataset.r = r; t.dataset.c = c;
        
        if (!cell) {
        } else if (cell.kind === "router") {
          t.innerHTML = '<div class="device-box active">' + ICON_ROUTER + '</div>';
          t.innerHTML += '<div class="coverage"></div>'; // El router siempre emite
        } else if (cell.role === "slot") {
          t.classList.add("vacio");
          t.innerHTML = '<span class="slot-hint">+</span>';
          t.dataset.slot = "1";
        } else if (cell.kind === "node") {
          var cls = cell.active ? "active" : "";
          t.innerHTML = '<div class="device-box ' + cls + '">' + ICON_NODE + '</div>';
          if (cell.active) {
              t.innerHTML += '<div class="coverage"></div>'; // Emite solo si está activo
          }
        } else if (cell.kind === "sensor") {
          var cls = cell.active ? "active" : "";
          var icon = ICON_SPRINKLER;
          if (cell.item === "light") icon = ICON_LIGHT;
          if (cell.item === "thermometer") icon = ICON_THERMO;
          
          t.innerHTML = '<div class="device-box ' + cls + '">' + icon + '</div>';
        } else if (cell.kind === "deco") {
          t.classList.add("deco"); t.innerHTML = '<div class="deco-art">' + (DECO[cell.item] || "") + "</div>";
        }
        
        board.appendChild(t);
      }
    }
  }

  function checkWin() {
    if (solved) return;
    
    // Victoria si los 3 sensores están activos
    var sensors = LEVEL.cells.filter(function (x) { return x.kind === "sensor"; });
    if (!sensors.every(function(x){ return x.active; })) return;
    
    solved = true;
    board.classList.add("completo");
    var tip = document.querySelector(".tooltip");
    if (tip) tip.classList.add("ok");
    
    setTimeout(function () { if (window.NEWin) NEWin.show(LEVEL.number); }, 3500);
  }

  function initDrag() {
    var pieces = document.querySelectorAll(".pieza");
    var ghost = null;
    var ghostRef = null;

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

        if (cell && cell.role === "slot") {
            // Reemplazar slot vacío por Mesh Node
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
        // SVG del Nodo fantasma al arrastrar
        ghost.innerHTML = '<svg viewBox="0 0 100 100"><rect x="25" y="40" width="50" height="50" rx="8" fill="#ecf0f1" stroke="#bdc3c7" stroke-width="4"/><line x1="50" y1="40" x2="50" y2="15" stroke="#7f8c8d" stroke-width="6" stroke-linecap="round"/><circle cx="50" cy="15" r="8" fill="#00d2d3"/></svg>';
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