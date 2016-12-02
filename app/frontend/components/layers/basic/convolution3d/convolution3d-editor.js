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
                setUpLayerParams($scope, networkDataService);
                $scope.activationFunctionList = convolution3dLayer.getActivationFunctions();

                $scope.onSubmit = function () {
                    var layer = networkDataService.getLayerById($scope.layerId);
                    editLayer(layer);
                    networkDataService.pubNetworkUpdateEvent();
                    $scope.doOnSubmit();
                };

                function editLayer(layer) {
                    layer.params.filtersCount = $scope.filtersCount;
                    layer.params.filterWidth  = $scope.filterWidth;
                    layer.params.filterHeight = $scope.filterHeight;
                    layer.params.filterDepth  = $scope.filterDepth;
                    layer.params.activationFunction = $scope.activationFunction;
                    layer.params.isTrainable = $scope.isTrainable;
                }

                function setUpLayerParams($scope, networkDataService) {
                    var layerParams = networkDataService.getLayerById($scope.layerId).params;
                    $scope.filtersCount = layerParams.filtersCount;
                    $scope.filterWidth  = layerParams.filterWidth;
                    $scope.filterHeight = layerParams.filterHeight;
                    $scope.filterDepth  = layerParams.filterDepth;
                    $scope.activationFunction = layerParams.activationFunction;
                    $scope.isTrainable = layerParams.isTrainable;
                }
            }
        }
    };
});