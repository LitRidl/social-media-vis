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
        this.settings = layoutSettings;
        this.layout = Viva.Graph.Layout.forceDirected(graph, layoutSettings);
        //this.layout.placeNode(this.getNodePosition);
    }

    updateNodesPostitions(nodes) {
        return nodes;
    }

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
