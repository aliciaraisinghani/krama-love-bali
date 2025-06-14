import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
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
  Crown,
  User,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { useToast } from './ui/use-toast';
import { riotApiService } from '@/lib/riotApi';

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
    onComplete();
  };

  const canContinue = connections.riot;

  return (
    <div className="min-h-screen bg-gradient-lol flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <Crown className="w-12 h-12 text-lol-gold mr-4" />
            <h1 className="text-4xl font-bold text-lol-white">
              Connect Your <span className="text-lol-gold">Accounts</span>
            </h1>
          </div>
          <p className="text-lol-white/70 text-lg max-w-2xl mx-auto">
            Link your gaming accounts to enhance your experience and find the perfect teammates
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Riot Games Connection */}
          <Card className="bg-lol-gray-800/50 border-lol-gray-700">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-red-500 to-red-700 rounded-lg">
                  <Shield className="w-6 h-6 text-white" />
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
                  <MessageCircle className="w-6 h-6 text-white" />
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
                    <MessageCircle className="w-4 h-4 mr-2" />
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
                  Continue to League Hub
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
    </div>
  );
};

export default AccountConnection; 