'use strict';


angular.module('constructorCore', [
	'palette',
	'graph'
]);

var editorDefinition = {
	templateUrl: 'frontend/components/builder/constructor/core.html',
	controller: ConstructorController,
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

function ConstructorController($mdDialog, $scope, $rootScope, networkDataService, coreService, appConfig) {
    var self = this;
    self.svgWidth = appConfig.svgDefinitions.areaWidth;
    self.svgHeight = appConfig.svgDefinitions.areaHeight;
    self.svgControl = {};
    constructorListeners();

	this.$onInit = function() {
        $scope.networkName = networkDataService.getNetwork().name;

		networkDataService.subNetworkUpdateEvent(function ($event, data) {
			$scope.networkName = networkDataService.getNetwork().name;
		});

		$rootScope.$on('EditLayer', function ($event, data) {
			var parentEl = angular.element(document.body);
			var dialogTemplate = buildTemplate(data.id, data.layerType);
			$mdDialog.show({
				clickOutsideToClose: true,
				parent: parentEl,
				targetEvent: $event,
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
					'<md-dialog flex="25" ng-cloak>' +
					'  <md-dialog-content>'+
					'    <layer-editor layer-id="' + layerId + '" layer-type="' + layerType + '" do-on-submit="closeDialog()"></layer-editor>' +
					'  </md-dialog-content>' +
					'</md-dialog>';

				return template;
			}
		});
	};

	this.saveNetworkDialog = function ($event) {
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

        networkDataService.subNetworkUpdateEvent(updateNetwork);

        $scope.$on('graph:addNode', function (event, data) {
            console.log('graph:addNode');
            networkDataService.setLayers(self.svgControl.getNodes());
            networkDataService.setChangesSaved(false);
			event.stopPropagation();
		});

		$scope.$on('graph:removeNode', function (event, data) {
		    console.log('graph:removeNode');
		    networkDataService.setLayers(self.svgControl.getNodes());
            networkDataService.setChangesSaved(false);
			event.stopPropagation();
		});

		$scope.$on('graph:addLink', function (event, data) {
		    console.log('graph:addLink');
		    networkDataService.setLayers(self.svgControl.getNodes());
		    networkDataService.setChangesSaved(false);
			event.stopPropagation();
		});

		$scope.$on('graph:removeLink', function (event, data) {
		    console.log('graph:removeLink');
		    networkDataService.setLayers(self.svgControl.getNodes());
		    networkDataService.setChangesSaved(false);
			event.stopPropagation();
		});

		$scope.$on('graph:removeItems', function (event, data) {
		    console.log('graph:removeItems');
		    networkDataService.setLayers(self.svgControl.getNodes());
		    networkDataService.setChangesSaved(false);
			event.stopPropagation();
		});

		function updateNetwork() {
            self.svgControl.setNodes(networkDataService.getLayers());
		};
    }
}