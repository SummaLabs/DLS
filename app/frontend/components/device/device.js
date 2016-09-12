(function () {
    'use strict';
    angular.module('device', ['ngMaterial'])
        .component('device', {
            templateUrl: '/frontend/components/device/device.html',
            controller: function ($mdDialog, $rootScope, deviceService) {
                this.$onInit = function () {
                    this.deviceInfo = deviceService.loadDeviceInfo();
                    console.log(this.deviceInfo);
                };
            }
        });
})();