
angular.module('palette')
	.directive('menuToggle', ['layerService', function(layerService) {
		return {
			scope: {
				section: '='
			},
			templateUrl: '/frontend/components/main/designer/palette/layers-panel.html',
			link: function($scope, $element) {
				var state = false;

				$scope.toggle = function() {
					state = !state;
					$scope.section.state = state;
				};

				$scope.getIconPath = function (type) {
					return layerService.getIconByType(type);
				}
			}
		};
	}]);