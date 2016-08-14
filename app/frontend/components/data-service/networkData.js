angular.module('networkDataService', [])
    .service('networkDataService', ['networkDataLoaderService', '$rootScope', NetworkDataService]);


function NetworkDataService(networkDataLoaderService, $rootScope) {
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
        }, function myError(response) {});
    };

    this.getLayers = function() {
        return network.layers;
    };

    this.saveNetwork = function (name, description) {
        network.name = name;
        network.description = description;
        network.network = filterNetwork(network.layers);
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