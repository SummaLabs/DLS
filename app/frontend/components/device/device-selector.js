'use strict';
angular.module('deviceSelector', ['ngMaterial'])
    .component('deviceSelector', {
        templateUrl: '/frontend/components/device/device-selector.html',
         bindings: {
             deviceList:        '<',
             selectedDevice:    '<'
        },
        controller: function ($scope, $mdDialog, deviceService) {
            var self = this;
            this.$onInit = function () {
                deviceService.getAvailableDevices().then(
                    function successCallback(response) {
                        // var tret = response.data;
                        // var tmp = [];
                        // for(var kk in tret) {
                        //     tmp.push(tret[kk]);
                        // }
                        self.deviceList = response.data;
                        console.log(self.deviceList);
                        if(self.deviceList.length>0) {
                            self.selectedDevice = self.deviceList[0];
                        }
                    },
                    function errorCallback(response) {
                        console.log(response.data);
                    }
                );
            };
        }
    });