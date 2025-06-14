import os
import requests
import json
import time
from dotenv import load_dotenv
from typing import Set, List, Dict
from collections import deque

load_dotenv()

RIOT_API_KEY = os.getenv("RIOT_API_KEY")
BASE_URL = "https://americas.api.riotgames.com"

# Rate limiting - Riot API allows 100 requests per 2 minutes for personal API keys
REQUEST_DELAY = 1.2  # seconds between requests
MAX_PLAYERS = 500    # Maximum number of players to discover
MAX_DEPTH = 3        # How many levels deep to go (starting player -> their matches -> their teammates -> their matches, etc.)

def make_api_request(url: str, headers: Dict[str, str]) -> Dict:
    """Make an API request with rate limiting"""
    time.sleep(REQUEST_DELAY)
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    elif response.status_code == 429:  # Rate limited
        print("⚠️  Rate limited, waiting 2 minutes...")
        time.sleep(120)
        return make_api_request(url, headers)  # Retry
    else:
        print(f"❌ API Error {response.status_code}: {response.text}")
        return None

def get_puuid_from_riot_id(riot_id: str) -> str:
    """Get PUUID from Riot ID"""
    if not RIOT_API_KEY:
        raise ValueError("RIOT_API_KEY not found in .env file")

    try:
        game_name, tag_line = riot_id.split('#')
    except ValueError:
        return None

    url = f"{BASE_URL}/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}"
    headers = {"X-Riot-Token": RIOT_API_KEY}
    
    data = make_api_request(url, headers)
    return data.get("puuid") if data else None

def get_riot_id_from_puuid(puuid: str) -> str:
    """Get Riot ID from PUUID"""
    if not RIOT_API_KEY:
        raise ValueError("RIOT_API_KEY not found in .env file")

    url = f"{BASE_URL}/riot/account/v1/accounts/by-puuid/{puuid}"
    headers = {"X-Riot-Token": RIOT_API_KEY}
    
    data = make_api_request(url, headers)
    if data:
        return f"{data['gameName']}#{data['tagLine']}"
    return None

def get_recent_matches(puuid: str, count: int = 10) -> List[str]:
    """Get recent match IDs for a player"""
    if not RIOT_API_KEY:
        raise ValueError("RIOT_API_KEY not found in .env file")
    
    url = f"{BASE_URL}/lol/match/v5/matches/by-puuid/{puuid}/ids"
    headers = {"X-Riot-Token": RIOT_API_KEY}
    params = {"count": count}
    
    response = requests.get(url, headers=headers, params=params)
    time.sleep(REQUEST_DELAY)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"❌ Error fetching matches for puuid {puuid}: {response.status_code}")
        return []

def get_match_participants(match_id: str) -> List[str]:
    """Get all participant PUUIDs from a match"""
    if not RIOT_API_KEY:
        raise ValueError("RIOT_API_KEY not found in .env file")
    
    url = f"{BASE_URL}/lol/match/v5/matches/{match_id}"
    headers = {"X-Riot-Token": RIOT_API_KEY}
    
    data = make_api_request(url, headers)
    if not data:
        return []
    
    participants = []
    for participant in data["info"]["participants"]:
        participants.append(participant["puuid"])
    
    return participants

def discover_players_recursive(starting_riot_id: str, max_players: int = MAX_PLAYERS, max_depth: int = MAX_DEPTH) -> Set[str]:
    """
    Recursively discover players from match history
    Returns a set of Riot IDs
    """
    print(f"🔍 Starting player discovery from {starting_riot_id}")
    print(f"📊 Target: {max_players} players, Max depth: {max_depth}")
    print("=" * 60)
    
    discovered_puuids = set()
    discovered_riot_ids = set()
    
    # Queue for BFS: (puuid, riot_id, depth)
    queue = deque()
    
    # Start with the initial player
    starting_puuid = get_puuid_from_riot_id(starting_riot_id)
    if not starting_puuid:
        print(f"❌ Could not find PUUID for {starting_riot_id}")
        return set()
    
    queue.append((starting_puuid, starting_riot_id, 0))
    discovered_puuids.add(starting_puuid)
    discovered_riot_ids.add(starting_riot_id)
    
    print(f"✅ Starting with {starting_riot_id}")
    
    while queue and len(discovered_riot_ids) < max_players:
        current_puuid, current_riot_id, depth = queue.popleft()
        
        if depth >= max_depth:
            continue
        
        print(f"\n🎮 Processing {current_riot_id} (depth {depth}, found {len(discovered_riot_ids)} players)")
        
        # Get recent matches for current player
        match_ids = get_recent_matches(current_puuid, 5)  # Get 5 recent matches
        
        for match_id in match_ids:
            if len(discovered_riot_ids) >= max_players:
                break
                
            print(f"   🔍 Analyzing match {match_id[:8]}...")
            
            # Get all participants from this match
            participant_puuids = get_match_participants(match_id)
            
            new_players_in_match = 0
            for puuid in participant_puuids:
                if len(discovered_riot_ids) >= max_players:
                    break
                    
                if puuid not in discovered_puuids:
                    # Get Riot ID for this PUUID
                    riot_id = get_riot_id_from_puuid(puuid)
                    
                    if riot_id:
                        discovered_puuids.add(puuid)
                        discovered_riot_ids.add(riot_id)
                        
                        # Add to queue for further exploration if within depth limit
                        if depth + 1 < max_depth:
                            queue.append((puuid, riot_id, depth + 1))
                        
                        new_players_in_match += 1
                        print(f"      ✅ Found: {riot_id}")
            
            print(f"   📈 Added {new_players_in_match} new players from this match")
    
    print(f"\n🎉 Discovery complete! Found {len(discovered_riot_ids)} unique players")
    return discovered_riot_ids

def save_players_to_file(riot_ids: Set[str], filename: str = "discovered_players.txt"):
    """Save discovered Riot IDs to a file"""
    riot_ids_list = sorted(list(riot_ids))
    
    with open(filename, 'w') as f:
        for riot_id in riot_ids_list:
            f.write(f"{riot_id}\n")
    
    print(f"💾 Saved {len(riot_ids_list)} players to {filename}")
    
    # Also save as JSON for easier programmatic access
    json_filename = filename.replace('.txt', '.json')
    with open(json_filename, 'w') as f:
        json.dump(riot_ids_list, f, indent=2)
    
    print(f"💾 Also saved as JSON to {json_filename}")

def load_players_from_file(filename: str = "discovered_players.txt") -> List[str]:
    """Load Riot IDs from a file"""
    try:
        with open(filename, 'r') as f:
            return [line.strip() for line in f if line.strip()]
    except FileNotFoundError:
        print(f"❌ File {filename} not found")
        return []

def main():
    """Main function to run the player discovery"""
    print("🚀 League of Legends Player Discovery Tool")
    print("=" * 60)
    
    # Configuration
    starting_player = "RareChubber#NA1"
    max_players = 200  # Reasonable number for testing
    max_depth = 2      # 2 levels should give us plenty of players
    
    print(f"🎯 Configuration:")
    print(f"   Starting player: {starting_player}")
    print(f"   Max players: {max_players}")
    print(f"   Max depth: {max_depth}")
    print(f"   Rate limit: {REQUEST_DELAY}s between requests")
    
    # Estimate time
    estimated_requests = max_players * 3  # Rough estimate
    estimated_time = (estimated_requests * REQUEST_DELAY) / 60
    print(f"   ⏱️  Estimated time: ~{estimated_time:.1f} minutes")
    
    input("\nPress Enter to start discovery...")
    
    try:
        # Discover players
        discovered_players = discover_players_recursive(
            starting_player, 
            max_players=max_players, 
            max_depth=max_depth
        )
        
        if discovered_players:
            # Save to file
            save_players_to_file(discovered_players)
            
            # Print summary
            print(f"\n📊 Summary:")
            print(f"   Total players discovered: {len(discovered_players)}")
            print(f"   Saved to: discovered_players.txt and discovered_players.json")
            
            # Show first 10 players as preview
            print(f"\n👥 First 10 players discovered:")
            for i, riot_id in enumerate(sorted(list(discovered_players))[:10], 1):
                print(f"   {i:2d}. {riot_id}")
            
            if len(discovered_players) > 10:
                print(f"   ... and {len(discovered_players) - 10} more")
        
        else:
            print("❌ No players discovered")
    
    except KeyboardInterrupt:
        print("\n⚠️  Discovery interrupted by user")
    except Exception as e:
        print(f"\n❌ Error during discovery: {e}")

if __name__ == "__main__":
    main() 