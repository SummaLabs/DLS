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
				x: $scope.linkData.nodes[0].pos.x + $scope.linkData.nodes[0].portOut.offset.x,
				y: $scope.linkData.nodes[0].pos.y + $scope.linkData.nodes[0].portOut.offset.y,
			}

			if($scope.linkData.nodes[1].id === 'activePoint') {
				$scope.to = $scope.linkData.nodes[1].pos;
			} else {
				$scope.to = {
					x: $scope.linkData.nodes[1].pos.x + $scope.linkData.nodes[1].portIn.offset.x,
					y: $scope.linkData.nodes[1].pos.y + $scope.linkData.nodes[1].portIn.offset.y,
				}
			}
			linkWatcher.bind(this)($scope, element);
			eventsHandler.bind(this)($scope, element);
		}
	}

	function linkWatcher(scope, element) {
		scope.$watch('linkData.selected', function(newValue, oldValue) {
			if (newValue) {
				element.addClass("link_line_active");
				element.attr('stroke-dasharray', '5,5');
			} else {
				element.removeClass("link_line_active");
				element.attr('stroke-dasharray', '');
			}
		});

		scope.$watch('linkData.nodes[0].pos.x', function(newValue, oldValue) {

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
		});
	}

	function eventsHandler(scope, element) {
		element.on('mouseenter', function (event) {
			element.addClass("link_line_active");
		});

		element.on('mouseleave', function (event) {
			if (!scope.linkData.selected) {
				element.removeClass("link_line_active");
			}
		});

		element.on('click', function (event) {
			if (!event.ctrlKey)
				return;
			scope.$apply( function() {
				scope.linkData.selected = !scope.linkData.selected;
			});
			scope.$emit('selectedItem', {
				id: scope.linkData.id,
				type: 'link',
				selected: scope.linkData.selected
			});
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

		return linkFunction(points);
	}
}

function LinkCtrl($scope, $element, $document) {

}