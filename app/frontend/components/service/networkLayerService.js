angular.module('networkLayerService', [])
    .service('networkLayerService', ['$rootScope', '$http', NetworkLayerService]);

function NetworkLayerService($rootScope, $http) {
    var self = this;

    const networkLayerEvent = {
        UPDATE: 'layer:update',
        CLEAR: 'layer:clear',
        ADD: 'layer:add',
        REMOVE: 'layer:remove'
    };

    var categories = [];
    var layers = [];

    this.pubLayersUpdateEvent = function() {
        $rootScope.$emit(networkLayerEvent.UPDATE, {});
    };

    this.subLayersUpdateEvent = function(callback) {
        $rootScope.$on(networkLayerEvent.UPDATE, callback);
    };

    this.loadCategoryLayerTree = function () {
        var future = loadCategoriesHttp();
        future.then(function mySucces(response) {
            categories.length = 0;
            response.data.forEach(function (layer) {
                categories.push(layer);
            });
            var future = loadLayersHttp();
            future.then(function mySucces(response) {
                layers.length = 0;
                response.data.forEach(function (layer) {
                    layers.push(layer)
                });
                self.pubLayersUpdateEvent();
            }, function myError(response) {
            });
        }, function myError(response) {
        });
    };

    function loadCategoriesHttp() {
        return $http({
            method: "GET",
            url: "/network/layer/categories"
        })
    }

    function loadLayersHttp() {
        return $http({
            method: "GET",
            url: "/network/layers"
        })
    }

    this.getCategories = function() {
        return categories;
    };

    this.getLayers = function() {
        return layers;
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