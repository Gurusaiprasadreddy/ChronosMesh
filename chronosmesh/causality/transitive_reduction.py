import networkx as nx

def compute_transitive_reduction(dag: nx.DiGraph) -> nx.DiGraph:
    if not nx.is_directed_acyclic_graph(dag):
        raise ValueError("Graph is not a DAG, cycle detected")
    
    tr = nx.transitive_reduction(dag)
    result = nx.DiGraph()
    result.add_nodes_from(dag.nodes(data=True))
    result.add_edges_from((u, v) for u, v in tr.edges() if dag.has_edge(u, v))
    return result

def is_transitively_reduced(dag: nx.DiGraph) -> bool:
    if not nx.is_directed_acyclic_graph(dag):
        raise ValueError("Graph is not a DAG, cycle detected")
        
    tr = nx.transitive_reduction(dag)
    return set(dag.edges()) == set(tr.edges())
