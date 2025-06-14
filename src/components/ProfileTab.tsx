
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

const ProfileTab = () => {
  const [profile, setProfile] = useState({
    marvelName: '',
    discordName: '',
    age: '',
    gender: '',
    location: '',
    timezone: '',
    languages: '',
    bio: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log('Saving profile:', profile);
    // TODO: Save to backend
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-white flex items-center">
            My Gaming Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="marvelName" className="text-gray-300">Marvel Rivals Username</Label>
              <Input
                id="marvelName"
                value={profile.marvelName}
                onChange={(e) => handleInputChange('marvelName', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white focus:border-teal-400"
                placeholder="Your Marvel Rivals username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discordName" className="text-gray-300">Discord Username</Label>
              <Input
                id="discordName"
                value={profile.discordName}
                onChange={(e) => handleInputChange('discordName', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white focus:border-teal-400"
                placeholder="Your Discord username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age" className="text-gray-300">Age</Label>
              <Input
                id="age"
                type="number"
                value={profile.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white focus:border-teal-400"
                placeholder="Your age"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender" className="text-gray-300">Gender</Label>
              <Input
                id="gender"
                value={profile.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white focus:border-teal-400"
                placeholder="Your gender"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-gray-300">Location</Label>
              <Input
                id="location"
                value={profile.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white focus:border-teal-400"
                placeholder="Your location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-gray-300">Time Zone</Label>
              <Input
                id="timezone"
                value={profile.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white focus:border-teal-400"
                placeholder="e.g., PST, EST, GMT"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="languages" className="text-gray-300">Languages</Label>
            <Input
              id="languages"
              value={profile.languages}
              onChange={(e) => handleInputChange('languages', e.target.value)}
              className="bg-gray-800 border-gray-600 text-white focus:border-teal-400"
              placeholder="Languages you speak (e.g., English, Spanish, French)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-gray-300">Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="bg-gray-800 border-gray-600 text-white focus:border-teal-400 min-h-[100px]"
              placeholder="Tell others about yourself, your gaming style, and what you're looking for..."
            />
          </div>

          <Button 
            onClick={handleSave}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
          >
            Save Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileTab;
