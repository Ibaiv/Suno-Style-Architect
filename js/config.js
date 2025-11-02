// === FAL.AI STATE ===
let FAL_API_KEY = '';
let FAL_MODEL = 'fal-ai/fast-sdxl';
const FAL_BASE_URL = 'https://fal.run/'; // fal.ai proxy URL

// Model display names for fal.ai
const FAL_MODEL_NAMES = {
    'fal-ai/fast-sdxl': 'Fast SDXL',
    'fal-ai/lightning-sdxl': 'Lightning SDXL',
    'fal-ai/sdxl-lightning-4step': 'SDXL Lightning (4-step)',
    'fal-ai/stable-diffusion-v1-5': 'Stable Diffusion 1.5',
    'fal-ai/realistic-vision-v5': 'Realistic Vision v5',
    'imagen4/preview': 'Imagen 4 (preview)',
    'flux-pro/kontext': 'FLUX pro Kontext',
    'flux-krea-lora/stream': 'FLUX Krea LoRA (stream)'
};

// FAL endpoint mapping (selection value -> API path)
// This allows us to support models hosted under different orgs (e.g., google/*, fal-ai/*)
const FAL_MODEL_ENDPOINTS = {
    'fal-ai/fast-sdxl': 'fal-ai/fast-sdxl',
    'fal-ai/lightning-sdxl': 'fal-ai/lightning-sdxl',
    'fal-ai/sdxl-lightning-4step': 'fal-ai/sdxl-lightning-4step',
    'fal-ai/stable-diffusion-v1-5': 'fal-ai/stable-diffusion-v1-5',
    'fal-ai/realistic-vision-v5': 'fal-ai/realistic-vision-v5',
    // New gallery models
    'imagen4/preview': 'google/imagen-4/preview',
    'flux-pro/kontext': 'fal-ai/flux-pro/kontext',
    'flux-krea-lora/stream': 'fal-ai/flux-krea-lora/stream'
};

// === APP STATE ===
let API_KEY = '';
let SELECTED_MODEL = 'openai/gpt-5-mini';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Model display names
const MODEL_NAMES = {
    'openai/gpt-5-mini': 'GPT-5 mini',
    'anthropic/claude-haiku-4.5': 'Haiku 4.5',
    'deepseek/deepseek-v3.1-terminus': 'Deepseek 3.1 terminus',
    'deepseek/deepseek-v3.2-exp': 'Deepseek 3.2 Exp',
    'tngtech/deepseek-r1t2-chimera': 'Deepseek-r1t2-chimera',
    'z-ai/glm-4.6': 'GLM-4.6',
    'x-ai/grok-4-fast': 'Grok-4-fast',
    'inclusionai/ling-1t': 'Ling-1T'
};

// Music genres for genre mixer
const musicGenres = ["Acoustic", "Afrobeat", "Alternative", "Ambient", "Blues", "Bluegrass", "Breakcore", "Celtic", "City Pop", "Classical", "Country", "Dance", "Dancehall", "Disco", "Drum and Bass", "Dubstep", "Electronic", "Emo", "Folk", "Funk", "Glitchcore", "Gospel", "Goth", "Grunge", "Hard Rock", "Heavy Metal", "Hip Hop", "House", "Hyperpop", "Indie", "Industrial", "J-Pop", "J-Rock", "Jazz", "K-Pop", "Latin", "Lofi", "New Wave", "Orchestral", "Phonk", "Pop", "Post-Punk", "Progressive Rock", "Psychedelic Rock", "Punk", "R&B", "Reggae", "Reggaeton", "Rock", "Salsa", "Samba", "Shoegaze", "Ska", "Soul", "Synthwave", "Techno", "Trance", "Trap"];

// App state variables
let isPromptGenerated = false;
let selectedKlugItems = []; // Generic state for selected tags in modals
