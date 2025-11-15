import { useState, useEffect } from 'react';
import { FileText, Plus, Star, Download, Upload, Edit2, Trash2, Copy, Search, Filter } from 'lucide-react';
import TemplateEditor from './TemplateEditor';

function Templates() {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const categories = [
    { id: 'all', name: 'Tous', icon: '🎵' },
    { id: 'studio', name: 'Studio', icon: '🎙️' },
    { id: 'concert', name: 'Concert', icon: '🎸' },
    { id: 'rehearsal', name: 'Répétition', icon: '🎹' },
    { id: 'collaboration', name: 'Collaboration', icon: '🤝' },
    { id: 'release', name: 'Sortie', icon: '🎉' },
    { id: 'general', name: 'Général', icon: '✨' }
  ];

  // Templates prédéfinis (20+ templates)
  const defaultTemplates = [
    // Studio Templates
    {
      id: 1,
      name: "Session Studio Jazz",
      category: "studio",
      template_text: "🎺 Session {style} au {venue} ! {artist_name} explore de nouvelles sonorités avec {instruments}. L'inspiration coule à flots... ✨\n\nRestez connectés pour découvrir ce nouveau chapitre musical ! 🎵",
      required_variables: ["artist_name", "venue", "style", "instruments"],
      default_hashtags: ["#studio", "#jazz", "#music", "#recording"],
      usage_count: 45,
      average_engagement: 0.82
    },
    {
      id: 2,
      name: "Studio Créatif",
      category: "studio",
      template_text: "✨ En studio aujourd'hui ! {artist_name} travaille sur du {style} avec {instruments}. L'énergie créative est à son maximum ! 🎶\n\nDe belles choses arrivent... 🎵",
      required_variables: ["artist_name", "style", "instruments"],
      default_hashtags: ["#studio", "#creativity", "#newmusic"],
      usage_count: 32,
      average_engagement: 0.75
    },
    {
      id: 3,
      name: "Session d'Enregistrement",
      category: "studio",
      template_text: "🎙️ Session d'enregistrement intense ! {artist_name} pose ses {instruments} sur les nouvelles compos {style}. La magie opère au {venue} ! ✨",
      required_variables: ["artist_name", "instruments", "style", "venue"],
      default_hashtags: ["#recording", "#studio", "#musician"],
      usage_count: 28,
      average_engagement: 0.79
    },

    // Concert Templates
    {
      id: 4,
      name: "Concert Live",
      category: "concert",
      template_text: "🔥 Quelle soirée au {venue} ! {artist_name} a enflammé la scène avec un set {style} mémorable. Le public était en fusion totale ! 🎵\n\nMerci à tous ceux qui étaient là pour partager cette énergie incroyable ! 🙏",
      required_variables: ["artist_name", "venue", "style"],
      default_hashtags: ["#concert", "#live", "#music", "#performance"],
      usage_count: 67,
      average_engagement: 0.91
    },
    {
      id: 5,
      name: "Soirée Mémorable",
      category: "concert",
      template_text: "🎸 Soirée inoubliable hier soir ! {artist_name} et son {style} ont fait vibrer le {venue}. Merci pour cette énergie exceptionnelle ! ✨\n\n{audience_count} personnes dans une ambiance de folie ! 🎉",
      required_variables: ["artist_name", "style", "venue"],
      optional_variables: ["audience_count"],
      default_hashtags: ["#livemusic", "#concert", "#unforgettable"],
      usage_count: 54,
      average_engagement: 0.88
    },
    {
      id: 6,
      name: "Festival Vibes",
      category: "concert",
      template_text: "🎉 {artist_name} au {venue} ! Set {style} sous le soleil, le public était au rendez-vous ! Quelle ambiance ! 🌟\n\nMerci à l'organisation et à vous tous ! 🙏",
      required_variables: ["artist_name", "venue", "style"],
      default_hashtags: ["#festival", "#livemusic", "#goodvibes"],
      usage_count: 41,
      average_engagement: 0.85
    },

    // Collaboration Templates
    {
      id: 7,
      name: "Collaboration Magique",
      category: "collaboration",
      template_text: "✨ Collaboration magique avec {collaborators} ! Quand {artist_name} rencontre d'autres talents, la créativité explose. {style} fusion à son meilleur ! 🎵\n\nLa musique n'a pas de frontières... 🌍",
      required_variables: ["artist_name", "collaborators", "style"],
      default_hashtags: ["#collaboration", "#music", "#artists"],
      usage_count: 38,
      average_engagement: 0.84
    },
    {
      id: 8,
      name: "Session Collab",
      category: "collaboration",
      template_text: "🤝 Session collaborative avec {collaborators} ! {artist_name} et ses partenaires créent du {style} au {venue}. L'alchimie est parfaite ! ✨",
      required_variables: ["artist_name", "collaborators", "style", "venue"],
      default_hashtags: ["#collab", "#musicians", "#creation"],
      usage_count: 29,
      average_engagement: 0.77
    },

    // Rehearsal Templates
    {
      id: 9,
      name: "Répétition Productive",
      category: "rehearsal",
      template_text: "🎵 Répétition {style} productive ! Travail sur {instruments} dans une ambiance {atmosphere}. Ça prend forme ! 💪\n\nProchaine étape : {venue} ! 🎯",
      required_variables: ["style", "instruments", "atmosphere"],
      optional_variables: ["venue"],
      default_hashtags: ["#rehearsal", "#practice", "#music"],
      usage_count: 22,
      average_engagement: 0.68
    },
    {
      id: 10,
      name: "Préparation Concert",
      category: "rehearsal",
      template_text: "🎶 {artist_name} en pleine préparation pour le concert au {venue} ! Répétition {style} intensive avec {instruments}. On est prêts ! 🔥",
      required_variables: ["artist_name", "venue", "style", "instruments"],
      default_hashtags: ["#rehearsal", "#concertprep", "#musician"],
      usage_count: 19,
      average_engagement: 0.71
    },

    // Release Templates
    {
      id: 11,
      name: "Nouvelle Sortie",
      category: "release",
      template_text: "🎉 NOUVEAU ! {artist_name} est fier de vous présenter {track_name} ! Un titre {style} qui vous transporte... Disponible maintenant ! 🎵\n\nLien en bio ! ✨",
      required_variables: ["artist_name", "track_name", "style"],
      default_hashtags: ["#newrelease", "#newmusic", "#outnow"],
      usage_count: 56,
      average_engagement: 0.93
    },
    {
      id: 12,
      name: "Album Announcement",
      category: "release",
      template_text: "🚀 L'album {album_name} de {artist_name} arrive ! {style} comme vous ne l'avez jamais entendu. Sortie le {release_date} ! 🎉\n\nPré-commande disponible ! 🔥",
      required_variables: ["artist_name", "album_name", "style", "release_date"],
      default_hashtags: ["#album", "#comingsoon", "#newalbum"],
      usage_count: 43,
      average_engagement: 0.89
    },
    {
      id: 13,
      name: "Single Drop",
      category: "release",
      template_text: "🎵 {track_name} est enfin là ! {artist_name} vous livre son nouveau single {style}. Écoutez-le maintenant sur toutes les plateformes ! 🎧\n\n{streaming_links}",
      required_variables: ["track_name", "artist_name", "style"],
      optional_variables: ["streaming_links"],
      default_hashtags: ["#single", "#newmusic", "#musicrelease"],
      usage_count: 51,
      average_engagement: 0.91
    },

    // General Templates
    {
      id: 14,
      name: "Behind The Scenes",
      category: "general",
      template_text: "📸 Coulisses ! Voilà comment {artist_name} prépare ses sessions {style}. Entre {instruments} et inspiration... La vie d'artiste ! ✨",
      required_variables: ["artist_name", "style", "instruments"],
      default_hashtags: ["#bts", "#behindthescenes", "#musiclife"],
      usage_count: 35,
      average_engagement: 0.76
    },
    {
      id: 15,
      name: "Gratitude Post",
      category: "general",
      template_text: "🙏 {artist_name} tient à remercier tous ceux qui suivent et soutiennent la musique {style}. Votre énergie est notre carburant ! ✨\n\nMerci infiniment ! 🎵",
      required_variables: ["artist_name", "style"],
      default_hashtags: ["#thankful", "#gratitude", "#musicfamily"],
      usage_count: 27,
      average_engagement: 0.73
    },
    {
      id: 16,
      name: "Journey Post",
      category: "general",
      template_text: "🌟 Le parcours de {artist_name} dans le {style}... De {start_point} à aujourd'hui ! Chaque note raconte une histoire. 🎵\n\nLa musique est un voyage infini... ✨",
      required_variables: ["artist_name", "style"],
      optional_variables: ["start_point"],
      default_hashtags: ["#musicjourney", "#musician", "#passion"],
      usage_count: 24,
      average_engagement: 0.74
    },
    {
      id: 17,
      name: "Inspiration Moment",
      category: "general",
      template_text: "💡 L'inspiration frappe {artist_name} ! Entre {instruments} et créativité {style}, les idées fusent au {venue}. Restez connectés... 🎶",
      required_variables: ["artist_name", "instruments", "style"],
      optional_variables: ["venue"],
      default_hashtags: ["#inspiration", "#creativity", "#music"],
      usage_count: 31,
      average_engagement: 0.78
    },
    {
      id: 18,
      name: "Practice Makes Perfect",
      category: "general",
      template_text: "🎯 {artist_name} et ses {instruments} ! Des heures de travail pour perfectionner ce {style}. La passion ne connaît pas de limites ! 💪",
      required_variables: ["artist_name", "instruments", "style"],
      default_hashtags: ["#practice", "#dedication", "#musician"],
      usage_count: 26,
      average_engagement: 0.72
    },
    {
      id: 19,
      name: "Vibes Post",
      category: "general",
      template_text: "✨ Vibes du jour : {style} avec {artist_name} ! {instruments} et bonne humeur au programme. La musique c'est la vie ! 🎵",
      required_variables: ["style", "artist_name", "instruments"],
      default_hashtags: ["#vibes", "#musicvibes", "#goodenergy"],
      usage_count: 33,
      average_engagement: 0.75
    },
    {
      id: 20,
      name: "Equipment Showcase",
      category: "general",
      template_text: "🎸 Focus sur le setup de {artist_name} ! {instruments} pour créer du {style} authentique. Chaque outil compte dans le processus créatif ! 🎵",
      required_variables: ["artist_name", "instruments", "style"],
      default_hashtags: ["#gearpost", "#equipment", "#musicgear"],
      usage_count: 21,
      average_engagement: 0.69
    },

    // More Studio variations
    {
      id: 21,
      name: "Late Night Session",
      category: "studio",
      template_text: "🌙 Session nocturne au {venue} ! {artist_name} et son {style} jusqu'au bout de la nuit. C'est là que la magie opère... ✨🎵",
      required_variables: ["venue", "artist_name", "style"],
      default_hashtags: ["#latenightsession", "#studio", "#musicproduction"],
      usage_count: 25,
      average_engagement: 0.76
    },
    {
      id: 22,
      name: "Producer Collab",
      category: "studio",
      template_text: "🎛️ {artist_name} en studio avec {producer} ! Fusion {style} et production de haut niveau. Le son prend une autre dimension ! 🔥",
      required_variables: ["artist_name", "producer", "style"],
      default_hashtags: ["#production", "#producer", "#studiolife"],
      usage_count: 30,
      average_engagement: 0.81
    }
  ];

  useEffect(() => {
    // Charger les templates (pour l'instant, utiliser les templates par défaut)
    setTemplates(defaultTemplates);
    setFilteredTemplates(defaultTemplates);

    // Charger les favoris du localStorage
    const savedFavorites = localStorage.getItem('favoriteTemplates');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  useEffect(() => {
    // Filtrer les templates
    let filtered = templates;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.template_text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTemplates(filtered);
  }, [selectedCategory, searchQuery, templates]);

  const toggleFavorite = (templateId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(templateId)) {
      newFavorites.delete(templateId);
    } else {
      newFavorites.add(templateId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('favoriteTemplates', JSON.stringify([...newFavorites]));
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(templates, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'caption-templates.json';
    link.click();
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedTemplates = JSON.parse(e.target.result);
          setTemplates([...templates, ...importedTemplates]);
          alert(`${importedTemplates.length} template(s) importé(s) avec succès !`);
        } catch (error) {
          alert('Erreur lors de l\'import du fichier JSON');
        }
      };
      reader.readAsText(file);
    }
  };

  const copyTemplate = (template) => {
    navigator.clipboard.writeText(template.template_text);
    alert('Template copié dans le presse-papier !');
  };

  const handleSaveTemplate = (template) => {
    const existingIndex = templates.findIndex(t => t.id === template.id);
    if (existingIndex >= 0) {
      // Update existing template
      const updatedTemplates = [...templates];
      updatedTemplates[existingIndex] = template;
      setTemplates(updatedTemplates);
    } else {
      // Add new template
      setTemplates([...templates, template]);
    }
    setShowEditor(false);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (templateId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
      setTemplates(templates.filter(t => t.id !== templateId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Editor Modal */}
      <TemplateEditor
        isOpen={showEditor}
        onClose={() => {
          setShowEditor(false);
          setEditingTemplate(null);
        }}
        template={editingTemplate}
        onSave={handleSaveTemplate}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            <FileText className="w-8 h-8 mr-3 text-purple-600" />
            Bibliothèque de Templates
          </h2>
          <p className="text-gray-600 mt-2">
            {templates.length} templates disponibles - Personnalisez et gérez vos captions
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Download className="w-5 h-5 mr-2" />
            Exporter
          </button>
          <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer">
            <Upload className="w-5 h-5 mr-2" />
            Importer
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
          <button
            onClick={() => setShowEditor(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau Template
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un template..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            {/* Template Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-800">{template.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                    {categories.find(c => c.id === template.category)?.name || template.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {template.usage_count} utilisations
                  </span>
                </div>
              </div>
              <button
                onClick={() => toggleFavorite(template.id)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Star
                  className={`w-5 h-5 ${
                    favorites.has(template.id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                  }`}
                />
              </button>
            </div>

            {/* Template Preview */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700 line-clamp-4">{template.template_text}</p>
            </div>

            {/* Engagement Score */}
            {template.average_engagement && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Engagement</span>
                  <span>{Math.round(template.average_engagement * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                    style={{ width: `${template.average_engagement * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Variables */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Variables requises :</p>
              <div className="flex flex-wrap gap-1">
                {template.required_variables?.map(variable => (
                  <span key={variable} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                    {variable}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => copyTemplate(template)}
                className="flex-1 flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copier
              </button>
              <button
                onClick={() => {
                  setEditingTemplate(template);
                  setShowEditor(true);
                }}
                className="flex items-center justify-center px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Aucun template trouvé</p>
          <p className="text-gray-400 text-sm">Essayez de modifier vos filtres</p>
        </div>
      )}
    </div>
  );
}

export default Templates;
