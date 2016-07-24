(function () {
    'use strict';
    
    angular.module('mainMenu', ['ngMaterial'])
        .config(function($mdIconProvider) {
            $mdIconProvider
                .icon("call", '/frontend/assets/icon/svg/ic_menu_black_48px.svg', 48);
        })
        .component('mainMenu', {
            templateUrl: '/frontend/components/main-menu/main-menu.html',
            controller: function ($mdDialog) {
                var originatorEv;
                this.openMenu = function($mdOpenMenu, ev) {
                    originatorEv = ev;
                    $mdOpenMenu(ev);
                };

                this.createDialog = function() {
                    $mdDialog.show(
                        $mdDialog.alert()
                            .targetEvent(originatorEv)
                            .clickOutsideToClose(true)
                            .parent('body')
                            .title('Create new project')
                            .textContent('To create new project push create button')
                            .ok('Create')
                    );
                    originatorEv = null;
                };

            }
        });
    
})();