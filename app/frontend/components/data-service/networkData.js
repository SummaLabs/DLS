angular.module('networkDataService', [])
    .service('networkDataService', ['networkDataLoaderService', '$rootScope', NetworkDataService]);


function NetworkDataService(networkDataLoaderService, $rootScope) {

    var self = this;
    const networkEvent = {
        UPDATE: 'network:update',
        CLEAR: 'network:clear',
        ADD_LAYER: 'network:add',
        REMOVE_LAYER: 'network:remove'
    };

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

    this.pubNetworkAddLayerEvent = function(layer) {
        $rootScope.$emit(networkEvent.ADD_LAYER, layer);
    };

    this.subNetworkAddLayerEvent = function(callback) {
        $rootScope.$on(networkEvent.ADD_LAYER, callback);
    };

    var isChangesSaved = false;
    var network =
    {
        name: '',
        description: '',
        layers: []
    };

    this.isChangesSaved = function () {
        return network.layers.length == 0 || isChangesSaved;
    };

    this.setChangesSaved = function () {
        isChangesSaved = true;
    };
    
    this.getNetwork = function() {
        return network;
    };

    this.loadNetwork = function(name) {
        network = {
            name: '',
            description: '',
            layers: []
        };
        this.pubClearNetworkEvent();
        var future = networkDataLoaderService.loadNetworkByName(name);
        future.then(function mySucces(response) {
            network.name = response.data.name;
            network.description = response.data.description;
            // while (network.layers.length > 0) {
            //     network.layers.pop();
            // }
            response.data.layers.forEach(function (layer) {
                network.layers.push(layer)
            });
            self.pubNetworkUpdateEvent();
        }, function myError(response) {});
    };

    this.getLayers = function() {
        return network.layers;
    };

    this.saveNetwork = function (name, description) {
        network.name = name;
        network.description = description;
        network.layers = filterNetwork(network.layers);
        var result = networkDataLoaderService.saveNetwork(network, name);
        result.then(
            function (response) {
                isChangesSaved = true;
            }, function (response) {}
        );
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

    this.addLayerToNetwork = function(layer) {
        network.network.push(layer);
//        this.notifyNetworkUpdate();
    };

    this.getLayerById = function(id) {
        for (var i = 0, len = network.length; i < len; i++) {
            var layer = network[i];
            if(layer.id == id) {
                return layer;
            }
        }
    };
}