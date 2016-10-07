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
		var path = calculatePath(from, to);
		element.attr('d', path);
	}

	function calculatePath(from, to) {
		var ARC_OFFSET = 0.3;
		var ARC_MIN = 30;
		var points = [];
		var dx = to.x - from.x;
		var dy = to.y - from.y;

		var distance = Math.max(Math.sqrt(dx * dx + dy * dy) * ARC_OFFSET, ARC_MIN);
		points.push(from);
		points.push({x: from.x + distance, y: from.y});
		points.push({x: to.x - distance, y: to.y});
		points.push(to);

		var linkFunction = d3.line()
			.x(function(d) { return d.x; })
			.y(function(d) { return d.y; })
			.curve(d3.curveBasis);

        // var line = bezierFourthOrder(points, 20);
		return linkFunction(points);
	}

	function bezierFourthOrder(points, num)
	{
		var line = 'M';
		if(points.length != 4)
			return null;
		var step = 1.00 / (num - 1);

		for(let t= 0; t < 1.00; t += step) {
			var point = Position.pos();
			point.x = Math.pow(1.00 - t, 3) * points[0].x + 3.0 * t * Math.pow(1.00 - t, 2) * points[1].x +
				3.0 * t * t *(1.00 - t) * points[2].x +
				t * t * t * points[3].x;
			point.y = Math.pow(1.00 - t, 3) * points[0].y +
				3.0 * t * Math.pow(1.00 - t, 2) * points[1].y +
				3.0 * t * t *(1.00 - t) * points[2].y +
				t * t * t * points[3].y;

            if (t > 0)
                line += 'L';
            line += point.x + ' ' + point.y + ' ';
		}
        line += 'L' + points[points.length - 1].x + ' ' + points[points.length - 1].y;

		return line;
	}
}

function LinkCtrl($scope, $element, $document) {

}