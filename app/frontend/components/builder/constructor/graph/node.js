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

                        var idNode = $scope.nodeData.id;
                        $scope.nodeData.displayData = calculateProportions(html, patternDefinitions);

                        element.html(html);
                        $compile(element.contents())($scope);

                        $scope.isPort = false;

                        var rectNode = angular.element(element[0].querySelector('#' + patternDefinitions.markerRect));
                        var textNode = angular.element(element[0].querySelector('#' + patternDefinitions.markerText));

                        var portIn = angular.element(element[0].querySelector('#' + patternDefinitions.markerPortIn));
                        var portOut = angular.element(element[0].querySelector('#' + patternDefinitions.markerPortOut));


                        $scope.nodeData.displayData.portIn.element = portIn;
                        $scope.nodeData.displayData.portOut.element = portOut;

                        portInit(portIn, patternDefinitions.markerPortIn, idNode);
                        portInit(portOut, patternDefinitions.markerPortOut, idNode);

                        if (!rectNode && !textNode) {
							message('File "' + newType + '" isn\'t valid!', 'error');
                        }
                        element.attr('id', 'id_' + idNode);

                        $scope.nodeData.portIn = portIn;
                        $scope.nodeData.portOut = portOut;

                        textNode.text($scope.nodeData.name);
                        textNode.addClass('unselectable');

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

	function calculateProportions(nodeHtml, patternDefinitions) {
	    var displayData = {};

        var svg = document.createElement('div');
        svg.style.position = 'absolute';
        svg.style.top = '-1000px';
        svg.innerHTML = '<svg>' + nodeHtml + '</svg>';
        document.body.appendChild(svg);

        var portIn = angular.element(svg.querySelector('#' + patternDefinitions.markerPortIn));
        var portInRect = portIn[0].getBoundingClientRect();
        var portOut = angular.element(svg.querySelector('#' + patternDefinitions.markerPortOut));
        var portOutRect = portOut[0].getBoundingClientRect();
        var rect = angular.element(svg);
        var elementRect = rect[0].getBoundingClientRect();

        displayData.portIn = {
            element: null,
            offsetCenter: {
                x: portInRect.left + (portInRect.right - portInRect.left) / 2,
                y: portInRect.top  + (portInRect.bottom - portInRect.top) / 2 + 1000
            },
            width: portInRect.right - portInRect.left,
            height: portInRect.bottom - portInRect.top
        }

        displayData.portOut = {
            element: null,
            offsetCenter: {
                x: portOutRect.left + (portOutRect.right - portOutRect.left) / 2,
                y: portOutRect.top  + (portOutRect.bottom - portOutRect.top) / 2 + 1000
            },
            width: portOutRect.right - portOutRect.left,
            height: portOutRect.bottom - portOutRect.top
        }



        displayData.node = {
            offsetCenter: {
                x: elementRect.left + (elementRect.right - elementRect.left) / 2,
                y: elementRect.top  + (elementRect.bottom - elementRect.top) / 2 + 1000
            },
            width: elementRect.right - elementRect.left,
            height: elementRect.bottom - elementRect.top
        }
        document.body.removeChild(svg);
        console.log(displayData.node.width, displayData.node.height)
        return displayData;
	}

	function message(message, type) {
		$scope.$emit('node_message', {
			id: idNode,
			type: type,
			message: message
		});
	}

	function portInit(port, marker, nodeId) {

		if (!port[0])
			return null;

		var id = marker + '_' + nodeId;
		port.attr('id', id);
	}

	function nodeWatcher(scope, rectNode){
		scope.$watch('nodeData.selected', function(newValue, oldValue) {
			if (newValue) {
				rectNode.addClass("node_active");
			} else {
				rectNode.removeClass("node_active");
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
			scope.$emit('nodeMouseDown', {
				id: idNode,
				event: event
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
			} else if (!scope.isPort) {
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
			scope.$emit('nodeMouseUp', event);
		});
	}

	function portEventsHandler(scope, portIn, portOut, idNode) {
		if (portIn) {
			portIn.on('mouseenter', function (event) {
				scope.isPort = true;
				portIn.addClass("port_hovered");
			});

			portIn.on('mouseleave', function (event) {
				scope.isPort = false;
				portIn.removeClass("port_hovered");
			});

			portIn.on('mouseup', function (event) {
				scope.$emit('portInMouseUp', {
					id: idNode
				});
			});
		}
		if (portOut) {
			portOut.on('mouseenter', function (event) {
				scope.isPort = true;
				portOut.addClass("port_hovered");
			});

			portOut.on('mouseleave', function (event) {
				scope.isPort = false;
				portOut.removeClass("port_hovered");
			});

			portOut.on('mousedown', function (event) {
				if (event.button === 0) {
					scope.$emit('portOutMouseDown', {
						id: idNode
					});
				}
			});

			portOut.on('mouseup', function (event) {
				scope.$emit('portOutMouseUp', {
					id: idNode
				});
			});
		}
	}

	function getOffsetPos(element, event) {
		var elementRect = element[0].getBoundingClientRect();
		return {x: event.clientX - elementRect.left, y: event.clientY - elementRect.top};
	}
}



