'use strict';

const DEFAULT_POSITION = {x:0, y: 0};

export class GraphLayout {
    constructor(graph, layoutSettings={}) {
        this.settings = layoutSettings;
    }

    updateNodesPositions(nodes) {
        return nodes;
    }

    getNodePosition(node) {
        return DEFAULT_POSITION;
    }

    getSettings() {
        return this.settings;
    }
}
