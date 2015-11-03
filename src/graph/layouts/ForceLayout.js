'use strict';

import Viva from "vivagraphjs";

const DEFAULT_LAYOUT_PARAMS = {
    springLength: 280,
    springCoeff: 0.0002,
    dragCoeff: 0.02,
    gravity: -1.2
};

const DEFAULT_POSITION = {x:0, y: 0};

const MAX_LINKS_SIZE = 10000;
const DEFAULT_NODE_SIZE = 24;
const MIN_NODE_SIZE = 24;
const MAX_NODE_SIZE = 48;

const sliders = [
    {
        label: 'springLength',
        param: 'springLength',
        min: 1,
        max: 400
    },
    {
        label: 'springCoeff',
        param: 'springCoeff',
        min: 0,
        max: 0.001
    },
    {
        label: 'dragCoeff',
        param: 'dragCoeff',
        min: 0,
        max: 0.1
    },
    {
        label: 'gravity',
        param: 'gravity',
        min: -20,
        max: 20
    }
];

export class ForceLayout {
    constructor(graph, layoutSettings=DEFAULT_LAYOUT_PARAMS) {
        this.graph = graph;
        this.settings = layoutSettings;
        this.layout = Viva.Graph.Layout.forceDirected(graph, layoutSettings);
        //this.layout.placeNode(this.getNodePosition);
    }

    //updateNodesPositions() {
    //    let size = this.graph.getNodesCount();
    //    console.log(`size: ${size}`);
    //
    //    const anglePerNode = 2 * Math.PI / size;
    //
    //    let nodes = [];
    //    this.graph.forEachNode(function(node) {
    //        nodes.push(node);
    //    } );
    //
    //    let radius = size * 20 / Math.PI;
    //    console.log(`Radius: ${radius}`);
    //
    //    for(let [index, node] of nodes.entries()) {
    //        let newPos = this._calculateNodePosition(index, anglePerNode, radius);
    //        this.layout.setNodePosition(node.id, newPos.x, newPos.y);
    //    }
    //
    //}

    //_calculateNodePosition(index, anglePerNode, radius) {
    //    // radius = calculateRadius() //todo fixme by points number?
    //    const currentAngle = index * anglePerNode;
    //    const newX = radius * Math.cos(currentAngle); //todo check
    //    const newY = radius * Math.sin(currentAngle); //todo check
    //
    //    return {x: newX, y: newY};
    //}


    //getNodePosition(node) {
    //    return DEFAULT_POSITION;
    //}
    getNodePosition = (nodeUI, pos) => {
        const newX = pos.x - this.getNodeSize(nodeUI.node.data) / 2;
        const newY = pos.y - this.getNodeSize(nodeUI.node.data) / 2;
        nodeUI.attr('transform',
            `translate( ${newX}, ${newY})`);
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


    getLayout() {
        return this.layout;
    }

    getSettings() {
        return this.settings;
    }
}
