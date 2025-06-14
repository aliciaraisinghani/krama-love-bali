
import { Heart, MessageCircle, Clock } from 'lucide-react';

const matches = [
  {
    id: 1,
    name: 'Kadek',
    photo: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=150&h=150&fit=crop',
    lastMessage: 'That sunrise ceremony sounds amazing! 🌅',
    timeAgo: '2h ago',
    isNew: true
  },
  {
    id: 2,
    name: 'Wayan',
    photo: 'https://images.unsplash.com/photo-1466721591366-2d5fba72006d?w=150&h=150&fit=crop',
    lastMessage: 'Would love to go beach cleaning together sometime',
    timeAgo: '1d ago',
    isNew: false
  },
  {
    id: 3,
    name: 'Putu',
    photo: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=150&h=150&fit=crop',
    lastMessage: 'Your wood carving work is incredible! 😍',
    timeAgo: '3d ago',
    isNew: false
  }
];

const MatchesView = () => {
  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-balinese-earth mb-2">Your Connections</h2>
        <p className="text-balinese-earth/70">Meaningful matches await you</p>
      </div>

      {/* New Matches Section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-balinese-earth mb-4 flex items-center">
          <Heart className="h-5 w-5 mr-2 text-balinese-sunset animate-heart-beat" />
          New Matches
        </h3>
        
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {matches.filter(match => match.isNew).map((match) => (
            <div key={match.id} className="flex-shrink-0 text-center">
              <div className="relative">
                <img
                  src={match.photo}
                  alt={match.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-balinese-sunset shadow-lg"
                />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-balinese-sunset rounded-full border-2 border-white flex items-center justify-center">
                  <Heart className="h-3 w-3 text-white" />
                </div>
              </div>
              <p className="text-sm font-medium text-balinese-earth mt-2">{match.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Messages Section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-balinese-earth mb-4 flex items-center">
          <MessageCircle className="h-5 w-5 mr-2 text-balinese-sunset" />
          Recent Conversations
        </h3>
        
        <div className="space-y-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className="flex items-center space-x-4 p-3 rounded-xl hover:bg-orange-50 transition-colors cursor-pointer"
            >
              <div className="relative">
                <img
                  src={match.photo}
                  alt={match.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                {match.isNew && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-balinese-sunset rounded-full border-2 border-white"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-balinese-earth">{match.name}</h4>
                  <div className="flex items-center text-balinese-earth/60 text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {match.timeAgo}
                  </div>
                </div>
                <p className="text-sm text-balinese-earth/70 truncate mt-1">
                  {match.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connection Tips */}
      <div className="bg-gradient-nature rounded-2xl p-6 text-white shadow-lg">
        <h3 className="font-semibold mb-2">💡 Connection Tips</h3>
        <p className="text-sm opacity-90">
          Share your authentic self and ask about their cultural interests. 
          Balinese connections are built on mutual respect and shared values.
        </p>
      </div>
    </div>
  );
};

export default MatchesView;
