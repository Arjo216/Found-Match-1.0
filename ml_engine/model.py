import torch
import torch.nn as nn
from sentence_transformers import SentenceTransformer
from torch_geometric.nn import LightGCN

class FoundMatchAI:
    def __init__(self, num_users, num_items, embedding_dim=64):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # --- 1. NLP COMPONENT (Content) ---
        self.nlp_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # --- 2. GRAPH COMPONENT (Collaborative) ---
        # We explicitly calculate total nodes to avoid size mismatch errors
        total_nodes = num_users + num_items
        
        # DEBUG PRINT: This helps us confirm the new code is actually running
        print(f"DEBUG: Initializing LightGCN with {total_nodes} nodes ({num_users} users + {num_items} items)")
        
        self.graph_model = LightGCN(
            num_nodes=total_nodes,
            embedding_dim=embedding_dim,
            num_layers=3
        ).to(self.device)
        
        self.num_users = num_users
        self.num_items = num_items

    def generate_text_embeddings(self, text_list):
        return self.nlp_model.encode(text_list, convert_to_tensor=True)

    def get_graph_embeddings(self, edge_index):
        return self.graph_model(edge_index)

    def predict_match_score(self, investor_text, startup_text, investor_id, startup_id, edge_index):
        # A. Semantic Score
        emb1 = self.nlp_model.encode(investor_text, convert_to_tensor=True)
        emb2 = self.nlp_model.encode(startup_text, convert_to_tensor=True)
        semantic_score = torch.nn.functional.cosine_similarity(emb1, emb2, dim=0)
        
        # B. Graph Score
        all_embeddings = self.get_graph_embeddings(edge_index)
        
        # Safety Check for IDs (Modulo protection)
        # If ID is too big, wrap it around instead of crashing
        safe_inv_id = investor_id if investor_id < self.num_users else (investor_id % self.num_users)
        safe_startup_id = startup_id if startup_id < self.num_items else (startup_id % self.num_items)
            
        user_emb = all_embeddings[safe_inv_id]
        item_emb = all_embeddings[self.num_users + safe_startup_id] 
        
        graph_score = torch.sigmoid(torch.sum(user_emb * item_emb))
        
        # C. Weighted Hybrid Score
        final_score = (0.7 * semantic_score) + (0.3 * graph_score)
        return final_score.item()