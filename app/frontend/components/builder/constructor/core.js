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

	constructorWatcher.bind(self)();
	this.$onInit = function() {
		$rootScope.$on('NetworkUpdated', function ($event, data) {
			console.log('NetworkUpdated')
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
		var confirm = $mdDialog.prompt()
			.title('Save Network')
			.textContent('Enter name of the network')
			.placeholder('Network Name')
			.ariaLabel('Network Name')
			.initialValue(networkDataService.getNetworkConfig().name)
			.targetEvent($event)
			.ok('Save')
			.cancel('Cancel');
		$mdDialog.show(confirm).then(function (result) {
			networkDataService.saveNetwork(result);
		}, function () {
			//silent
		});
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

    function constructorWatcher() {
        var self = this;
        $scope.$watch(function () {
            return coreService.param('scale');
        }, function(newValue, oldValue) {
            self.svgWidth = newValue * appConfig.svgDefinitions.areaWidth;
            self.svgHeight = newValue * appConfig.svgDefinitions.areaHeight;
        }, true);
    }
}