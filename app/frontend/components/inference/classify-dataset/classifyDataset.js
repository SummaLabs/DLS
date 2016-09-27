(function () {
    'use strict';

    angular.module('classifyDataSet', ['ngMaterial'])
        .directive('classifyDataSet', function () {
            return {
                scope: {
                    modelId: '@'
                },
                templateUrl: '/frontend/components/inference/classify-dataset/classify-dataset.html',
                controller: function ($rootScope, $scope, $mdDialog, $mdToast, imageService) {
                    var self = this;

                    const ROCAnalysis = {
                        RUN: 'ROCAnalysis:run'
                    };
                    var rocsData = [];
                    var classesROC = [];

                    this.$onInit = function () {
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
                        $mdDialog.show({
                            clickOutsideToClose: true,
                            parent: angular.element(document.body),
                            targetEvent: $event,
                            templateUrl: '/frontend/components/inference/classify-dataset/apply-ROC-analysis.html',
                            controller: function ($scope, dbinfoService, imageService) {
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
                                    // imageService.applyROCAnalysis(modelId, $scope.dataSetSelected);
                                    self.showToast('ROC Analysis is running');
                                    $rootScope.$emit(ROCAnalysis.RUN, {
                                        name: $scope.dataSetSelected + "-" + getCurrentTime(),
                                        inProgress: true
                                    });
                                    $mdDialog.hide();
                                };

                                $scope.closeDialog = function () {
                                    $mdDialog.hide();
                                }
                            }
                        });


                    };

                    function getCurrentTime() {
                        var today = new Date();
                        var date = today.getFullYear() + '.' + (today.getMonth() + 1) + '.' + today.getDate();
                        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                        return date + '-' + time;
                    }
                    
                    function setModelROCsHistoryData(ROCsHistoryData) {
                        $scope.rocsIds = [];
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