'use strict';

angular.module('graph')
	.directive('node', node);

function node($compile, $templateCache, $http, appConfig, $rootScope, coreService) {

	var patternDefinitions = appConfig.svgDefinitions;

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
			var idNode = $scope.nodeData.id;
			$scope.nodeData.displayData = coreService.getNodeDefinition($scope.nodeData.layerType);

			element.html(coreService.getNodeTemplate($scope.nodeData.layerType));
			$compile(element.contents())($scope);

			$scope.isPort = false;

			var rectNode = angular.element(element[0].querySelector('#' + patternDefinitions.markerRect));
			var textNode = angular.element(element[0].querySelector('#' + patternDefinitions.markerText));

			var portIn = angular.element(element[0].querySelector('#' + patternDefinitions.markerPortIn));
			var portOut = angular.element(element[0].querySelector('#' + patternDefinitions.markerPortOut));

			var shapeIn = angular.element(element[0].querySelector('#' + patternDefinitions.markerShapeIn));
			var shapeOut = angular.element(element[0].querySelector('#' + patternDefinitions.markerShapeOut));

			// $scope.nodeData.displayData.portIn.element = portIn;
			// $scope.nodeData.displayData.portOut.element = portOut;

			portInit(portIn, patternDefinitions.markerPortIn, idNode);
			portInit(portOut, patternDefinitions.markerPortOut, idNode);

			if (!rectNode && !textNode) {
				message('File "' + newType + '" isn\'t valid!', 'error');
			}
			if (rectNode) {
				rectNode.attr('id', '#' + patternDefinitions.markerRect + idNode);
			}
			if (textNode) {
				textNode.attr('id', '#' + patternDefinitions.markerText + idNode);
			}
			if (portIn) {
				portIn.attr('id', '#' + patternDefinitions.markerPortIn + idNode);
			}
			if (portOut) {
				portOut.attr('id', '#' + patternDefinitions.markerPortOut + idNode);
			}

			if (shapeIn) {
				shapeIn.attr('id', '#' + patternDefinitions.markerShapeIn + idNode);
				shapeIn.text('[*]');
			}

			if (shapeOut) {
				shapeOut.attr('id', '#' + patternDefinitions.markerShapeOut + idNode);
				shapeOut.text('[*]');
			}

			element.attr('id', 'id_' + idNode);
            //
			// $scope.nodeData.portIn = portIn;
			// $scope.nodeData.portOut = portOut;
			textNode.text($scope.nodeData.name);
			textNode.addClass('unselectable');
			textNode.text(adaptText(rectNode, textNode ,$scope.nodeData.name, coreService.param('scale')));

			nodeWatcher($scope, rectNode);
			nodeEventsHandler($scope, element, rectNode, idNode);
			portEventsHandler($scope, portIn, portOut, idNode);
			shapeEvents($scope, shapeIn, shapeOut, idNode);
			$scope.$emit('nodeInit', {
				id: idNode
			});
        }
	};

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
		scope.$watch('nodeData.isActive', function(newValue, oldValue) {
			if (newValue) {
				rectNode.addClass("node_active");
			} else {
				rectNode.removeClass("node_active");
			}
		});
	}

	function nodeEventsHandler(scope, element, rectNode, idNode) {

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
					scope.nodeData.isActive = !scope.nodeData.isActive;
				});

				scope.$emit('selectedItem', {
					id: idNode,
					type: 'node',
					selected: scope.nodeData.isActive
				});
			} else if (!scope.isPort) {
				scope.$emit('selectedItem', {
					id: idNode,
					type: 'node',
					selected: scope.nodeData.isActive
				});
			}

        }

		element.on('click', function (event) {
            doClickAction(event, scope);
		});

		element.on('mouseup', function (event) {
			if (event.ctrlKey)
				return;
			rectNode.removeClass("node_selected");
			scope.$emit('nodeMouseUp', event);
		});

        scope.$on('node:move_' + scope.nodeData.id, function (event, data) {
            element.attr('transform', "translate(" + data.pos.x + "," + data.pos.y + ")");
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
						id: idNode,
                        event: event
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

	function shapeEvents(scope, shapeIn, shapeOut, idNode) {
		scope.$on('node:set_shapes_' + idNode, function (event, data) {
			if (data.type === 'in' && shapeIn[0]) {
				setShapes(shapeIn, data.shapes);
			} else if (data.type === 'out' && shapeOut[0]) {
                setShapes(shapeOut, data.shapes);
			}

        });
	}

	function setShapes(node, shapes) {
        if (!shapes || shapes === 'Unknown')
            return;
        var text = '';
        for (let a = 0; a < shapes.length; a ++) {
            if (shapes[a])
                text += shapes[a] + ',';
            else
                text += '*,';
        }
        if (shapes.length > 1)
            shapes.length -= 1;
        else
            text += '*';
        node.text('[' + text + ']');
    }

    function adaptText(node, textNode, text, scale) {
        var textRect = node[0].getBoundingClientRect();
        var textWidth = textNode[0].getComputedTextLength() * scale;

        if (textWidth < textRect.width)
            return text;

        let adaptedText = '';

        let charWidth = textWidth / text.length;
        let numRemoved = text.length - (textRect.width / charWidth) + 4;
        adaptedText = text.slice(0, -numRemoved);
        adaptedText += '..';

        return adaptedText;

    }

}



