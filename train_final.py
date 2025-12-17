import torch
import torch.nn as nn
from torch_geometric.nn.conv import LGConv
from torch_geometric.utils import structured_negative_sampling
import pandas as pd
import os

# --- 1. DEFINE MANUAL MODEL (Bypass Library Defaults) ---
class MyCustomLightGCN(nn.Module):
    def __init__(self, num_nodes, embedding_dim=64):
        super().__init__()
        # We explicitly create the embedding table ourselves
        self.embedding = nn.Embedding(num_nodes, embedding_dim)
        # LGConv is the basic math layer (Neighbor Propagation)
        self.conv = LGConv()
        # Initialize weights for better training
        nn.init.xavier_normal_(self.embedding.weight)

    def forward(self, edge_index):
        # 1. Start with the raw embeddings (Size is GUARANTEED to be num_nodes)
        x0 = self.embedding.weight
        
        # 2. Layer 1 Propagation
        x1 = self.conv(x0, edge_index)
        
        # 3. Layer 2 Propagation
        x2 = self.conv(x1, edge_index)
        
        # 4. Layer 3 Propagation
        x3 = self.conv(x2, edge_index)
        
        # 5. Combine (Mean of all layers) - Standard LightGCN Logic
        # This ensures we capture both direct features and neighbor features
        out = (x0 + x1 + x2 + x3) / 4
        
        return out

# --- 2. THE TRAINING LOOP ---
def run_final_training():
    print("--- STARTING CUSTOM MODEL TRAINING ---")
    
    # A. Load Data
    try:
        interactions = pd.read_csv("data/processed_interactions.csv")
        investors = pd.read_csv("data/processed_investors.csv")
        startups = pd.read_csv("data/processed_startups.csv")
    except FileNotFoundError:
        print("CRITICAL ERROR: Data files not found.")
        return

    # B. Stats
    num_users = len(investors)
    num_items = len(startups)
    total_nodes = num_users + num_items
    print(f"Stats: {num_users} Investors + {num_items} Startups = {total_nodes} Total Nodes")

    # C. Prepare Graph
    src = torch.tensor(interactions['investor_id'].values, dtype=torch.long)
    dst = torch.tensor(interactions['startup_id'].values, dtype=torch.long) + num_users
    edge_index = torch.stack([src, dst], dim=0)

    # D. Initialize Custom Model
    # We pass the EXACT total_nodes. 
    ai_model = MyCustomLightGCN(num_nodes=total_nodes)
    
    # Setup Device
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    ai_model = ai_model.to(device)
    edge_index = edge_index.to(device)

    # E. Training
    ai_model.train()
    optimizer = torch.optim.Adam(ai_model.parameters(), lr=0.01)
    epochs = 100

    print(f"Starting Training for {epochs} epochs...")

    for epoch in range(epochs):
        optimizer.zero_grad()
        
        # 1. Forward Pass (Using our custom manual logic)
        embeddings = ai_model(edge_index)
        
        # DEBUG: Check size (This should now be 27698, NOT 1000)
        if epoch == 0:
            print(f"[Debug] Output Shape: {embeddings.shape}")
            if embeddings.shape[0] != total_nodes:
                print(f"ERROR: Shape Mismatch! Expected {total_nodes}, got {embeddings.shape[0]}")
                break

        # 2. Sampling
        user_indices, pos_item_indices, neg_item_indices = structured_negative_sampling(
            edge_index,
            num_nodes=total_nodes
        )
        
        # 3. Loss Calculation
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

    # F. Save
    print("Training Complete.")
    save_path = "data/foundmatch_graph.pth"
    torch.save(ai_model.state_dict(), save_path) # Saves weights of our custom class
    print(f"SAVED: Weights saved to '{save_path}'")

if __name__ == "__main__":
    run_final_training()