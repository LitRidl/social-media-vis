"use strict";
var mapPanel = document.getElementById("map");
var mapTab = document.getElementById("map_tab");
var cyPanel = document.getElementById("cy");
var cyTab = document.getElementById("cy_tab");
var map;
var cy;

function switchToGraph() {
    if (!cyTab.classList.contains('active')) {
        mapPanel.style.display = 'none';
        mapTab.classList.toggle('active');
        cyPanel.style.display = 'block';
        cyTab.classList.toggle('active');
        //cy.resize();
        resize();
    }

}

function switchToMap() {
    if (!mapTab.classList.contains('active')) {
        cyPanel.style.display = 'none';
        cyTab.classList.toggle('active');
        mapPanel.style.display = 'block';
        mapTab.classList.toggle('active');
        //map.invalidateSize();
        resize();
    }
}


$(window).resize(function () {
    sizeLayerControl();
});

$("#about-btn").click(function () {
    $("#aboutModal").modal("show");
    $(".navbar-collapse.in").collapse("hide");
    return false;
});

$("#full-extent-btn").click(function () {
    map.fitBounds(boroughs.getBounds());
    $(".navbar-collapse.in").collapse("hide");
    return false;
});

$("#legend-btn").click(function () {
    $("#legendModal").modal("show");
    $(".navbar-collapse.in").collapse("hide");
    return false;
});

function resize() {
    map.invalidateSize();
    cy.resize();
}
$("#list-btn").click(function () {
    $('#sidebar').toggle();
    resize();
    return false;
});

$("#sidebar-toggle-btn").click(function () {
    $("#sidebar").toggle();
    resize();
    return false;
});

$("#sidebar-hide-btn").click(function () {
    $('#sidebar').hide();
    resize();
});

function sizeLayerControl() {
    $(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
}

/* Basemap Layers */
var mapquestOSM = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png", {
    maxZoom: 19,
    subdomains: ["otile1", "otile2", "otile3", "otile4"],
    attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA.'
});
var mapquestOAM = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
    maxZoom: 18,
    subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
    attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
});
var mapquestHYB = L.layerGroup([L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
    maxZoom: 18,
    subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"]
}), L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/hyb/{z}/{x}/{y}.png", {
    maxZoom: 19,
    subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
    attribution: 'Labels courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
})]);


/* Single marker cluster layer to hold all clusters */
var markerClusters = new L.MarkerClusterGroup({
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    disableClusteringAtZoom: 16
});

map = L.map("map", {
    zoom: 10,
    center: [40.702222, -73.979378],
    layers: [mapquestOSM, markerClusters],
    zoomControl: false,
    attributionControl: false
});

var attributionControl = L.control({
    position: "bottomright"
});

attributionControl.onAdd = function (map) {
    var div = L.DomUtil.create("div", "leaflet-control-attribution");
    div.innerHTML = "<span class='hidden-xs'>Developed by <a href='http://bryanmcbride.com'>bryanmcbride.com</a> | </span><a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
    return div;
};
map.addControl(attributionControl);

var zoomControl = L.control.zoom({
    position: "bottomright"
}).addTo(map);

var baseLayers = {
    "Street Map": mapquestOSM,
    "Aerial Imagery": mapquestOAM,
    "Imagery with Streets": mapquestHYB
};

var layerControl = L.control.groupedLayers(baseLayers, {}).addTo(map);

/* Highlight search box text on click */
$("#searchbox").click(function () {
    $(this).select();
});

/* Prevent hitting enter from refreshing the page */
$("#searchbox").keypress(function (e) {
    if (e.which == 13) {
        e.preventDefault();
    }
});

// Leaflet patch to make layer control scrollable on touch browsers
var container = $(".leaflet-control-layers")[0];
if (!L.Browser.touch) {
    L.DomEvent
        .disableClickPropagation(container)
        .disableScrollPropagation(container);
} else {
    L.DomEvent.disableClickPropagation(container);
}

$(function () { // on dom ready

// photos from flickr with creative commons license

    cy = cytoscape({
        container: document.getElementById('cy'),

        style: cytoscape.stylesheet()
            .selector('node')
            .css({
                'height': 80,
                'width': 80,
                'background-fit': 'cover',
                'border-color': '#000',
                'border-width': 3,
                'border-opacity': 0.5
            })
            .selector('edge')
            .css({
                'width': 6,
                'target-arrow-shape': 'triangle',
                'line-color': '#ffaaaa',
                'target-arrow-color': '#ffaaaa'
            })
            .selector('#bird')
            .css({
                'background-image': 'https://farm8.staticflickr.com/7272/7633179468_3e19e45a0c_b.jpg'
            })
            .selector('#cat')
            .css({
                'background-image': 'https://farm2.staticflickr.com/1261/1413379559_412a540d29_b.jpg'
            })
            .selector('#ladybug')
            .css({
                'background-image': 'https://farm4.staticflickr.com/3063/2751740612_af11fb090b_b.jpg'
            })
            .selector('#aphid')
            .css({
                'background-image': 'https://farm9.staticflickr.com/8316/8003798443_32d01257c8_b.jpg'
            })
            .selector('#rose')
            .css({
                'background-image': 'https://farm6.staticflickr.com/5109/5817854163_eaccd688f5_b.jpg'
            })
            .selector('#grasshopper')
            .css({
                'background-image': 'https://farm7.staticflickr.com/6098/6224655456_f4c3c98589_b.jpg'
            })
            .selector('#plant')
            .css({
                'background-image': 'https://farm1.staticflickr.com/231/524893064_f49a4d1d10_z.jpg'
            })
            .selector('#wheat')
            .css({
                'background-image': 'https://farm3.staticflickr.com/2660/3715569167_7e978e8319_b.jpg'
            }),

        elements: {
            nodes: [
                {data: {id: 'cat'}},
                {data: {id: 'bird'}},
                {data: {id: 'ladybug'}},
                {data: {id: 'aphid'}},
                {data: {id: 'rose'}},
                {data: {id: 'grasshopper'}},
                {data: {id: 'plant'}},
                {data: {id: 'wheat'}}
            ],
            edges: [
                {data: {source: 'cat', target: 'bird'}},
                {data: {source: 'bird', target: 'ladybug'}},
                {data: {source: 'bird', target: 'grasshopper'}},
                {data: {source: 'grasshopper', target: 'plant'}},
                {data: {source: 'grasshopper', target: 'wheat'}},
                {data: {source: 'ladybug', target: 'aphid'}},
                {data: {source: 'aphid', target: 'rose'}}
            ]
        },

        layout: {
            name: 'breadthfirst',
            directed: true,
            padding: 10
        }
    }); // cy init


}); // on dom ready
