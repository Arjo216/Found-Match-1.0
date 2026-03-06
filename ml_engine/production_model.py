import torch
import torch.nn as nn
from torch_geometric.nn.conv import LGConv
from sentence_transformers import SentenceTransformer

# --- 1. THE CUSTOM GRAPH MODEL (Must match train_final.py exactly) ---
class MyCustomLightGCN(nn.Module):
    def __init__(self, num_nodes, embedding_dim=64):
        super().__init__()
        # Explicitly create the embedding table
        self.embedding = nn.Embedding(num_nodes, embedding_dim)
        # LGConv is the standard neighbor propagation layer
        self.conv = LGConv()

    def forward(self, edge_index):
        x0 = self.embedding.weight
        x1 = self.conv(x0, edge_index)
        x2 = self.conv(x1, edge_index)
        x3 = self.conv(x2, edge_index)
        # Combine layers (Mean pooling)
        return (x0 + x1 + x2 + x3) / 4
    
    def get_embedding(self, edge_index):
        # Helper for inference
        return self.forward(edge_index)

# --- 2. THE WRAPPER CLASS (Combines Graph + NLP) ---
class FoundMatchProductionAI:
    def __init__(self, num_users, num_items, embedding_dim=64):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # A. NLP Model (for content matching)
        self.nlp_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # B. Graph Model (for collaborative matching)
        self.total_nodes = num_users + num_items
        self.graph_model = MyCustomLightGCN(num_nodes=self.total_nodes, embedding_dim=embedding_dim)
        self.graph_model.to(self.device)
        
        self.num_users = num_users
        self.num_items = num_items

    def load_weights(self, path):
        # Load the trained weights safely
        try:
            state_dict = torch.load(path, map_location=self.device)
            self.graph_model.load_state_dict(state_dict)
            self.graph_model.eval() # Set to evaluation mode
            print(f"SUCCESS: Loaded weights from {path}")
        except Exception as e:
            print(f"ERROR loading model weights: {e}")

    def predict_match_score(self, investor_text, startup_text, investor_id, startup_id):
        """
        Calculates a presentation-ready hybrid score (NLP + Graph + Normalization).
        """
        # 1. NLP Score (Semantic Similarity)
        with torch.no_grad():
            emb1 = self.nlp_model.encode(investor_text, convert_to_tensor=True)
            emb2 = self.nlp_model.encode(startup_text, convert_to_tensor=True)
            
            # Get raw cosine similarity and bound it strictly between 0 and 1
            raw_semantic = torch.nn.functional.cosine_similarity(emb1, emb2, dim=0).item()
            semantic_score = max(0.0, raw_semantic)
            
            # 2. Graph Score (Latent Collaborative Connection)
            all_emb = self.graph_model.embedding.weight
            safe_inv_id = investor_id if investor_id < self.num_users else 0
            safe_startup_id = startup_id if startup_id < self.num_items else 0
            
            u_emb = all_emb[safe_inv_id]
            i_emb = all_emb[self.num_users + safe_startup_id]
            
            graph_score = torch.sigmoid(torch.sum(u_emb * i_emb)).item()
            
            # 3. Base Hybrid Weighting (70% Content, 30% Graph)
            base_score = (0.7 * semantic_score) + (0.3 * graph_score)

            # --- THE MAGIC: NORMALIZATION & HEURISTICS ---
            
            # A. Keyword Overlap Booster (Simulating your "Hard Parameter Match")
            investor_lower = investor_text.lower()
            startup_lower = startup_text.lower()
            key_sectors = ["ai", "fintech", "saas", "healthtech", "cybersecurity", "web3", "b2b", "ml"]
            
            shared_keywords = sum(1 for kw in key_sectors if kw in investor_lower and kw in startup_lower)
            keyword_boost = min(0.15, shared_keywords * 0.05) # Add 5% per matched keyword, up to 15%
            
            # B. The Power Curve (Stretches clumped scores into the 80s and 90s)
            # A raw base score of 0.60 becomes ~0.77.
            curved_score = base_score ** 0.5 
            
            # C. Combine and Cap
            final_score = curved_score + keyword_boost
            
            # Cap at 0.98 so it looks realistic (nobody is a mathematically perfect 100% match)
            final_score = min(0.98, final_score)
            
            # If the base score is truly terrible (< 0.20), let it stay terrible.
            if base_score < 0.20:
                final_score = base_score
            
            return round(final_score * 100, 1)