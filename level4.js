// level4.js: no more cables

(function () {
  "use strict";

  var LEVEL = {
    number: 4, title: "No more cables", cols: 5, rows: 4,
    cells: [

      // fila 0
      { r: 0, c: 0, kind: "tv" },
      { r: 0, c: 1, kind: "deco", item: "lamp" },
      { r: 0, c: 2, kind: "deco", item: "window" }, 
      { r: 0, c: 3, kind: "deco", item: "plant" },
      { r: 0, c: 4, kind: "laptop" },

      // fila 1
      { r: 1, c: 0, kind: "pipe", shape: "curve",    role: "rotate", rot: 1, sol: 0 }, 
      { r: 1, c: 1, kind: "pipe", shape: "straight", role: "rotate", rot: 0, sol: 1 }, 
      { r: 1, c: 2, kind: "router_slot", role: "slot", filled: false }, 
      { r: 1, c: 3, kind: "pipe", shape: "straight", role: "rotate", rot: 0, sol: 1 }, 
      { r: 1, c: 4, kind: "pipe", shape: "curve",    role: "rotate", rot: 0, sol: 3 }, 

      // fila 2
      { r: 2, c: 0, kind: "pipe", shape: "curve",    role: "rotate", rot: 2, sol: 1 }, 
      { r: 2, c: 1, kind: "pipe", shape: "straight", role: "rotate", rot: 0, sol: 1 }, 
      { r: 2, c: 2, kind: "pipe", shape: "t",        role: "rotate", rot: 0, sol: 3 }, 
      { r: 2, c: 3, kind: "pipe", shape: "straight", role: "rotate", rot: 0, sol: 1 }, 
      { r: 2, c: 4, kind: "pipe", shape: "curve",    role: "rotate", rot: 0, sol: 2 }, 

      // fila 3
      { r: 3, c: 0, kind: "pc" },
      { r: 3, c: 1, kind: "deco", item: "shelf" },
      { r: 3, c: 2, kind: "deco", item: "cat" }, 
      { r: 3, c: 3, kind: "deco", item: "lamp" },
      { r: 3, c: 4, kind: "phone" },
    ],
  };

  var solved = false, board;

  function meshPodSVG() {
    return '<rect class="mesh-pod" x="35" y="35" width="30" height="30" rx="10"/>' +
           '<path d="M42 55 A 10 10 0 0 1 58 55" fill="none" class="mesh-icon" stroke-width="2.5" stroke-linecap="round"/>' +
           '<path d="M46 50 A 4 4 0 0 1 54 50" fill="none" class="mesh-icon" stroke-width="2.5" stroke-linecap="round"/>' +
           '<circle cx="50" cy="62" r="3" class="mesh-led"/>';
  }

  function svgWirelessStraight() {
    return '<svg class="cable" viewBox="0 0 100 100" style="overflow:visible;">'
      + '<line class="cond" x1="50" y1="0" x2="50" y2="100"/>'
      + meshPodSVG() + '</svg>';
  }
  function svgWirelessCurve() {
    return '<svg class="cable" viewBox="0 0 100 100" style="overflow:visible;">'
      + '<path class="cond" d="M50 50 L50 0 M50 50 L100 50"/>'
      + meshPodSVG() + '</svg>';
  }
  function svgWirelessT() {
    return '<svg class="cable" viewBox="0 0 100 100" style="overflow:visible;">'
      + '<path class="cond" d="M50 50 L50 0 M50 50 L100 50 M50 50 L50 100"/>'
      + meshPodSVG() + '</svg>';
  }
  function svgPipe(cell) {
    if (cell.shape === "t") return svgWirelessT();
    return cell.shape === "curve" ? svgWirelessCurve() : svgWirelessStraight(); 
  }

  var ICON_ROUTER = '<svg viewBox="0 0 100 100"><rect x="15" y="30" width="70" height="40" rx="10" fill="#fff" stroke="#bdc3c7" stroke-width="4"/><path d="M25 30 L20 10 M50 30 L50 5 M75 30 L80 10" stroke="#3a4047" stroke-width="5" stroke-linecap="round"/><circle cx="35" cy="50" r="4" fill="#4fd17a"/><circle cx="50" cy="50" r="4" fill="#4fd17a"/><circle cx="65" cy="50" r="4" fill="#ffce3f"/></svg>';
  var ICON_TV     = '<svg viewBox="0 0 100 100"><rect x="10" y="20" width="80" height="50" rx="6" fill="#3a4047"/><rect x="14" y="24" width="72" height="42" rx="4" fill="#2ec27e"/><rect x="35" y="70" width="30" height="6" rx="3" fill="#5a6168"/><rect x="45" y="76" width="10" height="8" fill="#5a6168"/></svg>';
  var ICON_LAPTOP = '<svg viewBox="0 0 100 100"><rect x="15" y="25" width="70" height="45" rx="6" fill="#3a4047"/><rect x="20" y="30" width="60" height="35" rx="2" fill="#6fc7ff"/><path d="M5 70 h90 v10 h-90 z" fill="#5a6168" rx="4"/><rect x="40" y="73" width="20" height="4" fill="#8d9298" rx="2"/></svg>';
  var ICON_PC     = '<svg viewBox="0 0 100 100"><rect x="44" y="60" width="12" height="12" fill="#5a6168"/><rect x="32" y="72" width="36" height="8" rx="4" fill="#5a6168"/><rect x="16" y="18" width="68" height="46" rx="8" fill="#3a4047"/><rect x="21" y="23" width="58" height="34" rx="4" fill="#6fc7ff"/><circle cx="62" cy="45" r="5" fill="#ffffff" opacity=".7"/></svg>';
  var ICON_PHONE  = '<svg viewBox="0 0 100 100"><rect x="30" y="15" width="40" height="70" rx="8" fill="#3a4047"/><rect x="34" y="19" width="32" height="56" rx="4" fill="#ff6f3c"/><circle cx="50" cy="81" r="3" fill="#95a5a6"/></svg>';
  var SVG_WIFI    = '<svg viewBox="0 0 24 24"><path d="M12 2C7.3 2 3.1 4.3.5 7.9L2 9.8C4.1 6.8 7.8 4.9 12 4.9S19.9 6.8 22 9.8L23.5 7.9C20.9 4.3 16.7 2 12 2zM12 8C9.1 8 6.5 9.4 4.9 11.6L6.4 13.5C7.6 11.8 9.7 10.7 12 10.7S16.4 11.8 17.6 13.5L19.1 11.6C17.5 9.4 14.9 8 12 8zM12 14C10.3 14 8.9 14.8 8.1 16.1L12 21L15.9 16.1C15.1 14.8 13.7 14 12 14z"/></svg>';

  var DECO = {
    window:'<svg viewBox="0 0 100 100"><defs><linearGradient id="wsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe4f7"/><stop offset="1" stop-color="#eaf6ff"/></linearGradient></defs><rect x="20" y="16" width="60" height="58" rx="4" fill="url(#wsky)"/><circle cx="65" cy="30" r="7" fill="#ffe49a"/><path d="M20 58 q12-10 24-2 q12-8 24 2 v16 H20 Z" fill="#9ccb86"/><rect x="16" y="12" width="68" height="64" rx="6" fill="none" stroke="#946537" stroke-width="6"/><path d="M50 14 V74 M18 44 H82" stroke="#946537" stroke-width="5"/><rect x="12" y="74" width="76" height="7" rx="3" fill="#7a5330"/></svg>',
    shelf:'<svg viewBox="0 0 100 100"><rect x="24" y="34" width="10" height="34" rx="1.5" fill="#9c3b34"/><rect x="35" y="30" width="10" height="38" rx="1.5" fill="#33506b"/><rect x="46" y="36" width="10" height="32" rx="1.5" fill="#76844a"/><rect x="57" y="32" width="10" height="36" rx="1.5" fill="#c4953c"/><rect x="68" y="40" width="9" height="28" rx="1.5" fill="#6b4a8a" transform="rotate(8 72 54)"/><rect x="18" y="68" width="64" height="8" rx="3" fill="#a9763f"/><rect x="22" y="76" width="6" height="9" fill="#7a5330"/><rect x="72" y="76" width="6" height="9" fill="#7a5330"/></svg>',
    lamp:'<svg viewBox="0 0 100 100"><ellipse cx="50" cy="40" rx="36" ry="32" fill="#fff3c8" opacity=".8"/><path d="M36 26 H64 L72 50 H28 Z" fill="#f1d59a"/><path d="M28 50 H72" stroke="#c7a25a" stroke-width="2"/><rect x="47" y="50" width="6" height="26" fill="#8d9298"/><ellipse cx="50" cy="78" rx="15" ry="4.5" fill="#70767d"/></svg>',
    plant:'<svg viewBox="0 0 100 100"><path d="M50 56 C40 30 22 34 32 54 C16 48 18 66 40 60" fill="#3f7d3a"/><path d="M50 56 C60 28 80 34 68 54 C86 48 84 68 60 60" fill="#519b48"/><path d="M50 56 C49 42 46 34 42 30" stroke="#356b32" stroke-width="2.2" fill="none"/><path d="M34 56 H66 L62 79 H38 Z" fill="#c4733f"/><rect x="32" y="52" width="36" height="7" rx="2" fill="#cf7d45"/><ellipse cx="50" cy="56" rx="15" ry="2.6" fill="#4a3326"/></svg>',
    cat:'<svg viewBox="0 0 100 100"><path d="M72 74 q20-2 14-22" fill="none" stroke="#df8a3e" stroke-width="9" stroke-linecap="round"/><ellipse cx="47" cy="66" rx="25" ry="19" fill="#e8954a"/><ellipse cx="47" cy="72" rx="11" ry="10" fill="#f6e3c8"/><circle cx="47" cy="42" r="19" fill="#e8954a"/><path d="M31 32 L34 17 L44 29 Z M63 32 L60 17 L50 29 Z" fill="#df8a3e"/><path d="M33 30 L35 22 L40 28 Z M61 30 L59 22 L54 28 Z" fill="#f2c69a"/><path d="M41 26 v6 M47 24 v7 M53 26 v6" stroke="#c4742e" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="40" cy="42" rx="3" ry="3.6" fill="#3a2c10"/><ellipse cx="54" cy="42" rx="3" ry="3.6" fill="#3a2c10"/><path d="M45 48 h4 l-2 2 z" fill="#c4633a"/><path d="M30 46 h-8 M30 50 h-7 M64 46 h8 M64 50 h7" stroke="#cdb89a" stroke-width="1.3"/></svg>'
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

  function createConfetti() {
      var container = document.getElementById("confetti-container");
      if(!container) return;
      var colors = ['#00d2d3', '#4fd17a', '#f1c40f', '#0097a7', '#ff6f3c'];
      for(var i=0; i<80; i++) {
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

        if (!cell) {
        } else if (cell.kind === "pc") {
          t.classList.add("device", "pc"); t.innerHTML = ICON_PC; 
        } else if (cell.kind === "tv") {
          t.classList.add("device", "tv"); t.innerHTML = ICON_TV;
        } else if (cell.kind === "phone") {
          t.classList.add("device", "phone"); t.innerHTML = ICON_PHONE;
        } else if (cell.kind === "laptop") {
          t.classList.add("device", "laptop"); t.innerHTML = ICON_LAPTOP;
        } else if (cell.kind === "router_slot") {
          if (!cell.filled) {
            t.classList.add("vacio");
            t.innerHTML = '<div class="slot-hint-icon">' + ICON_ROUTER + '</div>';
            t.dataset.slot = "1";
          } else {
            t.classList.add("device", "router");
            t.innerHTML = ICON_ROUTER;
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

  function showWifiIcons() {
    var devices = board.querySelectorAll('.device:not(.router)');
    devices.forEach(function(dev, index) {
      setTimeout(function() {
        var wifi = document.createElement("div");
        wifi.className = "wifi-float";
        wifi.innerHTML = SVG_WIFI;
        wifi.style.left = "50%";
        wifi.style.top = "-25px";
        wifi.style.marginLeft = "-25px";
        dev.appendChild(wifi);
        setTimeout(function() { wifi.style.opacity = "1"; }, 50);
      }, index * 200); 
    });
  }

  function checkWin() {
    if (solved) return;
    
    var routers = LEVEL.cells.filter(function (x) { return x.kind === "router_slot"; });
    if (!routers.every(function(x){ return x.filled; })) return;

    var pipes = LEVEL.cells.filter(function (x) { return x.kind === "pipe"; });
    if (!pipes.every(correct)) return;
    
    solved = true;
    board.classList.add("completo");
    
    var tip = document.querySelector(".tooltip");
    if (tip) {
        tip.classList.add("ok");
        var pTags = tip.querySelectorAll("p");
        if(pTags.length > 0) pTags[0].innerHTML = "<strong>Awesome!</strong>";
        if(pTags.length > 1) {
            pTags[1].style.color = "#0097a7";
            pTags[1].innerHTML = "The Mesh Network is broadcasting Wi-Fi perfectly to every room in the house.";
        }
    }
    
    createConfetti();
    showWifiIcons(); 
    
    setTimeout(function () { if (window.NEWin) NEWin.show(LEVEL.number); }, 5000);
  }

  function initDrag() {
    var piece = document.getElementById("pieza-arrastrable");
    if (!piece) return;
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
        }
      }
    }
    piece.addEventListener("pointerdown", function (e) {
      if (solved || piece.classList.contains("usada")) return;
      e.preventDefault();
      ghost = document.createElement("div");
      ghost.className = "ghost";
      ghost.innerHTML = ICON_ROUTER; 
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