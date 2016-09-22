angular.module('imageService', [])
    .service('imageService', ['$http', ImageService]);

function ImageService($http) {

    this.classifyImages = function(imagesPath) {
        return $http({
            method: "GET",
            url: "/images/classify/" + imagesPath
        });
    };
    
    this.loadClassifiedImagesAsJsonFile = function() {
        return $http({
            method: "GET",
            url: "/images/classified/download",
            responseType: 'arraybuffer'
        })
    };
    
    this.loadDataSetROC = function(id) {
        return $http({
            method: "GET",
            url: "/images/dataset/roc/load/" + id
        })
    }
}