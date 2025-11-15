import { useState, useEffect, memo } from 'react';
import { Download, X } from 'lucide-react';
import { toastSuccess } from '../utils/toast';

function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    // Listen for install prompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Don't show if user dismissed before
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        // Delay showing to avoid interrupting initial experience
        setTimeout(() => setShowPrompt(true), 5000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      toastSuccess('Application installée avec succès!');
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show install prompt
    deferredPrompt.prompt();

    // Wait for user choice
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      toastSuccess('Installation en cours...');
    }

    // Clear the prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed or no prompt available
  if (isStandalone || !showPrompt || (!deferredPrompt && !isIOS)) {
    return null;
  }

  // iOS Install Instructions
  if (isIOS && !isStandalone) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-2xl p-5 z-50 animate-slideUp">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start space-x-3">
          <div className="bg-white/20 p-3 rounded-lg">
            <Download className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">Installer Caption Generator</h3>
            <p className="text-sm text-white/90 mb-3">
              Installez l'app pour un accès rapide et le mode hors ligne.
            </p>
            <div className="text-sm space-y-2 bg-white/10 p-3 rounded-lg">
              <p>Pour installer sur iOS:</p>
              <ol className="list-decimal list-inside space-y-1 text-white/80">
                <li>Appuyez sur le bouton Partager</li>
                <li>Faites défiler et sélectionnez "Sur l'écran d'accueil"</li>
                <li>Appuyez sur "Ajouter"</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard install prompt (Android, Desktop)
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-2xl p-5 z-50 animate-slideUp">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start space-x-3 mb-4">
        <div className="bg-white/20 p-3 rounded-lg">
          <Download className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">Installer Caption Generator</h3>
          <p className="text-sm text-white/90">
            Accès instantané et mode hors ligne disponible
          </p>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={handleInstall}
          className="flex-1 bg-white text-purple-600 py-2.5 px-4 rounded-lg font-semibold hover:bg-purple-50 transition shadow-lg"
        >
          Installer
        </button>
        <button
          onClick={handleDismiss}
          className="px-4 py-2.5 text-white/90 hover:bg-white/10 rounded-lg transition font-medium"
        >
          Plus tard
        </button>
      </div>
    </div>
  );
}

export default memo(PWAInstallPrompt);
