angular.module('imageService', [])
    .service('imageService', ['$http', ImageService]);

function ImageService($http) {

    this.loadClassifiedImages = function() {
        var classifiedImages = [];
        $http({
            method: "GET",
            url: "/images/classified/load"
        }).then(function mySucces(response) {
            response.data.forEach(function(layer) {
                classifiedImages.push(layer)
            });
        }, function myError(response) {
            console.log(response);
        });

        return classifiedImages;
    };
}