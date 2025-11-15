import { useState, useEffect } from 'react';
import { Brain, Languages, Palette, Sparkles, Zap, GitCompare } from 'lucide-react';

function AdvancedAIOptions({ onOptionsChange }) {
  const [options, setOptions] = useState({
    analysisModel: 'gpt-4-vision-preview',
    captionModel: 'gpt-4',
    style: 'casual',
    language: 'fr'
  });

  const [availableOptions, setAvailableOptions] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    // Fetch available options from API
    fetch('http://localhost:8000/ai/available-options')
      .then(res => res.json())
      .then(data => setAvailableOptions(data))
      .catch(err => console.error('Error loading AI options:', err));
  }, []);

  useEffect(() => {
    // Notify parent when options change
    if (onOptionsChange) {
      onOptionsChange(options);
    }
  }, [options, onOptionsChange]);

  const handleChange = (key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  if (!availableOptions) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse flex items-center space-x-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <span>Loading AI options...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-800">Options IA Avancées</h3>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-purple-600 hover:text-purple-700 font-semibold flex items-center space-x-1"
        >
          <Zap className="w-4 h-4" />
          <span>{showAdvanced ? 'Masquer' : 'Mode Pro'}</span>
        </button>
      </div>

      {/* Quick Mode */}
      {!showAdvanced && (
        <div className="space-y-4">
          {/* Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Palette className="w-4 h-4 mr-2 text-purple-600" />
              Style de caption
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableOptions.styles.map(style => (
                <button
                  key={style.value}
                  onClick={() => handleChange('style', style.value)}
                  className={`px-4 py-3 rounded-lg text-sm font-semibold transition ${
                    options.style === style.value
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="font-bold">{style.name}</div>
                  <div className="text-xs opacity-80">{style.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Languages className="w-4 h-4 mr-2 text-purple-600" />
              Langue
            </label>
            <div className="flex flex-wrap gap-2">
              {availableOptions.languages.map(lang => (
                <button
                  key={lang.value}
                  onClick={() => handleChange('language', lang.value)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition flex items-center space-x-2 ${
                    options.language === lang.value
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Advanced Mode */}
      {showAdvanced && (
        <div className="space-y-6 border-t border-gray-200 pt-6">
          {/* Analysis Model */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Brain className="w-4 h-4 mr-2 text-purple-600" />
              Modèle d'Analyse
              <span className="ml-2 text-xs text-gray-500">(Pour analyser l'image)</span>
            </label>
            <div className="space-y-2">
              {availableOptions.models.analysis.map(model => (
                <button
                  key={model.value}
                  onClick={() => handleChange('analysisModel', model.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition ${
                    options.analysisModel === model.value
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-800">{model.name}</div>
                      <div className="text-sm text-gray-600">{model.description}</div>
                    </div>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded-full font-medium">
                      {model.provider}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Caption Model */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
              Modèle de Génération
              <span className="ml-2 text-xs text-gray-500">(Pour écrire la caption)</span>
            </label>
            <div className="space-y-2">
              {availableOptions.models.caption.map(model => (
                <button
                  key={model.value}
                  onClick={() => handleChange('captionModel', model.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition ${
                    options.captionModel === model.value
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-800">{model.name}</div>
                      <div className="text-sm text-gray-600">{model.description}</div>
                    </div>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded-full font-medium">
                      {model.provider}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Style & Language in Advanced Mode */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Style
              </label>
              <select
                value={options.style}
                onChange={(e) => handleChange('style', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                {availableOptions.styles.map(style => (
                  <option key={style.value} value={style.value}>
                    {style.name} - {style.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Langue
              </label>
              <select
                value={options.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                {availableOptions.languages.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <GitCompare className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Mode Pro Activé</p>
                <p>
                  Vous pouvez choisir des modèles différents pour l'analyse et la génération.
                  Par exemple : <strong>Claude</strong> pour l'analyse (raisonnement excellent) +
                  <strong>GPT-4</strong> pour la génération (créativité maximale).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Selection Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
        <div className="text-sm space-y-1">
          <div className="font-semibold text-purple-900 mb-2">Configuration actuelle :</div>
          <div className="grid grid-cols-2 gap-2">
            {showAdvanced && (
              <>
                <div className="text-gray-700">
                  <span className="font-medium">Analyse :</span>{' '}
                  {availableOptions.models.analysis.find(m => m.value === options.analysisModel)?.name}
                </div>
                <div className="text-gray-700">
                  <span className="font-medium">Caption :</span>{' '}
                  {availableOptions.models.caption.find(m => m.value === options.captionModel)?.name}
                </div>
              </>
            )}
            <div className="text-gray-700">
              <span className="font-medium">Style :</span>{' '}
              {availableOptions.styles.find(s => s.value === options.style)?.name}
            </div>
            <div className="text-gray-700">
              <span className="font-medium">Langue :</span>{' '}
              {availableOptions.languages.find(l => l.value === options.language)?.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdvancedAIOptions;
