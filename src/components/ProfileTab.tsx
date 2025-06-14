import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Crown, Shield, Star, TrendingUp, RefreshCw, Clock, MapPin, MessageCircle, Globe } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { riotApiService, type PlayerStats, getChampionName, getMostPlayedRole } from '@/lib/riotApi';

const ProfileTab = () => {
  const { toast } = useToast();
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  
  // Check if we have connected account data on component mount
  useEffect(() => {
    const savedStats = localStorage.getItem('playerStats');
    if (savedStats) {
      try {
        setPlayerStats(JSON.parse(savedStats));
      } catch (error) {
        console.error('Error parsing saved player stats:', error);
      }
    }
  }, []);

  const handleRefreshStats = async () => {
    if (!playerStats?.account) {
      toast({
        title: "No Account Connected",
        description: "Please connect your Riot account first to refresh stats.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingStats(true);
    try {
      const stats = await riotApiService.getPlayerStats(
        playerStats.account.gameName, 
        playerStats.account.tagLine
      );
      setPlayerStats(stats);
      localStorage.setItem('playerStats', JSON.stringify(stats));
      
      toast({
        title: "Stats Updated",
        description: "Your League of Legends stats have been refreshed successfully.",
      });
    } catch (error) {
      console.error('Error refreshing stats:', error);
      toast({
        title: "Error",
        description: "Failed to refresh stats. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  if (!playerStats) {
    return (
      <div className="space-y-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Crown className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Profile Connected</h3>
              <p className="text-muted-foreground">
                Connect your League of Legends account to view your profile information.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const primaryRank = playerStats.rankedStats.find(rank => rank.queueType === 'RANKED_SOLO_5x5');
  const mostPlayedRole = getMostPlayedRole(playerStats.topChampions);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Compact Profile Information */}
      <div className="lg:col-span-1 space-y-4">
        {/* Header with Refresh Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-foreground">Profile</h2>
          <Button 
            onClick={handleRefreshStats}
            disabled={isLoadingStats}
            variant="outline"
            size="sm"
            className="border-border/50"
          >
            <RefreshCw className={`h-3 w-3 ${isLoadingStats ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Player Identity */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-lol-gold/20 text-lol-gold text-sm font-bold">
                  {playerStats.account.gameName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground text-sm truncate">
                  {playerStats.account.gameName}
                </h3>
                <p className="text-xs text-muted-foreground">#{playerStats.account.tagLine}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Globe className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">NA</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Lv.{playerStats.summoner.summonerLevel}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rank Information */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-blue-400" />
              <h4 className="font-semibold text-sm text-foreground">Ranked Solo/Duo</h4>
            </div>
            
            {primaryRank ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-xs">
                    {primaryRank.tier} {primaryRank.rank}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{primaryRank.leaguePoints} LP</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Win Rate</p>
                    <p className="font-semibold text-foreground">
                      {Math.round((primaryRank.wins / (primaryRank.wins + primaryRank.losses)) * 100)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Games</p>
                    <p className="font-semibold text-foreground">
                      {primaryRank.wins + primaryRank.losses}
                    </p>
                  </div>
                </div>
                
                <div className="text-xs">
                  <p className="text-muted-foreground">W/L: {primaryRank.wins}/{primaryRank.losses}</p>
                  {primaryRank.hotStreak && (
                    <Badge variant="outline" className="border-orange-500/30 text-orange-500 text-xs mt-1">
                      🔥 Hot Streak
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Unranked</p>
            )}
          </CardContent>
        </Card>

        {/* Most Played Role */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-lol-gold" />
                <span className="text-sm text-muted-foreground">Main Role</span>
              </div>
              <Badge variant="outline" className="border-lol-gold/30 text-lol-gold text-xs">
                {mostPlayedRole}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Top Champions Compact */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-4 w-4 text-yellow-400" />
              <h4 className="font-semibold text-sm text-foreground">Top Champions</h4>
            </div>
            
            {playerStats.topChampions.length > 0 ? (
              <div className="space-y-2">
                {playerStats.topChampions.slice(0, 5).map((champion, index) => (
                  <div key={champion.championId} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="w-4 h-4 rounded-full bg-gradient-to-r from-lol-gold to-lol-gold-dark flex items-center justify-center text-background text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="font-medium text-foreground truncate">
                        {getChampionName(champion.championId)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="h-2 w-2 fill-current" />
                      <span className="text-xs">M{champion.championLevel}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No mastery data</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                </div>
                <p className="text-lg font-bold text-foreground">{playerStats.summoner.summonerLevel}</p>
                <p className="text-xs text-muted-foreground">Level</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="h-3 w-3 text-muted-foreground" />
                </div>
                <p className="text-lg font-bold text-foreground">{playerStats.topChampions.length}</p>
                <p className="text-xs text-muted-foreground">Champions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Additional Content Space */}
      <div className="lg:col-span-2">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full">
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Additional Stats</h3>
                <p className="text-muted-foreground">
                  More detailed statistics and match history will be displayed here.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileTab;
