
(function () {
  "use strict";

  var zonesFilled = 0;
  var totalZones = 6; 

  function clickSfx() { 
      if (window.NEAudio) window.NEAudio.playClick(); 
  }

  function createConfetti() {
      var container = document.getElementById("confetti-container");
      if(!container) return;
      var colors = ['#f1c40f', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6'];
      
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

  function triggerVictoryEffects() {

    var winLines = document.querySelector('.win-lines');
      if (winLines) winLines.classList.add('show');
      
      var pcTriste = document.getElementById('pc-triste');
      var pcFeliz = document.getElementById('pc-feliz');
      if(pcTriste) pcTriste.style.opacity = "0";
      if(pcFeliz) pcFeliz.style.opacity = "1";
      
      var semTriste = document.getElementById('semaforo-triste');
      var semFeliz = document.getElementById('semaforo-feliz');
      var luzRoja = document.getElementById('luz-roja');
      var luzVerde = document.getElementById('luz-verde');
      if(semTriste) semTriste.style.opacity = "0";
      if(semFeliz) semFeliz.style.opacity = "1";
      if(luzRoja) luzRoja.style.fill = "#555";
      if(luzVerde) luzVerde.style.fill = "#2ecc71"; 
      
      document.querySelectorAll('.placed-device').forEach(dev => {
          dev.classList.add('active');
      });

      createConfetti();
      var tip = document.querySelector(".tooltip");
      if (tip) {
          tip.classList.add("ok");
          var pTags = tip.querySelectorAll("p");
          if(pTags.length > 0) pTags[0].innerHTML = "<strong>Amazing Job!</strong>";
          if(pTags.length > 1) {
              pTags[1].style.color = "#0097a7";
              pTags[1].innerHTML = "The whole city is online. You are a true Net Explorer!";
          }
      }
      
      setTimeout(function () { if (window.NEWin) NEWin.show(10); }, 6500);
  }

  function initDrag() {
    var pieces = document.querySelectorAll(".pieza");
    var ghost = null;
    var ghostRef = null;

    function move(e) { 
        if(ghost) { 
            ghost.style.left = e.clientX + "px"; 
            ghost.style.top = e.clientY + "px"; 
        } 
    }

    function zoneUnder(e) {
      if(ghost) ghost.style.pointerEvents = 'none';
      var el = document.elementFromPoint(e.clientX, e.clientY);
      if(ghost) ghost.style.pointerEvents = 'auto';
      return el ? el.closest('.drop-zone') : null;
    }

    function onMove(e) {
      move(e);
      document.querySelectorAll(".drop-zone.resaltar").forEach(z => z.classList.remove("resaltar"));
      var z = zoneUnder(e); 
      if (z && !z.classList.contains("filled")) {
          z.classList.add("resaltar");
      }
    }

    function onUp(e) {
      var z = zoneUnder(e);
      
      if (ghost) { ghost.remove(); ghost = null; }
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      
      document.querySelectorAll(".drop-zone.resaltar").forEach(el => el.classList.remove("resaltar"));
      
      if (z && !z.classList.contains("filled")) {
        var requiredType = z.dataset.accept;
        var droppedType = ghostRef.dataset.type;

        if (requiredType === droppedType) {
            z.classList.add("filled");
            
            var contentHtml = '<div class="placed-device">' + ghostRef.innerHTML + '</div>';
            if(droppedType === "node") {
                contentHtml += '<div class="coverage"></div>';
            }
            z.innerHTML = contentHtml;

            ghostRef.classList.add("usada"); 
            zonesFilled++;
            clickSfx(); 
            
            if (zonesFilled === totalZones) {
                triggerVictoryEffects();
            }
        } else {
            z.style.borderColor = "#e74c3c";
            setTimeout(() => { if(!z.classList.contains("filled")) z.style.borderColor = "rgba(255,255,255,0.45)"; }, 500);
            
            var tipP = document.querySelector(".tooltip p:nth-child(2)");
            var original = tipP.innerHTML;
            tipP.innerHTML = "<span style='color:#e74c3c'>❌ Oops! Look closely at the shape, that doesn't fit here.</span>";
            setTimeout(function(){ tipP.innerHTML = original; }, 3000);
        }
      }
    }
    
    pieces.forEach(function(piece) {
      piece.addEventListener("pointerdown", function (e) {
        if (piece.classList.contains("usada") || zonesFilled === totalZones) return;
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

  function initProgress() {
    var prog = document.getElementById("progreso");
    if (!prog) return;
    for (var i = 1; i <= 10; i++) {
      var d = document.createElement("div");
      d.className = "progreso-dot" + (i === 10 ? " activo" : "");
      prog.appendChild(d);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initProgress();
    initDrag();
  });
})();