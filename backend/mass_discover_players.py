import json
import time
import requests
from collections import deque, defaultdict
from typing import Set, List, Dict
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
RIOT_API_KEY = os.getenv("RIOT_API_KEY")

if not RIOT_API_KEY:
    raise ValueError("RIOT_API_KEY not found in environment variables")

# Rate limiting configuration
RATE_LIMIT_DELAY = 1.2  # Seconds between API calls
MAX_RETRIES = 3
BATCH_SAVE_INTERVAL = 50  # Save progress every 50 new players

class EfficientPlayerDiscovery:
    def __init__(self):
        self.discovered_players: Set[str] = set()
        self.player_queue = deque()
        self.processed_puuids: Set[str] = set()
        self.api_calls_made = 0
        self.players_per_call = defaultdict(int)
        
        # Load existing players
        self.load_existing_players()
        
    def load_existing_players(self):
        """Load existing discovered players to avoid duplicates"""
        try:
            with open('quick_discovered_players.json', 'r') as f:
                existing_players = json.load(f)
                self.discovered_players.update(existing_players)
                print(f"📁 Loaded {len(existing_players)} existing players")
                
                # Add first few to queue for expansion
                for player in existing_players[:5]:  # Start with 5 seed players
                    self.player_queue.append(player)
                    
        except FileNotFoundError:
            print("❌ No existing players file found")
            # Add default seed players
            seed_players = ["RareChubber#NA1", "oronila#8808"]
            self.discovered_players.update(seed_players)
            self.player_queue.extend(seed_players)
    
    def get_puuid(self, riot_id: str) -> str:
        """Get PUUID for a Riot ID with error handling"""
        try:
            game_name, tag_line = riot_id.split('#')
            url = f"https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}"
            
            headers = {"X-Riot-Token": RIOT_API_KEY}
            response = requests.get(url, headers=headers)
            self.api_calls_made += 1
            
            if response.status_code == 200:
                return response.json().get('puuid')
            elif response.status_code == 429:
                print(f"⚠️  Rate limited, waiting 60 seconds...")
                time.sleep(60)
                return self.get_puuid(riot_id)  # Retry
            else:
                return None
                
        except Exception as e:
            print(f"❌ Error getting PUUID for {riot_id}: {e}")
            return None
    
    def get_recent_matches(self, puuid: str, count: int = 20) -> List[str]:
        """Get recent match IDs for a player - maximize data per call"""
        try:
            url = f"https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids"
            params = {
                'start': 0,
                'count': count,  # Get more matches per call
                'queue': 420    # Ranked Solo/Duo only for quality data
            }
            
            headers = {"X-Riot-Token": RIOT_API_KEY}
            response = requests.get(url, headers=headers, params=params)
            self.api_calls_made += 1
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 429:
                print(f"⚠️  Rate limited, waiting 60 seconds...")
                time.sleep(60)
                return self.get_recent_matches(puuid, count)
            else:
                return []
                
        except Exception as e:
            print(f"❌ Error getting matches for PUUID: {e}")
            return []
    
    def extract_players_from_match(self, match_id: str) -> List[str]:
        """Extract all 10 players from a single match - maximum efficiency!"""
        try:
            url = f"https://americas.api.riotgames.com/lol/match/v5/matches/{match_id}"
            headers = {"X-Riot-Token": RIOT_API_KEY}
            response = requests.get(url, headers=headers)
            self.api_calls_made += 1
            
            if response.status_code == 200:
                match_data = response.json()
                participants = match_data['info']['participants']
                
                players_found = []
                for participant in participants:
                    riot_id = f"{participant['riotIdGameName']}#{participant['riotIdTagline']}"
                    if riot_id not in self.discovered_players:
                        players_found.append(riot_id)
                        self.discovered_players.add(riot_id)
                
                self.players_per_call[match_id] = len(players_found)
                return players_found
                
            elif response.status_code == 429:
                print(f"⚠️  Rate limited, waiting 60 seconds...")
                time.sleep(60)
                return self.extract_players_from_match(match_id)
            else:
                return []
                
        except Exception as e:
            print(f"❌ Error extracting players from match {match_id}: {e}")
            return []
    
    def discover_players_efficiently(self, target_count: int = 1000):
        """Efficiently discover players using breadth-first expansion"""
        print(f"🚀 Starting efficient discovery to reach {target_count} players")
        print(f"📊 Starting with {len(self.discovered_players)} players")
        print("=" * 60)
        
        new_players_found = 0
        last_save_count = len(self.discovered_players)
        
        while len(self.discovered_players) < target_count and self.player_queue:
            current_player = self.player_queue.popleft()
            
            print(f"\n🔍 Processing: {current_player}")
            print(f"   Progress: {len(self.discovered_players)}/{target_count} players")
            print(f"   Queue size: {len(self.player_queue)}")
            print(f"   API calls made: {self.api_calls_made}")
            
            # Get PUUID
            puuid = self.get_puuid(current_player)
            if not puuid or puuid in self.processed_puuids:
                continue
            
            self.processed_puuids.add(puuid)
            time.sleep(RATE_LIMIT_DELAY)
            
            # Get recent matches (more matches = more potential players)
            match_ids = self.get_recent_matches(puuid, count=20)
            print(f"   📋 Found {len(match_ids)} recent matches")
            
            if not match_ids:
                continue
            
            time.sleep(RATE_LIMIT_DELAY)
            
            # Process matches strategically - prioritize recent matches
            matches_to_process = match_ids[:5]  # Process 5 most recent matches
            batch_new_players = 0
            
            for i, match_id in enumerate(matches_to_process):
                print(f"   🎮 Processing match {i+1}/{len(matches_to_process)}")
                
                new_players = self.extract_players_from_match(match_id)
                batch_new_players += len(new_players)
                
                # Add high-quality players to queue for further expansion
                for player in new_players[:3]:  # Add top 3 new players to queue
                    if len(self.player_queue) < 100:  # Limit queue size
                        self.player_queue.append(player)
                
                time.sleep(RATE_LIMIT_DELAY)
                
                # Check if we've reached target
                if len(self.discovered_players) >= target_count:
                    break
            
            new_players_found += batch_new_players
            print(f"   ✅ Found {batch_new_players} new players from {current_player}")
            
            # Save progress periodically
            if len(self.discovered_players) - last_save_count >= BATCH_SAVE_INTERVAL:
                self.save_progress()
                last_save_count = len(self.discovered_players)
                print(f"   💾 Progress saved at {len(self.discovered_players)} players")
            
            # Show efficiency stats
            if self.api_calls_made > 0:
                efficiency = len(self.discovered_players) / self.api_calls_made
                print(f"   📈 Efficiency: {efficiency:.2f} players per API call")
        
        # Final save
        self.save_progress()
        self.print_final_stats()
    
    def save_progress(self):
        """Save current progress to files"""
        players_list = sorted(list(self.discovered_players))
        
        # Save JSON
        with open('mass_discovered_players.json', 'w') as f:
            json.dump(players_list, f, indent=2)
        
        # Save text file for easy reading
        with open('mass_discovered_players.txt', 'w') as f:
            for player in players_list:
                f.write(f"{player}\n")
        
        print(f"💾 Saved {len(players_list)} players to files")
    
    def print_final_stats(self):
        """Print comprehensive discovery statistics"""
        print("\n" + "=" * 60)
        print("🎉 MASS DISCOVERY COMPLETE!")
        print("=" * 60)
        print(f"📊 Total players discovered: {len(self.discovered_players)}")
        print(f"🔧 Total API calls made: {self.api_calls_made}")
        print(f"📈 Average players per API call: {len(self.discovered_players)/self.api_calls_made:.2f}")
        print(f"⏱️  Estimated time saved vs individual calls: {self.api_calls_made * 0.5:.1f} seconds")
        
        # Show most efficient matches
        if self.players_per_call:
            best_matches = sorted(self.players_per_call.items(), key=lambda x: x[1], reverse=True)[:5]
            print(f"\n🏆 Most efficient matches:")
            for match_id, player_count in best_matches:
                print(f"   {match_id}: {player_count} new players")
        
        print(f"\n📁 Files created:")
        print(f"   - mass_discovered_players.json ({len(self.discovered_players)} players)")
        print(f"   - mass_discovered_players.txt (human readable)")
        print("\n🚀 Ready for bulk registration with bulk_register_players.py!")

def main():
    """Main discovery function"""
    discovery = EfficientPlayerDiscovery()
    
    print("🎯 Mass Player Discovery - Efficient Mode")
    print("=" * 50)
    print("This script maximizes data extraction from each API call:")
    print("• Uses match data to get 10 players per match call")
    print("• Processes multiple matches per player")
    print("• Smart queue management to avoid duplicates")
    print("• Rate limiting to avoid API restrictions")
    print()
    
    target = input("Enter target player count (default 1000): ").strip()
    target_count = int(target) if target.isdigit() else 1000
    
    print(f"\n🚀 Starting discovery to reach {target_count} players...")
    print("Press Ctrl+C to stop and save progress at any time")
    
    try:
        discovery.discover_players_efficiently(target_count)
    except KeyboardInterrupt:
        print("\n\n⏹️  Discovery stopped by user")
        discovery.save_progress()
        discovery.print_final_stats()
    except Exception as e:
        print(f"\n❌ Error during discovery: {e}")
        discovery.save_progress()
        print("💾 Progress saved before exit")

if __name__ == "__main__":
    main() 