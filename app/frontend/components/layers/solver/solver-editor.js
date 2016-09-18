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
                controller: function ($scope, networkDataService) {
                    this.$onInit = function () {
                        setUpLayerParams($scope, networkDataService);
                        $scope.lossFunctionList = [
                            {value: "mean_squared_error", text: "Mean Squared Error"},
                            {value: "mean_absolute_error", text: "Mean Absolute Error"},
                            {value: "mean_absolute_percentage_error", text: "Mean Absolute Percentage Error"},
                            {value: "mean_squared_logarithmic_error", text: "Mean Squared Logarithmic Error"},
                            {value: "squared_hinge", text: "Squared Hinge"},
                            {value: "hinge", text: "Hinge"},
                            {value: "binary_crossentropy", text: "Binary Crossentropy"},
                            {value: "categorical_crossentropy", text: "Categorical Cross Entropy"},
                            {value: "kullback_leibler_divergence", text: "Kullback Leibler Divergence"},
                            {value: "poisson", text: "Poisson"},
                            {value: "cosine_proximity", text: "Cosine Proximity"}

                        ];

                        $scope.optimizers = [
                            {value: "SGD", text: "Stochastic gradient descent (SGD)"},
                            {value: "RMSprop", text: "RMSProp optimizer"},
                            {value: "Adagrad", text: "Adagrad optimizer"},
                            {value: "Adadelta", text: "Adadelta optimizer"},
                            {value: "Adam", text: "Adam optimizer"},
                            {value: "Adamax", text: "Adamax optimizer"},
                            {value: "Nadam", text: "Nesterov Adam optimizer"}
                        ];

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