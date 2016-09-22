angular.module('modelService', [])
    .service('modelService', ['$http', ModelService]);

function ModelService($http) {
    
    this.loadAllModels = function() {
        return $http({
            method: "GET",
            url: "/model/load/all"
        })
    }
}