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
	.component('constructor', editorDefinition);

function ConstructorController($mdDialog, $rootScope, networkDataService) {

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
}