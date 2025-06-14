
import { Label } from './ui/label';

interface PreferenceSelectorProps {
  preferences: {
    playStyle: string;
    skillLevel: string;
    communication: string;
    availability: string;
  };
  setPreferences: (preferences: any) => void;
}

const PreferenceSelector = ({ preferences, setPreferences }: PreferenceSelectorProps) => {
  const updatePreference = (key: string, value: string) => {
    setPreferences((prev: any) => ({ ...prev, [key]: value }));
  };

  const preferenceOptions = {
    playStyle: ['Chill/Casual', 'Competitive', 'Balanced', 'Learning-Focused'],
    skillLevel: ['Beginner', 'Intermediate', 'Advanced', 'Pro/Expert'],
    communication: ['Voice Chat', 'Text Only', 'Minimal Chat', 'Strategic Calls'],
    availability: ['Weekends Only', 'Weeknight Warrior', 'Flexible Schedule', 'Daily Player']
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Object.entries(preferenceOptions).map(([key, options]) => (
        <div key={key} className="space-y-2">
          <Label className="text-gray-300 capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </Label>
          <div className="space-y-2">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => updatePreference(key, option)}
                className={`w-full p-3 text-sm rounded-lg border transition-all ${
                  preferences[key as keyof typeof preferences] === option
                    ? 'bg-teal-600 border-teal-500 text-white'
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-teal-500 hover:bg-gray-700'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PreferenceSelector;
