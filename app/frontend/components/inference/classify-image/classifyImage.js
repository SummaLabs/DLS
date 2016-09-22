(function () {
    'use strict';

    angular.module('classifyImage', ['ngMaterial'])
        .component('classifyImage', {
            templateUrl: '/frontend/components/inference/classify-image/classify-image.html',
            bindings: {
                images: '<',
                state: '<',
                fileUrl: '<'
            },
            controller: function ($mdDialog, appConfig, imageService) {
                var self = this;
                
                const state = {
                    INIT: 'INIT',
                    LOADING: 'LOADING',
                    LOADED: 'LOADED'
                };

                this.$onInit = function () {
                    self.state = state.INIT;
                    self.images = [];
                    self.fileUrl = '';
                };

                this.choseImages = function(event) {
                    appConfig.fileManager.pickFile = true;
                    appConfig.fileManager.pickFolder = false;
                    appConfig.fileManager.singleSelection = false;
                	$mdDialog.show({
						templateUrl: 'frontend/components/dialog/file-manager.html',
						parent: angular.element(document.body),
						targetEvent: event,
						clickOutsideToClose:false,
                        controller: function ($scope, $mdDialog, $rootScope, $window) {

                            $scope.select = function (answer) {
                                $mdDialog.hide(answer);

                                var imagesPath = [];
                                $rootScope.selectedFiles.forEach(function (item) {
                                    var path = "";
                                    item.model.path.forEach(function (folder) {
                                        path += folder + "/";
                                    });
                                    path += item.model.name;
                                    imagesPath.push(path);
                                });

                                var concatImagesPath = "";
                                for (var i = 0; i < imagesPath.length; i++) {
                                    concatImagesPath = concatImagesPath.concat(imagesPath[i]);
                                    if (i < imagesPath.length - 1) {
                                        concatImagesPath = concatImagesPath.concat(";");
                                    }
                                }

                                self.state = state.LOADING;

                                var future = imageService.classifyImages(concatImagesPath);
                                future.then(function mySucces(response) {
                                    response.data.forEach(function (image) {
                                        self.images.push(image);
                                    });
                                    self.state = state.LOADED;
                                }, function myError(response) {
                                    console.log(response);
                                });

                                future = imageService.loadClassifiedImagesAsJsonFile();
                                future.then(function mySucces(response) {
                                    var data = response.data;
                                    var blob = new Blob([data], {type: 'text/plain'});
                                    var url = $window.URL || $window.webkitURL;
                                    self.fileUrl = url.createObjectURL(blob);
                                }, function myError(response) {
                                });
                            };

                            $scope.cancel = function () {
                                $mdDialog.cancel();
                            };
                        }
					});
                };

            }
        });
})();