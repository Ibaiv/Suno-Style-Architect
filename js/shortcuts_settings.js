// shortcuts_settings.js - UI to customize keybindings (Phase 3)
(function(){
  function $id(id){ return document.getElementById(id); }

  function openSettings(){
    const m = $id('shortcut-settings-modal'); if(!m) return;
    renderList();
    m.classList.remove('hidden');
    const card = m.querySelector('.relative'); if(card) card.classList.add('animate-zoom-in');
  }
  function closeSettings(){ const m=$id('shortcut-settings-modal'); if(m) m.classList.add('hidden'); }

  function bindingToLabel(b){ return Array.isArray(b)? b.join(', ') : (b||''); }

  function canonical(str){
    if(!window.Keys) return str;
    const b = Keys.parseBinding(str||'');
    if(!b || !b.key) return '';
    const parts = [];
    if(b.mod) parts.push('Mod');
    if(b.shift) parts.push('Shift');
    if(b.alt) parts.push('Alt');
    parts.push(b.key);
    return parts.join('+');
  }

  function computeConflicts(){
    if(!window.Keys) return new Map();
    const list = Keys.listDetailed();
    const map = new Map(); // canon -> [ids]
    list.forEach(item=>{
      (item.bindings||[]).forEach(b=>{
        const c = canonical(b);
        if(!c) return;
        const arr = map.get(c) || [];
        if(!arr.includes(item.id)) arr.push(item.id);
        map.set(c, arr);
      });
    });
    return map;
  }

  function renderList(){
    const list = $id('shortcut-settings-list'); if(!list || !window.Keys) return;
    const items = Keys.listDetailed();
    const conflicts = computeConflicts();
    const conflictCount = Array.from(conflicts.values()).filter(arr=>arr.length>1).length;

    list.innerHTML = `<div class="px-1 py-2 text-xs ${conflictCount? 'text-red-300':'text-neutral-400'}">${conflictCount? 'Konflikte: '+conflictCount : 'Keine Konflikte'}</div>`;

    items.forEach(item=>{
      const row = document.createElement('div');
      row.className = 'flex items-center justify-between gap-3 py-2 px-1';

      // Build chips for each binding
      const chips = (item.bindings||[]).map(b=>{
        const canon = canonical(b);
        const isConflict = (conflicts.get(canon)||[]).length>1;
        return `<span class="binding-chip ${isConflict? 'conflict':''}" data-bind="${canon}">${canon}<span class="remove" title="Entfernen">×</span></span>`;
      }).join(' ');

      row.innerHTML = `
        <div class="min-w-0">
          <div class="text-sm text-neutral-200">${item.label}</div>
          <div class="text-xs text-neutral-500">${item.id} · ${item.scope}</div>
        </div>
        <div class="flex items-center gap-2 flex-wrap" data-id="${item.id}">
          <div class="chips space-x-1">${chips || '<span class="text-neutral-500 text-xs">Kein Binding</span>'}</div>
          <button class="record-btn text-xs px-2 py-1 rounded bg-neutral-800/70 border border-neutral-700 hover:bg-neutral-700" data-id="${item.id}">Hinzufügen</button>
        </div>`;
      list.appendChild(row);
    });

    // wire add
    list.querySelectorAll('.record-btn').forEach(btn=>{
      btn.addEventListener('click', ()=> startRecording(btn.dataset.id));
    });
    // wire remove
    list.querySelectorAll('.binding-chip .remove').forEach(x=>{
      x.addEventListener('click', ()=>{
        const chip = x.closest('.binding-chip'); const canon = chip?.getAttribute('data-bind');
        const wrap = chip?.closest('[data-id]'); const id = wrap?.getAttribute('data-id');
        if(!id || !canon) return;
        const det = Keys.listDetailed().find(it=> it.id===id);
        const next = (det?.bindings||[]).filter(b=> canonical(b)!==canon);
        Keys.setBinding(id, next);
        renderList();
      });
    });
  }

  let recording = null;
  function startRecording(id){
    recording = id;
    const m = $id('shortcut-settings-modal'); if(!m) return;
    m.classList.add('recording');
    document.addEventListener('keydown', captureOnce, { once:true });
  }
  function captureOnce(e){
    if(!recording) return;
    e.preventDefault();
    const code = e.code || '';
    const parts = [];
    if(e.metaKey || e.ctrlKey) parts.push('Mod');
    if(e.shiftKey) parts.push('Shift');
    if(e.altKey) parts.push('Alt');
    if(code.startsWith('Key') || code==='Enter' || code==='Slash' || code==='Space') parts.push(code);
    else if(e.key && e.key.length===1) parts.push('Key' + e.key.toUpperCase());
    const bind = parts.join('+') || 'Key' + (e.key||'').toUpperCase();

    const det = Keys.listDetailed().find(it=> it.id===recording);
    const existing = det?.bindings || [];
    const canon = canonical(bind);
    const next = Array.from(new Set([...existing.map(canonical), canon]));
    // map back to strings (already canonical)
    Keys.setBinding(recording, next);
    recording = null;
    const m = $id('shortcut-settings-modal'); if(m) m.classList.remove('recording');
    renderList();
  }

  function wire(){
    $id('shortcuts-settings-button')?.addEventListener('click', openSettings);
    $id('shortcut-settings-close')?.addEventListener('click', closeSettings);
    const overlay = $id('shortcut-settings-modal')?.querySelector('.absolute');
    overlay?.addEventListener('click', closeSettings);
    $id('shortcut-reset')?.addEventListener('click', ()=>{ if(confirm('Alle Shortcuts zurücksetzen?')){ Keys.resetCustom(); renderList(); } });
    $id('shortcut-settings-button')?.addEventListener('click', (e)=> e.preventDefault());
    document.addEventListener('keys:updated', renderList);
  }

  document.addEventListener('DOMContentLoaded', wire);
})();
