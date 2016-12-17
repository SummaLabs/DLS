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
 
    this.checkNetworkFast = function (network) {
        return $http({
            method: 'POST',
            url: '/models/checkmodel/',
            data: network,
            headers: {'Content-Type': 'application/json;charset=utf-8'}
        });
    };

    this.calcModelShape = function (network) {
        return $http({
            method: 'POST',
            url: '/models/calcshape/',
            data: network,
            headers: {'Content-Type': 'application/json;charset=utf-8'}
        });
    };

    this.listInfo = function () {
        return $http({
            method: 'POST',
            url: '/models/list/info/'
        });
    };
    
    this.loadModelROCsData = function(modelId) {
        return $http({
            method: "GET",
            url: "/images/rocs/load/" + modelId
        })
    };
    
    this.loadLayersVisualization = function () {
        return $http({
            method: 'GET',
            url: '/model/layers/visualization'
        });
    };
}