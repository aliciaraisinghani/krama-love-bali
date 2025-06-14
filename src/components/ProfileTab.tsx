import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User, MapPin, Clock, MessageCircle, Save, Edit3, Crown, Shield, Star, TrendingUp } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { riotApiService, type PlayerStats, getChampionName } from '@/lib/riotApi';

const ProfileTab = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [profile, setProfile] = useState({
    riotId: 'SummonerName#TAG',
    discordName: 'player#1234',
    currentRank: 'Unranked',
    peakRank: 'Unranked',
    mainRole: 'ADC',
    secondaryRole: 'Support',
    location: 'North America',
    timezone: 'EST (UTC-5)',
    languages: 'English',
    playstyle: 'Competitive',
    availability: 'Evenings & Weekends',
    bio: 'Experienced ADC main looking for a consistent duo partner to climb ranked. I have great game knowledge and focus on macro play. Looking for someone who communicates well and wants to improve together.',
    favoriteChampions: ['Jinx', 'Caitlyn', 'Kai\'Sa'],
    voiceChat: 'Discord'
  });

  // Load stats when component mounts or when riotId changes
  useEffect(() => {
    const loadPlayerStats = async () => {
      if (!profile.riotId || profile.riotId === 'SummonerName#TAG') return;
      
      const [gameName, tagLine] = profile.riotId.split('#');
      if (!gameName || !tagLine) return;

      setIsLoadingStats(true);
      try {
        const stats = await riotApiService.getPlayerStats(gameName, tagLine);
        setPlayerStats(stats);
        
        // Update profile with fetched data
        const soloQueueData = stats.rankedStats.find(r => r.queueType === 'RANKED_SOLO_5x5');
        const flexQueueData = stats.rankedStats.find(r => r.queueType === 'RANKED_FLEX_SR');
        
        setProfile(prev => ({
          ...prev,
          currentRank: soloQueueData ? `${soloQueueData.tier} ${soloQueueData.rank}` : 'Unranked',
          peakRank: soloQueueData ? `${soloQueueData.tier} ${soloQueueData.rank}` : 'Unranked', // In a real app, you'd track this separately
        }));
      } catch (error) {
        console.error('Failed to load player stats:', error);
        toast({
          title: "Failed to Load Stats",
          description: "Could not fetch player statistics. Please check your Riot ID.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadPlayerStats();
  }, [profile.riotId, toast]);

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Basic validation
    if (!profile.riotId.trim()) {
      toast({
        title: "Validation Error",
        description: "Riot ID is required",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Saving profile:', profile);
    setIsEditing(false);
    toast({
      title: "Profile Saved",
      description: "Your League profile has been updated successfully!",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original values in a real app
  };

  const handleRefreshStats = async () => {
    const [gameName, tagLine] = profile.riotId.split('#');
    if (!gameName || !tagLine) {
      toast({
        title: "Invalid Riot ID",
        description: "Please enter a valid Riot ID in the format Name#TAG",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingStats(true);
    try {
      const stats = await riotApiService.getPlayerStats(gameName, tagLine);
      setPlayerStats(stats);
      
      const soloQueueData = stats.rankedStats.find(r => r.queueType === 'RANKED_SOLO_5x5');
      setProfile(prev => ({
        ...prev,
        currentRank: soloQueueData ? `${soloQueueData.tier} ${soloQueueData.rank}` : 'Unranked',
      }));

      toast({
        title: "Stats Refreshed",
        description: "Player statistics have been updated from Riot Games API",
      });
    } catch (error) {
      toast({
        title: "Failed to Refresh Stats",
        description: "Could not fetch updated statistics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  const ranks = [
    'Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster', 'Challenger'
  ];

  const roles = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];

  const getRankedStats = () => {
    if (!playerStats) return null;
    
    const soloQueue = playerStats.rankedStats.find(r => r.queueType === 'RANKED_SOLO_5x5');
    const flexQueue = playerStats.rankedStats.find(r => r.queueType === 'RANKED_FLEX_SR');
    
    return { soloQueue, flexQueue };
  };

  const rankedStats = getRankedStats();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <Card className="bg-gradient-to-r from-lol-gray-800 to-lol-gray-900 border-lol-gray-700 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center space-x-6">
            <Avatar className="w-20 h-20 border-2 border-lol-gold">
              <AvatarFallback className="bg-gradient-gold text-lol-black text-xl font-bold">
                {(playerStats?.summoner.name || profile.riotId.split('#')[0]).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-lol-white">
                  {playerStats?.summoner.name || profile.riotId}
                </h2>
                {playerStats && (
                  <Badge variant="outline" className="border-lol-blue text-lol-blue">
                    Level {playerStats.summoner.summonerLevel}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-lol-white/70">
                <div className="flex items-center gap-1">
                  <Crown className="w-4 h-4" />
                  {profile.currentRank}
                </div>
                {rankedStats?.soloQueue && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {rankedStats.soloQueue.wins}W / {rankedStats.soloQueue.losses}L
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {profile.location}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {profile.timezone}
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {profile.discordName}
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Badge className="bg-lol-blue text-white">
                  {profile.mainRole}
                </Badge>
                <Badge variant="outline" className="border-lol-blue text-lol-blue">
                  {profile.secondaryRole}
                </Badge>
                <Badge variant="outline" className="border-lol-gray-600 text-lol-white/60">
                  {profile.playstyle}
                </Badge>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant="outline"
                className="border-lol-gold text-lol-gold hover:bg-lol-gold hover:text-lol-black"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
              <Button
                onClick={handleRefreshStats}
                disabled={isLoadingStats}
                variant="outline"
                size="sm"
                className="border-lol-blue text-lol-blue hover:bg-lol-blue hover:text-white"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                {isLoadingStats ? 'Loading...' : 'Refresh Stats'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Stats Display */}
      {playerStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Ranked Stats */}
          {rankedStats?.soloQueue && (
            <Card className="bg-lol-gray-800/50 border-lol-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-lol-white flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Solo/Duo Ranked
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-lol-white/60">Rank:</span>
                    <span className="text-lol-white font-medium">
                      {rankedStats.soloQueue.tier} {rankedStats.soloQueue.rank}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-lol-white/60">LP:</span>
                    <span className="text-lol-white font-medium">{rankedStats.soloQueue.leaguePoints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-lol-white/60">W/L:</span>
                    <span className="text-lol-white font-medium">
                      {rankedStats.soloQueue.wins}/{rankedStats.soloQueue.losses}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-lol-white/60">Win Rate:</span>
                    <span className="text-lol-white font-medium">
                      {Math.round((rankedStats.soloQueue.wins / (rankedStats.soloQueue.wins + rankedStats.soloQueue.losses)) * 100)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Champion Mastery */}
          {playerStats.topChampions.length > 0 && (
            <Card className="bg-lol-gray-800/50 border-lol-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-lol-white flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Top Champions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {playerStats.topChampions.slice(0, 3).map((champ, index) => (
                    <div key={champ.championId} className="flex justify-between items-center">
                      <span className="text-lol-white/80 text-sm">
                        {getChampionName(champ.championId)}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs border-lol-gold text-lol-gold">
                          M{champ.championLevel}
                        </Badge>
                        <span className="text-xs text-lol-white/60">
                          {(champ.championPoints / 1000).toFixed(0)}k
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Info */}
          <Card className="bg-lol-gray-800/50 border-lol-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-lol-white flex items-center gap-2">
                <User className="w-4 h-4" />
                Account Info
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-lol-white/60">Level:</span>
                  <span className="text-lol-white font-medium">{playerStats.summoner.summonerLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-lol-white/60">Server:</span>
                  <span className="text-lol-white font-medium">NA1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-lol-white/60">Last Updated:</span>
                  <span className="text-lol-white font-medium text-xs">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Profile Form */}
      <Card className="bg-lol-gray-800/50 border-lol-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-lol-white flex items-center">
            <User className="w-5 h-5 mr-2" />
            League of Legends Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="riotId" className="text-lol-white/80 font-medium">
                Riot ID *
              </Label>
              <Input
                id="riotId"
                value={profile.riotId}
                onChange={(e) => handleInputChange('riotId', e.target.value)}
                disabled={!isEditing}
                className="bg-lol-gray-900 border-lol-gray-600 text-lol-white focus:border-lol-blue disabled:opacity-70"
                placeholder="YourName#TAG"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discordName" className="text-lol-white/80 font-medium">
                Discord Username
              </Label>
              <Input
                id="discordName"
                value={profile.discordName}
                onChange={(e) => handleInputChange('discordName', e.target.value)}
                disabled={!isEditing}
                className="bg-lol-gray-900 border-lol-gray-600 text-lol-white focus:border-lol-blue disabled:opacity-70"
                placeholder="username#1234"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentRank" className="text-lol-white/80 font-medium">
                Current Rank
                {playerStats && <span className="text-xs text-lol-blue ml-2">(Auto-updated from API)</span>}
              </Label>
              <Select 
                value={profile.currentRank} 
                onValueChange={(value) => handleInputChange('currentRank', value)} 
                disabled={!isEditing || !!playerStats}
              >
                <SelectTrigger className="bg-lol-gray-900 border-lol-gray-600 text-lol-white focus:border-lol-blue disabled:opacity-70">
                  <SelectValue placeholder="Select your current rank" />
                </SelectTrigger>
                <SelectContent className="bg-lol-gray-900 border-lol-gray-600">
                  {ranks.map((rank) => (
                    <SelectItem key={rank} value={rank} className="text-lol-white hover:bg-lol-gray-800">
                      {rank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="peakRank" className="text-lol-white/80 font-medium">Peak Rank</Label>
              <Select value={profile.peakRank} onValueChange={(value) => handleInputChange('peakRank', value)} disabled={!isEditing}>
                <SelectTrigger className="bg-lol-gray-900 border-lol-gray-600 text-lol-white focus:border-lol-blue disabled:opacity-70">
                  <SelectValue placeholder="Select your peak rank" />
                </SelectTrigger>
                <SelectContent className="bg-lol-gray-900 border-lol-gray-600">
                  {ranks.map((rank) => (
                    <SelectItem key={rank} value={rank} className="text-lol-white hover:bg-lol-gray-800">
                      {rank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mainRole" className="text-lol-white/80 font-medium">Main Role</Label>
              <Select value={profile.mainRole} onValueChange={(value) => handleInputChange('mainRole', value)} disabled={!isEditing}>
                <SelectTrigger className="bg-lol-gray-900 border-lol-gray-600 text-lol-white focus:border-lol-blue disabled:opacity-70">
                  <SelectValue placeholder="Select your main role" />
                </SelectTrigger>
                <SelectContent className="bg-lol-gray-900 border-lol-gray-600">
                  {roles.map((role) => (
                    <SelectItem key={role} value={role} className="text-lol-white hover:bg-lol-gray-800">
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryRole" className="text-lol-white/80 font-medium">Secondary Role</Label>
              <Select value={profile.secondaryRole} onValueChange={(value) => handleInputChange('secondaryRole', value)} disabled={!isEditing}>
                <SelectTrigger className="bg-lol-gray-900 border-lol-gray-600 text-lol-white focus:border-lol-blue disabled:opacity-70">
                  <SelectValue placeholder="Select your secondary role" />
                </SelectTrigger>
                <SelectContent className="bg-lol-gray-900 border-lol-gray-600">
                  {roles.map((role) => (
                    <SelectItem key={role} value={role} className="text-lol-white hover:bg-lol-gray-800">
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-lol-white/80 font-medium">Server/Region</Label>
              <Input
                id="location"
                value={profile.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                disabled={!isEditing}
                className="bg-lol-gray-900 border-lol-gray-600 text-lol-white focus:border-lol-blue disabled:opacity-70"
                placeholder="e.g., North America, EUW, EUNE"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-lol-white/80 font-medium">Time Zone</Label>
              <Input
                id="timezone"
                value={profile.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                disabled={!isEditing}
                className="bg-lol-gray-900 border-lol-gray-600 text-lol-white focus:border-lol-blue disabled:opacity-70"
                placeholder="e.g., PST, EST, GMT+1"
              />
            </div>
          </div>

          <Separator className="bg-lol-gray-700" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="availability" className="text-lol-white/80 font-medium">
                Availability
              </Label>
              <Input
                id="availability"
                value={profile.availability}
                onChange={(e) => handleInputChange('availability', e.target.value)}
                disabled={!isEditing}
                className="bg-lol-gray-900 border-lol-gray-600 text-lol-white focus:border-lol-blue disabled:opacity-70"
                placeholder="e.g., Evenings, Weekends, 6-10 PM EST"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="languages" className="text-lol-white/80 font-medium">
                Languages
              </Label>
              <Input
                id="languages"
                value={profile.languages}
                onChange={(e) => handleInputChange('languages', e.target.value)}
                disabled={!isEditing}
                className="bg-lol-gray-900 border-lol-gray-600 text-lol-white focus:border-lol-blue disabled:opacity-70"
                placeholder="Languages you speak"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-lol-white/80 font-medium">
              About Me & Playstyle
            </Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              disabled={!isEditing}
              className="bg-lol-gray-900 border-lol-gray-600 text-lol-white focus:border-lol-blue disabled:opacity-70 min-h-[120px] resize-none"
              placeholder="Tell other players about your playstyle, goals, what you're looking for in a duo partner, communication style, etc."
            />
          </div>

          {isEditing && (
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSave}
                className="bg-gradient-blue hover:bg-lol-blue-dark text-white flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button 
                onClick={handleCancel}
                variant="outline"
                className="border-lol-gray-600 text-lol-white/80 hover:bg-lol-gray-700"
              >
                Cancel
              </Button>
            </div>
          )}

          {!isEditing && (
            <div className="pt-4 text-center">
              <p className="text-sm text-lol-white/40">
                Click "Edit Profile" to update your League of Legends profile
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileTab;
