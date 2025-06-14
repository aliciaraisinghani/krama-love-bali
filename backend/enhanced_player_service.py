import json
from typing import Dict, List, Optional
from fixed_player_analysis import FixedPlayerAnalyzer, PlayerAnalysis
from groq_service import GroqPlayerDescriptionService
import embedding_service
import riot_service
from models import Player, PlayerStats
from dataclasses import asdict

class EnhancedPlayerService:
    """
    Enhanced player service that combines comprehensive analysis with embeddings
    for superior matchmaking
    """
    
    def __init__(self):
        self.analyzer = FixedPlayerAnalyzer()
        self.groq_service = GroqPlayerDescriptionService()
    
    def register_player_comprehensive(self, riot_id: str, bio: str) -> Optional[Dict]:
        """
        Register a player with comprehensive analysis and enhanced embeddings
        """
        try:
            print(f"🚀 Enhanced registration for {riot_id}")
            
            # Get basic PUUID
            puuid = riot_service.get_puuid(riot_id)
            if not puuid:
                return None
            
            # Perform comprehensive analysis
            analysis = self.analyzer.analyze_player_comprehensive(riot_id)
            if not analysis:
                print(f"❌ Could not analyze {riot_id}")
                return None
            
            # Generate Groq-powered descriptions
            analysis_dict = asdict(analysis)
            groq_descriptions = self.groq_service.generate_player_description(analysis_dict, bio)
            
            # Create enhanced description combining bio + Groq descriptions
            enhanced_description = self._combine_groq_descriptions(groq_descriptions, bio)
            
            # Generate embedding from enhanced description
            embedding = embedding_service.generate_embedding(enhanced_description)
            
            # Create basic stats for compatibility
            basic_stats = self._extract_basic_stats(analysis)
            
            # Create enhanced player object
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
                'comprehensive_analysis': asdict(analysis),
                'groq_descriptions': groq_descriptions,
                'enhanced_description': enhanced_description,
                'generation_method': 'groq_llm'
            }
            
            return enhanced_player
            
        except Exception as e:
            print(f"❌ Error in enhanced registration: {e}")
            return None
    
    def _create_enhanced_description(self, bio: str, analysis: PlayerAnalysis) -> str:
        """
        Create enhanced description combining user bio with comprehensive analysis
        """
        # Start with user bio
        enhanced_parts = [bio]
        
        # Add comprehensive analysis
        enhanced_parts.append(analysis.comprehensive_description)
        
        # Add detailed playstyle information
        enhanced_parts.append(analysis.playstyle_summary)
        
        # Add compatibility traits
        enhanced_parts.append(analysis.compatibility_traits)
        
        # Add specific champion information
        if analysis.most_played_champions:
            top_champs = analysis.most_played_champions[:3]
            champ_details = []
            for champ in top_champs:
                detail = f"skilled with {champ.name} ({champ.games_played} games, {champ.win_rate:.0f}% winrate)"
                if champ.playstyle_tags:
                    detail += f" - {', '.join(champ.playstyle_tags[:2])}"
                champ_details.append(detail)
            enhanced_parts.append(f"Champion expertise: {'. '.join(champ_details)}")
        
        # Add performance insights
        performance_insights = []
        if analysis.average_cs_per_min > 6:
            performance_insights.append(f"excellent CS skills ({analysis.average_cs_per_min:.1f} CS/min)")
        elif analysis.average_cs_per_min > 4:
            performance_insights.append(f"solid farming ({analysis.average_cs_per_min:.1f} CS/min)")
        
        if analysis.early_game_performance > 0.6:
            performance_insights.append("strong early game player")
        elif analysis.late_game_performance > 0.6:
            performance_insights.append("excels in late game scenarios")
        
        if performance_insights:
            enhanced_parts.append(f"Performance strengths: {', '.join(performance_insights)}")
        
        # Add recent trends
        if analysis.recent_champion_shifts:
            trends = f"Recent activity: {', '.join(analysis.recent_champion_shifts[:3])}"
            enhanced_parts.append(trends)
        
        # Add playstyle metrics in natural language
        playstyle_desc = []
        if analysis.aggressive_tendency > 0.6:
            playstyle_desc.append("aggressive early game style")
        elif analysis.scaling_preference > 0.6:
            playstyle_desc.append("scaling late game focus")
        
        if analysis.mechanical_skill_level > 0.6:
            playstyle_desc.append("high mechanical skill player")
        elif analysis.mechanical_skill_level < 0.3:
            playstyle_desc.append("strategic and macro-focused player")
        
        if analysis.meta_adaptation > 0.7:
            playstyle_desc.append("adapts quickly to meta changes")
        elif analysis.meta_adaptation < 0.3:
            playstyle_desc.append("innovates with unique picks")
        
        if playstyle_desc:
            enhanced_parts.append(f"Playstyle characteristics: {', '.join(playstyle_desc)}")
        
        return ". ".join(enhanced_parts)
    
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
    
    def find_similar_players_enhanced(self, query_player_analysis: PlayerAnalysis, 
                                    all_player_embeddings: List[List[float]], 
                                    all_player_analyses: List[PlayerAnalysis],
                                    top_k: int = 5) -> List[Dict]:
        """
        Find similar players using enhanced analysis and multiple similarity metrics
        """
        # Generate query embedding from comprehensive description
        query_embedding = embedding_service.generate_embedding(query_player_analysis.comprehensive_description)
        
        # Get basic similarity matches
        similar_indices = embedding_service.find_similar_players_optimized(
            query_embedding, all_player_embeddings, top_k=top_k*2  # Get more candidates
        )
        
        # Enhanced scoring with multiple factors
        enhanced_matches = []
        for idx in similar_indices:
            if idx >= len(all_player_analyses):
                continue
                
            candidate = all_player_analyses[idx]
            
            # Calculate enhanced similarity score
            similarity_score = self._calculate_enhanced_similarity(query_player_analysis, candidate)
            
            enhanced_matches.append({
                'player_analysis': candidate,
                'similarity_score': similarity_score,
                'index': idx
            })
        
        # Sort by enhanced similarity score
        enhanced_matches.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        return enhanced_matches[:top_k]
    
    def _calculate_enhanced_similarity(self, player1: PlayerAnalysis, player2: PlayerAnalysis) -> float:
        """
        Calculate enhanced similarity using multiple factors
        """
        similarity_factors = []
        
        # Role compatibility (high weight)
        role_similarity = 1.0 if player1.primary_role == player2.primary_role else 0.5
        if player1.primary_role in player2.secondary_roles or player2.primary_role in player1.secondary_roles:
            role_similarity = max(role_similarity, 0.7)
        similarity_factors.append(('role', role_similarity, 0.25))
        
        # Playstyle compatibility
        pace_similarity = 1.0 if player1.pace_preference == player2.pace_preference else 0.3
        similarity_factors.append(('pace', pace_similarity, 0.15))
        
        # Skill level compatibility (mechanical skill)
        skill_diff = abs(player1.mechanical_skill_level - player2.mechanical_skill_level)
        skill_similarity = max(0, 1 - skill_diff)
        similarity_factors.append(('skill', skill_similarity, 0.10))
        
        # Meta adaptation compatibility
        meta_diff = abs(player1.meta_adaptation - player2.meta_adaptation)
        meta_similarity = max(0, 1 - meta_diff)
        similarity_factors.append(('meta', meta_similarity, 0.10))
        
        # Champion pool diversity compatibility
        diversity_diff = abs(player1.champion_diversity_score - player2.champion_diversity_score)
        diversity_similarity = max(0, 1 - diversity_diff)
        similarity_factors.append(('diversity', diversity_similarity, 0.10))
        
        # Performance pattern compatibility
        early_diff = abs(player1.early_game_performance - player2.early_game_performance)
        late_diff = abs(player1.late_game_performance - player2.late_game_performance)
        performance_similarity = max(0, 1 - (early_diff + late_diff) / 2)
        similarity_factors.append(('performance', performance_similarity, 0.15))
        
        # CS pattern compatibility
        cs_diff = abs(player1.average_cs_per_min - player2.average_cs_per_min) / 10  # Normalize
        cs_similarity = max(0, 1 - cs_diff)
        similarity_factors.append(('cs', cs_similarity, 0.15))
        
        # Calculate weighted average
        total_score = sum(score * weight for _, score, weight in similarity_factors)
        
        return total_score
    
    def generate_compatibility_report(self, player1: PlayerAnalysis, player2: PlayerAnalysis) -> Dict:
        """
        Generate detailed compatibility report between two players
        """
        report = {
            'overall_compatibility': self._calculate_enhanced_similarity(player1, player2),
            'strengths': [],
            'potential_challenges': [],
            'recommendations': []
        }
        
        # Analyze compatibility strengths
        if player1.primary_role == player2.primary_role:
            report['strengths'].append(f"Both main {player1.primary_role} - understand the role deeply")
        elif player1.primary_role in player2.secondary_roles:
            report['strengths'].append(f"Complementary roles - {player1.primary_role}/{player2.primary_role}")
        
        if player1.pace_preference == player2.pace_preference:
            report['strengths'].append(f"Both prefer {player1.pace_preference.lower()} games")
        
        # Analyze potential challenges
        skill_diff = abs(player1.mechanical_skill_level - player2.mechanical_skill_level)
        if skill_diff > 0.4:
            report['potential_challenges'].append("Different mechanical skill preferences")
        
        cs_diff = abs(player1.average_cs_per_min - player2.average_cs_per_min)
        if cs_diff > 2:
            report['potential_challenges'].append("Different farming priorities")
        
        # Generate recommendations
        if player1.aggressive_tendency > 0.6 and player2.scaling_preference > 0.6:
            report['recommendations'].append("Balance early aggression with scaling strategy")
        
        if player1.meta_adaptation > 0.7 and player2.meta_adaptation < 0.3:
            report['recommendations'].append("Share meta insights and explore off-meta synergies")
        
        return report
    
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

def test_enhanced_system():
    """Test the enhanced player system"""
    service = EnhancedPlayerService()
    
    # Test enhanced registration
    riot_id = "RareChubber#NA1"
    bio = "Jungle main looking for coordinated team play and strategic gameplay"
    
    print(f"🧪 Testing Enhanced Player System")
    print("=" * 60)
    
    enhanced_player = service.register_player_comprehensive(riot_id, bio)
    
    if enhanced_player:
        print(f"✅ Enhanced registration successful!")
        print(f"\n📝 Enhanced Description:")
        print(f"{enhanced_player['enhanced_description'][:500]}...")
        
        print(f"\n📊 Comprehensive Analysis Available:")
        analysis = enhanced_player['comprehensive_analysis']
        print(f"   Role: {analysis['primary_role']}")
        print(f"   Champion Pool: {analysis['champion_pool_size']} champions")
        print(f"   Playstyle: {analysis['pace_preference']}")
        print(f"   Mechanical Skill: {analysis['mechanical_skill_level']:.2f}")
        print(f"   Meta Adaptation: {analysis['meta_adaptation']:.2f}")
        
        # Save enhanced player data
        output_file = f"enhanced_player_{riot_id.replace('#', '_')}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(enhanced_player, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Enhanced player data saved to: {output_file}")
        
    else:
        print("❌ Enhanced registration failed")

if __name__ == "__main__":
    test_enhanced_system() 