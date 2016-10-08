angular.module('networkDataService', [])
    .service('networkDataService', ['$rootScope', '$http', '$timeout', '$mdToast', NetworkDataService]);


function NetworkDataService($rootScope, $http, $timeout, $mdToast) {
    var self = this;

    const networkEvent = {
        UPDATE: 'network:update',
        CLEAR: 'network:clear',
        ADD_LAYER: 'network:add',
        REMOVE_LAYER: 'network:remove'
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

    this.pubNetworkAddLayerEvent = function(layer) {
        $rootScope.$emit(networkEvent.ADD_LAYER, layer);
    };

    this.subNetworkAddLayerEvent = function(callback) {
        $rootScope.$on(networkEvent.ADD_LAYER, callback);
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
        $timeout(function () {
            network = {
                name: '',
                description: '',
                layers: []
            };

            self.pubClearNetworkEvent();
            var future = loadNetworkByName(name);
            future.then(function mySucces(response) {
                network.name = response.data.name;
                network.description = response.data.description;
                response.data.layers.forEach(function (layer) {
                    network.layers.push(layer)
                });
                self.pubNetworkUpdateEvent();
            }, function myError(response) {
            });
        }, 400)
    };

    this.deleteNetwork = function(name) {
        if (network.name === name && network.layers.length > 0) {
            var toast = $mdToast.simple()
                .textContent('Could not remove network. "' + name + '"is open in in designer!')
                .highlightAction(true)
                .highlightClass('md-accent')// Accent is used by default, this just demonstrates the usage.
                .position('top right');
            $mdToast.show(toast).then(function (response) {
                if (response == 'ok') {
                    //todo
                }
            });
        } else {
            return removeNetworkByName(name);
        }
    };

    this.setLayers = function(layers) {
        network.layers = layers;
    };

    this.getLayers = function() {
        return network.layers;
    };

    this.loadSavedNetworks = function () {
        return $http({
            method: "GET",
            url: "/network/saved/names"
        });
    };

    this.saveNetwork = function (name, description) {
        network.name = name;
        network.description = description;
        network.layers = filterNetwork(network.layers);
        var result = saveNetwork(network, name);
        result.then(function (response) {
                isChangesSaved = true;
                // self.pubNetworkUpdateEvent();
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
                layerType: layer.layerType,
                category: layer.category,
                params: layer.params,
                wires: layer.wires,
                pos: layer.pos,
                template: layer.template,
                icon: layer.icon
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

    this.removeLayerById = function(id) {
        var index = -1;
        for (var i = 0, len = network.layers.length; i < len; i++) {
            var layer = network.layers[i];
            if (layer.wires) {
                for (let a = 0; a < layer.wires.length; a++) {
                    if (layer.wires[a] === id) {
                        layer.wires.splice(a, 1);
                        break;
                    }
                }
            }
            if(layer.id === id)
                index = i;
        }
        if (index > -1)
            network.layers.splice(index, 1);

    };

    function loadNetworkByName(name) {
        return $http({
            method: "GET",
            url: "/network/load/" + name
        })
    }

    function saveNetwork(network) {
        return $http({
            url: '/network/save',
            method: 'POST',
            data: network,
            headers: {'Content-Type': 'application/json;charset=utf-8'}
        })
    }

    function removeNetworkByName(name) {
        return $http({
            method: "GET",
            url: "/network/remove/" + name
        })
    }
}