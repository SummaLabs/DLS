(function () {
    'use strict';

    angular.module('classifyDataSet', ['ngMaterial'])
        .directive('classifyDataSet', function () {
            return {
                scope: {
                    modelId: '@'
                },
                templateUrl: '/frontend/components/inference/classify-dataset/classify-dataset.html',
                controller: function ($rootScope, $scope, $mdDialog, $mdToast, imageService, taskManagerService) {
                    var self = this;

                    const ROCAnalysis = {
                        RUN: 'ROCAnalysis:run'
                    };
                    var rocsData = [];
                    var classesROC = [];

                    this.$onInit = function () {
                        $scope.rocsIds = [];
                        $scope.classNames = [];
                        var future = imageService.loadModelROCsData($scope.modelId);
                        future.then(function mySucces(response) {
                            setModelROCsHistoryData(response.data);
                        }, function myError(response) {
                        });
                        
                        $scope.$watch('rocSelected', function () {
                            var index = 0;
                            $scope.rocsIds.forEach(function (rocId) {
                                if (rocId.name == $scope.rocSelected) {
                                    setROCData(rocsData[index]);
                                }
                                index++;
                            });
                        });

                        $scope.$watch('classNameSelected', function () {
                            var classNames = $scope.classNames;
                            var index = classNames.indexOf($scope.classNameSelected);
                            $scope.rocData = classesROC[index];
                        });

                        $rootScope.$on(ROCAnalysis.RUN, function ($event, data) {
                            $scope.rocsIds.push(data);
                        });

                        taskManagerService.subToTasksStatusUpdate(function (event, tasks) {
                            event.stopPropagation();
                            var reloadRocData = false;
                            tasks.forEach(function (task) {
                                console.log(task);
                                if (task.type = 'roc-analysis') {
                                    $scope.rocsIds.forEach(function (rocId) {
                                        if (typeof rocId.taskId != "undefined" && rocId.taskId == task.id) {
                                            reloadRocData = true;
                                        }
                                    })
                                }
                            });
                            if (reloadRocData) {
                                var future = imageService.loadModelROCsData($scope.modelId);
                                future.then(function mySucces(response) {
                                    updateModelROCsHistoryData(response.data);
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
                            templateUrl: '/frontend/components/inference/classify-dataset/apply-ROC-analysis.html',
                            controller: function ($scope, dbinfoService, taskManagerService) {
                                $scope.dataSetNames = [];

                                var future = dbinfoService.getDatasetsInfoStatList();
                                future.then(function mySucces(response) {
                                    response.data.forEach(function (dataSet) {
                                        $scope.dataSetNames.push(dataSet.name);
                                    });
                                    $scope.dataSetSelected = $scope.dataSetNames[0];
                                }, function myError(response) {
                                });

                                $scope.submitROCAnalysisTask = function () {
                                    var futureTask = taskManagerService.startTask('roc-analysis',
                                        {model_id: model_id, data_set_id: $scope.dataSetSelected});
                                    futureTask.then(function mySucces(response) {
                                        var taskId = response.data.taskId;
                                        $rootScope.$emit(ROCAnalysis.RUN, {
                                            name: $scope.dataSetSelected,
                                            inProgress: true,
                                            taskId : taskId
                                        });
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

                    function updateModelROCsHistoryData() {
                        console.log("update");
                    }

                    function setModelROCsHistoryData(ROCsHistoryData) {
                        ROCsHistoryData.forEach(function (rocData) {
                            rocsData.push(rocData);
                            $scope.rocsIds.push({
                                name: rocData.dataSet + "-" + rocData.date,
                                inProgress: false
                            });
                        });
                        $scope.rocSelected = $scope.rocsIds[0].name;
                        
                        setROCData(rocsData[0]);
                    }

                    function setROCData(ROCData) {
                        $scope.classNames = [];
                        $scope.classNameSelected = ROCData.classes[0].name;
                        ROCData.classes.forEach(function (classROC) {
                            $scope.classNames.push(classROC.name);
                            var chartPoints = createRocChartPoints(classROC.rocPoints);
                            var chartSettings = getDefaultChartSettings(ROCData.network);
                            chartSettings['data']['rows'] = chartPoints;
                            classesROC.push(chartSettings)
                        });
                        $scope.rocData = classesROC[0];
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

                    function getDefaultChartSettings(networkName) {
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
                                        "label": "" + networkName + "",
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
            }
        })

})();