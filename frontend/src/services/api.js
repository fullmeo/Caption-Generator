const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Analyse d'un média
export const analyzeMedia = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/analyze-media`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('Failed to analyze media');
  }

  return response.json();
};

// Génération de caption
export const generateCaption = async (data) => {
  const response = await fetch(`${API_BASE_URL}/generate-caption`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Failed to generate caption');
  }

  return response.json();
};

// Analyse + génération combinée
export const analyzeAndGenerate = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/analyze-and-generate`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('Failed to analyze and generate');
  }

  return response.json();
};

// Récupérer la liste des musiciens
export const getMusicians = async () => {
  const response = await fetch(`${API_BASE_URL}/musicians`);

  if (!response.ok) {
    throw new Error('Failed to fetch musicians');
  }

  return response.json();
};

// Récupérer la liste des venues
export const getVenues = async () => {
  const response = await fetch(`${API_BASE_URL}/venues`);

  if (!response.ok) {
    throw new Error('Failed to fetch venues');
  }

  return response.json();
};

// Récupérer les analytics
export const getAnalytics = async () => {
  const response = await fetch(`${API_BASE_URL}/analytics`);

  if (!response.ok) {
    throw new Error('Failed to fetch analytics');
  }

  return response.json();
};

// Vérifier le statut de l'API
export const getApiStatus = async () => {
  const response = await fetch(`${API_BASE_URL}/`);

  if (!response.ok) {
    throw new Error('API is not available');
  }

  return response.json();
};

// Templates API
export const getTemplates = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE_URL}/templates?${queryParams}`);

  if (!response.ok) {
    throw new Error('Failed to fetch templates');
  }

  return response.json();
};

export const getTemplate = async (templateId) => {
  const response = await fetch(`${API_BASE_URL}/templates/${templateId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch template');
  }

  return response.json();
};

export const createTemplate = async (templateData) => {
  const response = await fetch(`${API_BASE_URL}/templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(templateData)
  });

  if (!response.ok) {
    throw new Error('Failed to create template');
  }

  return response.json();
};

export const renderTemplate = async (templateId, variables) => {
  const response = await fetch(`${API_BASE_URL}/templates/${templateId}/render`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(variables)
  });

  if (!response.ok) {
    throw new Error('Failed to render template');
  }

  return response.json();
};

export const getTemplateSuggestions = async (analysis) => {
  const response = await fetch(`${API_BASE_URL}/templates/suggest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(analysis)
  });

  if (!response.ok) {
    throw new Error('Failed to get template suggestions');
  }

  return response.json();
};

export const getTemplatePerformance = async (templateId) => {
  const response = await fetch(`${API_BASE_URL}/templates/${templateId}/performance`);

  if (!response.ok) {
    throw new Error('Failed to fetch template performance');
  }

  return response.json();
};
