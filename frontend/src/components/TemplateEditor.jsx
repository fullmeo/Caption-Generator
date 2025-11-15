import { useState, useEffect } from 'react';
import { X, Save, Eye, Code, Sparkles } from 'lucide-react';

function TemplateEditor({ isOpen, onClose, template, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'general',
    template_text: '',
    required_variables: [],
    optional_variables: [],
    default_hashtags: []
  });

  const [previewVariables, setPreviewVariables] = useState({});
  const [previewText, setPreviewText] = useState('');
  const [variableInput, setVariableInput] = useState('');
  const [hashtagInput, setHashtagInput] = useState('');

  const categories = [
    { id: 'studio', name: 'Studio', icon: '🎙️' },
    { id: 'concert', name: 'Concert', icon: '🎸' },
    { id: 'rehearsal', name: 'Répétition', icon: '🎹' },
    { id: 'collaboration', name: 'Collaboration', icon: '🤝' },
    { id: 'release', name: 'Sortie', icon: '🎉' },
    { id: 'general', name: 'Général', icon: '✨' }
  ];

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        category: template.category || 'general',
        template_text: template.template_text || '',
        required_variables: template.required_variables || [],
        optional_variables: template.optional_variables || [],
        default_hashtags: template.default_hashtags || []
      });

      // Initialiser les variables de prévisualisation
      const initialVars = {};
      (template.required_variables || []).forEach(v => {
        initialVars[v] = `[${v}]`;
      });
      setPreviewVariables(initialVars);
    }
  }, [template]);

  useEffect(() => {
    // Mettre à jour la prévisualisation
    updatePreview();
  }, [formData.template_text, previewVariables]);

  const updatePreview = () => {
    let text = formData.template_text;
    Object.keys(previewVariables).forEach(key => {
      const placeholder = `{${key}}`;
      text = text.replace(new RegExp(placeholder, 'g'), previewVariables[key] || `{${key}}`);
    });
    setPreviewText(text);
  };

  const extractVariables = (text) => {
    const regex = /\{([^}]+)\}/g;
    const matches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (!matches.includes(match[1])) {
        matches.push(match[1]);
      }
    }
    return matches;
  };

  const handleTemplateTextChange = (e) => {
    const text = e.target.value;
    setFormData({ ...formData, template_text: text });

    // Extraire automatiquement les variables
    const variables = extractVariables(text);

    // Ajouter les nouvelles variables aux variables de prévisualisation
    const newPreviewVars = { ...previewVariables };
    variables.forEach(v => {
      if (!newPreviewVars[v]) {
        newPreviewVars[v] = `[${v}]`;
      }
    });
    setPreviewVariables(newPreviewVars);
  };

  const addVariable = (type) => {
    if (!variableInput.trim()) return;

    const variable = variableInput.trim();
    const key = type === 'required' ? 'required_variables' : 'optional_variables';

    if (!formData[key].includes(variable)) {
      setFormData({
        ...formData,
        [key]: [...formData[key], variable]
      });

      // Ajouter au template text
      const cursorPos = document.getElementById('template-textarea')?.selectionStart || formData.template_text.length;
      const before = formData.template_text.substring(0, cursorPos);
      const after = formData.template_text.substring(cursorPos);
      setFormData({
        ...formData,
        template_text: `${before}{${variable}}${after}`,
        [key]: [...formData[key], variable]
      });
    }

    setVariableInput('');
  };

  const removeVariable = (variable, type) => {
    const key = type === 'required' ? 'required_variables' : 'optional_variables';
    setFormData({
      ...formData,
      [key]: formData[key].filter(v => v !== variable)
    });
  };

  const addHashtag = () => {
    if (!hashtagInput.trim()) return;

    let hashtag = hashtagInput.trim();
    if (!hashtag.startsWith('#')) {
      hashtag = '#' + hashtag;
    }

    if (!formData.default_hashtags.includes(hashtag)) {
      setFormData({
        ...formData,
        default_hashtags: [...formData.default_hashtags, hashtag]
      });
    }

    setHashtagInput('');
  };

  const removeHashtag = (hashtag) => {
    setFormData({
      ...formData,
      default_hashtags: formData.default_hashtags.filter(h => h !== hashtag)
    });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Veuillez donner un nom au template');
      return;
    }
    if (!formData.template_text.trim()) {
      alert('Le texte du template ne peut pas être vide');
      return;
    }

    const newTemplate = {
      ...template,
      ...formData,
      id: template?.id || Date.now(),
      usage_count: template?.usage_count || 0,
      average_engagement: template?.average_engagement || 0
    };

    onSave(newTemplate);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center">
            <Code className="w-8 h-8 mr-3" />
            <div>
              <h2 className="text-2xl font-bold">
                {template?.id ? 'Éditer le Template' : 'Nouveau Template'}
              </h2>
              <p className="text-purple-100 text-sm">Créez et personnalisez vos templates de captions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - Editor */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom du Template *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Session Studio Jazz"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Template Text */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Texte du Template *
                </label>
                <textarea
                  id="template-textarea"
                  value={formData.template_text}
                  onChange={handleTemplateTextChange}
                  placeholder="Écrivez votre template ici. Utilisez {variable} pour les variables dynamiques."
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Utilisez des accolades pour les variables : {'{'}artist_name{'}'}
                </p>
              </div>

              {/* Variables */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Variables Requises
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={variableInput}
                    onChange={(e) => setVariableInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addVariable('required')}
                    placeholder="Nom de la variable"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={() => addVariable('required')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
                  >
                    Ajouter
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.required_variables.map(variable => (
                    <span
                      key={variable}
                      className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {variable}
                      <button
                        onClick={() => removeVariable(variable, 'required')}
                        className="ml-2 text-blue-900 hover:text-blue-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Hashtags */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hashtags par Défaut
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addHashtag()}
                    placeholder="Ex: jazz, music"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={addHashtag}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
                  >
                    Ajouter
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.default_hashtags.map(hashtag => (
                    <span
                      key={hashtag}
                      className="flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                    >
                      {hashtag}
                      <button
                        onClick={() => removeHashtag(hashtag)}
                        className="ml-2 text-purple-900 hover:text-purple-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border-2 border-purple-200">
                <div className="flex items-center mb-4">
                  <Eye className="w-6 h-6 text-purple-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">Prévisualisation</h3>
                </div>

                {/* Instagram-like preview */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-4 border-b">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3"></div>
                      <div>
                        <p className="font-semibold text-sm">votre_compte</p>
                        <p className="text-xs text-gray-500">Caption Generator</p>
                      </div>
                    </div>
                  </div>

                  <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <Sparkles className="w-16 h-16 text-purple-300" />
                  </div>

                  <div className="p-4">
                    <p className="text-sm whitespace-pre-wrap">{previewText || 'Votre caption apparaîtra ici...'}</p>
                    {formData.default_hashtags.length > 0 && (
                      <p className="text-sm text-blue-600 mt-2">
                        {formData.default_hashtags.join(' ')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Preview Variables */}
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Variables de test :</p>
                  {Object.keys(previewVariables).map(key => (
                    <div key={key} className="flex items-center gap-2">
                      <label className="text-xs text-gray-600 w-32">{key}:</label>
                      <input
                        type="text"
                        value={previewVariables[key]}
                        onChange={(e) => setPreviewVariables({ ...previewVariables, [key]: e.target.value })}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition"
          >
            <Save className="w-5 h-5 mr-2" />
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

export default TemplateEditor;
