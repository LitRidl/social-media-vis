import * as sandbox from "./sandbox"

import {VivaGraph} from "./graph/graph";

import {DataSource} from "./datasource/datasource";
import {DataStore} from "./datastore/datastore";
import {GraphDatastore} from "./datastore/GraphDatastore";

import {instance as eventsBus} from "./events/EventAggregator";
import * as EventsConst from "./events/EventsConst";
import {Event} from "./events/Event";

import {UserWrapperNode} from "./model/UserWrapperNode";
import {MessageWrapperNode} from "./model/MessageWrapperNode";

export class Application {
    constructor() {
        this.graph = new VivaGraph(document.getElementById("graph"));

        this.datasource = new DataSource();
        this.datastore = new DataStore(this.datasource);

        this.graphDatastore = new GraphDatastore(this.graph);

        this.eventsBus = eventsBus;

        this.initControls();

        this.initEvents();
    }

    initControls() {
        sandbox.addOnClick("#btn_graph_users",
            () => this.eventsBus.publish(EventsConst.TOPIC_CONTROLS,
                new Event(EventsConst.ADD, {type: 'users'})));

        sandbox.addOnClick("#btn_graph_messages",
            () => this.eventsBus.publish(EventsConst.TOPIC_CONTROLS,
                new Event(EventsConst.ADD, {type: 'messages'})));
    }

    initEvents() {

        this.eventsBus.subscribe(EventsConst.TOPIC_CONTROLS, (event) => {

            let eventData = event.getData();

            if (event.type == EventsConst.ADD) {

                if (eventData.type == 'users') {
                    this.loadUsers();
                }

                if (eventData.type == 'messages') {
                    this.loadMessages();
                }

            }

        });

        this.eventsBus.subscribe(EventsConst.TOPIC_CONTROLS_GRAPH, (event) => {

            let eventData = event.getData();

            if (event.type == EventsConst.NODE_HOVER) {
                this.selectNode(eventData.nodeId, eventData.hover);
            }

            if (event.type == EventsConst.NODE_CLICK) {
                this.graph.pinNode(eventData.nodeId, true);
            }

            if (event.type == EventsConst.NODE_DBLCLICK) {
                this.expandCollapseNode(eventData.nodeId);
            }
        });


        this.eventsBus.subscribe(EventsConst.TOPIC_DATA, (event) => {
            let eventData = event.getData();

            if (event.getType() == EventsConst.ADDED) {
                if (eventData.type == 'users') {
                    this.addUsersToGraph(eventData.users);
                }
                if (eventData.type == 'messages') {
                    this.addMessagesToGraph(eventData.messages);
                }
            }

        });


    }

    loadMessages() {
        this.graphDatastore.clear();

        let messages = this.datastore.getMessages();
        this.addMessagesToGraph(messages);
    }

    addMessagesToGraph(messages) {
        let data = messages.map(message =>  MessageWrapperNode.createFromMessage(message));
        this.graphDatastore.add(data);
    }

    loadUsers() {
        this.graphDatastore.clear();

        let users = this.datastore.getUsers();
        this.addUsersToGraph(users);
    }

    addUsersToGraph(users) {
        let data = users.map(user => UserWrapperNode.createFromUser(user));
        this.graphDatastore.add(data);
    }

    selectNode(nodeId, begin) {
        this.graph.highlightRelatedNodes(nodeId, begin);

        if (begin) {
            sandbox.showNodeInfo(this.graph.getNode(nodeId).data.getInfo(), nodeId); //todo fixme
        }
    }

    expandCollapseNode(nodeId) {
        let node = this.graph.getNode(nodeId);
        if (node.expanded) {
            node.expanded = false;
            this.collapseNode(node);
        } else {
            node.expanded = true;
            this.expandNode(node);
        }

    }

    expandNode(node) {
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

    }

    collapseNode(node) {
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

    }

}

