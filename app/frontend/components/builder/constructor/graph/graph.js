'use strict';

angular.module('graph', [

]);

angular.module('graph')
	.service('graphService', GraphService)
	.directive('svgGraph', initComponent)
	.directive('node', node)
	.directive('nodelink', link);

function GraphService() {

}

function initComponent() {
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
}

function node() {
	return {
		restrict: 'E',
		controller: NodeCtrl,
		controllerAs: 'nd',
		replace: true,
		scope: {
		   nodeData: '=',
		},
		templateUrl: 'frontend/components/builder/constructor/graph/node.html',
		templateNamespace: 'svg',

		link: function($scope, element, attrs) {

			element.attr('id', 'id_' + $scope.nodeData.id);
		    var isPort = false;
            var width = 20;
            var height = 50;
            var pad = 24;
            var txtWidth  = calculateTextWidth($scope.nodeData.content, "", 1);
            //var txtHeight = calculateTextHeight($scope.nodeData.content, "", 1);
            width += txtWidth + 2*pad;
            var rectNode = angular.element(element[0].querySelector('rect'));
	        var textNode = angular.element(element[0].querySelector('text'));

            var portIn = angular.element(element[0].querySelector('.port'));
            var portOut = angular.element(element[0].querySelector('circle:last-child'));

            textNode.attr('x', (width-txtWidth)/2.);
            textNode.attr('y', height/2.);
            rectNode.attr('width', width);
            rectNode.attr('height', height);

            portIn.attr('cx', 0);
            portIn.attr('cy', height / 2);

            portOut.attr('cx', width);
            portOut.attr('cy', height / 2);

            portIn.on('mouseenter', function (event) {
                isPort = true;
                portIn.addClass("port_hovered");
            });

            portIn.on('mouseleave', function (event) {
                isPort = false;
                portIn.removeClass("port_hovered");
            });

            portIn.on('mouseup', function (event) {
                $scope.$emit('portInMouseUp', {
                	id: $scope.nodeData.id,
                	pos: {x: 0, y: height / 2}
                });
            });

            portOut.on('mouseenter', function (event) {
                isPort = true;
                portOut.addClass("port_hovered");
            });

            portOut.on('mouseleave', function (event) {
                isPort = false;
                portOut.removeClass("port_hovered");
            });

            portOut.on('mousedown', function (event) {
            	if (event.button === 0) {
					$scope.$emit('portOutMouseDown', {
						id: $scope.nodeData.id,
						pos: {x: width, y: height / 2}
					});
                }
            });

            portOut.on('mouseup', function (event) {
                $scope.$emit('portOutMouseUp', {
                	id: $scope.nodeData.id,
                	pos: {x: width, y: height / 2}
                });
            });

            element.on('mousedown', function (event) {
                if (isPort)
                    return;
                rectNode.addClass("node_selected");
				var offsetMousePos = getOffsetPos(rectNode, event);

                $scope.$emit('nodeMouseDown', {
                	id: $scope.nodeData.id,
                	pos: {x: offsetMousePos.x, y: offsetMousePos.y}
                });
            });

            element.on('click', function (event) {
                if (isPort)
                    return;
                $scope.$apply( function() {
                    $scope.nodeData.selected = !$scope.nodeData.selected;
                });

                $scope.$emit('selectedItem', {
                    id: $scope.nodeData.id,
                    type: 'node',
                    selected: $scope.nodeData.selected
                });

                console.log('click');
            });

            $scope.$watch('nodeData.selected', function(newValue, oldValue) {
				if (newValue) {
                    rectNode.addClass("node_active");
                    rectNode.attr('stroke-dasharray', '5,5');
                } else {
                    rectNode.removeClass("node_active");
                    rectNode.attr('stroke-dasharray', '');
                }
			});

            element.on('mouseup', function () {
                rectNode.removeClass("node_selected");
                $scope.$emit('nodeMouseUp', { });
                console.log('up');
            });
        }
	}
}

function link() {
	return {
		restrict: 'E',
		controller: LinkCtrl,
		controllerAs: 'ln',
		replace: true,
		scope: {
		   linkData: '=',
		},
		templateUrl: 'frontend/components/builder/constructor/graph/link.html',
		templateNamespace: 'svg',

		link: function($scope, element, attrs) {
			var parentNode = angular.element(element[0].parentNode);

			var fromNodeRect = angular.element(parentNode[0].querySelector('#id_' + $scope.linkData.nodes[0].id).firstElementChild);
			var fromRect = fromNodeRect[0].getBoundingClientRect();
			var fromWidth = fromRect.right - fromRect.left;
			var fromHeight = fromRect.bottom - fromRect.top;
			var from = {x: $scope.linkData.nodes[0].pos.x + fromWidth, y: $scope.linkData.nodes[0].pos.y + fromHeight / 2};

			var to = {};
			if($scope.linkData.nodes[1].id === 'activePoint') {
				to = $scope.linkData.nodes[1].pos;
			} else {
				var toNodeRect = angular.element(parentNode[0].querySelector('#id_' + $scope.linkData.nodes[1].id).firstElementChild);
				var toRect = toNodeRect[0].getBoundingClientRect();
				var toWidth = toRect.right - toRect.left;
				var toHeight = toRect.bottom - toRect.top;
				to = {x: $scope.linkData.nodes[1].pos.x, y: $scope.linkData.nodes[1].pos.y + toHeight / 2};
			}

			element.on('mouseenter', function (event) {

                element.addClass("link_line_active");
            });

            element.on('mouseleave', function (event) {
                if (!$scope.linkData.selected) {
                    element.removeClass("link_line_active");
                }
            });

            element.on('click', function (event) {
                $scope.$apply( function() {
                    $scope.linkData.selected = !$scope.linkData.selected;
                });
                $scope.$emit('selectedItem', {
                    id: $scope.linkData.id,
                    type: 'link',
                    selected: $scope.linkData.selected
                });
            });

            $scope.$watch('linkData.selected', function(newValue, oldValue) {
                if (newValue) {
                    element.addClass("link_line_active");
                    element.attr('stroke-dasharray', '5,5');
                } else {
                    element.removeClass("link_line_active");
                    element.attr('stroke-dasharray', '');
                }
			});

			$scope.$watch('linkData.nodes[0].pos.x', function(newValue, oldValue) {
				from.x += newValue - oldValue;
				updatePos();
			});

			$scope.$watch('linkData.nodes[0].pos.y', function(newValue, oldValue) {
				from.y += newValue - oldValue;
				updatePos();
			});

			$scope.$watch('linkData.nodes[1].pos.x', function(newValue, oldValue) {
				to.x += newValue - oldValue;
				updatePos();
			});

			$scope.$watch('linkData.nodes[1].pos.y', function(newValue, oldValue) {
				to.y += newValue - oldValue;
				updatePos();
			});

			function updatePos(){
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
	}
}

function NodeCtrl($scope, $element, $document) {

}

function LinkCtrl($scope, $element, $document) {

}

function GraphController($scope, $rootScope, $window, $element, constructorService) {
	var self = this;

    svgHandler.bind(self)($scope, $rootScope, $window, $element);

	self.nodes = constructorService.getNodes();
	self.links = parseNodesForLinks(self.nodes);
	self.activelink = {
	    nodes: []
	};

    self.$onInit = function() {

    };
}

function svgHandler($scope, $rootScope,$window, $element) {
	var self = this;

	self.isItemClicked = false;

	const state = {
        DEFAULT: 0,
        MOVING: 1,
        JOINING: 2,
        DRAGGING: 3,
    }
    self.mouseMode = state.DEFAULT;

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

    $element.on('click', function (event) {
        if (!self.isItemClicked) {
            $scope.$apply( function() {
                selectItems (self.nodes, false);
                selectItems (self.links, false);
            });
        }
        self.isItemClicked = false;
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

function calculateTextWidth(str, className, offset) {
    var sp = document.createElement('span');
    sp.className = className;
    sp.style.position = 'absolute';
    sp.style.top = '-1000px';
    sp.innerHTML = (str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    document.body.appendChild(sp);
    var w = sp.offsetWidth;
    document.body.removeChild(sp);
    return offset+w;
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