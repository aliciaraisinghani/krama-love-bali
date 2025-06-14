import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from './ui/dialog';
import { Star, MessageSquare } from 'lucide-react';
import { useToast } from './ui/use-toast';

interface ReviewDialogProps {
  playerName: string;
  gamesPlayed: number;
  trigger: React.ReactNode;
}

interface Ratings {
  fun: number;
  helpful: number;
  leader: number;
  toxic: number;
  troll: number;
  chill: number;
}

const dimensions = [
  { key: 'fun', label: 'Fun', description: 'How enjoyable was it to play with this person?', type: 'positive' },
  { key: 'helpful', label: 'Helpful', description: 'Did they provide useful advice and support?', type: 'positive' },
  { key: 'leader', label: 'Leader', description: 'Did they take initiative and make good calls?', type: 'positive' },
  { key: 'chill', label: 'Chill', description: 'Were they relaxed and easy-going?', type: 'positive' },
  { key: 'toxic', label: 'Toxic', description: 'Were they negative or harmful to team morale?', type: 'negative' },
  { key: 'troll', label: 'Troll', description: 'Did they intentionally disrupt or sabotage games?', type: 'negative' },
];

export const ReviewDialog = ({ playerName, gamesPlayed, trigger }: ReviewDialogProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [ratings, setRatings] = useState<Ratings>({
    fun: 3,
    helpful: 3,
    leader: 3,
    toxic: 1,
    troll: 1,
    chill: 3,
  });
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingChange = (dimension: keyof Ratings, value: number) => {
    setRatings(prev => ({
      ...prev,
      [dimension]: value
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, you would send this data to your backend
    console.log('Submitting review:', {
      playerName,
      ratings,
      comment,
      gamesPlayed
    });

    toast({
      title: "Review Submitted",
      description: `Your review for ${playerName} has been submitted successfully.`,
    });

    setIsSubmitting(false);
    setIsOpen(false);
    
    // Reset form
    setRatings({
      fun: 3,
      helpful: 3,
      leader: 3,
      toxic: 1,
      troll: 1,
      chill: 3,
    });
    setComment('');
  };

  const RatingStars = ({ 
    value, 
    onChange, 
    type 
  }: { 
    value: number; 
    onChange: (value: number) => void; 
    type: 'positive' | 'negative';
  }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`w-6 h-6 transition-colors ${
              star <= value
                ? type === 'positive' 
                  ? 'text-yellow-400 hover:text-yellow-300' 
                  : 'text-red-400 hover:text-red-300'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Star className={`w-full h-full ${star <= value ? 'fill-current' : ''}`} />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground min-w-[80px]">
          {type === 'negative' && value === 1 && "Not at all"}
          {type === 'negative' && value === 2 && "Rarely"}
          {type === 'negative' && value === 3 && "Sometimes"}
          {type === 'negative' && value === 4 && "Often"}
          {type === 'negative' && value === 5 && "Always"}
          {type === 'positive' && value === 1 && "Poor"}
          {type === 'positive' && value === 2 && "Fair"}
          {type === 'positive' && value === 3 && "Good"}
          {type === 'positive' && value === 4 && "Great"}
          {type === 'positive' && value === 5 && "Excellent"}
        </span>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Review {playerName}
          </DialogTitle>
          <DialogDescription>
            Rate your experience playing with {playerName} based on your {gamesPlayed} games together.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {dimensions.map((dimension) => (
            <div key={dimension.key} className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-base font-medium">
                  {dimension.label}
                </Label>
                <Badge 
                  variant="outline" 
                  className={dimension.type === 'positive' ? 'text-green-600' : 'text-red-600'}
                >
                  {dimension.type}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {dimension.description}
              </p>
              <RatingStars
                value={ratings[dimension.key as keyof Ratings]}
                onChange={(value) => handleRatingChange(dimension.key as keyof Ratings, value)}
                type={dimension.type as 'positive' | 'negative'}
              />
            </div>
          ))}

          <div className="space-y-2">
            <Label htmlFor="comment">Additional Comments (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="Share your thoughts about playing with this person..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-lol-gold hover:bg-lol-gold-dark text-lol-black"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 