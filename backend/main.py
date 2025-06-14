from fastapi import FastAPI, HTTPException
from typing import List
import riot_service
import embedding_service_optimized as embedding_service
from models import PlayerProfile, Player, PlayerStats, GroupCreate, Group

app = FastAPI()

# In-memory database for development
players_db: List[Player] = []
groups_db: List[Group] = []

@app.get("/")
def read_root():
    return {"message": "VibeCode Matchmaking API"}

@app.get("/player/{riot_id}/puuid")
def get_player_puuid(riot_id: str):
    """
    Test endpoint to retrieve a player's PUUID from their Riot ID.
    """
    try:
        puuid = riot_service.get_puuid(riot_id)
        if not puuid:
            raise HTTPException(status_code=404, detail="Player not found or error fetching data from Riot API.")
        return {"riot_id": riot_id, "puuid": puuid}
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

@app.post("/player")
def register_player(profile: PlayerProfile):
    """
    Register a new player by fetching their Riot data and generating embeddings
    """
    try:
        # Get PUUID from Riot ID
        puuid = riot_service.get_puuid(profile.riot_id)
        if not puuid:
            raise HTTPException(status_code=404, detail="Player not found in Riot API")
        
        # Check if player already exists
        for existing_player in players_db:
            if existing_player.puuid == puuid:
                raise HTTPException(status_code=400, detail="Player already registered")
        
        # Analyze player stats from match history
        print(f"Analyzing stats for {profile.riot_id}...")
        stats = riot_service.analyze_player_stats(puuid)
        
        # Generate comprehensive description and embedding
        description = embedding_service.generate_player_description(profile.bio, stats)
        embedding = embedding_service.generate_embedding(description)
        
        # Create and store player
        player = Player(
            puuid=puuid,
            riot_id=profile.riot_id,
            bio=profile.bio,
            stats=stats,
            embedding=embedding
        )
        
        players_db.append(player)
        
        return {
            "message": "Player registered successfully",
            "player": {
                "riot_id": player.riot_id,
                "bio": player.bio,
                "stats": player.stats,
                "description": description
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

@app.post("/player/search")
def search_players(query: dict):
    """
    Search for players based on natural language query
    """
    try:
        search_query = query.get("query", "")
        if not search_query:
            raise HTTPException(status_code=400, detail="Query is required")
        
        if not players_db:
            return {"message": "No players registered yet", "players": []}
        
        # Generate embedding for search query
        query_embedding = embedding_service.generate_embedding(search_query)
        
        # Get all player embeddings
        player_embeddings = [player.embedding for player in players_db]
        
        # Find similar players
        similar_indices = embedding_service.find_similar_players(
            query_embedding, player_embeddings, top_k=5
        )
        
        # Return matching players
        matching_players = []
        for idx in similar_indices:
            player = players_db[idx]
            matching_players.append({
                "riot_id": player.riot_id,
                "bio": player.bio,
                "stats": player.stats,
                "description": embedding_service.generate_player_description(player.bio, player.stats)
            })
        
        return {
            "query": search_query,
            "players": matching_players
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

@app.get("/players")
def list_players():
    """
    List all registered players
    """
    return {
        "count": len(players_db),
        "players": [
            {
                "riot_id": player.riot_id,
                "bio": player.bio,
                "stats": player.stats,
                "description": embedding_service.generate_player_description(player.bio, player.stats)
            }
            for player in players_db
        ]
    }

@app.post("/group")
def create_group(group_data: GroupCreate):
    """
    Create a new group
    """
    try:
        # Create group with empty members initially
        group = Group(
            name=group_data.name,
            description=group_data.description,
            looking_for=group_data.looking_for,
            members=[]
        )
        
        # Generate initial embedding based on group description and what they're looking for
        initial_description = embedding_service.generate_group_description(
            group.name, group.description, group.looking_for, []
        )
        group.embedding = embedding_service.generate_embedding(initial_description)
        
        groups_db.append(group)
        
        return {
            "message": "Group created successfully",
            "group": {
                "id": group.id,
                "name": group.name,
                "description": group.description,
                "looking_for": group.looking_for,
                "members": [],
                "member_count": 0
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

@app.put("/group/{group_id}/member")
def add_member_to_group(group_id: str, member_data: dict):
    """
    Add a player to a group by their Riot ID
    """
    try:
        riot_id = member_data.get("riot_id")
        if not riot_id:
            raise HTTPException(status_code=400, detail="riot_id is required")
        
        # Find the group
        group = None
        for g in groups_db:
            if g.id == group_id:
                group = g
                break
        
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        
        # Find the player
        player = None
        for p in players_db:
            if p.riot_id == riot_id:
                player = p
                break
        
        if not player:
            raise HTTPException(status_code=404, detail="Player not found. Please register the player first.")
        
        # Check if player is already in the group
        if player.puuid in group.members:
            raise HTTPException(status_code=400, detail="Player is already in this group")
        
        # Add player to group
        group.members.append(player.puuid)
        
        # Regenerate group embedding with new member
        member_descriptions = []
        for member_puuid in group.members:
            for p in players_db:
                if p.puuid == member_puuid:
                    member_descriptions.append(
                        embedding_service.generate_player_description(p.bio, p.stats)
                    )
                    break
        
        group_description = embedding_service.generate_group_description(
            group.name, group.description, group.looking_for, member_descriptions
        )
        group.embedding = embedding_service.generate_embedding(group_description)
        
        return {
            "message": f"Player {riot_id} added to group successfully",
            "group": {
                "id": group.id,
                "name": group.name,
                "description": group.description,
                "looking_for": group.looking_for,
                "members": [p.riot_id for p in players_db if p.puuid in group.members],
                "member_count": len(group.members)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

@app.post("/group/search")
def search_groups_for_player(query: dict):
    """
    Find groups that would be a good match for a player
    """
    try:
        riot_id = query.get("riot_id")
        if not riot_id:
            raise HTTPException(status_code=400, detail="riot_id is required")
        
        # Find the player
        player = None
        for p in players_db:
            if p.riot_id == riot_id:
                player = p
                break
        
        if not player:
            raise HTTPException(status_code=404, detail="Player not found. Please register the player first.")
        
        if not groups_db:
            return {"message": "No groups available", "groups": []}
        
        # Use player's embedding to find matching groups
        player_embedding = player.embedding
        group_embeddings = [group.embedding for group in groups_db]
        
        # Find similar groups
        similar_indices = embedding_service.find_similar_groups(
            player_embedding, group_embeddings, top_k=5
        )
        
        # Return matching groups
        matching_groups = []
        for idx in similar_indices:
            group = groups_db[idx]
            
            # Get member info
            member_info = []
            for member_puuid in group.members:
                for p in players_db:
                    if p.puuid == member_puuid:
                        member_info.append({
                            "riot_id": p.riot_id,
                            "bio": p.bio,
                            "stats": p.stats
                        })
                        break
            
            matching_groups.append({
                "id": group.id,
                "name": group.name,
                "description": group.description,
                "looking_for": group.looking_for,
                "members": member_info,
                "member_count": len(group.members)
            })
        
        return {
            "player": riot_id,
            "groups": matching_groups
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

@app.post("/group/{group_id}/search")
def search_players_for_group(group_id: str, query: dict):
    """
    Find players that would be a good match for a group
    """
    try:
        # Find the group
        group = None
        for g in groups_db:
            if g.id == group_id:
                group = g
                break
        
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        
        if not players_db:
            return {"message": "No players registered yet", "players": []}
        
        # Use the group's "looking_for" description to search for players
        search_query = query.get("query", group.looking_for)
        query_embedding = embedding_service.generate_embedding(search_query)
        
        # Get all player embeddings (excluding current members)
        available_players = []
        player_embeddings = []
        
        for player in players_db:
            if player.puuid not in group.members:  # Exclude current members
                available_players.append(player)
                player_embeddings.append(player.embedding)
        
        if not available_players:
            return {"message": "No available players (all registered players are already in this group)", "players": []}
        
        # Find similar players
        similar_indices = embedding_service.find_similar_players(
            query_embedding, player_embeddings, top_k=5
        )
        
        # Return matching players
        matching_players = []
        for idx in similar_indices:
            player = available_players[idx]
            matching_players.append({
                "riot_id": player.riot_id,
                "bio": player.bio,
                "stats": player.stats,
                "description": embedding_service.generate_player_description(player.bio, player.stats)
            })
        
        return {
            "group": {
                "id": group.id,
                "name": group.name,
                "looking_for": group.looking_for
            },
            "search_query": search_query,
            "players": matching_players
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

@app.get("/groups")
def list_groups():
    """
    List all groups
    """
    groups_info = []
    for group in groups_db:
        # Get member info
        member_info = []
        for member_puuid in group.members:
            for p in players_db:
                if p.puuid == member_puuid:
                    member_info.append({
                        "riot_id": p.riot_id,
                        "bio": p.bio,
                        "stats": p.stats
                    })
                    break
        
        groups_info.append({
            "id": group.id,
            "name": group.name,
            "description": group.description,
            "looking_for": group.looking_for,
            "members": member_info,
            "member_count": len(group.members)
        })
    
    return {
        "count": len(groups_db),
        "groups": groups_info
    }
