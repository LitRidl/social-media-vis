export class GraphDatastore {
    constructor(graph) {
        this.nodes = new Map();
        this.graph = graph;
    }

    add(nodes) {
        for (node of nodes) {
            this.nodes.set(node.id, node);
        }
        this.graph.addNodes(nodes);
    }

    remove(nodeIds) {
        for (nodeId of nodeIds) {
            console.log(`deleting node ${nodeId}`);
            this.graph.removeNode(nodeId);

            this.nodes.delete(nodeId);
        }
    }

    clear() {
        this.nodes.clear();
        this.graph.clear();
    }
}
