
import { useState } from 'react';
import { Heart, X, MapPin, Calendar, Sparkles } from 'lucide-react';

const profiles = [
  {
    id: 1,
    name: 'Kadek',
    age: 24,
    location: 'Ubud, Bali',
    photos: ['https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400&h=600&fit=crop'],
    bio: 'Yoga instructor who believes in living authentically. Love sunrise ceremonies and organic farming. Looking for someone who values spiritual growth and sustainability.',
    values: ['Spirituality', 'Sustainability', 'Community'],
    interests: ['Yoga', 'Organic Farming', 'Traditional Arts']
  },
  {
    id: 2,
    name: 'Wayan',
    age: 26,
    location: 'Canggu, Bali',
    photos: ['https://images.unsplash.com/photo-1466721591366-2d5fba72006d?w=400&h=600&fit=crop'],
    bio: 'Surf instructor and environmental activist. Passionate about protecting our beautiful island. Seeking genuine connections with like-minded souls.',
    values: ['Environmental Protection', 'Adventure', 'Authenticity'],
    interests: ['Surfing', 'Beach Cleanup', 'Photography']
  },
  {
    id: 3,
    name: 'Putu',
    age: 23,
    location: 'Sanur, Bali',
    photos: ['https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400&h=600&fit=crop'],
    bio: 'Traditional dancer and cultural preservationist. I find beauty in our heritage and hope to share it with someone special who appreciates deep roots.',
    values: ['Cultural Heritage', 'Family', 'Respect'],
    interests: ['Traditional Dance', 'Temple Ceremonies', 'Cooking']
  }
];

const SwipeCard = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState('');

  const currentProfile = profiles[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    setSwipeDirection(direction);
    
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % profiles.length);
      setSwipeDirection('');
    }, 300);
  };

  if (!currentProfile) {
    return (
      <div className="text-center py-20">
        <Heart className="h-16 w-16 text-balinese-sunset mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-semibold text-balinese-earth mb-2">No more profiles</h3>
        <p className="text-balinese-earth/70">Check back later for new connections</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main Card */}
      <div className={`relative transform transition-all duration-300 ${
        swipeDirection === 'left' ? '-translate-x-full rotate-12 opacity-0' :
        swipeDirection === 'right' ? 'translate-x-full -rotate-12 opacity-0' :
        'translate-x-0 rotate-0 opacity-100'
      }`}>
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-sm mx-auto">
          {/* Photo */}
          <div className="relative h-96 overflow-hidden">
            <img
              src={currentProfile.photos[0]}
              alt={currentProfile.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Name and Age overlay */}
            <div className="absolute bottom-4 left-4 text-white">
              <h2 className="text-2xl font-bold">{currentProfile.name}, {currentProfile.age}</h2>
              <div className="flex items-center mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">{currentProfile.location}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-balinese-earth/80 text-sm leading-relaxed mb-4">
              {currentProfile.bio}
            </p>

            {/* Values */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-balinese-earth mb-2 flex items-center">
                <Sparkles className="h-4 w-4 mr-1" />
                Values
              </h3>
              <div className="flex flex-wrap gap-2">
                {currentProfile.values.map((value, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gradient-sunset text-white text-xs rounded-full font-medium"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div>
              <h3 className="text-sm font-semibold text-balinese-earth mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {currentProfile.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-balinese-sage/20 text-balinese-earth text-xs rounded-full border border-balinese-sage/30"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-8 mt-8">
        <button
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-200 border-2 border-red-200 hover:border-red-300"
        >
          <X className="h-8 w-8 text-red-500" />
        </button>
        
        <button
          onClick={() => handleSwipe('right')}
          className="w-16 h-16 bg-gradient-sunset rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-200 animate-pulse"
        >
          <Heart className="h-8 w-8 text-white" />
        </button>
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center mt-6 space-x-2">
        {profiles.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
              index === currentIndex ? 'bg-balinese-sunset' : 'bg-balinese-earth/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default SwipeCard;
