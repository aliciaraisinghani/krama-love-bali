#!/usr/bin/env python3

"""
Groq service for generating natural language player descriptions from analysis data
"""

import os
import json
from typing import Dict, List, Optional
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

class GroqPlayerDescriptionService:
    """Service for generating player descriptions using Groq LLM"""
    
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY not found in .env file")
        
        self.client = Groq(api_key=self.api_key)
        self.model = "llama3-70b-8192"  # Fast and capable model
    
    def generate_player_description(self, analysis_data: Dict, bio: str = "", seasonal_data: Dict = None) -> Dict[str, str]:
        """
        Generate comprehensive player descriptions using Groq LLM
        
        Args:
            analysis_data: Comprehensive analysis data from FixedPlayerAnalyzer
            bio: User's original bio
            seasonal_data: Optional seasonal ranked data
            
        Returns:
            Dict with different types of descriptions
        """
        try:
            # Prepare the data for the LLM
            prompt = self._create_analysis_prompt(analysis_data, bio, seasonal_data)
            
            print("🤖 Generating LLM-powered player description...")
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": self._get_system_prompt()
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ],
                temperature=0.7,  # Some creativity but consistent
                max_tokens=1500,  # Enough for comprehensive descriptions
                top_p=0.9
            )
            
            # Parse the response
            content = response.choices[0].message.content
            descriptions = self._parse_llm_response(content)
            
            print("✅ LLM description generated successfully")
            return descriptions
            
        except Exception as e:
            print(f"❌ Error generating LLM description: {e}")
            # Fallback to basic description
            return self._fallback_description(analysis_data, bio)
    
    def _get_system_prompt(self) -> str:
        """Get the system prompt for the LLM"""
        return """You are an expert League of Legends analyst who creates engaging player profiles for a matchmaking system. Your job is to transform raw gameplay data into natural, compelling descriptions that help players find compatible teammates.

IMPORTANT GUIDELINES:
- Write in a natural, engaging tone (not robotic or template-like)
- Focus on playstyle, strengths, and compatibility traits
- Use League terminology appropriately but keep it accessible
- Be specific about gameplay patterns and preferences
- Highlight what makes this player unique
- Keep descriptions concise but informative
- Avoid repetitive phrasing

You will receive detailed gameplay analysis and should output exactly 4 sections:

COMPREHENSIVE: A complete 2-3 sentence overview of the player
PLAYSTYLE: 1-2 sentences focusing on their gameplay approach and preferences  
COMPATIBILITY: 1-2 sentences about what teammates they work well with
CONS: 1-2 sentences about potential challenges or areas for improvement (be constructive, not harsh)

Format your response exactly like this:
COMPREHENSIVE: [description]
PLAYSTYLE: [description]
COMPATIBILITY: [description]
CONS: [description]"""

    def _create_analysis_prompt(self, analysis_data: Dict, bio: str, seasonal_data: Dict = None) -> str:
        """Create a comprehensive prompt with all the analysis data"""
        
        prompt_parts = []
        
        # Add user bio if available
        if bio:
            prompt_parts.append(f"PLAYER BIO: {bio}")
        
        # Add basic info
        prompt_parts.append(f"RIOT ID: {analysis_data.get('riot_id', 'Unknown')}")
        prompt_parts.append(f"PRIMARY ROLE: {analysis_data.get('primary_role', 'Unknown')}")
        
        if analysis_data.get('secondary_roles'):
            prompt_parts.append(f"SECONDARY ROLES: {', '.join(analysis_data['secondary_roles'])}")
        
        # Champion pool analysis
        champion_pool_size = analysis_data.get('champion_pool_size', 0)
        prompt_parts.append(f"CHAMPION POOL: {champion_pool_size} unique champions")
        
        # Top champions with detailed info
        top_champions = analysis_data.get('most_played_champions', [])[:5]
        if top_champions:
            prompt_parts.append("TOP CHAMPIONS:")
            for i, champ in enumerate(top_champions, 1):
                champ_info = f"  {i}. {champ['name']}: {champ['games_played']} games ({champ['win_rate']:.0f}% WR)"
                if champ.get('playstyle_tags'):
                    champ_info += f" - Tags: {', '.join(champ['playstyle_tags'][:3])}"
                if champ.get('difficulty_tier'):
                    champ_info += f" - Difficulty: {champ['difficulty_tier']}"
                prompt_parts.append(champ_info)
        
        # Playstyle metrics with explanations
        prompt_parts.append("PLAYSTYLE ANALYSIS:")
        
        diversity = analysis_data.get('champion_diversity_score', 0)
        prompt_parts.append(f"  Champion Diversity: {diversity:.2f} (0=one-trick, 1=very diverse)")
        
        one_trick = analysis_data.get('one_trick_tendency', 0)
        prompt_parts.append(f"  One-trick Tendency: {one_trick:.2f} (higher=focuses on fewer champions)")
        
        aggressive = analysis_data.get('aggressive_tendency', 0)
        prompt_parts.append(f"  Aggressive Tendency: {aggressive:.2f} (plays early game champions)")
        
        scaling = analysis_data.get('scaling_preference', 0)
        prompt_parts.append(f"  Scaling Preference: {scaling:.2f} (prefers late game champions)")
        
        mechanical = analysis_data.get('mechanical_skill_level', 0)
        prompt_parts.append(f"  Mechanical Skill Preference: {mechanical:.2f} (plays high-skill champions)")
        
        meta = analysis_data.get('meta_adaptation', 0)
        prompt_parts.append(f"  Meta Adaptation: {meta:.2f} (follows current meta)")
        
        pace = analysis_data.get('pace_preference', 'Unknown')
        prompt_parts.append(f"  Pace Preference: {pace}")
        
        # Performance patterns
        prompt_parts.append("PERFORMANCE PATTERNS:")
        
        cs_pattern = analysis_data.get('cs_pattern', 'Unknown')
        avg_cs = analysis_data.get('average_cs_per_min', 0)
        prompt_parts.append(f"  CS Pattern: {cs_pattern} ({avg_cs:.1f} CS/min average)")
        
        early_perf = analysis_data.get('early_game_performance', 0)
        late_perf = analysis_data.get('late_game_performance', 0)
        prompt_parts.append(f"  Early Game Performance: {early_perf:.2f} (win rate in short games)")
        prompt_parts.append(f"  Late Game Performance: {late_perf:.2f} (win rate in long games)")
        
        # Recent trends
        prompt_parts.append("RECENT TRENDS:")
        
        perf_trend = analysis_data.get('performance_trend', 'Unknown')
        prompt_parts.append(f"  Performance Trend: {perf_trend}")
        
        meta_following = analysis_data.get('meta_following', 0)
        prompt_parts.append(f"  Recent Meta Following: {meta_following:.2f}")
        
        champion_shifts = analysis_data.get('recent_champion_shifts', [])
        if champion_shifts:
            prompt_parts.append(f"  Champion Shifts: {', '.join(champion_shifts)}")
        
        # Add seasonal data if available
        if seasonal_data:
            prompt_parts.append("SEASONAL RANKED DATA:")
            
            for queue_type, data in seasonal_data.items():
                total_matches = data.get('total_matches', 0)
                prompt_parts.append(f"  {queue_type}: {total_matches} matches this season")
                
                champion_stats = data.get('champion_stats', {})
                if champion_stats:
                    top_seasonal = list(champion_stats.items())[:3]
                    for champ, stats in top_seasonal:
                        prompt_parts.append(f"    {champ}: {stats['games']} games ({stats['win_rate']:.0f}% WR)")
        
        # Final instruction
        prompt_parts.append("\nBased on this comprehensive analysis, create natural and engaging descriptions that capture this player's unique style and what makes them a good teammate. Focus on their strengths, playstyle preferences, and compatibility traits.")
        
        return "\n".join(prompt_parts)
    
    def _parse_llm_response(self, content: str) -> Dict[str, str]:
        """Parse the LLM response into structured descriptions"""
        descriptions = {
            'comprehensive': '',
            'playstyle': '',
            'compatibility': '',
            'cons': ''
        }
        
        try:
            lines = content.strip().split('\n')
            current_section = None
            
            for line in lines:
                line = line.strip()
                if line.startswith('COMPREHENSIVE:'):
                    current_section = 'comprehensive'
                    descriptions[current_section] = line.replace('COMPREHENSIVE:', '').strip()
                elif line.startswith('PLAYSTYLE:'):
                    current_section = 'playstyle'
                    descriptions[current_section] = line.replace('PLAYSTYLE:', '').strip()
                elif line.startswith('COMPATIBILITY:'):
                    current_section = 'compatibility'
                    descriptions[current_section] = line.replace('COMPATIBILITY:', '').strip()
                elif line.startswith('CONS:'):
                    current_section = 'cons'
                    descriptions[current_section] = line.replace('CONS:', '').strip()
                elif current_section and line:
                    # Continue previous section if it's a multi-line response
                    descriptions[current_section] += ' ' + line
            
            # Clean up descriptions
            for key in descriptions:
                descriptions[key] = descriptions[key].strip()
                
        except Exception as e:
            print(f"❌ Error parsing LLM response: {e}")
            print(f"Raw response: {content}")
        
        return descriptions
    
    def _fallback_description(self, analysis_data: Dict, bio: str) -> Dict[str, str]:
        """Fallback descriptions if LLM fails"""
        riot_id = analysis_data.get('riot_id', 'Player')
        role = analysis_data.get('primary_role', 'Unknown')
        
        return {
            'comprehensive': f"{riot_id} is a {role} main with a diverse champion pool who adapts well to different team compositions.",
            'playstyle': f"Balanced playstyle player who focuses on consistent performance across different game phases.",
            'compatibility': f"Compatible with players who enjoy coordinated team play and strategic gameplay.",
            'cons': f"May benefit from more focused champion specialization and consistent performance patterns."
        }

def test_groq_service():
    """Test the Groq service with sample data"""
    
    # Load existing analysis data for testing
    try:
        with open('fixed_player_analysis_RareChubber_NA1.json', 'r') as f:
            analysis_data = json.load(f)
    except FileNotFoundError:
        print("❌ No existing analysis file found. Run fixed analysis first.")
        return
    
    service = GroqPlayerDescriptionService()
    bio = "Jungle main looking for coordinated team play and strategic gameplay"
    
    print("🧪 Testing Groq Player Description Service")
    print("=" * 60)
    
    descriptions = service.generate_player_description(analysis_data, bio)
    
    print("\n📝 GROQ-GENERATED DESCRIPTIONS:")
    print("=" * 60)
    print(f"COMPREHENSIVE: {descriptions['comprehensive']}")
    print(f"\nPLAYSTYLE: {descriptions['playstyle']}")
    print(f"\nCOMPATIBILITY: {descriptions['compatibility']}")
    
    # Save the enhanced descriptions
    output_data = {
        'analysis_data': analysis_data,
        'groq_descriptions': descriptions,
        'original_bio': bio
    }
    
    with open('groq_enhanced_player_RareChubber_NA1.json', 'w') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Groq-enhanced data saved to: groq_enhanced_player_RareChubber_NA1.json")

if __name__ == "__main__":
    test_groq_service() 