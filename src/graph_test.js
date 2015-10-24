//import fetch from "github/fetch";
//import fetch from "whatwg-fetch";
import {VivaGraph} from "./graph/graph.js";
import $ from "jquery";
import "./graph/graph.css!"

//const GET_DATA_URL = "http://localhost:5000/api/messages/all";
const GET_DATA_URL = "http://localhost:5000/api/users/all";

let graph = new VivaGraph(document.getElementById("graph"));

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
    graph.addData(data);
    //graph.render();

}

