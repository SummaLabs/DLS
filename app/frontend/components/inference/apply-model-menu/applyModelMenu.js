(function () {
    'use strict';

    angular.module('applyModelMenu', ['ngMaterial'])
        .component('applyModelMenu', {
            templateUrl: '/frontend/components/inference/apply-model-menu/apply-model-menu.html',
            controller: function ($mdDialog) {

                var originatorEv;
                this.openMenu = function ($mdOpenMenu, ev) {
                    originatorEv = ev;
                    $mdOpenMenu(ev);
                };

                var parentEl = angular.element(document.body);
                this.createImagesDialog = function ($event) {
                    $mdDialog.show({
                        clickOutsideToClose: true,
                        parent: parentEl,
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