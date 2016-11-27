'use strict';

angular
    .module('layerEditor', ['ngMaterial'])
    .directive('layerEditor', ['$compile', function($compile, $mdSidenav) {

        function buildTemplate(layerId, layerType) {
            var layerDirectives =
            {
                'data':             '<input-data-editor layer-id="' + layerId + '" do-on-submit="doOnSubmit()"></input-data-editor>',
                'convolution1d':    '<convolution1d-editor layer-id="' + layerId + '" do-on-submit="doOnSubmit()"></convolution1d-editor>',
                'convolution2d':    '<convolution2d-editor layer-id="' + layerId + '" do-on-submit="doOnSubmit()"></convolution2d-editor>',
                'convolution3d':    '<convolution3d-editor layer-id="' + layerId + '" do-on-submit="doOnSubmit()"></convolution3d-editor>',
                'pooling1d':        '<pooling1d-editor layer-id="' + layerId + '" do-on-submit="doOnSubmit()"></pooling1d-editor>',
                'pooling2d':        '<pooling2d-editor layer-id="' + layerId + '" do-on-submit="doOnSubmit()"></pooling2d-editor>',
                'pooling3d':        '<pooling3d-editor layer-id="' + layerId + '" do-on-submit="doOnSubmit()"></pooling3d-editor>',
                'activation':       '<activation-editor layer-id="' + layerId + '" do-on-submit="doOnSubmit()"></activation-editor>',
                'merge':            '<merge-editor layer-id="' + layerId + '" do-on-submit="doOnSubmit()"></merge-editor>',
                'flatten':          '<flatten-editor layer-id="' + layerId + '" do-on-submit="doOnSubmit()"></flatten-editor>',
                'dense':            '<dense-editor layer-id="' + layerId + '" do-on-submit="doOnSubmit()"></dense-editor>',
                'datainput':        '<datainput-editor layer-id="' + layerId + '" do-on-submit="doOnSubmit()"></datainput-editor>',
                'dataoutput':       '<dataoutput-editor layer-id="' + layerId + '" do-on-submit="doOnSubmit()"></dataoutput-editor>',
                'solver':           '<solver-editor layer-id="' + layerId + '" do-on-submit="doOnSubmit()"></solver-editor>'
            };
            return layerDirectives[layerType];
        }

        return {
            scope: {
                doOnSubmit: '&',
                layerId: '@',
                layerType: '@'
            },
            link: function(scope, element, attrs) {


                scope.$watch('layerId', function(newValue, oldValue) {
                    var id = attrs.layerId;
                    var type = attrs.layerType;
                    var template = buildTemplate(id, type);
                    element.html(template);
                    $compile(element.contents())(scope);

                });
            }
        };
    }]);
