'use strict';

angular
.module('activationEditor', ['ngMaterial'])
.directive('activationEditor', function () {
    return {
        scope: {
            layerId: '@'
        },
        templateUrl: "frontend/components/layers/basic/activation/activation-editor.html",
        controller: function ($scope, networkDataService, activationLayer) {
            this.$onInit = function () {
                setUpLayerParams(networkDataService.getLayerById($scope.layerId).params);
                $scope.activationFunctionList = activationLayer.getActivationFunctions();

                $scope.$watch('params', function (params) {
                    var layer = networkDataService.getLayerById($scope.layerId);
                    updateLayer(layer, params);
                }, true);

                function updateLayer(layer, params) {
                    layer.params.activationFunction = params.activationFunction;
                }

                function setUpLayerParams(params) {
                    $scope.params = {};
                    $scope.params.activationFunction = params.activationFunction;
                }
            }
        }
    };
});