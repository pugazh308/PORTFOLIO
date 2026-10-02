/* ===================================================================
   Interactive 3D data-network graph (Three.js)
   Draggable, auto-rotating, theme-aware, with data-flow pulses.
   Degrades gracefully: no THREE / no WebGL / reduced-motion → CSS orb.
   =================================================================== */
(function () {
    "use strict";

    var sceneEl = document.getElementById("scene");
    var canvas = document.getElementById("sceneCanvas");
    if (!sceneEl || !canvas || typeof THREE === "undefined") return;

    // WebGL capability test on a throwaway canvas.
    function webglOK() {
        try {
            var c = document.createElement("canvas");
            return !!(window.WebGLRenderingContext &&
                (c.getContext("webgl") || c.getContext("experimental-webgl")));
        } catch (e) { return false; }
    }
    if (!webglOK()) return;

    var reduce = window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var renderer;
    try {
        renderer = new THREE.WebGLRenderer({
            canvas: canvas, antialias: true, alpha: true, powerPreference: "high-performance"
        });
    } catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0, 15.5);

    var group = new THREE.Group();
    scene.add(group);

    /* ---------- palette ---------- */
    function palette() {
        var light = document.documentElement.getAttribute("data-theme") === "light";
        return light
            ? { a: 0x0ea5e9, b: 0x7c3aed, edge: 0x5b6b86, flow: 0xdb2777, edgeOp: 0.3 }
            : { a: 0x8fe0ff, b: 0xbca6ff, edge: 0x8aa0c0, flow: 0xff93d2, edgeOp: 0.22 };
    }
    var pal = palette();

    /* ---------- circular sprite ---------- */
    function sprite() {
        var c = document.createElement("canvas");
        c.width = c.height = 64;
        var g = c.getContext("2d");
        var grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
        grd.addColorStop(0, "rgba(255,255,255,1)");
        grd.addColorStop(0.3, "rgba(255,255,255,0.85)");
        grd.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = grd;
        g.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(c);
    }
    var tex = sprite();

    /* ---------- nodes (fibonacci sphere) ---------- */
    var N = window.innerWidth < 600 ? 34 : 48;
    var R = 6.3;
    var pts = [];
    var GA = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < N; i++) {
        var y = 1 - (i / (N - 1)) * 2;
        var r = Math.sqrt(Math.max(0, 1 - y * y));
        var th = i * GA;
        var rad = R * (0.72 + Math.random() * 0.33);
        pts.push(new THREE.Vector3(Math.cos(th) * r * rad, y * rad, Math.sin(th) * r * rad));
    }

    var nodePos = new Float32Array(N * 3);
    var nodeCol = new Float32Array(N * 3);
    var cA = new THREE.Color(), cB = new THREE.Color();
    function paintNodes() {
        cA.setHex(pal.a); cB.setHex(pal.b);
        for (var i = 0; i < N; i++) {
            nodePos[i * 3] = pts[i].x; nodePos[i * 3 + 1] = pts[i].y; nodePos[i * 3 + 2] = pts[i].z;
            var col = cA.clone().lerp(cB, Math.random() * 0.5 + (pts[i].y + R) / (2 * R) * 0.5);
            nodeCol[i * 3] = col.r; nodeCol[i * 3 + 1] = col.g; nodeCol[i * 3 + 2] = col.b;
        }
    }
    paintNodes();

    var nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute("position", new THREE.BufferAttribute(nodePos, 3));
    nodeGeo.setAttribute("color", new THREE.BufferAttribute(nodeCol, 3));
    var nodeMat = new THREE.PointsMaterial({
        size: 0.62, map: tex, vertexColors: true, transparent: true,
        depthWrite: false, blending: THREE.AdditiveBlending
    });
    group.add(new THREE.Points(nodeGeo, nodeMat));

    /* ---------- edges (nearest neighbours) ---------- */
    var edges = [];
    var maxLen = 5.6;
    for (var a = 0; a < N; a++) {
        var d = [];
        for (var b = 0; b < N; b++) {
            if (a === b) continue;
            d.push([b, pts[a].distanceTo(pts[b])]);
        }
        d.sort(function (p, q) { return p[1] - q[1]; });
        for (var k = 0; k < 3 && k < d.length; k++) {
            if (d[k][1] > maxLen) break;
            var j = d[k][0];
            if (a < j) edges.push([a, j]); else edges.push([j, a]);
        }
    }
    // de-duplicate
    var seen = {}, uniq = [];
    edges.forEach(function (e) {
        var key = e[0] + "-" + e[1];
        if (!seen[key]) { seen[key] = 1; uniq.push(e); }
    });
    edges = uniq;

    var linePos = new Float32Array(edges.length * 2 * 3);
    for (var e = 0; e < edges.length; e++) {
        var A = pts[edges[e][0]], B = pts[edges[e][1]];
        linePos[e * 6] = A.x; linePos[e * 6 + 1] = A.y; linePos[e * 6 + 2] = A.z;
        linePos[e * 6 + 3] = B.x; linePos[e * 6 + 4] = B.y; linePos[e * 6 + 5] = B.z;
    }
    var lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
    var lineMat = new THREE.LineBasicMaterial({ color: pal.edge, transparent: true, opacity: pal.edgeOp });
    group.add(new THREE.LineSegments(lineGeo, lineMat));

    /* ---------- data-flow pulses ---------- */
    var M = Math.min(edges.length, 16);
    var flows = [];
    for (var m = 0; m < M; m++) {
        flows.push({ e: Math.floor(Math.random() * edges.length), t: Math.random(), s: 0.004 + Math.random() * 0.008 });
    }
    var flowPos = new Float32Array(M * 3);
    var flowGeo = new THREE.BufferGeometry();
    flowGeo.setAttribute("position", new THREE.BufferAttribute(flowPos, 3));
    var flowMat = new THREE.PointsMaterial({
        size: 0.9, map: tex, color: new THREE.Color(pal.flow), transparent: true,
        depthWrite: false, blending: THREE.AdditiveBlending
    });
    var flowPoints = new THREE.Points(flowGeo, flowMat);
    group.add(flowPoints);

    function updateFlows() {
        for (var m = 0; m < M; m++) {
            var f = flows[m];
            f.t += f.s;
            if (f.t >= 1) { f.t = 0; f.e = Math.floor(Math.random() * edges.length); }
            var A = pts[edges[f.e][0]], B = pts[edges[f.e][1]];
            flowPos[m * 3] = A.x + (B.x - A.x) * f.t;
            flowPos[m * 3 + 1] = A.y + (B.y - A.y) * f.t;
            flowPos[m * 3 + 2] = A.z + (B.z - A.z) * f.t;
        }
        flowGeo.attributes.position.needsUpdate = true;
    }

    /* ---------- sizing ---------- */
    function resize() {
        var w = sceneEl.clientWidth || 1;
        var h = sceneEl.clientHeight || 1;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }
    resize();
    if ("ResizeObserver" in window) {
        new ResizeObserver(resize).observe(sceneEl);
    } else {
        window.addEventListener("resize", resize);
    }

    /* ---------- interaction ---------- */
    var rot = { x: 0.25, y: 0 };
    var vel = { x: 0, y: 0 };
    var dragging = false, lastX = 0, lastY = 0;
    var pointer = { x: 0, y: 0 };
    var AUTO = 0.0016;

    sceneEl.addEventListener("pointerdown", function (ev) {
        dragging = true; lastX = ev.clientX; lastY = ev.clientY;
        sceneEl.classList.add("dragged");
        try { sceneEl.setPointerCapture(ev.pointerId); } catch (e) {}
    });
    sceneEl.addEventListener("pointermove", function (ev) {
        var r = sceneEl.getBoundingClientRect();
        pointer.x = ((ev.clientX - r.left) / r.width - 0.5) * 2;
        pointer.y = ((ev.clientY - r.top) / r.height - 0.5) * 2;
        if (!dragging) return;
        var dx = ev.clientX - lastX, dy = ev.clientY - lastY;
        lastX = ev.clientX; lastY = ev.clientY;
        rot.y += dx * 0.006; rot.x += dy * 0.006;
        rot.x = Math.max(-0.9, Math.min(0.9, rot.x));
        vel.y = dx * 0.006; vel.x = dy * 0.006;
        if (reduce) renderOnce();
    });
    function endDrag() { dragging = false; }
    sceneEl.addEventListener("pointerup", endDrag);
    sceneEl.addEventListener("pointercancel", endDrag);
    sceneEl.addEventListener("pointerleave", function () { pointer.x = 0; pointer.y = 0; });

    /* ---------- theme sync ---------- */
    new MutationObserver(function () {
        pal = palette();
        paintNodes();
        nodeGeo.attributes.color.needsUpdate = true;
        lineMat.color.setHex(pal.edge); lineMat.opacity = pal.edgeOp;
        flowMat.color.setHex(pal.flow);
        if (reduce) renderOnce();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    /* ---------- render loop ---------- */
    function frame() {
        if (!dragging) {
            rot.x += vel.x; rot.y += vel.y;
            vel.x *= 0.92; vel.y *= 0.92;
            rot.y += AUTO;
            rot.x += (0 - rot.x) * 0.01;
        }
        group.rotation.x = rot.x;
        group.rotation.y = rot.y;
        // gentle parallax
        camera.position.x += (pointer.x * 1.4 - camera.position.x) * 0.05;
        camera.position.y += (-pointer.y * 1.4 - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0);
        updateFlows();
        renderer.render(scene, camera);
    }
    function renderOnce() {
        group.rotation.x = rot.x; group.rotation.y = rot.y;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
    }

    var rafId = null, running = false;
    function start() { if (!running && !reduce) { running = true; loop(); } }
    function stop() { running = false; if (rafId) cancelAnimationFrame(rafId); }
    function loop() { if (!running) return; frame(); rafId = requestAnimationFrame(loop); }

    // pause when off-screen or tab hidden
    if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) { start(); } else { stop(); }
            });
        }, { threshold: 0.05 }).observe(sceneEl);
    }
    document.addEventListener("visibilitychange", function () {
        if (document.hidden) stop(); else start();
    });

    // first paint
    sceneEl.classList.add("ready");
    if (reduce) { renderOnce(); } else { start(); }
})();
