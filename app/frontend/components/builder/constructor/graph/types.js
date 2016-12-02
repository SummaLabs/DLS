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
    var x;
    var y;
    var width;
    var height;


    function _rect(){

        this.scale = function(scale) {
            var scaled_rect = Rect(0,0,0,0);
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

    var rc = new _rect();
    rc.x(Math.min(x1, x2));
    rc.y(Math.min(y1, y2));
    rc.width(Math.abs(x1 - x2));
    rc.height(Math.abs(y1 - y2));

    return rc;
}

function Item(type) {
    this.id = null;
    this.type = type;
    this.isActive = false;
}

function Node() {
    Item.call(this, 'node');

    this.name = null;
    this.layerType = null;
    this.template = null;
    this.category = null;
    this.pos = new Position(0, 0);
}

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
    var newPos = this.pos.getAddedPos(offsetX, offsetY);
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

function Schema() {
    var nodes = [];
    var links = [];
    var idList = [];

    this.getSchema = function() {
    	var schema = [];

    	nodes.forEach(function(node){
    		var layer = Object.create(null);
    		layer.id = node.id;
			layer.name = node.name;
            layer.layerType = node.layerType;
			layer.category = node.category;
			layer.template = node.template;
			layer.pos = node.pos;
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

    this.addNode = function(name, layerType,  category, template, id) {
        var node = new Node();
        if (id && checkIdForUnique(id)) {
            node.id = id;
        } else {
            node.id = 'node_' + generateId();
        }

        node.name = name;
        node.layerType = layerType;
        node.category = category;
        node.template = template;
        nodes.push(node);
        return node;
    };

    this.getNodeById = function(id) {
        return getItemById(nodes, id);
    };

    this.getNodes = function() {
        return nodes;
    };

    this.removeNode = function(id) {
        nodes.forEach(function(node, index){
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
    };

    this.addLink = function(from, to) {
        if (this.getLinkById(from.id + '_' + to.id))
            return;

        var link = new Link();
        link.id = from.id + '_' + to.id;

        link.nodes = [from, to];
        links.push(link);
        return link;
    };

    this.getLinkById = function(id) {
        return getItemById(links, id);
    };

    this.getLinks = function() {
        return links;
    };

    this.removeLink = function(id) {
        links.forEach(function(link, index){
            if (link.id === id) {
                links.splice(index, 1);
            }
        });
    };

    this.getItemById = function(id, type) {
        if (!type) {
            var item = this.getNodeById(id);
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
            var item = this.getItemById(id);
            this.removeItem(item.id, item.type);
        }
        return true;
    };

    this.removeSelectedItems = function() {
        var delNodes = [];
        var delLinks = [];

        var remItems = {
            nodes: [],
            links: []
        };

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
                for (var a = 0; a < delNodes.length; ++a) {
                    var nodeId = nodes[delNodes[a]].id;
                    if (links[i].nodes[0].id === nodeId || links[i].nodes[1].id === nodeId) {
                        delLinks.push(i);
                        remItems.links.push(links[i]);
                        break;
                    }
                }
            }
        }

        var counterDel = 0;
        for (let i = 0; i < delNodes.length; ++i) {
            nodes.splice(delNodes[i] - counterDel, 1);
            counterDel ++;
        }
        counterDel = 0;
        for (let i = 0; i < delLinks.length; ++i) {
            links.splice(delLinks[i] - counterDel, 1);
            counterDel ++;
        }
        if (remItems.links.length > 0 || remItems.nodes.length > 0)
            return remItems;
        return null;
    };

    this.selectNodesInsideRect = function(rect) {
        var listSelected = [];
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


    this.clear = function() {
        nodes.length = 0;
        links.length = 0;
        idList.length = 0;
    };

    this.rect = function () {
        if (nodes.length < 1)
            return null;
        var x_min = Number.MAX_VALUE;
        var x_max = Number.MIN_VALUE;
        var y_min = Number.MAX_VALUE;
        var y_max = Number.MIN_VALUE;

        nodes.forEach(function (node) {
            var width = 0;
            var height = 0;
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
        return idList.indexOf(id) === -1;
    }

    function getItemById(array, id) {
        for (var i = 0; i < array.length ; i ++) {
            if (array[i].id === id) {
                return array[i];
            }
        }
    }
}