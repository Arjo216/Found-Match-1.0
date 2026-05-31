import torch
import torch.nn.functional as F
from torch_geometric.nn import SAGEConv

class DealMatchGNN(torch.nn.Module):
    def __init__(self, in_channels=384, hidden_channels=256, out_channels=384):
        """
        in_channels: 384 (from your base NLP embeddings like all-MiniLM-L6-v2)
        out_channels: 384 (must match pgvector database column size)
        """
        super(DealMatchGNN, self).__init__()
        
        # Layer 1: Learns from immediate neighbors (1 hop)
        self.conv1 = SAGEConv(in_channels, hidden_channels)
        
        # Layer 2: Learns from neighbors of neighbors (2 hops)
        self.conv2 = SAGEConv(hidden_channels, out_channels)

    def forward(self, x, edge_index):
        # Pass features through the first GraphSAGE layer
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = F.dropout(x, p=0.3, training=self.training)
        
        # Pass through the second layer
        x = self.conv2(x, edge_index)
        
        # L2 Normalize the output vectors so they work perfectly with Cosine Similarity in pgvector
        x = F.normalize(x, p=2, dim=1)
        
        return x