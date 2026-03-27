// palette.js - Command Palette and HUD integration (Phase 2+3+4)
// Palette navigation now routes through Keys.register(). Scope-aware blocked feedback.
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
    // Phase 3 (P3-7): Push command-palette scope
    if(window.ScopeStack){
      overlay._scopeToken = ScopeStack.push('command-palette');
    }
    if(window.CloseStack) CloseStack.push(closePalette, { id: 'palette' });
    const input = $id('cmdk-input'); if(input){ input.value = ''; setTimeout(()=> input.focus(), 10); }
  }

  function closePalette(){
    if(window.CloseStack) CloseStack.pop('palette');
    const overlay = $id('cmdk-overlay');
    // Phase 3 (P3-7): Pop command-palette scope
    if(window.ScopeStack && overlay && overlay._scopeToken){
      ScopeStack.pop(overlay._scopeToken);
      overlay._scopeToken = null;
    }
    if(overlay) overlay.classList.add('hidden');
    open = false;
  }

  function selectIndex(i){
    const it = filtered[i]; if(!it) return;
    closePalette();
    if(window.Keys){ Keys.run(it.id); }
  }

  // Phase 2 (P2-8): Register palette navigation via Keys
  function registerPaletteKeys(){
    if(!window.Keys) return;

    Keys.register({ id:'palette.down', label:'Palette: N\u00e4chster', scope:'command-palette', priority:50,
      bindings:['ArrowDown'],
      when: function(){ return open && document.activeElement === $id('cmdk-input'); },
      run: function(){ index = Math.min(index+1, filtered.length-1); setActive(); }
    });
    Keys.register({ id:'palette.up', label:'Palette: Vorheriger', scope:'command-palette', priority:50,
      bindings:['ArrowUp'],
      when: function(){ return open && document.activeElement === $id('cmdk-input'); },
      run: function(){ index = Math.max(index-1, 0); setActive(); }
    });
    Keys.register({ id:'palette.select', label:'Palette: Ausw\u00e4hlen', scope:'command-palette', priority:50,
      bindings:['Enter'],
      when: function(){ return open && document.activeElement === $id('cmdk-input'); },
      run: function(){ selectIndex(index); }
    });
  }

  function wire(){
    document.getElementById('cmdk-close')?.addEventListener('click', closePalette);
    document.getElementById('cmdk-overlay')?.querySelector('.absolute')?.addEventListener('click', closePalette);
    document.getElementById('cmdk-input')?.addEventListener('input', (e)=> filter(e.target.value));
    // Phase 2: palette arrow/enter now handled via Keys.register() — no global keydown listener needed
    registerPaletteKeys();
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

  // Phase 3 (P3-10): Scope-aware blocked feedback
  document.addEventListener('keys:blocked', (e)=>{
    const { label, reason, requiredScope, currentScope } = e.detail || {};
    if(!label) return;
    let msg;
    if(reason === 'guard'){
      msg = label + ' \u2013 nicht verf\u00fcgbar';
    } else if(reason === 'scope' && requiredScope){
      const scopeLabels = window.ScopeStack ? ScopeStack.SCOPE_LABELS : {};
      const scopeLabel = scopeLabels[requiredScope] || requiredScope;
      msg = label + ' \u2013 nur in ' + scopeLabel;
    } else {
      msg = label + ' \u2013 hier nicht aktiv';
    }
    showHUD(msg);
  });

  document.addEventListener('DOMContentLoaded', ()=>{ wire(); });

  // expose
  window.Palette = { open: openPalette, close: closePalette };
})();
