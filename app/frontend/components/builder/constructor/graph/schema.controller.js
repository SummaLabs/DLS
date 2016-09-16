
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
    var schema = new Schema();

    self.$onInit = function() {
        self.counterNodesInit = 0;

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

    $scope.controlItem.addLayer = function(layer) {
        var node = schema.addNode(layer.name, layer.category, layer.template, layer.id);
        if (!node)
            return false;
		node.position(layer.pos.x, layer.pos.y);

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

    function addNode(name, type, template, pos) {
        var node = schema.addNode(name, type, template);
        if (!node)
            return false;

        node.position(pos.x, pos.y);
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
		var activeItem = {
			id: -1,
			type: null
		};

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
			activeItem.id = data.id;
			activeItem.type = data.type;
		});

		//Mouse events:

		$element.on('dragover', function (event) {
			if (self.mouseMode === state.DRAGGING) {
				positionDrag = {x: event.clientX, y: event.clientY};
			}
		});

		$element.on('click', function (event) {

		});

		$element.on('mousedown', function (event) {
			if (self.mouseMode === state.DEFAULT) {

			    if (!self.isItemClicked) {
                    $scope.$apply( function() {
                        selectItems (self.nodes, false);
                        selectItems (self.links, false);
                    });
                    activeItem.id = -1;
                }
                self.isItemClicked = false;

			    var curMousePos = getOffsetPos($element, event);

			    $scope.$apply( function() {
			        prevMousePos = curMousePos;
                    self.selRect = rect(curMousePos.x, curMousePos.y, curMousePos.x, curMousePos.y);
                    self.selRect.isShown = true;
                });
                self.mouseMode = state.SELECTION;
		    }
		});

		$element.on('mousemove', function (event) {
            if (self.mouseMode === state.SELECTION) {
			    var curMousePos = getOffsetPos($element, event);
			    $scope.$apply( function() {
                    self.selRect = rect(prevMousePos.x, prevMousePos.y, curMousePos.x, curMousePos.y);
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
                    schema.selectNodesInsideRect(self.selRect);
                    self.selRect = rect(0,0,0,0);
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
			        self.selRect = rect(0,0,0,0);
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
					if (activeItem.id >= 0) {
						if (activeItem.type === 'node') {
							schema.removeNode(activeItem.id);
							self.emitEvent(events.REMOVE_NODE, {});
						} else if (activeItem.type === 'link') {
							self.links.forEach(function(link, index, array){
								if (link.id === activeItem.id) {
									self.links.splice(index, 1);
								}
							});
							self.emitEvent(events.REMOVE_LINK, {});
						}
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
            array[i].selected = true;
        }
    } else {
        for(var i = 0; i < array.length; ++i) {
            array[i].selected = options;
        }
    }
}


function Position(x, y) {
    this.x = x;
    this.y = y;

    this.getScaledPos = function(scale) {
        return new Position(this.x * scale, this.y * scale);
    }

    this.getAddedPos = function(offset, offsetY) {
        if (arguments.length === 1)
            return new Position(this.x + offset.x, this.y + offset.y);
        else if (arguments.length === 2)
            return new Position(this.x + offset, this.y + offsetY);
        else return new Position(this.x, this.y);
    }
}

function rect(x1, y1, x2, y2) {
    var rect = {};

    rect.width = Math.abs(x1 - x2);
    rect.height = Math.abs(y1 - y2);

    if (x1 > x2)
        rect.x = x2;
    else rect.x = x1;

    if (y1 > y2)
        rect.y = y2;
    else rect.y = y1;

    return rect;
}

function Node() {
    this.id;
    this.name;
    this.type;
    this.selected = false;
    this.template;
    this.pos = new Position(0, 0);

    this.position = function(x, y) {
        if (!arguments.length)
            return this.pos;

        this.pos = new Position(x, y);
    }

    this.move = function(offsetX, offsetY, step) {
        if (!step)
            step = 1;
        var newPos = this.pos.getAddedPos(offsetX, offsetY);
        if (newPos.x < 0)
            newPos.x = 0;
        if (newPos.y < 0)
            newPos.y = 0;
        this.pos.x = newPos.x - (newPos.x % step) + 0.5;
        this.pos.y = newPos.y - (newPos.y % step) + 0.5;
    }
}

function Link() {
    this.id;
    this.nodes = [];
    this.selected = false;
}

function Schema() {
    var nodes = [];
    var links = []
    var idList = [];

    this.getSchema = function() {
    	var schema = [];

    	nodes.forEach(function(node, i, ar){
    		var layer = Object.create(null);
    		layer.id = node.id;
			layer.name = node.name;
			layer.category = node.type;
			layer.template = node.template;
			layer.pos = node.pos;
			layer.wires = [];
			links.forEach(function(link, i, ar){
				if (link.nodes[0].id === layer.id) {
					layer.wires.push(link.nodes[1].id);
				}
			});
    		schema.push(layer);
    	});
    	return schema;
    }

    this.addNode = function(name, type, template, id) {
        var node = new Node();
        if (id && checkIdForUnique(id)) {
            node.id = id;
        } else {
            node.id = 'node_' + generateId();
        }

        node.name = name;
        node.type = type;
        node.template = template;
        nodes.push(node);
        return node;
    }

    this.getNodeById = function(id) {
        return getItemById(nodes, id);
    }

    this.getNodes = function() {
        return nodes;
    }

    this.removeNode = function(id) {
        nodes.forEach(function(node, index, array){
            if (node.id === id) {
                nodes.splice(index, 1);
                var ind = 0;
                while (ind < links.length)	{
                    var link = links[ind];
                    if (link.nodes.length === 2) {
                        if (link.nodes[0].id === id || link.nodes[1].id === id ) {
                            links.splice(ind, 1);
                            continue;
                        }
                    }
                    ind++;
                }
            }
        });
    }

    this.removeSelectedItems = function() {
        var delNodes = [];
        var delLinks = [];

        for (var i = 0; i < nodes.length; ++i) {
            if (nodes[i].selected) {
                delNodes.push(i);
            }
        }

        for (var i = 0; i < links.length; ++i) {
            if (links[i].selected) {
                delLinks.push(i);
            }
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

        var counterDel = 0;
        for (var i = 0; i < delNodes.length; ++i) {
            nodes.splice(delNodes[i] - counterDel, 1);
            counterDel ++;
        }
        counterDel = 0;
        for (var i = 0; i < delLinks.length; ++i) {
            links.splice(delLinks[i] - counterDel, 1);
            counterDel ++;
        }
        if (delNodes.length > 0 || delLinks.length > 0) {
        	return true;
        }
        return false;
    }

    this.selectNodesInsideRect = function(rect) {
        var listSelected = []
        for (var i = 0; i < nodes.length ; i ++) {
            if (isPointInRect({x: nodes[i].pos.x, y: nodes[i].pos.y}, rect)
                && isPointInRect({  x: nodes[i].pos.x + nodes[i].displayData.node.width,
                                    y: nodes[i].pos.y + nodes[i].displayData.node.height }, rect)) {
                nodes[i].selected = true;
                listSelected.push(nodes[i]);
            }
        }
        return listSelected;
    }

    this.clear = function() {
        nodes.length = 0;
        links.length = 0;
        idList.length = 0;
    }

    this.addLink = function(from, to) {
        if (this.getLinkById(from.id + '_' + to.id))
            return;

        var link = new Link();
        link.id = from.id + '_' + to.id;

        link.nodes = [from, to];
        links.push(link);
        return link;
    }

    this.getLinkById = function(id) {
        return getItemById(links, id);
    }

    this.getLinks = function() {
        return links;
    }

    function generateId() {
        var id;
        while (true) {
            id = Math.floor(Math.random() * 0x10000).toString(16);
            if (checkIdForUnique(id)) {
                idList.push(id);
                return id;
            }
        }
    }

    function checkIdForUnique(id) {
        if (idList.indexOf(id) === -1)
            return true;
        return false;
    }

    function getItemById(array, id) {
        for (var i = 0; i < array.length ; i ++) {
            if (array[i].id === id) {
                return array[i];
            }
        }
    }
}