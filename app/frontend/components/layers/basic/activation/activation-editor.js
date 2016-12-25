'use strict';

angular
.module('activationEditor', ['ngMaterial'])
.directive('activationEditor', function () {
    return {
        scope: {
            layerData: '='
        },
        templateUrl: "frontend/components/layers/basic/activation/activation-editor.html",
        controller: function ($scope, networkDataService, activationLayer) {
            this.$onInit = function () {
                setUpLayerParams($scope.layerData.params);
                $scope.activationFunctionList = activationLayer.getActivationFunctions();

                $scope.$watch('params', function (params) {
                    updateLayer($scope.layerData, params);
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