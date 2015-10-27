import $ from "jquery";
import "bootstrap-slider/dist/css/bootstrap-slider.css!";
import slider from "bootstrap-slider";
import _ from "underscore";

export function makeSlider(sliderParams, layoutControl) {
    let $graphControl = $('#graph_control');
    let $input = $('<input></input>');
    let $param = $('<div class="param"></div>');

    $param.append('<span class="label label-default">' + sliderParams.label + '</span>');
    $param.append($input);

    $graphControl.append($param);

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
