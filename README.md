# GameMatch - Find Your Perfect Gaming Companion

A modern web application for Marvel Rivals players to connect, find teammates, and build their gaming community.

## Features

- **Player Matching**: Connect with Marvel Rivals players based on skill level, play style, and preferences
- **Profile Management**: Create detailed gaming profiles with your preferences and playstyle
- **Real-time Messaging**: Communicate with potential teammates through our integrated chat system
- **Cross-Platform**: Find players across different platforms and regions
- **Skill-Based Matching**: Filter players by rank, role preferences, and gaming schedule

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS
- **State Management**: React Query for server state
- **Build Tool**: Vite for fast development and building
- **Styling**: Tailwind CSS with custom gaming theme

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd krama-love-bali
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── ProfileTab.tsx  # Profile management
│   ├── LoginView.tsx   # Authentication
│   └── ...
├── pages/              # Main application pages
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── App.tsx             # Main application component
```

## Features in Detail

### Authentication System
- Secure login and registration
- Social authentication support (Google, GitHub)
- Profile validation and management

### Player Profiles
- Detailed gaming profiles with preferences
- Skill level and playstyle indicators
- Communication preferences
- Timezone and availability settings

### Matching Algorithm
- Compatibility scoring based on multiple factors
- Preference-based filtering
- Geographic and timezone considerations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
