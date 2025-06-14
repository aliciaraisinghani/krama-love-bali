
import { useState } from 'react';
import { User, Search, Gamepad2, Users } from 'lucide-react';
import ProfileTab from '../components/ProfileTab';
import FindPlayersTab from '../components/FindPlayersTab';
import MatchesTab from '../components/MatchesTab';

const Index = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab />;
      case 'find':
        return <FindPlayersTab />;
      case 'matches':
        return <MatchesTab />;
      default:
        return <ProfileTab />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-black border-b border-teal-500 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <h1 className="text-3xl font-bold text-white">
              Game<span className="text-teal-400">Match</span>
            </h1>
            <Gamepad2 className="ml-3 h-8 w-8 text-teal-400" />
          </div>
          <p className="text-center text-sm text-gray-400 mt-1">
            Find your perfect gaming companion
          </p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center space-x-8">
            {[
              { id: 'profile', icon: User, label: 'My Profile' },
              { id: 'find', icon: Search, label: 'Find Players' },
              { id: 'matches', icon: Users, label: 'Matches' },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 py-4 px-6 border-b-2 transition-all duration-200 ${
                  activeTab === id
                    ? 'border-teal-400 text-teal-400'
                    : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
