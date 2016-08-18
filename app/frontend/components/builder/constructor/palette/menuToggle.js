
angular.module('palette')
	.directive('menuToggle', [ '$timeout', '$mdUtil', function($timeout, $mdUtil) {
		return {
			scope: {
				section: '=',
				sectionState: "="
			},
			templateUrl: 'frontend/components/builder/constructor/palette/menuToggle.html',
			link: function($scope, $element) {
				var controller = $element.parent().controller();
				var state = false;
				$scope.getState = function() {

				};

				$scope.isOpen = function() {
					var st = state ? 'true' : 'false';
//					console.log($scope.section.name, st);
					return st;
				};
				$scope.toggle = function() {
					console.log(state);
					state = !state;
					$scope.sectionState = state;
				};

				var parentNode = $element[0].parentNode.parentNode.parentNode;
				if(parentNode.classList.contains('parent-list-item')) {
					var heading = parentNode.querySelector('h2');
					$element[0].firstChild.setAttribute('aria-describedby', heading.id);
				}
			}
		};
	}])