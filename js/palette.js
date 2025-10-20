// palette.js - Command Palette and HUD integration (Phase 2)
(function(){
  let open = false;
  let items = []; // {id,label,bindings}
  let filtered = [];
  let index = 0;

  function $id(id){ return document.getElementById(id); }

  function bindingsToText(id){
    if(!window.Keys) return '';
    const b = Keys.getBindings(id) || [];
    return b[0] || '';
  }

  function refreshItems(){
    if(!window.Keys) return;
    const acts = Keys.listActions();
    items = acts.map(a=>({ id:a.id, label:a.label, binding: bindingsToText(a.id) }));
  }

  function fuzzy(q, str){
    q = q.toLowerCase(); str = (str||'').toLowerCase();
    return q.split(/\s+/).every(part=> str.includes(part));
  }

  function renderList(){
    const list = $id('cmdk-list');
    if(!list) return;
    list.innerHTML = '';
    filtered.forEach((it, i)=>{
      const row = document.createElement('div');
      row.className = 'cmdk-item' + (i===index ? ' active':'' );
      row.innerHTML = `<div class="cmdk-label">${it.label}</div><div class="cmdk-binding">${it.binding||''}</div>`;
      row.addEventListener('mouseenter', ()=>{ index = i; setActive(); });
      row.addEventListener('click', ()=> selectIndex(i));
      list.appendChild(row);
    });
  }

  function setActive(){
    const list = $id('cmdk-list'); if(!list) return;
    list.querySelectorAll('.cmdk-item').forEach((el, i)=>{
      el.classList.toggle('active', i===index);
    });
  }

  function filter(q){
    if(!q){ filtered = items.slice(0, 40); index = 0; renderList(); return; }
    const ql = q.toLowerCase();
    filtered = items.filter(it=> fuzzy(ql, it.label + ' ' + it.id + ' ' + (it.binding||'')) ).slice(0, 40);
    index = 0; renderList();
  }

  function openPalette(){
    refreshItems();
    filter('');
    const overlay = $id('cmdk-overlay');
    if(!overlay) return;
    overlay.classList.remove('hidden');
    const card = $id('cmdk-container');
    if(card) card.classList.add('animate-zoom-in');
    open = true;
    const input = $id('cmdk-input'); if(input){ input.value = ''; setTimeout(()=> input.focus(), 10); }
  }

  function closePalette(){
    const overlay = $id('cmdk-overlay'); if(overlay) overlay.classList.add('hidden');
    open = false;
  }

  function selectIndex(i){
    const it = filtered[i]; if(!it) return;
    closePalette();
    if(window.Keys){ Keys.run(it.id); }
  }

  function onOverlayKey(e){
    if(!open) return;
    const input = $id('cmdk-input');
    if(e.target === input){
      if(e.key === 'ArrowDown'){ e.preventDefault(); index = Math.min(index+1, filtered.length-1); setActive(); }
      else if(e.key === 'ArrowUp'){ e.preventDefault(); index = Math.max(index-1, 0); setActive(); }
      else if(e.key === 'Enter'){ e.preventDefault(); selectIndex(index); }
      else if(e.key === 'Escape'){ e.preventDefault(); closePalette(); }
    } else {
      if(e.key === 'Escape'){ e.preventDefault(); closePalette(); }
    }
  }

  function wire(){
    document.getElementById('cmdk-close')?.addEventListener('click', closePalette);
    document.getElementById('cmdk-overlay')?.querySelector('.absolute')?.addEventListener('click', closePalette);
    document.getElementById('cmdk-input')?.addEventListener('input', (e)=> filter(e.target.value));
    document.addEventListener('keydown', onOverlayKey);
  }

  // HUD + pulse feedback
  function showHUD(text){
    let hud = $id('action-hud');
    if(!hud) return;
    hud.textContent = text;
    hud.classList.remove('hidden');
    hud.classList.add('show');
    clearTimeout(showHUD._t);
    showHUD._t = setTimeout(()=>{ hud.classList.remove('show'); }, 900);
  }
  function pulse(sel){
    const el = sel && document.querySelector(sel);
    if(!el) return;
    el.classList.add('pulse');
    setTimeout(()=> el.classList.remove('pulse'), 400);
  }
  function targetFor(id){
    switch(id){
      case 'generate': return '#generate-button';
      case 'refine.v3': return '#suno-v3-button';
      case 'refine.pro': return '#suno-pro-button';
      case 'copy.result': return '#copy-button';
      case 'history.toggle': return '#history-toggle-button';
      case 'auto.trim': return '#auto-trim-v3-button';
      case 'focus.idea': return '#idea-input';
      default: return null;
    }
  }
  document.addEventListener('keys:action', (e)=>{
    const { id, label } = e.detail || {};
    if(id && label){ showHUD(label); pulse(targetFor(id)); }
  });

  document.addEventListener('DOMContentLoaded', ()=>{ wire(); });

  // expose
  window.Palette = { open: openPalette, close: closePalette };
})();
