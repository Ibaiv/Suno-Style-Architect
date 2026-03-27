// layout_detect.js - QWERTZ keyboard detection (Phase 2)
// Detects keyboard layout for cheat sheet rendering and dual-binding labels.
(function(){
  'use strict';
  let _layout = null; // 'qwertz' | 'qwerty'

  async function detect(){
    if(_layout) return _layout;
    // Primary: Keyboard API (Chrome 69+)
    if(navigator.keyboard && typeof navigator.keyboard.getLayoutMap === 'function'){
      try {
        const map = await navigator.keyboard.getLayoutMap();
        // On QWERTZ keyboards, KeyY maps to 'z' and KeyZ maps to 'y'
        const keyY = map.get('KeyY');
        if(keyY === 'z' || keyY === 'Z'){
          _layout = 'qwertz';
          return _layout;
        }
        _layout = 'qwerty';
        return _layout;
      } catch(e){
        // Permission denied or not supported — fall through to heuristic
      }
    }
    // Fallback: navigator.languages heuristic for German-speaking regions
    const langs = navigator.languages || [navigator.language || ''];
    const isDE = langs.some(function(l){
      var low = (l || '').toLowerCase();
      return low === 'de' || low.startsWith('de-');
    });
    _layout = isDE ? 'qwertz' : 'qwerty';
    return _layout;
  }

  function getLayout(){
    return _layout || 'qwerty';
  }

  function isQWERTZ(){
    return getLayout() === 'qwertz';
  }

  // Auto-detect on load
  document.addEventListener('DOMContentLoaded', function(){
    detect();
  });

  window.KeyboardLayout = { detect: detect, getLayout: getLayout, isQWERTZ: isQWERTZ };
})();
