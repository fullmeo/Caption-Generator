import { useEffect, useState } from 'react';
import { Users, Music2, Guitar, Radio } from 'lucide-react';
import { getMusicians } from '../services/api';

// Icônes par instrument
const instrumentIcons = {
  'Saxophone': <Music2 className="w-6 h-6" />,
  'Trumpet': <Radio className="w-6 h-6" />,
  'Piano': <Music2 className="w-6 h-6" />,
  'Bass': <Guitar className="w-6 h-6" />,
  'Drums': <Radio className="w-6 h-6" />,
};

function Musicians() {
  const [musicians, setMusicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMusicians();
  }, []);

  const fetchMusicians = async () => {
    try {
      setLoading(true);
      const data = await getMusicians();
      setMusicians(data.musicians || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching musicians:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMusicians = musicians.filter(musician =>
    musician.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    musician.instrument.toLowerCase().includes(searchTerm.toLowerCase()) ||
    musician.style.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Erreur lors du chargement des musiciens: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center">
          <Users className="w-8 h-8 mr-3 text-purple-600" />
          Musiciens
        </h2>
        <div className="text-sm text-gray-600 bg-purple-100 px-4 py-2 rounded-full">
          {musicians.length} musicien{musicians.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <input
          type="text"
          placeholder="Rechercher par nom, instrument ou style..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
      </div>

      {/* Liste des musiciens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMusicians.map((musician) => (
          <div
            key={musician.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold">{musician.name}</h3>
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  {instrumentIcons[musician.instrument] || <Music2 className="w-6 h-6" />}
                </div>
              </div>
              <p className="text-purple-100 text-sm">#{musician.id}</p>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Instrument</span>
                  <span className="font-semibold text-gray-800">{musician.instrument}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Style</span>
                  <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {musician.style}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMusicians.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Aucun musicien trouvé</p>
        </div>
      )}
    </div>
  );
}

export default Musicians;
