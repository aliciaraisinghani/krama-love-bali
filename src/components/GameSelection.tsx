import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Target, 
  Sword, 
  Shield, 
  Zap,
  ArrowRight,
  Clock,
  Star
} from 'lucide-react';
import { useToast } from './ui/use-toast';

interface GameSelectionProps {
  onGameSelect: (game: string) => void;
}

const GameSelection = ({ onGameSelect }: GameSelectionProps) => {
  const { toast } = useToast();

  const games = [
    {
      id: 'lol',
      name: 'League of Legends',
      description: 'The world\'s most popular MOBA',
      icon: Star,
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
    
    // Immediately proceed to next step for available games
    onGameSelect(game.id);
  };

  return (
    <div className="min-h-screen bg-gradient-lol flex items-center justify-center p-4">
      <div className="w-full max-w-7xl space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-lol-white">
            Choose Your <span className="text-lol-gold">Game</span>
          </h1>
          <p className="text-lol-white/70 text-lg max-w-2xl mx-auto">
            Select your preferred game to find teammates and start your journey to victory
          </p>
        </div>

        {/* Game Grid - Single Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
          {games.map((game) => {
            const Icon = game.icon;
            
            return (
              <Card
                key={game.id}
                className={`relative cursor-pointer transition-all duration-300 border-2 overflow-hidden ${
                  game.available 
                    ? `hover:scale-110 hover:shadow-xl border-lol-gray-700 hover:border-lol-gold bg-lol-gray-800/50 hover:bg-lol-gray-700/70 transform hover:z-10`
                    : 'border-lol-gray-700 bg-lol-gray-800/30 opacity-75 hover:opacity-90'
                }`}
                onClick={() => handleGameClick(game)}
              >
                {!game.available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                    <Badge variant="secondary" className="bg-lol-gray-700 text-lol-white flex items-center gap-1 text-xs">
                      <Clock className="w-3 h-3" />
                      Coming Soon
                    </Badge>
                  </div>
                )}
                
                <CardContent className="p-4 h-full flex flex-col justify-between space-y-3">
                  <div className="text-center space-y-2">
                    <div className={`mx-auto w-12 h-12 rounded-lg bg-gradient-to-br ${game.gradient} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-lol-white leading-tight">{game.name}</h3>
                      <p className="text-xs text-lol-white/60 mt-1">{game.genre}</p>
                    </div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <p className="text-xs text-lol-white/70">{game.description}</p>
                    
                    <div className="flex flex-col items-center gap-1">
                      <Badge variant="outline" className="text-xs border-lol-blue text-lol-blue">
                        {game.players}
                      </Badge>
                      
                      {game.available && (
                        <Badge className="bg-lol-gold text-lol-black text-xs">
                          Available
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Text */}
        <div className="text-center">
          <p className="text-lol-white/50 text-sm">
            Click on an available game to get started. More games coming soon!
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameSelection; 