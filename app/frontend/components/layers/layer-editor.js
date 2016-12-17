'use strict';

angular
    .module('layerEditor', ['ngMaterial',
        'convolution1dEditor',
        'convolution2dEditor',
        'convolution3dEditor',
        'pooling1dEditor',
        'pooling2dEditor',
        'pooling3dEditor',
        'activationEditor',
        'flattenEditor',
        'mergeEditor',
        'denseEditor',
        'datainputEditor',
        'dataoutputEditor'
    ])
    .directive('layerEditor', ['$compile', function($compile) {

        function buildTemplate(layerId, layerType) {
            var layerDirectives =
            {
                'convolution1d':    '<convolution1d-editor layer-id="' + layerId + '"></convolution1d-editor>',
                'convolution2d':    '<convolution2d-editor layer-id="' + layerId + '"></convolution2d-editor>',
                'convolution3d':    '<convolution3d-editor layer-id="' + layerId + '"></convolution3d-editor>',
                'pooling1d':        '<pooling1d-editor layer-id="' + layerId + '"></pooling1d-editor>',
                'pooling2d':        '<pooling2d-editor layer-id="' + layerId + '"></pooling2d-editor>',
                'pooling3d':        '<pooling3d-editor layer-id="' + layerId + '"></pooling3d-editor>',
                'activation':       '<activation-editor layer-id="' + layerId + '"></activation-editor>',
                'merge':            '<merge-editor layer-id="' + layerId + '"></merge-editor>',
                'flatten':          '<flatten-editor layer-id="' + layerId + '"></flatten-editor>',
                'dense':            '<dense-editor layer-id="' + layerId + '"></dense-editor>',
                'datainput':        '<datainput-editor layer-id="' + layerId + '"></datainput-editor>',
                'dataoutput':       '<dataoutput-editor layer-id="' + layerId + '"></dataoutput-editor>'
            };
            return layerDirectives[layerType];
        }

        return {
            scope: {
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
