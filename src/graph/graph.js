import Viva from "vivagraphjs";
import $ from "jquery";
import {User} from "../model/user";

const DEFAULT_NODE_SIZE = 24;
const DEFAULT_LINK_COLOR = 'gray';
const HIGHLIGHT_LINK_COLOR = 'blue';

export class VivaGraph {

    constructor(element) {
        this.nodeSize = DEFAULT_NODE_SIZE;
        this.users = new Map();

        this.graph = Viva.Graph.graph();

        this.graphics = Viva.Graph.View.svgGraphics();

        this.layout = Viva.Graph.Layout.forceDirected(this.graph, {
            springLength: 100,
            springCoeff: 0.0001,
            dragCoeff: 0.02,
            gravity: -1
        });


        this.graphics.node(this.renderNode);
        //this.graphics.placeNode(this.positionNode);

        this.graphics.link(this.renderLink);
        //this.graphics.placeLink(this.positionLink);


        this.renderer = Viva.Graph.View.renderer(this.graph, {
            graphics: this.graphics,
            container: element,
            layout: this.layout
        });

    }

    renderNode(node) {
        let svgGroupElem = Viva.Graph.svg('g');
        let svgText = Viva.Graph.svg('text').attr('y', '-4px').text(node.data.name); //todo remove dependency
        let img = Viva.Graph.svg('image')
            .attr('width', node.data.nodeSize)
            .attr('height', node.data.nodeSize)
            .link(node.data.image_url); //todo remove dependency

        svgGroupElem.append(svgText);
        svgGroupElem.append(img);

        //$(svgGroupElem).hover(function () { // mouse over
        //    highlightRelatedNodes(node.id, true);
        //}, function () { // mouse out
        //    highlightRelatedNodes(node.id, false);
        //});
        return svgGroupElem;
    };

    positionNode(nodeUI, pos) {
        nodeUI.attr('transform',
            `translate( ${pos.x - nodeUI.node.data.nodeSize / 2}, ${pos.y - nodeUI.node.data.nodeSize / 2})`);
    };

    renderLink(link) {
        return Viva.Graph.svg('path')
            .attr('stroke', DEFAULT_LINK_COLOR);
    };

    positionLink(linkUI, fromPos, toPos) {
        let pathSvgElem = 'M' + fromPos.x + ',' + fromPos.y +
            'L' + toPos.x + ',' + toPos.y;

        linkUI.attr("d", pathSvgElem);
    };


    addData(data) {
        for (let row of data) {
            let node = new User(row);

            this.users.set(node.id, node);

            this.addNode(node.id, node);

        }

        //for (let [userId, user] of this.users) {
        //    let friends = user.avl_friends_ids;
        //    for (let friendId of friends) {
        //        if (this.users.has(friendId)) {
        //            this.addLink(userId, friendId);
        //        }
        //    }
        //}
    }

    addNode(nodeId, node) {
        node.nodeSize = this.nodeSize;
        this.graph.addNode(nodeId, node);
    }

    removeNode(nodeId) {
        this.graph.removeNode(nodeId);
    }

    addLink(nodeId1, nodeId2) {
        this.graph.addLink(nodeId1, nodeId2);
    }

    addNodes(nodes) {
        this.graph.beginUpdate();
        for (let node of nodes) {
            this.addNode(node.id, node);
        }

        this.graph.endUpdate();
    }

    //addLinks(links) {
    //
    //}

    render() {
        this.renderer.run();
    }

    //highlightNode(nodeId) {
    //    var ui = this.graphics.getNodeUI(nodeId);
    //    if (prevSelected) {
    //        prevSelected.attr('fill', 'a2e8')
    //    }
    //    prevSelected = ui;
    //    ui.attr('fill', 'orange');
    //}


    highlightRelatedNodes(nodeId, highlight) {
        this.graph.forEachLinkedNode(nodeId, function (node, link) {
            var linkUI = this.graphics.getLinkUI(link.id);
            if (linkUI) {
                linkUI.attr('stroke', highlight ? HIGHLIGHT_LINK_COLOR : DEFAULT_LINK_COLOR);
            }
        });
    }

;

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
            var pos = this.layout.getNodePosition(nodeId);
            this.renderer.moveTo(pos.x, pos.y);

            this.highlightRelatedNodes(nodeId);
        } else {
            this.reset();
        }
    }

    changeLayout() {

    }


}
