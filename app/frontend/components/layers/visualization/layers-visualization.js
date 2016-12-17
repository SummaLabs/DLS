'use strict';
angular.module('layersVisualization', ['ngMaterial'])
    .component('layersVisualization', {
        templateUrl: '/frontend/components/layers/visualization/layers-visualization.html',
        bindings: {
            layers: "<"
        },
        controller: function ($mdDialog, modelService) {
            var self = this;
            this.$onInit = function () {
                self.layers = [
                    {
                        name: "DataInput_1",
                        type: "datainput",
                        shape: "3x256x256",
                        previewPath: "/frontend/components/layers/visualization/filter.jpg"
                    },
                    {
                        name: "Convolution2D_1",
                        type: "convolution2D",
                        shape: "3x256x256",
                        previewPath: "/frontend/components/layers/visualization/filter.jpg"
                    },
                    {
                        name: "Convolution2D_3",
                        type: "convolution2D",
                        shape: "3x256x256",
                        previewPath: "/frontend/components/layers/visualization/filter.jpg"
                    },
                    {
                        name: "Convolution2D_4",
                        type: "convolution2D",
                        shape: "3x256x256",
                        previewPath: "/frontend/components/layers/visualization/filter.jpg"
                    }
                ];

                modelService.loadLayersVisualization().then(
                    function successCallback(response) {
                        self.layers = response.data;
                    },
                    function errorCallback(response) {
                        console.log(response.data);
                    })
            };
            
            this.zoomFilterImage = function($event, filterImagePath) {
                var parentEl = angular.element(document.body);
                $mdDialog.show({
                    templateUrl: '/frontend/components/layers/visualization/layers-visualization-dialog.html',
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