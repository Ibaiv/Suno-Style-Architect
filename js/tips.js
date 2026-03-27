// tips.js - Progressive disclosure tip system (Phase 4)
// Shows contextual "did you know?" tooltips when users use the mouse for actions that have shortcuts.
(function(){
  'use strict';
  var STORAGE_KEY = 'ssa_tips_v1';

  function getCounts(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch(e){ return {}; }
  }
  function saveCounts(counts){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
  }

  function isLearned(shortcutId){
    var counts = getCounts();
    return counts[shortcutId] === 'learned' || (typeof counts[shortcutId] === 'number' && counts[shortcutId] >= 3);
  }

  function markLearned(shortcutId){
    var counts = getCounts();
    counts[shortcutId] = 'learned';
    saveCounts(counts);
  }

  function show(shortcutId, anchorEl){
    if(isLearned(shortcutId)) return;
    if(!window.Keys) return;
    var allActions = Keys.listDetailed();
    var action = allActions.find(function(a){ return a.id === shortcutId; });
    if(!action) return;
    var binding = (action.bindings && action.bindings[0]) || '';
    if(!binding) return;

    // Format binding for display
    var displayKey = binding.replace('Mod+', '\u2318').replace('Shift+', '\u21E7').replace('Alt+', '\u2325');

    // Remove any existing tip
    var existing = document.querySelector('.tip-bubble');
    if(existing) existing.remove();

    // Create tooltip
    var tip = document.createElement('div');
    tip.className = 'tip-bubble';
    tip.innerHTML = '<span class="tip-icon">\uD83D\uDCA1</span> Tipp: <kbd>' + displayKey + '</kbd> f\u00fcr ' + action.label;

    // Position near anchor
    if(anchorEl){
      var rect = anchorEl.getBoundingClientRect();
      tip.style.top = Math.max(8, rect.top - 40) + 'px';
      tip.style.left = (rect.left + rect.width / 2) + 'px';
    } else {
      tip.style.top = '20px';
      tip.style.left = '50%';
    }
    document.body.appendChild(tip);

    // Increment count
    var counts = getCounts();
    var current = typeof counts[shortcutId] === 'number' ? counts[shortcutId] : 0;
    counts[shortcutId] = current + 1;
    if(counts[shortcutId] >= 3) counts[shortcutId] = 'learned';
    saveCounts(counts);

    // Auto-dismiss after 3s
    var timer = setTimeout(function(){ if(tip.parentNode) tip.remove(); }, 3000);

    // Click/key dismiss
    var dismiss = function(){
      clearTimeout(timer);
      if(tip.parentNode) tip.remove();
      document.removeEventListener('keydown', dismiss);
    };
    document.addEventListener('keydown', dismiss, { once: true });
    tip.addEventListener('click', dismiss);
  }

  // First-Visit Onboarding Banner (P4-4)
  function initOnboarding(){
    if(localStorage.getItem('ssa_onboarding_seen')) return;
    var banner = document.createElement('div');
    banner.id = 'onboarding-banner';
    banner.innerHTML = 'Power User? Dr\u00fccke <kbd>Shift+?</kbd> f\u00fcr alle Tastenk\u00fcrzel.';
    document.body.appendChild(banner);

    var dismiss = function(){
      banner.style.opacity = '0';
      setTimeout(function(){ if(banner.parentNode) banner.remove(); }, 500);
      localStorage.setItem('ssa_onboarding_seen', '1');
    };
    banner.addEventListener('click', dismiss);
    setTimeout(dismiss, 10000);
  }

  document.addEventListener('DOMContentLoaded', initOnboarding);

  window.Tips = { show: show, markLearned: markLearned, isLearned: isLearned };
})();
