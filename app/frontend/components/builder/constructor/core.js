'use strict';


angular.module('constructorCore', [
	'palette',
	'graph'
]);

var editorDefinition = {
	templateUrl: 'frontend/components/builder/constructor/core.html',
	controller: ConstructorController,
	replace: true,
	bindings: {
	}
};

angular.module('constructorCore')
	.component('constructor', editorDefinition)
	.service('coreService', CoreService);


function CoreService() {
    var store = {};
    store.scale = 1;

    this.param = function(key, value) {
        if (arguments.length === 1)
            return store[key];

        store[key] = value;
    };
}

function ConstructorController($mdDialog, $scope, $rootScope, networkDataService, networkLayerService, coreService, appConfig) {
    var self = this;
    self.svgWidth = appConfig.svgDefinitions.areaWidth;
    self.svgHeight = appConfig.svgDefinitions.areaHeight;
    self.svgControl = {};
    constructorListeners();

    function doUpdateNetwork() {
		var nodes = self.svgControl.getNodes();
		var layers = networkDataService.getLayers();

		nodes.forEach(function(node, i, ar){
			var layer = networkDataService.getLayerById(node.id);
			if (!layer) {
				layer = networkLayerService.getLayerByType(node.name);
				layers.push(layer);
			}

			layer.id = node.id;
			layer.name = node.name;
			layer.category = node.category;
			layer.pos = node.pos;
			layer.wires = node.wires;
		});
		networkDataService.setLayers(layers);
    }

	this.$onInit = function() {
        $scope.networkName = networkDataService.getNetwork().name;

		networkDataService.subNetworkUpdateEvent(function ($event, data) {
			$scope.networkName = networkDataService.getNetwork().name;
		});

		$rootScope.$on('EditLayer', function ($event, data) {
			doUpdateNetwork();
			var parentEl = angular.element(document.body);
			var dialogTemplate = buildTemplate(data.id, data.layerType);
			$mdDialog.show({
				clickOutsideToClose: true,
				parent: parentEl,
				targetEvent: null,
				template: dialogTemplate,
				locals: {},
				controller: DialogController
			});

			function DialogController($scope, $mdDialog) {
				$scope.closeDialog = function() {
					$mdDialog.hide();
				}
			}

			function buildTemplate(layerId, layerType) {
				var template =
					'<md-dialog flex="25" aria-label="' + layerType + '">' +
					'  <md-dialog-content>'+
					'    <layer-editor layer-id="' + layerId + '" layer-type="' + layerType + '" do-on-submit="closeDialog()"></layer-editor>' +
					'  </md-dialog-content>' +
					'</md-dialog>';
				return template;
			}
		});
	};

	this.saveNetworkDialog = function ($event) {
		doUpdateNetwork();
		var parentEl = angular.element(document.body);
		$mdDialog.show({
			clickOutsideToClose: true,
			parent: parentEl,
			targetEvent: $event,
			templateUrl: '/frontend/components/dialog/save-network.html',
			locals: {
			},
			controller: DialogController
		});

		function DialogController($scope, $mdDialog) {

			$scope.network =
			{
				name: networkDataService.getNetwork().name,
				description : networkDataService.getNetwork().description
			};

			$scope.saveNetwork = function () {
				networkDataService.saveNetwork($scope.network.name, $scope.network.description);
				$mdDialog.hide();
			};

			$scope.closeDialog = function () {
				$mdDialog.hide();
			}
		}
	}

	this.zoomOut = function(event) {
        var scale = coreService.param('scale');
        scale /= appConfig.svgDefinitions.scaleFactor;
        if (scale > appConfig.svgDefinitions.scaleMin) {
            coreService.param('scale', scale);
        }
    };

    this.zoomIn = function(event) {
        var scale = coreService.param('scale');
        scale *= appConfig.svgDefinitions.scaleFactor;
        if (scale < appConfig.svgDefinitions.scaleMax) {
            coreService.param('scale', scale);
        }
    };

    function constructorListeners() {

        networkDataService.subNetworkUpdateEvent(setUpNetwork);

        $scope.$on('graph:addNode', function (event, data) {
            console.log('graph:addNode');
            networkDataService.setChangesSaved(false);
			event.stopPropagation();
		});

		$scope.$on('graph:removeNode', function (event, data) {
		    console.log('graph:removeNode');
            networkDataService.setChangesSaved(false);
			event.stopPropagation();
		});

		$scope.$on('graph:addLink', function (event, data) {
		    console.log('graph:addLink');
		    networkDataService.setChangesSaved(false);
			event.stopPropagation();
		});

		$scope.$on('graph:removeLink', function (event, data) {
		    console.log('graph:removeLink');
		    networkDataService.setChangesSaved(false);
			event.stopPropagation();
		});

		$scope.$on('graph:removeItems', function (event, data) {
		    console.log('graph:removeItems');
		    networkDataService.setChangesSaved(false);
			event.stopPropagation();
		});

		$scope.$on('viewport::changed', function (event, data) {
            self.svgControl.viewportPos(data.x, data.y);
            event.stopPropagation();
		});

		function setUpNetwork() {
		    console.log('update');
            self.svgControl.setLayers(networkDataService.getLayers());
		};
    }
}