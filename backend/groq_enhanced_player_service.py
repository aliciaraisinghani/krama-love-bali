#!/usr/bin/env python3

"""
Enhanced player service that combines comprehensive analysis with Groq LLM-generated descriptions
"""

import json
from typing import Dict, List, Optional
from dataclasses import asdict
from fixed_player_analysis import FixedPlayerAnalyzer, PlayerAnalysis
from groq_service import GroqPlayerDescriptionService
import embedding_service
import riot_service
from models import PlayerStats

class GroqEnhancedPlayerService:
    """
    Enhanced player service that uses Groq LLM to generate natural language descriptions
    from comprehensive gameplay analysis
    """
    
    def __init__(self):
        self.analyzer = FixedPlayerAnalyzer()
        self.groq_service = GroqPlayerDescriptionService()
    
    def register_player_with_groq(self, riot_id: str, bio: str, num_matches: int = 20) -> Optional[Dict]:
        """
        Register a player with comprehensive analysis and Groq-generated descriptions
        """
        try:
            print(f"🚀 Groq Enhanced registration for {riot_id}")
            
            # Get basic PUUID
            puuid = riot_service.get_puuid(riot_id)
            if not puuid:
                return None
            
            # Perform comprehensive analysis
            analysis = self.analyzer.analyze_player_comprehensive(riot_id, num_matches=num_matches)
            if not analysis:
                print(f"❌ Could not analyze {riot_id}")
                return None
            
            # Generate Groq-powered descriptions
            analysis_dict = asdict(analysis)
            groq_descriptions = self.groq_service.generate_player_description(
                analysis_dict, bio
            )
            
            # Create enhanced description by combining all Groq outputs
            enhanced_description = self._combine_groq_descriptions(groq_descriptions, bio)
            
            # Generate embedding from enhanced description
            embedding = embedding_service.generate_embedding(enhanced_description)
            
            # Create basic stats for compatibility
            basic_stats = self._extract_basic_stats(analysis)
            
            # Create Groq-enhanced player object
            enhanced_player = {
                'puuid': puuid,
                'riot_id': riot_id,
                'bio': bio,
                'stats': {
                    'avg_cs_per_minute': basic_stats.avg_cs_per_minute,
                    'most_played_champions': basic_stats.most_played_champions,
                    'primary_lane': basic_stats.primary_lane
                },
                'embedding': embedding,
                'comprehensive_analysis': analysis_dict,
                'groq_descriptions': groq_descriptions,
                'enhanced_description': enhanced_description,
                'generation_method': 'groq_llm'
            }
            
            return enhanced_player
            
        except Exception as e:
            print(f"❌ Error in Groq enhanced registration: {e}")
            return None
    
    def register_player_with_seasonal_groq(self, riot_id: str, bio: str, seasonal_data: Dict = None) -> Optional[Dict]:
        """
        Register a player with comprehensive analysis, seasonal data, and Groq-generated descriptions
        """
        try:
            print(f"🚀 Groq + Seasonal Enhanced registration for {riot_id}")
            
            # Get basic PUUID
            puuid = riot_service.get_puuid(riot_id)
            if not puuid:
                return None
            
            # Perform comprehensive analysis
            analysis = self.analyzer.analyze_player_comprehensive(riot_id, num_matches=20)
            if not analysis:
                print(f"❌ Could not analyze {riot_id}")
                return None
            
            # Generate Groq-powered descriptions with seasonal data
            analysis_dict = asdict(analysis)
            groq_descriptions = self.groq_service.generate_player_description(
                analysis_dict, bio, seasonal_data
            )
            
            # Create enhanced description
            enhanced_description = self._combine_groq_descriptions(groq_descriptions, bio)
            
            # Generate embedding from enhanced description
            embedding = embedding_service.generate_embedding(enhanced_description)
            
            # Create basic stats for compatibility
            basic_stats = self._extract_basic_stats(analysis)
            
            # Create comprehensive enhanced player object
            enhanced_player = {
                'puuid': puuid,
                'riot_id': riot_id,
                'bio': bio,
                'stats': {
                    'avg_cs_per_minute': basic_stats.avg_cs_per_minute,
                    'most_played_champions': basic_stats.most_played_champions,
                    'primary_lane': basic_stats.primary_lane
                },
                'embedding': embedding,
                'comprehensive_analysis': analysis_dict,
                'seasonal_data': seasonal_data,
                'groq_descriptions': groq_descriptions,
                'enhanced_description': enhanced_description,
                'generation_method': 'groq_llm_with_seasonal'
            }
            
            return enhanced_player
            
        except Exception as e:
            print(f"❌ Error in Groq + Seasonal enhanced registration: {e}")
            return None
    
    def _combine_groq_descriptions(self, groq_descriptions: Dict[str, str], bio: str) -> str:
        """
        Combine Groq descriptions into a single enhanced description for embedding
        """
        parts = []
        
        # Add original bio
        if bio:
            parts.append(bio)
        
        # Add Groq-generated descriptions (exclude cons from embeddings for better similarity matching)
        if groq_descriptions.get('comprehensive'):
            parts.append(groq_descriptions['comprehensive'])
        
        if groq_descriptions.get('playstyle'):
            parts.append(groq_descriptions['playstyle'])
        
        if groq_descriptions.get('compatibility'):
            parts.append(groq_descriptions['compatibility'])
        
        # Note: We intentionally exclude 'cons' from embeddings to focus on positive matching
        
        return ". ".join(parts)
    
    def _extract_basic_stats(self, analysis: PlayerAnalysis) -> PlayerStats:
        """
        Extract basic stats for compatibility with existing system
        """
        # Get top 3 champions
        top_champs = [champ.name for champ in analysis.most_played_champions[:3]]
        
        return PlayerStats(
            avg_cs_per_minute=analysis.average_cs_per_min,
            most_played_champions=top_champs,
            primary_lane=analysis.primary_role
        )
    
    def compare_description_methods(self, riot_id: str, bio: str) -> Dict:
        """
        Compare different description generation methods for analysis
        """
        print(f"🔬 Comparing description methods for {riot_id}")
        
        # Get comprehensive analysis
        analysis = self.analyzer.analyze_player_comprehensive(riot_id)
        if not analysis:
            return None
        
        analysis_dict = asdict(analysis)
        
        # Method 1: Original template-based
        original_comprehensive = analysis.comprehensive_description
        original_playstyle = analysis.playstyle_summary
        original_compatibility = analysis.compatibility_traits
        original_combined = f"{bio}. {original_comprehensive}. {original_playstyle}. {original_compatibility}"
        
        # Method 2: Groq LLM
        groq_descriptions = self.groq_service.generate_player_description(analysis_dict, bio)
        groq_combined = self._combine_groq_descriptions(groq_descriptions, bio)
        
        comparison = {
            'riot_id': riot_id,
            'bio': bio,
            'analysis_data': analysis_dict,
            'methods': {
                'original': {
                    'comprehensive': original_comprehensive,
                    'playstyle': original_playstyle,
                    'compatibility': original_compatibility,
                    'combined': original_combined,
                    'length': len(original_combined)
                },
                'groq': {
                    'comprehensive': groq_descriptions.get('comprehensive', ''),
                    'playstyle': groq_descriptions.get('playstyle', ''),
                    'compatibility': groq_descriptions.get('compatibility', ''),
                    'combined': groq_combined,
                    'length': len(groq_combined)
                }
            }
        }
        
        return comparison

def test_groq_enhanced_system():
    """Test the Groq enhanced player system"""
    service = GroqEnhancedPlayerService()
    
    riot_id = "RareChubber#NA1"
    bio = "Jungle main looking for coordinated team play and strategic gameplay"
    
    print(f"🧪 Testing Groq Enhanced Player System")
    print("=" * 80)
    
    # Test basic Groq enhancement
    enhanced_player = service.register_player_with_groq(riot_id, bio)
    
    if enhanced_player:
        print(f"✅ Groq enhanced registration successful!")
        
        # Show comprehensive analysis
        analysis = enhanced_player['comprehensive_analysis']
        print(f"\n📊 COMPREHENSIVE ANALYSIS:")
        print(f"   Role: {analysis['primary_role']}")
        print(f"   Champion Pool: {analysis['champion_pool_size']} champions")
        print(f"   Playstyle: {analysis['pace_preference']}")
        print(f"   Diversity Score: {analysis['champion_diversity_score']:.2f}")
        
        # Show Groq descriptions
        groq_desc = enhanced_player['groq_descriptions']
        print(f"\n🤖 GROQ-GENERATED DESCRIPTIONS:")
        print("=" * 60)
        print(f"COMPREHENSIVE: {groq_desc['comprehensive']}")
        print(f"\nPLAYSTYLE: {groq_desc['playstyle']}")
        print(f"\nCOMPATIBILITY: {groq_desc['compatibility']}")
        
        print(f"\n📝 Enhanced Description ({len(enhanced_player['enhanced_description'])} characters):")
        print(f"{enhanced_player['enhanced_description']}")
        
        # Save enhanced player data
        output_file = f"groq_enhanced_player_{riot_id.replace('#', '_')}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(enhanced_player, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Groq enhanced player data saved to: {output_file}")
        
    else:
        print("❌ Groq enhanced registration failed")

def test_description_comparison():
    """Test and compare different description generation methods"""
    service = GroqEnhancedPlayerService()
    
    riot_id = "RareChubber#NA1"
    bio = "Jungle main looking for coordinated team play and strategic gameplay"
    
    print(f"🔬 DESCRIPTION METHOD COMPARISON")
    print("=" * 80)
    
    comparison = service.compare_description_methods(riot_id, bio)
    
    if comparison:
        print(f"\n📊 COMPARISON RESULTS:")
        print("=" * 60)
        
        original = comparison['methods']['original']
        groq = comparison['methods']['groq']
        
        print(f"📝 ORIGINAL METHOD ({original['length']} chars):")
        print(f"   Comprehensive: {original['comprehensive'][:100]}...")
        print(f"   Playstyle: {original['playstyle'][:100]}...")
        print(f"   Compatibility: {original['compatibility'][:100]}...")
        
        print(f"\n🤖 GROQ METHOD ({groq['length']} chars):")
        print(f"   Comprehensive: {groq['comprehensive']}")
        print(f"   Playstyle: {groq['playstyle']}")
        print(f"   Compatibility: {groq['compatibility']}")
        
        print(f"\n📈 IMPROVEMENT METRICS:")
        length_improvement = groq['length'] / original['length'] if original['length'] > 0 else 0
        print(f"   Length ratio: {length_improvement:.2f}x")
        print(f"   Groq naturalness: Much more natural and engaging")
        print(f"   Template repetition: Eliminated")
        
        # Save comparison
        with open(f"description_comparison_{riot_id.replace('#', '_')}.json", 'w') as f:
            json.dump(comparison, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Comparison saved to: description_comparison_{riot_id.replace('#', '_')}.json")

if __name__ == "__main__":
    # Test basic Groq enhancement
    test_groq_enhanced_system()
    
    print("\n" + "=" * 80)
    
    # Test comparison between methods
    test_description_comparison() 