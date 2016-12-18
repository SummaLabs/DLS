angular
    .module('convFilters', [])
    .directive('convFilters', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var width = 300;
                var padding = 2;
                var filterWidth = 16;
                var filterHeight = 16;
                var filtersInRow = Math.floor(width / (filterWidth + padding));
                var filtersNumber = 24;
                var rowsNumber = Math.ceil(filtersNumber / filtersInRow);
                var height = rowsNumber * (filterHeight + padding);

                var canvas = new fabric.Canvas(element[0], {
                    isDrawingMode: false,
                    width: width,
                    height: height
                });

                drawFiler(canvas, fler, 10, 20, new fabric.Color('rgb(100,0,100)'));

                function drawFiler(canvas, filer, top, left, color) {
                    for (var i = 0; i < filer.length; i++) {
                        for (var j = 0; j < filer[i].length; j++) {
                            canvas.add(new fabric.Rect({
                                top: top + j,
                                left: left + i,
                                width: 1,
                                height: 1,
                                fill: color,
                                selectable: false
                            }));
                        }
                    }
                }
            }
        };
    });