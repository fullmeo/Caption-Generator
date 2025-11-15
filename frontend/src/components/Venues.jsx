import { useEffect, useState, memo } from 'react';
import { MapPin, Building2, Theater, Home } from 'lucide-react';
import { getVenues } from '../services/api';
import { toastError } from '../utils/toast';

// Icônes par type de lieu
const venueTypeIcons = {
  'Jazz Club': <Home className="w-6 h-6" />,
  'Concert Hall': <Building2 className="w-6 h-6" />,
  'Theater': <Theater className="w-6 h-6" />,
  'Cultural Center': <Building2 className="w-6 h-6" />,
};

// Couleurs par type de lieu
const venueTypeColors = {
  'Jazz Club': 'from-amber-500 to-orange-600',
  'Concert Hall': 'from-blue-500 to-indigo-600',
  'Theater': 'from-red-500 to-pink-600',
  'Cultural Center': 'from-green-500 to-teal-600',
};

function Venues() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const data = await getVenues();
      setVenues(data.venues || []);
      setError(null);
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors du chargement des lieux';
      setError(errorMessage);
      toastError(errorMessage);
      console.error('Error fetching venues:', err);
    } finally {
      setLoading(false);
    }
  };

  const venueTypes = [...new Set(venues.map(v => v.type))];

  const filteredVenues = venues.filter(venue => {
    const matchesSearch =
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || venue.type === filterType;

    return matchesSearch && matchesType;
  });

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
        Erreur lors du chargement des lieux: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center">
          <MapPin className="w-8 h-8 mr-3 text-purple-600" />
          Lieux de concerts
        </h2>
        <div className="text-sm text-gray-600 bg-purple-100 px-4 py-2 rounded-full">
          {venues.length} lieu{venues.length > 1 ? 'x' : ''}
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
        <input
          type="text"
          placeholder="Rechercher par nom, ville ou type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
        />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-full font-semibold transition ${
              filterType === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tous ({venues.length})
          </button>
          {venueTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                filterType === type
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {type} ({venues.filter(v => v.type === type).length})
            </button>
          ))}
        </div>
      </div>

      {/* Liste des lieux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVenues.map((venue) => (
          <div
            key={venue.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className={`bg-gradient-to-r ${venueTypeColors[venue.type] || 'from-purple-500 to-indigo-600'} p-6 text-white`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold">{venue.name}</h3>
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  {venueTypeIcons[venue.type] || <Building2 className="w-6 h-6" />}
                </div>
              </div>
              <div className="flex items-center text-white text-opacity-90">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{venue.city}</span>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Type de lieu</span>
                  <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {venue.type}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ville</span>
                  <span className="font-semibold text-gray-800">{venue.city}</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition font-semibold">
                    Utiliser ce lieu
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVenues.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Aucun lieu trouvé</p>
        </div>
      )}
    </div>
  );
}

export default memo(Venues);
