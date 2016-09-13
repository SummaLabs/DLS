
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
        initBackground(self, $scope, appConfig.svgDefinitions.gridStep);
       /* svgWatcher.bind(self)($scope, coreService);
        svgHandler.bind(self)($scope, $rootScope, $window, $element, networkDataService, networkLayerService, appConfig);
   */ };

    $scope.controlItem.addNode = function(layer) {
        console.log(layer);
        var node = schema.addNode(layer.name, layer.category, layer.template, layer.id);
        if (!node)
            return false;
        node.position(layer.pos.x, layer.pos.y);
        return true;
    }

    $scope.controlItem.setNodes = function(layers) {

        schema.clear();

        for (let a = 0; a < layers.length; a ++) {
            if(!$scope.controlItem.addNode(layers[a]))
                return false;
        }


        $timeout(function(){
            for (let a = 0; a < layers.length; a ++) {
                console.log(layers[a].wires);
                if (layers[a].wires && layers[a].wires.length > 0)
                    layers[a].wires.forEach(function(layerId, i, array){
                        schema.addLink(layers[a], schema.getNodeById(layerId));
                    });
            }
        }, 1000);


        console.log(self.links);

        return true;
    }

    $scope.controlItem.getNodes = function() {
        return self.nodes;
    }

    self.addNode = function(node) {
        $scope.controlItem.addNode(node);
        self.emitEvent(events.ADD_NODE, {});
    }

    self.addLink = function(link) {
        self.links.push(link);
        networkDataService.setChangesSaved(false);
        self.emitEvent(events.ADD_LINK, {});
    }

    self.clearScene = function() {
        self.nodes.length = 0;
        self.links.length = 0;
        self.counterNodesInit = 0;
        coreService.param('scale', 1);
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


    function Node() {
        this.id;
        this.name;
        this.type;
        this.selected = false;
        this.template;
        this.pos = {
            x: 0,
            y: 0
        }

        this.position = function(x, y) {
            if (!arguments.length)
                return this.pos;

            this.pos.x = x;
            this.pos.y = y;
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

        this.clear = function() {
            nodes.length = 0;
            links.length = 0;
            idList.length = 0;
        }

        this.addLink = function(from, to) {
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