import Viva from "vivagraphjs";
import $ from "jquery";

const MAX_LINKS_SIZE = 10000;
const DEFAULT_NODE_SIZE = 24;
const MIN_NODE_SIZE = 24;
const MAX_NODE_SIZE = 96;
const DEFAULT_LINK_COLOR = 'gray';
const HIGHLIGHT_LINK_COLOR = 'blue';

export const sliders = [
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

const DEFAULT_LAYOUT_PARAMS = {
    springLength: 160,
    springCoeff: 0.0002,
    dragCoeff: 0.02,
    gravity: -1.2
};

export class VivaGraph {

    constructor(element) {
        this.nodes = new Map();

        this.graph = Viva.Graph.graph();

        //this.graphics = Viva.Graph.View.svgGraphics();
        this.graphics = Viva.Graph.View.svgGraphics();

        this.layoutParams = DEFAULT_LAYOUT_PARAMS;
        this.layout = Viva.Graph.Layout.forceDirected(this.graph, this.layoutParams);


        this.graphics.node(this.renderNode.bind(this, this.graph, this.graphics, this.layout));
        this.graphics.placeNode(this.positionNode);

        this.graphics.link(this.renderLink);
        this.graphics.placeLink(this.positionLink);


        this.renderer = Viva.Graph.View.renderer(this.graph, {
            graphics: this.graphics,
            container: element,
            layout: this.layout
        });

        this.renderer.run(50);

    }

    getNodeSize = (objetWrapper) => {
        let linksSize = objetWrapper.getLinks().length;
        if (linksSize > MAX_LINKS_SIZE) {
            linksSize = MAX_LINKS_SIZE;
        }

        let nodeSize = MIN_NODE_SIZE + linksSize * (MAX_NODE_SIZE - MIN_NODE_SIZE)/MAX_LINKS_SIZE;
        return nodeSize;

    }

    renderNode = (graph, graphics, layout, node) => {
        let svgGroupElem = Viva.Graph.svg('g');
        let svgText = Viva.Graph.svg('text').attr('y', '-4px').text(node.data.getName()); //todo remove dependency
        let svgImgElem = Viva.Graph.svg('image')
            .attr('width', this.getNodeSize(node.data))
            .attr('height', this.getNodeSize(node.data))
            .link(node.data.getImageUrl()); //todo remove dependency

        svgGroupElem.append(svgText);
        svgGroupElem.append(svgImgElem);

        let highlightRelatedNodes = function (nodeId, highlight) {
            graph.forEachLinkedNode(nodeId, function (node, link) {
                var linkUI = graphics.getLinkUI(link.id);
                if (linkUI) {
                    linkUI.attr('stroke', highlight ? HIGHLIGHT_LINK_COLOR : DEFAULT_LINK_COLOR);
                }
            });
        };


        $(svgGroupElem).hover(function () { // mouse over
            highlightRelatedNodes(node.id, true);
        }, function () { // mouse out
            highlightRelatedNodes(node.id, false);
        });

        svgGroupElem.addEventListener('click', function () {
            // toggle pinned mode
            //layout.pinNode(node, !layout.isNodePinned(node));
            layout.pinNode(node, true);
        });
        return svgGroupElem;
    }

;

    positionNode = (nodeUI, pos) => {
        const newX = (pos.x - this.getNodeSize(nodeUI.node.data) / 2);
        const newY = (pos.y - this.getNodeSize(nodeUI.node.data) / 2);
        nodeUI.attr('transform',
            `translate( ${newX}, ${newY})`);
    }


    renderLink(link) {
        return Viva.Graph.svg('path')
            .attr('stroke', DEFAULT_LINK_COLOR);
    }

    positionLink(linkUI, fromPos, toPos) {
        let pathSvgElem = `M${fromPos.x},${fromPos.y}L${toPos.x},${toPos.y}`;

        linkUI.attr("d", pathSvgElem);
    }

    addNode(nodeId, node) {
        this.graph.addNode(nodeId, node);
    }

    removeNode(nodeId) {
        this.graph.removeNode(nodeId);
    }

    addLink(nodeId1, nodeId2) {
        this.graph.addLink(nodeId1, nodeId2);
    }

    addNodes(newNodes) {
        this.graph.beginUpdate();

        for (let node of newNodes) {
            this.nodes.set(node.getId(), node);

            this.addNode(node.getId(), node);

        }

        for (let [nodeId, node] of this.nodes) {
            let links = node.getLinks();
            for (let linkNodeId of links) {
                if (this.nodes.has(linkNodeId)) {
                    this.addLink(nodeId, linkNodeId);
                }
            }
        }

        this.graph.endUpdate();
    }

    //addLinks(links) {
    //
    //}

    render() {
        this.renderer.rerender();
    }

    //highlightNode(nodeId) {
    //    var ui = this.graphics.getNodeUI(nodeId);
    //    if (prevSelected) {
    //        prevSelected.attr('fill', 'a2e8')
    //    }
    //    prevSelected = ui;
    //    ui.attr('fill', 'orange');
    //}


    highlightNodes(nodesIds) {
        this.graph.beginUpdate();


        this.graph.endUpdate();
    }

    zoomIn() {
        this.renderer.zoomIn();
    }

    zoomOut() {
        this.renderer.zoomOut();
    }

    reset() {
        this.renderer.reset();
    }

    renderPause() {
        this.renderer.pause();
    }

    renderResume() {
        this.renderer.resume();
    }

    center(nodeId) {
        if (this.graph.getNode(nodeId)) {
            const pos = this.layout.getNodePosition(nodeId);
            this.renderer.moveTo(pos.x, pos.y);

            this.highlightRelatedNodes(nodeId);
        } else {
            this.reset();
        }
    }

    changeLayout() {

    }


}
