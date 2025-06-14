import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PlayerPreferences, 
  PREFERENCE_OPTIONS, 
  DEFAULT_PREFERENCES 
} from '@/lib/playerPreferences';
import { 
  Gamepad2, 
  MessageCircle, 
  Swords, 
  Heart,
  ArrowRight,
  ArrowLeft,
  X,
  Check
} from 'lucide-react';

interface PreferencesWizardProps {
  initialPreferences?: PlayerPreferences;
  onComplete: (preferences: PlayerPreferences) => void;
  onCancel?: () => void;
  playerName?: string;
}

type WizardStep = 'competitive' | 'communication' | 'playstyle' | 'attitude' | 'complete';

const STEPS: { key: WizardStep; title: string; icon: any; description: string }[] = [
  {
    key: 'competitive',
    title: 'Competitive Intent',
    icon: Gamepad2,
    description: 'How do you approach the game?'
  },
  {
    key: 'communication',
    title: 'Communication Style',
    icon: MessageCircle,
    description: 'How do you prefer to communicate?'
  },
  {
    key: 'playstyle',
    title: 'Playstyle Preferences',
    icon: Swords,
    description: 'Select all that describe your playstyle'
  },
  {
    key: 'attitude',
    title: 'Attitude & Mindset',
    icon: Heart,
    description: 'What describes your gaming attitude?'
  }
];

export const PreferencesWizard: React.FC<PreferencesWizardProps> = ({
  initialPreferences = DEFAULT_PREFERENCES,
  onComplete,
  onCancel,
  playerName
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('competitive');
  const [preferences, setPreferences] = useState<PlayerPreferences>(initialPreferences);

  const currentStepIndex = STEPS.findIndex(step => step.key === currentStep);
  const currentStepData = STEPS[currentStepIndex];

  const handleCompetitiveToggle = (value: string) => {
    setPreferences(prev => ({
      ...prev,
      competitiveIntent: prev.competitiveIntent.includes(value)
        ? prev.competitiveIntent.filter(intent => intent !== value)
        : [...prev.competitiveIntent, value]
    }));
  };

  const handleCommunicationToggle = (value: string) => {
    setPreferences(prev => ({
      ...prev,
      communication: prev.communication.includes(value)
        ? prev.communication.filter(comm => comm !== value)
        : [...prev.communication, value]
    }));
  };

  const handlePlaystyleToggle = (value: string) => {
    setPreferences(prev => ({
      ...prev,
      playstyle: prev.playstyle.includes(value)
        ? prev.playstyle.filter(style => style !== value)
        : [...prev.playstyle, value]
    }));
  };

  const handleAttitudeToggle = (value: string) => {
    setPreferences(prev => ({
      ...prev,
      attitude: prev.attitude.includes(value)
        ? prev.attitude.filter(att => att !== value)
        : [...prev.attitude, value]
    }));
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].key);
    } else {
      setCurrentStep('complete');
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].key);
    }
  };

  const handleComplete = () => {
    onComplete(preferences);
  };

  const renderBubbleButton = (
    option: { value: string; label: string; description: string },
    isSelected: boolean,
    onClick: () => void,
    showRemove: boolean = false
  ) => (
    <button
      key={option.value}
      onClick={onClick}
      className={`
        relative px-8 py-4 rounded-full border-2 transition-all duration-200 text-center font-medium text-base
        ${isSelected 
          ? 'bg-blue-500 text-white border-blue-500 shadow-lg transform scale-105' 
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md'
        }
      `}
    >
      <div className="flex items-center justify-center gap-2">
        <span className="font-medium">
          {option.label}
        </span>
        {isSelected && showRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors ml-2"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        )}
        {isSelected && !showRemove && (
          <Check className="w-4 h-4 text-white ml-1" />
        )}
      </div>
    </button>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'competitive':
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3 justify-center">
              {PREFERENCE_OPTIONS.competitiveIntent.map((option) =>
                renderBubbleButton(
                  option,
                  preferences.competitiveIntent.includes(option.value),
                  () => handleCompetitiveToggle(option.value),
                  true
                )
              )}
            </div>
            <div className="pt-6 flex justify-between items-center border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStepIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex flex-wrap gap-2 flex-1 mx-4 justify-center">
                {preferences.competitiveIntent.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-gray-500 font-medium">Selected ({preferences.competitiveIntent.length}):</span>
                    {preferences.competitiveIntent.map((intent) => (
                      <Badge key={intent} variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                        {PREFERENCE_OPTIONS.competitiveIntent.find(opt => opt.value === intent)?.label}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <Button onClick={handleNext}>
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'communication':
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3 justify-center">
              {PREFERENCE_OPTIONS.communication.map((option) =>
                renderBubbleButton(
                  option,
                  preferences.communication.includes(option.value),
                  () => handleCommunicationToggle(option.value),
                  true
                )
              )}
            </div>
            <div className="pt-6 flex justify-between items-center border-t">
              <Button
                variant="outline"
                onClick={handleBack}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex flex-wrap gap-2 flex-1 mx-4 justify-center">
                {preferences.communication.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-gray-500 font-medium">Selected ({preferences.communication.length}):</span>
                    {preferences.communication.map((comm) => (
                      <Badge key={comm} variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                        {PREFERENCE_OPTIONS.communication.find(opt => opt.value === comm)?.label}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <Button onClick={handleNext}>
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'playstyle':
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3 justify-center">
              {PREFERENCE_OPTIONS.playstyle.map((option) =>
                renderBubbleButton(
                  option,
                  preferences.playstyle.includes(option.value),
                  () => handlePlaystyleToggle(option.value),
                  true
                )
              )}
            </div>
            <div className="pt-6 flex justify-between items-center border-t">
              <Button
                variant="outline"
                onClick={handleBack}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex flex-wrap gap-2 flex-1 mx-4 justify-center">
                {preferences.playstyle.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-gray-500 font-medium">Selected ({preferences.playstyle.length}):</span>
                    {preferences.playstyle.map((style) => (
                      <Badge key={style} variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                        {PREFERENCE_OPTIONS.playstyle.find(opt => opt.value === style)?.label}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <Button onClick={handleNext}>
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'attitude':
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3 justify-center">
              {PREFERENCE_OPTIONS.attitude.map((option) =>
                renderBubbleButton(
                  option,
                  preferences.attitude.includes(option.value),
                  () => handleAttitudeToggle(option.value),
                  true
                )
              )}
            </div>
            <div className="pt-6 flex justify-between items-center border-t">
              <Button
                variant="outline"
                onClick={handleBack}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex flex-wrap gap-2 flex-1 mx-4 justify-center">
                {preferences.attitude.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-gray-500 font-medium">Selected ({preferences.attitude.length}):</span>
                    {preferences.attitude.map((att) => (
                      <Badge key={att} variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                        {PREFERENCE_OPTIONS.attitude.find(opt => opt.value === att)?.label}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <Button onClick={handleNext}>
                Complete Setup <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-100 mb-2">
                All Set{playerName ? `, ${playerName}` : ''}! 🎉
              </h2>
              <p className="text-gray-300">
                Your gaming preferences have been configured. You can always update them later from your profile.
              </p>
            </div>
            
            {/* Preferences Summary */}
            <div className="bg-gray-800 rounded-lg p-6 text-left border border-gray-700">
              <h3 className="font-semibold text-gray-100 mb-4">Your Preferences Summary:</h3>
              <div className="space-y-3">
                {preferences.competitiveIntent.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Gamepad2 className="w-5 h-5 text-gray-400 mt-0.5" />
                    <span className="text-sm text-gray-300">Competitive Intent:</span>
                    <div className="flex flex-wrap gap-1">
                      {preferences.competitiveIntent.map((intent) => (
                        <Badge key={intent} variant="outline" className="text-xs border-gray-600 text-gray-200">
                          {PREFERENCE_OPTIONS.competitiveIntent.find(opt => opt.value === intent)?.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {preferences.communication.length > 0 && (
                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                    <span className="text-sm text-gray-300">Communication:</span>
                    <div className="flex flex-wrap gap-1">
                      {preferences.communication.map((comm) => (
                        <Badge key={comm} variant="outline" className="text-xs border-gray-600 text-gray-200">
                          {PREFERENCE_OPTIONS.communication.find(opt => opt.value === comm)?.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {preferences.playstyle.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Swords className="w-5 h-5 text-gray-400 mt-0.5" />
                    <span className="text-sm text-gray-300">Playstyle:</span>
                    <div className="flex flex-wrap gap-1">
                      {preferences.playstyle.map((style) => (
                        <Badge key={style} variant="outline" className="text-xs border-gray-600 text-gray-200">
                          {PREFERENCE_OPTIONS.playstyle.find(opt => opt.value === style)?.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {preferences.attitude.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-gray-400 mt-0.5" />
                    <span className="text-sm text-gray-300">Attitude:</span>
                    <div className="flex flex-wrap gap-1">
                      {preferences.attitude.map((att) => (
                        <Badge key={att} variant="outline" className="text-xs border-gray-600 text-gray-200">
                          {PREFERENCE_OPTIONS.attitude.find(opt => opt.value === att)?.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {preferences.competitiveIntent.length === 0 && preferences.communication.length === 0 && preferences.playstyle.length === 0 && preferences.attitude.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-gray-400 text-sm">No preferences selected - you can set them up later from your profile.</p>
                  </div>
                )}
              </div>
            </div>

            <Button onClick={handleComplete} size="lg" className="w-full">
              Continue to League Hub
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  if (currentStep === 'complete') {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">
            Step {currentStepIndex + 1} of {STEPS.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(((currentStepIndex + 1) / STEPS.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-8">
          {/* Step Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <currentStepData.icon className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-100 mb-3">
              {currentStepData.title}
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              {currentStepData.description}
            </p>
          </div>

          {/* Step Content */}
          {renderStepContent()}


        </CardContent>
      </Card>
    </div>
  );
}; 
