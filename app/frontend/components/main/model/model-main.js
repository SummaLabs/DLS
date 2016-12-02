(function () {
    'use strict';

    angular.module('modelMain', ['ngMaterial', 'inference', 'validation'])
        .component('modelMain', {
            templateUrl: '/frontend/components/main/model/model-main.html',
            bindings: {
                models: '<',
                selected:'<'
            },
            controller: function (modelService) {

                var self = this;
                this.$onInit = function () {
                    self.models = [];

                    modelService.listInfo().then(
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
                            self.initChart(self.selected);
                        },
                        function errorCallback(response) {
                            console.log(response.data);
                        })
                };

                this.selectModel = function( model ) {
                    self.selected = angular.isNumber(model) ? $scope.models[model] : model;
                    self.initChart(model);
                };
                
                this.initChartTrace = function(xArray, yArray, name){
                    return  {
                                x: xArray,
                                y: yArray,
                                mode: 'lines',
                                name: name
                            };
                }
                
                this.initChartLayout = function(title){
                    return {
                                title: title,
                                height: 500,
                                width: 850,
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
                           
                            var traceTrainAcc = this.initChartTrace(model.trainingData.iter, model.trainingData.accTrain, 'Accuracy');
                            var tracetrainLoss = this.initChartTrace(model.trainingData.iter, model.trainingData.lossTrain, 'Loss Function');
                            var dataTrain = [ traceTrainAcc, tracetrainLoss ];
                            var layoutTrain = this.initChartLayout('Training Data Set');

                            Plotly.newPlot('model-training-chart', dataTrain, layoutTrain);
                    
                            var traceValacc = this.initChartTrace(model.trainingData.iter, model.trainingData.accVal, 'Accuracy');
                            var traceValLoss = this.initChartTrace(model.trainingData.iter, model.trainingData.lossVal, 'Loss Function');                    
                            var dataVal = [ traceValacc, traceValLoss ];
                            var layoutVal = this.initChartLayout('Validation Data Set');

                            Plotly.newPlot('model-validation-chart', dataVal, layoutVal);
                };
                
             
            }
        });
})();