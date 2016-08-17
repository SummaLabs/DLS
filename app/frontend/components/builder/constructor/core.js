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
    self.nodes = [
    {
      "id": 0,
      "name": "data",
      "content": "data",
      "category": "input",
      "pos": {
        "x": 50,
        "y": 200
      },
      "wires": [
      ],
      "params": {
        "datasetType": "",
        "datasetId": ""
      },
      "template": "frontend/components/layers/data/node-test-2.svg"
    },
    {
      "id": 1,
      "name": "convol",
      "content": "convolution",
      "category": "layer",
      "pos": {
        "x": 300,
        "y": 100
      },
      "wires": [
        0
      ],
      "params": {
        "filtersCount": "",
        "filterWidth": "",
        "filterHeight": "",
        "activationFunction": "",
        "subsamplingType": "",
        "subsamplingSize": ""
      },
      "template": "frontend/components/layers/convol/node-test-2.svg"
    },
    {
      "id": 2,
      "name": "dense",
      "content": "dense",
      "category": "layer",
      "pos": {
        "x": 500,
        "y": 300
      },
      "wires": [
        1
      ],
      "params": {
        "activationFunction": "",
        "neuronsCount": ""
      },
      "template": "frontend/components/layers/dense/node-test-4.svg"
    },
    {
      "id": 3,
      "name": "solver",
      "content": "solver",
      "category": "output",
      "pos": {
        "x": 750,
        "y": 200
      },
      "wires": [
        2
      ],
      "params": {
        "lossFunction": "",
        "epochsCount": "",
        "snapshotInterval": "",
        "validationInterval": "",
        "batchSize": "",
        "learningRate": "",
        "optimizer": ""
      },
      "template": "frontend/components/layers/solver/node-test-4.svg"
    }
  ];/*networkDataService.getLayers();*/


	constructorWatcher.bind(self)();
	this.$onInit = function() {
		networkDataService.subClearNetworkEvent(function ($event, data) {
			console.log('NetworkClear');
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
					'<md-dialog>' +
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
        self.nodes = self.nodes = [
    {
      "id": 0,
      "name": "data",
      "content": "data",
      "category": "input",
      "pos": {
        "x": 50,
        "y": 200
      },
      "wires": [
      ],
      "params": {
        "datasetType": "",
        "datasetId": ""
      },
      "template": "frontend/components/layers/data/node-test-2.svg"
    },
    {
      "id": 1,
      "name": "convol",
      "content": "convolution",
      "category": "layer",
      "pos": {
        "x": 300,
        "y": 100
      },
      "wires": [
        0
      ],
      "params": {
        "filtersCount": "",
        "filterWidth": "",
        "filterHeight": "",
        "activationFunction": "",
        "subsamplingType": "",
        "subsamplingSize": ""
      },
      "template": "frontend/components/layers/convol/node-test-2.svg"
    },
    {
      "id": 2,
      "name": "dense",
      "content": "dense",
      "category": "layer",
      "pos": {
        "x": 500,
        "y": 300
      },
      "wires": [
        1
      ],
      "params": {
        "activationFunction": "",
        "neuronsCount": ""
      },
      "template": "frontend/components/layers/dense/node-test-4.svg"
    },
    {
      "id": 3,
      "name": "solver",
      "content": "solver",
      "category": "output",
      "pos": {
        "x": 750,
        "y": 200
      },
      "wires": [
        2
      ],
      "params": {
        "lossFunction": "",
        "epochsCount": "",
        "snapshotInterval": "",
        "validationInterval": "",
        "batchSize": "",
        "learningRate": "",
        "optimizer": ""
      },
      "template": "frontend/components/layers/solver/node-test-4.svg"
    }
  ];
    };

    this.zoomIn = function(event) {
        var scale = coreService.param('scale');
        scale *= appConfig.svgDefinitions.scaleFactor;
        if (scale < appConfig.svgDefinitions.scaleMax) {
            coreService.param('scale', scale);
        }

        console.log(self.nodes);
        self.nodes.length = 0;
    };

    function constructorWatcher() {
        var self = this;
        $scope.$watch(function () {
            return coreService.param('scale');
        }, function(newValue, oldValue) {
            self.svgWidth = newValue * appConfig.svgDefinitions.areaWidth;
            self.svgHeight = newValue * appConfig.svgDefinitions.areaHeight;
        }, true);

        self.nodes = [
    {
      "id": 0,
      "name": "data",
      "content": "data",
      "category": "input",
      "pos": {
        "x": 50,
        "y": 200
      },
      "wires": [
      ],
      "params": {
        "datasetType": "",
        "datasetId": ""
      },
      "template": "frontend/components/layers/data/node-test-2.svg"
    },
    {
      "id": 1,
      "name": "convol",
      "content": "convolution",
      "category": "layer",
      "pos": {
        "x": 300,
        "y": 100
      },
      "wires": [
        0
      ],
      "params": {
        "filtersCount": "",
        "filterWidth": "",
        "filterHeight": "",
        "activationFunction": "",
        "subsamplingType": "",
        "subsamplingSize": ""
      },
      "template": "frontend/components/layers/convol/node-test-2.svg"
    },
    {
      "id": 2,
      "name": "dense",
      "content": "dense",
      "category": "layer",
      "pos": {
        "x": 500,
        "y": 300
      },
      "wires": [
        1
      ],
      "params": {
        "activationFunction": "",
        "neuronsCount": ""
      },
      "template": "frontend/components/layers/dense/node-test-4.svg"
    },
    {
      "id": 3,
      "name": "solver",
      "content": "solver",
      "category": "output",
      "pos": {
        "x": 750,
        "y": 200
      },
      "wires": [
        2
      ],
      "params": {
        "lossFunction": "",
        "epochsCount": "",
        "snapshotInterval": "",
        "validationInterval": "",
        "batchSize": "",
        "learningRate": "",
        "optimizer": ""
      },
      "template": "frontend/components/layers/solver/node-test-4.svg"
    }
  ];
    }
}