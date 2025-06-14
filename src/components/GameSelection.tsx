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
      id: 'valorant',
      name: 'Valorant',
      description: 'Tactical 5v5 character-based shooter',
      iconPath: '/Game Icons/valo2.png',
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
      iconPath: '/Game Icons/Marvel Rivals Icons.jpg',
      color: 'blue-500',
      gradient: 'from-blue-500 to-blue-700',
      available: false,
      players: '5M+',
      genre: 'Hero Shooter'
    },
    {
      id: 'lol',
      name: 'League of Legends',
      description: 'The world\'s most popular MOBA',
      iconPath: '/Game Icons/leagueoflegends.png',
      color: 'lol-gold',
      gradient: 'from-lol-gold to-lol-gold-dark',
      available: true,
      players: '180M+',
      genre: 'MOBA'
    },
    {
      id: 'dota2',
      name: 'Dota 2',
      description: 'The ultimate MOBA experience',
      iconPath: '/Game Icons/Dota 2 Icon.jpg',
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
      iconPath: '/Game Icons/Overwatch 2 Icon.jpg',
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
        <div className="grid grid-cols-5 gap-4 max-w-6xl mx-auto">
          {games.map((game) => {
            return (
              <Card
                key={game.id}
                className={`relative cursor-pointer transition-all duration-300 border-2 overflow-hidden rounded-lg h-40 w-32 md:h-48 md:w-36 lg:h-56 lg:w-40 ${
                  game.available 
                    ? `hover:scale-105 hover:shadow-xl border-lol-gray-700 hover:border-lol-gold transform hover:z-10`
                    : 'border-lol-gray-700 opacity-50 grayscale hover:opacity-70'
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
                
                <CardContent className="p-0 h-full">
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src={game.iconPath}
                      alt={`${game.name} icon`}
                      className="w-full h-full object-cover object-center"
                      style={{
                        objectPosition: game.id === 'lol' ? 'center center' : 
                                      game.id === 'valorant' ? 'center center' :
                                      game.id === 'marvel-rivals' ? 'center center' :
                                      game.id === 'dota2' ? 'center center' :
                                      game.id === 'overwatch' ? 'center center' :
                                      'center center'
                      }}
                      onError={(e) => {
                        // Fallback to a gradient background if image fails to load
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        if (target.parentElement) {
                          target.parentElement.className = `w-full h-full bg-gradient-to-br ${game.gradient} flex items-center justify-center`;
                          target.parentElement.innerHTML = `<div class="text-white font-bold text-3xl">${game.name.charAt(0)}</div>`;
                        }
                      }}
                    />
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