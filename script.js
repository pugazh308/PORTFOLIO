/* ===================================================================
   Portfolio interactions: theme toggle, mobile nav, scroll reveal
   =================================================================== */
(function () {
    "use strict";

    var root = document.documentElement;
    var STORE_KEY = "pd-theme";

    /* ---------- Theme ---------- */
    function storedTheme() {
        try { return localStorage.getItem(STORE_KEY); } catch (e) { return null; }
    }
    function saveTheme(value) {
        try { localStorage.setItem(STORE_KEY, value); } catch (e) { /* ignore */ }
    }

    // Apply saved preference, else fall back to the OS setting.
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
        // Close the menu after tapping a link.
        links.addEventListener("click", function (e) {
            if (e.target.tagName === "A") {
                links.classList.remove("is-open");
                burger.setAttribute("aria-expanded", "false");
            }
        });
    }

    /* ---------- Scroll reveal ---------- */
    var revealEls = document.querySelectorAll(".reveal");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

    /* ---------- Footer year ---------- */
    var yearEl = document.getElementById("year");
    if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }
})();
