(function () {
    'use strict';

    angular
        .module('layerEditor', ['ngMaterial'])
        .directive('layerEditor', ['$compile', function($compile) {

            function buildTemplate(layerId, layerType) {
                var layerDirectives =
                {
                    'data':'<input-data-editor layer-id="' + layerId + '" do-on-submit="closeDialog()"></input-data-editor>',
                    'convol':'<convol-editor layer-id="' + layerId + '" do-on-submit="closeDialog()"></convol-editor>',
                    'dense':'<dense-editor layer-id="' + layerId + '" do-on-submit="closeDialog()"></dense-editor>',
                    'solver':'<solver-editor layer-id="' + layerId + '" do-on-submit="closeDialog()"></solver-editor>'
                };
                return layerDirectives[layerType];
            }

            return {
                scope: {
                    doOnSubmit: '&'
                },
                link: function(scope, element, attrs) {
                    var id = scope.$eval(attrs.layerId);
                    var type = attrs.layerType;
                    var template = buildTemplate(id, type);
                    var compiled = $compile(template)(scope);
                    element.append(compiled);
                }
            };
        }]);

})();
