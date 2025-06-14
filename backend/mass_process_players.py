#!/usr/bin/env python3

"""
Mass process all discovered players with the enhanced Groq system
Includes proper rate limiting, backoff, and progress saving
"""

import json
import time
import os
from typing import List, Dict, Optional
from groq_enhanced_player_service import GroqEnhancedPlayerService
import requests
from datetime import datetime

class MassPlayerProcessor:
    """Process large numbers of players with rate limiting and error handling"""
    
    def __init__(self):
        self.service = GroqEnhancedPlayerService()
        self.processed_players = []
        self.failed_players = []
        self.skipped_players = []
        
        # Rate limiting settings
        self.base_delay = 2.0  # Base delay between requests
        self.max_delay = 120.0  # Maximum backoff delay
        self.backoff_multiplier = 2.0
        self.current_delay = self.base_delay
        
        # Progress tracking
        self.total_players = 0
        self.current_index = 0
        self.start_time = None
        
        # Load existing progress
        self.load_existing_progress()
    
    def load_existing_progress(self):
        """Load any existing processed players to avoid reprocessing"""
        try:
            with open('mass_processed_players.json', 'r') as f:
                existing_data = json.load(f)
                self.processed_players = existing_data.get('processed_players', [])
                self.failed_players = existing_data.get('failed_players', [])
                self.skipped_players = existing_data.get('skipped_players', [])
                
                print(f"📁 Loaded existing progress:")
                print(f"   ✅ Processed: {len(self.processed_players)}")
                print(f"   ❌ Failed: {len(self.failed_players)}")
                print(f"   ⏭️  Skipped: {len(self.skipped_players)}")
                
        except FileNotFoundError:
            print("📁 No existing progress found, starting fresh")
    
    def load_discovered_players(self) -> List[str]:
        """Load the list of discovered players"""
        try:
            with open('mass_discovered_players.json', 'r') as f:
                players = json.load(f)
                print(f"📋 Loaded {len(players)} discovered players")
                return players
        except FileNotFoundError:
            print("❌ mass_discovered_players.json not found!")
            print("   Run mass_discover_players.py first to discover players")
            return []
    
    def get_already_processed_riot_ids(self) -> set:
        """Get set of already processed Riot IDs to avoid duplicates"""
        processed_ids = set()
        
        for player_data in self.processed_players:
            if 'riot_id' in player_data:
                processed_ids.add(player_data['riot_id'])
        
        for failed_id in self.failed_players:
            processed_ids.add(failed_id)
            
        for skipped_id in self.skipped_players:
            processed_ids.add(skipped_id)
        
        return processed_ids
    
    def handle_rate_limit(self, response_code: int = None):
        """Handle rate limiting with exponential backoff"""
        if response_code == 429:
            # Rate limited - use longer delay
            self.current_delay = min(self.current_delay * self.backoff_multiplier, self.max_delay)
            print(f"⚠️  Rate limited! Backing off to {self.current_delay:.1f}s delay")
        elif response_code and response_code >= 500:
            # Server error - moderate backoff
            self.current_delay = min(self.current_delay * 1.5, self.max_delay)
            print(f"⚠️  Server error! Backing off to {self.current_delay:.1f}s delay")
        else:
            # Success - gradually reduce delay
            self.current_delay = max(self.current_delay * 0.9, self.base_delay)
        
        print(f"⏱️  Waiting {self.current_delay:.1f}s...")
        time.sleep(self.current_delay)
    
    def process_single_player(self, riot_id: str) -> Optional[Dict]:
        """Process a single player with error handling"""
        try:
            print(f"🔍 Processing: {riot_id}")
            
            # Generate a realistic bio for the player
            bio = self.generate_realistic_bio(riot_id)
            
            # Process with Groq enhancement
            enhanced_player = self.service.register_player_with_groq(
                riot_id, bio, num_matches=20
            )
            
            if enhanced_player:
                print(f"   ✅ Success - {enhanced_player['stats']['primary_lane']} main")
                return enhanced_player
            else:
                print(f"   ❌ Failed to analyze")
                return None
                
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:
                print(f"   ⚠️  Rate limited")
                self.handle_rate_limit(429)
                return "rate_limited"
            elif e.response.status_code >= 500:
                print(f"   ⚠️  Server error: {e.response.status_code}")
                self.handle_rate_limit(e.response.status_code)
                return "server_error"
            else:
                print(f"   ❌ HTTP Error: {e}")
                return None
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return None
    
    def generate_realistic_bio(self, riot_id: str) -> str:
        """Generate a realistic bio for a player"""
        bio_templates = [
            "Looking for skilled teammates to climb ranked together",
            "Competitive player seeking consistent duo partners",
            "Team-oriented player who values good communication",
            "Chill player looking for fun games and improvement",
            "Experienced player seeking dedicated team members",
            "Strategic player focused on macro play and objectives",
            "Friendly player who enjoys both ranked and normals",
            "Skilled player looking to join an active group",
            "Consistent player seeking long-term teammates",
            "Positive player who focuses on team coordination"
        ]
        
        # Use hash of riot_id for consistent bio assignment
        bio_index = hash(riot_id) % len(bio_templates)
        return bio_templates[bio_index]
    
    def save_progress(self):
        """Save current progress to file"""
        progress_data = {
            'processed_players': self.processed_players,
            'failed_players': self.failed_players,
            'skipped_players': self.skipped_players,
            'stats': {
                'total_processed': len(self.processed_players),
                'total_failed': len(self.failed_players),
                'total_skipped': len(self.skipped_players),
                'success_rate': len(self.processed_players) / max(1, len(self.processed_players) + len(self.failed_players)) * 100,
                'last_updated': datetime.now().isoformat()
            }
        }
        
        with open('mass_processed_players.json', 'w', encoding='utf-8') as f:
            json.dump(progress_data, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Progress saved: {len(self.processed_players)} processed")
    
    def print_progress(self):
        """Print current progress statistics"""
        if self.start_time:
            elapsed = time.time() - self.start_time
            rate = self.current_index / elapsed if elapsed > 0 else 0
            eta = (self.total_players - self.current_index) / rate if rate > 0 else 0
            
            print(f"\n📊 PROGRESS UPDATE:")
            print(f"   Progress: {self.current_index}/{self.total_players} ({self.current_index/self.total_players*100:.1f}%)")
            print(f"   Processed: {len(self.processed_players)} ✅")
            print(f"   Failed: {len(self.failed_players)} ❌")
            print(f"   Skipped: {len(self.skipped_players)} ⏭️")
            print(f"   Rate: {rate:.2f} players/min")
            print(f"   ETA: {eta/60:.1f} minutes")
            print(f"   Current delay: {self.current_delay:.1f}s")
    
    def process_all_players(self, max_players: int = None):
        """Process all discovered players"""
        # Load discovered players
        all_players = self.load_discovered_players()
        if not all_players:
            return
        
        # Filter out already processed players
        already_processed = self.get_already_processed_riot_ids()
        remaining_players = [p for p in all_players if p not in already_processed]
        
        if max_players:
            remaining_players = remaining_players[:max_players]
        
        self.total_players = len(remaining_players)
        self.start_time = time.time()
        
        print(f"\n🚀 STARTING MASS PROCESSING")
        print("=" * 60)
        print(f"📋 Total players to process: {self.total_players}")
        print(f"⏭️  Already processed: {len(already_processed)}")
        print(f"⏱️  Estimated time: {self.total_players * self.base_delay / 60:.1f} minutes")
        print("=" * 60)
        
        # Process each player
        for i, riot_id in enumerate(remaining_players):
            self.current_index = i + 1
            
            # Process player
            result = self.process_single_player(riot_id)
            
            if result == "rate_limited":
                # Retry after rate limit
                result = self.process_single_player(riot_id)
            
            if result == "server_error":
                # Skip for now, might retry later
                self.failed_players.append(riot_id)
            elif result is None:
                # Failed to process
                self.failed_players.append(riot_id)
            elif isinstance(result, dict):
                # Successfully processed
                self.processed_players.append(result)
            
            # Save progress after each player (so interruption doesn't lose work)
            self.save_progress()
            
            # Handle rate limiting
            self.handle_rate_limit()
            
            # Print detailed progress every 10 players
            if self.current_index % 10 == 0:
                self.print_progress()
        
        # Final save and summary
        self.save_progress()
        self.print_final_summary()
    
    def print_final_summary(self):
        """Print final processing summary"""
        total_attempted = len(self.processed_players) + len(self.failed_players)
        success_rate = len(self.processed_players) / max(1, total_attempted) * 100
        
        print(f"\n🎉 MASS PROCESSING COMPLETE!")
        print("=" * 60)
        print(f"✅ Successfully processed: {len(self.processed_players)}")
        print(f"❌ Failed to process: {len(self.failed_players)}")
        print(f"⏭️  Skipped (already done): {len(self.skipped_players)}")
        print(f"📊 Success rate: {success_rate:.1f}%")
        
        if self.start_time:
            total_time = time.time() - self.start_time
            print(f"⏱️  Total time: {total_time/60:.1f} minutes")
            print(f"📈 Average rate: {len(self.processed_players)/(total_time/60):.1f} players/min")
        
        print(f"\n📁 Output files:")
        print(f"   - mass_processed_players.json (all results)")
        print(f"   - Individual player files in current directory")
        
        print(f"\n🚀 Ready for enhanced matchmaking with {len(self.processed_players)} players!")

def main():
    """Main function"""
    processor = MassPlayerProcessor()
    
    print("🚀 MASS PLAYER PROCESSING WITH GROQ ENHANCEMENT")
    print("=" * 60)
    print("This script will process all discovered players with:")
    print("✅ Fixed champion analysis (proper match aggregation)")
    print("✅ Groq LLM natural language descriptions")
    print("✅ Rate limiting with exponential backoff")
    print("✅ Progress saving and resume capability")
    print("✅ Comprehensive error handling")
    print()
    
    # Ask for processing limit
    limit_input = input("Enter max players to process (default: all): ").strip()
    max_players = int(limit_input) if limit_input.isdigit() else None
    
    print(f"\n🎯 Processing {'all' if not max_players else max_players} players...")
    print("Press Ctrl+C to stop and save progress at any time")
    
    try:
        processor.process_all_players(max_players)
    except KeyboardInterrupt:
        print("\n\n⏹️  Processing stopped by user")
        processor.save_progress()
        processor.print_final_summary()
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        processor.save_progress()
        print("💾 Progress saved before exit")

if __name__ == "__main__":
    main() 