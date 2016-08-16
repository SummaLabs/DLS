'use strict';

angular.module('graph')
	.directive('node', node);

function node($compile, $templateCache, $http, appConfig, $rootScope, coreService) {

	var patternDefinitions = appConfig.svgDefinitions;
	var scale = 1;

	function NodeCtrl($scope, $element, $document) {

		this.$onInit = function() {

		};
	}

	return {
		restrict: 'E',
		controller: NodeCtrl,
		controllerAs: 'nd',
		replace: true,
		scope: {
		   nodeData: '=',
		},
		template: '<g ng-attr-transform="translate({{nodeData.pos.x}},{{nodeData.pos.y}})" width="100%" height="100%"></g>',
		templateNamespace: 'svg',


		link: function($scope, element, attrs) {
            $scope.$watch('nodeData.template', function(newType) {
                if (newType != "" && newType != undefined) {
                    $http.get(newType, {cache: $templateCache}).success(function(html) {
                        element.html(html);
                        $compile(element.contents())($scope);

                        var idNode = $scope.nodeData.id;
                        $scope.isPort = false;

                        var rectNode = angular.element(element[0].querySelector('#' + patternDefinitions.markerRect));
                        var textNode = angular.element(element[0].querySelector('#' + patternDefinitions.markerText));

                        var parentNode = angular.element(element[0].parentNode);
                        var baseRect = parentNode[0].getBoundingClientRect();

                        var portIn = portInit(
							parentNode,
							angular.element(element[0].querySelector('#' + patternDefinitions.markerPortIn)),
							$scope.nodeData,
							patternDefinitions.markerPortIn
						);
                        var portOut = portInit(
							parentNode,
							angular.element(element[0].querySelector('#' + patternDefinitions.markerPortOut)),
							$scope.nodeData,
							patternDefinitions.markerPortOut
						);

                        if (!rectNode && !textNode) {
							message('File "' + newType + '" isn\'t valid!', 'error');
                        }
                        element.attr('id', 'id_' + idNode);

                        $scope.nodeData.portIn = portIn;
                        $scope.nodeData.portOut = portOut;


                        textNode.text($scope.nodeData.content);
                        textNode.addClass('node_label');

                        nodeWatcher($scope, rectNode);
						nodeEventsHandler($scope, $rootScope, element, rectNode, idNode);
                        portEventsHandler($scope, portIn, portOut, idNode);

                        $scope.$emit('nodeInit', {
							id: idNode
						});

                    });
                }
            })
        }
	}

	function message(message, type) {
		$scope.$emit('node_message', {
			id: idNode,
			type: type,
			message: message
		});
	}

	function portInit(base, port, data, marker) {

		if (!port[0])
			return null;

		var id = marker + '_' + data.id;
		port.attr('id', id);

        var baseRect = base[0].getBoundingClientRect();
        var portRect = port[0].getBoundingClientRect();

        var portCoord = getPortCoord(baseRect, portRect);

		return {
			element: port,
			data: {
				id: id,
				offset: {
				    x: portCoord.x / scale - data.pos.x,
				    y: portCoord.y / scale - data.pos.y
				}
			}
		}
	}

	function getPortCoord(svgRect, portRect) {
        var portWidth = portRect.right - portRect.left;
        var portHeight = portRect.bottom - portRect.top;

        return {
            x: portRect.left - svgRect.left + portWidth / 2,
            y: portRect.top - svgRect.top + portHeight / 2
        }
	}

	function nodeWatcher(scope, rectNode){
		scope.$watch('nodeData.selected', function(newValue, oldValue) {
			if (newValue) {
				rectNode.addClass("node_active");
				rectNode.attr('stroke-dasharray', '5,5');
			} else {
				rectNode.removeClass("node_active");
				rectNode.attr('stroke-dasharray', '');
			}
		});

		scope.$watch(function () {
			return coreService.param('scale');
		}, function(newValue, oldValue) {
			scale = newValue;
		}, true);
	}

	function nodeEventsHandler(scope, $rootScope, element, rectNode, idNode) {

		element.on('mousedown', function (event) {
			if (scope.isPort || event.ctrlKey || event.button !== 0)
				return;
			var offsetMousePos = getOffsetPos(element, event);
			scope.$emit('nodeMouseDown', {
				id: idNode,
				pos: {x: offsetMousePos.x, y: offsetMousePos.y}
			});
		});

		element.on('mouseenter', function (event) {
			rectNode.addClass("node_selected");
		});

		element.on('mouseleave', function (event) {
			rectNode.removeClass("node_selected");
		});

		function doClickAction(event, scope) {

            if (!scope.isPort && event.ctrlKey) {
				scope.$apply( function() {
					scope.nodeData.selected = !scope.nodeData.selected;
				});

				scope.$emit('selectedItem', {
					id: idNode,
					type: 'node',
					selected: scope.nodeData.selected
				});
			}
        }

        function doDoubleClickAction($rootScope) {
            $rootScope.$emit('EditLayer', {
                id: scope.nodeData.id,
                layerType: scope.nodeData.name
            })
        }

        var timer = 0;
        var delay = 200;
        var prevent = false;

		element.on('click', function (event) {
            timer = setTimeout(function() {
                if (!prevent) {
                    doClickAction(event, scope);
                }
                prevent = false;
            }, delay);
			
		}).on("dblclick", function() {
            clearTimeout(timer);
            prevent = true;
            doDoubleClickAction($rootScope);
        });

		element.on('mouseup', function (event) {
			if (event.ctrlKey)
				return;
			rectNode.removeClass("node_selected");
			scope.$emit('nodeMouseUp', { });
		});
	}

	function portEventsHandler(scope, portIn, portOut, idNode) {
		if (portIn) {
			portIn.element.on('mouseenter', function (event) {
				scope.isPort = true;
				portIn.element.addClass("port_hovered");
			});

			portIn.element.on('mouseleave', function (event) {
				scope.isPort = false;
				portIn.element.removeClass("port_hovered");
			});

			portIn.element.on('mouseup', function (event) {
				scope.$emit('portInMouseUp', {
					id: idNode,
					pos: portIn.offset
				});
			});
		}
		if (portOut) {
			portOut.element.on('mouseenter', function (event) {
				scope.isPort = true;
				portOut.element.addClass("port_hovered");
			});

			portOut.element.on('mouseleave', function (event) {
				scope.isPort = false;
				portOut.element.removeClass("port_hovered");
			});

			portOut.element.on('mousedown', function (event) {
				if (event.button === 0) {
					scope.$emit('portOutMouseDown', {
						id: idNode,
						pos: portOut.offset
					});
				}
			});

			portOut.element.on('mouseup', function (event) {
				scope.$emit('portOutMouseUp', {
					id: idNode,
					pos: portOut.offset
				});
			});
		}
	}

	function getOffsetPos(element, event) {
		var elementRect = element[0].getBoundingClientRect();
		return {x: event.clientX - elementRect.left, y: event.clientY - elementRect.top};
	}
}



