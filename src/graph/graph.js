'use strict';

import Viva from "vivagraphjs";
import $ from "jquery";

import {instance as eventsBus} from "../events/EventAggregator";
import * as EventsConst from "../events/EventsConst";
import {Event} from "../events/Event";

import {ForceLayout} from "./layouts/ForceLayout";
import {ConstantLayout} from "./layouts/ConstantLayout";

import {NotFixedLayout} from "./layouts/NotFixedLayout";
import {CircularFixedLayout} from "./layouts/CircularFixedLayout";
import {TimeFixedLayout} from "./layouts/TimeFixedLayout";

import {Rect} from "../utils/Rect";

import * as sandbox from "../sandbox"

const MAX_LINKS_SIZE = 10000;
const DEFAULT_NODE_SIZE = 24;
const MIN_NODE_SIZE = 24;
const MAX_NODE_SIZE = 48;
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

export class VivaGraph {

    constructor(element) {
        this.eventsBus = eventsBus;

        this.paused = false;
        this.nodes = new Map();

        this.graph = Viva.Graph.graph();

        this.graphics = Viva.Graph.View.svgGraphics();

        this.layout = new ForceLayout(this.graph);
        //this.layout = new ConstantLayout(this.graph);
        this.fixedLayout = new NotFixedLayout(this.graph, this.layout.getLayout());
        //this.fixedLayout = new CircularFixedLayout(this.graph, this.layout.getLayout());


        this.createArrowHead();


        this.graphics.node(this.renderNode.bind(this, this.graph, this.graphics, this.layout.getLayout(), this.eventsBus));
        this.graphics.placeNode(this.positionNode);

        this.graphics.link(this.renderLink);
        this.graphics.placeLink(this.positionLink);


        this.renderer = Viva.Graph.View.renderer(this.graph, {
            graphics: this.graphics,
            container: element,
            layout: this.layout.getLayout(),
        });

        this.eventsBus = eventsBus;

        this.initControls();

        this.initEvents();

        this.renderer.run(50); //todo fixme?


    }

    initControls() {
        sandbox.addOnClick("#btn_graph_zoom_in",
            () => this.eventsBus.publish(EventsConst.TOPIC_CONTROLS_GRAPH,
                new Event(EventsConst.ZOOM_IN, {})));

        sandbox.addOnClick("#btn_graph_zoom_out",
            () => this.eventsBus.publish(EventsConst.TOPIC_CONTROLS_GRAPH,
                new Event(EventsConst.ZOOM_OUT, {})));

        sandbox.addOnClick("#btn_graph_center",
            () => this.eventsBus.publish(EventsConst.TOPIC_CONTROLS_GRAPH,
                new Event(EventsConst.CENTER, {})));

        sandbox.addOnClick("#btn_graph_pause",
            () => this.eventsBus.publish(EventsConst.TOPIC_CONTROLS_GRAPH,
                new Event(EventsConst.PAUSE, {})));

        sandbox.addOnClick('#btn_layout_dynamic',
            () => this.eventsBus.publish(EventsConst.TOPIC_CONTROLS_GRAPH,
                new Event(EventsConst.CHANGE_LAYOUT, { layout: "None" })));

        sandbox.addOnClick('#btn_layout_circle',
            () => this.eventsBus.publish(EventsConst.TOPIC_CONTROLS_GRAPH,
                new Event(EventsConst.CHANGE_LAYOUT,  { layout: "Circular" })));

        sandbox.addOnClick('#btn_layout_time',
            () => this.eventsBus.publish(EventsConst.TOPIC_CONTROLS_GRAPH,
                new Event(EventsConst.CHANGE_LAYOUT, { layout: "Time" })));

        //sandbox.addOnClick(graphControl.nodeDelete); //todo after load node info?
    }

    initEvents() {

        this.eventsBus.subscribe(EventsConst.TOPIC_CONTROLS_GRAPH, (event) => {
            if (event.type == EventsConst.ZOOM_IN) {
                this.zoomIn();
            }
            if (event.type == EventsConst.ZOOM_OUT) {
                this.zoomOut();
            }
            if (event.type == EventsConst.CENTER) {
                this.center();
                //this.graph.reset();
            }
            if (event.type == EventsConst.PAUSE) {
                this.renderPause();
            }
            if (event.type == EventsConst.CHANGE_LAYOUT) {
                this.changeLayout(event.getData().layout)
            }
        });

    }


    getNodesCount() {
        let nodes = [];
        this.graph.forEachNode(node => nodes.push(node));

        return nodes.length;
    }

    getNodesCount2() {
        return this.nodes.size;
    }

    getLinksCount() {
        let links = [];
        this.graph.forEachLink(link => links.push(link));

        return links.length;

    }

    getNode = (nodeId) => {
        return this.graph.getNode(nodeId);
    }

    pinNode = (nodeId, pin) => {
        let node = this.getNode(nodeId);
        this.layout.getLayout().pinNode(node, pin);
    }

    getSizeMeasure = (node) => {
        return node.type == 'user' ? node.originalObject.followers_count : 0.0;
    }


    getNodeSize = (objetWrapper) => {
        //let linksSize = objetWrapper.getLinks().length;
        let linksSize = this.getSizeMeasure(objetWrapper);
        if (linksSize > MAX_LINKS_SIZE) {
            linksSize = MAX_LINKS_SIZE;
        }

        let nodeSize = MIN_NODE_SIZE + linksSize * (MAX_NODE_SIZE - MIN_NODE_SIZE) / MAX_LINKS_SIZE;
        return nodeSize;

    };

    highlightRelatedNodes = (nodeId, highlight) => {
        let graphics = this.graphics;
        this.graph.forEachLinkedNode(nodeId, function (node, link) {
            let linkUI = graphics.getLinkUI(link.id);
            if (linkUI) {
                linkUI.attr('stroke', highlight ? HIGHLIGHT_LINK_COLOR : DEFAULT_LINK_COLOR);
            }
        });
    };

    renderNode = (graph, graphics, layout, eventsBus, node) => {
        let svgGroupElem = Viva.Graph.svg('g');
        let svgText = Viva.Graph.svg('text').attr('y', '-4px').text(node.data.getText());
        let svgImgElem = Viva.Graph.svg('image')
            .attr('width', this.getNodeSize(node.data))
            .attr('height', this.getNodeSize(node.data))
            .link(node.data.getImageUrl());

        svgGroupElem.append(svgText);
        svgGroupElem.append(svgImgElem);

        $(svgGroupElem).hover(function () { // mouse over
            eventsBus.publish(EventsConst.TOPIC_CONTROLS, new Event(EventsConst.NODE_HOVER, {hover: true, nodeId: node.id}));
        }, function () { // mouse out
            eventsBus.publish(EventsConst.TOPIC_CONTROLS, new Event(EventsConst.NODE_HOVER, {hover: false, nodeId: node.id}));
        });

        svgGroupElem.addEventListener('click', function () {
            eventsBus.publish(EventsConst.TOPIC_CONTROLS, new Event(EventsConst.NODE_CLICK, {nodeId: node.id}));
        });

        svgGroupElem.addEventListener('dblclick', function () {
            eventsBus.publish(EventsConst.TOPIC_CONTROLS, new Event(EventsConst.NODE_DBLCLICK, {nodeId: node.id}));
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
        //node.isPinned = true;
        let nodeUI = this.graph.addNode(nodeId, node);
        this.nodes.set(nodeId, node);
        //nodeUI.pinned = false;
        return nodeUI;
    }

    removeNode(nodeId) {
        this.graph.removeNode(nodeId);
        this.nodes.delete(nodeId);
    }

    addLink(nodeId1, nodeId2) {
        this.graph.addLink(nodeId1, nodeId2);
    }


    addNodes(newNodes) {
        this.graph.beginUpdate();


        let graphRect = new Rect({});
        for (let node of newNodes) {
            //node.pinned = false;
            this.nodes.set(node.getId(), node);

            node.isPinned = true; //TODO fixme pin nodes only for layout
            let nodeUI = this.addNode(node.getId(), node);

            graphRect.update(this.layout.getLayout().getNodePosition(nodeUI.id));
            //console.log(`${this.layout.getLayout().getNodePosition(nodeUI.id)}`);
        }
        this.fixedLayout.updateNodesPositions();
        //this.fitToScreen(graphRect);

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

    fitToScreen(graphRect) {
        let center = graphRect.calculateCenter();
        this.renderer.moveTo(center.x, center.y);
        let zoomOutCount = this.graph.getNodesCount() / 16;
        for (let i = 0; i < zoomOutCount; ++i) {
            this.zoomOut();
        }
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

    deleteNode = (nodeId) => {  //todo fixme low-level removeNode already exists
        console.log(`deleting node ${nodeId}`);
        this.graph.removeNode(nodeId);

        this.nodes.delete(nodeId);


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

    changeLayout = (layout) => {
        if (layout == 'None') {
            this.fixedLayout = new NotFixedLayout(this.graph, this.layout.getLayout());
        }

        if (layout == 'Circular') {
            this.fixedLayout = new CircularFixedLayout(this.graph, this.layout.getLayout());
        }

        if (layout == 'Time') {
            this.fixedLayout = new TimeFixedLayout(this.graph, this.layout.getLayout());
        }

        this.fixedLayout.updateNodesPositions();

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

    clear() {
        //this.graph.clear(); //error

        this.graph.beginUpdate();

        this.graph.forEachNode((node) => this.deleteNode(node.id));

        this.graph.endUpdate();
    }
}
