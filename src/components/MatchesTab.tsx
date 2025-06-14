import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MessageCircle, Gamepad2, Calendar, Star, Trophy, MessageSquare } from 'lucide-react';
import { ReviewDialog } from './ReviewDialog';

const MatchesTab = () => {
  const matches = [
    {
      id: 1,
      playerName: "ShadowStrike92",
      discordName: "ShadowStrike92#1337",
      lastPlayed: "2 hours ago",
      gamesPlayed: 47,
      winRate: "78%",
      status: "online",
      rank: "Gold II",
      mainRole: "Bot Lane",
      favoriteChamp: "Jinx"
    },
    {
      id: 2,
      playerName: "MysticSupport",
      discordName: "MysticSupport#4289",
      lastPlayed: "5 hours ago",
      gamesPlayed: 23,
      winRate: "65%",
      status: "online",
      rank: "Silver I",
      mainRole: "Support",
      favoriteChamp: "Thresh"
    },
    {
      id: 3,
      playerName: "JungleKingXX",
      discordName: "JungleKingXX#7721",
      lastPlayed: "1 day ago",
      gamesPlayed: 89,
      winRate: "82%",
      status: "away",
      rank: "Platinum IV",
      mainRole: "Jungle",
      favoriteChamp: "Graves"
    },
    {
      id: 4,
      playerName: "MidLaneMage",
      discordName: "MidLaneMage#2156",
      lastPlayed: "3 days ago",
      gamesPlayed: 15,
      winRate: "60%",
      status: "offline",
      rank: "Gold III",
      mainRole: "Mid Lane",
      favoriteChamp: "Azir"
    },
    {
      id: 5,
      playerName: "TopLaneCarry",
      discordName: "TopLaneCarry#9988",
      lastPlayed: "12 hours ago",
      gamesPlayed: 34,
      winRate: "71%",
      status: "online",
      rank: "Gold I",
      mainRole: "Top Lane",
      favoriteChamp: "Darius"
    },
    {
      id: 6,
      playerName: "FlashBangGG",
      discordName: "FlashBangGG#3344",
      lastPlayed: "6 hours ago",
      gamesPlayed: 67,
      winRate: "69%",
      status: "away",
      rank: "Silver II",
      mainRole: "Bot Lane",
      favoriteChamp: "Vayne"
    },
    {
      id: 7,
      playerName: "WardMaster",
      discordName: "WardMaster#5577",
      lastPlayed: "2 days ago",
      gamesPlayed: 156,
      winRate: "74%",
      status: "offline",
      rank: "Platinum III",
      mainRole: "Support",
      favoriteChamp: "Nautilus"
    },
    {
      id: 8,
      playerName: "CriticalHit99",
      discordName: "CriticalHit99#8899",
      lastPlayed: "4 hours ago",
      gamesPlayed: 28,
      winRate: "57%",
      status: "online",
      rank: "Bronze I",
      mainRole: "Bot Lane",
      favoriteChamp: "Caitlyn"
    },
    {
      id: 9,
      playerName: "SpellThief",
      discordName: "SpellThief#1122",
      lastPlayed: "1 hour ago",
      gamesPlayed: 92,
      winRate: "76%",
      status: "online",
      rank: "Gold IV",
      mainRole: "Mid Lane",
      favoriteChamp: "Yasuo"
    },
    {
      id: 10,
      playerName: "TankCommander",
      discordName: "TankCommander#6633",
      lastPlayed: "8 hours ago",
      gamesPlayed: 41,
      winRate: "68%",
      status: "away",
      rank: "Silver III",
      mainRole: "Top Lane",
      favoriteChamp: "Malphite"
    },
    {
      id: 11,
      playerName: "AssassinPro",
      discordName: "AssassinPro#4455",
      lastPlayed: "1 week ago",
      gamesPlayed: 73,
      winRate: "81%",
      status: "offline",
      rank: "Platinum II",
      mainRole: "Jungle",
      favoriteChamp: "Kha'Zix"
    },
    {
      id: 12,
      playerName: "HealBot2000",
      discordName: "HealBot2000#7788",
      lastPlayed: "30 minutes ago",
      gamesPlayed: 19,
      winRate: "63%",
      status: "online",
      rank: "Gold II",
      mainRole: "Support",
      favoriteChamp: "Soraka"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getRankColor = (rank: string) => {
    if (rank.includes('Bronze')) return 'text-amber-600';
    if (rank.includes('Silver')) return 'text-gray-400';
    if (rank.includes('Gold')) return 'text-yellow-400';
    if (rank.includes('Platinum')) return 'text-cyan-400';
    if (rank.includes('Diamond')) return 'text-blue-400';
    return 'text-gray-400';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="bg-lol-gray-800/50 border-lol-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-lol-white flex items-center gap-2">
            <Trophy className="h-6 w-6 text-lol-gold" />
            Duo History
          </CardTitle>
          <p className="text-lol-white/60">Your previous gaming partners and match history</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {matches.map((match) => (
              <div key={match.id} className="bg-lol-gray-900/50 rounded-lg p-4 border border-lol-gray-600 hover:border-lol-gold/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(match.status)}`}></div>
                    <div>
                      <h3 className="text-lg font-semibold text-lol-white">{match.playerName}</h3>
                      <p className="text-lol-white/60 text-sm">{match.discordName}</p>
                    </div>
                  </div>
                  <Badge className={`${getRankColor(match.rank)} bg-transparent border-current`}>
                    {match.rank}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 mb-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-lol-gold" />
                    <span className="text-lol-white/80">{match.mainRole}</span>
                  </div>
                  <div className="text-lol-white/60">
                    {match.favoriteChamp}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-lol-white/60">
                    <span className="text-lol-white font-medium">{match.gamesPlayed}</span> games • 
                    <span className="text-green-400 font-medium ml-1">{match.winRate}</span> win rate
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-lol-white/50 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    {match.lastPlayed}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="border-lol-gray-600 text-lol-white/80 hover:text-lol-white hover:border-lol-blue">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                    <ReviewDialog
                      playerName={match.playerName}
                      gamesPlayed={match.gamesPlayed}
                      trigger={
                        <Button variant="outline" size="sm" className="border-lol-gray-600 text-lol-white/80 hover:text-lol-white hover:border-yellow-400">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      }
                    />
                    <Button size="sm" className="bg-lol-gold hover:bg-lol-gold-dark text-lol-black font-medium">
                      <Gamepad2 className="h-4 w-4 mr-1" />
                      Play Again
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchesTab;
