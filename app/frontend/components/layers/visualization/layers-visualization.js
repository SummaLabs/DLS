'use strict';
angular.module('layersVisualization', ['ngMaterial'])
    .component('layersVisualization', {
        templateUrl: '/frontend/components/layers/visualization/layers-visualization.html',
        bindings: {
            model: '<'
        },
        controller: function ($scope, $mdDialog, modelService, appConfig) {
            var self = this;


            this.$onInit = function () {
                self.layers = [];
                update(self.model);
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

            $scope.$on('model-main:update-model', function (event, model) {
                update(model);
            });
            function update(model) {
                var loadImageUrl = appConfig.util.loadImageUrl;
                modelService.loadLayersVisualization(model.id).then(
                    function successCallback(response) {
                        self.layers.length = 0;
                        response.data.forEach(function (item) {
                            self.layers.push({
                                name: item.layerName,
                                type: item.layerType,
                                shape: item.layerShape,
                                previewPath: loadImageUrl + item.previewPath
                            });
                        });

                    },
                    function errorCallback(response) {
                        console.log(response.data);
                    }
                );
            }
        }
    });