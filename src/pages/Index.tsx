
import { useState } from 'react';
import { Heart, Users, User, Settings } from 'lucide-react';
import SwipeCard from '../components/SwipeCard';
import ProfileCard from '../components/ProfileCard';
import MatchesView from '../components/MatchesView';
import SettingsView from '../components/SettingsView';

const Index = () => {
  const [activeTab, setActiveTab] = useState('discover');

  const renderContent = () => {
    switch (activeTab) {
      case 'discover':
        return <SwipeCard />;
      case 'matches':
        return <MatchesView />;
      case 'profile':
        return <ProfileCard />;
      case 'settings':
        return <SettingsView />;
      default:
        return <SwipeCard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-orange-200 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <h1 className="text-2xl font-bold bg-gradient-sunset bg-clip-text text-transparent">
              Soulmate Bali
            </h1>
            <Heart className="ml-2 h-6 w-6 text-balinese-sunset animate-heart-beat" />
          </div>
          <p className="text-center text-sm text-balinese-earth/70 mt-1">
            Authentic connections, Balinese values
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md mx-auto px-4 py-6">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white/90 backdrop-blur-md border-t border-orange-200">
        <div className="flex justify-around py-3">
          {[
            { id: 'discover', icon: Heart, label: 'Discover' },
            { id: 'matches', icon: Users, label: 'Matches' },
            { id: 'profile', icon: User, label: 'Profile' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 ${
                activeTab === id
                  ? 'bg-gradient-sunset text-white shadow-md'
                  : 'text-balinese-earth hover:bg-orange-100'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Index;
