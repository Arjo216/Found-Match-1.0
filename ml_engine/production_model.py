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
        Calculates a hybrid score (NLP + Graph).
        """
        # 1. NLP Score (Semantic Similarity)
        # We don't need gradients for inference
        with torch.no_grad():
            emb1 = self.nlp_model.encode(investor_text, convert_to_tensor=True)
            emb2 = self.nlp_model.encode(startup_text, convert_to_tensor=True)
            semantic_score = torch.nn.functional.cosine_similarity(emb1, emb2, dim=0).item()
            
            # 2. Graph Score (Latent Connection)
            # For inference, we use the learned embeddings directly.
            # We don't necessarily need the edge_index for a single lookup if we use the stored weights.
            # However, LightGCN implies smoothing over the graph. 
            # For simplicity and speed in production, we often look up the raw embedding 
            # or use a cached "final" embedding matrix.
            
            # Let's use the embeddings directly from the table for fast lookup
            # (In a highly dynamic graph, you'd re-run the convolution, but that's heavy for API)
            all_emb = self.graph_model.embedding.weight
            
            # Safe ID lookup
            safe_inv_id = investor_id if investor_id < self.num_users else 0
            safe_startup_id = startup_id if startup_id < self.num_items else 0
            
            # Startup index in graph = num_users + startup_ID
            u_emb = all_emb[safe_inv_id]
            i_emb = all_emb[self.num_users + safe_startup_id]
            
            # Dot product + Sigmoid
            graph_score = torch.sigmoid(torch.sum(u_emb * i_emb)).item()
            
            # 3. Hybrid Weighting (70% Content, 30% Graph)
            # You can tweak this balance. Content is safer for new startups.
            final_score = (0.7 * semantic_score) + (0.3 * graph_score)
            
            return round(final_score * 100, 2)