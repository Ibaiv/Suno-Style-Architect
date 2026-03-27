// close_stack.js - Central LIFO CloseStack for Escape key management
// Replaces all individual Escape handlers with a unified, priority-based system.
(function(){
  'use strict';
  const stack = []; // [{id, close}]
  const idSet = new Set();

  function once(fn){
    let called = false;
    return function(){
      if(called) return;
      called = true;
      fn();
    };
  }

  /** Push a close function onto the stack. Returns the id. */
  function push(closeFn, opts){
    opts = opts || {};
    var id = opts.id || ('_cs_' + Date.now() + '_' + Math.random().toString(36).slice(2,6));
    if(idSet.has(id)) return id; // duplicate prevention
    stack.push({ id: id, close: once(closeFn) });
    idSet.add(id);
    return id;
  }

  /** Remove entry by id (without calling close). Returns true if found. */
  function pop(id){
    if(id){
      for(var i = stack.length - 1; i >= 0; i--){
        if(stack[i].id === id){
          stack.splice(i, 1);
          idSet.delete(id);
          return true;
        }
      }
      return false;
    }
    // Pop top without calling close
    if(stack.length === 0) return false;
    var entry = stack.pop();
    idSet.delete(entry.id);
    return true;
  }

  /** Pop the top entry and invoke its close function. Returns true if something was closed. */
  function handleEscape(){
    if(stack.length === 0) return false;
    var entry = stack.pop();
    idSet.delete(entry.id);
    try { entry.close(); } catch(err){ console.error('CloseStack close error:', err); }
    return true;
  }

  /** Peek at the top entry (without removing). */
  function peek(){
    return stack.length > 0 ? { id: stack[stack.length - 1].id } : null;
  }

  /** Clear the entire stack (no close functions called). */
  function clear(){
    stack.length = 0;
    idSet.clear();
  }

  /** Return array of ids for debugging. */
  function debug(){
    return stack.map(function(e){ return e.id; });
  }

  // Single global Escape listener in capture phase — intercepts before any other handler
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
      if(handleEscape()){
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    }
  }, true); // capture phase

  Object.defineProperty(window, 'CloseStack', {
    value: Object.defineProperties({
      push: push,
      pop: pop,
      handleEscape: handleEscape,
      peek: peek,
      clear: clear,
      debug: debug
    }, {
      size: { get: function(){ return stack.length; } }
    }),
    writable: false,
    configurable: false
  });

  // --- BodyScrollLock: nested-modal-safe scroll locking ---
  // Uses CloseStack.size to determine when it is safe to restore scroll.
  // lock()   — always sets overflow:hidden on <body>
  // unlock() — only clears overflow when CloseStack is empty (last modal closed)
  Object.defineProperty(window, 'BodyScrollLock', {
    value: {
      lock: function(){
        document.body.style.overflow = 'hidden';
      },
      unlock: function(){
        if(stack.length === 0){
          document.body.style.overflow = '';
        }
      }
    },
    writable: false,
    configurable: false
  });
})();
