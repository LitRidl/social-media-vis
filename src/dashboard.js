"use strict";
//import 'bootstrap/css/bootstrap.css!';
import 'bootstrap-daterangepicker/daterangepicker.css!';
//import 'styles/styles.css!';
//import 'styles/dashboard.css!';
import 'leaflet/dist/leaflet.css!';
import 'dc/dc.css!';
import $ from "jquery";
import moment from "moment";
import d3 from "d3";
import L from "leaflet";
import cytoscape from "cytoscape";
import dc from "dc";
import daterangepicker from "bootstrap-daterangepicker";
import * as lhash from "leaflet-hash";
import * as lmarkercluster from "leaflet.markercluster";
import * as ctxmenu from "cytoscape-cxtmenu";
import * as qtip from "qtip2";
import * as cytoqtip from "cytoscape-qtip";
import * as Autolinker from "autolinker";
//import * as Raphael from "raphael";
//import * as RaphaelIcon from "src/L.RaphaelIcon.js";

var GREEN = "green";
var RED = "red";
var BLUE = "teal";
var ORANGE = "orange";
var MAGENTA = "purple";

var ru_RU = {
    "decimal": ",",
    "thousands": "\xa0",
    "grouping": [3],
    "currency": ["", " руб."],
    "dateTime": "%A, %e %B %Y г. %X",
    "date": "%d.%m.%Y",
    "time": "%H:%M:%S",
    "periods": ["AM", "PM"],
    "days": ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"],
    "shortDays": ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
    "months": ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
    "shortMonths": ["Янв.", "Фев.", "Март", "Апр.", "Май", "Июнь", "Июль", "Авг.", "Сент.", "Окт.", "Ноя.", "Дек."]
};
var RU = d3.locale(ru_RU);

var ruDateFormat = RU.timeFormat("%B %Y");
var ruDateTimeFormat = RU.timeFormat("%H:%M %d.%m.%Y");

var colorScale = d3.scale.ordinal().range([RED, BLUE, GREEN]);
var timeFormat = d3.time.format.iso;
var parseDate = d3.time.format("%m/%d/%Y").parse;


var dashboard;
var dataSource;

var refreshDataState = false;
var refreshInterval;


var maxDownloadedDateTime = '';
var startDate = moment("2015-04-01"); //.subtract(29, 'days');	// 30 days ago
var endDate = moment("2015-05-01"); // today

var spinnerOpts = {
    lines: 13 // The number of lines to draw
        ,
    length: 28 // The length of each line
        ,
    width: 14 // The line thickness
        ,
    radius: 42 // The radius of the inner circle
        ,
    scale: 1 // Scales overall size of the spinner
        ,
    corners: 1 // Corner roundness (0..1)
        ,
    color: '#000' // #rgb or #rrggbb or array of colors
        ,
    opacity: 0.25 // Opacity of the lines
        ,
    rotate: 0 // The rotation offset
        ,
    direction: 1 // 1: clockwise, -1: counterclockwise
        ,
    speed: 1 // Rounds per second
        ,
    trail: 60 // Afterglow percentage
        ,
    fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
        ,
    zIndex: 2e9 // The z-index (defaults to 2000000000)
        ,
    className: "spinner" // The CSS class to assign to the spinner
        ,
    top: "50%" // Top position relative to parent
        ,
    left: "50%" // Left position relative to parent
        ,
    shadow: false // Whether to render a shadow
        ,
    hwaccel: false // Whether to use hardware acceleration
        ,
    position: "absolute" // Element positioning
};

var layout;

var graphLayouts = Object.create(null);

graphLayouts.cola = {
    name: 'cola',

    animate: true, // whether to show the layout as it's running
    refresh: 1, // number of ticks per frame; higher is faster but more jerky
    maxSimulationTime: 5000, // max length in ms to run the layout
    ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
    fit: false, // on every layout reposition of nodes, fit the viewport
    padding: 30, // padding around the simulation
    boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }

    // layout event callbacks
    ready: function () {}, // on layoutready
    stop: function () {}, // on layoutstop

    // positioning options
    randomize: false, // use random node positions at beginning of layout
    avoidOverlap: true, // if true, prevents overlap of node bounding boxes
    handleDisconnected: true, // if true, avoids disconnected components from overlapping
    //nodeSpacing: function (node) {
    //    return 10;
    //}, // extra spacing around nodes
    flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
    alignment: undefined, // relative alignment constraints on nodes, e.g. function( node ){ return { x: 0, y: 1 } }

    // different methods of specifying edge length
    // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
    edgeLength: undefined, // sets edge length directly in simulation
    edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
    edgeJaccardLength: undefined, // jaccard edge length in simulation

    // iterations of cola algorithm; uses default values on undefined
    unconstrIter: undefined, // unconstrained initial layout iterations
    userConstIter: undefined, // initial layout iterations with user-specified constraints
    allConstIter: undefined, // initial layout iterations with all constraints including non-overlap

    edgeLengthVal: 10,
    nodeSpacing: 20,
    sliders: [{
                label: 'Длинна ребер',
                param: 'edgeLengthVal',
                min: 1,
                max: 200
            },

            {
                label: 'Расстояние между вершинами',
                param: 'nodeSpacing',
                min: 1,
                max: 50
            }
        ]
        // infinite layout options
        //infinite: true // overrides all other options for a forces-all-the-time mode
};


graphLayouts.concentric = {
    name: 'concentric',

    fit: true, // whether to fit the viewport to the graph
    padding: 30, // the padding on fit
    startAngle: 3 / 2 * Math.PI, // the position of the first node
    counterclockwise: false, // whether the layout should go counterclockwise/anticlockwise (true) or clockwise (false)
    minNodeSpacing: 30, // min spacing between outside of nodes (used for radius adjustment)
    boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
    //height: undefined, // height of layout area (overrides container height)
    //width: undefined, // width of layout area (overrides container width)
    concentric: function (node) { // returns numeric value for each node, placing higher nodes in levels towards the centre
        return node.degree();
    },
    levelWidth: function (nodes) { // the variation of concentric values in each level
        return nodes.maxDegree() / 4;
    },
    animate: true, // whether to transition the node positions
    animationDuration: 5000 // duration of animation in ms if enabled
};

graphLayouts.breadthfirst = {
    name: 'breadthfirst',
    directed: false,
    padding: 30,
    fit: true, // whether to fit to viewport
    //circle: true,
    //maximalAdjustments: 100,
    animate: true,
    //spacingFactor: 1,
    animationDuration: 500,
    avoidOverlap: true
};

graphLayouts.grid = {
    name: 'grid',

    fit: true, // whether to fit the viewport to the graph
    padding: 30, // padding used on fit
    boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
    rows: undefined, // force num of rows in the grid
    columns: undefined, // force num of cols in the grid
    position: function (node) {}, // returns { row, col } for element
    sort: undefined, // a sorting function to order the nodes; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
    animate: true, // whether to transition the node positions
    animationDuration: 1500, // duration of animation in ms if enabled
    ready: undefined, // callback on layoutready
    stop: undefined // callback on layoutstop
};

graphLayouts.none = {
    name: 'null',

};

graphLayouts.random = {
    name: 'random',
    padding: 30,
    fit: true, // whether to fit to viewport
    animate: true,
    animationDuration: 5000,
    avoidOverlap: true
};

graphLayouts.cose = {
    name: 'cose',
    directed: true,
    padding: 40,
    refresh: 40,
    animate: true,
    animationDuration: 4000,
    fit: true, // whether to fit to viewport
    avoidOverlap: true,

    randomize: true,

    // Whether to use the JS console to print debug messages
    debug: false,

    // Node repulsion (non overlapping) multiplier
    nodeRepulsion: 400000,

    // Node repulsion (overlapping) multiplier
    nodeOverlap: 10,

    // Ideal edge (non nested) length
    idealEdgeLength: 50,

    // Divisor to compute edge forces
    edgeElasticity: 100,

    // Nesting factor (multiplier) to compute ideal edge length for nested edges
    nestingFactor: 5,

    // Gravity force (constant)
    gravity: 10,

    // Maximum number of iterations to perform
    numIter: 100,

    // Initial temperature (maximum node displacement)
    initialTemp: 200,

    // Cooling factor (how the temperature is reduced between consecutive iterations
    coolingFactor: 0.95,

    // Lower temperature threshold (below this point the layout will end)
    minTemp: 1.0
};

graphLayouts.arbor = {
    name: 'arbor',

    animate: true, // whether to show the layout as it's running
    maxSimulationTime: 4000, // max length in ms to run the layout
    fit: true, // on every layout reposition of nodes, fit the viewport
    padding: 30, // padding around the simulation
    boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    ungrabifyWhileSimulating: false, // so you can't drag nodes during layout

    // callbacks on layout events
    ready: undefined, // callback on layoutready
    stop: undefined, // callback on layoutstop

    // forces used by arbor (use arbor default on undefined)
    repulsion: undefined,
    stiffness: undefined,
    friction: undefined,
    gravity: true,
    fps: undefined,
    precision: undefined,

    // static numbers or functions that dynamically return what these
    // values should be for each element
    // e.g. nodeMass: function(n){ return n.data('weight') }
    nodeMass: undefined,
    edgeLength: undefined,

    stepSize: 0.1, // smoothing of arbor bounding box

    // function that returns true if the system is stable to indicate
    // that the layout can be stopped
    stableEnergy: function (energy) {
        var e = energy;
        return (e.max <= 0.5) || (e.mean <= 0.3);
    },

    // infinite layout options
    infinite: false // overrides all other options for a forces-all-the-time mode
};

graphLayouts.springy = {
    name: 'springy',

    animate: true, // whether to show the layout as it's running
    maxSimulationTime: 4000, // max length in ms to run the layout
    ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
    fit: true, // whether to fit the viewport to the graph
    padding: 30, // padding on fit
    boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    random: false, // whether to use random initial positions
    infinite: false, // overrides all other options for a forces-all-the-time mode
    ready: undefined, // callback on layoutready
    stop: undefined, // callback on layoutstop

    // springy forces
    stiffness: 400,
    repulsion: 400,
    damping: 0.5,

    avoidOverlap: true
};

graphLayouts.spread = {
    name: 'spread',

    animate: true, // whether to show the layout as it's running
    ready: undefined, // Callback on layoutready
    stop: undefined, // Callback on layoutstop
    fit: true, // Reset viewport to fit default simulationBounds
    minDist: 20, // Minimum distance between nodes
    padding: 20, // Padding
    expandingFactor: -1.0, // If the network does not satisfy the minDist
    // criterium then it expands the network of this amount
    // If it is set to -1.0 the amount of expansion is automatically
    // calculated based on the minDist, the aspect ratio and the
    // number of nodes
    maxFruchtermanReingoldIterations: 50, // Maximum number of initial force-directed iterations
    maxExpandIterations: 4, // Maximum number of expanding iterations
    boundingBox: undefined // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
};


graphLayouts.circle = {
    name: 'circle',
    directed: true,
    padding: 10,
    fit: true, // whether to fit to viewport
    //startAngle: 3 / 2 * Math.PI,
    //counterclockwise: false,
    //minNodeSpacing: 10,
    animate: true,
    animationDuration: 4000,
    avoidOverlap: true
        //concentric: function (node) { // returns numeric value for each node, placing higher nodes in levels towards the centre
        //    return node.degree();
        //},
        //levelWidth: function (nodes) { // the variation of concentric values in each level
        //    return nodes.maxDegree() / 4;
        //}
};

var fromToLimit = -1;
var fromToSkip = 0;
var fromToInterval;


init(startDate, endDate);


function initDateRangePicker() {
    var range = $('#daterange');

    // Show the dates in the range input
    range.val(startDate.format('MM/DD/YYYY') + ' - ' + endDate.format('MM/DD/YYYY'));


    range.daterangepicker({
            startDate: startDate.toDate(),
            endDate: endDate.toDate(),
            language: "ru-RU",
            locale: {
                format: 'YYYY-MM-DD'
            },
            ranges: {
                'Сегодня': [moment(), moment()],
                'Вчера': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Последние 7 дней': [moment().subtract(6, 'days'), moment()],
                'Последние 30 дней': [moment().subtract(29, 'days'), moment()],
                'Этот месяц': [moment().startOf('month'), moment().endOf('month')],
                'Прошлый Месяц': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        },
        function (start, end, label) {
            startDate = moment(start);
            endDate = moment(end);
            loadInitialData(startDate, endDate);
        });
}

initDateRangePicker();

var map;
var cy;

var sentTab = $("#tab_sent");
var mapTab = $("#tab_map");
var graphTab = $("#tab_graph");
var sentPanel = $("#sent");
var mapPanel = $("#map");
var graphPanel = $("#graph");

var btnReset = $("#btn_reset");
var btnRefresh = $("#btn_refresh");
var btnDownload = $("#btn_download");

var btnLayoutGrid = $("#btn_layout_grid");
var btnLayoutSpread = $("#btn_layout_spread");
var btnLayoutCircle = $("#btn_layout_circle");
var btnLayoutBreadthfirst = $("#btn_layout_breadthfirst");
var btnLayoutConcentric = $("#btn_layout_concentric");
var btnLayoutCose = $("#btn_layout_cose");
var btnLayoutNone = $("#btn_layout_none");

var btnTableSortByDate = $("#table_sort_by_date");
var btnTableSortByRetweets = $("#table_sort_by_retweets");
var btnTableSortByFavorites = $("#table_sort_by_favorites");

btnTableSortByDate.click(sortByDate);
btnTableSortByRetweets.click(sortByRetweets);
btnTableSortByFavorites.click(sortByFavorites);

btnLayoutGrid.click(function () {
    changeLayout('grid')
});
btnLayoutSpread.click(function () {
    changeLayout('spread')
});
btnLayoutCircle.click(function () {
    changeLayout('circle')
});
btnLayoutBreadthfirst.click(function () {
    changeLayout('breadthfirst')
});
btnLayoutConcentric.click(function () {
    changeLayout('concentric')
});
btnLayoutCose.click(function () {
    changeLayout('cose')
});
btnLayoutNone.click(function () {
    changeLayout('none')
});

sentTab.click(switchToSent);
mapTab.click(switchToMap);
graphTab.click(switchToGraph);


btnReset.click(resetCharts);
btnRefresh.click(refreshDataClick);
btnDownload.click(downloadNewClick);

var currentLayout = graphLayouts.circle;

var $graphControl = $('#graph_control');
//var $sliders = $('<div class="sliders"></div>');
//$graphControl.append( $sliders );

function resetCharts() {
    dc.filterAll();
    dc.renderAll();
}

function refreshDataClick() {
    btnRefresh.toggleClass('active');
    refreshDataSwitch();
}

function downloadNewClick() {
    httpGet('api/messages/download_new');
}

function switchToSent() {
    dashboard.tab = "sent";
    if (!sentTab.hasClass('active')) {
        mapTab.removeClass('active');
        graphTab.removeClass('active');
        sentTab.addClass('active');

        mapPanel.css('display', 'none');
        graphPanel.css('display', 'none');
        sentPanel.css('display', 'block');
        //cy.resize();
        resize();
    }

}

function switchToGraph() {
    dashboard.tab = "graph";
    if (!graphTab.hasClass('active')) {
        mapTab.removeClass('active');
        graphTab.addClass('active');
        sentTab.removeClass('active');

        mapPanel.css('display', 'none');
        graphPanel.css('display', 'block');
        sentPanel.css('display', 'none');
        //cy.resize();
        //resize();
    }
    loadGraphData(startDate, endDate);
}

function switchToMap() {
    dashboard.tab = "map";
    if (!mapTab.hasClass('active')) {
        mapTab.addClass('active');
        graphTab.removeClass('active');
        sentTab.removeClass('active');

        mapPanel.css('display', 'block');
        graphPanel.css('display', 'none');
        sentPanel.css('display', 'none');
        //map.invalidateSize();
        populateMap(dataSource.messagesCache);
        resize();
    }
}


function resize() {
    if (dashboard.tab == "map") {
        resizeMap();
    }
    if (dashboard.tab == "graph") {
        resizeGraph();
    }

}

function resizeMap() {
    map.invalidateSize();
}

function resizeGraph() {
    cy.resize();
    cy.center();
    //cy.fit();
    //cy.forceRender()
}

function changeLayout(layout) {
    var newLayout = graphLayouts[layout];
    currentLayout = newLayout;

    cy.layout(newLayout);

    removeSliders();

    if (newLayout.sliders != null) {
        newLayout.sliders.forEach(makeSlider);
    }
}

function makeSlider(sliderParams) {
    var $input = $('<input></input>');
    var $param = $('<div class="param"></div>');

    $param.append('<span class="label label-default">' + sliderParams.label + '</span>');
    $param.append($input);

    $graphControl.append($param);

    var p = $input.slider({
        min: sliderParams.min,
        max: sliderParams.max,
        value: currentLayout[sliderParams.param]
    }).on('slide', _.debounce(function () {
        currentLayout[sliderParams.param] = p.getValue();

        if (layout != null) {
            layout.stop();
        }
        //currentLayout.randomize = false;
        currentLayout.edgeLength = function (e) {
            return currentLayout.edgeLengthVal / e.data('weight');
        };

        var layout = cy.makeLayout(currentLayout);
        layout.run();
    }, 50)).data('slider');
}

function removeSliders() {
    $(".param").remove();
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


var httpGet = function (aUrl, aCallback) {
    var anHttpRequest = new XMLHttpRequest();
    anHttpRequest.onreadystatechange = function () {
        if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200 && typeof aCallback == "function")
            aCallback(anHttpRequest.responseText);
    };

    anHttpRequest.open("GET", aUrl, true);
    anHttpRequest.send(null);
};

function downloadNewData() {
    console.log("start refresh");

    var url = 'api/messages/since/' + maxDownloadedDateTime;
    d3.json(url, function (json) {
        console.log("start add new data");
        var newData = json.result;
        dataSource.add(newData);
    });
}


function refreshDataSwitch() {
    refreshDataState = !refreshDataState;

    if (refreshDataState) {
        console.log('start refresh');
        downloadNewData();
        refreshInterval = setInterval(downloadNewData, 10000);
    } else {
        console.log('stop refresh');
        clearInterval(refreshInterval);
    }
}


//custom multivalue reduce
function reduceAdd(p, v) {
    v.Topic.forEach(function (val, idx) {
        p[val] = (p[val] || 0) + 1; //increment counts
    });
    return p;
}

function reduceRemove(p, v) {
    v.Topic.forEach(function (val, idx) {
        p[val] = (p[val] || 0) - 1; //decrement counts
    });
    return p;

}

function reduceInitial() {
    return {};
}


//function startSpinner(divId) {
//    $("#dataContainer").hide();
//    var spinnerTarget = document.getElementById(divId);

//var spinner = new Spinner(spinnerOpts).spin(spinnerTarget);
//return spinner;
//}


function extractUser(message) {
    var user = Object.create(null);
    user.id_str = message.user_id;
    delete message.user_id;

    user.name = message.user_name;
    delete message.user_name;

    user.screen_name = message.user_screen_name;
    delete message.user_screen_name;

    user.location = message.user_location;
    delete message.user_location;

    user.description = message.user_description;
    delete message.user_description;

    user.profile_image_url = message.user_profile_image_url;
    delete message.user_profile_image_url;

    user.avl_original_dt = message.user_avl_original_dt[0]; //todo fixme
    delete message.user_avl_original_dt; //todo fixme

    user.friends_count = message.user_friends_count;
    delete message.user_friends_count;

    user.followers_count = message.user_followers_count;
    delete message.user_followers_count;

    user.statuses_count = message.user_statuses_count;
    delete message.user_statuses_count;

    user.avl_friends_ids = message.user_avl_friends_ids[0]; //todo fixme
    delete message.user_avl_friends_ids;

    return user;
}

function init(startDate, endDate) {
    dataSource = {
        messagesCache: Object.create(null), //create real map/dict, without inherited properties
        usersCache: Object.create(null), //create real map/dict, without inherited properties
        crossData: null,

        processNewData: function (json) {
            var messagesCache = this.messagesCache;
            var usersCache = this.usersCache;
            json.forEach(function (message) {
                //var mdate = moment(d.TweetDate, "x");
                //var mdate = moment(d.created_at, "dd MMM DD HH:mm:ss ZZ YYYY");
                //d.created_at = d.TweetDate;
                //d.text = d.TweetText;
                messagesCache[message.id_str] = message;
                //usersCache[d.user_name] = d.user_image_url;
                var mdate = moment.utc(message.created_at);
                message.date = mdate.toDate();

                //d.dateRoundByHour = mdate.milliseconds(0).seconds(0).minutes(0).toDate();

                //mdate = mdate.hours(0);
                //d.dateRoundByMonth = mdate.milliseconds(0).seconds(0).minutes(0).hours(0).toDate();

                //rids.push(d["@rid"]);
                if (message.avl_updated_dt > maxDownloadedDateTime) {
                    maxDownloadedDateTime = message.avl_updated_dt;
                }

                var user = usersCache[message.user_id];
                if (user == null) {
                    user = extractUser(message);
                    usersCache[user.id_str] = user;
                }
                message.user = user;
            });

            console.log("new max date :" + maxDownloadedDateTime);
            console.log(Object.keys(messagesCache).length);
        },

        clear: function () {
            this.messagesCache = Object.create(null);
            this.usersCache = Object.create(null);
        },
        init: function (data) {
            this.clear();

            this.processNewData(data);

            this.crossData = crossfilter(data);
            this.groupdata = this.crossData.groupAll();

            this.sentimentDim = this.crossData.dimension(function (d) {
                return d.Sentiment;
            });

            this.topicsDim = this.crossData.dimension(function (d) {
                return d.Topic;
            });
            //var topicsGroup = topicsDim.group();
            this.topicsGroup = this.topicsDim.groupAll().reduce(reduceAdd, reduceRemove, reduceInitial).value();
            // hack to make dc.js charts work
            this.topicsGroup.all = function () {
                var newObject = [];
                for (var key in this) {
                    if (this.hasOwnProperty(key) && key != "all") {
                        newObject.push({
                            key: key,
                            value: this[key]
                        });
                    }
                }
                return newObject;
            };


            this.userDim = this.crossData.dimension(function (d) {
                return d.user_name;
            });
            //var userDim = crossData.dimension(function (d) {
            //    return d.UserName;
            //});
            this.userGroup = this.userDim.group().reduceCount();

            //function get_top_users(source_group) {
            //    function non_zero_pred(d) {
            //        return d.value != 0;
            //    }
            //
            //    return {
            //        all: function () {
            //            return source_group.all().filter(non_zero_pred);
            //        },
            //        top: function (n) {
            //            return source_group.top(Infinity)
            //                .filter(non_zero_pred)
            //                .slice(0, n);
            //        }
            //    };
            //}

            //var top_users_group = get_top_users(userGroup);

            this.tweetsBySentiment = this.sentimentDim.group().reduceCount();

            this.dateDim = this.crossData.dimension(function (d) {
                var date = timeFormat.parse(d.date);
                //var textMonth = moment(date).format("YY'MM");
                //d.textMonth = textMonth;
                //var dayMonth = moment(date).format("MMM'DD");
                //d.dayMonth = dayMonth;
                return moment(date)
                    .milliseconds(0)
                    .seconds(0)
                    .minutes(0)
                    //.hours(0)
                    .toDate();
            });
            this.dateTweets = this.dateDim.group().reduceCount();

            //var minDate = dateDim.bottom(1)[0].date;
            //var maxDate = dateDim.top(1)[0].date;

            //var positiveTweets = dateTweets.filter(function(d) { if (d.Sentiment == 'pos') {return d;} });
            //var negativeTweets = dateTweets.filter(function(d) { if (d.Sentiment == 'neg') {return d;} });

            this.positiveTweetsByDay = this.dateDim.group().reduceSum(function (d) {
                if (d.Sentiment == 'pos') {
                    return 1;
                } else {
                    return 0;
                }
            });

            this.negativeTweetsByDay = this.dateDim.group().reduceSum(function (d) {
                if (d.Sentiment == 'neg') {
                    return 1;
                } else {
                    return 0;
                }
            });

            this.rosneftTweetsByDay = this.dateDim.group().reduceSum(function (d) {
                if (d.Topic.indexOf('Роснефть') > -1) {
                    if (d.Sentiment == 'pos') {
                        return 1;
                    } else if (d.Sentiment == 'neg') {
                        return -1;
                    } else {
                        return 0;
                    }
                } else {
                    return 0;
                }
            });

            this.transneftTweetsByDay = this.dateDim.group().reduceSum(function (d) {
                if (d.Topic.indexOf('Транснефть') > -1) {
                    if (d.Sentiment == 'pos') {
                        return 1;
                    } else if (d.Sentiment == 'neg') {
                        return -1;
                    } else {
                        return 0;
                    }
                } else {
                    return 0;
                }
            });

            this.gazpromneftTweetsByDay = this.dateDim.group().reduceSum(function (d) {
                if (d.Topic.indexOf('Газпромнефть') > -1) {
                    if (d.Sentiment == 'pos') {
                        return 1;
                    } else if (d.Sentiment == 'neg') {
                        return -1;
                    } else {
                        return 0;
                    }
                } else {
                    return 0;
                }
            });

            this.luckoilTweetsByDay = this.dateDim.group().reduceSum(function (d) {
                if (d.Topic.indexOf('Лукоил') > -1) {
                    if (d.Sentiment == 'pos') {
                        return 1;
                    } else if (d.Sentiment == 'neg') {
                        return -1;
                    } else {
                        return 0;
                    }
                } else {
                    return 0;
                }
            });

            this.tnkbpTweetsByDay = this.dateDim.group().reduceSum(function (d) {
                if (d.Topic.indexOf('ТНК-BP') > -1) {
                    if (d.Sentiment == 'pos') {
                        return 1;
                    } else if (d.Sentiment == 'neg') {
                        return -1;
                    } else {
                        return 0;
                    }
                } else {
                    return 0;
                }
            });


        },
        add: function (newData) {
            if (newData == null || newData == undefined) {
                newData = [];
            }
            console.log("recieved " + newData.length);
            var filteredNewData = [];
            var messagesCache = this.messagesCache;
            newData.forEach(function (d) {
                if (d.id_str in messagesCache) {
                    filteredNewData.push(d);
                }
            });
            console.log("filtered " + filteredNewData.length);

            this.processNewData(filteredNewData);
            if (filteredNewData.length > 0) {
                this.crossData.add(filteredNewData);

                dc.renderAll();
            }
        },

        getSelectedMessages: function () {
            return this.dateDim.top(Infinity);
        }
    };

    dashboard = {
        dataSource: null,
        widgets: {},
        tab: "sent",

        create: function () {
            var topicsRowChartParams = {
                type: "row",
                width: 150,
                height: 150,
                elasticX: true,
                renderLabel: true,
                margrins: {
                    top: 10,
                    right: 15,
                    bottom: 20,
                    left: 15
                },
                xAxisTicks: 3,
                ordering: function (d) {
                    return -d.value;
                },
                multivalue: true
            };
            var usersRowChartParams = {
                type: "row",
                width: 150,
                height: 290,
                elasticX: true,
                renderLabel: true,
                margrins: {
                    top: 10,
                    right: 15,
                    bottom: 20,
                    left: 15
                },
                xAxisTicks: 3,
                ordering: function (d) {
                    return -d.value;
                },
                data: function (group) {
                    return group.top(10);
                }
            };
            var sentimentDonutChartParams = {
                type: "pie",
                width: 210,
                height: 210,
                radius: 100,
                innerRadius: 40,
                renderTitle: true,
                colors: colorScale,
                label: function (d) {
                    return translateShortTonality(d.key);
                }
            };
            var sentimentAreaChartParams = {
                type: "composite",
                width: 680,
                height: 220,
                margrins: {
                    top: 20,
                    right: 30,
                    bottom: 20,
                    left: 30
                },
                legend: {
                    x: 500,
                    y: 10,
                    height: 13,
                    gap: 5
                },
                elasticY: true,
                renderTitle: true,
                brushOn: false,
                xAxisTicks: 5,
                label: function (d) {
                    return d.value;
                },
                xAxisTimeScale: "hour"
            };
            var comparatorAreaChartParams = {
                type: "composite",
                width: 1300,
                height: 220,
                margrins: {
                    top: 10,
                    right: 30,
                    bottom: 20,
                    left: 30
                },
                legend: {
                    x: 1150,
                    y: 10,
                    height: 13,
                    gap: 5
                },
                elasticY: true,
                brushOn: false,
                xAxisTicks: 10,
                xAxisTimeScale: "hour"

            };
            var totalTweetsBarChartParams = {
                type: "bar",
                width: 1350,
                height: 150,
                margrins: {
                    top: 10,
                    right: 30,
                    bottom: 20,
                    left: 30
                },
                elasticY: true,
                renderTitle: true,
                renderHorizontalGridLines: true,
                xAxisTicks: 8,
                yAxisTicks: 8,
                centerBar: true,
                label: function (d) {
                    return d.value;
                },
                //xAxisTimeScale: "day"
                xAxisTimeScale: "hour"
            };
            var tweetsDataTableParams = {
                type: "table",
                transitionDuration: 1500,
                size: Infinity,
                group: function (d) {
                    return ruDateFormat(d.date);
                },
                columns: [function (d) {
                    return createTwitterHtml(d);
                }],
                sortBy: function (d) {
                    return d.date;
                },
                order: d3.descending
            };
            var totalParams = {
                type: "total"
            };


            this.widgets.topicsRowChart = this.createWidget("#topics-row-chart", topicsRowChartParams);
            this.widgets.usersRowChart = this.createWidget("#users-row-chart", usersRowChartParams);
            this.widgets.sentimentDonutChart = this.createWidget("#sentiment-donut-chart", sentimentDonutChartParams);
            this.widgets.sentimentAreaChart = this.createWidget("#sentiment-area-chart", sentimentAreaChartParams);
            this.widgets.comparatorLineChart = this.createWidget("#comparator-line-chart", comparatorAreaChartParams);
            this.widgets.totalTweetsBarChart = this.createWidget("#total-tweets-bar-chart", totalTweetsBarChartParams);
            this.widgets.dataTable = this.createWidget("#dc-data-table", tweetsDataTableParams);
            this.widgets.total = this.createWidget(".dc-data-count", totalParams);

        },

        createWidget: function (div, params) {
            var widget;

            if (params.type == "row") {
                widget = dc.rowChart(div);
            }
            if (params.type == "bar") {
                widget = dc.barChart(div);
            }
            if (params.type == "pie") {
                widget = dc.pieChart(div);
            }
            if (params.type == "composite") {
                widget = dc.compositeChart(div);
            }
            if (params.type == "table") {
                widget = dc.dataTable(div);
            }
            if (params.type == "total") {
                widget = dc.dataCount(div);
            }

            if (params.hasOwnProperty("width")) {
                widget.width(params.width);
            }
            if (params.hasOwnProperty("height")) {
                widget.height(params.height);
            }
            if (params.hasOwnProperty("radius")) {
                widget.radius(params.radius);
            }
            if (params.hasOwnProperty("innerRadius")) {
                widget.innerRadius(params.innerRadius);
            }

            if (params.hasOwnProperty("elasticX")) {
                widget.elasticX(params.elasticX);
            }
            if (params.hasOwnProperty("elasticY")) {
                widget.elasticY(params.elasticY);
            }

            if (params.hasOwnProperty("renderHorizontalGridLines")) {
                widget.renderHorizontalGridLines(params.renderHorizontalGridLines);
            }
            if (params.hasOwnProperty("brushOn")) {
                widget.brushOn(params.brushOn);
            }
            if (params.hasOwnProperty("centerBar")) {
                widget.centerBar(params.centerBar);
            }
            if (params.hasOwnProperty("label")) {
                widget.label(params.label);
            }
            if (params.hasOwnProperty("legend")) {
                var legend = dc.legend()
                    .x(params.legend.x)
                    .y(params.legend.y)
                    .itemHeight(params.legend.height)
                    .gap(params.legend.gap);
                widget.legend(legend);
            }
            if (params.hasOwnProperty("renderLabel")) {
                widget.renderLabel(params.renderLabel);
            }
            if (params.hasOwnProperty("renderTitle")) {
                widget.renderTitle(params.renderTitle);
            }
            if (params.hasOwnProperty("margins")) {
                widget.margins(params.margins);
            }
            if (params.hasOwnProperty("ordering")) {
                widget.ordering(params.ordering);
            }
            if (params.hasOwnProperty("xAxisTimeScale")) {
                var timeScale = params.xAxisTimeScale;
                if (timeScale == "hour") {
                    setTimelineHours(widget);
                }
                if (timeScale == "day") {
                    setTimelineDays(widget);
                }
            }
            if (params.hasOwnProperty("xAxisTicks")) {
                widget.xAxis().ticks(params.xAxisTicks);
            }
            if (params.hasOwnProperty("yAxisTicks")) {
                widget.yAxis().ticks(params.yAxisTicks);
            }
            if (params.hasOwnProperty("colors")) {
                widget.colors(params.colors);
            }
            if (params.hasOwnProperty("data")) {
                widget.data(params.data);
            }
            if (params.hasOwnProperty("multivalue")) {
                widget.filterHandler(function (dimension, filters) { //custom filter for multivalue fields
                    dimension.filter(null);
                    if (filters.length === 0) {
                        dimension.filter(null);
                    } else {
                        dimension.filterFunction(function (d) {
                            for (var i = 0; i < d.length; i++) {
                                if (filters.indexOf(d[i]) >= 0) {
                                    return true;
                                }
                            }
                            return false;
                        });
                    }
                    return filters;
                });
            }

            //table
            if (params.hasOwnProperty("transitionDuration")) {
                widget.transitionDuration(params.transitionDuration);
            }
            if (params.hasOwnProperty("size")) {
                widget.size(params.size);
            }
            if (params.hasOwnProperty("group")) {
                widget.group(params.group);
            }
            if (params.hasOwnProperty("columns")) {
                widget.columns(params.columns);
            }
            if (params.hasOwnProperty("sortBy")) {
                widget.sortBy(params.sortBy);
            }
            if (params.hasOwnProperty("order")) {
                widget.order(params.order);
            }


            //for multifocus hack
            function rangesEqual(range1, range2) {
                if (!range1 && !range2) {
                    return true;
                } else if (!range1 || !range2) {
                    return false;
                } else if (range1.length === 0 && range2.length === 0) {
                    return true;
                } else if (range1[0].valueOf() === range2[0].valueOf() &&
                    range1[1].valueOf() === range2[1].valueOf()) {
                    return true;
                }
                return false;
            }

            //multiFocusHack
            widget.focusCharts = function (chartlist) {
                if (!arguments.length) {
                    return this._focusCharts;
                }
                this._focusCharts = chartlist; // only needed to support the getter above
                this.on('filtered', function (range_chart) {
                    if (!range_chart.filter()) {
                        dc.events.trigger(function () {
                            chartlist.forEach(function (focus_chart) {
                                focus_chart.x().domain(focus_chart.xOriginalDomain());
                            });
                        });
                    } else {
                        chartlist.forEach(function (focus_chart) {
                            if (!rangesEqual(range_chart.filter(), focus_chart.filter())) {
                                dc.events.trigger(function () {
                                    focus_chart.focus(range_chart.filter());
                                });
                            }
                        });
                    }

                    dashboard.update();
                });
                return this;
            };

            return widget;
        },

        initWidget: function (widget, params) {
            widget.dimension(params.dimension);

            if (params.hasOwnProperty("dates")) {
                widget.x(d3.time.scale().domain(params.dates)); //.range([0, params.width])
            }

            if (params.hasOwnProperty("group")) {
                if (Array.isArray(params.group)) { //v instanceof Array
                    var composites = [];
                    params.group.forEach(function (d) {
                        composites.push(dc.lineChart(widget).group(d.group, d.name).colors(d.color).renderArea(d.renderArea));
                    });
                    widget.compose(composites);
                } else {
                    widget.group(params.group);
                }
            }

            if (params.hasOwnProperty("focusCharts")) {
                widget.focusCharts(params.focusCharts);
            }

            //widget.redraw();
        },

        init: function (dataSource, startDate, endDate) {
            this.dataSource = dataSource;

            this.initWidget(this.widgets.topicsRowChart, {
                dimension: dataSource.topicsDim,
                group: dataSource.topicsGroup
            });

            this.initWidget(this.widgets.usersRowChart, {
                dimension: dataSource.userDim,
                group: dataSource.userGroup
            });

            this.initWidget(this.widgets.sentimentDonutChart, {
                dimension: dataSource.sentimentDim,
                group: dataSource.tweetsBySentiment
            });

            this.initWidget(this.widgets.sentimentAreaChart, {
                dimension: dataSource.dateDim,
                group: [{
                    name: 'Положительные',
                    group: dataSource.positiveTweetsByDay,
                    color: GREEN,
                    renderArea: true
                }, {
                    name: 'Отрицательные',
                    group: dataSource.negativeTweetsByDay,
                    color: RED,
                    renderArea: true
                }],
                dates: [startDate, endDate]
            });

            this.initWidget(this.widgets.comparatorLineChart, {
                dimension: dataSource.dateDim,
                group: [{
                    name: 'Роснефть',
                    group: dataSource.rosneftTweetsByDay,
                    color: GREEN,
                    renderArea: true
                }, {
                    name: 'Транснефть',
                    group: dataSource.transneftTweetsByDay,
                    color: RED,
                    renderArea: true
                }, {
                    name: 'Газпромнефть',
                    group: dataSource.gazpromneftTweetsByDay,
                    color: BLUE,
                    renderArea: true
                }, {
                    name: 'ТНК-BP',
                    group: dataSource.tnkbpTweetsByDay,
                    color: MAGENTA,
                    renderArea: true
                }, {
                    name: 'Лукоил',
                    group: dataSource.luckoilTweetsByDay,
                    color: ORANGE,
                    renderArea: true
                }],
                dates: [startDate, endDate]
            });

            this.initWidget(this.widgets.totalTweetsBarChart, {
                dimension: dataSource.dateDim,
                group: dataSource.dateTweets,
                dates: [startDate, endDate],
                focusCharts: [this.widgets.sentimentAreaChart, this.widgets.comparatorLineChart]
            });

            //this.widgets.totalTweetsBarChart.on("filtered", function (chart, filter) {
            //    dashboard.update();
            //
            //});


            this.initWidget(this.widgets.dataTable, {
                dimension: dataSource.dateDim
            });

            this.initWidget(this.widgets.total, {
                dimension: dataSource.crossData,
                group: dataSource.groupdata
            });


            dc.renderAll();

        },

        update: function () {
            if (dashboard.tab == "map") {
                updateMap(); // if active?
            }
            if (dashboard.tab == "graph") {
                updateGraph(); // if active?
            }

        }
    };

    dashboard.create();

    loadInitialData(startDate, endDate);
}

//function stopSpinner(spinner) {
//    spinner.stop();
//    $("#dataContainer").show();
//}

function loadInitialData(startDate, endDate) {
    var from = startDate.format('YYYY-MM-DD');
    var to = endDate.format('YYYY-MM-DD');

    //var spinner = startSpinner("spinner");

    var url = 'api/messages/from/' + from + '/to/' + to + '/' + fromToLimit + '/' + fromToSkip;
    //d3.json("api/messages/all", function (json) {
    d3.json(url, function (json) {
        //stopSpinner(spinner);
        var data = json.result;

        dataSource.init(data);

        dashboard.init(dataSource, startDate, endDate);

        //initGraph();

    });
    //return spinner;
}

function loadGraphData(startDate, endDate) {
    var from = startDate.format('YYYY-MM-DD');
    var to = endDate.format('YYYY-MM-DD');


    var url = 'api/users/from/' + from + '/to/' + to + '/' + fromToLimit + '/' + fromToSkip;
    //d3.json("api/messages/all", function (json) {
    //d3.json(url, function (json) {
    //    var data = json.result;
    //    console.log("downloaded users :" + data.length);
    //    data.forEach(function (d) {
    //        dataSource.usersCache[d.id_str] = d;
    //    });

    initGraph();
    resize();
    //});
}


function sortByRetweets() {
    console.log("by retweets");
    dashboard.widgets.dataTable.sortBy(function (d) {
        return d.retweet_count;
    });
    dashboard.widgets.dataTable.redraw();
}

function sortByFavorites() {
    console.log("by favorites");
    dashboard.widgets.dataTable.sortBy(function (d) {
        return d.favorite_count;
    });
    dashboard.widgets.dataTable.redraw();
}

function sortByDate() {
    console.log("by date");
    dashboard.widgets.dataTable.sortBy(function (d) {
        return d.date;
    });
    dashboard.widgets.dataTable.redraw();
}

function translateTonality(t) {
    if (t == "neut") {
        return "нейтральная";
    } else if (t == "neg") {
        return "отрицательная";
    } else if (t == "pos") {
        return "положительная";
    }
    return "";
}

function translateShortTonality(t) {
    if (t == "neut") {
        return "нейтр.";
    } else if (t == "neg") {
        return "отриц.";
    } else if (t == "pos") {
        return "полож.";
    }
    return "";
}

function setTimelineHours(widget) {
    widget.xUnits(d3.time.hours);
    widget.round(d3.time.hour.round);
    widget.xAxis().tickFormat(RU.timeFormat("%d %b %H:%M"));
}

function setTimelineDays(widget) {
    widget.xUnits(d3.time.days);
    widget.round(d3.time.day.round);
    widget.xAxis().tickFormat(RU.timeFormat("%d %b"));
}

var NO_IMAGE_URL = "images/no_image.png";

function imgError(image, id_str) {
    image.onerror = "";
    image.src = NO_IMAGE_URL;
    dataSource.usersCache[id_str].profile_image_url = NO_IMAGE_URL;
    return true;
}


function createTwitterHtml(message) {
    var res = '<div class="jstwitter">' +
        '<div class="item">' +
        //'<img class="avatar-img" src="' + message.user.profile_image_url + '" height="30px" onerror="imgError(this, \'' + message.user.id_str + '\');">' +
        '<img class="avatar-img" src="' + message.user.profile_image_url + '" height="30px">' +
        '<div class="tweet-wrapper">' +
        '<span class="text">' + '<span class="sentiment-' + message.Sentiment + '">' + message.text + '</span>' + '</span>' +
        ' от ' +
        '<span class="user">' + message.user.screen_name + '</span>' +
        ' в ' +
        '<span class="time">' +
        '<a href="http://twitter.com/' + message.user.screen_name + '/status/' + message.id_str + '" target="_blank">' + ruDateTimeFormat(message.date) + '</a>  ' +
        '</span>' +
        (message.retweet_count > 0 ? ' <img src="' + 'images/copy_clean.svg" title="Репост" height="15px">' + message.retweet_count : '') +
        (message.favorite_count > 0 ? ' <img src="' + 'images/heart.svg" title="Избранное" height="15px">' + message.favorite_count : '') +
        '</div>' +
        '</div>' +
        '</div>';
    return res;
}

function createUserHtml(user) {
    var res = '<div class="jstwitter">' +
        '<div class="item">' +
        '<div class="tweet-wrapper">' +
        '<div class="user">' + 'Имя: ' + user.name + '</div>' +
        '<div class="user">' + 'Ник: ' + user.screen_name + '</div>' +
        '<div>' + 'Место: ' + user.location + '</div>' +
        '<div>' + 'Описание: ' + user.description + '</div>' +
        '<div>Создан: <span class="time">' + user.avl_original_dt + '</span></div>' +
        '<div>Читателей: ' + user.followers_count + '</div>' +
        '<div>Подписан: ' + user.friends_count + '</div>' +
        '<div>Число постов: ' + user.statuses_count + '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
    return res;
}

var moscowLatLng = [55.750, 37.610];

map = L.map('map', {
    attributionControl: false
}).setView(moscowLatLng, 10);

var hash = new L.Hash(map);

L.control.attribution({
    prefix: '&copy; AvalancheOnline'
}).addAttribution('Карта тональностей').addTo(map);

var l = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    maxZoom: 18
}).addTo(map);

var SentimentMarker = L.Marker.extend({
    options: {
        tweet: null,
        sentiment: 'none'
    }
});

var colours = ['#00FF00', '#FF0000', '#BBBBBB'];
var colour_labels = ['Положительная', 'Негативная', 'Нейтральная'];

var legend = L.control({
    position: 'bottomright'
});

legend.onAdd = function (map) {
    var div = $('<div/>', {
        'class': 'info legend'
    });
    div.append('<h4>Тональность</h4>');

    for (var i = 0; i < colours.length; ++i) {
        div.append('<i style="background: ' + colours[i] + ' !important"></i> ' + colour_labels[i] + '<br/>');
    }
    div.hide();

    return div[0];
};

legend.addTo(map);

var help = L.control({
    position: 'topright'
});

help.onAdd = function (map) {
    var div = $('<div><i class="fa fa-3x fa-question-circle help-icon"></i></div>');
    div.click(function (e) {
        var container = $(legend.getContainer());
        if (container.css('display') == 'none') {
            container.show();
        } else {
            container.hide();
        }
    });
    return div[0];
};

help.addTo(map);

// Normalizes x \in [f(a), f(b)] such that f(x) \in [c, d]
// i.e. maps domain_old = [f(a), f(b)] to domain_new = [c, d]
var normalize = function (f, x, domain_old, domain_new) {
    if (f == undefined) {
        f = function (v) {
            return v;
        };
    }

    var fa = f(domain_old[0]);
    var fb = f(domain_old[1]);

    var c = domain_new[0];
    var d = domain_new[1];

    return (f(x) / (fb - fa) + fa) * (d - c) + c;
};


var markers = new L.MarkerClusterGroup({
    singleMarkerMode: true,
    // zoom = 17 -- almost all objects visible and titled
    // zoom = 16 -- almost all streets, titles for big houses
    // zoom = 15 -- houses (w/o numbers) and park schemes visible
    // zoom = 14 -- parks, some subway stations
    // zoom = 13 -- biggest streets
    // zoom = 11-12 -- districts
    // zoom = 8 -- nearest small cities
    // zoom = 7 -- nearest big cities
    // zoom = 5 -- states
    // zoom = 3 -- almost all world
    // zoom = 2 -- whole world + repetition
    maxClusterRadius: function (zoom) {
        //if (zoom < 5) return 10;
        if (zoom < 9) return 80;
        return 100;
    }, // defaults to 80
    spiderfyDistanceMultiplier: 5,
    iconCreateFunction: function (cluster) {
        var sentiment_summary = {
            'pos': 0,
            'neg': 0,
            'neut': 0,
            'none': 0
        };

        var markers = cluster.getAllChildMarkers();
        for (var i = 0; i < markers.length; ++i) {
            if (sentiment_summary.hasOwnProperty(markers[i].options.sentiment)) {
                ++sentiment_summary[markers[i].options.sentiment];
            }
        }

        var radiusMin = 20;
        var radiusMax = 40;

        var r = normalize(Math.sqrt, markers.length, [0, data_items_qty], [radiusMin, radiusMax]);
        var radius = Math.max(radiusMin, Math.min(radiusMax, Math.floor(r)));

        var div_radius = radius + 10;
        var div_diameter = div_radius * 2;
        var icon_anchor = div_radius;

        var feature = {
            data: [sentiment_summary.pos, sentiment_summary.neg, sentiment_summary.neut],
            radius: radius,
            colours: colours,
            textIcon: "\uf099"
        };

        if (markers.length == 1) {
            return L.raphaelIcon({
                className: 'raphaelholder_marker',
                html: '<div class="raphaelholder" id="raphaelholder_cluster" style="width:' + div_diameter + 'px; height:' + div_diameter + 'px;"></div>',
                iconSize: [div_diameter, div_diameter],
                iconAnchor: [icon_anchor, icon_anchor],
                popupAnchor: [0, -div_radius],
                iconType: 'single',
                feature: feature
            });
        }

        return L.raphaelIcon({
            className: 'raphaelholder_marker',
            html: '<div class="raphaelholder" id="raphaelholder_cluster" style="width:' + div_diameter + 'px; height:' + div_diameter + 'px;"></div>',
            iconSize: [div_diameter, div_diameter],
            iconAnchor: [icon_anchor, icon_anchor],
            popupAnchor: [0, -div_radius],
            iconType: 'pie',
            feature: feature
        });
    }
});

var generateTweetData = function (tweet) {
    var linkify = function (text) {
        text = Autolinker.link(text);
        text = text.replace(/(@)(\w+)/g, '<a href="http://twitter.com/$2" target="_blank">$1$2</a>');
        text = text.replace(/(#)(\w+)/g, '<a href="https://twitter.com/search/?src=hash&q=%23$2" target="_blank">$1$2</a>');
        return text;
    };

    return [{
            'title': 'Ссылка',
            'content': Autolinker.link('https://twitter.com/statuses/' + tweet['id_str'])
        }, {
            'title': 'Текст',
            'content': linkify(tweet['text'])
        }, {
            'title': 'Тональность',
            'content': {
                'pos': 'Положительная',
                'neg': 'Отрицательная',
                'neut': 'Нейтральная',
                'none': 'Отсутствует'
            }[tweet['Sentiment']]
        }, {
            'title': 'Количество ретвитов',
            'content': tweet['retweet_count']
        }, {
            'title': 'Пользователь',
            'content': (tweet['user']['name'] + ' (' + linkify('@' + tweet['user']['screen_name']) + ')')
        }, {
            'title': (tweet['Topic'].length === 1) ? 'Тема' : 'Темы',
            'content': tweet['Topic'].join(', ')
        }
        //,
        //{
        //    'title': 'Место',
        //    'content': tweet['place']['name']
        //}
    ];
}

// Works only for content nesting <= 2!!!
var createRow = function (data) {
    var container = $();
    if (Object.prototype.toString.call(data['content']) === '[object Array]') {
        var title = $('<td/>', {
            'class': 'title',
            'rowspan': 2
        });
        var content = $('<td/>');
        var width = Math.floor(196 / data['content'].length);
        for (var i = 0; i < data['content'].length; ++i) {
            content.append($('<div/>', {
                'style': 'display: inline-block; color: #666; width: ' + width + 'px;',
                'html': data['content'][i]['title']
            }));
        }

        var row1 = $('<tr/>').append(title).append(content);

        content = $('<td/>');
        for (var i = 0; i < data['content'].length; ++i) {
            content.append($('<div/>', {
                'class': 'value-holder',
                'style': 'display: inline-block; width: ' + width + 'px;',
                'html': data['content'][i]['content']
            }));
        }
        var row2 = $('<tr/>').append(content);

        container = container.add(row1);
        container = container.add(row2);
    } else {
        var title = $('<td/>', {
            'class': 'title',
            'html': data['title']
        });

        var content = $('<td/>', {
            'class': 'value-holder',
            'style': 'vertical-align: middle;',
            'html': data['content']
        });

        container = container.add($('<tr/>').append(title).append(content));
    }

    return container;
};

var generatePopupHtml = function (data) {
    var table = $('<table/>', {
        'class': 'data-table',
        'border': '0',
        'cellpadding': '0',
        'cellspacing': '0'
    });
    var tbody = $('<tbody></tbody>').appendTo($(table[0]));

    for (var i = 0; i < data.length; ++i) {
        tbody.append(createRow(data[i]));
    }

    return table[0];
};

//var mapSpinner = new Spinner({
//    scale: 2.0
//}).spin($('#map')[0]);

var data_items_qty = 0;
var data = [];

function updateMap() {
    populateMap(dataSource.getSelectedMessages());
}

var populateMap = function (messagesMap) {
    data = [];
    Object.keys(messagesMap).forEach(function (key) {
        var message = messagesMap[key];
        if (typeof message['Latitude'] !== 'undefined' &&
            typeof message['Longitude'] !== 'undefined' &&
            typeof message['Sentiment'] !== 'undefined') {
            data.push(message);
        }
    });

    data_items_qty = data.length;
    var markerList = [];
    markers.clearLayers();

    for (var i = 0; i < data_items_qty; ++i) {
        var marker = new SentimentMarker(L.latLng(data[i].Latitude, data[i].Longitude), {
            tweet: data[i],
            sentiment: data[i]['Sentiment']
        });

        var popup = generatePopupHtml(generateTweetData(data[i]));

        marker.bindPopup(popup);
        markerList.push(marker);
        markerList.push(marker);
        markers.addLayers(markerList);
        map.addLayer(markers);

    }

    //markers.addLayers(markerList);
    //map.addLayer(markers);

    //mapSpinner.stop();
};

//$.ajax($('#map').data('source'))
//    .done(populateMap)
//    .fail(function (jqXHR, textStatus) {
//        console.log('Request failed: ' + textStatus);
//    });
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


function initGraph() {
    var cytoStyle = cytoscape.stylesheet();

    cytoStyle.selector('node')
        .css({
            'content': 'data(name)',
            'height': 'mapData(followersCount, 0, 20000, 20, 100)',
            'width': 'mapData(followersCount, 0, 20000, 20, 100)',
            //'height': 80,
            //'width': 80,
            'background-fit': 'cover',
            'border-color': '#000',
            'border-width': 3,
            'border-opacity': 0.5,
            'min-zoomed-font-size': 8,
            'text-valign': 'bottom'
        });

    cytoStyle.selector('edge')
        .css({
            'width': 6,
            //'curve-style': 'haystack',
            'line-color': '#ddd',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': 'red'
        });

    cytoStyle.selector('.selected')
        .css({
            'background-color': 'blue',
            'border-color': 'blue',
            'line-color': 'blue',
            'target-arrow-color': 'red',
            'source-arrow-color': 'blue'
        });

    cytoStyle.selector('.faded')
        .css({
            'opacity': 0.25,
            'text-opacity': 0
        });

    var cytoNodes = [];

    for (var userId in dataSource.usersCache) {
        var user = dataSource.usersCache[userId];
        var node = {
            id: user.id_str,
            name: user.screen_name,
            followersCount: user.followers_count
                //, degree: message.retweet_count + message.favorite_count
        };
        cytoNodes.push({
            data: node
                //style: { 'background-image': message.user_image_url }
        });

        cytoStyle.selector('#' + user.id_str)
            .css({
                'background-image': user.profile_image_url
            });

    }

    var cytoEdges = [];

    console.log("users :" + Object.keys(dataSource.usersCache).length);
    for (var userId in dataSource.usersCache) {
        var user = dataSource.usersCache[userId];
        user.avl_friends_ids.forEach(function (friendId) {
            if (friendId in dataSource.usersCache) {
                var edge = {
                    id: user.id_str + friendId,
                    source: user.id_str,
                    target: friendId
                        //, degree: message.retweet_count + message.favorite_count
                };
                cytoEdges.push({
                    data: edge
                        //style: { 'background-image': message.user_image_url }
                });
            }

            //cytoStyle.selector('#' + user.screen_name)
            //    .css({
            //        'background-image': user.profile_image_url
            //    });
        });

    }


    cy = cytoscape({
        container: document.getElementById('cy'),

        style: cytoStyle,

        elements: {
            nodes: cytoNodes,
            edges: cytoEdges
        },
        layout: currentLayout,

        wheelSensitivity: 0.5,
        //hideEdgesOnViewport: true,
        hideLabelsOnViewport: true,
        //userPanningEnabled: true,
        //boxSelectionEnabled: true,
        motionBlur: true
    }); // cy init

    //layout.run();

    var defaults = {
        menuRadius: 100,
        selector: 'node', // elements matching this Cytoscape.js selector will trigger cxtmenus
        commands: [{
            content: 'Развернуть',
            select: function () {
                console.log(this.id());
            }
        }, {
            content: 'Свернуть',
            select: function () {
                console.log(this.id());
            }
        }, {
            content: 'Убрать',
            select: function () {
                console.log("removing node " + this.id());
                var node = cy.$("#" + this.id());
                cy.remove(node);
            }
        }],
        fillColor: 'rgba(0, 0, 0, 0.75)',
        activeFillColor: 'rgba(92, 194, 237, 0.75)',
        activePadding: 5,
        indicatorSize: 24,
        separatorWidth: 3,
        spotlightPadding: 4,
        minSpotlightRadius: 24,
        maxSpotlightRadius: 38,
        itemColor: 'white',
        itemTextShadowColor: 'black',
        zIndex: 9999
    };

    var cxtmenuApi = cy.cxtmenu(defaults);

    cy.nodes().qtip({
        content: function () {
            return createUserHtml(dataSource.usersCache[this.id()]);
        },
        position: {
            my: 'center left',
            at: 'center right'
        },
        style: {
            classes: 'qtip-bootstrap',
            tip: {
                width: 16,
                height: 8
            }
        }
    });

    cy.elements().unselectify(); // ???

    cy.on('tap', 'node', function (e) {
        var node = e.cyTarget;
        unselectGraph();
        selectNode(node);
        //var neighborhood = node.neighborhood().add(node);
        //
        //cy.elements().addClass('faded');
        //neighborhood.removeClass('faded');
        //cy.elements().removeClass('selected');
        //neighborhood.addClass('selected');
    });

    cy.on('tap', function (e) {
        if (e.cyTarget === cy) {
            cy.elements().removeClass('faded');
            cy.elements().removeClass('selected');
        }
    });
}

function unselectGraph() {
    cy.elements().addClass('faded');
    cy.elements().removeClass('selected');
}

function selectNodes(nodes) {
    cy.startBatch();
    nodes.forEach(function (node) {
        selectNode(node);
        //node.removeClass('faded');
        //node.addClass('selected');
    });
    cy.endBatch();
}

function selectNode(node) {
    var neighborhood = node.neighborhood().add(node);

    neighborhood.removeClass('faded');
    neighborhood.addClass('selected');
}

var getUserIdFromMessage = function (message) {
    return message.user.id_str;
};

function updateGraph() {
    unselectGraph();

    var selectedUsersIds = [];

    dataSource.getSelectedMessages().forEach(function (message) {
        selectedUsersIds.push(message.user.id_str);
    });

    var nodes = [];

    selectedUsersIds.forEach(function (userId) {
        var node = cy.$('#' + userId);
        nodes.push(node);
    });

    selectNodes(nodes);

}
//$(function () { // on dom ready
//
//// photos from flickr with creative commons license
//    initGraph();
//}); // on dom ready
