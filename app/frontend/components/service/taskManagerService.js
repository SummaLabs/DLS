angular.module('taskManagerService', [])
    .service('taskManagerService', ['$http', TaskManagerService]);

function TaskManagerService($http) {

    /*
     * customParams - variable set of params specific for particular type of task - json string
     */
    
    this.startTask = function(taskType, customParams) {
        return $http({
            method: "POST",
            url: "/task/start",
            params: {
                taskType: taskType,
                customParams: customParams
            },
            headers: {'Content-Type': 'application/json;charset=utf-8'}
        })
    }
}