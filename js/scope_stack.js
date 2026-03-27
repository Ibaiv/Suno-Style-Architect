// scope_stack.js - Context-aware scope system (Phase 3)
// Tracks UI context for scope-aware shortcut activation.
(function(){
  'use strict';
  var _stack = ['global'];
  var _tokens = new Map(); // token -> scopeName
  var _counter = 0;
  var _timestamps = new Map(); // token -> Date.now()

  var SCOPE_LABELS = {
    'global': null,
    'dashboard': 'Dashboard',
    'chord-builder': 'Chord-Modus',
    'creative-cosmos': 'Creative Cosmos',
    'style-sync': 'Style Sync',
    'klang-studio': 'Klang Studio',
    'modal': 'Modal',
    'modal-slider': 'Slider',
    'command-palette': 'Befehlspalette'
  };

  // Guard 1: Token-based push/pop
  function push(scopeName){
    var token = 'scope-' + (++_counter);
    _stack.push(scopeName);
    _tokens.set(token, scopeName);
    _timestamps.set(token, Date.now());
    _notify();
    return token;
  }

  function pop(token){
    var expected = _tokens.get(token);
    if(!expected){
      console.error('ScopeStack: unknown token', token);
      return false;
    }
    var top = _stack[_stack.length - 1];
    if(top === expected){
      _stack.pop();
    } else {
      // Out-of-order: scan and remove
      var idx = _stack.lastIndexOf(expected);
      if(idx > 0){
        _stack.splice(idx, 1);
        console.warn('ScopeStack: out-of-order pop for', expected, '(current top:', top, ')');
      }
    }
    _tokens.delete(token);
    _timestamps.delete(token);
    _notify();
    return true;
  }

  function _notify(){
    var scope = _stack[_stack.length - 1];
    if(typeof ScopeStack.onchange === 'function'){
      ScopeStack.onchange(scope);
    }
    _updateIndicator(scope);
  }

  // Guard 2: CloseStack-Scope binding helper
  // When Escape fires, CloseStack invokes the linked closeFn which calls closeFn().
  // closeFn (setupModal's close) already handles both CloseStack + ScopeStack cleanup
  // via the _scopeBinding reference, so the linked closeFn only needs to call closeFn().
  function openWithScope(closeFn, scopeName, closeId){
    var closed = false;
    var scopeToken = push(scopeName);
    var csId = null;
    if(window.CloseStack){
      csId = CloseStack.push(function(){
        if(closed) return;
        closed = true;
        // closeFn() (= setupModal.close) handles its own scope/CloseStack cleanup
        closeFn();
      }, { id: closeId });
    }
    return { scopeToken: scopeToken, closeId: csId };
  }

  // Guard 3: Inactivity timeout (dev mode)
  function checkLeaks(maxAge){
    maxAge = maxAge || 900000; // 15 minutes default
    var now = Date.now();
    _timestamps.forEach(function(ts, token){
      if(now - ts > maxAge){
        var scope = _tokens.get(token);
        console.warn('ScopeStack: stale scope detected:', scope, 'age:', Math.round((now - ts)/1000) + 's');
      }
    });
  }

  // Dev-only: leak checking every 60s
  if(typeof location !== 'undefined' && location.hostname === 'localhost'){
    setInterval(function(){ checkLeaks(); }, 60000);
  }

  // Guard 4: Emergency reset (dev mode: Ctrl+Shift+Escape)
  document.addEventListener('keydown', function(e){
    if(e.ctrlKey && e.shiftKey && e.key === 'Escape'){
      if(typeof location !== 'undefined' && location.hostname === 'localhost'){
        reset();
        if(window.CloseStack) CloseStack.clear();
        console.warn('ScopeStack: emergency reset');
      }
    }
  });

  function reset(){
    _stack.length = 0;
    _stack.push('global');
    _tokens.clear();
    _timestamps.clear();
    _notify();
  }

  // Visual Scope Indicator (P3-9)
  function _updateIndicator(scope){
    var el = document.getElementById('scope-indicator');
    if(!el) return;
    var label = SCOPE_LABELS[scope];
    if(!label){
      el.classList.remove('show');
    } else {
      el.textContent = '\u2328 ' + label;
      el.classList.add('show');
      el.classList.remove('pulse-scope');
      requestAnimationFrame(function(){
        el.classList.add('pulse-scope');
      });
    }
  }

  var ScopeStack = {
    push: push,
    pop: pop,
    openWithScope: openWithScope,
    reset: reset,
    checkLeaks: checkLeaks,
    onchange: null,
    SCOPE_LABELS: SCOPE_LABELS
  };

  Object.defineProperties(ScopeStack, {
    current: { get: function(){ return _stack[_stack.length - 1]; } }
  });

  ScopeStack.isActive = function(scope){
    if(scope === 'global') return true;
    if(scope === 'any') return true;
    return _stack[_stack.length - 1] === scope;
  };

  ScopeStack.debug = function(){
    return _stack.slice();
  };

  window.ScopeStack = ScopeStack;
})();
