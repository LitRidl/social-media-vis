//import fetch from "github/fetch";
//import fetch from "whatwg-fetch";
import {VivaGraph, sliders} from "./graph/graph";
import $ from "jquery";
import "./graph/graph.css!"
import {LayoutControl} from "./layout_control"
import {makeSlider} from "./sandbox"
import {UserWrapperNode} from "./model/UserWrapperNode";



//const GET_DATA_URL = "http://localhost:5000/api/messages/all";
const GET_DATA_URL = "http://localhost:5000/api/users/all";

let graph = new VivaGraph(document.getElementById("graph"));
let layoutControl = new LayoutControl(graph);

if (sliders != null) {
    sliders.forEach((slider) => makeSlider(slider, layoutControl));
}


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

    for(let user of data) {
        var userNode = UserWrapperNode.create(user);
        nodes.push(userNode);
    }

    graph.addNodes(nodes);
    //graph.render();

}


