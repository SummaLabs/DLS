(function () {
    'use strict';
    angular
        .module('solverEditor', ['ngMaterial'])
        .directive('solverEditor', function () {
            return {
                scope: {
                    layerId: '=',
                    doOnSubmit: '&'
                },
                templateUrl: "frontend/components/layers/solver/solver-editor.html",
                controller: function ($scope, networkDataService) {
                    $scope.loss_funcs = [
                        {value: "CategoricalCrossEntropy", text: "Categorical Cross Entropy"},
                    ];

                    $scope.optimizers = [
                        {value: "SGD", text: "Stochastic gradient descent (SGD)"},
                        {value: "RMSprop", text: "RMSProp optimizer"},
                        {value: "Adagrad", text: "Adagrad optimizer"},
                        {value: "Adadelta", text: "Adadelta optimizer"},
                        {value: "Adam", text: "Adam optimizer"},
                        {value: "Adamax", text: "Adamax optimizer"},
                        {value: "Nadam", text: "Nesterov Adam optimizer"},
                    ];

                    $scope.onSubmit = function () {
                        var layer = networkDataService.getLayerById($scope.layerId);
                        editLayer(layer);
                        $scope.doOnSubmit();
                    };

                    function editLayer(layer) {
                        layer.params.lossFunction = $scope.loss_func;
                        layer.params.epochsCount = $scope.epochs_count;
                        layer.params.snapshotInterval = $scope.snapshot_interval;
                        layer.params.batchSize = $scope.batch_size,
                        layer.params.learningRate = $scope.learning_rate,
                        layer.params.optimizer = $scope.optimizer
                    }
                }
            }
        });
})();