(function () {
    'use strict';

    angular.module('classifyImage', ['ngMaterial'])
        .component('classifyImage', {
            templateUrl: '/frontend/components/inference/classify-image/classify-image.html',
            bindings: {
                images: '<'
            },
            controller: function (imageService, $timeout) {
                var self = this;
                this.$onInit = function () {
                    this.images = [];
                    $timeout(function () {
                        self.images = imageService.loadClassifiedImages(3);
                    }, 8000);

                };
            }
        });
})();