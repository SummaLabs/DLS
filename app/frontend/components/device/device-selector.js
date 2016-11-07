'use strict';

angular.module('deviceSelector', ['ngMaterial'])
    .directive('deviceSelector', function () {
        return {
            scope: {
                selectedDevice:'=ngModel'
            },
            templateUrl: '/frontend/components/device/device-selector.html',
            controller: function ($scope, deviceService) {
                this.$onInit = function () {
                    deviceService.getAvailableDevices().then(
                        function successCallback(response) {
                            $scope.deviceList = response.data;
                            if ($scope.deviceList.length > 0) {
                                $scope.selectedDevice = $scope.deviceList[0];
                            }
                        },
                        function errorCallback(response) {
                            console.log(response.data);
                        }
                    );
                };

                $scope.getDeviceName = function (device) {
                    var deviceName;
                    if (device.type == 'cpu') {
                        deviceName = "CPU: ";
                    } else if (device.type == 'gpu') {
                        deviceName = "GPU: ";
                    }
                    if (!device.isAvalible) {
                        return deviceName += "Not Available";
                    }
                    
                    device.isbusy ? deviceName += "Is Busy": deviceName += device.name;
                    
                    return deviceName;
                };
            }
        }
    });