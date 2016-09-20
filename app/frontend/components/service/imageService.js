angular.module('imageService', [])
    .service('imageService', ['$http', ImageService]);

function ImageService($http) {

    this.classifyImages = function(imagesPath) {
        var classifiedImages = [];
        $http({
            method: "GET",
            url: "/images/classify/" + imagesPath
        }).then(function mySucces(response) {
            response.data.forEach(function(layer) {
                classifiedImages.push(layer)
            });
        }, function myError(response) {
            console.log(response);
        });

        return classifiedImages;
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