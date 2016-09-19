
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
				var viewportWidth;
			    var viewportHeight;
			    var visibleWidth;
			    var visibleHeight;
			    var ratio;

                resize();

                angular.element(window).on('resize', function (event) {
					resize();
				});


				function resize() {
					var coeffViewport = 0.2;
					var canvasWidth = scope.svgWidth * scale;
					var canvasHeight = scope.svgHeight * scale;

					var viewportRatio = canvasWidth / canvasHeight;

					if (canvasWidth > canvasHeight) {
						viewportWidth = divSvg.offsetWidth * coeffViewport;
						viewportHeight = viewportWidth / viewportRatio;
					} else {
						viewportHeight = divSvg.offsetHeight * coeffViewport;
						viewportWidth = viewportHeight * viewportRatio;
					}

					visibleWidth = viewportWidth / (canvasWidth / divSvg.offsetWidth);
					visibleHeight= viewportHeight / (canvasHeight / divSvg.offsetHeight);

					element[0].style.width = viewportWidth + 'px';
					element[0].style.height = viewportHeight + 'px';

					visibleEl.style.width = visibleWidth + 'px';
					visibleEl.style.height = visibleHeight + 'px';

					ratio = viewportWidth / canvasWidth;

					if (visibleWidth > viewportWidth && visibleHeight > viewportHeight) {
                        element.attr('hidden', 'true');
					} else {
					    element.removeAttr('hidden');
					}
				}

				scope.$watch(function () {
						return coreService.param('scale');
					}, function(newValue, oldValue) {
						scale = newValue;
						resize();
					}
				);

				element.on('mousedown', function (event) {
                    var pos = calcVisiblePos(event);
                    visibleEl.style.left = pos.x + 'px';
                    visibleEl.style.top = pos.y + 'px';
                    scope.$emit('viewport::changed', {
                        x: pos.x / ratio,
                        y: pos.y / ratio
                    });
                });

                element.on('mousemove', function (event) {
                    if (event.buttons === 1) {
                        var pos = calcVisiblePos(event);
                        visibleEl.style.left = pos.x + 'px';
                        visibleEl.style.top = pos.y + 'px';
                        scope.$emit('viewport::changed', {
                        x: pos.x / ratio,
                        y: pos.y / ratio
                    });
                    }
                });

                element.on('mouseup', function (event) {

                });

                function calcVisiblePos(event) {
                    var pos = getOffsetPos(element, event);
                    var visibleWidth_2 = visibleWidth / 2;
                    var visibleHeight_2 = visibleHeight / 2;
                    var x = pos.x - visibleWidth_2;
                    var y = pos.y - visibleHeight_2;

                    if (x > viewportWidth - visibleWidth)
                        x = viewportWidth - visibleWidth;
                    if (x < 0)
                        x = 0;
                    if (y > viewportHeight - visibleHeight)
                        y = viewportHeight - visibleHeight;
                    if (y < 0)
                        y = 0;

                    return {
                        x: x,
                        y: y
                    }
                }

                function getOffsetPos(element, event) {
                    var elementRect = element[0].getBoundingClientRect();
                    return {x: event.clientX - elementRect.left, y: event.clientY - elementRect.top};
                }
            }
        }
    }]);