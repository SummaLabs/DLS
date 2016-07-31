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

    $element.on('dragstart', function (event) {
        event.target.style.opacity = '0.6';
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/html', this.innerHTML);
        $rootScope.$emit('palette_drag_start', { });
    });

    $element.on('dragend', function (event) {
        event.target.style.opacity = '1';
        $rootScope.$emit('palette_drag_end', {
            data: $scope.paletteData,
            pos: {x: event.clientX, y:event.clientY },
        });
    });

}

function PaletteController($scope, networkDataService) {
	$scope.categories = networkDataService.getCategories();
	$scope.types = networkDataService.getLayers();
}



