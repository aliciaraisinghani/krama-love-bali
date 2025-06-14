import os
import requests
from dotenv import load_dotenv
from typing import List, Dict, Optional
from models import PlayerStats

load_dotenv()

RIOT_API_KEY = os.getenv("RIOT_API_KEY")
BASE_URL = "https://americas.api.riotgames.com"

def get_puuid(riot_id: str):
    if not RIOT_API_KEY:
        raise ValueError("RIOT_API_KEY not found in .env file")

    try:
        game_name, tag_line = riot_id.split('#')
    except ValueError:
        return None

    url = f"{BASE_URL}/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}"
    headers = {
        "X-Riot-Token": RIOT_API_KEY
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json().get("puuid")
    else:
        print(f"Error fetching puuid for {riot_id}: {response.status_code} {response.text}")
        return None

def get_recent_matches(puuid: str, count: int = 20) -> List[str]:
    """Get recent match IDs for a player"""
    if not RIOT_API_KEY:
        raise ValueError("RIOT_API_KEY not found in .env file")
    
    url = f"{BASE_URL}/lol/match/v5/matches/by-puuid/{puuid}/ids"
    headers = {"X-Riot-Token": RIOT_API_KEY}
    params = {"count": count}
    
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error fetching matches for puuid {puuid}: {response.status_code} {response.text}")
        return []

def get_match_details(match_id: str) -> Optional[Dict]:
    """Get detailed match information"""
    if not RIOT_API_KEY:
        raise ValueError("RIOT_API_KEY not found in .env file")
    
    url = f"{BASE_URL}/lol/match/v5/matches/{match_id}"
    headers = {"X-Riot-Token": RIOT_API_KEY}
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error fetching match details for {match_id}: {response.status_code} {response.text}")
        return None

def analyze_player_stats(puuid: str) -> PlayerStats:
    """Analyze a player's recent performance and return PlayerStats"""
    match_ids = get_recent_matches(puuid, 20)
    
    if not match_ids:
        return PlayerStats()
    
    total_cs = 0
    total_game_duration = 0
    champion_counts = {}
    lane_counts = {}
    valid_games = 0
    
    for match_id in match_ids:
        match_data = get_match_details(match_id)
        if not match_data:
            continue
            
        # Find the player's data in this match
        player_data = None
        for participant in match_data["info"]["participants"]:
            if participant["puuid"] == puuid:
                player_data = participant
                break
        
        if not player_data:
            continue
            
        valid_games += 1
        
        # Calculate CS per minute
        cs = player_data["totalMinionsKilled"] + player_data["neutralMinionsKilled"]
        game_duration_minutes = match_data["info"]["gameDuration"] / 60
        
        total_cs += cs
        total_game_duration += game_duration_minutes
        
        # Track champion usage
        champion = player_data["championName"]
        champion_counts[champion] = champion_counts.get(champion, 0) + 1
        
        # Track lane preference
        lane = player_data["teamPosition"]
        if lane:  # Some games might not have lane data
            lane_counts[lane] = lane_counts.get(lane, 0) + 1
    
    # Calculate averages and most played
    avg_cs_per_minute = (total_cs / total_game_duration) if total_game_duration > 0 else 0
    
    # Get top 3 most played champions
    most_played_champions = sorted(champion_counts.items(), key=lambda x: x[1], reverse=True)[:3]
    most_played_champions = [champ[0] for champ in most_played_champions]
    
    # Get primary lane
    primary_lane = max(lane_counts.items(), key=lambda x: x[1])[0] if lane_counts else None
    
    return PlayerStats(
        avg_cs_per_minute=round(avg_cs_per_minute, 2),
        most_played_champions=most_played_champions,
        primary_lane=primary_lane
    ) 