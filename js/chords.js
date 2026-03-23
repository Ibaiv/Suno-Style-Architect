// chords.js - Two-key chords, modal keyboard enhancements, Future Lab + Nav chords (Phase 2+3)
// Chord initiation now routes through Keys.register(). Active-chord keys route via keys.js chord-mode check.
(function(){
  let chord = null; // { mode: 'expert'|'klug'|'future'|'nav', deadline: ts, page: 0, scopeToken: null }
  const CHORD_TTL = 1200; // ms
  const NAV_TTL = 800;    // ms — shorter for navigation chord
  const MAX_KEYS = 9;

  const expertButtons = [
    '#producer-refine-button',
    '#musician-refine-button',
    '#composer-refine-button',
    '#dj-refine-button',
    '#avantgarde-refine-button',
    '#minimalist-refine-button',
    '#vocal-harmony-refine-button',
    '#ethno-refine-button',
    '#sound-engineer-button'
  ];

  const klugButtons = [
    '#genre-mixer-button',
    '#mood-analyzer-button',
    '#hook-generator-button',
    '#song-structure-button',
    '#vibe-enhancer-button',
    '#artist-suggester-button',
    '#tempo-finder-button',
    '#production-finish-button',
    '#vocal-stylist-button',
    '#groove-meister-button',
    '#performance-coach-button',
    '#effect-chain-button'
  ];

  // Phase 2 (P2-5): Future Lab tools
  const futureLabButtons = [
    '#adaptive-flow-button',
    '#ai-collab-button',
    '#story-arc-button',
    '#narrative-chapters-button',
    '#immersive-space-button',
    '#human-touch-button',
    '#release-forecast-button'
  ];

  // Phase 2 (P2-6): Navigation targets
  const navTargets = {
    d: { label: 'Dashboard', action: function(){ var bd = document.querySelector('.bottom-dashboard'); if(bd){ bd.scrollIntoView({ behavior:'smooth', block:'start' }); bd.focus(); } } },
    c: { label: 'Creative Cosmos', action: function(){ var tile = document.getElementById('idea-starter-tile'); if(tile) tile.click(); } },
    s: { label: 'Style Sync', action: function(){ var tile = document.getElementById('style-sync-tile'); if(tile) tile.click(); } },
    t: { label: 'Kachel-System', action: function(){ var bd = document.querySelector('.bottom-dashboard'); if(bd) bd.focus(); } }
  };

  function buttonsFor(mode){
    if(mode === 'expert') return expertButtons;
    if(mode === 'klug') return klugButtons;
    if(mode === 'future') return futureLabButtons;
    return [];
  }

  function hasExpertTargets(){
    return expertButtons.some(function(sel){ return !!document.querySelector(sel); });
  }
  function hasKlugTargets(){
    return klugButtons.some(function(sel){ return !!document.querySelector(sel); });
  }
  function hasFutureTargets(){
    return futureLabButtons.some(function(sel){ return !!document.querySelector(sel); });
  }

  function startChord(mode){
    var ttl = mode === 'nav' ? NAV_TTL : CHORD_TTL;
    chord = { mode: mode, deadline: Date.now() + ttl, page: 0, scopeToken: null };
    // Phase 3 (P3-6): Push scope for chord-builder
    if(window.ScopeStack){
      chord.scopeToken = ScopeStack.push('chord-builder');
    }
    if(mode === 'nav'){
      showNavKeycaps();
    } else {
      showKeycaps(mode);
    }
    setTimeout(function(){ if(chord && Date.now() > chord.deadline) cancelChord(); }, ttl + 50);
  }

  function cancelChord(){
    if(chord && chord.scopeToken && window.ScopeStack){
      ScopeStack.pop(chord.scopeToken);
    }
    chord = null;
    hideKeycaps();
  }

  function showKeycaps(mode){
    hideKeycaps();
    var arr = buttonsFor(mode);
    var page = chord ? (chord.page || 0) : 0;
    var start = page * MAX_KEYS;
    var end = Math.min(start + MAX_KEYS, arr.length);
    arr.slice(start, end).forEach(function(sel, i){
      var btn = document.querySelector(sel);
      if(!btn) return;
      btn.classList.add('keycap-target', 'chord-highlight');
      var cap = document.createElement('span');
      cap.className = 'keycap-badge keycap-badge-lg';
      cap.textContent = String(i + 1);
      cap.dataset.keycap = '1';
      btn.appendChild(cap);
    });
    var hint = document.getElementById('chord-hint');
    if(hint){ hint.classList.add('show'); }
  }

  function showNavKeycaps(){
    hideKeycaps();
    // Show keycap badges on nav targets if their elements exist
    var targets = {
      d: '.bottom-dashboard',
      c: '#idea-starter-tile',
      s: '#style-sync-tile',
      t: '.bottom-dashboard'
    };
    Object.keys(targets).forEach(function(key){
      var el = document.querySelector(targets[key]);
      if(!el) return;
      // Avoid duplicate badges
      if(el.querySelector('.keycap-badge[data-keycap="nav"]')) return;
      el.classList.add('keycap-target', 'chord-highlight');
      var cap = document.createElement('span');
      cap.className = 'keycap-badge keycap-badge-lg';
      cap.textContent = key.toUpperCase();
      cap.dataset.keycap = 'nav';
      el.style.position = el.style.position || 'relative';
      el.appendChild(cap);
    });
    var hint = document.getElementById('chord-hint');
    if(hint){ hint.classList.add('show'); }
  }

  function hideKeycaps(){
    document.querySelectorAll('.keycap-badge').forEach(function(el){ el.remove(); });
    document.querySelectorAll('.keycap-target').forEach(function(el){
      el.classList.remove('keycap-target', 'chord-highlight');
    });
    var hint = document.getElementById('chord-hint');
    if(hint){ hint.classList.remove('show'); }
  }

  function clickIndex(mode, idx){
    var arr = buttonsFor(mode);
    var page = chord ? (chord.page || 0) : 0;
    var realIdx = page * MAX_KEYS + idx;
    var sel = arr[realIdx]; if(!sel) return;
    var el = document.querySelector(sel);
    if(el){
      el.classList.add('pulse');
      setTimeout(function(){ el.classList.remove('pulse'); }, 400);
      el.click();
    }
    cancelChord();
  }

  // Exposed Chords API — called by keys.js chord-mode routing (P2-4b)
  function handleChordKey(e){
    if(!chord) return;

    // Nav chord mode: letter keys map to targets
    if(chord.mode === 'nav'){
      var navKey = e.key.toLowerCase();
      if(navTargets[navKey]){
        e.preventDefault();
        navTargets[navKey].action();
        cancelChord();
        return;
      }
      // Unrecognized key: cancel + re-dispatch
      cancelChord();
      Chords._redispatch = true;
      return;
    }

    // Standard chord modes (expert/klug/future): digit keys
    if(e.key >= '1' && e.key <= '9'){
      e.preventDefault();
      var idx = parseInt(e.key, 10) - 1;
      clickIndex(chord.mode, idx);
      return;
    }
    if(e.key === '0'){
      e.preventDefault();
      var arr = buttonsFor(chord.mode);
      var totalPages = Math.ceil(arr.length / MAX_KEYS);
      if(totalPages > 1){
        chord.page = (chord.page + 1) % totalPages;
        chord.deadline = Date.now() + CHORD_TTL;
        showKeycaps(chord.mode);
      }
      return;
    }
    // Other key: cancel chord
    cancelChord();
  }

  // Modal slider key handling (P2-4b) — tracks active modal
  var _activeModal = null;

  function onModalOpen(ev){
    var modalId = ev.detail && ev.detail.id; if(!modalId) return;
    var modal = document.getElementById(modalId); if(!modal) return;
    _activeModal = modal;
  }

  function onModalClose(ev){
    var modalId = ev.detail && ev.detail.id; if(!modalId) return;
    if(_activeModal && _activeModal.id === modalId){
      _activeModal = null;
    }
  }

  function handleModalKey(e){
    if(!_activeModal) return false;
    var modal = _activeModal;
    var d1to0 = ['1','2','3','4','5','6','7','8','9','0'];
    var slider = modal.querySelector('input[type="range"]');
    var applyBtn = modal.querySelector('button[id^="apply-"]') || modal.querySelector('button[id^="run-"]');

    if(e.key === 'Enter' && applyBtn){
      e.preventDefault();
      applyBtn.click();
      return true;
    }
    if(!slider) return false;
    var cur = parseInt(slider.value || '50', 10);
    if(e.key === 'ArrowUp' || e.key === 'ArrowRight'){
      e.preventDefault();
      slider.value = Math.min(100, cur + 5);
      slider.dispatchEvent(new Event('input'));
      return true;
    }
    if(e.key === 'ArrowDown' || e.key === 'ArrowLeft'){
      e.preventDefault();
      slider.value = Math.max(0, cur - 5);
      slider.dispatchEvent(new Event('input'));
      return true;
    }
    var idx = d1to0.indexOf(e.key);
    if(idx >= 0){
      e.preventDefault();
      var val = idx === 9 ? 100 : (idx + 1) * 10;
      slider.value = val;
      slider.dispatchEvent(new Event('input'));
      return true;
    }
    return false;
  }

  // Register chord initiation keys via Keys (P2-4a, P2-5, P2-6)
  function registerChordKeys(){
    if(!window.Keys) return;

    Keys.register({ id:'chord.expert', label:'Experten-Chord', scope:'global',
      bindings:['e'], when: hasExpertTargets, run: function(){ startChord('expert'); } });

    Keys.register({ id:'chord.klug', label:'KLUG-Chord', scope:'global',
      bindings:['k'], when: hasKlugTargets, run: function(){ startChord('klug'); } });

    // Phase 2 (P2-5): Future Lab chord
    Keys.register({ id:'chord.future', label:'Future-Lab-Chord', scope:'global',
      bindings:['f'], when: hasFutureTargets, run: function(){ startChord('future'); } });

    // Phase 2 (P2-6): Navigation chord
    Keys.register({ id:'chord.nav', label:'Navigation-Chord', scope:'global',
      bindings:['v'], run: function(){ startChord('nav'); } });
  }

  // Listen for modal lifecycle
  document.addEventListener('modal:open', onModalOpen);
  document.addEventListener('modal:close', onModalClose);

  // Register chord keys on DOMContentLoaded (after keys.js is loaded)
  document.addEventListener('DOMContentLoaded', registerChordKeys);

  // Expose Chords API for keys.js integration
  window.Chords = {
    isActive: function(){ return !!chord; },
    handleChordKey: handleChordKey,
    handleModalKey: handleModalKey,
    _redispatch: false
  };

  Object.defineProperty(window.Chords, 'activeModal', {
    get: function(){ return _activeModal; },
    set: function(v){ _activeModal = v; }
  });
})();
