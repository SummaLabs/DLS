angular.module('taskManagerService', [])
    .service('taskManagerService', ['$rootScope', '$http', TaskManagerService]);

function TaskManagerService($rootScope, $http) {

    const status = {
        UPDATE: 'task:status:update'
    };

    var socket = io.connect('http://' + document.domain + ':' + location.port);
    socket.on('task_monitor', function (msg) {
        console.log(msg);
        var tasks = JSON.parse(msg);
        $rootScope.$emit(status.UPDATE, tasks);
    });

    /*
     * Invokes periodically and pass status of all tasks in callback. Filter results by id to track particular task, 
     */
    this.subToTasksStatusUpdate = function(callback) {
        $rootScope.$on(status.UPDATE, callback);
    };

    /*
     * customParams - variable set of params specific for particular type of task - json string
     */
    
    this.startTask = function(type, customParams) {
        return $http({
            method: 'POST',
            url: '/task/start',
            params: {
                type: type,
                customParams: customParams
            }
        })
    }
}