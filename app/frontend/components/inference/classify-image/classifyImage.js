(function () {
    'use strict';

    angular.module('classifyImage', ['ngMaterial'])
        .directive('classifyImage', function () {
            return {
                scope: {
                    imagesPath: '@'
                },
                templateUrl: '/frontend/components/inference/classify-image/classify-image.html',
                controller: function ($scope, imageService, $timeout) {
                    var self = this;
                    this.$onInit = function () {
                        var imagesPath = $scope.imagesPath;
                        $scope.images = [];
                        $timeout(function () {
                            $scope.images = imageService.classifyImages(imagesPath);
                        }, 8000);

                    };
                }
            }
        });
})();