
function SchemaController($scope, $rootScope, $window, $element, $timeout, networkDataService, networkLayerService, coreService, appConfig) {
    const state = {
        DEFAULT: 0,
        SELECTION: 1,
        MOVING: 2,
        JOINING: 3,
        DRAGGING: 4,
    }

    const events = {
        ADD_NODE: 'graph:addNode',
        REMOVE_NODE: 'graph:removeNode',
        ADD_LINK: 'graph:addLink',
        REMOVE_LINK: 'graph:removeLink',
        REMOVE_ITEMS: 'graph:removeItems'
    }

    var self = this;
    var viewX = 0;
    var viewY = 0;
    var schema = new Schema();

    self.$onInit = function() {
        self.counterNodesInit = 0;
        self.viewWidth = 0;
        self.viewHeight = 0;

        resize();
        viewBox(viewX, viewY, self.viewWidth, self.viewHeight);

        self.mouseMode = state.DEFAULT;
        self.links = schema.getLinks();
        self.nodes = schema.getNodes();

        self.activelink = {
            nodes: []
        };
        self.selRect = {
            isShown: false,
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
        schemaWatcher();
        schemaEvents();
        initBackground(self, $scope, appConfig.svgDefinitions.gridStep);
	};

	$scope.controlItem.viewportPos = function(x, y) {
	    $scope.$apply( function() {
            viewX = x;
            viewY = y;
            viewBox(viewX, viewY, self.viewWidth, self.viewHeight);
        });
	}

    $scope.controlItem.addLayer = function(layer) {
        var node = schema.addNode(layer.name, layer.category, layer.template, layer.id);
        if (!node)
            return false;
		node.position(layer.pos.x, layer.pos.y, appConfig.svgDefinitions.gridStep);

        return true;
    }

    $scope.controlItem.setLayers = function(layers) {

        schema.clear();

        for (let a = 0; a < layers.length; a ++) {
            if(!$scope.controlItem.addLayer(layers[a]))
                return false;
        }

        $timeout(function(){
            for (let a = 0; a < layers.length; a ++) {
                if (layers[a].wires && layers[a].wires.length > 0)
                    layers[a].wires.forEach(function(layerId, i, array){
                        schema.addLink(schema.getNodeById(layers[a].id), schema.getNodeById(layerId));
                    });
            }
        }, 400);

        return true;
    }

    $scope.controlItem.getNodes = function() {
        return schema.getSchema();
    }

    function addNode(name, category, template, pos) {
        var node = schema.addNode(name, category, template);
        if (!node)
            return false;

        node.position(pos.x, pos.y, appConfig.svgDefinitions.gridStep);
        self.emitEvent(events.ADD_NODE, {});
        return true;
    }

	function addLink(nodeFrom, nodeTo) {
		schema.addLink(nodeFrom, nodeTo);
		self.emitEvent(events.ADD_LINK, {});
	}

	function clearScene() {
		schema.clear();
	}

    self.emitEvent = function(eventType, data) {
        $scope.$emit(eventType, data);
    }

    function schemaWatcher() {
        $scope.$watch(function () {
                return coreService.param('scale');
            }, function(newValue, oldValue) {
                self.scale = newValue;
                self.width = self.scale * $scope.svgWidth;
                self.height = self.scale * $scope.svgHeight;
            }
        );
    }

    function schemaEvents() {
        self.isItemClicked = false;

		var prevMousePos = [0,0];
		var editedNode = {};
		var parentNode = angular.element($element[0].parentNode);

		var positionDrag = {x:0, y: 0};
		var activeItem = {};

        // Custom events:

		$rootScope.$on('palette_drag_start', function (event, data) {
			self.mouseMode = state.DRAGGING;
		});

		$rootScope.$on('palette_drag_end', function (event, data) {
			if (self.mouseMode === state.DRAGGING && positionDrag) {
				var pos = convertCoordinateFromClienToSvg($element, parentNode, positionDrag);
				positionDrag = false;
				var correctPos = { x: (pos.x - data.offset.x) / self.scale, y: (pos.y - data.offset.y) / self.scale};
				if (correctPos.x > 0 && correctPos.y > 0) {
					$scope.$apply( function() {
						addNode(data.data.name, data.data.category, data.data.template, correctPos)
					});
				}
			}
		});

		$scope.$on('nodeMouseDown', function (event, data) {
		    self.mouseMode = state.MOVING;
			editedNode = schema.getNodeById(data.id);
//			editedNode.isActive = true;
			prevMousePos = getOffsetPos($element, data.event);
		});

		$scope.$on('nodeMouseUp', function (event, data) {

			if (self.mouseMode === state.MOVING) {

				var curMousePos = getOffsetPos($element, data);
                $scope.$apply( function() {
                    editedNode.move(
                        (curMousePos.x - prevMousePos.x) / self.scale,
                        (curMousePos.y - prevMousePos.y) / self.scale,
                        appConfig.svgDefinitions.gridStep
                    );
                });

                prevMousePos = curMousePos;
			} else if (self.mouseMode === state.JOINING) {
				removeActiveLink();
			}
            self.mouseMode = state.DEFAULT;
		});

		$scope.$on('portOutMouseDown', function (event, data) {
			var node = schema.getNodeById(data.id);
			self.mouseMode = state.JOINING;
			self.activelink.nodes.length = 0;
			self.activelink.nodes.push(node);
		});

		$scope.$on('portOutMouseUp', function (event, data) {
			if (self.mouseMode === state.JOINING) {
				removeActiveLink();
			}
            self.mouseMode = state.DEFAULT;
		});

		$scope.$on('portInMouseUp', function (event, data) {
			if (self.mouseMode === state.JOINING) {
				var nodeFrom = schema.getNodeById(self.activelink.nodes[0].id);
				var nodeTo = schema.getNodeById(data.id);

                $scope.$apply( function() {
                    addLink(nodeFrom, nodeTo);
                });
                removeActiveLink();
			}
            self.mouseMode = state.DEFAULT;
		});

		$scope.$on('selectedItem', function (event, data) {
			self.isItemClicked = true;
			$scope.$apply( function() {
                if (activeItem && activeItem.id === data.id) {
                    activeItem.isActive = !activeItem.isActive;
                } else {
                    activeItem.isActive = false;
                    activeItem = schema.getItemById(data.id, data.type);
                    activeItem.isActive = true;
                }
            });
		});

		//Mouse events:

		$element.on('dragover', function (event) {
			if (self.mouseMode === state.DRAGGING) {
				positionDrag = {x: event.clientX, y: event.clientY};
			}
		});

		$element.on('click', function (event) {

		});

		angular.element(window).on('resize', function (event) {
            $scope.$apply( function() {
                resize();
                viewBox(viewX, viewY, self.viewWidth, self.viewHeight);
            });

		});

		$element.on('mousedown', function (event) {
			if (self.mouseMode === state.DEFAULT) {

			    if (!self.isItemClicked) {
                    $scope.$apply( function() {
                        selectItems (self.nodes, false);
                        selectItems (self.links, false);
                    });
                    activeItem.isActive = false;
                    activeItem = -1;
                }
                self.isItemClicked = false;

			    var curMousePos = getOffsetPos($element, event);

			    $scope.$apply( function() {
			        prevMousePos = curMousePos;
                    self.selRect = Rect(curMousePos.x, curMousePos.y, curMousePos.x, curMousePos.y);
                    self.selRect.isShown = true;
                });
                self.mouseMode = state.SELECTION;
		    }
		});

		$element.on('mousemove', function (event) {
            if (self.mouseMode === state.SELECTION) {
			    var curMousePos = getOffsetPos($element, event);
			    $scope.$apply( function() {
                    self.selRect = Rect(prevMousePos.x, prevMousePos.y, curMousePos.x, curMousePos.y);
                    self.selRect.isShown = true;
                });

		    } else if (self.mouseMode === state.MOVING && event.buttons === 1) {


				var curMousePos = getOffsetPos($element, event);
				$scope.$apply( function() {
                    editedNode.move((curMousePos.x - prevMousePos.x) / self.scale, (curMousePos.y - prevMousePos.y) / self.scale);
                });
				prevMousePos = curMousePos;
			} else if (self.mouseMode === state.JOINING  && event.buttons === 1) {
				var curMousePos = getOffsetPos($element, event);
				curMousePos.x =  curMousePos.x / self.scale;
				curMousePos.y =  curMousePos.y / self.scale;
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

		    if (self.mouseMode === state.SELECTION) {
			    var curMousePos = getOffsetPos($element, event);
			    $scope.$apply( function() {
                    schema.selectNodesInsideRect(self.selRect.scale(1 / self.scale));
                    self.selRect = Rect(0,0,0,0);
                    self.selRect.isShown = false;
                });

		    } else if (self.mouseMode === state.JOINING) {
				removeActiveLink();
			}
            self.mouseMode = state.DEFAULT;
		});

		$element.on('mouseleave', function (event) {

		    if (self.mouseMode === state.DEFAULT) {

		    } else if (self.mouseMode === state.MOVING) {

            } else if (self.mouseMode === state.SELECTION) {
                $scope.$apply( function() {
			        self.selRect = Rect(0,0,0,0);
                    self.selRect.isShown = false;
                });
            } else if (self.mouseMode === state.JOINING) {
                removeActiveLink();
            }

            self.mouseMode = state.DEFAULT;
		});

        // keyboard events:
        var parentNode = angular.element($element[0].parentNode);

		parentNode.on('keydown', function (event) {
			if (event.keyCode === 46) {
				$scope.$apply( function() {
					if (activeItem && activeItem.isActive) {
					    if (schema.removeItem(activeItem.id, activeItem.type)) {
					        self.emitEvent(activeItem.type === 'node' ? events.REMOVE_NODE : events.REMOVE_LINK, {});
					    }
						activeItem = -1;
					} else {
						if (schema.removeSelectedItems())
                			self.emitEvent(events.REMOVE_ITEMS, {});
                	}
           		});
			}
		});

        // system events:
		$element.on('focus', function (event) {

		});
    }
    function removeActiveLink() {
        $scope.$apply( function() {
            self.activelink.nodes.length = 0;
        });
    }

    function viewBox(x, y, width, height) {
        $element.attr('viewBox', x + ' ' + y + ' ' + width + ' ' + height);
    }

    function resize() {
        var divSvg = document.getElementById('workspace');

        self.viewWidth = divSvg.offsetWidth - 10;
        self.viewHeight = divSvg.offsetHeight - 10;
    }
}

function initBackground(self, scope, step) {
    self.grid = {}
    self.grid.vertical = []
    for (let a = 0; a < scope.svgWidth; a += step)
        self.grid.vertical.push({
            x: a,
            y: 0,
            x2: a,
            y2: scope.svgHeight,
        });

    self.grid.horizontal = []
    for (let a = 0; a < scope.svgHeight; a += step)
        self.grid.horizontal.push({
            x: 0,
            y: a,
            x2: scope.svgWidth,
            y2: a,
        });
}

function getOffsetPos(element, event) {
    var elementRect = element[0].getBoundingClientRect();
    return {x: event.clientX - elementRect.left, y: event.clientY - elementRect.top};
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

function isPointInRect(point, rect) {
    if (point.x >= rect.x && point.x <= rect.x + rect.width
        && point.y >= rect.y && point.y <= rect.y + rect.height)
        return true;
    return false;
}

function selectItems (array, options) {
    if (typeof options == 'undefined') {
        for(var i = 0; i < array.length; ++i) {
            array[i].isActive = true;
        }
    } else {
        for(var i = 0; i < array.length; ++i) {
            array[i].isActive = options;
        }
    }
}