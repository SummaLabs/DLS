(function () {
    'use strict';

    angular.module('modelMain', ['ngMaterial'])
        .component('modelMain', {
            templateUrl: '/frontend/components/models-main/models-main.html',
            bindings: {
                models: '<',
                selected:'<'
            },
            controller: function (modelService, modelsService) {

                var self = this;
                this.$onInit = function () {
                    self.models = [];

                    modelsService.listInfo().then(
                        function successCallback(response) {
                            response.data.forEach(function (model) {
                                var info = model.info;
                                self.models.push({
                                    'name': info.name,
                                    'id': info.id,
                                    'network': "Test Network",//TODO Add network name to description of trained model
                                    'dataSet': info['dataset-name'],
                                    'type': info.type,
                                    'date': info.date.str + " " + info.time.str,
                                    'size': info.size.str,
                                    "trainingData":model.progress
                                });
                            });
                            self.selected = self.models[0];
                        },
                        function errorCallback(response) {
                            console.log(response.data);
                        })
                };

                this.selectModel = function( model ) {
                    self.selected = angular.isNumber(model) ? $scope.models[model] : model;
                };
                
                this.getChartData = function(model) {
                    var chartPoints = createChartPoints(model.trainingData);
                    var chartSettings = getDefaultChartSettings();
                    chartSettings['data']['rows'] = chartPoints;
                    return chartSettings;
                };

                function createChartPoints(trainingData) {
                    var chartPoints = [];
                    for (var i = 0; i < trainingData.iter.length; i++) {
                        chartPoints.push({
                            "c": [
                                {"v": trainingData.iter[i]},
                                {"v": trainingData.accTrain[i]},
                                {"v": trainingData.lossTrain[i]},
                                {"v": trainingData.lossVal[i]},
                                {"v": trainingData.accVal[i]}
                            ]
                        })
                    }

                    return chartPoints;
                }

                function getDefaultChartSettings() {
                    return {
                        "type": "AreaChart",
                        "displayed": false,
                        "data": {
                            "cols": [
                                {
                                    "id": "Iteration",
                                    "type": "number",
                                    "p": {}
                                },
                                {
                                    "id": "lossFunctionTraining",
                                    "label": "Loss Function Training",
                                    "type": "number",
                                    "p": {}
                                },
                                {
                                    "id": "lossFunctionValue",
                                    "label": "Loss Function Value",
                                    "type": "number",
                                    "p": {}
                                },
                                {
                                    "id": "accuracyTraining",
                                    "label": "Accuracy Training",
                                    "type": "number",
                                    "p": {}
                                },
                                {
                                    "id": "accuracyValue",
                                    "label": "Accuracy Training",
                                    "type": "number",
                                    "p": {}
                                }
                            ],
                            "rows": []
                        },
                        "options": {
                            "vAxis": {
                                "title": "True Positive Rate"
                            },
                            "hAxis": {
                                "title": "False Positive Rate"
                            }
                        },
                        "formatters": {}
                    };
                }
            }
        });
})();