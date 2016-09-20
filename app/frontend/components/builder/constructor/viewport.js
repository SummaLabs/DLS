
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

			    visibleEl.style.left = '0px';
				visibleEl.style.top = '0px';

                angular.element(window).on('resize', function (event) {
					update();
					if (ratio <=0)
						return;
					var x = parseInt(visibleEl.style.left, 10);
					var y = parseInt(visibleEl.style.top, 10);
					var pos = calcVisiblePos(x + visibleWidth / 2, y + visibleHeight / 2);
					visibleEl.style.left = pos.x + 'px';
					visibleEl.style.top = pos.y + 'px';

					scope.$emit('viewport::changed', {
						x: pos.x / ratio,
						y: pos.y / ratio
					});
				});


				function update() {
					var coeffViewport = 0.2;
					var canvasWidth = scope.svgWidth * scale;
					var canvasHeight = scope.svgHeight * scale;

					var viewportRatio = Math.min(divSvg.offsetWidth / canvasWidth, divSvg.offsetHeight/ canvasHeight);

					viewportWidth = canvasWidth * (viewportRatio * coeffViewport);
					viewportHeight = canvasHeight * (viewportRatio * coeffViewport);

					visibleWidth = viewportWidth / (canvasWidth / divSvg.offsetWidth);
					visibleHeight= viewportHeight / (canvasHeight / divSvg.offsetHeight);

					if(visibleWidth > viewportWidth) {
						visibleWidth = viewportWidth;
					}

					if(visibleHeight > viewportHeight) {
						visibleHeight = viewportHeight;
					}

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
						update();
						var x = parseInt(visibleEl.style.left, 10) ;
						var y = parseInt(visibleEl.style.top, 10);
//						var pos = calcVisiblePos(x + visibleWidth / 2, y + visibleHeight / 2);
//						visibleEl.style.left = pos.x + 'px';
//						visibleEl.style.top = pos.y + 'px';

//						scope.$emit('viewport::changed', {
//							x: x / ratio,
//							y: y / ratio
//						});
					}
				);

				element.on('mousedown', function (event) {
                    changePos(event.clientX, event.clientY);
                });

                element.on('mousemove', function (event) {
                    if (event.buttons === 1) {
						changePos(event.clientX, event.clientY);
                    }
                });

                function changePos(clientX, clientY) {
                	var viewPos = getOffsetPos(clientX, clientY);
					var pos = calcVisiblePos(viewPos.x, viewPos.y);
					visibleEl.style.left = pos.x + 'px';
					visibleEl.style.top = pos.y + 'px';
					scope.$emit('viewport::changed', {
						x: pos.x / ratio,
						y: pos.y / ratio
					});
                }

                function calcVisiblePos(viewX, viewY) {
                    var visibleWidth_2 = visibleWidth / 2;
                    var visibleHeight_2 = visibleHeight / 2;
                    var x = viewX - visibleWidth_2;
                    var y = viewY - visibleHeight_2;

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

                function getOffsetPos(clientX, clientY) {
                    var elementRect = element[0].getBoundingClientRect();
                    return {x: clientX - elementRect.left, y: clientY - elementRect.top};
                }
            }
        }
    }]);