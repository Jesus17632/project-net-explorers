// Level 2: Share the Printer

(function () {
  "use strict";

  var LEVEL = {
    number: 2, title: "Share the Printer", cols: 5, rows: 4,
    cells: [
      { r: 1, c: 0, kind: "outlet" },
      { r: 1, c: 1, kind: "pipe", shape: "curve",    role: "fixed",  rot: 2, sol: 2 }, 
      { r: 2, c: 1, kind: "pipe", shape: "curve",    role: "slot",   rot: 1, sol: 0, filled: false }, 
      { r: 2, c: 2, kind: "pipe", shape: "straight", role: "fixed",  rot: 0, sol: 0 },
      { r: 2, c: 3, kind: "pipe", shape: "straight", role: "rotate", rot: 1, sol: 0 },
      { r: 2, c: 4, kind: "printer" },
      { r: 3, c: 1, kind: "router" }, 
      { r: 3, c: 4, kind: "pc" }, 
      
      { r: 0, c: 0, kind: "deco", item: "window" },
      { r: 0, c: 4, kind: "deco", item: "shelf" },
      { r: 3, c: 0, kind: "deco", item: "plant" }
    ],
  };

  var PATH = [[1,0], [1,1], [2,1], [2,2], [2,3], [2,4]];
  var solved = false, board;

  // SVGs
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

  // Iconos
  var ICON_OUTLET  = '<svg viewBox="0 0 100 100"><rect x="25" y="15" width="50" height="70" rx="8" fill="#fdfdfd" stroke="#bdc3c7" stroke-width="4"/><rect x="40" y="25" width="6" height="15" rx="3" fill="#2c3e50"/><rect x="54" y="25" width="6" height="15" rx="3" fill="#2c3e50"/><circle cx="50" cy="45" r="4" fill="#2c3e50"/><rect x="40" y="60" width="6" height="15" rx="3" fill="#2c3e50"/><rect x="54" y="60" width="6" height="15" rx="3" fill="#2c3e50"/><circle cx="50" cy="80" r="4" fill="#2c3e50"/></svg>';
  var ICON_PRINTER = '<svg viewBox="0 0 100 100"><rect x="30" y="15" width="40" height="25" rx="3" fill="#ffffff" stroke="#bdc3c7" stroke-width="3"/><line x1="40" y1="22" x2="60" y2="22" stroke="#ecf0f1" stroke-width="3" stroke-linecap="round"/><line x1="40" y1="28" x2="60" y2="28" stroke="#ecf0f1" stroke-width="3" stroke-linecap="round"/><rect x="15" y="40" width="70" height="35" rx="8" fill="#ecf0f1" stroke="#bdc3c7" stroke-width="4"/><rect x="25" y="75" width="50" height="15" rx="3" fill="#95a5a6"/><circle cx="72" cy="52" r="5" fill="#e74c3c" id="printer-led"/><rect x="25" y="52" width="30" height="4" rx="2" fill="#3a4047" opacity="0.1"/></svg>';
  var ICON_ROUTER  = '<svg viewBox="0 0 100 100"><line x1="30" y1="40" x2="20" y2="15" stroke="#7f8c8d" stroke-width="5" stroke-linecap="round"/><line x1="70" y1="40" x2="80" y2="15" stroke="#7f8c8d" stroke-width="5" stroke-linecap="round"/><circle cx="20" cy="15" r="4" fill="#3498db"/><circle cx="80" cy="15" r="4" fill="#3498db"/><rect x="20" y="40" width="60" height="30" rx="8" fill="#fff" stroke="#bdc3c7" stroke-width="4"/><circle cx="35" cy="55" r="3.5" fill="#2ecc71"/><circle cx="50" cy="55" r="3.5" fill="#f1c40f"/><circle cx="65" cy="55" r="3.5" fill="#e74c3c"/></svg>';
  var ICON_PC      = '<svg viewBox="0 0 100 100"><path d="M 40 75 L 30 90 H 70 L 60 75 Z" fill="#7f8c8d"/><rect x="15" y="20" width="70" height="50" rx="6" fill="#34495e"/><rect x="20" y="25" width="60" height="40" rx="3" fill="#95a5a6" id="pc-screen"/><g id="pc-face-sleep"><path d="M 40 45 Q 45 40 50 45" fill="none" stroke="#2c3e50" stroke-width="3" stroke-linecap="round"/><path d="M 50 45 Q 55 40 60 45" fill="none" stroke="#2c3e50" stroke-width="3" stroke-linecap="round"/></g><g id="pc-face-happy" opacity="0"><circle cx="40" cy="42" r="3.5" fill="#2c3e50"/><circle cx="60" cy="42" r="3.5" fill="#2c3e50"/><path d="M 46 48 Q 50 54 54 48" fill="none" stroke="#2c3e50" stroke-width="3" stroke-linecap="round"/></g></svg>';

  var DECO = {
    window:'<svg viewBox="0 0 100 100"><defs><linearGradient id="wsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe4f7"/><stop offset="1" stop-color="#eaf6ff"/></linearGradient></defs><rect x="20" y="16" width="60" height="58" rx="2" fill="url(#wsky)"/><circle cx="65" cy="30" r="7" fill="#ffe49a"/><path d="M20 58 q12-10 24-2 q12-8 24 2 v16 H20 Z" fill="#9ccb86"/><rect x="16" y="12" width="68" height="64" rx="4" fill="none" stroke="#946537" stroke-width="6"/><path d="M50 14 V74 M18 44 H82" stroke="#946537" stroke-width="5"/><rect x="12" y="74" width="76" height="7" rx="2" fill="#7a5330"/></svg>',
    shelf:'<svg viewBox="0 0 100 100"><defs><linearGradient id="shw" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#a9763f"/><stop offset="1" stop-color="#875a2e"/></linearGradient></defs><rect x="24" y="34" width="10" height="34" rx="1.5" fill="#9c3b34"/><rect x="35" y="30" width="10" height="38" rx="1.5" fill="#33506b"/><rect x="46" y="36" width="10" height="32" rx="1.5" fill="#76844a"/><rect x="57" y="32" width="10" height="36" rx="1.5" fill="#c4953c"/><rect x="68" y="40" width="9" height="28" rx="1.5" fill="#6b4a8a" transform="rotate(8 72 54)"/><rect x="18" y="68" width="64" height="8" rx="2" fill="url(#shw)"/><rect x="22" y="76" width="6" height="9" fill="#7a5330"/><rect x="72" y="76" width="6" height="9" fill="#7a5330"/></svg>',
    plant: '<svg viewBox="0 0 100 100"><path d="M 50 50 Q 20 20 40 10 Q 50 30 50 50" fill="#27ae60"/><path d="M 50 50 Q 80 20 60 10 Q 50 30 50 50" fill="#2ecc71"/><path d="M 50 50 Q 10 50 20 30 Q 40 40 50 50" fill="#2ecc71"/><path d="M 50 50 Q 90 50 80 30 Q 60 40 50 50" fill="#27ae60"/><polygon points="35,50 65,50 55,80 45,80" fill="#d35400" stroke="#e67e22" stroke-width="4" stroke-linejoin="round"/></svg>'
  };

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
          t.classList.add("device");
          t.innerHTML = '<div class="device-box">' + ICON_OUTLET + '</div>';
         
          t.innerHTML += '<svg class="device-connector" viewBox="0 0 100 100" style="overflow:visible;"><path d="M 70 50 L 100 50" class="cond"/><path d="M 70 50 L 100 50" class="shine"/></svg>';
        } else if (cell.kind === "printer") {
          t.classList.add("device");
          t.innerHTML = '<div class="device-box">' + ICON_PRINTER + '</div>';
          
          t.innerHTML += '<svg class="device-connector" viewBox="0 0 100 100" style="overflow:visible;"><path d="M 0 50 L 30 50" class="cond"/><path d="M 0 50 L 30 50" class="shine"/></svg>';
        } else if (cell.kind === "router") {
          t.classList.add("device");
          t.innerHTML = '<div class="device-box">' + ICON_ROUTER + '</div>'; 
        } else if (cell.kind === "pc") {
          t.classList.add("device");
          t.innerHTML = '<div class="device-box">' + ICON_PC + '</div>'; 
        } else if (cell.kind === "deco") {
          t.classList.add("floor", "deco");
          t.innerHTML = '<div class="deco-art">' + (DECO[cell.item] || "") + "</div>";
        } else if (cell.kind === "pipe") {
          t.classList.add("pipe", cell.role);
          if (cell.role === "slot" && !cell.filled) {
            t.classList.add("vacio");
            t.innerHTML = '<div class="slot-hint-icon">' + svgCurve() + '</div>'; 
          } else {
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
      dot.className = "packet-power"; 
      dot.style.offsetPath = d;
      dot.style.webkitOffsetPath = d;
      dot.style.animationDelay = (i * 0.4) + "s";
      layer.appendChild(dot);
    }
  }

  function drawWifiArc(startRc, endRc) {
    var layer = document.querySelector(".flujo-layer") || document.createElement("div");
    if(!document.querySelector(".flujo-layer")) {
        layer.className = "flujo-layer"; board.appendChild(layer);
    }
    
    var el1 = board.querySelector('[data-rc="' + startRc[0] + '-' + startRc[1] + '"]');
    var el2 = board.querySelector('[data-rc="' + endRc[0] + '-' + endRc[1] + '"]');
    var lr = board.getBoundingClientRect(); 
    var r1 = el1.getBoundingClientRect();
    var r2 = el2.getBoundingClientRect();
    
    var x1 = r1.left + r1.width/2 - lr.left;
    var y1 = r1.top + r1.height/2 - lr.top;
    var x2 = r2.left + r2.width/2 - lr.left;
    var y2 = r2.top + r2.height/2 - lr.top;
    
    var cx = (x1 + x2) / 2; var cy = Math.min(y1, y2) - 60;

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.style.position = "absolute"; svg.style.top = "0"; svg.style.left = "0";
    svg.style.width = "100%"; svg.style.height = "100%";
    svg.style.pointerEvents = "none"; svg.style.zIndex = "20";

    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M" + x1 + " " + y1 + " Q" + cx + " " + cy + " " + x2 + " " + y2);
    path.setAttribute("class", "wifi-arc-line");
    
    svg.appendChild(path);
    board.appendChild(svg);
    
    setTimeout(() => { path.classList.add("show"); }, 50);
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

    setTimeout(function() {
      var led = document.getElementById("printer-led");
      if(led) { led.setAttribute("fill", "#2ecc71"); }
    }, 1200);

    setTimeout(function() {
      drawWifiArc([3,1], [2,4]); // A la Impresora
      drawWifiArc([3,1], [3,4]); // A la PC
    }, 2000);

    setTimeout(function() {
      var screen = document.getElementById("pc-screen");
      if(screen) screen.setAttribute("fill", "#6fc7ff"); 
      
      var sleepFace = document.getElementById("pc-face-sleep");
      var happyFace = document.getElementById("pc-face-happy");
      if(sleepFace) sleepFace.setAttribute("opacity", "0");
      if(happyFace) happyFace.setAttribute("opacity", "1");
      
      if (tip) {
          tip.querySelector("p").innerHTML = "<strong>Awesome!</strong> The printer has power and is now connected to the PC via Wi-Fi.";
      }
    }, 3000);

    setTimeout(function () { if (window.NEWin) NEWin.show(LEVEL.number); }, 5500);
  }

  function initDrag() {
    var pieceContainer = document.getElementById("pieza-arrastrable");
    if (!pieceContainer) return;
    
    pieceContainer.innerHTML = svgCurve();
    
    var ghost = null;
    function move(e) { if(ghost){ ghost.style.left = e.clientX + "px"; ghost.style.top = e.clientY + "px"; } }
    function slotUnder(e) {
      if(ghost) ghost.style.pointerEvents = 'none';
      var el = document.elementFromPoint(e.clientX, e.clientY);
      if(ghost) ghost.style.pointerEvents = 'auto';
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
          pieceContainer.classList.add("usada");
          clickSfx(); render(); checkWin();
        }
      }
    }
    pieceContainer.addEventListener("pointerdown", function (e) {
      if (solved || pieceContainer.classList.contains("usada")) return;
      e.preventDefault();
      ghost = document.createElement("div");
      ghost.className = "ghost";
      ghost.innerHTML = svgCurve();
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