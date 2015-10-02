L.RaphaelIcon = L.Icon.extend({
    options: {
        iconSize: [12, 12],
        /*
        iconAnchor: (Point)
        popupAnchor: (Point)
        html: (String)
        bgPos: (Point)
        */
        className: 'leaflet-div-icon',
        html: false,
        feature: null,
        iconType: '',

        centreOffset: 1,

        pieBgStroke: '#fff',
        pieBgStrokeWidth: 1,

        pieCentreFill: '#fff',
        pieCentreStrokeWidth: 0,

        pieBorderStroke: '#fff',
        pieBorderStrokeWidth: 1,

        singleBgFill: '#fff',
        singleBgStrokeWidth: 1,

        shadowOffset: 4,
        shadowFill: '#000',
        shadowStrokeWidth: 0,
        shadowOpacity: 0.3,

        centreTextStyle: {
            'font-size': 10,
            'font-family': 'Arial, Helvetica, sans-serif'
        }
    },

    createIcon: function (oldIcon) {
        var div = (oldIcon && oldIcon.tagName === 'DIV')? oldIcon : document.createElement('div');
        var options = this.options;

        div.innerHTML = (options.html !== false)? options.html : '';

        if (options.bgPos) {
            div.style.backgroundPosition = (-options.bgPos.x) + 'px ' + (-options.bgPos.y) + 'px';
        }
        this._setIconStyles(div, 'icon');

        this.pieDiv = div;

        switch (this.options.iconType) {
            case 'pie':
                setTimeout($.proxy(function() {
                    this._createPieChart();
                }, this), 1);
                break;
            case 'single':
                setTimeout($.proxy(function() {
                    this._createSingle();
                }, this), 1);
                break;
        }

        return this.pieDiv;
    },

    _createPieChart: function () {
        var div = this.pieDiv;
        var opts = this.options;

        var feature = opts.feature;
        var featureCentre = feature.radius + opts.centreOffset;
        var holder = $('.raphaelholder', $(div))[0];

        var r = Raphael(holder);

        r.customAttributes.segmentPath = function (x, y, r, a1, a2) {
            var flag = (a2 - a1) > 180;
            var clr = (a2 - a1) / 360;

            a1 = (a1 % 360) * Math.PI / 180;
            a2 = (a2 % 360) * Math.PI / 180;

            return {
                'path': [
                    ['M', x, y],
                    ['l', r * Math.cos(a1), r * Math.sin(a1)],
                    ['A', r, r, 0, +flag, 1, x + r * Math.cos(a2), y + r * Math.sin(a2)],
                    ['z']
                ]
            };
        };

        var shadow = r.circle(featureCentre + opts.shadowOffset, featureCentre + opts.shadowOffset, feature.radius).attr({
            'fill': opts.shadowFill,
            'stroke-width': opts.shadowStrokeWidth,
            'fill-opacity': opts.shadowOpacity
        });

        var bgStyle = {
            'stroke': opts.pieBgStroke,
            'stroke-width': opts.pieBgStrokeWidth
        };

        if (feature.colours.length == 1) {
            bgStyle.fill = feature.colours[0];
        }
        this.bg = r.circle(featureCentre, featureCentre, feature.radius).attr(bgStyle);

        var data = feature.data;

        var total = 0.0;
        for (var i = 0; i < data.length; ++i) {
            total += data[i];
        }

        var paths = r.set();

        var start = 0.0;
        for (i = 0; i < data.length; i++) {
            var value = 0.0;

            if (data[i] > 0) {
                var pieShare = (data[i] / (total * 1.0)) * 100.0;
                if (data[i] == total) {
                    pieShare = 99.99;
                }
                value = 360.0 / 100.0 * pieShare;
            }

            (function(i, value) {
                var opacity = (value == 0)? 0 : 1;

                paths.push(r.path().attr({
                        'segmentPath': [featureCentre, featureCentre, feature.radius,
                                      start, start + value, feature.colours[i]],
                        'stroke': opts.pieBorderStroke,
                        'stroke-width': opts.pieBorderStrokeWidth,
                        'fill': feature.colours[i],
                        'opacity': opacity
                    })
                );
            })(i, value);
            start += value;
        }

        this.fg = r.circle(featureCentre, featureCentre, feature.radius / 2.0).attr({
            'fill': opts.pieCentreFill,
            'stroke-width': opts.pieCentreStrokeWidth
        });

        this.ffgStyle = {
            'stroke': opts.pieBorderStroke,
            'stroke-width': opts.pieBorderStrokeWidth
        };

        this.ffg = r.circle(featureCentre, featureCentre, feature.radius).attr(this.ffgStyle);

        this.centreText = r.text(featureCentre, featureCentre, total).attr(opts.centreTextStyle);

        this.paths = paths;
        this.r = r;
    },

    _createSingle: function () {
        var div = this.pieDiv;
        var opts = this.options;;

        var feature = opts.feature;
        var featureCentre = feature.radius + opts.centreOffset;
        var holder = $('.raphaelholder', $(div))[0];

        var r = Raphael(holder);

        var shadow = r.circle(featureCentre + opts.shadowOffset, featureCentre + opts.shadowOffset, feature.radius).attr({
            'fill': opts.shadowFill,
            'stroke-width': opts.shadowStrokeWidth,
            'fill-opacity': opts.shadowOpacity
        });

        var data = feature.data;

        var nonzeroIdx = -1;
        for (var i = 0; i < data.length; ++i) {
            if (data[i] != 0) {
                nonzeroIdx = i;
                break;
            }
        }

        var bgStyle = {
            'fill': opts.singleBgFill,
            'stroke-width': opts.singleBgStrokeWidth,
            'stroke': feature.colours[nonzeroIdx]
        };

        this.bg = r.circle(featureCentre, featureCentre, feature.radius).attr(bgStyle);

        // this.fg = r.circle(featureCentre, featureCentre, (feature.radius / 2.0) + 2).attr({
        //     fill: feature.colours[nonzeroIdx],
        //     'stroke-width': 0
        // });

        if (feature.textIcon != undefined) {
            this.centreText = r.text(featureCentre + 1, featureCentre + 1, feature.textIcon).attr({
                'font-size': 34,
                'font-family': 'FontAwesome',
                'fill': feature.colours[nonzeroIdx]
            });
        }

        if (feature.text != undefined) {
            var textDiv = $('<div/>').addClass('icon-label').html(feature.text[0]).appendTo(this.pieDiv);
            if (feature.text.length > 1) {
                $('<span/>').html(feature.text[1]).addClass('percentage').appendTo(textDiv);
            }
        }
    }
});

L.raphaelIcon = function(options) {
    return new L.RaphaelIcon(options);
};
