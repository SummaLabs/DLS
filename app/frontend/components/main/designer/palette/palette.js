'use strict';

angular.module('palette', [

]);

var paletteDefinition = {
	templateUrl: '/frontend/components/main/designer/palette/palette.html',
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

function DraggableCtrl($scope, $element, $rootScope) {

    var elemOffset;
	var dragIcon = document.createElement('img');
	dragIcon.src = '/frontend/components/layers/basic/datainput/datainput-node.png';


    $element.on('dragstart', function (event) {
        
        var elementRect = this.getBoundingClientRect();
        elemOffset = {
            x: event.clientX - elementRect.left,
            y: event.clientY - elementRect.top
        }

        event.target.style.opacity = '0.8';
        event.dataTransfer.effectAllowed = 'move';
        if(dragIcon.src = event.target.attributes['data-icon']){
            dragIcon.src = event.target.attributes['data-icon'].value;
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

function PaletteController(layerService, $scope) {

	var self = this;
	self.treeItems = [];

	var categories = layerService.getCategories();
	var layers = layerService.getLayers();
	self.treeItems = createTree(categories, layers);

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
    
    this.trainModel = function ($event) {
        console.log("Train invoked");
        $scope.$parent.$ctrl.trainModel($event)
    }
    
    this.saveNetworkDialog = function ($event) {
        $scope.$parent.$ctrl.saveOrCreateNetworkDialog($event, true)
    }
	
	this.createNewNetwork = function ($event) {
        $scope.$parent.$ctrl.createNewNetwork($event)
    }
}

function createTree(categories, layers) {
	let tree = []
	var idCounter = 0;
	categories.forEach(function(category, i, array) {
		let items = [];
		layers.forEach(function(item, i, array) {
			if (item.category === category) {
				items.push({
					type: 'item',
					name: item.name,
					layerType: item.layerType,
					id: ++idCounter,
					params: item.params,
					category: item.category
				});
			}
		});
		tree.push({
			type: 'category',
			name: category,
			children: [],
			items: items
		});
	});
	return tree;
}





