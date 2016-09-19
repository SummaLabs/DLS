
angular.module('constructorCore')
	.directive('viewport', ['coreService', function(coreService) {
        return {
            restrict: 'E',
            replace: true,
            template: '<div id="viewport"><div></div></div>',
            scope: {
                svgWidth: '@',
                svgHeight: '@',
            },
            link: function(scope, element, attr){
            	var divSvg = document.getElementById('workspace');
                var visibleEl = element[0].firstElementChild;
				var scale = 1.0;

                resize();

                angular.element(window).on('resize', function (event) {
					resize();
				});


				function resize() {
					var coeffViewport = 0.25;
					var canvasWidth = scope.svgWidth * scale;
					var canvasHeight = scope.svgHeight * scale;

					var viewportRatio = canvasWidth / canvasHeight;

					var viewportWidth;
					var viewportHeight;
					if (canvasWidth > canvasHeight) {
						viewportWidth = divSvg.offsetWidth * coeffViewport;
						viewportHeight = viewportWidth / viewportRatio;
					} else {
						viewportHeight = divSvg.offsetHeight * coeffViewport;
						viewportWidth = viewportHeight * viewportRatio;
					}

					var visibleWidth = viewportWidth / (canvasWidth / divSvg.offsetWidth);
					var visibleHeight= viewportHeight / (canvasHeight / divSvg.offsetHeight);

					element[0].style.width = viewportWidth + 'px';
					element[0].style.height = viewportHeight + 'px';

					visibleEl.style.width = visibleWidth + 'px';
					visibleEl.style.height = visibleHeight + 'px';
				}

				scope.$watch(function () {
						return coreService.param('scale');
					}, function(newValue, oldValue) {
						scale = newValue;
						resize();
					}
				);
            }
        }
    }]);