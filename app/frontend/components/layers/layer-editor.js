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
        'upsampling2dEditor',
        'upsampling3dEditor',
        'datainputEditor',
        'dataoutputEditor'
    ])
    .directive('layerEditor', ['$compile', function($compile) {

        function buildTemplate(layer) {
            var layerDirectives =
            {
                'convolution1d':    '<convolution1d-editor layer-data=elem.layer></convolution1d-editor>',
                'convolution2d':    '<convolution2d-editor layer-data=elem.layer></convolution2d-editor>',
                'convolution3d':    '<convolution3d-editor layer-data=elem.layer></convolution3d-editor>',
                'pooling1d':        '<pooling1d-editor layer-data=elem.layer></pooling1d-editor>',
                'pooling2d':        '<pooling2d-editor layer-data=elem.layer></pooling2d-editor>',
                'pooling3d':        '<pooling3d-editor layer-data=elem.layer></pooling3d-editor>',
                'activation':       '<activation-editor layer-data=elem.layer></activation-editor>',
                'merge':            '<merge-editor layer-data=elem.layer></merge-editor>',
                'flatten':          '<flatten-editor layer-data=elem.layer></flatten-editor>',
                'dense':            '<dense-editor layer-data=elem.layer></dense-editor>',
                'upsampling2d':     '<upsampling2d-editor layer-data=elem.layer></upsampling2d-editor>',
                'upsampling3d':     '<upsampling3d-editor layer-data=elem.layer></upsampling3d-editor>',
                'datainput':        '<datainput-editor layer-data=elem.layer></datainput-editor>',
                'dataoutput':       '<dataoutput-editor layer-data=elem.layer></dataoutput-editor>'
            };
            return layerDirectives[layer.layerType];
        }
        
        function ElementController($scope, $element) {
            let self = this;
            $scope.$watch('layerData.id', function(newValue, oldValue) {
                self.layer = $scope.layerData;
                if (!self.layer)
                    return;
                let template = buildTemplate(self.layer);

                $element.html(template);
                $compile($element.contents())($scope);

            });
        }

        return {
            controller: ElementController,
            controllerAs: 'elem',
            scope: {
                layerData: '='
            }
        };
    }]);
