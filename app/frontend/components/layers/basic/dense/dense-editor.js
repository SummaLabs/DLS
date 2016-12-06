'use strict';

angular
.module('denseEditor', ['ngMaterial'])
.directive('denseEditor', function () {
    return {
        scope: {
            layerId: '@'
        },
        templateUrl: "frontend/components/layers/basic/dense/dense-editor.html",
        controller: function ($scope, networkDataService, denseLayer) {
            this.$onInit = function () {
                setUpLayerParams(networkDataService.getLayerById($scope.layerId).params);
                $scope.activationFunctionList = denseLayer.getActivationFunctions();


                $scope.$watch('params', function (params) {
                    var layer = networkDataService.getLayerById($scope.layerId);
                    updateLayer(layer, params);
                }, true);

                function updateLayer(layer, params) {
                    layer.params.neuronsCount = params.neuronsCount;
                    layer.params.activationFunction = params.activationFunction;
                    layer.params.isTrainable = params.isTrainable;
                }

                function setUpLayerParams(params) {
                    $scope.params.neuronsCount = params.neuronsCount;
                    $scope.params.activationFunction = params.activationFunction;
                    $scope.params.isTrainable = params.isTrainable;
                }
            }
        }
    };
});