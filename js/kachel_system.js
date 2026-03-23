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
    /*  Bootstrap: warten auf bottomtools:ready                           */
    /* ------------------------------------------------------------------ */

    document.addEventListener('bottomtools:ready', function () {
        initTooltips();
        initSearch();
        initPinning();
    });

})();
