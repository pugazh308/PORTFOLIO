/* ===================================================================
   Portfolio interactions — Dark Editorial
   reveal · nav scroll state · accessible mobile menu · scrollspy ·
   count-up · rotator · pipeline animation
   No theme toggle, no spotlight, no magnetic effects.
   =================================================================== */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function revealAll() {
    var els = document.querySelectorAll(".reveal:not(.is-visible)");
    for (var i = 0; i < els.length; i++) els[i].classList.add("is-visible");
  }

  /* ---------- Scroll reveal (fail-open) ---------- */
  try {
    var revealEls = document.querySelectorAll(".reveal");
    if (reduce || !("IntersectionObserver" in window)) {
      revealAll();
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  } catch (e) { revealAll(); }

  /* ---------- Nav scrolled state ---------- */
  try {
    var nav = document.getElementById("top");
    if (nav) {
      var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 24); };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }
  } catch (e) {}

  /* ---------- Accessible mobile menu ---------- */
  try {
    var burger = document.getElementById("navBurger");
    var links = document.getElementById("navLinks");
    var navEl = document.getElementById("top");
    if (burger && links && navEl) {
      var focusables, firstF, lastF;

      var openMenu = function () {
        navEl.classList.add("open");
        burger.setAttribute("aria-expanded", "true");
        document.body.classList.add("nav-lock");
        focusables = links.querySelectorAll("a");
        if (focusables.length) {
          firstF = focusables[0]; lastF = focusables[focusables.length - 1];
          firstF.focus();
        }
        document.addEventListener("keydown", onKey);
      };
      var closeMenu = function (returnFocus) {
        navEl.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-lock");
        document.removeEventListener("keydown", onKey);
        if (returnFocus) burger.focus();
      };
      var onKey = function (e) {
        if (e.key === "Escape") { closeMenu(true); return; }
        if (e.key === "Tab" && focusables && focusables.length) {
          if (e.shiftKey && document.activeElement === firstF) { e.preventDefault(); lastF.focus(); }
          else if (!e.shiftKey && document.activeElement === lastF) { e.preventDefault(); firstF.focus(); }
        }
      };

      burger.addEventListener("click", function () {
        if (navEl.classList.contains("open")) closeMenu(false); else openMenu();
      });
      links.addEventListener("click", function (e) {
        if (e.target.closest("a")) closeMenu(false);
      });
      // if resized back to desktop, ensure unlocked
      window.addEventListener("resize", function () {
        if (window.innerWidth >= 900 && navEl.classList.contains("open")) closeMenu(false);
      });
    }
  } catch (e) {}

  /* ---------- Scrollspy ---------- */
  try {
    var anchors = Array.prototype.slice.call(document.querySelectorAll('.nav__links a[href^="#"]'));
    var sections = anchors
      .map(function (a) { var id = a.getAttribute("href").slice(1); return id ? document.getElementById(id) : null; })
      .filter(Boolean);
    if (sections.length && "IntersectionObserver" in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            anchors.forEach(function (a) {
              a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id);
            });
          }
        });
      }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
      sections.forEach(function (s) { spy.observe(s); });
    }
  } catch (e) {}

  /* ---------- Count-up ---------- */
  try {
    var animateCount = function (el) {
      var target = parseFloat(el.getAttribute("data-count")) || 0;
      var suffix = el.getAttribute("data-suffix") || "";
      if (reduce) { el.textContent = target + suffix; return; }
      var dur = 1200, start = null;
      var step = function (ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    var statEls = document.querySelectorAll(".stat__num");
    if ("IntersectionObserver" in window && !reduce) {
      var sObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { animateCount(entry.target); sObs.unobserve(entry.target); }
        });
      }, { threshold: 0.6 });
      statEls.forEach(function (el) { sObs.observe(el); });
    }
  } catch (e) {}

  /* ---------- Rotating hero word ---------- */
  try {
    var rotator = document.querySelector(".rotator__word");
    if (rotator && !reduce) {
      var words = ["reliable pipelines", "clean data models", "trustworthy insight", "scalable ELT flows"];
      var idx = 0;
      setInterval(function () {
        idx = (idx + 1) % words.length;
        rotator.style.transition = "opacity .25s ease";
        rotator.style.opacity = "0";
        setTimeout(function () { rotator.textContent = words[idx]; rotator.style.opacity = "1"; }, 250);
      }, 3000);
    }
  } catch (e) {}

  /* ---------- Diagram animations (pipeline + architecture) ---------- */
  try {
    var diagrams = document.querySelectorAll("#pipeline, .arch");
    if (diagrams.length && !reduce && "IntersectionObserver" in window) {
      var pObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add("is-animating"); pObs.unobserve(entry.target); }
        });
      }, { threshold: 0.3 });
      diagrams.forEach(function (el) { pObs.observe(el); });
    }
  } catch (e) {}

  /* ---------- Pull-cord theme toggle ---------- */
  try {
    var cord = document.getElementById("cord");
    var flash = document.getElementById("flash");
    var rootEl = document.documentElement;
    var themeMeta = document.querySelector('meta[name="theme-color"]');
    function isLight() { return rootEl.getAttribute("data-theme") === "light"; }
    function syncCord() { if (cord) cord.setAttribute("aria-pressed", isLight() ? "true" : "false"); }
    syncCord();
    if (cord) {
      cord.addEventListener("click", function () {
        var next = isLight() ? "dark" : "light";
        if (next === "light") rootEl.setAttribute("data-theme", "light");
        else rootEl.removeAttribute("data-theme");
        try { localStorage.setItem("pd-theme", next); } catch (e) {}
        syncCord();
        if (themeMeta) themeMeta.setAttribute("content", next === "light" ? "#F4F5EF" : "#0B0D0C");
        // pull + flash animation (skipped under reduced motion via CSS)
        cord.classList.remove("pulling"); void cord.offsetWidth; cord.classList.add("pulling");
        if (flash) { flash.classList.remove("on"); void flash.offsetWidth; flash.classList.add("on"); }
      });
      cord.addEventListener("animationend", function (e) { if (e.animationName === "cordPull") cord.classList.remove("pulling"); });
      if (flash) flash.addEventListener("animationend", function () { flash.classList.remove("on"); });
    }
  } catch (e) {}

  /* ---------- Footer year ---------- */
  try {
    var yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  } catch (e) {}
})();
