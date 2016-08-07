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

function ConstructorController($mdDialog, $rootScope) {

    var layerDirectives =
	{
		'data':'<input-data-editor layer-id="layerId" do-on-submit="closeDialog()"></input-data-editor>',
		'convol':'<convol-editor layer-id="layerId" do-on-submit="closeDialog()"></convol-editor>',
		'dense':'<dense-editor layer-id="layerId" do-on-submit="closeDialog()"></dense-editor>',
		'solver':'<solver-editor layer-id="layerId" do-on-submit="closeDialog()"></solver-editor>'
	};

	this.$onInit = function() {
		$rootScope.$on('NetworkUpdated', function ($event, data) {
			console.log('NetworkUpdated')
		});

		$rootScope.$on('EditLayer', function ($event, data) {
			var layerId = data.id;
			var parentEl = angular.element(document.body);
			var dialogTemplate = buildTemplate();
			$mdDialog.show({
				clickOutsideToClose: true,
				parent: parentEl,
				targetEvent: $event,
				template: dialogTemplate,
				locals: {},
				controller: DialogController
			});

			function DialogController($scope, $mdDialog) {
				$scope.layerId = layerId;
				$scope.layerType = data.layerType;
				$scope.closeDialog = function() {
					$mdDialog.hide();
				}
			}

			function buildTemplate() {
				var layerId = 1;
				var layerType = "convol";
				var template =
					'<md-dialog>' +
					'  <md-dialog-content>'+
					'    <layer-editor layer-id="99" layer-type="convol" do-on-submit="closeDialog()"></layer-editor>' +
					'  </md-dialog-content>' +
					'</md-dialog>';

				return template;
			}
		});
	};
}