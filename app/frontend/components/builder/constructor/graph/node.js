'use strict';

angular.module('graph')
	.directive('node', node);

function node($compile, $templateCache, $http, appConfig) {

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
            $scope.$watch('nodeData.template', function(newType) {
                if (newType != "" && newType != undefined) {
                    $http.get(newType, {cache: $templateCache}).success(function(html) {
                        element.html(html);
                        $compile(element.contents())($scope);

                        var idNode = $scope.nodeData.id;
                        $scope.isPort = false;

                        var rectNode = angular.element(element[0].querySelector('#' + patternDefinitions.markerRect));
                        var textNode = angular.element(element[0].querySelector('#' + patternDefinitions.markerText));
                        var portIn = portInit(
							element,
							angular.element(element[0].querySelector('#' + patternDefinitions.markerPortIn)),
							$scope.nodeData,
							patternDefinitions.markerPortIn
						);
                        var portOut = portInit(
							element,
							angular.element(element[0].querySelector('#' + patternDefinitions.markerPortOut)),
							$scope.nodeData,
							patternDefinitions.markerPortOut
						);

                        if (!rectNode && !textNode && !portIn && !portOut) {
							message('File "' + newType + '" isn\'t valid!', 'error');
                        }
                        element.attr('id', 'id_' + idNode);

                        $scope.nodeData.portIn = portIn.data;
                        $scope.nodeData.portOut = portOut.data;


                        textNode.text($scope.nodeData.content);
                        textNode.addClass('node_label');

                        nodeWatcher($scope, rectNode);
						nodeEventsHandler($scope, element, rectNode, idNode);
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

		if (!port)
			return null;
		var baseRect = base[0].getBoundingClientRect();
		var portRect = port[0].getBoundingClientRect();
		console.log(baseRect, portRect);
		var elemWidth = portRect.right - portRect.left;
		var elemHeight = portRect.bottom - portRect.top;


		var elemCenter = {
			x: portRect.left - baseRect.left + portRect.width / 2,
			y: portRect.top - baseRect.top + portRect.height / 2
		}

		var id = marker + '_' + data.id;
		port.attr('id', id);

		return {
			element: port,
			data: {
				id: id,
				offset: {
					x: elemCenter.x,
					y: elemCenter.y,
				}
			}
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
	}

	function nodeEventsHandler(scope, element, rectNode, idNode) {

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

		element.on('click', function (event) {
			if (scope.isPort || !event.ctrlKey)
				return;
			scope.$apply( function() {
				scope.nodeData.selected = !scope.nodeData.selected;
			});

			scope.$emit('selectedItem', {
				id: idNode,
				type: 'node',
				selected: scope.nodeData.selected
			});
		});

		element.on('mouseup', function (event) {
			if (event.ctrlKey)
				return;
			rectNode.removeClass("node_selected");
			scope.$emit('nodeMouseUp', { });
		});
	}

	function portEventsHandler(scope, portIn, portOut, idNode) {

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

	function getOffsetPos(element, event) {
		var elementRect = element[0].getBoundingClientRect();
		return {x: event.clientX - elementRect.left, y: event.clientY - elementRect.top};
	}
}



