angular.module('imageService', [])
    .service('imageService', ['$http', ImageService]);

function ImageService($http) {
    var classifiedImages = [];

    this.loadClassifiedImages = function() {
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