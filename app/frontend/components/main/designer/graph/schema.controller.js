
function SchemaController($scope, $rootScope, $element, coreService, appConfig, $compile, layerService) {
    const state = {
        DEFAULT: 0,
        SELECTION: 1,
        MOVING: 2,
        JOINING: 3,
        DRAGGING: 4,
        SHIFT: 5
    };

    const events = {
        INIT: 'graph:init',
        ADD_NODE: 'graph:addNode',
        REMOVE_NODE: 'graph:removeNode',
        ADD_LINK: 'graph:addLink',
        REMOVE_LINK: 'graph:removeLink',
        REMOVE_ITEMS: 'graph:removeItems',
        CHANGED_VIEWS: 'graph:changedViews',
        ACTIVATE_ITEM: 'graph:activateItem',
        CHANGE_POSITION: 'graph:changePosition',
        ADDED_LAYERS: 'graph:addedLayers',
        UPDATE: 'graph:update'
    };

    let self = this;
    let viewX = 0;
    let viewY = 0;
    let schema = new Schema(self, 10);

    self.$onInit = function() {
        let divSvg = document.getElementById('workspace');

        self.counterNodesInit = 0;
        self.scale = 1.0;
        coreService.param('scale', 1.0);
        self.viewWidth = divSvg.offsetWidth;
        self.viewHeight = divSvg.offsetHeight;

        if (self.viewWidth < 100 || self.viewHeight < 100) {
            self.viewWidth = 100;
            self.viewHeight = 100;
        }

        viewBox(viewX, viewY, self.viewWidth, self.viewHeight);


        self.mouseMode = state.DEFAULT;

        self.activelink = {
            nodes: []
        };
        self.selRect = null;
        schemaEvents();

        self.emitEvent(events.INIT, {});
        initBackground(self, $scope, appConfig.svgDefinitions.gridStep, $element, $compile);
	};

    let svgElement = $element[0].querySelector('#svg');
    let progressElement = $element[0].querySelector('#designer-progress');

	$scope.controlItem.viewportPos = function(x, y) {
		if (isNaN(x)  || isNaN(y))
			return;
        $scope.$apply( function() {
            viewX = x;
            viewY = y;
            viewBox(viewX, viewY, self.viewWidth, self.viewHeight);
        });
	};

	$scope.controlItem.getScale = function() {
	    return getScale();
	};

	$scope.controlItem.scale = function(scale) {
        setScale(scale);
  	};

    $scope.controlItem.addLayer = function(layer) {
        var node = schema.addNode(layer.name, layer.layerType, layer.category, layer.template, layer.id);
        if (!node)
            return false;
		node.position(layer.pos.x, layer.pos.y, appConfig.svgDefinitions.gridStep);

        return node.id;
    };

    $scope.controlItem.clear = function() {
        schema.clear();
  	};

    let addLinks = null;
    let layersSize = -1;

    let defaultCursor = document.body.style.cursor;

    $scope.controlItem.setLayers = function(layers, clear=true) {
        if (layers.length > 0) {
            document.body.style.cursor = 'wait';
        }
        self.counterNodesInit = 0;

        if (clear) {
            schema.clear();
        }

        layersSize = layers.length;
        if (layers.length > 0) {
            let index = 0;
            let layersInterval = setInterval(() => {
                $scope.$apply( function() {
                    let layerId = $scope.controlItem.addLayer(layers[index]);
                    if (!layerId) {
                        console.log('addLayer:error');
                        return false;
                    }
                    for (let a = 0; a < layers.length; a ++) {
                        if (layers[a].wires && layers[a].wires.length > 0)
                        layers[a].wires.forEach(function(nodeId, i, array){
                            if (nodeId === layers[index].id) {
                                layers[a].wires[i] = layerId;
                            }
                        });
                    }

                    layers[index].id = layerId;
                    self.emitEvent(events.UPDATE, [layers[index]]);

                });
                if (++index >= layers.length)
                    clearInterval(layersInterval);
            }, 0);
        }

        addLinks = function () {
            for (let a = 0; a < layers.length; a ++) {
                if (layers[a].wires && layers[a].wires.length > 0)
                    layers[a].wires.forEach(function(layerId, i, array){
                        schema.addLink(schema.getNodeById(layers[a].id), schema.getNodeById(layerId));
                    });
            }

            let rectView = schema.rect();

            if(rectView) {
                if (rectView.right() > $scope.svgWidth) {
                    $scope.svgWidth = rectView.right() * 1.2;
                }
                if (rectView.bottom() > $scope.svgHeight) {
                    $scope.svgHeight = rectView.bottom() * 1.2;
                }
            }


            initBackground(self, $scope, appConfig.svgDefinitions.gridStep, $element, $compile);


            if (layers.length > 1 && clear)
                $scope.controlItem.reset();

            self.emitEvent(events.ADDED_LAYERS, {});
        };

        return true;
    };


    var initProgress = function() {
        return function(val, max) {

            let curr = val;
            if (arguments.length > 1) {
                curr = (val / max) * 100;
            }
            self.progressValue = curr;

            if (curr > 0) {
                svgElement.style.visibility = 'hidden';
                progressElement.style.visibility = 'visible';
            }
            else {
                svgElement.style.visibility = 'visible';
                progressElement.style.visibility = 'hidden';
            }

        }
    };

    let progress = initProgress();

    $scope.$on('nodeInit', function (event, data) {

        if (layersSize < 1)
            return;
        if(self.counterNodesInit > -1) {
            self.counterNodesInit++;
            progress(self.counterNodesInit, layersSize);
        }

        if (self.counterNodesInit === layersSize) {
            self.counterNodesInit = -1;
            progress(0);
            layersSize = -1;
            addLinks();
            document.body.style.cursor = defaultCursor;

        }
    });

    $scope.controlItem.getNodes = function() {
        return schema.getSchema();
    };

    $scope.controlItem.reset = function() {
        let rect = schema.rect();
        if (rect && self.viewWidth > 0 && self.viewHeight > 0) {
            var sc = Math.min(self.viewWidth / rect.width(), self.viewHeight / rect.height());
            setScale(sc);
            viewBox(rect.x() * sc, rect.y() * sc, self.viewWidth, self.viewHeight);
        }
    };

    $scope.controlItem.setShape = function(nodeId, shapes, type) {
        $scope.$broadcast('node:set_shapes_' + nodeId, {shapes: shapes, type: type});
    };

    $scope.controlItem.undo = function() {
        schema.undo();
    };
    $scope.controlItem.redo = function() {
        schema.redo();
    };

    function addNode(name, layerType, category, template, pos) {
        var node = schema.addNode(name, layerType, category, template);
        if (!node)
            return false;

        node.position(pos.x, pos.y, appConfig.svgDefinitions.gridStep);
        self.emitEvent(events.ADD_NODE, node);

        return true;
    }

	function addLink(nodeFrom, nodeTo) {
		var link = schema.addLink(nodeFrom, nodeTo);
        if (link)
            self.emitEvent(events.ADD_LINK, link);
	}

	function clearScene() {
		schema.clear();
	}

    self.emitEvent = function(eventType, data) {
        $scope.$emit(eventType, data);
    };

    function schemaEvents() {
        self.isItemClicked = false;

		let prevMousePos = [0,0];
		let editedNode = {};
		let parentNode = angular.element($element[0].parentNode);

		let positionDrag = {x:0, y: 0};
		let activeItem = {};
		let multipleSelected = false;

        // Custom events:

		$rootScope.$on('palette_drag_start', function (event, data) {
			self.mouseMode = state.DRAGGING;
		});

		$rootScope.$on('palette_drag_end', function (event, data) {
			if (self.mouseMode === state.DRAGGING && positionDrag) {
				let pos = convertCoordinateFromClienToSvg($element, parentNode, positionDrag);
				positionDrag = false;
				let correctPos = { x: (pos.x + (viewX ) - data.offset.x) / self.scale, y: (pos.y + (viewY) - data.offset.y) / self.scale};
				if (correctPos.x > 0 && correctPos.y > 0) {
					$scope.$apply( function() {
                        if (data.node.category === 'complex') {
                            let layers = copyArray(data.node.structure.layers);
                            layers = normalizeLayersPosition(layers, getMinPosition(layers), correctPos);
                            let complexPosition = placeComplexLayer(schema.getNodes(), layers);
                            schema.saveState();
                            $scope.controlItem.setLayers(layers, false);
                        } else {
                            schema.saveState();

                            let templatePath = layerService.getTemplatePathByType(data.node.layerType);
						    addNode(data.node.name, data.node.layerType, data.node.category, templatePath, correctPos);
                        }

					});
				}
			}
		});

		$scope.$on('nodeMouseDown', function (event, data) {
		    self.mouseMode = state.MOVING;
			editedNode = schema.getNodeById(data.id);
			prevMousePos = getOffsetPos(svgElement, data.event);
		});

		$scope.$on('nodeMouseUp', function (event, data) {

			if (self.mouseMode === state.MOVING) {

				let curMousePos = getOffsetPos(svgElement, data);

                editedNode.move(
                    (curMousePos.x - prevMousePos.x) / self.scale,
                    (curMousePos.y - prevMousePos.y) / self.scale,
                    appConfig.svgDefinitions.gridStep
                );
                $scope.$broadcast('node:move_' + editedNode.id, editedNode);


                prevMousePos = curMousePos;
                self.emitEvent(events.CHANGE_POSITION, editedNode);
			} else if (self.mouseMode === state.JOINING) {
				removeActiveLink();
			}
            self.mouseMode = state.DEFAULT;
		});

		$scope.$on('portOutMouseDown', function (event, data) {
			let node = schema.getNodeById(data.id);
			self.mouseMode = state.JOINING;
			self.activelink.nodes.length = 0;

            let curMousePos = getOffsetPos(svgElement, data.event);
            curMousePos.x =  (viewX + curMousePos.x) / self.scale;
            curMousePos.y =  (viewY + curMousePos.y) / self.scale;
            $scope.$apply( function() {
                self.activelink.nodes.push(node);
                self.activelink.nodes.push({id: 'activePoint', pos: curMousePos});
            });
        });

		$scope.$on('portOutMouseUp', function (event, data) {
			if (self.mouseMode === state.JOINING) {
				removeActiveLink();
			}
            self.mouseMode = state.DEFAULT;
		});

		$scope.$on('portInMouseUp', function (event, data) {
			if (self.mouseMode === state.JOINING) {
				let nodeFrom = schema.getNodeById(self.activelink.nodes[0].id);
				let nodeTo = schema.getNodeById(data.id);

                $scope.$apply( function() {
                    addLink(nodeFrom, nodeTo);
                });
                removeActiveLink();
			}
            self.mouseMode = state.DEFAULT;
		});

		$scope.$on('selectedItem', function (event, data) {
			self.isItemClicked = true;
			let item = schema.getItemById(data.id, data.type);
            if (!multipleSelected) {
                if (data.ctrlKeyPressed) {
                    $scope.$apply( function() {
                         item.isActive = !item.isActive;
                     });
                } else if (data.id !== activeItem.id && !data.selected) {
                    $scope.$apply( function() {
                        selectItems (schema.getNodes(), false);
                        activeItem = -1;
                        item.isActive = true;
                    });
                }

            } else {
                if (data.ctrlKeyPressed) {
                     $scope.$apply( function() {
                         item.isActive = !item.isActive;
                     });
                } else if (!data.selected) {
                    $scope.$apply( function() {
                        selectItems (schema.getNodes(), false);
                        item.isActive = true;
                    });
                }
            }
			activeItem = item;
			self.emitEvent(events.ACTIVATE_ITEM, activeItem);
		});

		//Mouse events:

		$element.on('dragover', function (event) {
			if (self.mouseMode === state.DRAGGING) {
				positionDrag = {x: event.clientX, y: event.clientY};
			}
		});

		$element.on('click', function (event) {

		});

		angular.element(window).on('resize', function () {

            $scope.$apply( function() {
                let divSvg = document.getElementById('workspace');
                if (divSvg)
                    viewBox(viewX, viewY, divSvg.offsetWidth, divSvg.offsetHeight);
            });


		});

		$element.on('mousedown', function (event) {
			if (self.mouseMode === state.DEFAULT) {

                $scope.$apply( function() {
                    selectItems (schema.getNodes(), false);
                    selectItems (schema.getLinks(), false);
                });

                activeItem.isActive = false;
                activeItem = -1;
                multipleSelected = false;


                if (event.buttons === 1 && event.ctrlKey) {

					prevMousePos = getOffsetPos(svgElement, event);
                    prevMousePos.x += viewX;
                    prevMousePos.y += viewY;

					$scope.$apply( function() {
						self.selRect = Rect(prevMousePos.x, prevMousePos.y, prevMousePos.x, prevMousePos.y);
						self.selRect.isShown = true;
					});
					self.mouseMode = state.SELECTION;
				} else if (event.buttons === 1) {
					prevMousePos = getOffsetPos(svgElement, event);
					self.mouseMode = state.SHIFT;
				}
		    }
		});

		$element.on('mousemove', function (event) {
            if (self.mouseMode === state.SELECTION) {
			    let curMousePos = getOffsetPos(svgElement, event);
			    $scope.$apply( function() {
                    curMousePos.x += viewX;
                    curMousePos.y += viewY;
                    self.selRect = Rect(prevMousePos.x, prevMousePos.y, curMousePos.x, curMousePos.y);
                    self.selRect.isShown = true;
                });

		    } else if (self.mouseMode === state.SHIFT) {
		    	let curMousePos = getOffsetPos(svgElement, event);
		    	let left = viewX -(curMousePos.x - prevMousePos.x);
		    	let top = viewY - (curMousePos.y - prevMousePos.y);

		    	viewBox(left, top, self.viewWidth, self.viewHeight);
		    	prevMousePos = curMousePos;

		    } else if (self.mouseMode === state.MOVING && event.buttons === 1) {
				let curMousePos = getOffsetPos(svgElement, event);
				let offsetX = (curMousePos.x - prevMousePos.x) / self.scale;
				let offsetY = (curMousePos.y - prevMousePos.y) / self.scale;

				editedNode.move(offsetX, offsetY);
                $scope.$broadcast('node:move_' + editedNode.id, editedNode);

                if (editedNode.isActive) {
                    schema.getNodes().forEach(function (item) {
                        if (item.isActive && editedNode !== item) {
                            item.move(offsetX, offsetY);
                            $scope.$broadcast('node:move_' + item.id, item);
                        }
                    });
                }

				prevMousePos = curMousePos;
			} else if (self.mouseMode === state.JOINING  && event.buttons === 1) {
				let curMousePos = getOffsetPos(svgElement, event);
				curMousePos.x =  (viewX + curMousePos.x) / self.scale;
				curMousePos.y =  (viewY + curMousePos.y) / self.scale;
                if (self.activelink.nodes.length === 2) {
                    self.activelink.nodes[1].pos = curMousePos;
                }
                $scope.$broadcast('node:move_' + self.activelink.nodes[1].id, curMousePos);
			}
		});

		$element.on('mouseup', function () {
		    if (self.mouseMode === state.SELECTION) {
			    $scope.$apply( function() {

			        let selectedItems = schema.selectNodesInsideRect(self.selRect.scale(1 / self.scale));
			        if (selectedItems.length > 1) {
			            multipleSelected = true;
                    }
                    self.selRect = Rect(0,0,0,0);
                    self.selRect.isShown = false;
                });

		    } else if (self.mouseMode === state.JOINING) {
				removeActiveLink();
			}
            self.mouseMode = state.DEFAULT;
		});

		$element.on('mouseleave', function () {

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

		parentNode.on('keydown', function (event) {
			if (event.keyCode === 46) {
				$scope.$apply( function() {
					// if (activeItem && activeItem.isActive) {
					//     schema.saveState();
					//     if (schema.removeItem(activeItem.id, activeItem.type)) {
                     //        if (activeItem.type === 'node') {
                     //            self.emitEvent(events.REMOVE_NODE, activeItem);
                     //        } else if (activeItem.type === 'link') {
                     //            self.emitEvent(events.REMOVE_LINK, activeItem);
                     //        }
					//     }
					// 	activeItem = -1;
					// } else {
					    schema.saveState();
                        let rem = schema.removeSelectedItems();
						if (rem)
                			self.emitEvent(events.REMOVE_ITEMS, rem);
                	// }
           		});
			}
		});

		$element.on('wheel', function (event) {
			let delta = (event.deltaY || event.detail || event.wheelDelta) / 8;
			let scale = self.scale;
			if (delta > 0) {
				scale /= appConfig.svgDefinitions.scaleFactor;
				if (scale > appConfig.svgDefinitions.scaleMax) {
					scale = appConfig.svgDefinitions.scaleMax;
				}
			}
      		else {
      			scale *= appConfig.svgDefinitions.scaleFactor;
				if (scale < appConfig.svgDefinitions.scaleMin) {
					scale = appConfig.svgDefinitions.scaleMin;
				}
      		}
      		$scope.$apply( function() {
				let mousePos = getOffsetPos(svgElement, event);
      			let sc = scaleToPoint(scale, mousePos);
                coreService.param('scale', sc);
                self.scale = sc;
      		});
		});

        // system events:
		$element.on('focus', function (event) {

		});
    };

    function setScale(scale) {
        scale = scaleToPoint(scale);
        coreService.param('scale', scale);
        self.scale = scale;
	}

	function getScale() {
		return self.scale;
	}

    function removeActiveLink() {
        $scope.$apply( function() {
            self.activelink.nodes.length = 0;
        });
    }

    function scaleToPoint(scale, point) {
    	let divSvg = document.getElementById('workspace');
		let sceneWidth = scale * $scope.svgWidth;
		let sceneHeight = scale * $scope.svgHeight;
        let view = Rect(0, 0, sceneWidth, sceneHeight);

        if (arguments.length < 2) {
            point = {};
            point.x = divSvg.offsetWidth / 2;
            point.y = divSvg.offsetHeight / 2;
        }

        fitRectToRect(view, Rect(0, 0, divSvg.offsetWidth, divSvg.offsetHeight));

		self.width = view.width();
		self.height = view.height();

        scale = view.width() / $scope.svgWidth;

		let scalePrev = self.scale;

		let XPrev = (viewX + point.x) / scalePrev;
		let YPrev = (viewY + point.y) / scalePrev;

		let left = (XPrev - point.x / scale) * scale;
		let top =  (YPrev - point.y / scale) * scale;

		viewBox(left, top, divSvg.offsetWidth, divSvg.offsetHeight);
        return scale;
    }

    function viewBox(x, y, width, height) {

        if ((x + width) > self.width) {
            x = self.width - width;
        }
        if ((y + height) > self.height) {
            y = self.height - height;
        }

		if (x < 0)
		    x = 0;
        if (y < 0)
            y = 0;

    	viewX = x;
    	viewY = y;
    	self.viewWidth = width;
    	self.viewHeight = height;

        self.emitEvent(events.CHANGED_VIEWS, {x: viewX, y: viewY});
        svgElement.setAttribute('viewBox', viewX + ' ' + viewY + ' ' + self.viewWidth + ' ' + self.viewHeight);
    }

    function fitRectToRect(inner, outer) {
		if (inner.x() < outer.x())
			inner.x(outer.x());
		if (inner.y() < outer.y())
			inner.y(outer.y());

		if (inner.right() < outer.width() && inner.bottom() < outer.height()) {
            let ratioInner = inner.width() / inner.height();
            let ratioOuter = outer.width() / outer.height();
            if (ratioInner > ratioOuter) {
                inner.right(outer.width());
                inner.bottom(outer.width() / ratioInner);
            } else {
                inner.bottom(outer.height());
                inner.right(outer.height() * ratioInner);
            }
        }

	}
}

function initBackground(self, scope, step, element, $compile) {
    self.grid = {};
    self.grid.vertical = [];
    self.grid.horizontal = [];
    let viewGroup = angular.element(element[0].querySelector('#view'));
    while (viewGroup[0].firstChild) {
    	viewGroup[0].removeChild(viewGroup[0].firstChild);
	}
    let line = angular.element('<line>');
    line.attr('style', 'stroke:rgb(111,111,111);stroke-width:0.5');
    let html = '';

    let maxSize = scope.svgWidth > scope.svgHeight ? scope.svgWidth: scope.svgHeight
    maxSize *= 3;
    for (let a = 0; a < maxSize; a += step) {
        let curLine = line.clone();
        curLine.attr('x1', '' + a);
        curLine.attr('y1', '0');
        curLine.attr('x2', '' + a);
        curLine.attr('y2', '' + maxSize);
        html += curLine[0].outerHTML;
    }

    for (let a = 0; a < maxSize; a += step) {
        let curLine = line.clone();

        curLine.attr('x1', '0');
        curLine.attr('y1', '' + a);
        curLine.attr('x2', '' + maxSize);
        curLine.attr('y2', '' + a);
        html += curLine[0].outerHTML;
    }

    viewGroup.html(html);
    $compile(viewGroup.contents())(scope);
}

function getOffsetPos(element, event) {
    let elementRect = element.getBoundingClientRect();
    return {x: event.clientX - elementRect.left, y: event.clientY - elementRect.top};
}

function convertCoordinateFromClienToSvg($element, parentNode, clientCoord) {
	let parentScrollPos = {
		x: parentNode.scrollLeft ? parentNode.scrollLeft: 0,
		y: parentNode.scrollTop ? parentNode.scrollTop: 0
	};

	let svgRect = $element[0].getBoundingClientRect();

	return {
		x: clientCoord.x - svgRect.left +  parentScrollPos.x,
		y: clientCoord.y - svgRect.top + parentScrollPos.y
	};
}

function isPointInRect(point, rect) {
    return (point.x >= rect.x() &&
			point.x <= rect.right() &&
			point.y >= rect.y() &&
			point.y <= rect.bottom());
}

function selectItems (array, options) {
    if (typeof options == 'undefined') {
        for(let i = 0; i < array.length; ++i) {
            array[i].isActive = true;
        }
    } else {
        for(let i = 0; i < array.length; ++i) {
            array[i].isActive = options;
        }
    }
}

function normalizeLayersPosition(layers, minPosition, offset) {
    layers.forEach(function (layer) {
        // console.log(offset);
        layer.pos.x = layer.pos.x - minPosition.x + offset.x;
        layer.pos.y = layer.pos.y - minPosition.y + offset.y;
    });
    return layers;
}

function getMinPosition(layers) {
    let minPos = {
        x: Number.MAX_VALUE,
        y: Number.MAX_VALUE
    };
    layers.forEach(function (layer) {
        minPos.x = Math.min(minPos.x, layer.pos.x);
        minPos.y = Math.min(minPos.y, layer.pos.y);
    });
    return minPos;
}

function placeComplexLayer(network, complexLayer) {
    let complexLayerPosition = {x:0, y:0};
    let networkCenter = getNetworkCenter(network);
    let complexLayerCenter = getNetworkCenter(complexLayer);

    // console.log(networkCenter, complexLayerCenter);

    return complexLayerPosition;
}

function getNetworkCenter(network) {
    let networkCenter = {x:0, y:0};
    if (network.length > 0) {
        let networkMin = {x: Number.MAX_VALUE, y: Number.MAX_VALUE};
        network.forEach(function (item) {
            networkMin.x = Math.min(networkMin.x, item.pos.x);
            networkMin.y = Math.min(networkMin.y, item.pos.y);

            networkCenter.x += item.pos.x;
            networkCenter.y += item.pos.y;
        });
        networkCenter.x = networkCenter.x / network.length;
        networkCenter.y = networkCenter.y / network.length;
    }
    return networkCenter;
}
