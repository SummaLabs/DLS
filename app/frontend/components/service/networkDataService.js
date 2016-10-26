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
        source: 'custom',
        preview: '',
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

    this.loadNetwork = function(name, source) {
        // $timeout(function () {
            network = {
                name: '',
                description: '',
                source: 'custom',
                preview: '',
                layers: []
            };

            self.pubClearNetworkEvent();
            var future = loadNetworkByName(name, source);
            future.then(function mySucces(response) {
                network.name = response.data.name;
                network.description = response.data.description;
                response.data.layers.forEach(function (layer) {
                    network.layers.push(layer)
                });
                self.pubNetworkUpdateEvent();
            }, function myError(response) {
            });
        // }, 400)
    };

    this.deleteNetwork = function(name) {
        if (network.name === name.name && network.layers.length > 0) {
            var toast = $mdToast.simple()
                .textContent('Could not remove network. "' + name.name + '"is open in in designer!')
                .highlightAction(true)
                .highlightClass('md-accent')// Accent is used by default, this just demonstrates the usage.
                .position('top right');
            $mdToast.show(toast).then(function (response) {
                if (response == 'ok') {
                    //todo
                }
            });
        } else {
            return removeNetworkByName(name.name, name.source);
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
        network.source = 'custom';
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

    this.clearLayers = function () {
        network.layers.length = 0;
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

    this.buildPreviewImage = function(layers, wh, ht, margin) {

        var x_min = Number.MAX_VALUE;
        var x_max = Number.MIN_VALUE;
        var y_min = Number.MAX_VALUE;
        var y_max = Number.MIN_VALUE;

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', wh);
        svg.setAttribute('height', ht);
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

        var html = '';

        if (layers.length > 1) {
            layers.forEach(function (node) {
                x_min = Math.min(x_min, node.pos.x);
                y_min = Math.min(y_min, node.pos.y);
                x_max = Math.max(x_max, node.pos.x);
                y_max = Math.max(y_max, node.pos.y);
            });

            var width = x_max - x_min;
            var height = y_max - y_min;
            if (width < 100)
                width = 100;
            if (height < 100)
                height = 100;

            var scaleX = (wh - (margin * 2)) / width;
            var scaleY = (ht - (margin * 2)) / height;
            var offsetX = margin - x_min * scaleX;
            var offsetY = margin - y_min * scaleY;

            layers.forEach(function (layer_from) {
                if (layer_from.wires)
                    layer_from.wires.forEach(function (node_id) {
                        for (let a = 0; a < layers.length; a++) {
                            if (layers[a].id == node_id) {
                                html += '<line x1="' + (offsetX + layer_from.pos.x * scaleX) + '"' +
                                    'y1="' + (offsetY + layer_from.pos.y * scaleY) + '"' +
                                    'x2="' + (offsetX + layers[a].pos.x * scaleX) + '"' +
                                    'y2="' + (offsetY + layers[a].pos.y * scaleY) + '"' +
                                    'style="stroke:#0000cc;stroke-width:1;stroke-opacity:0.5;"></line>';
                                break;
                            }
                        }
                    });
            });

            var radius = 10 * scaleX;
            if (radius < 2)
                radius = 2;
            layers.forEach(function (node) {
                html += '<circle r="' + radius + '" ' +
                    'cx="' + (offsetX + node.pos.x * scaleX) + '" ' +
                    'cy="' + (offsetY + node.pos.y * scaleY) + '" ' +
                    'style="fill:#0000cc;fill-opacity:0.5;stroke:#0000cc;stroke-width:0.5;stroke-opacity:0.5"></circle>';
            });
        }

        svg.innerHTML = html;
        var XMLS = new XMLSerializer();
		var xml = XMLS.serializeToString(svg);
		var svg64 = btoa(xml);


		var b64Start = 'data:image/svg+xml;base64,';
		var image64 = b64Start + svg64;

		return image64;
    };

    function loadNetworkByName(name, type) {
        return $http({
            method: "GET",
            url: "/network/load/" + type + '/' + name
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

    function removeNetworkByName(name, type) {
        return $http({
            method: "GET",
            url: "/network/remove/"+ type + '/' + name
        })
    }
}