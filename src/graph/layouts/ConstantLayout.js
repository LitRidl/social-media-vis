'use strict';

import Viva from "vivagraphjs";
import {VivaConstantLayout} from "./VivaConstantLayout";

const DEFAULT_SETTINGS = {
    radius: 1000,
    center: {x:0, y:0},
};

const MAX_LINKS_SIZE = 10000;
const DEFAULT_NODE_SIZE = 24;
const MIN_NODE_SIZE = 24;
const MAX_NODE_SIZE = 48;


export class ConstantLayout extends VivaConstantLayout {
    constructor(graph, layoutSettings=DEFAULT_SETTINGS) {
        super(graph);
        this.settings = layoutSettings;
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

    _setRadius(radius) {
        return this.settings.radius = radius;
    }

    placeNodeCallback(node) {
        let newX = node.data.pos.x - this.getNodeSize(node.data) / 2;
        let newY = node.data.pos.y - this.getNodeSize(node.data) / 2;
        return {x: newX, y: newY};
    };

    //getNodePosition = (nodeUI, pos) => { //UINode
    //    let newX = nodeUI.node.data.pos.x - this.getNodeSize(nodeUI.node.data) / 2;
    //    let newY = nodeUI.node.data.pos.y - this.getNodeSize(nodeUI.node.data) / 2;
    //    nodeUI.position = {x: newX, y: newY};
    //    nodeUI.attr('transform',
    //        `translate( ${newX}, ${newY})`);
    //    //return newPos;
    //};

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
        let newRadius = nodes.length * 20 / Math.PI;
        this._setRadius(newRadius);
        const anglePerNode = 2 * Math.PI / nodes.length;
        for(let [index, node] of nodes.entries()) {
            node.pos = this._calculateNodePosition(index, anglePerNode);
        }

        return nodes;
    }

    getLayout() {
        return this;
    }

    getSettings() {
        return this.settings;
    }

    /*
     * Checks whether given node is pinned; all nodes in this layout are pinned.
     */
    isNodePinned(node) {
        return node.pinned;
    }

    /*
     * Requests layout algorithm to pin/unpin node to its current position
     * Pinned nodes should not be affected by layout algorithm and always
     * remain at their position
     */
    pinNode(node, isPinned) {
        node.pinned = isPinned;
    }
}
