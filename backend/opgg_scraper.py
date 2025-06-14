import requests
from bs4 import BeautifulSoup
import json
import re
import time
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from urllib.parse import quote
import random

@dataclass
class RankInfo:
    tier: str
    division: str
    lp: int
    wins: int
    losses: int
    win_rate: float
    queue_type: str

@dataclass
class ChampionMastery:
    champion: str
    mastery_level: int
    mastery_points: int
    
@dataclass
class RecentMatch:
    champion: str
    result: str  # "Win" or "Loss"
    kda: str
    cs: int
    game_length: str
    game_mode: str
    timestamp: str

@dataclass
class ChampionStats:
    champion: str
    games_played: int
    win_rate: float
    avg_kda: str
    avg_cs: float

@dataclass
class OpggProfile:
    summoner_name: str
    level: int
    profile_icon: str
    ranks: List[RankInfo]
    champion_masteries: List[ChampionMastery]
    recent_matches: List[RecentMatch]
    champion_stats: List[ChampionStats]
    most_played_positions: List[str]
    season_stats: Dict[str, Any]
    additional_data: Dict[str, Any]

class OpggScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
        
    def scrape_profile(self, riot_id: str, region: str = "na") -> Optional[OpggProfile]:
        """
        Scrape comprehensive profile data from OP.GG
        
        Args:
            riot_id: Player's Riot ID (e.g., "RareChubber#NA1")
            region: Region code (default: "na")
        """
        try:
            # Convert riot_id to OP.GG format
            if '#' in riot_id:
                name_part, tag_part = riot_id.split('#')
            else:
                name_part = riot_id
                tag_part = ""
            
            # URL encode the name for safety
            encoded_name = quote(name_part)
            url = f"https://op.gg/lol/summoners/{region}/{encoded_name}-{tag_part}"
            
            print(f"🔍 Scraping OP.GG profile: {url}")
            
            # Add random delay to be respectful
            time.sleep(random.uniform(1, 3))
            
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Save the raw HTML for debugging
            with open(f"debug_opgg_{riot_id.replace('#', '_')}.html", 'w', encoding='utf-8') as f:
                f.write(str(soup.prettify()))
            print(f"🔍 Raw HTML saved for debugging")
            
            # Extract all available data with comprehensive methods
            profile_data = OpggProfile(
                summoner_name=self._extract_summoner_name(soup),
                level=self._extract_level(soup),
                profile_icon=self._extract_profile_icon(soup),
                ranks=self._extract_ranks(soup),
                champion_masteries=self._extract_champion_masteries(soup),
                recent_matches=self._extract_recent_matches(soup),
                champion_stats=self._extract_champion_stats(soup),
                most_played_positions=self._extract_positions(soup),
                season_stats=self._extract_season_stats(soup),
                additional_data=self._extract_everything_else(soup)
            )
            
            return profile_data
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Request error: {e}")
            return None
        except Exception as e:
            print(f"❌ Scraping error: {e}")
            return None
    
    def _extract_summoner_name(self, soup: BeautifulSoup) -> str:
        """Extract summoner name"""
        try:
            # Try multiple selectors
            selectors = [
                'h1.summoner-name',
                '.summoner-name',
                'h1[data-testid="summoner-name"]',
                '.profile-header h1',
                'h1'
            ]
            
            for selector in selectors:
                element = soup.select_one(selector)
                if element:
                    return element.get_text(strip=True)
            
            return "Unknown"
        except:
            return "Unknown"
    
    def _extract_level(self, soup: BeautifulSoup) -> int:
        """Extract summoner level"""
        try:
            # Look for level indicators
            level_patterns = [
                r'Level\s*(\d+)',
                r'Lv\.\s*(\d+)',
                r'level-(\d+)',
                r'"level":\s*(\d+)'
            ]
            
            text_content = soup.get_text()
            for pattern in level_patterns:
                match = re.search(pattern, text_content, re.IGNORECASE)
                if match:
                    return int(match.group(1))
            
            return 0
        except:
            return 0
    
    def _extract_profile_icon(self, soup: BeautifulSoup) -> str:
        """Extract profile icon URL"""
        try:
            # Look for profile icon images
            selectors = [
                '.profile-icon img',
                '.summoner-icon img',
                'img[alt*="profile"]',
                'img[src*="profileicon"]'
            ]
            
            for selector in selectors:
                element = soup.select_one(selector)
                if element and element.get('src'):
                    return element['src']
            
            return ""
        except:
            return ""
    
    def _extract_ranks(self, soup: BeautifulSoup) -> List[RankInfo]:
        """Extract rank information"""
        ranks = []
        try:
            # Look for rank containers
            rank_containers = soup.select('.rank-info, .tier-info, .ranked-stats')
            
            for container in rank_containers:
                rank_text = container.get_text(strip=True)
                
                # Extract tier and division
                tier_match = re.search(r'(iron|bronze|silver|gold|platinum|diamond|master|grandmaster|challenger)\s*(\d+)?', rank_text, re.IGNORECASE)
                if tier_match:
                    tier = tier_match.group(1).capitalize()
                    division = tier_match.group(2) if tier_match.group(2) else ""
                    
                    # Extract LP
                    lp_match = re.search(r'(\d+)\s*LP', rank_text)
                    lp = int(lp_match.group(1)) if lp_match else 0
                    
                    # Extract wins/losses
                    wins_match = re.search(r'(\d+)W', rank_text)
                    losses_match = re.search(r'(\d+)L', rank_text)
                    wins = int(wins_match.group(1)) if wins_match else 0
                    losses = int(losses_match.group(1)) if losses_match else 0
                    
                    # Calculate win rate
                    total_games = wins + losses
                    win_rate = (wins / total_games * 100) if total_games > 0 else 0
                    
                    # Determine queue type
                    queue_type = "Unknown"
                    if "solo" in rank_text.lower() or "duo" in rank_text.lower():
                        queue_type = "Ranked Solo/Duo"
                    elif "flex" in rank_text.lower():
                        queue_type = "Ranked Flex"
                    
                    ranks.append(RankInfo(
                        tier=tier,
                        division=division,
                        lp=lp,
                        wins=wins,
                        losses=losses,
                        win_rate=round(win_rate, 1),
                        queue_type=queue_type
                    ))
            
        except Exception as e:
            print(f"Error extracting ranks: {e}")
        
        return ranks
    
    def _extract_champion_masteries(self, soup: BeautifulSoup) -> List[ChampionMastery]:
        """Extract champion mastery data"""
        masteries = []
        try:
            # Look for mastery sections
            mastery_containers = soup.select('.mastery-item, .champion-mastery, .most-played-champion')
            
            for container in masteries[:10]:  # Limit to top 10
                champ_name = self._extract_text_by_selectors(container, [
                    '.champion-name',
                    '.champ-name',
                    'img[alt]'
                ])
                
                if not champ_name and container.select_one('img[alt]'):
                    champ_name = container.select_one('img[alt]')['alt']
                
                # Extract mastery level and points
                mastery_text = container.get_text()
                level_match = re.search(r'mastery.{0,10}(\d+)', mastery_text, re.IGNORECASE)
                points_match = re.search(r'([\d,]+)\s*pts', mastery_text, re.IGNORECASE)
                
                if champ_name:
                    masteries.append(ChampionMastery(
                        champion=champ_name,
                        mastery_level=int(level_match.group(1)) if level_match else 0,
                        mastery_points=int(points_match.group(1).replace(',', '')) if points_match else 0
                    ))
                    
        except Exception as e:
            print(f"Error extracting masteries: {e}")
        
        return masteries
    
    def _extract_recent_matches(self, soup: BeautifulSoup) -> List[RecentMatch]:
        """Extract recent match data"""
        matches = []
        try:
            # Look for match containers
            match_containers = soup.select('.match-item, .game-item, .match-history-item')
            
            for container in match_containers[:20]:  # Limit to 20 recent matches
                match_text = container.get_text()
                
                # Extract champion
                champ_img = container.select_one('img[alt]')
                champion = champ_img['alt'] if champ_img else "Unknown"
                
                # Extract result
                result = "Unknown"
                if "victory" in match_text.lower() or "win" in match_text.lower():
                    result = "Win"
                elif "defeat" in match_text.lower() or "loss" in match_text.lower():
                    result = "Loss"
                
                # Extract KDA
                kda_match = re.search(r'(\d+)/(\d+)/(\d+)', match_text)
                kda = kda_match.group(0) if kda_match else "0/0/0"
                
                # Extract CS
                cs_match = re.search(r'(\d+)\s*CS', match_text, re.IGNORECASE)
                cs = int(cs_match.group(1)) if cs_match else 0
                
                # Extract game length
                time_match = re.search(r'(\d+)m\s*(\d+)?s?', match_text)
                game_length = time_match.group(0) if time_match else "Unknown"
                
                matches.append(RecentMatch(
                    champion=champion,
                    result=result,
                    kda=kda,
                    cs=cs,
                    game_length=game_length,
                    game_mode="Unknown",  # Would need more specific parsing
                    timestamp="Unknown"   # Would need more specific parsing
                ))
                
        except Exception as e:
            print(f"Error extracting matches: {e}")
        
        return matches
    
    def _extract_champion_stats(self, soup: BeautifulSoup) -> List[ChampionStats]:
        """Extract champion performance statistics"""
        stats = []
        try:
            # Look for champion stats tables/containers
            stat_containers = soup.select('.champion-stats-item, .champion-performance, .stats-row')
            
            for container in stat_containers[:10]:  # Top 10 champions
                text = container.get_text()
                
                # Extract champion name
                champ_img = container.select_one('img[alt]')
                champion = champ_img['alt'] if champ_img else "Unknown"
                
                # Extract games played
                games_match = re.search(r'(\d+)\s*games?', text, re.IGNORECASE)
                games = int(games_match.group(1)) if games_match else 0
                
                # Extract win rate
                wr_match = re.search(r'(\d+)%', text)
                win_rate = float(wr_match.group(1)) if wr_match else 0.0
                
                # Extract average KDA
                kda_match = re.search(r'(\d+\.?\d*):(\d+\.?\d*):(\d+\.?\d*)', text)
                avg_kda = f"{kda_match.group(1)}:{kda_match.group(2)}:{kda_match.group(3)}" if kda_match else "0:0:0"
                
                # Extract average CS
                cs_match = re.search(r'(\d+\.?\d*)\s*CS', text, re.IGNORECASE)
                avg_cs = float(cs_match.group(1)) if cs_match else 0.0
                
                if champion != "Unknown":
                    stats.append(ChampionStats(
                        champion=champion,
                        games_played=games,
                        win_rate=win_rate,
                        avg_kda=avg_kda,
                        avg_cs=avg_cs
                    ))
                    
        except Exception as e:
            print(f"Error extracting champion stats: {e}")
        
        return stats
    
    def _extract_positions(self, soup: BeautifulSoup) -> List[str]:
        """Extract most played positions/roles"""
        positions = []
        try:
            text_content = soup.get_text().lower()
            
            # Define position keywords
            position_keywords = {
                'top': ['top', 'toplane'],
                'jungle': ['jungle', 'jg', 'jungler'],
                'mid': ['mid', 'middle', 'midlane'],
                'adc': ['adc', 'bot', 'bottom', 'carry'],
                'support': ['support', 'supp', 'sp']
            }
            
            # Count mentions of each position
            position_counts = {}
            for position, keywords in position_keywords.items():
                count = sum(text_content.count(keyword) for keyword in keywords)
                if count > 0:
                    position_counts[position] = count
            
            # Sort by frequency
            positions = sorted(position_counts.keys(), key=lambda x: position_counts[x], reverse=True)
            
        except Exception as e:
            print(f"Error extracting positions: {e}")
        
        return positions[:3]  # Top 3 positions
    
    def _extract_season_stats(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract season-specific statistics"""
        season_stats = {}
        try:
            text_content = soup.get_text()
            
            # Extract various season stats
            patterns = {
                'total_games': r'(\d+)\s*total\s*games',
                'wins': r'(\d+)W',
                'losses': r'(\d+)L',
                'win_rate': r'(\d+)%\s*win\s*rate',
                'avg_kill': r'(\d+\.?\d*)\s*avg\s*kills?',
                'avg_death': r'(\d+\.?\d*)\s*avg\s*deaths?',
                'avg_assist': r'(\d+\.?\d*)\s*avg\s*assists?'
            }
            
            for key, pattern in patterns.items():
                match = re.search(pattern, text_content, re.IGNORECASE)
                if match:
                    try:
                        season_stats[key] = float(match.group(1))
                    except:
                        season_stats[key] = match.group(1)
                        
        except Exception as e:
            print(f"Error extracting season stats: {e}")
        
        return season_stats
    
    def _extract_everything_else(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract EVERYTHING possible from the page"""
        data = {}
        
        try:
            # 1. Extract ALL script tags and try to find JSON data
            print("🔍 Extracting script data...")
            scripts = soup.find_all('script')
            script_data = []
            for i, script in enumerate(scripts):
                if script.string:
                    script_content = script.string.strip()
                    script_data.append({
                        'index': i,
                        'content_preview': script_content[:200],
                        'full_content': script_content
                    })
                    
                    # Try to extract any JSON-like structures
                    json_patterns = [
                        r'window\.__INITIAL_STATE__\s*=\s*({.*?});',
                        r'window\.__NUXT__\s*=\s*({.*?});',
                        r'window\._OP_GG_DATA\s*=\s*({.*?});',
                        r'"summoner":\s*({.*?})',
                        r'"player":\s*({.*?})',
                        r'"matches":\s*(\[.*?\])',
                        r'"stats":\s*({.*?})',
                        r'"champions":\s*(\[.*?\])',
                        r'"tiers":\s*(\[.*?\])',
                    ]
                    
                    for pattern in json_patterns:
                        matches = re.findall(pattern, script_content, re.DOTALL)
                        for match in matches:
                            try:
                                parsed = json.loads(match)
                                data[f'script_{i}_json'] = parsed
                            except:
                                continue
            
            data['all_scripts'] = script_data
            
            # 2. Extract ALL meta tags
            print("🔍 Extracting meta data...")
            meta_data = {}
            for meta in soup.find_all('meta'):
                attrs = dict(meta.attrs)
                if attrs:
                    key = attrs.get('name') or attrs.get('property') or attrs.get('http-equiv') or 'unknown'
                    meta_data[key] = attrs
            data['meta_tags'] = meta_data
            
            # 3. Extract ALL text content by sections
            print("🔍 Extracting text content...")
            text_sections = {}
            
            # Find all divs with classes that might contain data
            for div in soup.find_all('div', class_=True):
                classes = ' '.join(div.get('class', []))
                if any(keyword in classes.lower() for keyword in ['rank', 'tier', 'champion', 'match', 'stats', 'game', 'summoner', 'profile']):
                    text_sections[classes] = div.get_text(strip=True)
            
            data['text_sections'] = text_sections
            
            # 4. Extract ALL tables
            print("🔍 Extracting table data...")
            tables = []
            for table in soup.find_all('table'):
                table_data = []
                for row in table.find_all('tr'):
                    row_data = [cell.get_text(strip=True) for cell in row.find_all(['td', 'th'])]
                    if row_data:
                        table_data.append(row_data)
                if table_data:
                    tables.append(table_data)
            data['tables'] = tables
            
            # 5. Extract ALL images with their alt text and src
            print("🔍 Extracting image data...")
            images = []
            for img in soup.find_all('img'):
                img_data = {
                    'src': img.get('src', ''),
                    'alt': img.get('alt', ''),
                    'title': img.get('title', ''),
                    'class': ' '.join(img.get('class', [])),
                    'parent_class': ' '.join(img.parent.get('class', []) if img.parent else [])
                }
                images.append(img_data)
            data['images'] = images
            
            # 6. Extract ALL links
            print("🔍 Extracting link data...")
            links = []
            for link in soup.find_all('a'):
                link_data = {
                    'href': link.get('href', ''),
                    'text': link.get_text(strip=True),
                    'class': ' '.join(link.get('class', [])),
                    'title': link.get('title', '')
                }
                links.append(link_data)
            data['links'] = links
            
            # 7. Extract data attributes from ALL elements
            print("🔍 Extracting data attributes...")
            data_attributes = {}
            for element in soup.find_all(attrs=lambda x: x and any(k.startswith('data-') for k in x.keys())):
                element_data = {}
                for attr, value in element.attrs.items():
                    if attr.startswith('data-'):
                        element_data[attr] = value
                if element_data:
                    tag_info = f"{element.name}_{element.get('class', [''])[0] if element.get('class') else 'no_class'}"
                    data_attributes[tag_info] = element_data
            data['data_attributes'] = data_attributes
            
            # 8. Extract specific OP.GG sections by common patterns
            print("🔍 Extracting OP.GG specific sections...")
            opgg_sections = {}
            
            # Look for common OP.GG CSS selectors
            selectors = [
                ('.summoner-name', 'summoner_name'),
                ('.summoner-level', 'summoner_level'), 
                ('.tier', 'tier_info'),
                ('.rank', 'rank_info'),
                ('.champion-name', 'champion_names'),
                ('.match-item', 'match_items'),
                ('.game-item', 'game_items'),
                ('.kda', 'kda_info'),
                ('.cs', 'cs_info'),
                ('.win-rate', 'win_rates'),
                ('.mastery', 'mastery_info'),
                ('[class*="champion"]', 'champion_elements'),
                ('[class*="match"]', 'match_elements'),
                ('[class*="rank"]', 'rank_elements'),
                ('[class*="tier"]', 'tier_elements'),
                ('[class*="stats"]', 'stats_elements'),
                ('[class*="game"]', 'game_elements'),
            ]
            
            for selector, key in selectors:
                elements = soup.select(selector)
                if elements:
                    opgg_sections[key] = [elem.get_text(strip=True) for elem in elements]
            
            data['opgg_sections'] = opgg_sections
            
            # 9. Extract ALL CSS classes used on the page
            print("🔍 Extracting CSS classes...")
            all_classes = set()
            for element in soup.find_all(class_=True):
                all_classes.update(element.get('class', []))
            data['all_css_classes'] = sorted(list(all_classes))
            
            # 10. Page structure analysis
            print("🔍 Analyzing page structure...")
            structure = {}
            structure['title'] = soup.title.string if soup.title else ""
            structure['total_elements'] = len(soup.find_all())
            structure['total_divs'] = len(soup.find_all('div'))
            structure['total_scripts'] = len(soup.find_all('script'))
            structure['total_images'] = len(soup.find_all('img'))
            structure['total_links'] = len(soup.find_all('a'))
            structure['body_text_length'] = len(soup.get_text())
            
            data['page_structure'] = structure
            
            print(f"✅ Extracted {len(data)} major data categories")
            
        except Exception as e:
            print(f"❌ Error in comprehensive extraction: {e}")
            data['extraction_error'] = str(e)
        
        return data
    
    def _extract_text_by_selectors(self, container, selectors: List[str]) -> str:
        """Helper method to extract text using multiple selectors"""
        for selector in selectors:
            element = container.select_one(selector)
            if element:
                return element.get_text(strip=True)
        return ""

def main():
    """Test the comprehensive scraper with RareChubber's profile"""
    scraper = OpggScraper()
    
    # Test with the provided account
    riot_id = "RareChubber#NA1"
    print(f"🚀 COMPREHENSIVE OP.GG SCRAPER for {riot_id}")
    print("=" * 80)
    
    profile = scraper.scrape_profile(riot_id)
    
    if profile:
        # Convert to dict for JSON serialization
        profile_dict = asdict(profile)
        
        # Pretty print the results
        print(f"\n📊 COMPREHENSIVE PROFILE DATA FOR {profile.summoner_name}")
        print("=" * 80)
        
        print(f"🎯 Basic Info:")
        print(f"   Level: {profile.level}")
        print(f"   Profile Icon: {profile.profile_icon}")
        
        if profile.ranks:
            print(f"\n🏆 Ranks:")
            for rank in profile.ranks:
                print(f"   {rank.queue_type}: {rank.tier} {rank.division} ({rank.lp} LP)")
                print(f"      W/L: {rank.wins}W {rank.losses}L ({rank.win_rate}%)")
        else:
            print(f"\n🏆 Ranks: No rank data found")
        
        if profile.champion_masteries:
            print(f"\n⭐ Champion Masteries (Top 5):")
            for mastery in profile.champion_masteries[:5]:
                print(f"   {mastery.champion}: Level {mastery.mastery_level} ({mastery.mastery_points:,} pts)")
        else:
            print(f"\n⭐ Champion Masteries: No mastery data found")
        
        if profile.recent_matches:
            print(f"\n🎮 Recent Matches (Last 5):")
            for match in profile.recent_matches[:5]:
                print(f"   {match.champion}: {match.result} | KDA: {match.kda} | CS: {match.cs}")
        else:
            print(f"\n🎮 Recent Matches: No match data found")
        
        if profile.champion_stats:
            print(f"\n📈 Champion Stats (Top 3):")
            for stat in profile.champion_stats[:3]:
                print(f"   {stat.champion}: {stat.games_played} games, {stat.win_rate}% WR, {stat.avg_kda} KDA")
        else:
            print(f"\n📈 Champion Stats: No champion stats found")
        
        if profile.most_played_positions:
            print(f"\n🎯 Most Played Positions:")
            for i, pos in enumerate(profile.most_played_positions, 1):
                print(f"   {i}. {pos.upper()}")
        else:
            print(f"\n🎯 Most Played Positions: No position data found")
        
        if profile.season_stats:
            print(f"\n📊 Season Stats:")
            for key, value in profile.season_stats.items():
                print(f"   {key.replace('_', ' ').title()}: {value}")
        else:
            print(f"\n📊 Season Stats: No season stats found")
        
        # Show comprehensive additional data summary
        additional = profile.additional_data
        print(f"\n🔍 COMPREHENSIVE DATA EXTRACTION SUMMARY:")
        print(f"   📜 Script tags found: {len(additional.get('all_scripts', []))}")
        print(f"   🏷️  Meta tags found: {len(additional.get('meta_tags', {}))}")
        print(f"   📝 Text sections found: {len(additional.get('text_sections', {}))}")
        print(f"   📊 Tables found: {len(additional.get('tables', []))}")
        print(f"   🖼️  Images found: {len(additional.get('images', []))}")
        print(f"   🔗 Links found: {len(additional.get('links', []))}")
        print(f"   📋 Data attributes found: {len(additional.get('data_attributes', {}))}")
        print(f"   🎮 OP.GG sections found: {len(additional.get('opgg_sections', {}))}")
        print(f"   🎨 CSS classes found: {len(additional.get('all_css_classes', []))}")
        
        # Show some interesting findings
        if additional.get('opgg_sections'):
            print(f"\n🎮 OP.GG SECTIONS DETECTED:")
            for key, values in additional['opgg_sections'].items():
                if values and len(values) > 0:
                    print(f"   {key}: {len(values)} items")
                    if len(values) <= 5:
                        for item in values:
                            if item and len(item) < 100:
                                print(f"      - {item}")
                    else:
                        print(f"      - {values[0]} (and {len(values)-1} more)")
        
        if additional.get('all_css_classes'):
            relevant_classes = [cls for cls in additional['all_css_classes'] 
                              if any(keyword in cls.lower() for keyword in 
                                   ['rank', 'tier', 'champion', 'match', 'stats', 'summoner', 'level', 'game', 'kda', 'cs'])]
            if relevant_classes:
                print(f"\n🎨 RELEVANT CSS CLASSES:")
                for cls in relevant_classes[:20]:  # Show first 20
                    print(f"   - {cls}")
                if len(relevant_classes) > 20:
                    print(f"   ... and {len(relevant_classes) - 20} more")
        
        if additional.get('images'):
            champion_images = [img for img in additional['images'] 
                             if img['alt'] and any(keyword in img['alt'].lower() for keyword in ['champion', 'summoner'])]
            if champion_images:
                print(f"\n🖼️  CHAMPION/SUMMONER IMAGES:")
                for img in champion_images[:10]:
                    print(f"   - {img['alt']}: {img['src'][:100]}...")
        
        # Save comprehensive data
        output_file = f"opgg_COMPREHENSIVE_{riot_id.replace('#', '_')}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(profile_dict, f, indent=2, ensure_ascii=False)
        
        # Save a readable summary
        summary_file = f"opgg_SUMMARY_{riot_id.replace('#', '_')}.txt"
        with open(summary_file, 'w', encoding='utf-8') as f:
            f.write(f"OP.GG Comprehensive Data Summary for {riot_id}\n")
            f.write("=" * 60 + "\n\n")
            
            f.write("BASIC INFO:\n")
            f.write(f"  Summoner: {profile.summoner_name}\n")
            f.write(f"  Level: {profile.level}\n")
            f.write(f"  Icon: {profile.profile_icon}\n\n")
            
            if additional.get('page_structure'):
                f.write("PAGE STRUCTURE:\n")
                for key, value in additional['page_structure'].items():
                    f.write(f"  {key}: {value}\n")
                f.write("\n")
            
            if additional.get('opgg_sections'):
                f.write("OP.GG SECTIONS FOUND:\n")
                for key, values in additional['opgg_sections'].items():
                    f.write(f"  {key}: {len(values)} items\n")
                    for value in values[:3]:  # Show first 3
                        if value and len(value) < 200:
                            f.write(f"    - {value}\n")
                f.write("\n")
            
            if additional.get('all_css_classes'):
                f.write("ALL CSS CLASSES:\n")
                for cls in sorted(additional['all_css_classes']):
                    f.write(f"  - {cls}\n")
        
        print(f"\n💾 FILES CREATED:")
        print(f"   📄 Comprehensive data: {output_file}")
        print(f"   📋 Readable summary: {summary_file}")
        print(f"   🔍 Raw HTML: debug_opgg_{riot_id.replace('#', '_')}.html")
        print(f"\n📊 TOTAL DATA CATEGORIES: {len(profile_dict)}")
        print(f"📈 TOTAL ITEMS EXTRACTED: {sum(len(v) if isinstance(v, (list, dict)) else 1 for v in profile_dict.values())}")
        
    else:
        print("❌ Failed to scrape profile data")

if __name__ == "__main__":
    main() 