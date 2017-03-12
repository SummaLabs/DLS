(function () {
    'use strict';

    angular
        .module('taskView', ['ngMaterial'])
        .directive('taskView', ['$compile', '$interval', function($compile, $interval) {

            function buildTemplate(taskId, taskType) {
                var taskDirectives =
                {
                    'db-image2d-cls':'<task-dataset task-id="' + taskId + '" ></task-dataset>',
                    'build_dataset':'<task-dataset task-id="' + taskId + '" ></task-dataset>',
                    'model-train-image2d-cls':'<task-model task-id="' + taskId + '" ></task-model>',
                    'base':'<task-test task-id="' + taskId + '"></task-test>',
                };
                return taskDirectives[taskType];
            }

            return {
                scope: {
                    taskId: '@',
                    taskType: '@',
                    task: '@',
                    polling: '@'
                },
                link: function(scope, element, attrs) {


                    scope.$watch('taskId', function(newValue, oldValue) {
                        
                        if (angular.isDefined(scope.polling)) {
                            $interval.cancel(scope.polling);
                            scope.polling = undefined;
                        }
                        var id = attrs.taskId;
                        var type = attrs.taskType;
                        var template = buildTemplate(id, type);
                        element.html(template);
                        $compile(element.contents())(scope);

                    });
                }
            };
        }]);

})();
