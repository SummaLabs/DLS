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
                
                this.getChartData = function(model, type) {
                    var chartPoints = createChartPoints(model.trainingData, type);
                    var chartSettings = getDefaultChartSettings(type);
                    chartSettings['data']['rows'] = chartPoints;
                    return chartSettings;
                };

                function createChartPoints(trainingData, type) {
                    var chartPoints = [];
                    for (var i = 0; i < trainingData.iter.length; i++) {
                        var columns = [];
                        if (type == 'training') {
                            columns.push({"v": trainingData.iter[i]});
                            columns.push({"v": trainingData.lossTrain[i]});
                            columns.push({"v": trainingData.accTrain[i]});
                        }
                        if (type == 'validation') {
                            columns.push({"v": trainingData.iter[i]});
                            columns.push({"v": trainingData.lossVal[i]});
                            columns.push({"v": trainingData.accVal[i]});
                        }
                        chartPoints.push({
                            "c": columns
                        })
                    }

                    return chartPoints;
                }

                function getDefaultChartSettings(type) {
                    var chartSettings = {
                        "lossFunctionId": "",
                        "lossFunctionLabel": "",
                        "accuracyId": "",
                        "accuracyLabel": ""
                    };
                    if (type == 'training') {
                        chartSettings.lossFunctionId = "lossFunctionTraining";
                        chartSettings.lossFunctionLabel = "Loss Function";
                        chartSettings.accuracyId = "accuracyTraining";
                        chartSettings.accuracyLabel = "Accuracy";
                        chartSettings.title = "Training Data Set";
                    }
                    if (type == 'validation') {
                        chartSettings.lossFunctionId = "lossFunctionValidation";
                        chartSettings.lossFunctionLabel = "Loss Function";
                        chartSettings.accuracyId = "accuracyValidation";
                        chartSettings.accuracyLabel = "Accuracy";
                        chartSettings.title = "Validation Data Set";
                    }


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
                                    "id": chartSettings.lossFunctionId,
                                    "label": chartSettings.lossFunctionLabel,
                                    "type": "number",
                                    "p": {}
                                },
                                {
                                    "id": chartSettings.accuracyId,
                                    "label": chartSettings.accuracyLabel,
                                    "type": "number",
                                    "p": {}
                                }
                            ],
                            "rows": []
                        },
                        "options": {
                            "title": chartSettings.title,
                            "vAxis": {
                                "title": "Training Parameters"
                            },
                            "hAxis": {
                                "title": "Iterations"
                            },
                            height: 600
                        },
                        "formatters": {}
                    };
                }
            }
        });
})();