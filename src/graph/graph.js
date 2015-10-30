'use strict';

import Viva from "vivagraphjs";
import $ from "jquery";

import {UserWrapperNode} from "../model/UserWrapperNode";
import {ForceLayout} from "./layouts/ForceLayout";
import {ConstantLayout} from "./layouts/ConstantLayout";

const MAX_LINKS_SIZE = 10000;
const DEFAULT_NODE_SIZE = 24;
const MIN_NODE_SIZE = 24;
const MAX_NODE_SIZE = 48;
const DEFAULT_LINK_COLOR = 'gray';
const HIGHLIGHT_LINK_COLOR = 'blue';

const $nodeInfo = $('#node_info');

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

export class VivaGraph {

    constructor(element) {
        this.paused = false;
        this.nodes = new Map();

        this.graph = Viva.Graph.graph();

        //this.graphics = Viva.Graph.View.svgGraphics();
        this.graphics = Viva.Graph.View.svgGraphics();

        //this.layout = new ForceLayout(this.graph);
        this.layout = new ConstantLayout(this.graph);


        this.createArrowHead();


        this.graphics.node(this.renderNode.bind(this, this.graph, this.graphics, this.layout.getLayout()));
        this.graphics.placeNode(this.positionNode);

        this.graphics.link(this.renderLink);
        this.graphics.placeLink(this.positionLink);


        this.renderer = Viva.Graph.View.renderer(this.graph, {
            graphics: this.graphics,
            container: element,
            layout: this.layout.getLayout(),
        });

        this.renderer.run(50); //todo fixme?

    }

    getNodeSize = (objetWrapper) => {
        //let linksSize = objetWrapper.getLinks().length;
        let linksSize = objetWrapper.getSizeMeasure();
        if (linksSize > MAX_LINKS_SIZE) {
            linksSize = MAX_LINKS_SIZE;
        }

        let nodeSize = MIN_NODE_SIZE + linksSize * (MAX_NODE_SIZE - MIN_NODE_SIZE) / MAX_LINKS_SIZE;
        return nodeSize;

    };

    //highlightRelatedNodes = (nodeId, highlight) => {
    //    graph.forEachLinkedNode(nodeId, function (node, link) {
    //        var linkUI = graphics.getLinkUI(link.id);
    //        if (linkUI) {
    //            linkUI.attr('stroke', highlight ? HIGHLIGHT_LINK_COLOR : DEFAULT_LINK_COLOR);
    //        }
    //    });
    //};

    renderNode = (graph, graphics, layout, node) => {
        let svgGroupElem = Viva.Graph.svg('g');
        let svgText = Viva.Graph.svg('text').attr('y', '-4px').text(node.data.getName());
        let svgImgElem = Viva.Graph.svg('image')
            .attr('width', this.getNodeSize(node.data))
            .attr('height', this.getNodeSize(node.data))
            .link(node.data.getImageUrl());

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
            $nodeInfo.html(node.data.getInfo()); //todo to sandbox
        }, function () { // mouse out
            highlightRelatedNodes(node.id, false);
        });

        svgGroupElem.addEventListener('click', function () {
            // toggle pinned mode
            //layout.pinNode(node, !layout.isNodePinned(node));
            layout.pinNode(node, true);
        });

        let expand = this.expandNode;
        let collapse = this.collapseNode;
        svgGroupElem.addEventListener('dblclick', function () {
            alert(`node pinned: ${layout.isNodePinned(node.id)}`);

            if (node.expanded) {
                node.expanded = false;
                collapse(node);
            } else {
                node.expanded = true;
                expand(node);
            }
        });
        return svgGroupElem;
    };

    positionNode = (nodeUI, pos) => {
        const newX = (pos.x - this.getNodeSize(nodeUI.node.data) / 2);
        const newY = (pos.y - this.getNodeSize(nodeUI.node.data) / 2);
        nodeUI.attr('transform',
            `translate( ${newX}, ${newY})`);
    };


    renderLink(link) {
        return Viva.Graph.svg('path')
            .attr('stroke', DEFAULT_LINK_COLOR)
            .attr('marker-end', 'url(#Triangle)');

    }

    positionLink(linkUI, fromPos, toPos) {

        let geom = Viva.Graph.geom();
        // Here we should take care about
        //  "Links should start/stop at node's bounding box, not at the node center."

        // For rectangular nodes Viva.Graph.geom() provides efficient way to find
        // an intersection point between segment and rectangle
        let toNodeSize = MIN_NODE_SIZE;
        let fromNodeSize = MIN_NODE_SIZE;

        let from = geom.intersectRect(
                // rectangle:
                fromPos.x - fromNodeSize / 2, // left
                fromPos.y - fromNodeSize / 2, // top
                fromPos.x + fromNodeSize / 2, // right
                fromPos.y + fromNodeSize / 2, // bottom
                // segment:
                fromPos.x, fromPos.y, toPos.x, toPos.y)
            || fromPos; // if no intersection found - return center of the node

        let to = geom.intersectRect(
                // rectangle:
                toPos.x - toNodeSize / 2, // left
                toPos.y - toNodeSize / 2, // top
                toPos.x + toNodeSize / 2, // right
                toPos.y + toNodeSize / 2, // bottom
                // segment:
                toPos.x, toPos.y, fromPos.x, fromPos.y)
            || toPos; // if no intersection found - return center of the node

        let pathSvgElem = `M${from.x},${from.y}L${to.x},${to.y}`;

        linkUI.attr("d", pathSvgElem);
    }

    addNode(nodeId, node) {
        var nodeUI = this.graph.addNode(nodeId, node);
        nodeUI.pinned = false;
        return nodeUI;
    }

    removeNode(nodeId) {
        this.graph.removeNode(nodeId);
    }

    addLink(nodeId1, nodeId2) {
        this.graph.addLink(nodeId1, nodeId2);
    }

    addNodes(newNodes) {
        this.graph.beginUpdate();

        this.layout.updateNodesPostitions(newNodes);
        for (let node of newNodes) {
            //node.pinned = false;
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

    expandNode = (node) => {
        //this.graph.beginUpdate();

        let addedNodes = [];
        let links = node.data.getLinks();
        for (let linkNodeId of links) {
            if (!this.nodes.has(linkNodeId)) {
                let simpleUser = UserWrapperNode.createUserPlaceholder(linkNodeId); //todo fixme remove dependency
                simpleUser.setPlaceholder(true);
                simpleUser.getLinks().push(node.id);

                this.addNode(linkNodeId, simpleUser);
                this.nodes.set(linkNodeId, simpleUser);

                addedNodes.push(linkNodeId);
            }
        }

        for (let existingUserNode of this.nodes.values()) {
            if (addedNodes.indexOf(existingUserNode.getId()) == -1) {
                let earlierLinks = existingUserNode.getLinks();
                let newLinks = earlierLinks.filter(x => addedNodes.indexOf(x) != -1);
                for (let newNodeId of newLinks) {
                    this.addLink(existingUserNode.getId(), newNodeId);
                    let newNode = this.nodes.get(newNodeId);
                    //if (existingUserNode.getId() != node.id) {
                    //    newNode.getLinks().push(node.id);
                    //}
                }
            }
        }


        //this.graph.endUpdate();
    };

    collapseNode = (node) => {
        //this.graph.beginUpdate();

        let linkedNodes = node.data.getLinks();

        for (let linkedNodeId of linkedNodes) {
            let linkedNode = this.nodes.get(linkedNodeId);
            if (linkedNode.isPlaceholder()) {
                linkedNode.getLinks().pop(linkedNodeId);

                if (linkedNode.getLinks().length == 0) {
                    this.removeNode(linkedNodeId);
                    this.nodes.delete(linkedNodeId);
                }
            }
        }


        //this.graph.endUpdate();

    };

    deleteNode = (node) => {  //todo fixme low-level removeNode already exists

    };

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
        if (!this.paused) {
            this.paused = true;
            this.renderer.pause();
        } else {
            this.paused = false;
            this.renderer.resume();
        }
    }

    center(nodeId) {
        if (this.graph.getNode(nodeId)) {
            const pos = this.layout.getLayout().getNodePosition(nodeId);
            this.renderer.moveTo(pos.x, pos.y);

            this.highlightRelatedNodes(nodeId);
        } else {
            this.reset();
        }
    }

    changeLayout() {

    }

    createArrowHead() {
        let marker = Viva.Graph.svg('marker')
            .attr('id', 'Triangle')
            .attr('viewBox', "0 0 10 10")
            .attr('refX', "10")
            .attr('refY', "5")
            .attr('markerUnits', "strokeWidth")
            .attr('markerWidth', "10")
            .attr('markerHeight', "5")
            .attr('orient', "auto");

        marker.append('path').attr('d', 'M 0 0 L 10 5 L 0 10 z');

        // Marker should be defined only once in <defs> child element of root <svg> element:
        var defs = this.graphics.getSvgRoot().append('defs');
        defs.append(marker);
    }

}
