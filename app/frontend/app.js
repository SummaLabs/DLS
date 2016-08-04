'use strict';

angular.module('dlsApp', ['ngMaterial',
    'mainMenu',
    'constructorCore',
    'networkMain',
    'modelMain',
    'mainDataSet',
    'convolEditor',
    'inputDataEditor',
    'denseEditor',
    'solverEditor'])
    .service('networkDataLoaderService', NetworkDataLoaderService)
    .service('networkDataService', ['networkDataLoaderService', NetworkDataService]);


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
        return network;
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

function NetworkDataLoaderService() {

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
        var layers = [
            {
                id: 1,
                name : 'data',
                content : 'data',
                category : 'input',
                selected: false,
                params : {
                    datasetType : '',
                    datasetId : ''
                }
            }, {
                id: 2,
                name : 'convol',
                content : 'convolution',
                category : 'layer',
                selected: false,
                params : {
                    filtersCount : '',
                    filterWidth : '',
                    filterHeight : '',
                    activationFunction : '',
                    subsamplingType : '',
                    subsamplingSize : ''
                }
            },{
                id: 3,
                name : 'dense',
                content : 'dense',
                category : 'layer',
                selected: false,
                params : {
                    activationFunction : '',
                    neuronsCount : ''
                }
            }, {
                id: 4,
                name : 'solver',
                content : 'solver',
                category : 'output',
                selected: false,
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

        return layers;
    };

    this.loadCategories = function () {

        var categories = [
            {
                name : 'input'
            },
            {
                name : 'layer'
            },
            {
                name : 'output'
            }
        ];

        return categories;
    }
}