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
                card.innerHTML =
                    '<span class="bd-tool-emoji">' + tool.emoji + '</span>' +
                    '<span class="bd-tool-name">' + tool.name + '</span>';
                card.addEventListener('click', function () {
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

        // ESC to close all overlays
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                [1, 2, 3].forEach(function (id) { closeBdDetail(id); });
            }
        });

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

        // If no prompt yet, show disabled hint in the preview overlay
        if (typeof isPromptGenerated !== 'undefined' && !isPromptGenerated) {
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

        // Trigger the proxy button to fire all on-open handlers
        // (data loading for taggers, UI reset for synth-designer, etc.)
        var proxyBtn = document.getElementById(tool.buttonId);
        if (proxyBtn) proxyBtn.click();
        // Undo the body scroll-lock that setupModal's open() sets
        document.body.style.overflow = '';
    }

    function closeBdDetail(colId) {
        var overlay = document.getElementById('bd-detail-' + colId);
        if (!overlay || overlay._closing) return;
        overlay._closing = true;

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
        document.body.style.overflow = '';
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
