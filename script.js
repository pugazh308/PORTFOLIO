/* ===================================================================
   Portfolio interactions — Aurora Glass
   theme · mobile nav · reveal · spotlight · count-up · rotator ·
   scroll progress · scrollspy · magnetic buttons
   =================================================================== */
(function () {
    "use strict";

    var root = document.documentElement;
    var STORE_KEY = "pd-theme";
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- Theme ---------- */
    function storedTheme() { try { return localStorage.getItem(STORE_KEY); } catch (e) { return null; } }
    function saveTheme(v) { try { localStorage.setItem(STORE_KEY, v); } catch (e) {} }

    var saved = storedTheme();
    if (saved === "light" || saved === "dark") {
        root.setAttribute("data-theme", saved);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
        root.setAttribute("data-theme", "light");
    }

    var toggle = document.getElementById("themeToggle");
    if (toggle) {
        toggle.addEventListener("click", function () {
            var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
            root.setAttribute("data-theme", next);
            saveTheme(next);
        });
    }

    /* ---------- Mobile nav ---------- */
    var burger = document.getElementById("navBurger");
    var links = document.getElementById("navLinks");
    if (burger && links) {
        burger.addEventListener("click", function () {
            var open = links.classList.toggle("is-open");
            burger.setAttribute("aria-expanded", open ? "true" : "false");
        });
        links.addEventListener("click", function (e) {
            if (e.target.tagName === "A") {
                links.classList.remove("is-open");
                burger.setAttribute("aria-expanded", "false");
            }
        });
    }

    /* ---------- Scroll reveal ---------- */
    var revealEls = document.querySelectorAll(".reveal");
    if (reduce || !("IntersectionObserver" in window)) {
        revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
        revealEls.forEach(function (el) { io.observe(el); });
    }

    /* ---------- Cursor spotlight ---------- */
    if (!reduce && window.matchMedia("(pointer: fine)").matches) {
        document.querySelectorAll(".spotlight").forEach(function (card) {
            card.addEventListener("pointermove", function (e) {
                var r = card.getBoundingClientRect();
                card.style.setProperty("--mx", (e.clientX - r.left) + "px");
                card.style.setProperty("--my", (e.clientY - r.top) + "px");
            });
        });
    }

    /* ---------- Count-up stats ---------- */
    function animateCount(el) {
        var target = parseFloat(el.getAttribute("data-count")) || 0;
        var suffix = el.getAttribute("data-suffix") || "";
        if (reduce) { el.textContent = target + suffix; return; }
        var dur = 1400, start = null;
        function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
            el.textContent = Math.round(target * eased) + suffix;
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }
    var statEls = document.querySelectorAll(".stat__num");
    if ("IntersectionObserver" in window && !reduce) {
        var sObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) { animateCount(entry.target); sObs.unobserve(entry.target); }
            });
        }, { threshold: 0.6 });
        statEls.forEach(function (el) { sObs.observe(el); });
    } else {
        statEls.forEach(animateCount);
    }

    /* ---------- Rotating hero word ---------- */
    var rotator = document.querySelector(".rotator__word");
    if (rotator && !reduce) {
        var words = ["reliable pipelines", "clean data models", "trustworthy insight", "scalable ELT flows"];
        var i = 0;
        setInterval(function () {
            rotator.classList.add("swap");
            setTimeout(function () {
                i = (i + 1) % words.length;
                rotator.textContent = words[i];
                rotator.classList.remove("swap");
                rotator.classList.add("swap-in");
                setTimeout(function () { rotator.classList.remove("swap-in"); }, 500);
            }, 400);
        }, 2800);
    }

    /* ---------- Scroll progress ---------- */
    var bar = document.getElementById("progress");
    if (bar) {
        var ticking = false;
        window.addEventListener("scroll", function () {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(function () {
                var h = document.documentElement;
                var max = h.scrollHeight - h.clientHeight;
                bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
                ticking = false;
            });
        }, { passive: true });
    }

    /* ---------- Scrollspy ---------- */
    var navAnchors = Array.prototype.slice.call(document.querySelectorAll('.nav__links a[href^="#"]'));
    var sections = navAnchors
        .map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); })
        .filter(Boolean);
    if (sections.length && "IntersectionObserver" in window) {
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    navAnchors.forEach(function (a) {
                        a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id);
                    });
                }
            });
        }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
        sections.forEach(function (s) { spy.observe(s); });
    }

    /* ---------- Magnetic buttons ---------- */
    if (!reduce && window.matchMedia("(pointer: fine)").matches) {
        document.querySelectorAll(".magnetic").forEach(function (el) {
            el.addEventListener("pointermove", function (e) {
                var r = el.getBoundingClientRect();
                var mx = e.clientX - (r.left + r.width / 2);
                var my = e.clientY - (r.top + r.height / 2);
                el.style.transform = "translate(" + mx * 0.18 + "px," + my * 0.28 + "px)";
            });
            el.addEventListener("pointerleave", function () { el.style.transform = ""; });
        });
    }

    /* ---------- Footer year ---------- */
    var yearEl = document.getElementById("year");
    if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }
})();
