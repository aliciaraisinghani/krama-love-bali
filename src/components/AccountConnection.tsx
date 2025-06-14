import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Shield, 
  MessageCircle, 
  CheckCircle, 
  Link, 
  User,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { useToast } from './ui/use-toast';
import { riotApiService } from '@/lib/riotApi';
import { PreferencesSetupModal } from './PreferencesSetupModal';
import { PlayerPreferences, DEFAULT_PREFERENCES } from '@/lib/playerPreferences';

// Discord Logo Component  
const DiscordLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

interface AccountConnectionProps {
  onComplete: () => void;
}

const AccountConnection = ({ onComplete }: AccountConnectionProps) => {
  const { toast } = useToast();
  const [connections, setConnections] = useState({
    riot: false,
    discord: false
  });
  const [formData, setFormData] = useState({
    riotId: '',
    riotTag: '',
    discordUsername: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [riotAccountInfo, setRiotAccountInfo] = useState<{
    summonerName: string;
    level: number;
  } | null>(null);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRiotConnect = async () => {
    if (!formData.riotId.trim() || !formData.riotTag.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both your Riot ID and tag",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Verify account exists using Riot API
      const accountExists = await riotApiService.verifyAccount(formData.riotId, formData.riotTag);
      
      if (!accountExists) {
        toast({
          title: "Account Not Found",
          description: `Could not find account ${formData.riotId}#${formData.riotTag}. Please check your Riot ID and tag.`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Get player stats for verification
      const playerStats = await riotApiService.getPlayerStats(formData.riotId, formData.riotTag);
      
      // Save player stats to localStorage for use in ProfileTab
      localStorage.setItem('playerStats', JSON.stringify(playerStats));
      
      setRiotAccountInfo({
        summonerName: playerStats.summoner.name,
        level: playerStats.summoner.summonerLevel
      });

      setConnections(prev => ({ ...prev, riot: true }));
      
      toast({
        title: "Riot Account Connected!",
        description: `Successfully linked ${playerStats.summoner.name} (Level ${playerStats.summoner.summonerLevel})`,
      });
    } catch (error) {
      console.error('Riot API error:', error);
      
      let errorMessage = "Failed to connect account. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes('Account not found')) {
          errorMessage = `Account ${formData.riotId}#${formData.riotTag} not found. Please check your Riot ID and tag.`;
        } else if (error.message.includes('API key')) {
          errorMessage = "Service temporarily unavailable. Please try again later.";
        } else if (error.message.includes('Rate limit')) {
          errorMessage = "Too many requests. Please wait a moment and try again.";
        }
      }
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscordConnect = async () => {
    if (!formData.discordUsername.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your Discord username",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    // Simulate Discord connection (Discord API integration would go here)
    setTimeout(() => {
      setConnections(prev => ({ ...prev, discord: true }));
      setIsLoading(false);
      toast({
        title: "Discord Account Connected!",
        description: `Successfully linked ${formData.discordUsername}`,
      });
    }, 1500);
  };

  const handleContinue = () => {
    if (!connections.riot) {
      toast({
        title: "Riot Account Required",
        description: "Please connect your Riot Games account to continue",
        variant: "destructive",
      });
      return;
    }
    
    // Always show preferences setup after account connection
    setShowPreferencesModal(true);
  };

  const handlePreferencesSave = (preferences: PlayerPreferences) => {
    localStorage.setItem('playerPreferences', JSON.stringify(preferences));
    setShowPreferencesModal(false);
    onComplete();
  };

  const canContinue = connections.riot;

  return (
    <div className="min-h-screen bg-gradient-lol flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <img 
              src="/ezlfp-logo.png" 
              alt="EZLFP" 
              className="w-16 h-auto mr-4"
            />
            <h1 className="text-4xl font-bold text-lol-white">
              Connect Your <span className="text-lol-gold">Accounts</span>
            </h1>
          </div>
          <p className="text-lol-white/70 text-lg max-w-2xl mx-auto">
            Link your gaming accounts to enhance your experience <br /> find the perfect teammates
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Riot Games Connection */}
          <Card className="bg-lol-gray-800/50 border-lol-gray-700">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg">
                  <img 
                    src="/riot-logo.svg" 
                    alt="Riot Games" 
                    className="w-6 h-6 object-cover rounded-sm text-black"
                  />
                </div>
                <div>
                  <CardTitle className="text-lol-white flex items-center gap-2">
                    Riot Games Account
                    {connections.riot && <CheckCircle className="w-5 h-5 text-green-500" />}
                  </CardTitle>
                  <CardDescription className="text-lol-white/60">
                    Connect your League of Legends account
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!connections.riot ? (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="riotId" className="text-lol-white/80">Riot ID</Label>
                      <Input
                        id="riotId"
                        value={formData.riotId}
                        onChange={(e) => handleInputChange('riotId', e.target.value)}
                        className="bg-lol-gray-900 border-lol-gray-600 text-lol-white focus:border-lol-blue"
                        placeholder="YourUsername"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="riotTag" className="text-lol-white/80">Tag</Label>
                      <div className="flex items-center space-x-2">
                        <span className="text-lol-white/60">#</span>
                        <Input
                          id="riotTag"
                          value={formData.riotTag}
                          onChange={(e) => handleInputChange('riotTag', e.target.value.toUpperCase())}
                          className="bg-lol-gray-900 border-lol-gray-600 text-lol-white focus:border-lol-blue"
                          placeholder="TAG"
                          maxLength={5}
                        />
                      </div>
                      <p className="text-xs text-lol-white/40">
                        Enter your Riot ID exactly as shown in game (e.g., PlayerName#1234)
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleRiotConnect}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white"
                  >
                    <Link className="w-4 h-4 mr-2" />
                    {isLoading ? 'Verifying Account...' : 'Connect Riot Account'}
                  </Button>
                  <div className="text-center">
                    <Badge className="bg-lol-gold text-lol-black">Required</Badge>
                  </div>
                  <div className="flex items-start space-x-2 p-3 bg-lol-blue/10 border border-lol-blue/20 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-lol-blue mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-lol-blue">
                      We'll verify your account exists and fetch your stats using the official Riot Games API.
                    </p>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      <div>
                        <p className="text-lol-white font-medium">
                          {riotAccountInfo?.summonerName || `${formData.riotId}#${formData.riotTag}`}
                        </p>
                        <p className="text-lol-white/60 text-sm">
                          {riotAccountInfo ? `Level ${riotAccountInfo.level} • ` : ''}Connected successfully
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-500 text-white">Verified</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Discord Connection */}
          <Card className="bg-lol-gray-800/50 border-lol-gray-700">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg">
                  <DiscordLogo className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lol-white flex items-center gap-2">
                    Discord Account
                    {connections.discord && <CheckCircle className="w-5 h-5 text-green-500" />}
                  </CardTitle>
                  <CardDescription className="text-lol-white/60">
                    Connect for team communication
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!connections.discord ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="discordUsername" className="text-lol-white/80">Discord Username</Label>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-lol-white/60" />
                      <Input
                        id="discordUsername"
                        value={formData.discordUsername}
                        onChange={(e) => handleInputChange('discordUsername', e.target.value)}
                        className="bg-lol-gray-900 border-lol-gray-600 text-lol-white focus:border-lol-blue"
                        placeholder="username#1234"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleDiscordConnect}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full border-indigo-500 text-indigo-400 hover:bg-indigo-500/10"
                  >
                    <DiscordLogo className="w-4 h-4 mr-2" />
                    {isLoading ? 'Connecting...' : 'Connect Discord'}
                  </Button>
                  <div className="text-center">
                    <Badge variant="outline" className="border-lol-white/30 text-lol-white/60">
                      Optional
                    </Badge>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      <div>
                        <p className="text-lol-white font-medium">
                          {formData.discordUsername}
                        </p>
                        <p className="text-lol-white/60 text-sm">Connected successfully</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500 text-white">Connected</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Continue Section */}
        <div className="text-center space-y-4">
          <Separator className="bg-lol-gray-700" />
          <div className="space-y-4">
            <p className="text-lol-white/60">
              {canContinue 
                ? "Great! You're ready to start finding teammates." 
                : "Connect your Riot Games account to continue."}
            </p>
            <Button
              onClick={handleContinue}
              disabled={!canContinue}
              size="lg"
              className="bg-gradient-gold hover:bg-lol-gold-dark text-lol-black font-bold px-8 py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-lol-gold/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {canContinue ? (
                <>
                  Continue to EZLFP
                  <ExternalLink className="w-5 h-5 ml-2" />
                </>
              ) : (
                <>
                  Connect Required Account
                  <Link className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Preferences Setup Modal */}
      <PreferencesSetupModal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        onSave={handlePreferencesSave}
        playerName={riotAccountInfo?.summonerName}
      />
    </div>
  );
};

export default AccountConnection; 