'use strict';


function CoreService(layerService, appConfig) {
    let store = {};
    store.scale = 1;
    let counter = 0;
    let layerDefinition = {};
    let schema = null;
    this.createSchema = function (viewContext, maxStorageSize) {
         schema = new Schema(viewContext, maxStorageSize);
         return schema;
    };

    this.addLayerByDefault = function (layerType, position) {
         let layer = layerService.getLayerByType(layerType);
         let node = schema.addNode(layer);
         node.position(position.x, position.y, appConfig.svgDefinitions.gridStep);
         return node;
    };

    this.addLayer = function (layer, position) {
         let node = schema.addNode(layer);
         node.position(position.x, position.y, appConfig.svgDefinitions.gridStep);
         return node;
    };

    this.getLayerById = function (id) {
        return schema.getNodeById(id);
    };

    this.getNetwork = function () {
        return schema.getSchema();
    };

    this.param = function (key, value) {
        if (arguments.length === 1)
            return store[key];

        store[key] = value;
    };



    this.getNodeTemplate = function(layerType) {
		let template = layerService.getTemplateByType(layerType);
		if (!template)
			template = layerService.getTemplateByType('data');

		return template;
	};

	this.getNodeDefinition = function(layerType) {
		if (!layerDefinition[layerType]) {
			counter ++;
			let templateHtml = this.getNodeTemplate(layerType);
			if (!templateHtml)
				console.log('Template for "layerType" did not loaded!');

        	layerDefinition[layerType] = calculateProportions(templateHtml, appConfig.svgDefinitions.markerPortIn, appConfig.svgDefinitions.markerPortOut);
		}

		return layerDefinition[layerType];
	};


	function calculateProportions(templateHtml, portInSign, portOutSign) {
	    let displayData = {};

        let svg = document.createElement('div');
        svg.style.position = 'absolute';
        svg.style.top = '-1000px';
        svg.innerHTML = '<svg>' + templateHtml + '</svg>';
        document.body.appendChild(svg);

        let portIn = angular.element(svg.querySelector('#' + portInSign));
        if (!portIn[0])
        	console.log(portIn, portInSign, templateHtml);
        let portInRect = portIn[0].getBoundingClientRect();
        let portOut = angular.element(svg.querySelector('#' + portOutSign));
        let portOutRect = portOut[0].getBoundingClientRect();
        let rect = angular.element(svg.firstElementChild.firstElementChild);
        let elementRect = rect[0].getBoundingClientRect();

        displayData.portIn = {
            centerOffset: {
                x: portInRect.left + (portInRect.right - portInRect.left) / 2,
                y: portInRect.top  + (portInRect.bottom - portInRect.top) / 2 + 1000
            },
            width: portInRect.right - portInRect.left,
            height: portInRect.bottom - portInRect.top
        };

        displayData.portOut = {
            centerOffset: {
                x: portOutRect.left + (portOutRect.right - portOutRect.left) / 2,
                y: portOutRect.top  + (portOutRect.bottom - portOutRect.top) / 2 + 1000
            },
            width: portOutRect.right - portOutRect.left,
            height: portOutRect.bottom - portOutRect.top
        };



        displayData.node = {
            offsetCenter: {
                x: elementRect.left + (elementRect.right - elementRect.left) / 2,
                y: elementRect.top  + (elementRect.bottom - elementRect.top) / 2 + 1000
            },
            width: elementRect.right - elementRect.left,
            height: elementRect.bottom - elementRect.top
        };
        document.body.removeChild(svg);
        return displayData;
	}

}

function Position(x, y, step) {
    if (!step)
        step = 1;
    this.x = x - x % step;
    this.y = y - y % step;
}

Position.pos = (x, y) => new Position(x, y);
Position.prototype.getScaledPos = function(scale) {
    return new Position(this.x * scale, this.y * scale);
};

Position.prototype.getAddedPos = function(offset, offsetY) {
    if (arguments.length === 1)
        return new Position(this.x + offset.x, this.y + offset.y);
    else if (arguments.length === 2)
        return new Position(this.x + offset, this.y + offsetY);
    else return new Position(this.x, this.y);
};

function Rect(x1, y1, x2, y2) {
    let x;
    let y;
    let width;
    let height;


    function _rect(){

        this.scale = function(scale) {
            let scaled_rect = Rect(0,0,0,0);
            scaled_rect.x(x * scale);
            scaled_rect.y(y * scale);
            scaled_rect.width(width * scale);
            scaled_rect.height(height * scale);
            return scaled_rect;
        };

        this.x = function(left) {
            if (!arguments.length)
                return x;
            x = left;
        };

        this.y = function(top) {
            if (!arguments.length)
                return y;
            y = top;
        };

        this.width = function(w) {
            if (!arguments.length)
                return width;
            width = w;
        };

        this.height = function(h) {
            if (!arguments.length)
                return height;
            height = h;
        };

        this.right = function(r) {
            if (!arguments.length)
                return x + width;
            width = r - x;
        };

        this.bottom = function(b) {
            if (!arguments.length)
                return y + height;
            height = b - y;
        };

        this.toString = function() {
            return "\nx: " + x + "\ny: " + y + "\nwidth: " + width + "\nheight: " + height;
        }

    }

    let rc = new _rect();
    rc.x(Math.min(x1, x2));
    rc.y(Math.min(y1, y2));
    rc.width(Math.abs(x1 - x2));
    rc.height(Math.abs(y1 - y2));

    return rc;
};

function Item(type) {
    this.id = null;
    this.type = type;
    this.isActive = false;
};

function Node() {
    Item.call(this, 'node');

    this.name = null;
    this.layerType = null;
    // this.template = null;
    this.category = null;
    this.pos = new Position(0, 0);
    this.params = {};
};

Node.prototype = Object.create(Item.prototype);
Node.prototype.constructor = Node;

Node.prototype.position = function(x, y, step) {
    if (!arguments.length)
        return this.pos;

    this.pos = new Position(x, y, step);
};

Node.prototype.move = function(offsetX, offsetY, step) {
    if (!step)
        step = 1;
    let newPos = this.pos.getAddedPos(offsetX, offsetY);
    if (newPos.x < 0)
        newPos.x = 0;
    if (newPos.y < 0)
        newPos.y = 0;
    this.pos.x = newPos.x - (newPos.x % step) + 0.5;
    this.pos.y = newPos.y - (newPos.y % step) + 0.5;
};

function Link() {
    Item.call(this, 'link');
    this.nodes = [];
}
Link.prototype = Object.create(Item.prototype);
Link.prototype.constructor = Link;

function SchemaStorage(size) {
    this.maxSize = size;
    this.schemaStorage = [];
    this.storageIndex = 0;
}

SchemaStorage.prototype.createState = function() {
    let state = {
        nodes: [],
        links: [],
        idList: []
    };

    if (this.schemaStorage.length === this.maxSize) {
        this.schemaStorage.shift();
    }
    this.schemaStorage.splice(this.storageIndex + 1, this.schemaStorage.length - this.storageIndex - 1);

    this.storageIndex = this.schemaStorage.push(state) - 1;
    return state;
};

SchemaStorage.prototype.saveState = function() {
    let state = this.createState();
    state.nodes = copyArray(this.schemaStorage[this.schemaStorage.length - 2].nodes);
    state.links = copyArray(this.schemaStorage[this.schemaStorage.length - 2].links);
    state.idList = copyArray(this.schemaStorage[this.schemaStorage.length - 2].idList);
    return state;
};

SchemaStorage.prototype.free = function() {
    this.schemaStorage.forEach(function(state) {
        state.nodes.length = 0;
        state.links.length = 0;
        state.idList.length = 0;
    });
    this.schemaStorage.length = 1;
    this.storageIndex = 0;
};

SchemaStorage.prototype.currentState = function() {
    return this.schemaStorage[this.storageIndex];
};

SchemaStorage.prototype.undo = function() {
    if (this.storageIndex > 0) {
        return this.schemaStorage[--this.storageIndex];
    }
    return null;
};

SchemaStorage.prototype.redo = function() {
    if (this.storageIndex < this.schemaStorage.length -1) {
        return this.schemaStorage[++this.storageIndex];
    }
    return null;
};


function Schema(viewContext, maxStorageSize) {

    let storage = new SchemaStorage(maxStorageSize);
    storage.createState();


    this.saveState = function () {
        let state = storage.saveState();
        this.updateLinks();
        return state;
    };

    this.currentState = function () {
        let state = storage.currentState();
        viewContext.nodes = state.nodes;
        viewContext.links = state.links;

        return state;
    };

    this.undo = function () {
        let state = storage.undo();
        this.updateLinks();
        if (state) {
            viewContext.nodes = state.nodes;
            viewContext.links = state.links;
        }

        return state;
    };

    this.redo = function () {
        let state = storage.redo();
        this.updateLinks();
        if (state) {
            viewContext.nodes = state.nodes;
            viewContext.links = state.links;
        }

        return state;
    };

    this.getSchema = function() {
    	let schema = [];
    	let nodes = this.currentState().nodes;
    	let links = this.currentState().links;

    	nodes.forEach(function(node){
    		let layer = {};/*Object.create(null);*/
    		layer.id = node.id;
			layer.name = node.name;
            layer.layerType = node.layerType;
			layer.category = node.category;
			layer.pos = node.pos;
			layer.params = node.params;
			layer.wires = [];
			links.forEach(function(link){
				if (link.nodes[0].id === layer.id) {
					layer.wires.push(link.nodes[1].id);
				}
			});
    		schema.push(layer);
    	});
    	return schema;
    };

    this.updateShapes = function () {
        let self = this;
        let sch = this.getSchema();
        calculateShapesInModel(sch);
        sch.forEach(function (item) {
            let node = self.getNodeById(item.id);
            node.shapeInp = item.shapeInp;
            node.shapeOut = item.shapeOut;
        });
    };

    this.addNode = function(layer) {
        let node = new Node();
        let nodes = this.currentState().nodes;

        if (layer.id && checkIdForUnique(layer.id)) {
            node.id = layer.id;
            this.currentState().idList.push('' + node.id);
        } else {
            node.id = generateId();
        }

        node.name = layer.name;
        node.layerType = layer.layerType;
        node.category = layer.category;
        node.params = layer.params;
        nodes.push(node);
        this.updateShapes();
        return node;
    };

    this.getNodeById = function(id) {
        return getItemById(this.currentState().nodes, id);
    };

    this.getNodes = function() {
        return this.currentState().nodes;
    };

    this.removeNode = function(id) {
        let nodes = this.currentState().nodes;
        let links = this.currentState().links;
        nodes.forEach(function(node, index){
            if (node.id === id) {
                nodes.splice(index, 1);
                let ind = 0;
                while (ind < links.length)	{
                    let link = links[ind];
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
    };

    this.addLink = function(from, to) {
        if (this.getLinkById(from.id + '_' + to.id))
            return;

        let links = this.currentState().links;
        let link = new Link();
        link.id = from.id + '_' + to.id;

        link.nodes = [from, to];
        links.push(link);
        this.updateShapes();
        return link;
    };

    this.updateLinks = function () {
        let links = this.currentState().links;
        for (let a = 0; a < links.length; a ++) {
            if (links[a].nodes && links[a].nodes.length === 2) {
                links[a].nodes[0] = this.getNodeById(links[a].nodes[0].id);
                links[a].nodes[1] = this.getNodeById(links[a].nodes[1].id);
            }
        }
    };

    this.getLinkById = function(id) {
        return getItemById(this.currentState().links, id);
    };

    this.getLinks = function() {
        return this.currentState().links;
    };

    this.removeLink = function(id) {
        let links = this.currentState().links;
        links.forEach(function(link, index){
            if (link.id === id) {
                links.splice(index, 1);
            }
        });
        this.updateShapes();
    };

    this.getItemById = function(id, type) {
        if (!type) {
            let item = this.getNodeById(id);
            if (!item)
                item = this.getLinkById(id);

            return item;
        } else if (type == 'node')
            return this.getNodeById(id);
        else if (type == 'link')
            return this.getLinkById(id);
    };

    this.removeItem = function(id, type) {
        if (type) {
            if (type === 'node') {
                this.removeNode(id);
            } else if (type === 'link') {
                this.removeLink(id);
            }
        } else {
            let item = this.getItemById(id);
            this.removeItem(item.id, item.type);
        }
        return true;
    };

    this.removeSelectedItems = function() {
        let delNodes = [];
        let delLinks = [];

        let remItems = {
            nodes: [],
            links: []
        };

        let links = this.currentState().links;
        let nodes = this.currentState().nodes;

        for (let i = 0; i < nodes.length; ++i) {
            if (nodes[i].isActive) {
                delNodes.push(i);
                remItems.nodes.push(nodes[i].id);
            }
        }

        for (let i = 0; i < links.length; ++i) {
            if (links[i].isActive) {
                delLinks.push(i);
                remItems.links.push(links[i]);
            }
            else {
                for (let a = 0; a < delNodes.length; ++a) {
                    let nodeId = nodes[delNodes[a]].id;
                    if (links[i].nodes[0].id === nodeId || links[i].nodes[1].id === nodeId) {
                        delLinks.push(i);
                        remItems.links.push(links[i]);
                        break;
                    }
                }
            }
        }

        let counterDelNodes = 0;
        for (let i = 0; i < delNodes.length; ++i) {
            nodes.splice(delNodes[i] - counterDelNodes, 1);
            counterDelNodes ++;
        }
        let counterDelLinks = 0;
        for (let i = 0; i < delLinks.length; ++i) {
            links.splice(delLinks[i] - counterDelLinks, 1);
            counterDelLinks ++;
        }

        if (counterDelNodes > 0 || counterDelLinks > 0)
            this.updateShapes();
        if (remItems.links.length > 0 || remItems.nodes.length > 0)
            return remItems;
        return null;
    };

    this.selectNodesInsideRect = function(rect) {
        let listSelected = [];
        let nodes = this.currentState().nodes;
        for (let i = 0; i < nodes.length ; i ++) {
            if (isPointInRect({x: nodes[i].pos.x, y: nodes[i].pos.y}, rect)
                && isPointInRect({  x: nodes[i].pos.x + nodes[i].displayData.node.width,
                                    y: nodes[i].pos.y + nodes[i].displayData.node.height }, rect)) {
                nodes[i].isActive = true;
                listSelected.push(nodes[i]);
            }
        }
        return listSelected;
    };


    this.clear = function(permanently) {
        if (permanently) {
            storage.free();
        } else {
            storage.createState();
        }
        this.currentState();
    };

    this.rect = function () {
        let nodes = storage.currentState().nodes;
        if (nodes.length < 1)
            return null;
        let x_min = Number.MAX_VALUE;
        let x_max = Number.MIN_VALUE;
        let y_min = Number.MAX_VALUE;
        let y_max = Number.MIN_VALUE;

        nodes.forEach(function (node) {
            let width = 0;
            let height = 0;
            if (node.displayData) {
                width = node.displayData.node.width;
                height = node.displayData.node.height;
            }

            x_min = Math.min(x_min, node.pos.x);
            y_min = Math.min(y_min, node.pos.y);
            x_max = Math.max(x_max, node.pos.x + width);
            y_max = Math.max(y_max, node.pos.y + height);
        });

        return Rect(x_min, y_min, x_max, y_max);
    };

    function generateId() {

        let idList = storage.currentState().idList;
        let id;
        while (true) {
            id = Math.floor(Math.random() * 0x10000000).toString(16);
            id = 'node_' + id;
            if (checkIdForUnique(id)) {
                idList.push(id);
                return id;
            }
        }
    }

    function checkIdForUnique(id) {
        let idList = storage.currentState().idList;
        return idList.indexOf(id) === -1;
    }

    function getItemById(array, id) {
        for (let i = 0; i < array.length ; i ++) {
            if (array[i].id === id) {
                return array[i];
            }
        }
    }
}

function copyArray(array) {
    let newArray = [];
    for (let item of array) {
        newArray.push(copyObject(item));
    }
    return newArray;
}

function copyObject(obj) {
    if (typeof obj === 'string')
        return '' + obj;
    let copy = new obj.constructor();

    for (let attr in obj) {
        if (obj.hasOwnProperty(attr))
            if (obj[attr] !== null && typeof obj[attr] === 'object' && !(obj[attr] instanceof Element)) {
                copy[attr] = copyObject(obj[attr]);
            } else {
                copy[attr] = obj[attr];
            }
    }
    return copy;
}

if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
}