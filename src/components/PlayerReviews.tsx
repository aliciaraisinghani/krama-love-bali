import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from './ui/dialog';
import { Star, MessageSquare, Plus } from 'lucide-react';

interface Review {
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

interface PlayerReviewsProps {
  className?: string;
}

// Mock review data - in a real app this would come from your backend
// These reviews match the players from the MatchesTab for consistency
const mockReviews: Review[] = [
  {
    id: '1',
    reviewerName: 'ShadowStrike92',
    date: '2024-01-15',
    ratings: { fun: 4.2, helpful: 4.8, leader: 2.5, toxic: 1.2, troll: 1.0, chill: 4.5 },
    comment: 'Great teammate! Really knows how to coordinate ganks and always stays positive.',
    gamesPlayed: 47
  },
  {
    id: '2',
    reviewerName: 'MysticSupport',
    date: '2024-01-10',
    ratings: { fun: 4.8, helpful: 3.9, leader: 3.8, toxic: 1.1, troll: 1.0, chill: 4.2 },
    comment: 'Fun to play with, good communication and never flames.',
    gamesPlayed: 23
  },
  {
    id: '3',
    reviewerName: 'JungleKingXX',
    date: '2024-01-05',
    ratings: { fun: 3.2, helpful: 4.1, leader: 4.7, toxic: 1.8, troll: 1.1, chill: 2.9 },
    comment: 'Strong shotcaller, helps with macro decisions. Sometimes gets a bit intense but overall good.',
    gamesPlayed: 89
  },
  {
    id: '4',
    reviewerName: 'WardMaster',
    date: '2023-12-28',
    ratings: { fun: 3.8, helpful: 4.6, leader: 1.9, toxic: 1.0, troll: 1.0, chill: 4.8 },
    comment: 'Always wards properly and has great map awareness. Very supportive teammate.',
    gamesPlayed: 156
  },
  {
    id: '5',
    reviewerName: 'CriticalHit99',
    date: '2023-12-20',
    ratings: { fun: 4.5, helpful: 2.8, leader: 2.7, toxic: 1.3, troll: 1.0, chill: 3.9 },
    comment: 'Really fun to duo with! Good mechanics and positive attitude.',
    gamesPlayed: 28
  },
  {
    id: '6',
    reviewerName: 'SpellThief',
    date: '2023-12-15',
    ratings: { fun: 4.1, helpful: 3.7, leader: 3.5, toxic: 1.0, troll: 1.0, chill: 4.3 },
    comment: 'Solid mid laner, great team player and always calm under pressure.',
    gamesPlayed: 92
  }
];

export const PlayerReviews = ({ className }: PlayerReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  
  // Manually set spider chart values for better visual representation
  const averageRatings = {
    fun: 4.2,
    helpful: 4.1, 
    leader: 3.5,
    toxic: 4.8,  // High raw value = LOW on chart (6-4.8=1.2 displayed)
    troll: 4.7,  // High raw value = LOW on chart (6-4.7=1.3 displayed)
    chill: 4.0
  };
  
  // Force component update
  console.log('Current ratings:', averageRatings);

  const SpiderChart = ({ ratings }: { ratings: typeof averageRatings }) => {
    const dimensions = [
      { key: 'fun', label: 'Fun', angle: 30, color: 'text-green-400' },
      { key: 'helpful', label: 'Helpful', angle: 90, color: 'text-green-400' },
      { key: 'leader', label: 'Leader', angle: 150, color: 'text-green-400' },
      { key: 'toxic', label: 'Toxic', angle: 210, color: 'text-red-400' },
      { key: 'troll', label: 'Troll', angle: 270, color: 'text-red-400' },
      { key: 'chill', label: 'Chill', angle: 330, color: 'text-green-400' },
    ];

    const size = 320;
    const center = size / 2;
    const maxRadius = 70;

    // Generate polygon points for the data
    const dataPoints = dimensions.map(dim => {
      const value = ratings[dim.key as keyof typeof ratings];
      // For negative traits (toxic, troll), invert the value (5 becomes 1, 1 becomes 5)
      const normalizedValue = dim.key === 'toxic' || dim.key === 'troll' 
        ? (6 - value) / 5 
        : value / 5;
      const radius = normalizedValue * maxRadius;
      const angleRad = (dim.angle - 90) * (Math.PI / 180); // -90 to start from top
      return {
        x: center + radius * Math.cos(angleRad),
        y: center + radius * Math.sin(angleRad),
      };
    });

    const pathData = dataPoints.map((point, i) => 
      `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ') + ' Z';

    return (
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg width={size} height={size} className="overflow-visible">
            {/* Background rings */}
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, i) => (
              <polygon
                key={i}
                points={dimensions.map(dim => {
                  const radius = maxRadius * scale;
                  const angleRad = (dim.angle - 90) * (Math.PI / 180);
                  const x = center + radius * Math.cos(angleRad);
                  const y = center + radius * Math.sin(angleRad);
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="rgb(156, 163, 175)"
                strokeWidth="1"
                opacity="0.6"
              />
            ))}

            {/* Axis lines */}
            {dimensions.map((dim, i) => {
              const angleRad = (dim.angle - 90) * (Math.PI / 180);
              const endX = center + maxRadius * Math.cos(angleRad);
              const endY = center + maxRadius * Math.sin(angleRad);
              return (
                <line
                  key={i}
                  x1={center}
                  y1={center}
                  x2={endX}
                  y2={endY}
                  stroke="rgb(156, 163, 175)"
                  strokeWidth="1"
                  opacity="0.6"
                />
              );
            })}

            {/* Data polygon */}
            <path
              d={pathData}
              fill="rgba(59, 130, 246, 0.2)"
              stroke="rgb(59, 130, 246)"
              strokeWidth="3"
            />

            {/* Data points */}
            {dataPoints.map((point, i) => (
              <circle
                key={i}
                cx={point.x}
                cy={point.y}
                r="4"
                fill="rgb(59, 130, 246)"
                stroke="rgb(255, 255, 255)"
                strokeWidth="2"
              />
            ))}
          </svg>

          {/* Labels */}
          {dimensions.map((dim, i) => {
            const labelRadius = maxRadius + 45;
            const angleRad = (dim.angle - 90) * (Math.PI / 180);
            const labelX = center + labelRadius * Math.cos(angleRad);
            const labelY = center + labelRadius * Math.sin(angleRad);
            
            const value = ratings[dim.key as keyof typeof ratings];
            // For display, show the actual value that corresponds to the visual representation
            const displayValue = dim.key === 'toxic' || dim.key === 'troll' 
              ? (6 - value) // Show inverted for negative traits, matching the visual calculation
              : value;
            
            return (
              <div
                key={i}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2"
                style={{
                  left: labelX,
                  top: labelY,
                }}
              >
                <span className={`text-sm font-medium ${dim.color} whitespace-nowrap`}>
                  {dim.label}
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  dim.key === 'toxic' || dim.key === 'troll' 
                    ? 'bg-red-500/20 text-red-400 border border-red-400/30' 
                    : 'bg-green-500/20 text-green-400 border border-green-400/30'
                } shadow-lg`}>
                  {displayValue.toFixed(1)}
                </div>
              </div>
            );
          })}
        </div>


      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className={`border-border/50 bg-card/50 backdrop-blur-sm ${className}`}>
      <CardHeader>
        <CardTitle className="text-xl text-foreground flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400" />
          Player Reviews
          <Badge variant="outline" className="ml-auto">
            {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Spider Chart */}
        <div className="flex justify-center">
          <SpiderChart key="updated-chart" ratings={averageRatings} />
        </div>

        {/* Recent Reviews */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-foreground">Recent Reviews</h4>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Review
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Leave a Review</DialogTitle>
                  <DialogDescription>
                    Rate this player based on your experience playing together.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This feature would allow other players to rate and review teammates after playing together.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {reviews.slice(0, 3).map((review) => (
              <div key={review.id} className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground text-sm">
                      {review.reviewerName}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {review.gamesPlayed} games
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(review.date)}
                  </span>
                </div>
                
                {review.comment && (
                  <p className="text-sm text-muted-foreground">
                    "{review.comment}"
                  </p>
                )}
              </div>
            ))}
          </div>

          {reviews.length > 3 && (
            <Button variant="ghost" size="sm" className="w-full">
              <MessageSquare className="h-4 w-4 mr-1" />
              View All Reviews ({reviews.length})
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 