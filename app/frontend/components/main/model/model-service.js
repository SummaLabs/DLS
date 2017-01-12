angular.module('modelService', [])
    .service('modelService', ['$http', ModelService]);

function ModelService($http) {

    this.getModelsMetadata = function () {
        return $http({
            method: 'GET',
            url: '/model/all/metadata/list'
        });
    };

    this.inference = function (images, modelId) {
        return $http({
            method: 'POST',
            url: '/model/inference/',
            data: {
                'images': images,
                'modelId': modelId
            }
        })
    };

    this.validateNetwork = function (network) {
        return $http({
            method: 'POST',
            url: '/model/network/validate',
            data: network,
            headers: {'Content-Type': 'application/json;charset=utf-8'}
        });
    };
    
    this.loadModelROCsData = function(modelId) {
        return $http({
            method: "GET",
            url: "/model/roc-analysis/load/" + modelId
        })
    };
    
    this.loadModelFeatureSpace = function(modelId) {
        return $http({
            method: "GET",
            url: "/model/" + modelId + "/feature-space/load"
        })};
    
    this.loadLayersVisualization = function (modelId) {
        return $http({
            method: 'GET',
            url: '/model/layers/visualization/' + modelId
        });
    };
}