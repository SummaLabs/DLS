'use strict';

angular
.module('convolution1dEditor', ['ngMaterial'])
.directive('convolution1dEditor', function () {
    return {
        scope: {
            layerId: '@',
            doOnSubmit: '&'
        },
        templateUrl: "frontend/components/layers/basic/convolution1d/convolution1d-editor.html",
        controller: function ($scope, networkDataService, convolution1dLayer) {
            this.$onInit = function () {
                setUpLayerParams($scope, networkDataService);
                $scope.activationFunctionList = convolution1dLayer.getActivationFunctions();

                $scope.onSubmit = function () {
                    var layer = networkDataService.getLayerById($scope.layerId);
                    editLayer(layer);
                    networkDataService.pubNetworkUpdateEvent();
                    $scope.doOnSubmit();
                };

                function editLayer(layer) {
                    layer.params.filtersCount = $scope.filtersCount;
                    layer.params.filterWidth = $scope.filterWidth;
                    layer.params.activationFunction = $scope.activationFunction;
                    layer.params.isTrainable = $scope.isTrainable;
                }

                function setUpLayerParams($scope, networkDataService) {
                    var layerParams = networkDataService.getLayerById($scope.layerId).params;
                    $scope.filtersCount = layerParams.filtersCount;
                    $scope.filterWidth = layerParams.filterWidth;
                    $scope.activationFunction = layerParams.activationFunction;
                    $scope.isTrainable = layerParams.isTrainable;
                }
            }
        }
    };
});