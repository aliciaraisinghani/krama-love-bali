from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import json
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import embedding_service
from models import PlayerProfile, Player, PlayerStats
from improved_embedding_system import (
    load_mass_processed_players, 
    create_improved_embedding_text,
    regenerate_embeddings
)

# Global variables for player data
players_data: list[dict] = []
players_loaded = False

def load_players_on_startup():
    """Load players from mass_processed_players.json on startup"""
    global players_data, players_loaded
    
    if players_loaded:
        return
    
    try:
        print("🔄 Loading players from mass_processed_players.json...")
        players_data = load_mass_processed_players()
        
        # Check if we need to generate improved embeddings
        if players_data and not players_data[0].get('improved_embedding'):
            print("🔄 Generating improved embeddings for better search...")
            players_data = regenerate_embeddings(players_data)
            
            # Save improved data
            with open('mass_processed_players_improved.json', 'w', encoding='utf-8') as f:
                json.dump({
                    'processed_players': players_data,
                    'stats': {
                        'total_processed': len(players_data),
                        'with_improved_embeddings': len([p for p in players_data if p.get('improved_embedding')]),
                        'improvement_method': 'champion_names_and_role_specific'
                    }
                }, f, indent=2, ensure_ascii=False)
        
        players_loaded = True
        print(f"✅ Loaded {len(players_data)} players successfully")
        
    except Exception as e:
        print(f"❌ Error loading players: {e}")
        players_data = []

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting VibeCode Duo Matchmaking API...")
    load_players_on_startup()
    yield
    # Shutdown
    print("👋 Shutting down VibeCode Duo Matchmaking API...")

app = FastAPI(lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

@app.get("/")
def read_root():
    return {
        "message": "VibeCode Duo Matchmaking API",
        "description": "Find your perfect League of Legends duo partner",
        "players_loaded": len(players_data),
        "endpoints": {
            "search": "/players/search - Search for duo partners",
            "list": "/players - List all available players",
            "stats": "/stats - Get system statistics"
        }
    }

@app.get("/stats")
def get_system_stats():
    """Get system statistics"""
    if not players_data:
        return {"error": "No players loaded"}
    
    # Analyze player distribution
    roles = {}
    champions = {}
    total_champions = 0
    
    for player in players_data:
        stats = player.get('stats', {})
        role = stats.get('primary_lane', 'Unknown')
        roles[role] = roles.get(role, 0) + 1
        
        player_champions = stats.get('most_played_champions', [])
        total_champions += len(player_champions)
        for champ in player_champions:
            champions[champ] = champions.get(champ, 0) + 1
    
    # Get top champions
    top_champions = sorted(champions.items(), key=lambda x: x[1], reverse=True)[:10]
    
    return {
        "total_players": len(players_data),
        "role_distribution": roles,
        "total_unique_champions": len(champions),
        "average_champions_per_player": total_champions / len(players_data) if players_data else 0,
        "top_champions": top_champions,
        "embedding_system": "improved_with_champion_names"
    }

@app.post("/players/search")
def search_players(query: dict):
    """
    Search for duo partners based on natural language query
    Returns comprehensive player information ordered by similarity
    """
    try:
        search_query = query.get("query", "")
        limit = query.get("limit", 50)  # Default to 50 results
        
        if not search_query:
            raise HTTPException(status_code=400, detail="Query is required")
        
        if not players_data:
            load_players_on_startup()
            if not players_data:
                return {"message": "No players available", "players": []}
        
        print(f"🔍 Searching for: '{search_query}' (limit: {limit})")
        
        # Generate embedding for search query
        query_embedding = embedding_service.generate_embedding(search_query)
        
        # Get improved embeddings from players
        player_embeddings = []
        valid_players = []
        
        for player in players_data:
            # Use improved embedding if available, otherwise create one
            embedding = player.get('improved_embedding')
            if not embedding:
                # Generate improved embedding on the fly
                improved_text = create_improved_embedding_text(player)
                embedding = embedding_service.generate_embedding(improved_text)
                player['improved_embedding'] = embedding
                player['improved_embedding_text'] = improved_text
            
            if embedding and len(embedding) > 0:
                player_embeddings.append(embedding)
                valid_players.append(player)
        
        if not player_embeddings:
            return {"message": "No valid player embeddings found", "players": []}
        
        # Calculate similarities
        query_array = np.array([query_embedding])
        embeddings_array = np.array(player_embeddings)
        
        similarities = cosine_similarity(query_array, embeddings_array)[0]
        
        # Sort by similarity (highest first)
        sorted_indices = np.argsort(similarities)[::-1]
        
        # Limit results
        if limit > 0:
            sorted_indices = sorted_indices[:limit]
        
        # Build comprehensive results
        matching_players = []
        for i, idx in enumerate(sorted_indices):
            player = valid_players[idx]
            similarity_score = float(similarities[idx])
            
            # Extract comprehensive player information
            stats = player.get('stats', {})
            groq_descriptions = player.get('groq_descriptions', {})
            comprehensive_analysis = player.get('comprehensive_analysis', {})
            
            player_result = {
                "rank": i + 1,
                "similarity_score": similarity_score,
                "riot_id": player.get('riot_id', 'Unknown'),
                "bio": player.get('bio', ''),
                
                # Core stats
                "stats": {
                    "primary_role": stats.get('primary_lane', 'Unknown'),
                    "most_played_champions": stats.get('most_played_champions', []),
                    "avg_cs_per_minute": stats.get('avg_cs_per_minute', 0)
                },
                
                # Groq-generated descriptions
                "descriptions": {
                    "comprehensive": groq_descriptions.get('comprehensive', ''),
                    "playstyle": groq_descriptions.get('playstyle', ''),
                    "compatibility": groq_descriptions.get('compatibility', ''),
                    "cons": groq_descriptions.get('cons', '')
                },
                
                # Detailed analysis if available
                "analysis": {
                    "champion_pool_size": comprehensive_analysis.get('champion_pool_size', 0),
                    "champion_diversity_score": comprehensive_analysis.get('champion_diversity_score', 0),
                    "aggressive_tendency": comprehensive_analysis.get('aggressive_tendency', 0),
                    "mechanical_skill_level": comprehensive_analysis.get('mechanical_skill_level', 0),
                    "pace_preference": comprehensive_analysis.get('pace_preference', 'Unknown'),
                    "performance_trend": comprehensive_analysis.get('performance_trend', 'Unknown'),
                    "recent_champion_shifts": comprehensive_analysis.get('recent_champion_shifts', [])
                },
                
                # Champion details
                "champion_details": comprehensive_analysis.get('most_played_champions', [])[:5] if comprehensive_analysis.get('most_played_champions') else [],
                
                # What was embedded for transparency
                "embedding_preview": player.get('improved_embedding_text', '')[:200] + "..." if player.get('improved_embedding_text') else ""
            }
            
            matching_players.append(player_result)
        
        return {
            "results": matching_players,
            "total_players": len(valid_players),
            "search_time": 0.1  # Could add actual timing if needed
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Search error: {e}")
        raise HTTPException(status_code=500, detail=f"Search error: {e}")

@app.get("/players")
def list_players(limit: int = 20, offset: int = 0):
    """
    List all available players with pagination
    """
    if not players_data:
        load_players_on_startup()
        if not players_data:
            return {"message": "No players available", "players": []}
    
    # Apply pagination
    start_idx = offset
    end_idx = offset + limit
    paginated_players = players_data[start_idx:end_idx]
    
    # Format player data
    formatted_players = []
    for player in paginated_players:
        stats = player.get('stats', {})
        groq_descriptions = player.get('groq_descriptions', {})
        
        formatted_player = {
            "riot_id": player.get('riot_id', 'Unknown'),
            "bio": player.get('bio', ''),
            "primary_role": stats.get('primary_lane', 'Unknown'),
            "champions": stats.get('most_played_champions', [])[:3],
            "overview": groq_descriptions.get('comprehensive', '')[:150] + "..." if groq_descriptions.get('comprehensive') else ""
        }
        formatted_players.append(formatted_player)
    
    return {
        "total_players": len(players_data),
        "showing": len(formatted_players),
        "offset": offset,
        "limit": limit,
        "players": formatted_players
    }

@app.get("/player/{riot_id}")
def get_player_details(riot_id: str):
    """
    Get detailed information about a specific player
    """
    if not players_data:
        load_players_on_startup()
    
    # Find player
    player = None
    for p in players_data:
        if p.get('riot_id') == riot_id:
            player = p
            break
    
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Return comprehensive player data
    stats = player.get('stats', {})
    groq_descriptions = player.get('groq_descriptions', {})
    comprehensive_analysis = player.get('comprehensive_analysis', {})
    
    return {
        "riot_id": player.get('riot_id'),
        "bio": player.get('bio', ''),
        "stats": stats,
        "descriptions": groq_descriptions,
        "comprehensive_analysis": comprehensive_analysis,
        "generation_method": player.get('generation_method', 'unknown')
    }

@app.post("/reload")
def reload_players():
    """
    Reload players from file (useful for development)
    """
    global players_data, players_loaded
    players_loaded = False
    load_players_on_startup()
    
    return {
        "message": "Players reloaded successfully",
        "total_players": len(players_data)
    }

# Remove all group-related endpoints since we're focusing on duo matching
# The API now focuses entirely on player search and matching

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting VibeCode Duo Matchmaking API server...")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
