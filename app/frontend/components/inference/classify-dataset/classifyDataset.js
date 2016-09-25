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
                    var self = this;
                    var classesROC = [];

                    this.$onInit = function () {
                        var roc = imageService.loadDataSetROC("classified-data-set-roc.json");
                        roc.then(function mySucces(response) {
                            setLoadedClassesROC(response.data);
                        }, function myError(response) {
                        });

                        $scope.$watch('classNameSelected', function () {
                            var classNames = $scope.classNames;
                            var index = classNames.indexOf($scope.classNameSelected);
                            $scope.rocData = classesROC[index];
                        });
                    };

                    function setLoadedClassesROC(classesROCData) {
                        $scope.classNames = [];
                        $scope.classNameSelected = classesROCData.classes[0].name;
                        classesROCData.classes.forEach(function (classROC) {
                            $scope.classNames.push(classROC.name);
                            var chartPoints = createRocChartPoints(classROC.rocPoints);
                            var chartSettings = getDefaultChartSettings(classesROCData.network);
                            chartSettings['data']['rows'] = chartPoints;
                            classesROC.push(chartSettings)
                        })
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