export interface PlayerPreferences {
  competitiveIntent: string[];
  communication: string[];
  playstyle: string[];
  attitude: string[];
}

export const PREFERENCE_OPTIONS = {
  competitiveIntent: [
    { value: 'for-fun', label: 'Playing for Fun', description: 'Casual gameplay, enjoying the experience' },
    { value: 'play-to-win', label: 'Play to Win', description: 'Focused on winning and improvement' }
  ],
  communication: [
    { value: 'voice-comm', label: 'Voice Communication', description: 'Prefers voice chat for coordination' },
    { value: 'text-chat', label: 'Text Chat', description: 'Uses text chat for communication' },
    { value: 'no-comms', label: 'No Communication', description: 'Prefers minimal communication' }
  ],
  playstyle: [
    { value: 'aggressive', label: 'Aggressive', description: 'Likes to make plays and take risks' },
    { value: 'defensive', label: 'Defensive', description: 'Prefers safe, calculated plays' },
    { value: 'early-game', label: 'Early Game Focused', description: 'Focuses on early game dominance' },
    { value: 'late-game', label: 'Late Game Focused', description: 'Plays for scaling and late game' },
    { value: 'farm-focused', label: 'Farm Focused', description: 'Prioritizes farming and resource management' },
    { value: 'team-fighter', label: 'Team Fighter', description: 'Excels in team fights and group plays' },
    { value: 'split-pusher', label: 'Split Pusher', description: 'Prefers side lane pressure and 1v1s' },
    { value: 'roamer', label: 'Roamer', description: 'Likes to move around the map and help teammates' },
    { value: 'objective-focused', label: 'Objective Focused', description: 'Prioritizes dragons, baron, and towers' }
  ],
  attitude: [
    { value: 'positive', label: 'Positive', description: 'Maintains a positive attitude' },
    { value: 'encouraging', label: 'Encouraging', description: 'Supports and motivates teammates' },
    { value: 'focused', label: 'Focused', description: 'Stays concentrated on the game' },
    { value: 'patient', label: 'Patient', description: 'Remains calm under pressure' },
    { value: 'adaptable', label: 'Adaptable', description: 'Flexible with strategies and team needs' },
    { value: 'competitive', label: 'Competitive', description: 'Driven to perform and improve' },
    { value: 'analytical', label: 'Analytical', description: 'Thinks strategically about the game' },
    { value: 'chill', label: 'Chill', description: 'Relaxed and easy-going approach' },
    { value: 'mentor', label: 'Mentor', description: 'Enjoys helping others learn and improve' }
  ]
} as const;

export const DEFAULT_PREFERENCES: PlayerPreferences = {
  competitiveIntent: [],
  communication: [],
  playstyle: [],
  attitude: []
};

export const getPreferenceLabel = (category: keyof typeof PREFERENCE_OPTIONS, value: string): string => {
  const option = PREFERENCE_OPTIONS[category].find(opt => opt.value === value);
  return option?.label || value;
};

export const getPreferenceDescription = (category: keyof typeof PREFERENCE_OPTIONS, value: string): string => {
  const option = PREFERENCE_OPTIONS[category].find(opt => opt.value === value);
  return option?.description || '';
};

export const hasCustomPreferences = (preferences: PlayerPreferences): boolean => {
  return (
    preferences.competitiveIntent.length > 0 ||
    preferences.communication.length > 0 ||
    preferences.playstyle.length > 0 ||
    preferences.attitude.length > 0
  );
}; 