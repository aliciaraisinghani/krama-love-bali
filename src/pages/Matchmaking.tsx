import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Users,
  Star,
  Shuffle
} from 'lucide-react';

interface MatchmakingFormData {
  playerType: string;
  champions: string;
  preference: string;
  dealbreakers: string;
}

interface PlayerStats {
  account: {
    gameName: string;
    tagLine: string;
    puuid: string;
  };
  summoner: {
    name: string;
    summonerLevel: number;
    profileIconId: number;
  };
  rankedStats: Array<{
    queueType: string;
    tier: string;
    rank: string;
    leaguePoints: number;
    wins: number;
    losses: number;
  }>;
}

const Matchmaking: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'form' | 'results'>('form');
  const [showDealbreakers, setShowDealbreakers] = useState(false);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [formData, setFormData] = useState<MatchmakingFormData>({
    playerType: '',
    champions: '',
    preference: '',
    dealbreakers: ''
  });

  // Load player stats on component mount
  useEffect(() => {
    const savedStats = localStorage.getItem('playerStats');
    if (savedStats) {
      try {
        const stats = JSON.parse(savedStats);
        setPlayerStats(stats);
      } catch (error) {
        console.error('Error parsing saved player stats:', error);
      }
    }
  }, []);

  const handleSubmit = () => {
    if (formData.playerType && formData.preference) {
      setCurrentStep('results');
    }
  };

  const handleNewSearch = () => {
    setCurrentStep('form');
    setFormData({
      playerType: '',
      champions: '',
      preference: '',
      dealbreakers: ''
    });
  };

  // Get primary rank data
  const getPrimaryRank = () => {
    if (!playerStats?.rankedStats) return null;
    return playerStats.rankedStats.find(rank => rank.queueType === 'RANKED_SOLO_5x5') || null;
  };

  // Calculate win rate
  const getWinRate = () => {
    const primaryRank = getPrimaryRank();
    if (!primaryRank) return 0;
    return Math.round((primaryRank.wins / (primaryRank.wins + primaryRank.losses)) * 100);
  };

  if (currentStep === 'results') {
    const primaryRank = getPrimaryRank();
    const winRate = getWinRate();

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-teal-800 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          {/* VS Layout */}
          <div className="flex items-center justify-center gap-8 mb-8">
            {/* User Profile */}
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <Avatar className="w-32 h-32 border-4 border-blue-400">
                  <img 
                    src={playerStats ? `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${playerStats.summoner.profileIconId}.png` : "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/4.png"}
                    alt="Your Profile"
                    className="w-full h-full rounded-full"
                  />
                  <AvatarFallback className="bg-blue-500 text-white text-2xl">
                    {playerStats ? playerStats.account.gameName.charAt(0).toUpperCase() : 'YOU'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-3 py-1">
                    <Star className="w-4 h-4 mr-1" />
                    {primaryRank ? primaryRank.leaguePoints : '0'}
                  </Badge>
                </div>
              </div>
              <div className="text-center">
                <p className="text-white font-semibold text-lg">
                  {playerStats ? playerStats.account.gameName : 'YourName'}
                </p>
                <div className="flex items-center gap-1 text-white/80 mb-1">
                  <span>🇺🇸</span>
                  <span>NA</span>
                </div>
                {primaryRank && (
                  <div className="text-sm text-white/70">
                    <div>{primaryRank.tier} {primaryRank.rank}</div>
                    <div>{winRate}% WR</div>
                  </div>
                )}
              </div>
            </div>

            {/* Shuffle Icon and Match Percentage */}
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
                <Shuffle className="w-12 h-12 text-white animate-pulse" />
              </div>
              <div className="relative group">
                <div className="text-center cursor-help">
                  <div className="text-3xl font-bold text-green-400">87%</div>
                  <div className="text-sm text-white/60">Match</div>
                </div>
                {/* Hover Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-black/90 text-white text-sm rounded-lg p-4 whitespace-nowrap shadow-xl border border-white/20">
                    <div className="space-y-2">
                      <div className="font-semibold text-green-400 mb-2">Why you match:</div>
                      <div className="flex justify-between gap-4">
                        <span>Similar rank:</span>
                        <span className="text-green-400">+25%</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Complementary roles:</span>
                        <span className="text-green-400">+20%</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Play style match:</span>
                        <span className="text-green-400">+18%</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Similar schedule:</span>
                        <span className="text-green-400">+15%</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Communication pref:</span>
                        <span className="text-green-400">+9%</span>
                      </div>
                      <div className="border-t border-white/20 pt-2 mt-2">
                        <div className="flex justify-between gap-4 font-semibold">
                          <span>Total Match Score:</span>
                          <span className="text-green-400">87%</span>
                        </div>
                      </div>
                    </div>
                    {/* Tooltip Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Matched Profile */}
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <Avatar className="w-32 h-32 border-4 border-pink-400">
                  <img 
                    src="https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/1.png"
                    alt="Matched Player"
                    className="w-full h-full rounded-full"
                  />
                  <AvatarFallback className="bg-pink-500 text-white text-2xl">
                    ?
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-pink-600 text-white px-3 py-1">
                    <Star className="w-4 h-4 mr-1" />
                    2359
                  </Badge>
                </div>
              </div>
              <div className="text-center">
                <p className="text-white font-semibold text-lg">Finding...</p>
                <div className="flex items-center gap-1 text-white/80">
                  <span>🇯🇵</span>
                  <span>JP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search Summary */}
          <div className="text-center mb-8">
            <Card className="bg-black/20 border-white/20 backdrop-blur-sm max-w-2xl mx-auto">
              <CardContent className="p-6">
                <p className="text-white text-lg">
                  Looking for a <Badge variant="outline" className="mx-1 text-lol-gold border-lol-gold">{formData.playerType}</Badge>
                  {formData.champions && (
                    <>
                      {' '}who plays{' '}
                      <Badge variant="outline" className="mx-1 text-lol-blue border-lol-blue">
                        {formData.champions}
                      </Badge>
                    </>
                  )}
                  {' '}and <Badge variant="outline" className="mx-1 text-lol-gold border-lol-gold">{formData.preference}</Badge>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button 
              onClick={handleNewSearch}
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10"
            >
              New Search
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <Users className="w-4 h-4 mr-2" />
              Find a new match
            </Button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lol-black p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-lol-white mb-4">
            Find your dream duo.
          </h1>
          <p className="text-lg text-lol-white/60">
            Tell us what you're looking for and we'll help you find the perfect teammate.
          </p>
        </div>

        {/* Main Form */}
        <Card className="border border-lol-gray-700 shadow-xl bg-lol-gray-800/80 backdrop-blur-sm">
          <CardContent className="p-8">
            {/* 3-Part Prompt - Left-aligned but centered in middle third */}
            <div className="max-w-2xl mx-auto">
              <div className="space-y-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-2xl font-medium text-lol-white leading-relaxed">
                    <span>Find me a</span>
                    <div className="min-w-[180px]">
                      <Input
                        placeholder="type of player"
                        value={formData.playerType}
                        onChange={(e) => setFormData(prev => ({ ...prev, playerType: e.target.value }))}
                        className="h-10 text-lg border-2 border-lol-gold/30 bg-lol-gray-900 text-lol-gold font-medium placeholder:text-lol-gold/50 focus:border-lol-gold rounded-full px-4"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 text-2xl font-medium text-lol-white leading-relaxed">
                    <span>who loves</span>
                    <div className="min-w-[280px]">
                      <Input
                        placeholder="champions or roles"
                        value={formData.champions}
                        onChange={(e) => setFormData(prev => ({ ...prev, champions: e.target.value }))}
                        className="h-10 text-lg border-2 border-pink-400/30 bg-lol-gray-900 text-pink-400 font-medium placeholder:text-pink-400/50 focus:border-pink-400 rounded-full px-4"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 text-2xl font-medium text-lol-white leading-relaxed">
                    <span>and</span>
                    <div className="min-w-[220px]">
                      <Input
                        placeholder="gaming preference"
                        value={formData.preference}
                        onChange={(e) => setFormData(prev => ({ ...prev, preference: e.target.value }))}
                        className="h-10 text-lg border-2 border-lol-blue/30 bg-lol-gray-900 text-lol-blue font-medium placeholder:text-lol-blue/50 focus:border-lol-blue rounded-full px-4"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dealbreakers Section */}
            <div className="mt-12">
              <Collapsible open={showDealbreakers} onOpenChange={setShowDealbreakers}>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full text-lol-white/60 hover:text-lol-white hover:bg-lol-gray-700"
                  >
                    <span className="text-sm">Specify dealbreakers (optional)</span>
                    {showDealbreakers ? (
                      <ChevronUp className="w-4 h-4 ml-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 ml-2" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <Textarea
                    placeholder="e.g., No toxic players, must have mic, no one-tricks..."
                    value={formData.dealbreakers}
                    onChange={(e) => setFormData(prev => ({ ...prev, dealbreakers: e.target.value }))}
                    className="min-h-[100px] border-lol-gray-600 bg-lol-gray-900 text-lol-white placeholder:text-lol-white/50 focus:border-lol-gold focus:ring-lol-gold"
                  />
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Submit Button */}
            <div className="mt-12 text-center">
              <Button 
                onClick={handleSubmit}
                disabled={!formData.playerType || !formData.preference}
                size="lg"
                className="px-12 py-4 text-lg bg-gradient-to-r from-lol-gold to-lol-gold-dark hover:from-lol-gold-dark hover:to-lol-gold text-lol-black font-bold disabled:opacity-50"
              >
                <Search className="w-5 h-5 mr-2" />
                Find My Duo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Matchmaking;
