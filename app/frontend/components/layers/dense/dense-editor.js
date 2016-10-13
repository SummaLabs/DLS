(function () {
    'use strict';
    angular
        .module('denseEditor', ['ngMaterial'])
        .directive('denseEditor', function () {
            return {
                scope: {
                    layerId: '@',
                    doOnSubmit: '&'
                },
                templateUrl: "frontend/components/layers/dense/dense-editor.html",
                controller: function ($scope, networkDataService, denseLayer) {
                    this.$onInit = function () {
                        setUpLayerParams($scope, networkDataService);
                        $scope.activationFunctionList = denseLayer.getActivationFunctions();

                        $scope.onSubmit = function () {
                            var layer = networkDataService.getLayerById($scope.layerId);
                            editLayer(layer);
                            networkDataService.pubNetworkUpdateEvent();
                            $scope.doOnSubmit();
                        };

                        function editLayer(layer) {
                            layer.params.neuronsCount = $scope.neuronsCount;
                            layer.params.activationFunction = $scope.activationFunction;
                            layer.params.isTrainable = $scope.isTrainable;
                        }
                        
                        function setUpLayerParams($scope, networkDataService) {
                            var layerParams = networkDataService.getLayerById($scope.layerId).params;
                            $scope.neuronsCount = layerParams.neuronsCount;
                            $scope.activationFunction = layerParams.activationFunction;
                            $scope.isTrainable = layerParams.isTrainable;
                        }
                    }
                }
            }
        });
})();