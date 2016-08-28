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
                this.createDialog = function ($event) {
                    $mdDialog.show({
                        clickOutsideToClose: true,
                        parent: parentEl,
                        targetEvent: $event,
                        templateUrl: "/frontend/components/inference/apply-model-menu/apply-model-dialog.html",
                        locals: {},
                        controller: function ($scope, $mdDialog) {
                            $scope.closeDialog = function () {
                                $mdDialog.hide();
                            }
                        }
                    });
                };
            }
        });

})();