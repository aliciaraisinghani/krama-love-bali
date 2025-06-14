import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Shield, Star, TrendingUp, RefreshCw, Clock, MapPin, MessageCircle, Globe, Sword, TreePine, Zap, Target, Users, Settings } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { riotApiService, type PlayerStats, getChampionName, getMostPlayedRole, getMostPlayedRoleFromMatches } from '@/lib/riotApi';
import { PlayerPreferenceTags } from './PlayerPreferenceTags';
import { PreferencesWizard } from './PreferencesWizard';
import { PlayerPreferences, DEFAULT_PREFERENCES } from '@/lib/playerPreferences';
import { PlayerReviews } from './PlayerReviews';

const ProfileTab = () => {
  const { toast } = useToast();
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [playerPreferences, setPlayerPreferences] = useState<PlayerPreferences>(DEFAULT_PREFERENCES);
  const [showPreferencesForm, setShowPreferencesForm] = useState(false);
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);
  
  // Check if we have connected account data on component mount
  useEffect(() => {
    const savedStats = localStorage.getItem('playerStats');
    if (savedStats) {
      try {
        const stats = JSON.parse(savedStats);
        setPlayerStats(stats);
        
        // Debug: Log what data we have
        console.log('Loaded player stats from localStorage:', {
          hasAccount: !!stats.account,
          hasSummoner: !!stats.summoner,
          rankedStatsCount: stats.rankedStats?.length || 0,
          topChampionsCount: stats.topChampions?.length || 0,
          hasRecentMatches: !!stats.recentMatches,
          recentMatchesCount: stats.recentMatches?.length || 0
        });
        
        if (stats.rankedStats?.length > 0) {
          console.log('Available ranked stats:', stats.rankedStats);
        } else {
          console.log('No ranked stats available - player may be unranked or not played ranked this season');
        }
        
        if (stats.topChampions?.length > 0) {
          console.log('Available champion data:', stats.topChampions);
        } else {
          console.log('No champion mastery data available');
        }
        
      } catch (error) {
        console.error('Error parsing saved player stats:', error);
      }
    }

    // Load player preferences
    const savedPreferences = localStorage.getItem('playerPreferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        setPlayerPreferences(preferences);
      } catch (error) {
        console.error('Error parsing saved player preferences:', error);
      }
    } else {
      // If no preferences saved and we have a connected account, show first-time setup
      if (savedStats) {
        // Don't automatically show the form, let user click to set preferences
        setPlayerPreferences(DEFAULT_PREFERENCES);
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

  const handleSavePreferences = (preferences: PlayerPreferences) => {
    setPlayerPreferences(preferences);
    localStorage.setItem('playerPreferences', JSON.stringify(preferences));
    setShowPreferencesForm(false);
    setIsFirstTimeSetup(false);
    
    toast({
      title: isFirstTimeSetup ? "Preferences Set!" : "Preferences Updated",
      description: isFirstTimeSetup 
        ? "Your gaming preferences have been saved. You can edit them anytime from your profile."
        : "Your gaming preferences have been updated successfully.",
    });
  };

  const handleEditPreferences = () => {
    setShowPreferencesForm(true);
  };

  const handleCancelPreferences = () => {
    setShowPreferencesForm(false);
    if (isFirstTimeSetup) {
      // If it's first time setup and they cancel, save default preferences
      setPlayerPreferences(DEFAULT_PREFERENCES);
      localStorage.setItem('playerPreferences', JSON.stringify(DEFAULT_PREFERENCES));
      setIsFirstTimeSetup(false);
    }
  };

  if (!playerStats) {
    return (
      <div className="space-y-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <img 
                src="/ezlfp-logo.png" 
                alt="EZLFP" 
                className="mx-auto h-20 w-auto mb-4 opacity-50"
              />
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
  
  // Try to get role from match history first, fallback to champion mastery
  let mostPlayedRole = 'Unknown';
  if (playerStats.recentMatches && playerStats.recentMatches.length > 0) {
    mostPlayedRole = getMostPlayedRoleFromMatches(playerStats.recentMatches, playerStats.account.puuid);
  } else if (playerStats.topChampions && playerStats.topChampions.length > 0) {
    mostPlayedRole = getMostPlayedRole(playerStats.topChampions);
  }
  
  console.log('Role determination:', {
    hasMatches: !!playerStats.recentMatches?.length,
    hasChampions: !!playerStats.topChampions?.length,
    finalRole: mostPlayedRole
  });

  // Role icon mapping - using downloaded lane icons
  const getRoleIcon = (role: string) => {
    const roleIcons: Record<string, { icon: any; color: string; iconPath?: string }> = {
      'Top Lane': { 
        icon: Sword, 
        color: 'text-red-400',
        iconPath: '/lane-top.png'
      },
      'Jungle': { 
        icon: TreePine, 
        color: 'text-green-400',
        iconPath: '/lane-jungle.png'
      },
      'Mid Lane': { 
        icon: Zap, 
        color: 'text-blue-400',
        iconPath: '/lane-mid.png'
      },
      'Bot Lane': { 
        icon: Target, 
        color: 'text-orange-400',
        iconPath: '/lane-bot.png'
      },
      'Support': { 
        icon: Users, 
        color: 'text-cyan-400',
        iconPath: '/lane-support.png'
      },
      'Unknown': { 
        icon: Users, 
        color: 'text-gray-400'
      }
    };
    
    return roleIcons[role] || roleIcons['Unknown'];
  };

  // Show preferences wizard if requested
  if (showPreferencesForm) {
    return (
      <div className="max-w-4xl mx-auto">
        <PreferencesWizard
          initialPreferences={playerPreferences}
          onComplete={handleSavePreferences}
          onCancel={handleCancelPreferences}
          playerName={playerStats.account.gameName}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Compact Profile Information */}
      <div className="lg:col-span-1 space-y-4">
        {/* Header with Refresh Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Profile</h2>
          <Button 
            onClick={handleRefreshStats}
            disabled={isLoadingStats}
            variant="outline"
            size="default"
            className="border-border/50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingStats ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Player Identity */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-20 w-20">
                <img 
                  src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${playerStats.summoner.profileIconId}.png`}
                  alt="Summoner Icon"
                  className="w-full h-full rounded-full"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <AvatarFallback className="bg-lol-gold/20 text-lol-gold text-xl font-bold hidden">
                  {playerStats.account.gameName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground text-lg truncate">
                  {playerStats.account.gameName}
                </h3>
                <p className="text-sm text-muted-foreground">#{playerStats.account.tagLine}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">NA</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Lv.{playerStats.summoner.summonerLevel}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rank Information */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-blue-400" />
              <h4 className="font-semibold text-base text-foreground">Ranked Solo/Duo</h4>
            </div>
            
            {primaryRank ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-sm px-3 py-1">
                    {primaryRank.tier} {primaryRank.rank}
                  </Badge>
                  <span className="text-sm text-muted-foreground font-medium">{primaryRank.leaguePoints} LP</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Win Rate</p>
                    <p className="font-semibold text-foreground text-lg">
                      {Math.round((primaryRank.wins / (primaryRank.wins + primaryRank.losses)) * 100)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Games</p>
                    <p className="font-semibold text-foreground text-lg">
                      {primaryRank.wins + primaryRank.losses}
                    </p>
                </div>
                </div>
                
                <div className="text-sm">
                  <p className="text-muted-foreground">W/L: {primaryRank.wins}/{primaryRank.losses}</p>
                  {primaryRank.hotStreak && (
                    <Badge variant="outline" className="border-orange-500/30 text-orange-500 text-sm mt-2">
                      🔥 Hot Streak
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Unranked</p>
            )}
          </CardContent>
        </Card>

        {/* Most Played Role */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-lol-gold" />
                <span className="text-base text-muted-foreground">Main Role</span>
              </div>
                            <div className="flex items-center gap-2">
                {(() => {
                  const roleData = getRoleIcon(mostPlayedRole);
                  const IconComponent = roleData.icon;
                  return (
                    <>
                      {roleData.iconPath ? (
                        <img
                          src={roleData.iconPath}
                          alt={`${mostPlayedRole} role icon`}
                          className="w-5 h-5"
                          onError={(e) => {
                            // Fallback to Lucide icon if image fails
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <IconComponent className={`h-5 w-5 ${roleData.color} ${roleData.iconPath ? 'hidden' : ''}`} />
                      <Badge variant="outline" className="border-lol-gold/30 text-lol-gold text-sm px-3 py-1">
                        {mostPlayedRole}
                      </Badge>
                    </>
                  );
                })()}
              </div>
          </div>
        </CardContent>
      </Card>

        {/* Favorite Champions */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Star className="h-5 w-5 text-yellow-400" />
              <h4 className="font-semibold text-base text-foreground">Favorite Champions</h4>
                </div>
            
            {playerStats.topChampions.length > 0 ? (
              <div className="space-y-3">
                {playerStats.topChampions.slice(0, 5).map((champion, index) => (
                  <div key={champion.championId} className="flex items-center justify-between text-sm py-1">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-r from-lol-gold to-lol-gold-dark flex items-center justify-center text-background text-sm font-bold">
                        {index + 1}
                      </span>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <img
                          src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${champion.championId}.png`}
                          alt={getChampionName(champion.championId)}
                          className="w-8 h-8 rounded-full border border-border/50"
                          onError={(e) => {
                            // Fallback to a default icon or hide if champion icon fails to load
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <span className="font-medium text-foreground truncate text-base">
                          {getChampionName(champion.championId)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="h-3 w-3 fill-current" />
                </div>
                </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No champion data available</p>
            )}
            </CardContent>
          </Card>
        </div>

      {/* Right Column - Player Preferences and Additional Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Player Preferences */}
        <div>
          <PlayerPreferenceTags 
            preferences={playerPreferences}
            onEdit={handleEditPreferences}
            showEditButton={true}
              />
            </div>

        {/* Player Reviews with Spider Chart */}
        <PlayerReviews />
            </div>
    </div>
  );
};

export default ProfileTab;
