
import { useState } from 'react';
import { Camera, Edit, MapPin, Sparkles, Heart } from 'lucide-react';

const ProfileCard = () => {
  const [isEditing, setIsEditing] = useState(false);

  const userProfile = {
    name: 'Made',
    age: 25,
    location: 'Denpasar, Bali',
    photos: ['https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=400&h=600&fit=crop'],
    bio: 'Traditional wood carver with a modern heart. I believe in preserving our cultural heritage while embracing sustainable living. Looking for someone who shares my passion for authentic connections and mindful living.',
    values: ['Tradition', 'Sustainability', 'Mindfulness', 'Community'],
    interests: ['Wood Carving', 'Meditation', 'Local Cuisine', 'Temple Visits', 'Eco-tourism']
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="relative h-80">
          <img
            src={userProfile.photos[0]}
            alt="Profile"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Edit button */}
          <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform">
            <Camera className="h-5 w-5 text-balinese-earth" />
          </button>

          {/* Name overlay */}
          <div className="absolute bottom-4 left-4 text-white">
            <h1 className="text-3xl font-bold">{userProfile.name}, {userProfile.age}</h1>
            <div className="flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{userProfile.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-balinese-earth">About Me</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="w-8 h-8 bg-balinese-sunset/10 rounded-full flex items-center justify-center hover:bg-balinese-sunset/20 transition-colors"
          >
            <Edit className="h-4 w-4 text-balinese-sunset" />
          </button>
        </div>
        
        {isEditing ? (
          <textarea
            defaultValue={userProfile.bio}
            className="w-full p-3 border border-orange-200 rounded-lg resize-none focus:ring-2 focus:ring-balinese-sunset focus:border-transparent"
            rows={4}
          />
        ) : (
          <p className="text-balinese-earth/80 leading-relaxed">{userProfile.bio}</p>
        )}
      </div>

      {/* Values Section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-balinese-earth mb-4 flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-balinese-sunset" />
          My Values
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {userProfile.values.map((value, index) => (
            <div
              key={index}
              className="bg-gradient-sunset text-white px-4 py-3 rounded-xl text-center font-medium shadow-md"
            >
              {value}
            </div>
          ))}
        </div>
      </div>

      {/* Interests Section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-balinese-earth mb-4 flex items-center">
          <Heart className="h-5 w-5 mr-2 text-balinese-sunset" />
          My Interests
        </h2>
        <div className="flex flex-wrap gap-2">
          {userProfile.interests.map((interest, index) => (
            <span
              key={index}
              className="px-4 py-2 bg-balinese-sage/20 text-balinese-earth rounded-full border border-balinese-sage/30 text-sm font-medium"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 text-center shadow-lg">
          <div className="text-2xl font-bold text-balinese-sunset">12</div>
          <div className="text-sm text-balinese-earth/70">Matches</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center shadow-lg">
          <div className="text-2xl font-bold text-balinese-sunset">3</div>
          <div className="text-sm text-balinese-earth/70">Conversations</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center shadow-lg">
          <div className="text-2xl font-bold text-balinese-sunset">85%</div>
          <div className="text-sm text-balinese-earth/70">Match Rate</div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
