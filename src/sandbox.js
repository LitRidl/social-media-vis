'use strict';

import $ from "jquery";
import "bootstrap-slider/dist/css/bootstrap-slider.css!";
import slider from "bootstrap-slider";
import _ from "underscore";
import moment from "moment";
import d3 from "d3";

const ru_RU = {
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
const RU = d3.locale(ru_RU);

const ruDateFormat = RU.timeFormat("%B %Y");
const ruDateTimeFormat = RU.timeFormat("%H:%M %d.%m.%Y");

const $sliders = $('#sliders');


const $nodeInfo = $('#node_info');

export const deleteNodeEvent = 'deleteNode';



export function showNodeInfo(html, nodeId) { //todo to html template
    let $nodeButtons = $nodeInfo.html('<div class="btn-toolbar" role="group"></div>');
    let $updateNodeButton = $nodeButtons
        .append(createButton("btn_node_update", "Обновить", false));
    let $deleteNodeButton = $nodeButtons
        .append(createButton("btn_node_delete", "Удалить"));
    $nodeInfo.append(html);

    $deleteNodeButton.bind('click', function () {
        $(this).trigger(deleteNodeEvent, { nodeId: nodeId });
    });
}

function createButton(id, name, enabled=true) {
    return `<button id="${id}" type="button" class="btn btn-small ${enabled?'':'disabled'}">${name}</button>`;
}

function appendButton(target, button) {
    target.append(button);
}

export function setNodeDeleteEventProcessor(callback) {
    $nodeInfo.on(deleteNodeEvent, function(e, data) {
        callback(data.nodeId);
        $nodeInfo.empty();

    });

}

export function clearNodeInfo() {
    $nodeInfo.empty();
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

export function removeElement(elementId) {
    $(elementId).remove();
}

export function addOnClick(elementId, fn) {
    const $element = $(elementId);
    $element.on("click", fn);

}

function getDayHour(obj) { //todo fixme
    //let date = strToDate(obj.date);
    let date = obj.date;
    date.set("millisecond", 0);
    date.set("second",0);
    date.set("minute", 0);
    date.set("hour", 0);
    obj.date_key = date; //todo?
    return date.format("YYYY-MM-DD HH:mm");
}


export function strToDate(str) {
    return  moment(str);
}

export function getHistogrammBy(data, keyFn) {
    let splittedData = d3.nest()
    .key(keyFn)
    .sortKeys(d3.ascending)
    .entries(data);

    return splittedData;
}

export function getHistogrammByDateHour(data) {
    return getHistogrammBy(data, getDayHour);
}

export function formatDate(date) {
    return ruDateTimeFormat(date);
}
