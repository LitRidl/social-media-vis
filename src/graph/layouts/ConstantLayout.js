import Viva from "vivagraphjs";

const DEFAULT_SETTINGS = {
    radius: 1000,
    center: {x:0, y:0},
};

const MAX_LINKS_SIZE = 10000;
const DEFAULT_NODE_SIZE = 24;
const MIN_NODE_SIZE = 24;
const MAX_NODE_SIZE = 48;


export class ConstantLayout {
    constructor(graph, layoutSettings=DEFAULT_SETTINGS) {
        this.settings = layoutSettings;
        this.layout = Viva.Graph.Layout.constant(graph);
        this.layout.placeNode(this.getConstantNodePosition);
    }

    _calculateNodePosition(index, anglePerNode) {
        // radius = calculateRadius() //todo fixme by points number?
        const currentAngle = index * anglePerNode;
        const newX = this._getCenterX() + this._getRadius() * Math.cos(currentAngle); //todo check
        const newY = this._getCenterY() + this._getRadius() * Math.sin(currentAngle); //todo check

        return {x: newX, y: newY};
    }

    _getCenterX() {
        return this.settings.center.x;
    }

    _getCenterY() {
        return this.settings.center.y;
    }

    _getRadius() {
        return this.settings.radius;
    }

    getConstantNodePosition = (node) => {
        let newX = node.data.pos.x - this.getNodeSize(node.data) / 2;
        let newY = node.data.pos.y - this.getNodeSize(node.data) / 2;
        return {x: newX, y: newY};
    };

    getNodePosition = (nodeUI, pos) => { //UINode
        let newX = nodeUI.node.data.pos.x - this.getNodeSize(nodeUI.node.data) / 2;
        let newY = nodeUI.node.data.pos.y - this.getNodeSize(nodeUI.node.data) / 2;
        nodeUI.position = {x: newX, y: newY};
        nodeUI.attr('transform',
            `translate( ${newX}, ${newY})`);
        //return newPos;
    };

    getNodeSize = (objetWrapper) => {
        //let linksSize = objetWrapper.getLinks().length;
        let linksSize = objetWrapper.getSizeMeasure();
        if (linksSize > MAX_LINKS_SIZE) {
            linksSize = MAX_LINKS_SIZE;
        }

        let nodeSize = MIN_NODE_SIZE + linksSize * (MAX_NODE_SIZE - MIN_NODE_SIZE) / MAX_LINKS_SIZE;
        return nodeSize;

    };

    updateNodesPostitions(nodes) { // just Node
        const anglePerNode = 2 * Math.PI / nodes.length;
        for(let [index, node] of nodes.entries()) {
            node.pos = this._calculateNodePosition(index, anglePerNode);
        }

        return nodes;
    }

    getLayout() {
        return this.layout;
    }

    getSettings() {
        return this.settings;
    }
}
