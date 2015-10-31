'use strict';

import $ from "jquery";
import "bootstrap-slider/dist/css/bootstrap-slider.css!";
import slider from "bootstrap-slider";
import _ from "underscore";

const $graphControl = $('#graph_control');

const $sliders = $('#sliders');

const $dynamicLayoutButton = $('#btn_layout_dynamic');
const $circularLayoutButton = $('#btn_layout_circle');

const $nodeInfo = $('#node_info');

export const deleteNodeEvent = 'deleteNode';
export const changeLayoutEvent = 'changeLayout';


export function showNodeInfo(html, nodeId) {
    let $nodeButtons = $nodeInfo.html('<div class="btn-toolbar" role="group"></div>');
    let $updateNodeButton = $nodeButtons
        .append('<button id="btn_node_update" type="button" class="btn btn-small disabled">Обновить</button>');
    let $deleteNodeButton = $nodeButtons
        .append('<button id="btn_node_delete" type="button" class="btn btn-small">Удалить</button>');
    $nodeInfo.append(html);

    $deleteNodeButton.bind('click', function () {
        $(this).trigger(deleteNodeEvent, { nodeId: nodeId });
    });
}

export function setNodeDeleteEventProcessor(callback) {
    $nodeInfo.on(deleteNodeEvent, function(e, data) {
        callback(data.nodeId);
        $nodeInfo.empty();

    });

}

export function activateLayoutButtons() {
    $dynamicLayoutButton.bind('click', function () {
        $(this).trigger(changeLayoutEvent, { layout: "None" });
    });
    $circularLayoutButton.bind('click', function () {
        $(this).trigger(changeLayoutEvent, { layout: "Circular" });
    });
}

export function setChangeLayoutEventProcessor(callback) {
    $graphControl.on(changeLayoutEvent, function(e, data) {
        callback(data.layout);
    });

}

export function makeSlider(sliderParams, layoutControl) {
    let $input = $('<input></input>');
    let $param = $('<div class="param"></div>');

    $param.append('<span class="label label-default">' + sliderParams.label + '</span>');
    $param.append($input);

    $sliders.append($param);

    let p = $input.slider({
        min: sliderParams.min,
        max: sliderParams.max,
        step: (sliderParams.max - sliderParams.min)/10,
        precision: 4,
        value: layoutControl.getLayoutParam[sliderParams.param]
    }).on('slide', _.debounce(function () {
        let newValue = p.getValue();
        console.log(`New ${sliderParams.param} value: ${newValue}`);
        layoutControl.setLayoutParam(sliderParams.param, newValue);
        layoutControl.update();
    }, 50)).data('slider');
}

export function removeSliders() {
    $(".param").remove();
}

export function initGraphControlButtons(graphControl) {
    const $zoomInBtn = $("#btn_graph_zoom_in");
    $zoomInBtn.on("click", graphControl.zoomIn);

    const $zoomOutBtn = $("#btn_graph_zoom_out");
    $zoomOutBtn.on("click", graphControl.zoomOut);

    const $centerBtn = $("#btn_graph_center");
    $centerBtn.on("click", graphControl.reset);

    const $pauseBtn = $("#btn_graph_pause");
    $pauseBtn.on("click", graphControl.pause);
}
