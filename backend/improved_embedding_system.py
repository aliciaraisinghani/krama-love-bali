#!/usr/bin/env python3

"""
Improved embedding system that includes champion names and specific gameplay details
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

def create_improved_embedding_text(player: Dict) -> str:
    """
    Create improved embedding text that includes champion names, roles, and specific details
    """
    parts = []
    
    # 1. Add original bio
    bio = player.get('bio', '')
    if bio:
        parts.append(bio)
    
    # 2. Add role information prominently
    stats = player.get('stats', {})
    primary_role = stats.get('primary_lane', '')
    if primary_role:
        role_text = f"Primary role: {primary_role.lower()} player"
        parts.append(role_text)
    
    # 3. Add champion names explicitly
    champions = stats.get('most_played_champions', [])
    if champions:
        champion_text = f"Plays champions: {', '.join(champions)}"
        parts.append(champion_text)
        
        # Add champion-specific context
        champion_context = []
        for champ in champions[:3]:  # Top 3 champions
            if champ.lower() in ['graves', 'kindred', 'nidalee', 'karthus']:
                champion_context.append(f"{champ} jungle")
            elif champ.lower() in ['draven', 'jinx', 'lucian', 'ezreal']:
                champion_context.append(f"{champ} adc")
            elif champ.lower() in ['yasuo', 'zed', 'katarina', 'akali']:
                champion_context.append(f"{champ} assassin")
            elif champ.lower() in ['orianna', 'syndra', 'azir']:
                champion_context.append(f"{champ} control mage")
        
        if champion_context:
            parts.append(f"Champion types: {', '.join(champion_context)}")
    
    # 4. Add Groq descriptions but enhance them with specific details
    groq_descriptions = player.get('groq_descriptions', {})
    
    # Enhance comprehensive description with role and champions
    comprehensive = groq_descriptions.get('comprehensive', '')
    if comprehensive:
        if primary_role and primary_role.lower() not in comprehensive.lower():
            comprehensive = f"{primary_role.lower()} main. {comprehensive}"
        parts.append(comprehensive)
    
    # Add playstyle with champion context
    playstyle = groq_descriptions.get('playstyle', '')
    if playstyle:
        parts.append(playstyle)
    
    # Add compatibility
    compatibility = groq_descriptions.get('compatibility', '')
    if compatibility:
        parts.append(compatibility)
    
    # 5. Add comprehensive analysis data
    comprehensive_analysis = player.get('comprehensive_analysis', {})
    
    # Add pace preference
    pace_preference = comprehensive_analysis.get('pace_preference', '')
    if pace_preference:
        parts.append(f"Game pace preference: {pace_preference}")
    
    # Add CS pattern and average CS per minute
    cs_pattern = comprehensive_analysis.get('cs_pattern', '')
    avg_cs_per_min = comprehensive_analysis.get('average_cs_per_min', 0)
    
    if cs_pattern:
        parts.append(f"CS farming style: {cs_pattern}")
    
    if avg_cs_per_min > 0:
        # Categorize CS skill level
        if avg_cs_per_min >= 7.5:
            cs_level = "excellent"
        elif avg_cs_per_min >= 6.5:
            cs_level = "high"
        elif avg_cs_per_min >= 5.5:
            cs_level = "good"
        elif avg_cs_per_min >= 4.5:
            cs_level = "moderate"
        else:
            cs_level = "developing"
        
        parts.append(f"CS skill: {cs_level} ({avg_cs_per_min:.1f} CS/min)")
    
    # 6. Add gameplay style keywords based on champions
    gameplay_keywords = []
    for champ in champions[:3]:
        champ_lower = champ.lower()
        if champ_lower in ['graves', 'lee sin', 'elise', 'nidalee']:
            gameplay_keywords.extend(['aggressive', 'early game', 'invade'])
        elif champ_lower in ['karthus', 'fiddlesticks', 'ammu']:
            gameplay_keywords.extend(['farming', 'scaling', 'teamfight'])
        elif champ_lower in ['shaco', 'evelynn', 'rengar']:
            gameplay_keywords.extend(['stealth', 'assassin', 'picks'])
        elif champ_lower in ['draven', 'lucian']:
            gameplay_keywords.extend(['aggressive', 'early game', 'lane dominant'])
        elif champ_lower in ['yasuo', 'zed', 'katarina']:
            gameplay_keywords.extend(['high skill', 'mechanical', 'outplay'])
    
    if gameplay_keywords:
        unique_keywords = list(set(gameplay_keywords))
        parts.append(f"Playstyle traits: {', '.join(unique_keywords)}")
    
    return ". ".join(parts)

def regenerate_embeddings(players: List[Dict]) -> List[Dict]:
    """
    Regenerate embeddings with improved text that includes champion names and specific details
    """
    print(f"\n🔄 REGENERATING EMBEDDINGS WITH IMPROVED SYSTEM")
    print("=" * 60)
    
    improved_players = []
    
    for i, player in enumerate(players):
        riot_id = player.get('riot_id', 'Unknown')
        
        # Create improved embedding text
        improved_text = create_improved_embedding_text(player)
        
        # Generate new embedding
        new_embedding = embedding_service.generate_embedding(improved_text)
        
        # Update player data
        updated_player = player.copy()
        updated_player['improved_embedding_text'] = improved_text
        updated_player['improved_embedding'] = new_embedding
        
        improved_players.append(updated_player)
        
        if (i + 1) % 10 == 0:
            print(f"   ✅ Processed {i + 1}/{len(players)} players")
    
    print(f"✅ Regenerated embeddings for all {len(players)} players")
    return improved_players

def improved_similarity_search(players: List[Dict], query: str, top_k: int = 5) -> List[Dict]:
    """
    Perform similarity search using improved embeddings
    """
    print(f"\n🔍 IMPROVED SIMILARITY SEARCH")
    print("=" * 60)
    print(f"Query: '{query}'")
    print(f"Searching {len(players)} players...")
    
    # Generate query embedding
    query_embedding = embedding_service.generate_embedding(query)
    
    # Get improved embeddings
    player_embeddings = []
    valid_players = []
    
    for player in players:
        embedding = player.get('improved_embedding')
        if embedding and len(embedding) > 0:
            player_embeddings.append(embedding)
            valid_players.append(player)
    
    if not player_embeddings:
        print("❌ No valid improved embeddings found!")
        return []
    
    print(f"Found {len(valid_players)} players with improved embeddings")
    
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
            'stats': player.get('stats', {}),
            'groq_descriptions': player.get('groq_descriptions', {}),
            'improved_embedding_text': player.get('improved_embedding_text', ''),
            'original_embedding_text': player.get('enhanced_description', '')
        }
        results.append(result)
    
    return results

def print_improved_search_results(results: List[Dict]) -> None:
    """Print improved search results showing the difference"""
    print(f"\n📊 IMPROVED SEARCH RESULTS")
    print("=" * 60)
    
    for result in results:
        print(f"\n🏆 #{result['rank']} - {result['riot_id']} (Similarity: {result['similarity_score']:.3f})")
        
        stats = result['stats']
        role = stats.get('primary_lane', 'Unknown')
        champions = stats.get('most_played_champions', [])
        
        print(f"   🎯 Role: {role}")
        print(f"   🎮 Champions: {', '.join(champions[:3])}")
        print(f"   📝 Bio: {result['bio']}")
        
        groq = result['groq_descriptions']
        if groq.get('comprehensive'):
            print(f"   📊 Overview: {groq['comprehensive']}")
        
        print(f"\n   🔍 What's Now Embedded:")
        improved_text = result['improved_embedding_text']
        print(f"   {improved_text[:300]}...")
        
        print(f"\n   📈 Old vs New Embedding Text:")
        old_text = result['original_embedding_text']
        print(f"   OLD: {old_text[:150]}...")
        print(f"   NEW: {improved_text[:150]}...")

def save_improved_data(players: List[Dict], filename: str = 'mass_processed_players_improved.json') -> None:
    """Save players with improved embeddings"""
    try:
        output_data = {
            'processed_players': players,
            'stats': {
                'total_processed': len(players),
                'with_improved_embeddings': len([p for p in players if p.get('improved_embedding')]),
                'improvement_method': 'champion_names_and_role_specific'
            },
            'improvements': [
                'Added explicit champion names to embeddings',
                'Added role information prominently',
                'Added champion-specific gameplay keywords',
                'Enhanced Groq descriptions with specific details',
                'Added playstyle traits based on champion analysis'
            ]
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Improved data saved to: {filename}")
        
    except Exception as e:
        print(f"❌ Error saving improved data: {e}")

def compare_search_results(players: List[Dict], query: str) -> None:
    """Compare old vs new search results"""
    print(f"\n🔬 COMPARING OLD VS NEW SEARCH RESULTS")
    print("=" * 80)
    print(f"Query: '{query}'")
    
    # Old search (using original embeddings)
    print(f"\n📊 OLD SEARCH RESULTS (Original Embeddings):")
    print("-" * 50)
    
    query_embedding = embedding_service.generate_embedding(query)
    old_embeddings = [p.get('embedding', []) for p in players if p.get('embedding')]
    old_valid_players = [p for p in players if p.get('embedding')]
    
    if old_embeddings:
        old_similarities = cosine_similarity([query_embedding], old_embeddings)[0]
        old_top_indices = np.argsort(old_similarities)[::-1][:3]
        
        for i, idx in enumerate(old_top_indices):
            player = old_valid_players[idx]
            score = old_similarities[idx]
            stats = player.get('stats', {})
            print(f"   {i+1}. {player.get('riot_id')} ({score:.3f}) - {stats.get('primary_lane')} - {stats.get('most_played_champions', [])[:2]}")
    
    # New search (using improved embeddings)
    print(f"\n📊 NEW SEARCH RESULTS (Improved Embeddings):")
    print("-" * 50)
    
    new_results = improved_similarity_search(players, query, top_k=3)
    for result in new_results:
        stats = result['stats']
        print(f"   {result['rank']}. {result['riot_id']} ({result['similarity_score']:.3f}) - {stats.get('primary_lane')} - {stats.get('most_played_champions', [])[:2]}")

def main():
    """Main function to test improved embedding system"""
    print("🚀 IMPROVED EMBEDDING SYSTEM")
    print("=" * 80)
    
    # Load existing data
    players = load_mass_processed_players()
    if not players:
        return
    
    print(f"\n📊 CURRENT SYSTEM ANALYSIS:")
    print("=" * 40)
    
    # Show current embedding issues
    sample_player = players[0]
    print(f"Sample player: {sample_player.get('riot_id')}")
    print(f"Role: {sample_player.get('stats', {}).get('primary_lane')}")
    print(f"Champions: {sample_player.get('stats', {}).get('most_played_champions')}")
    print(f"Current embedding text: {sample_player.get('enhanced_description', '')[:200]}...")
    
    # Show improved embedding text
    improved_text = create_improved_embedding_text(sample_player)
    print(f"\nImproved embedding text: {improved_text[:200]}...")
    
    # Ask user if they want to regenerate
    print(f"\n🔄 EMBEDDING REGENERATION")
    print("=" * 40)
    print("This will regenerate embeddings to include:")
    print("• Explicit champion names (Graves, Nidalee, etc.)")
    print("• Role information (jungle player, adc main, etc.)")
    print("• Champion-specific gameplay keywords")
    print("• Enhanced descriptions with specific details")
    
    regenerate = input("\nRegenerate embeddings with improvements? (y/n): ").lower().strip()
    
    if regenerate == 'y':
        # Regenerate embeddings
        improved_players = regenerate_embeddings(players)
        
        # Save improved data
        save_improved_data(improved_players)
        
        # Test the improved search
        print(f"\n🧪 TESTING IMPROVED SEARCH")
        print("=" * 40)
        
        test_queries = [
            "aggressive early game jungler that plays graves",
            "jungle player who plays graves",
            "graves jungle main",
            "early game aggressive jungler"
        ]
        
        for query in test_queries:
            print(f"\n" + "="*60)
            compare_search_results(improved_players, query)
            
            # Show detailed results for first query
            if query == test_queries[0]:
                results = improved_similarity_search(improved_players, query, top_k=5)
                print_improved_search_results(results)
    
    else:
        print("👋 Skipping regeneration. Current embeddings maintained.")

if __name__ == "__main__":
    main() 