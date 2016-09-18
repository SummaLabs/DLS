function Position(x, y, step) {
    if (!step)
        step = 1;
    this.x = x - x % step;
    this.y = y - y % step;
}

Position.prototype.getScaledPos = function(scale) {
    return new Position(this.x * scale, this.y * scale);
}

Position.prototype.getAddedPos = function(offset, offsetY) {
    if (arguments.length === 1)
        return new Position(this.x + offset.x, this.y + offset.y);
    else if (arguments.length === 2)
        return new Position(this.x + offset, this.y + offsetY);
    else return new Position(this.x, this.y);
}

function Rect(x1, y1, x2, y2) {
    function _rect(){
        this.x;
        this.y;
        this.width;
        this.height;

        this.scale = function(scale) {
            var scaled_rect = Rect(0,0,0,0);
            scaled_rect.x = this.x * scale;
            scaled_rect.y = this.y * scale;
            scaled_rect.width = this.width * scale;
            scaled_rect.height = this.height * scale;
            return scaled_rect;
        }
    };

    var rc = new _rect();
    rc.x = Math.min(x1, x2);
    rc.y = Math.min(y1, y2);
    rc.width = Math.abs(x1 - x2);
    rc.height = Math.abs(y1 - y2);



    return rc;
}

function Item(type) {
    this.id;
    this.type = type;
    this.isActive = false;

    var self = this;
}

function Node() {
    Item.call(this, 'node');

    this.name;
    this.template;
    this.category;
    this.pos = new Position(0, 0);
}
Node.prototype = Object.create(Item.prototype);
Node.prototype.constructor = Node;

Node.prototype.position = function(x, y, step) {
    if (!arguments.length)
        return this.pos;

    this.pos = new Position(x, y, step);
}

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
}

function Link() {
    Item.call(this, 'link');
    this.nodes = [];
}
Link.prototype = Object.create(Item.prototype);
Link.prototype.constructor = Link;

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
			layer.category = node.category;
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

    this.addNode = function(name, category, template, id) {
        var node = new Node();
        if (id && checkIdForUnique(id)) {
            node.id = id;
        } else {
            node.id = 'node_' + generateId();
        }

        node.name = name;
        node.category = category;
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

    this.removeLink = function(id) {
        links.forEach(function(link, index, array){
            if (link.id === id) {
                links.splice(index, 1);
            }
        });
    }

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
    }

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
    }

    this.removeSelectedItems = function() {
        var delNodes = [];
        var delLinks = [];

        for (var i = 0; i < nodes.length; ++i) {
            if (nodes[i].isActive) {
                delNodes.push(i);
            }
        }

        for (var i = 0; i < links.length; ++i) {
            if (links[i].isActive) {
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
                nodes[i].isActive = true;
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