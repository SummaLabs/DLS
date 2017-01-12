(function () {
    'use strict';
    angular.module('environment', ['ngMaterial'])
        .component('environment', {
            templateUrl: '/frontend/components/main/environment/environment.html',
            controller: function ($mdDialog, $rootScope, $scope, $http) {
                this.$onInit = function () {
                     $http({
                        method: "GET",
                        url: "/environment/check"
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