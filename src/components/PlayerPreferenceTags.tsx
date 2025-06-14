import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  PlayerPreferences, 
  getPreferenceLabel,
  hasCustomPreferences 
} from '@/lib/playerPreferences';
import { 
  Gamepad2, 
  MessageCircle, 
  Swords, 
  Heart,
  Edit
} from 'lucide-react';

interface PlayerPreferenceTagsProps {
  preferences: PlayerPreferences;
  onEdit?: () => void;
  showEditButton?: boolean;
  compact?: boolean;
}

const CATEGORY_ICONS = {
  competitiveIntent: Gamepad2,
  communication: MessageCircle,
  playstyle: Swords,
  attitude: Heart
};

const CATEGORY_TITLES = {
  competitiveIntent: 'Competitive Intent',
  communication: 'Communication',
  playstyle: 'Playstyle',
  attitude: 'Attitude'
};

const PREFERENCE_COLORS = {
  competitiveIntent: {
    'for-fun': 'bg-green-100 text-green-800 hover:bg-green-200',
    'play-to-win': 'bg-red-100 text-red-800 hover:bg-red-200'
  },
  communication: {
    'voice-comm': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    'text-chat': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    'no-comms': 'bg-gray-100 text-gray-800 hover:bg-gray-200'
  }
};

export const PlayerPreferenceTags: React.FC<PlayerPreferenceTagsProps> = ({
  preferences,
  onEdit,
  showEditButton = false,
  compact = false
}) => {
  const getPreferenceColor = (category: string, value: string): string => {
    if (category === 'competitiveIntent' && PREFERENCE_COLORS.competitiveIntent[value as keyof typeof PREFERENCE_COLORS.competitiveIntent]) {
      return PREFERENCE_COLORS.competitiveIntent[value as keyof typeof PREFERENCE_COLORS.competitiveIntent];
    }
    if (category === 'communication' && PREFERENCE_COLORS.communication[value as keyof typeof PREFERENCE_COLORS.communication]) {
      return PREFERENCE_COLORS.communication[value as keyof typeof PREFERENCE_COLORS.communication];
    }
    return 'bg-slate-100 text-slate-800 hover:bg-slate-200';
  };

  if (compact) {
    return (
      <div className="space-y-3">
        {showEditButton && onEdit && (
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gaming Preferences</h3>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        )}
        
        <div className="space-y-2">
          {/* Competitive Intent */}
          {preferences.competitiveIntent.length > 0 && (
            <div className="flex items-start gap-2">
              <Gamepad2 className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex flex-wrap gap-1">
                {preferences.competitiveIntent.map((intent) => (
                  <Badge key={intent} className={getPreferenceColor('competitiveIntent', intent)} variant="secondary">
                    {getPreferenceLabel('competitiveIntent', intent)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Communication */}
          {preferences.communication.length > 0 && (
            <div className="flex items-start gap-2">
              <MessageCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex flex-wrap gap-1">
                {preferences.communication.map((comm) => (
                  <Badge key={comm} className={getPreferenceColor('communication', comm)} variant="secondary">
                    {getPreferenceLabel('communication', comm)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Playstyle */}
          {preferences.playstyle.length > 0 && (
            <div className="flex items-start gap-2">
              <Swords className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex flex-wrap gap-1">
                {preferences.playstyle.map((style) => (
                  <Badge key={style} variant="secondary" className="text-xs">
                    {getPreferenceLabel('playstyle', style)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Attitude */}
          {preferences.attitude.length > 0 && (
            <div className="flex items-start gap-2">
              <Heart className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex flex-wrap gap-1">
                {preferences.attitude.map((att) => (
                  <Badge key={att} variant="secondary" className="text-xs">
                    {getPreferenceLabel('attitude', att)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Gaming Preferences</CardTitle>
          {showEditButton && onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Preferences
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Competitive Intent */}
        {preferences.competitiveIntent.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              <span className="text-sm font-medium">{CATEGORY_TITLES.competitiveIntent}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.competitiveIntent.map((intent) => (
                <Badge key={intent} className={getPreferenceColor('competitiveIntent', intent)}>
                  {getPreferenceLabel('competitiveIntent', intent)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Communication */}
        {preferences.communication.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{CATEGORY_TITLES.communication}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.communication.map((comm) => (
                <Badge key={comm} className={getPreferenceColor('communication', comm)}>
                  {getPreferenceLabel('communication', comm)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Playstyle */}
        {preferences.playstyle.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Swords className="h-4 w-4" />
              <span className="text-sm font-medium">{CATEGORY_TITLES.playstyle}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.playstyle.map((style) => (
                <Badge key={style} variant="secondary">
                  {getPreferenceLabel('playstyle', style)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Attitude */}
        {preferences.attitude.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="text-sm font-medium">{CATEGORY_TITLES.attitude}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.attitude.map((att) => (
                <Badge key={att} variant="secondary">
                  {getPreferenceLabel('attitude', att)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {!hasCustomPreferences(preferences) && (
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-sm">Set your gaming preferences to help find compatible teammates</p>
            {showEditButton && onEdit && (
              <Button variant="link" onClick={onEdit} className="mt-2">
                Set up preferences
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 