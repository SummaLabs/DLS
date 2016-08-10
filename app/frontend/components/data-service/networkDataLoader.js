angular.module('networkDataLoaderService', [])
    .service('networkDataLoaderService', ['$http', NetworkDataLoaderService]);

function NetworkDataLoaderService($http) {
    
    this.loadSavedNetworksNames = function () {
        var network_names = [];
        $http({
            method: "GET",
            url: "/network/saved/names"
        }).then(function mySucces(response) {
            response.data.forEach(function(net_name) {
                network_names.push(net_name)
            });
        }, function myError(response) {
            console.log(response);
        });

        return network_names;
    };

    this.loadNetworkByName = function (name) {
        var network;
        $http({
            method: "GET",
            url: "/network/load/" + name
        }).then(function mySucces(response) {
            network = response.data;
        }, function myError(response) {
            console.log(response);
        });
        return network;
    };

    this.loadNetwork = function () {
        var network = [
            {
                id: 0,
                name : 'data',
                content : 'data',
                category : 'input',
                pos: {x: 50, y: 200},
                wires: [
                ],
                params : {
                    datasetType : '',
                    datasetId : ''
                }
            }, {
                id: 1,
                name : 'convol',
                content : 'convolution',
                category : 'layer',
                pos: {x: 300, y: 100},
                wires: [0
                ],
                params : {
                    filtersCount : '',
                    filterWidth : '',
                    filterHeight : '',
                    activationFunction : '',
                    subsamplingType : '',
                    subsamplingSize : ''
                }
            }, {
                id: 2,
                name : 'dense',
                content : 'dense',
                category : 'layer',
                pos: {x: 500, y: 300},
                wires: [1
                ],
                params : {
                    activationFunction : '',
                    neuronsCount : ''
                }
            }, {
                id: 3,
                name : 'solver',
                content : 'solver',
                category : 'output',
                pos: {x: 750, y: 200},
                wires: [2
                ],
                params : {
                    lossFunction : '',
                    epochsCount : '',
                    snapshotInterval : '',
                    validationInterval : '',
                    batchSize : '',
                    learningRate : '',
                    optimizer : ''
                }
            }
        ];

        return network
    };

    this.loadLayers = function () {
        var layers = [];
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

    this.loadCategories = function () {
        var categories = [];
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
    }
}