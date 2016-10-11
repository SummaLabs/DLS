(function () {
    'use strict';

    angular
        .module('taskDataset', ['ngMaterial'])
        .directive('taskDataset', function () {
            return {
                scope: {
                    taskId: '@'
                },
                templateUrl: "frontend/components/task/task-dataset/task-dataset.html",
                controller: function ($scope, networkDataService) {
                    this.$onInit = function () {
                    }
                }
            };
        });

})();