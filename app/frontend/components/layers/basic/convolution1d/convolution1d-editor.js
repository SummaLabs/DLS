'use strict';

angular
.module('convolution1dEditor', ['ngMaterial'])
.directive('convolution1dEditor', function () {
    return {
        scope: {
            layerId: '@'
        },
        templateUrl: "frontend/components/layers/basic/convolution1d/convolution1d-editor.html",
        controller: function ($scope, networkDataService, convolution1dLayer) {
            this.$onInit = function () {
                setUpLayerParams(networkDataService.getLayerById($scope.layerId).params);
                $scope.activationFunctionList = convolution1dLayer.getActivationFunctions();

                $scope.$watch('params', function (params) {
                    var layer = networkDataService.getLayerById($scope.layerId);
                    updateLayer(layer, params);
                }, true);

                function updateLayer(layer, params) {
                    layer.params.filtersCount = params.filtersCount;
                    layer.params.filterWidth = params.filterWidth;
                    layer.params.activationFunction = params.activationFunction;
                    layer.params.isTrainable = params.isTrainable;
                }

                function setUpLayerParams(params) {
                    $scope.params = {};
                    $scope.params.filtersCount = params.filtersCount;
                    $scope.params.filterWidth = params.filterWidth;
                    $scope.params.activationFunction = params.activationFunction;
                    $scope.params.isTrainable = params.isTrainable;
                }
            }
        }
    };
});