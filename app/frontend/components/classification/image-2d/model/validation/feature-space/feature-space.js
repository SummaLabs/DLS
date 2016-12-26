(function () {
    'use strict';

    angular.module('featureSpace', ['ngMaterial', 'deviceSelector', 'taskManagerService'])
        .directive('featureSpace', function () {
            return {
                scope: {
                    model: '@'
                },
                templateUrl: '/frontend/components/classification/image-2d/model/validation/feature-space/feature-space.html',
                controller: function ($rootScope, $scope, $mdDialog, $mdToast, modelService, taskManagerService) {
                    var self = this;

                    const FeatureSpace = {
                        RUN: 'FeatureSpace:run'
                    };


                    this.$onInit = function () {
                        $scope.taskIds = [];
                        $scope.dsTypes = [];
                        $scope.classNames = [];
                        var future = modelService.loadModelFeatureSpace(JSON.parse($scope.model).id);
                        future.then(function mySucces(response) {
                            initChart(response.data);
                        }, function myError(response) {
                            console.log();
                        });

                        $rootScope.$on(FeatureSpace.RUN, function ($event, data) {
                            $scope.taskIds.push(data);
                        });
                        $rootScope.$on('model_select', function ($event, data){
                            $scope.currentModelId = data.id;
                             var future = modelService.loadModelFeatureSpace(data.id);
                             future.then(function mySucces(response) {
                                 initChart(response.data);
                             }, function myError(response) {
                                console.log();
                                });
                        });

                        taskManagerService.subToTasksStatusUpdate(function (event, tasks) {
                            event.stopPropagation();
                            var reloadData = false;
                            tasks.forEach(function (task) {
                                if (task.type = 'fspace-image2d') {
                                    for (var i = 0; i < $scope.taskIds.length; i++) {
                                        var taskId = $scope.taskIds[i];
                                        if (taskId.hasOwnProperty('taskId')
                                            && taskId.taskId == task.id
                                            && task.state == 'finished') {
                                            $scope.taskIds.splice(i, 1);
                                            reloadData = true;
                                        }
                                    }
                                }
                            });
                            if (reloadData) {
                                var future = modelService.loadModelFeatureSpace($scope.modelId);
                                future.then(function mySucces(response) {
                                    initChart(response.data);
                                    self.showToast('Feature Space task is completed!');
                                }, function myError(response) {
                                });
                            }
                        });
                    };

                    this.showToast = function (message) {
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent(message)
                                .position('top right')
                                .hideDelay(3000)
                        );
                    };
                    
                    $scope.applyFeatureSpace = function ($event) {
                        var modelObject =  JSON.parse($scope.model);
                        var model_id = modelObject.id;
                        var dataset_id = modelObject.dataSetId;
                        $mdDialog.show({
                            clickOutsideToClose: true,
                            parent: angular.element(document.body),
                            targetEvent: $event,
                            templateUrl: '/frontend/components/classification/image-2d/model/validation/feature-space/apply-feature-space.html',
                            controller: function ($scope, $rootScope, datasetService, taskManagerService) {
                                $scope.dataSets = [];
                                $scope.device = "";
                                $scope.dataSetSelected = "";
                                $scope.samps = [100, 250, 500, 1000, 1500];
                                $scope.layers = [
                               'convolution1d',
                               'convolution2d',
                               'convolution3d',
                               'pooling1d',
                               'pooling2d',
                               'pooling3d',
                               'activation',
                               'flatten',
                               'merge',
                               'dense',
                               'datainput',
                               'dataoutput'];
                                $scope.isPca = false;
                                $scope.isTsne = false;
                                $scope.samples = 100;
                                $scope.searchTerm;
                                $scope.clearSearchTerm = function() {
                                    $scope.searchTerm = '';
                                };
                                $scope.selectedLayers;


                                $scope.submitFeatureSpaceTask = function () {
                                    var params = {
                                        'model-id': model_id,
                                        'dataset-id': dataset_id,
                                        'deviceType': $scope.device.type,
                                        'is-pca': $scope.isPca,
                                        'is-tsne': $scope.isTsne,
                                        layers: $scope.selectedLayers, 
                                        samples: $scope.samples
                                    };
                                    var futureTask = taskManagerService.startTask('fspace-image2d', params);
                                    futureTask.then(function mySucces(response) {
                                        var taskId = response.data.taskId;
                                        var runningTask = {
                                            name: $scope.dataSetSelected.name,
                                            inProgress: true,
                                            taskId : taskId
                                        };
                                        $rootScope.$emit(FeatureSpace.RUN, runningTask);
                                        self.showToast('Feature Space Analysis task is running. Task id: ' + taskId);
                                    }, function myError(response) {
                                    });
                                    

                                    $mdDialog.hide();
                                };

                                $scope.closeDialog = function () {
                                    $mdDialog.hide();
                                }
                            }
                        });


                    };

                    function generatePlot(layer, type, name){
                         var traces = [];
                            for(var j in layer){
                                var cluster = layer[j];
                                 var trace = {
                                    x: cluster.x,
                                    y: cluster.y,
                                    mode: 'markers',
                                    type: 'scatter',
                                    name: j,
                                    marker: { size: 5 }
                                 };
                                traces.push(trace);
                            }

                            var layout = {
                                title: name + ' ' + type
                            };
                            var divId = 'feature-space-chart' + name + '_' +  type;
                            return {divId: divId, traces: traces, layout: layout};
                    }
                    
                    function visualize(pce, tsne){
                        
                        $('#feature-space-chart').after( '<div class="layout-row"><div id="' + pce.divId + '" class="fs-chart"></div><div id="' + tsne.divId + '" class="fs-chart"></div></div>' );
                        
                        Plotly.newPlot(pce.divId, pce.traces, pce.layout);
                        Plotly.newPlot(tsne.divId, tsne.traces, tsne.layout);
                        
                    }

                    function initChart(space){
                        $('.fs-chart').html('');
                        for(var i=0; i<space.length; i++){
                            var layer = space[i];
                            var pca = layer.data.pca;
                            var tsne = layer.data.tsne;
                            visualize(generatePlot(pca, "PCA", layer.name), generatePlot(tsne, "TSNE", layer.name))
                            
                        }
                    }
                    
                    
                }
            }
        });

})();