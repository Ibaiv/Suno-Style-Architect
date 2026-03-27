(function () {
    const PAGE_SIZE = 9;
    const TRANSITION_MS = 210;
    const EMOJI_BY_ID = {
        'producer-refine-button': '🎚️',
        'musician-refine-button': '🎻',
        'composer-refine-button': '🎬',
        'dj-refine-button': '💿',
        'avantgarde-refine-button': '🧪',
        'minimalist-refine-button': '⚪',
        'vocal-harmony-refine-button': '🎙️',
        'ethno-refine-button': '🌍',
        'sound-engineer-button': '🛠️',
        'visual-engine-button': '🖼️',
        'synth-designer-button': '🎛️',
        'genre-mixer-button': '🧬',
        'mood-analyzer-button': '🧭',
        'hook-generator-button': '🪝',
        'song-structure-button': '🏗️',
        'vibe-enhancer-button': '✨',
        'artist-suggester-button': '🧑‍🎤',
        'tempo-finder-button': '⏱️',
        'production-finish-button': '💎',
        'vocal-stylist-button': '🗣️',
        'groove-meister-button': '🥁',
        'performance-coach-button': '🏋️',
        'effect-chain-button': '🔗',
        'get-button': '🕰️',
        'adaptive-flow-button': '🌊',
        'ai-collab-button': '🤝',
        'story-arc-button': '📚',
        'narrative-chapters-button': '🧱',
        'immersive-space-button': '🛰️',
        'human-touch-button': '🫀',
        'release-forecast-button': '📈'
    };
    const LEADING_EMOJIS = new Set([...Object.values(EMOJI_BY_ID), '⏳']);

    function chunk(items, size) {
        const chunks = [];
        for (let i = 0; i < items.length; i += size) {
            chunks.push(items.slice(i, i + size));
        }
        return chunks;
    }

    function addEmojiIdentity(button) {
        const emoji = EMOJI_BY_ID[button.id];
        if (!emoji) return;
        const heading = button.querySelector('h3');
        if (!heading || heading.dataset.emojiReady === '1') return;
        let text = (heading.textContent || '').trim();
        if (!text) return;
        for (const icon of LEADING_EMOJIS) {
            const prefix = `${icon} `;
            if (text.startsWith(prefix)) {
                text = text.slice(prefix.length).trim();
                break;
            }
        }
        heading.textContent = '';
        const emojiNode = document.createElement('span');
        emojiNode.className = 'tool-emoji';
        emojiNode.textContent = emoji;
        const labelNode = document.createElement('span');
        labelNode.className = 'tool-label';
        labelNode.textContent = text;
        heading.append(emojiNode, labelNode);
        heading.dataset.emojiReady = '1';
    }

    function buildPager(panel, track, pageCount) {
        const pager = panel.querySelector('[data-panel-pager]');
        if (!pager) return;
        pager.textContent = '';

        const dots = [];
        let currentPage = -1;
        let isAnimating = false;
        let animationTimeout = null;
        let animationFrame = null;
        const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const canAnimate = !prefersReducedMotion && pageCount > 1;

        function finishAnimation() {
            isAnimating = false;
            track.classList.remove('is-animating');
            pager.classList.remove('is-animating');
            if (animationTimeout) {
                clearTimeout(animationTimeout);
                animationTimeout = null;
            }
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }
        }

        if (canAnimate) {
            track.addEventListener('transitionend', (event) => {
                if (event.propertyName === 'transform') {
                    finishAnimation();
                }
            });
        }

        function setPage(index, immediate = false) {
            if (pageCount <= 0 || isAnimating) return;
            const next = Math.max(0, Math.min(pageCount - 1, index));
            if (next === currentPage) return;
            currentPage = next;
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('active', dotIndex === next);
            });

            if (canAnimate && !immediate) {
                isAnimating = true;
                track.classList.add('is-animating');
                pager.classList.add('is-animating');
                animationFrame = requestAnimationFrame(() => {
                    track.style.transform = `translate3d(-${next * 100}%, 0, 0)`;
                });
                animationTimeout = setTimeout(finishAnimation, TRANSITION_MS + 90);
                return;
            }

            track.style.transform = `translate3d(-${next * 100}%, 0, 0)`;
            finishAnimation();
        }

        for (let i = 0; i < pageCount; i += 1) {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'tool-page-dot';
            dot.setAttribute('aria-label', `Tool-Seite ${i + 1}`);
            dot.dataset.pageIndex = String(i);
            pager.appendChild(dot);
            dots.push(dot);
        }

        pager.addEventListener('click', (event) => {
            const dot = event.target.closest('button.tool-page-dot[data-page-index]');
            if (!dot) return;
            setPage(Number(dot.dataset.pageIndex));
        });

        const ghostDot = document.createElement('span');
        ghostDot.className = 'tool-page-dot ghost';
        ghostDot.setAttribute('aria-hidden', 'true');
        pager.appendChild(ghostDot);

        setPage(0, true);
    }

    function buildPanel(panel) {
        if (panel.dataset.toolPagingReady === '1') return;
        const source = panel.querySelector('.tool-grid-source');
        if (!source) return;

        const buttons = Array.from(source.querySelectorAll('.klug-btn'));
        if (!buttons.length) {
            source.remove();
            panel.dataset.toolPagingReady = '1';
            return;
        }

        buttons.forEach(addEmojiIdentity);

        const pages = chunk(buttons, PAGE_SIZE);
        const viewport = document.createElement('div');
        const track = document.createElement('div');
        const pageFragment = document.createDocumentFragment();

        viewport.className = 'tool-pages-viewport';
        track.className = 'tool-pages-track';

        pages.forEach((pageButtons, pageIndex) => {
            const page = document.createElement('div');
            page.className = 'tool-page';
            page.setAttribute('data-page-index', String(pageIndex));
            pageButtons.forEach((button) => page.appendChild(button));
            pageFragment.appendChild(page);
        });

        track.appendChild(pageFragment);
        viewport.appendChild(track);
        source.replaceWith(viewport);
        buildPager(panel, track, pages.length);
        panel.dataset.toolPagingReady = '1';
    }

    function initToolPaging() {
        const panels = document.querySelectorAll('.tool-system-panel');
        panels.forEach((panel) => buildPanel(panel));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initToolPaging);
    } else {
        initToolPaging();
    }
})();
