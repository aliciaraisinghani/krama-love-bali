import os
import requests
import json
import time
from dotenv import load_dotenv

load_dotenv()

RIOT_API_KEY = os.getenv("RIOT_API_KEY")
BASE_URL = "https://americas.api.riotgames.com"

def get_puuid(riot_id: str):
    """Get PUUID from Riot ID"""
    try:
        game_name, tag_line = riot_id.split('#')
    except ValueError:
        return None

    url = f"{BASE_URL}/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}"
    headers = {"X-Riot-Token": RIOT_API_KEY}
    
    response = requests.get(url, headers=headers)
    time.sleep(1)  # Rate limiting
    
    if response.status_code == 200:
        return response.json().get("puuid")
    return None

def get_riot_id_from_puuid(puuid: str):
    """Get Riot ID from PUUID"""
    url = f"{BASE_URL}/riot/account/v1/accounts/by-puuid/{puuid}"
    headers = {"X-Riot-Token": RIOT_API_KEY}
    
    response = requests.get(url, headers=headers)
    time.sleep(1)  # Rate limiting
    
    if response.status_code == 200:
        data = response.json()
        return f"{data['gameName']}#{data['tagLine']}"
    return None

def get_recent_matches(puuid: str, count: int = 5):
    """Get recent match IDs"""
    url = f"{BASE_URL}/lol/match/v5/matches/by-puuid/{puuid}/ids"
    headers = {"X-Riot-Token": RIOT_API_KEY}
    params = {"count": count}
    
    response = requests.get(url, headers=headers, params=params)
    time.sleep(1)  # Rate limiting
    
    if response.status_code == 200:
        return response.json()
    return []

def get_match_participants(match_id: str):
    """Get all participant PUUIDs from a match"""
    url = f"{BASE_URL}/lol/match/v5/matches/{match_id}"
    headers = {"X-Riot-Token": RIOT_API_KEY}
    
    response = requests.get(url, headers=headers)
    time.sleep(1)  # Rate limiting
    
    if response.status_code == 200:
        data = response.json()
        return [p["puuid"] for p in data["info"]["participants"]]
    return []

def quick_discover_players(starting_riot_id: str = "RareChubber#NA1", max_players: int = 50):
    """Quick discovery of players from recent matches"""
    print(f"🔍 Quick player discovery from {starting_riot_id}")
    print(f"🎯 Target: {max_players} players")
    print("=" * 50)
    
    discovered_riot_ids = set()
    
    # Get starting player's PUUID
    starting_puuid = get_puuid(starting_riot_id)
    if not starting_puuid:
        print(f"❌ Could not find {starting_riot_id}")
        return set()
    
    discovered_riot_ids.add(starting_riot_id)
    print(f"✅ Starting with {starting_riot_id}")
    
    # Get their recent matches
    match_ids = get_recent_matches(starting_puuid, 10)
    print(f"📊 Found {len(match_ids)} recent matches")
    
    for i, match_id in enumerate(match_ids, 1):
        if len(discovered_riot_ids) >= max_players:
            break
            
        print(f"\n🎮 Processing match {i}/{len(match_ids)}: {match_id[:8]}...")
        
        # Get all participants
        participant_puuids = get_match_participants(match_id)
        print(f"   👥 Found {len(participant_puuids)} participants")
        
        new_players = 0
        for puuid in participant_puuids:
            if len(discovered_riot_ids) >= max_players:
                break
                
            riot_id = get_riot_id_from_puuid(puuid)
            if riot_id and riot_id not in discovered_riot_ids:
                discovered_riot_ids.add(riot_id)
                new_players += 1
                print(f"      ✅ {riot_id}")
        
        print(f"   📈 Added {new_players} new players (total: {len(discovered_riot_ids)})")
    
    return discovered_riot_ids

def save_to_files(riot_ids: set, prefix: str = "quick_discovered"):
    """Save discovered players to files"""
    riot_ids_list = sorted(list(riot_ids))
    
    # Save as text file
    txt_file = f"{prefix}_players.txt"
    with open(txt_file, 'w') as f:
        for riot_id in riot_ids_list:
            f.write(f"{riot_id}\n")
    
    # Save as JSON
    json_file = f"{prefix}_players.json"
    with open(json_file, 'w') as f:
        json.dump(riot_ids_list, f, indent=2)
    
    print(f"\n💾 Saved {len(riot_ids_list)} players to:")
    print(f"   📄 {txt_file}")
    print(f"   📄 {json_file}")

def main():
    """Main function"""
    print("🚀 Quick League Player Discovery")
    print("=" * 40)
    
    if not RIOT_API_KEY:
        print("❌ RIOT_API_KEY not found in .env file")
        return
    
    try:
        # Quick discovery
        players = quick_discover_players("RareChubber#NA1", max_players=30)
        
        if players:
            save_to_files(players)
            
            print(f"\n📊 Summary:")
            print(f"   Total players: {len(players)}")
            
            print(f"\n👥 Discovered players:")
            for i, riot_id in enumerate(sorted(players), 1):
                print(f"   {i:2d}. {riot_id}")
        else:
            print("❌ No players discovered")
            
    except KeyboardInterrupt:
        print("\n⚠️  Interrupted by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    main() 