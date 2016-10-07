'use strict';


angular.module('constructorCore', [
    'palette',
    'graph'
]);

var editorDefinition = {
    templateUrl: 'frontend/components/builder/constructor/core.html',
    controller: ConstructorController,
    replace: true,
    bindings: {}
};

angular.module('constructorCore')
    .component('constructor', editorDefinition)
    .service('coreService', CoreService);


function CoreService() {
    var store = {};
    store.scale = 1;

    this.param = function (key, value) {
        if (arguments.length === 1)
            return store[key];

        store[key] = value;
    };
}

function ConstructorController($mdDialog, $mdToast, $scope, $rootScope, networkDataService, networkLayerService, modelsService, coreService, appConfig, $mdSidenav) {
    var self = this;
    self.svgWidth = appConfig.svgDefinitions.areaWidth;
    self.svgHeight = appConfig.svgDefinitions.areaHeight;
    self.svgControl = {};
    constructorListeners();

    function doUpdateNetwork() {
        var nodes = self.svgControl.getNodes();
        var layers = networkDataService.getLayers();
        nodes.forEach(function (node) {
            var layer = networkDataService.getLayerById(node.id);
            layer.pos = node.pos;
        });
    }

    this.$onInit = function () {
        $scope.networkName = networkDataService.getNetwork().name;

        networkDataService.subNetworkUpdateEvent(function ($event, data) {
            $scope.networkName = networkDataService.getNetwork().name;
        });
    };

    this.checkModelJson = function ($event) {
        doUpdateNetwork();
        var dataNetwork = networkDataService.getNetwork();
        modelsService.checkNetworkFast(dataNetwork).then(
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
                    .highlightClass('md-accent')// Accent is used by default, this just demonstrates the usage.
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
    this.calcModelShape = function ($event) {
        doUpdateNetwork();
        var dataNetwork = networkDataService.getNetwork();
        modelsService.calcModelShape(dataNetwork).then(
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
                    .highlightClass('md-accent')// Accent is used by default, this just demonstrates the usage.
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


    this.saveNetworkDialog = function ($event) {
        doUpdateNetwork();
        var parentEl = angular.element(document.body);
        $mdDialog.show({
            clickOutsideToClose: true,
            parent: parentEl,
            targetEvent: $event,
            templateUrl: '/frontend/components/dialog/save-network.html',
            locals: {},
            controller: DialogController
        });

        function DialogController($scope, $mdDialog) {

            $scope.network =
            {
                name: networkDataService.getNetwork().name,
                description: networkDataService.getNetwork().description
            };

            $scope.saveNetwork = function () {
                networkDataService.saveNetwork($scope.network.name, $scope.network.description);
              /*  var image = buildPreviewImage(networkDataService.getNetwork().layers, 150, 150);
                var im = document.getElementById('img1');
                im.setAttribute('src', image);*/
                $mdDialog.hide();
            };

            $scope.closeDialog = function () {
                $mdDialog.hide();
            }
        }
    };

    this.zoomOut = function (event) {
        var scale = self.svgControl.getScale();
        scale /= appConfig.svgDefinitions.scaleFactor;
        if (scale > appConfig.svgDefinitions.scaleMin) {
            self.svgControl.scale(scale);
        }
    };

    this.zoomIn = function (event) {
        var scale = self.svgControl.getScale();
        scale *= appConfig.svgDefinitions.scaleFactor;
        if (scale < appConfig.svgDefinitions.scaleMax) {
            self.svgControl.scale(scale);
        }
    };

    this.resetView = function (event) {
        // self.svgControl.reset();
        var image = buildPreviewImage(networkDataService.getNetwork().layers, 300, 300, 20);
        var im = document.getElementById('img1');
        im.setAttribute('src', image);


    };

    function constructorListeners() {

        networkDataService.subNetworkUpdateEvent(setUpNetwork);

        $scope.$on('graph:init', function (event, node) {
            setUpNetwork();
        });

        $scope.$on('graph:addNode', function (event, node) {
            console.log('graph:addNode');
            var layers = networkDataService.getLayers();
            var layer = networkLayerService.getLayerByType(node.layerType);
            layers.push(layer);
            layer.id = node.id;
            layer.name = node.name;
            layer.layerType = node.layerType;
            layer.category = node.category;
            layer.pos = node.pos;
            layer.wires = node.wires;

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
            // console.log('graph:changedViews');
            $scope.$broadcast('constructor:viewport', data);
            event.stopPropagation();
        });

        $scope.$on('viewport:changed', function (event, data) {
            if (self.svgControl.viewportPos)
                self.svgControl.viewportPos(data.x, data.y);
            event.stopPropagation();
        });

        $scope.$on('graph:activateItem', function (event, item) {
            self.layerId = item.id;
            self.layerType = item.layerType;
            event.stopPropagation();
        });

        $scope.$on('graph:changePosition', function (event, node) {
            let layer = networkDataService.getLayerById(node.id);
            layer.pos.x = node.pos.x;
            layer.pos.y = node.pos.y;
            event.stopPropagation();
        });
        
        $scope.toggleLeft = buildToggler('left');
        $scope.toggleRight = buildToggler('right');

        function buildToggler(componentId) {
            return function() {
                $mdSidenav(componentId).toggle();
            }
        }

        function setUpNetwork() {
            self.svgControl.setLayers(networkDataService.getLayers());
        }
    }
    
    function buildPreviewImage(layers, wh, ht, margin) {

        var x_min = Number.MAX_VALUE;
        var x_max = Number.MIN_VALUE;
        var y_min = Number.MAX_VALUE;
        var y_max = Number.MIN_VALUE;

        layers.forEach(function (node) {
            x_min = Math.min(x_min, node.pos.x);
            y_min = Math.min(y_min, node.pos.y);
            x_max = Math.max(x_max, node.pos.x);
            y_max = Math.max(y_max, node.pos.y);
        });

        var width = x_max - x_min;
        var height = y_max - y_min;
        if (width < 1)
            width = 1;
        if (height < 1)
            height = 1;

        var scaleX = (wh - (margin * 2)) / width;
        var scaleY = (ht - (margin * 2)) / height;
        var offsetX = margin - x_min * scaleX;
        var offsetY = margin - y_min * scaleY;

        var svg = document.createElement('svg');
        svg.setAttribute('width', wh);
        svg.setAttribute('height', ht);
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

        var html = '';
        layers.forEach(function (layer_from) {
            if (layer_from.wires)
                layer_from.wires.forEach(function (node_id) {
                    for (let a = 0; a < layers.length; a++) {
                        if (layers[a].id == node_id) {
                            html += '<line x1="' + (offsetX + layer_from.pos.x * scaleX) + '"' +
                                'y1="' + (offsetY + layer_from.pos.y * scaleY) + '"' +
                                'x2="' + (offsetX + layers[a].pos.x * scaleX) + '"' +
                                'y2="' + (offsetY + layers[a].pos.y * scaleY) + '"' +
                                'stroke="blue" stroke-width="1"></line>';
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
                'style="fill:#ff0000;fill-opacity:1;stroke:blue;stroke-width:0.5;stroke-opacity:1"></circle>';
        });

        svg.innerHTML = html;
		var xml = new XMLSerializer().serializeToString(svg);

		var svg64 = btoa(xml);
		var b64Start = 'data:image/svg+xml;base64,';
		var image64 = b64Start + svg64;
		return image64;
    }
}