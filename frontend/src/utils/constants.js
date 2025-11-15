// Frontend Constants
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// API Endpoints
export const ENDPOINTS = {
  // Analysis & Generation
  ANALYZE_MEDIA: '/analyze-media',
  GENERATE_CAPTION: '/generate-caption',
  ANALYZE_AND_GENERATE: '/analyze-and-generate',

  // AI Advanced
  AI_ANALYZE_ADVANCED: '/ai/analyze-advanced',
  AI_GENERATE_STYLED: '/ai/generate-styled-caption',
  AI_ANALYZE_AND_GENERATE_PRO: '/ai/analyze-and-generate-pro',
  AI_AVAILABLE_OPTIONS: '/ai/available-options',
  AI_COMPARE_MODELS: '/ai/compare-models',

  // Resources
  MUSICIANS: '/musicians',
  VENUES: '/venues',
  ANALYTICS: '/analytics',

  // Auth
  REGISTER: '/register',
  TOKEN: '/token',
  ME: '/me',
  MY_CAPTIONS: '/my-captions',
};

// Cache Duration
export const CACHE_DURATION = {
  SHORT: 1 * 60 * 1000,      // 1 minute
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 30 * 60 * 1000,      // 30 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime'],
  ACCEPTED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov'],
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

// UI
export const UI = {
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
};

// Status
export const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

// AI Models
export const AI_MODELS = {
  GPT4_VISION: 'gpt-4-vision-preview',
  GPT4: 'gpt-4',
  CLAUDE_SONNET: 'claude-3-5-sonnet-20241022',
  CLAUDE_HAIKU: 'claude-3-5-haiku-20241022',
};

// Caption Styles
export const CAPTION_STYLES = {
  PROFESSIONAL: 'professional',
  CASUAL: 'casual',
  POETIC: 'poetic',
  ENERGETIC: 'energetic',
  MINIMAL: 'minimal',
  STORYTELLING: 'storytelling',
};

// Languages
export const LANGUAGES = {
  FRENCH: 'fr',
  ENGLISH: 'en',
  SPANISH: 'es',
  GERMAN: 'de',
  ITALIAN: 'it',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion. Vérifiez votre connexion internet.',
  SERVER_ERROR: 'Erreur serveur. Veuillez réessayer plus tard.',
  FILE_TOO_LARGE: `Le fichier est trop volumineux (max ${FILE_UPLOAD.MAX_SIZE / 1024 / 1024}MB).`,
  INVALID_FILE_TYPE: 'Type de fichier non supporté.',
  UNAUTHORIZED: 'Vous devez être connecté pour effectuer cette action.',
  VALIDATION_ERROR: 'Données invalides. Vérifiez vos entrées.',
  TIMEOUT: 'La requête a pris trop de temps. Veuillez réessayer.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  CAPTION_GENERATED: 'Caption générée avec succès !',
  CAPTION_COPIED: 'Caption copiée dans le presse-papier !',
  SAVED: 'Sauvegardé avec succès !',
  DELETED: 'Supprimé avec succès !',
  UPDATED: 'Mis à jour avec succès !',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
  RECENT_SEARCHES: 'recent_searches',
  CACHE_PREFIX: 'cache_',
};

// Routes
export const ROUTES = {
  HOME: '/',
  GENERATOR: '/generator',
  BATCH: '/batch',
  TEMPLATES: '/templates',
  DASHBOARD: '/dashboard',
  MUSICIANS: '/musicians',
  VENUES: '/venues',
  LOGIN: '/login',
  REGISTER: '/register',
  SETTINGS: '/settings',
};
