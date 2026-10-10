import pandas as pd
import networkx as nx
from networkx.algorithms import community


def analyze_graph(edge_file):
    print("Loading processed edges...")
    edge_df = pd.read_csv(edge_file)

    print("Building directed interaction graph...")
    G = nx.from_pandas_edgelist(
        edge_df,
        source='nameOrig',
        target='nameDest',
        edge_attr=['total_amount', 'transaction_count'],
        create_using=nx.DiGraph()
    )
    print(f"Graph constructed with {G.number_of_nodes()} nodes and {G.number_of_edges()} edges.")

    print("Detecting communities using Louvain algorithm...")
    undirected_G = G.to_undirected()
    communities = community.louvain_communities(undirected_G, weight='total_amount', seed=42)

    node_community_map = {}
    for comm_id, nodes in enumerate(communities):
        for node in nodes:
            node_community_map[node] = comm_id

    print("Extracting topological features...")
    in_degrees = dict(G.in_degree())
    out_degrees = dict(G.out_degree())
    pagerank = nx.pagerank(G, weight='total_amount')

    features = []
    for node in G.nodes():
        features.append({
            'account_id': node,
            'community_id': node_community_map.get(node, -1),
            'in_degree': in_degrees.get(node, 0),
            'out_degree': out_degrees.get(node, 0),
            'pagerank': pagerank.get(node, 0.0)
        })

    feature_df = pd.DataFrame(features)
    feature_df.to_csv("node_features.csv", index=False)
    print("Saved topological features to 'node_features.csv'.")
    return feature_df


if __name__ == "__main__":
    edge_filename = "processed_transaction_edges.csv"
    analyze_graph(edge_filename)