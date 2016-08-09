angular.module('networkDataService', [])
    .service('networkDataService', ['networkDataLoaderService', '$rootScope', NetworkDataService]);


function NetworkDataService(networkDataLoaderService, $rootScope) {
    var categories = networkDataLoaderService.loadCategories();
    var layers = networkDataLoaderService.loadLayers();
    var network = networkDataLoaderService.loadNetwork();

    this.getCategories = function() {
        return categories;
    };

    this.setCategories = function(categories) {
        this.categories = categories
    };

    this.getLayers = function() {
        return layers;
    };

    this.setLayers = function(layers) {
        this.layers = layers;
    };

    this.getNetwork = function() {
        return network.slice();
    };

    this.setNetwork = function(networkToSetup) {
        network = networkToSetup;
    };

    this.addLayerToNetwork = function(layer) {
        network.push(layer);
        this.notifyNetworkUpdate();
    };

    this.getLayerById = function(id) {
        for (var i = 0, len = network.length; i < len; i++) {
            var layer = network[i];
            if(layer.id == id) {
                return layer;
            }
        }
    };

    this.notifyNetworkUpdate = function() {
        $rootScope.$emit('NetworkUpdated', {});
    };
}