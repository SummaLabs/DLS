(function () {
    'use strict';
    angular
        .module('denseEditor', ['ngMaterial'])
        .directive('denseEditor', function () {
            return {
                scope: {
                    layerId: '=',
                    doOnSubmit: '&'
                },
                templateUrl: "frontend/components/layers/dense/dense-editor.html",
                controller: function ($scope, networkDataService) {
                    this.$onInit = function () {
                        setUpLayerParams($scope, networkDataService);
                        $scope.activationFunctionList = [
                            {value: "softplus", text: "SoftPlus"},
                            {value: "softsign", text: "SoftSign"},
                            {value: "relu", text: "ReLU"},
                            {value: "tanh", text: "Tanh"},
                            {value: "sigmoid", text: "Sigmoid"},
                            {value: "hard_sigmoid", text: "Hard Sigmoid"},
                            {value: "linear", text: "Linear"}
                        ];

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