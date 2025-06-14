#!/usr/bin/env python3

"""
Test script to analyze embeddings and perform similarity search on mass processed players
"""

import json
import numpy as np
from typing import List, Dict, Optional
from sklearn.metrics.pairwise import cosine_similarity
import embedding_service

def load_mass_processed_players() -> List[Dict]:
    """Load the mass processed players data"""
    try:
        with open('mass_processed_players.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        processed_players = data.get('processed_players', [])
        print(f"📁 Loaded {len(processed_players)} processed players")
        return processed_players
    
    except FileNotFoundError:
        print("❌ mass_processed_players.json not found. Run mass_process_players.py first!")
        return []
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        return []

def analyze_current_embeddings(players: List[Dict]) -> None:
    """Analyze what content is currently embedded"""
    print("\n🔍 ANALYZING CURRENT EMBEDDINGS")
    print("=" * 60)
    
    if not players:
        print("No players to analyze")
        return
    
    # Sample a few players to show what's embedded
    sample_size = min(3, len(players))
    
    for i, player in enumerate(players[:sample_size]):
        riot_id = player.get('riot_id', 'Unknown')
        print(f"\n👤 PLAYER {i+1}: {riot_id}")
        print("-" * 40)
        
        # Show original bio
        bio = player.get('bio', '')
        print(f"📝 Original Bio: {bio}")
        
        # Show Groq descriptions
        groq_desc = player.get('groq_descriptions', {})
        print(f"\n🤖 Groq Descriptions:")
        print(f"   Comprehensive: {groq_desc.get('comprehensive', 'N/A')}")
        print(f"   Playstyle: {groq_desc.get('playstyle', 'N/A')}")
        print(f"   Compatibility: {groq_desc.get('compatibility', 'N/A')}")
        print(f"   Cons (NOT embedded): {groq_desc.get('cons', 'N/A')}")
        
        # Show what's actually embedded
        enhanced_desc = player.get('enhanced_description', '')
        print(f"\n📊 What's Actually Embedded ({len(enhanced_desc)} chars):")
        print(f"   {enhanced_desc[:200]}...")
        
        # Show embedding info
        embedding = player.get('embedding', [])
        if embedding:
            print(f"\n🔢 Embedding: {len(embedding)} dimensions, sample: [{embedding[0]:.3f}, {embedding[1]:.3f}, ...]")
        else:
            print(f"\n❌ No embedding found!")

def add_player_tags(players: List[Dict], tags_data: Dict[str, List[str]]) -> List[Dict]:
    """
    Add additional tags to players and regenerate embeddings
    
    Args:
        players: List of player data
        tags_data: Dict mapping riot_id to list of tags
        
    Returns:
        Updated players with new embeddings
    """
    print(f"\n🏷️  ADDING PLAYER TAGS AND REGENERATING EMBEDDINGS")
    print("=" * 60)
    
    updated_players = []
    
    for player in players:
        riot_id = player.get('riot_id', '')
        
        # Add tags if available
        player_tags = tags_data.get(riot_id, [])
        player['tags'] = player_tags
        
        # Create enhanced description with tags
        enhanced_desc = player.get('enhanced_description', '')
        
        if player_tags:
            tags_text = f"Player traits: {', '.join(player_tags)}"
            enhanced_desc_with_tags = f"{enhanced_desc}. {tags_text}"
        else:
            enhanced_desc_with_tags = enhanced_desc
        
        # Regenerate embedding with tags
        if enhanced_desc_with_tags:
            new_embedding = embedding_service.generate_embedding(enhanced_desc_with_tags)
            player['embedding'] = new_embedding
            player['enhanced_description_with_tags'] = enhanced_desc_with_tags
            
            print(f"✅ Updated {riot_id} with tags: {player_tags}")
        
        updated_players.append(player)
    
    return updated_players

def similarity_search(players: List[Dict], query: str, top_k: int = 5) -> List[Dict]:
    """
    Perform similarity search on players
    
    Args:
        players: List of player data with embeddings
        query: Search query
        top_k: Number of results to return
        
    Returns:
        List of matching players with similarity scores
    """
    print(f"\n🔍 SIMILARITY SEARCH")
    print("=" * 60)
    print(f"Query: '{query}'")
    print(f"Searching {len(players)} players...")
    
    # Generate query embedding
    query_embedding = embedding_service.generate_embedding(query)
    
    # Get all player embeddings
    player_embeddings = []
    valid_players = []
    
    for player in players:
        embedding = player.get('embedding')
        if embedding and len(embedding) > 0:
            player_embeddings.append(embedding)
            valid_players.append(player)
    
    if not player_embeddings:
        print("❌ No valid embeddings found!")
        return []
    
    print(f"Found {len(valid_players)} players with valid embeddings")
    
    # Calculate similarities
    query_array = np.array([query_embedding])
    embeddings_array = np.array(player_embeddings)
    
    similarities = cosine_similarity(query_array, embeddings_array)[0]
    
    # Get top matches
    top_indices = np.argsort(similarities)[::-1][:top_k]
    
    results = []
    for i, idx in enumerate(top_indices):
        player = valid_players[idx]
        similarity_score = similarities[idx]
        
        result = {
            'rank': i + 1,
            'riot_id': player.get('riot_id', 'Unknown'),
            'similarity_score': float(similarity_score),
            'bio': player.get('bio', ''),
            'groq_descriptions': player.get('groq_descriptions', {}),
            'tags': player.get('tags', []),
            'stats': player.get('stats', {}),
            'enhanced_description': player.get('enhanced_description_with_tags', player.get('enhanced_description', ''))
        }
        results.append(result)
    
    return results

def print_search_results(results: List[Dict]) -> None:
    """Print search results in a nice format"""
    print(f"\n📊 SEARCH RESULTS")
    print("=" * 60)
    
    for result in results:
        print(f"\n🏆 #{result['rank']} - {result['riot_id']} (Similarity: {result['similarity_score']:.3f})")
        print(f"   Bio: {result['bio']}")
        
        groq = result['groq_descriptions']
        if groq.get('comprehensive'):
            print(f"   Overview: {groq['comprehensive']}")
        if groq.get('playstyle'):
            print(f"   Playstyle: {groq['playstyle']}")
        
        if result['tags']:
            print(f"   Tags: {', '.join(result['tags'])}")
        
        stats = result['stats']
        if stats.get('primary_lane'):
            print(f"   Role: {stats['primary_lane']}")
        if stats.get('most_played_champions'):
            champs = ', '.join(stats['most_played_champions'][:3])
            print(f"   Champions: {champs}")

def save_updated_data(players: List[Dict], filename: str = 'mass_processed_players_with_tags.json') -> None:
    """Save updated player data with tags"""
    try:
        # Maintain the same structure as original file
        output_data = {
            'processed_players': players,
            'stats': {
                'total_processed': len(players),
                'with_tags': len([p for p in players if p.get('tags')]),
                'updated_embeddings': len([p for p in players if p.get('enhanced_description_with_tags')])
            }
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Updated data saved to: {filename}")
        
    except Exception as e:
        print(f"❌ Error saving data: {e}")

def main():
    """Main function to test embeddings and search"""
    print("🧪 EMBEDDING ANALYSIS AND SIMILARITY SEARCH TESTER")
    print("=" * 80)
    
    # Load existing data
    players = load_mass_processed_players()
    if not players:
        return
    
    # Analyze current embeddings
    analyze_current_embeddings(players)
    
    # Example tags data - you can modify this or load from a file
    example_tags = {
        # Add some example tags for testing
        # Format: "RiotID#TAG": ["competitive", "strategic", "team-player", etc.]
    }
    
    # Ask user if they want to add tags
    print(f"\n🏷️  TAG ENHANCEMENT")
    print("=" * 40)
    print("You can add tags like: competitive, casual, strategic, aggressive, team-player, etc.")
    print("This will enhance the embeddings for better similarity matching.")
    
    add_tags = input("\nDo you want to add tags to players? (y/n): ").lower().strip()
    
    if add_tags == 'y':
        print("\nExample format for tags:")
        print("  RiotID#TAG1: competitive, strategic, team-player")
        print("  RiotID#TAG2: casual, aggressive, solo-carry")
        print("\nEnter tags (or press Enter to skip):")
        
        # Simple tag input - you could make this more sophisticated
        tags_input = input("Enter riot_id:tag1,tag2,tag3 (or Enter to skip): ").strip()
        
        if tags_input:
            try:
                riot_id, tags_str = tags_input.split(':', 1)
                tags = [tag.strip() for tag in tags_str.split(',')]
                example_tags[riot_id] = tags
                print(f"✅ Added tags for {riot_id}: {tags}")
            except:
                print("❌ Invalid format, skipping tags")
        
        # Update players with tags
        if example_tags:
            players = add_player_tags(players, example_tags)
            save_updated_data(players)
    
    # Test similarity search
    print(f"\n🔍 SIMILARITY SEARCH TESTING")
    print("=" * 40)
    
    # Example queries
    example_queries = [
        "aggressive jungle player who likes early game",
        "strategic team player looking for coordination",
        "competitive player who wants to climb ranked",
        "versatile player with diverse champion pool",
        "support main who focuses on team fights"
    ]
    
    print("Example queries:")
    for i, query in enumerate(example_queries, 1):
        print(f"  {i}. {query}")
    
    while True:
        query = input(f"\nEnter search query (or 'quit' to exit): ").strip()
        
        if query.lower() in ['quit', 'exit', 'q']:
            break
        
        if not query:
            continue
        
        # Perform search
        results = similarity_search(players, query, top_k=5)
        
        if results:
            print_search_results(results)
        else:
            print("❌ No results found")
    
    print("\n👋 Thanks for testing the embedding system!")

if __name__ == "__main__":
    main() 