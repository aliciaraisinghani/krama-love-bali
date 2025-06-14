from sentence_transformers import SentenceTransformer
from typing import List
import numpy as np
import torch
from sklearn.metrics.pairwise import cosine_similarity
import os

# Optimize for M4 Mac
def setup_device():
    """Setup optimal device for M4 Mac"""
    if torch.backends.mps.is_available():
        device = torch.device("mps")  # Metal Performance Shaders for M4
        print("🚀 Using Metal Performance Shaders (MPS) for M4 acceleration")
    elif torch.cuda.is_available():
        device = torch.device("cuda")
        print("🚀 Using CUDA")
    else:
        device = torch.device("cpu")
        print("💻 Using CPU")
    return device

# Set up device
DEVICE = setup_device()

# Optimize model selection for M4 Mac
# Using a more powerful model that benefits from M4's performance
MODEL_NAME = 'all-mpnet-base-v2'  # Better quality than MiniLM, good for M4

# Load model with optimizations
print(f"📥 Loading {MODEL_NAME} model...")
model = SentenceTransformer(MODEL_NAME, device=DEVICE)

# Enable mixed precision for M4 (if supported)
if DEVICE.type == "mps":
    # Set environment variables for optimal M4 performance
    os.environ['PYTORCH_ENABLE_MPS_FALLBACK'] = '1'
    print("⚡ Enabled MPS optimizations for M4")

def generate_embedding(text: str) -> List[float]:
    """Generate an embedding vector from text with M4 optimizations"""
    # Use the optimized model with device placement
    embedding = model.encode([text], device=DEVICE, show_progress_bar=False)
    return embedding[0].tolist()

def generate_embeddings_batch(texts: List[str], batch_size: int = 32) -> List[List[float]]:
    """
    Generate embeddings for multiple texts in batches - much faster on M4
    """
    print(f"🔄 Processing {len(texts)} texts in batches of {batch_size}")
    
    embeddings = model.encode(
        texts, 
        device=DEVICE,
        batch_size=batch_size,
        show_progress_bar=True,
        convert_to_numpy=True
    )
    
    return embeddings.tolist()

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

def find_similar_players_optimized(query_embedding: List[float], player_embeddings: List[List[float]], top_k: int = 5) -> List[int]:
    """
    Optimized similarity search using vectorized operations
    """
    if not player_embeddings:
        return []
    
    # Use numpy for faster computation on M4
    query_array = np.array([query_embedding], dtype=np.float32)
    embeddings_array = np.array(player_embeddings, dtype=np.float32)
    
    # Optimized cosine similarity computation
    similarities = cosine_similarity(query_array, embeddings_array)[0]
    
    # Use argpartition for faster top-k selection (better than full sort)
    if len(similarities) <= top_k:
        top_indices = np.argsort(similarities)[::-1]
    else:
        # More efficient for large datasets
        top_indices = np.argpartition(similarities, -top_k)[-top_k:]
        top_indices = top_indices[np.argsort(similarities[top_indices])[::-1]]
    
    return top_indices.tolist()

def find_similar_players(query_embedding: List[float], player_embeddings: List[List[float]], top_k: int = 5) -> List[int]:
    """Wrapper for backward compatibility"""
    return find_similar_players_optimized(query_embedding, player_embeddings, top_k)

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
    """
    return find_similar_players_optimized(query_embedding, group_embeddings, top_k)

def benchmark_performance():
    """Benchmark the embedding performance on your M4"""
    import time
    
    print("🏃‍♂️ Benchmarking embedding performance on M4...")
    
    test_texts = [
        "Competitive ADC player who likes to farm and scale into late game",
        "Chill support main who enjoys helping the team",
        "Aggressive jungle player who likes early game ganks",
        "Mid lane mage player who focuses on team fights",
        "Top lane tank player who enjoys protecting the team"
    ] * 10  # 50 texts total
    
    # Single embedding benchmark
    start_time = time.time()
    for text in test_texts[:5]:
        generate_embedding(text)
    single_time = time.time() - start_time
    
    # Batch embedding benchmark
    start_time = time.time()
    generate_embeddings_batch(test_texts)
    batch_time = time.time() - start_time
    
    print(f"📊 Performance Results:")
    print(f"   Single embeddings (5 texts): {single_time:.2f}s ({single_time/5:.3f}s per text)")
    print(f"   Batch embeddings (50 texts): {batch_time:.2f}s ({batch_time/50:.3f}s per text)")
    print(f"   🚀 Batch processing is {(single_time/5)/(batch_time/50):.1f}x faster!")
    
    return batch_time/50  # Return time per text for batch processing

if __name__ == "__main__":
    print("🔧 M4 Mac Optimized Embedding Service")
    print("=" * 50)
    benchmark_performance() 