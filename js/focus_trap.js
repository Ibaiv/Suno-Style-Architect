// focus_trap.js - Accessible focus trapping for modals (WCAG 2.4.3)
// Traps Tab/Shift+Tab within the active modal, auto-focuses first element on open,
// and restores focus to the triggering element on close.
(function(){
  'use strict';

  var FOCUSABLE_SELECTOR = [
    'a[href]:not([tabindex="-1"])',
    'button:not([disabled]):not([tabindex="-1"])',
    'input:not([disabled]):not([type="hidden"]):not([tabindex="-1"])',
    'select:not([disabled]):not([tabindex="-1"])',
    'textarea:not([disabled]):not([tabindex="-1"])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');

  // Stack of active traps to support nested modals
  var _trapStack = [];

  function _getActiveTrap(){
    return _trapStack.length > 0 ? _trapStack[_trapStack.length - 1] : null;
  }

  function _getFocusableElements(container){
    var elements = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));
    // Filter out elements that are not visible (hidden, zero size, display:none)
    return elements.filter(function(el){
      return el.offsetParent !== null || el.offsetWidth > 0 || el.offsetHeight > 0;
    });
  }

  /**
   * Activate focus trapping on a modal container.
   * @param {HTMLElement} modal - The modal element to trap focus within.
   * @param {Object} [opts] - Options.
   * @param {HTMLElement} [opts.triggerElement] - Element to restore focus to on deactivate.
   * @returns {Object} A trap handle with a deactivate() method.
   */
  function activate(modal, opts){
    opts = opts || {};
    var triggerElement = opts.triggerElement || document.activeElement;

    var trap = {
      modal: modal,
      triggerElement: triggerElement
    };

    _trapStack.push(trap);

    // Auto-focus the first focusable element inside the modal
    // Use requestAnimationFrame to let the modal render first
    requestAnimationFrame(function(){
      // Check if this trap is still active (not already deactivated)
      if(_trapStack.indexOf(trap) === -1) return;

      var focusable = _getFocusableElements(modal);
      if(focusable.length > 0){
        focusable[0].focus();
      } else {
        // If no focusable children, focus the modal itself (needs tabindex)
        if(!modal.hasAttribute('tabindex')){
          modal.setAttribute('tabindex', '-1');
        }
        modal.focus();
      }
    });

    return {
      deactivate: function(){
        deactivate(trap);
      }
    };
  }

  /**
   * Deactivate a specific focus trap and restore focus.
   * @param {Object} trap - The trap handle returned by activate, or looked up from the stack.
   */
  function deactivate(trap){
    if(!trap){
      // Deactivate the top trap
      trap = _trapStack.pop();
    } else {
      // Remove specific trap from stack
      var idx = _trapStack.indexOf(trap);
      if(idx !== -1){
        _trapStack.splice(idx, 1);
      }
    }

    if(!trap) return;

    // Restore focus to the trigger element
    if(trap.triggerElement && typeof trap.triggerElement.focus === 'function'){
      try {
        trap.triggerElement.focus();
      } catch(e){
        // Element may have been removed from the DOM
      }
    }
  }

  /**
   * Deactivate trap for a specific modal (lookup by modal element).
   * @param {HTMLElement} modal - The modal to deactivate focus trapping for.
   */
  function deactivateByModal(modal){
    for(var i = _trapStack.length - 1; i >= 0; i--){
      if(_trapStack[i].modal === modal){
        var trap = _trapStack.splice(i, 1)[0];
        if(trap.triggerElement && typeof trap.triggerElement.focus === 'function'){
          try {
            trap.triggerElement.focus();
          } catch(e){ /* element removed from DOM */ }
        }
        return;
      }
    }
  }

  // Global Tab key handler in capture phase for focus trapping
  document.addEventListener('keydown', function(e){
    if(e.key !== 'Tab') return;

    var activeTrap = _getActiveTrap();
    if(!activeTrap) return;

    var modal = activeTrap.modal;
    var focusable = _getFocusableElements(modal);

    if(focusable.length === 0){
      // No focusable elements: prevent Tab from leaving modal
      e.preventDefault();
      return;
    }

    var firstFocusable = focusable[0];
    var lastFocusable = focusable[focusable.length - 1];

    if(e.shiftKey){
      // Shift+Tab: if at the first element, wrap to last
      if(document.activeElement === firstFocusable || !modal.contains(document.activeElement)){
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab: if at the last element, wrap to first
      if(document.activeElement === lastFocusable || !modal.contains(document.activeElement)){
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  }, true); // capture phase to intercept before other handlers

  window.FocusTrap = {
    activate: activate,
    deactivate: deactivate,
    deactivateByModal: deactivateByModal
  };
})();
