import json
import requests
import time
from typing import List
import embedding_service
import riot_service

BASE_URL = "http://127.0.0.1:8000"

def load_discovered_players(filename: str = None) -> List[str]:
    """Load discovered players from JSON file"""
    # Try mass discovered players first, then fall back to quick discovered
    filenames_to_try = []
    if filename:
        filenames_to_try.append(filename)
    else:
        filenames_to_try = ["mass_discovered_players.json", "quick_discovered_players.json"]
    
    for fname in filenames_to_try:
        try:
            with open(fname, 'r') as f:
                players = json.load(f)
                print(f"📁 Loaded {len(players)} players from {fname}")
                return players
        except FileNotFoundError:
            continue
    
    print(f"❌ No player files found. Run mass_discover_players.py or quick_discover.py first!")
    return []

def generate_realistic_bios(riot_ids: List[str]) -> List[str]:
    """Generate realistic bios for players based on their Riot IDs"""
    bio_templates = [
        "Competitive player looking to climb ranked and improve gameplay",
        "Chill gamer who enjoys playing with friends and having fun",
        "Serious player focused on team coordination and strategic play",
        "Casual player who likes to try different champions and roles",
        "Experienced player looking for consistent teammates",
        "Friendly player who communicates well and stays positive",
        "Skilled player seeking to join a dedicated team",
        "Relaxed player who enjoys both ranked and normal games",
        "Team-oriented player who focuses on objectives and map control",
        "Versatile player comfortable with multiple roles and champions"
    ]
    
    bios = []
    for i, riot_id in enumerate(riot_ids):
        # Use a simple hash to consistently assign bios
        bio_index = hash(riot_id) % len(bio_templates)
        bios.append(bio_templates[bio_index])
    
    return bios

def bulk_register_players_optimized(riot_ids: List[str], batch_size: int = 10):
    """
    Register multiple players using M4-optimized batch processing
    """
    print(f"🚀 Bulk registering {len(riot_ids)} players with M4 optimization")
    print(f"📦 Processing in batches of {batch_size}")
    print("=" * 60)
    
    # Generate realistic bios
    bios = generate_realistic_bios(riot_ids)
    
    # Prepare player data
    player_data_list = []
    for riot_id, bio in zip(riot_ids, bios):
        player_data_list.append({
            "riot_id": riot_id,
            "bio": bio
        })
    
    successful_registrations = 0
    failed_registrations = 0
    
    # Process in batches
    for i in range(0, len(player_data_list), batch_size):
        batch = player_data_list[i:i+batch_size]
        batch_num = (i // batch_size) + 1
        total_batches = (len(player_data_list) + batch_size - 1) // batch_size
        
        print(f"\n📦 Processing batch {batch_num}/{total_batches} ({len(batch)} players)")
        
        for j, player_data in enumerate(batch):
            riot_id = player_data["riot_id"]
            
            try:
                print(f"   {j+1:2d}. Registering {riot_id}...")
                
                response = requests.post(f"{BASE_URL}/player", json=player_data)
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"      ✅ Success - {data['player']['stats']['primary_lane']} main")
                    successful_registrations += 1
                elif response.status_code == 400 and "already registered" in response.text:
                    print(f"      ℹ️  Already registered")
                    successful_registrations += 1
                else:
                    print(f"      ❌ Failed: {response.status_code}")
                    failed_registrations += 1
                
                # Small delay to avoid overwhelming the API
                time.sleep(0.5)
                
            except Exception as e:
                print(f"      ❌ Error: {e}")
                failed_registrations += 1
        
        print(f"   📊 Batch {batch_num} complete: {successful_registrations} successful, {failed_registrations} failed")
    
    print(f"\n🎉 Bulk registration complete!")
    print(f"   ✅ Successful: {successful_registrations}")
    print(f"   ❌ Failed: {failed_registrations}")
    print(f"   📊 Success rate: {(successful_registrations/(successful_registrations+failed_registrations)*100):.1f}%")

def test_m4_performance_with_real_data():
    """Test M4 performance with real player data"""
    print("🧪 Testing M4 performance with real player data")
    print("=" * 50)
    
    # Load discovered players
    riot_ids = load_discovered_players()
    if not riot_ids:
        return
    
    # Generate bios
    bios = generate_realistic_bios(riot_ids)
    
    # Test single vs batch embedding generation
    import time
    
    print(f"📊 Testing with {len(riot_ids)} real player bios...")
    
    # Single embedding test
    start_time = time.time()
    single_embeddings = []
    for bio in bios[:5]:  # Test with first 5
        embedding = embedding_service.generate_embedding(bio)
        single_embeddings.append(embedding)
    single_time = time.time() - start_time
    
    # Batch embedding test
    start_time = time.time()
    batch_embeddings = embedding_service.generate_embeddings_batch(bios)
    batch_time = time.time() - start_time
    
    print(f"\n📈 M4 Performance Results:")
    print(f"   Single processing (5 bios): {single_time:.2f}s ({single_time/5:.3f}s per bio)")
    print(f"   Batch processing ({len(bios)} bios): {batch_time:.2f}s ({batch_time/len(bios):.3f}s per bio)")
    print(f"   🚀 M4 batch speedup: {(single_time/5)/(batch_time/len(bios)):.1f}x faster!")
    
    # Test similarity search performance
    query_embedding = batch_embeddings[0]
    start_time = time.time()
    similar_indices = embedding_service.find_similar_players_optimized(
        query_embedding, batch_embeddings, top_k=5
    )
    search_time = time.time() - start_time
    
    print(f"   🔍 Similarity search ({len(bios)} players): {search_time:.3f}s")
    print(f"   📊 Total M4 processing power: {len(bios)/batch_time:.1f} embeddings/second")

def main():
    """Main function"""
    print("🚀 M4-Optimized Bulk Player Registration")
    print("=" * 60)
    
    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code != 200:
            print("❌ Server not running. Start with: uvicorn main:app --reload")
            return
    except:
        print("❌ Cannot connect to server. Start with: uvicorn main:app --reload")
        return
    
    # Load discovered players
    riot_ids = load_discovered_players()
    if not riot_ids:
        return
    
    print(f"📁 Loaded {len(riot_ids)} discovered players")
    
    # Test M4 performance first
    test_m4_performance_with_real_data()
    
    # Ask user if they want to proceed with registration
    print(f"\n🤔 Do you want to register all {len(riot_ids)} players?")
    print("   This will fetch real stats from Riot API and create embeddings")
    print("   Estimated time: ~5-10 minutes")
    
    choice = input("\nProceed? (y/n): ").lower().strip()
    
    if choice == 'y':
        bulk_register_players_optimized(riot_ids, batch_size=5)
    else:
        print("👋 Registration cancelled")

if __name__ == "__main__":
    main() 