(function () {
    'use strict';

    angular
        .module('convolEditor', ['ngMaterial'])
        .directive('convolEditor', function () {
            return {
                scope: {
                    layerId: '=',
                    doOnSubmit: '&'
                },
                templateUrl: "frontend/components/layers/convol/convol-editor.html",
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

                        $scope.subsamplingTypeList = [
                            {value: "max_pooling", text: "Max Pooling"},
                            {value: "average_pooling", text: "Average Pooling"}
                        ];

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
                            layer.params.subsamplingType = $scope.subsamplingType;
                            layer.params.subsamplingSize = $scope.subsamplingSize;
                            layer.params.isTrainable = $scope.isTrainable;
                        }

                        function setUpLayerParams($scope, networkDataService) {
                            var layerParams = networkDataService.getLayerById($scope.layerId).params;
                            $scope.filtersCount = layerParams.filtersCount;
                            $scope.filterWidth = layerParams.filterWidth;
                            $scope.filterHeight = layerParams.filterHeight;
                            $scope.activationFunction = layerParams.activationFunction;
                            $scope.subsamplingType = layerParams.subsamplingType;
                            $scope.subsamplingSize = layerParams.subsamplingSize;
                            $scope.isTrainable = layerParams.isTrainable;
                        }
                    }
                }
            };
        });

})();