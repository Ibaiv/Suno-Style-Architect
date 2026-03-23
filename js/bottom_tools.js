// Bottom Dashboard — Three-Column Tool System
// Lightweight rendering + detail overlay for the bottom tool panel.

(function () {
    'use strict';

    const BD_TOOLS = {
        1: [
            { emoji: '🎤', name: 'Produzent', desc: 'Professionelle Produktions-Perspektive auf deinen Prompt' },
            { emoji: '🎹', name: 'Musiker', desc: 'Musikalische Tiefe und Arrangement-Expertise' },
            { emoji: '🎬', name: 'Filmkomponist', desc: 'Cinematic Scoring und emotionale Klanglandschaften' },
            { emoji: '🎧', name: 'DJ/Remixer', desc: 'Club-taugliche Beats und Remix-Techniken' },
            { emoji: '🎨', name: 'Avantgarde', desc: 'Experimentelle und grenzüberschreitende Klangwelten' },
            { emoji: '🔲', name: 'Minimalist', desc: 'Reduktion auf das Wesentliche, klare Strukturen' },
            { emoji: '🎵', name: 'Vocal-Harmony', desc: 'Mehrstimmige Arrangements und Vocal-Texturen' },
            { emoji: '🌍', name: 'Ethno', desc: 'Weltmusik-Einflüsse und kulturelle Klangfarben' },
            { emoji: '🔧', name: 'Sound-Ingenieur', desc: 'Technische Klangoptimierung und Mixing-Expertise' },
        ],
        2: [
            { emoji: '🎛️', name: 'Synth-Designer Lab', desc: 'Synthesizer-Sounds und Klangdesign-Werkstatt' },
            { emoji: '🧬', name: 'Genre-Mixer', desc: 'Kreative Genre-Kreuzungen und Hybrid-Stile' },
            { emoji: '🪝', name: 'Hook-Generator', desc: 'Eingängige Melodien und Ohrwurm-Formeln' },
            { emoji: '🏗️', name: 'Song-Struktur', desc: 'Professioneller Song-Aufbau und Arrangements' },
            { emoji: '✨', name: 'Vibe-Veredler', desc: 'Atmosphärische Verfeinerung und Stimmungs-Tuning' },
            { emoji: '🧑‍🎤', name: 'Künstler-Kompass', desc: 'Stilistische Orientierung an bekannten Künstlern' },
            { emoji: '⏱️', name: 'Tempo-Finder', desc: 'Optimales BPM und rhythmische Grundlage' },
            { emoji: '🧭', name: 'Mood-Analyzer', desc: 'Stimmungsanalyse und emotionale Feinabstimmung' },
            { emoji: '💎', name: 'Production-Finish', desc: 'Finaler Feinschliff für Produktionsqualität' },
            { emoji: '🗣️', name: 'Vocal-Stylist', desc: 'Gesangsstil und Vocal-Charakter-Design' },
            { emoji: '🥁', name: 'Groove-Meister', desc: 'Rhythmus-Patterns und Groove-Entwicklung' },
            { emoji: '🏋️', name: 'Performance-Coach', desc: 'Live-Performance und Energie-Optimierung' },
            { emoji: '🔗', name: 'Effect-Chain', desc: 'Effektketten und Signal-Processing' },
        ],
        3: [
            { emoji: '🌊', name: 'Adaptive Flow', desc: 'Dynamische Prompt-Anpassung in Echtzeit' },
            { emoji: '🤖', name: 'AI Collaboration', desc: 'KI-gestützte kreative Zusammenarbeit' },
            { emoji: '📖', name: 'Story Arc Designer', desc: 'Narrative Spannungsbögen für Songs' },
            { emoji: '📚', name: 'Narrative Chapters', desc: 'Kapitelbasierte Song-Erzählungen' },
            { emoji: '🌌', name: 'Immersive Space', desc: 'Räumliche Klanglandschaften und 3D-Audio' },
            { emoji: '🫀', name: 'Human Touch', desc: 'Menschliche Wärme und organische Elemente' },
            { emoji: '📊', name: 'Release Forecast', desc: 'Veröffentlichungs-Timing und Trend-Analyse' },
        ],
    };

    function initBottomDashboard() {
        const dashboard = document.querySelector('.bottom-dashboard');
        if (!dashboard) return;

        // Render tool cards
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
            });
        });

        // Close buttons
        dashboard.querySelectorAll('.bd-detail-close').forEach(function (btn) {
            btn.addEventListener('click', function () {
                closeBdDetail(btn.getAttribute('data-col'));
            });
        });

        // "Anwenden" buttons
        dashboard.querySelectorAll('.bd-detail-btn').forEach(function (btn) {
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
    }

    function openBdDetail(colId, tool) {
        var overlay = document.getElementById('bd-detail-' + colId);
        if (!overlay) return;
        document.getElementById('bd-detail-emoji-' + colId).textContent = tool.emoji;
        document.getElementById('bd-detail-name-' + colId).textContent = tool.name;
        document.getElementById('bd-detail-desc-' + colId).textContent = tool.desc;
        overlay.classList.add('active');
    }

    function closeBdDetail(colId) {
        var overlay = document.getElementById('bd-detail-' + colId);
        if (overlay) overlay.classList.remove('active');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBottomDashboard);
    } else {
        initBottomDashboard();
    }
})();
