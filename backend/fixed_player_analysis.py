import json
import requests
import os
from dotenv import load_dotenv
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from collections import Counter, defaultdict
import statistics
import time
import riot_service
from models import PlayerStats

load_dotenv()

# Champion metadata for analysis
CHAMPION_DATA = {
    # Playstyle categories
    "aggressive_early": ["Draven", "Pantheon", "Renekton", "Lee Sin", "Graves", "Lucian", "Kalista", "Riven", "Darius", "Talon", "Zed"],
    "scaling_late": ["Kayle", "Kassadin", "Veigar", "Nasus", "Vayne", "Jinx", "Kog'Maw", "Azir", "Ryze", "Gangplank", "Jax"],
    "tank_support": ["Maokai", "Malphite", "Ammu", "Rammus", "Leona", "Braum", "Thresh", "Alistar", "Nautilus", "Blitzcrank"],
    "assassin_burst": ["Zed", "Talon", "Katarina", "Akali", "Fizz", "LeBlanc", "Qiyana", "Rengar", "Kha'Zix", "Evelynn"],
    "control_mage": ["Orianna", "Azir", "Viktor", "Syndra", "Xerath", "Ziggs", "Anivia", "Vel'Koz", "Lux", "Brand"],
    "mobile_skirmisher": ["Yasuo", "Yone", "Irelia", "Fiora", "Camille", "Riven", "Lee Sin", "Graves", "Kindred"],
    "utility_support": ["Janna", "Lulu", "Nami", "Soraka", "Sona", "Yuumi", "Karma", "Morgana", "Zyra"],
    
    # Difficulty tiers
    "high_skill": ["Azir", "Ryze", "Yasuo", "Riven", "Lee Sin", "Zed", "Katarina", "Draven", "Kalista", "Gangplank", "Irelia", "Fiora"],
    "medium_skill": ["Orianna", "Syndra", "Jinx", "Caitlyn", "Thresh", "Braum", "Graves", "Lucian", "Viktor", "LeBlanc"],
    "low_skill": ["Garen", "Malphite", "Ammu", "Janna", "Soraka", "Annie", "Ashe", "Jinx", "Lux", "Master Yi"],
    
    # Meta status (this would be updated regularly)
    "meta_s_tier": ["Graves", "Kha'Zix", "Orianna", "Jinx", "Thresh", "Camille", "Lee Sin", "Viktor"],
    "meta_a_tier": ["Lucian", "Caitlyn", "Syndra", "Braum", "Riven", "Zed", "Azir", "Jax"],
    "niche_picks": ["Singed", "Heimerdinger", "Teemo", "Shaco", "Aurelion Sol", "Ivern", "Bard", "Tahm Kench"],
    
    # Pace preference
    "fast_paced": ["Lee Sin", "Graves", "Lucian", "Draven", "Kalista", "Riven", "Yasuo", "Katarina", "Talon"],
    "slow_paced": ["Nasus", "Kayle", "Veigar", "Kog'Maw", "Sona", "Soraka", "Anivia", "Karthus", "Vel'Koz"],
    
    # CS patterns
    "high_cs": ["Azir", "Viktor", "Orianna", "Syndra", "Jinx", "Caitlyn", "Tristana", "Nasus", "Gangplank"],
    "low_cs": ["Roaming supports", "Jungle assassins", "Bard", "Pyke", "Thresh", "Blitzcrank"],
}

@dataclass
class ChampionInsight:
    name: str
    games_played: int
    win_rate: float
    avg_kda: str
    avg_cs: float
    recent_games: int  # Games in last 10 matches
    playstyle_tags: List[str]
    difficulty_tier: str
    meta_status: str

@dataclass
class PlayerAnalysis:
    # Basic info
    riot_id: str
    primary_role: str
    secondary_roles: List[str]
    
    # Champion analysis
    champion_pool_size: int
    most_played_champions: List[ChampionInsight]
    champion_diversity_score: float
    one_trick_tendency: float
    
    # Playstyle analysis
    aggressive_tendency: float
    scaling_preference: float
    mechanical_skill_level: float
    meta_adaptation: float
    pace_preference: str
    
    # Performance patterns
    cs_pattern: str
    average_cs_per_min: float
    kda_consistency: float
    late_game_performance: float
    early_game_performance: float
    
    # Recent trends
    recent_champion_shifts: List[str]
    performance_trend: str
    meta_following: float
    
    # Text description for vector DB
    comprehensive_description: str
    playstyle_summary: str
    compatibility_traits: str

class FixedPlayerAnalyzer:
    def __init__(self):
        self.riot_api_key = os.getenv("RIOT_API_KEY")
    
    def analyze_player_comprehensive(self, riot_id: str, num_matches: int = 50) -> Optional[PlayerAnalysis]:
        """
        Perform comprehensive analysis of a player with proper match aggregation
        """
        try:
            print(f"🔍 Analyzing player: {riot_id}")
            
            # Get PUUID and basic stats
            puuid = riot_service.get_puuid(riot_id)
            if not puuid:
                print(f"❌ Could not find player: {riot_id}")
                return None
            
            # Get match history
            match_ids = riot_service.get_recent_matches(puuid, num_matches)
            if not match_ids:
                print(f"❌ No match history found for: {riot_id}")
                return None
            
            print(f"📊 Analyzing {len(match_ids)} matches...")
            
            # Extract detailed match data using improved method
            match_data = self._extract_comprehensive_match_data(puuid, match_ids)
            
            if not match_data or match_data['successful_matches'] == 0:
                print(f"❌ No valid match data extracted for: {riot_id}")
                return None
            
            print(f"✅ Successfully analyzed {match_data['successful_matches']} matches")
            print(f"🎮 Champion Pool: {len(match_data['champions'])} unique champions")
            
            # Perform comprehensive analysis
            analysis = self._perform_comprehensive_analysis(riot_id, match_data)
            
            return analysis
            
        except Exception as e:
            print(f"❌ Error analyzing player {riot_id}: {e}")
            return None
    
    def _extract_comprehensive_match_data(self, puuid: str, match_ids: List[str]) -> Dict:
        """Extract comprehensive data from all matches with proper aggregation"""
        
        champion_data = defaultdict(lambda: {
            'games': 0, 'wins': 0, 'kills': [], 'deaths': [], 'assists': [], 
            'cs': [], 'positions': [], 'match_ids': [], 'game_durations': []
        })
        
        position_data = defaultdict(int)
        match_details = []
        cs_per_minute_values = []
        game_length_data = []
        successful_matches = 0
        
        for i, match_id in enumerate(match_ids):
            try:
                # Rate limiting
                if i > 0:
                    time.sleep(1.2)
                
                match_detail = riot_service.get_match_details(match_id)
                if not match_detail:
                    continue
                
                # Find player data in match
                player_data = None
                for participant in match_detail["info"]["participants"]:
                    if participant["puuid"] == puuid:
                        player_data = participant
                        break
                
                if not player_data:
                    continue
                
                # Extract data
                champion = player_data["championName"]
                position = player_data["teamPosition"] or "Unknown"
                won = player_data["win"]
                kills = player_data["kills"]
                deaths = player_data["deaths"]
                assists = player_data["assists"]
                cs = player_data["totalMinionsKilled"] + player_data["neutralMinionsKilled"]
                game_duration = match_detail["info"]["gameDuration"] / 60  # Convert to minutes
                cs_per_min = cs / game_duration if game_duration > 0 else 0
                
                # Store champion data
                champ_data = champion_data[champion]
                champ_data['games'] += 1
                if won:
                    champ_data['wins'] += 1
                champ_data['kills'].append(kills)
                champ_data['deaths'].append(deaths)
                champ_data['assists'].append(assists)
                champ_data['cs'].append(cs)
                champ_data['positions'].append(position)
                champ_data['match_ids'].append(match_id)
                champ_data['game_durations'].append(game_duration)
                
                # Store position data
                position_data[position] += 1
                
                # Store overall stats
                cs_per_minute_values.append(cs_per_min)
                game_length_data.append({
                    'duration': game_duration,
                    'won': won
                })
                
                # Store match details for recent trend analysis
                match_details.append({
                    'match_id': match_id,
                    'champion': champion,
                    'position': position,
                    'won': won,
                    'kda': f"{kills}/{deaths}/{assists}",
                    'cs': cs,
                    'cs_per_min': cs_per_min,
                    'duration': game_duration
                })
                
                successful_matches += 1
                
            except Exception as e:
                print(f"❌ Error processing match {match_id}: {e}")
                continue
        
        return {
            'champions': dict(champion_data),
            'positions': dict(position_data),
            'match_details': match_details,
            'cs_per_minute': cs_per_minute_values,
            'game_lengths': game_length_data,
            'successful_matches': successful_matches
        }
    
    def _perform_comprehensive_analysis(self, riot_id: str, match_data: Dict) -> PlayerAnalysis:
        """Perform detailed analysis and generate insights"""
        
        # Analyze champion pool
        champion_insights = self._analyze_champion_pool_fixed(match_data['champions'])
        
        # Calculate role preferences
        primary_role, secondary_roles = self._analyze_role_preferences(match_data['positions'])
        
        # Calculate playstyle metrics
        playstyle_metrics = self._analyze_playstyle_fixed(champion_insights, match_data)
        
        # Performance analysis
        performance_analysis = self._analyze_performance_patterns_fixed(match_data)
        
        # Recent trends
        trend_analysis = self._analyze_recent_trends_fixed(match_data['match_details'], champion_insights)
        
        # Generate comprehensive text descriptions
        text_descriptions = self._generate_text_descriptions_fixed(
            riot_id, champion_insights, playstyle_metrics, performance_analysis, trend_analysis
        )
        
        return PlayerAnalysis(
            riot_id=riot_id,
            primary_role=primary_role,
            secondary_roles=secondary_roles,
            champion_pool_size=len(champion_insights),
            most_played_champions=champion_insights[:10],
            champion_diversity_score=playstyle_metrics['diversity_score'],
            one_trick_tendency=playstyle_metrics['one_trick_tendency'],
            aggressive_tendency=playstyle_metrics['aggressive_tendency'],
            scaling_preference=playstyle_metrics['scaling_preference'],
            mechanical_skill_level=playstyle_metrics['mechanical_skill'],
            meta_adaptation=playstyle_metrics['meta_adaptation'],
            pace_preference=playstyle_metrics['pace_preference'],
            cs_pattern=performance_analysis['cs_pattern'],
            average_cs_per_min=performance_analysis['avg_cs_per_min'],
            kda_consistency=performance_analysis['kda_consistency'],
            late_game_performance=performance_analysis['late_game_performance'],
            early_game_performance=performance_analysis['early_game_performance'],
            recent_champion_shifts=trend_analysis['champion_shifts'],
            performance_trend=trend_analysis['performance_trend'],
            meta_following=trend_analysis['meta_following'],
            comprehensive_description=text_descriptions['comprehensive'],
            playstyle_summary=text_descriptions['playstyle'],
            compatibility_traits=text_descriptions['compatibility']
        )
    
    def _analyze_champion_pool_fixed(self, champions_data: Dict) -> List[ChampionInsight]:
        """Analyze champion pool with proper data aggregation"""
        insights = []
        
        for champion, data in champions_data.items():
            if data['games'] == 0:
                continue
                
            win_rate = (data['wins'] / data['games']) * 100
            avg_kills = statistics.mean(data['kills']) if data['kills'] else 0
            avg_deaths = statistics.mean(data['deaths']) if data['deaths'] else 1
            avg_assists = statistics.mean(data['assists']) if data['assists'] else 0
            
            # Calculate average CS per minute for this champion
            avg_cs_per_min = 0
            if data['cs'] and data['game_durations']:
                cs_per_min_values = [cs / duration for cs, duration in zip(data['cs'], data['game_durations']) if duration > 0]
                avg_cs_per_min = statistics.mean(cs_per_min_values) if cs_per_min_values else 0
            
            avg_kda = f"{avg_kills:.1f}/{avg_deaths:.1f}/{avg_assists:.1f}"
            
            # Determine playstyle tags
            playstyle_tags = self._get_champion_playstyle_tags(champion)
            difficulty_tier = self._get_champion_difficulty(champion)
            meta_status = self._get_champion_meta_status(champion)
            
            # Count recent games (last 10 matches)
            recent_games = min(data['games'], 10)  # Simple approximation
            
            insights.append(ChampionInsight(
                name=champion,
                games_played=data['games'],
                win_rate=win_rate,
                avg_kda=avg_kda,
                avg_cs=avg_cs_per_min,
                recent_games=recent_games,
                playstyle_tags=playstyle_tags,
                difficulty_tier=difficulty_tier,
                meta_status=meta_status
            ))
        
        # Sort by games played
        return sorted(insights, key=lambda x: x.games_played, reverse=True)
    
    def _get_champion_playstyle_tags(self, champion: str) -> List[str]:
        """Get playstyle tags for a champion"""
        tags = []
        for category, champions in CHAMPION_DATA.items():
            if champion in champions:
                tags.append(category)
        return tags
    
    def _get_champion_difficulty(self, champion: str) -> str:
        """Get difficulty tier for champion"""
        if champion in CHAMPION_DATA['high_skill']:
            return "High"
        elif champion in CHAMPION_DATA['medium_skill']:
            return "Medium"
        elif champion in CHAMPION_DATA['low_skill']:
            return "Low"
        return "Medium"  # Default
    
    def _get_champion_meta_status(self, champion: str) -> str:
        """Get meta status for champion"""
        if champion in CHAMPION_DATA['meta_s_tier']:
            return "S-Tier"
        elif champion in CHAMPION_DATA['meta_a_tier']:
            return "A-Tier"
        elif champion in CHAMPION_DATA['niche_picks']:
            return "Niche"
        return "Meta"  # Default
    
    def _analyze_role_preferences(self, positions: Dict) -> Tuple[str, List[str]]:
        """Analyze role preferences"""
        if not positions:
            return "Unknown", []
        
        sorted_positions = sorted(positions.items(), key=lambda x: x[1], reverse=True)
        primary_role = sorted_positions[0][0]
        
        # Get secondary roles (played at least 20% as much as primary)
        primary_count = sorted_positions[0][1]
        secondary_roles = []
        for role, count in sorted_positions[1:]:
            if count >= primary_count * 0.2:
                secondary_roles.append(role)
        
        return primary_role, secondary_roles
    
    def _analyze_playstyle_fixed(self, champion_insights: List[ChampionInsight], match_data: Dict) -> Dict:
        """Analyze playstyle preferences with fixed calculations"""
        metrics = {}
        
        total_games = sum(insight.games_played for insight in champion_insights)
        if total_games == 0:
            return self._default_playstyle_metrics()
        
        # Champion diversity using Gini coefficient
        if len(champion_insights) > 0:
            games_list = [insight.games_played for insight in champion_insights]
            metrics['diversity_score'] = self._calculate_diversity_score(games_list)
            
            # One-trick tendency
            main_champ_games = champion_insights[0].games_played if champion_insights else 0
            metrics['one_trick_tendency'] = main_champ_games / total_games
        else:
            metrics['diversity_score'] = 0
            metrics['one_trick_tendency'] = 0
        
        # Playstyle analysis based on champion picks
        aggressive_games = sum(insight.games_played for insight in champion_insights 
                              if 'aggressive_early' in insight.playstyle_tags)
        scaling_games = sum(insight.games_played for insight in champion_insights 
                           if 'scaling_late' in insight.playstyle_tags)
        
        metrics['aggressive_tendency'] = aggressive_games / total_games
        metrics['scaling_preference'] = scaling_games / total_games
        
        # Mechanical skill preference
        high_skill_games = sum(insight.games_played for insight in champion_insights 
                              if insight.difficulty_tier == 'High')
        metrics['mechanical_skill'] = high_skill_games / total_games
        
        # Meta adaptation
        meta_games = sum(insight.games_played for insight in champion_insights 
                        if insight.meta_status in ['S-Tier', 'A-Tier'])
        metrics['meta_adaptation'] = meta_games / total_games
        
        # Pace preference
        fast_games = sum(insight.games_played for insight in champion_insights 
                        if 'fast_paced' in insight.playstyle_tags)
        slow_games = sum(insight.games_played for insight in champion_insights 
                        if 'slow_paced' in insight.playstyle_tags)
        
        if fast_games > slow_games * 1.5:
            metrics['pace_preference'] = "Fast-paced"
        elif slow_games > fast_games * 1.5:
            metrics['pace_preference'] = "Slow-paced"
        else:
            metrics['pace_preference'] = "Balanced"
        
        return metrics
    
    def _calculate_diversity_score(self, games_list: List[int]) -> float:
        """Calculate champion diversity using Gini coefficient (inverted)"""
        if not games_list or len(games_list) == 1:
            return 0.0
        
        sorted_games = sorted(games_list)
        n = len(sorted_games)
        total = sum(sorted_games)
        
        if total == 0:
            return 0.0
        
        # Calculate Gini coefficient
        gini = 0
        for i, games in enumerate(sorted_games):
            gini += (2 * i - n + 1) * games
        
        gini = gini / (n * total)
        
        # Return inverted (1 - gini) so higher score = more diverse
        return max(0, 1 - gini)
    
    def _analyze_performance_patterns_fixed(self, match_data: Dict) -> Dict:
        """Analyze performance patterns with proper calculations"""
        analysis = {}
        
        # CS analysis
        if match_data['cs_per_minute']:
            avg_cs = statistics.mean(match_data['cs_per_minute'])
            analysis['avg_cs_per_min'] = avg_cs
            
            if avg_cs >= 7:
                analysis['cs_pattern'] = "Excellent farmer"
            elif avg_cs >= 6:
                analysis['cs_pattern'] = "Good farmer"
            elif avg_cs >= 5:
                analysis['cs_pattern'] = "Average farmer"
            else:
                analysis['cs_pattern'] = "Focuses on other aspects"
        else:
            analysis['avg_cs_per_min'] = 0
            analysis['cs_pattern'] = "Unknown"
        
        # Game length performance
        if match_data['game_lengths']:
            early_games = [game['won'] for game in match_data['game_lengths'] if game['duration'] < 25]
            late_games = [game['won'] for game in match_data['game_lengths'] if game['duration'] > 35]
            
            analysis['early_game_performance'] = statistics.mean(early_games) if early_games else 0.5
            analysis['late_game_performance'] = statistics.mean(late_games) if late_games else 0.5
        else:
            analysis['early_game_performance'] = 0.5
            analysis['late_game_performance'] = 0.5
        
        # KDA consistency (simplified calculation)
        analysis['kda_consistency'] = 0.75  # This would need more complex calculation
        
        return analysis
    
    def _analyze_recent_trends_fixed(self, recent_matches: List[Dict], champion_insights: List[ChampionInsight]) -> Dict:
        """Analyze recent trends with improved logic"""
        analysis = {}
        
        if not recent_matches:
            return {'champion_shifts': [], 'performance_trend': 'Unknown', 'meta_following': 0.5}
        
        # Take last 10 matches for recent analysis
        recent_10 = recent_matches[:10]
        
        # Performance trend
        if recent_10:
            recent_wins = sum(1 for match in recent_10 if match['won'])
            recent_wr = recent_wins / len(recent_10)
            
            if recent_wr >= 0.6:
                analysis['performance_trend'] = "On a hot streak"
            elif recent_wr <= 0.4:
                analysis['performance_trend'] = "Struggling recently"
            else:
                analysis['performance_trend'] = "Consistent performance"
        else:
            analysis['performance_trend'] = "Unknown"
        
        # Champion shifts (simplified)
        recent_champions = [match['champion'] for match in recent_10]
        recent_champion_counts = Counter(recent_champions)
        
        champion_shifts = []
        for champ, count in recent_champion_counts.most_common(3):
            if count >= 2:  # If played 2+ times recently
                champion_shifts.append(f"Picking up {champ}")
        
        analysis['champion_shifts'] = champion_shifts
        
        # Meta following in recent games
        if recent_10:
            recent_meta_games = 0
            for match in recent_10:
                champ = match['champion']
                if champ in CHAMPION_DATA['meta_s_tier'] or champ in CHAMPION_DATA['meta_a_tier']:
                    recent_meta_games += 1
            
            analysis['meta_following'] = recent_meta_games / len(recent_10)
        else:
            analysis['meta_following'] = 0.5
        
        return analysis
    
    def _generate_text_descriptions_fixed(self, riot_id: str, champion_insights: List[ChampionInsight], 
                                         playstyle_metrics: Dict, performance_analysis: Dict, 
                                         trend_analysis: Dict) -> Dict:
        """Generate comprehensive text descriptions for vector similarity"""
        
        # Main champions summary
        main_champs = champion_insights[:3]
        champ_names = [c.name for c in main_champs]
        champ_summary = f"mains {', '.join(champ_names)}" if champ_names else "has varied champion pool"
        
        # Playstyle description
        playstyle_traits = []
        
        if playstyle_metrics['aggressive_tendency'] > 0.6:
            playstyle_traits.append("aggressive early game player")
        elif playstyle_metrics['scaling_preference'] > 0.6:
            playstyle_traits.append("scaling late game focused player")
        else:
            playstyle_traits.append("balanced playstyle player")
        
        if playstyle_metrics['mechanical_skill'] > 0.6:
            playstyle_traits.append("enjoys mechanically demanding champions")
        elif playstyle_metrics['mechanical_skill'] < 0.3:
            playstyle_traits.append("prefers straightforward champions")
        
        if playstyle_metrics['one_trick_tendency'] > 0.7:
            playstyle_traits.append("one-trick specialist")
        elif playstyle_metrics['diversity_score'] > 0.7:
            playstyle_traits.append("champion pool versatile player")
        
        if playstyle_metrics['meta_adaptation'] > 0.7:
            playstyle_traits.append("follows meta closely")
        elif playstyle_metrics['meta_adaptation'] < 0.3:
            playstyle_traits.append("plays off-meta picks")
        
        # Performance traits
        performance_traits = []
        
        cs_pattern = performance_analysis['cs_pattern']
        if "Excellent" in cs_pattern:
            performance_traits.append("excellent at farming and CS")
        elif "Good" in cs_pattern:
            performance_traits.append("solid CS and farming")
        elif "Average" in cs_pattern:
            performance_traits.append("average farming focus")
        else:
            performance_traits.append("focuses on macro and teamfighting over farming")
        
        early_perf = performance_analysis['early_game_performance']
        late_perf = performance_analysis['late_game_performance']
        
        if early_perf > late_perf + 0.1:
            performance_traits.append("stronger in early game")
        elif late_perf > early_perf + 0.1:
            performance_traits.append("performs better in late game")
        else:
            performance_traits.append("consistent throughout game phases")
        
        # Recent trends
        trend_traits = []
        if trend_analysis['performance_trend'] == "On a hot streak":
            trend_traits.append("currently performing well")
        elif trend_analysis['performance_trend'] == "Struggling recently":
            trend_traits.append("working through some recent struggles")
        
        for shift in trend_analysis['champion_shifts']:
            trend_traits.append(shift.lower())
        
        # Comprehensive description
        comprehensive = f"{riot_id} is a {playstyle_metrics['pace_preference'].lower()} {champ_summary}. "
        comprehensive += f"They are an {', '.join(playstyle_traits[:3])} who is {', '.join(performance_traits[:2])}. "
        if trend_traits:
            comprehensive += f"Recently, they have been {', '.join(trend_traits[:2])}."
        
        # Playstyle summary
        playstyle = f"Playstyle: {playstyle_metrics['pace_preference']} {', '.join(playstyle_traits)}. "
        playstyle += f"Performance: {', '.join(performance_traits)}."
        
        # Compatibility traits
        compatibility = f"Compatible with players who enjoy {playstyle_metrics['pace_preference'].lower()} games, "
        if playstyle_metrics['aggressive_tendency'] > 0.5:
            compatibility += "early game focused strategies, "
        if playstyle_metrics['scaling_preference'] > 0.5:
            compatibility += "late game scaling compositions, "
        compatibility += f"and {performance_analysis['cs_pattern'].lower()} teammates."
        
        return {
            'comprehensive': comprehensive,
            'playstyle': playstyle,
            'compatibility': compatibility
        }
    
    def _default_playstyle_metrics(self) -> Dict:
        """Return default metrics when no data available"""
        return {
            'diversity_score': 0.5,
            'one_trick_tendency': 0.5,
            'aggressive_tendency': 0.5,
            'scaling_preference': 0.5,
            'mechanical_skill': 0.5,
            'meta_adaptation': 0.5,
            'pace_preference': "Balanced"
        }

def test_fixed_analysis():
    """Test the fixed analysis system"""
    analyzer = FixedPlayerAnalyzer()
    
    riot_id = "RareChubber#NA1"
    print(f"🚀 TESTING FIXED ANALYSIS FOR {riot_id}")
    print("=" * 80)
    
    analysis = analyzer.analyze_player_comprehensive(riot_id, num_matches=20)
    
    if analysis:
        print(f"\n📊 FIXED ANALYSIS RESULTS:")
        print("=" * 80)
        
        print(f"🎯 Role: {analysis.primary_role}")
        if analysis.secondary_roles:
            print(f"   Secondary: {', '.join(analysis.secondary_roles)}")
        
        print(f"\n⭐ Champion Pool ({analysis.champion_pool_size} champions):")
        for i, champ in enumerate(analysis.most_played_champions[:5], 1):
            print(f"   {i}. {champ.name}: {champ.games_played} games ({champ.win_rate:.1f}% WR)")
            print(f"      Tags: {', '.join(champ.playstyle_tags[:3])}")
        
        print(f"\n🎮 Playstyle Metrics:")
        print(f"   Champion Diversity: {analysis.champion_diversity_score:.2f}")
        print(f"   One-trick Tendency: {analysis.one_trick_tendency:.2f}")
        print(f"   Aggressive Tendency: {analysis.aggressive_tendency:.2f}")
        print(f"   Scaling Preference: {analysis.scaling_preference:.2f}")
        print(f"   Mechanical Skill Level: {analysis.mechanical_skill_level:.2f}")
        print(f"   Meta Adaptation: {analysis.meta_adaptation:.2f}")
        print(f"   Pace Preference: {analysis.pace_preference}")
        
        print(f"\n📈 Performance:")
        print(f"   CS Pattern: {analysis.cs_pattern}")
        print(f"   Average CS/min: {analysis.average_cs_per_min:.1f}")
        print(f"   Early Game Performance: {analysis.early_game_performance:.2f}")
        print(f"   Late Game Performance: {analysis.late_game_performance:.2f}")
        
        print(f"\n🔄 Recent Trends:")
        print(f"   Performance Trend: {analysis.performance_trend}")
        print(f"   Meta Following: {analysis.meta_following:.2f}")
        if analysis.recent_champion_shifts:
            print(f"   Champion Shifts: {', '.join(analysis.recent_champion_shifts)}")
        
        print(f"\n📝 IMPROVED TEXT DESCRIPTIONS:")
        print("=" * 80)
        print(f"Comprehensive: {analysis.comprehensive_description}")
        print(f"\nPlaystyle: {analysis.playstyle_summary}")
        print(f"\nCompatibility: {analysis.compatibility_traits}")
        
        # Save analysis
        output_file = f"fixed_player_analysis_{riot_id.replace('#', '_')}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(asdict(analysis), f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Fixed analysis saved to: {output_file}")
        
    else:
        print("❌ Fixed analysis failed")

if __name__ == "__main__":
    test_fixed_analysis() 