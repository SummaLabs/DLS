(function () {
    'use strict';

    angular.module('classifyImage', ['ngMaterial'])
        .component('classifyImage', {
            templateUrl: '/frontend/components/inference/classify-image/classify-image.html',
            bindings: {
                images: '<'
            },
            controller: function () {
                this.$onInit = function () {
                    var imagePath = '/frontend/assets/img/layers/dense.png';
                    this.images = [
                        {
                            path: imagePath,
                            classProbabilities: [
                                {name: 'Class 1', value: '90%'},
                                {name: 'Class 2', value: '90%'},
                                {name: 'Class 3', value: '90%'},
                                {name: 'Class 4', value: '90%'},
                                {name: 'Class 5', value: '90%'},
                                {name: 'Class 6', value: '90%'},
                                {name: 'Class 7', value: '90%'},
                                {name: 'Class 8', value: '90%'},
                                {name: 'Class 9', value: '90%'},
                                {name: 'Class 10', value: '90%'}
                            ]
                        },
                        {
                            path: imagePath,
                            classProbabilities: [
                                {name: 'Class 1', value: '90%'},
                                {name: 'Class 2', value: '90%'},
                                {name: 'Class 3', value: '90%'},
                                {name: 'Class 4', value: '90%'},
                                {name: 'Class 5', value: '90%'},
                                {name: 'Class 6', value: '90%'},
                                {name: 'Class 7', value: '90%'},
                                {name: 'Class 8', value: '90%'},
                                {name: 'Class 9', value: '90%'},
                                {name: 'Class 10', value: '90%'}
                            ]
                        },
                        {
                            path: imagePath,
                            classProbabilities: [
                                 {name: 'Class 1', value: '90%'},
                                {name: 'Class 2', value: '90%'},
                                {name: 'Class 3', value: '90%'},
                                {name: 'Class 4', value: '90%'},
                                {name: 'Class 5', value: '90%'},
                                {name: 'Class 6', value: '90%'},
                                {name: 'Class 7', value: '90%'},
                                {name: 'Class 8', value: '90%'},
                                {name: 'Class 9', value: '90%'},
                                {name: 'Class 10', value: '90%'}
                            ]
                        },
                        {
                            path: imagePath,
                            classProbabilities: [
                                {name: 'Class 1', value: '90%'},
                                {name: 'Class 2', value: '90%'},
                                {name: 'Class 3', value: '90%'},
                                {name: 'Class 4', value: '90%'},
                                {name: 'Class 5', value: '90%'},
                                {name: 'Class 6', value: '90%'},
                                {name: 'Class 7', value: '90%'},
                                {name: 'Class 8', value: '90%'},
                                {name: 'Class 9', value: '90%'},
                                {name: 'Class 10', value: '90%'}
                            ]
                        },
                        {
                            path: imagePath,
                            classProbabilities: [
                                {name: 'Class 1', value: '90%'},
                                {name: 'Class 2', value: '90%'},
                                {name: 'Class 3', value: '90%'},
                                {name: 'Class 4', value: '90%'},
                                {name: 'Class 5', value: '90%'},
                                {name: 'Class 6', value: '90%'},
                                {name: 'Class 7', value: '90%'},
                                {name: 'Class 8', value: '90%'},
                                {name: 'Class 9', value: '90%'},
                                {name: 'Class 10', value: '90%'}
                            ]
                        }
                    ];
                };
            }
        });
})();