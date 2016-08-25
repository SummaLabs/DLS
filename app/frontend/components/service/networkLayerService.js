angular.module('networkLayerService', [])
    .service('networkLayerService', ['$http', NetworkLayerService]);

function NetworkLayerService($http) {
    var categories = [];
    var layers = [];

    this.getCategories = function() {
        var request = $http({
            method: "GET",
            url: "/network/layer/categories"
        }).then(function mySucces(response) {
        	layers.length = 0;
            response.data.forEach(function(layer) {
                categories.push(layer)
            });
            return categories;
        }, function myError(response) {
            console.log(response);
        });

        return request;
    };

    this.getLayers = function() {
        var request = $http({
            method: "GET",
            url: "/network/layers"
        }).then(function mySucces(response) {
            response.data.forEach(function(layer) {
                layers.push(layer)
            });
            return layers;
        }, function myError(response) {
            console.log(response);
        });

        return request;
    };

    this.getLayerByType = function(type) {
        for (var i = 0, len = layers.length; i < len; i++) {
            var layer = layers[i];
            if(layer.name == type) {
                return layer;
            }
        }
    };

    this.setLayers = function(new_layers) {
        layers = new_layers;
    };
}