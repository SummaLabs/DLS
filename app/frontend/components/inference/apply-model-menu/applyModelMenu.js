(function () {
    'use strict';

    angular.module('applyModelMenu', ['ngMaterial'])
        .component('applyModelMenu', {
            templateUrl: '/frontend/components/inference/apply-model-menu/apply-model-menu.html',
            controller: function ($mdDialog, appConfig) {
                var self = this;

                var originatorEv;
                this.openMenu = function ($mdOpenMenu, ev) {
                    originatorEv = ev;
                    $mdOpenMenu(ev);
                };
                
                this.createChoseImagesDialog = function(event) {
                    appConfig.fileManager.pickFile = true;
                    appConfig.fileManager.pickFolder = false;
                    appConfig.fileManager.singleSelection = false;
                	$mdDialog.show({
						templateUrl: 'frontend/components/dialog/file-manager.html',
						parent: angular.element(document.body),
						targetEvent: event,
						clickOutsideToClose:false,
                        controller: function ($scope, $mdDialog, $rootScope) {

                            $scope.select = function (answer) {
                                $mdDialog.hide(answer);

                                var imagePath = [];
                                $rootScope.selectedFiles.forEach(function (item) {
                                    var path = "";
                                    item.model.path.forEach(function (folder) {
                                        path += folder + "/";
                                    });
                                    path += item.model.name;
                                    imagePath.push(path);
                                });

                                self.createImagesDialog(event);

                            };

                            $scope.cancel = function () {
                                $mdDialog.cancel();
                            };
                        }
					});
                };

                this.createImagesDialog = function ($event) {
                    $mdDialog.show({
                        clickOutsideToClose: true,
                        parent: angular.element(document.body),
                        targetEvent: $event,
                        templateUrl: "/frontend/components/inference/apply-model-menu/apply-model-dialog-images.html",
                        locals: {},
                        controller: function ($scope, $mdDialog, $window, imageService) {
                            $scope.closeDialog = function () {
                                $mdDialog.hide();
                            };

                            var future = imageService.loadClassifiedImagesAsJsonFile();
                            future.then(function mySucces(response) {
                                var data = response.data;
                                var blob = new Blob([data], {type: 'text/plain'});
                                var url = $window.URL || $window.webkitURL;
                                $scope.fileUrl = url.createObjectURL(blob);
                            }, function myError(response) {
                            });
                        }
                    });
                };
                
                this.createDataSetDialog = function ($event) {
                    $mdDialog.show({
                        clickOutsideToClose: true,
                        parent: parentEl,
                        targetEvent: $event,
                        templateUrl: "/frontend/components/inference/apply-model-menu/apply-model-dialog-dataset.html",
                        locals: {},
                        controller: function ($scope, $mdDialog) {
                            $scope.closeDialog = function () {
                                $mdDialog.hide();
                            };
                        }
                    });
                };
            }
        });

})();