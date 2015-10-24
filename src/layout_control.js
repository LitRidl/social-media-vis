export class LayoutControl {
    constructor(graph) {
        this.graph = graph;
        this.layout = graph.layout;
        this.layoutParams = graph.layoutParams;
    }

    getLayoutParam(layoutParam) {
        return this.layoutParams[layoutParam];
    }

    setLayoutParam(layoutParam, value) {
        this.layoutParams[layoutParam] = value;
    }

    update() {

    }
}
