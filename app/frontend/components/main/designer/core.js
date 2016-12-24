'use strict';


angular.module('designerCore', [
    'palette',
    'graph',
    'trainingParams'
]);

let editorDefinition = {
    templateUrl: '/frontend/components/main/designer/core.html',
    controller: ConstructorController,
    replace: true,
    bindings: {}
};

angular.module('designerCore')
    .component('designer', editorDefinition)
    .service('coreService', ['layerService', 'appConfig', CoreService]);


function ConstructorController($mdDialog, $mdToast, $mdSidenav, $scope, networkDataService, modelService,  appConfig, layerService, coreService) {
    let self = this;

    self.svgWidth = appConfig.svgDefinitions.areaWidth;
    self.svgHeight = appConfig.svgDefinitions.areaHeight;
    self.svgControl = {};
    constructorListeners();

    function doUpdateNetwork() {

        let nodes = self.svgControl.getNodes();
        // let layers = networkDataService.getLayers();
        nodes.forEach(function (node) {
            let layer = networkDataService.getLayerById(node.id);
            layer.pos = node.pos;
        });
    }

    this.$onInit = function () {
        $scope.networkName = networkDataService.getNetwork().name;

        networkDataService.subNetworkUpdateEvent(function ($event, data) {
            $scope.networkName = networkDataService.getNetwork().name;
        });
    };

    this.trainModel = function ($event) {
        doUpdateNetwork();
        var dataNetwork = networkDataService.getNetwork();
        modelService.checkNetworkFast(dataNetwork).then(
            function successCallback(response) {
                let ret = response.data;
                if ((ret.length < 1) || (ret[0] != 'ok')) {
                    showToast(response.data) ;
                } else {
                    showTrainModelDialog(dataNetwork, $event);
                }
            },
            function errorCallback(response) {
                console.log(response.data);
            }
        );
        console.log();
    };

    this.createNewNetwork = function ($event) {
        var createNewNetworkFunc = function () {
            self.saveOrCreateNetworkDialog($event, false);
        };
        if (!networkDataService.isChangesSaved()) {
            self.saveOrCreateNetworkDialog($event, true, createNewNetworkFunc);
        } else {
            createNewNetworkFunc.call();
        }
    };

    function showToast(message) {
        $mdToast.show(
            $mdToast.simple()
                .textContent(message)
                .position('top right')
                .hideDelay(3000)
        );
    }

    function showTrainModelDialog(network, $event) {
        $mdDialog.show({
            clickOutsideToClose: true,
            parent: angular.element(document.body),
            targetEvent: $event,
            templateUrl: '/frontend/components/main/training-params/train-model-dialog.html',
            controller: function ($scope) {
                $scope.network = network;
                $scope.closeDialog = function () {
                    $mdDialog.hide();
                }
            }
        });
    }

    this.checkModelJson = function ($event) {
        doUpdateNetwork();
        var dataNetwork = networkDataService.getNetwork();
        modelService.checkNetworkFast(dataNetwork).then(
            function successCallback(response) {
                var ret = response.data;
                var isError = true;
                var strError = 'Unknown Error...';
                if (ret.length > 1) {
                    if (ret[0] == 'ok') {
                        isError = false;
                    } else {
                        strError = ret[1];
                    }
                }
                var retMessage = "OK: network is correct!";
                if (isError) {
                    retMessage = "ERROR: " + strError;
                }
                var toast = $mdToast.simple()
                    .textContent(retMessage)
                    .action('UNDO')
                    .highlightAction(true)
                    .highlightClass('md-accent')
                    .position('top right');
                $mdToast.show(toast).then(function (response) {
                    if (response == 'ok') {

                    }
                });
            },
            function errorCallback(response) {
                console.log(response.data);
            }
        );
    };
    this.calcModelShape = function ($event) {
        doUpdateNetwork();
        var dataNetwork = networkDataService.getNetwork();
        modelService.calcModelShape(dataNetwork).then(
            function successCallback(response) {
                var ret = response.data;
                var isError = true;
                var strError = 'Unknown Error...';
                if (ret['status'] == 'ok') {
                    isError = false;
                } else {
                    strError = ret['data'];
                }
                var retMessage = "OK: network is correct (please see dev-tools log)!";
                if (isError) {
                    retMessage = "ERROR: " + strError;
                } else {
                    console.log('*** Model with shapes ***');
                    console.log(ret['data']);
                    ret['data'].layers.forEach(function (layer) {
                        if (layer.shape) {
                            self.svgControl.setShape(layer.id, layer.shape.inp, 'in');
                            self.svgControl.setShape(layer.id, layer.shape.out, 'out');
                        }
                    });
                }
                var toast = $mdToast.simple()
                    .textContent(retMessage)
                    .action('UNDO')
                    .highlightAction(true)
                    .highlightClass('md-accent')
                    .position('top right');
                $mdToast.show(toast).then(function (response) {
                    if (response == 'ok') {
                        //todo
                    }
                });
            },
            function errorCallback(response) {
                console.log(response.data);
            }
        );
    };


    this.saveOrCreateNetworkDialog = function ($event, doSave, createNewNetworkFunc) {
        doUpdateNetwork();
        var parentEl = angular.element(document.body);
        $mdDialog.show({
            clickOutsideToClose: true,
            parent: parentEl,
            targetEvent: $event,
            templateUrl: '/frontend/components/main/network/save-network.html',
            locals: {},
            controller: DialogController
        });

        function DialogController($scope, $mdDialog) {
            if (doSave) {
                $scope.title = "Save Current Network";
            } else {
                $scope.title = "Create New Network";
            }

            $scope.network = {};
            if (doSave) {
                $scope.network.name = networkDataService.getNetwork().name;
                $scope.network.description = networkDataService.getNetwork().description;
            } else {
                $scope.network.name = "New Network";
                $scope.network.description = "";
            }

            $scope.saveNetwork = function () {

                if (doSave) {
                    var image = networkDataService.buildPreviewImage(networkDataService.getNetwork().layers, 150, 150, 20);
                    networkDataService.getNetwork().preview = image;
                    networkDataService.saveNetwork($scope.network.name, $scope.network.description);
                } else {
                    self.clear();
                    networkDataService.createNewNetwork($scope.network.name, $scope.network.description);
                    networkDataService.pubNetworkUpdateEvent();
                }
                $mdDialog.hide();
                if (createNewNetworkFunc) {
                    createNewNetworkFunc.call();
                }
            };

            $scope.closeDialog = function () {
                $mdDialog.hide();
                if (createNewNetworkFunc) {
                    createNewNetworkFunc.call();
                }
            }
        }
    };

    this.zoomOut = function (event) {
        let scale = self.svgControl.getScale();
        scale /= appConfig.svgDefinitions.scaleFactor;
        if (scale > appConfig.svgDefinitions.scaleMin) {
            self.svgControl.scale(scale);
        }
    };

    this.zoomIn = function (event) {
        let scale = self.svgControl.getScale();
        scale *= appConfig.svgDefinitions.scaleFactor;
        if (scale < appConfig.svgDefinitions.scaleMax) {
            self.svgControl.scale(scale);
        }
    };

    this.resetView = function (event) {
        self.svgControl.reset();
    };

    this.clear = function (event) {
        self.svgControl.clear();
        networkDataService.clearLayers();
    };

    function createLayer(node) {
        let layers = networkDataService.getLayers();
        let layer = layerService.getLayerByType(node.layerType);
        layers.push(layer);
        layer.id = node.id;
        layer.name = node.name;
        layer.layerType = node.layerType;
        layer.category = node.category;
        layer.pos = {
            x: node.pos.x,
            y: node.pos.y
        };
        layer.wires = node.wires;
        return layer;
    }

    function constructorListeners() {

        networkDataService.subNetworkUpdateEvent(setUpNetwork);
        let bInit = false;
        let bUpdate = false;

        $scope.$on('graph:init', function (event, node) {
            bInit = true;
            setUpNetwork();
        });

        $scope.$on('graph:addNode', function (event, node) {
            console.log('graph:addNode');
            createLayer(node);
            networkDataService.setChangesSaved(false);
            event.stopPropagation();
        });

        $scope.$on('graph:removeNode', function (event, node) {
            console.log('graph:removeNode');

            networkDataService.removeLayerById(node.id);

            networkDataService.setChangesSaved(false);
            event.stopPropagation();
        });

        $scope.$on('graph:addLink', function (event, link) {
            console.log('graph:addLink');

            let layer = networkDataService.getLayerById(link.nodes[0].id);
            if (!layer)
                layer = createLayer(link.nodes[0]);
            if (!layer.wires)
                layer.wires = [];
            layer.wires.push(link.nodes[1].id);

            networkDataService.setChangesSaved(false);
            event.stopPropagation();
        });

        $scope.$on('graph:removeLink', function (event, link) {
            console.log('graph:removeLink');

            let layer = networkDataService.getLayerById(link.nodes[0].id);
            layer.wires.splice(layer.wires.indexOf(link.nodes[1].id), 1);

            networkDataService.setChangesSaved(false);
            event.stopPropagation();
        });

        $scope.$on('graph:removeItems', function (event, items) {
            console.log('graph:removeItems');

            for (let a = 0; a < items.links.length; a++) {
                let link = items.links[a];
                let layer = networkDataService.getLayerById(link.nodes[0].id);
                layer.wires.splice(layer.wires.indexOf(link.nodes[1].id), 1);
            }

            for (let a = 0; a < items.nodes.length; a++) {
                networkDataService.removeLayerById(items.nodes[a]);
            }

            networkDataService.setChangesSaved(false);
            event.stopPropagation();
        });

        $scope.$on('graph:changedViews', function (event, data) {
            data.eventType = 'move';
            $scope.$broadcast('constructor:viewport', data);
            event.stopPropagation();
        });

        $scope.$on('graph:addedLayers', function (event, data) {
            data.eventType = 'update';
            $scope.$broadcast('constructor:viewport', data);
            event.stopPropagation();
        });

        $scope.$on('graph:activateItem', function (event, item) {
            $scope.$apply( function() {
                self.layer = coreService.getLayerById(item.id);
            });
            event.stopPropagation();
        });

        $scope.$on('graph:changePosition', function (event, node) {
            let layer = networkDataService.getLayerById(node.id);
            if (!layer)
                layer = createLayer(node);
            layer.pos.x = node.pos.x;
            layer.pos.y = node.pos.y;
            event.stopPropagation();
        });

        $scope.$on('graph:update', function (event, layers) {
            let existLayers = networkDataService.getLayers();
            layers.forEach(function (layer) {
                let existLayer = networkDataService.getLayerById(layer.id);
                if (existLayer) {
                    existLayer.pos = layer.pos;
                    if (layer.wires)
                        existLayer.wires = layer.wires;
                    if (layer.params) {
                         existLayer.parems = layer.params;
                    }
                } else {
                    let layerTemp = layerService.getLayerByType(layer.layerType);

                    layerTemp.id = layer.id;
                    layerTemp.name = layer.name;
                    layerTemp.layerType = layer.layerType;
                    layerTemp.category = layer.category;
                    layerTemp.pos = layer.pos;
                    layerTemp.wires = layer.wires;
                    existLayers.push(layerTemp);
                }


            });

            event.stopPropagation();
        });
        $scope.$on('viewport:changed', function (event, data) {
            if (self.svgControl.viewportPos)
                self.svgControl.viewportPos(data.x, data.y);
            event.stopPropagation();
        });

        $scope.toggleUndo = function () {
            self.svgControl.undo();
        };

        $scope.toggleRedo = function () {
            self.svgControl.redo();
        };


        $scope.toggleIcon = 'keyboard_tab';
        $scope.toggleLeft = buildToggler('left');
        $scope.toggleRight = buildToggler('right');

        function buildToggler(componentId) {
            let opened = true;
            return function() {
                $mdSidenav(componentId).toggle();
                if (componentId === 'right') {
                    opened = !opened;
                    if (opened) {
                        $scope.toggleIcon = 'keyboard_tab';
                    } else {
                        $scope.toggleIcon = 'keyboard_return'
                    }
                }
            }
        }

        function setUpNetwork() {
            if (bInit)
                self.svgControl.setLayers(networkDataService.getLayers());
            else bUpdate = true;
        }
    }

    function adaptNetworkPositions(layers, maxWidth, maxHeight) {
        iteration();
        function iteration() {

            let mustMoved = false;

            do {
                mustMoved = false;
                for (let a = 0; a < layers.length; a++) {
                    if (!layers[a].wires)
                            continue;
                    for (let w = 0; w < layers[a].wires.length; w ++) {

                        for (let b = 0; b < layers.length; b++) {

                            if (layers[a].wires[w] === layers[b].id) {
                                let diff = layers[b].pos.y - layers[a].pos.y;

                                if (diff > 0 && diff < maxHeight) {
                                    mustMoved = true;
                                    layers[b].pos.y = layers[a].pos.y + maxHeight;
                                } else if (diff < 0 && diff > -maxHeight) {
                                    mustMoved = true;
                                    layers[a].pos.y = layers[b].pos.y + maxHeight;
                                }
                                break;
                            }
                        }
                    }
                }
            } while (mustMoved);
        }
        iteration();

    }
}