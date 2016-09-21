(function () {
    'use strict';
    angular.module('task', ['ngMaterial'])
        .component('task', {
            templateUrl: '/frontend/components/task/task.html',
            controller: function ($mdDialog, $rootScope, $scope) {
                this.$onInit = function () {
                    
                };
            }
        });
})();