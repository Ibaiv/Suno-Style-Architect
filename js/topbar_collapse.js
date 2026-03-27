// topbar_collapse.js - Collapsible top menu bar (Issue #106)
// Adds collapse/expand toggle for the .app-menu-bar with localStorage persistence
// and Mod+Shift+T keyboard shortcut via Keys.register().

(function(){
  const STORAGE_KEY = 'ssa_topbar_collapsed';
  const COLLAPSED_CLASS = 'top-bar-collapsed';

  let menuBar = null;
  let toggleBtn = null;

  function isCollapsed(){
    return menuBar && menuBar.classList.contains(COLLAPSED_CLASS);
  }

  function setCollapsed(collapsed){
    if(!menuBar) return;
    if(collapsed){
      menuBar.classList.add(COLLAPSED_CLASS);
    } else {
      menuBar.classList.remove(COLLAPSED_CLASS);
    }
    localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
    toggleBtn.setAttribute('aria-expanded', String(!collapsed));
    // Dispatch event so other components can react to layout change
    document.dispatchEvent(new CustomEvent('topbar:toggle', { detail: { collapsed: collapsed } }));
  }

  function toggle(){
    setCollapsed(!isCollapsed());
  }

  function init(){
    menuBar = document.getElementById('app-menu-bar');
    toggleBtn = document.getElementById('topbar-collapse-toggle');
    if(!menuBar || !toggleBtn) return;

    // Restore persisted state
    const saved = localStorage.getItem(STORAGE_KEY);
    if(saved === '1'){
      // Apply collapsed state immediately (no transition on load)
      menuBar.style.transition = 'none';
      menuBar.classList.add(COLLAPSED_CLASS);
      toggleBtn.setAttribute('aria-expanded', 'false');
      // Re-enable transitions after a frame
      requestAnimationFrame(function(){
        requestAnimationFrame(function(){
          menuBar.style.transition = '';
        });
      });
    }

    // Toggle button click
    toggleBtn.addEventListener('click', function(e){
      e.stopPropagation();
      toggle();
    });

    // Register keyboard shortcut
    if(window.Keys){
      Keys.register({
        id: 'topbar.toggle',
        label: 'Menüleiste ein/aus',
        scope: 'global',
        bindings: ['Mod+Shift+t'],
        run: toggle
      });
    }
  }

  // Initialize when DOM is ready
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for programmatic access
  window.TopBar = { toggle: toggle, isCollapsed: isCollapsed, setCollapsed: setCollapsed };
})();
