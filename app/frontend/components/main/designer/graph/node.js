'use strict';

angular.module('graph')
	.directive('node', node);

function node($compile, $templateCache, $http, appConfig, $rootScope, coreService) {

	let patternDefinitions = appConfig.svgDefinitions;

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
			let idNode = $scope.nodeData.id;
			$scope.nodeData.displayData = coreService.getNodeDefinition($scope.nodeData.layerType);

			element.html(coreService.getNodeTemplate($scope.nodeData.layerType));
			$compile(element.contents())($scope);

			$scope.isPort = false;

			let rectNode = angular.element(element[0].querySelector('#' + patternDefinitions.markerRect));
			let textNode = angular.element(element[0].querySelector('#' + patternDefinitions.markerText));

			let portIn = angular.element(element[0].querySelector('#' + patternDefinitions.markerPortIn));
			let portOut = angular.element(element[0].querySelector('#' + patternDefinitions.markerPortOut));

			let shapeIn = angular.element(element[0].querySelector('#' + patternDefinitions.markerShapeIn));
			let shapeOut = angular.element(element[0].querySelector('#' + patternDefinitions.markerShapeOut));

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
				setShape(shapeIn, $scope.nodeData.params.shapeInp);
			}

			if (shapeOut) {
				shapeOut.attr('id', '#' + patternDefinitions.markerShapeOut + idNode);
				setShape(shapeOut, $scope.nodeData.params.shapeOut);
            }

			element.attr('id', 'id_' + idNode);

			textNode.text($scope.nodeData.name);
			textNode.text(adaptText(rectNode, textNode ,$scope.nodeData.name, coreService.param('scale')));

			element.css('cursor', 'move');
			textNode.css('cursor', 'move');
			portIn.css('cursor', 'crosshair');
			portOut.css('cursor', 'crosshair');
			textNode.addClass('unselectable');

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

		let id = marker + '_' + nodeId;
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

		scope.$watch('nodeData.shapeInp', function(newValue, oldValue) {
		    if (scope.nodeData.layerType !== 'datainput')
		        return;

            if (!oldValue && newValue) {
                scope.$emit('node:param:update', {});
                return;
            }



            if (newValue && (newValue.length === oldValue.length)) {
                for (let a = 0; a < newValue.length; ++a) {
                    if (!Array.isArray(newValue[a]) && newValue[a] !== oldValue[a]) {
                         console.log(scope.nodeData, oldValue, newValue);
                        scope.$emit('node:param:update', {});
                        break;
                    }
                };

            }
        });
	}

	function nodeEventsHandler(scope, element, rectNode, idNode) {

		element.on('mousedown', function (event) {
		    event.stopPropagation();
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
            if (scope.isPort)
                return;

		    let ctrlKeyPressed = false;
            if (event.ctrlKey) {
                ctrlKeyPressed = true;
			}

			scope.$emit('selectedItem', {
                id: idNode,
                type: 'node',
                selected: scope.nodeData.isActive,
                ctrlKeyPressed: ctrlKeyPressed
            });

        }

		element.on('click', function (event) {
            doClickAction(event, scope);
		});

		element.on('mouseup', function (event) {

			if (event.ctrlKey)
				return;
			// rectNode.removeClass("node_selected");
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

		scope.$watch('nodeData.shapeInp', function(newValue, oldValue) {
            setShape(shapeIn, newValue);
		});

		scope.$watch('nodeData.shapeOut', function(newValue, oldValue) {
			setShape(shapeOut, newValue);
		});
	}

    function adaptText(node, textNode, text, scale) {
        let textRect = node[0].getBoundingClientRect();
        let textWidth = textNode[0].getComputedTextLength() * scale;

        if (textWidth < textRect.width)
            return text;

        let adaptedText = '';

        let charWidth = textWidth / text.length;
        let numRemoved = text.length - (textRect.width / charWidth) + 4;
        adaptedText = text.slice(0, -numRemoved);
        adaptedText += '..';

        return adaptedText;

    }

    function setShape(element, array) {
        if (!array) {
            element.text('[*]');
            return;
        }
        let shapeText = '[';
            array.forEach(function (item, index) {
                shapeText += `${item ? item: '*'}`;
                if (index < array.length - 1)
                    shapeText +=', ';
            });
            shapeText += ']';

            element.text(shapeText);
    }

}



