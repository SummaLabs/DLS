angular.module('imageService', [])
    .service('imageService', ['$http', ImageService]);

function ImageService($http) {

    this.classifyImages = function(imagesPath, modelId) {
        return $http({
            method: 'POST',
            url:    '/images/classify',
            params: {
                imagesPath: imagesPath,
                modelId: modelId
            }
        });
    };
    
    this.loadDataSetROC = function(modelId) {
        return $http({
            method: "GET",
            url: "/images/roc/load/" + modelId
        })
    }
}