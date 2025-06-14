import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { 
  Mail, 
  Lock, 
  User, 
  Github, 
  Chrome,
  Shield,
  Users,
  Zap,
  Sword
} from 'lucide-react';
import { useToast } from './ui/use-toast';

interface LoginViewProps {
  onLogin: () => void;
}

const LoginView = ({ onLogin }: LoginViewProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Welcome to EZLFP!",
        description: "Successfully logged in. Let's find your perfect duo partner!",
      });
      onLogin();
    }, 1500);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords don't match. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Account Created!",
        description: "Welcome to EZLFP! You're now ready to find your perfect duo partner.",
      });
      onLogin();
    }, 1500);
  };

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    toast({
      title: `Connecting with ${provider}`,
      description: "Redirecting to authentication...",
    });
    
    // Simulate social login
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-lol flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Branding & Features */}
        <div className="space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start">
              <img 
                src="/ezlfp-logo.png" 
                alt="EZLFP" 
                className="h-36 w-auto"
              />
            </div>
            <p className="text-xl text-lol-white/70 max-w-md mx-auto lg:mx-0">
              Find your perfect duo partner and climb the ranked ladder together in League of Legends
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
            <div className="flex items-center space-x-3 text-lol-white/80">
              <div className="p-2 bg-gradient-gold rounded-lg">
                <Users className="h-5 w-5 text-lol-black" />
              </div>
              <span>Find Your Duo</span>
            </div>
            <div className="flex items-center space-x-3 text-lol-white/80">
              <div className="p-2 bg-gradient-blue rounded-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span>Instant Matching</span>
            </div>
            <div className="flex items-center space-x-3 text-lol-white/80">
              <div className="p-2 bg-gradient-gold rounded-lg">
                <Shield className="h-5 w-5 text-lol-black" />
              </div>
              <span>Rank Verified</span>
            </div>
            <div className="flex items-center space-x-3 text-lol-white/80">
              <div className="p-2 bg-gradient-blue rounded-lg">
                <Sword className="h-5 w-5 text-white" />
              </div>
              <span>Climb Together</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
            <Badge className="bg-lol-gold text-lol-black">
              League of Legends
            </Badge>
            <Badge variant="outline" className="border-lol-blue text-lol-blue">
              Ranked Ready
            </Badge>
            <Badge variant="outline" className="border-lol-blue text-lol-blue">
              All Roles
            </Badge>
          </div>
        </div>

        {/* Right Side - Authentication */}
        <div className="w-full max-w-md mx-auto">
          <Card className="bg-lol-gray-800/50 border-lol-gray-700 shadow-2xl">
            <CardHeader className="text-center">
                              <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl text-lol-white font-semibold">Join</span>
                  <img 
                    src="/ezlfp-logo.png" 
                    alt="EZLFP" 
                    className="h-8 w-auto"
                  />
                </div>
              <CardDescription className="text-lol-white/60">
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-lol-gray-900">
                  <TabsTrigger value="login" className="data-[state=active]:bg-lol-blue data-[state=active]:text-white">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-lol-blue data-[state=active]:text-white">
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4 mt-6">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-lol-white/80">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-lol-white/40" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="bg-lol-gray-900 border-lol-gray-600 text-lol-white pl-10 focus:border-lol-blue"
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-lol-white/80">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-lol-white/40" />
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className="bg-lol-gray-900 border-lol-gray-600 text-lol-white pl-10 focus:border-lol-blue"
                          placeholder="Enter your password"
                          required
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-blue hover:bg-lol-blue-dark text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4 mt-6">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-lol-white/80">Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-lol-white/40" />
                        <Input
                          id="username"
                          value={formData.username}
                          onChange={(e) => handleInputChange('username', e.target.value)}
                          className="bg-lol-gray-900 border-lol-gray-600 text-lol-white pl-10 focus:border-lol-blue"
                          placeholder="Choose a username"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-lol-white/80">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-lol-white/40" />
                        <Input
                          id="signup-email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="bg-lol-gray-900 border-lol-gray-600 text-lol-white pl-10 focus:border-lol-blue"
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-lol-white/80">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-lol-white/40" />
                        <Input
                          id="signup-password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className="bg-lol-gray-900 border-lol-gray-600 text-lol-white pl-10 focus:border-lol-blue"
                          placeholder="Create a strong password"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-lol-white/80">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-lol-white/40" />
                        <Input
                          id="confirm-password"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          className="bg-lol-gray-900 border-lol-gray-600 text-lol-white pl-10 focus:border-lol-blue"
                          placeholder="Confirm your password"
                          required
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-blue hover:bg-lol-blue-dark text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-6">
                <Separator className="bg-lol-gray-700" />
                <p className="text-center text-sm text-lol-white/40 mt-4 mb-4">
                  Or continue with
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleSocialLogin('Google')}
                    className="border-lol-gray-600 text-lol-white/80 hover:bg-lol-gray-700"
                    disabled={isLoading}
                  >
                    <Chrome className="w-4 h-4 mr-2" />
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSocialLogin('GitHub')}
                    className="border-lol-gray-600 text-lol-white/80 hover:bg-lol-gray-700"
                    disabled={isLoading}
                  >
                    <Github className="w-4 h-4 mr-2" />
                    GitHub
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginView; 