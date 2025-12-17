import torch
import torch.nn as nn
from torch_geometric.nn import LightGCN
from torch_geometric.utils import structured_negative_sampling
import pandas as pd
import os

# --- 1. DEFINE THE AI MODEL (Directly in this file) ---
# This ensures no "ghost" imports from other files
class StandaloneAI:
    def __init__(self, num_users, num_items, embedding_dim=64):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Calculate strict total for LightGCN
        self.total_nodes = num_users + num_items
        
        print(f"[Model Init] Creating LightGCN with {self.total_nodes} nodes...")
        
        # Initialize LightGCN with the EXACT required size
        self.graph_model = LightGCN(
            num_nodes=self.total_nodes,
            embedding_dim=embedding_dim,
            num_layers=3
        ).to(self.device)

# --- 2. THE TRAINING LOOP ---
def run_safe_training():
    print("--- STARTING STANDALONE TRAINING ---")
    
    # A. Load Data
    try:
        interactions = pd.read_csv("data/processed_interactions.csv")
        investors = pd.read_csv("data/processed_investors.csv")
        startups = pd.read_csv("data/processed_startups.csv")
    except FileNotFoundError:
        print("CRITICAL ERROR: Data files not found in 'data/' folder.")
        return

    # B. Calculate Sizes
    num_users = len(investors)
    num_items = len(startups)
    total_nodes = num_users + num_items
    
    print(f"Stats: {num_users} Investors + {num_items} Startups = {total_nodes} Total Nodes")

    # C. Prepare Graph Inputs
    # Shift startup IDs so they don't overlap with investor IDs
    src = torch.tensor(interactions['investor_id'].values, dtype=torch.long)
    dst = torch.tensor(interactions['startup_id'].values, dtype=torch.long) + num_users
    edge_index = torch.stack([src, dst], dim=0)

    # D. Initialize Model
    ai = StandaloneAI(num_users, num_items)
    
    # --- FINAL SAFETY CHECK ---
    # We verify the embedding layer size one last time
    actual_size = ai.graph_model.embedding.weight.shape[0]
    print(f"[Safety Check] Model Embedding Size: {actual_size}")
    
    if actual_size != total_nodes:
        print(f"FATAL MISMATCH: Needed {total_nodes}, got {actual_size}. Aborting to prevent crash.")
        return # Stop before we crash
    # --------------------------

    # E. Training Setup
    ai.graph_model.train()
    optimizer = torch.optim.Adam(ai.graph_model.parameters(), lr=0.01)
    epochs = 80

    print(f"Starting Training Loop for {epochs} epochs...")

    for epoch in range(epochs):
        optimizer.zero_grad()
        
        # 1. Forward Pass (Get Embeddings)
        # We pass edge_index to let the Graph Neural Network propagate signals
        embeddings = ai.graph_model(edge_index)
        
        # DEBUG: Check the shape of the output embeddings
        if epoch == 0:
            print(f"[Epoch 0 Debug] Embeddings Output Shape: {embeddings.shape}")
            if embeddings.shape[0] != total_nodes:
                print("ERROR: The model returned the wrong number of embeddings!")
                break

        # 2. Sampling (Pick random negatives)
        user_indices, pos_item_indices, neg_item_indices = structured_negative_sampling(
            edge_index,
            num_nodes=total_nodes # Explicitly tell sampler the graph size
        )
        
        # 3. Calculate Loss (BPR)
        # This is where your error happened before. 
        # Now 'embeddings' is guaranteed to be large enough.
        user_emb = embeddings[user_indices]
        pos_item_emb = embeddings[pos_item_indices]
        neg_item_emb = embeddings[neg_item_indices]
        
        pos_scores = (user_emb * pos_item_emb).sum(dim=1)
        neg_scores = (user_emb * neg_item_emb).sum(dim=1)
        
        loss = -torch.log(torch.sigmoid(pos_scores - neg_scores)).mean()
        
        loss.backward()
        optimizer.step()
        
        if epoch % 10 == 0:
            print(f"Epoch {epoch} | Loss: {loss.item():.4f}")

    # F. Save the Result
    print("Training Finished Successfully.")
    os.makedirs("data", exist_ok=True)
    save_path = "data/foundmatch_graph.pth"
    torch.save(ai.graph_model.state_dict(), save_path)
    print(f"SAVED: Model weights saved to '{save_path}'")

if __name__ == "__main__":
    run_safe_training()