(function () {
    'use strict';
    angular.module('settings', ['ngMaterial'])
        .component('settings', {
            templateUrl: '/frontend/components/settings/settings.html',
            controller: function ($mdDialog, $rootScope, networkDataService) {
                this.$onInit = function () {

                };
            }
        });
})();