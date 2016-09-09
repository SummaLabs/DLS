
angular.module('palette')
	.directive('menuToggle', [ '$timeout', '$mdUtil', function($timeout, $mdUtil) {
		return {
			scope: {
				section: '='
			},
			templateUrl: 'frontend/components/builder/constructor/palette/layersPanel.html',
			link: function($scope, $element) {
				var state = false;

				$scope.toggle = function() {
					state = !state;
					$scope.section.state = state;
				};
			}
		};
	}])