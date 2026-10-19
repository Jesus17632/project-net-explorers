
(function () {
  "use strict";

  var LEVEL = {
    number: 5, title: "Peer to Peer", cols: 5, rows: 4,
    cells: [

      { r: 0, c: 0, kind: "deco", item: "coffee" },
      { r: 0, c: 4, kind: "deco", item: "plant" },
      { r: 3, c: 1, kind: "deco", item: "glasses" },
      { r: 3, c: 3, kind: "deco", item: "notebook" },

      // Los dispositivo en la fila 1 y 2 
      { r: 1, c: 1, kind: "phone_sender", role: "slot", filled: false }, // Celular 
      { r: 1, c: 2, kind: "pipe", shape: "bluetooth", role: "rotate", rot: 1, sol: 0 }, 
      { r: 1, c: 3, kind: "phone_receiver" }, // Celular derecho
    ],
  };

  var PATH = [[1,1], [1,2], [1,3]]; //Animacion de envio

  var solved = false, board;

  var SVG_FILE = '<svg viewBox="0 0 100 100"><rect x="10" y="25" width="80" height="50" rx="4" fill="#fff" stroke="#d35400" stroke-width="6" stroke-linejoin="round"/><path d="M10 25 L50 55 L90 25" fill="none" stroke="#d35400" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function svgBluetooth() {
    return '<svg class="cable" viewBox="0 0 100 100">'
      + '<line class="cond" x1="0" y1="50" x2="100" y2="50" stroke-width="8" stroke-dasharray="10 12" stroke-linecap="round"/>'
      + '<circle cx="50" cy="50" r="22" class="bt-icon"/>'
      + '<path d="M45 32 L58 44 L45 56 L58 68 L45 80 V32" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>'
      + '</svg>';
  }

  var ICON_PHONE = '<svg viewBox="0 0 100 100"><rect x="25" y="10" width="50" height="80" rx="8" fill="#3a4047" stroke="#23262e" stroke-width="2"/><rect x="30" y="15" width="40" height="65" rx="4" fill="#1b2a3a"/><circle cx="50" cy="85" r="3" fill="#5a6168"/></svg>';

  var DECO = {
    coffee: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="30" fill="#fff" filter="drop-shadow(3px 4px 5px rgba(0,0,0,0.3))"/><circle cx="50" cy="50" r="25" fill="#4a2c11"/><path d="M75 40 Q90 50 75 60" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/></svg>',
    notebook: '<svg viewBox="0 0 100 100"><rect x="20" y="15" width="60" height="70" rx="4" fill="#3498db" filter="drop-shadow(3px 4px 5px rgba(0,0,0,0.3))"/><rect x="28" y="15" width="52" height="70" fill="#ecf0f1"/><line x1="20" y1="25" x2="28" y2="25" stroke="#2c3e50" stroke-width="4"/><line x1="20" y1="40" x2="28" y2="40" stroke="#2c3e50" stroke-width="4"/><line x1="20" y1="55" x2="28" y2="55" stroke="#2c3e50" stroke-width="4"/><line x1="20" y1="70" x2="28" y2="70" stroke="#2c3e50" stroke-width="4"/></svg>',
    glasses: '<svg viewBox="0 0 100 100"><rect x="15" y="40" width="30" height="20" rx="6" fill="rgba(255,255,255,0.4)" stroke="#2c3e50" stroke-width="4" filter="drop-shadow(2px 2px 3px rgba(0,0,0,0.2))"/><rect x="55" y="40" width="30" height="20" rx="6" fill="rgba(255,255,255,0.4)" stroke="#2c3e50" stroke-width="4" filter="drop-shadow(2px 2px 3px rgba(0,0,0,0.2))"/><path d="M45 50 Q50 45 55 50" fill="none" stroke="#2c3e50" stroke-width="4"/></svg>',
    plant: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="24" fill="#d35400" filter="drop-shadow(3px 4px 5px rgba(0,0,0,0.3))"/><circle cx="50" cy="50" r="20" fill="#5c4033"/><path d="M50 50 Q30 20 20 40 Q40 60 50 50" fill="#27ae60"/><path d="M50 50 Q70 20 80 40 Q60 60 50 50" fill="#2ecc71"/><path d="M50 50 Q30 80 20 60 Q40 40 50 50" fill="#2ecc71"/><path d="M50 50 Q70 80 80 60 Q60 40 50 50" fill="#27ae60"/></svg>'
  };

  function correct(cell) {
    if (cell.role === "slot") return !!cell.filled;
    return (cell.rot - cell.sol) % 2 === 0; 
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
        } else if (cell.kind === "phone_sender") {
          t.classList.add("device", "phone");
          t.innerHTML = ICON_PHONE;
          
          if (!cell.filled) {
            t.innerHTML += '<div class="file-slot"></div>';
            t.dataset.slot = "1"; 
          } else {
            t.innerHTML += '<div class="file-filled">' + SVG_FILE + '</div>';
          }
          
        } else if (cell.kind === "phone_receiver") {
          t.classList.add("device", "phone");
          t.innerHTML = ICON_PHONE;
        } else if (cell.kind === "deco") {
          t.classList.add("deco");
          t.innerHTML = '<div class="deco-art">' + (DECO[cell.item] || "") + "</div>";
        } else if (cell.kind === "pipe") {
          t.classList.add("pipe", cell.role);
          t.innerHTML = svgBluetooth();
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

    // Calculamos los puntos del emisor al receptor
    var pts = PATH.map(function (p) {
      var el = board.querySelector('[data-rc="' + p[0] + '-' + p[1] + '"]');
      var rc = el.getBoundingClientRect();
      return (rc.left + rc.width / 2 - lr.left).toFixed(1) + " " + (rc.top + rc.height / 2 - lr.top).toFixed(1);
    });
    var d = 'path("M' + pts.join(" L") + '")';
    
    var envelope = document.createElement("div");
    envelope.className = "packet-file";
    envelope.innerHTML = SVG_FILE;
    envelope.style.offsetPath = d;
    envelope.style.webkitOffsetPath = d;
    layer.appendChild(envelope);
    
    var staticFile = board.querySelector(".file-filled");
    if(staticFile) {
        setTimeout(function(){ staticFile.style.display = "none"; }, 500);
    }
  }

  function checkWin() {
    if (solved) return;
    
    var senders = LEVEL.cells.filter(function (x) { return x.kind === "phone_sender"; });
    if (!senders.every(function(x){ return x.filled; })) return;

    var pipes = LEVEL.cells.filter(function (x) { return x.kind === "pipe"; });
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
      if (s) {
          s.closest('.tile').classList.add("resaltar");
      }
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
      ghost.innerHTML = SVG_FILE; 
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