import os
import logging
import json
from dotenv import load_dotenv # <-- ADD THIS
from supabase import create_client, Client
import torch

# Load environment variables from the .env file
load_dotenv() # <-- ADD THIS

logger = logging.getLogger("MLOps-DataLoader")

# Initialize Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") # Make sure this matches your .env variable name!
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_graph_data():
    """
    Pulls nodes (users) and edges (interactions) from Supabase.
    Returns PyTorch-ready tensors.
    """
    logger.info("Fetching raw vectors from Supabase...")
    
    # 1. Fetch Users (Nodes)
    users_res = supabase.table("users").select("id, vector_embedding").execute()
    users = users_res.data
    
    if not users:
        return None, None, None

    # Map UUIDs to integer indices for PyTorch
    id_to_index = {user['id']: idx for idx, user in enumerate(users)}
    index_to_id = {idx: user['id'] for idx, user in enumerate(users)}
    
    # Create the Node Feature Matrix
    node_features = []
    for user in users:
        raw_vec = user.get('vector_embedding')
        
        # --- INDESTRUCTIBLE PARSING LOGIC ---
        try:
            if not raw_vec:
                # Handle nulls
                parsed_vec = [0.0] * 384
            elif isinstance(raw_vec, str):
                # Brute-force strip all string artifacts and convert to floats
                clean_str = raw_vec.replace('[', '').replace(']', '').replace('"', '').replace("'", "").strip()
                if clean_str:
                    parsed_vec = [float(x) for x in clean_str.split(',')]
                else:
                    parsed_vec = [0.0] * 384
            elif isinstance(raw_vec, list):
                # If the client already made it a list, force everything inside to be a float
                parsed_vec = [float(x) for x in raw_vec]
            else:
                parsed_vec = [0.0] * 384
                
            # Final safety net: PyTorch will crash if the length isn't exactly 384
            if len(parsed_vec) != 384:
                parsed_vec = (parsed_vec + [0.0] * 384)[:384]
                
        except Exception as e:
            logger.error(f"Failed to parse vector for user {user.get('id')}: {e}. Defaulting to zeros.")
            parsed_vec = [0.0] * 384
            
        node_features.append(parsed_vec)

    # Now it is 100% guaranteed to be a pure list of 384-length float arrays.
    x = torch.tensor(node_features, dtype=torch.float)

    # 2. Fetch Interactions (Edges)
    edges_res = supabase.table("interactions").select("user_id_1, user_id_2").execute()
    edges = edges_res.data
    
    source_nodes = []
    target_nodes = []
    
    for edge in edges:
        u1 = edge['user_id_1']
        u2 = edge['user_id_2']
        if u1 in id_to_index and u2 in id_to_index:
            source_nodes.append(id_to_index[u1])
            target_nodes.append(id_to_index[u2])
            source_nodes.append(id_to_index[u2])
            target_nodes.append(id_to_index[u1])

    if source_nodes:
        edge_index = torch.tensor([source_nodes, target_nodes], dtype=torch.long)
    else:
        edge_index = torch.empty((2, 0), dtype=torch.long)

    logger.info(f"Graph constructed: {x.size(0)} nodes, {edge_index.size(1)} edges.")
    return x, edge_index, index_to_id

def update_database_embeddings(index_to_id, new_embeddings_tensor):
    """
    Pushes the freshly trained PyTorch tensor back into Supabase pgvector.
    """
    logger.info("Pushing refined vectors back to pgvector...")
    
    new_embeddings = new_embeddings_tensor.detach().cpu().numpy()
    
    # In a production environment with 10k+ users, you would batch this.
    # For now, we update row by row.
    for idx, embedding in enumerate(new_embeddings):
        user_id = index_to_id[idx]
        vector_list = embedding.tolist()
        
        supabase.table("users").update({
            "vector_embedding": vector_list
        }).eq("id", user_id).execute()
        
    logger.info("Supabase vector synchronization complete.")