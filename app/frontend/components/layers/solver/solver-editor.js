(function () {
    'use strict';
    angular
        .module('solverEditor', ['ngMaterial'])
        .directive('solverEditor', function () {
            return {
                scope: {
                    layerId: '@'
                },
                templateUrl: "frontend/components/layers/solver/solver-editor.html",
                controller: function ($scope, networkDataService, solverLayer) {
                    this.$onInit = function () {
                        setUpLayerParams(networkDataService.getLayerById($scope.layerId).params);
                        $scope.lossFunctionList = solverLayer.getLossFunctions();
                        $scope.optimizers = solverLayer.getOptimizers();

                        $scope.$watch('params', function (params) {
                            var layer = networkDataService.getLayerById($scope.layerId);
                            updateLayer(layer, params);
                        }, true);

                        function updateLayer(layer, params) {
                            layer.params.lossFunction = params.lossFunction;
                            layer.params.epochsCount = params.epochsCount;
                            layer.params.snapshotInterval = params.snapshotInterval;
                            layer.params.validationInterval = params.validationInterval;
                            layer.params.batchSize = params.batchSize;
                            layer.params.learningRate = params.learningRate;
                            layer.params.optimizer = params.optimizer;
                        }

                        function setUpLayerParams(params) {
                            $scope.params = {};
                            $scope.params.lossFunction = params.lossFunction;
                            $scope.params.epochsCount = params.epochsCount;
                            $scope.params.snapshotInterval = params.snapshotInterval;
                            $scope.params.validationInterval = params.validationInterval;
                            $scope.params.batchSize = params.batchSize;
                            $scope.params.learningRate = params.learningRate;
                            $scope.params.optimizer = params.optimizer;
                        }
                    }
                }
            }
        });
})();