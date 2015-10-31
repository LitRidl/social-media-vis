export class NotFixedLayout {
    constructor(graph, layout) {
        this.graph = graph;
        this.layout = layout;
    }

    updateNodesPostitions = () => {
        let graph = this.graph;
        let layout = this.layout;
        graph.forEachNode((node) => {
            node.isPinned = false;
            layout.pinNode(node, false);
        } );
    }
}
