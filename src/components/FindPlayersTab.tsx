
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Mic, MicOff } from 'lucide-react';
import PreferenceSelector from './PreferenceSelector';
import VoiceInterface from './VoiceInterface';
import PlayerRecommendations from './PlayerRecommendations';

const FindPlayersTab = () => {
  const [preferences, setPreferences] = useState({
    playStyle: '',
    skillLevel: '',
    communication: '',
    availability: ''
  });
  const [lookingFor, setLookingFor] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Preferences Section */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Find Your Perfect Gaming Partner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <PreferenceSelector 
            preferences={preferences} 
            setPreferences={setPreferences} 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="lookingFor" className="text-gray-300">What I'm Looking For</Label>
              <Textarea
                id="lookingFor"
                value={lookingFor}
                onChange={(e) => setLookingFor(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white focus:border-teal-400 min-h-[120px]"
                placeholder="Describe what you're looking for in a gaming partner..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aboutMe" className="text-gray-300">About Me as a Player</Label>
              <Textarea
                id="aboutMe"
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white focus:border-teal-400 min-h-[120px]"
                placeholder="Describe your gaming style, experience, and personality..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Interface Section */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center">
            <Mic className="mr-2 h-5 w-5 text-teal-400" />
            Gossip Goblin Voice Interview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VoiceInterface 
            isActive={isVoiceActive}
            setIsActive={setIsVoiceActive}
          />
        </CardContent>
      </Card>

      {/* Player Recommendations */}
      <PlayerRecommendations preferences={preferences} />
    </div>
  );
};

export default FindPlayersTab;
