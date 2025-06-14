import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Crown, 
  Target, 
  Sword, 
  Shield, 
  Zap,
  ArrowRight,
  Clock
} from 'lucide-react';
import { useToast } from './ui/use-toast';

interface GameSelectionProps {
  onGameSelect: (game: string) => void;
}

const GameSelection = ({ onGameSelect }: GameSelectionProps) => {
  const { toast } = useToast();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const games = [
    {
      id: 'lol',
      name: 'League of Legends',
      description: 'The world\'s most popular MOBA',
      icon: Crown,
      color: 'lol-gold',
      gradient: 'from-lol-gold to-lol-gold-dark',
      available: true,
      players: '180M+',
      genre: 'MOBA'
    },
    {
      id: 'valorant',
      name: 'Valorant',
      description: 'Tactical 5v5 character-based shooter',
      icon: Target,
      color: 'red-500',
      gradient: 'from-red-500 to-red-700',
      available: false,
      players: '15M+',
      genre: 'Tactical FPS'
    },
    {
      id: 'marvel-rivals',
      name: 'Marvel Rivals',
      description: 'Super-powered 6v6 team shooter',
      icon: Zap,
      color: 'blue-500',
      gradient: 'from-blue-500 to-blue-700',
      available: false,
      players: '5M+',
      genre: 'Hero Shooter'
    },
    {
      id: 'dota2',
      name: 'Dota 2',
      description: 'The ultimate MOBA experience',
      icon: Sword,
      color: 'orange-500',
      gradient: 'from-orange-500 to-orange-700',
      available: false,
      players: '12M+',
      genre: 'MOBA'
    },
    {
      id: 'overwatch',
      name: 'Overwatch 2',
      description: 'Team-based action shooter',
      icon: Shield,
      color: 'orange-400',
      gradient: 'from-orange-400 to-orange-600',
      available: false,
      players: '35M+',
      genre: 'Hero Shooter'
    }
  ];

  const handleGameClick = (game: typeof games[0]) => {
    if (!game.available) {
      toast({
        title: "Coming Soon!",
        description: `${game.name} support is currently in development. Stay tuned!`,
        variant: "default",
      });
      return;
    }
    
    setSelectedGame(game.id);
  };

  const handleContinue = () => {
    if (selectedGame) {
      onGameSelect(selectedGame);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-lol flex items-center justify-center p-4">
      <div className="w-full max-w-6xl space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-lol-white">
            Choose Your <span className="text-lol-gold">Game</span>
          </h1>
          <p className="text-lol-white/70 text-lg max-w-2xl mx-auto">
            Select your preferred game to find teammates and start your journey to victory
          </p>
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => {
            const Icon = game.icon;
            const isSelected = selectedGame === game.id;
            
            return (
              <Card
                key={game.id}
                className={`relative cursor-pointer transition-all duration-300 border-2 overflow-hidden ${
                  game.available 
                    ? `hover:scale-105 border-lol-gray-700 hover:border-lol-blue bg-lol-gray-800/50 ${
                        isSelected ? 'border-lol-gold bg-lol-gold/10 shadow-lg shadow-lol-gold/20' : ''
                      }`
                    : 'border-lol-gray-700 bg-lol-gray-800/30 opacity-75'
                }`}
                onClick={() => handleGameClick(game)}
              >
                {!game.available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                    <Badge variant="secondary" className="bg-lol-gray-700 text-lol-white flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Coming Soon
                    </Badge>
                  </div>
                )}
                
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${game.gradient}`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-lol-white/60">{game.players}</p>
                      <p className="text-xs text-lol-white/40">{game.genre}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-lol-white">{game.name}</h3>
                    <p className="text-sm text-lol-white/70">{game.description}</p>
                  </div>
                  
                  {game.available && (
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="border-lol-blue text-lol-blue">
                        Available Now
                      </Badge>
                      {isSelected && (
                        <Badge className="bg-lol-gold text-lol-black">
                          Selected
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Continue Button */}
        {selectedGame && (
          <div className="text-center pt-6">
            <Button
              onClick={handleContinue}
              size="lg"
              className="bg-gradient-gold hover:bg-lol-gold-dark text-lol-black font-bold px-8 py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-lol-gold/30"
            >
              Continue to {games.find(g => g.id === selectedGame)?.name}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameSelection; 