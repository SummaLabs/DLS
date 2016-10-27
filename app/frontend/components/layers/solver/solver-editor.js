(function () {
    'use strict';
    angular
        .module('solverEditor', ['ngMaterial'])
        .directive('solverEditor', function () {
            return {
                scope: {
                    layerId: '@',
                    doOnSubmit: '&'
                },
                templateUrl: "frontend/components/layers/solver/solver-editor.html",
                controller: function ($scope, networkDataService, solverLayer) {
                    this.$onInit = function () {
                        setUpLayerParams($scope, networkDataService);
                        $scope.lossFunctionList = solverLayer.getLossFunctions();

                        $scope.optimizers = solverLayer.getOptimizers();

                        $scope.onSubmit = function () {
                            var layer = networkDataService.getLayerById($scope.layerId);
                            editLayer(layer);
                            networkDataService.pubNetworkUpdateEvent();
                            $scope.doOnSubmit();
                        };

                        function editLayer(layer) {
                            layer.params.lossFunction = $scope.lossFunction;
                            layer.params.epochsCount = $scope.epochsCount;
                            layer.params.snapshotInterval = $scope.snapshotInterval;
                            layer.params.validationInterval = $scope.validationInterval;
                            layer.params.batchSize = $scope.batchSize;
                            layer.params.learningRate = $scope.learningRate;
                            layer.params.optimizer = $scope.optimizer;
                        }

                        function setUpLayerParams($scope, networkDataService) {
                            var layerParams = networkDataService.getLayerById($scope.layerId).params;
                            $scope.lossFunction = layerParams.lossFunction;
                            $scope.epochsCount = layerParams.epochsCount;
                            $scope.snapshotInterval = layerParams.snapshotInterval;
                            $scope.validationInterval = layerParams.validationInterval;
                            $scope.batchSize = layerParams.batchSize;
                            $scope.learningRate = layerParams.learningRate;
                            $scope.optimizer = layerParams.optimizer;
                        }
                    }
                }
            }
        });
})();