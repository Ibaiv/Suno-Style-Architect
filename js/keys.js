// keys.js - central keybinding registry (Phase 1)
// Normalizes keyboard shortcuts, scopes, and dispatch.

(function(){
  const STORAGE_KEY = 'ssa_keybindings_v1';

  const defaultBindings = {}; // id -> array of bindings
  const customBindings = loadCustom();

  const actions = new Map(); // id -> { id, label, scope, run, when }

  // Scopes: 'global' (not typing), 'editing' (inside inputs), 'any'
  function isTyping(){
    const el = document.activeElement;
    if(!el) return false;
    const tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
  }

  function scopeAllowed(scope){
    if(scope === 'any') return true;
    if(scope === 'editing') return isTyping();
    if(scope === 'global') return !isTyping();
    return true;
  }

  // Binding parsing
  // Accept forms: 'g', 'KeyG', 'Slash', 'Enter', 'Mod+K', 'Mod+Enter', 'Shift+Slash'
  function parseBinding(str){
    const parts = str.split('+');
    let mod = { mod:false, shift:false, alt:false }; // mod = meta OR ctrl
    let key = '';
    for(const pRaw of parts){
      const p = pRaw.trim();
      const pl = p.toLowerCase();
      if(pl === 'mod' || pl === 'cmd' || pl === 'ctrl') mod.mod = true;
      else if(pl === 'shift') mod.shift = true;
      else if(pl === 'alt' || pl === 'option') mod.alt = true;
      else if(/^key[A-Z]$/.test(p)) key = p;
      else if(p.length === 1){ key = 'Key' + p.toUpperCase(); }
      else if(p === 'Enter' || p === 'Slash' || p === 'Space') key = p;
      else if(p.length){ key = p; }
    }
    return { key, ...mod };
  }

  function loadCustom(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}'); } catch { return {}; }
  }
  function saveCustom(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customBindings));
  }

  function getBindings(id){
    return customBindings[id] || defaultBindings[id] || [];
  }

  function setBinding(id, bindings){
    customBindings[id] = bindings;
    saveCustom();
    document.dispatchEvent(new CustomEvent('keys:updated', { detail: { id, bindings } }));
  }

  function resetCustom(){
    for(const k of Object.keys(customBindings)) delete customBindings[k];
    saveCustom();
    document.dispatchEvent(new CustomEvent('keys:updated', { detail: { reset: true } }));
  }

  function listDetailed(){
    return Array.from(actions.values()).map(a=>({ id:a.id, label:a.label, scope:a.scope, bindings: getBindings(a.id), defaults: defaultBindings[a.id]||[] }));
  }

  // Register an action
  function register({ id, label, scope = 'global', bindings = [], run, when }){
    actions.set(id, { id, label, scope, run, when });
    defaultBindings[id] = Array.isArray(bindings) ? bindings : [bindings];
  }

  function matchEvent(e, binding){
    const b = parseBinding(binding);
    // modifiers
    const modOk = b.mod ? (e.metaKey || e.ctrlKey) : (!e.metaKey && !e.ctrlKey);
    if(!modOk) return false;
    if(!!b.shift !== !!e.shiftKey) return false;
    if(!!b.alt !== !!e.altKey) return false;
    // key
    const code = e.code || '';
    if(b.key === 'Enter' || b.key === 'Slash' || b.key === 'Space'){
      if(code !== b.key) return false;
    } else if(b.key.startsWith('Key')){
      if(code !== b.key) return false;
    } else {
      // fallback to key name compare lowercased
      if((e.key||'').toLowerCase() !== (b.key||'').toLowerCase()) return false;
    }
    return true;
  }

  function onKeyDown(e){
    // Esc always handled elsewhere; we don't own it in phase 1
    // Try all actions and see which binding matches
    for(const [id, action] of actions){
      if(!scopeAllowed(action.scope)) continue;
      if(action.when && !action.when()) continue;
      const bins = getBindings(id);
      for(const bin of bins){
        if(matchEvent(e, bin)){
          e.preventDefault();
          try {
            document.dispatchEvent(new CustomEvent('keys:action', { detail: { id: action.id, label: action.label, source: 'key' }}));
            action.run();
          } catch(err){ console.error('Shortcut error for', id, err); }
          return;
        }
      }
    }
  }

  function listActions(){
    return Array.from(actions.values()).map(a=>({ id:a.id, label:a.label, scope:a.scope }));
  }

  function run(id){
    const a = actions.get(id);
    if(!a) return false;
    try {
      document.dispatchEvent(new CustomEvent('keys:action', { detail: { id: a.id, label: a.label, source: 'program' }}));
      a.run();
      return true;
    } catch(err){ console.error('Keys.run error for', id, err); return false; }
  }

  document.addEventListener('keydown', onKeyDown);

  window.Keys = { register, getBindings, setBinding, parseBinding, listActions, run, resetCustom, listDetailed };
})();
