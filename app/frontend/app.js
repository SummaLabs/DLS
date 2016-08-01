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


function NetworkDataService(networkDataLoaderService) {
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

    this.setNetwork = function(network) {
        this.network = network;
    };

    this.addLayerToNetwork = function(layer) {
        this.network.push(layer);
    };

    this.updateNetworkLayer = function(layer) {
        network.push(layer);
    };

    this.getLayerById = function(id) {
        for (var i = 0, len = network.length; i < len; i++) {
            var layer = network[i];
            if(layer.id == id) {
                return layer;
            }
        }
    }
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
                ]
            }, {
                id: 1,
                name : 'convol',
                content : 'convolution',
                category : 'layer',
                pos: {x: 300, y: 100},
                wires: [0
                ]
            }, {
                id: 2,
                name : 'dense',
                content : 'dense',
                category : 'layer',
                pos: {x: 500, y: 300},
                wires: [1
                ]
            }, {
                id: 3,
                name : 'solver',
                content : 'solver',
                category : 'output',
                pos: {x: 750, y: 200},
                wires: [2
                ]
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
                selected: false
            }, {
                id: 2,
                name : 'convol',
                content : 'convolution',
                category : 'layer',
                selected: false
            },{
                id: 3,
                name : 'dense',
                content : 'dense',
                category : 'layer',
                selected: false
            }, {
                id: 4,
                name : 'solver',
                content : 'solver',
                category : 'output',
                selected: false
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