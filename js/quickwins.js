// quickwins.js - implements: history + favorites, character counter/compliance,
// presets, keyboard shortcuts, lint hints, template import/export.

(function(){
  const MAX_HISTORY = 20;
  const STORAGE_KEY = 'ssa_history_v1';

  // Curated Hinweise (German). IDs H01..H30
  const CURATED_HINTS = [
    { id: 'H01', text: 'Kein Gesangsstil erwähnt – füge eine klare Vocal-Charakteristik hinzu.' },
    { id: 'H02', text: 'Keine BPM/Tempo-Angabe – nenne ein passendes Tempo (z.B. 120 bpm oder "mid-tempo").' },
    { id: 'H03', text: 'Unklare Songstruktur – füge Tags wie [Verse] [Chorus] [Bridge] hinzu.' },
    { id: 'H04', text: 'Zu allgemeine Genre-Begriffe – nutze spezifischere Subgenres oder Hybrid-Stile.' },
    { id: 'H05', text: 'Keine Instrumentierung genannt – liste 2–4 Kerninstrumente mit klanglicher Charakterisierung.' },
    { id: 'H06', text: 'Fehlende Produktionsbegriffe – ergänze Mixing/Mastering-Termine (z.B. wide stereo image, analog warmth).' },
    { id: 'H07', text: 'Dynamikverlauf fehlt – beschreibe Aufbau, Peak und Ruhephasen.' },
    { id: 'H08', text: 'Raumklang unklar – nenne Hall/Delay-Charakter (z.B. gated reverb, slapback delay).' },
    { id: 'H09', text: 'Bass/Low-End nicht definiert – beschreibe Rolle und Textur des Bassbereichs.' },
    { id: 'H10', text: 'Drums/Groove fehlen – erwähne Kick/Snare/Hi-Hats oder ein präzises Groove-Feeling.' },
    { id: 'H11', text: 'Keine Sound-Referenzen – optional 1–2 Künstler/Ära als stilistische Orientierung hinzufügen.' },
    { id: 'H12', text: 'Stimmung zu vage – präzisiere die emotionale Tonalität in 2–3 Wörtern.' },
    { id: 'H13', text: 'Keine Titel-/Hook-Idee – gib einen möglichen Songtitel oder Hook-Stichwort an.' },
    { id: 'H14', text: 'Tonart/Skala optional – nenne Key/Mode, falls musikalisch wichtig (z.B. A minor, Dorian).' },
    { id: 'H15', text: 'Layering fehlt – beschreibe sinnvolle Layer (Pads, Plucks, Texturen) zur Tiefe.' },
    { id: 'H16', text: 'Stereo-Bild – gib Breite oder Mono-Fokus für bestimmte Elemente an.' },
    { id: 'H17', text: 'Vintage vs. Modern – lege die Ästhetik fest (analog/vintage vs. clean/modern).' },
    { id: 'H18', text: 'Energie-Kurve – definiere Intensität je Abschnitt (zur/abnehmend, Drop, Finale).' },
    { id: 'H19', text: 'Transienten/Attack – beschreibe Punch vs. smooth bei Drums/Bass/Leads.' },
    { id: 'H20', text: 'Artefakt-Ästhetik – z.B. Tape hiss, Vinyl crackle, Bitcrush subtil einsetzen.' },
    { id: 'H21', text: 'Arrangement-Dichte – entscheide zwischen minimalistisch vs. dicht/mehrschichtig.' },
    { id: 'H22', text: 'Übergänge – plane Risers, Fills, Filter-Sweeps oder Drops für Sections.' },
    { id: 'H23', text: 'Vocal-Platzierung – Lead im Vordergrund? Harmonien, Ad-libs, Call & Response?' },
    { id: 'H24', text: 'Lyrische Perspektive – Ich/Wir/Du/Sie, ggf. kurzer Themenfokus oder Bildsprache.' },
    { id: 'H25', text: 'Taktart/Feel – 4/4, 3/4, 6/8, Shuffle oder Swing falls relevant.' },
    { id: 'H26', text: 'Tonale/Atmosphärische Kontraste – warm/kalt, hell/dunkel, rau/edel klarer markieren.' },
    { id: 'H27', text: 'Signature-Sound – nenne ein prägendes Sound-Design-Element als Wiedererkennungsmerkmal.' },
    { id: 'H28', text: 'Mastering-Ziel – Radio/Streaming/Vinyl; laut/clean vs. dynamisch/natürlich.' },
    { id: 'H29', text: 'Outro/Ende – Fade-out, abruptes Ende, Stinger oder Reprise definieren.' },
    { id: 'H30', text: 'Redundanz – straffe Formulierungen, streiche Füllwörter und Dopplungen.' }
  ];

  // Smart hint selection state
  let lastRuleHint = null;
  let lastSmartHintId = null;
  let smartHintsTimer = null;
  let smartHintsRunCounter = 0;
  let smartHintsStatus = 'idle'; // 'idle' | 'loading' | 'ready' | 'error'

  const PRESETS = [
    { id: 'cinematic', label: 'Cinematic', text: 'Cinematic score about an ocean journey; strings, brass, deep percussion; evolving arcs; emotional climax.' },
    { id: 'electronic', label: 'Electronic', text: 'Atmospheric electronic track with warm analog synths, rolling bassline, crisp drums; nocturnal city vibe.' },
    { id: 'indie', label: 'Indie', text: 'Indie pop/rock with jangly guitars, melodic bass, tight drums; bittersweet summer nostalgia.' },
    { id: 'hiphop', label: 'Hip-Hop', text: 'Moody hip-hop beat; dusty samples, punchy drums, layered 808s; reflective late-night mood.' },
    { id: 'ambient', label: 'Ambient', text: 'Deep ambient soundscape; shimmering pads, granular textures, distant chimes; slow evolving movement.' }
  ];

  // Utilities
  function $(id){ return document.getElementById(id); }
  function now(){ return Date.now(); }
  function fmtDate(ts){
    try { return new Date(ts).toLocaleString(); } catch { return '' }
  }
  function safeJSONParse(s){ try { return JSON.parse(s); } catch { return null; } }

  // History handling
  function loadHistory(){
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = safeJSONParse(raw) || [];
    return Array.isArray(arr) ? arr : [];
  }
  function saveHistory(list){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_HISTORY)));
  }
  function addHistoryItem({content, idea, meta}){
    if(!content) return;
    const list = loadHistory();
    const id = `${now()}_${Math.random().toString(36).slice(2,8)}`;
    const item = { id, content, idea: idea || '', favorite: false, createdAt: now(), meta: meta||{} };
    // Avoid duplicate consecutive content
    if(list[0] && list[0].content === content) return;
    list.unshift(item);
    saveHistory(list);
    renderHistory();
    return item;
  }
  function setFavorite(id, fav){
    const list = loadHistory();
    const idx = list.findIndex(i=>i.id===id);
    if(idx>-1){ list[idx].favorite = !!fav; saveHistory(list); renderHistory(); }
  }
  function deleteItem(id){
    const list = loadHistory().filter(i=>i.id!==id);
    saveHistory(list); renderHistory();
  }

  // Export/Import (single prompt)
  function exportCurrentPrompt(){
    const content = getCurrentPrompt();
    if(!content){ alert('Kein Prompt vorhanden.'); return; }
    const idea = getCurrentIdea();
    const blob = new Blob([JSON.stringify({ content, idea, exportedAt: now() }, null, 2)], {type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'prompt.json'; a.click(); URL.revokeObjectURL(a.href);
  }
  function importPromptFromFile(file){
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = safeJSONParse(reader.result);
      if(data && data.content){
        setCurrentPrompt(data.content);
        if(data.idea) setCurrentIdea(data.idea);
        onPromptUpdated({source:'import'});
      } else {
        alert('Ungültige Datei.');
      }
    };
    reader.readAsText(file);
  }

  // Export/Import (history)
  function exportHistory(){
    const list = loadHistory();
    const blob = new Blob([JSON.stringify({ items: list, exportedAt: now() }, null, 2)], {type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'history.json'; a.click(); URL.revokeObjectURL(a.href);
  }
  function importHistoryFromFile(file){
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = safeJSONParse(reader.result);
      if(data && Array.isArray(data.items)){
        const existing = loadHistory();
        const merged = [...data.items, ...existing].sort((a,b)=> (b.createdAt||0)-(a.createdAt||0));
        saveHistory(merged);
        renderHistory();
      } else {
        alert('Ungültige Datei.');
      }
    };
    reader.readAsText(file);
  }

  // Accessors to current prompt/idea
  function getCurrentPrompt(){ const el = $('result-text'); return el ? el.textContent.trim() : ''; }
  function setCurrentPrompt(t){ const el = $('result-text'); if(el){ el.textContent = t||''; } }
  function getCurrentIdea(){ const el = $('idea-input'); return el ? el.value.trim() : ''; }
  function setCurrentIdea(t){ const el = $('idea-input'); if(el){ el.value = t||''; el.dispatchEvent(new Event('input')); } }

  // Character stats and compliance
  function updateCharStats(){
    const prompt = getCurrentPrompt();
    const n = prompt.length;
    const pro = n <= 1000;
    const stats = $('char-stats');
    if(!stats) return;
    const proCls = pro ? 'ok' : 'err';
    stats.innerHTML = `Chars: <span class=\"badge ${pro? 'ok':'err'}\">${n}</span> · Pro <1000: <span class=\"badge ${proCls}\">${pro? 'OK':'OVER'}</span>`;
  }

  function autoTrimV3(){
    let t = getCurrentPrompt();
    if(!t) return;
    if(t.length <= 200){ alert('Prompt ist bereits ≤ 200 Zeichen.'); return; }
    // Heuristic trim: remove filler words and compress
    const fillers = /(very|really|extremely|highly|super|quite|some|kind of|sort of)/gi;
    t = t.replace(fillers, '')
         .replace(/\s{2,}/g, ' ')
         .replace(/\s*,\s*,+/g, ',')
         .trim();
    if(t.length > 200){ t = t.slice(0, 200).replace(/\s+\S*$/, '').trim(); }
    setCurrentPrompt(t);
    updateCharStats();
    runLint();
  }

  // Render combined hints (rule-based + AI-selected)
  function updateHintsUI(){
    const box = $('lint-hints');
    if(!box) return;
    let chosen = null;
    const aiText = lastSmartHintId ? (CURATED_HINTS.find(h => h.id === lastSmartHintId)?.text || null) : null;

    if (aiText) {
      chosen = aiText;
    } else if (lastRuleHint) {
      chosen = lastRuleHint;
    }

    if (!chosen && smartHintsStatus !== 'loading') {
      box.innerHTML = '';
      return;
    }

    const pill = chosen ? `<span class=\"badge warn\" style=\"margin-right:6px\">${chosen}</span>` : '';
    const aiBadge = smartHintsStatus === 'loading' ? `<span class=\"badge\" style=\"margin-left:4px\">KI analysiert…</span>` : '';
    box.innerHTML = `${chosen ? 'Hinweis: ' : ''}${pill}${!chosen ? aiBadge : aiBadge}`;
  }

  // LLM-based smart hint selection (debounced)
  function scheduleSmartHints(){
    clearTimeout(smartHintsTimer);
    const prompt = getCurrentPrompt();
    if(!prompt){
      lastSmartHintId = null;
      smartHintsStatus = 'idle';
      updateHintsUI();
      return;
    }
    if(!window.API_KEY){
      // No API key set: skip AI hints
      lastSmartHintId = null;
      smartHintsStatus = 'idle';
      updateHintsUI();
      return;
    }
    smartHintsStatus = 'loading';
    updateHintsUI();
    smartHintsTimer = setTimeout(()=> runSmartHintsOnce(prompt), 800);
  }

  async function runSmartHintsOnce(prompt){
    const runId = ++smartHintsRunCounter;
    try{
      const hintsList = CURATED_HINTS.map(h=>`${h.id}: ${h.text}`).join('\n');
      const userMessage = `USER_PROMPT:\n${prompt}\n\nHINTS:\n${hintsList}\n\nReturn JSON with selected ID.`;
      const raw = await callOpenRouterAPI(userMessage, HINT_SELECTOR_PROMPT);
      // best-effort JSON extraction
      const jsonText = (raw.match(/\{[\s\S]*\}/) || [raw])[0];
      const parsed = JSON.parse(jsonText);
      let id = null;
      if (typeof parsed?.hint === 'string') {
        id = parsed.hint;
      } else if (Array.isArray(parsed?.hints) && parsed.hints.length > 0) {
        id = parsed.hints[0]; // tolerate older format
      }
      const known = new Set(CURATED_HINTS.map(h=>h.id));
      const finalId = (typeof id === 'string' && known.has(id)) ? id : null;
      if(runId !== smartHintsRunCounter) return; // stale
      lastSmartHintId = finalId;
      smartHintsStatus = 'ready';
      updateHintsUI();
    } catch(e){
      if(runId !== smartHintsRunCounter) return;
      smartHintsStatus = 'error';
      updateHintsUI();
    }
  }

  // Linting suggestions (rule-based quick checks) + trigger AI
  function runLint(){
    const prompt = getCurrentPrompt();
    const hints = [];
    if(!/\b(bpm|BPM|\d{2,3}\s?bpm)\b/.test(prompt)) hints.push('Kein BPM gefunden – füge z.B. "120 bpm" hinzu.');
    if(!/vocal|vocals|singer|choir/i.test(prompt)) hints.push('Kein Gesangsstil erwähnt – füge eine klare Vocal-Charakteristik hinzu.');
    if(!/\b(kick|snare|drums|percussion|beat)\b/i.test(prompt)) hints.push('Keine Rhythmus-/Drum-Hinweise – ein kurzer Hinweis kann helfen.');
    if(/,{2,}/.test(prompt)) hints.push('Doppelte Kommas gefunden – bereinige die Aufzählungen.');
    if(prompt.split(/\s+/).length>150) hints.push('Sehr viele Wörter – erwäge eine Verdichtung.');
    lastRuleHint = hints[0] || null;
    updateHintsUI();
    scheduleSmartHints();
  }

  // Clean up old template data from localStorage
  function cleanupOldTemplateData() {
    const oldKeys = ['suno_templates_v1', 'ssa_user_templates_v1'];
    oldKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`Cleaned up old template data: ${key}`);
      }
    });
  }

  // Presets only (templates removed)

  function renderPresets(){
    const c = $('preset-chips'); if(!c) return;
    c.innerHTML = '';
    const max = 10; let count = 0;
    PRESETS.forEach(p=>{
      if(count>=max){ return; }
      const b = document.createElement('button');
      b.className = 'chip'; b.textContent = p.label; b.title = p.text;
      b.addEventListener('click', ()=>{ setCurrentIdea(p.text); });
      c.appendChild(b); count++;
    });
  }


  // History UI
  function renderHistory(){
    const listEl = $('history-list'); if(!listEl) return;
    const items = loadHistory();
    listEl.innerHTML = '';
    items.forEach(item=>{
      const div = document.createElement('div');
      div.className = 'history-item p-4';
      div.innerHTML = `
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="history-title text-base text-neutral-200">${escapeHtml(item.content)}</div>
            <div class="history-meta">${fmtDate(item.createdAt)} ${item.idea? '· '+escapeHtml(item.idea): ''}</div>
          </div>
          <button class="favorite-btn ${item.favorite? 'text-yellow-400':'text-neutral-400'}" title="Favorit">★</button>
        </div>
        <div class="history-actions mt-2 flex gap-2">
          <button class="text-sm px-3 py-1.5 rounded bg-neutral-800/70 border border-neutral-700 hover:bg-neutral-700" data-act="restore">Wiederherstellen</button>
          <button class="text-sm px-3 py-1.5 rounded bg-neutral-800/70 border border-neutral-700 hover:bg-neutral-700" data-act="duplicate">Duplizieren</button>
          <button class="text-sm px-3 py-1.5 rounded bg-red-900/40 border border-red-700 hover:bg-red-800/60" data-act="delete">Löschen</button>
        </div>`;
      // wire
      div.querySelector('.favorite-btn').addEventListener('click', ()=> setFavorite(item.id, !item.favorite));
      div.querySelector('[data-act="restore"]').addEventListener('click', ()=>{
        setCurrentPrompt(item.content);
        setCurrentIdea(item.idea || '');
        // Ensure UI reflects restored state
        const initial = $('initial-state'); const resultC = $('result-container'); const ref = $('refinement-controls');
        if(initial) initial.classList.add('hidden');
        if(resultC) resultC.classList.remove('hidden');
        if(ref) ref.classList.remove('hidden');
        if(typeof setKlugToolsState==='function') setKlugToolsState(true);
        closeHistory();
        onPromptUpdated({source:'restore'});
      });
      div.querySelector('[data-act="duplicate"]').addEventListener('click', ()=>{
        const dup = addHistoryItem({content:item.content, idea:item.idea, meta:{source:'duplicate'}}); if(dup){ setFavorite(dup.id, item.favorite); }
      });
      div.querySelector('[data-act="delete"]').addEventListener('click', ()=> deleteItem(item.id));
      listEl.appendChild(div);
    });
  }

  // Keyboard shortcuts & help
  function registerKeybindings(){
    if(!window.Keys) return; // fallback to none if registry missing

    const resExists = () => !!getCurrentPrompt();

    Keys.register({ id:'focus.idea', label:'Fokus: Vision', scope:'global', bindings:['Slash'], run:()=> $('idea-input')?.focus() });

    Keys.register({ id:'generate', label:'Generieren', scope:'global', bindings:['KeyG','Mod+Enter'], run:()=> $('generate-button')?.click() });

    Keys.register({ id:'refine.pro', label:'Für Pro', scope:'global', bindings:['KeyP'], when:resExists, run:()=> $('suno-pro-button')?.click() });

    Keys.register({ id:'copy.result', label:'Ergebnis kopieren', scope:'global', bindings:['KeyC'], when:resExists, run:()=> (window.copyResult && window.copyResult()) });

    Keys.register({ id:'history.toggle', label:'Verlauf', scope:'global', bindings:['KeyH'], run:()=> $('history-toggle-button')?.click() });

    Keys.register({ id:'auto.trim', label:'Auto-Trim 200', scope:'global', bindings:['KeyB'], when:resExists, run:()=> $('auto-trim-v3-button')?.click() });

    Keys.register({ id:'help.shortcuts', label:'Tastenkürzel', scope:'any', bindings:['Shift+Slash'], run:()=> openShortcutModal() });

    Keys.register({ id:'palette.open', label:'Befehlspalette', scope:'any', bindings:['Mod+K'], run:()=> window.Palette && window.Palette.open() });
  }
  function openShortcutModal(){
    const m = document.getElementById('shortcut-modal');
    if(!m) return;
    m.classList.remove('hidden');
    const card = m.querySelector('.modal-content') || m.querySelector('.relative,.p-6');
    if(card) card.classList.add('animate-zoom-in');
    // Close handlers
    const close = ()=> m.classList.add('hidden');
    document.getElementById('shortcut-close')?.addEventListener('click', close, { once: true });
    m.querySelector('.absolute')?.addEventListener('click', close, { once: true });
  }

  // History panel controls
  function toggleHistory(){
    const panel = $('history-panel'); const ov = $('history-overlay');
    if(!panel||!ov) return;
    const open = !panel.classList.contains('open');
    if(open){ panel.classList.add('open'); ov.classList.remove('hidden'); renderHistory(); }
    else { panel.classList.remove('open'); ov.classList.add('hidden'); }
  }
  function closeHistory(){ const p=$('history-panel'), o=$('history-overlay'); if(p&&o){ p.classList.remove('open'); o.classList.add('hidden'); } }

  // Helpers
  function escapeHtml(s){ return (s||'').replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c])); }

  // Public hook: call whenever prompt changes meaningfully
  function onPromptUpdated(meta){ updateCharStats(); runLint(); addHistoryItem({content:getCurrentPrompt(), idea:getCurrentIdea(), meta}); }

  // Observe result-text for updates to keep stats fresh
  function observeResult(){
    const el = $('result-text'); if(!el) return;
    const mo = new MutationObserver(()=>{ updateCharStats(); runLint(); });
    mo.observe(el, { childList: true, characterData: true, subtree: true });
  }

  // Wire UI events
  function wireUI(){
    $('auto-trim-v3-button')?.addEventListener('click', autoTrimV3);
    $('export-prompt-button')?.addEventListener('click', exportCurrentPrompt);
    $('import-prompt-button')?.addEventListener('click', ()=> $('import-prompt-file')?.click());
    $('import-prompt-file')?.addEventListener('change', (e)=> importPromptFromFile(e.target.files?.[0]));

    $('history-toggle-button')?.addEventListener('click', toggleHistory);
    $('history-close')?.addEventListener('click', closeHistory);
    $('history-overlay')?.addEventListener('click', closeHistory);
    $('history-export-all')?.addEventListener('click', exportHistory);
    $('history-import')?.addEventListener('click', ()=> $('history-import-file')?.click());
    $('history-import-file')?.addEventListener('change', (e)=> importHistoryFromFile(e.target.files?.[0]));
    $('history-clear')?.addEventListener('click', ()=>{ if(confirm('Verlauf wirklich leeren?')){ saveHistory([]); renderHistory(); }});

  }

  function init(){
    cleanupOldTemplateData();
    renderPresets();
    updateCharStats();
    runLint();
    observeResult();
    registerKeybindings();
    wireUI();
  }

  // expose minimal API for integration points
  window.QW = { onPromptUpdated, addHistoryItem };

  document.addEventListener('DOMContentLoaded', init);
})();
