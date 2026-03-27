// palette.js - Command Palette and HUD integration (Phase 2+3+4+5)
// Phase 5: All tools (Experten, KLUG, Future Lab) + features in grouped folder view.
// Palette navigation now routes through Keys.register(). Scope-aware blocked feedback.
(function(){
  let open = false;
  let items = []; // {id, label, binding, type, group, icon, desc, buttonId}
  let filtered = [];
  let index = 0;

  function $id(id){ return document.getElementById(id); }

  function bindingsToText(id){
    if(!window.Keys) return '';
    const b = Keys.getBindings(id) || [];
    return b[0] || '';
  }

  // ── Complete tool registry ──────────────────────────────
  var TOOL_GROUPS = [
    { id: 'experten', label: 'Experten-Tools', icon: '\uD83C\uDFAF' },
    { id: 'klug',     label: 'KLUG-Tools',     icon: '\uD83E\uDDE0' },
    { id: 'future',   label: 'Future Lab',      icon: '\uD83D\uDD2E' },
    { id: 'features', label: 'Features',        icon: '\u26A1' },
    { id: 'actions',  label: 'Aktionen',        icon: '\u2328\uFE0F' }
  ];

  var TOOLS = [
    // ── Experten-Tools ──
    { id: 'tool.produzent',      label: 'Produzent',      icon: '\uD83C\uDFA4', group: 'experten', binding: 'E 1', buttonId: 'producer-refine-button',      desc: 'Professionelle Produktions-Perspektive' },
    { id: 'tool.musiker',        label: 'Musiker',        icon: '\uD83C\uDFB9', group: 'experten', binding: 'E 2', buttonId: 'musician-refine-button',      desc: 'Musikalische Tiefe und Arrangement' },
    { id: 'tool.filmkomponist',  label: 'Filmkomponist',  icon: '\uD83C\uDFAC', group: 'experten', binding: 'E 3', buttonId: 'composer-refine-button',      desc: 'Cinematic Scoring und Klanglandschaften' },
    { id: 'tool.dj-remixer',     label: 'DJ/Remixer',     icon: '\uD83C\uDFA7', group: 'experten', binding: 'E 4', buttonId: 'dj-refine-button',            desc: 'Club-taugliche Beats und Remix-Techniken' },
    { id: 'tool.avantgarde',     label: 'Avantgarde',     icon: '\uD83C\uDFA8', group: 'experten', binding: 'E 5', buttonId: 'avantgarde-refine-button',    desc: 'Experimentelle Klangwelten' },
    { id: 'tool.minimalist',     label: 'Minimalist',     icon: '\uD83D\uDD32', group: 'experten', binding: 'E 6', buttonId: 'minimalist-refine-button',    desc: 'Reduktion auf das Wesentliche' },
    { id: 'tool.vocal-harmony',  label: 'Vocal-Harmony',  icon: '\uD83C\uDFB5', group: 'experten', binding: 'E 7', buttonId: 'vocal-harmony-refine-button', desc: 'Mehrstimmige Arrangements' },
    { id: 'tool.ethno',          label: 'Ethno',          icon: '\uD83C\uDF0D', group: 'experten', binding: 'E 8', buttonId: 'ethno-refine-button',          desc: 'Weltmusik-Einfl\u00fcsse' },
    { id: 'tool.sound-ingenieur',label: 'Sound-Ingenieur',icon: '\uD83D\uDD27', group: 'experten', binding: 'E 9', buttonId: 'sound-engineer-button',       desc: 'Technische Klangoptimierung' },

    // ── KLUG-Tools ──
    { id: 'tool.synth-designer', label: 'Synth-Designer Lab', icon: '\uD83C\uDF9B\uFE0F', group: 'klug', binding: '',      buttonId: 'synth-designer-button',   desc: 'Synthesizer-Sounds und Klangdesign' },
    { id: 'tool.genre-mixer',    label: 'Genre-Mixer',        icon: '\uD83E\uDDEC',       group: 'klug', binding: 'K 1',   buttonId: 'genre-mixer-button',      desc: 'Kreative Genre-Kreuzungen' },
    { id: 'tool.hook-generator', label: 'Hook-Generator',     icon: '\uD83E\uDE9D',       group: 'klug', binding: 'K 3',   buttonId: 'hook-generator-button',   desc: 'Eing\u00e4ngige Melodien und Ohrwurm-Formeln' },
    { id: 'tool.song-struktur',  label: 'Song-Struktur',      icon: '\uD83C\uDFD7\uFE0F', group: 'klug', binding: 'K 4',   buttonId: 'song-structure-button',   desc: 'Professioneller Song-Aufbau' },
    { id: 'tool.vibe-veredler',  label: 'Vibe-Veredler',      icon: '\u2728',             group: 'klug', binding: 'K 5',   buttonId: 'vibe-enhancer-button',    desc: 'Atmosph\u00e4rische Verfeinerung' },
    { id: 'tool.kuenstler-kompass', label: 'K\u00fcnstler-Kompass', icon: '\uD83E\uDDD1\u200D\uD83C\uDFA4', group: 'klug', binding: 'K 6', buttonId: 'artist-suggester-button', desc: 'Stilistische Orientierung' },
    { id: 'tool.tempo-finder',   label: 'Tempo-Finder',       icon: '\u23F1\uFE0F',       group: 'klug', binding: 'K 7',   buttonId: 'tempo-finder-button',     desc: 'Optimales BPM und Rhythmus' },
    { id: 'tool.mood-analyzer',  label: 'Mood-Analyzer',      icon: '\uD83E\uDDED',       group: 'klug', binding: 'K 2',   buttonId: 'mood-analyzer-button',    desc: 'Stimmungsanalyse und Feinabstimmung' },
    { id: 'tool.production-finish', label: 'Production-Finish', icon: '\uD83D\uDC8E',     group: 'klug', binding: 'K 8',   buttonId: 'production-finish-button', desc: 'Finaler Feinschliff' },
    { id: 'tool.vocal-stylist',  label: 'Vocal-Stylist',      icon: '\uD83D\uDDE3\uFE0F', group: 'klug', binding: 'K 9',   buttonId: 'vocal-stylist-button',    desc: 'Gesangsstil und Vocal-Design' },
    { id: 'tool.groove-meister', label: 'Groove-Meister',     icon: '\uD83E\uDD41',       group: 'klug', binding: 'K 0\u21921', buttonId: 'groove-meister-button', desc: 'Rhythmus-Patterns und Groove' },
    { id: 'tool.performance-coach', label: 'Performance-Coach', icon: '\uD83C\uDFCB\uFE0F', group: 'klug', binding: 'K 0\u21922', buttonId: 'performance-coach-button', desc: 'Live-Performance und Energie' },
    { id: 'tool.effect-chain',   label: 'Effect-Chain',       icon: '\uD83D\uDD17',       group: 'klug', binding: 'K 0\u21923', buttonId: 'effect-chain-button', desc: 'Effektketten und Signal-Processing' },

    // ── Future Lab ──
    { id: 'tool.adaptive-flow',      label: 'Adaptive Flow',      icon: '\uD83C\uDF0A', group: 'future', binding: 'F 1', buttonId: 'adaptive-flow-button',      desc: 'Dynamische Prompt-Anpassung' },
    { id: 'tool.ai-collaboration',   label: 'AI Collaboration',   icon: '\uD83E\uDD16', group: 'future', binding: 'F 2', buttonId: 'ai-collab-button',          desc: 'KI-gest\u00fctzte Zusammenarbeit' },
    { id: 'tool.story-arc',          label: 'Story Arc Designer', icon: '\uD83D\uDCD6', group: 'future', binding: 'F 3', buttonId: 'story-arc-button',          desc: 'Narrative Spannungsb\u00f6gen' },
    { id: 'tool.narrative-chapters', label: 'Narrative Chapters', icon: '\uD83D\uDCDA', group: 'future', binding: 'F 4', buttonId: 'narrative-chapters-button', desc: 'Kapitelbasierte Erz\u00e4hlungen' },
    { id: 'tool.immersive-space',    label: 'Immersive Space',    icon: '\uD83C\uDF0C', group: 'future', binding: 'F 5', buttonId: 'immersive-space-button',    desc: 'R\u00e4umliche Klanglandschaften' },
    { id: 'tool.human-touch',        label: 'Human Touch',        icon: '\uD83E\uDEC0', group: 'future', binding: 'F 6', buttonId: 'human-touch-button',        desc: 'Menschliche W\u00e4rme und Organik' },
    { id: 'tool.release-forecast',   label: 'Release Forecast',   icon: '\uD83D\uDCCA', group: 'future', binding: 'F 7', buttonId: 'release-forecast-button',   desc: 'Trend-Analyse und Timing' },

    // ── Features (major modals / panels) ──
    { id: 'tool.idea-spark',    label: 'Ideen-Funke',          icon: '\u2728',       group: 'features', binding: '\u2318I', buttonId: 'idea-starter-tile',   desc: 'Song-Ideen als Starthilfe' },
    { id: 'tool.style-sync',    label: 'Stil-Synchronisator',  icon: '\u2194\uFE0F', group: 'features', binding: '\u2318Y', buttonId: 'style-sync-tile',     desc: '\u00dcbersetze zwischen Sound und Bild' },
    { id: 'tool.klang-studio',  label: 'Klang-Studio',         icon: '\uD83C\uDF9B\uFE0F', group: 'features', binding: '\u2318L', buttonId: 'klang-studio-tile', desc: 'Textbasiertes Sound-Design' },
  ];

  // ── Build full item list with category headers ──────────
  function refreshItems(){
    items = [];
    var keyActions = [];

    // Gather Keys actions (existing shortcuts / commands)
    if(window.Keys){
      var acts = Keys.listActions();
      keyActions = acts.map(function(a){
        return { id: a.id, label: a.label, binding: bindingsToText(a.id), type: 'action' };
      });
    }

    // Exclude palette-internal and tool-duplicate actions from the "Aktionen" group
    var excludeIds = new Set([
      'palette.open', 'palette.down', 'palette.up', 'palette.select',
      'chord.expert', 'chord.klug', 'chord.future', 'chord.nav',
      'open.idea-spark', 'open.style-sync', 'open.klang-studio',
      'cosmos.mark', 'cosmos.mark-note', 'cosmos.undo-mark', 'cosmos.reset'
    ]);
    var filteredActions = keyActions.filter(function(a){ return !excludeIds.has(a.id); });

    // Build grouped list: tool groups first, then actions
    TOOL_GROUPS.forEach(function(grp){
      if(grp.id === 'actions'){
        // Actions group: items from Keys.listActions()
        if(filteredActions.length === 0) return;
        items.push({ id: '_cat_' + grp.id, label: grp.icon + '  ' + grp.label, type: 'category' });
        filteredActions.forEach(function(a){
          items.push({ id: a.id, label: a.label, binding: a.binding, type: 'action', group: 'actions' });
        });
      } else {
        // Tool groups
        var groupTools = TOOLS.filter(function(t){ return t.group === grp.id; });
        if(groupTools.length === 0) return;
        items.push({ id: '_cat_' + grp.id, label: grp.icon + '  ' + grp.label, type: 'category' });
        groupTools.forEach(function(t){
          items.push({
            id: t.id,
            label: t.icon + '  ' + t.label,
            binding: t.binding || '',
            type: 'tool',
            group: t.group,
            buttonId: t.buttonId,
            desc: t.desc,
            searchText: t.label + ' ' + (t.desc || '') + ' ' + t.group
          });
        });
      }
    });
  }

  function fuzzy(q, str){
    q = q.toLowerCase(); str = (str||'').toLowerCase();
    return q.split(/\s+/).every(function(part){ return str.includes(part); });
  }

  function renderList(){
    const list = $id('cmdk-list');
    if(!list) return;
    list.innerHTML = '';
    let selectableIndex = 0;

    filtered.forEach(function(it){
      if(it.type === 'category'){
        // Render category header
        var cat = document.createElement('div');
        cat.className = 'cmdk-category';
        cat.innerHTML = '<div class="cmdk-category-label">' + it.label + '</div>';
        list.appendChild(cat);
      } else {
        // Render selectable item
        var row = document.createElement('div');
        var si = selectableIndex;
        row.className = 'cmdk-item' + (it.type === 'tool' ? ' cmdk-tool' : '') + (si === index ? ' active' : '');
        row.setAttribute('data-si', si);

        var labelHtml = '<div class="cmdk-label-group"><div class="cmdk-label">' + it.label + '</div>';
        if(it.desc){
          labelHtml += '<div class="cmdk-desc">' + it.desc + '</div>';
        }
        labelHtml += '</div>';

        var bindingHtml = it.binding ? '<div class="cmdk-binding">' + it.binding + '</div>' : '';
        row.innerHTML = labelHtml + bindingHtml;

        row.addEventListener('mouseenter', (function(idx){ return function(){ index = idx; setActive(); }; })(si));
        row.addEventListener('click', (function(idx){ return function(){ selectIndex(idx); }; })(si));
        list.appendChild(row);
        selectableIndex++;
      }
    });
  }

  // Get only selectable (non-category) items
  function selectableItems(){
    return filtered.filter(function(it){ return it.type !== 'category'; });
  }

  function setActive(){
    var list = $id('cmdk-list'); if(!list) return;
    var allItems = list.querySelectorAll('.cmdk-item');
    allItems.forEach(function(el){
      var si = parseInt(el.getAttribute('data-si'), 10);
      el.classList.toggle('active', si === index);
      if(si === index){
        el.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  function filter(q){
    if(!q){
      // Show all items (with categories)
      filtered = items.slice();
      index = 0;
      renderList();
      return;
    }

    var ql = q.toLowerCase();
    // Filter selectable items, then re-insert category headers for groups that have matches
    var matchedItems = items.filter(function(it){
      if(it.type === 'category') return false;
      var searchStr = it.label + ' ' + it.id + ' ' + (it.binding || '') + ' ' + (it.searchText || '') + ' ' + (it.desc || '');
      return fuzzy(ql, searchStr);
    });

    // Rebuild with category headers for matched groups
    var groupsWithMatches = new Set();
    matchedItems.forEach(function(it){ if(it.group) groupsWithMatches.add(it.group); });

    filtered = [];
    var currentGroup = null;
    matchedItems.forEach(function(it){
      if(it.group && it.group !== currentGroup){
        currentGroup = it.group;
        // Find and insert category header
        var catItem = items.find(function(c){ return c.id === '_cat_' + it.group; });
        if(catItem) filtered.push(catItem);
      }
      filtered.push(it);
    });

    index = 0;
    renderList();
  }

  function openPalette(){
    refreshItems();
    filter('');
    var overlay = $id('cmdk-overlay');
    if(!overlay) return;
    overlay.classList.remove('hidden');
    var card = $id('cmdk-container');
    if(card) card.classList.add('animate-zoom-in');
    open = true;
    // Phase 3 (P3-7): Push command-palette scope
    if(window.ScopeStack){
      overlay._scopeToken = ScopeStack.push('command-palette');
    }
    if(window.CloseStack) CloseStack.push(closePalette, { id: 'palette' });
    var input = $id('cmdk-input'); if(input){ input.value = ''; setTimeout(function(){ input.focus(); }, 10); }
  }

  function closePalette(){
    if(window.CloseStack) CloseStack.pop('palette');
    var overlay = $id('cmdk-overlay');
    // Phase 3 (P3-7): Pop command-palette scope
    if(window.ScopeStack && overlay && overlay._scopeToken){
      ScopeStack.pop(overlay._scopeToken);
      overlay._scopeToken = null;
    }
    if(overlay) overlay.classList.add('hidden');
    open = false;
  }

  function selectIndex(i){
    var selectable = selectableItems();
    var it = selectable[i]; if(!it) return;
    closePalette();

    if(it.type === 'tool'){
      // Open tool by clicking its button
      var btn = document.getElementById(it.buttonId);
      if(btn){
        btn.click();
      }
    } else if(it.type === 'action'){
      if(window.Keys){ Keys.run(it.id); }
    }
  }

  // Phase 2 (P2-8): Register palette navigation via Keys
  function registerPaletteKeys(){
    if(!window.Keys) return;

    Keys.register({ id:'palette.down', label:'Palette: N\u00e4chster', scope:'command-palette', priority:50,
      bindings:['ArrowDown'],
      when: function(){ return open && document.activeElement === $id('cmdk-input'); },
      run: function(){
        var max = selectableItems().length - 1;
        index = Math.min(index + 1, max);
        setActive();
      }
    });
    Keys.register({ id:'palette.up', label:'Palette: Vorheriger', scope:'command-palette', priority:50,
      bindings:['ArrowUp'],
      when: function(){ return open && document.activeElement === $id('cmdk-input'); },
      run: function(){ index = Math.max(index - 1, 0); setActive(); }
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
    document.getElementById('cmdk-input')?.addEventListener('input', function(e){ filter(e.target.value); });
    // Phase 2: palette arrow/enter now handled via Keys.register()
    registerPaletteKeys();
  }

  // HUD + pulse feedback
  function showHUD(text){
    var hud = $id('action-hud');
    if(!hud) return;
    hud.textContent = text;
    hud.classList.remove('hidden');
    hud.classList.add('show');
    clearTimeout(showHUD._t);
    showHUD._t = setTimeout(function(){ hud.classList.remove('show'); }, 900);
  }
  function pulse(sel){
    var el = sel && document.querySelector(sel);
    if(!el) return;
    el.classList.add('pulse');
    setTimeout(function(){ el.classList.remove('pulse'); }, 400);
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
  document.addEventListener('keys:action', function(e){
    var det = e.detail || {};
    if(det.id && det.label){ showHUD(det.label); pulse(targetFor(det.id)); }
  });

  // Phase 3 (P3-10): Scope-aware blocked feedback
  document.addEventListener('keys:blocked', function(e){
    var det = e.detail || {};
    if(!det.label) return;
    var msg;
    if(det.reason === 'guard'){
      msg = det.label + ' \u2013 nicht verf\u00fcgbar';
    } else if(det.reason === 'scope' && det.requiredScope){
      var scopeLabels = window.ScopeStack ? ScopeStack.SCOPE_LABELS : {};
      var scopeLabel = scopeLabels[det.requiredScope] || det.requiredScope;
      msg = det.label + ' \u2013 nur in ' + scopeLabel;
    } else {
      msg = det.label + ' \u2013 hier nicht aktiv';
    }
    showHUD(msg);
  });

  document.addEventListener('DOMContentLoaded', function(){ wire(); });

  // expose
  window.Palette = { open: openPalette, close: closePalette };
})();
