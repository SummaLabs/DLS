(function () {
    'use strict';

    angular.module('rocAnalysis', ['ngMaterial', 'deviceSelector', 'taskManagerService'])
        .directive('rocAnalysis', function () {
            return {
                scope: {
                    modelId: '@'
                },
                templateUrl: '/frontend/components/classification/image-2d/model/validation/roc-analysis/roc-analysis.html',
                controller: function ($rootScope, $scope, $mdDialog, $mdToast, modelService, taskManagerService) {
                    var self = this;

                    const ROCAnalysis = {
                        RUN: 'ROCAnalysis:run'
                    };

                    var modelRocHistoryData = [];
                    var dataSetTypesRocData = [];
                    var classesRocData = [];

                    var rocPlotlyData = [];
                    var rocPlotlyLayout = initChartLayout("ROC Analysis");
                    var plotlyDatas = {training: [], validation: []};

                    this.$onInit = function () {
                        $scope.rocsIds = [];
                        $scope.dsTypes = [];
                        $scope.classNames = [];
                        var future = modelService.loadModelROCsData($scope.modelId);
                        future.then(function mySucces(response) {
                            setModelROCsHistoryData(response.data);
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
                                $scope.rocPlotlyData = [plotlyDatas.training[index], plotlyDatas.validation[index]];
                            }
                        });

                        $rootScope.$on(ROCAnalysis.RUN, function ($event, data) {
                            $scope.rocsIds.push(data);
                        });

                        taskManagerService.subToTasksStatusUpdate(function (event, tasks) {
                            event.stopPropagation();
                            var reloadRocData = false;
                            tasks.forEach(function (task) {
                                if (task.type = 'roc-image2d-cls') {
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
                                var future = modelService.loadModelROCsData($scope.modelId);
                                future.then(function mySucces(response) {
                                    updateModelROCsHistoryData(response.data);
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

                    $scope.applyROCAnalysis = function ($event) {
                        var model_id = $scope.modelId;
                        $mdDialog.show({
                            clickOutsideToClose: true,
                            parent: angular.element(document.body),
                            targetEvent: $event,
                            templateUrl: '/frontend/components/classification/image-2d/model/validation/roc-analysis/apply-roc-analysis.html',
                            controller: function ($scope, datasetService, taskManagerService) {
                                $scope.dataSets = [];
                                $scope.device = "";
                                $scope.dataSetSelected = "";

                                var future = datasetService.getDataSetsMetadata();
                                future.then(function mySucces(response) {
                                    response.data.forEach(function (dataSet) {
                                        $scope.dataSets.push(dataSet);
                                    });
                                    $scope.dataSetSelected = $scope.dataSets[0];
                                }, function myError(response) {
                                });

                                $scope.submitROCAnalysisTask = function () {
                                    var params = {
                                        'model-id': model_id,
                                        'dataset-id': $scope.dataSetSelected.id,
                                        'deviceType': $scope.device.type
                                    };
                                    var futureTask = taskManagerService.startTask('roc-image2d-cls', params);
                                    futureTask.then(function mySucces(response) {
                                        var taskId = response.data.taskId;
                                        var runningTask = {
                                            name: $scope.dataSetSelected.name,
                                            inProgress: true,
                                            taskId : taskId
                                        };
                                        $rootScope.$emit(ROCAnalysis.RUN, runningTask);
                                        self.showToast('ROC Analysis task is running. Task id: ' + taskId);
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
                        setROCDataForClass(dataSetTypesRocData);
                    }

                    function setROCDataForClass(dataSetTypesRocData) {
                        var rocData =  dataSetTypesRocData[0]
                        $scope.classNames = [];
                        classesRocData.length = 0;

                        rocData.forEach(function (classROC) {
                            $scope.classNames.push(classROC.name);
                        });

                        $scope.plotlyDatas = {training: [], validation: []};

                        $scope.classNameSelected = $scope.classNames[0];



                        dataSetTypesRocData[0].forEach(function (classROC) {
                            $scope.plotlyDatas.training.push(initChartTrace(classROC.rocPoints, "Training"))
                        });

                        dataSetTypesRocData[1].forEach(function (classROC) {
                            $scope.plotlyDatas.validation.push(initChartTrace(classROC.rocPoints, "Validation"))
                        });
                        $scope.rocPlotlyData = [$scope.plotlyDatas.training[0], $scope.plotlyDatas.validation[0]];
                        $scope.rocPlotlyLayout = initChartLayout("ROC Analysis");



                    }

                     function initChartLayout(title){
                       return {
                               title: title,
                               autosize: true,
                               xaxis: {
                                   title: 'False Positive Rate',
                                   showline: false
                               },
                               yaxis: {
                                   title: 'True Positive Rate',
                                   showline: false
                               }
                           };
                     }

                     function initChartTrace(xyArray, name){
                           var xArray = [];
                           var yArray = [];
                           xyArray.forEach(function (p){
                               xArray.push(p.x);
                               yArray.push(p.y);
                           });
                           return  {
                               x: xArray,
                               y: yArray,
                               mode: 'lines+markers',
                               name: name
                           };
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
                    
                }
            }
        });

})();