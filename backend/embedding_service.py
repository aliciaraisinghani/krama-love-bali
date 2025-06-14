from sentence_transformers import SentenceTransformer
from typing import List
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# Load a pre-trained model for generating embeddings
# Using a model that's good for semantic similarity
model = SentenceTransformer('all-MiniLM-L6-v2')

def generate_embedding(text: str) -> List[float]:
    """Generate an embedding vector from text"""
    embedding = model.encode([text])
    return embedding[0].tolist()

def generate_player_description(bio: str, stats) -> str:
    """
    Create a comprehensive description of a player combining their bio and stats
    This will be used to generate the embedding for matching
    """
    description_parts = [bio]
    
    if stats.primary_lane:
        description_parts.append(f"plays {stats.primary_lane} lane")
    
    if stats.most_played_champions:
        champs = ", ".join(stats.most_played_champions)
        description_parts.append(f"mains {champs}")
    
    if stats.avg_cs_per_minute and stats.avg_cs_per_minute > 0:
        cs_level = "high" if stats.avg_cs_per_minute > 6 else "moderate" if stats.avg_cs_per_minute > 4 else "low"
        description_parts.append(f"{cs_level} CS player ({stats.avg_cs_per_minute} CS/min)")
    
    return ". ".join(description_parts)

def find_similar_players(query_embedding: List[float], player_embeddings: List[List[float]], top_k: int = 5) -> List[int]:
    """
    Find the most similar players based on embedding similarity
    Returns indices of the most similar players
    """
    if not player_embeddings:
        return []
    
    query_array = np.array([query_embedding])
    embeddings_array = np.array(player_embeddings)
    
    similarities = cosine_similarity(query_array, embeddings_array)[0]
    
    # Get indices of top_k most similar players
    top_indices = np.argsort(similarities)[::-1][:top_k]
    
    return top_indices.tolist()

def generate_group_description(group_name: str, group_description: str, looking_for: str, member_descriptions: List[str]) -> str:
    """
    Create a comprehensive description of a group combining their info and member characteristics
    """
    description_parts = [f"Group '{group_name}': {group_description}"]
    description_parts.append(f"Looking for: {looking_for}")
    
    if member_descriptions:
        # Summarize member characteristics
        all_lanes = []
        all_champions = []
        cs_levels = []
        
        for member_desc in member_descriptions:
            # Extract key info from member descriptions
            if "plays " in member_desc and " lane" in member_desc:
                lane_part = member_desc.split("plays ")[1].split(" lane")[0]
                all_lanes.append(lane_part)
            
            if "mains " in member_desc:
                champs_part = member_desc.split("mains ")[1].split(".")[0]
                all_champions.extend(champs_part.split(", "))
            
            if "CS player" in member_desc:
                if "high CS" in member_desc:
                    cs_levels.append("high")
                elif "moderate CS" in member_desc:
                    cs_levels.append("moderate")
                elif "low CS" in member_desc:
                    cs_levels.append("low")
        
        # Add group characteristics based on members
        if all_lanes:
            unique_lanes = list(set(all_lanes))
            description_parts.append(f"Current lanes: {', '.join(unique_lanes)}")
        
        if all_champions:
            # Get most common champions
            from collections import Counter
            common_champs = Counter(all_champions).most_common(3)
            champ_names = [champ[0] for champ in common_champs]
            description_parts.append(f"Group plays: {', '.join(champ_names)}")
        
        if cs_levels:
            avg_cs_level = max(set(cs_levels), key=cs_levels.count)
            description_parts.append(f"Group skill level: {avg_cs_level}")
    
    return ". ".join(description_parts)

def find_similar_groups(query_embedding: List[float], group_embeddings: List[List[float]], top_k: int = 5) -> List[int]:
    """
    Find the most similar groups based on embedding similarity
    Returns indices of the most similar groups
    """
    if not group_embeddings:
        return []
    
    query_array = np.array([query_embedding])
    embeddings_array = np.array(group_embeddings)
    
    similarities = cosine_similarity(query_array, embeddings_array)[0]
    
    # Get indices of top_k most similar groups
    top_indices = np.argsort(similarities)[::-1][:top_k]
    
    return top_indices.tolist() 