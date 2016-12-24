'use strict';

angular
.module('convolution2dEditor', ['ngMaterial'])
.directive('convolution2dEditor', function () {
    return {
        scope: {
            layerData: '='
        },
        templateUrl: "frontend/components/layers/basic/convolution2d/convolution2d-editor.html",
        controller: function ($scope, networkDataService, convolution2dLayer) {
            this.$onInit = function () {
                setUpLayerParams($scope.layerData.params);
                $scope.activationFunctionList = convolution2dLayer.getActivationFunctions();


                $scope.$watch('params', function (params) {
                    updateLayer($scope.layerData, params);
                }, true);

                function updateLayer(layer, params) {
                    layer.params.filtersCount = params.filtersCount;
                    layer.params.filterWidth = params.filterWidth;
                    layer.params.filterHeight = params.filterHeight;
                    layer.params.activationFunction = params.activationFunction;
                    layer.params.isTrainable = params.isTrainable;
                }

                function setUpLayerParams(params) {
                    $scope.params = {};
                    $scope.params.filtersCount = params.filtersCount;
                    $scope.params.filterWidth = params.filterWidth;
                    $scope.params.filterHeight = params.filterHeight;
                    $scope.params.activationFunction = params.activationFunction;
                    $scope.params.isTrainable = params.isTrainable;
                }
            }
        }
    };
});