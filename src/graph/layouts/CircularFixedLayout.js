export class CircularFixedLayout {
    constructor(graph, layout) {
        this.graph = graph;
        this.layout = layout;
    }

    _calculateNodePosition(index, anglePerNode, radius) {
        // radius = calculateRadius() //todo fixme by points number?
        const currentAngle = index * anglePerNode;
        const newX = radius * Math.cos(currentAngle); //todo check
        const newY = radius * Math.sin(currentAngle); //todo check

        return {x: newX, y: newY};
    }


    updateNodesPositions = () => {
        let graph = this.graph;
        let layout = this.layout;

        let nodes = [];
        graph.forEachNode(function(node) {
            node.isPinned = true;
            layout.pinNode(node, true);
            nodes.push(node);
        } );

        let size = nodes.length;

        let anglePerNode = 2 * Math.PI / size;
        let radius = size * 20 / Math.PI;

        for(let [index, node] of nodes.entries()) {
            let newPos = this._calculateNodePosition(index, anglePerNode, radius);
            layout.setNodePosition(node.id, newPos.x, newPos.y);
        }

    }

}
