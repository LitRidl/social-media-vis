

class Rect {
    constructor ({x1=Number.MAX_VALUE, y1=Number.MAX_VALUE, x2=Number.MIN_VALUE, y2=Number.MIN_VALUE}) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }

    update({x: newX, y: newY}) {
        if (newX < this.x1) { this.x1 = newX; }
        if (newX > this.x2) { this.x2 = newX; }
        if (newY < this.y1) { this.y1 = newY; }
        if (newY > this.y2) { this.y2 = newY; }
    }
}

function merge(target, options) {
    var key;
    if (!target) { target = {}; }
    if (options) {
        for (key in options) {
            if (options.hasOwnProperty(key)) {
                var targetHasIt = target.hasOwnProperty(key),
                    optionsValueType = typeof options[key],
                    shouldReplace = !targetHasIt || (typeof target[key] !== optionsValueType);

                if (shouldReplace) {
                    target[key] = options[key];
                } else if (optionsValueType === 'object') {
                    // go deep, don't care about loops here, we are simple API!:
                    target[key] = merge(target[key], options[key]);
                }
            }
        }
    }

    return target;
}

/**
 * Does not really perform any layouting algorithm but is compliant
 * with renderer interface. Allowing clients to provide specific positioning
 * callback and get static layout of the graph
 *
 * @param {Viva.Graph.graph} graph to layout
 * @param {Object} userSettings
 */
export class VivaConstantLayout {
    constructor(graph, userSettings) {
        this.graph = graph;

        userSettings = merge(userSettings, {
            maxX: 1024,
            maxY: 1024,
            seed: 'Deterministic randomness made me do this'
        });
        this.userSettings = userSettings;

        // This class simply follows API, it does not use some of the arguments:
        this.graphRect = new Rect({});
        this.layoutLinks = {};

        this.layoutNodes = typeof Object.create === 'function' ? Object.create(null) : {};

        this.graph.forEachNode(this.ensureNodeInitialized);
        this.graph.forEachLink(this.ensureLinkInitialized);
        this.graph.on('changed', this.onGraphChanged);

    }

    placeNodeCallback(node) {
        return {
            x: Math.random()*this.userSettings.maxX,
            y: Math.random()*this.userSettings.maxY
        };
    }

    updateGraphRect(position, graphRect) {
        graphRect.update(position);
    }



    ensureNodeInitialized = (node) => {
        this.layoutNodes[node.id] = this.placeNodeCallback(node);
        this.updateGraphRect(this.layoutNodes[node.id], this.graphRect);
    }

    updateNodePositions() {
        if (this.graph.getNodesCount() === 0) { return; }

        this.graphRect = new Rect({});

        this.graph.forEachNode(this.ensureNodeInitialized);
    }

    ensureLinkInitialized = (link) => {
        this.layoutLinks[link.id] = link;
    }

    onGraphChanged = (changes) => {
        for (let i = 0; i < changes.length; ++i) {
            let change = changes[i];
            if (change.node) {
                if (change.changeType === 'add') {
                    this.ensureNodeInitialized(change.node);
                } else {
                    delete this.layoutNodes[change.node.id];
                }
            } if (change.link) {
                if (change.changeType === 'add') {
                    this.ensureLinkInitialized(change.link);
                } else {
                    delete this.layoutLinks[change.link.id];
                }
            }
        }
    }

    //public api

    /**
     * Attempts to layout graph within given number of iterations.
     *
     * @param {integer} [iterationsCount] number of algorithm's iterations.
     *  The constant layout ignores this parameter.
     */
    run(iterationsCount) {
        this.step();
    }

    /**
     * One step of layout algorithm.
     */
    step() {
        this.updateNodePositions();

        return true; // no need to continue.
    }

    /**
     * Returns rectangle structure {x1, y1, x2, y2}, which represents
     * current space occupied by graph.
     */
    getGraphRect() {
        return this.graphRect;
    }

    /**
     * Request to release all resources
     */
    dispose() {
        this.graph.off('change', onGraphChanged);
    }

    /*
     * Checks whether given node is pinned; all nodes in this layout are pinned.
     */
    isNodePinned(node) {
        return true;
    }

    /*
     * Requests layout algorithm to pin/unpin node to its current position
     * Pinned nodes should not be affected by layout algorithm and always
     * remain at their position
     */
    pinNode(node, isPinned) {
        // noop
    }

    /**
     * Returns {from, to} position of a link.
     */
    getLinkPosition(linkId) {
        let link = this.layoutLinks[linkId];
        return {
            from : this.getNodePosition(link.fromId),
            to : this.getNodePosition(link.toId)
        };
    }

    /**
     * Sets position of a node to a given coordinates
     */
    setNodePosition(nodeId, x, y) {
        let pos = this.layoutNodes[nodeId];
        if (pos) {
            pos.x = x;
            pos.y = y;
        }
    }

    // Layout specific methods:

    /**
     * Based on argument either update default node placement callback or
     * attempts to place given node using current placement callback.
     * Setting new node callback triggers position update for all nodes.
     *
     * @param {Object} newPlaceNodeCallbackOrNode - if it is a function then
     * default node placement callback is replaced with new one. Node placement
     * callback has a form of function (node) {}, and is expected to return an
     * object with x and y properties set to numbers.
     *
     * Otherwise if it's not a function the argument is treated as graph node
     * and current node placement callback will be used to place it.
     */
    placeNode(newPlaceNodeCallbackOrNode) {
        if (typeof newPlaceNodeCallbackOrNode === 'function') {
            this.placeNodeCallback = newPlaceNodeCallbackOrNode;
            this.updateNodePositions();
            return this;
        }

        // it is not a request to update placeNodeCallback, trying to place
        // a node using current callback:
        return this.placeNodeCallback(newPlaceNodeCallbackOrNode);
    }

    getNodePosition(nodeId) {
        return this.layoutNodes[nodeId];
    }
}
