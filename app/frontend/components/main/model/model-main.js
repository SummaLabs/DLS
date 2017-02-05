(function () {
    'use strict';

    angular.module('modelMain', ['ngMaterial', 'modelService', 'inference', 'layersVisualization', 'validation', 'plotly'])
        .component('modelMain', {
            templateUrl: '/frontend/components/main/model/model-main.html',
            bindings: {
                models: '<',
                selected:'<'
            },
            controller: function (modelService, $scope, $rootScope) {

                var self = this;
                this.$onInit = function () {
                    self.models = [];

                    modelService.getModelsMetadata().then(
                        function successCallback(response) {
                            response.data.forEach(function (model) {
                                var info = model.info;
                                self.models.push({
                                    'name': info.name,
                                    'id': info.id,
                                    'network': "Test Network",//TODO Add network name to description of trained model
                                    'dataSet': info['dataset-name'],
                                    'dataSetId': info['dataset-id'],
                                    'type': info.type,
                                    'date': info.date.str + " " + info.time.str,
                                    'size': info.size.str,
                                    "trainingData":model.progress
                                });
                            });
                            self.selected = self.models[0];
                            self.initChart(self.selected);
                        },
                        function errorCallback(response) {
                            console.log(response.data);
                        })
                };

                this.selectModel = function( model ) {
                    self.selected = angular.isNumber(model) ? $scope.models[model] : model;
                    $rootScope.$emit('model_select', model);
                    $scope.$broadcast('model-main:update-model', model);
                    self.initChart(model);
                };
                
                this.initChartTrace = function(xArray, yArray, name){
                    return  {
                                x: xArray,
                                y: yArray,
                                mode: 'lines+markers',
                                name: name
                            };
                }
                
                this.initChartLayout = function(title){
                    return {
                                title: title,
                                autosize: true,
                                xaxis: {
                                    title: 'Iterations',
                                    showline: false
                                },
                                yaxis: {
                                    title: 'Training Parameters',
                                    showline: false
                                }
                            };
                }
                
                this.initChart = function(model){
                           
                            var traceTrainAcc = this.initChartTrace(model.trainingData.iter, model.trainingData.accTrain, 'Training');
                            var tracetrainLoss = this.initChartTrace(model.trainingData.iter, model.trainingData.lossTrain, 'Traininggs');
                            var traceValacc = this.initChartTrace(model.trainingData.iter, model.trainingData.accVal, 'Validation');
                            var traceValLoss = this.initChartTrace(model.trainingData.iter, model.trainingData.lossVal, 'Validation');
                    
                            var dataAcc = [ traceTrainAcc, traceValacc ];
                            var layoutAcc = this.initChartLayout('Accuracy');


                            var dataLoss = [ tracetrainLoss, traceValLoss ];
                            var layoutLoss = this.initChartLayout('Loss Function');

                            $scope.dataAcc = dataAcc;
                            $scope.layoutAcc = layoutAcc;
                            $scope.options = {};
                            $scope.dataLoss = dataLoss;
                            $scope.layoutLoss = layoutLoss;

                };
             
            }
        });
})();