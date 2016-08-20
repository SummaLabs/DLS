angular.module('networkLayerService', [])
    .service('networkLayerService', ['$http', NetworkLayerService]);

function NetworkLayerService($http) {
    var categories = [];
    var layers = [];
    
    this.getCategories = function() {
        $http({
            method: "GET",
            url: "/network/layer/categories"
        }).then(function mySucces(response) {
            response.data.forEach(function(layer) {
                categories.push(layer)
            });
        }, function myError(response) {
            console.log(response);
        });

        return categories;
    };

    this.setCategories = function(categories) {
        this.categories = categories
    };

    this.getLayers = function() {
        $http({
            method: "GET",
            url: "/network/layers"
        }).then(function mySucces(response) {
            response.data.forEach(function(layer) {
                layers.push(layer)
            });
        }, function myError(response) {
            console.log(response);
        });

        return layers;
    };

    this.setLayers = function(layers) {
        this.layers = layers;
    };
}