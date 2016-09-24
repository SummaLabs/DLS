(function () {
    'use strict';

    angular.module('classifyImage', ['ngMaterial'])
        .directive('classifyImage', function () {
            return {
                scope: {
                    modelId: '@',
                    images: '<',
                    state: '<',
                    fileUrl: '<'
                },
                templateUrl: '/frontend/components/inference/classify-image/classify-image.html',
                controller: function ($scope, $mdDialog, appConfig, imageService) {
                    var self = this;

                    const state = {
                        INIT: 'INIT',
                        LOADING: 'LOADING',
                        LOADED: 'LOADED'
                    };

                    this.$onInit = function () {
                        $scope.state = state.INIT;
                        $scope.images = [];
                        $scope.fileUrl = '';
                    };

                    $scope.choseImages = function (event) {
                        appConfig.fileManager.pickFile = true;
                        appConfig.fileManager.pickFolder = false;
                        appConfig.fileManager.singleSelection = false;
                        $mdDialog.show({
                            templateUrl: 'frontend/components/dialog/file-manager.html',
                            parent: angular.element(document.body),
                            targetEvent: event,
                            clickOutsideToClose: false,
                            controller: function (scope, $mdDialog, $rootScope, $window) {

                                scope.select = function (answer) {
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

                                    if (concatImagesPath) {
                                        $scope.state = state.LOADING;
                                        $scope.images.length = 0;
                                        var future = imageService.classifyImages(concatImagesPath, $scope.modelId);
                                        future.then(function mySucces(response) {

                                            var images = showNClasses(response.data.images, 6   );
                                            images.forEach(function (image) {
                                                $scope.images.push(image);
                                            });

                                            //build reference to download
                                            var csv = buildCSV(response.data);
                                            var blob = new Blob([csv], {type: 'text/plain'});
                                            var url = $window.URL || $window.webkitURL;
                                            $scope.fileUrl = url.createObjectURL(blob);

                                            $scope.state = state.LOADED;
                                        }, function myError(response) {
                                            console.log(response);
                                        });
                                    } else {
                                        choseImageAlert();
                                    }
                                };

                                function choseImageAlert() {
                                    $mdDialog.show(
                                        $mdDialog.alert()
                                            .parent(angular.element(document.body))
                                            .title('Image Chooser')
                                            .textContent('Please, choose some image!')
                                            .ariaLabel('Image Chooser')
                                            .ok('OK')
                                    );
                                }

                                scope.cancel = function () {
                                    $mdDialog.cancel();
                                };
                            }
                        });
                    };

                    function showNClasses(images, classesNumber) {
                        var imagesToShow = [];
                        images.forEach(function(image) {
                            var imageToShow = {};
                            imageToShow['path'] = image['path'];
                            imageToShow['content'] = image['content'];
                            var classProbabilities = [];
                            var i = 0;
                            image['classProbabilities'].forEach(function(classProb) {
                                if (i < classesNumber) {
                                    classProbabilities.push(classProb)
                                }
                                i++;
                            });
                            imageToShow['classProbabilities'] = classProbabilities;
                            imagesToShow.push(imageToShow);
                        });

                        return imagesToShow;
                    }

                    function buildCSV(data) {
                        //csv header
                        var csv = "path,";
                        var i = 0;
                        data.classes.forEach(function (className) {
                            csv += className;
                            if (i < data.classes.length - 1) {
                                csv += ",";
                            } else {
                                csv += '\n';
                            }
                            i++;
                        });
                        //csv content
                        data.images.forEach(function (image) {
                            csv += image.path + ',';
                            i = 0;
                            data.classes.forEach(function (className) {
                                image.classProbabilities.forEach(function (classProb) {
                                    if (classProb.name == className) {
                                        csv += classProb.value;
                                        if (i < data.classes.length - 1) {
                                            csv += ",";
                                        }
                                        i++;
                                    }
                                })
                            });
                            csv += '\n';
                        });

                        return csv;
                    }
                }
            }
        });
})();