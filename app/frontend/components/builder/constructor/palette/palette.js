'use strict';

angular.module('palette', [

]);

var paletteDefinition = {
	templateUrl: 'frontend/components/builder/constructor/palette/palette.html',
	controller: PaletteController,
	controllerAs: 'palette',
	bindings: {
	}
}

angular.module('palette')
	.service('paletteService', PaletteService)
	.component('palette', paletteDefinition)
    .directive('draggable', function() {
        return {
            restrict: 'A',
            controller: DraggableCtrl,
            scope: {
               draggable: '=',
            },
            link: function(scope, element, attr){
                element[0].draggable = true;
            }
        }
});

function PaletteService() {

}

function DraggableCtrl($scope, $element, $rootScope, $compile, $templateCache, $http) {

    var elemOffset;
	var dragIcon = document.createElement('img');
	dragIcon.src = 'frontend/components/layers/data/node-test-2.png';


    $element.on('dragstart', function (event) {
        
        var elementRect = this.getBoundingClientRect();
        elemOffset = {
            x: event.clientX - elementRect.left,
            y: event.clientY - elementRect.top
        }

        event.target.style.opacity = '0.8';
        event.dataTransfer.effectAllowed = 'move';
        if(dragIcon.src = event.srcElement.attributes['data-icon']){
            dragIcon.src = event.srcElement.attributes['data-icon'].value;
        }
		event.dataTransfer.setDragImage(dragIcon, elemOffset.x, elemOffset.y);
		event.dataTransfer.setData('text/html', this.innerHTML);
        $rootScope.$emit('palette_drag_start', { });
    });

    $element.on('dragend', function (event) {
        event.target.style.opacity = '1';
        $rootScope.$emit('palette_drag_end', {
            node: $scope.draggable,
            offset: elemOffset
        });
    });

}

function PaletteController($scope, networkLayerService) {

	var self = this;
	self.treeItems = [];

	networkLayerService.loadCategoryLayerTree();

	networkLayerService.subLayersUpdateEvent(function() {
		var categories = networkLayerService.getCategories();
		var layers = networkLayerService.getLayers();
		self.treeItems = createTree(categories, layers);
	});

	this.categoryClick = function(category_name) {
	    var state = categoryState[category_name];
	    categoryState[category_name] = state ? false : true;
	}

	this.isHide = function(category_name) {
	    return categoryState[category_name] ? false : true;
	}

	this.toggleOpen = function (section) {
	console.log(section);
		menu.toggleSelectSection(section);
	}
}

function createTree(categories, layers) {
	let tree = []
	var idCounter = 0;
	categories.forEach(function(category, i, array) {
		let items = [];
		layers.forEach(function(item, i, array) {
			if (item.category === category.name) {
				items.push({
					type: 'item',
					name: item.name,
					layerType: item.layerType,
					id: ++idCounter,
					template: item.template,
					params: item.params,
                    icon: item.icon
				});
			}
		});
		tree.push({
			type: 'category',
			name: category.name,
			children: [],
			items: items
		});
	});
	return tree;
}





