// keys.js - central keybinding registry (Phase 1 + Phase 2 + Phase 3)
// Normalizes keyboard shortcuts, scopes, dispatch, priority, chord/modal routing, scope-awareness.

(function(){
  const STORAGE_KEY = 'ssa_keybindings_v1';

  const defaultBindings = {}; // id -> array of bindings
  const customBindings = loadCustom();

  const actions = new Map(); // id -> { id, label, scope, run, when, priority }

  // Scopes: 'global' (not typing), 'editing' (inside inputs), 'any'
  // Phase 3 scope tags: 'creative-cosmos', 'command-palette', 'dashboard', etc.
  function isTyping(){
    const el = document.activeElement;
    if(!el) return false;
    const tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable
      || el.getAttribute('role') === 'textbox';
  }

  // Returns true if a binding string represents a single character with no modifiers.
  // Used to guard against accidental triggers while typing.
  function isSingleCharBinding(bindingStr){
    const b = parseBinding(bindingStr);
    return b.isChar && !b.mod && !b.shift && !b.alt;
  }

  function scopeAllowed(scope){
    if(scope === 'any') return true;
    if(scope === 'editing') return isTyping();
    if(scope === 'global') return !isTyping();
    // Phase 3 scope tags: check against ScopeStack
    if(window.ScopeStack){
      return ScopeStack.isActive(scope);
    }
    return true; // fallback: unknown scopes pass (Phase 2 compat)
  }

  // Binding parsing
  // Accept forms: 'g', 'KeyG', 'Slash', 'Enter', 'Mod+K', 'Mod+Enter', 'Shift+Slash',
  // 'F1', 'BracketLeft', 'BracketRight', 'Mod+Comma', 'Backspace', 'Delete'
  function parseBinding(str){
    const parts = str.split('+');
    let mod = { mod:false, shift:false, alt:false }; // mod = meta OR ctrl
    let key = '';
    let isChar = false;
    for(const pRaw of parts){
      const p = pRaw.trim();
      const pl = p.toLowerCase();
      if(pl === 'mod' || pl === 'cmd' || pl === 'ctrl') mod.mod = true;
      else if(pl === 'shift') mod.shift = true;
      else if(pl === 'alt' || pl === 'option') mod.alt = true;
      else if(/^key[A-Z]$/.test(p)) key = p;               // legacy 'KeyG' format — code-based
      else if(p.length === 1){ key = p.toLowerCase(); isChar = true; } // char-based: QWERTZ-safe
      else if(p === 'Enter' || p === 'Slash' || p === 'Space') key = p;
      else if(p === 'Backspace' || p === 'Delete' || p === 'ArrowUp' || p === 'ArrowDown' ||
              p === 'ArrowLeft' || p === 'ArrowRight' || p === 'Tab') { key = p; }
      else if(p === 'Comma') { key = ','; isChar = true; }
      else if(p === 'BracketLeft' || p === 'BracketRight') { key = p; }
      else if(/^F\d{1,2}$/.test(p)) { key = p; }
      else if(p.length){ key = p; }
    }
    return { key, isChar, ...mod };
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

  // Register an action (Phase 2: added priority field)
  function register({ id, label, scope = 'global', bindings = [], run, when, priority = 0 }){
    actions.set(id, { id, label, scope, run, when, priority });
    defaultBindings[id] = Array.isArray(bindings) ? bindings : [bindings];
  }

  function matchEvent(e, binding){
    const b = parseBinding(binding);
    // modifiers
    const modOk = b.mod ? (e.metaKey || e.ctrlKey) : (!e.metaKey && !e.ctrlKey);
    if(!modOk) return false;
    if(!!b.shift !== !!e.shiftKey) return false;
    if(!!b.alt !== !!e.altKey) return false;
    // key — char-based bindings match e.key (QWERTZ-safe), code-based match e.code
    if(b.isChar){
      return (e.key||'').toLowerCase() === b.key;
    }
    const code = e.code || '';
    if(b.key === 'Enter' || b.key === 'Slash' || b.key === 'Space'){
      return code === b.key;
    }
    if(b.key === 'BracketLeft' || b.key === 'BracketRight'){
      return code === b.key;
    }
    if(b.key.startsWith('Key')){
      return code === b.key;
    }
    // F-keys
    if(/^F\d{1,2}$/.test(b.key)){
      return e.key === b.key;
    }
    // Named keys like Backspace, Delete, ArrowUp, etc.
    if(b.key === 'Backspace' || b.key === 'Delete' ||
       b.key === 'ArrowUp' || b.key === 'ArrowDown' ||
       b.key === 'ArrowLeft' || b.key === 'ArrowRight' || b.key === 'Tab'){
      return e.key === b.key;
    }
    // fallback to key name compare lowercased
    return (e.key||'').toLowerCase() === (b.key||'').toLowerCase();
  }

  function onKeyDown(e){
    // Escape is handled by CloseStack (close_stack.js)

    // Phase 2: Chord-mode routing — active chord captures single keys
    if(window.Chords && Chords.isActive()){
      if(!e.metaKey && !e.ctrlKey && !e.altKey){
        Chords.handleChordKey(e);
        if(!Chords._redispatch) return;
        Chords._redispatch = false;
        // fall through to normal dispatch for re-dispatched keys
      }
    }

    // Phase 2: Modal slider keys — active modal captures digits/arrows/Enter
    if(window.Chords && Chords.activeModal){
      if(Chords.handleModalKey(e)) return;
    }

    // Phase 2: Priority-aware dispatch — collect all matching, sort by priority desc
    let blocked = null;
    const matches = [];

    for(const [id, action] of actions){
      const bins = getBindings(id);
      for(const bin of bins){
        if(matchEvent(e, bin)){
          matches.push({ action, matchedBinding: bin });
          break; // only need one binding match per action
        }
      }
    }

    // Sort by priority descending (highest first)
    matches.sort((a, b) => (b.action.priority || 0) - (a.action.priority || 0));

    for(const { action, matchedBinding } of matches){
      // Guard: single-character shortcuts (no modifiers) must not fire while typing
      // in any text-accepting element — prevents accidental triggers (issue #93)
      if(isSingleCharBinding(matchedBinding) && isTyping()){
        if(!blocked){
          blocked = { id: action.id, label: action.label, reason: 'typing-guard' };
        }
        continue;
      }
      if(!scopeAllowed(action.scope)){
        if(!blocked){
          blocked = {
            id: action.id, label: action.label, reason: 'scope',
            requiredScope: action.scope,
            currentScope: window.ScopeStack ? ScopeStack.current : 'unknown'
          };
        }
        continue;
      }
      if(action.when && !action.when()){
        if(!blocked){
          blocked = { id: action.id, label: action.label, reason: 'guard' };
        }
        continue;
      }
      e.preventDefault();
      try {
        document.dispatchEvent(new CustomEvent('keys:action', { detail: { id: action.id, label: action.label, source: 'key' }}));
        action.run();
      } catch(err){ console.error('Shortcut error for', action.id, err); }
      return;
    }

    // Fire blocked event if a binding matched but was rejected by scope or guard
    if(blocked){
      document.dispatchEvent(new CustomEvent('keys:blocked', { detail: blocked }));
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

  // Phase 2: Debug helper
  function debug(){
    const all = listDetailed();
    console.group('Keys Registry (' + all.length + ' actions)');
    all.forEach(a => {
      console.log(a.id, '|', a.label, '|', a.scope, '| bindings:', a.bindings.join(', '));
    });
    console.groupEnd();
    return all;
  }

  document.addEventListener('keydown', onKeyDown);

  window.Keys = { register, getBindings, setBinding, parseBinding, matchEvent, listActions, run, resetCustom, listDetailed, isTyping, debug };
})();
