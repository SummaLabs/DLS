(function () {
    'use strict';

    angular
        .module('layerEditor', ['ngMaterial'])
        .directive('layerEditor', ['$compile', function($compile) {

            function buildTemplate(layerId, layerType) {
                var layerDirectives =
                {
                    'data':'<input-data-editor layer-id="' + layerId + '" do-on-submit="doOnSubmit()"></input-data-editor>',
                    'convolution':'<convol-editor layer-id="' + layerId + '" do-on-submit="doOnSubmit()"></convol-editor>',
                    'dense':'<dense-editor layer-id="' + layerId + '" do-on-submit="doOnSubmit()"></dense-editor>',
                    'solver':'<solver-editor layer-id="' + layerId + '" do-on-submit="doOnSubmit()"></solver-editor>'
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

})();
