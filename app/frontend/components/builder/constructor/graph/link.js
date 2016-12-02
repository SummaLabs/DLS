'use strict';

angular.module('graph')
	.directive('nodelink', link);

function link() {

	return {
		restrict: 'E',
		controller: LinkCtrl,
		controllerAs: 'ln',
		replace: true,
		scope: {
		   linkData: '=',
		},
		template: '<path  class="link_line" d=""/>',
		templateNamespace: 'svg',

		link: function($scope, element, attrs) {

			$scope.from = {
			    x: $scope.linkData.nodes[0].pos.x + $scope.linkData.nodes[0].displayData.portOut.offsetCenter.x,
			    y: $scope.linkData.nodes[0].pos.y + $scope.linkData.nodes[0].displayData.portOut.offsetCenter.y
			};

			if($scope.linkData.nodes[1].id === 'activePoint') {
				$scope.to = $scope.linkData.nodes[1].pos;
			} else {

				$scope.to = {
                    x: $scope.linkData.nodes[1].pos.x + $scope.linkData.nodes[1].displayData.portIn.offsetCenter.x,
                    y: $scope.linkData.nodes[1].pos.y + $scope.linkData.nodes[1].displayData.portIn.offsetCenter.y
                }
			}

			updatePos(element, $scope.from, $scope.to);
			linkWatcher.bind(this)($scope, element);
			eventsHandler.bind(this)($scope, element);
		}
	};

	function linkWatcher(scope, element) {
		scope.$watch('linkData.isActive', function(newValue) {
			if (newValue) {
				element.addClass("link_line_active");
				element.attr('stroke-dasharray', '5,5');
			} else {
				element.removeClass("link_line_active");
				element.attr('stroke-dasharray', '');
			}
		});

		/*scope.$watch('linkData.nodes[0].pos.x', function(newValue, oldValue) {
			scope.from.x += newValue - oldValue;
			updatePos(element, scope.from, scope.to);
		});

		scope.$watch('linkData.nodes[0].pos.y', function(newValue, oldValue) {
			scope.from.y += newValue - oldValue;
			updatePos(element, scope.from, scope.to);
		});

		scope.$watch('linkData.nodes[1].pos.x', function(newValue, oldValue) {
		    scope.to.x += newValue - oldValue;
			updatePos(element, scope.from, scope.to);
		});

		scope.$watch('linkData.nodes[1].pos.y', function(newValue, oldValue) {
		    scope.to.y += newValue - oldValue;
			updatePos(element, scope.from, scope.to);
		});*/
	}

	function eventsHandler(scope, element) {
		element.on('mouseenter', function (event) {
			element.addClass("link_line_active");
		});

		element.on('mouseleave', function (event) {
			if (!scope.linkData.isActive) {
				element.removeClass("link_line_active");
			}
		});

		element.on('click', function (event) {
			if (event.ctrlKey) {
                scope.$apply( function() {
                    scope.linkData.isActive = !scope.linkData.isActive;
                });
            }
            scope.$emit('selectedItem', {
                id: scope.linkData.id,
                type: 'link',
                selected: scope.linkData.isActive
            });
		});


        var prev_from_x = scope.linkData.nodes[0].pos.x;
        var prev_from_y = scope.linkData.nodes[0].pos.y;
        scope.$on('node:move_' + scope.linkData.nodes[0].id, function (event, data) {
            scope.from.x += scope.linkData.nodes[0].pos.x - prev_from_x;
            scope.from.y += scope.linkData.nodes[0].pos.y - prev_from_y;
            prev_from_x = scope.linkData.nodes[0].pos.x;
            prev_from_y = scope.linkData.nodes[0].pos.y;
            updatePos(element, scope.from, scope.to);
        });

        var prev_to_x = scope.linkData.nodes[1].pos.x;
        var prev_to_y = scope.linkData.nodes[1].pos.y;

        scope.$on('node:move_' + scope.linkData.nodes[1].id, function (event, data) {
            scope.to.x += scope.linkData.nodes[1].pos.x - prev_to_x;
            scope.to.y += scope.linkData.nodes[1].pos.y - prev_to_y;
            prev_to_x = scope.linkData.nodes[1].pos.x;
            prev_to_y = scope.linkData.nodes[1].pos.y;
            updatePos(element, scope.from, scope.to);

        });
	}

	function updatePos(element, from, to){
		var path = calculatePath(from, to, 'vertical');
		element.attr('d', path);
	}

	function calculatePath(from, to, orientation = 'horizontal') {
		var ARC_OFFSET = 0.5;
		var ARC_MIN = 30;
		var points = [];
		var dx = to.x - from.x;
		var dy = to.y - from.y;

		var distance = Math.max(Math.sqrt(dx * dx + dy * dy) * ARC_OFFSET, ARC_MIN);

		points.push(from);
		if (orientation === 'horizontal') {
			points.push({x: from.x + distance, y: from.y});
			points.push({x: to.x - distance, y: to.y});
		} else {
			points.push({x: from.x, y: from.y  + distance});
			points.push({x: to.x, y: to.y - distance});
		}
		points.push(to);

        var line = 'M';
		if(points.length != 4)
			return null;

		line += '' + points[0].x + ', ' + points[0].y +
				 ' C' + points[1].x + ', ' + points[1].y +
				 ' ' + points[2].x + ', ' + points[2].y +
				 ' ' + points[3].x + ', ' + points[3].y;

		return line;
	}
}

function LinkCtrl($scope, $element, $document) {

}