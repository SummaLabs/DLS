(function () {
    'use strict';
    angular.module('env', ['ngMaterial'])
        .component('env', {
            templateUrl: '/frontend/components/device/env.html',
            controller: function ($mdDialog, $rootScope, deviceService, $scope, $http) {
                this.$onInit = function () {
                     $http({
                        method: "GET",
                        url: "/device/checkenv",
                    }).then(function mySucces(response) {
                        console.log(response.data);
                        $scope.env = response.data;
                    }, function myError(response) {
                        console.log(response);
                    });
                }
            }
                
          });
})();