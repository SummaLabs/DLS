angular.module('networkDataService', [])
    .service('networkDataService', ['networkDataLoaderService', '$rootScope', NetworkDataService]);


function NetworkDataService(networkDataLoaderService, $rootScope) {
    var isChangesSaved = false;
    var categories = networkDataLoaderService.loadCategories();
    var layers = networkDataLoaderService.loadLayers();

    var networkConf;
    var future = networkDataLoaderService.loadNetworkByName('demo_network.json');
    future.then(function mySucces(response) {
        networkConf = response.data;
    }, function myError(response) {
        console.log(response);
    });

    var network = networkDataLoaderService.loadNetwork();
    
    this.getNetworkConfig = function() {
        return networkConf;
    };

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
        networkConf = networkToSetup;
    };

    this.saveNetwork = function (name) {
        networkConf.name = name;
        networkConf.network = network;
        var result = networkDataLoaderService.saveNetwork(networkConf, name);
        result.then(
            function (response) {
                isChangesSaved = true;
            },
            function (response) {
                // silent
            }
        );
    };

    this.addLayerToNetwork = function(layer) {
        networkConf.network.push(layer);
        this.notifyNetworkUpdate();
    };

    this.getLayerById = function(id) {
        for (var i = 0, len = networkConf.length; i < len; i++) {
            var layer = networkConf[i];
            if(layer.id == id) {
                return layer;
            }
        }
    };

    this.notifyNetworkUpdate = function() {
        $rootScope.$emit('NetworkUpdated', {});
    };
}