//import fetch from "github/fetch";
//import fetch from "whatwg-fetch";
import {VivaGraph, sliders} from "./graph/graph";
import $ from "jquery";
import "./graph/graph.css!"
import {GraphControl} from "./graph_control"
import {makeSlider, initGraphControlButtons} from "./sandbox"
import {UserWrapperNode} from "./model/UserWrapperNode";



//const GET_DATA_URL = "http://localhost:5000/api/messages/all";
const GET_DATA_URL = "http://localhost:5000/api/users/all";

let graph = new VivaGraph(document.getElementById("graph"));
let graphControl = new GraphControl(graph);

if (sliders != null) {
    sliders.forEach((slider) => makeSlider(slider, graphControl));
}

initGraphControlButtons(graphControl);



init();

//promiseDOMready().then(init);
//
//function promiseDOMready() {
//    return new Promise(function(resolve) {
//        if (document.readyState === "complete") return resolve();
//        document.addEventListener("DOMContentLoaded", resolve);
//    });
//}


function init() {

    fetch(GET_DATA_URL)
        .then(res => res.json())
        .then(res => res.result)
        .then(data => drawData(data));
        //.catch(err => console.log(`Error: ${err}`));
}

function drawData(data) {
    console.log(data);

    const nodes = [];

    for(let json of data) {
        let userNode = UserWrapperNode.createFromJson(json);
        nodes.push(userNode);
    }

    graph.addNodes(nodes);
    //graph.render();

}


