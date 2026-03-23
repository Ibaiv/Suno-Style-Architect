/* ──────────────────────────────────────────────────────────────────────
   Layout Resize — Vertical drag handle for top/bottom panel split
   Grips sit left & right of the collapse toggle.  Drag vertically to
   resize;  double-click to reset to CSS default.  Persisted via
   localStorage.
   ────────────────────────────────────────────────────────────────────── */
(function () {
    'use strict';

    var STORAGE_KEY = 'ssa_layout_split_v1';
    var MIN_TOP_PCT = 25;
    var MAX_TOP_PCT = 85;

    /* ── DOM refs (set in init) ── */
    var layout, topRow;

    /* ── Drag state ── */
    var dragging = false;
    var startY = 0;
    var startTopFrac = 0;   // 0..1
    var rafId = 0;
    var pendingTop = 0;

    /* ── Helpers ── */

    /** Apply a top-percentage split to the grid */
    function applySplit(topPct) {
        var bot = 100 - topPct;
        layout.style.gridTemplateRows =
            'minmax(0,' + topPct + 'fr) minmax(0,' + bot + 'fr)';
    }

    /** Remove inline override so CSS default / media-query takes over */
    function clearSplit() {
        layout.style.gridTemplateRows = '';
    }

    /** Persist to localStorage */
    function saveSplit(topPct) {
        try { localStorage.setItem(STORAGE_KEY, String(Math.round(topPct))); }
        catch (_) { /* quota / private-mode — ignore */ }
    }

    /** Restore saved split (if any) */
    function restoreSplit() {
        var raw;
        try { raw = localStorage.getItem(STORAGE_KEY); } catch (_) { return; }
        if (raw === null) return;

        var val = parseFloat(raw);
        if (!isNaN(val) && val >= MIN_TOP_PCT && val <= MAX_TOP_PCT) {
            applySplit(val);
        }
    }

    /* ── Pointer handlers ── */

    function onPointerDown(e) {
        if (e.button !== 0) return;                          // left only
        if (layout.classList.contains('bd-collapsed')) return; // no resize when collapsed

        e.preventDefault();
        e.stopPropagation();
        dragging = true;
        startY = e.clientY;

        // Current fraction from rendered sizes
        var layoutH = layout.clientHeight;
        startTopFrac = layoutH > 0
            ? topRow.getBoundingClientRect().height / layoutH
            : 0.67;

        document.addEventListener('pointermove', onPointerMove, { passive: false });
        document.addEventListener('pointerup', onPointerUp);
        document.addEventListener('pointercancel', onPointerUp);

        layout.classList.add('bd-resize-active');
        document.body.classList.add('bd-body-resizing');
    }

    function onPointerMove(e) {
        if (!dragging) return;
        e.preventDefault();

        var layoutH = layout.clientHeight;
        if (layoutH <= 0) return;

        var dy = e.clientY - startY;
        var newTop = (startTopFrac + dy / layoutH) * 100;
        newTop = Math.max(MIN_TOP_PCT, Math.min(MAX_TOP_PCT, newTop));
        pendingTop = newTop;

        // Throttle DOM writes to rAF
        if (!rafId) {
            rafId = requestAnimationFrame(function () {
                applySplit(pendingTop);
                rafId = 0;
            });
        }
    }

    function onPointerUp() {
        if (!dragging) return;
        dragging = false;

        if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }

        // Compute final value from actual rendered size
        var layoutH = layout.clientHeight;
        var finalTop;
        if (layoutH > 0) {
            finalTop = (topRow.getBoundingClientRect().height / layoutH) * 100;
            finalTop = Math.max(MIN_TOP_PCT, Math.min(MAX_TOP_PCT, Math.round(finalTop)));
        } else {
            finalTop = 67;
        }

        applySplit(finalTop);
        saveSplit(finalTop);

        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        document.removeEventListener('pointercancel', onPointerUp);

        layout.classList.remove('bd-resize-active');
        document.body.classList.remove('bd-body-resizing');
    }

    /** Double-click → reset to default CSS layout */
    function onDoubleClick(e) {
        if (layout.classList.contains('bd-collapsed')) return;
        e.preventDefault();
        clearSplit();
        try { localStorage.removeItem(STORAGE_KEY); } catch (_) { /* ignore */ }
    }

    /* ── Init ── */

    function init() {
        layout = document.querySelector('.app-main-layout');
        if (!layout) return;

        topRow = layout.querySelector('.app-top-row');
        if (!topRow) return;

        // Restore any previously saved split
        restoreSplit();

        // Attach handlers to both grip elements
        var grips = document.querySelectorAll('.bd-resize-grip');
        for (var i = 0; i < grips.length; i++) {
            grips[i].addEventListener('pointerdown', onPointerDown);
            grips[i].addEventListener('dblclick', onDoubleClick);
        }
    }

    /* ── Bootstrap ── */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
