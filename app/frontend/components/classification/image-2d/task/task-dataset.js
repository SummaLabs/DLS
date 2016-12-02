(function () {
    'use strict';

    angular
        .module('taskDataset', ['ngMaterial'])
        .directive('taskDataset', function () {
            return {
                scope: {
                    taskId: '@'
                },
                templateUrl: "/frontend/components/classification/image-2d/task/task-dataset.html",
                controller: function ($scope, networkDataService, $http) {
                    this.$onInit = function () {
                        $http({
                                method: "GET",
                                url: "/task/info/" + $scope.taskId,
                            }).then(function mySucces(response) {
                                console.log(response);
                                $scope.info = response.data.info;
                            }, function myError(response) {
                                console.log(response);
                            });
                    }
                }
            };
        });

})();