import torch
import torch.nn as nn # Added this import
import pandas as pd
import os
from ml_engine.model import FoundMatchAI
from torch_geometric.utils import structured_negative_sampling

def train_engine():
    print("Initializing Training Script...")
    
    # 1. Load the Processed Data
    try:
        interactions = pd.read_csv("data/processed_interactions.csv")
        investors = pd.read_csv("data/processed_investors.csv")
        startups = pd.read_csv("data/processed_startups.csv")
    except FileNotFoundError:
        print("Error: Processed data not found. Please run preprocessing.py first.")
        return

    num_users = len(investors)
    num_items = len(startups)
    total_expected_nodes = num_users + num_items
    
    print(f"Dataset Stats: {num_users} Investors + {num_items} Startups = {total_expected_nodes} Total Nodes")
    
    # 2. Prepare Graph Data
    src = torch.tensor(interactions['investor_id'].values, dtype=torch.long)
    dst = torch.tensor(interactions['startup_id'].values, dtype=torch.long) + num_users
    edge_index = torch.stack([src, dst], dim=0)
    
    # 3. Initialize the AI System
    ai_system = FoundMatchAI(num_users, num_items)
    
    # --- CRITICAL SAFETY CHECK & PATCH ---
    # We inspect the actual size of the model's embedding layer
    current_vocab_size = ai_system.graph_model.embedding.weight.shape[0]
    print(f"DEBUG CHECK: Model created with size: {current_vocab_size}")
    
    if current_vocab_size != total_expected_nodes:
        print(f"WARNING: Model size mismatch! Expected {total_expected_nodes} but got {current_vocab_size}.")
        print("APPLYING FORCE PATCH: Manually resizing the embedding layer...")
        
        # Force replace the embedding layer with the correct size
        embedding_dim = ai_system.graph_model.embedding.weight.shape[1]
        device = ai_system.device
        
        # Overwrite the embedding layer
        ai_system.graph_model.embedding = nn.Embedding(total_expected_nodes, embedding_dim).to(device)
        # Update the internal num_nodes attribute if it exists
        ai_system.graph_model.num_nodes = total_expected_nodes
        
        print(f"PATCH APPLIED. New model size: {ai_system.graph_model.embedding.weight.shape[0]}")
    else:
        print("Model size is correct. Proceeding...")
    # -------------------------------------

    ai_system.graph_model.train()
    optimizer = torch.optim.Adam(ai_system.graph_model.parameters(), lr=0.01)
    
    # 4. The Training Loop
    epochs = 100
    print(f"Starting training for {epochs} epochs...")
    
    for epoch in range(epochs):
        optimizer.zero_grad()
        
        # Forward pass
        embeddings = ai_system.graph_model(edge_index)
        
        # Sampling
        # Ensure we don't sample outside the known range
        user_indices, pos_item_indices, neg_item_indices = structured_negative_sampling(
            edge_index, 
            num_nodes=total_expected_nodes 
        )
        
        # Get embeddings
        user_emb = embeddings[user_indices]
        pos_item_emb = embeddings[pos_item_indices]
        neg_item_emb = embeddings[neg_item_indices]
        
        # Calculate Loss
        pos_scores = (user_emb * pos_item_emb).sum(dim=1)
        neg_scores = (user_emb * neg_item_emb).sum(dim=1)
        loss = -torch.log(torch.sigmoid(pos_scores - neg_scores)).mean()
        
        loss.backward()
        optimizer.step()
        
        if epoch % 10 == 0:
            print(f"Epoch {epoch} | Loss: {loss.item():.4f}")
            
    # 5. Save Model
    print("Training Complete.")
    save_path = "data/foundmatch_graph.pth"
    torch.save(ai_system.graph_model.state_dict(), save_path)
    print(f"Model saved to {save_path}")

if __name__ == "__main__":
    train_engine()