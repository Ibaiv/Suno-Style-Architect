/**
 * vision_focus.js — Vision Focus Mode (Issue #112)
 *
 * On Desktop/XL, toggles the left Vision card out of the layout so that
 * "Your Masterpiece" takes over the freed space.  The right creative
 * stack stays visible.
 *
 * Toggle: Option+A  (registered via Keys.register)
 * Visible trigger: button injected into the Masterpiece card header
 * Persistence: localStorage key 'ssa_vision_focus_v1'
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'ssa_vision_focus_v1';
  var STATE_CLASS = 'vision-focus-active';
  var TRANS_CLASS = 'vision-focus-transitioning';
  var ANIM_MS = 420; // must match CSS transition duration

  var layout, topRow, visionCard, resultCard;
  var active = false;
  var transTimer = null;

  /* ── Helpers ──────────────────────────────────────── */

  function isXL() {
    return window.matchMedia('(min-width: 1280px)').matches;
  }

  function save(val) {
    try { localStorage.setItem(STORAGE_KEY, val ? '1' : '0'); } catch (_) { }
  }

  function load() {
    try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch (_) { return false; }
  }

  /* ── Accessibility: remove hidden card from tab order ── */

  function lockFocus(card) {
    if (!card) return;
    card.setAttribute('aria-hidden', 'true');
    // Use inert if supported, otherwise manual tabindex
    if ('inert' in HTMLElement.prototype) {
      card.inert = true;
    } else {
      var els = card.querySelectorAll('a,button,input,textarea,select,[tabindex]');
      for (var i = 0; i < els.length; i++) {
        els[i].setAttribute('data-vf-tabindex', els[i].getAttribute('tabindex') || '');
        els[i].setAttribute('tabindex', '-1');
      }
    }
  }

  function unlockFocus(card) {
    if (!card) return;
    card.removeAttribute('aria-hidden');
    if ('inert' in HTMLElement.prototype) {
      card.inert = false;
    } else {
      var els = card.querySelectorAll('[data-vf-tabindex]');
      for (var i = 0; i < els.length; i++) {
        var prev = els[i].getAttribute('data-vf-tabindex');
        if (prev === '') {
          els[i].removeAttribute('tabindex');
        } else {
          els[i].setAttribute('tabindex', prev);
        }
        els[i].removeAttribute('data-vf-tabindex');
      }
    }
  }

  /* ── Toggle Button (visible trigger) ─────────────── */

  function updateBtn(on) {
    var btn = document.getElementById('vision-focus-toggle');
    if (!btn) return;
    btn.classList.toggle('vf-active', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.title = on
      ? 'Vision einblenden (⌥A)'
      : 'Fokus-Modus: Vision ausblenden (⌥A)';
  }

  function createBtn() {
    // Inject into the Masterpiece card header (the flex row with h2 + undo controls)
    var header = resultCard && resultCard.querySelector('.flex.items-center.justify-between');
    if (!header) return;

    var btn = document.createElement('button');
    btn.id = 'vision-focus-toggle';
    btn.className = 'vision-focus-btn';
    btn.setAttribute('aria-pressed', 'false');
    btn.title = 'Fokus-Modus: Vision ausblenden (⌥A)';
    // Two-panel ↔ single-panel icon via CSS toggling
    btn.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">' +
        '<rect class="vf-icon-split" x="1.5" y="2.5" width="5" height="11" rx="1.5"/>' +
        '<rect class="vf-icon-split" x="9.5" y="2.5" width="5" height="11" rx="1.5"/>' +
        '<rect class="vf-icon-expand" x="1.5" y="2.5" width="13" height="11" rx="1.5"/>' +
      '</svg>';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      toggle();
    });

    // Insert into the header actions area (issue #107 moved controls into .meister-header-actions)
    var actionsArea = header.querySelector('.meister-header-actions');
    if (actionsArea) {
      // Insert before the divider that separates tool buttons from undo controls
      var divider = actionsArea.querySelector('.meister-header-divider');
      if (divider) {
        actionsArea.insertBefore(btn, divider);
      } else {
        actionsArea.insertBefore(btn, actionsArea.firstChild);
      }
    } else {
      // Fallback for layouts without .meister-header-actions
      var undoControls = header.querySelector('.bd-undo-controls');
      if (undoControls && undoControls.parentNode === header) {
        header.insertBefore(btn, undoControls);
      } else {
        header.appendChild(btn);
      }
    }
  }

  /* ── Activate / Deactivate ───────────────────────── */

  function activate(skipAnim) {
    if (!layout || !visionCard) return;
    if (!isXL()) return;
    active = true;
    save(true);

    if (skipAnim) {
      layout.classList.add(STATE_CLASS);
      lockFocus(visionCard);
      updateBtn(true);
      return;
    }

    // Clear any pending transition timer
    if (transTimer) { clearTimeout(transTimer); transTimer = null; }

    layout.classList.add(TRANS_CLASS);
    // Force reflow so the browser picks up the transition class
    void layout.offsetHeight;
    layout.classList.add(STATE_CLASS);
    lockFocus(visionCard);
    updateBtn(true);

    transTimer = setTimeout(function () {
      layout.classList.remove(TRANS_CLASS);
      transTimer = null;
    }, ANIM_MS);
  }

  function deactivate(skipAnim) {
    if (!layout || !visionCard) return;
    active = false;
    save(false);

    if (skipAnim) {
      layout.classList.remove(STATE_CLASS);
      unlockFocus(visionCard);
      updateBtn(false);
      return;
    }

    if (transTimer) { clearTimeout(transTimer); transTimer = null; }

    layout.classList.add(TRANS_CLASS);
    void layout.offsetHeight;
    layout.classList.remove(STATE_CLASS);
    unlockFocus(visionCard);
    updateBtn(false);

    transTimer = setTimeout(function () {
      layout.classList.remove(TRANS_CLASS);
      transTimer = null;
    }, ANIM_MS);
  }

  function writeIdeaInput(value, opts) {
    var el = document.getElementById('idea-input');
    if (!el) return;
    if (active) deactivate();
    el.value = value || '';
    el.dispatchEvent(new Event('input', { bubbles: true }));
    if (opts && opts.pulse) {
      el.classList.add('pulse');
      setTimeout(function () { el.classList.remove('pulse'); }, 500);
    }
  }

  function toggle() {
    if (active) { deactivate(); } else { activate(); }
  }

  /* ── Keyboard shortcut ───────────────────────────── */

  function registerShortcut() {
    if (!window.Keys) return;
    Keys.register({
      id: 'vision.focus',
      label: 'Fokus-Modus: Vision ein/aus',
      scope: 'global',
      bindings: ['Alt+a'],
      run: toggle
    });
  }

  /* ── Init ─────────────────────────────────────────── */

  function init() {
    layout = document.querySelector('.app-main-layout');
    if (!layout) return;

    topRow = layout.querySelector('.app-top-row');
    if (!topRow) return;

    visionCard = topRow.querySelector('.app-idea-card');
    resultCard = topRow.querySelector('.app-result-card');
    if (!visionCard || !resultCard) return;

    try { createBtn(); } catch (_) { /* button injection is optional */ }
    registerShortcut();

    // Restore persisted state (without animation)
    if (load() && isXL()) {
      activate(true);
    }

    // Respond to viewport changes: deactivate if below XL, restore if back to XL
    var mq = window.matchMedia('(min-width: 1280px)');
    mq.addEventListener('change', function (e) {
      if (!e.matches && active) {
        deactivate(true);
      } else if (e.matches && load()) {
        activate(true);
      }
    });
  }

  // Expose public API
  window.VisionFocus = { toggle: toggle, activate: activate, deactivate: deactivate, writeIdeaInput: writeIdeaInput };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
