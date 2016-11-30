(function () {
    'use strict';
    angular
        .module('trainingParams', ['ngMaterial', 'taskManagerService', 'deviceSelector'])
        .directive('trainingParams', function (taskManagerService) {
            return {
                scope: {
                    network: '@',
                    doOnSubmit: '&'
                },
                templateUrl: "/frontend/components/main/training-params/training-params.html",
                controller: function ($location, $scope) {
                    this.$onInit = function () {

                        var defaultParams = {
                            "modelName": "New model",
                            "lossFunction": "categorical_crossentropy",
                            "epochsCount": 2048,
                            "snapshotInterval": 100,
                            "validationInterval": 100,
                            "batchSize": 1024,
                            "learningRate": 0.01,
                            "optimizer": "SGD",
                            "deviceType": 'gpu'
                        };

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

                        setUpDefaultParams($scope);

                        $scope.onSubmit = function () {
                            var params = getTrainingParams($scope);
                            var network = JSON.parse($scope.network);
                            network['trainingParams'] = params;
                            startTraining(network);
                            $scope.doOnSubmit();
                        };
                        
                        $scope.closeDialog = function () {
                            $scope.doOnSubmit();
                        };

                        function startTraining(network) {
                            taskManagerService.startTask('model-train-image2d-cls', network).then(
                                function successCallback(response) {
                                    $location.url('/task');
                                },
                                function errorCallback(response) {
                                    console.log(response.data);
                                }
                            );
                        }

                        function getTrainingParams($scope) {
                            var params = defaultParams;
                            params.modelName = $scope.modelName;
                            params.lossFunction = $scope.lossFunction;
                            params.epochsCount = $scope.epochsCount;
                            params.snapshotInterval = $scope.snapshotInterval;
                            params.validationInterval = $scope.validationInterval;
                            params.batchSize = $scope.batchSize;
                            params.learningRate = $scope.learningRate;
                            params.optimizer = $scope.optimizer;
                            params.deviceType = $scope.device.type;
                            return params;
                        }

                        function setUpDefaultParams($scope) {
                            $scope.modelName = defaultParams.modelName;
                            $scope.lossFunction = defaultParams.lossFunction;
                            $scope.epochsCount = defaultParams.epochsCount;
                            $scope.snapshotInterval = defaultParams.snapshotInterval;
                            $scope.validationInterval = defaultParams.validationInterval;
                            $scope.batchSize = defaultParams.batchSize;
                            $scope.learningRate = defaultParams.learningRate;
                            $scope.optimizer = defaultParams.optimizer;
                        }
                    }
                }
            }
        });
})();