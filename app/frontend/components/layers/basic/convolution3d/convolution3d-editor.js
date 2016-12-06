'use strict';

angular
.module('convolution3dEditor', ['ngMaterial'])
.directive('convolution3dEditor', function () {
    return {
        scope: {
            layerId: '@',
            doOnSubmit: '&'
        },
        templateUrl: "frontend/components/layers/basic/convolution3d/convolution3d-editor.html",
        controller: function ($scope, networkDataService, convolution3dLayer) {
            this.$onInit = function () {
                setUpLayerParams(networkDataService.getLayerById($scope.layerId).params);
                $scope.activationFunctionList = convolution3dLayer.getActivationFunctions();

                $scope.$watch('params', function (params) {
                    var layer = networkDataService.getLayerById($scope.layerId);
                    updateLayer(layer, params);
                }, true);

                function updateLayer(layer, params) {
                    layer.params.filtersCount = params.filtersCount;
                    layer.params.filterWidth  = params.filterWidth;
                    layer.params.filterHeight = params.filterHeight;
                    layer.params.filterDepth  = params.filterDepth;
                    layer.params.activationFunction = params.activationFunction;
                    layer.params.isTrainable = params.isTrainable;
                }

                function setUpLayerParams(params) {
                    $scope.params = {};
                    $scope.params.filtersCount = params.filtersCount;
                    $scope.params.filterWidth  = params.filterWidth;
                    $scope.params.filterHeight = params.filterHeight;
                    $scope.params.filterDepth  = params.filterDepth;
                    $scope.params.activationFunction = params.activationFunction;
                    $scope.params.isTrainable = params.isTrainable;
                }
            }
        }
    };
});