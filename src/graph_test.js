import fetch from "fetch";
import {VivaGraph} from "graph/graph.js";
import $ from "jquery";

const GET_DATA_URL = "/api/messages/all";


init();

function init() {
    let graph = new VivaGraph($("#graph"));

    fetch(GET_DATA_URL)
        .then(res => JSON.parse(res))
        .then(data => graph.addData(data))
        .then(() => graph.render())
        .catch(err => console.log(`Error: ${err.message}`));
}

