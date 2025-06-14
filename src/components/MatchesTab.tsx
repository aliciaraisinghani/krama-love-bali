
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { MessageCircle, Gamepad2, Calendar } from 'lucide-react';

const MatchesTab = () => {
  const matches = [
    {
      id: 1,
      marvelName: "SpiderManic",
      discordName: "SpiderManic#1337",
      lastPlayed: "2 hours ago",
      gamesPlayed: 12,
      winRate: "75%",
      status: "online"
    },
    {
      id: 2,
      marvelName: "IronLegend",
      discordName: "IronLegend#4289",
      lastPlayed: "1 day ago",
      gamesPlayed: 8,
      winRate: "67%",
      status: "away"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Your Gaming Partners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {matches.map((match) => (
              <div key={match.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      match.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{match.marvelName}</h3>
                      <p className="text-gray-400 text-sm">{match.discordName}</p>
                      <p className="text-gray-500 text-xs">
                        {match.gamesPlayed} games together • {match.winRate} win rate
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                    <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                      <Gamepad2 className="h-4 w-4 mr-1" />
                      Play
                    </Button>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center text-gray-400 text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  Last played: {match.lastPlayed}
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
