angular.module('layersVisualizationService', [])
    .service('layersVisualizationService', ['$rootScope', '$http', LayersVisualizationService]);

function LayersVisualizationService($rootScope, $http) {
    var self = this;
    self.load = function () {
        return $http({
            method: 'GET',
            url: '/model/layers/visualize/'
        });
    };
}
