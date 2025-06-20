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
  Shuffle,
  Loader2,
  ExternalLink,
  X,
  Check,
  MessageCircle,
  Send,
  Clock,
  AlertCircle,
  RotateCcw,
  ThumbsDown,
  Gamepad2,
  UserCheck
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Discord Logo Component
const DiscordLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

interface MatchmakingFormData {
  playerType: string;
  champions: string;
  preference: string;
  dealbreakers: string;
  gameMode: 'ranked' | 'casual' | '';
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

interface SearchResult {
  rank: number;
  similarity_score: number;
  riot_id: string;
  bio: string;
  stats: {
    primary_role: string;
    most_played_champions: string[];
    avg_cs_per_minute: number;
  };
  descriptions: {
    comprehensive: string;
    playstyle: string;
    compatibility: string;
    cons: string;
  };
  analysis: {
    champion_pool_size: number;
    champion_diversity_score: number;
    aggressive_tendency: number;
    mechanical_skill_level: number;
    pace_preference: string;
    performance_trend: string;
    recent_champion_shifts: string[];
  };
  champion_details: Array<{
    name: string;
    games_played: number;
    win_rate: number;
    avg_kda: string;
    avg_cs: number;
    recent_games: number;
    playstyle_tags: string[];
    difficulty_tier: string;
    meta_status: string;
  }>;
  embedding_preview: string;
}

interface SearchResponse {
  results: SearchResult[];
  total_players: number;
  search_time: number;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'match';
  message: string;
  timestamp: Date;
}

interface PlayerReview {
  id: string;
  reviewerName: string;
  date: string;
  ratings: {
    fun: number;
    helpful: number;
    leader: number;
    toxic: number;
    troll: number;
    chill: number;
  };
  comment?: string;
  gamesPlayed: number;
}

// API service for matchmaking
const matchmakingApi = {
  async searchPlayers(query: string): Promise<SearchResponse> {
    const response = await fetch('http://localhost:8000/players/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
};

const Matchmaking: React.FC = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<'form' | 'results' | 'loading' | 'timeout' | 'chat'>('form');
  const [showDealbreakers, setShowDealbreakers] = useState(false);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [isLoadingNextMatch, setIsLoadingNextMatch] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<SearchResult | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userAccepted, setUserAccepted] = useState(false);
  const [matchAccepted, setMatchAccepted] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [userRejectedMatch, setUserRejectedMatch] = useState(false);
  const [readyToPlay, setReadyToPlay] = useState(false);
  const [isLoadingNewMatch, setIsLoadingNewMatch] = useState(false);
  const [formData, setFormData] = useState<MatchmakingFormData>({
    playerType: '',
    champions: '',
    preference: '',
    dealbreakers: '',
    gameMode: ''
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

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (timerActive && timeLeft > 0 && currentStep === 'results') {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && currentStep === 'results') {
      // Time's up!
      setCurrentStep('timeout');
      setTimerActive(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timerActive, timeLeft, currentStep]);

  const buildSearchQuery = (): string => {
    const parts = [];
    
    if (formData.playerType) {
      parts.push(formData.playerType);
    }
    
    if (formData.champions) {
      parts.push(`who plays ${formData.champions}`);
    }
    
    if (formData.preference) {
      parts.push(formData.preference);
    }

    if (formData.gameMode) {
      parts.push(`for ${formData.gameMode} games`);
    }
    
    if (formData.dealbreakers) {
      parts.push(`but not ${formData.dealbreakers}`);
    }
    
    return parts.join(' ');
  };

  const handleSubmit = async () => {
    if (formData.playerType && formData.preference) {
      setIsSearching(true);
      
      try {
        const searchQuery = buildSearchQuery();
        console.log('Searching with query:', searchQuery);
        
        const response = await matchmakingApi.searchPlayers(searchQuery);
        
        console.log('Search results:', response);
        console.log('Found players:', response.results);
        console.log('Total players searched:', response.total_players);
        
        setSearchResults(response.results);
        setCurrentResultIndex(0);
        setCurrentMatch(response.results[0] || null);
        setCurrentStep('results');
        setTimeLeft(30);
        setTimerActive(true);
        
        toast({
          title: "Search Complete!",
          description: `Found ${response.results.length} potential matches`,
        });
        
      } catch (error) {
        console.error('Error searching for players:', error);
        toast({
          title: "Search Failed",
          description: "Could not connect to the matchmaking service. Make sure the backend is running on port 8000.",
          variant: "destructive",
        });
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleNewSearch = () => {
    setCurrentStep('form');
    setSearchResults([]);
    setCurrentResultIndex(0);
    setCurrentMatch(null);
    setTimerActive(false);
    setTimeLeft(30);
    setChatMessages([]);
    setUserAccepted(false);
    setMatchAccepted(false);
    setShowChat(false);
    setUserRejectedMatch(false);
    setReadyToPlay(false);
    setIsLoadingNewMatch(false);
    setFormData({
      playerType: '',
      champions: '',
      preference: '',
      dealbreakers: '',
      gameMode: ''
    });
  };

  const handleFindNewMatch = async () => {
    setTimerActive(false);
    setIsLoadingNewMatch(true);
    
    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (currentResultIndex < searchResults.length - 1) {
      const nextIndex = currentResultIndex + 1;
      setCurrentResultIndex(nextIndex);
      setCurrentMatch(searchResults[nextIndex]);
      setTimeLeft(30);
      setTimerActive(true);
      setIsLoadingNewMatch(false);
      
      toast({
        title: "New Match Found!",
        description: `Showing next potential match`,
      });
    } else {
      setIsLoadingNewMatch(false);
      toast({
        title: "No More Matches",
        description: "You've seen all available matches. Try a new search!",
        variant: "destructive",
      });
      handleNewSearch();
    }
  };

  const handleAcceptMatch = () => {
    setUserAccepted(true);
    
    toast({
      title: "Match Accepted!",
      description: "Waiting for your match to respond...",
    });

    // Simulate the other user accepting after 2 seconds
    setTimeout(() => {
      setMatchAccepted(true);
      setTimerActive(false);
      setShowChat(true);
      setChatMessages([
        {
          id: '1',
          sender: 'match',
          message: `Hey! I saw we matched up. Ready to climb some ranks together? 🎮`,
          timestamp: new Date()
        }
      ]);
      
      toast({
        title: "It's a Match! 🎉",
        description: "Both players accepted. You can now chat!",
      });
    }, 2000);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        sender: 'user',
        message: newMessage.trim(),
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Simulate a response after a delay
      setTimeout(() => {
        const responses = [
          "Sounds good! What's your main role?",
          "I'm down for some ranked games. What rank are you aiming for?",
          "Cool! I usually play evenings EST. What about you?",
          "Nice! I've been trying to improve my macro. Maybe we can work on that together?",
          "Perfect! Should we hop on Discord and try a few games?"
        ];
        
        const response: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'match',
          message: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date()
        };
        
        setChatMessages(prev => [...prev, response]);
      }, 1000 + Math.random() * 2000);
    }
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setChatMessages([]);
    setUserAccepted(false);
    setMatchAccepted(false);
  };

  const handleRejectMatch = () => {
    setUserRejectedMatch(true);
    setShowChat(false);
    setUserAccepted(false);
    setMatchAccepted(false);
    
    toast({
      title: "Match Rejected",
      description: "Looking for your next potential duo partner...",
    });

    // Find a new match after a short delay
    setTimeout(() => {
      handleFindNewMatch();
    }, 1500);
  };

  const handleReadyToPlay = () => {
    setReadyToPlay(true);
    
    toast({
      title: "Discord Shared! 🎮",
      description: "Your Discord info has been exchanged. Time to duo queue!",
    });
  };

  // Generate mock review data for a player (static based on riot_id)
  const generatePlayerReviews = (riotId: string): PlayerReview[] => {
    const reviewers = [
      'ShadowStrike92', 'MysticSupport', 'JungleKingXX', 'WardMaster', 
      'CriticalHit99', 'SpellThief', 'FlashBangGG', 'TankCommander'
    ];
    
    const comments = [
      'Great teammate! Always positive and helps the team.',
      'Solid player with good game sense.',
      'Fun to play with, good communication.',
      'Reliable duo partner, never flames.',
      'Good mechanical skills and team player.',
      'Always tries their best and stays positive.'
    ];
    
    // Create a simple hash from riot_id for consistent randomness
    const hash = riotId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const numReviews = Math.abs(hash % 6) + 3; // 3-8 reviews
    const reviews: PlayerReview[] = [];
    
    for (let i = 0; i < numReviews; i++) {
      const seedBase = Math.abs(hash + i * 1000);
      const reviewer = reviewers[seedBase % reviewers.length];
      const daysSinceReview = (seedBase % 30) + 1; // 1-30 days ago
      const date = new Date(Date.now() - daysSinceReview * 24 * 60 * 60 * 1000);
      
      reviews.push({
        id: `${i + 1}`,
        reviewerName: reviewer,
        date: date.toISOString().split('T')[0],
        ratings: {
          fun: (seedBase % 3) + 3, // 3-5
          helpful: ((seedBase + 100) % 3) + 3, // 3-5
          leader: ((seedBase + 200) % 5) + 1, // 1-5
          toxic: ((seedBase + 300) % 2) + 1, // 1-2 (low toxicity)
          troll: ((seedBase + 400) % 2) + 1, // 1-2 (low troll)
          chill: ((seedBase + 500) % 3) + 3, // 3-5
        },
        comment: comments[seedBase % comments.length],
        gamesPlayed: (seedBase % 100) + 20
      });
    }
    
    return reviews;
  };

  const calculateAverageRatings = (reviews: PlayerReview[]) => {
    if (reviews.length === 0) return { fun: 0, helpful: 0, leader: 0, toxic: 0, troll: 0, chill: 0 };
    
    const totals = reviews.reduce(
      (acc, review) => ({
        fun: acc.fun + review.ratings.fun,
        helpful: acc.helpful + review.ratings.helpful,
        leader: acc.leader + review.ratings.leader,
        toxic: acc.toxic + review.ratings.toxic,
        troll: acc.troll + review.ratings.troll,
        chill: acc.chill + review.ratings.chill,
      }),
      { fun: 0, helpful: 0, leader: 0, toxic: 0, troll: 0, chill: 0 }
    );

    return {
      fun: totals.fun / reviews.length,
      helpful: totals.helpful / reviews.length,
      leader: totals.leader / reviews.length,
      toxic: totals.toxic / reviews.length,
      troll: totals.troll / reviews.length,
      chill: totals.chill / reviews.length,
    };
  };

  const getOpGgUrl = (riotId: string): string => {
    const [gameName, tagLine] = riotId.includes('#') ? riotId.split('#') : [riotId, 'NA1'];
    return `https://www.op.gg/summoners/na/${encodeURIComponent(gameName)}-${encodeURIComponent(tagLine)}`;
  };

  const getDiscordUrl = (): string => {
    // Static Discord profile for now
    return "https://discord.com/users/123456789";
  };

  // Convert similarity score to percentage (add 20 but cap at 100)
  const getMatchPercentage = (similarityScore: number): number => {
    const percentage = Math.round((similarityScore * 100) + 20);
    return Math.min(percentage, 100);
  };

  // Get player icon URL based on riot_id
  const getPlayerIconUrl = (riotId: string): string => {
    // Use a hash of the riot_id to get a consistent icon
    const hash = riotId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const iconId = Math.abs(hash % 28) + 1; // Icons 1-28 are common
    return `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${iconId}.png`;
  };

  // Generate skill level for user (consistent based on their stats)
  const getUserSkillLevel = (): number => {
    if (!playerStats) return 8.5;
    const hash = playerStats.account.gameName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return 8.0 + (Math.abs(hash % 20) / 10); // 8.0 to 9.9
  };

  // Generate skill level for matched player (consistent based on riot_id)
  const getMatchedPlayerSkillLevel = (riotId: string): number => {
    const hash = riotId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return 8.0 + (Math.abs(hash % 21) / 10); // 8.0 to 10.0
  };

  // Generate win rate for matched player (consistent based on riot_id)
  const getMatchedPlayerWinRate = (riotId: string): number => {
    const hash = riotId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return 50 + (Math.abs(hash % 26)); // 50 to 75
  };

  // Copy player ID to clipboard
  const copyPlayerInfo = async (riotId: string) => {
    try {
      await navigator.clipboard.writeText(riotId);
      toast({
        title: "Copied!",
        description: `${riotId} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
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

  // Generate compatibility reasons based on player data
  const getCompatibilityReasons = (match: SearchResult) => {
    const baseScore = match.similarity_score * 100;
    const reasons = [];
    
    if (match.stats.primary_role === 'JUNGLE') {
      reasons.push({ reason: 'Preferred role match', score: 15 });
    }
    
    if (match.analysis.performance_trend === 'On a hot streak') {
      reasons.push({ reason: 'Currently performing well', score: 12 });
    }
    
    if (match.analysis.champion_pool_size >= 5) {
      reasons.push({ reason: 'Diverse champion pool', score: 10 });
    }
    
    if (match.descriptions.compatibility.includes('team')) {
      reasons.push({ reason: 'Team-oriented playstyle', score: 8 });
    }
    
    if (match.analysis.pace_preference === 'Slow-paced') {
      reasons.push({ reason: 'Strategic approach', score: 7 });
    }
    
    reasons.push({ reason: 'Similar playstyle preferences', score: Math.floor(baseScore * 0.3) });
    
    return reasons;
  };

    // Timeout Screen
  if (currentStep === 'timeout') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <Clock className="w-20 h-20 text-blue-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-slate-200 mb-4">Time to Move On!</h1>
            <p className="text-slate-400 text-lg">
              No worries! Let's find you another great match. There are plenty of amazing teammates waiting.
            </p>
          </div>
          
          <div className="space-y-3">
          <Button 
            onClick={handleNewSearch}
            size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 w-full"
          >
              <Search className="w-5 h-5 mr-2" />
              Find Another Match
          </Button>
            <p className="text-slate-500 text-sm">
              ✨ New matches are found every few seconds!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading Screen
  if (currentStep === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-200 mb-2">Finding Your Next Match...</h2>
          <p className="text-slate-400">Searching through thousands of players</p>
        </div>
      </div>
    );
  }

  // Chat Screen
  if (currentStep === 'chat' && currentMatch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-teal-700 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Chat Header */}
          <Card className="mb-4 bg-black/20 border-white/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <img 
                      src={getPlayerIconUrl(currentMatch.riot_id)}
                      alt="Matched Player"
                      onError={(e) => {
                        e.currentTarget.src = "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/1.png";
                      }}
                    />
                    <AvatarFallback>
                      {currentMatch.riot_id.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.open(getOpGgUrl(currentMatch.riot_id), '_blank')}
                        className="text-white font-semibold text-lg hover:text-blue-300 transition-colors flex items-center gap-1"
                      >
                        {currentMatch.riot_id.split('#')[0]}
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => window.open(getDiscordUrl(), '_blank')}
                        className="text-purple-300 hover:text-purple-200 transition-colors"
                      >
                        <DiscordLogo className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-white/70 text-sm">{currentMatch.stats.primary_role} Main</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleNewSearch}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    End Chat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Messages */}
          <Card className="bg-black/20 border-white/20 backdrop-blur-sm mb-4">
            <CardContent className="p-0">
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.sender === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/20 text-white border border-white/30'
                      }`}
                    >
                      <p>{msg.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Message Input */}
          <Card className="bg-black/20 border-white/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 bg-white/10 border-white/30 text-white placeholder:text-white/50"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Skeleton Components
  const SkeletonAvatar = () => (
    <div className="w-32 h-32 bg-slate-800 rounded-full animate-pulse border-4 border-slate-700"></div>
  );

  const SkeletonBadge = () => (
    <div className="h-6 w-24 bg-slate-800 rounded-full animate-pulse"></div>
  );

  const SkeletonText = ({ className }: { className?: string }) => (
    <div className={`bg-slate-800 rounded animate-pulse ${className}`}></div>
  );

  const SkeletonCard = ({ children }: { children: React.ReactNode }) => (
    <Card className="border-slate-700 bg-slate-900/50">
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  );

  // Results Screen
  if (currentStep === 'results') {
    const primaryRank = getPrimaryRank();
    const winRate = getWinRate();
    
    if (!currentMatch) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="text-center text-slate-200">
            <p>No matches found. Please try a new search.</p>
            <Button onClick={handleNewSearch} className="mt-4">
              New Search
            </Button>
          </div>
        </div>
      );
    }

    const matchPercentage = getMatchPercentage(currentMatch.similarity_score);
    const compatibilityReasons = getCompatibilityReasons(currentMatch);

    // Generate a stable player count based on current time (changes every ~5 minutes)
    const getStablePlayerCount = () => {
      const now = new Date();
      const seed = Math.floor(now.getTime() / (5 * 60 * 1000)); // Changes every 5 minutes
      const baseCount = 247;
      const variation = (seed % 30) - 15; // -15 to +15 variation
      return baseCount + variation;
    };

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative">
        {/* Live Count - Top Right */}
        {!matchAccepted && (
          <div className="absolute top-6 right-6 z-10">
            <Card className="border-slate-700 bg-slate-900/80 backdrop-blur-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 font-semibold text-sm">{getStablePlayerCount()}</span>
                  <span className="text-slate-300 text-xs">searching</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-1"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div className="w-full max-w-7xl flex gap-6">
          <div className="flex-1">
            {/* Timer - only show if both haven't accepted */}
            {!matchAccepted && (
              <div className="text-center mb-6">
                <Card className="border-slate-700 bg-slate-900/50 max-w-xs mx-auto">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className={`w-5 h-5 ${timeLeft <= 10 ? 'text-red-400' : 'text-slate-300'}`} />
                      <span className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-slate-200'}`}>
                        0:{timeLeft.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">
                      {userAccepted ? 'Waiting for match...' : 'Time to decide'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Match Status */}
            {matchAccepted && (
              <div className="text-center mb-6">
                <Card className="border-green-700/50 bg-green-900/20 max-w-xs mx-auto">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <Check className="w-6 h-6 text-green-400" />
                      <span className="text-xl font-bold text-green-400">It's a Match!</span>
                    </div>
                    <p className="text-green-300/80 text-sm mt-1">Both players accepted</p>
                  </CardContent>
                </Card>
              </div>
            )}



          {/* VS Layout */}
          <div className="flex items-start justify-center gap-8 mb-6">
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
                    FLEX
                  </Badge>
                </div>
              </div>
              <div className="text-center min-h-[120px] flex flex-col justify-start">
                <p className="text-slate-200 font-semibold text-lg mb-2">
                  {playerStats ? playerStats.account.gameName : 'YourName'}
                </p>
                
                {/* Player Rank */}
                {primaryRank && (
                  <div className="mb-2">
                    <Badge variant="outline" className="border-blue-400/50 text-blue-400 bg-blue-400/10">
                      {primaryRank.tier} {primaryRank.rank} • {primaryRank.leaguePoints} LP
                    </Badge>
                  </div>
                )}
                
                <div className="flex items-center justify-center gap-2 text-slate-300 mb-1">
                  <span>🇺🇸</span>
                  <span>NA</span>
                  {primaryRank && (
                    <>
                      <span>•</span>
                      <span className="text-green-400">{winRate}% WR</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Shuffle Icon and Match Percentage */}
            <div className="flex flex-col items-center justify-center gap-4 mt-16">
              <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-full">
                <Shuffle className="w-12 h-12 text-slate-300 animate-pulse" />
              </div>
              <div className="relative group">
                <div className="text-center cursor-help">
                  <div className="text-3xl font-bold text-green-400">{matchPercentage}%</div>
                  <div className="text-sm text-slate-400">Match</div>
                </div>
                {/* Hover Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                  <div className="bg-slate-900 text-slate-200 text-sm rounded-lg p-4 whitespace-nowrap shadow-xl border border-slate-700">
                    <div className="space-y-2 min-w-[280px]">
                      <div className="font-semibold text-green-400 mb-2">Why you match:</div>
                      {compatibilityReasons.map((item, index) => (
                        <div key={index} className="flex justify-between gap-4">
                          <span className="text-left">{item.reason}:</span>
                          <span className="text-green-400">+{item.score}%</span>
                        </div>
                      ))}
                      <div className="border-t border-slate-700 pt-2 mt-2">
                        <div className="flex justify-between gap-4 font-semibold">
                          <span>Total Match Score:</span>
                          <span className="text-green-400">{matchPercentage}%</span>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 mt-2">
                        Based on playstyle, role, and performance data
                      </div>
                    </div>
                    {/* Tooltip Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Matched Profile */}
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                {isLoadingNewMatch ? (
                  <SkeletonAvatar />
                ) : (
                  <Avatar className="w-32 h-32 border-4 border-pink-400">
                    <img 
                      src={getPlayerIconUrl(currentMatch.riot_id)}
                      alt="Matched Player"
                      className="w-full h-full rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/1.png";
                      }}
                    />
                    <AvatarFallback className="bg-pink-500 text-white text-2xl">
                      {currentMatch.riot_id.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                {/* Green check when match accepts */}
                {matchAccepted && !isLoadingNewMatch && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center animate-pulse">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
                {!isLoadingNewMatch && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-pink-600 text-white px-3 py-1">
                      <Star className="w-4 h-4 mr-1" />
                      {currentMatch.stats.primary_role}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="text-center min-h-[120px] flex flex-col justify-start">
                {isLoadingNewMatch ? (
                  <div className="space-y-2">
                    <SkeletonText className="h-6 w-32 mx-auto" />
                    <SkeletonBadge />
                    <SkeletonText className="h-4 w-24 mx-auto" />
                    <SkeletonText className="h-4 w-28 mx-auto" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <button
                        onClick={() => window.open(getOpGgUrl(currentMatch.riot_id), '_blank')}
                        className="text-white font-semibold text-lg hover:text-blue-300 transition-colors flex items-center gap-1"
                      >
                        {currentMatch.riot_id.split('#')[0]}
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => copyPlayerInfo(currentMatch.riot_id)}
                        className="text-slate-400 hover:text-white transition-colors p-1"
                        title="Copy player ID"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => window.open(getDiscordUrl(), '_blank')}
                        className="text-purple-300 hover:text-purple-200 transition-colors"
                      >
                        <DiscordLogo className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {/* Player Rank */}
                    <div className="mb-2">
                      <Badge variant="outline" className="border-yellow-400/50 text-yellow-400 bg-yellow-400/10">
                        Gold II • 1,247 LP
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-slate-300 mb-1">
                      <span>🇺🇸</span>
                      <span>NA</span>
                      <span>•</span>
                      <span className="text-green-400">{getMatchedPlayerWinRate(currentMatch.riot_id)}% WR</span>
                    </div>
                    <div className="text-sm text-slate-400">
                      <div>{currentMatch.analysis.performance_trend}</div>
                      <div>{currentMatch.stats.most_played_champions.slice(0, 2).join(', ')}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          {!matchAccepted && !isLoadingNewMatch && (
            <div className="flex justify-center gap-4 mb-8">
              <Button 
                onClick={handleFindNewMatch}
                disabled={isLoadingNextMatch || userAccepted}
                variant="outline"
                className="border-red-400/50 text-red-400 hover:bg-red-400/10 px-8 py-3"
              >
                <X className="w-4 h-4 mr-2" />
                Pass
              </Button>
              <Button 
                onClick={handleAcceptMatch}
                disabled={userAccepted}
                className={`px-8 py-3 ${
                  userAccepted 
                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                <Check className="w-4 h-4 mr-2" />
                {userAccepted ? 'Waiting for Match...' : 'Accept Match'}
              </Button>
            </div>
          )}

          {/* Quick Loading State */}
          {isLoadingNewMatch && (
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-3 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Finding your next match...</span>
              </div>
            </div>
          )}

          {/* Quick Post-Match Actions */}
          {matchAccepted && !readyToPlay && !isLoadingNewMatch && (
            <div className="flex justify-center gap-4 mb-8">
              <Button 
                onClick={handleRejectMatch}
                variant="outline"
                className="border-red-400/50 text-red-400 hover:bg-red-400/10 px-6 py-3"
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                Not a Good Fit
              </Button>
              
              {!showChat && (
                <Button 
                  onClick={() => setShowChat(true)}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Chatting
                </Button>
              )}
              
              <Button 
                onClick={handleReadyToPlay}
                className="bg-green-600 hover:bg-green-700 px-6 py-3"
              >
                <Gamepad2 className="w-4 h-4 mr-2" />
                Ready to Play!
              </Button>
            </div>
          )}

          {/* Quick Ready to Play State */}
          {readyToPlay && !isLoadingNewMatch && (
            <div className="flex justify-center mb-8">
              <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <UserCheck className="w-6 h-6 text-green-400" />
                  <span className="text-green-400 font-semibold">Ready to Queue!</span>
                </div>
                <p className="text-green-300/80 text-sm mb-3 text-center">
                  Discord info exchanged! Time to dominate the Rift together.
                </p>
                <div className="flex justify-center gap-3">
                  <Button 
                    onClick={() => window.open(getDiscordUrl(), '_blank')}
                    size="sm"
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    Open Discord
                  </Button>
                  <Button 
                    onClick={handleNewSearch}
                    size="sm"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    Find Another
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Player Details */}
          <div className="mb-8">
            <div className="max-w-7xl mx-auto space-y-4">
              {/* Bio Section */}
              {isLoadingNewMatch ? (
                <SkeletonCard>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 bg-slate-700 rounded animate-pulse"></div>
                        <SkeletonText className="h-6 w-32" />
                      </div>
                      <div className="space-y-2">
                        <SkeletonText className="h-4 w-full" />
                        <SkeletonText className="h-4 w-5/6" />
                        <SkeletonText className="h-4 w-4/5" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 bg-slate-700 rounded animate-pulse"></div>
                        <SkeletonText className="h-6 w-24" />
                      </div>
                      <div className="space-y-2">
                        <SkeletonText className="h-4 w-full" />
                        <SkeletonText className="h-4 w-3/4" />
                        <SkeletonText className="h-4 w-5/6" />
                      </div>
                    </div>
                  </div>
                </SkeletonCard>
              ) : (
                <Card className="border-slate-700 bg-slate-900/50">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-400" />
                          About This Player
                        </h3>
                        <p className="text-slate-300 text-sm leading-relaxed">{currentMatch.bio}</p>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-purple-400" />
                          Playstyle
                        </h3>
                        <p className="text-slate-300 text-sm leading-relaxed">{currentMatch.descriptions.playstyle}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Strengths & Weaknesses */}
              {isLoadingNewMatch ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SkeletonCard>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 bg-slate-700 rounded animate-pulse"></div>
                      <SkeletonText className="h-5 w-20" />
                    </div>
                    <div className="space-y-2">
                      <SkeletonText className="h-4 w-full" />
                      <SkeletonText className="h-4 w-3/4" />
                    </div>
                  </SkeletonCard>
                  <SkeletonCard>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 bg-slate-700 rounded animate-pulse"></div>
                      <SkeletonText className="h-5 w-28" />
                    </div>
                    <div className="space-y-2">
                      <SkeletonText className="h-4 w-full" />
                      <SkeletonText className="h-4 w-4/5" />
                    </div>
                  </SkeletonCard>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-green-700/50 bg-green-900/20">
                    <CardContent className="p-4">
                      <h4 className="text-green-400 font-medium mb-2 flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Strengths
                      </h4>
                      <p className="text-green-300/80 text-sm">{currentMatch.descriptions.compatibility}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-orange-700/50 bg-orange-900/20">
                    <CardContent className="p-4">
                      <h4 className="text-orange-400 font-medium mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Watch Out For
                      </h4>
                      <p className="text-orange-300/80 text-sm">{currentMatch.descriptions.cons}</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Performance & Reviews Grid */}
              {isLoadingNewMatch ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Performance Stats Skeleton */}
                  <SkeletonCard>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-5 h-5 bg-slate-700 rounded animate-pulse"></div>
                      <SkeletonText className="h-6 w-36" />
                    </div>
                    
                    <div className="space-y-4">
                      {/* Champions Skeleton */}
                      <div>
                        <SkeletonText className="h-4 w-28 mb-2" />
                        <div className="flex flex-wrap gap-2">
                          {[1, 2, 3, 4].map((i) => (
                            <SkeletonText key={i} className="h-6 w-20" />
                          ))}
                        </div>
                      </div>

                      {/* Stats Grid Skeleton */}
                      <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="bg-slate-800/50 rounded-lg p-3">
                            <SkeletonText className="h-5 w-8 mb-1" />
                            <SkeletonText className="h-3 w-16" />
                          </div>
                        ))}
                      </div>

                      {/* Recent Adaptations Skeleton */}
                      <div>
                        <SkeletonText className="h-4 w-32 mb-2" />
                        <div className="space-y-1">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                              <SkeletonText className="h-3 w-40" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </SkeletonCard>

                  {/* Community Reviews Skeleton */}
                  <SkeletonCard>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-5 h-5 bg-slate-700 rounded animate-pulse"></div>
                      <SkeletonText className="h-6 w-36" />
                    </div>
                    
                    <div className="space-y-4">
                      {/* Rating Grid Skeleton */}
                      <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="bg-slate-800/50 rounded-lg p-3 text-center">
                            <SkeletonText className="h-6 w-8 mx-auto mb-1" />
                            <SkeletonText className="h-3 w-12 mx-auto" />
                          </div>
                        ))}
                      </div>

                      {/* Recent Comments Skeleton */}
                      <div className="space-y-3">
                        <SkeletonText className="h-4 w-28" />
                        {[1, 2].map((i) => (
                          <div key={i} className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                            <div className="flex items-center justify-between mb-2">
                              <SkeletonText className="h-3 w-24" />
                              <SkeletonText className="h-4 w-16" />
                            </div>
                            <div className="space-y-1">
                              <SkeletonText className="h-3 w-full" />
                              <SkeletonText className="h-3 w-3/4" />
                            </div>
                          </div>
                        ))}
                        <div className="text-center">
                          <SkeletonText className="h-3 w-32 mx-auto" />
                        </div>
                      </div>
                    </div>
                  </SkeletonCard>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Stats */}
                <Card className="border-slate-700 bg-slate-900/50">
                  <CardContent className="p-6">
                    <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400" />
                      Performance Stats
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Champions */}
                      <div>
                        <h4 className="text-slate-300 font-medium text-sm mb-2">Top Champions</h4>
                        <div className="flex flex-wrap gap-2">
                          {currentMatch.champion_details.slice(0, 4).map((champ, index) => (
                            <Badge key={index} variant="secondary" className="bg-slate-800 text-slate-300 border-slate-600">
                              {champ.name} ({champ.win_rate.toFixed(0)}%)
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <div className="text-blue-400 font-semibold">{currentMatch.analysis.champion_pool_size}</div>
                          <div className="text-slate-400 text-xs">Champion Pool</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <div className="text-purple-400 font-semibold">{getMatchedPlayerSkillLevel(currentMatch.riot_id).toFixed(1)}</div>
                          <div className="text-slate-400 text-xs">Skill Level</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <div className="text-green-400 font-semibold">{currentMatch.stats.avg_cs_per_minute.toFixed(1)}</div>
                          <div className="text-slate-400 text-xs">CS per min</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <div className="text-orange-400 font-semibold">{currentMatch.analysis.pace_preference}</div>
                          <div className="text-slate-400 text-xs">Pace Style</div>
                        </div>
                      </div>

                      {/* Recent Adaptations */}
                      <div>
                        <h4 className="text-slate-300 font-medium text-sm mb-2">Recent Adaptations</h4>
                        <div className="space-y-1">
                          {currentMatch.analysis.recent_champion_shifts.slice(0, 3).map((shift, index) => (
                            <div key={index} className="text-slate-400 text-xs flex items-center gap-2">
                              <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                              {shift}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Community Reviews */}
                <Card className="border-slate-700 bg-slate-900/50">
                  <CardContent className="p-6">
                    <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-green-400" />
                      Community Reviews
                    </h3>
                    
                    {(() => {
                      const reviews = generatePlayerReviews(currentMatch.riot_id);
                      const avgRatings = calculateAverageRatings(reviews);
                      
                      return (
                        <div className="space-y-4">
                          {/* Rating Grid */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                              <div className="text-green-400 font-bold text-lg">{avgRatings.fun.toFixed(1)}</div>
                              <div className="text-slate-400 text-xs">Fun</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                              <div className="text-blue-400 font-bold text-lg">{avgRatings.helpful.toFixed(1)}</div>
                              <div className="text-slate-400 text-xs">Helpful</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                              <div className="text-purple-400 font-bold text-lg">{avgRatings.leader.toFixed(1)}</div>
                              <div className="text-slate-400 text-xs">Leader</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                              <div className="text-green-400 font-bold text-lg">{avgRatings.chill.toFixed(1)}</div>
                              <div className="text-slate-400 text-xs">Chill</div>
                            </div>
                          </div>

                          {/* Recent Comments */}
                          <div className="space-y-3">
                            <h4 className="text-slate-300 font-medium text-sm">Recent Feedback</h4>
                            {reviews.slice(0, 2).map((review) => (
                              <div key={review.id} className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-slate-300 text-xs font-medium">{review.reviewerName}</span>
                                  <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                                    {review.gamesPlayed} games
                                  </Badge>
                                </div>
                                <p className="text-slate-400 text-xs leading-relaxed">"{review.comment}"</p>
                              </div>
                            ))}
                            <div className="text-center">
                              <span className="text-slate-500 text-xs">
                                {reviews.length} total reviews this month
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
              )}
            </div>
          </div>

            {/* Action Buttons */}
            {!matchAccepted && !isLoadingNewMatch && (
              <div className="flex justify-center gap-4">
                <Button 
                  onClick={handleFindNewMatch}
                  disabled={isLoadingNextMatch || userAccepted}
                  variant="outline"
                  className="border-red-400/50 text-red-400 hover:bg-red-400/10 px-8 py-3"
                >
                  <X className="w-4 h-4 mr-2" />
                  Pass
                </Button>
                <Button 
                  onClick={handleAcceptMatch}
                  disabled={userAccepted}
                  className={`px-8 py-3 ${
                    userAccepted 
                      ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  <Check className="w-4 h-4 mr-2" />
                  {userAccepted ? 'Waiting for Match...' : 'Accept Match'}
                </Button>
              </div>
            )}

            {/* Loading State */}
            {isLoadingNewMatch && (
              <div className="flex justify-center">
                <div className="flex items-center gap-3 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Finding your next match...</span>
                </div>
              </div>
            )}

            {/* Post-Match Actions */}
            {matchAccepted && (
              <div className="flex justify-center gap-4">
                {!readyToPlay && (
                  <>
                    <Button 
                      onClick={handleRejectMatch}
                      variant="outline"
                      className="border-red-400/50 text-red-400 hover:bg-red-400/10 px-6 py-3"
                    >
                      <ThumbsDown className="w-4 h-4 mr-2" />
                      Not a Good Fit
                    </Button>
                    
                    {!showChat && (
                      <Button 
                        onClick={() => setShowChat(true)}
                        className="bg-blue-600 hover:bg-blue-700 px-6 py-3"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Start Chatting
                      </Button>
                    )}
                    
                    <Button 
                      onClick={handleReadyToPlay}
                      className="bg-green-600 hover:bg-green-700 px-6 py-3"
                    >
                      <Gamepad2 className="w-4 h-4 mr-2" />
                      Ready to Play!
                    </Button>
                  </>
                )}
                
                {readyToPlay && (
                  <div className="text-center">
                    <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <UserCheck className="w-6 h-6 text-green-400" />
                        <span className="text-green-400 font-semibold">Ready to Queue!</span>
                      </div>
                      <p className="text-green-300/80 text-sm mb-3">
                        Discord info exchanged! Time to dominate the Rift together.
                      </p>
                      <div className="flex justify-center gap-3">
                        <Button 
                          onClick={() => window.open(getDiscordUrl(), '_blank')}
                          size="sm"
                          className="bg-purple-500 hover:bg-purple-600"
                        >
                          Open Discord
                        </Button>
                        <Button 
                          onClick={handleNewSearch}
                          size="sm"
                          variant="outline"
                          className="border-white/30 text-white hover:bg-white/10"
                        >
                          Find Another
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Chat Panel */}
          {showChat && (
            <div className="w-96 bg-black/20 border-white/20 backdrop-blur-sm rounded-lg">
              <div className="p-4 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <img 
                        src={getPlayerIconUrl(currentMatch.riot_id)}
                        alt="Matched Player"
                        onError={(e) => {
                          e.currentTarget.src = "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/1.png";
                        }}
                      />
                      <AvatarFallback>
                        {currentMatch.riot_id.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-white font-semibold text-sm">
                        {currentMatch.riot_id.split('#')[0]}
                      </h3>
                      <p className="text-white/60 text-xs">{currentMatch.stats.primary_role} Main</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleCloseChat}
                    variant="ghost"
                    size="sm"
                    className="text-white/60 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-80 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                        msg.sender === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/20 text-white border border-white/30'
                      }`}
                    >
                      <p>{msg.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-white/20">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 bg-white/10 border-white/30 text-white placeholder:text-white/50 text-sm"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Form Screen (default)
  return (
    <div className="bg-lol-black min-h-[calc(100vh-120px)] flex flex-col justify-center">
      <div className="max-w-xl mx-auto py-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-lol-white mb-3">
            Find your perfect duo with intelligence.
          </h1>
          <p className="text-base text-lol-white/60">
            Tell us what you're looking for and we'll help you find the perfect teammate.
          </p>
        </div>

        {/* Main Form */}
        <Card className="border border-lol-gray-700 shadow-xl bg-lol-gray-800/80 backdrop-blur-sm">
          <CardContent className="p-4">
            {/* 3-Part Prompt - Left-aligned natural flow with left margin */}
            <div className="space-y-2 ml-4">
              <div className="text-left">
                <div className="text-2xl font-medium text-lol-white leading-relaxed">
                  <div className="mb-2">
                    <span>Find me a </span>
                    <Input
                      placeholder="type of player"
                      value={formData.playerType}
                      onChange={(e) => setFormData(prev => ({ ...prev, playerType: e.target.value }))}
                      className="inline-block w-auto min-w-[180px] h-12 text-2xl border-2 border-lol-gold bg-lol-gray-800 text-lol-white font-medium placeholder:text-lol-white/60 focus:border-lol-gold-dark focus:bg-lol-gray-700 rounded-full px-6 mx-1"
                    />
                  </div>
                  <div className="mb-2">
                    <span>who loves </span>
                    <Input
                      placeholder="champions or roles"
                      value={formData.champions}
                      onChange={(e) => setFormData(prev => ({ ...prev, champions: e.target.value }))}
                      className="inline-block w-auto min-w-[200px] h-12 text-2xl border-2 border-lol-blue bg-lol-gray-800 text-lol-white font-medium placeholder:text-lol-white/60 focus:border-lol-blue-dark focus:bg-lol-gray-700 rounded-full px-6 mx-1"
                    />
                  </div>
                  <div className="mb-2">
                    <span>and </span>
                    <Input
                      placeholder="gaming preference"
                      value={formData.preference}
                      onChange={(e) => setFormData(prev => ({ ...prev, preference: e.target.value }))}
                      className="inline-block w-auto min-w-[220px] h-12 text-2xl border-2 border-lol-gold-dark bg-lol-gray-800 text-lol-white font-medium placeholder:text-lol-white/60 focus:border-lol-gold focus:bg-lol-gray-700 rounded-full px-6 mx-1"
                    />
                  </div>
                  
                  {/* Game Mode Selection */}
                  <div className="mt-4 flex gap-2">
                    <Button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, gameMode: 'ranked' }))}
                      variant="outline"
                      size="sm"
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-all h-7 ${
                        formData.gameMode === 'ranked'
                          ? 'bg-green-500/20 border-green-500 text-green-400 hover:bg-green-500/30'
                          : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/70 hover:text-gray-200 hover:border-gray-500'
                      }`}
                    >
                      Ranked
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, gameMode: 'casual' }))}
                      variant="outline"
                      size="sm"
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-all h-7 ${
                        formData.gameMode === 'casual'
                          ? 'bg-green-500/20 border-green-500 text-green-400 hover:bg-green-500/30'
                          : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/70 hover:text-gray-200 hover:border-gray-500'
                      }`}
                    >
                      Casual
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Dealbreakers Section */}
            <div className="mt-4">
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
                <CollapsibleContent className="mt-1">
                  <Textarea
                    placeholder="e.g., No toxic players, must have mic, no one-tricks..."
                    value={formData.dealbreakers}
                    onChange={(e) => setFormData(prev => ({ ...prev, dealbreakers: e.target.value }))}
                    className="min-h-[60px] border-lol-gray-600 bg-lol-gray-900 text-lol-white placeholder:text-lol-white/50 focus:border-lol-gold focus:ring-lol-gold"
                  />
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Submit Button */}
            <div className="mt-4">
              <Button 
                onClick={handleSubmit}
                disabled={!formData.playerType || !formData.preference || isSearching}
                size="lg"
                className="w-full py-4 text-lg bg-gradient-to-r from-lol-gold to-lol-gold-dark hover:from-lol-gold-dark hover:to-lol-gold text-lol-black font-bold disabled:opacity-50"
              >
                <Search className={`w-5 h-5 mr-2 ${isSearching ? 'animate-spin' : ''}`} />
                {isSearching ? 'Searching...' : 'Find My Duo'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Matchmaking;
