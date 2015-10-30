'use strict';

export class GraphControl {
    constructor(graph) {
        this.graph = graph;
        this.layoutParams = graph.layout.getSettings();
    }

    getLayoutParam(layoutParam) {
        return this.layoutParams[layoutParam];
    }

    setLayoutParam(layoutParam, value) {
        this.layoutParams[layoutParam] = value;
    }

    zoomIn = () => {
        this.graph.zoomIn();
    };

    zoomOut = () => {
        this.graph.zoomOut();
    };

    pause = () => {
        this.graph.renderPause();
    };

    center = () => {
        this.graph.center();
    };

    reset = () => {
        this.graph.reset();
    };

    update() {

    }
}
