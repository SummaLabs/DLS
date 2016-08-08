'use strict';

angular.module('graph', [

]);

angular.module('graph')
	.service('graphService', GraphService)
	.directive('svgGraph', initComponent);

function GraphService() {
	this.patternDefinitions = {
		markerRect: 'border',
		markerText: 'text',
		markerPortIn: 'in',
		markerPortOut: 'out'
	}
}



function initComponent() {

	const state = {
        DEFAULT: 0,
        MOVING: 1,
        JOINING: 2,
        DRAGGING: 3,
    }

	function GraphController($scope, $rootScope, $window, $element, constructorService) {
		var self = this;
		self.mouseMode = state.DEFAULT;

		self.nodes = constructorService.getNodes();
		self.links = [];
//		self.links = parseNodesForLinks(self.nodes);

		self.activelink = {
			nodes: []
		};

		svgHandler.bind(self)($scope, $rootScope, $window, $element);

		self.$onInit = function() {

		};
	}

	return {
		restrict: 'E',
		controller: GraphController,
		controllerAs: 'svg',
		replace: true,
		scope: {
		   svgWidth: '@',
		   svgHeight: '@',
		   svgColor: '@'
		},
		templateUrl: 'frontend/components/builder/constructor/graph/graph.html',

		link: function($scope, element, attrs) {

        }
	}

	function svgHandler($scope, $rootScope,$window, $element) {
		var self = this;

		var counterNodesInit = 0;

		self.isItemClicked = false;

		var prevMousePos = [0,0];
		$scope.editedNode = {};
		var parentNode = angular.element($element[0].parentNode);

		$rootScope.$on('palette_drag_start', function (event, data) {
			self.mouseMode = state.DRAGGING;
		});

		var positionDrag = {x:0, y: 0};

		$rootScope.$on('palette_drag_end', function (event, data) {
			if (self.mouseMode === state.DRAGGING) {
				var pos = convertCoordinateFromClienToSvg($element, parentNode, positionDrag);
				if (pos.x > 0 && pos.y > 0) {
					$scope.$apply( function() {
						self.nodes.push({
							id: self.nodes.length + 1,
							name : data.data.name,
							content : data.data.content,
							category : data.data.category,
							pos: pos,
							selected: false
						});
					});
				}
			}
		});

		$element.on('dragover', function (event) {
			if (self.mouseMode === state.DRAGGING) {
				positionDrag = {x: event.clientX, y: event.clientY};
			}

		});

		$scope.$on('nodeMouseDown', function (event, data) {
			$scope.editedNode = getItemById(self.nodes, data.id);
			self.mouseMode = state.MOVING;

			prevMousePos = {x: $scope.editedNode.pos.x + data.pos.x, y: $scope.editedNode.pos.y + data.pos.y};
		});

		$scope.$on('nodeMouseUp', function (event, data) {
			if (self.mouseMode === state.MOVING) {
				self.mouseMode = state.DEFAULT;
			} else if (self.mouseMode === state.JOINING) {
				removeActiveLink();
				self.mouseMode = state.DEFAULT;
			}

		});

		$scope.$on('nodeInit', function (event, data) {
			counterNodesInit ++;
			if (counterNodesInit === self.nodes.length) {
				self.links = parseNodesForLinks(self.nodes);
			}
		});


		$element.on('click', function (event) {
			if (!self.isItemClicked) {
				$scope.$apply( function() {
					selectItems (self.nodes, false);
					selectItems (self.links, false);
				});
			}
			self.isItemClicked = false;
		});

		$element.on('keydown', function (event) {
			if (event.keyCode === 46) {
				$scope.$apply( function() {
					removeSelectedItems(self.nodes, self.links);
				});
			}
		});

		$element.on('focus', function (event) {

		});

		$element.on('mousemove', function (event) {
			if (self.mouseMode === state.MOVING) {
				var curMousePos = getOffsetPos($element, event);
				$scope.$apply( function() {
					$scope.editedNode.pos.x += curMousePos.x - prevMousePos.x;
					$scope.editedNode.pos.y += curMousePos.y - prevMousePos.y;
				});
				prevMousePos = curMousePos;
			} else if (self.mouseMode === state.JOINING) {
				var curMousePos = getOffsetPos($element, event);
				$scope.$apply( function() {
					if (self.activelink.nodes.length === 1) {
						self.activelink.nodes.push({
							id: 'activePoint',
							pos: curMousePos
						});
					} else {
						self.activelink.nodes[1].pos = curMousePos;
					}
				});
			}
		});

		$element.on('mouseup', function (event) {
			if (self.mouseMode === state.JOINING) {
				removeActiveLink();
				self.mouseMode = state.DEFAULT;
			}
		});

		$scope.$on('portOutMouseDown', function (event, data) {
			var node = getItemById(self.nodes, data.id);
			self.mouseMode = state.JOINING;
			self.activelink.nodes.length = 0;
			self.activelink.nodes.push(node);
		});

		$scope.$on('portOutMouseUp', function (event, data) {
			if (self.mouseMode === state.JOINING) {
				removeActiveLink();
				self.mouseMode = state.DEFAULT;
			}
		});

		$scope.$on('selectedItem', function (event, data) {
			self.isItemClicked = true;
		});

		$scope.$on('portInMouseUp', function (event, data) {
			if (self.mouseMode === state.JOINING) {


				var nodeFrom = getItemById(self.nodes, self.activelink.nodes[0].id);
				var nodeTo = getItemById(self.nodes, data.id);

				var link = newLink();
				link.id = "" + nodeFrom.id + nodeTo.id;
				link.nodes = [nodeFrom, nodeTo];

				if (validateLink(link, self.links)) {
					if (nodeFrom.wires) {
						nodeFrom.wires.push[data.id];
					} else {
						nodeFrom.wires = [[nodeFrom.id, nodeTo.id]];
					}

					$scope.$apply( function() {
						self.links.push(link);
					});
					removeActiveLink();
					self.mouseMode = state.DEFAULT;
				}
			}
		});

		function removeActiveLink() {
			$scope.$apply( function() {
				self.activelink.nodes.length = 0;
			});
		}
	}

	function parseNodesForLinks(nodes) {
		var links = [];
		nodes.forEach(function(node, i, array) {
			if (node.wires  && node.wires.length > 0) {
				for (var a = 0; a < node.wires.length; ++a) {
					var nodeTo = getItemById(nodes, node.wires[a]);
					var link = newLink();
					link.id = "" + node.id + nodeTo.id;
					link.nodes = [node, nodeTo];
					links.push(link);
				}
			}
		});
		return links;
	}

	function getItemById(array, id) {
		for (var i = 0; i < array.length ; i ++) {
			if (array[i].id === id) {
				return array[i];
			}
		}
		return {};
	}

	function selectItems (array, options) {
		if (typeof options == 'undefined') {
			for(var i = 0; i < array.length; ++i) {
				array[i].selected = true;
			}
		} else {
			for(var i = 0; i < array.length; ++i) {
				array[i].selected = options;
			}
		}
	}

	function removeSelectedItems(nodes, links) {
		var delNodes = [];
		var delLinks = [];
		for (var i = 0; i < nodes.length; ++i) {
			if (nodes[i].selected)
				delNodes.push(i);
		}

		for (var i = 0; i < links.length; ++i) {
			if (links[i].selected)
				delLinks.push(i);
			else {
				for (var a = 0; a < delNodes.length; ++a) {
					var nodeId = nodes[delNodes[a]].id;
					if (links[i].nodes[0].id === nodeId || links[i].nodes[1].id === nodeId) {
						delLinks.push(i);
						break;
					}
				}
			}
		}

		var coutnerDel = 0;
		for (var i = 0; i < delNodes.length; ++i) {
			nodes.splice(delNodes[i] - coutnerDel, 1);
			coutnerDel ++;
		}

		coutnerDel = 0;
		for (var i = 0; i < delLinks.length; ++i) {
			links.splice(delLinks[i] - coutnerDel, 1);
			coutnerDel ++;
		}
	}

	function convertCoordinateFromClienToSvg($element, parentNode, clientCoord) {
		var parentScrollPos = {
			x: parentNode.scrollLeft ? parentNode.scrollLeft: 0,
			y: parentNode.scrollTop ? parentNode.scrollTop: 0
		};

		var svgRect = $element[0].getBoundingClientRect();

		return {
			x: clientCoord.x - svgRect.left +  parentScrollPos.x,
			y: clientCoord.y - svgRect.top + parentScrollPos.y
		};
	}

	function getOffsetPos(element, event) {
		var elementRect = element[0].getBoundingClientRect();
		return {x: event.clientX - elementRect.left, y: event.clientY - elementRect.top};
	}

	function newLink() {
		return {
			id: '',
			nodes: [],
			selected: false
		}
	}

	function validateLink (link, links) {
		for (var i = 0; i < links.length; ++i) {
			if (link.id === links[i].id) {
				return false;
			}
		}
		return true;
	}

	Array.prototype.last = function() {
		return this[this.length-1];
	}

}