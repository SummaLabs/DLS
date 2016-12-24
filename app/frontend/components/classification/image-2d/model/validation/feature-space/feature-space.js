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

                    const ROCAnalysis = {
                        RUN: 'ROCAnalysis:run'
                    };

                    var modelRocHistoryData = [];
                    var dataSetTypesRocData = [];
                    var classesRocData = [];

                    this.$onInit = function () {
                        $scope.rocsIds = [];
                        $scope.dsTypes = [];
                        $scope.classNames = [];
                        var future = modelService.loadModelFeatureSpace(JSON.parse($scope.model).id);
                        future.then(function mySucces(response) {
                            initChart(response.data);
                        }, function myError(response) {
                            console.log();
                        });

                        $scope.$watch('rocHistorySelected', function (newValue, oldValue) {
                            if (oldValue != null) {
                                var index = 0;
                                $scope.rocsIds.forEach(function (rocId) {
                                    if (rocId.name == $scope.rocHistorySelected) {
                                        setROCDataForDsType(modelRocHistoryData[index]);
                                    }
                                    index++;
                                });
                            }
                        });

                        $scope.$watch('dsTypeSelected', function (newValue, oldValue) {
                            if (oldValue != null) {
                                var types = $scope.dsTypes;
                                var index = types.indexOf($scope.dsTypeSelected);
                                setROCDataForClass(dataSetTypesRocData[index]);
                            }
                        });

                        $scope.$watch('classNameSelected', function (newValue, oldValue) {
                            if (oldValue != null) {
                                var classNames = $scope.classNames;
                                var index = classNames.indexOf($scope.classNameSelected);
                                $scope.rocData = classesRocData[index];
                            }
                        });

                        $rootScope.$on(ROCAnalysis.RUN, function ($event, data) {
                            $scope.rocsIds.push(data);
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
                            var reloadRocData = false;
                            tasks.forEach(function (task) {
                                if (task.type = 'fspace-image2d') {
                                    for (var i = 0; i < $scope.rocsIds.length; i++) {
                                        var rocId = $scope.rocsIds[i];
                                        if (rocId.hasOwnProperty('taskId')
                                            && rocId.taskId == task.id
                                            && task.state == 'finished') {
                                            $scope.rocsIds.splice(i, 1);
                                            reloadRocData = true;
                                        }
                                    }
                                }
                            });
                            if (reloadRocData) {
                                var future = modelService.loadModelFeatureSpace($scope.modelId);
                                future.then(function mySucces(response) {
                                    initChart(response.data);
                                    self.showToast('ROC Analysis task is completed!');
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
                                        $rootScope.$emit(ROCAnalysis.RUN, runningTask);
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

                    function updateModelROCsHistoryData(rocsHistoryData) {
                        $scope.rocsIds.length = 0;
                        $scope.classNames.length = 0;
                        modelRocHistoryData.length = 0;
                        classesRocData.length = 0;
                        setModelROCsHistoryData(rocsHistoryData)
                    }

                    function setModelROCsHistoryData(rocsHistoryData) {
                        rocsHistoryData.forEach(function (rocData) {
                            modelRocHistoryData.push(rocData);
                            $scope.rocsIds.push({
                                name: rocData['dataset-name'] + "-" + rocData['date'],
                                inProgress: false
                            });
                        });
                        $scope.rocHistorySelected = $scope.rocsIds[0].name;
                        setROCDataForDsType(modelRocHistoryData[0]);
                    }

                    function setROCDataForDsType(rocData) {
                        $scope.dsTypes = [];
                        rocData.dbtypes.forEach(function (type) {
                            $scope.dsTypes.push(type);
                            dataSetTypesRocData.push(rocData.roc[type]);
                        });
                        $scope.dsTypeSelected = $scope.dsTypes[0];
                        setROCDataForClass(dataSetTypesRocData[0]);
                    }

                    function setROCDataForClass(rocData) {
                        $scope.classNames = [];
                        classesRocData.length = 0;
                        rocData.forEach(function (classROC) {
                            $scope.classNames.push(classROC.name);
                            var chartPoints = createRocChartPoints(classROC.rocPoints);
                            var chartSettings = getDefaultChartSettings(classROC.auc);
                            chartSettings['data']['rows'] = chartPoints;
                            classesRocData.push(chartSettings)
                        });
                        $scope.classNameSelected = $scope.classNames[0];
                        $scope.rocData = classesRocData[0];
                    }

                    function createRocChartPoints(classRocPointsJson) {
                        var classRocPoints = [];
                        classRocPointsJson.forEach(function (point) {
                            classRocPoints.push({
                                "c": [
                                    {"v": point.x},
                                    {"v": point.y}
                                ]
                            })
                        });

                        return classRocPoints;
                    }

                    function getDefaultChartSettings(auc) {
                        return {
                            "type": "AreaChart",
                            "displayed": false,
                            "data": {
                                "cols": [
                                    {
                                        "id": "TP",
                                        "type": "number",
                                        "p": {}
                                    },
                                    {
                                        "id": "FP",
                                        "label": "AUC: " + auc + "",
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

                    function createTrace(cluster){
                        return {
                                    x: cluster.x,
                                    y: cluster.y,
                                    mode: 'markers',
                                    type: 'scatter',
                                    name: j,
                                    marker: { size: 5 }
                                 };
                    }

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