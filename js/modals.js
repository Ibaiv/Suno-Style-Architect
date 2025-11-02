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
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Gib ein Stichwort ein und erhalte 3 kreative Song-Ideen als Starthilfe.</p>
            <div class="flex gap-2 mb-4">
                <input type="text" id="keyword-input" class="flex-grow bg-neutral-900/70 border border-neutral-600 rounded-lg p-2 text-neutral-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="z.B. Ozean, Mitternacht, Nostalgie...">
                <button id="generate-ideas-button" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center w-36 btn-transition btn-press">
                    <span id="idea-button-text">Generieren</span>
                    <svg id="idea-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
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
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Bestimme, wie stark der Produzent den Prompt mit technischem Wissen (Mix, Sound-Design) beeinflussen soll.</p>
            <div class="mb-4">
                <input id="producer-slider" type="range" min="0" max="100" value="50" step="10" class="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer">
                <div class="flex justify-between text-xs text-neutral-500 mt-1">
                    <span>Wenig</span>
                    <span>Stark</span>
                </div>
            </div>
            <button id="apply-producer-button" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press">
                 <span id="apply-producer-text">Anwenden</span>
                 <svg id="apply-producer-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </button>
        </div>
    </div>

    <div id="musician-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-md">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">Veredelung: Musiker</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Bestimme, wie stark der Musiker den Prompt mit musikalischem Wissen (Emotion, Instrumentierung) beeinflussen soll.</p>
            <div class="mb-4">
                 <input id="musician-slider" type="range" min="0" max="100" value="50" step="10" class="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer">
                <div class="flex justify-between text-xs text-neutral-500 mt-1">
                    <span>Wenig</span>
                    <span>Stark</span>
                </div>
            </div>
            <button id="apply-musician-button" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press">
                <span id="apply-musician-text">Anwenden</span>
                <svg id="apply-musician-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </button>
        </div>
    </div>

    <div id="composer-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-md">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">Veredelung: Filmkomponist</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Bestimme, wie stark der Komponist den Prompt mit cineastischem Wissen (Story, Spannung) beeinflussen soll.</p>
            <div class="mb-4">
                 <input id="composer-slider" type="range" min="0" max="100" value="50" step="10" class="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer">
                <div class="flex justify-between text-xs text-neutral-500 mt-1">
                    <span>Wenig</span>
                    <span>Stark</span>
                </div>
            </div>
            <button id="apply-composer-button" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press">
                <span id="apply-composer-text">Anwenden</span>
                <svg id="apply-composer-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </button>
        </div>
    </div>

    <div id="dj-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-md">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">Veredelung: DJ / Remixer</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Bestimme, wie stark der DJ den Prompt mit club-tauglichem Wissen (Groove, Energie) beeinflussen soll.</p>
            <div class="mb-4">
                 <input id="dj-slider" type="range" min="0" max="100" value="50" step="10" class="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer">
                <div class="flex justify-between text-xs text-neutral-500 mt-1">
                    <span>Wenig</span>
                    <span>Stark</span>
                </div>
            </div>
            <button id="apply-dj-button" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press">
                <span id="apply-dj-text">Anwenden</span>
                <svg id="apply-dj-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </button>
        </div>
    </div>

    <!-- MISSING EXPERT MODALS -->
    <div id="avantgarde-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-md">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">Veredelung: Avantgarde-Klangkünstler</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Bestimme, wie stark experimentelle und unkonventionelle Elemente den Prompt beeinflussen sollen.</p>
            <div class="mb-4">
                <input id="avantgarde-slider" type="range" min="0" max="100" value="50" step="10" class="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer">
                <div class="flex justify-between text-xs text-neutral-500 mt-1">
                    <span>Wenig</span>
                    <span>Stark</span>
                </div>
            </div>
            <button id="apply-avantgarde-button" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press">
                <span id="apply-avantgarde-text">Anwenden</span>
                <svg id="apply-avantgarde-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </button>
        </div>
    </div>

    <div id="minimalist-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-md">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">Veredelung: Minimalist-Komponist</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Bestimme, wie stark der minimalistische Ansatz den Prompt vereinfachen und auf die Essenz reduzieren soll.</p>
            <div class="mb-4">
                <input id="minimalist-slider" type="range" min="0" max="100" value="50" step="10" class="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer">
                <div class="flex justify-between text-xs text-neutral-500 mt-1">
                    <span>Wenig</span>
                    <span>Stark</span>
                </div>
            </div>
            <button id="apply-minimalist-button" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press">
                <span id="apply-minimalist-text">Anwenden</span>
                <svg id="apply-minimalist-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </button>
        </div>
    </div>

    <div id="vocal-harmony-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-md">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">Veredelung: Vocal-Harmony Arrangeur</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Bestimme, wie stark komplexe Gesangs-Arrangements und Harmonien den Prompt beeinflussen sollen.</p>
            <div class="mb-4">
                <input id="vocal-harmony-slider" type="range" min="0" max="100" value="50" step="10" class="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer">
                <div class="flex justify-between text-xs text-neutral-500 mt-1">
                    <span>Wenig</span>
                    <span>Stark</span>
                </div>
            </div>
            <button id="apply-vocal-harmony-button" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press">
                <span id="apply-vocal-harmony-text">Anwenden</span>
                <svg id="apply-vocal-harmony-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </button>
        </div>
    </div>

    <div id="ethno-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-md">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">Veredelung: Ethno-Musiker</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Bestimme, wie stark authentische Weltmusik-Elemente den Prompt beeinflussen sollen.</p>
            <div class="mb-4">
                <input id="ethno-slider" type="range" min="0" max="100" value="50" step="10" class="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer">
                <div class="flex justify-between text-xs text-neutral-500 mt-1">
                    <span>Wenig</span>
                    <span>Stark</span>
                </div>
            </div>
            <button id="apply-ethno-button" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press">
                <span id="apply-ethno-text">Anwenden</span>
                <svg id="apply-ethno-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </button>
        </div>
    </div>

    <div id="sound-engineer-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-lg">
           <div class="flex justify-between items-center mb-4">
               <h2 class="text-xl font-bold text-white">Experte: Sound-Ingenieur</h2>
               <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none">&times;</button>
           </div>
           <p class="text-neutral-400 mb-4 text-sm">Füge bis zu drei spezifische Anweisungen hinzu, um dein Meisterstück zu verfeinern (z.B. "Phaser-Effekt auf die Drums", "betonte Snare in den Höhen", "Sternschnuppen-Sounds am Ende").</p>
           <div class="space-y-3">
                <textarea class="sound-engineer-input w-full bg-neutral-900/70 border border-neutral-700 rounded-xl p-3 text-neutral-300 focus:ring-2 focus:ring-blue-500 placeholder-neutral-500 text-base" rows="2" placeholder="Anweisung 1..."></textarea>
                <textarea class="sound-engineer-input w-full bg-neutral-900/70 border border-neutral-700 rounded-xl p-3 text-neutral-300 focus:ring-2 focus:ring-blue-500 placeholder-neutral-500 text-base" rows="2" placeholder="Anweisung 2 (optional)..."></textarea>
                <textarea class="sound-engineer-input w-full bg-neutral-900/70 border border-neutral-700 rounded-xl p-3 text-neutral-300 focus:ring-2 focus:ring-blue-500 placeholder-neutral-500 text-base" rows="2" placeholder="Anweisung 3 (optional)..."></textarea>
           </div>
           <button id="apply-sound-engineer-button" class="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press">
               <span id="apply-sound-engineer-text">Anwenden</span>
               <svg id="apply-sound-engineer-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
           </button>
       </div>
    </div>
    
    <!-- KLUG MODALS -->
    <div id="genre-mixer-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-2xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">🎶 Genre-Mixer</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Kombiniere bis zu 3 Genres, um einen einzigartigen Sound zu kreieren.</p>
            <div id="genre-selectors" class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4"></div>
            <button id="mix-genres-button" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press">
                <span id="mix-genres-button-text">Mischen & Anwenden</span>
                <svg id="mix-genres-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </button>
            <div id="genre-mixer-output" class="mt-4 text-sm"></div>
        </div>
    </div>

    <div id="hook-generator-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
         <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-2xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">🎣 Titel- & Hook-Generator</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Die KI schlägt Titel und Refrain-Ideen vor. Klicke, um sie dem Meisterstück hinzuzufügen.</p>
            <div id="hook-generator-output" class="space-y-4 text-sm min-h-[150px]"></div>
        </div>
    </div>

    <div id="song-structure-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-2xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">📑 Song-Struktur-Assistent</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none">&times;</button>
            </div>
             <p class="text-neutral-400 mb-4 text-sm">Hier ist ein Vorschlag für die Struktur deines Songs.</p>
            <div id="song-structure-output" class="space-y-3 text-sm min-h-[100px]"></div>
        </div>
    </div>

    <div id="mood-analyzer-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
         <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-2xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">🔬 Stimmungs-Analysator</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Wähle passende Instrumente aus und klicke auf "Übernehmen".</p>
            <div id="mood-analyzer-suggestions" class="flex flex-wrap gap-2 text-sm min-h-[50px]"></div>
            <div class="mt-6 border-t border-neutral-700/60 pt-4 flex justify-end">
                <button id="apply-mood-button" class="w-36 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg btn-transition btn-press flex justify-center items-center">
                    <span id="apply-mood-button-text">Übernehmen</span>
                    <svg id="apply-mood-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </button>
            </div>
        </div>
    </div>

    <div id="vibe-enhancer-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-4xl">
             <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">🎨 Vibe-Veredler</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Die KI hat deinen Prompt mit mehr atmosphärischen Details angereichert. Vergleiche und übernehme den Vorschlag.</p>
            <div id="vibe-enhancer-output" class="grid md:grid-cols-2 gap-4 max-h-[60vh] overflow-auto"></div>
        </div>
    </div>

    <div id="artist-suggester-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
         <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-2xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">🧭 Künstler-Kompass</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Hier sind Künstler mit einem ähnlichen Stil. Klicke einen Namen an, um ihn deinem Prompt hinzuzufügen.</p>
            <div id="artist-suggester-output" class="space-y-3 text-sm min-h-[150px]"></div>
        </div>
    </div>

    <div id="tempo-finder-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-md">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">⏱️ Tempo & BPM-Finder</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Hier ist ein Tempo-Vorschlag für deinen Song.</p>
            <div id="tempo-finder-output" class="space-y-3 text-sm min-h-[100px]"></div>
        </div>
    </div>

    <div id="production-finish-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-2xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">🎚️ Produktions-Finish</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Wähle passende Produktions-Techniken aus, um deinem Song den letzten Schliff zu geben.</p>
            <div id="production-finish-suggestions" class="flex flex-wrap gap-2 text-sm min-h-[50px]"></div>
            <div class="mt-6 border-t border-neutral-700/60 pt-4 flex justify-end">
                <button id="apply-production-button" class="w-36 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg btn-transition btn-press flex justify-center items-center">
                    <span id="apply-production-text">Übernehmen</span>
                    <svg id="apply-production-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </button>
            </div>
        </div>
    </div>

    <div id="vocal-stylist-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-2xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">🎤 Gesangs-Stilist</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Wähle passende Gesangs-Stile aus und übernehme sie in dein Meisterstück.</p>
            <div id="vocal-stylist-suggestions" class="flex flex-wrap gap-2 text-sm min-h-[50px]"></div>
            <div class="mt-6 border-t border-neutral-700/60 pt-4 flex justify-end">
                <button id="apply-vocal-style-button" class="w-36 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg btn-transition btn-press flex justify-center items-center">
                    <span id="apply-vocal-style-text">Übernehmen</span>
                    <svg id="apply-vocal-style-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </button>
            </div>
        </div>
    </div>

    <!-- CUSTOM INSTRUCTION MODAL -->
    <div id="custom-instruction-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-lg">
           <div class="flex justify-between items-center mb-4">
               <h2 class="text-xl font-bold text-white">Eigene Anweisung</h2>
               <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none">&times;</button>
           </div>
           <p class="text-neutral-400 mb-4 text-sm">Gib eine freie Anweisung, wie die KI den aktuellen Prompt verändern soll.</p>
           <textarea id="custom-instruction-input" rows="4" class="w-full bg-neutral-900/70 border border-neutral-700 rounded-xl p-3 text-neutral-300 focus:ring-2 focus:ring-blue-500 placeholder-neutral-500 text-base" placeholder="z.B. Mache es düsterer und füge einen Kinderchor hinzu..."></textarea>
           <button id="apply-custom-instruction-button" class="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press">
               <span id="apply-custom-instruction-text">Anwenden</span>
               <svg id="apply-custom-instruction-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
           </button>
       </div>
   </div>

    <!-- NEW KLUG MODALS -->
    <div id="groove-meister-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-2xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">KLUG: Groove-Meister</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Wähle passende rhythmische Konzepte aus, um den Groove deines Songs zu definieren.</p>
            <div id="groove-meister-suggestions" class="flex flex-wrap gap-2 text-sm min-h-[50px]"></div>
            <div class="mt-6 border-t border-neutral-700/60 pt-4 flex justify-end">
                <button id="apply-groove-meister-button" class="w-36 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg btn-transition btn-press flex justify-center items-center">
                    <span id="apply-groove-meister-text">Übernehmen</span>
                    <svg id="apply-groove-meister-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </button>
            </div>
        </div>
    </div>

    <div id="performance-coach-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-2xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">KLUG: Performance-Coach</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Wähle spezifische Spielweisen aus, um der Performance mehr Charakter zu verleihen.</p>
            <div id="performance-coach-suggestions" class="flex flex-wrap gap-2 text-sm min-h-[50px]"></div>
            <div class="mt-6 border-t border-neutral-700/60 pt-4 flex justify-end">
                <button id="apply-performance-coach-button" class="w-36 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg btn-transition btn-press flex justify-center items-center">
                    <span id="apply-performance-coach-text">Übernehmen</span>
                    <svg id="apply-performance-coach-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </button>
            </div>
        </div>
    </div>

    <div id="effect-chain-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-2xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">KLUG: Effektketten-Designer</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Wähle passende Audio-Effekte aus, um den Sound zu formen.</p>
            <div id="effect-chain-suggestions" class="flex flex-wrap gap-2 text-sm min-h-[50px]"></div>
            <div class="mt-6 border-t border-neutral-700/60 pt-4 flex justify-end">
                <button id="apply-effect-chain-button" class="w-36 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg btn-transition btn-press flex justify-center items-center">
                    <span id="apply-effect-chain-text">Übernehmen</span>
                    <svg id="apply-effect-chain-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </button>
            </div>
        </div>
    </div>

    <!-- FUTURE LAB MODALS -->
    <div id="adaptive-flow-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-4xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">🌀 Adaptiver Flow</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none">&times;</button>
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
                    <svg id="adaptive-flow-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </button>
            </div>
            <div id="adaptive-flow-output" class="mt-5 text-sm space-y-4"></div>
        </div>
    </div>

    <div id="ai-collab-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-4xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">🤝 KI-Kollaboration</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Wähle Personas, die gemeinsam an deinem Track arbeiten sollen. Die KI beschreibt, wie sie sich gegenseitig inspirieren.</p>
            <div id="ai-collab-personas" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"></div>
            <div class="mt-6 border-t border-neutral-700/60 pt-4 flex justify-end">
                <button id="generate-ai-collab-button" class="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg btn-transition btn-press flex items-center justify-center gap-2">
                    <span id="generate-ai-collab-text">Interplay erschaffen</span>
                    <svg id="ai-collab-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </button>
            </div>
            <div id="ai-collab-output" class="mt-5 text-sm space-y-4"></div>
        </div>
    </div>

    <div id="story-arc-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-4xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">📚 Story-Arc Designer</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Transformiere deinen Prompt in eine dreiteilige musikalische Reise mit klaren Höhepunkten.</p>
            <div class="border border-neutral-700 rounded-2xl p-4 bg-neutral-900/40">
                <button id="story-arc-generate-button" class="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg btn-transition btn-press flex items-center justify-center gap-2">
                    <span id="story-arc-generate-text">Arc neu berechnen</span>
                    <svg id="story-arc-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </button>
                <div id="story-arc-output" class="mt-4 text-sm space-y-4"></div>
            </div>
        </div>
    </div>

    <div id="immersive-space-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-4xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">🌌 Immersive Space</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Definiere akustische Räume und Bewegungen, damit dein Song in 3D erlebbar wird.</p>
            <div id="immersive-space-presets" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"></div>
            <div class="mt-6 border-t border-neutral-700/60 pt-4 flex justify-end">
                <button id="run-immersive-space-button" class="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg btn-transition btn-press flex items-center justify-center gap-2">
                    <span id="run-immersive-space-text">Raum modellieren</span>
                    <svg id="immersive-space-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </button>
            </div>
            <div id="immersive-space-output" class="mt-5 text-sm space-y-4"></div>
        </div>
    </div>

    <div id="human-touch-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-4xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">🎛️ Human Touch</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Füge analoge Nuancen, organische Bewegungen und kleine Unvollkommenheiten hinzu.</p>
            <div id="human-touch-options" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"></div>
            <div class="mt-6 border-t border-neutral-700/60 pt-4 flex justify-end">
                <button id="apply-human-touch-button" class="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg btn-transition btn-press flex items-center justify-center gap-2">
                    <span id="apply-human-touch-text">Humanisieren</span>
                    <svg id="human-touch-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </button>
            </div>
            <div id="human-touch-output" class="mt-5 text-sm space-y-4"></div>
        </div>
    </div>

    <div id="release-forecast-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-4xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">🚀 Release Forecast</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none">&times;</button>
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
                    <svg id="release-forecast-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </button>
            </div>
            <div id="release-forecast-output" class="mt-5 text-sm space-y-4"></div>
        </div>
    </div>
    
    <div id="visual-engine-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-lg">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">🖼️ Visueller Funke</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Schritt 1: Beschreibe eine Szene, um ein Bild zu generieren.</p>
            <textarea id="image-prompt-input" rows="3" class="w-full bg-neutral-900/70 border border-neutral-700 rounded-xl p-3 text-neutral-300 focus:ring-2 focus:ring-blue-500 placeholder-neutral-500 text-base" placeholder="z.B. Eine Cyberpunk-Stadt im Neon-Regen, eine ruhige Waldlichtung im Morgennebel..."></textarea>
            <button id="generate-image-button" class="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press flex items-center justify-center">
                <span id="generate-image-text">Bild generieren</span>
                <svg id="generate-image-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </button>
            <div id="visual-engine-output" class="mt-4 p-2 bg-neutral-900/50 rounded-xl border border-neutral-700 min-h-[100px] flex items-center justify-center">
                <p class="text-neutral-500 text-sm">Bild wird hier angezeigt...</p>
            </div>
            <button id="analyze-image-button" class="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press flex items-center justify-center hidden">
                <span id="analyze-image-text">Schritt 2: Bild für Prompt analysieren</span>
                <svg id="analyze-image-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </button>
        </div>
    </div>

    <div id="rhythm-generator-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden modal-enter-from">
        <div class="modal-content bg-neutral-800/50 border border-neutral-700 rounded-3xl shadow-2xl p-6 w-full max-w-2xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-white">🥁 Rhythmus-Generator & Poly-Mixer</h2>
                <button class="close-modal-button text-neutral-500 hover:text-white text-3xl leading-none">&times;</button>
            </div>
            <p class="text-neutral-400 mb-4 text-sm">Wähle die rhythmischen Bausteine. Die KI beschreibt den Groove.</p>
            
            <div class="space-y-4">
                
                <div>
                    <label class="block text-sm font-medium text-neutral-300 mb-2">1. Taktart (Basis-Feel)</label>
                    <div class="synth-selector-group">
                        <input type="radio" name="rhythm_signature" id="sig_4_4" value="4/4 time (straight)" class="synth-radio" checked>
                        <label for="sig_4_4" class="synth-label">4/4 (Gerade)</label>
                        <input type="radio" name="rhythm_signature" id="sig_3_4" value="3/4 time (waltz)" class="synth-radio">
                        <label for="sig_3_4" class="synth-label">3/4 (Walzer)</label>
                        <input type="radio" name="rhythm_signature" id="sig_6_8" value="6/8 time (folk/ballad)" class="synth-radio">
                        <label for="sig_6_8" class="synth-label">6/8 (Ballade)</label>
                        <input type="radio" name="rhythm_signature" id="sig_shuffle" value="shuffle/swing feel" class="synth-radio">
                        <label for="sig_shuffle" class="synth-label">Shuffle / Swing</label>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-neutral-300 mb-2">2. Kick-Drum-Muster</label>
                    <div class="synth-selector-group">
                        <input type="radio" name="rhythm_kick" id="kick_standard" value="standard kick on 1 and 3" class="synth-radio" checked>
                        <label for="kick_standard" class="synth-label">Standard (auf 1 & 3)</label>
                        <input type="radio" name="rhythm_kick" id="kick_4_floor" value="four-on-the-floor kick" class="synth-radio">
                        <label for="kick_4_floor" class="synth-label">Four-on-the-Floor</label>
                        <input type="radio" name="rhythm_kick" id="kick_syncopated" value="syncopated kick pattern" class="synth-radio">
                        <label for="kick_syncopated" class="synth-label">Synkopiert (z.B. Hip Hop)</label>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-neutral-300 mb-2">3. Snare-Drum-Muster</label>
                    <div class="synth-selector-group">
                        <input type="radio" name="rhythm_snare" id="snare_standard" value="snare on 2 and 4" class="synth-radio" checked>
                        <label for="snare_standard" class="synth-label">Standard (auf 2 & 4)</label>
                        <input type="radio" name="rhythm_snare" id="snare_offbeat" value="off-beat snare (e.g., reggae)" class="synth-radio">
                        <label for="snare_offbeat" class="synth-label">Off-Beat</label>
                        <input type="radio" name="rhythm_snare" id="snare_march" value="marching snare roll" class="synth-radio">
                        <label for="snare_march" class="synth-label">Marsch / Wirbel</label>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-neutral-300 mb-2">4. Hi-Hat-Muster</label>
                    <div class="synth-selector-group">
                        <input type="radio" name="rhythm_hat" id="hat_8th" value="steady 8th-note hi-hats" class="synth-radio" checked>
                        <label for="hat_8th" class="synth-label">Achtelnoten</label>
                        <input type="radio" name="rhythm_hat" id="hat_16th" value="driving 16th-note hi-hats" class="synth-radio">
                        <label for="hat_16th" class="synth-label">16tel-Noten</label>
                        <input type="radio" name="rhythm_hat" id="hat_open_close" value="dynamic open/closed hi-hats" class="synth-radio">
                        <label for="hat_open_close" class="synth-label">Offen / Geschlossen</label>
                    </div>
                </div>
            </div>

            <button id="apply-rhythm-generator-button" class="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg btn-transition btn-press flex items-center justify-center">
                <span id="apply-rhythm-generator-text">Groove zum Prompt hinzufügen</span>
                <svg id="apply-rhythm-generator-loader" class="animate-spin h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </button>
        </div>
    </div>

    `;
}