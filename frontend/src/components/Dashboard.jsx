import { useEffect, useState, memo } from 'react';
import { BarChart3, TrendingUp, Music, MapPin, Hash, FileText } from 'lucide-react';
import { getAnalytics } from '../services/api';
import { toastError, toastSuccess } from '../utils/toast';

function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getAnalytics();
      setAnalytics(data);
      setError(null);
      toastSuccess('Statistiques mises à jour!');
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors du chargement des statistiques';
      setError(errorMessage);
      toastError(errorMessage);
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

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
        Erreur lors du chargement des statistiques: {error}
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center">
          <BarChart3 className="w-8 h-8 mr-3 text-purple-600" />
          Dashboard Analytics
        </h2>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          Actualiser
        </button>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<FileText className="w-8 h-8" />}
          title="Captions générées"
          value={analytics.total_captions_generated}
          color="bg-blue-500"
        />
        <StatCard
          icon={<TrendingUp className="w-8 h-8" />}
          title="Médias analysés"
          value={analytics.total_media_analyzed}
          color="bg-green-500"
        />
        <StatCard
          icon={<Hash className="w-8 h-8" />}
          title="Hashtags utilisés"
          value={analytics.total_hashtags_used}
          color="bg-purple-500"
        />
        <StatCard
          icon={<FileText className="w-8 h-8" />}
          title="Longueur moyenne"
          value={`${analytics.avg_caption_length} car.`}
          color="bg-orange-500"
        />
      </div>

      {/* Styles les plus utilisés */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Music className="w-6 h-6 mr-2 text-purple-600" />
          Styles les plus utilisés
        </h3>
        <div className="space-y-3">
          {analytics.most_used_styles.map((style, index) => (
            <div key={index} className="flex items-center">
              <div className="w-24 font-semibold text-gray-700 capitalize">
                {style.style}
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(style.count / analytics.most_used_styles[0].count) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
              <div className="w-16 text-right font-bold text-purple-600">
                {style.count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top venues */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <MapPin className="w-6 h-6 mr-2 text-purple-600" />
          Lieux les plus populaires
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.top_venues.map((venue, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                  {index + 1}
                </div>
                <span className="font-semibold text-gray-700">{venue.name}</span>
              </div>
              <span className="text-purple-600 font-bold">{venue.count} fois</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const StatCard = memo(({ icon, title, value, color }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 flex items-start space-x-4">
      <div className={`${color} text-white p-3 rounded-lg`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-600 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

export default memo(Dashboard);
