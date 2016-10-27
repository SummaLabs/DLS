angular.module('modelService', [])
    .service('modelService', ['$http', ModelService]);

function ModelService($http) {
    
    this.loadAllModels = function() {
        return $http({
            method: "GET",
            url: "/model/load/all"
        })
    };

    this.inference = function (imagesPath, modelId) {
        return $http({
            method: 'POST',
            url: '/models/inference/',
            data: {
                'imagesPath': imagesPath,
                'modelId': modelId
            }
        })
    };
}