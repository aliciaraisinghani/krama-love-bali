import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  PlayerPreferences, 
  PREFERENCE_OPTIONS, 
  DEFAULT_PREFERENCES,
  getPreferenceLabel 
} from '@/lib/playerPreferences';
import { 
  Gamepad2, 
  MessageCircle, 
  Swords, 
  Heart,
  Save,
  RotateCcw,
  Palette,
  BrainCircuit
} from 'lucide-react';

interface PlayerPreferencesFormProps {
  initialPreferences?: PlayerPreferences;
  onSave: (preferences: PlayerPreferences) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

const CATEGORY_ICONS = {
  competitiveIntent: Gamepad2,
  communication: MessageCircle,
  playstyle: Palette,
  attitude: BrainCircuit
};

const CATEGORY_TITLES = {
  competitiveIntent: 'Competitive Intent',
  communication: 'Communication Style',
  playstyle: 'Playstyle',
  attitude: 'Attitude & Mindset'
};

const CATEGORY_DESCRIPTIONS = {
  competitiveIntent: 'How do you approach the game?',
  communication: 'How do you prefer to communicate with teammates?',
  playstyle: 'Select all playstyles that describe you (multiple selections allowed)',
  attitude: 'What describes your attitude and mindset? (multiple selections allowed)'
};

export const PlayerPreferencesForm: React.FC<PlayerPreferencesFormProps> = ({
  initialPreferences = DEFAULT_PREFERENCES,
  onSave,
  onCancel,
  isEditing = false
}) => {
  const [preferences, setPreferences] = useState<PlayerPreferences>(initialPreferences);

  const handleCompetitiveIntentChange = (value: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      competitiveIntent: checked 
        ? [...prev.competitiveIntent, value]
        : prev.competitiveIntent.filter(intent => intent !== value)
    }));
  };

  const handleCommunicationChange = (value: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      communication: checked 
        ? [...prev.communication, value]
        : prev.communication.filter(comm => comm !== value)
    }));
  };

  const handlePlaystyleChange = (value: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      playstyle: checked 
        ? [...prev.playstyle, value]
        : prev.playstyle.filter(style => style !== value)
    }));
  };

  const handleAttitudeChange = (value: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      attitude: checked 
        ? [...prev.attitude, value]
        : prev.attitude.filter(att => att !== value)
    }));
  };

  const handleReset = () => {
    setPreferences(initialPreferences);
  };

  const handleSave = () => {
    onSave(preferences);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">
          {isEditing ? 'Edit Your Preferences' : 'Set Your Gaming Preferences'}
        </h2>
        <p className="text-muted-foreground">
          {isEditing 
            ? 'Update your preferences to help find better teammates'
            : 'Help us match you with compatible teammates by setting your preferences'
          }
        </p>
      </div>

      {/* Competitive Intent */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            {CATEGORY_TITLES.competitiveIntent}
          </CardTitle>
          <CardDescription>
            {CATEGORY_DESCRIPTIONS.competitiveIntent}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {PREFERENCE_OPTIONS.competitiveIntent.map((option) => (
              <div key={option.value} className="flex items-start space-x-3">
                <Checkbox
                  id={`competitive-${option.value}`}
                  checked={preferences.competitiveIntent.includes(option.value)}
                  onCheckedChange={(checked) => 
                    handleCompetitiveIntentChange(option.value, checked as boolean)
                  }
                />
                <div className="space-y-1">
                  <Label 
                    htmlFor={`competitive-${option.value}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {option.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {preferences.competitiveIntent.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">Selected competitive intent:</p>
              <div className="flex flex-wrap gap-2">
                {preferences.competitiveIntent.map((intent) => (
                  <Badge key={intent} variant="secondary">
                    {getPreferenceLabel('competitiveIntent', intent)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Communication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {CATEGORY_TITLES.communication}
          </CardTitle>
          <CardDescription>
            {CATEGORY_DESCRIPTIONS.communication}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {PREFERENCE_OPTIONS.communication.map((option) => (
              <div key={option.value} className="flex items-start space-x-3">
                <Checkbox
                  id={`comm-${option.value}`}
                  checked={preferences.communication.includes(option.value)}
                  onCheckedChange={(checked) => 
                    handleCommunicationChange(option.value, checked as boolean)
                  }
                />
                <div className="space-y-1">
                  <Label 
                    htmlFor={`comm-${option.value}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {option.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {preferences.communication.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">Selected communication:</p>
              <div className="flex flex-wrap gap-2">
                {preferences.communication.map((comm) => (
                  <Badge key={comm} variant="secondary">
                    {getPreferenceLabel('communication', comm)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Playstyle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            {CATEGORY_TITLES.playstyle}
          </CardTitle>
          <CardDescription>
            {CATEGORY_DESCRIPTIONS.playstyle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {PREFERENCE_OPTIONS.playstyle.map((option) => (
              <div key={option.value} className="flex items-start space-x-3">
                <Checkbox
                  id={`playstyle-${option.value}`}
                  checked={preferences.playstyle.includes(option.value)}
                  onCheckedChange={(checked) => 
                    handlePlaystyleChange(option.value, checked as boolean)
                  }
                />
                <div className="space-y-1">
                  <Label 
                    htmlFor={`playstyle-${option.value}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {option.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {preferences.playstyle.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">Selected playstyles:</p>
              <div className="flex flex-wrap gap-2">
                {preferences.playstyle.map((style) => (
                  <Badge key={style} variant="secondary">
                    {getPreferenceLabel('playstyle', style)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attitude */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            {CATEGORY_TITLES.attitude}
          </CardTitle>
          <CardDescription>
            {CATEGORY_DESCRIPTIONS.attitude}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {PREFERENCE_OPTIONS.attitude.map((option) => (
              <div key={option.value} className="flex items-start space-x-3">
                <Checkbox
                  id={`attitude-${option.value}`}
                  checked={preferences.attitude.includes(option.value)}
                  onCheckedChange={(checked) => 
                    handleAttitudeChange(option.value, checked as boolean)
                  }
                />
                <div className="space-y-1">
                  <Label 
                    htmlFor={`attitude-${option.value}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {option.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {preferences.attitude.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">Selected attitudes:</p>
              <div className="flex flex-wrap gap-2">
                {preferences.attitude.map((att) => (
                  <Badge key={att} variant="secondary">
                    {getPreferenceLabel('attitude', att)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <div className="flex gap-2">
          {isEditing && onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
        <Button onClick={handleSave} className="min-w-[120px]">
          <Save className="h-4 w-4 mr-2" />
          {isEditing ? 'Save Changes' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}; 