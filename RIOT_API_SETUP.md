# Riot Games API Integration

## Overview
This application now integrates with the official Riot Games API to verify League of Legends accounts and fetch real player statistics.

## Setup Instructions

### 1. Get Your Riot API Key
1. Visit [Riot Developer Portal](https://developer.riotgames.com/)
2. Sign in with your Riot Games account
3. Create a new app or use the default development key
4. Copy your API key (starts with `RGAPI-`)

### 2. Environment Configuration
Create a `.env` file in the project root with:
```
VITE_RIOT_API_KEY=your_api_key_here
```

Example:
```
VITE_RIOT_API_KEY=RGAPI-12345678-1234-1234-1234-123456789012
```

### 3. API Features Implemented

#### Account Verification
- **Endpoint Used**: `/riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}`
- **Function**: Verifies that a Riot ID exists before allowing connection
- **Error Handling**: Provides specific error messages for different failure cases

#### Player Statistics
- **Summoner Data**: `/lol/summoner/v4/summoners/by-puuid/{puuid}`
- **Ranked Stats**: `/lol/league/v4/entries/by-summoner/{summonerId}`
- **Champion Mastery**: `/lol/champion-mastery/v4/champion-masteries/by-summoner/{summonerId}/top`

#### Real-time Data Display
- Live summoner level and name
- Current ranked tier, division, and LP
- Win/loss record and win rate
- Top 3 champion masteries with levels and points
- Account information and last update timestamp

### 4. API Rate Limits
- **Development Key**: 100 requests every 2 minutes
- **Production Key**: Higher limits available
- The app includes rate limit error handling

### 5. Supported Regions
Currently configured for:
- **Americas**: NA1 (North America)
- Can be extended to support other regions (EUW1, EUN1, KR, etc.)

### 6. Error Handling
- Account not found (404)
- Invalid API key (403)
- Rate limit exceeded (429)
- Network errors and timeouts
- User-friendly error messages with retry suggestions

### 7. Data Fetching Flow
1. User enters Riot ID (GameName#TAG)
2. App verifies account exists via Riot Account API
3. Fetches summoner data using PUUID
4. Parallel fetch of ranked stats and champion mastery
5. Real-time display of all statistics
6. Auto-refresh capability with "Refresh Stats" button

### 8. Privacy & Security
- API key stored as environment variable
- No sensitive data stored locally
- All API calls made from frontend (suitable for development)
- For production, consider server-side API calls

## Development Notes

### File Structure
- `src/lib/riotApi.ts` - Main API service with all endpoints
- `src/components/AccountConnection.tsx` - Account verification flow
- `src/components/ProfileTab.tsx` - Statistics display and profile management

### TypeScript Interfaces
All API responses are properly typed with TypeScript interfaces for:
- `RiotAccount`
- `SummonerData`
- `RankedData`
- `ChampionMastery`
- `PlayerStats`

### Champion Name Mapping
Includes a comprehensive champion ID to name mapping for displaying champion mastery data with readable names.

## Testing
To test the integration:
1. Ensure your API key is valid and in the `.env` file
2. Use a real Riot ID (e.g., `Doublelift#NA1`)
3. Check browser console for any API errors
4. Verify statistics update correctly

## Troubleshooting
- **"API key not configured"**: Check your `.env` file
- **"Account not found"**: Verify the Riot ID format (Name#Tag)
- **"Rate limit exceeded"**: Wait a few minutes before trying again
- **Network errors**: Check internet connection and API status 