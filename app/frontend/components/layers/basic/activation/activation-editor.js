'use strict';

angular
.module('activationEditor', ['ngMaterial'])
.directive('activationEditor', function () {
    return {
        scope: {
            layerId: '@',
            doOnSubmit: '&'
        },
        templateUrl: "frontend/components/layers/basic/activation/activation-editor.html",
        controller: function ($scope, networkDataService, activationLayer) {
            this.$onInit = function () {
                setUpLayerParams($scope, networkDataService);
                $scope.activationFunctionList = activationLayer.getActivationFunctions();

                $scope.onSubmit = function () {
                    var layer = networkDataService.getLayerById($scope.layerId);
                    editLayer(layer);
                    networkDataService.pubNetworkUpdateEvent();
                    $scope.doOnSubmit();
                };

                function editLayer(layer) {
                    layer.params.activationFunction = $scope.activationFunction;
                    layer.params.isTrainable = $scope.isTrainable;
                }

                function setUpLayerParams($scope, networkDataService) {
                    var layerParams = networkDataService.getLayerById($scope.layerId).params;
                    $scope.activationFunction = layerParams.activationFunction;
                    $scope.isTrainable = layerParams.isTrainable;
                }
            }
        }
    };
});