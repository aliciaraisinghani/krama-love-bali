import { useState } from 'react';
import { User, Users, Heart } from 'lucide-react';
import ProfileTab from '../components/ProfileTab';
import MatchesTab from '../components/MatchesTab';
import Matchmaking from './Matchmaking';
import LoginView from '../components/LoginView';
import GameSelection from '../components/GameSelection';
import AccountConnection from '../components/AccountConnection';

type AppState = 'login' | 'gameSelection' | 'accountConnection' | 'main';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('login');
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const handleLogin = () => {
    setAppState('gameSelection');
  };

  const handleGameSelect = (game: string) => {
    setSelectedGame(game);
    setAppState('accountConnection');
  };

  const handleAccountConnectionComplete = () => {
    setAppState('main');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab />;
      case 'matchmaking':
        return <Matchmaking />;
      case 'matches':
        return <MatchesTab />;
      default:
        return <ProfileTab />;
    }
  };

  // Show login view
  if (appState === 'login') {
    return <LoginView onLogin={handleLogin} />;
  }

  // Show game selection
  if (appState === 'gameSelection') {
    return <GameSelection onGameSelect={handleGameSelect} />;
  }

  // Show account connection  
  if (appState === 'accountConnection') {
    return <AccountConnection onComplete={handleAccountConnectionComplete} />;
  }

  // Main app with LoL theming
  return (
    <div className="min-h-screen bg-lol-black text-lol-white">
      {/* Header */}
      <header className="bg-lol-gray-900 border-b border-lol-blue/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <img 
              src="/ezlfp-logo.png" 
              alt="EZLFP" 
              className="h-16 w-auto"
            />
          </div>
          <p className="text-center text-sm text-lol-white/60 mt-1">
            Find your perfect League of Legends duo partner
          </p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-lol-gray-800 border-b border-lol-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center space-x-8">
            {[
              { id: 'profile', icon: User, label: 'My Profile' },
              { id: 'matchmaking', icon: Heart, label: 'Matchmaking' },
              { id: 'matches', icon: Users, label: 'Matches' },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 py-4 px-6 border-b-2 transition-all duration-200 relative ${
                  activeTab === id
                    ? 'border-lol-gold text-lol-gold'
                    : 'border-transparent text-lol-white/60 hover:text-lol-white hover:border-lol-blue/50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{label}</span>
                {activeTab === id && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-lol-gold animate-glow"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {renderContent()}
      </main>

      {/* Footer with LoL branding */}
      <footer className="bg-lol-gray-900 border-t border-lol-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-lol-white/40 text-sm">
            <div className="flex items-center justify-center gap-2">
              <span>© 2024</span>
              <img 
                src="/ezlfp-logo.png" 
                alt="EZLFP" 
                className="h-6 w-auto"
              />
              <span>- Find Your Duo. Rise in Ranked.</span>
            </div>
            <p className="mt-1">Not affiliated with Riot Games. League of Legends is a trademark of Riot Games, Inc.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
