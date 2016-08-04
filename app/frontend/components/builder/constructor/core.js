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
		$rootScope.$on('EditLayer', function ($event, data) {
			var layerId = data.id;
			var parentEl = angular.element(document.body);
			var dialogTemplate = buildTemplate(layerDirectives[data.layerType]);
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
				$scope.closeDialog = function() {
					$mdDialog.hide();
				}
			}

			function buildTemplate(layerDirective) {
				var template =
					'<md-dialog>' +
					'  <md-dialog-content>'+
					       layerDirective +
					'  </md-dialog-content>' +
					'</md-dialog>';

				return template;
			}
		});
	};
}