'use strict';

angular.module('visualizeFilters', ['ngMaterial'])
    .component('visualizeFilters', {
        templateUrl: '/frontend/components/classification/image-2d/model/visualization/visualize-filters.html',
        bindings: {
            layers: "<"
        },
        controller: function ($mdDialog) {
            this.$onInit = function () {
                this.layers = [
                    {
                        name: "DataInput_1",
                        type: "datainput",
                        shape: "3x256x256",
                        previewPath: "/frontend/components/classification/image-2d/model/visualization/filter.jpg"
                    },
                    {
                        name: "Convolution2D_1",
                        type: "convolution2D",
                        shape: "3x256x256",
                        previewPath: "/frontend/components/classification/image-2d/model/visualization/filter.jpg"
                    },
                    {
                        name: "Convolution2D_3",
                        type: "convolution2D",
                        shape: "3x256x256",
                        previewPath: "/frontend/components/classification/image-2d/model/visualization/filter.jpg"
                    },
                    {
                        name: "Convolution2D_4",
                        type: "convolution2D",
                        shape: "3x256x256",
                        previewPath: "/frontend/components/classification/image-2d/model/visualization/filter.jpg"
                    }
                ]
            };
            
            this.zoomFilterImage = function($event, filterImagePath) {
                var parentEl = angular.element(document.body);
                $mdDialog.show({
                    templateUrl: '/frontend/components/classification/image-2d/model/visualization/zoom-filters-dialog.html',
                    parent: parentEl,
                    locals: {
                    },
                    bindToController: true,
                    clickOutsideToClose: true,
                    controller: DialogController
                });
                
                function DialogController($scope, $mdDialog) {
                        $scope.filterImagePath = filterImagePath;

                        $scope.closeDialog = function () {
                            $mdDialog.hide();
                        }
                    }

            };
        }
    });