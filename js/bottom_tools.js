// Bottom Dashboard — Three-Column Tool System
// Portal approach: clicking a card moves the real modal inline into the column overlay.

(function () {
    'use strict';

    var BD_TOOLS = {
        1: [
            { emoji: '🎤', name: 'Produzent', desc: 'Professionelle Produktions-Perspektive auf deinen Prompt', buttonId: 'producer-refine-button', modalId: 'producer-modal' },
            { emoji: '🎹', name: 'Musiker', desc: 'Musikalische Tiefe und Arrangement-Expertise', buttonId: 'musician-refine-button', modalId: 'musician-modal' },
            { emoji: '🎬', name: 'Filmkomponist', desc: 'Cinematic Scoring und emotionale Klanglandschaften', buttonId: 'composer-refine-button', modalId: 'composer-modal' },
            { emoji: '🎧', name: 'DJ/Remixer', desc: 'Club-taugliche Beats und Remix-Techniken', buttonId: 'dj-refine-button', modalId: 'dj-modal' },
            { emoji: '🎨', name: 'Avantgarde', desc: 'Experimentelle und grenzüberschreitende Klangwelten', buttonId: 'avantgarde-refine-button', modalId: 'avantgarde-modal' },
            { emoji: '🔲', name: 'Minimalist', desc: 'Reduktion auf das Wesentliche, klare Strukturen', buttonId: 'minimalist-refine-button', modalId: 'minimalist-modal' },
            { emoji: '🎵', name: 'Vocal-Harmony', desc: 'Mehrstimmige Arrangements und Vocal-Texturen', buttonId: 'vocal-harmony-refine-button', modalId: 'vocal-harmony-modal' },
            { emoji: '🌍', name: 'Ethno', desc: 'Weltmusik-Einflüsse und kulturelle Klangfarben', buttonId: 'ethno-refine-button', modalId: 'ethno-modal' },
            { emoji: '🔧', name: 'Sound-Ingenieur', desc: 'Technische Klangoptimierung und Mixing-Expertise', buttonId: 'sound-engineer-button', modalId: 'sound-engineer-modal' },
        ],
        2: [
            { emoji: '🎛️', name: 'Synth-Designer Lab', desc: 'Synthesizer-Sounds und Klangdesign-Werkstatt', buttonId: 'synth-designer-button', modalId: 'synth-designer-modal' },
            { emoji: '🧬', name: 'Genre-Mixer', desc: 'Kreative Genre-Kreuzungen und Hybrid-Stile', buttonId: 'genre-mixer-button', modalId: 'genre-mixer-modal' },
            { emoji: '🪝', name: 'Hook-Generator', desc: 'Eingängige Melodien und Ohrwurm-Formeln', buttonId: 'hook-generator-button', modalId: 'hook-generator-modal' },
            { emoji: '🏗️', name: 'Song-Struktur', desc: 'Professioneller Song-Aufbau und Arrangements', buttonId: 'song-structure-button', modalId: 'song-structure-modal' },
            { emoji: '✨', name: 'Vibe-Veredler', desc: 'Atmosphärische Verfeinerung und Stimmungs-Tuning', buttonId: 'vibe-enhancer-button', modalId: 'vibe-enhancer-modal' },
            { emoji: '🧑‍🎤', name: 'Künstler-Kompass', desc: 'Stilistische Orientierung an bekannten Künstlern', buttonId: 'artist-suggester-button', modalId: 'artist-suggester-modal' },
            { emoji: '⏱️', name: 'Tempo-Finder', desc: 'Optimales BPM und rhythmische Grundlage', buttonId: 'tempo-finder-button', modalId: 'tempo-finder-modal' },
            { emoji: '🧭', name: 'Mood-Analyzer', desc: 'Stimmungsanalyse und emotionale Feinabstimmung', buttonId: 'mood-analyzer-button', modalId: 'mood-analyzer-modal' },
            { emoji: '💎', name: 'Production-Finish', desc: 'Finaler Feinschliff für Produktionsqualität', buttonId: 'production-finish-button', modalId: 'production-finish-modal' },
            { emoji: '🗣️', name: 'Vocal-Stylist', desc: 'Gesangsstil und Vocal-Charakter-Design', buttonId: 'vocal-stylist-button', modalId: 'vocal-stylist-modal' },
            { emoji: '🥁', name: 'Groove-Meister', desc: 'Rhythmus-Patterns und Groove-Entwicklung', buttonId: 'groove-meister-button', modalId: 'groove-meister-modal' },
            { emoji: '🏋️', name: 'Performance-Coach', desc: 'Live-Performance und Energie-Optimierung', buttonId: 'performance-coach-button', modalId: 'performance-coach-modal' },
            { emoji: '🔗', name: 'Effect-Chain', desc: 'Effektketten und Signal-Processing', buttonId: 'effect-chain-button', modalId: 'effect-chain-modal' },
        ],
        3: [
            { emoji: '🌊', name: 'Adaptive Flow', desc: 'Dynamische Prompt-Anpassung in Echtzeit', buttonId: 'adaptive-flow-button', modalId: 'adaptive-flow-modal' },
            { emoji: '🤖', name: 'AI Collaboration', desc: 'KI-gestützte kreative Zusammenarbeit', buttonId: 'ai-collab-button', modalId: 'ai-collab-modal' },
            { emoji: '📖', name: 'Story Arc Designer', desc: 'Narrative Spannungsbögen für Songs', buttonId: 'story-arc-button', modalId: 'story-arc-modal' },
            { emoji: '📚', name: 'Narrative Chapters', desc: 'Kapitelbasierte Song-Erzählungen', buttonId: 'narrative-chapters-button', modalId: 'narrative-chapters-modal' },
            { emoji: '🌌', name: 'Immersive Space', desc: 'Räumliche Klanglandschaften und 3D-Audio', buttonId: 'immersive-space-button', modalId: 'immersive-space-modal' },
            { emoji: '🫀', name: 'Human Touch', desc: 'Menschliche Wärme und organische Elemente', buttonId: 'human-touch-button', modalId: 'human-touch-modal' },
            { emoji: '📊', name: 'Release Forecast', desc: 'Veröffentlichungs-Timing und Trend-Analyse', buttonId: 'release-forecast-button', modalId: 'release-forecast-modal' },
        ],
    };

    // Chord shortcut mapping: buttonId -> { key, num }
    // Must mirror the arrays in chords.js so badge numbers match actual chord behavior.
    // Tools with num > 9 are on page 2 (press 0 to paginate, then digit).
    var CHORD_SHORTCUTS = (function () {
        var map = {};
        var expert = [
            'producer-refine-button', 'musician-refine-button', 'composer-refine-button',
            'dj-refine-button', 'avantgarde-refine-button', 'minimalist-refine-button',
            'vocal-harmony-refine-button', 'ethno-refine-button', 'sound-engineer-button'
        ];
        var klug = [
            'genre-mixer-button', 'mood-analyzer-button', 'hook-generator-button',
            'song-structure-button', 'vibe-enhancer-button', 'artist-suggester-button',
            'tempo-finder-button', 'production-finish-button', 'vocal-stylist-button',
            'groove-meister-button', 'performance-coach-button', 'effect-chain-button'
        ];
        var future = [
            'adaptive-flow-button', 'ai-collab-button', 'story-arc-button',
            'narrative-chapters-button', 'immersive-space-button', 'human-touch-button',
            'release-forecast-button'
        ];
        expert.forEach(function (id, i) { map[id] = { key: 'E', num: i + 1 }; });
        klug.forEach(function (id, i) { map[id] = { key: 'K', num: i + 1 }; });
        future.forEach(function (id, i) { map[id] = { key: 'F', num: i + 1 }; });
        return map;
    })();

    function initBottomDashboard() {
        var dashboard = document.querySelector('.bottom-dashboard');
        if (!dashboard) return;

        // Render tool cards + hidden proxy buttons
        Object.keys(BD_TOOLS).forEach(function (colId) {
            var list = document.getElementById('bd-list-' + colId);
            if (!list) return;

            BD_TOOLS[colId].forEach(function (tool, i) {
                var card = document.createElement('div');
                card.className = 'bd-tool-card';
                card.style.animationDelay = ((parseInt(colId, 10) - 1) * 80 + i * 35) + 'ms';
                card.setAttribute('data-desc', tool.desc);
                card.setAttribute('data-col', colId);
                card.setAttribute('data-tool-name', tool.name);
                card.setAttribute('data-tool-emoji', tool.emoji);
                card.setAttribute('data-button-id', tool.buttonId);
                card.setAttribute('aria-label', tool.name + ' – ' + tool.desc);
                // Build shortcut badge if this tool has a chord shortcut
                var chordInfo = CHORD_SHORTCUTS[tool.buttonId];
                var badgeHtml = '';
                if (chordInfo) {
                    var numLabel = chordInfo.num <= 9
                        ? String(chordInfo.num)
                        : '0\u2192' + String(chordInfo.num - 9); // e.g. "0->1" for page 2
                    badgeHtml = '<span class="bd-shortcut-num" aria-hidden="true" title="' + chordInfo.key + ' + ' + numLabel + '">' + numLabel + '</span>';
                }
                card.innerHTML =
                    '<span class="bd-drag-handle" aria-hidden="true">\u283F</span>' +
                    '<button class="bd-quick-apply" data-button-id="' + tool.buttonId + '" data-tool-name="' + tool.name + '" aria-label="Schnell anwenden" title="Schnell anwenden">\u25B6</button>' +
                    '<button class="bd-pin-btn" data-button-id="' + tool.buttonId + '" aria-label="Favorit">\u2606</button>' +
                    '<span class="bd-tool-emoji">' + tool.emoji + '</span>' +
                    '<span class="bd-tool-name">' + tool.name + '</span>' +
                    badgeHtml;
                card.addEventListener('click', function (e) {
                    // Don't open portal if an action button was clicked
                    if (e.target.closest('.bd-pin-btn') || e.target.closest('.bd-quick-apply') || e.target.closest('.bd-drag-handle')) return;
                    openBdDetail(colId, tool);
                });
                list.appendChild(card);

                // Hidden proxy button so features.js can bind setupModal()
                var proxy = document.createElement('button');
                proxy.id = tool.buttonId;
                proxy.style.display = 'none';
                dashboard.appendChild(proxy);
            });
        });

        // Overlay close buttons
        dashboard.querySelectorAll('.bd-detail-close').forEach(function (btn) {
            btn.addEventListener('click', function () {
                closeBdDetail(btn.getAttribute('data-col'));
            });
        });

        // Escape now handled by CloseStack (close_stack.js) — each overlay pushes its own entry

        // Auto-close overlay when a portaled modal's own close() fires
        document.addEventListener('modal:close', function (e) {
            [1, 2, 3].forEach(function (colId) {
                var overlay = document.getElementById('bd-detail-' + colId);
                if (overlay && overlay._portaledModal && overlay._portaledModal.id === e.detail.id) {
                    closeBdDetail(colId);
                }
            });
        });

        // Signal that proxy buttons are ready for features.js
        document.dispatchEvent(new CustomEvent('bottomtools:ready'));
    }

    function openBdDetail(colId, tool) {
        var overlay = document.getElementById('bd-detail-' + colId);
        if (!overlay) return;

        // If no prompt yet, show disabled hint in the preview overlay + toast
        if (typeof isPromptGenerated !== 'undefined' && !isPromptGenerated) {
            if (typeof showToast === 'function') {
                showToast('Bitte generiere zuerst einen Prompt, um dieses Tool zu nutzen.', 'warning');
            }
            document.getElementById('bd-detail-emoji-' + colId).textContent = tool.emoji;
            document.getElementById('bd-detail-name-' + colId).textContent = tool.name;
            document.getElementById('bd-detail-desc-' + colId).textContent = 'Erst einen Prompt generieren, dann kannst du dieses Tool nutzen.';
            var btn = overlay.querySelector('.bd-detail-btn');
            if (btn) {
                btn.classList.add('bd-btn-disabled');
                btn.textContent = 'Erst Prompt generieren';
            }
            overlay.classList.remove('bd-has-modal');
            overlay.classList.add('active');
            if(window.CloseStack) CloseStack.push(function(){ closeBdDetail(colId); }, { id: 'bd-detail-' + colId });
            return;
        }

        // Close any already-portaled modal in this column
        if (overlay._portaledModal) {
            closeBdDetail(colId);
        }

        // Find the real modal
        var modal = document.getElementById(tool.modalId);
        if (!modal) return;

        // Portal: move the entire modal element into the overlay
        overlay._portaledModal = modal;
        overlay.appendChild(modal);

        // Switch to inline display (CSS overrides fixed positioning)
        modal.classList.add('bd-inline');
        modal.classList.remove('hidden', 'modal-leave-to', 'modal-enter-from');

        // Hide the old preview content, show overlay
        overlay.classList.add('bd-has-modal', 'active');
        if(window.CloseStack) CloseStack.push(function(){ closeBdDetail(colId); }, { id: 'bd-detail-' + colId });

        // Trigger the proxy button to fire all on-open handlers
        // (data loading for taggers, UI reset for synth-designer, etc.)
        var proxyBtn = document.getElementById(tool.buttonId);
        if (proxyBtn) proxyBtn.click();
        // Undo the body scroll-lock that setupModal's open() sets.
        // Force-clear because the modal is displayed inline in the dashboard,
        // not as a floating overlay, so body scroll should remain enabled.
        document.body.style.overflow = '';
    }

    function closeBdDetail(colId) {
        var overlay = document.getElementById('bd-detail-' + colId);
        if (!overlay || overlay._closing) return;
        overlay._closing = true;
        if(window.CloseStack) CloseStack.pop('bd-detail-' + colId);

        var modal = overlay._portaledModal;
        if (modal) {
            // Return modal to #modals-container in its original hidden state
            var container = document.getElementById('modals-container');
            if (container) {
                modal.classList.remove('bd-inline', 'modal-enter-to', 'modal-leave-to');
                modal.classList.add('hidden');
                container.appendChild(modal);
            }
            overlay._portaledModal = null;
        }

        overlay.classList.remove('active', 'bd-has-modal');
        if(window.BodyScrollLock) BodyScrollLock.unlock();
        overlay._closing = false;
    }

    function initCollapseToggle() {
        var toggle = document.getElementById('bd-collapse-toggle');
        if (!toggle) return;
        toggle.addEventListener('click', function () {
            var layout = document.querySelector('.app-main-layout');
            if (layout) layout.classList.toggle('bd-collapsed');
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            initCollapseToggle();
            initBottomDashboard();
        });
    } else {
        initCollapseToggle();
        initBottomDashboard();
    }
})();
