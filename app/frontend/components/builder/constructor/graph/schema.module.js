'use strict';

angular.module('graph', [])
    .directive('svgGraph', function () {
        return {
            restrict: 'E',
            controller: ['$scope', '$rootScope', '$element', 'coreService', 'appConfig', '$compile', 'layerService', SchemaController],
            controllerAs: 'svg',
            replace: true,
            scope: {
                controlItem: '=',
                svgWidth: '=',
                svgHeight: '=',
                svgColor: '@'
            },
            // templateNamespace: 'svg',
            templateUrl: 'frontend/components/builder/constructor/graph/graph.html'
        }
    });
