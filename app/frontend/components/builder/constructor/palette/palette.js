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
            controller: ElementCtrl,
            controllerAs: 'palette',
            scope: {
               paletteData: '=',
            },
            link: function(scope, element, $rootScope){
                element[0].draggable = true;
            }
        }
});

function PaletteService() {

}

function ElementCtrl($scope, $element, $rootScope) {

    var elemOffset;

    $element.on('dragstart', function (event) {

        var elementRect = this.getBoundingClientRect();
        elemOffset = {
            x: event.clientX - elementRect.left,
            y: event.clientY - elementRect.top
        }

        event.target.style.opacity = '0.6';
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/html', this.innerHTML);
        $rootScope.$emit('palette_drag_start', { });
    });

    $element.on('dragend', function (event) {
        event.target.style.opacity = '1';
        $rootScope.$emit('palette_drag_end', {
            data: $scope.paletteData,
            offset: elemOffset
        });
    });

}

function PaletteController($scope, networkLayerService) {

	self = this;
	self.treeItems = [];

	networkLayerService.getCategories().then(
		function succes(categories) {
            console.log(categories);
            networkLayerService.getLayers().then(
				function succes(layers) {
            		console.log(layers);
            		self.treeItems = createTree(categories, layers);
					console.dir(self.treeItems);

				}, function error(data) {
					console.log(data);
				}
			);

        }, function error(data) {
            console.log(data);
        }
    );

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
	console.log(categories, layers);
	let tree = []
	var idCounter = 0;
	categories.forEach(function(category, i, array) {
		let items = [];
		layers.forEach(function(item, i, array) {
			if (item.category === category.name) {
				items.push({
					type: 'item',
					name: item.name,
					id: ++idCounter,
					template: item.template,
					params: item.params
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





