import { useState } from 'react';
import { Music, Sparkles, Users, MapPin, BarChart3, FileText, Folder } from 'lucide-react';
import CaptionGenerator from './components/CaptionGenerator';
import Dashboard from './components/Dashboard';
import Musicians from './components/Musicians';
import Venues from './components/Venues';
import Templates from './components/Templates';
import BatchProcessor from './components/BatchProcessor';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('generator');

  const tabs = [
    { id: 'generator', name: 'Générateur', icon: Sparkles, component: CaptionGenerator },
    { id: 'batch', name: 'Batch', icon: Folder, component: BatchProcessor },
    { id: 'templates', name: 'Templates', icon: FileText, component: Templates },
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3, component: Dashboard },
    { id: 'musicians', name: 'Musiciens', icon: Users, component: Musicians },
    { id: 'venues', name: 'Lieux', icon: MapPin, component: Venues },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-xl mr-3">
                <Music className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Caption Generator</h1>
                <p className="text-sm text-gray-600">Générateur IA de légendes Instagram pour musiciens</p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-2 bg-purple-100 rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-purple-700">API connectée</span>
            </div>
          </div>

          {/* Navigation tabs */}
          <nav className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="animate-fadeIn">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center text-gray-600 mb-4 md:mb-0">
              <Music className="w-5 h-5 mr-2 text-purple-600" />
              <span className="text-sm">
                Caption Generator - Propulsé par l'IA pour les musiciens
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-sm text-gray-600 hover:text-purple-600 transition">
                Documentation
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-purple-600 transition">
                API
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-purple-600 transition">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;