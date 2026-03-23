// Kachel-System — Erweiterungen für das Bottom-Dashboard
// Modularer Aufbau: jedes Feature wird über ein eigenes init registriert.

(function () {
    'use strict';

    /* ------------------------------------------------------------------ */
    /*  Feature: Tool-Tooltips (Shift + Hover, 300 ms Verzögerung)        */
    /* ------------------------------------------------------------------ */

    var tooltipEl = null;
    var tooltipTimeout = null;
    var shiftHeld = false;
    var currentCard = null;

    function createTooltip(dashboard) {
        tooltipEl = document.createElement('div');
        tooltipEl.className = 'bd-tooltip';
        tooltipEl.id = 'bd-tooltip';
        tooltipEl.setAttribute('role', 'tooltip');
        tooltipEl.setAttribute('aria-hidden', 'true');
        tooltipEl.style.display = 'none';
        dashboard.appendChild(tooltipEl);

        // Hide via display:none after fade-out transition ends
        tooltipEl.addEventListener('transitionend', function (e) {
            if (e.propertyName === 'opacity' && !tooltipEl.classList.contains('bd-tooltip-visible')) {
                tooltipEl.style.display = 'none';
            }
        });
    }

    function showTooltip(card) {
        if (!tooltipEl) return;

        var desc = card.getAttribute('data-desc');
        var name = card.getAttribute('data-tool-name');
        var emoji = card.getAttribute('data-tool-emoji');
        var col = card.getAttribute('data-col');
        if (!desc) return;

        // SAFETY: data-* attributes are set from hardcoded BD_TOOLS — no user input
        tooltipEl.innerHTML =
            '<span class="bd-tooltip-head">' + emoji + ' <strong>' + name + '</strong></span>' +
            '<span class="bd-tooltip-desc">' + desc + '</span>';

        // Spalten-Akzent
        tooltipEl.classList.remove('bd-tooltip-col-1', 'bd-tooltip-col-2', 'bd-tooltip-col-3');
        tooltipEl.classList.add('bd-tooltip-col-' + col);

        // Position berechnen
        var cardRect = card.getBoundingClientRect();
        var dashRect = card.closest('.bottom-dashboard').getBoundingClientRect();

        // Tooltip kurz sichtbar machen (opacity 0), um Maße zu erhalten
        tooltipEl.style.visibility = 'hidden';
        tooltipEl.style.display = 'block';
        tooltipEl.style.opacity = '0';
        var tipW = tooltipEl.offsetWidth;
        var tipH = tooltipEl.offsetHeight;

        // Zentriert über der Kachel
        var left = (cardRect.left + cardRect.width / 2) - dashRect.left - (tipW / 2);
        // Clamp innerhalb des Dashboards
        left = Math.max(4, Math.min(left, dashRect.width - tipW - 4));

        // Über oder unter der Kachel (je nach Platz)
        var spaceAbove = cardRect.top - dashRect.top;
        var top;
        if (spaceAbove >= tipH + 8) {
            top = (cardRect.top - dashRect.top) - tipH - 6;
        } else {
            top = (cardRect.bottom - dashRect.top) + 6;
        }

        tooltipEl.style.left = left + 'px';
        tooltipEl.style.top = top + 'px';
        tooltipEl.style.visibility = '';
        tooltipEl.style.display = 'block';

        // Einblenden
        requestAnimationFrame(function () {
            tooltipEl.classList.add('bd-tooltip-visible');
            tooltipEl.setAttribute('aria-hidden', 'false');
        });

        // aria-describedby linkage
        card.setAttribute('aria-describedby', 'bd-tooltip');
    }

    function hideTooltip() {
        clearTimeout(tooltipTimeout);
        tooltipTimeout = null;
        if (!tooltipEl) return;
        tooltipEl.classList.remove('bd-tooltip-visible');
        tooltipEl.setAttribute('aria-hidden', 'true');

        // Remove aria-describedby from current card
        if (currentCard) {
            currentCard.removeAttribute('aria-describedby');
        }
    }

    function startTooltipTimer(card) {
        clearTimeout(tooltipTimeout);
        tooltipTimeout = setTimeout(function () {
            if (shiftHeld) showTooltip(card);
        }, 300);
    }

    function handleMouseEnter(e) {
        var card = e.target.closest('.bd-tool-card');
        if (!card) return;

        // Skip re-entry into the same card (fired by child elements in capture phase)
        if (card === currentCard) return;
        currentCard = card;

        if (!e.shiftKey) return;

        startTooltipTimer(card);
    }

    function handleMouseLeave(e) {
        var card = e.target.closest('.bd-tool-card');
        if (!card) return;

        // Only act if we're truly leaving the current card, not moving between children
        if (card !== currentCard) return;
        if (e.relatedTarget && card.contains(e.relatedTarget)) return;

        currentCard = null;
        hideTooltip();
    }

    function handleKeyUp(e) {
        if (e.key === 'Shift') {
            shiftHeld = false;
            hideTooltip();
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Shift') {
            shiftHeld = true;
            // If mouse is already over a card, start the tooltip timer
            if (currentCard) {
                startTooltipTimer(currentCard);
            }
        }
    }

    function initTooltips() {
        var dashboard = document.querySelector('.bottom-dashboard');
        if (!dashboard) return;

        createTooltip(dashboard);

        // Event-Delegation auf jede Spalten-Liste
        var lists = dashboard.querySelectorAll('.bd-tool-list');
        lists.forEach(function (list) {
            list.addEventListener('mouseenter', handleMouseEnter, true);
            list.addEventListener('mouseleave', handleMouseLeave, true);
        });

        document.addEventListener('keyup', handleKeyUp);
        document.addEventListener('keydown', handleKeyDown);
    }

    /* ------------------------------------------------------------------ */
    /*  Feature: Per-Column Search/Filter (#97)                          */
    /* ------------------------------------------------------------------ */

    function initSearch() {
        var dashboard = document.querySelector('.bottom-dashboard');
        if (!dashboard) return;

        [1, 2, 3].forEach(function (colNum) {
            var column = document.getElementById('bd-col-' + colNum);
            if (!column) return;

            var header = column.querySelector('.bd-column-header');
            var toolList = column.querySelector('.bd-tool-list');
            var toggle = column.querySelector('.bd-search-toggle');
            if (!header || !toolList || !toggle) return;

            // Create search bar element between header and tool-list
            var searchBar = document.createElement('div');
            searchBar.className = 'bd-search-bar';
            searchBar.innerHTML =
                '<div class="bd-search-bar-inner">' +
                    '<input type="text" class="bd-search-input" placeholder="Tools durchsuchen\u2026" aria-label="Tools in Spalte ' + colNum + ' durchsuchen">' +
                    '<button class="bd-search-close" aria-label="Suche schlie\u00dfen">\u2715</button>' +
                '</div>';

            // Insert between header and tool-list
            column.insertBefore(searchBar, toolList);

            var input = searchBar.querySelector('.bd-search-input');
            var closeBtn = searchBar.querySelector('.bd-search-close');

            // Empty state element (created once, appended/removed as needed)
            var emptyState = document.createElement('div');
            emptyState.className = 'bd-empty-state';
            emptyState.textContent = 'Keine Tools gefunden';

            function openSearch() {
                searchBar.classList.add('bd-search-open');
                // Focus after transition
                setTimeout(function () { input.focus(); }, 210);
            }

            function closeSearch() {
                searchBar.classList.remove('bd-search-open');
                input.value = '';
                clearFilter();
            }

            function clearFilter() {
                var cards = toolList.querySelectorAll('.bd-tool-card');
                cards.forEach(function (card) {
                    card.classList.remove('bd-card-hidden');
                });
                // Remove empty state if present
                var existing = toolList.querySelector('.bd-empty-state');
                if (existing) existing.remove();
            }

            function filterCards() {
                var query = input.value.toLowerCase().trim();
                var cards = toolList.querySelectorAll('.bd-tool-card');
                var visibleCount = 0;

                cards.forEach(function (card) {
                    if (!query) {
                        card.classList.remove('bd-card-hidden');
                        visibleCount++;
                        return;
                    }

                    var name = (card.querySelector('.bd-tool-name') ?
                        card.querySelector('.bd-tool-name').textContent : '').toLowerCase();
                    var desc = (card.getAttribute('data-desc') || '').toLowerCase();

                    if (name.indexOf(query) !== -1 || desc.indexOf(query) !== -1) {
                        card.classList.remove('bd-card-hidden');
                        visibleCount++;
                    } else {
                        card.classList.add('bd-card-hidden');
                    }
                });

                // Empty state handling
                var existing = toolList.querySelector('.bd-empty-state');
                if (visibleCount === 0 && query) {
                    if (!existing) toolList.appendChild(emptyState);
                } else {
                    if (existing) existing.remove();
                }
            }

            // Toggle search on icon click
            toggle.addEventListener('click', function (e) {
                e.stopPropagation();
                if (searchBar.classList.contains('bd-search-open')) {
                    closeSearch();
                } else {
                    openSearch();
                }
            });

            // Close button
            closeBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                closeSearch();
            });

            // Real-time filtering
            input.addEventListener('input', filterCards);

            // Escape key closes search
            input.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') {
                    closeSearch();
                }
            });
        });
    }

    /* ------------------------------------------------------------------ */
    /*  Feature: Tool Favorites / Pinning (#98)                          */
    /* ------------------------------------------------------------------ */

    var PINNING_KEY = 'ssa_bd_favorites_v1';
    var originalOrder = {}; // { "1": ["producer-refine-button", ...], ... }
    var favorites = {};     // { "1": ["some-button-id", ...], ... }

    function loadFavorites() {
        try {
            var stored = localStorage.getItem(PINNING_KEY);
            if (stored) {
                favorites = JSON.parse(stored);
            }
        } catch (e) {
            favorites = {};
        }
        // Ensure each column has an array
        [1, 2, 3].forEach(function (c) {
            if (!Array.isArray(favorites[c])) favorites[c] = [];
        });
    }

    function saveFavorites() {
        try {
            localStorage.setItem(PINNING_KEY, JSON.stringify(favorites));
        } catch (e) { /* quota exceeded — silently ignore */ }
    }

    function isPinned(colId, buttonId) {
        return favorites[colId] && favorites[colId].indexOf(buttonId) !== -1;
    }

    function getFavorites() {
        return favorites;
    }

    function reorderColumn(colId) {
        var list = document.getElementById('bd-list-' + colId);
        if (!list) return;

        var cards = Array.prototype.slice.call(list.querySelectorAll('.bd-tool-card'));
        var pinnedIds = favorites[colId] || [];
        var origIds = originalOrder[colId] || [];

        // Remove existing separator
        var oldSep = list.querySelector('.bd-pin-separator');
        if (oldSep) oldSep.remove();

        // Sort cards: pinned first (in pin order), then unpinned (in original order)
        cards.sort(function (a, b) {
            var aId = a.getAttribute('data-button-id');
            var bId = b.getAttribute('data-button-id');
            var aPinned = pinnedIds.indexOf(aId) !== -1;
            var bPinned = pinnedIds.indexOf(bId) !== -1;

            if (aPinned && bPinned) {
                return pinnedIds.indexOf(aId) - pinnedIds.indexOf(bId);
            }
            if (aPinned && !bPinned) return -1;
            if (!aPinned && bPinned) return 1;
            // Both unpinned — original order
            return origIds.indexOf(aId) - origIds.indexOf(bId);
        });

        // Re-append in sorted order (moves, preserves listeners)
        var hasPinned = false;
        cards.forEach(function (card) {
            var btnId = card.getAttribute('data-button-id');
            var pinned = pinnedIds.indexOf(btnId) !== -1;

            if (pinned) {
                card.classList.add('bd-pinned');
                card.querySelector('.bd-pin-btn').textContent = '\u2605';
                hasPinned = true;
            } else {
                card.classList.remove('bd-pinned');
                card.querySelector('.bd-pin-btn').textContent = '\u2606';
            }

            list.appendChild(card);
        });

        // Insert separator between pinned and unpinned
        if (hasPinned && pinnedIds.length < cards.length) {
            var sep = document.createElement('div');
            sep.className = 'bd-pin-separator';
            // Find the first unpinned card
            var firstUnpinned = list.querySelector('.bd-tool-card:not(.bd-pinned)');
            if (firstUnpinned) {
                list.insertBefore(sep, firstUnpinned);
            }
        }

        // Update column count to show pinned count
        updateColumnCount(colId, pinnedIds.length, cards.length);
    }

    function updateColumnCount(colId, pinnedCount, totalCount) {
        var col = document.getElementById('bd-col-' + colId);
        if (!col) return;
        var countEl = col.querySelector('.bd-column-count');
        if (!countEl) return;

        if (pinnedCount > 0) {
            countEl.textContent = '\u2605' + pinnedCount + ' / ' + totalCount;
        } else {
            countEl.textContent = totalCount;
        }
    }

    function initPinning() {
        loadFavorites();

        // Capture original card order before any reordering
        [1, 2, 3].forEach(function (colId) {
            var list = document.getElementById('bd-list-' + colId);
            if (!list) return;
            var cards = list.querySelectorAll('.bd-tool-card');
            originalOrder[colId] = [];
            cards.forEach(function (card) {
                originalOrder[colId].push(card.getAttribute('data-button-id'));
            });
        });

        // Set up event delegation for pin buttons on each list
        [1, 2, 3].forEach(function (colId) {
            var list = document.getElementById('bd-list-' + colId);
            if (!list) return;

            list.addEventListener('click', function (e) {
                var pinBtn = e.target.closest('.bd-pin-btn');
                if (!pinBtn) return;

                e.stopPropagation();

                var buttonId = pinBtn.getAttribute('data-button-id');
                if (!buttonId) return;

                var idx = favorites[colId].indexOf(buttonId);
                if (idx !== -1) {
                    // Unpin
                    favorites[colId].splice(idx, 1);
                } else {
                    // Pin — add to end of pinned list
                    favorites[colId].push(buttonId);
                }

                saveFavorites();
                reorderColumn(colId);
            });

            // Initial reorder based on saved favorites
            reorderColumn(colId);
        });

        // Expose API for other features
        window.BdPinning = {
            reorderColumn: reorderColumn,
            isPinned: isPinned,
            getFavorites: getFavorites
        };
    }

    /* ------------------------------------------------------------------ */
    /*  Feature: Undo Stack for Tool Applications (#100)                 */
    /* ------------------------------------------------------------------ */

    var undoStack = [];  // [{text, toolName, ts}]
    var redoStack = [];
    var UNDO_MAX = 20;

    function undoCaptureBeforeApply(toolName) {
        var resultEl = document.getElementById('result-text');
        if (!resultEl) return;
        var text = resultEl.textContent || resultEl.innerText || '';
        undoStack.push({ text: text, toolName: toolName || 'Tool', ts: Date.now() });
        if (undoStack.length > UNDO_MAX) undoStack.shift();
        redoStack = []; // clear redo on new action
        undoUpdateUI();
    }

    function undoPerform() {
        if (undoStack.length === 0) return;
        var entry = undoStack.pop();
        var resultEl = document.getElementById('result-text');
        if (!resultEl) return;
        // Save current state to redo
        redoStack.push({ text: resultEl.textContent || '', toolName: entry.toolName, ts: Date.now() });
        resultEl.textContent = entry.text;
        undoUpdateUI();
    }

    function redoPerform() {
        if (redoStack.length === 0) return;
        var entry = redoStack.pop();
        var resultEl = document.getElementById('result-text');
        if (!resultEl) return;
        // Save current state to undo
        undoStack.push({ text: resultEl.textContent || '', toolName: entry.toolName, ts: Date.now() });
        resultEl.textContent = entry.text;
        undoUpdateUI();
    }

    function undoUpdateUI() {
        var undoBtn = document.getElementById('bd-undo-btn');
        var redoBtn = document.getElementById('bd-redo-btn');
        var countEl = document.getElementById('bd-undo-count');

        if (undoBtn) {
            undoBtn.disabled = undoStack.length === 0;
            if (undoStack.length > 0) {
                var top = undoStack[undoStack.length - 1];
                undoBtn.title = 'R\u00fcckg\u00e4ngig: ' + top.toolName;
            } else {
                undoBtn.title = 'R\u00fcckg\u00e4ngig';
            }
        }
        if (redoBtn) {
            redoBtn.disabled = redoStack.length === 0;
            if (redoStack.length > 0) {
                var topRedo = redoStack[redoStack.length - 1];
                redoBtn.title = 'Wiederholen: ' + topRedo.toolName;
            } else {
                redoBtn.title = 'Wiederholen';
            }
        }
        if (countEl) {
            countEl.textContent = undoStack.length > 0 ? ('\u21a9 ' + undoStack.length) : '';
        }
    }

    function initUndo() {
        var undoBtn = document.getElementById('bd-undo-btn');
        var redoBtn = document.getElementById('bd-redo-btn');

        if (undoBtn) {
            undoBtn.addEventListener('click', function (e) {
                e.preventDefault();
                undoPerform();
            });
        }
        if (redoBtn) {
            redoBtn.addEventListener('click', function (e) {
                e.preventDefault();
                redoPerform();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', function (e) {
            // Skip if focus is in an input, textarea, or contenteditable
            var tag = (e.target.tagName || '').toLowerCase();
            if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;

            var isUndo = (e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey) && !e.shiftKey;
            var isRedo = (e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey) && e.shiftKey;

            if (isRedo) {
                e.preventDefault();
                redoPerform();
            } else if (isUndo) {
                e.preventDefault();
                undoPerform();
            }
        });

        // Expose globally
        window.BdUndo = {
            captureBeforeApply: undoCaptureBeforeApply
        };

        undoUpdateUI();
    }

    /* ------------------------------------------------------------------ */
    /*  Feature: Quick-Apply Mode (#96)                                  */
    /* ------------------------------------------------------------------ */

    // Map each buttonId to a function that returns the system prompt.
    // Expert tools (column 1) use their refiner prompts with a default influence of 50.
    // Klug tools (column 2) that need only the current prompt are mapped directly.
    // Tagger tools return comma-separated lists — quick-apply appends them.
    // Tools requiring complex modal input (synth-designer, genre-mixer, hook-generator,
    // song-structure, artist-suggester, tempo-finder, narrative-chapters, release-forecast)
    // are omitted; clicking quick-apply will log a warning.

    var TOOL_PROMPT_MAP = {
        // Column 1 — Expert Refiners
        'producer-refine-button':       function () { return PRODUCER_REFINER_PROMPT; },
        'musician-refine-button':       function () { return MUSICIAN_REFINER_PROMPT; },
        'composer-refine-button':       function () { return FILM_COMPOSER_REFINER_PROMPT; },
        'dj-refine-button':            function () { return DJ_REMIXER_REFINER_PROMPT; },
        'avantgarde-refine-button':     function () { return AVANTGARDE_REFINER_PROMPT; },
        'minimalist-refine-button':     function () { return MINIMALIST_REFINER_PROMPT; },
        'vocal-harmony-refine-button':  function () { return VOCAL_HARMONY_REFINER_PROMPT; },
        'ethno-refine-button':          function () { return ETHNO_REFINER_PROMPT; },
        'sound-engineer-button':        function () { return SOUND_ENGINEER_PROMPT; },

        // Column 2 — Klug Tools (simple prompt-in/prompt-out)
        'vibe-enhancer-button':         function () { return VIBE_ENHANCER_PROMPT; },
        'mood-analyzer-button':         function () { return MOOD_ANALYZER_PROMPT; },
        'production-finish-button':     function () { return PRODUCTION_FINISH_PROMPT; },
        'vocal-stylist-button':         function () { return VOCAL_STYLIST_PROMPT; },
        'groove-meister-button':        function () { return GROOVE_MEISTER_PROMPT; },
        'performance-coach-button':     function () { return PERFORMANCE_COACH_PROMPT; },
        'effect-chain-button':          function () { return EFFECT_CHAIN_PROMPT; },

        // Column 3 — Future Lab (prompt-in/prompt-out with structured output)
        'adaptive-flow-button':         function () { return ADAPTIVE_FLOW_PROMPT; },
        'ai-collab-button':             function () { return AI_COLLAB_PROMPT; },
        'story-arc-button':             function () { return STORY_ARC_DESIGNER_PROMPT; },
        'immersive-space-button':       function () { return IMMERSIVE_SPACE_PROMPT; },
        'human-touch-button':           function () { return HUMAN_TOUCH_PROMPT; }
    };

    // Tools whose API response contains structured output (PROMPT:\n...\n---\nNOTES:)
    // We extract only the prompt portion for quick-apply.
    var STRUCTURED_RESPONSE_TOOLS = {
        'adaptive-flow-button': true,
        'ai-collab-button': true,
        'story-arc-button': true,
        'immersive-space-button': true,
        'human-touch-button': true
    };

    // Expert tools send influence level — default to 50 for quick-apply
    var EXPERT_TOOLS = {
        'producer-refine-button': true,
        'musician-refine-button': true,
        'composer-refine-button': true,
        'dj-refine-button': true,
        'avantgarde-refine-button': true,
        'minimalist-refine-button': true,
        'vocal-harmony-refine-button': true,
        'ethno-refine-button': true
    };

    // Tagger tools return comma-separated lists that get appended
    var TAGGER_TOOLS = {
        'mood-analyzer-button': true,
        'production-finish-button': true,
        'vocal-stylist-button': true,
        'groove-meister-button': true,
        'performance-coach-button': true,
        'effect-chain-button': true
    };

    var qaQueue = [];
    var qaRunning = false;

    function quickApplyTool(buttonId, toolName) {
        if (typeof isPromptGenerated !== 'undefined' && !isPromptGenerated) {
            return Promise.resolve();
        }

        var promptFn = TOOL_PROMPT_MAP[buttonId];
        if (!promptFn) {
            console.warn('Quick-Apply: Kein Prompt-Mapping für', buttonId);
            return Promise.resolve();
        }

        // Capture undo state before modification
        if (window.BdUndo) {
            window.BdUndo.captureBeforeApply(toolName);
        }

        var resultEl = document.getElementById('result-text');
        var currentText = (resultEl.textContent || '').trim();
        var sysPrompt = promptFn();

        // Build user message based on tool type
        var userMsg;
        if (EXPERT_TOOLS[buttonId]) {
            userMsg = 'Prompt: "' + currentText + '"\nInfluence Level: 50';
        } else if (buttonId === 'sound-engineer-button') {
            userMsg = 'Base prompt: "' + currentText + '"\n\nIncorporate the following specific instructions:\n1. Enhance overall sound quality and polish';
        } else if (STRUCTURED_RESPONSE_TOOLS[buttonId]) {
            userMsg = 'Base prompt: "' + currentText + '"';
            if (buttonId === 'adaptive-flow-button') {
                userMsg += '\nDynamic intensity (0-100): 65';
            }
        } else {
            userMsg = currentText;
        }

        return callOpenRouterAPI(userMsg, sysPrompt).then(function (result) {
            var finalText = result;

            // For structured response tools, extract only the prompt part
            if (STRUCTURED_RESPONSE_TOOLS[buttonId]) {
                var parts = result.split('---');
                if (parts.length > 0) {
                    finalText = parts[0].replace(/^PROMPT:\s*/i, '').trim();
                }
            }

            // For tagger tools, append the tags to the current prompt
            if (TAGGER_TOOLS[buttonId]) {
                var trimmedResult = finalText.trim();
                var trimmedCurrent = currentText.trim();
                if (trimmedCurrent && trimmedResult) {
                    var needsSpace = /[.!?…]$/.test(trimmedCurrent) || trimmedCurrent.endsWith(')');
                    var separator = needsSpace ? ' ' : trimmedCurrent.endsWith(',') ? ' ' : ', ';
                    finalText = trimmedCurrent + separator + trimmedResult;
                }
            }

            resultEl.textContent = finalText;
            if (window.QW) {
                window.QW.onPromptUpdated({ source: 'quick-apply:' + toolName });
            }
        });
    }

    function enqueueQuickApply(buttonId, toolName, cardEl) {
        qaQueue.push({ buttonId: buttonId, toolName: toolName, cardEl: cardEl });
        cardEl.classList.add('bd-qa-queued');
        processQueue();
    }

    function processQueue() {
        if (qaRunning || qaQueue.length === 0) return;
        qaRunning = true;
        var item = qaQueue.shift();
        item.cardEl.classList.remove('bd-qa-queued');
        item.cardEl.classList.add('bd-qa-running');

        quickApplyTool(item.buttonId, item.toolName)
            .catch(function (e) { console.error('Quick-apply Fehler:', e); })
            .then(function () {  // .then after .catch = finally
                item.cardEl.classList.remove('bd-qa-running');
                item.cardEl.classList.add('bd-qa-done');
                setTimeout(function () { item.cardEl.classList.remove('bd-qa-done'); }, 1500);
                qaRunning = false;
                processQueue();
            });
    }

    function initQuickApply() {
        var dashboard = document.querySelector('.bottom-dashboard');
        if (!dashboard) return;

        // Event delegation on each tool list
        var lists = dashboard.querySelectorAll('.bd-tool-list');
        lists.forEach(function (list) {
            list.addEventListener('click', function (e) {
                var btn = e.target.closest('.bd-quick-apply');
                if (!btn) return;

                e.stopPropagation();
                e.preventDefault();

                // Guard: prompt must exist
                if (typeof isPromptGenerated !== 'undefined' && !isPromptGenerated) return;

                var buttonId = btn.getAttribute('data-button-id');
                var toolName = btn.getAttribute('data-tool-name');
                var cardEl = btn.closest('.bd-tool-card');
                if (!buttonId || !cardEl) return;

                // Check if this tool has a prompt mapping
                if (!TOOL_PROMPT_MAP[buttonId]) {
                    console.warn('Quick-Apply: Tool "' + toolName + '" benötigt die modale Eingabe.');
                    return;
                }

                enqueueQuickApply(buttonId, toolName, cardEl);
            });
        });

        // Expose API for chain builder (#99)
        window.BdQuickApply = {
            enqueue: enqueueQuickApply,
            getPromptMap: function () { return TOOL_PROMPT_MAP; }
        };
    }

    /* ------------------------------------------------------------------ */
    /*  Feature: Keyboard Navigation (#102)                              */
    /* ------------------------------------------------------------------ */

    var navState = {
        active: false,
        col: 1,       // current column (1, 2, 3)
        index: 0,     // current card index within visible cards
        lastFocusedCard: null
    };

    function getVisibleCards(colId) {
        var list = document.getElementById('bd-list-' + colId);
        if (!list) return [];
        return Array.from(list.querySelectorAll('.bd-tool-card:not(.bd-card-hidden)'));
    }

    function setFocusedCard(col, index) {
        // Remove previous focus
        var prev = document.querySelector('.bd-tool-card.bd-kb-focused');
        if (prev) prev.classList.remove('bd-kb-focused');

        var cards = getVisibleCards(col);
        if (cards.length === 0) return;

        // Clamp index
        index = Math.max(0, Math.min(index, cards.length - 1));

        navState.col = col;
        navState.index = index;
        navState.active = true;

        var card = cards[index];
        card.classList.add('bd-kb-focused');
        card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        navState.lastFocusedCard = card;
    }

    function deactivateNav() {
        navState.active = false;
        var prev = document.querySelector('.bd-tool-card.bd-kb-focused');
        if (prev) prev.classList.remove('bd-kb-focused');
    }

    function initKeyboardNav() {
        var dashboard = document.querySelector('.bottom-dashboard');
        if (!dashboard) return;

        // Make all cards programmatically focusable (but not in tab order)
        var allCards = dashboard.querySelectorAll('.bd-tool-card');
        allCards.forEach(function (card) {
            card.setAttribute('tabindex', '-1');
        });

        // When dashboard receives focus via Tab, activate nav on first card
        dashboard.addEventListener('focus', function () {
            if (!navState.active) {
                setFocusedCard(1, 0);
            }
        });

        // Keyboard handler on dashboard
        dashboard.addEventListener('keydown', function (e) {
            // Skip if focus is inside a search input
            var tag = (e.target.tagName || '').toLowerCase();
            if (tag === 'input' || tag === 'textarea') return;

            var key = e.key;

            if (key === 'ArrowDown') {
                e.preventDefault();
                var cards = getVisibleCards(navState.col);
                if (cards.length === 0) return;
                var nextIdx = (navState.index + 1) % cards.length;
                setFocusedCard(navState.col, nextIdx);

            } else if (key === 'ArrowUp') {
                e.preventDefault();
                var cardsUp = getVisibleCards(navState.col);
                if (cardsUp.length === 0) return;
                var prevIdx = (navState.index - 1 + cardsUp.length) % cardsUp.length;
                setFocusedCard(navState.col, prevIdx);

            } else if (key === 'ArrowRight') {
                e.preventDefault();
                var nextCol = navState.col === 3 ? 1 : navState.col + 1;
                setFocusedCard(nextCol, navState.index);

            } else if (key === 'ArrowLeft') {
                e.preventDefault();
                var prevCol = navState.col === 1 ? 3 : navState.col - 1;
                setFocusedCard(prevCol, navState.index);

            } else if (key === 'Enter') {
                e.preventDefault();
                if (navState.lastFocusedCard) {
                    navState.lastFocusedCard.click();
                }

            } else if (key === ' ') {
                e.preventDefault();
                if (navState.lastFocusedCard) {
                    var qaBtn = navState.lastFocusedCard.querySelector('.bd-quick-apply');
                    if (qaBtn) qaBtn.click();
                }

            } else if (key === 'Escape') {
                // Only deactivate nav if no overlay is open
                var anyOverlayOpen = false;
                [1, 2, 3].forEach(function (id) {
                    var ov = document.getElementById('bd-detail-' + id);
                    if (ov && ov.classList.contains('active')) anyOverlayOpen = true;
                });
                if (!anyOverlayOpen) {
                    deactivateNav();
                    dashboard.blur();
                }
                // Let the existing Escape handler in bottom_tools.js close overlays

            } else if (key === 'Tab') {
                // Deactivate nav when tabbing out
                deactivateNav();
            }
        });

        // Deactivate when clicking outside the dashboard
        document.addEventListener('mousedown', function (e) {
            if (navState.active && !dashboard.contains(e.target)) {
                deactivateNav();
            }
        });

        // Focus restoration after modal/overlay close
        document.addEventListener('modal:close', function () {
            if (navState.lastFocusedCard && navState.active) {
                // Small delay to let the overlay close transition finish
                setTimeout(function () {
                    setFocusedCard(navState.col, navState.index);
                    dashboard.focus({ preventScroll: true });
                }, 50);
            }
        });
    }

    /* ------------------------------------------------------------------ */
    /*  Feature: Drag-and-Drop Tool Reordering (#103)                    */
    /* ------------------------------------------------------------------ */

    var DRAG_ORDER_KEY = 'ssa_bd_order_v1';

    var dragState = {
        active: false,
        colId: null,
        sourceCard: null,
        ghost: null,
        placeholder: null,
        startY: 0,
        startX: 0,
        isPinnedZone: false,
        longPressTimer: null,
        scrollInterval: null,
        handled: false
    };

    var dragGeneration = 0;

    function loadDragOrder() {
        try {
            var stored = localStorage.getItem(DRAG_ORDER_KEY);
            if (stored) return JSON.parse(stored);
        } catch (e) { /* ignore */ }
        return null;
    }

    function saveDragOrder() {
        var order = {};
        [1, 2, 3].forEach(function (colId) {
            var list = document.getElementById('bd-list-' + colId);
            if (!list) return;
            var cards = list.querySelectorAll('.bd-tool-card');
            order[colId] = [];
            cards.forEach(function (card) {
                order[colId].push(card.getAttribute('data-button-id'));
            });
        });
        try {
            localStorage.setItem(DRAG_ORDER_KEY, JSON.stringify(order));
        } catch (e) { /* quota exceeded */ }
    }

    function restoreDragOrder() {
        var saved = loadDragOrder();
        if (!saved) return;

        [1, 2, 3].forEach(function (colId) {
            var ids = saved[colId];
            if (!Array.isArray(ids) || ids.length === 0) return;

            var list = document.getElementById('bd-list-' + colId);
            if (!list) return;

            var cards = Array.prototype.slice.call(list.querySelectorAll('.bd-tool-card'));
            var cardMap = {};
            cards.forEach(function (card) {
                cardMap[card.getAttribute('data-button-id')] = card;
            });

            // Append cards in saved order; any new cards not in saved order go at end
            var appended = {};
            ids.forEach(function (id) {
                if (cardMap[id]) {
                    list.appendChild(cardMap[id]);
                    appended[id] = true;
                }
            });
            // Append remaining cards (newly added tools)
            cards.forEach(function (card) {
                var id = card.getAttribute('data-button-id');
                if (!appended[id]) {
                    list.appendChild(card);
                }
            });
        });
    }

    function getColumnForCard(card) {
        var list = card.closest('.bd-tool-list');
        if (!list) return null;
        var m = list.id.match(/bd-list-(\d)/);
        return m ? m[1] : null;
    }

    function isInPinnedZone(card) {
        // A card is in the pinned zone if it appears before the separator
        var list = card.closest('.bd-tool-list');
        if (!list) return false;
        var sep = list.querySelector('.bd-pin-separator');
        if (!sep) return card.classList.contains('bd-pinned');
        // Check if card comes before separator in DOM
        return !!(sep.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_PRECEDING);
    }

    function getSiblingCards(list, pinnedZone) {
        var cards = Array.prototype.slice.call(list.querySelectorAll('.bd-tool-card'));
        var sep = list.querySelector('.bd-pin-separator');

        if (!sep) {
            // No separator — if pinnedZone requested, return pinned cards; else unpinned
            return cards.filter(function (c) {
                return pinnedZone ? c.classList.contains('bd-pinned') : !c.classList.contains('bd-pinned');
            });
        }

        return cards.filter(function (c) {
            var beforeSep = !!(sep.compareDocumentPosition(c) & Node.DOCUMENT_POSITION_PRECEDING);
            return pinnedZone ? beforeSep : !beforeSep;
        });
    }

    function startDrag(card, e) {
        if (dragState.active) return;

        var colId = getColumnForCard(card);
        if (!colId) return;

        dragState.active = true;
        dragState.colId = colId;
        dragState.sourceCard = card;
        dragState.startX = e.clientX;
        dragState.startY = e.clientY;
        dragState.isPinnedZone = isInPinnedZone(card);
        dragState.pointerId = e.pointerId;

        // Create ghost
        var rect = card.getBoundingClientRect();
        var ghost = card.cloneNode(true);
        ghost.className = 'bd-tool-card bd-drag-ghost';
        ghost.style.width = rect.width + 'px';
        ghost.style.height = rect.height + 'px';
        ghost.style.left = rect.left + 'px';
        ghost.style.top = rect.top + 'px';
        document.body.appendChild(ghost);
        dragState.ghost = ghost;

        // Mark source
        card.classList.add('bd-dragging');
        card.style.touchAction = 'none'; // Fix 3: prevent scroll during drag on mobile

        // Add transition class to sibling cards (Fix 4)
        var parentList = card.closest('.bd-tool-list');
        if (parentList) parentList.classList.add('bd-drag-active');

        // Create placeholder
        var placeholder = document.createElement('div');
        placeholder.className = 'bd-drag-placeholder';
        placeholder.style.height = rect.height + 'px';
        card.parentNode.insertBefore(placeholder, card);
        dragState.placeholder = placeholder;

        // Capture pointer for reliable tracking
        try { card.setPointerCapture(e.pointerId); } catch (ex) { /* older browser */ }

        e.preventDefault();
        e.stopPropagation();
    }

    function moveDrag(e) {
        if (!dragState.active) return;

        e.preventDefault();
        e.stopPropagation();

        // Move ghost
        var ghost = dragState.ghost;
        ghost.style.left = (e.clientX - ghost.offsetWidth / 2) + 'px';
        ghost.style.top = (e.clientY - ghost.offsetHeight / 2) + 'px';

        // Find the list
        var list = document.getElementById('bd-list-' + dragState.colId);
        if (!list) return;

        // Check if pointer is still within the column
        var listRect = list.getBoundingClientRect();
        if (e.clientX < listRect.left - 50 || e.clientX > listRect.right + 50) {
            return; // Don't update insertion point if too far outside column
        }

        // Get sibling cards in same zone (exclude source card)
        var siblings = getSiblingCards(list, dragState.isPinnedZone).filter(function (c) {
            return c !== dragState.sourceCard;
        });

        // Find insertion point based on Y position
        var placeholder = dragState.placeholder;
        var insertBefore = null;

        for (var i = 0; i < siblings.length; i++) {
            var sibRect = siblings[i].getBoundingClientRect();
            var midY = sibRect.top + sibRect.height / 2;
            if (e.clientY < midY) {
                insertBefore = siblings[i];
                break;
            }
        }

        // Move placeholder
        if (insertBefore) {
            if (placeholder.nextSibling !== insertBefore) {
                list.insertBefore(placeholder, insertBefore);
            }
        } else {
            // Insert at end of zone
            if (dragState.isPinnedZone) {
                var sep = list.querySelector('.bd-pin-separator');
                if (sep) {
                    if (placeholder.nextSibling !== sep) {
                        list.insertBefore(placeholder, sep);
                    }
                } else {
                    list.appendChild(placeholder);
                }
            } else {
                // End of unpinned zone = end of list
                if (placeholder !== list.lastElementChild) {
                    list.appendChild(placeholder);
                }
            }
        }

        // Auto-scroll the list if near edges
        var scrollMargin = 30;
        if (e.clientY < listRect.top + scrollMargin) {
            list.scrollTop -= 5;
        } else if (e.clientY > listRect.bottom - scrollMargin) {
            list.scrollTop += 5;
        }
    }

    function endDrag(cancelled) {
        if (!dragState.active) return;

        var card = dragState.sourceCard;
        var placeholder = dragState.placeholder;
        var ghost = dragState.ghost;
        var list = document.getElementById('bd-list-' + dragState.colId);

        if (!cancelled && placeholder && placeholder.parentNode && list) {
            // Insert source card at placeholder position
            placeholder.parentNode.insertBefore(card, placeholder);
            saveDragOrder();
        }

        // Cleanup
        card.classList.remove('bd-dragging');
        card.style.touchAction = ''; // Fix 3: restore touch-action

        // Remove sibling transition class (Fix 4)
        if (list) list.classList.remove('bd-drag-active');

        if (ghost && ghost.parentNode) ghost.parentNode.removeChild(ghost);
        if (placeholder && placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);

        try { card.releasePointerCapture(dragState.pointerId); } catch (ex) { /* ignore */ }

        dragState.active = false;
        dragState.colId = null;
        dragState.sourceCard = null;
        dragState.ghost = null;
        dragState.placeholder = null;
        dragState.isPinnedZone = false;
        dragState.handled = false;
        clearTimeout(dragState.longPressTimer);
        dragState.longPressTimer = null;

        // Fix 5: Block the synthesized click that fires after pointerup to prevent portal opening
        if (!cancelled) {
            document.addEventListener('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
            }, { capture: true, once: true });
        }
    }

    function initDragDrop() {
        // Restore saved order BEFORE pinning runs
        restoreDragOrder();

        var dashboard = document.querySelector('.bottom-dashboard');
        if (!dashboard) return;

        // Track pointer movement to cancel long-press if moved too much
        var pointerStartX = 0;
        var pointerStartY = 0;
        var longPressCard = null;

        dashboard.addEventListener('pointerdown', function (e) {
            // Only primary button
            if (e.button !== 0) return;

            var handle = e.target.closest('.bd-drag-handle');
            var card = e.target.closest('.bd-tool-card');
            if (!card) return;

            // Don't interfere with pin button or quick-apply
            if (e.target.closest('.bd-pin-btn') || e.target.closest('.bd-quick-apply')) return;

            pointerStartX = e.clientX;
            pointerStartY = e.clientY;
            dragGeneration++;

            if (handle) {
                // Immediate drag from handle
                startDrag(card, e);
            } else {
                // Long-press on card body
                longPressCard = card;
                var gen = dragGeneration;
                dragState.longPressTimer = setTimeout(function () {
                    if (longPressCard === card && gen === dragGeneration) {
                        startDrag(card, e);
                        longPressCard = null;
                    }
                }, 200);
            }
        }, true);

        dashboard.addEventListener('pointermove', function (e) {
            // Cancel long-press if moved too far
            if (longPressCard && !dragState.active) {
                var dx = e.clientX - pointerStartX;
                var dy = e.clientY - pointerStartY;
                if (Math.sqrt(dx * dx + dy * dy) > 5) {
                    clearTimeout(dragState.longPressTimer);
                    longPressCard = null;
                }
            }

            if (dragState.active) {
                moveDrag(e);
            }
        }, true);

        dashboard.addEventListener('pointerup', function (e) {
            clearTimeout(dragState.longPressTimer);
            longPressCard = null;
            dragGeneration++;

            if (dragState.active) {
                // Check if pointer is still within the column
                var list = document.getElementById('bd-list-' + dragState.colId);
                var cancelled = false;
                if (list) {
                    var listRect = list.getBoundingClientRect();
                    if (e.clientX < listRect.left - 50 || e.clientX > listRect.right + 50) {
                        cancelled = true;
                    }
                }
                dragState.handled = true;
                endDrag(cancelled);
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);

        dashboard.addEventListener('pointercancel', function () {
            clearTimeout(dragState.longPressTimer);
            longPressCard = null;
            dragGeneration++;
            if (dragState.active) {
                endDrag(true);
            }
        }, true);

        // Also listen on document for pointerup in case pointer leaves dashboard
        document.addEventListener('pointerup', function (e) {
            if (!dragState.active) return;
            if (dragState.handled) { dragState.handled = false; return; }
            endDrag(true); // Cancel if dropped outside dashboard
        });

        // Prevent context menu during drag on touch
        dashboard.addEventListener('contextmenu', function (e) {
            if (dragState.active) {
                e.preventDefault();
            }
        });
    }

    /* ------------------------------------------------------------------ */
    /*  Bootstrap: warten auf bottomtools:ready                           */
    /* ------------------------------------------------------------------ */

    var undoInitialized = false;

    document.addEventListener('bottomtools:ready', function () {
        initTooltips();
        initSearch();
        initDragDrop();   // Must run BEFORE initPinning to restore saved order first
        initPinning();
        initQuickApply();
        initKeyboardNav();
        if (!undoInitialized) { initUndo(); undoInitialized = true; }
    });

    // Fallback: init undo on DOMContentLoaded in case dashboard is not present
    document.addEventListener('DOMContentLoaded', function () {
        if (!undoInitialized) { initUndo(); undoInitialized = true; }
    });

})();
