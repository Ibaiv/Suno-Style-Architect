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
