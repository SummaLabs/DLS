(function () {
    'use strict';

    angular.module('classifyDataSet', ['ngMaterial'])
        .directive('classifyDataSet', function () {
            return {
                scope: {
                    modelId: '@'
                },
                templateUrl: '/frontend/components/inference/classify-dataset/classify-dataset.html',
                controller: function ($scope, imageService) {
                    var rocsData = [];
                    var classesROC = [];

                    this.$onInit = function () {
                        var future = imageService.loadModelROCsData($scope.modelId);
                        future.then(function mySucces(response) {
                            setModelROCsHistoryData(response.data);
                        }, function myError(response) {
                        });
                        
                        $scope.$watch('rocSelected', function () {
                            var index = $scope.rocsIds.indexOf($scope.rocSelected);
                            setROCData(rocsData[index]);
                        });

                        $scope.$watch('classNameSelected', function () {
                            var classNames = $scope.classNames;
                            var index = classNames.indexOf($scope.classNameSelected);
                            $scope.rocData = classesROC[index];
                        });
                    };
                    
                    function setModelROCsHistoryData(ROCsHistoryData) {
                        $scope.rocsIds = [];
                        ROCsHistoryData.forEach(function (rocData) {
                            rocsData.push(rocData);
                            $scope.rocsIds.push(rocData.dataSet + "-" + rocData.date);
                        });
                        $scope.rocSelected = $scope.rocsIds[0];
                        
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