'use strict';

angular
.module('convolution2dEditor', ['ngMaterial'])
.directive('convolution2dEditor', function () {
    return {
        scope: {
            layerId: '@',
            doOnSubmit: '&'
        },
        templateUrl: "frontend/components/layers/basic/convolution2d/convolution2d-editor.html",
        controller: function ($scope, networkDataService, convolution2dLayer) {
            this.$onInit = function () {
                setUpLayerParams($scope, networkDataService);
                $scope.activationFunctionList = convolution2dLayer.getActivationFunctions();

                $scope.onSubmit = function () {
                    var layer = networkDataService.getLayerById($scope.layerId);
                    editLayer(layer);
                    networkDataService.pubNetworkUpdateEvent();
                    $scope.doOnSubmit();
                };

                function editLayer(layer) {
                    layer.params.filtersCount = $scope.filtersCount;
                    layer.params.filterWidth = $scope.filterWidth;
                    layer.params.filterHeight = $scope.filterHeight;
                    layer.params.activationFunction = $scope.activationFunction;
                    layer.params.isTrainable = $scope.isTrainable;
                }

                function setUpLayerParams($scope, networkDataService) {
                    var layerParams = networkDataService.getLayerById($scope.layerId).params;
                    $scope.filtersCount = layerParams.filtersCount;
                    $scope.filterWidth = layerParams.filterWidth;
                    $scope.filterHeight = layerParams.filterHeight;
                    $scope.activationFunction = layerParams.activationFunction;
                    $scope.isTrainable = layerParams.isTrainable;
                }
            }
        }
    };
});