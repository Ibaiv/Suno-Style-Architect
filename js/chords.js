// chords.js - Two-key chords and modal keyboard enhancements (Phase 3)
(function(){
  let chord = null; // { mode: 'expert'|'klug', deadline: ts, page: 0 }
  const CHORD_TTL = 1200; // ms
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

  function isTyping(){
    const el = document.activeElement; if(!el) return false;
    return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable;
  }

  function startChord(mode){
    chord = { mode, deadline: Date.now()+CHORD_TTL, page: 0 };
    showKeycaps(mode);
    setTimeout(()=>{ if(chord && Date.now()>chord.deadline) cancelChord(); }, CHORD_TTL+50);
  }

  function cancelChord(){ chord = null; hideKeycaps(); }

  function buttonsFor(mode){ return mode==='expert' ? expertButtons : klugButtons; }
  function hasChordTargets(){
    return [...expertButtons, ...klugButtons].some(sel => !!document.querySelector(sel));
  }

  function showKeycaps(mode){
    hideKeycaps();
    const arr = buttonsFor(mode);
    const page = chord ? (chord.page||0) : 0;
    const start = page * MAX_KEYS;
    const end = Math.min(start + MAX_KEYS, arr.length);
    arr.slice(start, end).forEach((sel, i)=>{
      const btn = document.querySelector(sel);
      if(!btn) return;
      btn.classList.add('keycap-target','chord-highlight');
      const cap = document.createElement('span');
      cap.className = 'keycap-badge keycap-badge-lg';
      cap.textContent = String(i+1);
      cap.dataset.keycap = '1';
      btn.appendChild(cap);
    });
    const hint = document.getElementById('chord-hint');
    if(hint){ hint.classList.add('show'); }
  }

  function hideKeycaps(){
    document.querySelectorAll('.keycap-badge').forEach(el=> el.remove());
    document.querySelectorAll('.keycap-target').forEach(el=> { el.classList.remove('keycap-target','chord-highlight'); });
    const hint = document.getElementById('chord-hint');
    if(hint){ hint.classList.remove('show'); }
  }

  function clickIndex(mode, idx){
    const arr = buttonsFor(mode);
    const page = chord ? (chord.page||0) : 0;
    const realIdx = page * MAX_KEYS + idx;
    const sel = arr[realIdx]; if(!sel) return;
    const el = document.querySelector(sel); if(el){ el.classList.add('pulse'); setTimeout(()=> el.classList.remove('pulse'), 400); el.click(); }
    cancelChord();
  }

  function onKeydown(e){
    // Esc closes visible modals
    if(e.key === 'Escape'){
      const openModal = Array.from(document.querySelectorAll('[id$="-modal"]')).find(m=> !m.classList.contains('hidden'));
      if(openModal){
        e.preventDefault();
        const closeBtn = openModal.querySelector('.close-modal-button');
        if(closeBtn) closeBtn.click(); else openModal.classList.add('hidden');
        return;
      }
    }

    // Ignore modified keys and when typing for chord start
    const hasMod = e.metaKey || e.ctrlKey || e.altKey;
    if(chord){
      if(e.key>='1' && e.key<='9'){
        e.preventDefault();
        const idx = parseInt(e.key,10)-1;
        clickIndex(chord.mode, idx);
        return;
      }
      if(e.key==='0'){
        e.preventDefault();
        const arr = buttonsFor(chord.mode);
        const totalPages = Math.ceil(arr.length / MAX_KEYS);
        chord.page = (chord.page + 1) % totalPages;
        chord.deadline = Date.now()+CHORD_TTL;
        showKeycaps(chord.mode);
        return;
      }
      // cancel on other keys
      cancelChord();
      return;
    }

    if(isTyping() || hasMod) return;

    if(!hasChordTargets()) return;

    // start chord with e or k
    if(e.code === 'KeyE'){ e.preventDefault(); startChord('expert'); }
    else if(e.code === 'KeyK'){ e.preventDefault(); startChord('klug'); }
  }

  // Modal slider keys: digits set 10..100; arrows adjust; Enter apply
  function onModalOpen(ev){
    const modalId = ev.detail && ev.detail.id; if(!modalId) return;
    const modal = document.getElementById(modalId); if(!modal) return;

    function keyHandler(e){
      const d1to0 = ['1','2','3','4','5','6','7','8','9','0'];
      const slider = modal.querySelector('input[type="range"]');
      const applyBtn = modal.querySelector('button[id^="apply-"]');
      if(e.key === 'Enter' && applyBtn){ e.preventDefault(); applyBtn.click(); return; }
      if(!slider) return;
      const cur = parseInt(slider.value||'50',10);
      if(e.key === 'ArrowUp' || e.key === 'ArrowRight'){ e.preventDefault(); slider.value = Math.min(100, cur+5); slider.dispatchEvent(new Event('input')); return; }
      if(e.key === 'ArrowDown' || e.key === 'ArrowLeft'){ e.preventDefault(); slider.value = Math.max(0, cur-5); slider.dispatchEvent(new Event('input')); return; }
      const idx = d1to0.indexOf(e.key);
      if(idx >= 0){ e.preventDefault(); const val = idx===9 ? 100 : (idx+1)*10; slider.value = val; slider.dispatchEvent(new Event('input')); }
    }

    modal.__keyHandler = keyHandler;
    document.addEventListener('keydown', keyHandler);
  }
  function onModalClose(ev){
    const modalId = ev.detail && ev.detail.id; if(!modalId) return;
    const modal = document.getElementById(modalId); if(!modal) return;
    if(modal.__keyHandler){ document.removeEventListener('keydown', modal.__keyHandler); delete modal.__keyHandler; }
  }

  document.addEventListener('keydown', onKeydown);
  document.addEventListener('modal:open', onModalOpen);
  document.addEventListener('modal:close', onModalClose);
})();
