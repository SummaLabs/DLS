angular.module('networkDataService', [])
    .service('networkDataService', ['networkDataLoaderService', '$rootScope', '$http', NetworkDataService]);


function NetworkDataService(networkDataLoaderService, $rootScope, $http) {
    var self = this;

    const networkEvent = {
        UPDATE: 'network:update',
        CLEAR: 'network:clear'
    };

    var isChangesSaved = false;

    var network =
    {
        name: 'New network',
        description: '',
        layers: []
    };

    var savedNetworks = [];

    this.pubNetworkUpdateEvent = function() {
        $rootScope.$emit(networkEvent.UPDATE, {});
    };

    this.subNetworkUpdateEvent = function(callback) {
        $rootScope.$on(networkEvent.UPDATE, callback);
    };

    this.pubClearNetworkEvent = function () {
        $rootScope.$emit(networkEvent.CLEAR, {});
    };

    this.subClearNetworkEvent = function (callback) {
        $rootScope.$on(networkEvent.CLEAR, callback);
    };

    this.isChangesSaved = function () {
        return network.layers.length == 0 || isChangesSaved;
    };

    this.setChangesSaved = function (state) {
        isChangesSaved = state;
    };
    
    this.getNetwork = function() {
        return network;
    };

    this.loadNetwork = function(name) {
        var self = this;
        this.pubClearNetworkEvent();
        var future = networkDataLoaderService.loadNetworkByName(name);
        future.then(function mySucces(response) {
            network.name = response.data.name;
            network.description = response.data.description;
            response.data.layers.forEach(function (layer) {
                network.layers.push(layer)
            });
            self.pubNetworkUpdateEvent();
        }, function myError(response) {});
    };

    this.getLayers = function() {
        return network.layers;
    };

    this.loadSavedNetworks = function () {
        $http({
            method: "GET",
            url: "/network/saved/names"
        }).then(function mySucces(response) {
            response.data.forEach(function(net_name) {
                savedNetworks.push(net_name)
            });
        }, function myError(response) {});

        return savedNetworks;
    };

    this.saveNetwork = function (name, description) {
        network.name = name;
        network.description = description;
        network.layers = filterNetwork(network.layers);
        var result = networkDataLoaderService.saveNetwork(network, name);
        result.then(function (response) {
                isChangesSaved = true;
                self.pubNetworkUpdateEvent();
            }, function (response) {
            }
        );
        savedNetworks.push(name);
    };

    function filterNetwork(rawNetwork) {
        var filteredNetwork = [];
        rawNetwork.forEach(function (layer) {
            var filteredLayer = {
                id: layer.id,
                name: layer.name,
                content: layer.content,
                category: layer.category,
                params: layer.params,
                wires: layer.wires,
                pos: layer.pos,
                template: layer.template
            };
            filteredNetwork.push(filteredLayer)
        });

        return filteredNetwork;
    }

    this.getLayerById = function(id) {
        for (var i = 0, len = network.layers.length; i < len; i++) {
            var layer = network.layers[i];
            if(layer.id == id) {
                return layer;
            }
        }
    };
}