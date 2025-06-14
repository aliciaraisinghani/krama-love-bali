
import { User, Bell, Shield, Globe, Heart, LogOut } from 'lucide-react';

const SettingsView = () => {
  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Edit Profile', description: 'Update your photos and bio' },
        { icon: Heart, label: 'Dating Preferences', description: 'Age range, distance, values' },
        { icon: Bell, label: 'Notifications', description: 'Matches, messages, and reminders' }
      ]
    },
    {
      title: 'Privacy & Safety',
      items: [
        { icon: Shield, label: 'Privacy Settings', description: 'Control who can see your profile' },
        { icon: Globe, label: 'Location Settings', description: 'Manage location sharing' }
      ]
    },
    {
      title: 'Cultural Values',
      items: [
        { icon: Heart, label: 'Value Matching', description: 'Prioritize cultural compatibility' }
      ]
    }
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-balinese-earth mb-2">Settings</h2>
        <p className="text-balinese-earth/70">Customize your experience</p>
      </div>

      {/* Settings Groups */}
      {settingsGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-sunset">
            <h3 className="font-semibold text-white">{group.title}</h3>
          </div>
          
          <div className="divide-y divide-orange-100">
            {group.items.map((item, itemIndex) => (
              <button
                key={itemIndex}
                className="w-full flex items-center space-x-4 p-4 hover:bg-orange-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-balinese-sunset/10 rounded-full flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-balinese-sunset" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-balinese-earth">{item.label}</h4>
                  <p className="text-sm text-balinese-earth/70">{item.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Cultural Values Card */}
      <div className="bg-gradient-earth rounded-2xl p-6 text-white shadow-lg">
        <h3 className="font-semibold mb-3 flex items-center">
          <Heart className="h-5 w-5 mr-2" />
          Our Balinese Values
        </h3>
        <div className="space-y-2 text-sm opacity-90">
          <p>• Tri Hita Karana - Harmony with God, nature, and fellow humans</p>
          <p>• Respect for elders and cultural traditions</p>
          <p>• Community and family-centered relationships</p>
          <p>• Sustainable living and environmental protection</p>
        </div>
      </div>

      {/* App Info */}
      <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
        <h3 className="font-semibold text-balinese-earth mb-2">Soulmate Bali</h3>
        <p className="text-sm text-balinese-earth/70 mb-4">
          Connecting hearts through authentic Balinese values
        </p>
        <div className="text-xs text-balinese-earth/50">
          Version 1.0 • Made with 💛 in Bali
        </div>
      </div>

      {/* Sign Out */}
      <button className="w-full bg-white rounded-2xl p-4 shadow-lg flex items-center justify-center space-x-2 text-red-600 hover:bg-red-50 transition-colors">
        <LogOut className="h-5 w-5" />
        <span className="font-medium">Sign Out</span>
      </button>
    </div>
  );
};

export default SettingsView;
