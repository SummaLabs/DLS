'use strict';

angular
.module('flattenEditor', ['ngMaterial'])
.directive('flattenEditor', function () {
    return {
        scope: {
            layerId: '@',
            doOnSubmit: '&'
        },
        templateUrl: "frontend/components/layers/basic/flatten/flatten-editor.html",
        controller: function ($scope, networkDataService, flattenLayer) {
            this.$onInit = function () {
                setUpLayerParams($scope, networkDataService);
                // $scope.activationFunctionList = flattenLayer.getActivationFunctions();

                $scope.onSubmit = function () {
                    var layer = networkDataService.getLayerById($scope.layerId);
                    editLayer(layer);
                    networkDataService.pubNetworkUpdateEvent();
                    $scope.doOnSubmit();
                };

                function editLayer(layer) {
                    // layer.params.filtersCount = $scope.filtersCount;
                    // layer.params.filterWidth = $scope.filterWidth;
                    // layer.params.filterHeight = $scope.filterHeight;
                    // layer.params.activationFunction = $scope.activationFunction;
                    // layer.params.isTrainable = $scope.isTrainable;
                }

                function setUpLayerParams($scope, networkDataService) {
                    var layerParams = networkDataService.getLayerById($scope.layerId).params;
                    // $scope.filtersCount = layerParams.filtersCount;
                    // $scope.filterWidth = layerParams.filterWidth;
                    // $scope.filterHeight = layerParams.filterHeight;
                    // $scope.activationFunction = layerParams.activationFunction;
                    // $scope.isTrainable = layerParams.isTrainable;
                }
            }
        }
    };
});