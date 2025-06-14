#!/usr/bin/env python3

"""
Test script for the improved duo matching API
"""

import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def test_api_status():
    """Test if the API is running and loaded players"""
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            data = response.json()
            print("✅ API Status:")
            print(f"   Message: {data['message']}")
            print(f"   Players loaded: {data['players_loaded']}")
            return True
        else:
            print(f"❌ API not responding: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to API: {e}")
        return False

def test_system_stats():
    """Test system statistics endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/stats")
        if response.status_code == 200:
            data = response.json()
            print("\n📊 SYSTEM STATISTICS:")
            print(f"   Total players: {data['total_players']}")
            print(f"   Embedding system: {data['embedding_system']}")
            print(f"   Role distribution: {data['role_distribution']}")
            print(f"   Top champions: {data['top_champions'][:5]}")
            return True
        else:
            print(f"❌ Stats endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Stats test failed: {e}")
        return False

def test_improved_search(query: str, limit: int = 5):
    """Test the improved search functionality"""
    try:
        print(f"\n🔍 TESTING SEARCH: '{query}'")
        print("=" * 60)
        
        payload = {
            "query": query,
            "limit": limit
        }
        
        response = requests.post(f"{BASE_URL}/players/search", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            
            print(f"📊 Search Results:")
            print(f"   Query: '{query}'")
            print(f"   Players searched: {data['total_players']}")
            print(f"   Results returned: {len(data['results'])}")
            
            print(f"\n🏆 TOP MATCHES:")
            for player in data['results'][:5]:
                print(f"\n   #{player['rank']} - {player['riot_id']} (Score: {player['similarity_score']:.3f})")
                print(f"      🎯 Role: {player['stats']['primary_role']}")
                print(f"      🎮 Champions: {', '.join(player['stats']['most_played_champions'][:3])}")
                print(f"      📝 Bio: {player['bio']}")
                print(f"      📊 Overview: {player['descriptions']['comprehensive'][:100]}...")
                
                # Show what was embedded for transparency
                if player.get('embedding_preview'):
                    print(f"      🔍 Embedded: {player['embedding_preview'][:150]}...")
            
            return data['results']
        else:
            print(f"❌ Search failed: {response.status_code} - {response.text}")
            return []
            
    except Exception as e:
        print(f"❌ Search test failed: {e}")
        return []

def test_specific_player(riot_id: str):
    """Test getting specific player details"""
    try:
        print(f"\n👤 PLAYER DETAILS: {riot_id}")
        print("=" * 50)
        
        # URL encode the riot_id
        import urllib.parse
        encoded_riot_id = urllib.parse.quote(riot_id, safe='')
        response = requests.get(f"{BASE_URL}/player/{encoded_riot_id}")
        
        if response.status_code == 200:
            data = response.json()
            
            print(f"   Riot ID: {data['riot_id']}")
            print(f"   Bio: {data['bio']}")
            print(f"   Role: {data['stats']['primary_lane']}")
            print(f"   Champions: {data['stats']['most_played_champions']}")
            
            descriptions = data['descriptions']
            print(f"\n   📊 Comprehensive: {descriptions['comprehensive']}")
            print(f"   🎮 Playstyle: {descriptions['playstyle']}")
            print(f"   🤝 Compatibility: {descriptions['compatibility']}")
            
            if descriptions.get('cons'):
                print(f"   ⚠️  Cons: {descriptions['cons']}")
            
            return True
        else:
            print(f"❌ Player not found: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Player details test failed: {e}")
        return False

def compare_search_quality():
    """Compare search quality with different queries"""
    print(f"\n🧪 SEARCH QUALITY COMPARISON")
    print("=" * 80)
    
    test_queries = [
        "aggressive early game jungler that plays graves",
        "jungle player who plays graves", 
        "support player who plays enchanter champions",
        "mid lane assassin player",
        "adc main who plays draven",
        "top lane tank player",
        "high skill mechanical player"
    ]
    
    for query in test_queries:
        results = test_improved_search(query, limit=3)
        
        if results:
            # Analyze result quality
            top_result = results[0]
            role_match = query.lower() in top_result['stats']['primary_role'].lower() or \
                        top_result['stats']['primary_role'].lower() in query.lower()
            
            # Check for champion mentions
            champion_match = False
            query_words = query.lower().split()
            player_champions = [c.lower() for c in top_result['stats']['most_played_champions']]
            
            for word in query_words:
                if word in player_champions:
                    champion_match = True
                    break
            
            print(f"      ✅ Role match: {role_match}")
            print(f"      ✅ Champion match: {champion_match}")
            print(f"      📈 Similarity score: {top_result['similarity_score']:.3f}")
        
        time.sleep(0.5)  # Brief pause between requests

def main():
    """Main test function"""
    print("🚀 TESTING IMPROVED DUO MATCHING API")
    print("=" * 80)
    
    # Test API status
    if not test_api_status():
        print("❌ API not available. Make sure to run: uvicorn main:app --reload")
        return
    
    # Wait a moment for startup
    time.sleep(2)
    
    # Test system stats
    if not test_system_stats():
        return
    
    # Test the problematic search that was failing before
    print(f"\n🎯 TESTING THE ORIGINAL PROBLEMATIC SEARCH")
    print("=" * 60)
    
    results = test_improved_search("aggressive early game jungler that plays graves", limit=5)
    
    if results:
        print(f"\n📈 IMPROVEMENT ANALYSIS:")
        top_result = results[0]
        
        # Check if top result is actually a jungle player
        is_jungle = top_result['stats']['primary_role'] == 'JUNGLE'
        plays_graves = 'Graves' in top_result['stats']['most_played_champions']
        
        print(f"   ✅ Top result is jungle player: {is_jungle}")
        print(f"   ✅ Top result plays Graves: {plays_graves}")
        print(f"   📊 Similarity score: {top_result['similarity_score']:.3f}")
        
        if is_jungle and plays_graves:
            print(f"   🎉 SUCCESS! Search now returns relevant results!")
        else:
            print(f"   ⚠️  Still needs improvement")
    
    # Test other searches
    compare_search_quality()
    
    # Test specific player details
    if results:
        test_specific_player(results[0]['riot_id'])
    
    print(f"\n✅ Testing complete!")

if __name__ == "__main__":
    main() 