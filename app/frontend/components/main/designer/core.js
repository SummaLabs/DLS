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

    this.$onInit = function () {
        $scope.networkName = networkDataService.getNetwork().name;

        networkDataService.subNetworkUpdateEvent(function ($event, data) {
            $scope.networkName = networkDataService.getNetwork().name;
        });
    };

    this.trainModel = function ($event) {
        networkDataService.setLayers(coreService.getNetwork());
        let dataNetwork = networkDataService.getNetwork();
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
        let createNewNetworkFunc = function () {
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
        networkDataService.setLayers(coreService.getNetwork());
        let dataNetwork = networkDataService.getNetwork();
        modelService.checkNetworkFast(dataNetwork).then(
            function successCallback(response) {
                let ret = response.data;
                let isError = true;
                let strError = 'Unknown Error...';
                if (ret.length > 1) {
                    if (ret[0] == 'ok') {
                        isError = false;
                    } else {
                        strError = ret[1];
                    }
                }
                let retMessage = "OK: network is correct!";
                if (isError) {
                    retMessage = "ERROR: " + strError;
                }
                let toast = $mdToast.simple()
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
        networkDataService.setLayers(coreService.getNetwork());
        let dataNetwork = networkDataService.getNetwork();
        modelService.calcModelShape(dataNetwork).then(
            function successCallback(response) {
                let ret = response.data;
                let isError = true;
                let strError = 'Unknown Error...';
                if (ret['status'] == 'ok') {
                    isError = false;
                } else {
                    strError = ret['data'];
                }
                let retMessage = "OK: network is correct (please see dev-tools log)!";
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
                let toast = $mdToast.simple()
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
        networkDataService.setLayers(coreService.getNetwork());
        console.log(networkDataService.getLayers());


        let parentEl = angular.element(document.body);
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
                    let image = networkDataService.buildPreviewImage(networkDataService.getNetwork().layers, 150, 150, 20);
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

    function constructorListeners() {

        networkDataService.subNetworkUpdateEvent(setUpNetwork);
        let bInit = false;

        $scope.$on('graph:init', function (event, node) {
            bInit = true;
        });

        $scope.$on('graph:addNode', function (event, node) {
            networkDataService.setChangesSaved(false);
            event.stopPropagation();
        });

        $scope.$on('graph:removeNode', function (event, node) {
            networkDataService.setChangesSaved(false);
            event.stopPropagation();
        });

        $scope.$on('graph:addLink', function (event, link) {
            networkDataService.setChangesSaved(false);
            event.stopPropagation();
        });

        $scope.$on('graph:removeLink', function (event, link) {
            networkDataService.setChangesSaved(false);
            event.stopPropagation();
        });

        $scope.$on('graph:removeItems', function (event, items) {
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
            self.svgControl.clear(true);
            self.svgControl.setLayers(networkDataService.getLayers());
        }
    }
}