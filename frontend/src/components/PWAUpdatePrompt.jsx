import { useState, useEffect, memo } from 'react';
import { RefreshCw, WifiOff, Wifi } from 'lucide-react';
import { toastSuccess, toastError } from '../utils/toast';
import { useRegisterSW } from 'virtual:pwa-register/react';

function PWAUpdatePrompt() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toastSuccess('Connexion rétablie');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toastError('Mode hors ligne activé');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const handleClose = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <>
      {/* Connection Status Indicator */}
      {!isOnline && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 z-50 animate-slideDown">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-semibold">Mode hors ligne</span>
        </div>
      )}

      {/* Offline Ready Notification */}
      {offlineReady && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-green-600 text-white rounded-lg shadow-2xl p-4 z-50 animate-slideUp">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wifi className="w-6 h-6" />
              <div>
                <h4 className="font-bold">Application prête hors ligne!</h4>
                <p className="text-sm text-green-100">
                  L'app peut maintenant fonctionner sans connexion
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded transition text-sm font-medium"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Update Available Notification */}
      {needRefresh && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-2xl p-4 z-50 animate-slideUp">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-6 h-6" />
              <div>
                <h4 className="font-bold">Nouvelle version disponible!</h4>
                <p className="text-sm text-blue-100">
                  Cliquez pour mettre à jour l'application
                </p>
              </div>
            </div>
            <div className="flex space-x-2 ml-2">
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition text-sm font-semibold shadow"
              >
                Mettre à jour
              </button>
              <button
                onClick={handleClose}
                className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-sm font-medium"
              >
                Ignorer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(PWAUpdatePrompt);
