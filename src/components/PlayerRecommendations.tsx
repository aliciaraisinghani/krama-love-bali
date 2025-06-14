
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Check, Gamepad2, Trophy, Clock, MapPin } from 'lucide-react';

interface PlayerRecommendationsProps {
  preferences: {
    playStyle: string;
    skillLevel: string;
    communication: string;
    availability: string;
  };
}

const PlayerRecommendations = ({ preferences }: PlayerRecommendationsProps) => {
  // Mock player data
  const recommendedPlayers = [
    {
      id: 1,
      marvelName: "SpiderManic",
      discordName: "SpiderManic#1337",
      age: 24,
      gender: "Male",
      rank: "Diamond II",
      winRate: "67%",
      mainHero: "Spider-Man",
      bio: "Love playing aggressive DPS, always looking for coordinated team plays.",
      matchedPreferences: 4,
      preferences: [
        { text: "Enjoys competitive gameplay with strategic coordination", matched: true },
        { text: "Active during weeknight hours for consistent practice", matched: true },
        { text: "Uses voice chat for better team communication", matched: true },
        { text: "Diamond-level player seeking similar skill teammates", matched: true },
        { text: "Prefers casual conversation during downtime", matched: false }
      ],
      location: "PST",
      languages: ["English", "Spanish"]
    },
    {
      id: 2,
      marvelName: "IronLegend",
      discordName: "IronLegend#4289",
      age: 28,
      gender: "Female",
      rank: "Platinum I",
      winRate: "71%",
      mainHero: "Iron Man",
      bio: "Strategic support player who loves helping teams succeed through coordination.",
      matchedPreferences: 5,
      preferences: [
        { text: "Enjoys competitive gameplay with strategic coordination", matched: true },
        { text: "Active during weeknight hours for consistent practice", matched: true },
        { text: "Uses voice chat for better team communication", matched: true },
        { text: "Experienced player willing to mentor newer teammates", matched: true },
        { text: "Focuses on team strategy over individual performance", matched: true }
      ],
      location: "EST",
      languages: ["English", "French"]
    },
    {
      id: 3,
      marvelName: "StormBreaker",
      discordName: "StormBreaker#9876",
      age: 22,
      gender: "Non-binary",
      rank: "Diamond III",
      winRate: "64%",
      mainHero: "Storm",
      bio: "Versatile player who adapts to team needs. Love experimenting with new strategies.",
      matchedPreferences: 3,
      preferences: [
        { text: "Enjoys competitive gameplay with strategic coordination", matched: true },
        { text: "Active during weeknight hours for consistent practice", matched: false },
        { text: "Uses voice chat for better team communication", matched: true },
        { text: "High-skill player seeking challenging matches", matched: true },
        { text: "Enjoys experimenting with different team compositions", matched: false }
      ],
      location: "CST",
      languages: ["English"]
    }
  ];

  const handleStartGame = (playerName: string) => {
    console.log(`Starting Marvel Rivals with ${playerName}`);
    // TODO: Integrate with Marvel Rivals game launcher
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-2xl text-white flex items-center">
          <Trophy className="mr-2 h-6 w-6 text-teal-400" />
          Recommended Players
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {recommendedPlayers.map((player, index) => (
            <div key={player.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Player Info */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">{player.marvelName}</h3>
                    <Badge className="bg-teal-600 text-white">
                      #{index + 1} Match
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-300">
                      <Gamepad2 className="h-4 w-4 mr-2 text-teal-400" />
                      Discord: {player.discordName}
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Trophy className="h-4 w-4 mr-2 text-teal-400" />
                      Rank: {player.rank} ({player.winRate} WR)
                    </div>
                    <div className="flex items-center text-gray-300">
                      <MapPin className="h-4 w-4 mr-2 text-teal-400" />
                      {player.location} • {player.age} • {player.gender}
                    </div>
                    <div className="text-gray-300">
                      Main: {player.mainHero}
                    </div>
                    <div className="text-gray-300">
                      Languages: {player.languages.join(", ")}
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm">{player.bio}</p>
                  
                  <Button 
                    onClick={() => handleStartGame(player.marvelName)}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    <Gamepad2 className="mr-2 h-4 w-4" />
                    Start Game Together
                  </Button>
                </div>

                {/* Match Score */}
                <div className="text-center">
                  <div className="bg-teal-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">
                      {player.matchedPreferences}/5
                    </span>
                  </div>
                  <p className="text-teal-400 font-semibold">
                    Meets {player.matchedPreferences} of your preferences
                  </p>
                </div>

                {/* Preferences Match */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-300">Preference Match:</h4>
                  {player.preferences.map((pref, prefIndex) => (
                    <div key={prefIndex} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {pref.matched ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-gray-500"></div>
                        )}
                      </div>
                      <p className={`text-sm ${pref.matched ? 'text-gray-300' : 'text-gray-500'}`}>
                        {pref.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerRecommendations;
