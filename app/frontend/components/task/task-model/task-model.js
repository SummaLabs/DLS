(function () {
    'use strict';

    angular
        .module('taskModel', ['ngMaterial'])
        .directive('taskModel', function () {
            return {
                scope: {
                    taskId: '@',
                    rows: ''
                },
                templateUrl: "frontend/components/task/task-model/task-model.html",
                controller: function ($scope, networkDataService) {
                    this.$onInit = function () {
                        $scope.plot = this.getInitPlotData();

                        $scope.$parent.polling = $interval(function () {
                            console.log("polling task " + $scope.taskId)
                            $http({
                                method: "GET",
                                url: "/task/info/" + $scope.taskId,
                            }).then(function mySucces(response) {
                                console.log(response);
                                $scope.plot.data.rows = response.data.rows;
                            }, function myError(response) {
                                console.log(response);
                            });
                        }, 1000);
                    };




                    this.getInitPlotData = function () {
                        var tmp = {
                            "type": "AreaChart",
                            "displayed": false,
                            "data": {
                                "cols": [
                                    {
                                        "id": "epoch",
                                        "label": "#epoches",
                                        "type": "number",
                                        "p": {}
                    },
                                    {
                                        "id": "test-loss",
                                        "label": "Accuracy on TrainingSet",
                                        "type": "number",
                                        "p": {}
                    },
                                    {
                                        "id": "test-error",
                                        "label": "Accuracy on TestSet",
                                        "type": "number",
                                        "p": {}
                    }
                ],
                                "rows": []
                            },
                            "options": {
                                "title": "Training convergence",
                                "isStacked": "true",
                                "fill": 20,
                                "displayExactValues": true,
                                "vAxis": {
                                    "title": "Accuracy",
                                    "gridlines": {
                                        "count": 5
                                    }
                                },
                                "hAxis": {
                                    "title": "Epoch"
                                }
                            },
                            "formatters": {}
                        };
                        /*for (var ii = 0; ii < numpts; ii++) {
                            self.addRandomPoint2Plot(tmp);
                        }*/
                        return tmp;
                    };
                }
            };
        });

})();