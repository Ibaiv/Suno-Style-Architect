// Load modal HTML into the page
document.addEventListener('DOMContentLoaded', () => {
    const modalsContainer = document.getElementById('modals-container');
    if (modalsContainer) {
        modalsContainer.innerHTML = getModalsHTML();
        // Notify others that modals are ready in the DOM
        document.dispatchEvent(new CustomEvent('modals:ready'));
    }
});

function getModalsHTML() {
    return `
    <!-- ### MODALS ### -->
    <!-- IDEA SPARK MODAL -->
    <div id="idea-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-2xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">✨ Ideen-Funke</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none" aria-label="Schließen">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Gib ein Stichwort ein und erhalte 3 kreative Song-Ideen als Starthilfe.</p>
            <div class="flex gap-2 mb-4">
                <input type="text" id="keyword-input" class="flex-grow bg-neutral-900/70 border border-neutral-600 rounded-lg p-2 text-neutral-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="z.B. Ozean, Mitternacht, Nostalgie...">
                <button id="generate-ideas-button" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center w-36 btn-transition btn-press">
                    <span id="idea-button-text">Generieren</span>
                    <svg aria-hidden="true" focusable="false" id="idea-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </button>
            </div>
            <div id="ideas-output" class="space-y-3 text-sm max-h-[50vh] overflow-auto"></div>
        </div>
    </div>
    
    <!-- EXPERT MODALS -->
    <div id="producer-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-md">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">Veredelung: Produzent</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none" aria-label="Schließen">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Bestimme, wie stark der Produzent den Prompt mit technischem Wissen (Mix, Sound-Design) beeinflussen soll.</p>
            <div class="mb-4">
                <input id="producer-slider" type="range" min="0" max="100" value="50" step="10" class="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer">
                <div class="flex justify-between items-center text-xs text-neutral-500 mt-1">
                    <span>Wenig</span>
                    <span id="producer-slider-value" class="text-sm font-semibold text-blue-300">50%</span>
                    <span>Stark</span>
                </div>
            </div>
            <button id="apply-producer-button" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press">
                 <span id="apply-producer-text">Anwenden</span>
                 <svg aria-hidden="true" focusable="false" id="apply-producer-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </button>
        </div>
    </div>

    <div id="musician-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-md">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">Veredelung: Musiker</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none" aria-label="Schließen">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Bestimme, wie stark der Musiker den Prompt mit musikalischem Wissen (Emotion, Instrumentierung) beeinflussen soll.</p>
            <div class="mb-4">
                 <input id="musician-slider" type="range" min="0" max="100" value="50" step="10" class="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer">
                <div class="flex justify-between items-center text-xs text-neutral-500 mt-1">
                    <span>Wenig</span>
                    <span id="musician-slider-value" class="text-sm font-semibold text-blue-300">50%</span>
                    <span>Stark</span>
                </div>
            </div>
            <button id="apply-musician-button" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press">
                <span id="apply-musician-text">Anwenden</span>
                <svg aria-hidden="true" focusable="false" id="apply-musician-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </button>
        </div>
    </div>

    <div id="composer-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-md">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">Veredelung: Filmkomponist</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none" aria-label="Schließen">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Bestimme, wie stark der Komponist den Prompt mit cineastischem Wissen (Story, Spannung) beeinflussen soll.</p>
            <div class="mb-4">
                 <input id="composer-slider" type="range" min="0" max="100" value="50" step="10" class="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer">
                <div class="flex justify-between items-center text-xs text-neutral-500 mt-1">
                    <span>Wenig</span>
                    <span id="composer-slider-value" class="text-sm font-semibold text-blue-300">50%</span>
                    <span>Stark</span>
                </div>
            </div>
            <button id="apply-composer-button" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press">
                <span id="apply-composer-text">Anwenden</span>
                <svg aria-hidden="true" focusable="false" id="apply-composer-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </button>
        </div>
    </div>

    <div id="dj-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-md">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">Veredelung: DJ / Remixer</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none" aria-label="Schließen">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Bestimme, wie stark der DJ den Prompt mit club-tauglichem Wissen (Groove, Energie) beeinflussen soll.</p>
            <div class="mb-4">
                 <input id="dj-slider" type="range" min="0" max="100" value="50" step="10" class="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer">
                <div class="flex justify-between items-center text-xs text-neutral-500 mt-1">
                    <span>Wenig</span>
                    <span id="dj-slider-value" class="text-sm font-semibold text-blue-300">50%</span>
                    <span>Stark</span>
                </div>
            </div>
            <button id="apply-dj-button" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press">
                <span id="apply-dj-text">Anwenden</span>
                <svg aria-hidden="true" focusable="false" id="apply-dj-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </button>
        </div>
    </div>

    <!-- MISSING EXPERT MODALS -->
    <div id="avantgarde-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-md">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">Veredelung: Avantgarde-Klangkünstler</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none" aria-label="Schließen">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Bestimme, wie stark experimentelle und unkonventionelle Elemente den Prompt beeinflussen sollen.</p>
            <div class="mb-4">
                <input id="avantgarde-slider" type="range" min="0" max="100" value="50" step="10" class="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer">
                <div class="flex justify-between items-center text-xs text-neutral-500 mt-1">
                    <span>Wenig</span>
                    <span id="avantgarde-slider-value" class="text-sm font-semibold text-blue-300">50%</span>
                    <span>Stark</span>
                </div>
            </div>
            <button id="apply-avantgarde-button" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press">
                <span id="apply-avantgarde-text">Anwenden</span>
                <svg aria-hidden="true" focusable="false" id="apply-avantgarde-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </button>
        </div>
    </div>

    <div id="minimalist-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-md">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">Veredelung: Minimalist-Komponist</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none" aria-label="Schließen">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Bestimme, wie stark der minimalistische Ansatz den Prompt vereinfachen und auf die Essenz reduzieren soll.</p>
            <div class="mb-4">
                <input id="minimalist-slider" type="range" min="0" max="100" value="50" step="10" class="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer">
                <div class="flex justify-between items-center text-xs text-neutral-500 mt-1">
                    <span>Wenig</span>
                    <span id="minimalist-slider-value" class="text-sm font-semibold text-blue-300">50%</span>
                    <span>Stark</span>
                </div>
            </div>
            <button id="apply-minimalist-button" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press">
                <span id="apply-minimalist-text">Anwenden</span>
                <svg aria-hidden="true" focusable="false" id="apply-minimalist-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </button>
        </div>
    </div>

    <div id="vocal-harmony-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-md">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">Veredelung: Vocal-Harmony Arrangeur</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none" aria-label="Schließen">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Bestimme, wie stark komplexe Gesangs-Arrangements und Harmonien den Prompt beeinflussen sollen.</p>
            <div class="mb-4">
                <input id="vocal-harmony-slider" type="range" min="0" max="100" value="50" step="10" class="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer">
                <div class="flex justify-between items-center text-xs text-neutral-500 mt-1">
                    <span>Wenig</span>
                    <span id="vocal-harmony-slider-value" class="text-sm font-semibold text-blue-300">50%</span>
                    <span>Stark</span>
                </div>
            </div>
            <button id="apply-vocal-harmony-button" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press">
                <span id="apply-vocal-harmony-text">Anwenden</span>
                <svg aria-hidden="true" focusable="false" id="apply-vocal-harmony-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </button>
        </div>
    </div>

    <div id="ethno-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-md">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">Veredelung: Ethno-Musiker</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none" aria-label="Schließen">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Bestimme, wie stark authentische Weltmusik-Elemente den Prompt beeinflussen sollen.</p>
            <div class="mb-4">
                <input id="ethno-slider" type="range" min="0" max="100" value="50" step="10" class="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer">
                <div class="flex justify-between items-center text-xs text-neutral-500 mt-1">
                    <span>Wenig</span>
                    <span id="ethno-slider-value" class="text-sm font-semibold text-blue-300">50%</span>
                    <span>Stark</span>
                </div>
            </div>
            <button id="apply-ethno-button" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press">
                <span id="apply-ethno-text">Anwenden</span>
                <svg aria-hidden="true" focusable="false" id="apply-ethno-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </button>
        </div>
    </div>

    <div id="sound-engineer-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-lg">
           <div class="flex justify-between items-center mb-4">
               <h2 class="text-xl font-bold text-white">Experte: Sound-Ingenieur</h2>
               <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none" aria-label="Schließen">&times;</button>
           </div>
           <p class="text-neutral-400 mb-4 text-sm">Füge bis zu drei spezifische Anweisungen hinzu, um dein Meisterstück zu verfeinern (z.B. "Phaser-Effekt auf die Drums", "betonte Snare in den Höhen", "Sternschnuppen-Sounds am Ende").</p>
           <div class="space-y-3">
                <textarea class="sound-engineer-input w-full bg-neutral-900/70 border border-neutral-700 rounded-xl p-3 text-neutral-300 focus:ring-2 focus:ring-blue-500 placeholder-neutral-500 text-base" rows="2" placeholder="Anweisung 1..."></textarea>
                <textarea class="sound-engineer-input w-full bg-neutral-900/70 border border-neutral-700 rounded-xl p-3 text-neutral-300 focus:ring-2 focus:ring-blue-500 placeholder-neutral-500 text-base" rows="2" placeholder="Anweisung 2 (optional)..."></textarea>
                <textarea class="sound-engineer-input w-full bg-neutral-900/70 border border-neutral-700 rounded-xl p-3 text-neutral-300 focus:ring-2 focus:ring-blue-500 placeholder-neutral-500 text-base" rows="2" placeholder="Anweisung 3 (optional)..."></textarea>
           </div>
           <button id="apply-sound-engineer-button" class="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press">
               <span id="apply-sound-engineer-text">Anwenden</span>
               <svg aria-hidden="true" focusable="false" id="apply-sound-engineer-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
           </button>
       </div>
    </div>
    
    <!-- KLUG MODALS -->
    <div id="genre-mixer-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-2xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">🎶 Genre-Mixer</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none" aria-label="Schließen">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Kombiniere bis zu 3 Genres, um einen einzigartigen Sound zu kreieren.</p>
            <div id="genre-selectors" class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4"></div>
            <button id="mix-genres-button" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press">
                <span id="mix-genres-button-text">Mischen & Anwenden</span>
                <svg aria-hidden="true" focusable="false" id="mix-genres-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </button>
            <div id="genre-mixer-output" class="mt-4 text-sm"></div>
        </div>
    </div>

    <div id="hook-generator-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
         <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-2xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">🎣 Titel- & Hook-Generator</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none" aria-label="Schließen">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Die KI schlägt Titel und Refrain-Ideen vor. Klicke, um sie dem Meisterstück hinzuzufügen.</p>
            <div id="hook-generator-output" class="space-y-4 text-sm min-h-[150px]"></div>
        </div>
    </div>

    <div id="song-structure-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-2xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">📑 Song-Struktur-Assistent</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none" aria-label="Schließen">&times;</button>
            </div>
             <p class="text-neutral-400 mb-4 text-sm">Hier ist ein Vorschlag für die Struktur deines Songs.</p>
            <div id="song-structure-output" class="space-y-3 text-sm min-h-[100px]"></div>
        </div>
    </div>

    <div id="mood-analyzer-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
         <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-2xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">🔬 Stimmungs-Analysator</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none" aria-label="Schließen">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Wähle passende Instrumente aus und klicke auf "Übernehmen".</p>
            <div id="mood-analyzer-suggestions" class="flex flex-wrap gap-2 text-sm min-h-[50px]"></div>
            <div class="mt-6 border-t border-neutral-700/60 pt-4 flex justify-end">
                <button id="apply-mood-button" class="w-36 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg btn-transition btn-press flex justify-center items-center">
                    <span id="apply-mood-button-text">Übernehmen</span>
                    <svg aria-hidden="true" focusable="false" id="apply-mood-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </button>
            </div>
        </div>
    </div>

    <div id="vibe-enhancer-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-4xl">
             <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">🎨 Vibe-Veredler</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none" aria-label="Schließen">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Die KI hat deinen Prompt mit mehr atmosphärischen Details angereichert. Vergleiche und übernehme den Vorschlag.</p>
            <div id="vibe-enhancer-output" class="grid md:grid-cols-2 gap-4 max-h-[60vh] overflow-auto"></div>
        </div>
    </div>

    <div id="artist-suggester-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
         <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-2xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">🧭 Künstler-Kompass</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none" aria-label="Schließen">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Hier sind Künstler mit einem ähnlichen Stil. Klicke einen Namen an, um ihn deinem Prompt hinzuzufügen.</p>
            <div id="artist-suggester-output" class="space-y-3 text-sm min-h-[150px]"></div>
        </div>
    </div>

    <div id="tempo-finder-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-md">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">⏱️ Tempo & BPM-Finder</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none" aria-label="Schließen">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Hier ist ein Tempo-Vorschlag für deinen Song.</p>
            <div id="tempo-finder-output" class="space-y-3 text-sm min-h-[100px]"></div>
        </div>
    </div>

    <div id="production-finish-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-2xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">🎚️ Produktions-Finish</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none" aria-label="Schließen">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Wähle passende Produktions-Techniken aus, um deinem Song den letzten Schliff zu geben.</p>
            <div id="production-finish-suggestions" class="flex flex-wrap gap-2 text-sm min-h-[50px]"></div>
            <div class="mt-6 border-t border-neutral-700/60 pt-4 flex justify-end">
                <button id="apply-production-button" class="w-36 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg btn-transition btn-press flex justify-center items-center">
                    <span id="apply-production-text">Übernehmen</span>
                    <svg aria-hidden="true" focusable="false" id="apply-production-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </button>
            </div>
        </div>
    </div>

    <div id="vocal-stylist-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-2xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">🎤 Gesangs-Stilist</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none" aria-label="Schließen">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Wähle passende Gesangs-Stile aus und übernehme sie in dein Meisterstück.</p>
            <div id="vocal-stylist-suggestions" class="flex flex-wrap gap-2 text-sm min-h-[50px]"></div>
            <div class="mt-6 border-t border-neutral-700/60 pt-4 flex justify-end">
                <button id="apply-vocal-style-button" class="w-36 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg btn-transition btn-press flex justify-center items-center">
                    <span id="apply-vocal-style-text">Übernehmen</span>
                    <svg aria-hidden="true" focusable="false" id="apply-vocal-style-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </button>
            </div>
        </div>
    </div>

    <!-- CUSTOM INSTRUCTION MODAL -->
    <div id="custom-instruction-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-lg">
           <div class="flex justify-between items-center mb-4">
               <h2 class="text-xl font-bold text-white">Eigene Anweisung</h2>
               <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none" aria-label="Schließen">&times;</button>
           </div>
           <p class="text-neutral-400 mb-4 text-sm">Gib eine freie Anweisung, wie die KI den aktuellen Prompt verändern soll.</p>
           <textarea id="custom-instruction-input" rows="4" class="w-full bg-neutral-900/70 border border-neutral-700 rounded-xl p-3 text-neutral-300 focus:ring-2 focus:ring-blue-500 placeholder-neutral-500 text-base" placeholder="z.B. Mache es düsterer und füge einen Kinderchor hinzu..."></textarea>
           <button id="apply-custom-instruction-button" class="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press">
               <span id="apply-custom-instruction-text">Anwenden</span>
               <svg aria-hidden="true" focusable="false" id="apply-custom-instruction-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
           </button>
       </div>
   </div>

    <!-- NEW KLUG MODALS -->
    <div id="groove-meister-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-2xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">KLUG: Groove-Meister</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none" aria-label="Schließen">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Wähle passende rhythmische Konzepte aus, um den Groove deines Songs zu definieren.</p>
            <div id="groove-meister-suggestions" class="flex flex-wrap gap-2 text-sm min-h-[50px]"></div>
            <div class="mt-6 border-t border-neutral-700/60 pt-4 flex justify-end">
                <button id="apply-groove-meister-button" class="w-36 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg btn-transition btn-press flex justify-center items-center">
                    <span id="apply-groove-meister-text">Übernehmen</span>
                    <svg aria-hidden="true" focusable="false" id="apply-groove-meister-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </button>
            </div>
        </div>
    </div>

    <div id="performance-coach-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-2xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">KLUG: Performance-Coach</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none" aria-label="Schließen">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Wähle spezifische Spielweisen aus, um der Performance mehr Charakter zu verleihen.</p>
            <div id="performance-coach-suggestions" class="flex flex-wrap gap-2 text-sm min-h-[50px]"></div>
            <div class="mt-6 border-t border-neutral-700/60 pt-4 flex justify-end">
                <button id="apply-performance-coach-button" class="w-36 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg btn-transition btn-press flex justify-center items-center">
                    <span id="apply-performance-coach-text">Übernehmen</span>
                    <svg aria-hidden="true" focusable="false" id="apply-performance-coach-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </button>
            </div>
        </div>
    </div>

    <div id="effect-chain-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-2xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">KLUG: Effektketten-Designer</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none" aria-label="Schließen">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Wähle passende Audio-Effekte aus, um den Sound zu formen.</p>
            <div id="effect-chain-suggestions" class="flex flex-wrap gap-2 text-sm min-h-[50px]"></div>
            <div class="mt-6 border-t border-neutral-700/60 pt-4 flex justify-end">
                <button id="apply-effect-chain-button" class="w-36 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg btn-transition btn-press flex justify-center items-center">
                    <span id="apply-effect-chain-text">Übernehmen</span>
                    <svg aria-hidden="true" focusable="false" id="apply-effect-chain-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </button>
            </div>
        </div>
    </div>

    <!-- FUTURE LAB MODALS -->
    <div id="adaptive-flow-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-4xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">🌀 Adaptiver Flow</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none" aria-label="Schließen">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Steuere, wie stark dein Song über die Reise hinweg anschwillt, kulminiert und wieder zur Ruhe kommt.</p>
            <div class="flex flex-col lg:flex-row lg:items-center gap-4 bg-neutral-900/40 border border-neutral-700 rounded-2xl p-4">
                <div class="flex-1">
                    <label for="adaptive-flow-slider" class="block text-xs font-medium text-neutral-400 uppercase tracking-wide mb-2">Dynamik-Intensität</label>
                    <input id="adaptive-flow-slider" type="range" min="0" max="100" value="65" class="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer">
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-neutral-400 text-xs uppercase tracking-wide">Level</span>
                    <span id="adaptive-flow-level" class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600/20 border border-blue-500/50 text-lg font-semibold text-blue-200">65</span>
                </div>
                <button id="run-adaptive-flow-button" class="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg btn-transition btn-press flex items-center justify-center gap-2">
                    <span id="run-adaptive-flow-text">Flow formen</span>
                    <svg aria-hidden="true" focusable="false" id="adaptive-flow-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </button>
            </div>
            <div id="adaptive-flow-output" class="mt-5 text-sm space-y-4"></div>
        </div>
    </div>

    <div id="ai-collab-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-4xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">🤝 KI-Kollaboration</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none" aria-label="Schließen">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Wähle Personas, die gemeinsam an deinem Track arbeiten sollen. Die KI beschreibt, wie sie sich gegenseitig inspirieren.</p>
            <div id="ai-collab-personas" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"></div>
            <div class="mt-6 border-t border-neutral-700/60 pt-4 flex justify-end">
                <button id="generate-ai-collab-button" class="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg btn-transition btn-press flex items-center justify-center gap-2">
                    <span id="generate-ai-collab-text">Interplay erschaffen</span>
                    <svg aria-hidden="true" focusable="false" id="ai-collab-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </button>
            </div>
            <div id="ai-collab-output" class="mt-5 text-sm space-y-4"></div>
        </div>
    </div>

    <div id="story-arc-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-4xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">📚 Story-Arc Designer</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none" aria-label="Schließen">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Transformiere deinen Prompt in eine dreiteilige musikalische Reise mit klaren Höhepunkten.</p>
            <div class="border border-neutral-700 rounded-2xl p-4 bg-neutral-900/40">
                <button id="story-arc-generate-button" class="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg btn-transition btn-press flex items-center justify-center gap-2">
                    <span id="story-arc-generate-text">Arc neu berechnen</span>
                    <svg aria-hidden="true" focusable="false" id="story-arc-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </button>
                <div id="story-arc-output" class="mt-4 text-sm space-y-4"></div>
            </div>
        </div>
    </div>

    <div id="narrative-chapters-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-5xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">📖 Narrative Chapters</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none" aria-label="Schließen">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Erzeuge eine zusammenhängende Kapitelreise mit konsistenter Stil-DNA und kontrollierter Entwicklung von Mood, Key, Rhythmus und Energie.</p>
            <div class="grid gap-4 md:grid-cols-3 bg-neutral-900/40 border border-neutral-700 rounded-2xl p-4">
                <div>
                    <label for="narrative-chapter-count" class="block text-xs font-medium text-neutral-400 uppercase tracking-wide mb-2">Kapitelanzahl</label>
                    <select id="narrative-chapter-count" class="w-full bg-neutral-900/70 border border-neutral-600 rounded-lg p-2 text-neutral-200 focus:ring-2 focus:ring-blue-500">
                        <option value="3">3 Kapitel</option>
                        <option value="4" selected>4 Kapitel</option>
                        <option value="5">5 Kapitel</option>
                    </select>
                </div>
                <div class="md:col-span-2 flex items-end">
                    <button id="run-narrative-chapters-button" class="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg btn-transition btn-press flex items-center justify-center gap-2">
                        <span id="run-narrative-chapters-text">Kapitel generieren</span>
                        <svg aria-hidden="true" focusable="false" id="narrative-chapters-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    </button>
                </div>
            </div>
            <div id="narrative-chapters-output" class="mt-5 text-sm space-y-4"></div>
        </div>
    </div>

    <div id="immersive-space-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-4xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">🌌 Immersive Space</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none" aria-label="Schließen">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Definiere akustische Räume und Bewegungen, damit dein Song in 3D erlebbar wird.</p>
            <div id="immersive-space-presets" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"></div>
            <div class="mt-6 border-t border-neutral-700/60 pt-4 flex justify-end">
                <button id="run-immersive-space-button" class="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg btn-transition btn-press flex items-center justify-center gap-2">
                    <span id="run-immersive-space-text">Raum modellieren</span>
                    <svg aria-hidden="true" focusable="false" id="immersive-space-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </button>
            </div>
            <div id="immersive-space-output" class="mt-5 text-sm space-y-4"></div>
        </div>
    </div>

    <div id="human-touch-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-4xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">🎛️ Human Touch</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none" aria-label="Schließen">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Füge analoge Nuancen, organische Bewegungen und kleine Unvollkommenheiten hinzu.</p>
            <div id="human-touch-options" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"></div>
            <div class="mt-6 border-t border-neutral-700/60 pt-4 flex justify-end">
                <button id="apply-human-touch-button" class="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg btn-transition btn-press flex items-center justify-center gap-2">
                    <span id="apply-human-touch-text">Humanisieren</span>
                    <svg aria-hidden="true" focusable="false" id="human-touch-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </button>
            </div>
            <div id="human-touch-output" class="mt-5 text-sm space-y-4"></div>
        </div>
    </div>

    <div id="release-forecast-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-4xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">🚀 Release Forecast</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none" aria-label="Schließen">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Plane den Launch deines Songs mit datengetriebenen Impulsen, abgestimmt auf Stimmung und Zielgruppe.</p>
            <div class="grid gap-4 md:grid-cols-3 bg-neutral-900/40 border border-neutral-700 rounded-2xl p-4">
                <div class="md:col-span-1">
                    <label for="release-forecast-timeline" class="block text-xs font-medium text-neutral-400 uppercase tracking-wide mb-2">Zeitplan (Wochen)</label>
                    <select id="release-forecast-timeline" class="w-full bg-neutral-900/70 border border-neutral-600 rounded-lg p-2 text-neutral-200 focus:ring-2 focus:ring-blue-500">
                        <option value="4">4 Wochen Sprint</option>
                        <option value="6" selected>6 Wochen Kampagne</option>
                        <option value="8">8 Wochen Deep Dive</option>
                        <option value="12">12 Wochen Roll-out</option>
                    </select>
                </div>
                <div class="md:col-span-2">
                    <p class="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-2">Fokus-Kanäle</p>
                    <div id="release-forecast-levers" class="grid grid-cols-1 sm:grid-cols-2 gap-3"></div>
                </div>
            </div>
            <div class="mt-6 border-t border-neutral-700/60 pt-4 flex justify-end">
                <button id="generate-release-forecast-button" class="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg btn-transition btn-press flex items-center justify-center gap-2">
                    <span id="generate-release-forecast-text">Plan generieren</span>
                    <svg aria-hidden="true" focusable="false" id="release-forecast-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </button>
            </div>
            <div id="release-forecast-output" class="mt-5 text-sm space-y-4"></div>
        </div>
    </div>
    
    <div id="synth-designer-modal" class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-[#0f111a] border border-white/10 rounded-3xl shadow-2xl p-8 w-full max-w-3xl relative overflow-hidden">
            <!-- Background Glow -->
            <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div class="flex justify-between items-center mb-8 relative z-10">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-white/5 rounded-lg border border-white/10">
                        <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h.01"/><path d="M17 7h.01"/><path d="M7 17h.01"/><path d="M17 17h.01"/><path d="M12 12h.01"/></svg>
                    </div>
                    <h2 class="text-xl font-bold text-white tracking-tight">Synth-Designer Lab</h2>
                </div>
                <button class="close-modal-button text-neutral-500 hover:text-white transition-colors" aria-label="Schließen">
                    <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            
            <form id="synth-designer-form" class="space-y-8 relative z-10">
                <!-- Section 1: Instrument Role -->
                <div>
                    <p class="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] mb-4" id="synth-role-label">1. Instrument-Rolle</p>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4" role="radiogroup" aria-labelledby="synth-role-label">
                        <label class="block cursor-pointer group">
                            <input type="radio" name="synth-role" value="Lead melody" class="sr-only peer">
                            <div class="synth-card aspect-square rounded-2xl border border-white/5 bg-[#13151f] flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:border-white/20 peer-checked:border-blue-500 peer-checked:bg-blue-500/5 peer-checked:shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                                <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-400 group-hover:text-white peer-checked:text-blue-400 transition-colors"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>
                                <span class="text-sm font-medium text-neutral-400 group-hover:text-white peer-checked:text-white">Lead</span>
                            </div>
                        </label>
                        <label class="block cursor-pointer group">
                            <input type="radio" name="synth-role" value="Bass foundation" class="sr-only peer">
                            <div class="synth-card aspect-square rounded-2xl border border-white/5 bg-[#13151f] flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:border-white/20 peer-checked:border-blue-500 peer-checked:bg-blue-500/5 peer-checked:shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                                <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-400 group-hover:text-white peer-checked:text-blue-400 transition-colors"><path d="M13.8 2.2a2 2 0 0 1 1 1.7l-1 5a2 2 0 0 1-3.5 1l-1.5-3a2 2 0 0 1 .5-2.5l2.5-2.2Z"/><path d="M6 9.5a5.5 5.5 0 0 0 2 11h8a5.5 5.5 0 0 0 2-11"/><path d="M9 16c1.5-1 4-1 6 0"/><path d="M9 13a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2"/></svg>
                                <span class="text-sm font-medium text-neutral-400 group-hover:text-white peer-checked:text-white">Bass</span>
                            </div>
                        </label>
                        <label class="block cursor-pointer group">
                            <input type="radio" name="synth-role" value="Atmospheric pad" class="sr-only peer">
                            <div class="synth-card aspect-square rounded-2xl border border-white/5 bg-[#13151f] flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:border-white/20 peer-checked:border-blue-500 peer-checked:bg-blue-500/5 peer-checked:shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                                <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-400 group-hover:text-white peer-checked:text-blue-400 transition-colors"><path d="M17.5 19c0-1.7-1.3-3-3-3h-5c-1.7 0-3 1.3-3 3"/><path d="M12 2C7 2 3 7 3 13s5 11 9 11 9-5 9-11-4-11-9-11z"/></svg>
                                <span class="text-sm font-medium text-neutral-400 group-hover:text-white peer-checked:text-white">Pad</span>
                            </div>
                        </label>
                        <label class="block cursor-pointer group">
                            <input type="radio" name="synth-role" value="Arpeggiated pattern" class="sr-only peer">
                            <div class="synth-card aspect-square rounded-2xl border border-white/5 bg-[#13151f] flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:border-white/20 peer-checked:border-blue-500 peer-checked:bg-blue-500/5 peer-checked:shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                                <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-400 group-hover:text-white peer-checked:text-blue-400 transition-colors"><path d="M2 8h20"/><path d="M6 8v12"/><path d="M10 8v12"/><path d="M14 8v12"/><path d="M18 8v12"/><rect width="20" height="16" x="2" y="4" rx="2"/></svg>
                                <span class="text-sm font-medium text-neutral-400 group-hover:text-white peer-checked:text-white">Arpeggio</span>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Section 2: Waveform -->
                <div>
                    <p class="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] mb-4" id="synth-core-label">2. Grundcharakter (Waveform)</p>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4" role="radiogroup" aria-labelledby="synth-core-label">
                        <label class="block cursor-pointer group">
                            <input type="radio" name="synth-core" value="soft, warm waveform" class="sr-only peer">
                            <div class="synth-card p-6 rounded-2xl border border-white/5 bg-[#13151f] flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:border-white/20 peer-checked:border-blue-500 peer-checked:bg-blue-500/5 peer-checked:shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                                <span class="text-3xl filter drop-shadow opacity-80 group-hover:opacity-100 transition-opacity">🔥</span>
                                <span class="text-sm font-medium text-neutral-400 group-hover:text-white peer-checked:text-white">Soft/Warm</span>
                            </div>
                        </label>
                        <label class="block cursor-pointer group">
                            <input type="radio" name="synth-core" value="hollow, woody timbre" class="sr-only peer">
                            <div class="synth-card p-6 rounded-2xl border border-white/5 bg-[#13151f] flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:border-white/20 peer-checked:border-blue-500 peer-checked:bg-blue-500/5 peer-checked:shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                                <span class="text-3xl filter drop-shadow opacity-80 group-hover:opacity-100 transition-opacity">🪵</span>
                                <span class="text-sm font-medium text-neutral-400 group-hover:text-white peer-checked:text-white">Hollow</span>
                            </div>
                        </label>
                        <label class="block cursor-pointer group">
                            <input type="radio" name="synth-core" value="bright, harmonically rich waveform" class="sr-only peer">
                            <div class="synth-card p-6 rounded-2xl border border-white/5 bg-[#13151f] flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:border-white/20 peer-checked:border-blue-500 peer-checked:bg-blue-500/5 peer-checked:shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                                <span class="text-3xl filter drop-shadow opacity-80 group-hover:opacity-100 transition-opacity">✨</span>
                                <span class="text-sm font-medium text-neutral-400 group-hover:text-white peer-checked:text-white">Bright</span>
                            </div>
                        </label>
                        <label class="block cursor-pointer group">
                            <input type="radio" name="synth-core" value="noisy, digital texture" class="sr-only peer">
                            <div class="synth-card p-6 rounded-2xl border border-white/5 bg-[#13151f] flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:border-white/20 peer-checked:border-blue-500 peer-checked:bg-blue-500/5 peer-checked:shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                                <span class="text-3xl filter drop-shadow opacity-80 group-hover:opacity-100 transition-opacity">⚡</span>
                                <span class="text-sm font-medium text-neutral-400 group-hover:text-white peer-checked:text-white">Noisy</span>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Section 3: Filter Slider -->
                <div>
                     <p class="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] mb-6">3. Timbre (Filter)</p>
                     <div class="relative px-1 py-4">
                        <input id="synth-filter-slider" type="range" min="0" max="100" value="50" 
                            class="synth-slider w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-0 z-20 relative">
                         <!-- Track Fill -->
                        <div class="absolute top-[20px] left-1 right-1 h-1 rounded-lg pointer-events-none z-10 overflow-hidden">
                            <div class="h-full bg-blue-500 transition-all duration-75 ease-out" style="width: var(--range-progress, 50%)"></div>
                        </div>
                    </div>
                    <div class="flex justify-center mt-2">
                         <span id="synth-filter-value" class="text-xs font-semibold tracking-wide text-blue-200 bg-[#1e293b] px-3 py-1.5 rounded-full border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]">Ausgewogen</span>
                    </div>
                </div>

                <!-- Section 4: Envelope -->
                <div>
                    <p class="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] mb-4" id="synth-envelope-label">4. Hüllkurve (Envelope)</p>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4" role="radiogroup" aria-labelledby="synth-envelope-label">
                        <label class="block cursor-pointer group">
                            <input type="radio" name="synth-envelope" value="short, plucky articulation" class="sr-only peer">
                             <div class="synth-card p-4 rounded-xl border border-white/5 bg-[#13151f] flex flex-col items-center justify-center gap-1 transition-all duration-300 hover:border-white/20 peer-checked:border-blue-500 peer-checked:bg-blue-500/5">
                                <span class="text-sm font-medium text-neutral-400 group-hover:text-white peer-checked:text-white">Kurz / Pluck</span>
                                <span class="text-[11px] text-neutral-600">Schneller Attack</span>
                            </div>
                        </label>
                        <label class="block cursor-pointer group">
                            <input type="radio" name="synth-envelope" value="slow, swelling rise" class="sr-only peer">
                             <div class="synth-card p-4 rounded-xl border border-white/5 bg-[#13151f] flex flex-col items-center justify-center gap-1 transition-all duration-300 hover:border-white/20 peer-checked:border-blue-500 peer-checked:bg-blue-500/5">
                                <span class="text-sm font-medium text-neutral-400 group-hover:text-white peer-checked:text-white">Schwellend</span>
                                <span class="text-[11px] text-neutral-600">Langsamer Aufbau</span>
                            </div>
                        </label>
                        <label class="block cursor-pointer group">
                            <input type="radio" name="synth-envelope" value="long, sustained hold" class="sr-only peer">
                             <div class="synth-card p-4 rounded-xl border border-white/5 bg-[#13151f] flex flex-col items-center justify-center gap-1 transition-all duration-300 hover:border-white/20 peer-checked:border-blue-500 peer-checked:bg-blue-500/5">
                                <span class="text-sm font-medium text-neutral-400 group-hover:text-white peer-checked:text-white">Sustain</span>
                                <span class="text-[11px] text-neutral-600">Hält lange</span>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Section 5: Effects -->
                <div>
                     <p class="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] mb-4" id="synth-effects-label">5. Effekte</p>
                     <div class="flex flex-wrap gap-2" role="group" aria-labelledby="synth-effects-label">
                        <label class="cursor-pointer group">
                            <input type="checkbox" name="synth-effects" value="lush reverb for spaciousness" class="sr-only peer">
                            <div class="synth-effect-pill px-6 py-2.5 rounded-full border border-white/5 bg-[#13151f] text-sm text-neutral-400 transition-all duration-200 hover:bg-white/5 hover:text-white peer-checked:bg-blue-600 peer-checked:border-blue-500 peer-checked:text-white peer-checked:shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                                Reverb
                            </div>
                        </label>
                        <label class="cursor-pointer group">
                            <input type="checkbox" name="synth-effects" value="tempo-synced echo" class="sr-only peer">
                             <div class="synth-effect-pill px-6 py-2.5 rounded-full border border-white/5 bg-[#13151f] text-sm text-neutral-400 transition-all duration-200 hover:bg-white/5 hover:text-white peer-checked:bg-blue-600 peer-checked:border-blue-500 peer-checked:text-white peer-checked:shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                                Echo
                            </div>
                        </label>
                        <label class="cursor-pointer group">
                            <input type="checkbox" name="synth-effects" value="stereo chorus for width" class="sr-only peer">
                             <div class="synth-effect-pill px-6 py-2.5 rounded-full border border-white/5 bg-[#13151f] text-sm text-neutral-400 transition-all duration-200 hover:bg-white/5 hover:text-white peer-checked:bg-blue-600 peer-checked:border-blue-500 peer-checked:text-white peer-checked:shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                                Width
                            </div>
                        </label>
                        <label class="cursor-pointer group">
                            <input type="checkbox" name="synth-effects" value="gentle saturation and distortion" class="sr-only peer">
                             <div class="synth-effect-pill px-6 py-2.5 rounded-full border border-white/5 bg-[#13151f] text-sm text-neutral-400 transition-all duration-200 hover:bg-white/5 hover:text-white peer-checked:bg-blue-600 peer-checked:border-blue-500 peer-checked:text-white peer-checked:shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                                Distortion
                            </div>
                        </label>
                     </div>
                </div>

                <p id="synth-designer-error" class="text-xs text-red-400 ml-1"></p>
            </form>

            <div class="mt-12 flex justify-end items-center gap-6">
                 <button type="button" class="close-modal-button text-neutral-400 hover:text-neutral-200 font-medium text-sm transition-colors">
                    Abbrechen
                </button>
                <button id="add-synth-button" type="button" class="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold py-3 px-8 rounded-lg shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2">
                    <span id="add-synth-button-text">Add Sound to Prompt</span>
                    <svg aria-hidden="true" focusable="false" id="add-synth-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </button>
            </div>
        </div>
    </div>

    <div id="visual-engine-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-lg">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">🖼️ Visueller Funke</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none" aria-label="Schließen">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Schritt 1: Beschreibe eine Szene, um ein Bild zu generieren.</p>
            <textarea id="image-prompt-input" rows="3" class="w-full bg-neutral-900/70 border border-neutral-700 rounded-xl p-3 text-neutral-300 focus:ring-2 focus:ring-blue-500 placeholder-neutral-500 text-base" placeholder="z.B. Eine Cyberpunk-Stadt im Neon-Regen, eine ruhige Waldlichtung im Morgennebel..."></textarea>
            <button id="generate-image-button" class="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press flex items-center justify-center">
                <span id="generate-image-text">Bild generieren</span>
                <svg aria-hidden="true" focusable="false" id="generate-image-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </button>
            <div id="visual-engine-output" class="mt-4 p-2 bg-neutral-900/50 rounded-xl border border-neutral-700 min-h-[100px] flex items-center justify-center">
                <p class="text-neutral-500 text-sm">Bild wird hier angezeigt...</p>
            </div>
            <button id="analyze-image-button" class="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press flex items-center justify-center hidden">
                <span id="analyze-image-text">Schritt 2: Bild für Prompt analysieren</span>
                <svg aria-hidden="true" focusable="false" id="analyze-image-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </button>
        </div>
    </div>

    <div id="get-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-3xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">⏳ Genre-Evolution Timeline</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none" aria-label="Schließen">&times;</button>
            </div>
            <p class="text-neutral-400 mb-6 text-sm">Wähle ein Jahrzehnt, um deinen Prompt mit der charakteristischen Ästhetik dieser Ära zu veredeln.</p>
            
            <!-- Genre Selection Dropdown -->
            <div class="mb-6">
                <label for="get-genre-select" class="block text-xs text-neutral-400 mb-2 uppercase tracking-wider">Basis-Genre (Auto-Detect)</label>
                <div class="relative">
                    <select id="get-genre-select" class="w-full bg-neutral-900/50 border border-neutral-700 rounded-xl px-4 py-3 text-white appearance-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
                        <option value="General">Allgemein (General)</option>
                        <option value="Electronic">Electronic / Synth</option>
                        <option value="Rock">Rock / Indie</option>
                        <option value="Hip Hop">Hip Hop / Rap</option>
                        <option value="Jazz">Jazz / Fusion</option>
                        <option value="Pop">Pop / Mainstream</option>
                        <option value="R&B/Soul">R&B / Soul</option>
                        <option value="Classical/Orchestral">Classical / Orchestral</option>
                        <option value="Metal">Metal / Heavy</option>
                        <option value="Country/Folk">Country / Folk</option>
                        <option value="Reggae/Dub">Reggae / Dub</option>
                    </select>
                    <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-neutral-400">
                        <svg aria-hidden="true" focusable="false" class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" fill-rule="evenodd"></path></svg>
                    </div>
                </div>
            </div>

            <div class="mb-8 px-4">
                <div class="relative">
                    <input id="get-slider" type="range" min="1950" max="2020" value="2020" step="10" class="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer">
                    <div class="flex justify-between text-xs text-neutral-500 mt-2 font-mono">
                        <span>1950s</span>
                        <span>1960s</span>
                        <span>1970s</span>
                        <span>1980s</span>
                        <span>1990s</span>
                        <span>2000s</span>
                        <span>2010s</span>
                        <span>2020s</span>
                    </div>
                </div>
            </div>

            <div class="bg-neutral-900/40 border border-neutral-700/50 rounded-xl p-4 mb-6">
                 <div class="flex justify-between items-end mb-2">
                    <h3 class="text-blue-400 font-bold text-lg" id="get-decade-display">2020s</h3>
                    <span class="text-xs text-neutral-500 uppercase tracking-widest">Ära-Profil</span>
                </div>
                <p id="get-decade-description" class="text-neutral-300 text-sm leading-relaxed">Modernste digitale Produktion, Sidechain-Compression, knackige Transienten und hybride Genres.</p>
            </div>

            <div class="relative">
                <button id="apply-get-button" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl btn-transition btn-press flex justify-center items-center shadow-lg shadow-blue-900/20 overflow-hidden relative z-10">
                    <span id="apply-get-text">Ära anwenden</span>
                </button>
                
                <!-- Expanded Loading State Overlay -->
                <div id="get-loading-overlay" class="absolute inset-0 bg-neutral-900 border border-neutral-700 rounded-xl flex items-center justify-center gap-3 hidden z-20">
                     <span class="relative flex h-3 w-3">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                    <span id="get-loading-text" class="text-sm font-medium text-blue-300 animate-pulse">Analysiere Vibe...</span>
                </div>
            </div>
        </div>
    </div>

    <!-- STYLE SYNC MODAL REMOVED (Replaced by Full-Screen Studio V2 in index.html) -->

    `;
}
