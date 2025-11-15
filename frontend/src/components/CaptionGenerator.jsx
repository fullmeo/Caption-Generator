import { useState, memo } from 'react';
import { Upload, Instagram, Loader, Sparkles, Copy, Check, Brain } from 'lucide-react';
import { analyzeMedia, generateCaption, analyzeAndGenerate } from '../services/api';
import { API_BASE_URL, FILE_UPLOAD } from '../utils/constants';
import { toastSuccess, toastError, copyToClipboard as copyToClipboardUtil } from '../utils/toast';
import AdvancedAIOptions from './AdvancedAIOptions';

function CaptionGenerator() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [useAdvancedAI, setUseAdvancedAI] = useState(false);

  // Formulaire pour génération personnalisée
  const [formData, setFormData] = useState({
    musicians: '',
    venue: '',
    style: 'jazz'
  });

  // Options IA avancées
  const [aiOptions, setAIOptions] = useState({
    analysisModel: 'gpt-4-vision-preview',
    captionModel: 'gpt-4',
    style: 'casual',
    language: 'fr'
  });

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size
      if (file.size > FILE_UPLOAD.MAX_SIZE) {
        toastError(`Le fichier est trop volumineux (max ${FILE_UPLOAD.MAX_SIZE / 1024 / 1024}MB)`);
        return;
      }

      // Validate file type
      if (!FILE_UPLOAD.ACCEPTED_TYPES.includes(file.type)) {
        toastError('Type de fichier non supporté');
        return;
      }

      setSelectedFile(file);
      setAnalysis(null);
      setCaption('');

      // Créer une preview de l'image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQuickGenerate = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      if (useAdvancedAI) {
        // Use advanced AI endpoint with selected models
        const formDataObj = new FormData();
        formDataObj.append('file', selectedFile);

        const queryParams = new URLSearchParams({
          analysis_model: aiOptions.analysisModel,
          caption_model: aiOptions.captionModel,
          style: aiOptions.style,
          language: aiOptions.language,
          save_to_db: 'false'
        });

        const response = await fetch(`${API_BASE_URL}/ai/analyze-and-generate-pro?${queryParams}`, {
          method: 'POST',
          body: formDataObj
        });

        if (!response.ok) throw new Error('Failed to generate with advanced AI');

        const result = await response.json();
        setAnalysis(result.analysis);
        setCaption(result.caption);
        toastSuccess('Caption générée avec succès!');
      } else {
        // Use standard endpoint
        const result = await analyzeAndGenerate(selectedFile);
        setAnalysis(result.analysis);
        setCaption(result.caption);
        toastSuccess('Caption générée avec succès!');
      }
    } catch (error) {
      console.error('Error:', error);
      toastError(error.message || 'Erreur lors de la génération automatique');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomGenerate = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      // Analyse d'abord le média
      const analysisResult = await analyzeMedia(selectedFile);
      setAnalysis(analysisResult);

      // Puis génère une caption personnalisée
      const musicians = formData.musicians.split(',').map(m => m.trim()).filter(m => m);
      const captionResult = await generateCaption({
        musicians,
        venue: formData.venue,
        style: formData.style
      });

      setCaption(captionResult.caption);
      toastSuccess('Caption personnalisée générée avec succès!');
    } catch (error) {
      console.error('Error:', error);
      toastError(error.message || 'Erreur lors de la génération personnalisée');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    const success = await copyToClipboardUtil(caption);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Générateur de Captions</h2>
        <p className="text-gray-600">
          Uploadez votre média et générez automatiquement une légende Instagram optimisée
        </p>
      </div>

      {/* Advanced AI Toggle */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="w-6 h-6" />
          <div>
            <div className="font-bold">IA Avancée (Multi-Modèles)</div>
            <div className="text-sm opacity-90">
              GPT-4 Vision, Claude 3.5 Sonnet, styles personnalisés, 5 langues
            </div>
          </div>
        </div>
        <button
          onClick={() => setUseAdvancedAI(!useAdvancedAI)}
          className={`px-6 py-2 rounded-full font-semibold transition ${
            useAdvancedAI
              ? 'bg-white text-purple-600'
              : 'bg-purple-700 text-white hover:bg-purple-800'
          }`}
        >
          {useAdvancedAI ? 'Activé ✓' : 'Activer'}
        </button>
      </div>

      {/* Advanced AI Options */}
      {useAdvancedAI && (
        <AdvancedAIOptions onOptionsChange={setAIOptions} />
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Panneau de gauche - Upload et configuration */}
        <div className="space-y-6">
          {/* Upload */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Upload className="w-6 h-6 mr-2 text-purple-600" />
              Upload Média
            </h3>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-48 rounded-lg mb-4"
                  />
                ) : (
                  <Upload className="w-16 h-16 text-gray-400 mb-4" />
                )}
                <p className="text-gray-600 mb-2">
                  {selectedFile ? selectedFile.name : 'Cliquez pour sélectionner un fichier'}
                </p>
                <p className="text-sm text-gray-500">
                  Image ou vidéo - Max 10MB
                </p>
              </label>
            </div>

            {selectedFile && (
              <button
                onClick={handleQuickGenerate}
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Génération automatique
                  </>
                )}
              </button>
            )}
          </div>

          {/* Génération personnalisée */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Personnaliser la caption</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Musiciens (séparés par des virgules)
                </label>
                <input
                  type="text"
                  value={formData.musicians}
                  onChange={(e) => setFormData({...formData, musicians: e.target.value})}
                  placeholder="Ex: John Coltrane, Miles Davis"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lieu
                </label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({...formData, venue: e.target.value})}
                  placeholder="Ex: Duc des Lombards"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Style musical
                </label>
                <select
                  value={formData.style}
                  onChange={(e) => setFormData({...formData, style: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="jazz">Jazz</option>
                  <option value="fusion">Fusion</option>
                  <option value="afro">Afro</option>
                  <option value="world">World Music</option>
                  <option value="blues">Blues</option>
                  <option value="soul">Soul</option>
                </select>
              </div>

              <button
                onClick={handleCustomGenerate}
                disabled={!selectedFile || loading}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Générer avec ces infos
              </button>
            </div>
          </div>
        </div>

        {/* Panneau de droite - Résultats */}
        <div className="space-y-6">
          {/* Analyse */}
          {analysis && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Analyse du média</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">Éléments détectés:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {analysis.detected_objects?.map((obj, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                      >
                        {obj}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Tags suggérés:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {analysis.suggested_tags?.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                {analysis.confidence && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Confiance:</span>
                    <div className="mt-2 bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full"
                        style={{ width: `${analysis.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 mt-1">
                      {Math.round(analysis.confidence * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Caption générée */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center">
                <Instagram className="w-6 h-6 mr-2 text-purple-600" />
                Légende générée
              </h3>
              {caption && (
                <button
                  onClick={handleCopyToClipboard}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copié !
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copier
                    </>
                  )}
                </button>
              )}
            </div>

            {caption ? (
              <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-200">
                <p className="whitespace-pre-line text-gray-800 leading-relaxed">
                  {caption}
                </p>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Instagram className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Uploadez un média pour générer une légende</p>
                <p className="text-sm mt-2">
                  Utilisez la génération automatique ou personnalisez les détails
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(CaptionGenerator);
