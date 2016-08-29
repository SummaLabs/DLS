(function () {
    'use strict';

    angular.module('classifyImage', ['ngMaterial'])
        .component('classifyImage', {
            templateUrl: '/frontend/components/inference/classify-image/classify-image.html',
            bindings: {
                images: '<'
            },
            controller: function (imageService) {
                this.$onInit = function () {
                    this.images = imageService.loadClassifiedImages();
                };
            }
        });
})();